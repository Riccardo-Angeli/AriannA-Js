/**
 * @module components/graphics/3D/Canvas3D
 * @author Riccardo Angeli
 * @version 3.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description
 * Generic AriannA 3D viewport. Canvas3D owns only scene/camera/rendering/orbit/view
 * behavior. It NEVER seeds demo geometry. Applications and Playground examples add
 * meshes explicitly through addMesh()/scene.add().
 */
import { Component, Css, Templates } from '../../../core/index.ts';
import Selection3D, { type Selection3DMode } from './Selection3D.ts';
const html=Templates.Template.Html;
const Selections=new WeakMap<HTMLElement,InstanceType<typeof Selection3D>>();

export namespace Canvas3D
{
    export interface Vec3 { x:number; y:number; z:number; }
    export interface Geometry3 { vertices:Vec3[]; normals:Vec3[]; indices:number[];faceIds?:number[]; clone():Geometry3; }
    export interface Material3 { kind?:string;color?:string;roughness?:number;metalness?:number;opacity?:number;emissive?:string;wireframe?:boolean; }
    export interface Mesh3 { geometry:Geometry3; position:Vec3; rotation:Vec3; scale:Vec3; visible:boolean; userData:Record<string,unknown>; updateMatrix?():void; }
    export interface Scene3 { children:Mesh3[]; add(obj:Mesh3):void; remove(obj:Mesh3):void; }
    export interface Camera3 { position:Vec3; }
    export interface Ray3 { origin:Vec3;direction:Vec3; }
    export type ViewPreset='perspective'|'front'|'right'|'top';
    export interface GridOptions{enabled:boolean;x:boolean;y:boolean;z:boolean;stepX:number;stepY:number;stepZ:number;kind:'lines'|'dotted'|'polar'|'isometric';}
    export interface SnapOptions{enabled:boolean;toGrid:boolean;x:boolean;y:boolean;z:boolean;stepX:number;stepY:number;stepZ:number;}
    type GridProvider={options?:Partial<GridOptions>&{snapX?:boolean;snapY?:boolean;snapZ?:boolean;snapStepX?:number;snapStepY?:number;snapStepZ?:number};configure(options:Partial<GridOptions>&{snapX?:boolean;snapY?:boolean;snapZ?:boolean;snapStepX?:number;snapStepY?:number;snapStepZ?:number}):unknown;project?(point:Vec3):Vec3;drawOn?(ctx:CanvasRenderingContext2D,width:number,height:number,dpr:number):void};
    const Settings=new WeakMap<HTMLElement,{grid:GridOptions;snap:SnapOptions;provider:GridProvider|null;attributesInitialized:boolean}>();
    const settings=(host:HTMLElement)=>{let value=Settings.get(host);if(!value){value={grid:{enabled:true,x:false,y:true,z:false,stepX:1,stepY:1,stepZ:1,kind:'lines'},snap:{enabled:true,toGrid:true,x:true,y:true,z:true,stepX:0,stepY:0,stepZ:0},provider:null,attributesInitialized:false};Settings.set(host,value);}return value;};

    interface RuntimeState
    {
        scene:Scene3;
        camera:Camera3;
        canvas?:HTMLCanvasElement;
        ctx:CanvasRenderingContext2D|null;
        meshes:Map<string,Mesh3>;
        frameCallbacks:Set<(dt:number)=>void>;
        raf:number;
        last:number;
        resizeObserver:ResizeObserver|null;
        yaw:number;
        pitch:number;
        distance:number;
        dragging:boolean;
        px:number;
        py:number;
        started:boolean;
        wiredCanvas?:HTMLCanvasElement;
        behaviours:Set<HTMLElement>;
        controls?:AbortController;
    }

