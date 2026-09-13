import { z } from "zod";

export const researchInput = z.object({
  type: z.enum(["PUBLICATION", "PAPER", "CERTIFICATION", "EDUCATION", "CREDENTIAL"]).default("PUBLICATION"),
  title: z.string().min(2).max(180),
  issuerOrVenue: z.string().min(1).max(120),
  dateLabel: z.string().max(80).nullable().optional(),
  doi: z.string().max(120).nullable().optional(),
  url: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true)
});
