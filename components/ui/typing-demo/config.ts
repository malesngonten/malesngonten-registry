import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const typingDemoConfig: ComponentConfig = {
  componentName: "TypingDemo",
  importPath: "@/components/ui/typing-demo",
  controls: {
    mode: {
      type: "enum",
      default: "light",
      variants: { light: {}, dark: {} },
      description: "Theme",
    },
    codeText: {
      type: "text-content",
      default:
        "import React from \"react\";\nimport { interpolate, useCurrentFrame, AbsoluteFill } from \"remotion\";\n\nexport const CinematicTerminal = ({ title = \"Remotion Studio\" }) => {\n  const frame = useCurrentFrame();\n  \n  const opacity = interpolate(frame, [0, 30], [0, 1], {\n    extrapolateRight: \"clamp\",\n  });\n\n  const scale = interpolate(frame, [0, 45], [0.9, 1], {\n    extrapolateRight: \"clamp\",\n  });\n\n  return (\n    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>\n      <div className=\"terminal-header\">\n        <span>{title}</span>\n      </div>\n      <div className=\"terminal-body\">\n        <p>Rendering cinematic frames at 60fps...</p>\n      </div>\n    </AbsoluteFill>\n  );\n};",
      description: "Code text",
    },
    enableWhoosh: {
      type: "boolean",
      default: true,
      description: "Enable whoosh SFX",
    },
    whooshVolume: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.18,
      description: "Whoosh volume",
    },
    enableTypingAudio: {
      type: "boolean",
      default: true,
      description: "Enable typing SFX",
    },
    typingVolume: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.5,
      description: "Typing volume",
    },
  },
  durationInFrames: 300,
  fps: 30,
  compositionWidth: 1280,
  compositionHeight: 720,
  previewBackdrop: { type: "color", value: "#090d16" },
};
