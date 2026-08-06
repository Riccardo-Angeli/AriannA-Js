/**
 * @module    components/layout/Tabs
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Tabs component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Tabs
 *  @public
 *  @description Namespace containing Tabs contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Tabs
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
        /** @interface   TabsOptions
         *  @public
         *  @description TabsOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TabsOptions
        {
            /** @name        active
             *  @public
             *  @type        {number}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active?: number;
        }

        /** @interface   TabOptions
         *  @public
         *  @description TabOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TabOptions
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;

            /** @name        active
             *  @public
             *  @type        {boolean}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active?: boolean;
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
    // ─────────────────────────────────────────────────────────────────────────────
    //  Tab (child, registers into parent's children bus)
    // ─────────────────────────────────────────────────────────────────────────────
    /** @class       Tab
     *  @public
     *  @description AriannA Tab component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        export @Component('arianna-tab', {}, {
        Attributes: ['label', 'disabled', 'active'],
        bus: 'arianna-tabs',
    })
    class Tab extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Tabs.Interfaces.TabOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.TabOptions = {})
        {
            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');
            this.labelText = () => label.Get() ?? '';
            this.hasLabel = () => !!label.Get();
            this.onClick = () => {
                if (this.hasAttribute('disabled'))
                    return;
                this.dispatchEvent(new CustomEvent('arianna:tab-select', {
                    bubbles: true, detail: { source: this },
                }));
            };
            this.template = html `
            <span a-if="this.hasLabel()" @click="this.onClick">{{ this.labelText() }}</span>
            <span a-if="!this.hasLabel()" @click="this.onClick"><slot></slot></span>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Tabs.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Tab.DefaultSheet();
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

        /** @name        active
         *  @public
         *  @type        {boolean}
         *  @description Component member for active.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get active(): boolean { return this.hasAttribute('active'); }

        /** @name        active
         *  @public
         *  @type        {void}
         *  @description Component member for active.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set active(v: boolean) { v ? this.setAttribute('active', '') : this.removeAttribute('active'); }

        /** @name        labelText
         *  @private
         *  @type        {() => string}
         *  @description Component member for label Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelText: () => string = () => '';

        /** @name        hasLabel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasLabel: () => boolean = () => false;

        /** @name        onClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClick: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Tabs.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Tabs.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    cursor: 'pointer',
                    display: 'inline-block',
                    padding: '8px 14px',
                    borderBottom: '2px solid transparent',
                    color: 'var(--arianna-text, #1f2328)',
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                    fontSize: '0.85rem',
                }),
                new Rule(':host:hover', { color: 'var(--arianna-primary, #1f6feb)' }),
                new Rule(':host([active])', {
                    borderBottomColor: 'var(--arianna-primary, #1f6feb)',
                    color: 'var(--arianna-primary, #1f6feb)',
                    fontWeight: '600',
                }),
                new Rule(':host([disabled])', { cursor: 'not-allowed', opacity: '0.45' }),
            ]);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    //  Tabs (parent, owns the active index)
    // ─────────────────────────────────────────────────────────────────────────────
    /** @class       Tabs
     *  @public
     *  @description AriannA Tabs component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-tabs', {}, {
        Attributes: ['active'],
    })
    export class Tabs extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Tabs.Interfaces.TabsOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.TabsOptions = {})
        {
            // Listen for child triggers (event bubbles up from arianna-tab clicks)
            this.addEventListener('arianna:tab-select', (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as CustomEvent<{
                    /** @name        source
                     *  @public
                     *  @type        {Tabs.Tab}
                     *  @description Component member for source.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    source: Tab;
                }>;

                /** @name        source
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned source value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const source = ev.detail?.source;
                if (!source)
                    return;

                /** @name        triggers
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned triggers value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const triggers = Array.from(this.querySelectorAll('arianna-tab'));

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = triggers.indexOf(source);
                if (idx >= 0)
                {
                    this.setAttribute('active', String(idx));
                    this.#syncChildren();
                    this.dispatchEvent(new CustomEvent('arianna:change', {
                        bubbles: true, detail: { active: idx, source: this },
                    }));
                }
            });
            this.template = html `
            <header class="ar-tabs__header"><slot name="header"></slot></header>
            <section class="ar-tabs__body"><slot></slot></section>
        `;
            // Initial sync (deferred so children mount first)
            setTimeout(() => this.#syncChildren(), 0);
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Tabs.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Tabs.DefaultSheet();
        }

        /** Propagate the parent's `active` index down to children's `[active]` attr. */
        #syncChildren(): void
        {
            /** @name        i
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned i value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const i = parseInt(this.getAttribute('active') ?? '0', 10) || 0;

            /** @name        triggers
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned triggers value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const triggers = Array.from(this.querySelectorAll('arianna-tab'));
            triggers.forEach((t, idx) => {
                if (idx === i)
                    t.setAttribute('active', '');
                else
                    t.removeAttribute('active');
            });
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
        onMount()
        {
            // Re-sync after mount in case children attached during build
            this.#syncChildren();
        }

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
        onUpdate()
        {
            this.#syncChildren();
        }

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

        /** @name        active
         *  @public
         *  @type        {number}
         *  @description Component member for active.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get active(): number { return parseInt(this.getAttribute('active') ?? '0', 10); }

        /** @name        active
         *  @public
         *  @type        {void}
         *  @description Component member for active.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set active(v: number) { this.setAttribute('active', String(v)); this.#syncChildren(); }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Tabs.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Tabs.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-tabs__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'flex',
                    gap: '4px',
                }),
                new Rule('.ar-tabs__body', { padding: '12px 0' }),
            ]);
        }
    }
}
export default Tabs;

export const Tab = Tabs.Tab;

export type TabsOptions = Tabs.Interfaces.TabsOptions;
export type TabOptions = Tabs.Interfaces.TabOptions;
