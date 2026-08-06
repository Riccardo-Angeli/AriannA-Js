/**
 * @module    components/graphics/2D/Canvas2D
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Canvas2D component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   Canvas2D
 *  @public
 *  @description Namespace containing Canvas2D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Canvas2D
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
        /** @interface   Vec2
         *  @public
         *  @description Vec2 contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Vec2
        {
            /** @name        x
             *  @public
             *  @type        {number}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x: number;

            /** @name        y
             *  @public
             *  @type        {number}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y: number;
        }

        /** @interface   Canvas2DOptions
         *  @public
         *  @description Canvas2DOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Canvas2DOptions
        {
            /** @name        width
             *  @public
             *  @type        {string}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: string;

            /** @name        height
             *  @public
             *  @type        {string}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: string;

            /** @name        panX
             *  @public
             *  @type        {number}
             *  @description Component member for pan X.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            panX?: number;

            /** @name        panY
             *  @public
             *  @type        {number}
             *  @description Component member for pan Y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            panY?: number;

            /** @name        zoom
             *  @public
             *  @type        {number}
             *  @description Component member for zoom.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            zoom?: number;

            /** @name        zoomMin
             *  @public
             *  @type        {number}
             *  @description Component member for zoom Min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            zoomMin?: number;

            /** @name        zoomMax
             *  @public
             *  @type        {number}
             *  @description Component member for zoom Max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            zoomMax?: number;

            /** @name        gridSize
             *  @public
             *  @type        {number}
             *  @description Component member for grid Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            gridSize?: number;

            /** @name        showRulers
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Rulers.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showRulers?: boolean;

            /** @name        showGrid
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Grid.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showGrid?: boolean;
        }

        /** @interface   ViewportState
         *  @public
         *  @description ViewportState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ViewportState
        {
            /** @name        panX
             *  @public
             *  @type        {number}
             *  @description Component member for pan X.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            panX: number;

            /** @name        panY
             *  @public
             *  @type        {number}
             *  @description Component member for pan Y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            panY: number;

            /** @name        zoom
             *  @public
             *  @type        {number}
             *  @description Component member for zoom.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            zoom: number;
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

    /** @class       Canvas2D
     *  @public
     *  @description AriannA Canvas2D component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-canvas-2d', {}, {
        Attributes: ['width', 'height', 'pan-x', 'pan-y', 'zoom', 'zoom-min', 'zoom-max', 'grid-size', 'show-rulers', 'show-grid'],
    })
    export class Canvas2D extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        viewport$
         *  @public
         *  @type        {Canvas2D.Types.Signal<Canvas2D.Interfaces.ViewportState>}
         *  @description Component member for viewport$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        viewport$: Types.Signal<Interfaces.ViewportState> = signal<Interfaces.ViewportState>({ panX: 0, panY: 0, zoom: 1 });

        /** Content container — user code mounts into this in world coordinates. */
        get world(): HTMLElement
        {
            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let w = this.querySelector<HTMLElement>('.ar-canvas2d__world');
            if (!w)
            {
                w = document.createElement('div');
                w.className = 'ar-canvas2d__world';
                this.appendChild(w);
            }
            return w;
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Canvas2D.Interfaces.Canvas2DOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.Canvas2DOptions = {})
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

            /** @name        gridAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned gridAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const gridAttr = this.signal().attribute('grid-size');

            /** @name        showRulers
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showRulers value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showRulers = () => this.getAttribute('show-rulers') === 'true' || this.hasAttribute('show-rulers');

            /** @name        showGrid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showGrid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showGrid = () => this.getAttribute('show-grid') !== 'false';
            this.hostStyle = () => {
                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = wAttr.Get() ?? '100%';

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = hAttr.Get() ?? '600px';
                return `width: ${w}; height: ${h}`;
            };
            this.gridBgStyle = () => {
                if (!showGrid())
                    return '';

                /** @name        gs
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned gs value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const gs = parseFloat(gridAttr.Get() ?? '20') || 20;

                /** @name        z
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned z value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const z = this.viewport$.Get().zoom;

                /** @name        pz
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pz value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pz = gs * z;

                /** @name        px
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned px value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const px = this.viewport$.Get().panX;

                /** @name        py
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned py value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const py = this.viewport$.Get().panY;
                return `background-image:
                        linear-gradient(to right,  var(--arianna-border, #d8d8d8) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--arianna-border, #d8d8d8) 1px, transparent 1px);
                    background-size: ${pz}px ${pz}px;
                    background-position: ${px}px ${py}px`;
            };
            this.worldStyle = () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = this.viewport$.Get();
                return `transform: translate(${v.panX}px, ${v.panY}px) scale(${v.zoom});
                    transform-origin: 0 0`;
            };
            this.showRulers = showRulers;
            this.zoomLabel = () => `${(this.viewport$.Get().zoom * 100).toFixed(0)}%`;
            // ── Handlers ────────────────────────────────────────────────────
            this.onWheel = (e: Event) => {
                /** @name        we
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned we value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const we = e as WheelEvent;
                if (we.ctrlKey || we.metaKey)
                {
                    // Zoom
                    we.preventDefault();

                    /** @name        factor
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned factor value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const factor = we.deltaY > 0 ? 0.92 : 1.08;

                    /** @name        rect
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned rect value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const rect = (we.currentTarget as HTMLElement).getBoundingClientRect();

                    /** @name        px
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned px value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const px = we.clientX - rect.left;

                    /** @name        py
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned py value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const py = we.clientY - rect.top;
                    this.zoomAt(this.viewport$.Get().zoom * factor, { x: px, y: py });
                }
                else if (we.shiftKey)
                {
                    we.preventDefault();
                    this.panBy(-we.deltaY, 0);
                }
                else
                {
                    we.preventDefault();
                    this.panBy(-we.deltaX, -we.deltaY);
                }
            };
            this.onPointerDown = (e: Event) => {
                /** @name        pe
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pe value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pe = e as PointerEvent;

                /** @name        isMiddle
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isMiddle value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isMiddle = pe.button === 1;

                /** @name        isSpace
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isSpace value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isSpace = this.#spaceDown;
                if (!isMiddle && !isSpace)
                    return;
                pe.preventDefault();

                /** @name        stage
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned stage value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const stage = pe.currentTarget as HTMLElement;
                stage.setPointerCapture?.(pe.pointerId);
                this.#dragging = true;
                this.#dragLastX = pe.clientX;
                this.#dragLastY = pe.clientY;
            };
            this.onPointerMove = (e: Event) => {
                if (!this.#dragging)
                    return;

                /** @name        pe
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pe value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pe = e as PointerEvent;

                /** @name        dx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dx = pe.clientX - this.#dragLastX;

                /** @name        dy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dy = pe.clientY - this.#dragLastY;
                this.#dragLastX = pe.clientX;
                this.#dragLastY = pe.clientY;
                this.panBy(dx, dy);
            };
            this.onPointerUp = () => { this.#dragging = false; };
            this.template = html `
            <div class="ar-canvas2d__host" :style="this.hostStyle()">
                <div class="ar-canvas2d__rulers" a-if="this.showRulers()">
                    <div class="ar-canvas2d__ruler ar-canvas2d__ruler--top"></div>
                    <div class="ar-canvas2d__ruler ar-canvas2d__ruler--left"></div>
                </div>
                <div class="ar-canvas2d__stage"
                     :style="this.gridBgStyle()"
                     @wheel="this.onWheel"
                     @pointerdown="this.onPointerDown"
                     @pointermove="this.onPointerMove"
                     @pointerup="this.onPointerUp"
                     @pointercancel="this.onPointerUp">
                    <div class="ar-canvas2d__world" :style="this.worldStyle()"></div>
                </div>
                <div class="ar-canvas2d__statusbar">
                    <span>{{ this.zoomLabel() }}</span>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Canvas2D.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Canvas2D.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        panTo
         *  @public
         *  @type        {this}
         *  @description Component member for pan To.
         *  @param       {number} x Parameter.
         *  @param       {number} y Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        panTo(x: number, y: number): this
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.viewport$.Get();
            this.viewport$.Set({ ...v, panX: x, panY: y });
            this.#fireViewport();
            return this;
        }

        /** @name        panBy
         *  @public
         *  @type        {this}
         *  @description Component member for pan By.
         *  @param       {number} dx Parameter.
         *  @param       {number} dy Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        panBy(dx: number, dy: number): this
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.viewport$.Get();
            return this.panTo(v.panX + dx, v.panY + dy);
        }

        /** @name        zoomTo
         *  @public
         *  @type        {this}
         *  @description Component member for zoom To.
         *  @param       {number} z Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        zoomTo(z: number): this
        {
            /** @name        mn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mn = parseFloat(this.getAttribute('zoom-min') ?? '0.05') || 0.05;

            /** @name        mx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mx = parseFloat(this.getAttribute('zoom-max') ?? '32') || 32;

            /** @name        clamped
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clamped value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clamped = Math.max(mn, Math.min(mx, z));

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.viewport$.Get();
            this.viewport$.Set({ ...v, zoom: clamped });
            this.#fireViewport();
            return this;
        }

        /** Zoom while keeping the screen point `screenPt` anchored in world space. */
        zoomAt(z: number, screenPt: Interfaces.Vec2): this
        {
            /** @name        mn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mn = parseFloat(this.getAttribute('zoom-min') ?? '0.05') || 0.05;

            /** @name        mx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mx = parseFloat(this.getAttribute('zoom-max') ?? '32') || 32;

            /** @name        newZ
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned newZ value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newZ = Math.max(mn, Math.min(mx, z));

            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.viewport$.Get();
            // World point under screenPt should be preserved
            /** @name        wx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wx = (screenPt.x - cur.panX) / cur.zoom;

            /** @name        wy
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wy value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wy = (screenPt.y - cur.panY) / cur.zoom;

            /** @name        newPanX
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned newPanX value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newPanX = screenPt.x - wx * newZ;

            /** @name        newPanY
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned newPanY value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newPanY = screenPt.y - wy * newZ;
            this.viewport$.Set({ panX: newPanX, panY: newPanY, zoom: newZ });
            this.#fireViewport();
            return this;
        }

        /** @name        screenToWorld
         *  @public
         *  @type        {Canvas2D.Interfaces.Vec2}
         *  @description Component member for screen To World.
         *  @param       {Canvas2D.Interfaces.Vec2} p Parameter.
         *  @returns     {Canvas2D.Interfaces.Vec2} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        screenToWorld(p: Interfaces.Vec2): Interfaces.Vec2
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.viewport$.Get();
            return { x: (p.x - v.panX) / v.zoom, y: (p.y - v.panY) / v.zoom };
        }

        /** @name        worldToScreen
         *  @public
         *  @type        {Canvas2D.Interfaces.Vec2}
         *  @description Component member for world To Screen.
         *  @param       {Canvas2D.Interfaces.Vec2} p Parameter.
         *  @returns     {Canvas2D.Interfaces.Vec2} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        worldToScreen(p: Interfaces.Vec2): Interfaces.Vec2
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.viewport$.Get();
            return { x: p.x * v.zoom + v.panX, y: p.y * v.zoom + v.panY };
        }

        /** @name        fitContent
         *  @public
         *  @type        {this}
         *  @description Component member for fit Content.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        fitContent(): this
        {
            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = this.world;

            /** @name        stage
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned stage value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const stage = this.querySelector<HTMLElement>('.ar-canvas2d__stage');
            if (!w || !stage)
                return this;

            /** @name        wRect
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wRect value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wRect = w.getBoundingClientRect();

            /** @name        sRect
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sRect value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sRect = stage.getBoundingClientRect();
            if (wRect.width === 0 || wRect.height === 0)
                return this;

            /** @name        sx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sx = sRect.width / (wRect.width / this.viewport$.Get().zoom);

            /** @name        sy
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sy value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sy = sRect.height / (wRect.height / this.viewport$.Get().zoom);

            /** @name        z
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned z value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const z = Math.min(sx, sy) * 0.9;
            return this.zoomTo(z);
        }

        /** @name        getViewport
         *  @public
         *  @type        {Canvas2D.Interfaces.ViewportState}
         *  @description Component member for get Viewport.
         *  @returns     {Canvas2D.Interfaces.ViewportState} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getViewport(): Interfaces.ViewportState { return { ...this.viewport$.Get() }; }

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
        onMount()
        {
            window.addEventListener('keydown', this.#onSpace);
            window.addEventListener('keyup', this.#onSpaceUp);
        }

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
        onBeforeUnmount()
        {
            window.removeEventListener('keydown', this.#onSpace);
            window.removeEventListener('keyup', this.#onSpaceUp);
        }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        #fireViewport
         *  @public
         *  @type        {void}
         *  @description Component member for fire Viewport.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fireViewport(): void
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.viewport$.Get();
            this.dispatchEvent(new CustomEvent('arianna:viewport', {
                bubbles: true, detail: { ...v },
            }));
        }

        /** @name        #dragging
         *  @public
         *  @type        {unknown}
         *  @description Component member for dragging.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #dragging = false;

        /** @name        #dragLastX
         *  @public
         *  @type        {unknown}
         *  @description Component member for drag Last X.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #dragLastX = 0;

        /** @name        #dragLastY
         *  @public
         *  @type        {unknown}
         *  @description Component member for drag Last Y.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #dragLastY = 0;

        /** @name        #spaceDown
         *  @public
         *  @type        {unknown}
         *  @description Component member for space Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #spaceDown = false;

        /** @name        #onSpace
         *  @public
         *  @type        {unknown}
         *  @description Component member for on Space.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #onSpace = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !this.#spaceDown)
            {
                this.#spaceDown = true;
                this.style.cursor = 'grab';
            }
        };

        /** @name        #onSpaceUp
         *  @public
         *  @type        {unknown}
         *  @description Component member for on Space Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #onSpaceUp = (e: KeyboardEvent) => {
            if (e.code === 'Space')
            {
                this.#spaceDown = false;
                this.style.cursor = '';
            }
        };

        /** @name        hostStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for host Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hostStyle: () => string = () => '';

        /** @name        gridBgStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for grid Bg Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private gridBgStyle: () => string = () => '';

        /** @name        worldStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for world Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private worldStyle: () => string = () => '';

        /** @name        showRulers
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Rulers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showRulers: () => boolean = () => false;

        /** @name        zoomLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for zoom Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private zoomLabel: () => string = () => '100%';

        /** @name        onWheel
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Wheel.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onWheel: (e: Event) => void = () => { };

        /** @name        onPointerDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pointer Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPointerDown: (e: Event) => void = () => { };

        /** @name        onPointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPointerMove: (e: Event) => void = () => { };

        /** @name        onPointerUp
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pointer Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPointerUp: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Canvas2D.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Canvas2D.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block', position: 'relative' }),
                new Rule('.ar-canvas2d__host', {
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                }),
                new Rule('.ar-canvas2d__stage', {
                    position: 'absolute',
                    inset: '0',
                    overflow: 'hidden',
                    cursor: 'default',
                    touchAction: 'none',
                }),
                new Rule('.ar-canvas2d__world', {
                    position: 'absolute',
                    inset: '0',
                    width: '0',
                    height: '0',
                    transformOrigin: '0 0',
                }),
                new Rule('.ar-canvas2d__rulers', {
                    position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '1',
                }),
                new Rule('.ar-canvas2d__ruler', {
                    position: 'absolute',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderColor: 'var(--arianna-border, #d8d8d8)',
                    borderStyle: 'solid',
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '9px',
                }),
                new Rule('.ar-canvas2d__ruler--top', {
                    top: '0', left: '20px', right: '0', height: '20px',
                    borderBottomWidth: '1px',
                }),
                new Rule('.ar-canvas2d__ruler--left', {
                    top: '20px', bottom: '0', left: '0', width: '20px',
                    borderRightWidth: '1px',
                }),
                new Rule('.ar-canvas2d__statusbar', {
                    position: 'absolute',
                    bottom: '4px',
                    right: '8px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--arianna-muted, #6e6b62)',
                    pointerEvents: 'none',
                    zIndex: '2',
                }),
            ]);
        }
    }
}
export default Canvas2D;

export type Vec2 = Canvas2D.Interfaces.Vec2;
export type Canvas2DOptions = Canvas2D.Interfaces.Canvas2DOptions;
