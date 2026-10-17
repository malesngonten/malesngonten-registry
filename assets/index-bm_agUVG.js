import{j as r,A as l,e as v}from"./index-DfUQpdcJ.js";import{makeCanvasPresentation as d,makeSceneShader as M}from"./index-dciIqUK0.js";const e={intensity:1,slices:24,rgbSplit:1,blockNoise:.6},b=22,C=`#version 300 es
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform float u_intensity;
uniform float u_slices;
uniform float u_rgb_split;
uniform float u_block_noise;

in vec2 v_uv;
out vec4 outColor;

const float PI = 3.141592653589793;
const float STEPS = ${b}.0;
const float BLOCK_COLUMNS = 16.0;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec4 sampleSplit(sampler2D tex, vec2 uv, float split) {
  vec4 center = texture(tex, uv);
  float r = texture(tex, vec2(uv.x + split, uv.y)).r;
  float b = texture(tex, vec2(uv.x - split, uv.y)).b;
  return vec4(r, center.g, b, center.a);
}

void main() {
  float energy = pow(max(sin(u_progress * PI), 0.0), 0.7);
  float clock = floor(u_progress * STEPS);

  float row = floor(v_uv.y * u_slices);
  float torn = step(0.45, hash(vec2(row, clock)));
  float amount = hash(vec2(row + 17.0, clock * 1.7 + 3.0)) - 0.5;
  float sliceShift = amount * 0.3 * u_intensity * energy * torn;

  vec2 block = vec2(floor(v_uv.x * BLOCK_COLUMNS), row);
  float corrupt = step(
    1.0 - u_block_noise * 0.5 * energy,
    hash(block + clock * 7.3)
  );
  float blockShift =
    (hash(block + clock * 3.1 + 5.0) - 0.5) * 0.2 * u_intensity * corrupt;

  vec2 uv = vec2(fract(v_uv.x + sliceShift + blockShift), v_uv.y);
  float split = u_rgb_split * 0.018 * energy * (0.35 + abs(amount));

  float cut = 0.5 + (hash(vec2(row, 91.0)) - 0.5) * 0.32;
  float handed = step(cut, u_progress);

  vec4 from = sampleSplit(u_from, uv, split);
  vec4 to = sampleSplit(u_to, uv, split);
  vec4 color = mix(from, to, handed);
  vec4 leaked = mix(to, from, handed);

  float leak = corrupt * step(0.55, hash(block + clock * 11.0 + 13.0));
  color = mix(color, leaked, leak * 0.8);

  color.rgb +=
    vec3(0.05, 0.015, 0.09) *
    energy *
    torn *
    hash(vec2(row, clock + 41.0)) *
    color.a;

  outColor = color;
}`,w=M(C,({gl:t,uniform:s,passedProps:n})=>{const{intensity:i=e.intensity,slices:a=e.slices,rgbSplit:u=e.rgbSplit,blockNoise:f=e.blockNoise}=n;t.uniform1f(s("u_intensity"),i),t.uniform1f(s("u_slices"),a),t.uniform1f(s("u_rgb_split"),u),t.uniform1f(s("u_block_noise"),f)}),$=t=>.5+(v(`glitch-cut-handoff-${t}`)-.5)*.32,P=({children:t,presentationProgress:s,presentationDirection:n,passedProps:i})=>{const{intensity:a=e.intensity,slices:u=e.slices,rgbSplit:f=e.rgbSplit}=i,p=n==="entering",c=s,h=Math.max(0,Math.sin(c*Math.PI))**.7;if(h<.002){const k=p?c>=.5?1:0:c<.5?1:0;return r.jsx(l,{style:{opacity:k},children:t})}const m=Math.floor(c*b),_=Math.max(2,Math.min(6,Math.round(u/5))),g=100/_;return r.jsx(l,{children:Array.from({length:_},(k,o)=>{if(!(c>=$(o)?p:!p))return null;const x=(v(`glitch-cut-shift-${m}-${o}`)-.5)*52*a*h,y=o%2===0?"rgb(255, 42, 90)":"rgb(0, 224, 255)",S=f*.2*h*v(`glitch-cut-tint-${m}-${o}`);return r.jsxs(l,{style:{clipPath:`inset(${o*g}% 0 ${100-(o+1)*g}% 0)`,translate:`${x}px`},children:[t,r.jsx(l,{style:{background:y,mixBlendMode:"screen",opacity:S}})]},o)})})},E=d({shader:w,fallback:P});function D(t={}){return E(t)}export{D as glitchCut};
