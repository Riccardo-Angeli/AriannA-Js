/**
 * @module components/display/Tag
 * @version 2.0.0
 * @description AriannA 2 component normalized to the Accordion light-DOM convention.
 */
import { Component, Css } from '../../core/index.ts';


export namespace Tag{export namespace Types{export type Theme='dark'|'light';}export namespace Interfaces{export interface Options{items?:string[];removable?:boolean;theme?:Types.Theme;}}}
const ItemsTag=new WeakMap<HTMLElement,string[]>();
export const Styles=new Css.Stylesheet([

        new Css.Rule('.Tag', {
            '--arianna-bg':'#17181c','--arianna-bg-2':'#1d1e23','--arianna-bg-3':'#24262b',
            '--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580',
            '--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-info':'#60a5fa',
            '--arianna-success':'#26a69a','--arianna-warning':'#f5a623','--arianna-danger':'#ef5350'
        }),
        new Css.Rule('.Tag[theme="light"]', {
            '--arianna-bg':'#ffffff','--arianna-bg-2':'#fbfbfc','--arianna-bg-3':'#f3f3f5',
            '--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98',
            '--arianna-border':'#e2e2e6','--arianna-primary':'#e40c88','--arianna-info':'#2f6feb',
            '--arianna-success':'#168a78','--arianna-warning':'#b66c00','--arianna-danger':'#c93645'
        }),
 new Css.Rule('.Tag',{Display:'flex',FlexWrap:'wrap',Gap:'6px'}),new Css.Rule('.Tag-Item',{AlignItems:'center',Background:'var(--arianna-bg-3)',Border:'1px solid var(--arianna-border)',BorderRadius:'5px',Color:'var(--arianna-text)',Display:'inline-flex',FontSize:'.75rem',Gap:'5px',Padding:'3px 8px'}),new Css.Rule('.Tag-Remove',{Appearance:'none',Background:'transparent',Border:'0',Color:'var(--arianna-muted)',Cursor:'pointer',FontSize:'.7rem',Padding:'0'}),new Css.Rule('.Tag-Remove:hover',{Color:'var(--arianna-danger)'})
]);
@Component('arianna-tag',Styles,{Shadow:false,Attributes:['removable','theme','items'],Properties:['items']})
export class Tag extends HTMLElement{public static readonly Styles=Styles;static DefaultSheet(){return Styles}constructor(o:Tag.Interfaces.Options={}){super();if(o.items)this.items=o.items;if(o.removable!=null)this.removable=o.removable;if(o.theme)this.theme=o.theme}onConnected(){this.classList.add('Tag');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(!ItemsTag.has(this))ItemsTag.set(this,[]);this.Render()}onAttributeChanged(){if(this.isConnected)this.Render()}private Render(){const nodes:Node[]=[];for(const item of this.items){const tag=document.createElement('span');tag.className='Tag-Item';tag.append(document.createTextNode(item));if(this.removable){const b=document.createElement('button');b.className='Tag-Remove';b.type='button';b.textContent='✕';b.addEventListener('click',()=>{this.removeItem(item);this.dispatchEvent(new CustomEvent('arianna:remove',{bubbles:true,detail:{item}}))});tag.append(b)}nodes.push(tag)}this.replaceChildren(...nodes)}set items(v:string[]){ItemsTag.set(this,Array.isArray(v)?v:[]);if(this.isConnected)this.Render()}get items(){return ItemsTag.get(this)??[]}addItem(item:string){this.items=[...this.items,item]}removeItem(item:string){this.items=this.items.filter(v=>v!==item)}get removable(){return this.hasAttribute('removable')}set removable(v:boolean){this.toggleAttribute('removable',v)}get theme(){return(this.getAttribute('theme')??'dark') as Tag.Types.Theme}set theme(v:Tag.Types.Theme){this.setAttribute('theme',v)}}
export default Tag;export type TagOptions=Tag.Interfaces.Options;
