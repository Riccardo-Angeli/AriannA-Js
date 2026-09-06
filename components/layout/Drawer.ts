/**
 * @module    components/layout/Drawer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Drawer component module.
 */

declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Templates: any;



/** @namespace   Drawer
 *  @public
 *  @description Namespace containing Drawer contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Drawer
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
        /** @interface   DrawerOptions
         *  @public
         *  @description DrawerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DrawerOptions
        {
            /** @name        side
             *  @public
             *  @type        {'left' | 'right' | 'top' | 'bottom'}
             *  @description Component member for side.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            side?: 'left' | 'right' | 'top' | 'bottom';

            /** @name        width
             *  @public
             *  @type        {number}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: number;

            /** @name        height
             *  @public
             *  @type        {number}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: number;

            /** @name        closeOnBackdrop
             *  @public
             *  @type        {boolean}
             *  @description Component member for close On Backdrop.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            closeOnBackdrop?: boolean;

            /** @name        open
             *  @public
             *  @type        {boolean}
             *  @description Component member for open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            open?: boolean;
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

    /** @class       Drawer
     *  @public
     *  @description AriannA Drawer component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    
    /** Default class-driven light-DOM stylesheet; installed synchronously by @Component. */
    export function DrawerDefaultSheet(): Types.Stylesheet
    {
        return new Stylesheet([
            new Rule('arianna-drawer', {
                BoxSizing: 'border-box',
                Display: 'none',
                Inset: '0',
                MaxWidth: '100%',
                MinWidth: '0',
                Position: 'fixed',
                ZIndex: '1900',
            }),

            new Rule('arianna-drawer[open]', {
                Display: 'block',
            }),

            new Rule('.ar-drawer__backdrop', {
                Background: 'rgba(5,6,8,.66)',
                Inset: '0',
                Opacity: '0',
                Position: 'absolute',
                Transition: 'opacity .22s ease',
            }),

            new Rule('arianna-drawer.ar-drawer--open .ar-drawer__backdrop', {
                Opacity: '1',
            }),

            new Rule('.ar-drawer__panel', {
                Background: 'linear-gradient(180deg,#1d1e23 0%,#17181c 100%)',
                Border: '1px solid #34363d',
                BoxShadow: '0 22px 64px rgba(0,0,0,.48)',
                BoxSizing: 'border-box',
                Color: '#e7e9ed',
                OverflowY: 'auto',
                Padding: '18px',
                Position: 'absolute',
                Transition: 'transform .24s cubic-bezier(.2,.8,.2,1)',
            }),

            new Rule('arianna-drawer[side="left"] .ar-drawer__panel', {
                BorderRight: '2px solid #e40c88',
                Bottom: '0',
                Left: '0',
                Top: '0',
                Transform: 'translateX(-100%)',
            }),

            new Rule('arianna-drawer[side="right"] .ar-drawer__panel', {
                BorderLeft: '2px solid #e40c88',
                Bottom: '0',
                Right: '0',
                Top: '0',
                Transform: 'translateX(100%)',
            }),

            new Rule('arianna-drawer[side="top"] .ar-drawer__panel', {
                BorderBottom: '2px solid #e40c88',
                Left: '0',
                Right: '0',
                Top: '0',
                Transform: 'translateY(-100%)',
            }),

            new Rule('arianna-drawer[side="bottom"] .ar-drawer__panel', {
                BorderTop: '2px solid #e40c88',
                Bottom: '0',
                Left: '0',
                Right: '0',
                Transform: 'translateY(100%)',
            }),

            new Rule('arianna-drawer:not([side]) .ar-drawer__panel', {
                BorderRight: '2px solid #e40c88',
                Bottom: '0',
                Left: '0',
                Top: '0',
                Transform: 'translateX(-100%)',
            }),

            new Rule('arianna-drawer.ar-drawer--open .ar-drawer__panel', {
                Transform: 'none',
            }),

            new Rule('.ar-drawer__panel h1, .ar-drawer__panel h2, .ar-drawer__panel h3, .ar-drawer__panel h4', {
                Color: '#f3f4f6',
                MarginTop: '0',
            }),

            new Rule('.ar-drawer__panel p', {
                Color: '#a9afb8',
            }),

            new Rule('.ar-drawer__panel button', {
                Appearance: 'none',
                Background: '#25272c',
                Border: '1px solid #3a3d45',
                BorderRadius: '6px',
                Color: '#dfe2e7',
                Cursor: 'pointer',
                Padding: '7px 11px',
            }),

            new Rule('.ar-drawer__panel button:hover', {
                Background: '#2c2f35',
                BorderColor: '#e40c88',
                Color: '#ffffff',
            }),

            /* Explicit Light */
            new Rule('arianna-drawer[theme="light"] .ar-drawer__backdrop', {
                Background: 'rgba(20,22,26,.30)',
            }),

            new Rule('arianna-drawer[theme="light"] .ar-drawer__panel', {
                Background: 'linear-gradient(180deg,#ffffff 0%,#f6f6f8 100%)',
                BorderColor: '#dcdde2',
                BoxShadow: '0 22px 64px rgba(0,0,0,.20)',
                Color: '#1c1e21',
            }),

            new Rule('arianna-drawer[theme="light"] .ar-drawer__panel h1, arianna-drawer[theme="light"] .ar-drawer__panel h2, arianna-drawer[theme="light"] .ar-drawer__panel h3, arianna-drawer[theme="light"] .ar-drawer__panel h4', {
                Color: '#1c1e21',
            }),

            new Rule('arianna-drawer[theme="light"] .ar-drawer__panel p', {
                Color: '#60656e',
            }),

            new Rule('arianna-drawer[theme="light"] .ar-drawer__panel button', {
                Background: '#f2f3f5',
                BorderColor: '#d8dae0',
                Color: '#292c31',
            }),

            new Rule('arianna-drawer arianna-button .ar-btn__native', {
                Background: '#25272c',
                Border: '1px solid #3a3d45',
                Color: '#dfe2e7',
            }),

            new Rule('arianna-drawer arianna-button[variant="primary"] .ar-btn__native', {
                Background: '#e40c88',
                Border: '1px solid #e40c88',
                Color: '#ffffff',
            }),

            new Rule('arianna-drawer arianna-button[variant="danger"] .ar-btn__native', {
                Background: '#c83d4a',
                Border: '1px solid #c83d4a',
                Color: '#ffffff',
            }),

            new Rule('arianna-drawer[theme="light"] arianna-button .ar-btn__native', {
                Background: '#f0f1f3',
                Border: '1px solid #d7d9df',
                Color: '#292c31',
            }),

            new Rule('arianna-drawer[theme="light"] arianna-button[variant="primary"] .ar-btn__native', {
                Background: '#e40c88',
                Border: '1px solid #e40c88',
                Color: '#ffffff',
            }),

        ]);
    }

