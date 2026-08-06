/**
 * @module    components/graphics/2D/LayersPanel
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA LayersPanel component module.
 */

import { Component, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   LayersPanel
 *  @public
 *  @description Namespace containing LayersPanel contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace LayersPanel
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
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   Layer
         *  @public
         *  @description Layer contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Layer
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        visible
             *  @public
             *  @type        {boolean}
             *  @description Component member for visible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            visible: boolean;

            /** @name        locked
             *  @public
             *  @type        {boolean}
             *  @description Component member for locked.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            locked: boolean;

            /** @name        opacity
             *  @public
             *  @type        {number}
             *  @description Component member for opacity.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            opacity?: number; // 0..1
            /** @name        expanded
             *  @public
             *  @type        {boolean}
             *  @description Component member for expanded.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expanded?: boolean;

            /** @name        children
             *  @public
             *  @type        {LayersPanel.Interfaces.Layer[]}
             *  @description Component member for children.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            children?: Interfaces.Layer[];
        }

        /** @interface   FlatLayer
         *  @public
         *  @description FlatLayer contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FlatLayer
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        visible
             *  @public
             *  @type        {boolean}
             *  @description Component member for visible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            visible: boolean;

            /** @name        locked
             *  @public
             *  @type        {boolean}
             *  @description Component member for locked.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            locked: boolean;

            /** @name        opacity
             *  @public
             *  @type        {number}
             *  @description Component member for opacity.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            opacity: number;

            /** @name        expanded
             *  @public
             *  @type        {boolean}
             *  @description Component member for expanded.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expanded: boolean;

            /** @name        hasKids
             *  @public
             *  @type        {boolean}
             *  @description Component member for has Kids.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hasKids: boolean;

            /** @name        depth
             *  @public
             *  @type        {number}
             *  @description Component member for depth.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            depth: number;
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

    /** @name        layerCounter
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned layerCounter value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let layerCounter = 0;

    /** @name        newLayerId
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned newLayerId value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const newLayerId = () => `L${++layerCounter}`;

    /** @class       LayersPanel
     *  @public
     *  @description AriannA LayersPanel component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-layers-panel', {}, {
        Attributes: [],
    })
    export class LayersPanel extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        layers$
         *  @public
         *  @type        {LayersPanel.Types.Signal<LayersPanel.Interfaces.Layer[]>}
         *  @description Component member for layers$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        layers$: Types.Signal<Interfaces.Layer[]> = signal<Interfaces.Layer[]>([
            { id: newLayerId(), name: 'Layer 1', visible: true, locked: false },
        ]);

        /** @name        selected$
         *  @public
         *  @type        {LayersPanel.Types.Signal<string | null>}
         *  @description Component member for selected$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected$: Types.Signal<string | null> = signal<string | null>(null);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected()
        {
            this.flatLayers = (): Interfaces.FlatLayer[] => {
                /** @name        out
                 *  @public
                 *  @type        {LayersPanel.Interfaces.FlatLayer[]}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Interfaces.FlatLayer[] = [];

                /** @name        walk
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned walk value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const walk = (list: Interfaces.Layer[], depth: number) => {
                    for (const l of list)
                    {
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
            this.rowCls = (l: Interfaces.FlatLayer): string => 'ar-lp__row'
                + (this.selected$.Get() === l.id ? ' ar-lp__row--sel' : '')
                + (l.locked ? ' ar-lp__row--locked' : '')
                + (!l.visible ? ' ar-lp__row--hidden' : '');
            this.indentStyle = (l: Interfaces.FlatLayer): string => `padding-left: ${l.depth * 14 + 6}px`;
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
                if (id)
                    this.selectLayer(id);
            };
            this.onToggleVis = (e: Event) => {
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
                    this.toggleVisibility(id);
            };
            this.onToggleLock = (e: Event) => {
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
                    this.toggleLock(id);
            };
            this.onToggleExpand = (e: Event) => {
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
                    this.toggleExpand(id);
            };
            this.onAdd = () => this.addLayer({ name: `Layer ${this.layers$.Get().length + 1}` });
            this.onRemove = () => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();
                if (sel)
                    this.removeLayer(sel);
            };
            this.onMoveUp = () => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();
                if (sel)
                    this.moveLayer(sel, -1);
            };
            this.onMoveDown = () => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
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
                /** @name        Sheet
                 *  @public
                 *  @type        {LayersPanel.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = LayersPanel.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setLayers
         *  @public
         *  @type        {this}
         *  @description Component member for set Layers.
         *  @param       {LayersPanel.Interfaces.Layer[]} layers Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setLayers(layers: Interfaces.Layer[]): this
        {
            this.layers$.Set(layers.map(l => this.#cloneLayer(l)));
            if (this.selected$.Get() && !this.#findById(this.selected$.Get()!))
                this.selected$.Set(null);
            this.#fireChange();
            return this;
        }

        /** @name        getLayers
         *  @public
         *  @type        {LayersPanel.Interfaces.Layer[]}
         *  @description Component member for get Layers.
         *  @returns     {LayersPanel.Interfaces.Layer[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getLayers(): Interfaces.Layer[]
        {
            return this.layers$.Get().map((l: any) => this.#cloneLayer(l));
        }

        /** @name        selectLayer
         *  @public
         *  @type        {this}
         *  @description Component member for select Layer.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selectLayer(id: string): this
        {
            this.selected$.Set(id);
            this.dispatchEvent(new CustomEvent('arianna:layer-select', {
                bubbles: true, detail: { id, layer: this.#findById(id) },
            }));
            return this;
        }

        /** @name        getSelected
         *  @public
         *  @type        {string | null}
         *  @description Component member for get Selected.
         *  @returns     {string | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getSelected(): string | null { return this.selected$.Get(); }

        /** @name        addLayer
         *  @public
         *  @type        {LayersPanel.Interfaces.Layer}
         *  @description Component member for add Layer.
         *  @param       {Partial<LayersPanel.Interfaces.Layer>} partial Parameter.
         *  @returns     {LayersPanel.Interfaces.Layer} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addLayer(partial: Partial<Interfaces.Layer>): Interfaces.Layer
        {
            /** @name        l
             *  @public
             *  @type        {LayersPanel.Interfaces.Layer}
             *  @description Namespace-owned l value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const l: Interfaces.Layer = {
                id: partial.id ?? newLayerId(),
                name: partial.name ?? 'New Layer',
                visible: partial.visible ?? true,
                locked: partial.locked ?? false,
                opacity: partial.opacity ?? 1,
                ...(partial.children ? { children: partial.children.map(c => this.#cloneLayer(c)) } : {}),
            };

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = this.layers$.Get().slice();
            next.push(l);
            this.layers$.Set(next);
            this.selected$.Set(l.id);
            this.#fireChange();
            return l;
        }

        /** @name        removeLayer
         *  @public
         *  @type        {this}
         *  @description Component member for remove Layer.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeLayer(id: string): this
        {
            /** @name        removeIn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned removeIn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const removeIn = (list: Interfaces.Layer[]): Interfaces.Layer[] => {
                return list.filter(l => {
                    if (l.id === id)
                        return false;
                    if (l.children)
                        l.children = removeIn(l.children);
                    return true;
                });
            };

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = removeIn(this.layers$.Get().slice());
            this.layers$.Set(next);
            if (this.selected$.Get() === id)
                this.selected$.Set(null);
            this.#fireChange();
            return this;
        }

        /** @name        toggleVisibility
         *  @public
         *  @type        {this}
         *  @description Component member for toggle Visibility.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggleVisibility(id: string): this
        {
            this.#updateLayer(id, l => ({ ...l, visible: !l.visible }));
            return this;
        }

        /** @name        toggleLock
         *  @public
         *  @type        {this}
         *  @description Component member for toggle Lock.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggleLock(id: string): this
        {
            this.#updateLayer(id, l => ({ ...l, locked: !l.locked }));
            return this;
        }

        /** @name        toggleExpand
         *  @public
         *  @type        {this}
         *  @description Component member for toggle Expand.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggleExpand(id: string): this
        {
            this.#updateLayer(id, l => ({ ...l, expanded: !(l.expanded ?? true) }));
            return this;
        }

        /** @name        setName
         *  @public
         *  @type        {this}
         *  @description Component member for set Name.
         *  @param       {string} id Parameter.
         *  @param       {string} name Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setName(id: string, name: string): this
        {
            this.#updateLayer(id, l => ({ ...l, name }));
            return this;
        }

        /** @name        setOpacity
         *  @public
         *  @type        {this}
         *  @description Component member for set Opacity.
         *  @param       {string} id Parameter.
         *  @param       {number} opacity Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setOpacity(id: string, opacity: number): this
        {
            this.#updateLayer(id, l => ({ ...l, opacity: Math.max(0, Math.min(1, opacity)) }));
            return this;
        }

        /** @name        moveLayer
         *  @public
         *  @type        {this}
         *  @description Component member for move Layer.
         *  @param       {string} id Parameter.
         *  @param       {-1 | 1} dir Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        moveLayer(id: string, dir: -1 | 1): this
        {
            // Only moves at the top level for simplicity
            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = this.layers$.Get().slice();

            /** @name        idx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned idx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const idx = list.findIndex((l: any) => l.id === id);
            if (idx === -1)
                return this;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = idx + dir;
            if (next < 0 || next >= list.length)
                return this;

            /** @name        [moved]
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned [moved] value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const [moved] = list.splice(idx, 1);
            list.splice(next, 0, moved!);
            this.layers$.Set(list);
            this.#fireChange();
            return this;
        }

        /** @name        #cloneLayer
         *  @public
         *  @type        {LayersPanel.Interfaces.Layer}
         *  @description Component member for clone Layer.
         *  @param       {LayersPanel.Interfaces.Layer} l Parameter.
         *  @returns     {LayersPanel.Interfaces.Layer} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #cloneLayer(l: Interfaces.Layer): Interfaces.Layer
        {
            return {
                id: l.id, name: l.name,
                visible: l.visible, locked: l.locked,
                opacity: l.opacity, expanded: l.expanded,
                ...(l.children ? { children: l.children.map(c => this.#cloneLayer(c)) } : {}),
            };
        }

        /** @name        #findById
         *  @public
         *  @type        {LayersPanel.Interfaces.Layer | null}
         *  @description Component member for find By Id.
         *  @param       {string} id Parameter.
         *  @returns     {LayersPanel.Interfaces.Layer | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #findById(id: string): Interfaces.Layer | null
        {
            /** @name        walk
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned walk value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const walk = (list: Interfaces.Layer[]): Interfaces.Layer | null => {
                for (const l of list)
                {
                    if (l.id === id)
                        return l;
                    if (l.children)
                    {
                        /** @name        f
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned f value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const f = walk(l.children);
                        if (f)
                            return f;
                    }
                }
                return null;
            };
            return walk(this.layers$.Get());
        }

        /** @name        #updateLayer
         *  @public
         *  @type        {void}
         *  @description Component member for update Layer.
         *  @param       {string} id Parameter.
         *  @param       {(l: LayersPanel.Interfaces.Layer) => LayersPanel.Interfaces.Layer} patch Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #updateLayer(id: string, patch: (l: Interfaces.Layer) => Interfaces.Layer): void
        {
            /** @name        walk
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned walk value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const walk = (list: Interfaces.Layer[]): Interfaces.Layer[] => list.map(l => {
                if (l.id === id)
                    return patch(l);
                if (l.children)
                    return { ...l, children: walk(l.children) };
                return l;
            });
            this.layers$.Set(walk(this.layers$.Get()));
            this.#fireChange();
        }

        /** @name        #fireChange
         *  @public
         *  @type        {void}
         *  @description Component member for fire Change.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fireChange(): void
        {
            this.dispatchEvent(new CustomEvent('arianna:layers-change', {
                bubbles: true, detail: { layers: this.getLayers() },
            }));
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

        /** @name        flatLayers
         *  @private
         *  @type        {() => LayersPanel.Interfaces.FlatLayer[]}
         *  @description Component member for flat Layers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private flatLayers: () => Interfaces.FlatLayer[] = () => [];

        /** @name        rowCls
         *  @private
         *  @type        {(l: LayersPanel.Interfaces.FlatLayer) => string}
         *  @description Component member for row Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private rowCls: (l: Interfaces.FlatLayer) => string = () => '';

        /** @name        indentStyle
         *  @private
         *  @type        {(l: LayersPanel.Interfaces.FlatLayer) => string}
         *  @description Component member for indent Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private indentStyle: (l: Interfaces.FlatLayer) => string = () => '';

        /** @name        onRowClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Row Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRowClick: (e: Event) => void = () => { };

        /** @name        onToggleVis
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Toggle Vis.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggleVis: (e: Event) => void = () => { };

        /** @name        onToggleLock
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Toggle Lock.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggleLock: (e: Event) => void = () => { };

        /** @name        onToggleExpand
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Toggle Expand.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToggleExpand: (e: Event) => void = () => { };

        /** @name        onAdd
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Add.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAdd: (e: Event) => void = () => { };

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

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {LayersPanel.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {LayersPanel.Types.Stylesheet} Result.
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
}
export default LayersPanel;

export type Layer = LayersPanel.Interfaces.Layer;
