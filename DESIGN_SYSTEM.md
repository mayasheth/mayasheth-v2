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
- **Fix needed:** `ctrl-glass-active` border is hardcoded `oklch(57.00% 0.179 226.3 / 0.55)` (= `ocean-500` = `content-4`). Should be `border-content-4/55`.

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

**Inconsistencies resolved:** `MediaInfoPage.astro` and `media.astro` were using `bg-surface-1/60` for glass cards — corrected to `bg-surface-0/55`. Commentary box in `MediaInfoPage` changed from `bg-surface-1/60` to `surface-frost` (canonical non-interactive frosted surface). `MediaInfoGallery.astro` (solid `bg-surface-1`) found to be orphaned — added to cleanup list.

---

## 3. Typography

### Families ✅
| Token | Family | Role |
|---|---|---|
| `font-base` | Montserrat | Body, UI, interface text (default) |
| `font-header` | Schibsted Grotesk | Headings, section labels, metadata labels |
| `font-serif` | Playfair | Accent font — used sparingly for typographic contrast |
| `font-mono` | Inconsolata | Numbers, dates, code |

**`font-serif` usage rule:** Accent font only — two sanctioned contexts:
1. **"maya sheth"** in the home page header — display/identity use
2. **Quotes page** — mixed into the typographic layout for visual variety alongside `font-base` and `font-header`

Do not use `font-serif` anywhere else. Never use it in italic (see memory: no italic serif rule).

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

### Heading styles ✅
Defined as base-layer defaults in `src/styles/base.css`. Applied to all bare heading elements globally.

| Element | Font | Size | Weight | Other |
|---|---|---|---|---|
| `h1` | `font-header` | `text-2xl` | `font-bold` | `tracking-wide`, centered, `text-content-0` |
| `h2` | `font-header` | `text-xl` | `font-semibold` | `tracking-wide`, centered, `text-content-0` |
| `h3` | `font-header` | `text-lg` | `font-medium` | `tracking-wide`, centered, `text-content-0`, italic |
| `h4` | `font-header` | `text-lg` | `font-semibold` | `tracking-wider`, left-aligned, `text-content-1` |

Note: `BaseLayout` overrides `h1` with `text-3xl font-semibold text-content-2 lowercase` for page titles. The `h3` italic uses `font-header` (Schibsted Grotesk), not `font-serif` — no conflict with the no-italic-serif rule.

### Case convention ⚠️
"Lowercase everything" is the stated rule. Exceptions not formally defined — see Brand section.

---

## 4. Glass Surface System

### Levels ✅
Four distinct levels with semantic roles, named by `[type]-[material]`:

| Class / Pattern | Base color | Backdrop | Border | Role |
|---|---|---|---|---|
| `glass bg-surface-0/55 border border-pale-grey/10` | surface-0 @ 55% | blur(20px) saturate(1.3) | pale-grey/10 | Main content containers, cards, modals |
| `.surface-frost` | pale-grey @ 10% | blur(16px) saturate(1.8) brightness(1.1) | pale-grey/10 | Non-interactive wells, cover placeholders, inert strips |
| `.ctrl-frost` | pale-grey @ 10% | blur(16px) saturate(1.8) brightness(1.2) | pale-grey/10 | Interactive content tags/chips |
| `.ctrl-glass` | surface-0 @ 55% | blur(20px) saturate(1.3) | transparent | Structural UI controls (sort, filter, nav) |

**Naming convention:** `[type]-[material]` — `ctrl` (interactive control), `surface` (inert container). The `ctrl` prefix unifies all interactive elements regardless of visual weight. Formerly: `tag-frost` → `ctrl-frost`, `btn-glass` → `ctrl-glass`, `tag-frost-dim` → `surface-frost`. `btn-frost` eliminated — merged into `ctrl-frost`.

### Additional glass classes ✅
- `.ctrl-frost-active` — selected/active state for `ctrl-frost`: brighter, more opaque
- `.ctrl-glass-active` — adds `ocean-500`-tinted border and lighter text to an active `ctrl-glass`

### Dark glass card — canonical container pattern ✅
```
glass bg-surface-0/55 border border-pale-grey/10 rounded-xl p-4
```
- Hover: reduce opacity to `/40`, transition `700ms ease-in-out`
- Never use `border-white` — always `border-pale-grey/10`

### Gradient dependency ✅
Glass cards require the site gradient to look correct. `BaseLayout` provides `variant="subtle"` gradient automatically on all inner pages. Never add `GradientBackground` manually to an inner page.

### ATW tile glass ✅
The ATW map uses a scoped glass family (`tile-e-*`) defined in a `<style>` block inside `around-the-world.astro`. Kept scoped intentionally — extract to utilities only if a second tile-map page is built.

