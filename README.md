# Ernur — Portfolio

Final public portfolio for **Ernur**, a student and future engineer in Almaty, Kazakhstan.

**Live site:** https://bolaternur.github.io/ernur-portfolio-v4/

## Focus

Coding is the main discipline, with work across:

- Python, C++, Java
- creative web development
- TraceLab software engineering
- robotics
- Fusion 360 / CAD
- interactive 3D experiences

## Selected work

- **TraceLab** — engineering evidence infrastructure for student engineering teams
- **DECODE Simple Bot** — interactive robotics study with inspect → separate → understand → rebuild choreography
- **3209 Mechanical Study** — cinematic 3D inspection
- **First Fusion 360 Projects** — Main Assembly + Kicker Insert
- **Client Web Work** — websites designed, developed and sold for educational organizations

## Site stack

- Three.js
- GSAP + ScrollTrigger
- Lenis
- Meshoptimizer / gltfpack production pipeline
- GitHub Actions
- GitHub Pages

The four original GLB files are stored in `source-assets/`. They are **not served directly**. The Pages workflow automatically generates Meshopt-compressed production GLBs before deployment, keeping the public experience much lighter while preserving the original source files in GitHub.

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

## Development

The public branch is `main`. Every push is checked by GitHub Actions and then deployed to GitHub Pages.
