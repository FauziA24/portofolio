import type { FastifyInstance } from "fastify";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { contactLinks } from "../../db/schema.js";
import { idParams, reorderInput } from "../common/schema.js";
import { contactInput } from "./schema.js";
import { contactSchemas } from "./swagger.js";

export async function contactRoutes(app: FastifyInstance) {
  const listContacts = (isAdmin = false) => app.db.query.contactLinks.findMany({
    where: isAdmin ? undefined : eq(contactLinks.isVisible, true),
    orderBy: [asc(contactLinks.sortOrder), asc(contactLinks.label)]
  });

  app.get("/contact-links", { schema: contactSchemas.contactLinks }, async () => listContacts());
  app.get("/admin/contact-links", { schema: contactSchemas.adminContactLinks }, async () => listContacts(true));

  app.post("/admin/contact-links", { schema: contactSchemas.createContactLink }, async (request, reply) => {
    const data = contactInput.parse(request.body);
    const row = { id: randomUUID(), ...data, updatedAt: new Date() };
    await app.db.transaction(async (tx) => {
      if (row.isPrimary) await tx.update(contactLinks).set({ isPrimary: false, updatedAt: new Date() });
      await tx.insert(contactLinks).values(row);
    });
    return reply.code(201).send(row);
  });

  app.put("/admin/contact-links/:id", { schema: contactSchemas.updateContactLink }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const data = contactInput.parse(request.body);
    const [row] = await app.db.transaction(async (tx) => {
      if (data.isPrimary) await tx.update(contactLinks).set({ isPrimary: false, updatedAt: new Date() });
      return tx.update(contactLinks).set({ ...data, updatedAt: new Date() }).where(eq(contactLinks.id, id)).returning();
    });
    return row ?? reply.code(404).send({ message: "Contact link not found" });
  });

  app.delete("/admin/contact-links/:id", { schema: contactSchemas.removeContactLink }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const [row] = await app.db.delete(contactLinks).where(eq(contactLinks.id, id)).returning({ id: contactLinks.id });
    return row ? reply.code(204).send() : reply.code(404).send({ message: "Contact link not found" });
  });

  app.patch("/admin/contact-links/reorder", { schema: contactSchemas.reorderContactLinks }, async (request) => {
    const rows = reorderInput.parse(request.body);
    await app.db.transaction(async (tx) => {
      for (const row of rows) await tx.update(contactLinks).set({ sortOrder: row.sortOrder, updatedAt: new Date() }).where(eq(contactLinks.id, row.id));
    });
    return listContacts(true);
  });
}
