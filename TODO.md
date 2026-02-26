# TODO

## In progress
- [ ] Accessibility improvements (recent commits show ongoing work)

## Accessibility review findings
Priority fixes:
- [ ] Make artwork gallery items keyboard accessible (add tabindex="0", role="button", keydown handler) (source: review of portfolio/artwork.astro:72-108)
- [ ] Add aria-pressed to filter buttons to indicate active state (source: review of portfolio/artwork.astro:57-64)
- [ ] Fix malformed HTML: extra </p> tag (source: review of index.astro:138)
- [ ] Add type="button" to nav dropdown triggers (source: review of Navigation.astro:34)

Other fixes:
- [ ] Ensure modal image alt text is never empty (source: review of portfolio/artwork.astro:200)
- [ ] Change logo alt="paw-logo" to descriptive text or empty string (source: review of Navigation.astro:19, NavigationHome.astro:19,61)
- [ ] Fix data-pagefind-title/url template literal syntax in gratitudes (source: review of gratitudes.astro:62-63)
- [ ] Add aria-label="Main navigation" to desktop nav (source: review of Navigation.astro:28)
- [ ] Add aria-label="Table of contents" to TOC nav (source: review of media/[id].astro:66)
- [ ] Add aria-hidden="true" to decorative icons (source: review of Footer.astro:27)
- [ ] Add aria-labelledby to gallery modal (source: review of portfolio/artwork.astro:117)

## Media page redesign (in progress)
- [ ] All-time-influential tier: continue tweaking (ongoing)
- [ ] Review all tiers on real data once content is fully loaded

## Backlog
- [ ] Once `display: grid-lanes` ships in all major browsers, remove the JS polyfill from `MasonryGrid.astro` (the entire `<script>` block and `masonry-item` custom element)


- [ ] Complete README documentation
- [ ] Review mobile responsiveness
- [ ] Add indicator that "cmd+K" can be used to search

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
