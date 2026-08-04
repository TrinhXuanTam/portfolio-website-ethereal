# Portfolio — Ethereal

Personal portfolio for Trinh Xuan Tam, full-stack software engineer.
An immersive, editorial single-page site with a live WebGL background,
built around content served from a headless Strapi CMS.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** for the DOM UI
- **Three.js / React Three Fiber** for the WebGL fluid background
- **GSAP + ScrollTrigger** for scroll-driven motion
- **Lenis** for momentum smooth scrolling
- **Firebase Analytics** (project `portfolio-411720`)
- Content from the Strapi CMS at `cms.portfolio.trinhxuantam.com` (GraphQL)

## Develop

```bash
npm install --registry=https://registry.npmjs.org/
npm run dev        # http://127.0.0.1:3100
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Configuration

- `VITE_CMS_URL` overrides the CMS endpoint (defaults to the production CMS).

## Structure

```
src/
  canvas/       WebGL scene + shaders (FluidGradient), isolated from the DOM
  sections/     landing sections (Hero, Services, Workflow, Projects, Values, Contact)
  pages/        routed views (AllProjects, ProjectDetail, AboutPage, ContactPage)
  components/   Nav, Cursor, RouteTransition, interactive + ui primitives
  lib/          cms client, hash router, lenis, pointer, firebase
  data/         static content + fallbacks
```
