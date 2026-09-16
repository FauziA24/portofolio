import assert from "node:assert/strict";
import test from "node:test";
import { adminPathRequiresSession } from "./routes.js";
import { dashboardSummary } from "../admin/routes.js";
import { demoStatusSchema, projectInput } from "./schema.js";

test("project data accepts a real live demo URL", () => {
  const parsed = projectInput.parse({
    title: "Sample", slug: "sample", category: "Web", role: "Developer", summary: "A concise project summary.",
    challenge: "A genuine challenge described clearly.", contribution: "A genuine contribution described clearly.", solution: "A genuine solution described clearly.",
    demoStatus: "LIVE", demoUrl: "https://example.com", technologies: []
  });
  assert.equal(parsed.demoStatus, "LIVE");
});

test("demo status stays within the published policy", () => {
  assert.equal(demoStatusSchema.safeParse("PRIVATE").success, true);
  assert.equal(demoStatusSchema.safeParse("invented").success, false);
});

test("project data accepts SEO and indexing fields", () => {
  const parsed = projectInput.parse({
    title: "Indexed Project", slug: "indexed-project", category: "Web", role: "Developer", summary: "A concise project summary.",
    challenge: "A genuine challenge described clearly.", contribution: "A genuine contribution described clearly.", solution: "A genuine solution described clearly.",
    canonicalUrl: "https://example.com/projects/indexed-project", seoDescription: "Search summary", isIndexed: false, sortOrder: 2, technologies: []
  });
  assert.equal(parsed.isIndexed, false);
  assert.equal(parsed.sortOrder, 2);
});

test("draft projects may be incomplete", () => {
  const parsed = projectInput.parse({
    title: "Draft project", slug: "draft-project", category: "", role: "", summary: "",
    challenge: "", contribution: "", solution: "", status: "DRAFT", technologies: []
  });
  assert.equal(parsed.status, "DRAFT");
});

test("published projects require complete content", () => {
  const parsed = projectInput.safeParse({
    title: "Incomplete project", slug: "incomplete-project", category: "", role: "", summary: "",
    challenge: "", contribution: "", solution: "", status: "PUBLISHED", technologies: []
  });
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.equal(parsed.error.issues.some((issue) => issue.path[0] === "technologies"), true);
    assert.equal(parsed.error.issues.some((issue) => issue.path[0] === "overview"), true);
  }
});

test("admin route guard handles prefixed API paths", () => {
  assert.equal(adminPathRequiresSession("/api/admin/profile"), true);
  assert.equal(adminPathRequiresSession("/api/admin/profile?tab=seo"), true);
  assert.equal(adminPathRequiresSession("/api/admin/login"), false);
  assert.equal(adminPathRequiresSession("/api/projects"), false);
});

test("dashboard reports unavailable providers without fake values", () => {
  for (const metric of Object.values(dashboardSummary.metrics)) {
    assert.equal(metric.status, "UNAVAILABLE");
    assert.equal(metric.value, null);
  }
});
