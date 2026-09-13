const error = { type: "object", properties: { message: { type: "string" } }, required: ["message"] } as const;
const params = (name: "id" | "slug") => ({ type: "object", properties: { [name]: { type: "string" } }, required: [name] });
const auth = { security: [{ adminSession: [], csrfToken: [] }], tags: ["admin"] } as const;
const adminSession = {
  type: "object",
  properties: { email: { type: "string", format: "email" }, csrfToken: { type: "string" } },
  required: ["email", "csrfToken"]
} as const;

const profileBody = {
  type: "object",
  additionalProperties: false,
  required: ["displayName", "shortName", "role", "heroHeadline", "heroBody", "heroPrimaryLabel", "heroPrimaryUrl", "aboutHeadline", "aboutBody", "footerLocation", "footerTimezone"],
  properties: {
    displayName: { type: "string", minLength: 2 },
    shortName: { type: "string", minLength: 1 },
    role: { type: "string", minLength: 2 },
    heroHeadline: { type: "string", minLength: 5 },
    heroEmphasis: { type: ["string", "null"] },
    heroBody: { type: "string", minLength: 10 },
    heroPrimaryLabel: { type: "string", minLength: 2 },
    heroPrimaryUrl: { type: "string", minLength: 1 },
    heroSecondaryLabel: { type: ["string", "null"] },
    heroSecondaryUrl: { type: ["string", "null"] },
    aboutHeadline: { type: "string", minLength: 5 },
    aboutBody: { type: "string", minLength: 10 },
    portraitImageUrl: { type: ["string", "null"] },
    portraitImageAlt: { type: ["string", "null"] },
    footerLocation: { type: "string", minLength: 2 },
    footerTimezone: { type: "string", minLength: 2 },
    contentLanguage: { type: "string", enum: ["en", "id"] },
    seoTitle: { type: ["string", "null"] },
    seoDescription: { type: ["string", "null"] },
    seoImageUrl: { type: ["string", "null"] },
    canonicalUrl: { type: ["string", "null"] },
    isIndexed: { type: "boolean" }
  }
} as const;
const profileFact = {
  type: "object",
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    value: { type: "string" },
    sortOrder: { type: "integer" },
    isVisible: { type: "boolean" }
  },
  required: ["id", "label", "value", "sortOrder", "isVisible"]
} as const;
const profileFactBody = {
  type: "object",
  additionalProperties: false,
  required: ["label", "value"],
  properties: {
    label: { type: "string", minLength: 1, maxLength: 80 },
    value: { type: "string", minLength: 1, maxLength: 200 },
    sortOrder: { type: "integer", minimum: 0, default: 0 },
    isVisible: { type: "boolean", default: true }
  }
} as const;
const profileFactReorderBody = {
  type: "array",
  minItems: 1,
  items: {
    type: "object",
    required: ["id", "sortOrder"],
    properties: { id: { type: "string" }, sortOrder: { type: "integer", minimum: 0 } }
  }
} as const;
const researchItem = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string", enum: ["PUBLICATION", "PAPER", "CERTIFICATION", "EDUCATION", "CREDENTIAL"] },
    title: { type: "string" },
    issuerOrVenue: { type: "string" },
    dateLabel: { type: ["string", "null"] },
    doi: { type: ["string", "null"] },
    url: { type: ["string", "null"] },
    sortOrder: { type: "integer" },
    isVisible: { type: "boolean" }
  },
  required: ["id", "type", "title", "issuerOrVenue", "sortOrder", "isVisible"]
} as const;
const researchBody = {
  type: "object",
  additionalProperties: false,
  required: ["type", "title", "issuerOrVenue"],
  properties: {
    type: { type: "string", enum: ["PUBLICATION", "PAPER", "CERTIFICATION", "EDUCATION", "CREDENTIAL"], default: "PUBLICATION" },
    title: { type: "string", minLength: 2, maxLength: 180 },
    issuerOrVenue: { type: "string", minLength: 1, maxLength: 120 },
    dateLabel: { type: ["string", "null"], maxLength: 80 },
    doi: { type: ["string", "null"], maxLength: 120 },
    url: { type: ["string", "null"], format: "uri" },
    sortOrder: { type: "integer", minimum: 0, default: 0 },
    isVisible: { type: "boolean", default: true }
  }
} as const;
const reorderBody = {
  type: "array",
  minItems: 1,
  items: {
    type: "object",
    required: ["id", "sortOrder"],
    properties: { id: { type: "string" }, sortOrder: { type: "integer", minimum: 0 } }
  }
} as const;
const contactLink = {
  type: "object",
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    value: { type: "string" },
    url: { type: "string" },
    kind: { type: "string", enum: ["EMAIL", "PHONE", "LINKEDIN", "GITHUB", "WEBSITE", "OTHER"] },
    sortOrder: { type: "integer" },
    isPrimary: { type: "boolean" },
    isVisible: { type: "boolean" }
  },
  required: ["id", "label", "value", "url", "kind", "sortOrder", "isPrimary", "isVisible"]
} as const;
const contactBody = {
  type: "object",
  additionalProperties: false,
  required: ["label", "value", "url", "kind"],
  properties: {
    label: { type: "string", minLength: 1, maxLength: 80 },
    value: { type: "string", minLength: 1, maxLength: 200 },
    url: { type: "string", minLength: 1, maxLength: 300 },
    kind: { type: "string", enum: ["EMAIL", "PHONE", "LINKEDIN", "GITHUB", "WEBSITE", "OTHER"], default: "OTHER" },
    sortOrder: { type: "integer", minimum: 0, default: 0 },
    isPrimary: { type: "boolean", default: false },
    isVisible: { type: "boolean", default: true }
  }
} as const;

