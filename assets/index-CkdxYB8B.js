import{r as _,j as v,u as b,a as P,d as F,c as R}from"./index-DfUQpdcJ.js";import{d as y,h as E,g,S as O,f as L,b as V}from"./shader-mount-CaTjb1OO.js";import{c as z}from"./color-props-are-equal-vk6rHV-W.js";import{g as A}from"./get-shader-noise-texture-V_p2J5L4.js";const x={maxColorCount:5},I=`#version 300 es
precision mediump float;

uniform float u_time;

uniform float u_scale;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[${x.maxColorCount}];
uniform float u_colorsCount;

uniform float u_stepsPerColor;
uniform vec4 u_colorGlow;
uniform vec4 u_colorGap;
uniform float u_distortion;
uniform float u_gap;
uniform float u_glow;

in vec2 v_patternUV;

out vec4 fragColor;

${y}
${E}

vec4 voronoi(vec2 x, float t) {
  vec2 ip = floor(x);
  vec2 fp = fract(x);

  vec2 mg, mr;
  float md = 8.;
  float rand = 0.;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = randomGB(ip + g);
      float raw_hash = o.x;
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      float d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
        rand = raw_hash;
      }
    }
  }

  md = 8.;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = randomGB(ip + g);
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      if (dot(mr - r, mr - r) > .00001) {
        md = min(md, dot(.5 * (mr + r), normalize(r - mr)));
      }
    }
  }

  return vec4(md, mr, rand);
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= 1.25;

  float t = u_time;

  vec4 voronoiRes = voronoi(shape_uv, t);

  float shape = clamp(voronoiRes.w, 0., 1.);
  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${x.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
    float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
    localT = round(localT * steps) / steps;
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
    float localT = mixer + 1.;
    if (mixer > (u_colorsCount - 1.)) {
      localT = mixer - (u_colorsCount - 1.);
    }
    localT = round(localT * steps) / steps;
    vec4 cFst = u_colors[0];
    cFst.rgb *= cFst.a;
    vec4 cLast = u_colors[int(u_colorsCount - 1.)];
    cLast.rgb *= cLast.a;
    gradient = mix(cLast, cFst, localT);
  }

  vec3 cellColor = gradient.rgb;
  float cellOpacity = gradient.a;

  float glows = length(voronoiRes.yz * u_glow);
  glows = pow(glows, 1.5);

  vec3 color = mix(cellColor, u_colorGlow.rgb * u_colorGlow.a, u_colorGlow.a * glows);
  float opacity = cellOpacity + u_colorGlow.a * glows;

  float edge = voronoiRes.x;
  float smoothEdge = .02 / (2. * u_scale) * (1. + .5 * u_gap);
  edge = smoothstep(u_gap - smoothEdge, u_gap + smoothEdge, edge);

  color = mix(u_colorGap.rgb * u_colorGap.a, color, edge);
  opacity = mix(u_colorGap.a, opacity, edge);

  fragColor = vec4(color, opacity);
}
`,o={params:{...L,speed:.5,frame:0,colors:["#ff8247","#ffe53d"],stepsPerColor:3,colorGlow:"#ffffff",colorGap:"#2e0000",distortion:.4,gap:.04,glow:0,scale:.5}},W=_.memo(function({speed:e=o.params.speed,frame:t=o.params.frame,colors:r=o.params.colors,stepsPerColor:s=o.params.stepsPerColor,colorGlow:i=o.params.colorGlow,colorGap:l=o.params.colorGap,distortion:c=o.params.distortion,gap:n=o.params.gap,glow:u=o.params.glow,fit:m=o.params.fit,scale:f=o.params.scale,rotation:a=o.params.rotation,originX:p=o.params.originX,originY:d=o.params.originY,offsetX:C=o.params.offsetX,offsetY:w=o.params.offsetY,worldWidth:G=o.params.worldWidth,worldHeight:T=o.params.worldHeight,...j}){const S={u_colors:r.map(g),u_colorsCount:r.length,u_stepsPerColor:s,u_colorGlow:g(i),u_colorGap:g(l),u_distortion:c,u_gap:n,u_glow:u,u_noiseTexture:A(),u_fit:V[m],u_scale:f,u_rotation:a,u_offsetX:C,u_offsetY:w,u_originX:p,u_originY:d,u_worldWidth:G,u_worldHeight:T};return v.jsx(O,{...j,speed:e,frame:t,fragmentShader:I,uniforms:S})},z),X=["#3a3a5c","#52527a"];function U({speed:h=1,colors:e=X,colorGap:t="#12121a",distortion:r=.4,gap:s=.04,glow:i=0,className:l,...c}){const n=b(),{fps:u,width:m,height:f}=P(),[a]=_.useState(()=>F("shader-voronoi")),p=_.useCallback(d=>{d&&requestAnimationFrame(()=>requestAnimationFrame(()=>R(a)))},[a]);return v.jsx("div",{ref:p,className:l,style:{position:"absolute",inset:0},children:v.jsx(W,{speed:0,frame:n/u*h*1e3,colors:e,colorGap:t,distortion:r,gap:s,glow:i,fit:"cover",width:m,height:f,...c})})}export{U as ShaderVoronoi};
