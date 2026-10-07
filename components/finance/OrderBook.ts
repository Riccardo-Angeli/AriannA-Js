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
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

import { MountFinanceTemplate } from './Base.ts';


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
    export const Styles: Types.Stylesheet = (() =>
    {
            return new Stylesheet([
            new Rule('.OrderBook', {
                '--arianna-bg': '#17181c',
                '--arianna-bg-2': '#1d1e23',
                '--arianna-bg-3': '#24262b',
                '--arianna-text': '#e6e8eb',
                '--arianna-muted': '#9aa0aa',
                '--arianna-dim': '#6f7580',
                '--arianna-border': '#303238',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#26a69a',
                '--arianna-warning': '#f5a623',
                '--arianna-danger': '#ef5350',
                '--bg': '#17181c',
                '--bg3': '#24262b',
                '--text': '#e6e8eb',
                '--muted': '#9aa0aa',
                '--border': '#303238',
                '--accent': '#e40c88',
            }),
            new Rule('.OrderBook[theme="light"]', {
                '--arianna-bg': '#ffffff',
                '--arianna-bg-2': '#fbfbfc',
                '--arianna-bg-3': '#f3f3f5',
                '--arianna-text': '#1c1e21',
                '--arianna-muted': '#626873',
                '--arianna-dim': '#8a8f98',
                '--arianna-border': '#e2e2e6',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#168a78',
                '--arianna-warning': '#b66c00',
                '--arianna-danger': '#c93645',
                '--bg': '#ffffff',
                '--bg3': '#f3f3f5',
                '--text': '#1c1e21',
                '--muted': '#626873',
                '--border': '#e2e2e6',
                '--accent': '#e40c88',
            }),
                new Rule('.OrderBook', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    background: 'var(--arianna-bg, var(--bg, #fff))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    display: 'inline-block',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '12px',
                    minWidth: '200px',
                    overflow: 'hidden',
                    padding: '8px',
                }),
                new Rule('.OrderBook-Table', {
                    borderCollapse: 'collapse',
                    width: '100%',
                }),
                new Rule('.OrderBook-Header', {
                    color: 'var(--arianna-muted, var(--muted, #787b86))',
                    fontWeight: '500',
                    padding: '2px 8px',
                    textAlign: 'left',
                }),
                new Rule('.OrderBook-Header-Right', { textAlign: 'right' }),
                new Rule('.OrderBook-Price', { padding: '2px 8px' }),
                new Rule('.OrderBook-Price-Ask', { color: 'var(--arianna-bear, #ef5350)' }),
                new Rule('.OrderBook-Price-Bid', { color: 'var(--arianna-bull, #26a69a)' }),
                new Rule('.OrderBook-Size', {
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    padding: '2px 8px',
                    textAlign: 'right',
                }),
                new Rule('.OrderBook-Mid', {
                    borderTop: '1px solid var(--arianna-border, var(--border, #e0e0e0))',
                    borderBottom: '1px solid var(--arianna-border, var(--border, #e0e0e0))',
                    color: 'var(--arianna-warning, #f4c842)',
                    display: 'flex',
                    fontSize: '11px',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                }),
            ]);
        
    })();

    @Component('arianna-order-book', Styles, {
        Shadow: false,
        Attributes: ['depth', 'theme', 'bids', 'asks'],
        Properties: ['bids', 'asks'],
    })
    export class OrderBook extends HTMLDivElement
    {
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'OrderBook';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        constructor()
        {
            super();
            this.classList.add('OrderBook');
        }

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
        private _bidsSignal?: Types.Signal<Types.Level[]>;
        public get bids$(): Types.Signal<Types.Level[]>
        {
            this._bidsSignal ??= signal<Types.Level[]>([]);
            return this._bidsSignal;
        }
        /** @name        asks$
         *  @public
         *  @type        {OrderBook.Types.Signal<OrderBook.Types.Level[]>}
         *  @description Component member for asks$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _asksSignal?: Types.Signal<Types.Level[]>;
        public get asks$(): Types.Signal<Types.Level[]>
        {
            this._asksSignal ??= signal<Types.Level[]>([]);
            return this._asksSignal;
        }
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
            this.classList.add('OrderBook');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(this.dataset.ariannaFolderReady === 'true') return;
            this.dataset.ariannaFolderReady = 'true';
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
                    rowCls: 'OrderBook-Row',
                    priceCls: 'OrderBook-Price OrderBook-Price-Ask',
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
                    rowCls: 'OrderBook-Row',
                    priceCls: 'OrderBook-Price OrderBook-Price-Bid',
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
            <table class="OrderBook-Table">
                <thead>
                    <tr>
                        <th class="OrderBook-Header">Price</th>
                        <th class="OrderBook-Header OrderBook-Header-Right">Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="r.rowCls" a-for="r in this.askRows()">
                        <td :class="r.priceCls">{{ r.price }}</td>
                        <td class="OrderBook-Size">{{ r.size }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="OrderBook-Mid">
                <span>Mid: <strong>{{ this.midText() }}</strong></span>
                <span>Spread: <strong>{{ this.spreadText() }}</strong></span>
            </div>
            <table class="OrderBook-Table">
                <tbody>
                    <tr :class="r.rowCls" a-for="r in this.bidRows()">
                        <td :class="r.priceCls">{{ r.price }}</td>
                        <td class="OrderBook-Size">{{ r.size }}</td>
                    </tr>
                </tbody>
            </table>
        `;
            MountFinanceTemplate(this);
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {OrderBook.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Styles;
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
        public static readonly Styles = Styles;
        static DefaultSheet(): Types.Stylesheet { return Styles; }
    }
}
export default OrderBook;

export type Level = OrderBook.Types.Level;
export type OrderBookOptions = OrderBook.Interfaces.OrderBookOptions;
