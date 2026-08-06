/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes: width, height
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _svg, _fmt, _esc } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
export interface LineChartSeries {
    name: string;
    data: number[];
    color?: string;
}
export interface LineChartOptions {
    series?: LineChartSeries[];
    width?: number;
    height?: number;
}
const PALETTE = [
    'var(--arianna-primary, #1f6feb)',
    'var(--arianna-bull,    #26a69a)',
    'var(--arianna-bear,    #ef5350)',
    'var(--arianna-warning, #f5a623)',
    '#7b9ef9',
    '#ce93d8',
];
@Component('arianna-finance-line-chart', {}, {
    Attributes: ['width', 'height'],
})
export class FinanceLineChart extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    series$: Signal<LineChartSeries[]> = signal<LineChartSeries[]>([]);
    onConnected(_opts: LineChartOptions = {}) {
        const wAttr = this.signal().attribute('width');
        const hAttr = this.signal().attribute('height');
        this.svgHtml = (): string => {
            const series = this.series$.Get();
            if (!series.length)
                return '';
            const w = parseInt(wAttr.Get() ?? '600', 10) || 600;
            const h = parseInt(hAttr.Get() ?? '300', 10) || 300;
            const pad = { l: 55, r: 20, t: 20, b: 36 };
            const W = w - pad.l - pad.r;
            const H = h - pad.t - pad.b;
            const all = series.flatMap(s => s.data);
            const mn = Math.min(...all);
            const mx = Math.max(...all);
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
                const last = s.data.length - 1 || 1;
                const pts = s.data.map((v, i) => `${pad.l + (i / last) * W},${yS(v)}`).join(' ');
                lines += _svg('polyline', {
                    points: pts,
                    fill: 'none',
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
        this.template = html `<div class="ar-linechart" a-html="this.svgHtml()"></div>`;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = FinanceLineChart.DefaultSheet();
    }
    set series(v: LineChartSeries[]) { this.series$.Set(v ?? []); }
    get series(): LineChartSeries[] { return this.series$.Get(); }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    private svgHtml: () => string = () => '';
    static DefaultSheet(): Stylesheet {
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
/* ──────────────────────────────────────────────────────────────────────────
 * FinanceLineChart namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace FinanceLineChart {
    export namespace Interfaces {
        export interface LineChartSeriesContract extends LineChartSeries {
        }
        export interface LineChartOptionsContract extends LineChartOptions {
        }
    }
}
export default FinanceLineChart;
