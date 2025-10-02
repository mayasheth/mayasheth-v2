import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publish: z.boolean(),
    date: z.string().or(z.date()).optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
  }),
});

export const collections = { notes };