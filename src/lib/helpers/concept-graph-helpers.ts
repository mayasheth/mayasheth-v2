// Derives a two-tier graph (concept pages, and the individual bullets within
// them) from the "concepts" content collection at build time. No graph data
// is authored anywhere — it's entirely computed from existing frontmatter
// (tags) and markdown body content (links, the <!-- added: YYYY-MM --> date
// comments backfilled/stamped by the sort-links vault skill).
//
// Deliberately non-hierarchical: edges are weighted affinity signals (shared
// tags, shared sources, explicit cross-references), not a fixed taxonomy —
// see /Users/shethm/.claude/plans/lucky-knitting-journal.md for why.

import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root as MdastRoot, List, ListItem, Link } from "mdast";
import type { Node as UnistNode } from "unist";
import type { CollectionEntry } from "astro:content";

// Generic enough to walk any mdast node (Root, ListItem, phrasing content...)
// without fighting mdast's many specific node-type unions.
type NodeWithChildren = UnistNode & { children?: UnistNode[]; value?: string };

export type ConceptPageNode = {
  kind: "page";
  id: string;
  title: string;
  tags: string[];
  itemCount: number;
  // Whether this page follows the flat "link + commentary" bullet format
  // closely enough to bloom into item nodes on the graph (see
  // isItemParseable below). Pages that don't — dense structured notes with
  // tables, prose sections, deep outlines (e.g. ancient-greek.md,
  // population-genetics.md) — still get a page node, edges, everything;
  // they just don't shatter into items that wouldn't mean anything.
  itemParseable: boolean;
};

export type ConceptItemNode = {
  kind: "item";
  id: string; // `${pageId}-item-${index}`, matches the id="item-N" assigned in markdown-render.ts's conceptItemIds
  pageId: string;
  index: number;
  label: string;
  url?: string;
  date?: string; // "YYYY-MM", absent if this bullet predates the dating convention
  tags: string[]; // inherited wholesale from the parent page
  linkedConceptIds: string[]; // other concept pages this bullet explicitly links to
};

export type GraphEdge = {
  source: string;
  target: string;
  weight: number;
  kind: "tag" | "media" | "link" | "containment" | "url-match";
};

const ADDED_COMMENT_RE = /<!--\s*added:\s*(\d{4}-\d{2})\s*-->/;
const RELATED_HEADING_RE = /^##\s+Related\b/m;

