/**
 * @module    components/graphics/colors/RadialGradientEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA RadialGradientEditor component module.
 */

import { Component, Components, Css, Templates } from '../../../core/index.ts';
import { LinearGradientEditor } from './LinearGradientEditor.ts';
import { type GradientStop, makeStopState, stopsToCss, clamp01, colorFieldHex, parseColorString, } from './GradientEditor.ts';

/** @namespace   RadialGradientEditor
 *  @public
 *  @description Namespace containing RadialGradientEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace RadialGradientEditor
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

        /** @name        RadialShape
         *  @public
         *  @type        {'circle' | 'ellipse'}
         *  @description Type alias for RadialShape.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type RadialShape = 'circle' | 'ellipse';

        /** @name        RadialSize
         *  @public
         *  @type        {'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner'}
         *  @description Type alias for RadialSize.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type RadialSize = 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   RadialGradientEditorOptions
         *  @public
         *  @description RadialGradientEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RadialGradientEditorOptions
        {
            /** @name        stops
             *  @public
             *  @type        {GradientStop[]}
             *  @description Component member for stops.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            stops?: GradientStop[];

            /** @name        shape
             *  @public
             *  @type        {RadialGradientEditor.Types.RadialShape}
             *  @description Component member for shape.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            shape?: Types.RadialShape;

            /** @name        size
             *  @public
             *  @type        {RadialGradientEditor.Types.RadialSize}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: Types.RadialSize;

            /** @name        cx
             *  @public
             *  @type        {number}
             *  @description Component member for cx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cx?: number;

            /** @name        cy
             *  @public
             *  @type        {number}
             *  @description Component member for cy.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cy?: number;

            /** @name        interp
             *  @public
             *  @type        {'srgb' | 'oklab' | 'oklch' | 'hsl'}
             *  @description Component member for interp.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            interp?: 'srgb' | 'oklab' | 'oklch' | 'hsl';
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

    /** @class       RadialGradientEditor
     *  @public
     *  @description AriannA RadialGradientEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-radial-gradient-editor', {}, {
        Attributes: ['shape', 'size', 'cx', 'cy', 'interp'],
    })
    export class RadialGradientEditor extends HTMLElement
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
         *  @param       {RadialGradientEditor.Interfaces.RadialGradientEditorOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.RadialGradientEditorOptions = {})
        {
            /** @name        shapeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned shapeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const shapeAttr = this.signal().attribute('shape');

            /** @name        sizeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sizeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sizeAttr = this.signal().attribute('size');

            /** @name        cxAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cxAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cxAttr = this.signal().attribute('cx');

            /** @name        cyAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cyAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cyAttr = this.signal().attribute('cy');

            /** @name        interpAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned interpAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const interpAttr = this.signal().attribute('interp');

            /** @name        shape
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned shape value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const shape = (): Types.RadialShape => (shapeAttr.Get() as Types.RadialShape | null) ?? 'circle';

            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = (): Types.RadialSize => (sizeAttr.Get() as Types.RadialSize | null) ?? 'farthest-corner';

            /** @name        cx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cx = () => parseFloat(cxAttr.Get() ?? '50') || 0;

            /** @name        cy
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cy value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cy = () => parseFloat(cyAttr.Get() ?? '50') || 0;

            /** @name        interp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned interp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const interp = (): 'srgb' | 'oklab' | 'oklch' | 'hsl' => (interpAttr.Get() as 'srgb' | 'oklab' | 'oklch' | 'hsl' | null) ?? 'srgb';
            this.stripBg = () => `background: linear-gradient(to right, ${stopsToCss(this.state.stops$.Get())})`;
            this.previewBg = () => `background: ${this.toCSS()}`;
            this.shapeIs = (v: string) => shape() === v;
            this.sizeIs = (v: string) => size() === v;
            this.interpIs = (v: string) => interp() === v;
            this.cxVal = () => String(cx());
            this.cyVal = () => String(cy());
            this.centerDotStyle = () => `left: ${cx()}%; top: ${cy()}%`;
            this.pins = () => {
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
                    cls: 'ar-grad__pin' + (i === sel ? ' ar-grad__pin--sel' : ''),
                    title: `${colorFieldHex(s.color)} @ ${(s.t * 100).toFixed(1)}%`,
                    idx: i,
                }));
            };
            this.hasSel = () => this.state.stops$.Get().length > 0;
            this.selStop = () => this.state.stops$.Get()[this.state.selected$.Get()] ?? this.state.stops$.Get()[0]!;
            this.selHex = () => colorFieldHex(this.selStop().color);
            this.selT = () => (this.selStop().t * 100).toFixed(1);
            this.selA = () => (this.selStop().color.a ?? 1).toFixed(2);
            // ── Handlers ────────────────────────────────────────────────────
            this.onStripClick = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;

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
                this.state.addStop((me.clientX - rect.left) / rect.width);
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
                this.state.updateStop(idx, { t: clamp01((me.clientX - rect.left) / rect.width) });
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

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = parseInt((me.currentTarget as HTMLElement).dataset.idx ?? '0', 10);
                this.state.removeStop(idx);
                this.#fire();
            };
            this.onShapeChange = (e: Event) => this.setShape((e.target as HTMLSelectElement).value as Types.RadialShape);
            this.onSizeChange = (e: Event) => this.setSize((e.target as HTMLSelectElement).value as Types.RadialSize);
            this.onInterpChange = (e: Event) => this.setInterp((e.target as HTMLSelectElement).value as 'srgb' | 'oklab' | 'oklch' | 'hsl');
            this.onCxChange = (e: Event) => this.setCenter(parseFloat((e.target as HTMLInputElement).value) || 0, cy());
            this.onCyChange = (e: Event) => this.setCenter(cx(), parseFloat((e.target as HTMLInputElement).value) || 0);
            this.onCenterPad = (e: Event) => {
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

                /** @name        nx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const nx = Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100));

                /** @name        ny
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ny value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ny = Math.max(0, Math.min(100, ((me.clientY - rect.top) / rect.height) * 100));
                this.setCenter(nx, ny);
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
                    /** @name        cur
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cur value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cur = this.selStop();
                    this.state.updateStop(this.state.selected$.Get(), { color: { ...c, a: cur.color.a } });
                    this.#fire();
                }
            };
            this.onSelPosChange = (e: Event) => {
                this.state.updateStop(this.state.selected$.Get(), {
                    t: clamp01(parseFloat((e.target as HTMLInputElement).value) / 100),
                });
                this.#fire();
            };
            this.onSelAlphaChange = (e: Event) => {
                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.selStop();
                this.state.updateStop(this.state.selected$.Get(), {
                    color: { ...cur.color, a: Math.max(0, Math.min(1, parseFloat((e.target as HTMLInputElement).value))) },
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {RadialGradientEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = LinearGradientEditor.LinearGradientEditor.SharedSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setShape
         *  @public
         *  @type        {this}
         *  @description Component member for set Shape.
         *  @param       {RadialGradientEditor.Types.RadialShape} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setShape(v: Types.RadialShape): this { this.setAttribute('shape', v); this.#fire(); return this; }

        /** @name        setSize
         *  @public
         *  @type        {this}
         *  @description Component member for set Size.
         *  @param       {RadialGradientEditor.Types.RadialSize} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setSize(v: Types.RadialSize): this { this.setAttribute('size', v); this.#fire(); return this; }

        /** @name        setCenter
         *  @public
         *  @type        {this}
         *  @description Component member for set Center.
         *  @param       {number} cx Parameter.
         *  @param       {number} cy Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setCenter(cx: number, cy: number): this
        {
            this.setAttribute('cx', String(Math.max(0, Math.min(100, cx))));
            this.setAttribute('cy', String(Math.max(0, Math.min(100, cy))));
            this.#fire();
            return this;
        }

        /** @name        setInterp
         *  @public
         *  @type        {this}
         *  @description Component member for set Interp.
         *  @param       {'srgb' | 'oklab' | 'oklch' | 'hsl'} s Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setInterp(s: 'srgb' | 'oklab' | 'oklch' | 'hsl'): this
        {
            this.setAttribute('interp', s);
            this.#fire();
            return this;
        }

        /** @name        getShape
         *  @public
         *  @type        {RadialGradientEditor.Types.RadialShape}
         *  @description Component member for get Shape.
         *  @returns     {RadialGradientEditor.Types.RadialShape} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getShape(): Types.RadialShape { return (this.getAttribute('shape') as Types.RadialShape) || 'circle'; }

        /** @name        getSize
         *  @public
         *  @type        {RadialGradientEditor.Types.RadialSize}
         *  @description Component member for get Size.
         *  @returns     {RadialGradientEditor.Types.RadialSize} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getSize(): Types.RadialSize { return (this.getAttribute('size') as Types.RadialSize) || 'farthest-corner'; }

        /** @name        getCenter
         *  @public
         *  @type        {{
            cx: number;
            cy: number;
        }}
         *  @description Component member for get Center.
         *  @returns     {{
            cx: number;
            cy: number;
        }} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCenter():
        {
            /** @name        cx
             *  @public
             *  @type        {number}
             *  @description Component member for cx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cx: number;

            /** @name        cy
             *  @public
             *  @type        {number}
             *  @description Component member for cy.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cy: number;
        } {
            return {
                cx: parseFloat(this.getAttribute('cx') ?? '50') || 0,
                cy: parseFloat(this.getAttribute('cy') ?? '50') || 0,
            };
        }

        /** @name        getInterp
         *  @public
         *  @type        {'srgb' | 'oklab' | 'oklch' | 'hsl'}
         *  @description Component member for get Interp.
         *  @returns     {'srgb' | 'oklab' | 'oklch' | 'hsl'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getInterp(): 'srgb' | 'oklab' | 'oklch' | 'hsl'
        {
            return (this.getAttribute('interp') as 'srgb' | 'oklab' | 'oklch' | 'hsl') || 'srgb';
        }

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

            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = this.getCenter();
            return `radial-gradient(${this.getShape()} ${this.getSize()} at ${c.cx}% ${c.cy}%${space}, ${stops})`;
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
            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = this.getCenter();
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true,
                detail: {
                    stops: this.getStops(),
                    shape: this.getShape(),
                    size: this.getSize(),
                    cx: c.cx, cy: c.cy,
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
        // Template helpers (filled in build)
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

        /** @name        shapeIs
         *  @private
         *  @type        {(v: string) => boolean}
         *  @description Component member for shape Is.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private shapeIs: (v: string) => boolean = () => false;

        /** @name        sizeIs
         *  @private
         *  @type        {(v: string) => boolean}
         *  @description Component member for size Is.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private sizeIs: (v: string) => boolean = () => false;

        /** @name        interpIs
         *  @private
         *  @type        {(v: string) => boolean}
         *  @description Component member for interp Is.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private interpIs: (v: string) => boolean = () => false;

        /** @name        cxVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for cx Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private cxVal: () => string = () => '50';

        /** @name        cyVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for cy Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private cyVal: () => string = () => '50';

        /** @name        centerDotStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for center Dot Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private centerDotStyle: () => string = () => '';

        /** @name        pins
         *  @private
         *  @type        {() => Array<{
            left: string;
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

        /** @name        onShapeChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Shape Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onShapeChange: (e: Event) => void = () => { };

        /** @name        onSizeChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Size Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSizeChange: (e: Event) => void = () => { };

        /** @name        onInterpChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Interp Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInterpChange: (e: Event) => void = () => { };

        /** @name        onCxChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Cx Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCxChange: (e: Event) => void = () => { };

        /** @name        onCyChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Cy Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCyChange: (e: Event) => void = () => { };

        /** @name        onCenterPad
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Center Pad.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCenterPad: (e: Event) => void = () => { };

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
    }
}
export default RadialGradientEditor;

export type RadialShape = RadialGradientEditor.Types.RadialShape;
export type RadialSize = RadialGradientEditor.Types.RadialSize;
export type RadialGradientEditorOptions = RadialGradientEditor.Interfaces.RadialGradientEditorOptions;
