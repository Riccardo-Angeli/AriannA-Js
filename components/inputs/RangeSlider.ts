/**
 * @module    components/inputs/RangeSlider
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * RangeSlider — single-handle range input with optional value display.
 *
 * @example HTML
 *   <arianna-range-slider min="0" max="100" value="42" label="Volume" show-value></arianna-range-slider>
 *
 * Events: arianna:input, arianna:change  detail: { value }
 * Attrs:  label, min, max, step, value, show-value, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface RangeSliderOptions {
    label?     : string;
    min?       : number;
    max?       : number;
    step?      : number;
    value?     : number;
    showValue? : boolean;
    disabled?  : boolean;
}

export class RangeSlider extends Component('arianna-range-slider', HTMLElement, {}, {
    attrs : ['label', 'min', 'max', 'step', 'value', 'show-value', 'disabled'],
})
{
    build(_opts: RangeSliderOptions = {})
    {
        const label = this.attrSignal('label');
        const value = this.attrSignal('value');

        this.hasLabel  = () => !!label.get();
        this.labelText = () => label.get() ?? '';
        this.inpMin    = () => this.getAttribute('min')  ?? '0';
        this.inpMax    = () => this.getAttribute('max')  ?? '100';
        this.inpStep   = () => this.getAttribute('step') ?? '1';
        this.inpValue  = () => value.get() ?? '0';
        this.showVal   = () => this.getAttribute('show-value') !== 'false';
        this.valText   = () => value.get() ?? '0';
        this.isDisabled = () => this.hasAttribute('disabled');

        this.onInput = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.setAttribute('value', inp.value);
            this.dispatchEvent(new CustomEvent('arianna:input', {
                bubbles: true, detail: { value: Number(inp.value) },
            }));
        };
        this.onChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: Number(inp.value) },
            }));
        };

        this.template = html`
            <div class="ar-slider__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div class="ar-slider__wrap">
                <input class="ar-slider__input"
                       type="range"
                       :min="this.inpMin()"
                       :max="this.inpMax()"
                       :step="this.inpStep()"
                       :value="this.inpValue()"
                       :disabled="this.isDisabled()"
                       @input="this.onInput"
                       @change="this.onChange"/>
                <span class="ar-slider__value" a-if="this.showVal()">{{ this.valText() }}</span>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = RangeSlider.DefaultSheet();
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

    get min(): number  { return parseFloat(this.getAttribute('min') ?? '0'); }
    set min(v: number) { this.setAttribute('min', String(v)); }

    get max(): number  { return parseFloat(this.getAttribute('max') ?? '100'); }
    set max(v: number) { this.setAttribute('max', String(v)); }

    private hasLabel  : () => boolean = () => false;
    private labelText : () => string = () => '';
    private inpMin    : () => string = () => '0';
    private inpMax    : () => string = () => '100';
    private inpStep   : () => string = () => '1';
    private inpValue  : () => string = () => '0';
    private showVal   : () => boolean = () => true;
    private valText   : () => string = () => '0';
    private isDisabled: () => boolean = () => false;
    private onInput   : (e: Event) => void = () => {};
    private onChange  : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-slider__label', {
                    color   : 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                }),
                new Rule('.ar-slider__wrap', { alignItems: 'center', display: 'flex', gap: '10px' }),
                new Rule('.ar-slider__input', {
                    accentColor: 'var(--arianna-primary, #1f6feb)',
                    flex       : '1',
                    cursor     : 'pointer',
                }),
                new Rule('.ar-slider__value', {
                    color    : 'var(--arianna-primary, #1f6feb)',
                    fontSize : '0.82rem',
                    fontWeight: '600',
                    minWidth : '32px',
                    textAlign: 'right',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'RangeSlider', { value: RangeSlider, writable: false, enumerable: false, configurable: false });
}

export default RangeSlider;
