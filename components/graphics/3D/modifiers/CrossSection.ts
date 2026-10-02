/**
 * @module components/graphics/3D/CrossSection
 * @author Riccardo Angeli
 * @version 1.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Generic mesh/plane cross-section controller for Canvas3D.
 * It contains no demo geometry. Callers provide/select the mesh and define the plane.
 */
import { Component, Css, Templates } from '../../../../core/index.ts';
import type { Canvas3D as Canvas3DNamespace } from '../Canvas3D.ts';
const html=Templates.Template.Html;

export namespace CrossSection
{
    export type Mode='slice'|'sweep';
    export interface Plane { origin:Canvas3DNamespace.Vec3; normal:Canvas3DNamespace.Vec3; }
    export interface Segment { a:Canvas3DNamespace.Vec3; b:Canvas3DNamespace.Vec3; }
    export interface PathSource { getPath3D():Canvas3DNamespace.Vec3[]; }
    export interface SectionSource { getProfile2D():Array<{x:number;y:number}>; closed?:boolean; }
    /** Adapter contract for arbitrary figures/surfaces that opt into sweeps. */
    export interface Subscriber
    {
        crossSectionPath?():Canvas3DNamespace.Vec3[];
        crossSectionProfile?():Array<{x:number;y:number}>;
        crossSectionClosed?:boolean;
    }
    export type GeometrySource=Canvas3DNamespace.Mesh3|PathSource|SectionSource|Subscriber|SVGGeometryElement;
    interface CanvasHost extends HTMLElement
    {
        scene:Canvas3DNamespace.Scene3;
        canvas?:HTMLCanvasElement;
        findMesh?(id:string):Canvas3DNamespace.Mesh3|null;
        addMesh?(id:string,mesh:Canvas3DNamespace.Mesh3):Canvas3DNamespace.Mesh3;
        removeMesh?(source:string|Canvas3DNamespace.Mesh3):unknown;
        getMeshes?():ReadonlyArray<Canvas3DNamespace.Mesh3>;
        rayFromClient?(x:number,y:number):{origin:Canvas3DNamespace.Vec3;direction:Canvas3DNamespace.Vec3};
        localToWorld?(point:Canvas3DNamespace.Vec3,mesh:Canvas3DNamespace.Mesh3):Canvas3DNamespace.Vec3;
        projectWorld?(point:Canvas3DNamespace.Vec3):{x:number;y:number;z:number;visible:boolean};
        invalidate?():void;
    }
    interface State
    {
        canvas:CanvasHost|null;target:Canvas3DNamespace.Mesh3|null;plane:Plane;segments:Segment[];
        result:Canvas3DNamespace.Mesh3|null;built:boolean;path:GeometrySource|null;section:GeometrySource|null;
        pick:'path'|'section'|null;selectionCleanup:(()=>void)|null;
    }
    const Runtime=new WeakMap<HTMLElement,State>();
    const S=(host:HTMLElement):State=>{let s=Runtime.get(host);if(!s){s={canvas:null,target:null,plane:{origin:{x:0,y:0,z:0},normal:{x:0,y:1,z:0}},segments:[],result:null,built:false,path:null,section:null,pick:null,selectionCleanup:null};Runtime.set(host,s);}return s;};
    const dot=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z;
    const sub=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
    const add=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
    const scale=(a:Canvas3DNamespace.Vec3,k:number):Canvas3DNamespace.Vec3=>({x:a.x*k,y:a.y*k,z:a.z*k});
    const cross=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
    const norm=(a:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>{const l=Math.hypot(a.x,a.y,a.z)||1;return{x:a.x/l,y:a.y/l,z:a.z/l};};
    const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
    const rotate=(v:Canvas3DNamespace.Vec3,r:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>{let{x,y,z}=v;let c=Math.cos(r.x),s=Math.sin(r.x);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(r.y);s=Math.sin(r.y);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(r.z);s=Math.sin(r.z);[x,y]=[x*c-y*s,x*s+y*c];return{x,y,z};};
    const world=(v:Canvas3DNamespace.Vec3,m:Canvas3DNamespace.Mesh3):Canvas3DNamespace.Vec3=>add(rotate({x:v.x*m.scale.x,y:v.y*m.scale.y,z:v.z*m.scale.z},m.rotation),m.position);
    const cloneGeometry=(g:Canvas3DNamespace.Geometry3):Canvas3DNamespace.Geometry3=>({vertices:g.vertices.map(v=>({...v})),normals:g.normals.map(n=>({...n})),indices:[...g.indices],clone(){return cloneGeometry(this);}});

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-cross-section,.CrossSection',{Background:'rgba(28,32,37,.95)',Border:'1px solid #454c54',BorderRadius:'9px',BoxSizing:'border-box',Color:'#d7dde3',Display:'block',Font:'11px system-ui',MinWidth:'270px',Overflow:'hidden',Position:'absolute',Right:'14px',Top:'58px',Width:'310px',ZIndex:'30'}),
        new Css.Rule('.CrossSection-Head',{Background:'#24292f',BorderBottom:'1px solid #3b4249',Cursor:'move',FontWeight:'750',Padding:'9px 10px',UserSelect:'none'}),
        new Css.Rule('.CrossSection-Body',{Display:'grid',Gap:'8px',Padding:'10px'}),
        new Css.Rule('.CrossSection-Row',{AlignItems:'center',Display:'grid',Gap:'6px',GridTemplateColumns:'78px 1fr'}),
        new Css.Rule('.CrossSection-Input',{Background:'#15191d',Border:'1px solid #414850',BorderRadius:'5px',Color:'#e7edf3',Height:'28px',MinWidth:'0',Padding:'0 7px'}),
        new Css.Rule('.CrossSection-Range',{Width:'100%'}),
        new Css.Rule('.CrossSection-Button',{Background:'#292f35',Border:'1px solid #49515a',BorderRadius:'5px',Color:'#dbe2e8',Cursor:'pointer',Height:'28px'}),
        new Css.Rule('.CrossSection-Resize',{Background:'transparent',Position:'absolute',ZIndex:'40'}),
    ]);

