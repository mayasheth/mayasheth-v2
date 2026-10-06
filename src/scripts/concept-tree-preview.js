// Builds a local HTML preview of the /concepts tree from the vault note
// 000-meta/concept-tree.md, using live page data (titles, link counts, dates)
// and tags from the vault. For iterating on names and organization before the
// real Astro component exists.
//
//   npm run preview:tree            build once and open in the browser
//   npm run preview:tree -- --watch rebuild whenever the tree note changes
//   npm run preview:tree -- --right "By why"   pick which section is the right tree (default: the last one)

import { readdir, readFile, writeFile } from "fs/promises";
import { watch } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { isItemParseable, parseConceptItems } from "../lib/helpers/concept-graph-helpers.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vaultPath = process.env.OBSIDIAN_VAULT_PATH?.replace(/^~/, process.env.HOME);
if (!vaultPath) {
  console.error("OBSIDIAN_VAULT_PATH is not set. Add it to .env (see lint:vault).");
  process.exit(1);
}
const TREE_NOTE = join(vaultPath, "000-meta/concept-tree.md");
const CONCEPTS_DIR = join(vaultPath, "300-collections/concepts");
const COLLECTIONS_DIR = join(vaultPath, "300-collections");
const OUT = join(tmpdir(), "concept-tree-preview.html");
const LEFT = "By subject";
const rightArg = process.argv.indexOf("--right");
const RIGHT = rightArg > -1 ? process.argv[rightArg + 1] : null;

// ---------- vault data ----------
async function loadPages() {
  const files = (await readdir(CONCEPTS_DIR)).filter((f) => f.endsWith(".md"));
  const ids = new Set(files.map((f) => f.slice(0, -3)));
  const pages = {};
  for (const f of files) {
    const id = f.slice(0, -3);
    const { data, content } = matter(await readFile(join(CONCEPTS_DIR, f), "utf8"));
    const items = parseConceptItems(id, content, data.tags ?? [], ids);
    const newest = items.map((i) => i.date).filter(Boolean).sort().at(-1) ?? "";
    const kind = isItemParseable(content) ? "l" : "n";
    pages[id] = [data.title ?? id, items.length, newest, kind, ...(data.publish ? [] : ["unpublished"])];
  }
  return pages;
}

const RATING_RE = /(all-time-influential|fantastic|good|okay|not-good)/;
async function loadTaggedNotes() {
  const byTag = {};
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "concepts" && !e.name.startsWith(".")) await walk(p);
        continue;
      }
      if (!e.name.endsWith(".md")) continue;
      const { data } = matter(await readFile(p, "utf8"));
      if (data.publish !== true) continue;
      const tags = [].concat(data.tags ?? []).filter((t) => typeof t === "string" && t.startsWith("concept/"));
      if (!tags.length) continue;
      const source = p.includes("/journal/") ? "musings" : "shelf";
      const rating = String([].concat(data.rating ?? "")[0] ?? "").match(RATING_RE)?.[1] ?? "";
      const author = [].concat(data.author ?? []).join(", ");
      const title = data.title ?? e.name.slice(0, -3);
      for (const t of tags) (byTag[t.slice("concept/".length)] ||= []).push([title, author, source, rating]);
    }
  };
  await walk(COLLECTIONS_DIR);
  return byTag;
}

// ---------- tree note parsing ----------
const FIELD_RE = /\[(\w+)::\s*([^\]]*)\]/g;
const LINK_RE = /^\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]$/;

function parseSection(markdown, heading) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start < 0) return null;
  const root = { kids: [], indent: -1 };
  const stack = [root];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    const m = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (!m) continue;
    const indent = m[1].replace(/\t/g, "    ").length;
    const fields = {};
    const text = m[2].replace(FIELD_RE, (_, k, v) => { fields[k] = v.trim(); return ""; }).trim();
    while (stack.at(-1).indent >= indent) stack.pop();
    const node = { text, fields, indent, kids: [] };
    stack.at(-1).kids.push(node);
    stack.push(node);
  }
  return root.kids;
}

