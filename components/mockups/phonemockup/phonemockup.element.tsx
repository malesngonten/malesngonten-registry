import { Interactive, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls, Sequence } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";
import { PhoneMockup } from "./phonemockup";

const elementSchema = {
  ...Interactive.baseSchema,
  theme: {
    type: "enum",
    default: "dark",
    variants: {
      dark: {},
      light: {},
      silver: {},
    },
    description: "Theme",
  },
  scale: {
    type: "number",
    default: 1,
    min: 0.5,
    max: 2,
    step: 0.05,
    description: "Scale",
  },
  showNotification: {
    type: "boolean",
    default: true,
    description: "Show Notification",
  },
  width: {
    type: "number",
    default: 300,
    min: 100,
    step: 10,
    description: "Width",
  },
  height: {
    type: "number",
    default: 600,
    min: 100,
    step: 10,
    description: "Height",
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ELEMENT_PROP_KEYS = new Set(["theme", "scale", "showNotification"]);
const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  theme: "dark",
  scale: 1,
  showNotification: true,
};

type PhoneMockupElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof PhoneMockup>;

const PhoneMockupInner = forwardRef<
  HTMLDivElement,
  PhoneMockupElementProps & { readonly controls: SequenceControls | undefined }
>(({ controls, name, style, width = 300, height = 600, ...rest }, ref) => {
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
      name={name ?? "<PhoneMockup>"}
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
        <PhoneMockup
          {...(componentProps as unknown as ComponentProps<typeof PhoneMockup>)}
        />
      </div>
    </Sequence>
  );
});

export const PhoneMockupElement = Interactive.withSchema({
  Component: PhoneMockupInner,
  componentName: "<PhoneMockup>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
