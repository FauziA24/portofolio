import type {
  ContactKind,
  ContactLink,
  ProfileFact,
  Project,
  ResearchItem,
  ResearchType,
  SiteProfile,
} from "../../types";

type ProjectForm = Record<string, string>;

const blankProject: ProjectForm = {
  title: "",
  slug: "",
  category: "",
  role: "Developer",
  teamNote: "",
  summary: "",
  overview: "",
  challenge: "",
  contribution: "",
  solution: "",
  status: "DRAFT",
  demoStatus: "COMING_SOON",
  demoUrl: "",
  githubUrl: "",
  coverImageUrl: "",
  highlightImageUrl: "",
  highlightImageAlt: "",
  hoverPreviewImageUrl: "",
  hoverPreviewImageAlt: "",
  featuredRank: "",
  sortOrder: "0",
  seoTitle: "",
  seoDescription: "",
  seoImageUrl: "",
  canonicalUrl: "",
  isIndexed: "true",
  startDate: "",
  endDate: "",
  technologies: "",
};
const blankProfile: SiteProfile = {
  id: "default",
  displayName: "",
  shortName: "",
  role: "",
  heroHeadline: "",
  heroBody: "",
  heroPrimaryLabel: "",
  heroPrimaryUrl: "",
  aboutHeadline: "",
  aboutBody: "",
  portraitCropZoom: 100,
  portraitFocalX: 50,
  portraitFocalY: 50,
  portraitAspectRatio: "4 / 5",
  footerLocation: "",
  footerTimezone: "Asia/Jakarta",
  contentLanguage: "en",
  isIndexed: true,
};
const blankFact: Omit<ProfileFact, "id"> = {
  label: "",
  value: "",
  sortOrder: 0,
  isVisible: true,
};
const blankResearch: Omit<ResearchItem, "id"> = {
  type: "PUBLICATION",
  title: "",
  issuerOrVenue: "",
  dateLabel: "",
  doi: "",
  url: "",
  sortOrder: 0,
  isVisible: true,
};
const blankContact: Omit<ContactLink, "id"> = {
  label: "",
  value: "",
  url: "",
  kind: "OTHER",
  sortOrder: 0,
  isPrimary: false,
  isVisible: true,
};
const researchTypes: ResearchType[] = [
  "PUBLICATION",
  "PAPER",
  "CERTIFICATION",
  "EDUCATION",
  "CREDENTIAL",
];
const contactKinds: ContactKind[] = [
  "EMAIL",
  "PHONE",
  "LINKEDIN",
  "GITHUB",
  "WEBSITE",
  "OTHER",
];

function fieldLabel(key: string) {
  const explicit: Record<string, string> = {
    teamNote: "Team note",
    demoStatus: "Demo status",
    demoUrl: "Demo URL",
    githubUrl: "GitHub URL",
    coverImageUrl: "Cover image URL",
    featuredRank: "Featured rank",
    sortOrder: "Sort order",
    startDate: "Start date",
    endDate: "End date",
    seoTitle: "SEO title",
    seoDescription: "SEO description",
    seoImageUrl: "SEO image URL",
    canonicalUrl: "Canonical URL",
    isIndexed: "Indexed",
  };
  return (
    explicit[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())
  );
}

function projectToForm(project: Project): ProjectForm {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    role: project.role,
    teamNote: project.teamNote ?? "",
    summary: project.summary,
    overview: project.overview ?? "",
    challenge: project.challenge,
    contribution: project.contribution,
    solution: project.solution,
    status: project.status,
    demoStatus: project.demoStatus,
    demoUrl: project.demoUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    coverImageUrl: project.coverImageUrl ?? "",
    highlightImageUrl: project.highlightImageUrl ?? "",
    highlightImageAlt: project.highlightImageAlt ?? "",
    hoverPreviewImageUrl: project.hoverPreviewImageUrl ?? "",
    hoverPreviewImageAlt: project.hoverPreviewImageAlt ?? "",
    featuredRank:
      project.featuredRank == null ? "" : String(project.featuredRank),
    sortOrder: String(project.sortOrder ?? 0),
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
    seoImageUrl: project.seoImageUrl ?? "",
    canonicalUrl: project.canonicalUrl ?? "",
    isIndexed: project.isIndexed === false ? "false" : "true",
    startDate: project.startDate?.slice(0, 10) ?? "",
    endDate: project.endDate?.slice(0, 10) ?? "",
    technologies: project.technologies
      .map(({ technology }) => technology.name)
      .join(", "),
  };
}

function toProjectPayload(form: ProjectForm) {
  return {
    ...form,
    featuredRank: form.featuredRank ? Number(form.featuredRank) : null,
    sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
    teamNote: form.teamNote || null,
    overview: form.overview || null,
    demoUrl: form.demoUrl || null,
    githubUrl: form.githubUrl || null,
    coverImageUrl: form.coverImageUrl || null,
    highlightImageUrl: form.highlightImageUrl || null,
    highlightImageAlt: form.highlightImageAlt || null,
    hoverPreviewImageUrl: form.hoverPreviewImageUrl || null,
    hoverPreviewImageAlt: form.hoverPreviewImageAlt || null,
    seoTitle: form.seoTitle || null,
    seoDescription: form.seoDescription || null,
    seoImageUrl: form.seoImageUrl || null,
    canonicalUrl: form.canonicalUrl || null,
    isIndexed: form.isIndexed !== "false",
    startDate: form.startDate || null,
    endDate: form.endDate || null,
    technologies: form.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function projectFormToProject(form: ProjectForm): Project {
  const { technologies, ...project } = toProjectPayload(form);
  return {
    ...project,
    id: form.id || "preview",
    slug: form.slug,
    title: form.title,
    category: form.category,
    role: form.role,
    summary: form.summary,
    challenge: form.challenge,
    contribution: form.contribution,
    solution: form.solution,
    status: form.status as Project["status"],
    demoStatus: form.demoStatus as Project["demoStatus"],
    technologies: technologies.map((name) => ({
      technology: { id: name, name },
    })),
  };
}

export type { ProjectForm };
export {
  blankProject,
  blankProfile,
  blankFact,
  blankResearch,
  blankContact,
  researchTypes,
  contactKinds,
  fieldLabel,
  projectToForm,
  projectFormToProject,
  toProjectPayload,
};
