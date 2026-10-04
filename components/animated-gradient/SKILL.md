# Animated Gradient Skill & Customization Guide (`Animated-Gradient`)

## Overview
A high-performance cinematic **Animated Gradient WebGL / Shader component** for Remotion, featuring procedural GLSL noise shaders (`mist`, `lava`, `vortex`), frame-driven synchronization via `useCurrentFrame()`, and full-screen layout.

---

## Customization Guide

### 1. Shader Variants
Pass the `variant` prop to change the procedural background style:
- **`mist` (Default):** Volumetric pink/cyan parallax fog with crepuscular god rays and floating particulate dust.
- **`lava`:** Fiery, glassy volumetric lava wave with smooth domain-warping noise.
- **`vortex`:** Swirling monochrome fluid vortex with marble veins and dense contour lines.

```tsx
<AnimatedGradient variant="lava" speed={0.8} opacity={0.9}>
  {/* Your Content Overlay */}
</AnimatedGradient>
```

### 2. Speed & Motion Control
Adjust the animation speed using the `speed` multiplier prop:
- `speed={0.4}` (Slow, relaxing motion)
- `speed={1.0}` (Default dynamic speed)
- `speed={2.0}` (Fast motion)

### 3. Layering Content
Place any React elements or Remotion typography as children inside `<AnimatedGradient>`. They will automatically render on top of the WebGL canvas (z-index 10).
