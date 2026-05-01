/**
 * @module    components/modifiers/2D/Mover
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Drag-to-move modifier for any HTML element.
 *
 * Features
 * --------
 *  - Axis lock (x | y | both)
 *  - Independent horizontal / vertical grid snap (snapX, snapY)
 *  - Discrete point snap with threshold
 *  - Bounds: 'parent' | 'viewport' | HTMLElement | DOMRect | custom
 *  - Drag-handle selector
 *  - Threshold (anti-click)
 *  - Pointer events (mouse + touch + pen)
 *  - Z-index lift during drag, restored on drop
 *  - Public mass / damping / stiffness fields, ready for the future physics
 *    engine. _physicsTick(dt) is a no-op placeholder so the API is stable
 *    from v1.1.0 onward; when the engine arrives, the integration point is
 *    already here.
 */

import { Modifier2D, type ModInput } from './Base.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Axis = 'x' | 'y' | 'both';

export type SnapValue = number | null | undefined;

export interface SnapPoints {
    points: { x: number; y: number }[];
    threshold?: number; // px, default 8
}

export interface MoverBounds {
    left?  : number;
    top?   : number;
    right? : number;
    bottom?: number;
}

export type BoundsInput =
    | 'parent'
    | 'viewport'
    | HTMLElement
    | DOMRect
    | MoverBounds
    | null;

export interface MoverOptions {
    axis?         : Axis;
    handle?       : string;
    bounds?       : BoundsInput;
    snapX?        : SnapValue;
    snapY?        : SnapValue;
    snapPoints?   : SnapPoints | null;
    dragCursor?   : string;
    threshold?    : number;
    activeZIndex? : number | null;
    mass?         : number;
    damping?      : number;
    stiffness?    : number;
    disableSelect?: boolean;
}

export type MoverCallback =
    (el: HTMLElement, x: number, y: number, ev: PointerEvent) => void;

// ── Helpers ───────────────────────────────────────────────────────────────────

function _parseTransform(el: HTMLElement): { x: number; y: number } {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return { x: 0, y: 0 };
    const m = t.match(/matrix.*\(([^)]+)\)/);
    if (!m) return { x: 0, y: 0 };
    const parts = m[1].split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 6)  return { x: parts[4]  || 0, y: parts[5]  || 0 };
    if (parts.length === 16) return { x: parts[12] || 0, y: parts[13] || 0 };
    return { x: 0, y: 0 };
}

function _applyTransform(el: HTMLElement, x: number, y: number): void {
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function _resolveBounds(target: HTMLElement, bounds: BoundsInput): MoverBounds | null {
    if (bounds === null || bounds === undefined) return null;

    const tr = target.getBoundingClientRect();

    if (bounds === 'parent') {
        const parent = target.parentElement;
        if (!parent) return null;
        const r = parent.getBoundingClientRect();
        return {
            left:   r.left   - tr.left,
            top:    r.top    - tr.top,
            right:  r.right  - tr.right,
            bottom: r.bottom - tr.bottom,
        };
    }

    if (bounds === 'viewport') {
        return {
            left:   -tr.left,
            top:    -tr.top,
            right:  window.innerWidth  - tr.right,
            bottom: window.innerHeight - tr.bottom,
        };
    }

    if (bounds instanceof HTMLElement) {
        const r = bounds.getBoundingClientRect();
        return {
            left:   r.left   - tr.left,
            top:    r.top    - tr.top,
            right:  r.right  - tr.right,
            bottom: r.bottom - tr.bottom,
        };
    }

    if (typeof DOMRect !== 'undefined' && bounds instanceof DOMRect) {
        return {
            left:   bounds.left   - tr.left,
            top:    bounds.top    - tr.top,
            right:  bounds.right  - tr.right,
            bottom: bounds.bottom - tr.bottom,
        };
    }

    const b = bounds as MoverBounds;
    return {
        left:   b.left   ?? -Infinity,
        top:    b.top    ?? -Infinity,
        right:  b.right  ??  Infinity,
        bottom: b.bottom ??  Infinity,
    };
}

function _clampToBounds(
    x: number, y: number,
    originX: number, originY: number,
    bounds: MoverBounds | null,
): { x: number; y: number } {
    if (!bounds) return { x, y };
    let cx = x, cy = y;
    const dx = x - originX;
    const dy = y - originY;
    if (bounds.left   !== undefined && bounds.left   !== -Infinity && dx < bounds.left)   cx = originX + bounds.left;
    if (bounds.right  !== undefined && bounds.right  !==  Infinity && dx > bounds.right)  cx = originX + bounds.right;
    if (bounds.top    !== undefined && bounds.top    !== -Infinity && dy < bounds.top)    cy = originY + bounds.top;
    if (bounds.bottom !== undefined && bounds.bottom !==  Infinity && dy > bounds.bottom) cy = originY + bounds.bottom;
    return { x: cx, y: cy };
}

function _applySnap(
    x: number, y: number,
    snapX: SnapValue, snapY: SnapValue,
    points: SnapPoints | null | undefined,
): { x: number; y: number; snapped: boolean } {
    if (points && points.points && points.points.length) {
        const threshold = points.threshold ?? 8;
        let best: { x: number; y: number } | null = null;
        let bestD = Infinity;
        for (const p of points.points) {
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < bestD) { bestD = d; best = p; }
        }
        if (best && bestD <= threshold) {
            return { x: best.x, y: best.y, snapped: true };
        }
    }
    let snapped = false;
    if (snapX != null && snapX > 0) { x = Math.round(x / snapX) * snapX; snapped = true; }
    if (snapY != null && snapY > 0) { y = Math.round(y / snapY) * snapY; snapped = true; }
    return { x, y, snapped };
}