    @Component('arianna-cross-section',Styles,{Shadow:false,Attributes:['for','viewport','mode','path','section','normal-x','normal-y','normal-z','offset','thickness','caps','theme']})
    export class CrossSection extends HTMLElement
    {
        public static readonly Styles=Styles;public template=html``;
        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void{this.classList.add('CrossSection');if(!S(this).built){this.renderPanel();this.installDrag();this.installResize();S(this).built=true;}queueMicrotask(()=>{this.bind();this.rebuild();});}
        public onAttributeChanged():void{if(!this.isConnected)return;this.readPlaneFromAttributes();this.syncPanel();queueMicrotask(()=>this.rebuild());}
        public onUnmount():void{this.clearResult();const s=S(this);s.selectionCleanup?.();s.selectionCleanup=null;s.canvas=null;s.target=null;}

        public bind(canvas?:HTMLElement|null):this
        {
            const s=S(this),id=this.getAttribute('viewport');const target=canvas??(id?document.getElementById(id):this.parentElement?.querySelector('arianna-canvas-3d'))??null;
            if(target&&'scene' in target){if(s.canvas!==target){s.selectionCleanup?.();s.canvas=target as CanvasHost;this.wirePicker();}}
            const meshId=(this.getAttribute('for')??'').trim();if(meshId&&s.canvas?.findMesh)s.target=s.canvas.findMesh(meshId);
            const pathId=(this.getAttribute('path')??'').trim(),sectionId=(this.getAttribute('section')??'').trim();
            if(pathId&&s.canvas?.findMesh)s.path=s.canvas.findMesh(pathId);if(sectionId&&s.canvas?.findMesh)s.section=s.canvas.findMesh(sectionId);
            this.readPlaneFromAttributes();return this;
        }
        public setTarget(mesh:Canvas3DNamespace.Mesh3|null):this{S(this).target=mesh;this.rebuild();return this;}
        public setPlane(origin:Canvas3DNamespace.Vec3,normal:Canvas3DNamespace.Vec3):this{S(this).plane={origin:{...origin},normal:norm(normal)};this.syncPanel();this.rebuild();return this;}
        public getPlane():Plane{return structuredClone(S(this).plane);}
        public getSegments():Segment[]{return structuredClone(S(this).segments);}
        public beginPick(slot:'path'|'section'):this{S(this).pick=slot;this.syncPanel();return this;}
        public setPathSource(source:GeometrySource|null):this{S(this).path=source;this.rebuild();this.syncPanel();return this;}
        public setSectionSource(source:GeometrySource|null):this{S(this).section=source;this.rebuild();this.syncPanel();return this;}
        public setSources(path:GeometrySource|null,section:GeometrySource|null):this{const s=S(this);s.path=path;s.section=section;this.rebuild();this.syncPanel();return this;}
        public subscribe(slot:'path'|'section',source:GeometrySource|null):this{return slot==='path'?this.setPathSource(source):this.setSectionSource(source);}

