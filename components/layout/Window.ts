// components/layout/Window.ts
//
// Window — desktop-style window chrome with draggable title bar, resize
// handle, minimize / maximize / close controls, optional menu bar, and a
// dedicated body slot for arbitrary content. Two visual styles match the
// Dock component:
//   • 'macos'   — traffic-light buttons (red / yellow / green) on the left,
//                 centered title, subtle shadow, rounded 10px corners.
//   • 'windows' — minimize / maximize / close on the right, square corners,
//                 thin top accent bar.
//
// Public API:
//   • new Window(container, opts)
//   • setTitle(t), setBody(node|html), setMenu(items), setStyle(s)
//   • minimize(), maximize(), restore(), close()
//   • moveTo(x, y), resizeTo(w, h), focus()
//   • on('close'|'minimize'|'maximize'|'restore'|'focus'|'move'|'resize'|'menu', cb)

import { Control } from '../core/Control';

// Local typed view of Control — keeps this file independent of Control's
// own TS typings (which vary across the project tree).
type ControlBase = Control & {
    el        : HTMLElement;
    _get<T = unknown>(key: string, fallback?: T): T;
    _emit(type: string, detail?: unknown, ev?: Event): void;
    _build(): void;
};

export type WindowStyle = 'macos' | 'windows';

export interface WindowMenuItem {
    id      : string;
    label   : string;
    /** Submenu items (one level deep). */
    items?  : Array<{ id: string; label: string; shortcut?: string; disabled?: boolean }>;
}

export interface WindowOptions {
    style?     : WindowStyle;
    title?     : string;
    /** HTML string OR a DOM node to mount inside the body. */
    body?      : string | HTMLElement;
    /** Menu bar items (macOS-style top menu, or Windows in-window menu). */
    menu?      : WindowMenuItem[];
    /** Initial position in container coords. Defaults to centered. */
    x?         : number;
    y?         : number;
    /** Initial size. */
    width?     : number;
    height?    : number;
    minWidth?  : number;
    minHeight? : number;
    /** Show the resize handle. Default true. */
    resizable? : boolean;
    /** Show min/max/close buttons. Default true. */
    chrome?    : boolean;
    /** Bring focus when created. Default true. */
    focused?   : boolean;
    /** Extra CSS class. */
    class?     : string;
}

// Track the highest z-index across all Window instances so a focused window
// always sits on top of its peers. Reasonable starting value.
let WIN_Z = 100;

export class Window extends Control {
    private _style    : WindowStyle;
    private _title    : string;
    private _menu     : WindowMenuItem[] = [];
    private _w        : number;
    private _h        : number;
    private _x        : number;
    private _y        : number;
    private _minW     : number;
    private _minH     : number;
    private _maximized: boolean = false;
    private _minimized: boolean = false;
    private _prevRect : { x: number; y: number; w: number; h: number } | null = null;
    private _elTitle! : HTMLElement;
    private _elBody!  : HTMLElement;
    private _elMenu?  : HTMLElement;

    constructor(container: HTMLElement | string, opts: WindowOptions = {}) {
        super(container as HTMLElement, 'div', {
            style    : 'macos',
            title    : 'Untitled',
            width    : 480,
            height   : 320,
            minWidth : 200,
            minHeight: 120,
            resizable: true,
            chrome   : true,
            focused  : true,
            ...opts,
        });
        const self = this as unknown as ControlBase;
        this._style = self._get<WindowStyle>('style', 'macos');
        this._title = self._get<string>('title', 'Untitled');
        this._menu  = (opts.menu ?? []).map(m => ({ ...m, items: m.items ? [...m.items] : undefined }));
        this._w     = self._get<number>('width', 480);
        this._h     = self._get<number>('height', 320);
        this._minW  = self._get<number>('minWidth', 200);
        this._minH  = self._get<number>('minHeight', 120);
        this._x     = opts.x ?? -1;
        this._y     = opts.y ?? -1;
        this._injectStyles();
        this._build();
        // Apply size + position after _build so the DOM exists.
        this._applyRect();
        if (opts.body) this.setBody(opts.body);
        if (self._get<boolean>('focused', true)) this.focus();
    }

