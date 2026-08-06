/**
 * @module    components/finance/OrderBook
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA OrderBook component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _fmt, _fmtK } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   OrderBook
 *  @public
 *  @description Namespace containing OrderBook contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace OrderBook
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
        /** @interface   OrderBookOptions
         *  @public
         *  @description OrderBookOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface OrderBookOptions
        {
            /** @name        bids
             *  @public
             *  @type        {OrderBook.Types.Level[]}
             *  @description Component member for bids.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bids?: Types.Level[];

            /** @name        asks
             *  @public
             *  @type        {OrderBook.Types.Level[]}
             *  @description Component member for asks.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            asks?: Types.Level[];

            /** @name        depth
             *  @public
             *  @type        {number}
             *  @description Component member for depth.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            depth?: number;
        }

        /** @interface   Row
         *  @public
         *  @description Row contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Row
        {
            /** @name        price
             *  @public
             *  @type        {string}
             *  @description Component member for price.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            price: string;

            /** @name        size
             *  @public
             *  @type        {string}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size: string;

            /** @name        rowCls
             *  @public
             *  @type        {string}
             *  @description Component member for row Cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rowCls: string;

            /** @name        priceCls
             *  @public
             *  @type        {string}
             *  @description Component member for price Cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            priceCls: string;
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

    /** @class       OrderBook
     *  @public
     *  @description AriannA OrderBook component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-order-book', {}, {
        Attributes: ['depth'],
    })
    export class OrderBook extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        bids$
         *  @public
         *  @type        {OrderBook.Types.Signal<OrderBook.Types.Level[]>}
         *  @description Component member for bids$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        bids$: Types.Signal<Types.Level[]> = signal<Types.Level[]>([]);

        /** @name        asks$
         *  @public
         *  @type        {OrderBook.Types.Signal<OrderBook.Types.Level[]>}
         *  @description Component member for asks$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        asks$: Types.Signal<Types.Level[]> = signal<Types.Level[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {OrderBook.Interfaces.OrderBookOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.OrderBookOptions = {})
        {
            /** @name        depth
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned depth value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const depth = this.signal().attribute('depth');

            /** @name        depthN
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned depthN value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const depthN = () => parseInt(depth.Get() ?? '10', 10) || 10;
            this.askRows = (): Interfaces.Row[] => {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = depthN();
                return this.asks$.Get().slice(0, n).reverse().map(([p, s]: any) => ({
                    price: _fmt(p),
                    size: _fmtK(s),
                    rowCls: 'ar-ob__row',
                    priceCls: 'ar-ob__price ar-ob__price--ask',
                }));
            };
            this.bidRows = (): Interfaces.Row[] => {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = depthN();
                return this.bids$.Get().slice(0, n).map(([p, s]: any) => ({
                    price: _fmt(p),
                    size: _fmtK(s),
                    rowCls: 'ar-ob__row',
                    priceCls: 'ar-ob__price ar-ob__price--bid',
                }));
            };
            this.midText = () => {
                /** @name        bestAsk
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bestAsk value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bestAsk = this.asks$.Get()[0]?.[0];

                /** @name        bestBid
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bestBid value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bestBid = this.bids$.Get()[0]?.[0];
                if (bestAsk === undefined || bestBid === undefined)
                    return '—';
                return _fmt((bestAsk + bestBid) / 2);
            };
            this.spreadText = () => {
                /** @name        bestAsk
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bestAsk value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bestAsk = this.asks$.Get()[0]?.[0];

                /** @name        bestBid
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bestBid value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bestBid = this.bids$.Get()[0]?.[0];
                if (bestAsk === undefined || bestBid === undefined)
                    return '—';
                return _fmt(bestAsk - bestBid);
            };
            this.template = html `
            <table class="ar-ob__table">
                <thead>
                    <tr>
                        <th class="ar-ob__th">Price</th>
                        <th class="ar-ob__th ar-ob__th--right">Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="r.rowCls" a-for="r in this.askRows()">
                        <td :class="r.priceCls">{{ r.price }}</td>
                        <td class="ar-ob__size">{{ r.size }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="ar-ob__mid">
                <span>Mid: <strong>{{ this.midText() }}</strong></span>
                <span>Spread: <strong>{{ this.spreadText() }}</strong></span>
            </div>
            <table class="ar-ob__table">
                <tbody>
                    <tr :class="r.rowCls" a-for="r in this.bidRows()">
                        <td :class="r.priceCls">{{ r.price }}</td>
                        <td class="ar-ob__size">{{ r.size }}</td>
                    </tr>
                </tbody>
            </table>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {OrderBook.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = OrderBook.DefaultSheet();
        }

        /** @name        setData
         *  @public
         *  @type        {this}
         *  @description Component member for set Data.
         *  @param       {OrderBook.Types.Level[]} bids Parameter.
         *  @param       {OrderBook.Types.Level[]} asks Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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
         *  @param       {OrderBook.Types.Level[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set bids(v: Types.Level[]) { this.bids$.Set(v ?? []); }

        /** @name        bids
         *  @public
         *  @type        {OrderBook.Types.Level[]}
         *  @description Component member for bids.
         *  @returns     {OrderBook.Types.Level[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get bids(): Types.Level[] { return this.bids$.Get(); }

        /** @name        asks
         *  @public
         *  @type        {void}
         *  @description Component member for asks.
         *  @param       {OrderBook.Types.Level[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set asks(v: Types.Level[]) { this.asks$.Set(v ?? []); }

        /** @name        asks
         *  @public
         *  @type        {OrderBook.Types.Level[]}
         *  @description Component member for asks.
         *  @returns     {OrderBook.Types.Level[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get asks(): Types.Level[] { return this.asks$.Get(); }

        /** @name        depth
         *  @public
         *  @type        {number}
         *  @description Component member for depth.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get depth(): number { return parseInt(this.getAttribute('depth') ?? '10', 10); }

        /** @name        depth
         *  @public
         *  @type        {void}
         *  @description Component member for depth.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set depth(v: number) { this.setAttribute('depth', String(v)); }

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

        /** @name        askRows
         *  @private
         *  @type        {() => OrderBook.Interfaces.Row[]}
         *  @description Component member for ask Rows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private askRows: () => Interfaces.Row[] = () => [];

        /** @name        bidRows
         *  @private
         *  @type        {() => OrderBook.Interfaces.Row[]}
         *  @description Component member for bid Rows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private bidRows: () => Interfaces.Row[] = () => [];

        /** @name        midText
         *  @private
         *  @type        {() => string}
         *  @description Component member for mid Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private midText: () => string = () => '—';

        /** @name        spreadText
         *  @private
         *  @type        {() => string}
         *  @description Component member for spread Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private spreadText: () => string = () => '—';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {OrderBook.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {OrderBook.Types.Stylesheet} Result.
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
                    display: 'inline-block',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '12px',
                    minWidth: '200px',
                    overflow: 'hidden',
                    padding: '8px',
                }),
                new Rule('.ar-ob__table', {
                    borderCollapse: 'collapse',
                    width: '100%',
                }),
                new Rule('.ar-ob__th', {
                    color: 'var(--arianna-muted, #787b86)',
                    fontWeight: '500',
                    padding: '2px 8px',
                    textAlign: 'left',
                }),
                new Rule('.ar-ob__th--right', { textAlign: 'right' }),
                new Rule('.ar-ob__price', { padding: '2px 8px' }),
                new Rule('.ar-ob__price--ask', { color: 'var(--arianna-bear, #ef5350)' }),
                new Rule('.ar-ob__price--bid', { color: 'var(--arianna-bull, #26a69a)' }),
                new Rule('.ar-ob__size', {
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '2px 8px',
                    textAlign: 'right',
                }),
                new Rule('.ar-ob__mid', {
                    borderTop: '1px solid var(--arianna-border, #e0e0e0)',
                    borderBottom: '1px solid var(--arianna-border, #e0e0e0)',
                    color: 'var(--arianna-warning, #f4c842)',
                    display: 'flex',
                    fontSize: '11px',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                }),
            ]);
        }
    }
}
export default OrderBook;

export type Level = OrderBook.Types.Level;
export type OrderBookOptions = OrderBook.Interfaces.OrderBookOptions;