// Converts parsed bullets to the shape the preview page expects:
// trunks {fr, en, spine, c, kids}, groups {l, fr, c, kids}, pages as ids, tags as {tag, l}.
function toData(nodes, depth, inherited, ctx, alsoAbove = false) {
  return nodes.map((n) => {
    // "also" marks a second, lighter placement; it applies to everything nested under it.
    const also = alsoAbove || !!n.fields.also;
    if (n.fields.site) {
      if (depth !== 1) ctx.problems.push(`${ctx.section}: the site link "${n.text}" should sit directly under a trunk.`);
      return { site: n.fields.site, l: n.text };
    }
    const link = n.text.match(LINK_RE);
    if (link) {
      const id = link[1].trim().split("/").at(-1);
      if (!ctx.pages[id]) ctx.problems.push(`${ctx.section}: [[${id}]] is not a concept page.`);
      if (n.fields.short) ctx.short[id] = n.fields.short;
      if (also) { ctx.also.push(`page:${id}`); return { id, also: true }; }
      ctx.seen.push(`page:${id}`);
      return id;
    }
    if (n.fields.tag) {
      const tag = n.fields.tag.replace(/^#?concept\//, "");
      if (!ctx.tagged[tag]) ctx.problems.push(`${ctx.section}: no published notes carry concept/${tag}.`);
      if (also) { ctx.also.push(`tag:${tag}`); return { tag, l: n.text || tag, also: true }; }
      ctx.seen.push(`tag:${tag}`);
      return { tag, l: n.text || tag };
    }
    if (!n.kids.some((k) => !k.fields.site)) { ctx.problems.push(`${ctx.section}: "${n.text}" has nothing under it.`); return null; }
    const c = n.fields.color || inherited;
    const all = toData(n.kids, depth + 1, c, ctx, also).filter(Boolean);
    const kids = all.filter((k) => !k.site);
    if (depth === 0) return { fr: n.text, en: n.fields.subtitle ?? "", spine: n.fields.spine ?? "", c: n.fields.color || "content-2", links: all.filter((k) => k.site), kids };
    return { l: n.text, fr: n.fields.note ?? "", c: c || "content-2", ...(n.fields.collapsed ? { collapsed: true } : {}), kids };
  }).filter(Boolean);
}

async function build() {
  const [note, pages, tagged] = await Promise.all([readFile(TREE_NOTE, "utf8"), loadPages(), loadTaggedNotes()]);
  const { content } = matter(note);
  const problems = [], short = {}, trees = {}, seenBy = {};
  const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const right = RIGHT ?? headings.filter((h) => h !== LEFT).at(-1) ?? "By why";
  const TREE_SECTIONS = { subject: LEFT, why: right };
  for (const [key, heading] of Object.entries(TREE_SECTIONS)) {
    const parsed = parseSection(content, heading);
    if (!parsed) { problems.push(`Missing the "## ${heading}" section.`); trees[key] = []; seenBy[key] = []; continue; }
    const ctx = { pages, tagged, problems, short, section: heading, seen: [], also: [] };
    trees[key] = toData(parsed, 0, null, ctx);
    seenBy[key] = ctx.seen;
    for (const a of ctx.also) if (!ctx.seen.includes(a)) problems.push(`${heading}: ${a.replace(/^page:(.*)$/, "[[$1]]").replace(/^tag:/, "concept/")} is marked "also" but has no main placement.`);
  }
  // Every page and tag should sit exactly once in each tree, and the two trees should hold the same set.
  const all = new Set([...Object.keys(pages).map((p) => `page:${p}`), ...Object.values(seenBy).flat()]);
  for (const [key, heading] of Object.entries(TREE_SECTIONS)) {
    const counts = {};
    seenBy[key].forEach((s) => counts[s] = (counts[s] ?? 0) + 1);
    for (const s of all) {
      const name = s.startsWith("page:") ? `[[${s.slice(5)}]]` : `concept/${s.slice(4)}`;
      if (!counts[s]) problems.push(`${heading}: ${name} is missing.`);
      else if (counts[s] > 1) problems.push(`${heading}: ${name} appears ${counts[s]} times.`);
    }
  }
  const usedTags = new Set(Object.values(seenBy).flat().filter((s) => s.startsWith("tag:")).map((s) => s.slice(4)));
  const T = Object.fromEntries([...usedTags].map((t) => [t, tagged[t] ?? []]));
  const data = {
    P: pages, T, SUBJECT: trees.subject, WHY: trees.why, SHORT: short, PROBLEMS: [...new Set(problems)],
    NAMES: { left: LEFT.toLowerCase(), right: right.toLowerCase() },
    BUILT: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };
  const template = await readFile(join(__dirname, "concept-tree-preview.html"), "utf8");
  const page = template.replace("/*__DATA__*/null", () => JSON.stringify(data));
  await writeFile(OUT, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style></head><body>${page}</body></html>`);
  console.log(`Built ${OUT}${data.PROBLEMS.length ? ` with ${data.PROBLEMS.length} problem(s):\n  - ${data.PROBLEMS.join("\n  - ")}` : ""}`);
}

await build();
execFile("open", [OUT]);
if (process.argv.includes("--watch")) {
  console.log(`Watching ${TREE_NOTE} — refresh the browser after saving.`);
  let timer;
  // Watch the folder, not the file: Obsidian and iCloud save by replacing the file.
  watch(dirname(TREE_NOTE), (_, name) => {
    if (name !== "concept-tree.md") return;
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((e) => console.error(e.message)), 300);
  });
}
