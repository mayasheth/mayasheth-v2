# Design System — mayasheth.com

Working document. Status per section:
- ✅ Defined and consistent across the codebase
- ⚠️ Defined but inconsistencies or ambiguities found
- ❓ Needs a decision before it can be documented
- 🔲 Not yet developed

This file is the source of truth for building the `/design` page.
The `/design` page will be linked from the colophon ("technical design reference →").
`CLAUDE.md` will eventually point here for design guidance and retain only behavioral/instruction-specific notes.

---

## 1. Brand & Identity

### PawMark logo ✅
- Inline SVG, 5 gradient fills (`palmLo`, `palm`, `toeLo`, `toeMid`, `toeHi`)
- Three named variants, each a different hue arc:
  - `default` — purple → teal (295→185°), ~27° steps. **Current use: navigation.**
  - `teal-blue` — teal → blue (185→265°), ~20° steps. Available for future use.
  - `magenta-teal` — magenta → teal (333→185°), ~37° steps. Available for future use.
- Custom color props (`palm`, `palmLo`, `toeHi`, `toeMid`, `toeLo`) override any preset for one-off uses.
- `size` prop defaults to `90px`
- Variant assignment beyond `default` is TBD — variants are kept available for future contexts (e.g. a different page, a hero element, print).

### Paw animation (error pages) ✅
- `.paw` utility class: `opacity: 0`, 6s `paw-appear` keyframe loop
- CSS vars: `--paw-delay`, `--paw-rotation`, `--paw-scale`, `--paw-mirror`
- Used in 404/500 pages only

### Favicon ✅
- SVG favicon matching `default` PawMark variant

### Voice & tone ✅
- **Default: lowercase everything.**
- Exceptions:
  1. **Brand names and technical terms** retain their own casing — `GitHub`, `OKLCH`, `Pagefind`, `Montserrat`, etc.
  2. **ALL CAPS** is allowed for small-font UI labels and section headers (e.g. `READ`, `tracking-widest` rating labels) — used sparingly for visual hierarchy at small sizes.
  3. **Research portfolio** (`/research`) uses standard proper capitalization throughout — it is a professional-facing page where the lowercase aesthetic is inappropriate.

---

## 2. Color System

### Semantic tokens ✅
Defined in `src/styles/tokens.css` via `@theme inline`.

| Token | Value | Semantic role |
|---|---|---|
| `surface-0` | ocean-950 | Darkest background, glass card base |
| `surface-1` | ocean-900 | Page background, modal overlays |
| `surface-2` | ocean-800 | — |
| `surface-3` | ocean-700 | — |
| `surface-4` | ocean-600 | Borders, separators, mark highlights |
| `content-0` | pale-grey | Palest text, ghost labels |
| `content-1` | ocean-100 | Primary body text |
| `content-2` | ocean-200 | Secondary text, active labels |
| `content-3` | ocean-400 | Tertiary text, default tag color |
| `content-4` | ocean-500 | Muted labels, metadata |
| `pale-grey` | oklch(90.40% 0.017 264.38) | Borders, glass edges — **never use `white`** |

### Ocean palette ✅
Full 10-step scale (50–950) defined in tokens. `surface` and `content` are aliases into it.
- **Rule: never reference `ocean-*` directly.** It is a backing scale only — all usage must go through `surface-*` or `content-*` semantic aliases.
- **Fix needed:** `btn-glass-active` border is hardcoded `oklch(57.00% 0.179 226.3 / 0.55)` (= `ocean-500` = `content-4`). Should be `border-content-4/55`.

### Accent colors ✅
Six vivid hues — for tags, highlights, emphasis only. Never for backgrounds or borders.
Usage is **contextual, not semantic** — no fixed global meaning per hue.

