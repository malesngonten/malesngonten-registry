import{u as B,i as h,E as G,j as a,A as Y}from"./index-DfUQpdcJ.js";import{GlassCodeBlock as M}from"./index-BtZShHQX.js";const b=1280,d=720,C=1,S=40,W=20,X=24,$=4,v=110,U=360,K=24,q=`import { AbsoluteFill } from "remotion";
import { Typewriter } from "@/components/remocn";

export function Intro() {
  return (
    <AbsoluteFill>
      <Typewriter text="Ship it" />
    </AbsoluteFill>
  );
}`;function Z({code:p=q,title:D="scene.tsx",width:u=880,height:m=420,fontSize:s=18,staggerFrames:E=10,zoom:t=2.6,speed:e=1,className:O}){const x=B(),f=p.split(`
`),c=f.length,R=(b-u)/2,k=(d-m)/2+C+S+W,H=i=>i.trim()===""?s*.8:s*1.55,o=[];let A=k;for(const i of f){const _=H(i);o.push(A+_/2),A+=_+$}const I=R+C+X,L=E/e,l=(c-1)*L,T=h(x,[0,l],[0,c-1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),n=Math.floor(T),g=Math.min(n+1,c-1),F=o[n]+(o[g]-o[n])*(T-n),y=v-t*I,N=U-t*F,r=h(x,[l,l+K/e],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:G.inOut(G.cubic)}),P=t+r*(1-t),j=(1-r)*y,w=(1-r)*N;return a.jsx(Y,{className:O,style:{overflow:"hidden"},children:a.jsx("div",{style:{position:"absolute",left:0,top:0,width:b,height:d,translate:`${j}px ${w}px`,scale:`${P}`,transformOrigin:"0 0"},children:a.jsx(M,{code:p,title:D,width:u,height:m,fontSize:s,staggerFrames:E,speed:e})})})}export{Z as GlassCodeWalk};
