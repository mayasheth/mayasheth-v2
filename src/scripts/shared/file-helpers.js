// Shared low-level filesystem helpers used by both content-processing
// scripts: sync-collections.js (mirrors/aggregates the vault into
// src/content + src/data) and lint-content.js (validates vault frontmatter
// against the Zod schemas). Keeping these in one place avoids the two
// scripts drifting on what counts as a "hidden" file, a markdown file, or a
// file-reference frontmatter field.

export const isHidden = (name) => name.startsWith(".");
export const isMd = (path) => /\.md$/i.test(path);

// Frontmatter fields that may contain paths to referenced files (images,
// covers, etc.). Used by sync-collections.js to know which fields to rewrite
// to public/content URLs, and by lint-content.js to know which fields to
// check for broken references.
export const FILE_REFERENCE_FIELDS = [
  "image",
  "images",
  "banner",
  "cover",
  "thumbnail",
  "hero",
  "gallery",
];
