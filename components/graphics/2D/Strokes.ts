/** @module components/graphics/2D/Strokes */
import { Component, Css, Templates } from '../../../core/index.ts';
const html = Templates.Template.Html;
export namespace Strokes {
    export namespace Interfaces {
        export interface LineTool {
            id: string;
            label: string;
            icon?: string;
        }
        export interface StrokesOptions {
            width?: number;
            cap?: 'butt' | 'round' | 'square';
            join?: 'miter' | 'round' | 'bevel';
            dashed?: boolean;
            theme?: 'dark' | 'light';
        }
    }
    interface State {
        width: number;
        cap: 'butt' | 'round' | 'square';
        join: 'miter' | 'round' | 'bevel';
        align: 'center' | 'inside' | 'outside';
        dash: number[];
    }
    const States = new WeakMap<HTMLElement, State>();
    const S = (e: HTMLElement): State => { let s = States.get(e); if (!s) {
        s = { width: 1, cap: 'butt', join: 'miter', align: 'center', dash: [6, 4] };
        States.set(e, s);
    } return s; };
    export const Styles = new Css.Stylesheet([new Css.Rule('arianna-strokes,.Strokes', { Background: '#292d31', Border: '1px solid #111417', BorderRadius: '5px', BoxSizing: 'border-box', Color: '#e5e8ea', Display: 'block', FontFamily: 'var(--arianna-font,system-ui,sans-serif)', Overflow: 'hidden', Width: '310px' }), new Css.Rule('.Strokes-Header', { AlignItems: 'center', Background: 'linear-gradient(180deg,#3a3f44,#2b3034)', BorderBottom: '1px solid #111417', Display: 'flex', FontSize: '11px', FontWeight: '800', JustifyContent: 'space-between', Padding: '8px 10px' }), new Css.Rule('.Strokes-Body', { Display: 'grid', Gap: '8px', Padding: '10px' }), new Css.Rule('.Strokes-Row', { AlignItems: 'center', Display: 'grid', Gap: '7px', GridTemplateColumns: '86px 1fr' }), new Css.Rule('.Strokes-Label', { Color: '#a1a9b0', FontSize: '9px' }), new Css.Rule('.Strokes-Input', { Background: '#181c20', Border: '1px solid #3b4147', BorderRadius: '3px', Color: '#e5e8ea', Font: '9px system-ui', Padding: '6px', Width: '100%' }), new Css.Rule('.Strokes-Buttons', { Display: 'grid', Gap: '3px', GridTemplateColumns: 'repeat(3,1fr)' }), new Css.Rule('.Strokes-Button', { Appearance: 'none', Background: 'linear-gradient(180deg,#40464b,#2d3236)', Border: '1px solid #15181a', BorderRadius: '3px', Color: '#cbd1d5', Cursor: 'pointer', Font: '700 13px/1 system-ui', Height: '29px' }), new Css.Rule('.Strokes-Button[data-active="true"]', { BorderColor: '#e40c88', Color: '#ff6dbb' }), new Css.Rule('.Strokes-Preview', { Background: '#181c20', Border: '1px solid #111417', BorderRadius: '3px', Height: '42px', Padding: '20px 12px 0' }), new Css.Rule('.Strokes-Line', { BorderTop: 'var(--stroke-width) var(--stroke-style) #e40c88' }), new Css.Rule('arianna-strokes[theme="light"],.Strokes[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }), new Css.Rule('arianna-strokes[theme="light"] .Strokes-Header', { Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderBottomColor: '#b9bec3' }), new Css.Rule('arianna-strokes[theme="light"] .Strokes-Input', { Background: '#fff', BorderColor: '#c1c6cb', Color: '#30363b' }), new Css.Rule('arianna-strokes[theme="light"] .Strokes-Button', { Background: 'linear-gradient(180deg,#fff,#e2e5e8)', BorderColor: '#bec4c9', Color: '#4a5259' }), new Css.Rule('arianna-strokes[theme="light"] .Strokes-Preview', { Background: '#fff', BorderColor: '#c4c9ce' })]);
    @Component('arianna-strokes', Styles, { Shadow: false, Attributes: ['theme', 'width', 'cap', 'join', 'dashed', 'active-tool'] })
    export class Strokes extends HTMLElement {
        public static readonly Styles = Styles;
        public template = html ``;
        public onCreated(): void { if (this.isConnected)
            this.onConnected(); }
        public onConnected(): void { this.classList.add('Strokes'); if (!this.hasAttribute('theme'))
            this.setAttribute('theme', 'dark'); const s = S(this); if (this.hasAttribute('width'))
            s.width = Math.max(.25, Number(this.getAttribute('width')) || 1); if (this.getAttribute('cap'))
            s.cap = this.getAttribute('cap') as State['cap']; if (this.getAttribute('join'))
            s.join = this.getAttribute('join') as State['join']; this.Render(); }
        public onAttributeChanged(name: string): void { if (!this.isConnected)
            return; const s = S(this); if (name === 'width')
            s.width = Math.max(.25, Number(this.getAttribute('width')) || 1); if (name === 'cap')
            s.cap = (this.getAttribute('cap') as State['cap']) || 'butt'; if (name === 'join')
            s.join = (this.getAttribute('join') as State['join']) || 'miter'; this.Render(); }
        public setTool(id: string): this { this.setAttribute('active-tool', id); this.dispatchEvent(new CustomEvent('arianna:tool', { bubbles: true, composed: true, detail: { id, source: this } })); return this; }
        public getTool(): string | null { return this.getAttribute('active-tool'); }
        private Emit(): void { const s = S(this); this.dispatchEvent(new CustomEvent('arianna:change', { bubbles: true, composed: true, detail: { width: s.width, cap: s.cap, join: s.join, align: s.align, dashed: this.hasAttribute('dashed'), dash: [...s.dash], source: this } })); }
        private Render(): void { const s = S(this); this.style.setProperty('--stroke-width', `${s.width}px`); this.style.setProperty('--stroke-style', this.hasAttribute('dashed') ? 'dashed' : 'solid'); const root = document.createElement('section'), head = document.createElement('header'); head.className = 'Strokes-Header'; head.innerHTML = '<span>Stroke</span><span>≡</span>'; const body = document.createElement('div'); body.className = 'Strokes-Body'; const row = (label: string) => { const r = document.createElement('div'); r.className = 'Strokes-Row'; const l = document.createElement('span'); l.className = 'Strokes-Label'; l.textContent = label; r.appendChild(l); return r; }; const wr = row('Weight'); const wi = document.createElement('input'); wi.type = 'number'; wi.min = '.25'; wi.step = '.25'; wi.value = String(s.width); wi.className = 'Strokes-Input'; wi.onchange = () => { s.width = Math.max(.25, Number(wi.value) || 1); this.setAttribute('width', String(s.width)); this.Emit(); }; wr.appendChild(wi); const buttons = (vals: [
            string,
            string
        ][], current: string, set: (v: string) => void) => { const g = document.createElement('div'); g.className = 'Strokes-Buttons'; vals.forEach(([v, i]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'Strokes-Button'; b.textContent = i; b.dataset.active = String(v === current); b.onclick = () => set(v); g.appendChild(b); }); return g; }; const cr = row('Cap'); cr.append(buttons([['butt', '▮'], ['round', '●'], ['square', '■']], s.cap, v => { s.cap = v as State['cap']; this.setAttribute('cap', v); this.Emit(); })); const jr = row('Corner'); jr.append(buttons([['miter', '⌜'], ['round', '◜'], ['bevel', '◩']], s.join, v => { s.join = v as State['join']; this.setAttribute('join', v); this.Emit(); })); const ar = row('Align Stroke'); ar.append(buttons([['center', '◧'], ['inside', '▣'], ['outside', '◨']], s.align, v => { s.align = v as State['align']; this.Render(); this.Emit(); })); const dr = row('Dashed Line'); dr.append(buttons([['off', '——'], ['on', '— —'], ['dot', '···']], this.hasAttribute('dashed') ? 'on' : 'off', v => { this.toggleAttribute('dashed', v !== 'off'); if (v === 'dot')
            s.dash = [1, 3];
        else
            s.dash = [6, 4]; this.Render(); this.Emit(); })); const prev = document.createElement('div'); prev.className = 'Strokes-Preview'; const line = document.createElement('div'); line.className = 'Strokes-Line'; prev.appendChild(line); body.append(wr, cr, jr, ar, dr, prev); root.append(head, body); this.replaceChildren(root); }
    }
}
export type LineTool = Strokes.Interfaces.LineTool;
export type StrokesOptions = Strokes.Interfaces.StrokesOptions;
export default Strokes.Strokes;
