/**
 * @module    components/graphics/colors/GraphicsColorPicker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA GraphicsColorPicker component module.
 */

import { Component, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   GraphicsColorPicker
 *  @public
 *  @description Namespace containing GraphicsColorPicker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace GraphicsColorPicker
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
        /** @interface   RGB
         *  @public
         *  @description RGB contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RGB
        {
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
        }

        /** @interface   HSL
         *  @public
         *  @description HSL contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HSL
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

            /** @name        l
             *  @public
             *  @type        {number}
             *  @description Component member for l.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            l: number;
        }

        /** @interface   Color
         *  @public
         *  @description Color contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Color extends Interfaces.RGB, Interfaces.HSL
        {
            /** @name        hex
             *  @public
             *  @type        {string}
             *  @description Component member for hex.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hex: string;

            /** @name        a
             *  @public
             *  @type        {number}
             *  @description Component member for a.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            a: number;
        }

        /** @interface   ColorPickerOptions
         *  @public
         *  @description ColorPickerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ColorPickerOptions
        {
            /** @name        color
             *  @public
             *  @type        {string | Partial<GraphicsColorPicker.Interfaces.RGB> | Partial<GraphicsColorPicker.Interfaces.HSL>}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string | Partial<Interfaces.RGB> | Partial<Interfaces.HSL>;

            /** @name        alpha
             *  @public
             *  @type        {boolean}
             *  @description Component member for alpha.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            alpha?: boolean;

            /** @name        showHex
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Hex.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showHex?: boolean;

            /** @name        showRGB
             *  @public
             *  @type        {boolean}
             *  @description Component member for show RGB.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showRGB?: boolean;

            /** @name        showHSL
             *  @public
             *  @type        {boolean}
             *  @description Component member for show HSL.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showHSL?: boolean;
        }

        /** @interface   PickerState
         *  @public
         *  @description PickerState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PickerState
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

            /** @name        l
             *  @public
             *  @type        {number}
             *  @description Component member for l.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            l: number;

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

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
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
    // ── Pure color math (exported) ─────────────────────────────────────────────
    export function parseHexRgba(s: string): {
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

        /** @name        a
         *  @public
         *  @type        {number}
         *  @description Component member for a.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        a: number;
    } | null {
        if (!s)
            return null;

        /** @name        h
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned h value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let h = s.trim().toLowerCase();
        if (h.startsWith('#'))
            h = h.slice(1);
        if (/^[0-9a-f]{3}$/.test(h))
        {
            return {
                r: parseInt(h[0]! + h[0], 16),
                g: parseInt(h[1]! + h[1], 16),
                b: parseInt(h[2]! + h[2], 16),
                a: 1,
            };
        }
        if (/^[0-9a-f]{6}$/.test(h))
        {
            return {
                r: parseInt(h.slice(0, 2), 16),
                g: parseInt(h.slice(2, 4), 16),
                b: parseInt(h.slice(4, 6), 16),
                a: 1,
            };
        }
        if (/^[0-9a-f]{8}$/.test(h))
        {
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
        /** @name        c
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned c value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
        return '#' + c(r) + c(g) + c(b);
    }
    export function rgbToHsl(r: number, g: number, b: number): Interfaces.HSL {
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

        /** @name        h
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned h value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let h = 0, s = 0;

        /** @name        l
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned l value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const l = (max + min) / 2;
        if (max !== min)
        {
            /** @name        d
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned d value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
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
        return { h, s: s * 100, l: l * 100 };
    }
    export function hslToRgb(h: number, s: number, l: number): Interfaces.RGB {
        h = ((h % 360) + 360) % 360 / 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;

        /** @name        hue2rgb
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned hue2rgb value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const hue2rgb = (p: number, q: number, t: number): number => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        /** @name        r
         *  @public
         *  @type        {number}
         *  @description Namespace-owned r value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let r: number, g: number, b: number;
        if (s === 0)
        {
            r = g = b = l;
        }
        else
        {
            /** @name        q
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned q value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;

            /** @name        p
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    /** @name        ParseHexRgba
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ParseHexRgba value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ParseHexRgba
    (
        ...args: Parameters<typeof parseHexRgba>
    ): ReturnType<typeof parseHexRgba>
    {
        return parseHexRgba(...args);
    }
    /** @name        RgbToHex
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned RgbToHex value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function RgbToHex
    (
        ...args: Parameters<typeof rgbToHex>
    ): ReturnType<typeof rgbToHex>
    {
        return rgbToHex(...args);
    }
    /** @name        RgbToHsl
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned RgbToHsl value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function RgbToHsl
    (
        ...args: Parameters<typeof rgbToHsl>
    ): ReturnType<typeof rgbToHsl>
    {
        return rgbToHsl(...args);
    }
    /** @name        HslToRgb
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned HslToRgb value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function HslToRgb
    (
        ...args: Parameters<typeof hslToRgb>
    ): ReturnType<typeof hslToRgb>
    {
        return hslToRgb(...args);
    }
    /** @class       GraphicsColorPicker
     *  @public
     *  @description AriannA GraphicsColorPicker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-graphics-color-picker', {}, {
        Attributes: ['color', 'alpha', 'show-hex', 'show-rgb', 'show-hsl'],
    })
    export class GraphicsColorPicker extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        state$
         *  @public
         *  @type        {GraphicsColorPicker.Types.Signal<GraphicsColorPicker.Interfaces.PickerState>}
         *  @description Component member for state$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        state$: Types.Signal<Interfaces.PickerState> = signal<Interfaces.PickerState>({ h: 325, s: 90, l: 47, a: 1 });

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {GraphicsColorPicker.Interfaces.ColorPickerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ColorPickerOptions = {})
        {
            // Reactive predicates
            this.showHex = () => this.getAttribute('show-hex') !== 'false';
            this.showRGB = () => this.getAttribute('show-rgb') !== 'false';
            this.showHSL = () => this.getAttribute('show-hsl') !== 'false';
            this.showAlpha = () => this.hasAttribute('alpha');
            // Reactive geometry: dot positions, gradients, input values
            this.svBg = () => `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)),
                          linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
                          hsl(${this.state$.Get().h}, 100%, 50%)`;
            this.svDotStyle = () => {
                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = this.state$.Get();
                return `left:${s.s}%; top:${100 - s.l}%`;
            };
            this.hueDotStyle = () => `top:${(this.state$.Get().h / 360) * 100}%`;
            this.previewStyle = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.#color();
                return c.a < 1 ? `background: rgba(${c.r},${c.g},${c.b},${c.a})` : `background: ${c.hex}`;
            };
            this.hexVal = () => this.#color().hex;
            this.rVal = () => String(this.#color().r);
            this.gVal = () => String(this.#color().g);
            this.bVal = () => String(this.#color().b);
            this.hVal = () => String(Math.round(this.state$.Get().h));
            this.sVal = () => String(Math.round(this.state$.Get().s));
            this.lVal = () => String(Math.round(this.state$.Get().l));
            this.aVal = () => String(this.state$.Get().a);
            // SV square drag: pointermove + buttons-down updates h/s/l
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
                const x = Math.max(0, Math.min(rect.width, me.clientX - rect.left));

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = Math.max(0, Math.min(rect.height, me.clientY - rect.top));

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();
                this.state$.Set({
                    ...cur,
                    s: (x / rect.width) * 100,
                    l: (1 - y / rect.height) * 100,
                });
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
                const y = Math.max(0, Math.min(rect.height, me.clientY - rect.top));

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();
                this.state$.Set({ ...cur, h: (y / rect.height) * 360 });
                this.#emit();
            };
            this.onHexChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value.trim();
                if (parseHexRgba(v))
                    this.setColor(v);
            };
            this.onRgbChange = () => {
                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = parseInt((this.querySelector('[data-r="r"]') as HTMLInputElement)?.value ?? '0', 10) || 0;

                /** @name        g
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned g value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const g = parseInt((this.querySelector('[data-r="g"]') as HTMLInputElement)?.value ?? '0', 10) || 0;

                /** @name        b
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned b value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const b = parseInt((this.querySelector('[data-r="b"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
                this.setColor({ r, g, b });
            };
            this.onHslChange = () => {
                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = parseInt((this.querySelector('[data-r="h"]') as HTMLInputElement)?.value ?? '0', 10) || 0;

                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = parseInt((this.querySelector('[data-r="s"]') as HTMLInputElement)?.value ?? '0', 10) || 0;

                /** @name        l
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned l value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const l = parseInt((this.querySelector('[data-r="l"]') as HTMLInputElement)?.value ?? '0', 10) || 0;
                this.setColor({ h, s, l });
            };
            this.onAlphaInput = (e: Event) => {
                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = parseFloat((e.target as HTMLInputElement).value);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();
                this.state$.Set({ ...cur, a: Math.max(0, Math.min(1, a)) });
                this.#emit();
            };
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {GraphicsColorPicker.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = GraphicsColorPicker.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        getColor
         *  @public
         *  @type        {GraphicsColorPicker.Interfaces.Color}
         *  @description Component member for get Color.
         *  @returns     {GraphicsColorPicker.Interfaces.Color} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getColor(): Interfaces.Color { return this.#color(); }

        /** @name        setColor
         *  @public
         *  @type        {this}
         *  @description Component member for set Color.
         *  @param       {string | Partial<GraphicsColorPicker.Interfaces.RGB> | Partial<GraphicsColorPicker.Interfaces.HSL> | {
            a?: number;
        }} c Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setColor(c: string | Partial<Interfaces.RGB> | Partial<Interfaces.HSL> | {
            /** @name        a
             *  @public
             *  @type        {number}
             *  @description Component member for a.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            a?: number;
        }): this {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();

            /** @name        next
             *  @public
             *  @type        {GraphicsColorPicker.Interfaces.PickerState}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next: Interfaces.PickerState = { ...cur };
            if (typeof c === 'string')
            {
                /** @name        p
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned p value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const p = parseHexRgba(c);
                if (p)
                {
                    /** @name        hsl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned hsl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const hsl = rgbToHsl(p.r, p.g, p.b);
                    next.h = hsl.h;
                    next.s = hsl.s;
                    next.l = hsl.l;
                    if (p.a !== undefined)
                        next.a = p.a;
                }
            }
            else if (c)
            {
                if ('r' in c || 'g' in c || 'b' in c)
                {
                    /** @name        curRgb
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned curRgb value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const curRgb = hslToRgb(cur.h, cur.s, cur.l);

                    /** @name        r
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned r value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const r = Math.max(0, Math.min(255, Math.round((c as Interfaces.RGB).r ?? curRgb.r)));

                    /** @name        g
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned g value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const g = Math.max(0, Math.min(255, Math.round((c as Interfaces.RGB).g ?? curRgb.g)));

                    /** @name        b
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned b value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const b = Math.max(0, Math.min(255, Math.round((c as Interfaces.RGB).b ?? curRgb.b)));

                    /** @name        hsl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned hsl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const hsl = rgbToHsl(r, g, b);
                    next.h = hsl.h;
                    next.s = hsl.s;
                    next.l = hsl.l;
                }
                else if ('h' in c || 's' in c || 'l' in c)
                {
                    if ('h' in c)
                        next.h = (((c.h as number) % 360) + 360) % 360;
                    if ('s' in c)
                        next.s = Math.max(0, Math.min(100, c.s as number));
                    if ('l' in c)
                        next.l = Math.max(0, Math.min(100, c.l as number));
                }
                if ('a' in c && typeof c.a === 'number')
                {
                    next.a = Math.max(0, Math.min(1, c.a));
                }
            }
            this.state$.Set(next);
            this.#emit();
            return this;
        }

        /** @name        #color
         *  @public
         *  @type        {GraphicsColorPicker.Interfaces.Color}
         *  @description Component member for color.
         *  @returns     {GraphicsColorPicker.Interfaces.Color} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #color(): Interfaces.Color
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
            const rgb = hslToRgb(s.h, s.s, s.l);
            return {
                hex: rgbToHex(rgb.r, rgb.g, rgb.b),
                r: rgb.r, g: rgb.g, b: rgb.b,
                h: s.h, s: s.s, l: s.l,
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
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: this.#color(),
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
        onUpdate() { }

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
        // Template helpers
        /** @name        showHex
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Hex.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showHex: () => boolean = () => true;

        /** @name        showRGB
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show RGB.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showRGB: () => boolean = () => true;

        /** @name        showHSL
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show HSL.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showHSL: () => boolean = () => true;

        /** @name        showAlpha
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Alpha.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showAlpha: () => boolean = () => false;

        /** @name        svBg
         *  @private
         *  @type        {() => string}
         *  @description Component member for sv Bg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svBg: () => string = () => '';

        /** @name        svDotStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for sv Dot Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svDotStyle: () => string = () => '';

        /** @name        hueDotStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for hue Dot Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hueDotStyle: () => string = () => '';

        /** @name        previewStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewStyle: () => string = () => '';

        /** @name        hexVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for hex Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hexVal: () => string = () => '';

        /** @name        rVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for r Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private rVal: () => string = () => '0';

        /** @name        gVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for g Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private gVal: () => string = () => '0';

        /** @name        bVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for b Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private bVal: () => string = () => '0';

        /** @name        hVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for h Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hVal: () => string = () => '0';

        /** @name        sVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for s Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private sVal: () => string = () => '0';

        /** @name        lVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for l Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private lVal: () => string = () => '0';

        /** @name        aVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for a Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private aVal: () => string = () => '1';

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

        /** @name        onHexChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Hex Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHexChange: (e: Event) => void = () => { };

        /** @name        onRgbChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Rgb Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRgbChange: (e: Event) => void = () => { };

        /** @name        onHslChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Hsl Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHslChange: (e: Event) => void = () => { };

        /** @name        onAlphaInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Alpha Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAlphaInput: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {GraphicsColorPicker.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {GraphicsColorPicker.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    gap: '8px',
                    padding: '10px',
                    userSelect: 'none',
                    width: '240px',
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
                    backgroundImage: 'linear-gradient(45deg,#bbb 25%,transparent 25%),' +
                        'linear-gradient(-45deg,#bbb 25%,transparent 25%),' +
                        'linear-gradient(45deg,transparent 75%,#bbb 75%),' +
                        'linear-gradient(-45deg,transparent 75%,#bbb 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                }),
                new Rule('.ar-cp__alpha', { flex: '1', cursor: 'pointer' }),
            ]);
        }
    }
}
export default GraphicsColorPicker;

export const parseHexRgba = GraphicsColorPicker.parseHexRgba;
export const rgbToHex = GraphicsColorPicker.rgbToHex;
export const rgbToHsl = GraphicsColorPicker.rgbToHsl;
export const hslToRgb = GraphicsColorPicker.hslToRgb;

export type RGB = GraphicsColorPicker.Interfaces.RGB;
export type HSL = GraphicsColorPicker.Interfaces.HSL;
export type Color = GraphicsColorPicker.Interfaces.Color;
export type ColorPickerOptions = GraphicsColorPicker.Interfaces.ColorPickerOptions;
