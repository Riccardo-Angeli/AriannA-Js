/**
 * @module    components/modifiers/2D/Rounder
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Border-radius drag control with optional per-corner support.
 *
 * Backward compatible
 * -------------------
 * - `new Rounder(target, { r: 20 })` produces the legacy single-handle
 *   rounder with a uniform border-radius on all four corners.
 * - `new Rounder(target, { topLeft: 0, topRight: 20, bottomRight: 40, bottomLeft: 0 })`
 *   produces four independent corner handles, each with its own current
 *   value.
 * - Setting any of `topLeft / topRight / bottomLeft / bottomRight` switches
 *   the modifier into per-corner mode; otherwise legacy uniform mode is used.
 *
 * Drag direction
 * --------------
 * - Legacy uniform handle: horizontal drag (right = larger).
 * - Per-corner handles: VERTICAL drag (down = larger radius), so the
 *   direction is intuitive at every corner regardless of position.
 */

import { Modifier2D, type ModInput } from './Base.ts';

export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface RounderOptions {
    /** Uniform initial radius (legacy / single-handle mode). */
    r?          : number;
    /** Alias for `r`. */
    radius?     : number;
    /** Maximum radius value (clamps both modes). Default 100. */
    max?        : number;
    /** Handle dot color. */
    handleColor?: string;
    /**
     * Which corners get a handle. Default: all four. Only meaningful
     * in per-corner mode.
     */
    corners?    : Corner[];

    // Per-corner initial values. Setting any of these activates per-corner mode.
    topLeft?    : number;
    topRight?   : number;
    bottomLeft? : number;
    bottomRight?: number;
}

export type RounderCallback =
    (el: HTMLElement, radius: number, corner: Corner | 'all') => void;

interface CornerState {
    topLeft    : number;
    topRight   : number;
    bottomLeft : number;
    bottomRight: number;
}

function _cornerHandleStyle(c: Corner): string {
    const off = '6px';
    switch (c) {
        case 'topLeft':     return `top:${off};left:${off};cursor:nwse-resize;`;
        case 'topRight':    return `top:${off};right:${off};cursor:nesw-resize;`;
        case 'bottomLeft':  return `bottom:${off};left:${off};cursor:nesw-resize;`;
        case 'bottomRight': return `bottom:${off};right:${off};cursor:nwse-resize;`;
    }
}

function _renderRadii(el: HTMLElement, s: CornerState): void {
    // CSS shorthand order: top-left, top-right, bottom-right, bottom-left
    el.style.borderRadius =
        `${s.topLeft}px ${s.topRight}px ${s.bottomRight}px ${s.bottomLeft}px`;
}

export class Rounder extends Modifier2D {
    #optsR          : number;
    #optsMax        : number;
    #optsHandleColor: string;
    #optsCorners    : Corner[];
    #optsInitial    : Partial<CornerState>;
    #perCorner      : boolean;

    #states    : Map<HTMLElement, CornerState> = new Map();
    #callbacks : RounderCallback[] = [];

    constructor(input: ModInput, opts: RounderOptions = {}) {
        super(input);

        const r0 = opts.r ?? opts.radius ?? 0;

        this.#perCorner =
            opts.topLeft     !== undefined ||
            opts.topRight    !== undefined ||
            opts.bottomLeft  !== undefined ||
            opts.bottomRight !== undefined;

        this.#optsR           = r0;
        this.#optsMax         = opts.max         ?? 100;
        this.#optsHandleColor = opts.handleColor ?? '#e40c88';
        this.#optsCorners     = opts.corners     ?? ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
        this.#optsInitial     = {
            topLeft    : opts.topLeft,
            topRight   : opts.topRight,
            bottomLeft : opts.bottomLeft,
            bottomRight: opts.bottomRight,
        };

