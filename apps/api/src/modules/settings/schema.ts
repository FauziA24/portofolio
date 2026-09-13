import { z } from "zod";

export const settingsInput = z.record(z.string().max(500)).default({});
