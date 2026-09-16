import assert from "node:assert/strict";
import test from "node:test";
import { profileInput } from "./schema.js";

const profile = {
  displayName: "Mohammad Fauzi Aziz",
  shortName: "MFA",
  role: "Developer",
  heroHeadline: "Reliable products for the web",
  heroBody: "A complete hero description for the public homepage.",
  heroPrimaryLabel: "View work",
  heroPrimaryUrl: "#work",
  aboutHeadline: "Dependable software for real workflows",
  aboutBody: "A complete about description for the public website.",
  footerLocation: "Surabaya, Indonesia",
  footerTimezone: "Asia/Jakarta",
};

test("profile portrait transform is validated and defaulted", () => {
  const parsed = profileInput.parse(profile);
  assert.equal(parsed.portraitCropZoom, 100);
  assert.equal(parsed.portraitAspectRatio, "4 / 5");
  assert.equal(profileInput.safeParse({ ...profile, portraitCropZoom: 301 }).success, false);
});
