# TODO


## Cleanup
- [ ] Delete shader experiment files once no longer needed:
  - `src/pages/test-home.astro`
  - `src/pages/test-shader.astro`
  - `src/components/ui/HeroGodRays.tsx`
  - `src/components/ui/PawGrainGradient.tsx`
  - `src/pages/test-quote.astro`
  - `src/components/ui/QuoteColorPanels.tsx`

## High priority
- [ ] Fix search (Pagefind):
  - Relevance ranking is off — searching a book title surfaces pages where individual words appear many times rather than the actual book page
  - "See more" results expansion scrolls jarringly instead of smoothly

## Backlog
- [ ] Restyle individual quote pages (demos exist in docs/)
- [ ] Redesign home page (demos in docs/)
- [ ] Check gratitudes page on mobile
- [ ] Add accent color to styles and implement throughout site
- [ ] Once `display: grid-lanes` ships in all major browsers, remove the JS polyfill from `MasonryGrid.astro` (the entire `<script>` block and `masonry-item` custom element)


## Ideas
- [ ] Dark mode toggle
- [ ] Page for concepts and tags (manually curate which to include?)
- [ ] Implement map page(s) for places lived, places travelled (flighty), around-the-world reading?
- [ ] Add or link to actual CV (need to update/reformat)
- Color palettes I like (for accents, edit current, light mode)
  - https://oklch.fyi/color-palettes/arctic-frost

## Complete
- [x] Redesign gratitudes page
  - Orb/bubble grid layout using MasonryGrid (4 columns on desktop, 2–3 on mobile)
  - Image orbs fill column width; text orbs sized dynamically via JS binary search to fit content as perfect circles
  - Responsive padding and orb sizing across breakpoints
  - Tap-to-reveal overlay on touch devices
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
- [x] TOC code review fixes
  - Moved HeadingHierarchy interface to toc-helpers.ts
  - Skip h5/h6 headings instead of throwing during build
  - Fixed hasToC: use headings.length > 1 instead of toc.length > 1
  - Guard heading.id optional before rendering anchor
  - Fixed scroll highlight: now tracks most-recently-passed heading when scrolled past all
  - Removed unused render import
- [x] Add ⌘K indicator to search button (kbd hint on md+ screens)
- [x] Fix nav hover layout shift for font-weight changes
  - Added hover-stable-fw utility (reserves semibold width via ::after)
  - Applied to nav button labels, dropdown links, and sidebar links
- [x] Artwork gallery image optimization and modal redesign
  - Resize thumbnails to 600px wide via Astro Image, reduce eager loading to 8
  - Placard modal layout: padded image, centered metadata, title/year stacked
  - Left/right arrow navigation cycling through filtered set; keyboard arrow support
  - Fade+slide transitions on open, close, and between items
  - Focus outline on masonry-item grid cells
  - Discourage image saving: pointer-events none, draggable=false, contextmenu blocked
