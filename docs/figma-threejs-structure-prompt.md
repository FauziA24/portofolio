# Prompt Figma AI - Portfolio Structure + Three.js Direction

Salin prompt ini ke Figma AI:

```text
Create a polished, minimalist portfolio design system and responsive website prototype for Mohammad Fauzi Aziz, a backend and web developer. The design must be compact, editorial, technically sophisticated, and easy to implement in React. Do not create a busy dashboard, a generic template, or a page where every section is animated.

Core principle
Use Three.js as one restrained visual identity element in the hero. It should communicate systems, data, and connected architecture while keeping the content readable. In Figma, represent the Three.js scene as a realistic visual mockup and add implementation annotations; do not pretend that Figma can run the actual WebGL scene.

Visual system
- Dark theme: background #111210, surface #1A1C19, primary text #F4F1EA, secondary text #B7B4AC, border #32342F, accent #B9F227.
- Light theme: background #F7F6F2, surface #FFFFFF, primary text #161713, secondary text #66675F, border #DEDCD5, accent #587D00.
- Never use neon accent as small text on a light background. Check WCAG AA contrast.
- Use Hanken Grotesk or a similar clean grotesk display font, Inter for body text, and JetBrains Mono for metadata.
- Use a 12-column desktop grid, 4-column mobile grid, generous whitespace, thin dividers, and restrained 12-14px corner radius.
- No gradients, glassmorphism, decorative blobs, skill bars, capability/stack section, or fake metrics.

Figma pages and frames
1. Cover: project name, design principle, and a short Three.js implementation note.
2. Foundations: color variables for both themes, typography scale, spacing, borders, radii, shadows, and motion tokens.
3. Components: Nav, availability badge, theme toggle, primary/secondary button, compact project row, status badge, section heading, metadata list, project CTA, footer link, and mobile menu. Include default, hover, focus, pressed, disabled, dark, light, and mobile variants where relevant.
4. Homepage desktop, 1440px wide.
5. Homepage tablet, 768px wide.
6. Homepage mobile, 390px wide.
7. Project detail desktop, 1440px wide.
8. Project detail mobile, 390px wide.
9. States: loading, API error, empty projects, project not found, Live Demo available, Coming soon, and Private.
10. Admin editor wireframe: private route for editing projects and links. Keep it functional and plain; the public portfolio visual language is the priority.

Homepage structure
- Sticky minimal navigation: MFA monogram, Work, About, Research, Contact, Open to opportunities badge, and theme toggle. Never hide the native system pointer.
- Hero: left-aligned eyebrow "Mohammad Fauzi Aziz / Backend & Web Developer", large headline "I build reliable systems with a human interface.", short supporting paragraph, and two CTAs: "Explore selected work" and "View GitHub".
- Hero Three.js visual on the right side or behind the right half of the hero. Keep text readable above it.
- Selected Work: show only the first five projects in a compact vertical list, not large cards. Each row contains project number, small visual, title, category, year, and arrow. Place a `Show more projects` button below the list that opens a dedicated project archive.
- Project archive (`/projects`): show all published projects in a responsive grid with a cover image, project name, category, year, and arrow. Clicking any tile opens its project detail page.
- About: short narrative and a compact fact list for education, focus, and location. Use an image placeholder until a real portrait is supplied.
- Research & credentials: concise publication and certification rows.
- Contact: one direct CTA, email, LinkedIn, GitHub, and footer.

Three.js scene specification
- Concept: a sparse constellation of 20-30 connected nodes with thin lines, or one low-poly wireframe object surrounded by a subtle orbit.
- Meaning: connected systems, data flow, and backend architecture.
- Position: right side of the hero on desktop; behind the upper hero content on mobile with much lower opacity.
- Color: accent lines and nodes with muted primary-text orbit lines. Use the light-theme accent in light mode.
- Motion annotation: idle rotation is very slow; pointer changes rotation by a small amount; scroll shifts the scene upward and fades it slightly.
- Performance annotation: lazy-load the scene, pause when it is off-screen, use a static CSS/grid fallback on low-powered devices, and do not mount it for prefers-reduced-motion.
- Accessibility annotation: scene is decorative with aria-hidden; all meaningful information is present as HTML text; it never captures pointer input.
- Figma visual: show three hero variants - idle, pointer-hover, and reduced-motion/static fallback - connected with prototype annotations.

Project detail structure
- Top: back link, project number/category/year, large title, one-line summary.
- Above the fold: prominent Live Demo button. If no URL exists, show an honest disabled Coming soon or Private state. GitHub is a quieter secondary link.
- Metadata: role, organisation/team note, and date range.
- Case study content: Overview, Challenge, Contribution, Solution, Selected Technologies, media placeholder, and Next project.
- Keep the reading column narrow and calm. Do not turn the detail page into a dashboard.

Prototype interactions
- Hero copy reveals in a short stagger.
- Three.js mockup has a pointer-hover variant and a subtle scroll-fade annotation.
- Project rows reveal on scroll with a small opacity/translate transition.
- Hovering a row moves its thumbnail and arrow only 4-8px.
- Clicking a project transitions to the project detail frame.
- The navbar always includes Home, Work, About, Research, and Contact. Home returns to the top of the homepage.
- Add a restrained parallax layer: the hero grid/Three.js scene and one section visual move at different speeds on scroll. Keep text and project rows stable.
- Theme toggle switches all color variables coherently; do not invert the UI.
- Mobile uses a normal vertical scroll and touch-friendly controls. Do not use scroll-jacking or pinned horizontal scroll.
- Include a reduced-motion prototype path where all content remains visible without movement.

Content to use
- Name: Mohammad Fauzi Aziz.
- Headline: Backend & Web Developer.
- Featured projects: AI Finance Automation System, Human Resource Management System, OCR KTP Data Extraction, ARnatomi, Typink, and BebasRokok.
- Use truthful placeholder states for demo links: Live Demo, Coming soon, or Private.
- Do not invent URLs, metrics, screenshots, or personal claims.

Handoff requirements
- Use Auto Layout, variables, named text styles, and reusable components.
- Add redline/annotation notes for the Three.js developer behavior, responsive breakpoints, reduced-motion fallback, and API-driven project content.
- Mark every placeholder asset and external link clearly.
- Deliver a clean, compact, high-fidelity prototype that can be implemented as React + TypeScript + React Three Fiber + Framer Motion.
```
