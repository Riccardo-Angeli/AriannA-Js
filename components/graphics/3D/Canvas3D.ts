/**
 * @module components/graphics/3D/Canvas3D
 * @author Riccardo Angeli
 * @version 2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Minimal interactive 3D canvas for AriannA examples: one rendered cube,
 * orbit rotation and wheel zoom. It intentionally contains no modifier UI. Modifier
 * components are independent floating siblings and bind through viewport="..." + for="cube".
 */
import { Component, Css, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace Canvas3D
{
    export interface Vec3 { x:number; y:number; z:number; }
    export interface Geometry3 { vertices:Vec3[]; normals:Vec3[]; indices:number[]; clone():Geometry3; }
    export interface Mesh3 { geometry:Geometry3; position:Vec3; rotation:Vec3; scale:Vec3; visible:boolean; userData:Record<string,unknown>; updateMatrix?():void; }
    export interface Scene3 { children:Mesh3[]; add(obj:Mesh3):void; remove(obj:Mesh3):void; }
    export interface Camera3 { position:Vec3; }

    const cloneGeometry=(g:Geometry3):Geometry3=>({vertices:g.vertices.map(v=>({...v})),normals:g.normals.map(v=>({...v})),indices:[...g.indices],clone(){return cloneGeometry(this);}});
    const norm=(v:Vec3):Vec3=>{const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l};};
    const sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
    const cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
    const dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z;

    function CubeGeometry(size=1.7,segments=7):Geometry3
    {
        const h=size/2,vertices:Vec3[]=[],normals:Vec3[]=[],indices:number[]=[];
        const addFace=(origin:Vec3,u:Vec3,v:Vec3,n:Vec3)=>{
            const start=vertices.length;
            for(let y=0;y<=segments;y++)for(let x=0;x<=segments;x++){
                const a=x/segments,b=y/segments;
                vertices.push({x:origin.x+u.x*a+v.x*b,y:origin.y+u.y*a+v.y*b,z:origin.z+u.z*a+v.z*b}); normals.push({...n});
            }
            const row=segments+1;
            for(let y=0;y<segments;y++)for(let x=0;x<segments;x++){const a=start+y*row+x,b=a+1,c=a+row+1,d=a+row;indices.push(a,b,c,a,c,d);}
        };
        addFace({x:-h,y:-h,z:h},{x:size,y:0,z:0},{x:0,y:size,z:0},{x:0,y:0,z:1});
        addFace({x:h,y:-h,z:-h},{x:-size,y:0,z:0},{x:0,y:size,z:0},{x:0,y:0,z:-1});
        addFace({x:-h,y:h,z:h},{x:size,y:0,z:0},{x:0,y:0,z:-size},{x:0,y:1,z:0});
        addFace({x:-h,y:-h,z:-h},{x:size,y:0,z:0},{x:0,y:0,z:size},{x:0,y:-1,z:0});
        addFace({x:h,y:-h,z:h},{x:0,y:0,z:-size},{x:0,y:size,z:0},{x:1,y:0,z:0});
        addFace({x:-h,y:-h,z:-h},{x:0,y:0,z:size},{x:0,y:size,z:0},{x:-1,y:0,z:0});
        const g:Geometry3={vertices,normals,indices,clone(){return cloneGeometry(this);}}; return g;
    }

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-canvas-3d,.Canvas3D',{Background:'#13161a',Border:'1px solid #30363d',BorderRadius:'10px',BoxSizing:'border-box',Display:'block',Height:'520px',MaxWidth:'100%',MinHeight:'260px',MinWidth:'0',Overflow:'hidden',Position:'relative',Width:'100%'}),
        new Css.Rule('.Canvas3D-Canvas',{Cursor:'grab',Display:'block',Height:'100%',TouchAction:'none',Width:'100%'}),
        new Css.Rule('.Canvas3D-Canvas:active',{Cursor:'grabbing'}),
        new Css.Rule('arianna-canvas-3d[theme="light"],.Canvas3D[theme="light"]',{Background:'#eef1f4',BorderColor:'#c4cbd1'}),
    ]);

    @Component('arianna-canvas-3d',Styles,{Shadow:false,Attributes:['theme','color','mesh-id','orbit','zoom','yaw','pitch','cube-x','cube-y','cube-z','cube-rotation-x','cube-rotation-y','cube-rotation-z']})
    export class Canvas3D extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;
        public scene:Scene3;
        public camera:Camera3={position:{x:3.5,y:2.5,z:4.5}};
        public canvas?:HTMLCanvasElement;
        private ctx:CanvasRenderingContext2D|null=null;
        private meshes=new Map<string,Mesh3>();
        private frameCallbacks=new Set<(dt:number)=>void>();
        private raf=0; private last=0; private resizeObserver:ResizeObserver|null=null;
        private yaw=.72; private pitch=.42; private distance=4.6; private dragging=false; private px=0; private py=0;

        constructor()
        {
            super();
            this.scene={children:[],add:(obj)=>{if(!this.scene.children.includes(obj))this.scene.children.push(obj);},remove:(obj)=>{const i=this.scene.children.indexOf(obj);if(i>=0)this.scene.children.splice(i,1);}};
        }

        onCreated():void{if(this.isConnected)this.onConnected();}
        onConnected():void
        {
            if(this.canvas) return;
            this.classList.add('Canvas3D'); if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            this.yaw=parseFloat(this.getAttribute('yaw')??'.72')||.72; this.pitch=parseFloat(this.getAttribute('pitch')??'.42')||.42; this.distance=parseFloat(this.getAttribute('zoom')??'4.6')||4.6;
            const canvas=document.createElement('canvas'); canvas.className='Canvas3D-Canvas'; this.replaceChildren(canvas); this.canvas=canvas; this.ctx=canvas.getContext('2d');
            this.createCube(); this.wireOrbit(); this.resizeObserver=new ResizeObserver(()=>this.resize()); this.resizeObserver.observe(this); this.resize();
            this.last=performance.now(); this.raf=requestAnimationFrame(t=>this.loop(t));
        }
        onMount():void{this.onConnected();}
        onUnmount():void{cancelAnimationFrame(this.raf);this.resizeObserver?.disconnect();this.resizeObserver=null;this.frameCallbacks.clear();this.canvas=undefined;this.ctx=null;this.meshes.clear();this.scene.children.length=0;}
        onAttributeChanged():void{if(!this.canvas)return;this.syncAttributes();this.invalidate();}

        private createCube():void
        {
            const id=this.getAttribute('mesh-id')||'cube';
            const cube:Mesh3={geometry:CubeGeometry(),position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},visible:true,userData:{color:this.getAttribute('color')||'#8f9aa6'}};
            this.meshes.set(id,cube); this.scene.add(cube); this.syncAttributes();
        }
        private syncAttributes():void
        {
            const cube=this.findMesh(this.getAttribute('mesh-id')||'cube'); if(!cube)return;
            const num=(name:string,fallback:number)=>{const v=parseFloat(this.getAttribute(name)??String(fallback));return Number.isFinite(v)?v:fallback;};
            cube.position.x=num('cube-x',cube.position.x);cube.position.y=num('cube-y',cube.position.y);cube.position.z=num('cube-z',cube.position.z);
            cube.rotation.x=num('cube-rotation-x',cube.rotation.x);cube.rotation.y=num('cube-rotation-y',cube.rotation.y);cube.rotation.z=num('cube-rotation-z',cube.rotation.z);
            cube.userData.color=this.getAttribute('color')||cube.userData.color||'#8f9aa6';
        }
        public findMesh(id:string):Mesh3|null{return this.meshes.get(id)??null;}
        public getCube():Mesh3|null{return this.findMesh(this.getAttribute('mesh-id')||'cube');}
        public resetCube():this{const cube=this.getCube();if(cube){cube.geometry=CubeGeometry();cube.position={x:0,y:0,z:0};cube.rotation={x:0,y:0,z:0};cube.scale={x:1,y:1,z:1};cube.visible=true;cube.userData={color:this.getAttribute('color')||'#8f9aa6'};this.syncAttributes();}return this;}
        public onFrame(cb:(dt:number)=>void):()=>void{this.frameCallbacks.add(cb);return()=>this.frameCallbacks.delete(cb);}
        public invalidate():void{}

        private resize():void
        {
            if(!this.canvas)return; const dpr=Math.min(2,window.devicePixelRatio||1),r=this.getBoundingClientRect(); const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr)); if(this.canvas.width!==w)this.canvas.width=w;if(this.canvas.height!==h)this.canvas.height=h;
        }
        private wireOrbit():void
        {
            if(!this.canvas)return; const c=this.canvas;
            c.addEventListener('pointerdown',e=>{if(this.getAttribute('orbit')==='false')return;this.dragging=true;this.px=e.clientX;this.py=e.clientY;c.setPointerCapture(e.pointerId);});
            c.addEventListener('pointermove',e=>{if(!this.dragging||this.getAttribute('orbit')==='false')return;this.yaw+=(e.clientX-this.px)*.009;this.pitch=Math.max(-1.25,Math.min(1.25,this.pitch+(e.clientY-this.py)*.009));this.px=e.clientX;this.py=e.clientY;});
            const up=()=>this.dragging=false;c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
            c.addEventListener('wheel',e=>{e.preventDefault();this.distance=Math.max(2.2,Math.min(12,this.distance*Math.exp(e.deltaY*.0012)));},{passive:false});
        }
        private loop(time:number):void
        {
            const dt=Math.min(.05,Math.max(0,(time-this.last)/1000));this.last=time;
            for(const cb of [...this.frameCallbacks]){try{cb(dt);}catch(error){console.warn('[Canvas3D] frame callback',error);}}
            this.render(); this.raf=requestAnimationFrame(t=>this.loop(t));
        }

        private transform(v:Vec3,m:Mesh3):Vec3
        {
            let x=v.x*m.scale.x,y=v.y*m.scale.y,z=v.z*m.scale.z;
            let c=Math.cos(m.rotation.x),s=Math.sin(m.rotation.x);[y,z]=[y*c-z*s,y*s+z*c]; c=Math.cos(m.rotation.y);s=Math.sin(m.rotation.y);[x,z]=[x*c+z*s,-x*s+z*c]; c=Math.cos(m.rotation.z);s=Math.sin(m.rotation.z);[x,y]=[x*c-y*s,x*s+y*c];
            return{x:x+m.position.x,y:y+m.position.y,z:z+m.position.z};
        }
        private color(hex:string,shade:number,alpha:number):string
        {
            const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);const r=(n>>16)&255,g=(n>>8)&255,b=n&255;const k=Math.max(.18,Math.min(1.35,shade));return`rgba(${Math.round(r*k)},${Math.round(g*k)},${Math.round(b*k)},${Math.max(0,Math.min(1,alpha))})`;
        }
        private render():void
        {
            const canvas=this.canvas,ctx=this.ctx;if(!canvas||!ctx)return;const w=canvas.width,h=canvas.height,dpr=Math.min(2,window.devicePixelRatio||1);
            const light=this.getAttribute('theme')==='light';const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,light?'#f5f7f9':'#20252b');grad.addColorStop(1,light?'#dfe4e8':'#111418');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
            const cp=Math.cos(this.pitch);this.camera.position={x:this.distance*Math.sin(this.yaw)*cp,y:this.distance*Math.sin(this.pitch),z:this.distance*Math.cos(this.yaw)*cp};
            const target={x:0,y:0,z:0},forward=norm(sub(target,this.camera.position)),right=norm(cross(forward,{x:0,y:1,z:0})),up=cross(right,forward),focal=(h/dpr)*.82*dpr;
            type Tri={p:[{x:number;y:number;z:number},{x:number;y:number;z:number},{x:number;y:number;z:number}];depth:number;shade:number;color:string;alpha:number};const tris:Tri[]=[];
            for(const mesh of this.scene.children){if(!mesh.visible)continue;const g=mesh.geometry,opacity=Number(mesh.userData['_arianna_opacity']??1),base=String(mesh.userData.color??this.getAttribute('color')??'#8f9aa6');const projected=g.vertices.map(v=>{const world=this.transform(v,mesh),rel=sub(world,this.camera.position),z=dot(rel,forward);return{x:w/2+focal*dot(rel,right)/Math.max(.08,z),y:h/2-focal*dot(rel,up)/Math.max(.08,z),z,world};});for(let i=0;i<g.indices.length;i+=3){const ia=g.indices[i],ib=g.indices[i+1],ic=g.indices[i+2],a=projected[ia],b=projected[ib],c=projected[ic];if(!a||!b||!c||a.z<=.08||b.z<=.08||c.z<=.08)continue;const wa=a.world,wb=b.world,wc=c.world,n=norm(cross(sub(wb,wa),sub(wc,wa))),ld=norm({x:-.45,y:.75,z:.6}),shade=.42+.58*Math.max(0,dot(n,ld));tris.push({p:[a,b,c],depth:(a.z+b.z+c.z)/3,shade,color:base,alpha:opacity});}}
            tris.sort((a,b)=>b.depth-a.depth);ctx.lineJoin='round';for(const tri of tris){ctx.beginPath();ctx.moveTo(tri.p[0].x,tri.p[0].y);ctx.lineTo(tri.p[1].x,tri.p[1].y);ctx.lineTo(tri.p[2].x,tri.p[2].y);ctx.closePath();ctx.fillStyle=this.color(tri.color,tri.shade,tri.alpha);ctx.fill();ctx.strokeStyle=light?'rgba(35,40,45,.10)':'rgba(255,255,255,.055)';ctx.lineWidth=.7*dpr;ctx.stroke();}
        }
    }
}
export type Canvas3DMesh=Canvas3D.Mesh3;
export type Canvas3DGeometry=Canvas3D.Geometry3;
export default Canvas3D.Canvas3D;
