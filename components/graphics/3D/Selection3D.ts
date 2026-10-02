/** Topology-aware 3D selection behaviour, independent from tools and modifiers. */
import { Component, Templates } from '../../../core/index.ts';
import type { SelectionRectangleDetail } from '../SelectionRectangle.ts';
const html=Templates.Template.Html;

export namespace Selection3D
{
    export interface Vec3{x:number;y:number;z:number;}
    export type Mode='vertex'|'edge'|'polygon'|'face'|'object';
    export type Operation='replace'|'add'|'subtract'|'toggle';
    export interface Geometry{vertices:Vec3[];indices:number[];faceIds?:number[];}
    export interface Mesh{geometry:Geometry;visible:boolean;userData:Record<string,unknown>;}
    export interface Ray{origin:Vec3;direction:Vec3;}
    export interface CanvasTarget extends HTMLElement
    {
        selectionSurface:HTMLCanvasElement;getMeshes():ReadonlyArray<Mesh>;
        rayFromClient(clientX:number,clientY:number):Ray;
        localToWorld(point:Vec3,mesh:Mesh):Vec3;
        projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean};
        onFrame?(callback:(dt:number)=>void):()=>void;
    }
    export interface Item
    {
        key:string;mode:Mode;mesh:Mesh;objectId:string;vertexIndices:number[];
        edge?:[number,number];polygonIndices:number[];faceId?:number;point:Vec3;
    }
    export interface Result{mode:Mode;items:Item[];objects:Mesh[];vertices:Item[];edges:Item[];polygons:Item[];faces:Item[];source:Selection3D;}
    export interface Options{canvas?:CanvasTarget;mode?:Mode;enabled?:boolean;backfaces?:'exclude'|'include';faceAngle?:number;}
    export interface ModifierTarget{bindMesh?(mesh:Mesh):unknown;apply?():unknown;selection?:Result;}

    const add=(a:Vec3,b:Vec3):Vec3=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}),sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}),scale=(a:Vec3,k:number):Vec3=>({x:a.x*k,y:a.y*k,z:a.z*k}),dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}),norm=(a:Vec3)=>scale(a,1/(Math.hypot(a.x,a.y,a.z)||1));
    interface Hit{mesh:Mesh;triangle:number;indices:[number,number,number];point:Vec3;distance:number;bary:[number,number,number];}
    interface State{canvas:CanvasTarget|null;mode:Mode;enabled:boolean;backfaces:'exclude'|'include';faceAngle:number;selected:Map<string,Item>;cleanup:(()=>void)|null;overlay:HTMLCanvasElement|null;down:{x:number;y:number}|null;unsub:(()=>void)|null;}
    const States=new WeakMap<HTMLElement,State>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={canvas:null,mode:'object',enabled:true,backfaces:'exclude',faceAngle:1,selected:new Map(),cleanup:null,overlay:null,down:null,unsub:null};States.set(h,s);}return s;};

    @Component('arianna-selection-3d',{}, {Shadow:false,Attributes:['mode','enabled','backfaces','face-angle'],Properties:['canvas','selection']})
    export class Selection3D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();const s=state(this);if(options.mode)s.mode=options.mode;if(options.enabled!==undefined)s.enabled=options.enabled;if(options.backfaces)s.backfaces=options.backfaces;if(options.faceAngle!==undefined)s.faceAngle=options.faceAngle;if(options.canvas)this.attach(options.canvas);}
        public onCreated():void{this.style.display='none';}
        public onUnmount():void{this.detach();}
        public get mode():Mode{return state(this).mode;}
        public set mode(value:Mode){this.setMode(value);}
        public get canvas():CanvasTarget|null{return state(this).canvas;}
        public set canvas(value:CanvasTarget|null){value?this.attach(value):this.detach();}
        public get selection():Result{return this.result();}
        public setMode(mode:Mode):this{if(!['vertex','edge','polygon','face','object'].includes(mode))throw new TypeError('Invalid Selection3D mode');state(this).mode=mode;this.setAttribute('mode',mode);this.clear();this.dispatchEvent(new CustomEvent('arianna:selection-3d-mode',{bubbles:true,composed:true,detail:{mode,source:this}}));return this;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const s=state(this),surface=canvas.selectionSurface;s.canvas=canvas;surface.dataset.selection3dActive='true';
            const overlay=document.createElement('canvas');overlay.dataset.selection3d='';overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';canvas.appendChild(overlay);s.overlay=overlay;
            const down=(e:PointerEvent)=>{if(!s.enabled||e.button!==0)return;s.down={x:e.clientX,y:e.clientY};};
            const up=(e:PointerEvent)=>{if(!s.enabled||!s.down)return;const d=Math.hypot(e.clientX-s.down.x,e.clientY-s.down.y);s.down=null;if(d<=4)this.selectAt(e.clientX,e.clientY,e.altKey?'subtract':e.ctrlKey||e.metaKey?'toggle':e.shiftKey?'add':'replace');};
            const rectangle=(e:Event)=>{const detail=(e as CustomEvent<SelectionRectangleDetail>).detail;if(detail?.mode==='3d')this.selectRectangle(detail);};
            surface.addEventListener('pointerdown',down);surface.addEventListener('pointerup',up);canvas.addEventListener('arianna:selection-rectangle',rectangle);
            s.cleanup=()=>{delete surface.dataset.selection3dActive;surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointerup',up);canvas.removeEventListener('arianna:selection-rectangle',rectangle);};
            s.unsub=canvas.onFrame?.(()=>this.draw())??null;this.draw();return this;
        }
        public detach():this{const s=state(this);s.cleanup?.();s.unsub?.();s.overlay?.remove();s.cleanup=null;s.unsub=null;s.overlay=null;s.canvas=null;s.down=null;return this;}
        public clear():this{state(this).selected.clear();this.changed();return this;}
        public selectAt(clientX:number,clientY:number,operation:Operation='replace'):Result
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return this.result();const hit=this.pick(canvas.rayFromClient(clientX,clientY));if(!hit){if(operation==='replace')this.clear();return this.result();}this.apply([this.item(hit)],operation);return this.result();
        }
        public selectRectangle(detail:SelectionRectangleDetail):Result
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return this.result();const rect=detail.rect,items:Item[]=[];
            for(const mesh of canvas.getMeshes())
            {
                if(!mesh.visible)continue;const g=mesh.geometry,inside=(i:number)=>{const p=canvas.projectWorld(canvas.localToWorld(g.vertices[i],mesh));return p.visible&&p.x>=rect.left&&p.x<=rect.right&&p.y>=rect.top&&p.y<=rect.bottom;};
                if(s.mode==='object'){if(g.vertices.some((_,i)=>inside(i)))items.push(this.objectItem(mesh));continue;}
                if(s.mode==='vertex'){g.vertices.forEach((_,i)=>{if(inside(i))items.push(this.vertexItem(mesh,i));});continue;}
                for(let t=0;t<g.indices.length/3;t++){const ids=g.indices.slice(t*3,t*3+3),flags=ids.map(inside),accepted=detail.rule==='contain'?flags.every(Boolean):flags.some(Boolean);if(!accepted)continue;const hit={mesh,triangle:t,indices:ids as [number,number,number],point:this.center(mesh,ids),distance:0,bary:[1/3,1/3,1/3] as [number,number,number]};items.push(this.item(hit));}
            }
            this.apply(this.unique(items),detail.operation);return this.result();
        }
        /** Connect programmatic modifiers without importing their implementation. */
        public bindModifier(modifier:ModifierTarget,modes:Mode[]=['object','face','polygon']):()=>void
        {
            const update=()=>{const result=this.result();modifier.selection=result;if(!modes.includes(result.mode)||!result.items[0])return;modifier.bindMesh?.(result.items[0].mesh);modifier.apply?.();};
            this.addEventListener('arianna:selection-3d-change',update);update();return()=>this.removeEventListener('arianna:selection-3d-change',update);
        }
        private pick(ray:Ray):Hit|null
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return null;let best:Hit|null=null;
            for(const mesh of canvas.getMeshes())if(mesh.visible){const g=mesh.geometry;for(let t=0;t<g.indices.length/3;t++){const ids=g.indices.slice(t*3,t*3+3) as [number,number,number],a=canvas.localToWorld(g.vertices[ids[0]],mesh),b=canvas.localToWorld(g.vertices[ids[1]],mesh),c=canvas.localToWorld(g.vertices[ids[2]],mesh),edge1=sub(b,a),edge2=sub(c,a),p=cross(ray.direction,edge2),det=dot(edge1,p);if(s.backfaces==='exclude'&&det<=1e-8||Math.abs(det)<1e-8)continue;const inv=1/det,tv=sub(ray.origin,a),u=dot(tv,p)*inv;if(u<0||u>1)continue;const q=cross(tv,edge1),v=dot(ray.direction,q)*inv;if(v<0||u+v>1)continue;const distance=dot(edge2,q)*inv;if(distance<0||best&&distance>=best.distance)continue;best={mesh,triangle:t,indices:ids,point:add(ray.origin,scale(ray.direction,distance)),distance,bary:[1-u-v,u,v]};}}return best;
        }
        private item(hit:Hit):Item
        {
            const mode=state(this).mode;if(mode==='object')return this.objectItem(hit.mesh);if(mode==='vertex'){let n=0;if(hit.bary[1]>hit.bary[n])n=1;if(hit.bary[2]>hit.bary[n])n=2;return this.vertexItem(hit.mesh,hit.indices[n]);}
            if(mode==='edge'){let n=0;if(hit.bary[1]<hit.bary[n])n=1;if(hit.bary[2]<hit.bary[n])n=2;const edge:[number,number]=n===0?[hit.indices[1],hit.indices[2]]:n===1?[hit.indices[0],hit.indices[2]]:[hit.indices[0],hit.indices[1]],ids=[...edge].sort((a,b)=>a-b);return this.make(hit.mesh,mode,ids,[hit.triangle],hit.point,`e:${ids.join('-')}`,edge);}
            if(mode==='polygon')return this.make(hit.mesh,mode,[...hit.indices],[hit.triangle],hit.point,`p:${hit.triangle}`);
            const polygons=this.facePolygons(hit.mesh,hit.triangle),vertices=[...new Set(polygons.flatMap(t=>hit.mesh.geometry.indices.slice(t*3,t*3+3)))],faceId=hit.mesh.geometry.faceIds?.[hit.triangle]??polygons[0];return this.make(hit.mesh,mode,vertices,polygons,this.center(hit.mesh,vertices),`f:${faceId}`,undefined,faceId);
        }
        private facePolygons(mesh:Mesh,start:number):number[]
        {
            const g=mesh.geometry,explicit=g.faceIds?.[start];if(explicit!==undefined)return g.faceIds!.flatMap((id,i)=>id===explicit?[i]:[]);const ids=(t:number)=>g.indices.slice(t*3,t*3+3),normal=(t:number)=>{const a=g.vertices[g.indices[t*3]],b=g.vertices[g.indices[t*3+1]],c=g.vertices[g.indices[t*3+2]];return norm(cross(sub(b,a),sub(c,a)));},base=normal(start),limit=Math.cos(state(this).faceAngle*Math.PI/180),found=new Set([start]),queue=[start];while(queue.length){const current=queue.shift()!,a=ids(current);for(let t=0;t<g.indices.length/3;t++){if(found.has(t)||ids(t).filter(i=>a.includes(i)).length<2||dot(base,normal(t))<limit)continue;found.add(t);queue.push(t);}}return[...found];
        }
        private objectId(mesh:Mesh):string{return String(mesh.userData.id??mesh.userData.name??`mesh-${state(this).canvas?.getMeshes().indexOf(mesh)??0}`);}
        private make(mesh:Mesh,mode:Mode,vertexIndices:number[],polygonIndices:number[],point:Vec3,suffix:string,edge?:[number,number],faceId?:number):Item{const objectId=this.objectId(mesh);return{key:`${objectId}:${suffix}`,mode,mesh,objectId,vertexIndices,polygonIndices,point,edge,faceId};}
        private objectItem(mesh:Mesh):Item{return this.make(mesh,'object',mesh.geometry.vertices.map((_,i)=>i),mesh.geometry.indices.map((_,i)=>i).filter(i=>i%3===0).map(i=>i/3),this.center(mesh,mesh.geometry.vertices.map((_,i)=>i)),'object');}
        private vertexItem(mesh:Mesh,index:number):Item{return this.make(mesh,'vertex',[index],[],state(this).canvas!.localToWorld(mesh.geometry.vertices[index],mesh),`v:${index}`);}
        private center(mesh:Mesh,indices:number[]):Vec3{const canvas=state(this).canvas!,points=indices.map(i=>canvas.localToWorld(mesh.geometry.vertices[i],mesh));return scale(points.reduce(add,{x:0,y:0,z:0}),1/Math.max(1,points.length));}
        private unique(items:Item[]):Item[]{return[...new Map(items.map(item=>[item.key,item])).values()];}
        private apply(items:Item[],operation:Operation):void{const selected=state(this).selected;if(operation==='replace')selected.clear();for(const item of items){if(operation==='subtract')selected.delete(item.key);else if(operation==='toggle'&&selected.has(item.key))selected.delete(item.key);else selected.set(item.key,item);}this.changed();}
        private result():Result{const s=state(this),items=[...s.selected.values()];return{mode:s.mode,items,objects:[...new Set(items.map(i=>i.mesh))],vertices:items.filter(i=>i.mode==='vertex'),edges:items.filter(i=>i.mode==='edge'),polygons:items.filter(i=>i.mode==='polygon'),faces:items.filter(i=>i.mode==='face'),source:this};}
        private changed():void{this.draw();this.dispatchEvent(new CustomEvent('arianna:selection-3d-change',{bubbles:true,composed:true,detail:this.result()}));}
        private draw():void
        {
            const s=state(this),canvas=s.canvas,overlay=s.overlay;if(!canvas||!overlay)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(overlay.width!==w)overlay.width=w;if(overlay.height!==h)overlay.height=h;const ctx=overlay.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(dpr,dpr);ctx.strokeStyle='#ff45aa';ctx.fillStyle='#e40c88';ctx.lineWidth=2;
            for(const item of s.selected.values()){const points=item.vertexIndices.map(i=>canvas.projectWorld(canvas.localToWorld(item.mesh.geometry.vertices[i],item.mesh))).filter(p=>p.visible);if(item.mode==='vertex')for(const p of points){ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();}else if(item.mode==='edge'&&points.length===2){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);ctx.lineTo(points[1].x,points[1].y);ctx.stroke();}else for(const polygon of item.polygonIndices){const ids=item.mesh.geometry.indices.slice(polygon*3,polygon*3+3),p=ids.map(i=>canvas.projectWorld(canvas.localToWorld(item.mesh.geometry.vertices[i],item.mesh)));if(p.some(x=>!x.visible))continue;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();ctx.fillStyle='rgba(228,12,136,.25)';ctx.fill();ctx.stroke();}}ctx.restore();
        }
    }
}
export default Selection3D.Selection3D;
export type Selection3DMode=Selection3D.Mode;
export type Selection3DResult=Selection3D.Result;
export type Selection3DItem=Selection3D.Item;
