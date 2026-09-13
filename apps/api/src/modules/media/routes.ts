import type { FastifyInstance } from "fastify";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { and, asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { config } from "../../config.js";
import { mediaAssets, projectMedia } from "../../db/schema.js";
import { storage } from "../../storage.js";
import { prepareMediaUpload, publicMediaUrl } from "../admin/media.js";
import { idParams, reorderInput, slugParams } from "../common/schema.js";
import { projectService } from "../projects/service.js";
import { mediaUploadInput, projectMediaInput } from "./schema.js";
import { mediaSchemas } from "./swagger.js";

export async function mediaRoutes(app: FastifyInstance) {
  const service = projectService(app.db);
  const listProjectMedia = (projectId: string) => app.db.query.projectMedia.findMany({
    where: eq(projectMedia.projectId, projectId),
    orderBy: [asc(projectMedia.sortOrder), asc(projectMedia.createdAt)],
    with: { mediaAsset: true }
  });
  const mediaUrl = (row: Awaited<ReturnType<typeof listProjectMedia>>[number]) => row.mediaAsset?.publicUrl ?? row.url;

  app.get("/projects/:slug/media", { schema: mediaSchemas.projectMedia }, async (request, reply) => {
    const project = await service.bySlug(slugParams.parse(request.params).slug);
    if (!project) return reply.code(404).send({ message: "Project not found" });
    return (await listProjectMedia(project.id)).map((row) => ({ ...row, url: mediaUrl(row) }));
  });

  app.get("/admin/media", { schema: mediaSchemas.adminMedia }, async () => {
    return app.db.query.mediaAssets.findMany({ orderBy: [asc(mediaAssets.createdAt)] });
  });

  app.post("/admin/media", { schema: mediaSchemas.uploadMedia }, async (request, reply) => {
    try {
      const input = mediaUploadInput.parse(request.body);
      const prepared = prepareMediaUpload(input);
      await storage.send(new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: prepared.storageKey, Body: prepared.buffer, ContentType: input.mimeType }));
      const row = {
        id: randomUUID(),
        storageKey: prepared.storageKey,
        publicUrl: publicMediaUrl(config.S3_PUBLIC_URL, prepared.storageKey),
        originalName: input.fileName,
        mimeType: input.mimeType,
        byteSize: prepared.buffer.length,
        width: prepared.width,
        height: prepared.height,
        updatedAt: new Date()
      };
      await app.db.insert(mediaAssets).values(row);
      return reply.code(201).send(row);
    } catch (error) {
      return reply.code(400).send({ message: error instanceof Error ? error.message : "Invalid media" });
    }
  });

  app.delete("/admin/media/:id", { schema: mediaSchemas.removeMedia }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const asset = await app.db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, id) });
    if (!asset) return reply.code(404).send({ message: "Media asset not found" });
    const used = await app.db.query.projectMedia.findFirst({ where: eq(projectMedia.mediaAssetId, id) });
    if (used) return reply.code(409).send({ message: "Media asset is still used by a project" });
    await storage.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: asset.storageKey }));
    await app.db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return reply.code(204).send();
  });

  app.get("/admin/projects/:id/media", { schema: mediaSchemas.adminProjectMedia }, async (request) => {
    return listProjectMedia(idParams.parse(request.params).id);
  });

  app.post("/admin/projects/:id/media", { schema: mediaSchemas.createProjectMedia }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    const data = projectMediaInput.parse(request.body);
    const row = { id: randomUUID(), projectId: id, ...data, mediaAssetId: data.mediaAssetId ?? null, url: data.url ?? null, caption: data.caption ?? null, updatedAt: new Date() };
    await app.db.insert(projectMedia).values(row);
    return reply.code(201).send(row);
  });

  app.put("/admin/projects/:id/media/:mediaId", { schema: mediaSchemas.updateProjectMedia }, async (request, reply) => {
    const ids = z.object({ id: z.string(), mediaId: z.string() }).parse(request.params);
    const data = projectMediaInput.parse(request.body);
    const [row] = await app.db.update(projectMedia).set({ ...data, mediaAssetId: data.mediaAssetId ?? null, url: data.url ?? null, caption: data.caption ?? null, updatedAt: new Date() }).where(and(eq(projectMedia.id, ids.mediaId), eq(projectMedia.projectId, ids.id))).returning();
    return row ?? reply.code(404).send({ message: "Project media not found" });
  });

  app.delete("/admin/projects/:id/media/:mediaId", { schema: mediaSchemas.removeProjectMedia }, async (request, reply) => {
    const ids = z.object({ id: z.string(), mediaId: z.string() }).parse(request.params);
    const [row] = await app.db.delete(projectMedia).where(and(eq(projectMedia.id, ids.mediaId), eq(projectMedia.projectId, ids.id))).returning({ id: projectMedia.id });
    return row ? reply.code(204).send() : reply.code(404).send({ message: "Project media not found" });
  });

  app.patch("/admin/projects/:id/media/reorder", { schema: mediaSchemas.reorderProjectMedia }, async (request) => {
    const { id } = idParams.parse(request.params);
    const rows = reorderInput.parse(request.body);
    await app.db.transaction(async (tx) => {
      for (const row of rows) await tx.update(projectMedia).set({ sortOrder: row.sortOrder, updatedAt: new Date() }).where(eq(projectMedia.id, row.id));
    });
    return listProjectMedia(id);
  });
}
