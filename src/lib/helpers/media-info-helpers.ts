// media-info-helpers.ts

import type { CollectionEntry } from "astro:content";

// Is image URL?
export function isImage(url?: string): boolean {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url);
}

// Format tag: removes 'media/'
export function formatTag(tag: string): string {
  if (!tag) return "";
  return tag.replace("media/", "");
}

// Get formatted date: yyyy/mm/dd
export function formatDate(date: Date): string {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, "0");
  const day = String(newDate.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

// Get the icon name for a given format string
export function getFormatIcon(format: string) {
  switch (format) {
    case "print":
    case "e-book":
    case "audiobook":
      return "mdi--book-open-page-variant";
    case "article":
      return "mdi--file-text-multiple";
    case "podcast":
      return "mdi--podcast";
    default:
      return "mdi--book-open-page-variant";
  }
}
