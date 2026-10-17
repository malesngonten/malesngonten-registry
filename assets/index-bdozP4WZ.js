import{a as m,j as a,A as u}from"./index-DfUQpdcJ.js";import{makeCanvasFilter as f,makeFilterShader as v}from"./index-dciIqUK0.js";const c={compression:.7,blockSize:10,noise:.6,intensity:1},p=`#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform float u_frame;
uniform vec2 u_cell;
uniform float u_compression;
uniform float u_noise;
uniform float u_intensity;

in vec2 v_uv;
out vec4 outColor;

const float PI = 3.141592653589793;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float lumaOf(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec2 chromaOf(vec3 c) {
  return vec2(c.b - lumaOf(c), c.r - lumaOf(c));
}

vec3 fromLumaChroma(float y, vec2 cbcr) {
  return vec3(y + cbcr.y, y - 0.194 * cbcr.x - 0.509 * cbcr.y, y + cbcr.x);
}

vec3 blockMean(vec2 origin, vec2 cell) {
  vec3 total = vec3(0.0);
  for (int y = 0; y < 2; y++) {
    for (int x = 0; x < 2; x++) {
      vec2 at = origin + (vec2(float(x), float(y)) + 0.5) * cell * 0.5;
      total += texture(u_scene, at).rgb;
    }
  }
  return total * 0.25;
}

void main() {
  vec4 src = texture(u_scene, v_uv);
  float amount = clamp(u_intensity, 0.0, 1.0);

  if (!(amount > 0.001)) {
    outColor = src;
    return;
  }

  vec2 cell = max(u_cell, vec2(0.0008));
  vec2 wide = cell * 2.0;

  vec3 lumaBlock = blockMean(floor(v_uv / cell) * cell, cell);
  vec3 chromaBlock = blockMean(floor(v_uv / wide) * wide, wide);

  float squeeze = clamp(u_compression, 0.0, 1.0) * amount;

  float y = mix(lumaOf(src.rgb), lumaOf(lumaBlock), squeeze * 0.8);
  float levels = mix(255.0, 20.0, squeeze);
  y = floor(y * levels + 0.5) / levels;

  vec2 cbcr = mix(chromaOf(src.rgb), chromaOf(chromaBlock), squeeze);
  cbcr *= mix(1.0, 0.62, amount);

  vec3 color = fromLumaChroma(y, cbcr);

  float pump = 1.0 + 0.03 * sin(u_frame * PI / 45.0) * amount;
  color = clamp((color * pump - 0.05 * amount) / (1.0 - 0.14 * amount), 0.0, 1.0);

  float clock = mod(u_frame, 64.0);
  float shadow = 1.0 - smoothstep(0.0, 0.55, y);
  float grain =
    hash(v_uv + vec2(clock * 0.017, clock * 0.029)) - 0.5;
  color += grain * 0.16 * u_noise * amount * (0.25 + shadow);

  outColor = vec4(clamp(color, 0.0, 1.0), src.a);
}`,h=v(p,({gl:e,uniform:o,passedProps:l})=>{const{compression:r,cellX:t,cellY:s,noise:n,intensity:i}=l;e.uniform1f(o("u_compression"),r),e.uniform2f(o("u_cell"),t,s),e.uniform1f(o("u_noise"),n),e.uniform1f(o("u_intensity"),i)}),y=({children:e,intensity:o})=>a.jsxs(u,{children:[a.jsx(u,{style:{filter:`saturate(${1-.38*o}) contrast(${1+.22*o}) brightness(${1-.05*o})`},children:e}),a.jsx(u,{style:{background:"radial-gradient(ellipse 82% 80% at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.55) 100%)",opacity:o}})]}),_=f({shader:h,fallback:y}),d=({compression:e=c.compression,blockSize:o=c.blockSize,noise:l=c.noise,intensity:r=c.intensity,children:t})=>{const{width:s,height:n}=m();return a.jsx(_,{compression:e,cellX:Math.max(o,1)/s,cellY:Math.max(o,1)/n,noise:l,intensity:r,children:t})};export{d as SecurityCam};
