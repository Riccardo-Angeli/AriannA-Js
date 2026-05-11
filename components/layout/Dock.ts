// components/layout/Dock.ts
//
// Dock — desktop launcher in two visual styles:
//   • 'macos'    — bottom-centred floating dock with magnification on hover,
//                  separator before trash, running-app dots under icons.
//   • 'windows'  — bottom-pinned taskbar, start button on the left, system
//                  tray on the right, flat icon tiles with active underline.
//
// Public API:
//   • new Dock(container, opts)
//   • addItem(item), removeItem(id), updateItem(id, patch), clearItems()
//   • setStyle('macos'|'windows'), setItems(items)
//   • setRunning(id, on), setBadge(id, count), setActive(id)
//   • on('item-click'|'item-context'|'start'|'tray-click', cb)

import { Control } from '../core/Control';

// Local typed view of Control — keeps this file independent of the exact
// TS shape of Control.ts elsewhere in the project.
type ControlBase = Control & {
    el        : HTMLElement;
    _get<T = unknown>(key: string, fallback?: T): T;
    _emit(type: string, detail?: unknown, ev?: Event): void;
    _build(): void;
};

export type DockStyle = 'macos' | 'windows';

export interface DockItem {
    id      : string;
    label   : string;
    /** Inline SVG, an emoji, or an image URL. */
    icon    : string;
    /** Currently running / app open. */
    running?: boolean;
    /** Currently focused / active window. */
    active? : boolean;
    /** Notification badge count. */
    badge?  : number;
    /** Place after a separator (macOS-only conventionally for Trash). */
    separator?: boolean;
    /** Free-form payload. */
    meta?   : unknown;
}

export interface DockOptions {
    style?      : DockStyle;
    items?      : DockItem[];
    /** macOS only: magnification factor on hover (1.0 = off, default 1.6). */
    magnify?    : number;
    /** Position; default 'bottom'. macOS supports 'left' and 'right' too. */
    position?   : 'bottom' | 'left' | 'right';
    /** Windows only: text shown on the start button (or '' for icon only). */
    startLabel? : string;
    /** Windows only: system tray content (icons/badges, right side). */
    tray?       : DockItem[];
    /** Extra CSS class. */
    class?      : string;
}

export class Dock extends Control {
    private _style    : DockStyle;
    private _items    : DockItem[] = [];
    private _tray     : DockItem[] = [];
    private _elTrack! : HTMLElement;
    private _elStart? : HTMLElement;
    private _elTray?  : HTMLElement;

    constructor(container: HTMLElement | string, opts: DockOptions = {}) {
        super(container as HTMLElement, 'div', {
            style      : 'macos',
            magnify    : 1.6,
            position   : 'bottom',
            startLabel : '',
            ...opts,
        });
        this._style = (this as unknown as ControlBase)._get<DockStyle>('style', 'macos');
        for (const it of opts.items ?? []) this._items.push({ ...it });
        for (const it of opts.tray  ?? []) this._tray.push({ ...it });
        this._injectStyles();
        this._build();
        this._render();
    }

    // ── Public API ─────────────────────────────────────────────────────────
    setStyle(s: DockStyle)         : this { this._style = s; this._build(); this._render(); return this; }
    getStyle()                     : DockStyle { return this._style; }
    setItems(items: DockItem[])    : this { this._items = items.map(i => ({ ...i })); this._render(); return this; }
    getItems()                     : DockItem[] { return this._items.map(i => ({ ...i })); }
    addItem(item: DockItem)        : this { this._items.push({ ...item }); this._render(); return this; }
    removeItem(id: string)         : this { this._items = this._items.filter(i => i.id !== id); this._render(); return this; }
    updateItem(id: string, patch: Partial<DockItem>): this {
        const i = this._items.findIndex(x => x.id === id);
        if (i >= 0) { this._items[i] = { ...this._items[i], ...patch }; this._render(); }
        return this;
    }
    clearItems()                   : this { this._items = []; this._render(); return this; }
    setRunning(id: string, on: boolean): this { return this.updateItem(id, { running: on }); }
    setBadge(id: string, n: number)    : this { return this.updateItem(id, { badge: n > 0 ? n : undefined }); }
    setActive(id: string)              : this {
        this._items = this._items.map(i => ({ ...i, active: i.id === id }));
        this._render();
        return this;
    }

