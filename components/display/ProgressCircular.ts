/**
 * @module    components/display/ProgressCircular
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ProgressCircular component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   ProgressCircular
 *  @public
 *  @description Namespace containing ProgressCircular contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ProgressCircular
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
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ProgressCircularOptions
         *  @public
         *  @description ProgressCircularOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ProgressCircularOptions
        {
            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number;

            /** @name        strokeWidth
             *  @public
             *  @type        {number}
             *  @description Component member for stroke Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            strokeWidth?: number;

            /** @name        value
             *  @public
             *  @type        {number}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: number;

            /** @name        variant
             *  @public
             *  @type        {'default' | 'success' | 'warning' | 'danger'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'default' | 'success' | 'warning' | 'danger';

            /** @name        showValue
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showValue?: boolean;

            /** @name        indeterminate
             *  @public
             *  @type        {boolean}
             *  @description Component member for indeterminate.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            indeterminate?: boolean;
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

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       ProgressCircular
     *  @public
     *  @description AriannA ProgressCircular component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-progress-circular', {}, {
        Attributes: ['size', 'stroke-width', 'value', 'variant', 'show-value', 'indeterminate'],
    })
    export class ProgressCircular extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ProgressCircular.Interfaces.ProgressCircularOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ProgressCircularOptions = {})
        {
            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = this.signal().attribute('size');

            /** @name        sw
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sw value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sw = this.signal().attribute('stroke-width');

            /** @name        value
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned value value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const value = this.signal().attribute('value');

            /** @name        variant
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned variant value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const variant = this.signal().attribute('variant');

            /** @name        sizePx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sizePx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sizePx = () => parseInt(size.Get() ?? '48', 10) || 48;

            /** @name        strokePx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned strokePx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const strokePx = () => parseInt(sw.Get() ?? '4', 10) || 4;

            /** @name        valueNum
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned valueNum value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const valueNum = () => {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = parseFloat(value.Get() ?? '0');
                return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
            };

            /** @name        radius
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned radius value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const radius = () => (sizePx() - strokePx()) / 2;

            /** @name        circumf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned circumf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const circumf = () => 2 * Math.PI * radius();

            /** @name        dashLen
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dashLen value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dashLen = () => this.isIndet() ? circumf() * 0.75 : circumf() * valueNum() / 100;

            /** @name        dashOff
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dashOff value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dashOff = () => circumf() * 0.25;

            /** @name        variantColor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned variantColor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const variantColor = (): string => {
                /** @name        m
                 *  @public
                 *  @type        {Record<string, string>}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m: Record<string, string> = {
                    default: 'var(--arianna-primary, #1f6feb)',
                    success: 'var(--arianna-success, #2ea043)',
                    warning: 'var(--arianna-warning, #d29922)',
                    danger: 'var(--arianna-danger,  #cf222e)',
                };
                return m[variant.Get() ?? 'default'] ?? m.default;
            };
            this.isIndet = () => this.hasAttribute('indeterminate');
            this.svgViewBox = () => `0 0 ${sizePx()} ${sizePx()}`;
            this.svgStyle = () => ({ width: sizePx() + 'px', height: sizePx() + 'px' });
            this.svgClass = () => this.isIndet() ? 'ar-progress-circ__spin' : '';
            this.svgCenter = () => String(sizePx() / 2);
            this.svgRadius = () => String(radius());
            this.svgStrokeW = () => String(strokePx());
            this.svgColor = variantColor;
            this.svgDashArr = () => `${dashLen()} ${circumf() - dashLen()}`;
            this.svgDashOff = () => String(dashOff());
            this.hasShowVal = () => this.hasAttribute('show-value') && !this.isIndet();
            this.valueLabel = () => Math.round(valueNum()) + '%';
            this.labelStyle = () => ({ fontSize: Math.round(sizePx() * 0.22) + 'px' });
            this.template = html `
            <svg :viewBox="this.svgViewBox()" :style="this.svgStyle()" :class="this.svgClass()" xmlns="http://www.w3.org/2000/svg">
                <circle :cx="this.svgCenter()" :cy="this.svgCenter()" :r="this.svgRadius()"
                        fill="none" stroke="var(--arianna-bg-3, #f3f3f3)" :stroke-width="this.svgStrokeW()"></circle>
                <circle :cx="this.svgCenter()" :cy="this.svgCenter()" :r="this.svgRadius()"
                        fill="none" :stroke="this.svgColor()" :stroke-width="this.svgStrokeW()"
                        stroke-linecap="round"
                        :stroke-dasharray="this.svgDashArr()"
                        :stroke-dashoffset="this.svgDashOff()"
                        style="transition: stroke-dasharray .3s ease"></circle>
            </svg>
            <div class="ar-progress-circ__label" a-if="this.hasShowVal()" :style="this.labelStyle()">{{ this.valueLabel() }}</div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ProgressCircular.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ProgressCircular.DefaultSheet();
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

        /** @name        size
         *  @public
         *  @type        {number}
         *  @description Component member for size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): number { return parseInt(this.getAttribute('size') ?? '48', 10); }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: number) { this.setAttribute('size', String(v)); }

        /** @name        strokeWidth
         *  @public
         *  @type        {number}
         *  @description Component member for stroke Width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get strokeWidth(): number { return parseInt(this.getAttribute('stroke-width') ?? '4', 10); }

        /** @name        strokeWidth
         *  @public
         *  @type        {void}
         *  @description Component member for stroke Width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set strokeWidth(v: number) { this.setAttribute('stroke-width', String(v)); }

        /** @name        value
         *  @public
         *  @type        {number}
         *  @description Component member for value.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get value(): number { return parseFloat(this.getAttribute('value') ?? '0'); }

        /** @name        value
         *  @public
         *  @type        {void}
         *  @description Component member for value.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set value(v: number) { this.setAttribute('value', String(Math.max(0, Math.min(100, v)))); }

        /** @name        variant
         *  @public
         *  @type        {string}
         *  @description Component member for variant.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): string { return this.getAttribute('variant') ?? 'default'; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: string) { this.setAttribute('variant', v); }

        /** @name        showValue
         *  @public
         *  @type        {boolean}
         *  @description Component member for show Value.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get showValue(): boolean { return this.hasAttribute('show-value'); }

        /** @name        showValue
         *  @public
         *  @type        {void}
         *  @description Component member for show Value.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set showValue(v: boolean) { v ? this.setAttribute('show-value', '') : this.removeAttribute('show-value'); }

        /** @name        indeterminate
         *  @public
         *  @type        {boolean}
         *  @description Component member for indeterminate.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get indeterminate(): boolean { return this.hasAttribute('indeterminate'); }

        /** @name        indeterminate
         *  @public
         *  @type        {void}
         *  @description Component member for indeterminate.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set indeterminate(v: boolean) { v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate'); }

        /** @name        isIndet
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Indet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isIndet: () => boolean = () => false;

        /** @name        svgViewBox
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg View Box.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgViewBox: () => string = () => '0 0 48 48';

        /** @name        svgStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for svg Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgStyle: () => Record<string, string> = () => ({});

        /** @name        svgClass
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgClass: () => string = () => '';

        /** @name        svgCenter
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Center.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgCenter: () => string = () => '24';

        /** @name        svgRadius
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Radius.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgRadius: () => string = () => '22';

        /** @name        svgStrokeW
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Stroke W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgStrokeW: () => string = () => '4';

        /** @name        svgColor
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Color.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgColor: () => string = () => '';

        /** @name        svgDashArr
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Dash Arr.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgDashArr: () => string = () => '';

        /** @name        svgDashOff
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Dash Off.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgDashOff: () => string = () => '0';

        /** @name        hasShowVal
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Show Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasShowVal: () => boolean = () => false;

        /** @name        valueLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for value Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private valueLabel: () => string = () => '0%';

        /** @name        labelStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for label Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelStyle: () => Record<string, string> = () => ({});

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ProgressCircular.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ProgressCircular.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    position: 'relative',
                }),
                new Rule('.ar-progress-circ__label', {
                    color: 'var(--arianna-text, #1f2328)',
                    fontWeight: '600',
                    fontVariantNumeric: 'tabular-nums',
                }),
                new Rule('.ar-progress-circ__spin', { animation: 'ar-circ-spin 1s linear infinite' }),
                new Rule('@keyframes ar-circ-spin', { 'to': { transform: 'rotate(360deg)' } } as never),
            ]);
        }
    }
}
export default ProgressCircular;

export type ProgressCircularOptions = ProgressCircular.Interfaces.ProgressCircularOptions;
