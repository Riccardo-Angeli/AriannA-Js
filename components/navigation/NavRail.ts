import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/navigation/NavRail
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * NavRail — vertical navigation rail (Material/Flutter style). Collapsible
 * to icon-only mode.
 *
 * @example JS
 *   const r = new NavRail();
 *   r.items = [
 *     { id: 'home',     label: 'Home',     icon: '🏠' },
 *     { id: 'settings', label: 'Settings', icon: '⚙️', badge: 3 },
 *   ];
 *   r.active = 'home';
 *   r.addEventListener('arianna:select', e => router.go(e.detail.id));
 *
 * @example HTML
 *   <arianna-nav-rail collapsed></arianna-nav-rail>
 *
 * Events:
 *   - arianna:select   detail: { id, item }
 *   - arianna:toggle   detail: { collapsed }
 *
 * Slots:  (none)
 * Attributes:  collapsed, active
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
export interface NavRailItem {
    id: string;
    label: string;
    icon: string;
    badge?: string | number;
}
export interface NavRailOptions {
    items?: NavRailItem[];
    collapsed?: boolean;
    active?: string;
}

export const Styles: Stylesheet = (() =>
{
        return new Stylesheet([
            new Rule('.NavRail', {
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
            new Rule('.NavRail[theme="light"]', {
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
            new Rule('.NavRail', {
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '8px 6px',
                width: '220px',
                transition: 'width 0.18s ease',
            }),
            new Rule('.NavRail[collapsed]', { width: '56px' }),
            new Rule('.NavRail-Toggle', {
                background: 'none',
                border: 'none',
                color: 'var(--arianna-muted, #8b949e)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '6px',
                textAlign: 'right',
            }),
            new Rule('.NavRail-Item', {
                alignItems: 'center',
                background: 'none',
                border: 'none',
                borderRadius: 'var(--arianna-radius, 6px)',
                color: 'var(--arianna-muted, #8b949e)',
                cursor: 'pointer',
                display: 'flex',
                gap: '10px',
                font: 'inherit',
                fontSize: '0.83rem',
                padding: '9px 10px',
                textAlign: 'left',
                transition: 'background 0.18s ease, color 0.18s ease',
                whiteSpace: 'nowrap',
                width: '100%',
                overflow: 'hidden',
            }),
            new Rule('.NavRail-Item:hover', {
                background: 'var(--arianna-bg-3, #f3f3f3)',
                color: 'var(--arianna-text, #1f2328)',
            }),
            new Rule('.NavRail-Item-Active', {
                background: 'rgba(31,111,235,0.12)',
                color: 'var(--arianna-primary, #1f6feb)',
                fontWeight: '600',
            }),
            new Rule('.NavRail-Icon', {
                flexShrink: '0',
                fontSize: '1.1rem',
                width: '20px',
                textAlign: 'center',
            }),
            new Rule('.NavRail-Label', { flex: '1' }),
            new Rule('.NavRail[collapsed] .NavRail-Label', { display: 'none' }),
            new Rule('.NavRail[collapsed] .NavRail-Badge', { display: 'none' }),
            new Rule('.NavRail-Badge', {
                background: 'var(--arianna-danger, #cf222e)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.65rem',
                padding: '1px 5px',
            }),
        ]);
    
})();

@Component('arianna-nav-rail', Styles, {
    Shadow: false,
    Attributes: ['collapsed', 'active', 'theme', 'items'],
    Properties: ['items'],
})
export class NavRail extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    private _itemsSignal?: Signal<NavRailItem[]>;
    public get items$(): Signal<NavRailItem[]>
    {
        this._itemsSignal ??= signal<NavRailItem[]>([]);
        return this._itemsSignal;
    }
    onConnected(_opts: NavRailOptions = {}) {
        this.classList.add('NavRail');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        const active = this.signal().attribute('active');
        this.allItems = () => this.items$.Get();
        this.isCollapsed = () => this.hasAttribute('collapsed');
        this.toggleIcon = () => this.isCollapsed() ? '▸' : '◂';
        this.itemClass = (item: NavRailItem) => {
            const isActive = item.id === (active.Get() ?? '');
            return 'NavRail-Item' + (isActive ? ' NavRail-Item-Active' : '');
        };
        this.onToggle = () => {
            const newC = !this.isCollapsed();
            if (newC)
                this.setAttribute('collapsed', '');
            else
                this.removeAttribute('collapsed');
            this.dispatchEvent(new CustomEvent('arianna:toggle', {
                bubbles: true, detail: { collapsed: newC },
            }));
        };
        this.onItemClick = (item: NavRailItem) => {
            this.setAttribute('active', item.id);
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { id: item.id, item },
            }));
        };
        this.template = html `
            <button class="NavRail-Toggle" @click="this.onToggle">{{ this.toggleIcon() }}</button>
            <button :class="this.itemClass(item)"
                    a-for="item in this.allItems()"
                    @click="(e) => this.onItemClick(item)">
                <span class="NavRail-Icon">{{ item.icon }}</span>
                <span class="NavRail-Label">{{ item.label }}</span>
                <span class="NavRail-Badge" a-if="item.badge !== undefined">{{ item.badge }}</span>
            </button>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Styles;
    }
    set items(v: NavRailItem[]) { this.items$.Set(v ?? []); }
    get items(): NavRailItem[] { return this.items$.Get(); }
    toggle(): this { this.onToggle(); return this; }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get active(): string { return this.getAttribute('active') ?? ''; }
    set active(v: string) { v ? this.setAttribute('active', v) : this.removeAttribute('active'); }
    get collapsed(): boolean { return this.hasAttribute('collapsed'); }
    set collapsed(v: boolean) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }
    private allItems: () => NavRailItem[] = () => [];
    private isCollapsed: () => boolean = () => false;
    private toggleIcon: () => string = () => '◂';
    private itemClass: (item: NavRailItem) => string = () => '';
    private onToggle: () => void = () => { };
    private onItemClick: (item: NavRailItem) => void = () => { };
    public static readonly Styles = Styles;
    static DefaultSheet(): Stylesheet { return Styles; }
}
/* ──────────────────────────────────────────────────────────────────────────
 * NavRail namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace NavRail {
    export namespace Interfaces {
        export interface Item extends NavRailItem {
        }
        export interface Options extends NavRailOptions {
        }
    }
}
export default NavRail;
