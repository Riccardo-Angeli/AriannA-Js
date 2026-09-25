/**
 * @module components/layout/Golden
 * @author Riccardo Angeli
 * @version 2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * IntelliJ-style application shell with collapsible tool windows, vertical
 * tool-window bars and dock/float behaviour on all four sides.
 */

import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace Golden
{
    export namespace Types
    {
        export type DockPosition = 'left' | 'right' | 'top' | 'bottom' | 'float';
        export type ToolBarSide = 'left' | 'right';
        export type Theme = 'dark' | 'light';
    }

    export namespace Interfaces
    {
        export interface PanelDefinition
        {
            id: string;
            title?: string;
            icon?: string;
            position?: Types.DockPosition;
            bar?: Types.ToolBarSide;
            visible?: boolean;
            element: HTMLElement;
        }

        export interface PanelSnapshot
        {
            id: string;
            position: Types.DockPosition;
            bar: Types.ToolBarSide;
            visible: boolean;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
        }

        export interface GoldenOptions
        {
            theme?: Types.Theme;
            panels?: PanelDefinition[];
        }
    }

    interface PanelRecord
    {
        id: string;
        title: string;
        icon: string;
        position: Types.DockPosition;
        lastDock: Exclude<Types.DockPosition, 'float'>;
        bar: Types.ToolBarSide;
        visible: boolean;
        element: HTMLElement;
        frame: HTMLElement;
        body: HTMLElement;
        button: HTMLButtonElement;
        select: HTMLSelectElement;
    }

    interface GoldenState
    {
        built: boolean;
        panels: Map<string, PanelRecord>;
        root?: HTMLElement;
        header?: HTMLElement;
        main?: HTMLElement;
        footer?: HTMLElement;
        floating?: HTMLElement;
        leftBar?: HTMLElement;
        rightBar?: HTMLElement;
        zones?: Record<Exclude<Types.DockPosition, 'float'>, HTMLElement>;
        cleanups: Array<() => void>;
    }

    const States = new WeakMap<HTMLElement, GoldenState>();
    const stateOf = (host: HTMLElement): GoldenState => {
        let state = States.get(host);
        if (!state) {
            state = { built: false, panels: new Map(), cleanups: [] };
            States.set(host, state);
        }
        return state;
    };

    const dockPositions: Types.DockPosition[] = ['left', 'right', 'top', 'bottom', 'float'];
    const isDockPosition = (value: string | null): value is Types.DockPosition =>
        value !== null && dockPositions.includes(value as Types.DockPosition);

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-golden,.Golden', {
            Background: '#202428',
            Border: '1px solid #111417',
            BorderRadius: '7px',
            BoxSizing: 'border-box',
            Color: '#e4e8eb',
            Display: 'block',
            FontFamily: 'var(--arianna-font,system-ui,sans-serif)',
            Height: 'min(760px,calc(100vh - 48px))',
            MinHeight: '420px',
            MinWidth: '0',
            Overflow: 'hidden',
            Position: 'relative',
            Width: '100%',
            '--golden-accent': '#e40c88',
            '--golden-left-size': '250px',
            '--golden-right-size': '280px',
            '--golden-top-size': '170px',
            '--golden-bottom-size': '190px',
        }),
        new Css.Rule('.Golden-Root', { Display: 'grid', GridTemplateRows: '38px minmax(0,1fr) 23px', Height: '100%', MinHeight: '0', Position: 'relative' }),
        new Css.Rule('.Golden-Header', { AlignItems: 'center', Background: 'linear-gradient(180deg,#3a3f44,#2b3034)', BorderBottom: '1px solid #111417', Display: 'flex', Gap: '8px', MinWidth: '0', Padding: '0 10px', ZIndex: '20' }),
        new Css.Rule('.Golden-Header:empty::before', { Color: '#d9dee2', Content: '"AriannA IDE"', FontSize: '11px', FontWeight: '800' }),
        new Css.Rule('.Golden-Work', { Display: 'grid', GridTemplateColumns: '32px auto minmax(0,1fr) auto 32px', MinHeight: '0', MinWidth: '0', Position: 'relative' }),
        new Css.Rule('.Golden-Bar', { AlignItems: 'stretch', Background: '#25292d', BorderColor: '#111417', Display: 'flex', FlexDirection: 'column', Gap: '2px', MinHeight: '0', Padding: '4px 3px', ZIndex: '12' }),
        new Css.Rule('.Golden-Bar[data-side="left"]', { BorderRight: '1px solid #111417' }),
        new Css.Rule('.Golden-Bar[data-side="right"]', { BorderLeft: '1px solid #111417' }),
        new Css.Rule('.Golden-BarButton', { AlignItems: 'center', Appearance: 'none', Background: 'transparent', Border: '1px solid transparent', BorderRadius: '3px', Color: '#9da6ad', Cursor: 'pointer', Display: 'flex', FlexDirection: 'column', Font: '700 9px/1 system-ui', Gap: '4px', MinHeight: '52px', Padding: '6px 2px', Width: '25px' }),
        new Css.Rule('.Golden-BarButton:hover', { Background: '#343a3f', Color: '#fff' }),
        new Css.Rule('.Golden-BarButton[aria-expanded="true"]', { Background: '#343a3f', BorderColor: '#4a5157', BoxShadow: 'inset 2px 0 0 var(--golden-accent)', Color: '#fff' }),
        new Css.Rule('.Golden-BarLabel', { WritingMode: 'vertical-rl', Transform: 'rotate(180deg)', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Golden-Center', { Display: 'grid', GridTemplateRows: 'auto minmax(0,1fr) auto', MinHeight: '0', MinWidth: '0', Position: 'relative' }),
        new Css.Rule('.Golden-Main', { Background: '#1b1f22', MinHeight: '0', MinWidth: '0', Overflow: 'auto', Position: 'relative' }),
        new Css.Rule('.Golden-Main:empty::before', { Color: '#59636b', Content: '"Workspace"', Display: 'grid', FontSize: '18px', Height: '100%', PlaceItems: 'center' }),
        new Css.Rule('.Golden-Zone', { Background: '#292d31', MinHeight: '0', MinWidth: '0', Overflow: 'auto' }),
        new Css.Rule('.Golden-Zone:empty', { Display: 'none' }),
        new Css.Rule('.Golden-Zone[data-empty]', { Display: 'none' }),
        new Css.Rule('.Golden-Zone[data-position="left"]', { BorderRight: '1px solid #111417', Width: 'var(--golden-left-size)' }),
        new Css.Rule('.Golden-Zone[data-position="right"]', { BorderLeft: '1px solid #111417', Width: 'var(--golden-right-size)' }),
        new Css.Rule('.Golden-Zone[data-position="top"]', { BorderBottom: '1px solid #111417', MaxHeight: 'var(--golden-top-size)' }),
        new Css.Rule('.Golden-Zone[data-position="bottom"]', { BorderTop: '1px solid #111417', MaxHeight: 'var(--golden-bottom-size)' }),
        new Css.Rule('.Golden-Panel', { Background: '#292d31', BoxSizing: 'border-box', Color: '#e4e8eb', Display: 'grid', GridTemplateRows: '29px minmax(0,1fr)', Height: '100%', MinHeight: '96px', MinWidth: '170px', Overflow: 'hidden' }),
        new Css.Rule('.Golden-PanelHeader', { AlignItems: 'center', Background: 'linear-gradient(180deg,#3a3f44,#2b3034)', BorderBottom: '1px solid #111417', Display: 'flex', Gap: '6px', Padding: '0 5px 0 9px', UserSelect: 'none' }),
        new Css.Rule('.Golden-Panel[data-position="float"] .Golden-PanelHeader', { Cursor: 'move' }),
        new Css.Rule('.Golden-PanelTitle', { Flex: '1 1 auto', FontSize: '10px', FontWeight: '800', MinWidth: '0', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Golden-PanelSelect,.Golden-PanelClose', { Appearance: 'none', Background: 'linear-gradient(180deg,#40464b,#2d3236)', Border: '1px solid #15181a', BorderRadius: '3px', Color: '#cbd1d5', Cursor: 'pointer', Font: '700 9px/1 system-ui', Height: '21px' }),
        new Css.Rule('.Golden-PanelSelect', { MaxWidth: '67px', Padding: '0 3px' }),
        new Css.Rule('.Golden-PanelClose', { Width: '23px' }),
        new Css.Rule('.Golden-PanelBody', { MinHeight: '0', MinWidth: '0', Overflow: 'auto', Position: 'relative' }),
        new Css.Rule('.Golden-PanelBody > *', { BoxSizing: 'border-box', MaxWidth: '100%' }),
        new Css.Rule('.Golden-FloatingLayer', { Inset: '0', PointerEvents: 'none', Position: 'absolute', ZIndex: '40' }),
        new Css.Rule('.Golden-FloatingLayer > .Golden-Panel', { Border: '1px solid #111417', BorderRadius: '7px', BoxShadow: '0 22px 60px rgba(0,0,0,.55)', Height: '310px', Left: '56px', PointerEvents: 'auto', Position: 'absolute', Resize: 'both', Top: '48px', Width: '330px' }),
        new Css.Rule('.Golden-Footer', { AlignItems: 'center', Background: '#25292d', BorderTop: '1px solid #111417', Color: '#8e979f', Display: 'flex', Font: '9px/1 ui-monospace,monospace', Gap: '12px', MinWidth: '0', Padding: '0 9px' }),
        new Css.Rule('.Golden-Footer:empty::before', { Content: '"Ready"' }),
        new Css.Rule('arianna-golden[theme="light"],.Golden[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }),
        new Css.Rule('arianna-golden[theme="light"] .Golden-Header,arianna-golden[theme="light"] .Golden-PanelHeader', { Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor: '#b9bec3', Color: '#25292d' }),
        new Css.Rule('arianna-golden[theme="light"] .Golden-Bar,arianna-golden[theme="light"] .Golden-Footer', { Background: '#e1e4e7', BorderColor: '#b9bec3', Color: '#596168' }),
        new Css.Rule('arianna-golden[theme="light"] .Golden-Main', { Background: '#fff' }),
        new Css.Rule('arianna-golden[theme="light"] .Golden-Zone,arianna-golden[theme="light"] .Golden-Panel', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }),
        new Css.Rule('arianna-golden[theme="light"] .Golden-BarButton:hover,arianna-golden[theme="light"] .Golden-BarButton[aria-expanded="true"]', { Background: '#fff', Color: '#25292d' }),
    ]);

    @Component('arianna-golden', Styles, { Shadow: false, Attributes: ['theme'], Properties: ['panels'] })
    export class Golden extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        public onCreated(): void { if (this.isConnected) this.onConnected(); }

        public onConnected(options: Interfaces.GoldenOptions = {}): void
        {
            this.classList.add('Golden');
            if (!this.hasAttribute('theme')) this.setAttribute('theme', options.theme ?? 'dark');
            if (!stateOf(this).built) this.build(options.panels ?? []);
        }

        public onDisconnected(): void
        {
            const state = stateOf(this);
            state.cleanups.splice(0).forEach(cleanup => cleanup());
        }

        public get panels(): Interfaces.PanelSnapshot[] { return this.snapshot(); }
        public set panels(value: Interfaces.PanelDefinition[]) {
            if (!Array.isArray(value)) return;
            for (const panel of value) this.registerPanel(panel);
        }

        public registerPanel(definition: Interfaces.PanelDefinition): this
        {
            const state = stateOf(this);
            if (!state.built) {
                this.build([definition]);
                return this;
            }
            const id = definition.id.trim();
            if (!id) throw new TypeError('Golden.registerPanel: id is required');
            if (state.panels.has(id)) this.removePanel(id);

            const position = definition.position ?? 'left';
            const bar = definition.bar ?? (position === 'right' ? 'right' : 'left');
            const record = this.makePanel({
                ...definition,
                id,
                position,
                bar,
                visible: definition.visible ?? true,
            });
            state.panels.set(id, record);
            (bar === 'right' ? state.rightBar : state.leftBar)!.appendChild(record.button);
            this.place(record, position);
            this.sync(record);
            this.emitChange('register', record);
            return this;
        }

        public removePanel(id: string): this
        {
            const state = stateOf(this), record = state.panels.get(id);
            if (!record) return this;
            record.frame.remove(); record.button.remove();
            state.panels.delete(id); this.updateZones(); this.emitChange('remove', record);
            return this;
        }

        public showPanel(id: string): this { return this.setPanelVisibility(id, true); }
        public hidePanel(id: string): this { return this.setPanelVisibility(id, false); }
        public togglePanel(id: string): this {
            const record = stateOf(this).panels.get(id);
            return record ? this.setPanelVisibility(id, !record.visible) : this;
        }

        public dockPanel(id: string, position: Exclude<Types.DockPosition, 'float'>): this
        {
            const record = stateOf(this).panels.get(id);
            if (!record) return this;
            record.lastDock = position; record.position = position; record.visible = true;
            this.place(record, position); this.sync(record); this.emitChange('dock', record);
            return this;
        }

        public floatPanel(id: string): this
        {
            const record = stateOf(this).panels.get(id);
            if (!record) return this;
            if (record.position !== 'float') record.lastDock = record.position;
            record.position = 'float'; record.visible = true;
            this.place(record, 'float'); this.sync(record); this.emitChange('float', record);
            return this;
        }

        public restorePanel(id: string): this
        {
            const record = stateOf(this).panels.get(id);
            return record ? this.dockPanel(id, record.lastDock) : this;
        }

        public snapshot(): Interfaces.PanelSnapshot[]
        {
            return [...stateOf(this).panels.values()].map(record => {
                const rect = record.frame.getBoundingClientRect();
                return {
                    id: record.id, position: record.position, bar: record.bar, visible: record.visible,
                    ...(record.position === 'float' ? {
                        x: parseFloat(record.frame.style.left) || rect.left,
                        y: parseFloat(record.frame.style.top) || rect.top,
                        width: rect.width, height: rect.height,
                    } : {}),
                };
            });
        }

        public restore(snapshot: Interfaces.PanelSnapshot[]): this
        {
            for (const value of snapshot) {
                const record = stateOf(this).panels.get(value.id);
                if (!record) continue;
                record.bar = value.bar; record.position = value.position; record.visible = value.visible;
                (value.bar === 'right' ? stateOf(this).rightBar : stateOf(this).leftBar)!.appendChild(record.button);
                this.place(record, value.position);
                if (value.position === 'float') {
                    if (Number.isFinite(value.x)) record.frame.style.left = `${value.x}px`;
                    if (Number.isFinite(value.y)) record.frame.style.top = `${value.y}px`;
                    if (Number.isFinite(value.width)) record.frame.style.width = `${value.width}px`;
                    if (Number.isFinite(value.height)) record.frame.style.height = `${value.height}px`;
                }
                this.sync(record);
            }
            this.emitChange('restore');
            return this;
        }

        private build(definitions: Interfaces.PanelDefinition[]): void
        {
            const state = stateOf(this);
            const original = [...this.children] as HTMLElement[];

            const root = document.createElement('section'); root.className = 'Golden-Root';
            const header = document.createElement('header'); header.className = 'Golden-Header';
            const work = document.createElement('section'); work.className = 'Golden-Work';
            const leftBar = document.createElement('nav'); leftBar.className = 'Golden-Bar'; leftBar.dataset.side = 'left'; leftBar.setAttribute('aria-label', 'Left tool windows');
            const rightBar = document.createElement('nav'); rightBar.className = 'Golden-Bar'; rightBar.dataset.side = 'right'; rightBar.setAttribute('aria-label', 'Right tool windows');
            const left = document.createElement('aside'); left.className = 'Golden-Zone'; left.dataset.position = 'left';
            const right = document.createElement('aside'); right.className = 'Golden-Zone'; right.dataset.position = 'right';
            const center = document.createElement('section'); center.className = 'Golden-Center';
            const top = document.createElement('aside'); top.className = 'Golden-Zone'; top.dataset.position = 'top';
            const main = document.createElement('main'); main.className = 'Golden-Main';
            const bottom = document.createElement('aside'); bottom.className = 'Golden-Zone'; bottom.dataset.position = 'bottom';
            const footer = document.createElement('footer'); footer.className = 'Golden-Footer';
            const floating = document.createElement('div'); floating.className = 'Golden-FloatingLayer';

            center.append(top, main, bottom); work.append(leftBar, left, center, right, rightBar); root.append(header, work, footer, floating);
            this.replaceChildren(root);
            Object.assign(state, { built: true, root, header, main, footer, floating, leftBar, rightBar, zones: { left, right, top, bottom } });

            for (const node of original) {
                const slot = node.getAttribute('slot') ?? node.dataset.goldenRole ?? '';
                if (slot === 'header') { node.removeAttribute('slot'); header.appendChild(node); continue; }
                if (slot === 'footer') { node.removeAttribute('slot'); footer.appendChild(node); continue; }
                if (slot === 'main' || slot === 'center') { node.removeAttribute('slot'); main.appendChild(node); continue; }
                if (isDockPosition(slot)) {
                    node.removeAttribute('slot');
                    definitions.push({
                        id: node.dataset.panel ?? node.id ?? `panel-${definitions.length + 1}`,
                        title: node.dataset.title ?? node.getAttribute('aria-label') ?? node.id ?? 'Tool Window',
                        icon: node.dataset.icon ?? '▪',
                        position: slot,
                        bar: node.dataset.bar === 'right' ? 'right' : slot === 'right' ? 'right' : 'left',
                        visible: !node.hasAttribute('hidden'),
                        element: node,
                    });
                    continue;
                }
                main.appendChild(node);
            }

            for (const definition of definitions) this.registerPanel(definition);
            this.updateZones();
        }

        private makePanel(definition: Required<Pick<Interfaces.PanelDefinition, 'id' | 'position' | 'bar' | 'visible' | 'element'>> & Interfaces.PanelDefinition): PanelRecord
        {
            const frame = document.createElement('section'); frame.className = 'Golden-Panel'; frame.dataset.panel = definition.id;
            const head = document.createElement('header'); head.className = 'Golden-PanelHeader';
            const title = document.createElement('span'); title.className = 'Golden-PanelTitle'; title.textContent = definition.title ?? definition.id;
            const select = document.createElement('select'); select.className = 'Golden-PanelSelect'; select.setAttribute('aria-label', 'Panel position');
            for (const value of dockPositions) { const option = document.createElement('option'); option.value = value; option.textContent = value === 'float' ? 'Float' : `Dock ${value}`; select.appendChild(option); }
            const close = document.createElement('button'); close.type = 'button'; close.className = 'Golden-PanelClose'; close.textContent = '×'; close.setAttribute('aria-label', 'Collapse panel');
            const body = document.createElement('div'); body.className = 'Golden-PanelBody'; body.appendChild(definition.element);
            head.append(title, select, close); frame.append(head, body);

            const button = document.createElement('button'); button.type = 'button'; button.className = 'Golden-BarButton'; button.dataset.panel = definition.id;
            button.innerHTML = `<span aria-hidden="true">${this.escape(definition.icon ?? '▪')}</span><span class="Golden-BarLabel">${this.escape(definition.title ?? definition.id)}</span>`;

            const record: PanelRecord = {
                id: definition.id, title: definition.title ?? definition.id, icon: definition.icon ?? '▪',
                position: definition.position, lastDock: definition.position === 'float' ? (definition.bar === 'right' ? 'right' : 'left') : definition.position,
                bar: definition.bar, visible: definition.visible, element: definition.element, frame, body, button, select,
            };
            select.onchange = () => select.value === 'float' ? this.floatPanel(record.id) : this.dockPanel(record.id, select.value as Exclude<Types.DockPosition, 'float'>);
            close.onclick = () => this.hidePanel(record.id);
            button.onclick = () => this.togglePanel(record.id);
            head.ondblclick = event => { if ((event.target as HTMLElement).closest('button,select')) return; record.position === 'float' ? this.restorePanel(record.id) : this.floatPanel(record.id); };
            this.installDrag(record, head);
            return record;
        }

        private installDrag(record: PanelRecord, handle: HTMLElement): void
        {
            handle.addEventListener('pointerdown', event => {
                if (record.position !== 'float' || (event.target as HTMLElement).closest('button,select')) return;
                event.preventDefault();
                const rootRect = stateOf(this).root!.getBoundingClientRect(), rect = record.frame.getBoundingClientRect();
                const offsetX = event.clientX - rect.left, offsetY = event.clientY - rect.top;
                handle.setPointerCapture(event.pointerId);
                const move = (moveEvent: PointerEvent) => {
                    const maxX = Math.max(0, rootRect.width - record.frame.offsetWidth), maxY = Math.max(0, rootRect.height - record.frame.offsetHeight);
                    record.frame.style.left = `${Math.max(0, Math.min(maxX, moveEvent.clientX - rootRect.left - offsetX))}px`;
                    record.frame.style.top = `${Math.max(0, Math.min(maxY, moveEvent.clientY - rootRect.top - offsetY))}px`;
                };
                const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); this.emitChange('move', record); };
                handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up);
            });
        }

        private place(record: PanelRecord, position: Types.DockPosition): void
        {
            const state = stateOf(this);
            record.frame.dataset.position = position;
            if (position === 'float') {
                if (!record.frame.style.left) record.frame.style.left = `${54 + state.panels.size * 18}px`;
                if (!record.frame.style.top) record.frame.style.top = `${46 + state.panels.size * 14}px`;
                state.floating!.appendChild(record.frame);
            } else {
                record.frame.style.removeProperty('left'); record.frame.style.removeProperty('top');
                record.frame.style.removeProperty('width'); record.frame.style.removeProperty('height');
                state.zones![position].appendChild(record.frame);
            }
            this.updateZones();
        }

        private setPanelVisibility(id: string, visible: boolean): this
        {
            const record = stateOf(this).panels.get(id);
            if (!record) return this;
            record.visible = visible; this.sync(record); this.updateZones(); this.emitChange(visible ? 'show' : 'hide', record);
            return this;
        }

        private sync(record: PanelRecord): void
        {
            record.frame.hidden = !record.visible;
            record.button.setAttribute('aria-expanded', String(record.visible));
            record.button.title = `${record.visible ? 'Hide' : 'Show'} ${record.title}`;
            record.select.value = record.position;
        }

        private updateZones(): void
        {
            const state = stateOf(this);
            if (!state.zones) return;
            for (const zone of Object.values(state.zones)) zone.toggleAttribute('data-empty', ![...zone.children].some(child => !(child as HTMLElement).hidden));
        }

        private emitChange(kind: string, record?: PanelRecord): void
        {
            this.dispatchEvent(new CustomEvent('arianna:golden-change', {
                bubbles: true, composed: true,
                detail: { kind, panel: record?.id ?? null, state: this.snapshot(), source: this },
            }));
        }

        private escape(value: string): string
        {
            return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
    }
}

export type GoldenDockPosition = Golden.Types.DockPosition;
export type GoldenToolBarSide = Golden.Types.ToolBarSide;
export type GoldenPanelDefinition = Golden.Interfaces.PanelDefinition;
export type GoldenPanelSnapshot = Golden.Interfaces.PanelSnapshot;
export type GoldenOptions = Golden.Interfaces.GoldenOptions;
export default Golden.Golden;
