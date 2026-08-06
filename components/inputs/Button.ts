/**
 * @module    components/inputs/Button
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Button component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Button
 *  @public
 *  @description Namespace containing Button contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Button
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ButtonOptions
         *  @public
         *  @description ButtonOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ButtonOptions
        {
            /** @name        variant
             *  @public
             *  @type        {'default' | 'primary' | 'danger' | 'ghost' | 'link'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'default' | 'primary' | 'danger' | 'ghost' | 'link';

            /** @name        size
             *  @public
             *  @type        {'sm' | 'md' | 'lg'}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: 'sm' | 'md' | 'lg';

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        iconRight
             *  @public
             *  @type        {string}
             *  @description Component member for icon Right.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            iconRight?: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        ButtonStyleMap
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ButtonStyleMap value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const ButtonStyleMap = Object.freeze({
        self: ':host',
        button: '.ar-btn__native',
        native: '.ar-btn__native',
        label: '.ar-btn__label',
        icon: '.ar-btn__icon',
        leading: '.ar-btn__icon--left',
        trailing: '.ar-btn__icon--right',
    });
    export function ButtonDefaultSheet(): Types.Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                alignItems: 'center',
                display: 'inline-flex',
                verticalAlign: 'middle',
                whiteSpace: 'nowrap',
            }),
            new Rule('.ar-btn__native', {
                alignItems: 'center',
                appearance: 'none',
                background: 'var(--arianna-button-bg, var(--arianna-bg-3, #f3f3f3))',
                border: 'var(--arianna-button-border, 1px solid var(--arianna-border, #d8d8d8))',
                borderRadius: 'var(--arianna-button-radius, var(--arianna-radius, 6px))',
                boxSizing: 'border-box',
                color: 'var(--arianna-button-color, var(--arianna-text, #1f2328))',
                cursor: 'pointer',
                display: 'inline-flex',
                font: 'inherit',
                gap: 'var(--arianna-button-gap, 6px)',
                justifyContent: 'center',
                minHeight: 'var(--arianna-button-min-height, 0)',
                outline: 'none',
                padding: 'var(--arianna-button-padding, 5px 14px)',
                transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
                userSelect: 'none',
                width: 'var(--arianna-button-width, auto)',
            }),
            new Rule('.ar-btn__native:hover:not(:disabled)', {
                filter: 'brightness(1.05)',
            }),
            new Rule('.ar-btn__native:focus-visible', {
                boxShadow: '0 0 0 3px var(--arianna-focus-ring, rgba(31, 111, 235, 0.25))',
            }),
            new Rule(':host([variant="primary"]) .ar-btn__native', {
                background: 'var(--arianna-button-primary-bg, var(--arianna-primary, #1f6feb))',
                border: 'var(--arianna-button-primary-border, 1px solid var(--arianna-primary, #1f6feb))',
                color: 'var(--arianna-button-primary-color, #fff)',
            }),
            new Rule(':host([variant="danger"]) .ar-btn__native', {
                background: 'var(--arianna-button-danger-bg, var(--arianna-danger, #cf222e))',
                border: 'var(--arianna-button-danger-border, 1px solid var(--arianna-danger, #cf222e))',
                color: 'var(--arianna-button-danger-color, #fff)',
            }),
            new Rule(':host([variant="ghost"]) .ar-btn__native', {
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--arianna-button-ghost-color, var(--arianna-text, #1f2328))',
            }),
            new Rule(':host([variant="link"]) .ar-btn__native', {
                background: 'transparent',
                border: 'none',
                color: 'var(--arianna-button-link-color, var(--arianna-primary, #1f6feb))',
                paddingLeft: '0',
                paddingRight: '0',
            }),
            new Rule(':host([size="sm"]) .ar-btn__native', {
                fontSize: '0.75rem',
                padding: 'var(--arianna-button-padding-sm, 3px 10px)',
            }),
            new Rule(':host([size="md"]) .ar-btn__native', {
                fontSize: '0.82rem',
                padding: 'var(--arianna-button-padding-md, 5px 14px)',
            }),
            new Rule(':host([size="lg"]) .ar-btn__native', {
                fontSize: '0.90rem',
                padding: 'var(--arianna-button-padding-lg, 8px 20px)',
            }),
            new Rule(':host(:not([size])) .ar-btn__native', {
                fontSize: '0.82rem',
            }),
            new Rule(':host([disabled]) .ar-btn__native, .ar-btn__native:disabled', {
                cursor: 'not-allowed',
                opacity: '0.45',
            }),
            new Rule('.ar-btn__label', {
                alignItems: 'center',
                display: 'inline-flex',
                minWidth: '0',
            }),
            new Rule('.ar-btn__icon', {
                alignItems: 'center',
                display: 'inline-flex',
                lineHeight: '1',
            }),
        ]);
    }

    /** @class       Button
     *  @public
     *  @description AriannA Button component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-button', ButtonDefaultSheet(), {
        Attributes: ['variant', 'size', 'disabled', 'icon', 'icon-right', 'label'],
        shadow: 'closed',
    })
    export class Button extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        StyleMap
         *  @public
         *  @static
         *  @type        {unknown}
         *  @description Component member for Style Map.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static StyleMap = ButtonStyleMap;

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {unknown}
         *  @description Component member for Default Sheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet = ButtonDefaultSheet;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Button.Interfaces.ButtonOptions} opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(opts: Interfaces.ButtonOptions = {})
        {
            this.applyOptions(opts);

            /** @name        icon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned icon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const icon = this.signal().attribute('icon');

            /** @name        iconR
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned iconR value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const iconR = this.signal().attribute('icon-right');

            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');
            this.hasIcon = () => !!icon?.Get();
            this.hasIconR = () => !!iconR?.Get();
            this.hasLabel = () => !!label?.Get();
            this.iconText = () => icon?.Get() ?? '';
            this.iconRText = () => iconR?.Get() ?? '';
            this.labelText = () => label?.Get() ?? '';
            this.isDisabled = () => this.hasAttribute('disabled');
            this.onClick = (e: Event) => {
                if (this.isDisabled())
                {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.dispatchEvent(new CustomEvent('arianna:click', {
                    bubbles: true,
                    composed: true,
                    detail: { source: this, originalEvent: e },
                }));
            };
            this.template = html `
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

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        variant
         *  @public
         *  @type        {string}
         *  @description Component member for variant.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): string { return this.getAttribute('variant') ?? 'default'; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: string) { v ? this.setAttribute('variant', v) : this.removeAttribute('variant'); }

        /** @name        size
         *  @public
         *  @type        {string}
         *  @description Component member for size.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): string { return this.getAttribute('size') ?? 'md'; }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: string) { v ? this.setAttribute('size', v) : this.removeAttribute('size'); }

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get label(): string { return this.getAttribute('label') ?? this.textContent ?? ''; }

        /** @name        label
         *  @public
         *  @type        {void}
         *  @description Component member for label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

        /** @name        disabled
         *  @public
         *  @type        {boolean}
         *  @description Component member for disabled.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get disabled(): boolean { return this.hasAttribute('disabled'); }

        /** @name        disabled
         *  @public
         *  @type        {void}
         *  @description Component member for disabled.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

        /** @name        icon
         *  @public
         *  @type        {string}
         *  @description Component member for icon.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get icon(): string { return this.getAttribute('icon') ?? ''; }

        /** @name        icon
         *  @public
         *  @type        {void}
         *  @description Component member for icon.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

        /** @name        iconRight
         *  @public
         *  @type        {string}
         *  @description Component member for icon Right.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get iconRight(): string { return this.getAttribute('icon-right') ?? ''; }

        /** @name        iconRight
         *  @public
         *  @type        {void}
         *  @description Component member for icon Right.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set iconRight(v: string) { v ? this.setAttribute('icon-right', v) : this.removeAttribute('icon-right'); }

        /** @name        applyOptions
         *  @private
         *  @type        {void}
         *  @description Component member for apply Options.
         *  @param       {Button.Interfaces.ButtonOptions} opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private applyOptions(opts: Interfaces.ButtonOptions): void
        {
            if (opts.variant !== undefined)
                this.variant = opts.variant;
            if (opts.size !== undefined)
                this.size = opts.size;
            if (opts.icon !== undefined)
                this.icon = opts.icon;
            if (opts.iconRight !== undefined)
                this.iconRight = opts.iconRight;
            if (opts.label !== undefined)
                this.label = opts.label;
            if (opts.disabled !== undefined)
                this.disabled = opts.disabled;
        }

        /** @name        hasIcon
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasIcon: () => boolean = () => false;

        /** @name        hasIconR
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Icon R.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasIconR: () => boolean = () => false;

        /** @name        hasLabel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasLabel: () => boolean = () => false;

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        iconText
         *  @private
         *  @type        {() => string}
         *  @description Component member for icon Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconText: () => string = () => '';

        /** @name        iconRText
         *  @private
         *  @type        {() => string}
         *  @description Component member for icon RText.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconRText: () => string = () => '';

        /** @name        labelText
         *  @private
         *  @type        {() => string}
         *  @description Component member for label Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelText: () => string = () => '';

        /** @name        onClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClick: (e: Event) => void = () => { };
    }
}
export default Button;

export const ButtonDefaultSheet = Button.ButtonDefaultSheet;
export const ButtonStyleMap = Button.ButtonStyleMap;
export type ButtonOptions = Button.Interfaces.ButtonOptions;
