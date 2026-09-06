/**
 * @module components/display/Avatar
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Avatar {
    export namespace Types { export type Theme='dark'|'light'; export type Shape='circle'|'rounded'|'square'; export type Status='online'|'offline'|'busy'|'away'|''; }
    export namespace Interfaces { export interface Options { src?:string; name?:string; icon?:string; size?:number; shape?:Types.Shape; status?:Types.Status; theme?:Types.Theme; } }
}
export const Styles = new Css.Stylesheet([

        new Css.Rule('.Avatar', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Avatar[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
    new Css.Rule('.Avatar', { AlignItems:'center', Background:'var(--arianna-bg-3)', Color:'var(--arianna-text)', Display:'inline-flex', FlexShrink:'0', FontWeight:'650', JustifyContent:'center', Overflow:'hidden', Position:'relative' }),
    new Css.Rule('.Avatar:not([shape]), .Avatar[shape="circle"]', { BorderRadius:'50%' }),
    new Css.Rule('.Avatar[shape="rounded"]', { BorderRadius:'8px' }), new Css.Rule('.Avatar[shape="square"]', { BorderRadius:'0' }),
    new Css.Rule('.Avatar-Image', { Height:'100%', ObjectFit:'cover', Width:'100%' }),
    new Css.Rule('.Avatar-Status', { Border:'2px solid var(--arianna-bg)', BorderRadius:'50%', Bottom:'1px', Height:'10px', Position:'absolute', Right:'1px', Width:'10px' }),
    new Css.Rule('.Avatar-Status-Online', { Background:'var(--arianna-success)' }), new Css.Rule('.Avatar-Status-Offline', { Background:'var(--arianna-muted)' }),
    new Css.Rule('.Avatar-Status-Busy', { Background:'var(--arianna-danger)' }), new Css.Rule('.Avatar-Status-Away', { Background:'var(--arianna-warning)' })
]);
@Component('arianna-avatar', Styles, { Shadow:false, Attributes:['src','name','icon','size','shape','status','theme'] })
export class Avatar extends HTMLElement {
    public static readonly Styles=Styles; static DefaultSheet():Css.Stylesheet{return Styles;}
    constructor(options:Avatar.Interfaces.Options={}){ super(); this.Apply(options); }
    private Apply(o:Avatar.Interfaces.Options){ if(o.src)this.src=o.src;if(o.name)this.name=o.name;if(o.icon)this.icon=o.icon;if(o.size!=null)this.size=o.size;if(o.shape)this.shape=o.shape;if(o.status)this.status=o.status;if(o.theme)this.theme=o.theme; }
    onConnected(){ this.classList.add('Avatar'); if(!this.hasAttribute('theme'))this.setAttribute('theme','dark'); this.Render(); }
    onAttributeChanged(){ if(this.isConnected)this.Render(); }
    private Render(){ const size=this.size||36; this.style.width=`${size}px`;this.style.height=`${size}px`;this.style.fontSize=`${Math.round(size*.38)}px`; const nodes:Node[]=[]; if(this.src){const img=document.createElement('img');img.className='Avatar-Image';img.src=this.src;img.alt=this.name;nodes.push(img);} else {const s=document.createElement('span');s.className=this.icon?'Avatar-Icon':'Avatar-Initials';s.textContent=this.icon||this.Initials();nodes.push(s);} if(this.status){const st=document.createElement('span');st.className=`Avatar-Status Avatar-Status-${this.status[0].toUpperCase()+this.status.slice(1)}`;nodes.push(st);} this.replaceChildren(...nodes); }
    private Initials(){return this.name.trim().split(/\s+/).slice(0,2).map(v=>v[0]??'').join('').toUpperCase();}
    get src(){return this.getAttribute('src')??''} set src(v:string){v?this.setAttribute('src',v):this.removeAttribute('src')}
    get name(){return this.getAttribute('name')??''} set name(v:string){v?this.setAttribute('name',v):this.removeAttribute('name')}
    get icon(){return this.getAttribute('icon')??''} set icon(v:string){v?this.setAttribute('icon',v):this.removeAttribute('icon')}
    get size(){return parseInt(this.getAttribute('size')??'36',10)||36} set size(v:number){this.setAttribute('size',String(v))}
    get shape(){return (this.getAttribute('shape')??'circle') as Avatar.Types.Shape} set shape(v:Avatar.Types.Shape){this.setAttribute('shape',v)}
    get status(){return (this.getAttribute('status')??'') as Avatar.Types.Status} set status(v:Avatar.Types.Status){v?this.setAttribute('status',v):this.removeAttribute('status')}
    get theme(){return (this.getAttribute('theme')??'dark') as Avatar.Types.Theme} set theme(v:Avatar.Types.Theme){this.setAttribute('theme',v)}
}
export default Avatar;
export type AvatarOptions=Avatar.Interfaces.Options;
