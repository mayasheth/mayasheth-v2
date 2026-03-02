# TODO


## Backlog
- [ ] Restyle individual quote pages (demos exist in docs/)
- [ ] Redesign home page (demos in docs/)
- [ ] Redesign gratitudes page
- [ ] Add accent color to styles and implement throughout site
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
- [x] Accessibility review (full audit)
  - Priority: keyboard nav on gallery, aria-pressed on filters, malformed HTML, button types
  - ARIA: aria-label on main nav and TOC nav, aria-labelledby + role="dialog" on gallery modal, aria-hidden on decorative icons
  - Alt text: empty alt on decorative logo imgs, non-empty fallback on modal img
  - Bug fix: data-pagefind-title/url were literal strings instead of expressions in gratitudes.astro
- [x] Review mobile responsiveness (fixed px-8 → px-4 sm:px-8 in quotes.astro)
- [x] Add ⌘K indicator to search button (kbd hint on md+ screens)
- [x] Fix nav hover layout shift for font-weight changes
  - Added hover-stable-fw utility (reserves semibold width via ::after)
  - Applied to nav button labels, dropdown links, and sidebar links
