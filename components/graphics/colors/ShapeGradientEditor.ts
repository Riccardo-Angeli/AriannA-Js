/**
 * @module    components/graphics/colors/ShapeGradientEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ShapeGradientEditor component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import { LinearGradientEditor } from './LinearGradientEditor.ts';
import { type RGBA, colorFieldHex, parseColorString } from './GradientEditor.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   ShapeGradientEditor
 *  @public
 *  @description Namespace containing ShapeGradientEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ShapeGradientEditor
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ShapeStopContract
         *  @public
         *  @description ShapeStopContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ShapeStopContract extends ShapeStop
        {
        }

        /** @interface   Options
         *  @public
         *  @description Options contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options extends ShapeGradientEditorOptions
        {
        }
    }

    /**
     * @convention AriannA component namespace merge
     * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
     */
    /**
     * @module    components/graphics/colors/ShapeGradientEditor
     * @author    Riccardo Angeli
     * @copyright Riccardo Angeli 2012-2026
     * @license   MIT / Commercial (dual license)
     *
     * ShapeGradientEditor — Illustrator-style "freeform mesh" gradient. The user
     * places coloured control points anywhere on a 2D canvas; each point has a
     * position (x, y in [0,1] of the canvas) + colour + influence radius.
     *
     * The output is rendered as a canvas painted with a per-pixel inverse-distance
     * weighting blend over the control points. CSS output is omitted (no standard
     * freeform mesh in CSS yet) — consumers use `toCanvasDataURL()` for export.
     *
     * @example HTML
     *   <arianna-shape-gradient-editor width="320" height="240"></arianna-shape-gradient-editor>
     *
     * Events: arianna:change  detail: { points }
     * Attributes:  width, height
     */
    const { Rule, Stylesheet } = Css;
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'SchemaInterfaces.Reactivity.Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const signal = Reactivity.CreateSignal;

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const html = Templates.Template.Html;

    /** @interface   ShapeStop
     *  @public
     *  @description ShapeStop contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface ShapeStop
    {
        /** Normalised position in [0,1]. */
        x: number;

        /** @name        y
         *  @public
         *  @type        {number}
         *  @description Component member for y.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        y: number;

        /** @name        color
         *  @public
         *  @type        {RGBA}
         *  @description Component member for color.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        color: RGBA;

        /** Influence radius in normalised units. Default 0.3. */
        radius?: number;
    }

    /** @interface   ShapeGradientEditorOptions
     *  @public
     *  @description ShapeGradientEditorOptions contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface ShapeGradientEditorOptions
    {
        /** @name        points
         *  @public
         *  @type        {ShapeStop[]}
         *  @description Component member for points.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        points?: ShapeStop[];

        /** @name        width
         *  @public
         *  @type        {number}
         *  @description Component member for width.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        width?: number;

        /** @name        height
         *  @public
         *  @type        {number}
         *  @description Component member for height.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        height?: number;
    }

    /** @name        DEFAULT_POINTS
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned DEFAULT_POINTS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const DEFAULT_POINTS = (): ShapeStop[] => [
        { x: 0.25, y: 0.25, color: { r: 228, g: 12, b: 136, a: 1 } },
        { x: 0.75, y: 0.25, color: { r: 31, g: 111, b: 235, a: 1 } },
        { x: 0.50, y: 0.75, color: { r: 38, g: 166, b: 154, a: 1 } },
    ];

    /** @class       ShapeGradientEditor
     *  @public
     *  @description AriannA ShapeGradientEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-shape-gradient-editor', {}, {
        Attributes: ['width', 'height'],
    })
    export class ShapeGradientEditor extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        points$
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<ShapeStop[]>}
         *  @description Component member for points$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        points$: SchemaInterfaces.Reactivity.Signal<ShapeStop[]> = signal<ShapeStop[]>(DEFAULT_POINTS());

        /** @name        selected$
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<number>}
         *  @description Component member for selected$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected$: SchemaInterfaces.Reactivity.Signal<number> = signal<number>(0);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ShapeGradientEditorOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: ShapeGradientEditorOptions = {})
        {
            /** @name        wAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wAttr = this.signal().attribute('width');

            /** @name        hAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hAttr = this.signal().attribute('height');

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = () => parseInt(wAttr.Get() ?? '320', 10) || 320;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = () => parseInt(hAttr.Get() ?? '240', 10) || 240;
            this.canvasStyle = () => `width: ${w()}px; height: ${h()}px; position: relative; display: block`;
            this.dimW = () => String(w());
            this.dimH = () => String(h());
            this.pinList = (): Array<{
                /** @name        style
                 *  @public
                 *  @type        {string}
                 *  @description Component member for style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                style: string;

                /** @name        idx
                 *  @public
                 *  @type        {number}
                 *  @description Component member for idx.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                idx: number;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;

                /** @name        bg
                 *  @public
                 *  @type        {string}
                 *  @description Component member for bg.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                bg: string;
            }> => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();

                /** @name        W
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned W value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const W = w(), H = h();
                return this.points$.Get().map((p: any, i: any) => ({
                    style: `left: ${p.x * W}px; top: ${p.y * H}px; background: ${colorFieldHex(p.color)}`,
                    idx: i,
                    cls: 'ar-grad__mesh-pt' + (i === sel ? ' ar-grad__mesh-pt--sel' : ''),
                    bg: colorFieldHex(p.color),
                }));
            };
            this.hasSel = () => this.points$.Get().length > 0;
            this.selPt = () => this.points$.Get()[this.selected$.Get()] ?? this.points$.Get()[0]!;
            this.selHex = () => colorFieldHex(this.selPt().color);
            this.selX = () => (this.selPt().x * 100).toFixed(1);
            this.selY = () => (this.selPt().y * 100).toFixed(1);
            this.selR = () => (this.selPt().radius ?? 0.3).toFixed(2);
            this.selA = () => (this.selPt().color.a ?? 1).toFixed(2);
            // ── Handlers ────────────────────────────────────────────────────
            this.onCanvasClick = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;

                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = me.target as HTMLElement;
                if (target.classList.contains('ar-grad__mesh-pt'))
                    return;

                /** @name        canvas
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned canvas value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const canvas = me.currentTarget as HTMLElement;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = canvas.getBoundingClientRect();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = (me.clientX - rect.left) / rect.width;

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = (me.clientY - rect.top) / rect.height;
                this.addPoint(x, y, { r: 200, g: 200, b: 200, a: 1 });
            };
            this.onPtPointer = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                me.stopPropagation();

                /** @name        pt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pt = me.currentTarget as HTMLElement;

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = parseInt(pt.dataset.idx ?? '0', 10);
                if (me.type === 'pointerdown')
                {
                    pt.setPointerCapture?.(me.pointerId);
                    this.selected$.Set(idx);
                }
                else if (!(me.buttons & 1))
                    return;

                /** @name        canvas
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned canvas value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const canvas = pt.parentElement as HTMLElement;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = canvas.getBoundingClientRect();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));
                this.updatePoint(idx, { x, y });
            };
            this.onPtDblClick = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;
                me.stopPropagation();

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = parseInt((me.currentTarget as HTMLElement).dataset.idx ?? '0', 10);
                this.removePoint(idx);
            };
            this.onSelColorChange = (e: Event) => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = parseColorString((e.target as HTMLInputElement).value);
                if (c)
                {
                    /** @name        cur
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cur value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cur = this.selPt();
                    this.updatePoint(this.selected$.Get(), { color: { ...c, a: cur.color.a } });
                }
            };
            this.onSelXChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseFloat((e.target as HTMLInputElement).value) / 100;
                this.updatePoint(this.selected$.Get(), { x: Math.max(0, Math.min(1, v)) });
            };
            this.onSelYChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseFloat((e.target as HTMLInputElement).value) / 100;
                this.updatePoint(this.selected$.Get(), { y: Math.max(0, Math.min(1, v)) });
            };
            this.onSelRChange = (e: Event) => {
                this.updatePoint(this.selected$.Get(), {
                    radius: Math.max(0.01, Math.min(2, parseFloat((e.target as HTMLInputElement).value))),
                });
            };
            this.onSelAChange = (e: Event) => {
                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.selPt();
                this.updatePoint(this.selected$.Get(), {
                    color: { ...cur.color, a: Math.max(0, Math.min(1, parseFloat((e.target as HTMLInputElement).value))) },
                });
            };
            this.onRemove = () => this.removePoint(this.selected$.Get());
            this.template = html `
            <div class="ar-grad__row">
                <div class="ar-grad__col">
                    <div class="ar-grad__mesh-canvas-wrap" :style="this.canvasStyle()">
                        <canvas class="ar-grad__mesh-canvas-bg"
                                :width="this.dimW()" :height="this.dimH()"
                                style="position:absolute; inset:0;"
                                @click="this.onCanvasClick"></canvas>
                        <div a-for="p in this.pinList()"
                             :class="p.cls" :style="p.style" :data-idx="p.idx"
                             @pointerdown="this.onPtPointer"
                             @pointermove="this.onPtPointer"
                             @dblclick="this.onPtDblClick"></div>
                    </div>
                </div>
                <div class="ar-grad__inspector" a-if="this.hasSel()">
                    <label class="ar-grad__field">
                        <span>Color</span>
                        <input type="color" :value="this.selHex()" @input="this.onSelColorChange"/>
                        <input type="text"  :value="this.selHex()" @change="this.onSelColorChange"/>
                    </label>
                    <label class="ar-grad__field">
                        <span>X</span>
                        <input type="number" min="0" max="100" step="0.5"
                               :value="this.selX()" @change="this.onSelXChange"/>%
                    </label>
                    <label class="ar-grad__field">
                        <span>Y</span>
                        <input type="number" min="0" max="100" step="0.5"
                               :value="this.selY()" @change="this.onSelYChange"/>%
                    </label>
                    <label class="ar-grad__field">
                        <span>Radius</span>
                        <input type="number" min="0.01" max="2" step="0.05"
                               :value="this.selR()" @change="this.onSelRChange"/>
                    </label>
                    <label class="ar-grad__field">
                        <span>Alpha</span>
                        <input type="number" min="0" max="1" step="0.01"
                               :value="this.selA()" @change="this.onSelAChange"/>
                    </label>
                    <div class="ar-grad__btns">
                        <button type="button" class="ar-grad__btn ar-grad__btn--danger"
                                @click="this.onRemove">Remove point</button>
                    </div>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Css.Stylesheet | null;
            }).Sheet = LinearGradientEditor.LinearGradientEditor.SharedSheet();
        }

        /** Paint the freeform mesh into the canvas using inverse-distance weighting. */
        #paint(): void
        {
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = this.querySelector<HTMLCanvasElement>('canvas.ar-grad__mesh-canvas-bg');
            if (!canvas)
                return;

            /** @name        ctx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ctx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;

            /** @name        W
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned W value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const W = canvas.width, H = canvas.height;

            /** @name        pts
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pts value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pts = this.points$.Get();
            if (!pts.length)
            {
                ctx.clearRect(0, 0, W, H);
                return;
            }

            /** @name        img
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned img value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const img = ctx.createImageData(W, H);
            // Step factor for perf — paints every other pixel and stretches
            /** @name        step
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned step value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const step = (W * H > 80000) ? 2 : 1;
            for (let py = 0; py < H; py += step)
            {
                for (let px = 0; px < W; px += step)
                {
                    /** @name        nx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned nx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const nx = px / (W - 1);

                    /** @name        ny
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ny value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ny = py / (H - 1);

                    /** @name        sumR
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sumR value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let sumR = 0, sumG = 0, sumB = 0, sumA = 0, sumW = 0;
                    for (const p of pts)
                    {
                        /** @name        radius
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned radius value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const radius = p.radius ?? 0.3;

                        /** @name        dx
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned dx value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const dx = nx - p.x, dy = ny - p.y;

                        /** @name        d
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned d value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const d = Math.sqrt(dx * dx + dy * dy);
                        // Smooth falloff
                        /** @name        w
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned w value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const w = 1 / (Math.pow(d / radius + 0.01, 2.5));
                        sumR += p.color.r * w;
                        sumG += p.color.g * w;
                        sumB += p.color.b * w;
                        sumA += (p.color.a ?? 1) * w;
                        sumW += w;
                    }

                    /** @name        r
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned r value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const r = sumR / sumW, g = sumG / sumW, b = sumB / sumW, a = sumA / sumW;

                    /** @name        i
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned i value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const i = (py * W + px) * 4;
                    img.data[i] = Math.max(0, Math.min(255, Math.round(r)));
                    img.data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
                    img.data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
                    img.data[i + 3] = Math.max(0, Math.min(255, Math.round(a * 255)));
                    if (step === 2)
                    {
                        /** @name        j
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned j value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const j = (py * W + (px + 1)) * 4;
                        if (j + 3 < img.data.length)
                        {
                            img.data[j] = img.data[i]!;
                            img.data[j + 1] = img.data[i + 1]!;
                            img.data[j + 2] = img.data[i + 2]!;
                            img.data[j + 3] = img.data[i + 3]!;
                        }

                        /** @name        k
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned k value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const k = ((py + 1) * W + px) * 4;
                        if (k + 3 < img.data.length)
                        {
                            img.data[k] = img.data[i]!;
                            img.data[k + 1] = img.data[i + 1]!;
                            img.data[k + 2] = img.data[i + 2]!;
                            img.data[k + 3] = img.data[i + 3]!;
                        }
                    }
                }
            }
            ctx.putImageData(img, 0, 0);
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        addPoint
         *  @public
         *  @type        {ShapeStop}
         *  @description Component member for add Point.
         *  @param       {number} x Parameter.
         *  @param       {number} y Parameter.
         *  @param       {RGBA} color Parameter.
         *  @returns     {ShapeStop} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addPoint(x: number, y: number, color: RGBA): ShapeStop
        {
            /** @name        p
             *  @public
             *  @type        {ShapeStop}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p: ShapeStop = {
                x: Math.max(0, Math.min(1, x)),
                y: Math.max(0, Math.min(1, y)),
                color: { ...color },
            };

            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.points$.Get().slice();
            cur.push(p);
            this.points$.Set(cur);
            this.selected$.Set(cur.length - 1);
            this.#fire();
            return p;
        }

        /** @name        removePoint
         *  @public
         *  @type        {this}
         *  @description Component member for remove Point.
         *  @param       {number} idx Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removePoint(idx: number): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.points$.Get();
            if (cur.length <= 1)
                return this;
            if (idx < 0 || idx >= cur.length)
                return this;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = cur.slice();
            next.splice(idx, 1);
            this.points$.Set(next);
            if (this.selected$.Get() >= next.length)
                this.selected$.Set(next.length - 1);
            this.#fire();
            return this;
        }

        /** @name        updatePoint
         *  @public
         *  @type        {this}
         *  @description Component member for update Point.
         *  @param       {number} idx Parameter.
         *  @param       {Partial<ShapeStop>} patch Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        updatePoint(idx: number, patch: Partial<ShapeStop>): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.points$.Get();

            /** @name        p
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p = cur[idx];
            if (!p)
                return this;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = cur.slice();

            /** @name        updated
             *  @public
             *  @type        {ShapeStop}
             *  @description Namespace-owned updated value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const updated: ShapeStop = {
                x: patch.x ?? p.x,
                y: patch.y ?? p.y,
                color: patch.color ?? p.color,
                radius: patch.radius ?? p.radius,
            };
            next[idx] = updated;
            this.points$.Set(next);
            this.#fire();
            return this;
        }

        /** @name        setPoints
         *  @public
         *  @type        {this}
         *  @description Component member for set Points.
         *  @param       {ShapeStop[]} pts Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setPoints(pts: ShapeStop[]): this
        {
            this.points$.Set(pts.map(p => ({ ...p, color: { ...p.color } })));
            if (this.selected$.Get() >= this.points$.Get().length)
                this.selected$.Set(0);
            this.#fire();
            return this;
        }

        /** @name        getPoints
         *  @public
         *  @type        {ShapeStop[]}
         *  @description Component member for get Points.
         *  @returns     {ShapeStop[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getPoints(): ShapeStop[]
        {
            return this.points$.Get().map((p: any) => ({ ...p, color: { ...p.color } }));
        }

        /** @name        toCanvasDataURL
         *  @public
         *  @type        {string}
         *  @description Component member for to Canvas Data URL.
         *  @param       {string} type Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toCanvasDataURL(type: string = 'image/png'): string
        {
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = this.querySelector<HTMLCanvasElement>('canvas.ar-grad__mesh-canvas-bg');
            return canvas?.toDataURL(type) ?? '';
        }

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
            this.#paint();
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true,
                detail: { points: this.getPoints() },
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
        onMount() { this.#paint(); }

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

        /** @name        canvasStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for canvas Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private canvasStyle: () => string = () => '';

        /** @name        dimW
         *  @private
         *  @type        {() => string}
         *  @description Component member for dim W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dimW: () => string = () => '320';

        /** @name        dimH
         *  @private
         *  @type        {() => string}
         *  @description Component member for dim H.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dimH: () => string = () => '240';

        /** @name        pinList
         *  @private
         *  @type        {() => Array<{
            style: string;
            idx: number;
            cls: string;
            bg: string;
        }>}
         *  @description Component member for pin List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private pinList: () => Array<{
            /** @name        style
             *  @public
             *  @type        {string}
             *  @description Component member for style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style: string;

            /** @name        idx
             *  @public
             *  @type        {number}
             *  @description Component member for idx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            idx: number;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        bg
             *  @public
             *  @type        {string}
             *  @description Component member for bg.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bg: string;
        }> = () => [];

        /** @name        hasSel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Sel.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasSel: () => boolean = () => false;

        /** @name        selPt
         *  @private
         *  @type        {() => ShapeStop}
         *  @description Component member for sel Pt.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selPt: () => ShapeStop = () => ({ x: 0.5, y: 0.5, color: { r: 0, g: 0, b: 0, a: 1 } });

        /** @name        selHex
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel Hex.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selHex: () => string = () => '#000000';

        /** @name        selX
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel X.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selX: () => string = () => '50';

        /** @name        selY
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel Y.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selY: () => string = () => '50';

        /** @name        selR
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel R.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selR: () => string = () => '0.30';

        /** @name        selA
         *  @private
         *  @type        {() => string}
         *  @description Component member for sel A.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selA: () => string = () => '1';

        /** @name        onCanvasClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Canvas Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCanvasClick: (e: Event) => void = () => { };

        /** @name        onPtPointer
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pt Pointer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPtPointer: (e: Event) => void = () => { };

        /** @name        onPtDblClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pt Dbl Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPtDblClick: (e: Event) => void = () => { };

        /** @name        onSelColorChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel Color Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelColorChange: (e: Event) => void = () => { };

        /** @name        onSelXChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel XChange.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelXChange: (e: Event) => void = () => { };

        /** @name        onSelYChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel YChange.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelYChange: (e: Event) => void = () => { };

        /** @name        onSelRChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel RChange.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelRChange: (e: Event) => void = () => { };

        /** @name        onSelAChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Sel AChange.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSelAChange: (e: Event) => void = () => { };

        /** @name        onRemove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Remove.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRemove: (e: Event) => void = () => { };
    }
}
export default ShapeGradientEditor;

export type ShapeStop = ShapeGradientEditor.ShapeStop;

export type ShapeGradientEditorOptions = ShapeGradientEditor.ShapeGradientEditorOptions;
