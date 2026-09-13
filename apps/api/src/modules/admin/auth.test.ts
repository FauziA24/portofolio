import assert from "node:assert/strict";
import test from "node:test";
import { createPasswordHash, isLoginRateLimited, verifyPassword } from "./auth.js";

test("admin password hash verifies the original password only", async () => {
  const hash = await createPasswordHash("correct-password");
  assert.equal(await verifyPassword("correct-password", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("admin login rate limiting blocks repeated failures", () => {
  const attempt = { ip: "127.0.0.1", email: "admin@example.com" };
  for (let index = 0; index < 5; index += 1) assert.equal(isLoginRateLimited(attempt), false);
  assert.equal(isLoginRateLimited(attempt), true);
});
