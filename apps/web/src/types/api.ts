export type DemoStatus = "LIVE" | "COMING_SOON" | "PRIVATE" | "ARCHIVED";
export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  role: string;
  teamNote?: string | null;
  summary: string;
  overview?: string | null;
  challenge: string;
  contribution: string;
  solution: string;
  status: ProjectStatus;
  demoStatus: DemoStatus;
  demoUrl?: string | null;
  githubUrl?: string | null;
  coverImageUrl?: string | null;
  highlightImageUrl?: string | null;
  highlightImageAlt?: string | null;
  hoverPreviewImageUrl?: string | null;
  hoverPreviewImageAlt?: string | null;
  featuredRank?: number | null;
  sortOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  canonicalUrl?: string | null;
  isIndexed?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  technologies: { technology: { id: string; name: string } }[];
};

export type SiteProfile = {
  id: string;
  displayName: string;
  shortName: string;
  role: string;
  heroHeadline: string;
  heroEmphasis?: string | null;
  heroBody: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  heroSecondaryLabel?: string | null;
  heroSecondaryUrl?: string | null;
  aboutHeadline: string;
  aboutBody: string;
  portraitImageUrl?: string | null;
  portraitImageAlt?: string | null;
  footerLocation: string;
  footerTimezone: string;
  contentLanguage: "en" | "id";
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  canonicalUrl?: string | null;
  isIndexed: boolean;
};

export type ProfileFact = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  isVisible: boolean;
};

export type ResearchType =
  | "PUBLICATION"
  | "PAPER"
  | "CERTIFICATION"
  | "EDUCATION"
  | "CREDENTIAL";

export type ResearchItem = {
  id: string;
  type: ResearchType;
  title: string;
  issuerOrVenue: string;
  dateLabel?: string | null;
  doi?: string | null;
  url?: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export type ContactKind =
  | "EMAIL"
  | "PHONE"
  | "LINKEDIN"
  | "GITHUB"
  | "WEBSITE"
  | "OTHER";

export type ContactLink = {
  id: string;
  label: string;
  value: string;
  url: string;
  kind: ContactKind;
  sortOrder: number;
  isPrimary: boolean;
  isVisible: boolean;
};

export type MediaAsset = {
  id: string;
  storageKey: string;
  publicUrl: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  width?: number | null;
  height?: number | null;
};

export type MediaKind = "IMAGE" | "VIDEO" | "MOCKUP" | "SCREENSHOT";

export type ProjectMedia = {
  id: string;
  projectId: string;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  url?: string | null;
  altText: string;
  caption?: string | null;
  kind: MediaKind;
  sortOrder: number;
  isHighlighted: boolean;
};
