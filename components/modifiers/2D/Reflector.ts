/**
 * @module    components/modifiers/2D/Reflector
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Reflector component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier2D } from './Base.ts';

/** @namespace   Reflector
 *  @public
 *  @description Namespace containing Reflector contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Reflector
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ReflectorOptions
         *  @public
         *  @description ReflectorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ReflectorOptions
        {
            /** @name        axis
             *  @public
             *  @type        {'x' | 'y' | 'both'}
             *  @description Component member for axis.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            axis?: 'x' | 'y' | 'both';

            /** @name        handleColor
             *  @public
             *  @type        {string}
             *  @description Component member for handle Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleColor?: string;

            /** @name        animate
             *  @public
             *  @type        {boolean}
             *  @description Component member for animate.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            animate?: boolean;
        }
    }

    /** @class       Reflector
     *  @public
     *  @description AriannA Reflector component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-reflector', {}, {
        Attributes: ['axis', 'handle-color', 'animate', 'disabled'],
    })
    export class Reflector extends Modifier2D.Modifier2D
    {
        /** @name        #state
         *  @public
         *  @type        {unknown}
         *  @description Component member for state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #state = { x: false, y: false };

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
            const axis = (this.getAttribute('axis') ?? 'x') as 'x' | 'y' | 'both';

            /** @name        hc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hc = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

            /** @name        animate
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned animate value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const animate = this.getAttribute('animate') !== 'false';
            if (animate)
                target.style.transition = 'transform 0.2s ease';

            /** @name        makeBtn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned makeBtn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const makeBtn = (label: string, pos: string): HTMLButtonElement => {
                /** @name        b
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned b value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const b = document.createElement('button');
                b.textContent = label;
                b.className = 'ar-reflector-btn';
                b.style.cssText =
                    `position:absolute;${pos}background:${hc};color:#fff;border:none;` +
                        `border-radius:4px;width:22px;height:22px;cursor:pointer;` +
                        `font-size:10px;font-weight:700;z-index:9999;`;
                target.appendChild(b);
                return b;
            };
            if (axis === 'x' || axis === 'both')
            {
                /** @name        hx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hx = makeBtn('H', 'right:-28px;top:50%;transform:translateY(-50%);');

                /** @name        onClickX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onClickX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onClickX = () => {
                    if (!this.isEnabled)
                        return;
                    this.#state.x = !this.#state.x;
                    this.#apply(target);
                };
                hx.addEventListener('click', onClickX);
                this.cleanups.push(() => { hx.removeEventListener('click', onClickX); hx.remove(); });
            }
            if (axis === 'y' || axis === 'both')
            {
                /** @name        hy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hy = makeBtn('V', 'top:-28px;left:50%;transform:translateX(-50%);');

                /** @name        onClickY
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onClickY value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onClickY = () => {
                    if (!this.isEnabled)
                        return;
                    this.#state.y = !this.#state.y;
                    this.#apply(target);
                };
                hy.addEventListener('click', onClickY);
                this.cleanups.push(() => { hy.removeEventListener('click', onClickY); hy.remove(); });
            }
        }

        /** @name        #apply
         *  @public
         *  @type        {void}
         *  @description Component member for apply.
         *  @param       {HTMLElement} target Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #apply(target: HTMLElement): void
        {
            target.style.transform = `scale(${this.#state.x ? -1 : 1},${this.#state.y ? -1 : 1})`;
            target.dispatchEvent(new CustomEvent('arianna:reflect', {
                bubbles: true,
                detail: { x: this.#state.x, y: this.#state.y, target },
            }));
        }

        /** Programmatic flip on X axis. */
        flipX(): this
        {
            if (this.target)
            {
                this.#state.x = !this.#state.x;
                this.#apply(this.target);
            }
            return this;
        }

        /** Programmatic flip on Y axis. */
        flipY(): this
        {
            if (this.target)
            {
                this.#state.y = !this.#state.y;
                this.#apply(this.target);
            }
            return this;
        }

        /** Reset to identity. */
        reset(): this
        {
            this.#state = { x: false, y: false };
            if (this.target)
            {
                this.target.style.transform = '';
                this.target.dispatchEvent(new CustomEvent('arianna:reflect', {
                    bubbles: true,
                    detail: { x: false, y: false, target: this.target },
                }));
            }
            return this;
        }

        /** Current flip state. */
        getState():
        {
            /** @name        x
             *  @public
             *  @type        {boolean}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x: boolean;

            /** @name        y
             *  @public
             *  @type        {boolean}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y: boolean;
        } { return { ...this.#state }; }
    }
}
export default Reflector;