    // ── Public API ─────────────────────────────────────────────────────────
    setTitle(t: string): this {
        this._title = t;
        if (this._elTitle) this._elTitle.textContent = t;
        return this;
    }
    setBody(content: string | HTMLElement): this {
        if (!this._elBody) return this;
        this._elBody.innerHTML = '';
        if (typeof content === 'string') this._elBody.innerHTML = content;
        else this._elBody.appendChild(content);
        return this;
    }
    setMenu(items: WindowMenuItem[]): this {
        this._menu = items.map(m => ({ ...m, items: m.items ? [...m.items] : undefined }));
        this._renderMenu();
        return this;
    }
    setStyle(s: WindowStyle): this { this._style = s; this._build(); this._applyRect(); return this; }
    getStyle(): WindowStyle { return this._style; }
    moveTo(x: number, y: number): this {
        this._x = x; this._y = y; this._applyRect();
        (this as unknown as ControlBase)._emit('move', { x, y });
        return this;
    }
    resizeTo(w: number, h: number): this {
        this._w = Math.max(this._minW, w);
        this._h = Math.max(this._minH, h);
        this._applyRect();
        (this as unknown as ControlBase)._emit('resize', { w: this._w, h: this._h });
        return this;
    }
    focus(): this {
        WIN_Z += 1;
        (this as unknown as ControlBase).el.style.zIndex = String(WIN_Z);
        (this as unknown as ControlBase).el.classList.add('ar-window--focused');
        // Defocus siblings — every other ar-window in the same parent.
        const self = this as unknown as ControlBase;
        const parent = self.el.parentElement;
        if (parent) {
            parent.querySelectorAll('.ar-window--focused').forEach((w) => {
                if (w !== self.el) w.classList.remove('ar-window--focused');
            });
        }
        (this as unknown as ControlBase)._emit('focus', {});
        return this;
    }
    minimize(): this {
        if (this._minimized) return this;
        this._minimized = true;
        (this as unknown as ControlBase).el.classList.add('ar-window--minimized');
        (this as unknown as ControlBase)._emit('minimize', {});
        return this;
    }
    maximize(): this {
        if (this._maximized) return this;
        this._prevRect = { x: this._x, y: this._y, w: this._w, h: this._h };
        this._maximized = true;
        const self = this as unknown as ControlBase;
        self.el.classList.add('ar-window--maximized');
        const parent = self.el.parentElement;
        if (parent) {
            const r = parent.getBoundingClientRect();
            this._x = 0; this._y = 0;
            this._w = r.width; this._h = r.height;
            this._applyRect();
        }
        (this as unknown as ControlBase)._emit('maximize', {});
        return this;
    }
    restore(): this {
        const self = this as unknown as ControlBase;
        self.el.classList.remove('ar-window--minimized', 'ar-window--maximized');
        this._minimized = false;
        this._maximized = false;
        if (this._prevRect) {
            ({ x: this._x, y: this._y, w: this._w, h: this._h } = this._prevRect);
            this._prevRect = null;
            this._applyRect();
        }
        (this as unknown as ControlBase)._emit('restore', {});
        return this;
    }
    close(): this {
        (this as unknown as ControlBase)._emit('close', {});
        const self = this as unknown as ControlBase;
        self.el.parentElement?.removeChild(self.el);
        return this;
    }