@Component('arianna-drawer', DrawerDefaultSheet(), {
        Attributes: ['side', 'width', 'height', 'open', 'close-on-backdrop', 'theme'],
    })
    export class Drawer extends HTMLDivElement
    {
        /** Embedded component icon used by WYSIWYG palettes and drag/drop panels. */
        static readonly Icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 4v16" stroke="currentColor" stroke-width="2"/></svg>`;
        /** Canonical named default styles. Use e.g. Component.Styles['Disabled']. */
        static readonly Styles = Object.freeze
        (
            {
                Default:
                new Rule('arianna-drawer', {
                BoxSizing: 'border-box',
                MaxWidth: '100%',
                MinWidth: '0',
                Position: 'fixed',
                Inset: '0',
                ZIndex: '900',
                Display: 'none',
                }),
                Open:
                new Rule('arianna-drawer[open]', { display: 'block' }),
                Backdrop:
                new Rule('.ar-drawer__backdrop', {
                Position: 'absolute',
                Inset: '0',
                Background: 'rgba(0,0,0,0.5)',
                Opacity: '0',
                Transition: 'opacity 0.25s',
                }),
                DrawerOpenBackdrop:
                new Rule('arianna-drawer.ar-drawer--open .ar-drawer__backdrop', { opacity: '1' }),
                Panel:
                new Rule('.ar-drawer__panel', {
                Position: 'absolute',
                Background: 'var(--arianna-bg, var(--bg, #ffffff))',
                Border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                BoxShadow: '0 8px 32px rgba(0,0,0,0.20)',
                OverflowY: 'auto',
                Transition: 'transform 0.25s ease',
                }),
                SideLeftPanel:
                new Rule('arianna-drawer[side="left"] .ar-drawer__panel', { left: '0', top: '0', bottom: '0', transform: 'translateX(-100%)' }),
                SideRightPanel:
                new Rule('arianna-drawer[side="right"] .ar-drawer__panel', { right: '0', top: '0', bottom: '0', transform: 'translateX(100%)' }),
                SideTopPanel:
                new Rule('arianna-drawer[side="top"] .ar-drawer__panel', { top: '0', left: '0', right: '0', transform: 'translateY(-100%)' }),
                SideBottomPanel:
                new Rule('arianna-drawer[side="bottom"] .ar-drawer__panel', { bottom: '0', left: '0', right: '0', transform: 'translateY(100%)' }),
                SidePanel:
                new Rule('arianna-drawer:not([side]) .ar-drawer__panel', { left: '0', top: '0', bottom: '0', transform: 'translateX(-100%)' }),
                DrawerOpenPanel:
                new Rule('arianna-drawer.ar-drawer--open .ar-drawer__panel', { transform: 'none' }),
            }
        );


        /** Embedded component icon. */
        get Icon(): string { return Drawer.Icon; }

        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'Drawer';
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
            this.classList.add('Drawer');
        }

        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Drawer.Interfaces.DrawerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.DrawerOptions = {})
        {
            this.classList.add('Drawer');
            if(this.childNodes.length === 0)
            {
                requestAnimationFrame(() => this.onConnected(_opts));
                return;
            }

            if(this.dataset.ariannaDrawerReady === 'true') return;
            this.dataset.ariannaDrawerReady = 'true';

            const authored =
                Array.from(this.childNodes);

            const backdrop = document.createElement('div');
            backdrop.className = 'ar-drawer__backdrop';

            const panel = document.createElement('div');
            panel.className = 'ar-drawer__panel';

            for(const node of authored) panel.appendChild(node);

            const side =
                this.getAttribute('side') ?? 'left';

            if(side === 'left' || side === 'right')
                panel.style.width = `${parseInt(this.getAttribute('width') ?? '280', 10) || 280}px`;
            else
                panel.style.height = `${parseInt(this.getAttribute('height') ?? '240', 10) || 240}px`;

            backdrop.addEventListener
            (
                'click',
                () =>
                {
                    if(this.getAttribute('close-on-backdrop') !== 'false') this.close();
                }
            );

            this.addEventListener
            (
                'click',
                event =>
                {
                    const target = event.target as HTMLElement | null;
                    if(target?.closest('[data-drawer-close]')) this.close();
                }
            );

            this.replaceChildren(backdrop, panel);

            if(this.hasAttribute('open'))
            {
                requestAnimationFrame(() => this.classList.add('ar-drawer--open'));
            }
        }

        /** @name        open
         *  @public
         *  @type        {this}
         *  @description Component member for open.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        open(): this
        {
            if(!this.querySelector('.ar-drawer__panel'))
            {
                this.dataset.ariannaDrawerReady='false';
                this.onConnected();
            }

            this.setAttribute('open', '');
            // tick so the CSS transition has something to interpolate from
            setTimeout(() => this.classList.add('ar-drawer--open'), 10);
            this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: {} }));
            return this;
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
            this.classList.remove('ar-drawer--open');
            setTimeout(() => {
                this.removeAttribute('open');
                this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
            }, 250);
            return this;
        }

        /** @name        isOpen
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Open.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get isOpen(): boolean { return this.hasAttribute('open'); }

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

        /** @name        side
         *  @public
         *  @type        {'left' | 'right' | 'top' | 'bottom'}
         *  @description Component member for side.
         *  @returns     {'left' | 'right' | 'top' | 'bottom'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get side(): 'left' | 'right' | 'top' | 'bottom' { return (this.getAttribute('side') ?? 'left') as never; }

        /** @name        side
         *  @public
         *  @type        {void}
         *  @description Component member for side.
         *  @param       {'left' | 'right' | 'top' | 'bottom'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set side(v: 'left' | 'right' | 'top' | 'bottom') { this.setAttribute('side', v); }

        /** @name        width
         *  @public
         *  @type        {number}
         *  @description Component member for width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get width(): number { return parseInt(this.getAttribute('width') ?? '280', 10); }

        /** @name        width
         *  @public
         *  @type        {void}
         *  @description Component member for width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set width(v: number) { this.setAttribute('width', String(v)); }

        /** @name        height
         *  @public
         *  @type        {number}
         *  @description Component member for height.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get height(): number { return parseInt(this.getAttribute('height') ?? '240', 10); }

        /** @name        height
         *  @public
         *  @type        {void}
         *  @description Component member for height.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set height(v: number) { this.setAttribute('height', String(v)); }

        /** @name        closeOnBackdrop
         *  @public
         *  @type        {boolean}
         *  @description Component member for close On Backdrop.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get closeOnBackdrop(): boolean { return this.getAttribute('close-on-backdrop') !== 'false'; }

        /** @name        closeOnBackdrop
         *  @public
         *  @type        {void}
         *  @description Component member for close On Backdrop.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set closeOnBackdrop(v: boolean) { this.setAttribute('close-on-backdrop', v ? 'true' : 'false'); }

        /** @name        panelStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for panel Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private panelStyle: () => Record<string, string> = () => ({});

        /** @name        onBackdrop
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Backdrop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onBackdrop: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Drawer.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Drawer.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        { return DrawerDefaultSheet(); }
    }
}
export const DrawerClass = Drawer.Drawer;
export default Drawer.Drawer;

export type DrawerOptions = Drawer.Interfaces.DrawerOptions;
