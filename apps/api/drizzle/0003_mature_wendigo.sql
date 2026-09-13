CREATE INDEX "ProjectMedia_mediaAssetId_idx" ON "ProjectMedia" USING btree ("mediaAssetId");--> statement-breakpoint
CREATE INDEX "Project_public_list_idx" ON "Project" USING btree ("status","featuredRank","createdAt");--> statement-breakpoint
CREATE INDEX "Project_sitemap_idx" ON "Project" USING btree ("status","isIndexed","sortOrder","title");