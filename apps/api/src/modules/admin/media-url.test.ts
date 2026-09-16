import assert from "node:assert/strict";
import test from "node:test";
import { normalizeStoredMediaUrl } from "./media.js";

test("legacy private media URL is rewritten through the public proxy", () => {
  assert.equal(
    normalizeStoredMediaUrl(
      "http://10.0.0.8:8333/portfolio/profile/portrait photo.png",
      "https://portfolio.test/api/media",
      "http://10.0.0.8:8333",
      "portfolio",
    ),
    "https://portfolio.test/api/media/profile/portrait%20photo.png",
  );
});

test("unrelated external media URL stays unchanged", () => {
  const value = "https://images.example.com/portrait.png";
  assert.equal(
    normalizeStoredMediaUrl(value, "https://portfolio.test/api/media", "http://10.0.0.8:8333", "portfolio"),
    value,
  );
});
