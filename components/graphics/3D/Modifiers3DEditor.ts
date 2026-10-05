/**
 * @module components/graphics/3D/Modifiers3DEditor
 * @author Riccardo Angeli
 * @version 2.2.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Concrete vertical modifier stack. Every entry owns a real
 * modifier custom element bound to the same Canvas3D target.
 */
import { Component, Css, Templates } from '../../../core/index.ts';
import type { Modifier3D } from './modifiers/Base.ts';
const html = Templates.Template.Html;
export namespace Modifiers3DEditor {
    export namespace Types {
        export type ModifierKind = 'bend' | 'twist' | 'taper' | 'squeeze' | 'push' | 'noise' | 'mirror' | 'relax' | 'subdivision' | 'mesh-smooth' | 'extrude' | 'bevel' | 'bevel-profile' | 'sweep' | 'surface' | 'array' | 'wave' | 'lathe' | 'cross-section' | 'mover' | 'resizer' | 'rotator' | 'rounder' | 'skewer';
    }
    export namespace Interfaces {
        export interface ModifierEntry {
            id: string;
            kind: Types.ModifierKind;
            enabled: boolean;
            params: Record<string, number | string | boolean>;
        }
        export interface Modifiers3DEditorOptions {
            stack?: ModifierEntry[];
            theme?: 'dark' | 'light';
            viewport?: string;
            for?: string;
        }
    }
    export const ModifierTags:Readonly<Record<Types.ModifierKind,string>>=Object.freeze({"bend": "arianna-bend", "twist": "arianna-twist", "taper": "arianna-taper", "squeeze": "arianna-squeeze", "push": "arianna-push", "noise": "arianna-noise", "mirror": "arianna-mirror", "relax": "arianna-relax", "subdivision": "arianna-subdivision", "mesh-smooth": "arianna-mesh-smooth", "extrude": "arianna-extrude", "bevel": "arianna-bevel", "bevel-profile": "arianna-bevel-profile", "sweep": "arianna-sweep", "surface": "arianna-surface", "array": "arianna-array", "wave": "arianna-wave", "lathe": "arianna-lathe", "cross-section": "arianna-cross-section", "mover": "arianna-mover-3d", "resizer": "arianna-resizer-3d", "rotator": "arianna-rotator-3d", "rounder": "arianna-rounder-3d", "skewer": "arianna-skewer-3d"});
    const DEFAULT_PARAMS:Readonly<Record<Types.ModifierKind,Record<string,number|string|boolean>>>=Object.freeze({"bend": {"axis": "y", "angle": 1.35, "direction": 0, "limits": false, "lower": -1, "upper": 1}, "twist": {"axis": "y", "angle": 2.4, "bias": 0, "limits": false, "lower": -1, "upper": 1}, "taper": {"axis": "y", "amount": 0.5, "curve": 0, "symmetric": false, "limits": false, "lower": -1, "upper": 1}, "squeeze": {"axis": "y", "amount": 0.2, "radial": -0.3, "curve": 0, "limits": false, "lower": -1, "upper": 1}, "push": {"amount": 0.15}, "noise": {"seed": 1, "scale": 1, "strength-x": 0.2, "strength-y": 0.2, "strength-z": 0.2, "octaves": 3, "roughness": 0.5, "phase": 0}, "mirror": {"axis": "y", "offset": 0, "copy": true}, "relax": {"iterations": 2, "factor": 0.3, "boundaries": true}, "subdivision": {"iterations": 1}, "mesh-smooth": {"iterations": 1, "boundaries": true}, "extrude": {"amount": 1, "segments": 1, "cap": true}, "bevel": {"amount": 1, "cap": true}, "bevel-profile": {"cap": true}, "sweep": {"cap": true, "closed-path": false, "twist": 0}, "surface": {"samples": 24, "steps": 2, "closed": true, "flip": false}, "array": {"count": 5, "type": "linear", "offset-x": 1.25, "offset-y": 0, "offset-z": 0, "radius": 2.4, "axis": "y"}, "wave": {"amplitude": 0.25, "frequency": 4, "axis": "y", "direction": "x", "animate": true}, "lathe": {"axis": "y", "segments": 32, "angle-deg": 360, "cap": true}, "cross-section": {"samples": 24, "closed": true}, "mover": {"x": 0, "y": 0, "z": 0, "axis": "xyz", "snap-enabled": true}, "resizer": {"x": 1, "y": 1, "z": 1, "uniform": 1, "axis": "xyz"}, "rotator": {"x": 0, "y": 0, "z": 0, "angle": 0, "axis": "y"}, "rounder": {"radius": 0.12, "segments": 2}, "skewer": {"x": 0, "y": 0, "z": 0, "max-angle": 1.4}});
    interface State {
        stack: Interfaces.ModifierEntry[];
        activeId: string | null;
        sequence: number;
        recomposing: boolean;
        selection: Modifier3D.Interfaces.SelectionLike | null;
    }
    const States = new WeakMap<HTMLElement, State>();
    const S = (host: HTMLElement): State => { let state = States.get(host); if (!state) {
        state = { stack: [], activeId: null, sequence: 0, recomposing: false, selection: null };
        States.set(host, state);
    } return state; };
    const Clone = (entry: Interfaces.ModifierEntry): Interfaces.ModifierEntry => ({ id: String(entry.id), kind: entry.kind, enabled: entry.enabled !== false, params: { ...(entry.params ?? {}) } });
    const Normalize=(entry:Interfaces.ModifierEntry):Interfaces.ModifierEntry=>{const value=Clone(entry);if(!(value.kind in ModifierTags))throw new Error('Unknown modifier: '+value.kind);value.params={...DEFAULT_PARAMS[value.kind],...value.params};return value;};
    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-modifiers-3d-editor,.Modifiers3DEditor', { Background: '#292d31', Border: '1px solid #111417', BorderRadius: '8px', BoxSizing: 'border-box', Color: '#e4e8eb', Display: 'grid', FontFamily: 'var(--arianna-font,system-ui,sans-serif)', GridTemplateRows: 'auto minmax(0,1fr) auto', MaxHeight: '480px', Overflow: 'hidden', Width: '320px' }),
        new Css.Rule('.Modifiers3DEditor-Header', { AlignItems: 'center', Background: 'linear-gradient(180deg,#3a3f44,#2b3034)', BorderBottom: '1px solid #111417', Display: 'flex', FontSize: '11px', FontWeight: '800', JustifyContent: 'space-between', Padding: '8px 10px' }),
        new Css.Rule('.Modifiers3DEditor-Count', { Color: '#929ba3', Font: '800 9px ui-monospace,monospace' }),
        new Css.Rule('.Modifiers3DEditor-Scroll', { Display: 'grid', Gap: '8px', MaxHeight: '410px', MinHeight: '0', OverflowX: 'hidden', OverflowY: 'auto', OverscrollBehavior: 'contain', Padding: '8px', ScrollbarColor: '#59616a #171a1d', ScrollbarWidth: 'thin' }),
        new Css.Rule('.Modifiers3DEditor-Empty', { Color: '#8d969e', FontSize: '10px', Padding: '22px 12px', TextAlign: 'center' }),
        new Css.Rule('.Modifiers3DEditor-Item', { Background: '#202428', Border: '1px solid #141719', BorderRadius: '7px', Display: 'grid', Gap: '0', MinWidth: '0', Overflow: 'hidden' }),
        new Css.Rule('.Modifiers3DEditor-Item[data-active="true"]', { BorderColor: '#e40c88', BoxShadow: '0 0 0 1px rgba(228,12,136,.2)' }),
        new Css.Rule('.Modifiers3DEditor-Item[data-enabled="false"]', { Opacity: '.5' }),
        new Css.Rule('.Modifiers3DEditor-Toolbar', { AlignItems: 'center', Background: '#181c1f', BorderBottom: '1px solid #101214', Display: 'grid', Gap: '5px', GridTemplateColumns: '18px minmax(0,1fr) auto', Padding: '5px 6px' }),
        new Css.Rule('.Modifiers3DEditor-Name', { Cursor: 'pointer', FontSize: '9px', FontWeight: '800', TextTransform: 'capitalize' }),
        new Css.Rule('.Modifiers3DEditor-Actions', { Display: 'flex', Gap: '3px' }),
        new Css.Rule('.Modifiers3DEditor-Button', { Appearance: 'none', Background: 'linear-gradient(180deg,#40464b,#2d3236)', Border: '1px solid #15181a', BorderRadius: '3px', Color: '#cbd1d5', Cursor: 'pointer', Font: '700 9px/1 system-ui', Height: '24px', MinWidth: '26px' }),
        new Css.Rule('.Modifiers3DEditor-Button:hover', { BorderColor: '#e40c88', Color: '#fff' }),
        new Css.Rule('.Modifiers3DEditor-Input', { Background: '#171b1e', Border: '1px solid #3b4146', BorderRadius: '3px', Color: '#e4e8eb', Font: '9px system-ui', MinWidth: '0', Padding: '5px' }),
        new Css.Rule('.Modifiers3DEditor-Panel', { Display: 'block', MaxHeight: 'none', Overflow: 'visible', Position: 'relative', Width: '100%' }),
        new Css.Rule('.Modifiers3DEditor-Footer', { BorderTop: '1px solid #111417', Display: 'grid', Gap: '5px', GridTemplateColumns: '1fr auto', Padding: '8px' }),
        new Css.Rule('arianna-modifiers-3d-editor[theme="light"],.Modifiers3DEditor[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }),
        new Css.Rule('arianna-modifiers-3d-editor[theme="light"] .Modifiers3DEditor-Header', { Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderBottomColor: '#b9bec3' }),
        new Css.Rule('arianna-modifiers-3d-editor[theme="light"] .Modifiers3DEditor-Item', { Background: '#fff', BorderColor: '#c4c9ce' }),
        new Css.Rule('arianna-modifiers-3d-editor[theme="light"] .Modifiers3DEditor-Toolbar', { Background: '#e2e5e8', BorderBottomColor: '#c4c9ce' }),
        new Css.Rule('arianna-modifiers-3d-editor[theme="light"] .Modifiers3DEditor-Input', { Background: '#fff', BorderColor: '#c1c6cb', Color: '#30363b' }),
    ]);
    @Component('arianna-modifiers-3d-editor', Styles, { Shadow: false, Attributes: ['theme', 'active-id', 'viewport', 'for'], Properties: ['stack'] })
    export class Modifiers3DEditor extends HTMLElement {
        public static readonly Styles = Styles;
        public template = html ``;
        public get selection(): Modifier3D.Interfaces.SelectionLike | null { return S(this).selection; }
        public set selection(value: Modifier3D.Interfaces.SelectionLike | null) { S(this).selection = value; for (const entry of S(this).stack) {
            const panel = this.getModifierElement(entry.id) as HTMLElement & {
                selection: Modifier3D.Interfaces.SelectionLike | null;
            };
            if (panel && 'selection' in panel)
                panel.selection = value;
        } }
        public onCreated(): void { if (this.isConnected)
            this.onConnected(); }
        public onConnected(): void { this.classList.add('Modifiers3DEditor'); if (!this.hasAttribute('theme'))
            this.setAttribute('theme', 'dark'); this.Render(); }
        public onAttributeChanged(name?: string): void {
            if (name === 'active-id') {
                S(this).activeId = this.getAttribute('active-id');
                this.SyncActive();
                return;
            }
            if (name === 'theme') {
                for (const panel of this.querySelectorAll<HTMLElement>('[data-modifier-entry]'))
                    panel.setAttribute('theme', this.getAttribute('theme') ?? 'dark');
                return;
            }
            if (this.isConnected && (name === 'viewport' || name === 'for'))
                this.Render();
        }
        public get stack(): Interfaces.ModifierEntry[] { return S(this).stack.map(Clone); }
        public set stack(value: Interfaces.ModifierEntry[]) { const state = S(this); state.stack = Array.isArray(value) ? value.map(Normalize) : []; if (state.activeId && !state.stack.some(entry => entry.id === state.activeId))
            state.activeId = null; this.Render(); }
        public addModifier(kind: Types.ModifierKind): Interfaces.ModifierEntry {
            if (!ModifierTags[kind])
                throw new Error(`[Modifiers3D] Unknown modifier kind: ${String(kind)}`);
            const state = S(this), id = `${kind}-${Date.now()}-${++state.sequence}`, entry: Interfaces.ModifierEntry = { id, kind, enabled: true, params: { ...DEFAULT_PARAMS[kind] } };
            state.stack.push(entry);
            state.activeId = id;
            this.Render();
            this.SetActiveAttribute(id);
            this.Fire('add', id);
            queueMicrotask(() => this.getModifierElement(id)?.scrollIntoView({ block: 'nearest' }));
            return Clone(entry);
        }
        public appendModifier(kind: Types.ModifierKind, params: Record<string, number | string | boolean> = {}): Interfaces.ModifierEntry { const entry = this.addModifier(kind), state = S(this), stored = state.stack.find(item => item.id === entry.id); if (stored)
            stored.params = { ...stored.params, ...params }; this.Render(); return this.getStack().find(item => item.id === entry.id)!; }
        public removeModifier(id: string): this { const state = S(this); state.stack = state.stack.filter(entry => entry.id !== id); if (state.activeId === id)
            state.activeId = state.stack.at(-1)?.id ?? null; this.Render(); this.SetActiveAttribute(state.activeId); this.Fire('remove', id); return this; }
        public toggleEnable(id: string): this { const entry = S(this).stack.find(item => item.id === id); if (!entry)
            return this; entry.enabled = !entry.enabled; const panel = this.getModifierElement(id) as HTMLElement & {
            enabled?: boolean;
        }; if (panel) {
            panel.enabled = entry.enabled;
            panel.toggleAttribute('disabled', !entry.enabled);
        } const item = panel?.closest<HTMLElement>('.Modifiers3DEditor-Item'); if (item) {
            item.dataset.enabled = String(entry.enabled);
        } queueMicrotask(() => this.ReapplyAfter(id)); this.Fire('enable', id); return this; }
        public moveModifier(id: string, direction: -1 | 1): this { const state = S(this), index = state.stack.findIndex(entry => entry.id === id), target = index + direction; if (index >= 0 && target >= 0 && target < state.stack.length) {
            [state.stack[index], state.stack[target]] = [state.stack[target], state.stack[index]];
            this.Render();
            this.Fire('move', id);
        } return this; }
        public updateParam(id: string, key: string, value: number | string | boolean): this { const entry = S(this).stack.find(item => item.id === id); if (!entry)
            return this; entry.params[key] = value; const panel = this.getModifierElement(id); if (panel)
            this.SetPanelValue(panel, key, value); this.Fire('param', id); return this; }
        public setStack(value: Interfaces.ModifierEntry[]): this { this.stack = value; this.Fire('stack', ''); return this; }
        public getStack(): Interfaces.ModifierEntry[] { return this.stack; }
        public selectModifier(id: string): this {
            if (!S(this).stack.some(entry => entry.id === id))
                return this;
            S(this).activeId = id;
            this.SetActiveAttribute(id);
            this.SyncActive();
            this.getModifierElement(id)?.scrollIntoView({ block: 'nearest' });
            this.Fire('select', id);
            return this;
        }
        public getActiveId(): string | null { return S(this).activeId; }
        public getModifierElement(id: string): HTMLElement | null { for (const panel of this.querySelectorAll<HTMLElement>('[data-modifier-entry]'))
            if (panel.dataset.modifierEntry === id)
                return panel; return null; }
        public static tagFor(kind: Types.ModifierKind): string { return ModifierTags[kind]; }
        private SetActiveAttribute(id: string | null): void { if (id === null) {
            if (this.hasAttribute('active-id'))
                this.removeAttribute('active-id');
        }
        else if (this.getAttribute('active-id') !== id)
            this.setAttribute('active-id', id); }
        private SyncActive(): void { const active = S(this).activeId; for (const item of this.querySelectorAll<HTMLElement>('.Modifiers3DEditor-Item'))
            item.dataset.active = String(item.dataset.entryId === active); }
        private SetPanelValue(panel: HTMLElement, key: string, value: number | string | boolean): void { if (typeof value === 'boolean')
            panel.toggleAttribute(key, value);
        else
            panel.setAttribute(key, String(value)); }
        private SyncFromPanel(entry: Interfaces.ModifierEntry, panel: HTMLElement, event: CustomEvent): void {
            const state = S(this);
            if (event.target !== panel || state.recomposing)
                return;
            const attrs = (event.detail?.attributes ?? {}) as Record<string, string>;
            for (const [key, sample] of Object.entries(entry.params))
                entry.params[key] = typeof sample === 'boolean' ? Object.prototype.hasOwnProperty.call(attrs, key) && attrs[key] !== 'false' : typeof sample === 'number' ? (Number.isFinite(Number(attrs[key])) ? Number(attrs[key]) : sample) : (attrs[key] ?? sample);
            entry.enabled = !panel.hasAttribute('disabled') && panel.getAttribute('enabled') !== 'false';
            const item = panel.closest<HTMLElement>('.Modifiers3DEditor-Item');
            if (item)
                item.dataset.enabled = String(entry.enabled);
            this.ReapplyAfter(entry.id);
            this.Fire('param', entry.id);
        }
        private ReapplyAfter(id: string): void {
            const state = S(this), index = state.stack.findIndex(entry => entry.id === id);
            if (index < 0 || state.recomposing)
                return;
            state.recomposing = true;
            try {
                for (const entry of state.stack.slice(index + 1)) {
                    const panel = this.getModifierElement(entry.id) as HTMLElement & {
                        rebase?: () => unknown;
                    };
                    panel?.rebase?.();
                }
            }
            finally {
                state.recomposing = false;
            }
        }
        private Fire(kind: string, id: string): void { this.dispatchEvent(new CustomEvent('arianna:modifiers-change', { bubbles: true, composed: true, detail: { kind, id, activeId: S(this).activeId, stack: this.getStack(), source: this } })); }
        private CreatePanel(entry: Interfaces.ModifierEntry): HTMLElement {
            const panel = document.createElement(ModifierTags[entry.kind]);
            panel.classList.add('Modifiers3DEditor-Panel');
            panel.dataset.modifierEntry = entry.id;
            panel.setAttribute('data-arianna-stack-item', '');
            const viewport = (this.getAttribute('viewport') ?? '').trim(), target = (this.getAttribute('for') ?? '').trim();
            if (viewport)
                panel.setAttribute('viewport', viewport);
            if (target)
                panel.setAttribute('for', target);
            panel.setAttribute('theme', this.getAttribute('theme') ?? 'dark');
            panel.toggleAttribute('disabled', !entry.enabled);
            for (const [key, value] of Object.entries(entry.params))
                this.SetPanelValue(panel, key, value);
            panel.style.position = 'relative';
            panel.style.inset = 'auto';
            panel.style.top = 'auto';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = 'auto';
            panel.style.width = '100%';
            panel.style.height = 'auto';
            panel.style.maxHeight = 'none';
            panel.style.overflow = 'visible';
            panel.addEventListener('arianna:modifier-3d-change', event => this.SyncFromPanel(entry, panel, event as CustomEvent));
            queueMicrotask(() => queueMicrotask(() => { if (panel.isConnected && 'selection' in panel)
                (panel as HTMLElement & {
                    selection: Modifier3D.Interfaces.SelectionLike | null;
                }).selection = S(this).selection; }));
            return panel;
        }
        private Render(): void {
            if (!this.isConnected)
                return;
            const state = S(this), root = document.createElement('section'), head = document.createElement('header');
            root.style.display = 'contents';
            head.className = 'Modifiers3DEditor-Header';
            const title = document.createElement('span');
            title.textContent = 'Modifiers3D';
            const count = document.createElement('span');
            count.className = 'Modifiers3DEditor-Count';
            count.textContent = String(state.stack.length);
            head.append(title, count);
            const scroll = document.createElement('div');
            scroll.className = 'Modifiers3DEditor-Scroll';
            if (!state.stack.length) {
                const empty = document.createElement('div');
                empty.className = 'Modifiers3DEditor-Empty';
                empty.textContent = 'No modifiers';
                scroll.appendChild(empty);
            }
            state.stack.forEach(entry => {
                const item = document.createElement('section');
                item.className = 'Modifiers3DEditor-Item';
                item.dataset.entryId = entry.id;
                item.dataset.active = String(state.activeId === entry.id);
                item.dataset.enabled = String(entry.enabled);
                item.addEventListener('pointerdown', () => { if (state.activeId !== entry.id)
                    this.selectModifier(entry.id); });
                const toolbar = document.createElement('header');
                toolbar.className = 'Modifiers3DEditor-Toolbar';
                const enabled = document.createElement('input');
                enabled.type = 'checkbox';
                enabled.checked = entry.enabled;
                enabled.title = 'Enabled';
                enabled.addEventListener('change', event => { event.stopPropagation(); this.toggleEnable(entry.id); });
                const name = document.createElement('span');
                name.className = 'Modifiers3DEditor-Name';
                name.textContent = entry.kind;
                name.addEventListener('click', event => { event.stopPropagation(); this.selectModifier(entry.id); });
                const actions = document.createElement('span');
                actions.className = 'Modifiers3DEditor-Actions';
                for (const [text, action, title] of [['↑', () => this.moveModifier(entry.id, -1), 'Move up'], ['↓', () => this.moveModifier(entry.id, 1), 'Move down'], ['×', () => this.removeModifier(entry.id), 'Remove']] as [
                    string,
                    () => void,
                    string
                ][]) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'Modifiers3DEditor-Button';
                    button.textContent = text;
                    button.title = title;
                    button.addEventListener('click', event => { event.stopPropagation(); action(); });
                    actions.appendChild(button);
                }
                toolbar.append(enabled, name, actions);
                item.append(toolbar, this.CreatePanel(entry));
                scroll.appendChild(item);
            });
            const foot = document.createElement('footer');
            foot.className = 'Modifiers3DEditor-Footer';
            const select = document.createElement('select');
            select.className = 'Modifiers3DEditor-Input';
            select.setAttribute('aria-label', 'Modifier to add');
            for (const kind of Object.keys(ModifierTags) as Types.ModifierKind[]) {
                const option = document.createElement('option');
                option.value = kind;
                option.textContent = kind;
                select.appendChild(option);
            }
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'Modifiers3DEditor-Button';
            add.textContent = '+ Add';
            add.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); this.addModifier(select.value as Types.ModifierKind); });
            foot.append(select, add);
            root.append(head, scroll, foot);
            this.replaceChildren(root);
            this.SyncActive();
        }
    }
}
export type ModifierKind = 'bend' | 'twist' | 'taper' | 'squeeze' | 'push' | 'noise' | 'mirror' | 'relax' | 'subdivision' | 'mesh-smooth' | 'extrude' | 'bevel' | 'bevel-profile' | 'sweep' | 'surface' | 'array' | 'wave' | 'lathe' | 'cross-section' | 'mover' | 'resizer' | 'rotator' | 'rounder' | 'skewer';
export type ModifierEntry = Modifiers3DEditor.Interfaces.ModifierEntry;
export type Modifiers3DEditorOptions = Modifiers3DEditor.Interfaces.Modifiers3DEditorOptions;
export const Modifier3DTags = Modifiers3DEditor.ModifierTags;
export default Modifiers3DEditor.Modifiers3DEditor;
