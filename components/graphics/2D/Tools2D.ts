/** @module components/graphics/2D/Tools2D */
import { Component, Css, Templates } from '../../../core/index.ts';

const html=Templates.Template.Html;

export namespace Tools2D {
    export namespace Interfaces {
        export interface Tool { id:string; label:string; icon?:string; shortcut?:string; disabled?:boolean; }
        /** A synchronous tool group supplied by a behaviour such as LineEditor. */
        export interface ToolSubset {
            readonly Id:string;
            readonly Label:string;
            readonly Tools:readonly Tool[];
            Active:string;
            Select(id:string,source?:Tools2D):boolean|void;
        }
        export interface Options { tools?:Tool[]; selected?:string; columns?:1|2; theme?:'dark'|'light'; }
        export interface SubsetCollection {
            Add(subset:ToolSubset):SubsetCollection;
            Remove(subset:string|ToolSubset):boolean;
            Get(id:string):ToolSubset|undefined;
            Has(id:string):boolean;
            Clear():void;
            readonly Values:ToolSubset[];
        }
    }

    const DEFAULT:Interfaces.Tool[]=[
        {id:'select',label:'Selection',icon:'↖',shortcut:'V'},
        {id:'direct',label:'Direct Selection',icon:'⌁',shortcut:'A'},
        {id:'wand',label:'Magic Wand',icon:'✦'},
        {id:'lasso',label:'Lasso',icon:'◌'},
        {id:'pen',label:'Pen',icon:'✒',shortcut:'P'},
        {id:'type',label:'Text',icon:'T',shortcut:'T'},
        {id:'line',label:'Line',icon:'╱'},
        {id:'rect',label:'Rectangle',icon:'□',shortcut:'M'},
        {id:'brush',label:'Paintbrush',icon:'╲',shortcut:'B'},
        {id:'pencil',label:'Pencil',icon:'✎'},
        {id:'eraser',label:'Eraser',icon:'▱'},
        {id:'rotate',label:'Rotate',icon:'↻',shortcut:'R'},
        {id:'scale',label:'Scale',icon:'↗',shortcut:'S'},
        {id:'width',label:'Width',icon:'↔'},
        {id:'freeform',label:'Free Transform',icon:'⌗'},
        {id:'shape-builder',label:'Shape Builder',icon:'⬡'},
        {id:'gradient',label:'Gradient',icon:'◩',shortcut:'G'},
        {id:'eyedropper',label:'Eyedropper',icon:'⌁',shortcut:'I'},
        {id:'hand',label:'Hand',icon:'✋',shortcut:'H'},
        {id:'zoom',label:'Zoom',icon:'⌕',shortcut:'Z'}
    ];

