import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes:  (none)
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
}
export interface MenuOptions {
    items?: MenuItem[];
}

export const Styles: Stylesheet = (() =>
{
        return new Stylesheet([
            new Rule('.Menu', {
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
            new Rule('.Menu[theme="light"]', {
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
            new Rule('.Menu', {
                background: 'var(--arianna-bg, #ffffff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: 'var(--arianna-radius, 8px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '180px',
                overflow: 'hidden',
                padding: '4px 0',
                position: 'fixed',
                zIndex: '2000',
            }),
            new Rule('.Menu-Item', {
                alignItems: 'center',
                background: 'none',
                border: 'none',
                color: 'var(--arianna-text, #1f2328)',
                cursor: 'pointer',
                display: 'flex',
                font: 'inherit',
                fontSize: '0.82rem',
                gap: '8px',
                padding: '7px 14px',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.18s ease',
            }),
            new Rule('.Menu-Item:hover:not(:disabled)', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
            new Rule('.Menu-Item-Danger', { color: 'var(--arianna-danger, #cf222e)' }),
            new Rule('.Menu-Item-Disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            new Rule('.Menu-Label', { flex: '1' }),
            new Rule('.Menu-Shortcut', {
                color: 'var(--arianna-muted, #8b949e)',
                fontSize: '0.72rem',
            }),
            new Rule('.Menu-Icon', {
                width: '16px',
                textAlign: 'center',
                flexShrink: '0',
            }),
            new Rule('.Menu-Separator', {
                background: 'var(--arianna-border, #d8d8d8)',
                height: '1px',
                margin: '4px 0',
            }),
        ]);
    
})();

@Component('arianna-menu', Styles, {
    Shadow: false,
    Attributes: ['theme', 'items'],
    Properties: ['items'],
})
export class Menu extends HTMLElement {
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    private _itemsSignal?: Signal<MenuItem[]>;
    public get items$(): Signal<MenuItem[]>
    {
        this._itemsSignal ??= signal<MenuItem[]>([]);
        return this._itemsSignal;
    }
    private _outsideClick: ((e: Event) => void) | null = null;
    private _keydown: ((e: KeyboardEvent) => void) | null = null;
    onConnected(_opts: MenuOptions = {}) {
        this.classList.add('Menu');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        // Move to body (fixed positioning ignores stacking contexts) — only
        // if we're not already there.
        if (this.parentElement !== document.body)
            document.body.appendChild(this);
        this.style.display = 'none';
        this.allItems = () => this.items$.Get();
        this.isSep = (item: MenuItem) => !!item.separator;
        this.notSep = (item: MenuItem) => !item.separator;
        this.itemClass = (item: MenuItem) => {
            let c = 'Menu-Item';
            if (item.disabled)
                c += ' Menu-Item-Disabled';
            if (item.danger)
                c += ' Menu-Item-Danger';
            return c;
        };
        this.onItemClick = (item: MenuItem, e: Event) => {
            e.stopPropagation();
            if (item.disabled)
                return;
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { id: item.id, item },
            }));
            this.close();
        };
        this.template = html `
            <div class="Menu-Separator" a-for="item in this.allItems()" a-if="this.isSep(item)"></div>
            <button :class="this.itemClass(item)"
                    a-for="item in this.allItems()"
                    a-if="this.notSep(item)"
                    :disabled="item.disabled"
                    @click="(e) => this.onItemClick(item, e)">
                <span class="Menu-Icon" a-if="item.icon">{{ item.icon }}</span>
                <span class="Menu-Label">{{ item.label }}</span>
                <span class="Menu-Shortcut" a-if="item.shortcut">{{ item.shortcut }}</span>
            </button>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Styles;
    }
    set items(v: MenuItem[]) { this.items$.Set(v ?? []); }
    get items(): MenuItem[] { return this.items$.Get(); }
    /** Open the menu at viewport coordinates (x, y). */
    openAt(x: number, y: number): this {
        this.style.display = '';
        const w = this.offsetWidth || 180;
        const h = this.offsetHeight || 200;
        this.style.left = (x + w > window.innerWidth ? window.innerWidth - w - 8 : x) + 'px';
        this.style.top = (y + h > window.innerHeight ? window.innerHeight - h - 8 : y) + 'px';
        // Outside click closes the menu (next tick so the open click doesn't trigger)
        this._outsideClick = () => this.close();
        this._keydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape')
                this.close();
        };
        setTimeout(() => {
            document.addEventListener('click', this._outsideClick!);
            document.addEventListener('keydown', this._keydown!);
        }, 0);
        this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: {} }));
        return this;
    }
    /** Open the menu below an anchor element. */
    openBelow(anchor: HTMLElement): this {
        const r = anchor.getBoundingClientRect();
        return this.openAt(r.left, r.bottom + 4);
    }
    close(): this {
        this.style.display = 'none';
        if (this._outsideClick)
            document.removeEventListener('click', this._outsideClick);
        if (this._keydown)
            document.removeEventListener('keydown', this._keydown);
        this._outsideClick = null;
        this._keydown = null;
        this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
        return this;
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() {
        if (this._outsideClick)
            document.removeEventListener('click', this._outsideClick);
        if (this._keydown)
            document.removeEventListener('keydown', this._keydown);
    }
    private allItems: () => MenuItem[] = () => [];
    private isSep: (item: MenuItem) => boolean = () => false;
    private notSep: (item: MenuItem) => boolean = () => false;
    private itemClass: (item: MenuItem) => string = () => '';
    private onItemClick: (item: MenuItem, e: Event) => void = () => { };
    public static readonly Styles = Styles;
    static DefaultSheet(): Stylesheet { return Styles; }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Menu namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Menu {
    export namespace Interfaces {
        export interface Item extends MenuItem {
        }
        export interface Options extends MenuOptions {
        }
    }
}
export default Menu;
