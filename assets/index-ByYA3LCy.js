import{r as v,j as g,u as S,a as x,d as N,c as j}from"./index-DfUQpdcJ.js";import{r as k,c as B,g as _,S as w,f as M,b as X}from"./shader-mount-CaTjb1OO.js";import{c as Y}from"./color-props-are-equal-vk6rHV-W.js";const q=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorFront;
uniform vec4 u_colorMid;
uniform vec4 u_colorBack;
uniform float u_brightness;
uniform float u_contrast;

in vec2 v_patternUV;

out vec4 fragColor;

${k}

float neuroShape(vec2 uv, float t) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer);
    res += (.5 + .5 * cos(layer)) / scale;
    scale *= (1.2);
  }
  return res.x + res.y;
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .13;

  float t = .5 * u_time;

  float noise = neuroShape(shape_uv, t);

  noise = (1. + u_brightness) * noise * noise;
  noise = pow(noise, .7 + 6. * u_contrast);
  noise = min(1.4, noise);

  float blend = smoothstep(0.7, 1.4, noise);

  vec4 frontC = u_colorFront;
  frontC.rgb *= frontC.a;
  vec4 midC = u_colorMid;
  midC.rgb *= midC.a;
  vec4 blendFront = mix(midC, frontC, blend);

  float safeNoise = max(noise, 0.0);
  vec3 color = blendFront.rgb * safeNoise;
  float opacity = clamp(blendFront.a * safeNoise, 0., 1.);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${B}

  fragColor = vec4(color, opacity);
}
`,o={params:{...M,speed:1,frame:0,colorFront:"#ffffff",colorMid:"#47a6ff",colorBack:"#000000",brightness:.05,contrast:.3}},A=v.memo(function({speed:e=o.params.speed,frame:a=o.params.frame,colorFront:t=o.params.colorFront,colorMid:s=o.params.colorMid,colorBack:n=o.params.colorBack,brightness:i=o.params.brightness,contrast:c=o.params.contrast,fit:u=o.params.fit,scale:l=o.params.scale,rotation:f=o.params.rotation,originX:m=o.params.originX,originY:r=o.params.originY,offsetX:p=o.params.offsetX,offsetY:d=o.params.offsetY,worldWidth:b=o.params.worldWidth,worldHeight:C=o.params.worldHeight,...F}){const y={u_colorFront:_(t),u_colorMid:_(s),u_colorBack:_(n),u_brightness:i,u_contrast:c,u_fit:X[u],u_scale:l,u_rotation:f,u_offsetX:p,u_offsetY:d,u_originX:m,u_originY:r,u_worldWidth:b,u_worldHeight:C};return g.jsx(w,{...F,speed:e,frame:a,fragmentShader:q,uniforms:y})},Y);function V({speed:h=1,colorFront:e="#8a8a95",colorMid:a="#4a4a68",colorBack:t="#12121a",brightness:s=.05,contrast:n=.3,className:i,...c}){const u=S(),{fps:l,width:f,height:m}=x(),[r]=v.useState(()=>N("shader-neuro-noise")),p=v.useCallback(d=>{d&&requestAnimationFrame(()=>requestAnimationFrame(()=>j(r)))},[r]);return g.jsx("div",{ref:p,className:i,style:{position:"absolute",inset:0},children:g.jsx(A,{speed:0,frame:u/l*h*1e3,colorFront:e,colorMid:a,colorBack:t,brightness:s,contrast:n,fit:"cover",width:f,height:m,...c})})}export{V as ShaderNeuroNoise};
