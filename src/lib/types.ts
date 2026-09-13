// Shared TypeScript types used across multiple components/pages.
// Consolidated here to avoid redefining the same shape in more than one place.

import type { CollectionEntry } from "astro:content";

/**
 * Shared prop shape for any component/page that renders a single "media"
 * collection entry (MediaInfoGallery, MediaInfoPage, and the media/[id] page).
 */
export type MediaEntryProps = {
  mediaEntry: CollectionEntry<"media">;
};

/**
 * Shared prop shape for any component/page that renders a single "notebook"
 * collection entry (NotebookInfo and the notebook/[id] page).
 */
export type NotebookEntryProps = {
  notebookEntry: CollectionEntry<"notebook">;
};

/**
 * Allowed shader gradient background variants. Shared between
 * GradientBackground (which renders the shader) and BaseLayout (which passes
 * the variant through), so the two never drift out of sync.
 */
export type GradientVariant = "full" | "subtle" | "error";

/**
 * A single top-level nav menu entry with its dropdown children, as produced
 * by src/data/navData.ts and consumed by MobileMenu.astro.
 */
export interface MenuItem {
  label: string;
  icon?: string;
  children: { label: string; href: string }[];
}
