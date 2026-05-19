/**
 * @module    components/graphics/colors/ShapeGradientEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ShapeGradientEditor — Illustrator-style "freeform mesh" gradient. The user
 * places coloured control points anywhere on a 2D canvas; each point has a
 * position (x, y in [0,1] of the canvas) + colour + influence radius.
 *
 * The output is rendered as a canvas painted with a per-pixel inverse-distance
 * weighting blend over the control points. CSS output is omitted (no standard
 * freeform mesh in CSS yet) — consumers use `toCanvasDataURL()` for export.
 *
 * @example HTML
 *   <arianna-shape-gradient-editor width="320" height="240"></arianna-shape-gradient-editor>
 *
 * Events: arianna:change  detail: { points }
 * Attrs:  width, height
 */

import { Component } from '../../../core/Component.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { LinearGradientEditor } from './LinearGradientEditor.ts';
import { type RGBA, colorFieldHex, parseColorString } from './GradientEditor.ts';

export interface ShapeStop {
    /** Normalised position in [0,1]. */
    x      : number;
    y      : number;
    color  : RGBA;
    /** Influence radius in normalised units. Default 0.3. */
    radius?: number;
}

export interface ShapeGradientEditorOptions {
    points? : ShapeStop[];
    width?  : number;
    height? : number;
}

const DEFAULT_POINTS = (): ShapeStop[] => [
    { x: 0.25, y: 0.25, color: { r: 228, g: 12,  b: 136, a: 1 } },
    { x: 0.75, y: 0.25, color: { r: 31,  g: 111, b: 235, a: 1 } },
    { x: 0.50, y: 0.75, color: { r: 38,  g: 166, b: 154, a: 1 } },
];

