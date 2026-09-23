import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root as MdastRoot, Text as MdastText } from "mdast";
import type { Root as HastRoot, ElementContent } from "hast";
import {
  imageRewriterFromMap,
  getBaseSlugMap,
  linkRewriterFromBaseSlugMap,
  walkImages,
  buildImageMap,
} from "@/lib/markdown/markdown-rewriters";

function tableWrapper() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "table" && parent && typeof index === "number") {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"] },
          children: [node],
        };
      }
    });
  };
}

// IMAGE REWRITER: expects (url, alt) => url
// LINK REWRITER: expects async (url, text) => url

// After remark-rehype (i.e. in hast, not mdast)
function headingExtractor(
  headings: { text: string; depth: number; id?: string }[],
) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      if (
        ["h1", "h2", "h3", "h4"].includes(node.tagName) &&
        node.properties?.id
      ) {
        const text = node.children.map(getHeadingText).join("");
        headings.push({
          text,
          depth: parseInt(node.tagName[1]),
          // rehype-slug (node_modules/rehype-slug/lib/index.js) always
          // assigns a string here (`prefix + slugs.slug(...)`), so this
          // narrows hast's broader `Properties` value type rather than
          // guessing at one.
          id: node.properties.id as string,
        });
      }
    });
  };
}

function getHeadingText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    return node.children.map(getHeadingText).join("");
  }
  return "";
}

// CONCEPTS-ONLY: assigns id="item-N" (document order, 0-indexed) to each
// direct <li> of every top-level list in the document, before "## Related"
// (its own list comes later and is deliberately left untouched). Walks every
// top-level list, not just the first — some pages group their bullets under
// "##" subsection headings (e.g. sociology.md's "## Racism" / "## Reactions
// to COVID"), which is still the flat link-per-bullet format, just organized
// into sections; other headings don't stop the count, only "## Related"
// does. N here must match the indexing concept-graph-helpers.ts's
// parseConceptItems() assigns when it walks the same page's raw markdown,
// since graph item nodes deep-link to `/concepts/<slug>#item-N` — if the two
// ever drift, wire both through a single shared counting function instead of
// keeping them in sync by hand.
function conceptItemIds() {
  return (tree: HastRoot) => {
    let stopIndex = tree.children.length;
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type === "element" && /^h[1-4]$/.test(node.tagName)) {
        const text = node.children.map(getHeadingText).join("").trim();
        if (text === "Related") {
          stopIndex = i;
          break;
        }
      }
    }

    let i = 0;
    for (let idx = 0; idx < stopIndex; idx++) {
      const node = tree.children[idx];
      if (node.type !== "element" || (node.tagName !== "ul" && node.tagName !== "ol")) continue;
      for (const child of node.children) {
        if (child.type === "element" && child.tagName === "li") {
          child.properties = { ...child.properties, id: `item-${i}` };
          i++;
        }
      }
    }
  };
}

export async function renderMarkdownWithRewriters(
  markdown: string,
  {
    imageRewriter,
    linkRewriter,
    extraHastPlugins = [],
  }: {
    imageRewriter?: (url: string, alt: string) => string;
    linkRewriter?: (url: string, text: string) => string;
    // Additional hast transforms applied after tableWrapper, for callers with
    // collection-specific needs (e.g. concepts' item-id assignment) that
    // shouldn't run against every collection's markdown by default.
    extraHastPlugins?: Array<() => (tree: HastRoot) => void>;
  } = {},
): Promise<{ html: string; headings: { text: string; depth: number }[] }> {
  function syncRewritePlugin(options: {
    imageRewriter?: (url: string, alt: string) => string;
    linkRewriter?: (url: string, text: string) => string;
  }) {
    return (tree: MdastRoot) => {
      const { imageRewriter, linkRewriter } = options;

      visit(tree, "image", (node) => {
        if (imageRewriter) node.url = imageRewriter(node.url, node.alt ?? "");
      });
      visit(tree, "link", (node) => {
        if (linkRewriter) {
          const linkText = node.children
            .filter((n): n is MdastText => n.type === "text")
            .map((n) => n.value)
            .join("");
          node.url = linkRewriter(node.url, linkText);
        }
      });
    };
  }

  // This headings array will be filled by headingExtractor below:
  const headings: { text: string; depth: number; id?: string }[] = [];

  let processor = remark()
    .use(remarkParse)
    .use(syncRewritePlugin, { imageRewriter, linkRewriter })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(headingExtractor, headings)
    .use(tableWrapper);

  for (const plugin of extraHastPlugins) {
    processor = processor.use(plugin);
  }

  const processed = await processor.use(rehypeStringify).process(markdown);

  return {
    html: processed.value as string,
    headings,
  };
}

/**
 * Renders vault markdown body content with the standard image/link rewriters
 * wired up (image filenames resolved against /public, internal links resolved
 * against the collection slug map). This is the same setup previously
 * duplicated across every detail page (notebook/[id], media/[id],
 * media/around-the-world/[id]): build the image map, build the slug map,
 * construct the rewriters, then render.
 */
export async function renderVaultMarkdown(
  markdown: string,
): Promise<{ html: string; headings: { text: string; depth: number }[] }> {
  const imagePaths = await walkImages("public");
  const imageMap = buildImageMap(imagePaths);
  const slugMap = await getBaseSlugMap();

  const imageRewriter = imageRewriterFromMap(imageMap);
  const linkRewriter = linkRewriterFromBaseSlugMap(slugMap);

  return renderMarkdownWithRewriters(markdown, { imageRewriter, linkRewriter });
}

/**
 * Same as renderVaultMarkdown, plus concepts-only id="item-N" assignment on
 * the page's top-level bullet list (see conceptItemIds above) — used by
 * concepts/[id].astro so graph item nodes (concept-graph-helpers.ts) can
 * deep-link straight to the matching bullet.
 */
export async function renderConceptMarkdown(
  markdown: string,
): Promise<{ html: string; headings: { text: string; depth: number }[] }> {
  const imagePaths = await walkImages("public");
  const imageMap = buildImageMap(imagePaths);
  const slugMap = await getBaseSlugMap();

  const imageRewriter = imageRewriterFromMap(imageMap);
  const linkRewriter = linkRewriterFromBaseSlugMap(slugMap);

  return renderMarkdownWithRewriters(markdown, {
    imageRewriter,
    linkRewriter,
    extraHastPlugins: [conceptItemIds],
  });
}
