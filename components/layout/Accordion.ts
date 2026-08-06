/**
 * @module    components/layout/Accordion
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Accordion component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Accordion
 *  @public
 *  @description Namespace containing Accordion contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Accordion
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

        /** @name        AccordionIconStyle
         *  @public
         *  @type        {'chevron' | 'plus' | 'arrow' | 'none'}
         *  @description Type alias for AccordionIconStyle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AccordionIconStyle = 'chevron' | 'plus' | 'arrow' | 'none';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   AccordionItem
         *  @public
         *  @description AccordionItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AccordionItem
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title: string;

            /** @name        content
             *  @public
             *  @type        {string}
             *  @description Component member for content.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            content: string;

            /** @name        open
             *  @public
             *  @type        {boolean}
             *  @description Component member for open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            open?: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   AccordionOptions
         *  @public
         *  @description AccordionOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AccordionOptions
        {
            /** @name        items
             *  @public
             *  @type        {Accordion.Interfaces.AccordionItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items?: Interfaces.AccordionItem[];

            /** @name        multiple
             *  @public
             *  @type        {boolean}
             *  @description Component member for multiple.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            multiple?: boolean;

            /** @name        animated
             *  @public
             *  @type        {boolean}
             *  @description Component member for animated.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            animated?: boolean;

            /** @name        icon
             *  @public
             *  @type        {Accordion.Types.AccordionIconStyle}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: Types.AccordionIconStyle;

            /** @name        borderless
             *  @public
             *  @type        {boolean}
             *  @description Component member for borderless.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            borderless?: boolean;

            /** @name        resizable
             *  @public
             *  @type        {boolean}
             *  @description Component member for resizable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            resizable?: boolean;
        }

        /** @interface   PanelView
         *  @public
         *  @description PanelView contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PanelView
        {
            /** @name        item
             *  @public
             *  @type        {Accordion.Interfaces.AccordionItem}
             *  @description Component member for item.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            item: Interfaces.AccordionItem;

            /** @name        isOpen
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isOpen: boolean;

            /** @name        headerCls
             *  @public
             *  @type        {string}
             *  @description Component member for header Cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            headerCls: string;

            /** @name        bodyCls
             *  @public
             *  @type        {string}
             *  @description Component member for body Cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bodyCls: string;
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

    /** @name        TRANSITION
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned TRANSITION value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const TRANSITION = 'cubic-bezier(0.4, 0, 0.2, 1)';

    /** @name        DURATION
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned DURATION value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DURATION = 320; // ms
    /** @class       Accordion
     *  @public
     *  @description AriannA Accordion component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-accordion', {}, {
        Attributes: ['multiple', 'animated', 'icon', 'borderless', 'resizable', 'min-width', 'max-width'],
    })
    export class Accordion extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        items$
         *  @public
         *  @type        {Accordion.Types.Signal<Accordion.Interfaces.AccordionItem[]>}
         *  @description Component member for items$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        items$: Types.Signal<Interfaces.AccordionItem[]> = signal<Interfaces.AccordionItem[]>([]);

        /** @name        openIds$
         *  @public
         *  @type        {Accordion.Types.Signal<Set<string>>}
         *  @description Component member for open Ids$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        openIds$: Types.Signal<Set<string>> = signal<Set<string>>(new Set());

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Accordion.Interfaces.AccordionOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.AccordionOptions = {})
        {
            /** @name        icon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned icon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const icon = this.signal().attribute('icon');
            this.isMultiple = () => this.hasAttribute('multiple');
            this.isAnimated = () => this.getAttribute('animated') !== 'false';
            this.isResizable = () => this.hasAttribute('resizable');
            this.iconStyle = () => (icon.Get() ?? 'chevron') as Types.AccordionIconStyle;
            this.minW = () => parseInt(this.getAttribute('min-width') ?? '180', 10) || 180;
            this.maxW = () => parseInt(this.getAttribute('max-width') ?? '900', 10) || 900;
            this.resizerHandles = () => 'e';
            this.panels = (): Interfaces.PanelView[] => {
                /** @name        open
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned open value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const open = this.openIds$.Get();
                return this.items$.Get().map((item: any) => {
                    /** @name        isOpen
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned isOpen value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const isOpen = open.has(item.id);
                    return {
                        item,
                        isOpen,
                        headerCls: 'ar-accordion__header'
                            + (isOpen ? ' ar-accordion__header--open' : '')
                            + (item.disabled ? ' ar-accordion__header--disabled' : ''),
                        bodyCls: 'ar-accordion__body'
                            + (isOpen ? ' ar-accordion__body--open' : ''),
                    };
                });
            };
            this.iconHtml = (isOpen: boolean): string => {
                /** @name        style
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned style value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const style = this.iconStyle();
                switch (style)
                {
                    case 'chevron':
                        return `<span class="ar-accordion__icon ar-accordion__icon--chevron" style="transform:rotate(${isOpen ? 90 : 0}deg)">›</span>`;
                    case 'arrow':
                        return `<span class="ar-accordion__icon ar-accordion__icon--arrow" style="transform:rotate(${isOpen ? 90 : 0}deg)">→</span>`;
                    case 'plus':
                        return `<span class="ar-accordion__icon ar-accordion__icon--plus">${isOpen ? '−' : '+'}</span>`;
                    case 'none':
                    default:
                        return '';
                }
            };
            this.onHeaderClick = (item: Interfaces.AccordionItem) => {
                if (item.disabled)
                    return;
                this.toggle(item.id);
            };
            this.template = html `
            <div class="ar-accordion__panel" a-for="p in this.panels()" :data-id="p.item.id">
                <button :class="p.headerCls"
                        :disabled="p.item.disabled"
                        :aria-expanded="String(p.isOpen)"
                        @click="(e) => this.onHeaderClick(p.item)">
                    <span class="ar-accordion__title" a-html="p.item.title"></span>
                    <span a-html="this.iconHtml(p.isOpen)"></span>
                </button>
                <div :class="p.bodyCls" role="region">
                    <div class="ar-accordion__content" a-html="p.item.content"></div>
                </div>
            </div>

            <arianna-resizer a-if="this.isResizable()"
                             :handles="this.resizerHandles()"
                             :min-width="String(this.minW())"
                             :max-width="String(this.maxW())"
                             allow-cross="false"></arianna-resizer>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Accordion.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Accordion.DefaultSheet();
        }
        // ── Public API (preserves legacy fluent surface) ─────────────────────────
        /** @name        items
         *  @public
         *  @type        {void}
         *  @description Component member for items.
         *  @param       {Accordion.Interfaces.AccordionItem[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set items(v: Interfaces.AccordionItem[])
        {
            /** @name        fullItems
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned fullItems value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const fullItems = v.map(i => ({ open: false, disabled: false, ...i }));
            this.items$.Set(fullItems);
            // Build initial open set from items[].open
            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let open = new Set<string>(fullItems.filter(i => i.open && !i.disabled).map(i => i.id));
            // Enforce single mode
            if (!this.isMultiple() && open.size > 1)
            {
                /** @name        first
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned first value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const first = [...open][0];
                open = new Set([first]);
            }
            this.openIds$.Set(open);
        }

        /** @name        items
         *  @public
         *  @type        {Accordion.Interfaces.AccordionItem[]}
         *  @description Component member for items.
         *  @returns     {Accordion.Interfaces.AccordionItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get items(): Interfaces.AccordionItem[] { return this.items$.Get(); }

        /** @name        open
         *  @public
         *  @type        {this}
         *  @description Component member for open.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        open(id: string): this
        {
            /** @name        item
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned item value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const item = this.items$.Get().find((i: any) => i.id === id);
            if (!item || item.disabled || this.openIds$.Get().has(id))
                return this;

            /** @name        newOpen
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned newOpen value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newOpen = this.isMultiple() ? new Set(this.openIds$.Get()) : new Set<string>();
            newOpen.add(id);
            this.openIds$.Set(newOpen);
            this.#animateOpen(id);
            this.dispatchEvent(new CustomEvent('arianna:open', {
                bubbles: true, detail: { id, item },
            }));
            return this;
        }

        /** @name        close
         *  @public
         *  @type        {this}
         *  @description Component member for close.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        close(id: string): this
        {
            /** @name        item
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned item value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const item = this.items$.Get().find((i: any) => i.id === id);
            if (!item || item.disabled || !this.openIds$.Get().has(id))
                return this;
            // Snapshot pixel height BEFORE removing from open set so the CSS
            // transition has a defined "from" value rather than "auto" → 0.
            this.#animateClose(id);

            /** @name        newOpen
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned newOpen value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newOpen = new Set(this.openIds$.Get());
            newOpen.delete(id);
            this.openIds$.Set(newOpen);
            this.dispatchEvent(new CustomEvent('arianna:close', {
                bubbles: true, detail: { id, item },
            }));
            return this;
        }

        /** @name        toggle
         *  @public
         *  @type        {this}
         *  @description Component member for toggle.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggle(id: string): this
        {
            /** @name        wasOpen
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wasOpen value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wasOpen = this.openIds$.Get().has(id);

            /** @name        result
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned result value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const result = wasOpen ? this.close(id) : this.open(id);

            /** @name        item
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned item value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const item = this.items$.Get().find((i: any) => i.id === id);
            this.dispatchEvent(new CustomEvent('arianna:toggle', {
                bubbles: true, detail: { id, item, open: !wasOpen },
            }));
            return result;
        }

        /** @name        openAll
         *  @public
         *  @type        {this}
         *  @description Component member for open All.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        openAll(): this
        {
            /** @name        all
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned all value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const all = new Set<string>(this.items$.Get().filter((i: any) => !i.disabled).map((i: any) => i.id));
            this.openIds$.Set(all);
            return this;
        }

        /** @name        closeAll
         *  @public
         *  @type        {this}
         *  @description Component member for close All.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        closeAll(): this
        {
            this.openIds$.Set(new Set());
            return this;
        }

        /** @name        isOpen
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Open.
         *  @param       {string} id Parameter.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        isOpen(id: string): boolean { return this.openIds$.Get().has(id); }

        /** @name        openItems
         *  @public
         *  @type        {string[]}
         *  @description Component member for open Items.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        openItems(): string[] { return [...this.openIds$.Get()]; }

        /** @name        addItem
         *  @public
         *  @type        {this}
         *  @description Component member for add Item.
         *  @param       {Accordion.Interfaces.AccordionItem} item Parameter.
         *  @param       {number} index Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addItem(item: Interfaces.AccordionItem, index?: number): this
        {
            /** @name        full
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned full value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const full = { open: false, disabled: false, ...item };

            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = [...this.items$.Get()];
            if (index !== undefined && index >= 0 && index < items.length)
            {
                items.splice(index, 0, full);
            }
            else
            {
                items.push(full);
            }
            this.items$.Set(items);
            if (full.open && !full.disabled)
            {
                /** @name        open
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned open value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const open = this.isMultiple() ? new Set(this.openIds$.Get()) : new Set<string>();
                open.add(full.id);
                this.openIds$.Set(open);
            }
            this.dispatchEvent(new CustomEvent('arianna:add', {
                bubbles: true, detail: { id: item.id, item: full },
            }));
            return this;
        }

        /** @name        removeItem
         *  @public
         *  @type        {this}
         *  @description Component member for remove Item.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeItem(id: string): this
        {
            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = this.items$.Get().filter((i: any) => i.id !== id);
            this.items$.Set(items);

            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const open = new Set(this.openIds$.Get());
            open.delete(id);
            this.openIds$.Set(open);
            this.dispatchEvent(new CustomEvent('arianna:remove', {
                bubbles: true, detail: { id },
            }));
            return this;
        }

        /** @name        setContent
         *  @public
         *  @type        {this}
         *  @description Component member for set Content.
         *  @param       {string} id Parameter.
         *  @param       {string} contentHtml Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setContent(id: string, contentHtml: string): this
        {
            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = this.items$.Get().map((i: any) => i.id === id ? { ...i, content: contentHtml } : i);
            this.items$.Set(items);
            return this;
        }

        /** @name        setTitle
         *  @public
         *  @type        {this}
         *  @description Component member for set Title.
         *  @param       {string} id Parameter.
         *  @param       {string} titleHtml Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setTitle(id: string, titleHtml: string): this
        {
            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = this.items$.Get().map((i: any) => i.id === id ? { ...i, title: titleHtml } : i);
            this.items$.Set(items);
            return this;
        }

        /** @name        enable
         *  @public
         *  @type        {this}
         *  @description Component member for enable.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        enable(id: string): this
        {
            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = this.items$.Get().map((i: any) => i.id === id ? { ...i, disabled: false } : i);
            this.items$.Set(items);
            return this;
        }

        /** @name        disable
         *  @public
         *  @type        {this}
         *  @description Component member for disable.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        disable(id: string): this
        {
            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = this.items$.Get().map((i: any) => i.id === id ? { ...i, disabled: true } : i);
            this.items$.Set(items);

            /** @name        open
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned open value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const open = new Set(this.openIds$.Get());
            open.delete(id);
            this.openIds$.Set(open);
            return this;
        }
        // ── Animation engine ─────────────────────────────────────────────────────
        /**
         * Open animation: 0 → measured height → 'none'.
         *
         * The signal-driven template re-renders the body with the `--open` class
         * on the next microtask; we wait one rAF so layout has flushed, measure
         * scrollHeight, set max-height to that exact value, then on transitionend
         * remove the inline max-height so dynamic content can later grow.
         */
        #animateOpen(id: string): void
        {
            if (!this.isAnimated())
                return;
            // Wait for template patch
            requestAnimationFrame(() => {
                /** @name        body
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned body value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const body = this.querySelector<HTMLElement>(`.ar-accordion__panel[data-id="${id}"] > .ar-accordion__body`);
                if (!body)
                    return;

                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = body.scrollHeight;
                body.style.maxHeight = '0px';
                // force reflow
                void body.offsetHeight;
                body.style.maxHeight = target + 'px';

                /** @name        onEnd
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onEnd value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onEnd = (e: TransitionEvent) => {
                    if (e.propertyName !== 'max-height')
                        return;
                    body.style.maxHeight = 'none';
                    body.removeEventListener('transitionend', onEnd);
                };
                body.addEventListener('transitionend', onEnd);
            });
        }

        /**
         * Close animation: 'none' → snapshot px → 0.
         *
         * We must capture scrollHeight BEFORE the state flips to closed (because
         * after the flip the body has `max-height:0` from CSS and the template
         * re-render). We do it synchronously before the state flip in `close()`.
         */
        #animateClose(id: string): void
        {
            if (!this.isAnimated())
                return;

            /** @name        body
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned body value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const body = this.querySelector<HTMLElement>(`.ar-accordion__panel[data-id="${id}"] > .ar-accordion__body`);
            if (!body)
                return;

            /** @name        current
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned current value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const current = body.scrollHeight;
            body.style.maxHeight = current + 'px';
            // force reflow before signal-driven re-render kicks in
            void body.offsetHeight;
            // Next frame: the template patch may have replaced the body node;
            // re-query and animate down.
            requestAnimationFrame(() => {
                /** @name        b
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned b value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const b = this.querySelector<HTMLElement>(`.ar-accordion__panel[data-id="${id}"] > .ar-accordion__body`);
                if (!b)
                    return;
                b.style.maxHeight = current + 'px';
                void b.offsetHeight;
                b.style.maxHeight = '0px';

                /** @name        onEnd
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onEnd value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onEnd = (e: TransitionEvent) => {
                    if (e.propertyName !== 'max-height')
                        return;
                    b.style.maxHeight = '';
                    b.removeEventListener('transitionend', onEnd);
                };
                b.addEventListener('transitionend', onEnd);
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
        /** @name        multiple
         *  @public
         *  @type        {boolean}
         *  @description Component member for multiple.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get multiple(): boolean { return this.hasAttribute('multiple'); }

        /** @name        multiple
         *  @public
         *  @type        {void}
         *  @description Component member for multiple.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set multiple(v: boolean) { v ? this.setAttribute('multiple', '') : this.removeAttribute('multiple'); }

        /** @name        animated
         *  @public
         *  @type        {boolean}
         *  @description Component member for animated.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get animated(): boolean { return this.getAttribute('animated') !== 'false'; }

        /** @name        animated
         *  @public
         *  @type        {void}
         *  @description Component member for animated.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set animated(v: boolean) { this.setAttribute('animated', v ? 'true' : 'false'); }

        /** @name        icon
         *  @public
         *  @type        {Accordion.Types.AccordionIconStyle}
         *  @description Component member for icon.
         *  @returns     {Accordion.Types.AccordionIconStyle} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get icon(): Types.AccordionIconStyle { return (this.getAttribute('icon') ?? 'chevron') as Types.AccordionIconStyle; }

        /** @name        icon
         *  @public
         *  @type        {void}
         *  @description Component member for icon.
         *  @param       {Accordion.Types.AccordionIconStyle} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set icon(v: Types.AccordionIconStyle) { this.setAttribute('icon', v); }

        /** @name        borderless
         *  @public
         *  @type        {boolean}
         *  @description Component member for borderless.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get borderless(): boolean { return this.hasAttribute('borderless'); }

        /** @name        borderless
         *  @public
         *  @type        {void}
         *  @description Component member for borderless.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set borderless(v: boolean) { v ? this.setAttribute('borderless', '') : this.removeAttribute('borderless'); }

        /** @name        resizable
         *  @public
         *  @type        {boolean}
         *  @description Component member for resizable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get resizable(): boolean { return this.hasAttribute('resizable'); }

        /** @name        resizable
         *  @public
         *  @type        {void}
         *  @description Component member for resizable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set resizable(v: boolean) { v ? this.setAttribute('resizable', '') : this.removeAttribute('resizable'); }
        // ── Template helpers (set in build) ──────────────────────────────────────
        /** @name        isMultiple
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Multiple.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isMultiple: () => boolean = () => false;

        /** @name        isAnimated
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Animated.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isAnimated: () => boolean = () => true;

        /** @name        isResizable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Resizable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isResizable: () => boolean = () => false;

        /** @name        iconStyle
         *  @private
         *  @type        {() => Accordion.Types.AccordionIconStyle}
         *  @description Component member for icon Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconStyle: () => Types.AccordionIconStyle = () => 'chevron';

        /** @name        minW
         *  @private
         *  @type        {() => number}
         *  @description Component member for min W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private minW: () => number = () => 180;

        /** @name        maxW
         *  @private
         *  @type        {() => number}
         *  @description Component member for max W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private maxW: () => number = () => 900;

        /** @name        resizerHandles
         *  @private
         *  @type        {() => string}
         *  @description Component member for resizer Handles.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private resizerHandles: () => string = () => 'e';

        /** @name        panels
         *  @private
         *  @type        {() => Accordion.Interfaces.PanelView[]}
         *  @description Component member for panels.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private panels: () => Interfaces.PanelView[] = () => [];

        /** @name        iconHtml
         *  @private
         *  @type        {(isOpen: boolean) => string}
         *  @description Component member for icon Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconHtml: (isOpen: boolean) => string = () => '';

        /** @name        onHeaderClick
         *  @private
         *  @type        {(item: Accordion.Interfaces.AccordionItem) => void}
         *  @description Component member for on Header Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHeaderClick: (item: Interfaces.AccordionItem) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Accordion.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Accordion.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    position: 'relative',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-accordion__panel', {
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    overflow: 'hidden',
                    marginBottom: '4px',
                    background: 'var(--arianna-bg, #ffffff)',
                }),
                new Rule(':host([borderless]) .ar-accordion__panel', { border: 'none', borderRadius: '0' }),
                new Rule('.ar-accordion__header', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    gap: '8px',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    textAlign: 'left',
                    transition: `background 0.2s ${TRANSITION}`,
                    width: '100%',
                }),
                new Rule('.ar-accordion__header:hover:not(.ar-accordion__header--disabled)', {
                    background: 'var(--arianna-bg-4, #ebebeb)',
                }),
                new Rule('.ar-accordion__header--disabled', {
                    cursor: 'not-allowed', opacity: '0.5',
                }),
                new Rule('.ar-accordion__title', { flex: '1' }),
                // Icon — smooth rotation / cross-fade
                new Rule('.ar-accordion__icon', {
                    color: 'var(--arianna-muted, #8b949e)',
                    display: 'inline-block',
                    fontSize: '0.9em',
                    lineHeight: '1',
                    transition: `transform 0.28s ${TRANSITION}`,
                }),
                new Rule('.ar-accordion__icon--plus', { fontSize: '1.1em', fontWeight: '400' }),
                // Body — the heart of the animation
                new Rule('.ar-accordion__body', {
                    maxHeight: '0',
                    overflow: 'hidden',
                    background: 'var(--arianna-bg, #ffffff)',
                    // Animate max-height (set in JS) + opacity + small Y nudge
                    transition: `max-height ${DURATION}ms ${TRANSITION},`
                        + ` opacity ${DURATION}ms ${TRANSITION},`
                        + ` transform ${DURATION}ms ${TRANSITION}`,
                    opacity: '0',
                    transform: 'translateY(-2px)',
                }),
                new Rule('.ar-accordion__body--open', {
                    opacity: '1',
                    transform: 'translateY(0)',
                    // max-height set inline via JS during animation, then 'none'
                }),
                new Rule('.ar-accordion__content', {
                    padding: '14px 16px',
                    lineHeight: '1.5',
                }),
                // Reduced motion accessibility
                new Rule('@media (prefers-reduced-motion: reduce)', {
                    '.ar-accordion__body, .ar-accordion__icon, .ar-accordion__header': {
                        transition: 'none',
                    },
                } as never),
            ]);
        }
    }
}
export default Accordion;

export type AccordionItem = Accordion.Interfaces.AccordionItem;
export type AccordionOptions = Accordion.Interfaces.AccordionOptions;
export type AccordionIconStyle = Accordion.Types.AccordionIconStyle;
