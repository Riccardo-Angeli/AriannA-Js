/**
 * @module    components/graphics/colors/RadialGradientEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * RadialGradientEditor — radial gradient with shape (circle | ellipse),
 * size hint (closest/farthest side|corner), centre (cx%, cy%), and stops
 * shared from `GradientEditor`.
 *
 * @example HTML
 *   <arianna-radial-gradient-editor shape="ellipse" cx="60" cy="40"></arianna-radial-gradient-editor>
 *
 * Events: arianna:change  detail: { stops, shape, size, cx, cy, css }
 * Attrs:  shape, size, cx, cy, interp
 */

import { Component } from '../../../core/Component.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { html }      from '../../../core/Template.ts';
import { LinearGradientEditor } from './LinearGradientEditor.ts';
import {
    type GradientStop,
    makeStopState, stopsToCss, clamp01,
    colorFieldHex, parseColorString,
} from './GradientEditor.ts';

export type RadialShape = 'circle' | 'ellipse';
export type RadialSize  = 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner';

export interface RadialGradientEditorOptions {
    stops? : GradientStop[];
    shape? : RadialShape;
    size?  : RadialSize;
    cx?    : number;
    cy?    : number;
    interp?: 'srgb' | 'oklab' | 'oklch' | 'hsl';
}

