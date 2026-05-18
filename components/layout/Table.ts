/**
 * @module    components/layout/Table
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Table — data table with full feature parity to v1.
 *
 * # Features
 *   • Column sorting (multi-col with Shift+click)
 *   • Global search filter + per-column accessors
 *   • Client-side pagination (page size + page navigation)
 *   • Server-side async fetch via `fetcher` callback
 *   • LRU cache for remote pages
 *   • Web Worker offloading for sort+filter on large datasets (>= worker-threshold rows)
 *   • Sticky header
 *   • Row selection (none / single / multi via Ctrl/Shift)
 *   • Column resizing (drag right edge of header cell)
 *   • Column visibility toggle (button + menu)
 *   • Custom cell renderers
 *   • CSV export
 *   • Keyboard-friendly (header buttons focusable, page buttons disabled at boundaries)
 *   • ARIA grid role + sortable header cells
 *
 * # Lazy server-side mode
 *
 *   const t = new Table();
 *   t.columns = [...];
 *   t.fetcher = async ({ page, pageSize, sort, query }) => {
 *     const res = await api.get('/data', { page, pageSize, sort, query });
 *     return { rows: res.data, total: res.total };
 *   };
 *
 *   When `fetcher` is set, the table calls it on mount and on every
 *   sort/search/page change. Responses go through the LRU cache (keyed by
 *   query params) so the same query within the cache window returns instantly.
 *
 * # Worker mode
 *
 *   For client-side mode (no fetcher) with large datasets, set `worker` true
 *   and `workerThreshold` (default 5000). When rows >= threshold, sort+filter
 *   runs inside a `Blob`-spawned Web Worker so the UI thread stays free.
 *
 * @example HTML
 *   <arianna-table page-size="25" selectable="multi" searchable
 *                  sticky-header column-toggle worker></arianna-table>
 *
 * Events:
 *   - arianna:select   detail: { rows, indices }   row(s) selected
 *   - arianna:sort     detail: { sorts }            full sort stack
 *   - arianna:page     detail: { page }
 *   - arianna:search   detail: { query }
 *   - arianna:fetch    detail: { rows, total }      after server-side load
 *   - arianna:resize-column  detail: { key, width }
 *   - arianna:toggle-column  detail: { key, visible }
 *   - arianna:export   detail: { format, rows }
 *
 * Slots:  (none — programmatic columns/rows only)
 *
 * Attrs:
 *   page-size, selectable ('none' | 'single' | 'multi'), searchable,
 *   sticky-header, column-toggle, column-resize, worker, worker-threshold
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

// ── Types ────────────────────────────────────────────────────────────────────

export type Row     = Record<string, unknown>;
export type SortDir = 'asc' | 'desc';
export type SelectMode = 'none' | 'single' | 'multi';

export interface TableColumn<R = Row> {
    key         : string;
    label       : string;
    width?      : number | string;
    minWidth?   : number;
    sortable?   : boolean;
    resizable?  : boolean;
    visible?    : boolean;
    align?      : 'left' | 'center' | 'right';
    render?     : (value: unknown, row: R, col: TableColumn<R>) => string;
    value?      : (row: R) => unknown;
    sort?       : (a: R, b: R, dir: SortDir) => number;
    class?      : string;
    headerClass?: string;
}

export interface SortState {
    key : string;
    dir : SortDir;
}

export interface FetchParams {
    page     : number;
    pageSize : number;
    sort     : SortState[];
    query    : string;
}

export interface FetchResult {
    rows  : Row[];
    total : number;
}

export type Fetcher = (params: FetchParams) => Promise<FetchResult>;

export interface TableOptions {
    columns?         : TableColumn[];
    rows?            : Row[];
    pageSize?        : number;
    selectable?      : SelectMode;
    searchable?      : boolean;
    stickyHeader?    : boolean;
    columnToggle?    : boolean;
    columnResize?    : boolean;
    worker?          : boolean;
    workerThreshold? : number;
    cacheSize?       : number;
    fetcher?         : Fetcher;
}

// ── Internal types ──────────────────────────────────────────────────────────

interface DisplayRow {
    raw      : Row;
    index    : number;
    selected : boolean;
    rowClass : string;
    cells    : Array<{ html: string; cellClass: string; style: string }>;
}

interface HeaderCell {
    col       : TableColumn;
    label     : string;
    isSorted  : boolean;
    sortIcon  : string;
    sortOrder : string;
    headerCls : string;
    style     : string;
    sortable  : boolean;
    resizable : boolean;
}

interface PageBtn {
    label    : string;
    page     : number;
    active   : boolean;
    disabled : boolean;
    isDots   : boolean;
}

interface ColToggleEntry {
    col     : TableColumn;
    visible : boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]!));
}

/** Escape CSV cell — wrap in quotes if needed, double internal quotes. */
function csvCell(v: unknown): string {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
}

