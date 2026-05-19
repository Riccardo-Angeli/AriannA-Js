/**
 * @module    components/finance/DepthChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * DepthChart — order book depth visualization. Bids (left, green area) and
 * asks (right, red area) are cumulatively summed and filled under the curve.
 *
 * @example JS
 *   const d = new DepthChart();
 *   d.setData(
 *     [[100, 1.2], [99.5, 0.8], [99, 1.5]],   // bids, sorted high→low
 *     [[101, 0.9], [101.5, 1.1], [102, 0.7]], // asks, sorted low→high
 *   );
 *
 * @example HTML
 *   <arianna-depth-chart width="600" height="280"></arianna-depth-chart>
 *
 * Attrs: width, height
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type Level = [price: number, size: number];

export interface DepthChartOptions {
    bids?   : Level[];
    asks?   : Level[];
    width?  : number;
    height? : number;
}

export class DepthChart extends Component('arianna-depth-chart', HTMLElement, {}, {
    attrs : ['width', 'height'],
})
{
    bids$: Signal<Level[]> = signal<Level[]>([]);
    asks$: Signal<Level[]> = signal<Level[]>([]);

    build(_opts: DepthChartOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');

        this.svgHtml = (): string => {
            const bids = this.bids$.get();
            const asks = this.asks$.get();
            if (!bids.length || !asks.length) return '';

            const w = parseInt(wAttr.get() ?? '600', 10) || 600;
            const h = parseInt(hAttr.get() ?? '300', 10) || 300;

            const pad = { l: 60, r: 20, t: 20, b: 30 };
            const W = w - pad.l - pad.r;
            const H = h - pad.t - pad.b;

            const cumulate = (levels: Level[]): Level[] => {
                const out: Level[] = [];
                let sum = 0;
                for (const [p, q] of levels) {
                    sum += q;
                    out.push([p, sum]);
                }
                return out;
            };
            const cumBids = cumulate(bids);
            const cumAsks = cumulate(asks);

            const allP = [...bids.map(b => b[0]), ...asks.map(a => a[0])];
            const allS = [...cumBids.map(b => b[1]), ...cumAsks.map(a => a[1])];
            const minP = Math.min(...allP);
            const maxP = Math.max(...allP);
            const maxS = Math.max(...allS) || 1;

            const xS = (p: number) => pad.l + ((p - minP) / (maxP - minP || 1)) * W;
            const yS = (s: number) => pad.t + (1 - s / maxS) * H;

            const bidPts = cumBids.map(([p, s]) => `${xS(p)},${yS(s)}`).join(' ');
            const askPts = cumAsks.map(([p, s]) => `${xS(p)},${yS(s)}`).join(' ');
            const floor  = pad.t + H;

            const bullStroke = 'var(--arianna-bull, #26a69a)';
            const bearStroke = 'var(--arianna-bear, #ef5350)';
            const bullFill   = 'rgba(38,166,154,0.20)';
            const bearFill   = 'rgba(239,83,80,0.20)';

            return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                 + `<polyline points="${bidPts} ${xS(bids[0][0])},${floor}" fill="${bullFill}" stroke="${bullStroke}" stroke-width="2"/>`
                 + `<polyline points="${askPts} ${xS(asks[asks.length - 1][0])},${floor}" fill="${bearFill}" stroke="${bearStroke}" stroke-width="2"/>`
                 + `</svg>`;
        };

        this.template = html`<div class="ar-depth" a-html="this.svgHtml()"></div>`;
        (this as unknown as { Sheet: Stylesheet | null }).Sheet = DepthChart.DefaultSheet();
    }

    /** Convenience: set bids and asks together. */
    setData(bids: Level[], asks: Level[]): this {
        this.bids$.set(bids ?? []);
        this.asks$.set(asks ?? []);
        return this;
    }

    set bids(v: Level[]) { this.bids$.set(v ?? []); }
    get bids(): Level[]  { return this.bids$.get(); }

    set asks(v: Level[]) { this.asks$.set(v ?? []); }
    get asks(): Level[]  { return this.asks$.get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private svgHtml: () => string = () => '';

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display     : 'inline-block',
                    padding     : '4px',
                }),
                new Rule(':host svg', { display: 'block' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'DepthChart', {
        value: DepthChart, writable: false, enumerable: false, configurable: false,
    });
}

export default DepthChart;
