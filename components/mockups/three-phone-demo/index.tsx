import React, { useCallback, useLayoutEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useThree, useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AbsoluteFill } from "remotion";
import { z } from "zod";

const maskFontFamily = "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif";

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  React.useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl, scene]);
  return null;
};

const Lights: React.FC = () => (
  <>
    <Env />
    <ambientLight intensity={1.5} />
    <directionalLight position={[400, 600, 500]} intensity={4.5} castShadow />
    <directionalLight position={[-400, -300, -200]} intensity={2.0} color="#93c5fd" />
    <directionalLight position={[0, -500, 500]} intensity={1.5} color="#ffffff" />
  </>
);

const CameraController: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}> = ({ position, target, fov }) => {
  const { camera } = useThree();
  const apply = useCallback(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(position[0], position[1], position[2]);
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    cam.lookAt(target[0], target[1], target[2]);
    cam.updateMatrixWorld(true);
  }, [camera, position, target, fov]);

  useLayoutEffect(apply);
  useFrame(apply);

  return null;
};

const THEME_GLB_MAP = {
  silver: "/3d/iphone_blue.glb",
  black: "/3d/iphone_black.glb",
  blue: "/3d/iphone_blue.glb",
  green: "/3d/iphone_green.glb",
  purple: "/3d/iphone_red.glb",
};

type PhonePose = {
  x?: number;
  y?: number;
  z?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
};

interface PhoneMockup3DProps {
  theme?: keyof typeof THEME_GLB_MAP;
  view?: "front" | "back";
  children?: React.ReactNode;
  sceneChildren?: React.ReactNode;
  width?: number;
  height?: number;
  domWidth?: number;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  cameraFov?: number;
  entryRange?: [number, number] | null;
  entryTranslateX?: number;
  entryTranslateY?: number;
  floatAmount?: number;
  tiltX?: number;
  pose?: PhonePose;
  centerScreen?: boolean;
  screenStyle?: React.CSSProperties;
  showNotch?: boolean;
  screenFontFamily?: string;
}

const PHONE_SCALE = 120;
export const SCREEN_WIDTH = 1.4821 * PHONE_SCALE;
export const SCREEN_HEIGHT = 3.2002 * PHONE_SCALE;
const SCREEN_CENTER: [number, number, number] = [0.0977 * PHONE_SCALE, 0.0823 * PHONE_SCALE, 0.01445 * PHONE_SCALE];
export const SCREEN_DOM_WIDTH = 470;
export const SCREEN_DOM_HEIGHT = (470 * SCREEN_HEIGHT) / SCREEN_WIDTH;
export const SCREEN_ASPECT = SCREEN_HEIGHT / SCREEN_WIDTH;

const PhoneGroup: React.FC<{
  theme?: keyof typeof THEME_GLB_MAP;
  position: [number, number, number];
  rotation: [number, number, number];
  screenAnchorRef: React.RefObject<THREE.Group>;
}> = ({ theme = "silver", position, rotation, screenAnchorRef }) => {
  const glbUrl = THEME_GLB_MAP[theme] || THEME_GLB_MAP.silver;
  const gltf = useLoader(GLTFLoader, staticFile(glbUrl));
  const modelScene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf.scene]);
  return (
    <group position={position} rotation={rotation}>
      <primitive object={modelScene} scale={[120, 120, 120]} position={[0, 0, 0]} />
      <group ref={screenAnchorRef} position={SCREEN_CENTER} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]} />
    </group>
  );
};

