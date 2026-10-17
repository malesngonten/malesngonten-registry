import{r as F,j as P,u as H,a as $,d as Q,c as Z}from"./index-DfUQpdcJ.js";import{d as J,r as K,s as ee,c as te,g as X,S as oe,a as ae,b as se}from"./shader-mount-CaTjb1OO.js";import{t as Y,s as re}from"./suspend-HpFiNy5T.js";const ie=`#version 300 es
precision mediump float;

uniform sampler2D u_image;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${J}
${K}
${ee}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  // u_contour is applied in 2 separate ranges:
  // - 0 to .4 sets the edge hardness, saturated above .4 (both branches below)
  // - .5 to 1 warps the stripes direction along the edges, inactive below .5 (see u_contour range 2)
  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

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
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

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
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  // u_contour range 2
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${te}

  fragColor = vec4(color, opacity);
}
`,q={workingSize:512,iterations:40};function j(d){const U=document.createElement("canvas"),f=U.getContext("2d"),w=typeof d=="string"&&d.startsWith("blob:");return new Promise((g,h)=>{if(!d||!f){h(new Error("Invalid file or canvas context"));return}const b=w&&fetch(d).then(n=>n.headers.get("Content-Type")),t=new Image;t.crossOrigin="anonymous",performance.now(),t.onload=async()=>{let n;const s=await b;s?n=s==="image/svg+xml":typeof d=="string"?n=d.endsWith(".svg")||d.startsWith("data:image/svg+xml"):n=d.type==="image/svg+xml";let c=t.width||t.naturalWidth,r=t.height||t.naturalHeight;if(n){const u=c/r;c>r?(c=4096,r=4096/u):(r=4096,c=4096*u),t.width=c,t.height=r}const k=Math.min(c,r),m=q.workingSize/k,e=Math.round(c*m),i=Math.round(r*m);U.width=c,U.height=r;const _=document.createElement("canvas");_.width=e,_.height=i;const I=_.getContext("2d");I.drawImage(t,0,0,e,i),performance.now();const V=I.getImageData(0,0,e,i).data,a=new Uint8Array(e*i),B=new Uint8Array(e*i);for(let o=0,u=0;o<V.length;o+=4,u++){const v=V[o+3]===0?0:1;a[u]=v}const G=[],D=[];for(let o=0;o<i;o++)for(let u=0;u<e;u++){const p=o*e+u;if(!a[p])continue;let v=!1;u===0||u===e-1||o===0||o===i-1?v=!0:v=!a[p-1]||!a[p+1]||!a[p-e]||!a[p+e]||!a[p-e-1]||!a[p-e+1]||!a[p+e-1]||!a[p+e+1],v?(B[p]=1,G.push(p)):D.push(p)}const C=ne(a,B,new Uint32Array(D),new Uint32Array(G),e,i);performance.now();const M=ce(C,a,B,e,i);let A=0,E;for(let o=0;o<D.length;o++){const u=D[o];M[u]>A&&(A=M[u])}const L=document.createElement("canvas");L.width=e,L.height=i;const T=L.getContext("2d"),y=T.createImageData(e,i);for(let o=0;o<i;o++)for(let u=0;u<e;u++){const p=o*e+u,v=p*4;if(!a[p])y.data[v]=255,y.data[v+1]=255,y.data[v+2]=255,y.data[v+3]=0;else{const O=255*(1-M[p]/A);y.data[v]=O,y.data[v+1]=O,y.data[v+2]=O,y.data[v+3]=255}}T.putImageData(y,0,0),f.imageSmoothingEnabled=!0,f.imageSmoothingQuality="high",f.drawImage(L,0,0,e,i,0,0,c,r);const x=f.getImageData(0,0,c,r),z=document.createElement("canvas");z.width=c,z.height=r;const W=z.getContext("2d");W.drawImage(t,0,0,c,r);const N=W.getImageData(0,0,c,r);for(let o=0;o<x.data.length;o+=4){const u=N.data[o+3],p=x.data[o+3];u===0?(x.data[o]=255,x.data[o+1]=0):(x.data[o]=p===0?0:x.data[o],x.data[o+1]=u),x.data[o+2]=255,x.data[o+3]=255}f.putImageData(x,0,0),E=x,U.toBlob(o=>{if(!o){h(new Error("Failed to create PNG blob"));return}g({imageData:E,pngBlob:o})},"image/png")},t.onerror=()=>h(new Error("Failed to load image")),t.src=typeof d=="string"?d:URL.createObjectURL(d)})}function ne(d,U,f,w,g,h){const b=f.length,t=new Int32Array(b*4);for(let n=0;n<b;n++){const s=f[n],c=s%g,r=Math.floor(s/g);t[n*4+0]=c<g-1&&d[s+1]?s+1:-1,t[n*4+1]=c>0&&d[s-1]?s-1:-1,t[n*4+2]=r>0&&d[s-g]?s-g:-1,t[n*4+3]=r<h-1&&d[s+g]?s+g:-1}return{interiorPixels:f,boundaryPixels:w,pixelCount:b,neighborIndices:t}}function ce(d,U,f,w,g){const h=q.iterations,b=.01,t=new Float32Array(w*g),{interiorPixels:n,neighborIndices:s,pixelCount:c}=d;performance.now();const r=1.9,k=[],R=[];for(let m=0;m<c;m++){const e=n[m],i=e%w,_=Math.floor(e/w);(i+_)%2===0?k.push(m):R.push(m)}for(let m=0;m<h;m++){for(const e of k){const i=n[e],_=s[e*4+0],I=s[e*4+1],S=s[e*4+2],V=s[e*4+3];let a=0;_>=0&&(a+=t[_]),I>=0&&(a+=t[I]),S>=0&&(a+=t[S]),V>=0&&(a+=t[V]);const B=(b+a)/4;t[i]=r*B+(1-r)*t[i]}for(const e of R){const i=n[e],_=s[e*4+0],I=s[e*4+1],S=s[e*4+2],V=s[e*4+3];let a=0;_>=0&&(a+=t[_]),I>=0&&(a+=t[I]),S>=0&&(a+=t[S]),V>=0&&(a+=t[V]);const B=(b+a)/4;t[i]=r*B+(1-r)*t[i]}}return t}const de={none:0,circle:1,daisy:2,diamond:3,metaballs:4},l={params:{...ae,scale:.6,speed:1,frame:0,colorBack:"#AAAAAC",colorTint:"#ffffff",distortion:.07,repetition:2,shiftRed:.3,shiftBlue:.3,contour:.4,softness:.1,angle:70,shape:"diamond"}},ue=F.memo(function({colorBack:U=l.params.colorBack,colorTint:f=l.params.colorTint,speed:w=l.params.speed,frame:g=l.params.frame,image:h="",contour:b=l.params.contour,distortion:t=l.params.distortion,softness:n=l.params.softness,repetition:s=l.params.repetition,shiftRed:c=l.params.shiftRed,shiftBlue:r=l.params.shiftBlue,angle:k=l.params.angle,shape:R=l.params.shape,suspendWhenProcessingImage:m=!1,fit:e=l.params.fit,scale:i=l.params.scale,rotation:_=l.params.rotation,originX:I=l.params.originX,originY:S=l.params.originY,offsetX:V=l.params.offsetX,offsetY:a=l.params.offsetY,worldWidth:B=l.params.worldWidth,worldHeight:G=l.params.worldHeight,...D}){const C=typeof h=="string"?h:h.src,[M,A]=F.useState(Y);let E;m&&typeof window<"u"&&C?E=re(()=>j(C).then(T=>URL.createObjectURL(T.pngBlob)),[C,"liquid-metal"]):E=M,F.useLayoutEffect(()=>{if(m)return;if(!C){A(Y);return}let T,y=!0;return j(C).then(x=>{y&&(T=URL.createObjectURL(x.pngBlob),A(T))}),()=>{y=!1}},[C,m]);const L={u_colorBack:X(U),u_colorTint:X(f),u_image:E,u_contour:b,u_distortion:t,u_softness:n,u_repetition:s,u_shiftRed:c,u_shiftBlue:r,u_angle:k,u_isImage:!!h,u_shape:de[R],u_fit:se[e],u_scale:i,u_rotation:_,u_offsetX:V,u_offsetY:a,u_originX:I,u_originY:S,u_worldWidth:B,u_worldHeight:G};return P.jsx(oe,{...D,speed:w,frame:g,fragmentShader:ie,mipmaps:["u_image"],uniforms:L})});function ge({speed:d=1,colorBack:U="#2a2a30",colorTint:f="#8a8a95",distortion:w=.1,repetition:g=1.5,contour:h=.4,softness:b=.05,shape:t="none",className:n,...s}){const c=H(),{fps:r,width:k,height:R}=$(),[m]=F.useState(()=>Q("shader-liquid-metal")),e=F.useCallback(i=>{i&&requestAnimationFrame(()=>requestAnimationFrame(()=>Z(m)))},[m]);return P.jsx("div",{ref:e,className:n,style:{position:"absolute",inset:0},children:P.jsx(ue,{speed:0,frame:c/r*d*1e3,colorBack:U,colorTint:f,distortion:w,repetition:g,contour:h,softness:b,shape:t,fit:"cover",width:k,height:R,...s})})}export{ge as ShaderLiquidMetal};
