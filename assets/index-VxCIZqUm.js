import{r as _,j as h,u as q,a as B,d as T,c as z}from"./index-DfUQpdcJ.js";import{d as O,s as P,c as j,g as k,S as I,f as N,b as X}from"./shader-mount-CaTjb1OO.js";import{c as Y}from"./color-props-are-equal-vk6rHV-W.js";const A=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_density;
uniform float u_distortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_softness;

in vec2 v_patternUV;

out vec4 fragColor;

${O}
${P}

void main() {
  vec2 uv = 2. * v_patternUV;

  float t = u_time;
  float l = length(uv);
  float density = clamp(u_density, 0., 1.);
  l = pow(max(l, 1e-6), density);
  float angle = atan(uv.y, uv.x) - t;
  float angleNormalised = angle / TWO_PI;

  if (u_noise > 0.) {
    angleNormalised += .125 * u_noise * snoise(16. * pow(u_noiseFrequency, 3.) * uv);
  }

  float offset = l + angleNormalised;
  offset -= u_distortion * (sin(4. * l - .5 * t) * cos(PI + l + .5 * t));
  float stripe = fract(offset);

  float shape = 2. * abs(stripe - .5);
  float width = 1. - clamp(u_strokeWidth, .005 * u_strokeTaper, 1.);


  float wCap = mix(width, (1. - stripe) * (1. - step(.5, stripe)), (1. - clamp(l, 0., 1.)));
  width = mix(width, wCap, u_strokeCap);
  width *= (1. - clamp(u_strokeTaper, 0., 1.) * l);

  float fw = fwidth(offset);
  float fwMult = 4. - 3. * (smoothstep(.05, .4, 2. * u_strokeWidth) * smoothstep(.05, .4, 2. * (1. - u_strokeWidth)));
  float pixelSize = mix(fwMult * fw, fwidth(shape), clamp(fw, 0., 1.));
  pixelSize = mix(pixelSize, .002, u_strokeCap * (1. - clamp(l, 0., 1.)));

  float res = smoothstep(width - pixelSize - u_softness, width + pixelSize + u_softness, shape);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  ${j}

  fragColor = vec4(color, opacity);
}
`,o={params:{...N,scale:1,colorBack:"#001429",colorFront:"#79D1FF",density:1,distortion:0,strokeWidth:.5,strokeTaper:0,strokeCap:0,noise:0,noiseFrequency:0,softness:0,speed:1,frame:0}},E=_.memo(function({speed:a=o.params.speed,frame:e=o.params.frame,colorBack:r=o.params.colorBack,colorFront:s=o.params.colorFront,density:i=o.params.density,distortion:n=o.params.distortion,strokeWidth:l=o.params.strokeWidth,strokeTaper:u=o.params.strokeTaper,strokeCap:f=o.params.strokeCap,noiseFrequency:p=o.params.noiseFrequency,noise:c=o.params.noise,softness:t=o.params.softness,fit:m=o.params.fit,rotation:d=o.params.rotation,scale:y=o.params.scale,originX:w=o.params.originX,originY:F=o.params.originY,offsetX:v=o.params.offsetX,offsetY:x=o.params.offsetY,worldWidth:C=o.params.worldWidth,worldHeight:S=o.params.worldHeight,...b}){const W={u_colorBack:k(r),u_colorFront:k(s),u_density:i,u_distortion:n,u_strokeWidth:l,u_strokeTaper:u,u_strokeCap:f,u_noiseFrequency:p,u_noise:c,u_softness:t,u_fit:X[m],u_scale:y,u_rotation:d,u_offsetX:v,u_offsetY:x,u_originX:w,u_originY:F,u_worldWidth:C,u_worldHeight:S};return h.jsx(I,{...b,speed:a,frame:e,fragmentShader:A,uniforms:W})},Y);function $({speed:g=1,colorBack:a="#12121a",colorFront:e="#52527a",density:r=1,strokeWidth:s=.5,softness:i=.2,className:n,...l}){const u=q(),{fps:f,width:p,height:c}=B(),[t]=_.useState(()=>T("shader-spiral")),m=_.useCallback(d=>{d&&requestAnimationFrame(()=>requestAnimationFrame(()=>z(t)))},[t]);return h.jsx("div",{ref:m,className:n,style:{position:"absolute",inset:0},children:h.jsx(E,{speed:0,frame:u/f*g*1e3,colorBack:a,colorFront:e,density:r,strokeWidth:s,softness:i,fit:"cover",width:p,height:c,...l})})}export{$ as ShaderSpiral};
