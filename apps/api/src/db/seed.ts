import { pool, db } from "./index.js";
import { and, eq, isNull } from "drizzle-orm";
import { config } from "../config.js";
import { createPasswordHash } from "../modules/admin/auth.js";
import { projectService } from "../modules/projects/service.js";
import type { ProjectInput } from "../modules/projects/schema.js";
import { adminUsers, contactLinks, profileFacts, projects as projectTable, researchItems, sitePreferences, siteProfiles } from "./schema.js";

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;
const projects: ProjectInput[] = [
  { slug: "ai-finance-automation", title: "AI Finance Automation System", category: "AI automation", role: "Developer", teamNote: "PT SPIL (Salam Pacific Indonesia Lines) project", summary: "Modular AI workflows for financial-data analysis.", challenge: "Financial analysis involves document processing, retrieval, calculations, and visualization across fragmented steps.", contribution: "Built modular workflows and strengthened understanding of context control and hallucination reduction.", solution: "Combined RAG, LangChain, Gemini AI, vector database, and n8n for a structured workflow.", technologies: ["RAG", "LangChain", "Gemini AI", "n8n"], startDate: "2025-08-01", endDate: "2026-02-28", featuredRank: 1, coverImageUrl: image("photo-1551288049-bebda4e38f71"), status: "PUBLISHED", demoStatus: "COMING_SOON" },
  { slug: "hrms-backend", title: "Human Resource Management System", category: "Backend systems", role: "Back End Developer", teamNote: "AirNav Indonesia (Surabaya)", summary: "Reliable scheduling and HR workflows for operational teams.", challenge: "Employee scheduling requires consistent data during concurrent updates and role-specific business rules.", contribution: "Developed scheduling, leave, swap, logbook, handover, certificate, and audit-log modules; validated behavior through 80 passing automated tests.", solution: "Implemented RBAC, validation, transactions, row locking, queued jobs, rollbacks, indexes, and eager loading.", technologies: ["Laravel", "PHP", "MySQL", "REST APIs"], startDate: "2025-12-01", endDate: "2026-09-30", featuredRank: 2, coverImageUrl: image("photo-1556761175-b413da4baf72"), status: "PUBLISHED", demoStatus: "COMING_SOON" },
  { slug: "ocr-ktp", title: "OCR KTP Data Extraction", category: "Computer vision", role: "Developer", teamNote: "PT SPIL (Salam Pacific Indonesia Lines) project", summary: "Prototype for extracting Indonesian identity-card data.", challenge: "Noisy, tilted, low-quality KTP images make field extraction inconsistent.", contribution: "Developed the OCR and computer-vision prototype, including preprocessing and evaluation work.", solution: "Detected KTP areas and fields with YOLOv8, extracted text with Tesseract OCR, and improved consistency with OpenCV preprocessing.", technologies: ["YOLOv8", "Tesseract OCR", "OpenCV"], startDate: "2025-05-01", endDate: "2025-08-31", featuredRank: 3, coverImageUrl: image("photo-1550751827-4bd374c3f58b"), status: "PUBLISHED", demoStatus: "COMING_SOON" },
  { slug: "arnatomi", title: "ARnatomi", category: "Augmented reality", role: "Team contributor", teamNote: "Team of 4", summary: "Interactive body-anatomy learning through augmented reality.", challenge: "Schools without anatomy learning resources need a more engaging learning aid.", contribution: "Co-designed and developed the AR learning application with a four-person team.", solution: "Built a Unity3D experience using C#, UI design, and Vuforia.", technologies: ["Unity", "C#", "Vuforia"], startDate: "2023-02-01", endDate: "2024-06-30", featuredRank: 4, coverImageUrl: image("photo-1531482615713-2afd69097998"), githubUrl: "https://github.com/galn14/ARnatomi.git", status: "PUBLISHED", demoStatus: "COMING_SOON" },
  { slug: "typink", title: "Typink", category: "Web platform", role: "Team contributor", teamNote: "Team of 5", summary: "Platform for creating and selling novels.", challenge: "Writers and readers need one service for creating and selling novels.", contribution: "Co-designed and developed the web application with a five-person team.", solution: "Implemented the platform with React, TypeScript, Tailwind CSS, and MySQL.", technologies: ["React", "TypeScript", "Tailwind CSS", "MySQL"], startDate: "2024-04-01", endDate: "2024-06-30", featuredRank: 5, coverImageUrl: image("photo-1455390582262-044cdead277a"), githubUrl: "https://github.com/ajinata84/typink.git", status: "PUBLISHED", demoStatus: "COMING_SOON" },
  { slug: "bebas-rokok", title: "BebasRokok", category: "Educational web", role: "Team contributor", teamNote: "Team of 5", summary: "Educational web experience about the dangers of smoking.", challenge: "Anti-smoking education needs to be engaging and accessible.", contribution: "Co-designed and developed the educational website with a five-person team.", solution: "Built with React, TypeScript, Tailwind CSS, Gemini, and MySQL.", technologies: ["React", "TypeScript", "Gemini", "MySQL"], startDate: "2024-04-01", endDate: "2024-06-30", featuredRank: 6, coverImageUrl: image("photo-1500534623283-312aade485b7"), githubUrl: "https://github.com/ajinata84/bebasrokok.git", status: "PUBLISHED", demoStatus: "COMING_SOON" }
];

const service = projectService(db);
for (const project of projects) {
  const existing = await service.bySlug(project.slug, true);
  if (!existing) await service.create(project);
  else if (!existing.coverImageUrl && project.coverImageUrl) {
    await db.update(projectTable).set({ coverImageUrl: project.coverImageUrl, updatedAt: new Date() }).where(and(eq(projectTable.id, existing.id), isNull(projectTable.coverImageUrl)));
  }
}

