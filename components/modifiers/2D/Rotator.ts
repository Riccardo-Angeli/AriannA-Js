/**
 * @module    components/modifiers/2D/Rotator
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Rotator component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier2D } from './Base.ts';

/** @namespace   Rotator
 *  @public
 *  @description Namespace containing Rotator contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Rotator
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   RotatorOptions
         *  @public
         *  @description RotatorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RotatorOptions
        {
            /** @name        handleOffset
             *  @public
             *  @type        {number}
             *  @description Component member for handle Offset.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleOffset?: number;

            /** @name        handleColor
             *  @public
             *  @type        {string}
             *  @description Component member for handle Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleColor?: string;

            /** @name        handleSize
             *  @public
             *  @type        {number}
             *  @description Component member for handle Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleSize?: number;

            /** @name        snap
             *  @public
             *  @type        {number}
             *  @description Component member for snap.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            snap?: number;
        }
    }

    /** @class       Rotator
     *  @public
     *  @description AriannA Rotator component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-rotator', {}, {
        Attributes: ['handle-offset', 'handle-color', 'handle-size', 'snap', 'disabled'],
    })
    export class Rotator extends Modifier2D.Modifier2D
    {
        /** @name        #angle
         *  @public
         *  @type        {unknown}
         *  @description Component member for angle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #angle = 0;

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

            /** @name        ho
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ho value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ho = parseInt(this.getAttribute('handle-offset') ?? '24', 10) || 24;

            /** @name        hs
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hs = parseInt(this.getAttribute('handle-size') ?? '10', 10) || 10;

            /** @name        hc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hc = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

            /** @name        snap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned snap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const snap = parseFloat(this.getAttribute('snap') ?? '0') || 0;
            // Visual connector line
            /** @name        line
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned line value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const line = document.createElement('div');
            line.className = 'ar-rotator-line';
            line.style.cssText =
                `position:absolute;top:-${ho}px;left:50%;width:1px;height:${ho}px;` +
                    `background:${hc};transform-origin:bottom;pointer-events:none;z-index:9998;`;
            target.appendChild(line);
            // Draggable dot
            /** @name        dot
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dot value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dot = document.createElement('div');
            dot.className = 'ar-rotator-handle';
            dot.style.cssText =
                `position:absolute;top:-${ho + hs}px;left:50%;transform:translateX(-50%);` +
                    `width:${hs}px;height:${hs}px;background:${hc};border-radius:50%;` +
                    `cursor:grab;z-index:9999;touch-action:none;`;
            target.appendChild(dot);

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

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = target.getBoundingClientRect();

                /** @name        cx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cx = rect.left + rect.width / 2;

                /** @name        cy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cy = rect.top + rect.height / 2;

                /** @name        startAngle
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned startAngle value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const startAngle = this.#angle;

                /** @name        startMouse
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned startMouse value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const startMouse = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
                try
                {
                    dot.setPointerCapture(e.pointerId);
                }
                catch { /* ignore */ }

                /** @name        onMove
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onMove value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onMove = (ev: PointerEvent) => {
                    /** @name        cur
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cur value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cur = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;

                    /** @name        angle
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned angle value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let angle = startAngle + (cur - startMouse);
                    if (snap > 0)
                        angle = Math.round(angle / snap) * snap;
                    this.#angle = angle;
                    target.style.transform = `rotate(${angle}deg)`;
                    target.dispatchEvent(new CustomEvent('arianna:rotate', {
                        bubbles: true, detail: { angle, target },
                    }));
                };

                /** @name        onUp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onUp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onUp = () => {
                    dot.removeEventListener('pointermove', onMove);
                    dot.removeEventListener('pointerup', onUp);
                    dot.removeEventListener('pointercancel', onUp);
                };
                dot.addEventListener('pointermove', onMove);
                dot.addEventListener('pointerup', onUp);
                dot.addEventListener('pointercancel', onUp);
            };
            dot.addEventListener('pointerdown', onDown);
            this.cleanups.push(() => {
                dot.removeEventListener('pointerdown', onDown);
                dot.remove();
                line.remove();
            });
        }

        /** Programmatically set the rotation angle. */
        setAngle(angle: number): this
        {
            if (this.target)
            {
                this.#angle = angle;
                this.target.style.transform = `rotate(${angle}deg)`;
                this.target.dispatchEvent(new CustomEvent('arianna:rotate', {
                    bubbles: true, detail: { angle, target: this.target },
                }));
            }
            return this;
        }

        /** Read the current rotation angle. */
        getAngle(): number { return this.#angle; }
    }
}
export default Rotator;
