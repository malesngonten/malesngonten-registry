import{r as p,j as d,u as F,a as S,d as M,c as b}from"./index-DfUQpdcJ.js";import{s as N,c as w,g as P,S as L,f as j,b as E}from"./shader-mount-CaTjb1OO.js";import{c as R}from"./color-props-are-equal-vk6rHV-W.js";const g={maxColorCount:10},y=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${g.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_softness;

in vec2 v_patternUV;

out vec4 fragColor;

${N}

float getNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

float steppedSmooth(float m, float steps, float softness) {
  float stepT = floor(m * steps) / steps;
  float f = m * steps - floor(m * steps);
  float fw = steps * fwidth(m);
  float smoothed = smoothstep(.5 - softness, min(1., .5 + softness + fw), f);
  return stepT + smoothed / steps;
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .1;

  float t = .2 * u_time;

  float shape = .5 + .5 * getNoise(shape_uv, t);

  float mixer = (shape - .5 / u_colorsCount) * u_colorsCount;

  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${g.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    float localM = clamp(mixer - float(i - 1), 0., 1.);
    localM = steppedSmooth(localM, steps, .5 * u_softness);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localM);
  }

  if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
    float localM = mixer + 1.;
    if (mixer > (u_colorsCount - 1.)) {
      localM = mixer - (u_colorsCount - 1.);
    }
    localM = steppedSmooth(localM, steps, .5 * u_softness);
    vec4 cFst = u_colors[0];
    cFst.rgb *= cFst.a;
    vec4 cLast = u_colors[int(u_colorsCount - 1.)];
    cLast.rgb *= cLast.a;
    gradient = mix(cLast, cFst, localM);
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  ${w}

  fragColor = vec4(color, opacity);
}
`,o={params:{...j,scale:.6,speed:.5,frame:0,colors:["#4449CF","#FFD1E0","#F94446","#FFD36B","#FFFFFF"],stepsPerColor:2,softness:0}},A=p.memo(function({speed:t=o.params.speed,frame:a=o.params.frame,colors:s=o.params.colors,stepsPerColor:r=o.params.stepsPerColor,softness:i=o.params.softness,fit:l=o.params.fit,scale:n=o.params.scale,rotation:c=o.params.rotation,originX:m=o.params.originX,originY:e=o.params.originY,offsetX:u=o.params.offsetX,offsetY:f=o.params.offsetY,worldWidth:h=o.params.worldWidth,worldHeight:x=o.params.worldHeight,...C}){const v={u_colors:s.map(P),u_colorsCount:s.length,u_stepsPerColor:r,u_softness:i,u_fit:E[l],u_scale:n,u_rotation:c,u_offsetX:u,u_offsetY:f,u_originX:m,u_originY:e,u_worldWidth:h,u_worldHeight:x};return d.jsx(L,{...C,speed:t,frame:a,fragmentShader:y,uniforms:v})},R),X=["#12121a","#3a3a5c","#52527a","#8a8a95"];function O({speed:_=1,colors:t=X,stepsPerColor:a=2,softness:s=.1,className:r,...i}){const l=F(),{fps:n,width:c,height:m}=S(),[e]=p.useState(()=>M("shader-simplex-noise")),u=p.useCallback(f=>{f&&requestAnimationFrame(()=>requestAnimationFrame(()=>b(e)))},[e]);return d.jsx("div",{ref:u,className:r,style:{position:"absolute",inset:0},children:d.jsx(A,{speed:0,frame:l/n*_*1e3,colors:t,stepsPerColor:a,softness:s,fit:"cover",width:c,height:m,...i})})}export{O as ShaderSimplexNoise};
