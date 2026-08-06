/**
 * @module    components/layout/Drawer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Drawer component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

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
    @Component('arianna-drawer', {}, {
        Attributes: ['side', 'width', 'height', 'open', 'close-on-backdrop'],
    })
    export class Drawer extends HTMLElement
    {
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
            /** @name        side
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned side value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const side = this.signal().attribute('side');

            /** @name        width
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned width value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const width = this.signal().attribute('width');

            /** @name        height
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned height value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const height = this.signal().attribute('height');
            this.panelStyle = (): Record<string, string> => {
                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = side.Get() ?? 'left';
                if (s === 'left' || s === 'right')
                {
                    /** @name        w
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned w value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const w = parseInt(width.Get() ?? '280', 10) || 280;
                    return { width: w + 'px' };
                }
                else
                {
                    /** @name        h
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned h value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const h = parseInt(height.Get() ?? '240', 10) || 240;
                    return { height: h + 'px' };
                }
            };
            this.onBackdrop = () => {
                /** @name        closeOn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned closeOn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const closeOn = this.getAttribute('close-on-backdrop');
                if (closeOn !== 'false')
                    this.close();
            };
            this.template = html `
            <div class="ar-drawer__backdrop" @click="this.onBackdrop"></div>
            <div class="ar-drawer__panel" :style="this.panelStyle()">
                <slot></slot>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Drawer.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Drawer.DefaultSheet();
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
        {
            return new Stylesheet([
                new Rule(':host', {
                    position: 'fixed',
                    inset: '0',
                    zIndex: '900',
                    display: 'none',
                }),
                new Rule(':host([open])', { display: 'block' }),
                new Rule('.ar-drawer__backdrop', {
                    position: 'absolute',
                    inset: '0',
                    background: 'rgba(0,0,0,0.5)',
                    opacity: '0',
                    transition: 'opacity 0.25s',
                }),
                new Rule(':host.ar-drawer--open .ar-drawer__backdrop', { opacity: '1' }),
                new Rule('.ar-drawer__panel', {
                    position: 'absolute',
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
                    overflowY: 'auto',
                    transition: 'transform 0.25s ease',
                }),
                new Rule(':host([side="left"]) .ar-drawer__panel', { left: '0', top: '0', bottom: '0', transform: 'translateX(-100%)' }),
                new Rule(':host([side="right"]) .ar-drawer__panel', { right: '0', top: '0', bottom: '0', transform: 'translateX(100%)' }),
                new Rule(':host([side="top"]) .ar-drawer__panel', { top: '0', left: '0', right: '0', transform: 'translateY(-100%)' }),
                new Rule(':host([side="bottom"]) .ar-drawer__panel', { bottom: '0', left: '0', right: '0', transform: 'translateY(100%)' }),
                new Rule(':host(:not([side])) .ar-drawer__panel', { left: '0', top: '0', bottom: '0', transform: 'translateX(-100%)' }),
                new Rule(':host.ar-drawer--open .ar-drawer__panel', { transform: 'none' }),
            ]);
        }
    }
}
export default Drawer;

export type DrawerOptions = Drawer.Interfaces.DrawerOptions;
