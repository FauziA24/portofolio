import { z } from "zod";

export const contactInput = z.object({
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(200),
  url: z.string().min(1).max(300),
  kind: z.enum(["EMAIL", "PHONE", "LINKEDIN", "GITHUB", "WEBSITE", "OTHER"]).default("OTHER"),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  isVisible: z.boolean().default(true)
}).superRefine((data, ctx) => {
  if (data.kind === "EMAIL" && !data.url.startsWith("mailto:")) ctx.addIssue({ code: "custom", path: ["url"], message: "Email links must use mailto:" });
  if (data.kind === "PHONE" && !data.url.startsWith("tel:")) ctx.addIssue({ code: "custom", path: ["url"], message: "Phone links must use tel:" });
  if (!["EMAIL", "PHONE"].includes(data.kind) && !/^https?:\/\//i.test(data.url)) ctx.addIssue({ code: "custom", path: ["url"], message: "Links must use HTTP(S)" });
});
