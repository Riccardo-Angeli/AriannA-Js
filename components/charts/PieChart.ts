/**
 * @module components/charts/PieChart
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace PieChart{export namespace Types{export type Theme='dark'|'light';}export namespace Interfaces{export interface PieDatum{label:string;value:number;color?:string;}export interface Options{size?:number;donut?:number;showLegend?:boolean;showLabels?:boolean;startAngle?:number;data?:PieDatum[];theme?:Types.Theme;}}}
const PieData=new WeakMap<HTMLElement,PieChart.Interfaces.PieDatum[]>();

const SVG='http://www.w3.org/2000/svg';
function Num(el:HTMLElement,name:string,fallback:number):number{const v=parseFloat(el.getAttribute(name)??'');return Number.isFinite(v)?v:fallback;}

export const Styles=new Css.Stylesheet([

        new Css.Rule('.PieChart', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.PieChart[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.PieChart',{Background:'var(--arianna-bg)',Border:'1px solid var(--arianna-border)',BorderRadius:'8px',BoxSizing:'border-box',Color:'var(--arianna-text)',Display:'inline-block',MaxWidth:'100%',Padding:'8px'}),new Css.Rule('.PieChart-Wrap',{AlignItems:'center',Display:'flex',FlexWrap:'wrap',Gap:'16px'}),new Css.Rule('.PieChart-Svg',{Display:'block',Height:'auto',MaxWidth:'100%'}),new Css.Rule('.PieChart-Slice',{Cursor:'pointer',Transition:'opacity .15s'}),new Css.Rule('.PieChart-Slice:hover',{Opacity:'.82'}),new Css.Rule('.PieChart-Legend',{Display:'grid',Gap:'6px',ListStyle:'none',Margin:'0',Padding:'0'}),new Css.Rule('.PieChart-LegendItem',{AlignItems:'center',Display:'flex',FontSize:'.78rem',Gap:'7px'}),new Css.Rule('.PieChart-Swatch',{BorderRadius:'3px',Height:'10px',Width:'10px'})
]);
@Component('arianna-pie-chart',Styles,{Shadow:false,Attributes:['size','donut','show-legend','show-labels','start-angle','theme','data'],Properties:['data']})
export class PieChart extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:PieChart.Interfaces.Options={}){super();if(o.size!=null)this.size=o.size;if(o.donut!=null)this.donut=o.donut;if(o.showLegend!=null)this.showLegend=o.showLegend;if(o.showLabels!=null)this.showLabels=o.showLabels;if(o.startAngle!=null)this.startAngle=o.startAngle;if(o.data)this.data=o.data;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('PieChart');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(!PieData.has(this))PieData.set(this,[]);this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Arc(cx:number,cy:number,r:number,inner:number,a0:number,a1:number){const p=(rad:number,rr:number)=>[cx+Math.cos(rad)*rr,cy+Math.sin(rad)*rr],p0=p(a0,r),p1=p(a1,r),large=a1-a0>Math.PI?1:0;if(inner<=0)return`M ${cx} ${cy} L ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`;const q1=p(a1,inner),q0=p(a0,inner);return`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} L ${q1[0]} ${q1[1]} A ${inner} ${inner} 0 ${large} 0 ${q0[0]} ${q0[1]} Z`}private Render(){const rows=this.data,s=this.size,total=rows.reduce((a,b)=>a+Math.max(0,b.value),0)||1,c=s/2,r=s*.44,inner=r*this.donut,svg=document.createElementNS(SVG,'svg');svg.classList.add('PieChart-Svg');svg.setAttribute('viewBox',`0 0 ${s} ${s}`);svg.setAttribute('width',String(s));let a=this.startAngle;rows.forEach((row,i)=>{const span=Math.max(0,row.value)/total*Math.PI*2,path=document.createElementNS(SVG,'path');path.setAttribute('class','PieChart-Slice');path.setAttribute('d',this.Arc(c,c,r,inner,a,a+span));path.setAttribute('fill',row.color||['#e40c88','#60a5fa','#26a69a','#f5a623','#a78bfa'][i%5]);svg.append(path);a+=span});const wrap=document.createElement('div');wrap.className='PieChart-Wrap';wrap.append(svg);if(this.showLegend){const ul=document.createElement('ul');ul.className='PieChart-Legend';rows.forEach((row,i)=>{const li=document.createElement('li');li.className='PieChart-LegendItem';const sw=document.createElement('span');sw.className='PieChart-Swatch';sw.style.background=row.color||['#e40c88','#60a5fa','#26a69a','#f5a623','#a78bfa'][i%5];const text=document.createElement('span');text.textContent=`${row.label} · ${row.value}`;li.append(sw,text);ul.append(li)});wrap.append(ul)}this.replaceChildren(wrap)}set data(v:PieChart.Interfaces.PieDatum[]){PieData.set(this,Array.isArray(v)?v:[]);if(this.isConnected)this.Render()}get data(){return PieData.get(this)??[]}get size(){return Num(this,'size',300)}set size(v:number){this.setAttribute('size',String(v))}get donut(){return Math.max(0,Math.min(.85,Num(this,'donut',0)))}set donut(v:number){this.setAttribute('donut',String(v))}get showLegend(){return this.getAttribute('show-legend')!=='false'}set showLegend(v:boolean){this.setAttribute('show-legend',String(v))}get showLabels(){return this.hasAttribute('show-labels')}set showLabels(v:boolean){this.toggleAttribute('show-labels',v)}get startAngle(){return Num(this,'start-angle',-Math.PI/2)}set startAngle(v:number){this.setAttribute('start-angle',String(v))}get theme(){return(this.getAttribute('theme')??'dark') as PieChart.Types.Theme}set theme(v:PieChart.Types.Theme){this.setAttribute('theme',v)}}
export default PieChart;export type PieDatum=PieChart.Interfaces.PieDatum;export type PieChartOptions=PieChart.Interfaces.Options;
