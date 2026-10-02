/**
 * @module components/graphics/2D/modifiers/Mover
 * @description Drag-to-move modifier with axis lock, grid snap, bounds and physics placeholders.
 */

import { Component, Templates } from '../../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Mover
{
    export namespace Types
    {
        export type Axis = 'x' | 'y' | 'both';
        export type Bounds = 'none' | 'parent' | 'viewport';
    }

    export type GroupItems=Iterable<unknown>|ReadonlyMap<unknown,unknown>;
    export type GroupSource=GroupItems|(()=>GroupItems)|null;
    interface Member {element:HTMLElement;x:number;y:number;width:number;height:number;}
    const DragOwners=new WeakMap<HTMLElement,Mover>();

    export namespace Interfaces
    {
        export interface MoverOptions
        {
            handleSelector?: string;
            axis?: Types.Axis;
            bounds?: Types.Bounds;
            snapX?: number;
            snapY?: number;
            mass?: number;
            damping?: number;
            stiffness?: number;
            disabled?: boolean;
            group?:GroupSource;
            Group?:GroupSource;
        }
    }

    export type MoveCallback = (element: HTMLElement, x: number, y: number) => void;

    export interface MoverParameters extends Base.Modifier2D.Parameters.Bag
    {
        X:number; Y:number; Axis:Types.Axis; Bounds:Types.Bounds; SnapX:number; SnapY:number;
        Mass:number; Damping:number; Stiffness:number; HandleSelector:string; Enabled:boolean;
    }

    const html = Templates.Template.Html;

    @Component('arianna-mover', {}, {
        Shadow: false,
        Attributes: [
            'handle-selector', 'axis', 'bounds', 'snap-x', 'snap-y',
            'mass', 'damping', 'stiffness', 'disabled',
        ],
        Properties:['Group'],
    })
    export class Mover extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected get EventName(): string { return 'move'; }

        public handleSelector = '';
        public axis: Types.Axis = 'both';
        public bounds: Types.Bounds = 'none';
        public snapX = 0;
        public snapY = 0;

        /* Reserved for the physics engine; public by design in the reference API. */
        public mass = 1;
        public damping = 0.85;
        public stiffness = 0.15;

        private startCallbacks = new Set<MoveCallback>();
        private moveCallbacks = new Set<MoveCallback>();
        private snapCallbacks = new Set<MoveCallback>();
        private endCallbacks = new Set<MoveCallback>();
        private groupSource!:GroupSource;
        private activeCleanup!:(()=>void)|null;

        /** Restore class-field defaults after an in-place AriannA markup upgrade. */
        private ensureRuntime(): void
        {
            this.groupSource??=null;this.activeCleanup??=null;
            this.handleSelector ??= '';
            this.axis ??= 'both';
            this.bounds ??= 'none';
            this.snapX ??= 0;
            this.snapY ??= 0;
            this.mass ??= 1;
            this.damping ??= .85;
            this.stiffness ??= .15;
            if(!(this.startCallbacks instanceof Set)) this.startCallbacks = new Set<MoveCallback>();
            if(!(this.moveCallbacks instanceof Set)) this.moveCallbacks = new Set<MoveCallback>();
            if(!(this.snapCallbacks instanceof Set)) this.snapCallbacks = new Set<MoveCallback>();
            if(!(this.endCallbacks instanceof Set)) this.endCallbacks = new Set<MoveCallback>();
        }

        public get Parameters(): MoverParameters
        {
            this.ensureRuntime();
            return Base.Modifier2D.CreateParameters<MoverParameters>(this,'Mover',[
                {key:'X',label:'X',kind:'number',step:1,get:()=>this.target?.offsetLeft??0,set:v=>this.setPosition(Number(v),this.target?.offsetTop??0)},
                {key:'Y',label:'Y',kind:'number',step:1,get:()=>this.target?.offsetTop??0,set:v=>this.setPosition(this.target?.offsetLeft??0,Number(v))},
                {key:'Axis',label:'Axis',kind:'select',options:['both','x','y'],get:()=>this.axis,set:v=>{this.axis=String(v) as Types.Axis;this.setAttribute('axis',this.axis);}},
                {key:'Bounds',label:'Bounds',kind:'select',options:['parent','none','viewport'],get:()=>this.bounds,set:v=>{this.bounds=String(v) as Types.Bounds;this.setAttribute('bounds',this.bounds);}},
                {key:'SnapX',label:'Snap X',kind:'number',min:0,step:1,get:()=>this.snapX,set:v=>{this.snapX=Math.max(0,Number(v)||0);this.setAttribute('snap-x',String(this.snapX));}},
                {key:'SnapY',label:'Snap Y',kind:'number',min:0,step:1,get:()=>this.snapY,set:v=>{this.snapY=Math.max(0,Number(v)||0);this.setAttribute('snap-y',String(this.snapY));}},
                {key:'Mass',label:'Mass',kind:'number',step:.05,get:()=>this.mass,set:v=>{this.mass=Number(v)||0;this.setAttribute('mass',String(this.mass));}},
                {key:'Damping',label:'Damping',kind:'number',step:.05,get:()=>this.damping,set:v=>{this.damping=Number(v)||0;this.setAttribute('damping',String(this.damping));}},
                {key:'Stiffness',label:'Stiffness',kind:'number',step:.05,get:()=>this.stiffness,set:v=>{this.stiffness=Number(v)||0;this.setAttribute('stiffness',String(this.stiffness));}},
                {key:'HandleSelector',label:'Handle',kind:'text',get:()=>this.handleSelector,set:v=>{this.handleSelector=String(v??'');if(this.handleSelector)this.setAttribute('handle-selector',this.handleSelector);else this.removeAttribute('handle-selector');this.refreshAttachments();}},
                {key:'Enabled',label:'Enabled',kind:'checkbox',get:()=>this.enabled,set:v=>{this.enabled=Boolean(v);}},
            ]);
        }

        constructor(target?: Base.Modifier2D.Types.TargetInput, options: Interfaces.MoverOptions = {})
        {
            super();
            this.configure(options);
            if(target !== undefined)
                this.attach(target);
        }

        private configure(options: Interfaces.MoverOptions): void
        {
            this.ensureRuntime();
            if(options.handleSelector !== undefined) this.handleSelector = options.handleSelector;
            if(options.axis !== undefined) this.axis = options.axis;
            if(options.bounds !== undefined) this.bounds = options.bounds;
            if(options.snapX !== undefined) this.snapX = Math.max(0, options.snapX);
            if(options.snapY !== undefined) this.snapY = Math.max(0, options.snapY);
            if(options.mass !== undefined) this.mass = options.mass;
            if(options.damping !== undefined) this.damping = options.damping;
            if(options.stiffness !== undefined) this.stiffness = options.stiffness;
            if(options.group!==undefined||options.Group!==undefined)this.setGroup(options.Group??options.group??null);
            if(options.disabled) this.disable();
        }

        private syncAttributes(): void
        {
            this.ensureRuntime();
            const handle = this.getAttribute('handle-selector');
            const axis = this.getAttribute('axis') as Types.Axis | null;
            const bounds = this.getAttribute('bounds') as Types.Bounds | null;

            if(handle !== null) this.handleSelector = handle;
            if(axis === 'x' || axis === 'y' || axis === 'both') this.axis = axis;
            if(bounds === 'none' || bounds === 'parent' || bounds === 'viewport') this.bounds = bounds;

            const number = (name: string, current: number, min = -Infinity): number =>
            {
                const raw = this.getAttribute(name);
                if(raw === null) return current;
                const parsed = Number.parseFloat(raw);
                return Number.isFinite(parsed) ? Math.max(min, parsed) : current;
            };

            this.snapX = number('snap-x', this.snapX, 0);
            this.snapY = number('snap-y', this.snapY, 0);
            this.mass = number('mass', this.mass);
            this.damping = number('damping', this.damping);
            this.stiffness = number('stiffness', this.stiffness);
        }

        /** Independent movement membership. No selection component is imported or owned. */
        public get Group():GroupSource{this.ensureRuntime();return this.groupSource;}
        public set Group(value:GroupSource){this.setGroup(value);}
        public setGroup(value:GroupSource):this {
            if(value!==null&&typeof value!=='function'&&typeof value?.[Symbol.iterator]!=='function')throw new TypeError('Mover.Group requires an iterable, Map or provider');
            this.ensureRuntime();this.groupSource=value;return this;
        }
        private members(target:HTMLElement):Member[] {
            let source=typeof this.groupSource==='function'?this.groupSource():this.groupSource;
            if(source instanceof Map)source=source.values();
            const values:HTMLElement[]=source instanceof Map?[...source.values()]:source?[...(source as Iterable<HTMLElement>)]:[];
            if(values.some(element=>!(element instanceof HTMLElement)))throw new TypeError('Mover.Group members must be HTMLElements');
            let elements=values.includes(target)?[...new Set(values)]:[target];
            // Moving an ancestor already moves its descendants; never apply the same translation twice.
            elements=elements.filter(element=>!elements.some(other=>other!==element&&other.contains(element)));
            const containers=new Set(elements.map(element=>this.coordinateContainer(element)));
            if(containers.size>1)throw new TypeError('Mover.Group members must share one coordinate container');
            return elements.map(element=>({element,x:element.offsetLeft,y:element.offsetTop,width:element.offsetWidth,height:element.offsetHeight}));
        }
        private coordinateContainer(element:HTMLElement):HTMLElement|null{return element.offsetParent as HTMLElement|null??this.containerFor(element);}
        private delta(target:HTMLElement,members:Member[],dx:number,dy:number):{dx:number;dy:number;snapped:boolean} {
            if(this.axis==='x')dy=0;if(this.axis==='y')dx=0;
            const leader=members.find(member=>member.element===target)??members[0];
            const canvas=target.closest('arianna-canvas-2d') as HTMLElement&{getSnap?:()=>{enabled?:boolean;grid?:boolean}}|null;
            const master=canvas?.getSnap?.(),enabled=master?.enabled!==false&&master?.grid!==false;
            const stepX=enabled?this.snapX:0,stepY=enabled?this.snapY:0;let snapped=false;
            if(this.axis!=='y'&&stepX>0){const next=Math.round((leader.x+dx)/stepX)*stepX-leader.x;snapped||=next!==dx;dx=next;}
            if(this.axis!=='x'&&stepY>0){const next=Math.round((leader.y+dy)/stepY)*stepY-leader.y;snapped||=next!==dy;dy=next;}
            dx=Math.round(dx);dy=Math.round(dy);
            if(this.bounds!=='none') {
                const container=this.coordinateContainer(target),width=this.bounds==='viewport'?window.innerWidth:container?.clientWidth,
                    height=this.bounds==='viewport'?window.innerHeight:container?.clientHeight;
                if(width!==undefined&&height!==undefined){
                    const minX=-Math.min(...members.map(member=>member.x)),maxX=width-Math.max(...members.map(member=>member.x+member.width));
                    const minY=-Math.min(...members.map(member=>member.y)),maxY=height-Math.max(...members.map(member=>member.y+member.height));
                    if(this.axis!=='y')dx=minX<=maxX?Math.max(minX,Math.min(maxX,dx)):0;
                    if(this.axis!=='x')dy=minY<=maxY?Math.max(minY,Math.min(maxY,dy)):0;
                }
            }
            return{dx,dy,snapped};
        }
        private write(members:Member[],dx:number,dy:number):void {
            for(const member of members){const x=member.x+dx,y=member.y+dy;member.element.style.left=x+'px';member.element.style.top=y+'px';member.element.setAttribute('x',String(x));member.element.setAttribute('y',String(y));}
        }
        protected applyTo(target: HTMLElement): void {
            this.syncAttributes();if(getComputedStyle(target).position==='static')target.style.position='absolute';
            let pointerId=-1,startX=0,startY=0,members:Member[]=[];
            const isOnHandle=(node:EventTarget|null)=>{
                if(!(node instanceof Element))return false;
                if(node.closest('.Resizer-Handle,[data-resize-handle]'))return false;
                if(!this.handleSelector)return !node.closest('input,textarea,select,button,[contenteditable="true"]');
                const handle=node.closest(this.handleSelector);return !!handle&&(handle===target||target.contains(handle));
            };
            const finish=(cancelled:boolean,notify=true)=>{
                if(pointerId<0)return;const id=pointerId;
                if(cancelled)this.write(members,0,0);
                try{if(target.hasPointerCapture(id))target.releasePointerCapture(id);}catch{}
                target.removeEventListener('pointermove',onMove);target.removeEventListener('pointerup',onUp);target.removeEventListener('pointercancel',onUp);
                for(const member of members)if(DragOwners.get(member.element)===this)DragOwners.delete(member.element);
                pointerId=-1;this.activeCleanup=null;target.style.cursor=this.handleSelector?'':'grab';
                if(notify)for(const member of members){const x=member.element.offsetLeft,y=member.element.offsetTop;this.End({x,y,pointerId:id,cancelled,group:members.map(item=>item.element)},member.element);for(const callback of this.endCallbacks)callback(member.element,x,y);}
                members=[];
            };
            const onMove=(event:PointerEvent)=>{
                if(pointerId<0||event.pointerId!==pointerId)return;if(!this.isEnabled){finish(true);return;}
                let dx=event.clientX-startX,dy=event.clientY-startY;
                const canvas=target.closest('arianna-canvas-2d') as HTMLElement&{getViewport?:()=>{zoom:number;tilt?:number}}|null;
                const viewport=canvas?.getViewport?.();
                if(viewport){const angle=(viewport.tilt??0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),z=viewport.zoom||1;const x=dx;dx=(x*c+dy*s)/z;dy=(dy*c-x*s)/z;}
                const motion=this.delta(target,members,dx,dy);this.write(members,motion.dx,motion.dy);
                event.preventDefault();
                const group=members.map(member=>member.element);
                for(const member of members){const x=member.x+motion.dx,y=member.y+motion.dy;
                    this.Change({x,y,pointerId,snapped:motion.snapped,dx:motion.dx,dy:motion.dy,group},member.element);
                    for(const callback of this.moveCallbacks)callback(member.element,x,y);
                    if(motion.snapped){for(const callback of this.snapCallbacks)callback(member.element,x,y);member.element.dispatchEvent(new CustomEvent('arianna:move-snap',{bubbles:true,composed:true,detail:{target:member.element,modifier:this,x,y,group}}));}
                }
            };
            const onUp=(event:PointerEvent)=>{if(event.pointerId===pointerId)finish(event.type==='pointercancel');};
            const onDown=(event:PointerEvent)=>{
                if(!this.isEnabled||event.button!==0||pointerId>=0||this.activeCleanup||!isOnHandle(event.target))return;
                const next=this.members(target);if(next.some(member=>DragOwners.has(member.element)))return;
                members=next;for(const member of members)DragOwners.set(member.element,this);
                pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;
                event.preventDefault();event.stopPropagation();try{target.setPointerCapture(pointerId);}catch{}
                target.addEventListener('pointermove',onMove);target.addEventListener('pointerup',onUp);target.addEventListener('pointercancel',onUp);
                target.style.cursor='grabbing';this.activeCleanup=()=>finish(true,false);
                for(const member of members){this.Start({x:member.x,y:member.y,pointerId,group:members.map(item=>item.element)},member.element);for(const callback of this.startCallbacks)callback(member.element,member.x,member.y);}
            };
            target.addEventListener('pointerdown',onDown);target.style.cursor=this.handleSelector?'':'grab';target.style.touchAction||='none';target.style.userSelect||='none';
            this.cleanups.push(()=>{finish(true,false);target.removeEventListener('pointerdown',onDown);target.style.cursor='';});
        }

        public onStart(callback: MoveCallback): this { this.ensureRuntime(); this.startCallbacks.add(callback); return this; }
        public onMove(callback: MoveCallback): this { this.ensureRuntime(); this.moveCallbacks.add(callback); return this; }
        public onSnap(callback: MoveCallback): this { this.ensureRuntime(); this.snapCallbacks.add(callback); return this; }
        public onEnd(callback: MoveCallback): this { this.ensureRuntime(); this.endCallbacks.add(callback); return this; }

        public setPosition(x: number, y: number): this
        {
            this.ensureRuntime();
            if(this.groupSource&&this.targets.length){
                const target=this.targets[0],members=this.members(target),leader=members.find(member=>member.element===target)??members[0];
                const motion=this.delta(target,members,x-leader.x,y-leader.y);this.write(members,motion.dx,motion.dy);
                for(const member of members){const px=member.x+motion.dx,py=member.y+motion.dy;this.Change({x:px,y:py,programmatic:true,group:members.map(item=>item.element)},member.element);for(const callback of this.moveCallbacks)callback(member.element,px,py);}return this;
            }
            for(const target of this.targets)
            {
                target.style.left = `${Math.round(x)}px`;
                target.style.top = `${Math.round(y)}px`;
                this.Change({ x: Math.round(x), y: Math.round(y), programmatic: true }, target);
                for(const callback of this.moveCallbacks) callback(target, Math.round(x), Math.round(y));
            }
            return this;
        }

        public destroy():this{this.ensureRuntime();super.destroy();this.groupSource=null;this.activeCleanup=null;this.startCallbacks.clear();this.moveCallbacks.clear();this.snapCallbacks.clear();this.endCallbacks.clear();return this;}

        /** Placeholder hook consumed by the upcoming physics bridge. */
        public _physicsTick(_deltaTime = 0): this
        {
            return this;
        }
    }
}

export type MoverAxis = Mover.Types.Axis;
export type MoverBounds = Mover.Types.Bounds;
export type MoverOptions = Mover.Interfaces.MoverOptions;
export type MoverGroupSource=Mover.GroupSource;

export default Mover.Mover;
