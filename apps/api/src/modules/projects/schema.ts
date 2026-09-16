import { z } from "zod";

export const demoStatusSchema = z.enum(["LIVE", "COMING_SOON", "PRIVATE", "ARCHIVED"]);
export const projectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const projectInput = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().max(60),
  role: z.string().max(100),
  teamNote: z.string().max(120).nullable().optional(),
  summary: z.string().max(300),
  challenge: z.string(),
  contribution: z.string(),
  solution: z.string(),
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
}).superRefine((project, ctx) => {
  if (project.status !== "PUBLISHED") return;

  const required = [
    ["category", project.category, 2],
    ["role", project.role, 2],
    ["summary", project.summary, 10],
    ["overview", project.overview, 10],
    ["challenge", project.challenge, 10],
    ["contribution", project.contribution, 10],
    ["solution", project.solution, 10]
  ] as const;
  for (const [field, value, minimum] of required) {
    if (!value || value.length < minimum) {
      ctx.addIssue({ code: "custom", path: [field], message: `${field} is required before publication` });
    }
  }
  if (!project.startDate) ctx.addIssue({ code: "custom", path: ["startDate"], message: "startDate is required before publication" });
  if (!project.endDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "endDate is required before publication" });
  if (project.startDate && project.endDate && project.startDate > project.endDate) {
    ctx.addIssue({ code: "custom", path: ["endDate"], message: "endDate must not be before startDate" });
  }
  if (!project.technologies.length) {
    ctx.addIssue({ code: "custom", path: ["technologies"], message: "At least one technology is required before publication" });
  }
});

export type ProjectInput = z.input<typeof projectInput>;
