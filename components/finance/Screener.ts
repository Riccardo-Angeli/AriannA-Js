/**
 * @module    components/finance/Screener
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Screener — table of tradable instruments with column-driven formatting.
 *   • `symbol` cell rendered bold
 *   • `change` cell colored green if ≥ 0, red if < 0, with `+`/`-` sign and `%`
 *   • Other numeric cells formatted via `_fmtK` (short K/M/B form)
 *
 * @example JS
 *   const s = new Screener();
 *   s.columns = ['symbol', 'price', 'change', 'volume', 'marketCap'];
 *   s.rows = [
 *     { symbol: 'AAPL', price: 215.5, change:  1.24, volume: 45_000_000, marketCap: 3.3e12 },
 *     { symbol: 'MSFT', price: 432.1, change: -0.85, volume: 22_000_000, marketCap: 3.1e12 },
 *   ];
 *
 * @example HTML
 *   <arianna-screener></arianna-screener>
 *
 * Attrs:  (none — programmatic columns/rows only)
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';
import { _fmt, _fmtK, _esc } from './helpers.ts';

export interface ScreenerRow {
    symbol     : string;
    price      : number;
    change     : number;
    volume     : number;
    marketCap? : number;
    [key: string]: unknown;
}

export interface ScreenerOptions {
    rows?    : ScreenerRow[];
    columns? : (keyof ScreenerRow)[];
}

interface HeaderCell { label: string; }
interface BodyCell   { html: string; cls: string; }
interface BodyRow    { cells: BodyCell[]; }

export class Screener extends Component('arianna-screener', HTMLElement, {}, {
    attrs : [],
    shadow: false,
})
{
    rows$    : Signal<ScreenerRow[]>           = signal<ScreenerRow[]>([]);
    columns$ : Signal<(keyof ScreenerRow)[]>   = signal<(keyof ScreenerRow)[]>(
        ['symbol', 'price', 'change', 'volume'],
    );

    build(_opts: ScreenerOptions = {})
    {
        this.headerCells = (): HeaderCell[] =>
            this.columns$.get().map(c => ({ label: String(c).toUpperCase() }));

        this.bodyRows = (): BodyRow[] => {
            const cols = this.columns$.get();
            return this.rows$.get().map(row => ({
                cells: cols.map(c => this.#formatCell(c, row[c])),
            }));
        };

        this.template = html`
            <table class="ar-screener__table">
                <thead>
                    <tr>
                        <th class="ar-screener__th" a-for="h in this.headerCells()">{{ h.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="ar-screener__row" a-for="r in this.bodyRows()">
                        <td :class="cell.cls" a-for="cell in r.cells" a-html="cell.html"></td>
                    </tr>
                </tbody>
            </table>
        `;

        this.Sheet = Screener.DefaultSheet();
    }

    set rows(v: ScreenerRow[]) { this.rows$.set(v ?? []); }
    get rows(): ScreenerRow[]  { return this.rows$.get(); }

    set columns(v: (keyof ScreenerRow)[]) { this.columns$.set(v ?? []); }
    get columns(): (keyof ScreenerRow)[]  { return this.columns$.get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    #formatCell(col: keyof ScreenerRow, raw: unknown): BodyCell
    {
        if (col === 'change') {
            const n = Number(raw) || 0;
            const sign = n >= 0 ? '+' : '';
            return {
                html: `${sign}${_fmt(n)}%`,
                cls : 'ar-screener__td ar-screener__td--' + (n >= 0 ? 'up' : 'down'),
            };
        }
        if (col === 'symbol') {
            return {
                html: _esc(String(raw ?? '')),
                cls : 'ar-screener__td ar-screener__td--symbol',
            };
        }
        if (typeof raw === 'number') {
            return { html: _fmtK(raw), cls: 'ar-screener__td ar-screener__td--num' };
        }
        return { html: _esc(String(raw ?? '')), cls: 'ar-screener__td' };
    }

    private headerCells: () => HeaderCell[] = () => [];
    private bodyRows   : () => BodyRow[] = () => [];

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'block',
                    fontFamily  : 'inherit',
                    fontSize    : '13px',
                    overflow    : 'auto',
                }),
                new Rule('.ar-screener__table', {
                    borderCollapse: 'collapse',
                    width: '100%',
                }),
                new Rule('.ar-screener__th', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    color       : 'var(--arianna-muted, #787b86)',
                    fontWeight  : '500',
                    padding     : '8px 12px',
                    textAlign   : 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize    : '11px',
                }),
                new Rule('.ar-screener__row', {
                    borderBottom: '1px solid var(--arianna-bg-3, #f1f1f1)',
                    transition  : 'background 0.14s ease',
                }),
                new Rule('.ar-screener__row:hover', {
                    background: 'var(--arianna-bg-3, #f8f9fa)',
                }),
                new Rule('.ar-screener__td', { padding: '6px 12px' }),
                new Rule('.ar-screener__td--symbol', {
                    color     : 'var(--arianna-text, #1f2328)',
                    fontWeight: '600',
                }),
                new Rule('.ar-screener__td--num', { textAlign: 'right' }),
                new Rule('.ar-screener__td--up',   { color: 'var(--arianna-bull, #26a69a)' }),
                new Rule('.ar-screener__td--down', { color: 'var(--arianna-bear, #ef5350)' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Screener', {
        value: Screener, writable: false, enumerable: false, configurable: false,
    });
}

export default Screener;
