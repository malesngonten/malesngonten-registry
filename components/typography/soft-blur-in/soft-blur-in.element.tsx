import { Interactive, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls, Sequence } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";
import { SoftBlurIn } from "./index";

const elementSchema = {
  ...Interactive.baseSchema,
  text: {
    type: "text-content",
    default: "Soft Blur In",
    description: "Title Text",
  },
  fontSize: {
    type: "number",
    default: 72,
    min: 24,
    max: 150,
    step: 2,
    description: "Font Size",
  },
  color: {
    type: "color",
    default: "#171717",
    description: "Text Color",
  },
  width: { type: "number", default: 800, min: 100, step: 10, description: "Width" },
  height: { type: "number", default: 200, min: 50, step: 10, description: "Height" },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ELEMENT_PROP_KEYS = new Set(["text", "fontSize", "color"]);
const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  text: "Soft Blur In",
  fontSize: 72,
  color: "#171717",
};

const SoftBlurInInner = forwardRef<
  HTMLDivElement,
  InteractiveBaseProps & InteractiveTransformProps & { readonly width?: number; readonly height?: number; readonly controls?: SequenceControls } & ComponentProps<typeof SoftBlurIn>
>(({ controls, name, style, width = 800, height = 200, ...rest }, ref) => {
  const outlineRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);
  const componentProps: Record<string, unknown> = { ...ELEMENT_PROP_DEFAULTS };
  const sequenceProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (ELEMENT_PROP_KEYS.has(key)) {
      if (value !== undefined) componentProps[key] = value;
    } else {
      sequenceProps[key] = value;
    }
  }
  return (
    <Sequence layout="none" {...sequenceProps} controls={controls} name={name ?? "<SoftBlurIn>"} outlineRef={outlineRef}>
      <div ref={outlineRef} style={{ position: "relative", width, height, ...style }}>
        <SoftBlurIn {...(componentProps as unknown as ComponentProps<typeof SoftBlurIn>)} />
      </div>
    </Sequence>
  );
});

export const SoftBlurInElement = Interactive.withSchema({
  Component: SoftBlurInInner,
  componentName: "<SoftBlurIn>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
