import { z } from "zod";

export const demoStatusSchema = z.enum(["LIVE", "COMING_SOON", "PRIVATE", "ARCHIVED"]);
export const projectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const projectInput = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(60),
  role: z.string().min(2).max(100),
  teamNote: z.string().max(120).nullable().optional(),
  summary: z.string().min(10).max(300),
  challenge: z.string().min(10),
  contribution: z.string().min(10),
  solution: z.string().min(10),
  overview: z.string().nullable().optional(),
  status: projectStatusSchema.default("DRAFT"),
  demoStatus: demoStatusSchema.default("COMING_SOON"),
  demoUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  highlightImageUrl: z.string().url().nullable().optional(),
  highlightImageAlt: z.string().nullable().optional(),
  hoverPreviewImageUrl: z.string().url().nullable().optional(),
  hoverPreviewImageAlt: z.string().nullable().optional(),
  featuredRank: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoImageUrl: z.string().url().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  isIndexed: z.boolean().default(true),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
  technologies: z.array(z.string().min(1).max(50)).max(12).default([])
});

export type ProjectInput = z.input<typeof projectInput>;
