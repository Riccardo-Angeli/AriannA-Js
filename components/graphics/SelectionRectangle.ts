/** Mode-aware screen rectangle. Geometry selection remains delegated to its target. */
import { Component, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;
export namespace SelectionRectangle
{
    export type Mode='2d'|'3d';
    export type Rule='contain'|'intersect';
    export type Operation='replace'|'add'|'subtract'|'toggle';
    export interface ScreenRect{left:number;top:number;right:number;bottom:number;width:number;height:number;}
    export interface Target{selectionSurface:HTMLElement|SVGSVGElement;createSelectionVolume?(rect:ScreenRect):unknown;selectRectangle?(detail:Detail):unknown;clearSelection?():unknown;}
    export interface Options
    {
        mode?:Mode;enabled?:boolean;rule?:Rule;operation?:Operation;directionSensitive?:boolean;
        minimumSize?:number;activation?:'always'|'shift-drag';visibility?:'visible'|'through';
        backfaces?:'exclude'|'include';depth?:'scene'|'frontmost';
    }
    export interface Detail extends Required<Options>{rect:ScreenRect;direction:'left-to-right'|'right-to-left';volume?:unknown;selection?:unknown;source:SelectionRectangle;}
    const Defaults:Required<Options>={mode:'2d',enabled:true,rule:'intersect',operation:'replace',directionSensitive:true,minimumSize:3,activation:'always',visibility:'visible',backfaces:'exclude',depth:'frontmost'};
    const States=new WeakMap<HTMLElement,{options:Required<Options>;target:Target|null;cleanup:(()=>void)|null;overlay:HTMLElement|null;start:{x:number;y:number}|null;pointerId:number|null;selected:Map<number,unknown>;initial:Map<number,unknown>|null}>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={options:{...Defaults},target:null,cleanup:null,overlay:null,start:null,pointerId:null,selected:new Map(),initial:null};States.set(h,s);}return s;};
    @Component('arianna-selection-rectangle',{}, {Shadow:false,Attributes:['for','mode','enabled','disabled','activation','rule','operation','direction-sensitive','minimum-size','visibility','backfaces','depth'],Properties:['options','target','Selected']})
    export class SelectionRectangle extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onConnected():void{this.readAttributes();queueMicrotask(()=>this.autoAttach());}
        public onAttributeChanged():void{this.readAttributes();if(this.isConnected)queueMicrotask(()=>this.autoAttach());}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{return{...state(this).options};}
        public set options(v:Options){Object.assign(state(this).options,v);}
        public get mode():Mode{return state(this).options.mode;}
        public set mode(value:Mode){state(this).options.mode=value;this.setAttribute('mode',value);}
        public get target():Target|null{return state(this).target;}
        public set target(v:Target|null){v?this.attach(v):this.detach();}
        /** Enumerable indices in the selectable array, with identity-preserving values.
         * The returned Map is a snapshot; mutation goes through select/clearSelection. */
        public get Selected():ReadonlyMap<number,unknown>{return new Map(state(this).selected);}
        public get selected():unknown[]{return [...state(this).selected.values()];}
        public clearSelection():this {
            const s=state(this);s.target?.clearSelection?.();
            this.storeSelection(new Map());return this;
        }
        public select(items:Iterable<unknown>,operation:Operation='replace'):this {
            const s=state(this),candidates=s.target?.selectionSurface.querySelectorAll<Element>('[data-selectable],[data-id]');
            const values=candidates?[...candidates]:[],next=operation==='replace'?new Map<number,unknown>():new Map(s.selected);
            for(const item of items){let index=values.indexOf(item as Element);if(index<0)index=[...next.values()].indexOf(item);
                if(index<0)index=Math.max(-1,...next.keys())+1;
                if(operation==='subtract'||operation==='toggle'&&next.has(index))next.delete(index);else next.set(index,item);
            }
            this.storeSelection(next);return this;
        }
        private storeSelection(next:Map<number,unknown>):void {
            const s=state(this),old=s.selected;
            for(const item of old.values())if(item instanceof Element&&!([...next.values()].includes(item))){item.removeAttribute('selected');item.setAttribute('aria-selected','false');}
            for(const item of next.values())if(item instanceof Element){item.setAttribute('selected','');item.setAttribute('aria-selected','true');}
            s.selected=next;
            if(old.size!==next.size||[...old].some(([key,value])=>next.get(key)!==value))
                this.dispatchEvent(new CustomEvent('arianna:selection-change',{bubbles:true,composed:true,detail:{Selected:this.Selected,selected:this.selected,indices:[...next.keys()],source:this}}));
        }
        private operation(event:PointerEvent):Operation {
            const options=state(this).options;return event.altKey?'subtract':event.ctrlKey||event.metaKey?'toggle':event.shiftKey&&options.activation!=='shift-drag'?'add':options.operation;
        }
        private readAttributes():void
        {
            const s=state(this),mode=this.getAttribute('mode'),activation=this.getAttribute('activation'),rule=this.getAttribute('rule'),operation=this.getAttribute('operation');
            if(mode==='2d'||mode==='3d')s.options.mode=mode;
            if(activation==='always'||activation==='shift-drag')s.options.activation=activation;
            if(rule==='contain'||rule==='intersect')s.options.rule=rule;
            if(operation==='replace'||operation==='add'||operation==='subtract'||operation==='toggle')s.options.operation=operation;
            const rawMinimum=this.getAttribute('minimum-size'),minimum=Number(rawMinimum);if(rawMinimum!==null&&Number.isFinite(minimum)&&minimum>=0)s.options.minimumSize=minimum;
            if(this.hasAttribute('enabled'))s.options.enabled=this.getAttribute('enabled')!=='false';
            s.options.enabled=!this.hasAttribute('disabled')&&s.options.enabled;
            if(this.hasAttribute('direction-sensitive'))s.options.directionSensitive=this.getAttribute('direction-sensitive')!=='false';
            const visibility=this.getAttribute('visibility');if(visibility==='visible'||visibility==='through')s.options.visibility=visibility;
            const backfaces=this.getAttribute('backfaces');if(backfaces==='exclude'||backfaces==='include')s.options.backfaces=backfaces;
            const depth=this.getAttribute('depth');if(depth==='scene'||depth==='frontmost')s.options.depth=depth;
        }
        private autoAttach():void
        {
            const id=(this.getAttribute('for')??'').trim(),candidate=id?document.getElementById(id):this.parentElement?.querySelector<HTMLElement>('arianna-canvas-2d,arianna-canvas-3d');
            if(candidate&&'selectionSurface' in candidate&&state(this).target!==candidate)this.attach(candidate as unknown as Target);
        }
        public attach(target:Target):this
        {
            this.detach();const s=state(this),surface=target.selectionSurface;s.target=target;
            const previousTouchAction=surface.style.touchAction;
            const down=(e:PointerEvent)=>
            {
                if(e.button!==0||s.pointerId!==null||!s.options.enabled||(s.options.activation==='shift-drag'&&!e.shiftKey))return;
                if(s.options.mode==='2d'&&e.target instanceof Element){
                    const item=e.target.closest('[data-selectable],[data-id]');
                    if(item&&surface.contains(item)){
                        // Select identity first; let independent Mover/Resizer receive the same press.
                        if(!(e.target.closest('[data-resize-handle],.Resizer-Handle'))){
                            if(this.operation(e)!=='replace')this.select([item],this.operation(e));
                            else if(!this.selected.includes(item))this.select([item]);
                        }return;
                    }
                    if(e.target.closest('button,input,select,textarea,[contenteditable="true"]'))return;
                }
                s.initial=new Map(s.selected);
                if(this.operation(e)==='replace')this.clearSelection();
                const r=surface.getBoundingClientRect();s.start={x:e.clientX-r.left,y:e.clientY-r.top};
                s.pointerId=e.pointerId;
                const o=document.createElement('div');o.setAttribute('aria-hidden','true');o.style.cssText='position:fixed;pointer-events:none;z-index:2147483000;border:1px solid #e40c88;background:#e40c8820;box-sizing:border-box';document.body.appendChild(o);s.overlay=o;
                try{surface.setPointerCapture(e.pointerId);}catch{}
                e.preventDefault();e.stopPropagation();
            };
            const move=(e:PointerEvent)=>{if(!s.start||!s.overlay||s.pointerId!==e.pointerId)return;
                const r=surface.getBoundingClientRect(),end={x:e.clientX-r.left,y:e.clientY-r.top};this.paint(r,s.start,end);
                const rect=this.rect(s.start,end);
                if(s.options.mode==='2d'&&!target.selectRectangle&&rect.width>=s.options.minimumSize&&rect.height>=s.options.minimumSize){
                    const direction=end.x>=s.start.x?'left-to-right':'right-to-left',rule=s.options.directionSensitive?(direction==='left-to-right'?'contain':'intersect'):s.options.rule;
                    this.selectElements(surface,{...s.options,rect,direction,rule,operation:this.operation(e),source:this});
                }e.preventDefault();e.stopPropagation();};
            const up=(e:PointerEvent)=>
            {
                if(!s.start||s.pointerId!==e.pointerId)return;const r=surface.getBoundingClientRect(),end={x:e.clientX-r.left,y:e.clientY-r.top},start=s.start;s.start=null;s.pointerId=null;s.overlay?.remove();s.overlay=null;
                try{if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);}catch{}
                if(e.type==='pointercancel'){this.storeSelection(s.initial??new Map());s.initial=null;return;}
                const rect=this.rect(start,end);if(rect.width<s.options.minimumSize||rect.height<s.options.minimumSize){s.initial=null;return;}
                const direction=end.x>=start.x?'left-to-right':'right-to-left';
                const rule=s.options.directionSensitive?(direction==='left-to-right'?'contain':'intersect'):s.options.rule;
                const operation=this.operation(e);
                const detail:Detail={...s.options,rule,operation,rect,direction,volume:target.createSelectionVolume?.(rect),source:this};
                detail.selection=target.selectRectangle?.(detail)??(detail.mode==='2d'?this.selectElements(surface,detail):undefined);
                if(target.selectRectangle){const value=detail.selection;if(value instanceof Map)this.storeSelection(new Map(value));else if(Array.isArray(value)||value instanceof Set)this.select(value);}
                s.initial=null;
                this.dispatchEvent(new CustomEvent('arianna:selection-rectangle',{bubbles:true,composed:true,detail}));
                /* The selection target is the canonical event source. Dispatching on the
                 * surface lets the event bubble through Canvas2D/Canvas3D, where selection
                 * behaviours live, even when this controller is mounted elsewhere. */
                const owner=target as Target&Node&EventTarget;
                if(typeof owner.contains!=='function'||!owner.contains(this))
                    surface.dispatchEvent(new CustomEvent('arianna:selection-rectangle',{bubbles:true,composed:true,detail}));
                e.preventDefault();e.stopPropagation();
            };
            surface.style.touchAction='none';
            surface.addEventListener('pointerdown',down as EventListener,true);window.addEventListener('pointermove',move as EventListener,true);window.addEventListener('pointerup',up as EventListener,true);window.addEventListener('pointercancel',up as EventListener,true);
            s.cleanup=()=>{if(s.pointerId!==null){try{if(surface.hasPointerCapture(s.pointerId))surface.releasePointerCapture(s.pointerId);}catch{}}surface.removeEventListener('pointerdown',down as EventListener,true);window.removeEventListener('pointermove',move as EventListener,true);window.removeEventListener('pointerup',up as EventListener,true);window.removeEventListener('pointercancel',up as EventListener,true);surface.style.touchAction=previousTouchAction;s.overlay?.remove();};return this;
        }
        public detach():this{const s=state(this);s.cleanup?.();if(s.start&&s.initial)this.storeSelection(s.initial);s.initial=null;this.clearSelection();s.cleanup=null;s.target=null;s.start=null;s.pointerId=null;s.overlay=null;return this;}
        private rect(a:{x:number;y:number},b:{x:number;y:number}):ScreenRect{const left=Math.min(a.x,b.x),top=Math.min(a.y,b.y),right=Math.max(a.x,b.x),bottom=Math.max(a.y,b.y);return{left,top,right,bottom,width:right-left,height:bottom-top};}
        private paint(surface:DOMRect,a:{x:number;y:number},b:{x:number;y:number}):void{const o=state(this).overlay;if(!o)return;const r=this.rect(a,b);Object.assign(o.style,{left:`${surface.left+r.left}px`,top:`${surface.top+r.top}px`,width:`${r.width}px`,height:`${r.height}px`});}
        private selectElements(surface:HTMLElement|SVGSVGElement,detail:Detail):Element[]
        {
            const bounds=surface.getBoundingClientRect(),candidates=[...surface.querySelectorAll<Element>('[data-selectable],[data-id]')];
            const screenBounds=(item:Element)=>
            {
                try
                {
                    const graphics=item as SVGGraphicsElement,box=graphics.getBBox?.(),matrix=graphics.getScreenCTM?.();
                    if(matrix&&box){const points=[[box.x,box.y],[box.x+box.width,box.y],[box.x+box.width,box.y+box.height],[box.x,box.y+box.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));const xs=points.map(p=>p.x),ys=points.map(p=>p.y);return{left:Math.min(...xs)-bounds.left,top:Math.min(...ys)-bounds.top,right:Math.max(...xs)-bounds.left,bottom:Math.max(...ys)-bounds.top};}
                }
                catch{}
                const b=item.getBoundingClientRect();return{left:b.left-bounds.left,top:b.top-bounds.top,right:b.right-bounds.left,bottom:b.bottom-bounds.top};
            };
            const hits=candidates.filter(item=>{const b=screenBounds(item);return detail.rule==='contain'?b.left>=detail.rect.left&&b.top>=detail.rect.top&&b.right<=detail.rect.right&&b.bottom<=detail.rect.bottom:b.left<detail.rect.right&&b.right>detail.rect.left&&b.top<detail.rect.bottom&&b.bottom>detail.rect.top;});
            const s=state(this),base=s.initial??s.selected,next=detail.operation==='replace'?new Map<number,unknown>():new Map(base);
            for(const item of hits){const index=candidates.indexOf(item);if(detail.operation==='subtract'||detail.operation==='toggle'&&base.has(index))next.delete(index);else next.set(index,item);}
            this.storeSelection(next);return this.selected as Element[];
        }
    }
}
export default SelectionRectangle.SelectionRectangle;
export type SelectionRectangleOptions=SelectionRectangle.Options;
export type SelectionRectangleDetail=SelectionRectangle.Detail;
