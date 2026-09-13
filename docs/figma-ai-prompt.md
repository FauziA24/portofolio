# Prompt Figma AI - Portfolio Mohammad Fauzi Aziz

Salin seluruh prompt berikut ke Figma AI.

```text
Design a premium, minimalist, highly interactive portfolio website for Mohammad Fauzi Aziz, an Indonesian Computer Science student and backend/web developer. The site should feel like an editorial digital product experience: calm, confident, precise, and technically sophisticated. It must be original - do not copy any existing portfolio - but take inspiration from the craft of award-winning motion-first websites: purposeful scroll storytelling, magnetic micro-interactions, smooth reveal transitions, and responsive cursor states. Motion is a supporting layer, never visual noise.

Design language
- Visual tone: minimal, technical, modern, human. Use abundant negative space, an asymmetric but disciplined grid, thin 1px dividers, restrained rounded corners (12-16px), and clear hierarchy.
- Color system: create two deliberately matched themes, not a simple color inversion. Dark theme: background #111210, elevated surface #1A1C19, primary text #F4F1EA, secondary text #B7B4AC, border #32342F, accent #B9F227. Light theme: background #F7F6F2, elevated surface #FFFFFF, primary text #161713, secondary text #66675F, border #DEDCD5, accent #587D00. The accent must always meet contrast requirements; do not use neon lime as small text on white.
- Typography: a clean neo-grotesk display font paired with an accessible sans-serif body. Oversized hero type (72-112px desktop), expressive italics only for one or two emphasis words, compact mono type for metadata and technology labels.
- Do not use gradients, glassmorphism, generic blobs, skill bars, a busy dashboard, stock imagery, or a capability/technology-stack section. Use abstract generative linework only if it reinforces the engineering narrative.
- Create desktop (1440px), tablet (768px), and mobile (390px) layouts. Use an 12-column desktop grid and ensure touch-friendly controls.

Information architecture and exact content
1. Sticky minimal navigation: MFA monogram / Home, Work, About, Research, Contact. Add a theme toggle and a small availability badge reading "Open to opportunities".
2. Hero: 
   Eyebrow: "Mohammad Fauzi Aziz / Backend & Web Developer"
   Headline: "I build reliable systems with a human interface."
   Supporting copy: "Computer Science student focused on scalable web applications, backend architecture, and AI-enabled workflows."
   Primary CTA: "Explore selected work"; secondary CTA: "View GitHub".
   Use a small, performant Three.js / React Three Fiber scene behind or beside the headline: a wireframe architectural object or constellation of connected nodes that responds subtly to pointer movement and scroll progress. It must be decorative, preserve text contrast, pause off-screen, offer a static fallback, and disappear in prefers-reduced-motion mode.
3. Selected work: make this section compact, quiet, and scannable. Use a vertical indexed list or 2-column editorial grid with only project number, title, year, one-line category, a small thumbnail/abstract visual, and one arrow affordance per item. Do NOT expose long descriptions, a cluster of tech tags, or multiple buttons here. Selecting a card opens that project's dedicated detail page. Use these projects:
   - AI Finance Automation System (PT SPIL, Aug 2025-Feb 2026): RAG, LangChain, Gemini AI, vector database, n8n; document processing, retrieval, analysis, calculation, visualization.
   - HRMS Backend Developer (AirNav Indonesia Surabaya, Dec 2025-Sep 2026): scheduling, leave, duty swaps, audit logs, role-based access; transactions, row locking, queued jobs; 80 passing automated tests.
   - OCR KTP Data Extraction (PT SPIL, May-Aug 2025): YOLOv8, Tesseract OCR, OpenCV; Indonesian ID-card field detection and extraction.
   - ARnatomi (2023-2024): team of 4; Unity, C#, Vuforia; AR anatomy learning app. Include IEEE publication link state.
   - Typink (2024): React, TypeScript, Tailwind CSS, MySQL; team novel-writing and selling platform.
   - BebasRokok (2024): React, TypeScript, Tailwind CSS, Gemini, MySQL; team educational anti-smoking platform.
4. Project detail page (`/projects/:slug`): this is the destination after a project is selected. Begin with a compact hero containing project number, title, category, year, role, and a prominent primary `Live Demo` button placed above the fold. Place `GitHub` as a quiet secondary text button. If no public demo exists, retain the primary button but show its honest status (`Coming soon` or `Private`) and prevent misleading navigation. Below the hero, use a narrow readable content column: overview, challenge, contribution, solution, selected technologies, media/gallery, and next project. Reveal sections on scroll with restrained opacity/translate motion. The detail page should feel like reading a concise case study, not a dashboard.
5. About: a brief portrait placeholder in a clean rectangular frame, then: "I turn complex workflows into dependable, maintainable products." Mention experience with business logic, database operations, authentication, RBAC, validation, automated testing, and frontend-backend integration. Include compact facts: Bina Nusantara University, Computer Science (2022-2026); Indonesia; Indonesian language.
6. Research and credentials: elegant compact section for ARnatomi IEEE publication (December 2023, link placeholder), Face Recognition as Base Protocol in Online Transaction (28 Aug 2024), and certifications in Introduction to Data Warehouse for Beginners and Introduction to JavaScript.
7. Contact/footer: direct, warm invitation: "Have a system worth making simpler? Let's talk." Buttons for email, LinkedIn, and GitHub. Display contact information only in the contact section, not everywhere. Use placeholders for phone, email, GitHub, LinkedIn. Footer with location/time and back-to-top interaction.

Interaction and motion annotations for developers
- Loading: 900-1200ms name/monogram intro; always offer a reduced-motion equivalent.
- Hero: staggered text reveal, Three.js scene responds gently to pointer and scroll, magnetic CTA buttons; make these subtle.
- On scroll: headings reveal and the work list has one controlled sequence of fade/translate reveals. Avoid pinned horizontal scroll; use a normal vertical layout on every breakpoint to keep the page compact and predictable.
- Project list hover: thumbnail crops gently, metadata moves 4-8px, arrow shifts. On click, transition into the project-detail route with a shared-layout/media transition. No autoplay video required; include a deliberate video/demo modal state only on the detail page.
- Use accessible focus styles, keyboard-operable links and modal, contrast-compliant text, and an explicit prefers-reduced-motion state.

System and handoff
- Build reusable Figma components with variants for Button, Nav Item, Compact Project Row/Card, Status Badge, Theme Toggle, and Section Heading.
- Use Auto Layout, component properties, variables, and named color/type/spacing tokens. Include hover, focus, pressed, disabled, and mobile variants where relevant.
- Annotate components with implementation intent for React + Framer Motion / GSAP; the visual design must remain usable if JavaScript is unavailable.
- The production app will use ReactJS, React Three Fiber / Three.js, and PostgreSQL. Reserve an admin-friendly content model for projects, technologies (only displayed on detail pages), external links, case-study media, featured state, and demo status.
- Create a high-fidelity homepage plus a project-detail template showing: overview, challenge, contribution, solution, tech stack, gallery, links, and next project.

Deliver a polished Figma file containing a cover page, design tokens, reusable components, desktop/mobile homepage, and project-detail template. Use realistic content above, but leave image and live-demo URLs as clearly labeled placeholders.
```
