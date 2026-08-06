/**
 * @module    components/display/Banner
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Banner component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Banner
 *  @public
 *  @description Namespace containing Banner contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Banner
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
        /** @interface   BannerOptions
         *  @public
         *  @description BannerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BannerOptions
        {
            /** @name        variant
             *  @public
             *  @type        {'default' | 'info' | 'success' | 'warning' | 'danger'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';

            /** @name        dismissible
             *  @public
             *  @type        {boolean}
             *  @description Component member for dismissible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dismissible?: boolean;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        message
             *  @public
             *  @type        {string}
             *  @description Component member for message.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            message?: string;

            /** @name        action
             *  @public
             *  @type        {string}
             *  @description Component member for action.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            action?: string;
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

    /** @class       Banner
     *  @public
     *  @description AriannA Banner component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-banner', {}, {
        Attributes: ['variant', 'dismissible', 'icon', 'message', 'action'],
    })
    export class Banner extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Banner.Interfaces.BannerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.BannerOptions = {})
        {
            this.setAttribute('role', 'alert');

            /** @name        icon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned icon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const icon = this.signal().attribute('icon');

            /** @name        message
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned message value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const message = this.signal().attribute('message');

            /** @name        action
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned action value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const action = this.signal().attribute('action');
            this.iconText = () => icon.Get() ?? '';
            this.messageText = () => message.Get() ?? '';
            this.actionText = () => action.Get() ?? '';
            this.hasIcon = () => !!icon.Get();
            this.hasMessage = () => !!message.Get();
            this.hasAction = () => !!action.Get();
            this.isDismissible = () => this.getAttribute('dismissible') !== 'false';
            this.onAction = () => {
                this.dispatchEvent(new CustomEvent('arianna:action', { bubbles: true, detail: {} }));
            };
            this.onDismiss = () => {
                this.style.display = 'none';
                this.dispatchEvent(new CustomEvent('arianna:dismiss', { bubbles: true, detail: {} }));
            };
            this.template = html `
            <span class="ar-banner__icon" a-if="this.hasIcon()">{{ this.iconText() }}</span>
            <span class="ar-banner__msg" a-if="this.hasMessage()">{{ this.messageText() }}</span>
            <span class="ar-banner__msg" a-if="!this.hasMessage()"><slot></slot></span>
            <button class="ar-banner__action" a-if="this.hasAction()" @click="this.onAction">{{ this.actionText() }}</button>
            <button class="ar-banner__close"  a-if="this.isDismissible()" @click="this.onDismiss" aria-label="Dismiss">✕</button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Banner.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Banner.DefaultSheet();
        }

        /** Programmatic dismiss (mirrors the user clicking the close button). */
        dismiss(): void { this.onDismiss(); }

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
        set variant(v: string) { this.setAttribute('variant', v); }

        /** @name        dismissible
         *  @public
         *  @type        {boolean}
         *  @description Component member for dismissible.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get dismissible(): boolean { return this.getAttribute('dismissible') !== 'false'; }

        /** @name        dismissible
         *  @public
         *  @type        {void}
         *  @description Component member for dismissible.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set dismissible(v: boolean) { this.setAttribute('dismissible', v ? 'true' : 'false'); }

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

        /** @name        message
         *  @public
         *  @type        {string}
         *  @description Component member for message.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get message(): string { return this.getAttribute('message') ?? ''; }

        /** @name        message
         *  @public
         *  @type        {void}
         *  @description Component member for message.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set message(v: string) { v ? this.setAttribute('message', v) : this.removeAttribute('message'); }

        /** @name        action
         *  @public
         *  @type        {string}
         *  @description Component member for action.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get action(): string { return this.getAttribute('action') ?? ''; }

        /** @name        action
         *  @public
         *  @type        {void}
         *  @description Component member for action.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set action(v: string) { v ? this.setAttribute('action', v) : this.removeAttribute('action'); }

        /** @name        iconText
         *  @private
         *  @type        {() => string}
         *  @description Component member for icon Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconText: () => string = () => '';

        /** @name        messageText
         *  @private
         *  @type        {() => string}
         *  @description Component member for message Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private messageText: () => string = () => '';

        /** @name        actionText
         *  @private
         *  @type        {() => string}
         *  @description Component member for action Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private actionText: () => string = () => '';

        /** @name        hasIcon
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasIcon: () => boolean = () => false;

        /** @name        hasMessage
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Message.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasMessage: () => boolean = () => false;

        /** @name        hasAction
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Action.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasAction: () => boolean = () => false;

        /** @name        isDismissible
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Dismissible.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDismissible: () => boolean = () => true;

        /** @name        onAction
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Action.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAction: () => void = () => { };

        /** @name        onDismiss
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Dismiss.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDismiss: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Banner.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Banner.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    display: 'flex',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '0.83rem',
                    color: 'var(--arianna-text, #1f2328)',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                }),
                new Rule(':host([variant="info"])', { background: 'rgba(77,208,225,0.12)', borderBottom: '1px solid var(--arianna-info, #4dd0e1)' }),
                new Rule(':host([variant="success"])', { background: 'rgba(46,160,67,0.12)', borderBottom: '1px solid var(--arianna-success, #2ea043)' }),
                new Rule(':host([variant="warning"])', { background: 'rgba(210,153,34,0.12)', borderBottom: '1px solid var(--arianna-warning, #d29922)' }),
                new Rule(':host([variant="danger"])', { background: 'rgba(207,34,46,0.12)', borderBottom: '1px solid var(--arianna-danger, #cf222e)' }),
                new Rule('.ar-banner__msg', { flex: '1' }),
                new Rule('.ar-banner__icon', { flexShrink: '0' }),
                new Rule('.ar-banner__action', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-primary, #1f6feb)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    textDecoration: 'underline',
                }),
                new Rule('.ar-banner__close', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-muted, #8b949e)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    marginLeft: 'auto',
                }),
            ]);
        }
    }
}
export default Banner;

export type BannerOptions = Banner.Interfaces.BannerOptions;
