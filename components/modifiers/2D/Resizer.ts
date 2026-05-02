/**
 * @module    components/modifiers/2D/Resizer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * 8-direction resize handles on any HTML element.
 *
 * Cross-anchor behavior
 * ---------------------
 * The dragged edge follows the pointer freely. When it crosses the
 * opposite (anchor) edge, the rectangle keeps resizing on the other
 * side: width keeps growing, the box appears past the anchor, and
 * the anchor edge stays nailed to its original position.
 *
 * Content is NOT mirrored. The DOM rect simply repositions and resizes.
 * If you need a visual mirror (Photoshop-style), add scaleX/scaleY
 * yourself in the onResize callback.
 *
 * Math (per axis where the handle moves)
 * --------------------------------------
 *   anchor    = position of the edge that stays still (snapshot at mousedown)
 *   pointer   = position of the dragged edge (follows the cursor)
 *   width     = | pointer - anchor |
 *   leftOrTop = min(anchor, pointer)
 *
 * That's it. No flip state. No transform manipulation.
 *
 * If `allowCross: false` (default true), the dragged edge clamps at
 * the anchor minus minWidth/minHeight, so the rect cannot pass through.
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
    /**
     * Allow the dragged edge to cross past the opposite edge. The rect
     * keeps resizing on the other side. Default true.
     * Set false to clamp at minWidth / minHeight on the original side.
     */
    allowCross? : boolean;
}

export type ResizerCallback = (
    el: HTMLElement, w: number, h: number,
) => void;

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
        const allowCross = opts.allowCross ?? true;
        this.#opts = {
            minWidth:    opts.minWidth    ?? (allowCross ? 0 : 40),
            minHeight:   opts.minHeight   ?? (allowCross ? 0 : 40),
            maxWidth:    opts.maxWidth    ?? 9999,
            maxHeight:   opts.maxHeight   ?? 9999,
            handles:     opts.handles     ?? ['n','s','e','w','ne','nw','se','sw'],
            handleSize:  opts.handleSize  ?? 8,
            handleColor: opts.handleColor ?? '#e40c88',
            allowCross,
        };
    }

    onResize(cb: ResizerCallback): this { this.#callbacks.push(cb); return this; }

    protected _applyTo(el: HTMLElement): void {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

        const { handleSize: hs, handleColor: hc, allowCross,
                minWidth: minW, minHeight: minH,
                maxWidth: maxW, maxHeight: maxH } = this.#opts;

        for (const dir of this.#opts.handles) {
            const handle = document.createElement('div');
            handle.dataset['resizeDir'] = dir;
            handle.style.cssText =
                `position:absolute;width:${hs}px;height:${hs}px;background:${hc};` +
                `border-radius:50%;z-index:9999;touch-action:none;` +
                _handlePos(dir, hs);
            el.appendChild(handle);

            let pointerId    = -1;
            let startPx      = 0, startPy   = 0;
            let anchorX      = 0, pointerStartX = 0;
            let anchorY      = 0, pointerStartY = 0;
            let movesX       = false, movesY = false;

            const onDown = (e: PointerEvent) => {
                if (!this.enabled) return;
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();

                pointerId = e.pointerId;
                startPx   = e.clientX;
                startPy   = e.clientY;

                const w = el.offsetWidth;
                const h = el.offsetHeight;
                const l = el.offsetLeft;
                const t = el.offsetTop;

                if (dir.includes('e')) {
                    anchorX       = l;
                    pointerStartX = l + w;
                    movesX        = true;
                } else if (dir.includes('w')) {
                    anchorX       = l + w;
                    pointerStartX = l;
                    movesX        = true;
                } else {
                    movesX        = false;
                }

                if (dir.includes('s')) {
                    anchorY       = t;
                    pointerStartY = t + h;
                    movesY        = true;
                } else if (dir.includes('n')) {
                    anchorY       = t + h;
                    pointerStartY = t;
                    movesY        = true;
                } else {
                    movesY        = false;
                }

                try { handle.setPointerCapture(pointerId); } catch {}
                handle.addEventListener('pointermove',   onMove);
                handle.addEventListener('pointerup',     onUp);
                handle.addEventListener('pointercancel', onUp);
            };

            const onMove = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId) return;
                const dx = ev.clientX - startPx;
                const dy = ev.clientY - startPy;

                let w  = el.offsetWidth;
                let h  = el.offsetHeight;
                let nl = el.offsetLeft;
                let nt = el.offsetTop;

                if (movesX) {
                    let pointerX = pointerStartX + dx;

                    if (allowCross) {
                        // Free movement, only clamp upper bound on either side
                        const signed = pointerX - anchorX;
                        if (Math.abs(signed) > maxW) {
                            pointerX = anchorX + (signed < 0 ? -maxW : maxW);
                        }
                    } else {
                        // Clamp at min on the original side; cannot cross.
                        const startSigned = pointerStartX - anchorX;
                        const origSign    = startSigned > 0 ? 1 : -1;
                        const signed      = pointerX - anchorX;
                        if (origSign * signed < minW) {
                            pointerX = anchorX + origSign * minW;
                        } else if (Math.abs(signed) > maxW) {
                            pointerX = anchorX + origSign * maxW;
                        }
                    }

                    w  = Math.round(Math.abs(pointerX - anchorX));
                    nl = Math.round(Math.min(anchorX, pointerX));
                }

                if (movesY) {
                    let pointerY = pointerStartY + dy;

                    if (allowCross) {
                        const signed = pointerY - anchorY;
                        if (Math.abs(signed) > maxH) {
                            pointerY = anchorY + (signed < 0 ? -maxH : maxH);
                        }
                    } else {
                        const startSigned = pointerStartY - anchorY;
                        const origSign    = startSigned > 0 ? 1 : -1;
                        const signed      = pointerY - anchorY;
                        if (origSign * signed < minH) {
                            pointerY = anchorY + origSign * minH;
                        } else if (Math.abs(signed) > maxH) {
                            pointerY = anchorY + origSign * maxH;
                        }
                    }

                    h  = Math.round(Math.abs(pointerY - anchorY));
                    nt = Math.round(Math.min(anchorY, pointerY));
                }

                el.style.width  = `${w}px`;
                el.style.height = `${h}px`;
                el.style.left   = `${nl}px`;
                el.style.top    = `${nt}px`;

                this.#callbacks.forEach(cb => cb(el, w, h));
            };

            const onUp = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId) return;
                try { handle.releasePointerCapture(pointerId); } catch {}
                handle.removeEventListener('pointermove',   onMove);
                handle.removeEventListener('pointerup',     onUp);
                handle.removeEventListener('pointercancel', onUp);
                pointerId = -1;
            };

            handle.addEventListener('pointerdown', onDown);
            this.cleanups.push(() => {
                handle.removeEventListener('pointerdown', onDown);
                handle.remove();
            });
        }
    }
}

export default Resizer;
