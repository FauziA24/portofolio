import type { FastifyInstance } from "fastify";

export function installSecurityHeaders(app: FastifyInstance) {
  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    if (request.url.startsWith("/api/")) reply.header("Cache-Control", "no-store");
    else if (request.method === "GET" && (request.url === "/sitemap.xml" || request.url === "/robots.txt")) {
      reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    }
    return payload;
  });
}
