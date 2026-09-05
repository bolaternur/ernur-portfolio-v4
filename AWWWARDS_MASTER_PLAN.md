# AWWWARDS MASTER PLAN — V5

Goal: maximize the probability of an Awwwards-level result without turning the portfolio into a collection of unrelated effects.

## Core principle

One visual language. One motion language. Three signature moments. Everything else supports content, usability and performance.

Awwwards weighting to design against:
- Design 40%
- Usability 30%
- Creativity 20%
- Content 10%

Developer-quality target:
- Semantics / SEO
- Animations / transitions
- Accessibility
- WPO / performance
- Responsive design
- Markup / metadata

## Architecture decision

Use a static multi-page architecture with a lightweight async transition layer:
- Astro or Vite-generated static pages
- Three.js direct rendering for the two GLBs
- GSAP + ScrollTrigger as the central motion engine
- Lenis synchronized to GSAP ticker
- native View Transitions where useful, with GSAP fallbacks
- no unnecessary React runtime for the core WebGL scenes

## Pages

1. Home
2. Work index
3. DECODE Simple Bot case study
4. 3209-0001-0007 case study / 3D study
5. About / Experience
6. Lab / Experiments
7. Contact
8. 404

Do not add pages just for page count. Every page must contain a distinct reason to exist.

## Signature moment 01 — First-load sequence

First visit only:
- actual critical-asset progress, not fake timing
- minimal line / counter / model-state language
- max perceived wait kept short
- exit uses the same transition geometry as route changes
- preload hero model only; defer the second heavy GLB
- sessionStorage prevents repeating full loader on every page

Motion:
- progress line 0–100
- typography enters only after critical model + fonts are ready
- final loader plane / shutter reveals the hero
- no long cinematic intro that blocks navigation

## Signature moment 02 — Project page transition

Home / Work -> project:
- clicked media or 3D object becomes the transition object
- selected preview expands into the case-study hero
- route swaps underneath
- title lines reveal during the same timeline
- no random full-screen effect unrelated to the selected project

Default secondary-page transition:
- old page lifts slightly and dims
- next page reveals through one controlled clip / mask
- duration around 0.8–1.05s
- one shared easing curve across the site

Back transition reverses the visual logic instead of playing a different effect.

## Signature moment 03 — Two-model choreography

### 3209 model
Use for cinematic entry and technical inspection:
- hero silhouette / material resolve
- subtle cursor parallax
- camera orbit on scroll
- perspective -> profile -> near-orthographic inspection
- one controlled light sweep
- no exploded animation if DECODE already owns that language

### DECODE Simple Bot
Preserve the successful choreography:
- 01 inspect
- 02 separate
- 03 understand
- 04 rebuild

Enhancements around it only:
- better camera framing
- better lighting
- real part labels
- chapter counter
- cleaner background transitions
- improved mobile framing

## Text reveal system

Only four reusable reveal types across the whole site:

A. Line Mask Reveal
- section headlines
- each line reveals from a clipped wrapper
- 0.04–0.07s stagger

B. Word Focus Reveal
- short statements
- words move 12–20px + opacity/blur settles
- never on long paragraphs

C. Technical Label Reveal
- mono labels / numbers
- quick opacity + 4px vertical movement
- small stagger

D. Transition Title Reveal
- route titles split by line
- synchronized with page transition

Rules:
- no character animation on every heading
- body copy usually stays still
- reduced-motion version uses opacity only
- cleanup SplitText / temporary wrappers after animation where possible

## Scroll motion system

Motion tokens:
- micro: 0.16–0.24s
- UI: 0.32–0.5s
- reveal: 0.65–0.9s
- page: 0.85–1.1s
- cinematic 3D chapters: scroll-scrubbed

Use one signature ease family rather than different eases everywhere.

Scroll features:
- restrained smooth scrolling
- section progress indicators only in long case studies
- pinned 3D scenes
- scroll velocity used only for subtle camera / typography response
- no permanent parallax on every element

## Navigation

Minimal persistent shell:
- tiny wordmark / monogram
- Work
- About
- Menu

Full-screen menu:
- project names
- current route indicator
- tiny project metadata
- subtle preview / model thumbnail interaction
- keyboard accessible
- ESC closes
- focus trapped while open

No decorative custom cursor.

## Home page

Hero:
- 3209 GLB is the visual anchor
- concise headline
- role line
- one CTA to work

Then:
- short positioning statement
- selected projects
- DECODE preview
- second GLB preview
- experience proof
- small next-goals block
- contact teaser

## Work index

Not a generic card grid.

Desktop:
- editorial project list + large live preview area
- hover / focus changes preview
- title and metadata stay readable

