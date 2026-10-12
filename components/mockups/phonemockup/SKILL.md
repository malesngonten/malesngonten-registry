# Cinematic 3D Phone Mockup & Local-Axis Flip Skill (`phonemockup`)

## Overview
A comprehensive, portable agent skill package for AI agents and developers to scaffold, customize, and integrate cinematic **3D Phone Mockup components** (`PhoneMockup`) featuring true local-axis 540° flip entrances, physical 3D depth extrusion layers, metallic industrial edges, and bouncy notification pop-ups in Remotion projects.

---

## Core Architecture & Technical Specifications

### 1. True Local-Axis 3D Rotation Architecture
- **Concept:** Prevents the dreaded "camera-center orbiting illusion" where elements placed off-center appear to orbit around the viewport/camera center when rotated in 3D.
- **Implementation:**
  - **Outer Wrapper (Translation & Perspective):** Holds `perspective: 1400px` and translates position (`translateX` from `800px` to `0`), making the perspective vanishing point travel with the phone as it slides in.
  - **Inner Wrapper (Local Center-Axis Rotation):** Applies 3D rotation (`rotateY`, `rotateX`) with `transformOrigin: "center center"`. Because rotation is decoupled from translation, the phone spins **100% strictly around its own local center axis**.

### 2. Physical 3D Depth & Industrial Bezel Styling
- **Physical Extrusion Layers (`translateZ`):** Stacks multiple depth layers along the Z-axis (`translateZ(-4px)` to `translateZ(-35px)`) with polished metallic gradients (`bg-gradient-to-tr from-zinc-300 via-zinc-400 to-zinc-200`) simulating solid metallic bevel thickness.
- **iPhone-like Industrial Edges:** Sleek thin bezels (`p-2.5`) with sharp flat industrial edges (`rounded-[42px]`) and metallic top/right edge highlight lines meeting at a seamless top-right corner curve.

### 3. Snappy Bouncy Notification Pop-Up
- **Concept:** Event-driven notification banner that drops down from the inner top edge of the screen right after the phone finishes its entrance flip.
- **Implementation:**
  - Triggers precisely when the entrance animation stops (`delayFrame = 75`).
  - Uses Remotion's `spring()` with high stiffness (`stiffness: 240`, `damping: 9`) for a snappy, bouncy, modern iOS-style entrance.

---

## Customization Guide

### 1. Integrating the Phone Mockup
```tsx
<PhoneMockup width={300} height={600} scale={1.05} theme="dark">
  <div className="flex flex-col h-full bg-white p-5 justify-between">
    {/* Hero or screen UI content */}
  </div>
</PhoneMockup>
```

### 2. Customizing Entrance & Rotation
- **Entrance Duration:** Controlled via `interpolate(frame, [0, 75], [0, 1], { easing: Easing.out(Easing.poly(4)) })`.
- **Flip Rotation:** 1.5 full turns = `540deg` ending at `18deg`.
- **Tilt (RotateX):** Starts at `30deg`, ends at `25deg` for a cinematic low-angle perspective.
