# ERNUR PORTFOLIO — FINAL V5 CANDIDATE

## What is included

- Multi-page portfolio: Home, Work, TraceLab, DECODE, 3209, Fusion 360, Web, About, Lab, Contact, 404.
- 3.8s first-visit cinematic preloader tied to the critical asset loader, with a 7s fail-safe.
- Global GSAP + ScrollTrigger + Lenis motion clock.
- Award Layer: masked word reveals, scroll progress, project hover preview, FLIP-like project expansion, sticky-grid-inspired work motion, menu clip choreography, technical model reticles, TraceLab evidence pulses, magnetic links, section assembly lines and responsive/reduced-motion fallbacks.
- 3209 hero camera follows an authored Catmull-Rom camera path instead of a plain rotate-only presentation.
- DECODE `inspect → separate → understand → rebuild` choreography is preserved.
- Four GLB slots: 3209, DECODE Simple Bot, Main Assembly and Kicker Insert.

## Local launch

1. Extract the package.
2. Keep these real model files in Downloads, Desktop or Documents:
   - `DECODE Simple Bot(1).glb` (or `DECODE Simple Bot.glb`)
   - `3209-0001-0007.glb`
   - `Main Assembly.glb`
   - `kicker_insert.glb`
3. Run `START_LOCALHOST.bat`.
4. If Windows Smart App Control blocks the BAT, open PowerShell in the extracted folder and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-assets.ps1
py -m http.server 8080
```

5. Open `http://localhost:8080`.

`setup-assets.ps1` copies the four models into the expected `assets/models/...` paths automatically.

## First-load replay

The long cinematic preloader runs only on the first visit per browser tab/session. To replay it from DevTools Console:

```js
sessionStorage.removeItem('ernur-v5-seen');
location.reload();
```

## Final visual QA before merging to main

Check with the real GLBs installed:

- Homepage hero: model scale, crop and lighting.
- Signal chapter: CODE → TRACE → CAD → MOTION.
- Selected-work hover preview and project expansion transition.
- TraceLab Evidence Trace animation.
- DECODE inspect state and full separate/understand state.
- 3209 inspection / near-orthographic state.
- Main Assembly and Kicker Insert.
- Menu open + close.
- Mobile Home + DECODE/TraceLab.
- Reduced-motion mode.

## Production checks before an Awwwards submission

- Compress/optimize GLBs with gltfpack / meshoptimizer while preserving DECODE's required hierarchy.
- Lighthouse / Core Web Vitals pass.
- Safari, Chrome and Firefox pass.
- iOS/Android touch pass.
- Final OpenGraph image, favicon, canonical metadata and sitemap.
- Only merge `v5-rebuild → main` after the real-model visual pass.

No award can be guaranteed. The implementation is designed to target award-level design, creativity, usability, content and developer-quality criteria without sacrificing accessibility or performance.
