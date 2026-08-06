/**
 * @module    components/layout/Modal
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Modal component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Modal
 *  @public
 *  @description Namespace containing Modal contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Modal
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
        /** @interface   ModalOptions
         *  @public
         *  @description ModalOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ModalOptions
        {
            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string;

            /** @name        open
             *  @public
             *  @type        {boolean}
             *  @description Component member for open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            open?: boolean;

            /** @name        size
             *  @public
             *  @type        {'sm' | 'md' | 'lg' | 'xl'}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: 'sm' | 'md' | 'lg' | 'xl';

            /** @name        dismissable
             *  @public
             *  @type        {boolean}
             *  @description Component member for dismissable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dismissable?: boolean;
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

    /** @class       Modal
     *  @public
     *  @description AriannA Modal component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-modal', {}, {
        Attributes: ['title', 'open', 'size', 'dismissable'],
    })
    export class Modal extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Modal.Interfaces.ModalOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ModalOptions = {})
        {
            /** @name        title
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned title value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const title = this.signal().attribute('title');
            this.hasTitle = () => !!title.Get();
            this.titleText = () => title.Get() ?? '';
            this.onBackdrop = () => {
                if (this.getAttribute('dismissable') !== 'false')
                    this.close();
            };
            this.template = html `
            <div class="ar-modal__backdrop" @click="this.onBackdrop"></div>
            <div class="ar-modal__dialog">
                <header class="ar-modal__header" a-if="this.hasTitle()">{{ this.titleText() }}</header>
                <header class="ar-modal__header"><slot name="header"></slot></header>
                <section class="ar-modal__body"><slot></slot></section>
                <footer class="ar-modal__footer"><slot name="footer"></slot></footer>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Modal.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Modal.DefaultSheet();
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
            this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: { source: this } }));
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
            this.removeAttribute('open');
            this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: { source: this } }));
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

        /** @name        size
         *  @public
         *  @type        {'sm' | 'md' | 'lg' | 'xl'}
         *  @description Component member for size.
         *  @returns     {'sm' | 'md' | 'lg' | 'xl'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): 'sm' | 'md' | 'lg' | 'xl' { return (this.getAttribute('size') ?? 'md') as never; }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {'sm' | 'md' | 'lg' | 'xl'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: 'sm' | 'md' | 'lg' | 'xl') { this.setAttribute('size', v); }

        /** @name        dismissable
         *  @public
         *  @type        {boolean}
         *  @description Component member for dismissable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get dismissable(): boolean { return this.getAttribute('dismissable') !== 'false'; }

        /** @name        dismissable
         *  @public
         *  @type        {void}
         *  @description Component member for dismissable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set dismissable(v: boolean) { this.setAttribute('dismissable', v ? 'true' : 'false'); }

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
         *  @type        {Modal.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Modal.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'none',
                    position: 'fixed',
                    inset: '0',
                    zIndex: '1000',
                }),
                new Rule(':host([open])', { display: 'block' }),
                new Rule('.ar-modal__backdrop', {
                    background: 'rgba(0,0,0,0.45)',
                    position: 'absolute',
                    inset: '0',
                }),
                new Rule('.ar-modal__dialog', {
                    background: 'var(--arianna-bg, #ffffff)',
                    borderRadius: 'var(--arianna-radius, 10px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.30)',
                    color: 'var(--arianna-text, #1f2328)',
                    left: '50%',
                    maxWidth: '92vw',
                    maxHeight: '92vh',
                    overflow: 'auto',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '420px',
                }),
                new Rule(':host([size="sm"]) .ar-modal__dialog', { width: '320px' }),
                new Rule(':host([size="md"]) .ar-modal__dialog', { width: '420px' }),
                new Rule(':host([size="lg"]) .ar-modal__dialog', { width: '640px' }),
                new Rule(':host([size="xl"]) .ar-modal__dialog', { width: '880px' }),
                new Rule('.ar-modal__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    fontWeight: '600',
                    padding: '12px 16px',
                }),
                new Rule('.ar-modal__header:empty', { display: 'none' }),
                new Rule('.ar-modal__body', { padding: '14px 16px' }),
                new Rule('.ar-modal__footer', {
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '10px 16px',
                    textAlign: 'right',
                }),
                new Rule('.ar-modal__footer:empty', { display: 'none' }),
            ]);
        }
    }
}
export default Modal;

export type ModalOptions = Modal.Interfaces.ModalOptions;
