DO $$ BEGIN
 CREATE TYPE "public"."DemoStatus" AS ENUM('LIVE', 'COMING_SOON', 'PRIVATE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ProjectStatus" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProjectTechnology" (
	"projectId" text NOT NULL,
	"technologyId" text NOT NULL,
	CONSTRAINT "ProjectTechnology_pkey" PRIMARY KEY("projectId","technologyId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Project" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"challenge" text NOT NULL,
	"contribution" text NOT NULL,
	"solution" text NOT NULL,
	"role" text NOT NULL,
	"teamNote" text,
	"startDate" timestamp (3),
	"endDate" timestamp (3),
	"status" "ProjectStatus" DEFAULT 'DRAFT' NOT NULL,
	"demoStatus" "DemoStatus" DEFAULT 'COMING_SOON' NOT NULL,
	"demoUrl" text,
	"githubUrl" text,
	"coverImageUrl" text,
	"featuredRank" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Technology" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"ProjectTechnology"'::regclass AND conname IN ('ProjectTechnology_projectId_fkey', 'ProjectTechnology_projectId_Project_id_fk')) THEN
  ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"ProjectTechnology"'::regclass AND conname IN ('ProjectTechnology_technologyId_fkey', 'ProjectTechnology_technologyId_Technology_id_fk')) THEN
  ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_technologyId_Technology_id_fk" FOREIGN KEY ("technologyId") REFERENCES "public"."Technology"("id") ON DELETE cascade ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Project_status_featuredRank_idx" ON "Project" USING btree ("status","featuredRank");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Technology_name_key" ON "Technology" USING btree ("name");
