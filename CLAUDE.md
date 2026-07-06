# CLAUDE.md

Personal website built with Astro v5, Tailwind CSS v4, React, and Pagefind.

## Commands
- `npm run dev` - Start dev server (auto-syncs content)
- `npm run build` - Production build
- `npm run sync` - Sync content from vault submodule
- `npm run preview` - Build and serve with Pagefind search

## Structure
```
src/
├── components/     # Astro/React components
├── content/        # Local content (mostly empty, see vault-content)
├── data/           # JSON data (quotes.json, gratitudes.json)
├── layouts/        # Page layouts
├── lib/            # Utilities and schemas
├── pages/          # Route pages
├── scripts/        # Build scripts (sync-collections.js)
├── styles/         # Global CSS
└── vault-content/  # Git submodule with markdown content
```

## Content system
- Content lives in `src/vault-content/` (git submodule from Obsidian vault)
- Collections defined in `src/content.config.ts`
- Schemas in `src/lib/schemas.ts`
- Sync script copies content to `src/content/` during build

## Collections
artwork, design, research, notebook, media, atw, quotes, gratitudes

## Key files
- `astro.config.mts` - Astro configuration
- `src/content.config.ts` - Content collection definitions
- `src/lib/schemas.ts` - Zod schemas for content
- `tailwind.config.js` - Tailwind configuration
- `src/styles/tokens.css` - Design tokens (read before touching colors, fonts, spacing)
- `src/styles/utilities.css` - Custom utility classes (glass, tag-frost, btn-glass, hover-stable, markdown-content, etc.)
- `src/components/ui/GradientBackground.astro` - Shader gradient, used by BaseLayout and home page
- `src/components/ui/Tag.astro` / `Tag.tsx` - Canonical tag/pill component (Astro and React versions)

## Styling rules

**Always use Tailwind utilities.** Only put things in `<style is:global>` when there is genuinely no utility equivalent: CSS `columns` layout, `@keyframes`, pseudo-elements (`::before`/`::after`), third-party overrides.

**Check existing components before inventing styles.** The canonical styling for common patterns lives in:
- `src/components/ui/Tag.astro` / `Tag.tsx` — frosted glass pill tag (`tag-frost`)
- `src/components/content/QuoteCard.astro` — quote text tiers, attribution style
- `src/styles/utilities.css` — all custom utility classes; read this before writing new CSS

**Preventing hover layout shift** — when a hover effect changes `letter-spacing` or `font-weight`, surrounding text shifts. Fix with the `.hover-stable` utility class (defined in `utilities.css`). Also add `data-text="<exact link text>"` to the element so the pseudo-element can mirror it:
```html
<a class="hover-stable" data-text="tints.dev" href="...">tints.dev</a>
```
The `::after` renders the text at its hovered letter-spacing invisibly, pre-reserving the space. For font-weight hover shifts, also add `font-weight: var(--font-weight-semibold)` (or relevant weight) to `.hover-stable::after` or a custom variant.

**Preventing punctuation wrap after inline-block links** — `.hover-stable` sets `display: inline-block`, which can cause adjacent punctuation (`,` `.`) to wrap to the next line. Fix by wrapping the link + its trailing punctuation in `<span class="whitespace-nowrap">`:
```html
<!-- comma stays with link -->
<span class="whitespace-nowrap"><a class="hover-stable" data-text="Astro" href="...">Astro</a>,</span>

<!-- period stays with link -->
<span class="whitespace-nowrap"><a class="hover-stable" data-text="Vercel" href="...">Vercel</a>.</span>
```
Apply this to every link that is directly followed by punctuation. Links followed only by a space do not need wrapping.

**For JS-rendered HTML** (`innerHTML`), consolidate all Tailwind class strings as string literals in a `const S = { ... }` object at the top of the script block so Tailwind's content scanner picks them up.

**Glass surface system** — four distinct glass levels, each with a specific semantic role. Never mix them up.

