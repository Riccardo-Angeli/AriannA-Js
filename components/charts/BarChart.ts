/**
 * @module components/charts/BarChart
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace BarChart{export namespace Types{export type Theme='dark'|'light';}export namespace Interfaces{export interface BarDatum{label:string;value:number;color?:string;}export interface Options{width?:number;height?:number;barColor?:string;showValues?:boolean;showGrid?:boolean;yMin?:number;yMax?:number;data?:BarDatum[];theme?:Types.Theme;}}}
const Data=new WeakMap<HTMLElement,BarChart.Interfaces.BarDatum[]>();

const SVG='http://www.w3.org/2000/svg';
function Num(el:HTMLElement,name:string,fallback:number):number{const v=parseFloat(el.getAttribute(name)??'');return Number.isFinite(v)?v:fallback;}

export const Styles=new Css.Stylesheet([

        new Css.Rule('.BarChart', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.BarChart[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.BarChart',{Background:'var(--arianna-bg)',Border:'1px solid var(--arianna-border)',BorderRadius:'8px',BoxSizing:'border-box',Color:'var(--arianna-text)',Display:'inline-block',MaxWidth:'100%',Overflow:'hidden',Padding:'8px'}),new Css.Rule('.BarChart-Svg',{Display:'block',Height:'auto',MaxWidth:'100%',Width:'100%'}),new Css.Rule('.BarChart-Grid',{Stroke:'var(--arianna-border)',StrokeWidth:'1'}),new Css.Rule('.BarChart-Tick',{Fill:'var(--arianna-muted)',FontSize:'11px'}),new Css.Rule('.BarChart-Label,.BarChart-Value',{Fill:'var(--arianna-text)',FontSize:'11px'}),new Css.Rule('.BarChart-Bar',{Cursor:'pointer',Transition:'opacity .15s'}),new Css.Rule('.BarChart-Bar:hover',{Opacity:'.8'})
]);
@Component('arianna-bar-chart',Styles,{Shadow:false,Attributes:['width','height','bar-color','show-values','show-grid','y-min','y-max','theme','data'],Properties:['data']})
export class BarChart extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:BarChart.Interfaces.Options={}){super();if(o.width!=null)this.width=o.width;if(o.height!=null)this.height=o.height;if(o.barColor)this.barColor=o.barColor;if(o.showValues!=null)this.showValues=o.showValues;if(o.showGrid!=null)this.showGrid=o.showGrid;if(o.yMin!=null)this.yMin=o.yMin;if(o.yMax!=null)this.yMax=o.yMax;if(o.data)this.data=o.data;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('BarChart');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(!Data.has(this))Data.set(this,[]);this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const rows=this.data,w=this.width,h=this.height,p={l:42,r:16,t:16,b:34},iw=w-p.l-p.r,ih=h-p.t-p.b;const vals=rows.map(r=>r.value);let min=this.hasAttribute('y-min')?this.yMin:Math.min(0,...vals,0),max=this.hasAttribute('y-max')?this.yMax:Math.max(...vals,1);if(max===min)max=min+1;const y=(v:number)=>p.t+(max-v)/(max-min)*ih;const svg=document.createElementNS(SVG,'svg');svg.classList.add('BarChart-Svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);if(this.showGrid)for(let i=0;i<5;i++){const yy=p.t+ih*i/4;const line=document.createElementNS(SVG,'line');line.setAttribute('x1',String(p.l));line.setAttribute('x2',String(w-p.r));line.setAttribute('y1',String(yy));line.setAttribute('y2',String(yy));line.setAttribute('class','BarChart-Grid');svg.append(line)}const bw=rows.length?iw/rows.length*.64:0;rows.forEach((r,i)=>{const cx=p.l+iw*(i+.5)/rows.length,base=y(Math.max(0,min)),yy=y(r.value),rect=document.createElementNS(SVG,'rect');rect.setAttribute('class','BarChart-Bar');rect.setAttribute('x',String(cx-bw/2));rect.setAttribute('width',String(bw));rect.setAttribute('y',String(Math.min(yy,base)));rect.setAttribute('height',String(Math.abs(base-yy)));rect.setAttribute('rx','3');rect.setAttribute('fill',r.color||this.barColor);svg.append(rect);const lab=document.createElementNS(SVG,'text');lab.setAttribute('class','BarChart-Label');lab.setAttribute('x',String(cx));lab.setAttribute('y',String(h-10));lab.setAttribute('text-anchor','middle');lab.textContent=r.label;svg.append(lab);if(this.showValues){const v=document.createElementNS(SVG,'text');v.setAttribute('class','BarChart-Value');v.setAttribute('x',String(cx));v.setAttribute('y',String(Math.min(yy,base)-5));v.setAttribute('text-anchor','middle');v.textContent=String(r.value);svg.append(v)}});this.replaceChildren(svg)}set data(v:BarChart.Interfaces.BarDatum[]){Data.set(this,Array.isArray(v)?v:[]);if(this.isConnected)this.Render()}get data(){return Data.get(this)??[]}get width(){return Num(this,'width',600)}set width(v:number){this.setAttribute('width',String(v))}get height(){return Num(this,'height',260)}set height(v:number){this.setAttribute('height',String(v))}get barColor(){return this.getAttribute('bar-color')??'var(--arianna-primary)'}set barColor(v:string){this.setAttribute('bar-color',v)}get showValues(){return this.hasAttribute('show-values')&&this.getAttribute('show-values')!=='false'}set showValues(v:boolean){this.toggleAttribute('show-values',v)}get showGrid(){return this.getAttribute('show-grid')!=='false'}set showGrid(v:boolean){this.setAttribute('show-grid',String(v))}get yMin(){return Num(this,'y-min',0)}set yMin(v:number){this.setAttribute('y-min',String(v))}get yMax(){return Num(this,'y-max',100)}set yMax(v:number){this.setAttribute('y-max',String(v))}get theme(){return(this.getAttribute('theme')??'dark') as BarChart.Types.Theme}set theme(v:BarChart.Types.Theme){this.setAttribute('theme',v)}}
export default BarChart;export type BarDatum=BarChart.Interfaces.BarDatum;export type BarChartOptions=BarChart.Interfaces.Options;
