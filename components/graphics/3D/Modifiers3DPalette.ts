/**
 * @module    components/graphics/3D/Modifiers3DPalette
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Modifiers3DPalette component module.
 */

import { Component, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   Modifiers3DPalette
 *  @public
 *  @description Namespace containing Modifiers3DPalette contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Modifiers3DPalette
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        ModifierKind
         *  @public
         *  @type        {'bend' | 'twist' | 'taper' | 'mirror' | 'array' | 'displace' | 'wave' | 'shear' | 'lattice' | 'smooth' | 'decimate' | 'subdivide' | 'boolean' | 'extrude-2d'}
         *  @description Type alias for ModifierKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ModifierKind = 'bend' | 'twist' | 'taper' | 'mirror' | 'array' | 'displace' | 'wave' | 'shear' | 'lattice' | 'smooth' | 'decimate' | 'subdivide' | 'boolean' | 'extrude-2d';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ModifierEntry
         *  @public
         *  @description ModifierEntry contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ModifierEntry
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        kind
             *  @public
             *  @type        {Modifiers3DPalette.Types.ModifierKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: Types.ModifierKind;

            /** @name        enabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for enabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            enabled: boolean;

            /** @name        params
             *  @public
             *  @type        {Record<string, number | string | boolean>}
             *  @description Component member for params.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            params: Record<string, number | string | boolean>;
        }

        /** @interface   Modifiers3DPaletteOptions
         *  @public
         *  @description Modifiers3DPaletteOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Modifiers3DPaletteOptions
        {
            /** @name        stack
             *  @public
             *  @type        {Modifiers3DPalette.Interfaces.ModifierEntry[]}
             *  @description Component member for stack.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            stack?: Interfaces.ModifierEntry[];
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        KIND_INFO
     *  @public
     *  @type        {Array<{
        kind: Modifiers3DPalette.Types.ModifierKind;
        label: string;
        icon: string;
    }>}
     *  @description Namespace-owned KIND_INFO value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const KIND_INFO: Array<{
        /** @name        kind
         *  @public
         *  @type        {Modifiers3DPalette.Types.ModifierKind}
         *  @description Component member for kind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        kind: Types.ModifierKind;

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        label: string;

        /** @name        icon
         *  @public
         *  @type        {string}
         *  @description Component member for icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        icon: string;
    }> = [
        { kind: 'bend', label: 'Bend', icon: '⏜' },
        { kind: 'twist', label: 'Twist', icon: '⌇' },
        { kind: 'taper', label: 'Taper', icon: '◣' },
        { kind: 'mirror', label: 'Mirror', icon: '⇋' },
        { kind: 'array', label: 'Array', icon: '▦' },
        { kind: 'displace', label: 'Displace', icon: '∿' },
        { kind: 'wave', label: 'Wave', icon: '〰' },
        { kind: 'shear', label: 'Shear', icon: '◢' },
        { kind: 'lattice', label: 'Lattice', icon: '⊞' },
        { kind: 'smooth', label: 'Smooth', icon: '◔' },
        { kind: 'decimate', label: 'Decimate', icon: '◣' },
        { kind: 'subdivide', label: 'Subdivide', icon: '⊕' },
        { kind: 'boolean', label: 'Boolean', icon: '◐' },
        { kind: 'extrude-2d', label: 'Extrude 2D', icon: '⬚' },
    ];

    /** @name        DEFAULT_PARAMS
     *  @public
     *  @type        {Record<Modifiers3DPalette.Types.ModifierKind, Record<string, number | string | boolean>>}
     *  @description Namespace-owned DEFAULT_PARAMS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DEFAULT_PARAMS: Record<Types.ModifierKind, Record<string, number | string | boolean>> = {
        bend: { angle: 90, axis: 'y' },
        twist: { angle: 45, axis: 'y' },
        taper: { factor: 0.5, axis: 'y' },
        mirror: { axis: 'x' },
        array: { count: 3, offsetX: 1, offsetY: 0, offsetZ: 0 },
        displace: { strength: 0.5 },
        wave: { amplitude: 0.2, frequency: 2 },
        shear: { x: 0, y: 0, z: 0 },
        lattice: { rows: 3, cols: 3 },
        smooth: { iterations: 1 },
        decimate: { ratio: 0.5 },
        subdivide: { levels: 1 },
        boolean: { op: 'union' },
        'extrude-2d': { depth: 1, bevel: 0 },
    };

    /** @name        modCounter
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned modCounter value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let modCounter = 0;

    /** @name        newModId
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned newModId value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const newModId = () => `M${++modCounter}`;

    /** @class       Modifiers3DPalette
     *  @public
     *  @description AriannA Modifiers3DPalette component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-modifiers-3d-palette', {}, {
        Attributes: [],
    })
    export class Modifiers3DPalette extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        stack$
         *  @public
         *  @type        {Modifiers3DPalette.Types.Signal<Modifiers3DPalette.Interfaces.ModifierEntry[]>}
         *  @description Component member for stack$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        stack$: Types.Signal<Interfaces.ModifierEntry[]> = signal<Interfaces.ModifierEntry[]>([]);

        /** @name        expanded$
         *  @public
         *  @type        {Modifiers3DPalette.Types.Signal<string | null>}
         *  @description Component member for expanded$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expanded$: Types.Signal<string | null> = signal<string | null>(null);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Modifiers3DPalette.Interfaces.Modifiers3DPaletteOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.Modifiers3DPaletteOptions = {})
        {
            this.stackList = () => {
                /** @name        exp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned exp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const exp = this.expanded$.Get();
                return this.stack$.Get().map((m: any) => ({
                    id: m.id,
                    kind: m.kind,
                    label: KIND_INFO.find(k => k.kind === m.kind)?.label ?? m.kind,
                    icon: KIND_INFO.find(k => k.kind === m.kind)?.icon ?? '◆',
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
                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = e.currentTarget as HTMLButtonElement;

                /** @name        kind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kind = btn.dataset.kind as Types.ModifierKind;
                if (kind)
                    this.addModifier({ kind });
            };
            this.onToggleEnable = (e: Event) => {
                e.stopPropagation();

                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = e.currentTarget as HTMLElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = btn.dataset.id;
                if (id)
                    this.toggleEnable(id);
            };
            this.onRowClick = (e: Event) => {
                /** @name        row
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned row value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const row = e.currentTarget as HTMLElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = row.dataset.id;
                if (!id)
                    return;
                this.expanded$.Set(this.expanded$.Get() === id ? null : id);
            };
            this.onRemove = (e: Event) => {
                e.stopPropagation();

                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = e.currentTarget as HTMLElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = btn.dataset.id;
                if (id)
                    this.removeModifier(id);
            };
            this.onMoveUp = (e: Event) => {
                e.stopPropagation();

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = (e.currentTarget as HTMLElement).dataset.id;
                if (id)
                    this.moveModifier(id, -1);
            };
            this.onMoveDown = (e: Event) => {
                e.stopPropagation();

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = (e.currentTarget as HTMLElement).dataset.id;
                if (id)
                    this.moveModifier(id, 1);
            };
            this.onParamChange = (e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = inp.dataset.id;

                /** @name        key
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned key value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const key = inp.dataset.key;
                if (!id || !key)
                    return;

                /** @name        value
                 *  @public
                 *  @type        {number | string | boolean}
                 *  @description Namespace-owned value value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let value: number | string | boolean;
                if (inp.type === 'number')
                    value = parseFloat(inp.value);
                else if (inp.type === 'checkbox')
                    value = inp.checked;
                else
                    value = inp.value;
                this.updateParam(id, key, value);
            };
            this.template = html `
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
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = e.target as HTMLSelectElement;

                /** @name        kind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kind = sel.value as Types.ModifierKind;
                if (kind)
                    this.addModifier({ kind });
                sel.value = '';
            };
            // bind missing entry in handler bag — keep compat with template
            this.onAddClick;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Modifiers3DPalette.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Modifiers3DPalette.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        addModifier
         *  @public
         *  @type        {Modifiers3DPalette.Interfaces.ModifierEntry}
         *  @description Component member for add Modifier.
         *  @param       {{
            kind: Modifiers3DPalette.Types.ModifierKind;
            params?: Record<string, number | string | boolean>;
            enabled?: boolean;
        }} opts Parameter.
         *  @returns     {Modifiers3DPalette.Interfaces.ModifierEntry} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addModifier(opts: {
            /** @name        kind
             *  @public
             *  @type        {Modifiers3DPalette.Types.ModifierKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: Types.ModifierKind;

            /** @name        params
             *  @public
             *  @type        {Record<string, number | string | boolean>}
             *  @description Component member for params.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            params?: Record<string, number | string | boolean>;

            /** @name        enabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for enabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            enabled?: boolean;
        }): Interfaces.ModifierEntry {
            /** @name        entry
             *  @public
             *  @type        {Modifiers3DPalette.Interfaces.ModifierEntry}
             *  @description Namespace-owned entry value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const entry: Interfaces.ModifierEntry = {
                id: newModId(),
                kind: opts.kind,
                enabled: opts.enabled ?? true,
                params: { ...DEFAULT_PARAMS[opts.kind], ...(opts.params ?? {}) },
            };

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = this.stack$.Get().slice();
            next.push(entry);
            this.stack$.Set(next);
            this.expanded$.Set(entry.id);
            this.#fire();
            return entry;
        }

        /** @name        removeModifier
         *  @public
         *  @type        {this}
         *  @description Component member for remove Modifier.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeModifier(id: string): this
        {
            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = this.stack$.Get().filter((m: any) => m.id !== id);
            this.stack$.Set(next);
            if (this.expanded$.Get() === id)
                this.expanded$.Set(null);
            this.#fire();
            return this;
        }

        /** @name        toggleEnable
         *  @public
         *  @type        {this}
         *  @description Component member for toggle Enable.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggleEnable(id: string): this
        {
            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = this.stack$.Get().map((m: any) => m.id === id ? { ...m, enabled: !m.enabled } : m);
            this.stack$.Set(next);
            this.#fire();
            return this;
        }

        /** @name        moveModifier
         *  @public
         *  @type        {this}
         *  @description Component member for move Modifier.
         *  @param       {string} id Parameter.
         *  @param       {-1 | 1} dir Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        moveModifier(id: string, dir: -1 | 1): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.stack$.Get();

            /** @name        idx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned idx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const idx = cur.findIndex((m: any) => m.id === id);
            if (idx === -1)
                return this;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = cur.slice();

            /** @name        target
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned target value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const target = idx + dir;
            if (target < 0 || target >= next.length)
                return this;

            /** @name        [moved]
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned [moved] value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const [moved] = next.splice(idx, 1);
            next.splice(target, 0, moved!);
            this.stack$.Set(next);
            this.#fire();
            return this;
        }

        /** @name        updateParam
         *  @public
         *  @type        {this}
         *  @description Component member for update Param.
         *  @param       {string} id Parameter.
         *  @param       {string} key Parameter.
         *  @param       {number | string | boolean} value Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        updateParam(id: string, key: string, value: number | string | boolean): this
        {
            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = this.stack$.Get().map((m: any) => m.id === id ? { ...m, params: { ...m.params, [key]: value } } : m);
            this.stack$.Set(next);
            this.#fire();
            return this;
        }

        /** @name        setStack
         *  @public
         *  @type        {this}
         *  @description Component member for set Stack.
         *  @param       {Modifiers3DPalette.Interfaces.ModifierEntry[]} stack Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setStack(stack: Interfaces.ModifierEntry[]): this
        {
            this.stack$.Set(stack.map(m => ({ ...m, params: { ...m.params } })));
            this.#fire();
            return this;
        }

        /** @name        getStack
         *  @public
         *  @type        {Modifiers3DPalette.Interfaces.ModifierEntry[]}
         *  @description Component member for get Stack.
         *  @returns     {Modifiers3DPalette.Interfaces.ModifierEntry[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getStack(): Interfaces.ModifierEntry[]
        {
            return this.stack$.Get().map((m: any) => ({ ...m, params: { ...m.params } }));
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        #fire
         *  @public
         *  @type        {void}
         *  @description Component member for fire.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fire(): void
        {
            this.dispatchEvent(new CustomEvent('arianna:modifiers-change', {
                bubbles: true, detail: { stack: this.getStack() },
            }));
        }

        /** @name        stackList
         *  @private
         *  @type        {() => Array<{
            id: string;
            kind: Modifiers3DPalette.Types.ModifierKind;
            label: string;
            icon: string;
            enabled: boolean;
            expanded: boolean;
            rowCls: string;
            params: Array<{
                key: string;
                val: string;
                isNumber: boolean;
                isBoolean: boolean;
            }>;
        }>}
         *  @description Component member for stack List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private stackList: () => Array<{
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        kind
             *  @public
             *  @type        {Modifiers3DPalette.Types.ModifierKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: Types.ModifierKind;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;

            /** @name        enabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for enabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            enabled: boolean;

            /** @name        expanded
             *  @public
             *  @type        {boolean}
             *  @description Component member for expanded.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expanded: boolean;

            /** @name        rowCls
             *  @public
             *  @type        {string}
             *  @description Component member for row Cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rowCls: string;

            /** @name        params
             *  @public
             *  @type        {Array<{
                key: string;
                val: string;
                isNumber: boolean;
                isBoolean: boolean;
            }>}
             *  @description Component member for params.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            params: Array<{
                /** @name        key
                 *  @public
                 *  @type        {string}
                 *  @description Component member for key.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                key: string;

                /** @name        val
                 *  @public
                 *  @type        {string}
                 *  @description Component member for val.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                val: string;

                /** @name        isNumber
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for is Number.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                isNumber: boolean;

                /** @name        isBoolean
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for is Boolean.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                isBoolean: boolean;
            }>;
        }> = () => [];

        /** @name        addKinds
         *  @private
         *  @type        {() => typeof Modifiers3DPalette.KIND_INFO}
         *  @description Component member for add Kinds.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private addKinds: () => typeof KIND_INFO = () => KIND_INFO;

        /** @name        onAddClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Add Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAddClick: (e: Event) => void = () => { };

        /** @name        onAddSelect
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Add Select.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAddSelect: (e: Event) => void = () => { };

        /** @name        onToggleEnable
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Toggle Enable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggleEnable: (e: Event) => void = () => { };

        /** @name        onRowClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Row Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRowClick: (e: Event) => void = () => { };

        /** @name        onRemove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Remove.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRemove: (e: Event) => void = () => { };

        /** @name        onMoveUp
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Move Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onMoveUp: (e: Event) => void = () => { };

        /** @name        onMoveDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Move Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onMoveDown: (e: Event) => void = () => { };

        /** @name        onParamChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Param Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onParamChange: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Modifiers3DPalette.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Modifiers3DPalette.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
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
                    width: '280px',
                    minHeight: '200px',
                    overflow: 'hidden',
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
            ]);
        }
    }
}
export default Modifiers3DPalette;

export type ModifierKind = Modifiers3DPalette.Types.ModifierKind;
export type ModifierEntry = Modifiers3DPalette.Interfaces.ModifierEntry;
export type Modifiers3DPaletteOptions = Modifiers3DPalette.Interfaces.Modifiers3DPaletteOptions;
