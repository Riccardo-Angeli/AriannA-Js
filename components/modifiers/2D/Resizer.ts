/**
 * @module    components/modifiers/2D/Resizer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * 8-direction resize handles on any HTML element.
 *
 * v1.1 fix: monotonic resize. When the user drags past the minimum size, the
 * handle stops at the limit and does not "ribalta" or wobble back. The clamp
 * is computed against the absolute bounding edges of the element at drag start,
 * not just per-axis delta math.
 */

import { Modifier2D, type ModInput } from './Base.ts';

export interface ResizerOptions {
    minWidth?   : number;
    minHeight?  : number;
    maxWidth?   : number;
    maxHeight?  : number;
    handles?    : ('n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw')[];
    handleSize? : number;
    handleColor?: string;
}

export type ResizerCallback = (el: HTMLElement, w: number, h: number) => void;

function _handlePos(dir: string, hs: number): string {
    const h = hs / 2;
    const map: Record<string, string> = {
        n:  `top:-${h}px;left:50%;transform:translateX(-50%);cursor:n-resize;`,
        s:  `bottom:-${h}px;left:50%;transform:translateX(-50%);cursor:s-resize;`,
        e:  `right:-${h}px;top:50%;transform:translateY(-50%);cursor:e-resize;`,
        w:  `left:-${h}px;top:50%;transform:translateY(-50%);cursor:w-resize;`,
        ne: `top:-${h}px;right:-${h}px;cursor:ne-resize;`,
        nw: `top:-${h}px;left:-${h}px;cursor:nw-resize;`,
        se: `bottom:-${h}px;right:-${h}px;cursor:se-resize;`,
        sw: `bottom:-${h}px;left:-${h}px;cursor:sw-resize;`,
    };
    return map[dir] ?? '';
}

export class Resizer extends Modifier2D {
    #opts     : Required<ResizerOptions>;
    #callbacks: ResizerCallback[] = [];

    constructor(input: ModInput, opts: ResizerOptions = {}) {
        super(input);
        this.#opts = {
            minWidth: 40, minHeight: 40, maxWidth: 9999, maxHeight: 9999,
            handles: ['n','s','e','w','ne','nw','se','sw'],
            handleSize: 8, handleColor: '#e40c88', ...opts,
        };
    }

    protected _applyTo(el: HTMLElement): void {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        const { handleSize: hs, handleColor: hc } = this.#opts;

        for (const dir of this.#opts.handles) {
            const h = document.createElement('div');
            h.dataset['resizeDir'] = dir;
            h.style.cssText =
                `position:absolute;width:${hs}px;height:${hs}px;background:${hc};` +
                `border-radius:50%;z-index:9999;touch-action:none;` +
                _handlePos(dir, hs);
            el.appendChild(h);

            // Drag-start state: snapshot of the rect at mousedown.
            // We work in terms of absolute edges (left/right/top/bottom),
            // not per-axis delta-with-clamp, so the math stays monotonic.
            let startX = 0, startY = 0;
            let startL = 0, startT = 0;
            let startW = 0, startH = 0;
            let startR = 0; // right edge = startL + startW
            let startB = 0; // bottom edge = startT + startH
            let pointerId = -1;

            const onDown = (e: PointerEvent) => {
                if (!this.enabled) return;
                if (e.button !== 0) return;
                e.preventDefault();

                startX = e.clientX;
                startY = e.clientY;
                startW = el.offsetWidth;
                startH = el.offsetHeight;
                startT = el.offsetTop;
                startL = el.offsetLeft;
                startR = startL + startW;
                startB = startT + startH;
                pointerId = e.pointerId;

                try { h.setPointerCapture(pointerId); } catch {}

                h.addEventListener('pointermove', onMove);
                h.addEventListener('pointerup',     onUp);
                h.addEventListener('pointercancel', onUp);
            };

            const onMove = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId) return;
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const minW = this.#opts.minWidth;
                const minH = this.#opts.minHeight;
                const maxW = this.#opts.maxWidth;
                const maxH = this.#opts.maxHeight;

                // Compute new edges, then derive width/height/left/top.
                // This is the key change: we never let an edge cross the opposite edge.
                let newL = startL, newT = startT;
                let newR = startR, newB = startB;

                // East edge moves: clamp so newR stays >= startL + minW and <= startL + maxW
                if (dir.includes('e')) {
                    newR = startR + dx;
                    if (newR < startL + minW) newR = startL + minW;  // monotonic stop at min
                    if (newR > startL + maxW) newR = startL + maxW;
                }
                // West edge moves: clamp so newL stays <= startR - minW and >= startR - maxW
                if (dir.includes('w')) {
                    newL = startL + dx;
                    if (newL > startR - minW) newL = startR - minW;  // can't cross/squash past min
                    if (newL < startR - maxW) newL = startR - maxW;
                }
                // South edge moves
                if (dir.includes('s')) {
                    newB = startB + dy;
                    if (newB < startT + minH) newB = startT + minH;
                    if (newB > startT + maxH) newB = startT + maxH;
                }
                // North edge moves
                if (dir.includes('n')) {
                    newT = startT + dy;
                    if (newT > startB - minH) newT = startB - minH;
                    if (newT < startB - maxH) newT = startB - maxH;
                }

                const w  = newR - newL;
                const ht = newB - newT;

                el.style.width  = `${w}px`;
                el.style.height = `${ht}px`;
                el.style.left   = `${newL}px`;
                el.style.top    = `${newT}px`;

                this.#callbacks.forEach(cb => cb(el, w, ht));
            };

            const onUp = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId) return;
                try { h.releasePointerCapture(pointerId); } catch {}
                h.removeEventListener('pointermove', onMove);
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
    }

    onResize(cb: ResizerCallback): this { this.#callbacks.push(cb); return this; }
}
