import { type HeadingHierarchy } from "@/components/ui/TOCHeading.astro";
import type { MarkdownHeading } from "astro";

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
    if (heading.depth > 4)
      throw Error(
        `Depths greater than 4 not allowed:\n${JSON.stringify(heading, null, 2)}`,
      );

    const node: HeadingHierarchy = { ...heading, subheadings: [] };

    // Pop until we find a heading of lower depth (parent)
    while (stack.length && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      // Top-most heading at this point
      hierarchy.push(node);
    } else {
      // Add as child to parent in stack
      stack[stack.length - 1].subheadings.push(node);
    }
    stack.push(node);
  });

  return hierarchy;
}
