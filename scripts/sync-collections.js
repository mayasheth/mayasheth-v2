// Hybrid sync for Obsidian → Astro
// - Aggregated collections (gratitudes, quotes):
//     • Parse frontmatter ONLY → write src/data/<collection>.json (parse ALL files every run)
//     • Copy all images for that collection to /public/collections/300-collections/<collection>/...
//     • Rewrite image-like frontmatter fields to those /public URLs
// - All other collections: mirror markdown + assets to src/content/300-collections/<collection>/...
//
// Run via:  git submodule update --init --remote && npm run sync

import { readdir, readFile, writeFile, mkdir, stat, cp, rm } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join, dirname, relative, resolve, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT  = join(__dirname, '../src/vault-content');                 // submodule root
const SRC_FROM    = join(VAULT_ROOT, '300-collections');                      // source collections
const CONTENT_DST = join(__dirname, '../src/content/300-collections');       // mirror for non-aggregated
const DATA_DST    = join(__dirname, '../src/data');                           // aggregated JSON
const PUBLIC_DST  = join(__dirname, '../public/collections/300-collections'); // public images for aggregated
const CACHE_FILE  = join(__dirname, '../.sync-cache.json');

// Collections to aggregate (JSON only)
const AGGREGATE_COLLECTIONS = ['gratitudes', 'quotes'];

// Frontmatter fields that may contain paths to images
const LINKISH_FIELDS = ['image', 'images', 'banner', 'cover', 'thumbnail', 'hero', 'gallery'];

const isHidden = (n) => n.startsWith('.');
const isMd     = (p) => /\.md$/i.test(p);
const isImg    = (p) => /\.(png|jpe?g|gif|webp|svg|avif|heic)$/i.test(p);
const isHttp   = (s) => /^https?:\/\//i.test(s);
const isAbs    = (s) => s.startsWith('/');

const loadCache = () => (existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {});
const saveCache = (c) => writeFile(CACHE_FILE, JSON.stringify(c, null, 2));

async function walk(dir, base, out = []) {
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

async function ensureDir(p) { await mkdir(dirname(p), { recursive: true }); }

// ---- /public helpers (aggregated images) ----
async function copyToPublic(absSrc, collectionName) {
  const relWithinCollection = relative(join(SRC_FROM, collectionName), absSrc).replace(/\\/g, '/');
  const dstAbs = join(PUBLIC_DST, collectionName, relWithinCollection);
  await ensureDir(dstAbs);
  await cp(absSrc, dstAbs, { force: true });
  return `/collections/300-collections/${collectionName}/${relWithinCollection}`;
}

async function copyCollectionImagesPublic(collection) {
  const srcDir = join(SRC_FROM, collection);
  const files = await walk(srcDir, srcDir);
  let copied = 0;
  for (const { abs } of files) {
    if (!isImg(abs)) continue;
    await copyToPublic(abs, collection);
    copied++;
  }
  return copied;
}

// Rewrite frontmatter fields that may contain relative image paths (aggregated only)
async function rewriteFmValue(fromFileAbs, value, collectionName) {
  const transform = async (v) => {
    if (typeof v !== 'string') return v;
    if (isHttp(v) || isAbs(v)) return v;
    const abs = resolve(dirname(fromFileAbs), v);
    if (!abs.startsWith(SRC_FROM) || !isImg(abs)) return v;
    return copyToPublic(abs, collectionName);
  };
  if (Array.isArray(value)) {
    const out = [];
    for (const x of value) out.push(await transform(x));
    return out;
  } else {
    return await transform(value);
  }
}

// ---------- aggregation path (gratitudes/quotes) ----------
async function aggregateCollection(collection) {
  const srcDir  = join(SRC_FROM, collection);
  const jsonOut = join(DATA_DST, `${collection}.json`);

  // Gather ALL md files every run to avoid empty JSON on "no changes"
  const files = (await walk(srcDir, srcDir)).filter(({ abs }) => isMd(abs));

  if (files.length === 0) {
    // No files at all → write empty array (or skip writing, your choice)
    await ensureDir(jsonOut);
    await writeFile(jsonOut, '[]\n', 'utf8');
    console.log(`📦 aggregated ${collection}: 0 items (no .md files found) → ${jsonOut}`);
    return;
  }

  const items = [];
  for (const { abs, rel } of files) {
    const raw = await readFile(abs, 'utf8');
    const fm  = matter(raw);

    // Keep ALL frontmatter keys
    const data = { ...fm.data };

    // Skip unpublished explicitly set to false
    if (data.publish === false) continue;

    // filename → slug (index/readme → parent folder)
    const name = basename(rel, extname(rel));
    const slug = /^(index|readme)$/i.test(name) ? basename(dirname(rel)) || name : name;

    // Rewrite image-like fields to /public URLs
    for (const k of LINKISH_FIELDS) {
      if (data[k] !== undefined) {
        data[k] = await rewriteFmValue(abs, data[k], collection);
      }
    }

    items.push({
      id: rel.replace(/\\/g, '/'),
      slug,
      collection,
      ...data
    });
  }

  // Copy ALL images for the aggregated collection to /public (idempotent)
  const imgCount = await copyCollectionImagesPublic(collection);

  // Sort newest first by created then last_modified if present
  items.sort((a, b) =>
    String(b.created ?? '').localeCompare(String(a.created ?? '')) ||
    String(b.last_modified ?? '').localeCompare(String(a.last_modified ?? ''))
  );

  await ensureDir(jsonOut);
  await writeFile(jsonOut, JSON.stringify(items, null, 2) + '\n', 'utf8');
  console.log(`📦 aggregated ${collection}: ${items.length} items → ${jsonOut} (images copied: ${imgCount})`);
}

// ---------- mirror path (all other collections) ----------
async function mirrorCollection(collection) {
  const srcDir = join(SRC_FROM, collection);
  const dstDir = join(CONTENT_DST, collection);

  await mkdir(dstDir, { recursive: true });

  const cache    = loadCache();
  const srcFiles = await walk(srcDir, srcDir);
  const dstFiles = existsSync(dstDir) ? await walk(dstDir, dstDir) : [];

  const srcSet = new Set(srcFiles.map(f => f.rel));

  // copy/update
  let copied = 0;
  for (const { abs, rel } of srcFiles) {
    const s     = await stat(abs);
    const key   = `mir:${collection}/${rel}`;
    const dstAbs= join(dstDir, rel);

    if (cache[key] === s.mtimeMs && existsSync(dstAbs)) continue;

    await ensureDir(dstAbs);
    await cp(abs, dstAbs, { force: true });
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
  console.log(`🪄 mirrored ${collection}: +${copied} / -${removed}`);
}

async function main() {
  if (!existsSync(SRC_FROM)) {
    console.log('ℹ️  No 300-collections present; skipping.');
    return;
  }
  await mkdir(DATA_DST,    { recursive: true });
  await mkdir(PUBLIC_DST,  { recursive: true });
  await mkdir(CONTENT_DST, { recursive: true });

  // discover top-level collections
  const tops = (await readdir(SRC_FROM, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !isHidden(d.name))
    .map(d => d.name);

  for (const coll of tops) {
    if (AGGREGATE_COLLECTIONS.includes(coll)) {
      await aggregateCollection(coll);
    } else {
      await mirrorCollection(coll);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
