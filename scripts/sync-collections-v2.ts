import { readdir, readFile, writeFile, mkdir, cp, stat, rm } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join, dirname, extname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT  = join(__dirname, '../src/vault-content');                 // submodule root
const SRC_FROM    = join(VAULT_ROOT, '300-collections');                     // source collections
const CONTENT_DST = join(__dirname, '../src/content/300-collections');       // mirror for non-aggregated
const CACHE_FILE  = join(__dirname, '../.sync-cache.json');

// Frontmatter fields that may contain paths to images
const LINKISH_FIELDS = ['image', 'images', 'file', 'book_notes_record', 'record'];

const isHidden = (n: string) => n.startsWith('.');
const isMd = (p: string) => /\.md$/i.test(p);
const isHttp   = (s: string) => /^https?:\/\//i.test(s);
const isImg = (p: string) =>
  /\.(png|jpe?g|gif|webp|svg|avif|heic)$/i.test(p);

type FileEntry = { abs: string; rel: string };

const loadCache = () => (existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {});
const saveCache = (c: any) => writeFile(CACHE_FILE, JSON.stringify(c, null, 2));

async function walk(dir: string, base: string, out: FileEntry[] = []) {
  if (!existsSync(dir)) return out;
  const ents = await readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    if (isHidden(e.name)) continue;
    const abs = join(dir, e.name);
    const rel = relative(base, abs);
    if (e.isDirectory()) await walk(abs, base, out);
    else out.push({ abs, rel });
  }
  return out;
}

async function ensureDir(p: string) { await mkdir(dirname(p), { recursive: true }); }

// Return frontmatter-usable relative path if exists, otherwise keep as-is
function astroRelativePath({
  mdFileAbs,
  value,
}: {
  mdFileAbs: string;
  value: string;
}): string {
  if (typeof value !== "string" || !value) return value;
  if (isHttp(value)) return value;

  // Try relative to markdown file
  const relCandidate = resolve(dirname(mdFileAbs), value);
  if (existsSync(relCandidate)) {
    // Relative path from mdFileAbs to image
    // Make sure it's './foo.png' or './images/bar.png'
    let relPath = relative(dirname(mdFileAbs), relCandidate).replace(/\\/g, "/");
    if (!relPath.startsWith(".")) relPath = "./" + relPath;
    return relPath;
  }
  // Not found: leave as-is so you can debug/fix later
  return value;
}

async function mirrorCollection(collection: string) {
  const srcDir = join(SRC_FROM, collection);
  const dstDir = join(CONTENT_DST, collection);

  await mkdir(dstDir, { recursive: true });

  const cache = loadCache();
  const srcFiles = await walk(srcDir, srcDir);
  const dstFiles = existsSync(dstDir) ? await walk(dstDir, dstDir) : [];
  const srcSet = new Set(srcFiles.map((f) => f.rel));
  let copied = 0;

  // copy/update
  for (const { abs, rel } of srcFiles) {
    const s = await stat(abs);
    const key = `mir:${collection}/${rel}`;
    const dstAbs = join(dstDir, rel);

    if (cache[key] === s.mtimeMs && existsSync(dstAbs)) continue;

    await ensureDir(dstAbs);

    if (isMd(abs)) {
      // process Markdown: rewrite image fields to absolute Astro path
      console.log(`Processing markdown: ${abs}`);
      let raw = await readFile(abs, "utf8");
      let fm = matter(raw);
      let changed = false;

      for (const k of LINKISH_FIELDS) {
        if (fm.data[k] !== undefined) {
          const rewrite = (v: string | null | undefined) =>
            typeof v === 'string' && v
              ? astroRelativePath({ mdFileAbs: abs, value: v })
              : v;
          if (Array.isArray(fm.data[k])) {
            const newArr = fm.data[k].map((v: string) => rewrite(v));
            if (JSON.stringify(newArr) !== JSON.stringify(fm.data[k]))
              changed = true;
            fm.data[k] = newArr;
          } else {
            const newVal = rewrite(fm.data[k]);
            if (newVal !== fm.data[k]) changed = true;
            fm.data[k] = newVal;
          }
        }
      }
      // If changed, rewrite the Markdown file for destination
      
      if (changed) {
        raw = matter.stringify(fm.content, fm.data);
      }
      await writeFile(dstAbs, raw, "utf8");
    } else {
      // copy other file (images, etc)
      console.log(`Copying asset: ${abs}`);
      await cp(abs, dstAbs, { force: true });
    }
    cache[key] = s.mtimeMs;
    copied++;
  }

  // deletions
  let removed = 0;
  for (const { rel } of dstFiles) {
    if (!srcSet.has(rel)) {
      await rm(join(dstDir, rel), { force: true });
      removed++;
    }
  }

  await saveCache(cache);
  console.log(`Mirrored ${collection}: +${copied} / -${removed}`);
}

async function main() {
  if (!existsSync(SRC_FROM)) {
    console.log("No 300-collections present; skipping.");
    return;
  }
  await mkdir(CONTENT_DST, { recursive: true });

  // discover top-level collections
  const tops = (await readdir(SRC_FROM, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !isHidden(d.name))
    .map((d) => d.name);

  for (const coll of tops) {
    console.log(`Processing collection: ${coll}`);
    await mirrorCollection(coll);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
