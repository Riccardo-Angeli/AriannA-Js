/** Mode-aware screen rectangle. Geometry selection remains delegated to its target. */
import { Component, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;
export namespace SelectionRectangle
{
    export type Mode='2d'|'3d';
    export type Rule='contain'|'intersect';
    export type Operation='replace'|'add'|'subtract'|'toggle';
    export interface ScreenRect{left:number;top:number;right:number;bottom:number;width:number;height:number;}
    export interface Target{selectionSurface:HTMLElement|SVGSVGElement;createSelectionVolume?(rect:ScreenRect):unknown;}
    export interface Options
    {
        mode?:Mode;enabled?:boolean;rule?:Rule;operation?:Operation;directionSensitive?:boolean;
        minimumSize?:number;activation?:'always'|'shift-drag';visibility?:'visible'|'through';
        backfaces?:'exclude'|'include';depth?:'scene'|'frontmost';
    }
    export interface Detail extends Required<Options>{rect:ScreenRect;direction:'left-to-right'|'right-to-left';volume?:unknown;source:SelectionRectangle;}
    const Defaults:Required<Options>={mode:'2d',enabled:true,rule:'intersect',operation:'replace',directionSensitive:true,minimumSize:3,activation:'always',visibility:'visible',backfaces:'exclude',depth:'frontmost'};
    const States=new WeakMap<HTMLElement,{options:Required<Options>;target:Target|null;cleanup:(()=>void)|null;overlay:HTMLElement|null;start:{x:number;y:number}|null}>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={options:{...Defaults},target:null,cleanup:null,overlay:null,start:null};States.set(h,s);}return s;};
    @Component('arianna-selection-rectangle',{}, {Shadow:false,Attributes:['mode','enabled'],Properties:['options','target']})
    export class SelectionRectangle extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onConnected():void{const mode=this.getAttribute('mode');if(mode==='2d'||mode==='3d')state(this).options.mode=mode;if(this.hasAttribute('disabled'))state(this).options.enabled=false;}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{return{...state(this).options};}
        public set options(v:Options){Object.assign(state(this).options,v);}
        public get mode():Mode{return state(this).options.mode;}
        public set mode(value:Mode){state(this).options.mode=value;this.setAttribute('mode',value);}
        public get target():Target|null{return state(this).target;}
        public set target(v:Target|null){v?this.attach(v):this.detach();}
        public attach(target:Target):this
        {
            this.detach();const s=state(this),surface=target.selectionSurface;s.target=target;
            const down=(e:PointerEvent)=>
            {
                if(e.button!==0||!s.options.enabled||(s.options.activation==='shift-drag'&&!e.shiftKey))return;
                const r=surface.getBoundingClientRect();s.start={x:e.clientX-r.left,y:e.clientY-r.top};
                const o=document.createElement('div');o.style.cssText='position:fixed;pointer-events:none;z-index:2147483000;border:1px solid #e40c88;background:#e40c8820';document.body.appendChild(o);s.overlay=o;surface.setPointerCapture(e.pointerId);e.preventDefault();
            };
            const move=(e:PointerEvent)=>{if(!s.start||!s.overlay)return;const r=surface.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;this.paint(r,s.start,{x,y});};
            const up=(e:PointerEvent)=>
            {
                if(!s.start)return;const r=surface.getBoundingClientRect(),end={x:e.clientX-r.left,y:e.clientY-r.top},start=s.start;s.start=null;s.overlay?.remove();s.overlay=null;
                if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);
                const rect=this.rect(start,end);if(rect.width<s.options.minimumSize&&rect.height<s.options.minimumSize)return;
                const direction=end.x>=start.x?'left-to-right':'right-to-left';
                const rule=s.options.directionSensitive?(direction==='left-to-right'?'contain':'intersect'):s.options.rule;
                const operation=e.altKey?'subtract':e.ctrlKey||e.metaKey?'toggle':e.shiftKey?'add':s.options.operation;
                const detail:Detail={...s.options,rule,operation,rect,direction,volume:target.createSelectionVolume?.(rect),source:this};
                this.dispatchEvent(new CustomEvent('arianna:selection-rectangle',{bubbles:true,composed:true,detail}));
            };
            surface.addEventListener('pointerdown',down as EventListener);surface.addEventListener('pointermove',move as EventListener);surface.addEventListener('pointerup',up as EventListener);surface.addEventListener('pointercancel',up as EventListener);
            s.cleanup=()=>{surface.removeEventListener('pointerdown',down as EventListener);surface.removeEventListener('pointermove',move as EventListener);surface.removeEventListener('pointerup',up as EventListener);surface.removeEventListener('pointercancel',up as EventListener);s.overlay?.remove();};return this;
        }
        public detach():this{const s=state(this);s.cleanup?.();s.cleanup=null;s.target=null;s.start=null;s.overlay=null;return this;}
        private rect(a:{x:number;y:number},b:{x:number;y:number}):ScreenRect{const left=Math.min(a.x,b.x),top=Math.min(a.y,b.y),right=Math.max(a.x,b.x),bottom=Math.max(a.y,b.y);return{left,top,right,bottom,width:right-left,height:bottom-top};}
        private paint(surface:DOMRect,a:{x:number;y:number},b:{x:number;y:number}):void{const o=state(this).overlay;if(!o)return;const r=this.rect(a,b);Object.assign(o.style,{left:`${surface.left+r.left}px`,top:`${surface.top+r.top}px`,width:`${r.width}px`,height:`${r.height}px`});}
    }
}
export default SelectionRectangle.SelectionRectangle;
export type SelectionRectangleOptions=SelectionRectangle.Options;
export type SelectionRectangleDetail=SelectionRectangle.Detail;