    const cloneGeometry=(g:Geometry3):Geometry3=>({vertices:g.vertices.map(v=>({...v})),normals:g.normals.map(v=>({...v})),indices:[...g.indices],faceIds:g.faceIds?[...g.faceIds]:undefined,clone(){return cloneGeometry(this);}});
    const norm=(v:Vec3):Vec3=>{const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l};};
    const sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
    const cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
    const dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z;

    const Runtime=new WeakMap<HTMLElement,RuntimeState>();
    const State=(host:HTMLElement):RuntimeState=>
    {
        let s=Runtime.get(host);
        if(!s)
        {
            const scene:Scene3={children:[],add(obj){if(!scene.children.includes(obj))scene.children.push(obj);},remove(obj){const i=scene.children.indexOf(obj);if(i>=0)scene.children.splice(i,1);}};
            s={scene,camera:{position:{x:3.5,y:2.5,z:4.5}},ctx:null,meshes:new Map(),frameCallbacks:new Set(),raf:0,last:0,resizeObserver:null,yaw:.72,pitch:.42,distance:4.6,dragging:false,px:0,py:0,started:false,behaviours:new Set()};
            Runtime.set(host,s);
        }
        return s;
    };

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-canvas-3d,.Canvas3D',{Background:'#13161a',Border:'1px solid #30363d',BorderRadius:'10px',BoxSizing:'border-box',Display:'block',Height:'520px',MaxWidth:'100%',MinHeight:'260px',MinWidth:'0',Overflow:'hidden',Position:'relative',Width:'100%'}),
        new Css.Rule('.Canvas3D-Canvas',{Cursor:'grab',Display:'block',Height:'100%',TouchAction:'none',Width:'100%'}),
        new Css.Rule('.Canvas3D-Canvas:active',{Cursor:'grabbing'}),
        new Css.Rule('.Canvas3D-Toolbar',{Color:'#e5e8ea',AlignItems:'center',BackdropFilter:'blur(12px)',Background:'rgba(26,30,35,.82)',Border:'1px solid rgba(255,255,255,.10)',BorderRadius:'7px',Display:'flex',Gap:'4px',Left:'12px',Padding:'5px',Position:'absolute',Top:'12px',ZIndex:'12',MaxWidth:'calc(100% - 24px)',OverflowX:'auto'}),
        new Css.Rule('.Canvas3D-Button',{Appearance:'none',Background:'#292e34',Border:'1px solid #454c54',BorderRadius:'5px',Color:'#c9d0d6',Cursor:'pointer',Font:'700 9px/1 system-ui',Height:'25px',Padding:'0 8px'}),
        new Css.Rule('.Canvas3D-Button[data-active="true"]',{BorderColor:'#e40c88',Color:'#fff',Background:'linear-gradient(180deg,#f344a4,#ce0879)',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004'}),
        new Css.Rule('.Canvas3D-Input',{Height:'25px',BoxSizing:'border-box',Background:'#25292d',Color:'#e5e8ea',ColorScheme:'dark',Border:'1px solid #15181a',BorderRadius:'3px'}),
        new Css.Rule('.Canvas3D[theme="light"] .Canvas3D-Toolbar',{Color:'#25292d'}),
        new Css.Rule('.Canvas3D[theme="light"] .Canvas3D-Input',{Background:'#fff',Color:'#25292d',ColorScheme:'light',BorderColor:'#b8bdc2'}),
        new Css.Rule('.Canvas3D[theme] .Canvas3D-Button[data-active="true"]',{Color:'#fff',Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)'}),
        new Css.Rule('.Canvas3D-Axes',{Bottom:'12px',Color:'#8d969e',Font:'9px ui-monospace,monospace',Position:'absolute',Right:'12px',ZIndex:'10'}),
        new Css.Rule('arianna-canvas-3d[theme="light"],.Canvas3D[theme="light"]',{Background:'#eef1f4',BorderColor:'#c4cbd1'}),
        new Css.Rule('arianna-canvas-3d[theme="light"] .Canvas3D-Toolbar',{Background:'rgba(255,255,255,.86)',BorderColor:'rgba(0,0,0,.12)'}),
        new Css.Rule('arianna-canvas-3d[theme="light"] .Canvas3D-Button',{Background:'#f4f5f6',BorderColor:'#c5cbd0',Color:'#3b4248'}),
    ]);

    @Component('arianna-canvas-3d',Styles,{Shadow:false,Attributes:['theme','color','orbit','zoom','yaw','pitch','view','show-toolbar','grid-x','grid-y','grid-z','grid-step-x','grid-step-y','grid-step-z','grid-kind','show-grid','snap','snap-to-grid','snap-x','snap-y','snap-z','snap-step-x','snap-step-y','snap-step-z'],Properties:['grid','snap']})
    export class Canvas3D extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public get scene():Scene3{return State(this).scene;}
        public get camera():Camera3{return State(this).camera;}
        public get rendersGrid():boolean{return true;}
        public get canvas():HTMLCanvasElement|undefined{return State(this).canvas;}

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            const s=State(this);
            this.classList.add('Canvas3D');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            if(!this.hasAttribute('view'))this.setAttribute('view','perspective');
            if(!settings(this).attributesInitialized){this.readGridAttributes();settings(this).attributesInitialized=true;}if(s.started){this.syncToolbar();return;}

            s.yaw=this.numberAttr('yaw',.72);s.pitch=this.numberAttr('pitch',.42);s.distance=this.numberAttr('zoom',4.6);
            this.applyView(this.getView(),false);

            const canvas=document.createElement('canvas');canvas.className='Canvas3D-Canvas';
            const toolbar=this.buildToolbar();
            const axes=document.createElement('div');axes.className='Canvas3D-Axes';axes.textContent='X · Y · Z';
            this.replaceChildren(canvas,toolbar,axes,...s.behaviours);
            s.canvas=canvas;s.ctx=canvas.getContext('2d');s.started=true;

            this.wireOrbit();
            s.resizeObserver=new ResizeObserver(()=>this.resize());s.resizeObserver.observe(this);this.resize();
            s.last=performance.now();s.raf=requestAnimationFrame(t=>this.loop(t));
            this.syncToolbar();this.buildSelectionBar();
            s.controls=new AbortController();
            this.addEventListener('arianna:toolbar-layout',event=>{
                const inset=(event as CustomEvent).detail?.insets??{top:0,bottom:0,left:0,right:0};
                toolbar.style.top=inset.top+'px';toolbar.style.left=inset.left+'px';toolbar.style.right=inset.right+'px';
                const footer=this.querySelector<HTMLElement>('.Canvas3D-TransformFooter');if(footer){footer.style.bottom=inset.bottom+'px';footer.style.left=inset.left+'px';footer.style.right=inset.right+'px';}
                const selection=this.querySelector<HTMLElement>('.Canvas3D-SelectionBar');if(selection){selection.style.bottom=(inset.bottom+42)+'px';selection.style.left=(inset.left+12)+'px';}
            },{signal:s.controls.signal});
            for(const behaviour of s.behaviours)(behaviour as HTMLElement&{attach?:(canvas:Canvas3D)=>unknown}).attach?.(this);
        }
        public onUnmount():void
        {
            this.dispatchEvent(new Event('arianna:canvas-dispose'));Selections.get(this)?.detach();Selections.delete(this);
            const s=State(this);s.controls?.abort();for(const behaviour of s.behaviours)(behaviour as HTMLElement&{detach?:()=>unknown}).detach?.();cancelAnimationFrame(s.raf);s.resizeObserver?.disconnect();s.resizeObserver=null;s.frameCallbacks.clear();s.canvas=undefined;s.ctx=null;s.wiredCanvas=undefined;s.meshes.clear();s.scene.children.length=0;s.started=false;
        }
        public onAttributeChanged(name?:string):void
        {
            this.readGridAttributes(name);const s=State(this);if(!s.started)return;
            if(name==='view')this.applyView(this.getView(),false);
            if(name==='yaw')s.yaw=this.numberAttr('yaw',s.yaw);
            if(name==='pitch')s.pitch=this.numberAttr('pitch',s.pitch);
            if(name==='zoom')s.distance=this.numberAttr('zoom',s.distance);
            this.syncToolbar();
        }

        /** Register a caller-owned mesh with this viewport. */
        public addMesh(id:string,mesh:Mesh3):Mesh3
        {
            const key=String(id||'').trim();if(!key)throw new Error('[Canvas3D] addMesh requires a non-empty id');
            const s=State(this),existing=s.meshes.get(key);if(existing&&existing!==mesh)s.scene.remove(existing);
            mesh.userData??={};mesh.userData.id=key;
            if(mesh.userData.__ariannaInitialGeometry===undefined)mesh.userData.__ariannaInitialGeometry=mesh.geometry.clone();
            if(mesh.userData.__ariannaInitialTransform===undefined)mesh.userData.__ariannaInitialTransform={position:{...mesh.position},rotation:{...mesh.rotation},scale:{...mesh.scale},visible:mesh.visible};
            s.meshes.set(key,mesh);s.scene.add(mesh);return mesh;
        }
        public removeMesh(source:string|Mesh3):this
        {
            const s=State(this),mesh=typeof source==='string'?s.meshes.get(source)??null:source;if(!mesh)return this;
            s.scene.remove(mesh);for(const [id,item] of [...s.meshes])if(item===mesh)s.meshes.delete(id);return this;
        }
        public clearMeshes():this{const s=State(this);s.scene.children.length=0;s.meshes.clear();return this;}
        public findMesh(id:string):Mesh3|null{return State(this).meshes.get(id)??null;}
        public getMeshes():ReadonlyArray<Mesh3>{return [...State(this).scene.children];}
        public cloneMesh(source:string|Mesh3):Mesh3|null
        {
            const mesh=typeof source==='string'?this.findMesh(source):source;if(!mesh)return null;
            return {geometry:mesh.geometry.clone(),position:{...mesh.position},rotation:{...mesh.rotation},scale:{...mesh.scale},visible:mesh.visible,userData:{...mesh.userData}};
        }
        public resetMesh(source:string|Mesh3):this
        {
            const mesh=typeof source==='string'?this.findMesh(source):source;if(!mesh)return this;
            const initialGeometry=mesh.userData.__ariannaInitialGeometry as Geometry3|undefined;
            const initial=mesh.userData.__ariannaInitialTransform as {position:Vec3;rotation:Vec3;scale:Vec3;visible:boolean}|undefined;
            if(initialGeometry)mesh.geometry=initialGeometry.clone();
            if(initial){mesh.position={...initial.position};mesh.rotation={...initial.rotation};mesh.scale={...initial.scale};mesh.visible=initial.visible;}
            delete mesh.userData['_arianna_opacity'];return this;
        }
        public onFrame(cb:(dt:number)=>void):()=>void{const s=State(this);s.frameCallbacks.add(cb);return()=>s.frameCallbacks.delete(cb);}
        public get grid():GridOptions{return {...settings(this).grid};}public set grid(value:Partial<GridOptions>){this.setGrid(value);}
        public get snap():SnapOptions{return {...settings(this).snap};}public set snap(value:Partial<SnapOptions>){this.setSnap(value);}
        public getGrid():GridOptions{return this.grid;}public getSnap():SnapOptions{return this.snap;}
        public setGrid(value:Partial<GridOptions>|boolean):this{const s=settings(this);if(typeof value==='boolean')s.grid.enabled=value;else Object.assign(s.grid,value);for(const key of ['stepX','stepY','stepZ'] as const)s.grid[key]=Math.max(.0001,Number(s.grid[key])||1);s.provider?.configure(s.grid);this.syncToolbar();this.dispatchEvent(new CustomEvent('arianna:grid-change',{bubbles:true,composed:true,detail:{...s.grid,source:this}}));return this;}
        public setSnap(value:Partial<SnapOptions>|boolean):this{const s=settings(this);if(typeof value==='boolean')s.snap.enabled=value;else Object.assign(s.snap,value);for(const key of ['stepX','stepY','stepZ'] as const)s.snap[key]=Math.max(0,Number(s.snap[key])||0);s.provider?.configure({snapX:s.snap.x,snapY:s.snap.y,snapZ:s.snap.z,snapStepX:s.snap.stepX,snapStepY:s.snap.stepY,snapStepZ:s.snap.stepZ});this.syncToolbar();this.dispatchEvent(new CustomEvent('arianna:snap-change',{bubbles:true,composed:true,detail:{...s.snap,source:this}}));return this;}
        public useGrid(provider:GridProvider|null):this{const s=settings(this);s.provider=provider;if(provider?.options)for(const key of ['enabled','x','y','z','stepX','stepY','stepZ','kind'] as const)if(provider.options[key]!==undefined)(s.grid as any)[key]=provider.options[key];if(provider?.options){s.snap.x=provider.options.snapX??s.snap.x;s.snap.y=provider.options.snapY??s.snap.y;s.snap.z=provider.options.snapZ??s.snap.z;s.snap.stepX=provider.options.snapStepX??s.snap.stepX;s.snap.stepY=provider.options.snapStepY??s.snap.stepY;s.snap.stepZ=provider.options.snapStepZ??s.snap.stepZ;}this.syncToolbar();return this;}
        public snapPoint(point:Vec3):Vec3{const {grid,snap,provider}=settings(this),out={...point},projected=provider?.project?.(point);if(snap.enabled&&snap.toGrid)for(const axis of ['x','y','z'] as const){const key=axis==='x'?'stepX':axis==='y'?'stepY':'stepZ',step=snap[key]||grid[key];if(snap[axis])out[axis]=projected?.[axis]??Math.round(point[axis]/step)*step;}return out;}
        public invalidate():void{/* Continuous render loop: retained for modifier viewport contract. */}

        /** Add independent behaviours such as Grid3D, Selection3D and SelectionRectangle. */
        public add(...behaviours:HTMLElement[]):this
        {
            const s=State(this);
            for(const behaviour of behaviours){s.behaviours.add(behaviour);if(s.started){this.appendChild(behaviour);(behaviour as HTMLElement&{attach?:(canvas:Canvas3D)=>unknown}).attach?.(this);}}
            return this;
        }
        public removeBehaviour(behaviour:HTMLElement):this{State(this).behaviours.delete(behaviour);(behaviour as HTMLElement&{detach?:()=>unknown}).detach?.();behaviour.remove();return this;}
        public get selectionSurface():HTMLCanvasElement{const canvas=State(this).canvas;if(!canvas)throw new Error('[Canvas3D] connect the canvas before attaching selection behaviours');return canvas;}

        public localToWorld(point:Vec3,mesh:Mesh3):Vec3{return this.transform(point,mesh);}
        public projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean}
        {
            /* Selection rectangles are expressed in selectionSurface-local
             * coordinates, not in coordinates of the whole Canvas3D host
             * (which also contains toolbars/status UI). */
            const s=State(this),rect=this.selectionSurface.getBoundingClientRect();this.updateCamera();const basis=this.cameraBasis(),rel=sub(point,s.camera.position),z=dot(rel,basis.forward),focal=rect.height*.82;
            return{x:rect.width/2+focal*dot(rel,basis.right)/Math.max(.0001,z),y:rect.height/2-focal*dot(rel,basis.up)/Math.max(.0001,z),z,visible:z>.0001};
        }
        public rayFromClient(clientX:number,clientY:number):Ray3
        {
            const s=State(this),rect=this.selectionSurface.getBoundingClientRect();this.updateCamera();const basis=this.cameraBasis(),focal=rect.height*.82,x=clientX-rect.left-rect.width/2,y=clientY-rect.top-rect.height/2;
            return{origin:{...s.camera.position},direction:norm({x:basis.forward.x+basis.right.x*x/focal-basis.up.x*y/focal,y:basis.forward.y+basis.right.y*x/focal-basis.up.y*y/focal,z:basis.forward.z+basis.right.z*x/focal-basis.up.z*y/focal})};
        }
        public createSelectionVolume(rect:{left:number;top:number;right:number;bottom:number}):{rays:Ray3[]}
        {
            const bounds=this.selectionSurface.getBoundingClientRect();return{rays:[[rect.left,rect.top],[rect.right,rect.top],[rect.right,rect.bottom],[rect.left,rect.bottom]].map(([x,y])=>this.rayFromClient(bounds.left+x,bounds.top+y))};
        }

        /** Lazily created selection behavior, shared by floating controls and SceneGraph. */
        public get Selection():InstanceType<typeof Selection3D>{
            let value=Selections.get(this);if(!value){value=new Selection3D();value.attach(this);Selections.set(this,value);}return value;
        }
        private buildSelectionBar():void {
            const bar=document.createElement('nav');bar.className='Canvas3D-Toolbar Canvas3D-SelectionBar';bar.style.cssText='top:auto;bottom:42px;left:12px;padding:3px;gap:3px';bar.setAttribute('aria-label','Selection');
            const modes:[Selection3DMode,string][]=[['vertex','Vertex'],['edge','Edges'],['polygon','Polygons'],['face','Faces'],['object','Object']];
            for(const [mode,title] of modes){const b=document.createElement('button');b.type='button';b.className='Canvas3D-Button';b.textContent=title;b.style.cssText='height:22px;padding:0 6px;font-size:9px';b.onclick=()=>{this.Selection.enabled=true;this.Selection.setMode(mode);for(const other of bar.querySelectorAll('button'))other.dataset.active=String(other===b);};bar.append(b);}
            const orbit=document.createElement('button');orbit.type='button';orbit.className='Canvas3D-Button';orbit.textContent='Orbit';orbit.onclick=()=>{if(Selections.has(this))this.Selection.enabled=false;for(const b of bar.querySelectorAll('button'))b.dataset.active=String(b===orbit);};bar.append(orbit);this.appendChild(bar);
        }

        public getView():ViewPreset
        {
            const v=this.getAttribute('view');return v==='front'||v==='right'||v==='top'?v:'perspective';
        }
        public setView(view:ViewPreset):this
        {
            if(this.getAttribute('view')!==view)this.setAttribute('view',view);else this.applyView(view,false);
            return this;
        }
        public resetView():this{return this.setView('perspective');}

        private numberAttr(name:string,fallback:number):number{const n=parseFloat(this.getAttribute(name)??String(fallback));return Number.isFinite(n)?n:fallback;}
        private updateCamera():void{const s=State(this),cp=Math.cos(s.pitch);s.camera.position={x:s.distance*Math.sin(s.yaw)*cp,y:s.distance*Math.sin(s.pitch),z:s.distance*Math.cos(s.yaw)*cp};}
        private cameraBasis():{forward:Vec3;right:Vec3;up:Vec3}{const s=State(this),forward=norm(sub({x:0,y:0,z:0},s.camera.position)),right=norm(cross(forward,{x:0,y:1,z:0}));return{forward,right,up:cross(right,forward)};}
        private applyView(view:ViewPreset,reflect=true):void
        {
            const s=State(this);
            if(view==='front'){s.yaw=0;s.pitch=0;}
            else if(view==='right'){s.yaw=Math.PI/2;s.pitch=0;}
            else if(view==='top'){s.yaw=0;s.pitch=1.24;}
            else{s.yaw=.72;s.pitch=.42;}
            if(reflect&&this.getAttribute('view')!==view)this.setAttribute('view',view);
            this.syncToolbar();
        }
        private buildToolbar():HTMLElement
        {
            const bar=document.createElement('div');bar.className='Canvas3D-Toolbar';
            for(const view of ['perspective','front','right','top'] as ViewPreset[])
            {
                const b=document.createElement('button');b.type='button';b.className='Canvas3D-Button';b.dataset.view=view;b.textContent=view==='perspective'?'Perspective':view[0].toUpperCase()+view.slice(1);b.onclick=()=>this.setView(view);bar.appendChild(b);
            }
            const reset=document.createElement('button');reset.type='button';reset.className='Canvas3D-Button';reset.textContent='Reset View';reset.onclick=()=>this.resetView();bar.appendChild(reset);
            bar.style.cssText='top:0;left:0;right:0;max-width:100%;border-radius:0;flex-wrap:wrap';
            const s=settings(this);
            bar.style.gap='8px';bar.style.padding='6px 10px';
            for(const group of ['grid','snap'] as const){
                const box=document.createElement('div');box.dataset.controlGroup=group;box.style.cssText='display:flex;align-items:center;gap:8px;flex:0 0 auto;margin-left:12px;padding-left:12px;border-left:1px solid #8885';
                const toggle=document.createElement('button');toggle.type='button';toggle.className='Canvas3D-Button';toggle.textContent=group==='grid'?'Grid':'Snap';toggle.dataset[group+'Toggle']='true';toggle.onclick=()=>group==='grid'?this.setGrid(!s.grid.enabled):this.setSnap(!s.snap.enabled);box.appendChild(toggle);
                for(const axis of ['x','y','z'] as const){
                    const key=axis==='x'?'stepX':axis==='y'?'stepY':'stepZ',pair=document.createElement('div');pair.style.cssText='display:flex;align-items:center;gap:5px';
                    const button=document.createElement('button');button.type='button';button.className='Canvas3D-Button';button.textContent=axis.toUpperCase();button.dataset[group==='grid'?'gridEnabledAxis':'snapAxis']=axis;button.setAttribute('aria-label',group+' '+axis.toUpperCase());button.title=group==='grid'?'Grid plane normal to '+axis.toUpperCase():'Snap '+axis.toUpperCase();button.onclick=()=>group==='grid'?this.setGrid({[axis]:!s.grid[axis]}):this.setSnap({[axis]:!s.snap[axis]});
                    const input=document.createElement('input');input.type='number';input.min='.0001';input.step='.1';input.className='Canvas3D-Input';input.style.width='52px';input.setAttribute('aria-label',group+' spacing '+axis.toUpperCase());input.dataset[group==='grid'?'gridAxis':'snapStep']=axis;input.onchange=()=>group==='grid'?this.setGrid({[key]:Number(input.value)}):this.setSnap({[key]:Number(input.value)});pair.append(button,input);box.appendChild(pair);
                }
                if(group==='grid'){
                    const kind=document.createElement('select');kind.className='Canvas3D-Button';kind.dataset.gridKind='true';kind.setAttribute('aria-label','Grid style');for(const value of ['lines','dotted','polar','isometric'] as const){const option=document.createElement('option');option.value=value;option.textContent=value[0].toUpperCase()+value.slice(1);kind.appendChild(option);}kind.onchange=()=>this.setGrid({kind:kind.value as GridOptions['kind']});box.appendChild(kind);
                }else{
                    const button=document.createElement('button');button.type='button';button.className='Canvas3D-Button';button.textContent='Snap to Grid';button.dataset.snapToGrid='true';button.onclick=()=>this.setSnap({toGrid:!s.snap.toGrid});box.appendChild(button);
                }
                bar.appendChild(box);
            }
            return bar;
        }
        private readGridAttributes(changed?:string):void{const s=settings(this),has=(name:string)=>!changed||changed===name;for(const axis of ['x','y','z'] as const){if(has('grid-'+axis)&&this.hasAttribute('grid-'+axis))s.grid[axis]=this.getAttribute('grid-'+axis)!=='false';const name='grid-step-'+axis;if(has(name)&&this.hasAttribute(name))s.grid[axis==='x'?'stepX':axis==='y'?'stepY':'stepZ']=Math.max(.0001,Number(this.getAttribute(name))||1);if(has('snap-'+axis)&&this.hasAttribute('snap-'+axis))s.snap[axis]=this.getAttribute('snap-'+axis)!=='false';const step='snap-step-'+axis;if(has(step)&&this.hasAttribute(step))s.snap[axis==='x'?'stepX':axis==='y'?'stepY':'stepZ']=Math.max(0,Number(this.getAttribute(step))||0);}if(has('show-grid')&&this.hasAttribute('show-grid'))s.grid.enabled=this.getAttribute('show-grid')!=='false';if(has('snap')&&this.hasAttribute('snap'))s.snap.enabled=this.getAttribute('snap')!=='false';if(has('snap-to-grid')&&this.hasAttribute('snap-to-grid'))s.snap.toGrid=this.getAttribute('snap-to-grid')!=='false';const kind=this.getAttribute('grid-kind');if(has('grid-kind')&&(kind==='lines'||kind==='dotted'||kind==='polar'||kind==='isometric'))s.grid.kind=kind;if(!changed||changed.startsWith('grid-')||changed==='show-grid'||changed.startsWith('snap-'))s.provider?.configure({...s.grid,snapX:s.snap.x,snapY:s.snap.y,snapZ:s.snap.z,snapStepX:s.snap.stepX,snapStepY:s.snap.stepY,snapStepZ:s.snap.stepZ});}
        private syncToolbar():void
        {
            const bar=this.querySelector<HTMLElement>('.Canvas3D-Toolbar');if(!bar)return;
            bar.style.display=this.getAttribute('show-toolbar')==='false'?'none':'flex';
            const current=this.getView();bar.querySelectorAll<HTMLElement>('[data-view]').forEach(b=>b.dataset.active=String(b.dataset.view===current));
            const s=settings(this);for(const [selector,value] of [['[data-snap-toggle]',s.snap.enabled],['[data-snap-to-grid]',s.snap.toGrid]] as const){const button=bar.querySelector<HTMLElement>(selector);if(button){button.dataset.active=String(value);button.setAttribute('aria-pressed',String(value));}}for(const input of bar.querySelectorAll<HTMLInputElement>('[data-grid-axis]'))if(document.activeElement!==input)input.value=String(s.grid[input.dataset.gridAxis==='x'?'stepX':input.dataset.gridAxis==='y'?'stepY':'stepZ']);for(const input of bar.querySelectorAll<HTMLInputElement>('[data-snap-step]'))if(document.activeElement!==input){const key=input.dataset.snapStep==='x'?'stepX':input.dataset.snapStep==='y'?'stepY':'stepZ';input.value=String(s.snap[key]||s.grid[key]);}const kind=bar.querySelector<HTMLSelectElement>('[data-grid-kind]');if(kind&&document.activeElement!==kind)kind.value=s.grid.kind;for(const button of bar.querySelectorAll<HTMLElement>('[data-snap-axis]')){const axis=button.dataset.snapAxis as 'x'|'y'|'z';button.dataset.active=String(s.snap[axis]);button.setAttribute('aria-pressed',String(s.snap[axis]));}for(const button of bar.querySelectorAll<HTMLElement>('[data-grid-enabled-axis]')){const axis=button.dataset.gridEnabledAxis as 'x'|'y'|'z';button.dataset.active=String(s.grid[axis]);button.setAttribute('aria-pressed',String(s.grid[axis]));}const grid=bar.querySelector<HTMLElement>('[data-grid-toggle]');if(grid){grid.dataset.active=String(s.grid.enabled);grid.setAttribute('aria-pressed',String(s.grid.enabled));}
        }
        private resize():void
        {
            const canvas=State(this).canvas;if(!canvas)return;const dpr=Math.min(2,window.devicePixelRatio||1),r=this.getBoundingClientRect();const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
        }
        private wireOrbit():void
        {
            const s=State(this),c=s.canvas;if(!c||s.wiredCanvas===c)return;s.wiredCanvas=c;
            c.addEventListener('pointerdown',e=>{if(this.getAttribute('orbit')==='false'||c.dataset.selection3dActive==='true')return;s.dragging=true;s.px=e.clientX;s.py=e.clientY;c.setPointerCapture(e.pointerId);});
            c.addEventListener('pointermove',e=>{if(!s.dragging||this.getAttribute('orbit')==='false')return;s.yaw+=(e.clientX-s.px)*.009;s.pitch=Math.max(-1.25,Math.min(1.25,s.pitch+(e.clientY-s.py)*.009));s.px=e.clientX;s.py=e.clientY;if(this.getAttribute('view')!=='perspective')this.setAttribute('view','perspective');});
            const up=()=>s.dragging=false;c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
            c.addEventListener('wheel',e=>{e.preventDefault();s.distance=Math.max(2.2,Math.min(12,s.distance*Math.exp(e.deltaY*.0012)));},{passive:false});
        }
        private loop(time:number):void
        {
            const s=State(this);if(!s.started)return;const dt=Math.min(.05,Math.max(0,(time-s.last)/1000));s.last=time;
            for(const cb of [...s.frameCallbacks]){try{cb(dt);}catch(error){console.warn('[Canvas3D] frame callback',error);}}
            this.render();s.raf=requestAnimationFrame(t=>this.loop(t));
        }
        private transform(v:Vec3,m:Mesh3):Vec3
        {
            let x=v.x*m.scale.x,y=v.y*m.scale.y,z=v.z*m.scale.z;
            let c=Math.cos(m.rotation.x),s=Math.sin(m.rotation.x);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(m.rotation.y);s=Math.sin(m.rotation.y);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(m.rotation.z);s=Math.sin(m.rotation.z);[x,y]=[x*c-y*s,x*s+y*c];
            return{x:x+m.position.x,y:y+m.position.y,z:z+m.position.z};
        }
        private color(hex:string,shade:number,alpha:number):string
        {
            const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);const r=(n>>16)&255,g=(n>>8)&255,b=n&255;const k=Math.max(.18,Math.min(1.35,shade));return`rgba(${Math.round(r*k)},${Math.round(g*k)},${Math.round(b*k)},${Math.max(0,Math.min(1,alpha))})`;
        }
        private normalColor(normal:Vec3):string
        {
            const channel=(value:number)=>Math.max(0,Math.min(255,Math.round((value*.5+.5)*255))).toString(16).padStart(2,'0');
            return`#${channel(normal.x)}${channel(normal.y)}${channel(normal.z)}`;
        }
        private materialShade(material:Material3,diffuse:number):number
        {
            const kind=material.kind??'standard',roughness=Math.max(0,Math.min(1,Number(material.roughness??.45))),metalness=Math.max(0,Math.min(1,Number(material.metalness??.15)));
            if(kind==='basic'||kind==='normal'||kind==='wireframe')return 1;
            const lit=.34+.66*Math.max(0,diffuse),soft=.55+(.45*lit),shade=lit*(1-roughness*.38)+soft*(roughness*.38)+metalness*.12;
            return kind==='toon'?Math.round(shade*4)/4:shade;
        }
        /** Standalone grid: no external Grid3D is required. Work is bounded per frame. */
        private drawDefaultGrid(ctx:CanvasRenderingContext2D,w:number,h:number,dpr:number):void {
            const g=settings(this).grid,s=State(this),basis=this.cameraBasis(),focal=h*.82;
            const project=(p:Vec3)=>{const r=sub(p,s.camera.position),z=dot(r,basis.forward);return {x:w/2+focal*dot(r,basis.right)/Math.max(.08,z),y:h/2-focal*dot(r,basis.up)/Math.max(.08,z),z};};
            const line=(a:Vec3,b:Vec3)=>{let A=project(a),B=project(b);const near=.081;if(A.z<near&&B.z<near)return;if(A.z<near){const t=(near-A.z)/(B.z-A.z);A=project({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});}else if(B.z<near){const t=(near-B.z)/(A.z-B.z);B=project({x:b.x+(a.x-b.x)*t,y:b.y+(a.y-b.y)*t,z:b.z+(a.z-b.z)*t});}ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);};
            const extent=Math.max(6,s.distance*2),light=this.getAttribute('theme')==='light';
            ctx.save();ctx.strokeStyle=light?'rgba(60,76,94,.28)':'rgba(174,192,211,.28)';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=dpr*.75;ctx.beginPath();
            for(const normal of ['x','y','z'] as const){
                if(!g[normal])continue;
                const [a,b]=normal==='x'?['y','z'] as const:normal==='y'?['x','z'] as const:['x','y'] as const;
                const steps={x:g.stepX,y:g.stepY,z:g.stepZ},rawA=steps[a],rawB=steps[b];
                // Decimate densely spaced grids by integer multiples, retaining alignment.
                const da=rawA*Math.max(1,Math.ceil(extent/(rawA*24))),db=rawB*Math.max(1,Math.ceil(extent/(rawB*24)));
                const point=(u:number,v:number):Vec3=>{const p={x:0,y:0,z:0};p[a]=g.kind==='isometric'?u+v*.5:u;p[b]=g.kind==='isometric'?v*Math.sqrt(3)/2:v;return p;};
                if(g.kind==='dotted'){
                    for(let i=-Math.floor(extent/da);i<=extent/da;i++)for(let j=-Math.floor(extent/db);j<=extent/db;j++){const p=project(point(i*da,j*db));if(p.z>.08&&p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h)ctx.fillRect(p.x-dpr*.7,p.y-dpr*.7,dpr*1.4,dpr*1.4);}
                }else if(g.kind==='polar'){
                    const step=Math.max(da,db);for(let r=step;r<=extent;r+=step)for(let k=0;k<64;k++){const t=k*Math.PI/32,n=(k+1)*Math.PI/32;line(point(r*Math.cos(t),r*Math.sin(t)),point(r*Math.cos(n),r*Math.sin(n)));}
                    for(let k=0;k<12;k++){const t=k*Math.PI/6;line(point(0,0),point(extent*Math.cos(t),extent*Math.sin(t)));}
                }else{
                    for(let i=-Math.floor(extent/da);i<=extent/da;i++)line(point(i*da,-extent),point(i*da,extent));
                    for(let j=-Math.floor(extent/db);j<=extent/db;j++)line(point(-extent,j*db),point(extent,j*db));
                    if(g.kind==='isometric')for(let k=-48;k<=48;k++){const c=k*Math.max(da,db),lo=Math.max(-extent,c-extent),hi=Math.min(extent,c+extent);if(lo<=hi)line(point(lo,c-lo),point(hi,c-hi));}
                }
            }
            ctx.stroke();ctx.restore();
        }
        private render():void
        {
            const s=State(this),canvas=s.canvas,ctx=s.ctx;if(!canvas||!ctx)return;const w=canvas.width,h=canvas.height,dpr=Math.min(2,window.devicePixelRatio||1);
            const light=this.getAttribute('theme')==='light';const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,light?'#f5f7f9':'#20252b');grad.addColorStop(1,light?'#dfe4e8':'#111418');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
            this.updateCamera();const grid=settings(this);if(grid.grid.enabled){if(grid.provider?.drawOn)grid.provider.drawOn(ctx,w/dpr,h/dpr,dpr);else this.drawDefaultGrid(ctx,w,h,dpr);}const {forward,right,up}=this.cameraBasis(),focal=(h/dpr)*.82*dpr;
            type Tri={p:[{x:number;y:number;z:number},{x:number;y:number;z:number},{x:number;y:number;z:number}];depth:number;shade:number;color:string;alpha:number;wireframe:boolean};const tris:Tri[]=[];
            for(const mesh of s.scene.children){if(!mesh.visible)continue;const g=mesh.geometry,material=(mesh.userData.material??{}) as Material3,opacity=Number(mesh.userData['_arianna_opacity']??1)*Number(material.opacity??1),fallback=String(mesh.userData.color??this.getAttribute('color')??'#8f9aa6'),base=String(material.color??fallback),wireframe=Boolean(material.wireframe||material.kind==='wireframe');const projected=g.vertices.map(v=>{const world=this.transform(v,mesh),rel=sub(world,s.camera.position),z=dot(rel,forward);return{x:w/2+focal*dot(rel,right)/Math.max(.08,z),y:h/2-focal*dot(rel,up)/Math.max(.08,z),z,world};});for(let i=0;i<g.indices.length;i+=3){const ia=g.indices[i],ib=g.indices[i+1],ic=g.indices[i+2],a=projected[ia],b=projected[ib],c=projected[ic];if(!a||!b||!c||a.z<=.08||b.z<=.08||c.z<=.08)continue;const wa=a.world,wb=b.world,wc=c.world,n=norm(cross(sub(wb,wa),sub(wc,wa))),ld=norm({x:-.45,y:.75,z:.6}),diffuse=Math.max(0,dot(n,ld)),shade=this.materialShade(material,diffuse),color=material.kind==='normal'?this.normalColor(n):base;tris.push({p:[a,b,c],depth:(a.z+b.z+c.z)/3,shade,color,alpha:opacity,wireframe});}}
            tris.sort((a,b)=>b.depth-a.depth);ctx.lineJoin='round';for(const tri of tris){ctx.beginPath();ctx.moveTo(tri.p[0].x,tri.p[0].y);ctx.lineTo(tri.p[1].x,tri.p[1].y);ctx.lineTo(tri.p[2].x,tri.p[2].y);ctx.closePath();if(!tri.wireframe){ctx.fillStyle=this.color(tri.color,tri.shade,tri.alpha);ctx.fill();}ctx.strokeStyle=tri.wireframe?this.color(tri.color,1,tri.alpha):(light?'rgba(35,40,45,.10)':'rgba(255,255,255,.055)');ctx.lineWidth=(tri.wireframe?1.15:.7)*dpr;ctx.stroke();}
        }
    }
}
export type Canvas3DMesh=Canvas3D.Mesh3;
export type Canvas3DGeometry=Canvas3D.Geometry3;
export type Canvas3DViewPreset=Canvas3D.ViewPreset;
export default Canvas3D.Canvas3D;

// Re-exported by the existing graphics/3D/index.ts export-star.
export { SceneGraph } from './SceneGraph.ts';
export type { SceneGraphOptions } from './SceneGraph.ts';
