/**
 * @module    components/modifiers/2D/Reflector
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Reflector — H / V flip buttons next to the target. Modifies
 * `target.style.transform` with a `scale(±1, ±1)` factor.
 *
 * @example HTML
 *   <div class="canvas-image">
 *     <arianna-reflector axis="both"></arianna-reflector>
 *     <img src="...">
 *   </div>
 *
 * Events:
 *   - arianna:reflect   detail: { x, y, target }   (x/y: boolean current state)
 *
 * Attrs:
 *   axis          'x' | 'y' | 'both' (default 'x')
 *   handle-color  default var(--arianna-primary)
 *   animate       'true' | 'false' — apply 0.2s CSS transition (default true)
 *   disabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier2D } from './Base.ts';

export interface ReflectorOptions {
    axis?        : 'x' | 'y' | 'both';
    handleColor? : string;
    animate?     : boolean;
}

export class Reflector extends (Component('arianna-reflector', HTMLElement, {}, {
    attrs : ['axis', 'handle-color', 'animate', 'disabled'],
    shadow: false,
}) as typeof Modifier2D)
{
    #state = { x: false, y: false };

    protected applyTo(target: HTMLElement): void
    {
        if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

        const axis    = (this.getAttribute('axis') ?? 'x') as 'x' | 'y' | 'both';
        const hc      = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';
        const animate = this.getAttribute('animate') !== 'false';

        if (animate) target.style.transition = 'transform 0.2s ease';

        const makeBtn = (label: string, pos: string): HTMLButtonElement => {
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

        if (axis === 'x' || axis === 'both') {
            const hx = makeBtn('H', 'right:-28px;top:50%;transform:translateY(-50%);');
            const onClickX = () => {
                if (!this.isEnabled) return;
                this.#state.x = !this.#state.x;
                this.#apply(target);
            };
            hx.addEventListener('click', onClickX);
            this.cleanups.push(() => { hx.removeEventListener('click', onClickX); hx.remove(); });
        }
        if (axis === 'y' || axis === 'both') {
            const hy = makeBtn('V', 'top:-28px;left:50%;transform:translateX(-50%);');
            const onClickY = () => {
                if (!this.isEnabled) return;
                this.#state.y = !this.#state.y;
                this.#apply(target);
            };
            hy.addEventListener('click', onClickY);
            this.cleanups.push(() => { hy.removeEventListener('click', onClickY); hy.remove(); });
        }
    }

    #apply(target: HTMLElement): void
    {
        target.style.transform = `scale(${this.#state.x ? -1 : 1},${this.#state.y ? -1 : 1})`;
        target.dispatchEvent(new CustomEvent('arianna:reflect', {
            bubbles: true,
            detail : { x: this.#state.x, y: this.#state.y, target },
        }));
    }

    /** Programmatic flip on X axis. */
    flipX(): this { if (this.target) { this.#state.x = !this.#state.x; this.#apply(this.target); } return this; }
    /** Programmatic flip on Y axis. */
    flipY(): this { if (this.target) { this.#state.y = !this.#state.y; this.#apply(this.target); } return this; }
    /** Reset to identity. */
    reset(): this {
        this.#state = { x: false, y: false };
        if (this.target) {
            this.target.style.transform = '';
            this.target.dispatchEvent(new CustomEvent('arianna:reflect', {
                bubbles: true,
                detail : { x: false, y: false, target: this.target },
            }));
        }
        return this;
    }

    /** Current flip state. */
    getState(): { x: boolean; y: boolean } { return { ...this.#state }; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Reflector', {
        value: Reflector, writable: false, enumerable: false, configurable: false,
    });
}

export default Reflector;
