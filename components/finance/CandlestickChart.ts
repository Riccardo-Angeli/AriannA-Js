/**
 * @module    components/finance/CandlestickChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * CandlestickChart — OHLC chart. Each bar is a wick + body. Body color
 * green when `close >= open` (bull), red when `close < open` (bear).
 *
 * @example JS
 *   const ch = new CandlestickChart();
 *   ch.width  = 600;
 *   ch.height = 320;
 *   ch.data = [
 *     { t: 1, o: 100, h: 108, l: 98,  c: 105 },
 *     { t: 2, o: 105, h: 110, l: 102, c: 103 },
 *     // …
 *   ];
 *
 * @example HTML
 *   <arianna-candlestick-chart width="600" height="320"></arianna-candlestick-chart>
 *
 * Attrs: width, height, bull, bear
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _svg }      from './helpers.ts';

export interface CandleBar { t: number; o: number; h: number; l: number; c: number; }

export interface CandlestickChartOptions {
    data?   : CandleBar[];
    width?  : number;
    height? : number;
    bull?   : string;
    bear?   : string;
}

export class CandlestickChart extends Component('arianna-candlestick-chart', HTMLElement, {}, {
    attrs : ['width', 'height', 'bull', 'bear'],
    shadow: false,
})
{
    data$: Signal<CandleBar[]> = signal<CandleBar[]>([]);

    build(_opts: CandlestickChartOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');
        const bull  = this.attrSignal('bull');
        const bear  = this.attrSignal('bear');

        this.svgHtml = (): string => {
            const data = this.data$.get();
            if (!data.length) return '';

            const w = parseInt(wAttr.get() ?? '600', 10) || 600;
            const h = parseInt(hAttr.get() ?? '320', 10) || 320;
            const bullColor = bull.get() || 'var(--arianna-bull, #26a69a)';
            const bearColor = bear.get() || 'var(--arianna-bear, #ef5350)';

            const hi = Math.max(...data.map(d => d.h));
            const lo = Math.min(...data.map(d => d.l));
            const range = (hi - lo) || 1;
            const pad = 8;
            const cw = (w - pad * 2) / data.length;
            const yOf = (v: number) => h - pad - ((v - lo) / range) * (h - pad * 2);

            let svgInner = '';
            data.forEach((bar, i) => {
                const x = pad + i * cw + cw / 2;
                const color = bar.c >= bar.o ? bullColor : bearColor;
                // wick (high → low)
                svgInner += _svg('line', {
                    x1: x, x2: x,
                    y1: yOf(bar.h), y2: yOf(bar.l),
                    stroke: color,
                    'stroke-width': 1,
                });
                // body (open → close)
                const top = Math.min(yOf(bar.o), yOf(bar.c));
                const bh  = Math.max(2, Math.abs(yOf(bar.o) - yOf(bar.c)));
                svgInner += _svg('rect', {
                    x: x - cw * 0.35,
                    y: top,
                    width : cw * 0.7,
                    height: bh,
                    fill  : color,
                });
            });

            return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svgInner}</svg>`;
        };

        this.template = html`<div class="ar-candles" a-html="this.svgHtml()"></div>`;
        this.Sheet = CandlestickChart.DefaultSheet();
    }

    set data(rows: CandleBar[]) { this.data$.set(rows ?? []); }
    get data(): CandleBar[]     { return this.data$.get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get width(): number  { return parseInt(this.getAttribute('width') ?? '600', 10); }
    set width(v: number) { this.setAttribute('width', String(v)); }

    get height(): number  { return parseInt(this.getAttribute('height') ?? '320', 10); }
    set height(v: number) { this.setAttribute('height', String(v)); }

    private svgHtml: () => string = () => '';

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display     : 'inline-block',
                    overflow    : 'hidden',
                    padding     : '4px',
                }),
                new Rule(':root svg', { display: 'block' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'CandlestickChart', {
        value: CandlestickChart, writable: false, enumerable: false, configurable: false,
    });
}

export default CandlestickChart;
