/**
 * @module    components/charts/PieChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * PieChart — pie / donut chart on SVG.
 *
 *   const ch = new PieChart({ size: 280, donut: 0.55 });
 *   ch.append(document.body);
 *   ch.data = [
 *     { label: 'Apple',  value: 42, color: '#7eb8f7' },
 *     { label: 'Orange', value: 28, color: '#f7c97e' },
 *     { label: 'Pear',   value: 16, color: '#7ef7a8' },
 *     { label: 'Other',  value: 14, color: '#888'    },
 *   ];
 *
 *   <arianna-pie-chart size="280" donut="0.55"></arianna-pie-chart>
 *
 * Events:
 *   arianna:chart-slice-hover { datum, index, percent }
 *   arianna:chart-slice-click { datum, index, percent }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface PieDatum {
    label : string;
    value : number;
    color?: string;
}

export interface PieChartOptions {
    size?       : number;     // SVG square size
    donut?      : number;     // 0..1 — inner radius ratio (0 = pie, 0.5 = donut)
    showLegend? : boolean;    // default true
    showLabels? : boolean;    // labels on slices
    startAngle? : number;     // radians, default -90deg
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number): string {
    const [x0, y0] = polar(cx, cy, rOuter, a0);
    const [x1, y1] = polar(cx, cy, rOuter, a1);
    const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
    if (rInner <= 0) {
        return `M ${cx} ${cy} L ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1} ${y1} Z`;
    }
    const [x2, y2] = polar(cx, cy, rInner, a1);
    const [x3, y3] = polar(cx, cy, rInner, a0);
    return [
        `M ${x0} ${y0}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x3} ${y3}`,
        'Z',
    ].join(' ');
}

export class PieChart extends Component('arianna-pie-chart', HTMLElement, {}, {
    attrs : ['size', 'donut', 'show-legend', 'show-labels', 'start-angle'],
})
{
    readonly data$: Signal<PieDatum[]> = signal<PieDatum[]>([]);

    #svg?    : SVGSVGElement;
    #legend? : HTMLDivElement;

    constructor(opts: PieChartOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.size       != null) el.setAttribute('size',        String(opts.size));
        if (opts.donut      != null) el.setAttribute('donut',       String(opts.donut));
        if (opts.showLegend === false) el.setAttribute('show-legend', 'false');
        if (opts.showLabels === true)  el.setAttribute('show-labels', '');
        if (opts.startAngle != null) el.setAttribute('start-angle', String(opts.startAngle));
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.pc-wrap')) return;

        const size = parseInt(self.attrSignal('size')?.peek() ?? '280', 10) || 280;
        const wrap = document.createElement('div');
        wrap.className = 'pc-wrap';

        const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.setAttribute('width',  String(size));
        svg.setAttribute('height', String(size));
        svg.setAttribute('class', 'pc-svg');
        this.#svg = svg;
        wrap.appendChild(svg);

        const legend = document.createElement('div');
        legend.className = 'pc-legend';
        this.#legend = legend;
        wrap.appendChild(legend);

        root.appendChild(wrap);

        effect(() => { this.data$.get(); this.#redraw(); });

        self.Sheet = PieChart.DefaultSheet();
    }

    set data(rows: PieDatum[]) { this.data$.set(rows); }
    get data(): PieDatum[]     { return this.data$.get(); }

    #redraw(): void {
        const self = this as unknown as {
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
        };
        const svg = this.#svg;
        const legend = this.#legend;
        if (!svg || !legend) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        legend.innerHTML = '';

        const data = this.data$.peek();
        if (!data.length) return;

        const size = parseInt(svg.getAttribute('width') ?? '280', 10);
        const cx = size / 2, cy = size / 2;
        const rOuter = size / 2 - 6;
        const donut  = parseFloat(self.attrSignal('donut')?.peek() ?? '0') || 0;
        const rInner = rOuter * Math.max(0, Math.min(0.9, donut));
        let angle    = parseFloat(self.attrSignal('start-angle')?.peek() ?? String(-Math.PI / 2)) || -Math.PI / 2;
        const total  = data.reduce((s, d) => s + d.value, 0) || 1;
        const showLabels = self.attrSignal('show-labels')?.peek() != null;
        const showLegend = self.attrSignal('show-legend')?.peek() !== 'false';

        legend.style.display = showLegend ? '' : 'none';

        data.forEach((d, i) => {
            const slice = (d.value / total) * Math.PI * 2;
            const a0 = angle;
            const a1 = angle + slice;
            angle = a1;

            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', arcPath(cx, cy, rOuter, rInner, a0, a1));
            path.setAttribute('fill', d.color ?? this.#defaultColor(i));
            path.setAttribute('class', 'pc-slice');
            const pct = (d.value / total) * 100;
            path.addEventListener('mouseenter', () =>
                self.fire('arianna:chart-slice-hover', { detail: { datum: d, index: i, percent: pct, source: this }, bubbles: true }));
            path.addEventListener('click', () =>
                self.fire('arianna:chart-slice-click', { detail: { datum: d, index: i, percent: pct, source: this }, bubbles: true }));
            svg.appendChild(path);

            if (showLabels) {
                const mid = (a0 + a1) / 2;
                const r = rInner > 0 ? (rInner + rOuter) / 2 : rOuter * 0.65;
                const [lx, ly] = polar(cx, cy, r, mid);
                const lbl = document.createElementNS(SVG_NS, 'text');
                lbl.setAttribute('x', String(lx));
                lbl.setAttribute('y', String(ly + 4));
                lbl.setAttribute('text-anchor', 'middle');
                lbl.setAttribute('class', 'pc-label');
                lbl.textContent = pct.toFixed(0) + '%';
                svg.appendChild(lbl);
            }

            // Legend item
            const li = document.createElement('div');
            li.className = 'pc-legend-item';
            const sw = document.createElement('span');
            sw.className = 'pc-legend-sw';
            sw.style.background = d.color ?? this.#defaultColor(i);
            const lbl = document.createElement('span');
            lbl.className = 'pc-legend-lbl';
            lbl.textContent = `${d.label} · ${pct.toFixed(1)}%`;
            li.appendChild(sw); li.appendChild(lbl);
            legend.appendChild(li);
        });
    }

    #defaultColor(i: number): string {
        const palette = ['#7eb8f7', '#f47e7e', '#7ef7a8', '#f7c97e', '#b87ef7', '#7ef7e3', '#f77ec4', '#a8f77e'];
        return palette[i % palette.length] ?? '#7eb8f7';
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #fff)',
                border      : '1px solid var(--ar-border, #e0e0e0)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #1a1a1a)',
                display     : 'inline-block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                padding     : '12px',
            }),
            new Rule(':host .pc-wrap', {
                alignItems: 'center',
                display   : 'flex',
                gap       : '16px',
            }),
            new Rule(':host .pc-svg', { display: 'block' }),
            new Rule(':host .pc-slice', {
                cursor    : 'pointer',
                stroke    : 'var(--ar-bg, #fff)',
                strokeWidth: '2',
                transition: 'opacity 0.15s',
            }),
            new Rule(':host .pc-slice:hover', { opacity: '0.85' }),
            new Rule(':host .pc-label', {
                fill       : '#fff',
                fontSize   : '11px',
                fontWeight : '700',
                pointerEvents: 'none',
                textShadow : '0 1px 2px rgba(0,0,0,0.5)',
            }),
            new Rule(':host .pc-legend', {
                display      : 'flex',
                flexDirection: 'column',
                gap          : '4px',
            }),
            new Rule(':host .pc-legend-item', {
                alignItems: 'center',
                display   : 'flex',
                fontSize  : '0.78rem',
                gap       : '6px',
            }),
            new Rule(':host .pc-legend-sw', {
                borderRadius: '2px',
                display     : 'inline-block',
                height      : '12px',
                width       : '12px',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'PieChart', {
        value: PieChart, writable: false, enumerable: false, configurable: false,
    });
}

export default PieChart;
