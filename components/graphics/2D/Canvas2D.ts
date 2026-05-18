/**
 * @module    components/graphics/2D/Canvas2D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Canvas2D — infinite 2D viewport with pan, zoom, scroll. Foundation for
 * Wires, Daedalus, and any AriannA 2D vector editor.
 *
 *   • Infinite virtual coord space (no document size limit)
 *   • Pan via middle-mouse, space+drag, or two-finger trackpad
 *   • Zoom via ctrl/cmd+wheel or programmatic API
 *   • World ↔ screen transforms
 *   • Optional grid background + rulers
 *
 * Mount user content into `canvas.world` — Canvas2D handles the CSS transform.
 *
 * @example HTML
 *   <arianna-canvas-2d width="100%" height="600px" grid-size="20" show-rulers></arianna-canvas-2d>
 *
 * @example JS
 *   const cv = new Canvas2D();
 *   cv.zoomTo(2);
 *   cv.panTo(0, 0);
 *   const wp = cv.screenToWorld({ x: 300, y: 200 });
 *
 * Events: arianna:viewport  detail: { zoom, panX, panY }
 * Attrs:  width, height, pan-x, pan-y, zoom, zoom-min, zoom-max, grid-size, show-rulers, show-grid
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export interface Vec2 { x: number; y: number; }

export interface Canvas2DOptions {
    width?      : string;
    height?     : string;
    panX?       : number;
    panY?       : number;
    zoom?       : number;
    zoomMin?    : number;
    zoomMax?    : number;
    gridSize?   : number;
    showRulers? : boolean;
    showGrid?   : boolean;
}

interface ViewportState { panX: number; panY: number; zoom: number; }

export class Canvas2D extends Component('arianna-canvas-2d', HTMLElement, {}, {
    attrs : ['width', 'height', 'pan-x', 'pan-y', 'zoom', 'zoom-min', 'zoom-max', 'grid-size', 'show-rulers', 'show-grid'],
    shadow: false,
})
{
    viewport$: Signal<ViewportState> = signal<ViewportState>({ panX: 0, panY: 0, zoom: 1 });

    /** Content container — user code mounts into this in world coordinates. */
    get world(): HTMLElement {
        let w = this.querySelector<HTMLElement>('.ar-canvas2d__world');
        if (!w) {
            w = document.createElement('div');
            w.className = 'ar-canvas2d__world';
            this.appendChild(w);
        }
        return w;
    }

    build(_opts: Canvas2DOptions = {})
    {
        const wAttr      = this.attrSignal('width');
        const hAttr      = this.attrSignal('height');
        const gridAttr   = this.attrSignal('grid-size');
        const showRulers = () => this.getAttribute('show-rulers') === 'true' || this.hasAttribute('show-rulers');
        const showGrid   = () => this.getAttribute('show-grid')   !== 'false';

        this.hostStyle = () => {
            const w = wAttr.get() ?? '100%';
            const h = hAttr.get() ?? '600px';
            return `width: ${w}; height: ${h}`;
        };
        this.gridBgStyle = () => {
            if (!showGrid()) return '';
            const gs = parseFloat(gridAttr.get() ?? '20') || 20;
            const z  = this.viewport$.get().zoom;
            const pz = gs * z;
            const px = this.viewport$.get().panX;
            const py = this.viewport$.get().panY;
            return `background-image:
                        linear-gradient(to right,  var(--arianna-border, #d8d8d8) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--arianna-border, #d8d8d8) 1px, transparent 1px);
                    background-size: ${pz}px ${pz}px;
                    background-position: ${px}px ${py}px`;
        };
        this.worldStyle = () => {
            const v = this.viewport$.get();
            return `transform: translate(${v.panX}px, ${v.panY}px) scale(${v.zoom});
                    transform-origin: 0 0`;
        };

        this.showRulers = showRulers;
        this.zoomLabel = () => `${(this.viewport$.get().zoom * 100).toFixed(0)}%`;

        // ── Handlers ────────────────────────────────────────────────────
        this.onWheel = (e: Event) => {
            const we = e as WheelEvent;
            if (we.ctrlKey || we.metaKey) {
                // Zoom
                we.preventDefault();
                const factor = we.deltaY > 0 ? 0.92 : 1.08;
                const rect = (we.currentTarget as HTMLElement).getBoundingClientRect();
                const px = we.clientX - rect.left;
                const py = we.clientY - rect.top;
                this.zoomAt(this.viewport$.get().zoom * factor, { x: px, y: py });
            } else if (we.shiftKey) {
                we.preventDefault();
                this.panBy(-we.deltaY, 0);
            } else {
                we.preventDefault();
                this.panBy(-we.deltaX, -we.deltaY);
            }
        };

        this.onPointerDown = (e: Event) => {
            const pe = e as PointerEvent;
            const isMiddle = pe.button === 1;
            const isSpace  = this.#spaceDown;
            if (!isMiddle && !isSpace) return;
            pe.preventDefault();
            const stage = pe.currentTarget as HTMLElement;
            stage.setPointerCapture?.(pe.pointerId);
            this.#dragging = true;
            this.#dragLastX = pe.clientX;
            this.#dragLastY = pe.clientY;
        };
        this.onPointerMove = (e: Event) => {
            if (!this.#dragging) return;
            const pe = e as PointerEvent;
            const dx = pe.clientX - this.#dragLastX;
            const dy = pe.clientY - this.#dragLastY;
            this.#dragLastX = pe.clientX;
            this.#dragLastY = pe.clientY;
            this.panBy(dx, dy);
        };
        this.onPointerUp = () => { this.#dragging = false; };

        this.template = html`
            <div class="ar-canvas2d__host" :style="this.hostStyle()">
                <div class="ar-canvas2d__rulers" a-if="this.showRulers()">
                    <div class="ar-canvas2d__ruler ar-canvas2d__ruler--top"></div>
                    <div class="ar-canvas2d__ruler ar-canvas2d__ruler--left"></div>
                </div>
                <div class="ar-canvas2d__stage"
                     :style="this.gridBgStyle()"
                     @wheel="this.onWheel"
                     @pointerdown="this.onPointerDown"
                     @pointermove="this.onPointerMove"
                     @pointerup="this.onPointerUp"
                     @pointercancel="this.onPointerUp">
                    <div class="ar-canvas2d__world" :style="this.worldStyle()"></div>
                </div>
                <div class="ar-canvas2d__statusbar">
                    <span>{{ this.zoomLabel() }}</span>
                </div>
            </div>
        `;

        this.Sheet = Canvas2D.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    panTo(x: number, y: number): this {
        const v = this.viewport$.get();
        this.viewport$.set({ ...v, panX: x, panY: y });
        this.#fireViewport();
        return this;
    }
    panBy(dx: number, dy: number): this {
        const v = this.viewport$.get();
        return this.panTo(v.panX + dx, v.panY + dy);
    }
    zoomTo(z: number): this {
        const mn = parseFloat(this.getAttribute('zoom-min') ?? '0.05') || 0.05;
        const mx = parseFloat(this.getAttribute('zoom-max') ?? '32')   || 32;
        const clamped = Math.max(mn, Math.min(mx, z));
        const v = this.viewport$.get();
        this.viewport$.set({ ...v, zoom: clamped });
        this.#fireViewport();
        return this;
    }
    /** Zoom while keeping the screen point `screenPt` anchored in world space. */
    zoomAt(z: number, screenPt: Vec2): this {
        const mn = parseFloat(this.getAttribute('zoom-min') ?? '0.05') || 0.05;
        const mx = parseFloat(this.getAttribute('zoom-max') ?? '32')   || 32;
        const newZ = Math.max(mn, Math.min(mx, z));
        const cur = this.viewport$.get();
        // World point under screenPt should be preserved
        const wx = (screenPt.x - cur.panX) / cur.zoom;
        const wy = (screenPt.y - cur.panY) / cur.zoom;
        const newPanX = screenPt.x - wx * newZ;
        const newPanY = screenPt.y - wy * newZ;
        this.viewport$.set({ panX: newPanX, panY: newPanY, zoom: newZ });
        this.#fireViewport();
        return this;
    }
    screenToWorld(p: Vec2): Vec2 {
        const v = this.viewport$.get();
        return { x: (p.x - v.panX) / v.zoom, y: (p.y - v.panY) / v.zoom };
    }
    worldToScreen(p: Vec2): Vec2 {
        const v = this.viewport$.get();
        return { x: p.x * v.zoom + v.panX, y: p.y * v.zoom + v.panY };
    }
    fitContent(): this {
        const w = this.world;
        const stage = this.querySelector<HTMLElement>('.ar-canvas2d__stage');
        if (!w || !stage) return this;
        const wRect = w.getBoundingClientRect();
        const sRect = stage.getBoundingClientRect();
        if (wRect.width === 0 || wRect.height === 0) return this;
        const sx = sRect.width  / (wRect.width  / this.viewport$.get().zoom);
        const sy = sRect.height / (wRect.height / this.viewport$.get().zoom);
        const z = Math.min(sx, sy) * 0.9;
        return this.zoomTo(z);
    }

    getViewport(): ViewportState { return { ...this.viewport$.get() }; }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {
        window.addEventListener('keydown', this.#onSpace);
        window.addEventListener('keyup',   this.#onSpaceUp);
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {
        window.removeEventListener('keydown', this.#onSpace);
        window.removeEventListener('keyup',   this.#onSpaceUp);
    }
    onUnmount()       {}

    #fireViewport(): void {
        const v = this.viewport$.get();
        this.dispatchEvent(new CustomEvent('arianna:viewport', {
            bubbles: true, detail: { ...v },
        }));
    }

    #dragging = false;
    #dragLastX = 0;
    #dragLastY = 0;
    #spaceDown = false;

    #onSpace = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !this.#spaceDown) {
            this.#spaceDown = true;
            this.style.cursor = 'grab';
        }
    };
    #onSpaceUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            this.#spaceDown = false;
            this.style.cursor = '';
        }
    };

    private hostStyle    : () => string = () => '';
    private gridBgStyle  : () => string = () => '';
    private worldStyle   : () => string = () => '';
    private showRulers   : () => boolean = () => false;
    private zoomLabel    : () => string = () => '100%';
    private onWheel      : (e: Event) => void = () => {};
    private onPointerDown: (e: Event) => void = () => {};
    private onPointerMove: (e: Event) => void = () => {};
    private onPointerUp  : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'block', position: 'relative' }),
                new Rule('.ar-canvas2d__host', {
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                }),
                new Rule('.ar-canvas2d__stage', {
                    position: 'absolute',
                    inset: '0',
                    overflow: 'hidden',
                    cursor: 'default',
                    touchAction: 'none',
                }),
                new Rule('.ar-canvas2d__world', {
                    position: 'absolute',
                    inset: '0',
                    width: '0',
                    height: '0',
                    transformOrigin: '0 0',
                }),
                new Rule('.ar-canvas2d__rulers', {
                    position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '1',
                }),
                new Rule('.ar-canvas2d__ruler', {
                    position: 'absolute',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderColor: 'var(--arianna-border, #d8d8d8)',
                    borderStyle: 'solid',
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '9px',
                }),
                new Rule('.ar-canvas2d__ruler--top', {
                    top: '0', left: '20px', right: '0', height: '20px',
                    borderBottomWidth: '1px',
                }),
                new Rule('.ar-canvas2d__ruler--left', {
                    top: '20px', bottom: '0', left: '0', width: '20px',
                    borderRightWidth: '1px',
                }),
                new Rule('.ar-canvas2d__statusbar', {
                    position: 'absolute',
                    bottom: '4px',
                    right: '8px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--arianna-muted, #6e6b62)',
                    pointerEvents: 'none',
                    zIndex: '2',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Canvas2D', {
        value: Canvas2D, writable: false, enumerable: false, configurable: false,
    });
}

export default Canvas2D;
