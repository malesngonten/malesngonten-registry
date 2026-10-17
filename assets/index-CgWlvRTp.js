import{j as f,A as c}from"./index-DfUQpdcJ.js";import{makeCanvasPresentation as x,makeSceneShader as h}from"./index-dciIqUK0.js";const r={tileSize:90,waveWidth:.16,lift:2,gap:.12,tint:"#8fb4ff",direction:"ripple"},p={ripple:[0,0],left:[1,0],right:[-1,0],up:[0,-1],down:[0,1]};function b(e){const t=e.replace("#",""),i=t.length===3?t.split("").map(a=>a+a).join(""):t,o=Number.parseInt(i,16);return Number.isNaN(o)?[.56,.71,1]:[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255]}const w=`#version 300 es
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform float u_aspect;
uniform vec2 u_grid;
uniform float u_wave;
uniform float u_lift;
uniform float u_gap;
uniform vec3 u_tint;
uniform vec2 u_dir;
uniform float u_radial;

in vec2 v_uv;
out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float waveCoord(vec2 p) {
  vec2 off = (p - 0.5) * vec2(u_aspect, 1.0);
  float ring = length(off) / (0.5 * sqrt(u_aspect * u_aspect + 1.0));
  float sweep = clamp(dot(p - 0.5, u_dir) + 0.5, 0.0, 1.0);
  return mix(sweep, ring, u_radial);
}

void main() {
  float front = u_progress * (1.0 + 6.0 * u_wave) - 3.0 * u_wave;

  float selfPass =
    smoothstep(-u_wave * 0.4, u_wave * 0.4, front - waveCoord(v_uv));
  vec4 base = mix(texture(u_from, v_uv), texture(u_to, v_uv), selfPass);

  float edge = 0.5 - u_gap * 0.5;
  vec2 anchor = floor(v_uv * u_grid);

  vec4 face = vec4(0.0);
  float depth = -1.0;

  for (int oy = -1; oy <= 1; oy++) {
    for (int ox = -1; ox <= 1; ox++) {
      vec2 cell = anchor + vec2(float(ox), float(oy));
      vec2 centre = (cell + 0.5) / u_grid;

      float stagger = (hash(cell) - 0.5) * u_wave * 0.4;
      float w = front - waveCoord(centre) + stagger;
      float band = w / u_wave;
      float pulse = exp(-band * band);
      if (pulse <= depth) {
        continue;
      }

      float rise = pulse * u_lift;
      vec2 lean = centre - 0.5;
      lean = lean / max(length(lean), 0.0001) * rise * 0.15;
      float grow = 1.0 + rise * 0.5;

      vec2 q = (v_uv - centre) * u_grid;
      vec2 top = (q - lean) / grow;
      float onTop = max(abs(top.x), abs(top.y));
      float onFoot = max(abs(q.x), abs(q.y));
      bool lit = onTop <= edge;
      if (!lit && onFoot > edge) {
        continue;
      }
      depth = pulse;

      float pass = smoothstep(-u_wave * 0.4, u_wave * 0.4, w);
      vec2 local = lit ? top : clamp(top, -edge, edge);
      vec2 src = centre + local / u_grid;
      vec4 col = mix(texture(u_from, src), texture(u_to, src), pass);

      if (lit) {
        col.rgb = mix(col.rgb, u_tint, pulse * 0.12);
        col.rgb *= 1.0 + pulse * 0.06;
      } else {
        col.rgb = mix(col.rgb, u_tint, pulse * 0.06);
        col.rgb *= 1.0 - pulse * 0.24;
      }

      face = col;
    }
  }

  outColor = face + base * (1.0 - face.a);
}`,M=h(w,({gl:e,uniform:t,width:i,height:o,passedProps:a})=>{const{tileSize:v=r.tileSize,waveWidth:_=r.waveWidth,lift:m=r.lift,gap:d=r.gap,tint:g=r.tint,direction:l=r.direction}=a,u=Math.max(v,8),s=p[l]??p[r.direction],n=b(g);e.uniform2f(t("u_grid"),Math.max(Math.round(i/u),2),Math.max(Math.round(o/u),2)),e.uniform1f(t("u_wave"),Math.max(_,.02)),e.uniform1f(t("u_lift"),Math.max(m,0)*.35),e.uniform1f(t("u_gap"),Math.min(Math.max(d,0),.45)),e.uniform3f(t("u_tint"),n[0],n[1],n[2]),e.uniform2f(t("u_dir"),s[0],s[1]),e.uniform1f(t("u_radial"),l==="ripple"?1:0)}),y=({children:e,presentationProgress:t,presentationDirection:i})=>{const o=t;if(i==="exiting")return f.jsx(c,{children:e});const a=Math.min(1,Math.max(0,(o-.2)/.6));return f.jsx(c,{style:{opacity:a,scale:`${1.04-a*.04}`},children:e})},S=x({shader:M,fallback:y});function F(e={}){return S(e)}export{F as gridWave};
