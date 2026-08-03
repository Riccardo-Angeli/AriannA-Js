/**
 * @module    components/finance/OrderBook
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * OrderBook — bid/ask ladder with mid-price and spread row. Asks rendered
 * top-down (highest price at top, descending toward the spread row), bids
 * below the spread row from best to worst.
 *
 * @example JS
 *   const ob = new OrderBook();
 *   ob.depth = 10;
 *   ob.setData(
 *     [[100.5, 1.2], [100, 0.8], [99.5, 1.5]],  // bids
 *     [[101, 0.9],   [101.5, 1.1]],             // asks
 *   );
 *
 * @example HTML
 *   <arianna-order-book depth="10"></arianna-order-book>
 *
 * Attrs: depth
 */

import { Component } from '../../core/Components.ts';
import { html }      from '../../core/Template.ts';
import { Reactivity } from '../../core/Reactive.ts';

/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = Reactivity.Types.SignalContract<T>;
import { Css } from '../../core/Css.ts';
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
import { _fmt, _fmtK } from './helpers.ts';

export type Level = [price: number, size: number];

export interface OrderBookOptions {
    bids?  : Level[];
    asks?  : Level[];
    depth? : number;
}

interface Row {
    price : string;
    size  : string;
    rowCls: string;
    priceCls: string;
}

export class OrderBook extends Component('arianna-order-book', HTMLElement, {}, {
    attrs : ['depth'],
})
{
    bids$: Signal<Level[]> = signal<Level[]>([]);
    asks$: Signal<Level[]> = signal<Level[]>([]);

    build(_opts: OrderBookOptions = {})
    {
        const depth = this.attributeSignal('depth');

        const depthN = () => parseInt(depth.Get() ?? '10', 10) || 10;

        this.askRows = (): Row[] => {
            const n = depthN();
            return this.asks$.Get().slice(0, n).reverse().map(([p, s]) => ({
                price: _fmt(p),
                size : _fmtK(s),
                rowCls: 'ar-ob__row',
                priceCls: 'ar-ob__price ar-ob__price--ask',
            }));
        };

        this.bidRows = (): Row[] => {
            const n = depthN();
            return this.bids$.Get().slice(0, n).map(([p, s]) => ({
                price: _fmt(p),
                size : _fmtK(s),
                rowCls: 'ar-ob__row',
                priceCls: 'ar-ob__price ar-ob__price--bid',
            }));
        };

        this.midText = () => {
            const bestAsk = this.asks$.Get()[0]?.[0];
            const bestBid = this.bids$.Get()[0]?.[0];
            if (bestAsk === undefined || bestBid === undefined) return '—';
            return _fmt((bestAsk + bestBid) / 2);
        };
        this.spreadText = () => {
            const bestAsk = this.asks$.Get()[0]?.[0];
            const bestBid = this.bids$.Get()[0]?.[0];
            if (bestAsk === undefined || bestBid === undefined) return '—';
            return _fmt(bestAsk - bestBid);
        };

        this.template = html`
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

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = OrderBook.DefaultSheet();
    }

    setData(bids: Level[], asks: Level[]): this {
        this.bids$.Set(bids ?? []);
        this.asks$.Set(asks ?? []);
        return this;
    }

    set bids(v: Level[]) { this.bids$.Set(v ?? []); }
    get bids(): Level[]  { return this.bids$.Get(); }

    set asks(v: Level[]) { this.asks$.Set(v ?? []); }
    get asks(): Level[]  { return this.asks$.Get(); }

    get depth(): number  { return parseInt(this.getAttribute('depth') ?? '10', 10); }
    set depth(v: number) { this.setAttribute('depth', String(v)); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private askRows   : () => Row[] = () => [];
    private bidRows   : () => Row[] = () => [];
    private midText   : () => string = () => '—';
    private spreadText: () => string = () => '—';

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'inline-block',
                    fontFamily  : 'ui-monospace, monospace',
                    fontSize    : '12px',
                    minWidth    : '200px',
                    overflow    : 'hidden',
                    padding     : '8px',
                }),
                new Rule('.ar-ob__table', {
                    borderCollapse: 'collapse',
                    width: '100%',
                }),
                new Rule('.ar-ob__th', {
                    color     : 'var(--arianna-muted, #787b86)',
                    fontWeight: '500',
                    padding   : '2px 8px',
                    textAlign : 'left',
                }),
                new Rule('.ar-ob__th--right', { textAlign: 'right' }),
                new Rule('.ar-ob__price', { padding: '2px 8px' }),
                new Rule('.ar-ob__price--ask', { color: 'var(--arianna-bear, #ef5350)' }),
                new Rule('.ar-ob__price--bid', { color: 'var(--arianna-bull, #26a69a)' }),
                new Rule('.ar-ob__size', {
                    color    : 'var(--arianna-text, #1f2328)',
                    padding  : '2px 8px',
                    textAlign: 'right',
                }),
                new Rule('.ar-ob__mid', {
                    borderTop    : '1px solid var(--arianna-border, #e0e0e0)',
                    borderBottom : '1px solid var(--arianna-border, #e0e0e0)',
                    color        : 'var(--arianna-warning, #f4c842)',
                    display      : 'flex',
                    fontSize     : '11px',
                    justifyContent: 'space-between',
                    padding      : '4px 8px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'OrderBook', {
        value: OrderBook, writable: false, enumerable: false, configurable: false,
    });
}

export default OrderBook;