    // ── Build ──────────────────────────────────────────────────────────────
    _build(): void {
        const self = this as unknown as ControlBase;
        const pos = self._get<string>('position', 'bottom');
        self.el.className = `ar-dock ar-dock--${this._style} ar-dock--${pos}`;
        if (this._style === 'macos') {
            self.el.innerHTML = `<div class="ar-dock__track" data-r="track"></div>`;
            this._elTrack = self.el.querySelector('[data-r="track"]') as HTMLElement;
            this._elTrack.addEventListener('pointermove', (e: PointerEvent) => this._magnify(e));
            this._elTrack.addEventListener('pointerleave', () => this._unmagnify());
        } else {
            const startLabel = self._get<string>('startLabel', '');
            self.el.innerHTML = `
<button class="ar-dock__start" data-r="start" title="Start" aria-label="Start">
  <span class="ar-dock__start-icon" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3"  y="3"  width="8" height="8"/><rect x="13" y="3"  width="8" height="8"/><rect x="3"  y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>
  </span>
  ${startLabel ? `<span class="ar-dock__start-label">${startLabel}</span>` : ''}
</button>
<div class="ar-dock__track" data-r="track"></div>
<div class="ar-dock__tray" data-r="tray"></div>`;
            this._elTrack = self.el.querySelector('[data-r="track"]') as HTMLElement;
            this._elStart = self.el.querySelector('[data-r="start"]') as HTMLElement;
            this._elTray  = self.el.querySelector('[data-r="tray"]')  as HTMLElement;
            this._elStart.addEventListener('click', () => self._emit('start', {}));
        }
        // Microtask flush in Control may run _build a second time without our
        // subsequent render — re-paint here so items always stay visible.
        if (this._items.length) this._render();
    }

    // ── Render ─────────────────────────────────────────────────────────────
    private _render(): void {
        if (!this._elTrack) return;
        const self = this as unknown as ControlBase;
        this._elTrack.innerHTML = '';
        for (const it of this._items) {
            if (it.separator) {
                const sep = document.createElement('div');
                sep.className = 'ar-dock__sep';
                this._elTrack.appendChild(sep);
            }
            this._elTrack.appendChild(this._renderItem(it));
        }
        if (this._elTray) {
            this._elTray.innerHTML = '';
            for (const t of this._tray) this._elTray.appendChild(this._renderItem(t, true));
            const clock = document.createElement('div');
            clock.className = 'ar-dock__clock';
            const tick = () => {
                const d = new Date();
                clock.innerHTML = `<div class="ar-dock__time">${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div><div class="ar-dock__date">${d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}</div>`;
            };
            tick();
            const id = setInterval(tick, 60_000);
            (clock as unknown as { _intervalId: number })._intervalId = id;
            this._elTray.appendChild(clock);
        }
        // Silence "self may be unused if no tray" — we still want the reference
        // so subclasses or future hooks can use it.
        void self;
    }

