import{r as g,j as _,u as I,a as T,d as U,c as B}from"./index-DfUQpdcJ.js";import{d as N,t as j,c as O,g as x,S as F,a as L,b as w}from"./shader-mount-CaTjb1OO.js";import{c as P}from"./color-props-are-equal-vk6rHV-W.js";import{g as V}from"./get-shader-noise-texture-V_p2J5L4.js";const v={maxColorCount:10,maxNoiseIterations:8},$=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${v.maxColorCount}];
uniform float u_colorsCount;

uniform float u_thickness;
uniform float u_radius;
uniform float u_innerShape;
uniform float u_noiseScale;
uniform float u_noiseIterations;

in vec2 v_objectUV;

out vec4 fragColor;

${N}
${j}
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
vec2 fbm(vec2 n0, vec2 n1) {
  vec2 total = vec2(0.0);
  float amplitude = .4;
  for (int i = 0; i < ${v.maxNoiseIterations}; i++) {
    if (i >= int(u_noiseIterations)) break;
    total.x += valueNoise(n0) * amplitude;
    total.y += valueNoise(n1) * amplitude;
    n0 *= 1.99;
    n1 *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

float getNoise(vec2 uv, vec2 pUv, float t) {
  vec2 pUvLeft = pUv + .03 * t;
  float period = max(abs(u_noiseScale * TWO_PI), 1e-6);
  vec2 pUvRight = vec2(fract(pUv.x / period) * period, pUv.y) + .03 * t;
  vec2 noise = fbm(pUvLeft, pUvRight);
  return mix(noise.y, noise.x, smoothstep(-.25, .25, uv.x));
}

float getRingShape(vec2 uv) {
  float radius = u_radius;
  float thickness = u_thickness;

  float distance = length(uv);
  float ringValue = 1. - smoothstep(radius, radius + thickness, distance);
  ringValue *= smoothstep(radius - pow(u_innerShape, 3.) * thickness, radius, distance);

  return ringValue;
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = u_time;

  float cycleDuration = 3.;
  float period2 = 2.0 * cycleDuration;
  float localTime1 = fract((0.1 * t + cycleDuration) / period2) * period2;
  float localTime2 = fract((0.1 * t) / period2) * period2;
  float timeBlend = .5 + .5 * sin(.1 * t * PI / cycleDuration - .5 * PI);

  float atg = atan(shape_uv.y, shape_uv.x) + .001;
  float l = length(shape_uv);
  float radialOffset = .5 * l - inversesqrt(max(1e-4, l));
  vec2 polar_uv1 = vec2(atg, localTime1 - radialOffset) * u_noiseScale;
  vec2 polar_uv2 = vec2(atg, localTime2 - radialOffset) * u_noiseScale;
  
  float noise1 = getNoise(shape_uv, polar_uv1, t);
  float noise2 = getNoise(shape_uv, polar_uv2, t);

  float noise = mix(noise1, noise2, timeBlend);

  shape_uv *= (.8 + 1.2 * noise);

  float ringShape = getRingShape(shape_uv);

  float mixer = ringShape * ringShape * (u_colorsCount - 1.);
  int idxLast = int(u_colorsCount) - 1;
  vec4 gradient = u_colors[idxLast];
  gradient.rgb *= gradient.a;
  for (int i = ${v.maxColorCount} - 2; i >= 0; i--) {
    float localT = clamp(mixer - float(idxLast - i - 1), 0., 1.);
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * ringShape;
  float opacity = gradient.a * ringShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${O}

  fragColor = vec4(color, opacity);
}
`,e={params:{...L,speed:.5,frame:0,colorBack:"#000000",colors:["#ffffff"],noiseScale:3,noiseIterations:8,radius:.25,thickness:.65,innerShape:.7,scale:.8}},D=g.memo(function({speed:t=e.params.speed,frame:i=e.params.frame,colorBack:r=e.params.colorBack,colors:a=e.params.colors,noiseScale:s=e.params.noiseScale,thickness:n=e.params.thickness,radius:l=e.params.radius,innerShape:c=e.params.innerShape,noiseIterations:u=e.params.noiseIterations,fit:f=e.params.fit,scale:m=e.params.scale,rotation:o=e.params.rotation,originX:p=e.params.originX,originY:d=e.params.originY,offsetX:S=e.params.offsetX,offsetY:k=e.params.offsetY,worldWidth:R=e.params.worldWidth,worldHeight:C=e.params.worldHeight,...b}){const y={u_colorBack:x(r),u_colors:a.map(x),u_colorsCount:a.length,u_noiseScale:s,u_thickness:n,u_radius:l,u_innerShape:c,u_noiseIterations:u,u_noiseTexture:V(),u_fit:w[f],u_scale:m,u_rotation:o,u_offsetX:S,u_offsetY:k,u_originX:p,u_originY:d,u_worldWidth:R,u_worldHeight:C};return _.jsx(F,{...b,speed:t,frame:i,fragmentShader:$,uniforms:y})},P),q=["#c8c8d0"];function W({speed:h=1,colorBack:t="#12121a",colors:i=q,radius:r=.25,thickness:a=.65,scale:s=.8,className:n,...l}){const c=I(),{fps:u,width:f,height:m}=T(),[o]=g.useState(()=>U("shader-smoke-ring")),p=g.useCallback(d=>{d&&requestAnimationFrame(()=>requestAnimationFrame(()=>B(o)))},[o]);return _.jsx("div",{ref:p,className:n,style:{position:"absolute",inset:0},children:_.jsx(D,{speed:0,frame:c/u*h*1e3,colorBack:t,colors:i,radius:r,thickness:a,scale:s,fit:"cover",width:f,height:m,...l})})}export{W as ShaderSmokeRing};
