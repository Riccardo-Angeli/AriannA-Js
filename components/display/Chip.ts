/**
 * @module    components/display/Chip
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Chip component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Chip
 *  @public
 *  @description Namespace containing Chip contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Chip
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
        /** @interface   ChipOptions
         *  @public
         *  @description ChipOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChipOptions
        {
            /** @name        variant
             *  @public
             *  @type        {'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

            /** @name        deletable
             *  @public
             *  @type        {boolean}
             *  @description Component member for deletable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            deletable?: boolean;

            /** @name        size
             *  @public
             *  @type        {'sm' | 'md' | 'lg'}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: 'sm' | 'md' | 'lg';

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        avatar
             *  @public
             *  @type        {string}
             *  @description Component member for avatar.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            avatar?: string;
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

    /** @class       Chip
     *  @public
     *  @description AriannA Chip component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-chip', {}, {
        Attributes: ['variant', 'size', 'deletable', 'label', 'icon', 'avatar'],
    })
    export class Chip extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Chip.Interfaces.ChipOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ChipOptions = {})
        {
            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');

            /** @name        icon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned icon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const icon = this.signal().attribute('icon');

            /** @name        avatar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned avatar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const avatar = this.signal().attribute('avatar');
            this.hasAvatar = () => !!avatar.Get();
            this.hasIcon = () => !!icon.Get() && !avatar.Get();
            this.hasLabel = () => !!label.Get();
            this.isDeletable = () => this.hasAttribute('deletable');
            this.avatarText = () => (avatar.Get() ?? '').slice(0, 2).toUpperCase();
            this.iconText = () => icon.Get() ?? '';
            this.labelText = () => label.Get() ?? '';
            this.onDelete = (e: Event) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('arianna:delete', {
                    bubbles: true, detail: { label: this.labelText() },
                }));
            };
            this.template = html `
            <span class="ar-chip__avatar" a-if="this.hasAvatar()">{{ this.avatarText() }}</span>
            <span class="ar-chip__icon"   a-if="this.hasIcon()">{{ this.iconText() }}</span>
            <span class="ar-chip__label"  a-if="this.hasLabel()">{{ this.labelText() }}</span>
            <span class="ar-chip__label"  a-if="!this.hasLabel()"><slot></slot></span>
            <button class="ar-chip__delete" a-if="this.isDeletable()" @click="this.onDelete" aria-label="Remove">✕</button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Chip.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Chip.DefaultSheet();
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
        set variant(v: string) { this.setAttribute('variant', v); }

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
        set size(v: string) { this.setAttribute('size', v); }

        /** @name        deletable
         *  @public
         *  @type        {boolean}
         *  @description Component member for deletable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get deletable(): boolean { return this.hasAttribute('deletable'); }

        /** @name        deletable
         *  @public
         *  @type        {void}
         *  @description Component member for deletable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set deletable(v: boolean) { v ? this.setAttribute('deletable', '') : this.removeAttribute('deletable'); }

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get label(): string { return this.getAttribute('label') ?? ''; }

        /** @name        label
         *  @public
         *  @type        {void}
         *  @description Component member for label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

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

        /** @name        avatar
         *  @public
         *  @type        {string}
         *  @description Component member for avatar.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get avatar(): string { return this.getAttribute('avatar') ?? ''; }

        /** @name        avatar
         *  @public
         *  @type        {void}
         *  @description Component member for avatar.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set avatar(v: string) { v ? this.setAttribute('avatar', v) : this.removeAttribute('avatar'); }

        /** @name        hasAvatar
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Avatar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasAvatar: () => boolean = () => false;

        /** @name        hasIcon
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasIcon: () => boolean = () => false;

        /** @name        hasLabel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasLabel: () => boolean = () => false;

        /** @name        isDeletable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Deletable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDeletable: () => boolean = () => false;

        /** @name        avatarText
         *  @private
         *  @type        {() => string}
         *  @description Component member for avatar Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private avatarText: () => string = () => '';

        /** @name        iconText
         *  @private
         *  @type        {() => string}
         *  @description Component member for icon Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconText: () => string = () => '';

        /** @name        labelText
         *  @private
         *  @type        {() => string}
         *  @description Component member for label Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelText: () => string = () => '';

        /** @name        onDelete
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Delete.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDelete: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Chip.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Chip.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    borderRadius: '16px',
                    display: 'inline-flex',
                    gap: '5px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':host([variant="primary"])', { background: 'rgba(31,111,235,0.15)', border: '1px solid var(--arianna-primary, #1f6feb)', color: 'var(--arianna-primary, #1f6feb)' }),
                new Rule(':host([variant="success"])', { background: 'rgba(46,160,67,0.15)', border: '1px solid var(--arianna-success, #2ea043)', color: 'var(--arianna-success, #2ea043)' }),
                new Rule(':host([variant="warning"])', { background: 'rgba(210,153,34,0.15)', border: '1px solid var(--arianna-warning, #d29922)', color: 'var(--arianna-warning, #d29922)' }),
                new Rule(':host([variant="danger"])', { background: 'rgba(207,34,46,0.15)', border: '1px solid var(--arianna-danger, #cf222e)', color: 'var(--arianna-danger, #cf222e)' }),
                new Rule(':host([variant="info"])', { background: 'rgba(77,208,225,0.15)', border: '1px solid var(--arianna-info, #4dd0e1)', color: 'var(--arianna-info, #4dd0e1)' }),
                new Rule(':host([size="sm"])', { fontSize: '0.72rem', padding: '2px 8px' }),
                new Rule(':host([size="md"])', { fontSize: '0.78rem', padding: '3px 10px' }),
                new Rule(':host([size="lg"])', { fontSize: '0.85rem', padding: '5px 14px' }),
                new Rule(':host(:not([size]))', { fontSize: '0.78rem', padding: '3px 10px' }),
                new Rule('.ar-chip__avatar', {
                    alignItems: 'center',
                    background: 'currentColor',
                    borderRadius: '50%',
                    color: 'var(--arianna-bg, #ffffff)',
                    display: 'flex',
                    flexShrink: '0',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    height: '18px',
                    justifyContent: 'center',
                    width: '18px',
                }),
                new Rule('.ar-chip__icon', { flexShrink: '0' }),
                new Rule('.ar-chip__delete', {
                    background: 'none',
                    border: 'none',
                    color: 'currentColor',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    lineHeight: '1',
                    opacity: '0.7',
                    padding: '0',
                }),
                new Rule('.ar-chip__delete:hover', { opacity: '1' }),
            ]);
        }
    }
}
export default Chip;

export type ChipOptions = Chip.Interfaces.ChipOptions;
