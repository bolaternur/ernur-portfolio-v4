# Ernur Portfolio

The current final candidate is the **`v5-rebuild`** branch.

Start here:

- `V5_README.md` — how to run the site locally.
- `V5_STATUS.md` — what is implemented / what still needs QA.
- `V5_FINAL_CHECKLIST.md` — screenshots and production checks before merging.
- `AWWWARDS_MASTER_PLAN.md` — creative/technical direction.

## Local run

Download the `v5-rebuild` branch ZIP, extract it, then run:

```text
START_LOCALHOST.bat
```

If Windows blocks `.bat`, open PowerShell in the extracted folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-assets.ps1
py -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Required 3D source files

Keep these in Downloads/Desktop/Documents before running asset setup:

```text
DECODE Simple Bot(1).glb
3209-0001-0007.glb
Main Assembly.glb
kicker_insert.glb
```

The setup script copies them into the correct `assets/models/...` locations automatically.

## Final site pages

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

Do **not** merge `v5-rebuild` into `main` until the real models have been visually checked and the final performance pass is complete.
