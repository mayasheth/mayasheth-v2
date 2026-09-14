import type { CollectionEntry } from "astro:content";

export function isImage(url?: string): boolean {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url);
}

export function formatTag(tag: string): string {
  if (!tag) return "";
  return tag.replace("media/", "");
}

export function formatDate(date: Date): string {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, "0");
  const day = String(newDate.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

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