| Token | Hue | Color |
|---|---|---|
| `accent-red` | 18° | red |
| `accent-amber` | 68° | amber |
| `accent-lime` | 132° | lime |
| `accent-teal` | 172° | teal |
| `accent-purple` | 303° | purple |
| `accent-magenta` | 333° | magenta |

### One-off color tokens ✅
- `green-200`, `green-400`, `spotify-green`, `red-400`, `yellow-400` — **removed**. Were unused carry-overs from a previous design system.
- `white`, `black` — kept as CSS primitives. `white` is still forbidden in component use.

### Surface token roles ✅
All tokens kept. Each has a distinct documented role:

| Token | Value | Role |
|---|---|---|
| `surface-0` | ocean-950 | Glass card base (`bg-surface-0/55`), nav/footer (`/70`), overlays (`/80`–`/90`), page body solid bg |
| `surface-1` | ocean-900 | Focus ring offset (`ring-offset-surface-1`); slightly lighter glass base available for nested contexts |
| `surface-2` | ocean-800 | Fine row/entry separators (`border-surface-2`); hover highlight bg on dark button elements |
| `surface-3` | ocean-700 | Section-level `<hr>` dividers (`border-surface-3`); dark text on light overlays (`text-surface-3` on `bg-content-0`) |
| `surface-4` | ocean-600 | Markdown mark highlights, blockquote borders, column rules; muted text/icon color on dark bg; dark text on light overlays |

**Glass opacity rule:** glass cards always use `bg-surface-0` at varying opacities — never step through surface-1→4 for glass backgrounds. Opacity varies by context:
- `/55` — standard glass card
- `/70` — nav, footer (slightly more opaque for readability)
- `/80`–`/90` — overlays and mobile menus (near-opaque for layering)
- `/40` — hover state (lightens card, more gradient shows through)

**Inconsistencies resolved:** `MediaInfoPage.astro` and `media.astro` were using `bg-surface-1/60` for glass cards — corrected to `bg-surface-0/55`. Commentary box in `MediaInfoPage` changed from `bg-surface-1/60` to `tag-frost-dim` (canonical non-interactive frosted surface). `MediaInfoGallery.astro` (solid `bg-surface-1`) found to be orphaned — added to cleanup list.

---

## 3. Typography

### Families ✅
| Token | Family | Role |
|---|---|---|
| `font-base` | Montserrat | Body, UI, interface text (default) |
| `font-header` | Schibsted Grotesk | Headings, section labels, metadata labels |
| `font-serif` | Playfair | — |
| `font-mono` | Inconsolata | Numbers, dates, code |

- **❓ Decision needed:** When is `font-serif` (Playfair) used? No italic serif rule is documented — is serif restricted to a specific context (pull quotes? decorative text only?)?

### Weights ✅
Custom scale — standard Tailwind weight names (`font-normal`, `font-bold`) do not exist.
| Class | Value | Use |
|---|---|---|
| `font-light` | 300 | Body text, nav links |
| `font-medium` | 375 | Default/normal weight |
| `font-semibold` | 450 | Labels, emphasis, hover states |
| `font-bold` | 600 | Strong emphasis |
| `font-extrabold` | 750 | Display/hero |

### Size scale ✅
No 4xl, 6xl, or 7xl — only these:
`text-xs` (0.625rem) · `text-sm` (0.75rem) · `text-base` (1rem) · `text-lg` (1.25rem) · `text-xl` (1.5rem) · `text-2xl` (2rem) · `text-3xl` (2.5rem) · `text-5xl` (3.5rem) · `text-8xl` (5rem)

### Heading styles ⚠️
- `<h1>` via BaseLayout: `font-header text-3xl font-semibold text-content-2 tracking-wide lowercase`
- `<h2>` / `<h3>` — **❓ not formally documented** — appears to use `font-header` and smaller sizes but no canonical definition found in tokens or utilities. Needs audit across pages.

### Case convention ⚠️
"Lowercase everything" is the stated rule. Exceptions not formally defined — see Brand section.

---

