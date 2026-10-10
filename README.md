# Ernur portfolio

A personal engineering portfolio inspired by the composition and interaction patterns of the Astra Framer template. Static HTML, locally hosted Manrope, CSS, a small dependency-free interaction layer and an explicitly loaded Three.js viewer.

## Run locally

Requires Node.js 22 or later. No dependency installation is required.

```sh
npm run dev
```

Open http://127.0.0.1:4178. Set PORT to use another port.

```sh
npm test
npm run build
node scripts/serve.mjs dist
```

`dist/` contains only the production website. GitHub Pages deploys it when changes reach `main`. Pull requests run route, asset, JavaScript syntax and production-build verification.

## Pages and content

All existing routes are retained: home, work, five case studies, about, lab, contact and 404. Personal facts come from the previous site: RFMSH in Almaty, Python/C++/Java, AP preparation, Yandex Lyceum, 1C internship, commercial web work and personal interests. The only supplied contact is the GitHub profile. No clients, awards, testimonials, email addresses or professional titles were invented.

## Design and interactions

- Astra reference: https://framer.com/projects/Astra-copy--Z0Evdd5pST6sXcDdttUz-cPZDk?node=augiA20Il
- Original implementation of the template's large typography, cosmic hero, spacious project layouts and reveal interactions; this is not an exported Framer component package.
- Responsive navigation with keyboard focus containment and Escape handling.
- Keyboard-accessible programming-language tabs and a rotating cube experiment.
- All content remains readable without animation; reduced-motion preferences are respected.
- 3D downloads happen only after selecting Explore 3D model. Viewers have loading, retry, keyboard, drag, rotation, separation and reset controls. Normal wheel/touch scrolling remains available.

## Assets

Original CAD exports remain in `source-assets/`. Optimized production models are in `assets/models/optimized/`; the local viewer dependency is in `assets/vendor/`, with its license. Model poster images are genuine renders of these CAD assemblies. The optimized models and browser bundle are checked in so production builds do not need third-party downloads.

Manrope is hosted in `public/fonts/` under the included OFL license.

The cosmic hero (`public/images/astra-orbit.webp`) was generated using built-in ImageGen with this prompt: panoramic cinematic astronomy photograph, near-black left 45% negative space, enormous smoky ivory lunar crescent on the right, sparse stars, desaturated charcoal and bone tones, no text, logos or UI, no blue or purple glow.

Older v5/award/motion source files remain in the repository for reference but are not loaded or shipped. The new entry points are `portfolio.css`, `portfolio.js`, `inner.css` and `model-viewer.js`.
