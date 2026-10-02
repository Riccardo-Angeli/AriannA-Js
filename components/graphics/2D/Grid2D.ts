/** Independent 2D reference grid and grid projection target. */
import { Component, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace Grid2D
{
    export interface Vec2{x:number;y:number;}
    export type Kind='cartesian'|'isometric'|'polar'|'dotted';
    export interface Options
    {
        theme?:'auto'|'dark'|'light';enabled?:boolean;kind?:Kind;origin?:Vec2;stepX?:number;stepY?:number;
        subdivisions?:number;majorEvery?:number;minorOpacity?:number;majorOpacity?:number;dotRadius?:number;majorDotRadius?:number;
    }
    export interface Hit{point:Vec2;distance:number;u:number;v:number;major:boolean;}
    export interface CanvasTarget{world:HTMLElement;viewport?:{panX:number;panY:number;zoom:number};getGrid?():unknown;setGrid?(value:boolean|Record<string,unknown>):unknown;}

    const Defaults:Required<Options>={theme:'auto',enabled:true,kind:'cartesian',origin:{x:0,y:0},stepX:20,stepY:20,subdivisions:4,majorEvery:5,minorOpacity:.10,majorOpacity:.22,dotRadius:1,majorDotRadius:1.6};
    const States=new WeakMap<HTMLElement,Required<Options>>();
    const state=(host:HTMLElement)=>{let s=States.get(host);if(!s){s={...Defaults,origin:{...Defaults.origin}};States.set(host,s);}return s;};
    const ExplicitOpacity=new WeakMap<HTMLElement,Set<string>>();
    const ThemeObservers=new WeakMap<HTMLElement,MutationObserver>();
    // Light defaults preserve the minor/major hierarchy with comparable Dark contrast.
    const LightDefaults={minorOpacity:.153,majorOpacity:.321};
    const Overlays=new WeakMap<HTMLElement,HTMLElement>();
    const Targets=new WeakMap<HTMLElement,{canvas:CanvasTarget;previous?:unknown}>();

    @Component('arianna-grid-2d',{}, {Shadow:false,Attributes:['theme','enabled','kind','step-x','step-y','subdivisions','major-every','dot-radius','major-dot-radius'],Properties:['options']})
    export class Grid2D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onConnected():void{for(const name of ['theme','enabled','kind','step-x','step-y','subdivisions','major-every','dot-radius','major-dot-radius'])if(this.hasAttribute(name))this.onAttributeChanged(name);}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{
            const s=state(this),explicit=ExplicitOpacity.get(this),theme=this.Theme();
            return {...s,origin:{...s.origin},minorOpacity:theme==='light'&&!explicit?.has('minorOpacity')?LightDefaults.minorOpacity:s.minorOpacity,majorOpacity:theme==='light'&&!explicit?.has('majorOpacity')?LightDefaults.majorOpacity:s.majorOpacity};
        }
        private Theme():'dark'|'light'{const s=state(this);if(s.theme!=='auto')return s.theme;const host=Targets.get(this)?.canvas.world.closest('[theme]');return host?.getAttribute('theme')==='light'?'light':'dark';}
        public set options(value:Options){const s=state(this);let explicit=ExplicitOpacity.get(this);if(!explicit){explicit=new Set();ExplicitOpacity.set(this,explicit);}for(const key of ['minorOpacity','majorOpacity'] as const)if(value[key]!==undefined)explicit.add(key);Object.assign(s,Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined)));if(value.origin)s.origin={...value.origin};this.NormalizeOptions();this.render();}
        public configure(value:Options):this{this.options=value;return this;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const previous=canvas.getGrid?.();canvas.setGrid?.(false);Targets.set(this,{canvas,previous});
            const overlay=document.createElement('div');overlay.dataset.grid2d='';
            overlay.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:0;transform-origin:0 0';
            canvas.world.prepend(overlay);Overlays.set(this,overlay);
            const host=canvas.world.closest('[theme]');
            if(host&&typeof MutationObserver==='function'){const observer=new MutationObserver(()=>this.render());observer.observe(host,{attributes:true,attributeFilter:['theme']});ThemeObservers.set(this,observer);}
            this.render();return this;
        }
        public detach():this{ThemeObservers.get(this)?.disconnect();ThemeObservers.delete(this);const target=Targets.get(this);Overlays.get(this)?.remove();Overlays.delete(this);if(target?.previous&&target.canvas.setGrid)target.canvas.setGrid(target.previous as Record<string,unknown>);Targets.delete(this);return this;}
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
        public onAttributeChanged(name:string):void {
            const attrs:Record<string,keyof Options>={'theme':'theme','enabled':'enabled','kind':'kind','step-x':'stepX','step-y':'stepY','subdivisions':'subdivisions','major-every':'majorEvery','dot-radius':'dotRadius','major-dot-radius':'majorDotRadius'};
            const key=attrs[name],value=this.getAttribute(name);if(!key||value===null)return;
            this.configure({[key]:key==='enabled'?value!=='false':key==='kind'||key==='theme'?value:Number(value)});
        }
        private NormalizeOptions():void{const s=state(this);if(!['auto','dark','light'].includes(s.theme))s.theme='auto';s.stepX=Math.max(.0001,Number(s.stepX)||20);s.stepY=Math.max(.0001,Number(s.stepY)||s.stepX);s.subdivisions=Math.max(1,Math.round(Number(s.subdivisions)||1));s.majorEvery=Math.max(1,Math.round(Number(s.majorEvery)||1));s.dotRadius=Math.max(.25,Number(s.dotRadius)||1);s.majorDotRadius=Math.max(.25,Number(s.majorDotRadius)||1.6);if(!['cartesian','dotted','polar','isometric'].includes(s.kind))s.kind='cartesian';}
        private render():void
        {
            const s=this.options,el=Overlays.get(this);if(!el)return;el.hidden=!s.enabled;
            const minorX=s.stepX/s.subdivisions,minorY=s.stepY/s.subdivisions;
            const rgb=this.Theme()==='light'?'0,0,0':'255,255,255';
            const minor=`rgba(${rgb},${s.minorOpacity})`,major=`rgba(${rgb},${s.majorOpacity})`;
            el.dataset.gridTheme=this.Theme();
            if(s.kind==='dotted') {
                const majorX=s.stepX*s.majorEvery,majorY=s.stepY*s.majorEvery;
                el.style.backgroundImage=`radial-gradient(circle,${major} ${s.majorDotRadius}px,transparent ${s.majorDotRadius+.3}px),radial-gradient(circle,${minor} ${s.dotRadius}px,transparent ${s.dotRadius+.3}px)`;
                el.style.backgroundSize=`${majorX}px ${majorY}px,${minorX}px ${minorY}px`;
                el.style.backgroundPosition=`${s.origin.x-majorX/2}px ${s.origin.y-majorY/2}px,${s.origin.x-minorX/2}px ${s.origin.y-minorY/2}px`;
                return;
            }
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