const ScreenSyncBridge: React.FC<{
  screenAnchorRef: React.RefObject<THREE.Group>;
  domRef: React.RefObject<HTMLDivElement>;
  domWidth: number;
  domHeight: number;
}> = ({ screenAnchorRef, domRef, domWidth, domHeight }) => {
  const { camera, scene, size } = useThree();
  const scratch = useMemo(
    () => ({
      ul: new THREE.Vector3(),
      ur: new THREE.Vector3(),
      ll: new THREE.Vector3(),
      uDir: new THREE.Vector3(),
      vDir: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      camPos: new THREE.Vector3(),
      viewDir: new THREE.Vector3(),
      quadToWorld: new THREE.Matrix4(),
      view: new THREE.Matrix4(),
      ndcToPx: new THREE.Matrix4(),
      transform: new THREE.Matrix4(),
    }),
    []
  );
  const sync = useCallback(() => {
    const anchor = screenAnchorRef.current;
    const el = domRef.current;
    if (!anchor || !el) return;
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const hw = SCREEN_WIDTH / 2;
    const hh = SCREEN_HEIGHT / 2;
    scratch.ul.set(-hw, hh, 0).applyMatrix4(anchor.matrixWorld);
    scratch.ur.set(hw, hh, 0).applyMatrix4(anchor.matrixWorld);
    scratch.ll.set(-hw, -hh, 0).applyMatrix4(anchor.matrixWorld);
    scratch.uDir.copy(scratch.ur).sub(scratch.ul);
    scratch.vDir.copy(scratch.ll).sub(scratch.ul);
    scratch.normal.copy(scratch.vDir).cross(scratch.uDir).normalize();
    scratch.camPos.setFromMatrixPosition(camera.matrixWorld);
    scratch.viewDir.copy(scratch.camPos).sub(scratch.ul);
    const viewLen = scratch.viewDir.length();
    if (viewLen > 0 && scratch.normal.dot(scratch.viewDir) / viewLen <= 0.02) {
      el.style.visibility = "hidden";
      return;
    }
    el.style.visibility = "visible";
    scratch.uDir.divideScalar(domWidth);
    scratch.vDir.divideScalar(domHeight);
    scratch.quadToWorld.makeBasis(scratch.uDir, scratch.vDir, scratch.normal);
    scratch.quadToWorld.setPosition(scratch.ul);
    scratch.view.copy(camera.matrixWorld).invert();
    scratch.ndcToPx.set(size.width / 2, 0, 0, size.width / 2, 0, -size.height / 2, 0, size.height / 2, 0, 0, 1, 0, 0, 0, 0, 1);
    scratch.transform
      .copy(scratch.ndcToPx)
      .multiply(camera.projectionMatrix)
      .multiply(scratch.view)
      .multiply(scratch.quadToWorld);
    el.style.transform = `matrix3d(${scratch.transform.elements.join(",")})`;
  }, [camera, domHeight, domRef, domWidth, scene, screenAnchorRef, scratch, size.height, size.width]);
  useLayoutEffect(sync);
  useFrame(sync);
  return null;
};

