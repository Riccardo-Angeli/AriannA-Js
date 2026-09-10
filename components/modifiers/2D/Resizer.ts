/**
 * @module components/modifiers/2D/Resizer
 * @description Eight-direction drag resizer with visible handles, cross-over resize and size limits.
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Resizer
{
    export namespace Types
    {
        export type ResizeDirection =
            | 'North'
            | 'NorthEast'
            | 'East'
            | 'SouthEast'
            | 'South'
            | 'SouthWest'
            | 'West'
            | 'NorthWest';

        /** @deprecated Use ResizeDirection. */
        export type ResizeDir = ResizeDirection;
    }

    export namespace Interfaces
    {
        export interface ResizerOptions
        {
            handles?: Types.ResizeDirection[];
            minWidth?: number;
            minHeight?: number;
            maxWidth?: number;
            maxHeight?: number;
            allowCross?: boolean;
            handleColor?: string;
            disabled?: boolean;
        }
    }

    export type ResizeCallback = (element: HTMLElement, width: number, height: number) => void;

    const html = Templates.Template.Html;

    const Directions: readonly Types.ResizeDirection[] = [
        'North', 'NorthEast', 'East', 'SouthEast',
        'South', 'SouthWest', 'West', 'NorthWest',
    ];

    const Aliases: Readonly<Record<string, Types.ResizeDirection>> = {
        n:'North', north:'North', ne:'NorthEast', northeast:'NorthEast',
        e:'East', east:'East', se:'SouthEast', southeast:'SouthEast',
        s:'South', south:'South', sw:'SouthWest', southwest:'SouthWest',
        w:'West', west:'West', nw:'NorthWest', northwest:'NorthWest',
    };

    function normalize(value: string): Types.ResizeDirection | null
    {
        return Aliases[value.trim().replace(/[\s_-]+/g, '').toLowerCase()] ?? null;
    }

    function West(direction: Types.ResizeDirection): boolean
    {
        return direction === 'West' || direction === 'NorthWest' || direction === 'SouthWest';
    }

    function East(direction: Types.ResizeDirection): boolean
    {
        return direction === 'East' || direction === 'NorthEast' || direction === 'SouthEast';
    }

    function North(direction: Types.ResizeDirection): boolean
    {
        return direction === 'North' || direction === 'NorthEast' || direction === 'NorthWest';
    }

    function South(direction: Types.ResizeDirection): boolean
    {
        return direction === 'South' || direction === 'SouthEast' || direction === 'SouthWest';
    }

    const Cursor: Record<Types.ResizeDirection, string> = {
        North:'n-resize', NorthEast:'ne-resize', East:'e-resize', SouthEast:'se-resize',
        South:'s-resize', SouthWest:'sw-resize', West:'w-resize', NorthWest:'nw-resize',
    };

    @Component('arianna-resizer', {}, {
        Shadow: false,
        Attributes: [
            'handles', 'min-width', 'min-height', 'max-width', 'max-height',
            'allow-cross', 'handle-color', 'disabled',
        ],
    })
    export class Resizer extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'resize';

        public handles: Types.ResizeDirection[] = [...Directions];
        public minWidth = 0;
        public minHeight = 0;
        public maxWidth = Number.POSITIVE_INFINITY;
        public maxHeight = Number.POSITIVE_INFINITY;
        public allowCross = true;
        public handleColor = '#e40c88';

        private readonly resizeCallbacks = new Set<ResizeCallback>();

        constructor(target?: Base.Modifier2D.Types.TargetInput, options: Interfaces.ResizerOptions = {})
        {
            super();
            this.configure(options);
            if(target !== undefined)
                this.attach(target);
        }

        private configure(options: Interfaces.ResizerOptions): void
        {
            if(options.handles) this.handles = [...options.handles];
            if(options.allowCross !== undefined) this.allowCross = options.allowCross;
            if(options.minWidth !== undefined) this.minWidth = Math.max(0, options.minWidth);
            if(options.minHeight !== undefined) this.minHeight = Math.max(0, options.minHeight);
            if(options.maxWidth !== undefined) this.maxWidth = Math.max(0, options.maxWidth);
            if(options.maxHeight !== undefined) this.maxHeight = Math.max(0, options.maxHeight);
            if(options.handleColor !== undefined) this.handleColor = options.handleColor;
            if(options.disabled) this.disable();
        }

        private syncAttributes(): void
        {
            const handles = this.getAttribute('handles');
            if(handles)
            {
                const parsed = handles.split(',').map(normalize).filter((value): value is Types.ResizeDirection => value !== null);
                if(parsed.length) this.handles = parsed;
            }

            const allow = this.getAttribute('allow-cross');
            if(allow !== null) this.allowCross = allow !== 'false';

            const color = this.getAttribute('handle-color');
            if(color) this.handleColor = color;

            const number = (name: string, current: number): number =>
            {
                const raw = this.getAttribute(name);
                if(raw === null) return current;
                const parsed = Number.parseFloat(raw);
                return Number.isFinite(parsed) ? Math.max(0, parsed) : current;
            };

            this.minWidth = number('min-width', this.allowCross ? this.minWidth : Math.max(40, this.minWidth));
            this.minHeight = number('min-height', this.allowCross ? this.minHeight : Math.max(40, this.minHeight));
            this.maxWidth = number('max-width', this.maxWidth);
            this.maxHeight = number('max-height', this.maxHeight);
        }

        protected applyTo(target: HTMLElement): void
        {
            this.syncAttributes();

            if(getComputedStyle(target).position === 'static')
                target.style.position = 'absolute';

            const makeHandle = (direction: Types.ResizeDirection): HTMLDivElement =>
            {
                const handle = document.createElement('div');
                handle.className = `Resizer-Handle Resizer-${direction}`;
                handle.dataset.resizeDirection = direction;
                handle.dataset.resizeDir = direction;
                handle.setAttribute('aria-hidden', 'true');
                handle.style.cssText = this.hitAreaStyle(direction);

                const marker = document.createElement('span');
                marker.style.cssText = this.markerStyle(direction);
                handle.appendChild(marker);
                target.appendChild(handle);
                return handle;
            };

            for(const direction of this.handles)
            {
                const handle = makeHandle(direction);
                let pointerId = -1;
                let startX = 0;
                let startY = 0;
                let startLeft = 0;
                let startTop = 0;
                let startWidth = 0;
                let startHeight = 0;

                const onMove = (event: PointerEvent): void =>
                {
                    if(event.pointerId !== pointerId || !this.isEnabled)
                        return;

                    const dx = event.clientX - startX;
                    const dy = event.clientY - startY;
                    let left = startLeft;
                    let top = startTop;
                    let width = startWidth;
                    let height = startHeight;

                    if(East(direction) || West(direction))
                    {
                        const anchorX = East(direction) ? startLeft : startLeft + startWidth;
                        const pointerStartX = East(direction) ? startLeft + startWidth : startLeft;
                        let pointerX = pointerStartX + dx;

                        if(!this.allowCross)
                        {
                            const originalSign = pointerStartX >= anchorX ? 1 : -1;
                            const min = Math.max(0, this.minWidth);
                            if(originalSign * (pointerX - anchorX) < min)
                                pointerX = anchorX + originalSign * min;
                        }

                        const signed = pointerX - anchorX;
                        const size = Math.min(this.maxWidth, Math.abs(signed));
                        const sign = signed === 0 ? (pointerStartX >= anchorX ? 1 : -1) : Math.sign(signed);
                        pointerX = anchorX + sign * size;
                        width = Math.round(Math.abs(pointerX - anchorX));
                        left = Math.round(Math.min(anchorX, pointerX));
                    }

                    if(North(direction) || South(direction))
                    {
                        const anchorY = South(direction) ? startTop : startTop + startHeight;
                        const pointerStartY = South(direction) ? startTop + startHeight : startTop;
                        let pointerY = pointerStartY + dy;

                        if(!this.allowCross)
                        {
                            const originalSign = pointerStartY >= anchorY ? 1 : -1;
                            const min = Math.max(0, this.minHeight);
                            if(originalSign * (pointerY - anchorY) < min)
                                pointerY = anchorY + originalSign * min;
                        }

                        const signed = pointerY - anchorY;
                        const size = Math.min(this.maxHeight, Math.abs(signed));
                        const sign = signed === 0 ? (pointerStartY >= anchorY ? 1 : -1) : Math.sign(signed);
                        pointerY = anchorY + sign * size;
                        height = Math.round(Math.abs(pointerY - anchorY));
                        top = Math.round(Math.min(anchorY, pointerY));
                    }

                    if(!this.allowCross)
                    {
                        width = Math.max(this.minWidth, width);
                        height = Math.max(this.minHeight, height);
                    }

                    const container = this.containerFor(target);
                    if(container)
                    {
                        left = Math.max(0, Math.min(container.clientWidth, left));
                        top = Math.max(0, Math.min(container.clientHeight, top));
                        width = Math.max(0, Math.min(width, container.clientWidth - left));
                        height = Math.max(0, Math.min(height, container.clientHeight - top));
                    }

                    target.style.left = `${Math.round(left)}px`;
                    target.style.top = `${Math.round(top)}px`;
                    target.style.width = `${Math.round(width)}px`;
                    target.style.height = `${Math.round(height)}px`;
                    target.setAttribute('x', String(Math.round(left)));
                    target.setAttribute('y', String(Math.round(top)));
                    target.setAttribute('width', String(Math.round(width)));
                    target.setAttribute('height', String(Math.round(height)));

                    this.Change({
                        direction,
                        x: Math.round(left), y: Math.round(top),
                        width: Math.round(width), height: Math.round(height),
                        pointerId,
                    }, target);

                    for(const callback of this.resizeCallbacks)
                        callback(target, Math.round(width), Math.round(height));
                };

                const onUp = (event: PointerEvent): void =>
                {
                    if(event.pointerId !== pointerId)
                        return;
                    try { handle.releasePointerCapture(pointerId); } catch {}
                    handle.removeEventListener('pointermove', onMove);
                    handle.removeEventListener('pointerup', onUp);
                    handle.removeEventListener('pointercancel', onUp);
                    this.End({
                        direction,
                        x: target.offsetLeft,
                        y: target.offsetTop,
                        width: target.offsetWidth,
                        height: target.offsetHeight,
                        pointerId,
                    }, target);
                    pointerId = -1;
                };

                const onDown = (event: PointerEvent): void =>
                {
                    if(!this.isEnabled || event.button !== 0)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    pointerId = event.pointerId;
                    startX = event.clientX;
                    startY = event.clientY;
                    startLeft = target.offsetLeft;
                    startTop = target.offsetTop;
                    startWidth = target.offsetWidth;
                    startHeight = target.offsetHeight;
                    try { handle.setPointerCapture(pointerId); } catch {}
                    handle.addEventListener('pointermove', onMove);
                    handle.addEventListener('pointerup', onUp);
                    handle.addEventListener('pointercancel', onUp);
                    this.Start({
                        direction,
                        x:startLeft, y:startTop,
                        width:startWidth, height:startHeight,
                        pointerId,
                    }, target);
                };

                handle.addEventListener('pointerdown', onDown);
                this.cleanups.push(() =>
                {
                    handle.removeEventListener('pointerdown', onDown);
                    handle.removeEventListener('pointermove', onMove);
                    handle.removeEventListener('pointerup', onUp);
                    handle.removeEventListener('pointercancel', onUp);
                    handle.remove();
                });
            }
        }

        private hitAreaStyle(direction: Types.ResizeDirection): string
        {
            const common = `position:absolute;box-sizing:border-box;background:transparent;border:0;z-index:2147483646;touch-action:none;user-select:none;cursor:${Cursor[direction]};`;
            switch(direction)
            {
                case 'North': return common + 'left:20px;right:20px;top:-8px;height:16px;';
                case 'South': return common + 'left:20px;right:20px;bottom:-8px;height:16px;';
                case 'East': return common + 'right:-8px;top:20px;bottom:20px;width:16px;';
                case 'West': return common + 'left:-8px;top:20px;bottom:20px;width:16px;';
                case 'NorthEast': return common + 'right:-10px;top:-10px;width:20px;height:20px;';
                case 'NorthWest': return common + 'left:-10px;top:-10px;width:20px;height:20px;';
                case 'SouthEast': return common + 'right:-10px;bottom:-10px;width:20px;height:20px;';
                case 'SouthWest': return common + 'left:-10px;bottom:-10px;width:20px;height:20px;';
            }
        }

        private markerStyle(direction: Types.ResizeDirection): string
        {
            const corner = direction.length > 5;
            const size = corner ? 10 : 7;
            let position = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:${this.handleColor};pointer-events:none;`;
            if(direction === 'North' || direction === 'South') position += 'left:50%;top:50%;transform:translate(-50%,-50%);';
            else if(direction === 'East' || direction === 'West') position += 'left:50%;top:50%;transform:translate(-50%,-50%);';
            else position += 'left:50%;top:50%;transform:translate(-50%,-50%);';
            return position;
        }

        public onResize(callback: ResizeCallback): this
        {
            this.resizeCallbacks.add(callback);
            return this;
        }

        public setSize(width: number, height: number): this
        {
            for(const target of this.targets)
            {
                const w = Math.max(0, Math.min(this.maxWidth, width));
                const h = Math.max(0, Math.min(this.maxHeight, height));
                target.style.width = `${Math.round(w)}px`;
                target.style.height = `${Math.round(h)}px`;
                this.Change({ width:Math.round(w), height:Math.round(h), programmatic:true }, target);
                for(const callback of this.resizeCallbacks) callback(target, Math.round(w), Math.round(h));
            }
            return this;
        }
    }
}

export type ResizeDirection = Resizer.Types.ResizeDirection;
export type ResizerOptions = Resizer.Interfaces.ResizerOptions;

export default Resizer.Resizer;
