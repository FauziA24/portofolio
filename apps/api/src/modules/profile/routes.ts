import type { FastifyInstance } from "fastify";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { profileFacts, siteProfiles } from "../../db/schema.js";
import { idParams, reorderInput } from "../common/schema.js";
import { normalizeProfileMedia } from "./media.js";
import { factInput, profileInput } from "./schema.js";
import { profileSchemas } from "./swagger.js";

const profileId = "default";

export async function profileRoutes(app: FastifyInstance) {
  const getProfile = () => app.db.query.siteProfiles.findFirst({ where: (profile, { eq }) => eq(profile.id, profileId) });
  const serializeProfile = async () => {
    const profile = await getProfile();
    return profile ? normalizeProfileMedia(profile) : undefined;
  };
  const listFacts = (isAdmin = false) => app.db.query.profileFacts.findMany({
    where: isAdmin ? undefined : eq(profileFacts.isVisible, true),
    orderBy: [asc(profileFacts.sortOrder), asc(profileFacts.label)]
  });

  app.get("/profile", { schema: profileSchemas.profile }, async (_request, reply) => {
    const profile = await serializeProfile();
    return profile ?? reply.code(404).send({ message: "Profile not found" });
  });

  app.get("/profile/facts", { schema: profileSchemas.profileFacts }, async () => listFacts());

  app.get("/admin/profile", { schema: profileSchemas.adminProfile }, async (_request, reply) => {
    const profile = await serializeProfile();
    return profile ?? reply.code(404).send({ message: "Profile not found" });
  });

  app.put("/admin/profile", { schema: profileSchemas.updateProfile }, async (request) => {
    const data = profileInput.parse(request.body);
    const row = {
      id: profileId,
      ...data,
      heroEmphasis: data.heroEmphasis ?? null,
      heroSecondaryLabel: data.heroSecondaryLabel ?? null,
      heroSecondaryUrl: data.heroSecondaryUrl ?? null,
      portraitImageUrl: data.portraitImageUrl ?? null,
      portraitImageAlt: data.portraitImageAlt ?? null,
      portraitDisplayWidth: data.portraitDisplayWidth ?? null,
      portraitDisplayHeight: data.portraitDisplayHeight ?? null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      seoImageUrl: data.seoImageUrl ?? null,
      canonicalUrl: data.canonicalUrl ?? null,
      updatedAt: new Date()
    };
    await app.db.insert(siteProfiles).values(row).onConflictDoUpdate({ target: siteProfiles.id, set: row });
    return serializeProfile();
  });

  app.get("/admin/profile/facts", { schema: profileSchemas.adminProfileFacts }, async () => listFacts(true));

  app.post("/admin/profile/facts", { schema: profileSchemas.createProfileFact }, async (request, reply) => {
    const row = { id: randomUUID(), ...factInput.parse(request.body), updatedAt: new Date() };
    await app.db.insert(profileFacts).values(row);
    return reply.code(201).send(row);
  });

  app.put("/admin/profile/facts/:id", { schema: profileSchemas.updateProfileFact }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const [row] = await app.db.update(profileFacts).set({ ...factInput.parse(request.body), updatedAt: new Date() }).where(eq(profileFacts.id, id)).returning();
    return row ?? reply.code(404).send({ message: "Profile fact not found" });
  });

  app.delete("/admin/profile/facts/:id", { schema: profileSchemas.removeProfileFact }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const [row] = await app.db.delete(profileFacts).where(eq(profileFacts.id, id)).returning({ id: profileFacts.id });
    return row ? reply.code(204).send() : reply.code(404).send({ message: "Profile fact not found" });
  });

  app.patch("/admin/profile/facts/reorder", { schema: profileSchemas.reorderProfileFacts }, async (request) => {
    const rows = reorderInput.parse(request.body);
    await app.db.transaction(async (tx) => {
      for (const row of rows) await tx.update(profileFacts).set({ sortOrder: row.sortOrder, updatedAt: new Date() }).where(eq(profileFacts.id, row.id));
    });
    return listFacts(true);
  });
}
