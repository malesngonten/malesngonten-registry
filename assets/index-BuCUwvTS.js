import{a as k,g as O,r as F,j as P,A as I}from"./index-DfUQpdcJ.js";const D=`#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`,U=`#version 300 es
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
`,H=`#version 300 es
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
`,y={field:U,postprocess:H},R=(c,E,e)=>Math.min(e,Math.max(E,c));function b(c){const E=R(c,0,1),e=m=>m*m*m*(m*(m*6-15)+10);return{presence:e(R(E/.34,0,1)),dissolve:e(R((E-.46)/.54,0,1)),showNext:E>=.4}}const M=`#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform sampler2D tScene;
uniform sampler2D tField;
uniform float uPresence;
uniform float uDissolve;
uniform float uSoftness;
uniform float uDetail;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / iResolution;
  vec2 p = gl_FragCoord.xy / iResolution.y;
  vec3 field = texture(tField, uv).rgb;
  float energy = max(field.r, max(field.g, field.b));
  // Static, continuous noise breaks up the field without making it travel.
  float grain = noise(p * 7.0) * 0.6 + noise(p * 19.0) * 0.28
    + noise(p * 43.0) * 0.12;
  float density = mix(smoothstep(0.025, 0.95, energy), grain, uDetail * 0.55);
  float appear = mix(1.0 + uSoftness, -uSoftness, uPresence);
  float disappear = mix(-uSoftness, 1.0 + uSoftness, uDissolve);
  float alpha = smoothstep(appear - uSoftness, appear + uSoftness, density)
    * smoothstep(disappear - uSoftness, disappear + uSoftness, density);
  vec3 material = texture(tScene, uv).rgb;
  fragColor = vec4(material * alpha, alpha);
}
`;function N(c,E){const e=c.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!e)throw new Error("Shader Seam requires WebGL2.");const m=[],x=[],p=[],h=[],_=()=>{for(const o of m)e.deleteProgram(o);for(const o of x)e.deleteTexture(o);for(const o of p)e.deleteFramebuffer(o);for(const o of h)e.deleteShader(o)},g=(o,s=!1,d=!1)=>{const r=e.createProgram();if(!r)throw new Error("Shader Seam: could not create a program.");m.push(r);for(const[t,a]of[[e.VERTEX_SHADER,D],[e.FRAGMENT_SHADER,o]]){const i=e.createShader(t);if(!i)throw new Error("Shader Seam: could not allocate a shader.");if(h.push(i),e.shaderSource(i,a),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw new Error(`Shader Seam: ${e.getShaderInfoLog(i)}`);e.attachShader(r,i)}if(e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw new Error(`Shader Seam: ${e.getProgramInfoLog(r)}`);const l=new Map,n=t=>(l.has(t)||l.set(t,e.getUniformLocation(r,t)),l.get(t)??null);for(let t=0;t<e.getProgramParameter(r,e.ACTIVE_UNIFORMS);t++){const a=e.getActiveUniform(r,t);if(a&&(a.type===e.SAMPLER_2D||a.type===e.SAMPLER_CUBE)&&!(s&&a.name==="tScene")&&!(d&&a.name==="tField"))throw new Error(`Shader Seam: ${a.name} needs an additional texture adapter.`)}return{begin:(t,a,i,T,S,f)=>{e.useProgram(r),e.viewport(0,0,t,a),e.uniform2f(n("iResolution"),t,a),e.uniform1f(n("iTime"),i),e.uniform1f(n("uLightMode"),0),e.uniform3f(n("uDarkBackground"),9/255,9/255,9/255),e.uniform3f(n("uLightBackground"),1,1,1),e.uniform1f(n("uPixelRatio"),1),e.uniform2f(n("uTilt"),0,0),e.uniform1i(n("tScene"),0),e.uniform1i(n("tField"),1),e.uniform1f(n("uPresence"),T.presence),e.uniform1f(n("uDissolve"),T.dissolve),e.uniform1f(n("uSoftness"),S),e.uniform1f(n("uDetail"),f)}}},v=()=>{const o=e.createTexture(),s=e.createFramebuffer();if(o&&x.push(o),s&&p.push(s),!o||!s)throw new Error("Shader Seam: could not create render target.");e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let d="";return{texture:o,bind:(r,l)=>{if(e.bindFramebuffer(e.FRAMEBUFFER,s),d!==`${r}:${l}`){if(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,o),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,r,l,0,e.RGBA,e.UNSIGNED_BYTE,null),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Shader Seam: incomplete render target.");d=`${r}:${l}`}}}};try{const o=g(E.field),s=E.postprocess?g(E.postprocess,!0):null,d=g(M,!0,!0),r=v(),l=v(),n=(t,a)=>{e.activeTexture(a===0?e.TEXTURE0:e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,t)};return{dispose:_,draw:(t,a,i,T,S,f)=>{if(e.isContextLost())throw new Error("Shader Seam: WebGL context was lost.");c.width!==t&&(c.width=t),c.height!==a&&(c.height=a),r.bind(t,a),o.begin(t,a,i,T,S,f),e.drawArrays(e.TRIANGLES,0,3),s&&(l.bind(t,a),s.begin(t,a,i,T,S,f),n(r.texture,0),e.drawArrays(e.TRIANGLES,0,3)),e.bindFramebuffer(e.FRAMEBUFFER,null),d.begin(t,a,i,T,S,f),n(s?l.texture:r.texture,0),n(r.texture,1),e.drawArrays(e.TRIANGLES,0,3)}}}catch(o){throw _(),o}}function w({children:c,presentationProgress:E,presentationDirection:e,presentationDurationInFrames:m,passedProps:x}){const{width:p,height:h,fps:_}=k(),{delayRender:g,continueRender:v,cancelRender:o}=O(),s=F.useRef(null),d=F.useRef(null),r=e==="entering",{softness:l=.18,detail:n=.65,speed:t=0,timeOffset:a=0,shader:i=y}=x,{field:T,postprocess:S}=i,f=R(E,0,1),A=r&&f>0&&f<1,C=b(f);return F.useLayoutEffect(()=>{if(!A||!s.current)return;const L=g("Initialize Shader Seam");try{d.current=N(s.current,{field:T,postprocess:S}),v(L)}catch(u){o(u instanceof Error?u:new Error(String(u)))}return()=>{var u;(u=d.current)==null||u.dispose(),d.current=null}},[A,T,S,g,v,o]),F.useLayoutEffect(()=>{var L;if(!(!A||!s.current))try{const u=a+f*m/_*t;(L=d.current)==null||L.draw(p,h,u,b(f),R(l,.02,.4),R(n,0,1))}catch(u){o(u instanceof Error?u:new Error(String(u)))}},[f,A,p,h,_,l,n,t,a,m,r,T,S,o]),P.jsxs(I,{style:{overflow:"hidden"},children:[P.jsx(I,{style:{visibility:r!==C.showNext?"hidden":"visible"},children:c}),P.jsx("canvas",{ref:s,"aria-hidden":"true",tabIndex:-1,style:{position:"absolute",inset:0,width:"100%",height:"100%",visibility:r&&A?"visible":"hidden",pointerEvents:"none"}})]})}function B(c={}){return{component:w,props:c}}export{b as getShaderSeamPhase,y as remocnOpenShader,B as shaderSeam};
