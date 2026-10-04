import { cn } from "../../lib/utils";
import { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface AnimatedGradientProps {
  className?: string;
  variant?: "mist" | "lava" | "vortex";
  speed?: number;
  opacity?: number;
  children?: React.ReactNode;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const MIST_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define TWO_PI 6.28318530718
  #define PI 3.14159265358979323846

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    float x1 = mix(a, b, u.x);
    float x2 = mix(c, d, u.x);
    return mix(x1, x2, u.y);
  }

  void main() {
      vec2 uv = v_uv;

      float t = u_time * 0.975 - 1.175;
      float noise_scale = 0.00338;

      uv -= 0.5;
      uv *= (noise_scale * u_resolution);
      uv /= 1.5;
      uv += 0.5;

      float n1 = noise(uv * 1.0 + t);
      float n2 = noise(uv * 2.0 - t);
      float angle = n1 * TWO_PI;
      uv.x += 0.32 * n2 * cos(angle);
      uv.y += 0.32 * n2 * sin(angle);

      for (int i = 1; i <= 5; i++) {
          float fi = float(i);
          uv.x += 0.65 / fi * cos(t + fi * 1.5 * uv.y);
          uv.y += 0.65 / fi * cos(t + fi * 1.0 * uv.x);
      }

      float sh = 1.0 - uv.y;
      sh -= 0.5;
      sh /= (noise_scale * u_resolution.y);
      sh += 0.5;

      float shape_scaling = 0.104;
      float shape = smoothstep(0.45 - shape_scaling, 0.55 + shape_scaling, sh + 0.3 * (0.33 - 0.5));
      float mixer = shape;

      vec3 bg = vec3(0.0196, 0.0196, 0.0196);
      vec3 pink = vec3(1.0, 0.4, 0.7215);

      float mistFocus = pow(sin(mixer * PI), 4.2);
      float fineMist = noise(uv * 3.5 - t * 1.3) * 0.4 + noise(uv * 1.5 + t * 0.85) * 0.6;
      float combinedDensity = mix(mixer, fineMist, 0.28) * mistFocus;

      vec3 col = mix(bg, pink, smoothstep(0.0, 0.85, combinedDensity));
      float highlight = smoothstep(0.42, 0.88, fineMist) * smoothstep(0.12, 0.9, mixer) * mistFocus;
      col = mix(col, pink * 1.15, highlight * 0.35);

      vec2 raySource = vec2(0.2, 1.25);
      vec2 rayDir = normalize(v_uv - raySource);
      float rayAngle = atan(rayDir.y, rayDir.x);
      
      float rays = sin(rayAngle * 6.5 + t * 0.35) * 0.35 +
                   sin(rayAngle * 12.0 - t * 0.22) * 0.25 +
                   sin(rayAngle * 24.0 + t * 0.15) * 0.15;
      rays = smoothstep(0.15, 0.82, rays * 0.5 + 0.5);

      float rayGlow = rays * smoothstep(0.15, 0.9, combinedDensity) * (1.1 - v_uv.y) * mistFocus * 0.7;
      col += pink * rayGlow * 0.38;

      float grain = random(gl_FragCoord.xy * 0.15 + t * 0.05);
      float particles = step(0.988, grain) * smoothstep(0.2, 0.9, combinedDensity);
      col += pink * particles * 0.32;

      col = pow(col, vec3(0.92));

      gl_FragColor = vec4(col, 1.0);
  }
`;

const LAVA_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 2; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    float t = u_time * 0.22;
    float sway = sin(uv.x * 2.5 + u_time * 0.45) * 0.07;
    
    vec2 q = vec2(0.0);
    q.x = fbm(uv * 2.0 + vec2(0.0, -t));
    q.y = fbm(uv * 2.0 + vec2(t * 0.35, -t * 0.85));
    
    vec2 r = vec2(0.0);
    r.x = fbm(uv * 2.2 + 2.8 * q + vec2(1.7, -t * 1.5));
    r.y = fbm(uv * 2.2 + 2.8 * q + vec2(8.3, -t * 1.25));
    
    float f = fbm(uv * 1.05 + 1.65 * r);
    float fire = (1.0 - (uv.y + sway)) * 1.15; 
    
    float noiseGlow = f * 1.65 * (1.1 - uv.y);
    float flameIntensity = fire + noiseGlow - 0.78;
    
    float flame = smoothstep(-0.25, 0.95, flameIntensity);
    float orangeGlow = smoothstep(0.12, 0.98, flameIntensity);
    float goldCore = smoothstep(0.38, 1.0, fire + f * 0.75 * (1.1 - uv.y) - 0.42);
    
    float smoke = smoothstep(-0.3, 0.45, flameIntensity) * (1.0 - smoothstep(0.45, 0.95, flameIntensity));
    
    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 deepRed = vec3(0.55, 0.015, 0.0);
    vec3 brightOrange = vec3(0.92, 0.25, 0.0);
    vec3 goldenOrange = vec3(0.96, 0.42, 0.02);
    
    vec3 col = mix(black, deepRed, flame);
    col = mix(col, brightOrange, orangeGlow);
    col = mix(col, goldenOrange, goldCore);
    
    col += deepRed * smoke * 0.35;
    
    float edge = smoothstep(0.25, 0.55, f) * (1.0 - smoothstep(0.55, 0.85, f));
    col += edge * brightOrange * 0.18 * (1.0 - uv.y);
    
    col = pow(col, vec3(0.85));
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const VORTEX_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_dark;

  #define PI 3.14159265358979323846

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 2; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    
    float t = u_time * 0.55;
    vec2 center = vec2(0.5);
    vec2 st = uv - center;
    st.x *= aspect;
    
    float dist = length(st);
    float angle = atan(st.y, st.x);
    
    float swirl = 3.2 / (dist + 0.3);
    angle += swirl * 0.6 * smoothstep(0.04, 0.25, dist) + t * 0.3;
    
    float rippleMask = smoothstep(0.08, 0.35, dist);
    dist += sin(angle * 2.0 - t * 1.2) * 0.015 * rippleMask * (1.0 - smoothstep(0.0, 0.9, dist));
    
    vec2 twisted = vec2(cos(angle), sin(angle)) * dist;
    twisted.x /= aspect;
    twisted += center;
    
    vec2 flowCoord = twisted * 1.5;
    
    vec2 q = vec2(
      fbm(flowCoord - t * 0.04),
      fbm(flowCoord + vec2(5.2, 1.3) + t * 0.02)
    );
    
    vec2 r = flowCoord + q * 0.35;
    float f = fbm(r);
    
    float contour = sin(f * 18.0 - t * 1.2);
    
    vec3 bgColor = mix(vec3(1.0), vec3(0.0), u_dark);
    vec3 lineColor = mix(vec3(0.0), vec3(1.0), u_dark);
    
    float line = smoothstep(0.965, 0.985, abs(contour));
    vec3 col = mix(bgColor, lineColor, line);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAGMENT_SHADERS = {
  mist: MIST_SHADER,
  lava: LAVA_SHADER,
  vortex: VORTEX_SHADER,
} as const;

export function AnimatedGradient({
  className,
  variant = "mist",
  speed = 1,
  opacity = 1,
  children,
}: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);

  const frame = useCurrentFrame();
  const { fps, width: videoWidth, height: videoHeight } = useVideoConfig();
  const time = frame / fps;

  // Initialize WebGL context and shaders once on mount or variant change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    glRef.current = gl;

    gl.viewport(0, 0, canvas.width, canvas.height);

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADERS[variant] || FRAGMENT_SHADERS.mist);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    bufferRef.current = buffer;

    return () => {
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, [variant, videoWidth, videoHeight]);

  // Render frame deterministically on every Remotion frame update
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const buffer = bufferRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !buffer || !canvas) return;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const darkLocation = gl.getUniformLocation(program, "u_dark");

    gl.uniform1f(timeLocation, time * speed);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    if (darkLocation) {
      gl.uniform1f(darkLocation, 1.0);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [time, speed, variant, videoWidth, videoHeight]);

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden",
        className,
      )}
      style={{ backgroundColor: "#050505" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ opacity, width: "100%", height: "100%", zIndex: 1 }}
      />
      {children && (
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
}

export default AnimatedGradient;
