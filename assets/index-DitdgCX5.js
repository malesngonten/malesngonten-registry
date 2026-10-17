import{r as m,j as g,u as w,a as S,d as b,c as F}from"./index-DfUQpdcJ.js";import{d as M,r as R,e as V,g as j,S as G,a as U,b as W}from"./shader-mount-CaTjb1OO.js";import{c as N}from"./color-props-are-equal-vk6rHV-W.js";const p={maxColorCount:10},P=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${p.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

in vec2 v_objectUV;
out vec4 fragColor;

${M}
${R}
${V}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + fract(float(i) / 3.) * .9;
  float c = .8 + fract(float(i + 1) / 4.);

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 uv = v_objectUV;
  uv += .5;
  vec2 grainUV = uv * 1000.;

  float mixerGrain = 0.;
  if (u_grainMixer > 0.) {
    mixerGrain = .4 * u_grainMixer * (noise(grainUV, vec2(0.)) - .5);
  }

  const float firstFrameOffset = 41.5;
  float t = .5 * (u_time + firstFrameOffset);

  float radius = smoothstep(0., 1., length(uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., uv.y));
    uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., uv.x));
  }

  vec2 uvRotated = uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${p.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= max(1e-4, totalWeight);
  opacity /= max(1e-4, totalWeight);

  if (u_grainOverlay > 0.) {
    float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
    grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
    grainOverlay = pow(grainOverlay, 1.3);

    float grainOverlayV = grainOverlay * 2. - 1.;
    vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
    float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
    grainOverlayStrength = pow(grainOverlayStrength, .8);
    color = mix(color, grainOverlayColor, .35 * grainOverlayStrength);

    opacity += .5 * grainOverlayStrength;
  }
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,a={params:{...U,speed:1,frame:0,colors:["#e0eaff","#241d9a","#f75092","#9f50d3"],distortion:.8,swirl:.1,grainMixer:0,grainOverlay:0}},$=m.memo(function({speed:o=a.params.speed,frame:e=a.params.frame,colors:t=a.params.colors,distortion:i=a.params.distortion,swirl:s=a.params.swirl,grainMixer:n=a.params.grainMixer,grainOverlay:l=a.params.grainOverlay,fit:c=a.params.fit,rotation:f=a.params.rotation,scale:r=a.params.scale,originX:u=a.params.originX,originY:v=a.params.originY,offsetX:h=a.params.offsetX,offsetY:y=a.params.offsetY,worldWidth:_=a.params.worldWidth,worldHeight:x=a.params.worldHeight,...O}){const C={u_colors:t.map(j),u_colorsCount:t.length,u_distortion:i,u_swirl:s,u_grainMixer:n,u_grainOverlay:l,u_fit:W[c],u_rotation:f,u_scale:r,u_offsetX:h,u_offsetY:y,u_originX:u,u_originY:v,u_worldWidth:_,u_worldHeight:x};return g.jsx(G,{...O,speed:o,frame:e,fragmentShader:P,uniforms:C})},N),A=["#12121a","#232338","#3a3a5c","#52527a"];function q({speed:d=1,colors:o=A,distortion:e=.6,swirl:t=.1,className:i,...s}){const n=w(),{fps:l,width:c,height:f}=S(),[r]=m.useState(()=>b("shader-mesh-gradient")),u=m.useCallback(v=>{v&&requestAnimationFrame(()=>requestAnimationFrame(()=>F(r)))},[r]);return g.jsx("div",{ref:u,className:i,style:{position:"absolute",inset:0},children:g.jsx($,{speed:0,frame:n/l*d*1e3,colors:o,distortion:e,swirl:t,fit:"cover",width:c,height:f,...s})})}export{q as ShaderMeshGradient};
