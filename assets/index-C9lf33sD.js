import{r as B,j as X,u as oe,a as ae,d as ne,c as se,R as ie}from"./index-DfUQpdcJ.js";import{d as re,r as ce,g as N,S as le,a as me,b as ue}from"./shader-mount-CaTjb1OO.js";import{c as fe}from"./color-props-are-equal-vk6rHV-W.js";import{t as Z,s as de}from"./suspend-HpFiNy5T.js";const J={maxColorCount:6},pe=`#version 300 es
precision mediump float;

in mediump vec2 v_imageUV;
in mediump vec2 v_objectUV;
in mediump vec2 v_responsiveUV;
in mediump vec2 v_responsiveBoxGivenSize;
                                               
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_shape;
uniform bool u_isImage;

uniform float u_time;
uniform vec4 u_colors[${J.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform vec4 u_colorInner;
uniform float u_innerDistortion;
uniform float u_outerDistortion;
uniform float u_outerGlow;
uniform float u_innerGlow;
uniform float u_offset;
uniform float u_angle;
uniform float u_size;

${re}
${ce}

// 9x9 Gaussian blur on R and G channels
vec2 gaussBlur9x9RG(sampler2D tex, vec2 uv, float radius) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = max(radius, 0.0) * texel;
  // Pascal's row 8: sum = 256, 2D norm = 65536
  const float k[9] = float[9](1.0, 8.0, 28.0, 56.0, 70.0, 56.0, 28.0, 8.0, 1.0);
  vec2 sum = vec2(0.0);

  for (int j = -4; j <= 4; ++j) {
    float wy = k[j + 4];
    for (int i = -4; i <= 4; ++i) {
      float w = k[i + 4] * wy;
      vec2 off = vec2(float(i) * r.x, float(j) * r.y);
      sum += w * texture(tex, uv + off).rg;
    }
  }

  return sum / 65536.0;
}

float sst(float a, float b, float x) {
  return smoothstep(a, b, x);
}

void main() {
  float time = u_time;

  float roundness = 0.;
  float imgAlpha = 0.;

  if (u_isImage == true) {
    // Image sampling (UV scaled inward to account for padding)
    vec2 imageUV = v_imageUV;
    imageUV -= .5;
    imageUV *= .95;
    imageUV += .5;

    // Blurred image: x = roundness, y = alpha
    vec2 blurred = gaussBlur9x9RG(u_image, imageUV, 10.);
    roundness = 1. - blurred.x;
    vec2 texelA = 1.0 / vec2(textureSize(u_image, 0));
    const float k3[3] = float[3](1.0, 2.0, 1.0);
    for (int j = -1; j <= 1; ++j) {
      for (int i = -1; i <= 1; ++i) {
        imgAlpha += k3[i + 1] * k3[j + 1] * texture(u_image, imageUV + vec2(float(i) * texelA.x, float(j) * texelA.y)).g;
      }
    }
    imgAlpha /= 16.0;
  } else {
    vec2 uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
    float edge = 0.;

    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * time));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;
    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(time * speed + fi * 1.23) + dir2 * cos(time * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    imgAlpha = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    roundness = 1. - edge;
  }

// Smoke UV setup
  vec2 smokeUV = v_objectUV;
  smokeUV = rotate(smokeUV, u_angle * PI / 180.);
  smokeUV *= mix(4., 1., u_size);

  // Two swirl paths: inner (shape-masked) and outer (free), each with independent distortion
  vec2 innerUV = smokeUV;
  vec2 outerUV = smokeUV;

  // Vertical displacement — applied independently to inner and outer
  innerUV.y += u_innerDistortion * (1. - sst(0., 1., length(.4 * innerUV)));
  innerUV.y -= .4 * u_innerDistortion;
  innerUV.y += .7 * u_offset * roundness;

  outerUV.y += u_outerDistortion * (1. - sst(0., 1., length(.4 * outerUV)));
  outerUV.y -= .4 * u_outerDistortion;

  float innerSwirl = u_innerDistortion * roundness;
  float outerSwirl = u_outerDistortion;

  for (int i = 1; i < 5; i++) {
    float fi = float(i);

    float stretchIn = max(length(dFdx(innerUV)), length(dFdy(innerUV)));
    float dampenIn = 1. / (1. + stretchIn * 8.);
    float sIn = innerSwirl * dampenIn;
    innerUV.x += sIn / fi * cos(time + fi * 2.9 * innerUV.y);
    innerUV.y += sIn / fi * cos(time + fi * 1.5 * innerUV.x);

    float stretchOut = max(length(dFdx(outerUV)), length(dFdy(outerUV)));
    float dampenOut = 1. / (1. + stretchOut * 8.);
    float sOut = outerSwirl * dampenOut;
    outerUV.x += sOut / fi * cos(time + fi * 2.9 * outerUV.y);
    outerUV.y += sOut / fi * cos(time + fi * 1.5 * outerUV.x);
  }

  // Smoke shapes from swirl fields
  float innerShape = exp(-1.5 * dot(innerUV, innerUV));
  float outerShape = exp(-1.5 * dot(outerUV, outerUV));

  // Visibility masks
  float outerMask = pow(u_outerGlow, 2.) * (1. - imgAlpha);
  float innerMask = (.01 + .99 * u_innerGlow) * imgAlpha;

  innerShape *= innerMask;
  outerShape *= outerMask;

  // Color gradient
  float mixer = (innerShape + outerShape) * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;

  float smokeMask = 0.;
  for (int i = 1; i < ${J.maxColorCount+1}; i++) {
    if (i > int(u_colorsCount)) break;

    float m = sst(0., 1., clamp(mixer - float(i - 1), 0., 1.));
    if (i == 1) smokeMask = m;

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  // Compositing (premultiplied alpha, front-to-back)
  vec3 color = gradient.rgb * smokeMask;
  float opacity = gradient.a * smokeMask;

  float innerOpacity = u_colorInner.a * imgAlpha;
  vec3 innerColor = u_colorInner.rgb * innerOpacity;
  color += innerColor * (1.0 - opacity);
  opacity += innerOpacity * (1.0 - opacity);

  vec3 backColor = u_colorBack.rgb * u_colorBack.a;
  color += backColor * (1.0 - opacity);
  opacity += u_colorBack.a * (1.0 - opacity);

  fragColor = vec4(color, opacity);
}
`,ee={workingSize:512,iterations:32};function K(m){const C=document.createElement("canvas"),g=C.getContext("2d"),y=typeof m=="string"&&m.startsWith("blob:");return new Promise((h,k)=>{if(!m||!g){k(new Error("Invalid file or canvas context"));return}const w=y&&fetch(m).then(r=>r.headers.get("Content-Type")),o=new Image;o.crossOrigin="anonymous",performance.now(),o.onload=async()=>{let r;const n=await w;n?r=n==="image/svg+xml":typeof m=="string"?r=m.endsWith(".svg")||m.startsWith("data:image/svg+xml"):r=m.type==="image/svg+xml";let i=o.width||o.naturalWidth,s=o.height||o.naturalHeight;if(r){const u=i/s;i>s?(i=4096,s=4096/u):(s=4096,i=4096*u),o.width=i,o.height=s}const M=Math.min(i,s),x=ee.workingSize/M,t=Math.round(i*x),e=Math.round(s*x);C.width=i,C.height=s;const p=.025,v=Math.ceil(t*p),V=Math.ceil(e*p),I=t-2*v,S=e-2*V,c=document.createElement("canvas");c.width=t,c.height=e;const _=c.getContext("2d");_.drawImage(o,v,V,I,S),performance.now();const P=_.getImageData(0,0,t,e).data,f=new Uint8Array(t*e),z=new Uint8Array(t*e);for(let a=0,u=0;a<P.length;a+=4,u++){const U=P[a+3]===0?0:1;f[u]=U}const R=[],G=[];for(let a=0;a<e;a++)for(let u=0;u<t;u++){const d=a*t+u;if(!f[d])continue;let U=!1;u===0||u===t-1||a===0||a===e-1?U=!0:U=!f[d-1]||!f[d+1]||!f[d-t]||!f[d+t]||!f[d-t-1]||!f[d-t+1]||!f[d+t-1]||!f[d+t+1],U?(z[d]=1,R.push(d)):G.push(d)}const Y=ge(f,z,new Uint32Array(G),new Uint32Array(R),t,e);performance.now();const j=he(Y,f,z,t,e);let O=0,F;for(let a=0;a<G.length;a++){const u=G[a];j[u]>O&&(O=j[u])}const E=document.createElement("canvas");E.width=t,E.height=e;const H=E.getContext("2d"),D=H.createImageData(t,e);for(let a=0;a<e;a++)for(let u=0;u<t;u++){const d=a*t+u,U=d*4;if(!f[d])D.data[U]=255,D.data[U+1]=255,D.data[U+2]=255,D.data[U+3]=0;else{let T=255*(1-j[d]/O);D.data[U]=T,D.data[U+1]=T,D.data[U+2]=T,D.data[U+3]=255}}H.putImageData(D,0,0),g.imageSmoothingEnabled=!0,g.imageSmoothingQuality="high",g.drawImage(E,0,0,t,e,0,0,i,s);const b=g.getImageData(0,0,i,s),$=Math.ceil(i*p),q=Math.ceil(s*p),L=document.createElement("canvas");L.width=i,L.height=s;const Q=L.getContext("2d");Q.drawImage(o,$,q,i-2*$,s-2*q);const te=Q.getImageData(0,0,i,s);for(let a=0;a<b.data.length;a+=4){const u=te.data[a+3],d=b.data[a+3];u===0?(b.data[a]=255,b.data[a+1]=0):(b.data[a]=d===0?0:b.data[a],b.data[a+1]=u),b.data[a+2]=255,b.data[a+3]=255}g.putImageData(b,0,0),F=b,C.toBlob(a=>{if(!a){k(new Error("Failed to create PNG blob"));return}h({imageData:F,pngBlob:a})},"image/png")},o.onerror=()=>k(new Error("Failed to load image")),o.src=typeof m=="string"?m:URL.createObjectURL(m)})}function ge(m,C,g,y,h,k){const w=g.length,o=new Int32Array(w*4);for(let r=0;r<w;r++){const n=g[r],i=n%h,s=Math.floor(n/h);o[r*4+0]=i<h-1&&m[n+1]?n+1:-1,o[r*4+1]=i>0&&m[n-1]?n-1:-1,o[r*4+2]=s>0&&m[n-h]?n-h:-1,o[r*4+3]=s<k-1&&m[n+h]?n+h:-1}return{interiorPixels:g,boundaryPixels:y,pixelCount:w,neighborIndices:o}}function he(m,C,g,y,h){const k=ee.iterations,w=.01,o=new Float32Array(y*h),{interiorPixels:r,neighborIndices:n,pixelCount:i}=m;performance.now();const s=1.9,M=[],A=[];for(let t=0;t<i;t++){const e=r[t],p=e%y,v=Math.floor(e/y);(p+v)%2===0?M.push(t):A.push(t)}for(let t=0;t<k;t++){for(const e of M){const p=r[e],v=n[e*4+0],V=n[e*4+1],I=n[e*4+2],S=n[e*4+3];let c=0;v>=0&&(c+=o[v]),V>=0&&(c+=o[V]),I>=0&&(c+=o[I]),S>=0&&(c+=o[S]);const _=(w+c)/4;o[p]=s*_+(1-s)*o[p]}for(const e of A){const p=r[e],v=n[e*4+0],V=n[e*4+1],I=n[e*4+2],S=n[e*4+3];let c=0;v>=0&&(c+=o[v]),V>=0&&(c+=o[V]),I>=0&&(c+=o[I]),S>=0&&(c+=o[S]);const _=(w+c)/4;o[p]=s*_+(1-s)*o[p]}}const x=new Float32Array(y*h);for(let t=0;t<3;t++){x.set(o);for(let e=0;e<i;e++){const p=r[e],v=n[e*4+0],V=n[e*4+1],I=n[e*4+2],S=n[e*4+3];let c=0,_=0;v>=0&&(c+=x[v],_++),V>=0&&(c+=x[V],_++),I>=0&&(c+=x[I],_++),S>=0&&(c+=x[S],_++),o[p]=_>0?(x[p]+c/_)*.5:x[p]}}return o}const xe={none:0,circle:1,daisy:2,diamond:3,metaballs:4},l={params:{...me,scale:.6,speed:1,frame:0,colorBack:"#f0efea",colorInner:"#fafaf5",colors:["#333333","#e7e6df"],outerGlow:.55,innerGlow:1,innerDistortion:.8,outerDistortion:.6,offset:0,angle:0,size:.8,shape:"diamond"}},ve=B.memo(function({colorBack:C=l.params.colorBack,colors:g=l.params.colors,speed:y=l.params.speed,frame:h=l.params.frame,image:k="",innerDistortion:w=l.params.innerDistortion,outerDistortion:o=l.params.outerDistortion,outerGlow:r=l.params.outerGlow,innerGlow:n=l.params.innerGlow,colorInner:i=l.params.colorInner,offset:s=l.params.offset,angle:M=l.params.angle,size:A=l.params.size,shape:x=l.params.shape,suspendWhenProcessingImage:t=!1,fit:e=l.params.fit,scale:p=l.params.scale,rotation:v=l.params.rotation,originX:V=l.params.originX,originY:I=l.params.originY,offsetX:S=l.params.offsetX,offsetY:c=l.params.offsetY,worldWidth:_=l.params.worldWidth,worldHeight:W=l.params.worldHeight,...P}){const f=typeof k=="string"?k:k.src,[z,R]=B.useState(Z);let G;t&&typeof window<"u"&&f?G=de(()=>K(f).then(j=>URL.createObjectURL(j.pngBlob)),[f,"gemSmoke"]):G=z,B.useLayoutEffect(()=>{if(t)return;if(!f){R(Z);return}let j,O=!0;return K(f).then(F=>{O&&(j=URL.createObjectURL(F.pngBlob),R(j))}),()=>{O=!1}},[f,t]);const Y={u_colors:g.map(N),u_colorsCount:g.length,u_colorBack:N(C),u_image:G,u_innerDistortion:w,u_outerDistortion:o,u_outerGlow:r,u_innerGlow:n,u_colorInner:N(i),u_offset:s,u_angle:M,u_size:A,u_isImage:!!k,u_shape:xe[x],u_fit:ue[e],u_scale:p,u_rotation:v,u_offsetX:S,u_offsetY:c,u_originX:V,u_originY:I,u_worldWidth:_,u_worldHeight:W};return X.jsx(le,{...P,speed:y,frame:h,fragmentShader:pe,mipmaps:["u_image"],uniforms:Y})},fe),_e=["#3a3a5c","#52527a"];function Ie({speed:m=1,colors:C=_e,colorBack:g="#0a0a10",innerDistortion:y=.8,outerDistortion:h=.6,outerGlow:k=.55,innerGlow:w=1,size:o=.8,className:r,...n}){const i=oe(),{fps:s,width:M,height:A}=ae(),[x]=B.useState(()=>ne("shader-gem-smoke")),t=B.useCallback(e=>{e&&requestAnimationFrame(()=>requestAnimationFrame(()=>se(x)))},[x]);return X.jsx("div",{ref:t,className:r,style:{position:"absolute",inset:0},children:X.jsx(ie.Suspense,{fallback:null,children:X.jsx(ve,{speed:0,frame:i/s*m*1e3,colors:C,colorBack:g,innerDistortion:y,outerDistortion:h,outerGlow:k,innerGlow:w,size:o,fit:"cover",width:M,height:A,suspendWhenProcessingImage:!0,...n})})})}export{Ie as ShaderGemSmoke};
