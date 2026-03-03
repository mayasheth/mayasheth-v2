import type { MarkdownHeading } from "astro";

export interface HeadingHierarchy {
  text: string;
  depth: number;
  id?: string; // from rehype-slug
  subheadings: HeadingHierarchy[];
}

export function createHeadingHierarchy(
  headings: (
    | MarkdownHeading
    | {
        text: string;
        depth: number;
        id?: string;
      }
  )[],
): HeadingHierarchy[] {
  if (headings.length === 0) return [];

  const hierarchy: HeadingHierarchy[] = [];
  const stack: HeadingHierarchy[] = [];

  headings.forEach((heading) => {
    // Skip headings deeper than h4 rather than crashing the build
    if (heading.depth > 4) return;

    const node: HeadingHierarchy = { ...heading, subheadings: [] };

    // Pop until we find a heading of lower depth (parent)
    while (stack.length && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      hierarchy.push(node);
    } else {
      stack[stack.length - 1].subheadings.push(node);
    }
    stack.push(node);
  });

  return hierarchy;
}
