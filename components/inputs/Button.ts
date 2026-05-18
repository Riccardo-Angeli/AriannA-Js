/**
 * @module    components/inputs/Button
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Button — atomic clickable element with variant, size, icons, disabled state.
 *
 * @example HTML
 *   <arianna-button variant="primary" size="md">Save</arianna-button>
 *   <arianna-button variant="danger" icon="🗑️" disabled>Delete</arianna-button>
 *
 * Events: arianna:click  detail: { source }
 * Slots:  default — label text
 * Attrs:  variant, size, disabled, icon, icon-right, label
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ButtonOptions {
    variant?  : 'default' | 'primary' | 'danger' | 'ghost' | 'link';
    size?     : 'sm' | 'md' | 'lg';
    icon?     : string;
    iconRight?: string;
    disabled? : boolean;
    label?    : string;
}

export class Button extends Component('arianna-button', HTMLElement, {}, {
    attrs : ['variant', 'size', 'disabled', 'icon', 'icon-right', 'label'],
    shadow: false,
})
{
    build(_opts: ButtonOptions = {})
    {
        const icon  = this.attrSignal('icon');
        const iconR = this.attrSignal('icon-right');
        const label = this.attrSignal('label');

        this.hasIcon  = () => !!icon.get();
        this.hasIconR = () => !!iconR.get();
        this.hasLabel = () => !!label.get();
        this.iconText  = () => icon.get() ?? '';
        this.iconRText = () => iconR.get() ?? '';
        this.labelText = () => label.get() ?? '';

        this.onClick = (e: Event) => {
            if (this.hasAttribute('disabled')) { e.preventDefault(); e.stopPropagation(); return; }
            this.dispatchEvent(new CustomEvent('arianna:click', {
                bubbles: true, detail: { source: this },
            }));
        };
        this.addEventListener('click', (e) => this.onClick(e));

        this.template = html`
            <span class="ar-btn__icon ar-btn__icon--left"  a-if="this.hasIcon()">{{ this.iconText() }}</span>
            <span class="ar-btn__label" a-if="this.hasLabel()">{{ this.labelText() }}</span>
            <span class="ar-btn__label" a-if="!this.hasLabel()"><slot></slot></span>
            <span class="ar-btn__icon ar-btn__icon--right" a-if="this.hasIconR()">{{ this.iconRText() }}</span>
        `;

        this.Sheet = Button.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get size(): string  { return this.getAttribute('size') ?? 'md'; }
    set size(v: string) { this.setAttribute('size', v); }

    get label(): string  { return this.getAttribute('label') ?? this.textContent ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get disabled(): boolean  { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

    get icon(): string  { return this.getAttribute('icon') ?? ''; }
    set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

    private hasIcon  : () => boolean = () => false;
    private hasIconR : () => boolean = () => false;
    private hasLabel : () => boolean = () => false;
    private iconText : () => string = () => '';
    private iconRText: () => string = () => '';
    private labelText: () => string = () => '';
    private onClick  : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems    : 'center',
                    borderRadius  : 'var(--arianna-radius, 6px)',
                    cursor        : 'pointer',
                    display       : 'inline-flex',
                    font          : 'inherit',
                    gap           : '6px',
                    justifyContent: 'center',
                    transition    : 'all 0.15s ease',
                    userSelect    : 'none',
                    whiteSpace    : 'nowrap',
                    background    : 'var(--arianna-bg-3, #f3f3f3)',
                    border        : '1px solid var(--arianna-border, #d8d8d8)',
                    color         : 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':root[variant="primary"]', { background: 'var(--arianna-primary, #1f6feb)', border: '1px solid var(--arianna-primary, #1f6feb)', color: '#fff' }),
                new Rule(':root[variant="danger"]',  { background: 'var(--arianna-danger, #cf222e)',  border: '1px solid var(--arianna-danger, #cf222e)',  color: '#fff' }),
                new Rule(':root[variant="ghost"]',   { background: 'transparent', border: '1px solid transparent', color: 'var(--arianna-text, #1f2328)' }),
                new Rule(':root[variant="link"]',    { background: 'transparent', border: 'none', color: 'var(--arianna-primary, #1f6feb)', paddingLeft: '0', paddingRight: '0' }),
                new Rule(':root[size="sm"]',           { fontSize: '0.75rem', padding: '3px 10px' }),
                new Rule(':root[size="md"]',           { fontSize: '0.82rem', padding: '5px 14px' }),
                new Rule(':root[size="lg"]',           { fontSize: '0.90rem', padding: '8px 20px' }),
                new Rule(':root:not([size])',           { fontSize: '0.82rem', padding: '5px 14px' }),
                new Rule(':root:hover:not([disabled])', { filter: 'brightness(1.05)' }),
                new Rule(':root[disabled]',             { cursor: 'not-allowed', opacity: '0.45' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Button', { value: Button, writable: false, enumerable: false, configurable: false });
}

export default Button;
