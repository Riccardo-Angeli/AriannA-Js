/**
 * @module components/graphics/3D/MaterialsPalette
 * @description Material editor bound to a caller-owned Canvas3D mesh.
 */
import { Component, Css, Templates } from '../../../core/index.ts';
import type { Canvas3D as Canvas3DNamespace } from './Canvas3D.ts';
const html=Templates.Template.Html;

export namespace MaterialsPalette
{
    export namespace Types
    {
        export type MaterialKind='basic'|'lambert'|'phong'|'standard'|'physical'|'toon'|'normal'|'wireframe';
    }
    export namespace Interfaces
    {
        export interface MaterialDef
        {
            kind:Types.MaterialKind;color:string;roughness?:number;metalness?:number;
            opacity?:number;emissive?:string;wireframe?:boolean;
        }
        export interface MaterialsPaletteOptions
        {
            kind?:Types.MaterialKind;material?:MaterialDef;theme?:'dark'|'light';viewport?:string;for?:string;
        }
    }

    interface CanvasHost extends HTMLElement
    {
        findMesh?(id:string):Canvas3DNamespace.Mesh3|null;
        getMeshes?():ReadonlyArray<Canvas3DNamespace.Mesh3>;
        invalidate?():void;
    }
    interface State
    {
        material:Interfaces.MaterialDef;viewport:CanvasHost|null;target:Canvas3DNamespace.Mesh3|null;syncingKind:boolean;
    }

    const Defaults:Record<Types.MaterialKind,Interfaces.MaterialDef>={
        basic:{kind:'basic',color:'#7d87a3',roughness:1,metalness:0,opacity:1,emissive:'#000000'},
        lambert:{kind:'lambert',color:'#7d87a3',roughness:.8,metalness:0,opacity:1,emissive:'#000000'},
        phong:{kind:'phong',color:'#7d87a3',roughness:.3,metalness:.05,opacity:1,emissive:'#000000'},
        standard:{kind:'standard',color:'#7d87a3',roughness:.45,metalness:.15,opacity:1,emissive:'#000000'},
        physical:{kind:'physical',color:'#7d87a3',roughness:.35,metalness:.35,opacity:1,emissive:'#000000'},
        toon:{kind:'toon',color:'#e40c88',roughness:.8,metalness:0,opacity:1,emissive:'#000000'},
        normal:{kind:'normal',color:'#7c68dd',roughness:.5,metalness:0,opacity:1,emissive:'#000000'},
        wireframe:{kind:'wireframe',color:'#e40c88',roughness:.5,metalness:0,wireframe:true,opacity:1,emissive:'#000000'},
    };
    const clone=(value:Interfaces.MaterialDef):Interfaces.MaterialDef=>({...value});
    const States=new WeakMap<HTMLElement,State>();
    const S=(host:HTMLElement):State=>
    {
        let state=States.get(host);
        if(!state){state={material:clone(Defaults.standard),viewport:null,target:null,syncingKind:false};States.set(host,state);}
        return state;
    };

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-materials-palette,.MaterialsPalette',{Background:'#292d31',Border:'1px solid #111417',BorderRadius:'8px',BoxSizing:'border-box',Color:'#e4e8eb',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Overflow:'hidden',Width:'300px'}),
        new Css.Rule('.MaterialsPalette-Header',{Background:'linear-gradient(180deg,#3a3f44,#2b3034)',BorderBottom:'1px solid #111417',Cursor:'move',UserSelect:'none',TouchAction:'none',FontSize:'11px',FontWeight:'800',Padding:'8px 10px'}),
        new Css.Rule('.MaterialsPalette-Body',{Display:'grid',Gap:'8px',Padding:'10px'}),
        new Css.Rule('.MaterialsPalette-Preview',{AlignItems:'center',Background:'radial-gradient(circle at 42% 36%,#5b6167,#171b1e 65%)',Border:'1px solid #111417',BorderRadius:'4px',Display:'flex',Height:'140px',JustifyContent:'center'}),
        new Css.Rule('.MaterialsPalette-Sphere',{Background:'radial-gradient(circle at 35% 30%,#fff 0 2%,var(--material-color) 16%,var(--material-emissive) 42%,#15191d 78%)',BorderRadius:'50%',BoxShadow:'0 16px 28px rgba(0,0,0,.4)',Height:'92px',Opacity:'var(--material-opacity)',Width:'92px'}),
        new Css.Rule('.MaterialsPalette-Sphere[data-wireframe="true"]',{Background:'repeating-radial-gradient(circle at 35% 30%,transparent 0 7px,var(--material-color) 8px 9px)',Border:'1px solid var(--material-color)'}),
        new Css.Rule('.MaterialsPalette-Row',{AlignItems:'center',Display:'grid',Gap:'7px',GridTemplateColumns:'82px minmax(0,1fr) 42px'}),
        new Css.Rule('.MaterialsPalette-Row[data-simple="true"]',{GridTemplateColumns:'82px minmax(0,1fr)'}),
        new Css.Rule('.MaterialsPalette-Label',{Color:'#9aa2a9',FontSize:'9px'}),
        new Css.Rule('.MaterialsPalette-Input',{AccentColor:'#e40c88',Background:'#181c20',Border:'1px solid #3b4147',BorderRadius:'3px',BoxSizing:'border-box',Color:'#e5e8ea',Font:'9px system-ui',MinWidth:'0',Padding:'6px',Width:'100%'}),
        new Css.Rule('.MaterialsPalette-Value',{Color:'#aeb6bd',Font:'9px ui-monospace,monospace',TextAlign:'right'}),
        new Css.Rule('arianna-materials-palette[theme="light"],.MaterialsPalette[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('arianna-materials-palette[theme="light"] .MaterialsPalette-Header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-materials-palette[theme="light"] .MaterialsPalette-Preview',{Background:'radial-gradient(circle at 42% 36%,#fff,#d4d8dc 70%)',BorderColor:'#bec4c9'}),
        new Css.Rule('arianna-materials-palette[theme="light"] .MaterialsPalette-Input',{Background:'#fff',BorderColor:'#c1c6cb',Color:'#30363b'}),
    ]);

