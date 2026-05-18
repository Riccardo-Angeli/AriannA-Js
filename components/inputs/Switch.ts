/**
 * @module    components/inputs/Switch
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Switch — on/off toggle with optional label.
 *
 * @example HTML
 *   <arianna-switch label="Dark mode" checked></arianna-switch>
 *
 * Events: arianna:change  detail: { checked }
 * Attrs:  label, label-position, checked, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface SwitchOptions {
    label?         : string;
    labelPosition? : 'left' | 'right';
    checked?       : boolean;
    disabled?      : boolean;
}

export class Switch extends Component('arianna-switch', HTMLElement, {}, {
    attrs : ['label', 'label-position', 'checked', 'disabled'],
    shadow: false,
})
{
    build(_opts: SwitchOptions = {})
    {
        const label = this.attrSignal('label');
        const pos   = this.attrSignal('label-position');

        this.hasLabel    = () => !!label.get();
        this.labelText   = () => label.get() ?? '';
        this.labelLeft   = () => pos.get() === 'left' && !!label.get();
        this.labelRight  = () => pos.get() !== 'left' && !!label.get();
        this.isChecked   = () => this.hasAttribute('checked');
        this.isDisabled  = () => this.hasAttribute('disabled');

        this.onChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            if (inp.checked) this.setAttribute('checked', '');
            else             this.removeAttribute('checked');
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { checked: inp.checked },
            }));
        };

        this.template = html`
            <label class="ar-switch__row">
                <span class="ar-switch__label" a-if="this.labelLeft()">{{ this.labelText() }}</span>
                <input class="ar-switch__input"
                       type="checkbox"
                       :checked="this.isChecked()"
                       :disabled="this.isDisabled()"
                       @change="this.onChange"/>
                <span class="ar-switch__track"></span>
                <span class="ar-switch__label" a-if="this.labelRight()">{{ this.labelText() }}</span>
            </label>
        `;

        this.Sheet = Switch.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get checked(): boolean  { return this.hasAttribute('checked'); }
    set checked(v: boolean) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

    get disabled(): boolean  { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    private hasLabel  : () => boolean = () => false;
    private labelText : () => string = () => '';
    private labelLeft : () => boolean = () => false;
    private labelRight: () => boolean = () => false;
    private isChecked : () => boolean = () => false;
    private isDisabled: () => boolean = () => false;
    private onChange  : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block' }),
                new Rule('.ar-switch__row', {
                    alignItems: 'center',
                    cursor    : 'pointer',
                    display   : 'inline-flex',
                    gap       : '8px',
                    userSelect: 'none',
                }),
                new Rule('.ar-switch__input', {
                    height  : '0',
                    opacity : '0',
                    position: 'absolute',
                    width   : '0',
                }),
                new Rule('.ar-switch__track', {
                    background  : 'var(--arianna-bg-4, #d8d8d8)',
                    borderRadius: '12px',
                    flexShrink  : '0',
                    height      : '22px',
                    position    : 'relative',
                    transition  : 'background 0.18s ease',
                    width       : '40px',
                }),
                new Rule('.ar-switch__track::after', {
                    background  : '#ffffff',
                    borderRadius: '50%',
                    content     : '""',
                    height      : '16px',
                    left        : '3px',
                    position    : 'absolute',
                    top         : '3px',
                    transition  : 'transform 0.18s ease',
                    width       : '16px',
                }),
                new Rule('.ar-switch__input:checked + .ar-switch__track', {
                    background: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-switch__input:checked + .ar-switch__track::after', {
                    transform: 'translateX(18px)',
                }),
                new Rule('.ar-switch__label', { fontSize: '0.82rem' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Switch', { value: Switch, writable: false, enumerable: false, configurable: false });
}

export default Switch;
