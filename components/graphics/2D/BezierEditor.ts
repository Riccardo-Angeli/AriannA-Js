/**
 * @module    components/graphics/2D/BezierEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * BezierEditor — interactive cubic Bézier path editor (Illustrator-style).
 * Lets users build, edit, and manipulate paths of anchor points joined by
 * cubic Bézier segments. Each anchor has `hIn` / `hOut` control handles
 * stored relative to the anchor position.
 *
 *   • Pen mode    — click empty space to add an anchor; drag to define hOut
 *   • Edit mode   — drag anchors / handles; alt-drag handle to break symmetry
 *   • Delete mode — click an anchor to remove it
 *
 * Output: SVG `<path>` `d` attribute via `toSVGPath()`.
 *
 * @example HTML
 *   <arianna-bezier-editor width="600" height="400" mode="pen"></arianna-bezier-editor>
 *
 * Events: arianna:change  detail: { anchors, closed, d }
 * Attrs:  width, height, mode (pen|edit|delete), closed
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export interface Vec2 { x: number; y: number; }

export interface Anchor {
    x    : number;
    y    : number;
    hIn  : Vec2;
    hOut : Vec2;
    kind : 'smooth' | 'asym' | 'corner';
}

export type BezierMode = 'pen' | 'edit' | 'delete';

export interface BezierEditorOptions {
    width?   : number;
    height?  : number;
    mode?    : BezierMode;
    anchors? : Anchor[];
    closed?  : boolean;
}

interface BezierState { anchors: Anchor[]; closed: boolean; }

export class BezierEditor extends Component('arianna-bezier-editor', HTMLElement, {}, {
    attrs : ['width', 'height', 'mode', 'closed'],
    shadow: false,
})
{
    state$: Signal<BezierState> = signal<BezierState>({ anchors: [], closed: false });

    build(_opts: BezierEditorOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');

        this.viewBox = () => `0 0 ${this.#w()} ${this.#h()}`;
        this.wStr    = () => String(this.#w());
        this.hStr    = () => String(this.#h());
        this.pathD   = () => this.toSVGPath();

        this.anchorList = (): Array<{ cx: string; cy: string; idx: number; cls: string }> =>
            this.state$.get().anchors.map((a, i) => ({
                cx: String(a.x), cy: String(a.y), idx: i,
                cls: 'ar-bez__anchor',
            }));

        this.handleSegments = (): Array<{ x1: string; y1: string; x2: string; y2: string }> => {
            const out: Array<{ x1: string; y1: string; x2: string; y2: string }> = [];
            for (const a of this.state$.get().anchors) {
                if (a.hIn.x !== 0 || a.hIn.y !== 0) {
                    out.push({
                        x1: String(a.x), y1: String(a.y),
                        x2: String(a.x + a.hIn.x), y2: String(a.y + a.hIn.y),
                    });
                }
                if (a.hOut.x !== 0 || a.hOut.y !== 0) {
                    out.push({
                        x1: String(a.x), y1: String(a.y),
                        x2: String(a.x + a.hOut.x), y2: String(a.y + a.hOut.y),
                    });
                }
            }
            return out;
        };

        this.handleDots = (): Array<{ cx: string; cy: string; idx: number; side: 'in' | 'out' }> => {
            const out: Array<{ cx: string; cy: string; idx: number; side: 'in' | 'out' }> = [];
            this.state$.get().anchors.forEach((a, i) => {
                if (a.hIn.x !== 0 || a.hIn.y !== 0) {
                    out.push({ cx: String(a.x + a.hIn.x), cy: String(a.y + a.hIn.y), idx: i, side: 'in' });
                }
                if (a.hOut.x !== 0 || a.hOut.y !== 0) {
                    out.push({ cx: String(a.x + a.hOut.x), cy: String(a.y + a.hOut.y), idx: i, side: 'out' });
                }
            });
            return out;
        };

        // ── Handlers ────────────────────────────────────────────────────
        this.onSvgPointerDown = (e: Event) => {
            const me = e as PointerEvent;
            const target = me.target as SVGElement;
            // Ignore if clicking on an anchor or handle
            if (target.classList.contains('ar-bez__anchor') || target.classList.contains('ar-bez__handle-dot')) return;
            const svg = me.currentTarget as SVGSVGElement;
            const pt = this.#localPoint(svg, me);
            const mode = (this.getAttribute('mode') ?? 'pen') as BezierMode;
            if (mode === 'pen') {
                // Add new anchor; allow drag to define hOut
                const cur = this.state$.get();
                const anchor: Anchor = { x: pt.x, y: pt.y, hIn: { x: 0, y: 0 }, hOut: { x: 0, y: 0 }, kind: 'corner' };
                // If there's a previous anchor, the new hIn mirrors the previous hOut visually
                this.state$.set({ ...cur, anchors: [...cur.anchors, anchor] });
                this.#fire();

                // Pen drag — set hOut while pointer moves before release
                svg.setPointerCapture?.(me.pointerId);
                this.#penDragIdx = cur.anchors.length;
                this.#penDragOrigin = { x: pt.x, y: pt.y };
            }
        };
        this.onSvgPointerMove = (e: Event) => {
            const me = e as PointerEvent;
            if (this.#penDragIdx == null) return;
            const svg = me.currentTarget as SVGSVGElement;
            const pt = this.#localPoint(svg, me);
            const cur = this.state$.get();
            const a = cur.anchors[this.#penDragIdx];
            if (!a || !this.#penDragOrigin) return;
            const next = cur.anchors.slice();
            const hOut = { x: pt.x - this.#penDragOrigin.x, y: pt.y - this.#penDragOrigin.y };
            const hIn  = { x: -hOut.x, y: -hOut.y };
            next[this.#penDragIdx] = { ...a, hOut, hIn, kind: 'smooth' };
            this.state$.set({ ...cur, anchors: next });
            this.#fire();
        };
        this.onSvgPointerUp = () => {
            this.#penDragIdx = null;
            this.#penDragOrigin = null;
        };

        this.onAnchorPointerDown = (e: Event) => {
            const me = e as PointerEvent;
            me.stopPropagation();
            const target = me.currentTarget as SVGCircleElement;
            const idx = parseInt(target.dataset.idx ?? '0', 10);
            const mode = (this.getAttribute('mode') ?? 'pen') as BezierMode;
            if (mode === 'delete') {
                this.removeAnchor(idx);
                return;
            }
            // Edit: drag anchor
            target.setPointerCapture?.(me.pointerId);
            this.#anchorDragIdx = idx;
        };
        this.onAnchorPointerMove = (e: Event) => {
            if (this.#anchorDragIdx == null) return;
            const me = e as PointerEvent;
            const svg = (me.currentTarget as SVGElement).ownerSVGElement;
            if (!svg) return;
            const pt = this.#localPoint(svg, me);
            const cur = this.state$.get();
            const a = cur.anchors[this.#anchorDragIdx];
            if (!a) return;
            const next = cur.anchors.slice();
            next[this.#anchorDragIdx] = { ...a, x: pt.x, y: pt.y };
            this.state$.set({ ...cur, anchors: next });
            this.#fire();
        };
        this.onAnchorPointerUp = () => { this.#anchorDragIdx = null; };

        this.onHandlePointerDown = (e: Event) => {
            const me = e as PointerEvent;
            me.stopPropagation();
            const target = me.currentTarget as SVGCircleElement;
            target.setPointerCapture?.(me.pointerId);
            this.#handleDragIdx = parseInt(target.dataset.idx ?? '0', 10);
            this.#handleDragSide = (target.dataset.side as 'in' | 'out') ?? 'out';
            this.#handleDragAlt  = me.altKey;
        };
        this.onHandlePointerMove = (e: Event) => {
            if (this.#handleDragIdx == null) return;
            const me = e as PointerEvent;
            const svg = (me.currentTarget as SVGElement).ownerSVGElement;
            if (!svg) return;
            const pt = this.#localPoint(svg, me);
            const cur = this.state$.get();
            const a = cur.anchors[this.#handleDragIdx];
            if (!a) return;
            const next = cur.anchors.slice();
            const delta = { x: pt.x - a.x, y: pt.y - a.y };
            let updated: Anchor;
            if (this.#handleDragSide === 'out') {
                if (this.#handleDragAlt || a.kind === 'corner') {
                    updated = { ...a, hOut: delta, kind: 'corner' };
                } else if (a.kind === 'smooth') {
                    updated = { ...a, hOut: delta, hIn: { x: -delta.x, y: -delta.y } };
                } else {
                    // asym: keep direction mirrored but magnitude independent
                    const mag = Math.hypot(a.hIn.x, a.hIn.y) || Math.hypot(delta.x, delta.y);
                    const dirLen = Math.hypot(delta.x, delta.y) || 1;
                    updated = { ...a, hOut: delta, hIn: { x: -delta.x * mag / dirLen, y: -delta.y * mag / dirLen } };
                }
            } else {
                if (this.#handleDragAlt || a.kind === 'corner') {
                    updated = { ...a, hIn: delta, kind: 'corner' };
                } else if (a.kind === 'smooth') {
                    updated = { ...a, hIn: delta, hOut: { x: -delta.x, y: -delta.y } };
                } else {
                    const mag = Math.hypot(a.hOut.x, a.hOut.y) || Math.hypot(delta.x, delta.y);
                    const dirLen = Math.hypot(delta.x, delta.y) || 1;
                    updated = { ...a, hIn: delta, hOut: { x: -delta.x * mag / dirLen, y: -delta.y * mag / dirLen } };
                }
            }
            next[this.#handleDragIdx] = updated;
            this.state$.set({ ...cur, anchors: next });
            this.#fire();
        };
        this.onHandlePointerUp = () => {
            this.#handleDragIdx = null;
            this.#handleDragSide = null;
            this.#handleDragAlt = false;
        };

        this.template = html`
            <svg :viewBox="this.viewBox()"
                 :width="this.wStr()" :height="this.hStr()"
                 xmlns="http://www.w3.org/2000/svg"
                 class="ar-bez__svg"
                 @pointerdown="this.onSvgPointerDown"
                 @pointermove="this.onSvgPointerMove"
                 @pointerup="this.onSvgPointerUp">
                <path :d="this.pathD()" class="ar-bez__path" fill="none"></path>
                <line a-for="s in this.handleSegments()"
                      :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
                      class="ar-bez__handle-line"></line>
                <circle a-for="h in this.handleDots()"
                        :cx="h.cx" :cy="h.cy" r="4"
                        class="ar-bez__handle-dot"
                        :data-idx="h.idx" :data-side="h.side"
                        @pointerdown="this.onHandlePointerDown"
                        @pointermove="this.onHandlePointerMove"
                        @pointerup="this.onHandlePointerUp"></circle>
                <circle a-for="a in this.anchorList()"
                        :cx="a.cx" :cy="a.cy" r="5"
                        :class="a.cls"
                        :data-idx="a.idx"
                        @pointerdown="this.onAnchorPointerDown"
                        @pointermove="this.onAnchorPointerMove"
                        @pointerup="this.onAnchorPointerUp"></circle>
            </svg>
        `;

        this.Sheet = BezierEditor.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setMode(mode: BezierMode): this { this.setAttribute('mode', mode); return this; }
    getMode(): BezierMode { return (this.getAttribute('mode') as BezierMode) || 'pen'; }

    closePath(): this {
        const cur = this.state$.get();
        this.state$.set({ ...cur, closed: true });
        this.setAttribute('closed', 'true');
        this.#fire();
        return this;
    }
    openPath(): this {
        const cur = this.state$.get();
        this.state$.set({ ...cur, closed: false });
        this.removeAttribute('closed');
        this.#fire();
        return this;
    }

    addAnchor(opts: { x: number; y: number; hIn?: Vec2; hOut?: Vec2; kind?: Anchor['kind'] }): Anchor {
        const a: Anchor = {
            x: opts.x, y: opts.y,
            hIn:  opts.hIn  ?? { x: 0, y: 0 },
            hOut: opts.hOut ?? { x: 0, y: 0 },
            kind: opts.kind ?? 'corner',
        };
        const cur = this.state$.get();
        this.state$.set({ ...cur, anchors: [...cur.anchors, a] });
        this.#fire();
        return a;
    }

    removeAnchor(idx: number): this {
        const cur = this.state$.get();
        if (idx < 0 || idx >= cur.anchors.length) return this;
        const next = cur.anchors.slice();
        next.splice(idx, 1);
        this.state$.set({ ...cur, anchors: next });
        this.#fire();
        return this;
    }

    setAnchors(anchors: Anchor[]): this {
        this.state$.set({ ...this.state$.get(), anchors: anchors.map(a => ({
            x: a.x, y: a.y,
            hIn: { ...a.hIn }, hOut: { ...a.hOut },
            kind: a.kind,
        })) });
        this.#fire();
        return this;
    }

    getAnchors(): Anchor[] {
        return this.state$.get().anchors.map(a => ({
            x: a.x, y: a.y,
            hIn: { ...a.hIn }, hOut: { ...a.hOut },
            kind: a.kind,
        }));
    }

    toSVGPath(): string {
        const cur = this.state$.get();
        const anchors = cur.anchors;
        if (anchors.length === 0) return '';
        const parts: string[] = [];
        parts.push(`M${anchors[0]!.x},${anchors[0]!.y}`);
        for (let i = 1; i < anchors.length; i++) {
            const a = anchors[i - 1]!;
            const b = anchors[i]!;
            const c1x = a.x + a.hOut.x, c1y = a.y + a.hOut.y;
            const c2x = b.x + b.hIn.x,  c2y = b.y + b.hIn.y;
            parts.push(`C${c1x},${c1y} ${c2x},${c2y} ${b.x},${b.y}`);
        }
        if (cur.closed && anchors.length > 1) {
            const last = anchors[anchors.length - 1]!;
            const first = anchors[0]!;
            const c1x = last.x + last.hOut.x, c1y = last.y + last.hOut.y;
            const c2x = first.x + first.hIn.x, c2y = first.y + first.hIn.y;
            parts.push(`C${c1x},${c1y} ${c2x},${c2y} ${first.x},${first.y} Z`);
        }
        return parts.join(' ');
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    #w(): number { return parseInt(this.getAttribute('width')  ?? '600', 10) || 600; }
    #h(): number { return parseInt(this.getAttribute('height') ?? '400', 10) || 400; }

    #localPoint(svg: SVGSVGElement | null, e: PointerEvent): Vec2 {
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        const vbW = this.#w(), vbH = this.#h();
        const x = ((e.clientX - rect.left) / rect.width)  * vbW;
        const y = ((e.clientY - rect.top)  / rect.height) * vbH;
        return { x, y };
    }

    #fire(): void {
        const cur = this.state$.get();
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true,
            detail: { anchors: this.getAnchors(), closed: cur.closed, d: this.toSVGPath() },
        }));
    }

    #penDragIdx: number | null = null;
    #penDragOrigin: Vec2 | null = null;
    #anchorDragIdx: number | null = null;
    #handleDragIdx: number | null = null;
    #handleDragSide: 'in' | 'out' | null = null;
    #handleDragAlt = false;

    private viewBox        : () => string = () => '0 0 600 400';
    private wStr           : () => string = () => '600';
    private hStr           : () => string = () => '400';
    private pathD          : () => string = () => '';
    private anchorList     : () => Array<{ cx: string; cy: string; idx: number; cls: string }> = () => [];
    private handleSegments : () => Array<{ x1: string; y1: string; x2: string; y2: string }> = () => [];
    private handleDots     : () => Array<{ cx: string; cy: string; idx: number; side: 'in' | 'out' }> = () => [];
    private onSvgPointerDown   : (e: Event) => void = () => {};
    private onSvgPointerMove   : (e: Event) => void = () => {};
    private onSvgPointerUp     : (e: Event) => void = () => {};
    private onAnchorPointerDown: (e: Event) => void = () => {};
    private onAnchorPointerMove: (e: Event) => void = () => {};
    private onAnchorPointerUp  : (e: Event) => void = () => {};
    private onHandlePointerDown: (e: Event) => void = () => {};
    private onHandlePointerMove: (e: Event) => void = () => {};
    private onHandlePointerUp  : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display: 'inline-block',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                }),
                new Rule('.ar-bez__svg', { display: 'block', touchAction: 'none', cursor: 'crosshair' }),
                new Rule('.ar-bez__path', {
                    stroke: 'var(--arianna-text, #1f2328)',
                    strokeWidth: '1.5',
                }),
                new Rule('.ar-bez__handle-line', {
                    stroke: 'var(--arianna-muted, #6e6b62)',
                    strokeWidth: '0.5',
                    strokeDasharray: '2,2',
                }),
                new Rule('.ar-bez__handle-dot', {
                    fill: 'var(--arianna-bg, #fff)',
                    stroke: 'var(--arianna-primary, #1f6feb)',
                    strokeWidth: '1.5',
                    cursor: 'grab',
                }),
                new Rule('.ar-bez__anchor', {
                    fill: 'var(--arianna-primary, #1f6feb)',
                    stroke: '#fff',
                    strokeWidth: '2',
                    cursor: 'grab',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'BezierEditor', {
        value: BezierEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default BezierEditor;
