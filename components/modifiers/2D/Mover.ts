/**
 * @module components/modifiers/2D/Mover
 * @description Drag-to-move modifier with axis lock, grid snap, bounds and physics placeholders.
 */

import { Component, Templates } from '../../../core/index.ts';
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
        protected EventName = 'move';

        public handleSelector = '';
        public axis: Types.Axis = 'both';
        public bounds: Types.Bounds = 'none';
        public snapX = 0;
        public snapY = 0;

        /* Reserved for the physics engine; public by design in the reference API. */
        public mass = 1;
        public damping = 0.85;
        public stiffness = 0.15;

        private readonly startCallbacks = new Set<MoveCallback>();
        private readonly moveCallbacks = new Set<MoveCallback>();
        private readonly snapCallbacks = new Set<MoveCallback>();
        private readonly endCallbacks = new Set<MoveCallback>();

        constructor(target?: Base.Modifier2D.Types.TargetInput, options: Interfaces.MoverOptions = {})
        {
            super();
            this.configure(options);
            if(target !== undefined)
                this.attach(target);
        }

        private configure(options: Interfaces.MoverOptions): void
        {
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

                let snapped = false;
                if(this.snapX > 0)
                {
                    const next = Math.round(x / this.snapX) * this.snapX;
                    snapped ||= next !== x;
                    x = next;
                }
                if(this.snapY > 0)
                {
                    const next = Math.round(y / this.snapY) * this.snapY;
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

        public onStart(callback: MoveCallback): this { this.startCallbacks.add(callback); return this; }
        public onMove(callback: MoveCallback): this { this.moveCallbacks.add(callback); return this; }
        public onSnap(callback: MoveCallback): this { this.snapCallbacks.add(callback); return this; }
        public onEnd(callback: MoveCallback): this { this.endCallbacks.add(callback); return this; }

        public setPosition(x: number, y: number): this
        {
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
