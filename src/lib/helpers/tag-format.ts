// tag-format.ts
//
// Formats a hyphenated tag slug into a human-readable label (e.g.
// "machine-learning" -> "machine learning"). Shared between server-side
// rendering and the client-side filter/modal script on the artwork page,
// since it's used in both places to keep filter buttons and item metadata
// in sync.
export function formatTag(tag: string): string {
  if (!tag) return "";
  return tag.replace(/-/g, " ");
}
