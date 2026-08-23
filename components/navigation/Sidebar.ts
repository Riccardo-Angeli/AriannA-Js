/**
 * @module    components/navigation/Sidebar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Sidebar component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   Sidebar
 *  @public
 *  @description Namespace containing Sidebar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Sidebar
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
        /** @interface   SidebarItem
         *  @public
         *  @description SidebarItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SidebarItem
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

            /** @name        badge
             *  @public
             *  @type        {string | number}
             *  @description Component member for badge.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            badge?: string | number;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;

            /** @name        class
             *  @public
             *  @type        {string}
             *  @description Component member for class.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            class?: string;

            /** @name        data
             *  @public
             *  @type        {unknown}
             *  @description Component member for data.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            data?: unknown;
        }

        /** @interface   SidebarSection
         *  @public
         *  @description SidebarSection contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SidebarSection
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

            /** @name        items
             *  @public
             *  @type        {Sidebar.Interfaces.SidebarItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items: Interfaces.SidebarItem[];

            /** @name        open
             *  @public
             *  @type        {boolean}
             *  @description Component member for open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            open?: boolean;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;
        }

        /** @interface   SidebarOptions
         *  @public
         *  @description SidebarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SidebarOptions
        {
            /** @name        orientation
             *  @public
             *  @type        {'left' | 'right'}
             *  @description Component member for orientation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            orientation?: 'left' | 'right';

            /** @name        width
             *  @public
             *  @type        {number}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: number;

            /** @name        minWidth
             *  @public
             *  @type        {number}
             *  @description Component member for min Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minWidth?: number;

            /** @name        maxWidth
             *  @public
             *  @type        {number}
             *  @description Component member for max Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            maxWidth?: number;

            /** @name        collapsedWidth
             *  @public
             *  @type        {number}
             *  @description Component member for collapsed Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            collapsedWidth?: number;

            /** @name        collapsible
             *  @public
             *  @type        {boolean}
             *  @description Component member for collapsible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            collapsible?: boolean;

            /** @name        collapsed
             *  @public
             *  @type        {boolean}
             *  @description Component member for collapsed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            collapsed?: boolean;

            /** @name        resizable
             *  @public
             *  @type        {boolean}
             *  @description Component member for resizable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            resizable?: boolean;

            /** @name        searchable
             *  @public
             *  @type        {boolean}
             *  @description Component member for searchable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            searchable?: boolean;

            /** @name        showToggle
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Toggle.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showToggle?: boolean;

            /** @name        persist
             *  @public
             *  @type        {boolean}
             *  @description Component member for persist.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            persist?: boolean;

            /** @name        storageKey
             *  @public
             *  @type        {string}
             *  @description Component member for storage Key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            storageKey?: string;

            /** @name        ariaLabel
             *  @public
             *  @type        {string}
             *  @description Component member for aria Label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ariaLabel?: string;

            /** @name        sections
             *  @public
             *  @type        {Sidebar.Interfaces.SidebarSection[]}
             *  @description Component member for sections.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sections?: Interfaces.SidebarSection[];

            /** @name        active
             *  @public
             *  @type        {string}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active?: string;
        }

        /** @interface   FlatSection
         *  @public
         *  @description FlatSection contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FlatSection
        {
            /** @name        section
             *  @public
             *  @type        {Sidebar.Interfaces.SidebarSection}
             *  @description Component member for section.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            section: Interfaces.SidebarSection;

            /** @name        isOpen
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isOpen: boolean;

            /** @name        items
             *  @public
             *  @type        {Sidebar.Interfaces.SidebarItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items: Interfaces.SidebarItem[];

            /** @name        arrowText
             *  @public
             *  @type        {string}
             *  @description Component member for arrow Text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            arrowText: string;
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

    /** @class       Sidebar
     *  @public
     *  @description AriannA Sidebar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-sidebar', {}, {
        Attributes: [
            'orientation', 'width', 'min-width', 'max-width', 'collapsed-width',
            'collapsed', 'collapsible', 'resizable', 'searchable', 'show-toggle',
            'persist', 'storage-key', 'active', 'aria-label',
        ],
    })
    export class Sidebar extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        sections$
         *  @public
         *  @type        {Sidebar.Types.Signal<Sidebar.Interfaces.SidebarSection[]>}
         *  @description Component member for sections$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        sections$: Types.Signal<Interfaces.SidebarSection[]> = signal<Interfaces.SidebarSection[]>([]);

        /** @name        openSecs$
         *  @public
         *  @type        {Sidebar.Types.Signal<Set<string>>}
         *  @description Component member for open Secs$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        openSecs$: Types.Signal<Set<string>> = signal<Set<string>>(new Set());

        /** @name        query$
         *  @public
         *  @type        {Sidebar.Types.Signal<string>}
         *  @description Component member for query$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        query$: Types.Signal<string> = signal<string>('');

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Sidebar.Interfaces.SidebarOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.SidebarOptions = {})
        {
            this.setAttribute('role', 'navigation');
            if (!this.hasAttribute('aria-label'))
            {
                this.setAttribute('aria-label', 'Site navigation');
            }

            /** @name        orientation
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned orientation value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const orientation = this.signal().attribute('orientation');

            /** @name        collapsed
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned collapsed value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const collapsed = this.signal().attribute('collapsed');

            /** @name        active
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned active value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const active = this.signal().attribute('active');
            // Restore persisted width on first mount if `persist` is set
            if (this.hasAttribute('persist'))
            {
                /** @name        key
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned key value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const key = this.getAttribute('storage-key') ?? 'arianna-sidebar-w';

                /** @name        saved
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned saved value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const saved = localStorage.getItem(key);
                if (saved && !this.hasAttribute('width'))
                {
                    this.setAttribute('width', saved);
                }
            }
            // Apply width style reactively
            /** @name        applyWidth
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned applyWidth value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const applyWidth = () => {
                /** @name        isCollapsed
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isCollapsed value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isCollapsed = collapsed.Get() !== null && this.getAttribute('collapsed') !== null;

                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = isCollapsed
                    ? parseInt(this.getAttribute('collapsed-width') ?? '48', 10) || 48
                    : parseInt(this.getAttribute('width') ?? '260', 10) || 260;
                this.style.width = w + 'px';
            };
            applyWidth();
            this.addEventListener('arianna:attr-width', applyWidth);
            this.addEventListener('arianna:attr-collapsed', applyWidth);
            this.addEventListener('arianna:attr-collapsed-width', applyWidth);
            // Bubble arianna:resize from internal arianna-resizer + persist
            this.addEventListener('arianna:resize', (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as CustomEvent<{
                    /** @name        width
                     *  @public
                     *  @type        {number}
                     *  @description Component member for width.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    width: number;
                }>;

                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = ev.detail?.width;
                if (typeof w === 'number')
                {
                    this.setAttribute('width', String(w));
                    if (this.hasAttribute('persist'))
                    {
                        /** @name        key
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned key value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const key = this.getAttribute('storage-key') ?? 'arianna-sidebar-w';
                        localStorage.setItem(key, String(w));
                    }
                }
            });
            // Re-render section list when sections / open / query change is
            // automatic via the Signal reads inside template helpers.
            this.orient = () => orientation.Get() ?? 'left';
            this.isCollapsed = () => this.hasAttribute('collapsed');
            this.isCollapsible = () => this.hasAttribute('collapsible') || !this.hasAttribute('collapsible'); // defaults true
            this.showToggleBtn = () => {
                /** @name        has
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned has value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const has = this.getAttribute('show-toggle');
                return has !== 'false' && this.isCollapsible();
            };
            this.isSearchable = () => this.getAttribute('searchable') !== 'false';
            this.isResizable = () => this.getAttribute('resizable') !== 'false' && !this.isCollapsed();
            this.toggleIcon = () => {
                /** @name        o
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned o value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const o = this.orient();

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.isCollapsed();
                if (o === 'left')
                    return c ? '▸' : '◂';
                if (o === 'right')
                    return c ? '◂' : '▸';
                return '≡';
            };
            this.resizerHandles = () => this.orient() === 'left' ? 'e' : 'w';
            this.minW = () => parseInt(this.getAttribute('min-width') ?? '160', 10) || 160;
            this.maxW = () => parseInt(this.getAttribute('max-width') ?? '480', 10) || 480;
            this.onToggle = () => {
                /** @name        newCol
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned newCol value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const newCol = !this.isCollapsed();
                if (newCol)
                    this.setAttribute('collapsed', '');
                else
                    this.removeAttribute('collapsed');
                this.dispatchEvent(new CustomEvent('arianna:collapse', {
                    bubbles: true, detail: { collapsed: newCol },
                }));
            };
            this.onSearchInput = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value.toLowerCase().trim();
                this.query$.Set(v);
            };
            this.onSectionClick = (sec: Interfaces.SidebarSection) => {
                /** @name        open
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned open value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const open = new Set(this.openSecs$.Get());

                /** @name        wasOpen
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned wasOpen value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const wasOpen = open.has(sec.id);
                if (wasOpen)
                    open.delete(sec.id);
                else
                    open.add(sec.id);
                this.openSecs$.Set(open);
                this.dispatchEvent(new CustomEvent('arianna:section-toggle', {
                    bubbles: true, detail: { id: sec.id, open: !wasOpen },
                }));
            };
            this.onItemClick = (item: Interfaces.SidebarItem, section: Interfaces.SidebarSection) => {
                if (item.disabled)
                    return;
                this.setAttribute('active', item.id);
                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true, detail: { item, section },
                }));
            };
            this.itemClass = (item: Interfaces.SidebarItem): string => {
                /** @name        isActive
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isActive value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isActive = item.id === (active.Get() ?? '');

                /** @name        parts
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned parts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const parts = ['ar-sidebar__item'];
                if (isActive)
                    parts.push('ar-sidebar__item--active');
                if (item.disabled)
                    parts.push('ar-sidebar__item--disabled');
                if (item.class)
                    parts.push(item.class);
                return parts.join(' ');
            };
            this.flatSections = (): Interfaces.FlatSection[] => {
                /** @name        secs
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned secs value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const secs = this.sections$.Get();

                /** @name        open
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned open value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const open = this.openSecs$.Get();

                /** @name        q
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned q value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const q = this.query$.Get();
                return secs
                    .map((sec: any) => {
                    /** @name        matched
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned matched value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const matched = q
                        ? sec.items.filter((i: any) => i.label.toLowerCase().includes(q) ||
                            String(i.badge ?? '').toLowerCase().includes(q))
                        : sec.items;

                    /** @name        isOpen
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned isOpen value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const isOpen = open.has(sec.id) || !!q;
                    return {
                        section: sec,
                        isOpen,
                        items: matched,
                        arrowText: isOpen ? '▾' : '▸',
                    };
                })
                    .filter((fs: any) => !this.query$.Get() || fs.items.length > 0);
            };
            this.hasMatches = () => this.flatSections().length > 0;
            this.template = html `
            <div class="ar-sidebar__header"><slot name="header"></slot></div>

            <button class="ar-sidebar__toggle"
                    a-if="this.showToggleBtn()"
                    @click="this.onToggle"
                    aria-label="Toggle sidebar">{{ this.toggleIcon() }}</button>

            <div class="ar-sidebar__search-wrap" a-if="this.isSearchable() && !this.isCollapsed()">
                <input class="ar-sidebar__search"
                       type="text"
                       placeholder="Search…"
                       aria-label="Filter navigation"
                       @input="this.onSearchInput"/>
            </div>

            <div class="ar-sidebar__list">
                <div class="ar-sidebar__section" a-for="fs in this.flatSections()">
                    <button class="ar-sidebar__section-hd"
                            @click="(e) => this.onSectionClick(fs.section)">
                        <span class="ar-sidebar__sec-icon" a-if="fs.section.icon && !this.isCollapsed()">{{ fs.section.icon }}</span>
                        <span class="ar-sidebar__sec-label" a-if="!this.isCollapsed()">{{ fs.section.label }}</span>
                        <span class="ar-sidebar__sec-arrow" a-if="!this.isCollapsed()" aria-hidden="true">{{ fs.arrowText }}</span>
                    </button>
                    <div class="ar-sidebar__items" a-if="fs.isOpen">
                        <button :class="this.itemClass(item)"
                                a-for="item in fs.items"
                                :disabled="item.disabled"
                                :data-id="item.id"
                                :title="this.isCollapsed() ? item.label : ''"
                                @click="(e) => this.onItemClick(item, fs.section)">
                            <span class="ar-sidebar__item-icon" a-if="item.icon" aria-hidden="true">{{ item.icon }}</span>
                            <span class="ar-sidebar__item-label" a-if="!this.isCollapsed()">{{ item.label }}</span>
                            <span class="ar-sidebar__item-badge" a-if="item.badge !== undefined && !this.isCollapsed()">{{ item.badge }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="ar-sidebar__footer"><slot name="footer"></slot></div>

            <arianna-resizer a-if="this.isResizable()"
                             :handles="this.resizerHandles()"
                             :min-width="String(this.minW())"
                             :max-width="String(this.maxW())"
                             allow-cross="false"></arianna-resizer>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Sidebar.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Sidebar.DefaultSheet();
        }
        // ── Programmatic API (mirrors legacy) ────────────────────────────────────
        /** @name        sections
         *  @public
         *  @type        {void}
         *  @description Component member for sections.
         *  @param       {Sidebar.Interfaces.SidebarSection[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set sections(v: Interfaces.SidebarSection[])
        {
            this.sections$.Set(v ?? []);

            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const open = new Set<string>((v ?? []).filter(s => s.open !== false).map(s => s.id));
            this.openSecs$.Set(open);
        }

        /** @name        sections
         *  @public
         *  @type        {Sidebar.Interfaces.SidebarSection[]}
         *  @description Component member for sections.
         *  @returns     {Sidebar.Interfaces.SidebarSection[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get sections(): Interfaces.SidebarSection[] { return this.sections$.Get(); }

        /** @name        collapse
         *  @public
         *  @type        {this}
         *  @description Component member for collapse.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        collapse(): this { this.setAttribute('collapsed', ''); this.dispatchEvent(new CustomEvent('arianna:collapse', { bubbles: true, detail: { collapsed: true } })); return this; }

        /** @name        expand
         *  @public
         *  @type        {this}
         *  @description Component member for expand.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expand(): this { this.removeAttribute('collapsed'); this.dispatchEvent(new CustomEvent('arianna:collapse', { bubbles: true, detail: { collapsed: false } })); return this; }

        /** @name        toggle
         *  @public
         *  @type        {this}
         *  @description Component member for toggle.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggle(): this { return this.hasAttribute('collapsed') ? this.expand() : this.collapse(); }

        /** @name        setWidth
         *  @public
         *  @type        {this}
         *  @description Component member for set Width.
         *  @param       {number} w Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setWidth(w: number): this
        {
            /** @name        clamped
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clamped value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clamped = Math.max(this.minW(), Math.min(this.maxW(), w));
            this.setAttribute('width', String(clamped));
            return this;
        }

        /** @name        openSection
         *  @public
         *  @type        {this}
         *  @description Component member for open Section.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        openSection(id: string): this
        {
            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const open = new Set(this.openSecs$.Get());
            open.add(id);
            this.openSecs$.Set(open);
            return this;
        }

        /** @name        closeSection
         *  @public
         *  @type        {this}
         *  @description Component member for close Section.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        closeSection(id: string): this
        {
            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const open = new Set(this.openSecs$.Get());
            open.delete(id);
            this.openSecs$.Set(open);
            return this;
        }

        /** @name        toggleSection
         *  @public
         *  @type        {this}
         *  @description Component member for toggle Section.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggleSection(id: string): this
        {
            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const open = new Set(this.openSecs$.Get());
            if (open.has(id))
                open.delete(id);
            else
                open.add(id);
            this.openSecs$.Set(open);
            return this;
        }

        /** @name        search
         *  @public
         *  @type        {this}
         *  @description Component member for search.
         *  @param       {string} q Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        search(q: string): this
        {
            this.query$.Set(q.toLowerCase().trim());

            /** @name        input
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned input value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const input = this.querySelector<HTMLInputElement>('.ar-sidebar__search');
            if (input)
                input.value = q;
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
        onUnmount() { }
        // ── Attr getters/setters ─────────────────────────────────────────────────
        /** @name        orientation
         *  @public
         *  @type        {'left' | 'right'}
         *  @description Component member for orientation.
         *  @returns     {'left' | 'right'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get orientation(): 'left' | 'right' { return (this.getAttribute('orientation') ?? 'left') as never; }

        /** @name        orientation
         *  @public
         *  @type        {void}
         *  @description Component member for orientation.
         *  @param       {'left' | 'right'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set orientation(v: 'left' | 'right') { this.setAttribute('orientation', v); }

        /** @name        width
         *  @public
         *  @type        {number}
         *  @description Component member for width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get width(): number { return parseInt(this.getAttribute('width') ?? '260', 10); }

        /** @name        width
         *  @public
         *  @type        {void}
         *  @description Component member for width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set width(v: number) { this.setAttribute('width', String(v)); }

        /** @name        minWidth
         *  @public
         *  @type        {number}
         *  @description Component member for min Width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get minWidth(): number { return this.minW(); }

        /** @name        minWidth
         *  @public
         *  @type        {void}
         *  @description Component member for min Width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set minWidth(v: number) { this.setAttribute('min-width', String(v)); }

        /** @name        maxWidth
         *  @public
         *  @type        {number}
         *  @description Component member for max Width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get maxWidth(): number { return this.maxW(); }

        /** @name        maxWidth
         *  @public
         *  @type        {void}
         *  @description Component member for max Width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set maxWidth(v: number) { this.setAttribute('max-width', String(v)); }

        /** @name        collapsedWidth
         *  @public
         *  @type        {number}
         *  @description Component member for collapsed Width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get collapsedWidth(): number { return parseInt(this.getAttribute('collapsed-width') ?? '48', 10); }

        /** @name        collapsedWidth
         *  @public
         *  @type        {void}
         *  @description Component member for collapsed Width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set collapsedWidth(v: number) { this.setAttribute('collapsed-width', String(v)); }

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

        /** @name        collapsible
         *  @public
         *  @type        {boolean}
         *  @description Component member for collapsible.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get collapsible(): boolean { return this.getAttribute('collapsible') !== 'false'; }

        /** @name        collapsible
         *  @public
         *  @type        {void}
         *  @description Component member for collapsible.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set collapsible(v: boolean) { this.setAttribute('collapsible', v ? 'true' : 'false'); }

        /** @name        resizable
         *  @public
         *  @type        {boolean}
         *  @description Component member for resizable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get resizable(): boolean { return this.getAttribute('resizable') !== 'false'; }

        /** @name        resizable
         *  @public
         *  @type        {void}
         *  @description Component member for resizable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set resizable(v: boolean) { this.setAttribute('resizable', v ? 'true' : 'false'); }

        /** @name        searchable
         *  @public
         *  @type        {boolean}
         *  @description Component member for searchable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get searchable(): boolean { return this.getAttribute('searchable') !== 'false'; }

        /** @name        searchable
         *  @public
         *  @type        {void}
         *  @description Component member for searchable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set searchable(v: boolean) { this.setAttribute('searchable', v ? 'true' : 'false'); }

        /** @name        persist
         *  @public
         *  @type        {boolean}
         *  @description Component member for persist.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get persist(): boolean { return this.hasAttribute('persist'); }

        /** @name        persist
         *  @public
         *  @type        {void}
         *  @description Component member for persist.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set persist(v: boolean) { v ? this.setAttribute('persist', '') : this.removeAttribute('persist'); }

        /** @name        storageKey
         *  @public
         *  @type        {string}
         *  @description Component member for storage Key.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get storageKey(): string { return this.getAttribute('storage-key') ?? 'arianna-sidebar-w'; }

        /** @name        storageKey
         *  @public
         *  @type        {void}
         *  @description Component member for storage Key.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set storageKey(v: string) { this.setAttribute('storage-key', v); }

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
        // ── Template helpers (set in build) ──────────────────────────────────────
        /** @name        orient
         *  @private
         *  @type        {() => string}
         *  @description Component member for orient.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private orient: () => string = () => 'left';

        /** @name        isCollapsed
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Collapsed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isCollapsed: () => boolean = () => false;

        /** @name        isCollapsible
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Collapsible.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isCollapsible: () => boolean = () => true;

        /** @name        showToggleBtn
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Toggle Btn.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showToggleBtn: () => boolean = () => true;

        /** @name        isSearchable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Searchable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSearchable: () => boolean = () => true;

        /** @name        isResizable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Resizable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isResizable: () => boolean = () => true;

        /** @name        toggleIcon
         *  @private
         *  @type        {() => string}
         *  @description Component member for toggle Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private toggleIcon: () => string = () => '◂';

        /** @name        resizerHandles
         *  @private
         *  @type        {() => string}
         *  @description Component member for resizer Handles.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private resizerHandles: () => string = () => 'e';

        /** @name        minW
         *  @private
         *  @type        {() => number}
         *  @description Component member for min W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private minW: () => number = () => 160;

        /** @name        maxW
         *  @private
         *  @type        {() => number}
         *  @description Component member for max W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private maxW: () => number = () => 480;

        /** @name        onToggle
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Toggle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggle: () => void = () => { };

        /** @name        onSearchInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Search Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSearchInput: (e: Event) => void = () => { };

        /** @name        onSectionClick
         *  @private
         *  @type        {(sec: Sidebar.Interfaces.SidebarSection) => void}
         *  @description Component member for on Section Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSectionClick: (sec: Interfaces.SidebarSection) => void = () => { };

        /** @name        onItemClick
         *  @private
         *  @type        {(item: Sidebar.Interfaces.SidebarItem, section: Sidebar.Interfaces.SidebarSection) => void}
         *  @description Component member for on Item Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onItemClick: (item: Interfaces.SidebarItem, section: Interfaces.SidebarSection) => void = () => { };

        /** @name        itemClass
         *  @private
         *  @type        {(item: Sidebar.Interfaces.SidebarItem) => string}
         *  @description Component member for item Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemClass: (item: Interfaces.SidebarItem) => string = () => '';

        /** @name        flatSections
         *  @private
         *  @type        {() => Sidebar.Interfaces.FlatSection[]}
         *  @description Component member for flat Sections.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private flatSections: () => Interfaces.FlatSection[] = () => [];

        /** @name        hasMatches
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Matches.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasMatches: () => boolean = () => false;

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Sidebar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Sidebar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #ffffff)',
                    borderStyle: 'solid',
                    borderColor: 'var(--arianna-border, #d8d8d8)',
                    borderWidth: '0',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: '0',
                    height: '100%',
                    minWidth: '0',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'width 0.18s ease',
                }),
                new Rule(':host([orientation="left"]), :host(:not([orientation]))', { borderRightWidth: '1px' }),
                new Rule(':host([orientation="right"])', { borderLeftWidth: '1px' }),
                // Collapsed state — hide labels, badges, search, section content
                new Rule(':host([collapsed]) .ar-sidebar__search-wrap', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__item-label', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__item-badge', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__sec-label', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__sec-arrow', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__item', { justifyContent: 'center', padding: '8px 4px' }),
                // Header / footer
                new Rule('.ar-sidebar__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    flexShrink: '0',
                    padding: '12px 14px',
                }),
                new Rule('.ar-sidebar__header:empty', { display: 'none', padding: '0', border: 'none' }),
                new Rule('.ar-sidebar__footer', {
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    flexShrink: '0',
                    marginTop: 'auto',
                    padding: '10px 14px',
                }),
                new Rule('.ar-sidebar__footer:empty', { display: 'none', padding: '0', border: 'none' }),
                // Toggle
                new Rule('.ar-sidebar__toggle', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-muted, #8b949e)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.68rem',
                    padding: '5px 14px',
                    textAlign: 'right',
                    transition: 'color 0.14s ease',
                    width: '100%',
                }),
                new Rule(':host([orientation="right"]) .ar-sidebar__toggle', { textAlign: 'left' }),
                new Rule('.ar-sidebar__toggle:hover', { color: 'var(--arianna-text, #1f2328)' }),
                // Search
                new Rule('.ar-sidebar__search-wrap', { padding: '4px 10px 8px' }),
                new Rule('.ar-sidebar__search', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 5px)',
                    boxSizing: 'border-box',
                    color: 'var(--arianna-text, #1f2328)',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    padding: '6px 10px',
                    width: '100%',
                    outline: 'none',
                }),
                new Rule('.ar-sidebar__search:focus', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                // List + sections
                new Rule('.ar-sidebar__list', {
                    flex: '1',
                    overflowY: 'auto',
                    padding: '4px 8px',
                }),
                new Rule('.ar-sidebar__section', { marginBottom: '4px' }),
                new Rule('.ar-sidebar__section-hd', {
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-muted, #8b949e)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    gap: '6px',
                    padding: '6px 8px',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    width: '100%',
                    letterSpacing: '0.04em',
                }),
                new Rule('.ar-sidebar__sec-label', { flex: '1' }),
                new Rule('.ar-sidebar__sec-arrow', { fontSize: '0.8rem' }),
                // Items
                new Rule('.ar-sidebar__items', { display: 'flex', flexDirection: 'column', gap: '2px' }),
                new Rule('.ar-sidebar__item', {
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    borderRadius: 'var(--arianna-radius, 5px)',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    fontSize: '0.84rem',
                    gap: '10px',
                    padding: '7px 10px',
                    textAlign: 'left',
                    transition: 'background 0.14s ease, color 0.14s ease',
                    width: '100%',
                }),
                new Rule('.ar-sidebar__item:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-sidebar__item--active', {
                    background: 'rgba(31,111,235,0.12)',
                    color: 'var(--arianna-primary, #1f6feb)',
                    fontWeight: '600',
                }),
                new Rule('.ar-sidebar__item--disabled', { opacity: '0.45', cursor: 'not-allowed' }),
                new Rule('.ar-sidebar__item-icon', { flexShrink: '0', fontSize: '1rem', width: '18px', textAlign: 'center' }),
                new Rule('.ar-sidebar__item-label', { flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
                new Rule('.ar-sidebar__item-badge', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.66rem',
                    fontWeight: '600',
                    padding: '1px 6px',
                }),
            ]);
        }
    }
}
export default Sidebar;
