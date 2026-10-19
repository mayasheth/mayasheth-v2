// Reads the hand-curated tree for /concepts from the vault note
// 000-meta/concept-tree.md (synced into src/vault-content by
// vault-to-content.sh) and joins it with the concepts, media and notebook
// collections. The note's syntax is documented at the top of the note itself.

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { CollectionEntry } from "astro:content";
import { isItemParseable, parseConceptItems } from "./concept-graph-helpers.ts";

export type SortKey = "value" | "subject";
export const SORTS: Record<SortKey, string> = { value: "By value", subject: "By subject" };

export type PageLeaf = { kind: "page"; id: string; also: boolean };
export type TagLeaf = { kind: "tag"; tag: string; label: string; also: boolean };
export type Leaf = PageLeaf | TagLeaf;
export type Group = { kind: "group"; label: string; note: string; collapsed: boolean; anchor: string; kids: TreeNode[] };
export type TreeNode = Leaf | Group;
export type Trunk = { label: string; subtitle: string; anchor: string; links: { href: string; label: string }[]; kids: TreeNode[] };

// One step on the way down to a page or tag, for path chips that link back into the tree.
export type PathStep = { label: string; href: string };

type RawNode = { text: string; fields: Record<string, string>; indent: number; kids: RawNode[] };

const FIELD_RE = /\[(\w+)::\s*([^\]]*)\]/g;
const LINK_RE = /^\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]$/;

export function parseTreeSection(markdown: string, heading: string): RawNode[] | null {
  const lines = markdown.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start < 0) return null;
  const root: RawNode = { text: "", fields: {}, kids: [], indent: -1 };
  const stack = [root];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    const m = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (!m) continue;
    const indent = m[1].replace(/\t/g, "    ").length;
    const fields: Record<string, string> = {};
    const text = m[2].replace(FIELD_RE, (_, k, v) => { fields[k] = v.trim(); return ""; }).trim();
    while (stack.at(-1)!.indent >= indent) stack.pop();
    const node = { text, fields, indent, kids: [] };
    stack.at(-1)!.kids.push(node);
    stack.push(node);
  }
  return root.kids;
}