// ── Mover class ───────────────────────────────────────────────────────────────

export class Mover extends Modifier2D {
    public axis         : Axis;
    public handle       : string | null;
    public bounds       : BoundsInput;
    public snapX        : SnapValue;
    public snapY        : SnapValue;
    public snapPoints   : SnapPoints | null | undefined;
    public dragCursor   : string;
    public threshold    : number;
    public activeZIndex : number | null;
    public disableSelect: boolean;

    // Physics-ready properties (placeholders for the upcoming engine)
    public mass     : number;
    public damping  : number;
    public stiffness: number;

    #startCallbacks: MoverCallback[] = [];
    #moveCallbacks : MoverCallback[] = [];
    #endCallbacks  : MoverCallback[] = [];
    #snapCallbacks : ((el: HTMLElement, x: number, y: number) => void)[] = [];

    #states = new WeakMap<HTMLElement, {
        pointerId  : number;
        startX     : number;
        startY     : number;
        originX    : number;
        originY    : number;
        currentX   : number;
        currentY   : number;
        velocityX  : number;
        velocityY  : number;
        lastTime   : number;
        started    : boolean;
        prevZIndex : string;
        prevSelect : string;
        handleEl   : HTMLElement;
        onMove     : (e: PointerEvent) => void;
        onUp       : (e: PointerEvent) => void;
    }>();

    constructor(input: ModInput, opts: MoverOptions = {}) {
        super(input);

        this.axis          = opts.axis          ?? 'both';
        this.handle        = opts.handle        ?? null;
        this.bounds        = opts.bounds        ?? 'parent';
        this.snapX         = opts.snapX         ?? null;
        this.snapY         = opts.snapY         ?? null;
        this.snapPoints    = opts.snapPoints    ?? null;
        this.dragCursor    = opts.dragCursor    ?? 'grabbing';
        this.threshold     = opts.threshold     ?? 3;
        this.activeZIndex  = opts.activeZIndex  ?? 9999;
        this.disableSelect = opts.disableSelect ?? true;
        this.mass          = opts.mass          ?? 1;
        this.damping       = opts.damping       ?? 0.92;
        this.stiffness     = opts.stiffness     ?? 0.15;

        // Wire all elements (super() already collected them but
        // _applyTo couldn't run options-dependent logic before fields were set).
        for (const el of this.elements) this._wire(el);
    }

    // ── Public API ────────────────────────────────────────────────────────

    onStart(cb: MoverCallback): this { this.#startCallbacks.push(cb); return this; }
    onMove (cb: MoverCallback): this { this.#moveCallbacks.push(cb);  return this; }
    onEnd  (cb: MoverCallback): this { this.#endCallbacks.push(cb);   return this; }
    onSnap (cb: (el: HTMLElement, x: number, y: number) => void): this {
        this.#snapCallbacks.push(cb); return this;
    }

    /** Programmatically set the position (no animation). */
    setPosition(x: number, y: number): this {
        for (const el of this.elements) _applyTransform(el, x, y);
        return this;
    }

    /**
     * Hook for the upcoming physics engine. Currently a no-op so the API
     * is stable from v1.1.0; when the engine arrives, this method will
     * integrate velocity, apply spring-back to last snap point, etc.
     */
    _physicsTick(_dt: number): void { /* placeholder */ }

    // ── Modifier2D template ───────────────────────────────────────────────

    protected _applyTo(_el: HTMLElement): void {
        // Wiring is deferred: see constructor. Modifier2D's super() runs this
        // before the subclass options are assigned, so the real work happens
        // in _wire(), called explicitly from the constructor.
    }

    // ── Internal wiring ───────────────────────────────────────────────────

    private _wire(target: HTMLElement): void {
        const handleEl = this.handle
            ? (target.querySelector<HTMLElement>(this.handle) ?? target)
            : target;

        if (!handleEl.style.touchAction) handleEl.style.touchAction = 'none';
        if (!handleEl.style.cursor)      handleEl.style.cursor      = 'grab';

        const onDown = (e: PointerEvent) => this._onDown(target, handleEl, e);
        handleEl.addEventListener('pointerdown', onDown);

        this.cleanups.push(() => {
            handleEl.removeEventListener('pointerdown', onDown);
            const s = this.#states.get(target);
            if (s) {
                handleEl.removeEventListener('pointermove',   s.onMove);
                handleEl.removeEventListener('pointerup',     s.onUp);
                handleEl.removeEventListener('pointercancel', s.onUp);
                this.#states.delete(target);
            }
        });
    }

    private _onDown(target: HTMLElement, handleEl: HTMLElement, ev: PointerEvent): void {
        if (!this.enabled) return;
        if (ev.button !== 0) return;

        const origin = _parseTransform(target);
        const onMove = (e: PointerEvent) => this._onMove(target, e);
        const onUp   = (e: PointerEvent) => this._onUp(target, handleEl, e);

        this.#states.set(target, {
            pointerId : ev.pointerId,
            startX    : ev.clientX,
            startY    : ev.clientY,
            originX   : origin.x,
            originY   : origin.y,
            currentX  : origin.x,
            currentY  : origin.y,
            velocityX : 0,
            velocityY : 0,
            lastTime  : performance.now(),
            started   : false,
            prevZIndex: target.style.zIndex,
            prevSelect: document.body.style.userSelect,
            handleEl, onMove, onUp,
        });

        try { handleEl.setPointerCapture(ev.pointerId); } catch {}
        handleEl.addEventListener('pointermove',   onMove);
        handleEl.addEventListener('pointerup',     onUp);
        handleEl.addEventListener('pointercancel', onUp);
    }

    private _onMove(target: HTMLElement, ev: PointerEvent): void {
        const s = this.#states.get(target);
        if (!s || s.pointerId !== ev.pointerId) return;

        const dx = ev.clientX - s.startX;
        const dy = ev.clientY - s.startY;

        if (!s.started) {
            if (Math.hypot(dx, dy) < this.threshold) return;
            s.started = true;

            if (this.activeZIndex !== null) target.style.zIndex = String(this.activeZIndex);
            if (this.disableSelect) document.body.style.userSelect = 'none';
            target.style.cursor = this.dragCursor;

            this.#startCallbacks.forEach(cb => cb(target, s.originX, s.originY, ev));
        }

        let nx = s.originX + dx;
        let ny = s.originY + dy;

        if (this.axis === 'x') ny = s.originY;
        if (this.axis === 'y') nx = s.originX;

        const bounds = _resolveBounds(target, this.bounds);
        ({ x: nx, y: ny } = _clampToBounds(nx, ny, s.originX, s.originY, bounds));

        const snap = _applySnap(nx, ny, this.snapX, this.snapY, this.snapPoints);
        if (snap.snapped) this.#snapCallbacks.forEach(cb => cb(target, snap.x, snap.y));
        nx = snap.x; ny = snap.y;

        const now = performance.now();
        const dt  = Math.max(now - s.lastTime, 1);
        s.velocityX = (nx - s.currentX) / dt * 1000;
        s.velocityY = (ny - s.currentY) / dt * 1000;
        s.lastTime  = now;
        s.currentX  = nx;
        s.currentY  = ny;

        _applyTransform(target, nx, ny);

        this.#moveCallbacks.forEach(cb => cb(target, nx, ny, ev));
    }

    private _onUp(target: HTMLElement, handleEl: HTMLElement, ev: PointerEvent): void {
        const s = this.#states.get(target);
        if (!s || s.pointerId !== ev.pointerId) return;

        handleEl.removeEventListener('pointermove',   s.onMove);
        handleEl.removeEventListener('pointerup',     s.onUp);
        handleEl.removeEventListener('pointercancel', s.onUp);
        try { handleEl.releasePointerCapture(ev.pointerId); } catch {}

        if (s.started) {
            target.style.zIndex = s.prevZIndex;
            if (this.disableSelect) document.body.style.userSelect = s.prevSelect;
            target.style.cursor = '';
            this.#endCallbacks.forEach(cb => cb(target, s.currentX, s.currentY, ev));
        }

        this.#states.delete(target);
    }
}

export default Mover;
