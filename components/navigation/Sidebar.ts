/**
 * @module    components/navigation/Sidebar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Sidebar — resizable, collapsible, accordion navigation panel with optional
 * search. Dedicated with love to Arianna. ♡
 *
 * Resize is handled by an internal `<arianna-resizer>` child (only when
 * `resizable` is true and the sidebar is not collapsed), so the heavy
 * cross-anchor math lives in one place (the Resizer modifier) rather than
 * being re-implemented here.
 *
 * @example JS
 *   const s = new Sidebar();
 *   s.orientation = 'left';
 *   s.width       = 260;
 *   s.sections    = [
 *     { id: 'start', label: 'Getting Started', open: true,
 *       items: [
 *         { id: 'welcome',  label: 'Welcome',      icon: '✦' },
 *         { id: 'install',  label: 'Installation', icon: '⬇' },
 *       ],
 *     },
 *     { id: 'core', label: 'Core Modules',
 *       items: [{ id: 'real', label: 'Real', icon: '🌐' }],
 *     },
 *   ];
 *   s.active = 'welcome';
 *   s.addEventListener('arianna:select', e => router.go(e.detail.item.id));
 *   document.body.append(s);
 *
 * @example HTML
 *   <arianna-sidebar orientation="left" searchable collapsible persist></arianna-sidebar>
 *
 * Events:
 *   - arianna:select    detail: { item, section }
 *   - arianna:collapse  detail: { collapsed }
 *   - arianna:resize    detail: { width }       (bubbles from arianna-resizer)
 *   - arianna:section-toggle  detail: { id, open }
 *
 * Slots:  header, footer
 * Attrs:
 *   orientation, width, min-width, max-width, collapsed-width,
 *   collapsed, collapsible, resizable, searchable, show-toggle,
 *   persist, storage-key, active, aria-label
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface SidebarItem {
    id        : string;
    label     : string;
    icon?     : string;
    badge?    : string | number;
    disabled? : boolean;
    class?    : string;
    data?     : unknown;
}

export interface SidebarSection {
    id    : string;
    label : string;
    items : SidebarItem[];
    open? : boolean;
    icon? : string;
}

export interface SidebarOptions {
    orientation?    : 'left' | 'right';
    width?          : number;
    minWidth?       : number;
    maxWidth?       : number;
    collapsedWidth? : number;
    collapsible?    : boolean;
    collapsed?      : boolean;
    resizable?      : boolean;
    searchable?     : boolean;
    showToggle?     : boolean;
    persist?        : boolean;
    storageKey?     : string;
    ariaLabel?      : string;
    sections?       : SidebarSection[];
    active?         : string;
}

interface FlatSection {
    section  : SidebarSection;
    isOpen   : boolean;
    items    : SidebarItem[];
    arrowText: string;
}

export class Sidebar extends Component('arianna-sidebar', HTMLElement, {}, {
    attrs : [
        'orientation', 'width', 'min-width', 'max-width', 'collapsed-width',
        'collapsed', 'collapsible', 'resizable', 'searchable', 'show-toggle',
        'persist', 'storage-key', 'active', 'aria-label',
    ],
})
{
    sections$ : Signal<SidebarSection[]> = signal<SidebarSection[]>([]);
    openSecs$ : Signal<Set<string>> = signal<Set<string>>(new Set());
    query$    : Signal<string> = signal<string>('');

    build(_opts: SidebarOptions = {})
    {
        this.setAttribute('role', 'navigation');
        if (!this.hasAttribute('aria-label')) {
            this.setAttribute('aria-label', 'Site navigation');
        }

        const orientation = this.attrSignal('orientation');
        const collapsed   = this.attrSignal('collapsed');
        const active      = this.attrSignal('active');

        // Restore persisted width on first mount if `persist` is set
        if (this.hasAttribute('persist')) {
            const key = this.getAttribute('storage-key') ?? 'arianna-sidebar-w';
            const saved = localStorage.getItem(key);
            if (saved && !this.hasAttribute('width')) {
                this.setAttribute('width', saved);
            }
        }

        // Apply width style reactively
        const applyWidth = () => {
            const isCollapsed = collapsed.get() !== null && this.getAttribute('collapsed') !== null;
            const w = isCollapsed
                ? parseInt(this.getAttribute('collapsed-width') ?? '48', 10) || 48
                : parseInt(this.getAttribute('width') ?? '260', 10) || 260;
            this.style.width = w + 'px';
        };
        applyWidth();
        this.addEventListener('arianna:attr-width',           applyWidth);
        this.addEventListener('arianna:attr-collapsed',       applyWidth);
        this.addEventListener('arianna:attr-collapsed-width', applyWidth);

        // Bubble arianna:resize from internal arianna-resizer + persist
        this.addEventListener('arianna:resize', (e: Event) => {
            const ev = e as CustomEvent<{ width: number }>;
            const w = ev.detail?.width;
            if (typeof w === 'number') {
                this.setAttribute('width', String(w));
                if (this.hasAttribute('persist')) {
                    const key = this.getAttribute('storage-key') ?? 'arianna-sidebar-w';
                    localStorage.setItem(key, String(w));
                }
            }
        });

        // Re-render section list when sections / open / query change is
        // automatic via the Signal reads inside template helpers.

        this.orient      = () => orientation.get() ?? 'left';
        this.isCollapsed = () => this.hasAttribute('collapsed');
        this.isCollapsible = () => this.hasAttribute('collapsible') || !this.hasAttribute('collapsible'); // defaults true
        this.showToggleBtn = () => {
            const has = this.getAttribute('show-toggle');
            return has !== 'false' && this.isCollapsible();
        };
        this.isSearchable = () => this.getAttribute('searchable') !== 'false';
        this.isResizable  = () => this.getAttribute('resizable')  !== 'false' && !this.isCollapsed();
        this.toggleIcon = () => {
            const o = this.orient();
            const c = this.isCollapsed();
            if (o === 'left')  return c ? '▸' : '◂';
            if (o === 'right') return c ? '◂' : '▸';
            return '≡';
        };
        this.resizerHandles = () => this.orient() === 'left' ? 'e' : 'w';
        this.minW = () => parseInt(this.getAttribute('min-width') ?? '160', 10) || 160;
        this.maxW = () => parseInt(this.getAttribute('max-width') ?? '480', 10) || 480;

        this.onToggle = () => {
            const newCol = !this.isCollapsed();
            if (newCol) this.setAttribute('collapsed', '');
            else        this.removeAttribute('collapsed');
            this.dispatchEvent(new CustomEvent('arianna:collapse', {
                bubbles: true, detail: { collapsed: newCol },
            }));
        };

        this.onSearchInput = (e: Event) => {
            const v = (e.target as HTMLInputElement).value.toLowerCase().trim();
            this.query$.set(v);
        };

        this.onSectionClick = (sec: SidebarSection) => {
            const open = new Set(this.openSecs$.get());
            const wasOpen = open.has(sec.id);
            if (wasOpen) open.delete(sec.id);
            else         open.add(sec.id);
            this.openSecs$.set(open);
            this.dispatchEvent(new CustomEvent('arianna:section-toggle', {
                bubbles: true, detail: { id: sec.id, open: !wasOpen },
            }));
        };

        this.onItemClick = (item: SidebarItem, section: SidebarSection) => {
            if (item.disabled) return;
            this.setAttribute('active', item.id);
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { item, section },
            }));
        };

        this.itemClass = (item: SidebarItem): string => {
            const isActive = item.id === (active.get() ?? '');
            const parts = ['ar-sidebar__item'];
            if (isActive)      parts.push('ar-sidebar__item--active');
            if (item.disabled) parts.push('ar-sidebar__item--disabled');
            if (item.class)    parts.push(item.class);
            return parts.join(' ');
        };

        this.flatSections = (): FlatSection[] => {
            const secs = this.sections$.get();
            const open = this.openSecs$.get();
            const q = this.query$.get();

            return secs
                .map(sec => {
                    const matched = q
                        ? sec.items.filter(i =>
                              i.label.toLowerCase().includes(q) ||
                              String(i.badge ?? '').toLowerCase().includes(q),
                          )
                        : sec.items;
                    const isOpen = open.has(sec.id) || !!q;
                    return {
                        section  : sec,
                        isOpen,
                        items    : matched,
                        arrowText: isOpen ? '▾' : '▸',
                    };
                })
                .filter(fs => !this.query$.get() || fs.items.length > 0);
        };

        this.hasMatches = () => this.flatSections().length > 0;

        this.template = html`
            <div class="ar-sidebar__header"><slot name="header"></slot></div>

            <button class="ar-sidebar__toggle"
                    a-if="this.showToggleBtn()"
                    @click="this.onToggle"
                    aria-label="Toggle sidebar">{{ this.toggleIcon() }}</button>

            <div class="ar-sidebar__search-wrap" a-if="this.isSearchable() && !this.isCollapsed()">
                <input class="ar-sidebar__search"
                       type="text"
                       placeholder="Search…"
                       aria-label="Filter navigation"
                       @input="this.onSearchInput"/>
            </div>

            <div class="ar-sidebar__list">
                <div class="ar-sidebar__section" a-for="fs in this.flatSections()">
                    <button class="ar-sidebar__section-hd"
                            @click="(e) => this.onSectionClick(fs.section)">
                        <span class="ar-sidebar__sec-icon" a-if="fs.section.icon && !this.isCollapsed()">{{ fs.section.icon }}</span>
                        <span class="ar-sidebar__sec-label" a-if="!this.isCollapsed()">{{ fs.section.label }}</span>
                        <span class="ar-sidebar__sec-arrow" a-if="!this.isCollapsed()" aria-hidden="true">{{ fs.arrowText }}</span>
                    </button>
                    <div class="ar-sidebar__items" a-if="fs.isOpen">
                        <button :class="this.itemClass(item)"
                                a-for="item in fs.items"
                                :disabled="item.disabled"
                                :data-id="item.id"
                                :title="this.isCollapsed() ? item.label : ''"
                                @click="(e) => this.onItemClick(item, fs.section)">
                            <span class="ar-sidebar__item-icon" a-if="item.icon" aria-hidden="true">{{ item.icon }}</span>
                            <span class="ar-sidebar__item-label" a-if="!this.isCollapsed()">{{ item.label }}</span>
                            <span class="ar-sidebar__item-badge" a-if="item.badge !== undefined && !this.isCollapsed()">{{ item.badge }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="ar-sidebar__footer"><slot name="footer"></slot></div>

            <arianna-resizer a-if="this.isResizable()"
                             :handles="this.resizerHandles()"
                             :min-width="String(this.minW())"
                             :max-width="String(this.maxW())"
                             allow-cross="false"></arianna-resizer>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Sidebar.DefaultSheet();
    }

    // ── Programmatic API (mirrors legacy) ────────────────────────────────────

    set sections(v: SidebarSection[]) {
        this.sections$.set(v ?? []);
        const open = new Set<string>(
            (v ?? []).filter(s => s.open !== false).map(s => s.id),
        );
        this.openSecs$.set(open);
    }
    get sections(): SidebarSection[] { return this.sections$.get(); }

    collapse(): this { this.setAttribute('collapsed', ''); this.dispatchEvent(new CustomEvent('arianna:collapse', { bubbles: true, detail: { collapsed: true } })); return this; }
    expand():   this { this.removeAttribute('collapsed'); this.dispatchEvent(new CustomEvent('arianna:collapse', { bubbles: true, detail: { collapsed: false } })); return this; }
    toggle():   this { return this.hasAttribute('collapsed') ? this.expand() : this.collapse(); }

    setWidth(w: number): this {
        const clamped = Math.max(this.minW(), Math.min(this.maxW(), w));
        this.setAttribute('width', String(clamped));
        return this;
    }

    openSection(id: string): this   {
        const open = new Set(this.openSecs$.get()); open.add(id); this.openSecs$.set(open);
        return this;
    }
    closeSection(id: string): this  {
        const open = new Set(this.openSecs$.get()); open.delete(id); this.openSecs$.set(open);
        return this;
    }
    toggleSection(id: string): this {
        const open = new Set(this.openSecs$.get());
        if (open.has(id)) open.delete(id); else open.add(id);
        this.openSecs$.set(open);
        return this;
    }

    search(q: string): this {
        this.query$.set(q.toLowerCase().trim());
        const input = this.querySelector<HTMLInputElement>('.ar-sidebar__search');
        if (input) input.value = q;
        return this;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // ── Attr getters/setters ─────────────────────────────────────────────────

    get orientation(): 'left' | 'right' { return (this.getAttribute('orientation') ?? 'left') as never; }
    set orientation(v: 'left' | 'right') { this.setAttribute('orientation', v); }

    get width(): number  { return parseInt(this.getAttribute('width') ?? '260', 10); }
    set width(v: number) { this.setAttribute('width', String(v)); }

    get minWidth(): number  { return this.minW(); }
    set minWidth(v: number) { this.setAttribute('min-width', String(v)); }

    get maxWidth(): number  { return this.maxW(); }
    set maxWidth(v: number) { this.setAttribute('max-width', String(v)); }

    get collapsedWidth(): number  { return parseInt(this.getAttribute('collapsed-width') ?? '48', 10); }
    set collapsedWidth(v: number) { this.setAttribute('collapsed-width', String(v)); }

    get collapsed(): boolean  { return this.hasAttribute('collapsed'); }
    set collapsed(v: boolean) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }

    get collapsible(): boolean  { return this.getAttribute('collapsible') !== 'false'; }
    set collapsible(v: boolean) { this.setAttribute('collapsible', v ? 'true' : 'false'); }

    get resizable(): boolean  { return this.getAttribute('resizable') !== 'false'; }
    set resizable(v: boolean) { this.setAttribute('resizable', v ? 'true' : 'false'); }

    get searchable(): boolean  { return this.getAttribute('searchable') !== 'false'; }
    set searchable(v: boolean) { this.setAttribute('searchable', v ? 'true' : 'false'); }

    get persist(): boolean  { return this.hasAttribute('persist'); }
    set persist(v: boolean) { v ? this.setAttribute('persist', '') : this.removeAttribute('persist'); }

    get storageKey(): string  { return this.getAttribute('storage-key') ?? 'arianna-sidebar-w'; }
    set storageKey(v: string) { this.setAttribute('storage-key', v); }

    get active(): string  { return this.getAttribute('active') ?? ''; }
    set active(v: string) { v ? this.setAttribute('active', v) : this.removeAttribute('active'); }

    // ── Template helpers (set in build) ──────────────────────────────────────

    private orient        : () => string = () => 'left';
    private isCollapsed   : () => boolean = () => false;
    private isCollapsible : () => boolean = () => true;
    private showToggleBtn : () => boolean = () => true;
    private isSearchable  : () => boolean = () => true;
    private isResizable   : () => boolean = () => true;
    private toggleIcon    : () => string  = () => '◂';
    private resizerHandles: () => string  = () => 'e';
    private minW          : () => number  = () => 160;
    private maxW          : () => number  = () => 480;

    private onToggle      : () => void = () => {};
    private onSearchInput : (e: Event) => void = () => {};
    private onSectionClick: (sec: SidebarSection) => void = () => {};
    private onItemClick   : (item: SidebarItem, section: SidebarSection) => void = () => {};

    private itemClass    : (item: SidebarItem) => string = () => '';
    private flatSections : () => FlatSection[] = () => [];
    private hasMatches   : () => boolean = () => false;

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background    : 'var(--arianna-bg, #ffffff)',
                    borderStyle   : 'solid',
                    borderColor   : 'var(--arianna-border, #d8d8d8)',
                    borderWidth   : '0',
                    boxSizing     : 'border-box',
                    display       : 'flex',
                    flexDirection : 'column',
                    flexShrink    : '0',
                    height        : '100%',
                    minWidth      : '0',
                    overflow      : 'hidden',
                    position      : 'relative',
                    transition    : 'width 0.18s ease',
                }),
                new Rule(':host([orientation="left"]), :host(:not([orientation]))', { borderRightWidth: '1px' }),
                new Rule(':host([orientation="right"])', { borderLeftWidth: '1px' }),

                // Collapsed state — hide labels, badges, search, section content
                new Rule(':host([collapsed]) .ar-sidebar__search-wrap',  { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__item-label',   { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__item-badge',   { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__sec-label',    { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__sec-arrow',    { display: 'none' }),
                new Rule(':host([collapsed]) .ar-sidebar__item', { justifyContent: 'center', padding: '8px 4px' }),

                // Header / footer
                new Rule('.ar-sidebar__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    flexShrink  : '0',
                    padding     : '12px 14px',
                }),
                new Rule('.ar-sidebar__header:empty', { display: 'none', padding: '0', border: 'none' }),
                new Rule('.ar-sidebar__footer', {
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    flexShrink: '0',
                    marginTop: 'auto',
                    padding  : '10px 14px',
                }),
                new Rule('.ar-sidebar__footer:empty', { display: 'none', padding: '0', border: 'none' }),

                // Toggle
                new Rule('.ar-sidebar__toggle', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #8b949e)',
                    cursor    : 'pointer',
                    font      : 'inherit',
                    fontSize  : '0.68rem',
                    padding   : '5px 14px',
                    textAlign : 'right',
                    transition: 'color 0.14s ease',
                    width     : '100%',
                }),
                new Rule(':host([orientation="right"]) .ar-sidebar__toggle', { textAlign: 'left' }),
                new Rule('.ar-sidebar__toggle:hover', { color: 'var(--arianna-text, #1f2328)' }),

                // Search
                new Rule('.ar-sidebar__search-wrap', { padding: '4px 10px 8px' }),
                new Rule('.ar-sidebar__search', {
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 5px)',
                    boxSizing   : 'border-box',
                    color       : 'var(--arianna-text, #1f2328)',
                    font        : 'inherit',
                    fontSize    : '0.82rem',
                    padding     : '6px 10px',
                    width       : '100%',
                    outline     : 'none',
                }),
                new Rule('.ar-sidebar__search:focus', { borderColor: 'var(--arianna-primary, #1f6feb)' }),

                // List + sections
                new Rule('.ar-sidebar__list', {
                    flex     : '1',
                    overflowY: 'auto',
                    padding  : '4px 8px',
                }),
                new Rule('.ar-sidebar__section', { marginBottom: '4px' }),
                new Rule('.ar-sidebar__section-hd', {
                    alignItems: 'center',
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #8b949e)',
                    cursor    : 'pointer',
                    display   : 'flex',
                    font      : 'inherit',
                    fontSize  : '0.7rem',
                    fontWeight: '700',
                    gap       : '6px',
                    padding   : '6px 8px',
                    textAlign : 'left',
                    textTransform: 'uppercase',
                    width     : '100%',
                    letterSpacing: '0.04em',
                }),
                new Rule('.ar-sidebar__sec-label',  { flex: '1' }),
                new Rule('.ar-sidebar__sec-arrow',  { fontSize: '0.8rem' }),

                // Items
                new Rule('.ar-sidebar__items', { display: 'flex', flexDirection: 'column', gap: '2px' }),
                new Rule('.ar-sidebar__item', {
                    alignItems  : 'center',
                    background  : 'none',
                    border      : 'none',
                    borderRadius: 'var(--arianna-radius, 5px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    display     : 'flex',
                    font        : 'inherit',
                    fontSize    : '0.84rem',
                    gap         : '10px',
                    padding     : '7px 10px',
                    textAlign   : 'left',
                    transition  : 'background 0.14s ease, color 0.14s ease',
                    width       : '100%',
                }),
                new Rule('.ar-sidebar__item:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-sidebar__item--active', {
                    background: 'rgba(31,111,235,0.12)',
                    color     : 'var(--arianna-primary, #1f6feb)',
                    fontWeight: '600',
                }),
                new Rule('.ar-sidebar__item--disabled', { opacity: '0.45', cursor: 'not-allowed' }),
                new Rule('.ar-sidebar__item-icon', { flexShrink: '0', fontSize: '1rem', width: '18px', textAlign: 'center' }),
                new Rule('.ar-sidebar__item-label', { flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
                new Rule('.ar-sidebar__item-badge', {
                    background  : 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '8px',
                    color       : '#ffffff',
                    fontSize    : '0.66rem',
                    fontWeight  : '600',
                    padding     : '1px 6px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Sidebar', {
        value: Sidebar, writable: false, enumerable: false, configurable: false,
    });
}

export default Sidebar;