        // super() called _applyTo before our fields existed; do the wiring now.
        for (const el of this.elements) this._wire(el);
    }

    // ── Public API ────────────────────────────────────────────────────────

    onRound(cb: RounderCallback): this { this.#callbacks.push(cb); return this; }

    /** Set a uniform radius on all corners of the given element. */
    setRadius(el: HTMLElement, r: number): this {
        const s = this.#states.get(el);
        if (!s) return this;
        const v = Math.max(0, Math.min(this.#optsMax, r));
        s.topLeft = s.topRight = s.bottomLeft = s.bottomRight = v;
        _renderRadii(el, s);
        this.#callbacks.forEach(cb => cb(el, v, 'all'));
        return this;
    }

    /** Set the radius of a specific corner of the given element. */
    setCorner(el: HTMLElement, corner: Corner, r: number): this {
        const s = this.#states.get(el);
        if (!s) return this;
        const v = Math.max(0, Math.min(this.#optsMax, r));
        s[corner] = v;
        _renderRadii(el, s);
        this.#callbacks.forEach(cb => cb(el, v, corner));
        return this;
    }

    /** Read current corner state of an element. */
    getCorners(el: HTMLElement): CornerState | null {
        const s = this.#states.get(el);
        if (!s) return null;
        return { ...s };
    }

    // ── Modifier2D template ───────────────────────────────────────────────

    protected _applyTo(_el: HTMLElement): void {
        // Wiring is deferred to the constructor — see _wire() — because
        // Modifier2D's super() invokes _applyTo before our fields are set.
    }

    // ── Internal wiring ───────────────────────────────────────────────────

    private _wire(el: HTMLElement): void {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

        // Initial state: per-corner overrides where set, else uniform r.
        const init: CornerState = {
            topLeft    : this.#optsInitial.topLeft     ?? this.#optsR,
            topRight   : this.#optsInitial.topRight    ?? this.#optsR,
            bottomLeft : this.#optsInitial.bottomLeft  ?? this.#optsR,
            bottomRight: this.#optsInitial.bottomRight ?? this.#optsR,
        };
        this.#states.set(el, init);
        _renderRadii(el, init);

        if (this.#perCorner) {
            for (const c of this.#optsCorners) this._addCornerHandle(el, c);
        } else {
            this._addUniformHandle(el);
        }
    }

    private _addUniformHandle(el: HTMLElement): void {
        const h = document.createElement('div');
        h.style.cssText =
            `position:absolute;top:6px;left:6px;width:10px;height:10px;` +
            `background:${this.#optsHandleColor};border-radius:50%;` +
            `cursor:ew-resize;z-index:9999;touch-action:none;`;
        h.title = 'Drag to round all corners';
        el.appendChild(h);

        let pointerId = -1;
        let startX = 0;
        let startR = 0;

        const onDown = (e: PointerEvent) => {
            if (!this.enabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            pointerId = e.pointerId;
            startX = e.clientX;
            const s = this.#states.get(el)!;
            startR = s.topLeft; // uniform mode -> all 4 are equal
            try { h.setPointerCapture(pointerId); } catch {}
            h.addEventListener('pointermove',   onMove);
            h.addEventListener('pointerup',     onUp);
            h.addEventListener('pointercancel', onUp);
        };

        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            const newR = Math.max(0, Math.min(this.#optsMax, startR + (ev.clientX - startX) / 2));
            const s = this.#states.get(el)!;
            s.topLeft = s.topRight = s.bottomLeft = s.bottomRight = newR;
            _renderRadii(el, s);
            this.#callbacks.forEach(cb => cb(el, newR, 'all'));
        };

        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            try { h.releasePointerCapture(pointerId); } catch {}
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

    private _addCornerHandle(el: HTMLElement, corner: Corner): void {
        const h = document.createElement('div');
        h.dataset['rounderCorner'] = corner;
        h.style.cssText =
            `position:absolute;width:10px;height:10px;` +
            `background:${this.#optsHandleColor};border-radius:50%;` +
            `z-index:9999;touch-action:none;` +
            _cornerHandleStyle(corner);
        h.title = `Drag vertically to round ${corner}`;
        el.appendChild(h);

        let pointerId = -1;
        let startY = 0;
        let startR = 0;

        const onDown = (e: PointerEvent) => {
            if (!this.enabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            pointerId = e.pointerId;
            startY = e.clientY;
            const s = this.#states.get(el)!;
            startR = s[corner];
            try { h.setPointerCapture(pointerId); } catch {}
            h.addEventListener('pointermove',   onMove);
            h.addEventListener('pointerup',     onUp);
            h.addEventListener('pointercancel', onUp);
        };

        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            // vertical drag: down = larger radius
            const newR = Math.max(0, Math.min(this.#optsMax, startR + (ev.clientY - startY) / 2));
            const s = this.#states.get(el)!;
            s[corner] = newR;
            _renderRadii(el, s);
            this.#callbacks.forEach(cb => cb(el, newR, corner));
        };

        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId) return;
            try { h.releasePointerCapture(pointerId); } catch {}
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
}

export default Rounder;
