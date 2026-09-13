import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { installErrorHandling } from "./observability.js";
import { installSecurityHeaders } from "./security.js";

test("public API responses receive CDN-friendly cache and security headers", async () => {
  const app = Fastify({ logger: false });
  installSecurityHeaders(app);
  app.get("/api/projects", async () => ({ ok: true }));

  const response = await app.inject({ method: "GET", url: "/api/projects" });

  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "DENY");
  assert.equal(response.headers["cache-control"], "public, max-age=60, stale-while-revalidate=300");
});

test("admin API responses are not cached", async () => {
  const app = Fastify({ logger: false });
  installSecurityHeaders(app);
  app.get("/api/admin/projects", async () => ({ ok: true }));

  const response = await app.inject({ method: "GET", url: "/api/admin/projects" });

  assert.equal(response.headers["cache-control"], "no-store");
});

test("unexpected errors are logged without leaking details to clients", async () => {
  const app = Fastify({ logger: false });
  installErrorHandling(app);
  app.get("/api/fail", async () => {
    throw new Error("database password leaked in stack");
  });

  const response = await app.inject({ method: "GET", url: "/api/fail" });

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.json(), { message: "Internal server error" });
});
