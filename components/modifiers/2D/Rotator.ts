/**
 * @module    components/modifiers/2D/Rotator
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Rotator — drag-to-rotate handle with optional angle snap. Attached as a
 * child of any HTML target, exposes a small dot above the target that can
 * be dragged in a circle to set `target.style.transform = rotate(Xdeg)`.
 *
 * @example HTML
 *   <div class="canvas-shape">
 *     <arianna-rotator snap="15"></arianna-rotator>
 *     <!-- content -->
 *   </div>
 *
 * Events:
 *   - arianna:rotate   detail: { angle, target }
 *
 * Attrs:
 *   handle-offset   pixels above target where the handle sits (default 24)
 *   handle-color    color of dot + line (default var(--arianna-primary))
 *   handle-size     dot size in pixels (default 10)
 *   snap            degree increments (default 0 = free rotation)
 *   disabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier2D } from './Base.ts';

export interface RotatorOptions {
    handleOffset? : number;
    handleColor?  : string;
    handleSize?   : number;
    snap?         : number;
}

export class Rotator extends (Component('arianna-rotator', HTMLElement, {}, {
    attrs : ['handle-offset', 'handle-color', 'handle-size', 'snap', 'disabled'],
    shadow: false,
}) as typeof Modifier2D)
{
    #angle = 0;

    protected applyTo(target: HTMLElement): void
    {
        if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

        const ho   = parseInt(this.getAttribute('handle-offset') ?? '24', 10) || 24;
        const hs   = parseInt(this.getAttribute('handle-size')   ?? '10', 10) || 10;
        const hc   = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';
        const snap = parseFloat(this.getAttribute('snap') ?? '0') || 0;

        // Visual connector line
        const line = document.createElement('div');
        line.className = 'ar-rotator-line';
        line.style.cssText =
            `position:absolute;top:-${ho}px;left:50%;width:1px;height:${ho}px;` +
            `background:${hc};transform-origin:bottom;pointer-events:none;z-index:9998;`;
        target.appendChild(line);

        // Draggable dot
        const dot = document.createElement('div');
        dot.className = 'ar-rotator-handle';
        dot.style.cssText =
            `position:absolute;top:-${ho + hs}px;left:50%;transform:translateX(-50%);` +
            `width:${hs}px;height:${hs}px;background:${hc};border-radius:50%;` +
            `cursor:grab;z-index:9999;touch-action:none;`;
        target.appendChild(dot);

        const onDown = (e: PointerEvent) => {
            if (!this.isEnabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = target.getBoundingClientRect();
            const cx   = rect.left + rect.width / 2;
            const cy   = rect.top  + rect.height / 2;
            const startAngle = this.#angle;
            const startMouse = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;

            try { dot.setPointerCapture(e.pointerId); } catch { /* ignore */ }

            const onMove = (ev: PointerEvent) => {
                const cur = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
                let angle = startAngle + (cur - startMouse);
                if (snap > 0) angle = Math.round(angle / snap) * snap;
                this.#angle = angle;
                target.style.transform = `rotate(${angle}deg)`;
                target.dispatchEvent(new CustomEvent('arianna:rotate', {
                    bubbles: true, detail: { angle, target },
                }));
            };
            const onUp = () => {
                dot.removeEventListener('pointermove',   onMove);
                dot.removeEventListener('pointerup',     onUp);
                dot.removeEventListener('pointercancel', onUp);
            };
            dot.addEventListener('pointermove',   onMove);
            dot.addEventListener('pointerup',     onUp);
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
        if (this.target) {
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

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Rotator', {
        value: Rotator, writable: false, enumerable: false, configurable: false,
    });
}

export default Rotator;
