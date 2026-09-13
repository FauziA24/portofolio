import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { config } from "./config.js";
import { db, pool } from "./db/index.js";
import { installErrorHandling } from "./lib/observability.js";
import { installSecurityHeaders } from "./lib/security.js";
import { robotsTxt, sitemapXml } from "./lib/sitemap.js";
import { projectRoutes } from "./modules/projects/routes.js";
import { checkStorageBucket, storage } from "./storage.js";

export function buildServer() {
  const app = Fastify({
    bodyLimit: config.API_BODY_LIMIT_BYTES,
    logger: { level: config.LOG_LEVEL },
    trustProxy: config.TRUST_PROXY,
  });
  app.decorate("db", db);
  app.register(cors, { origin: config.CORS_ORIGIN, credentials: true });
  installSecurityHeaders(app);
  installErrorHandling(app);
  app.register(swagger, {
    openapi: {
      info: { title: "Fauzi Portfolio API", version: "1.0.0" },
      tags: [
        { name: "system" },
        { name: "profile" },
        { name: "research" },
        { name: "contact" },
        { name: "projects" },
        { name: "admin" },
      ],
      components: {
        securitySchemes: {
          adminSession: {
            type: "apiKey",
            in: "cookie",
            name: "portfolio_admin",
          },
          csrfToken: { type: "apiKey", in: "header", name: "x-csrf-token" },
        },
      },
    },
  });
  app.register(swaggerUi, { routePrefix: "/docs" });
  app.get(
    "/sitemap.xml",
    { schema: { tags: ["system"], summary: "Generated XML sitemap" } },
    async (_request, reply) => {
      return reply
        .type("application/xml")
        .send(await sitemapXml(db, config.CORS_ORIGIN));
    },
  );
  app.get(
    "/robots.txt",
    { schema: { tags: ["system"], summary: "Generated robots.txt" } },
    async (_request, reply) => {
      return reply
        .type("text/plain")
        .send(await robotsTxt(db, config.CORS_ORIGIN));
    },
  );
  app.register(async (api) => {
    api.get(
      "/health",
      { schema: { tags: ["system"], summary: "Health check" } },
      async (request) => ({
        status: "ok",
        requestId: request.id,
        uptimeSeconds: Math.round(process.uptime()),
      }),
    );
    api.get(
      "/health/storage",
      {
        schema: {
          tags: ["system"],
          summary: "S3-compatible bucket health check",
        },
      },
      async (_request, reply) => {
        try {
          await checkStorageBucket();
          return { status: "ok", bucket: config.S3_BUCKET };
        } catch {
          return reply.code(503).send({ status: "error" });
        }
      },
    );
  });
  app.register(projectRoutes, {
    prefix: "/api",
    adminEmail: config.ADMIN_EMAIL,
    adminPassword: config.ADMIN_PASSWORD,
  });
  app.addHook("onClose", async () => {
    storage.destroy();
    await pool.end();
  });
  return app;
}

const app = buildServer();
app.listen({ port: config.PORT, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
