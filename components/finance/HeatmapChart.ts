/**
 * @module    components/finance/HeatmapChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * HeatmapChart — N×N correlation / sector heatmap. Values in [-1, 1] map
 * to a diverging color ramp (bear-red at -1, neutral at 0, bull-green at +1).
 *
 * @example JS
 *   const h = new HeatmapChart();
 *   h.setData(['AAPL', 'MSFT', 'GOOG'], [
 *     [1.00, 0.82, 0.65],
 *     [0.82, 1.00, 0.71],
 *     [0.65, 0.71, 1.00],
 *   ]);
 *
 * @example HTML
 *   <arianna-heatmap-chart width="500" height="500"></arianna-heatmap-chart>
 *
 * Attrs: width, height
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _svg, _fmt, _esc } from './helpers.ts';

export interface HeatmapChartOptions {
    labels? : string[];
    matrix? : number[][];
    width?  : number;
    height? : number;
}

export class HeatmapChart extends Component('arianna-heatmap-chart', HTMLElement, {}, {
    attrs : ['width', 'height'],
    shadow: false,
})
{
    labels$: Signal<string[]>   = signal<string[]>([]);
    matrix$: Signal<number[][]> = signal<number[][]>([]);

    build(_opts: HeatmapChartOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');

        this.svgHtml = (): string => {
            const labels = this.labels$.get();
            const matrix = this.matrix$.get();
            if (!labels.length || !matrix.length) return '';

            const w = parseInt(wAttr.get() ?? '500', 10) || 500;
            const h = parseInt(hAttr.get() ?? '500', 10) || 500;

            const n = labels.length;
            const pad   = 60;
            const cellW = (w - pad) / n;
            const cellH = (h - pad) / n;

            let cells = '', axes = '';
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const v = matrix[i]?.[j] ?? 0;
                    // Diverging ramp: -1 (red) → 0 (neutral) → +1 (green)
                    let r: number, g: number, b: number;
                    if (v < 0) {
                        const t = Math.min(1, -v);
                        r = Math.round(239 * t + 245 * (1 - t));
                        g = Math.round( 83 * t + 245 * (1 - t));
                        b = Math.round( 80 * t + 245 * (1 - t));
                    } else {
                        const t = Math.min(1, v);
                        r = Math.round( 38 * t + 245 * (1 - t));
                        g = Math.round(166 * t + 245 * (1 - t));
                        b = Math.round(154 * t + 245 * (1 - t));
                    }
                    const x = pad + j * cellW;
                    const y = pad + i * cellH;
                    cells += _svg('rect', {
                        x, y, width: cellW, height: cellH,
                        fill: `rgb(${r},${g},${b})`,
                        stroke: 'var(--arianna-bg, #fff)',
                        'stroke-width': 1,
                    });
                    // Pick text color based on cell luminance (rough heuristic)
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    const textColor = lum > 160 ? '#000' : '#fff';
                    cells += _svg('text', {
                        x: x + cellW / 2,
                        y: y + cellH / 2 + 4,
                        fill: textColor,
                        'font-size': 10,
                        'text-anchor': 'middle',
                    }, _fmt(v));
                }
                axes += _svg('text', {
                    x: pad + i * cellW + cellW / 2,
                    y: pad - 6,
                    fill: 'var(--arianna-muted, #787b86)',
                    'font-size': 11,
                    'text-anchor': 'middle',
                }, _esc(labels[i] ?? ''));
                axes += _svg('text', {
                    x: pad - 6,
                    y: pad + i * cellH + cellH / 2 + 4,
                    fill: 'var(--arianna-muted, #787b86)',
                    'font-size': 11,
                    'text-anchor': 'end',
                }, _esc(labels[i] ?? ''));
            }

            return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                 + axes + cells
                 + `</svg>`;
        };

        this.template = html`<div class="ar-heatmap" a-html="this.svgHtml()"></div>`;
        this.Sheet = HeatmapChart.DefaultSheet();
    }

    /** Convenience: set labels and matrix together. */
    setData(labels: string[], matrix: number[][]): this {
        this.labels$.set(labels ?? []);
        this.matrix$.set(matrix ?? []);
        return this;
    }

    set labels(v: string[]) { this.labels$.set(v ?? []); }
    get labels(): string[]  { return this.labels$.get(); }

    set matrix(v: number[][]) { this.matrix$.set(v ?? []); }
    get matrix(): number[][]  { return this.matrix$.get(); }

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
    Object.defineProperty(window, 'HeatmapChart', {
        value: HeatmapChart, writable: false, enumerable: false, configurable: false,
    });
}

export default HeatmapChart;
