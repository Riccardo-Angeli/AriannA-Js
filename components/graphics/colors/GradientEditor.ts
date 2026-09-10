/** @module components/graphics/colors/GradientEditor */
export namespace GradientEditor {
 export interface RGBA { r:number; g:number; b:number; a:number; }
 export interface GradientStop { t:number; color:RGBA; midpoint?:number; }
 export interface GradientEditorOptions { stops?:GradientStop[]; theme?:'dark'|'light'; }
 export const clamp01=(v:number):number=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 export const DEFAULT_STOPS=():GradientStop[]=>[{t:0,color:{r:228,g:12,b:136,a:1}},{t:1,color:{r:85,g:75,b:220,a:1}}];
 export const sortStops=(stops:GradientStop[]):GradientStop[]=>[...stops].map(s=>({...s,t:clamp01(s.t),color:{...s.color,a:clamp01(s.color.a)}})).sort((a,b)=>a.t-b.t);
 export const colorFieldHex=(c:RGBA):string=>`#${[c.r,c.g,c.b].map(x=>Math.round(Math.max(0,Math.min(255,x))).toString(16).padStart(2,'0')).join('').toUpperCase()}`;
 export function parseColorString(value:string):RGBA { const s=String(value||'').trim(); const m=s.match(/^#([0-9a-f]{3,8})$/i); if(m){let h=m[1];if(h.length===3||h.length===4)h=h.split('').map(x=>x+x).join('');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),a=h.length>=8?parseInt(h.slice(6,8),16)/255:1;return{r,g,b,a};} const rgb=s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);if(rgb)return{r:+rgb[1],g:+rgb[2],b:+rgb[3],a:rgb[4]==null?1:clamp01(+rgb[4])};return{r:228,g:12,b:136,a:1}; }
 export function stopsToCss(stops:GradientStop[]):string { return sortStops(stops).map(s=>`rgba(${Math.round(s.color.r)},${Math.round(s.color.g)},${Math.round(s.color.b)},${clamp01(s.color.a)}) ${Math.round(clamp01(s.t)*1000)/10}%`).join(', '); }
 export function sampleAt(stops:GradientStop[],t:number):RGBA { const s=sortStops(stops);if(!s.length)return{r:0,g:0,b:0,a:1};const x=clamp01(t);if(x<=s[0].t)return{...s[0].color};if(x>=s[s.length-1].t)return{...s[s.length-1].color};for(let i=1;i<s.length;i++){if(x<=s[i].t){const a=s[i-1],b=s[i],u=(x-a.t)/Math.max(.000001,b.t-a.t);return{r:a.color.r+(b.color.r-a.color.r)*u,g:a.color.g+(b.color.g-a.color.g)*u,b:a.color.b+(b.color.b-a.color.b)*u,a:a.color.a+(b.color.a-a.color.a)*u};}}return{...s[s.length-1].color}; }
 export const makeStopState=(stops?:GradientStop[]):GradientStop[]=>sortStops(stops&&stops.length?stops:DEFAULT_STOPS());
}
export const {makeStopState,stopsToCss,sampleAt,sortStops,clamp01,colorFieldHex,parseColorString,DEFAULT_STOPS}=GradientEditor;
export type RGBA=GradientEditor.RGBA;export type GradientStop=GradientEditor.GradientStop;export type GradientEditorOptions=GradientEditor.GradientEditorOptions;
