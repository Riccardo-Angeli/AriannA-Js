/** @module components/graphics/2D/Tools2D */
import { Component, Css, Templates } from '../../../core/index.ts';
const html = Templates.Template.Html;
export namespace Tools2D {
    export namespace Interfaces {
        export interface PaletteTool {
            id: string;
            label: string;
            icon?: string;
            shortcut?: string;
        }
        export interface Tools2DOptions {
            tools?: PaletteTool[];
            selected?: string;
            columns?: 1 | 2;
            theme?: 'dark' | 'light';
        }
    }
    const DEFAULT: Interfaces.PaletteTool[] = [{ id: 'select', label: 'Selection', icon: '↖', shortcut: 'V' }, { id: 'direct', label: 'Direct Selection', icon: '⌁', shortcut: 'A' }, { id: 'wand', label: 'Magic Wand', icon: '✦' }, { id: 'lasso', label: 'Lasso', icon: '◌' }, { id: 'pen', label: 'Pen', icon: '✒', shortcut: 'P' }, { id: 'curve', label: 'Curvature', icon: '⌒' }, { id: 'type', label: 'Text', icon: 'T', shortcut: 'T' }, { id: 'line', label: 'Line', icon: '╱' }, { id: 'rect', label: 'Rectangle', icon: '□', shortcut: 'M' }, { id: 'brush', label: 'Paintbrush', icon: '╲', shortcut: 'B' }, { id: 'pencil', label: 'Pencil', icon: '✎' }, { id: 'eraser', label: 'Eraser', icon: '▱' }, { id: 'rotate', label: 'Rotate', icon: '↻', shortcut: 'R' }, { id: 'scale', label: 'Scale', icon: '↗', shortcut: 'S' }, { id: 'width', label: 'Width', icon: '↔' }, { id: 'freeform', label: 'Free Transform', icon: '⌗' }, { id: 'shape-builder', label: 'Shape Builder', icon: '⬡' }, { id: 'perspective', label: 'Perspective Grid', icon: '⌑' }, { id: 'mesh', label: 'Mesh', icon: '▦' }, { id: 'gradient', label: 'Gradient', icon: '◩', shortcut: 'G' }, { id: 'eyedropper', label: 'Eyedropper', icon: '⌁', shortcut: 'I' }, { id: 'blend', label: 'Blend', icon: '◐' }, { id: 'spray', label: 'Symbol Spray', icon: '⁙' }, { id: 'slice', label: 'Slice', icon: '⌗' }, { id: 'artboard', label: 'Artboard', icon: '▣' }, { id: 'hand', label: 'Hand', icon: '✋', shortcut: 'H' }, { id: 'zoom', label: 'Zoom', icon: '⌕', shortcut: 'Z' }];
    interface State {
        tools: Interfaces.PaletteTool[];
        selected: string;
    }
    const States = new WeakMap<HTMLElement, State>();
    const S = (e: HTMLElement): State => { let s = States.get(e); if (!s) {
        s = { tools: structuredClone(DEFAULT), selected: e.getAttribute('selected') || 'select' };
        States.set(e, s);
    } return s; };
    export const Styles = new Css.Stylesheet([new Css.Rule('arianna-tools-2d,.Tools2D', { Background: '#292d31', Border: '1px solid #111417', BorderRadius: '5px', BoxSizing: 'border-box', Color: '#e5e8ea', Display: 'block', FontFamily: 'var(--arianna-font,system-ui,sans-serif)', Overflow: 'hidden', Width: '82px' }), new Css.Rule('.Tools2D-Grip', { Background: 'linear-gradient(180deg,#3a3f44,#2b3034)', BorderBottom: '1px solid #111417', Color: '#8f979f', FontSize: '9px', Padding: '5px', TextAlign: 'center' }), new Css.Rule('.Tools2D-Grid', { Display: 'grid', Gap: '1px', GridTemplateColumns: 'repeat(var(--cols),1fr)', Padding: '4px' }), new Css.Rule('.Tools2D-Tool', { AlignItems: 'center', Appearance: 'none', Background: 'transparent', Border: '1px solid transparent', BorderRadius: '2px', Color: '#c9cfd4', Cursor: 'pointer', Display: 'flex', Font: '600 14px/1 system-ui', Height: '30px', JustifyContent: 'center', Padding: '0' }), new Css.Rule('.Tools2D-Tool:hover', { Background: '#393f44', BorderColor: '#4b5258' }), new Css.Rule('.Tools2D-Tool[data-selected="true"]', { Background: 'linear-gradient(180deg,#ed168f,#bd0b73)', BorderColor: '#9c075f', Color: '#fff' }), new Css.Rule('.Tools2D-Colors', { Height: '48px', Padding: '6px 12px 8px', Position: 'relative' }), new Css.Rule('.Tools2D-Fill,.Tools2D-Stroke', { Border: '2px solid #d7dce0', Height: '25px', Position: 'absolute', Width: '25px' }), new Css.Rule('.Tools2D-Fill', { Background: '#e40c88', Left: '15px', Top: '6px', ZIndex: '2' }), new Css.Rule('.Tools2D-Stroke', { Background: '#fff', Left: '31px', Top: '19px', ZIndex: '1' }), new Css.Rule('.Tools2D-Footer', { BorderTop: '1px solid #15181a', Color: '#858e96', FontSize: '9px', Padding: '6px', TextAlign: 'center' }), new Css.Rule('arianna-tools-2d[theme="light"],.Tools2D[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }), new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Grip', { Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderBottomColor: '#b9bec3' }), new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Tool', { Color: '#4c5359' }), new Css.Rule('arianna-tools-2d[theme="light"] .Tools2D-Tool:hover', { Background: '#dfe3e6', BorderColor: '#c3c8cc' })]);
    @Component('arianna-tools-2d', Styles, { Shadow: false, Attributes: ['theme', 'selected', 'columns'], Properties: ['tools'] })
    export class Tools2D extends HTMLElement {
        public static readonly Styles = Styles;
        public template = html ``;
        public onCreated(): void { if (this.isConnected)
            this.onConnected(); }
        public onConnected(): void { this.classList.add('Tools2D'); if (!this.hasAttribute('theme'))
            this.setAttribute('theme', 'dark'); if (!this.hasAttribute('columns'))
            this.setAttribute('columns', '2'); S(this).selected = this.getAttribute('selected') || S(this).selected; this.Render(); }
        public onAttributeChanged(name: string): void { if (this.isConnected && (name === 'selected' || name === 'columns')) {
            if (name === 'selected')
                S(this).selected = this.getAttribute('selected') || 'select';
            this.Render();
        } }
        public get tools(): Interfaces.PaletteTool[] { return structuredClone(S(this).tools); }
        public set tools(v: Interfaces.PaletteTool[]) { S(this).tools = Array.isArray(v) ? structuredClone(v) : structuredClone(DEFAULT); this.Render(); }
        public setTool(id: string): this { const s = S(this); if (s.tools.some(t => t.id === id)) {
            s.selected = id;
            this.setAttribute('selected', id);
            this.Render();
            const tool = s.tools.find(t => t.id === id);
            this.dispatchEvent(new CustomEvent('arianna:tool', { bubbles: true, composed: true, detail: { tool, source: this } }));
        } return this; }
        public getTool(): string | null { return S(this).selected || null; }
        public setTools(v: Interfaces.PaletteTool[]): this { this.tools = v; return this; }
        private Render(): void { const s = S(this); this.style.setProperty('--cols', this.getAttribute('columns') === '1' ? '1' : '2'); const root = document.createElement('section'), grip = document.createElement('div'); grip.className = 'Tools2D-Grip'; grip.textContent = '•••'; const grid = document.createElement('div'); grid.className = 'Tools2D-Grid'; s.tools.forEach(t => { const b = document.createElement('button'); b.type = 'button'; b.className = 'Tools2D-Tool'; b.dataset.selected = String(t.id === s.selected); b.textContent = t.icon || t.label[0]; b.title = t.label + (t.shortcut ? ` (${t.shortcut})` : ''); b.onclick = () => this.setTool(t.id); grid.appendChild(b); }); const colors = document.createElement('div'); colors.className = 'Tools2D-Colors'; colors.innerHTML = '<span class="Tools2D-Fill"></span><span class="Tools2D-Stroke"></span>'; const foot = document.createElement('div'); foot.className = 'Tools2D-Footer'; foot.textContent = '◫  ⛶'; root.append(grip, grid, colors, foot); this.replaceChildren(root); }
    }
}
export type PaletteTool = Tools2D.Interfaces.PaletteTool;
export type Tools2DOptions = Tools2D.Interfaces.Tools2DOptions;
export default Tools2D.Tools2D;
