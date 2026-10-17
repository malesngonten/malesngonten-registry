import{r as p,j as v,u as j,a as k,d as H,c as S}from"./index-DfUQpdcJ.js";import{d as F,r as q,s as z,g as d,S as A,a as B,b as R}from"./shader-mount-CaTjb1OO.js";import{c as W}from"./color-props-are-equal-vk6rHV-W.js";const X=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_size;
uniform float u_highlights;
uniform float u_layering;
uniform float u_edges;
uniform float u_caustic;
uniform float u_waves;

in vec2 v_imageUV;

out vec4 fragColor;

${F}
${q}
${z}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right = 1.0 - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top = 1.0 - smoothstep(1. - aay, 1., uv.y);

  return left * right * bottom * top;
}

mat2 rotate2D(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float getCausticNoise(vec2 uv, float t, float scale) {
  vec2 n = vec2(.1);
  vec2 N = vec2(.1);
  mat2 m = rotate2D(.5);
  for (int j = 0; j < 6; j++) {
    uv *= m;
    n *= m;
    vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.1;
  }
  return (N.x + N.y + 1.);
}

void main() {
  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV = (patternUV * vec2(u_imageAspectRatio, 1.));
  patternUV /= (.01 + .09 * u_size);

  float t = u_time;

  float wavesNoise = snoise((.3 + .1 * sin(t)) * .1 * patternUV + vec2(0., .4 * t));

  float causticNoise = getCausticNoise(patternUV + u_waves * vec2(1., -1.) * wavesNoise, 2. * t, 1.5);

  if (u_layering > 0.) {
    causticNoise += u_layering * getCausticNoise(patternUV + 2. * u_waves * vec2(1., -1.) * wavesNoise, 1.5 * t, 2.);
  }
  causticNoise = causticNoise * causticNoise;

  float edgesDistortion = smoothstep(0., .1, imageUV.x);
  edgesDistortion *= smoothstep(0., .1, imageUV.y);
  edgesDistortion *= (smoothstep(1., 1.1, imageUV.x) + (1.0 - smoothstep(.8, .95, imageUV.x)));
  edgesDistortion *= (1.0 - smoothstep(.9, 1., imageUV.y));
  edgesDistortion = mix(edgesDistortion, 1., u_edges);

  float causticNoiseDistortion = .02 * causticNoise * edgesDistortion;

  float wavesDistortion = .1 * u_waves * wavesNoise;

  imageUV += vec2(wavesDistortion, -wavesDistortion);
  imageUV += (u_caustic * causticNoiseDistortion);

  float frame = getUvFrame(imageUV);

  vec4 image = texture(u_image, imageUV);
  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;

  vec3 color = mix(backColor.rgb, image.rgb, image.a * frame);
  float opacity = backColor.a + image.a * frame;

  causticNoise = max(-.2, causticNoise);

  float hightlight = .025 * u_highlights * causticNoise;
  hightlight *= u_colorHighlight.a;
  color = mix(color, u_colorHighlight.rgb, .05 * u_highlights * causticNoise * u_colorHighlight.a);
  opacity += hightlight;

  color += hightlight * (.5 + .5 * wavesNoise);
  opacity += hightlight * (.5 + .5 * wavesNoise);

  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,a={params:{...B,scale:.8,speed:1,frame:0,colorBack:"#909090",colorHighlight:"#ffffff",highlights:.07,layering:.5,edges:.8,waves:.3,caustic:.1,size:1}},Y=p.memo(function({speed:o=a.params.speed,frame:i=a.params.frame,colorBack:s=a.params.colorBack,colorHighlight:r=a.params.colorHighlight,image:c="",highlights:u=a.params.highlights,layering:m=a.params.layering,waves:l=a.params.waves,edges:g=a.params.edges,caustic:n=a.params.caustic,effectScale:t,size:e=t===void 0?a.params.size:10/9/t-1/9,fit:f=a.params.fit,scale:h=a.params.scale,rotation:N=a.params.rotation,originX:w=a.params.originX,originY:x=a.params.originY,offsetX:y=a.params.offsetX,offsetY:U=a.params.offsetY,worldWidth:V=a.params.worldWidth,worldHeight:b=a.params.worldHeight,...D}){const C={u_image:c,u_colorBack:d(s),u_colorHighlight:d(r),u_highlights:u,u_layering:m,u_waves:l,u_edges:g,u_caustic:n,u_size:e,u_fit:R[f],u_rotation:N,u_scale:h,u_offsetX:y,u_offsetY:U,u_originX:w,u_originY:x,u_worldWidth:V,u_worldHeight:b};return v.jsx(A,{...D,speed:o,frame:i,fragmentShader:X,mipmaps:["u_image"],uniforms:C})},W);function I({speed:_=1,colorBack:o="#16202b",colorHighlight:i="#5a6a7a",highlights:s=.06,waves:r=.3,caustic:c=.08,className:u,...m}){const l=j(),{fps:g,width:n,height:t}=k(),[e]=p.useState(()=>H("shader-water")),f=p.useCallback(h=>{h&&requestAnimationFrame(()=>requestAnimationFrame(()=>S(e)))},[e]);return v.jsx("div",{ref:f,className:u,style:{position:"absolute",inset:0},children:v.jsx(Y,{speed:0,frame:l/g*_*1e3,colorBack:o,colorHighlight:i,highlights:s,waves:r,caustic:c,fit:"cover",width:n,height:t,...m})})}export{I as ShaderWater};
