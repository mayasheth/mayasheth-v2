# TODO

## In progress
- [ ] Accessibility improvements (recent commits show ongoing work)


## Backlog
- [ ] Complete README documentation
- [ ] Review mobile responsiveness
- [ ] Add indicator that "cmd+K" can be used to search
- [ ] Check accessibility with [a11y.cs](https://ffoodd.github.io/a11y.css/)

## Ideas
- [ ] Dark mode toggle
- [ ] Page for concepts and tags (manually curate which to include?)
- [ ] Implement map page(s) for places lived, places travelled, around-the-world reading?
- [ ] Add or link to actual CV (need to update/reformat)
- [ ] Optimize toc highlighting with sectioning

## Complete
- [x] Markdown processing cleanup (code review findings)
  - Deleted dead `headings` variable in markdown-render.ts
  - Cached `getBaseSlugMap()` results to avoid repeated collection fetches
  - Deleted unused functions: `rewriteImagePaths()`, `rewriteImagePathsWithMap()`, `rewriteMarkdownLinksBase()`
  - Added warning when duplicate image filenames detected in `buildImageMap()`
  - Deleted commented-out path alternatives in sync-collections.js
- [x] Improve 404/500 error pages
