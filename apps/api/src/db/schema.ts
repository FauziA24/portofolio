import { relations } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("ProjectStatus", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const demoStatus = pgEnum("DemoStatus", ["LIVE", "COMING_SOON", "PRIVATE", "ARCHIVED"]);
export const contactKind = pgEnum("ContactKind", ["EMAIL", "PHONE", "LINKEDIN", "GITHUB", "WEBSITE", "OTHER"]);
export const researchType = pgEnum("ResearchType", ["PUBLICATION", "PAPER", "CERTIFICATION", "EDUCATION", "CREDENTIAL"]);
export const mediaKind = pgEnum("MediaKind", ["IMAGE", "VIDEO", "MOCKUP", "SCREENSHOT"]);

export const projects = pgTable("Project", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  overview: text("overview"),
  challenge: text("challenge").notNull(),
  contribution: text("contribution").notNull(),
  solution: text("solution").notNull(),
  role: text("role").notNull(),
  teamNote: text("teamNote"),
  startDate: timestamp("startDate", { mode: "date", precision: 3 }),
  endDate: timestamp("endDate", { mode: "date", precision: 3 }),
  status: projectStatus("status").notNull().default("DRAFT"),
  demoStatus: demoStatus("demoStatus").notNull().default("COMING_SOON"),
  demoUrl: text("demoUrl"),
  githubUrl: text("githubUrl"),
  coverImageUrl: text("coverImageUrl"),
  highlightImageUrl: text("highlightImageUrl"),
  highlightImageAlt: text("highlightImageAlt"),
  hoverPreviewImageUrl: text("hoverPreviewImageUrl"),
  hoverPreviewImageAlt: text("hoverPreviewImageAlt"),
  featuredRank: integer("featuredRank"),
  sortOrder: integer("sortOrder").notNull().default(0),
  seoTitle: text("seoTitle"),
  seoDescription: text("seoDescription"),
  seoImageUrl: text("seoImageUrl"),
  canonicalUrl: text("canonicalUrl"),
  isIndexed: boolean("isIndexed").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [
  uniqueIndex("Project_slug_key").on(table.slug),
  index("Project_public_list_idx").on(table.status, table.featuredRank, table.createdAt.desc()),
  index("Project_sitemap_idx").on(table.status, table.isIndexed, table.sortOrder, table.title)
]);

export const technologies = pgTable("Technology", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [uniqueIndex("Technology_name_key").on(table.name)]);

export const projectTechnologies = pgTable("ProjectTechnology", {
  projectId: text("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  technologyId: text("technologyId").notNull().references(() => technologies.id, { onDelete: "cascade" })
}, (table) => [primaryKey({ columns: [table.projectId, table.technologyId], name: "ProjectTechnology_pkey" })]);

export const adminUsers = pgTable("AdminUser", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("passwordHash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [uniqueIndex("AdminUser_email_key").on(table.email)]);

export const adminSessions = pgTable("AdminSession", {
  id: text("id").primaryKey(),
  adminUserId: text("adminUserId").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("tokenHash").notNull(),
  csrfTokenHash: text("csrfTokenHash").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [
  uniqueIndex("AdminSession_tokenHash_key").on(table.tokenHash),
  index("AdminSession_adminUserId_idx").on(table.adminUserId),
  index("AdminSession_expiresAt_idx").on(table.expiresAt)
]);

export const siteProfiles = pgTable("SiteProfile", {
  id: text("id").primaryKey(),
  displayName: text("displayName").notNull(),
  shortName: text("shortName").notNull(),
  role: text("role").notNull(),
  heroHeadline: text("heroHeadline").notNull(),
  heroEmphasis: text("heroEmphasis"),
  heroBody: text("heroBody").notNull(),
  heroPrimaryLabel: text("heroPrimaryLabel").notNull(),
  heroPrimaryUrl: text("heroPrimaryUrl").notNull(),
  heroSecondaryLabel: text("heroSecondaryLabel"),
  heroSecondaryUrl: text("heroSecondaryUrl"),
  aboutHeadline: text("aboutHeadline").notNull(),
  aboutBody: text("aboutBody").notNull(),
  portraitImageUrl: text("portraitImageUrl"),
  portraitImageAlt: text("portraitImageAlt"),
  portraitCropZoom: integer("portraitCropZoom").notNull().default(100),
  portraitFocalX: integer("portraitFocalX").notNull().default(50),
  portraitFocalY: integer("portraitFocalY").notNull().default(50),
  portraitAspectRatio: text("portraitAspectRatio").notNull().default("4 / 5"),
  portraitDisplayWidth: integer("portraitDisplayWidth"),
  portraitDisplayHeight: integer("portraitDisplayHeight"),
  footerLocation: text("footerLocation").notNull(),
  footerTimezone: text("footerTimezone").notNull(),
  contentLanguage: text("contentLanguage").notNull().default("en"),
  seoTitle: text("seoTitle"),
  seoDescription: text("seoDescription"),
  seoImageUrl: text("seoImageUrl"),
  canonicalUrl: text("canonicalUrl"),
  isIndexed: boolean("isIndexed").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
});

export const profileFacts = pgTable("ProfileFact", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
  isVisible: boolean("isVisible").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [
  index("ProfileFact_visible_sortOrder_idx").on(table.isVisible, table.sortOrder)
]);

export const contactLinks = pgTable("ContactLink", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  url: text("url").notNull(),
  kind: contactKind("kind").notNull().default("OTHER"),
  sortOrder: integer("sortOrder").notNull().default(0),
  isPrimary: boolean("isPrimary").notNull().default(false),
  isVisible: boolean("isVisible").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [
  index("ContactLink_visible_sortOrder_idx").on(table.isVisible, table.sortOrder)
]);

export const researchItems = pgTable("ResearchItem", {
  id: text("id").primaryKey(),
  type: researchType("type").notNull().default("PUBLICATION"),
  title: text("title").notNull(),
  issuerOrVenue: text("issuerOrVenue").notNull(),
  dateLabel: text("dateLabel"),
  doi: text("doi"),
  url: text("url"),
  sortOrder: integer("sortOrder").notNull().default(0),
  isVisible: boolean("isVisible").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [
  index("ResearchItem_visible_sortOrder_idx").on(table.isVisible, table.sortOrder)
]);

export const mediaAssets = pgTable("MediaAsset", {
  id: text("id").primaryKey(),
  storageKey: text("storageKey").notNull(),
  publicUrl: text("publicUrl").notNull(),
  originalName: text("originalName").notNull(),
  mimeType: text("mimeType").notNull(),
  byteSize: integer("byteSize").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [uniqueIndex("MediaAsset_storageKey_key").on(table.storageKey)]);

export const projectMedia = pgTable("ProjectMedia", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  mediaAssetId: text("mediaAssetId").references(() => mediaAssets.id, { onDelete: "restrict" }),
  url: text("url"),
  altText: text("altText").notNull(),
  caption: text("caption"),
  kind: mediaKind("kind").notNull().default("IMAGE"),
  sortOrder: integer("sortOrder").notNull().default(0),
  isHighlighted: boolean("isHighlighted").notNull().default(false),
  cropZoom: integer("cropZoom").notNull().default(100),
  focalX: integer("focalX").notNull().default(50),
  focalY: integer("focalY").notNull().default(50),
  aspectRatio: text("aspectRatio").notNull().default("4 / 3"),
  displayWidth: integer("displayWidth"),
  displayHeight: integer("displayHeight"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [
  index("ProjectMedia_project_sortOrder_idx").on(table.projectId, table.sortOrder),
  index("ProjectMedia_mediaAssetId_idx").on(table.mediaAssetId)
]);

export const sitePreferences = pgTable("SitePreference", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull().defaultNow()
}, (table) => [uniqueIndex("SitePreference_key_key").on(table.key)]);

export const projectsRelations = relations(projects, ({ many }) => ({
  technologies: many(projectTechnologies),
  media: many(projectMedia)
}));
export const technologiesRelations = relations(technologies, ({ many }) => ({ projects: many(projectTechnologies) }));
export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, { fields: [projectTechnologies.projectId], references: [projects.id] }),
  technology: one(technologies, { fields: [projectTechnologies.technologyId], references: [technologies.id] })
}));
export const adminUsersRelations = relations(adminUsers, ({ many }) => ({ sessions: many(adminSessions) }));
export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, { fields: [adminSessions.adminUserId], references: [adminUsers.id] })
}));
export const mediaAssetsRelations = relations(mediaAssets, ({ many }) => ({ projectMedia: many(projectMedia) }));
export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, { fields: [projectMedia.projectId], references: [projects.id] }),
  mediaAsset: one(mediaAssets, { fields: [projectMedia.mediaAssetId], references: [mediaAssets.id] })
}));