export const PhoneMockup3D: React.FC<PhoneMockup3DProps> = ({
  theme = "silver",
  view = "front",
  children,
  sceneChildren,
  width = 1280,
  height = 720,
  domWidth = SCREEN_DOM_WIDTH,
  cameraPosition = [0, 0, 580],
  cameraTarget = [0, 0, 0],
  cameraFov = 40,
  entryRange = [0, 50],
  entryTranslateX = 600,
  entryTranslateY = 0,
  floatAmount = 10,
  tiltX = 0,
  pose,
  centerScreen = false,
  screenStyle,
  showNotch = true,
  screenFontFamily = maskFontFamily,
}) => {
  const frame = useCurrentFrame();
  const screenAnchorRef = React.useRef<THREE.Group>(null);
  const phoneScreenDomRef = React.useRef<HTMLDivElement>(null);
  const domHeight = (domWidth * SCREEN_HEIGHT) / SCREEN_WIDTH;
  const progress =
    entryRange === null
      ? 1
      : interpolate(frame, entryRange, [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.poly(4)),
        });
  const targetRotateY = -Math.PI / 2 + (view === "back" ? Math.PI : 0) + (pose?.rotateY ?? 0);
  const entryRotateY = entryRange === null ? targetRotateY : interpolate(progress, [0, 1], [Math.PI * 0.75, targetRotateY]);
  const entryX = entryRange === null ? 0 : interpolate(progress, [0, 1], [entryTranslateX, 0]);
  const entryY = entryRange === null ? 0 : interpolate(progress, [0, 1], [entryTranslateY, 0]);
  const floatY = Math.sin(frame / 45) * floatAmount;
  const floatRotateX = Math.sin(frame / 65) * 0.05 * (floatAmount / 10);
  const rotX = tiltX + floatRotateX + (pose?.rotateX ?? 0);
  const rotY = entryRotateY;
  const rotZ = pose?.rotateZ ?? 0;
  const posX = entryX + (pose?.x ?? 0);
  const posY = floatY + entryY + (pose?.y ?? 0);
  const posZ = pose?.z ?? 0;
  const centerOffset = React.useMemo(() => {
    if (!centerScreen) return null;
    const v = new THREE.Vector3(SCREEN_CENTER[0], SCREEN_CENTER[1], SCREEN_CENTER[2]);
    v.applyEuler(new THREE.Euler(rotX, rotY, rotZ, "XYZ"));
    return v.multiplyScalar(-1);
  }, [centerScreen, rotX, rotY, rotZ]);
  const position: [number, number, number] = [posX + (centerOffset?.x ?? 0), posY + (centerOffset?.y ?? 0), posZ + (centerOffset?.z ?? 0)];
  const rotation: [number, number, number] = [rotX, rotY, rotZ];
  const notchScale = domWidth / SCREEN_DOM_WIDTH;
  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden pointer-events-none">
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ alpha: true, antialias: true }}
        shadows
        camera={{ position: cameraPosition, fov: cameraFov, near: 10, far: 3000 }}
        style={{ position: "absolute", inset: 0, zIndex: 10 }}
      >
        <CameraController position={cameraPosition} target={cameraTarget} fov={cameraFov} />
        <Lights />
        <React.Suspense fallback={null}>
          <PhoneGroup theme={theme} position={position} rotation={rotation} screenAnchorRef={screenAnchorRef} />
          <ScreenSyncBridge screenAnchorRef={screenAnchorRef} domRef={phoneScreenDomRef} domWidth={domWidth} domHeight={domHeight} />
          {sceneChildren}
        </React.Suspense>
      </ThreeCanvas>
      <div
        ref={phoneScreenDomRef}
        className="absolute z-30 pointer-events-auto"
        style={{
          left: 0,
          top: 0,
          width: domWidth,
          height: domHeight,
          transformOrigin: "0 0",
          visibility: "hidden",
          willChange: "transform",
        }}
      >
        <div
          className="relative overflow-hidden bg-white rounded-[48px] shadow-2xl flex flex-col justify-between select-none border-4 border-zinc-200"
          style={{ width: "100%", height: "100%", fontFamily: screenFontFamily, ...screenStyle }}
        >
          {showNotch ? (
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full z-30"
              style={{ top: 15 * notchScale, width: 96 * notchScale, height: 26 * notchScale }}
            />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
};

const EventAppUI: React.FC = () => {
  const frame = useCurrentFrame();
  const bannerOpacity = interpolate(frame, [27, 39], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });
  return (
    <div className="flex flex-col h-full bg-[#fafbfc] text-zinc-900 p-6 justify-between relative select-none" style={{ fontFamily: maskFontFamily }}>
      <div className="flex items-center justify-between pt-1 px-1 text-xs font-bold text-zinc-800">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">5G</span>
          <div className="w-6 h-3 border border-zinc-800 rounded-sm p-0.5 flex items-center">
            <div className="h-full w-3.5 bg-zinc-800 rounded-2xs" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div>
          <h2 className="text-2xl font-extrabold text-black tracking-tight">Birthday</h2>
          <p className="text-[11px] text-zinc-400 font-medium">Event Planning</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-300 shadow-md shadow-cyan-500/30 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-xs" />
          <div className="w-7 h-7 rounded-full bg-cyan-200 blur-xs absolute -top-1 -right-1" />
          <span className="text-sm z-10">✨</span>
        </div>
      </div>
      <div className="flex items-center justify-between bg-white border border-zinc-100 rounded-2xl p-3.5 shadow-xs my-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
            HM
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 leading-tight">H. mansur</div>
            <div className="text-[11px] text-zinc-500">Organizer</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 pr-1">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
          <div className="w-3 h-3 rounded-full bg-orange-500 shadow-xs" />
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
        </div>
      </div>
      <div
        className="rounded-2xl bg-[#0B2F7A] text-white p-4.5 shadow-md flex items-center justify-between relative overflow-hidden my-2 transition-opacity"
        style={{ opacity: bannerOpacity }}
      >
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/30 rounded-full blur-xl" />
        <div className="flex items-center gap-5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-base">👥</span>
            <div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">Invited</div>
              <div className="text-base font-extrabold text-white">5749</div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-base">⭐</span>
            <div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">Confirmed</div>
              <div className="text-base font-extrabold text-white">2798</div>
            </div>
          </div>
        </div>
        <div className="bg-[#FF6B4A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">VIP</div>
      </div>
      <div className="my-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-sm bg-[#FF6B4A]" />
          <span className="text-xs font-bold text-zinc-800">Event schedule</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-600 rounded-xl p-2.5 text-white flex flex-col justify-between shadow-xs h-20">
            <span className="text-[10px] font-medium text-blue-100">Open</span>
            <span className="text-xs font-bold tracking-tight">10:50</span>
          </div>
          <div className="bg-cyan-500 rounded-xl p-2.5 text-white flex flex-col justify-between shadow-xs h-20">
            <span className="text-[10px] font-medium text-cyan-100">Guest</span>
            <span className="text-xs font-bold tracking-tight">11:30</span>
          </div>
          <div className="bg-[#FF6B6B] rounded-xl p-2.5 text-white flex flex-col justify-between shadow-xs h-20">
            <span className="text-[10px] font-medium text-rose-100">Dinner</span>
            <span className="text-xs font-bold tracking-tight">13:15</span>
          </div>
          <div className="bg-[#F59E0B] rounded-xl p-2.5 text-white flex flex-col justify-between shadow-xs h-20">
            <span className="text-[10px] font-medium text-amber-100">Party</span>
            <span className="text-xs font-bold tracking-tight">15:00</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-white border border-zinc-100 rounded-2xl p-3.5 shadow-xs mt-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block w-7 h-7 rounded-full ring-2 ring-white bg-blue-400 text-[10px] text-white font-bold flex items-center justify-center">A</div>
            <div className="inline-block w-7 h-7 rounded-full ring-2 ring-white bg-emerald-400 text-[10px] text-white font-bold flex items-center justify-center">B</div>
            <div className="inline-block w-7 h-7 rounded-full ring-2 ring-white bg-purple-400 text-[10px] text-white font-bold flex items-center justify-center">C</div>
          </div>
          <span className="text-xs text-zinc-500 font-medium">+1.2k joined</span>
        </div>
        <div className="bg-[#FEF08A] text-amber-900 font-bold text-sm px-5 py-2 rounded-full shadow-xs flex items-center gap-1.5">
          <span>✓</span> Going
        </div>
      </div>
    </div>
  );
};

