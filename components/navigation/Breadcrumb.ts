/**
 * @module    components/navigation/Breadcrumb
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Breadcrumb component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   Breadcrumb
 *  @public
 *  @description Namespace containing Breadcrumb contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Breadcrumb
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

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
        /** @interface   BreadcrumbItem
         *  @public
         *  @description BreadcrumbItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BreadcrumbItem
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        href
             *  @public
             *  @type        {string}
             *  @description Component member for href.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            href?: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;
        }

        /** @interface   BreadcrumbOptions
         *  @public
         *  @description BreadcrumbOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BreadcrumbOptions
        {
            /** @name        separator
             *  @public
             *  @type        {string}
             *  @description Component member for separator.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            separator?: string;

            /** @name        items
             *  @public
             *  @type        {Breadcrumb.Interfaces.BreadcrumbItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items?: Interfaces.BreadcrumbItem[];
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
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       Breadcrumb
     *  @public
     *  @description AriannA Breadcrumb component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-breadcrumb', {}, {
        Attributes: ['separator'],
    })
    export class Breadcrumb extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        items$
         *  @public
         *  @type        {Breadcrumb.Types.Signal<Breadcrumb.Interfaces.BreadcrumbItem[]>}
         *  @description Component member for items$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        items$: Types.Signal<Interfaces.BreadcrumbItem[]> = signal<Interfaces.BreadcrumbItem[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Breadcrumb.Interfaces.BreadcrumbOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.BreadcrumbOptions = {})
        {
            this.setAttribute('role', 'navigation');
            this.setAttribute('aria-label', 'Breadcrumb');

            /** @name        sep
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sep value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sep = this.signal().attribute('separator');
            this.allItems = () => this.items$.Get();
            this.separator = () => sep.Get() ?? '/';
            this.isLast = (i: number) => i === this.items$.Get().length - 1;
            this.notLast = (i: number) => i < this.items$.Get().length - 1;
            this.onItemClick = (item: Interfaces.BreadcrumbItem, e: Event) => {
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('arianna:click', {
                    bubbles: true, detail: { item },
                }));
            };
            this.template = html `
            <ol class="ar-breadcrumb__list">
                <li class="ar-breadcrumb__item" a-for="(item, i) in this.allItems()">
                    <span class="ar-breadcrumb__icon" a-if="item.icon">{{ item.icon }}</span>
                    <span class="ar-breadcrumb__current" a-if="this.isLast(i)" aria-current="page">{{ item.label }}</span>
                    <a class="ar-breadcrumb__link"
                       a-if="this.notLast(i)"
                       :href="item.href"
                       @click="(e) => this.onItemClick(item, e)">{{ item.label }}</a>
                    <span class="ar-breadcrumb__sep"
                          a-if="this.notLast(i)"
                          aria-hidden="true">{{ this.separator() }}</span>
                </li>
            </ol>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Breadcrumb.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Breadcrumb.DefaultSheet();
        }

        /** @name        items
         *  @public
         *  @type        {void}
         *  @description Component member for items.
         *  @param       {Breadcrumb.Interfaces.BreadcrumbItem[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set items(v: Interfaces.BreadcrumbItem[]) { this.items$.Set(v ?? []); }

        /** @name        items
         *  @public
         *  @type        {Breadcrumb.Interfaces.BreadcrumbItem[]}
         *  @description Component member for items.
         *  @returns     {Breadcrumb.Interfaces.BreadcrumbItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get items(): Interfaces.BreadcrumbItem[] { return this.items$.Get(); }

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

        /** @name        allItems
         *  @private
         *  @type        {() => Breadcrumb.Interfaces.BreadcrumbItem[]}
         *  @description Component member for all Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allItems: () => Interfaces.BreadcrumbItem[] = () => [];

        /** @name        separator
         *  @private
         *  @type        {() => string}
         *  @description Component member for separator.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private separator: () => string = () => '/';

        /** @name        isLast
         *  @private
         *  @type        {(i: number) => boolean}
         *  @description Component member for is Last.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isLast: (i: number) => boolean = () => false;

        /** @name        notLast
         *  @private
         *  @type        {(i: number) => boolean}
         *  @description Component member for not Last.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private notLast: (i: number) => boolean = () => false;

        /** @name        onItemClick
         *  @private
         *  @type        {(i: Breadcrumb.Interfaces.BreadcrumbItem, e: Event) => void}
         *  @description Component member for on Item Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onItemClick: (i: Interfaces.BreadcrumbItem, e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Breadcrumb.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Breadcrumb.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-breadcrumb__list', {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2px',
                    listStyle: 'none',
                    margin: '0',
                    padding: '0',
                }),
                new Rule('.ar-breadcrumb__item', {
                    alignItems: 'center',
                    display: 'flex',
                    gap: '4px',
                    fontSize: '0.82rem',
                }),
                new Rule('.ar-breadcrumb__link', {
                    color: 'var(--arianna-primary, #1f6feb)',
                    textDecoration: 'none',
                }),
                new Rule('.ar-breadcrumb__link:hover', { textDecoration: 'underline' }),
                new Rule('.ar-breadcrumb__current', { color: 'var(--arianna-muted, #8b949e)' }),
                new Rule('.ar-breadcrumb__sep', { color: 'var(--arianna-dim, #a0a0a0)', padding: '0 2px' }),
            ]);
        }
    }
}
export default Breadcrumb;