export const pageIdOf = (text: string) => text.match(LINK_RE)?.[1].trim().split("/").at(-1) ?? null;
export const tagOf = (field: string) => field.replace(/^#?concept\//, "");

const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function treeNotePath(): string {
  const synced = join(process.cwd(), "src/vault-content/000-meta/concept-tree.md");
  if (existsSync(synced)) return synced;
  // Local fallback until the note has gone through vault-to-content.sh once.
  // astro dev exposes .env through import.meta.env only; astro build also fills process.env.
  const vault = (import.meta.env?.OBSIDIAN_VAULT_PATH ?? process.env.OBSIDIAN_VAULT_PATH)?.replace(/^~/, process.env.HOME ?? "");
  const local = vault ? join(vault, "000-meta/concept-tree.md") : "";
  if (local && existsSync(local)) {
    console.warn(`[concept-tree] ${synced} is missing; reading ${local} instead. Run vault-to-content.sh to sync it.`);
    return local;
  }
  throw new Error(`[concept-tree] ${synced} not found. Publish 000-meta/concept-tree.md from the vault.`);
}

// Pages not in the concepts collection (unpublished) are dropped, along with
// any group they leave empty.
function convert(nodes: RawNode[], pageIds: Set<string>, sort: SortKey, path: string[], alsoAbove: boolean): TreeNode[] {
  const out: TreeNode[] = [];
  for (const n of nodes) {
    if (n.fields.site) continue;
    const also = alsoAbove || !!n.fields.also;
    const id = pageIdOf(n.text);
    if (id) {
      if (pageIds.has(id)) out.push({ kind: "page", id, also });
      continue;
    }
    if (n.fields.tag) {
      const tag = tagOf(n.fields.tag);
      out.push({ kind: "tag", tag, label: n.text || tag, also });
      continue;
    }
    const kidPath = [...path, n.text];
    const kids = convert(n.kids, pageIds, sort, kidPath, also);
    if (!kids.length) continue;
    out.push({
      kind: "group",
      label: n.text,
      note: n.fields.note ?? "",
      collapsed: !!n.fields.collapsed,
      anchor: `${sort}-${kidPath.map(slugify).join("--")}`,
      kids,
    });
  }
  return out;
}

export type ConceptTree = Record<SortKey, Trunk[]>;

let cached: ConceptTree | null = null;
export function loadConceptTree(concepts: CollectionEntry<"concepts">[]): ConceptTree {
  if (cached) return cached;
  const { content } = matter(readFileSync(treeNotePath(), "utf8"));
  const pageIds = new Set(concepts.map((c) => c.id));
  const tree = {} as ConceptTree;
  for (const sort of Object.keys(SORTS) as SortKey[]) {
    const raw = parseTreeSection(content, SORTS[sort]);
    if (!raw) throw new Error(`[concept-tree] missing "## ${SORTS[sort]}" section`);
    tree[sort] = raw.map((t) => ({
      label: t.text,
      subtitle: t.fields.subtitle ?? "",
      anchor: `${sort}-${slugify(t.text)}`,
      links: t.kids.filter((k) => k.fields.site).map((k) => ({ href: k.fields.site, label: k.text })),
      kids: convert(t.kids, pageIds, sort, [t.text], !!t.fields.also),
    }));
  }
  cached = tree;
  return tree;
}

export const leafKey = (l: Leaf) => (l.kind === "page" ? l.id : `tag:${l.tag}`);

// Main (non-"also") placement of every page and tag, as a path of chips.
export function placesOf(tree: ConceptTree, sort: SortKey): Map<string, PathStep[]> {
  const places = new Map<string, PathStep[]>();
  const href = (anchor: string) => `/concepts?sort=${sort}#${anchor}`;
  const walk = (nodes: TreeNode[], path: PathStep[]) => {
    for (const n of nodes) {
      if (n.kind === "group") walk(n.kids, [...path, { label: n.label, href: href(n.anchor) }]);
      else if (!n.also) places.set(leafKey(n), path);
    }
  };
  for (const t of tree[sort]) walk(t.kids, [{ label: t.label, href: href(t.anchor) }]);
  return places;
}

export function tagLabels(tree: ConceptTree): Map<string, string> {
  const labels = new Map<string, string>();
  const walk = (nodes: TreeNode[]) => nodes.forEach((n) => {
    if (n.kind === "group") walk(n.kids);
    else if (n.kind === "tag" && !labels.has(n.tag)) labels.set(n.tag, n.label);
  });
  // Subject labels read better on their own ("history, broadly" vs "in general").
  for (const sort of ["subject", "value"] as SortKey[]) tree[sort].forEach((t) => walk(t.kids));
  return labels;
}

export type PageStats = { links: number; notebook: boolean; newest: string };
export function pageStats(concepts: CollectionEntry<"concepts">[]): Map<string, PageStats> {
  const ids = new Set(concepts.map((c) => c.id));
  return new Map(concepts.map((c) => {
    const items = parseConceptItems(c.id, c.body ?? "", c.data.tags, ids);
    const newest = items.map((i) => i.date).filter(Boolean).sort().at(-1) ?? "";
    return [c.id, { links: items.length, notebook: !isItemParseable(c.body ?? ""), newest }];
  }));
}

export const conceptTagsOf = (tags: string[]) =>
  tags.filter((t) => t.startsWith("concept/")).map((t) => t.slice("concept/".length));

// The tag this concept page is the main page for, if marked with tag_home
export const tagHomeOf = (c: CollectionEntry<"concepts">) =>
  c.data.tag_home?.replace(/^concept\//, "") || undefined;

export type TaggedNote = { title: string; author?: string; href: string; date: Date; kind: "media" | "notebook" };

// Published media and notebook entries by concept tag (exact tag match).
export function taggedNotes(media: CollectionEntry<"media">[], notebook: CollectionEntry<"notebook">[]): Map<string, TaggedNote[]> {
  const byTag = new Map<string, TaggedNote[]>();
  const add = (tags: string[], note: TaggedNote) => conceptTagsOf(tags).forEach((t) => {
    if (!byTag.has(t)) byTag.set(t, []);
    byTag.get(t)!.push(note);
  });
  media.forEach((m) => add(m.data.tags, {
    title: m.data.title, author: m.data.author, href: `/media/${m.id}`, date: m.data.relevant_date, kind: "media",
  }));
  notebook.forEach((n) => add(n.data.tags, {
    title: n.data.title, href: `/notebook/${n.id}`, date: n.data.created, kind: "notebook",
  }));
  byTag.forEach((list) => list.sort((a, b) => +b.date - +a.date));
  return byTag;
}

export type LatestEntry = { date: string; text: string; italic: boolean; href: string; where: string; whereIsTag: boolean };

// Newest dated bullets on concept pages plus newly shelved media carrying a
// concept tag. A media note is attributed to the tree's tag leaf if there is
// one, else to the single concept page carrying the same tag.
export function latestEntries(
  concepts: CollectionEntry<"concepts">[],
  media: CollectionEntry<"media">[],
  labels: Map<string, string>,
  count = 8,
): LatestEntry[] {
  const ids = new Set(concepts.map((c) => c.id));
  const items = concepts.flatMap((c) =>
    parseConceptItems(c.id, c.body ?? "", c.data.tags, ids)
      .filter((i) => i.date)
      .map((i) => ({
        date: i.date!,
        text: i.label.split(/:| — /)[0].trim(),
        italic: false,
        href: `/concepts/${c.id}#item-${i.index}`,
        where: displayTitle(c.data.title),
        whereIsTag: false,
      })),
  );
  const pagesByTag = new Map<string, CollectionEntry<"concepts">[]>();
  concepts.forEach((c) => conceptTagsOf(c.data.tags).forEach((t) => pagesByTag.set(t, [...(pagesByTag.get(t) ?? []), c])));
  const whereOf = (tags: string[]) => {
    for (const t of tags) if (labels.has(t)) return { where: labels.get(t)!, whereIsTag: true };
    for (const t of tags) {
      const pages = pagesByTag.get(t) ?? [];
      if (pages.length === 1) return { where: displayTitle(pages[0].data.title), whereIsTag: false };
    }
    return { where: tags[0].split("/").at(-1)!.replace(/-/g, " "), whereIsTag: true };
  };
  const shelved = media
    .filter((m) => conceptTagsOf(m.data.tags).length)
    .map((m) => ({
      date: m.data.relevant_date.toISOString().slice(0, 10),
      text: m.data.title,
      italic: true,
      href: `/media/${m.id}`,
      ...whereOf(conceptTagsOf(m.data.tags)),
    }));
  return [...items, ...shelved].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

export const displayTitle = (title: string) =>
  title.toLowerCase().replace(/\bus\b/, "US").replace(/\bui\b/, "UI");