| Class | Role | When to use |
|---|---|---|
| `glass bg-surface-0/55 border border-pale-grey/10` | Dark glass card | Main content containers, modals, section panels |
| `.tag-frost-dim` | Dim frosted surface | Non-interactive: image wells, cover placeholders, two-tone card headers |
| `.tag-frost` | Frosted glass pill | Interactive content tags/chips (use via `Tag` component) |
| `.btn-glass` / `.btn-glass-active` | Dark glass control | Structural UI: sort/filter buttons, nav controls |

**Dark glass card** — the canonical container style:
```html
<div class="glass bg-surface-0/55 border border-pale-grey/10 rounded-xl p-4">
```
- `glass` — `backdrop-filter: blur(20px) saturate(1.3)` (defined in `utilities.css`)
- `bg-surface-0/55` — semi-transparent dark background
- `border border-pale-grey/10` — subtle tinted edge (never `border-white`)
- `rounded-xl` for dense contexts, `rounded-2xl` for spacious ones (see border-radius convention below)
- **Hover lightens** — on hover, reduce background opacity: `hover:bg-surface-0/40`. The card becomes more transparent, letting more gradient show through. Always pair with `transition-colors duration-[700ms] ease-in-out` (not `soft-transition` — too fast and overrideable by inline JS transitions). If JS sets `el.style.transition` on the element, add `background-color 700ms ease-in-out` to that string instead of relying on a CSS class.

**`tag-frost-dim`** — non-interactive frosted surface. Use for decorative wells nested inside a glass card (image containers, cover placeholders, inert header strips). No hover response. Already has `border` and `backdrop-filter` built in — do not add extra `glass` or `bg-*` on top of it.

**`tag-frost`** — frosted glass pill for interactive content tags. Use via `Tag.astro` or `Tag.tsx`; do not apply the class manually. Accepts an optional `color` prop (any CSS color value) that sets `--tag-color` to tint the text. Default color is `content-3` (blue). Active/selected state: add `.tag-frost-active`. Usage:
```astro
<Tag>machine learning</Tag>
<Tag color="var(--color-accent-0)">urgent</Tag>
<Tag as="button" class="tag-frost-active">selected</Tag>
```

**`btn-glass` / `btn-glass-active`** — dark glass for structural UI controls (sort, filter, nav). Not for content tags. Rest state has a transparent border (prevents layout shift on activation). Active state gets an `ocean-500`-tinted border and lighter text:
```html
<button class="btn-glass rounded-full px-3 py-1 text-sm font-base font-light">sort</button>
<!-- activated: -->
<button class="btn-glass btn-glass-active rounded-full px-3 py-1 ...">sort</button>
```
Toggle active state in JS with: `btn.classList.toggle("btn-glass-active", isActive)`

**Never use `white` as a color.** Use palette tokens instead. For subtle borders and glass edges, use `pale-grey` (or `ocean-50`); both are acceptable. In Tailwind: `border-pale-grey/10`. In raw CSS: `oklch(90.40% 0.017 264.38 / 0.08)`. Never reach for `border-white`, `text-white`, `bg-white`, etc.

**Border radius convention** — corner radius reflects visual density, not page hierarchy:
- `rounded-xl` — dense containers: inner-page section cards, gallery items, image wells, filter bars
- `rounded-2xl` — spacious containers: home page glass panels, large feature cards with lots of breathing room
Do not homogenize these. Leave `rounded-xl` on inner pages and `rounded-2xl` on the sparse home page panels.

## Design tokens

Defined in `src/styles/tokens.css`. Only use tokens that exist — do not invent or assume standard Tailwind values.

**Surface colors** (dark → light): `surface-0` → `surface-1` → `surface-2` → `surface-3` → `surface-4`

**Content colors** (light → dark): `content-0` (pale-grey) → `content-1` → `content-2` → `content-3` → `content-4`

