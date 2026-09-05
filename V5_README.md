# ERNUR PORTFOLIO V5 — Engineering in Motion

This branch is the full visual rebuild.

## What V5 keeps

- The original DECODE Simple Bot `inspect → separate → understand → rebuild` choreography.
- The real robot GLB as the main case-study object.

## What V5 adds

- `3209-0001-0007.glb` as the cinematic hero and second technical study.
- A new quiet-luxury / industrial visual system.
- Lenis + GSAP ScrollTrigger synchronization.
- Separate lighting and camera direction for the two GLB chapters.
- Responsive and reduced-motion behavior.
- Lazy/idle loading for the heavy DECODE model.

## Required local assets

The launcher tries to find these automatically in Downloads/Desktop:

```text
DECODE Simple Bot(1).glb
or
DECODE Simple Bot.glb

3209-0001-0007.glb
```

It installs them as:

```text
assets/models/robot/DECODE Simple Bot.glb
assets/models/study/3209-0001-0007.glb
```

## Run on Windows

1. Download the `v5-rebuild` branch ZIP and extract it.
2. Put both GLB files anywhere in Downloads if they are not already there.
3. Open the extracted folder and run `START_LOCALHOST.bat`.

If Windows blocks the BAT file, open Terminal/PowerShell in this folder and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-assets.ps1
py -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Visual QA checklist

Before merging V5 into `main`, capture screenshots of:

1. Hero with `3209-0001-0007.glb`.
2. DECODE robot at `inspect`.
3. DECODE robot at full `separate/understand` state.
4. Second GLB study near `orthographic` state.
5. Mobile width if possible.

Do not merge into `main` until the two GLB assets have been visually verified in-browser.
