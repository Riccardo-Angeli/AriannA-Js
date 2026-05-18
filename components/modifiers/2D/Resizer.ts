/**
 * @module    components/modifiers/2D/Resizer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Resizer — 8-direction (or custom subset) resize handles for any HTML target.
 *
 * Declarative usage as a custom element:
 *
 * @example HTML
 *   <arianna-window>
 *     <arianna-resizer handles="se,sw,ne,nw" min-width="120" min-height="80"></arianna-resizer>
 *     <div>window content</div>
 *   </arianna-window>
 *
 *   <arianna-accordion>
 *     <arianna-resizer handles="e,w" min-width="200"></arianna-resizer>
 *     <!-- sections -->
 *   </arianna-accordion>
 *
 * Cross-anchor math
 * -----------------
 * The dragged edge follows the pointer freely. When it crosses the opposite
 * (anchor) edge, the rect keeps resizing on the other side: width keeps
 * growing, the box appears past the anchor, anchor edge stays nailed in
 * place. Set `allow-cross="false"` to clamp at min on the original side.
 *
 *   anchor    = position of the edge that stays still (snapshot at mousedown)
 *   pointer   = position of the dragged edge (follows the cursor)
 *   width     = | pointer - anchor |
 *   leftOrTop = min(anchor, pointer)
 *
 * Events:
 *   - arianna:resize   detail: { width, height, target }
 *
 * Attrs:
 *   handles, min-width, min-height, max-width, max-height,
 *   handle-size, handle-color, allow-cross, disabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier2D } from './Base.ts';

export type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizerOptions {
    handles?     : ResizeDir[];
    minWidth?    : number;
    minHeight?   : number;
    maxWidth?    : number;
    maxHeight?   : number;
    handleSize?  : number;
    handleColor? : string;
    allowCross?  : boolean;
}

function handleStyle(dir: ResizeDir, hs: number): string
{
    const h = hs / 2;
    const map: Record<ResizeDir, string> = {
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

export class Resizer extends (Component('arianna-resizer', HTMLElement, {}, {
    attrs : [
        'handles', 'min-width', 'min-height', 'max-width', 'max-height',
        'handle-size', 'handle-color', 'allow-cross', 'disabled',
    ],
    shadow: false,
}) as typeof Modifier2D)
{
    protected applyTo(target: HTMLElement): void
    {
        if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

        const handlesAttr = this.getAttribute('handles');
        const handles: ResizeDir[] = handlesAttr
            ? handlesAttr.split(',').map(s => s.trim() as ResizeDir).filter(s => /^(n|s|e|w|ne|nw|se|sw)$/.test(s))
            : ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

        const hs        = parseInt(this.getAttribute('handle-size')  ?? '8', 10) || 8;
        const hc        = this.getAttribute('handle-color')          ?? 'var(--arianna-primary, #1f6feb)';
        const allowCross = this.getAttribute('allow-cross')          !== 'false';
        const minW      = parseInt(this.getAttribute('min-width')    ?? (allowCross ? '0'    : '40'), 10) || (allowCross ? 0    : 40);
        const minH      = parseInt(this.getAttribute('min-height')   ?? (allowCross ? '0'    : '40'), 10) || (allowCross ? 0    : 40);
        const maxW      = parseInt(this.getAttribute('max-width')    ?? '9999', 10) || 9999;
        const maxH      = parseInt(this.getAttribute('max-height')   ?? '9999', 10) || 9999;

        for (const dir of handles) {
            const handle = document.createElement('div');
            handle.dataset['resizeDir'] = dir;
            handle.className = 'ar-resizer-handle';
            handle.style.cssText =
                `position:absolute;width:${hs}px;height:${hs}px;background:${hc};` +
                `border-radius:50%;z-index:9999;touch-action:none;` +
                handleStyle(dir, hs);
            target.appendChild(handle);

            let pointerId    = -1;
            let startPx      = 0, startPy = 0;
            let anchorX      = 0, pointerStartX = 0;
            let anchorY      = 0, pointerStartY = 0;
            let movesX       = false, movesY = false;

            const onDown = (e: PointerEvent) => {
                if (!this.isEnabled) return;
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();

                pointerId = e.pointerId;
                startPx   = e.clientX;
                startPy   = e.clientY;

                const w = target.offsetWidth;
                const h = target.offsetHeight;
                const l = target.offsetLeft;
                const t = target.offsetTop;

                if (dir.includes('e')) {
                    anchorX = l; pointerStartX = l + w; movesX = true;
                } else if (dir.includes('w')) {
                    anchorX = l + w; pointerStartX = l; movesX = true;
                } else {
                    movesX = false;
                }

                if (dir.includes('s')) {
                    anchorY = t; pointerStartY = t + h; movesY = true;
                } else if (dir.includes('n')) {
                    anchorY = t + h; pointerStartY = t; movesY = true;
                } else {
                    movesY = false;
                }

                try { handle.setPointerCapture(pointerId); } catch { /* ignore */ }
                handle.addEventListener('pointermove',   onMove);
                handle.addEventListener('pointerup',     onUp);
                handle.addEventListener('pointercancel', onUp);
            };

            const onMove = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId) return;
                const dx = ev.clientX - startPx;
                const dy = ev.clientY - startPy;

                let w  = target.offsetWidth;
                let h  = target.offsetHeight;
                let nl = target.offsetLeft;
                let nt = target.offsetTop;

                if (movesX) {
                    let pointerX = pointerStartX + dx;
                    if (allowCross) {
                        const signed = pointerX - anchorX;
                        if (Math.abs(signed) > maxW) {
                            pointerX = anchorX + (signed < 0 ? -maxW : maxW);
                        }
                    } else {
                        const origSign = (pointerStartX - anchorX) > 0 ? 1 : -1;
                        const signed   = pointerX - anchorX;
                        if (origSign * signed < minW)       pointerX = anchorX + origSign * minW;
                        else if (Math.abs(signed) > maxW)   pointerX = anchorX + origSign * maxW;
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
                        const origSign = (pointerStartY - anchorY) > 0 ? 1 : -1;
                        const signed   = pointerY - anchorY;
                        if (origSign * signed < minH)       pointerY = anchorY + origSign * minH;
                        else if (Math.abs(signed) > maxH)   pointerY = anchorY + origSign * maxH;
                    }
                    h  = Math.round(Math.abs(pointerY - anchorY));
                    nt = Math.round(Math.min(anchorY, pointerY));
                }

                target.style.width  = `${w}px`;
                target.style.height = `${h}px`;
                target.style.left   = `${nl}px`;
                target.style.top    = `${nt}px`;

                target.dispatchEvent(new CustomEvent('arianna:resize', {
                    bubbles: true,
                    detail : { width: w, height: h, target },
                }));
            };

            const onUp = (ev: PointerEvent) => {
                if (ev.pointerId !== pointerId) return;
                try { handle.releasePointerCapture(pointerId); } catch { /* ignore */ }
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

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Resizer', {
        value: Resizer, writable: false, enumerable: false, configurable: false,
    });
}

export default Resizer;
