/**
 * @module    components/finance/HeatmapChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA HeatmapChart component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _svg, _fmt, _esc } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   HeatmapChart
 *  @public
 *  @description Namespace containing HeatmapChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace HeatmapChart
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
        /** @interface   HeatmapChartOptions
         *  @public
         *  @description HeatmapChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HeatmapChartOptions
        {
            /** @name        labels
             *  @public
             *  @type        {string[]}
             *  @description Component member for labels.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            labels?: string[];

            /** @name        matrix
             *  @public
             *  @type        {number[][]}
             *  @description Component member for matrix.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            matrix?: number[][];

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

    /** @class       HeatmapChart
     *  @public
     *  @description AriannA HeatmapChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-heatmap-chart', {}, {
        Attributes: ['width', 'height'],
    })
    export class HeatmapChart extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        labels$
         *  @public
         *  @type        {HeatmapChart.Types.Signal<string[]>}
         *  @description Component member for labels$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        labels$: Types.Signal<string[]> = signal<string[]>([]);

        /** @name        matrix$
         *  @public
         *  @type        {HeatmapChart.Types.Signal<number[][]>}
         *  @description Component member for matrix$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        matrix$: Types.Signal<number[][]> = signal<number[][]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {HeatmapChart.Interfaces.HeatmapChartOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.HeatmapChartOptions = {})
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
                /** @name        labels
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned labels value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const labels = this.labels$.Get();

                /** @name        matrix
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned matrix value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const matrix = this.matrix$.Get();
                if (!labels.length || !matrix.length)
                    return '';

                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = parseInt(wAttr.Get() ?? '500', 10) || 500;

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = parseInt(hAttr.Get() ?? '500', 10) || 500;

                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = labels.length;

                /** @name        pad
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pad value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pad = 60;

                /** @name        cellW
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cellW value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cellW = (w - pad) / n;

                /** @name        cellH
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cellH value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cellH = (h - pad) / n;

                /** @name        cells
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cells value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let cells = '', axes = '';
                for (let i = 0; i < n; i++)
                {
                    for (let j = 0; j < n; j++)
                    {
                        /** @name        v
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned v value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const v = matrix[i]?.[j] ?? 0;
                        // Diverging ramp: -1 (red) → 0 (neutral) → +1 (green)
                        /** @name        r
                         *  @public
                         *  @type        {number}
                         *  @description Namespace-owned r value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        let r: number, g: number, b: number;
                        if (v < 0)
                        {
                            /** @name        t
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned t value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const t = Math.min(1, -v);
                            r = Math.round(239 * t + 245 * (1 - t));
                            g = Math.round(83 * t + 245 * (1 - t));
                            b = Math.round(80 * t + 245 * (1 - t));
                        }
                        else
                        {
                            /** @name        t
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned t value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const t = Math.min(1, v);
                            r = Math.round(38 * t + 245 * (1 - t));
                            g = Math.round(166 * t + 245 * (1 - t));
                            b = Math.round(154 * t + 245 * (1 - t));
                        }

                        /** @name        x
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned x value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const x = pad + j * cellW;

                        /** @name        y
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned y value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const y = pad + i * cellH;
                        cells += _svg('rect', {
                            x, y, width: cellW, height: cellH,
                            fill: `rgb(${r},${g},${b})`,
                            stroke: 'var(--arianna-bg, #fff)',
                            'stroke-width': 1,
                        });
                        // Pick text color based on cell luminance (rough heuristic)
                        /** @name        lum
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned lum value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

                        /** @name        textColor
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned textColor value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const textColor = lum > 160 ? '#000' : '#fff';
                        cells += _svg('text', {
                            x: x + cellW / 2,
                            y: y + cellH / 2 + 4,
                            fill: textColor,
                            'font-size': 10,
                            'text-anchor': 'middle',
                        }, _fmt(v));
                    }
                    axes += _svg('text', {
                        x: pad + i * cellW + cellW / 2,
                        y: pad - 6,
                        fill: 'var(--arianna-muted, #787b86)',
                        'font-size': 11,
                        'text-anchor': 'middle',
                    }, _esc(labels[i] ?? ''));
                    axes += _svg('text', {
                        x: pad - 6,
                        y: pad + i * cellH + cellH / 2 + 4,
                        fill: 'var(--arianna-muted, #787b86)',
                        'font-size': 11,
                        'text-anchor': 'end',
                    }, _esc(labels[i] ?? ''));
                }
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                    + axes + cells
                    + `</svg>`;
            };
            this.template = html `<div class="ar-heatmap" a-html="this.svgHtml()"></div>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {HeatmapChart.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = HeatmapChart.DefaultSheet();
        }

        /** Convenience: set labels and matrix together. */
        setData(labels: string[], matrix: number[][]): this
        {
            this.labels$.Set(labels ?? []);
            this.matrix$.Set(matrix ?? []);
            return this;
        }

        /** @name        labels
         *  @public
         *  @type        {void}
         *  @description Component member for labels.
         *  @param       {string[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set labels(v: string[]) { this.labels$.Set(v ?? []); }

        /** @name        labels
         *  @public
         *  @type        {string[]}
         *  @description Component member for labels.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get labels(): string[] { return this.labels$.Get(); }

        /** @name        matrix
         *  @public
         *  @type        {void}
         *  @description Component member for matrix.
         *  @param       {number[][]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set matrix(v: number[][]) { this.matrix$.Set(v ?? []); }

        /** @name        matrix
         *  @public
         *  @type        {number[][]}
         *  @description Component member for matrix.
         *  @returns     {number[][]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get matrix(): number[][] { return this.matrix$.Get(); }

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
         *  @type        {HeatmapChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {HeatmapChart.Types.Stylesheet} Result.
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
export default HeatmapChart;

export type HeatmapChartOptions = HeatmapChart.Interfaces.HeatmapChartOptions;
