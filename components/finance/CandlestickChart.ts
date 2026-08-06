/**
 * @module    components/finance/CandlestickChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA CandlestickChart component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _svg } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   CandlestickChart
 *  @public
 *  @description Namespace containing CandlestickChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace CandlestickChart
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
        /** @interface   CandleBar
         *  @public
         *  @description CandleBar contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CandleBar
        {
            /** @name        t
             *  @public
             *  @type        {number}
             *  @description Component member for t.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            t: number;

            /** @name        o
             *  @public
             *  @type        {number}
             *  @description Component member for o.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            o: number;

            /** @name        h
             *  @public
             *  @type        {number}
             *  @description Component member for h.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            h: number;

            /** @name        l
             *  @public
             *  @type        {number}
             *  @description Component member for l.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            l: number;

            /** @name        c
             *  @public
             *  @type        {number}
             *  @description Component member for c.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            c: number;
        }

        /** @interface   CandlestickChartOptions
         *  @public
         *  @description CandlestickChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CandlestickChartOptions
        {
            /** @name        data
             *  @public
             *  @type        {CandlestickChart.Interfaces.CandleBar[]}
             *  @description Component member for data.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            data?: Interfaces.CandleBar[];

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

            /** @name        bull
             *  @public
             *  @type        {string}
             *  @description Component member for bull.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bull?: string;

            /** @name        bear
             *  @public
             *  @type        {string}
             *  @description Component member for bear.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bear?: string;
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

    /** @class       CandlestickChart
     *  @public
     *  @description AriannA CandlestickChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-candlestick-chart', {}, {
        Attributes: ['width', 'height', 'bull', 'bear'],
    })
    export class CandlestickChart extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        data$
         *  @public
         *  @type        {CandlestickChart.Types.Signal<CandlestickChart.Interfaces.CandleBar[]>}
         *  @description Component member for data$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        data$: Types.Signal<Interfaces.CandleBar[]> = signal<Interfaces.CandleBar[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {CandlestickChart.Interfaces.CandlestickChartOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.CandlestickChartOptions = {})
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

            /** @name        bull
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bull value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bull = this.signal().attribute('bull');

            /** @name        bear
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bear value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bear = this.signal().attribute('bear');
            this.svgHtml = (): string => {
                /** @name        data
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned data value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const data = this.data$.Get();
                if (!data.length)
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
                const h = parseInt(hAttr.Get() ?? '320', 10) || 320;

                /** @name        bullColor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bullColor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bullColor = bull.Get() || 'var(--arianna-bull, #26a69a)';

                /** @name        bearColor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bearColor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bearColor = bear.Get() || 'var(--arianna-bear, #ef5350)';

                /** @name        hi
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hi value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hi = Math.max(...data.map((d: any) => d.h));

                /** @name        lo
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lo value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lo = Math.min(...data.map((d: any) => d.l));

                /** @name        range
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned range value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const range = (hi - lo) || 1;

                /** @name        pad
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pad value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pad = 8;

                /** @name        cw
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cw value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cw = (w - pad * 2) / data.length;

                /** @name        yOf
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned yOf value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const yOf = (v: number) => h - pad - ((v - lo) / range) * (h - pad * 2);

                /** @name        svgInner
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned svgInner value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let svgInner = '';
                data.forEach((bar: any, i: any) => {
                    /** @name        x
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x = pad + i * cw + cw / 2;

                    /** @name        color
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned color value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const color = bar.c >= bar.o ? bullColor : bearColor;
                    // wick (high → low)
                    svgInner += _svg('line', {
                        x1: x, x2: x,
                        y1: yOf(bar.h), y2: yOf(bar.l),
                        stroke: color,
                        'stroke-width': 1,
                    });
                    // body (open → close)
                    /** @name        top
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned top value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const top = Math.min(yOf(bar.o), yOf(bar.c));

                    /** @name        bh
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned bh value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const bh = Math.max(2, Math.abs(yOf(bar.o) - yOf(bar.c)));
                    svgInner += _svg('rect', {
                        x: x - cw * 0.35,
                        y: top,
                        width: cw * 0.7,
                        height: bh,
                        fill: color,
                    });
                });
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svgInner}</svg>`;
            };
            this.template = html `<div class="ar-candles" a-html="this.svgHtml()"></div>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {CandlestickChart.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = CandlestickChart.DefaultSheet();
        }

        /** @name        data
         *  @public
         *  @type        {void}
         *  @description Component member for data.
         *  @param       {CandlestickChart.Interfaces.CandleBar[]} rows Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set data(rows: Interfaces.CandleBar[]) { this.data$.Set(rows ?? []); }

        /** @name        data
         *  @public
         *  @type        {CandlestickChart.Interfaces.CandleBar[]}
         *  @description Component member for data.
         *  @returns     {CandlestickChart.Interfaces.CandleBar[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get data(): Interfaces.CandleBar[] { return this.data$.Get(); }

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

        /** @name        width
         *  @public
         *  @type        {number}
         *  @description Component member for width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get width(): number { return parseInt(this.getAttribute('width') ?? '600', 10); }

        /** @name        width
         *  @public
         *  @type        {void}
         *  @description Component member for width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set width(v: number) { this.setAttribute('width', String(v)); }

        /** @name        height
         *  @public
         *  @type        {number}
         *  @description Component member for height.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get height(): number { return parseInt(this.getAttribute('height') ?? '320', 10); }

        /** @name        height
         *  @public
         *  @type        {void}
         *  @description Component member for height.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set height(v: number) { this.setAttribute('height', String(v)); }

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
         *  @type        {CandlestickChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {CandlestickChart.Types.Stylesheet} Result.
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
                    overflow: 'hidden',
                    padding: '4px',
                }),
                new Rule(':host svg', { display: 'block' }),
            ]);
        }
    }
}
export default CandlestickChart;

export type CandleBar = CandlestickChart.Interfaces.CandleBar;
export type CandlestickChartOptions = CandlestickChart.Interfaces.CandlestickChartOptions;
