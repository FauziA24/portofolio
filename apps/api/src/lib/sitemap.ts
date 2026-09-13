import { and, asc, eq } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { projects, sitePreferences, siteProfiles } from "../db/schema.js";

const xml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[char]!));

export async function publicSiteUrl(db: Database, fallbackUrl: string) {
  const setting = await db.query.sitePreferences.findFirst({ where: eq(sitePreferences.key, "siteUrl") });
  const profile = await db.query.siteProfiles.findFirst({ where: eq(siteProfiles.id, "default") });
  return (setting?.value || profile?.canonicalUrl || fallbackUrl).replace(/\/+$/, "");
}

export async function sitemapXml(db: Database, fallbackUrl: string) {
  const baseUrl = await publicSiteUrl(db, fallbackUrl);
  const rows = await db.query.projects.findMany({
    where: and(eq(projects.status, "PUBLISHED"), eq(projects.isIndexed, true)),
    orderBy: [asc(projects.sortOrder), asc(projects.title)]
  });
  const urls = [`${baseUrl}/`, ...rows.map((project) => project.canonicalUrl || `${baseUrl}/projects/${project.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${xml(url)}</loc></url>`).join("\n")}\n</urlset>`;
}

export async function robotsTxt(db: Database, fallbackUrl: string) {
  const baseUrl = await publicSiteUrl(db, fallbackUrl);
  const policy = (await db.query.sitePreferences.findFirst({ where: eq(sitePreferences.key, "robotsPolicy") }))?.value || "allow";
  return `User-agent: *\n${policy === "disallow" ? "Disallow: /" : "Allow: /"}\nSitemap: ${baseUrl}/sitemap.xml\n`;
}
