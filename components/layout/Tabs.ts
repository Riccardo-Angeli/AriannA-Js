/**
 * @module    components/layout/Tabs
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Tabs component module.
 */

declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Templates: any;



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
        
        /** Default Tab stylesheet installed synchronously by @Component. */
        export function TabDefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('arianna-tab', {
                    display: 'contents'
                }),
                new Rule('.ar-tab__label', {
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '38px',
                    padding: '8px 14px',
                    borderBottom: '2px solid transparent',
                    color: 'var(--arianna-muted, #8a8f98)',
                    transition: 'color .15s ease, border-color .15s ease, background .15s ease',
                    userSelect: 'none',
                    fontSize: '.85rem',
                    whiteSpace: 'nowrap',
                    justifyContent: 'center',
                    width: '100%',
                    gridRow: '1'
                }),
                new Rule('.ar-tab__label:hover', {
                    color: 'var(--arianna-text, #f4f4f5)',
                    background: 'color-mix(in srgb, var(--arianna-primary, #e40c88) 7%, transparent)'
                }),
                new Rule('arianna-tab[active] > .ar-tab__label', {
                    borderBottomColor: 'var(--arianna-primary, #e40c88)',
                    color: 'var(--arianna-primary, #e40c88)',
                    fontWeight: '650'
                }),
                new Rule('arianna-tab[disabled] > .ar-tab__label', {
                    cursor: 'not-allowed',
                    opacity: '.45'
                }),
                new Rule('.ar-tab__panel', {
                    boxSizing: 'border-box',
                    gridRow: '2',
                    gridColumn: '1 / -1',
                    width: '100%',
                    minWidth: '0',
                    padding: '16px 4px 4px',
                    color: 'var(--arianna-text, #f4f4f5)'
                }),
                new Rule('.ar-tab__panel[hidden]', { display: 'none' })
            ]);
        }

