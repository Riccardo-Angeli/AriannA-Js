import { Component, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/graphics/2D/LayersPanel
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * LayersPanel — Illustrator-style layer manager for 2D editors. Manages
 * an ordered tree of layers (groups can contain sub-layers), per-layer
 * visibility / lock / opacity, and drag-to-reorder.
 *
 *   • Toggle visibility (eye icon)
 *   • Toggle lock (padlock icon)
 *   • Select / rename layer
 *   • Reorder via up/down buttons
 *   • Add / remove / duplicate layer
 *   • Groups (nested) with collapse/expand
 *
 * @example HTML
 *   <arianna-layers-panel></arianna-layers-panel>
 *
 * @example JS
 *   const lp = new LayersPanel();
 *   lp.setLayers([
 *     { id: 'L1', name: 'Background', visible: true, locked: false },
 *     { id: 'L2', name: 'Sketch',     visible: true, locked: false,
 *       children: [{ id: 'L2a', name: 'Faces', visible: true, locked: false }] },
 *   ]);
 *
 * Events: arianna:layers-change, arianna:layer-select
 * Attributes:  (none — programmatic state)
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity?: number; // 0..1
    expanded?: boolean;
    children?: Layer[];
}
interface FlatLayer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
    expanded: boolean;
    hasKids: boolean;
    depth: number;
}
let layerCounter = 0;
const newLayerId = () => `L${++layerCounter}`;
@Component('arianna-layers-panel', {}, {
    Attributes: [],
})
export class LayersPanel extends HTMLElement {
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    layers$: Signal<Layer[]> = signal<Layer[]>([
        { id: newLayerId(), name: 'Layer 1', visible: true, locked: false },
    ]);
    selected$: Signal<string | null> = signal<string | null>(null);
    onConnected() {
        this.flatLayers = (): FlatLayer[] => {
            const out: FlatLayer[] = [];
            const walk = (list: Layer[], depth: number) => {
                for (const l of list) {
                    out.push({
                        id: l.id, name: l.name,
                        visible: l.visible, locked: l.locked,
                        opacity: l.opacity ?? 1,
                        expanded: l.expanded ?? true,
                        hasKids: !!(l.children && l.children.length),
                        depth,
                    });
                    if (l.children && (l.expanded ?? true))
                        walk(l.children, depth + 1);
                }
            };
            walk(this.layers$.Get(), 0);
            return out;
        };
        this.rowCls = (l: FlatLayer): string => 'ar-lp__row'
            + (this.selected$.Get() === l.id ? ' ar-lp__row--sel' : '')
            + (l.locked ? ' ar-lp__row--locked' : '')
            + (!l.visible ? ' ar-lp__row--hidden' : '');
        this.indentStyle = (l: FlatLayer): string => `padding-left: ${l.depth * 14 + 6}px`;
        this.onRowClick = (e: Event) => {
            const row = e.currentTarget as HTMLElement;
            const id = row.dataset.id;
            if (id)
                this.selectLayer(id);
        };
        this.onToggleVis = (e: Event) => {
            e.stopPropagation();
            const btn = e.currentTarget as HTMLElement;
            const id = btn.dataset.id;
            if (id)
                this.toggleVisibility(id);
        };
        this.onToggleLock = (e: Event) => {
            e.stopPropagation();
            const btn = e.currentTarget as HTMLElement;
            const id = btn.dataset.id;
            if (id)
                this.toggleLock(id);
        };
        this.onToggleExpand = (e: Event) => {
            e.stopPropagation();
            const btn = e.currentTarget as HTMLElement;
            const id = btn.dataset.id;
            if (id)
                this.toggleExpand(id);
        };
        this.onAdd = () => this.addLayer({ name: `Layer ${this.layers$.Get().length + 1}` });
        this.onRemove = () => {
            const sel = this.selected$.Get();
            if (sel)
                this.removeLayer(sel);
        };
        this.onMoveUp = () => {
            const sel = this.selected$.Get();
            if (sel)
                this.moveLayer(sel, -1);
        };
        this.onMoveDown = () => {
            const sel = this.selected$.Get();
            if (sel)
                this.moveLayer(sel, 1);
        };
        this.template = html `
            <div class="ar-lp__toolbar">
                <button type="button" class="ar-lp__tool-btn" title="Add layer" @click="this.onAdd">＋</button>
                <button type="button" class="ar-lp__tool-btn" title="Remove" @click="this.onRemove">−</button>
                <button type="button" class="ar-lp__tool-btn" title="Move up" @click="this.onMoveUp">↑</button>
                <button type="button" class="ar-lp__tool-btn" title="Move down" @click="this.onMoveDown">↓</button>
            </div>
            <div class="ar-lp__list">
                <div a-for="l in this.flatLayers()"
                     :class="this.rowCls(l)"
                     :style="this.indentStyle(l)"
                     :data-id="l.id"
                     @click="this.onRowClick">
                    <button class="ar-lp__expand" :data-id="l.id" @click="this.onToggleExpand">
                        <span a-if="l.hasKids">▸</span>
                    </button>
                    <button class="ar-lp__icon" :data-id="l.id" @click="this.onToggleVis" title="Toggle visibility">
                        <span>{{ l.visible ? '👁' : '·' }}</span>
                    </button>
                    <button class="ar-lp__icon" :data-id="l.id" @click="this.onToggleLock" title="Toggle lock">
                        <span>{{ l.locked ? '🔒' : '·' }}</span>
                    </button>
                    <span class="ar-lp__name">{{ l.name }}</span>
                </div>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = LayersPanel.DefaultSheet();
    }
    // ── Public API ───────────────────────────────────────────────────────────
    setLayers(layers: Layer[]): this {
        this.layers$.Set(layers.map(l => this.#cloneLayer(l)));
        if (this.selected$.Get() && !this.#findById(this.selected$.Get()!))
            this.selected$.Set(null);
        this.#fireChange();
        return this;
    }
    getLayers(): Layer[] {
        return this.layers$.Get().map(l => this.#cloneLayer(l));
    }
    selectLayer(id: string): this {
        this.selected$.Set(id);
        this.dispatchEvent(new CustomEvent('arianna:layer-select', {
            bubbles: true, detail: { id, layer: this.#findById(id) },
        }));
        return this;
    }
    getSelected(): string | null { return this.selected$.Get(); }
    addLayer(partial: Partial<Layer>): Layer {
        const l: Layer = {
            id: partial.id ?? newLayerId(),
            name: partial.name ?? 'New Layer',
            visible: partial.visible ?? true,
            locked: partial.locked ?? false,
            opacity: partial.opacity ?? 1,
            ...(partial.children ? { children: partial.children.map(c => this.#cloneLayer(c)) } : {}),
        };
        const next = this.layers$.Get().slice();
        next.push(l);
        this.layers$.Set(next);
        this.selected$.Set(l.id);
        this.#fireChange();
        return l;
    }
    removeLayer(id: string): this {
        const removeIn = (list: Layer[]): Layer[] => {
            return list.filter(l => {
                if (l.id === id)
                    return false;
                if (l.children)
                    l.children = removeIn(l.children);
                return true;
            });
        };
        const next = removeIn(this.layers$.Get().slice());
        this.layers$.Set(next);
        if (this.selected$.Get() === id)
            this.selected$.Set(null);
        this.#fireChange();
        return this;
    }
    toggleVisibility(id: string): this {
        this.#updateLayer(id, l => ({ ...l, visible: !l.visible }));
        return this;
    }
    toggleLock(id: string): this {
        this.#updateLayer(id, l => ({ ...l, locked: !l.locked }));
        return this;
    }
    toggleExpand(id: string): this {
        this.#updateLayer(id, l => ({ ...l, expanded: !(l.expanded ?? true) }));
        return this;
    }
    setName(id: string, name: string): this {
        this.#updateLayer(id, l => ({ ...l, name }));
        return this;
    }
    setOpacity(id: string, opacity: number): this {
        this.#updateLayer(id, l => ({ ...l, opacity: Math.max(0, Math.min(1, opacity)) }));
        return this;
    }
    moveLayer(id: string, dir: -1 | 1): this {
        // Only moves at the top level for simplicity
        const list = this.layers$.Get().slice();
        const idx = list.findIndex(l => l.id === id);
        if (idx === -1)
            return this;
        const next = idx + dir;
        if (next < 0 || next >= list.length)
            return this;
        const [moved] = list.splice(idx, 1);
        list.splice(next, 0, moved!);
        this.layers$.Set(list);
        this.#fireChange();
        return this;
    }
    #cloneLayer(l: Layer): Layer {
        return {
            id: l.id, name: l.name,
            visible: l.visible, locked: l.locked,
            opacity: l.opacity, expanded: l.expanded,
            ...(l.children ? { children: l.children.map(c => this.#cloneLayer(c)) } : {}),
        };
    }
    #findById(id: string): Layer | null {
        const walk = (list: Layer[]): Layer | null => {
            for (const l of list) {
                if (l.id === id)
                    return l;
                if (l.children) {
                    const f = walk(l.children);
                    if (f)
                        return f;
                }
            }
            return null;
        };
        return walk(this.layers$.Get());
    }
    #updateLayer(id: string, patch: (l: Layer) => Layer): void {
        const walk = (list: Layer[]): Layer[] => list.map(l => {
            if (l.id === id)
                return patch(l);
            if (l.children)
                return { ...l, children: walk(l.children) };
            return l;
        });
        this.layers$.Set(walk(this.layers$.Get()));
        this.#fireChange();
    }
    #fireChange(): void {
        this.dispatchEvent(new CustomEvent('arianna:layers-change', {
            bubbles: true, detail: { layers: this.getLayers() },
        }));
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    private flatLayers: () => FlatLayer[] = () => [];
    private rowCls: (l: FlatLayer) => string = () => '';
    private indentStyle: (l: FlatLayer) => string = () => '';
    private onRowClick: (e: Event) => void = () => { };
    private onToggleVis: (e: Event) => void = () => { };
    private onToggleLock: (e: Event) => void = () => { };
    private onToggleExpand: (e: Event) => void = () => { };
    private onAdd: (e: Event) => void = () => { };
    private onRemove: (e: Event) => void = () => { };
    private onMoveUp: (e: Event) => void = () => { };
    private onMoveDown: (e: Event) => void = () => { };
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background: 'var(--arianna-bg, #fff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: 'var(--arianna-radius, 6px)',
                color: 'var(--arianna-text, #1f2328)',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '-apple-system, system-ui, sans-serif',
                fontSize: '12px',
                width: '240px',
                minHeight: '180px',
                overflow: 'hidden',
            }),
            new Rule('.ar-lp__toolbar', {
                display: 'flex',
                gap: '3px',
                padding: '4px',
                borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                background: 'var(--arianna-bg-3, #f3f3f3)',
            }),
            new Rule('.ar-lp__tool-btn', {
                width: '24px', height: '24px',
                background: 'var(--arianna-bg, #fff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: '2px',
                color: 'var(--arianna-text, #1f2328)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '0',
            }),
            new Rule('.ar-lp__tool-btn:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
            new Rule('.ar-lp__list', { flex: '1', overflowY: 'auto' }),
            new Rule('.ar-lp__row', {
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 6px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--arianna-bg-3, #f3f3f3)',
            }),
            new Rule('.ar-lp__row:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
            new Rule('.ar-lp__row--sel', {
                background: 'rgba(31,111,235,0.08)',
                color: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-lp__row--hidden .ar-lp__name', { opacity: '0.4' }),
            new Rule('.ar-lp__row--locked .ar-lp__name', { fontStyle: 'italic' }),
            new Rule('.ar-lp__expand, .ar-lp__icon', {
                width: '16px', height: '18px',
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '0',
                fontSize: '11px',
            }),
            new Rule('.ar-lp__name', { flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * LayersPanel namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace LayersPanel {
    export namespace Interfaces {
        export interface LayerContract extends Layer {
        }
        export interface FlatLayerContract extends FlatLayer {
        }
    }
}
export default LayersPanel;
