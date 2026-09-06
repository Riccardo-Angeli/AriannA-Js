/** @module components/graphics/colors/GradientEditor */
import { parseHexRgba, rgbToHex } from './GraphicsColorPicker.ts';
export namespace GradientEditor
{
    export interface RGBA{r:number;g:number;b:number;a:number;}
    export interface GradientStop{t:number;color:RGBA;midpoint?:number;}
    export interface GradientEditorOptions{stops?:GradientStop[];width?:number;alpha?:boolean;theme?:'dark'|'light';}
    export const DEFAULT_STOPS=():GradientStop[]=>[{t:0,color:{r:228,g:12,b:136,a:1}},{t:1,color:{r:255,g:159,b:62,a:1}}];
    export const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
    export const sortStops=(stops:GradientStop[])=>stops.sort((a,b)=>a.t-b.t);
    export const colorFieldHex=(c:RGBA)=>rgbToHex(c.r,c.g,c.b);
    export function parseColorString(v:string):RGBA{return parseHexRgba(v);}
    export function stopsToCss(stops:GradientStop[]):string{return sortStops([...stops]).map(s=>`${s.color.a<1?`rgba(${Math.round(s.color.r)},${Math.round(s.color.g)},${Math.round(s.color.b)},${s.color.a})`:colorFieldHex(s.color)} ${(s.t*100).toFixed(1)}%`).join(', ');}
    export function sampleAt(stops:GradientStop[],t:number):RGBA{const a=sortStops([...stops]);if(!a.length)return{r:0,g:0,b:0,a:1};t=clamp01(t);if(t<=a[0].t)return{...a[0].color};if(t>=a[a.length-1].t)return{...a[a.length-1].color};for(let i=0;i<a.length-1;i++){const x=a[i],y=a[i+1];if(t>=x.t&&t<=y.t){const f=(t-x.t)/(y.t-x.t||1);return{r:x.color.r+(y.color.r-x.color.r)*f,g:x.color.g+(y.color.g-x.color.g)*f,b:x.color.b+(y.color.b-x.color.b)*f,a:x.color.a+(y.color.a-x.color.a)*f};}}return{...a[0].color};}
    export function makeStopState(initial:GradientStop[]=DEFAULT_STOPS())
    {let stops=sortStops(initial.map(s=>({...s,color:{...s.color}})));let selected=0;return{get stops(){return stops},set stops(v:GradientStop[]){stops=sortStops(v)},get selected(){return selected},set selected(v:number){selected=Math.max(0,Math.min(stops.length-1,v))},add(t:number){const c=sampleAt(stops,t);stops=sortStops([...stops,{t:clamp01(t),color:c}]);selected=stops.findIndex(s=>s.t===clamp01(t));return stops[selected]},remove(index=selected){if(stops.length<=2)return;stops=stops.filter((_,i)=>i!==index);selected=Math.max(0,Math.min(selected,stops.length-1));}};}
}
export const makeStopState=GradientEditor.makeStopState;export const stopsToCss=GradientEditor.stopsToCss;export const sampleAt=GradientEditor.sampleAt;export const sortStops=GradientEditor.sortStops;export const clamp01=GradientEditor.clamp01;export const colorFieldHex=GradientEditor.colorFieldHex;export const parseColorString=GradientEditor.parseColorString;export const DEFAULT_STOPS=GradientEditor.DEFAULT_STOPS;
export type RGBA=GradientEditor.RGBA;export type GradientStop=GradientEditor.GradientStop;export type GradientEditorOptions=GradientEditor.GradientEditorOptions;
