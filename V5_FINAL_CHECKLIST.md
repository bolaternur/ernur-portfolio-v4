# V5 FINAL CHECKLIST

## Local launch

1. Download the `v5-rebuild` branch ZIP.
2. Extract it.
3. Keep these files in Downloads/Desktop/Documents:
   - `DECODE Simple Bot(1).glb`
   - `3209-0001-0007.glb`
   - `Main Assembly.glb`
   - `kicker_insert.glb`
4. Run `START_LOCALHOST.bat`.
5. If Windows blocks it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-assets.ps1
py -m http.server 8080
```

Open `http://localhost:8080`.

## Screenshots needed for final art-direction pass

- Homepage hero with 3209 loaded.
- Homepage TraceLab / selected-work area.
- DECODE inspect state.
- DECODE full separate / understand state.
- 3209 near-orthographic state.
- Main Assembly scene.
- Kicker Insert scene.
- TraceLab Evidence Trace section.
- About / AP section.
- Lab / cube section.
- Mobile homepage.
- Mobile DECODE or TraceLab page.

## Do not merge yet if

- any real GLB is missing;
- a model is cropped or too small;
- scroll feels too long/short;
- page transition blocks navigation;
- mobile text overlaps;
- the loader sits on-screen after the model is ready;
- Lighthouse performance is poor because of unoptimized GLBs.

## Production pass after visual QA

- optimize GLBs with gltfpack / meshoptimizer;
- preserve DECODE named-node hierarchy;
- tune DPR and lazy-load boundaries;
- create final OpenGraph image;
- cross-browser QA;
- Lighthouse/Core Web Vitals;
- merge `v5-rebuild` → `main` only after those checks.