## 4. Glass Surface System

### Levels ✅ (structure) ⚠️ (tag-frost vs tag-frost-dim)
Four distinct levels with semantic roles:

| Class / Pattern | Base color | Backdrop | Border | Role |
|---|---|---|---|---|
| `glass bg-surface-0/55 border border-pale-grey/10` | surface-0 @ 55% | blur(20px) saturate(1.3) | pale-grey/10 | Main content containers, cards, modals |
| `.tag-frost-dim` | pale-grey @ 10% | blur(16px) saturate(1.8) brightness(1.1) | pale-grey/10 | Non-interactive wells, cover placeholders, inert strips |
| `.tag-frost` | pale-grey @ 10% | blur(16px) saturate(1.8) brightness(1.2) | pale-grey/10 | Interactive content tags/chips |
| `.btn-glass` | surface-0 @ 55% | blur(20px) saturate(1.3) | transparent | Structural UI controls (sort, filter, nav) |

⚠️ **Known issue:** `tag-frost` and `tag-frost-dim` have nearly identical CSS. The only difference is `brightness(1.2)` vs `brightness(1.1)` on the backdrop-filter. On the gradient background these may be visually indistinguishable. **This is a tracked TODO item** — needs visual evaluation and potentially a more distinct treatment.

### Additional glass classes ✅
- `.btn-frost` — between `tag-frost` and `btn-glass`; used for error page CTAs. bg: pale-grey @ 8%, brightness(1.1). **❓ Does it have a broader role?**
- `.btn-glass-active` — adds `ocean-500`-tinted border and lighter text to an active `btn-glass`

### Dark glass card — canonical container pattern ✅
```
glass bg-surface-0/55 border border-pale-grey/10 rounded-xl p-4
```
- Hover: reduce opacity to `/40`, transition `700ms ease-in-out`
- Never use `border-white` — always `border-pale-grey/10`

### Gradient dependency ✅
Glass cards require the site gradient to look correct. `BaseLayout` provides `variant="subtle"` gradient automatically on all inner pages. Never add `GradientBackground` manually to an inner page.

### ATW tile glass ⚠️
The ATW map uses a third glass family (`tile-e-*`) with dark navy base at three opacity levels (0.10 / 0.30 / 0.55), defined as scoped `<style>` in the page.
- **❓ Decision needed:** Should these be extracted to utilities? If the tile-map pattern is used elsewhere (future travel map), they'd need to be reusable.

---

## 5. Spacing & Layout

### Gap & padding conventions ✅
Documented in `tokens.css` comments:
- `gap-2` / `p-4` — tight/compact (inline elements, card internals)
- `gap-4` / `p-6` — normal (list items, card sections)
- `gap-6` — loose (major content blocks, page sections)
- Responsive: mobile → desktop doubles the value (`gap-2 md:gap-4`)

### Border radius ✅
Tied to visual density, not hierarchy:
- `rounded-xl` — dense contexts: inner-page cards, gallery items, image wells, filter bars
- `rounded-2xl` — spacious contexts: home page panels, large feature cards
- `rounded-sm` — tight UI elements (ATW map tiles)
- `rounded-full` — pills, dots, circular buttons

### Max-width system ✅
- Structural (fixed): `max-w-7xl` (80rem), `max-w-6xl` (72rem) — nav, page wrappers
- Content (fractional, responsive):
  - Standard: `→ md:max-w-3/4 → lg:max-w-2/3`
  - Narrow: `→ md:max-w-2/3 → lg:max-w-1/2`
  - Focused: `→ md:max-w-1/2 → lg:max-w-2/5`
- Modals: `max-w-lg → md:max-w-2xl`

---

## 6. Motion & Transitions

