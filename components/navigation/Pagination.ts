/**
 * @module    components/navigation/Pagination
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Pagination component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Pagination
 *  @public
 *  @description Namespace containing Pagination contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Pagination
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
        /** @interface   PaginationOptions
         *  @public
         *  @description PaginationOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PaginationOptions
        {
            /** @name        total
             *  @public
             *  @type        {number}
             *  @description Component member for total.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            total?: number;

            /** @name        pageSize
             *  @public
             *  @type        {number}
             *  @description Component member for page Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pageSize?: number;

            /** @name        page
             *  @public
             *  @type        {number}
             *  @description Component member for page.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            page?: number;

            /** @name        siblings
             *  @public
             *  @type        {number}
             *  @description Component member for siblings.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            siblings?: number;
        }

        /** @interface   PagEntry
         *  @public
         *  @description PagEntry contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PagEntry
        {
            /** @name        type
             *  @public
             *  @type        {'btn' | 'dots'}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type: 'btn' | 'dots';

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        page
             *  @public
             *  @type        {number}
             *  @description Component member for page.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            page?: number;

            /** @name        active
             *  @public
             *  @type        {boolean}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active?: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
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

    /** @class       Pagination
     *  @public
     *  @description AriannA Pagination component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-pagination', {}, {
        Attributes: ['total', 'page-size', 'page', 'siblings'],
    })
    export class Pagination extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Pagination.Interfaces.PaginationOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.PaginationOptions = {})
        {
            this.setAttribute('role', 'navigation');
            this.setAttribute('aria-label', 'Pagination');

            /** @name        total
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned total value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const total = this.signal().attribute('total');

            /** @name        pageSize
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pageSize value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pageSize = this.signal().attribute('page-size');

            /** @name        page
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned page value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const page = this.signal().attribute('page');

            /** @name        siblings
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned siblings value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const siblings = this.signal().attribute('siblings');

            /** @name        totalPages
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned totalPages value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const totalPages = (): number => Math.ceil((parseInt(total.Get() ?? '0', 10) || 0) /
                (parseInt(pageSize.Get() ?? '10', 10) || 10));

            /** @name        currentPage
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned currentPage value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const currentPage = (): number => Math.max(1, parseInt(page.Get() ?? '1', 10) || 1);

            /** @name        sibs
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sibs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sibs = (): number => parseInt(siblings.Get() ?? '1', 10) || 1;
            this.hasPages = () => totalPages() > 1;
            this.entries = () => {
                /** @name        tp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tp = totalPages();

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = currentPage();

                /** @name        sib
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sib value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sib = sibs();

                /** @name        out
                 *  @public
                 *  @type        {Pagination.Interfaces.PagEntry[]}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Interfaces.PagEntry[] = [];
                // Previous
                out.push({ type: 'btn', label: '‹', page: cur - 1, disabled: cur <= 1 });

                /** @name        start
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned start value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const start = Math.max(1, cur - sib);

                /** @name        end
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned end value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const end = Math.min(tp, cur + sib);
                if (start > 1)
                {
                    out.push({ type: 'btn', label: '1', page: 1 });
                    if (start > 2)
                        out.push({ type: 'dots', label: '…' });
                }
                for (let p = start; p <= end; p++)
                {
                    out.push({ type: 'btn', label: String(p), page: p, active: p === cur });
                }
                if (end < tp)
                {
                    if (end < tp - 1)
                        out.push({ type: 'dots', label: '…' });
                    out.push({ type: 'btn', label: String(tp), page: tp });
                }
                // Next
                out.push({ type: 'btn', label: '›', page: cur + 1, disabled: cur >= tp });
                return out;
            };
            this.isBtn = (e: Interfaces.PagEntry) => e.type === 'btn';
            this.isDots = (e: Interfaces.PagEntry) => e.type === 'dots';
            this.btnClass = (e: Interfaces.PagEntry) => 'ar-pagination__btn' + (e.active ? ' ar-pagination__btn--active' : '');
            this.onGo = (target: number) => {
                /** @name        tp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tp = totalPages();
                if (target < 1 || target > tp)
                    return;
                this.setAttribute('page', String(target));
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { page: target, totalPages: tp },
                }));
            };
            this.template = html `
            <div a-if="this.hasPages()" class="ar-pagination__row">
                <button a-for="e in this.entries()"
                        a-if="this.isBtn(e)"
                        :class="this.btnClass(e)"
                        :disabled="e.disabled"
                        @click="(_) => this.onGo(e.page)">{{ e.label }}</button>
                <span a-for="e in this.entries()"
                      a-if="this.isDots(e)"
                      class="ar-pagination__dots">{{ e.label }}</span>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Pagination.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Pagination.DefaultSheet();
        }

        /** @name        totalPages
         *  @public
         *  @type        {number}
         *  @description Component member for total Pages.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get totalPages(): number
        {
            /** @name        t
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned t value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const t = parseInt(this.getAttribute('total') ?? '0', 10) || 0;

            /** @name        ps
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ps value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ps = parseInt(this.getAttribute('page-size') ?? '10', 10) || 10;
            return Math.ceil(t / ps);
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

        /** @name        total
         *  @public
         *  @type        {number}
         *  @description Component member for total.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get total(): number { return parseInt(this.getAttribute('total') ?? '0', 10); }

        /** @name        total
         *  @public
         *  @type        {void}
         *  @description Component member for total.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set total(v: number) { this.setAttribute('total', String(v)); }

        /** @name        pageSize
         *  @public
         *  @type        {number}
         *  @description Component member for page Size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get pageSize(): number { return parseInt(this.getAttribute('page-size') ?? '10', 10); }

        /** @name        pageSize
         *  @public
         *  @type        {void}
         *  @description Component member for page Size.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set pageSize(v: number) { this.setAttribute('page-size', String(v)); }

        /** @name        page
         *  @public
         *  @type        {number}
         *  @description Component member for page.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get page(): number { return parseInt(this.getAttribute('page') ?? '1', 10); }

        /** @name        page
         *  @public
         *  @type        {void}
         *  @description Component member for page.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set page(v: number) { this.setAttribute('page', String(v)); }

        /** @name        siblings
         *  @public
         *  @type        {number}
         *  @description Component member for siblings.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get siblings(): number { return parseInt(this.getAttribute('siblings') ?? '1', 10); }

        /** @name        siblings
         *  @public
         *  @type        {void}
         *  @description Component member for siblings.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set siblings(v: number) { this.setAttribute('siblings', String(v)); }

        /** @name        hasPages
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Pages.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasPages: () => boolean = () => false;

        /** @name        entries
         *  @private
         *  @type        {() => Pagination.Interfaces.PagEntry[]}
         *  @description Component member for entries.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private entries: () => Interfaces.PagEntry[] = () => [];

        /** @name        isBtn
         *  @private
         *  @type        {(e: Pagination.Interfaces.PagEntry) => boolean}
         *  @description Component member for is Btn.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isBtn: (e: Interfaces.PagEntry) => boolean = () => false;

        /** @name        isDots
         *  @private
         *  @type        {(e: Pagination.Interfaces.PagEntry) => boolean}
         *  @description Component member for is Dots.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDots: (e: Interfaces.PagEntry) => boolean = () => false;

        /** @name        btnClass
         *  @private
         *  @type        {(e: Pagination.Interfaces.PagEntry) => string}
         *  @description Component member for btn Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private btnClass: (e: Interfaces.PagEntry) => string = () => '';

        /** @name        onGo
         *  @private
         *  @type        {(n: number) => void}
         *  @description Component member for on Go.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onGo: (n: number) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Pagination.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Pagination.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-pagination__row', { display: 'flex', alignItems: 'center', gap: '4px' }),
                new Rule('.ar-pagination__btn', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    minWidth: '32px',
                    padding: '4px 8px',
                    transition: 'border-color 0.18s ease',
                }),
                new Rule('.ar-pagination__btn:hover:not(:disabled)', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-pagination__btn--active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#ffffff',
                }),
                new Rule('.ar-pagination__btn:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
                new Rule('.ar-pagination__dots', {
                    color: 'var(--arianna-muted, #8b949e)',
                    padding: '0 4px',
                }),
            ]);
        }
    }
}
export default Pagination;