        public rebuild():this
        {
            const s=S(this);this.clearResult();s.segments=[];
            if((this.getAttribute('mode')==='sweep'||s.path&&s.section)&&s.path&&s.section){this.makeSweep();this.syncPanel();return this;}
            if(!s.target)return this;
            const n=norm(s.plane.normal),origin=s.plane.origin,g=s.target.geometry,eps=1e-7;
            const edge=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3,da:number,db:number):Canvas3DNamespace.Vec3|null=>{if(Math.abs(da)<eps)return a;if(Math.abs(db)<eps)return b;if((da>0)===(db>0))return null;const t=da/(da-db);return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};};
            for(let i=0;i<g.indices.length;i+=3)
            {
                const a=world(g.vertices[g.indices[i]],s.target),b=world(g.vertices[g.indices[i+1]],s.target),c=world(g.vertices[g.indices[i+2]],s.target);
                const da=dot(sub(a,origin),n),db=dot(sub(b,origin),n),dc=dot(sub(c,origin),n),pts:Canvas3DNamespace.Vec3[]=[];
                for(const p of [edge(a,b,da,db),edge(b,c,db,dc),edge(c,a,dc,da)])if(p&&!pts.some(q=>Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z)<1e-5))pts.push(p);
                if(pts.length>=2)s.segments.push({a:pts[0],b:pts[1]});
            }
            this.makeResultMesh();this.syncPanel();this.dispatchEvent(new CustomEvent('arianna:cross-section-change',{bubbles:true,composed:true,detail:{segments:this.getSegments(),plane:this.getPlane(),target:s.target,source:this}}));return this;
        }
        private readPlaneFromAttributes():void
        {
            const s=S(this),nx=Number(this.getAttribute('normal-x')??s.plane.normal.x),ny=Number(this.getAttribute('normal-y')??s.plane.normal.y),nz=Number(this.getAttribute('normal-z')??s.plane.normal.z),off=Number(this.getAttribute('offset')??0)||0,n=norm({x:nx,y:ny,z:nz});s.plane={origin:scale(n,off),normal:n};
        }
        private makeResultMesh():void
        {
            const s=S(this);if(!s.canvas||!s.segments.length)return;const thickness=Math.max(.002,Number(this.getAttribute('thickness')??.018)||.018),vertices:Canvas3DNamespace.Vec3[]=[],normals:Canvas3DNamespace.Vec3[]=[],indices:number[]=[];
            for(const seg of s.segments){const dir=norm(sub(seg.b,seg.a)),side=scale(norm(cross(s.plane.normal,dir)),thickness/2),base=vertices.length;vertices.push(add(seg.a,side),sub(seg.a,side),sub(seg.b,side),add(seg.b,side));for(let i=0;i<4;i++)normals.push({...s.plane.normal});indices.push(base,base+1,base+2,base,base+2,base+3);}
            const geometry:Canvas3DNamespace.Geometry3={vertices,normals,indices,clone(){return cloneGeometry(this);}};const mesh:Canvas3DNamespace.Mesh3={geometry,position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},visible:true,userData:{color:'#ff4fa3',name:'Cross Section',crossSectionGenerated:true}};s.result=mesh;s.canvas.scene.add(mesh);s.canvas.invalidate?.();
        }
        private sourceName(source:GeometrySource|null):string{if(!source)return'— pick —';if(source instanceof Element)return source.id||source.localName;const mesh=source as Canvas3DNamespace.Mesh3;return String(mesh.userData?.name??mesh.userData?.id??('getPath3D' in source?'Path':'Section'));}
        private pathPoints(source:GeometrySource):Canvas3DNamespace.Vec3[]
        {
            if('crossSectionPath' in source&&typeof source.crossSectionPath==='function')return source.crossSectionPath().map(p=>({...p}));
            if('getPath3D' in source)return source.getPath3D().map(p=>({...p}));
            if(typeof SVGGeometryElement!=='undefined'&&source instanceof SVGGeometryElement){const length=source.getTotalLength(),count=Math.max(2,Math.ceil(length/8));return Array.from({length:count},(_,i)=>{const p=source.getPointAtLength(length*i/(count-1));return{x:p.x,y:p.y,z:0};});}
            const mesh=source as Canvas3DNamespace.Mesh3,crossSection=mesh.userData?.crossSection as {path?:Canvas3DNamespace.Vec3[]}|undefined,custom=crossSection?.path??mesh.userData?.path;if(Array.isArray(custom))return(custom as Canvas3DNamespace.Vec3[]).map(p=>({...p}));
            const points:Canvas3DNamespace.Vec3[]=[];for(const v of mesh.geometry.vertices){const p=world(v,mesh);if(!points.some(q=>Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z)<1e-6))points.push(p);}return points;
        }
        private profilePoints(source:GeometrySource):Array<{x:number;y:number}>
        {
            if('crossSectionProfile' in source&&typeof source.crossSectionProfile==='function')return source.crossSectionProfile().map(p=>({...p}));
            if('getProfile2D' in source)return source.getProfile2D().map(p=>({...p}));
            if(typeof SVGGeometryElement!=='undefined'&&source instanceof SVGGeometryElement){const length=source.getTotalLength(),count=Math.max(8,Math.ceil(length/6));return Array.from({length:count},(_,i)=>{const p=source.getPointAtLength(length*i/count);return{x:p.x,y:p.y};});}
            const mesh=source as Canvas3DNamespace.Mesh3,crossSection=mesh.userData?.crossSection as {profile?:Array<{x:number;y:number}>}|undefined,custom=crossSection?.profile??mesh.userData?.profile;if(Array.isArray(custom))return(custom as Array<{x:number;y:number}>).map(p=>({...p}));
            const points=mesh.geometry.vertices.map(v=>world(v,mesh)),center=scale(points.reduce(add,{x:0,y:0,z:0}),1/Math.max(1,points.length));
            const normal=points.length>2?norm(cross(sub(points[1],points[0]),sub(points[2],points[0]))):{x:0,y:0,z:1};let u=norm(sub(points[0]??{x:1,y:0,z:0},center));if(Math.hypot(u.x,u.y,u.z)<1e-6)u={x:1,y:0,z:0};const v=norm(cross(normal,u));
            return points.map(p=>({x:dot(sub(p,center),u),y:dot(sub(p,center),v)})).filter((p,i,a)=>a.findIndex(q=>Math.hypot(q.x-p.x,q.y-p.y)<1e-6)===i).sort((a,b)=>Math.atan2(a.y,a.x)-Math.atan2(b.y,b.x));
        }
        private makeSweep():void
        {
            const s=S(this),path=this.pathPoints(s.path!),profile=this.profilePoints(s.section!);if(!s.canvas||path.length<2||profile.length<3)return;
            const vertices:Canvas3DNamespace.Vec3[]=[],normals:Canvas3DNamespace.Vec3[]=[],indices:number[]=[],subscriber=s.section as SectionSource&Subscriber,closed=subscriber.closed!==false&&subscriber.crossSectionClosed!==false;
            for(let i=0;i<path.length;i++)
            {
                const tangent=norm(sub(path[Math.min(path.length-1,i+1)],path[Math.max(0,i-1)])),reference=Math.abs(tangent.y)<.9?{x:0,y:1,z:0}:{x:1,y:0,z:0},u=norm(cross(reference,tangent)),v=norm(cross(tangent,u));
                for(const p of profile){const radial=norm(add(scale(u,p.x),scale(v,p.y)));vertices.push(add(path[i],add(scale(u,p.x),scale(v,p.y))));normals.push(radial);}
            }
            const ring=profile.length,edges=closed?ring:ring-1;for(let i=0;i<path.length-1;i++)for(let j=0;j<edges;j++){const a=i*ring+j,b=i*ring+(j+1)%ring,c=(i+1)*ring+(j+1)%ring,d=(i+1)*ring+j;indices.push(a,b,c,a,c,d);}
            const geometry:Canvas3DNamespace.Geometry3={vertices,normals,indices,clone(){return cloneGeometry(this);}},mesh:Canvas3DNamespace.Mesh3={geometry,position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},visible:true,userData:{id:`sweep-${Date.now().toString(36)}`,color:'#ff4fa3',name:'Cross Section Sweep',crossSectionGenerated:true,path:s.path,section:s.section}};
            s.result=mesh;if(s.canvas.addMesh)s.canvas.addMesh(String(mesh.userData.id),mesh);else s.canvas.scene.add(mesh);s.canvas.invalidate?.();this.dispatchEvent(new CustomEvent('arianna:cross-section-change',{bubbles:true,composed:true,detail:{mode:'sweep',path:s.path,section:s.section,result:mesh,source:this}}));
        }
        private clearResult():void{const s=S(this);if(s.result&&s.canvas){if(s.canvas.removeMesh)s.canvas.removeMesh(s.result);else s.canvas.scene.remove(s.result);}s.result=null;}
        private renderPanel():void
        {
            const head=document.createElement('header');head.className='CrossSection-Head';head.textContent='Cross Section';
            const body=document.createElement('div');body.className='CrossSection-Body';
            const row=(label:string,node:HTMLElement)=>{const r=document.createElement('label');r.className='CrossSection-Row';const l=document.createElement('span');l.textContent=label;r.append(l,node);body.appendChild(r);};
            const mk=(attr:string,step:string)=>{const i=document.createElement('input');i.className='CrossSection-Input';i.type='number';i.step=step;i.dataset.attr=attr;i.oninput=()=>this.setAttribute(attr,i.value);return i;};
            const picker=(slot:'path'|'section')=>{const b=document.createElement('button');b.className='CrossSection-Button';b.dataset.pick=slot;b.onclick=()=>this.beginPick(slot);return b;};
            row('Path',picker('path'));row('Section',picker('section'));
            row('Normal X',mk('normal-x','.01'));row('Normal Y',mk('normal-y','.01'));row('Normal Z',mk('normal-z','.01'));row('Offset',mk('offset','.01'));row('Thickness',mk('thickness','.002'));
            const count=document.createElement('div');count.className='CrossSection-Input';count.dataset.role='count';count.style.lineHeight='28px';row('Segments',count);
            const apply=document.createElement('button');apply.className='CrossSection-Button';apply.textContent='Rebuild';apply.onclick=()=>this.rebuild();body.appendChild(apply);this.replaceChildren(head,body);this.syncPanel();
        }
        private syncPanel():void{const s=S(this);for(const i of this.querySelectorAll<HTMLInputElement>('[data-attr]'))i.value=this.getAttribute(i.dataset.attr!)??(i.dataset.attr==='normal-y'?'1':'0');for(const b of this.querySelectorAll<HTMLButtonElement>('[data-pick]')){const slot=b.dataset.pick as 'path'|'section';b.textContent=`${s.pick===slot?'● ':''}${this.sourceName(s[slot])}`;}const count=this.querySelector<HTMLElement>('[data-role="count"]');if(count)count.textContent=s.path&&s.section?`${this.pathPoints(s.path).length} × ${this.profilePoints(s.section).length}`:String(s.segments.length);}
        private wirePicker():void
        {
            const s=S(this),surface=s.canvas?.canvas;if(!surface)return;let down:{x:number;y:number}|null=null;const onDown=(e:PointerEvent)=>{if(s.pick&&e.button===0)down={x:e.clientX,y:e.clientY};};const onUp=(e:PointerEvent)=>{if(!s.pick||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>4){down=null;return;}down=null;const mesh=this.pickMesh(e.clientX,e.clientY);if(!mesh)return;s[s.pick]=mesh;s.pick=s.pick==='path'?'section':null;this.syncPanel();if(s.path&&s.section)this.rebuild();e.preventDefault();e.stopPropagation();};surface.addEventListener('pointerdown',onDown,true);surface.addEventListener('pointerup',onUp,true);s.selectionCleanup=()=>{surface.removeEventListener('pointerdown',onDown,true);surface.removeEventListener('pointerup',onUp,true);};
        }
        private pickMesh(x:number,y:number):Canvas3DNamespace.Mesh3|null
        {
            const canvas=S(this).canvas,ray=canvas?.rayFromClient?.(x,y);if(!canvas||!ray)return null;let best:{mesh:Canvas3DNamespace.Mesh3;distance:number}|null=null;
            for(const mesh of canvas.getMeshes?.()??canvas.scene.children){if(!mesh.visible||mesh.userData.crossSectionGenerated)continue;const g=mesh.geometry;for(let i=0;i+2<g.indices.length;i+=3){const a=world(g.vertices[g.indices[i]],mesh),b=world(g.vertices[g.indices[i+1]],mesh),c=world(g.vertices[g.indices[i+2]],mesh),e1=sub(b,a),e2=sub(c,a),p=cross(ray.direction,e2),det=dot(e1,p);if(Math.abs(det)<1e-8)continue;const inv=1/det,tv=sub(ray.origin,a),u=dot(tv,p)*inv;if(u<0||u>1)continue;const q=cross(tv,e1),v=dot(ray.direction,q)*inv;if(v<0||u+v>1)continue;const distance=dot(e2,q)*inv;if(distance>=0&&(!best||distance<best.distance))best={mesh,distance};}}
            if(best)return best.mesh;
            /* Curves/lines have no triangles. Pick their projected polyline with a
             * screen-space tolerance so they can serve as sweep paths. */
            if(canvas.projectWorld)for(const mesh of canvas.getMeshes?.()??canvas.scene.children){if(!mesh.visible||mesh.userData.crossSectionGenerated)continue;const points=this.pathPoints(mesh).map(p=>canvas.projectWorld!(p)).filter(p=>p.visible);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1),distance=Math.hypot(x-(a.x+dx*t),y-(a.y+dy*t));if(distance<=8)return mesh;}}
            return null;
        }
        private installDrag():void{const h=this.querySelector<HTMLElement>('.CrossSection-Head');if(!h)return;let active=false,dx=0,dy=0;h.onpointerdown=e=>{if(e.button!==0)return;active=true;dx=e.clientX-this.getBoundingClientRect().left;dy=e.clientY-this.getBoundingClientRect().top;this.style.left=`${this.offsetLeft}px`;this.style.top=`${this.offsetTop}px`;this.style.right='auto';h.setPointerCapture(e.pointerId);};h.onpointermove=e=>{if(!active)return;const p=this.offsetParent as HTMLElement|null,pr=p?.getBoundingClientRect();if(!pr)return;this.style.left=`${Math.max(0,Math.min(pr.width-this.offsetWidth,e.clientX-pr.left-dx))}px`;this.style.top=`${Math.max(0,Math.min(pr.height-this.offsetHeight,e.clientY-pr.top-dy))}px`;};h.onpointerup=h.onpointercancel=()=>active=false;}
        private installResize():void{const edges=['n','ne','e','se','s','sw','w','nw'];for(const edge of edges){const h=document.createElement('span');h.className='CrossSection-Resize';h.dataset.edge=edge;const css=edge==='n'?'left:10px;right:10px;top:-6px;height:12px;':edge==='s'?'left:10px;right:10px;bottom:-6px;height:12px;':edge==='e'?'right:-6px;top:10px;bottom:10px;width:12px;':edge==='w'?'left:-6px;top:10px;bottom:10px;width:12px;':`${edge.includes('e')?'right':'left'}:-7px;${edge.includes('s')?'bottom':'top'}:-7px;width:14px;height:14px;`;h.style.cssText=css;let pid=-1,sx=0,sy=0,l=0,t=0,w=0,hh=0;h.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();pid=e.pointerId;sx=e.clientX;sy=e.clientY;l=this.offsetLeft;t=this.offsetTop;w=this.offsetWidth;hh=this.offsetHeight;this.style.left=`${l}px`;this.style.top=`${t}px`;this.style.right='auto';h.setPointerCapture(pid);};h.onpointermove=e=>{if(e.pointerId!==pid)return;const dx=e.clientX-sx,dy=e.clientY-sy;let nl=l,nt=t,nw=w,nh=hh;if(edge.includes('e'))nw=Math.max(240,w+dx);if(edge.includes('s'))nh=Math.max(180,hh+dy);if(edge.includes('w')){nw=Math.max(240,w-dx);nl=l+(w-nw);}if(edge.includes('n')){nh=Math.max(180,hh-dy);nt=t+(hh-nh);}this.style.left=`${Math.max(0,nl)}px`;this.style.top=`${Math.max(0,nt)}px`;this.style.width=`${nw}px`;this.style.height=`${nh}px`;};h.onpointerup=h.onpointercancel=e=>{if(e.pointerId===pid)pid=-1;};this.appendChild(h);}}
    }
}

export type CrossSectionPlane=CrossSection.Plane;
export type CrossSectionSegment=CrossSection.Segment;
export default CrossSection.CrossSection;
