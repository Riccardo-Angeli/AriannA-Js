/**
 * @module components/display/Divider
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Divider{export namespace Types{export type Theme='dark'|'light';export type Orientation='horizontal'|'vertical';export type Variant='solid'|'dashed'|'dotted';}export namespace Interfaces{export interface Options{orientation?:Types.Orientation;variant?:Types.Variant;label?:string;theme?:Types.Theme;}}}
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Divider', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Divider[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Divider',{AlignItems:'center',Display:'flex',Gap:'10px',Width:'100%'}),new Css.Rule('.Divider[orientation="vertical"]',{AlignSelf:'stretch',FlexDirection:'column',Width:'auto'}),new Css.Rule('.Divider-Line',{BorderTop:'1px solid var(--arianna-border)',Flex:'1'}),new Css.Rule('.Divider[orientation="vertical"] .Divider-Line',{BorderLeft:'1px solid var(--arianna-border)',BorderTop:'0'}),new Css.Rule('.Divider[variant="dashed"] .Divider-Line',{BorderStyle:'dashed'}),new Css.Rule('.Divider[variant="dotted"] .Divider-Line',{BorderStyle:'dotted'}),new Css.Rule('.Divider-Label',{Color:'var(--arianna-muted)',FontSize:'.78rem',WhiteSpace:'nowrap'})
]);
@Component('arianna-divider',Styles,{Shadow:false,Attributes:['orientation','variant','label','theme']})
export class Divider extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Divider.Interfaces.Options={}){super();if(o.orientation)this.orientation=o.orientation;if(o.variant)this.variant=o.variant;if(o.label)this.label=o.label;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Divider');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.setAttribute('role','separator');this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const a=document.createElement('span');a.className='Divider-Line';if(!this.label){this.replaceChildren(a);return}const l=document.createElement('span');l.className='Divider-Label';l.textContent=this.label;const b=document.createElement('span');b.className='Divider-Line';this.replaceChildren(a,l,b)}get orientation(){return(this.getAttribute('orientation')??'horizontal') as Divider.Types.Orientation}set orientation(v:Divider.Types.Orientation){this.setAttribute('orientation',v)}get variant(){return(this.getAttribute('variant')??'solid') as Divider.Types.Variant}set variant(v:Divider.Types.Variant){this.setAttribute('variant',v)}get label(){return this.getAttribute('label')??''}set label(v:string){v?this.setAttribute('label',v):this.removeAttribute('label')}get theme(){return(this.getAttribute('theme')??'dark') as Divider.Types.Theme}set theme(v:Divider.Types.Theme){this.setAttribute('theme',v)}}
export default Divider;export type DividerOptions=Divider.Interfaces.Options;
