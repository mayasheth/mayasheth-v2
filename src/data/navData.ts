// src/data/navData.ts
export const NAV_ITEMS = [
  {
    label: "collections",
    icon: "mdi--chevron-down",
    children: [
      { label: "gratitudes", href: "/gratitudes" },
      { label: "media", href: "/media" },
      { label: "quotes", href: "/quotes" },
    ]
  },
  {
    label: "portfolio",
    icon: "mdi--chevron-down",
    children: [
      { label: "research", href: "/portfolio/research" },
      { label: "artwork", href: "/portfolio/artwork" },
      { label: "design", href: "/portfolio/design" },
    ]
  },
  {
    label: "etc.",
    icon: "mdi--chevron-down",
    children: [
      { label: "musings", href: "/musings" },
      { label: "notebook", href: "/notebook" },
      { label: "worldly", href: "/media/around-the-world" },
    ]
  }
];