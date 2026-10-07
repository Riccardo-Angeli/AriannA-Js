/** Pure gradient data helpers; no DOM or example fixtures. */
import {fromRgb,toRgb,type ColorSpace} from '../../../additionals/graphics/Colors.ts';
export namespace GradientEditor {
 export interface RGBA {r:number;g:number;b:number;a:number;}
 export interface GradientStop {t:number;color:RGBA;midpoint?:number;}
 export interface GradientEditorOptions {stops?:GradientStop[];theme?:'dark'|'light';}
 export const clamp01=(v:number):number=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 const channel=(v:number)=>Math.max(0,Math.min(255,Number.isFinite(v)?v:0));
 export const DEFAULT_STOPS=():GradientStop[]=>[{t:0,color:{r:228,g:12,b:136,a:1}},{t:1,color:{r:85,g:75,b:220,a:1}}];
 export const sortStops=(stops:GradientStop[]):GradientStop[]=>stops.map(s=>({...s,t:clamp01(s.t),midpoint:s.midpoint==null?undefined:Math.max(.01,Math.min(.99,s.midpoint)),color:{r:channel(s.color.r),g:channel(s.color.g),b:channel(s.color.b),a:clamp01(s.color.a)}})).sort((a,b)=>a.t-b.t);
 export const colorFieldHex=(c:RGBA):string=>`#${[c.r,c.g,c.b].map(v=>Math.round(channel(v)).toString(16).padStart(2,'0')).join('').toUpperCase()}`;
 export function parseColorString(value:string):RGBA{
  const s=String(value||'').trim(),hex=s.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if(hex){let h=hex[1];if(h.length<=4)h=h.split('').map(v=>v+v).join('');return{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length===8?parseInt(h.slice(6,8),16)/255:1};}
  const m=s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  return m?{r:channel(+m[1]),g:channel(+m[2]),b:channel(+m[3]),a:m[4]==null?1:clamp01(+m[4])}:{r:228,g:12,b:136,a:1};
 }
 export function stopsToCss(stops:GradientStop[]):string{
  const s=sortStops(stops),text:string[]=[];s.forEach((p,i)=>{text.push(`rgba(${Math.round(p.color.r)},${Math.round(p.color.g)},${Math.round(p.color.b)},${p.color.a}) ${Math.round(p.t*10000)/100}%`);if(p.midpoint!=null&&i<s.length-1)text.push(`${Math.round((p.t+(s[i+1].t-p.t)*p.midpoint)*10000)/100}%`);});return text.join(', ');
 }
 /** Matches the selected CSS interpolation space, including shorter hue and alpha. */
 export function sampleAt(stops:GradientStop[],t:number,interpolation:'srgb'|'oklab'|'oklch'|'hsl'='srgb'):RGBA{
  const s=sortStops(stops),x=clamp01(t);if(!s.length)return{r:0,g:0,b:0,a:1};if(x<=s[0].t)return{...s[0].color};if(x>=s[s.length-1].t)return{...s[s.length-1].color};
  for(let i=1;i<s.length;i++)if(x<=s[i].t){const left=s[i-1],right=s[i];let u=(x-left.t)/Math.max(.000001,right.t-left.t);if(left.midpoint!=null)u=Math.pow(u,Math.log(.5)/Math.log(left.midpoint));const a=left.color,b=right.color,alpha=a.a+(b.a-a.a)*u,space:ColorSpace=interpolation==='srgb'?'rgb':interpolation,p=fromRgb(space,a),q=fromRgb(space,b),result:Record<string,number>={};
   for(const k of Object.keys(p)){if(k==='alpha'||(k==='a'&&space!=='oklab'))continue;if(k==='h'){let h1=p.h,h2=q.h;const chroma=space==='hsl'?'s':'C';if(p[chroma]<.00001)h1=h2;if(q[chroma]<.00001)h2=h1;result.h=(h1+(((h2-h1+540)%360)-180)*u+360)%360;}else result[k]=alpha>0?(p[k]*a.a*(1-u)+q[k]*b.a*u)/alpha:0;}
   if(space==='oklab')result.alpha=alpha;else result.a=alpha;const rgb=toRgb(space,result);return{r:channel(rgb.r),g:channel(rgb.g),b:channel(rgb.b),a:alpha};
  }return{...s[s.length-1].color};
 }
 export const makeStopState=(stops?:GradientStop[]):GradientStop[]=>sortStops(stops?.length?stops:DEFAULT_STOPS());
}
export const {makeStopState,stopsToCss,sampleAt,sortStops,clamp01,colorFieldHex,parseColorString,DEFAULT_STOPS}=GradientEditor;
export type RGBA=GradientEditor.RGBA;export type GradientStop=GradientEditor.GradientStop;export type GradientEditorOptions=GradientEditor.GradientEditorOptions;
