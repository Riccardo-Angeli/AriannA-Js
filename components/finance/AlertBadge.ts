import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { MountFinanceTemplate } from './Base.ts';
/**
 * @module    components/finance/AlertBadge
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AlertBadge component module.
 */




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
    export const Styles: Types.Stylesheet = (() =>
    {
            return new Stylesheet([
            new Rule('.AlertBadge', {
                '--arianna-bg': '#17181c',
                '--arianna-bg-2': '#1d1e23',
                '--arianna-bg-3': '#24262b',
                '--arianna-text': '#e6e8eb',
                '--arianna-muted': '#9aa0aa',
                '--arianna-dim': '#6f7580',
                '--arianna-border': '#303238',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#26a69a',
                '--arianna-warning': '#f5a623',
                '--arianna-danger': '#ef5350',
                '--bg': '#17181c',
                '--bg3': '#24262b',
                '--text': '#e6e8eb',
                '--muted': '#9aa0aa',
                '--border': '#303238',
                '--accent': '#e40c88',
            }),
            new Rule('.AlertBadge[theme="light"]', {
                '--arianna-bg': '#ffffff',
                '--arianna-bg-2': '#fbfbfc',
                '--arianna-bg-3': '#f3f3f5',
                '--arianna-text': '#1c1e21',
                '--arianna-muted': '#626873',
                '--arianna-dim': '#8a8f98',
                '--arianna-border': '#e2e2e6',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#168a78',
                '--arianna-warning': '#b66c00',
                '--arianna-danger': '#c93645',
                '--bg': '#ffffff',
                '--bg3': '#f3f3f5',
                '--text': '#1c1e21',
                '--muted': '#626873',
                '--border': '#e2e2e6',
                '--accent': '#e40c88',
            }),
                new Rule('.AlertBadge', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    fontFamily: 'inherit',
                    gap: '6px',
                    padding: '4px 10px',
                }),
                new Rule('.AlertBadge .AlertBadge-Main', {
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                    fontSize: '13px',
                    fontWeight: '600',
                }),
                new Rule('.AlertBadge .AlertBadge-Sub', {
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                    fontSize: '11px',
                }),
                // ── Level palettes ──────────────────────────────────────────
                new Rule('.AlertBadge[level="neutral"]', {
                    background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                }),
                new Rule('.AlertBadge[level="neutral"] .AlertBadge-Main', {
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                }),
                new Rule('.AlertBadge[level="info"]', {
                    background: 'rgba(31,111,235,0.10)',
                }),
                new Rule('.AlertBadge[level="info"] .AlertBadge-Main', {
                    color: 'var(--arianna-primary, var(--accent, #e40c88))',
                }),
                new Rule('.AlertBadge[level="warning"]', {
                    background: 'rgba(245,166,35,0.15)',
                }),
                new Rule('.AlertBadge[level="warning"] .AlertBadge-Main', {
                    color: 'var(--arianna-warning, #f5a623)',
                }),
                new Rule('.AlertBadge[level="danger"]', {
                    background: 'rgba(207,34,46,0.12)',
                }),
                new Rule('.AlertBadge[level="danger"] .AlertBadge-Main', {
                    color: 'var(--arianna-danger, #ef5350)',
                }),
            ]);
        
    })();

    @Component('arianna-alert-badge', Styles, {
        Shadow: false,
        Attributes: ['text', 'sublabel', 'level', 'theme'],
    })
    export class AlertBadge extends HTMLDivElement
    {
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'AlertBadge';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        constructor()
        {
            super();
            this.classList.add('AlertBadge');
        }

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
            this.classList.add('AlertBadge');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(this.dataset.ariannaFolderReady === 'true') return;
            this.dataset.ariannaFolderReady = 'true';
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
            <span class="AlertBadge-Main">{{ this.textVal() }}</span>
            <span class="AlertBadge-Sub" a-if="this.hasSub()">{{ this.subVal() }}</span>
        `;
            MountFinanceTemplate(this);
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {AlertBadge.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Styles;
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
        public static readonly Styles = Styles;
        static DefaultSheet(): Types.Stylesheet { return Styles; }
    }
}
export default AlertBadge;

export type AlertLevel = AlertBadge.Types.AlertLevel;
export type AlertBadgeOptions = AlertBadge.Interfaces.AlertBadgeOptions;
