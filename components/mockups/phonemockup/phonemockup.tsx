import React from "react";
import { useCurrentFrame, interpolate, Easing, spring } from "remotion";
import { cn } from "../../lib/utils";

interface NotificationPopupProps {
  title?: string;
  message?: string;
  time?: string;
  delayFrame?: number;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  title = "malesngonten",
  message = "New cinematic video rendered successfully! 🎉",
  time = "Just now",
  delayFrame = 75,
}) => {
  const frame = useCurrentFrame();

  const activeFrame = Math.max(0, frame - delayFrame);
  // Fast and bouncy spring animation
  const progress = spring({
    frame: activeFrame,
    fps: 30,
    config: {
      damping: 9,
      stiffness: 240, // very snappy and bouncy
    },
  });

  const translateY = interpolate(progress, [0, 1], [-70, 0]);
  const scale = interpolate(progress, [0, 1], [0.7, 1]);

  if (frame < delayFrame) return null;

  return (
    <div
      className="absolute top-5 left-3 right-3 bg-zinc-900/95 border border-zinc-700/60 backdrop-blur-xl rounded-2xl p-3 flex items-start gap-3 z-30 select-none"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: 1,
      }}
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
        ✨
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between w-full mb-0.5">
          <span className="text-xs font-bold text-white">{title}</span>
          <span className="text-[10px] text-zinc-400">{time}</span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-tight">{message}</p>
      </div>
    </div>
  );
};

interface PhoneMockupProps {
  className?: string;
  imageSrc?: string;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  scale?: number;
  theme?: "dark" | "light" | "silver";
  showNotification?: boolean;
  notificationProps?: NotificationPopupProps;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  className,
  imageSrc,
  children,
  width = 300,
  height = 600,
  scale: scaleProp = 1,
  theme = "dark",
  showNotification = true,
  notificationProps,
}) => {
  const frame = useCurrentFrame();

  // Smooth entrance using ease-out quart with exactly 1.5 full turns (540 degrees) flip
  const progress = interpolate(frame, [0, 75], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)), // ease-out quart
  });

  const translateX = interpolate(progress, [0, 1], [800, 0]);
  const rotateY = interpolate(progress, [0, 1], [540, 18]);
  const rotateX = interpolate(progress, [0, 1], [30, 25]);
  const scale = interpolate(progress, [0, 1], [0.75, scaleProp]);

  // Subtle floating levitation in 3D space
  const floatActive = Math.max(0, frame - 75);
  const floatY = Math.sin(floatActive / 40) * 10;
  const floatRotateY = Math.sin(floatActive / 60) * 2;

  const themeConfig = {
    dark: {
      chassis: "bg-zinc-950 shadow-2xl shadow-black/95",
      reflection: "",
    },
    light: {
      chassis: "bg-white shadow-black/40",
      reflection: "",
    },
    silver: {
      chassis: "bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 shadow-black/50",
      reflection: "",
    },
  }[theme];

  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* 
        ARCHITECTURAL FIX FOR TRUE LOCAL-AXIS 3D ROTATION:
        By placing `perspective` and `translateX` together on the outer wrapper,
        the perspective vanishing point travels with the phone as it slides in.
        This completely eliminates the camera-center orbiting illusion, ensuring
        the 540° flip rotates 100% strictly around the phone's own local center axis.
      */}
      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: "1400px",
          transformStyle: "preserve-3d",
          opacity: 1,
          transform: `translateX(${translateX}px) translateY(${floatY}px)`,
        }}
      >
        {/* Pure Center-Axis Local Rotation Layer */}
        <div
          className="relative flex items-center justify-center"
          style={{
            transform: `rotateY(${rotateY + floatRotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          {/* Brighter Metallic / Shiny 3D Depth Layers with crisp iPhone-like flat industrial edges */}
          <div
            style={{ width, height }}
            className="absolute rounded-[40px] bg-gradient-to-tr from-zinc-300 via-zinc-400 to-zinc-200 -z-10 translate-z-[-35px] scale-[1.02] shadow-2xl"
          />
          <div
            style={{ width, height }}
            className="absolute rounded-[40px] bg-zinc-200 -z-10 translate-z-[-26px] scale-[1.015]"
          />
          <div
            style={{ width, height }}
            className="absolute rounded-[40px] bg-zinc-300 -z-10 translate-z-[-18px] scale-[1.01]"
          />
          <div
            style={{ width, height }}
            className="absolute rounded-[40px] bg-zinc-100 -z-10 translate-z-[-10px] scale-[1.005]"
          />
          <div
            style={{ width, height }}
            className="absolute rounded-[40px] bg-zinc-300 -z-10 translate-z-[-4px] scale-[1.002]"
          />

          {/* Back Camera Module (Visible on the rear side during 540° spin) */}
          <div
            className="absolute top-6 left-6 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xl -z-5 backdrop-blur-md"
            style={{
              width: 84,
              height: 96,
              transform: "translateZ(-36px) rotateY(180deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex justify-between items-center">
              <div className="w-6 h-6 rounded-full bg-black border border-zinc-700 flex items-center justify-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600/80 shadow-sm" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-sm" />
            </div>
            <div className="flex justify-between items-center">
              <div className="w-6 h-6 rounded-full bg-black border border-zinc-700 flex items-center justify-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600/80 shadow-sm" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* Phone Chassis (Solid Black Bezel with sharp iPhone-like industrial edges: rounded-[42px]) */}
          <div
            style={{ width, height }}
            className={cn(
              "relative rounded-[42px] p-2.5 backdrop-blur-2xl flex flex-col overflow-hidden",
              themeConfig.chassis
            )}
          >
            {/* Top Edge Metallic Highlight Line */}
            <div className="absolute top-0 left-12 right-10 h-[2px] bg-gradient-to-r from-transparent via-zinc-300 to-zinc-300 z-40 pointer-events-none" />

            {/* Right Edge Metallic Highlight Line */}
            <div className="absolute top-10 bottom-12 right-0 w-[2px] bg-gradient-to-b from-zinc-300 via-zinc-300 to-transparent z-40 pointer-events-none" />

            {/* Top-Right Corner Metallic Highlight Curve */}
            <div className="absolute top-0 right-0 w-10 h-10 rounded-tr-[42px] border-t-2 border-r-2 border-zinc-300 z-40 pointer-events-none" />

            {/* Screen Bezel Area (Without Notch / Dynamic Island) */}
            <div className="relative w-full h-full rounded-[35px] bg-black overflow-hidden flex flex-col shadow-inner">
              {/* Screen Content */}
              <div className="relative w-full h-full flex flex-col pt-3 overflow-hidden bg-zinc-900">
                {showNotification && <NotificationPopup {...notificationProps} />}
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Mockup Screen"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  children
                )}
              </div>

              {/* Home Indicator Bar */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full z-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