Mobile:
- stacked projects
- no hover dependency
- poster fallback / lightweight canvas

Project transition originates from selected project media.

## DECODE case-study page

Structure:
- project hero
- short problem / role / tools
- preserved robot 3D sequence
- real part callouts
- CAD / process evidence
- technical decisions
- outcome / what was learned
- next project transition

Avoid fake agency copy. Use real engineering evidence.

## 3209 case-study page

Structure:
- cinematic model hero
- design / CAD context
- geometry inspection
- profile / orthographic movement
- detail views
- process notes
- relationship to software / robotics practice
- next project transition

## About / Experience

Keep concise:
- short personal statement
- Yandex Lyceum
- 1C internship
- robotics / CAD / programming focus
- current targets clearly labeled as targets, not achievements

Optional portrait only if there is a strong real image. Do not use stock imagery.

## Lab / Experiments

This is where extra interactions belong instead of cluttering Home:
- interactive keyboard experiment
- small WebGL / shader studies
- CAD experiments
- motion prototypes
- technical sketches

Each experiment should open in a lightweight detail state or page.

## Contact

Very minimal:
- one main contact action
- GitHub
- optional email / Telegram
- subtle terminal / signal interaction if it adds character

## Microinteraction inventory

Use selectively:
- link underline reveal
- button label slide
- project index hover preview
- nav active-state transition
- focus ring animation
- scroll cue
- progress rail
- number counter reveal
- image / canvas mask entry
- soft magnetic behavior only on one or two hero actions
- 3D light response to pointer
- project next/previous hover
- menu open/close mask
- route transition progress
- optional sound toggle

Do not add:
- random particles
- generic blob backgrounds
- glassmorphism
- constant RGB aberration
- custom cursor for decoration
- hover interactions with no mobile equivalent
- long preloaders on every route

## Sound

Optional, off by default or user-enabled:
- tiny mechanical / servo feedback
- transition tick
- no background music
- Web Audio generated or very small assets
- immediately muting must be possible

## Performance plan

Targets:
- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

3D:
- run gltfpack / meshoptimizer
- preserve named nodes required for DECODE explosion
- use compressed textures where applicable
- cap DPR
- separate desktop / mobile quality
- stop / throttle render loops outside viewport
- lazy-load non-critical GLB
- dispose unused geometries/materials/textures between routes

DOM motion:
- prefer transform + opacity
- avoid layout-triggering animation
- use will-change only temporarily

## Accessibility

- semantic headings / landmarks
- keyboard navigation for every interactive item
- visible focus states
- aria labels for menus / controls
- text remains real DOM, not WebGL-only
- prefers-reduced-motion removes camera flights, large pans and aggressive scale
- static 3D fallback / poster when necessary
- contrast checked on all surfaces

## Responsive strategy

Do not simply scale desktop values down.

Desktop:
- full WebGL choreography
- richer project transition
- pointer interactions

Tablet:
- reduced camera travel
- fewer simultaneous effects

Mobile:
- simpler 3D path
- reduced DPR
- no hover dependencies
- shorter pinned sections
- native scroll feel prioritized

## 404

A designed but lightweight page:
- one small machine / wireframe reference
- clear way home
- no heavy second GLB preload

## Build order

Phase 1 — Architecture
- route structure
- transition manager
- loader manager
- motion tokens
- Lenis / GSAP synchronization

Phase 2 — Global motion
- first-load preloader
- default page transition
- text reveal primitives
- menu transition
- reduced-motion mode

Phase 3 — Pages
- Home
- Work
- DECODE
- 3209
- About
- Lab
- Contact
- 404

Phase 4 — Signature WebGL
- 3209 hero choreography
- DECODE preserved choreography integration
- persistent / transition scene experiments

Phase 5 — Microdetails
- hovers
- labels
- progress
- focus states
- menu previews
- optional sound

Phase 6 — Content
- real project evidence
- screenshots
- CAD renders
- real process notes
- correct metadata

Phase 7 — Performance
- GLB compression
- responsive model quality
- route cleanup
- Lighthouse / Web Vitals

Phase 8 — Awwwards QA
- Chrome / Safari / Firefox
- desktop / laptop / tablet / mobile
- keyboard-only
- reduced motion
- slow connection
- missing WebGL
- 404
- metadata / OG

## Final gate before merging to main

Do not merge because it looks flashy.
Merge only when:
- V5 is clearly visually stronger than the previous site
- both real GLBs work correctly
- transitions feel connected rather than decorative
- content is clear
- mobile is good
- reduced motion works
- Core Web Vitals are within target range in realistic tests
- no route feels unfinished
