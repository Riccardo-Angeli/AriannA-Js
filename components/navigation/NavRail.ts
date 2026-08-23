/**
 * @module    components/navigation/NavRail
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA NavRail component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   NavRail
 *  @public
 *  @description Namespace containing NavRail contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace NavRail
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
        /** @interface   NavRailItem
         *  @public
         *  @description NavRailItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface NavRailItem
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;

            /** @name        badge
             *  @public
             *  @type        {string | number}
             *  @description Component member for badge.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            badge?: string | number;
        }

        /** @interface   NavRailOptions
         *  @public
         *  @description NavRailOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface NavRailOptions
        {
            /** @name        items
             *  @public
             *  @type        {NavRail.Interfaces.NavRailItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items?: Interfaces.NavRailItem[];

            /** @name        collapsed
             *  @public
             *  @type        {boolean}
             *  @description Component member for collapsed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            collapsed?: boolean;

            /** @name        active
             *  @public
             *  @type        {string}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active?: string;
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

    /** @class       NavRail
     *  @public
     *  @description AriannA NavRail component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-nav-rail', {}, {
        Attributes: ['collapsed', 'active'],
    })
    export class NavRail extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        items$
         *  @public
         *  @type        {NavRail.Types.Signal<NavRail.Interfaces.NavRailItem[]>}
         *  @description Component member for items$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        items$: Types.Signal<Interfaces.NavRailItem[]> = signal<Interfaces.NavRailItem[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {NavRail.Interfaces.NavRailOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.NavRailOptions = {})
        {
            /** @name        active
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned active value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const active = this.signal().attribute('active');
            this.allItems = () => this.items$.Get();
            this.isCollapsed = () => this.hasAttribute('collapsed');
            this.toggleIcon = () => this.isCollapsed() ? '▸' : '◂';
            this.itemClass = (item: Interfaces.NavRailItem) => {
                /** @name        isActive
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isActive value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isActive = item.id === (active.Get() ?? '');
                return 'ar-navrail__item' + (isActive ? ' ar-navrail__item--active' : '');
            };
            this.onToggle = () => {
                /** @name        newC
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned newC value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const newC = !this.isCollapsed();
                if (newC)
                    this.setAttribute('collapsed', '');
                else
                    this.removeAttribute('collapsed');
                this.dispatchEvent(new CustomEvent('arianna:toggle', {
                    bubbles: true, detail: { collapsed: newC },
                }));
            };
            this.onItemClick = (item: Interfaces.NavRailItem) => {
                this.setAttribute('active', item.id);
                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true, detail: { id: item.id, item },
                }));
            };
            this.template = html `
            <button class="ar-navrail__toggle" @click="this.onToggle">{{ this.toggleIcon() }}</button>
            <button :class="this.itemClass(item)"
                    a-for="item in this.allItems()"
                    @click="(e) => this.onItemClick(item)">
                <span class="ar-navrail__icon">{{ item.icon }}</span>
                <span class="ar-navrail__label">{{ item.label }}</span>
                <span class="ar-navrail__badge" a-if="item.badge !== undefined">{{ item.badge }}</span>
            </button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {NavRail.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = NavRail.DefaultSheet();
        }

        /** @name        items
         *  @public
         *  @type        {void}
         *  @description Component member for items.
         *  @param       {NavRail.Interfaces.NavRailItem[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set items(v: Interfaces.NavRailItem[]) { this.items$.Set(v ?? []); }

        /** @name        items
         *  @public
         *  @type        {NavRail.Interfaces.NavRailItem[]}
         *  @description Component member for items.
         *  @returns     {NavRail.Interfaces.NavRailItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get items(): Interfaces.NavRailItem[] { return this.items$.Get(); }

        /** @name        toggle
         *  @public
         *  @type        {this}
         *  @description Component member for toggle.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggle(): this { this.onToggle(); return this; }

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

        /** @name        active
         *  @public
         *  @type        {string}
         *  @description Component member for active.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get active(): string { return this.getAttribute('active') ?? ''; }

        /** @name        active
         *  @public
         *  @type        {void}
         *  @description Component member for active.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set active(v: string) { v ? this.setAttribute('active', v) : this.removeAttribute('active'); }

        /** @name        collapsed
         *  @public
         *  @type        {boolean}
         *  @description Component member for collapsed.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get collapsed(): boolean { return this.hasAttribute('collapsed'); }

        /** @name        collapsed
         *  @public
         *  @type        {void}
         *  @description Component member for collapsed.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set collapsed(v: boolean) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }

        /** @name        allItems
         *  @private
         *  @type        {() => NavRail.Interfaces.NavRailItem[]}
         *  @description Component member for all Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allItems: () => Interfaces.NavRailItem[] = () => [];

        /** @name        isCollapsed
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Collapsed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isCollapsed: () => boolean = () => false;

        /** @name        toggleIcon
         *  @private
         *  @type        {() => string}
         *  @description Component member for toggle Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private toggleIcon: () => string = () => '◂';

        /** @name        itemClass
         *  @private
         *  @type        {(item: NavRail.Interfaces.NavRailItem) => string}
         *  @description Component member for item Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemClass: (item: Interfaces.NavRailItem) => string = () => '';

        /** @name        onToggle
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Toggle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggle: () => void = () => { };

        /** @name        onItemClick
         *  @private
         *  @type        {(item: NavRail.Interfaces.NavRailItem) => void}
         *  @description Component member for on Item Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onItemClick: (item: Interfaces.NavRailItem) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {NavRail.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {NavRail.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    padding: '8px 6px',
                    width: '220px',
                    transition: 'width 0.18s ease',
                }),
                new Rule(':host([collapsed])', { width: '56px' }),
                new Rule('.ar-navrail__toggle', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-muted, #8b949e)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '6px',
                    textAlign: 'right',
                }),
                new Rule('.ar-navrail__item', {
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-muted, #8b949e)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '10px',
                    font: 'inherit',
                    fontSize: '0.83rem',
                    padding: '9px 10px',
                    textAlign: 'left',
                    transition: 'background 0.18s ease, color 0.18s ease',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    overflow: 'hidden',
                }),
                new Rule('.ar-navrail__item:hover', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-navrail__item--active', {
                    background: 'rgba(31,111,235,0.12)',
                    color: 'var(--arianna-primary, #1f6feb)',
                    fontWeight: '600',
                }),
                new Rule('.ar-navrail__icon', {
                    flexShrink: '0',
                    fontSize: '1.1rem',
                    width: '20px',
                    textAlign: 'center',
                }),
                new Rule('.ar-navrail__label', { flex: '1' }),
                new Rule(':host([collapsed]) .ar-navrail__label', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-navrail__badge', { display: 'none' }),
                new Rule('.ar-navrail__badge', {
                    background: 'var(--arianna-danger, #cf222e)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                }),
            ]);
        }
    }
}
export default NavRail;
