/**
 * @module    components/layout/Dock
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Dock component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Dock
 *  @public
 *  @description Namespace containing Dock contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Dock
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

        /** @name        DockStyle
         *  @public
         *  @type        {'macos' | 'windows'}
         *  @description Type alias for DockStyle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type DockStyle = 'macos' | 'windows';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   DockItem
         *  @public
         *  @description DockItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DockItem
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
            icon: string; // emoji, inline SVG, image URL, or text
            /** @name        running
             *  @public
             *  @type        {boolean}
             *  @description Component member for running.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            running?: boolean;

            /** @name        active
             *  @public
             *  @type        {boolean}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active?: boolean;

            /** @name        badge
             *  @public
             *  @type        {number}
             *  @description Component member for badge.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            badge?: number;

            /** @name        separator
             *  @public
             *  @type        {boolean}
             *  @description Component member for separator.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            separator?: boolean;

            /** @name        meta
             *  @public
             *  @type        {unknown}
             *  @description Component member for meta.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            meta?: unknown;
        }

        /** @interface   DockOptions
         *  @public
         *  @description DockOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DockOptions
        {
            /** @name        style
             *  @public
             *  @type        {Dock.Types.DockStyle}
             *  @description Component member for style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style?: Types.DockStyle;

            /** @name        items
             *  @public
             *  @type        {Dock.Interfaces.DockItem[]}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items?: Interfaces.DockItem[];

            /** @name        magnify
             *  @public
             *  @type        {number}
             *  @description Component member for magnify.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            magnify?: number;

            /** @name        position
             *  @public
             *  @type        {'bottom' | 'left' | 'right'}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position?: 'bottom' | 'left' | 'right';

            /** @name        startLabel
             *  @public
             *  @type        {string}
             *  @description Component member for start Label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            startLabel?: string;

            /** @name        tray
             *  @public
             *  @type        {Dock.Interfaces.DockItem[]}
             *  @description Component member for tray.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            tray?: Interfaces.DockItem[];
        }

        /** @interface   RenderedIcon
         *  @public
         *  @description RenderedIcon contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RenderedIcon
        {
            /** @name        type
             *  @public
             *  @type        {'svg' | 'img' | 'text'}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type: 'svg' | 'img' | 'text';

            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value: string;
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
    export function classifyIcon(icon: string): Interfaces.RenderedIcon {
        /** @name        trim
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned trim value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const trim = icon.trim();
        if (trim.startsWith('<svg'))
            return { type: 'svg', value: trim };
        if (trim.startsWith('http') || trim.startsWith('/') || trim.startsWith('data:'))
        {
            return { type: 'img', value: trim };
        }
        return { type: 'text', value: trim };
    }

    /** @name        ClassifyIcon
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ClassifyIcon value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ClassifyIcon
    (
        ...args: Parameters<typeof classifyIcon>
    ): ReturnType<typeof classifyIcon>
    {
        return classifyIcon(...args);
    }
    /** @class       Dock
     *  @public
     *  @description AriannA Dock component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-dock', {}, {
        Attributes: ['variant', 'magnify', 'position', 'start-label'],
    })
    export class Dock extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        items$
         *  @public
         *  @type        {Dock.Types.Signal<Dock.Interfaces.DockItem[]>}
         *  @description Component member for items$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        items$: Types.Signal<Interfaces.DockItem[]> = signal<Interfaces.DockItem[]>([]);

        /** @name        tray$
         *  @public
         *  @type        {Dock.Types.Signal<Dock.Interfaces.DockItem[]>}
         *  @description Component member for tray$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        tray$: Types.Signal<Interfaces.DockItem[]> = signal<Interfaces.DockItem[]>([]);

        /** @name        clock$
         *  @public
         *  @type        {Dock.Types.Signal<{
            time: string;
            date: string;
        }>}
         *  @description Component member for clock$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clock$: Types.Signal<{
            /** @name        time
             *  @public
             *  @type        {string}
             *  @description Component member for time.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            time: string;

            /** @name        date
             *  @public
             *  @type        {string}
             *  @description Component member for date.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            date: string;
        }> = signal({ time: '', date: '' });

        /** @name        #clockInterval
         *  @public
         *  @type        {unknown}
         *  @description Component member for clock Interval.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #clockInterval = 0;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Dock.Interfaces.DockOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.DockOptions = {})
        {
            /** @name        styleAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned styleAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const styleAttr = this.signal().attribute('variant');

            /** @name        startLabel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned startLabel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const startLabel = this.signal().attribute('start-label');
            this.dockStyle = () => (styleAttr.Get() ?? 'macos') as Types.DockStyle;
            this.isMacOS = () => this.dockStyle() === 'macos';
            this.isWindows = () => this.dockStyle() === 'windows';
            this.startBtnLabel = () => startLabel.Get() ?? '';
            this.allItems = () => this.items$.Get();
            this.trayItems = () => this.tray$.Get();
            this.iconCls = (icon: string) => {
                /** @name        k
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned k value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const k = classifyIcon(icon);
                return k.type === 'svg' ? 'ar-dock__icon ar-dock__icon--svg'
                    : k.type === 'img' ? 'ar-dock__icon ar-dock__icon--img'
                        : 'ar-dock__icon ar-dock__icon--emoji';
            };
            this.iconHtml = (icon: string) => {
                /** @name        k
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned k value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const k = classifyIcon(icon);
                if (k.type === 'svg')
                    return k.value;
                if (k.type === 'img')
                    return `<img src="${k.value}" alt="" draggable="false">`;
                return `<span class="ar-dock__emoji">${k.value}</span>`;
            };
            this.itemCls = (it: Interfaces.DockItem, tray: boolean = false) => {
                /** @name        parts
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned parts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const parts = ['ar-dock__item'];
                if (it.active)
                    parts.push('ar-dock__item--active');
                if (it.running)
                    parts.push('ar-dock__item--running');
                if (tray)
                    parts.push('ar-dock__item--tray');
                return parts.join(' ');
            };
            this.hasBadge = (it: Interfaces.DockItem) => typeof it.badge === 'number' && it.badge > 0;
            this.badgeText = (it: Interfaces.DockItem) => (it.badge ?? 0) > 99 ? '99+' : String(it.badge ?? 0);
            this.isSeparator = (it: Interfaces.DockItem) => !!it.separator;
            this.notSeparator = (it: Interfaces.DockItem) => !it.separator;
            this.onItemClick = (it: Interfaces.DockItem, e: Event) => {
                this.dispatchEvent(new CustomEvent('arianna:item-click', {
                    bubbles: true, detail: { id: it.id, item: { ...it } },
                }));
                // Defensive: prevent event from being caught by other handlers
                e.stopPropagation();
            };
            this.onTrayClick = (it: Interfaces.DockItem, e: Event) => {
                this.dispatchEvent(new CustomEvent('arianna:tray-click', {
                    bubbles: true, detail: { id: it.id, item: { ...it } },
                }));
                e.stopPropagation();
            };
            this.onItemContext = (it: Interfaces.DockItem, e: Event) => {
                e.preventDefault();

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;
                this.dispatchEvent(new CustomEvent('arianna:item-context', {
                    bubbles: true,
                    detail: { id: it.id, item: { ...it }, x: me.clientX, y: me.clientY },
                }));
            };
            this.onStart = () => {
                this.dispatchEvent(new CustomEvent('arianna:start', {
                    bubbles: true, detail: {},
                }));
            };
            this.onPointerMove = (e: Event) => {
                if (!this.isMacOS())
                    return;
                this.#magnify(e as PointerEvent);
            };
            this.onPointerLeave = () => {
                if (!this.isMacOS())
                    return;
                this.#unmagnify();
            };
            this.clockTime = () => this.clock$.Get().time;
            this.clockDate = () => this.clock$.Get().date;
            this.template = html `
            <!-- macOS layout -->
            <div class="ar-dock__track ar-dock__track--macos"
                 a-if="this.isMacOS()"
                 @pointermove="this.onPointerMove"
                 @pointerleave="this.onPointerLeave">
                <div class="ar-dock__sep" a-for="it in this.allItems()" a-if="this.isSeparator(it)"></div>
                <button :class="this.itemCls(it)"
                        a-for="it in this.allItems()"
                        a-if="this.notSeparator(it)"
                        :title="it.label"
                        :aria-label="it.label"
                        @click="(e) => this.onItemClick(it, e)"
                        @contextmenu="(e) => this.onItemContext(it, e)">
                    <span :class="this.iconCls(it.icon)" a-html="this.iconHtml(it.icon)"></span>
                    <span class="ar-dock__badge" a-if="this.hasBadge(it)">{{ this.badgeText(it) }}</span>
                    <span class="ar-dock__dot" aria-hidden="true"></span>
                    <span class="ar-dock__tooltip">{{ it.label }}</span>
                </button>
            </div>

            <!-- Windows layout -->
            <button class="ar-dock__start"
                    a-if="this.isWindows()"
                    @click="this.onStart"
                    aria-label="Start"
                    title="Start">
                <span class="ar-dock__start-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3"  y="3"  width="8" height="8"/>
                        <rect x="13" y="3"  width="8" height="8"/>
                        <rect x="3"  y="13" width="8" height="8"/>
                        <rect x="13" y="13" width="8" height="8"/>
                    </svg>
                </span>
                <span class="ar-dock__start-label" a-if="this.startBtnLabel()">{{ this.startBtnLabel() }}</span>
            </button>
            <div class="ar-dock__track ar-dock__track--windows" a-if="this.isWindows()">
                <button :class="this.itemCls(it)"
                        a-for="it in this.allItems()"
                        a-if="this.notSeparator(it)"
                        :title="it.label"
                        :aria-label="it.label"
                        @click="(e) => this.onItemClick(it, e)"
                        @contextmenu="(e) => this.onItemContext(it, e)">
                    <span :class="this.iconCls(it.icon)" a-html="this.iconHtml(it.icon)"></span>
                    <span class="ar-dock__badge" a-if="this.hasBadge(it)">{{ this.badgeText(it) }}</span>
                    <span class="ar-dock__dot" aria-hidden="true"></span>
                </button>
            </div>
            <div class="ar-dock__tray" a-if="this.isWindows()">
                <button :class="this.itemCls(it, true)"
                        a-for="it in this.trayItems()"
                        :title="it.label"
                        :aria-label="it.label"
                        @click="(e) => this.onTrayClick(it, e)">
                    <span :class="this.iconCls(it.icon)" a-html="this.iconHtml(it.icon)"></span>
                </button>
                <div class="ar-dock__clock">
                    <div class="ar-dock__time">{{ this.clockTime() }}</div>
                    <div class="ar-dock__date">{{ this.clockDate() }}</div>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Dock.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Dock.DefaultSheet();
        }

        /** @name        items
         *  @public
         *  @type        {void}
         *  @description Component member for items.
         *  @param       {Dock.Interfaces.DockItem[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set items(v: Interfaces.DockItem[]) { this.items$.Set(v ?? []); }

        /** @name        items
         *  @public
         *  @type        {Dock.Interfaces.DockItem[]}
         *  @description Component member for items.
         *  @returns     {Dock.Interfaces.DockItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get items(): Interfaces.DockItem[] { return this.items$.Get(); }

        /** @name        tray
         *  @public
         *  @type        {void}
         *  @description Component member for tray.
         *  @param       {Dock.Interfaces.DockItem[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set tray(v: Interfaces.DockItem[]) { this.tray$.Set(v ?? []); }

        /** @name        tray
         *  @public
         *  @type        {Dock.Interfaces.DockItem[]}
         *  @description Component member for tray.
         *  @returns     {Dock.Interfaces.DockItem[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get tray(): Interfaces.DockItem[] { return this.tray$.Get(); }

        /** @name        addItem
         *  @public
         *  @type        {this}
         *  @description Component member for add Item.
         *  @param       {Dock.Interfaces.DockItem} item Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addItem(item: Interfaces.DockItem): this { this.items$.Set([...this.items$.Get(), item]); return this; }

        /** @name        removeItem
         *  @public
         *  @type        {this}
         *  @description Component member for remove Item.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeItem(id: string): this { this.items$.Set(this.items$.Get().filter((i: any) => i.id !== id)); return this; }

        /** @name        updateItem
         *  @public
         *  @type        {this}
         *  @description Component member for update Item.
         *  @param       {string} id Parameter.
         *  @param       {Partial<Dock.Interfaces.DockItem>} patch Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        updateItem(id: string, patch: Partial<Interfaces.DockItem>): this
        {
            this.items$.Set(this.items$.Get().map((i: any) => i.id === id ? { ...i, ...patch } : i));
            return this;
        }

        /** @name        clearItems
         *  @public
         *  @type        {this}
         *  @description Component member for clear Items.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clearItems(): this { this.items$.Set([]); return this; }

        /** @name        setRunning
         *  @public
         *  @type        {this}
         *  @description Component member for set Running.
         *  @param       {string} id Parameter.
         *  @param       {boolean} on Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setRunning(id: string, on: boolean): this { return this.updateItem(id, { running: on }); }

        /** @name        setBadge
         *  @public
         *  @type        {this}
         *  @description Component member for set Badge.
         *  @param       {string} id Parameter.
         *  @param       {number} n Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setBadge(id: string, n: number): this { return this.updateItem(id, { badge: n > 0 ? n : undefined }); }

        /** @name        setActive
         *  @public
         *  @type        {this}
         *  @description Component member for set Active.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setActive(id: string): this
        {
            this.items$.Set(this.items$.Get().map((i: any) => ({ ...i, active: i.id === id })));
            return this;
        }

        /** @name        #magnify
         *  @public
         *  @type        {void}
         *  @description Component member for magnify.
         *  @param       {PointerEvent} e Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #magnify(e: PointerEvent): void
        {
            /** @name        track
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned track value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const track = this.querySelector<HTMLElement>('.ar-dock__track--macos');
            if (!track)
                return;

            /** @name        factor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned factor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const factor = parseFloat(this.getAttribute('magnify') ?? '1.6') || 1.6;
            if (factor <= 1)
                return;

            /** @name        rect
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rect value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rect = track.getBoundingClientRect();

            /** @name        x
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned x value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const x = e.clientX - rect.left;

            /** @name        items
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned items value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const items = track.querySelectorAll<HTMLElement>('.ar-dock__item');

            /** @name        radius
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned radius value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const radius = 80;
            items.forEach(it => {
                /** @name        ir
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ir value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ir = it.getBoundingClientRect();

                /** @name        center
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned center value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const center = ir.left - rect.left + ir.width / 2;

                /** @name        dist
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dist value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dist = Math.abs(x - center);

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = Math.max(0, 1 - dist / radius);

                /** @name        scale
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned scale value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const scale = 1 + (factor - 1) * t;
                it.style.transform = `scale(${scale.toFixed(3)})`;
            });
        }

        /** @name        #unmagnify
         *  @public
         *  @type        {void}
         *  @description Component member for unmagnify.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #unmagnify(): void
        {
            /** @name        track
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned track value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const track = this.querySelector<HTMLElement>('.ar-dock__track--macos');
            if (!track)
                return;
            track.querySelectorAll<HTMLElement>('.ar-dock__item').forEach(it => {
                it.style.transform = '';
            });
        }

        /** @name        #startClock
         *  @public
         *  @type        {void}
         *  @description Component member for start Clock.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #startClock(): void
        {
            /** @name        tick
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tick value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tick = () => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = new Date();
                this.clock$.Set({
                    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                    date: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' }),
                });
            };
            tick();
            this.#clockInterval = window.setInterval(tick, 60000);
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
            // Start clock if windows style — restart on style change
            if (this.dockStyle() === 'windows')
                this.#startClock();
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
            // If style changed to windows and clock wasn't running, start it
            if (this.dockStyle() === 'windows' && this.#clockInterval === 0)
                this.#startClock();
            if (this.dockStyle() !== 'windows' && this.#clockInterval !== 0)
            {
                clearInterval(this.#clockInterval);
                this.#clockInterval = 0;
            }
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
        onUnmount()
        {
            if (this.#clockInterval !== 0)
            {
                clearInterval(this.#clockInterval);
                this.#clockInterval = 0;
            }
        }
        // ── Attr getters / setters ───────────────────────────────────────────────
        /** @name        variant
         *  @public
         *  @type        {Dock.Types.DockStyle}
         *  @description Component member for variant.
         *  @returns     {Dock.Types.DockStyle} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): Types.DockStyle { return (this.getAttribute('variant') ?? 'macos') as Types.DockStyle; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {Dock.Types.DockStyle} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: Types.DockStyle) { this.setAttribute('variant', v); }

        /** @name        magnify
         *  @public
         *  @type        {number}
         *  @description Component member for magnify.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get magnify(): number { return parseFloat(this.getAttribute('magnify') ?? '1.6'); }

        /** @name        magnify
         *  @public
         *  @type        {void}
         *  @description Component member for magnify.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set magnify(v: number) { this.setAttribute('magnify', String(v)); }

        /** @name        position
         *  @public
         *  @type        {'bottom' | 'left' | 'right'}
         *  @description Component member for position.
         *  @returns     {'bottom' | 'left' | 'right'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get position(): 'bottom' | 'left' | 'right' { return (this.getAttribute('position') ?? 'bottom') as never; }

        /** @name        position
         *  @public
         *  @type        {void}
         *  @description Component member for position.
         *  @param       {'bottom' | 'left' | 'right'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set position(v: 'bottom' | 'left' | 'right') { this.setAttribute('position', v); }

        /** @name        startLabel
         *  @public
         *  @type        {string}
         *  @description Component member for start Label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get startLabel(): string { return this.getAttribute('start-label') ?? ''; }

        /** @name        startLabel
         *  @public
         *  @type        {void}
         *  @description Component member for start Label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set startLabel(v: string) { v ? this.setAttribute('start-label', v) : this.removeAttribute('start-label'); }
        // ── Template helpers ─────────────────────────────────────────────────────
        /** @name        dockStyle
         *  @private
         *  @type        {() => Dock.Types.DockStyle}
         *  @description Component member for dock Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dockStyle: () => Types.DockStyle = () => 'macos';

        /** @name        isMacOS
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Mac OS.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isMacOS: () => boolean = () => true;

        /** @name        isWindows
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Windows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isWindows: () => boolean = () => false;

        /** @name        startBtnLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for start Btn Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private startBtnLabel: () => string = () => '';

        /** @name        allItems
         *  @private
         *  @type        {() => Dock.Interfaces.DockItem[]}
         *  @description Component member for all Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allItems: () => Interfaces.DockItem[] = () => [];

        /** @name        trayItems
         *  @private
         *  @type        {() => Dock.Interfaces.DockItem[]}
         *  @description Component member for tray Items.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private trayItems: () => Interfaces.DockItem[] = () => [];

        /** @name        iconCls
         *  @private
         *  @type        {(icon: string) => string}
         *  @description Component member for icon Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconCls: (icon: string) => string = () => '';

        /** @name        iconHtml
         *  @private
         *  @type        {(icon: string) => string}
         *  @description Component member for icon Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iconHtml: (icon: string) => string = () => '';

        /** @name        itemCls
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem, tray?: boolean) => string}
         *  @description Component member for item Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemCls: (it: Interfaces.DockItem, tray?: boolean) => string = () => '';

        /** @name        hasBadge
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem) => boolean}
         *  @description Component member for has Badge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasBadge: (it: Interfaces.DockItem) => boolean = () => false;

        /** @name        badgeText
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem) => string}
         *  @description Component member for badge Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private badgeText: (it: Interfaces.DockItem) => string = () => '';

        /** @name        isSeparator
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem) => boolean}
         *  @description Component member for is Separator.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSeparator: (it: Interfaces.DockItem) => boolean = () => false;

        /** @name        notSeparator
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem) => boolean}
         *  @description Component member for not Separator.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private notSeparator: (it: Interfaces.DockItem) => boolean = () => true;

        /** @name        onItemClick
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem, e: Event) => void}
         *  @description Component member for on Item Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onItemClick: (it: Interfaces.DockItem, e: Event) => void = () => { };

        /** @name        onTrayClick
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem, e: Event) => void}
         *  @description Component member for on Tray Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onTrayClick: (it: Interfaces.DockItem, e: Event) => void = () => { };

        /** @name        onItemContext
         *  @private
         *  @type        {(it: Dock.Interfaces.DockItem, e: Event) => void}
         *  @description Component member for on Item Context.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onItemContext: (it: Interfaces.DockItem, e: Event) => void = () => { };

        /** @name        onStart
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onStart: () => void = () => { };

        /** @name        onPointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPointerMove: (e: Event) => void = () => { };

        /** @name        onPointerLeave
         *  @private
         *  @type        {(e?: Event) => void}
         *  @description Component member for on Pointer Leave.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPointerLeave: (e?: Event) => void = () => { };

        /** @name        clockTime
         *  @private
         *  @type        {() => string}
         *  @description Component member for clock Time.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private clockTime: () => string = () => '';

        /** @name        clockDate
         *  @private
         *  @type        {() => string}
         *  @description Component member for clock Date.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private clockDate: () => string = () => '';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Dock.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Dock.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none',
                    font: '13px -apple-system, system-ui, sans-serif',
                    boxSizing: 'border-box',
                }),
                new Rule(':host([variant="macos"])', {
                    background: 'rgba(28, 28, 30, 0.6)',
                    backdropFilter: 'blur(20px)',
                    'WebkitBackdropFilter': 'blur(20px)',
                    borderRadius: '18px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0',
                    height: '78px',
                }),
                new Rule(':host([variant="windows"])', {
                    background: 'rgba(32, 32, 36, 0.92)',
                    backdropFilter: 'blur(40px)',
                    'WebkitBackdropFilter': 'blur(40px)',
                    height: '48px',
                    padding: '0 4px',
                    gap: '4px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                }),
                // Track + items
                new Rule('.ar-dock__track', {
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '6px',
                    padding: '6px 10px',
                }),
                new Rule('.ar-dock__track--windows', {
                    flex: '1', padding: '0 4px', gap: '2px',
                    alignItems: 'center', height: '48px', overflow: 'hidden',
                }),
                new Rule('.ar-dock__item', {
                    position: 'relative',
                    background: 'none',
                    border: '0',
                    padding: '0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.12s ease-out',
                }),
                // macOS sizes
                new Rule(':host([variant="macos"]) .ar-dock__item', { width: '56px', height: '62px' }),
                new Rule(':host([variant="macos"]) .ar-dock__icon', {
                    width: '48px', height: '48px', borderRadius: '11px',
                    overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    background: 'linear-gradient(135deg, #2a2a2c 0%, #1c1c1e 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }),
                new Rule(':host([variant="macos"]) .ar-dock__icon .ar-dock__emoji, :host([variant="macos"]) .ar-dock__icon--emoji', {
                    fontSize: '36px',
                }),
                new Rule(':host([variant="macos"]) .ar-dock__sep', {
                    width: '1px',
                    height: '48px',
                    background: 'rgba(255,255,255,0.18)',
                    margin: '0 4px',
                    alignSelf: 'center',
                }),
                new Rule(':host([variant="macos"]) .ar-dock__dot', {
                    bottom: '0', background: '#d4d4d4',
                }),
                // Windows sizes
                new Rule(':host([variant="windows"]) .ar-dock__start', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'transparent', border: '0',
                    color: '#d4d4d4', height: '40px', padding: '0 12px',
                    borderRadius: '6px', cursor: 'pointer',
                    transition: 'background 0.12s ease',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__start:hover', {
                    background: 'rgba(255,255,255,0.08)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__start-icon', {
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#60a5fa',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__start-label', {
                    font: '13px sans-serif',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item', {
                    width: '40px', height: '40px',
                    flexDirection: 'column', justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'background 0.12s ease',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item:hover', {
                    background: 'rgba(255,255,255,0.08)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--active', {
                    background: 'rgba(255,255,255,0.12)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__icon', { width: '22px', height: '22px' }),
                new Rule(':host([variant="windows"]) .ar-dock__emoji, :host([variant="windows"]) .ar-dock__icon--emoji', {
                    fontSize: '20px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__dot', {
                    bottom: '2px', height: '3px', width: '16px',
                    borderRadius: '2px', background: '#60a5fa',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--running.ar-dock__item--active .ar-dock__dot', {
                    width: '24px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__tray', {
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '0 8px 0 4px', height: '48px',
                    borderLeft: '1px solid rgba(255,255,255,0.04)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--tray', {
                    width: '28px', height: '28px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--tray .ar-dock__icon', {
                    width: '18px', height: '18px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--tray .ar-dock__emoji', { fontSize: '16px' }),
                new Rule(':host([variant="windows"]) .ar-dock__clock', {
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    padding: '0 8px', font: '11px sans-serif',
                    color: '#d4d4d4', lineHeight: '1.2', cursor: 'default',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__time', { fontWeight: '500' }),
                new Rule(':host([variant="windows"]) .ar-dock__date', { fontSize: '10px', opacity: '0.85' }),
                // Shared item internals
                new Rule('.ar-dock__icon', {
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }),
                new Rule('.ar-dock__icon svg, .ar-dock__icon img', {
                    width: '100%', height: '100%', display: 'block', pointerEvents: 'none',
                }),
                new Rule('.ar-dock__emoji', { fontSize: '32px', lineHeight: '1' }),
                new Rule('.ar-dock__tooltip', {
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    background: '#111',
                    color: '#fff',
                    padding: '3px 8px',
                    font: '11px sans-serif',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    opacity: '0',
                    transition: 'opacity 0.12s ease',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__tooltip', { display: 'none' }),
                new Rule('.ar-dock__item:hover .ar-dock__tooltip', { opacity: '1' }),
                new Rule('.ar-dock__badge', {
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    background: 'var(--arianna-danger, #cf222e)',
                    color: '#fff',
                    borderRadius: '8px',
                    font: '600 10px sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 2px #161616',
                }),
                new Rule('.ar-dock__dot', {
                    position: 'absolute', width: '4px', height: '4px',
                    borderRadius: '50%', opacity: '0',
                    transition: 'opacity 0.12s ease',
                }),
                new Rule('.ar-dock__item--running .ar-dock__dot', { opacity: '1' }),
            ]);
        }
    }
}
export default Dock;

export type DockItem = Dock.Interfaces.DockItem;
export type DockOptions = Dock.Interfaces.DockOptions;
export type DockStyle = Dock.Types.DockStyle;
