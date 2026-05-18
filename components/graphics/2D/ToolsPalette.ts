/**
 * @module    components/graphics/2D/ToolsPalette
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ToolsPalette — general-purpose 2D editor tools palette (select, pan, zoom,
 * rotate, scale, eyedropper, hand, etc.). Sibling of LinesPalette2D but
 * orthogonal: this one is the meta-toolset that any 2D editor uses on top
 * of its drawing primitives.
 *
 * @example HTML
 *   <arianna-tools-palette active-tool="select"></arianna-tools-palette>
 *
 * Events:
 *   arianna:tool   detail: { tool: string }
 *   arianna:action detail: { action: string }
 *
 * Attrs: active-tool, layout, show-shortcuts
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export interface PaletteTool {
    id        : string;
    label     : string;
    icon      : string;
    shortcut? : string;
    behaviour : 'tool' | 'action';
}

const BUILTIN: PaletteTool[] = [
    { id: 'select',     label: 'Select',     icon: '↖', shortcut: 'V', behaviour: 'tool' },
    { id: 'pan',        label: 'Pan',        icon: '✋', shortcut: 'H', behaviour: 'tool' },
    { id: 'zoom',       label: 'Zoom',       icon: '🔍', shortcut: 'Z', behaviour: 'tool' },
    { id: 'rotate',     label: 'Rotate',     icon: '↻', shortcut: 'E', behaviour: 'tool' },
    { id: 'scale',      label: 'Scale',      icon: '⤢', shortcut: 'S', behaviour: 'tool' },
    { id: 'eyedropper', label: 'Eyedropper', icon: '💧', shortcut: 'I', behaviour: 'tool' },
    { id: 'measure',    label: 'Measure',    icon: '📏', shortcut: 'M', behaviour: 'tool' },
    { id: 'undo',       label: 'Undo',       icon: '↶', shortcut: 'Z', behaviour: 'action' },
    { id: 'redo',       label: 'Redo',       icon: '↷', shortcut: 'Y', behaviour: 'action' },
    { id: 'delete',     label: 'Delete',     icon: '🗑', shortcut: 'Delete', behaviour: 'action' },
];

export interface ToolsPaletteOptions {
    activeTool?    : string;
    layout?        : 'vertical' | 'horizontal';
    showShortcuts? : boolean;
}

export class ToolsPalette extends Component('arianna-tools-palette', HTMLElement, {}, {
    attrs : ['active-tool', 'layout', 'show-shortcuts'],
    shadow: false,
})
{
    tools$: Signal<PaletteTool[]> = signal<PaletteTool[]>(BUILTIN.slice());

    build(_opts: ToolsPaletteOptions = {})
    {
        const layoutAttr = this.attrSignal('layout');
        const activeAttr = this.attrSignal('active-tool');

        this.layoutCls = () => 'ar-tp ar-tp--' + (layoutAttr.get() ?? 'vertical');
        this.showShortcuts = () => this.getAttribute('show-shortcuts') !== 'false';

        this.buttons = () => this.tools$.get().map(t => ({
            id: t.id,
            icon: t.icon,
            title: this.showShortcuts() && t.shortcut ? `${t.label} (${t.shortcut})` : t.label,
            behaviour: t.behaviour,
            cls: 'ar-tp__btn'
                + (activeAttr.get() === t.id && t.behaviour === 'tool' ? ' ar-tp__btn--active' : ''),
        }));

        this.onBtnClick = (e: Event) => {
            const btn = e.currentTarget as HTMLButtonElement;
            const id = btn.dataset.id;
            const behaviour = btn.dataset.behaviour;
            if (!id || !behaviour) return;
            if (behaviour === 'tool') this.setTool(id);
            else this.dispatchEvent(new CustomEvent('arianna:action', {
                bubbles: true, detail: { action: id },
            }));
        };

        this.template = html`
            <div :class="this.layoutCls()">
                <button type="button" a-for="b in this.buttons()"
                        :class="b.cls" :title="b.title"
                        :data-id="b.id" :data-behaviour="b.behaviour"
                        @click="this.onBtnClick">{{ b.icon }}</button>
            </div>
        `;

        this.Sheet = ToolsPalette.DefaultSheet();
    }

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

    setTools(tools: PaletteTool[]): this { this.tools$.set(tools); return this; }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private layoutCls    : () => string = () => '';
    private showShortcuts: () => boolean = () => true;
    private buttons      : () => Array<{ id: string; icon: string; title: string; behaviour: string; cls: string }> = () => [];
    private onBtnClick   : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block' }),
                new Rule('.ar-tp', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display     : 'flex',
                    padding     : '4px',
                    gap         : '3px',
                }),
                new Rule('.ar-tp--vertical',   { flexDirection: 'column' }),
                new Rule('.ar-tp--horizontal', { flexDirection: 'row' }),
                new Rule('.ar-tp__btn', {
                    width: '32px', height: '32px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    fontSize: '15px',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'background 0.08s',
                }),
                new Rule('.ar-tp__btn:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-tp__btn--active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ToolsPalette', {
        value: ToolsPalette, writable: false, enumerable: false, configurable: false,
    });
}

export default ToolsPalette;
