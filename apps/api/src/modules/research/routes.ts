import type { FastifyInstance } from "fastify";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { researchItems } from "../../db/schema.js";
import { idParams, reorderInput } from "../common/schema.js";
import { researchInput } from "./schema.js";
import { researchSchemas } from "./swagger.js";

export async function researchRoutes(app: FastifyInstance) {
  const listResearch = (isAdmin = false) => app.db.query.researchItems.findMany({
    where: isAdmin ? undefined : eq(researchItems.isVisible, true),
    orderBy: [asc(researchItems.sortOrder), asc(researchItems.title)]
  });

  app.get("/research", { schema: researchSchemas.research }, async () => listResearch());
  app.get("/admin/research", { schema: researchSchemas.adminResearch }, async () => listResearch(true));

  app.post("/admin/research", { schema: researchSchemas.createResearch }, async (request, reply) => {
    const data = researchInput.parse(request.body);
    const value = { id: randomUUID(), ...data, dateLabel: data.dateLabel ?? null, doi: data.doi ?? null, url: data.url ?? (data.doi ? `https://doi.org/${data.doi}` : null), updatedAt: new Date() };
    await app.db.insert(researchItems).values(value);
    return reply.code(201).send(value);
  });

  app.put("/admin/research/:id", { schema: researchSchemas.updateResearch }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const data = researchInput.parse(request.body);
    const [row] = await app.db.update(researchItems).set({ ...data, dateLabel: data.dateLabel ?? null, doi: data.doi ?? null, url: data.url ?? (data.doi ? `https://doi.org/${data.doi}` : null), updatedAt: new Date() }).where(eq(researchItems.id, id)).returning();
    return row ?? reply.code(404).send({ message: "Research item not found" });
  });

  app.delete("/admin/research/:id", { schema: researchSchemas.removeResearch }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const [row] = await app.db.delete(researchItems).where(eq(researchItems.id, id)).returning({ id: researchItems.id });
    return row ? reply.code(204).send() : reply.code(404).send({ message: "Research item not found" });
  });

  app.patch("/admin/research/reorder", { schema: researchSchemas.reorderResearch }, async (request) => {
    const rows = reorderInput.parse(request.body);
    await app.db.transaction(async (tx) => {
      for (const row of rows) await tx.update(researchItems).set({ sortOrder: row.sortOrder, updatedAt: new Date() }).where(eq(researchItems.id, row.id));
    });
    return listResearch(true);
  });
}
