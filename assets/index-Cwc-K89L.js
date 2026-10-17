import{r as d,j as h,u as q,a as A,d as B,c as $}from"./index-DfUQpdcJ.js";import{d as O,s as R,r as E,c as M,g as w,S as P,a as X,b as Y}from"./shader-mount-CaTjb1OO.js";import{c as I}from"./color-props-are-equal-vk6rHV-W.js";const x={maxColorCount:10},U=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${x.maxColorCount}];
uniform float u_colorsCount;
uniform float u_bandCount;
uniform float u_twist;
uniform float u_center;
uniform float u_proportion;
uniform float u_softness;
uniform float u_noise;
uniform float u_noiseFrequency;

in vec2 v_objectUV;

out vec4 fragColor;

${O}
${R}
${E}

void main() {
  vec2 shape_uv = v_objectUV;

  float l = length(shape_uv);
  l = max(1e-4, l);

  float t = u_time;

  float angle = ceil(u_bandCount) * atan(shape_uv.y, shape_uv.x) + t;
  float angle_norm = angle / TWO_PI;

  float twist = 3. * clamp(u_twist, 0., 1.);
  float offset = pow(l, -twist) + angle_norm;

  float shape = fract(offset);
  shape = 1. - abs(2. * shape - 1.);
  if (u_noise > 0.) {
    shape += u_noise * snoise(15. * pow(u_noiseFrequency, 2.) * shape_uv);
  }

  float mid = smoothstep(.2, .2 + .8 * u_center, pow(l, twist));
  shape = mix(0., shape, mid);

  float proportion = clamp(u_proportion, 0., 1.);
  float exponent = mix(.25, 1., proportion * 2.);
  exponent = mix(exponent, 10., max(0., proportion * 2. - 1.));
  shape = pow(shape, exponent);

  float mixer = shape * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;

  float outerShape = 0.;
  for (int i = 1; i < ${x.maxColorCount+1}; i++) {
    if (i > int(u_colorsCount)) break;

    float m = clamp(mixer - float(i - 1), 0., 1.);
    float aa = fwidth(m);
    m = smoothstep(.5 - .5 * u_softness - aa, .5 + .5 * u_softness + aa, m);

    if (i == 1) {
      outerShape = m;
    }

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  float midAA = .1 * fwidth(pow(l, -twist));
  float outerMid = smoothstep(.2, .2 + midAA, pow(l, twist));
  outerShape = mix(0., outerShape, outerMid);

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  ${M}

  fragColor = vec4(color, opacity);
}
`,o={params:{...X,speed:.32,frame:0,colorBack:"#330000",colors:["#ffd1d1","#ff8a8a","#660000"],bandCount:4,twist:.1,center:.2,proportion:.5,softness:0,noiseFrequency:.4,noise:.2}},V=d.memo(function({speed:e=o.params.speed,frame:r=o.params.frame,colorBack:s=o.params.colorBack,colors:a=o.params.colors,bandCount:i=o.params.bandCount,twist:n=o.params.twist,center:u=o.params.center,proportion:l=o.params.proportion,softness:p=o.params.softness,noiseFrequency:c=o.params.noiseFrequency,noise:m=o.params.noise,fit:t=o.params.fit,rotation:f=o.params.rotation,scale:_=o.params.scale,originX:C=o.params.originX,originY:v=o.params.originY,offsetX:S=o.params.offsetX,offsetY:b=o.params.offsetY,worldWidth:y=o.params.worldWidth,worldHeight:F=o.params.worldHeight,...k}){const j={u_colorBack:w(s),u_colors:a.map(w),u_colorsCount:a.length,u_bandCount:i,u_twist:n,u_center:u,u_proportion:l,u_softness:p,u_noiseFrequency:c,u_noise:m,u_fit:Y[t],u_scale:_,u_rotation:f,u_offsetX:S,u_offsetY:b,u_originX:C,u_originY:v,u_worldWidth:y,u_worldHeight:F};return h.jsx(P,{...k,speed:e,frame:r,fragmentShader:U,uniforms:j})},I),W=["#52527a","#3a3a5c","#232338"];function T({speed:g=1,colors:e=W,colorBack:r="#12121a",bandCount:s=4,twist:a=.1,softness:i=.2,className:n,...u}){const l=q(),{fps:p,width:c,height:m}=A(),[t]=d.useState(()=>B("shader-swirl")),f=d.useCallback(_=>{_&&requestAnimationFrame(()=>requestAnimationFrame(()=>$(t)))},[t]);return h.jsx("div",{ref:f,className:n,style:{position:"absolute",inset:0},children:h.jsx(V,{speed:0,frame:l/p*g*1e3,colors:e,colorBack:r,bandCount:s,twist:a,softness:i,fit:"cover",width:c,height:m,...u})})}export{T as ShaderSwirl};
