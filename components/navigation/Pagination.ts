import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/navigation/Pagination
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Pagination — page navigation control with ellipsis truncation for long
 * page ranges.
 *
 * @example JS
 *   const p = new Pagination();
 *   p.total    = 250;
 *   p.pageSize = 10;
 *   p.page     = 4;
 *   p.addEventListener('arianna:change', e => loadPage(e.detail.page));
 *
 * @example HTML
 *   <arianna-pagination total="250" page-size="10" page="1" siblings="1"></arianna-pagination>
 *
 * Events:
 *   - arianna:change   detail: { page, totalPages }
 *
 * Slots:  (none)
 * Attributes:  total, page-size, page, siblings
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface PaginationOptions {
    total?: number;
    pageSize?: number;
    page?: number;
    siblings?: number;
}
interface PagEntry {
    type: 'btn' | 'dots';
    label: string;
    page?: number;
    active?: boolean;
    disabled?: boolean;
}

export const Styles: Stylesheet = (() =>
{
        return new Stylesheet([
            new Rule('.Pagination', {
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
            new Rule('.Pagination[theme="light"]', {
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
            new Rule('.Pagination', { display: 'block' }),
            new Rule('.Pagination-Row', { display: 'flex', alignItems: 'center', gap: '4px' }),
            new Rule('.Pagination-Button', {
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
            new Rule('.Pagination-Button:hover:not(:disabled)', {
                borderColor: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.Pagination-Button-Active', {
                background: 'var(--arianna-primary, #1f6feb)',
                borderColor: 'var(--arianna-primary, #1f6feb)',
                color: '#ffffff',
            }),
            new Rule('.Pagination-Button:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            new Rule('.Pagination-Dots', {
                color: 'var(--arianna-muted, #8b949e)',
                padding: '0 4px',
            }),
        ]);
    
})();

@Component('arianna-pagination', Styles, {
    Shadow: false,
    Attributes: ['total', 'page-size', 'page', 'siblings', 'theme'],
})
export class Pagination extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: PaginationOptions = {}) {
        this.classList.add('Pagination');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        this.setAttribute('role', 'navigation');
        this.setAttribute('aria-label', 'Pagination');
        const total = this.signal().attribute('total');
        const pageSize = this.signal().attribute('page-size');
        const page = this.signal().attribute('page');
        const siblings = this.signal().attribute('siblings');
        const totalPages = (): number => Math.ceil((parseInt(total.Get() ?? '0', 10) || 0) /
            (parseInt(pageSize.Get() ?? '10', 10) || 10));
        const currentPage = (): number => Math.max(1, parseInt(page.Get() ?? '1', 10) || 1);
        const sibs = (): number => parseInt(siblings.Get() ?? '1', 10) || 1;
        this.hasPages = () => totalPages() > 1;
        this.entries = () => {
            const tp = totalPages();
            const cur = currentPage();
            const sib = sibs();
            const out: PagEntry[] = [];
            // Previous
            out.push({ type: 'btn', label: '‹', page: cur - 1, disabled: cur <= 1 });
            const start = Math.max(1, cur - sib);
            const end = Math.min(tp, cur + sib);
            if (start > 1) {
                out.push({ type: 'btn', label: '1', page: 1 });
                if (start > 2)
                    out.push({ type: 'dots', label: '…' });
            }
            for (let p = start; p <= end; p++) {
                out.push({ type: 'btn', label: String(p), page: p, active: p === cur });
            }
            if (end < tp) {
                if (end < tp - 1)
                    out.push({ type: 'dots', label: '…' });
                out.push({ type: 'btn', label: String(tp), page: tp });
            }
            // Next
            out.push({ type: 'btn', label: '›', page: cur + 1, disabled: cur >= tp });
            return out;
        };
        this.isBtn = (e: PagEntry) => e.type === 'btn';
        this.isDots = (e: PagEntry) => e.type === 'dots';
        this.btnClass = (e: PagEntry) => 'Pagination-Button' + (e.active ? ' Pagination-Button-Active' : '');
        this.onGo = (target: number) => {
            const tp = totalPages();
            if (target < 1 || target > tp)
                return;
            this.setAttribute('page', String(target));
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { page: target, totalPages: tp },
            }));
        };
        this.template = html `
            <div a-if="this.hasPages()" class="Pagination-Row">
                <button a-for="e in this.entries()"
                        a-if="this.isBtn(e)"
                        :class="this.btnClass(e)"
                        :disabled="e.disabled"
                        @click="(_) => this.onGo(e.page)">{{ e.label }}</button>
                <span a-for="e in this.entries()"
                      a-if="this.isDots(e)"
                      class="Pagination-Dots">{{ e.label }}</span>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Styles;
    }
    get totalPages(): number {
        const t = parseInt(this.getAttribute('total') ?? '0', 10) || 0;
        const ps = parseInt(this.getAttribute('page-size') ?? '10', 10) || 10;
        return Math.ceil(t / ps);
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get total(): number { return parseInt(this.getAttribute('total') ?? '0', 10); }
    set total(v: number) { this.setAttribute('total', String(v)); }
    get pageSize(): number { return parseInt(this.getAttribute('page-size') ?? '10', 10); }
    set pageSize(v: number) { this.setAttribute('page-size', String(v)); }
    get page(): number { return parseInt(this.getAttribute('page') ?? '1', 10); }
    set page(v: number) { this.setAttribute('page', String(v)); }
    get siblings(): number { return parseInt(this.getAttribute('siblings') ?? '1', 10); }
    set siblings(v: number) { this.setAttribute('siblings', String(v)); }
    private hasPages: () => boolean = () => false;
    private entries: () => PagEntry[] = () => [];
    private isBtn: (e: PagEntry) => boolean = () => false;
    private isDots: (e: PagEntry) => boolean = () => false;
    private btnClass: (e: PagEntry) => string = () => '';
    private onGo: (n: number) => void = () => { };
    public static readonly Styles = Styles;
    static DefaultSheet(): Stylesheet { return Styles; }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Pagination namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Pagination {
    export namespace Interfaces {
        export interface Options extends PaginationOptions {
        }
        export interface PagEntryContract extends PagEntry {
        }
    }
}
export default Pagination;
