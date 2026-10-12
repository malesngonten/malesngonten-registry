import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const settings = {
  hasActiveReminders: false,
  hasUpcomingReminders: false,
  disableCenterDimming: false,
};

interface InteractiveNebulaShaderProps extends Partial<typeof settings> {
  children?: React.ReactNode;
  mode?: "dark" | "light";
}

export default function InteractiveNebulaShader(props: InteractiveNebulaShaderProps) {
  const s = { ...settings, ...props };
  const frame = useCurrentFrame();
  const isLight = s.mode === "light";
  const bg = isLight ? "#f8fafc" : "#030712";

  const cx1 = 30 + Math.sin(frame * 0.02) * 25;
  const cy1 = 40 + Math.cos(frame * 0.015) * 25;
  const cx2 = 70 + Math.cos(frame * 0.025) * 25;
  const cy2 = 60 + Math.sin(frame * 0.02) * 25;

  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      {/* Interactive Nebula / Liquid Shader Background */}
      <div
        style={{
          position: "absolute",
          inset: -200,
          background: isLight
            ? `radial-gradient(circle at ${cx1}% ${cy1}%, rgba(236,72,153,0.18) 0%, transparent 50%),
               radial-gradient(circle at ${cx2}% ${cy2}%, rgba(6,182,212,0.18) 0%, transparent 50%)`
            : `radial-gradient(circle at ${cx1}% ${cy1}%, rgba(236,72,153,0.3) 0%, transparent 55%),
               radial-gradient(circle at ${cx2}% ${cy2}%, rgba(6,182,212,0.3) 0%, transparent 55%),
               radial-gradient(circle at 50% 50%, rgba(99,102,241,0.2) 0%, transparent 70%)`,
          filter: s.disableCenterDimming ? "none" : "blur(80px)",
          opacity: 0.95,
        }}
      />
      {s.children}
    </AbsoluteFill>
  );
}

export { InteractiveNebulaShader };
