import assert from "node:assert/strict";
import test from "node:test";
import { imageDimensions, prepareMediaUpload, publicMediaUrl } from "./media.js";

const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64");

test("media upload validates image metadata and creates storage key", () => {
  const upload = prepareMediaUpload({ fileName: "cover.png", mimeType: "image/png", dataBase64: tinyPng.toString("base64"), scope: "projects", projectId: "project-1" });
  assert.equal(upload.width, 1);
  assert.equal(upload.height, 1);
  assert.match(upload.storageKey, /^projects\/project-1\/.+\.png$/);
});

test("media helper rejects unsupported types", () => {
  assert.throws(() => prepareMediaUpload({ fileName: "note.txt", mimeType: "text/plain", dataBase64: "SGVsbG8=", scope: "projects" }), /Unsupported image type/);
});

test("public media URL escapes object key segments", () => {
  assert.equal(publicMediaUrl("https://media.example.com/", "projects/a b/cover.png"), "https://media.example.com/projects/a%20b/cover.png");
});

test("image dimensions reads PNG headers", () => {
  assert.deepEqual(imageDimensions(tinyPng, "image/png"), { width: 1, height: 1 });
});
