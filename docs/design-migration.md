# Figma export migration

Source: `D:\Projek\design_website\Interactive Minimalist Portfolio Website`.
Migrated on 2026-09-08. The source folder is retained unchanged.

## Visual reference

- Hanken Grotesk / Inter / JetBrains Mono, original semantic dark/light tokens.
- Bottom-aligned hero, compact work rows, About facts, Research/credentials and Contact columns.
- Fixed responsive navigation with availability indicator and mobile menu.
- Project detail layout, readable case-study column, selected technologies, next-project navigation.
- Three.js constellation with pointer response and scroll fading.

## Integration and content rules

- Public pages use the existing API and PostgreSQL. Admin edits remain authoritative.
- `src/features/projects/useProjects.ts` maps the API model into presentation fields; Figma sample data does not replace stored content.
- Loading, empty, unavailable API and missing-project states are explicit.
- Live Demo is an external HTTP(S) URL only when its database status is LIVE. Publication URLs are separate.
- CV contact links replace placeholder links. Unsupported sample claims and dummy demo URLs are not imported.
- No capability/stack section on the homepage.
- Homepage shows five work rows; `/projects` is the full image-and-title project archive with a `Show more projects` entry point.
- The navbar includes Home and the archive keeps the same public visual system.
- Parallax is limited to the hero/grid visual layer; content rows remain stable for readability.
- Project archive cards use a restrained pointer tilt and scroll offset inspired by interactive 3D project galleries; reduced motion keeps cards flat.
- The homepage contact section behaves as a sticky footer reveal with application accent buttons; the native pointer remains visible.
- Project detail pages include a gallery immediately after Selected Technologies. API cover media is shown first, followed by temporary Unsplash references until real media is supplied.
- Portrait placeholder follows the reference until a real portrait is supplied. Project cover media uses the API URL when supplied.
- Native pointer stays visible. Reduced-motion disables mounting the scene. WebGL failures fall back to the decorative grid; off-screen scene is unmounted.

## Structure

- `pages/Home.tsx` and `pages/ProjectDetail.tsx`: public presentation.
- `pages/Admin.tsx`: existing editor, loaded separately.
- `components/Nav.tsx`, `Reveal.tsx`, `HeroScene.tsx`: adapted exported components.
- `design.css`: exported design tokens and Tailwind styles.
- `admin.css`: editor styling separated from public design.

Validation: frontend TypeScript + production build passed; existing API returned all six published projects. Browser-based visual validation was blocked by the browser tool failing to initialize with a missing-path error. Three.js remains a separately loaded large chunk (~860 kB minified); performance budget is not yet verified on devices.
