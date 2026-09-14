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

// In hast, a markdown link becomes an <a> element (type "element", tagName
// "a"), not a "link" node (that's an mdast-only type) — so the anchor text is
// skipped by matching on tagName, not on a node type that can't occur here.
function getHeadingText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    if (node.tagName === "a") return ""; // Skip link text
    return node.children.map(getHeadingText).join("");
  }
  return "";
}

export async function renderMarkdownWithRewriters(
  markdown: string,
  {
    imageRewriter,
    linkRewriter,
  }: {
    imageRewriter?: (url: string, alt: string) => string;
    linkRewriter?: (url: string, text: string) => string;
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

  const processed = await remark()
    .use(remarkParse)
    .use(syncRewritePlugin, { imageRewriter, linkRewriter })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(headingExtractor, headings)
    .use(tableWrapper)
    .use(rehypeStringify)
    .process(markdown);

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