**Accent colors** — six vivid hues for tags, highlights, and emphasis. Never used for backgrounds or borders.
- `accent-0` — red (`oklch(47% 0.220 18)`)
- `accent-1` — amber (`oklch(78% 0.175 68)`)
- `accent-2` — lime (`oklch(84% 0.200 132)`)
- `accent-3` — teal (`oklch(79% 0.140 172)`)
- `accent-4` — purple (`oklch(43% 0.220 303)`)
- `accent-5` — magenta (`oklch(47% 0.260 333)`)

Pass as a `color` prop to `Tag`: `color="var(--color-accent-3)"`. For raw CSS: `var(--color-accent-N)`.

**Font families**: `font-base` (Montserrat), `font-header` (Schibsted Grotesk), `font-serif` (Playfair), `font-mono` (Inconsolata)

**Font weights** (custom — standard Tailwind weights like `font-normal` do NOT exist):
`font-light` (300), `font-medium` (375), `font-semibold` (450), `font-bold` (600), `font-extrabold` (750)

**Text sizes**: `text-sm` (0.75rem), `text-base` (1rem), `text-lg` (1.25rem), `text-xl` (1.5rem), `text-2xl` (2rem), `text-3xl` (2.5rem), `text-5xl` (3.5rem), `text-8xl` (5rem). Note: no 4xl, 6xl, or 7xl.

## pretext — DOM-free text measurement

`@chenglou/pretext` measures text dimensions without triggering DOM reflow. Use it anywhere JavaScript currently reads `scrollHeight`, `offsetWidth`, `getBoundingClientRect()`, or similar layout-forcing APIs to answer a text-sizing question.

**Pattern:**
```ts
import { prepare, layout } from "@chenglou/pretext";

// Once per text block (≈19ms for 500 texts, uses canvas internally)
const prepared = prepare(text, { font: "375 1rem Montserrat" });

// Many times, zero DOM cost (≈0.09ms each)
const { height } = layout(prepared, { width: containerWidth });
```

**Where to use on this site:**
- **Gratitudes orb sizing** (`src/pages/gratitudes.astro`) — replace the binary-search loop that reads `scrollHeight` 8× per orb. Use `prepare()` once per orb text, then `layout()` in the binary search so no DOM reads happen during iteration.
- **Quotes font-tier selection** (`src/pages/quotes.astro`) — replace the character-count heuristic in `getQuoteClass()` with an actual rendered-width measurement so tier boundaries are font-accurate, not character-count guesses.

**Constraints to keep in mind:**
- Only works in the browser (canvas-based); not usable at build time or in Astro SSR.
- Requires standard CSS text defaults: `white-space: normal`, `word-break: normal`, `overflow-wrap: break-word`. The pre-wrap variant supports preserved whitespace/line breaks.
- Does not support `system-ui` on macOS — use explicit font family names (e.g. `Montserrat`, `Schibsted Grotesk`).
- Font string must match actual computed style exactly: `"<weight> <size> <family>"`.

## Gradient background

The site-wide shader gradient lives in `src/components/ui/GradientBackground.astro`. It has two variants:

- `variant="full"` — time-of-day aware, full-intensity. Home page only.
- `variant="subtle"` — dark ocean only, slower and dimmer. **All inner pages get this automatically via `BaseLayout`.**

Never add `GradientBackground` manually to an inner page — `BaseLayout` already includes it. The gradient is what makes glass cards look correct; without it, `bg-surface-0/55` just looks like a flat dark surface.

## Astro patterns
- `BaseLayout` accepts optional `titleFull` — omit it to suppress the `<h1>` entirely
- Pass server data to client scripts with `<script define:vars={{ data }}>`
- Static routes take priority over dynamic `[id]` routes (e.g. `surprise-me.astro` wins over `[id].astro`)
- Nested `<a>` inside `<a>` is invalid HTML — use `<button>` with JS navigation, or restructure so only one element is the link