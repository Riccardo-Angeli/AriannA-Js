/**
 * @module    components/inputs/TextField
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * TextField — single-line text input with reactive value binding.
 *
 * @example HTML
 *   <arianna-text-field type="email" placeholder="Email" value=""></arianna-text-field>
 *
 * Events: arianna:input, arianna:change  detail: { value }
 * Attrs:  value, placeholder, type, disabled, readonly, size
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface TextFieldOptions {
    value?      : string;
    placeholder?: string;
    type?       : 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
    disabled?   : boolean;
    readonly?   : boolean;
    size?       : 'sm' | 'md' | 'lg';
}

export class TextField extends Component('arianna-text-field', HTMLElement, {}, {
    attrs : ['value', 'placeholder', 'type', 'disabled', 'readonly', 'size'],
    shadow: false,
})
{
    build(_opts: TextFieldOptions = {})
    {
        const val = this.attrSignal('value');
        const ph  = this.attrSignal('placeholder');
        const ty  = this.attrSignal('type');

        this.inpType        = () => ty.get() ?? 'text';
        this.inpPlaceholder = () => ph.get() ?? '';
        this.inpValue       = () => val.get() ?? '';
        this.isDisabled     = () => this.hasAttribute('disabled');
        this.isReadonly     = () => this.hasAttribute('readonly');

        this.onInput = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.setAttribute('value', inp.value);
            this.dispatchEvent(new CustomEvent('arianna:input', {
                bubbles: true, detail: { value: inp.value, source: this },
            }));
        };
        this.onChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: inp.value, source: this },
            }));
        };

        this.template = html`
            <input class="ar-textfield__input"
                   :type="this.inpType()"
                   :placeholder="this.inpPlaceholder()"
                   :value="this.inpValue()"
                   :disabled="this.isDisabled()"
                   :readonly="this.isReadonly()"
                   @input="this.onInput"
                   @change="this.onChange"/>
        `;

        this.Sheet = TextField.DefaultSheet();
    }

    /** Focus the underlying input. */
    focusInput(): this { this.querySelector<HTMLInputElement>('input')?.focus(); return this; }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get value(): string  { return this.getAttribute('value') ?? ''; }
    set value(v: string) { this.setAttribute('value', v); }

    get placeholder(): string  { return this.getAttribute('placeholder') ?? ''; }
    set placeholder(v: string) { v ? this.setAttribute('placeholder', v) : this.removeAttribute('placeholder'); }

    get type(): string  { return this.getAttribute('type') ?? 'text'; }
    set type(v: string) { this.setAttribute('type', v); }

    get disabled(): boolean  { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

    private inpType       : () => string = () => 'text';
    private inpPlaceholder: () => string = () => '';
    private inpValue      : () => string = () => '';
    private isDisabled    : () => boolean = () => false;
    private isReadonly    : () => boolean = () => false;
    private onInput       : (e: Event) => void = () => {};
    private onChange      : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display : 'inline-block',
                    width   : '100%',
                    maxWidth: '320px',
                }),
                new Rule('.ar-textfield__input', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    font        : 'inherit',
                    outline     : 'none',
                    padding     : '6px 10px',
                    transition  : 'border-color 0.15s ease',
                    width       : '100%',
                    boxSizing   : 'border-box',
                    fontSize    : '0.82rem',
                }),
                new Rule('.ar-textfield__input:focus', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    boxShadow  : '0 0 0 2px rgba(31,111,235,0.18)',
                }),
                new Rule(':root[size="sm"] .ar-textfield__input', { fontSize: '0.75rem', padding: '4px 8px' }),
                new Rule(':root[size="lg"] .ar-textfield__input', { fontSize: '0.95rem', padding: '8px 12px' }),
                new Rule('.ar-textfield__input:disabled', { cursor: 'not-allowed', opacity: '0.55' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'TextField', { value: TextField, writable: false, enumerable: false, configurable: false });
}

export default TextField;
