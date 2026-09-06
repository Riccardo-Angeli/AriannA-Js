/**
 * @module components/display/ProgressBar
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace ProgressBar{export namespace Types{export type Theme='dark'|'light';export type Variant='default'|'primary'|'success'|'warning'|'danger';}export namespace Interfaces{export interface Options{label?:string;value?:number;height?:number;variant?:Types.Variant;showValue?:boolean;indeterminate?:boolean;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.ProgressBar', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.ProgressBar[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.ProgressBar',{Color:'var(--arianna-text)',Display:'flex',FlexDirection:'column',Gap:'5px',MaxWidth:'100%',Width:'100%'}),new Css.Rule('.ProgressBar-Header',{Display:'flex',FontSize:'.78rem',JustifyContent:'space-between'}),new Css.Rule('.ProgressBar-Label',{Color:'var(--arianna-muted)'}),new Css.Rule('.ProgressBar-Track',{Background:'var(--arianna-bg-3)',Border:'1px solid var(--arianna-border)',BorderRadius:'99px',Overflow:'hidden',Width:'100%'}),new Css.Rule('.ProgressBar-Bar',{Background:'var(--arianna-primary)',BorderRadius:'99px',Height:'100%',Transition:'width .3s ease'}),new Css.Rule('.ProgressBar[variant="success"] .ProgressBar-Bar',{Background:'var(--arianna-success)'}),new Css.Rule('.ProgressBar[variant="warning"] .ProgressBar-Bar',{Background:'var(--arianna-warning)'}),new Css.Rule('.ProgressBar[variant="danger"] .ProgressBar-Bar',{Background:'var(--arianna-danger)'}),new Css.Rule('.ProgressBar-Bar-Indeterminate',{Animation:'ProgressBarSlide 1.4s infinite ease-in-out',Width:'40%'}),new Css.Rule({Selector:'@keyframes ProgressBarSlide',Content:{'0%':{Transform:'translateX(-150%)'},'100%':{Transform:'translateX(400%)'}}})
]);
@Component('arianna-progress-bar',Styles,{Shadow:false,Attributes:['label','value','height','variant','show-value','indeterminate','theme']})
export class ProgressBar extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:ProgressBar.Interfaces.Options={}){super();if(o.label)this.label=o.label;if(o.value!=null)this.value=o.value;if(o.height!=null)this.height=o.height;if(o.variant)this.variant=o.variant;if(o.showValue!=null)this.showValue=o.showValue;if(o.indeterminate!=null)this.indeterminate=o.indeterminate;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('ProgressBar');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const head=document.createElement('div');head.className='ProgressBar-Header';const l=document.createElement('span');l.className='ProgressBar-Label';l.textContent=this.label;head.append(l);if(this.showValue&&!this.indeterminate){const v=document.createElement('span');v.className='ProgressBar-Value';v.textContent=`${Math.round(this.value)}%`;head.append(v)}const track=document.createElement('div');track.className='ProgressBar-Track';track.style.height=`${this.height}px`;const bar=document.createElement('div');bar.className='ProgressBar-Bar'+(this.indeterminate?' ProgressBar-Bar-Indeterminate':'');if(!this.indeterminate)bar.style.width=`${this.value}%`;track.append(bar);this.replaceChildren(head,track)}get value(){const n=parseFloat(this.getAttribute('value')??'0');return Math.max(0,Math.min(100,Number.isFinite(n)?n:0))}set value(v:number){this.setAttribute('value',String(Math.max(0,Math.min(100,v))))}get label(){return this.getAttribute('label')??''}set label(v:string){v?this.setAttribute('label',v):this.removeAttribute('label')}get height(){return parseInt(this.getAttribute('height')??'8',10)||8}set height(v:number){this.setAttribute('height',String(v))}get variant(){return(this.getAttribute('variant')??'default') as ProgressBar.Types.Variant}set variant(v:ProgressBar.Types.Variant){this.setAttribute('variant',v)}get showValue(){return this.hasAttribute('show-value')}set showValue(v:boolean){this.toggleAttribute('show-value',v)}get indeterminate(){return this.hasAttribute('indeterminate')}set indeterminate(v:boolean){this.toggleAttribute('indeterminate',v)}get theme(){return(this.getAttribute('theme')??'dark') as ProgressBar.Types.Theme}set theme(v:ProgressBar.Types.Theme){this.setAttribute('theme',v)}}
export default ProgressBar;export type ProgressBarOptions=ProgressBar.Interfaces.Options;