const projectBody = {
  type: "object",
  additionalProperties: false,
  required: ["title", "slug", "category", "role", "summary", "challenge", "contribution", "solution"],
  properties: {
    title: { type: "string", minLength: 2, maxLength: 120 },
    slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    category: { type: "string" }, role: { type: "string" }, teamNote: { type: ["string", "null"] },
    summary: { type: "string" }, overview: { type: ["string", "null"] }, challenge: { type: "string" }, contribution: { type: "string" }, solution: { type: "string" },
    status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
    demoStatus: { type: "string", enum: ["LIVE", "COMING_SOON", "PRIVATE", "ARCHIVED"], default: "COMING_SOON" },
    demoUrl: { type: ["string", "null"], format: "uri" }, githubUrl: { type: ["string", "null"], format: "uri" }, coverImageUrl: { type: ["string", "null"], format: "uri" },
    highlightImageUrl: { type: ["string", "null"], format: "uri" }, highlightImageAlt: { type: ["string", "null"] },
    hoverPreviewImageUrl: { type: ["string", "null"], format: "uri" }, hoverPreviewImageAlt: { type: ["string", "null"] },
    featuredRank: { type: ["integer", "null"], minimum: 1 },
    sortOrder: { type: "integer", minimum: 0, default: 0 },
    seoTitle: { type: ["string", "null"] }, seoDescription: { type: ["string", "null"] }, seoImageUrl: { type: ["string", "null"], format: "uri" },
    canonicalUrl: { type: ["string", "null"], format: "uri" }, isIndexed: { type: "boolean", default: true },
    startDate: { type: ["string", "null"], format: "date" }, endDate: { type: ["string", "null"], format: "date" },
    technologies: { type: "array", maxItems: 12, items: { type: "string" }, default: [] }
  }
} as const;
const featuredBody = {
  type: "array",
  maxItems: 5,
  items: {
    type: "object",
    additionalProperties: false,
    required: ["id", "featuredRank"],
    properties: {
      id: { type: "string" },
      featuredRank: { type: "integer", minimum: 1, maximum: 5 }
    }
  }
} as const;
const settingsBody = { type: "object", additionalProperties: { type: "string", maxLength: 500 } } as const;
const mediaAsset = {
  type: "object",
  properties: {
    id: { type: "string" },
    storageKey: { type: "string" },
    publicUrl: { type: "string", format: "uri" },
    originalName: { type: "string" },
    mimeType: { type: "string" },
    byteSize: { type: "integer" },
    width: { type: ["integer", "null"] },
    height: { type: ["integer", "null"] }
  },
  required: ["id", "storageKey", "publicUrl", "originalName", "mimeType", "byteSize"]
} as const;
const mediaUploadBody = {
  type: "object",
  additionalProperties: false,
  required: ["fileName", "mimeType", "dataBase64", "scope"],
  properties: {
    fileName: { type: "string", minLength: 1, maxLength: 180 },
    mimeType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] },
    dataBase64: { type: "string", minLength: 1 },
    scope: { type: "string", enum: ["projects", "profile", "research"], default: "projects" },
    projectId: { type: ["string", "null"] }
  }
} as const;
const projectMediaItem = {
  type: "object",
  properties: {
    id: { type: "string" },
    projectId: { type: "string" },
    mediaAssetId: { type: ["string", "null"] },
    url: { type: ["string", "null"], format: "uri" },
    altText: { type: "string" },
    caption: { type: ["string", "null"] },
    kind: { type: "string", enum: ["IMAGE", "VIDEO", "MOCKUP", "SCREENSHOT"] },
    sortOrder: { type: "integer" },
    isHighlighted: { type: "boolean" }
  },
  required: ["id", "projectId", "altText", "kind", "sortOrder", "isHighlighted"]
} as const;
const projectMediaBody = {
  type: "object",
  additionalProperties: false,
  required: ["altText"],
  properties: {
    mediaAssetId: { type: ["string", "null"] },
    url: { type: ["string", "null"], format: "uri" },
    altText: { type: "string", minLength: 1, maxLength: 180 },
    caption: { type: ["string", "null"], maxLength: 240 },
    kind: { type: "string", enum: ["IMAGE", "VIDEO", "MOCKUP", "SCREENSHOT"], default: "IMAGE" },
    sortOrder: { type: "integer", minimum: 0, default: 0 },
    isHighlighted: { type: "boolean", default: false }
  }
} as const;

