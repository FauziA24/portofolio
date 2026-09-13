import { z } from "zod";

export const idParams = z.object({ id: z.string().min(1) });
export const slugParams = z.object({ slug: z.string().min(1) });
export const reorderInput = z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0) })).min(1);
