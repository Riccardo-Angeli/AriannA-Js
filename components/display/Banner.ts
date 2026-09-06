/**
 * @module components/display/Banner
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Banner {export namespace Types{export type Theme='dark'|'light';export type Variant='default'|'info'|'success'|'warning'|'danger';}export namespace Interfaces{export interface Options{variant?:Types.Variant;dismissible?:boolean;icon?:string;message?:string;action?:string;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Banner', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Banner[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Banner',{AlignItems:'center',Background:'var(--arianna-bg-2)',Border:'1px solid var(--arianna-border)',BorderRadius:'8px',BoxSizing:'border-box',Color:'var(--arianna-text)',Display:'flex',Gap:'10px',MaxWidth:'100%',Padding:'10px 12px',Width:'100%'}),
 new Css.Rule('.Banner[variant="info"]',{BoxShadow:'inset 3px 0 0 var(--arianna-info)'}),new Css.Rule('.Banner[variant="success"]',{BoxShadow:'inset 3px 0 0 var(--arianna-success)'}),new Css.Rule('.Banner[variant="warning"]',{BoxShadow:'inset 3px 0 0 var(--arianna-warning)'}),new Css.Rule('.Banner[variant="danger"]',{BoxShadow:'inset 3px 0 0 var(--arianna-danger)'}),
 new Css.Rule('.Banner-Icon',{Flex:'0 0 auto'}),new Css.Rule('.Banner-Message',{Flex:'1 1 auto',FontSize:'.82rem'}),new Css.Rule('.Banner-Action,.Banner-Dismiss',{Appearance:'none',Background:'transparent',Border:'0',Color:'var(--arianna-primary)',Cursor:'pointer',Font:'inherit',FontSize:'.78rem',Padding:'2px 4px'}),new Css.Rule('.Banner-Dismiss',{Color:'var(--arianna-muted)',FontSize:'.9rem'})
]);
@Component('arianna-banner',Styles,{Shadow:false,Attributes:['variant','dismissible','icon','message','action','theme']})
export class Banner extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Banner.Interfaces.Options={}){super();if(o.variant)this.variant=o.variant;if(o.dismissible!=null)this.dismissible=o.dismissible;if(o.icon)this.icon=o.icon;if(o.message)this.message=o.message;if(o.action)this.action=o.action;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Banner');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.setAttribute('role','alert');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const nodes:Node[]=[];if(this.icon){const e=document.createElement('span');e.className='Banner-Icon';e.textContent=this.icon;nodes.push(e)}const m=document.createElement('span');m.className='Banner-Message';m.textContent=this.message||this.textContent||'';nodes.push(m);if(this.action){const b=document.createElement('button');b.className='Banner-Action';b.type='button';b.textContent=this.action;b.addEventListener('click',()=>this.dispatchEvent(new CustomEvent('arianna:action',{bubbles:true,detail:{}})));nodes.push(b)}if(this.dismissible){const b=document.createElement('button');b.className='Banner-Dismiss';b.type='button';b.textContent='✕';b.addEventListener('click',()=>this.dismiss());nodes.push(b)}this.replaceChildren(...nodes)}dismiss(){this.hidden=true;this.dispatchEvent(new CustomEvent('arianna:dismiss',{bubbles:true,detail:{}}));return this}get variant(){return(this.getAttribute('variant')??'default') as Banner.Types.Variant}set variant(v:Banner.Types.Variant){this.setAttribute('variant',v)}get dismissible(){return this.getAttribute('dismissible')!=='false'}set dismissible(v:boolean){this.setAttribute('dismissible',String(v))}get icon(){return this.getAttribute('icon')??''}set icon(v:string){v?this.setAttribute('icon',v):this.removeAttribute('icon')}get message(){return this.getAttribute('message')??''}set message(v:string){v?this.setAttribute('message',v):this.removeAttribute('message')}get action(){return this.getAttribute('action')??''}set action(v:string){v?this.setAttribute('action',v):this.removeAttribute('action')}get theme(){return(this.getAttribute('theme')??'dark') as Banner.Types.Theme}set theme(v:Banner.Types.Theme){this.setAttribute('theme',v)}}
export default Banner;export type BannerOptions=Banner.Interfaces.Options;
