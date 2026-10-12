import { Interactive, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls, Sequence } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";
import { TypingDemo } from "./TypingDemo";

const elementSchema = {
  ...Interactive.baseSchema,
  mode: {
    type: "enum",
    default: "light",
    variants: {
      light: {},
      dark: {},
    },
    description: "Theme mode",
  },
  whooshVolume: {
    type: "number",
    default: 0.18,
    min: 0,
    max: 1,
    step: 0.05,
    description: "Whoosh Volume",
  },
  typingVolume: {
    type: "number",
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.05,
    description: "Typing Volume",
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

const ELEMENT_PROP_KEYS = new Set(["mode", "whooshVolume", "typingVolume", "codeText"]);
const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  mode: "light",
  whooshVolume: 0.18,
  typingVolume: 0.5,
};

type TerminalSimulatorElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof TypingDemo>;

const TerminalSimulatorInner = forwardRef<
  HTMLDivElement,
  TerminalSimulatorElementProps & { readonly controls: SequenceControls | undefined }
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
      name={name ?? "<TerminalSimulator>"}
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
        <TypingDemo
          {...(componentProps as unknown as ComponentProps<typeof TypingDemo>)}
        />
      </div>
    </Sequence>
  );
});

export const TerminalSimulatorElement = Interactive.withSchema({
  Component: TerminalSimulatorInner,
  componentName: "<TerminalSimulator>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
