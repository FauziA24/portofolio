DROP INDEX "Project_status_featuredRank_idx";--> statement-breakpoint
DROP INDEX "Project_status_isIndexed_idx";--> statement-breakpoint
DROP INDEX "Project_public_list_idx";--> statement-breakpoint
CREATE INDEX "Project_public_list_idx" ON "Project" USING btree ("status","featuredRank","createdAt" DESC NULLS LAST);