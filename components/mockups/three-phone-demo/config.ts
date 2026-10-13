import { type ComponentConfig } from "@/lib/customizer-config";

export const threePhoneDemoConfig: ComponentConfig = {
  componentName: "ThreePhoneDemo",
  importPath: "@/components/mockups/three-phone-demo",
  controls: {
    theme: {
      type: "enum",
      default: "silver",
      variants: { silver: {}, black: {}, blue: {}, green: {}, purple: {} },
      description: "Phone color",
    },
    view: {
      type: "enum",
      default: "front",
      variants: { front: {}, back: {} },
      description: "View",
    },
  },
  durationInFrames: 300,
  fps: 30,
  compositionWidth: 1280,
  compositionHeight: 720,
  previewBackdrop: { type: "color", value: "#f1f5f9" },
};