### Defined utilities ⚠️
| Class | Value | Use |
|---|---|---|
| `.soft-transition` | `transition-all duration-400` | Link hovers, text color changes |
| Glass card hover | `transition-colors duration-[700ms] ease-in-out` | Glass bg opacity lightens on hover |
| `.hover-pop` | `scale(1.05)` on hover | Icon/image hover |
| `.hover-stable` | Reserves `tracking-wide` space via `::after` | Links where hover changes letter-spacing |
| `.hover-stable-fw` | Reserves `font-semibold` space via `::after` | Links where hover changes font-weight |

⚠️ **Issue:** `.soft-transition` uses `transition-all` which is a performance anti-pattern — it transitions every CSS property. Should be narrowed to specific properties. Audit needed: what properties actually change on `.soft-transition` elements?

### Hover pattern for inline links ✅
When hover changes letter-spacing: use `.hover-stable` + `data-text="<link text>"` + wrap trailing punctuation in `<span class="whitespace-nowrap">`.
When hover changes font-weight: use `.hover-stable-fw` + `data-text`.

---

## 7. Components

### Tag / Pill ✅
- `Tag.astro` / `Tag.tsx` — canonical frosted glass pill
- Props: `color` (any CSS value, sets `--tag-color`), `as` (element type), `class`
- Default color: `content-3` (teal)
- Active state: add `.tag-frost-active`
- Never apply `.tag-frost` manually — use the component

### Navigation ✅
- `Navigation.astro` — glass nav bar with PawMark (`default` variant), page links, SearchButton
- `MobileMenu.astro` — mobile dropdown, uses `bg-surface-0/90` (no nested backdrop-filter)
- `NavigationHome.astro` — **orphaned, to be deleted**

### Footer ✅
- `Footer.astro` — glass footer with links + carbon badge
- `FooterMinimal.astro` — minimal variant (used on which pages? ❓)

### Search ✅
- `SearchButton.astro` — `tag-frost` pill with ⌘K indicator
- `SearchModal.astro` — glass modal, `max-w-lg md:max-w-2xl`

### PawMark ✅
See Brand section. Component: `PawMark.astro`.

### Gradient Background ✅
- `GradientBackground.astro` — shader gradient, three variants:
  - `full` — home page only, time-of-day aware, full intensity
  - `subtle` — all inner pages (added automatically by BaseLayout)
  - `error` — 404/500 pages, purple + magenta, higher opacity
- Never add manually to inner pages

### Quote Card ✅
- `QuoteCard.astro` — glass card with text tiers by length, attribution style

### Media / Research / Notebook info ⚠️
- `MediaInfoGallery.astro`, `MediaInfoPage.astro`, `NotebookInfo.astro`, `ResearchArticle.tsx`
- **❓ Not audited yet** — need to verify they all follow the glass card pattern

### MasonryGrid ✅
- `MasonryGrid.astro` — CSS `grid-lanes` with JS polyfill, used for gratitudes orbs
- Remove polyfill once `grid-lanes` ships in all major browsers (tracked in TODO)

### TOC ✅
- `TOCHeading.astro` — table of contents entry, `.toc-active` utility for scroll highlight

### ColorSwatchGrid ✅
- `ColorSwatchGrid.tsx` — React component for colophon color display

---

## 8. Patterns

### Markdown content ✅
`.markdown-content` utility in `utilities.css`. Covers:
- Links (font-semibold, content-2 → content-3 on hover)
- `<mark>` (surface-4 bg, content-1 text)
- Headings (mt-4 mb-2)
- Lists (list-outside/inside, ml-6)
- Blockquotes (border-l-4 surface-4, font-light)
- Images (rounded-lg, auto multi-image grid)
- Tables (glass `.table-scroll` wrapper, header styling, row hover)
- HR (border-content-4 my-4)

### Focus states ✅
Three utilities — needs rule for when to use each:
- `.focus-outline` — `ring-[3px] ring-content-3 ring-offset-2 ring-offset-surface-1` — block-level elements
- `.focus-outline-rounded` — same + `rounded-md` — inline/icon buttons
- `.focus-border` — `border-[1.5px] border-content-3` — input-style elements

