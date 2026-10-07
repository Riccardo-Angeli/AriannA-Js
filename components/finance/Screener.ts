/**
 * @module    components/finance/Screener
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Screener component module.
 */


import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _fmt, _fmtK, _esc } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

import { MountFinanceTemplate } from './Base.ts';


/** @namespace   Screener
 *  @public
 *  @description Namespace containing Screener contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Screener
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
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ScreenerRow
         *  @public
         *  @description ScreenerRow contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ScreenerRow
        {
            /** @name        symbol
             *  @public
             *  @type        {string}
             *  @description Component member for symbol.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            symbol: string;

            /** @name        price
             *  @public
             *  @type        {number}
             *  @description Component member for price.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            price: number;

            /** @name        change
             *  @public
             *  @type        {number}
             *  @description Component member for change.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            change: number;

            /** @name        volume
             *  @public
             *  @type        {number}
             *  @description Component member for volume.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            volume: number;

            /** @name        marketCap
             *  @public
             *  @type        {number}
             *  @description Component member for market Cap.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            marketCap?: number;
            [key: string]: unknown;
        }

        /** @interface   ScreenerOptions
         *  @public
         *  @description ScreenerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ScreenerOptions
        {
            /** @name        rows
             *  @public
             *  @type        {Screener.Interfaces.ScreenerRow[]}
             *  @description Component member for rows.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rows?: Interfaces.ScreenerRow[];

            /** @name        columns
             *  @public
             *  @type        {(keyof Screener.Interfaces.ScreenerRow)[]}
             *  @description Component member for columns.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            columns?: (keyof Interfaces.ScreenerRow)[];
        }

        /** @interface   HeaderCell
         *  @public
         *  @description HeaderCell contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HeaderCell
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;
        }

        /** @interface   BodyCell
         *  @public
         *  @description BodyCell contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BodyCell
        {
            /** @name        html
             *  @public
             *  @type        {string}
             *  @description Component member for html.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            html: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }

        /** @interface   BodyRow
         *  @public
         *  @description BodyRow contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BodyRow
        {
            /** @name        cells
             *  @public
             *  @type        {Screener.Interfaces.BodyCell[]}
             *  @description Component member for cells.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cells: Interfaces.BodyCell[];
        }
    }
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

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @class       Screener
     *  @public
     *  @description AriannA Screener component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const Styles: Types.Stylesheet = (() =>
    {
            return new Stylesheet([
            new Rule('.Screener', {
                '--arianna-bg': '#17181c',
                '--arianna-bg-2': '#1d1e23',
                '--arianna-bg-3': '#24262b',
                '--arianna-text': '#e6e8eb',
                '--arianna-muted': '#9aa0aa',
                '--arianna-dim': '#6f7580',
                '--arianna-border': '#303238',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#26a69a',
                '--arianna-warning': '#f5a623',
                '--arianna-danger': '#ef5350',
                '--bg': '#17181c',
                '--bg3': '#24262b',
                '--text': '#e6e8eb',
                '--muted': '#9aa0aa',
                '--border': '#303238',
                '--accent': '#e40c88',
            }),
            new Rule('.Screener[theme="light"]', {
                '--arianna-bg': '#ffffff',
                '--arianna-bg-2': '#fbfbfc',
                '--arianna-bg-3': '#f3f3f5',
                '--arianna-text': '#1c1e21',
                '--arianna-muted': '#626873',
                '--arianna-dim': '#8a8f98',
                '--arianna-border': '#e2e2e6',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#168a78',
                '--arianna-warning': '#b66c00',
                '--arianna-danger': '#c93645',
                '--bg': '#ffffff',
                '--bg3': '#f3f3f5',
                '--text': '#1c1e21',
                '--muted': '#626873',
                '--border': '#e2e2e6',
                '--accent': '#e40c88',
            }),
                new Rule('.Screener', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    background: 'var(--arianna-bg, var(--bg, #fff))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    display: 'block',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    overflow: 'auto',
                }),
                new Rule('.Screener-Table', {
                    borderCollapse: 'collapse',
                    width: '100%',
                }),
                new Rule('.Screener-Header', {
                    borderBottom: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    color: 'var(--arianna-muted, var(--muted, #787b86))',
                    fontWeight: '500',
                    padding: '8px 12px',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize: '11px',
                }),
                new Rule('.Screener-Row', {
                    borderBottom: '1px solid var(--arianna-bg-3, var(--bg3, #f1f1f1))',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.Screener-Row:hover', {
                    background: 'var(--arianna-bg-3, var(--bg3, #f8f9fa))',
                }),
                new Rule('.Screener-Cell', { padding: '6px 12px' }),
                new Rule('.Screener-Cell-Symbol', {
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    fontWeight: '600',
                }),
                new Rule('.Screener-Cell-Number', { textAlign: 'right' }),
                new Rule('.Screener-Cell-Up', { color: 'var(--arianna-bull, #26a69a)' }),
                new Rule('.Screener-Cell-Down', { color: 'var(--arianna-bear, #ef5350)' }),
            ]);
        
    })();

    @Component('arianna-screener', Styles, {
        Shadow: false,
        Attributes: ['theme', 'rows', 'columns'],
        Properties: ['rows', 'columns'],
    })
    export class Screener extends HTMLDivElement
    {
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'Screener';
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
            this.classList.add('Screener');
        }

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        rows$
         *  @public
         *  @type        {Screener.Types.Signal<Screener.Interfaces.ScreenerRow[]>}
         *  @description Component member for rows$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _rowsSignal?: Types.Signal<Interfaces.ScreenerRow[]>;
        public get rows$(): Types.Signal<Interfaces.ScreenerRow[]>
        {
            this._rowsSignal ??= signal<Interfaces.ScreenerRow[]>([]);
            return this._rowsSignal;
        }
        /** @name        columns$
         *  @public
         *  @type        {Screener.Types.Signal<(keyof Screener.Interfaces.ScreenerRow)[]>}
         *  @description Component member for columns$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _columnsSignal?: Types.Signal<(keyof Interfaces.ScreenerRow)[]>;
        public get columns$(): Types.Signal<(keyof Interfaces.ScreenerRow)[]>
        {
            this._columnsSignal ??= signal<(keyof Interfaces.ScreenerRow)[]>(['symbol', 'price', 'change', 'volume']);
            return this._columnsSignal;
        }
        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Screener.Interfaces.ScreenerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ScreenerOptions = {})
        {
            this.classList.add('Screener');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(this.dataset.ariannaFolderReady === 'true') return;
            this.dataset.ariannaFolderReady = 'true';
            this.headerCells = (): Interfaces.HeaderCell[] => this.columns$.Get().map((c: any) => ({ label: String(c).toUpperCase() }));
            this.bodyRows = (): Interfaces.BodyRow[] => {
                /** @name        cols
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cols value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cols = this.columns$.Get();
                return this.rows$.Get().map((row: any) => ({
                    cells: cols.map((c: any) => this.formatCell(c, row[c])),
                }));
            };
            this.template = html `
            <table class="Screener-Table">
                <thead>
                    <tr>
                        <th class="Screener-Header" a-for="h in this.headerCells()">{{ h.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="Screener-Row" a-for="r in this.bodyRows()">
                        <td :class="cell.cls" a-for="cell in r.cells" a-html="cell.html"></td>
                    </tr>
                </tbody>
            </table>
        `;
            MountFinanceTemplate(this);
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Screener.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Styles;
        }

        /** @name        rows
         *  @public
         *  @type        {void}
         *  @description Component member for rows.
         *  @param       {Screener.Interfaces.ScreenerRow[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set rows(v: Interfaces.ScreenerRow[]) { this.rows$.Set(v ?? []); }

        /** @name        rows
         *  @public
         *  @type        {Screener.Interfaces.ScreenerRow[]}
         *  @description Component member for rows.
         *  @returns     {Screener.Interfaces.ScreenerRow[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get rows(): Interfaces.ScreenerRow[] { return this.rows$.Get(); }

        /** @name        columns
         *  @public
         *  @type        {void}
         *  @description Component member for columns.
         *  @param       {(keyof Screener.Interfaces.ScreenerRow)[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set columns(v: (keyof Interfaces.ScreenerRow)[]) { this.columns$.Set(v ?? []); }

        /** @name        columns
         *  @public
         *  @type        {(keyof Screener.Interfaces.ScreenerRow)[]}
         *  @description Component member for columns.
         *  @returns     {(keyof Screener.Interfaces.ScreenerRow)[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get columns(): (keyof Interfaces.ScreenerRow)[] { return this.columns$.Get(); }

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

        /** @name        formatCell
         *  @public
         *  @type        {Screener.Interfaces.BodyCell}
         *  @description Component member for format Cell.
         *  @param       {keyof Screener.Interfaces.ScreenerRow} col Parameter.
         *  @param       {unknown} raw Parameter.
         *  @returns     {Screener.Interfaces.BodyCell} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private formatCell(col: keyof Interfaces.ScreenerRow, raw: unknown): Interfaces.BodyCell
        {
            if (col === 'change')
            {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = Number(raw) || 0;

                /** @name        sign
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sign value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sign = n >= 0 ? '+' : '';
                return {
                    html: `${sign}${_fmt(n)}%`,
                    cls: 'Screener-Cell Screener-Cell-' + (n >= 0 ? 'up' : 'down'),
                };
            }
            if (col === 'symbol')
            {
                return {
                    html: _esc(String(raw ?? '')),
                    cls: 'Screener-Cell Screener-Cell-Symbol',
                };
            }
            if (typeof raw === 'number')
            {
                return { html: _fmtK(raw), cls: 'Screener-Cell Screener-Cell-Number' };
            }
            return { html: _esc(String(raw ?? '')), cls: 'Screener-Cell' };
        }

        /** @name        headerCells
         *  @private
         *  @type        {() => Screener.Interfaces.HeaderCell[]}
         *  @description Component member for header Cells.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private headerCells: () => Interfaces.HeaderCell[] = () => [];

        /** @name        bodyRows
         *  @private
         *  @type        {() => Screener.Interfaces.BodyRow[]}
         *  @description Component member for body Rows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private bodyRows: () => Interfaces.BodyRow[] = () => [];

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Screener.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Screener.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        public static readonly Styles = Styles;
        static DefaultSheet(): Types.Stylesheet { return Styles; }
    }
}
export default Screener;

export type ScreenerRow = Screener.Interfaces.ScreenerRow;
export type ScreenerOptions = Screener.Interfaces.ScreenerOptions;
