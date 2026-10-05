/**
 * @module components/graphics/3D/MaterialsEditor3D
 * @description Material editor bound to a caller-owned Canvas3D mesh.
 */
import { Component, Css, Templates } from '../../../../core/index.ts';
import type { Canvas3D as Canvas3DNamespace } from '../Canvas3D.ts';
const html=Templates.Template.Html;

export namespace MaterialsEditor3D
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
            texture?:{data:string;repeatX?:number;repeatY?:number};
            maps?:Record<string,{assetId:string;tiling?:{repeatX:number;repeatY:number;offsetX:number;offsetY:number;rotation:number;wrap:'repeat'|'mirror'|'clamp'}}>;
            materialX?:string;warnings?:string[];
        }
        export interface MaterialsEditor3DOptions
        {
            kind?:Types.MaterialKind;material?:MaterialDef;theme?:'dark'|'light';viewport?:string;for?:string;
        }
    }

    interface CanvasHost extends HTMLElement
    {
        findMesh?(id:string):Canvas3DNamespace.Mesh3|null;
        getMeshes?():ReadonlyArray<Canvas3DNamespace.Mesh3>;
        invalidate?():void;
        selectionSurface?:HTMLElement;
        rayFromClient?(x:number,y:number):{origin:Vec3;direction:Vec3};
        localToWorld?(point:Vec3,mesh:Canvas3DNamespace.Mesh3):Vec3;
    }
    type Vec3={x:number;y:number;z:number};
    interface State
    {
        material:Interfaces.MaterialDef;viewport:CanvasHost|null;target:Canvas3DNamespace.Mesh3|null;syncingKind:boolean;dropCleanup?:()=>void;explicitTarget?:boolean;
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
    const clone=(value:Interfaces.MaterialDef):Interfaces.MaterialDef=>structuredClone(value);
    const States=new WeakMap<HTMLElement,State>();
    const S=(host:HTMLElement):State=>
    {
        let state=States.get(host);
        if(!state){state={material:clone(Defaults.standard),viewport:null,target:null,syncingKind:false};States.set(host,state);}
        return state;
    };

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-materials-editor-3d,.MaterialsEditor3D',{Background:'#292d31',Border:'1px solid #111417',BorderRadius:'8px',BoxSizing:'border-box',Color:'#e4e8eb',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Overflow:'hidden',Width:'350px',MinWidth:'270px',Height:'620px',MinHeight:'340px',Resize:'both'}),
        new Css.Rule('.MaterialsEditor3D-Header',{Background:'linear-gradient(180deg,#3a3f44,#2b3034)',BorderBottom:'1px solid #111417',Cursor:'move',UserSelect:'none',TouchAction:'none',FontSize:'11px',FontWeight:'800',Padding:'8px 10px'}),
        new Css.Rule('.MaterialsEditor3D-Body',{Display:'grid',Gap:'8px',Padding:'10px',Overflow:'auto',MinHeight:'0',AlignContent:'start',GridAutoRows:'max-content'}),
        new Css.Rule('.MaterialsEditor3D>section',{Display:'grid',GridTemplateRows:'auto minmax(0,1fr)',Height:'100%'}),
        new Css.Rule('.MaterialsEditor3D-Samples',{Display:'grid',GridTemplateColumns:'repeat(3,minmax(0,1fr))',Gap:'3px',AlignItems:'start',AlignSelf:'start'}),
        new Css.Rule('.MaterialsEditor3D-Sample',{Display:'flex',AlignItems:'center',JustifyContent:'center',AspectRatio:'1 / 1',Width:'100%',Height:'auto',MinHeight:'0',MinWidth:'0',BoxSizing:'border-box',AlignSelf:'start',Overflow:'hidden',Padding:'7px',Background:'radial-gradient(circle at 45% 35%,#62666b,#171b20)',Border:'1px solid #646b73',BorderRadius:'4px',Cursor:'pointer'}),
        new Css.Rule('.MaterialsEditor3D-Sample[aria-pressed="true"]',{BorderColor:'#ff6dbd',BoxShadow:'inset 0 0 0 1px #e40c88'}),
        new Css.Rule('.MaterialsEditor3D-Sample .MaterialsEditor3D-Sphere',{Width:'100%',Height:'auto',MinHeight:'0',Flex:'0 0 auto',BoxSizing:'border-box',AspectRatio:'1 / 1',PointerEvents:'auto'}),
        new Css.Rule('.MaterialsEditor3D-Section summary,.MaterialsEditor3D-SlotName',{Padding:'7px 9px',Background:'linear-gradient(180deg,#41484e,#292f35)',Border:'1px solid #171b20',BorderRadius:'4px',Cursor:'pointer',FontSize:'11px'}),
        new Css.Rule('.MaterialsEditor3D-Parameters',{Display:'grid',Gap:'7px',Padding:'9px'}),
        new Css.Rule('.MaterialsEditor3D[theme="light"] summary,.MaterialsEditor3D[theme="light"] .MaterialsEditor3D-SlotName',{Background:'linear-gradient(180deg,#fff,#dde2e6)',BorderColor:'#b8c0c8',Color:'#25292d'}),
        new Css.Rule('.MaterialsEditor3D[theme="light"] .MaterialsEditor3D-Label,.MaterialsEditor3D[theme="light"] .MaterialsEditor3D-Value',{Color:'#404b55'}),
        new Css.Rule('.MaterialsEditor3D-Preview',{AlignItems:'center',Background:'radial-gradient(circle at 42% 36%,#5b6167,#171b1e 65%)',Border:'1px solid #111417',BorderRadius:'4px',Display:'flex',Height:'140px',JustifyContent:'center'}),
        new Css.Rule('.MaterialsEditor3D-Sphere',{Background:'radial-gradient(circle at 35% 30%,#fff 0 2%,var(--material-color) 16%,var(--material-emissive) 42%,#15191d 78%)',BorderRadius:'50%',BoxShadow:'0 16px 28px rgba(0,0,0,.4)',Height:'92px',Opacity:'var(--material-opacity)',Width:'92px'}),
        new Css.Rule('.MaterialsEditor3D-Sphere[data-wireframe="true"]',{Background:'repeating-radial-gradient(circle at 35% 30%,transparent 0 7px,var(--material-color) 8px 9px)',Border:'1px solid var(--material-color)'}),
        new Css.Rule('.MaterialsEditor3D-Row',{AlignItems:'center',Display:'grid',Gap:'7px',GridTemplateColumns:'82px minmax(0,1fr) 42px'}),
        new Css.Rule('.MaterialsEditor3D-Row[data-simple="true"]',{GridTemplateColumns:'82px minmax(0,1fr)'}),
        new Css.Rule('.MaterialsEditor3D-Label',{Color:'#9aa2a9',FontSize:'9px'}),
        new Css.Rule('.MaterialsEditor3D-Input',{AccentColor:'#e40c88',Background:'#181c20',Border:'1px solid #3b4147',BorderRadius:'3px',BoxSizing:'border-box',Color:'#e5e8ea',Font:'9px system-ui',MinWidth:'0',Padding:'6px',Width:'100%'}),
        new Css.Rule('.MaterialsEditor3D-Value',{Color:'#aeb6bd',Font:'9px ui-monospace,monospace',TextAlign:'right'}),
        new Css.Rule('arianna-materials-editor-3d[theme="light"],.MaterialsEditor3D[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('arianna-materials-editor-3d[theme="light"] .MaterialsEditor3D-Header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-materials-editor-3d[theme="light"] .MaterialsEditor3D-Preview',{Background:'radial-gradient(circle at 42% 36%,#fff,#d4d8dc 70%)',BorderColor:'#bec4c9'}),
        new Css.Rule('arianna-materials-editor-3d[theme="light"] .MaterialsEditor3D-Input',{Background:'#fff',BorderColor:'#c1c6cb',Color:'#30363b'}),
    ]);

    @Component('arianna-materials-editor-3d',Styles,{Shadow:false,Attributes:['theme','kind','viewport','for'],Properties:['material']})
    export class MaterialsEditor3D extends HTMLElement
    {
        public static readonly Styles=Styles;public template=html``;
        private slotIndex=0;
        private slots:Interfaces.MaterialDef[]=Array.from({length:6},()=>clone(Defaults.standard));
        private sections=new Map<string,boolean>();
        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            this.classList.add('MaterialsEditor3D');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            const kind=this.getAttribute('kind') as Types.MaterialKind|null;if(kind&&Defaults[kind]&&S(this).material.kind!==kind)S(this).material=clone(Defaults[kind]);
            this.Render();queueMicrotask(()=>{if(this.isConnected)this.Apply();});
        }
        public onAttributeChanged(name:string):void
        {
            if(!this.isConnected)return;const state=S(this);
            if(name==='kind'&&!state.syncingKind){const kind=this.getAttribute('kind') as Types.MaterialKind;if(Defaults[kind])state.material=clone(Defaults[kind]);this.Render();this.Apply();}
            else if(name==='viewport'||name==='for'){state.explicitTarget=false;queueMicrotask(()=>{if(this.isConnected)this.Apply();});}
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
        public onUnmount():void{const state=S(this);state.dropCleanup?.();state.viewport=null;state.target=null;state.explicitTarget=false;}
        public bind(viewport:CanvasHost|null,target?:Canvas3DNamespace.Mesh3|string|null):this
        {
            const state=S(this);state.viewport=viewport;
            state.target=typeof target==='string'?viewport?.findMesh?.(target)??null:target??this.ResolveTarget(viewport);
            state.explicitTarget=!!state.target;this.Apply();return this;
        }
        public setKind(kind:Types.MaterialKind):this
        {
            if(!Defaults[kind])return this;const state=S(this);state.material=clone(Defaults[kind]);state.syncingKind=true;this.setAttribute('kind',kind);state.syncingKind=false;this.Render();this.Apply();this.Fire();return this;
        }
        public setParam(param:keyof Interfaces.MaterialDef,value:string|number|boolean):this
        {
            (S(this).material as unknown as Record<string,unknown>)[param]=value;this.SyncPreview();this.Apply();this.Fire();return this;
        }
        public refreshUI():void{this.Render();}
        public setDragViewport(viewport:CanvasHost|null):void{S(this).viewport=viewport;}
        public library:{addMaterial(material:Interfaces.MaterialDef,name?:string):unknown}|null=null;
        public saveToLibrary(name='Material'):unknown{if(!this.library)throw new Error('Bind a MaterialsLibrary3D first');return this.library.addMaterial(this.material,name);}
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
            const meshes=state.viewport?.getMeshes?.();
            if(state.explicitTarget&&meshes&&!meshes.includes(state.target!)){state.target=null;state.explicitTarget=false;return;}
            if(!state.explicitTarget){const target=this.ResolveTarget(state.viewport);if(target)state.target=target;}if(!state.target)return;
            state.target.userData.material=clone(state.material);state.viewport?.invalidate?.();
        }
        private Fire():void
        {
            this.dispatchEvent(new CustomEvent('arianna:material-change',{bubbles:true,composed:true,detail:{material:this.material,target:S(this).target,source:this}}));
        }
        private SyncPreview():void
        {
            const material=S(this).material;this.style.setProperty('--material-color',material.color||'#7d87a3');this.style.setProperty('--material-emissive',material.emissive||'#000000');this.style.setProperty('--material-opacity',String(material.opacity??1));
            this.slots[this.slotIndex]=clone(material);const sphere=this.querySelector<HTMLElement>('.MaterialsEditor3D-Sphere[data-active="true"]');if(sphere){sphere.dataset.wireframe=String(Boolean(material.wireframe||material.kind==='wireframe'));sphere.style.setProperty('--material-color',material.color);sphere.style.setProperty('--material-emissive',material.emissive||'#000000');sphere.style.setProperty('--material-opacity',String(material.opacity??1));}
        }
        private Render():void
        {
            if(!this.isConnected)return;S(this).dropCleanup?.();const material=S(this).material,root=document.createElement('section'),head=document.createElement('header');head.className='MaterialsEditor3D-Header';head.textContent='MaterialsEditor3D';
            const body=document.createElement('div');body.className='MaterialsEditor3D-Body';
            this.slots[this.slotIndex]=clone(material);
            const gallery=document.createElement('div');gallery.className='MaterialsEditor3D-Samples';
            this.slots.forEach((sample,index)=>{const cell=document.createElement('button');cell.type='button';cell.className='MaterialsEditor3D-Sample';cell.setAttribute('aria-label','Material slot '+(index+1));cell.setAttribute('aria-pressed',String(index===this.slotIndex));const sphere=document.createElement('div');sphere.className='MaterialsEditor3D-Sphere';sphere.dataset.active=String(index===this.slotIndex);sphere.style.setProperty('--material-color',sample.color);sphere.style.setProperty('--material-emissive',sample.emissive||'#000000');sphere.style.setProperty('--material-opacity',String(sample.opacity??1));this.attachMaterialDrag(sphere,()=>index===this.slotIndex?this.material:clone(this.slots[index]));cell.appendChild(sphere);cell.onclick=()=>{if(index===this.slotIndex)return;this.slots[this.slotIndex]=this.material;const next=clone(this.slots[index]);this.slotIndex=index;this.material=next;};gallery.appendChild(cell);});body.appendChild(gallery);
            const slotLabel=document.createElement('div');slotLabel.textContent='Material '+String(this.slotIndex+1).padStart(2,'0');slotLabel.className='MaterialsEditor3D-SlotName';body.appendChild(slotLabel);
            const section=(name:string,opened=true)=>{const d=document.createElement('details');d.open=this.sections.get(name)??opened;d.className='MaterialsEditor3D-Section';const title=document.createElement('summary');title.textContent=name;d.appendChild(title);d.ontoggle=()=>this.sections.set(name,d.open);const content=document.createElement('div');content.className='MaterialsEditor3D-Parameters';d.appendChild(content);body.appendChild(d);return content;};
            let parameters=section('Shader');
            const row=(label:string,input:HTMLElement,value?:HTMLElement)=>{const wrapper=document.createElement('label');wrapper.className='MaterialsEditor3D-Row';wrapper.dataset.simple=String(!value);const text=document.createElement('span');text.className='MaterialsEditor3D-Label';text.textContent=label;wrapper.append(text,input);if(value)wrapper.appendChild(value);parameters.appendChild(wrapper);};
            const kind=document.createElement('select');kind.className='MaterialsEditor3D-Input';for(const key of Object.keys(Defaults) as Types.MaterialKind[]){const option=document.createElement('option');option.value=key;option.textContent=key;option.selected=key===material.kind;kind.appendChild(option);}kind.onchange=()=>this.setKind(kind.value as Types.MaterialKind);row('Shader',kind);
            parameters=section('Surface parameters');
            const color=(key:'color'|'emissive',label:string)=>{const input=document.createElement('input');input.className='MaterialsEditor3D-Input';input.type='color';input.value=String(material[key]??(key==='color'?'#7d87a3':'#000000'));input.oninput=()=>this.setParam(key,input.value);row(label,input);};color('color','Base color');color('emissive','Emissive');
            for(const [key,label] of [['roughness','Roughness'],['metalness','Metalness'],['opacity','Opacity']] as [keyof Interfaces.MaterialDef,string][]){const input=document.createElement('input'),value=document.createElement('output');input.className='MaterialsEditor3D-Input';input.type='range';input.min='0';input.max='1';input.step='.01';input.value=String(Number(material[key]??(key==='opacity'?1:0)));value.className='MaterialsEditor3D-Value';value.textContent=Number(input.value).toFixed(2);input.oninput=()=>{value.textContent=Number(input.value).toFixed(2);this.setParam(key,Number(input.value));};row(label,input,value);}
            const wire=document.createElement('input');wire.type='checkbox';wire.checked=Boolean(material.wireframe||material.kind==='wireframe');wire.onchange=()=>this.setParam('wireframe',wire.checked);row('Wireframe',wire);
            parameters=section('Maps',false);const maps=document.createElement('div');maps.textContent=Object.entries(material.maps??{}).map(([role,map])=>role+': '+map.assetId).join(' · ')||(material.texture?'Embedded base color texture':'No texture assigned. Import textures through MaterialsLibrary3D.');parameters.appendChild(maps);
            const save=document.createElement('button');save.type='button';save.textContent='Save to library';save.className='MaterialsEditor3D-Input';save.disabled=!this.library;save.onclick=()=>this.saveToLibrary();body.appendChild(save);
            this.WireDrag(head);root.append(head,body);this.replaceChildren(root);this.SyncPreview();
        }
        /** Ray-test the actual mesh, using the viewport's current camera and transforms. */
        private PickMaterialTarget(viewport:CanvasHost,x:number,y:number):Canvas3DNamespace.Mesh3|null
        {
            if(!viewport.rayFromClient||!viewport.localToWorld)return null;
            const ray=viewport.rayFromClient(x,y),sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}),
                cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}),
                dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z;
            let nearest=Infinity,target:Canvas3DNamespace.Mesh3|null=null;
            for(const mesh of viewport.getMeshes?.()??[]){
                if(!mesh.visible)continue;const {vertices,indices}=mesh.geometry;
                for(let i=0;i+2<indices.length;i+=3){
                    const va=vertices[indices[i]],vb=vertices[indices[i+1]],vc=vertices[indices[i+2]];if(!va||!vb||!vc)continue;
                    const a=viewport.localToWorld(va,mesh),b=viewport.localToWorld(vb,mesh),c=viewport.localToWorld(vc,mesh),
                        e1=sub(b,a),e2=sub(c,a),p=cross(ray.direction,e2),det=dot(e1,p);
                    if(Math.abs(det)<1e-8)continue;
                    const inv=1/det,t=sub(ray.origin,a),u=dot(t,p)*inv;if(u<0||u>1)continue;
                    const q=cross(t,e1),v=dot(ray.direction,q)*inv;if(v<0||u+v>1)continue;
                    const distance=dot(e2,q)*inv;if(distance>=0&&distance<nearest){nearest=distance;target=mesh;}
                }
            }
            return target;
        }
        public attachMaterialDrag(sphere:HTMLElement,getMaterial?:()=>Interfaces.MaterialDef):void
        {
            sphere.title='Drag material onto an object';sphere.style.cursor='grab';sphere.style.touchAction='none';sphere.style.userSelect='none';
            sphere.ondragstart=event=>event.preventDefault();
            sphere.onpointerdown=event=>{
                if(event.button!==0)return;
                const viewport=this.ResolveViewport();if(!viewport?.rayFromClient)return;
                event.preventDefault();event.stopPropagation();S(this).dropCleanup?.();
                const doc=this.ownerDocument,material=clone(getMaterial?getMaterial():this.material),id=event.pointerId,startX=event.clientX,startY=event.clientY;
                let ghost:HTMLElement|null=null,moved=false;
                const cleanup=()=>{
                    doc.removeEventListener('pointermove',move,{capture:true});doc.removeEventListener('pointerup',up,{capture:true});doc.removeEventListener('pointercancel',cancel,{capture:true});
                    doc.removeEventListener('keydown',key,{capture:true});doc.defaultView?.removeEventListener('blur',cancel);
                    sphere.removeEventListener('lostpointercapture',cancel);
                    try{if(sphere.hasPointerCapture(id))sphere.releasePointerCapture(id);}catch{}
                    ghost?.remove();sphere.style.cursor='grab';S(this).dropCleanup=undefined;
                };
                const move=(e:PointerEvent)=>{
                    if(e.pointerId!==id)return;e.preventDefault();e.stopPropagation();
                    if(!moved&&Math.hypot(e.clientX-startX,e.clientY-startY)<4)return;
                    moved=true;sphere.style.cursor='grabbing';
                    if(!ghost){ghost=doc.createElement('div');ghost.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;width:32px;height:32px;border-radius:50%;border:2px solid white;box-shadow:0 3px 12px #0008;';ghost.style.background=material.color;doc.body.appendChild(ghost);}
                    ghost.style.left=(e.clientX+12)+'px';ghost.style.top=(e.clientY+12)+'px';
                };
                const up=(e:PointerEvent)=>{
                    if(e.pointerId!==id)return;e.preventDefault();e.stopPropagation();
                    const wasMoved=moved;cleanup();if(!wasMoved||!sphere.isConnected||!viewport.isConnected)return;
                    // Reject panel/header/background drops, including overlays above the canvas.
                    const surface=viewport.selectionSurface,under=doc.elementFromPoint(e.clientX,e.clientY);
                    if(!surface||!(under===surface||surface.contains(under)))return;
                    const target=this.PickMaterialTarget(viewport,e.clientX,e.clientY);if(!target)return;
                    const state=S(this);state.viewport=viewport;state.target=target;state.explicitTarget=true;state.material=clone(material);this.SyncPreview();
                    target.userData.material=clone(material);viewport.invalidate?.();this.Fire();
                    this.dispatchEvent(new CustomEvent('arianna:material-drop',{bubbles:true,composed:true,detail:{material:clone(material),target,viewport,source:this}}));
                };
                const cancel=()=>cleanup(),key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();cleanup();}};
                S(this).dropCleanup=cleanup;
                doc.addEventListener('pointermove',move,{capture:true,passive:false});doc.addEventListener('pointerup',up,true);doc.addEventListener('pointercancel',cancel,true);
                doc.addEventListener('keydown',key,true);doc.defaultView?.addEventListener('blur',cancel);sphere.addEventListener('lostpointercapture',cancel);
                try{sphere.setPointerCapture(id);}catch{}
            };
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

export type MaterialKind=MaterialsEditor3D.Types.MaterialKind;
export type MaterialDef=MaterialsEditor3D.Interfaces.MaterialDef;
export type MaterialsEditor3DOptions=MaterialsEditor3D.Interfaces.MaterialsEditor3DOptions;
export default MaterialsEditor3D.MaterialsEditor3D;
