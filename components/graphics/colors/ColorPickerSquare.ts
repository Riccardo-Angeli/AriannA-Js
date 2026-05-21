/**
 * @module    components/graphics/colors/ColorPickerSquare
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ColorPickerSquare — Photoshop-style picker: SV square + vertical hue
 * strip + optional alpha strip + full numeric readouts (HEX / RGB / HSL /
 * HSV / CMYK / OKLCH / CIELUV / Cube).
 *
 * Renders the SV gradient and hue strip on `<canvas>` elements for crisp
 * scaling. Pin positions and readout values reflow reactively when
 * `state$` changes.
 *
 * @example HTML
 *   <arianna-color-picker-square color="#e40c88" alpha size="220"></arianna-color-picker-square>
 *
 * Events: arianna:change  detail: Color
 * Attrs:  color, alpha, size
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { Rule }      from '../../../core/Rule.ts';
import { parseHex, rgbToHex, rgbToHsl, hslToRgb } from './ColorPicker.ts';

export interface ColorPickerSquareOptions {
    color? : string;
    alpha? : boolean;
    size?  : number;
}

interface HSVState { h: number; s: number; v: number; a: number; }

// ── Local HSV helpers ───────────────────────────────────────────────────────

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    if (d !== 0) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2;               break;
            case b: h = (r - g) / d + 4;               break;
        }
        h *= 60;
    }
    return { h, s: s * 100, v: max * 100 };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

export class ColorPickerSquare extends Component('arianna-color-picker-square', HTMLElement, {}, {
    attrs : ['color', 'alpha', 'size'],
})
{
    state$: Signal<HSVState> = signal<HSVState>({ h: 325, s: 90, v: 90, a: 1 });

    build(_opts: ColorPickerSquareOptions = {})
    {
        const sizeAttr = this.attrSignal('size');

        this.dim = () => parseInt(sizeAttr.get() ?? '220', 10) || 220;
        this.dimStyle = () => `width:${this.dim()}px; height:${this.dim()}px`;
        this.hueDimStyle = () => `height:${this.dim()}px`;
        this.showAlpha = () => this.hasAttribute('alpha');

        this.svPinStyle = () => {
            const s = this.state$.get();
            const px = (s.s / 100) * this.dim();
            const py = (1 - s.v / 100) * this.dim();
            const rgb = hsvToRgb(s.h, s.s, s.v);
            return `left:${px}px; top:${py}px; background:${rgbToHex(rgb.r, rgb.g, rgb.b)}`;
        };
        this.huePinStyle = () => `top:${(this.state$.get().h / 360) * this.dim()}px`;
        this.alphaPinStyle = () => `top:${(1 - this.state$.get().a) * this.dim()}px`;

        this.readoutRows = (): Array<{ label: string; value: string; field: string }> => {
            const s = this.state$.get();
            const rgb = hsvToRgb(s.h, s.s, s.v);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            // CMYK from RGB
            const rn = rgb.r / 255, gn = rgb.g / 255, bn = rgb.b / 255;
            const k = 1 - Math.max(rn, gn, bn);
            const c = (k < 1) ? (1 - rn - k) / (1 - k) : 0;
            const m = (k < 1) ? (1 - gn - k) / (1 - k) : 0;
            const y = (k < 1) ? (1 - bn - k) / (1 - k) : 0;
            return [
                { label: 'HEX',  field: 'hex',  value: hex },
                { label: 'RGB',  field: 'rgb',  value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
                { label: 'HSL',  field: 'hsl',  value: `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%` },
                { label: 'HSV',  field: 'hsv',  value: `${Math.round(s.h)}, ${Math.round(s.s)}%, ${Math.round(s.v)}%` },
                { label: 'CMYK', field: 'cmyk', value: `${Math.round(c*100)}, ${Math.round(m*100)}, ${Math.round(y*100)}, ${Math.round(k*100)}` },
            ];
        };

        // Pointer handlers
        this.onSvPointer = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));
            const cur = this.state$.get();
            this.state$.set({ ...cur, s: x * 100, v: (1 - y) * 100 });
            this.#emit();
        };
        this.onHuePointer = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
            const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));
            const cur = this.state$.get();
            this.state$.set({ ...cur, h: y * 360 });
            this.#emit();
        };
        this.onAlphaPointer = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
            const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));
            const cur = this.state$.get();
            this.state$.set({ ...cur, a: 1 - y });
            this.#emit();
        };

        this.onReadoutChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            const field = inp.dataset.field;
            const v = inp.value.trim();
            if (!field) return;
            const nums = v.split(/[\s,%]+/).filter(Boolean).map(Number);
            let rgb: { r: number; g: number; b: number } | null = null;
            switch (field) {
                case 'hex' : { const p = parseHex(v); if (p) rgb = { r: p.r, g: p.g, b: p.b }; break; }
                case 'rgb' : if (nums.length >= 3) rgb = { r: nums[0]!, g: nums[1]!, b: nums[2]! }; break;
                case 'hsl' : if (nums.length >= 3) rgb = hslToRgb(nums[0]!, nums[1]!, nums[2]!); break;
                case 'hsv' : if (nums.length >= 3) rgb = hsvToRgb(nums[0]!, nums[1]!, nums[2]!); break;
                case 'cmyk': if (nums.length >= 4) {
                    const C = nums[0]! / 100, M = nums[1]! / 100, Y = nums[2]! / 100, K = nums[3]! / 100;
                    rgb = {
                        r: Math.round(255 * (1 - C) * (1 - K)),
                        g: Math.round(255 * (1 - M) * (1 - K)),
                        b: Math.round(255 * (1 - Y) * (1 - K)),
                    };
                    break;
                }
            }
            if (rgb) {
                const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                const cur = this.state$.get();
                this.state$.set({ h: hsv.h, s: hsv.s, v: hsv.v, a: cur.a });
                this.#emit();
            }
        };

        this.template = html`
            <div class="ar-cps__main">
                <div class="ar-cps__sv-wrap" :style="this.dimStyle()">
                    <canvas class="ar-cps__sv" data-r="sv"
                            @pointerdown="this.onSvPointer"
                            @pointermove="this.onSvPointer"></canvas>
                    <div class="ar-cps__sv-pin" :style="this.svPinStyle()"></div>
                </div>
                <div class="ar-cps__strips">
                    <div class="ar-cps__hue-wrap" :style="this.hueDimStyle()">
                        <canvas class="ar-cps__hue" data-r="hue" width="18"
                                @pointerdown="this.onHuePointer"
                                @pointermove="this.onHuePointer"></canvas>
                        <div class="ar-cps__hue-pin" :style="this.huePinStyle()"></div>
                    </div>
                    <div class="ar-cps__alpha-wrap" a-if="this.showAlpha()" :style="this.hueDimStyle()">
                        <canvas class="ar-cps__alpha" data-r="alpha" width="18"
                                @pointerdown="this.onAlphaPointer"
                                @pointermove="this.onAlphaPointer"></canvas>
                        <div class="ar-cps__alpha-pin" :style="this.alphaPinStyle()"></div>
                    </div>
                </div>
            </div>
            <div class="ar-cps__readout">
                <label class="ar-cps__line" a-for="row in this.readoutRows()">
                    <span>{{ row.label }}</span>
                    <input :data-field="row.field"
                           :value="row.value"
                           @change="this.onReadoutChange"/>
                </label>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = ColorPickerSquare.DefaultSheet();
    }

    /** Draw the canvas surfaces. Called on mount and on state change. */
    #drawCanvases(): void {
        const sv = this.querySelector<HTMLCanvasElement>('canvas.ar-cps__sv');
        const hue = this.querySelector<HTMLCanvasElement>('canvas.ar-cps__hue');
        const alpha = this.querySelector<HTMLCanvasElement>('canvas.ar-cps__alpha');
        if (!sv || !hue) return;
        const d = this.dim();
        sv.width = d; sv.height = d;
        hue.height = d;
        if (alpha) alpha.height = d;

        // SV gradient — current hue, S→V plane
        const svCtx = sv.getContext('2d');
        if (svCtx) {
            const img = svCtx.createImageData(d, d);
            const s = this.state$.get();
            for (let y = 0; y < d; y++) {
                for (let x = 0; x < d; x++) {
                    const sv2 = (x / (d - 1)) * 100;
                    const vv  = (1 - y / (d - 1)) * 100;
                    const rgb = hsvToRgb(s.h, sv2, vv);
                    const i = (y * d + x) * 4;
                    img.data[i]   = rgb.r;
                    img.data[i+1] = rgb.g;
                    img.data[i+2] = rgb.b;
                    img.data[i+3] = 255;
                }
            }
            svCtx.putImageData(img, 0, 0);
        }

        // Hue strip
        const hueCtx = hue.getContext('2d');
        if (hueCtx) {
            for (let y = 0; y < d; y++) {
                const hh = (y / d) * 360;
                const rgb = hsvToRgb(hh, 100, 100);
                hueCtx.fillStyle = rgbToHex(rgb.r, rgb.g, rgb.b);
                hueCtx.fillRect(0, y, 18, 1);
            }
        }

        // Alpha strip — checkerboard + current-color gradient
        if (alpha) {
            const ctx = alpha.getContext('2d');
            if (ctx) {
                const cs = 6;
                for (let y = 0; y < d; y += cs) {
                    for (let x = 0; x < 18; x += cs) {
                        ctx.fillStyle = ((x / cs + y / cs) & 1) ? '#888' : '#bbb';
                        ctx.fillRect(x, y, cs, cs);
                    }
                }
                const s = this.state$.get();
                const rgb = hsvToRgb(s.h, s.s, s.v);
                for (let y = 0; y < d; y++) {
                    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${1 - y / d})`;
                    ctx.fillRect(0, y, 18, 1);
                }
            }
        }
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setColor(hex: string): this {
        const p = parseHex(hex);
        if (!p) return this;
        const hsv = rgbToHsv(p.r, p.g, p.b);
        this.state$.set({ h: hsv.h, s: hsv.s, v: hsv.v, a: p.a });
        this.#emit();
        return this;
    }

    getColor() {
        const s = this.state$.get();
        const rgb = hsvToRgb(s.h, s.s, s.v);
        return {
            rgb,
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
            hsv: { h: s.h, s: s.s, v: s.v },
            a  : s.a,
        };
    }

    #emit(): void {
        this.#drawCanvases();
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true, detail: this.getColor(),
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const initial = this.getAttribute('color');
        if (initial) this.setColor(initial);
        else this.#drawCanvases();
    }
    onBeforeUpdate()  {}
    onUpdate() { this.#drawCanvases(); }
    onBeforeUnmount() {}
    onUnmount()       {}

    private dim          : () => number = () => 220;
    private dimStyle     : () => string = () => '';
    private hueDimStyle  : () => string = () => '';
    private showAlpha    : () => boolean = () => false;
    private svPinStyle   : () => string = () => '';
    private huePinStyle  : () => string = () => '';
    private alphaPinStyle: () => string = () => '';
    private readoutRows  : () => Array<{ label: string; value: string; field: string }> = () => [];
    private onSvPointer  : (e: Event) => void = () => {};
    private onHuePointer : (e: Event) => void = () => {};
    private onAlphaPointer : (e: Event) => void = () => {};
    private onReadoutChange: (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'inline-flex',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    gap         : '14px',
                    padding     : '14px',
                }),
                new Rule('.ar-cps__main', { display: 'flex', gap: '10px' }),
                new Rule('.ar-cps__sv-wrap, .ar-cps__hue-wrap, .ar-cps__alpha-wrap', {
                    position: 'relative',
                }),
                new Rule('.ar-cps__sv, .ar-cps__hue, .ar-cps__alpha', {
                    display: 'block', cursor: 'crosshair', borderRadius: '3px',
                    touchAction: 'none',
                }),
                new Rule('.ar-cps__sv-pin', {
                    position: 'absolute', width: '12px', height: '12px',
                    margin: '-6px 0 0 -6px',
                    border: '2px solid #fff', borderRadius: '50%',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                }),
                new Rule('.ar-cps__hue-pin, .ar-cps__alpha-pin', {
                    position: 'absolute', left: '0', right: '0', height: '3px',
                    marginTop: '-1px', background: '#fff',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                }),
                new Rule('.ar-cps__strips', { display: 'flex', gap: '6px' }),
                new Rule('.ar-cps__readout', {
                    display: 'flex', flexDirection: 'column', gap: '3px',
                    minWidth: '240px',
                }),
                new Rule('.ar-cps__line', {
                    display: 'flex', gap: '6px', alignItems: 'center',
                }),
                new Rule('.ar-cps__line span', {
                    width: '50px',
                    fontSize: '10px', textTransform: 'uppercase',
                    color: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-cps__line input', {
                    flex: '1',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '4px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '2px',
                }),
                new Rule('.ar-cps__line input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ColorPickerSquare', {
        value: ColorPickerSquare, writable: false, enumerable: false, configurable: false,
    });
}

export default ColorPickerSquare;