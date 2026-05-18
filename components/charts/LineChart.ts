/**
 * @module    components/charts/LineChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * LineChart — line chart on SVG with optional area fill and multi-series.
 *
 *   const ch = new LineChart({ width: 480, height: 240 });
 *   ch.append(document.body);
 *   ch.series = [
 *     { name: 'A', color: '#7eb8f7', points: [[0,10],[1,18],[2,14],[3,22]] },
 *     { name: 'B', color: '#f47e7e', points: [[0,5], [1,8], [2,12],[3,9]]  },
 *   ];
 *
 *   <arianna-line-chart width="480" height="240" area></arianna-line-chart>
 *
 * Events:
 *   arianna:chart-point-hover { series, point, index }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';

export type LinePoint = [number, number];   // [x, y]

export interface LineSeries {
    name   : string;
    points : LinePoint[];
    color? : string;
}

export interface LineChartOptions {
    width?     : number;
    height?    : number;
    area?      : boolean;        // fill below the line
    smooth?    : boolean;        // Catmull-Rom smoothing
    showGrid?  : boolean;
    showDots?  : boolean;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export class LineChart extends Component('arianna-line-chart', HTMLElement, {}, {
    attrs : ['width', 'height', 'area', 'smooth', 'show-grid', 'show-dots'],
    shadow: false,
})
{
    readonly series$: Signal<LineSeries[]> = signal<LineSeries[]>([]);

    #svg?: SVGSVGElement;

    constructor(opts: LineChartOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.width      != null) el.setAttribute('width',  String(opts.width));
        if (opts.height     != null) el.setAttribute('height', String(opts.height));
        if (opts.area)               el.setAttribute('area',   '');
        if (opts.smooth)             el.setAttribute('smooth', '');
        if (opts.showGrid === false) el.setAttribute('show-grid', 'false');
        if (opts.showDots === true)  el.setAttribute('show-dots', '');
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Sheet | null;
        };
        const root = self.render();
        if (root.querySelector('svg')) return;

        const w = parseInt(self.attrSignal('width')?.peek()  ?? '480', 10) || 480;
        const h = parseInt(self.attrSignal('height')?.peek() ?? '240', 10) || 240;
        const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('width',  String(w));
        svg.setAttribute('height', String(h));
        svg.setAttribute('class', 'lc-svg');
        this.#svg = svg;
        root.appendChild(svg);

        effect(() => { this.series$.get(); this.#redraw(); });

        self.Sheet = LineChart.DefaultSheet();
    }

    set series(s: LineSeries[]) { this.series$.set(s); }
    get series(): LineSeries[]  { return this.series$.get(); }

    #redraw(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
        };
        const svg = this.#svg;
        if (!svg) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const root = self.render();
        const w = parseInt(svg.getAttribute('width')  ?? '480', 10);
        const h = parseInt(svg.getAttribute('height') ?? '240', 10);
        const series = this.series$.peek();
        if (!series.length) return;

        const showGrid = self.attrSignal('show-grid')?.peek() !== 'false';
        const showDots = self.attrSignal('show-dots')?.peek() != null;
        const fillArea = root.hasAttribute('area');
        const smooth   = root.hasAttribute('smooth');

        const padL = 40, padR = 12, padT = 12, padB = 28;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        // Compute range
        let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        for (const s of series) for (const [x, y] of s.points) {
            if (x < xMin) xMin = x; if (x > xMax) xMax = x;
            if (y < yMin) yMin = y; if (y > yMax) yMax = y;
        }
        if (!isFinite(xMin)) { xMin = 0; xMax = 1; yMin = 0; yMax = 1; }
        const xR = (xMax - xMin) || 1, yR = (yMax - yMin) || 1;
        const xOf = (x: number) => padL + ((x - xMin) / xR) * plotW;
        const yOf = (y: number) => padT + plotH - ((y - yMin) / yR) * plotH;

        // Grid
        if (showGrid) {
            const ticks = 4;
            for (let i = 0; i <= ticks; i++) {
                const v = yMin + (yR * i / ticks);
                const y = yOf(v);
                const line = document.createElementNS(SVG_NS, 'line');
                line.setAttribute('x1', String(padL));
                line.setAttribute('x2', String(w - padR));
                line.setAttribute('y1', String(y));
                line.setAttribute('y2', String(y));
                line.setAttribute('class', 'lc-grid');
                svg.appendChild(line);
                const lbl = document.createElementNS(SVG_NS, 'text');
                lbl.setAttribute('x', String(padL - 4));
                lbl.setAttribute('y', String(y + 4));
                lbl.setAttribute('text-anchor', 'end');
                lbl.setAttribute('class', 'lc-tick');
                lbl.textContent = v.toFixed(yR > 10 ? 0 : 1);
                svg.appendChild(lbl);
            }
        }

        // Each series
        series.forEach((s, sIdx) => {
            if (!s.points.length) return;
            const color = s.color ?? this.#defaultColor(sIdx);

            // Path
            const path = this.#buildPath(s.points, xOf, yOf, smooth);
            if (fillArea) {
                const area = document.createElementNS(SVG_NS, 'path');
                const y0 = yOf(Math.max(0, yMin));
                const xs = s.points[0]?.[0] ?? 0;
                const xe = s.points[s.points.length - 1]?.[0] ?? 0;
                area.setAttribute('d',
                    `M ${xOf(xs)} ${y0} ` + path.replace(/^M /, 'L ') + ` L ${xOf(xe)} ${y0} Z`);
                area.setAttribute('fill', color);
                area.setAttribute('class', 'lc-area');
                svg.appendChild(area);
            }
            const ln = document.createElementNS(SVG_NS, 'path');
            ln.setAttribute('d', path);
            ln.setAttribute('fill', 'none');
            ln.setAttribute('stroke', color);
            ln.setAttribute('class', 'lc-line');
            svg.appendChild(ln);

            // Dots
            if (showDots) {
                s.points.forEach(([x, y], i) => {
                    const c = document.createElementNS(SVG_NS, 'circle');
                    c.setAttribute('cx', String(xOf(x)));
                    c.setAttribute('cy', String(yOf(y)));
                    c.setAttribute('r', '3');
                    c.setAttribute('fill', color);
                    c.setAttribute('class', 'lc-dot');
                    c.addEventListener('mouseenter', () =>
                        self.fire('arianna:chart-point-hover',
                            { detail: { series: s, point: [x, y], index: i, source: this }, bubbles: true }));
                    svg.appendChild(c);
                });
            }
        });
    }

    #buildPath(pts: LinePoint[], xOf: (x: number) => number, yOf: (y: number) => number, smooth: boolean): string {
        if (!pts.length) return '';
        if (!smooth || pts.length < 3) {
            return 'M ' + pts.map(([x, y]) => `${xOf(x)} ${yOf(y)}`).join(' L ');
        }
        // Catmull-Rom → Bezier
        const points = pts.map(([x, y]) => [xOf(x), yOf(y)] as [number, number]);
        let d = `M ${points[0]![0]} ${points[0]![1]}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] ?? points[i]!;
            const p1 = points[i]!;
            const p2 = points[i + 1]!;
            const p3 = points[i + 2] ?? p2;
            const c1x = p1[0] + (p2[0] - p0[0]) / 6;
            const c1y = p1[1] + (p2[1] - p0[1]) / 6;
            const c2x = p2[0] - (p3[0] - p1[0]) / 6;
            const c2y = p2[1] - (p3[1] - p1[1]) / 6;
            d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
        }
        return d;
    }

    #defaultColor(i: number): string {
        const palette = ['#7eb8f7', '#f47e7e', '#7ef7a8', '#f7c97e', '#b87ef7', '#7ef7e3'];
        return palette[i % palette.length] ?? '#7eb8f7';
    }

    static DefaultSheet(): Sheet {
        return new Sheet([
            new Rule(':root', {
                background  : 'var(--ar-bg, #fff)',
                border      : '1px solid var(--ar-border, #e0e0e0)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #1a1a1a)',
                display     : 'inline-block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                padding     : '8px',
            }),
            new Rule(':root .lc-svg', { display: 'block' }),
            new Rule(':root .lc-grid', { stroke: 'var(--ar-border, #e0e0e0)', strokeWidth: '1' }),
            new Rule(':root .lc-tick', { fill: 'var(--ar-muted, #888)', fontSize: '11px' }),
            new Rule(':root .lc-line', { strokeWidth: '2', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
            new Rule(':root .lc-area', { opacity: '0.15' }),
            new Rule(':root .lc-dot',  { cursor: 'pointer' }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'LineChart', {
        value: LineChart, writable: false, enumerable: false, configurable: false,
    });
}

export default LineChart;
