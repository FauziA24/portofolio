CREATE TYPE "public"."ContactKind" AS ENUM('EMAIL', 'PHONE', 'LINKEDIN', 'GITHUB', 'WEBSITE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."MediaKind" AS ENUM('IMAGE', 'VIDEO', 'MOCKUP', 'SCREENSHOT');--> statement-breakpoint
CREATE TYPE "public"."ResearchType" AS ENUM('PUBLICATION', 'PAPER', 'CERTIFICATION', 'EDUCATION', 'CREDENTIAL');--> statement-breakpoint
CREATE TABLE "AdminSession" (
	"id" text PRIMARY KEY NOT NULL,
	"adminUserId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AdminUser" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"role" text DEFAULT 'ADMIN' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ContactLink" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"url" text NOT NULL,
	"kind" "ContactKind" DEFAULT 'OTHER' NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"isVisible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MediaAsset" (
	"id" text PRIMARY KEY NOT NULL,
	"storageKey" text NOT NULL,
	"publicUrl" text NOT NULL,
	"originalName" text NOT NULL,
	"mimeType" text NOT NULL,
	"byteSize" integer NOT NULL,
	"width" integer,
	"height" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProfileFact" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProjectMedia" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"mediaAssetId" text,
	"url" text,
	"altText" text NOT NULL,
	"caption" text,
	"kind" "MediaKind" DEFAULT 'IMAGE' NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isHighlighted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ResearchItem" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "ResearchType" DEFAULT 'PUBLICATION' NOT NULL,
	"title" text NOT NULL,
	"issuerOrVenue" text NOT NULL,
	"dateLabel" text,
	"doi" text,
	"url" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SitePreference" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SiteProfile" (
	"id" text PRIMARY KEY NOT NULL,
	"displayName" text NOT NULL,
	"shortName" text NOT NULL,
	"role" text NOT NULL,
	"heroHeadline" text NOT NULL,
	"heroEmphasis" text,
	"heroBody" text NOT NULL,
	"heroPrimaryLabel" text NOT NULL,
	"heroPrimaryUrl" text NOT NULL,
	"heroSecondaryLabel" text,
	"heroSecondaryUrl" text,
	"aboutHeadline" text NOT NULL,
	"aboutBody" text NOT NULL,
	"portraitImageUrl" text,
	"portraitImageAlt" text,
	"footerLocation" text NOT NULL,
	"footerTimezone" text NOT NULL,
	"contentLanguage" text DEFAULT 'en' NOT NULL,
	"seoTitle" text,
	"seoDescription" text,
	"seoImageUrl" text,
	"canonicalUrl" text,
	"isIndexed" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "overview" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "highlightImageUrl" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "highlightImageAlt" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "hoverPreviewImageUrl" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "hoverPreviewImageAlt" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "sortOrder" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "seoTitle" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "seoDescription" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "seoImageUrl" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "canonicalUrl" text;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "isIndexed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_AdminUser_id_fk" FOREIGN KEY ("adminUserId") REFERENCES "public"."AdminUser"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_mediaAssetId_MediaAsset_id_fk" FOREIGN KEY ("mediaAssetId") REFERENCES "public"."MediaAsset"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession" USING btree ("tokenHash");--> statement-breakpoint
CREATE INDEX "AdminSession_adminUserId_idx" ON "AdminSession" USING btree ("adminUserId");--> statement-breakpoint
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession" USING btree ("expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser" USING btree ("email");--> statement-breakpoint
CREATE INDEX "ContactLink_visible_sortOrder_idx" ON "ContactLink" USING btree ("isVisible","sortOrder");--> statement-breakpoint
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset" USING btree ("storageKey");--> statement-breakpoint
CREATE INDEX "ProfileFact_visible_sortOrder_idx" ON "ProfileFact" USING btree ("isVisible","sortOrder");--> statement-breakpoint
CREATE INDEX "ProjectMedia_project_sortOrder_idx" ON "ProjectMedia" USING btree ("projectId","sortOrder");--> statement-breakpoint
CREATE INDEX "ResearchItem_visible_sortOrder_idx" ON "ResearchItem" USING btree ("isVisible","sortOrder");--> statement-breakpoint
CREATE UNIQUE INDEX "SitePreference_key_key" ON "SitePreference" USING btree ("key");--> statement-breakpoint
CREATE INDEX "Project_status_isIndexed_idx" ON "Project" USING btree ("status","isIndexed");