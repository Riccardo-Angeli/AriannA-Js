/**
 * @module components/graphics/2D/LayersPanel
 * @description Generic declarative Layers/LayersPanel. The component never seeds demo layers.
 * Markup is supplied by the application, e.g.:
 * <arianna-layers><arianna-layer name="Layer" visible="true">content</arianna-layer></arianna-layers>.
 */
import { Component, Css, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace LayersPanel
{
    export namespace Types
    {
        export type LayerType='layer'|'group'|'path'|'text'|'image'|'shape';
    }

    export namespace Interfaces
    {
        export interface Layer
        {
            id:string;
            name:string;
            visible?:boolean;
            selected?:boolean;
            locked?:boolean;
            color?:string;
            type?:Types.LayerType;
            children?:Layer[];
            expanded?:boolean;
            opacity?:number;
            content?:string;
        }
        export interface FlatLayer extends Layer{depth:number;}
    }

    interface State
    {
        layers:Interfaces.Layer[];
        selected:string|null;
        source:Map<string,HTMLElement>;
    }

    const States=new WeakMap<HTMLElement,State>();
    const S=(host:HTMLElement):State=>
    {
        let state=States.get(host);
        if(!state)
        {
            state={layers:[],selected:null,source:new Map()};
            States.set(host,state);
        }
        return state;
    };

    const BoolAttr=(element:Element,name:string,fallback:boolean):boolean=>
    {
        if(!element.hasAttribute(name))return fallback;
        const value=(element.getAttribute(name)??'').trim().toLowerCase();
        return value!==''?value!=='false'&&value!=='0'&&value!=='no':true;
    };

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-layers,arianna-layers-panel,.LayersPanel',{Background:'#292d31',Border:'1px solid #111417',BorderRadius:'5px',BoxSizing:'border-box',Color:'#e2e6e9',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Overflow:'hidden',Width:'330px'}),
        new Css.Rule('arianna-layers arianna-layer,arianna-layers-panel arianna-layer',{Display:'none'}),
        new Css.Rule('.LayersPanel-Header',{AlignItems:'center',Background:'linear-gradient(180deg,#3a3f44,#2b3034)',BorderBottom:'1px solid #111417',Display:'flex',FontSize:'11px',FontWeight:'800',JustifyContent:'space-between',Padding:'8px 10px'}),
        new Css.Rule('.LayersPanel-List',{MaxHeight:'390px',Overflow:'auto',Padding:'3px 0'}),
        new Css.Rule('.LayersPanel-Empty',{Color:'#8f98a2',FontSize:'10px',Padding:'16px 12px',TextAlign:'center'}),
        new Css.Rule('.LayersPanel-Row',{AlignItems:'center',BorderBottom:'1px solid rgba(255,255,255,.035)',Cursor:'default',Display:'grid',Gap:'5px',GridTemplateColumns:'18px 12px 5px minmax(0,1fr) 18px 18px',MinHeight:'27px',Padding:'0 6px 0 calc(6px + var(--depth)*15px)'}),
        new Css.Rule('.LayersPanel-Row[data-selected="true"]',{Background:'#3f596f'}),
        new Css.Rule('.LayersPanel-Eye,.LayersPanel-Lock,.LayersPanel-Toggle',{Appearance:'none',Background:'transparent',Border:'0',Color:'#aeb6bd',Cursor:'pointer',Font:'10px/1 system-ui',Padding:'0'}),
        new Css.Rule('.LayersPanel-Color',{Background:'var(--layer-color)',Height:'18px',Width:'3px'}),
        new Css.Rule('.LayersPanel-Name',{FontSize:'9px',Overflow:'hidden',TextOverflow:'ellipsis',WhiteSpace:'nowrap'}),
        new Css.Rule('.LayersPanel-Target',{Border:'1px solid #8d969e',BorderRadius:'50%',Height:'7px',Width:'7px'}),
        new Css.Rule('.LayersPanel-Footer',{AlignItems:'center',Background:'#24282c',BorderTop:'1px solid #111417',Display:'flex',Gap:'5px',JustifyContent:'flex-end',Padding:'6px'}),
        new Css.Rule('.LayersPanel-Action',{Appearance:'none',Background:'linear-gradient(180deg,#40464b,#2d3236)',Border:'1px solid #15181a',BorderRadius:'3px',Color:'#cbd1d5',Cursor:'pointer',Font:'700 9px/1 system-ui',Height:'25px',MinWidth:'28px'}),
        new Css.Rule('arianna-layers[theme="light"],arianna-layers-panel[theme="light"],.LayersPanel[theme="light"]',{Background:'#f1f3f4',BorderColor:'#b9bec3',Color:'#30363b'}),
        new Css.Rule('arianna-layers[theme="light"] .LayersPanel-Header,arianna-layers-panel[theme="light"] .LayersPanel-Header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-layers[theme="light"] .LayersPanel-Row[data-selected="true"],arianna-layers-panel[theme="light"] .LayersPanel-Row[data-selected="true"]',{Background:'#cfe5f7'}),
        new Css.Rule('arianna-layers[theme="light"] .LayersPanel-Footer,arianna-layers-panel[theme="light"] .LayersPanel-Footer',{Background:'#e5e8ea',BorderTopColor:'#b9bec3'}),
    ]);

    @Component('arianna-layer',{}, {
        Shadow:false,
        Attributes:['name','visible','selected','locked','color','type','expanded','opacity']
    })
    export class Layer extends HTMLElement
    {
        public template=html``;
        public get name():string{return this.getAttribute('name')||this.id||'Layer';}
        public set name(value:string){this.setAttribute('name',value);}
        public get visible():boolean{return BoolAttr(this,'visible',true);}
        public set visible(value:boolean){this.setAttribute('visible',String(value));}
        public get selected():boolean{return BoolAttr(this,'selected',false);}
        public set selected(value:boolean){this.setAttribute('selected',String(value));}
        public get locked():boolean{return BoolAttr(this,'locked',false);}
        public set locked(value:boolean){this.setAttribute('locked',String(value));}
        public get opacity():number{const n=Number(this.getAttribute('opacity')??1);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;}
        public set opacity(value:number){this.setAttribute('opacity',String(Math.max(0,Math.min(1,value))));}
        public get content():string{return this.innerHTML;}
        public set content(value:string){this.innerHTML=value;}
    }

    export class LayersBase extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            this.classList.add('LayersPanel');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            this.refreshFromMarkup(false);
            this.Render();
        }
        public onAttributeChanged(name?:string):void{if(this.isConnected&&name==='theme')this.Render();}

        public get layers():Interfaces.Layer[]{return structuredClone(S(this).layers);}
        public set layers(value:Interfaces.Layer[])
        {
            const state=S(this);state.layers=Array.isArray(value)?structuredClone(value):[];
            const selected=this.Flat(state.layers).find(layer=>layer.selected)?.id??null;state.selected=selected;
            if(this.isConnected)this.Render();
        }
        public setLayers(value:Interfaces.Layer[]):this{this.layers=value;return this;}
        public getLayers():Interfaces.Layer[]{return this.layers;}
        public getSelected():string|null{return S(this).selected;}

        public refreshFromMarkup(render=true):this
        {
            const state=S(this),source=new Map<string,HTMLElement>();let counter=0;
            const read=(parent:Element):Interfaces.Layer[]=>
            {
                const result:Interfaces.Layer[]=[];
                const children=Array.from(parent.children).filter(child=>child.localName==='arianna-layer') as HTMLElement[];
                for(const element of children)
                {
                    const id=element.id||element.getAttribute('id')||`layer-${++counter}`;
                    if(!element.id)element.id=id;
                    const selected=BoolAttr(element,'selected',false);
                    const layer:Interfaces.Layer={
                        id,
                        name:element.getAttribute('name')||id,
                        visible:BoolAttr(element,'visible',true),
                        selected,
                        locked:BoolAttr(element,'locked',false),
                        color:element.getAttribute('color')||'#e40c88',
                        type:(element.getAttribute('type') as Types.LayerType|null)??'layer',
                        expanded:BoolAttr(element,'expanded',true),
                        opacity:Math.max(0,Math.min(1,Number(element.getAttribute('opacity')??1)||0)),
                        content:element.innerHTML,
                    };
                    const nested=read(element);if(nested.length)layer.children=nested;
                    source.set(id,element);if(selected)state.selected=id;result.push(layer);
                }
                return result;
            };
            const markup=read(this);
            if(markup.length||Array.from(this.children).some(child=>child.localName==='arianna-layer'))state.layers=markup;
            state.source=source;
            if(state.selected&&!this.Find(state.selected))state.selected=null;
            if(!state.selected)state.selected=this.Flat(state.layers).find(layer=>layer.selected)?.id??null;
            if(render&&this.isConnected)this.Render();
            return this;
        }

        public selectLayer(id:string):this
        {
            if(!this.Find(id))return this;
            const state=S(this);state.selected=id;
            for(const [sourceId,element] of state.source)element.setAttribute('selected',String(sourceId===id));
            this.Render();this.Fire('select',{id});return this;
        }
        public addLayer(partial:Partial<Interfaces.Layer>):Interfaces.Layer
        {
            const state=S(this),id=partial.id||`layer-${Date.now()}`;
            const layer:Interfaces.Layer={id,name:partial.name||'Layer',visible:partial.visible??true,selected:true,locked:partial.locked??false,color:partial.color||'#e40c88',type:partial.type||'layer',children:partial.children?structuredClone(partial.children):undefined,expanded:partial.expanded??true,opacity:partial.opacity??1,content:partial.content??''};
            state.layers.push(layer);state.selected=id;this.Render();this.Fire('add',{layer:structuredClone(layer)});return layer;
        }
        public removeLayer(id:string):this
        {
            const state=S(this);state.layers=this.Remove(id,state.layers);state.source.get(id)?.remove();state.source.delete(id);if(state.selected===id)state.selected=null;this.Render();this.Fire('remove',{id});return this;
        }
        public toggleVisibility(id:string):this{const layer=this.Find(id);if(layer){layer.visible=layer.visible===false;this.SyncSource(id,'visible',String(layer.visible));this.Render();this.Fire('visibility',{id,visible:layer.visible});}return this;}
        public toggleLock(id:string):this{const layer=this.Find(id);if(layer){layer.locked=!layer.locked;this.SyncSource(id,'locked',String(!!layer.locked));this.Render();this.Fire('lock',{id,locked:layer.locked});}return this;}
        public toggleExpand(id:string):this{const layer=this.Find(id);if(layer){layer.expanded=!layer.expanded;this.SyncSource(id,'expanded',String(layer.expanded!==false));this.Render();}return this;}
        public setName(id:string,name:string):this{const layer=this.Find(id);if(layer){layer.name=name;this.SyncSource(id,'name',name);this.Render();this.Fire('rename',{id,name});}return this;}
        public setOpacity(id:string,opacity:number):this{const layer=this.Find(id);if(layer){layer.opacity=Math.max(0,Math.min(1,opacity));this.SyncSource(id,'opacity',String(layer.opacity));this.Fire('opacity',{id,opacity:layer.opacity});}return this;}
        public moveLayer(id:string,dir:-1|1):this
        {
            const layers=S(this).layers,index=layers.findIndex(layer=>layer.id===id),next=index+dir;
            if(index>=0&&next>=0&&next<layers.length){[layers[index],layers[next]]=[layers[next],layers[index]];this.Render();this.Fire('move',{id,dir});}
            return this;
        }

        private SyncSource(id:string,name:string,value:string):void{S(this).source.get(id)?.setAttribute(name,value);}
        private Find(id:string,items?:Interfaces.Layer[]):Interfaces.Layer|undefined
        {
            for(const layer of items??S(this).layers){if(layer.id===id)return layer;if(layer.children){const found=this.Find(id,layer.children);if(found)return found;}}
            return undefined;
        }
        private Remove(id:string,items:Interfaces.Layer[]):Interfaces.Layer[]{return items.filter(layer=>layer.id!==id).map(layer=>({...layer,children:layer.children?this.Remove(id,layer.children):undefined}));}
        private Flat(items:Interfaces.Layer[],depth=0,out:Interfaces.FlatLayer[]=[]):Interfaces.FlatLayer[]{for(const layer of items){out.push({...layer,depth});if(layer.children&&layer.expanded!==false)this.Flat(layer.children,depth+1,out);}return out;}
        private Fire(kind:string,detail:Record<string,unknown>):void{this.dispatchEvent(new CustomEvent('arianna:layers-change',{bubbles:true,composed:true,detail:{kind,...detail,layers:this.getLayers(),source:this}}));}

        private Render():void
        {
            const state=S(this);this.querySelector(':scope > [data-arianna-layers-ui]')?.remove();
            const root=document.createElement('section');root.dataset.ariannaLayersUi='true';
            const head=document.createElement('header');head.className='LayersPanel-Header';head.innerHTML='<span>Layers</span><span>≡</span>';
            const list=document.createElement('div');list.className='LayersPanel-List';
            const flat=this.Flat(state.layers);
            if(!flat.length){const empty=document.createElement('div');empty.className='LayersPanel-Empty';empty.textContent='No layers';list.appendChild(empty);}
            for(const layer of flat)
            {
                const row=document.createElement('div');row.className='LayersPanel-Row';row.style.setProperty('--depth',String(layer.depth));row.dataset.selected=String(layer.id===state.selected);row.onclick=()=>this.selectLayer(layer.id);
                const eye=document.createElement('button');eye.type='button';eye.className='LayersPanel-Eye';eye.textContent=layer.visible===false?'○':'◉';eye.onclick=event=>{event.stopPropagation();this.toggleVisibility(layer.id);};
                const toggle=document.createElement('button');toggle.type='button';toggle.className='LayersPanel-Toggle';toggle.textContent=layer.children?.length?(layer.expanded===false?'›':'⌄'):'';toggle.onclick=event=>{event.stopPropagation();this.toggleExpand(layer.id);};
                const color=document.createElement('span');color.className='LayersPanel-Color';color.style.setProperty('--layer-color',layer.color||'#e40c88');
                const name=document.createElement('span');name.className='LayersPanel-Name';name.textContent=layer.name;name.ondblclick=event=>{event.stopPropagation();const next=prompt('Layer name',layer.name);if(next)this.setName(layer.id,next);};
                const lock=document.createElement('button');lock.type='button';lock.className='LayersPanel-Lock';lock.textContent=layer.locked?'🔒':'·';lock.onclick=event=>{event.stopPropagation();this.toggleLock(layer.id);};
                const target=document.createElement('span');target.className='LayersPanel-Target';row.append(eye,toggle,color,name,lock,target);list.appendChild(row);
            }
            const foot=document.createElement('footer');foot.className='LayersPanel-Footer';
            const action=(label:string,fn:()=>void)=>{const button=document.createElement('button');button.type='button';button.className='LayersPanel-Action';button.textContent=label;button.onclick=fn;foot.appendChild(button);};
            action('+',()=>{this.addLayer({});});action('↑',()=>{if(state.selected)this.moveLayer(state.selected,-1);});action('↓',()=>{if(state.selected)this.moveLayer(state.selected,1);});action('⌫',()=>{if(state.selected)this.removeLayer(state.selected);});
            root.append(head,list,foot);this.appendChild(root);
        }
    }

    @Component('arianna-layers',Styles,{Shadow:false,Attributes:['theme'],Properties:['layers']})
    export class Layers extends LayersBase {}

    /** Backward-compatible alias. New markup should use <arianna-layers>. */
    @Component('arianna-layers-panel',Styles,{Shadow:false,Attributes:['theme'],Properties:['layers']})
    export class LayersPanel extends LayersBase {}
}

export type LayerModel=LayersPanel.Interfaces.Layer;
export type Layer=LayersPanel.Interfaces.Layer;
export const LayerComponent=LayersPanel.Layer;
export const LayersComponent=LayersPanel.Layers;
export const LayersPanelComponent=LayersPanel.LayersPanel;
export default LayersPanel.Layers;
