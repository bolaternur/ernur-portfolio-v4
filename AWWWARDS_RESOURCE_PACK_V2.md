# ERNUR V5 — CURATED AWWWARDS RESOURCE PACK V2

Do not import all of these into production. Each repository is a reference or source for one specific interaction. We will extract the useful principle/code, rewrite it into the ERNUR motion system, and reject anything that harms identity, accessibility or performance.

## Already available — do NOT download again

The project already has access to the core stack / previous uploads: Three.js ecosystem, React Three Fiber, drei, gltfjsx, react-postprocessing, Lenis, Theatre.js, meshoptimizer, OneElementScroll, ScrollBasedLayoutAnimations, KineticTypePageTransition, ImageToContent, 3DCarousel, ElasticGridScroll, typography/scroll demos, React Bits, Magic UI, Cult UI and other earlier resources.

## Download now — priority references

### 01 — Persistent WebGL / page transition architecture
https://github.com/J0SUKE/gsap-threejs-codrops

Use for: lifecycle, GSAP + Three.js synchronization, text animation, transition cleanup, persistent media ideas.

### 02 — Barba.js + GSAP multi-page lifecycle
https://github.com/Ibaliqbal/codrops-barbajs-page-transition

Use for: real route lifecycle, leave/enter hooks, per-route animation logic. We will compare this against the native View Transition API before choosing production routing.

### 03 — Lightweight async page transition router
https://github.com/blenkcode/codrops-demo

Use for: understanding a small custom router where old/new page containers coexist during transitions. Useful if Barba is unnecessary overhead.

### 04 — Infinite scroll + content transition
https://github.com/surya-aditya/codrops-infinite-scroll-and-content-transition

Use for: Work index / selected-project expansion / GSAP Flip ideas. Do not use infinite scroll automatically; usability decides.

### 05 — Scroll SVG masks
https://github.com/Hiro-kiii/Scroll-Transition

Use for: one section-to-section reveal pattern and possibly TraceLab evidence transition. Maximum one or two uses in the final site.

### 06 — Sticky Grid Scroll
https://github.com/theoplawinski/codrops-sticky-grid-scroll

Use for: visual Work/Web gallery with authored scroll phases instead of static cards.

### 07 — Blender camera path → Three.js + GSAP
https://github.com/gaspoorf/curve-gallery

Use for: 3209 cinematic camera choreography and possibly a project gallery camera path.

### 08 — GSAP EaseReverse Clip Menu
https://github.com/codrops/EaseReverseClipMenu

Use for: more intentional full-screen menu open/close motion, especially reverse easing.

## Optional — download after priority pack

### 09 — Persistent WebGPU page transitions
https://github.com/bnpne/page-transitions-with-webgpu-vanilla-js

Use for research only. WebGPU should not become a production dependency unless it degrades gracefully and provides a clearly better signature transition than the simpler solutions.

### 10 — Page Loading Effects
https://github.com/codrops/PageLoadingEffects

Older reference, still useful for studying SVG/shutter reveal composition. We should not copy its visual style.

### 11 — Page Reveal Effects
https://github.com/codrops/PageRevealEffects

Use for multi-layer reveal timing research, not as a production component.

### 12 — Pixel Transition
https://github.com/codrops/PixelTransition

Use only in `/lab` if at all. It is deliberately not planned as the global transition because it would conflict with the quiet engineering identity.

## Core official libraries / references

- GSAP: https://github.com/greensock/GSAP
- Lenis: https://github.com/darkroomengineering/lenis
- Barba.js: https://github.com/barbajs/barba
- Codrops organization: https://github.com/codrops

## Production selection rule

A repository is accepted only if it improves at least one of these without materially damaging another:

1. visual identity;
2. storytelling/content understanding;
3. interaction quality;
4. motion continuity;
5. performance;
6. accessibility/responsive behavior.

If it is merely “another cool animation,” reject it.
