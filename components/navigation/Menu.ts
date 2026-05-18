/**
 * @module    components/navigation/Menu
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Menu — floating context menu / dropdown. Opened programmatically at a
 * point or below an anchor element. Auto-closes on outside click and Escape.
 *
 * @example JS
 *   const m = new Menu();
 *   m.items = [
 *     { id: 'copy',   label: 'Copy',   icon: '📋', shortcut: '⌘C' },
 *     { id: 'paste',  label: 'Paste',  icon: '📝', shortcut: '⌘V' },
 *     { id: '_sep',   label: '', separator: true },
 *     { id: 'delete', label: 'Delete', icon: '🗑️', danger: true },
 *   ];
 *   m.addEventListener('arianna:select', e => console.log(e.detail.id));
 *   button.addEventListener('click', () => m.openBelow(button));
 *
 * Events:
 *   - arianna:open
 *   - arianna:close
 *   - arianna:select  detail: { id, item }
 *
 * Slots:  (none — programmatic items only)
 * Attrs:  (none)
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface MenuItem {
    id         : string;
    label      : string;
    icon?      : string;
    shortcut?  : string;
    disabled?  : boolean;
    danger?    : boolean;
    separator? : boolean;
}

export interface MenuOptions {
    items? : MenuItem[];
}

export class Menu extends Component('arianna-menu', HTMLElement, {}, {
    attrs : [],
    shadow: false,
})
{
    items$: Signal<MenuItem[]> = signal<MenuItem[]>([]);

    #outsideClick: ((e: Event) => void) | null = null;
    #keydown     : ((e: KeyboardEvent) => void) | null = null;

    build(_opts: MenuOptions = {})
    {
        // Move to body (fixed positioning ignores stacking contexts) — only
        // if we're not already there.
        if (this.parentElement !== document.body) document.body.appendChild(this);
        this.style.display = 'none';

        this.allItems = () => this.items$.get();
        this.isSep    = (item: MenuItem) => !!item.separator;
        this.notSep   = (item: MenuItem) => !item.separator;
        this.itemClass = (item: MenuItem) => {
            let c = 'ar-menu__item';
            if (item.disabled) c += ' ar-menu__item--disabled';
            if (item.danger)   c += ' ar-menu__item--danger';
            return c;
        };
        this.onItemClick = (item: MenuItem, e: Event) => {
            e.stopPropagation();
            if (item.disabled) return;
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { id: item.id, item },
            }));
            this.close();
        };

        this.template = html`
            <div class="ar-menu__sep" a-for="item in this.allItems()" a-if="this.isSep(item)"></div>
            <button :class="this.itemClass(item)"
                    a-for="item in this.allItems()"
                    a-if="this.notSep(item)"
                    :disabled="item.disabled"
                    @click="(e) => this.onItemClick(item, e)">
                <span class="ar-menu__icon" a-if="item.icon">{{ item.icon }}</span>
                <span class="ar-menu__label">{{ item.label }}</span>
                <span class="ar-menu__shortcut" a-if="item.shortcut">{{ item.shortcut }}</span>
            </button>
        `;

        this.Sheet = Menu.DefaultSheet();
    }

    set items(v: MenuItem[]) { this.items$.set(v ?? []); }
    get items(): MenuItem[]  { return this.items$.get(); }

    /** Open the menu at viewport coordinates (x, y). */
    openAt(x: number, y: number): this
    {
        this.style.display = '';
        const w = this.offsetWidth  || 180;
        const h = this.offsetHeight || 200;
        this.style.left = (x + w > window.innerWidth  ? window.innerWidth  - w - 8 : x) + 'px';
        this.style.top  = (y + h > window.innerHeight ? window.innerHeight - h - 8 : y) + 'px';

        // Outside click closes the menu (next tick so the open click doesn't trigger)
        this.#outsideClick = () => this.close();
        this.#keydown      = (e: KeyboardEvent) => { if (e.key === 'Escape') this.close(); };
        setTimeout(() => {
            document.addEventListener('click',  this.#outsideClick!);
            document.addEventListener('keydown', this.#keydown!);
        }, 0);

        this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: {} }));
        return this;
    }

    /** Open the menu below an anchor element. */
    openBelow(anchor: HTMLElement): this
    {
        const r = anchor.getBoundingClientRect();
        return this.openAt(r.left, r.bottom + 4);
    }

    close(): this
    {
        this.style.display = 'none';
        if (this.#outsideClick) document.removeEventListener('click',   this.#outsideClick);
        if (this.#keydown)      document.removeEventListener('keydown', this.#keydown);
        this.#outsideClick = null;
        this.#keydown      = null;
        this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
        return this;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        if (this.#outsideClick) document.removeEventListener('click',   this.#outsideClick);
        if (this.#keydown)      document.removeEventListener('keydown', this.#keydown);
    }

    private allItems   : () => MenuItem[] = () => [];
    private isSep      : (item: MenuItem) => boolean = () => false;
    private notSep     : (item: MenuItem) => boolean = () => false;
    private itemClass  : (item: MenuItem) => string = () => '';
    private onItemClick: (item: MenuItem, e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    boxShadow   : '0 8px 24px rgba(0,0,0,0.18)',
                    display     : 'flex',
                    flexDirection: 'column',
                    minWidth    : '180px',
                    overflow    : 'hidden',
                    padding     : '4px 0',
                    position    : 'fixed',
                    zIndex      : '2000',
                }),
                new Rule('.ar-menu__item', {
                    alignItems: 'center',
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-text, #1f2328)',
                    cursor    : 'pointer',
                    display   : 'flex',
                    font      : 'inherit',
                    fontSize  : '0.82rem',
                    gap       : '8px',
                    padding   : '7px 14px',
                    textAlign : 'left',
                    width     : '100%',
                    transition: 'background 0.18s ease',
                }),
                new Rule('.ar-menu__item:hover:not(:disabled)', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-menu__item--danger', { color: 'var(--arianna-danger, #cf222e)' }),
                new Rule('.ar-menu__item--disabled', { opacity: '0.4', cursor: 'not-allowed' }),
                new Rule('.ar-menu__label',    { flex: '1' }),
                new Rule('.ar-menu__shortcut', {
                    color   : 'var(--arianna-muted, #8b949e)',
                    fontSize: '0.72rem',
                }),
                new Rule('.ar-menu__icon', {
                    width     : '16px',
                    textAlign : 'center',
                    flexShrink: '0',
                }),
                new Rule('.ar-menu__sep', {
                    background: 'var(--arianna-border, #d8d8d8)',
                    height    : '1px',
                    margin    : '4px 0',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Menu', {
        value: Menu, writable: false, enumerable: false, configurable: false,
    });
}

export default Menu;
