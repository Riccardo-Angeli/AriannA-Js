/**
 * @module components/display/Skeleton
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Skeleton{export namespace Types{export type Theme='dark'|'light';export type Variant='text'|'circle'|'rect'|'card';}export namespace Interfaces{export interface Options{variant?:Types.Variant;lines?:number;avatar?:boolean;width?:string;height?:string;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Skeleton', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Skeleton[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Skeleton',{Display:'block',MaxWidth:'100%'}),new Css.Rule('.Skeleton-Line,.Skeleton-Rect,.Skeleton-Circle',{Animation:'SkeletonPulse 1.4s ease-in-out infinite',Background:'linear-gradient(90deg,var(--arianna-bg-3),var(--arianna-bg-2),var(--arianna-bg-3))',BackgroundSize:'200% 100%'}),new Css.Rule('.Skeleton-Line',{BorderRadius:'4px',Height:'12px',MarginBottom:'8px',Width:'100%'}),new Css.Rule('.Skeleton-Rect',{BorderRadius:'8px',Height:'120px',Width:'100%'}),new Css.Rule('.Skeleton-Circle',{BorderRadius:'50%',Height:'42px',Width:'42px'}),new Css.Rule('.Skeleton-Row',{Display:'flex',Gap:'12px'}),new Css.Rule('.Skeleton-Lines',{Flex:'1'}),new Css.Rule({Selector:'@keyframes SkeletonPulse',Content:{'0%':{BackgroundPosition:'200% 0'},'100%':{BackgroundPosition:'-200% 0'}}})
]);
@Component('arianna-skeleton',Styles,{Shadow:false,Attributes:['variant','lines','avatar','width','height','theme']})
export class Skeleton extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Skeleton.Interfaces.Options={}){super();if(o.variant)this.variant=o.variant;if(o.lines!=null)this.lines=o.lines;if(o.avatar!=null)this.avatar=o.avatar;if(o.width)this.width=o.width;if(o.height)this.height=o.height;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Skeleton');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Block(cls:string){const e=document.createElement('div');e.className=cls;if(this.width)e.style.width=this.width;if(this.height)e.style.height=this.height;return e}private Render(){if(this.variant==='circle')return void this.replaceChildren(this.Block('Skeleton-Circle'));if(this.variant==='rect')return void this.replaceChildren(this.Block('Skeleton-Rect'));if(this.variant==='card'){const c=document.createElement('div');c.append(this.Block('Skeleton-Rect'));for(let i=0;i<3;i++)c.append(this.Block('Skeleton-Line'));this.replaceChildren(c);return}if(this.avatar){const row=document.createElement('div');row.className='Skeleton-Row';row.append(this.Block('Skeleton-Circle'));const lines=document.createElement('div');lines.className='Skeleton-Lines';lines.append(this.Block('Skeleton-Line'),this.Block('Skeleton-Line'));row.append(lines);this.replaceChildren(row);return}const nodes:Node[]=[];for(let i=0;i<this.lines;i++){const l=this.Block('Skeleton-Line');if(i===this.lines-1)l.style.width='60%';nodes.push(l)}this.replaceChildren(...nodes)}get variant(){return(this.getAttribute('variant')??'text') as Skeleton.Types.Variant}set variant(v:Skeleton.Types.Variant){this.setAttribute('variant',v)}get lines(){return parseInt(this.getAttribute('lines')??'3',10)||3}set lines(v:number){this.setAttribute('lines',String(v))}get avatar(){return this.hasAttribute('avatar')}set avatar(v:boolean){this.toggleAttribute('avatar',v)}get width(){return this.getAttribute('width')??''}set width(v:string){v?this.setAttribute('width',v):this.removeAttribute('width')}get height(){return this.getAttribute('height')??''}set height(v:string){v?this.setAttribute('height',v):this.removeAttribute('height')}get theme(){return(this.getAttribute('theme')??'dark') as Skeleton.Types.Theme}set theme(v:Skeleton.Types.Theme){this.setAttribute('theme',v)}}
export default Skeleton;export type SkeletonOptions=Skeleton.Interfaces.Options;
