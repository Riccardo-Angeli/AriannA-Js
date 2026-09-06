/**
 * @module    components/layout/Panel
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Panel component module.
 */

declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Templates: any;



/** @namespace   Panel
 *  @public
 *  @description Namespace containing Panel contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Panel
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
        /** @interface   PanelOptions
         *  @public
         *  @description PanelOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PanelOptions
        {
            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string;

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

    /** @class       Panel
     *  @public
     *  @description AriannA Panel component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    
    /** Default class-driven light-DOM stylesheet; installed synchronously by @Component. */
    export function PanelDefaultSheet(): Types.Stylesheet
    {
            return new Stylesheet([
                new Rule('arianna-panel', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    Background: 'var(--arianna-bg, var(--bg, #ffffff))',
                    Border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    BorderRadius: 'var(--arianna-radius, 6px)',
                    Color: 'var(--arianna-text, var(--text, #1c1e21))',
                    Display: 'block',
                    Overflow: 'hidden',
                }),
                new Rule('.ar-panel__header', {
                    AlignItems: 'center',
                    Background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                    BorderBottom: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    Display: 'flex',
                    Gap: '8px',
                    Padding: '8px 14px',
                }),
                new Rule('.ar-panel__title', { flex: '1', fontSize: '0.85rem', fontWeight: '600' }),
                new Rule('.ar-panel__toolbar', { display: 'flex', gap: '6px', alignItems: 'center' }),
                new Rule('.ar-panel__toolbar:empty', { display: 'none' }),
                new Rule('.ar-panel__toggle', {
                    AlignItems: 'center',
                    Appearance: 'none',
                    Background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                    Border: '1px solid var(--arianna-border, var(--border, #d8dbe1))',
                    BorderRadius: '6px',
                    Color: 'var(--arianna-muted, var(--muted, #687079))',
                    Cursor: 'pointer',
                    Display: 'inline-flex',
                    FontSize: '0.75rem',
                    Height: '26px',
                    JustifyContent: 'center',
                    MinWidth: '26px',
                    Padding: '2px 7px',
                    Transition: 'background .14s ease, border-color .14s ease, color .14s ease',
                }),
                new Rule('.ar-panel__toggle:hover', {
                    BorderColor: '#e40c88',
                    Color: '#e40c88',
                }),
                new Rule('.ar-panel__body', { padding: '14px' }),
                new Rule('arianna-panel[collapsed] .ar-panel__body', { display: 'none' }),

                new Rule('arianna-panel:not([theme="light"])', {
                    Background: '#17181c', BorderColor: '#303238', Color: '#e6e8eb'
                }),
                new Rule('arianna-panel:not([theme="light"]) .ar-panel__header', {
                    Background: '#1d1e23', BorderBottomColor: '#303238',
                    BoxShadow: 'inset 0 2px 0 #e40c88'
                }),
                new Rule('arianna-panel:not([theme="light"]) .ar-panel__toggle', {
                    Background: 'rgba(228,12,136,.10)',
                    BorderColor: 'rgba(228,12,136,.72)',
                    Color: '#ff4aa9'
                }),
                new Rule('arianna-panel:not([theme="light"]) .ar-panel__toggle:hover', {
                    Background: 'rgba(228,12,136,.18)',
                    BorderColor: '#e40c88',
                    Color: '#ffffff'
                }),
                new Rule('arianna-panel:not([theme="light"]) .ar-panel__body', {
                    Background: '#17181c', Color: '#a9afb8'
                })
            ]);
        }

