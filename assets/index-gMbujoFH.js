import{u as Te,a as Se,r as R,d as we,c as k,j as N}from"./index-DfUQpdcJ.js";const F="gone before you look",O=7,Y=4,D=12,G=3,Ae=.04,Ee=1.6,ge=28,_e=.85,Pe=.38,ye=.55,ie=.55,ce=.5,Me=3.2,ve=3.5,Ue=.95,He=1.75,Be=1.57,Ce=1,Ie=.42,be=.16,Le=.55,Oe=.6,Fe=.26,De=-.9,L=.9,Ge=.07,fe=1,Ne=5,We=.16,$e=3,Ye=.12,Xe=.7,Ke=.035,je=.14,le=.028,J=2.6,ee=.34,Qe=1.2,te=.35,qe=.5,ze=[1,.557,.121,.049,.014,0],Ve=[0,.08,.8,1],Ze=[0,.5,.82,.95,1,1],ke=[0,.05,.14,.38,1],oe=[-1,.7,-.45,1],ne=Math.PI-L;function re(t,e){const n=t.trim().replace(/^#/,""),r=n.length===3?n.replace(/./g,a=>a+a):n;return/^[0-9a-f]{6}$/i.test(r)?[Number.parseInt(r.slice(0,2),16)/255,Number.parseInt(r.slice(2,4),16)/255,Number.parseInt(r.slice(4,6),16)/255]:[e[0],e[1],e[2]]}function X(t,e){return(t%e+e)%e}function b(t,e){const n=t.length-1,r=Math.min(Math.max(e,0),1)*n,a=Math.min(Math.floor(r),n-1);return t[a]+(t[a+1]-t[a])*(r-a)}function K(t){const e=t.trim().split(/\s+/).filter(Boolean);return e.length>0?e:F.split(" ")}function j(t=D,e=G){return O+Y+Math.max(t,1)+Math.max(e,0)}function Je({phrase:t=F,restDuration:e=D,peakHoldDuration:n=G}={}){return Math.round(K(t).length*j(e,n))}const ht=Je();function et(t=1){const e=Math.max(t,0);return[.62**e,1,.34**e]}function W(t,{wordCount:e,restDuration:n,peakHoldDuration:r}){const a=Math.max(Math.floor(e),1),s=Math.max(n,1),c=Math.max(r,0),f=c/2,i=j(s,c),l=f+O,h=l+s,o=h+Y,u=l+s/2,A=t+u,S=Math.floor(A/i),m=X(A,i),d=X(S,a);if(m<f)return{phase:"hang",p:1,psi:L*(m/Math.max(f,1e-6)),cycle:S,wordIndex:d};if(m<l){const p=(m-f)/O;return{phase:"arrive",p:b(ze,p),psi:L+ne*b(Ze,p),cycle:S,wordIndex:d}}if(m<h)return{phase:"rest",p:0,psi:Math.PI,cycle:S,wordIndex:d};if(m<o){const p=(m-h)/Y;return{phase:"depart",p:b(Ve,p),psi:Math.PI+ne*b(ke,p),cycle:S,wordIndex:d}}const T=(m-o)/Math.max(f,1e-6);return{phase:"hang",p:1,psi:2*Math.PI-L*(1-T),cycle:S,wordIndex:d}}function he({frame:t,fps:e,wordCount:n,restDuration:r,peakHoldDuration:a,chromaticSpread:s}){const c=Ae*Math.max(e,1),f=c/2,i={wordCount:n,restDuration:r,peakHoldDuration:a},l=W(t-f,i),h=W(t,i),o=W(t+f,i),u=j(r,a),m=Math.max(a,0)/2+O+Math.max(r,1)/2,d=t+m,T=Math.round(d/u)*u,p=d-T,w=n>1&&o.cycle>l.cycle?(o.cycle*u-d)/c:2,U=n>1?Math.max(0,1-(2*p)**2/c**2):0;return{before:l,here:h,after:o,swapU:w,swapAmount:U,shutterRatios:et(s)}}function dt({frame:t,fps:e=30,phrase:n=F,restDuration:r=D,peakHoldDuration:a=G,chromaticSpread:s=1,speed:c=1}){const f=K(n),i=he({frame:t*Math.max(c,0),fps:e,wordCount:f.length,restDuration:r,peakHoldDuration:a,chromaticSpread:s}),l=i.here.p;return{phase:i.here.phase,wordIndex:i.here.wordIndex,beforeWordIndex:i.before.wordIndex,afterWordIndex:i.after.wordIndex,cycle:i.here.cycle,motion:l,isResting:i.here.phase==="rest"&&i.before.p===0&&i.after.p===0,swapAmount:i.swapAmount,shutterRatios:i.shutterRatios,thinAmount:ie*l,bloomAmount:ce*l,crtAmount:fe*l,groundAmount:le*l}}function ae(t,e,n){const r=Math.sin(n);return e*(Math.sin(t-n)-r)/(1+Math.abs(r))}const tt=`
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,ot=`
precision highp float;
varying vec2 vUv;

uniform sampler2D uText;
uniform vec2 uRes;
uniform vec2 uHalfPx;
uniform float uAtlasRows;
uniform float uSx;
uniform vec3 uSyQ;
uniform float uCenterY;
uniform float uSwapU;
uniform float uHalfA;
uniform float uHalfB;
uniform vec3 uK;
uniform vec2 uSwapScl;
uniform float uShape;
uniform float uRoll;
uniform float uLag;
uniform float uThin;
uniform float uBloom;
uniform float uGain;
uniform float uExp;
uniform float uFocal;
uniform vec3 uPos;
uniform vec4 uRot;
uniform float uCrt;
uniform float uTime;
uniform vec4 uGlow;
uniform float uGlowAmp;
uniform vec3 uColor;
uniform vec3 uBg;

#define SAMPLES ${ge}
#define BLOOM_TAPS 4
#define BLOOM_SPREAD ${Me.toFixed(3)}
#define BLOOM_BIAS ${ve.toFixed(3)}
#define TAU 6.2831853
#define CRT_PITCH ${Ne.toFixed(3)}
#define CRT_MASK ${We.toFixed(4)}
#define CRT_SCAN_PITCH ${$e.toFixed(3)}
#define CRT_SCAN ${Ye.toFixed(4)}
#define CRT_BEAM ${Xe.toFixed(4)}
#define CRT_HUM ${Ke.toFixed(4)}
#define CRT_HUM_SPEED ${je.toFixed(4)}

vec2 atlasUv(float sy, float halfIdx, vec2 wordPoint, out float inside) {
  float sx = max(uSx, 1e-4);
  float sv = max(abs(sy), 1e-4);
  vec2 q = vec2(
    (wordPoint.x / sx + uHalfPx.x * 0.5) / uHalfPx.x,
    (wordPoint.y / sv + uHalfPx.y * 0.5) / uHalfPx.y
  );
  inside = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
  return vec2(
    clamp(q.x, 0.0, 1.0),
    (clamp(q.y, 0.0, 1.0) + halfIdx) / uAtlasRows
  );
}

float tap(float sy, float halfIdx, vec2 wordPoint, float front) {
  float inside;
  vec2 texturePoint = atlasUv(sy, halfIdx, wordPoint, inside);
  float value = texture2D(uText, texturePoint).r * inside * front;
  return value * mix(1.0, value, uThin);
}

float tapBlur(float sy, float halfIdx, vec2 wordPoint, float front) {
  float inside;
  vec2 texturePoint = atlasUv(sy, halfIdx, wordPoint, inside);
  return texture2D(uText, texturePoint, BLOOM_BIAS).r * inside * front;
}

void main() {
  vec2 pixel = vUv * uRes;
  vec2 center = vec2(uRes.x * 0.5, uRes.y * uCenterY);
  vec2 screenPoint = pixel - center;

  float sinYaw = uRot.x;
  float cosYaw = uRot.y;
  float sinPitch = uRot.z;
  float cosPitch = uRot.w;
  float a1 = -(screenPoint.x * sinYaw + uFocal * cosYaw);
  float b1 = sinPitch * (screenPoint.x * cosYaw - uFocal * sinYaw);
  float c1 = uFocal * uPos.x - screenPoint.x * uPos.z;
  float a2 = -screenPoint.y * sinYaw;
  float b2 = screenPoint.y * sinPitch * cosYaw - uFocal * cosPitch;
  float c2 = uFocal * uPos.y - screenPoint.y * uPos.z;
  float determinant = a1 * b2 - a2 * b1;
  float inverse = 1.0 / (abs(determinant) < 1e-4 ? 1e-4 : determinant);
  float a = (c1 * b2 - c2 * b1) * inverse;
  float b = (a1 * c2 - a2 * c1) * inverse;
  float cameraZ = uPos.z - a * sinYaw + b * sinPitch * cosYaw;
  vec2 wordPoint = vec2(a, b);
  float front = step(uFocal * 0.05, cameraZ);
  vec3 accumulated = vec3(0.0);

  if (abs(uSyQ.y) + abs(uSyQ.z) < 1e-5) {
    accumulated = vec3(tap(uSyQ.x, uHalfA, wordPoint, front));
  } else {
    float offset =
      uLag * (wordPoint.x / uRes.x) - uRoll * (screenPoint.y / uRes.y);
    float weightSum = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
      float u = float(i) / float(SAMPLES - 1) - 0.5;
      float weight = 1.0 - uShape * abs(u) * 2.0;
      weightSum += weight;
      float shiftedU = u + offset;
      vec3 shutterU = shiftedU * uK;
      vec3 sy = uSyQ.x + uSyQ.y * shutterU + uSyQ.z * shutterU * shutterU;
      accumulated.r += weight * tap(
        sy.r * (shutterU.r < uSwapU ? uSwapScl.x : uSwapScl.y),
        shutterU.r < uSwapU ? uHalfA : uHalfB,
        wordPoint,
        front
      );
      accumulated.g += weight * tap(
        sy.g * (shutterU.g < uSwapU ? uSwapScl.x : uSwapScl.y),
        shutterU.g < uSwapU ? uHalfA : uHalfB,
        wordPoint,
        front
      );
      accumulated.b += weight * tap(
        sy.b * (shutterU.b < uSwapU ? uSwapScl.x : uSwapScl.y),
        shutterU.b < uSwapU ? uHalfA : uHalfB,
        wordPoint,
        front
      );
    }

    accumulated /= max(weightSum, 1e-4);

    vec3 halo = vec3(0.0);
    for (int j = 0; j < BLOOM_TAPS; j++) {
      float u =
        (float(j) / float(BLOOM_TAPS - 1) - 0.5) * BLOOM_SPREAD + offset;
      vec3 shutterU = u * uK;
      vec3 sy = uSyQ.x + uSyQ.y * shutterU + uSyQ.z * shutterU * shutterU;
      halo.r += tapBlur(
        sy.r * (shutterU.r < uSwapU ? uSwapScl.x : uSwapScl.y),
        shutterU.r < uSwapU ? uHalfA : uHalfB,
        wordPoint,
        front
      );
      halo.g += tapBlur(
        sy.g * (shutterU.g < uSwapU ? uSwapScl.x : uSwapScl.y),
        shutterU.g < uSwapU ? uHalfA : uHalfB,
        wordPoint,
        front
      );
      halo.b += tapBlur(
        sy.b * (shutterU.b < uSwapU ? uSwapScl.x : uSwapScl.y),
        shutterU.b < uSwapU ? uHalfA : uHalfB,
        wordPoint,
        front
      );
    }
    accumulated += halo * (uBloom / float(BLOOM_TAPS));
    accumulated *= uGain;
  }

  accumulated =
    (1.0 - exp(-accumulated * uExp)) / (1.0 - exp(-uExp));

  vec2 glowDistance =
    (pixel - uGlow.xy) / max(uGlow.zw, vec2(1.0));
  float ground =
    uGlowAmp * (1.0 - smoothstep(0.0, 1.0, length(glowDistance)));
  accumulated += ground * (1.0 - accumulated);

  if (uCrt > 0.0) {
    float luminance = max(max(accumulated.r, accumulated.g), accumulated.b);
    vec3 maskWave = 0.5 + 0.5 * cos(
      TAU * (pixel.x / CRT_PITCH - vec3(0.0, 0.33333, 0.66667))
    );
    vec3 mask = mix(vec3(1.0), maskWave * 2.0, CRT_MASK * uCrt);
    float scanWave = 0.5 + 0.5 * cos(TAU * pixel.y / CRT_SCAN_PITCH);
    float scan =
      1.0 - CRT_SCAN * uCrt * (1.0 - CRT_BEAM * luminance) * (1.0 - scanWave);
    float bar = 0.5 + 0.5 * cos(
      TAU * (pixel.y / uRes.y - uTime * CRT_HUM_SPEED)
    );
    float hum = 1.0 + CRT_HUM * uCrt * (bar * 2.0 - 1.0);
    accumulated *= mask * scan * hum;
  }

  gl_FragColor = vec4(uBg + (uColor - uBg) * accumulated, 1.0);
}
`,nt=["uText","uRes","uHalfPx","uAtlasRows","uSx","uSyQ","uCenterY","uSwapU","uHalfA","uHalfB","uK","uSwapScl","uShape","uRoll","uLag","uThin","uBloom","uGain","uExp","uFocal","uPos","uRot","uCrt","uTime","uGlow","uGlowAmp","uColor","uBg"];function ue(t,e,n){const r=t.createShader(e);if(!r)throw new Error("RushType could not create a WebGL shader");if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS)){const a=t.getShaderInfoLog(r)??"Unknown shader error";throw t.deleteShader(r),new Error(`RushType shader compilation failed: ${a}`)}return r}function rt(t){const e=t.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance"});if(!e)return null;const n=ue(e,e.VERTEX_SHADER,tt),r=ue(e,e.FRAGMENT_SHADER,ot),a=e.createProgram();if(!a)throw new Error("RushType could not create a WebGL program");if(e.attachShader(a,n),e.attachShader(a,r),e.bindAttribLocation(a,0,"aPos"),e.linkProgram(a),e.deleteShader(n),e.deleteShader(r),!e.getProgramParameter(a,e.LINK_STATUS)){const u=e.getProgramInfoLog(a)??"Unknown link error";throw e.deleteProgram(a),new Error(`RushType shader linking failed: ${u}`)}const s=e.createBuffer(),c=e.createTexture();if(!s||!c)throw new Error("RushType could not allocate WebGL resources");e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const f=t.width>=1800?4096:2048,i=f/4,l=Math.round(i*.64);e.bindTexture(e.TEXTURE_2D,c),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR);const h=document.createElement("canvas");h.width=f,h.height=i;const o=Object.fromEntries(nt.map(u=>[u,e.getUniformLocation(a,u)]));return e.clearColor(0,0,0,1),{gl:e,program:a,buffer:s,texture:c,uniforms:o,atlasWidth:f,halfHeight:i,textureCapHeight:l,maxTextureSize:e.getParameter(e.MAX_TEXTURE_SIZE),scratch:h,atlasKey:"",atlasRows:2,wordHalfWidths:[],wordHalfWidth:1}}function at(t){if(typeof document>"u")return t;const e=document.createElement("span");e.style.cssText="position:absolute;visibility:hidden;pointer-events:none",e.style.fontFamily=t,e.textContent="Ag",document.body.appendChild(e);const n=getComputedStyle(e).fontFamily;return e.remove(),n||t}function $(t,e,n,r,a){const s=t.scratch.getContext("2d");if(!s)return 1;s.fillStyle="#000",s.fillRect(0,0,t.atlasWidth,t.halfHeight);let c=t.textureCapHeight*1.4;s.font=`${a} ${c}px ${r}`;const f=s.measureText("H").actualBoundingBoxAscent||c*.72;c*=t.textureCapHeight/f,s.font=`${a} ${c}px ${r}`;const i=t.atlasWidth*.92,l=s.measureText(e).width;l>i&&(c*=i/l,s.font=`${a} ${c}px ${r}`),s.fillStyle="#fff",s.textAlign="center",s.textBaseline="alphabetic",s.fillText(e,t.atlasWidth/2,t.halfHeight/2+t.textureCapHeight/2);const h=s.measureText(e).width/2,{gl:o}=t;return o.bindTexture(o.TEXTURE_2D,t.texture),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,!0),o.texSubImage2D(o.TEXTURE_2D,0,0,n*t.halfHeight,o.RGBA,o.UNSIGNED_BYTE,t.scratch),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,!1),h}function ut(t){return 2**Math.ceil(Math.log2(Math.max(t,2)))}function st({wordCount:t,rowHeight:e,maxTextureSize:n}){const r=ut(t);return e*r<=n?r:null}function se(t,e){const{gl:n}=t;n.bindTexture(n.TEXTURE_2D,t.texture),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,t.atlasWidth,t.halfHeight*e,0,n.RGBA,n.UNSIGNED_BYTE,null),t.atlasRows=e}function it(t,e,n,r,a,s){const c=st({wordCount:e.length,rowHeight:t.halfHeight,maxTextureSize:t.maxTextureSize});if(c!==null){const h=`phrase\0${a}\0${s}\0${e.join("\0")}`;return t.atlasKey!==h&&(se(t,c),t.wordHalfWidths=e.map((o,u)=>$(t,o,u,a,s)),t.gl.generateMipmap(t.gl.TEXTURE_2D),t.atlasKey=h),t.wordHalfWidth=Math.max(t.wordHalfWidths[n]??1,t.wordHalfWidths[r]??1),{firstRow:n,secondRow:r}}const f=e[n]??e[0],i=e[r]??e[0],l=`pair\0${a}\0${s}\0${f}\0${i}`;if(t.atlasKey!==l){se(t,2);const h=$(t,f,0,a,s),o=$(t,i,1,a,s);t.gl.generateMipmap(t.gl.TEXTURE_2D),t.wordHalfWidths=[h,o],t.atlasKey=l}return t.wordHalfWidth=Math.max(...t.wordHalfWidths,1),{firstRow:0,secondRow:1}}function ct(t){const{gl:e}=t;e.deleteProgram(t.program),e.deleteBuffer(t.buffer),e.deleteTexture(t.texture)}function ft({state:t,computed:e,words:n,fontSize:r,fontFamily:a,fontWeight:s,verticalStretch:c,textColor:f,backgroundColor:i,frame:l,fps:h}){const{gl:o,uniforms:u}=t,{firstRow:A,secondRow:S}=it(t,n,e.before.wordIndex,e.after.wordIndex,a,s),m=Math.max(r,1)/t.textureCapHeight,d=Re=>m*(1+Re.p*(Math.max(c,1)-1)),T=d(e.before),p=d(e.here),v=d(e.after),w=p,U=2*(v+T-2*p),g=v-T,M=Ee*e.here.p*p,_=Math.sqrt(g*g+M*M),I=g<0?-_:_,H=m*(1+e.here.p*(Be-1)),B=oe[X(e.here.cycle,oe.length)]??1,P=e.here.psi*Math.sign(B||1),C=Math.abs(B),y=t.scratch.height>0?t.gl.drawingBufferHeight*Ce:1,x=y*(1-Ie*(1+Math.cos(P))*.5),E=0,Q=y*be*C*Math.sin(P),q=ae(P,Le,Oe),z=ae(P,Fe,De),V=Ge*e.here.p,Z=y/x,de=o.drawingBufferWidth/2+y*E/x,me=o.drawingBufferHeight*(.5+V)+y*Q/x,pe=t.wordHalfWidth*H*Z,xe=t.textureCapHeight*p*Z;o.viewport(0,0,o.drawingBufferWidth,o.drawingBufferHeight),o.useProgram(t.program),o.bindBuffer(o.ARRAY_BUFFER,t.buffer),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,t.texture),o.uniform1i(u.uText,0),o.uniform2f(u.uRes,o.drawingBufferWidth,o.drawingBufferHeight),o.uniform2f(u.uHalfPx,t.atlasWidth,t.halfHeight),o.uniform1f(u.uAtlasRows,t.atlasRows),o.uniform1f(u.uSx,H),o.uniform3f(u.uSyQ,w,I,U),o.uniform1f(u.uCenterY,.5+V),o.uniform1f(u.uSwapU,e.swapU),o.uniform1f(u.uHalfA,A),o.uniform1f(u.uHalfB,S),o.uniform3f(u.uK,e.shutterRatios[0],e.shutterRatios[1],e.shutterRatios[2]),o.uniform2f(u.uSwapScl,1+te*e.swapAmount,1-te*e.swapAmount),o.uniform1f(u.uShape,_e),o.uniform1f(u.uRoll,Pe),o.uniform1f(u.uLag,ye),o.uniform1f(u.uThin,ie*e.here.p),o.uniform1f(u.uBloom,ce*e.here.p),o.uniform1f(u.uGain,(1+Ue*e.here.p)*(1+qe*e.swapAmount)),o.uniform1f(u.uExp,He),o.uniform1f(u.uFocal,y),o.uniform3f(u.uPos,E,Q,x),o.uniform4f(u.uRot,Math.sin(q),Math.cos(q),Math.sin(z),Math.cos(z)),o.uniform1f(u.uCrt,fe*e.here.p),o.uniform1f(u.uTime,l/Math.max(h,1)),o.uniform4f(u.uGlow,de,me,Math.max(pe*J,o.drawingBufferWidth*ee),Math.min(Math.max(xe*J,o.drawingBufferHeight*ee),o.drawingBufferHeight*Qe)),o.uniform1f(u.uGlowAmp,le*e.here.p),o.uniform3f(u.uColor,f[0],f[1],f[2]),o.uniform3f(u.uBg,i[0],i[1],i[2]),o.clearColor(i[0],i[1],i[2],1),o.clear(o.COLOR_BUFFER_BIT),o.drawArrays(o.TRIANGLES,0,3)}function mt({phrase:t=F,fontSize:e=68,fontFamily:n="Arial, Helvetica, sans-serif",fontWeight:r=400,color:a="#ffffff",backgroundColor:s="#000000",verticalStretch:c=7,chromaticSpread:f=1,restDuration:i=D,peakHoldDuration:l=G,speed:h=1,className:o}){const u=Te(),{fps:A,width:S,height:m}=Se(),d=R.useRef(null),T=R.useRef(null),[p,v]=R.useState(!1),[w,U]=R.useState(!1),[g]=R.useState(()=>we("rush-type: first frame")),M=R.useRef(!1),_=R.useMemo(()=>K(t),[t]),I=R.useMemo(()=>at(n),[n]),H=R.useMemo(()=>re(a,[1,1,1]),[a]),B=R.useMemo(()=>re(s,[0,0,0]),[s]),P=u*Math.max(h,0),C=he({frame:P,fps:A,wordCount:_.length,restDuration:i,peakHoldDuration:l,chromaticSpread:f});R.useEffect(()=>{let x=!1;v(!1);const E=()=>{x||v(!0)};return typeof document>"u"||!document.fonts?(E(),()=>{x=!0}):(document.fonts.load(`${Number(r)||400} ${Math.max(e,1)}px ${n}`).then(E,E),()=>{x=!0})},[n,e,r]),R.useLayoutEffect(()=>{const x=d.current;if(!(!x||T.current||w)){try{const E=rt(x);if(!E){U(!0);return}T.current=E}catch{U(!0)}return()=>{T.current&&ct(T.current),T.current=null}}},[w]),R.useLayoutEffect(()=>{const x=T.current;!x||!p||(ft({state:x,computed:C,words:_,fontSize:e,fontFamily:I,fontWeight:Number(r)||400,verticalStretch:c,textColor:H,backgroundColor:B,frame:P,fps:A}),M.current||(M.current=!0,k(g)))},[C,P,p,e,r,A,B,g,I,H,c,_]),R.useEffect(()=>{!w||M.current||(M.current=!0,k(g))},[g,w]);const y=_[C.here.wordIndex]??_[0];return N.jsxs("div",{className:o,role:"img","aria-label":`${t}: words stretching into vertical motion blur`,style:{position:"absolute",inset:0,overflow:"hidden",backgroundColor:s},children:[N.jsx("canvas",{ref:d,width:S,height:m,style:{display:w?"none":"block",width:"100%",height:"100%"}}),w?N.jsx("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:a,fontFamily:n,fontSize:e,fontWeight:r},children:y}):null]})}export{mt as RushType,j as getRushTypeCycleLength,Je as getRushTypeDuration,dt as getRushTypeFrameState,st as getRushTypePhraseAtlasRows,et as getRushTypeShutterRatios,K as normalizeRushTypePhrase,F as rushTypeDefaultPhrase,ht as rushTypeLength};
