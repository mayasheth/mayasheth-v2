# TODO

## Cleanup
- [ ] Delete remaining orphaned files (test pages partially cleaned up; these still remain):
  - `src/components/ui/HeroGodRays.tsx`
  - `src/components/ui/PawGrainGradient.tsx`
  - `src/components/ui/QuoteColorPanels.tsx`
  - `src/pages/test-quote.astro`
- [ ] Delete `src/components/layout/NavigationHome.astro` (orphaned — no longer imported anywhere)

## High priority
- [ ] Fix search (Pagefind):
  - Relevance ranking is off — searching a book title surfaces pages where individual words appear many times rather than the actual book page
  - "See more" results expansion scrolls jarringly instead of smoothly

## Design & polish

- [ ] Restyle individual quote pages (`/quotes/[id]`)
- [ ] `quotes/surprise-me.astro` — scramble board doesn't have glass treatment yet
- [ ] Detail pages (`/media/[id]`, `/notebook/[id]`) — prose content area styling
- [ ] Add accent color shimmer/hover effects and tinted tag chips across inner pages
- [ ] Update colophon content to reflect new glass aesthetic and inspiration
- [ ] Fix carbon footprint display on mobile
- [ ] Audit whether the full color palette is still used, or if glass/frost effects have superseded it

## Backlog
- [ ] Add "last updated" timestamp to site header or footer
- [ ] Check gratitudes page on mobile — still loads very slowly
- [ ] Once `display: grid-lanes` ships in all major browsers, remove the JS polyfill from `MasonryGrid.astro` (entire `<script>` block and `masonry-item` custom element)

## Ideas
- [ ] Page for concepts and tags (manually curate which to include?)
- [ ] Implement map page(s) for places lived, places travelled (Flighty), around-the-world reading?
  - [ ] For around-the-world, use a tile-grid approach (maybe load with transition from real map?)
      - Inspiration/sources: https://observablehq.com/@karimdouieb/world-tile-grid-map, https://github.com/mustafasaifee42/Tile-Grid-Map
      - For either, could utilize https://flagicons.lipis.dev/ (flag-icons package, already installed)
 - [ ] Add or link to actual CV (need to update/reformat)

---

## Complete

- [x] **Redesign 404 and 500 error pages** — glass card with T.S. Eliot / Beckett quotes (custom
  crescendo and pivot typographic treatments), breathing PawMark logo, shimmer hover on error code,
  `btn-frost` CTA, accent-color gradient background variant
- [x] **Nav and footer → glass** — `Navigation.astro`, `NavigationHome.astro`, `Footer.astro`,
  `FooterMinimal.astro` converted from solid `bg-surface-2` to `glass bg-surface-0/70 border
  border-pale-grey/10`; mobile dropdown uses `bg-surface-0/90` to avoid nested backdrop-filter
- [x] **Search button → frosted glass** — `SearchButton.astro` updated to `tag-frost` pill style
- [x] **PawMark redesign** — 5-color OKLCH gradient (purple → teal arc); named `variant` prop
  (`"default"`, `"teal-blue"`, `"magenta-teal"`); favicon SVG updated to match
- [x] **Markdown table styling** — `tableWrapper` rehype plugin wraps tables in `.table-scroll`
  glass container; header row, hover states, and border treatment added to `utilities.css`
- [x] **Markdown image grid fix** — CSS `:has(img + img):not(:has(:not(img)))` selector renders
  multi-image paragraphs as auto-fit grid instead of fragmenting text into columns
- [x] **`btn-frost` utility** — new interactive frosted button class in `utilities.css`, dimmer
  than `tag-frost`, brighter than `btn-glass`; used on error page CTAs
- [x] **Unify navigation** — updated `Navigation.astro` to use `<PawMark>` component; deleted
  `NavigationTest.astro`; removed dead `NavigationHome`/`variant="home"` branch from BaseLayout
- [x] **Gradient background in BaseLayout** — extracted shader into shared `GradientBackground.astro`
  with `variant="full"` (home, time-of-day aware), `variant="subtle"` (inner pages), and
  `variant="error"` (error pages, purple + magenta accents, higher opacity)
- [x] **BaseLayout `<h1>` styling** — font-header, text-3xl, font-semibold, text-content-2, tracking-wide, lowercase
- [x] **Glass morphism on all inner pages** — `bg-surface-1` cards → `glass bg-surface-0/55
  border border-pale-grey/10` across quotes, media, artwork, design, research, notebook, ATW,
  colophon, gratitudes pages; introduced `tag-frost`, `tag-frost-dim`, `btn-glass`/`btn-glass-active`
- [x] **Fix orca notebook formatting** — added blank line before images in markdown source;
  defensive CSS fix in `utilities.css` for multi-image paragraphs
- [x] **Update colophon** — reflects new design system (fonts, tokens, glass components)
- [x] **Redesign gratitudes page** — orb/bubble grid via MasonryGrid; JS binary search for text orb sizing; tap-to-reveal on touch
- [x] **Markdown processing cleanup** — deleted dead code, cached slug map, added duplicate image warning
- [x] **Media page redesign**
- [x] **Accessibility improvements** — keyboard nav, aria-pressed, aria-label, malformed HTML, button types, alt text
- [x] **Nav hover layout shift fix** — `hover-stable-fw` utility reserves semibold width via `::after`
- [x] **Artwork gallery** — thumbnail optimization, modal redesign, arrow navigation, fade+slide transitions
- [x] **Quotes page redesign** — CSS columns classifieds layout, tag filter with URL param, `/quotes/surprise-me` scramble board
- [x] **Standardize tag chip styling** — `tag-frost` across quotes and artwork pages
- [x] **Add ⌘K indicator to search button**
- [x] **Reduce nav bar height** — py-2 px-3
- [x] **TOC code review fixes** — hierarchy interface moved, h5/h6 skipped, scroll highlight fixed
