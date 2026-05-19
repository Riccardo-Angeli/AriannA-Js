/**
 * @module    components/layout/Drawer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Drawer — slide-in panel from any side of the viewport, with optional
 * backdrop dismiss. Hosts arbitrary slot content.
 *
 * @example JS
 *   const d = new Drawer();
 *   d.side   = 'right';
 *   d.width  = 320;
 *   document.body.append(d);
 *   d.append(somePanel);
 *   d.open();
 *
 * @example HTML
 *   <arianna-drawer side="left" width="280" close-on-backdrop>
 *     <h3>Menu</h3>
 *     <ul>...</ul>
 *   </arianna-drawer>
 *
 * Events:
 *   - arianna:open
 *   - arianna:close
 *
 * Slots:  default — drawer body
 * Attrs:  side, width, height, open, close-on-backdrop
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface DrawerOptions {
    side?            : 'left' | 'right' | 'top' | 'bottom';
    width?           : number;
    height?          : number;
    closeOnBackdrop? : boolean;
    open?            : boolean;
}

export class Drawer extends Component('arianna-drawer', HTMLElement, {}, {
    attrs : ['side', 'width', 'height', 'open', 'close-on-backdrop'],
})
{
    build(_opts: DrawerOptions = {})
    {
        const side   = this.attrSignal('side');
        const width  = this.attrSignal('width');
        const height = this.attrSignal('height');

        this.panelStyle = (): Record<string, string> => {
            const s = side.get() ?? 'left';
            if (s === 'left' || s === 'right') {
                const w = parseInt(width.get() ?? '280', 10) || 280;
                return { width: w + 'px' };
            } else {
                const h = parseInt(height.get() ?? '240', 10) || 240;
                return { height: h + 'px' };
            }
        };

        this.onBackdrop = () => {
            const closeOn = this.getAttribute('close-on-backdrop');
            if (closeOn !== 'false') this.close();
        };

        this.template = html`
            <div class="ar-drawer__backdrop" @click="this.onBackdrop"></div>
            <div class="ar-drawer__panel" :style="this.panelStyle()">
                <slot></slot>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Drawer.DefaultSheet();
    }

    open(): this
    {
        this.setAttribute('open', '');
        // tick so the CSS transition has something to interpolate from
        setTimeout(() => this.classList.add('ar-drawer--open'), 10);
        this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: {} }));
        return this;
    }

    close(): this
    {
        this.classList.remove('ar-drawer--open');
        setTimeout(() => {
            this.removeAttribute('open');
            this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
        }, 250);
        return this;
    }

    get isOpen(): boolean { return this.hasAttribute('open'); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get side(): 'left' | 'right' | 'top' | 'bottom' { return (this.getAttribute('side') ?? 'left') as never; }
    set side(v: 'left' | 'right' | 'top' | 'bottom') { this.setAttribute('side', v); }

    get width(): number  { return parseInt(this.getAttribute('width') ?? '280', 10); }
    set width(v: number) { this.setAttribute('width', String(v)); }

    get height(): number  { return parseInt(this.getAttribute('height') ?? '240', 10); }
    set height(v: number) { this.setAttribute('height', String(v)); }

    get closeOnBackdrop(): boolean  { return this.getAttribute('close-on-backdrop') !== 'false'; }
    set closeOnBackdrop(v: boolean) { this.setAttribute('close-on-backdrop', v ? 'true' : 'false'); }

    private panelStyle: () => Record<string, string> = () => ({});
    private onBackdrop: () => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    position: 'fixed',
                    inset   : '0',
                    zIndex  : '900',
                    display : 'none',
                }),
                new Rule(':host([open])', { display: 'block' }),
                new Rule('.ar-drawer__backdrop', {
                    position  : 'absolute',
                    inset     : '0',
                    background: 'rgba(0,0,0,0.5)',
                    opacity   : '0',
                    transition: 'opacity 0.25s',
                }),
                new Rule(':host.ar-drawer--open .ar-drawer__backdrop', { opacity: '1' }),
                new Rule('.ar-drawer__panel', {
                    position  : 'absolute',
                    background: 'var(--arianna-bg, #ffffff)',
                    border    : '1px solid var(--arianna-border, #d8d8d8)',
                    boxShadow : '0 8px 32px rgba(0,0,0,0.20)',
                    overflowY : 'auto',
                    transition: 'transform 0.25s ease',
                }),
                new Rule(':host([side="left"]) .ar-drawer__panel',                { left: '0', top: '0', bottom: '0',  transform: 'translateX(-100%)' }),
                new Rule(':host([side="right"]) .ar-drawer__panel',               { right: '0', top: '0', bottom: '0', transform: 'translateX(100%)' }),
                new Rule(':host([side="top"]) .ar-drawer__panel',                 { top: '0', left: '0', right: '0',   transform: 'translateY(-100%)' }),
                new Rule(':host([side="bottom"]) .ar-drawer__panel',              { bottom: '0', left: '0', right: '0', transform: 'translateY(100%)' }),
                new Rule(':host(:not([side])) .ar-drawer__panel',                 { left: '0', top: '0', bottom: '0',  transform: 'translateX(-100%)' }),
                new Rule(':host.ar-drawer--open .ar-drawer__panel',             { transform: 'none' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Drawer', {
        value: Drawer, writable: false, enumerable: false, configurable: false,
    });
}

export default Drawer;
