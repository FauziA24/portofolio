import { z } from "zod";

try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(5),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  TRUST_PROXY: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  API_BODY_LIMIT_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(6 * 1024 * 1024),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  ADMIN_TOKEN: z.string().min(16).optional(),
  ADMIN_EMAIL: z.string().email().default("admin@portfolio.local"),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().min(3),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
  S3_PUBLIC_URL: z.string().url(),
});

export const config = configSchema.parse(process.env);