export class RadialGradientEditor extends Component('arianna-radial-gradient-editor', HTMLElement, {}, {
    attrs : ['shape', 'size', 'cx', 'cy', 'interp'],
})
{
    state = makeStopState();

    build(_opts: RadialGradientEditorOptions = {})
    {
        const shapeAttr = this.attrSignal('shape');
        const sizeAttr  = this.attrSignal('size');
        const cxAttr    = this.attrSignal('cx');
        const cyAttr    = this.attrSignal('cy');
        const interpAttr = this.attrSignal('interp');

        const shape  = (): RadialShape => (shapeAttr.get() as RadialShape | null) ?? 'circle';
        const size   = (): RadialSize  => (sizeAttr.get()  as RadialSize  | null) ?? 'farthest-corner';
        const cx     = () => parseFloat(cxAttr.get() ?? '50') || 0;
        const cy     = () => parseFloat(cyAttr.get() ?? '50') || 0;
        const interp = (): 'srgb' | 'oklab' | 'oklch' | 'hsl' =>
            (interpAttr.get() as 'srgb' | 'oklab' | 'oklch' | 'hsl' | null) ?? 'srgb';

        this.stripBg   = () => `background: linear-gradient(to right, ${stopsToCss(this.state.stops$.get())})`;
        this.previewBg = () => `background: ${this.toCSS()}`;

        this.shapeIs = (v: string) => shape() === v;
        this.sizeIs  = (v: string) => size()  === v;
        this.interpIs = (v: string) => interp() === v;

        this.cxVal = () => String(cx());
        this.cyVal = () => String(cy());
        this.centerDotStyle = () => `left: ${cx()}%; top: ${cy()}%`;

        this.pins = () => {
            const sel = this.state.selected$.get();
            return this.state.stops$.get().map((s, i) => ({
                left: `left: ${s.t * 100}%; background: ${colorFieldHex(s.color)}`,
                cls : 'ar-grad__pin' + (i === sel ? ' ar-grad__pin--sel' : ''),
                title: `${colorFieldHex(s.color)} @ ${(s.t * 100).toFixed(1)}%`,
                idx : i,
            }));
        };

        this.hasSel = () => this.state.stops$.get().length > 0;
        this.selStop = () => this.state.stops$.get()[this.state.selected$.get()] ?? this.state.stops$.get()[0]!;
        this.selHex = () => colorFieldHex(this.selStop().color);
        this.selT   = () => (this.selStop().t * 100).toFixed(1);
        this.selA   = () => (this.selStop().color.a ?? 1).toFixed(2);

        // ── Handlers ────────────────────────────────────────────────────
        this.onStripClick = (e: Event) => {
            const me = e as MouseEvent;
            const target = me.target as HTMLElement;
            if (target.classList.contains('ar-grad__pin')) return;
            const strip = me.currentTarget as HTMLElement;
            const rect = strip.getBoundingClientRect();
            this.state.addStop((me.clientX - rect.left) / rect.width);
            this.#fire();
        };
        this.onPinPointer = (e: Event) => {
            const me = e as PointerEvent;
            me.stopPropagation();
            const pin = me.currentTarget as HTMLElement;
            const idx = parseInt(pin.dataset.idx ?? '0', 10);
            if (me.type === 'pointerdown') {
                pin.setPointerCapture?.(me.pointerId);
                this.state.selected$.set(idx);
            } else if (!(me.buttons & 1)) return;
            const strip = pin.parentElement?.previousElementSibling as HTMLElement | null;
            if (!strip) return;
            const rect = strip.getBoundingClientRect();
            this.state.updateStop(idx, { t: clamp01((me.clientX - rect.left) / rect.width) });
            this.#fire();
        };
        this.onPinDblClick = (e: Event) => {
            const me = e as MouseEvent;
            me.stopPropagation();
            const idx = parseInt((me.currentTarget as HTMLElement).dataset.idx ?? '0', 10);
            this.state.removeStop(idx);
            this.#fire();
        };

        this.onShapeChange = (e: Event) => this.setShape((e.target as HTMLSelectElement).value as RadialShape);
        this.onSizeChange  = (e: Event) => this.setSize((e.target as HTMLSelectElement).value as RadialSize);
        this.onInterpChange = (e: Event) =>
            this.setInterp((e.target as HTMLSelectElement).value as 'srgb' | 'oklab' | 'oklch' | 'hsl');
        this.onCxChange = (e: Event) => this.setCenter(parseFloat((e.target as HTMLInputElement).value) || 0, cy());
        this.onCyChange = (e: Event) => this.setCenter(cx(), parseFloat((e.target as HTMLInputElement).value) || 0);

        this.onCenterPad = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
            const nx = Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100));
            const ny = Math.max(0, Math.min(100, ((me.clientY - rect.top)  / rect.height) * 100));
            this.setCenter(nx, ny);
        };

        this.onSelColorChange = (e: Event) => {
            const v = (e.target as HTMLInputElement).value;
            const c = parseColorString(v);
            if (c) {
                const cur = this.selStop();
                this.state.updateStop(this.state.selected$.get(), { color: { ...c, a: cur.color.a } });
                this.#fire();
            }
        };
        this.onSelPosChange = (e: Event) => {
            this.state.updateStop(this.state.selected$.get(), {
                t: clamp01(parseFloat((e.target as HTMLInputElement).value) / 100),
            });
            this.#fire();
        };
        this.onSelAlphaChange = (e: Event) => {
            const cur = this.selStop();
            this.state.updateStop(this.state.selected$.get(), {
                color: { ...cur.color, a: Math.max(0, Math.min(1, parseFloat((e.target as HTMLInputElement).value))) },
            });
            this.#fire();
        };
        this.onRemove = () => {
            this.state.removeStop(this.state.selected$.get());
            this.#fire();
        };

        this.template = html`
            <div class="ar-grad__row">
                <div class="ar-grad__col">
                    <div class="ar-grad__strip" :style="this.stripBg()" @click="this.onStripClick"></div>
                    <div class="ar-grad__pins">
                        <div a-for="p in this.pins()"
                             :class="p.cls" :style="p.left" :data-idx="p.idx" :title="p.title"
                             @pointerdown="this.onPinPointer"
                             @pointermove="this.onPinPointer"
                             @dblclick="this.onPinDblClick"></div>
                    </div>
                    <div class="ar-grad__field" style="margin-top:10px">
                        <span>Shape</span>
                        <select @change="this.onShapeChange">
                            <option value="circle"  :selected="this.shapeIs('circle')">Circle</option>
                            <option value="ellipse" :selected="this.shapeIs('ellipse')">Ellipse</option>
                        </select>
                        <span style="margin-left:10px">Size</span>
                        <select @change="this.onSizeChange">
                            <option value="closest-side"    :selected="this.sizeIs('closest-side')">Closest side</option>
                            <option value="farthest-side"   :selected="this.sizeIs('farthest-side')">Farthest side</option>
                            <option value="closest-corner"  :selected="this.sizeIs('closest-corner')">Closest corner</option>
                            <option value="farthest-corner" :selected="this.sizeIs('farthest-corner')">Farthest corner</option>
                        </select>
                    </div>
                    <div class="ar-grad__field">
                        <span>Center</span>
                        <input type="number" min="0" max="100" step="1"
                               :value="this.cxVal()" @change="this.onCxChange"/>%
                        <input type="number" min="0" max="100" step="1"
                               :value="this.cyVal()" @change="this.onCyChange"/>%
                    </div>
                    <div class="ar-grad__field">
                        <span>Space</span>
                        <select @change="this.onInterpChange">
                            <option value="srgb"  :selected="this.interpIs('srgb')">sRGB</option>
                            <option value="oklab" :selected="this.interpIs('oklab')">OKLab</option>
                            <option value="oklch" :selected="this.interpIs('oklch')">OKLCH</option>
                            <option value="hsl"   :selected="this.interpIs('hsl')">HSL</option>
                        </select>
                    </div>
                    <div class="ar-grad__center-pad"
                         :style="this.previewBg()"
                         @pointerdown="this.onCenterPad"
                         @pointermove="this.onCenterPad">
                        <div class="ar-grad__center-dot" :style="this.centerDotStyle()"></div>
                    </div>
                </div>
                <div class="ar-grad__inspector" a-if="this.hasSel()">
                    <label class="ar-grad__field">
                        <span>Color</span>
                        <input type="color" :value="this.selHex()" @input="this.onSelColorChange"/>
                        <input type="text"  :value="this.selHex()" @change="this.onSelColorChange"/>
                    </label>
                    <label class="ar-grad__field">
                        <span>Position</span>
                        <input type="number" min="0" max="100" step="0.1"
                               :value="this.selT()" @change="this.onSelPosChange"/>%
                    </label>
                    <label class="ar-grad__field">
                        <span>Alpha</span>
                        <input type="number" min="0" max="1" step="0.01"
                               :value="this.selA()" @change="this.onSelAlphaChange"/>
                    </label>
                    <div class="ar-grad__btns">
                        <button type="button" class="ar-grad__btn ar-grad__btn--danger"
                                @click="this.onRemove">Remove stop</button>
                    </div>
                </div>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = LinearGradientEditor.SharedSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setShape(v: RadialShape): this { this.setAttribute('shape', v); this.#fire(); return this; }
    setSize(v: RadialSize): this   { this.setAttribute('size',  v); this.#fire(); return this; }
    setCenter(cx: number, cy: number): this {
        this.setAttribute('cx', String(Math.max(0, Math.min(100, cx))));
        this.setAttribute('cy', String(Math.max(0, Math.min(100, cy))));
        this.#fire();
        return this;
    }
    setInterp(s: 'srgb' | 'oklab' | 'oklch' | 'hsl'): this {
        this.setAttribute('interp', s); this.#fire(); return this;
    }

    getShape() : RadialShape { return (this.getAttribute('shape') as RadialShape) || 'circle'; }
    getSize()  : RadialSize  { return (this.getAttribute('size')  as RadialSize)  || 'farthest-corner'; }
    getCenter(): { cx: number; cy: number } {
        return {
            cx: parseFloat(this.getAttribute('cx') ?? '50') || 0,
            cy: parseFloat(this.getAttribute('cy') ?? '50') || 0,
        };
    }
    getInterp(): 'srgb' | 'oklab' | 'oklch' | 'hsl' {
        return (this.getAttribute('interp') as 'srgb' | 'oklab' | 'oklch' | 'hsl') || 'srgb';
    }

    setStops(s: GradientStop[]): this { this.state.setStops(s); this.#fire(); return this; }
    getStops(): GradientStop[] { return this.state.stops$.get().map(x => ({ ...x, color: { ...x.color } })); }

    toCSS(): string {
        const stops  = stopsToCss(this.state.stops$.get());
        const interp = this.getInterp();
        const space  = interp === 'srgb' ? '' : ` in ${interp}`;
        const c      = this.getCenter();
        return `radial-gradient(${this.getShape()} ${this.getSize()} at ${c.cx}% ${c.cy}%${space}, ${stops})`;
    }

    #fire(): void {
        const c = this.getCenter();
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true,
            detail: {
                stops : this.getStops(),
                shape : this.getShape(),
                size  : this.getSize(),
                cx: c.cx, cy: c.cy,
                interp: this.getInterp(),
                css   : this.toCSS(),
            },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // Template helpers (filled in build)
    private stripBg     : () => string = () => '';
    private previewBg   : () => string = () => '';
    private shapeIs     : (v: string) => boolean = () => false;
    private sizeIs      : (v: string) => boolean = () => false;
    private interpIs    : (v: string) => boolean = () => false;
    private cxVal       : () => string = () => '50';
    private cyVal       : () => string = () => '50';
    private centerDotStyle: () => string = () => '';
    private pins        : () => Array<{ left: string; cls: string; title: string; idx: number }> = () => [];
    private hasSel      : () => boolean = () => false;
    private selStop     : () => GradientStop = () => ({ t: 0, color: { r: 0, g: 0, b: 0, a: 1 } });
    private selHex      : () => string = () => '#000000';
    private selT        : () => string = () => '0';
    private selA        : () => string = () => '1';
    private onStripClick: (e: Event) => void = () => {};
    private onPinPointer: (e: Event) => void = () => {};
    private onPinDblClick: (e: Event) => void = () => {};
    private onShapeChange: (e: Event) => void = () => {};
    private onSizeChange : (e: Event) => void = () => {};
    private onInterpChange: (e: Event) => void = () => {};
    private onCxChange   : (e: Event) => void = () => {};
    private onCyChange   : (e: Event) => void = () => {};
    private onCenterPad  : (e: Event) => void = () => {};
    private onSelColorChange: (e: Event) => void = () => {};
    private onSelPosChange  : (e: Event) => void = () => {};
    private onSelAlphaChange: (e: Event) => void = () => {};
    private onRemove        : (e: Event) => void = () => {};
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'RadialGradientEditor', {
        value: RadialGradientEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default RadialGradientEditor;
