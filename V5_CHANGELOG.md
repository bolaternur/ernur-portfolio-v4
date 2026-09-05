# V5 changelog

## Design
- Replaced the V4 keyboard-first visual direction with an engineering-first narrative.
- Introduced warm paper / graphite / controlled orange palette.
- Reduced visible UI and removed decorative RGB treatment.
- Added measured typography, hairline rules and calmer section pacing.

## 3D
- `3209-0001-0007.glb` drives the hero and technical study.
- `DECODE Simple Bot.glb` remains the main robot case study.
- Preserved the existing inspect/separate/understand/rebuild explosion math.
- Added distinct camera choreography for the second GLB so the two scenes do not feel duplicated.

## Motion
- GSAP ScrollTrigger for narrative states.
- Lenis synchronized to GSAP ticker.
- Pointer parallax is restrained to a few degrees.
- WebGL render loops pause outside the viewport.

## Performance / accessibility
- DPR capped on mobile/desktop.
- DECODE robot preloads on idle/near viewport instead of blocking first paint.
- Reduced-motion support retained.
