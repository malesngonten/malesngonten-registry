# Terminal Simulator & Cinematic Code Typing Skill (`terminal-simulator`)

## Overview
A comprehensive, portable agent skill package for AI agents and developers to scaffold, customize, and animate **cinematic code typing terminal simulators** in Remotion. 

Whether installed via Gemini CLI, Antigravity, or CLI prompt runners (`npx malesngonten add Terminal-Simulator`), this skill equips any AI agent with the exact architectural patterns, math, audio synchronization, and visual design tokens required to reproduce our signature terminal simulator.

---

## Core Architectural Specifications

### 1. Pitch-Preserving Audio Architecture (Per-Keystroke Micro-Samples)
- **Concept:** Never use stretched master audio tracks that shift pitch when text length changes.
- **Implementation:**
  - Dynamically generate `typingCues` array based on character progression (`charsCount`).
  - Map characters (`\n` -> `keyEnter`, ` ` -> `keySpace`, others -> `keyClick`) to precise frame offsets.
  - Render each keystroke via Remotion's `<Sequence from={cue.frame} durationInFrames={30}><Audio src={staticFile(...)} volume={cue.volume} /></Sequence>`.
  - **Result:** Pitch remains 100% pristine, natural, and constant regardless of code snippet length.

### 2. Camera Tracking & Dynamic Focal Point
- Calculate character-level progress (`charIndexInLine` and `activeLineIndex`).
- Compute dynamic `targetFocalX` and `targetFocalY` based on monospaced font geometry (`charWidth` and `lineHeight`).
- Set `transformOrigin: \`\${targetFocalX}px \${targetFocalY}px\`` on the terminal container to create organic camera tracking following the typing cursor.

### 3. Advanced Multi-Stage Zoom & Cinematic Blur Focus
- **Primary Zoom:** 4.4x zoom-in starting at frame 45 for 4 seconds (120 frames), followed by a zoom-out back to 1x.
- **Secondary Zoom:** Shortly after zoom out, a subtle secondary zoom-in (`1.2x` scale / `+0.2x` factor) over 1 second (30 frames) with ease-out quart (`Easing.out(Easing.poly(4))`), remaining zoomed in until the end of the video.
- **Cinematic Focus Blur (Rack Focus):** Applied **only** at the start of zoom snaps (both primary and secondary zooms) for 1 second (30 frames) with ease-out quart (`Easing.out(Easing.poly(4))`), starting at 8px blur and snapping to sharp (0px). No blur on zoom out or zoom end.

### 4. Sound Effect & Volume Calibration
- **Entrance Whoosh (`fire-whoosh.wav`):** Wrapped in `<Sequence from={0} durationInFrames={40}>` (80% of the 50-frame entrance animation duration) with `startFrom={4}` to eliminate initial audio padding and ensure instant synchronization.
- **Optimized Volumes:**
  - `whooshVolume = 0.18` (subtle, clean cinematic impact).
  - `typingVolume = 0.5` (balanced with micro-samples).

---

## Terminal Simulator Visual Guidelines (Dark & Light Mode)

### Dark Mode (`mode: 'dark'`)
- Stage Background: Dark `#090d16`
- Terminal Card Background: Dark Slate `#0f172a`
- Border & Glow: Vibrant neon gradient (`linear-gradient(90deg, #ec4899, #06b6d4)`) with multi-layered neon `box-shadow`.

### Light Mode (`mode: 'light'`)
- Stage Background: Pure White `#ffffff`
- Terminal Card Background: Dark/Light contrast or Clean White `#ffffff` with deep contrast card style.
- Border & Glow: Solid black or deep dark charcoal border (`2px solid #000000` or gradient) with sharp dark shadow/glow (`0 0 40px rgba(0, 0, 0, 0.25), 0 20px 40px rgba(0, 0, 0, 0.15)`).

---

## Installation & Usage Prompt
To scaffold or modify this component using any AI agent:
```bash
npx malesngonten add Terminal-Simulator
```