    // ── Build ──────────────────────────────────────────────────────────────
    _build(): void {
        const self = this as unknown as ControlBase;
        const showChrome = self._get<boolean>('chrome', true);
        const resizable  = self._get<boolean>('resizable', true);
        const cls        = self._get<string>('class', '');
        self.el.className = `ar-window ar-window--${this._style}${cls ? ' ' + cls : ''}`;
        self.el.tabIndex = 0;

        const trafficLights = this._style === 'macos'
            ? `<div class="ar-window__lights">
                 <button class="ar-window__light ar-window__light--close"    data-r="close"    aria-label="Close"></button>
                 <button class="ar-window__light ar-window__light--minimize" data-r="minimize" aria-label="Minimize"></button>
                 <button class="ar-window__light ar-window__light--maximize" data-r="maximize" aria-label="Maximize"></button>
               </div>`
            : '';
        const winButtons = this._style === 'windows'
            ? `<div class="ar-window__btns">
                 <button class="ar-window__btn" data-r="minimize" aria-label="Minimize">−</button>
                 <button class="ar-window__btn" data-r="maximize" aria-label="Maximize">▢</button>
                 <button class="ar-window__btn ar-window__btn--close" data-r="close" aria-label="Close">×</button>
               </div>`
            : '';

        self.el.innerHTML = `
<header class="ar-window__chrome" data-r="chrome">
  ${trafficLights}
  <div class="ar-window__title" data-r="title">${escapeAttr(this._title)}</div>
  ${winButtons}
</header>
<nav class="ar-window__menu" data-r="menu" hidden></nav>
<section class="ar-window__body" data-r="body"></section>
${resizable ? `
<div class="ar-window__edge ar-window__edge--n"  data-r="resize" data-edge="n"  aria-label="Resize north"></div>
<div class="ar-window__edge ar-window__edge--s"  data-r="resize" data-edge="s"  aria-label="Resize south"></div>
<div class="ar-window__edge ar-window__edge--w"  data-r="resize" data-edge="w"  aria-label="Resize west"></div>
<div class="ar-window__edge ar-window__edge--e"  data-r="resize" data-edge="e"  aria-label="Resize east"></div>
<div class="ar-window__edge ar-window__edge--nw" data-r="resize" data-edge="nw" aria-label="Resize north-west"></div>
<div class="ar-window__edge ar-window__edge--ne" data-r="resize" data-edge="ne" aria-label="Resize north-east"></div>
<div class="ar-window__edge ar-window__edge--sw" data-r="resize" data-edge="sw" aria-label="Resize south-west"></div>
<div class="ar-window__edge ar-window__edge--se" data-r="resize" data-edge="se" aria-label="Resize south-east"></div>` : ''}`;

        this._elTitle = self.el.querySelector('[data-r="title"]') as HTMLElement;
        this._elBody  = self.el.querySelector('[data-r="body"]')  as HTMLElement;
        this._elMenu  = self.el.querySelector('[data-r="menu"]')  as HTMLElement;

        if (showChrome) {
            self.el.querySelector('[data-r="close"]')   ?.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
            self.el.querySelector('[data-r="minimize"]')?.addEventListener('click', (e) => { e.stopPropagation(); this.minimize(); });
            self.el.querySelector('[data-r="maximize"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this._maximized) this.restore(); else this.maximize();
            });
        }

        // Drag by title bar
        const chrome = self.el.querySelector('[data-r="chrome"]') as HTMLElement;
        this._wireDrag(chrome);
        if (resizable) {
            self.el.querySelectorAll<HTMLElement>('[data-r="resize"]').forEach(h => this._wireResize(h));
        }

        // Focus on click
        self.el.addEventListener('pointerdown', () => this.focus());