export function normalizeUrl(url: string): string {
  return url
    .trim()
    .replace(/[?].*$/, "")
    .replace(/\/$/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .toLowerCase();
}

function getBaseSlug(url: string): string {
  return (
    url
      .split("/")
      .pop()
      ?.replace(/\.md$/, "") ?? ""
  );
}

function bodyBeforeRelated(markdown: string): string {
  const match = RELATED_HEADING_RE.exec(markdown);
  return match ? markdown.slice(0, match.index) : markdown;
}

function relatedSection(markdown: string): string {
  const match = RELATED_HEADING_RE.exec(markdown);
  return match ? markdown.slice(match.index) : "";
}

/**
 * Most concept pages are a flat run of "[link](url): commentary" bullets —
 * that's the shape item nodes are built from. A handful are genuinely
 * different: dense structured notes (vocab tables, nested outlines, lab
 * notes) where "one bullet = one item" doesn't hold. Detected rather than
 * hand-listed, since the set will keep changing as Maya writes more pages:
 * no GFM table before "## Related", and at least 70% of top-level bullets
 * (across every top-level list in the page, not just the first) contain a
 * markdown link. Tuned against the real 2026-09 corpus — see the plan doc
 * for the classification run this threshold came from.
 */
export function isItemParseable(markdown: string): boolean {
  const body = bodyBeforeRelated(markdown);
  const tree = unified().use(remarkParse).parse(body) as MdastRoot;

  const hasTable = tree.children.some((n) => n.type === "table");
  if (hasTable) return false;

  const topItems = tree.children
    .filter((n): n is List => n.type === "list")
    .flatMap((l) => l.children as ListItem[]);
  if (topItems.length === 0) return false;

  const withLink = topItems.filter((li) => findLinks(li).length > 0).length;
  return withLink / topItems.length >= 0.7;
}

function extractText(node: NodeWithChildren): string {
  if (node.type === "text") return node.value ?? "";
  if (node.type === "html") return ""; // our own <!-- added: --> comments, etc.
  if (node.children) {
    return node.children.map((c) => extractText(c as NodeWithChildren)).join("");
  }
  return "";
}

function findLinks(node: NodeWithChildren, out: Link[] = []): Link[] {
  if (node.type === "link") out.push(node as unknown as Link);
  if (node.children) {
    for (const child of node.children) findLinks(child as NodeWithChildren, out);
  }
  return out;
}

/**
 * Parses one concept page's raw markdown body into its top-level bullet
 * items, stopping at "## Related" (that section's own list is deliberately
 * not treated as graph items — it's media references, handled separately by
 * buildPageGraph's shared-media bonus). Collects across *every* top-level
 * list in the page, not just the first — some pages (e.g. sociology.md)
 * group their bullets under "##" subsection headings, which is still the
 * flat link-per-bullet format, just organized into sections. Item N here
 * matches the id="item-N" markdown-render.ts's conceptItemIds() assigns on
 * the rendered page — both walk "all top-level lists before Related" the
 * same way, so the numbering stays in sync.
 */
export function parseConceptItems(
  pageId: string,
  markdown: string,
  pageTags: string[],
  conceptIds: Set<string>,
): ConceptItemNode[] {
  const body = bodyBeforeRelated(markdown);
  const tree = unified().use(remarkParse).parse(body) as MdastRoot;
  const allItems = tree.children
    .filter((n): n is List => n.type === "list")
    .flatMap((l) => l.children as ListItem[]);
  if (allItems.length === 0) return [];

  return allItems.map((listItem: ListItem, index: number) => {
    const raw = listItem.position
      ? body.slice(listItem.position.start.offset, listItem.position.end.offset)
      : "";
    const dateMatch = ADDED_COMMENT_RE.exec(raw);

    const links = findLinks(listItem);
    const externalUrl = links.find((l) => /^https?:\/\//i.test(l.url))?.url;
    const linkedConceptIds = links
      .map((l) => getBaseSlug(l.url))
      .filter((slug) => slug && slug !== pageId && conceptIds.has(slug));

    return {
      kind: "item" as const,
      id: `${pageId}-item-${index}`,
      pageId,
      index,
      label: extractText(listItem).trim().slice(0, 100),
      url: externalUrl,
      date: dateMatch ? dateMatch[1] : undefined,
      tags: pageTags,
      linkedConceptIds: [...new Set(linkedConceptIds)],
    };
  });
}

/**
 * "## Related" mixes two kinds of targets in practice: media entries
 * (`300-collections/media/<slug>`) and, less often but really used, explicit
 * concept-to-concept "see also" pointers (`300-collections/concepts/<slug>`)
 * — e.g. investing.md -> offshore-wind, sustainable-design-engineering.md ->
 * offshore-wind/energy-electricity/sustainability-consumer-goods. Split by
 * whether the linked basename is a known concept id.
 */
function extractRelatedSlugs(
  markdown: string,
  conceptIds: Set<string>,
): { mediaSlugs: Set<string>; conceptSlugs: Set<string> } {
  const section = relatedSection(markdown);
  const tree = unified().use(remarkParse).parse(section) as MdastRoot;
  const slugs = findLinks(tree)
    .map((l) => getBaseSlug(l.url))
    .filter(Boolean);

  const mediaSlugs = new Set<string>();
  const conceptSlugs = new Set<string>();
  for (const slug of slugs) {
    if (conceptIds.has(slug)) conceptSlugs.add(slug);
    else mediaSlugs.add(slug);
  }
  return { mediaSlugs, conceptSlugs };
}

/**
 * Page-level graph: one node per published concept page, edges weighted by
 * shared tags + a bonus for explicit page-to-page links (body bullets or
 * "## Related" "see also" pointers) and shared "## Related" media targets.
 * Zero-weight pairs get no edge — this is what keeps the default view
 * legible instead of a hairball.
 */
export function buildPageGraph(entries: CollectionEntry<"concepts">[]): {
  nodes: ConceptPageNode[];
  edges: GraphEdge[];
} {
  const conceptIds = new Set(entries.map((e) => e.id));
  const related = new Map<string, { mediaSlugs: Set<string>; conceptSlugs: Set<string> }>();
  const bodyLinkedConcepts = new Map<string, Set<string>>();
  for (const entry of entries) {
    related.set(entry.id, extractRelatedSlugs(entry.body ?? "", conceptIds));
    const bodyLinks = findLinks(
      unified().use(remarkParse).parse(bodyBeforeRelated(entry.body ?? "")) as MdastRoot,
    )
      .map((l) => getBaseSlug(l.url))
      .filter((slug) => conceptIds.has(slug) && slug !== entry.id);
    bodyLinkedConcepts.set(entry.id, new Set(bodyLinks));
  }

  const nodes: ConceptPageNode[] = entries.map((entry) => ({
    kind: "page",
    id: entry.id,
    title: entry.data.title,
    tags: entry.data.tags,
    itemCount: parseConceptItems(entry.id, entry.body ?? "", entry.data.tags, conceptIds).length,
    itemParseable: isItemParseable(entry.body ?? ""),
  }));

  const edges: GraphEdge[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      const sharedTags = a.data.tags.filter((t) => b.data.tags.includes(t)).length;

      const aLinksToB =
        bodyLinkedConcepts.get(a.id)!.has(b.id) || related.get(a.id)!.conceptSlugs.has(b.id);
      const bLinksToA =
        bodyLinkedConcepts.get(b.id)!.has(a.id) || related.get(b.id)!.conceptSlugs.has(a.id);
      const explicitLinkBonus = aLinksToB || bLinksToA ? 2 : 0;

      const sharedMedia = [...related.get(a.id)!.mediaSlugs].filter((slug) =>
        related.get(b.id)!.mediaSlugs.has(slug),
      ).length;
      const mediaBonus = sharedMedia > 0 ? 1 : 0;

      const weight = sharedTags + explicitLinkBonus + mediaBonus;
      if (weight > 0) {
        const kind: GraphEdge["kind"] = explicitLinkBonus > 0 ? "link" : sharedTags > 0 ? "tag" : "media";
        edges.push({ source: a.id, target: b.id, weight, kind });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Item-level graph across all pages: containment edges (item -> its page),
 * plus cross-page edges where two items cite the same source URL, plus
 * item -> other-page edges where a bullet explicitly links to another
 * concept page. Call once; the whole dataset is small enough to ship to the
 * client in full rather than fetching per-page on expand.
 */
export function buildItemGraph(entries: CollectionEntry<"concepts">[]): {
  items: ConceptItemNode[];
  edges: GraphEdge[];
} {
  const conceptIds = new Set(entries.map((e) => e.id));
  const items: ConceptItemNode[] = [];
  const edges: GraphEdge[] = [];

  for (const entry of entries) {
    if (!isItemParseable(entry.body ?? "")) continue; // whole-page node only, no bloom — see isItemParseable

    const pageItems = parseConceptItems(entry.id, entry.body ?? "", entry.data.tags, conceptIds);
    items.push(...pageItems);
    for (const item of pageItems) {
      edges.push({ source: item.id, target: entry.id, weight: 5, kind: "containment" });
      for (const targetPageId of item.linkedConceptIds) {
        edges.push({ source: item.id, target: targetPageId, weight: 3, kind: "link" });
      }
    }
  }

  const byUrl = new Map<string, ConceptItemNode[]>();
  for (const item of items) {
    if (!item.url) continue;
    const norm = normalizeUrl(item.url);
    if (!byUrl.has(norm)) byUrl.set(norm, []);
    byUrl.get(norm)!.push(item);
  }
  for (const group of byUrl.values()) {
    if (group.length < 2) continue;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (group[i].pageId === group[j].pageId) continue; // already linked via containment
        edges.push({ source: group[i].id, target: group[j].id, weight: 4, kind: "url-match" });
      }
    }
  }

  return { items, edges };
}
