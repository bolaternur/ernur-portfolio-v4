# ERNUR Portfolio V4

Minimal cinematic portfolio built around one narrative:

**Keyboard → Code → Robot → Motion**

The visual direction uses an obsidian/bone-white system with restrained RGB/prism accents. The interface intentionally avoids custom cursors, glassmorphism, noisy card grids, giant decorative identity labels and random WebGL objects.

## Run on localhost — easiest method

1. Clone or download this repository.
2. Double-click **`START_LOCALHOST.bat`**.
3. The launcher automatically searches your **Downloads** and **Desktop** for:
   - `DECODE Simple Bot.glb`
   - `lowprofilemechanicalkeyboard.obj`
   - `lowprofilemechanicalkeyboard.mtl`
4. It copies any matches into the correct `assets/models/...` folders.
5. Your browser opens automatically at:

`http://localhost:8080`

The page also has procedural 3D fallbacks, so it still opens even if one of the original models is not found.

## Manual localhost

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Do not open `index.html` directly with `file://`; ES modules and 3D assets require HTTP.

## Interactive keyboard

The hero attempts to load the authentic OBJ/MTL keyboard. When the source geometry exposes individual key-sized meshes, those meshes are mapped to keyboard input. If the exported model is merged, the site keeps the authentic keyboard visible and adds a lightweight tactile key layer for the input interaction.

Press keys on your physical keyboard. Supported interaction includes letters, numbers and Space. Keydown produces a short physical depression / light response; keyup returns the key.

## Robot scene

The robot choreography stays focused on the original interaction concept:

1. Inspect
2. Separate
3. Understand
4. Rebuild

The authentic GLB is loaded from:

`assets/models/robot/DECODE Simple Bot.glb`

The section keeps the radial exploded-assembly behavior rather than replacing it with unrelated effects.

## Required model paths

```text
assets/
└── models/
    ├── keyboard/
    │   ├── lowprofilemechanicalkeyboard.obj
    │   └── lowprofilemechanicalkeyboard.mtl
    └── robot/
        └── DECODE Simple Bot.glb
```

## If the automatic asset finder misses your files

Copy them manually into the paths above, refresh localhost, and the page will use the authentic models.

## Current stack

- Three.js
- GSAP + ScrollTrigger
- Vanilla ES modules
- Static HTML/CSS/JS

No framework is required to run the site.

## Before an Awwwards submission

This repository is a creative prototype / portfolio build, not a guarantee of an Awwwards win. Before submitting publicly, do a final pass for:

- GLB compression / Meshopt or gltfpack
- cross-browser testing
- mobile GPU profiling
- Lighthouse / Core Web Vitals
- accessible keyboard navigation
- final contact links
- Open Graph artwork
- production self-hosting of runtime dependencies/fonts where licensing permits

The design goal is **restraint + one memorable interaction system**, not the number of visual effects.
