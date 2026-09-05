# V5 CHANGELOG

## Final multi-page content pass

- Repositioned the portfolio around coding as Ernur's primary technical interest.
- Added shared `v5.css` design system and `v5.js` motion/Three.js engine.
- Added first-visit loader with real critical-model progress.
- Added global page transitions and full-screen menu choreography.
- Added text/section reveal primitives and one Lenis + GSAP + ScrollTrigger timing system.
- Added Work index and dedicated pages for TraceLab, DECODE, 3209, Fusion 360 and client web work.
- Added About page with RFMSH, Almaty/Kazakhstan, Python/C++/Java, Yandex Lyceum, 1C, AP Physics C Mechanics, AP Physics C Electricity & Magnetism, AP Computer Science A and AP Calculus BC.
- Added personal Lab page with football, basketball, chess, coding, 3D modeling, Cubing Club and ~15 cube variants.
- Added GitHub-focused Contact page and custom 404.
- Added `Main Assembly.glb` and `kicker_insert.glb` as interactive first-Fusion-360 projects.
- Expanded local asset setup from two to four GLB files.
- Preserved DECODE `inspect → separate → understand → rebuild` animation logic.
- Added GitHub Actions V5 QA for JS syntax, required page tree and localhost route smoke.

## TraceLab case study

The portfolio now reflects the supplied TraceLab / Project Trace documentation instead of a generic robotics description. It covers the evidence-history thesis, Evidence Trace, source provenance, tests/decisions, offline capture, policy/trust ideas, architecture and the dependency-free verification reported by the handoff files.

## Still pending

- Real-browser visual QA with all four GLBs.
- Camera/scale/lighting tuning after screenshots.
- Meshoptimizer/gltfpack production pass.
- Lighthouse/Core Web Vitals and cross-browser QA.