    @Component('arianna-materials-palette',Styles,{Shadow:false,Attributes:['theme','kind','viewport','for'],Properties:['material']})
    export class MaterialsPalette extends HTMLElement
    {
        public static readonly Styles=Styles;public template=html``;
        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            this.classList.add('MaterialsPalette');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            const kind=this.getAttribute('kind') as Types.MaterialKind|null;if(kind&&Defaults[kind]&&S(this).material.kind!==kind)S(this).material=clone(Defaults[kind]);
            this.Render();queueMicrotask(()=>this.Apply());
        }
        public onAttributeChanged(name:string):void
        {
            if(!this.isConnected)return;const state=S(this);
            if(name==='kind'&&!state.syncingKind){const kind=this.getAttribute('kind') as Types.MaterialKind;if(Defaults[kind])state.material=clone(Defaults[kind]);this.Render();this.Apply();}
            else if(name==='viewport'||name==='for')queueMicrotask(()=>this.Apply());
            else if(name==='theme')this.Render();
        }
        public get material():Interfaces.MaterialDef{return clone(S(this).material);}
        public set material(value:Interfaces.MaterialDef)
        {
            const kind=Defaults[value?.kind]?value.kind:'standard',state=S(this);state.material={...Defaults[kind],...value,kind};
            state.syncingKind=true;this.setAttribute('kind',kind);state.syncingKind=false;this.Render();this.Apply();
        }
        public get target():Canvas3DNamespace.Mesh3|null{return S(this).target;}
        public set selection(value:{objects?:Canvas3DNamespace.Mesh3[];items?:{mesh:Canvas3DNamespace.Mesh3}[]}|null)
        {
            const mesh=value?.items?.[0]?.mesh??value?.objects?.[0];if(mesh){S(this).target=mesh;this.setAttribute('for',String(mesh.userData.id??''));this.Apply();}
        }
        public onUnmount():void{const state=S(this);state.viewport=null;state.target=null;}
        public bind(viewport:CanvasHost|null,target?:Canvas3DNamespace.Mesh3|string|null):this
        {
            const state=S(this);state.viewport=viewport;
            state.target=typeof target==='string'?viewport?.findMesh?.(target)??null:target??this.ResolveTarget(viewport);
            this.Apply();return this;
        }
        public setKind(kind:Types.MaterialKind):this
        {
            if(!Defaults[kind])return this;const state=S(this);state.material=clone(Defaults[kind]);state.syncingKind=true;this.setAttribute('kind',kind);state.syncingKind=false;this.Render();this.Apply();this.Fire();return this;
        }
        public setParam(param:keyof Interfaces.MaterialDef,value:string|number|boolean):this
        {
            (S(this).material as unknown as Record<string,unknown>)[param]=value;this.SyncPreview();this.Apply();this.Fire();return this;
        }
        public getMaterial():Interfaces.MaterialDef{return this.material;}
        public setMaterial(material:Interfaces.MaterialDef):this{this.material=material;this.Fire();return this;}
        public apply():this{this.Apply();return this;}
        public clear():this
        {
            const state=S(this),target=state.target;if(target)delete target.userData.material;state.viewport?.invalidate?.();return this;
        }
        private ResolveViewport():CanvasHost|null
        {
            const state=S(this);if(state.viewport?.isConnected)return state.viewport;
            const id=(this.getAttribute('viewport')??'').trim(),byId=id?document.getElementById(id):null;if(byId)return byId as CanvasHost;
            const ancestor=this.closest('arianna-canvas-3d');if(ancestor)return ancestor as CanvasHost;
            let sibling:Element|null=this.previousElementSibling;while(sibling){if(sibling.matches('arianna-canvas-3d'))return sibling as CanvasHost;sibling=sibling.previousElementSibling;}
            return this.parentElement?.querySelector('arianna-canvas-3d') as CanvasHost|null;
        }
        private ResolveTarget(viewport:CanvasHost|null):Canvas3DNamespace.Mesh3|null
        {
            if(!viewport)return null;const id=(this.getAttribute('for')??'').trim();if(id)return viewport.findMesh?.(id)??null;
            const meshes=viewport.getMeshes?.()??[];return meshes.length===1?meshes[0]??null:null;
        }
        private Apply():void
        {
            const state=S(this),viewport=this.ResolveViewport();if(viewport)state.viewport=viewport;
            const target=this.ResolveTarget(state.viewport);if(target)state.target=target;if(!state.target)return;
            state.target.userData.material=clone(state.material);state.viewport?.invalidate?.();
        }
        private Fire():void
        {
            this.dispatchEvent(new CustomEvent('arianna:material-change',{bubbles:true,composed:true,detail:{material:this.material,target:S(this).target,source:this}}));
        }
        private SyncPreview():void
        {
            const material=S(this).material;this.style.setProperty('--material-color',material.color||'#7d87a3');this.style.setProperty('--material-emissive',material.emissive||'#000000');this.style.setProperty('--material-opacity',String(material.opacity??1));
            const sphere=this.querySelector<HTMLElement>('.MaterialsPalette-Sphere');if(sphere)sphere.dataset.wireframe=String(Boolean(material.wireframe||material.kind==='wireframe'));
        }
        private Render():void
        {
            if(!this.isConnected)return;const material=S(this).material,root=document.createElement('section'),head=document.createElement('header');head.className='MaterialsPalette-Header';head.textContent='MaterialsPalette';
            const body=document.createElement('div');body.className='MaterialsPalette-Body';const preview=document.createElement('div');preview.className='MaterialsPalette-Preview';const sphere=document.createElement('div');sphere.className='MaterialsPalette-Sphere';preview.appendChild(sphere);body.appendChild(preview);
            const row=(label:string,input:HTMLElement,value?:HTMLElement)=>{const wrapper=document.createElement('label');wrapper.className='MaterialsPalette-Row';wrapper.dataset.simple=String(!value);const text=document.createElement('span');text.className='MaterialsPalette-Label';text.textContent=label;wrapper.append(text,input);if(value)wrapper.appendChild(value);body.appendChild(wrapper);};
            const kind=document.createElement('select');kind.className='MaterialsPalette-Input';for(const key of Object.keys(Defaults) as Types.MaterialKind[]){const option=document.createElement('option');option.value=key;option.textContent=key;option.selected=key===material.kind;kind.appendChild(option);}kind.onchange=()=>this.setKind(kind.value as Types.MaterialKind);row('Shader',kind);
            const color=(key:'color'|'emissive',label:string)=>{const input=document.createElement('input');input.className='MaterialsPalette-Input';input.type='color';input.value=String(material[key]??(key==='color'?'#7d87a3':'#000000'));input.oninput=()=>this.setParam(key,input.value);row(label,input);};color('color','Base color');color('emissive','Emissive');
            for(const [key,label] of [['roughness','Roughness'],['metalness','Metalness'],['opacity','Opacity']] as [keyof Interfaces.MaterialDef,string][]){const input=document.createElement('input'),value=document.createElement('output');input.className='MaterialsPalette-Input';input.type='range';input.min='0';input.max='1';input.step='.01';input.value=String(Number(material[key]??(key==='opacity'?1:0)));value.className='MaterialsPalette-Value';value.textContent=Number(input.value).toFixed(2);input.oninput=()=>{value.textContent=Number(input.value).toFixed(2);this.setParam(key,Number(input.value));};row(label,input,value);}
            const wire=document.createElement('input');wire.type='checkbox';wire.checked=Boolean(material.wireframe||material.kind==='wireframe');wire.onchange=()=>this.setParam('wireframe',wire.checked);row('Wireframe',wire);
            this.WireDrag(head);root.append(head,body);this.replaceChildren(root);this.SyncPreview();
        }
        private WireDrag(head:HTMLElement):void
        {
            let drag:{id:number;x:number;y:number;left:number;top:number}|null=null;
            head.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:this.offsetLeft,top:this.offsetTop};this.style.position='absolute';this.style.right='auto';this.style.left=`${drag.left}px`;this.style.top=`${drag.top}px`;head.setPointerCapture(event.pointerId);};
            head.onpointermove=event=>{if(!drag||event.pointerId!==drag.id)return;const parent=this.offsetParent as HTMLElement|null;this.style.left=`${Math.max(0,Math.min(Math.max(0,(parent?.clientWidth??Infinity)-this.offsetWidth),drag.left+event.clientX-drag.x))}px`;this.style.top=`${Math.max(0,Math.min(Math.max(0,(parent?.clientHeight??Infinity)-this.offsetHeight),drag.top+event.clientY-drag.y))}px`;};
            head.onpointerup=head.onpointercancel=event=>{if(event.pointerId===drag?.id){try{head.releasePointerCapture(event.pointerId);}catch{}drag=null;}};
        }
    }
}

export type MaterialKind=MaterialsPalette.Types.MaterialKind;
export type MaterialDef=MaterialsPalette.Interfaces.MaterialDef;
export type MaterialsPaletteOptions=MaterialsPalette.Interfaces.MaterialsPaletteOptions;
export default MaterialsPalette.MaterialsPalette;
