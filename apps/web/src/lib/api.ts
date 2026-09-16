import type {
  ContactLink,
  DashboardSummary,
  MediaAsset,
  ProjectMedia,
  ProfileFact,
  Project,
  ResearchItem,
  SiteProfile,
} from "../types";

const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const apiUrl =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? `${window.location.protocol}//${window.location.hostname}:3001` : "");
let csrfToken = "";
const request = (path: string, init?: RequestInit) =>
  fetch(`${apiUrl}/api${path}`, { cache: "no-store", ...init }).then(async (response) => {
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => null))?.message ?? "Request failed",
      );
    return response.status === 204 ? null : response.json();
  });
const adminRequest = async (path: string, init?: RequestInit) => {
  const method = init?.method?.toUpperCase();
  const headers = new Headers(init?.headers);
  if (csrfToken && method && method !== "GET")
    headers.set("x-csrf-token", csrfToken);
  const data = await request(path, {
    ...init,
    headers,
    credentials: "include",
  });
  if (data?.csrfToken) csrfToken = data.csrfToken;
  return data;
};
const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

type AdminProjectInput = Omit<Partial<Project>, "technologies"> & {
  technologies: string[];
};
const profilePayload = (profile: SiteProfile) => {
  const {
    displayName,
    shortName,
    role,
    heroHeadline,
    heroEmphasis,
    heroBody,
    heroPrimaryLabel,
    heroPrimaryUrl,
    heroSecondaryLabel,
    heroSecondaryUrl,
    aboutHeadline,
    aboutBody,
    portraitImageUrl,
    portraitImageAlt,
    portraitCropZoom,
    portraitFocalX,
    portraitFocalY,
    portraitAspectRatio,
    portraitDisplayWidth,
    portraitDisplayHeight,
    footerLocation,
    footerTimezone,
    contentLanguage,
    seoTitle,
    seoDescription,
    seoImageUrl,
    canonicalUrl,
    isIndexed,
  } = profile;
  return {
    displayName,
    shortName,
    role,
    heroHeadline,
    heroEmphasis,
    heroBody,
    heroPrimaryLabel,
    heroPrimaryUrl,
    heroSecondaryLabel,
    heroSecondaryUrl,
    aboutHeadline,
    aboutBody,
    portraitImageUrl,
    portraitImageAlt,
    portraitCropZoom,
    portraitFocalX,
    portraitFocalY,
    portraitAspectRatio,
    portraitDisplayWidth,
    portraitDisplayHeight,
    footerLocation,
    footerTimezone,
    contentLanguage,
    seoTitle,
    seoDescription,
    seoImageUrl,
    canonicalUrl,
    isIndexed,
  };
};
const factPayload = (fact: Omit<ProfileFact, "id">) => ({
  label: fact.label,
  value: fact.value,
  sortOrder: fact.sortOrder,
  isVisible: fact.isVisible,
});
const researchPayload = (item: Omit<ResearchItem, "id">) => ({
  type: item.type,
  title: item.title,
  issuerOrVenue: item.issuerOrVenue,
  dateLabel: item.dateLabel || null,
  doi: item.doi || null,
  url: item.url || null,
  sortOrder: item.sortOrder,
  isVisible: item.isVisible,
});
const contactPayload = (link: Omit<ContactLink, "id">) => ({
  label: link.label,
  value: link.value,
  url: link.url,
  kind: link.kind,
  sortOrder: link.sortOrder,
  isPrimary: link.isPrimary,
  isVisible: link.isVisible,
});
const projectMediaPayload = (
  item: Omit<ProjectMedia, "id" | "projectId" | "mediaAsset">,
) => ({
  mediaAssetId: item.mediaAssetId || null,
  url: item.mediaAssetId ? null : item.url || null,
  altText: item.altText,
  caption: item.caption || null,
  kind: item.kind,
  sortOrder: item.sortOrder,
  isHighlighted: item.isHighlighted,
  cropZoom: item.cropZoom,
  focalX: item.focalX,
  focalY: item.focalY,
  aspectRatio: item.aspectRatio,
  displayWidth: item.displayWidth || null,
  displayHeight: item.displayHeight || null,
});
export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
export const fileToBase64 = async (file: File) =>
  (await fileToDataUrl(file)).split(",")[1] ?? "";

