/**
 * @module    components/inputs/TimePicker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * TimePicker — HH:MM input with optional seconds, min/max bounds.
 *
 * @example HTML
 *   <arianna-time-picker label="Start" value="09:30"></arianna-time-picker>
 *   <arianna-time-picker seconds value="14:30:00"></arianna-time-picker>
 *
 * Events: arianna:change  detail: { value }
 * Attrs:  label, value, seconds, min, max, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface TimePickerOptions {
    label?    : string;
    value?    : string;
    seconds?  : boolean;
    min?      : string;
    max?      : string;
    disabled? : boolean;
}

export class TimePicker extends Component('arianna-time-picker', HTMLElement, {}, {
    attrs : ['label', 'value', 'seconds', 'min', 'max', 'disabled'],
})
{
    build(_opts: TimePickerOptions = {})
    {
        const label = this.attrSignal('label');
        const value = this.attrSignal('value');

        this.hasLabel  = () => !!label.get();
        this.labelText = () => label.get() ?? '';
        this.inpValue  = () => value.get() ?? '';
        this.inpMin    = () => this.getAttribute('min') ?? '';
        this.inpMax    = () => this.getAttribute('max') ?? '';
        this.inpStep   = () => this.hasAttribute('seconds') ? '1' : '60';
        this.isDisabled = () => this.hasAttribute('disabled');

        this.onChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.setAttribute('value', inp.value);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: inp.value },
            }));
        };

        this.template = html`
            <div class="ar-timepicker__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div class="ar-timepicker__wrap">
                <span class="ar-timepicker__icon">🕐</span>
                <input class="ar-timepicker__input"
                       type="time"
                       :value="this.inpValue()"
                       :min="this.inpMin()"
                       :max="this.inpMax()"
                       :step="this.inpStep()"
                       :disabled="this.isDisabled()"
                       @change="this.onChange"/>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = TimePicker.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get value(): string  { return this.getAttribute('value') ?? ''; }
    set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    private hasLabel   : () => boolean = () => false;
    private labelText  : () => string = () => '';
    private inpValue   : () => string = () => '';
    private inpMin     : () => string = () => '';
    private inpMax     : () => string = () => '';
    private inpStep    : () => string = () => '60';
    private isDisabled : () => boolean = () => false;
    private onChange   : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-timepicker__label', {
                    color     : 'var(--arianna-muted, #6e6b62)',
                    fontSize  : '0.78rem',
                    fontWeight: '500',
                }),
                new Rule('.ar-timepicker__wrap', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display     : 'flex',
                    gap         : '8px',
                    padding     : '5px 10px',
                    transition  : 'border-color 0.18s ease',
                }),
                new Rule('.ar-timepicker__wrap:focus-within', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-timepicker__icon', { flexShrink: '0' }),
                new Rule('.ar-timepicker__input', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-text, #1f2328)',
                    font      : 'inherit',
                    fontSize  : '0.82rem',
                    outline   : 'none',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'TimePicker', { value: TimePicker, writable: false, enumerable: false, configurable: false });
}

export default TimePicker;
