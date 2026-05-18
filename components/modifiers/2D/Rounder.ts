/**
 * @module    components/modifiers/2D/Rounder
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Rounder — drag a handle to change the target's `border-radius`. Two modes:
 *
 * • Uniform mode (default): single handle in top-left corner; horizontal drag
 *   changes the radius on all four corners.
 *
 * • Per-corner mode: four independent handles, each adjusts one corner.
 *   VERTICAL drag (down = larger) per handle.
 *
 *   Per-corner mode activates automatically when any of `top-left`,
 *   `top-right`, `bottom-left`, `bottom-right` attrs are set.
 *
 * @example HTML uniform
 *   <div class="canvas-box">
 *     <arianna-rounder r="20" max="100"></arianna-rounder>
 *     <!-- content -->
 *   </div>
 *
 * @example HTML per-corner
 *   <div class="canvas-box">
 *     <arianna-rounder top-left="0" top-right="20" bottom-right="40" bottom-left="0"></arianna-rounder>
 *   </div>
 *
 * Events:
 *   - arianna:round   detail: { radius, corner: 'all' | Corner, target }
 *
 * Attrs:
 *   r / radius                          uniform initial radius
 *   top-left, top-right, bottom-left, bottom-right   per-corner overrides (activates per-corner mode)
 *   max                                 clamp ceiling (default 100)
 *   handle-color
 *   corners                             comma-list, default 'top-left,top-right,bottom-left,bottom-right'
 *   disabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier2D } from './Base.ts';

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface RounderOptions {
    r?            : number;
    radius?       : number;
    max?          : number;
    handleColor?  : string;
    corners?      : Corner[];
    'top-left'?   : number;
    'top-right'?  : number;
    'bottom-left'?: number;
    'bottom-right'?: number;
}

interface CornerState {
    'top-left'    : number;
    'top-right'   : number;
    'bottom-left' : number;
    'bottom-right': number;
}

function cornerPos(c: Corner): string
{
    const off = '6px';
    switch (c) {
        case 'top-left':     return `top:${off};left:${off};cursor:nwse-resize;`;
        case 'top-right':    return `top:${off};right:${off};cursor:nesw-resize;`;
        case 'bottom-left':  return `bottom:${off};left:${off};cursor:nesw-resize;`;
        case 'bottom-right': return `bottom:${off};right:${off};cursor:nwse-resize;`;
    }
}

function renderRadii(el: HTMLElement, s: CornerState): void
{
    // CSS shorthand order: top-left, top-right, bottom-right, bottom-left
    el.style.borderRadius =
        `${s['top-left']}px ${s['top-right']}px ${s['bottom-right']}px ${s['bottom-left']}px`;
}

export class Rounder extends (Component('arianna-rounder', HTMLElement, {}, {
    attrs : [
        'r', 'radius', 'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'max', 'handle-color', 'corners', 'disabled',
    ],
    shadow: false,
}) as typeof Modifier2D)
{
    #state: CornerState = { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 };

    protected applyTo(target: HTMLElement): void
    {
        if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

        const r0    = parseFloat(this.getAttribute('r') ?? this.getAttribute('radius') ?? '0') || 0;
        const tl    = this.getAttribute('top-left');
        const tr    = this.getAttribute('top-right');
        const bl    = this.getAttribute('bottom-left');
        const br    = this.getAttribute('bottom-right');
        const max   = parseFloat(this.getAttribute('max') ?? '100') || 100;
        const hc    = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

        const perCorner = (tl !== null) || (tr !== null) || (bl !== null) || (br !== null);

        this.#state = {
            'top-left'    : tl !== null ? parseFloat(tl) : r0,
            'top-right'   : tr !== null ? parseFloat(tr) : r0,
            'bottom-left' : bl !== null ? parseFloat(bl) : r0,
            'bottom-right': br !== null ? parseFloat(br) : r0,
        };
        renderRadii(target, this.#state);

        if (perCorner) {
            const cornersAttr = this.getAttribute('corners');
            const corners: Corner[] = cornersAttr
                ? cornersAttr.split(',').map(s => s.trim() as Corner)
                : ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            for (const c of corners) this.#addCornerHandle(target, c, hc, max);
        } else {
            this.#addUniformHandle(target, hc, max);
        }
    }

    #addUniformHandle(target: HTMLElement, hc: string, max: number): void
    {
        const h = document.createElement('div');
        h.className = 'ar-rounder-handle';
        h.title = 'Drag to round all corners';
        h.style.cssText =
            `position:absolute;top:6px;left:6px;width:10px;height:10px;` +
            `background:${hc};border-radius:50%;` +
            `cursor:ew-resize;z-index:9999;touch-action:none;`;
        target.appendChild(h);

        let pointerId = -1, startX = 0, startR = 0;

        const onDown = (e: PointerEvent) => {
            if (!this.isEnabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            pointerId = e.pointerId;
            startX = e.clientX;
            startR = this.#state['top-left'];
            try { h.setPointerCapture(pointerId); } catch { /* ignore */ }
            h.addEventListener('pointermove',   onMove);
            h.addEventListener('pointerup',     onUp);
            h.addEventListener('pointercancel', onUp);
        };
        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            const r = Math.max(0, Math.min(max, startR + (ev.clientX - startX) / 2));
            this.#state['top-left'] = this.#state['top-right'] = this.#state['bottom-left'] = this.#state['bottom-right'] = r;
            renderRadii(target, this.#state);
            target.dispatchEvent(new CustomEvent('arianna:round', {
                bubbles: true, detail: { radius: r, corner: 'all', target },
            }));
        };
        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            try { h.releasePointerCapture(pointerId); } catch { /* ignore */ }
            h.removeEventListener('pointermove',   onMove);
            h.removeEventListener('pointerup',     onUp);
            h.removeEventListener('pointercancel', onUp);
            pointerId = -1;
        };

        h.addEventListener('pointerdown', onDown);
        this.cleanups.push(() => {
            h.removeEventListener('pointerdown', onDown);
            h.remove();
        });
    }

    #addCornerHandle(target: HTMLElement, corner: Corner, hc: string, max: number): void
    {
        const h = document.createElement('div');
        h.className = 'ar-rounder-handle';
        h.dataset['corner'] = corner;
        h.title = `Drag vertically to round ${corner}`;
        h.style.cssText =
            `position:absolute;width:10px;height:10px;background:${hc};` +
            `border-radius:50%;z-index:9999;touch-action:none;` +
            cornerPos(corner);
        target.appendChild(h);

        let pointerId = -1, startY = 0, startR = 0;

        const onDown = (e: PointerEvent) => {
            if (!this.isEnabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            pointerId = e.pointerId;
            startY = e.clientY;
            startR = this.#state[corner];
            try { h.setPointerCapture(pointerId); } catch { /* ignore */ }
            h.addEventListener('pointermove',   onMove);
            h.addEventListener('pointerup',     onUp);
            h.addEventListener('pointercancel', onUp);
        };
        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            // vertical drag: down = larger radius
            const r = Math.max(0, Math.min(max, startR + (ev.clientY - startY) / 2));
            this.#state[corner] = r;
            renderRadii(target, this.#state);
            target.dispatchEvent(new CustomEvent('arianna:round', {
                bubbles: true, detail: { radius: r, corner, target },
            }));
        };
        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            try { h.releasePointerCapture(pointerId); } catch { /* ignore */ }
            h.removeEventListener('pointermove',   onMove);
            h.removeEventListener('pointerup',     onUp);
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
    setRadius(r: number): this {
        if (this.target) {
            const max = parseFloat(this.getAttribute('max') ?? '100') || 100;
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
    setCorner(corner: Corner, r: number): this {
        if (this.target) {
            const max = parseFloat(this.getAttribute('max') ?? '100') || 100;
            const v = Math.max(0, Math.min(max, r));
            this.#state[corner] = v;
            renderRadii(this.target, this.#state);
            this.target.dispatchEvent(new CustomEvent('arianna:round', {
                bubbles: true, detail: { radius: v, corner, target: this.target },
            }));
        }
        return this;
    }

    getCorners(): CornerState { return { ...this.#state }; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Rounder', {
        value: Rounder, writable: false, enumerable: false, configurable: false,
    });
}

export default Rounder;
