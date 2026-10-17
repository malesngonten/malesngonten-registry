import{u as T,a as j,r as c,d as C,c as k,j as y}from"./index-DfUQpdcJ.js";const D=`
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`,P=`
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_layers;
uniform float u_amp;
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

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;

  // Deeper layers drift faster — parallax without per-band recursion.
  float drift = u_time * (0.012 + 0.05 * (1.0 - uv.y));
  float w = fbm(vec2(uv.x * 2.6 * aspect + drift, uv.y * 2.2 - u_time * 0.01));

  float yd = uv.y + (w - 0.5) * u_amp;
  float band = yd * u_layers;
  float idx = floor(band);
  float f = fract(band);

  // Per-band value jitter + a soft sediment shadow at each band's lower edge.
  float j = hash(vec2(idx, 7.0));
  float edge = smoothstep(0.0, 0.4, f) * (1.0 - 0.3 * smoothstep(0.8, 1.0, f));

  float depth = clamp(idx / u_layers, 0.0, 1.0);
  vec3 col = mix(u_c0, u_c1, smoothstep(0.0, 0.4, depth));
  col = mix(col, u_c2, smoothstep(0.35, 0.75, depth));
  col = mix(col, u_c3, smoothstep(0.7, 1.0, depth));
  col *= 0.84 + 0.16 * j;
  col *= 0.92 + 0.08 * edge;

  // The accent rises from the deep strata and thins toward the surface.
  float mask = (1.0 - uv.y);
  mask *= mask;
  col = mix(col, u_accent, clamp(u_accentAmt, 0.0, 1.0) * mask * 0.38);

  // A whisper of living grain, time-derived so it stays deterministic.
  col += (hash(gl_FragCoord.xy + floor(u_time * 9.0)) - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`,u=a=>{const o=a.replace("#",""),f=o.length===3?o.split("").map(i=>i+i).join(""):o,n=parseInt(f,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};function L({colors:a=["#050507","#0a0a0d","#111014","#17161b"],accent:o="#6733FF",accentAmount:f=0,layers:n=14,amplitude:i=.16,speed:_=1,className:b}){const v=T(),{fps:p,width:w,height:F}=j(),h=c.useRef(null),d=c.useRef(null),[g]=c.useState(()=>C("shader-strata")),x=c.useRef(!1);return c.useEffect(()=>{const s=h.current;if(!s||d.current)return;const e=s.getContext("webgl",{antialias:!1,preserveDrawingBuffer:!0});if(!e)return;const r=(m,S)=>{const l=e.createShader(m);if(!l)throw new Error("Failed to create WebGL shader");return e.shaderSource(l,S),e.compileShader(l),l},t=e.createProgram();if(!t)return;e.attachShader(t,r(e.VERTEX_SHADER,D)),e.attachShader(t,r(e.FRAGMENT_SHADER,P)),e.linkProgram(t),e.useProgram(t);const E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const A=e.getAttribLocation(t,"a_pos");e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0);const R={};for(const m of["u_res","u_time","u_layers","u_amp","u_c0","u_c1","u_c2","u_c3","u_accent","u_accentAmt"])R[m]=e.getUniformLocation(t,m);d.current={gl:e,uniforms:R}},[]),c.useEffect(()=>{const s=d.current,e=h.current;if(!s||!e)return;const{gl:r,uniforms:t}=s;r.viewport(0,0,e.width,e.height),r.uniform2f(t.u_res,e.width,e.height),r.uniform1f(t.u_time,v/p*_),r.uniform1f(t.u_layers,n),r.uniform1f(t.u_amp,i),r.uniform3fv(t.u_c0,u(a[0])),r.uniform3fv(t.u_c1,u(a[1])),r.uniform3fv(t.u_c2,u(a[2])),r.uniform3fv(t.u_c3,u(a[3])),r.uniform3fv(t.u_accent,u(o)),r.uniform1f(t.u_accentAmt,f),r.drawArrays(r.TRIANGLES,0,3),x.current||(x.current=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>k(g))))},[v,p,_,n,i,a,o,f,g]),y.jsx("div",{className:b,style:{position:"absolute",inset:0},children:y.jsx("canvas",{ref:h,width:w,height:F,style:{width:"100%",height:"100%",display:"block"}})})}export{L as ShaderStrata};