    interface State {
        base:Interfaces.Tool[];
        subsets:Map<string,Interfaces.ToolSubset>;
        selected:string;
        selecting:boolean;
        api?:Interfaces.SubsetCollection;
    }
    const States=new WeakMap<HTMLElement,State>();
    const stateOf=(host:HTMLElement):State=>{
        let state=States.get(host);
        if(!state){state={base:structuredClone(DEFAULT),subsets:new Map(),selected:host.getAttribute('selected')||'select',selecting:false};States.set(host,state);}
        return state;
    };

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-tools-2d,arianna-tools-palette,.Tools2D,.ToolsPalette',{Background:'#292d31',Border:'1px solid #111417',BorderRadius:'5px',BoxSizing:'border-box',Color:'#e5e8ea',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Overflow:'hidden',Width:'72px'}),
        new Css.Rule('.Tools2D-Grip',{Background:'linear-gradient(180deg,#3a3f44,#2b3034)',BorderBottom:'1px solid #111417',Color:'#8f979f',FontSize:'9px',Padding:'5px',TextAlign:'center'}),
        new Css.Rule('.Tools2D-Group',{BorderTop:'1px solid #171a1d',Padding:'3px 4px 4px'}),
        new Css.Rule('.Tools2D-Group:first-of-type',{BorderTop:'0'}),
        new Css.Rule('.Tools2D-Label',{Color:'#818990',Font:'700 8px/1.3 system-ui',LetterSpacing:'.05em',Overflow:'hidden',Padding:'3px 2px',TextOverflow:'ellipsis',TextTransform:'uppercase',WhiteSpace:'nowrap'}),
        new Css.Rule('.Tools2D-Grid',{Display:'grid',Gap:'1px',GridTemplateColumns:'repeat(var(--cols),1fr)'}),
        new Css.Rule('.Tools2D-Tool',{AlignItems:'center',Appearance:'none',Background:'transparent',Border:'1px solid transparent',BorderRadius:'2px',Color:'#c9cfd4',Cursor:'pointer',Display:'flex',Font:'600 14px/1 system-ui',Height:'28px',JustifyContent:'center',Padding:'0'}),
        new Css.Rule('.Tools2D-Tool:hover',{Background:'#393f44',BorderColor:'#4b5258'}),
        new Css.Rule('.Tools2D-Tool[data-selected="true"]',{Background:'linear-gradient(180deg,#ed168f,#bd0b73)',BorderColor:'#9c075f',Color:'#fff'}),
        new Css.Rule('.Tools2D-Tool:disabled',{Cursor:'not-allowed',Opacity:'.35'}),
        new Css.Rule('.Tools2D-Colors',{Height:'48px',Padding:'6px 12px 8px',Position:'relative'}),
        new Css.Rule('.Tools2D-Fill,.Tools2D-Stroke',{Border:'2px solid #d7dce0',Height:'25px',Position:'absolute',Width:'25px'}),
        new Css.Rule('.Tools2D-Fill',{Background:'#e40c88',Left:'15px',Top:'6px',ZIndex:'2'}),
        new Css.Rule('.Tools2D-Stroke',{Background:'#fff',Left:'31px',Top:'19px',ZIndex:'1'}),
        new Css.Rule('.Tools2D-Footer',{BorderTop:'1px solid #15181a',Color:'#858e96',FontSize:'9px',Padding:'6px',TextAlign:'center'}),
        new Css.Rule('arianna-tools-2d[theme="light"],arianna-tools-palette[theme="light"],.Tools2D[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Grip,arianna-tools-palette[theme="light"] .Tools2D-Grip',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Tool,arianna-tools-palette[theme="light"] .Tools2D-Tool',{Color:'#4c5359'}),
        new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Tool:hover,arianna-tools-palette[theme="light"] .Tools2D-Tool:hover',{Background:'#dfe3e6',BorderColor:'#c3c8cc'}),
        new Css.Rule('.Dockable-Frame > arianna-tools-2d .Tools2D-Grip,.Dockable-Frame > .Tools2D .Tools2D-Grip',{Display:'none'}),
        new Css.Rule('.Dockable-Frame[data-position="top"] > arianna-tools-2d > section,.Dockable-Frame[data-position="bottom"] > arianna-tools-2d > section',{Display:'flex',AlignItems:'center'}),
        new Css.Rule('.Dockable-Frame[data-position="top"] .Tools2D-Grid,.Dockable-Frame[data-position="bottom"] .Tools2D-Grid',{GridTemplateColumns:'repeat(auto-fit,minmax(30px,1fr))'}),
        new Css.Rule('.Dockable-Frame[data-position="top"] .Tools2D-Footer,.Dockable-Frame[data-position="bottom"] .Tools2D-Footer',{GridColumn:'1 / -1'}),
        new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Tool[data-selected="true"]',{Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',BorderColor:'#e40c88',Color:'#fff'}),
        new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Footer',{BorderTopColor:'#c3c8cc',Color:'#626a71'})
    
