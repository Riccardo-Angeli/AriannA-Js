/**
 * @module    components/inputs/Button
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Button — Shadow DOM 2.0 contract component.
 *
 * Events: arianna:click  detail: { source, originalEvent }
 * Slots : icon, default, trailing
 * Attrs : variant, size, disabled, icon, icon-right, label
 */

import { Component, type ComponentStyleMap } from '../../core/Component.ts';
import { html } from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface ButtonOptions {
    variant?  : 'default' | 'primary' | 'danger' | 'ghost' | 'link';
    size?     : 'sm' | 'md' | 'lg';
    icon?     : string;
    iconRight?: string;
    disabled? : boolean;
    label?    : string;
}

export const ButtonStyleMap: ComponentStyleMap = Object.freeze({
    self    : ':host',
    button  : '.ar-btn__native',
    native  : '.ar-btn__native',
    label   : '.ar-btn__label',
    icon    : '.ar-btn__icon',
    leading : '.ar-btn__icon--left',
    trailing: '.ar-btn__icon--right',
});

export function ButtonDefaultSheet(): Stylesheet
{
    return new Stylesheet([
        new Rule(':host', {
            alignItems    : 'center',
            display       : 'inline-flex',
            verticalAlign  : 'middle',
            whiteSpace    : 'nowrap',
        }),
        new Rule('.ar-btn__native', {
            alignItems     : 'center',
            appearance     : 'none',
            background     : 'var(--arianna-button-bg, var(--arianna-bg-3, #f3f3f3))',
            border         : 'var(--arianna-button-border, 1px solid var(--arianna-border, #d8d8d8))',
            borderRadius   : 'var(--arianna-button-radius, var(--arianna-radius, 6px))',
            boxSizing      : 'border-box',
            color          : 'var(--arianna-button-color, var(--arianna-text, #1f2328))',
            cursor         : 'pointer',
            display        : 'inline-flex',
            font           : 'inherit',
            gap            : 'var(--arianna-button-gap, 6px)',
            justifyContent : 'center',
            minHeight      : 'var(--arianna-button-min-height, 0)',
            outline        : 'none',
            padding        : 'var(--arianna-button-padding, 5px 14px)',
            transition     : 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
            userSelect     : 'none',
            width          : 'var(--arianna-button-width, auto)',
        }),
        new Rule('.ar-btn__native:hover:not(:disabled)', {
            filter: 'brightness(1.05)',
        }),
        new Rule('.ar-btn__native:focus-visible', {
            boxShadow: '0 0 0 3px var(--arianna-focus-ring, rgba(31, 111, 235, 0.25))',
        }),
        new Rule(':host([variant="primary"]) .ar-btn__native', {
            background: 'var(--arianna-button-primary-bg, var(--arianna-primary, #1f6feb))',
            border    : 'var(--arianna-button-primary-border, 1px solid var(--arianna-primary, #1f6feb))',
            color     : 'var(--arianna-button-primary-color, #fff)',
        }),
        new Rule(':host([variant="danger"]) .ar-btn__native', {
            background: 'var(--arianna-button-danger-bg, var(--arianna-danger, #cf222e))',
            border    : 'var(--arianna-button-danger-border, 1px solid var(--arianna-danger, #cf222e))',
            color     : 'var(--arianna-button-danger-color, #fff)',
        }),
        new Rule(':host([variant="ghost"]) .ar-btn__native', {
            background: 'transparent',
            border    : '1px solid transparent',
            color     : 'var(--arianna-button-ghost-color, var(--arianna-text, #1f2328))',
        }),
        new Rule(':host([variant="link"]) .ar-btn__native', {
            background  : 'transparent',
            border      : 'none',
            color       : 'var(--arianna-button-link-color, var(--arianna-primary, #1f6feb))',
            paddingLeft : '0',
            paddingRight: '0',
        }),
        new Rule(':host([size="sm"]) .ar-btn__native', {
            fontSize: '0.75rem',
            padding : 'var(--arianna-button-padding-sm, 3px 10px)',
        }),
        new Rule(':host([size="md"]) .ar-btn__native', {
            fontSize: '0.82rem',
            padding : 'var(--arianna-button-padding-md, 5px 14px)',
        }),
        new Rule(':host([size="lg"]) .ar-btn__native', {
            fontSize: '0.90rem',
            padding : 'var(--arianna-button-padding-lg, 8px 20px)',
        }),
        new Rule(':host(:not([size])) .ar-btn__native', {
            fontSize: '0.82rem',
        }),
        new Rule(':host([disabled]) .ar-btn__native, .ar-btn__native:disabled', {
            cursor : 'not-allowed',
            opacity: '0.45',
        }),
        new Rule('.ar-btn__label', {
            alignItems: 'center',
            display   : 'inline-flex',
            minWidth  : '0',
        }),
        new Rule('.ar-btn__icon', {
            alignItems: 'center',
            display   : 'inline-flex',
            lineHeight: '1',
        }),
    ]);
}

