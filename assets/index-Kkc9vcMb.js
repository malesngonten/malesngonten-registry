import{r as h,j as _,u as F,a as B,d as y,c as z}from"./index-DfUQpdcJ.js";import{d as O,t as w,c as k,g as v,S as R,a as j,b as X}from"./shader-mount-CaTjb1OO.js";import{c as Y}from"./color-props-are-equal-vk6rHV-W.js";import{g as $}from"./get-shader-noise-texture-V_p2J5L4.js";const d={maxColorCount:8,maxBallsCount:20},I=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${d.maxColorCount}];
uniform float u_colorsCount;
uniform float u_size;
uniform float u_count;

in vec2 v_objectUV;

out vec4 fragColor;

${O}
${w}
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  vec2 p0 = vec2(i, 0.0);
  vec2 p1 = vec2(i + 1.0, 0.0);
  return mix(randomR(p0), randomR(p1), u);
}

float getBallShape(vec2 uv, vec2 c, float p) {
  float s = .5 * length(uv - c);
  s = 1. - clamp(s, 0., 1.);
  s = pow(s, p);
  return s;
}

void main() {
  vec2 shape_uv = v_objectUV;

  shape_uv += .5;

  const float firstFrameOffset = 2503.4;
  float t = .2 * (u_time + firstFrameOffset);

  vec3 totalColor = vec3(0.);
  float totalShape = 0.;
  float totalOpacity = 0.;

  for (int i = 0; i < ${d.maxBallsCount}; i++) {
    if (i >= int(ceil(u_count))) break;

    float idxFract = float(i) / float(${d.maxBallsCount});
    float angle = TWO_PI * idxFract;

    float speed = 1. - .2 * idxFract;
    float noiseX = noise(angle * 10. + float(i) + t * speed);
    float noiseY = noise(angle * 20. + float(i) - t * speed);

    vec2 pos = vec2(.5) + 1e-4 + .9 * (vec2(noiseX, noiseY) - .5);

    int safeIndex = i % int(u_colorsCount + 0.5);
    vec4 ballColor = u_colors[safeIndex];
    ballColor.rgb *= ballColor.a;

    float sizeFrac = 1.;
    if (float(i) > floor(u_count - 1.)) {
      sizeFrac *= fract(u_count);
    }

    float shape = getBallShape(shape_uv, pos, 45. - 30. * u_size * sizeFrac);
    shape *= pow(u_size, .2);
    shape = smoothstep(0., 1., shape);

    totalColor += ballColor.rgb * shape;
    totalShape += shape;
    totalOpacity += ballColor.a * shape;
  }

  totalColor /= max(totalShape, 1e-4);
  totalOpacity /= max(totalShape, 1e-4);

  float edge_width = fwidth(totalShape);
  float finalShape = smoothstep(.4, .4 + edge_width, totalShape);

  vec3 color = totalColor * finalShape;
  float opacity = totalOpacity * finalShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${k}

  fragColor = vec4(color, opacity);
}
`,a={params:{...j,scale:1,speed:1,frame:0,colorBack:"#000000",colors:["#6e33cc","#ff5500","#ffc105","#ffc800","#f585ff"],count:10,size:.83}},M=h.memo(function({speed:e=a.params.speed,frame:r=a.params.frame,colorBack:l=a.params.colorBack,colors:o=a.params.colors,size:s=a.params.size,count:i=a.params.count,fit:c=a.params.fit,rotation:f=a.params.rotation,scale:n=a.params.scale,originX:u=a.params.originX,originY:t=a.params.originY,offsetX:p=a.params.offsetX,offsetY:m=a.params.offsetY,worldWidth:x=a.params.worldWidth,worldHeight:C=a.params.worldHeight,...b}){const S={u_colorBack:v(l),u_colors:o.map(v),u_colorsCount:o.length,u_size:s,u_count:i,u_noiseTexture:$(),u_fit:X[c],u_rotation:f,u_scale:n,u_offsetX:p,u_offsetY:m,u_originX:u,u_originY:t,u_worldWidth:x,u_worldHeight:C};return _.jsx(R,{...b,speed:e,frame:r,fragmentShader:I,uniforms:S})},Y),T=["#3a3a5c","#52527a","#8a8a95"];function U({speed:g=1,colorBack:e="#12121a",colors:r=T,count:l=10,size:o=.83,className:s,...i}){const c=F(),{fps:f,width:n,height:u}=B(),[t]=h.useState(()=>y("shader-metaballs")),p=h.useCallback(m=>{m&&requestAnimationFrame(()=>requestAnimationFrame(()=>z(t)))},[t]);return _.jsx("div",{ref:p,className:s,style:{position:"absolute",inset:0},children:_.jsx(M,{speed:0,frame:c/f*g*1e3,colorBack:e,colors:r,count:l,size:o,fit:"cover",width:n,height:u,...i})})}export{U as ShaderMetaballs};