export const apiSchemas = {
  listPublic: { tags: ["projects"], summary: "List published projects" },
  featuredProjects: { tags: ["projects"], summary: "List selected work projects" },
  bySlug: { tags: ["projects"], summary: "Get a published project", params: params("slug"), response: { 404: error } },
  profile: { tags: ["profile"], summary: "Get public profile and homepage content", response: { 404: error } },
  site: { tags: ["system"], summary: "Get public site profile and settings" },
  adminProfile: { ...auth, summary: "Get admin profile and homepage content", response: { 401: error, 404: error } },
  updateProfile: { ...auth, summary: "Update profile and homepage content", body: profileBody, response: { 401: error } },
  profileFacts: { tags: ["profile"], summary: "List visible profile facts", response: { 200: { type: "array", items: profileFact } } },
  adminProfileFacts: { ...auth, summary: "List all profile facts", response: { 200: { type: "array", items: profileFact }, 401: error } },
  createProfileFact: { ...auth, summary: "Create a profile fact", body: profileFactBody, response: { 201: profileFact, 401: error } },
  updateProfileFact: { ...auth, summary: "Update a profile fact", params: params("id"), body: profileFactBody, response: { 401: error, 404: error } },
  removeProfileFact: { ...auth, summary: "Delete a profile fact", params: params("id"), response: { 204: { type: "null" }, 401: error, 404: error } },
  reorderProfileFacts: { ...auth, summary: "Reorder profile facts", body: profileFactReorderBody, response: { 200: { type: "array", items: profileFact }, 401: error } },
  research: { tags: ["research"], summary: "List visible research and credentials", response: { 200: { type: "array", items: researchItem } } },
  adminResearch: { ...auth, summary: "List all research and credentials", response: { 200: { type: "array", items: researchItem }, 401: error } },
  createResearch: { ...auth, summary: "Create a research or credential item", body: researchBody, response: { 201: researchItem, 401: error } },
  updateResearch: { ...auth, summary: "Update a research or credential item", params: params("id"), body: researchBody, response: { 401: error, 404: error } },
  removeResearch: { ...auth, summary: "Delete a research or credential item", params: params("id"), response: { 204: { type: "null" }, 401: error, 404: error } },
  reorderResearch: { ...auth, summary: "Reorder research and credentials", body: reorderBody, response: { 200: { type: "array", items: researchItem }, 401: error } },
  contactLinks: { tags: ["contact"], summary: "List visible contact links", response: { 200: { type: "array", items: contactLink } } },
  adminContactLinks: { ...auth, summary: "List all contact links", response: { 200: { type: "array", items: contactLink }, 401: error } },
  createContactLink: { ...auth, summary: "Create a contact link", body: contactBody, response: { 201: contactLink, 401: error } },
  updateContactLink: { ...auth, summary: "Update a contact link", params: params("id"), body: contactBody, response: { 401: error, 404: error } },
  removeContactLink: { ...auth, summary: "Delete a contact link", params: params("id"), response: { 204: { type: "null" }, 401: error, 404: error } },
  reorderContactLinks: { ...auth, summary: "Reorder contact links", body: reorderBody, response: { 200: { type: "array", items: contactLink }, 401: error } },
  adminSettings: { ...auth, summary: "List site settings", response: { 200: settingsBody, 401: error } },
  updateSettings: { ...auth, summary: "Update site settings", body: settingsBody, response: { 200: settingsBody, 401: error, 400: error } },
  adminMedia: { ...auth, summary: "List uploaded media assets", response: { 200: { type: "array", items: mediaAsset }, 401: error } },
  uploadMedia: { ...auth, summary: "Upload an image to object storage", body: mediaUploadBody, response: { 201: mediaAsset, 400: error, 401: error } },
  removeMedia: { ...auth, summary: "Delete an unused media asset", params: params("id"), response: { 204: { type: "null" }, 401: error, 404: error, 409: error } },
  projectMedia: { tags: ["projects"], summary: "List published project media", params: params("slug"), response: { 200: { type: "array", items: projectMediaItem }, 404: error } },
  adminProjectMedia: { ...auth, summary: "List project media", params: params("id"), response: { 200: { type: "array", items: projectMediaItem }, 401: error } },
  createProjectMedia: { ...auth, summary: "Create project media", params: params("id"), body: projectMediaBody, response: { 201: projectMediaItem, 400: error, 401: error } },
  updateProjectMedia: { ...auth, summary: "Update project media", params: { type: "object", properties: { id: { type: "string" }, mediaId: { type: "string" } }, required: ["id", "mediaId"] }, body: projectMediaBody, response: { 401: error, 404: error } },
  removeProjectMedia: { ...auth, summary: "Delete project media", params: { type: "object", properties: { id: { type: "string" }, mediaId: { type: "string" } }, required: ["id", "mediaId"] }, response: { 204: { type: "null" }, 401: error, 404: error } },
  reorderProjectMedia: { ...auth, summary: "Reorder project media", params: params("id"), body: reorderBody, response: { 200: { type: "array", items: projectMediaItem }, 401: error } },
  login: { tags: ["admin"], summary: "Sign in", body: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" } } }, response: { 200: adminSession, 401: error, 429: error } },
  logout: { tags: ["admin"], summary: "Sign out" },
  me: { ...auth, summary: "Get current admin", response: { 200: adminSession, 401: error } },
  revokeSession: { ...auth, summary: "Revoke an admin session", params: params("id"), response: { 204: { type: "null" }, 401: error } },
  listAdmin: { ...auth, summary: "List all projects", response: { 401: error } },
  updateFeaturedProjects: { ...auth, summary: "Update selected work projects", body: featuredBody, response: { 401: error, 400: error } },
  create: { ...auth, summary: "Create a project", body: projectBody, response: { 201: { type: "object", additionalProperties: true }, 401: error } },
  update: { ...auth, summary: "Update a project", params: params("id"), body: projectBody, response: { 401: error } },
  remove: { ...auth, summary: "Delete a project", params: params("id"), response: { 204: { type: "null" }, 401: error } }
} as const;

export const projectSchemas = {
  listPublic: apiSchemas.listPublic,
  featuredProjects: apiSchemas.featuredProjects,
  bySlug: apiSchemas.bySlug,
  listAdmin: apiSchemas.listAdmin,
  updateFeaturedProjects: apiSchemas.updateFeaturedProjects,
  create: apiSchemas.create,
  update: apiSchemas.update,
  remove: apiSchemas.remove
} as const;
