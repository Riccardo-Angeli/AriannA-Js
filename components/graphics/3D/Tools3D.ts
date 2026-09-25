/** Minimal 3D topology selection palette. Selection remains owned by Selection3D. */
import { Component, Css, Templates } from '../../../core/index.ts';
import type { Selection3DMode } from './Selection3D.ts';
const html=Templates.Template.Html;
export namespace Tools3D
{
    export interface SelectionTarget extends EventTarget{mode:Selection3DMode;setMode(mode:Selection3DMode):unknown;}
    export interface Options{selection?:SelectionTarget;mode?:Selection3DMode;theme?:'dark'|'light';}
    const Modes:[Selection3DMode,string,string][]=[['vertex','Vertex','•'],['edge','Edge','╱'],['polygon','Polygon','△'],['face','Face','▱'],['object','Object','⬡']];
    const Targets=new WeakMap<HTMLElement,SelectionTarget|null>();
    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-tools-3d,.Tools3D',{AlignItems:'center',Background:'#292d31',Border:'1px solid #111417',BorderRadius:'6px',BoxSizing:'border-box',Display:'flex',Gap:'3px',Padding:'5px',Width:'max-content'}),
        new Css.Rule('.Tools3D-Button',{Appearance:'none',Background:'#202428',Border:'1px solid transparent',BorderRadius:'4px',Color:'#bbc2c8',Cursor:'pointer',Font:'700 10px/1 system-ui',Height:'30px',MinWidth:'48px',Padding:'0 7px'}),
        new Css.Rule('.Tools3D-Button[data-selected="true"]',{Background:'linear-gradient(180deg,#ed168f,#bd0b73)',BorderColor:'#9c075f',Color:'#fff'}),
        new Css.Rule('arianna-tools-3d[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3'}),
        new Css.Rule('arianna-tools-3d[theme="light"] .Tools3D-Button',{Background:'#fff',Color:'#4c5359'})
    ]);
    @Component('arianna-tools-3d',Styles,{Shadow:false,Attributes:['theme','mode'],Properties:['selection']})
    export class Tools3D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();if(options.theme)this.setAttribute('theme',options.theme);if(options.mode)this.setAttribute('mode',options.mode);if(options.selection)this.selection=options.selection;}
        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onConnected():void{this.classList.add('Tools3D');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(!this.hasAttribute('mode'))this.setAttribute('mode','object');this.render();}
        public onAttributeChanged(name:string):void{if(name==='mode'&&this.isConnected)this.render();}
        public get selection():SelectionTarget|null{return Targets.get(this)??null;}
        public set selection(value:SelectionTarget|null){Targets.set(this,value);if(value){this.setAttribute('mode',value.mode);value.addEventListener('arianna:selection-3d-mode',((event:CustomEvent<{mode:Selection3DMode}>)=>this.setAttribute('mode',event.detail.mode)) as EventListener);}}
        public setMode(mode:Selection3DMode):this{this.setAttribute('mode',mode);this.selection?.setMode(mode);this.dispatchEvent(new CustomEvent('arianna:tool-3d',{bubbles:true,composed:true,detail:{mode,source:this}}));return this;}
        private render():void{const mode=this.getAttribute('mode') as Selection3DMode;this.replaceChildren(...Modes.map(([id,label,icon])=>{const button=document.createElement('button');button.type='button';button.className='Tools3D-Button';button.dataset.selected=String(id===mode);button.title=label;button.textContent=`${icon} ${label}`;button.onclick=()=>this.setMode(id);return button;}));}
    }
}
export default Tools3D.Tools3D;
export type Tools3DOptions=Tools3D.Options;
