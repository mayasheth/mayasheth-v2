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

## Styling rules

**Always use Tailwind utilities.** Only put things in `<style is:global>` when there is genuinely no utility equivalent: CSS `columns` layout, `@keyframes`, pseudo-elements (`::before`/`::after`), third-party overrides.

**Check existing components before inventing styles.** The canonical styling for common patterns lives in:
- `src/components/ui/Tag.astro` — pill tag style
- `src/components/content/QuoteCard.astro` — quote text tiers, attribution style

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

## Design tokens

Defined in `src/styles/tokens.css`. Only use tokens that exist — do not invent or assume standard Tailwind values.

**Surface colors** (dark → light): `surface-0` → `surface-1` → `surface-2` → `surface-3` → `surface-4`

**Content colors** (light → dark): `content-0` (pale-grey) → `content-1` → `content-2` → `content-3` → `content-4`

**Font families**: `font-base` (Montserrat), `font-header` (Schibsted Grotesk), `font-serif` (Playfair), `font-mono` (Inconsolata)

**Font weights** (custom — standard Tailwind weights like `font-normal` do NOT exist):
`font-light` (300), `font-medium` (375), `font-semibold` (450), `font-bold` (600), `font-extrabold` (750)

**Text sizes**: `text-sm` (0.75rem), `text-base` (1rem), `text-lg` (1.25rem), `text-xl` (1.5rem), `text-2xl` (2rem), `text-3xl` (2.5rem), `text-5xl` (3.5rem), `text-8xl` (5rem). Note: no 4xl, 6xl, or 7xl.

## Astro patterns

- `BaseLayout` accepts optional `titleFull` — omit it to suppress the `<h1>` entirely
- Pass server data to client scripts with `<script define:vars={{ data }}>`
- Static routes take priority over dynamic `[id]` routes (e.g. `surprise-me.astro` wins over `[id].astro`)
- Nested `<a>` inside `<a>` is invalid HTML — use `<button>` with JS navigation, or restructure so only one element is the link