import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdminSession, type AdminAuthConfig } from "../admin/auth.js";
import { adminPathRequiresSession, adminRoutes } from "../admin/routes.js";
import { contactRoutes } from "../contact/routes.js";
import { idParams, slugParams } from "../common/schema.js";
import { mediaRoutes } from "../media/routes.js";
import { profileRoutes } from "../profile/routes.js";
import { researchRoutes } from "../research/routes.js";
import { settingsRoutes } from "../settings/routes.js";
import { projectInput } from "./schema.js";
import { projectService } from "./service.js";
import { projectSchemas } from "./swagger.js";

export { adminPathRequiresSession };

const featuredInput = z.array(z.object({
  id: z.string().min(1),
  featuredRank: z.number().int().min(1).max(5)
})).max(5).superRefine((rows, ctx) => {
  const ids = new Set<string>();
  const ranks = new Set<number>();
  for (const row of rows) {
    if (ids.has(row.id)) ctx.addIssue({ code: "custom", message: "Duplicate project id" });
    if (ranks.has(row.featuredRank)) ctx.addIssue({ code: "custom", message: "Duplicate featured rank" });
    ids.add(row.id);
    ranks.add(row.featuredRank);
  }
});

export async function projectRoutes(app: FastifyInstance, _options: AdminAuthConfig) {
  const service = projectService(app.db);

  app.addHook("preHandler", async (request, reply) => {
    if (!adminPathRequiresSession(request.url)) return;
    if (!await requireAdminSession(request, app.db)) return reply.code(401).send({ message: "Unauthorized" });
  });

  await app.register(adminRoutes);
  await app.register(profileRoutes);
  await app.register(settingsRoutes);
  await app.register(researchRoutes);
  await app.register(contactRoutes);
  await app.register(mediaRoutes);

  app.get("/projects", { schema: projectSchemas.listPublic }, async () => service.listPublic());
  app.get("/projects/featured", { schema: projectSchemas.featuredProjects }, async () => service.listFeatured());
  app.get("/projects/:slug", { schema: projectSchemas.bySlug }, async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const project = await service.bySlug(slug);
    return project ?? reply.code(404).send({ message: "Project not found" });
  });

  app.get("/admin/projects", { schema: projectSchemas.listAdmin }, async () => service.listAdmin());
  app.patch("/admin/projects/featured", { schema: projectSchemas.updateFeaturedProjects }, async (request) => {
    return service.updateFeatured(featuredInput.parse(request.body));
  });
  app.post("/admin/projects", { schema: projectSchemas.create }, async (request, reply) => {
    return reply.code(201).send(await service.create(projectInput.parse(request.body)));
  });
  app.put("/admin/projects/:id", { schema: projectSchemas.update }, async (request) => {
    const { id } = idParams.parse(request.params);
    return service.update(id, projectInput.parse(request.body));
  });
  app.delete("/admin/projects/:id", { schema: projectSchemas.remove }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    await service.remove(id);
    return reply.code(204).send();
  });
}
