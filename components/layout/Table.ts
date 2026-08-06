/**
 * @module    components/layout/Table
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Table component module.
 */

import { Component, Css, Reactivity, SSR, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Table
 *  @public
 *  @description Namespace containing Table contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Table
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
        // ── Types ────────────────────────────────────────────────────────────────────
        /** @name        Row
         *  @public
         *  @type        {Record<string, unknown>}
         *  @description Type alias for Row.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Row = Record<string, unknown>;

        /** @name        SortDir
         *  @public
         *  @type        {'asc' | 'desc'}
         *  @description Type alias for SortDir.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SortDir = 'asc' | 'desc';

        /** @name        SelectMode
         *  @public
         *  @type        {'none' | 'single' | 'multi'}
         *  @description Type alias for SelectMode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SelectMode = 'none' | 'single' | 'multi';

        /** @name        Fetcher
         *  @public
         *  @type        {(params: Table.Interfaces.FetchParams) => Promise<Table.Interfaces.FetchResult>}
         *  @description Type alias for Fetcher.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Fetcher = (params: Interfaces.FetchParams) => Promise<Interfaces.FetchResult>;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   TableColumn
         *  @public
         *  @description TableColumn contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TableColumn<R = Types.Row>
        {
            /** @name        key
             *  @public
             *  @type        {string}
             *  @description Component member for key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            key: string;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        width
             *  @public
             *  @type        {number | string}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: number | string;

            /** @name        minWidth
             *  @public
             *  @type        {number}
             *  @description Component member for min Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minWidth?: number;

            /** @name        sortable
             *  @public
             *  @type        {boolean}
             *  @description Component member for sortable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sortable?: boolean;

            /** @name        resizable
             *  @public
             *  @type        {boolean}
             *  @description Component member for resizable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            resizable?: boolean;

            /** @name        visible
             *  @public
             *  @type        {boolean}
             *  @description Component member for visible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            visible?: boolean;

            /** @name        align
             *  @public
             *  @type        {'left' | 'center' | 'right'}
             *  @description Component member for align.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            align?: 'left' | 'center' | 'right';

            /** @name        render
             *  @public
             *  @type        {(value: unknown, row: R, col: Table.Interfaces.TableColumn<R>) => string}
             *  @description Component member for render.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            render?: (value: unknown, row: R, col: Interfaces.TableColumn<R>) => string;

            /** @name        value
             *  @public
             *  @type        {(row: R) => unknown}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: (row: R) => unknown;

            /** @name        sort
             *  @public
             *  @type        {(a: R, b: R, dir: Table.Types.SortDir) => number}
             *  @description Component member for sort.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sort?: (a: R, b: R, dir: Types.SortDir) => number;

            /** @name        class
             *  @public
             *  @type        {string}
             *  @description Component member for class.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            class?: string;

            /** @name        headerClass
             *  @public
             *  @type        {string}
             *  @description Component member for header Class.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            headerClass?: string;
        }

        /** @interface   SortState
         *  @public
         *  @description SortState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SortState
        {
            /** @name        key
             *  @public
             *  @type        {string}
             *  @description Component member for key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            key: string;

            /** @name        dir
             *  @public
             *  @type        {Table.Types.SortDir}
             *  @description Component member for dir.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dir: Types.SortDir;
        }

        /** @interface   FetchParams
         *  @public
         *  @description FetchParams contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FetchParams
        {
            /** @name        page
             *  @public
             *  @type        {number}
             *  @description Component member for page.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            page: number;

            /** @name        pageSize
             *  @public
             *  @type        {number}
             *  @description Component member for page Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pageSize: number;

            /** @name        sort
             *  @public
             *  @type        {Table.Interfaces.SortState[]}
             *  @description Component member for sort.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sort: Interfaces.SortState[];

            /** @name        query
             *  @public
             *  @type        {string}
             *  @description Component member for query.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            query: string;
        }

        /** @interface   FetchResult
         *  @public
         *  @description FetchResult contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FetchResult
        {
            /** @name        rows
             *  @public
             *  @type        {Table.Types.Row[]}
             *  @description Component member for rows.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rows: Types.Row[];

            /** @name        total
             *  @public
             *  @type        {number}
             *  @description Component member for total.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            total: number;
        }

        /** @interface   TableOptions
         *  @public
         *  @description TableOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TableOptions
        {
            /** @name        columns
             *  @public
             *  @type        {Table.Interfaces.TableColumn[]}
             *  @description Component member for columns.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            columns?: Interfaces.TableColumn[];

            /** @name        rows
             *  @public
             *  @type        {Table.Types.Row[]}
             *  @description Component member for rows.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rows?: Types.Row[];

            /** @name        pageSize
             *  @public
             *  @type        {number}
             *  @description Component member for page Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pageSize?: number;

            /** @name        selectable
             *  @public
             *  @type        {Table.Types.SelectMode}
             *  @description Component member for selectable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selectable?: Types.SelectMode;

            /** @name        searchable
             *  @public
             *  @type        {boolean}
             *  @description Component member for searchable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            searchable?: boolean;

            /** @name        stickyHeader
             *  @public
             *  @type        {boolean}
             *  @description Component member for sticky Header.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            stickyHeader?: boolean;

            /** @name        columnToggle
             *  @public
             *  @type        {boolean}
             *  @description Component member for column Toggle.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            columnToggle?: boolean;

            /** @name        columnResize
             *  @public
             *  @type        {boolean}
             *  @description Component member for column Resize.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            columnResize?: boolean;

            /** @name        worker
             *  @public
             *  @type        {boolean}
             *  @description Component member for worker.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            worker?: boolean;

            /** @name        workerThreshold
             *  @public
             *  @type        {number}
             *  @description Component member for worker Threshold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            workerThreshold?: number;

            /** @name        cacheSize
             *  @public
             *  @type        {number}
             *  @description Component member for cache Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cacheSize?: number;

            /** @name        fetcher
             *  @public
             *  @type        {Table.Types.Fetcher}
             *  @description Component member for fetcher.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            fetcher?: Types.Fetcher;
        }
        // ── Internal types ──────────────────────────────────────────────────────────
        /** @interface   DisplayRow
         *  @public
         *  @description DisplayRow contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DisplayRow
        {
            /** @name        raw
             *  @public
             *  @type        {Table.Types.Row}
             *  @description Component member for raw.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            raw: Types.Row;

            /** @name        index
             *  @public
             *  @type        {number}
             *  @description Component member for index.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            index: number;

            /** @name        selected
             *  @public
             *  @type        {boolean}
             *  @description Component member for selected.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selected: boolean;

            /** @name        rowClass
             *  @public
             *  @type        {string}
             *  @description Component member for row Class.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rowClass: string;

            /** @name        cells
             *  @public
             *  @type        {Array<{
                html: string;
                cellClass: string;
                style: string;
            }>}
             *  @description Component member for cells.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cells: Array<{
                /** @name        html
                 *  @public
                 *  @type        {string}
                 *  @description Component member for html.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                html: string;

                /** @name        cellClass
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cell Class.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cellClass: string;

                /** @name        style
                 *  @public
                 *  @type        {string}
                 *  @description Component member for style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                style: string;
            }>;
        }

        /** @interface   HeaderCell
         *  @public
         *  @description HeaderCell contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HeaderCell
        {
            /** @name        col
             *  @public
             *  @type        {Table.Interfaces.TableColumn}
             *  @description Component member for col.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            col: Interfaces.TableColumn;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        isSorted
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Sorted.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isSorted: boolean;

            /** @name        sortIcon
             *  @public
             *  @type        {string}
             *  @description Component member for sort Icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sortIcon: string;

            /** @name        sortOrder
             *  @public
             *  @type        {string}
             *  @description Component member for sort Order.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sortOrder: string;

            /** @name        headerCls
             *  @public
             *  @type        {string}
             *  @description Component member for header Cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            headerCls: string;

            /** @name        style
             *  @public
             *  @type        {string}
             *  @description Component member for style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style: string;

            /** @name        sortable
             *  @public
             *  @type        {boolean}
             *  @description Component member for sortable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sortable: boolean;

            /** @name        resizable
             *  @public
             *  @type        {boolean}
             *  @description Component member for resizable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            resizable: boolean;
        }

        /** @interface   PageBtn
         *  @public
         *  @description PageBtn contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PageBtn
        {
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
            page: number;

            /** @name        active
             *  @public
             *  @type        {boolean}
             *  @description Component member for active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            active: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled: boolean;

            /** @name        isDots
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Dots.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isDots: boolean;
        }

        /** @interface   ColToggleEntry
         *  @public
         *  @description ColToggleEntry contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ColToggleEntry
        {
            /** @name        col
             *  @public
             *  @type        {Table.Interfaces.TableColumn}
             *  @description Component member for col.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            col: Interfaces.TableColumn;

            /** @name        visible
             *  @public
             *  @type        {boolean}
             *  @description Component member for visible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            visible: boolean;
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
    // ── Helpers ─────────────────────────────────────────────────────────────────
    /** Escape CSV cell — wrap in quotes if needed, double internal quotes. */
    export function csvCell(v: unknown): string {
        /** @name        s
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned s value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const s = String(v ?? '');
        if (/[",\n\r]/.test(s))
            return '"' + s.replace(/"/g, '""') + '"';
        return s;
    }

    /** Tiny LRU cache (Map preserves insertion order). */
    export class LRU<K, V>
    {
        /** @name        #map
         *  @public
         *  @type        {Map<K, V>}
         *  @description Component member for map.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #map: Map<K, V> = new Map();

        /** @name        #capacity
         *  @public
         *  @type        {number}
         *  @description Component member for capacity.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #capacity: number;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {number} capacity Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(capacity: number = 32) { this.#capacity = capacity; }

        /** @name        get
         *  @public
         *  @type        {V | undefined}
         *  @description Component member for get.
         *  @param       {K} key Parameter.
         *  @returns     {V | undefined} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get(key: K): V | undefined
        {
            if (!this.#map.has(key))
                return undefined;

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.#map.get(key)!;
            this.#map.delete(key);
            this.#map.set(key, v);
            return v;
        }

        /** @name        set
         *  @public
         *  @type        {void}
         *  @description Component member for set.
         *  @param       {K} key Parameter.
         *  @param       {V} value Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set(key: K, value: V): void
        {
            if (this.#map.has(key))
                this.#map.delete(key);
            else if (this.#map.size >= this.#capacity)
            {
                /** @name        first
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned first value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const first = this.#map.keys().next().value;
                if (first !== undefined)
                    this.#map.delete(first);
            }
            this.#map.set(key, value);
        }

        /** @name        clear
         *  @public
         *  @type        {void}
         *  @description Component member for clear.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clear(): void { this.#map.clear(); }

        /** @name        size
         *  @public
         *  @type        {number}
         *  @description Component member for size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): number { return this.#map.size; }
    }

    /** Body of the Web Worker — stringified at runtime. Pure data: no DOM, no
     *  app-side closures (custom sort/value/render functions can't ride the
     *  worker, so we fall back to the main-thread path for those columns). */
    export const WORKER_BODY = `
self.onmessage = (e) => {
    const { rows, query, sort, columns } = e.data;
    let filtered = rows;
    if (query)
    {
        const q = query.toLowerCase();
        filtered = rows.filter(r => columns.some(c => {
            const v = r[c.key];
            return String(v ?? '').toLowerCase().includes(q);
        }));
    }
    if (sort && sort.length)
    {
        filtered = filtered.slice().sort((a, b) => {
            for (const s of sort)
            {
                const av = a[s.key], bv = b[s.key];
                if (av === bv) continue;
                const cmp = (av < bv) ? -1 : 1;
                return s.dir === 'asc' ? cmp : -cmp;
            }
            return 0;
        });
    }
    self.postMessage({ rows: filtered, total: filtered.length });
};
`;

    /** @name        WORKER_URL
     *  @public
     *  @type        {string | null}
     *  @description Namespace-owned WORKER_URL value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let WORKER_URL: string | null = null;
    export function getWorkerUrl(): string {
        if (WORKER_URL)
            return WORKER_URL;

        /** @name        blob
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned blob value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const blob = new Blob([WORKER_BODY], { type: 'application/javascript' });
        WORKER_URL = URL.createObjectURL(blob);
        return WORKER_URL;
    }

    /** @name        CsvCell
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned CsvCell value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function CsvCell
    (
        ...args: Parameters<typeof csvCell>
    ): ReturnType<typeof csvCell>
    {
        return csvCell(...args);
    }
    /** @name        GetWorkerUrl
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned GetWorkerUrl value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function GetWorkerUrl
    (
        ...args: Parameters<typeof getWorkerUrl>
    ): ReturnType<typeof getWorkerUrl>
    {
        return getWorkerUrl(...args);
    }
    // ── Table component ─────────────────────────────────────────────────────────
    /** @class       Table
     *  @public
     *  @description AriannA Table component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-table', {}, {
        Attributes: [
            'page-size', 'selectable', 'searchable', 'sticky-header',
            'column-toggle', 'column-resize', 'worker', 'worker-threshold',
        ],
    })
    export class Table extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;
        // ── Reactive state ──────────────────────────────────────────────────────
        /** @name        columns$
         *  @public
         *  @type        {Table.Types.Signal<Table.Interfaces.TableColumn[]>}
         *  @description Component member for columns$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        columns$: Types.Signal<Interfaces.TableColumn[]> = signal<Interfaces.TableColumn[]>([]);

        /** @name        rows$
         *  @public
         *  @type        {Table.Types.Signal<Table.Types.Row[]>}
         *  @description Component member for rows$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        rows$: Types.Signal<Types.Row[]> = signal<Types.Row[]>([]);

        /** Computed display rows (filtered + sorted + paged). Recomputed eagerly
         *  on input change AND on async worker / fetcher result. */
        displayRows$: Types.Signal<Interfaces.DisplayRow[]> = signal<Interfaces.DisplayRow[]>([]);

        /** @name        totalCount$
         *  @public
         *  @type        {Table.Types.Signal<number>}
         *  @description Component member for total Count$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        totalCount$: Types.Signal<number> = signal<number>(0);

        /** @name        selected$
         *  @public
         *  @type        {Table.Types.Signal<Set<number>>}
         *  @description Component member for selected$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected$: Types.Signal<Set<number>> = signal<Set<number>>(new Set());

        /** Multi-column sort stack: most-recently-added LAST. */
        sortStack$: Types.Signal<Interfaces.SortState[]> = signal<Interfaces.SortState[]>([]);

        /** @name        query$
         *  @public
         *  @type        {Table.Types.Signal<string>}
         *  @description Component member for query$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        query$: Types.Signal<string> = signal<string>('');

        /** @name        page$
         *  @public
         *  @type        {Table.Types.Signal<number>}
         *  @description Component member for page$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        page$: Types.Signal<number> = signal<number>(1);

        /** @name        loading$
         *  @public
         *  @type        {Table.Types.Signal<boolean>}
         *  @description Component member for loading$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        loading$: Types.Signal<boolean> = signal<boolean>(false);

        /** Column visibility map. Keys NOT in this map default to visible. */
        visibility$: Types.Signal<Record<string, boolean>> = signal<Record<string, boolean>>({});

        /** Column widths overridden by user resize. */
        widthsOverride$: Types.Signal<Record<string, number>> = signal<Record<string, number>>({});

        /** Toggle menu open state. */
        toggleOpen$: Types.Signal<boolean> = signal<boolean>(false);
        // ── Internals ───────────────────────────────────────────────────────────
        /** @name        #fetcher
         *  @public
         *  @type        {Table.Types.Fetcher | null}
         *  @description Component member for fetcher.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fetcher: Types.Fetcher | null = null;

        /** @name        #cache
         *  @public
         *  @type        {Table.LRU<string, Table.Interfaces.FetchResult>}
         *  @description Component member for cache.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #cache: LRU<string, Interfaces.FetchResult>;

        /** @name        #worker
         *  @public
         *  @type        {Worker | null}
         *  @description Component member for worker.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #worker: Worker | null = null;

        /** @name        #lastSearchTimer
         *  @public
         *  @type        {unknown}
         *  @description Component member for last Search Timer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #lastSearchTimer = 0;

        /** @name        #recomputeTimer
         *  @public
         *  @type        {unknown}
         *  @description Component member for recompute Timer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #recomputeTimer = 0;

        /** @name        #toggleOutside
         *  @public
         *  @type        {((e: Event) => void) | null}
         *  @description Component member for toggle Outside.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #toggleOutside: ((e: Event) => void) | null = null;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor()
        {
            super();
            this.#cache = new LRU<string, Interfaces.FetchResult>(32);
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Table.Interfaces.TableOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.TableOptions = {})
        {
            this.setAttribute('role', 'grid');
            // Computed columns: filter out hidden ones for rendering purposes.
            /** @name        visibleCols
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned visibleCols value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const visibleCols = (): Interfaces.TableColumn[] => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = this.visibility$.Get();
                return this.columns$.Get().filter((c: any) => v[c.key] !== false && c.visible !== false);
            };
            this.headers = (): Interfaces.HeaderCell[] => {
                /** @name        stack
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned stack value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const stack = this.sortStack$.Get();

                /** @name        widths
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned widths value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const widths = this.widthsOverride$.Get();
                return visibleCols().map(col => {
                    /** @name        sortable
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sortable value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sortable = !!col.sortable;

                    /** @name        resizable
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned resizable value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const resizable = col.resizable !== false && this.hasColumnResize();

                    /** @name        sIdx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sIdx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sIdx = stack.findIndex((s: any) => s.key === col.key);

                    /** @name        isSorted
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned isSorted value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const isSorted = sIdx >= 0;

                    /** @name        dir
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned dir value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const dir = isSorted ? stack[sIdx].dir : null;

                    /** @name        order
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned order value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const order = (isSorted && stack.length > 1) ? String(sIdx + 1) : '';

                    /** @name        override
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned override value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const override = widths[col.key];

                    /** @name        w
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned w value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const w = override !== undefined ? override + 'px'
                        : col.width !== undefined ? (typeof col.width === 'number' ? col.width + 'px' : col.width)
                            : '';

                    /** @name        styleParts
                     *  @public
                     *  @type        {string[]}
                     *  @description Namespace-owned styleParts value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const styleParts: string[] = [];
                    if (w)
                        styleParts.push(`width: ${w}`);
                    if (col.align)
                        styleParts.push(`text-align: ${col.align}`);
                    return {
                        col,
                        label: col.label,
                        isSorted,
                        sortIcon: isSorted ? (dir === 'asc' ? '▲' : '▼') : '',
                        sortOrder: order,
                        headerCls: 'ar-table__th'
                            + (sortable ? ' ar-table__th--sortable' : '')
                            + (isSorted ? ' ar-table__th--sorted' : '')
                            + (resizable ? ' ar-table__th--resizable' : '')
                            + (col.headerClass ? ' ' + col.headerClass : ''),
                        style: styleParts.join('; '),
                        sortable,
                        resizable,
                    };
                });
            };
            // Pagination buttons — based on totalCount$ which is either local
            // filtered count (client mode) or server total (fetcher mode).
            this.totalPages = (): number => {
                /** @name        ps
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ps value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ps = this.pageSize;
                if (ps <= 0)
                    return 1;
                return Math.max(1, Math.ceil(this.totalCount$.Get() / ps));
            };
            this.pageButtons = (): Interfaces.PageBtn[] => {
                /** @name        tp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tp = this.totalPages();

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.page$.Get();

                /** @name        out
                 *  @public
                 *  @type        {Table.Interfaces.PageBtn[]}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Interfaces.PageBtn[] = [];
                out.push({ label: '‹', page: cur - 1, active: false, disabled: cur <= 1, isDots: false });

                /** @name        start
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned start value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const start = Math.max(1, cur - 1);

                /** @name        end
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned end value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const end = Math.min(tp, cur + 1);
                if (start > 1)
                {
                    out.push({ label: '1', page: 1, active: cur === 1, disabled: false, isDots: false });
                    if (start > 2)
                        out.push({ label: '…', page: 0, active: false, disabled: true, isDots: true });
                }
                for (let p = start; p <= end; p++)
                {
                    out.push({ label: String(p), page: p, active: p === cur, disabled: false, isDots: false });
                }
                if (end < tp)
                {
                    if (end < tp - 1)
                        out.push({ label: '…', page: 0, active: false, disabled: true, isDots: true });
                    out.push({ label: String(tp), page: tp, active: cur === tp, disabled: false, isDots: false });
                }
                out.push({ label: '›', page: cur + 1, active: false, disabled: cur >= tp, isDots: false });
                return out;
            };
            // ── Column toggle menu ──────────────────────────────────────────────
            this.columnEntries = (): Interfaces.ColToggleEntry[] => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = this.visibility$.Get();
                return this.columns$.Get().map((col: any) => ({
                    col,
                    visible: v[col.key] !== false && col.visible !== false,
                }));
            };
            // ── Other reactive helpers ──────────────────────────────────────────
            this.allRows = () => this.displayRows$.Get();
            this.hasMultiplePages = () => this.totalPages() > 1;
            this.hasColumnToggle = () => this.hasAttribute('column-toggle');
            this.hasColumnResize = () => this.getAttribute('column-resize') !== 'false';
            this.toggleMenuOpen = () => this.toggleOpen$.Get();
            this.isSelectable = () => {
                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = this.getAttribute('selectable');
                return m !== null && m !== 'none';
            };
            this.isMultiSelect = () => this.getAttribute('selectable') === 'multi';
            this.isSearchable = () => this.hasAttribute('searchable');
            this.isLoading = () => this.loading$.Get();
            this.totalLabel = () => {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = this.totalCount$.Get();
                return t === 1 ? '1 row' : `${t} rows`;
            };
            // ── Event handlers ──────────────────────────────────────────────────
            this.onHeaderClick = (col: Interfaces.TableColumn, e: Event) => {
                if (!col.sortable)
                    return;

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;

                /** @name        stack
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned stack value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const stack = [...this.sortStack$.Get()];

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = stack.findIndex(s => s.key === col.key);
                if (me.shiftKey)
                {
                    // Multi-col sort: cycle this column without dropping others
                    if (idx >= 0)
                    {
                        if (stack[idx].dir === 'asc')
                            stack[idx] = { ...stack[idx], dir: 'desc' };
                        else
                            stack.splice(idx, 1);
                    }
                    else
                    {
                        stack.push({ key: col.key, dir: 'asc' });
                    }
                }
                else
                {
                    // Single-col: cycle through asc → desc → off
                    if (idx >= 0 && stack.length === 1)
                    {
                        if (stack[0].dir === 'asc')
                            stack[0] = { key: col.key, dir: 'desc' };
                        else
                            stack.length = 0;
                    }
                    else
                    {
                        stack.length = 0;
                        stack.push({ key: col.key, dir: 'asc' });
                    }
                }
                this.sortStack$.Set(stack);
                this.page$.Set(1);
                this.dispatchEvent(new CustomEvent('arianna:sort', {
                    bubbles: true, detail: { sorts: stack },
                }));
                this.#recompute();
            };
            this.onSearchInput = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value;
                clearTimeout(this.#lastSearchTimer);
                this.#lastSearchTimer = window.setTimeout(() => {
                    this.query$.Set(v);
                    this.page$.Set(1);
                    this.dispatchEvent(new CustomEvent('arianna:search', {
                        bubbles: true, detail: { query: v },
                    }));
                    this.#recompute();
                }, 200);
            };
            this.onRowClick = (dr: Interfaces.DisplayRow, e: Event) => {
                if (!this.isSelectable())
                    return;

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = new Set(this.selected$.Get());
                if (this.isMultiSelect())
                {
                    if (me.shiftKey && cur.size > 0)
                    {
                        // Range select from last → this index
                        /** @name        last
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned last value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const last = Math.max(...Array.from(cur as Set<number>));

                        /** @name        lo
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned lo value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const lo = Math.min(last, dr.index);

                        /** @name        hi
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned hi value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const hi = Math.max(last, dr.index);
                        for (let i = lo; i <= hi; i++)
                            cur.add(i);
                    }
                    else if (me.ctrlKey || me.metaKey)
                    {
                        if (cur.has(dr.index))
                            cur.delete(dr.index);
                        else
                            cur.add(dr.index);
                    }
                    else
                    {
                        cur.clear();
                        cur.add(dr.index);
                    }
                }
                else
                {
                    cur.clear();
                    cur.add(dr.index);
                }
                this.selected$.Set(cur);

                /** @name        selectedRows
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned selectedRows value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const selectedRows = [...cur].map(i => this.rows$.Get()[i]).filter(r => r !== undefined);
                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true, detail: { rows: selectedRows, indices: [...cur] },
                }));
                this.#recompute();
            };
            this.onPageClick = (btn: Interfaces.PageBtn) => {
                if (btn.disabled || btn.isDots)
                    return;
                this.page$.Set(btn.page);
                this.dispatchEvent(new CustomEvent('arianna:page', {
                    bubbles: true, detail: { page: btn.page },
                }));
                this.#recompute();
            };
            this.onToggleMenu = (e: Event) => {
                e.stopPropagation();

                /** @name        wasOpen
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned wasOpen value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const wasOpen = this.toggleOpen$.Get();
                this.toggleOpen$.Set(!wasOpen);
                if (!wasOpen)
                {
                    this.#toggleOutside = (ev: Event) => {
                        if (!this.contains(ev.target as Node))
                            this.toggleOpen$.Set(false);
                    };
                    setTimeout(() => document.addEventListener('click', this.#toggleOutside!), 0);
                }
                else if (this.#toggleOutside)
                {
                    document.removeEventListener('click', this.#toggleOutside);
                    this.#toggleOutside = null;
                }
            };
            this.onColumnToggle = (key: string, visible: boolean) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = { ...this.visibility$.Get(), [key]: visible };
                this.visibility$.Set(v);
                this.dispatchEvent(new CustomEvent('arianna:toggle-column', {
                    bubbles: true, detail: { key, visible },
                }));
            };
            this.onResizeStart = (col: Interfaces.TableColumn, e: Event) => {
                if (!this.hasColumnResize() || col.resizable === false)
                    return;
                e.preventDefault();
                e.stopPropagation();

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;

                /** @name        th
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned th value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const th = (me.currentTarget as HTMLElement).closest<HTMLElement>('.ar-table__th');
                if (!th)
                    return;

                /** @name        startX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned startX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const startX = me.clientX;

                /** @name        startW
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned startW value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const startW = th.offsetWidth;

                /** @name        minW
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned minW value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const minW = col.minWidth ?? 50;

                /** @name        onMove
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onMove value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onMove = (mv: MouseEvent) => {
                    /** @name        newW
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned newW value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const newW = Math.max(minW, startW + (mv.clientX - startX));

                    /** @name        widths
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned widths value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const widths = { ...this.widthsOverride$.Get(), [col.key]: newW };
                    this.widthsOverride$.Set(widths);
                };

                /** @name        onUp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onUp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';

                    /** @name        w
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned w value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const w = this.widthsOverride$.Get()[col.key];
                    this.dispatchEvent(new CustomEvent('arianna:resize-column', {
                        bubbles: true, detail: { key: col.key, width: w },
                    }));
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
            };
            this.onExportCsv = () => this.exportCSV();
            // ── Template ────────────────────────────────────────────────────────
            this.template = html `
            <div class="ar-table__toolbar" a-if="this.isSearchable() || this.hasColumnToggle()">
                <input class="ar-table__search"
                       a-if="this.isSearchable()"
                       type="text"
                       placeholder="Search…"
                       aria-label="Search rows"
                       @input="this.onSearchInput"/>
                <span class="ar-table__total">{{ this.totalLabel() }}</span>
                <span class="ar-table__spinner" a-if="this.isLoading()">⟳</span>
                <span class="ar-table__spacer"></span>
                <div class="ar-table__col-toggle" a-if="this.hasColumnToggle()">
                    <button class="ar-table__col-toggle-btn"
                            @click="this.onToggleMenu"
                            aria-label="Toggle columns">⋮</button>
                    <div class="ar-table__col-menu" a-if="this.toggleMenuOpen()">
                        <label class="ar-table__col-menu-item" a-for="entry in this.columnEntries()">
                            <input type="checkbox"
                                   :checked="entry.visible"
                                   @change="(e) => this.onColumnToggle(entry.col.key, e.target.checked)"/>
                            <span>{{ entry.col.label }}</span>
                        </label>
                    </div>
                </div>
                <button class="ar-table__export-btn"
                        @click="this.onExportCsv"
                        title="Export CSV"
                        aria-label="Export CSV">⤓</button>
            </div>

            <div class="ar-table__scroll">
                <table class="ar-table">
                    <thead class="ar-table__thead">
                        <tr>
                            <th :class="h.headerCls"
                                :style="h.style"
                                a-for="h in this.headers()"
                                @click="(e) => this.onHeaderClick(h.col, e)">
                                <span class="ar-table__th-label">{{ h.label }}</span>
                                <span class="ar-table__th-sort" a-if="h.isSorted">{{ h.sortIcon }}</span>
                                <span class="ar-table__th-order" a-if="h.sortOrder">{{ h.sortOrder }}</span>
                                <span class="ar-table__th-resize"
                                      a-if="h.resizable"
                                      @mousedown="(e) => this.onResizeStart(h.col, e)"></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr :class="dr.rowClass"
                            a-for="dr in this.allRows()"
                            @click="(e) => this.onRowClick(dr, e)">
                            <td :class="cell.cellClass"
                                :style="cell.style"
                                a-for="cell in dr.cells"
                                a-html="cell.html"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="ar-table__footer" a-if="this.hasMultiplePages()">
                <button :class="(btn.active ? 'ar-table__page ar-table__page--active' : (btn.isDots ? 'ar-table__page ar-table__page--dots' : 'ar-table__page'))"
                        a-for="btn in this.pageButtons()"
                        :disabled="btn.disabled"
                        @click="(e) => this.onPageClick(btn)">{{ btn.label }}</button>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Table.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Table.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        columns
         *  @public
         *  @type        {void}
         *  @description Component member for columns.
         *  @param       {Table.Interfaces.TableColumn[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set columns(v: Interfaces.TableColumn[])
        {
            this.columns$.Set(v ?? []);
            this.#recompute();
        }

        /** @name        columns
         *  @public
         *  @type        {Table.Interfaces.TableColumn[]}
         *  @description Component member for columns.
         *  @returns     {Table.Interfaces.TableColumn[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get columns(): Interfaces.TableColumn[] { return this.columns$.Get(); }

        /** @name        rows
         *  @public
         *  @type        {void}
         *  @description Component member for rows.
         *  @param       {Table.Types.Row[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set rows(v: Types.Row[])
        {
            this.rows$.Set(v ?? []);
            this.selected$.Set(new Set());
            this.page$.Set(1);
            this.#recompute();
        }

        /** @name        rows
         *  @public
         *  @type        {Table.Types.Row[]}
         *  @description Component member for rows.
         *  @returns     {Table.Types.Row[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get rows(): Types.Row[] { return this.rows$.Get(); }

        /**
         * Set a server-side fetcher. When set, every sort/search/page change
         * triggers a fetcher call (with LRU caching). Set null to disable.
         */
        set fetcher(fn: Types.Fetcher | null)
        {
            this.#fetcher = fn;
            this.#cache.clear();
            this.#recompute();
        }

        /** @name        fetcher
         *  @public
         *  @type        {Table.Types.Fetcher | null}
         *  @description Component member for fetcher.
         *  @returns     {Table.Types.Fetcher | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get fetcher(): Types.Fetcher | null { return this.#fetcher; }

        /** @name        getSelected
         *  @public
         *  @type        {Table.Types.Row[]}
         *  @description Component member for get Selected.
         *  @returns     {Table.Types.Row[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getSelected(): Types.Row[]
        {
            /** @name        all
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned all value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const all = this.rows$.Get();
            return [...this.selected$.Get()].map(i => all[i]).filter(r => r !== undefined);
        }

        /** @name        clearSelection
         *  @public
         *  @type        {this}
         *  @description Component member for clear Selection.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clearSelection(): this { this.selected$.Set(new Set()); this.#recompute(); return this; }

        /** @name        selectAll
         *  @public
         *  @type        {this}
         *  @description Component member for select All.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selectAll(): this
        {
            if (!this.isMultiSelect())
                return this;

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = new Set<number>();
            this.rows$.Get().forEach((_: any, i: any) => sel.add(i));
            this.selected$.Set(sel);
            this.#recompute();
            return this;
        }

        /** @name        setSort
         *  @public
         *  @type        {this}
         *  @description Component member for set Sort.
         *  @param       {string} key Parameter.
         *  @param       {Table.Types.SortDir} dir Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setSort(key: string, dir: Types.SortDir = 'asc'): this
        {
            this.sortStack$.Set([{ key, dir }]);
            this.page$.Set(1);
            this.#recompute();
            return this;
        }

        /** Add a sort level on top of the existing stack (multi-col). */
        addSort(key: string, dir: Types.SortDir = 'asc'): this
        {
            /** @name        stack
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned stack value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const stack = [...this.sortStack$.Get(), { key, dir }];
            this.sortStack$.Set(stack);
            this.#recompute();
            return this;
        }

        /** @name        clearSort
         *  @public
         *  @type        {this}
         *  @description Component member for clear Sort.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clearSort(): this
        {
            this.sortStack$.Set([]);
            this.#recompute();
            return this;
        }

        /** @name        search
         *  @public
         *  @type        {this}
         *  @description Component member for search.
         *  @param       {string} query Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        search(query: string): this
        {
            this.query$.Set(query);
            this.page$.Set(1);
            this.#recompute();
            return this;
        }

        /** @name        goToPage
         *  @public
         *  @type        {this}
         *  @description Component member for go To Page.
         *  @param       {number} p Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        goToPage(p: number): this
        {
            /** @name        clamped
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clamped value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clamped = Math.max(1, Math.min(this.totalPages(), p));
            this.page$.Set(clamped);
            this.#recompute();
            return this;
        }

        /** Show/hide a column programmatically. */
        setColumnVisible(key: string, visible: boolean): this
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = { ...this.visibility$.Get(), [key]: visible };
            this.visibility$.Set(v);
            return this;
        }

        /** Set a column's width override (px). Pass `null` to clear. */
        setColumnWidth(key: string, width: number | null): this
        {
            /** @name        widths
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned widths value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const widths = { ...this.widthsOverride$.Get() };
            if (width === null)
                delete widths[key];
            else
                widths[key] = width;
            this.widthsOverride$.Set(widths);
            return this;
        }

        /** Clear the LRU page cache (server-side mode). */
        clearCache(): this { this.#cache.clear(); return this; }

        /**
         * Export current filtered+sorted rows (all pages) as CSV.
         * Returns the CSV string and triggers a browser download.
         */
        exportCSV(filename = 'table-export.csv'): string
        {
            /** @name        cols
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cols value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cols = this.columns$.Get().filter((c: any) => this.visibility$.Get()[c.key] !== false && c.visible !== false);
            // In server-side mode we only have the current page; warn but proceed.
            /** @name        sourceRows
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sourceRows value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sourceRows = this.#fetcher
                ? this.displayRows$.Get().map((d: any) => d.raw)
                : this.#processClientSide(this.rows$.Get(), false);

            /** @name        header
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned header value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const header = cols.map((c: any) => csvCell(c.label)).join(',');

            /** @name        body
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned body value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const body = sourceRows.map((row: any) => cols.map((c: any) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = c.value ? c.value(row) : row[c.key];
                return csvCell(v);
            }).join(',')).join('\n');

            /** @name        csv
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned csv value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const csv = header + '\n' + body;
            this.dispatchEvent(new CustomEvent('arianna:export', {
                bubbles: true, detail: { format: 'csv', rows: sourceRows },
            }));
            // Trigger download via Blob
            try
            {
                /** @name        blob
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned blob value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = URL.createObjectURL(blob);

                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            catch (e)
            {
                console.warn('[Table] CSV download failed:', e);
            }
            return csv;
        }
        // ── Lifecycle ────────────────────────────────────────────────────────────
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
            // Trigger initial fetch / compute
            this.#recompute();
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
        onUnmount()
        {
            clearTimeout(this.#lastSearchTimer);
            clearTimeout(this.#recomputeTimer);
            if (this.#worker)
            {
                this.#worker.terminate();
                this.#worker = null;
            }
            if (this.#toggleOutside)
            {
                document.removeEventListener('click', this.#toggleOutside);
                this.#toggleOutside = null;
            }
        }
        // ── Recompute pipeline ──────────────────────────────────────────────────
        /**
         * Batched recompute. Microtask-coalesced so multiple set ops (sort+page+
         * search) run a single pipeline at the end of the tick.
         */
        #recompute(): void
        {
            clearTimeout(this.#recomputeTimer);
            this.#recomputeTimer = window.setTimeout(() => {
                if (this.#fetcher)
                {
                    this.#runServerSide();
                }
                else
                {
                    this.#runClientSide();
                }
            }, 0);
        }

        /**
         * Client-side path.
         *   • Worker if rows.length >= threshold AND no custom value()/sort()/render fns
         *     (those can't ride a Worker)
         *   • Otherwise main thread
         */
        #runClientSide(): void
        {
            /** @name        rows
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rows value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rows = this.rows$.Get();

            /** @name        useWorker
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned useWorker value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const useWorker = this.hasAttribute('worker')
                && rows.length >= this.workerThreshold
                && this.#workerEligible();
            if (useWorker)
            {
                this.loading$.Set(true);
                this.#runWorker(rows);
            }
            else
            {
                /** @name        filteredSorted
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned filteredSorted value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const filteredSorted = this.#processClientSide(rows, false);
                this.totalCount$.Set(filteredSorted.length);
                this.#renderPage(filteredSorted);
            }
        }

        /** @name        #workerEligible
         *  @public
         *  @type        {boolean}
         *  @description Component member for worker Eligible.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #workerEligible(): boolean
        {
            return this.columns$.Get().every((c: any) => !c.render && !c.value && !c.sort);
        }

        /** Worker code can't access app functions, so for custom render/value/
         *  sort we always go main-thread. */
        #runWorker(rows: Types.Row[]): void
        {
            if (!this.#worker)
            {
                try
                {
                    this.#worker = new Worker(getWorkerUrl());
                    this.#worker.onmessage = (e) => {
                        /** @name        { rows: out, total }
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned { rows: out, total } value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const { rows: out, total } = e.data;
                        this.totalCount$.Set(total);
                        this.#renderPage(out);
                        this.loading$.Set(false);
                    };
                    this.#worker.onerror = (err) => {
                        console.warn('[Table] worker error, falling back:', err);

                        /** @name        filteredSorted
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned filteredSorted value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const filteredSorted = this.#processClientSide(rows, false);
                        this.totalCount$.Set(filteredSorted.length);
                        this.#renderPage(filteredSorted);
                        this.loading$.Set(false);
                    };
                }
                catch (e)
                {
                    console.warn('[Table] cannot spawn worker, falling back:', e);

                    /** @name        filteredSorted
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned filteredSorted value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const filteredSorted = this.#processClientSide(rows, false);
                    this.totalCount$.Set(filteredSorted.length);
                    this.#renderPage(filteredSorted);
                    this.loading$.Set(false);
                    return;
                }
            }
            this.#worker.postMessage({
                rows,
                query: this.query$.Get(),
                sort: this.sortStack$.Get(),
                columns: this.columns$.Get().map((c: any) => ({ key: c.key })),
            });
        }

        /**
         * Server-side path with LRU cache. Cache key includes query+sort+page+pageSize.
         */
        #runServerSide(): void
        {
            if (!this.#fetcher)
                return;

            /** @name        params
             *  @public
             *  @type        {Table.Interfaces.FetchParams}
             *  @description Namespace-owned params value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const params: Interfaces.FetchParams = {
                page: this.page$.Get(),
                pageSize: this.pageSize,
                sort: this.sortStack$.Get(),
                query: this.query$.Get(),
            };

            /** @name        cacheKey
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cacheKey value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cacheKey = JSON.stringify(params);

            /** @name        cached
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cached value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cached = this.#cache.get(cacheKey);
            if (cached)
            {
                this.totalCount$.Set(cached.total);
                this.#renderRows(cached.rows);
                return;
            }
            this.loading$.Set(true);
            this.#fetcher(params)
                .then(result => {
                this.#cache.set(cacheKey, result);
                this.totalCount$.Set(result.total);
                this.#renderRows(result.rows);
                this.dispatchEvent(new CustomEvent('arianna:fetch', {
                    bubbles: true, detail: { rows: result.rows, total: result.total },
                }));
            })
                .catch(err => {
                console.warn('[Table] fetch failed:', err);
                this.#renderRows([]);
                this.totalCount$.Set(0);
            })
                .finally(() => this.loading$.Set(false));
        }

        /**
         * Main-thread filter+sort. Optionally returns ALL rows (no pagination,
         * for CSV export).
         */
        #processClientSide(rows: Types.Row[], _alreadyPaged: boolean): Types.Row[]
        {
            /** @name        cols
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cols value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cols = this.columns$.Get();

            /** @name        q
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned q value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const q = this.query$.Get();

            /** @name        sorts
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sorts value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sorts = this.sortStack$.Get();
            // Filter
            /** @name        filtered
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned filtered value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let filtered = rows;
            if (q)
            {
                /** @name        ql
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ql value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ql = q.toLowerCase();
                filtered = rows.filter(row => cols.some((col: any) => {
                    /** @name        v
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned v value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const v = col.value ? col.value(row) : row[col.key];
                    return String(v ?? '').toLowerCase().includes(ql);
                }));
            }
            // Sort
            if (sorts.length > 0)
            {
                filtered = filtered.slice().sort((a, b) => {
                    for (const s of sorts)
                    {
                        /** @name        col
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned col value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const col = cols.find((c: any) => c.key === s.key);
                        if (!col)
                            continue;
                        if (col.sort)
                        {
                            /** @name        r
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned r value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const r = col.sort(a, b, s.dir);
                            if (r !== 0)
                                return r;
                            continue;
                        }

                        /** @name        av
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned av value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const av = col.value ? col.value(a) : a[col.key];

                        /** @name        bv
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned bv value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const bv = col.value ? col.value(b) : b[col.key];
                        if (av === bv)
                            continue;

                        /** @name        cmp
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned cmp value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const cmp = (av as never) < (bv as never) ? -1 : 1;
                        return s.dir === 'asc' ? cmp : -cmp;
                    }
                    return 0;
                });
            }
            return filtered;
        }

        /**
         * Slice a filtered+sorted array by current page and render.
         */
        #renderPage(filtered: Types.Row[]): void
        {
            /** @name        ps
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ps value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ps = this.pageSize;

            /** @name        pg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pg = this.page$.Get();

            /** @name        start
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned start value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const start = (pg - 1) * ps;

            /** @name        sliced
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sliced value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sliced = ps > 0 ? filtered.slice(start, start + ps) : filtered;
            // We need to keep original-row indices for selection tracking
            /** @name        all
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned all value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const all = this.rows$.Get();

            /** @name        indexMap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned indexMap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const indexMap = new Map<Types.Row, number>();
            all.forEach((r: any, i: any) => indexMap.set(r, i));
            this.#renderRows(sliced, indexMap);
        }

        /** Final stage: build DisplayRow[] for the current view. */
        #renderRows(rows: Types.Row[], indexMap?: Map<Types.Row, number>): void
        {
            /** @name        cols
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cols value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cols = this.columns$.Get().filter((c: any) => this.visibility$.Get()[c.key] !== false && c.visible !== false);

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = this.selected$.Get();

            /** @name        out
             *  @public
             *  @type        {Table.Interfaces.DisplayRow[]}
             *  @description Namespace-owned out value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const out: Interfaces.DisplayRow[] = rows.map((row, viewIdx) => {
                /** @name        originalIdx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned originalIdx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const originalIdx = indexMap ? (indexMap.get(row) ?? viewIdx) : viewIdx;

                /** @name        selected
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned selected value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const selected = sel.has(originalIdx);
                return {
                    raw: row,
                    index: originalIdx,
                    selected,
                    rowClass: 'ar-table__row' + (selected ? ' ar-table__row--selected' : ''),
                    cells: cols.map((col: any) => {
                        /** @name        v
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned v value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const v = col.value ? col.value(row) : row[col.key];

                        /** @name        cellHtml
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned cellHtml value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const cellHtml = col.render ? col.render(v, row, col) : SSR.Renderer.EscapeHtml(String(v ?? ''));

                        /** @name        style
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned style value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const style = col.align ? `text-align: ${col.align}` : '';
                        return {
                            html: cellHtml,
                            cellClass: 'ar-table__td' + (col.class ? ' ' + col.class : ''),
                            style,
                        };
                    }),
                };
            });
            this.displayRows$.Set(out);
        }
        // ── Attributes ────────────────────────────────────────────────────────────────
        /** @name        pageSize
         *  @public
         *  @type        {number}
         *  @description Component member for page Size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get pageSize(): number { return parseInt(this.getAttribute('page-size') ?? '25', 10) || 25; }

        /** @name        pageSize
         *  @public
         *  @type        {void}
         *  @description Component member for page Size.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set pageSize(v: number) { this.setAttribute('page-size', String(v)); }

        /** @name        selectable
         *  @public
         *  @type        {Table.Types.SelectMode}
         *  @description Component member for selectable.
         *  @returns     {Table.Types.SelectMode} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get selectable(): Types.SelectMode { return (this.getAttribute('selectable') ?? 'none') as Types.SelectMode; }

        /** @name        selectable
         *  @public
         *  @type        {void}
         *  @description Component member for selectable.
         *  @param       {Table.Types.SelectMode} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set selectable(v: Types.SelectMode) { this.setAttribute('selectable', v); }

        /** @name        searchable
         *  @public
         *  @type        {boolean}
         *  @description Component member for searchable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get searchable(): boolean { return this.hasAttribute('searchable'); }

        /** @name        searchable
         *  @public
         *  @type        {void}
         *  @description Component member for searchable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set searchable(v: boolean) { v ? this.setAttribute('searchable', '') : this.removeAttribute('searchable'); }

        /** @name        stickyHeader
         *  @public
         *  @type        {boolean}
         *  @description Component member for sticky Header.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get stickyHeader(): boolean { return this.hasAttribute('sticky-header'); }

        /** @name        stickyHeader
         *  @public
         *  @type        {void}
         *  @description Component member for sticky Header.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set stickyHeader(v: boolean) { v ? this.setAttribute('sticky-header', '') : this.removeAttribute('sticky-header'); }

        /** @name        columnToggle
         *  @public
         *  @type        {boolean}
         *  @description Component member for column Toggle.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get columnToggle(): boolean { return this.hasAttribute('column-toggle'); }

        /** @name        columnToggle
         *  @public
         *  @type        {void}
         *  @description Component member for column Toggle.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set columnToggle(v: boolean) { v ? this.setAttribute('column-toggle', '') : this.removeAttribute('column-toggle'); }

        /** @name        columnResize
         *  @public
         *  @type        {boolean}
         *  @description Component member for column Resize.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get columnResize(): boolean { return this.getAttribute('column-resize') !== 'false'; }

        /** @name        columnResize
         *  @public
         *  @type        {void}
         *  @description Component member for column Resize.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set columnResize(v: boolean) { this.setAttribute('column-resize', v ? 'true' : 'false'); }

        /** @name        worker
         *  @public
         *  @type        {boolean}
         *  @description Component member for worker.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get worker(): boolean { return this.hasAttribute('worker'); }

        /** @name        worker
         *  @public
         *  @type        {void}
         *  @description Component member for worker.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set worker(v: boolean) { v ? this.setAttribute('worker', '') : this.removeAttribute('worker'); }

        /** @name        workerThreshold
         *  @public
         *  @type        {number}
         *  @description Component member for worker Threshold.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get workerThreshold(): number { return parseInt(this.getAttribute('worker-threshold') ?? '5000', 10) || 5000; }

        /** @name        workerThreshold
         *  @public
         *  @type        {void}
         *  @description Component member for worker Threshold.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set workerThreshold(v: number) { this.setAttribute('worker-threshold', String(v)); }
        // ── Template helpers ────────────────────────────────────────────────────
        /** @name        headers
         *  @private
         *  @type        {() => Table.Interfaces.HeaderCell[]}
         *  @description Component member for headers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private headers: () => Interfaces.HeaderCell[] = () => [];

        /** @name        allRows
         *  @private
         *  @type        {() => Table.Interfaces.DisplayRow[]}
         *  @description Component member for all Rows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allRows: () => Interfaces.DisplayRow[] = () => [];

        /** @name        totalPages
         *  @private
         *  @type        {() => number}
         *  @description Component member for total Pages.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private totalPages: () => number = () => 1;

        /** @name        pageButtons
         *  @private
         *  @type        {() => Table.Interfaces.PageBtn[]}
         *  @description Component member for page Buttons.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private pageButtons: () => Interfaces.PageBtn[] = () => [];

        /** @name        columnEntries
         *  @private
         *  @type        {() => Table.Interfaces.ColToggleEntry[]}
         *  @description Component member for column Entries.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private columnEntries: () => Interfaces.ColToggleEntry[] = () => [];

        /** @name        hasMultiplePages
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Multiple Pages.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasMultiplePages: () => boolean = () => false;

        /** @name        hasColumnToggle
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Column Toggle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasColumnToggle: () => boolean = () => false;

        /** @name        hasColumnResize
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Column Resize.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasColumnResize: () => boolean = () => true;

        /** @name        toggleMenuOpen
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for toggle Menu Open.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private toggleMenuOpen: () => boolean = () => false;

        /** @name        isSelectable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Selectable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSelectable: () => boolean = () => false;

        /** @name        isMultiSelect
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Multi Select.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isMultiSelect: () => boolean = () => false;

        /** @name        isSearchable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Searchable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSearchable: () => boolean = () => false;

        /** @name        isLoading
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Loading.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isLoading: () => boolean = () => false;

        /** @name        totalLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for total Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private totalLabel: () => string = () => '';

        /** @name        onHeaderClick
         *  @private
         *  @type        {(col: Table.Interfaces.TableColumn, e: Event) => void}
         *  @description Component member for on Header Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHeaderClick: (col: Interfaces.TableColumn, e: Event) => void = () => { };

        /** @name        onSearchInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Search Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSearchInput: (e: Event) => void = () => { };

        /** @name        onRowClick
         *  @private
         *  @type        {(dr: Table.Interfaces.DisplayRow, e: Event) => void}
         *  @description Component member for on Row Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRowClick: (dr: Interfaces.DisplayRow, e: Event) => void = () => { };

        /** @name        onPageClick
         *  @private
         *  @type        {(btn: Table.Interfaces.PageBtn) => void}
         *  @description Component member for on Page Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPageClick: (btn: Interfaces.PageBtn) => void = () => { };

        /** @name        onToggleMenu
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Toggle Menu.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggleMenu: (e: Event) => void = () => { };

        /** @name        onColumnToggle
         *  @private
         *  @type        {(key: string, visible: boolean) => void}
         *  @description Component member for on Column Toggle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onColumnToggle: (key: string, visible: boolean) => void = () => { };

        /** @name        onResizeStart
         *  @private
         *  @type        {(col: Table.Interfaces.TableColumn, e: Event) => void}
         *  @description Component member for on Resize Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onResizeStart: (col: Interfaces.TableColumn, e: Event) => void = () => { };

        /** @name        onExportCsv
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Export Csv.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onExportCsv: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Table.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Table.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    overflow: 'hidden',
                    background: 'var(--arianna-bg, #ffffff)',
                    color: 'var(--arianna-text, #1f2328)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    fontSize: '0.85rem',
                }),
                // Toolbar
                new Rule('.ar-table__toolbar', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, #f8f9fa)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'flex',
                    gap: '8px',
                    padding: '8px 12px',
                }),
                new Rule('.ar-table__search', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color: 'var(--arianna-text, #1f2328)',
                    font: 'inherit',
                    padding: '5px 10px',
                    width: '240px',
                    outline: 'none',
                }),
                new Rule('.ar-table__search:focus', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-table__total', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                }),
                new Rule('.ar-table__spinner', {
                    animation: 'ar-table-spin 1s linear infinite',
                    color: 'var(--arianna-primary, #1f6feb)',
                    display: 'inline-block',
                }),
                new Rule('@keyframes ar-table-spin', {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                } as never),
                new Rule('.ar-table__spacer', { flex: '1' }),
                // Column toggle menu
                new Rule('.ar-table__col-toggle', { position: 'relative' }),
                new Rule('.ar-table__col-toggle-btn, .ar-table__export-btn', {
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.9rem',
                    padding: '4px 10px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-table__col-toggle-btn:hover, .ar-table__export-btn:hover', {
                    background: 'var(--arianna-bg, #ffffff)',
                    borderColor: 'var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-table__col-menu', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    minWidth: '160px',
                    padding: '6px 0',
                    position: 'absolute',
                    right: '0',
                    top: 'calc(100% + 4px)',
                    zIndex: '500',
                }),
                new Rule('.ar-table__col-menu-item', {
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    fontSize: '0.82rem',
                    gap: '8px',
                    padding: '5px 12px',
                }),
                new Rule('.ar-table__col-menu-item:hover', { background: 'var(--arianna-bg-3, #f8f9fa)' }),
                // Scroll wrapper + table
                new Rule('.ar-table__scroll', {
                    flex: '1',
                    overflow: 'auto',
                    minHeight: '0',
                }),
                new Rule('.ar-table', {
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                }),
                new Rule(':host([sticky-header]) .ar-table__thead', {
                    position: 'sticky',
                    top: '0',
                    zIndex: '1',
                }),
                new Rule('.ar-table__thead', { background: 'var(--arianna-bg-3, #f8f9fa)' }),
                new Rule('.ar-table__th', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '10px 12px',
                    position: 'relative',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }),
                new Rule('.ar-table__th--sortable', { cursor: 'pointer' }),
                new Rule('.ar-table__th--sortable:hover', { color: 'var(--arianna-text, #1f2328)' }),
                new Rule('.ar-table__th--sorted', { color: 'var(--arianna-text, #1f2328)' }),
                new Rule('.ar-table__th-sort', { marginLeft: '6px', fontSize: '0.7rem' }),
                new Rule('.ar-table__th-order', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    marginLeft: '4px',
                    padding: '0 5px',
                }),
                new Rule('.ar-table__th-resize', {
                    bottom: '0',
                    cursor: 'col-resize',
                    height: '100%',
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    width: '6px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-table__th-resize:hover', {
                    background: 'var(--arianna-primary, #1f6feb)',
                }),
                // Body
                new Rule('.ar-table__row', {
                    transition: 'background 0.14s ease',
                    cursor: 'default',
                }),
                new Rule('.ar-table__row:hover', { background: 'var(--arianna-bg-3, #f8f9fa)' }),
                new Rule('.ar-table__row--selected', { background: 'rgba(31,111,235,0.08)' }),
                new Rule('.ar-table__td', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '10px 12px',
                    color: 'var(--arianna-text, #1f2328)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }),
                // Footer pagination
                new Rule('.ar-table__footer', {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 12px',
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    background: 'var(--arianna-bg-3, #f8f9fa)',
                }),
                new Rule('.ar-table__page', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.8rem',
                    minWidth: '32px',
                    padding: '4px 8px',
                    transition: 'border-color 0.14s ease',
                }),
                new Rule('.ar-table__page:hover:not(:disabled)', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-table__page--active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#ffffff',
                }),
                new Rule('.ar-table__page--dots', {
                    background: 'none',
                    border: 'none',
                    cursor: 'default',
                    color: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-table__page:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]);
        }
    }
}
export default Table;

export type Row = Table.Types.Row;
export type SortDir = Table.Types.SortDir;
export type SortState = Table.Interfaces.SortState;
export type SelectMode = Table.Types.SelectMode;
export type TableColumn = Table.Interfaces.TableColumn;
export type TableOptions = Table.Interfaces.TableOptions;
