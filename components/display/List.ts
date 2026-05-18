/**
 * @module    components/display/List
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * List — rich vertical list with optional selection, icons, badges, meta.
 *
 * Two usage modes:
 *   - Programmatic: set `.items` to an array of ListItem; component renders.
 *   - Slot mode:    drop your own `<arianna-list-item>` (any element) as
 *                   children; component just provides the container styling.
 *
 * @example JS
 *   const list = new List();
 *   list.selectable = true;
 *   list.items = [
 *     { id: '1', label: 'Item A', icon: '📄', meta: '2 KB' },
 *     { id: '2', label: 'Item B', icon: '📁', badge: 'New' },
 *   ];
 *   list.addEventListener('arianna:select', e => console.log(e.detail.item));
 *
 * @example HTML
 *   <arianna-list selectable>
 *     <li>Slot mode item</li>
 *   </arianna-list>
 *
 * Events:
 *   - arianna:select   detail: { item, selected }
 *
 * Slots:
 *   default — list items when not using programmatic `.items`
 *
 * Attrs:  selectable, multiselect, dense, divided
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ListItem {
    id        : string;
    label     : string;
    subtitle? : string;
    icon?     : string;
    badge?    : string | number;
    meta?     : string;
    disabled? : boolean;
}

export interface ListOptions {
    selectable?  : boolean;
    multiselect? : boolean;
    dense?       : boolean;
    divided?     : boolean;
}

export class List extends Component('arianna-list', HTMLElement, {}, {
    attrs : ['selectable', 'multiselect', 'dense', 'divided'],
    shadow: false,
})
{
    /** Reactive items list. */
    items$: Signal<ListItem[]> = signal<ListItem[]>([]);

    /** Selected ids set, reactive. */
    selected$: Signal<Set<string>> = signal<Set<string>>(new Set());

    build(_opts: ListOptions = {})
    {
        this.setAttribute('role', this.hasAttribute('selectable') ? 'listbox' : 'list');

        this.hasItems = () => this.items$.get().length > 0;
        this.allItems = () => this.items$.get();
        this.isSelectable = () => this.hasAttribute('selectable');

        this.itemClass = (item: ListItem) => {
            let c = 'ar-list__item';
            if (this.selected$.get().has(item.id)) c += ' ar-list__item--selected';
            if (item.disabled)                      c += ' ar-list__item--disabled';
            return c;
        };
        this.itemRole = () => this.isSelectable() ? 'option' : 'listitem';
        this.itemClick = (item: ListItem) => {
            if (item.disabled || !this.isSelectable()) return;
            const cur = new Set(this.selected$.get());
            const multi = this.hasAttribute('multiselect');
            if (!multi) cur.clear();
            if (cur.has(item.id)) cur.delete(item.id);
            else                   cur.add(item.id);
            this.selected$.set(cur);
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true,
                detail : { item, selected: [...cur] },
            }));
        };

        this.template = html`
            <ul class="ar-list__container" a-if="this.hasItems()">
                <li a-for="item in this.allItems()"
                    :class="this.itemClass(item)"
                    :role="this.itemRole()"
                    @click="(e) => this.itemClick(item)">
                    <span class="ar-list__icon"     a-if="item.icon">{{ item.icon }}</span>
                    <div  class="ar-list__body">
                        <div class="ar-list__label">{{ item.label }}</div>
                        <div class="ar-list__subtitle" a-if="item.subtitle">{{ item.subtitle }}</div>
                    </div>
                    <span class="ar-list__badge" a-if="item.badge !== undefined">{{ item.badge }}</span>
                    <span class="ar-list__meta"  a-if="item.meta">{{ item.meta }}</span>
                </li>
            </ul>
            <ul class="ar-list__container" a-if="!this.hasItems()">
                <slot></slot>
            </ul>
        `;

        this.Sheet = List.DefaultSheet();
    }

    /** Replace the items list. */
    set items(v: ListItem[]) { this.items$.set(v ?? []); }
    get items(): ListItem[]  { return this.items$.get(); }

    /** Currently-selected item ids. */
    get selected(): Set<string> { return this.selected$.get(); }
    clearSelection(): void { this.selected$.set(new Set()); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get selectable(): boolean  { return this.hasAttribute('selectable'); }
    set selectable(v: boolean) { v ? this.setAttribute('selectable', '') : this.removeAttribute('selectable'); }

    get multiselect(): boolean  { return this.hasAttribute('multiselect'); }
    set multiselect(v: boolean) { v ? this.setAttribute('multiselect', '') : this.removeAttribute('multiselect'); }

    get dense(): boolean  { return this.hasAttribute('dense'); }
    set dense(v: boolean) { v ? this.setAttribute('dense', '') : this.removeAttribute('dense'); }

    get divided(): boolean  { return this.hasAttribute('divided'); }
    set divided(v: boolean) { v ? this.setAttribute('divided', '') : this.removeAttribute('divided'); }

    private hasItems    : () => boolean = () => false;
    private allItems    : () => ListItem[] = () => [];
    private isSelectable: () => boolean = () => false;
    private itemClass   : (i: ListItem) => string = () => 'ar-list__item';
    private itemRole    : () => string = () => 'listitem';
    private itemClick   : (i: ListItem) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'block' }),
                new Rule('.ar-list__container', {
                    listStyle: 'none',
                    margin   : '0',
                    padding  : '0',
                }),
                new Rule(':root[divided] .ar-list__item:not(:last-child)', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-list__item', {
                    alignItems: 'center',
                    display   : 'flex',
                    gap       : '10px',
                    padding   : '10px 12px',
                    transition: 'background 0.18s ease',
                }),
                new Rule(':root[dense] .ar-list__item', { padding: '6px 12px' }),
                new Rule('.ar-list__item:hover:not(.ar-list__item--disabled)', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-list__item--selected', { background: 'rgba(31,111,235,0.1)' }),
                new Rule('.ar-list__item--disabled', { opacity: '0.45' }),
                new Rule('.ar-list__icon', { flexShrink: '0', fontSize: '1rem' }),
                new Rule('.ar-list__body', { flex: '1', minWidth: '0' }),
                new Rule('.ar-list__label', {
                    fontSize    : '0.83rem',
                    overflow    : 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace  : 'nowrap',
                }),
                new Rule('.ar-list__subtitle', {
                    color    : 'var(--arianna-muted, #8b949e)',
                    fontSize : '0.74rem',
                    marginTop: '1px',
                }),
                new Rule('.ar-list__badge', {
                    background  : 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '10px',
                    color       : '#fff',
                    fontSize    : '0.66rem',
                    fontWeight  : '600',
                    padding     : '1px 6px',
                }),
                new Rule('.ar-list__meta', {
                    color     : 'var(--arianna-muted, #8b949e)',
                    fontSize  : '0.74rem',
                    whiteSpace: 'nowrap',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'List', {
        value: List, writable: false, enumerable: false, configurable: false,
    });
}

export default List;
