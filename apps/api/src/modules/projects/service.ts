import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { projects, projectTechnologies, technologies } from "../../db/schema.js";
import type { ProjectInput } from "./schema.js";

const orderBy = [asc(projects.featuredRank), desc(projects.updatedAt)];
type DbWriter = Pick<Database, "insert" | "select">;

function projectRow(input: ProjectInput) {
  const { technologies: _technologies, startDate, endDate, ...data } = input;
  return {
    ...data,
    overview: data.overview ?? null,
    teamNote: data.teamNote ?? null,
    demoUrl: data.demoUrl ?? null,
    githubUrl: data.githubUrl ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    highlightImageUrl: data.highlightImageUrl ?? null,
    highlightImageAlt: data.highlightImageAlt ?? null,
    hoverPreviewImageUrl: data.hoverPreviewImageUrl ?? null,
    hoverPreviewImageAlt: data.hoverPreviewImageAlt ?? null,
    featuredRank: data.featuredRank ?? null,
    sortOrder: data.sortOrder ?? 0,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    seoImageUrl: data.seoImageUrl ?? null,
    canonicalUrl: data.canonicalUrl ?? null,
    isIndexed: data.isIndexed ?? true,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    updatedAt: new Date()
  };
}

async function setTechnologies(tx: DbWriter, projectId: string, names: string[]) {
  if (!names.length) return;
  await tx.insert(technologies).values(names.map((name) => ({ id: randomUUID(), name }))).onConflictDoNothing({ target: technologies.name });
  const rows = await tx.select({ id: technologies.id }).from(technologies).where(inArray(technologies.name, names));
  await tx.insert(projectTechnologies).values(rows.map(({ id }) => ({ projectId, technologyId: id })));
}

export function projectService(db: Database) {
  const find = (where?: ReturnType<typeof eq>) => db.query.projects.findMany({ where, orderBy, with: { technologies: { with: { technology: true } } } });
  const byId = async (id: string) => (await find(eq(projects.id, id)))[0];

  return {
    listPublic: () => db.query.projects.findMany({ where: eq(projects.status, "PUBLISHED"), orderBy: [asc(projects.featuredRank), desc(projects.createdAt)], with: { technologies: { with: { technology: true } } } }),
    listFeatured: () => db.query.projects.findMany({
      where: and(eq(projects.status, "PUBLISHED"), isNotNull(projects.featuredRank)),
      orderBy: [asc(projects.featuredRank), desc(projects.createdAt)],
      limit: 5,
      with: { technologies: { with: { technology: true } } }
    }),
    listAdmin: () => find(),
    async bySlug(slug: string, isAdmin = false) {
      const where = isAdmin ? eq(projects.slug, slug) : and(eq(projects.slug, slug), eq(projects.status, "PUBLISHED"));
      return (await db.query.projects.findMany({ where, limit: 1, with: { technologies: { with: { technology: true } } } }))[0];
    },
    async create(input: ProjectInput) {
      const id = randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(projects).values({ id, ...projectRow(input) });
        await setTechnologies(tx, id, input.technologies ?? []);
      });
      return byId(id);
    },
    async update(id: string, input: ProjectInput) {
      await db.transaction(async (tx) => {
        await tx.update(projects).set(projectRow(input)).where(eq(projects.id, id));
        await tx.delete(projectTechnologies).where(eq(projectTechnologies.projectId, id));
        await setTechnologies(tx, id, input.technologies ?? []);
      });
      return byId(id);
    },
    async updateFeatured(selection: { id: string; featuredRank: number }[]) {
      await db.transaction(async (tx) => {
        await tx.update(projects).set({ featuredRank: null, updatedAt: new Date() });
        for (const item of selection) await tx.update(projects).set({ featuredRank: item.featuredRank, updatedAt: new Date() }).where(eq(projects.id, item.id));
      });
      return find();
    },
    remove: (id: string) => db.delete(projects).where(eq(projects.id, id))
  };
}
