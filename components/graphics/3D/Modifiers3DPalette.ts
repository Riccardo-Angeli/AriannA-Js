/**
 * @module    components/graphics/3D/Modifiers3DPalette
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Modifiers3DPalette — modifier stack UI for the arianna-* 3D modifier
 * family (bend / twist / taper / mirror / array / displace / wave / shear /
 * lattice / smooth / decimate / subdivide / boolean / extrude-2d).
 * Each entry shows its name, can be enabled/disabled, reordered, and
 * exposes its parameters in an inline inspector.
 *
 * @example HTML
 *   <arianna-modifiers-3d-palette></arianna-modifiers-3d-palette>
 *
 * @example JS
 *   const mp = new Modifiers3DPalette();
 *   mp.addModifier({ kind: 'bend',  params: { angle: 90, axis: 'y' } });
 *   mp.addModifier({ kind: 'twist', params: { angle: 45, axis: 'y' } });
 *   mp.addEventListener('arianna:modifiers-change', e =>
 *     applyToMesh(mesh, e.detail.stack));
 *
 * Events: arianna:modifiers-change  detail: { stack: ModifierEntry[] }
 * Attrs:  (none — programmatic state)
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export type ModifierKind =
    | 'bend' | 'twist' | 'taper' | 'mirror' | 'array' | 'displace'
    | 'wave' | 'shear' | 'lattice' | 'smooth' | 'decimate' | 'subdivide'
    | 'boolean' | 'extrude-2d';

export interface ModifierEntry {
    id      : string;
    kind    : ModifierKind;
    enabled : boolean;
    params  : Record<string, number | string | boolean>;
}

export interface Modifiers3DPaletteOptions {
    stack? : ModifierEntry[];
}

const KIND_INFO: Array<{ kind: ModifierKind; label: string; icon: string }> = [
    { kind: 'bend',       label: 'Bend',       icon: '⏜' },
    { kind: 'twist',      label: 'Twist',      icon: '⌇' },
    { kind: 'taper',      label: 'Taper',      icon: '◣' },
    { kind: 'mirror',     label: 'Mirror',     icon: '⇋' },
    { kind: 'array',      label: 'Array',      icon: '▦' },
    { kind: 'displace',   label: 'Displace',   icon: '∿' },
    { kind: 'wave',       label: 'Wave',       icon: '〰' },
    { kind: 'shear',      label: 'Shear',      icon: '◢' },
    { kind: 'lattice',    label: 'Lattice',    icon: '⊞' },
    { kind: 'smooth',     label: 'Smooth',     icon: '◔' },
    { kind: 'decimate',   label: 'Decimate',   icon: '◣' },
    { kind: 'subdivide',  label: 'Subdivide',  icon: '⊕' },
    { kind: 'boolean',    label: 'Boolean',    icon: '◐' },
    { kind: 'extrude-2d', label: 'Extrude 2D', icon: '⬚' },
];

const DEFAULT_PARAMS: Record<ModifierKind, Record<string, number | string | boolean>> = {
    bend:         { angle: 90, axis: 'y' },
    twist:        { angle: 45, axis: 'y' },
    taper:        { factor: 0.5, axis: 'y' },
    mirror:       { axis: 'x' },
    array:        { count: 3, offsetX: 1, offsetY: 0, offsetZ: 0 },
    displace:     { strength: 0.5 },
    wave:         { amplitude: 0.2, frequency: 2 },
    shear:        { x: 0, y: 0, z: 0 },
    lattice:      { rows: 3, cols: 3 },
    smooth:       { iterations: 1 },
    decimate:     { ratio: 0.5 },
    subdivide:    { levels: 1 },
    boolean:      { op: 'union' },
    'extrude-2d': { depth: 1, bevel: 0 },
};

let modCounter = 0;
const newModId = () => `M${++modCounter}`;

export class Modifiers3DPalette extends Component('arianna-modifiers-3d-palette', HTMLElement, {}, {
    attrs : [],
})
{
    stack$   : Signal<ModifierEntry[]> = signal<ModifierEntry[]>([]);
    expanded$: Signal<string | null> = signal<string | null>(null);

    build(_opts: Modifiers3DPaletteOptions = {})
    {
        this.stackList = () => {
            const exp = this.expanded$.get();
            return this.stack$.get().map(m => ({
                id: m.id,
                kind: m.kind,
                label: KIND_INFO.find(k => k.kind === m.kind)?.label ?? m.kind,
                icon:  KIND_INFO.find(k => k.kind === m.kind)?.icon  ?? '◆',
                enabled: m.enabled,
                expanded: exp === m.id,
                rowCls: 'ar-m3p__row' + (m.enabled ? '' : ' ar-m3p__row--disabled')
                    + (exp === m.id ? ' ar-m3p__row--expanded' : ''),
                params: Object.entries(m.params).map(([key, val]) => ({
                    key,
                    val: String(val),
                    isNumber: typeof val === 'number',
                    isBoolean: typeof val === 'boolean',
                })),
            }));
        };

        this.addKinds = () => KIND_INFO;

        // ── Handlers ────────────────────────────────────────────────────
        this.onAddClick = (e: Event) => {
            const btn = e.currentTarget as HTMLButtonElement;
            const kind = btn.dataset.kind as ModifierKind;
            if (kind) this.addModifier({ kind });
        };
        this.onToggleEnable = (e: Event) => {
            e.stopPropagation();
            const btn = e.currentTarget as HTMLElement;
            const id = btn.dataset.id;
            if (id) this.toggleEnable(id);
        };
        this.onRowClick = (e: Event) => {
            const row = e.currentTarget as HTMLElement;
            const id = row.dataset.id;
            if (!id) return;
            this.expanded$.set(this.expanded$.get() === id ? null : id);
        };
        this.onRemove = (e: Event) => {
            e.stopPropagation();
            const btn = e.currentTarget as HTMLElement;
            const id = btn.dataset.id;
            if (id) this.removeModifier(id);
        };
        this.onMoveUp = (e: Event) => {
            e.stopPropagation();
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) this.moveModifier(id, -1);
        };
        this.onMoveDown = (e: Event) => {
            e.stopPropagation();
            const id = (e.currentTarget as HTMLElement).dataset.id;
            if (id) this.moveModifier(id, 1);
        };
        this.onParamChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            const id = inp.dataset.id;
            const key = inp.dataset.key;
            if (!id || !key) return;
            let value: number | string | boolean;
            if (inp.type === 'number') value = parseFloat(inp.value);
            else if (inp.type === 'checkbox') value = inp.checked;
            else value = inp.value;
            this.updateParam(id, key, value);
        };

        this.template = html`
            <div class="ar-m3p__addbar">
                <span class="ar-m3p__addlabel">Add modifier:</span>
                <select @change="this.onAddSelect">
                    <option value="">—</option>
                    <option a-for="k in this.addKinds()" :value="k.kind">{{ k.label }}</option>
                </select>
            </div>
            <div class="ar-m3p__stack">
                <div a-for="m in this.stackList()"
                     :class="m.rowCls"
                     :data-id="m.id"
                     @click="this.onRowClick">
                    <div class="ar-m3p__head">
                        <button class="ar-m3p__toggle" :data-id="m.id" @click="this.onToggleEnable" title="Enable/disable">
                            <span>{{ m.enabled ? '●' : '○' }}</span>
                        </button>
                        <span class="ar-m3p__icon">{{ m.icon }}</span>
                        <span class="ar-m3p__lbl">{{ m.label }}</span>
                        <button class="ar-m3p__small-btn" :data-id="m.id" @click="this.onMoveUp" title="Move up">↑</button>
                        <button class="ar-m3p__small-btn" :data-id="m.id" @click="this.onMoveDown" title="Move down">↓</button>
                        <button class="ar-m3p__small-btn ar-m3p__small-btn--danger" :data-id="m.id" @click="this.onRemove" title="Remove">×</button>
                    </div>
                    <div class="ar-m3p__params" a-if="m.expanded">
                        <label a-for="p in m.params" class="ar-m3p__pfield">
                            <span>{{ p.key }}</span>
                            <input type="number"
                                   a-if="p.isNumber"
                                   step="any"
                                   :data-id="m.id" :data-key="p.key"
                                   :value="p.val"
                                   @change="this.onParamChange"/>
                            <input type="checkbox"
                                   a-if="p.isBoolean"
                                   :data-id="m.id" :data-key="p.key"
                                   :checked="p.val === 'true'"
                                   @change="this.onParamChange"/>
                            <input type="text"
                                   a-if="!p.isNumber && !p.isBoolean"
                                   :data-id="m.id" :data-key="p.key"
                                   :value="p.val"
                                   @change="this.onParamChange"/>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Add-select handler binding (special: select with handler on option click)
        this.onAddSelect = (e: Event) => {
            const sel = e.target as HTMLSelectElement;
            const kind = sel.value as ModifierKind;
            if (kind) this.addModifier({ kind });
            sel.value = '';
        };
        // bind missing entry in handler bag — keep compat with template
        this.onAddClick;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Modifiers3DPalette.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    addModifier(opts: { kind: ModifierKind; params?: Record<string, number | string | boolean>; enabled?: boolean }): ModifierEntry {
        const entry: ModifierEntry = {
            id: newModId(),
            kind: opts.kind,
            enabled: opts.enabled ?? true,
            params: { ...DEFAULT_PARAMS[opts.kind], ...(opts.params ?? {}) },
        };
        const next = this.stack$.get().slice();
        next.push(entry);
        this.stack$.set(next);
        this.expanded$.set(entry.id);
        this.#fire();
        return entry;
    }
    removeModifier(id: string): this {
        const next = this.stack$.get().filter(m => m.id !== id);
        this.stack$.set(next);
        if (this.expanded$.get() === id) this.expanded$.set(null);
        this.#fire();
        return this;
    }
    toggleEnable(id: string): this {
        const next = this.stack$.get().map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
        this.stack$.set(next);
        this.#fire();
        return this;
    }
    moveModifier(id: string, dir: -1 | 1): this {
        const cur = this.stack$.get();
        const idx = cur.findIndex(m => m.id === id);
        if (idx === -1) return this;
        const next = cur.slice();
        const target = idx + dir;
        if (target < 0 || target >= next.length) return this;
        const [moved] = next.splice(idx, 1);
        next.splice(target, 0, moved!);
        this.stack$.set(next);
        this.#fire();
        return this;
    }
    updateParam(id: string, key: string, value: number | string | boolean): this {
        const next = this.stack$.get().map(m => m.id === id ? { ...m, params: { ...m.params, [key]: value } } : m);
        this.stack$.set(next);
        this.#fire();
        return this;
    }

    setStack(stack: ModifierEntry[]): this {
        this.stack$.set(stack.map(m => ({ ...m, params: { ...m.params } })));
        this.#fire();
        return this;
    }
    getStack(): ModifierEntry[] {
        return this.stack$.get().map(m => ({ ...m, params: { ...m.params } }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    #fire(): void {
        this.dispatchEvent(new CustomEvent('arianna:modifiers-change', {
            bubbles: true, detail: { stack: this.getStack() },
        }));
    }

    private stackList     : () => Array<{ id: string; kind: ModifierKind; label: string; icon: string; enabled: boolean; expanded: boolean; rowCls: string; params: Array<{ key: string; val: string; isNumber: boolean; isBoolean: boolean }> }> = () => [];
    private addKinds      : () => typeof KIND_INFO = () => KIND_INFO;
    private onAddClick    : (e: Event) => void = () => {};
    private onAddSelect   : (e: Event) => void = () => {};
    private onToggleEnable: (e: Event) => void = () => {};
    private onRowClick    : (e: Event) => void = () => {};
    private onRemove      : (e: Event) => void = () => {};
    private onMoveUp      : (e: Event) => void = () => {};
    private onMoveDown    : (e: Event) => void = () => {};
    private onParamChange : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'flex',
                    flexDirection: 'column',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    width       : '280px',
                    minHeight   : '200px',
                    overflow    : 'hidden',
                }),
                new Rule('.ar-m3p__addbar', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 8px',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-m3p__addlabel', {
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-m3p__addbar select', {
                    flex: '1',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '3px 6px',
                    font: '11px sans-serif',
                    borderRadius: '2px',
                }),
                new Rule('.ar-m3p__stack', { flex: '1', overflowY: 'auto' }),
                new Rule('.ar-m3p__row', {
                    borderBottom: '1px solid var(--arianna-bg-3, #f3f3f3)',
                    cursor: 'pointer',
                }),
                new Rule('.ar-m3p__row--disabled .ar-m3p__lbl', { opacity: '0.4' }),
                new Rule('.ar-m3p__head', {
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '5px 8px',
                }),
                new Rule('.ar-m3p__row:hover .ar-m3p__head', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-m3p__row--expanded .ar-m3p__head', {
                    background: 'rgba(31,111,235,0.06)',
                }),
                new Rule('.ar-m3p__toggle', {
                    width: '18px', height: '18px',
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '11px',
                }),
                new Rule('.ar-m3p__icon', { fontSize: '13px' }),
                new Rule('.ar-m3p__lbl', { flex: '1' }),
                new Rule('.ar-m3p__small-btn', {
                    width: '20px', height: '20px',
                    background: 'transparent',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-muted, #6e6b62)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '10px',
                }),
                new Rule('.ar-m3p__small-btn:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-m3p__small-btn--danger:hover', {
                    background: 'var(--arianna-danger, #cf222e)',
                    borderColor: 'var(--arianna-danger, #cf222e)',
                    color: '#fff',
                }),
                new Rule('.ar-m3p__params', {
                    padding: '6px 12px 10px 28px',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-m3p__pfield', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                }),
                new Rule('.ar-m3p__pfield span', {
                    width: '70px',
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-m3p__pfield input[type="text"], .ar-m3p__pfield input[type="number"]', {
                    flex: '1',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '2px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '2px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Modifiers3DPalette', {
        value: Modifiers3DPalette, writable: false, enumerable: false, configurable: false,
    });
}

export default Modifiers3DPalette;
