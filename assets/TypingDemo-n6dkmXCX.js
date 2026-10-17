import{u as ne,a as ie,i as n,E as r,j as t,A as se,S as E,o as A,m as $}from"./index-DfUQpdcJ.js";import{InteractiveNebulaShader as le}from"./liquid-shader-qn1kZeXx.js";import{o as ce,b as O,n as z,_ as de,s as pe}from"./schemas-CWo-_D22.js";const ve=ce({codeText:pe().optional(),mode:de(["dark","light"]).optional(),whooshVolume:z().optional(),typingVolume:z().optional(),enableWhoosh:O().optional(),enableTypingAudio:O().optional()}),me="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",c=`import React from "react";
import { interpolate, useCurrentFrame, AbsoluteFill } from "remotion";

export const CinematicTerminal = ({ title = "Remotion Studio" }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 45], [0.9, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, transform: \`scale(\${scale})\` }}>
      <div className="terminal-header">
        <span>{title}</span>
      </div>
      <div className="terminal-body">
        <p>Rendering cinematic frames at 60fps...</p>
      </div>
    </AbsoluteFill>
  );
};`,ke=({codeText:d=c,mode:x="light",whooshVolume:B=.18,typingVolume:f=.5,enableWhoosh:Y=!0,enableTypingAudio:Z=!0})=>{const e=ne(),{width:H}=ie(),b=x==="light",y=H*.75,N=y*(9/16),v=n(e,[0,50],[0,1],{easing:r.out(r.poly(4)),extrapolateRight:"clamp",extrapolateLeft:"clamp"}),P=n(v,[0,1],[250,0]),W=n(v,[0,1],[.82,1]),_=1,k=n(e,[0,160],[0,1],{easing:r.out(r.cubic),extrapolateRight:"clamp",extrapolateLeft:"clamp"}),T=n(k,[0,1],[-25,0])+Math.sin(e*.015)*1.2,X=n(k,[0,1],[14,0])+Math.cos(e*.012)*.8,G=(o=>{if(o<10)return 0;let a=10,i=0;const p=m=>{const u=Math.sin(m++)*1e4;return u-Math.floor(u)};let l=42;for(let m=0;m<(d||c).length;m++){const u=(d||c)[m];let g=3;if(u===`
`?g=10:u===" "?g=6:g=3,a+=Math.floor(g+p(l++)*2),a<=o)i++;else break}return Math.min((d||c).length,i)})(e),C=(d||c).slice(0,G),S=d||c,j=[];let w=25,q=42;const V=o=>{const a=Math.sin(o++)*1e4;return a-Math.floor(a)};for(let o=0;o<S.length;o++){const a=S[o];let i="keyClick",p=f;a===`
`?(i="keyEnter",p=f*1.1):a===" "&&(i="keySpace",p=f*.9),j.push({frame:Math.round(w),sound:i,volume:p});let l=3;a===`
`?l=10:a===" "?l=6:l=3,w+=Math.floor(l+V(q++)*2)}const F=C.split(`
`),R=F.length-1,J=(F[R]||"").length,M=4*30,L=e>=45&&e<45+M,s=45+M+10,K=n(e,[s,s+30],[0,1],{easing:r.out(r.poly(4)),extrapolateRight:"clamp",extrapolateLeft:"clamp"}),Q=L?4.4:e<s?1:1+K*.2,h=30,U=n(e,[45,45+h],[8,0],{easing:r.out(r.poly(4)),extrapolateRight:"clamp",extrapolateLeft:"clamp"}),ee=n(e,[s,s+h],[8,0],{easing:r.out(r.poly(4)),extrapolateRight:"clamp",extrapolateLeft:"clamp"}),I=L?e<45+h?U:0:e>=s&&e<s+h?ee:0,D=48,te=40,oe=32,ae=D+J*12,re=D+te+R*oe;return t.jsx(le,{mode:x,disableCenterDimming:!1,children:t.jsxs(se,{style:{display:"flex",alignItems:"center",justifyContent:"center",fontFamily:me,perspective:1600,overflow:"hidden"},children:[Y&&t.jsx(E,{durationInFrames:40,children:t.jsx(A,{src:$("audio/fire-whoosh.wav"),startFrom:4,volume:B})}),Z&&j.map((o,a)=>{const i=o.sound==="keyEnter"?"audio/key-enter.wav":o.sound==="keySpace"?"audio/key-space.wav":"audio/key-click.wav";return t.jsx(E,{from:o.frame,durationInFrames:30,children:t.jsx(A,{src:$(i),volume:()=>o.volume})},a)}),t.jsxs("div",{style:{width:y,height:N,boxSizing:"border-box",borderRadius:24,padding:48,border:"2px solid transparent",backgroundImage:b?"linear-gradient(#0f172a, #0f172a), linear-gradient(90deg, #000000, #333333)":"linear-gradient(#0f172a, #0f172a), linear-gradient(90deg, #ec4899, #06b6d4)",backgroundOrigin:"border-box",backgroundClip:"padding-box, border-box",boxShadow:b?"0 25px 60px rgba(0, 0, 0, 0.4), 0 10px 25px rgba(0, 0, 0, 0.15)":"0 35px 70px rgba(0, 0, 0, 0.85), 0 0 50px rgba(236, 72, 153, 0.35), 0 0 100px rgba(6, 182, 212, 0.25)",transform:`rotateY(${T}deg) rotateX(${X}deg) translateY(${P}px) scale(${W*Q})`,filter:I>0?`blur(${I}px)`:void 0,transformStyle:"preserve-3d",transformOrigin:`${ae}px ${re}px`,opacity:_,display:"flex",flexDirection:"column",margin:"auto",transition:"transform-origin 0.05s linear"},children:[t.jsxs("div",{style:{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexShrink:0},children:[t.jsx("div",{style:{width:12,height:12,borderRadius:"50%",background:"#ef4444"}}),t.jsx("div",{style:{width:12,height:12,borderRadius:"50%",background:"#f59e0b"}}),t.jsx("div",{style:{width:12,height:12,borderRadius:"50%",background:"#10b981"}}),t.jsx("span",{style:{marginLeft:12,fontSize:14,color:"#64748b"},children:"TypingDemo (Human-like Erratic Typing)"})]}),t.jsxs("pre",{style:{margin:0,fontSize:20,lineHeight:"32px",color:"#e2e8f0",whiteSpace:"pre-wrap",wordBreak:"break-all",overflow:"hidden",flex:1},children:[C,Math.floor(e/15)%2===0&&t.jsx("span",{style:{color:"#818cf8"},children:"_"})]})]})]})})};export{ke as TypingDemo,ve as typingDemoSchema};
