// quote-helpers.ts
//
// Shared helpers for the /quotes pages and QuoteCard: formatting a quote's
// tag path into a display label, and building the flattened quote list shape
// used by quotes.astro and quotes/surprise-me.astro.

import { getCollection } from "astro:content";

// Formats a quote tag path (e.g. "topic/quote-inspiration/") into a display
// label: strips a trailing slash, takes the last path segment, and special-
// cases the "quote-inspiration" tag into a friendlier label.
export function formatQuoteTag(tag: string): string {
  if (!tag) return "";
  const parts = tag.replace(/\/$/, "").split("/");
  const last = parts[parts.length - 1];
  return last === "quote-inspiration" ? "to illustrate!" : last || tag;
}

export interface QuoteListItem {
  id: string;
  text: string;
  source: string;
  secondary: string | null;
  tags: string[];
  commentary: string | null;
  date: string;
}

// Loads all quotes and flattens them into the shape both /quotes and
// /quotes/surprise-me render from.
export async function getQuoteListData(): Promise<QuoteListItem[]> {
  const rawQuotes = await getCollection("quotes");

  return rawQuotes.map((q) => ({
    id: q.id,
    text: q.data.words,
    source: q.data.primary_source,
    secondary: q.data.secondary_source ?? null,
    tags: (q.data.tags ?? []).map(formatQuoteTag).filter(Boolean),
    commentary: q.data.commentary ?? null,
    date: (q.data.last_modified ?? q.data.created).toISOString(),
  }));
}
