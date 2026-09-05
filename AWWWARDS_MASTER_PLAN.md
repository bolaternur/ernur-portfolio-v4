# ERNUR PORTFOLIO — AWWWARDS MASTER PLAN

Goal: build an Awwwards-level portfolio with a credible chance of recognition. No award can be guaranteed; the strategy is to maximize design quality, usability, creativity, content depth and technical execution.

## Core creative idea

**Code → evidence → geometry → motion.**

Coding is the primary identity. The site then expands into software systems, commercial web development, CAD and robotics.

## Signature moments

1. 3209 cinematic 3D hero with real loading progress.
2. Global project/page transition system shared across the entire site.
3. DECODE Simple Bot `inspect → separate → understand → rebuild` interaction.
4. TraceLab Evidence Trace as a software/data-storytelling moment.
5. First Fusion 360 models shown as real interactive GLBs rather than screenshots.

## Global experience — IMPLEMENTED

- first-visit preloader;
- real critical-model loading progress;
- route transition overlay;
- full-screen menu choreography;
- shared text / section reveal primitives;
- GSAP + ScrollTrigger + Lenis synchronization;
- page-aware Three.js scenes;
- lazy heavy-model loading;
- responsive layout;
- reduced-motion fallback;
- custom 404.

## Page architecture — IMPLEMENTED

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

## Content architecture — IMPLEMENTED

### Home
Coding-first identity, 3209 hero, selected work, DECODE interactive preview, Fusion 360 preview, education/hobbies and GitHub contact.

### TraceLab
Deep software case study grounded in supplied project docs: evidence infrastructure, engineering causality, Evidence Trace, architecture, trust/provenance and verification notes.

### DECODE
Full preserved robot choreography plus model/hierarchy explanation.

### 3209
Alternative 3D language: perspective → profile → near-orthographic inspection.

### Fusion 360
`Main Assembly.glb` and `kicker_insert.glb`, explicitly framed as first Fusion 360 projects.

### Web
Commercial website design/development/sales experience for educational organizations.

### About
RFMSH, Almaty/Kazakhstan, Python/C++/Java, AP Physics C Mechanics, AP Physics C Electricity & Magnetism, AP Computer Science A, AP Calculus BC, Yandex Lyceum, 1C internship and future-engineer direction.

### Lab
Football, basketball, chess, coding, 3D modeling, cubing, Cubing Club Owner and ~15 cube variants.

## Visual rules

- restrained warm paper / graphite palette;
- no generic SaaS cards;
- no decorative particles;
- no gratuitous custom cursor;
- no random RGB accents;
- hairlines and whitespace instead of shadows;
- large typography used selectively, not as filler;
- every large animation must support navigation, hierarchy, explanation or story.

## Motion rules

- micro interactions: ~0.16–0.24s;
- controls: ~0.32–0.5s;
- section reveals: ~0.65–0.95s;
- route transitions: ~0.7–0.9s;
- one easing language;
- 3D scroll sequences scrubbed to page progress;
- `prefers-reduced-motion` removes unnecessary camera travel and long movement.

## 3D production rules

- 3209 may load critically where it is the hero;
- DECODE is lazy on Home but can preload on its dedicated case-study page;
- Fusion models are smaller and can load near viewport;
- renderer DPR is capped;
- off-screen canvases skip rendering;
- final production pass uses gltfpack/meshoptimizer;
- DECODE named-node / hierarchy behavior must survive optimization.

## Awwwards-oriented QA

Already added:

- GitHub Actions syntax check for `v5.js`;
- required page-tree check;
- localhost route smoke.

Still required before merge/submission:

1. Load all four real GLBs locally.
2. Capture desktop screenshots of each 3D state.
3. Tune camera, scale and lighting from actual screenshots.
4. Test mobile touch layouts.
5. Test Chrome, Safari and Firefox.
6. Run Lighthouse / Core Web Vitals.
7. Compress GLBs.
8. Add final OpenGraph/social image and metadata pass.
9. Proofread every line.
10. Merge `v5-rebuild` into `main` only after visual QA.

## Important principle

More effects do not automatically create a better award site. The final site should feel like one authored system. The motion engine, typography, 3D behavior, project writing and navigation all need to reinforce the same engineering identity.