export @Component('arianna-tab', TabDefaultSheet(), {
        Attributes: ['label', 'disabled', 'active'],
        bus: 'arianna-tabs',
    })
    class Tab extends HTMLDivElement
    {
        /** Embedded component icon used by WYSIWYG palettes and drag/drop panels. */
        static readonly Icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 7h7l2 3h9v9H3V7Z"/></svg>`;
        /** Canonical named default styles. Use e.g. Component.Styles['Disabled']. */
        static readonly Styles = Object.freeze
        (
            {
                Default:
                new Rule('arianna-tab', {
                display: 'contents'
                }),
                Label:
                new Rule('.ar-tab__label', {
                boxSizing: 'border-box',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                minHeight: '38px',
                padding: '8px 14px',
                borderBottom: '2px solid transparent',
                color: 'var(--arianna-muted, #8a8f98)',
                transition: 'color .15s ease, border-color .15s ease, background .15s ease',
                userSelect: 'none',
                fontSize: '.85rem',
                whiteSpace: 'nowrap',
                gridRow: '1'
                }),
                LabelHover:
                new Rule('.ar-tab__label:hover', {
                color: 'var(--arianna-text, #f4f4f5)',
                background: 'color-mix(in srgb, var(--arianna-primary, #e40c88) 7%, transparent)'
                }),
                ActiveLabel:
                new Rule('arianna-tab[active] > .ar-tab__label', {
                borderBottomColor: 'var(--arianna-primary, #e40c88)',
                color: 'var(--arianna-primary, #e40c88)',
                fontWeight: '650'
                }),
                Active:
                new Rule('arianna-tab[active] > .ar-tab__label', {
                borderBottomColor: 'var(--arianna-primary, #e40c88)',
                color: 'var(--arianna-primary, #e40c88)',
                fontWeight: '650'
                }),
                DisabledLabel:
                new Rule('arianna-tab[disabled] > .ar-tab__label', {
                cursor: 'not-allowed',
                opacity: '.45'
                }),
                Disabled:
                new Rule('arianna-tab[disabled] > .ar-tab__label', {
                cursor: 'not-allowed',
                opacity: '.45'
                }),
                Panel:
                new Rule('.ar-tab__panel', {
                boxSizing: 'border-box',
                gridRow: '2',
                gridColumn: '1 / -1',
                width: '100%',
                minWidth: '0',
                padding: '16px 4px 4px',
                color: 'var(--arianna-text, #f4f4f5)'
                }),
                PanelHidden:
                new Rule('.ar-tab__panel[hidden]', { display: 'none' }),
            }
        );



        /** Embedded component icon. */
        get Icon(): string { return Tab.Icon; }

        constructor()
        {
            super();
            this.classList.add('Tab');
        }

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
            if(this.dataset.ariannaTabReady === 'true') return;

            const panel =
                Array.from(this.children)
                    .find(child => child.tagName.toLowerCase() === 'section') as HTMLElement | undefined;

            const textNodes =
                Array.from(this.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE);

            const authored =
                textNodes.map(node => node.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();

            const label =
                this.getAttribute('label')?.trim() || authored;

            if(!label)
            {
                requestAnimationFrame(() => this.onConnected(_opts));
                return;
            }

            this.dataset.ariannaTabReady = 'true';

            for(const node of textNodes) node.remove();

            let trigger =
                Array.from(this.children)
                    .find(child => child.classList.contains('ar-tab__label')) as HTMLElement | undefined;

            if(!trigger)
            {
                trigger = document.createElement('span');
                trigger.className = 'ar-tab__label';
                this.prepend(trigger);
            }

            trigger.textContent = label;
            trigger.setAttribute('role', 'tab');
            trigger.tabIndex = this.hasAttribute('disabled') ? -1 : 0;

            if(panel)
            {
                panel.classList.add('ar-tab__panel');
                panel.setAttribute('role', 'tabpanel');
            }

            const select = (): void =>
            {
                if(this.hasAttribute('disabled')) return;

                this.dispatchEvent(new CustomEvent('arianna:tab-select', {
                    bubbles: true,
                    composed: true,
                    detail: { source: this }
                }));
            };

            trigger.addEventListener('click', select);
            trigger.addEventListener('keydown', event =>
            {
                if(event.key === 'Enter' || event.key === ' ')
                {
                    event.preventDefault();
                    select();
                }
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
        onCreated()
        {
            requestAnimationFrame(() =>
            {
                if(this.isConnected) this.onConnected?.();
            });
        }

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
        { return TabDefaultSheet(); }
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
    
    /** Default Tabs stylesheet installed synchronously by @Component. */
    export function TabsDefaultSheet(): Types.Stylesheet
    {
            return new Stylesheet([
                new Rule('arianna-tabs', {
                    boxSizing: 'border-box',
                    display: 'grid',
                    gridAutoColumns: 'minmax(0, 1fr)',
                    gridAutoFlow: 'column',
                    gridTemplateRows: 'auto minmax(0, 1fr)',
                    justifyContent: 'stretch',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: '0',
                    borderBottom: '1px solid var(--arianna-border, #2d3037)'
                })
            ]);
        }

@Component('arianna-tabs', TabsDefaultSheet(), {
        Attributes: ['active'],
    })
    export class Tabs extends HTMLDivElement
    {
        /** Embedded component icon used by WYSIWYG palettes and drag/drop panels. */
        static readonly Icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 8h5l2-3h4l2 3h5v11H3V8Z"/></svg>`;
        /** Canonical named default styles. Use e.g. Component.Styles['Disabled']. */
        static readonly Styles = Object.freeze
        (
            {
                Default:
                new Rule('arianna-tabs', {
                boxSizing: 'border-box',
                display: 'grid',
                gridAutoColumns: 'minmax(0, 1fr)',
                gridAutoFlow: 'column',
                gridTemplateRows: 'auto minmax(0, 1fr)',
                justifyContent: 'stretch',
                width: '100%',
                maxWidth: '100%',
                minWidth: '0',
                borderBottom: '1px solid var(--arianna-border, #2d3037)'
                }),
            }
        );



        /** Embedded component icon. */
        get Icon(): string { return Tabs.Icon; }

        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'Tabs';
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
            this.classList.add('Tabs');
        }

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
            const authoredTabs=Array.from(this.children).filter(child => child.tagName.toLowerCase()==='arianna-tab');
            if(authoredTabs.length===0)
            {
                requestAnimationFrame(() => this.onConnected(_opts));
                return;
            }

            if(this.dataset.ariannaTabsReady === 'true') return;
            this.dataset.ariannaTabsReady = 'true';

            this.setAttribute('role', 'tablist');

            this.addEventListener
            (
                'arianna:tab-select',
                (event: Event) =>
                {
                    const source =
                        (event as CustomEvent<{ source?: HTMLElement }>).detail?.source;

                    if(!source) return;

                    const triggers =
                        Array.from(this.children)
                            .filter(child => child.tagName.toLowerCase() === 'arianna-tab') as HTMLElement[];

                    const index =
                        triggers.indexOf(source);

                    if(index < 0) return;

                    this.setAttribute('active', String(index));
                    this.syncChildren();

                    this.dispatchEvent
                    (
                        new CustomEvent
                        (
                            'arianna:change',
                            {
                                bubbles  : true,
                                composed : true,
                                detail   : { active: index, source: this }
                            }
                        )
                    );
                }
            );

            this.syncChildren();
        }

        /** Propagate the parent's `active` index down to children's `[active]` attr. */
        private syncChildren(): void
        {
            const active =
                Math.max(0, parseInt(this.getAttribute('active') ?? '0', 10) || 0);

            const tabs =
                Array.from(this.children)
                    .filter(child => child.tagName.toLowerCase() === 'arianna-tab') as HTMLElement[];

            tabs.forEach((tab, index) =>
            {
                const selected = index === active;
                tab.toggleAttribute('active', selected);

                const trigger = tab.querySelector(':scope > .ar-tab__label') as HTMLElement | null;
                trigger?.setAttribute('aria-selected', String(selected));
                if(trigger) trigger.tabIndex = tab.hasAttribute('disabled') ? -1 : (selected ? 0 : -1);

                const panel = tab.querySelector(':scope > section') as HTMLElement | null;
                if(panel)
                {
                    panel.classList.add('ar-tab__panel');
                    panel.hidden = !selected;
                    panel.setAttribute('role', 'tabpanel');
                }
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
        onCreated()
        {
            requestAnimationFrame(() =>
            {
                if(this.isConnected) this.onConnected?.();
            });
        }

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
            this.syncChildren();
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
            this.syncChildren();
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
        set active(v: number) { this.setAttribute('active', String(v)); this.syncChildren(); }

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
        { return TabsDefaultSheet(); }
    }
}
export const TabsClass = Tabs.Tabs;
export default Tabs.Tabs;

export const Tab = Tabs.Tab;

export type TabsOptions = Tabs.Interfaces.TabsOptions;
export type TabOptions = Tabs.Interfaces.TabOptions;
