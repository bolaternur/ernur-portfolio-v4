# ERNUR V5 — AWWWARDS EXECUTION PLAN V2

Goal: build an Awwwards-level personal portfolio that maximizes the chance of recognition. No plan can guarantee an award; every stage below is designed against the public Awwwards scoring dimensions and developer-quality dimensions.

## North star

**Coding first. Physical systems second.**

Narrative: `code → evidence → geometry → machine → iteration`.

Three signature moments, not thirty unrelated tricks:

1. **Boot → 3209 hero handoff** — a first-visit opening sequence that resolves into the real GLB hero.
2. **Project object → project page** — selected media/object becomes the transition into a case study.
3. **DECODE inspect → separate → understand → rebuild** — preserve and art-direct the strongest existing robot choreography.

Everything else supports those moments.

---

## Criterion 1 — Design (public Awwwards score weight: 40%)

### Required
- One visual system across every route: typography, spacing, hairlines, contrast, 3D lighting, motion timing.
- Replace long consecutive text bands with visual storytelling stages.
- Every case study gets an art-directed hero, not a generic title page.
- Real project media dominates: GLBs, TraceLab diagrams/UI, CAD/process evidence, web work.
- One chromatic signature only; no random gradients/glass/particles.
- Desktop and mobile compositions are separately art-directed.
- High-quality empty space and scale rhythm; no repetitive card grids.

### Design target
- Homepage should contain a strong visual/interactive beat every ~1–1.5 viewport heights.
- Paragraphs stay short; long technical detail moves into expandable/case-study layers.

---

## Criterion 2 — Usability (30%)

### Required
- First-visit cinematic loader only; routes never replay the long loader.
- Menu always opens/closes predictably; Escape works; focus is visible and trapped appropriately.
- Back/forward navigation must preserve expected behavior.
- No scroll-jacking. Lenis remains subtle and synchronized with GSAP.
- Interactive 3D never blocks text or navigation.
- Every WebGL experience has a static/reduced-motion fallback.
- Touch controls do not depend on hover.
- Important actions have >=44px practical touch targets.
- Text contrast and reading widths remain strong.

### Page transition rule
Transitions reduce context loss. They must not make navigation feel slower than the page itself.

---

## Criterion 3 — Creativity (20%)

### Required
- Real engineering assets are the creative material: no generic spheres/particles.
- 3209 becomes a cinematic object/camera study.
- DECODE remains a structural exploded-view narrative.
- Main Assembly and Kicker Insert become a “first CAD” progression scene.
- TraceLab gets an interactive evidence path: `source → iteration → test → decision`.
- Cubing becomes a personal Lab interaction rather than a generic hobbies list.
- Project transitions use selected project media as the transition object.

### Rule
Borrow interaction *principles*, never copy another portfolio’s visual identity.

---

## Criterion 4 — Content (10%)

### Required
- TraceLab is a real software case study with problem, thesis, architecture, features, evidence trace, verification and lessons.
- DECODE explains the machine and what is being inspected.
- Fusion 360 page explicitly frames Main Assembly and Kicker Insert as early projects and shows progression.
- Web page explains real commercial ability: designing, developing and selling websites for education businesses, without publishing unnecessary client/private details.
- About: RFMSH, Almaty/Kazakhstan, Python/C++/Java, Yandex Lyceum, 1C, AP Physics C Mechanics, AP Physics C E&M, AP CSA, AP Calculus BC.
- Lab: football, basketball, chess, coding, 3D modeling, ~15 cube variants, Cubing Club Owner.
- “Future engineer” remains a direction, not an inflated credential.

---

# Developer Award dimensions

## WPO / performance
- Optimize all GLBs with gltfpack/meshoptimizer after camera/node QA.
- Preserve DECODE named-node hierarchy required by explode choreography.
- Hero GLB is the only critical 3D load.
- Robot and Fusion models lazy-load before their sections.
- Device-tier quality: DPR cap, reduced postprocessing, simpler mobile motion.
- Stop expensive render work outside viewport.
- Compress images/video and reserve dimensions to prevent CLS.
- Performance budget is checked on every production candidate.

## Responsive design
- Separate desktop/tablet/mobile choreography using media queries / gsap.matchMedia style logic.
- Shorter pinned scenes on mobile.
- Mobile TraceLab uses a readable evidence sequence, not a miniature infinite canvas.
- 3D camera/scale tuned independently per breakpoint.

