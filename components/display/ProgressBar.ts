/**
 * @module    components/display/ProgressBar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ProgressBar — linear progress indicator. Supports determinate (0-100) and
 * indeterminate (animated stripe) modes.
 *
 * @example JS
 *   const pb = new ProgressBar();
 *   pb.label = 'Upload';
 *   pb.value = 65;
 *   pb.indeterminate = true;
 *
 * @example HTML
 *   <arianna-progress-bar variant="success" value="80" show-value></arianna-progress-bar>
 *
 * Events: (none)
 * Slots:  (none)
 * Attrs:  label, value, height, variant, show-value, indeterminate
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ProgressBarOptions {
    label?         : string;
    value?         : number;
    height?        : number;
    variant?       : 'default' | 'success' | 'warning' | 'danger';
    showValue?     : boolean;
    indeterminate? : boolean;
}

export class ProgressBar extends Component('arianna-progress-bar', HTMLElement, {}, {
    attrs : ['label', 'value', 'height', 'variant', 'show-value', 'indeterminate'],
    shadow: false,
})
{
    build(_opts: ProgressBarOptions = {})
    {
        const label  = this.attrSignal('label');
        const value  = this.attrSignal('value');
        const height = this.attrSignal('height');
        const variant = this.attrSignal('variant');

        const clampedValue = () => {
            const n = parseFloat(value.get() ?? '0');
            if (!Number.isFinite(n)) return 0;
            return Math.max(0, Math.min(100, n));
        };

        this.labelText   = () => label.get() ?? '';
        this.hasLabel    = () => !!label.get();
        this.hasShowVal  = () => this.hasAttribute('show-value');
        this.isIndet     = () => this.hasAttribute('indeterminate');
        this.valuePct    = () => clampedValue() + '%';
        this.valueLabel  = () => Math.round(clampedValue()) + '%';
        this.barStyleObj = () => {
            const w = this.isIndet() ? '40%' : clampedValue() + '%';
            return { width: w, height: '100%' };
        };
        this.trackStyleObj = () => {
            const h = parseInt(height.get() ?? '6', 10) || 6;
            return { height: h + 'px' };
        };
        this.barClassName = () => {
            let c = 'ar-progress__bar ar-progress__bar--' + (variant.get() ?? 'default');
            if (this.isIndet()) c += ' ar-progress__bar--indeterminate';
            return c;
        };
        this.ariaValue = () => String(Math.round(clampedValue()));

        this.template = html`
            <div class="ar-progress__header" a-if="this.hasLabel() || this.hasShowVal()">
                <span class="ar-progress__label" a-if="this.hasLabel()">{{ this.labelText() }}</span>
                <span class="ar-progress__value" a-if="this.hasShowVal()">{{ this.valueLabel() }}</span>
            </div>
            <div class="ar-progress__track" :style="this.trackStyleObj()">
                <div :class="this.barClassName()"
                     :style="this.barStyleObj()"
                     role="progressbar"
                     :aria-valuenow="this.ariaValue()"></div>
            </div>
        `;

        this.Sheet = ProgressBar.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get value(): number  { return parseFloat(this.getAttribute('value') ?? '0'); }
    set value(v: number) { this.setAttribute('value', String(Math.max(0, Math.min(100, v)))); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get height(): number  { return parseInt(this.getAttribute('height') ?? '6', 10); }
    set height(v: number) { this.setAttribute('height', String(v)); }

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get showValue(): boolean  { return this.hasAttribute('show-value'); }
    set showValue(v: boolean) { v ? this.setAttribute('show-value', '') : this.removeAttribute('show-value'); }

    get indeterminate(): boolean  { return this.hasAttribute('indeterminate'); }
    set indeterminate(v: boolean) { v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate'); }

    private labelText    : () => string = () => '';
    private hasLabel     : () => boolean = () => false;
    private hasShowVal   : () => boolean = () => false;
    private isIndet      : () => boolean = () => false;
    private valuePct     : () => string = () => '0%';
    private valueLabel   : () => string = () => '0%';
    private barStyleObj  : () => Record<string, string> = () => ({});
    private trackStyleObj: () => Record<string, string> = () => ({});
    private barClassName : () => string = () => '';
    private ariaValue    : () => string = () => '0';

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-progress__header', { display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }),
                new Rule('.ar-progress__label',  { color: 'var(--arianna-muted, #8b949e)' }),
                new Rule('.ar-progress__value',  { fontWeight: '500' }),
                new Rule('.ar-progress__track',  {
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    borderRadius: '99px',
                    overflow    : 'hidden',
                    width       : '100%',
                }),
                new Rule('.ar-progress__bar', {
                    borderRadius: '99px',
                    height      : '100%',
                    transition  : 'width 0.3s ease',
                }),
                new Rule('.ar-progress__bar--default', { background: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-progress__bar--success', { background: 'var(--arianna-success, #2ea043)' }),
                new Rule('.ar-progress__bar--warning', { background: 'var(--arianna-warning, #d29922)' }),
                new Rule('.ar-progress__bar--danger',  { background: 'var(--arianna-danger,  #cf222e)' }),
                new Rule('.ar-progress__bar--indeterminate', {
                    animation: 'ar-progress-slide 1.4s infinite ease-in-out',
                    width    : '40% !important',
                }),
                new Rule('@keyframes ar-progress-slide', {
                    '0%'  : { transform: 'translateX(-150%)' },
                    '100%': { transform: 'translateX(400%)'  },
                } as never),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ProgressBar', {
        value: ProgressBar, writable: false, enumerable: false, configurable: false,
    });
}

export default ProgressBar;
