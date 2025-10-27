// schemas
import { z } from "zod";

const baseItemSchema = z.object({
  created: z.coerce.date(),
  status: z.union([
    z.enum(['active', 'ongoing', 'complete', 'someday', 'archived']),
    z.array(z.enum(['active', 'ongoing', 'complete', 'someday', 'archived']))
  ]).transform(val => Array.isArray(val) ? val[0] : val),
  last_modified: z.coerce.date(),
  tags: z.array(z.string())
});

export const gratitudeSchema = baseItemSchema.extend({
  redacted_content: z.string(),
  relevant_date: z.coerce.date(),
  image: z.coerce.string().nullish()
})

const ratingSchema = z.union([
  z.string(),
  z.array(z.string())
])
.transform(val => Array.isArray(val) ? val[0] : val)
.pipe(z.enum(['not-good', 'okay', 'good', 'fantastic', 'all-time-influential']))
.default('okay');

export const mediaSchema = baseItemSchema.extend({
  title: z.string(),
  subtitle: z.string().nullish(),
  author: z.coerce.string(),
  commentary: z.string().nullish(),
  format: z.union([
    z.enum(['print', 'e-book', 'audiobook', 'read-by-the-author', 'podcast', 'article']),
    z.array(z.enum(['print', 'e-book', 'audiobook', 'read-by-the-author', 'podcast', 'article']))
  ]).transform(val => Array.isArray(val) ? val[0] : val),
  link_to_source: z.string().nullish(),
  rating: ratingSchema,
  relevant_date: z.coerce.date(),
  year_published: z.number().nullish()
})

export const researchSchema = baseItemSchema.extend({
  abstract: z.coerce.string(),
  authors: z.array(z.string()),
  date_published: z.coerce.date(),
  doi: z.coerce.string(),
  journal: z.coerce.string(),
  language: z.literal('en'),
  pmid: z.coerce.number().nullish(),
  selected: z.coerce.boolean(),
  title: z.coerce.string(),
  url: z.coerce.string()
})
export type ResearchArticle = z.infer<typeof researchSchema>;

export const quoteSchema = baseItemSchema.extend({
  words: z.string(),
  commentary: z.coerce.string().nullish(),
  primary_source: z.string(),
  secondary_source: z.string().nullish()
})