**Pattern:** dark navy base (`surface-0`) at three opacity levels, hover lightens. Same border (`pale-grey/20`) and transition speed (`700ms`) across all three.

| Class | bg opacity | brightness | Semantic role |
|---|---|---|---|
| `.tile-e-complete` | 0.10 (lightest) | 1.22 | Both book + music done — most transparent, most gradient shows through |
| `.tile-e-in-progress` | 0.30 (mid) | 1.10 | At least one item in progress |
| `.tile-e-planned` | 0.55 (darkest) | 1.0 | Not yet started — most opaque, darkest tile |

Status dots use accent colors: `accent-lime` = done, `accent-amber` = in-progress, `content-4/40` = not started.

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

`.soft-transition` uses `transition-all` intentionally — all actual uses animate compositor-friendly properties (color, opacity, transform, letter-spacing, font-weight). No layout-reflow properties involved.

### Focus utilities ✅
| Class | Mechanism | When to use |
|---|---|---|
| `.focus-outline` | Ring only | Element already has its own shape (pills, icon buttons with `rounded-full`/`rounded-lg`) |
| `.focus-outline-rounded` | Ring + forces `rounded-md` | Plain elements with no border-radius (prose `<a>` tags, bare links) |
| `.focus-border` | Border instead of ring (200ms transition) | Elements with an existing visible border (inputs, form fields) — avoids doubled-up ring+border |

### Hover pattern for inline links ✅
When hover changes letter-spacing: use `.hover-stable` + `data-text="<link text>"` + wrap trailing punctuation in `<span class="whitespace-nowrap">`.
When hover changes font-weight: use `.hover-stable-fw` + `data-text`.

---

## 7. Components

### Tag / Pill ✅
- `Tag.astro` / `Tag.tsx` — canonical frosted glass pill
- Props: `color` (any CSS value, sets `--tag-color`), `as` (element type), `class`
- Default color: `content-3` (teal)
- Active state: add `.ctrl-frost-active`
- Never apply `.ctrl-frost` manually — use the component

### Navigation ✅
- `Navigation.astro` — glass nav bar with PawMark (`default` variant), page links, SearchButton
- `MobileMenu.astro` — mobile dropdown, uses `bg-surface-0/90` (no nested backdrop-filter)
- `NavigationHome.astro` — **orphaned, to be deleted**

### Footer ✅
- `Footer.astro` — glass footer with links + carbon badge
- `FooterMinimal.astro` — **orphaned, to be deleted** (superseded by `Footer.astro`)

### Search ✅
- `SearchButton.astro` — `ctrl-frost` pill with ⌘K indicator
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
- [x] Ocean palette is backing-only — never reference directly, always use `surface-*` / `content-*`. Fix `ctrl-glass-active` border to use `border-content-4/55`.
- [x] `green-200`, `green-400`, `spotify-green`, `red-400`, `yellow-400` removed — unused carry-overs. `white` and `black` kept.
- [x] Accents renamed to hue names (`accent-red/amber/lime/teal/purple/magenta`). Usage is contextual, not semantic.
- [x] Glass opacity rule documented; surface token roles audited and fixed (surface-1 inconsistencies in MediaInfoPage + media.astro corrected to surface-0).

### Brand / Logo
- [ ] PawMark variant assignment beyond `default` — TBD when new contexts arise.
- [x] Capitalization: lowercase default; brand/technical terms keep own casing; ALL CAPS ok for small UI labels; research page uses proper capitalization.

### Glass system
- [x] Naming convention: `ctrl-frost` (interactive light), `ctrl-glass` (interactive dark), `surface-frost` (inert). `btn-frost` eliminated — merged into `ctrl-frost`. `ctrl` prefix unifies all interactive elements.
- [x] `tile-e-*` ATW tile glass — kept scoped in `around-the-world.astro`; extract only if a second tile-map page is built.

### Typography
- [x] `font-serif` (Playfair) — accent font only; sanctioned in home page header ("maya sheth") and quotes page typography. No other uses. Never italic.
- [x] Canonical `<h2>` / `<h3>` styles — documented from `base.css`; global defaults, overridden per-context as needed.

### Components & patterns
- [x] `FooterMinimal` vs `Footer` — `FooterMinimal` is orphaned (never imported); added to cleanup list. `Footer` is the only footer, used in `BaseLayout` and `index.astro`.
- [x] `soft-transition: transition-all` — kept as-is. All actual uses animate compositor-friendly properties (color, opacity, transform, letter-spacing, font-weight). No layout-reflow properties are involved, so the performance concern doesn't apply.
- [x] Focus utilities: `focus-outline` — ring only, element has its own shape (pills, icon buttons). `focus-outline-rounded` — ring + forces `rounded-md`, for plain elements with no border-radius (prose links, bare `<a>` tags). `focus-border` — border instead of ring, for elements with an existing visible border (inputs, form fields).

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
