import { Interactive, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls, Sequence } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";
import { AnimatedGradient } from "./animated-gradient";

const elementSchema = {
  ...Interactive.baseSchema,
  variant: {
    type: "enum",
    default: "mist",
    variants: {
      mist: {},
      lava: {},
      vortex: {},
    },
    description: "Gradient variant",
  },
  speed: {
    type: "number",
    default: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    description: "Animation speed",
  },
  opacity: {
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.05,
    description: "Opacity",
  },
  width: {
    type: "number",
    default: 1280,
    min: 100,
    step: 10,
    description: "Width",
  },
  height: {
    type: "number",
    default: 720,
    min: 100,
    step: 10,
    description: "Height",
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ELEMENT_PROP_KEYS = new Set(["variant", "speed", "opacity"]);
const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  variant: "mist",
  speed: 1,
  opacity: 1,
};

type AnimatedGradientElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof AnimatedGradient>;

const AnimatedGradientInner = forwardRef<
  HTMLDivElement,
  AnimatedGradientElementProps & { readonly controls: SequenceControls | undefined }
>(({ controls, name, style, width = 1280, height = 720, ...rest }, ref) => {
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
    <Sequence
      layout="none"
      {...sequenceProps}
      controls={controls}
      name={name ?? "<AnimatedGradient>"}
      outlineRef={outlineRef}
    >
      <div
        ref={outlineRef}
        style={{
          position: "relative",
          width,
          height,
          ...style,
        }}
      >
        <AnimatedGradient
          {...(componentProps as unknown as ComponentProps<typeof AnimatedGradient>)}
        />
      </div>
    </Sequence>
  );
});

export const AnimatedGradientElement = Interactive.withSchema({
  Component: AnimatedGradientInner,
  componentName: "<AnimatedGradient>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
