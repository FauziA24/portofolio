import { z } from "zod";

export const mediaUploadInput = z.object({
  fileName: z.string().min(1).max(180),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataBase64: z.string().min(1),
  scope: z.enum(["projects", "profile", "research"]).default("projects"),
  projectId: z.string().nullable().optional()
});

export const projectMediaInput = z.object({
  mediaAssetId: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  altText: z.string().min(1).max(180),
  caption: z.string().max(240).nullable().optional(),
  kind: z.enum(["IMAGE", "VIDEO", "MOCKUP", "SCREENSHOT"]).default("IMAGE"),
  sortOrder: z.number().int().min(0).default(0),
  isHighlighted: z.boolean().default(false),
  cropZoom: z.number().int().min(100).max(300).default(100),
  focalX: z.number().int().min(0).max(100).default(50),
  focalY: z.number().int().min(0).max(100).default(50),
  aspectRatio: z.enum(["auto", "1 / 1", "4 / 3", "3 / 2", "4 / 5", "16 / 9"]).default("4 / 3"),
  displayWidth: z.number().int().min(1).max(4096).nullable().optional(),
  displayHeight: z.number().int().min(1).max(4096).nullable().optional()
}).refine((data) => data.mediaAssetId || data.url, { message: "Media asset or URL is required" });
