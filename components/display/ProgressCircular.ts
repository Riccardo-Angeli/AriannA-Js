/**
 * @module    components/display/ProgressCircular
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ProgressCircular — SVG circular progress indicator. Determinate (0-100) or
 * indeterminate (spinner) mode.
 *
 * @example JS
 *   const pc = new ProgressCircular();
 *   pc.size  = 60;
 *   pc.value = 72;
 *
 * @example HTML
 *   <arianna-progress-circular size="48" value="65" show-value variant="success"></arianna-progress-circular>
 *   <arianna-progress-circular indeterminate></arianna-progress-circular>
 *
 * Events: (none)
 * Slots:  (none)
 * Attrs:  size, stroke-width, value, variant, show-value, indeterminate
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ProgressCircularOptions {
    size?          : number;
    strokeWidth?   : number;
    value?         : number;
    variant?       : 'default' | 'success' | 'warning' | 'danger';
    showValue?     : boolean;
    indeterminate? : boolean;
}

export class ProgressCircular extends Component('arianna-progress-circular', HTMLElement, {}, {
    attrs : ['size', 'stroke-width', 'value', 'variant', 'show-value', 'indeterminate'],
})
{
    build(_opts: ProgressCircularOptions = {})
    {
        const size    = this.attrSignal('size');
        const sw      = this.attrSignal('stroke-width');
        const value   = this.attrSignal('value');
        const variant = this.attrSignal('variant');

        const sizePx      = () => parseInt(size.get() ?? '48', 10) || 48;
        const strokePx    = () => parseInt(sw.get()   ?? '4',  10) || 4;
        const valueNum    = () => {
            const n = parseFloat(value.get() ?? '0');
            return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
        };
        const radius      = () => (sizePx() - strokePx()) / 2;
        const circumf     = () => 2 * Math.PI * radius();
        const dashLen     = () => this.isIndet() ? circumf() * 0.75 : circumf() * valueNum() / 100;
        const dashOff     = () => circumf() * 0.25;
        const variantColor = (): string => {
            const m: Record<string, string> = {
                default: 'var(--arianna-primary, #1f6feb)',
                success: 'var(--arianna-success, #2ea043)',
                warning: 'var(--arianna-warning, #d29922)',
                danger : 'var(--arianna-danger,  #cf222e)',
            };
            return m[variant.get() ?? 'default'] ?? m.default;
        };

        this.isIndet     = () => this.hasAttribute('indeterminate');
        this.svgViewBox  = () => `0 0 ${sizePx()} ${sizePx()}`;
        this.svgStyle    = () => ({ width: sizePx() + 'px', height: sizePx() + 'px' });
        this.svgClass    = () => this.isIndet() ? 'ar-progress-circ__spin' : '';
        this.svgCenter   = () => String(sizePx() / 2);
        this.svgRadius   = () => String(radius());
        this.svgStrokeW  = () => String(strokePx());
        this.svgColor    = variantColor;
        this.svgDashArr  = () => `${dashLen()} ${circumf() - dashLen()}`;
        this.svgDashOff  = () => String(dashOff());
        this.hasShowVal  = () => this.hasAttribute('show-value') && !this.isIndet();
        this.valueLabel  = () => Math.round(valueNum()) + '%';
        this.labelStyle  = () => ({ fontSize: Math.round(sizePx() * 0.22) + 'px' });

        this.template = html`
            <svg :viewBox="this.svgViewBox()" :style="this.svgStyle()" :class="this.svgClass()" xmlns="http://www.w3.org/2000/svg">
                <circle :cx="this.svgCenter()" :cy="this.svgCenter()" :r="this.svgRadius()"
                        fill="none" stroke="var(--arianna-bg-3, #f3f3f3)" :stroke-width="this.svgStrokeW()"></circle>
                <circle :cx="this.svgCenter()" :cy="this.svgCenter()" :r="this.svgRadius()"
                        fill="none" :stroke="this.svgColor()" :stroke-width="this.svgStrokeW()"
                        stroke-linecap="round"
                        :stroke-dasharray="this.svgDashArr()"
                        :stroke-dashoffset="this.svgDashOff()"
                        style="transition: stroke-dasharray .3s ease"></circle>
            </svg>
            <div class="ar-progress-circ__label" a-if="this.hasShowVal()" :style="this.labelStyle()">{{ this.valueLabel() }}</div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = ProgressCircular.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get size(): number  { return parseInt(this.getAttribute('size') ?? '48', 10); }
    set size(v: number) { this.setAttribute('size', String(v)); }

    get strokeWidth(): number  { return parseInt(this.getAttribute('stroke-width') ?? '4', 10); }
    set strokeWidth(v: number) { this.setAttribute('stroke-width', String(v)); }

    get value(): number  { return parseFloat(this.getAttribute('value') ?? '0'); }
    set value(v: number) { this.setAttribute('value', String(Math.max(0, Math.min(100, v)))); }

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get showValue(): boolean  { return this.hasAttribute('show-value'); }
    set showValue(v: boolean) { v ? this.setAttribute('show-value', '') : this.removeAttribute('show-value'); }

    get indeterminate(): boolean  { return this.hasAttribute('indeterminate'); }
    set indeterminate(v: boolean) { v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate'); }

    private isIndet    : () => boolean = () => false;
    private svgViewBox : () => string = () => '0 0 48 48';
    private svgStyle   : () => Record<string, string> = () => ({});
    private svgClass   : () => string = () => '';
    private svgCenter  : () => string = () => '24';
    private svgRadius  : () => string = () => '22';
    private svgStrokeW : () => string = () => '4';
    private svgColor   : () => string = () => '';
    private svgDashArr : () => string = () => '';
    private svgDashOff : () => string = () => '0';
    private hasShowVal : () => boolean = () => false;
    private valueLabel : () => string = () => '0%';
    private labelStyle : () => Record<string, string> = () => ({});

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    display       : 'inline-flex',
                    flexDirection : 'column',
                    alignItems    : 'center',
                    gap           : '4px',
                    position      : 'relative',
                }),
                new Rule('.ar-progress-circ__label', {
                    color              : 'var(--arianna-text, #1f2328)',
                    fontWeight         : '600',
                    fontVariantNumeric : 'tabular-nums',
                }),
                new Rule('.ar-progress-circ__spin', { animation: 'ar-circ-spin 1s linear infinite' }),
                new Rule('@keyframes ar-circ-spin', { 'to': { transform: 'rotate(360deg)' } } as never),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ProgressCircular', {
        value: ProgressCircular, writable: false, enumerable: false, configurable: false,
    });
}

export default ProgressCircular;
