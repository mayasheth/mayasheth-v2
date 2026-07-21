# TODO

## Cleanup
- [ ] Delete remaining orphaned files (test pages partially cleaned up; these still remain):
  - `src/components/ui/HeroGodRays.tsx`
  - `src/components/ui/PawGrainGradient.tsx`
  - `src/components/ui/QuoteColorPanels.tsx`
  - `src/pages/test-quote.astro`
- [ ] Delete `src/components/layout/NavigationHome.astro` (orphaned — no longer imported anywhere)
- [ ] Review public assets for deletion (added but possibly unused):
  - `public/banff-raw.jpeg`, `public/dolphins-1.jpeg`, `public/dolphins-2.jpeg`, `public/with-laguna.jpeg`
  - `public/ms-signature-v1.svg`, `public/paw-mark.js`, `public/signature-v1.json`

## High priority
- [ ] Fix search (Pagefind):
  - Relevance ranking is off — searching a book title surfaces pages where individual words appear many times rather than the actual book page
    - This is a little better, but the word "the" still seems to carry way too much power
    - On media pages, "content maya sheth ×" is included in the search and should not be
    - When I search a word that does not appear on the site, results with "K." all are results 
    still 
  - "See more" results expansion scrolls jarringly instead of smoothly

## Design & polish

- [ ] Restyle individual quote pages (`/quotes/[id]`)
- [x] `quotes/surprise-me.astro` — scramble board glass treatment
- [ ] Detail pages (`/media/[id]`, `/notebook/[id]`) — prose content area styling
- [ ] Add accent color shimmer/hover effects and tinted tag chips across inner pages
- [ ] Update colophon content to reflect new glass aesthetic and inspiration
- [ ] Fix carbon footprint display on mobile
- [ ] Audit whether the full color palette is still used, or if glass/frost effects have superseded it

## Backlog
- [ ] Evaluate whether `tag-frost` and `tag-frost-dim` are visually distinct enough — on gradient backgrounds they may render nearly identically
- [ ] Create a design system doc or page — document glass levels, tokens, components, and utility classes in a living reference (could be a `/design` page or a standalone doc)
- [ ] Add "last updated" timestamp to site header or footer
- [ ] Check gratitudes page on mobile — still loads very slowly
- [ ] Once `display: grid-lanes` ships in all major browsers, remove the JS polyfill from `MasonryGrid.astro` (entire `<script>` block and `masonry-item` custom element)
- [ ] ATW map mobile: add bottom-sheet preview on tile tap — slide-up glass panel (fixed, full-width) showing country name, book, and song; dismiss on backdrop tap or X; navigate via a link inside the panel. All `data-*` attributes are already on the tiles.

## Ideas
- [ ] Page for concepts and tags (manually curate which to include?)
- [ ] Implement map page(s) for places lived, places travelled (Flighty), around-the-world reading?
  - [ ] **Around-the-world tile map** — redesign `/atw` as a sparse CSS Grid world map using tile coordinates
      - Data source: `mustafasaifee42/Tile-Grid-Map` JSON (192 countries, `[x,y]` grid coords)
      - Reference: https://observablehq.com/@karimdouieb/world-tile-grid-map (D3 map→tile animation, skip for now)
      - Flag icons: use already-installed `flag-icons` library (not emoji)
      - **Coordinate mapping**: build a lookup from ATW `location` name → `[x,y]`; include manual overrides for 6 territories:
        - Puerto Rico `[6,3]`, Martinique `[8,5]`, Catalonia `[11,7]`, French Polynesia `[29,13]`, Guam `[28,9]`
        - West Indies: no tile — intentionally left unpositioned as example of overflow behavior
      - **Overflow strip**: any entry with no tile coordinate renders in a separate "other regions" flex strip below the map (same tile style/hover); future unsupported regions auto-fall here
      - **Status tiers** (single color signal per tile):
        - Complete: book `DONE` + music `DONE` → full accent-colored glass tile
        - In progress: book `DONE`/`IN-PROGRESS` or music `DONE` → dimmer accent (`tag-frost-dim` tinted)
        - Planned: book `XPL`/`IDEA` → dark `tag-frost-dim`, no color
        - Two small dots per tile (book / music) for per-axis detail
      - **Hover card** (glass): country name, book title + author + cover thumbnail, song + artist + Spotify link; planned tiles show name + "exploring" only
      - **Tile click**: links to existing `/atw/[slug]` detail page
      - **Mobile**: undecided — may show existing list layout on mobile and only render map on md+ breakpoint
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
