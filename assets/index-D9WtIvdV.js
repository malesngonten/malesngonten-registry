import{a as T,j as m,A as E}from"./index-DfUQpdcJ.js";import{makeCanvasFilter as v,makeFilterShader as x}from"./index-dciIqUK0.js";const c={glyphSize:26,charset:" .:-=+*#%@",colored:!1,ink:"#9dff9d",intensity:1},d=.545,u=24,f=44,A='ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',h=`#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform sampler2D u_atlas;
uniform vec2 u_cell;
uniform float u_glyph_count;
uniform float u_colored;
uniform vec3 u_ink;
uniform float u_intensity;

in vec2 v_uv;
out vec4 outColor;

const int TAPS = 3;

vec4 cellAverage(vec2 center, vec2 cell) {
  vec4 sum = vec4(0.0);
  for (int y = 0; y < TAPS; y++) {
    for (int x = 0; x < TAPS; x++) {
      vec2 offset = (vec2(float(x), float(y)) + 0.5) / float(TAPS) - 0.5;
      sum += texture(u_scene, center + offset * cell);
    }
  }
  return sum / float(TAPS * TAPS);
}

void main() {
  vec2 cell = max(u_cell, vec2(0.001));
  vec2 origin = floor(v_uv / cell) * cell;
  vec4 sampled = cellAverage(origin + cell * 0.5, cell);

  float luma = dot(sampled.rgb, vec3(0.299, 0.587, 0.114));
  float index = min(floor(luma * u_glyph_count), u_glyph_count - 1.0);

  vec2 local = clamp((v_uv - origin) / cell, 0.008, 0.992);
  float mask =
    texture(u_atlas, vec2((index + local.x) / u_glyph_count, local.y)).r;

  vec3 glyph = mix(u_ink, sampled.rgb, u_colored) * mask;
  vec4 source = texture(u_scene, v_uv);
  float amount = clamp(u_intensity, 0.0, 1.0);

  outColor = vec4(
    mix(source.rgb, glyph, amount),
    mix(source.a, max(mask, sampled.a), amount)
  );
}`,_=new WeakMap;function p(e){const t=new OffscreenCanvas(u*e.length,f),o=t.getContext("2d");if(!o)throw new Error("ascii-render: failed to acquire a 2D context");o.fillStyle="#000000",o.fillRect(0,0,t.width,t.height),o.fillStyle="#ffffff",o.font=`${Math.round(f*.74)}px ${A}`,o.textAlign="center",o.textBaseline="middle";for(let n=0;n<e.length;n++)o.fillText(e[n],n*u+u/2,f/2);return t}function R(e,t){e.activeTexture(e.TEXTURE1);let o=_.get(e);if(o)e.bindTexture(e.TEXTURE_2D,o.texture);else{const n=e.createTexture();if(!n)throw new Error("ascii-render: failed to create the glyph atlas");e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),o={charset:"",texture:n},_.set(e,o)}o.charset!==t&&(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,p(t)),o.charset=t)}function y(e){const t=e.replace("#",""),o=t.length===3?t.split("").map(a=>a+a).join(""):t,n=Number.parseInt(o,16);return Number.isNaN(n)?[1,1,1]:[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}const S=x(h,({gl:e,uniform:t,passedProps:o})=>{const{cellX:n,cellY:a,charset:r,colored:i,ink:l,intensity:s}=o;R(e,r),e.uniform1i(t("u_atlas"),1),e.uniform1f(t("u_glyph_count"),r.length),e.uniform2f(t("u_cell"),n,a),e.uniform1f(t("u_colored"),i?1:0),e.uniform3fv(t("u_ink"),y(l)),e.uniform1f(t("u_intensity"),s)}),D=({children:e})=>m.jsx(E,{children:e}),L=v({shader:S,fallback:D}),U=({glyphSize:e=c.glyphSize,charset:t=c.charset,colored:o=c.colored,ink:n=c.ink,intensity:a=c.intensity,children:r})=>{const{width:i,height:l}=T(),s=t.length>0?t:c.charset;return m.jsx(L,{cellX:e*d/i,cellY:e/l,charset:s,colored:o,ink:n,intensity:a,children:r})};export{U as AsciiRender};
