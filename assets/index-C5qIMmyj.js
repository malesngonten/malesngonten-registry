import{j as l,A as n}from"./index-DfUQpdcJ.js";import{makeCanvasFilter as f,makeFilterShader as _}from"./index-dciIqUK0.js";const a={tint:"#63e8ff",glow:1,ghost:1,flicker:1,intensity:1},v=`#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform float u_aspect;
uniform float u_frame;
uniform vec3 u_tint;
uniform float u_glow;
uniform float u_ghost;
uniform float u_flicker;
uniform float u_intensity;

in vec2 v_uv;
out vec4 outColor;

const float PI = 3.141592653589793;
const float TAU = 6.28318530718;
const float GOLDEN = 2.39996323;
const int HALO_TAPS = 8;
const vec3 LUMA = vec3(0.299, 0.587, 0.114);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float lumaAt(vec2 uv) {
  return dot(texture(u_scene, uv).rgb, LUMA);
}

void main() {
  vec4 src = texture(u_scene, v_uv);
  float amount = clamp(u_intensity, 0.0, 1.0);

  if (!(amount > 0.001)) {
    outColor = src;
    return;
  }

  float row = floor(v_uv.y * 300.0);
  float clock = floor(u_frame);
  float slip =
    (hash(vec2(row, clock)) - 0.5) * u_ghost * 0.006 * step(0.55, hash(vec2(row, clock + 3.0)));
  vec2 base = vec2(v_uv.x + slip / u_aspect, v_uv.y);

  vec4 held = texture(u_scene, base);
  float lit = dot(held.rgb, LUMA);

  vec2 apart = vec2(u_ghost * 0.0045 / u_aspect, u_ghost * 0.0035);
  vec3 twin = texture(u_scene, base + apart).rgb;

  float step2 = 0.0022;
  float gx =
    lumaAt(base + vec2(step2 / u_aspect, 0.0)) -
    lumaAt(base - vec2(step2 / u_aspect, 0.0));
  float gy = lumaAt(base + vec2(0.0, step2)) - lumaAt(base - vec2(0.0, step2));
  float rim = clamp(length(vec2(gx, gy)) * 7.0, 0.0, 1.0);

  vec3 halo = vec3(0.0);
  for (int i = 0; i < HALO_TAPS; i++) {
    float angle = float(i) * GOLDEN;
    float reach = sqrt((float(i) + 0.5) / float(HALO_TAPS)) * u_glow * 0.022;
    vec2 at = base + vec2(cos(angle) * reach / u_aspect, sin(angle) * reach);
    halo += max(texture(u_scene, at).rgb - 0.34, vec3(0.0));
  }
  halo /= float(HALO_TAPS);

  vec3 core = u_tint * (0.12 + lit * 1.55);
  core = mix(core, held.rgb * u_tint * 1.9, 0.12);
  core += u_tint * rim * 1.9 * u_glow;
  core += halo * u_tint * 2.4 * u_glow;
  core += twin * u_tint * 0.5 * u_ghost;

  float interlace = mod(row, 2.0) < 1.0 ? 1.0 : 0.58;
  core *= interlace;

  float blink =
    1.0 -
    u_flicker *
      (0.04 + 0.05 * hash(vec2(clock, 7.0))) *
      (0.5 + 0.5 * sin(u_frame * TAU / 15.0));
  core *= blink;

  float presence = clamp(lit * 1.5 + rim * 0.8 + 0.03, 0.0, 1.0);
  vec3 painted = clamp(u_tint * 0.035 + core * presence, 0.0, 1.0);

  outColor = vec4(mix(src.rgb, painted, amount), src.a);
}`;function m(e){const t=e.replace("#",""),o=t.length===3?t.split("").map(c=>c+c).join(""):t,r=Number.parseInt(o,16);return Number.isNaN(r)?[1,1,1]:[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255]}const p=_(v,({gl:e,uniform:t,passedProps:o})=>{const{tint:r=a.tint,glow:c=a.glow,ghost:s=a.ghost,flicker:i=a.flicker,intensity:u=a.intensity}=o;e.uniform3fv(t("u_tint"),m(r)),e.uniform1f(t("u_glow"),c),e.uniform1f(t("u_ghost"),s),e.uniform1f(t("u_flicker"),i),e.uniform1f(t("u_intensity"),u)}),g=({children:e,tint:t=a.tint,intensity:o=a.intensity})=>l.jsxs(n,{children:[l.jsx(n,{style:{filter:`saturate(${1-.5*o})`},children:e}),l.jsx(n,{style:{background:t,mixBlendMode:"color",opacity:.75*o}}),l.jsx(n,{style:{background:"repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.32) 0px, rgba(0, 0, 0, 0.32) 2px, transparent 2px, transparent 4px)",opacity:o}})]}),x=f({shader:p,fallback:g});export{x as Hologram};
