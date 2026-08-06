/**
 * @module    components/finance/DepthChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA DepthChart component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   DepthChart
 *  @public
 *  @description Namespace containing DepthChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace DepthChart
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

        /** @name        Level
         *  @public
         *  @type        {[
            price: number,
            size: number
        ]}
         *  @description Type alias for Level.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Level = [
            price: number,
            size: number
        ];
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   DepthChartOptions
         *  @public
         *  @description DepthChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DepthChartOptions
        {
            /** @name        bids
             *  @public
             *  @type        {DepthChart.Types.Level[]}
             *  @description Component member for bids.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bids?: Types.Level[];

            /** @name        asks
             *  @public
             *  @type        {DepthChart.Types.Level[]}
             *  @description Component member for asks.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            asks?: Types.Level[];

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

    /** @class       DepthChart
     *  @public
     *  @description AriannA DepthChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-depth-chart', {}, {
        Attributes: ['width', 'height'],
    })
    export class DepthChart extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        bids$
         *  @public
         *  @type        {DepthChart.Types.Signal<DepthChart.Types.Level[]>}
         *  @description Component member for bids$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        bids$: Types.Signal<Types.Level[]> = signal<Types.Level[]>([]);

        /** @name        asks$
         *  @public
         *  @type        {DepthChart.Types.Signal<DepthChart.Types.Level[]>}
         *  @description Component member for asks$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        asks$: Types.Signal<Types.Level[]> = signal<Types.Level[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {DepthChart.Interfaces.DepthChartOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.DepthChartOptions = {})
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
                /** @name        bids
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bids value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bids = this.bids$.Get();

                /** @name        asks
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned asks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const asks = this.asks$.Get();
                if (!bids.length || !asks.length)
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
                const pad = { l: 60, r: 20, t: 20, b: 30 };

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

                /** @name        cumulate
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cumulate value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cumulate = (levels: Types.Level[]): Types.Level[] => {
                    /** @name        out
                     *  @public
                     *  @type        {DepthChart.Types.Level[]}
                     *  @description Namespace-owned out value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const out: Types.Level[] = [];

                    /** @name        sum
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sum value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let sum = 0;
                    for (const [p, q] of levels)
                    {
                        sum += q;
                        out.push([p, sum]);
                    }
                    return out;
                };

                /** @name        cumBids
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cumBids value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cumBids = cumulate(bids);

                /** @name        cumAsks
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cumAsks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cumAsks = cumulate(asks);

                /** @name        allP
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned allP value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const allP = [...bids.map((b: any) => b[0]), ...asks.map((a: any) => a[0])];

                /** @name        allS
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned allS value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const allS = [...cumBids.map(b => b[1]), ...cumAsks.map(a => a[1])];

                /** @name        minP
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned minP value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const minP = Math.min(...allP);

                /** @name        maxP
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned maxP value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const maxP = Math.max(...allP);

                /** @name        maxS
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned maxS value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const maxS = Math.max(...allS) || 1;

                /** @name        xS
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned xS value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const xS = (p: number) => pad.l + ((p - minP) / (maxP - minP || 1)) * W;

                /** @name        yS
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned yS value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const yS = (s: number) => pad.t + (1 - s / maxS) * H;

                /** @name        bidPts
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bidPts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bidPts = cumBids.map(([p, s]) => `${xS(p)},${yS(s)}`).join(' ');

                /** @name        askPts
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned askPts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const askPts = cumAsks.map(([p, s]) => `${xS(p)},${yS(s)}`).join(' ');

                /** @name        floor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned floor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const floor = pad.t + H;

                /** @name        bullStroke
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bullStroke value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bullStroke = 'var(--arianna-bull, #26a69a)';

                /** @name        bearStroke
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bearStroke value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bearStroke = 'var(--arianna-bear, #ef5350)';

                /** @name        bullFill
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bullFill value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bullFill = 'rgba(38,166,154,0.20)';

                /** @name        bearFill
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bearFill value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bearFill = 'rgba(239,83,80,0.20)';
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                    + `<polyline points="${bidPts} ${xS(bids[0][0])},${floor}" fill="${bullFill}" stroke="${bullStroke}" stroke-width="2"/>`
                    + `<polyline points="${askPts} ${xS(asks[asks.length - 1][0])},${floor}" fill="${bearFill}" stroke="${bearStroke}" stroke-width="2"/>`
                    + `</svg>`;
            };
            this.template = html `<div class="ar-depth" a-html="this.svgHtml()"></div>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {DepthChart.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = DepthChart.DefaultSheet();
        }

        /** Convenience: set bids and asks together. */
        setData(bids: Types.Level[], asks: Types.Level[]): this
        {
            this.bids$.Set(bids ?? []);
            this.asks$.Set(asks ?? []);
            return this;
        }

        /** @name        bids
         *  @public
         *  @type        {void}
         *  @description Component member for bids.
         *  @param       {DepthChart.Types.Level[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set bids(v: Types.Level[]) { this.bids$.Set(v ?? []); }

        /** @name        bids
         *  @public
         *  @type        {DepthChart.Types.Level[]}
         *  @description Component member for bids.
         *  @returns     {DepthChart.Types.Level[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get bids(): Types.Level[] { return this.bids$.Get(); }

        /** @name        asks
         *  @public
         *  @type        {void}
         *  @description Component member for asks.
         *  @param       {DepthChart.Types.Level[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set asks(v: Types.Level[]) { this.asks$.Set(v ?? []); }

        /** @name        asks
         *  @public
         *  @type        {DepthChart.Types.Level[]}
         *  @description Component member for asks.
         *  @returns     {DepthChart.Types.Level[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get asks(): Types.Level[] { return this.asks$.Get(); }

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
         *  @type        {DepthChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {DepthChart.Types.Stylesheet} Result.
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
export default DepthChart;

export type Level = DepthChart.Types.Level;
export type DepthChartOptions = DepthChart.Interfaces.DepthChartOptions;
