/**
 * Content configuration for the home page panels.
 * Edit this file to control which items are featured in each section.
 *
 * Quote IDs must match filenames in src/vault-content/300-collections/quotes/
 * (without the .md extension). `sourceDisplay` overrides the raw primary_source
 * field from the markdown frontmatter — useful for shortening long attribution strings.
 */
export const homeContent = {

  quotes: [
    { id: "a-map-is-not-the",      sourceDisplay: "Alfred Korzybski" },
    { id: "what-kind-of-life-is",  sourceDisplay: "Mary Oliver" },
  ],

  // ── Fill these in as each panel is built out ──────────────────────────────

  artwork: [
    "2025-02-09-keiko-in-iceland",
    "2024-06-16-i-want-to-be-a-giraffe",
    "2025-02-01-celtic-knots",
  ],

  media: [
    "mcconaghy-wild-dark-shore",
    "keefe-empire-of-pain",
    "vaillant-fire-weather",
    "yong-an-immense-world",
    "pollan-how-to-change-your-mind",
  ],

  interests: [
    {
      title: "aviation + air traffic control",
      descriptionParts: [
        { text: "check out " },
        { text: "chill atc", href: "https://chill-atc-react.vercel.app/" },
        { text: " for the ideal ambient soundtrack" },
      ],
      links: [
        { title: "SkyCards",      href: null },
        { title: "Chill ATC",     href: "https://chill-atc-react.vercel.app/", mine: true },
        { title: "FlightRadar24", href: "https://www.flightradar24.com/" },
      ],
    },
    {
      title: "hockey + sports analytics",
      descriptionParts: [
        { text: "follow the teams you love to hate at " },
        { text: "hockei", href: "https://hockei.vercel.app/" },
      ],
      links: [
        { title: "hockey podcast", href: null },
        { title: "hockei",         href: "https://hockei.vercel.app/", mine: true, detail: "follow the teams you love to hate" },
      ],
    },
  ],

  // What you're currently consuming — links go to external sources.
  // Each field is an array so you can list multiple items.
  // Update lastUpdated whenever you change anything in this block.
  currently: {
    lastUpdated: "2026/05/29",
    reading:   [{ title: "Wild Dark Shore",    href: "https://bookshop.org/p/books/wild-dark-shore-charlotte-mcconaghy/21642289" }],
    listening: [
      { title: "end of beginning — djo",   href: "https://open.spotify.com/track/3qhlB30KknSejmIvZZLjOD?si=131834c550814d9b" },
      { title: "LUX — ROSALÍA",            href: "https://open.spotify.com/album/3SUEJULSGgBDG1j4GQhfYY?si=142963a6724944a3" },
      { title: "tout ça pour ça — Loud",   href: "https://open.spotify.com/album/4reCFxOqiGn1GPEiKAQShd?si=cukJ0VGES8aMrsFqOAOe7w" },
    ],
    learning:  [{ title: "learning how to rollerblade", href: null }],
  },

  // gratitudes: [
  //   "morning coffee rituals",
  //   ...
  // ],

  // interests: [
  //   { title: "aviation + air traffic control", detail: "chill atc", href: "..." },
  //   ...
  // ],

  // media: {
  //   reading:   { title: "The Warmth of Other Suns", detail: "Isabel Wilkerson" },
  //   watching:  { title: "Silo", detail: "season 2" },
  //   listening: { title: "Dense Discovery", detail: "newsletter & podcast" },
  // },

  // musings: ["slug-1", "slug-2"],

};
