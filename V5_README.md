# ERNUR PORTFOLIO V5 — Final multi-page rebuild

This branch is the current final portfolio candidate. `main` stays untouched until visual QA is complete.

## Core direction

Coding is the primary identity. Robotics, CAD, 3D and web development extend that story.

Global experience:

- first-visit preloader with real model loading progress;
- GSAP + ScrollTrigger + Lenis motion clock;
- consistent route transitions;
- full-screen menu choreography;
- text/section reveals;
- responsive and reduced-motion behavior;
- page-aware Three.js scenes;
- lazy loading for non-critical 3D.

## Pages

```text
/
/work/
/work/tracelab/
/work/decode/
/work/3209/
/work/fusion360/
/work/web/
/about/
/lab/
/contact/
/404.html
```

## 3D assets

The site uses four real GLB files:

```text
DECODE Simple Bot(1).glb
3209-0001-0007.glb
Main Assembly.glb
kicker_insert.glb
```

`setup-assets.ps1` searches Downloads, Desktop and Documents and installs them as:

```text
assets/models/robot/DECODE Simple Bot.glb
assets/models/study/3209-0001-0007.glb
assets/models/fusion/Main Assembly.glb
assets/models/fusion/kicker_insert.glb
```

DECODE keeps the original choreography:

```text
inspect → separate → understand → rebuild
```

The other models use quieter camera/inspection motion so the site does not repeat one 3D trick everywhere.

## Content now included

- Coding focus: Python, C++, Java and web development.
- RFMSH / Almaty, Kazakhstan.
- Advanced Placement preparation: AP Physics C Mechanics, AP Physics C Electricity & Magnetism, AP Computer Science A, AP Calculus BC.
- Yandex Lyceum and 1C internship experience.
- Commercial web-development experience for education organizations.
- TraceLab full software case study based on the supplied project handoffs.
- First Fusion 360 projects: Main Assembly + Kicker Insert.
- Hobbies: football, basketball, chess, coding, 3D modeling and cubing.
- Cubing Club Owner role and ~15 cube variants.
- Public GitHub link: `github.com/bolaternur`.

## Run on Windows

1. Download the `v5-rebuild` branch as ZIP and extract it.
2. Keep the four GLB files in Downloads/Desktop/Documents or copy them manually into the paths above.
3. Run `START_LOCALHOST.bat`.

If Windows blocks `.bat`, open PowerShell in the extracted folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-assets.ps1
py -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Required visual QA before merge

Capture at least:

1. Homepage hero with 3209.
2. Homepage or DECODE page at inspect.
3. DECODE at full separate/understand.
4. 3209 near-orthographic state.
5. Main Assembly page scene.
6. Kicker Insert page scene.
7. TraceLab page.
8. About page.
9. Mobile homepage + one case study.

## Still required for an Awwwards submission candidate

- tune real-model camera and lighting after screenshots;
- optimize large GLBs with gltfpack/meshoptimizer while preserving DECODE node structure;
- run Lighthouse/Core Web Vitals checks;
- browser QA on Chrome, Safari and Firefox;
- mobile/touch QA;
- final copy proofread;
- final social metadata / OG image;
- only then merge `v5-rebuild` into `main`.
