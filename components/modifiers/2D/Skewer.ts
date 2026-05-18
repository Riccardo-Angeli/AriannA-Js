/**
 * @module    components/modifiers/2D/Skewer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Skewer — drag a handle to apply CSS `skewX` / `skewY` to the target.
 *
 * @example HTML
 *   <div class="canvas-box">
 *     <arianna-skewer axis="both" max-angle="45"></arianna-skewer>
 *     <!-- content -->
 *   </div>
 *
 * Events:
 *   - arianna:skew   detail: { skewX, skewY, target }
 *
 * Attrs:
 *   axis          'x' | 'y' | 'both' (default 'both')
 *   max-angle     degree clamp (default 45)
 *   handle-color  default var(--arianna-primary)
 *   disabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier2D } from './Base.ts';

export interface SkewerOptions {
    axis?        : 'x' | 'y' | 'both';
    maxAngle?    : number;
    handleColor? : string;
}

export class Skewer extends (Component('arianna-skewer', HTMLElement, {}, {
    attrs : ['axis', 'max-angle', 'handle-color', 'disabled'],
    shadow: false,
}) as typeof Modifier2D)
{
    #skew: [number, number] = [0, 0];

    protected applyTo(target: HTMLElement): void
    {
        if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

        const axis = (this.getAttribute('axis') ?? 'both') as 'x' | 'y' | 'both';
        const max  = parseFloat(this.getAttribute('max-angle') ?? '45') || 45;
        const hc   = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

        const dot = document.createElement('div');
        dot.className = 'ar-skewer-handle';
        dot.style.cssText =
            `position:absolute;bottom:-10px;right:-10px;width:10px;height:10px;` +
            `background:${hc};border-radius:50%;cursor:crosshair;z-index:9999;` +
            `touch-action:none;`;
        target.appendChild(dot);

        const onDown = (e: PointerEvent) => {
            if (!this.isEnabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX, startY = e.clientY;
            const [sx0, sy0] = this.#skew;

            const onMove = (ev: PointerEvent) => {
                const dx = (ev.clientX - startX) / 4;
                const dy = (ev.clientY - startY) / 4;
                const sx = axis !== 'y' ? Math.max(-max, Math.min(max, sx0 + dx)) : sx0;
                const sy = axis !== 'x' ? Math.max(-max, Math.min(max, sy0 + dy)) : sy0;
                this.#skew = [sx, sy];
                target.style.transform = `skew(${sx}deg,${sy}deg)`;
                target.dispatchEvent(new CustomEvent('arianna:skew', {
                    bubbles: true, detail: { skewX: sx, skewY: sy, target },
                }));
            };
            const onUp = () => {
                dot.removeEventListener('pointermove',   onMove);
                dot.removeEventListener('pointerup',     onUp);
                dot.removeEventListener('pointercancel', onUp);
            };
            try { dot.setPointerCapture(e.pointerId); } catch { /* ignore */ }
            dot.addEventListener('pointermove',   onMove);
            dot.addEventListener('pointerup',     onUp);
            dot.addEventListener('pointercancel', onUp);
        };

        dot.addEventListener('pointerdown', onDown);
        this.cleanups.push(() => {
            dot.removeEventListener('pointerdown', onDown);
            dot.remove();
        });
    }

    /** Reset skew to (0, 0). */
    reset(): this {
        this.#skew = [0, 0];
        if (this.target) {
            this.target.style.transform = '';
            this.target.dispatchEvent(new CustomEvent('arianna:skew', {
                bubbles: true, detail: { skewX: 0, skewY: 0, target: this.target },
            }));
        }
        return this;
    }

    /** Current skew (degrees). */
    getSkew(): [number, number] { return [...this.#skew]; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Skewer', {
        value: Skewer, writable: false, enumerable: false, configurable: false,
    });
}

export default Skewer;
