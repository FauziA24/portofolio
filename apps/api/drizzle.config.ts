import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(new URL(".env", import.meta.url));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

if (!process.env.DATABASE_URL) {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB } = process.env;
  const POSTGRES_PORT = process.env.POSTGRES_PORT ?? "5432";

  if (POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_HOST && POSTGRES_DB) {
    process.env.DATABASE_URL = `postgresql://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(
      POSTGRES_PASSWORD
    )}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! }
});
