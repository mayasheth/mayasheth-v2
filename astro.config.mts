// astro.config.mts
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";

import icon from "astro-icon";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [icon(), pagefind()],
});