export const threePhoneDemoSchema = z.object({
  theme: z.enum(["silver", "black", "blue", "green", "purple"]).default("silver"),
  view: z.enum(["front", "back"]).default("front"),
});

interface ThreePhoneDemoProps {
  theme?: keyof typeof THEME_GLB_MAP;
  view?: "front" | "back";
}

export const ThreePhoneDemo: React.FC<ThreePhoneDemoProps> = ({ theme = "silver", view = "front" }) => {
  const frame = useCurrentFrame();
  const mockupProgress = interpolate(frame, [25, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });
  const mockupTranslateY = (1 - mockupProgress) * 60;
  const mockupOpacity = mockupProgress;
  const phoneProgress = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });
  const phoneTranslateY = (1 - phoneProgress) * 60;
  const phoneOpacity = phoneProgress;
  const sub1Progress = interpolate(frame, [35, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });
  const sub1TranslateY = (1 - sub1Progress) * 40;
  const sub1Opacity = sub1Progress;
  const sub2Progress = interpolate(frame, [40, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const sub2TranslateY = (1 - sub2Progress) * 40;
  const sub2Opacity = sub2Progress;
  return (
    <AbsoluteFill
      className="bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] flex flex-row items-center justify-between px-16 select-none overflow-hidden"
      style={{ fontFamily: maskFontFamily }}
    >
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/3 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col items-start z-20 max-w-2xl pl-8">
        <div className="flex flex-col font-black tracking-tighter text-8xl leading-none" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          <div className="overflow-hidden py-2 -my-2">
            <span className="block" style={{ opacity: mockupOpacity, transform: `translateY(${mockupTranslateY}px)` }}>
              MOCKUP
            </span>
          </div>
          <div className="overflow-hidden py-2 -my-2 mt-3">
            <span className="block" style={{ opacity: phoneOpacity, transform: `translateY(${phoneTranslateY}px)` }}>
              PHONE
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-8 font-light text-zinc-600 text-2xl leading-relaxed">
          <div className="overflow-hidden py-1 -my-1">
            <span className="block" style={{ opacity: sub1Opacity, transform: `translateY(${sub1TranslateY}px)` }}>
              Best way to present application
            </span>
          </div>
          <div className="overflow-hidden py-1 -my-1 mt-1">
            <span className="block" style={{ opacity: sub2Opacity, transform: `translateY(${sub2TranslateY}px)` }}>
              with this template
            </span>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <PhoneMockup3D
          theme={theme}
          view={view}
          domWidth={470}
          cameraPosition={[0, 0, 580]}
          tiltX={0}
          pose={{ x: 160, y: 0, z: 90, rotateZ: 0.5 }}
        >
          <EventAppUI />
        </PhoneMockup3D>
      </div>
    </AbsoluteFill>
  );
};
