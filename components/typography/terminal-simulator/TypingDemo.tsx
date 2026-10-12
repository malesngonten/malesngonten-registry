import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, Sequence, staticFile, interpolate, Easing } from "remotion";
import { z } from "zod";
import InteractiveNebulaShader from "./components/ui/liquid-shader";

export const typingDemoSchema = z.object({
  codeText: z.string().optional(),
  mode: z.enum(["dark", "light"]).optional(),
  whooshVolume: z.number().optional(),
  typingVolume: z.number().optional(),
  enableWhoosh: z.boolean().optional(),
  enableTypingAudio: z.boolean().optional(),
});

type Props = z.infer<typeof typingDemoSchema>;

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

const SAMPLE_CODE = `import React from "react";
import { interpolate, useCurrentFrame, AbsoluteFill } from "remotion";

export const CinematicTerminal = ({ title = "Remotion Studio" }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 45], [0.9, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, transform: \`scale(\${scale})\` }}>
      <div className="terminal-header">
        <span>{title}</span>
      </div>
      <div className="terminal-body">
        <p>Rendering cinematic frames at 60fps...</p>
      </div>
    </AbsoluteFill>
  );
};`;

export const TypingDemo: React.FC<Props> = ({
  codeText = SAMPLE_CODE,
  mode = "light",
  whooshVolume = 0.18,
  typingVolume = 0.5,
  enableWhoosh = true,
  enableTypingAudio = true,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const isLight = mode === "light";

  // Dynamic width (~75% of frame width) and strict 16:9 aspect ratio height
  const terminalWidth = width * 0.75;
  const terminalHeight = terminalWidth * (9 / 16);

  // Entrance animation with Ease-Out Quart (poly 4)
  const entranceProgress = interpolate(frame, [0, 50], [0, 1], {
    easing: Easing.out(Easing.poly(4)),
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const translateY = interpolate(entranceProgress, [0, 1], [250, 0]);
  const scale = interpolate(entranceProgress, [0, 1], [0.82, 1]);
  const opacity = 1;

  // Perspective animation: starts strong side-angle, slowly returns to default (0, 0)
  const perspectiveReturn = interpolate(frame, [0, 160], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const rotateY = interpolate(perspectiveReturn, [0, 1], [-25, 0]) + Math.sin(frame * 0.015) * 1.2;
  const rotateX = interpolate(perspectiveReturn, [0, 1], [14, 0]) + Math.cos(frame * 0.012) * 0.8;

  const getErraticCharsCount = (f: number) => {
    if (f < 10) return 0;
    let curr = 10;
    let count = 0;
    const seedGen = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    let seed = 42;
    for (let i = 0; i < (codeText || SAMPLE_CODE).length; i++) {
      const char = (codeText || SAMPLE_CODE)[i];
      let delay = 3;
      if (char === '\n') delay = 10;
      else if (char === ' ') delay = 6;
      else delay = 3;
      
      curr += Math.floor(delay + (seedGen(seed++) * 2));
      if (curr <= f) {
        count++;
      } else {
        break;
      }
    }
    return Math.min((codeText || SAMPLE_CODE).length, count);
  };

  const charsCount = getErraticCharsCount(frame);
  const displayedCode = (codeText || SAMPLE_CODE).slice(0, charsCount);

  // Pitch-preserving micro-sample sound cues generated per character
  const activeText = codeText || SAMPLE_CODE;
  const typingCues: { frame: number; sound: "keyClick" | "keySpace" | "keyEnter"; volume: number }[] = [];
  
  let cueCurr = 25;
  let cueSeed = 42;
  const cueSeedGen = (s: number) => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < activeText.length; i++) {
    const char = activeText[i];
    let sound: "keyClick" | "keySpace" | "keyEnter" = "keyClick";
    let volume = typingVolume;
    
    if (char === '\n') {
      sound = "keyEnter";
      volume = typingVolume * 1.1;
    } else if (char === ' ') {
      sound = "keySpace";
      volume = typingVolume * 0.9;
    }

    typingCues.push({
      frame: Math.round(cueCurr),
      sound,
      volume,
    });

    let delay = 3;
    if (char === '\n') delay = 10;
    else if (char === ' ') delay = 6;
    else delay = 3;
    
    cueCurr += Math.floor(delay + (cueSeedGen(cueSeed++) * 2));
  }

  // Character-level progress tracking for focal point (X and Y)
  const lines = displayedCode.split("\n");
  const activeLineIndex = lines.length - 1;
  const currentLineChars = lines[activeLineIndex] || "";
  const charIndexInLine = currentLineChars.length;

  // Zoom behavior:
  // 1. Initial 4.4x zoom-in for 4 seconds (120 frames) after frame 45, then zooms out.
  // 2. Shortly after zoom out, secondary slight zoom-in (1.2x scale / +0.2x) over 1.5 seconds (45 frames) with ease-out, staying zoomed in until the end.
  // Alternative (preserved for future use): activeLineIndex > 0 ? 1 : 4.4
  const zoomDuration = 4 * 30; // 4 seconds at 30 fps
  const isPrimaryZoom = frame >= 45 && frame < 45 + zoomDuration;
  
  const secondaryZoomStart = 45 + zoomDuration + 10; // shortly after zoom out
  const secondaryZoomDuration = 30; // 1 second at 30 fps
  const secondaryZoomProgress = interpolate(
    frame,
    [secondaryZoomStart, secondaryZoomStart + secondaryZoomDuration],
    [0, 1],
    {
      easing: Easing.out(Easing.poly(4)),
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }
  );

  const zoomFactor = isPrimaryZoom 
    ? 4.4 
    : frame < secondaryZoomStart 
      ? 1 
      : 1 + secondaryZoomProgress * 0.2;
  // const zoomFactor = frame < 45 ? 1 : activeLineIndex > 0 ? 1 : 4.4;

  // Cinematic focus blur only when zoom snaps start (1 second duration with ease-out quart)
  const blurDuration = 30; // 1 second at 30 fps
  const primaryBlurIn = interpolate(
    frame,
    [45, 45 + blurDuration],
    [8, 0],
    { easing: Easing.out(Easing.poly(4)), extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const secondaryBlurIn = interpolate(
    frame,
    [secondaryZoomStart, secondaryZoomStart + blurDuration],
    [8, 0],
    { easing: Easing.out(Easing.poly(4)), extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const currentBlur = isPrimaryZoom 
    ? (frame < 45 + blurDuration ? primaryBlurIn : 0)
    : (frame >= secondaryZoomStart && frame < secondaryZoomStart + blurDuration ? secondaryBlurIn : 0);

  // Focal point coordinates tracking both character X and line Y progress smoothly
  const padding = 48;
  const headerOffset = 40;
  const lineHeight = 32;
  const charWidth = 12; // approximate monospaced character width in pixels
  
  const targetFocalX = padding + (charIndexInLine * charWidth);
  const targetFocalY = padding + headerOffset + (activeLineIndex * lineHeight);

  return (
    <InteractiveNebulaShader mode={mode} disableCenterDimming={false}>
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          perspective: 1600,
          overflow: "hidden",
        }}
      >
        {/* Entrance Whoosh Sound Effect (80% of 50 frames entrance = 40 frames duration, shifted earlier to remove delay) */}
        {enableWhoosh && (
          <Sequence durationInFrames={40}>
            <Audio
              src={staticFile("audio/fire-whoosh.wav")}
              startFrom={4}
              volume={whooshVolume}
            />
          </Sequence>
        )}

        {/* Pitch-Preserving Per-Keystroke Micro-Samples */}
        {enableTypingAudio && typingCues.map((cue, idx) => {
          const soundFile = 
            cue.sound === "keyEnter" ? "audio/key-enter.wav" :
            cue.sound === "keySpace" ? "audio/key-space.wav" : 
            "audio/key-click.wav";
          
          return (
            <Sequence key={idx} from={cue.frame} durationInFrames={30}>
              <Audio src={staticFile(soundFile)} volume={() => cue.volume} />
            </Sequence>
          );
        })}

        <div
          style={{
            width: terminalWidth,
            height: terminalHeight,
            boxSizing: "border-box",
            borderRadius: 24,
            padding: 48,
            border: "2px solid transparent",
            backgroundImage: isLight
              ? "linear-gradient(#0f172a, #0f172a), linear-gradient(90deg, #000000, #333333)"
              : "linear-gradient(#0f172a, #0f172a), linear-gradient(90deg, #ec4899, #06b6d4)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            boxShadow: isLight
              ? "0 25px 60px rgba(0, 0, 0, 0.4), 0 10px 25px rgba(0, 0, 0, 0.15)"
              : "0 35px 70px rgba(0, 0, 0, 0.85), 0 0 50px rgba(236, 72, 153, 0.35), 0 0 100px rgba(6, 182, 212, 0.25)",
            transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(${translateY}px) scale(${scale * zoomFactor})`,
            filter: currentBlur > 0 ? `blur(${currentBlur}px)` : undefined,
            transformStyle: "preserve-3d",
            transformOrigin: `${targetFocalX}px ${targetFocalY}px`,
            opacity,
            display: "flex",
            flexDirection: "column",
            margin: "auto",
            transition: "transform-origin 0.05s linear",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ marginLeft: 12, fontSize: 14, color: "#64748b" }}>TypingDemo (Human-like Erratic Typing)</span>
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: "32px",
              color: "#e2e8f0",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {displayedCode}
            {Math.floor(frame / 15) % 2 === 0 && <span style={{ color: "#818cf8" }}>_</span>}
          </pre>
        </div>
      </AbsoluteFill>
    </InteractiveNebulaShader>
  );
};
