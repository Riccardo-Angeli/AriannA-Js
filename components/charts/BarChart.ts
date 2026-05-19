/**
 * @module    components/charts/BarChart
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * BarChart — categorical bar chart on SVG.
 *
 *   const ch = new BarChart({ width: 480, height: 280 });
 *   ch.append(document.body);
 *   ch.data = [
 *     { label: 'Q1', value: 120 },
 *     { label: 'Q2', value: 180 },
 *     { label: 'Q3', value: 95  },
 *     { label: 'Q4', value: 210 },
 *   ];
 *
 *   <arianna-bar-chart width="480" height="280"></arianna-bar-chart>
 *
 * Events:
 *   arianna:chart-bar-hover { datum, index }
 *   arianna:chart-bar-click { datum, index }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface BarDatum {
    label : string;
    value : number;
    color?: string;
}

export interface BarChartOptions {
    width?     : number;
    height?    : number;
    barColor?  : string;
    showValues?: boolean;
    showGrid?  : boolean;
    yMin?      : number;
    yMax?      : number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export class BarChart extends Component('arianna-bar-chart', HTMLElement, {}, {
    attrs : ['width', 'height', 'bar-color', 'show-values', 'show-grid', 'y-min', 'y-max'],
})
{
    readonly data$: Signal<BarDatum[]> = signal<BarDatum[]>([]);

    #svg?: SVGSVGElement;

    constructor(opts: BarChartOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.width      != null) el.setAttribute('width',       String(opts.width));
        if (opts.height     != null) el.setAttribute('height',      String(opts.height));
        if (opts.barColor)           el.setAttribute('bar-color',   opts.barColor);
        if (opts.showValues != null) el.setAttribute('show-values', opts.showValues ? 'true' : 'false');
        if (opts.showGrid   === false) el.setAttribute('show-grid', 'false');
        if (opts.yMin       != null) el.setAttribute('y-min',       String(opts.yMin));
        if (opts.yMax       != null) el.setAttribute('y-max',       String(opts.yMax));
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('svg')) return;

        const w = parseInt(self.attrSignal('width')?.peek()  ?? '480', 10) || 480;
        const h = parseInt(self.attrSignal('height')?.peek() ?? '280', 10) || 280;
        const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('width',  String(w));
        svg.setAttribute('height', String(h));
        svg.setAttribute('class', 'bc-svg');
        this.#svg = svg;
        root.appendChild(svg);

        effect(() => { this.data$.get(); this.#redraw(); });

        self.Sheet = BarChart.DefaultSheet();
    }

    set data(rows: BarDatum[]) { this.data$.set(rows); }
    get data(): BarDatum[]     { return this.data$.get(); }

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
        const h = parseInt(svg.getAttribute('height') ?? '280', 10);
        const data = this.data$.peek();
        if (!data.length) return;

        const showGrid   = self.attrSignal('show-grid')?.peek() !== 'false';
        const showValues = self.attrSignal('show-values')?.peek() === 'true';
        const barColor   = self.attrSignal('bar-color')?.peek() ?? '';
        const cssBarColor = barColor || (getComputedStyle(root).getPropertyValue('--ar-primary').trim() || '#7eb8f7');

        const padL = 40, padR = 12, padT = 12, padB = 28;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        const userMin = parseFloat(self.attrSignal('y-min')?.peek() ?? '');
        const userMax = parseFloat(self.attrSignal('y-max')?.peek() ?? '');
        const dataMax = Math.max(...data.map(d => d.value));
        const dataMin = Math.min(...data.map(d => d.value));
        const yMax = isFinite(userMax) ? userMax : Math.max(0, dataMax) * 1.1;
        const yMin = isFinite(userMin) ? userMin : Math.min(0, dataMin);
        const range = (yMax - yMin) || 1;

        const yOf = (v: number) => padT + plotH - ((v - yMin) / range) * plotH;
        const barW = plotW / data.length * 0.72;
        const gap  = plotW / data.length * 0.28;

        // Grid + Y axis ticks
        if (showGrid) {
            const ticks = 5;
            for (let i = 0; i <= ticks; i++) {
                const v = yMin + (range * i / ticks);
                const y = yOf(v);
                const line = document.createElementNS(SVG_NS, 'line');
                line.setAttribute('x1', String(padL));
                line.setAttribute('x2', String(w - padR));
                line.setAttribute('y1', String(y));
                line.setAttribute('y2', String(y));
                line.setAttribute('class', 'bc-grid');
                svg.appendChild(line);
                const lbl = document.createElementNS(SVG_NS, 'text');
                lbl.setAttribute('x', String(padL - 4));
                lbl.setAttribute('y', String(y + 4));
                lbl.setAttribute('class', 'bc-tick');
                lbl.setAttribute('text-anchor', 'end');
                lbl.textContent = v.toFixed(range > 10 ? 0 : 1);
                svg.appendChild(lbl);
            }
        }

        // Bars + X labels
        data.forEach((d, i) => {
            const x = padL + i * (barW + gap) + gap / 2;
            const yV = yOf(d.value);
            const y0 = yOf(0);
            const top = Math.min(yV, y0);
            const ht  = Math.abs(yV - y0);
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('x', String(x));
            rect.setAttribute('y', String(top));
            rect.setAttribute('width',  String(barW));
            rect.setAttribute('height', String(Math.max(1, ht)));
            rect.setAttribute('fill', d.color ?? cssBarColor);
            rect.setAttribute('class', 'bc-bar');
            rect.addEventListener('mouseenter', () =>
                self.fire('arianna:chart-bar-hover', { detail: { datum: d, index: i, source: this }, bubbles: true }));
            rect.addEventListener('click', () =>
                self.fire('arianna:chart-bar-click', { detail: { datum: d, index: i, source: this }, bubbles: true }));
            svg.appendChild(rect);

            if (showValues) {
                const val = document.createElementNS(SVG_NS, 'text');
                val.setAttribute('x', String(x + barW / 2));
                val.setAttribute('y', String(top - 4));
                val.setAttribute('text-anchor', 'middle');
                val.setAttribute('class', 'bc-val');
                val.textContent = d.value.toFixed(range > 10 ? 0 : 1);
                svg.appendChild(val);
            }

            const lbl = document.createElementNS(SVG_NS, 'text');
            lbl.setAttribute('x', String(x + barW / 2));
            lbl.setAttribute('y', String(h - padB + 18));
            lbl.setAttribute('text-anchor', 'middle');
            lbl.setAttribute('class', 'bc-label');
            lbl.textContent = d.label;
            svg.appendChild(lbl);
        });

        // Zero line if range crosses zero
        if (yMin < 0 && yMax > 0) {
            const y0 = yOf(0);
            const zero = document.createElementNS(SVG_NS, 'line');
            zero.setAttribute('x1', String(padL));
            zero.setAttribute('x2', String(w - padR));
            zero.setAttribute('y1', String(y0));
            zero.setAttribute('y2', String(y0));
            zero.setAttribute('class', 'bc-zero');
            svg.appendChild(zero);
        }
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
                padding     : '8px',
            }),
            new Rule(':host .bc-svg', { display: 'block' }),
            new Rule(':host .bc-grid', { stroke: 'var(--ar-border, #e0e0e0)', strokeWidth: '1' }),
            new Rule(':host .bc-zero', { stroke: 'var(--ar-text, #1a1a1a)', strokeWidth: '1' }),
            new Rule(':host .bc-tick', { fill: 'var(--ar-muted, #888)', fontSize: '11px' }),
            new Rule(':host .bc-label', { fill: 'var(--ar-text, #1a1a1a)', fontSize: '12px' }),
            new Rule(':host .bc-val', { fill: 'var(--ar-text, #1a1a1a)', fontSize: '11px', fontWeight: '600' }),
            new Rule(':host .bc-bar', { cursor: 'pointer', transition: 'opacity 0.15s' }),
            new Rule(':host .bc-bar:hover', { opacity: '0.8' }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'BarChart', {
        value: BarChart, writable: false, enumerable: false, configurable: false,
    });
}

export default BarChart;
