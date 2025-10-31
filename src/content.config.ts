import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { artworkSchema, atwSchema, gratitudeSchema, mediaSchema, notebookSchema, quoteSchema, researchSchema } from '@/types/schemas'

// collections
const artwork = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/portfolio/artwork" }),
  schema: artworkSchema
});

const atw = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/around-the-world" }),
  schema: atwSchema
});

const design = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/portfolio/design"}),
  schema: artworkSchema
})

const gratitudes = defineCollection({
  loader: file('./src/data/gratitudes.json'),
  schema: gratitudeSchema
});

const media = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/media" }),
  schema: mediaSchema
});

const notebook = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/journal" }),
  schema: notebookSchema
})

const quotes = defineCollection({
  loader: file('./src/data/quotes.json'),
  schema: quoteSchema
});

const research = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/portfolio/research" }),
  schema: researchSchema
});



// export
export const collections = { artwork, atw, design, gratitudes, media, notebook, quotes, research }