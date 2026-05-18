/**
 * @module    components/finance/PnLChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * PnLChart — bar chart with zero-line centered. Positive bars rise upward
 * in bull-green, negative bars drop downward in bear-red.
 *
 * @example JS
 *   const c = new PnLChart();
 *   c.data = [
 *     { label: 'Mon', pnl:  1240 },
 *     { label: 'Tue', pnl:  -480 },
 *     { label: 'Wed', pnl:  2150 },
 *     { label: 'Thu', pnl:  -890 },
 *     { label: 'Fri', pnl:  3100 },
 *   ];
 *
 * @example HTML
 *   <arianna-pnl-chart width="500" height="240"></arianna-pnl-chart>
 *
 * Attrs: width, height
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _svg, _fmtK, _esc } from './helpers.ts';

export interface PnLBar { label: string; pnl: number; }

export interface PnLChartOptions {
    data?   : PnLBar[];
    width?  : number;
    height? : number;
}

export class PnLChart extends Component('arianna-pnl-chart', HTMLElement, {}, {
    attrs : ['width', 'height'],
    shadow: false,
})
{
    data$: Signal<PnLBar[]> = signal<PnLBar[]>([]);

    build(_opts: PnLChartOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');

        this.svgHtml = (): string => {
            const data = this.data$.get();
            if (!data.length) return '';

            const w = parseInt(wAttr.get() ?? '500', 10) || 500;
            const h = parseInt(hAttr.get() ?? '250', 10) || 250;

            const pad = { l: 70, r: 20, t: 20, b: 40 };
            const W = w - pad.l - pad.r;
            const H = h - pad.t - pad.b;

            const maxAbs = Math.max(...data.map(d => Math.abs(d.pnl))) || 1;
            const bw = Math.max(1, W / data.length - 4);
            const yZ = pad.t + H / 2;
            const yS = (v: number) => v >= 0 ? yZ - (v / maxAbs) * (H / 2) : yZ;
            const bH = (v: number) => Math.max(1, (Math.abs(v) / maxAbs) * (H / 2));

            const bull = 'var(--arianna-bull, #26a69a)';
            const bear = 'var(--arianna-bear, #ef5350)';

            let bars = '', labels = '';
            data.forEach((d, i) => {
                const x = pad.l + i * (W / data.length) + 2;
                const color = d.pnl >= 0 ? bull : bear;
                bars += _svg('rect', {
                    x, y: yS(d.pnl),
                    width: bw,
                    height: bH(d.pnl),
                    fill: color,
                    rx: 1,
                });
                labels += _svg('text', {
                    x: x + bw / 2,
                    y: pad.t + H + 16,
                    fill: 'var(--arianna-muted, #787b86)',
                    'font-size': 10,
                    'text-anchor': 'middle',
                }, _esc(d.label));
            });

            let axes = _svg('line', {
                x1: pad.l, y1: yZ, x2: pad.l + W, y2: yZ,
                stroke: 'var(--arianna-border, #e0e0e0)',
                'stroke-width': 1,
            });
            for (let i = -2; i <= 2; i++) {
                const v = (i / 2) * maxAbs;
                const y = yZ - (i / 2) * (H / 2);
                axes += _svg('text', {
                    x: pad.l - 6, y: y + 4,
                    fill: 'var(--arianna-muted, #787b86)',
                    'font-size': 10,
                    'text-anchor': 'end',
                }, _fmtK(v));
            }

            return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                 + axes + bars + labels
                 + `</svg>`;
        };

        this.template = html`<div class="ar-pnl" a-html="this.svgHtml()"></div>`;
        this.Sheet = PnLChart.DefaultSheet();
    }

    set data(v: PnLBar[]) { this.data$.set(v ?? []); }
    get data(): PnLBar[]  { return this.data$.get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

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
                    padding     : '4px',
                }),
                new Rule(':root svg', { display: 'block' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'PnLChart', {
        value: PnLChart, writable: false, enumerable: false, configurable: false,
    });
}

export default PnLChart;