export const api = {
  publicProjects: () => request("/projects") as Promise<Project[]>,
  featuredProjects: () => request("/projects/featured") as Promise<Project[]>,
  project: (slug: string) => request(`/projects/${slug}`) as Promise<Project>,
  profile: () => request("/profile") as Promise<SiteProfile>,
  profileFacts: () => request("/profile/facts") as Promise<ProfileFact[]>,
  research: () => request("/research") as Promise<ResearchItem[]>,
  contactLinks: () => request("/contact-links") as Promise<ContactLink[]>,
  site: () =>
    request("/site") as Promise<{
      profile: SiteProfile | null;
      settings: Record<string, string>;
    }>,
  projectMedia: (slug: string) =>
    request(`/projects/${slug}/media`) as Promise<ProjectMedia[]>,
  adminLogin: (credentials: { email: string; password: string }) =>
    adminRequest("/admin/login", jsonInit("POST", credentials)) as Promise<{
      email: string;
      csrfToken: string;
    }>,
  adminLogout: () => adminRequest("/admin/logout", { method: "POST" }),
  adminMe: () =>
    adminRequest("/admin/me") as Promise<{ email: string; csrfToken: string }>,
  adminDashboard: () => adminRequest("/admin/dashboard") as Promise<DashboardSummary>,
  adminProfile: () => adminRequest("/admin/profile") as Promise<SiteProfile>,
  saveProfile: (profile: SiteProfile) =>
    adminRequest(
      "/admin/profile",
      jsonInit("PUT", profilePayload(profile)),
    ) as Promise<SiteProfile>,
  adminProfileFacts: () =>
    adminRequest("/admin/profile/facts") as Promise<ProfileFact[]>,
  createProfileFact: (fact: Omit<ProfileFact, "id">) =>
    adminRequest(
      "/admin/profile/facts",
      jsonInit("POST", factPayload(fact)),
    ) as Promise<ProfileFact>,
  saveProfileFact: (fact: ProfileFact) =>
    adminRequest(
      `/admin/profile/facts/${fact.id}`,
      jsonInit("PUT", factPayload(fact)),
    ) as Promise<ProfileFact>,
  deleteProfileFact: (id: string) =>
    adminRequest(`/admin/profile/facts/${id}`, { method: "DELETE" }),
  reorderProfileFacts: (facts: Pick<ProfileFact, "id" | "sortOrder">[]) =>
    adminRequest(
      "/admin/profile/facts/reorder",
      jsonInit("PATCH", facts),
    ) as Promise<ProfileFact[]>,
  adminResearch: () =>
    adminRequest("/admin/research") as Promise<ResearchItem[]>,
  createResearch: (item: Omit<ResearchItem, "id">) =>
    adminRequest(
      "/admin/research",
      jsonInit("POST", researchPayload(item)),
    ) as Promise<ResearchItem>,
  saveResearch: (item: ResearchItem) =>
    adminRequest(
      `/admin/research/${item.id}`,
      jsonInit("PUT", researchPayload(item)),
    ) as Promise<ResearchItem>,
  deleteResearch: (id: string) =>
    adminRequest(`/admin/research/${id}`, { method: "DELETE" }),
  reorderResearch: (items: Pick<ResearchItem, "id" | "sortOrder">[]) =>
    adminRequest(
      "/admin/research/reorder",
      jsonInit("PATCH", items),
    ) as Promise<ResearchItem[]>,
  adminContactLinks: () =>
    adminRequest("/admin/contact-links") as Promise<ContactLink[]>,
  createContactLink: (link: Omit<ContactLink, "id">) =>
    adminRequest(
      "/admin/contact-links",
      jsonInit("POST", contactPayload(link)),
    ) as Promise<ContactLink>,
  saveContactLink: (link: ContactLink) =>
    adminRequest(
      `/admin/contact-links/${link.id}`,
      jsonInit("PUT", contactPayload(link)),
    ) as Promise<ContactLink>,
  deleteContactLink: (id: string) =>
    adminRequest(`/admin/contact-links/${id}`, { method: "DELETE" }),
  reorderContactLinks: (links: Pick<ContactLink, "id" | "sortOrder">[]) =>
    adminRequest(
      "/admin/contact-links/reorder",
      jsonInit("PATCH", links),
    ) as Promise<ContactLink[]>,
  adminSettings: () =>
    adminRequest("/admin/settings") as Promise<Record<string, string>>,
  saveSettings: (settings: Record<string, string>) =>
    adminRequest("/admin/settings", jsonInit("PUT", settings)) as Promise<
      Record<string, string>
    >,
  adminMedia: () => adminRequest("/admin/media") as Promise<MediaAsset[]>,
  uploadMedia: (payload: {
    fileName: string;
    mimeType: string;
    dataBase64: string;
    scope: string;
    projectId?: string | null;
  }) =>
    adminRequest(
      "/admin/media",
      jsonInit("POST", payload),
    ) as Promise<MediaAsset>,
  deleteMedia: (id: string) =>
    adminRequest(`/admin/media/${id}`, { method: "DELETE" }),
  adminProjectMedia: (projectId: string) =>
    adminRequest(`/admin/projects/${projectId}/media`) as Promise<
      ProjectMedia[]
    >,
  createProjectMedia: (
    projectId: string,
    item: Omit<ProjectMedia, "id" | "projectId" | "mediaAsset">,
  ) =>
    adminRequest(
      `/admin/projects/${projectId}/media`,
      jsonInit("POST", projectMediaPayload(item)),
    ) as Promise<ProjectMedia>,
  saveProjectMedia: (item: ProjectMedia) =>
    adminRequest(
      `/admin/projects/${item.projectId}/media/${item.id}`,
      jsonInit("PUT", projectMediaPayload(item)),
    ) as Promise<ProjectMedia>,
  deleteProjectMedia: (projectId: string, id: string) =>
    adminRequest(`/admin/projects/${projectId}/media/${id}`, {
      method: "DELETE",
    }),
  reorderProjectMedia: (
    projectId: string,
    rows: Pick<ProjectMedia, "id" | "sortOrder">[],
  ) =>
    adminRequest(
      `/admin/projects/${projectId}/media/reorder`,
      jsonInit("PATCH", rows),
    ) as Promise<ProjectMedia[]>,
  adminProjects: () => adminRequest("/admin/projects") as Promise<Project[]>,
  saveFeaturedProjects: (selection: Pick<Project, "id" | "featuredRank">[]) =>
    adminRequest(
      "/admin/projects/featured",
      jsonInit("PATCH", selection),
    ) as Promise<Project[]>,
  saveProject: (project: AdminProjectInput) => {
    const { id, ...body } = project;
    return adminRequest(
      id ? `/admin/projects/${id}` : "/admin/projects",
      jsonInit(id ? "PUT" : "POST", body),
    ) as Promise<Project>;
  },
  deleteProject: (id: string) =>
    adminRequest(`/admin/projects/${id}`, { method: "DELETE" }),
};
