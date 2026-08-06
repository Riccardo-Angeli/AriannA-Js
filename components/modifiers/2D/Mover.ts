/**
 * @module    components/modifiers/2D/Mover
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Mover component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier2D } from './Base.ts';

/** @namespace   Mover
 *  @public
 *  @description Namespace containing Mover contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Mover
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   MoverOptions
         *  @public
         *  @description MoverOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MoverOptions
        {
            /** @name        handleSelector
             *  @public
             *  @type        {string}
             *  @description Component member for handle Selector.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleSelector?: string;

            /** @name        axis
             *  @public
             *  @type        {'x' | 'y' | 'both'}
             *  @description Component member for axis.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            axis?: 'x' | 'y' | 'both';

            /** @name        bounds
             *  @public
             *  @type        {'parent' | 'viewport' | 'none'}
             *  @description Component member for bounds.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bounds?: 'parent' | 'viewport' | 'none';
        }
    }

    /** @class       Mover
     *  @public
     *  @description AriannA Mover component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-mover', {}, {
        Attributes: ['handle-selector', 'axis', 'bounds', 'disabled'],
    })
    export class Mover extends Modifier2D.Modifier2D
    {
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
                target.style.position = 'absolute';

            /** @name        handleSel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned handleSel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const handleSel = this.getAttribute('handle-selector');

            /** @name        axis
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned axis value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const axis = (this.getAttribute('axis') ?? 'both') as 'x' | 'y' | 'both';

            /** @name        bounds
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bounds value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bounds = (this.getAttribute('bounds') ?? 'none') as 'parent' | 'viewport' | 'none';

            /** @name        pointerId
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pointerId value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let pointerId = -1;

            /** @name        startPx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned startPx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let startPx = 0, startPy = 0;

            /** @name        startLeft
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned startLeft value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let startLeft = 0, startTop = 0;

            /** @name        isOnHandle
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned isOnHandle value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const isOnHandle = (el: EventTarget | null): boolean => {
                if (!handleSel)
                    return true;
                if (!(el instanceof HTMLElement))
                    return false;
                // Walk up only within the target subtree
                /** @name        cur
                 *  @public
                 *  @type        {HTMLElement | null}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let cur: HTMLElement | null = el;
                while (cur && cur !== target)
                {
                    if (cur.matches(handleSel))
                        return true;
                    cur = cur.parentElement;
                }
                return false;
            };

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
                if (!isOnHandle(e.target))
                    return;
                // Don't hijack interactive descendants (inputs, buttons inside target)
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = e.target as HTMLElement;
                if (t.closest('input, textarea, select, button, [contenteditable="true"]')
                    && t.closest('input, textarea, select, button, [contenteditable="true"]') !== target) {
                    // it's an interactive descendant — let it handle the event
                    if (!handleSel)
                        return;
                }
                e.preventDefault();
                pointerId = e.pointerId;
                startPx = e.clientX;
                startPy = e.clientY;
                startLeft = target.offsetLeft;
                startTop = target.offsetTop;
                try
                {
                    target.setPointerCapture(pointerId);
                }
                catch { /* ignore */ }
                target.addEventListener('pointermove', onMove);
                target.addEventListener('pointerup', onUp);
                target.addEventListener('pointercancel', onUp);
                target.dispatchEvent(new CustomEvent('arianna:move-start', {
                    bubbles: true, detail: { target, x: startLeft, y: startTop },
                }));
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

                /** @name        nx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let nx = startLeft + (ev.clientX - startPx);

                /** @name        ny
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ny value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let ny = startTop + (ev.clientY - startPy);
                if (axis === 'x')
                    ny = startTop;
                if (axis === 'y')
                    nx = startLeft;
                if (bounds === 'parent' && target.parentElement)
                {
                    /** @name        par
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned par value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const par = target.parentElement;

                    /** @name        maxX
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned maxX value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const maxX = par.clientWidth - target.offsetWidth;

                    /** @name        maxY
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned maxY value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const maxY = par.clientHeight - target.offsetHeight;
                    nx = Math.max(0, Math.min(maxX, nx));
                    ny = Math.max(0, Math.min(maxY, ny));
                }
                else if (bounds === 'viewport')
                {
                    /** @name        maxX
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned maxX value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const maxX = window.innerWidth - target.offsetWidth;

                    /** @name        maxY
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned maxY value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const maxY = window.innerHeight - target.offsetHeight;
                    nx = Math.max(0, Math.min(maxX, nx));
                    ny = Math.max(0, Math.min(maxY, ny));
                }
                target.style.left = nx + 'px';
                target.style.top = ny + 'px';
                target.dispatchEvent(new CustomEvent('arianna:move', {
                    bubbles: true, detail: { x: nx, y: ny, target },
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
                    target.releasePointerCapture(pointerId);
                }
                catch { /* ignore */ }
                target.removeEventListener('pointermove', onMove);
                target.removeEventListener('pointerup', onUp);
                target.removeEventListener('pointercancel', onUp);
                pointerId = -1;
                target.dispatchEvent(new CustomEvent('arianna:move-end', {
                    bubbles: true,
                    detail: { x: target.offsetLeft, y: target.offsetTop, target },
                }));
            };
            target.addEventListener('pointerdown', onDown);
            if (handleSel)
                target.style.cursor = ''; // cursor per handle in CSS
            else
                target.style.cursor = 'move';
            this.cleanups.push(() => {
                target.removeEventListener('pointerdown', onDown);
                target.style.cursor = '';
            });
        }
    }
}
export default Mover;
