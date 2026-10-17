import{u as T,a as C,r as o,d as L,c as j,j as y}from"./index-DfUQpdcJ.js";const B=`
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`,D=`
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_scale;
uniform float u_intensity;
uniform vec3 u_floor;
uniform vec3 u_light;
uniform vec3 u_accent;
uniform float u_accentAmt;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * u_scale;

  // Iterative trigonometric warp: each pass bends the sample point by the
  // previous pass, and the reciprocal distance to the warped axes
  // accumulates into the caustic web.
  float t = u_time * 0.35;
  vec2 i = p;
  float c = 0.0;
  for (int n = 0; n < 4; n++) {
    float phase = t * (1.0 - 3.2 / float(n + 2));
    i = p + vec2(
      cos(phase - i.x) + sin(phase + i.y),
      sin(phase - i.y) + cos(phase + i.x)
    );
    c += 1.0 / length(vec2(
      p.x / (sin(i.x + phase) * 90.0),
      p.y / (cos(i.y + phase) * 90.0)
    ));
  }
  c /= 4.0;
  c = 1.24 - pow(abs(c), 1.35);
  // |c| collapses to zero along thin branching veins — that zero-crossing
  // set IS the caustic web. Light the veins with an exponential falloff
  // (sharp core + a soft halo) and leave everything else near-black.
  float web = exp(-abs(c) * 0.5) + 0.22 * exp(-abs(c) * 0.12);
  web = web / (1.0 + 0.6 * web);

  // The light lands on the base: filaments read stronger low in the frame.
  float ground = mix(1.25, 0.55, uv.y);
  web *= ground * u_intensity;

  // Vignette keeps the corners quiet so type always wins.
  vec2 v = uv - 0.5;
  float vig = 1.0 - dot(v, v) * 1.1;
  web *= clamp(vig, 0.0, 1.0);

  vec3 filament = mix(u_light, u_accent, clamp(u_accentAmt, 0.0, 1.0));
  vec3 col = u_floor + filament * web;

  // A whisper of living grain, time-derived so it stays deterministic.
  col += (hash(gl_FragCoord.xy + floor(u_time * 9.0)) - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`,p=i=>{const a=i.replace("#",""),u=a.length===3?a.split("").map(s=>s+s).join(""):a,n=parseInt(u,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};function P({colors:i=["#0a0a0a","#2e2e33"],accent:a="#7F57FF",accentAmount:u=0,scale:n=5.2,intensity:s=1,speed:v=1,className:A}){const _=T(),{fps:g,width:R,height:F}=C(),h=o.useRef(null),m=o.useRef(null),[d]=o.useState(()=>L("shader-caustics")),b=o.useRef(!1);return o.useEffect(()=>{const c=h.current;if(!c||m.current)return;const e=c.getContext("webgl",{antialias:!1,preserveDrawingBuffer:!0});if(!e)return;const r=(f,S)=>{const l=e.createShader(f);if(!l)throw new Error("Failed to create WebGL shader");return e.shaderSource(l,S),e.compileShader(l),l},t=e.createProgram();if(!t)return;e.attachShader(t,r(e.VERTEX_SHADER,B)),e.attachShader(t,r(e.FRAGMENT_SHADER,D)),e.linkProgram(t),e.useProgram(t);const E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const w=e.getAttribLocation(t,"a_pos");e.enableVertexAttribArray(w),e.vertexAttribPointer(w,2,e.FLOAT,!1,0,0);const x={};for(const f of["u_res","u_time","u_scale","u_intensity","u_floor","u_light","u_accent","u_accentAmt"])x[f]=e.getUniformLocation(t,f);m.current={gl:e,uniforms:x}},[]),o.useEffect(()=>{const c=m.current,e=h.current;if(!c||!e)return;const{gl:r,uniforms:t}=c;r.viewport(0,0,e.width,e.height),r.uniform2f(t.u_res,e.width,e.height),r.uniform1f(t.u_time,_/g*v),r.uniform1f(t.u_scale,n),r.uniform1f(t.u_intensity,s),r.uniform3fv(t.u_floor,p(i[0])),r.uniform3fv(t.u_light,p(i[1])),r.uniform3fv(t.u_accent,p(a)),r.uniform1f(t.u_accentAmt,u),r.drawArrays(r.TRIANGLES,0,3),b.current||(b.current=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>j(d))))},[_,g,v,n,s,i,a,u,d]),y.jsx("div",{className:A,style:{position:"absolute",inset:0},children:y.jsx("canvas",{ref:h,width:R,height:F,style:{width:"100%",height:"100%",display:"block"}})})}export{P as ShaderCaustics};
