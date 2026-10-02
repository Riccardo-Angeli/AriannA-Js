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
const html=Templates.Template.Html;

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
        new Css.Rule('.Canvas3D-Toolbar',{AlignItems:'center',BackdropFilter:'blur(12px)',Background:'rgba(26,30,35,.82)',Border:'1px solid rgba(255,255,255,.10)',BorderRadius:'7px',Display:'flex',Gap:'4px',Left:'12px',Padding:'5px',Position:'absolute',Top:'12px',ZIndex:'12'}),
        new Css.Rule('.Canvas3D-Button',{Appearance:'none',Background:'#292e34',Border:'1px solid #454c54',BorderRadius:'5px',Color:'#c9d0d6',Cursor:'pointer',Font:'700 9px/1 system-ui',Height:'25px',Padding:'0 8px'}),
        new Css.Rule('.Canvas3D-Button[data-active="true"]',{BorderColor:'#e40c88',Color:'#ff69bb'}),
        new Css.Rule('.Canvas3D-Axes',{Bottom:'12px',Color:'#8d969e',Font:'9px ui-monospace,monospace',Position:'absolute',Right:'12px',ZIndex:'10'}),
        new Css.Rule('arianna-canvas-3d[theme="light"],.Canvas3D[theme="light"]',{Background:'#eef1f4',BorderColor:'#c4cbd1'}),
        new Css.Rule('arianna-canvas-3d[theme="light"] .Canvas3D-Toolbar',{Background:'rgba(255,255,255,.86)',BorderColor:'rgba(0,0,0,.12)'}),
        new Css.Rule('arianna-canvas-3d[theme="light"] .Canvas3D-Button',{Background:'#f4f5f6',BorderColor:'#c5cbd0',Color:'#3b4248'}),
    ]);

    @Component('arianna-canvas-3d',Styles,{Shadow:false,Attributes:['theme','color','orbit','zoom','yaw','pitch','view','show-toolbar']})
    export class Canvas3D extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public get scene():Scene3{return State(this).scene;}
        public get camera():Camera3{return State(this).camera;}
        public get canvas():HTMLCanvasElement|undefined{return State(this).canvas;}

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            const s=State(this);
            this.classList.add('Canvas3D');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            if(!this.hasAttribute('view'))this.setAttribute('view','perspective');
            if(s.started){this.syncToolbar();return;}

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
            this.syncToolbar();
            for(const behaviour of s.behaviours)(behaviour as HTMLElement&{attach?:(canvas:Canvas3D)=>unknown}).attach?.(this);
        }
        public onUnmount():void
        {
            const s=State(this);for(const behaviour of s.behaviours)(behaviour as HTMLElement&{detach?:()=>unknown}).detach?.();cancelAnimationFrame(s.raf);s.resizeObserver?.disconnect();s.resizeObserver=null;s.frameCallbacks.clear();s.canvas=undefined;s.ctx=null;s.wiredCanvas=undefined;s.meshes.clear();s.scene.children.length=0;s.started=false;
        }
        public onAttributeChanged(name?:string):void
        {
            const s=State(this);if(!s.started)return;
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
            return bar;
        }
        private syncToolbar():void
        {
            const bar=this.querySelector<HTMLElement>('.Canvas3D-Toolbar');if(!bar)return;
            bar.style.display=this.getAttribute('show-toolbar')==='false'?'none':'flex';
            const current=this.getView();bar.querySelectorAll<HTMLElement>('[data-view]').forEach(b=>b.dataset.active=String(b.dataset.view===current));
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
        private render():void
        {
            const s=State(this),canvas=s.canvas,ctx=s.ctx;if(!canvas||!ctx)return;const w=canvas.width,h=canvas.height,dpr=Math.min(2,window.devicePixelRatio||1);
            const light=this.getAttribute('theme')==='light';const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,light?'#f5f7f9':'#20252b');grad.addColorStop(1,light?'#dfe4e8':'#111418');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
            this.updateCamera();const {forward,right,up}=this.cameraBasis(),focal=(h/dpr)*.82*dpr;
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
