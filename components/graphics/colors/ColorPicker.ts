/**
 * @module    components/graphics/colors/ColorPicker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ColorPicker — HSL + RGB integrated picker. SV square + vertical hue
 * strip + numeric inputs for hex / R-G-B / H-S-L, with optional alpha
 * slider. All four representations stay in sync.
 *
 * @example HTML
 *   <arianna-color-picker color="#e40c88" alpha></arianna-color-picker>
 *
 * @example JS
 *   const p = new ColorPicker();
 *   p.setColor('#3b82f6');
 *   p.addEventListener('arianna:change', e => apply(e.detail.hex));
 *
 * Events: arianna:change  detail: Color  ({ hex, r, g, b, h, s, l, a })
 * Attrs:  color, alpha, show-hex, show-rgb, show-hsl
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export interface RGB { r: number; g: number; b: number; }
export interface HSL { h: number; s: number; l: number; }
export interface Color extends RGB, HSL { hex: string; a: number; }

export interface ColorPickerOptions {
    color?   : string | Partial<RGB> | Partial<HSL>;
    alpha?   : boolean;
    showHex? : boolean;
    showRGB? : boolean;
    showHSL? : boolean;
}

interface PickerState { h: number; s: number; l: number; a: number; }

export class ColorPicker extends Component('arianna-color-picker-pro', HTMLElement, {}, {
    attrs : ['color', 'alpha', 'show-hex', 'show-rgb', 'show-hsl'],
})
{
    state$: Signal<PickerState> = signal<PickerState>({ h: 325, s: 90, l: 47, a: 1 });

    build(_opts: ColorPickerOptions = {})
    {
        // Reactive predicates
        this.showHex = () => this.getAttribute('show-hex') !== 'false';
        this.showRGB = () => this.getAttribute('show-rgb') !== 'false';
        this.showHSL = () => this.getAttribute('show-hsl') !== 'false';
        this.showAlpha = () => this.hasAttribute('alpha');

        // Reactive geometry: dot positions, gradients, input values
        this.svBg = () => `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)),
                          linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
                          hsl(${this.state$.get().h}, 100%, 50%)`;
        this.svDotStyle = () => {
            const s = this.state$.get();
            return `left:${s.s}%; top:${100 - s.l}%`;
        };
        this.hueDotStyle = () => `top:${(this.state$.get().h / 360) * 100}%`;
        this.previewStyle = () => {
            const c = this.#color();
            return c.a < 1 ? `background: rgba(${c.r},${c.g},${c.b},${c.a})` : `background: ${c.hex}`;
        };

        this.hexVal = () => this.#color().hex;
        this.rVal = () => String(this.#color().r);
        this.gVal = () => String(this.#color().g);
        this.bVal = () => String(this.#color().b);
        this.hVal = () => String(Math.round(this.state$.get().h));
        this.sVal = () => String(Math.round(this.state$.get().s));
        this.lVal = () => String(Math.round(this.state$.get().l));
        this.aVal = () => String(this.state$.get().a);

        // SV square drag: pointermove + buttons-down updates h/s/l
        this.onSvPointer = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width,  me.clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height, me.clientY - rect.top));
            const cur = this.state$.get();
            this.state$.set({
                ...cur,
                s: (x / rect.width) * 100,
                l: (1 - y / rect.height) * 100,
            });
            this.#emit();
        };
        this.onHuePointer = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
            const y = Math.max(0, Math.min(rect.height, me.clientY - rect.top));
            const cur = this.state$.get();
            this.state$.set({ ...cur, h: (y / rect.height) * 360 });
            this.#emit();
        };

        this.onHexChange = (e: Event) => {
            const v = (e.target as HTMLInputElement).value.trim();
            if (parseHex(v)) this.setColor(v);
        };
        this.onRgbChange = () => {
            const r = parseInt((this.querySelector('[data-r="r"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
            const g = parseInt((this.querySelector('[data-r="g"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
            const b = parseInt((this.querySelector('[data-r="b"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
            this.setColor({ r, g, b });
        };
        this.onHslChange = () => {
            const h = parseInt((this.querySelector('[data-r="h"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
            const s = parseInt((this.querySelector('[data-r="s"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
            const l = parseInt((this.querySelector('[data-r="l"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
            this.setColor({ h, s, l });
        };
        this.onAlphaInput = (e: Event) => {
            const a = parseFloat((e.target as HTMLInputElement).value);
            const cur = this.state$.get();
            this.state$.set({ ...cur, a: Math.max(0, Math.min(1, a)) });
            this.#emit();
        };

        this.template = html`
            <div class="ar-cp__top">
                <div class="ar-cp__sv"
                     :style="this.svBg()"
                     @pointerdown="this.onSvPointer"
                     @pointermove="this.onSvPointer">
                    <div class="ar-cp__sv-dot" :style="this.svDotStyle()"></div>
                </div>
                <div class="ar-cp__hue"
                     @pointerdown="this.onHuePointer"
                     @pointermove="this.onHuePointer">
                    <div class="ar-cp__hue-dot" :style="this.hueDotStyle()"></div>
                </div>
            </div>
            <div class="ar-cp__row">
                <div class="ar-cp__preview" :style="this.previewStyle()"></div>
                <input class="ar-cp__inp ar-cp__inp--hex"
                       a-if="this.showHex()"
                       type="text" maxlength="9"
                       :value="this.hexVal()"
                       @change="this.onHexChange"/>
            </div>
            <div class="ar-cp__row" a-if="this.showRGB()">
                <label>R</label><input class="ar-cp__inp" data-r="r" type="number" min="0" max="255" :value="this.rVal()" @change="this.onRgbChange"/>
                <label>G</label><input class="ar-cp__inp" data-r="g" type="number" min="0" max="255" :value="this.gVal()" @change="this.onRgbChange"/>
                <label>B</label><input class="ar-cp__inp" data-r="b" type="number" min="0" max="255" :value="this.bVal()" @change="this.onRgbChange"/>
            </div>
            <div class="ar-cp__row" a-if="this.showHSL()">
                <label>H</label><input class="ar-cp__inp" data-r="h" type="number" min="0" max="360" :value="this.hVal()" @change="this.onHslChange"/>
                <label>S</label><input class="ar-cp__inp" data-r="s" type="number" min="0" max="100" :value="this.sVal()" @change="this.onHslChange"/>
                <label>L</label><input class="ar-cp__inp" data-r="l" type="number" min="0" max="100" :value="this.lVal()" @change="this.onHslChange"/>
            </div>
            <div class="ar-cp__row ar-cp__row--alpha" a-if="this.showAlpha()">
                <label>A</label>
                <input class="ar-cp__alpha" type="range" min="0" max="1" step="0.01"
                       :value="this.aVal()"
                       @input="this.onAlphaInput"/>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = ColorPicker.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    getColor(): Color { return this.#color(); }

    setColor(c: string | Partial<RGB> | Partial<HSL> | { a?: number }): this {
        const cur = this.state$.get();
        const next: PickerState = { ...cur };
        if (typeof c === 'string') {
            const p = parseHex(c);
            if (p) {
                const hsl = rgbToHsl(p.r, p.g, p.b);
                next.h = hsl.h; next.s = hsl.s; next.l = hsl.l;
                if (p.a !== undefined) next.a = p.a;
            }
        } else if (c) {
            if ('r' in c || 'g' in c || 'b' in c) {
                const curRgb = hslToRgb(cur.h, cur.s, cur.l);
                const r = Math.max(0, Math.min(255, Math.round((c as RGB).r ?? curRgb.r)));
                const g = Math.max(0, Math.min(255, Math.round((c as RGB).g ?? curRgb.g)));
                const b = Math.max(0, Math.min(255, Math.round((c as RGB).b ?? curRgb.b)));
                const hsl = rgbToHsl(r, g, b);
                next.h = hsl.h; next.s = hsl.s; next.l = hsl.l;
            } else if ('h' in c || 's' in c || 'l' in c) {
                if ('h' in c) next.h = (((c.h as number) % 360) + 360) % 360;
                if ('s' in c) next.s = Math.max(0, Math.min(100, c.s as number));
                if ('l' in c) next.l = Math.max(0, Math.min(100, c.l as number));
            }
            if ('a' in c && typeof c.a === 'number') {
                next.a = Math.max(0, Math.min(1, c.a));
            }
        }
        this.state$.set(next);
        this.#emit();
        return this;
    }

    #color(): Color {
        const s = this.state$.get();
        const rgb = hslToRgb(s.h, s.s, s.l);
        return {
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            r: rgb.r, g: rgb.g, b: rgb.b,
            h: s.h, s: s.s, l: s.l,
            a: s.a,
        };
    }

    #emit(): void {
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true, detail: this.#color(),
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const initial = this.getAttribute('color');
        if (initial) this.setColor(initial);
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // Template helpers
    private showHex   : () => boolean = () => true;
    private showRGB   : () => boolean = () => true;
    private showHSL   : () => boolean = () => true;
    private showAlpha : () => boolean = () => false;
    private svBg      : () => string = () => '';
    private svDotStyle: () => string = () => '';
    private hueDotStyle: () => string = () => '';
    private previewStyle: () => string = () => '';
    private hexVal    : () => string = () => '';
    private rVal      : () => string = () => '0';
    private gVal      : () => string = () => '0';
    private bVal      : () => string = () => '0';
    private hVal      : () => string = () => '0';
    private sVal      : () => string = () => '0';
    private lVal      : () => string = () => '0';
    private aVal      : () => string = () => '1';
    private onSvPointer : (e: Event) => void = () => {};
    private onHuePointer: (e: Event) => void = () => {};
    private onHexChange : (e: Event) => void = () => {};
    private onRgbChange : (e: Event) => void = () => {};
    private onHslChange : (e: Event) => void = () => {};
    private onAlphaInput: (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'inline-flex',
                    flexDirection: 'column',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    gap         : '8px',
                    padding     : '10px',
                    userSelect  : 'none',
                    width       : '240px',
                }),
                new Rule('.ar-cp__top', { display: 'flex', gap: '8px', alignItems: 'stretch' }),
                new Rule('.ar-cp__sv', {
                    position: 'relative', flex: '1', height: '150px',
                    borderRadius: '3px', cursor: 'crosshair', overflow: 'hidden',
                    touchAction: 'none',
                }),
                new Rule('.ar-cp__sv-dot', {
                    position: 'absolute', width: '12px', height: '12px',
                    border: '2px solid #fff', borderRadius: '50%',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                    transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                }),
                new Rule('.ar-cp__hue', {
                    position: 'relative', width: '18px', height: '150px',
                    borderRadius: '3px', cursor: 'ns-resize', overflow: 'hidden',
                    background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                    touchAction: 'none',
                }),
                new Rule('.ar-cp__hue-dot', {
                    position: 'absolute', left: '0', right: '0', height: '2px',
                    background: '#fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                }),
                new Rule('.ar-cp__row', { display: 'flex', gap: '6px', alignItems: 'center' }),
                new Rule('.ar-cp__row label', {
                    fontSize: '10px', color: 'var(--arianna-muted, #6e6b62)',
                    minWidth: '8px', textAlign: 'right',
                }),
                new Rule('.ar-cp__inp', {
                    flex: '1', minWidth: '0',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '3px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '3px',
                }),
                new Rule('.ar-cp__inp--hex', { fontSize: '12px', textAlign: 'center' }),
                new Rule('.ar-cp__preview', {
                    width: '24px', height: '24px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px', flexShrink: '0',
                    backgroundImage:
                        'linear-gradient(45deg,#bbb 25%,transparent 25%),' +
                        'linear-gradient(-45deg,#bbb 25%,transparent 25%),' +
                        'linear-gradient(45deg,transparent 75%,#bbb 75%),' +
                        'linear-gradient(-45deg,transparent 75%,#bbb 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                }),
                new Rule('.ar-cp__alpha', { flex: '1', cursor: 'pointer' }),
            ]
        );
    }
}

// ── Pure color math (exported) ─────────────────────────────────────────────

export function parseHex(s: string): { r: number; g: number; b: number; a: number } | null
{
    if (!s) return null;
    let h = s.trim().toLowerCase();
    if (h.startsWith('#')) h = h.slice(1);
    if (/^[0-9a-f]{3}$/.test(h)) {
        return {
            r: parseInt(h[0]! + h[0], 16),
            g: parseInt(h[1]! + h[1], 16),
            b: parseInt(h[2]! + h[2], 16),
            a: 1,
        };
    }
    if (/^[0-9a-f]{6}$/.test(h)) {
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
            a: 1,
        };
    }
    if (/^[0-9a-f]{8}$/.test(h)) {
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
            a: parseInt(h.slice(6, 8), 16) / 255,
        };
    }
    return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
    const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2;               break;
            case b: h = (r - g) / d + 4;               break;
        }
        h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
    h = ((h % 360) + 360) % 360 / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    let r: number, g: number, b: number;
    if (s === 0) { r = g = b = l; }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'GraphicsColorPicker', {
        value: ColorPicker, writable: false, enumerable: false, configurable: false,
    });
}

export default ColorPicker;
