/**
 * @module    components/display/List
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA List component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   List
 *  @public
 *  @description Namespace containing List contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace List
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
        /** @interface   ListItem
         *  @public
         *  @description ListItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ListItem
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

            /** @name        subtitle
             *  @public
             *  @type        {string}
             *  @description Component member for subtitle.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            subtitle?: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        badge
             *  @public
             *  @type        {string | number}
             *  @description Component member for badge.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            badge?: string | number;

            /** @name        meta
             *  @public
             *  @type        {string}
             *  @description Component member for meta.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            meta?: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   ListOptions
         *  @public
         *  @description ListOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ListOptions
        {
            /** @name        selectable
             *  @public
             *  @type        {boolean}
             *  @description Component member for selectable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selectable?: boolean;

            /** @name        multiselect
             *  @public
             *  @type        {boolean}
             *  @description Component member for multiselect.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            multiselect?: boolean;

            /** @name        dense
             *  @public
             *  @type        {boolean}
             *  @description Component member for dense.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dense?: boolean;

            /** @name        divided
             *  @public
             *  @type        {boolean}
             *  @description Component member for divided.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            divided?: boolean;
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

    /** @class       List
     *  @public
     *  @description AriannA List component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-list', {}, {
        Attributes: ['selectable', 'multiselect', 'dense', 'divided'],
    })
    export class List extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** Reactive items list. */
        items$: Types.Signal<Interfaces.ListItem[]> = signal<Interfaces.ListItem[]>([]);

        /** Selected ids set, reactive. */
        selected$: Types.Signal<Set<string>> = signal<Set<string>>(new Set());

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {List.Interfaces.ListOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ListOptions = {})
        {
            this.setAttribute('role', this.hasAttribute('selectable') ? 'listbox' : 'list');
            this.hasItems = () => this.items$.Get().length > 0;
            this.allItems = () => this.items$.Get();
            this.isSelectable = () => this.hasAttribute('selectable');
            this.itemClass = (item: Interfaces.ListItem) => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let c = 'ar-list__item';
                if (this.selected$.Get().has(item.id))
                    c += ' ar-list__item--selected';
                if (item.disabled)
                    c += ' ar-list__item--disabled';
                return c;
            };
            this.itemRole = () => this.isSelectable() ? 'option' : 'listitem';
            this.itemClick = (item: Interfaces.ListItem) => {
                if (item.disabled || !this.isSelectable())
                    return;

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = new Set(this.selected$.Get());

                /** @name        multi
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned multi value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const multi = this.hasAttribute('multiselect');
                if (!multi)
                    cur.clear();
                if (cur.has(item.id))
                    cur.delete(item.id);
                else
                    cur.add(item.id);
                this.selected$.Set(cur);
                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true,
                    detail: { item, selected: [...cur] },
                }));
            };
            this.template = html `
            <ul class="ar-list__container" a-if="this.hasItems()">
                <li a-for="item in this.allItems()"
                    :class="this.itemClass(item)"
                    :role="this.itemRole()"
                    @click="(e) => this.itemClick(item)">
                    <span class="ar-list__icon"     a-if="item.icon">{{ item.icon }}</span>
                    <div  class="ar-list__body">
                        <div class="ar-list__label">{{ item.label }}</div>
                        <div class="ar-list__subtitle" a-if="item.subtitle">{{ item.subtitle }}</div>
                    </div>
                    <span class="ar-list__badge" a-if="item.badge !== undefined">{{ item.badge }}</span>
                    <span class="ar-list__meta"  a-if="item.meta">{{ item.meta }}</span>
                </li>
            </ul>
            <ul class="ar-list__container" a-if="!this.hasItems()">
                <slot></slot>
            </ul>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {List.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = List.DefaultSheet();
        }

        /** Replace the items list. */
        set items(v: Interfaces.ListItem[]) { this.items$.Set(v ?? []); }

        /** @name        items
         *  @public
         *  @type        {List.Interfaces.ListItem[]}
         *  @description Component member for items.
         *  @returns     {List.Interfaces.ListItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get items(): Interfaces.ListItem[] { return this.items$.Get(); }

        /** Currently-selected item ids. */
        get selected(): Set<string> { return this.selected$.Get(); }

        /** @name        clearSelection
         *  @public
         *  @type        {void}
         *  @description Component member for clear Selection.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clearSelection(): void { this.selected$.Set(new Set()); }

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

        /** @name        selectable
         *  @public
         *  @type        {boolean}
         *  @description Component member for selectable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get selectable(): boolean { return this.hasAttribute('selectable'); }

        /** @name        selectable
         *  @public
         *  @type        {void}
         *  @description Component member for selectable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set selectable(v: boolean) { v ? this.setAttribute('selectable', '') : this.removeAttribute('selectable'); }

        /** @name        multiselect
         *  @public
         *  @type        {boolean}
         *  @description Component member for multiselect.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get multiselect(): boolean { return this.hasAttribute('multiselect'); }

        /** @name        multiselect
         *  @public
         *  @type        {void}
         *  @description Component member for multiselect.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set multiselect(v: boolean) { v ? this.setAttribute('multiselect', '') : this.removeAttribute('multiselect'); }

        /** @name        dense
         *  @public
         *  @type        {boolean}
         *  @description Component member for dense.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get dense(): boolean { return this.hasAttribute('dense'); }

        /** @name        dense
         *  @public
         *  @type        {void}
         *  @description Component member for dense.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set dense(v: boolean) { v ? this.setAttribute('dense', '') : this.removeAttribute('dense'); }

        /** @name        divided
         *  @public
         *  @type        {boolean}
         *  @description Component member for divided.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get divided(): boolean { return this.hasAttribute('divided'); }

        /** @name        divided
         *  @public
         *  @type        {void}
         *  @description Component member for divided.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set divided(v: boolean) { v ? this.setAttribute('divided', '') : this.removeAttribute('divided'); }

        /** @name        hasItems
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasItems: () => boolean = () => false;

        /** @name        allItems
         *  @private
         *  @type        {() => List.Interfaces.ListItem[]}
         *  @description Component member for all Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allItems: () => Interfaces.ListItem[] = () => [];

        /** @name        isSelectable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Selectable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSelectable: () => boolean = () => false;

        /** @name        itemClass
         *  @private
         *  @type        {(i: List.Interfaces.ListItem) => string}
         *  @description Component member for item Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemClass: (i: Interfaces.ListItem) => string = () => 'ar-list__item';

        /** @name        itemRole
         *  @private
         *  @type        {() => string}
         *  @description Component member for item Role.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemRole: () => string = () => 'listitem';

        /** @name        itemClick
         *  @private
         *  @type        {(i: List.Interfaces.ListItem) => void}
         *  @description Component member for item Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemClick: (i: Interfaces.ListItem) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {List.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {List.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-list__container', {
                    listStyle: 'none',
                    margin: '0',
                    padding: '0',
                }),
                new Rule(':host([divided]) .ar-list__item:not(:last-child)', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-list__item', {
                    alignItems: 'center',
                    display: 'flex',
                    gap: '10px',
                    padding: '10px 12px',
                    transition: 'background 0.18s ease',
                }),
                new Rule(':host([dense]) .ar-list__item', { padding: '6px 12px' }),
                new Rule('.ar-list__item:hover:not(.ar-list__item--disabled)', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-list__item--selected', { background: 'rgba(31,111,235,0.1)' }),
                new Rule('.ar-list__item--disabled', { opacity: '0.45' }),
                new Rule('.ar-list__icon', { flexShrink: '0', fontSize: '1rem' }),
                new Rule('.ar-list__body', { flex: '1', minWidth: '0' }),
                new Rule('.ar-list__label', {
                    fontSize: '0.83rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule('.ar-list__subtitle', {
                    color: 'var(--arianna-muted, #8b949e)',
                    fontSize: '0.74rem',
                    marginTop: '1px',
                }),
                new Rule('.ar-list__badge', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.66rem',
                    fontWeight: '600',
                    padding: '1px 6px',
                }),
                new Rule('.ar-list__meta', {
                    color: 'var(--arianna-muted, #8b949e)',
                    fontSize: '0.74rem',
                    whiteSpace: 'nowrap',
                }),
            ]);
        }
    }
}
export default List;

export type ListItem = List.Interfaces.ListItem;
export type ListOptions = List.Interfaces.ListOptions;
