/**
 * @module    components/layout/Window
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Window — desktop-style window chrome. Title bar (draggable), optional menu
 * bar, traffic-light or min/max/close controls, body slot, and 8-direction
 * resize. Two visual styles match the Dock:
 *   • 'macos'   — traffic-light buttons (red/yellow/green) on the left,
 *                 centered title, subtle shadow, rounded 10px corners.
 *   • 'windows' — minimize / maximize / close on the right, square corners,
 *                 thin top accent bar.
 *
 * Drag & resize are delegated to the modifier custom elements:
 *   • <arianna-mover handle-selector=".ar-window__titlebar">
 *   • <arianna-resizer handles="n,s,e,w,ne,nw,se,sw">
 *
 * @example JS
 *   const w = new WindowComponent();
 *   w.title  = 'My App';
 *   w.style  = 'macos';
 *   w.x = 100; w.y = 100; w.width = 480; w.height = 320;
 *   const body = document.createElement('div');
 *   body.innerHTML = '<p>Hello</p>';
 *   body.slot = 'body';
 *   w.append(body);
 *   document.body.append(w);
 *
 * @example HTML
 *   <arianna-window style="macos" title="My App" x="100" y="100" width="480" height="320">
 *     <ul slot="menu" data-id="file" data-label="File"></ul>
 *     <div slot="body">Window content</div>
 *   </arianna-window>
 *
 * Events:
 *   - arianna:close
 *   - arianna:minimize
 *   - arianna:maximize
 *   - arianna:restore
 *   - arianna:focus
 *   - arianna:move      (bubbles from arianna-mover)
 *   - arianna:resize    (bubbles from arianna-resizer)
 *
 * Slots: titlebar (overrides default title), menu, body
 *
 * Attrs:
 *   style ('macos'|'windows'), title, x, y, width, height,
 *   min-width, min-height, resizable, chrome, focused, maximized, minimized
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type WindowStyle = 'macos' | 'windows';

export interface WindowMenuItem {
    id    : string;
    label : string;
    items?: Array<{ id: string; label: string; shortcut?: string; disabled?: boolean }>;
}

export interface WindowOptions {
    style?     : WindowStyle;
    title?     : string;
    x?         : number;
    y?         : number;
    width?     : number;
    height?    : number;
    minWidth?  : number;
    minHeight? : number;
    resizable? : boolean;
    chrome?    : boolean;
    focused?   : boolean;
}

// Global z-index counter so a focused window always sits on top of its peers.
let WIN_Z = 100;

export class WindowComponent extends Component('arianna-window', HTMLElement, {}, {
    attrs : [
        'variant', 'title', 'x', 'y', 'width', 'height',
        'min-width', 'min-height', 'resizable', 'chrome',
        'focused', 'maximized', 'minimized',
    ],
})
{
    #prevRect: { x: number; y: number; w: number; h: number } | null = null;

    build(_opts: WindowOptions = {})
    {
        // Default positioning + sizing on first build if not specified
        if (!this.hasAttribute('width'))  this.setAttribute('width',  '480');
        if (!this.hasAttribute('height')) this.setAttribute('height', '320');
        if (!this.hasAttribute('style'))  this.setAttribute('style',  'macos');

        const titleSig = this.attrSignal('title');
        const styleAttr = this.attrSignal('variant');

        const applyGeometry = () => {
            const x = parseInt(this.getAttribute('x') ?? '', 10);
            const y = parseInt(this.getAttribute('y') ?? '', 10);
            const w = parseInt(this.getAttribute('width')  ?? '480', 10) || 480;
            const h = parseInt(this.getAttribute('height') ?? '320', 10) || 320;
            this.style.position = 'absolute';
            if (!isNaN(x)) this.style.left = x + 'px';
            if (!isNaN(y)) this.style.top  = y + 'px';
            this.style.width  = w + 'px';
            this.style.height = h + 'px';
        };
        applyGeometry();
        this.addEventListener('arianna:attr-x',      applyGeometry);
        this.addEventListener('arianna:attr-y',      applyGeometry);
        this.addEventListener('arianna:attr-width',  applyGeometry);
        this.addEventListener('arianna:attr-height', applyGeometry);

        // Update internal state on resize/move modifier events; sync attrs back
        this.addEventListener('arianna:resize', (e: Event) => {
            const ev = e as CustomEvent<{ width: number; height: number }>;
            const d = ev.detail;
            if (d?.width)  this.setAttribute('width',  String(d.width));
            if (d?.height) this.setAttribute('height', String(d.height));
        });
        this.addEventListener('arianna:move', (e: Event) => {
            const ev = e as CustomEvent<{ x: number; y: number }>;
            const d = ev.detail;
            if (typeof d?.x === 'number') this.setAttribute('x', String(d.x));
            if (typeof d?.y === 'number') this.setAttribute('y', String(d.y));
        });

        // Click-to-focus
        const onFocus = () => this.focus_();
        this.addEventListener('pointerdown', onFocus, true);

        this.titleText = () => titleSig.get() ?? '';
        this.dockStyle = () => (styleAttr.get() ?? 'macos') as WindowStyle;
        this.isMacOS   = () => this.dockStyle() === 'macos';
        this.isWindows = () => this.dockStyle() === 'windows';
        this.hasChrome = () => this.getAttribute('chrome') !== 'false';
        this.isResizable = () => this.getAttribute('resizable') !== 'false';

        this.minW = () => parseInt(this.getAttribute('min-width')  ?? '200', 10) || 200;
        this.minH = () => parseInt(this.getAttribute('min-height') ?? '120', 10) || 120;

        this.onCloseClick = () => {
            this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
        };
        this.onMinClick = () => this.minimize();
        this.onMaxClick = () => this.hasAttribute('maximized') ? this.restore() : this.maximize();

        this.template = html`
            <div class="ar-window__titlebar">
                <!-- macOS traffic lights left -->
                <div class="ar-window__traffic" a-if="this.isMacOS() && this.hasChrome()">
                    <button class="ar-window__btn ar-window__btn--close"    @click="this.onCloseClick" aria-label="Close"></button>
                    <button class="ar-window__btn ar-window__btn--minimize" @click="this.onMinClick"   aria-label="Minimize"></button>
                    <button class="ar-window__btn ar-window__btn--maximize" @click="this.onMaxClick"   aria-label="Maximize"></button>
                </div>

                <span class="ar-window__title"><slot name="title">{{ this.titleText() }}</slot></span>

                <!-- Windows-style chrome right -->
                <div class="ar-window__chrome" a-if="this.isWindows() && this.hasChrome()">
                    <button class="ar-window__chrome-btn" @click="this.onMinClick"   aria-label="Minimize">─</button>
                    <button class="ar-window__chrome-btn" @click="this.onMaxClick"   aria-label="Maximize">▢</button>
                    <button class="ar-window__chrome-btn ar-window__chrome-btn--close"
                            @click="this.onCloseClick" aria-label="Close">✕</button>
                </div>
            </div>

            <div class="ar-window__menu"><slot name="menu"></slot></div>

            <div class="ar-window__body">
                <slot name="body"></slot>
                <slot></slot>
            </div>

            <!-- Modifiers: drag the titlebar; resize from any edge / corner -->
            <arianna-mover handle-selector=".ar-window__titlebar" bounds="none"></arianna-mover>
            <arianna-resizer a-if="this.isResizable()"
                             handles="n,s,e,w,ne,nw,se,sw"
                             :min-width="String(this.minW())"
                             :min-height="String(this.minH())"
                             allow-cross="false"></arianna-resizer>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = WindowComponent.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    minimize(): this {
        this.setAttribute('minimized', '');
        this.style.display = 'none';
        this.dispatchEvent(new CustomEvent('arianna:minimize', { bubbles: true, detail: {} }));
        return this;
    }

    maximize(): this {
        if (this.hasAttribute('maximized')) return this;
        // Save current geometry to restore later
        this.#prevRect = {
            x: this.offsetLeft, y: this.offsetTop,
            w: this.offsetWidth, h: this.offsetHeight,
        };
        this.setAttribute('maximized', '');
        this.style.left = '0';
        this.style.top  = '0';
        this.style.width  = '100%';
        this.style.height = '100%';
        this.dispatchEvent(new CustomEvent('arianna:maximize', { bubbles: true, detail: {} }));
        return this;
    }

    restore(): this {
        if (this.hasAttribute('minimized')) {
            this.removeAttribute('minimized');
            this.style.display = '';
            this.dispatchEvent(new CustomEvent('arianna:restore', { bubbles: true, detail: {} }));
            return this;
        }
        if (this.hasAttribute('maximized') && this.#prevRect) {
            this.removeAttribute('maximized');
            this.setAttribute('x',      String(this.#prevRect.x));
            this.setAttribute('y',      String(this.#prevRect.y));
            this.setAttribute('width',  String(this.#prevRect.w));
            this.setAttribute('height', String(this.#prevRect.h));
            this.#prevRect = null;
            this.dispatchEvent(new CustomEvent('arianna:restore', { bubbles: true, detail: {} }));
        }
        return this;
    }

    /**
     * Bring this window to the top of its z-stack and fire 'arianna:focus'.
     * Named `focus_` internally to avoid clobbering HTMLElement.focus().
     */
    focus_(): this {
        WIN_Z += 1;
        this.style.zIndex = String(WIN_Z);
        this.setAttribute('focused', '');
        this.dispatchEvent(new CustomEvent('arianna:focus', { bubbles: true, detail: {} }));
        return this;
    }

    /** Programmatic move (also fired by the arianna-mover modifier). */
    moveTo(x: number, y: number): this {
        this.setAttribute('x', String(x));
        this.setAttribute('y', String(y));
        return this;
    }

    /** Programmatic resize (also fired by the arianna-resizer modifier). */
    resizeTo(w: number, h: number): this {
        this.setAttribute('width',  String(Math.max(this.minW(), w)));
        this.setAttribute('height', String(Math.max(this.minH(), h)));
        return this;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        // Defer initial focus to next tick so peers can mount first
        if (this.getAttribute('focused') !== 'false') {
            requestAnimationFrame(() => this.focus_());
        }
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // ── Attr getters / setters ───────────────────────────────────────────────

    get variant(): WindowStyle  { return (this.getAttribute('variant') ?? 'macos') as WindowStyle; }
    set variant(v: WindowStyle) { this.setAttribute('variant', v); }

    get title(): string  { return this.getAttribute('title') ?? ''; }
    set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

    get x(): number  { return parseInt(this.getAttribute('x') ?? '0', 10); }
    set x(v: number) { this.setAttribute('x', String(v)); }

    get y(): number  { return parseInt(this.getAttribute('y') ?? '0', 10); }
    set y(v: number) { this.setAttribute('y', String(v)); }

    get width(): number  { return parseInt(this.getAttribute('width') ?? '480', 10); }
    set width(v: number) { this.setAttribute('width', String(v)); }

    get height(): number  { return parseInt(this.getAttribute('height') ?? '320', 10); }
    set height(v: number) { this.setAttribute('height', String(v)); }

    get resizable(): boolean  { return this.getAttribute('resizable') !== 'false'; }
    set resizable(v: boolean) { this.setAttribute('resizable', v ? 'true' : 'false'); }

    get chrome(): boolean  { return this.getAttribute('chrome') !== 'false'; }
    set chrome(v: boolean) { this.setAttribute('chrome', v ? 'true' : 'false'); }

    get maximized(): boolean { return this.hasAttribute('maximized'); }
    get minimized(): boolean { return this.hasAttribute('minimized'); }

    // ── Template helpers ─────────────────────────────────────────────────────

    private titleText   : () => string = () => '';
    private dockStyle   : () => WindowStyle = () => 'macos';
    private isMacOS     : () => boolean = () => true;
    private isWindows   : () => boolean = () => false;
    private hasChrome   : () => boolean = () => true;
    private isResizable : () => boolean = () => true;
    private minW        : () => number = () => 200;
    private minH        : () => number = () => 120;
    private onCloseClick: () => void = () => {};
    private onMinClick  : () => void = () => {};
    private onMaxClick  : () => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    display      : 'flex',
                    flexDirection: 'column',
                    background   : 'var(--arianna-bg, #ffffff)',
                    color        : 'var(--arianna-text, #1f2328)',
                    overflow     : 'hidden',
                    boxShadow    : '0 16px 48px rgba(0,0,0,0.25)',
                    border       : '1px solid var(--arianna-border, #d8d8d8)',
                    minWidth     : '160px',
                    minHeight    : '80px',
                    fontFamily   : '-apple-system, system-ui, sans-serif',
                    boxSizing    : 'border-box',
                }),
                new Rule(':host([variant="macos"])',   { borderRadius: '10px' }),
                new Rule(':host([variant="windows"])', { borderRadius: '0' }),
                new Rule(':host([focused])', { boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }),
                new Rule(':host([maximized])', {
                    borderRadius: '0', border: 'none',
                }),

                // Title bar
                new Rule('.ar-window__titlebar', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display   : 'flex',
                    flexShrink: '0',
                    gap       : '8px',
                    height    : '36px',
                    padding   : '0 12px',
                    cursor    : 'move',
                    userSelect: 'none',
                }),
                new Rule(':host([variant="macos"]) .ar-window__titlebar', {
                    justifyContent: 'center',
                }),
                new Rule('.ar-window__title', {
                    flex      : '1',
                    fontSize  : '0.82rem',
                    fontWeight: '600',
                    textAlign : 'center',
                    color     : 'var(--arianna-muted, #6e6b62)',
                    overflow  : 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host([variant="windows"]) .ar-window__title', {
                    textAlign: 'left',
                    paddingLeft: '4px',
                }),

                // macOS traffic lights
                new Rule('.ar-window__traffic', {
                    display   : 'flex',
                    alignItems: 'center',
                    gap       : '8px',
                    flexShrink: '0',
                }),
                new Rule('.ar-window__btn', {
                    width     : '12px',
                    height    : '12px',
                    border    : 'none',
                    borderRadius: '50%',
                    cursor    : 'pointer',
                    padding   : '0',
                    transition: 'opacity 0.12s ease',
                }),
                new Rule('.ar-window__btn--close',    { background: '#ff5f57' }),
                new Rule('.ar-window__btn--minimize', { background: '#ffbd2e' }),
                new Rule('.ar-window__btn--maximize', { background: '#28c940' }),
                new Rule('.ar-window__btn:hover',     { opacity: '0.8' }),

                // Windows-style chrome
                new Rule('.ar-window__chrome', {
                    display   : 'flex',
                    alignItems: 'center',
                    flexShrink: '0',
                    marginLeft: 'auto',
                }),
                new Rule('.ar-window__chrome-btn', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-text, #1f2328)',
                    cursor    : 'pointer',
                    font      : 'inherit',
                    fontSize  : '0.8rem',
                    height    : '36px',
                    width     : '40px',
                    transition: 'background 0.12s ease',
                }),
                new Rule('.ar-window__chrome-btn:hover', {
                    background: 'var(--arianna-bg-4, #ebebeb)',
                }),
                new Rule('.ar-window__chrome-btn--close:hover', {
                    background: 'var(--arianna-danger, #cf222e)',
                    color     : '#ffffff',
                }),

                // Menu bar (custom slot content)
                new Rule('.ar-window__menu', {
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    flexShrink  : '0',
                }),
                new Rule('.ar-window__menu:empty', { display: 'none' }),

                // Body
                new Rule('.ar-window__body', {
                    flex     : '1',
                    overflow : 'auto',
                    position : 'relative',
                    minHeight: '0',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'WindowComponent', { value: WindowComponent, writable: false, enumerable: false, configurable: false,
    });
}

export default WindowComponent;
// Note: we deliberately do NOT add `export { WindowComponent as Window }`.
// TypeScript declaration emit treats that as a redeclaration of the global
// `Window` interface from lib.dom — the resulting .d.ts then fails to
// compile. Consumers should import `WindowComponent` directly.
