import{u as I,a as b,g as k,r as p,j as C}from"./index-DfUQpdcJ.js";const F=(r,e=0,c=1)=>Math.min(c,Math.max(e,r));function w(r,e,c){const m=Math.max(12,Math.round(c)),d=Math.max(1,e),T=Math.max(0,r),i=Math.min(d-1,Math.floor(T/m)),l=T-i*m,h=F((l/m+.16)/.76),s=i===d-1?0:F((l/m-.65)/.35);return{index:i,enter:h,exit:s*s*(3-2*s),scale:1+.12*(1-h)**3}}const P=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,U=`#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uLightMode;
uniform vec3 uDarkBackground;
uniform vec3 uLightBackground;
out vec4 fragColor;

const float HUE = 0.663466752;
const float HUE_SPREAD = 0.314346701;
const float HUE_TRAVEL = 1.65112376;
const float CHROMA = 0.160295546;
const float LIGHTNESS = 0.537409723;
const float COLOUR_CYCLE = 0.124862425;
const float THETA = 2.12986207;
const float SHEAR = 0.968176901;
const float SHRINK = 0.955401778;
const float LAYERS = 72.0;
const float WARP_FREQ_X = 0.439311415;
const float WARP_FREQ_Y = 2.87923527;
const float WARP_AMP_X = 0.156202048;
const float WARP_AMP_Y = 0.0256033838;
const float ASPECT_X = 2.23183894;
const float ASPECT_Y = 0.15731883;
const float OFFSET_X = 0.375628948;
const float OFFSET_Y = -0.017801486;
const float TILT = 1.63293767;
const float ZOOM = 0.93135649;
const float CENTRE_X = -0.0956316143;
const float CENTRE_Y = -0.520057321;
const float GLOW_SIZE = 0.00201825937;
const float FALLOFF = 0.352821857;
const float VIGNETTE = 0.136085436;
const float FLOW_SPEED = 0.391012281;
const float FLOW_DIRECTION = 1.0;
const float BREATH_RATE = 0.382053256;
const float BREATH_AMOUNT = 0.0873704553;
const float PHASE = 56.3862724;
const float ECHO = 0.0;
const float ECHO_SHIFT = 0.178754866;
const float SOFTNESS = 0.00164903817;
const float LIGHT_SWING = 0.149726808;

const float TAU = 6.28318530718;

vec3 oklchToLinear(float L, float C, float h) {
  float a = C * cos(h), b = C * sin(h);
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  vec3 lms = vec3(l_, m_, s_);
  lms = lms * lms * lms;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863,
              -3.3077115913, 2.6097574011, -0.7034186147,
              0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

float blueNoise(vec2 p, float frame) {
  p += 5.588238 * mod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}

void main() {
  vec2 R = iResolution.xy;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;
  float t = iTime * FLOW_SPEED * FLOW_DIRECTION + PHASE;
  float breath = (-sin(iTime * BREATH_RATE * 1.5) + sin(iTime * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  vec2 u = (pos - vec2(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  float ct = cos(TILT), st = sin(TILT);
  u = mat2(ct, st, -st, ct) * u;

  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  float hue0 = HUE * TAU;
  float hue1 = hue0 + HUE_SPREAD * TAU;
  vec3 color = vec3(0.0);

  for (float i = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) break;
    u.x += -sin(u.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    u.y += -sin(u.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    u = fold * u * SHRINK;

    vec2 q = u - vec2(OFFSET_X + breath * 0.1, OFFSET_Y);
    vec2 s = vec2(q.x * ASPECT_X, q.y * ASPECT_Y);
    float glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
#ifndef SKIP_ECHO
    vec2 e = vec2((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
    glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
#endif
    glow *= 0.25 + breath * 0.4;

    float r = length(u);
    float k = sin(i * COLOUR_CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    vec3 tint = clamp(oklchToLinear(LIGHTNESS + LIGHT_SWING * k, CHROMA * (0.75 + 0.35 * k), mix(hue0, hue1, k)), 0.0, 1.0);
    color += glow * tint * exp2(-r * FALLOFF);
  }

  vec3 x = max(color, 0.0);
  color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  color = pow(clamp(color, 0.0, 1.0), vec3(0.85, 0.92, 0.98));

  float edge = smoothstep(0.5, 1.6, length(pos));
  color *= 1.0 - edge * VIGNETTE;

  vec3 dark = uDarkBackground + color * (1.0 - uDarkBackground);
  float strength = max(color.r, max(color.g, color.b));
  vec3 light = uLightBackground * (1.0 - strength) + color * 0.96;
  color = mix(dark, light, uLightMode);

  color += (blueNoise(gl_FragCoord.xy, floor(iTime * 24.0)) - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`,M=`#version 300 es
precision highp float;

uniform sampler2D tScene;
uniform vec2 iResolution;
uniform float iTime;
uniform float uLightMode;
uniform vec3 uDarkBackground;
uniform vec3 uLightBackground;
uniform float uPixelRatio;
out vec4 fragColor;

const float uStrength = 0.797335207;
const float uScale = 0.985214949;
const float uSeed = 0.435611069;

const float TAU = 6.28318530718;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

vec3 toInk(vec3 c) { return mix(c - uDarkBackground, uLightBackground - c, uLightMode); }
vec3 fromInk(vec3 ink) { return mix(uDarkBackground + ink, uLightBackground - ink, uLightMode); }
vec3 sceneInk(vec2 uv) { return toInk(texture(tScene, clamp(uv, 0.0, 1.0)).rgb); }

float blueNoise(vec2 p, float frame) {
  p += 5.588238 * mod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}

vec3 halftone(vec2 frag) {
  float cell = max(3.0, uScale * 3.6 * uPixelRatio);
  float angle = 0.26 + uSeed * 0.3;
  mat2 turn = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 rotated = turn * frag;
  vec2 grid = floor(rotated / cell);
  vec2 centre = (grid + 0.5) * cell;
  vec2 source = transpose(turn) * centre;
  vec3 soft = sceneInk(frag / iResolution);
  vec3 ink = sceneInk(source / iResolution);
  float level = clamp(dot(ink, LUMA), 0.0, 1.0);
  float radius = cell * sqrt(pow(level, 0.9) / 3.14159265);
  float dist = length(rotated - centre);
  float aa = 0.7 * uPixelRatio;
  float dot_ = 1.0 - smoothstep(radius - aa, radius + aa, dist);
  vec3 dots = ink * min(0.8 / max(level, 1e-3), 2.2) * dot_;
  float presence = smoothstep(0.03, 0.16, level) * (0.3 + 0.14 * uStrength);
  return mix(soft, dots, presence);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec3 ink = halftone(frag);
  vec3 color = fromInk(clamp(ink, 0.0, 1.0));
  color += (blueNoise(frag, floor(iTime * 24.0)) - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`,O=`#version 300 es
precision highp float;
uniform sampler2D uText;
uniform sampler2D uHero;
uniform vec2 uResolution;
uniform vec4 uBounds;
uniform float uEnter;
uniform float uExit;
uniform float uScale;
uniform float uTime;
uniform float uIntensity;
out vec4 fragColor;

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) / uScale + 0.5;
  vec2 q = (uv - uBounds.xy) / uBounds.zw;
  float flow = sin(q.x * 7.0 + q.y * 5.0 - uTime * 3.2) * 0.065
    + sin(q.x * 13.0 - q.y * 8.0 + uTime * 2.1) * 0.025;
  float rank = q.x * 0.64 + (1.0 - q.y) * 0.36 + flow;
  float d = rank - mix(-0.15, 1.65, uEnter);
  float edge = exp(-pow((d + 0.1) * 6.0, 2.0));
  // Refraction affects the glyph itself, concentrated inside the wet leading edge.
  vec3 field = texture(uHero, uv).rgb;
  vec2 warp = vec2(field.r - field.b, field.g - field.r);
  vec2 sampleUV = uv + warp * edge * uIntensity * 2.5 / uResolution;
  float glyph = texture(uText, sampleUV).a;
  float appear = 1.0 - smoothstep(-0.025, 0.09, d);
  float exitRank = q.x * 0.65 + (1.0 - q.y) * 0.5 + flow;
  float leave = smoothstep(-0.12, 0.06, exitRank - mix(-0.25, 1.45, uExit));

  vec3 liquid = texture(uHero, sampleUV).rgb;
  vec3 silver = vec3(0.96, 0.925, 1.0);
  float settled = 1.0 - smoothstep(-0.58, -0.16, d);
  vec3 color = mix(liquid, silver, settled);
  color = mix(silver, color, uIntensity);
  float alpha = glyph * appear * leave;
  fragColor = vec4(color * alpha, alpha);
}`;function B(r){const e=r.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1});if(!e)throw new Error("Shader Text Reveal requires WebGL2.");const c=[],m=[],d=[],T=[],i=()=>{for(const o of c)e.deleteShader(o);for(const o of m)e.deleteProgram(o);for(const o of d)e.deleteTexture(o);for(const o of T)e.deleteFramebuffer(o)},l=o=>{const t=e.createProgram();if(!t)throw new Error("Shader Text Reveal: GPU allocation failed.");m.push(t);for(const[E,R]of[[e.VERTEX_SHADER,P],[e.FRAGMENT_SHADER,o]]){const a=e.createShader(E);if(!a)throw new Error("Shader Text Reveal: shader allocation failed.");if(c.push(a),e.shaderSource(a,R),e.compileShader(a),!e.getShaderParameter(a,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(a)??"Shader compilation failed.");e.attachShader(t,a)}if(e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(t)??"Shader link failed.");const n=new Map,u=E=>(n.has(E)||n.set(E,e.getUniformLocation(t,E)),n.get(E)??null);return{uniform:u,begin:E=>{e.useProgram(t),e.viewport(0,0,r.width,r.height),e.uniform2f(u("iResolution"),r.width,r.height),e.uniform1f(u("iTime"),E),e.uniform1f(u("uLightMode"),0),e.uniform3f(u("uDarkBackground"),9/255,9/255,9/255),e.uniform3f(u("uLightBackground"),1,1,1),e.uniform1f(u("uPixelRatio"),1)}}},h=()=>{const o=e.createTexture();if(!o)throw new Error("Shader Text Reveal: texture allocation failed.");return d.push(o),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),o},s=()=>{const o=h(),t=e.createFramebuffer();if(!t)throw new Error("Shader Text Reveal: framebuffer allocation failed.");if(T.push(t),e.bindFramebuffer(e.FRAMEBUFFER,t),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,r.width,r.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Shader Text Reveal: incomplete framebuffer.");return{value:o,buffer:t}},g=(o,t)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o)};try{const o=l(U),t=l(M),n=l(O),u=h(),E=s(),R=s();e.bindFramebuffer(e.FRAMEBUFFER,null),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);let a=null;return{dispose:i,draw:(x,S,_,L)=>{if(e.isContextLost())throw new Error("Shader Text Reveal: WebGL context lost.");e.bindFramebuffer(e.FRAMEBUFFER,E.buffer),o.begin(_),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,R.buffer),t.begin(_),g(E.value,0),e.uniform1i(t.uniform("tScene"),0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),n.begin(_),g(u,0),a!==x.canvas&&(e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,x.canvas),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),a=x.canvas),g(R.value,1),e.uniform1i(n.uniform("uText"),0),e.uniform1i(n.uniform("uHero"),1),e.uniform2f(n.uniform("uResolution"),r.width,r.height),e.uniform4f(n.uniform("uBounds"),...x.bounds),e.uniform1f(n.uniform("uEnter"),S.enter),e.uniform1f(n.uniform("uExit"),S.exit),e.uniform1f(n.uniform("uScale"),S.scale),e.uniform1f(n.uniform("uTime"),_),e.uniform1f(n.uniform("uIntensity"),F(L)),e.drawArrays(e.TRIANGLES,0,3)}}}catch(o){throw i(),o}}function H(r,e,c,m,d,T){const i=document.createElement("canvas");i.width=e,i.height=c;const l=i.getContext("2d");if(!l)throw new Error("Shader Text Reveal: cannot rasterize text.");let h=Math.min(Math.max(1,m),c*.58);l.font=`${d} ${h}px ${T}`,h*=Math.min(1,e*.72/Math.max(1,l.measureText(r).width)),l.font=`${d} ${h}px ${T}`;const s=l.measureText(r),g=(e-s.width)/2,o=s.actualBoundingBoxAscent,t=s.actualBoundingBoxDescent,n=(c+o-t)/2;return l.fillStyle="white",l.fillText(r,g,n),{canvas:i,bounds:[g/e,(c-n-t)/c,Math.max(1,s.width)/e,Math.max(1,o+t)/c]}}function D({text:r="Your product",fontSize:e=400,fontFamily:c="Arial, sans-serif",fontWeight:m=500,wordDuration:d=30,intensity:T=1}){const i=I(),{width:l,height:h,fps:s}=b(),{delayRender:g,continueRender:o,cancelRender:t}=k(),n=p.useRef(null),u=p.useRef(null),E=p.useRef({frame:i,fps:s,wordDuration:d,intensity:T});return E.current={frame:i,fps:s,wordDuration:d,intensity:T},p.useLayoutEffect(()=>{const R=n.current;if(!R)return;let a=!1;const x=g("Load Shader Text Reveal font"),_=(r.includes(`
`)?r.split(`
`):r.split(/\s+/)).map(f=>f.trim()).filter(Boolean),L=()=>{const f=u.current;if(!f||f.words.length===0)return;const v=E.current,A=w(v.frame,f.words.length,v.wordDuration);f.renderer.draw(f.words[A.index],A,v.frame/v.fps,v.intensity)};return document.fonts.load(`${m} ${e}px ${c}`,r||" ").then(()=>{if(a)return;const f=_.map(A=>H(A,l,h,e,m,c)),v=B(R);u.current={renderer:v,words:f},L(),o(x)}).catch(f=>{a||t(f instanceof Error?f:new Error(String(f)))}),()=>{var f;a=!0,o(x),(f=u.current)==null||f.renderer.dispose(),u.current=null}},[r,l,h,e,m,c,g,o,t]),p.useLayoutEffect(()=>{const R=u.current;if(!(!R||R.words.length===0))try{const a=w(i,R.words.length,d);R.renderer.draw(R.words[a.index],a,i/s,T)}catch(a){t(a instanceof Error?a:new Error(String(a)))}},[i,s,d,T,t]),C.jsx("canvas",{ref:n,width:l,height:h,role:"img","aria-label":r,style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}})}export{D as ShaderTextReveal,w as getShaderTextState};
