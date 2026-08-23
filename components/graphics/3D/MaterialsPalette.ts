/**
 * @module    components/graphics/3D/MaterialsPalette
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA MaterialsPalette component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/definitions/Interfaces.ts';

/** @namespace   MaterialsPalette
 *  @public
 *  @description Namespace containing MaterialsPalette contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace MaterialsPalette
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

        /** @name        MaterialKind
         *  @public
         *  @type        {'basic' | 'lambert' | 'phong' | 'standard' | 'physical' | 'toon' | 'normal' | 'wireframe'}
         *  @description Type alias for MaterialKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type MaterialKind = 'basic' | 'lambert' | 'phong' | 'standard' | 'physical' | 'toon' | 'normal' | 'wireframe';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   MaterialDef
         *  @public
         *  @description MaterialDef contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MaterialDef
        {
            /** @name        kind
             *  @public
             *  @type        {MaterialsPalette.Types.MaterialKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: Types.MaterialKind;

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;

            /** @name        emissive
             *  @public
             *  @type        {string}
             *  @description Component member for emissive.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            emissive?: string;

            /** @name        opacity
             *  @public
             *  @type        {number}
             *  @description Component member for opacity.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            opacity?: number;

            /** @name        metalness
             *  @public
             *  @type        {number}
             *  @description Component member for metalness.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            metalness?: number;

            /** @name        roughness
             *  @public
             *  @type        {number}
             *  @description Component member for roughness.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            roughness?: number;

            /** @name        clearcoat
             *  @public
             *  @type        {number}
             *  @description Component member for clearcoat.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clearcoat?: number;

            /** @name        transmission
             *  @public
             *  @type        {number}
             *  @description Component member for transmission.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            transmission?: number;

            /** @name        ior
             *  @public
             *  @type        {number}
             *  @description Component member for ior.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ior?: number;

            /** @name        shininess
             *  @public
             *  @type        {number}
             *  @description Component member for shininess.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            shininess?: number;

            /** @name        side
             *  @public
             *  @type        {'front' | 'back' | 'double'}
             *  @description Component member for side.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            side?: 'front' | 'back' | 'double';

            /** @name        flatShading
             *  @public
             *  @type        {boolean}
             *  @description Component member for flat Shading.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            flatShading?: boolean;

            /** @name        wireframe
             *  @public
             *  @type        {boolean}
             *  @description Component member for wireframe.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            wireframe?: boolean;
        }

        /** @interface   MaterialsPaletteOptions
         *  @public
         *  @description MaterialsPaletteOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MaterialsPaletteOptions
        {
            /** @name        kind
             *  @public
             *  @type        {MaterialsPalette.Types.MaterialKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind?: Types.MaterialKind;
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
        kind: MaterialsPalette.Types.MaterialKind;
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
         *  @type        {MaterialsPalette.Types.MaterialKind}
         *  @description Component member for kind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        kind: Types.MaterialKind;

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
        { kind: 'basic', label: 'Basic', icon: '◻' },
        { kind: 'lambert', label: 'Lambert', icon: '◐' },
        { kind: 'phong', label: 'Phong', icon: '◓' },
        { kind: 'standard', label: 'Standard', icon: '◆' },
        { kind: 'physical', label: 'Physical', icon: '◈' },
        { kind: 'toon', label: 'Toon', icon: '◖' },
        { kind: 'normal', label: 'Normal', icon: '⬢' },
        { kind: 'wireframe', label: 'Wireframe', icon: '⊞' },
    ];

    /** @name        DEFAULTS
     *  @public
     *  @type        {Record<MaterialsPalette.Types.MaterialKind, MaterialsPalette.Interfaces.MaterialDef>}
     *  @description Namespace-owned DEFAULTS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DEFAULTS: Record<Types.MaterialKind, Interfaces.MaterialDef> = {
        basic: { kind: 'basic', color: '#cccccc', opacity: 1 },
        lambert: { kind: 'lambert', color: '#cccccc', emissive: '#000000', opacity: 1 },
        phong: { kind: 'phong', color: '#cccccc', emissive: '#000000', shininess: 30, opacity: 1 },
        standard: { kind: 'standard', color: '#cccccc', emissive: '#000000', metalness: 0, roughness: 0.5, opacity: 1 },
        physical: { kind: 'physical', color: '#cccccc', emissive: '#000000', metalness: 0, roughness: 0.5, clearcoat: 0, transmission: 0, ior: 1.5, opacity: 1 },
        toon: { kind: 'toon', color: '#cccccc', emissive: '#000000', opacity: 1 },
        normal: { kind: 'normal' },
        wireframe: { kind: 'wireframe', color: '#cccccc', wireframe: true, opacity: 1 },
    };

    /** @class       MaterialsPalette
     *  @public
     *  @description AriannA MaterialsPalette component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-materials-palette', {}, {
        Attributes: ['kind'],
    })
    export class MaterialsPalette extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        material$
         *  @public
         *  @type        {MaterialsPalette.Types.Signal<MaterialsPalette.Interfaces.MaterialDef>}
         *  @description Component member for material$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        material$: Types.Signal<Interfaces.MaterialDef> = signal<Interfaces.MaterialDef>(DEFAULTS.standard);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {MaterialsPalette.Interfaces.MaterialsPaletteOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.MaterialsPaletteOptions = {})
        {
            /** @name        kindAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned kindAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const kindAttr = this.signal().attribute('kind');
            this.kinds = () => {
                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = kindAttr.Get() ?? 'standard';
                return KIND_INFO.map(k => ({
                    kind: k.kind,
                    label: k.label,
                    icon: k.icon,
                    cls: 'ar-mat__kind' + (cur === k.kind ? ' ar-mat__kind--active' : ''),
                }));
            };
            this.curKind = (): Types.MaterialKind => (kindAttr.Get() as Types.MaterialKind) ?? 'standard';
            this.hasColor = () => !['normal'].includes(this.curKind());
            this.hasEmissive = () => ['lambert', 'phong', 'standard', 'physical', 'toon'].includes(this.curKind());
            this.hasMetalness = () => ['standard', 'physical'].includes(this.curKind());
            this.hasRoughness = () => ['standard', 'physical'].includes(this.curKind());
            this.hasClearcoat = () => this.curKind() === 'physical';
            this.hasTransmission = () => this.curKind() === 'physical';
            this.hasShininess = () => this.curKind() === 'phong';
            this.hasIor = () => this.curKind() === 'physical';
            this.colorVal = () => this.material$.Get().color ?? '#cccccc';
            this.emissiveVal = () => this.material$.Get().emissive ?? '#000000';
            this.opacityVal = () => String(this.material$.Get().opacity ?? 1);
            this.metalnessVal = () => String(this.material$.Get().metalness ?? 0);
            this.roughnessVal = () => String(this.material$.Get().roughness ?? 0.5);
            this.clearcoatVal = () => String(this.material$.Get().clearcoat ?? 0);
            this.transmissionVal = () => String(this.material$.Get().transmission ?? 0);
            this.shininessVal = () => String(this.material$.Get().shininess ?? 30);
            this.iorVal = () => String(this.material$.Get().ior ?? 1.5);
            this.onKindClick = (e: Event) => {
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
                const kind = btn.dataset.kind as Types.MaterialKind;
                if (kind)
                    this.setKind(kind);
            };
            this.onParam = (e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;

                /** @name        param
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned param value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const param = inp.dataset.param;
                if (!param)
                    return;

                /** @name        v
                 *  @public
                 *  @type        {string | number}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v: string | number = inp.type === 'number' || inp.type === 'range'
                    ? parseFloat(inp.value)
                    : inp.value;
                this.setParam(param as keyof Interfaces.MaterialDef, v);
            };
            this.template = html `
            <div class="ar-mat__kinds">
                <button type="button" a-for="k in this.kinds()"
                        :class="k.cls"
                        :data-kind="k.kind"
                        :title="k.label"
                        @click="this.onKindClick">
                    <span class="ar-mat__kind-icon">{{ k.icon }}</span>
                    <span class="ar-mat__kind-lbl">{{ k.label }}</span>
                </button>
            </div>
            <div class="ar-mat__params">
                <label class="ar-mat__field" a-if="this.hasColor()">
                    <span>Color</span>
                    <input type="color" data-param="color" :value="this.colorVal()" @input="this.onParam"/>
                    <input type="text"  data-param="color" :value="this.colorVal()" @change="this.onParam"/>
                </label>
                <label class="ar-mat__field" a-if="this.hasEmissive()">
                    <span>Emissive</span>
                    <input type="color" data-param="emissive" :value="this.emissiveVal()" @input="this.onParam"/>
                </label>
                <label class="ar-mat__field">
                    <span>Opacity</span>
                    <input type="range" data-param="opacity" min="0" max="1" step="0.01" :value="this.opacityVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.opacityVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasMetalness()">
                    <span>Metalness</span>
                    <input type="range" data-param="metalness" min="0" max="1" step="0.01" :value="this.metalnessVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.metalnessVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasRoughness()">
                    <span>Roughness</span>
                    <input type="range" data-param="roughness" min="0" max="1" step="0.01" :value="this.roughnessVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.roughnessVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasClearcoat()">
                    <span>Clearcoat</span>
                    <input type="range" data-param="clearcoat" min="0" max="1" step="0.01" :value="this.clearcoatVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.clearcoatVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasTransmission()">
                    <span>Transmission</span>
                    <input type="range" data-param="transmission" min="0" max="1" step="0.01" :value="this.transmissionVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.transmissionVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasIor()">
                    <span>IOR</span>
                    <input type="number" data-param="ior" min="1" max="2.4" step="0.05" :value="this.iorVal()" @change="this.onParam"/>
                </label>
                <label class="ar-mat__field" a-if="this.hasShininess()">
                    <span>Shininess</span>
                    <input type="range" data-param="shininess" min="0" max="200" step="1" :value="this.shininessVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.shininessVal() }}</span>
                </label>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {MaterialsPalette.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = MaterialsPalette.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setKind
         *  @public
         *  @type        {this}
         *  @description Component member for set Kind.
         *  @param       {MaterialsPalette.Types.MaterialKind} kind Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setKind(kind: Types.MaterialKind): this
        {
            this.setAttribute('kind', kind);
            // Reset material to defaults for the new kind, preserving common shared fields
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.material$.Get();

            /** @name        next
             *  @public
             *  @type        {MaterialsPalette.Interfaces.MaterialDef}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next: Interfaces.MaterialDef = { ...DEFAULTS[kind] };
            if (cur.color)
                next.color = cur.color;
            if (cur.opacity !== undefined)
                next.opacity = cur.opacity;
            this.material$.Set(next);
            this.#fire();
            return this;
        }

        /** @name        setParam
         *  @public
         *  @type        {this}
         *  @description Component member for set Param.
         *  @param       {keyof MaterialsPalette.Interfaces.MaterialDef} param Parameter.
         *  @param       {string | number | boolean} value Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setParam(param: keyof Interfaces.MaterialDef, value: string | number | boolean): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.material$.Get();
            this.material$.Set({ ...cur, [param]: value });
            this.#fire();
            return this;
        }

        /** @name        getMaterial
         *  @public
         *  @type        {MaterialsPalette.Interfaces.MaterialDef}
         *  @description Component member for get Material.
         *  @returns     {MaterialsPalette.Interfaces.MaterialDef} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getMaterial(): Interfaces.MaterialDef { return { ...this.material$.Get() }; }

        /** @name        setMaterial
         *  @public
         *  @type        {this}
         *  @description Component member for set Material.
         *  @param       {MaterialsPalette.Interfaces.MaterialDef} m Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMaterial(m: Interfaces.MaterialDef): this
        {
            if (m.kind)
                this.setAttribute('kind', m.kind);
            this.material$.Set({ ...m });
            this.#fire();
            return this;
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
            this.dispatchEvent(new CustomEvent('arianna:material-change', {
                bubbles: true, detail: this.getMaterial(),
            }));
        }

        /** @name        kinds
         *  @private
         *  @type        {() => Array<{
            kind: MaterialsPalette.Types.MaterialKind;
            label: string;
            icon: string;
            cls: string;
        }>}
         *  @description Component member for kinds.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private kinds: () => Array<{
            /** @name        kind
             *  @public
             *  @type        {MaterialsPalette.Types.MaterialKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: Types.MaterialKind;

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

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }> = () => [];

        /** @name        curKind
         *  @private
         *  @type        {() => MaterialsPalette.Types.MaterialKind}
         *  @description Component member for cur Kind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private curKind: () => Types.MaterialKind = () => 'standard';

        /** @name        hasColor
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Color.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasColor: () => boolean = () => true;

        /** @name        hasEmissive
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Emissive.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasEmissive: () => boolean = () => false;

        /** @name        hasMetalness
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Metalness.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasMetalness: () => boolean = () => false;

        /** @name        hasRoughness
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Roughness.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasRoughness: () => boolean = () => false;

        /** @name        hasClearcoat
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Clearcoat.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasClearcoat: () => boolean = () => false;

        /** @name        hasTransmission
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Transmission.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasTransmission: () => boolean = () => false;

        /** @name        hasShininess
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Shininess.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasShininess: () => boolean = () => false;

        /** @name        hasIor
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Ior.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasIor: () => boolean = () => false;

        /** @name        colorVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for color Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private colorVal: () => string = () => '#cccccc';

        /** @name        emissiveVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for emissive Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private emissiveVal: () => string = () => '#000000';

        /** @name        opacityVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for opacity Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private opacityVal: () => string = () => '1';

        /** @name        metalnessVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for metalness Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private metalnessVal: () => string = () => '0';

        /** @name        roughnessVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for roughness Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private roughnessVal: () => string = () => '0.5';

        /** @name        clearcoatVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for clearcoat Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private clearcoatVal: () => string = () => '0';

        /** @name        transmissionVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for transmission Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private transmissionVal: () => string = () => '0';

        /** @name        shininessVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for shininess Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private shininessVal: () => string = () => '30';

        /** @name        iorVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for ior Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private iorVal: () => string = () => '1.5';

        /** @name        onKindClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Kind Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onKindClick: (e: Event) => void = () => { };

        /** @name        onParam
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Param.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onParam: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {MaterialsPalette.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {MaterialsPalette.Types.Stylesheet} Result.
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
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    width: '320px',
                    minHeight: '300px',
                    overflow: 'hidden',
                }),
                new Rule('.ar-mat__kinds', {
                    display: 'flex', flexDirection: 'column',
                    gap: '2px', padding: '4px',
                    width: '90px',
                    borderRight: '1px solid var(--arianna-border, #d8d8d8)',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-mat__kind', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 7px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                }),
                new Rule('.ar-mat__kind:hover', { background: 'var(--arianna-bg, #fff)' }),
                new Rule('.ar-mat__kind--active', {
                    background: 'var(--arianna-bg, #fff)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-mat__kind-icon', { fontSize: '13px' }),
                new Rule('.ar-mat__kind-lbl', { fontSize: '11px' }),
                new Rule('.ar-mat__params', {
                    flex: '1', padding: '8px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    overflowY: 'auto',
                }),
                new Rule('.ar-mat__field', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                }),
                new Rule('.ar-mat__field span:first-child', {
                    width: '76px',
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-mat__field input[type="range"]', { flex: '1' }),
                new Rule('.ar-mat__field input[type="text"], .ar-mat__field input[type="number"]', {
                    flex: '1', minWidth: '0',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '3px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '2px',
                }),
                new Rule('.ar-mat__field input[type="color"]', {
                    width: '28px', height: '22px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '0', background: 'transparent',
                    cursor: 'pointer',
                }),
                new Rule('.ar-mat__num', {
                    width: '30px',
                    fontSize: '10px', fontFamily: 'ui-monospace, monospace',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textAlign: 'right',
                }),
            ]);
        }
    }
}
export default MaterialsPalette;

export type MaterialKind = MaterialsPalette.Types.MaterialKind;
export type MaterialDef = MaterialsPalette.Interfaces.MaterialDef;
export type MaterialsPaletteOptions = MaterialsPalette.Interfaces.MaterialsPaletteOptions;
