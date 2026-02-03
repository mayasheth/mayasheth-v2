import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

// IMAGE REWRITER: expects (url, alt) => url
// LINK REWRITER: expects async (url, text) => url

// After remark-rehype (i.e. in hast, not mdast)
function headingExtractor(
  headings: { text: string; depth: number; id?: string }[],
) {
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (
        ["h1", "h2", "h3", "h4"].includes(node.tagName) &&
        node.properties?.id
      ) {
        const text = node.children.map(getHeadingText).join("");
        headings.push({
          text,
          depth: parseInt(node.tagName[1]),
          id: node.properties.id, // this is set by rehypeSlug
        });
      }
    });
  };
}

function getHeadingText(node: any): string {
  if (node.type === "text") return node.value;
  if (node.type === "link") return ""; // Skip link text
  // For other types, recurse into children
  if (Array.isArray(node.children))
    return node.children.map(getHeadingText).join("");
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
    imageRewriter: (url: string, alt: string) => string;
    linkRewriter: (url: string, text: string) => string;
    headings: { text: string; depth: number; id: string }[];
  }) {
    return (tree: any) => {
      const { imageRewriter, linkRewriter, headings } = options;

      visit(tree, "image", (node) => {
        if (imageRewriter) node.url = imageRewriter(node.url, node.alt ?? "");
      });
      visit(tree, "link", (node) => {
        if (linkRewriter) {
          const linkText = node.children
            .filter((n: any) => n.type === "text")
            .map((n: any) => n.value)
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
    // @ts-ignore
    .use(syncRewritePlugin, { imageRewriter, linkRewriter }) // removing headings from here
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(headingExtractor, headings) // Pass headings array to extractor plugin!
    .use(rehypeStringify)
    .process(markdown);

  return {
    html: processed.value as string,
    headings,
  };
}
