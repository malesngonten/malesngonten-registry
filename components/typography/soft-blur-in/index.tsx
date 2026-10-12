import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface SoftBlurInProps {
  text?: string;
  fontSize?: number;
  color?: string;
}

export const SoftBlurIn: React.FC<SoftBlurInProps> = ({
  text = "Soft Blur In",
  fontSize = 72,
  color = "#171717",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });

  const opacity = progress;
  const translateY = interpolate(progress, [0, 1], [30, 0]);
  const blur = interpolate(progress, [0, 1], [12, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <h1
        style={{
          fontSize,
          color,
          opacity,
          transform: `translateY(${translateY}px)`,
          filter: `blur(${blur}px)`,
          fontWeight: 700,
          fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
        }}
      >
        {text}
      </h1>
    </div>
  );
};
