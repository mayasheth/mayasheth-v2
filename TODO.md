# TODO


## Cleanup
- [ ] Delete shader experiment files once no longer needed:
  - `src/pages/test-home.astro`
  - `src/pages/test-shader.astro`
  - `src/components/ui/HeroGodRays.tsx`
  - `src/components/ui/PawGrainGradient.tsx`
  - `src/pages/test-quote.astro`
  - `src/components/ui/QuoteColorPanels.tsx`
- [ ] Delete `src/components/layout/NavigationHome.astro` (orphaned — no longer imported anywhere)
- [x] Delete `src/pages/test-home-v2.astro` once home page redesign is implemented

## High priority
- [ ] Fix search (Pagefind):
  - Relevance ranking is off — searching a book title surfaces pages where individual words appear many times rather than the actual book page
  - "See more" results expansion scrolls jarringly instead of smoothly

## Site-wide design consistency (new home page → inner pages)

The home page now uses a shader gradient background + glass cards. Inner pages still use flat
`bg-surface-0` + `bg-surface-1` cards via `BaseLayout`. The items below make the rest of the
site feel coherent with the home page, split by how much effort they require.

### Tier 1 — Minimum consistency (structural, high impact)

- [x] **Unify navigation**: Updated `Navigation.astro` to use `<PawMark>` component; deleted
  `NavigationTest.astro`; removed dead `NavigationHome`/`variant="home"` branch from BaseLayout.
- [x] **Gradient background in BaseLayout**: Extracted shader into shared `GradientBackground.astro`
  component with `variant="full"` (home, time-of-day aware) and `variant="subtle"` (inner pages,
  dark ocean only, slower/dimmer). BaseLayout now renders the subtle variant on all inner pages.
- [x] **BaseLayout `<h1>` styling**: font-header, text-3xl, font-semibold, text-content-2, tracking-wide, lowercase.

### Tier 2 — Glass morphism on inner pages

These depend on Tier 1 (gradient background must be in place first for glass to look right).

- [x] **Convert inner page section containers to glass cards**: Swapped `bg-surface-1` cards to
  `glass bg-surface-0/55 border border-pale-grey/10` across all inner pages. Also introduced
  `tag-frost` for content tags, `tag-frost-dim` for decorative surfaces/image wells, and
  `btn-glass`/`btn-glass-active` for sort/filter controls.
  - [x] `quotes.astro` — sort/filter controls → `btn-glass`; quote tags → `tag-frost`; separator lines updated
  - [x] `media.astro` — rating section cards → glass; cover placeholders → `tag-frost-dim`
  - [x] `portfolio/artwork.astro` — filter buttons → `btn-glass`; modal card → glass; tags → `tag-frost`
  - [x] `portfolio/design.astro` — outer cards → glass; inner image wells → `tag-frost-dim`
  - [x] `portfolio/research.astro` — fine as-is, no changes needed
  - [x] `notebook/[id].astro` — `NotebookInfo` info card → glass
  - [x] `media/around-the-world.astro` — complete cards → glass outer + `tag-frost-dim` header link; incomplete cards → `tag-frost-dim` pill
  - [x] `media/around-the-world/[id].astro` — location summary, book, and music cards → glass
  - [x] `colophon.astro` — all three sections → glass; accent swatches fixed to single row
  - [x] `gratitudes.astro` — subtitle text, mobile card layout
  - [x] `notebook.astro` / `musings.astro` — list pages fine as-is, no changes needed
- [ ] **Restyle individual quote pages** (`/quotes/[id]`) — already in backlog, fits here

### Tier 3 — Accent colors and polish

- [ ] Add accent color token to styles and implement on `zone-label` shimmer, hover effects,
  and tag chips across all inner pages (already in backlog as "Add accent color")
- [ ] `quotes/surprise-me.astro` — scramble board doesn't have glass treatment yet
- [ ] Detail pages (`/media/[id]`, `/notebook/[id]`) — prose content area styling
- [ ] Nav search button (`Navigation.astro`) — apply `btn-glass` style to match quotes/artwork filter controls

## Backlog
- [ ] Fix formatting on http://localhost:4321/notebook/2024-08-02-mm40-a-propagating-pod-of-personal-orcas 
- [ ] Add "last updated" timestamp to site header or footer
- [ ] Add markdown formatting for tables
- [ ] Redesign error pages (404, 500) to match current design system
- [x] Update colophon page to reflect new design system (fonts, tokens, components)
  - [x] Colophon: make accents in color card on one line
- [ ] Check gratitudes page on mobile
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
