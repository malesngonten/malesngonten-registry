# MalesNgonten Component Registry 🚀

A curated collection of cinematic, production-ready UI components and terminal simulators for **Remotion**, featuring pitch-preserving audio micro-samples, multi-stage camera zoom, rack-focus blur, and organic typing animations.

---

## Available Components

### 1. Terminal Simulator (`Terminal-Simulator`)
A state-of-the-art cinematic code typing simulator.
- **Pitch-Preserving Audio:** Event-driven per-keystroke micro-samples (`key-click.wav`, `key-space.wav`, `key-enter.wav`) ensuring pristine sound pitch regardless of text length.
- **Camera Tracking & Focal Point:** Dynamic `transformOrigin` tracking cursor X and line Y progress.
- **Advanced Zoom & Rack-Focus Blur:** 4.4x primary zoom-in, 1.2x secondary zoom-in staying until the end, and 1s ease-out quart rack-focus blur on zoom start.
- **Cinematic Whoosh:** 80% entrance duration whoosh synced to frame 0.
- **Dark & Light Mode Support:** Fully responsive surface styling.

---

## Installation & Usage

Add components directly to your Remotion project using the `malesngonten` CLI:

```bash
npx github:malesngonten/malesngonten add Terminal-Simulator
```

### Required Dependencies
Make sure you have installed the required Remotion packages:
```bash
npm install remotion @remotion/media zod
```
