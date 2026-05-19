/**
 * @module    components/finance/RiskGauge
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * RiskGauge — semi-circular gauge for risk / score visualizations. Three
 * threshold colors (green / yellow / red) mapped to value position within
 * [min, max].
 *
 * @example JS
 *   const g = new RiskGauge();
 *   g.setRange(0, 100);
 *   g.value = 72;
 *   g.label = 'VaR';
 *
 * @example HTML
 *   <arianna-risk-gauge value="72" min="0" max="100" label="VaR" size="220"></arianna-risk-gauge>
 *
 * Attrs: value, min, max, label, size
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _fmt, _esc } from './helpers.ts';

export interface RiskGaugeOptions {
    value? : number;
    min?   : number;
    max?   : number;
    label? : string;
    size?  : number;
}

export class RiskGauge extends Component('arianna-risk-gauge', HTMLElement, {}, {
    attrs : ['value', 'min', 'max', 'label', 'size'],
})
{
    build(_opts: RiskGaugeOptions = {})
    {
        const value = this.attrSignal('value');
        const min   = this.attrSignal('min');
        const max   = this.attrSignal('max');
        const label = this.attrSignal('label');
        const size  = this.attrSignal('size');

        this.svgHtml = (): string => {
            const v   = parseFloat(value.get() ?? '0') || 0;
            const mn  = parseFloat(min.get()   ?? '0') || 0;
            const mx  = parseFloat(max.get()   ?? '100') || 100;
            const lbl = label.get() ?? '';
            const s   = parseInt(size.get() ?? '200', 10) || 200;

            const cx = s / 2;
            const cy = s * 0.6;
            const R  = s * 0.4;
            const t  = Math.max(0, Math.min(1, (v - mn) / (mx - mn || 1)));
            const endA = Math.PI + t * Math.PI;

            const color = t < 0.33 ? 'var(--arianna-bull, #26a69a)'
                        : t < 0.66 ? 'var(--arianna-warning, #f4c842)'
                        :            'var(--arianna-bear, #ef5350)';

            const aX = (a: number) => cx + R * Math.cos(a);
            const aY = (a: number) => cy + R * Math.sin(a);

            const bgPath = `M${aX(Math.PI)},${aY(Math.PI)} A${R},${R} 0 0,1 ${aX(0)},${aY(0)}`;
            const fgPath = `M${aX(Math.PI)},${aY(Math.PI)} A${R},${R} 0 ${t > 0.5 ? 1 : 0},1 ${aX(endA)},${aY(endA)}`;
            const sw = R * 0.3;
            const nx = aX(endA) * 0.85 + cx * 0.15;
            const ny = aY(endA) * 0.85 + cy * 0.15;

            return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s * 0.7}" viewBox="0 0 ${s} ${s * 0.7}">`
                 + `<path d="${bgPath}" fill="none" stroke="var(--arianna-bg-4, #2a2e39)" stroke-width="${sw}" stroke-linecap="round"/>`
                 + `<path d="${fgPath}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`
                 + `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="var(--arianna-text, #1f2328)" stroke-width="2"/>`
                 + `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--arianna-text, #1f2328)"/>`
                 + `<text x="${cx}" y="${cy - 10}" fill="${color}" font-size="16" font-weight="700" text-anchor="middle">${_fmt(v)}</text>`
                 + `<text x="${cx}" y="${cy + 8}" fill="var(--arianna-muted, #787b86)" font-size="11" text-anchor="middle">${_esc(lbl)}</text>`
                 + `</svg>`;
        };

        this.template = html`<div class="ar-gauge" a-html="this.svgHtml()"></div>`;
        (this as unknown as { Sheet: Stylesheet | null }).Sheet = RiskGauge.DefaultSheet();
    }

    /** Convenience: set min and max together. */
    setRange(min: number, max: number): this {
        this.setAttribute('min', String(min));
        this.setAttribute('max', String(max));
        return this;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get value(): number  { return parseFloat(this.getAttribute('value') ?? '0'); }
    set value(v: number) { this.setAttribute('value', String(v)); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { this.setAttribute('label', v); }

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
                    padding     : '8px',
                }),
                new Rule(':host svg', { display: 'block' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'RiskGauge', {
        value: RiskGauge, writable: false, enumerable: false, configurable: false,
    });
}

export default RiskGauge;
