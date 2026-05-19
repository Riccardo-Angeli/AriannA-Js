/**
 * @module    components/layout/Dock
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Dock — desktop launcher in two visual styles:
 *   • 'macos'    — bottom-centred floating dock with magnification on hover,
 *                  separator before trash, running-app dots under icons.
 *   • 'windows'  — bottom-pinned taskbar, start button on the left, system
 *                  tray on the right, flat icon tiles with active underline.
 *
 * @example JS
 *   const d = new Dock();
 *   d.style = 'macos';
 *   d.items = [
 *     { id: 'finder', label: 'Finder', icon: '📁', running: true },
 *     { id: 'mail',   label: 'Mail',   icon: '✉️',  badge: 3 },
 *     { id: 'trash',  label: 'Trash',  icon: '🗑️',  separator: true },
 *   ];
 *
 * @example HTML
 *   <arianna-dock style="windows" start-label="Start"></arianna-dock>
 *
 * Events:
 *   - arianna:item-click     detail: { id, item }
 *   - arianna:item-context   detail: { id, item, x, y }
 *   - arianna:start          (windows only)
 *   - arianna:tray-click     detail: { id, item }
 *
 * Slots:  (none — programmatic items only)
 * Attrs:  style ('macos' | 'windows'), magnify, position ('bottom'|'left'|'right'), start-label
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type DockStyle = 'macos' | 'windows';

export interface DockItem {
    id        : string;
    label     : string;
    icon      : string;   // emoji, inline SVG, image URL, or text
    running?  : boolean;
    active?   : boolean;
    badge?    : number;
    separator?: boolean;
    meta?     : unknown;
}

export interface DockOptions {
    style?      : DockStyle;
    items?      : DockItem[];
    magnify?    : number;
    position?   : 'bottom' | 'left' | 'right';
    startLabel? : string;
    tray?       : DockItem[];
}

interface RenderedIcon {
    type : 'svg' | 'img' | 'text';
    value: string;
}

function classifyIcon(icon: string): RenderedIcon
{
    const trim = icon.trim();
    if (trim.startsWith('<svg')) return { type: 'svg', value: trim };
    if (trim.startsWith('http') || trim.startsWith('/') || trim.startsWith('data:')) {
        return { type: 'img', value: trim };
    }
    return { type: 'text', value: trim };
}

export class Dock extends Component('arianna-dock', HTMLElement, {}, {
    attrs : ['variant', 'magnify', 'position', 'start-label'],
})
{
    items$ : Signal<DockItem[]> = signal<DockItem[]>([]);
    tray$  : Signal<DockItem[]> = signal<DockItem[]>([]);
    clock$ : Signal<{ time: string; date: string }> = signal({ time: '', date: '' });

    #clockInterval = 0;

    build(_opts: DockOptions = {})
    {
        const styleAttr = this.attrSignal('variant');
        const startLabel = this.attrSignal('start-label');

        this.dockStyle    = () => (styleAttr.get() ?? 'macos') as DockStyle;
        this.isMacOS      = () => this.dockStyle() === 'macos';
        this.isWindows    = () => this.dockStyle() === 'windows';
        this.startBtnLabel = () => startLabel.get() ?? '';

        this.allItems = () => this.items$.get();
        this.trayItems = () => this.tray$.get();

        this.iconCls = (icon: string) => {
            const k = classifyIcon(icon);
            return k.type === 'svg' ? 'ar-dock__icon ar-dock__icon--svg'
                 : k.type === 'img' ? 'ar-dock__icon ar-dock__icon--img'
                 :                     'ar-dock__icon ar-dock__icon--emoji';
        };
        this.iconHtml = (icon: string) => {
            const k = classifyIcon(icon);
            if (k.type === 'svg') return k.value;
            if (k.type === 'img') return `<img src="${k.value}" alt="" draggable="false">`;
            return `<span class="ar-dock__emoji">${k.value}</span>`;
        };

        this.itemCls = (it: DockItem, tray: boolean = false) => {
            const parts = ['ar-dock__item'];
            if (it.active)  parts.push('ar-dock__item--active');
            if (it.running) parts.push('ar-dock__item--running');
            if (tray)       parts.push('ar-dock__item--tray');
            return parts.join(' ');
        };

        this.hasBadge   = (it: DockItem) => typeof it.badge === 'number' && it.badge > 0;
        this.badgeText  = (it: DockItem) => (it.badge ?? 0) > 99 ? '99+' : String(it.badge ?? 0);
        this.isSeparator = (it: DockItem) => !!it.separator;
        this.notSeparator = (it: DockItem) => !it.separator;

        this.onItemClick = (it: DockItem, e: Event) => {
            this.dispatchEvent(new CustomEvent('arianna:item-click', {
                bubbles: true, detail: { id: it.id, item: { ...it } },
            }));
            // Defensive: prevent event from being caught by other handlers
            e.stopPropagation();
        };
        this.onTrayClick = (it: DockItem, e: Event) => {
            this.dispatchEvent(new CustomEvent('arianna:tray-click', {
                bubbles: true, detail: { id: it.id, item: { ...it } },
            }));
            e.stopPropagation();
        };
        this.onItemContext = (it: DockItem, e: Event) => {
            e.preventDefault();
            const me = e as MouseEvent;
            this.dispatchEvent(new CustomEvent('arianna:item-context', {
                bubbles: true,
                detail : { id: it.id, item: { ...it }, x: me.clientX, y: me.clientY },
            }));
        };
        this.onStart = () => {
            this.dispatchEvent(new CustomEvent('arianna:start', {
                bubbles: true, detail: {},
            }));
        };

        this.onPointerMove = (e: Event) => {
            if (!this.isMacOS()) return;
            this.#magnify(e as PointerEvent);
        };
        this.onPointerLeave = () => {
            if (!this.isMacOS()) return;
            this.#unmagnify();
        };

        this.clockTime = () => this.clock$.get().time;
        this.clockDate = () => this.clock$.get().date;

        this.template = html`
            <!-- macOS layout -->
            <div class="ar-dock__track ar-dock__track--macos"
                 a-if="this.isMacOS()"
                 @pointermove="this.onPointerMove"
                 @pointerleave="this.onPointerLeave">
                <div class="ar-dock__sep" a-for="it in this.allItems()" a-if="this.isSeparator(it)"></div>
                <button :class="this.itemCls(it)"
                        a-for="it in this.allItems()"
                        a-if="this.notSeparator(it)"
                        :title="it.label"
                        :aria-label="it.label"
                        @click="(e) => this.onItemClick(it, e)"
                        @contextmenu="(e) => this.onItemContext(it, e)">
                    <span :class="this.iconCls(it.icon)" a-html="this.iconHtml(it.icon)"></span>
                    <span class="ar-dock__badge" a-if="this.hasBadge(it)">{{ this.badgeText(it) }}</span>
                    <span class="ar-dock__dot" aria-hidden="true"></span>
                    <span class="ar-dock__tooltip">{{ it.label }}</span>
                </button>
            </div>

            <!-- Windows layout -->
            <button class="ar-dock__start"
                    a-if="this.isWindows()"
                    @click="this.onStart"
                    aria-label="Start"
                    title="Start">
                <span class="ar-dock__start-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3"  y="3"  width="8" height="8"/>
                        <rect x="13" y="3"  width="8" height="8"/>
                        <rect x="3"  y="13" width="8" height="8"/>
                        <rect x="13" y="13" width="8" height="8"/>
                    </svg>
                </span>
                <span class="ar-dock__start-label" a-if="this.startBtnLabel()">{{ this.startBtnLabel() }}</span>
            </button>
            <div class="ar-dock__track ar-dock__track--windows" a-if="this.isWindows()">
                <button :class="this.itemCls(it)"
                        a-for="it in this.allItems()"
                        a-if="this.notSeparator(it)"
                        :title="it.label"
                        :aria-label="it.label"
                        @click="(e) => this.onItemClick(it, e)"
                        @contextmenu="(e) => this.onItemContext(it, e)">
                    <span :class="this.iconCls(it.icon)" a-html="this.iconHtml(it.icon)"></span>
                    <span class="ar-dock__badge" a-if="this.hasBadge(it)">{{ this.badgeText(it) }}</span>
                    <span class="ar-dock__dot" aria-hidden="true"></span>
                </button>
            </div>
            <div class="ar-dock__tray" a-if="this.isWindows()">
                <button :class="this.itemCls(it, true)"
                        a-for="it in this.trayItems()"
                        :title="it.label"
                        :aria-label="it.label"
                        @click="(e) => this.onTrayClick(it, e)">
                    <span :class="this.iconCls(it.icon)" a-html="this.iconHtml(it.icon)"></span>
                </button>
                <div class="ar-dock__clock">
                    <div class="ar-dock__time">{{ this.clockTime() }}</div>
                    <div class="ar-dock__date">{{ this.clockDate() }}</div>
                </div>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Dock.DefaultSheet();
    }

    set items(v: DockItem[]) { this.items$.set(v ?? []); }
    get items(): DockItem[]  { return this.items$.get(); }

    set tray(v: DockItem[]) { this.tray$.set(v ?? []); }
    get tray(): DockItem[]  { return this.tray$.get(); }

    addItem(item: DockItem): this { this.items$.set([...this.items$.get(), item]); return this; }
    removeItem(id: string): this  { this.items$.set(this.items$.get().filter(i => i.id !== id)); return this; }
    updateItem(id: string, patch: Partial<DockItem>): this {
        this.items$.set(this.items$.get().map(i => i.id === id ? { ...i, ...patch } : i));
        return this;
    }
    clearItems(): this { this.items$.set([]); return this; }

    setRunning(id: string, on: boolean): this { return this.updateItem(id, { running: on }); }
    setBadge(id: string, n: number): this     { return this.updateItem(id, { badge: n > 0 ? n : undefined }); }
    setActive(id: string): this {
        this.items$.set(this.items$.get().map(i => ({ ...i, active: i.id === id })));
        return this;
    }

    #magnify(e: PointerEvent): void
    {
        const track = this.querySelector<HTMLElement>('.ar-dock__track--macos');
        if (!track) return;
        const factor = parseFloat(this.getAttribute('magnify') ?? '1.6') || 1.6;
        if (factor <= 1) return;
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const items = track.querySelectorAll<HTMLElement>('.ar-dock__item');
        const radius = 80;
        items.forEach(it => {
            const ir = it.getBoundingClientRect();
            const center = ir.left - rect.left + ir.width / 2;
            const dist = Math.abs(x - center);
            const t = Math.max(0, 1 - dist / radius);
            const scale = 1 + (factor - 1) * t;
            it.style.transform = `scale(${scale.toFixed(3)})`;
        });
    }

    #unmagnify(): void
    {
        const track = this.querySelector<HTMLElement>('.ar-dock__track--macos');
        if (!track) return;
        track.querySelectorAll<HTMLElement>('.ar-dock__item').forEach(it => {
            it.style.transform = '';
        });
    }

    #startClock(): void
    {
        const tick = () => {
            const d = new Date();
            this.clock$.set({
                time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                date: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' }),
            });
        };
        tick();
        this.#clockInterval = window.setInterval(tick, 60_000);
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        // Start clock if windows style — restart on style change
        if (this.dockStyle() === 'windows') this.#startClock();
    }
    onBeforeUpdate()  {}
    onUpdate() {
        // If style changed to windows and clock wasn't running, start it
        if (this.dockStyle() === 'windows' && this.#clockInterval === 0) this.#startClock();
        if (this.dockStyle() !== 'windows' && this.#clockInterval !== 0) {
            clearInterval(this.#clockInterval);
            this.#clockInterval = 0;
        }
    }
    onBeforeUnmount() {}
    onUnmount() {
        if (this.#clockInterval !== 0) {
            clearInterval(this.#clockInterval);
            this.#clockInterval = 0;
        }
    }

    // ── Attr getters / setters ───────────────────────────────────────────────

    get variant(): DockStyle  { return (this.getAttribute('variant') ?? 'macos') as DockStyle; }
    set variant(v: DockStyle) { this.setAttribute('variant', v); }

    get magnify(): number  { return parseFloat(this.getAttribute('magnify') ?? '1.6'); }
    set magnify(v: number) { this.setAttribute('magnify', String(v)); }

    get position(): 'bottom' | 'left' | 'right' { return (this.getAttribute('position') ?? 'bottom') as never; }
    set position(v: 'bottom' | 'left' | 'right') { this.setAttribute('position', v); }

    get startLabel(): string  { return this.getAttribute('start-label') ?? ''; }
    set startLabel(v: string) { v ? this.setAttribute('start-label', v) : this.removeAttribute('start-label'); }

    // ── Template helpers ─────────────────────────────────────────────────────

    private dockStyle     : () => DockStyle = () => 'macos';
    private isMacOS       : () => boolean = () => true;
    private isWindows     : () => boolean = () => false;
    private startBtnLabel : () => string  = () => '';
    private allItems      : () => DockItem[] = () => [];
    private trayItems     : () => DockItem[] = () => [];
    private iconCls       : (icon: string) => string = () => '';
    private iconHtml      : (icon: string) => string = () => '';
    private itemCls       : (it: DockItem, tray?: boolean) => string = () => '';
    private hasBadge      : (it: DockItem) => boolean = () => false;
    private badgeText     : (it: DockItem) => string  = () => '';
    private isSeparator   : (it: DockItem) => boolean = () => false;
    private notSeparator  : (it: DockItem) => boolean = () => true;
    private onItemClick   : (it: DockItem, e: Event) => void = () => {};
    private onTrayClick   : (it: DockItem, e: Event) => void = () => {};
    private onItemContext : (it: DockItem, e: Event) => void = () => {};
    private onStart       : () => void = () => {};
    private onPointerMove : (e: Event) => void = () => {};
    private onPointerLeave: (e?: Event) => void = () => {};
    private clockTime     : () => string = () => '';
    private clockDate     : () => string = () => '';

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    position  : 'relative',
                    display   : 'flex',
                    alignItems: 'center',
                    userSelect: 'none',
                    font      : '13px -apple-system, system-ui, sans-serif',
                    boxSizing : 'border-box',
                }),
                new Rule(':host([variant="macos"])', {
                    background           : 'rgba(28, 28, 30, 0.6)',
                    backdropFilter       : 'blur(20px)',
                    'WebkitBackdropFilter': 'blur(20px)',
                    borderRadius         : '18px',
                    border               : '1px solid rgba(255,255,255,0.08)',
                    padding              : '0',
                    height               : '78px',
                }),
                new Rule(':host([variant="windows"])', {
                    background           : 'rgba(32, 32, 36, 0.92)',
                    backdropFilter       : 'blur(40px)',
                    'WebkitBackdropFilter': 'blur(40px)',
                    height               : '48px',
                    padding              : '0 4px',
                    gap                  : '4px',
                    borderTop            : '1px solid rgba(255,255,255,0.04)',
                }),

                // Track + items
                new Rule('.ar-dock__track', {
                    display   : 'flex',
                    alignItems: 'flex-end',
                    gap       : '6px',
                    padding   : '6px 10px',
                }),
                new Rule('.ar-dock__track--windows', {
                    flex      : '1', padding: '0 4px', gap: '2px',
                    alignItems: 'center', height: '48px', overflow: 'hidden',
                }),
                new Rule('.ar-dock__item', {
                    position    : 'relative',
                    background  : 'none',
                    border      : '0',
                    padding     : '0',
                    cursor      : 'pointer',
                    display     : 'flex',
                    flexDirection: 'column',
                    alignItems  : 'center',
                    transformOrigin: 'bottom center',
                    transition  : 'transform 0.12s ease-out',
                }),

                // macOS sizes
                new Rule(':host([variant="macos"]) .ar-dock__item', { width: '56px', height: '62px' }),
                new Rule(':host([variant="macos"]) .ar-dock__icon', {
                    width       : '48px', height: '48px', borderRadius: '11px',
                    overflow    : 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    background  : 'linear-gradient(135deg, #2a2a2c 0%, #1c1c1e 100%)',
                    display     : 'flex', alignItems: 'center', justifyContent: 'center',
                }),
                new Rule(':host([variant="macos"]) .ar-dock__icon .ar-dock__emoji, :host([variant="macos"]) .ar-dock__icon--emoji', {
                    fontSize: '36px',
                }),
                new Rule(':host([variant="macos"]) .ar-dock__sep', {
                    width   : '1px',
                    height  : '48px',
                    background: 'rgba(255,255,255,0.18)',
                    margin  : '0 4px',
                    alignSelf: 'center',
                }),
                new Rule(':host([variant="macos"]) .ar-dock__dot', {
                    bottom: '0', background: '#d4d4d4',
                }),

                // Windows sizes
                new Rule(':host([variant="windows"]) .ar-dock__start', {
                    display    : 'flex', alignItems: 'center', gap: '6px',
                    background : 'transparent', border: '0',
                    color      : '#d4d4d4', height: '40px', padding: '0 12px',
                    borderRadius: '6px', cursor: 'pointer',
                    transition : 'background 0.12s ease',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__start:hover', {
                    background: 'rgba(255,255,255,0.08)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__start-icon', {
                    display     : 'flex', alignItems: 'center', justifyContent: 'center',
                    color       : '#60a5fa',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__start-label', {
                    font: '13px sans-serif',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item', {
                    width      : '40px', height: '40px',
                    flexDirection: 'column', justifyContent: 'center',
                    borderRadius: '6px',
                    transition : 'background 0.12s ease',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item:hover', {
                    background: 'rgba(255,255,255,0.08)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--active', {
                    background: 'rgba(255,255,255,0.12)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__icon', { width: '22px', height: '22px' }),
                new Rule(':host([variant="windows"]) .ar-dock__emoji, :host([variant="windows"]) .ar-dock__icon--emoji', {
                    fontSize: '20px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__dot', {
                    bottom: '2px', height: '3px', width: '16px',
                    borderRadius: '2px', background: '#60a5fa',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--running.ar-dock__item--active .ar-dock__dot', {
                    width: '24px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__tray', {
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '0 8px 0 4px', height: '48px',
                    borderLeft: '1px solid rgba(255,255,255,0.04)',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--tray', {
                    width: '28px', height: '28px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--tray .ar-dock__icon', {
                    width: '18px', height: '18px',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__item--tray .ar-dock__emoji', { fontSize: '16px' }),
                new Rule(':host([variant="windows"]) .ar-dock__clock', {
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    padding: '0 8px', font: '11px sans-serif',
                    color  : '#d4d4d4', lineHeight: '1.2', cursor: 'default',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__time', { fontWeight: '500' }),
                new Rule(':host([variant="windows"]) .ar-dock__date', { fontSize: '10px', opacity: '0.85' }),

                // Shared item internals
                new Rule('.ar-dock__icon', {
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }),
                new Rule('.ar-dock__icon svg, .ar-dock__icon img', {
                    width: '100%', height: '100%', display: 'block', pointerEvents: 'none',
                }),
                new Rule('.ar-dock__emoji', { fontSize: '32px', lineHeight: '1' }),
                new Rule('.ar-dock__tooltip', {
                    position    : 'absolute',
                    bottom      : 'calc(100% + 8px)',
                    background  : '#111',
                    color       : '#fff',
                    padding     : '3px 8px',
                    font        : '11px sans-serif',
                    borderRadius: '4px',
                    whiteSpace  : 'nowrap',
                    pointerEvents: 'none',
                    opacity     : '0',
                    transition  : 'opacity 0.12s ease',
                }),
                new Rule(':host([variant="windows"]) .ar-dock__tooltip', { display: 'none' }),
                new Rule('.ar-dock__item:hover .ar-dock__tooltip', { opacity: '1' }),
                new Rule('.ar-dock__badge', {
                    position    : 'absolute',
                    top         : '-2px',
                    right       : '-2px',
                    minWidth    : '16px',
                    height      : '16px',
                    padding     : '0 4px',
                    background  : 'var(--arianna-danger, #cf222e)',
                    color       : '#fff',
                    borderRadius: '8px',
                    font        : '600 10px sans-serif',
                    display     : 'flex',
                    alignItems  : 'center',
                    justifyContent: 'center',
                    boxShadow   : '0 0 0 2px #161616',
                }),
                new Rule('.ar-dock__dot', {
                    position: 'absolute', width: '4px', height: '4px',
                    borderRadius: '50%', opacity: '0',
                    transition: 'opacity 0.12s ease',
                }),
                new Rule('.ar-dock__item--running .ar-dock__dot', { opacity: '1' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Dock', {
        value: Dock, writable: false, enumerable: false, configurable: false,
    });
}

export default Dock;
