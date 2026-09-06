/**
 * @module components/display/Icon
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Icon{export namespace Types{export type Theme='dark'|'light';}export namespace Interfaces{export interface Options{src?:string;size?:number;color?:string;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Icon', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Icon[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Icon',{AlignItems:'center',Color:'var(--arianna-text)',Display:'inline-flex',FlexShrink:'0',JustifyContent:'center',LineHeight:'1'}),new Css.Rule('.Icon svg',{Height:'1em',Width:'1em'})
]);
@Component('arianna-icon',Styles,{Shadow:false,Attributes:['src','size','color','theme']})
export class Icon extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Icon.Interfaces.Options={}){super();if(o.src)this.src=o.src;if(o.size!=null)this.size=o.size;if(o.color)this.color=o.color;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Icon');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.setAttribute('aria-hidden','true');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){if(this.size){this.style.fontSize=`${this.size}px`;this.style.width=`${this.size}px`;this.style.height=`${this.size}px`}this.style.color=this.color||'';const src=this.src.trim();if(!src)return;if(src.startsWith('<'))this.innerHTML=src;else this.textContent=src}get src(){return this.getAttribute('src')??''}set src(v:string){v?this.setAttribute('src',v):this.removeAttribute('src')}get size(){return parseInt(this.getAttribute('size')??'0',10)||0}set size(v:number){this.setAttribute('size',String(v))}get color(){return this.getAttribute('color')??''}set color(v:string){v?this.setAttribute('color',v):this.removeAttribute('color')}get theme(){return(this.getAttribute('theme')??'dark') as Icon.Types.Theme}set theme(v:Icon.Types.Theme){this.setAttribute('theme',v)}}
export default Icon;export type IconOptions=Icon.Interfaces.Options;
