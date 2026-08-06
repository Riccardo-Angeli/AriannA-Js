/**
 * @module    components/finance/AlertBadge
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AlertBadge component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   AlertBadge
 *  @public
 *  @description Namespace containing AlertBadge contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AlertBadge
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

        /** @name        AlertLevel
         *  @public
         *  @type        {'neutral' | 'info' | 'warning' | 'danger'}
         *  @description Type alias for AlertLevel.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AlertLevel = 'neutral' | 'info' | 'warning' | 'danger';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   AlertBadgeOptions
         *  @public
         *  @description AlertBadgeOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AlertBadgeOptions
        {
            /** @name        text
             *  @public
             *  @type        {string}
             *  @description Component member for text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            text?: string;

            /** @name        sublabel
             *  @public
             *  @type        {string}
             *  @description Component member for sublabel.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sublabel?: string;

            /** @name        level
             *  @public
             *  @type        {AlertBadge.Types.AlertLevel}
             *  @description Component member for level.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            level?: Types.AlertLevel;
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

    /** @class       AlertBadge
     *  @public
     *  @description AriannA AlertBadge component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-alert-badge', {}, {
        Attributes: ['text', 'sublabel', 'level'],
    })
    export class AlertBadge extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {AlertBadge.Interfaces.AlertBadgeOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.AlertBadgeOptions = {})
        {
            /** @name        text
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned text value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const text = this.signal().attribute('text');

            /** @name        sublabel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sublabel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sublabel = this.signal().attribute('sublabel');
            this.textVal = () => text.Get() ?? '';
            this.subVal = () => sublabel.Get() ?? '';
            this.hasSub = () => !!sublabel.Get();
            this.template = html `
            <span class="ar-alert__main">{{ this.textVal() }}</span>
            <span class="ar-alert__sub" a-if="this.hasSub()">{{ this.subVal() }}</span>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {AlertBadge.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = AlertBadge.DefaultSheet();
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

        /** @name        level
         *  @public
         *  @type        {AlertBadge.Types.AlertLevel}
         *  @description Component member for level.
         *  @returns     {AlertBadge.Types.AlertLevel} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get level(): Types.AlertLevel { return (this.getAttribute('level') ?? 'neutral') as Types.AlertLevel; }

        /** @name        level
         *  @public
         *  @type        {void}
         *  @description Component member for level.
         *  @param       {AlertBadge.Types.AlertLevel} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set level(v: Types.AlertLevel) { this.setAttribute('level', v); }

        /** @name        text
         *  @public
         *  @type        {string}
         *  @description Component member for text.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get text(): string { return this.getAttribute('text') ?? ''; }

        /** @name        text
         *  @public
         *  @type        {void}
         *  @description Component member for text.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set text(v: string) { this.setAttribute('text', v); }

        /** @name        textVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for text Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private textVal: () => string = () => '';

        /** @name        subVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for sub Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private subVal: () => string = () => '';

        /** @name        hasSub
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Sub.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasSub: () => boolean = () => false;

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AlertBadge.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AlertBadge.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    fontFamily: 'inherit',
                    gap: '6px',
                    padding: '4px 10px',
                }),
                new Rule(':host .ar-alert__main', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '13px',
                    fontWeight: '600',
                }),
                new Rule(':host .ar-alert__sub', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '11px',
                }),
                // ── Level palettes ──────────────────────────────────────────
                new Rule(':host([level="neutral"])', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule(':host([level="neutral"]) .ar-alert__main', {
                    color: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule(':host([level="info"])', {
                    background: 'rgba(31,111,235,0.10)',
                }),
                new Rule(':host([level="info"]) .ar-alert__main', {
                    color: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule(':host([level="warning"])', {
                    background: 'rgba(245,166,35,0.15)',
                }),
                new Rule(':host([level="warning"]) .ar-alert__main', {
                    color: 'var(--arianna-warning, #f5a623)',
                }),
                new Rule(':host([level="danger"])', {
                    background: 'rgba(207,34,46,0.12)',
                }),
                new Rule(':host([level="danger"]) .ar-alert__main', {
                    color: 'var(--arianna-danger, #cf222e)',
                }),
            ]);
        }
    }
}
export default AlertBadge;

export type AlertLevel = AlertBadge.Types.AlertLevel;
export type AlertBadgeOptions = AlertBadge.Interfaces.AlertBadgeOptions;