/** Tiny LRU cache (Map preserves insertion order). */
class LRU<K, V> {
    #map: Map<K, V> = new Map();
    #capacity: number;
    constructor(capacity: number = 32) { this.#capacity = capacity; }
    get(key: K): V | undefined {
        if (!this.#map.has(key)) return undefined;
        const v = this.#map.get(key)!;
        this.#map.delete(key);
        this.#map.set(key, v);
        return v;
    }
    set(key: K, value: V): void {
        if (this.#map.has(key)) this.#map.delete(key);
        else if (this.#map.size >= this.#capacity) {
            const first = this.#map.keys().next().value;
            if (first !== undefined) this.#map.delete(first);
        }
        this.#map.set(key, value);
    }
    clear(): void { this.#map.clear(); }
    get size(): number { return this.#map.size; }
}

/** Body of the Web Worker — stringified at runtime. Pure data: no DOM, no
 *  app-side closures (custom sort/value/render functions can't ride the
 *  worker, so we fall back to the main-thread path for those columns). */
const WORKER_BODY = `
self.onmessage = (e) => {
    const { rows, query, sort, columns } = e.data;
    let filtered = rows;
    if (query) {
        const q = query.toLowerCase();
        filtered = rows.filter(r => columns.some(c => {
            const v = r[c.key];
            return String(v ?? '').toLowerCase().includes(q);
        }));
    }
    if (sort && sort.length) {
        filtered = filtered.slice().sort((a, b) => {
            for (const s of sort) {
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

let WORKER_URL: string | null = null;
function getWorkerUrl(): string {
    if (WORKER_URL) return WORKER_URL;
    const blob = new Blob([WORKER_BODY], { type: 'application/javascript' });
    WORKER_URL = URL.createObjectURL(blob);
    return WORKER_URL;
}

// ── Table component ─────────────────────────────────────────────────────────

export class Table extends Component('arianna-table', HTMLElement, {}, {
    attrs : [
        'page-size', 'selectable', 'searchable', 'sticky-header',
        'column-toggle', 'column-resize', 'worker', 'worker-threshold',
    ],
    shadow: false,
})
{
    // ── Reactive state ──────────────────────────────────────────────────────
    columns$       : Signal<TableColumn[]>      = signal<TableColumn[]>([]);
    rows$          : Signal<Row[]>              = signal<Row[]>([]);
    /** Computed display rows (filtered + sorted + paged). Recomputed eagerly
     *  on input change AND on async worker / fetcher result. */
    displayRows$   : Signal<DisplayRow[]>       = signal<DisplayRow[]>([]);
    totalCount$    : Signal<number>             = signal<number>(0);
    selected$      : Signal<Set<number>>        = signal<Set<number>>(new Set());
    /** Multi-column sort stack: most-recently-added LAST. */
    sortStack$     : Signal<SortState[]>        = signal<SortState[]>([]);
    query$         : Signal<string>             = signal<string>('');
    page$          : Signal<number>             = signal<number>(1);
    loading$       : Signal<boolean>            = signal<boolean>(false);
    /** Column visibility map. Keys NOT in this map default to visible. */
    visibility$    : Signal<Record<string, boolean>> = signal<Record<string, boolean>>({});
    /** Column widths overridden by user resize. */
    widthsOverride$: Signal<Record<string, number>>  = signal<Record<string, number>>({});
    /** Toggle menu open state. */
    toggleOpen$    : Signal<boolean>            = signal<boolean>(false);

    // ── Internals ───────────────────────────────────────────────────────────
    #fetcher  : Fetcher | null = null;
    #cache    : LRU<string, FetchResult>;
    #worker   : Worker | null = null;
    #lastSearchTimer = 0;
    #recomputeTimer  = 0;
    #toggleOutside: ((e: Event) => void) | null = null;

    constructor() {
        super();
        this.#cache = new LRU<string, FetchResult>(32);
    }

    build(_opts: TableOptions = {})
    {
        this.setAttribute('role', 'grid');

        // Computed columns: filter out hidden ones for rendering purposes.
        const visibleCols = (): TableColumn[] => {
            const v = this.visibility$.get();
            return this.columns$.get().filter(c => v[c.key] !== false && c.visible !== false);
        };

        this.headers = (): HeaderCell[] => {
            const stack = this.sortStack$.get();
            const widths = this.widthsOverride$.get();
            return visibleCols().map(col => {
                const sortable  = !!col.sortable;
                const resizable = col.resizable !== false && this.hasColumnResize();
                const sIdx = stack.findIndex(s => s.key === col.key);
                const isSorted = sIdx >= 0;
                const dir = isSorted ? stack[sIdx].dir : null;
                const order = (isSorted && stack.length > 1) ? String(sIdx + 1) : '';

                const override = widths[col.key];
                const w = override !== undefined ? override + 'px'
                        : col.width !== undefined ? (typeof col.width === 'number' ? col.width + 'px' : col.width)
                        : '';
                const styleParts: string[] = [];
                if (w) styleParts.push(`width: ${w}`);
                if (col.align) styleParts.push(`text-align: ${col.align}`);

                return {
                    col,
                    label    : col.label,
                    isSorted,
                    sortIcon : isSorted ? (dir === 'asc' ? '▲' : '▼') : '',
                    sortOrder: order,
                    headerCls: 'ar-table__th'
                             + (sortable  ? ' ar-table__th--sortable'  : '')
                             + (isSorted  ? ' ar-table__th--sorted'    : '')
                             + (resizable ? ' ar-table__th--resizable' : '')
                             + (col.headerClass ? ' ' + col.headerClass : ''),
                    style    : styleParts.join('; '),
                    sortable,
                    resizable,
                };
            });
        };

        // Pagination buttons — based on totalCount$ which is either local
        // filtered count (client mode) or server total (fetcher mode).
        this.totalPages = (): number => {
            const ps = this.pageSize;
            if (ps <= 0) return 1;
            return Math.max(1, Math.ceil(this.totalCount$.get() / ps));
        };
        this.pageButtons = (): PageBtn[] => {
            const tp = this.totalPages();
            const cur = this.page$.get();
            const out: PageBtn[] = [];
            out.push({ label: '‹', page: cur - 1, active: false, disabled: cur <= 1, isDots: false });
            const start = Math.max(1, cur - 1);
            const end   = Math.min(tp, cur + 1);
            if (start > 1) {
                out.push({ label: '1', page: 1, active: cur === 1, disabled: false, isDots: false });
                if (start > 2) out.push({ label: '…', page: 0, active: false, disabled: true, isDots: true });
            }
            for (let p = start; p <= end; p++) {
                out.push({ label: String(p), page: p, active: p === cur, disabled: false, isDots: false });
            }
            if (end < tp) {
                if (end < tp - 1) out.push({ label: '…', page: 0, active: false, disabled: true, isDots: true });
                out.push({ label: String(tp), page: tp, active: cur === tp, disabled: false, isDots: false });
            }
            out.push({ label: '›', page: cur + 1, active: false, disabled: cur >= tp, isDots: false });
            return out;
        };

        // ── Column toggle menu ──────────────────────────────────────────────
        this.columnEntries = (): ColToggleEntry[] => {
            const v = this.visibility$.get();
            return this.columns$.get().map(col => ({
                col,
                visible: v[col.key] !== false && col.visible !== false,
            }));
        };

        // ── Other reactive helpers ──────────────────────────────────────────
        this.allRows           = () => this.displayRows$.get();
        this.hasMultiplePages  = () => this.totalPages() > 1;
        this.hasColumnToggle   = () => this.hasAttribute('column-toggle');
        this.hasColumnResize   = () => this.getAttribute('column-resize') !== 'false';
        this.toggleMenuOpen    = () => this.toggleOpen$.get();
        this.isSelectable      = () => {
            const m = this.getAttribute('selectable');
            return m !== null && m !== 'none';
        };
        this.isMultiSelect     = () => this.getAttribute('selectable') === 'multi';
        this.isSearchable      = () => this.hasAttribute('searchable');
        this.isLoading         = () => this.loading$.get();
        this.totalLabel        = () => {
            const t = this.totalCount$.get();
            return t === 1 ? '1 row' : `${t} rows`;
        };

        // ── Event handlers ──────────────────────────────────────────────────
        this.onHeaderClick = (col: TableColumn, e: Event) => {
            if (!col.sortable) return;
            const me = e as MouseEvent;
            const stack = [...this.sortStack$.get()];
            const idx = stack.findIndex(s => s.key === col.key);

            if (me.shiftKey) {
                // Multi-col sort: cycle this column without dropping others
                if (idx >= 0) {
                    if (stack[idx].dir === 'asc') stack[idx] = { ...stack[idx], dir: 'desc' };
                    else                          stack.splice(idx, 1);
                } else {
                    stack.push({ key: col.key, dir: 'asc' });
                }
            } else {
                // Single-col: cycle through asc → desc → off
                if (idx >= 0 && stack.length === 1) {
                    if (stack[0].dir === 'asc') stack[0] = { key: col.key, dir: 'desc' };
                    else                         stack.length = 0;
                } else {
                    stack.length = 0;
                    stack.push({ key: col.key, dir: 'asc' });
                }
            }
            this.sortStack$.set(stack);
            this.page$.set(1);
            this.dispatchEvent(new CustomEvent('arianna:sort', {
                bubbles: true, detail: { sorts: stack },
            }));
            this.#recompute();
        };

        this.onSearchInput = (e: Event) => {
            const v = (e.target as HTMLInputElement).value;
            clearTimeout(this.#lastSearchTimer);
            this.#lastSearchTimer = window.setTimeout(() => {
                this.query$.set(v);
                this.page$.set(1);
                this.dispatchEvent(new CustomEvent('arianna:search', {
                    bubbles: true, detail: { query: v },
                }));
                this.#recompute();
            }, 200);
        };

        this.onRowClick = (dr: DisplayRow, e: Event) => {
            if (!this.isSelectable()) return;
            const me = e as MouseEvent;
            const cur = new Set(this.selected$.get());
            if (this.isMultiSelect()) {
                if (me.shiftKey && cur.size > 0) {
                    // Range select from last → this index
                    const last = Math.max(...cur);
                    const lo = Math.min(last, dr.index);
                    const hi = Math.max(last, dr.index);
                    for (let i = lo; i <= hi; i++) cur.add(i);
                } else if (me.ctrlKey || me.metaKey) {
                    if (cur.has(dr.index)) cur.delete(dr.index);
                    else                    cur.add(dr.index);
                } else {
                    cur.clear();
                    cur.add(dr.index);
                }
            } else {
                cur.clear();
                cur.add(dr.index);
            }
            this.selected$.set(cur);
            const selectedRows = [...cur].map(i => this.rows$.get()[i]).filter(r => r !== undefined);
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { rows: selectedRows, indices: [...cur] },
            }));
            this.#recompute();
        };

        this.onPageClick = (btn: PageBtn) => {
            if (btn.disabled || btn.isDots) return;
            this.page$.set(btn.page);
            this.dispatchEvent(new CustomEvent('arianna:page', {
                bubbles: true, detail: { page: btn.page },
            }));
            this.#recompute();
        };

        this.onToggleMenu = (e: Event) => {
            e.stopPropagation();
            const wasOpen = this.toggleOpen$.get();
            this.toggleOpen$.set(!wasOpen);
            if (!wasOpen) {
                this.#toggleOutside = (ev: Event) => {
                    if (!this.contains(ev.target as Node)) this.toggleOpen$.set(false);
                };
                setTimeout(() => document.addEventListener('click', this.#toggleOutside!), 0);
            } else if (this.#toggleOutside) {
                document.removeEventListener('click', this.#toggleOutside);
                this.#toggleOutside = null;
            }
        };

        this.onColumnToggle = (key: string, visible: boolean) => {
            const v = { ...this.visibility$.get(), [key]: visible };
            this.visibility$.set(v);
            this.dispatchEvent(new CustomEvent('arianna:toggle-column', {
                bubbles: true, detail: { key, visible },
            }));
        };

        this.onResizeStart = (col: TableColumn, e: Event) => {
            if (!this.hasColumnResize() || col.resizable === false) return;
            e.preventDefault();
            e.stopPropagation();
            const me = e as MouseEvent;
            const th = (me.currentTarget as HTMLElement).closest<HTMLElement>('.ar-table__th');
            if (!th) return;
            const startX = me.clientX;
            const startW = th.offsetWidth;
            const minW = col.minWidth ?? 50;

            const onMove = (mv: MouseEvent) => {
                const newW = Math.max(minW, startW + (mv.clientX - startX));
                const widths = { ...this.widthsOverride$.get(), [col.key]: newW };
                this.widthsOverride$.set(widths);
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup',   onUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                const w = this.widthsOverride$.get()[col.key];
                this.dispatchEvent(new CustomEvent('arianna:resize-column', {
                    bubbles: true, detail: { key: col.key, width: w },
                }));
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup',   onUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };

        this.onExportCsv = () => this.exportCSV();

        // ── Template ────────────────────────────────────────────────────────
        this.template = html`
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

        this.Sheet = Table.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    set columns(v: TableColumn[]) {
        this.columns$.set(v ?? []);
        this.#recompute();
    }
    get columns(): TableColumn[] { return this.columns$.get(); }

    set rows(v: Row[]) {
        this.rows$.set(v ?? []);
        this.selected$.set(new Set());
        this.page$.set(1);
        this.#recompute();
    }
    get rows(): Row[] { return this.rows$.get(); }

    /**
     * Set a server-side fetcher. When set, every sort/search/page change
     * triggers a fetcher call (with LRU caching). Set null to disable.
     */
    set fetcher(fn: Fetcher | null) {
        this.#fetcher = fn;
        this.#cache.clear();
        this.#recompute();
    }
    get fetcher(): Fetcher | null { return this.#fetcher; }

    getSelected(): Row[] {
        const all = this.rows$.get();
        return [...this.selected$.get()].map(i => all[i]).filter(r => r !== undefined);
    }
    clearSelection(): this { this.selected$.set(new Set()); this.#recompute(); return this; }
    selectAll(): this {
        if (!this.isMultiSelect()) return this;
        const sel = new Set<number>();
        this.rows$.get().forEach((_, i) => sel.add(i));
        this.selected$.set(sel);
        this.#recompute();
        return this;
    }

    setSort(key: string, dir: SortDir = 'asc'): this {
        this.sortStack$.set([{ key, dir }]);
        this.page$.set(1);
        this.#recompute();
        return this;
    }
    /** Add a sort level on top of the existing stack (multi-col). */
    addSort(key: string, dir: SortDir = 'asc'): this {
        const stack = [...this.sortStack$.get(), { key, dir }];
        this.sortStack$.set(stack);
        this.#recompute();
        return this;
    }
    clearSort(): this {
        this.sortStack$.set([]);
        this.#recompute();
        return this;
    }

    search(query: string): this {
        this.query$.set(query);
        this.page$.set(1);
        this.#recompute();
        return this;
    }

    goToPage(p: number): this {
        const clamped = Math.max(1, Math.min(this.totalPages(), p));
        this.page$.set(clamped);
        this.#recompute();
        return this;
    }

    /** Show/hide a column programmatically. */
    setColumnVisible(key: string, visible: boolean): this {
        const v = { ...this.visibility$.get(), [key]: visible };
        this.visibility$.set(v);
        return this;
    }

    /** Set a column's width override (px). Pass `null` to clear. */
    setColumnWidth(key: string, width: number | null): this {
        const widths = { ...this.widthsOverride$.get() };
        if (width === null) delete widths[key];
        else                widths[key] = width;
        this.widthsOverride$.set(widths);
        return this;
    }

    /** Clear the LRU page cache (server-side mode). */
    clearCache(): this { this.#cache.clear(); return this; }

    /**
     * Export current filtered+sorted rows (all pages) as CSV.
     * Returns the CSV string and triggers a browser download.
     */
    exportCSV(filename = 'table-export.csv'): string {
        const cols = this.columns$.get().filter(c =>
            this.visibility$.get()[c.key] !== false && c.visible !== false,
        );

        // In server-side mode we only have the current page; warn but proceed.
        const sourceRows = this.#fetcher
            ? this.displayRows$.get().map(d => d.raw)
            : this.#processClientSide(this.rows$.get(), false);

        const header = cols.map(c => csvCell(c.label)).join(',');
        const body = sourceRows.map(row =>
            cols.map(c => {
                const v = c.value ? c.value(row) : row[c.key];
                return csvCell(v);
            }).join(','),
        ).join('\n');
        const csv = header + '\n' + body;

        this.dispatchEvent(new CustomEvent('arianna:export', {
            bubbles: true, detail: { format: 'csv', rows: sourceRows },
        }));

        // Trigger download via Blob
        try {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.warn('[Table] CSV download failed:', e);
        }

        return csv;
    }

    // ── Lifecycle ────────────────────────────────────────────────────────────

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        // Trigger initial fetch / compute
        this.#recompute();
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        clearTimeout(this.#lastSearchTimer);
        clearTimeout(this.#recomputeTimer);
        if (this.#worker) {
            this.#worker.terminate();
            this.#worker = null;
        }
        if (this.#toggleOutside) {
            document.removeEventListener('click', this.#toggleOutside);
            this.#toggleOutside = null;
        }
    }

    // ── Recompute pipeline ──────────────────────────────────────────────────

    /**
     * Batched recompute. Microtask-coalesced so multiple set ops (sort+page+
     * search) run a single pipeline at the end of the tick.
     */
    #recompute(): void {
        clearTimeout(this.#recomputeTimer);
        this.#recomputeTimer = window.setTimeout(() => {
            if (this.#fetcher) {
                this.#runServerSide();
            } else {
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
    #runClientSide(): void {
        const rows  = this.rows$.get();
        const useWorker = this.hasAttribute('worker')
            && rows.length >= this.workerThreshold
            && this.#workerEligible();

        if (useWorker) {
            this.loading$.set(true);
            this.#runWorker(rows);
        } else {
            const filteredSorted = this.#processClientSide(rows, false);
            this.totalCount$.set(filteredSorted.length);
            this.#renderPage(filteredSorted);
        }
    }

    #workerEligible(): boolean {
        return this.columns$.get().every(c => !c.render && !c.value && !c.sort);
    }

    /** Worker code can't access app functions, so for custom render/value/
     *  sort we always go main-thread. */
    #runWorker(rows: Row[]): void {
        if (!this.#worker) {
            try {
                this.#worker = new Worker(getWorkerUrl());
                this.#worker.onmessage = (e) => {
                    const { rows: out, total } = e.data;
                    this.totalCount$.set(total);
                    this.#renderPage(out);
                    this.loading$.set(false);
                };
                this.#worker.onerror = (err) => {
                    console.warn('[Table] worker error, falling back:', err);
                    const filteredSorted = this.#processClientSide(rows, false);
                    this.totalCount$.set(filteredSorted.length);
                    this.#renderPage(filteredSorted);
                    this.loading$.set(false);
                };
            } catch (e) {
                console.warn('[Table] cannot spawn worker, falling back:', e);
                const filteredSorted = this.#processClientSide(rows, false);
                this.totalCount$.set(filteredSorted.length);
                this.#renderPage(filteredSorted);
                this.loading$.set(false);
                return;
            }
        }
        this.#worker.postMessage({
            rows,
            query  : this.query$.get(),
            sort   : this.sortStack$.get(),
            columns: this.columns$.get().map(c => ({ key: c.key })),
        });
    }

    /**
     * Server-side path with LRU cache. Cache key includes query+sort+page+pageSize.
     */
    #runServerSide(): void {
        if (!this.#fetcher) return;
        const params: FetchParams = {
            page    : this.page$.get(),
            pageSize: this.pageSize,
            sort    : this.sortStack$.get(),
            query   : this.query$.get(),
        };
        const cacheKey = JSON.stringify(params);
        const cached = this.#cache.get(cacheKey);
        if (cached) {
            this.totalCount$.set(cached.total);
            this.#renderRows(cached.rows);
            return;
        }
        this.loading$.set(true);
        this.#fetcher(params)
            .then(result => {
                this.#cache.set(cacheKey, result);
                this.totalCount$.set(result.total);
                this.#renderRows(result.rows);
                this.dispatchEvent(new CustomEvent('arianna:fetch', {
                    bubbles: true, detail: { rows: result.rows, total: result.total },
                }));
            })
            .catch(err => {
                console.warn('[Table] fetch failed:', err);
                this.#renderRows([]);
                this.totalCount$.set(0);
            })
            .finally(() => this.loading$.set(false));
    }

    /**
     * Main-thread filter+sort. Optionally returns ALL rows (no pagination,
     * for CSV export).
     */
    #processClientSide(rows: Row[], _alreadyPaged: boolean): Row[] {
        const cols  = this.columns$.get();
        const q     = this.query$.get();
        const sorts = this.sortStack$.get();

        // Filter
        let filtered = rows;
        if (q) {
            const ql = q.toLowerCase();
            filtered = rows.filter(row =>
                cols.some(col => {
                    const v = col.value ? col.value(row) : row[col.key];
                    return String(v ?? '').toLowerCase().includes(ql);
                }),
            );
        }

        // Sort
        if (sorts.length > 0) {
            filtered = filtered.slice().sort((a, b) => {
                for (const s of sorts) {
                    const col = cols.find(c => c.key === s.key);
                    if (!col) continue;
                    if (col.sort) {
                        const r = col.sort(a, b, s.dir);
                        if (r !== 0) return r;
                        continue;
                    }
                    const av = col.value ? col.value(a) : a[col.key];
                    const bv = col.value ? col.value(b) : b[col.key];
                    if (av === bv) continue;
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
    #renderPage(filtered: Row[]): void {
        const ps = this.pageSize;
        const pg = this.page$.get();
        const start = (pg - 1) * ps;
        const sliced = ps > 0 ? filtered.slice(start, start + ps) : filtered;

        // We need to keep original-row indices for selection tracking
        const all = this.rows$.get();
        const indexMap = new Map<Row, number>();
        all.forEach((r, i) => indexMap.set(r, i));

        this.#renderRows(sliced, indexMap);
    }

    /** Final stage: build DisplayRow[] for the current view. */
    #renderRows(rows: Row[], indexMap?: Map<Row, number>): void {
        const cols = this.columns$.get().filter(c =>
            this.visibility$.get()[c.key] !== false && c.visible !== false,
        );
        const sel = this.selected$.get();

        const out: DisplayRow[] = rows.map((row, viewIdx) => {
            const originalIdx = indexMap ? (indexMap.get(row) ?? viewIdx) : viewIdx;
            const selected = sel.has(originalIdx);
            return {
                raw     : row,
                index   : originalIdx,
                selected,
                rowClass: 'ar-table__row' + (selected ? ' ar-table__row--selected' : ''),
                cells   : cols.map(col => {
                    const v = col.value ? col.value(row) : row[col.key];
                    const cellHtml = col.render ? col.render(v, row, col) : escapeHtml(String(v ?? ''));
                    const style = col.align ? `text-align: ${col.align}` : '';
                    return {
                        html     : cellHtml,
                        cellClass: 'ar-table__td' + (col.class ? ' ' + col.class : ''),
                        style,
                    };
                }),
            };
        });

        this.displayRows$.set(out);
    }

    // ── Attrs ────────────────────────────────────────────────────────────────

    get pageSize(): number  { return parseInt(this.getAttribute('page-size') ?? '25', 10) || 25; }
    set pageSize(v: number) { this.setAttribute('page-size', String(v)); }

    get selectable(): SelectMode  { return (this.getAttribute('selectable') ?? 'none') as SelectMode; }
    set selectable(v: SelectMode) { this.setAttribute('selectable', v); }

    get searchable(): boolean  { return this.hasAttribute('searchable'); }
    set searchable(v: boolean) { v ? this.setAttribute('searchable', '') : this.removeAttribute('searchable'); }

    get stickyHeader(): boolean  { return this.hasAttribute('sticky-header'); }
    set stickyHeader(v: boolean) { v ? this.setAttribute('sticky-header', '') : this.removeAttribute('sticky-header'); }

    get columnToggle(): boolean  { return this.hasAttribute('column-toggle'); }
    set columnToggle(v: boolean) { v ? this.setAttribute('column-toggle', '') : this.removeAttribute('column-toggle'); }

    get columnResize(): boolean  { return this.getAttribute('column-resize') !== 'false'; }
    set columnResize(v: boolean) { this.setAttribute('column-resize', v ? 'true' : 'false'); }

    get worker(): boolean  { return this.hasAttribute('worker'); }
    set worker(v: boolean) { v ? this.setAttribute('worker', '') : this.removeAttribute('worker'); }

    get workerThreshold(): number  { return parseInt(this.getAttribute('worker-threshold') ?? '5000', 10) || 5000; }
    set workerThreshold(v: number) { this.setAttribute('worker-threshold', String(v)); }

    // ── Template helpers ────────────────────────────────────────────────────

    private headers         : () => HeaderCell[] = () => [];
    private allRows         : () => DisplayRow[] = () => [];
    private totalPages      : () => number = () => 1;
    private pageButtons     : () => PageBtn[] = () => [];
    private columnEntries   : () => ColToggleEntry[] = () => [];
    private hasMultiplePages: () => boolean = () => false;
    private hasColumnToggle : () => boolean = () => false;
    private hasColumnResize : () => boolean = () => true;
    private toggleMenuOpen  : () => boolean = () => false;
    private isSelectable    : () => boolean = () => false;
    private isMultiSelect   : () => boolean = () => false;
    private isSearchable    : () => boolean = () => false;
    private isLoading       : () => boolean = () => false;
    private totalLabel      : () => string  = () => '';
    private onHeaderClick   : (col: TableColumn, e: Event) => void = () => {};
    private onSearchInput   : (e: Event) => void = () => {};
    private onRowClick      : (dr: DisplayRow, e: Event) => void = () => {};
    private onPageClick     : (btn: PageBtn) => void = () => {};
    private onToggleMenu    : (e: Event) => void = () => {};
    private onColumnToggle  : (key: string, visible: boolean) => void = () => {};
    private onResizeStart   : (col: TableColumn, e: Event) => void = () => {};
    private onExportCsv     : () => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display      : 'flex',
                    flexDirection: 'column',
                    width        : '100%',
                    overflow     : 'hidden',
                    background   : 'var(--arianna-bg, #ffffff)',
                    color        : 'var(--arianna-text, #1f2328)',
                    border       : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius : 'var(--arianna-radius, 6px)',
                    fontSize     : '0.85rem',
                }),

                // Toolbar
                new Rule('.ar-table__toolbar', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg-3, #f8f9fa)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display     : 'flex',
                    gap         : '8px',
                    padding     : '8px 12px',
                }),
                new Rule('.ar-table__search', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    font        : 'inherit',
                    padding     : '5px 10px',
                    width       : '240px',
                    outline     : 'none',
                }),
                new Rule('.ar-table__search:focus', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-table__total', {
                    color   : 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                }),
                new Rule('.ar-table__spinner', {
                    animation: 'ar-table-spin 1s linear infinite',
                    color    : 'var(--arianna-primary, #1f6feb)',
                    display  : 'inline-block',
                }),
                new Rule('@keyframes ar-table-spin', {
                    'from': { transform: 'rotate(0deg)' },
                    'to'  : { transform: 'rotate(360deg)' },
                } as never),
                new Rule('.ar-table__spacer', { flex: '1' }),

                // Column toggle menu
                new Rule('.ar-table__col-toggle', { position: 'relative' }),
                new Rule('.ar-table__col-toggle-btn, .ar-table__export-btn', {
                    background  : 'none',
                    border      : '1px solid transparent',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    font        : 'inherit',
                    fontSize    : '0.9rem',
                    padding     : '4px 10px',
                    transition  : 'background 0.14s ease',
                }),
                new Rule('.ar-table__col-toggle-btn:hover, .ar-table__export-btn:hover', {
                    background: 'var(--arianna-bg, #ffffff)',
                    borderColor: 'var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-table__col-menu', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxShadow   : '0 4px 12px rgba(0,0,0,0.12)',
                    minWidth    : '160px',
                    padding     : '6px 0',
                    position    : 'absolute',
                    right       : '0',
                    top         : 'calc(100% + 4px)',
                    zIndex      : '500',
                }),
                new Rule('.ar-table__col-menu-item', {
                    alignItems: 'center',
                    cursor    : 'pointer',
                    display   : 'flex',
                    fontSize  : '0.82rem',
                    gap       : '8px',
                    padding   : '5px 12px',
                }),
                new Rule('.ar-table__col-menu-item:hover', { background: 'var(--arianna-bg-3, #f8f9fa)' }),

                // Scroll wrapper + table
                new Rule('.ar-table__scroll', {
                    flex     : '1',
                    overflow : 'auto',
                    minHeight: '0',
                }),
                new Rule('.ar-table', {
                    width         : '100%',
                    borderCollapse: 'collapse',
                    tableLayout   : 'fixed',
                }),
                new Rule(':root[sticky-header] .ar-table__thead', {
                    position: 'sticky',
                    top     : '0',
                    zIndex  : '1',
                }),
                new Rule('.ar-table__thead', { background: 'var(--arianna-bg-3, #f8f9fa)' }),
                new Rule('.ar-table__th', {
                    borderBottom : '1px solid var(--arianna-border, #d8d8d8)',
                    color        : 'var(--arianna-muted, #6e6b62)',
                    fontSize     : '0.72rem',
                    fontWeight   : '700',
                    padding      : '10px 12px',
                    position     : 'relative',
                    textAlign    : 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    userSelect   : 'none',
                    whiteSpace   : 'nowrap',
                    overflow     : 'hidden',
                    textOverflow : 'ellipsis',
                }),
                new Rule('.ar-table__th--sortable',       { cursor: 'pointer' }),
                new Rule('.ar-table__th--sortable:hover', { color: 'var(--arianna-text, #1f2328)' }),
                new Rule('.ar-table__th--sorted',         { color: 'var(--arianna-text, #1f2328)' }),
                new Rule('.ar-table__th-sort',  { marginLeft: '6px', fontSize: '0.7rem' }),
                new Rule('.ar-table__th-order', {
                    background  : 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '8px',
                    color       : '#ffffff',
                    fontSize    : '0.62rem',
                    marginLeft  : '4px',
                    padding     : '0 5px',
                }),
                new Rule('.ar-table__th-resize', {
                    bottom : '0',
                    cursor : 'col-resize',
                    height : '100%',
                    position: 'absolute',
                    right  : '0',
                    top    : '0',
                    width  : '6px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-table__th-resize:hover', {
                    background: 'var(--arianna-primary, #1f6feb)',
                }),

                // Body
                new Rule('.ar-table__row', {
                    transition: 'background 0.14s ease',
                    cursor    : 'default',
                }),
                new Rule('.ar-table__row:hover', { background: 'var(--arianna-bg-3, #f8f9fa)' }),
                new Rule('.ar-table__row--selected', { background: 'rgba(31,111,235,0.08)' }),
                new Rule('.ar-table__td', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    padding     : '10px 12px',
                    color       : 'var(--arianna-text, #1f2328)',
                    whiteSpace  : 'nowrap',
                    overflow    : 'hidden',
                    textOverflow: 'ellipsis',
                }),

                // Footer pagination
                new Rule('.ar-table__footer', {
                    display    : 'flex',
                    alignItems : 'center',
                    gap        : '4px',
                    padding    : '10px 12px',
                    borderTop  : '1px solid var(--arianna-border, #d8d8d8)',
                    background : 'var(--arianna-bg-3, #f8f9fa)',
                }),
                new Rule('.ar-table__page', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    font        : 'inherit',
                    fontSize    : '0.8rem',
                    minWidth    : '32px',
                    padding     : '4px 8px',
                    transition  : 'border-color 0.14s ease',
                }),
                new Rule('.ar-table__page:hover:not(:disabled)', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-table__page--active', {
                    background : 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color      : '#ffffff',
                }),
                new Rule('.ar-table__page--dots', {
                    background: 'none',
                    border    : 'none',
                    cursor    : 'default',
                    color     : 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-table__page:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Table', { value: Table, writable: false, enumerable: false, configurable: false });
}

export default Table;
