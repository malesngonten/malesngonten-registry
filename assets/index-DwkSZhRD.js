import{a as h,j as u,A as f}from"./index-DfUQpdcJ.js";import{makeCanvasFilter as g,makeFilterShader as x}from"./index-dciIqUK0.js";const l=8,m={cellSize:24},_=`#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform vec4 u_regions[${l}];
uniform int u_region_count;
uniform vec2 u_cell;

in vec2 v_uv;
out vec4 outColor;

const int TAPS = 3;

vec4 cellAverage(vec2 center, vec2 cell) {
  vec4 sum = vec4(0.0);
  for (int y = 0; y < TAPS; y++) {
    for (int x = 0; x < TAPS; x++) {
      vec2 offset =
        (vec2(float(x), float(y)) + 0.5) / float(TAPS) - 0.5;
      sum += texture(u_scene, center + offset * cell);
    }
  }
  return sum / float(TAPS * TAPS);
}

void main() {
  vec4 result = texture(u_scene, v_uv);
  vec2 cell = max(u_cell, vec2(0.0005));

  for (int i = 0; i < ${l}; i++) {
    if (i >= u_region_count) {
      continue;
    }
    vec4 region = u_regions[i];
    vec2 lo = region.xy;
    vec2 hi = region.xy + region.zw;
    vec2 hit = step(lo, v_uv) * step(v_uv, hi);
    if (hit.x * hit.y < 0.5) {
      continue;
    }
    vec2 center = lo + (floor((v_uv - lo) / cell) + 0.5) * cell;
    result = vec4(cellAverage(center, cell).rgb, 1.0);
  }

  outColor = result;
}`,d=x(_,({gl:o,uniform:i,passedProps:e})=>{const{rects:c,cellX:s,cellY:a}=e,t=new Float32Array(l*4),v=Math.min(c.length,l);for(let n=0;n<v;n++){const r=c[n];t[n*4]=r.x,t[n*4+1]=r.y,t[n*4+2]=r.width,t[n*4+3]=r.height}o.uniform4fv(i("u_regions[0]"),t),o.uniform1i(i("u_region_count"),v),o.uniform2f(i("u_cell"),s,a)}),p=({children:o,rects:i})=>u.jsxs(f,{children:[o,i.map(e=>u.jsx("div",{style:{position:"absolute",left:`${e.x*100}%`,top:`${e.y*100}%`,width:`${e.width*100}%`,height:`${e.height*100}%`,background:"#14161c"}},`${e.x}-${e.y}-${e.width}-${e.height}`))]}),y=g({shader:d,fallback:p}),$=({regions:o,cellSize:i=m.cellSize,children:e})=>{const{width:c,height:s}=h();if(o.length>l)throw new Error(`pixelate-region: at most ${l} regions can be covered at once, received ${o.length}. Dropping any of them would leave what it covered visible, so nest a second PixelateRegion instead.`);const a=o.map(t=>({x:t.x/c,y:t.y/s,width:t.width/c,height:t.height/s}));return u.jsx(y,{rects:a,cellX:i/c,cellY:i/s,children:e})};export{$ as PixelateRegion};
