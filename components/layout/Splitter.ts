/**
 * @module    components/layout/Splitter
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Splitter — two-pane resizable container with a draggable handle.
 *
 * The two panes are projected via named slots `pane-a` and `pane-b`. Drag the
 * central handle to redistribute space.
 *
 * @example JS
 *   const s = new Splitter();
 *   s.direction = 'horizontal';
 *   s.ratio     = 0.4;
 *   // append your content with slot attributes
 *   const a = document.createElement('div'); a.slot = 'pane-a'; a.textContent = 'Left';
 *   const b = document.createElement('div'); b.slot = 'pane-b'; b.textContent = 'Right';
 *   s.append(a, b);
 *
 * @example HTML
 *   <arianna-splitter direction="horizontal" ratio="0.3">
 *     <div slot="pane-a">Left pane</div>
 *     <div slot="pane-b">Right pane</div>
 *   </arianna-splitter>
 *
 * Events:
 *   - arianna:resize   detail: { ratio }
 *
 * Slots:  pane-a, pane-b
 * Attrs:  direction, ratio, min-a, min-b
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface SplitterOptions {
    direction? : 'horizontal' | 'vertical';
    ratio?     : number;
    minA?      : number;
    minB?      : number;
}

export class Splitter extends Component('arianna-splitter', HTMLElement, {}, {
    attrs : ['direction', 'ratio', 'min-a', 'min-b'],
    shadow: false,
})
{
    build(_opts: SplitterOptions = {})
    {
        const direction = this.attrSignal('direction');
        const ratio     = this.attrSignal('ratio');

        const clampedRatio = (): number => {
            const r = parseFloat(ratio.get() ?? '0.5');
            return Math.max(0.05, Math.min(0.95, Number.isFinite(r) ? r : 0.5));
        };

        this.paneAStyle = (): Record<string, string> => {
            const r   = clampedRatio() * 100;
            const dir = direction.get() ?? 'horizontal';
            return dir === 'horizontal' ? { width: r + '%' } : { height: r + '%' };
        };
        this.paneBStyle = (): Record<string, string> => {
            const r   = (1 - clampedRatio()) * 100;
            const dir = direction.get() ?? 'horizontal';
            return dir === 'horizontal' ? { width: r + '%' } : { height: r + '%' };
        };

        this.onHandleDown = (e: MouseEvent) => {
            e.preventDefault();
            const isH  = (direction.get() ?? 'horizontal') === 'horizontal';
            const rect = this.getBoundingClientRect();
            const minA = parseInt(this.getAttribute('min-a') ?? '60', 10) || 60;
            const minB = parseInt(this.getAttribute('min-b') ?? '60', 10) || 60;

            const move = (e2: MouseEvent) => {
                const total  = isH ? rect.width : rect.height;
                const offset = isH ? e2.clientX - rect.left : e2.clientY - rect.top;
                const newR   = Math.max(minA / total, Math.min(1 - minB / total, offset / total));
                this.setAttribute('ratio', String(newR));
                this.dispatchEvent(new CustomEvent('arianna:resize', {
                    bubbles: true, detail: { ratio: newR },
                }));
            };
            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup',   up);
        };

        this.template = html`
            <div class="ar-splitter__pane ar-splitter__pane--a" :style="this.paneAStyle()">
                <slot name="pane-a"></slot>
            </div>
            <div class="ar-splitter__handle" @mousedown="this.onHandleDown"></div>
            <div class="ar-splitter__pane ar-splitter__pane--b" :style="this.paneBStyle()">
                <slot name="pane-b"></slot>
            </div>
        `;

        this.Sheet = Splitter.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get direction(): 'horizontal' | 'vertical' { return (this.getAttribute('direction') ?? 'horizontal') as never; }
    set direction(v: 'horizontal' | 'vertical') { this.setAttribute('direction', v); }

    get ratio(): number  { return parseFloat(this.getAttribute('ratio') ?? '0.5'); }
    set ratio(v: number) { this.setAttribute('ratio', String(Math.max(0.05, Math.min(0.95, v)))); }

    get minA(): number  { return parseInt(this.getAttribute('min-a') ?? '60', 10); }
    set minA(v: number) { this.setAttribute('min-a', String(v)); }

    get minB(): number  { return parseInt(this.getAttribute('min-b') ?? '60', 10); }
    set minB(v: number) { this.setAttribute('min-b', String(v)); }

    private paneAStyle  : () => Record<string, string> = () => ({});
    private paneBStyle  : () => Record<string, string> = () => ({});
    private onHandleDown: (e: MouseEvent) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display : 'flex',
                    width   : '100%',
                    height  : '100%',
                    overflow: 'hidden',
                }),
                new Rule(':root[direction="vertical"]',     { flexDirection: 'column' }),
                new Rule(':root:not([direction])',          { flexDirection: 'row' }),
                new Rule('.ar-splitter__pane', { overflow: 'auto' }),
                new Rule('.ar-splitter__handle', {
                    background : 'var(--arianna-border, #d8d8d8)',
                    flexShrink : '0',
                    transition : 'background 0.18s ease',
                }),
                new Rule('.ar-splitter__handle:hover, .ar-splitter__handle:active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule(':root[direction="horizontal"] .ar-splitter__handle',  { cursor: 'col-resize', width: '4px' }),
                new Rule(':root:not([direction]) .ar-splitter__handle',         { cursor: 'col-resize', width: '4px' }),
                new Rule(':root[direction="vertical"] .ar-splitter__handle',    { cursor: 'row-resize', height: '4px' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Splitter', {
        value: Splitter, writable: false, enumerable: false, configurable: false,
    });
}

export default Splitter;