export class Button extends Component(
    'arianna-button',
    HTMLElement,
    ButtonDefaultSheet(),
    {
        attrs : ['variant', 'size', 'disabled', 'icon', 'icon-right', 'label'],
        shadow: 'closed',
    },
) {
    static StyleMap = ButtonStyleMap;
    static DefaultSheet = ButtonDefaultSheet;

    build(opts: ButtonOptions = {})
    {
        this.applyOptions(opts);

        const icon  = this.attrSignal('icon');
        const iconR = this.attrSignal('icon-right');
        const label = this.attrSignal('label');

        this.hasIcon   = () => !!icon?.get();
        this.hasIconR  = () => !!iconR?.get();
        this.hasLabel  = () => !!label?.get();
        this.iconText  = () => icon?.get() ?? '';
        this.iconRText = () => iconR?.get() ?? '';
        this.labelText = () => label?.get() ?? '';
        this.isDisabled = () => this.hasAttribute('disabled');

        this.onClick = (e: Event) => {
            if (this.isDisabled()) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            this.dispatchEvent(new CustomEvent('arianna:click', {
                bubbles : true,
                composed: true,
                detail  : { source: this, originalEvent: e },
            }));
        };

        this.template = html`
            <button
                class="ar-btn__native button btn"
                part="button"
                type="button"
                ?disabled="this.isDisabled()"
                @click="this.onClick"
            >
                <span class="ar-btn__icon ar-btn__icon--left" part="icon" a-if="this.hasIcon()">{{ this.iconText() }}</span>
                <slot name="icon"></slot>
                <span class="ar-btn__label" part="label" a-if="this.hasLabel()">{{ this.labelText() }}</span>
                <span class="ar-btn__label" part="label" a-if="!this.hasLabel()"><slot></slot></span>
                <span class="ar-btn__icon ar-btn__icon--right" part="trailing" a-if="this.hasIconR()">{{ this.iconRText() }}</span>
                <slot name="trailing"></slot>
            </button>
        `;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { v ? this.setAttribute('variant', v) : this.removeAttribute('variant'); }

    get size(): string  { return this.getAttribute('size') ?? 'md'; }
    set size(v: string) { v ? this.setAttribute('size', v) : this.removeAttribute('size'); }

    get label(): string  { return this.getAttribute('label') ?? this.textContent ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get disabled(): boolean  { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

    get icon(): string  { return this.getAttribute('icon') ?? ''; }
    set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

    get iconRight(): string  { return this.getAttribute('icon-right') ?? ''; }
    set iconRight(v: string) { v ? this.setAttribute('icon-right', v) : this.removeAttribute('icon-right'); }

    private applyOptions(opts: ButtonOptions): void
    {
        if (opts.variant !== undefined)   this.variant = opts.variant;
        if (opts.size !== undefined)      this.size = opts.size;
        if (opts.icon !== undefined)      this.icon = opts.icon;
        if (opts.iconRight !== undefined) this.iconRight = opts.iconRight;
        if (opts.label !== undefined)     this.label = opts.label;
        if (opts.disabled !== undefined)  this.disabled = opts.disabled;
    }

    private hasIcon    : () => boolean = () => false;
    private hasIconR   : () => boolean = () => false;
    private hasLabel   : () => boolean = () => false;
    private isDisabled : () => boolean = () => false;
    private iconText   : () => string = () => '';
    private iconRText  : () => string = () => '';
    private labelText  : () => string = () => '';
    private onClick    : (e: Event) => void = () => {};
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Button', { value: Button, writable: false, enumerable: false, configurable: false });
}

export default Button;
