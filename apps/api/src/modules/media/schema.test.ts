import assert from "node:assert/strict";
import test from "node:test";
import { projectMediaInput } from "./schema.js";

test("project media accepts bounded crop and render settings", () => {
  const parsed = projectMediaInput.parse({
    mediaAssetId: "asset-1",
    altText: "Dashboard preview",
    cropZoom: 140,
    focalX: 20,
    focalY: 70,
    aspectRatio: "16 / 9",
    displayWidth: 1280,
    displayHeight: 720,
  });

  assert.equal(parsed.cropZoom, 140);
  assert.equal(parsed.aspectRatio, "16 / 9");
  assert.equal(projectMediaInput.safeParse({ ...parsed, focalX: 101 }).success, false);
});