export class ShapeGradientEditor extends Component('arianna-shape-gradient-editor', HTMLElement, {}, {
    attrs : ['width', 'height'],
})
{
    points$  : Signal<ShapeStop[]> = signal<ShapeStop[]>(DEFAULT_POINTS());
    selected$: Signal<number> = signal<number>(0);

    build(_opts: ShapeGradientEditorOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');

        const w = () => parseInt(wAttr.get() ?? '320', 10) || 320;
        const h = () => parseInt(hAttr.get() ?? '240', 10) || 240;

        this.canvasStyle = () => `width: ${w()}px; height: ${h()}px; position: relative; display: block`;
        this.dimW = () => String(w());
        this.dimH = () => String(h());

        this.pinList = (): Array<{ style: string; idx: number; cls: string; bg: string }> => {
            const sel = this.selected$.get();
            const W = w(), H = h();
            return this.points$.get().map((p, i) => ({
                style: `left: ${p.x * W}px; top: ${p.y * H}px; background: ${colorFieldHex(p.color)}`,
                idx  : i,
                cls  : 'ar-grad__mesh-pt' + (i === sel ? ' ar-grad__mesh-pt--sel' : ''),
                bg   : colorFieldHex(p.color),
            }));
        };

        this.hasSel = () => this.points$.get().length > 0;
        this.selPt = () => this.points$.get()[this.selected$.get()] ?? this.points$.get()[0]!;
        this.selHex = () => colorFieldHex(this.selPt().color);
        this.selX = () => (this.selPt().x * 100).toFixed(1);
        this.selY = () => (this.selPt().y * 100).toFixed(1);
        this.selR = () => (this.selPt().radius ?? 0.3).toFixed(2);
        this.selA = () => (this.selPt().color.a ?? 1).toFixed(2);

        // ── Handlers ────────────────────────────────────────────────────
        this.onCanvasClick = (e: Event) => {
            const me = e as MouseEvent;
            const target = me.target as HTMLElement;
            if (target.classList.contains('ar-grad__mesh-pt')) return;
            const canvas = me.currentTarget as HTMLElement;
            const rect = canvas.getBoundingClientRect();
            const x = (me.clientX - rect.left) / rect.width;
            const y = (me.clientY - rect.top)  / rect.height;
            this.addPoint(x, y, { r: 200, g: 200, b: 200, a: 1 });
        };
        this.onPtPointer = (e: Event) => {
            const me = e as PointerEvent;
            me.stopPropagation();
            const pt = me.currentTarget as HTMLElement;
            const idx = parseInt(pt.dataset.idx ?? '0', 10);
            if (me.type === 'pointerdown') {
                pt.setPointerCapture?.(me.pointerId);
                this.selected$.set(idx);
            } else if (!(me.buttons & 1)) return;
            const canvas = pt.parentElement as HTMLElement;
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (me.clientY - rect.top)  / rect.height));
            this.updatePoint(idx, { x, y });
        };
        this.onPtDblClick = (e: Event) => {
            const me = e as MouseEvent;
            me.stopPropagation();
            const idx = parseInt((me.currentTarget as HTMLElement).dataset.idx ?? '0', 10);
            this.removePoint(idx);
        };

        this.onSelColorChange = (e: Event) => {
            const c = parseColorString((e.target as HTMLInputElement).value);
            if (c) {
                const cur = this.selPt();
                this.updatePoint(this.selected$.get(), { color: { ...c, a: cur.color.a } });
            }
        };
        this.onSelXChange = (e: Event) => {
            const v = parseFloat((e.target as HTMLInputElement).value) / 100;
            this.updatePoint(this.selected$.get(), { x: Math.max(0, Math.min(1, v)) });
        };
        this.onSelYChange = (e: Event) => {
            const v = parseFloat((e.target as HTMLInputElement).value) / 100;
            this.updatePoint(this.selected$.get(), { y: Math.max(0, Math.min(1, v)) });
        };
        this.onSelRChange = (e: Event) => {
            this.updatePoint(this.selected$.get(), {
                radius: Math.max(0.01, Math.min(2, parseFloat((e.target as HTMLInputElement).value))),
            });
        };
        this.onSelAChange = (e: Event) => {
            const cur = this.selPt();
            this.updatePoint(this.selected$.get(), {
                color: { ...cur.color, a: Math.max(0, Math.min(1, parseFloat((e.target as HTMLInputElement).value))) },
            });
        };
        this.onRemove = () => this.removePoint(this.selected$.get());

        this.template = html`
            <div class="ar-grad__row">
                <div class="ar-grad__col">
                    <div class="ar-grad__mesh-canvas-wrap" :style="this.canvasStyle()">
                        <canvas class="ar-grad__mesh-canvas-bg"
                                :width="this.dimW()" :height="this.dimH()"
                                style="position:absolute; inset:0;"
                                @click="this.onCanvasClick"></canvas>
                        <div a-for="p in this.pinList()"
                             :class="p.cls" :style="p.style" :data-idx="p.idx"
                             @pointerdown="this.onPtPointer"
                             @pointermove="this.onPtPointer"
                             @dblclick="this.onPtDblClick"></div>
                    </div>
                </div>
                <div class="ar-grad__inspector" a-if="this.hasSel()">
                    <label class="ar-grad__field">
                        <span>Color</span>
                        <input type="color" :value="this.selHex()" @input="this.onSelColorChange"/>
                        <input type="text"  :value="this.selHex()" @change="this.onSelColorChange"/>
                    </label>
                    <label class="ar-grad__field">
                        <span>X</span>
                        <input type="number" min="0" max="100" step="0.5"
                               :value="this.selX()" @change="this.onSelXChange"/>%
                    </label>
                    <label class="ar-grad__field">
                        <span>Y</span>
                        <input type="number" min="0" max="100" step="0.5"
                               :value="this.selY()" @change="this.onSelYChange"/>%
                    </label>
                    <label class="ar-grad__field">
                        <span>Radius</span>
                        <input type="number" min="0.01" max="2" step="0.05"
                               :value="this.selR()" @change="this.onSelRChange"/>
                    </label>
                    <label class="ar-grad__field">
                        <span>Alpha</span>
                        <input type="number" min="0" max="1" step="0.01"
                               :value="this.selA()" @change="this.onSelAChange"/>
                    </label>
                    <div class="ar-grad__btns">
                        <button type="button" class="ar-grad__btn ar-grad__btn--danger"
                                @click="this.onRemove">Remove point</button>
                    </div>
                </div>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = LinearGradientEditor.SharedSheet();
    }

    /** Paint the freeform mesh into the canvas using inverse-distance weighting. */
    #paint(): void {
        const canvas = this.querySelector<HTMLCanvasElement>('canvas.ar-grad__mesh-canvas-bg');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const W = canvas.width, H = canvas.height;
        const pts = this.points$.get();
        if (!pts.length) { ctx.clearRect(0, 0, W, H); return; }

        const img = ctx.createImageData(W, H);
        // Step factor for perf — paints every other pixel and stretches
        const step = (W * H > 80000) ? 2 : 1;

        for (let py = 0; py < H; py += step) {
            for (let px = 0; px < W; px += step) {
                const nx = px / (W - 1);
                const ny = py / (H - 1);
                let sumR = 0, sumG = 0, sumB = 0, sumA = 0, sumW = 0;
                for (const p of pts) {
                    const radius = p.radius ?? 0.3;
                    const dx = nx - p.x, dy = ny - p.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    // Smooth falloff
                    const w = 1 / (Math.pow(d / radius + 0.01, 2.5));
                    sumR += p.color.r * w;
                    sumG += p.color.g * w;
                    sumB += p.color.b * w;
                    sumA += (p.color.a ?? 1) * w;
                    sumW += w;
                }
                const r = sumR / sumW, g = sumG / sumW, b = sumB / sumW, a = sumA / sumW;
                const i = (py * W + px) * 4;
                img.data[i]   = Math.max(0, Math.min(255, Math.round(r)));
                img.data[i+1] = Math.max(0, Math.min(255, Math.round(g)));
                img.data[i+2] = Math.max(0, Math.min(255, Math.round(b)));
                img.data[i+3] = Math.max(0, Math.min(255, Math.round(a * 255)));
                if (step === 2) {
                    const j = (py * W + (px + 1)) * 4;
                    if (j + 3 < img.data.length) {
                        img.data[j]   = img.data[i]!;
                        img.data[j+1] = img.data[i+1]!;
                        img.data[j+2] = img.data[i+2]!;
                        img.data[j+3] = img.data[i+3]!;
                    }
                    const k = ((py + 1) * W + px) * 4;
                    if (k + 3 < img.data.length) {
                        img.data[k]   = img.data[i]!;
                        img.data[k+1] = img.data[i+1]!;
                        img.data[k+2] = img.data[i+2]!;
                        img.data[k+3] = img.data[i+3]!;
                    }
                }
            }
        }
        ctx.putImageData(img, 0, 0);
    }

    // ── Public API ───────────────────────────────────────────────────────────

    addPoint(x: number, y: number, color: RGBA): ShapeStop {
        const p: ShapeStop = {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y)),
            color: { ...color },
        };
        const cur = this.points$.get().slice();
        cur.push(p);
        this.points$.set(cur);
        this.selected$.set(cur.length - 1);
        this.#fire();
        return p;
    }
    removePoint(idx: number): this {
        const cur = this.points$.get();
        if (cur.length <= 1) return this;
        if (idx < 0 || idx >= cur.length) return this;
        const next = cur.slice();
        next.splice(idx, 1);
        this.points$.set(next);
        if (this.selected$.get() >= next.length) this.selected$.set(next.length - 1);
        this.#fire();
        return this;
    }
    updatePoint(idx: number, patch: Partial<ShapeStop>): this {
        const cur = this.points$.get();
        const p = cur[idx];
        if (!p) return this;
        const next = cur.slice();
        const updated: ShapeStop = {
            x: patch.x ?? p.x,
            y: patch.y ?? p.y,
            color: patch.color ?? p.color,
            radius: patch.radius ?? p.radius,
        };
        next[idx] = updated;
        this.points$.set(next);
        this.#fire();
        return this;
    }

    setPoints(pts: ShapeStop[]): this {
        this.points$.set(pts.map(p => ({ ...p, color: { ...p.color } })));
        if (this.selected$.get() >= this.points$.get().length) this.selected$.set(0);
        this.#fire();
        return this;
    }
    getPoints(): ShapeStop[] {
        return this.points$.get().map(p => ({ ...p, color: { ...p.color } }));
    }

    toCanvasDataURL(type: string = 'image/png'): string {
        const canvas = this.querySelector<HTMLCanvasElement>('canvas.ar-grad__mesh-canvas-bg');
        return canvas?.toDataURL(type) ?? '';
    }

    #fire(): void {
        this.#paint();
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true,
            detail: { points: this.getPoints() },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() { this.#paint(); }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private canvasStyle  : () => string = () => '';
    private dimW         : () => string = () => '320';
    private dimH         : () => string = () => '240';
    private pinList      : () => Array<{ style: string; idx: number; cls: string; bg: string }> = () => [];
    private hasSel       : () => boolean = () => false;
    private selPt        : () => ShapeStop = () => ({ x: 0.5, y: 0.5, color: { r: 0, g: 0, b: 0, a: 1 } });
    private selHex       : () => string = () => '#000000';
    private selX         : () => string = () => '50';
    private selY         : () => string = () => '50';
    private selR         : () => string = () => '0.30';
    private selA         : () => string = () => '1';
    private onCanvasClick: (e: Event) => void = () => {};
    private onPtPointer  : (e: Event) => void = () => {};
    private onPtDblClick : (e: Event) => void = () => {};
    private onSelColorChange: (e: Event) => void = () => {};
    private onSelXChange    : (e: Event) => void = () => {};
    private onSelYChange    : (e: Event) => void = () => {};
    private onSelRChange    : (e: Event) => void = () => {};
    private onSelAChange    : (e: Event) => void = () => {};
    private onRemove        : (e: Event) => void = () => {};
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ShapeGradientEditor', {
        value: ShapeGradientEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default ShapeGradientEditor;
