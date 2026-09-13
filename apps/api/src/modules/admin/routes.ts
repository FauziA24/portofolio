import type { FastifyInstance } from "fastify";
import { clearAdminCookie, clearLoginRateLimit, createAdminSession, isLoginRateLimited, makeAdminCookie, requireAdminSession, revokeAdminSession, revokeCurrentAdminSession, validateAdminLogin } from "./auth.js";
import { idParams } from "../common/schema.js";
import { adminSchemas } from "./swagger.js";

export function adminPathRequiresSession(url: string) {
  const path = url.split("?")[0].replace(/^\/api(?=\/)/, "");
  return path.startsWith("/admin") && path !== "/admin/login";
}

export async function adminRoutes(app: FastifyInstance) {
  app.post("/admin/login", { schema: adminSchemas.login }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const attempt = { ip: request.ip, email: body.email };
    if (isLoginRateLimited(attempt)) return reply.code(429).send({ message: "Too many login attempts" });
    const user = await validateAdminLogin(app.db, body);
    if (!user) return reply.code(401).send({ message: "Invalid credentials" });
    clearLoginRateLimit(attempt);
    const session = await createAdminSession(app.db, user.id);
    return reply.header("set-cookie", makeAdminCookie(session.token)).send({ email: user.email, csrfToken: session.csrfToken });
  });

  app.post("/admin/logout", { schema: adminSchemas.logout }, async (request, reply) => {
    await revokeCurrentAdminSession(app.db, request.headers.cookie as string | undefined);
    return reply.header("set-cookie", clearAdminCookie()).code(204).send();
  });

  app.get("/admin/me", { schema: adminSchemas.me }, async (request, reply) => {
    const session = await requireAdminSession(request, app.db);
    return session ? { email: session.email, csrfToken: session.csrfToken } : reply.code(401).send({ message: "Unauthorized" });
  });

  app.delete("/admin/sessions/:id", { schema: adminSchemas.revokeSession }, async (request, reply) => {
    const { id } = idParams.parse(request.params);
    await revokeAdminSession(app.db, id);
    return reply.code(204).send();
  });
}
