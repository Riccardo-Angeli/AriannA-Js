/**
 * @module    components/graphics/colors/ColorPickerWheel
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ColorPickerWheel — HSL hue-ring picker. SVG-rendered ring of 360° wedges
 * with a white indicator dot. Click-drag around the ring to set the hue.
 *
 * @example HTML
 *   <arianna-color-picker-wheel value="#ff00aa" size="200"></arianna-color-picker-wheel>
 *
 * Events: arianna:change  detail: { hex, hue, hslString }
 * Attrs:  value, size
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';
import { parseHex, rgbToHsl, hslToRgb, rgbToHex } from './ColorPicker.ts';

export interface ColorPickerWheelOptions {
    value? : string;
    size?  : number;
}

export class ColorPickerWheel extends Component('arianna-color-picker-wheel', HTMLElement, {}, {
    attrs : ['value', 'size'],
    shadow: false,
})
{
    hue$: Signal<number> = signal<number>(0);

    build(_opts: ColorPickerWheelOptions = {})
    {
        const sizeAttr = this.attrSignal('size');

        this.dim = () => parseInt(sizeAttr.get() ?? '200', 10) || 200;
        this.viewBox = () => `0 0 ${this.dim()} ${this.dim()}`;
        this.dimStr  = () => String(this.dim());

        this.wedges = (): Array<{ d: string; fill: string }> => {
            const d = this.dim();
            const cx = d / 2, cy = d / 2;
            const rOuter = d / 2 - 4;
            const rInner = rOuter - 20;
            const out: Array<{ d: string; fill: string }> = [];
            for (let h = 0; h < 360; h += 2) {
                const a0 = (h - 1) * Math.PI / 180;
                const a1 = (h + 1) * Math.PI / 180;
                const x0o = cx + rOuter * Math.cos(a0), y0o = cy + rOuter * Math.sin(a0);
                const x1o = cx + rOuter * Math.cos(a1), y1o = cy + rOuter * Math.sin(a1);
                const x1i = cx + rInner * Math.cos(a1), y1i = cy + rInner * Math.sin(a1);
                const x0i = cx + rInner * Math.cos(a0), y0i = cy + rInner * Math.sin(a0);
                out.push({
                    d: `M${x0o},${y0o} A${rOuter},${rOuter} 0 0,1 ${x1o},${y1o} L${x1i},${y1i} A${rInner},${rInner} 0 0,0 ${x0i},${y0i} Z`,
                    fill: `hsl(${h}, 100%, 50%)`,
                });
            }
            return out;
        };
        this.dotCx = () => {
            const d = this.dim();
            const cx = d / 2;
            const rOuter = d / 2 - 4;
            const rInner = rOuter - 20;
            const r = (rInner + rOuter) / 2;
            return String(cx + r * Math.cos(this.hue$.get() * Math.PI / 180));
        };
        this.dotCy = () => {
            const d = this.dim();
            const cy = d / 2;
            const rOuter = d / 2 - 4;
            const rInner = rOuter - 20;
            const r = (rInner + rOuter) / 2;
            return String(cy + r * Math.sin(this.hue$.get() * Math.PI / 180));
        };

        this.onPointer = (e: Event) => {
            const me = e as PointerEvent;
            if (me.type === 'pointerdown') {
                (me.currentTarget as SVGElement).setPointerCapture?.(me.pointerId);
            } else if (!(me.buttons & 1)) return;
            const rect = (me.currentTarget as SVGElement).getBoundingClientRect();
            const d = this.dim();
            const x = me.clientX - rect.left - d / 2;
            const y = me.clientY - rect.top  - d / 2;
            const hue = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
            this.hue$.set(hue);
            this.#emit();
        };

        this.template = html`
            <svg :viewBox="this.viewBox()"
                 :width="this.dimStr()"
                 :height="this.dimStr()"
                 @pointerdown="this.onPointer"
                 @pointermove="this.onPointer"
                 xmlns="http://www.w3.org/2000/svg">
                <path a-for="w in this.wedges()" :d="w.d" :fill="w.fill"></path>
                <circle :cx="this.dotCx()" :cy="this.dotCy()"
                        r="6" fill="none" stroke="#fff" stroke-width="2"></circle>
            </svg>
        `;

        this.Sheet = ColorPickerWheel.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setValue(v: string): this {
        const p = parseHex(v);
        if (p) {
            this.hue$.set(rgbToHsl(p.r, p.g, p.b).h);
        } else {
            // Try hsl(...) form
            const m = /hsl\(\s*(\d+(?:\.\d+)?)/.exec(v);
            if (m) this.hue$.set(parseFloat(m[1]!));
        }
        return this;
    }

    getValue(): string {
        const rgb = hslToRgb(this.hue$.get(), 100, 50);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    #emit(): void {
        const h = this.hue$.get();
        const rgb = hslToRgb(h, 100, 50);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true,
            detail: { hex, hue: h, hslString: `hsl(${h.toFixed(0)}, 100%, 50%)` },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const v = this.getAttribute('value');
        if (v) this.setValue(v);
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private dim       : () => number = () => 200;
    private viewBox   : () => string = () => '0 0 200 200';
    private dimStr    : () => string = () => '200';
    private wedges    : () => Array<{ d: string; fill: string }> = () => [];
    private dotCx     : () => string = () => '0';
    private dotCy     : () => string = () => '0';
    private onPointer : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 10px)',
                    display     : 'inline-block',
                    padding     : '10px',
                    boxShadow   : '0 4px 12px rgba(0,0,0,0.06)',
                }),
                new Rule(':root svg', {
                    display: 'block',
                    cursor : 'crosshair',
                    touchAction: 'none',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ColorPickerWheel', {
        value: ColorPickerWheel, writable: false, enumerable: false, configurable: false,
    });
}

export default ColorPickerWheel;
