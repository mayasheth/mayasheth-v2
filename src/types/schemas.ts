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

const atwLocationSchema = z.object({
  location: z.string(),
  location_type: z.enum(["country", "territory"]),
  book_status: z.union([
    z.enum(['DONE', 'XPL', 'IDEA', 'IN-PROGRESS']),
    z.array(z.enum(['DONE', 'XPL', 'IDEA', 'IN-PROGRESS']))
  ]).transform(val => Array.isArray(val) ? val[0] : val),
  music_status: z.union([
    z.enum(['DONE', 'SEARCH']),
    z.array(z.enum(['DONE', 'SEARCH']))
  ]).transform(val => Array.isArray(val) ? val[0] : val)
});

const atwBookSchema = z.object({
  author: z.coerce.string().nullish(),
  book_commentary: z.coerce.string().nullish(),
  book_cover: z.string().url().nullish(),
  book_date_read: z.coerce.date().nullish(),
  book_ideas: z.string().nullish(),
  book_notes_record: z.string().nullish(),
  book_subtitle: z.coerce.string().nullish(),
  book_tags: z.array(z.enum([ 'author from location', 'book set in location', 'book (partly) set in location',  'character from location', 'nonfiction', 'translation'])).nullish(),
  book_title: z.coerce.string().nullish(),
  book_url: z.string().url().nullish(),
});

const atwMusicSchema = z.object({
  music_artist: z.coerce.string().nullish(),
  music_link: z.string().url().nullish(),
  music_listened_date: z.coerce.date().nullish(),
  music_notes:  z.coerce.string().nullish(),
  music_song: z.coerce.string().nullish()
});

export const atwSchema = baseItemSchema
  .merge(atwLocationSchema)
  .merge(atwBookSchema)
  .merge(atwMusicSchema)


export const artworkSchema = baseItemSchema.extend({
  description: z.coerce.string().nullish(),
  title: z.coerce.string(),
  image: z.coerce.string().nullish(),
  image_size: z.enum(['narrow', 'wide']).nullish(),
  images: z.array(z.string()).nullish(),
  art_tags: z.array(z.string()),
  inspiration: z.string().url().nullish(),
  link_to_more: z.string().url().nullish()
})

export const gratitudeSchema = baseItemSchema.extend({
  redacted_content: z.string(),
  relevant_date: z.coerce.date(),
  image: z.coerce.string().nullish()
})

export const notebookSchema = baseItemSchema.extend({
  title: z.coerce.string(),
  musings_edition: z.coerce.number().nullish()
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