const adminPassword = config.ADMIN_PASSWORD ?? config.ADMIN_TOKEN;
if (adminPassword) {
  const adminPasswordHash = await createPasswordHash(adminPassword);
  await db.insert(adminUsers).values({
    id: "admin-default",
    email: config.ADMIN_EMAIL.toLowerCase(),
    passwordHash: adminPasswordHash
  }).onConflictDoUpdate({
    target: adminUsers.email,
    set: { passwordHash: adminPasswordHash, updatedAt: new Date() }
  });
}

await db.insert(siteProfiles).values({
  id: "default",
  displayName: "Mohammad Fauzi Aziz",
  shortName: "MFA",
  role: "Backend & Web Developer",
  heroHeadline: "I build reliable web systems that feel simple to use.",
  heroEmphasis: "reliable",
  heroBody: "Computer Science student focused on backend architecture, scalable web apps, and AI-enabled product workflows.",
  heroPrimaryLabel: "Explore selected work",
  heroPrimaryUrl: "#work",
  heroSecondaryLabel: "View GitHub",
  heroSecondaryUrl: "https://github.com/FauziA24",
  aboutHeadline: "I turn complex workflows into dependable, maintainable products.",
  aboutBody: "My work spans business logic design, database operations, authentication systems, RBAC, input validation, automated testing, and frontend-backend integration. I care equally about correctness and developer experience.",
  portraitImageAlt: "Portrait of Mohammad Fauzi Aziz",
  footerLocation: "Surabaya, Indonesia",
  footerTimezone: "Asia/Jakarta",
  seoTitle: "Mohammad Fauzi Aziz - Backend & Web Developer",
  seoDescription: "Portfolio of Mohammad Fauzi Aziz, focused on backend architecture, web applications, and AI-enabled workflows.",
  canonicalUrl: "http://localhost:5173"
}).onConflictDoNothing({ target: siteProfiles.id });

if (!(await db.select({ id: profileFacts.id }).from(profileFacts).limit(1)).length) {
  await db.insert(profileFacts).values([
    { id: "fact-university", label: "University", value: "Bina Nusantara University", sortOrder: 1 },
    { id: "fact-degree", label: "Degree", value: "Computer Science (2022 - 2026)", sortOrder: 2 },
    { id: "fact-location", label: "Location", value: "Indonesia", sortOrder: 3 },
    { id: "fact-languages", label: "Languages", value: "Indonesian", sortOrder: 4 }
  ]);
}

if (!(await db.select({ id: researchItems.id }).from(researchItems).limit(1)).length) {
  await db.insert(researchItems).values([
    { id: "research-arnatomi", type: "PUBLICATION", title: "ARnatomi: AR-Based Anatomy Learning Application", issuerOrVenue: "IEEE", dateLabel: "December 2023", url: "https://ieeexplore.ieee.org/document/10349043", sortOrder: 1 },
    { id: "research-face-recognition", type: "PAPER", title: "Face Recognition as Base Protocol in Online Transaction", issuerOrVenue: "Paper", dateLabel: "28 Aug 2024", sortOrder: 2 },
    { id: "cert-data-warehouse", type: "CERTIFICATION", title: "Introduction to Data Warehouse for Beginners", issuerOrVenue: "Great Learning", sortOrder: 3 },
    { id: "cert-javascript", type: "CERTIFICATION", title: "Introduction to JavaScript", issuerOrVenue: "Great Learning", sortOrder: 4 }
  ]);
}

if (!(await db.select({ id: contactLinks.id }).from(contactLinks).limit(1)).length) {
  await db.insert(contactLinks).values([
    { id: "contact-email", label: "Email", value: "mohammadfauziaziz81@gmail.com", url: "mailto:mohammadfauziaziz81@gmail.com", kind: "EMAIL", sortOrder: 1, isPrimary: true },
    { id: "contact-phone", label: "Phone", value: "+62 857-4951-6579", url: "tel:+6285749516579", kind: "PHONE", sortOrder: 2 },
    { id: "contact-linkedin", label: "LinkedIn", value: "/in/mohammad-fauzi-aziz-257691268", url: "https://www.linkedin.com/in/mohammad-fauzi-aziz-257691268", kind: "LINKEDIN", sortOrder: 3 },
    { id: "contact-github", label: "GitHub", value: "/FauziA24", url: "https://github.com/FauziA24", kind: "GITHUB", sortOrder: 4 }
  ]);
}

await db.insert(sitePreferences).values([
  { id: "site-display-name", key: "siteDisplayName", value: "Fauzi Portfolio" },
  { id: "site-tagline", key: "siteTagline", value: "Backend and web systems portfolio" },
  { id: "site-public-url", key: "publicUrl", value: "http://localhost:5173" },
  { id: "site-timezone", key: "timezone", value: "Asia/Jakarta" },
  { id: "site-language", key: "contentLanguage", value: "en" },
  { id: "site-availability-label", key: "availabilityLabel", value: "Open to opportunities" },
  { id: "site-contact-headline", key: "contactHeadline", value: "Have a system worth making simpler?\nLet's talk." },
  { id: "site-projects-kicker", key: "projectsKicker", value: "01 / Archive" },
  { id: "site-projects-title", key: "projectsTitle", value: "All selected *work.*" },
  { id: "site-projects-description", key: "projectsDescription", value: "Projects, experiments, and systems built across web development, backend engineering, AI, and research." }
]).onConflictDoNothing({ target: sitePreferences.key });

await pool.end();
