import cors from "@fastify/cors";
import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { corsOptions } from "./cors.js";

test("CORS preflight allows authenticated CMS writes", async () => {
  const app = Fastify();
  await app.register(cors, corsOptions("http://localhost:5173"));

  const response = await app.inject({
    method: "OPTIONS",
    url: "/api/admin/media",
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "PUT",
      "access-control-request-headers": "content-type,x-csrf-token",
    },
  });

  assert.equal(response.statusCode, 204);
  assert.match(response.headers["access-control-allow-methods"] ?? "", /PUT/);
  assert.match(response.headers["access-control-allow-headers"] ?? "", /x-csrf-token/i);
  assert.equal(response.headers["access-control-allow-credentials"], "true");
  await app.close();
});
