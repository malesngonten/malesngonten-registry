import{j as s,A as o}from"./index-DfUQpdcJ.js";import{makeCanvasFilter as i,makeFilterShader as v}from"./index-dciIqUK0.js";const t={curvature:1,scanlines:1,maskScale:2,vignette:1},p=`#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform float u_frame;
uniform float u_curvature;
uniform float u_scanlines;
uniform float u_mask_scale;
uniform float u_vignette;

in vec2 v_uv;
out vec4 outColor;

const float PI = 3.141592653589793;
const float SCAN_LINES = 240.0;

vec2 warpTube(vec2 uv, float k) {
  vec2 p = uv * 2.0 - 1.0;
  float x2 = p.x * p.x;
  float y2 = p.y * p.y;
  p.x *= 1.0 + k * 0.11 * y2;
  p.y *= 1.0 + k * 0.17 * x2;
  p /= 1.0 + k * 0.045;
  return p * 0.5 + 0.5;
}

vec3 phosphorMask(float x, float scale) {
  float sub = mod(floor(x / max(scale, 1.0)), 3.0);
  vec3 lit = vec3(
    step(sub, 0.5),
    step(0.5, sub) * step(sub, 1.5),
    step(1.5, sub)
  );
  return mix(vec3(0.34), vec3(1.0), lit);
}

void main() {
  vec2 uv = warpTube(v_uv, u_curvature);

  vec2 edge =
    smoothstep(vec2(0.0), vec2(0.005), uv) *
    smoothstep(vec2(0.0), vec2(0.005), 1.0 - uv);
  float inside = edge.x * edge.y;

  vec4 base = texture(u_scene, uv);

  vec3 spread = vec3(0.0);
  for (int i = -2; i <= 2; i++) {
    spread += texture(u_scene, uv + vec2(float(i) * 0.0018, 0.0)).rgb;
  }
  spread /= 5.0;
  vec3 bloom = max(spread - 0.5, vec3(0.0));

  vec3 color = base.rgb;
  color *= phosphorMask(gl_FragCoord.x, u_mask_scale);
  color += bloom * 0.75;

  float scan = mix(1.0, 0.5 + 0.5 * cos(uv.y * SCAN_LINES * PI * 2.0), 0.55);
  color *= mix(1.0, scan, clamp(u_scanlines, 0.0, 1.5));

  vec2 vc = uv * 2.0 - 1.0;
  float radius = length(vc * vec2(0.86, 1.0));
  color *= mix(1.0, smoothstep(1.6, 0.35, radius), clamp(u_vignette, 0.0, 1.5));

  color *= 1.0 + 0.012 * sin(u_frame * PI / 30.0);
  color *= inside;

  outColor = vec4(clamp(color, 0.0, 1.0), max(base.a, 1.0 - inside));
}`,m=v(p,({gl:e,uniform:a,passedProps:r})=>{const{curvature:c=t.curvature,scanlines:n=t.scanlines,maskScale:l=t.maskScale,vignette:u=t.vignette}=r;e.uniform1f(a("u_curvature"),c),e.uniform1f(a("u_scanlines"),n),e.uniform1f(a("u_mask_scale"),l),e.uniform1f(a("u_vignette"),u)}),f=({children:e,scanlines:a=t.scanlines,vignette:r=t.vignette})=>s.jsxs(o,{children:[s.jsx(o,{style:{filter:"saturate(1.1) contrast(1.06)"},children:e}),s.jsx(o,{style:{background:"repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.34) 0px, rgba(0, 0, 0, 0.34) 1.5px, transparent 1.5px, transparent 3px)",opacity:Math.min(a,1)}}),s.jsx(o,{style:{background:"radial-gradient(ellipse 82% 78% at 50% 50%, transparent 45%, rgba(0, 0, 0, 0.72) 100%)",opacity:Math.min(r,1)}})]}),b=i({shader:m,fallback:f});export{b as CrtScreen};
