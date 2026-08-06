/**
 * @module    components/layout/Panel
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Panel component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

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
    @Component('arianna-panel', {}, {
        Attributes: ['title', 'collapsible', 'collapsed'],
    })
    export class Panel extends HTMLElement
    {
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
            this.isCollapsible = () => this.hasAttribute('collapsible');
            this.isCollapsed = () => this.hasAttribute('collapsed');
            this.hasHeader = () => this.hasTitle() || this.isCollapsible();
            this.toggleIcon = () => this.isCollapsed() ? '▸' : '▾';
            this.onToggle = () => {
                /** @name        wasCollapsed
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned wasCollapsed value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const wasCollapsed = this.isCollapsed();
                if (wasCollapsed)
                    this.removeAttribute('collapsed');
                else
                    this.setAttribute('collapsed', '');
                this.dispatchEvent(new CustomEvent('arianna:toggle', {
                    bubbles: true, detail: { collapsed: !wasCollapsed },
                }));
            };
            this.template = html `
            <div class="ar-panel__header" a-if="this.hasHeader()">
                <span class="ar-panel__title" a-if="this.hasTitle()">{{ this.titleText() }}</span>
                <div class="ar-panel__toolbar"><slot name="toolbar"></slot></div>
                <button class="ar-panel__toggle"
                        a-if="this.isCollapsible()"
                        @click="this.onToggle">{{ this.toggleIcon() }}</button>
            </div>
            <div class="ar-panel__body" a-if="!this.isCollapsed()">
                <slot></slot>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Panel.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Panel.DefaultSheet();
        }

        /** Programmatically toggle collapse state. */
        toggle(): void { this.onToggle(); }

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
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'block',
                    overflow: 'hidden',
                }),
                new Rule('.ar-panel__header', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'flex',
                    gap: '8px',
                    padding: '8px 14px',
                }),
                new Rule('.ar-panel__title', { flex: '1', fontSize: '0.85rem', fontWeight: '600' }),
                new Rule('.ar-panel__toolbar', { display: 'flex', gap: '6px', alignItems: 'center' }),
                new Rule('.ar-panel__toolbar:empty', { display: 'none' }),
                new Rule('.ar-panel__toggle', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-muted, #8b949e)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '2px',
                }),
                new Rule('.ar-panel__body', { padding: '14px' }),
            ]);
        }
    }
}
export default Panel;

export type PanelOptions = Panel.Interfaces.PanelOptions;
