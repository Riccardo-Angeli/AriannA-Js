/**
 * @module components/display/Chip
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Chip{export namespace Types{export type Theme='dark'|'light';export type Variant='default'|'primary'|'success'|'warning'|'danger'|'info';export type Size='sm'|'md'|'lg';}export namespace Interfaces{export interface Options{variant?:Types.Variant;size?:Types.Size;deletable?:boolean;label?:string;icon?:string;avatar?:string;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Chip', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Chip[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Chip',{AlignItems:'center',Background:'var(--arianna-bg-3)',Border:'1px solid var(--arianna-border)',BorderRadius:'16px',Color:'var(--arianna-text)',Display:'inline-flex',FontSize:'.78rem',FontWeight:'550',Gap:'5px',Padding:'3px 10px',WhiteSpace:'nowrap'}),
 new Css.Rule('.Chip[variant="primary"]',{BorderColor:'var(--arianna-primary)',Color:'var(--arianna-primary)'}),new Css.Rule('.Chip[variant="success"]',{BorderColor:'var(--arianna-success)',Color:'var(--arianna-success)'}),new Css.Rule('.Chip[variant="warning"]',{BorderColor:'var(--arianna-warning)',Color:'var(--arianna-warning)'}),new Css.Rule('.Chip[variant="danger"]',{BorderColor:'var(--arianna-danger)',Color:'var(--arianna-danger)'}),new Css.Rule('.Chip[variant="info"]',{BorderColor:'var(--arianna-info)',Color:'var(--arianna-info)'}),
 new Css.Rule('.Chip[size="sm"]',{FontSize:'.72rem',Padding:'2px 8px'}),new Css.Rule('.Chip[size="lg"]',{FontSize:'.85rem',Padding:'5px 14px'}),new Css.Rule('.Chip-Avatar',{AlignItems:'center',Background:'currentColor',BorderRadius:'50%',Color:'var(--arianna-bg)',Display:'inline-flex',FontSize:'.65rem',FontWeight:'700',Height:'18px',JustifyContent:'center',Width:'18px'}),new Css.Rule('.Chip-Delete',{Appearance:'none',Background:'transparent',Border:'0',Color:'currentColor',Cursor:'pointer',FontSize:'.7rem',Opacity:'.72',Padding:'0'}),new Css.Rule('.Chip-Delete:hover',{Opacity:'1'})
]);
@Component('arianna-chip',Styles,{Shadow:false,Attributes:['variant','size','deletable','label','icon','avatar','theme']})
export class Chip extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Chip.Interfaces.Options={}){super();if(o.variant)this.variant=o.variant;if(o.size)this.size=o.size;if(o.deletable!=null)this.deletable=o.deletable;if(o.label)this.label=o.label;if(o.icon)this.icon=o.icon;if(o.avatar)this.avatar=o.avatar;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Chip');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const nodes:Node[]=[];if(this.avatar){const a=document.createElement('span');a.className='Chip-Avatar';a.textContent=this.avatar.slice(0,2).toUpperCase();nodes.push(a)}else if(this.icon){const i=document.createElement('span');i.className='Chip-Icon';i.textContent=this.icon;nodes.push(i)}const l=document.createElement('span');l.className='Chip-Label';l.textContent=this.label;nodes.push(l);if(this.deletable){const b=document.createElement('button');b.className='Chip-Delete';b.type='button';b.textContent='✕';b.addEventListener('click',e=>{e.stopPropagation();this.dispatchEvent(new CustomEvent('arianna:delete',{bubbles:true,detail:{label:this.label}}))});nodes.push(b)}this.replaceChildren(...nodes)}get variant(){return(this.getAttribute('variant')??'default') as Chip.Types.Variant}set variant(v:Chip.Types.Variant){this.setAttribute('variant',v)}get size(){return(this.getAttribute('size')??'md') as Chip.Types.Size}set size(v:Chip.Types.Size){this.setAttribute('size',v)}get deletable(){return this.hasAttribute('deletable')}set deletable(v:boolean){this.toggleAttribute('deletable',v)}get label(){return this.getAttribute('label')??''}set label(v:string){v?this.setAttribute('label',v):this.removeAttribute('label')}get icon(){return this.getAttribute('icon')??''}set icon(v:string){v?this.setAttribute('icon',v):this.removeAttribute('icon')}get avatar(){return this.getAttribute('avatar')??''}set avatar(v:string){v?this.setAttribute('avatar',v):this.removeAttribute('avatar')}get theme(){return(this.getAttribute('theme')??'dark') as Chip.Types.Theme}set theme(v:Chip.Types.Theme){this.setAttribute('theme',v)}}
export default Chip;export type ChipOptions=Chip.Interfaces.Options;
