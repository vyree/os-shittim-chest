# 3D Character Lab

Blue Archive character viewer — real-time 3D rendering with Three.js, in the Shittim Chest OS dark theme.

## Characters

| Character | Model | Animations |
|---|---|---|
| Kurimura Airi (Band) | `airi_band.glb` | Cafe_Walk, Normal_Idle, Cafe_Reaction |
| Hatsune Miku | `miku_fixed.glb` | Cafe_Walk, Cafe_Idle, Cafe_Reaction |
| Arisu (Battle Carrier) | `arisu_carrier_fixed.glb` | Walk, Idle |

Each character only plays animations from its own GLB — never mixed.

## Tech

- **Three.js 0.185.1** (pinned) — `GLTFLoader`, `AnimationMixer`, `OrbitControls`
- **Renderer** (`src/ba-viewer.ts`) — faithful port of the Blue Archive wiki 3D viewer:
  - Inverted-hull black outline (wiki "25%")
  - Unlit materials (raw texture colors, no tone mapping, no shadows)
  - Wiki camera framing (FOV 35°, azimuth 0°, elevation 5°)
  - Per-clip facing corrections (Airi's Normal_Idle faces camera)
  - `hiddenMeshes` — removes unanimated prop nodes that would float at bind pose
- **UI** — React + Vite, Shittim Chest OS theme (MUI blue `#36A4F8`, Fredoka headings)

## Controls

- **WALK** — play animation · **ROTATE** — manual drag orbit (no auto-rotate)
- Position scrubber (0–1000), speed (0–200%), zoom (75–140%)
- Play/pause, loop toggle, reset view, fullscreen
- Arrow buttons nudge the camera in ROTATE mode

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build

```bash
npm run build
# output in dist/
```
