ALTER TABLE "ProjectMedia" ADD COLUMN "cropZoom" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD COLUMN "focalX" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD COLUMN "focalY" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD COLUMN "aspectRatio" text DEFAULT '4 / 3' NOT NULL;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD COLUMN "displayWidth" integer;--> statement-breakpoint
ALTER TABLE "ProjectMedia" ADD COLUMN "displayHeight" integer;--> statement-breakpoint
ALTER TABLE "SiteProfile" ADD COLUMN "portraitCropZoom" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "SiteProfile" ADD COLUMN "portraitFocalX" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "SiteProfile" ADD COLUMN "portraitFocalY" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "SiteProfile" ADD COLUMN "portraitAspectRatio" text DEFAULT '4 / 5' NOT NULL;--> statement-breakpoint
ALTER TABLE "SiteProfile" ADD COLUMN "portraitDisplayWidth" integer;--> statement-breakpoint
ALTER TABLE "SiteProfile" ADD COLUMN "portraitDisplayHeight" integer;