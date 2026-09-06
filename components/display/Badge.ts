/**
 * @module components/display/Badge
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Badge { export namespace Types { export type Theme='dark'|'light'; export type Variant='default'|'primary'|'success'|'warning'|'danger'|'info'; } export namespace Interfaces { export interface Options { variant?:Types.Variant; dot?:boolean; label?:string; theme?:Types.Theme; } } }
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Badge', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Badge[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Badge',{AlignItems:'center',Background:'var(--arianna-bg-3)',Border:'1px solid var(--arianna-border)',BorderRadius:'10px',Color:'var(--arianna-text)',Display:'inline-flex',FontSize:'.72rem',FontWeight:'650',Padding:'2px 8px',WhiteSpace:'nowrap'}),
 new Css.Rule('.Badge[variant="primary"]',{Background:'var(--arianna-primary)',BorderColor:'var(--arianna-primary)',Color:'#fff'}),new Css.Rule('.Badge[variant="success"]',{Background:'var(--arianna-success)',BorderColor:'var(--arianna-success)',Color:'#fff'}),new Css.Rule('.Badge[variant="warning"]',{Background:'var(--arianna-warning)',BorderColor:'var(--arianna-warning)',Color:'#111'}),new Css.Rule('.Badge[variant="danger"]',{Background:'var(--arianna-danger)',BorderColor:'var(--arianna-danger)',Color:'#fff'}),new Css.Rule('.Badge[variant="info"]',{Background:'var(--arianna-info)',BorderColor:'var(--arianna-info)',Color:'#fff'}),new Css.Rule('.Badge[dot]',{BorderRadius:'50%',Height:'8px',MinWidth:'8px',Padding:'0',Width:'8px'})
]);
@Component('arianna-badge',Styles,{Shadow:false,Attributes:['variant','dot','label','theme']})
export class Badge extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles} constructor(o:Badge.Interfaces.Options={}){super();if(o.variant)this.variant=o.variant;if(o.dot!=null)this.dot=o.dot;if(o.label!=null)this.label=o.label;if(o.theme)this.theme=o.theme} onConnected(){this.classList.add('Badge');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render()} onAttributeChanged(){if(this.isConnected)this.Render()} private Render(){if(this.dot)this.replaceChildren();else if(this.label)this.textContent=this.label} get variant(){return(this.getAttribute('variant')??'default') as Badge.Types.Variant}set variant(v:Badge.Types.Variant){this.setAttribute('variant',v)}get label(){return this.getAttribute('label')??''}set label(v:string){v?this.setAttribute('label',v):this.removeAttribute('label')}get dot(){return this.hasAttribute('dot')}set dot(v:boolean){this.toggleAttribute('dot',v)}get theme(){return(this.getAttribute('theme')??'dark') as Badge.Types.Theme}set theme(v:Badge.Types.Theme){this.setAttribute('theme',v)}}
export default Badge; export type BadgeOptions=Badge.Interfaces.Options;
