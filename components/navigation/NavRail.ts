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
 * Attrs:  collapsed, active
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface NavRailItem {
    id    : string;
    label : string;
    icon  : string;
    badge?: string | number;
}

export interface NavRailOptions {
    items?     : NavRailItem[];
    collapsed? : boolean;
    active?    : string;
}

export class NavRail extends Component('arianna-nav-rail', HTMLElement, {}, {
    attrs : ['collapsed', 'active'],
})
{
    items$: Signal<NavRailItem[]> = signal<NavRailItem[]>([]);

    build(_opts: NavRailOptions = {})
    {
        const active = this.attrSignal('active');

        this.allItems   = () => this.items$.get();
        this.isCollapsed = () => this.hasAttribute('collapsed');
        this.toggleIcon  = () => this.isCollapsed() ? '▸' : '◂';
        this.itemClass   = (item: NavRailItem) => {
            const isActive = item.id === (active.get() ?? '');
            return 'ar-navrail__item' + (isActive ? ' ar-navrail__item--active' : '');
        };

        this.onToggle    = () => {
            const newC = !this.isCollapsed();
            if (newC) this.setAttribute('collapsed', '');
            else      this.removeAttribute('collapsed');
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

        this.template = html`
            <button class="ar-navrail__toggle" @click="this.onToggle">{{ this.toggleIcon() }}</button>
            <button :class="this.itemClass(item)"
                    a-for="item in this.allItems()"
                    @click="(e) => this.onItemClick(item)">
                <span class="ar-navrail__icon">{{ item.icon }}</span>
                <span class="ar-navrail__label">{{ item.label }}</span>
                <span class="ar-navrail__badge" a-if="item.badge !== undefined">{{ item.badge }}</span>
            </button>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = NavRail.DefaultSheet();
    }

    set items(v: NavRailItem[]) { this.items$.set(v ?? []); }
    get items(): NavRailItem[]  { return this.items$.get(); }

    toggle(): this { this.onToggle(); return this; }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get active(): string  { return this.getAttribute('active') ?? ''; }
    set active(v: string) { v ? this.setAttribute('active', v) : this.removeAttribute('active'); }

    get collapsed(): boolean  { return this.hasAttribute('collapsed'); }
    set collapsed(v: boolean) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }

    private allItems   : () => NavRailItem[] = () => [];
    private isCollapsed: () => boolean = () => false;
    private toggleIcon : () => string  = () => '◂';
    private itemClass  : (item: NavRailItem) => string = () => '';
    private onToggle   : () => void = () => {};
    private onItemClick: (item: NavRailItem) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    display      : 'flex',
                    flexDirection: 'column',
                    gap          : '2px',
                    padding      : '8px 6px',
                    width        : '220px',
                    transition   : 'width 0.18s ease',
                }),
                new Rule(':host([collapsed])', { width: '56px' }),
                new Rule('.ar-navrail__toggle', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #8b949e)',
                    cursor    : 'pointer',
                    fontSize  : '0.75rem',
                    padding   : '6px',
                    textAlign : 'right',
                }),
                new Rule('.ar-navrail__item', {
                    alignItems  : 'center',
                    background  : 'none',
                    border      : 'none',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-muted, #8b949e)',
                    cursor      : 'pointer',
                    display     : 'flex',
                    gap         : '10px',
                    font        : 'inherit',
                    fontSize    : '0.83rem',
                    padding     : '9px 10px',
                    textAlign   : 'left',
                    transition  : 'background 0.18s ease, color 0.18s ease',
                    whiteSpace  : 'nowrap',
                    width       : '100%',
                    overflow    : 'hidden',
                }),
                new Rule('.ar-navrail__item:hover', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    color     : 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-navrail__item--active', {
                    background: 'rgba(31,111,235,0.12)',
                    color     : 'var(--arianna-primary, #1f6feb)',
                    fontWeight: '600',
                }),
                new Rule('.ar-navrail__icon', {
                    flexShrink: '0',
                    fontSize  : '1.1rem',
                    width     : '20px',
                    textAlign : 'center',
                }),
                new Rule('.ar-navrail__label', { flex: '1' }),
                new Rule(':host([collapsed]) .ar-navrail__label', { display: 'none' }),
                new Rule(':host([collapsed]) .ar-navrail__badge', { display: 'none' }),
                new Rule('.ar-navrail__badge', {
                    background  : 'var(--arianna-danger, #cf222e)',
                    borderRadius: '8px',
                    color       : '#fff',
                    fontSize    : '0.65rem',
                    padding     : '1px 5px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'NavRail', {
        value: NavRail, writable: false, enumerable: false, configurable: false,
    });
}

export default NavRail;