## Semantics / SEO
- One meaningful h1 per route.
- Semantic sections/nav/main/footer.
- Descriptive page titles and descriptions.
- Structured project metadata where helpful.
- robots.txt / sitemap.xml on production.
- Canonical URLs after final hosting choice.

## Markup / metadata
- Open Graph image, Twitter/social cards, favicon set, theme color.
- 404 with navigation back to work/home.
- No console errors, broken routes, duplicate IDs or invalid markup.

## Animations / transitions
- One motion clock: Lenis + GSAP + ScrollTrigger + WebGL synchronization.
- Reusable text reveal primitives: line, word, character, metadata.
- Shared timing tokens and one easing family.
- Native View Transition API as progressive enhancement for MPA transitions; custom GSAP fallback/layer where needed.
- Project-media shared-element transition is the signature route pattern.
- No gratuitous animation on every paragraph.

## Accessibility
- `prefers-reduced-motion` equivalent experience.
- Keyboard navigation for menu/projects/interactive demos.
- Escape closes overlays.
- Visible focus styles.
- Semantic alternative for visual TraceLab graph.
- Canvas remains decorative when content is duplicated in accessible DOM.
- No audio without an explicit opt-in toggle.

---

# Implementation phases

## Phase 0 — Opening sequence
- Ship Preloader V2.
- First visit minimum cinematic sequence ~3.1s, but real loading progress still drives the progress UI.
- Route visits use short transition only.
- Add first-paint guard and fail-safe before production.
- Make final loader frame visually hand off to the 3209 hero.

## Phase 1 — Motion foundation
- Introduce production SplitText-based reveal utilities.
- Central animation config/tokens.
- Menu choreography from one GSAP timeline.
- Global route lifecycle and cleanup.
- Progress/focus/hover microinteractions.

## Phase 2 — Homepage art-direction rebuild
- Reduce text density by ~40–55% on Home.
- 3209 cinematic hero.
- TraceLab interactive teaser instead of text-only project row.
- Project index with live visual preview.
- DECODE robot chapter.
- Fusion dual-GLB chapter.
- Web work visual gallery.
- Cubing teaser / Lab handoff.

## Phase 3 — Shared-element project transitions
- Selected project preview expands/travels into destination hero.
- Use native `view-transition-name` where robust.
- Use GSAP/Flip or persistent WebGL pattern where the art direction requires it.
- Back navigation reverses the logic when feasible.

## Phase 4 — TraceLab case study
- Animate `work → why → evidence → test → decision → next` as a visual sequence.
- Evidence Trace becomes interactive/focusable.
- Add architecture/system visual without fake screenshots.
- Surface verified technical details from supplied handoffs.

## Phase 5 — 3D chapters
- 3209: camera path, silhouette/material resolve, inspection.
- DECODE: preserve explode/rebuild math, tune light/camera/callouts.
- Fusion: Main Assembly / Kicker Insert different interaction language from DECODE.
- Add model loading states and graceful fallbacks.

## Phase 6 — Work / Web / Lab visual systems
- Work index: sticky/infinite visual preview only if it remains easy to navigate.
- Web work: visual browser frames / interface fragments / process evidence.
- Lab: cube interaction and experimental effects live here so the main portfolio remains disciplined.

## Phase 7 — Optional sound
- Procedural Web Audio micro-sound only.
- Default off / explicit sound toggle.
- No autoplay music.

## Phase 8 — Production performance pass
- gltfpack/meshoptimizer.
- image/video compression.
- preload only truly critical resources.
- cache headers once hosted.
- reduce long tasks / unnecessary RAF work.
- measure real page loads and route transitions.

## Phase 9 — Accessibility / mobile / browser pass
- Keyboard-only QA.
- Reduced-motion QA.
- Chrome/Safari/Firefox.
- iOS/Android widths.
- slow network / missing WebGL / model failure.

## Phase 10 — Submission polish
- Final copy edit.
- OG/social image.
- favicon/meta/sitemap/robots.
- Lighthouse + Core Web Vitals.
- screen-capture the three signature moments.
- merge `v5-rebuild` to `main` only after visual QA is clearly stronger than old portfolio.

---

# Hard rejection list

Do not add merely because a component looks cool:
- generic particle backgrounds;
- glassmorphism cards;
- neon gradients everywhere;
- a decorative custom cursor covering native affordances;
- a different easing/transition style in every section;
- autoplay sound;
- looping letter animation on body copy;
- duplicated explode animations for all GLBs;
- effects that materially hurt mobile performance or readability.

The award strategy is **density of authored detail**, not density of effects.
