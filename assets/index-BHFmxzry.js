import{u as O,j as u,A as f}from"./index-DfUQpdcJ.js";import{makeCanvasFilter as S,makeFilterShader as T}from"./index-dciIqUK0.js";const c={durationInFrames:18,delay:0,gain:1,afterglow:1,phosphor:"#d8ecff"},p=.6,_=.82,v=.0055,C=.004,x=.3,g=2.6,A=.06,L=`#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform vec2 u_resolution;
uniform float u_aspect;
uniform float u_progress;
uniform float u_gain;
uniform float u_afterglow;
uniform vec3 u_phosphor;

in vec2 v_uv;
out vec4 outColor;

const int TAPS = 32;
const int COLUMN_TAPS = 8;
const float GOLDEN = 0.6180339887;
const float COLLAPSE_END = ${p.toFixed(4)};
const float PINCH_END = ${_.toFixed(4)};
const float MIN_SQUASH = ${v.toFixed(5)};
const float MIN_PINCH = ${C.toFixed(5)};
const float CONCENTRATION = ${x.toFixed(4)};
const float DECAY_CURVE = ${g.toFixed(4)};
const float BLACKOUT_IN = ${A.toFixed(4)};

void main() {
  float p = u_progress;

  if (p <= 0.0) {
    outColor = texture(u_scene, v_uv);
    return;
  }
  if (p >= 1.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float collapse = clamp(p / COLLAPSE_END, 0.0, 1.0);
  float pinch = clamp((p - COLLAPSE_END) / (PINCH_END - COLLAPSE_END), 0.0, 1.0);
  float decayed = clamp((p - PINCH_END) / (1.0 - PINCH_END), 0.0, 1.0);

  vec2 scale = vec2(pow(MIN_PINCH, pinch), pow(MIN_SQUASH, collapse));
  vec2 centered = (v_uv - 0.5) / scale + 0.5;
  vec2 span = 1.0 / (scale * u_resolution);

  vec3 sum = vec3(0.0);
  for (int i = 0; i < TAPS; i++) {
    float fi = float(i);
    vec2 at = centered + vec2(
      (fract(fi * GOLDEN + 0.5) - 0.5) * span.x,
      ((fi + 0.5) / float(TAPS) - 0.5) * span.y
    );
    vec2 inside = step(vec2(0.0), at) * step(at, vec2(1.0));
    sum += texture(u_scene, at).rgb * inside.x * inside.y;
  }

  float concentrate = pow(1.0 / (scale.x * scale.y), CONCENTRATION);
  vec3 light =
    (sum / float(TAPS)) * (1.0 + (concentrate - 1.0) * max(u_gain, 0.0));

  float glow = max(u_afterglow, 0.0);
  float bleed = smoothstep(0.2, 0.8, collapse) * (1.0 - pinch) * glow;

  if (bleed > 0.0) {
    vec3 column = vec3(0.0);
    float cx = clamp(centered.x, 0.0, 1.0);
    for (int i = 0; i < COLUMN_TAPS; i++) {
      column +=
        texture(u_scene, vec2(cx, (float(i) + 0.5) / float(COLUMN_TAPS))).rgb;
    }
    column /= float(COLUMN_TAPS);

    float dy = v_uv.y - 0.5;
    float reach = 0.02 + 0.03 * collapse;
    light +=
      column *
      mix(vec3(1.0), u_phosphor, 0.65) *
      exp(-(dy * dy) / (reach * reach)) *
      bleed *
      0.9;
  }

  if (pinch > 0.0) {
    vec2 d = (v_uv - 0.5) * vec2(u_aspect, 1.0);
    float radius = max(0.045 * glow, 0.0005);
    light +=
      u_phosphor *
      exp(-dot(d, d) / (radius * radius)) *
      smoothstep(0.0, 0.5, pinch) *
      1.15;
  }

  light *= pow(max(1.0 - decayed, 0.0001), DECAY_CURVE);

  float blackout = smoothstep(0.0, BLACKOUT_IN, p);
  outColor = vec4(
    clamp(light, 0.0, 1.0),
    mix(texture(u_scene, v_uv).a, 1.0, blackout)
  );
}`,r=(t,o,a)=>Math.min(a,Math.max(o,t));function y(t){const o=t.replace("#",""),a=o.length===3?o.split("").map(n=>n+n).join(""):o,e=Number.parseInt(a,16);return Number.isNaN(e)?[1,1,1]:[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function E(t,o){const{durationInFrames:a=c.durationInFrames,delay:e=c.delay}=t;return r((o-e)/Math.max(1,a),0,1)}const w=T(L,({gl:t,uniform:o,width:a,height:e,frame:n,passedProps:l})=>{const{gain:s=c.gain,afterglow:m=c.afterglow,phosphor:i=c.phosphor}=l;t.uniform1f(o("u_progress"),E(l,n)),t.uniform2f(o("u_resolution"),a,e),t.uniform1f(o("u_gain"),s),t.uniform1f(o("u_afterglow"),m),t.uniform3fv(o("u_phosphor"),y(i))}),D=t=>{const o=O(),{children:a,gain:e=c.gain,afterglow:n=c.afterglow,phosphor:l=c.phosphor}=t,s=E(t,o),m=r(s/p,0,1),i=r((s-p)/(_-p),0,1),I=r((s-_)/(1-_),0,1),h=v**m,d=C**i,P=(1/(h*d))**x,N=(1-I)**g;return u.jsxs(f,{children:[u.jsx(f,{style:{background:"#000000",opacity:r(s/A,0,1)}}),u.jsx(f,{style:{scale:`${d} ${h}`,filter:`brightness(${1+(P-1)*Math.max(e,0)})`,opacity:N},children:a}),u.jsx(f,{style:{background:`radial-gradient(circle at 50% 50%, ${l} 0%, transparent 55%)`,opacity:r(i*n,0,1)*N}})]})},M=S({shader:w,fallback:D});export{M as TvPowerOff};
