/**
 * @module components/display/ProgressCircular
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace ProgressCircular{export namespace Types{export type Theme='dark'|'light';export type Variant='default'|'primary'|'success'|'warning'|'danger';}export namespace Interfaces{export interface Options{size?:number;strokeWidth?:number;value?:number;variant?:Types.Variant;showValue?:boolean;indeterminate?:boolean;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.ProgressCircular', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.ProgressCircular[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.ProgressCircular',{AlignItems:'center',Color:'var(--arianna-text)',Display:'inline-flex',JustifyContent:'center',Position:'relative'}),new Css.Rule('.ProgressCircular-Label',{FontWeight:'650',FontVariantNumeric:'tabular-nums',Position:'absolute'}),new Css.Rule('.ProgressCircular-Spin',{Animation:'ProgressCircularSpin 1s linear infinite'}),new Css.Rule({Selector:'@keyframes ProgressCircularSpin',Content:{to:{Transform:'rotate(360deg)'}}})
]);
@Component('arianna-progress-circular',Styles,{Shadow:false,Attributes:['size','stroke-width','value','variant','show-value','indeterminate','theme']})
export class ProgressCircular extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:ProgressCircular.Interfaces.Options={}){super();if(o.size!=null)this.size=o.size;if(o.strokeWidth!=null)this.strokeWidth=o.strokeWidth;if(o.value!=null)this.value=o.value;if(o.variant)this.variant=o.variant;if(o.showValue!=null)this.showValue=o.showValue;if(o.indeterminate!=null)this.indeterminate=o.indeterminate;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('ProgressCircular');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const ns='http://www.w3.org/2000/svg',s=this.size,sw=this.strokeWidth,r=(s-sw)/2,c=2*Math.PI*r,v=this.value,frac=this.indeterminate ? .75 : v/100;const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${s} ${s}`);svg.setAttribute('width',String(s));svg.setAttribute('height',String(s));if(this.indeterminate)svg.classList.add('ProgressCircular-Spin');const track=document.createElementNS(ns,'circle');for(const q of [track]){q.setAttribute('cx',String(s/2));q.setAttribute('cy',String(s/2));q.setAttribute('r',String(r));q.setAttribute('fill','none');q.setAttribute('stroke-width',String(sw))}track.setAttribute('stroke','var(--arianna-bg-3)');const prog=track.cloneNode() as SVGCircleElement;prog.setAttribute('stroke',this.Color());prog.setAttribute('stroke-linecap','round');prog.setAttribute('stroke-dasharray',`${c*frac} ${c*(1-frac)}`);prog.setAttribute('stroke-dashoffset',String(c*.25));svg.append(track,prog);const nodes:Node[]=[svg];if(this.showValue&&!this.indeterminate){const label=document.createElement('span');label.className='ProgressCircular-Label';label.style.fontSize=`${Math.round(s*.22)}px`;label.textContent=`${Math.round(v)}%`;nodes.push(label)}this.replaceChildren(...nodes)}private Color(){return this.variant==='success'?'var(--arianna-success)':this.variant==='warning'?'var(--arianna-warning)':this.variant==='danger'?'var(--arianna-danger)':'var(--arianna-primary)'}get size(){return parseInt(this.getAttribute('size')??'48',10)||48}set size(v:number){this.setAttribute('size',String(v))}get strokeWidth(){return parseInt(this.getAttribute('stroke-width')??'4',10)||4}set strokeWidth(v:number){this.setAttribute('stroke-width',String(v))}get value(){const n=parseFloat(this.getAttribute('value')??'0');return Math.max(0,Math.min(100,Number.isFinite(n)?n:0))}set value(v:number){this.setAttribute('value',String(Math.max(0,Math.min(100,v))))}get variant(){return(this.getAttribute('variant')??'default') as ProgressCircular.Types.Variant}set variant(v:ProgressCircular.Types.Variant){this.setAttribute('variant',v)}get showValue(){return this.hasAttribute('show-value')}set showValue(v:boolean){this.toggleAttribute('show-value',v)}get indeterminate(){return this.hasAttribute('indeterminate')}set indeterminate(v:boolean){this.toggleAttribute('indeterminate',v)}get theme(){return(this.getAttribute('theme')??'dark') as ProgressCircular.Types.Theme}set theme(v:ProgressCircular.Types.Theme){this.setAttribute('theme',v)}}
export default ProgressCircular;export type ProgressCircularOptions=ProgressCircular.Interfaces.Options;
