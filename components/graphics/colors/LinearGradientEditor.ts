/**
 * @module    components/graphics/colors/LinearGradientEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA LinearGradientEditor component module.
 */

import { Component, Components, Css, Templates } from '../../../core/index.ts';
import { type GradientStop, type RGBA, makeStopState, stopsToCss, clamp01, colorFieldHex, parseColorString, } from './GradientEditor.ts';

/** @namespace   LinearGradientEditor
 *  @public
 *  @description Namespace containing LinearGradientEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace LinearGradientEditor
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
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

        /** @name        GradientInterp
         *  @public
         *  @type        {'srgb' | 'oklab' | 'oklch' | 'hsl'}
         *  @description Type alias for GradientInterp.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type GradientInterp = 'srgb' | 'oklab' | 'oklch' | 'hsl';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   LinearGradientEditorOptions
         *  @public
         *  @description LinearGradientEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LinearGradientEditorOptions
        {
            /** @name        stops
             *  @public
             *  @type        {GradientStop[]}
             *  @description Component member for stops.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            stops?: GradientStop[];

            /** @name        angle
             *  @public
             *  @type        {number}
             *  @description Component member for angle.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            angle?: number;

            /** @name        interp
             *  @public
             *  @type        {LinearGradientEditor.Types.GradientInterp}
             *  @description Component member for interp.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            interp?: Types.GradientInterp;

            /** @name        alpha
             *  @public
             *  @type        {boolean}
             *  @description Component member for alpha.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            alpha?: boolean;
        }
    }

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

    /** @class       LinearGradientEditor
     *  @public
     *  @description AriannA LinearGradientEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-linear-gradient-editor', {}, {
        Attributes: ['angle', 'interp'],
    })
    export class LinearGradientEditor extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        state
         *  @public
         *  @type        {unknown}
         *  @description Component member for state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        state = makeStopState();

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {LinearGradientEditor.Interfaces.LinearGradientEditorOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.LinearGradientEditorOptions = {})
        {
            /** @name        angleAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned angleAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const angleAttr = this.signal().attribute('angle');

            /** @name        interpAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned interpAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const interpAttr = this.signal().attribute('interp');

            /** @name        angle
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned angle value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const angle = () => parseFloat(angleAttr.Get() ?? '90') || 0;

            /** @name        interp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned interp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const interp = (): Types.GradientInterp => (interpAttr.Get() as Types.GradientInterp | null) ?? 'srgb';
            this.stripBg = () => `background: linear-gradient(to right, ${stopsToCss(this.state.stops$.Get())})`;
            this.previewBg = () => `background: ${this.toCSS()}`;
            this.angleVal = () => String(angle());
            this.pins = (): Array<{
                /** @name        left
                 *  @public
                 *  @type        {string}
                 *  @description Component member for left.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                left: string;

                /** @name        bg
                 *  @public
                 *  @type        {string}
                 *  @description Component member for bg.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                bg: string;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;

                /** @name        title
                 *  @public
                 *  @type        {string}
                 *  @description Component member for title.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                title: string;

                /** @name        idx
                 *  @public
                 *  @type        {number}
                 *  @description Component member for idx.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                idx: number;
            }> => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.state.selected$.Get();
                return this.state.stops$.Get().map((s: any, i: any) => ({
                    left: `left: ${s.t * 100}%; background: ${colorFieldHex(s.color)}`,
                    bg: colorFieldHex(s.color),
                    cls: 'ar-grad__pin' + (i === sel ? ' ar-grad__pin--sel' : ''),
                    title: `${colorFieldHex(s.color)} @ ${(s.t * 100).toFixed(1)}%`,
                    idx: i,
                }));
            };
            this.hasSel = () => this.state.stops$.Get().length > 0;
            this.selStop = (): GradientStop => this.state.stops$.Get()[this.state.selected$.Get()] ?? this.state.stops$.Get()[0]!;
            this.selHex = () => colorFieldHex(this.selStop().color);
            this.selT = () => (this.selStop().t * 100).toFixed(1);
            this.selA = () => (this.selStop().color.a ?? 1).toFixed(2);
            this.interpIs = (v: string) => interp() === v;
            // ── Handlers ─────────────────────────────────────────────────────
            this.onStripClick = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;
                // Only treat as add-stop when click is on the strip itself, not on a pin
                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = me.target as HTMLElement;
                if (target.classList.contains('ar-grad__pin'))
                    return;

                /** @name        strip
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned strip value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const strip = me.currentTarget as HTMLElement;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = strip.getBoundingClientRect();

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = (me.clientX - rect.left) / rect.width;
                this.state.addStop(t);
                this.#fire();
            };
            this.onPinPointer = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                me.stopPropagation();

                /** @name        pin
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pin value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pin = me.currentTarget as HTMLElement;

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = parseInt(pin.dataset.idx ?? '0', 10);
                if (me.type === 'pointerdown')
                {
                    pin.setPointerCapture?.(me.pointerId);
                    this.state.selected$.Set(idx);
                }
                else if (!(me.buttons & 1))
                    return;

                /** @name        strip
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned strip value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const strip = pin.parentElement?.previousElementSibling as HTMLElement | null;
                if (!strip)
                    return;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = strip.getBoundingClientRect();

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = clamp01((me.clientX - rect.left) / rect.width);
                this.state.updateStop(idx, { t });
                this.#fire();
            };
            this.onPinDblClick = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;
                me.stopPropagation();

                /** @name        pin
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pin value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pin = me.currentTarget as HTMLElement;

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = parseInt(pin.dataset.idx ?? '0', 10);
                this.state.removeStop(idx);
                this.#fire();
            };
            this.onAngleChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseFloat((e.target as HTMLInputElement).value) || 0;
                this.setAngle(v);
            };
            this.onInterpChange = (e: Event) => {
                this.setInterp((e.target as HTMLSelectElement).value as Types.GradientInterp);
            };
            this.onSelColorChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value;

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = parseColorString(v);
                if (c)
                {
                    /** @name        idx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned idx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const idx = this.state.selected$.Get();

                    /** @name        cur
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cur value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cur = this.selStop();
                    this.state.updateStop(idx, { color: { ...c, a: cur.color.a } });
                    this.#fire();
                }
            };
            this.onSelPosChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseFloat((e.target as HTMLInputElement).value) / 100;
                this.state.updateStop(this.state.selected$.Get(), { t: clamp01(v) });
                this.#fire();
            };
            this.onSelAlphaChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseFloat((e.target as HTMLInputElement).value);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.selStop();
                this.state.updateStop(this.state.selected$.Get(), {
                    color: { ...cur.color, a: Math.max(0, Math.min(1, v)) },
                });
                this.#fire();
            };
            this.onRemove = () => {
                this.state.removeStop(this.state.selected$.Get());
                this.#fire();
            };
            this.template = html `
            <div class="ar-grad__row">
                <div class="ar-grad__col">
                    <div class="ar-grad__strip" :style="this.stripBg()" @click="this.onStripClick"></div>
                    <div class="ar-grad__pins">
                        <div a-for="p in this.pins()"
                             :class="p.cls"
                             :style="p.left"
                             :data-idx="p.idx"
                             :title="p.title"
                             @pointerdown="this.onPinPointer"
                             @pointermove="this.onPinPointer"
                             @dblclick="this.onPinDblClick"></div>
                    </div>
                    <div class="ar-grad__field" style="margin-top:10px">
                        <span>Angle</span>
                        <input type="number" min="0" max="360" step="1"
                               :value="this.angleVal()" @change="this.onAngleChange"/>°
                        <span style="margin-left:10px">Space</span>
                        <select @change="this.onInterpChange">
                            <option value="srgb"  :selected="this.interpIs('srgb')">sRGB</option>
                            <option value="oklab" :selected="this.interpIs('oklab')">OKLab</option>
                            <option value="oklch" :selected="this.interpIs('oklch')">OKLCH</option>
                            <option value="hsl"   :selected="this.interpIs('hsl')">HSL</option>
                        </select>
                    </div>
                    <div class="ar-grad__preview" :style="this.previewBg()" style="margin-top:10px"></div>
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {LinearGradientEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = LinearGradientEditor.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setAngle
         *  @public
         *  @type        {this}
         *  @description Component member for set Angle.
         *  @param       {number} deg Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setAngle(deg: number): this
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = ((deg % 360) + 360) % 360;
            this.setAttribute('angle', String(v));
            this.#fire();
            return this;
        }

        /** @name        getAngle
         *  @public
         *  @type        {number}
         *  @description Component member for get Angle.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getAngle(): number { return parseFloat(this.getAttribute('angle') ?? '90') || 0; }

        /** @name        setInterp
         *  @public
         *  @type        {this}
         *  @description Component member for set Interp.
         *  @param       {LinearGradientEditor.Types.GradientInterp} s Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setInterp(s: Types.GradientInterp): this
        {
            this.setAttribute('interp', s);
            this.#fire();
            return this;
        }

        /** @name        getInterp
         *  @public
         *  @type        {LinearGradientEditor.Types.GradientInterp}
         *  @description Component member for get Interp.
         *  @returns     {LinearGradientEditor.Types.GradientInterp} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getInterp(): Types.GradientInterp { return (this.getAttribute('interp') as Types.GradientInterp) || 'srgb'; }

        /** @name        setStops
         *  @public
         *  @type        {this}
         *  @description Component member for set Stops.
         *  @param       {GradientStop[]} s Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setStops(s: GradientStop[]): this { this.state.setStops(s); this.#fire(); return this; }

        /** @name        getStops
         *  @public
         *  @type        {GradientStop[]}
         *  @description Component member for get Stops.
         *  @returns     {GradientStop[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getStops(): GradientStop[] { return this.state.stops$.Get().map((x: any) => ({ ...x, color: { ...x.color } })); }

        /** @name        toCSS
         *  @public
         *  @type        {string}
         *  @description Component member for to CSS.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toCSS(): string
        {
            /** @name        stops
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned stops value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const stops = stopsToCss(this.state.stops$.Get());

            /** @name        interp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned interp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const interp = this.getInterp();

            /** @name        space
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned space value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const space = interp === 'srgb' ? '' : ` in ${interp}`;
            return `linear-gradient(${this.getAngle()}deg${space}, ${stops})`;
        }

        /** @name        #fire
         *  @public
         *  @type        {void}
         *  @description Component member for fire.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fire(): void
        {
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true,
                detail: {
                    stops: this.getStops(),
                    angle: this.getAngle(),
                    interp: this.getInterp(),
                    css: this.toCSS(),
                },
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
        onMount() { }

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

        /** @name        stripBg
         *  @private
         *  @type        {() => string}
         *  @description Component member for strip Bg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private stripBg: () => string = () => '';

        /** @name        previewBg
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Bg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewBg: () => string = () => '';

        /** @name        angleVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for angle Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private angleVal: () => string = () => '90';

        /** @name        pins
         *  @private
         *  @type        {() => Array<{
            left: string;
            bg: string;
            cls: string;
            title: string;
            idx: number;
        }>}
         *  @description Component member for pins.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private pins: () => Array<{
            /** @name        left
             *  @public
             *  @type        {string}
             *  @description Component member for left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            left: string;

            /** @name        bg
             *  @public
             *  @type        {string}
             *  @description Component member for bg.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bg: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title: string;

            /** @name        idx
             *  @public
             *  @type        {number}
             *  @description Component member for idx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            idx: number;
        }> = () => [];

        /** @name        hasSel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Sel.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasSel: () => boolean = () => false;

        /** @name        selStop
         *  @private
         *  @type        {() => GradientStop}
         *  @description Component member for sel Stop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selStop: () => GradientStop = () => ({ t: 0, color: { r: 0, g: 0, b: 0, a: 1 } });

        /** @name        selHex
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel Hex.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selHex: () => string = () => '#000000';

        /** @name        selT
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel T.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selT: () => string = () => '0';

        /** @name        selA
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel A.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selA: () => string = () => '1';

        /** @name        interpIs
         *  @private
         *  @type        {(v: string) => boolean}
         *  @description Component member for interp Is.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private interpIs: (v: string) => boolean = () => false;

        /** @name        onStripClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Strip Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onStripClick: (e: Event) => void = () => { };

        /** @name        onPinPointer
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pin Pointer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPinPointer: (e: Event) => void = () => { };

        /** @name        onPinDblClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pin Dbl Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPinDblClick: (e: Event) => void = () => { };

        /** @name        onAngleChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Angle Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAngleChange: (e: Event) => void = () => { };

        /** @name        onInterpChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Interp Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInterpChange: (e: Event) => void = () => { };

        /** @name        onSelColorChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel Color Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelColorChange: (e: Event) => void = () => { };

        /** @name        onSelPosChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel Pos Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelPosChange: (e: Event) => void = () => { };

        /** @name        onSelAlphaChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel Alpha Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelAlphaChange: (e: Event) => void = () => { };

        /** @name        onRemove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Remove.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRemove: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {LinearGradientEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {LinearGradientEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet { return LinearGradientEditor.SharedSheet(); }

        /** Shared between Linear / Radial / Shape editors. */
        static SharedSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    gap: '10px',
                    padding: '12px',
                }),
                new Rule('.ar-grad__row', {
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                }),
                new Rule('.ar-grad__col', { flex: '1', minWidth: '0' }),
                new Rule('.ar-grad__strip', {
                    position: 'relative', height: '30px',
                    borderRadius: '3px', cursor: 'copy',
                    boxShadow: 'inset 0 0 0 1px var(--arianna-border, #d8d8d8)',
                    backgroundImage: 'linear-gradient(45deg, #bbb 25%, transparent 25%),' +
                        'linear-gradient(-45deg, #bbb 25%, transparent 25%),' +
                        'linear-gradient(45deg, transparent 75%, #bbb 75%),' +
                        'linear-gradient(-45deg, transparent 75%, #bbb 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                }),
                new Rule('.ar-grad__pins', { position: 'relative', height: '14px' }),
                new Rule('.ar-grad__pin', {
                    position: 'absolute', top: '0',
                    width: '12px', height: '14px',
                    transform: 'translateX(-50%)',
                    border: '2px solid #fff', borderRadius: '2px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                    cursor: 'grab',
                    touchAction: 'none',
                }),
                new Rule('.ar-grad__pin--sel', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    transform: 'translateX(-50%) scale(1.15)',
                }),
                new Rule('.ar-grad__field', {
                    display: 'flex', gap: '8px', alignItems: 'center',
                }),
                new Rule('.ar-grad__field span', {
                    width: '70px',
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-grad__field input[type="text"], .ar-grad__field input[type="number"]', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '4px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '2px',
                    flex: '1', minWidth: '0',
                }),
                new Rule('.ar-grad__field input[type="color"]', {
                    width: '30px', height: '24px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '0', background: 'transparent',
                    cursor: 'pointer',
                }),
                new Rule('.ar-grad__field input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-grad__field select', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '4px 6px',
                    font: '11px sans-serif',
                    borderRadius: '2px',
                }),
                new Rule('.ar-grad__btns', { marginTop: '6px' }),
                new Rule('.ar-grad__btn', {
                    background: 'transparent',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '5px 10px',
                    font: '11px sans-serif',
                    borderRadius: '3px',
                    cursor: 'pointer',
                }),
                new Rule('.ar-grad__btn:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-grad__btn--danger:hover', {
                    background: 'var(--arianna-danger, #cf222e)',
                    borderColor: 'var(--arianna-danger, #cf222e)',
                    color: '#fff',
                }),
                new Rule('.ar-grad__preview', {
                    width: '100%', height: '60px',
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 0 1px var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-grad__inspector', {
                    width: '240px', flexShrink: '0',
                    display: 'flex', flexDirection: 'column',
                    gap: '6px',
                }),
                new Rule('.ar-grad__center-pad', {
                    position: 'relative',
                    width: '120px', height: '120px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '4px',
                    cursor: 'crosshair',
                    touchAction: 'none',
                }),
                new Rule('.ar-grad__center-dot', {
                    position: 'absolute',
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    background: 'var(--arianna-primary, #1f6feb)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                }),
                new Rule('.ar-grad__mesh-canvas', {
                    width: '320px', height: '240px',
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 0 1px var(--arianna-border, #d8d8d8)',
                    cursor: 'crosshair',
                    touchAction: 'none',
                }),
                new Rule('.ar-grad__mesh-pt', {
                    position: 'absolute',
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'grab',
                    touchAction: 'none',
                }),
            ]);
        }
    }
}
export default LinearGradientEditor;

export type GradientInterp = LinearGradientEditor.Types.GradientInterp;
export type LinearGradientEditorOptions = LinearGradientEditor.Interfaces.LinearGradientEditorOptions;
