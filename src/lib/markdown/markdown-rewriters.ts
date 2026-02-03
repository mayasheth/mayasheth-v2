// src/utils/markdown-rewriters.ts

import { getCollection, type CollectionEntry } from "astro:content";

// REWRITE IMAGE PATHS SEARCHING AVAILABLE IN PUBLIC

import { readdir } from "fs/promises";
import { join, relative } from "path";

/**
 * Recursively walk a directory, returning all image file public URLs.
 */
export async function walkImages(
  dir: string,
  out: string[] = [],
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) await walkImages(abs, out);
    else if (/\.(png|jpe?g|gif|webp|svg|avif|heic)$/i.test(entry.name)) {
      out.push("/" + relative("public", abs).replace(/\\/g, "/"));
    }
  }
  return out;
}

/**
 * Build a filename → public URL map for images.
 */
export function buildImageMap(imagePaths: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const url of imagePaths) {
    const base = url.split("/").pop();
    if (base) {
      if (map.has(base)) {
        console.warn(
          `Duplicate image filename: ${base} (${map.get(base)} vs ${url})`,
        );
      }
      map.set(base, url);
    }
  }
  return map;
}

// REWRITERS

// Rewrites image url to public URL
export function imageRewriterFromMap(imageMap: Map<string, string>) {
  return (url: string, alt: string): string => {
    const base = url.split("/").pop();
    return imageMap.get(base || url) ?? url;
  };
}

// Utility function to get the base filename without extension
function getBaseSlug(path: string): string {
  return path.split("/").pop()?.replace(/\.md$/, "") ?? "";
}

// Build map: { baseFileName: fullSlug }
const COLLECTIONS = ["media", "notebook", "atw", "quotes"];
let cachedSlugMap: Record<string, string> | null = null;

export async function getBaseSlugMap(
  collections: string[] = COLLECTIONS,
): Promise<Record<string, string>> {
  if (cachedSlugMap) return cachedSlugMap;

  const map: Record<string, string> = {};
  for (const collection of collections) {
    const entries = await (getCollection as any)(collection);
    entries.forEach((entry: any) => {
      const baseSlug = getBaseSlug(entry.id); // assuming entry.id is like 'media/beck-shotwell-the-folly-of-purity-politics'
      if (collection === "atw") {
        map[baseSlug] = `/media/around-the-world/${entry.id}`;
      } else {
        map[baseSlug] = `/${collection}/${entry.id}`;
      }
    });
  }
  cachedSlugMap = map;
  return map;
}

export async function getInternalLink(
  inputUrl: string,
): Promise<string | null> {
  const slugMap = await getBaseSlugMap();

  const baseSlug = inputUrl.split("/").pop()?.replace(/\.md$/, "") ?? "";
  const absPath = slugMap[baseSlug];

  if (absPath) {
    return absPath;
  } else {
    return null;
  }
}

// Rewrites markdown link to correct absolute route using basename lookup
export function linkRewriterFromBaseSlugMap(slugMap: Record<string, string>) {
  return (url: string, text: string): string => {
    // Extract the base file name (without extension) from any url like 'foo/bar/baz.md'
    const baseSlug = url.split("/").pop()?.replace(/\.md$/, "") ?? url;
    const absPath = slugMap[baseSlug];
    if (absPath) {
      return absPath; // use the full Astro route
    }
    // Fallback: just strip .md extension and leave as is
    return url.replace(/\.md$/, "");
  };
}
