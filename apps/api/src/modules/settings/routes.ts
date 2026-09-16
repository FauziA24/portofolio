import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { sitePreferences } from "../../db/schema.js";
import { normalizeProfileMedia } from "../profile/media.js";
import { settingsInput } from "./schema.js";
import { settingsSchemas } from "./swagger.js";

export async function settingsRoutes(app: FastifyInstance) {
  const listSettings = async () => Object.fromEntries((await app.db.query.sitePreferences.findMany()).map((row) => [row.key, row.value]));
  const getProfile = () => app.db.query.siteProfiles.findFirst({ where: (profile, { eq }) => eq(profile.id, "default") });

  app.get("/site", { schema: settingsSchemas.site }, async () => {
    const profile = await getProfile();
    return { profile: profile ? normalizeProfileMedia(profile) : null, settings: await listSettings() };
  });
  app.get("/admin/settings", { schema: settingsSchemas.adminSettings }, async () => listSettings());
  app.put("/admin/settings", { schema: settingsSchemas.updateSettings }, async (request) => {
    const data = settingsInput.parse(request.body);
    await app.db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(data)) {
        const row = { id: randomUUID(), key, value, updatedAt: new Date() };
        await tx.insert(sitePreferences).values(row).onConflictDoUpdate({ target: sitePreferences.key, set: { value, updatedAt: row.updatedAt } });
      }
    });
    return listSettings();
  });
}
