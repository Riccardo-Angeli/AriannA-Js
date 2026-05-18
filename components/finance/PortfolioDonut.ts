/**
 * @module    components/finance/PortfolioDonut
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * PortfolioDonut — asset allocation donut chart. Outer ring filled with
 * one slice per segment, labels positioned just outside the ring.
 *
 * @example JS
 *   const d = new PortfolioDonut();
 *   d.size = 320;
 *   d.segments = [
 *     { label: 'Equity',      value: 50 },
 *     { label: 'Fixed Income', value: 30 },
 *     { label: 'Real Estate', value: 15 },
 *     { label: 'Cash',         value:  5 },
 *   ];
 *
 * @example HTML
 *   <arianna-portfolio-donut size="320"></arianna-portfolio-donut>
 *
 * Attrs: size
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _fmt, _esc } from './helpers.ts';

export interface DonutSegment {
    label : string;
    value : number;
    color?: string;
}

export interface PortfolioDonutOptions {
    segments? : DonutSegment[];
    size?     : number;
}

const PALETTE = [
    'var(--arianna-primary, #1f6feb)',
    'var(--arianna-bull,    #26a69a)',
    '#7b9ef9',
    'var(--arianna-warning, #f4c842)',
    'var(--arianna-bear,    #ef5350)',
    '#ff9800',
    '#ce93d8',
    '#80cbc4',
];

export class PortfolioDonut extends Component('arianna-portfolio-donut', HTMLElement, {}, {
    attrs : ['size'],
    shadow: false,
})
{
    segments$: Signal<DonutSegment[]> = signal<DonutSegment[]>([]);

    build(_opts: PortfolioDonutOptions = {})
    {
        const sizeAttr = this.attrSignal('size');

        this.svgHtml = (): string => {
            const segments = this.segments$.get();
            if (!segments.length) return '';

            const s = parseInt(sizeAttr.get() ?? '300', 10) || 300;
            const total = segments.reduce((a, x) => a + x.value, 0);
            if (total <= 0) return '';

            const cx = s / 2;
            const cy = s / 2;
            const R = cx * 0.7;
            const r = cx * 0.42;

            let angle = -Math.PI / 2;
            let arcs = '';
            let labels = '';

            segments.forEach((seg, i) => {
                const slice = (seg.value / total) * 2 * Math.PI;
                const x1 = cx + R * Math.cos(angle);
                const y1 = cy + R * Math.sin(angle);
                const x2 = cx + R * Math.cos(angle + slice);
                const y2 = cy + R * Math.sin(angle + slice);
                const ix1 = cx + r * Math.cos(angle);
                const iy1 = cy + r * Math.sin(angle);
                const ix2 = cx + r * Math.cos(angle + slice);
                const iy2 = cy + r * Math.sin(angle + slice);
                const large = slice > Math.PI ? 1 : 0;
                const color = seg.color ?? PALETTE[i % PALETTE.length];

                arcs += `<path d="M${ix1},${iy1} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${r},${r} 0 ${large},0 ${ix1},${iy1}" fill="${color}"/>`;

                const midA = angle + slice / 2;
                const lx = cx + R * 1.15 * Math.cos(midA);
                const ly = cy + R * 1.15 * Math.sin(midA);
                const pct = _fmt((seg.value / total) * 100);

                labels += `<text x="${lx}" y="${ly - 4}" fill="var(--arianna-text, #1f2328)" font-size="11" font-weight="600" text-anchor="middle">${pct}%</text>`;
                labels += `<text x="${lx}" y="${ly + 10}" fill="var(--arianna-muted, #787b86)" font-size="10" text-anchor="middle">${_esc(seg.label)}</text>`;

                angle += slice;
            });

            return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${arcs}${labels}</svg>`;
        };

        this.template = html`<div class="ar-donut" a-html="this.svgHtml()"></div>`;
        this.Sheet = PortfolioDonut.DefaultSheet();
    }

    set segments(v: DonutSegment[]) { this.segments$.set(v ?? []); }
    get segments(): DonutSegment[]  { return this.segments$.get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get size(): number  { return parseInt(this.getAttribute('size') ?? '300', 10); }
    set size(v: number) { this.setAttribute('size', String(v)); }

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
                    padding     : '8px',
                }),
                new Rule(':root svg', { display: 'block' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'PortfolioDonut', {
        value: PortfolioDonut, writable: false, enumerable: false, configurable: false,
    });
}

export default PortfolioDonut;
