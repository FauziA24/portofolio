import { z } from "zod";

export const profileInput = z.object({
  displayName: z.string().min(2),
  shortName: z.string().min(1),
  role: z.string().min(2),
  heroHeadline: z.string().min(5),
  heroEmphasis: z.string().nullable().optional(),
  heroBody: z.string().min(10),
  heroPrimaryLabel: z.string().min(2),
  heroPrimaryUrl: z.string().min(1),
  heroSecondaryLabel: z.string().nullable().optional(),
  heroSecondaryUrl: z.string().nullable().optional(),
  aboutHeadline: z.string().min(5),
  aboutBody: z.string().min(10),
  portraitImageUrl: z.string().url().nullable().optional(),
  portraitImageAlt: z.string().nullable().optional(),
  footerLocation: z.string().min(2),
  footerTimezone: z.string().min(2),
  contentLanguage: z.enum(["en", "id"]).default("en"),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoImageUrl: z.string().url().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  isIndexed: z.boolean().default(true)
});

export const factInput = z.object({
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(200),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true)
});