        this._renderMenu();
    }

    private _renderMenu(): void {
        if (!this._elMenu) return;
        if (this._menu.length === 0) {
            this._elMenu.hidden = true;
            return;
        }
        this._elMenu.hidden = false;
        this._elMenu.innerHTML = '';
        for (const item of this._menu) {
            const btn = document.createElement('button');
            btn.className = 'ar-window__menu-item';
            btn.textContent = item.label;
            btn.dataset.id = item.id;
            btn.addEventListener('click', () => {
                (this as unknown as ControlBase)._emit('menu', { id: item.id, label: item.label });
            });
            this._elMenu.appendChild(btn);
        }
    }

    private _applyRect(): void {
        const self = this as unknown as ControlBase;
        // If x/y < 0 → center within parent.
        if (this._x < 0 || this._y < 0) {
            const p = self.el.parentElement?.getBoundingClientRect();
            if (p) {
                this._x = Math.max(0, (p.width  - this._w) / 2);
                this._y = Math.max(0, (p.height - this._h) / 2);
            } else {
                this._x = 32; this._y = 32;
            }
        }
        self.el.style.left   = `${this._x}px`;
        self.el.style.top    = `${this._y}px`;
        self.el.style.width  = `${this._w}px`;
        self.el.style.height = `${this._h}px`;
    }

    private _wireDrag(handle: HTMLElement): void {
        let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
        handle.addEventListener('pointerdown', (e: PointerEvent) => {
            if ((e.target as HTMLElement).closest('button')) return;
            if (this._maximized) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY; ox = this._x; oy = this._y;
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        handle.addEventListener('pointermove', (e: PointerEvent) => {
            if (!dragging) return;
            this._x = ox + (e.clientX - sx);
            this._y = Math.max(0, oy + (e.clientY - sy));
            this._applyRect();
            (this as unknown as ControlBase)._emit('move', { x: this._x, y: this._y });
        });
        const stop = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            try { handle.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        };
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    }

    private _wireResize(handle: HTMLElement): void {
        // Edge encoding: each handle carries data-edge ∈ {n,s,w,e,nw,ne,sw,se}.
        // For an edge that includes 'n' we move the top of the rect (decrease y
        // by the dy, increase h by -dy). For 's' we just grow h by +dy. Mirror
        // for w/e on the x axis. Corner handles combine both axes.
        // Min size is enforced per axis; when the minimum is hit on a 'n' or
        // 'w' edge we hold the opposite side fixed so the window doesn't drift.
        const edge = handle.dataset.edge ?? 'se';
        const moveTop    = edge.includes('n');
        const moveBottom = edge.includes('s');
        const moveLeft   = edge.includes('w');
        const moveRight  = edge.includes('e');

        let sx = 0, sy = 0, ow = 0, oh = 0, ox = 0, oy = 0, dragging = false;

        handle.addEventListener('pointerdown', (e: PointerEvent) => {
            if (this._maximized) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            ow = this._w;   oh = this._h;
            ox = this._x;   oy = this._y;
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
            e.stopPropagation();
        });

        handle.addEventListener('pointermove', (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - sx;
            const dy = e.clientY - sy;

            if (moveRight) {
                this._w = Math.max(this._minW, ow + dx);
            }
            if (moveLeft) {
                // Pulling left grows the window; pulling right shrinks it.
                // Cap the shift so we never go below minW (the right edge
                // stays anchored — we compute the largest x shift that keeps
                // ow - dx ≥ minW, i.e. dx ≤ ow - minW).
                const clampedDx = Math.min(dx, ow - this._minW);
                this._w = ow - clampedDx;
                this._x = ox + clampedDx;
            }
            if (moveBottom) {
                this._h = Math.max(this._minH, oh + dy);
            }
            if (moveTop) {
                // Same mirror logic on the Y axis. Also clamp y ≥ 0 so the
                // title bar never slides above the viewport.
                let clampedDy = Math.min(dy, oh - this._minH);
                if (oy + clampedDy < 0) clampedDy = -oy;
                this._h = oh - clampedDy;
                this._y = oy + clampedDy;
            }

            this._applyRect();
            (this as unknown as ControlBase)._emit('resize', { w: this._w, h: this._h });
            if (moveLeft || moveTop) {
                (this as unknown as ControlBase)._emit('move', { x: this._x, y: this._y });
            }
        });

        const stop = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            try { handle.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        };
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    }

    private _injectStyles(): void {
        if (document.getElementById('ar-window-styles')) return;
        const s = document.createElement('style');
        s.id = 'ar-window-styles';
        s.textContent = `
.ar-window {
    position: absolute;
    display: flex; flex-direction: column;
    background: #1e1e1e;
    color: #d4d4d4;
    font: 13px -apple-system, system-ui, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.4);
    overflow: hidden;
    user-select: none;
}
.ar-window:not(.ar-window--focused) { opacity: 0.92; box-shadow: 0 4px 14px rgba(0,0,0,.35); }
.ar-window__chrome {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 12px;
    height: 30px; flex-shrink: 0;
    background: #2a2a2c;
    border-bottom: 1px solid #1a1a1a;
    cursor: grab;
    position: relative;
}
.ar-window__chrome:active { cursor: grabbing; }
.ar-window__title {
    flex: 1;
    text-align: center;
    font: 600 12px sans-serif;
    color: #d4d4d4;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    pointer-events: none;
}
.ar-window__menu {
    display: flex; align-items: center; gap: 14px;
    height: 26px; padding: 0 12px;
    background: #1f1f21;
    border-bottom: 1px solid #1a1a1a;
    font: 11px sans-serif;
}
.ar-window__menu-item {
    background: none; border: 0; color: #d4d4d4;
    padding: 2px 6px;
    cursor: pointer;
    border-radius: 3px;
    font: 11px sans-serif;
}
.ar-window__menu-item:hover { background: rgba(255,255,255,.08); }
.ar-window__body {
    flex: 1; min-height: 0;
    overflow: auto;
    background: #1e1e1e;
    user-select: text;
}
.ar-window__edge {
    position: absolute;
    /* Default invisible — handles are interaction-only hit areas. The corner
     * grips are drawn via the body's border-radius/box-shadow visuals; users
     * locate them by cursor change, not by a visible glyph. */
    background: transparent;
    z-index: 2;
    touch-action: none;
}
/* Edge strips — 6px wide along each side, slightly inset from corners so
 * they don't fight with the 12×12 corner handles for pointer capture. */
.ar-window__edge--n { top:    -3px; left:  10px; right: 10px; height: 6px;  cursor: ns-resize; }
.ar-window__edge--s { bottom: -3px; left:  10px; right: 10px; height: 6px;  cursor: ns-resize; }
.ar-window__edge--w { left:   -3px; top:   10px; bottom: 10px; width: 6px;  cursor: ew-resize; }
.ar-window__edge--e { right:  -3px; top:   10px; bottom: 10px; width: 6px;  cursor: ew-resize; }
/* Corner squares — 12×12 hit boxes overlapping the edges, so the four
 * corners win the pointer when the user lands within ~6px of each. */
.ar-window__edge--nw { top:    -3px; left:   -3px; width: 14px; height: 14px; cursor: nwse-resize; }
.ar-window__edge--ne { top:    -3px; right:  -3px; width: 14px; height: 14px; cursor: nesw-resize; }
.ar-window__edge--sw { bottom: -3px; left:   -3px; width: 14px; height: 14px; cursor: nesw-resize; }
.ar-window__edge--se { bottom: -3px; right:  -3px; width: 14px; height: 14px; cursor: nwse-resize;
    /* Keep the classic SE corner grip glyph visible — it's the universal
     * "this can be resized" affordance most users look for. */
    background:
        linear-gradient(135deg, transparent 0%, transparent 40%, #555 41%, #555 50%, transparent 51%, transparent 65%, #555 66%, #555 75%, transparent 76%);
}

/* ── macOS style ─────────────────────────────────────────────────────── */
.ar-window--macos {
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,.05);
}
.ar-window--macos .ar-window__chrome {
    background: linear-gradient(180deg, #3a3a3c 0%, #2a2a2c 100%);
    height: 28px;
    border-radius: 10px 10px 0 0;
}
.ar-window--macos .ar-window__lights {
    display: flex; gap: 6px; align-items: center;
    position: relative; z-index: 1;
}
.ar-window__light {
    width: 12px; height: 12px; border-radius: 50%;
    border: 0; cursor: pointer; padding: 0;
    transition: filter .12s;
}
.ar-window__light:hover { filter: brightness(1.15); }
.ar-window__light--close    { background: #ff5f57; }
.ar-window__light--minimize { background: #ffbd2e; }
.ar-window__light--maximize { background: #28c940; }
.ar-window--macos:not(.ar-window--focused) .ar-window__light { background: #555; }

/* ── Windows style ───────────────────────────────────────────────────── */
.ar-window--windows {
    border-radius: 0;
    border: 1px solid #444;
}
.ar-window--windows .ar-window__chrome {
    background: #1f1f23;
    border-bottom: 1px solid #444;
    height: 32px;
    padding-left: 12px;
    padding-right: 0;
}
.ar-window--windows .ar-window__title { text-align: left; }
.ar-window--windows .ar-window__btns {
    display: flex; height: 100%;
}
.ar-window__btn {
    background: none; border: 0; color: #d4d4d4;
    width: 44px; height: 100%;
    cursor: pointer;
    font: 14px sans-serif;
    display: flex; align-items: center; justify-content: center;
    transition: background .12s;
}
.ar-window__btn:hover { background: rgba(255,255,255,.08); }
.ar-window__btn--close:hover { background: #c42b1c; color: #fff; }

/* ── States ──────────────────────────────────────────────────────────── */
.ar-window--minimized { display: none; }
.ar-window--maximized {
    border-radius: 0;
    box-shadow: none;
}
.ar-window--focused {
    box-shadow: 0 12px 40px rgba(0,0,0,.6), 0 4px 12px rgba(0,0,0,.4);
}

@media (max-width: 600px) {
    .ar-window__chrome { height: 26px; padding: 0 8px; }
    .ar-window__title { font-size: 11px; }
    .ar-window__btn { width: 36px; }
    .ar-window__menu { height: 22px; padding: 0 8px; gap: 10px; }
    .ar-window__menu-item { font-size: 10px; }
}
`;
        document.head.appendChild(s);
    }
}

function escapeAttr(s: string): string {
    return s.replace(/[&<>"']/g, (c: string) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
