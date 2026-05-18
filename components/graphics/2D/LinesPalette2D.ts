/**
 * @module    components/graphics/2D/LinesPalette2D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * LinesPalette2D — 2D drawing palette for profile creation:
 *   draw    — line, arc, polyline, spline, freehand, rect, ellipse, polygon
 *   close   — close path, open path, reverse direction
 *   to-3d   — extrude, revolve, sweep, loft
 *
 * Emits selection events. Consumer (Wires/Daedalus) maps them to canvas
 * behaviour and 3D geometry generation.
 *
 * @example HTML
 *   <arianna-lines-palette-2d active-tool="line" layout="vertical"></arianna-lines-palette-2d>
 *
 * Events:
 *   arianna:tool   detail: { tool: string }     when a drawing tool is selected
 *   arianna:action detail: { action: string }   when a one-shot action fires (close/open/reverse)
 *   arianna:to-3d  detail: { kind: string }     when a 2D→3D conversion is requested
 *
 * Attrs: active-tool, layout
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export interface LineTool {
    id        : string;
    label     : string;
    icon      : string;
    shortcut? : string;
    behaviour : 'tool' | 'action' | 'to-3d';
    group     : 'draw' | 'close' | 'to-3d';
}

const BUILTIN: LineTool[] = [
    { id: 'line',     label: 'Line',     icon: '╱',  shortcut: 'L', behaviour: 'tool',   group: 'draw' },
    { id: 'arc',      label: 'Arc',      icon: '◜',  shortcut: 'A', behaviour: 'tool',   group: 'draw' },
    { id: 'polyline', label: 'Polyline', icon: '⌇',  shortcut: 'P', behaviour: 'tool',   group: 'draw' },
    { id: 'spline',   label: 'Spline',   icon: '∿',  shortcut: 'S', behaviour: 'tool',   group: 'draw' },
    { id: 'freehand', label: 'Freehand', icon: '✎',  shortcut: 'F', behaviour: 'tool',   group: 'draw' },
    { id: 'rect',     label: 'Rect',     icon: '▭',  shortcut: 'R', behaviour: 'tool',   group: 'draw' },
    { id: 'ellipse',  label: 'Ellipse',  icon: '◯',  shortcut: 'O', behaviour: 'tool',   group: 'draw' },
    { id: 'polygon',  label: 'Polygon',  icon: '⬡',  shortcut: 'G', behaviour: 'tool',   group: 'draw' },
    { id: 'close',    label: 'Close',    icon: '⊙',  shortcut: 'C', behaviour: 'action', group: 'close' },
    { id: 'open',     label: 'Open',     icon: '◌',                 behaviour: 'action', group: 'close' },
    { id: 'reverse',  label: 'Reverse',  icon: '⇌',                 behaviour: 'action', group: 'close' },
    { id: 'extrude',  label: 'Extrude',  icon: '⬚',                 behaviour: 'to-3d',  group: 'to-3d' },
    { id: 'revolve',  label: 'Revolve',  icon: '⟳',                 behaviour: 'to-3d',  group: 'to-3d' },
    { id: 'sweep',    label: 'Sweep',    icon: '↪',                 behaviour: 'to-3d',  group: 'to-3d' },
    { id: 'loft',     label: 'Loft',     icon: '☷',                 behaviour: 'to-3d',  group: 'to-3d' },
];

export interface LinesPalette2DOptions {
    activeTool?     : string;
    layout?         : 'vertical' | 'horizontal';
    showShortcuts?  : boolean;
    disableHotkeys? : boolean;
}

export class LinesPalette2D extends Component('arianna-lines-palette-2d', HTMLElement, {}, {
    attrs : ['active-tool', 'layout', 'show-shortcuts', 'disable-hotkeys'],
    shadow: false,
})
{
    tools$ : Signal<LineTool[]> = signal<LineTool[]>(BUILTIN.slice());

    build(_opts: LinesPalette2DOptions = {})
    {
        const layoutAttr = this.attrSignal('layout');
        const activeAttr = this.attrSignal('active-tool');

        this.layoutCls = () => 'ar-lp2d ar-lp2d--' + (layoutAttr.get() ?? 'vertical');
        this.showShortcuts = () => this.getAttribute('show-shortcuts') !== 'false';

        const renderGroup = (group: LineTool['group']) =>
            this.tools$.get().filter(t => t.group === group).map(t => ({
                id    : t.id,
                label : t.label,
                icon  : t.icon,
                title : this.showShortcuts() && t.shortcut ? `${t.label} (${t.shortcut})` : t.label,
                cls   : 'ar-lp2d__btn'
                    + (activeAttr.get() === t.id && t.behaviour === 'tool' ? ' ar-lp2d__btn--active' : ''),
                behaviour: t.behaviour,
            }));

        this.drawTools  = () => renderGroup('draw');
        this.closeTools = () => renderGroup('close');
        this.to3dTools  = () => renderGroup('to-3d');

        this.onBtnClick = (e: Event) => {
            const btn = e.currentTarget as HTMLButtonElement;
            const id = btn.dataset.id;
            const behaviour = btn.dataset.behaviour;
            if (!id || !behaviour) return;
            if (behaviour === 'tool') {
                this.setTool(id);
            } else if (behaviour === 'action') {
                this.dispatchEvent(new CustomEvent('arianna:action', {
                    bubbles: true, detail: { action: id },
                }));
            } else if (behaviour === 'to-3d') {
                this.dispatchEvent(new CustomEvent('arianna:to-3d', {
                    bubbles: true, detail: { kind: id },
                }));
            }
        };

        this.template = html`
            <div :class="this.layoutCls()">
                <div class="ar-lp2d__group">
                    <div class="ar-lp2d__group-label">Draw</div>
                    <div class="ar-lp2d__group-btns">
                        <button type="button" a-for="t in this.drawTools()"
                                :class="t.cls" :title="t.title"
                                :data-id="t.id" :data-behaviour="t.behaviour"
                                @click="this.onBtnClick">{{ t.icon }}</button>
                    </div>
                </div>
                <div class="ar-lp2d__group">
                    <div class="ar-lp2d__group-label">Close</div>
                    <div class="ar-lp2d__group-btns">
                        <button type="button" a-for="t in this.closeTools()"
                                :class="t.cls" :title="t.title"
                                :data-id="t.id" :data-behaviour="t.behaviour"
                                @click="this.onBtnClick">{{ t.icon }}</button>
                    </div>
                </div>
                <div class="ar-lp2d__group">
                    <div class="ar-lp2d__group-label">To 3D</div>
                    <div class="ar-lp2d__group-btns">
                        <button type="button" a-for="t in this.to3dTools()"
                                :class="t.cls" :title="t.title"
                                :data-id="t.id" :data-behaviour="t.behaviour"
                                @click="this.onBtnClick">{{ t.icon }}</button>
                    </div>
                </div>
            </div>
        `;

        this.Sheet = LinesPalette2D.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setTool(id: string): this {
        const t = this.tools$.get().find(x => x.id === id);
        if (!t || t.behaviour !== 'tool') return this;
        this.setAttribute('active-tool', id);
        this.dispatchEvent(new CustomEvent('arianna:tool', {
            bubbles: true, detail: { tool: id },
        }));
        return this;
    }
    getTool(): string | null { return this.getAttribute('active-tool'); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         { this.#bindKeys(); }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       { this.#unbindKeys(); }

    #onKey = (e: KeyboardEvent) => {
        if (this.getAttribute('disable-hotkeys') === 'true') return;
        const target = e.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        const key = e.key.toUpperCase();
        const t = this.tools$.get().find(x => x.shortcut === key);
        if (t) {
            e.preventDefault();
            if (t.behaviour === 'tool') this.setTool(t.id);
            else {
                this.dispatchEvent(new CustomEvent(
                    t.behaviour === 'action' ? 'arianna:action' : 'arianna:to-3d',
                    { bubbles: true, detail: t.behaviour === 'action' ? { action: t.id } : { kind: t.id } },
                ));
            }
        }
    };

    #bindKeys(): void { window.addEventListener('keydown', this.#onKey); }
    #unbindKeys(): void { window.removeEventListener('keydown', this.#onKey); }

    private layoutCls     : () => string = () => 'ar-lp2d ar-lp2d--vertical';
    private showShortcuts : () => boolean = () => true;
    private drawTools     : () => Array<{ id: string; label: string; icon: string; title: string; cls: string; behaviour: string }> = () => [];
    private closeTools    : () => Array<{ id: string; label: string; icon: string; title: string; cls: string; behaviour: string }> = () => [];
    private to3dTools     : () => Array<{ id: string; label: string; icon: string; title: string; cls: string; behaviour: string }> = () => [];
    private onBtnClick    : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block', fontFamily: '-apple-system, system-ui, sans-serif' }),
                new Rule('.ar-lp2d', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display     : 'flex',
                    padding     : '8px',
                    gap         : '12px',
                }),
                new Rule('.ar-lp2d--vertical', { flexDirection: 'column' }),
                new Rule('.ar-lp2d--horizontal', { flexDirection: 'row' }),
                new Rule('.ar-lp2d__group', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-lp2d__group-label', {
                    fontSize: '10px', fontWeight: '600',
                    color: 'var(--arianna-muted, #6e6b62)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                }),
                new Rule('.ar-lp2d__group-btns', { display: 'grid', gridTemplateColumns: 'repeat(2, 28px)', gap: '3px' }),
                new Rule('.ar-lp2d__btn', {
                    width: '28px', height: '28px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'background 0.08s, border-color 0.08s',
                }),
                new Rule('.ar-lp2d__btn:hover', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderColor: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-lp2d__btn--active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'LinesPalette2D', {
        value: LinesPalette2D, writable: false, enumerable: false, configurable: false,
    });
}

export default LinesPalette2D;
