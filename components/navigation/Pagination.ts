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
 * Attrs:  total, page-size, page, siblings
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface PaginationOptions {
    total?    : number;
    pageSize? : number;
    page?     : number;
    siblings? : number;
}

interface PagEntry {
    type    : 'btn' | 'dots';
    label   : string;
    page?   : number;
    active? : boolean;
    disabled?: boolean;
}

export class Pagination extends Component('arianna-pagination', HTMLElement, {}, {
    attrs : ['total', 'page-size', 'page', 'siblings'],
    shadow: false,
})
{
    build(_opts: PaginationOptions = {})
    {
        this.setAttribute('role', 'navigation');
        this.setAttribute('aria-label', 'Pagination');

        const total    = this.attrSignal('total');
        const pageSize = this.attrSignal('page-size');
        const page     = this.attrSignal('page');
        const siblings = this.attrSignal('siblings');

        const totalPages = (): number => Math.ceil(
            (parseInt(total.get() ?? '0', 10) || 0) /
            (parseInt(pageSize.get() ?? '10', 10) || 10),
        );
        const currentPage = (): number => Math.max(1, parseInt(page.get() ?? '1', 10) || 1);
        const sibs       = (): number => parseInt(siblings.get() ?? '1', 10) || 1;

        this.hasPages = () => totalPages() > 1;
        this.entries  = () => {
            const tp = totalPages();
            const cur = currentPage();
            const sib = sibs();
            const out: PagEntry[] = [];

            // Previous
            out.push({ type: 'btn', label: '‹', page: cur - 1, disabled: cur <= 1 });

            const start = Math.max(1, cur - sib);
            const end   = Math.min(tp, cur + sib);

            if (start > 1) {
                out.push({ type: 'btn', label: '1', page: 1 });
                if (start > 2) out.push({ type: 'dots', label: '…' });
            }
            for (let p = start; p <= end; p++) {
                out.push({ type: 'btn', label: String(p), page: p, active: p === cur });
            }
            if (end < tp) {
                if (end < tp - 1) out.push({ type: 'dots', label: '…' });
                out.push({ type: 'btn', label: String(tp), page: tp });
            }

            // Next
            out.push({ type: 'btn', label: '›', page: cur + 1, disabled: cur >= tp });
            return out;
        };

        this.isBtn  = (e: PagEntry) => e.type === 'btn';
        this.isDots = (e: PagEntry) => e.type === 'dots';

        this.btnClass = (e: PagEntry) =>
            'ar-pagination__btn' + (e.active ? ' ar-pagination__btn--active' : '');

        this.onGo = (target: number) => {
            const tp = totalPages();
            if (target < 1 || target > tp) return;
            this.setAttribute('page', String(target));
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { page: target, totalPages: tp },
            }));
        };

        this.template = html`
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

        this.Sheet = Pagination.DefaultSheet();
    }

    get totalPages(): number {
        const t = parseInt(this.getAttribute('total') ?? '0', 10) || 0;
        const ps = parseInt(this.getAttribute('page-size') ?? '10', 10) || 10;
        return Math.ceil(t / ps);
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get total(): number  { return parseInt(this.getAttribute('total') ?? '0', 10); }
    set total(v: number) { this.setAttribute('total', String(v)); }

    get pageSize(): number  { return parseInt(this.getAttribute('page-size') ?? '10', 10); }
    set pageSize(v: number) { this.setAttribute('page-size', String(v)); }

    get page(): number  { return parseInt(this.getAttribute('page') ?? '1', 10); }
    set page(v: number) { this.setAttribute('page', String(v)); }

    get siblings(): number  { return parseInt(this.getAttribute('siblings') ?? '1', 10); }
    set siblings(v: number) { this.setAttribute('siblings', String(v)); }

    private hasPages: () => boolean = () => false;
    private entries : () => PagEntry[] = () => [];
    private isBtn   : (e: PagEntry) => boolean = () => false;
    private isDots  : (e: PagEntry) => boolean = () => false;
    private btnClass: (e: PagEntry) => string = () => '';
    private onGo    : (n: number) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'block' }),
                new Rule('.ar-pagination__row', { display: 'flex', alignItems: 'center', gap: '4px' }),
                new Rule('.ar-pagination__btn', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    font        : 'inherit',
                    fontSize    : '0.82rem',
                    minWidth    : '32px',
                    padding     : '4px 8px',
                    transition  : 'border-color 0.18s ease',
                }),
                new Rule('.ar-pagination__btn:hover:not(:disabled)', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-pagination__btn--active', {
                    background : 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color      : '#ffffff',
                }),
                new Rule('.ar-pagination__btn:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
                new Rule('.ar-pagination__dots', {
                    color  : 'var(--arianna-muted, #8b949e)',
                    padding: '0 4px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Pagination', {
        value: Pagination, writable: false, enumerable: false, configurable: false,
    });
}

export default Pagination;
