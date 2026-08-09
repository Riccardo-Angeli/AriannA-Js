/**
 * @module    components/modifiers/2D/Rounder
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Rounder component module.
 */

import { Component, Templates } from '../../../core/index.ts';
import { Modifier2D } from './Base.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   Rounder
 *  @public
 *  @description Namespace containing Rounder contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Rounder
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Corner
         *  @public
         *  @type        {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'}
         *  @description Type alias for Corner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   RounderOptions
         *  @public
         *  @description RounderOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RounderOptions
        {
            /** @name        r
             *  @public
             *  @type        {number}
             *  @description Component member for r.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            r?: number;

            /** @name        radius
             *  @public
             *  @type        {number}
             *  @description Component member for radius.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            radius?: number;

            /** @name        max
             *  @public
             *  @type        {number}
             *  @description Component member for max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            max?: number;

            /** @name        handleColor
             *  @public
             *  @type        {string}
             *  @description Component member for handle Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleColor?: string;

            /** @name        corners
             *  @public
             *  @type        {Rounder.Types.Corner[]}
             *  @description Component member for corners.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            corners?: Types.Corner[];

            /** @name        top-left
             *  @public
             *  @type        {number}
             *  @description Component member for top-left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'top-left'?: number;

            /** @name        top-right
             *  @public
             *  @type        {number}
             *  @description Component member for top-right.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'top-right'?: number;

            /** @name        bottom-left
             *  @public
             *  @type        {number}
             *  @description Component member for bottom-left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'bottom-left'?: number;

            /** @name        bottom-right
             *  @public
             *  @type        {number}
             *  @description Component member for bottom-right.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'bottom-right'?: number;
        }

        /** @interface   CornerState
         *  @public
         *  @description CornerState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CornerState
        {
            /** @name        top-left
             *  @public
             *  @type        {number}
             *  @description Component member for top-left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'top-left': number;

            /** @name        top-right
             *  @public
             *  @type        {number}
             *  @description Component member for top-right.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'top-right': number;

            /** @name        bottom-left
             *  @public
             *  @type        {number}
             *  @description Component member for bottom-left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'bottom-left': number;

            /** @name        bottom-right
             *  @public
             *  @type        {number}
             *  @description Component member for bottom-right.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            'bottom-right': number;
        }
    }
    export function cornerPos(c: Types.Corner): string {
        /** @name        off
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned off value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const off = '6px';
        switch (c)
        {
            case 'top-left': return `top:${off};left:${off};cursor:nwse-resize;`;
            case 'top-right': return `top:${off};right:${off};cursor:nesw-resize;`;
            case 'bottom-left': return `bottom:${off};left:${off};cursor:nesw-resize;`;
            case 'bottom-right': return `bottom:${off};right:${off};cursor:nwse-resize;`;
        }
    }
    export function renderRadii(el: HTMLElement, s: Interfaces.CornerState): void {
        // CSS shorthand order: top-left, top-right, bottom-right, bottom-left
        el.style.borderRadius =
            `${s['top-left']}px ${s['top-right']}px ${s['bottom-right']}px ${s['bottom-left']}px`;
    }

    /** @name        CornerPos
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned CornerPos value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function CornerPos(...args: Parameters<typeof cornerPos>): ReturnType<typeof cornerPos>
    {
        return cornerPos(...args);
    }

    /** @name        RenderRadii
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned RenderRadii value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function RenderRadii(...args: Parameters<typeof renderRadii>): ReturnType<typeof renderRadii>
    {
        return renderRadii(...args);
    }

    /** @class       Rounder
     *  @public
     *  @description AriannA Rounder component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-rounder', {}, {
        Attributes: [
            'r', 'radius', 'top-left', 'top-right', 'bottom-left', 'bottom-right',
            'max', 'handle-color', 'corners', 'disabled',
        ],
    })
    export class Rounder extends Modifier2D.Modifier2D
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        #state
         *  @public
         *  @type        {Rounder.Interfaces.CornerState}
         *  @description Component member for state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #state: Interfaces.CornerState = { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 };

        /** @name        applyTo
         *  @protected
         *  @type        {void}
         *  @description Component member for apply To.
         *  @param       {HTMLElement} target Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected applyTo(target: HTMLElement): void
        {
            if (getComputedStyle(target).position === 'static')
                target.style.position = 'relative';

            /** @name        r0
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned r0 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const r0 = parseFloat(this.getAttribute('r') ?? this.getAttribute('radius') ?? '0') || 0;

            /** @name        tl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tl = this.getAttribute('top-left');

            /** @name        tr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tr = this.getAttribute('top-right');

            /** @name        bl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bl = this.getAttribute('bottom-left');

            /** @name        br
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned br value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const br = this.getAttribute('bottom-right');

            /** @name        max
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned max value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const max = parseFloat(this.getAttribute('max') ?? '100') || 100;

            /** @name        hc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hc = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

            /** @name        perCorner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned perCorner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const perCorner = (tl !== null) || (tr !== null) || (bl !== null) || (br !== null);
            this.#state = {
                'top-left': tl !== null ? parseFloat(tl) : r0,
                'top-right': tr !== null ? parseFloat(tr) : r0,
                'bottom-left': bl !== null ? parseFloat(bl) : r0,
                'bottom-right': br !== null ? parseFloat(br) : r0,
            };
            renderRadii(target, this.#state);
            if (perCorner)
            {
                /** @name        cornersAttr
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cornersAttr value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cornersAttr = this.getAttribute('corners');

                /** @name        corners
                 *  @public
                 *  @type        {Rounder.Types.Corner[]}
                 *  @description Namespace-owned corners value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const corners: Types.Corner[] = cornersAttr
                    ? cornersAttr.split(',').map(s => s.trim() as Types.Corner)
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
                for (const c of corners)
                    this.#addCornerHandle(target, c, hc, max);
            }
            else
            {
                this.#addUniformHandle(target, hc, max);
            }
        }

        /** @name        #addUniformHandle
         *  @public
         *  @type        {void}
         *  @description Component member for add Uniform Handle.
         *  @param       {HTMLElement} target Parameter.
         *  @param       {string} hc Parameter.
         *  @param       {number} max Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #addUniformHandle(target: HTMLElement, hc: string, max: number): void
        {
            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = document.createElement('div');
            h.className = 'ar-rounder-handle';
            h.title = 'Drag to round all corners';
            h.style.cssText =
                `position:absolute;top:6px;left:6px;width:10px;height:10px;` +
                    `background:${hc};border-radius:50%;` +
                    `cursor:ew-resize;z-index:9999;touch-action:none;`;
            target.appendChild(h);

            /** @name        pointerId
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pointerId value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let pointerId = -1, startX = 0, startR = 0;

            /** @name        onDown
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onDown value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onDown = (e: PointerEvent) => {
                if (!this.isEnabled)
                    return;
                if (e.button !== 0)
                    return;
                e.preventDefault();
                e.stopPropagation();
                pointerId = e.pointerId;
                startX = e.clientX;
                startR = this.#state['top-left'];
                try
                {
                    h.setPointerCapture(pointerId);
                }
                catch { /* ignore */ }
                h.addEventListener('pointermove', onMove);
                h.addEventListener('pointerup', onUp);
                h.addEventListener('pointercancel', onUp);
            };

            /** @name        onMove
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onMove value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onMove = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId)
                    return;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = Math.max(0, Math.min(max, startR + (ev.clientX - startX) / 2));
                this.#state['top-left'] = this.#state['top-right'] = this.#state['bottom-left'] = this.#state['bottom-right'] = r;
                renderRadii(target, this.#state);
                target.dispatchEvent(new CustomEvent('arianna:round', {
                    bubbles: true, detail: { radius: r, corner: 'all', target },
                }));
            };

            /** @name        onUp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onUp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onUp = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId)
                    return;
                try
                {
                    h.releasePointerCapture(pointerId);
                }
                catch { /* ignore */ }
                h.removeEventListener('pointermove', onMove);
                h.removeEventListener('pointerup', onUp);
                h.removeEventListener('pointercancel', onUp);
                pointerId = -1;
            };
            h.addEventListener('pointerdown', onDown);
            this.cleanups.push(() => {
                h.removeEventListener('pointerdown', onDown);
                h.remove();
            });
        }

        /** @name        #addCornerHandle
         *  @public
         *  @type        {void}
         *  @description Component member for add Corner Handle.
         *  @param       {HTMLElement} target Parameter.
         *  @param       {Rounder.Types.Corner} corner Parameter.
         *  @param       {string} hc Parameter.
         *  @param       {number} max Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #addCornerHandle(target: HTMLElement, corner: Types.Corner, hc: string, max: number): void
        {
            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = document.createElement('div');
            h.className = 'ar-rounder-handle';
            h.dataset['corner'] = corner;
            h.title = `Drag vertically to round ${corner}`;
            h.style.cssText =
                `position:absolute;width:10px;height:10px;background:${hc};` +
                    `border-radius:50%;z-index:9999;touch-action:none;` +
                    cornerPos(corner);
            target.appendChild(h);

            /** @name        pointerId
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pointerId value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let pointerId = -1, startY = 0, startR = 0;

            /** @name        onDown
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onDown value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onDown = (e: PointerEvent) => {
                if (!this.isEnabled)
                    return;
                if (e.button !== 0)
                    return;
                e.preventDefault();
                e.stopPropagation();
                pointerId = e.pointerId;
                startY = e.clientY;
                startR = this.#state[corner];
                try
                {
                    h.setPointerCapture(pointerId);
                }
                catch { /* ignore */ }
                h.addEventListener('pointermove', onMove);
                h.addEventListener('pointerup', onUp);
                h.addEventListener('pointercancel', onUp);
            };

            /** @name        onMove
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onMove value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onMove = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId)
                    return;
                // vertical drag: down = larger radius
                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = Math.max(0, Math.min(max, startR + (ev.clientY - startY) / 2));
                this.#state[corner] = r;
                renderRadii(target, this.#state);
                target.dispatchEvent(new CustomEvent('arianna:round', {
                    bubbles: true, detail: { radius: r, corner, target },
                }));
            };

            /** @name        onUp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onUp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onUp = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId)
                    return;
                try
                {
                    h.releasePointerCapture(pointerId);
                }
                catch { /* ignore */ }
                h.removeEventListener('pointermove', onMove);
                h.removeEventListener('pointerup', onUp);
                h.removeEventListener('pointercancel', onUp);
                pointerId = -1;
            };
            h.addEventListener('pointerdown', onDown);
            this.cleanups.push(() => {
                h.removeEventListener('pointerdown', onDown);
                h.remove();
            });
        }

        /** Set uniform radius programmatically. */
        setRadius(r: number): this
        {
            if (this.target)
            {
                /** @name        max
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned max value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const max = parseFloat(this.getAttribute('max') ?? '100') || 100;

                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = Math.max(0, Math.min(max, r));
                this.#state['top-left'] = this.#state['top-right'] = this.#state['bottom-left'] = this.#state['bottom-right'] = v;
                renderRadii(this.target, this.#state);
                this.target.dispatchEvent(new CustomEvent('arianna:round', {
                    bubbles: true, detail: { radius: v, corner: 'all', target: this.target },
                }));
            }
            return this;
        }

        /** Set a single corner radius. */
        setCorner(corner: Types.Corner, r: number): this
        {
            if (this.target)
            {
                /** @name        max
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned max value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const max = parseFloat(this.getAttribute('max') ?? '100') || 100;

                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = Math.max(0, Math.min(max, r));
                this.#state[corner] = v;
                renderRadii(this.target, this.#state);
                this.target.dispatchEvent(new CustomEvent('arianna:round', {
                    bubbles: true, detail: { radius: v, corner, target: this.target },
                }));
            }
            return this;
        }

        /** @name        getCorners
         *  @public
         *  @type        {Rounder.Interfaces.CornerState}
         *  @description Component member for get Corners.
         *  @returns     {Rounder.Interfaces.CornerState} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCorners(): Interfaces.CornerState { return { ...this.#state }; }
    }
}
export default Rounder;
