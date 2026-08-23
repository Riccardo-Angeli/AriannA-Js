/**
 * @module    components/graphics/colors/ColorPickerSquare
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ColorPickerSquare component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import { parseHexRgba, rgbToHex, rgbToHsl, hslToRgb } from './GraphicsColorPicker.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/definitions/Interfaces.ts';

/** @namespace   ColorPickerSquare
 *  @public
 *  @description Namespace containing ColorPickerSquare contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ColorPickerSquare
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ColorPickerSquareOptions
         *  @public
         *  @description ColorPickerSquareOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ColorPickerSquareOptions
        {
            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;

            /** @name        alpha
             *  @public
             *  @type        {boolean}
             *  @description Component member for alpha.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            alpha?: boolean;

            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number;
        }

        /** @interface   HSVState
         *  @public
         *  @description HSVState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HSVState
        {
            /** @name        h
             *  @public
             *  @type        {number}
             *  @description Component member for h.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            h: number;

            /** @name        s
             *  @public
             *  @type        {number}
             *  @description Component member for s.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            s: number;

            /** @name        v
             *  @public
             *  @type        {number}
             *  @description Component member for v.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            v: number;

            /** @name        a
             *  @public
             *  @type        {number}
             *  @description Component member for a.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            a: number;
        }
    }
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
    // ── Local HSV helpers ───────────────────────────────────────────────────────
    export function rgbToHsv(r: number, g: number, b: number): {
        /** @name        h
         *  @public
         *  @type        {number}
         *  @description Component member for h.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        h: number;

        /** @name        s
         *  @public
         *  @type        {number}
         *  @description Component member for s.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        s: number;

        /** @name        v
         *  @public
         *  @type        {number}
         *  @description Component member for v.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        v: number;
    } {
        r /= 255;
        g /= 255;
        b /= 255;

        /** @name        max
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned max value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const max = Math.max(r, g, b), min = Math.min(r, g, b);

        /** @name        d
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned d value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const d = max - min;

        /** @name        h
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned h value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let h = 0;

        /** @name        s
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned s value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const s = max === 0 ? 0 : d / max;
        if (d !== 0)
        {
            switch (max)
            {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h *= 60;
        }
        return { h, s: s * 100, v: max * 100 };
    }
    export function hsvToRgb(h: number, s: number, v: number): {
        /** @name        r
         *  @public
         *  @type        {number}
         *  @description Component member for r.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        r: number;

        /** @name        g
         *  @public
         *  @type        {number}
         *  @description Component member for g.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        g: number;

        /** @name        b
         *  @public
         *  @type        {number}
         *  @description Component member for b.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        b: number;
    } {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        v = Math.max(0, Math.min(100, v)) / 100;

        /** @name        c
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned c value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const c = v * s;

        /** @name        x
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned x value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));

        /** @name        m
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned m value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const m = v - c;

        /** @name        r
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned r value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let r = 0, g = 0, b = 0;
        if (h < 60)
        {
            r = c;
            g = x;
            b = 0;
        }
        else if (h < 120)
        {
            r = x;
            g = c;
            b = 0;
        }
        else if (h < 180)
        {
            r = 0;
            g = c;
            b = x;
        }
        else if (h < 240)
        {
            r = 0;
            g = x;
            b = c;
        }
        else if (h < 300)
        {
            r = x;
            g = 0;
            b = c;
        }
        else
        {
            r = c;
            g = 0;
            b = x;
        }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
        };
    }

    /** @name        RgbToHsv
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned RgbToHsv value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function RgbToHsv
    (
        ...args: Parameters<typeof rgbToHsv>
    ): ReturnType<typeof rgbToHsv>
    {
        return rgbToHsv(...args);
    }
    /** @name        HsvToRgb
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned HsvToRgb value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function HsvToRgb
    (
        ...args: Parameters<typeof hsvToRgb>
    ): ReturnType<typeof hsvToRgb>
    {
        return hsvToRgb(...args);
    }
    /** @class       ColorPickerSquare
     *  @public
     *  @description AriannA ColorPickerSquare component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-color-picker-square', {}, {
        Attributes: ['color', 'alpha', 'size'],
    })
    export class ColorPickerSquare extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        state$
         *  @public
         *  @type        {ColorPickerSquare.Types.Signal<ColorPickerSquare.Interfaces.HSVState>}
         *  @description Component member for state$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        state$: Types.Signal<Interfaces.HSVState> = signal<Interfaces.HSVState>({ h: 325, s: 90, v: 90, a: 1 });

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ColorPickerSquare.Interfaces.ColorPickerSquareOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ColorPickerSquareOptions = {})
        {
            /** @name        sizeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sizeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sizeAttr = this.signal().attribute('size');
            this.dim = () => parseInt(sizeAttr.Get() ?? '220', 10) || 220;
            this.dimStyle = () => `width:${this.dim()}px; height:${this.dim()}px`;
            this.hueDimStyle = () => `height:${this.dim()}px`;
            this.showAlpha = () => this.hasAttribute('alpha');
            this.svPinStyle = () => {
                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = this.state$.Get();

                /** @name        px
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned px value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const px = (s.s / 100) * this.dim();

                /** @name        py
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned py value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const py = (1 - s.v / 100) * this.dim();

                /** @name        rgb
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rgb value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rgb = hsvToRgb(s.h, s.s, s.v);
                return `left:${px}px; top:${py}px; background:${rgbToHex(rgb.r, rgb.g, rgb.b)}`;
            };
            this.huePinStyle = () => `top:${(this.state$.Get().h / 360) * this.dim()}px`;
            this.alphaPinStyle = () => `top:${(1 - this.state$.Get().a) * this.dim()}px`;
            this.readoutRows = (): Array<{
                /** @name        label
                 *  @public
                 *  @type        {string}
                 *  @description Component member for label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                label: string;

                /** @name        value
                 *  @public
                 *  @type        {string}
                 *  @description Component member for value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value: string;

                /** @name        field
                 *  @public
                 *  @type        {string}
                 *  @description Component member for field.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                field: string;
            }> => {
                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = this.state$.Get();

                /** @name        rgb
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rgb value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rgb = hsvToRgb(s.h, s.s, s.v);

                /** @name        hex
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hex value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

                /** @name        hsl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hsl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                // CMYK from RGB
                /** @name        rn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rn = rgb.r / 255, gn = rgb.g / 255, bn = rgb.b / 255;

                /** @name        k
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned k value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const k = 1 - Math.max(rn, gn, bn);

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = (k < 1) ? (1 - rn - k) / (1 - k) : 0;

                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = (k < 1) ? (1 - gn - k) / (1 - k) : 0;

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = (k < 1) ? (1 - bn - k) / (1 - k) : 0;
                return [
                    { label: 'HEX', field: 'hex', value: hex },
                    { label: 'RGB', field: 'rgb', value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
                    { label: 'HSL', field: 'hsl', value: `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%` },
                    { label: 'HSV', field: 'hsv', value: `${Math.round(s.h)}, ${Math.round(s.s)}%, ${Math.round(s.v)}%` },
                    { label: 'CMYK', field: 'cmyk', value: `${Math.round(c * 100)}, ${Math.round(m * 100)}, ${Math.round(y * 100)}, ${Math.round(k * 100)}` },
                ];
            };
            // Pointer handlers
            this.onSvPointer = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                if (me.type === 'pointerdown')
                {
                    (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
                }
                else if (!(me.buttons & 1))
                    return;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();
                this.state$.Set({ ...cur, s: x * 100, v: (1 - y) * 100 });
                this.#emit();
            };
            this.onHuePointer = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                if (me.type === 'pointerdown')
                {
                    (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
                }
                else if (!(me.buttons & 1))
                    return;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();
                this.state$.Set({ ...cur, h: y * 360 });
                this.#emit();
            };
            this.onAlphaPointer = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                if (me.type === 'pointerdown')
                {
                    (me.currentTarget as HTMLElement).setPointerCapture?.(me.pointerId);
                }
                else if (!(me.buttons & 1))
                    return;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();
                this.state$.Set({ ...cur, a: 1 - y });
                this.#emit();
            };
            this.onReadoutChange = (e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;

                /** @name        field
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned field value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const field = inp.dataset.field;

                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = inp.value.trim();
                if (!field)
                    return;

                /** @name        nums
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nums value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const nums = v.split(/[\s,%]+/).filter(Boolean).map(Number);

                /** @name        rgb
                 *  @public
                 *  @type        {{
                    r: number;
                    g: number;
                    b: number;
                } | null}
                 *  @description Namespace-owned rgb value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let rgb: {
                    /** @name        r
                     *  @public
                     *  @type        {number}
                     *  @description Component member for r.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    r: number;

                    /** @name        g
                     *  @public
                     *  @type        {number}
                     *  @description Component member for g.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    g: number;

                    /** @name        b
                     *  @public
                     *  @type        {number}
                     *  @description Component member for b.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    b: number;
                } | null = null;
                switch (field)
                {
                    case 'hex': {
                        /** @name        p
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned p value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const p = parseHexRgba(v);
                        if (p)
                            rgb = { r: p.r, g: p.g, b: p.b };
                        break;
                    }
                    case 'rgb':
                        if (nums.length >= 3)
                            rgb = { r: nums[0]!, g: nums[1]!, b: nums[2]! };
                        break;
                    case 'hsl':
                        if (nums.length >= 3)
                            rgb = hslToRgb(nums[0]!, nums[1]!, nums[2]!);
                        break;
                    case 'hsv':
                        if (nums.length >= 3)
                            rgb = hsvToRgb(nums[0]!, nums[1]!, nums[2]!);
                        break;
                    case 'cmyk': if (nums.length >= 4) {
                        /** @name        C
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned C value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const C = nums[0]! / 100, M = nums[1]! / 100, Y = nums[2]! / 100, K = nums[3]! / 100;
                        rgb = {
                            r: Math.round(255 * (1 - C) * (1 - K)),
                            g: Math.round(255 * (1 - M) * (1 - K)),
                            b: Math.round(255 * (1 - Y) * (1 - K)),
                        };
                        break;
                    }
                }
                if (rgb)
                {
                    /** @name        hsv
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned hsv value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

                    /** @name        cur
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cur value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cur = this.state$.Get();
                    this.state$.Set({ h: hsv.h, s: hsv.s, v: hsv.v, a: cur.a });
                    this.#emit();
                }
            };
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ColorPickerSquare.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ColorPickerSquare.DefaultSheet();
        }

        /** Draw the canvas surfaces. Called on mount and on state change. */
        #drawCanvases(): void
        {
            /** @name        sv
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sv value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sv = this.querySelector<HTMLCanvasElement>('canvas.ar-cps__sv');

            /** @name        hue
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hue value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hue = this.querySelector<HTMLCanvasElement>('canvas.ar-cps__hue');

            /** @name        alpha
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned alpha value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const alpha = this.querySelector<HTMLCanvasElement>('canvas.ar-cps__alpha');
            if (!sv || !hue)
                return;

            /** @name        d
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned d value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const d = this.dim();
            sv.width = d;
            sv.height = d;
            hue.height = d;
            if (alpha)
                alpha.height = d;
            // SV gradient — current hue, S→V plane
            /** @name        svCtx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned svCtx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const svCtx = sv.getContext('2d');
            if (svCtx)
            {
                /** @name        img
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned img value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const img = svCtx.createImageData(d, d);

                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = this.state$.Get();
                for (let y = 0; y < d; y++)
                {
                    for (let x = 0; x < d; x++)
                    {
                        /** @name        sv2
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned sv2 value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const sv2 = (x / (d - 1)) * 100;

                        /** @name        vv
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned vv value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const vv = (1 - y / (d - 1)) * 100;

                        /** @name        rgb
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned rgb value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const rgb = hsvToRgb(s.h, sv2, vv);

                        /** @name        i
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned i value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const i = (y * d + x) * 4;
                        img.data[i] = rgb.r;
                        img.data[i + 1] = rgb.g;
                        img.data[i + 2] = rgb.b;
                        img.data[i + 3] = 255;
                    }
                }
                svCtx.putImageData(img, 0, 0);
            }
            // Hue strip
            /** @name        hueCtx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hueCtx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hueCtx = hue.getContext('2d');
            if (hueCtx)
            {
                for (let y = 0; y < d; y++)
                {
                    /** @name        hh
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned hh value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const hh = (y / d) * 360;

                    /** @name        rgb
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned rgb value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const rgb = hsvToRgb(hh, 100, 100);
                    hueCtx.fillStyle = rgbToHex(rgb.r, rgb.g, rgb.b);
                    hueCtx.fillRect(0, y, 18, 1);
                }
            }
            // Alpha strip — checkerboard + current-color gradient
            if (alpha)
            {
                /** @name        ctx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ctx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ctx = alpha.getContext('2d');
                if (ctx)
                {
                    /** @name        cs
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cs value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cs = 6;
                    for (let y = 0; y < d; y += cs)
                    {
                        for (let x = 0; x < 18; x += cs)
                        {
                            ctx.fillStyle = ((x / cs + y / cs) & 1) ? '#888' : '#bbb';
                            ctx.fillRect(x, y, cs, cs);
                        }
                    }

                    /** @name        s
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned s value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const s = this.state$.Get();

                    /** @name        rgb
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned rgb value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const rgb = hsvToRgb(s.h, s.s, s.v);
                    for (let y = 0; y < d; y++)
                    {
                        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${1 - y / d})`;
                        ctx.fillRect(0, y, 18, 1);
                    }
                }
            }
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setColor
         *  @public
         *  @type        {this}
         *  @description Component member for set Color.
         *  @param       {string} hex Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setColor(hex: string): this
        {
            /** @name        p
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p = parseHexRgba(hex);
            if (!p)
                return this;

            /** @name        hsv
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hsv value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hsv = rgbToHsv(p.r, p.g, p.b);
            this.state$.Set({ h: hsv.h, s: hsv.s, v: hsv.v, a: p.a });
            this.#emit();
            return this;
        }

        /** @name        getColor
         *  @public
         *  @type        {void}
         *  @description Component member for get Color.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getColor()
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.state$.Get();

            /** @name        rgb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rgb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rgb = hsvToRgb(s.h, s.s, s.v);
            return {
                rgb,
                hex: rgbToHex(rgb.r, rgb.g, rgb.b),
                hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
                hsv: { h: s.h, s: s.s, v: s.v },
                a: s.a,
            };
        }

        /** @name        #emit
         *  @public
         *  @type        {void}
         *  @description Component member for emit.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #emit(): void
        {
            this.#drawCanvases();
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: this.getColor(),
            }));
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount()
        {
            /** @name        initial
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned initial value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const initial = this.getAttribute('color');
            if (initial)
                this.setColor(initial);
            else
                this.#drawCanvases();
        }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { this.#drawCanvases(); }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        dim
         *  @private
         *  @type        {() => number}
         *  @description Component member for dim.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dim: () => number = () => 220;

        /** @name        dimStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for dim Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dimStyle: () => string = () => '';

        /** @name        hueDimStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for hue Dim Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hueDimStyle: () => string = () => '';

        /** @name        showAlpha
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Alpha.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showAlpha: () => boolean = () => false;

        /** @name        svPinStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for sv Pin Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svPinStyle: () => string = () => '';

        /** @name        huePinStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for hue Pin Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private huePinStyle: () => string = () => '';

        /** @name        alphaPinStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for alpha Pin Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private alphaPinStyle: () => string = () => '';

        /** @name        readoutRows
         *  @private
         *  @type        {() => Array<{
            label: string;
            value: string;
            field: string;
        }>}
         *  @description Component member for readout Rows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private readoutRows: () => Array<{
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value: string;

            /** @name        field
             *  @public
             *  @type        {string}
             *  @description Component member for field.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            field: string;
        }> = () => [];

        /** @name        onSvPointer
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sv Pointer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSvPointer: (e: Event) => void = () => { };

        /** @name        onHuePointer
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Hue Pointer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHuePointer: (e: Event) => void = () => { };

        /** @name        onAlphaPointer
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Alpha Pointer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAlphaPointer: (e: Event) => void = () => { };

        /** @name        onReadoutChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Readout Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onReadoutChange: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ColorPickerSquare.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ColorPickerSquare.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'inline-flex',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    gap: '14px',
                    padding: '14px',
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
            ]);
        }
    }
}
export default ColorPickerSquare;

export type ColorPickerSquareOptions = ColorPickerSquare.Interfaces.ColorPickerSquareOptions;
