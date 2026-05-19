/**
 * @module    components/finance/LineChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * LineChart — multi-series line chart with horizontal gridlines, value
 * labels on the y-axis, and an inline legend. Up to 6 default colors
 * from the AriannA finance palette before they cycle.
 *
 * @example JS
 *   const lc = new LineChart();
 *   lc.width = 600; lc.height = 320;
 *   lc.series = [
 *     { name: 'AAPL', data: [...] },
 *     { name: 'MSFT', data: [...] },
 *   ];
 *
 * @example HTML
 *   <arianna-line-chart width="600" height="300"></arianna-line-chart>
 *
 * Attrs: width, height
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _svg, _fmt, _esc } from './helpers.ts';

export interface LineChartSeries {
    name  : string;
    data  : number[];
    color?: string;
}

export interface LineChartOptions {
    series? : LineChartSeries[];
    width?  : number;
    height? : number;
}

const PALETTE = [
    'var(--arianna-primary, #1f6feb)',
    'var(--arianna-bull,    #26a69a)',
    'var(--arianna-bear,    #ef5350)',
    'var(--arianna-warning, #f5a623)',
    '#7b9ef9',
    '#ce93d8',
];

export class LineChart extends Component('arianna-line-chart', HTMLElement, {}, {
    attrs : ['width', 'height'],
})
{
    series$: Signal<LineChartSeries[]> = signal<LineChartSeries[]>([]);

    build(_opts: LineChartOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');

        this.svgHtml = (): string => {
            const series = this.series$.get();
            if (!series.length) return '';

            const w = parseInt(wAttr.get() ?? '600', 10) || 600;
            const h = parseInt(hAttr.get() ?? '300', 10) || 300;

            const pad = { l: 55, r: 20, t: 20, b: 36 };
            const W = w - pad.l - pad.r;
            const H = h - pad.t - pad.b;
            const all = series.flatMap(s => s.data);
            const mn  = Math.min(...all);
            const mx  = Math.max(...all);
            const rng = mx - mn || 1;
            const maxLen = Math.max(...series.map(s => s.data.length), 2);
            const xS = (i: number) => pad.l + (i / (maxLen - 1)) * W;
            const yS = (v: number) => pad.t + ((mx - v) / rng) * H;

            let grid = '';
            for (let i = 0; i <= 4; i++) {
                const v = mn + (i / 4) * rng;
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

            let lines = '', legend = '';
            series.forEach((s, si) => {
                const color = s.color ?? PALETTE[si % PALETTE.length];
                const last  = s.data.length - 1 || 1;
                const pts = s.data.map((v, i) => `${pad.l + (i / last) * W},${yS(v)}`).join(' ');
                lines += _svg('polyline', {
                    points: pts,
                    fill  : 'none',
                    stroke: color,
                    'stroke-width': 2,
                    'stroke-linejoin': 'round',
                });
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

        this.template = html`<div class="ar-linechart" a-html="this.svgHtml()"></div>`;
        (this as unknown as { Sheet: Stylesheet | null }).Sheet = LineChart.DefaultSheet();
    }

    set series(v: LineChartSeries[]) { this.series$.set(v ?? []); }
    get series(): LineChartSeries[]  { return this.series$.get(); }

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
    Object.defineProperty(window, 'FinanceLineChart', {
        value: LineChart, writable: false, enumerable: false, configurable: false,
    });
}

export default LineChart;
