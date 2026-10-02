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

test("legacy API media URL is rewritten through the configured public media URL", () => {
  assert.equal(
    normalizeStoredMediaUrl(
      "http://43.156.68.109:3001/api/media/profile/portrait.jpg",
      "https://portfolio.test/s3/portfolio",
      "http://10.0.0.8:8333",
      "portfolio",
    ),
    "https://portfolio.test/s3/portfolio/profile/portrait.jpg",
  );
});

test("unrelated external media URL stays unchanged", () => {
  const value = "https://images.example.com/portrait.png";
  assert.equal(
    normalizeStoredMediaUrl(value, "https://portfolio.test/api/media", "http://10.0.0.8:8333", "portfolio"),
    value,
  );
});
