/**
 * @module    components/graphics/colors/ColorPickerWheel
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ColorPickerWheel component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import { parseHexRgba, rgbToHsl, hslToRgb, rgbToHex } from './GraphicsColorPicker.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   ColorPickerWheel
 *  @public
 *  @description Namespace containing ColorPickerWheel contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ColorPickerWheel
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
        /** @interface   ColorPickerWheelOptions
         *  @public
         *  @description ColorPickerWheelOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ColorPickerWheelOptions
        {
            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: string;

            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number;
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

    /** @class       ColorPickerWheel
     *  @public
     *  @description AriannA ColorPickerWheel component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-color-picker-wheel', {}, {
        Attributes: ['value', 'size'],
    })
    export class ColorPickerWheel extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        hue$
         *  @public
         *  @type        {ColorPickerWheel.Types.Signal<number>}
         *  @description Component member for hue$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        hue$: Types.Signal<number> = signal<number>(0);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ColorPickerWheel.Interfaces.ColorPickerWheelOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ColorPickerWheelOptions = {})
        {
            /** @name        sizeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sizeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sizeAttr = this.signal().attribute('size');
            this.dim = () => parseInt(sizeAttr.Get() ?? '200', 10) || 200;
            this.viewBox = () => `0 0 ${this.dim()} ${this.dim()}`;
            this.dimStr = () => String(this.dim());
            this.wedges = (): Array<{
                /** @name        d
                 *  @public
                 *  @type        {string}
                 *  @description Component member for d.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                d: string;

                /** @name        fill
                 *  @public
                 *  @type        {string}
                 *  @description Component member for fill.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fill: string;
            }> => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.dim();

                /** @name        cx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cx = d / 2, cy = d / 2;

                /** @name        rOuter
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rOuter value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rOuter = d / 2 - 4;

                /** @name        rInner
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rInner value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rInner = rOuter - 20;

                /** @name        out
                 *  @public
                 *  @type        {Array<{
                    d: string;
                    fill: string;
                }>}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Array<{
                    /** @name        d
                     *  @public
                     *  @type        {string}
                     *  @description Component member for d.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    d: string;

                    /** @name        fill
                     *  @public
                     *  @type        {string}
                     *  @description Component member for fill.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    fill: string;
                }> = [];
                for (let h = 0; h < 360; h += 2)
                {
                    /** @name        a0
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned a0 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const a0 = (h - 1) * Math.PI / 180;

                    /** @name        a1
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned a1 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const a1 = (h + 1) * Math.PI / 180;

                    /** @name        x0o
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x0o value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x0o = cx + rOuter * Math.cos(a0), y0o = cy + rOuter * Math.sin(a0);

                    /** @name        x1o
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x1o value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x1o = cx + rOuter * Math.cos(a1), y1o = cy + rOuter * Math.sin(a1);

                    /** @name        x1i
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x1i value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x1i = cx + rInner * Math.cos(a1), y1i = cy + rInner * Math.sin(a1);

                    /** @name        x0i
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x0i value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x0i = cx + rInner * Math.cos(a0), y0i = cy + rInner * Math.sin(a0);
                    out.push({
                        d: `M${x0o},${y0o} A${rOuter},${rOuter} 0 0,1 ${x1o},${y1o} L${x1i},${y1i} A${rInner},${rInner} 0 0,0 ${x0i},${y0i} Z`,
                        fill: `hsl(${h}, 100%, 50%)`,
                    });
                }
                return out;
            };
            this.dotCx = () => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.dim();

                /** @name        cx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cx = d / 2;

                /** @name        rOuter
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rOuter value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rOuter = d / 2 - 4;

                /** @name        rInner
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rInner value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rInner = rOuter - 20;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = (rInner + rOuter) / 2;
                return String(cx + r * Math.cos(this.hue$.Get() * Math.PI / 180));
            };
            this.dotCy = () => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.dim();

                /** @name        cy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cy = d / 2;

                /** @name        rOuter
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rOuter value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rOuter = d / 2 - 4;

                /** @name        rInner
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rInner value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rInner = rOuter - 20;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = (rInner + rOuter) / 2;
                return String(cy + r * Math.sin(this.hue$.Get() * Math.PI / 180));
            };
            this.onPointer = (e: Event) => {
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
                    (me.currentTarget as SVGElement).setPointerCapture?.(me.pointerId);
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
                const rect = (me.currentTarget as SVGElement).getBoundingClientRect();

                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.dim();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = me.clientX - rect.left - d / 2;

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = me.clientY - rect.top - d / 2;

                /** @name        hue
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hue value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hue = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
                this.hue$.Set(hue);
                this.#emit();
            };
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ColorPickerWheel.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ColorPickerWheel.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setValue
         *  @public
         *  @type        {this}
         *  @description Component member for set Value.
         *  @param       {string} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setValue(v: string): this
        {
            /** @name        p
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p = parseHexRgba(v);
            if (p)
            {
                this.hue$.Set(rgbToHsl(p.r, p.g, p.b).h);
            }
            else
            {
                // Try hsl(...) form
                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = /hsl\(\s*(\d+(?:\.\d+)?)/.exec(v);
                if (m)
                    this.hue$.Set(parseFloat(m[1]!));
            }
            return this;
        }

        /** @name        getValue
         *  @public
         *  @type        {string}
         *  @description Component member for get Value.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getValue(): string
        {
            /** @name        rgb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rgb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rgb = hslToRgb(this.hue$.Get(), 100, 50);
            return rgbToHex(rgb.r, rgb.g, rgb.b);
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
            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = this.hue$.Get();

            /** @name        rgb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rgb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rgb = hslToRgb(h, 100, 50);

            /** @name        hex
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hex value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true,
                detail: { hex, hue: h, hslString: `hsl(${h.toFixed(0)}, 100%, 50%)` },
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
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.getAttribute('value');
            if (v)
                this.setValue(v);
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

        /** @name        dim
         *  @private
         *  @type        {() => number}
         *  @description Component member for dim.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dim: () => number = () => 200;

        /** @name        viewBox
         *  @private
         *  @type        {() => string}
         *  @description Component member for view Box.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private viewBox: () => string = () => '0 0 200 200';

        /** @name        dimStr
         *  @private
         *  @type        {() => string}
         *  @description Component member for dim Str.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dimStr: () => string = () => '200';

        /** @name        wedges
         *  @private
         *  @type        {() => Array<{
            d: string;
            fill: string;
        }>}
         *  @description Component member for wedges.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private wedges: () => Array<{
            /** @name        d
             *  @public
             *  @type        {string}
             *  @description Component member for d.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            d: string;

            /** @name        fill
             *  @public
             *  @type        {string}
             *  @description Component member for fill.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            fill: string;
        }> = () => [];

        /** @name        dotCx
         *  @private
         *  @type        {() => string}
         *  @description Component member for dot Cx.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dotCx: () => string = () => '0';

        /** @name        dotCy
         *  @private
         *  @type        {() => string}
         *  @description Component member for dot Cy.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dotCy: () => string = () => '0';

        /** @name        onPointer
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pointer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPointer: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ColorPickerWheel.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ColorPickerWheel.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 10px)',
                    display: 'inline-block',
                    padding: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }),
                new Rule(':host svg', {
                    display: 'block',
                    cursor: 'crosshair',
                    touchAction: 'none',
                }),
            ]);
        }
    }
}
export default ColorPickerWheel;

export type ColorPickerWheelOptions = ColorPickerWheel.Interfaces.ColorPickerWheelOptions;
