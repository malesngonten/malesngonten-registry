import{r as y,j as v,u as z,a as k,d as I,c as j}from"./index-DfUQpdcJ.js";import{d as O,r as F,t as $,p as q,c as T,g as _,S as U,a as V,b as W}from"./shader-mount-CaTjb1OO.js";import{c as N}from"./color-props-are-equal-vk6rHV-W.js";import{g as P}from"./get-shader-noise-texture-V_p2J5L4.js";const g={maxColorCount:5},X=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colorBloom;
uniform vec4 u_colors[${g.maxColorCount}];
uniform float u_colorsCount;

uniform float u_density;
uniform float u_spotty;
uniform float u_midSize;
uniform float u_midIntensity;
uniform float u_intensity;
uniform float u_bloom;

in vec2 v_objectUV;

out vec4 fragColor;

${O}
${F}
${$}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

${q}

float raysShape(vec2 uv, float r, float freq, float intensity, float radius) {
  float a = atan(uv.y, uv.x);
  vec2 left = vec2(a * freq, r);
  vec2 right = vec2(fract(a / TWO_PI) * TWO_PI * freq, r);
  float n_left = pow(valueNoise(left), intensity);
  float n_right = pow(valueNoise(right), intensity);
  float shape = mix(n_right, n_left, smoothstep(-.15, .15, uv.x));
  return shape;
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = .2 * u_time;

  float radius = length(shape_uv);
  float spots = 6.5 * abs(u_spotty);

  float intensity = 4. - 3. * clamp(u_intensity, 0., 1.);

  float delta = 1. - smoothstep(0., 1., radius);

  float midSize = 10. * abs(u_midSize);
  float ms_lo = 0.02 * midSize;
  float ms_hi = max(midSize, 1e-6);
  float middleShape = pow(u_midIntensity, 0.3) * (1. - smoothstep(ms_lo, ms_hi, 3.0 * radius));
  middleShape = pow(middleShape, 5.0);

  vec3 accumColor = vec3(0.0);
  float accumAlpha = 0.0;

  for (int i = 0; i < ${g.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 rotatedUV = rotate(shape_uv, float(i) + 1.0);

    float r1 = radius * (1.0 + 0.4 * float(i)) - 3.0 * t;
    float r2 = 0.5 * radius * (1.0 + spots) - 2.0 * t;
    float density = 6. * u_density + step(.5, u_density) * pow(4.5 * (u_density - .5), 4.);
    float f = mix(1.0, 3.0 + 0.5 * float(i), hash11(float(i) * 15.)) * density;

    float ray = raysShape(rotatedUV, r1, 5.0 * f, intensity, radius);
    ray *= raysShape(rotatedUV, r2, 4.0 * f, intensity, radius);
    ray += (1. + 4. * ray) * middleShape;
    ray = clamp(ray, 0.0, 1.0);

    float srcAlpha = u_colors[i].a * ray;
    vec3 srcColor = u_colors[i].rgb * srcAlpha;

    vec3 alphaBlendColor = accumColor + (1.0 - accumAlpha) * srcColor;
    float alphaBlendAlpha = accumAlpha + (1.0 - accumAlpha) * srcAlpha;

    vec3 addBlendColor = accumColor + srcColor;
    float addBlendAlpha = accumAlpha + srcAlpha;

    accumColor = mix(alphaBlendColor, addBlendColor, u_bloom);
    accumAlpha = mix(alphaBlendAlpha, addBlendAlpha, u_bloom);
  }

  float overlayAlpha = u_colorBloom.a;
  vec3 overlayColor = u_colorBloom.rgb * overlayAlpha;

  vec3 colorWithOverlay = accumColor + accumAlpha * overlayColor;
  accumColor = mix(accumColor, colorWithOverlay, u_bloom);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;

  vec3 color = accumColor + (1. - accumAlpha) * bgColor;
  float opacity = accumAlpha + (1. - accumAlpha) * u_colorBack.a;
  color = clamp(color, 0., 1.);
  opacity = clamp(opacity, 0., 1.);

  ${T}

  fragColor = vec4(color, opacity);
}
`,o={params:{...V,offsetX:0,offsetY:-.55,colorBack:"#000000",colorBloom:"#0000ff",colors:["#a600ff6e","#6200fff0","#ffffff","#33fff5"],density:.3,spotty:.3,midIntensity:.4,midSize:.2,intensity:.8,bloom:.4,speed:.75,frame:0}},Y=y.memo(function({speed:r=o.params.speed,frame:e=o.params.frame,colorBloom:l=o.params.colorBloom,colorBack:i=o.params.colorBack,colors:a=o.params.colors,density:s=o.params.density,spotty:c=o.params.spotty,midIntensity:m=o.params.midIntensity,midSize:u=o.params.midSize,intensity:f=o.params.intensity,bloom:n=o.params.bloom,fit:d=o.params.fit,scale:t=o.params.scale,rotation:p=o.params.rotation,originX:h=o.params.originX,originY:x=o.params.originY,offsetX:S=o.params.offsetX,offsetY:A=o.params.offsetY,worldWidth:b=o.params.worldWidth,worldHeight:B=o.params.worldHeight,...R}){const w={u_colorBloom:_(l),u_colorBack:_(i),u_colors:a.map(_),u_colorsCount:a.length,u_density:s,u_spotty:c,u_midIntensity:m,u_midSize:u,u_intensity:f,u_bloom:n,u_noiseTexture:P(),u_fit:W[d],u_scale:t,u_rotation:p,u_offsetX:S,u_offsetY:A,u_originX:h,u_originY:x,u_worldWidth:b,u_worldHeight:B};return v.jsx(U,{...R,speed:r,frame:e,fragmentShader:X,uniforms:w})},N),E=["#5a5a7e","#8a8a95","#ffffff","#3a3a5c"];function D({speed:C=1,colorBack:r="#12121a",colorBloom:e="#3a3a5c",colors:l=E,intensity:i=.8,density:a=.3,bloom:s=.4,className:c,...m}){const u=z(),{fps:f,width:n,height:d}=k(),[t]=y.useState(()=>I("shader-god-rays")),p=y.useCallback(h=>{h&&requestAnimationFrame(()=>requestAnimationFrame(()=>j(t)))},[t]);return v.jsx("div",{ref:p,className:c,style:{position:"absolute",inset:0},children:v.jsx(Y,{speed:0,frame:u/f*C*1e3,colorBack:r,colorBloom:e,colors:l,intensity:i,density:a,bloom:s,fit:"cover",width:n,height:d,...m})})}export{D as ShaderGodRays};
