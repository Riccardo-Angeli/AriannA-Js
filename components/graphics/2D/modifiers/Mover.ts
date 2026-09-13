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

        /** Restore class-field defaults after an in-place AriannA markup upgrade. */
        private ensureRuntime(): void
        {
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

        protected applyTo(target: HTMLElement): void
        {
            this.syncAttributes();

            if(getComputedStyle(target).position === 'static')
                target.style.position = 'absolute';

            let pointerId = -1;
            let startPointerX = 0;
            let startPointerY = 0;
            let startLeft = 0;
            let startTop = 0;

            const isOnHandle = (element: EventTarget | null): boolean =>
            {
                if(!this.handleSelector)
                    return true;

                if(!(element instanceof HTMLElement))
                    return false;

                let current: HTMLElement | null = element;
                while(current && current !== target)
                {
                    if(current.matches(this.handleSelector))
                        return true;
                    current = current.parentElement;
                }

                return current === target && target.matches(this.handleSelector);
            };

            const clamp = (x: number, y: number): [number, number] =>
            {
                if(this.bounds === 'parent')
                {
                    const parent = this.containerFor(target);
                    if(parent)
                    {
                        x = Math.max(0, Math.min(Math.max(0, parent.clientWidth - target.offsetWidth), x));
                        y = Math.max(0, Math.min(Math.max(0, parent.clientHeight - target.offsetHeight), y));
                    }
                }
                else if(this.bounds === 'viewport')
                {
                    x = Math.max(0, Math.min(Math.max(0, window.innerWidth - target.offsetWidth), x));
                    y = Math.max(0, Math.min(Math.max(0, window.innerHeight - target.offsetHeight), y));
                }

                return [x, y];
            };

            const onMove = (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId || !this.isEnabled)
                    return;

                let x = startLeft + event.clientX - startPointerX;
                let y = startTop + event.clientY - startPointerY;

                if(this.axis === 'x') y = startTop;
                if(this.axis === 'y') x = startLeft;

                [x, y] = clamp(x, y);

                /* Canvas2D Snap is the spatial master switch. Turning it off makes
                 * the effective modifier snap 0 while preserving the configured SnapX/SnapY
                 * values so turning Snap back on restores the previous behaviour. */
                const canvas = target.closest('arianna-canvas-2d') as (HTMLElement & { getSnap?:()=>{enabled?:boolean;grid?:boolean} }) | null;
                const canvasSnapState = typeof canvas?.getSnap === 'function' ? canvas.getSnap() : null;
                const canvasSnapEnabled = canvasSnapState
                    ? canvasSnapState.enabled !== false && canvasSnapState.grid !== false
                    : true;
                const effectiveSnapX = canvasSnapEnabled ? this.snapX : 0;
                const effectiveSnapY = canvasSnapEnabled ? this.snapY : 0;

                let snapped = false;
                if(effectiveSnapX > 0)
                {
                    const next = Math.round(x / effectiveSnapX) * effectiveSnapX;
                    snapped ||= next !== x;
                    x = next;
                }
                if(effectiveSnapY > 0)
                {
                    const next = Math.round(y / effectiveSnapY) * effectiveSnapY;
                    snapped ||= next !== y;
                    y = next;
                }

                [x, y] = clamp(x, y);
                x = Math.round(x);
                y = Math.round(y);

                target.style.left = `${x}px`;
                target.style.top = `${y}px`;
                target.setAttribute('x', String(x));
                target.setAttribute('y', String(y));

                this.Change({ x, y, pointerId, snapped }, target);
                for(const callback of this.moveCallbacks) callback(target, x, y);
                if(snapped)
                {
                    for(const callback of this.snapCallbacks) callback(target, x, y);
                    target.dispatchEvent(new CustomEvent('arianna:move-snap', {
                        bubbles: true,
                        composed: true,
                        detail: { target, modifier: this, x, y },
                    }));
                }
            };

            const onUp = (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId)
                    return;

                try { target.releasePointerCapture(pointerId); } catch {}
                target.removeEventListener('pointermove', onMove);
                target.removeEventListener('pointerup', onUp);
                target.removeEventListener('pointercancel', onUp);

                const x = target.offsetLeft;
                const y = target.offsetTop;
                this.End({ x, y, pointerId }, target);
                for(const callback of this.endCallbacks) callback(target, x, y);
                pointerId = -1;
                target.style.cursor = this.handleSelector ? '' : 'grab';
            };

            const onDown = (event: PointerEvent): void =>
            {
                if(!this.isEnabled || event.button !== 0 || !isOnHandle(event.target))
                    return;

                const eventTarget = event.target;
                if(eventTarget instanceof HTMLElement)
                {
                    const interactive = eventTarget.closest('input,textarea,select,button,[contenteditable="true"]');
                    if(interactive && interactive !== target && !this.handleSelector)
                        return;
                }

                event.preventDefault();
                pointerId = event.pointerId;
                startPointerX = event.clientX;
                startPointerY = event.clientY;
                startLeft = target.offsetLeft;
                startTop = target.offsetTop;

                try { target.setPointerCapture(pointerId); } catch {}
                target.addEventListener('pointermove', onMove);
                target.addEventListener('pointerup', onUp);
                target.addEventListener('pointercancel', onUp);
                target.style.cursor = 'grabbing';

                this.Start({ x: startLeft, y: startTop, pointerId }, target);
                for(const callback of this.startCallbacks) callback(target, startLeft, startTop);
            };

            target.addEventListener('pointerdown', onDown);
            target.style.cursor = this.handleSelector ? '' : 'grab';
            target.style.touchAction ||= 'none';
            target.style.userSelect ||= 'none';

            this.cleanups.push(() =>
            {
                target.removeEventListener('pointerdown', onDown);
                target.removeEventListener('pointermove', onMove);
                target.removeEventListener('pointerup', onUp);
                target.removeEventListener('pointercancel', onUp);
                target.style.cursor = '';
            });
        }

        public onStart(callback: MoveCallback): this { this.ensureRuntime(); this.startCallbacks.add(callback); return this; }
        public onMove(callback: MoveCallback): this { this.ensureRuntime(); this.moveCallbacks.add(callback); return this; }
        public onSnap(callback: MoveCallback): this { this.ensureRuntime(); this.snapCallbacks.add(callback); return this; }
        public onEnd(callback: MoveCallback): this { this.ensureRuntime(); this.endCallbacks.add(callback); return this; }

        public setPosition(x: number, y: number): this
        {
            this.ensureRuntime();
            for(const target of this.targets)
            {
                target.style.left = `${Math.round(x)}px`;
                target.style.top = `${Math.round(y)}px`;
                this.Change({ x: Math.round(x), y: Math.round(y), programmatic: true }, target);
                for(const callback of this.moveCallbacks) callback(target, Math.round(x), Math.round(y));
            }
            return this;
        }

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

export default Mover.Mover;
