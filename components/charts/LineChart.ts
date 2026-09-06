/**
 * @module components/charts/LineChart
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace LineChart{export namespace Types{export type Theme='dark'|'light';export type LinePoint=[number,number];}export namespace Interfaces{export interface LineSeries{name:string;points:Types.LinePoint[];color?:string;}export interface Options{width?:number;height?:number;area?:boolean;smooth?:boolean;showGrid?:boolean;showDots?:boolean;series?:LineSeries[];theme?:Types.Theme;}}}
const Series=new WeakMap<HTMLElement,LineChart.Interfaces.LineSeries[]>();

const SVG='http://www.w3.org/2000/svg';
function Num(el:HTMLElement,name:string,fallback:number):number{const v=parseFloat(el.getAttribute(name)??'');return Number.isFinite(v)?v:fallback;}

export const Styles=new Css.Stylesheet([

        new Css.Rule('.LineChart', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.LineChart[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.LineChart',{Background:'var(--arianna-bg)',Border:'1px solid var(--arianna-border)',BorderRadius:'8px',BoxSizing:'border-box',Color:'var(--arianna-text)',Display:'inline-block',MaxWidth:'100%',Padding:'8px'}),new Css.Rule('.LineChart-Svg',{Display:'block',Height:'auto',MaxWidth:'100%',Width:'100%'}),new Css.Rule('.LineChart-Grid',{Stroke:'var(--arianna-border)',StrokeWidth:'1'}),new Css.Rule('.LineChart-Line',{Fill:'none',StrokeWidth:'2.2',StrokeLinecap:'round',StrokeLinejoin:'round'}),new Css.Rule('.LineChart-Area',{Opacity:'.14'}),new Css.Rule('.LineChart-Dot',{Cursor:'pointer'})
]);
@Component('arianna-line-chart',Styles,{Shadow:false,Attributes:['width','height','area','smooth','show-grid','show-dots','theme','series'],Properties:['series']})
export class LineChart extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:LineChart.Interfaces.Options={}){super();if(o.width!=null)this.width=o.width;if(o.height!=null)this.height=o.height;if(o.area!=null)this.area=o.area;if(o.smooth!=null)this.smooth=o.smooth;if(o.showGrid!=null)this.showGrid=o.showGrid;if(o.showDots!=null)this.showDots=o.showDots;if(o.series)this.series=o.series;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('LineChart');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(!Series.has(this))Series.set(this,[]);this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const all=this.series.flatMap(s=>s.points),w=this.width,h=this.height,p={l:34,r:14,t:16,b:22},iw=w-p.l-p.r,ih=h-p.t-p.b;if(!all.length){this.replaceChildren();return}const xs=all.map(v=>v[0]),ys=all.map(v=>v[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),x=(v:number)=>p.l+(v-xmin)/(xmax-xmin||1)*iw,y=(v:number)=>p.t+(ymax-v)/(ymax-ymin||1)*ih;const svg=document.createElementNS(SVG,'svg');svg.classList.add('LineChart-Svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);if(this.showGrid)for(let i=0;i<5;i++){const yy=p.t+ih*i/4,line=document.createElementNS(SVG,'line');line.setAttribute('class','LineChart-Grid');line.setAttribute('x1',String(p.l));line.setAttribute('x2',String(w-p.r));line.setAttribute('y1',String(yy));line.setAttribute('y2',String(yy));svg.append(line)}this.series.forEach((s,si)=>{const color=s.color||['#e40c88','#60a5fa','#26a69a','#f5a623'][si%4],pts=s.points.map(q=>`${x(q[0])},${y(q[1])}`).join(' ');if(this.area){const a=document.createElementNS(SVG,'polygon');a.setAttribute('class','LineChart-Area');a.setAttribute('fill',color);a.setAttribute('points',`${x(s.points[0][0])},${h-p.b} ${pts} ${x(s.points[s.points.length-1][0])},${h-p.b}`);svg.append(a)}const line=document.createElementNS(SVG,'polyline');line.setAttribute('class','LineChart-Line');line.setAttribute('stroke',color);line.setAttribute('points',pts);svg.append(line);if(this.showDots)s.points.forEach(q=>{const c=document.createElementNS(SVG,'circle');c.setAttribute('class','LineChart-Dot');c.setAttribute('cx',String(x(q[0])));c.setAttribute('cy',String(y(q[1])));c.setAttribute('r','3');c.setAttribute('fill',color);svg.append(c)})});this.replaceChildren(svg)}set series(v:LineChart.Interfaces.LineSeries[]){Series.set(this,Array.isArray(v)?v:[]);if(this.isConnected)this.Render()}get series(){return Series.get(this)??[]}get width(){return Num(this,'width',600)}set width(v:number){this.setAttribute('width',String(v))}get height(){return Num(this,'height',280)}set height(v:number){this.setAttribute('height',String(v))}get area(){return this.hasAttribute('area')}set area(v:boolean){this.toggleAttribute('area',v)}get smooth(){return this.hasAttribute('smooth')}set smooth(v:boolean){this.toggleAttribute('smooth',v)}get showGrid(){return this.getAttribute('show-grid')!=='false'}set showGrid(v:boolean){this.setAttribute('show-grid',String(v))}get showDots(){return this.hasAttribute('show-dots')}set showDots(v:boolean){this.toggleAttribute('show-dots',v)}get theme(){return(this.getAttribute('theme')??'dark') as LineChart.Types.Theme}set theme(v:LineChart.Types.Theme){this.setAttribute('theme',v)}}
export default LineChart;export type LinePoint=LineChart.Types.LinePoint;export type LineSeries=LineChart.Interfaces.LineSeries;export type LineChartOptions=LineChart.Interfaces.Options;
