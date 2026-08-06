/**
 * @module    components/finance/FinanceLineChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA FinanceLineChart component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _svg, _fmt, _esc } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   FinanceLineChart
 *  @public
 *  @description Namespace containing FinanceLineChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace FinanceLineChart
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
        /** @interface   LineChartSeries
         *  @public
         *  @description LineChartSeries contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LineChartSeries
        {
            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        data
             *  @public
             *  @type        {number[]}
             *  @description Component member for data.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            data: number[];

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;
        }

        /** @interface   LineChartOptions
         *  @public
         *  @description LineChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LineChartOptions
        {
            /** @name        series
             *  @public
             *  @type        {FinanceLineChart.Interfaces.LineChartSeries[]}
             *  @description Component member for series.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            series?: Interfaces.LineChartSeries[];

            /** @name        width
             *  @public
             *  @type        {number}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: number;

            /** @name        height
             *  @public
             *  @type        {number}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: number;
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

    /** @name        PALETTE
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned PALETTE value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const PALETTE = [
        'var(--arianna-primary, #1f6feb)',
        'var(--arianna-bull,    #26a69a)',
        'var(--arianna-bear,    #ef5350)',
        'var(--arianna-warning, #f5a623)',
        '#7b9ef9',
        '#ce93d8',
    ];

    /** @class       FinanceLineChart
     *  @public
     *  @description AriannA FinanceLineChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-finance-line-chart', {}, {
        Attributes: ['width', 'height'],
    })
    export class FinanceLineChart extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        series$
         *  @public
         *  @type        {FinanceLineChart.Types.Signal<FinanceLineChart.Interfaces.LineChartSeries[]>}
         *  @description Component member for series$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        series$: Types.Signal<Interfaces.LineChartSeries[]> = signal<Interfaces.LineChartSeries[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {FinanceLineChart.Interfaces.LineChartOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.LineChartOptions = {})
        {
            /** @name        wAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wAttr = this.signal().attribute('width');

            /** @name        hAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hAttr = this.signal().attribute('height');
            this.svgHtml = (): string => {
                /** @name        series
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned series value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const series = this.series$.Get();
                if (!series.length)
                    return '';

                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = parseInt(wAttr.Get() ?? '600', 10) || 600;

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = parseInt(hAttr.Get() ?? '300', 10) || 300;

                /** @name        pad
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pad value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pad = { l: 55, r: 20, t: 20, b: 36 };

                /** @name        W
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned W value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const W = w - pad.l - pad.r;

                /** @name        H
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned H value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const H = h - pad.t - pad.b;

                /** @name        all
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned all value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const all = series.flatMap((s: any) => s.data);

                /** @name        mn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mn = Math.min(...all);

                /** @name        mx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mx = Math.max(...all);

                /** @name        rng
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rng value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rng = mx - mn || 1;

                /** @name        maxLen
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned maxLen value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const maxLen = Math.max(...series.map((s: any) => s.data.length), 2);

                /** @name        xS
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned xS value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const xS = (i: number) => pad.l + (i / (maxLen - 1)) * W;

                /** @name        yS
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned yS value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const yS = (v: number) => pad.t + ((mx - v) / rng) * H;

                /** @name        grid
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned grid value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let grid = '';
                for (let i = 0; i <= 4; i++)
                {
                    /** @name        v
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned v value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const v = mn + (i / 4) * rng;

                    /** @name        y
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned y value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const y = yS(v);
                    grid += _svg('line', {
                        x1: pad.l, y1: y, x2: pad.l + W, y2: y,
                        stroke: 'var(--arianna-border, #e0e0e0)',
                        'stroke-width': 1,
                    });
                    grid += _svg('text', {
                        x: pad.l - 6, y: y + 4,
                        fill: 'var(--arianna-muted, #787b86)',
                        'font-size': 11,
                        'text-anchor': 'end',
                    }, _fmt(v));
                }

                /** @name        lines
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lines value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let lines = '', legend = '';
                series.forEach((s: any, si: any) => {
                    /** @name        color
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned color value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const color = s.color ?? PALETTE[si % PALETTE.length];

                    /** @name        last
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned last value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const last = s.data.length - 1 || 1;

                    /** @name        pts
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned pts value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const pts = s.data.map((v: any, i: any) => `${pad.l + (i / last) * W},${yS(v)}`).join(' ');
                    lines += _svg('polyline', {
                        points: pts,
                        fill: 'none',
                        stroke: color,
                        'stroke-width': 2,
                        'stroke-linejoin': 'round',
                    });

                    /** @name        lx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned lx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const lx = pad.l + si * 120;
                    legend += _svg('rect', {
                        x: lx, y: h - 16, width: 12, height: 3, fill: color, rx: 1,
                    });
                    legend += _svg('text', {
                        x: lx + 18, y: h - 12,
                        fill: 'var(--arianna-text, #1f2328)',
                        'font-size': 12,
                    }, _esc(s.name));
                });
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                    + grid + lines + legend
                    + `</svg>`;
            };
            this.template = html `<div class="ar-linechart" a-html="this.svgHtml()"></div>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {FinanceLineChart.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = FinanceLineChart.DefaultSheet();
        }

        /** @name        series
         *  @public
         *  @type        {void}
         *  @description Component member for series.
         *  @param       {FinanceLineChart.Interfaces.LineChartSeries[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set series(v: Interfaces.LineChartSeries[]) { this.series$.Set(v ?? []); }

        /** @name        series
         *  @public
         *  @type        {FinanceLineChart.Interfaces.LineChartSeries[]}
         *  @description Component member for series.
         *  @returns     {FinanceLineChart.Interfaces.LineChartSeries[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get series(): Interfaces.LineChartSeries[] { return this.series$.Get(); }

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
         *  @type        {FinanceLineChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {FinanceLineChart.Types.Stylesheet} Result.
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
                    padding: '4px',
                }),
                new Rule(':host svg', { display: 'block' }),
            ]);
        }
    }
}
export default FinanceLineChart;

export type LineChartSeries = FinanceLineChart.Interfaces.LineChartSeries;
export type LineChartOptions = FinanceLineChart.Interfaces.LineChartOptions;
