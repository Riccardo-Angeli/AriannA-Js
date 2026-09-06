/**
 * @module components/display/Tooltip
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Tooltip{export namespace Types{export type Theme='dark'|'light';export type Position='top'|'bottom'|'left'|'right';}export namespace Interfaces{export interface Options{text?:string;position?:Types.Position;delay?:number;theme?:Types.Theme;}}}
type TipState={bubble:HTMLDivElement;timer:number;enter:()=>void;leave:()=>void};const Tips=new WeakMap<HTMLElement,TipState>();
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Tooltip', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Tooltip[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Tooltip',{Display:'inline-block'}),new Css.Rule('.Tooltip-Bubble',{Background:'#111216',Border:'1px solid #303238',BorderRadius:'5px',BoxShadow:'0 4px 14px rgba(0,0,0,.3)',Color:'#f0f1f4',FontSize:'.74rem',MaxWidth:'220px',Opacity:'0',Padding:'5px 8px',PointerEvents:'none',Position:'fixed',Transition:'opacity .14s',WhiteSpace:'pre-wrap',ZIndex:'9000'}),new Css.Rule('.Tooltip-Bubble[theme="light"]',{Background:'#fff',BorderColor:'#d8d8de',Color:'#1c1e21'}),new Css.Rule('.Tooltip-Bubble-On',{Opacity:'1'})
]);
@Component('arianna-tooltip',Styles,{Shadow:false,Attributes:['text','position','delay','theme']})
export class Tooltip extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Tooltip.Interfaces.Options={}){super();if(o.text)this.text=o.text;if(o.position)this.position=o.position;if(o.delay!=null)this.delay=o.delay;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Tooltip');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(Tips.has(this))return;const bubble=document.createElement('div');bubble.className='Tooltip-Bubble';bubble.setAttribute('theme',this.theme);bubble.textContent=this.text;document.body.append(bubble);const state:TipState={bubble,timer:0,enter:()=>{},leave:()=>{}};state.enter=()=>{clearTimeout(state.timer);state.timer=window.setTimeout(()=>{this.Place(bubble);bubble.classList.add('Tooltip-Bubble-On')},this.delay)};state.leave=()=>{clearTimeout(state.timer);bubble.classList.remove('Tooltip-Bubble-On')};this.addEventListener('mouseenter',state.enter);this.addEventListener('mouseleave',state.leave);Tips.set(this,state)}onAttributeChanged(){const s=Tips.get(this);if(s){s.bubble.textContent=this.text;s.bubble.setAttribute('theme',this.theme)}}onUnmount(){const s=Tips.get(this);if(!s)return;clearTimeout(s.timer);this.removeEventListener('mouseenter',s.enter);this.removeEventListener('mouseleave',s.leave);s.bubble.remove();Tips.delete(this)}private Place(b:HTMLDivElement){const r=this.getBoundingClientRect(),w=b.offsetWidth||120,h=b.offsetHeight||28,p=this.position;let left=r.left+r.width/2-w/2,top=r.top-h-6;if(p==='bottom')top=r.bottom+6;if(p==='left'){left=r.left-w-6;top=r.top+r.height/2-h/2}if(p==='right'){left=r.right+6;top=r.top+r.height/2-h/2}b.style.left=`${left}px`;b.style.top=`${top}px`}static attach(el:HTMLElement,text:string,o:Tooltip.Interfaces.Options={}){const host=new Tooltip(o);host.text=text;el.parentElement?.insertBefore(host,el);host.append(el);return host}get text(){return this.getAttribute('text')??''}set text(v:string){v?this.setAttribute('text',v):this.removeAttribute('text')}get position(){return(this.getAttribute('position')??'top') as Tooltip.Types.Position}set position(v:Tooltip.Types.Position){this.setAttribute('position',v)}get delay(){return parseInt(this.getAttribute('delay')??'180',10)||180}set delay(v:number){this.setAttribute('delay',String(v))}get theme(){return(this.getAttribute('theme')??'dark') as Tooltip.Types.Theme}set theme(v:Tooltip.Types.Theme){this.setAttribute('theme',v)}}
export default Tooltip;export type TooltipOptions=Tooltip.Interfaces.Options;
