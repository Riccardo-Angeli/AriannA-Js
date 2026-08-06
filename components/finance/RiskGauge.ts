/**
 * @module    components/finance/RiskGauge
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA RiskGauge component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';
import { _fmt, _esc } from './helpers.ts';

/** @namespace   RiskGauge
 *  @public
 *  @description Namespace containing RiskGauge contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace RiskGauge
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
        /** @interface   RiskGaugeOptions
         *  @public
         *  @description RiskGaugeOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RiskGaugeOptions
        {
            /** @name        value
             *  @public
             *  @type        {number}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: number;

            /** @name        min
             *  @public
             *  @type        {number}
             *  @description Component member for min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            min?: number;

            /** @name        max
             *  @public
             *  @type        {number}
             *  @description Component member for max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            max?: number;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

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

    /** @class       RiskGauge
     *  @public
     *  @description AriannA RiskGauge component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-risk-gauge', {}, {
        Attributes: ['value', 'min', 'max', 'label', 'size'],
    })
    export class RiskGauge extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {RiskGauge.Interfaces.RiskGaugeOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.RiskGaugeOptions = {})
        {
            /** @name        value
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned value value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const value = this.signal().attribute('value');

            /** @name        min
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned min value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const min = this.signal().attribute('min');

            /** @name        max
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned max value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const max = this.signal().attribute('max');

            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');

            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = this.signal().attribute('size');
            this.svgHtml = (): string => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseFloat(value.Get() ?? '0') || 0;

                /** @name        mn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mn = parseFloat(min.Get() ?? '0') || 0;

                /** @name        mx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mx = parseFloat(max.Get() ?? '100') || 100;

                /** @name        lbl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lbl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lbl = label.Get() ?? '';

                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = parseInt(size.Get() ?? '200', 10) || 200;

                /** @name        cx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cx = s / 2;

                /** @name        cy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cy = s * 0.6;

                /** @name        R
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned R value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const R = s * 0.4;

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = Math.max(0, Math.min(1, (v - mn) / (mx - mn || 1)));

                /** @name        endA
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned endA value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const endA = Math.PI + t * Math.PI;

                /** @name        color
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned color value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const color = t < 0.33 ? 'var(--arianna-bull, #26a69a)'
                    : t < 0.66 ? 'var(--arianna-warning, #f4c842)'
                        : 'var(--arianna-bear, #ef5350)';

                /** @name        aX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned aX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const aX = (a: number) => cx + R * Math.cos(a);

                /** @name        aY
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned aY value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const aY = (a: number) => cy + R * Math.sin(a);

                /** @name        bgPath
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bgPath value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bgPath = `M${aX(Math.PI)},${aY(Math.PI)} A${R},${R} 0 0,1 ${aX(0)},${aY(0)}`;

                /** @name        fgPath
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned fgPath value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const fgPath = `M${aX(Math.PI)},${aY(Math.PI)} A${R},${R} 0 ${t > 0.5 ? 1 : 0},1 ${aX(endA)},${aY(endA)}`;

                /** @name        sw
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sw value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sw = R * 0.3;

                /** @name        nx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const nx = aX(endA) * 0.85 + cx * 0.15;

                /** @name        ny
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ny value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ny = aY(endA) * 0.85 + cy * 0.15;
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s * 0.7}" viewBox="0 0 ${s} ${s * 0.7}">`
                    + `<path d="${bgPath}" fill="none" stroke="var(--arianna-bg-4, #2a2e39)" stroke-width="${sw}" stroke-linecap="round"/>`
                    + `<path d="${fgPath}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`
                    + `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="var(--arianna-text, #1f2328)" stroke-width="2"/>`
                    + `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--arianna-text, #1f2328)"/>`
                    + `<text x="${cx}" y="${cy - 10}" fill="${color}" font-size="16" font-weight="700" text-anchor="middle">${_fmt(v)}</text>`
                    + `<text x="${cx}" y="${cy + 8}" fill="var(--arianna-muted, #787b86)" font-size="11" text-anchor="middle">${_esc(lbl)}</text>`
                    + `</svg>`;
            };
            this.template = html `<div class="ar-gauge" a-html="this.svgHtml()"></div>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {RiskGauge.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = RiskGauge.DefaultSheet();
        }

        /** Convenience: set min and max together. */
        setRange(min: number, max: number): this
        {
            this.setAttribute('min', String(min));
            this.setAttribute('max', String(max));
            return this;
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
        set value(v: number) { this.setAttribute('value', String(v)); }

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get label(): string { return this.getAttribute('label') ?? ''; }

        /** @name        label
         *  @public
         *  @type        {void}
         *  @description Component member for label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set label(v: string) { this.setAttribute('label', v); }

        /** @name        svgHtml
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgHtml: () => string = () => '';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {RiskGauge.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {RiskGauge.Types.Stylesheet} Result.
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
                    display: 'inline-block',
                    padding: '8px',
                }),
                new Rule(':host svg', { display: 'block' }),
            ]);
        }
    }
}
export default RiskGauge;

export type RiskGaugeOptions = RiskGauge.Interfaces.RiskGaugeOptions;
