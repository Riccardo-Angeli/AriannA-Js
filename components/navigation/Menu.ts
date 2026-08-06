/**
 * @module    components/navigation/Menu
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Menu component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Menu
 *  @public
 *  @description Namespace containing Menu contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Menu
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
        /** @interface   MenuItem
         *  @public
         *  @description MenuItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MenuItem
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
            icon?: string;

            /** @name        shortcut
             *  @public
             *  @type        {string}
             *  @description Component member for shortcut.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            shortcut?: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;

            /** @name        danger
             *  @public
             *  @type        {boolean}
             *  @description Component member for danger.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            danger?: boolean;

            /** @name        separator
             *  @public
             *  @type        {boolean}
             *  @description Component member for separator.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            separator?: boolean;
        }

        /** @interface   MenuOptions
         *  @public
         *  @description MenuOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MenuOptions
        {
            /** @name        items
             *  @public
             *  @type        {Menu.Interfaces.MenuItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items?: Interfaces.MenuItem[];
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

    /** @class       Menu
     *  @public
     *  @description AriannA Menu component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-menu', {}, {
        Attributes: [],
    })
    export class Menu extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        items$
         *  @public
         *  @type        {Menu.Types.Signal<Menu.Interfaces.MenuItem[]>}
         *  @description Component member for items$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        items$: Types.Signal<Interfaces.MenuItem[]> = signal<Interfaces.MenuItem[]>([]);

        /** @name        #outsideClick
         *  @public
         *  @type        {((e: Event) => void) | null}
         *  @description Component member for outside Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #outsideClick: ((e: Event) => void) | null = null;

        /** @name        #keydown
         *  @public
         *  @type        {((e: KeyboardEvent) => void) | null}
         *  @description Component member for keydown.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #keydown: ((e: KeyboardEvent) => void) | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Menu.Interfaces.MenuOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.MenuOptions = {})
        {
            // Move to body (fixed positioning ignores stacking contexts) — only
            // if we're not already there.
            if (this.parentElement !== document.body)
                document.body.appendChild(this);
            this.style.display = 'none';
            this.allItems = () => this.items$.Get();
            this.isSep = (item: Interfaces.MenuItem) => !!item.separator;
            this.notSep = (item: Interfaces.MenuItem) => !item.separator;
            this.itemClass = (item: Interfaces.MenuItem) => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let c = 'ar-menu__item';
                if (item.disabled)
                    c += ' ar-menu__item--disabled';
                if (item.danger)
                    c += ' ar-menu__item--danger';
                return c;
            };
            this.onItemClick = (item: Interfaces.MenuItem, e: Event) => {
                e.stopPropagation();
                if (item.disabled)
                    return;
                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true, detail: { id: item.id, item },
                }));
                this.close();
            };
            this.template = html `
            <div class="ar-menu__sep" a-for="item in this.allItems()" a-if="this.isSep(item)"></div>
            <button :class="this.itemClass(item)"
                    a-for="item in this.allItems()"
                    a-if="this.notSep(item)"
                    :disabled="item.disabled"
                    @click="(e) => this.onItemClick(item, e)">
                <span class="ar-menu__icon" a-if="item.icon">{{ item.icon }}</span>
                <span class="ar-menu__label">{{ item.label }}</span>
                <span class="ar-menu__shortcut" a-if="item.shortcut">{{ item.shortcut }}</span>
            </button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Menu.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Menu.DefaultSheet();
        }

        /** @name        items
         *  @public
         *  @type        {void}
         *  @description Component member for items.
         *  @param       {Menu.Interfaces.MenuItem[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set items(v: Interfaces.MenuItem[]) { this.items$.Set(v ?? []); }

        /** @name        items
         *  @public
         *  @type        {Menu.Interfaces.MenuItem[]}
         *  @description Component member for items.
         *  @returns     {Menu.Interfaces.MenuItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get items(): Interfaces.MenuItem[] { return this.items$.Get(); }

        /** Open the menu at viewport coordinates (x, y). */
        openAt(x: number, y: number): this
        {
            this.style.display = '';

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = this.offsetWidth || 180;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = this.offsetHeight || 200;
            this.style.left = (x + w > window.innerWidth ? window.innerWidth - w - 8 : x) + 'px';
            this.style.top = (y + h > window.innerHeight ? window.innerHeight - h - 8 : y) + 'px';
            // Outside click closes the menu (next tick so the open click doesn't trigger)
            this.#outsideClick = () => this.close();
            this.#keydown = (e: KeyboardEvent) => {
                if (e.key === 'Escape')
                    this.close();
            };
            setTimeout(() => {
                document.addEventListener('click', this.#outsideClick!);
                document.addEventListener('keydown', this.#keydown!);
            }, 0);
            this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: {} }));
            return this;
        }

        /** Open the menu below an anchor element. */
        openBelow(anchor: HTMLElement): this
        {
            /** @name        r
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned r value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const r = anchor.getBoundingClientRect();
            return this.openAt(r.left, r.bottom + 4);
        }

        /** @name        close
         *  @public
         *  @type        {this}
         *  @description Component member for close.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        close(): this
        {
            this.style.display = 'none';
            if (this.#outsideClick)
                document.removeEventListener('click', this.#outsideClick);
            if (this.#keydown)
                document.removeEventListener('keydown', this.#keydown);
            this.#outsideClick = null;
            this.#keydown = null;
            this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
            return this;
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
        onUnmount()
        {
            if (this.#outsideClick)
                document.removeEventListener('click', this.#outsideClick);
            if (this.#keydown)
                document.removeEventListener('keydown', this.#keydown);
        }

        /** @name        allItems
         *  @private
         *  @type        {() => Menu.Interfaces.MenuItem[]}
         *  @description Component member for all Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allItems: () => Interfaces.MenuItem[] = () => [];

        /** @name        isSep
         *  @private
         *  @type        {(item: Menu.Interfaces.MenuItem) => boolean}
         *  @description Component member for is Sep.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSep: (item: Interfaces.MenuItem) => boolean = () => false;

        /** @name        notSep
         *  @private
         *  @type        {(item: Menu.Interfaces.MenuItem) => boolean}
         *  @description Component member for not Sep.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private notSep: (item: Interfaces.MenuItem) => boolean = () => false;

        /** @name        itemClass
         *  @private
         *  @type        {(item: Menu.Interfaces.MenuItem) => string}
         *  @description Component member for item Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemClass: (item: Interfaces.MenuItem) => string = () => '';

        /** @name        onItemClick
         *  @private
         *  @type        {(item: Menu.Interfaces.MenuItem, e: Event) => void}
         *  @description Component member for on Item Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onItemClick: (item: Interfaces.MenuItem, e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Menu.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Menu.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '180px',
                    overflow: 'hidden',
                    padding: '4px 0',
                    position: 'fixed',
                    zIndex: '2000',
                }),
                new Rule('.ar-menu__item', {
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    gap: '8px',
                    padding: '7px 14px',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.18s ease',
                }),
                new Rule('.ar-menu__item:hover:not(:disabled)', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-menu__item--danger', { color: 'var(--arianna-danger, #cf222e)' }),
                new Rule('.ar-menu__item--disabled', { opacity: '0.4', cursor: 'not-allowed' }),
                new Rule('.ar-menu__label', { flex: '1' }),
                new Rule('.ar-menu__shortcut', {
                    color: 'var(--arianna-muted, #8b949e)',
                    fontSize: '0.72rem',
                }),
                new Rule('.ar-menu__icon', {
                    width: '16px',
                    textAlign: 'center',
                    flexShrink: '0',
                }),
                new Rule('.ar-menu__sep', {
                    background: 'var(--arianna-border, #d8d8d8)',
                    height: '1px',
                    margin: '4px 0',
                }),
            ]);
        }
    }
}
export default Menu;
