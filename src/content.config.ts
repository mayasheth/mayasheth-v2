import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { gratitudeSchema, mediaSchema, quoteSchema, researchSchema } from '@/types/schemas'

// collections
const gratitudes = defineCollection({
  loader: file('./src/data/gratitudes.json'),
  schema: gratitudeSchema
});

const media = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/media" }),
  schema: mediaSchema
});

const quotes = defineCollection({
  loader: file('./src/data/quotes.json'),
  schema: quoteSchema
});

const research = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/300-collections/portfolio/research" }),
  schema: researchSchema
});



// export
export const collections = { gratitudes, media, quotes, research }