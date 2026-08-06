/**
 * @module    components/modifiers/2D/Skewer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Skewer component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier2D } from './Base.ts';

/** @namespace   Skewer
 *  @public
 *  @description Namespace containing Skewer contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Skewer
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   SkewerOptions
         *  @public
         *  @description SkewerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SkewerOptions
        {
            /** @name        axis
             *  @public
             *  @type        {'x' | 'y' | 'both'}
             *  @description Component member for axis.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            axis?: 'x' | 'y' | 'both';

            /** @name        maxAngle
             *  @public
             *  @type        {number}
             *  @description Component member for max Angle.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            maxAngle?: number;

            /** @name        handleColor
             *  @public
             *  @type        {string}
             *  @description Component member for handle Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleColor?: string;
        }
    }

    /** @class       Skewer
     *  @public
     *  @description AriannA Skewer component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-skewer', {}, {
        Attributes: ['axis', 'max-angle', 'handle-color', 'disabled'],
    })
    export class Skewer extends Modifier2D.Modifier2D
    {
        /** @name        #skew
         *  @public
         *  @type        {[
            number,
            number
        ]}
         *  @description Component member for skew.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #skew: [
            number,
            number
        ] = [0, 0];

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

            /** @name        axis
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned axis value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const axis = (this.getAttribute('axis') ?? 'both') as 'x' | 'y' | 'both';

            /** @name        max
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned max value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const max = parseFloat(this.getAttribute('max-angle') ?? '45') || 45;

            /** @name        hc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hc = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

            /** @name        dot
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dot value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dot = document.createElement('div');
            dot.className = 'ar-skewer-handle';
            dot.style.cssText =
                `position:absolute;bottom:-10px;right:-10px;width:10px;height:10px;` +
                    `background:${hc};border-radius:50%;cursor:crosshair;z-index:9999;` +
                    `touch-action:none;`;
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

                /** @name        startX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned startX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const startX = e.clientX, startY = e.clientY;

                /** @name        [sx0, sy0]
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned [sx0, sy0] value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const [sx0, sy0] = this.#skew;

                /** @name        onMove
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onMove value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onMove = (ev: PointerEvent) => {
                    /** @name        dx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned dx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const dx = (ev.clientX - startX) / 4;

                    /** @name        dy
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned dy value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const dy = (ev.clientY - startY) / 4;

                    /** @name        sx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sx = axis !== 'y' ? Math.max(-max, Math.min(max, sx0 + dx)) : sx0;

                    /** @name        sy
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sy value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sy = axis !== 'x' ? Math.max(-max, Math.min(max, sy0 + dy)) : sy0;
                    this.#skew = [sx, sy];
                    target.style.transform = `skew(${sx}deg,${sy}deg)`;
                    target.dispatchEvent(new CustomEvent('arianna:skew', {
                        bubbles: true, detail: { skewX: sx, skewY: sy, target },
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
                try
                {
                    dot.setPointerCapture(e.pointerId);
                }
                catch { /* ignore */ }
                dot.addEventListener('pointermove', onMove);
                dot.addEventListener('pointerup', onUp);
                dot.addEventListener('pointercancel', onUp);
            };
            dot.addEventListener('pointerdown', onDown);
            this.cleanups.push(() => {
                dot.removeEventListener('pointerdown', onDown);
                dot.remove();
            });
        }

        /** Reset skew to (0, 0). */
        reset(): this
        {
            this.#skew = [0, 0];
            if (this.target)
            {
                this.target.style.transform = '';
                this.target.dispatchEvent(new CustomEvent('arianna:skew', {
                    bubbles: true, detail: { skewX: 0, skewY: 0, target: this.target },
                }));
            }
            return this;
        }

        /** Current skew (degrees). */
        getSkew(): [
            number,
            number
        ] { return [...this.#skew]; }
    }
}
export default Skewer;
