/**
 * @module    components/layout/Card
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Card component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Card
 *  @public
 *  @description Namespace containing Card contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Card
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
        /** @interface   CardOptions
         *  @public
         *  @description CardOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CardOptions
        {
            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string;

            /** @name        elevation
             *  @public
             *  @type        {0 | 1 | 2 | 3}
             *  @description Component member for elevation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            elevation?: 0 | 1 | 2 | 3;

            /** @name        interactive
             *  @public
             *  @type        {boolean}
             *  @description Component member for interactive.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            interactive?: boolean;
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

    /** @class       Card
     *  @public
     *  @description AriannA Card component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-card', {}, {
        Attributes: ['title', 'elevation', 'interactive'],
    })
    export class Card extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Card.Interfaces.CardOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.CardOptions = {})
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
            this.isInteractive = () => this.hasAttribute('interactive');
            this.onCardClick = () => {
                if (!this.isInteractive())
                    return;
                this.dispatchEvent(new CustomEvent('arianna:click', {
                    bubbles: true, detail: { source: this },
                }));
            };
            this.template = html `
            <header class="ar-card__header" a-if="this.hasTitle()">{{ this.titleText() }}</header>
            <header class="ar-card__header"><slot name="header"></slot></header>
            <section class="ar-card__body" @click="this.onCardClick"><slot></slot></section>
            <footer class="ar-card__footer"><slot name="footer"></slot></footer>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Card.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Card.DefaultSheet();
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

        /** @name        elevation
         *  @public
         *  @type        {number}
         *  @description Component member for elevation.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get elevation(): number { return parseInt(this.getAttribute('elevation') ?? '0', 10); }

        /** @name        elevation
         *  @public
         *  @type        {void}
         *  @description Component member for elevation.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set elevation(v: number) { this.setAttribute('elevation', String(v)); }

        /** @name        interactive
         *  @public
         *  @type        {boolean}
         *  @description Component member for interactive.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get interactive(): boolean { return this.hasAttribute('interactive'); }

        /** @name        interactive
         *  @public
         *  @type        {void}
         *  @description Component member for interactive.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set interactive(v: boolean) { v ? this.setAttribute('interactive', '') : this.removeAttribute('interactive'); }

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

        /** @name        isInteractive
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Interactive.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isInteractive: () => boolean = () => false;

        /** @name        onCardClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Card Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCardClick: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Card.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Card.Types.Stylesheet} Result.
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
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'block',
                    overflow: 'hidden',
                    padding: '0',
                }),
                new Rule(':host([elevation="1"])', { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }),
                new Rule(':host([elevation="2"])', { boxShadow: '0 2px 6px rgba(0,0,0,0.10)' }),
                new Rule(':host([elevation="3"])', { boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }),
                new Rule(':host([interactive])', { cursor: 'pointer', transition: 'transform 0.15s' }),
                new Rule(':host([interactive]):hover', { transform: 'translateY(-1px)' }),
                new Rule('.ar-card__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    fontWeight: '600',
                    padding: '10px 14px',
                }),
                new Rule('.ar-card__header:empty', { display: 'none' }),
                new Rule('.ar-card__body', { padding: '12px 14px' }),
                new Rule('.ar-card__footer', {
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '10px 14px',
                }),
                new Rule('.ar-card__footer:empty', { display: 'none' }),
            ]);
        }
    }
}
export default Card;

export type CardOptions = Card.Interfaces.CardOptions;
