import{r as p,j as _,u as S,a as T,d as y,c as F}from"./index-DfUQpdcJ.js";import{d as P,r as k,t as B,h as D,g as v,S as w,f as L,b as W}from"./shader-mount-CaTjb1OO.js";import{c as $}from"./color-props-are-equal-vk6rHV-W.js";import{g as j}from"./get-shader-noise-texture-V_p2J5L4.js";const C={maxColorCount:10},A=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${C.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_size;
uniform float u_sizeRange;
uniform float u_spreading;

in vec2 v_patternUV;

out vec4 fragColor;

${P}
${k}
${B}
${D}


vec3 voronoiShape(vec2 uv, float time) {
  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);

  float spreading = .25 * clamp(u_spreading, 0., 1.);

  float minDist = 1.;
  vec2 randomizer = vec2(0.);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tileOffset = vec2(float(x), float(y));
      vec2 rand = randomGB(i_uv + tileOffset);
      vec2 cellCenter = vec2(.5 + 1e-4);
      cellCenter += spreading * cos(time + TWO_PI * rand);
      cellCenter -= .5;
      cellCenter = rotate(cellCenter, randomR(vec2(rand.x, rand.y)) + .1 * time);
      cellCenter += .5;
      float dist = length(tileOffset + cellCenter - f_uv);
      if (dist < minDist) {
        minDist = dist;
        randomizer = rand;
      }
    }
  }

  return vec3(minDist, randomizer);
}

void main() {

  vec2 shape_uv = v_patternUV;
  shape_uv *= 1.5;

  const float firstFrameOffset = -10.;
  float t = u_time + firstFrameOffset;

  vec3 voronoi = voronoiShape(shape_uv, t) + 1e-4;

  float radius = .25 * clamp(u_size, 0., 1.) - .5 * clamp(u_sizeRange, 0., 1.) * voronoi[2];
  float dist = voronoi[0];
  float edgeWidth = fwidth(dist);
  float dots = 1. - smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

  float shape = voronoi[1];

  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${C.maxColorCount}; i++) {
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

  vec3 color = gradient.rgb * dots;
  float opacity = gradient.a * dots;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`,o={params:{...L,speed:1.5,frame:0,colorBack:"#000000",colors:["#ffc96b","#ff6200","#ff2f00","#421100","#1a0000"],size:1,sizeRange:0,spreading:1,stepsPerColor:4}},E=p.memo(function({speed:t=o.params.speed,frame:a=o.params.frame,colorBack:s=o.params.colorBack,colors:e=o.params.colors,size:i=o.params.size,sizeRange:n=o.params.sizeRange,spreading:l=o.params.spreading,stepsPerColor:c=o.params.stepsPerColor,fit:u=o.params.fit,scale:f=o.params.scale,rotation:r=o.params.rotation,originX:m=o.params.originX,originY:d=o.params.originY,offsetX:h=o.params.offsetX,offsetY:x=o.params.offsetY,worldWidth:b=o.params.worldWidth,worldHeight:z=o.params.worldHeight,...O}){const R={u_colorBack:v(s),u_colors:e.map(v),u_colorsCount:e.length,u_size:i,u_sizeRange:n,u_spreading:l,u_stepsPerColor:c,u_noiseTexture:j(),u_fit:W[u],u_scale:f,u_rotation:r,u_offsetX:h,u_offsetY:x,u_originX:m,u_originY:d,u_worldWidth:b,u_worldHeight:z};return _.jsx(w,{...O,speed:t,frame:a,fragmentShader:A,uniforms:R})},$),X=["#4a4a68","#52527a","#3a3a5c"];function V({speed:g=1,colorBack:t="#12121a",colors:a=X,size:s=1,spreading:e=1,className:i,...n}){const l=S(),{fps:c,width:u,height:f}=T(),[r]=p.useState(()=>y("shader-dot-orbit")),m=p.useCallback(d=>{d&&requestAnimationFrame(()=>requestAnimationFrame(()=>F(r)))},[r]);return _.jsx("div",{ref:m,className:i,style:{position:"absolute",inset:0},children:_.jsx(E,{speed:0,frame:l/c*g*1e3,colorBack:t,colors:a,size:s,spreading:e,fit:"cover",width:u,height:f,...n})})}export{V as ShaderDotOrbit};