    private _renderItem(it: DockItem, tray: boolean = false): HTMLElement {
        const self = this as unknown as ControlBase;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ar-dock__item'
            + (it.active  ? ' ar-dock__item--active'  : '')
            + (it.running ? ' ar-dock__item--running' : '')
            + (tray       ? ' ar-dock__item--tray'    : '');
        btn.dataset.id = it.id;
        btn.title = it.label;
        btn.setAttribute('aria-label', it.label);
        const icon = this._renderIcon(it.icon);
        const badge = it.badge && it.badge > 0
            ? `<span class="ar-dock__badge">${it.badge > 99 ? '99+' : it.badge}</span>` : '';
        btn.innerHTML = `<span class="ar-dock__icon">${icon}</span>${badge}<span class="ar-dock__dot" aria-hidden="true"></span><span class="ar-dock__tooltip">${it.label}</span>`;
        btn.addEventListener('click', () => self._emit(tray ? 'tray-click' : 'item-click', { id: it.id, item: { ...it } }));
        btn.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            self._emit('item-context', { id: it.id, item: { ...it }, x: e.clientX, y: e.clientY });
        });
        return btn;
    }

    private _renderIcon(icon: string): string {
        const trim = icon.trim();
        if (trim.startsWith('<svg')) return trim;
        if (trim.startsWith('http') || trim.startsWith('/') || trim.startsWith('data:')) {
            return `<img src="${trim}" alt="" draggable="false">`;
        }
        return `<span class="ar-dock__emoji">${trim}</span>`;
    }

    // ── macOS magnification ────────────────────────────────────────────────
    private _magnify(e: PointerEvent): void {
        if (this._style !== 'macos') return;
        const factor = (this as unknown as ControlBase)._get<number>('magnify', 1.6);
        if (factor <= 1) return;
        const rect = this._elTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const items = this._elTrack.querySelectorAll<HTMLElement>('.ar-dock__item');
        const radius = 80;
        items.forEach((it: HTMLElement) => {
            const ir = it.getBoundingClientRect();
            const center = ir.left - rect.left + ir.width / 2;
            const dist = Math.abs(x - center);
            const t = Math.max(0, 1 - dist / radius);
            const scale = 1 + (factor - 1) * t;
            it.style.transform = `scale(${scale.toFixed(3)})`;
        });
    }
    private _unmagnify(): void {
        if (this._style !== 'macos') return;
        this._elTrack.querySelectorAll<HTMLElement>('.ar-dock__item').forEach((it: HTMLElement) => {
            it.style.transform = '';
        });
    }

    // ── Styles ─────────────────────────────────────────────────────────────
    private _injectStyles(): void {
        if (document.getElementById('ar-dock-styles')) return;
        const s = document.createElement('style');
        s.id = 'ar-dock-styles';
        s.textContent = `
.ar-dock { position:relative; display:flex; align-items:center; user-select:none; font:13px -apple-system,system-ui,sans-serif; box-sizing:border-box; }
.ar-dock__track { display:flex; align-items:flex-end; gap:6px; padding:6px 10px; }
.ar-dock__item { position:relative; background:none; border:0; padding:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; transform-origin:bottom center; transition:transform .12s ease-out; }
.ar-dock__icon { display:flex; align-items:center; justify-content:center; }
.ar-dock__icon svg, .ar-dock__icon img { width:100%; height:100%; display:block; pointer-events:none; }
.ar-dock__emoji { font-size:32px; line-height:1; }
.ar-dock__tooltip { position:absolute; bottom:calc(100% + 8px); background:#111; color:#fff; padding:3px 8px; font:11px sans-serif; border-radius:4px; white-space:nowrap; pointer-events:none; opacity:0; transition:opacity .12s; }
.ar-dock__item:hover .ar-dock__tooltip { opacity:1; }
.ar-dock__badge { position:absolute; top:-2px; right:-2px; min-width:16px; height:16px; padding:0 4px; background:#ef4444; color:#fff; border-radius:8px; font:600 10px sans-serif; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 2px #161616; }
.ar-dock__dot { position:absolute; width:4px; height:4px; border-radius:50%; opacity:0; transition:opacity .12s; }
.ar-dock__item--running .ar-dock__dot { opacity:1; }

/* macOS style — translucent floating dock */
.ar-dock--macos { background:rgba(28, 28, 30, 0.6); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-radius:18px; border:1px solid rgba(255,255,255,.08); padding:0; height:78px; }
.ar-dock--macos .ar-dock__item { width:56px; height:62px; }
.ar-dock--macos .ar-dock__icon { width:48px; height:48px; border-radius:11px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,.4); background:linear-gradient(135deg, #2a2a2c 0%, #1c1c1e 100%); }
.ar-dock--macos .ar-dock__emoji { font-size:36px; }
.ar-dock--macos .ar-dock__sep { width:1px; height:48px; background:rgba(255,255,255,.18); margin:0 4px; align-self:center; }
.ar-dock--macos .ar-dock__dot { bottom:0; background:#d4d4d4; }

/* Windows style — flat bottom taskbar */
.ar-dock--windows { background:rgba(32, 32, 36, 0.92); backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px); height:48px; padding:0 4px; gap:4px; border-top:1px solid rgba(255,255,255,.04); }
.ar-dock--windows .ar-dock__start { display:flex; align-items:center; gap:6px; background:transparent; border:0; color:#d4d4d4; height:40px; padding:0 12px; border-radius:6px; cursor:pointer; transition:background .12s; }
.ar-dock--windows .ar-dock__start:hover { background:rgba(255,255,255,.08); }
.ar-dock--windows .ar-dock__start-icon { display:flex; align-items:center; justify-content:center; color:#60a5fa; }
.ar-dock--windows .ar-dock__start-label { font:13px sans-serif; }
.ar-dock--windows .ar-dock__track { flex:1; padding:0 4px; gap:2px; align-items:center; height:48px; overflow:hidden; }
.ar-dock--windows .ar-dock__item { width:40px; height:40px; flex-direction:column; justify-content:center; border-radius:6px; transition:background .12s; }
.ar-dock--windows .ar-dock__item:hover { background:rgba(255,255,255,.08); }
.ar-dock--windows .ar-dock__item--active { background:rgba(255,255,255,.12); }
.ar-dock--windows .ar-dock__icon { width:22px; height:22px; }
.ar-dock--windows .ar-dock__emoji { font-size:20px; }
.ar-dock--windows .ar-dock__dot { bottom:2px; height:3px; width:16px; border-radius:2px; background:#60a5fa; }
.ar-dock--windows .ar-dock__item--running.ar-dock__item--active .ar-dock__dot { width:24px; }
.ar-dock--windows .ar-dock__tray { display:flex; align-items:center; gap:4px; padding:0 8px 0 4px; height:48px; border-left:1px solid rgba(255,255,255,.04); }
.ar-dock--windows .ar-dock__item--tray { width:28px; height:28px; }
.ar-dock--windows .ar-dock__item--tray .ar-dock__icon { width:18px; height:18px; }
.ar-dock--windows .ar-dock__item--tray .ar-dock__emoji { font-size:16px; }
.ar-dock--windows .ar-dock__clock { display:flex; flex-direction:column; align-items:flex-end; padding:0 8px; font:11px sans-serif; color:#d4d4d4; line-height:1.2; cursor:default; }
.ar-dock--windows .ar-dock__clock:hover { background:rgba(255,255,255,.08); }
.ar-dock--windows .ar-dock__time { font-weight:500; }
.ar-dock--windows .ar-dock__date { font-size:10px; opacity:.85; }
.ar-dock--windows .ar-dock__sep { display:none; }

@media (max-width: 600px) {
  .ar-dock--macos { height:64px; border-radius:14px; }
  .ar-dock--macos .ar-dock__item { width:44px; height:50px; }
  .ar-dock--macos .ar-dock__icon { width:38px; height:38px; border-radius:9px; }
  .ar-dock--macos .ar-dock__emoji { font-size:28px; }
  .ar-dock--windows { height:42px; }
  .ar-dock--windows .ar-dock__item { width:34px; height:34px; }
  .ar-dock--windows .ar-dock__icon { width:18px; height:18px; }
  .ar-dock--windows .ar-dock__emoji { font-size:16px; }
  .ar-dock--windows .ar-dock__start-label { display:none; }
  .ar-dock--windows .ar-dock__tray .ar-dock__item--tray { width:24px; height:24px; }
  .ar-dock--windows .ar-dock__clock { font-size:10px; padding:0 4px; }
  .ar-dock--windows .ar-dock__date { display:none; }
  .ar-dock__tooltip { display:none; }
}
`;
        document.head.appendChild(s);
    }
}
