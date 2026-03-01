# TODO

## Accessibility review findings
Priority fixes:
- [x] Make artwork gallery items keyboard accessible (add tabindex="0", role="button", keydown handler) (source: review of portfolio/artwork.astro:72-108)
- [x] Add aria-pressed to filter buttons to indicate active state (source: review of portfolio/artwork.astro:57-64)
- [x] Fix malformed HTML: extra </p> tag (source: review of index.astro:138)
- [x] Add type="button" to nav dropdown triggers (source: review of Navigation.astro:34)

Other fixes:
- [ ] Ensure modal image alt text is never empty (source: review of portfolio/artwork.astro:200)
- [ ] Change logo alt="paw-logo" to descriptive text or empty string (source: review of Navigation.astro:19, NavigationHome.astro:19,61)
- [ ] Fix data-pagefind-title/url template literal syntax in gratitudes (source: review of gratitudes.astro:62-63)
- [ ] Add aria-label="Main navigation" to desktop nav (source: review of Navigation.astro:28)
- [ ] Add aria-label="Table of contents" to TOC nav (source: review of media/[id].astro:66)
- [ ] Add aria-hidden="true" to decorative icons (source: review of Footer.astro:27)
- [ ] Add aria-labelledby to gallery modal (source: review of portfolio/artwork.astro:117)

## Backlog
- [ ] Restyle individual quote pages (demos exist in docs/)
- [ ] Redesign home page
- [ ] Redesign gratitudes page
- [ ] Fix nav hover layout shift for font-weight changes (hover:font-semibold; hover-stable utility only handles letter-spacing)
- [ ] Add accent color to styles and implement throughout site
- [ ] Complete README documentation
- [ ] Review mobile responsiveness
- [ ] Add indicator that "cmd+K" can be used to search
- [ ] Once `display: grid-lanes` ships in all major browsers, remove the JS polyfill from `MasonryGrid.astro` (the entire `<script>` block and `masonry-item` custom element)

## Ideas
- [ ] Dark mode toggle
- [ ] Page for concepts and tags (manually curate which to include?)
- [ ] Implement map page(s) for places lived, places travelled (flighty), around-the-world reading?
- [ ] Add or link to actual CV (need to update/reformat)
- [ ] Optimize toc highlighting with sectioning
- Color palettes I like (for accents, edit current, light mode)
  - https://oklch.fyi/color-palettes/arctic-frost

## Complete
- [x] Markdown processing cleanup (code review findings)
  - Deleted dead `headings` variable in markdown-render.ts
  - Cached `getBaseSlugMap()` results to avoid repeated collection fetches
  - Deleted unused functions: `rewriteImagePaths()`, `rewriteImagePathsWithMap()`, `rewriteMarkdownLinksBase()`
  - Added warning when duplicate image filenames detected in `buildImageMap()`
  - Deleted commented-out path alternatives in sync-collections.js
- [x] Improve 404/500 error pages
- [x] Media page redesign
- [x] Accessibility improvements (priority fixes: keyboard nav, aria-pressed, malformed HTML, button types)
- [x] Define hover-stable utility and apply to colophon, home page links
- [x] Redesign quotes page as classifieds layout
  - CSS columns layout, style-constants pattern for JS-rendered classes
  - Tag buttons activate single-tag filter; URL ?tag= param initialization
  - Add /quotes/surprise-me scramble board page
- [x] Standardize tag chip styling across quotes and artwork pages
- [x] Reduce nav bar height (py-2 px-3)
