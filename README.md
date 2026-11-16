# Astral Cruiser 5000 (`AC-5000`)

Scroll-driven 3D solar exploration experience built with **React**, **Vite**, **Three.js**, **GSAP (`ScrollTrigger`)**, **Framer Motion**, and **Lenis**.

## Architecture

- **Persistent WebGL Stage (`src/components/SpaceCanvas.jsx`)**: Custom GLSL solar photosphere and corona shaders, scroll-velocity-reactive starfield, and a multi-part procedural `AC-5000` spacecraft assembly (`Carbon-Composite Heat Shield`, `Centrifugal 1-G Habitation Ring`, `Dual-Phase Ion Fusion Drive`, and `Coronal Plasma Array`).
- **Scroll Choreography (`src/App.jsx`)**: Lenis smooth scroll synced with GSAP `ScrollTrigger` to drive the 3D camera trajectory, pinned exploded vessel inspection, desktop horizontal mission timeline (`Helios-1` through `Helios-6`), and inverse-square orbital telemetry (`1.000 AU` → `0.038 AU`, `1.36 kW/m²` → `942.5 kW/m²`).
- **UI State & Motion (`Framer Motion`)**: Shared-element `layoutId` transitions for chapter navigation indicators, archive filter pills, lightbox frame zoom, cabin tier selection, and accessible FAQ accordions.
- **Scroll-Reactive Web Audio (`src/utils/audioEngine.js`)**: Optional Web Audio API synthesizer modulated by scroll velocity and solar proximity.

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```
