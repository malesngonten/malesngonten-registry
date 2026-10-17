import{u as v,a as p,g as L,r as R,j as S}from"./index-DfUQpdcJ.js";const A=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,x=`#version 300 es
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
`,F=`#version 300 es
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
`,w=x.replaceAll("iTime","uMaterialTime").replace("uniform float uMaterialTime;",`uniform float iTime;
  const float uMaterialTime = 0.0;
  uniform float uDepth;
  uniform float uTwist;
  uniform float uSpirals;
  uniform float uCameraZoom;
  vec2 tunnelPosition(vec2 frag) {
    vec2 view = (frag - iResolution * 0.5) / iResolution.y / uCameraZoom;
    float radius = max(length(view), 0.005);
    float z = 0.55 * uDepth / radius + iTime * 1.2;
    // Rotate the material explicitly so circular motion reads at every depth.
    // The camera and its centered projection remain fixed.
    // Integer angular repeats add ribbons without a seam or extra field passes.
    float angle = (atan(view.y, view.x)
      + (z * 0.3 + iTime * 1.5) * uTwist) * uSpirals;
    // Constant phase travels to smaller radii: r(t) = r(0) * exp(-2.4 * t).
    // Log spacing keeps the inward folds readable across the whole tunnel.
    float inward = log(radius / (0.55 * uDepth)) * 5.0 + iTime * 12.0;
    float ring = 0.68 + 0.1 * sin(inward);
    return vec2(cos(angle), sin(angle)) * ring
      + vec2(sin(inward) * 0.08, cos(inward) * 0.06 - 0.25);
  }`).replace("vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;","vec2 pos = tunnelPosition(gl_FragCoord.xy);"),C=F.replace("uniform vec2 iResolution;",`uniform vec2 iResolution;
uniform float uGlow;`).replace("fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);",`vec2 center = (gl_FragCoord.xy - iResolution * 0.5) / iResolution.y;
  // Defocus the actual field at the vanishing point instead of cutting a dark
  // circle into it. A Gaussian blend has no visible boundary around the center.
  float centerWeight = exp(-dot(center, center) / (2.0 * 0.065 * 0.065));
  if (centerWeight > 0.001) {
    vec3 blurred = vec3(0.0);
    float totalWeight = 0.0;
    vec2 spread = vec2(iResolution.y * 0.025) / iResolution;
    // Prefilter each tap so tight spiral turns do not reappear as ghost images.
    float blurLod = max(0.0, log2(iResolution.y * 0.025));
    vec2 uv = gl_FragCoord.xy / iResolution;
    for (int y = -2; y <= 2; y++) {
      for (int x = -2; x <= 2; x++) {
        vec2 offset = vec2(float(x), float(y));
        float weight = exp(-dot(offset, offset) * 0.5);
        blurred += textureLod(tScene, clamp(uv + offset * spread, 0.0, 1.0), blurLod).rgb * weight;
        totalWeight += weight;
      }
    }
    color = mix(color, blurred / totalWeight, centerWeight);
  }
  fragColor = vec4(clamp(color * uGlow, 0.0, 1.0), 1.0);`),m=(t,e,E,d)=>Math.min(d,Math.max(E,Number.isFinite(t)?t:e));function P(t){const e=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)throw new Error("Shader Light Tunnel requires WebGL2.");const E=[],d=[];let f=null,g=null;const h=()=>{for(const l of E)e.deleteShader(l);for(const l of d)e.deleteProgram(l);e.deleteTexture(f),e.deleteFramebuffer(g)},T=l=>{const i=e.createProgram();if(!i)throw new Error("Shader Light Tunnel: GPU allocation failed.");d.push(i);for(const[n,c]of[[e.VERTEX_SHADER,A],[e.FRAGMENT_SHADER,l]]){const r=e.createShader(n);if(!r)throw new Error("Shader Light Tunnel: shader allocation failed.");if(E.push(r),e.shaderSource(r,c),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(r)??"Tunnel shader compilation failed.");e.attachShader(i,r)}if(e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(i)??"Tunnel shader link failed.");const s=new Map,o=n=>(s.has(n)||s.set(n,e.getUniformLocation(i,n)),s.get(n)??null);return{begin:(n,c,r,u,a,_=1)=>{e.useProgram(i),e.viewport(0,0,t.width,t.height),e.uniform2f(o("iResolution"),t.width,t.height),e.uniform1f(o("iTime"),n),e.uniform1f(o("uLightMode"),0),e.uniform3f(o("uDarkBackground"),9/255,9/255,9/255),e.uniform3f(o("uLightBackground"),1,1,1),e.uniform1f(o("uPixelRatio"),1),e.uniform1f(o("uTwist"),m(c,.7,0,2)),e.uniform1f(o("uSpirals"),Math.round(m(a,3,1,6))),e.uniform1f(o("uGlow"),m(r,1,0,3)),e.uniform1f(o("uDepth"),m(u,1,.5,2)),e.uniform1f(o("uCameraZoom"),m(_,1,1,32)),e.uniform1i(o("tScene"),0)}}};try{const l=T(w),i=T(C);if(f=e.createTexture(),g=e.createFramebuffer(),!f||!g)throw new Error("Shader Light Tunnel: render target allocation failed.");e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let s=0,o=0;return{dispose:h,draw:(n,c,r,u,a,_=1)=>{if(e.isContextLost())throw new Error("Shader Light Tunnel: WebGL context lost.");if(e.bindFramebuffer(e.FRAMEBUFFER,g),e.bindTexture(e.TEXTURE_2D,f),s!==t.width||o!==t.height){if(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t.width,t.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Shader Light Tunnel: incomplete framebuffer.");s=t.width,o=t.height}l.begin(n,c,r,u,a,_),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.generateMipmap(e.TEXTURE_2D),i.begin(n,c,r,u,a),e.drawArrays(e.TRIANGLES,0,3)}}}catch(l){throw h(),l}}function b({speed:t=1,twist:e=.7,spirals:E=3,glow:d=1,depth:f=1,timeOffset:g=0}){const h=v(),{width:T,height:l,fps:i}=p(),{delayRender:s,continueRender:o,cancelRender:n}=L(),c=R.useRef(null),r=R.useRef(null);return R.useLayoutEffect(()=>{if(!c.current)return;const u=s("Initialize Shader Light Tunnel");try{r.current=P(c.current),o(u)}catch(a){n(a instanceof Error?a:new Error(String(a)))}return()=>{var a;(a=r.current)==null||a.dispose(),r.current=null}},[s,o,n]),R.useLayoutEffect(()=>{var u;try{const a=m(g,0,-1e4,1e4)+h/i*m(t,1,0,5);(u=r.current)==null||u.draw(a,e,d,f,E)}catch(a){n(a instanceof Error?a:new Error(String(a)))}},[h,i,T,l,t,e,E,d,f,g,n]),S.jsx("canvas",{ref:c,width:T,height:l,"aria-hidden":"true",tabIndex:-1,style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}})}export{b as ShaderLightTunnel,P as createTunnelRenderer};
