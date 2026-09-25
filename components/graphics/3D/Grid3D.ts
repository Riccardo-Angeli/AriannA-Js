/** Independent oriented 3D construction grid and snap target. */
import { Component, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;
export namespace Grid3D
{
    export interface Vec3{x:number;y:number;z:number;}
    export type Plane='xy'|'xz'|'yz'|'custom';
    export interface Options{enabled?:boolean;plane?:Plane;origin?:Vec3;axisU?:Vec3;axisV?:Vec3;stepU?:number;stepV?:number;subdivisions?:number;majorEvery?:number;size?:number;infinite?:boolean;}
    export interface Hit{point:Vec3;distance:number;u:number;v:number;major:boolean;}
    export interface CanvasTarget extends HTMLElement{canvas?:HTMLCanvasElement;projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean};onFrame?(callback:(dt:number)=>void):()=>void;}
    const v=(x=0,y=0,z=0):Vec3=>({x,y,z}),add=(a:Vec3,b:Vec3)=>v(a.x+b.x,a.y+b.y,a.z+b.z),scale=(a:Vec3,k:number)=>v(a.x*k,a.y*k,a.z*k),sub=(a:Vec3,b:Vec3)=>v(a.x-b.x,a.y-b.y,a.z-b.z),dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z,len=(a:Vec3)=>Math.hypot(a.x,a.y,a.z),norm=(a:Vec3)=>{const l=len(a)||1;return scale(a,1/l);};
    const axes=(plane:Plane):[Vec3,Vec3]=>plane==='xy'?[v(1,0,0),v(0,1,0)]:plane==='yz'?[v(0,1,0),v(0,0,1)]:[v(1,0,0),v(0,0,1)];
    const Defaults:Required<Options>={enabled:true,plane:'xz',origin:v(),axisU:v(1,0,0),axisV:v(0,0,1),stepU:1,stepV:1,subdivisions:10,majorEvery:10,size:10,infinite:true};
    const States=new WeakMap<HTMLElement,Required<Options>>(),Attachments=new WeakMap<HTMLElement,{canvas:CanvasTarget;overlay:HTMLCanvasElement;unsub:(()=>void)|null}>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={...Defaults,origin:{...Defaults.origin},axisU:{...Defaults.axisU},axisV:{...Defaults.axisV}};States.set(h,s);}return s;};
    @Component('arianna-grid-3d',{}, {Shadow:false,Attributes:['enabled','plane','step-u','step-v','subdivisions','major-every','size','infinite'],Properties:['options']})
    export class Grid3D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{const s=state(this);return{...s,origin:{...s.origin},axisU:{...s.axisU},axisV:{...s.axisV}};}
        public set options(o:Options){const s=state(this);Object.assign(s,o);if(o.origin)s.origin={...o.origin};if(o.axisU)s.axisU=norm(o.axisU);if(o.axisV)s.axisV=norm(o.axisV);if(o.plane&&o.plane!=='custom')[s.axisU,s.axisV]=axes(o.plane);s.stepU=Math.max(.0001,Number(s.stepU)||1);s.stepV=Math.max(.0001,Number(s.stepV)||1);s.subdivisions=Math.max(1,Math.round(Number(s.subdivisions)||1));s.majorEvery=Math.max(1,Math.round(Number(s.majorEvery)||1));s.size=Math.max(1,Number(s.size)||10);this.draw();}
        public setPlane(plane:Plane|{origin:Vec3;axisU:Vec3;axisV:Vec3}):this{this.options=typeof plane==='string'?{plane}:{plane:'custom',...plane};return this;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const overlay=document.createElement('canvas');overlay.dataset.grid3d='';overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';canvas.appendChild(overlay);
            const unsub=canvas.onFrame?.(()=>this.draw())??null;Attachments.set(this,{canvas,overlay,unsub});this.draw();return this;
        }
        public detach():this{const a=Attachments.get(this);a?.unsub?.();a?.overlay.remove();Attachments.delete(this);return this;}
        public nearest(point:Vec3):Hit
        {
            const s=state(this),d=sub(point,s.origin),du=s.stepU/s.subdivisions,dv=s.stepV/s.subdivisions,u=Math.round(dot(d,s.axisU)/du),vv=Math.round(dot(d,s.axisV)/dv),p=add(s.origin,add(scale(s.axisU,u*du),scale(s.axisV,vv*dv)));
            return{point:p,distance:len(sub(p,point)),u,v:vv,major:u%s.majorEvery===0&&vv%s.majorEvery===0};
        }
        public project(point:Vec3):Vec3{return this.nearest(point).point;}
        private draw():void
        {
            const a=Attachments.get(this),s=state(this);if(!a)return;const c=a.overlay,r=a.canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;const ctx=c.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,w,h);if(!s.enabled)return;ctx.save();ctx.scale(dpr,dpr);const count=Math.min(160,Math.ceil(s.size/(Math.min(s.stepU,s.stepV)/s.subdivisions))),du=s.stepU/s.subdivisions,dv=s.stepV/s.subdivisions;
            const line=(a3:Vec3,b3:Vec3,major:boolean)=>{const p=a.canvas.projectWorld(a3),q=a.canvas.projectWorld(b3);if(!p.visible&&!q.visible)return;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=major?'rgba(228,12,136,.42)':'rgba(150,160,170,.18)';ctx.lineWidth=major?1:.65;ctx.stroke();};
            for(let i=-count;i<=count;i++){const major=i%(s.majorEvery*s.subdivisions)===0;line(add(s.origin,add(scale(s.axisU,-count*du),scale(s.axisV,i*dv))),add(s.origin,add(scale(s.axisU,count*du),scale(s.axisV,i*dv))),major);line(add(s.origin,add(scale(s.axisV,-count*dv),scale(s.axisU,i*du))),add(s.origin,add(scale(s.axisV,count*dv),scale(s.axisU,i*du))),major);}ctx.restore();
        }
    }
}
export default Grid3D.Grid3D;
export type Grid3DOptions=Grid3D.Options;
export type Grid3DHit=Grid3D.Hit;
