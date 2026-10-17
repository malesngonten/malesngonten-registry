import{u as q,a as T,r as i,d as B,c as C,j as A}from"./index-DfUQpdcJ.js";const D=`
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`,j=`
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_scale;
uniform float u_warp;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_accent;
uniform float u_accentAmt;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// A thin ridge line at every integer of x — the profile of one thread.
float thread(float x, float sharp) {
  float f = fract(x);
  float d = min(f, 1.0 - f);
  return smoothstep(sharp, 0.0, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;

  // Domain warp — bend the weave so it reads hand-made, not a CSS grid. The
  // warp field drifts very slowly; the grid lattice itself stays put.
  vec2 q = uv + u_warp * vec2(
    fbm(uv * 3.0 + vec2(u_time * 0.03, 0.0)) - 0.5,
    fbm(uv * 3.0 + vec2(7.3, -u_time * 0.02)) - 0.5
  );

  float qx = q.x * u_scale * aspect;
  float qy = q.y * u_scale;

  float tw = thread(qx, 0.09); // warp (vertical threads)
  float tf = thread(qy, 0.09); // weft (horizontal threads)

  // Interlace: per cell, one direction sits over the other.
  float over = mod(floor(qx) + floor(qy), 2.0);
  float warpB = tw * (over < 0.5 ? 1.0 : 0.5);
  float weftB = tf * (over < 0.5 ? 0.5 : 1.0);
  float weave = max(warpB, weftB);

  // Sheen — light travelling across a still cloth (this is the only motion).
  float sheen = fbm(q * 1.7 + vec2(u_time * 0.05, u_time * 0.028));
  weave *= 0.3 + 0.95 * sheen;

  // Fabric ground: near-black, faintly breathing between the shadow stops.
  vec3 base = mix(u_c0, u_c1, smoothstep(0.15, 0.8, sheen));
  base = mix(base, u_c2, smoothstep(0.62, 1.0, sheen) * 0.5);

  // Threads sit a touch above the ground.
  vec3 col = mix(base, u_c3, clamp(weave, 0.0, 1.0) * 0.55);

  // The accent runs through the threads — a violet thread across the cloth.
  float amt = clamp(u_accentAmt, 0.0, 1.0);
  col = mix(col, u_accent, amt * (0.08 + 0.34 * weave));
  col += u_accent * amt * 0.015;

  // A whisper of living grain, time-derived so it stays deterministic.
  col += (hash(gl_FragCoord.xy + floor(u_time * 9.0)) - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`,u=a=>{const o=a.replace("#",""),f=o.length===3?o.split("").map(c=>c+c).join(""):o,n=parseInt(f,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};function P({colors:a=["#050506","#0a0a0c","#111015","#1b1a22"],accent:o="#6733FF",accentAmount:f=0,scale:n=22,warp:c=.03,speed:_=1,className:R}){const d=q(),{fps:p,width:y,height:F}=T(),m=i.useRef(null),v=i.useRef(null),[g]=i.useState(()=>B("shader-weave")),w=i.useRef(!1);return i.useEffect(()=>{const s=m.current;if(!s||v.current)return;const e=s.getContext("webgl",{antialias:!1,preserveDrawingBuffer:!0});if(!e)return;const r=(l,S)=>{const h=e.createShader(l);if(!h)throw new Error("Failed to create WebGL shader");return e.shaderSource(h,S),e.compileShader(h),h},t=e.createProgram();if(!t)return;e.attachShader(t,r(e.VERTEX_SHADER,D)),e.attachShader(t,r(e.FRAGMENT_SHADER,j)),e.linkProgram(t),e.useProgram(t);const E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const x=e.getAttribLocation(t,"a_pos");e.enableVertexAttribArray(x),e.vertexAttribPointer(x,2,e.FLOAT,!1,0,0);const b={};for(const l of["u_res","u_time","u_scale","u_warp","u_c0","u_c1","u_c2","u_c3","u_accent","u_accentAmt"])b[l]=e.getUniformLocation(t,l);v.current={gl:e,uniforms:b}},[]),i.useEffect(()=>{const s=v.current,e=m.current;if(!s||!e)return;const{gl:r,uniforms:t}=s;r.viewport(0,0,e.width,e.height),r.uniform2f(t.u_res,e.width,e.height),r.uniform1f(t.u_time,d/p*_),r.uniform1f(t.u_scale,n),r.uniform1f(t.u_warp,c),r.uniform3fv(t.u_c0,u(a[0])),r.uniform3fv(t.u_c1,u(a[1])),r.uniform3fv(t.u_c2,u(a[2])),r.uniform3fv(t.u_c3,u(a[3])),r.uniform3fv(t.u_accent,u(o)),r.uniform1f(t.u_accentAmt,f),r.drawArrays(r.TRIANGLES,0,3),w.current||(w.current=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>C(g))))},[d,p,_,n,c,a,o,f,g]),A.jsx("div",{className:R,style:{position:"absolute",inset:0},children:A.jsx("canvas",{ref:m,width:y,height:F,style:{width:"100%",height:"100%",display:"block"}})})}export{P as ShaderWeave};