@Component('arianna-panel', PanelDefaultSheet(), {
        Attributes: ['title', 'collapsible', 'collapsed'],
    })
    export class Panel extends HTMLDivElement
    {
        /** Embedded component icon used by WYSIWYG palettes and drag/drop panels. */
        static readonly Icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18" stroke="currentColor" stroke-width="2"/></svg>`;
        /** Canonical named default styles. Use e.g. Component.Styles['Disabled']. */
        static readonly Styles = Object.freeze
        (
            {
                Default:
                new Rule('arianna-panel', {
                BoxSizing: 'border-box',
                MaxWidth: '100%',
                MinWidth: '0',
                Background: 'var(--arianna-bg, var(--bg, #ffffff))',
                Border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                BorderRadius: 'var(--arianna-radius, 6px)',
                Color: 'var(--arianna-text, var(--text, #1c1e21))',
                Display: 'block',
                Overflow: 'hidden',
                }),
                Header:
                new Rule('.ar-panel__header', {
                AlignItems: 'center',
                Background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                BorderBottom: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                Display: 'flex',
                Gap: '8px',
                Padding: '8px 14px',
                }),
                Title:
                new Rule('.ar-panel__title', { flex: '1', fontSize: '0.85rem', fontWeight: '600' }),
                Toolbar:
                new Rule('.ar-panel__toolbar', { display: 'flex', gap: '6px', alignItems: 'center' }),
                ToolbarEmpty:
                new Rule('.ar-panel__toolbar:empty', { display: 'none' }),
                Toggle:
                new Rule('.ar-panel__toggle', {
                AlignItems: 'center',
                Appearance: 'none',
                Background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                Border: '1px solid var(--arianna-border, var(--border, #d8dbe1))',
                BorderRadius: '6px',
                Color: 'var(--arianna-muted, var(--muted, #687079))',
                Cursor: 'pointer',
                Display: 'inline-flex',
                FontSize: '0.75rem',
                Height: '26px',
                JustifyContent: 'center',
                MinWidth: '26px',
                Padding: '2px 7px',
                Transition: 'background .14s ease, border-color .14s ease, color .14s ease',
                }),
                Body:
                new Rule('.ar-panel__body', { padding: '14px' }),
                Collapsed:
                new Rule('arianna-panel[collapsed] .ar-panel__body', { display: 'none' }),
            }
        );


        /** Embedded component icon. */
        get Icon(): string { return Panel.Icon; }

        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'Panel';
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
            this.classList.add('Panel');
        }

        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Panel.Interfaces.PanelOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.PanelOptions = {})
        {
            if(this.childNodes.length === 0)
            {
                requestAnimationFrame(() => this.onConnected(_opts));
                return;
            }

            if(this.dataset.ariannaPanelReady === 'true') return;
            this.dataset.ariannaPanelReady = 'true';

            const authored =
                Array.from(this.childNodes);

            const toolbarNodes =
                authored.filter
                (
                    node =>
                        node instanceof HTMLElement &&
                        node.getAttribute('slot') === 'toolbar'
                );

            const bodyNodes =
                authored.filter(node => !toolbarNodes.includes(node as HTMLElement));

            const header = document.createElement('header');
            header.className = 'ar-panel__header';

            const title = document.createElement('span');
            title.className = 'ar-panel__title';
            title.textContent = this.getAttribute('title') ?? '';

            const toolbar = document.createElement('div');
            toolbar.className = 'ar-panel__toolbar';
            for(const node of toolbarNodes)
            {
                (node as HTMLElement).removeAttribute('slot');
                toolbar.appendChild(node);
            }

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'ar-panel__toggle';
            toggle.setAttribute('aria-label', 'Toggle panel');

            const body = document.createElement('div');
            body.className = 'ar-panel__body';
            for(const node of bodyNodes) body.appendChild(node);

            const sync = (): void =>
            {
                const collapsed = this.hasAttribute('collapsed');
                body.hidden = collapsed;
                toggle.textContent = collapsed ? '▸' : '▾';
                toggle.setAttribute('aria-expanded', String(!collapsed));
                toggle.hidden = !this.hasAttribute('collapsible');
            };

            toggle.addEventListener
            (
                'click',
                () =>
                {
                    if(this.hasAttribute('collapsed')) this.removeAttribute('collapsed');
                    else this.setAttribute('collapsed', '');

                    sync();

                    this.dispatchEvent
                    (
                        new CustomEvent
                        (
                            'arianna:toggle',
                            {
                                bubbles  : true,
                                composed : true,
                                detail   : { collapsed: this.hasAttribute('collapsed') }
                            }
                        )
                    );
                }
            );

            header.append(title, toolbar, toggle);
            this.replaceChildren(header, body);
            sync();
        }

        /** Programmatically toggle collapse state. */
        toggle(): void
        {
            const collapsed=this.hasAttribute('collapsed');
            this.toggleAttribute('collapsed',!collapsed);
            const body=this.querySelector<HTMLElement>('.ar-panel__body');
            const button=this.querySelector<HTMLButtonElement>('.ar-panel__toggle');
            if(body) body.hidden=!collapsed;
            if(button)
            {
                button.textContent=collapsed?'▾':'▸';
                button.setAttribute('aria-expanded',String(collapsed));
            }
            this.dispatchEvent(new CustomEvent('arianna:toggle',
            { bubbles:true, composed:true, detail:{ collapsed:!collapsed } }));
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

        /** @name        title
         *  @public
         *  @type        {string}
         *  @description Component member for title.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get title(): string { return this.getAttribute('title') ?? ''; }

        /** @name        title
         *  @public
         *  @type        {void}
         *  @description Component member for title.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

        /** @name        collapsible
         *  @public
         *  @type        {boolean}
         *  @description Component member for collapsible.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get collapsible(): boolean { return this.hasAttribute('collapsible'); }

        /** @name        collapsible
         *  @public
         *  @type        {void}
         *  @description Component member for collapsible.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set collapsible(v: boolean) { v ? this.setAttribute('collapsible', '') : this.removeAttribute('collapsible'); }

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

        /** @name        hasTitle
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Title.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasTitle: () => boolean = () => false;

        /** @name        titleText
         *  @private
         *  @type        {() => string}
         *  @description Component member for title Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private titleText: () => string = () => '';

        /** @name        isCollapsible
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Collapsible.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isCollapsible: () => boolean = () => false;

        /** @name        isCollapsed
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Collapsed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isCollapsed: () => boolean = () => false;

        /** @name        hasHeader
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Header.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasHeader: () => boolean = () => false;

        /** @name        toggleIcon
         *  @private
         *  @type        {() => string}
         *  @description Component member for toggle Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private toggleIcon: () => string = () => '▾';

        /** @name        onToggle
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Toggle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggle: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Panel.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Panel.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        { return PanelDefaultSheet(); }
    }
}
export const PanelClass = Panel.Panel;
export default Panel.Panel;

export type PanelOptions = Panel.Interfaces.PanelOptions;
