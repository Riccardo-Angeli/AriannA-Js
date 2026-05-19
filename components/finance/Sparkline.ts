/**
 * @module    components/finance/Sparkline
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Sparkline — mini inline price line. Auto-colors green/red based on
 * first-vs-last comparison unless `color` is set explicitly.
 *
 * @example HTML
 *   <arianna-sparkline width="80" height="24"></arianna-sparkline>
 *
 * @example JS
 *   const s = new Sparkline();
 *   s.data = [100, 102, 99, 105, 110];
 *   document.body.appendChild(s);
 *
 * Attrs: width, height, color
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _svg }      from './helpers.ts';

export interface SparklineOptions {
    data?  : number[];
    width? : number;
    height?: number;
    color? : string;
}

export class Sparkline extends Component('arianna-sparkline', HTMLElement, {}, {
    attrs : ['width', 'height', 'color'],
})
{
    data$: Signal<number[]> = signal<number[]>([]);

    build(_opts: SparklineOptions = {})
    {
        const w = this.attrSignal('width');
        const h = this.attrSignal('height');
        const c = this.attrSignal('color');

        this.svgHtml = (): string => {
            const data = this.data$.get();
            if (!data.length) return '';
            const W = parseInt(w.get() ?? '100', 10) || 100;
            const H = parseInt(h.get() ?? '30', 10)  || 30;
            const explicit = c.get();
            const auto = data[data.length - 1] >= data[0]
                ? 'var(--arianna-bull, #26a69a)'
                : 'var(--arianna-bear, #ef5350)';
            const color = explicit || auto;
            const mn = Math.min(...data);
            const mx = Math.max(...data);
            const rng = mx - mn || 1;
            const last = data.length - 1 || 1;
            const pts = data.map((v, i) => {
                const x = (W * i) / last;
                const y = H - ((v - mn) / rng) * H;
                return `${x},${y}`;
            }).join(' ');
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
                 + _svg('polyline', {
                     points: pts,
                     fill  : 'none',
                     stroke: color,
                     'stroke-width': 1.5,
                     'stroke-linejoin': 'round',
                     'stroke-linecap' : 'round',
                 })
                 + '</svg>';
        };

        this.template = html`<span class="ar-sparkline" a-html="this.svgHtml()"></span>`;
        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Sparkline.DefaultSheet();
    }

    set data(v: number[]) { this.data$.set(v ?? []); }
    get data(): number[]  { return this.data$.get(); }

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
                new Rule(':host', { display: 'inline-block', lineHeight: '0' }),
                new Rule('.ar-sparkline svg', { display: 'inline-block', verticalAlign: 'middle' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Sparkline', {
        value: Sparkline, writable: false, enumerable: false, configurable: false,
    });
}

export default Sparkline;