,
        new Css.Rule('.Dockable-Frame[data-position="top"] .Tools2D-Group,.Dockable-Frame[data-position="bottom"] .Tools2D-Group',{Flex:'1 1 0',MinWidth:'180px'}),
        new Css.Rule('.Dockable-Frame[data-position="top"] .Tools2D-Colors,.Dockable-Frame[data-position="bottom"] .Tools2D-Colors',{Flex:'0 0 64px'})
    ]);

    @Component('arianna-tools-2d',Styles,{Shadow:false,Attributes:['theme','selected','columns'],Properties:['tools','Subsets']})
    export class Tools2D extends HTMLElement {
        public static readonly Styles=Styles;
        public get template(){return html``;}
        constructor(options:Interfaces.Options={}){
            super();const state=stateOf(this);
            if(options.tools)state.base=structuredClone(options.tools);
            if(options.selected)state.selected=options.selected;
            if(options.columns)this.setAttribute('columns',String(options.columns));
            if(options.theme)this.setAttribute('theme',options.theme);
        }
        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onConnected():void{
            this.classList.add('Tools2D');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            if(!this.hasAttribute('columns'))this.setAttribute('columns','2');
            stateOf(this).selected=this.getAttribute('selected')||stateOf(this).selected;this.Render();
        }
        public onAttributeChanged(name:string):void{
            if(!this.isConnected)return;
            if(name==='selected'&&!stateOf(this).selecting)stateOf(this).selected=this.getAttribute('selected')||'select';
            if(name==='selected'||name==='columns')this.Render();
        }
        public get tools():Interfaces.Tool[]{return structuredClone(stateOf(this).base);}
        public set tools(value:Interfaces.Tool[]){stateOf(this).base=Array.isArray(value)?structuredClone(value):structuredClone(DEFAULT);this.Render();}
        public setTools(value:Interfaces.Tool[]):this{this.tools=value;return this;}
        public get Subsets():Interfaces.SubsetCollection{
            const state=stateOf(this);if(state.api)return state.api;const host=this;
            state.api={
                Add(subset){
                    if(!subset||typeof subset.Id!=='string'||!subset.Id.trim()||!Array.isArray(subset.Tools)||typeof subset.Select!=='function')throw new TypeError('Invalid Tools2D subset');
                    state.subsets.set(subset.Id,subset);host.Render();return this;
                },
                Remove(value){const removed=state.subsets.delete(typeof value==='string'?value:value.Id);if(removed)host.Render();return removed;},
                Get(id){return state.subsets.get(id);},
                Has(id){return state.subsets.has(id);},
                Clear(){state.subsets.clear();host.Render();},
                get Values(){return [...state.subsets.values()];}
            };return state.api;
        }
        public addSubset(subset:Interfaces.ToolSubset):this{this.Subsets.Add(subset);return this;}
        public removeSubset(subset:string|Interfaces.ToolSubset):this{this.Subsets.Remove(subset);return this;}
        public setTool(id:string):this{
            const state=stateOf(this);
            const subset=[...state.subsets.values()].find(group=>group.Tools.some(tool=>tool.id===id&&!tool.disabled));
            const base=state.base.find(tool=>tool.id===id&&!tool.disabled);
            if(!subset&&!base)return this;
            /* Direct synchronous hand-off. Events below are notifications only. */
            if(subset){const accepted=subset.Select(id,this);if(accepted===false)return this;subset.Active=id;}
            state.selected=id;state.selecting=true;this.setAttribute('selected',id);state.selecting=false;this.Render();
            const tool=subset?.Tools.find(item=>item.id===id)||base;
            this.dispatchEvent(new CustomEvent('arianna:tool',{bubbles:true,composed:true,detail:{tool,subset:subset?.Id,source:this}}));
            return this;
        }
        public getTool():string|null{return stateOf(this).selected||null;}
        private Group(label:string,tools:readonly Interfaces.Tool[]):HTMLElement{
            const state=stateOf(this),group=document.createElement('section');group.className='Tools2D-Group';
            if(label){const title=document.createElement('div');title.className='Tools2D-Label';title.textContent=label;group.appendChild(title);}
            const grid=document.createElement('div');grid.className='Tools2D-Grid';
            for(const tool of tools){const button=document.createElement('button');button.type='button';button.className='Tools2D-Tool';button.dataset.selected=String(tool.id===state.selected);button.textContent=tool.icon||tool.label[0];button.title=tool.label+(tool.shortcut?` (${tool.shortcut})`:'');button.disabled=!!tool.disabled;button.onclick=()=>this.setTool(tool.id);grid.appendChild(button);}
            group.appendChild(grid);return group;
        }
        private Render():void{
            const state=stateOf(this);this.style.setProperty('--cols',this.getAttribute('columns')==='1'?'1':'2');
            const root=document.createElement('section'),grip=document.createElement('div');grip.className='Tools2D-Grip';grip.textContent='•••';root.appendChild(grip);
            const subsetIds=new Set([...state.subsets.values()].flatMap(subset=>subset.Tools.map(tool=>tool.id)));
            root.appendChild(this.Group('',state.base.filter(tool=>!subsetIds.has(tool.id))));
            for(const subset of state.subsets.values())root.appendChild(this.Group(subset.Label,subset.Tools));
            const colors=document.createElement('div');colors.className='Tools2D-Colors';colors.innerHTML='<span class="Tools2D-Fill"></span><span class="Tools2D-Stroke"></span>';
            const footer=document.createElement('div');footer.className='Tools2D-Footer';footer.textContent='◫  ⛶';
            root.append(colors,footer);this.replaceChildren(root);
        }
    }

    /** Backward-compatible markup alias. */
    @Component('arianna-tools-palette',Styles,{Shadow:false,Attributes:['theme','selected','columns'],Properties:['tools','Subsets']})
    export class ToolsPalette extends Tools2D {}
}

export type Tool=Tools2D.Interfaces.Tool;
export type PaletteTool=Tools2D.Interfaces.Tool;
export type ToolSubset=Tools2D.Interfaces.ToolSubset;
export type Tools2DOptions=Tools2D.Interfaces.Options;
export type ToolsPaletteOptions=Tools2D.Interfaces.Options;
export const ToolsPalette=Tools2D.ToolsPalette;
export const Tools2DComponent=Tools2D.Tools2D;
export default Tools2D.Tools2D;
