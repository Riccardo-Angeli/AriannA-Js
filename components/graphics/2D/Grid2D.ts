/** Independent 2D reference grid and grid projection target. */
import { Component, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace Grid2D
{
    export interface Vec2{x:number;y:number;}
    export type Kind='cartesian'|'isometric'|'polar';
    export interface Options
    {
        enabled?:boolean;kind?:Kind;origin?:Vec2;stepX?:number;stepY?:number;
        subdivisions?:number;majorEvery?:number;minorOpacity?:number;majorOpacity?:number;
    }
    export interface Hit{point:Vec2;distance:number;u:number;v:number;major:boolean;}
    export interface CanvasTarget{world:HTMLElement;viewport?:{panX:number;panY:number;zoom:number};getGrid?():unknown;setGrid?(value:boolean|Record<string,unknown>):unknown;}

    const Defaults:Required<Options>={enabled:true,kind:'cartesian',origin:{x:0,y:0},stepX:20,stepY:20,subdivisions:4,majorEvery:5,minorOpacity:.10,majorOpacity:.22};
    const States=new WeakMap<HTMLElement,Required<Options>>();
    const state=(host:HTMLElement)=>{let s=States.get(host);if(!s){s={...Defaults,origin:{...Defaults.origin}};States.set(host,s);}return s;};
    const Overlays=new WeakMap<HTMLElement,HTMLElement>();
    const Targets=new WeakMap<HTMLElement,{canvas:CanvasTarget;previous?:unknown}>();

    @Component('arianna-grid-2d',{}, {Shadow:false,Attributes:['enabled','kind','step-x','step-y','subdivisions','major-every'],Properties:['options']})
    export class Grid2D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{const s=state(this);return{...s,origin:{...s.origin}};}
        public set options(value:Options){const s=state(this);Object.assign(s,value);if(value.origin)s.origin={...value.origin};this.NormalizeOptions();this.render();}
        public configure(value:Options):this{this.options=value;return this;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const previous=canvas.getGrid?.();canvas.setGrid?.(false);Targets.set(this,{canvas,previous});
            const overlay=document.createElement('div');overlay.dataset.grid2d='';
            overlay.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:0;transform-origin:0 0';
            canvas.world.prepend(overlay);Overlays.set(this,overlay);this.render();return this;
        }
        public detach():this{const target=Targets.get(this);Overlays.get(this)?.remove();Overlays.delete(this);if(target?.previous&&target.canvas.setGrid)target.canvas.setGrid(target.previous as Record<string,unknown>);Targets.delete(this);return this;}
        public nearest(point:Vec2):Hit
        {
            const s=state(this),sx=s.stepX/s.subdivisions,sy=s.stepY/s.subdivisions;
            if(s.kind==='polar')
            {
                const dx=point.x-s.origin.x,dy=point.y-s.origin.y,r=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
                const rr=Math.round(r/sx)*sx,aa=Math.round(angle/(Math.PI/12))*(Math.PI/12);
                const p={x:s.origin.x+Math.cos(aa)*rr,y:s.origin.y+Math.sin(aa)*rr};
                return{point:p,distance:Math.hypot(p.x-point.x,p.y-point.y),u:rr,v:aa,major:Math.round(rr/s.stepX)%s.majorEvery===0};
            }
            const u=Math.round((point.x-s.origin.x)/sx),v=Math.round((point.y-s.origin.y)/sy);
            const p=s.kind==='isometric'
                ?{x:s.origin.x+(u-v)*sx,y:s.origin.y+(u+v)*sy*.5}
                :{x:s.origin.x+u*sx,y:s.origin.y+v*sy};
            return{point:p,distance:Math.hypot(p.x-point.x,p.y-point.y),u,v,major:u%s.majorEvery===0&&v%s.majorEvery===0};
        }
        public project(point:Vec2):Vec2{return this.nearest(point).point;}
        private NormalizeOptions():void{const s=state(this);s.stepX=Math.max(.0001,Number(s.stepX)||20);s.stepY=Math.max(.0001,Number(s.stepY)||s.stepX);s.subdivisions=Math.max(1,Math.round(Number(s.subdivisions)||1));s.majorEvery=Math.max(1,Math.round(Number(s.majorEvery)||1));}
        private render():void
        {
            const s=state(this),el=Overlays.get(this);if(!el)return;el.hidden=!s.enabled;
            const minorX=s.stepX/s.subdivisions,minorY=s.stepY/s.subdivisions;
            const minor=`rgba(255,255,255,${s.minorOpacity})`,major=`rgba(255,255,255,${s.majorOpacity})`;
            if(s.kind==='polar')el.style.backgroundImage=`repeating-radial-gradient(circle at ${s.origin.x}px ${s.origin.y}px,transparent 0 ${minorX-1}px,${minor} ${minorX}px),conic-gradient(from 0deg at ${s.origin.x}px ${s.origin.y}px,transparent 0 14.7deg,${minor} 15deg)`;
            else if(s.kind==='isometric')el.style.backgroundImage=`linear-gradient(30deg,transparent 49.5%,${minor} 50%,transparent 50.5%),linear-gradient(150deg,transparent 49.5%,${minor} 50%,transparent 50.5%)`;
            else el.style.backgroundImage=`linear-gradient(to right,${minor} 1px,transparent 1px),linear-gradient(to bottom,${minor} 1px,transparent 1px),linear-gradient(to right,${major} 1px,transparent 1px),linear-gradient(to bottom,${major} 1px,transparent 1px)`;
            el.style.backgroundSize=s.kind==='cartesian'?`${minorX}px ${minorY}px,${minorX}px ${minorY}px,${s.stepX*s.majorEvery}px ${s.stepY*s.majorEvery}px,${s.stepX*s.majorEvery}px ${s.stepY*s.majorEvery}px`:`${s.stepX}px ${s.stepY}px`;
            el.style.backgroundPosition=`${s.origin.x}px ${s.origin.y}px`;
        }
    }
}
export default Grid2D.Grid2D;
export type Grid2DOptions=Grid2D.Options;
export type Grid2DHit=Grid2D.Hit;