### Inline link with punctuation ✅
```html
<span class="whitespace-nowrap"><a class="hover-stable" data-text="Link">Link</a>,</span>
```
Required when: link is followed directly by punctuation (comma, period). Prevents the punctuation wrapping to next line due to `inline-block` on `.hover-stable`.

### JS-rendered HTML (innerHTML) ✅
Consolidate all Tailwind class strings in a `const S = { ... }` object at the top of the `<script>` block so Tailwind's scanner picks them up.

### Pass data to client scripts ✅
Use `<script define:vars={{ data }}>` for server → client data transfer.

---

## 9. Accessibility

### Focus ✅
See focus utilities above. All interactive elements should use one of the three focus utilities.

### Aria ✅
- `aria-label` on icon-only buttons, flag icons, tile links
- `aria-pressed` on toggle buttons
- `aria-hidden="true"` on decorative SVGs

### Semantic HTML ✅
- No nested `<a>` inside `<a>` — use `<button>` + JS navigation or restructure
- `<button type="button">` on all non-submit buttons

---

## 10. Open Decisions

A list of flagged questions to work through, grouped by topic.

### Color
- [x] Ocean palette is backing-only — never reference directly, always use `surface-*` / `content-*`. Fix `btn-glass-active` border to use `border-content-4/55`.
- [x] `green-200`, `green-400`, `spotify-green`, `red-400`, `yellow-400` removed — unused carry-overs. `white` and `black` kept.
- [x] Accents renamed to hue names (`accent-red/amber/lime/teal/purple/magenta`). Usage is contextual, not semantic.
- [x] Glass opacity rule documented; surface token roles audited and fixed (surface-1 inconsistencies in MediaInfoPage + media.astro corrected to surface-0).

### Brand / Logo
- [ ] PawMark variant assignment beyond `default` — TBD when new contexts arise.
- [x] Capitalization: lowercase default; brand/technical terms keep own casing; ALL CAPS ok for small UI labels; research page uses proper capitalization.

### Glass system
- [ ] `tag-frost` vs `tag-frost-dim` — are they distinct enough? If not, how to differentiate?
- [ ] Should `tile-e-*` ATW tile glass become a named utility for future reuse?
- [ ] What is the full intended role of `btn-frost`? Just error page CTAs, or broader?

### Typography
- [ ] When is `font-serif` (Playfair) used? What are the constraints?
- [ ] Canonical `<h2>` / `<h3>` styles — define them.

### Components & patterns
- [ ] When is `FooterMinimal` used vs `Footer`?
- [ ] `soft-transition: transition-all` — narrow to specific properties?
- [ ] Which of the three focus utilities applies to which element types? Formalize the rule.

---

## 11. Missing / Not Yet Developed

- 🔲 Motion: no page-transition or route-change animation
- 🔲 Dark/light mode: the site is dark-only; no light mode planned (confirm)
- 🔲 Form elements: no input, select, or form styles defined
- 🔲 Toast / notification component
- 🔲 Breadcrumb pattern
- 🔲 Skeleton / loading state (only ad-hoc spinners)
- 🔲 Bottom sheet (planned for ATW mobile tooltip — see TODO)

---

## Appendix: File Locations

| What | Where |
|---|---|
| Design tokens | `src/styles/tokens.css` |
| Utility classes | `src/styles/utilities.css` |
| Components | `src/components/` |
| Tag component | `src/components/ui/Tag.astro` / `Tag.tsx` |
| PawMark | `src/components/ui/PawMark.astro` |
| Gradient | `src/components/ui/GradientBackground.astro` |
| BaseLayout | `src/layouts/BaseLayout.astro` |
| Colophon (public-facing) | `src/pages/colophon.astro` |
| Design page (to build) | `src/pages/design.astro` (not yet created) |
