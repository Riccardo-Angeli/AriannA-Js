/**
 * @module    components/modifiers/2D/Mover
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Mover — drag-to-move modifier. Attached as a child of a positionable host
 * (Window, Card, Modal, ...), it makes the host draggable.
 *
 * The whole target becomes draggable (pointerdown anywhere on it that is not
 * on another interactive element). For windows you typically want only the
 * title bar — in that case place an `arianna-mover handle-selector=".title"`
 * child inside the host and only that descendant becomes the drag handle.
 *
 * @example HTML
 *   <arianna-window>
 *     <arianna-mover handle-selector=".titlebar"></arianna-mover>
 *     <div class="titlebar">My Window</div>
 *     <div>content</div>
 *   </arianna-window>
 *
 * Events:
 *   - arianna:move-start
 *   - arianna:move        detail: { x, y, target }
 *   - arianna:move-end
 *
 * Attrs:
 *   handle-selector   CSS selector inside target; when set, only descendants
 *                     matching this selector are draggable. Without it the
 *                     whole target is the drag handle.
 *   axis              'x' | 'y' | 'both' (default 'both')
 *   bounds            'parent' | 'viewport' | 'none' (default 'none')
 *   disabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier2D } from './Base.ts';

export interface MoverOptions {
    handleSelector? : string;
    axis?           : 'x' | 'y' | 'both';
    bounds?         : 'parent' | 'viewport' | 'none';
}

export class Mover extends (Component('arianna-mover', HTMLElement, {}, {
    attrs : ['handle-selector', 'axis', 'bounds', 'disabled'],
}) as typeof Modifier2D)
{
    protected applyTo(target: HTMLElement): void
    {
        if (getComputedStyle(target).position === 'static') target.style.position = 'absolute';

        const handleSel = this.getAttribute('handle-selector');
        const axis      = (this.getAttribute('axis') ?? 'both') as 'x' | 'y' | 'both';
        const bounds    = (this.getAttribute('bounds') ?? 'none') as 'parent' | 'viewport' | 'none';

        let pointerId = -1;
        let startPx = 0, startPy = 0;
        let startLeft = 0, startTop = 0;

        const isOnHandle = (el: EventTarget | null): boolean => {
            if (!handleSel) return true;
            if (!(el instanceof HTMLElement)) return false;
            // Walk up only within the target subtree
            let cur: HTMLElement | null = el;
            while (cur && cur !== target) {
                if (cur.matches(handleSel)) return true;
                cur = cur.parentElement;
            }
            return false;
        };

        const onDown = (e: PointerEvent) => {
            if (!this.isEnabled) return;
            if (e.button !== 0) return;
            if (!isOnHandle(e.target)) return;
            // Don't hijack interactive descendants (inputs, buttons inside target)
            const t = e.target as HTMLElement;
            if (t.closest('input, textarea, select, button, [contenteditable="true"]')
                && t.closest('input, textarea, select, button, [contenteditable="true"]') !== target) {
                // it's an interactive descendant — let it handle the event
                if (!handleSel) return;
            }
            e.preventDefault();

            pointerId  = e.pointerId;
            startPx    = e.clientX;
            startPy    = e.clientY;
            startLeft  = target.offsetLeft;
            startTop   = target.offsetTop;

            try { target.setPointerCapture(pointerId); } catch { /* ignore */ }
            target.addEventListener('pointermove',   onMove);
            target.addEventListener('pointerup',     onUp);
            target.addEventListener('pointercancel', onUp);

            target.dispatchEvent(new CustomEvent('arianna:move-start', {
                bubbles: true, detail: { target, x: startLeft, y: startTop },
            }));
        };

        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            let nx = startLeft + (ev.clientX - startPx);
            let ny = startTop  + (ev.clientY - startPy);

            if (axis === 'x') ny = startTop;
            if (axis === 'y') nx = startLeft;

            if (bounds === 'parent' && target.parentElement) {
                const par = target.parentElement;
                const maxX = par.clientWidth  - target.offsetWidth;
                const maxY = par.clientHeight - target.offsetHeight;
                nx = Math.max(0, Math.min(maxX, nx));
                ny = Math.max(0, Math.min(maxY, ny));
            } else if (bounds === 'viewport') {
                const maxX = window.innerWidth  - target.offsetWidth;
                const maxY = window.innerHeight - target.offsetHeight;
                nx = Math.max(0, Math.min(maxX, nx));
                ny = Math.max(0, Math.min(maxY, ny));
            }

            target.style.left = nx + 'px';
            target.style.top  = ny + 'px';

            target.dispatchEvent(new CustomEvent('arianna:move', {
                bubbles: true, detail: { x: nx, y: ny, target },
            }));
        };

        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            try { target.releasePointerCapture(pointerId); } catch { /* ignore */ }
            target.removeEventListener('pointermove',   onMove);
            target.removeEventListener('pointerup',     onUp);
            target.removeEventListener('pointercancel', onUp);
            pointerId = -1;

            target.dispatchEvent(new CustomEvent('arianna:move-end', {
                bubbles: true,
                detail : { x: target.offsetLeft, y: target.offsetTop, target },
            }));
        };

        target.addEventListener('pointerdown', onDown);
        if (handleSel) target.style.cursor = '';   // cursor per handle in CSS
        else           target.style.cursor = 'move';

        this.cleanups.push(() => {
            target.removeEventListener('pointerdown', onDown);
            target.style.cursor = '';
        });
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Mover', {
        value: Mover, writable: false, enumerable: false, configurable: false,
    });
}

export default Mover;
