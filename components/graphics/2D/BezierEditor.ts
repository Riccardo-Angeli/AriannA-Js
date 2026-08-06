/**
 * @module    components/graphics/2D/BezierEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BezierEditor component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   BezierEditor
 *  @public
 *  @description Namespace containing BezierEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace BezierEditor
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

        /** @name        BezierMode
         *  @public
         *  @type        {'pen' | 'edit' | 'delete'}
         *  @description Type alias for BezierMode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type BezierMode = 'pen' | 'edit' | 'delete';
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

        /** @interface   Anchor
         *  @public
         *  @description Anchor contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Anchor
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

            /** @name        hIn
             *  @public
             *  @type        {BezierEditor.Interfaces.Vec2}
             *  @description Component member for h In.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hIn: Interfaces.Vec2;

            /** @name        hOut
             *  @public
             *  @type        {BezierEditor.Interfaces.Vec2}
             *  @description Component member for h Out.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hOut: Interfaces.Vec2;

            /** @name        kind
             *  @public
             *  @type        {'smooth' | 'asym' | 'corner'}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: 'smooth' | 'asym' | 'corner';
        }

        /** @interface   BezierEditorOptions
         *  @public
         *  @description BezierEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BezierEditorOptions
        {
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

            /** @name        mode
             *  @public
             *  @type        {BezierEditor.Types.BezierMode}
             *  @description Component member for mode.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            mode?: Types.BezierMode;

            /** @name        anchors
             *  @public
             *  @type        {BezierEditor.Interfaces.Anchor[]}
             *  @description Component member for anchors.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            anchors?: Interfaces.Anchor[];

            /** @name        closed
             *  @public
             *  @type        {boolean}
             *  @description Component member for closed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            closed?: boolean;
        }

        /** @interface   BezierState
         *  @public
         *  @description BezierState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BezierState
        {
            /** @name        anchors
             *  @public
             *  @type        {BezierEditor.Interfaces.Anchor[]}
             *  @description Component member for anchors.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            anchors: Interfaces.Anchor[];

            /** @name        closed
             *  @public
             *  @type        {boolean}
             *  @description Component member for closed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            closed: boolean;
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

    /** @class       BezierEditor
     *  @public
     *  @description AriannA BezierEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-bezier-editor', {}, {
        Attributes: ['width', 'height', 'mode', 'closed'],
    })
    export class BezierEditor extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        state$
         *  @public
         *  @type        {BezierEditor.Types.Signal<BezierEditor.Interfaces.BezierState>}
         *  @description Component member for state$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        state$: Types.Signal<Interfaces.BezierState> = signal<Interfaces.BezierState>({ anchors: [], closed: false });

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {BezierEditor.Interfaces.BezierEditorOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.BezierEditorOptions = {})
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
            this.viewBox = () => `0 0 ${this.#w()} ${this.#h()}`;
            this.wStr = () => String(this.#w());
            this.hStr = () => String(this.#h());
            this.pathD = () => this.toSVGPath();
            this.anchorList = (): Array<{
                /** @name        cx
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cx.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cx: string;

                /** @name        cy
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cy.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cy: string;

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
            }> => this.state$.Get().anchors.map((a: any, i: any) => ({
                cx: String(a.x), cy: String(a.y), idx: i,
                cls: 'ar-bez__anchor',
            }));
            this.handleSegments = (): Array<{
                /** @name        x1
                 *  @public
                 *  @type        {string}
                 *  @description Component member for x1.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                x1: string;

                /** @name        y1
                 *  @public
                 *  @type        {string}
                 *  @description Component member for y1.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                y1: string;

                /** @name        x2
                 *  @public
                 *  @type        {string}
                 *  @description Component member for x2.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                x2: string;

                /** @name        y2
                 *  @public
                 *  @type        {string}
                 *  @description Component member for y2.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                y2: string;
            }> => {
                /** @name        out
                 *  @public
                 *  @type        {Array<{
                    x1: string;
                    y1: string;
                    x2: string;
                    y2: string;
                }>}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Array<{
                    /** @name        x1
                     *  @public
                     *  @type        {string}
                     *  @description Component member for x1.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    x1: string;

                    /** @name        y1
                     *  @public
                     *  @type        {string}
                     *  @description Component member for y1.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    y1: string;

                    /** @name        x2
                     *  @public
                     *  @type        {string}
                     *  @description Component member for x2.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    x2: string;

                    /** @name        y2
                     *  @public
                     *  @type        {string}
                     *  @description Component member for y2.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    y2: string;
                }> = [];
                for (const a of this.state$.Get().anchors)
                {
                    if (a.hIn.x !== 0 || a.hIn.y !== 0)
                    {
                        out.push({
                            x1: String(a.x), y1: String(a.y),
                            x2: String(a.x + a.hIn.x), y2: String(a.y + a.hIn.y),
                        });
                    }
                    if (a.hOut.x !== 0 || a.hOut.y !== 0)
                    {
                        out.push({
                            x1: String(a.x), y1: String(a.y),
                            x2: String(a.x + a.hOut.x), y2: String(a.y + a.hOut.y),
                        });
                    }
                }
                return out;
            };
            this.handleDots = (): Array<{
                /** @name        cx
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cx.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cx: string;

                /** @name        cy
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cy.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cy: string;

                /** @name        idx
                 *  @public
                 *  @type        {number}
                 *  @description Component member for idx.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                idx: number;

                /** @name        side
                 *  @public
                 *  @type        {'in' | 'out'}
                 *  @description Component member for side.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                side: 'in' | 'out';
            }> => {
                /** @name        out
                 *  @public
                 *  @type        {Array<{
                    cx: string;
                    cy: string;
                    idx: number;
                    side: 'in' | 'out';
                }>}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Array<{
                    /** @name        cx
                     *  @public
                     *  @type        {string}
                     *  @description Component member for cx.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    cx: string;

                    /** @name        cy
                     *  @public
                     *  @type        {string}
                     *  @description Component member for cy.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    cy: string;

                    /** @name        idx
                     *  @public
                     *  @type        {number}
                     *  @description Component member for idx.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    idx: number;

                    /** @name        side
                     *  @public
                     *  @type        {'in' | 'out'}
                     *  @description Component member for side.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    side: 'in' | 'out';
                }> = [];
                this.state$.Get().anchors.forEach((a: any, i: any) => {
                    if (a.hIn.x !== 0 || a.hIn.y !== 0)
                    {
                        out.push({ cx: String(a.x + a.hIn.x), cy: String(a.y + a.hIn.y), idx: i, side: 'in' });
                    }
                    if (a.hOut.x !== 0 || a.hOut.y !== 0)
                    {
                        out.push({ cx: String(a.x + a.hOut.x), cy: String(a.y + a.hOut.y), idx: i, side: 'out' });
                    }
                });
                return out;
            };
            // ── Handlers ────────────────────────────────────────────────────
            this.onSvgPointerDown = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;

                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = me.target as SVGElement;
                // Ignore if clicking on an anchor or handle
                if (target.classList.contains('ar-bez__anchor') || target.classList.contains('ar-bez__handle-dot'))
                    return;

                /** @name        svg
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned svg value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const svg = me.currentTarget as SVGSVGElement;

                /** @name        pt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pt = this.#localPoint(svg, me);

                /** @name        mode
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mode value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mode = (this.getAttribute('mode') ?? 'pen') as Types.BezierMode;
                if (mode === 'pen')
                {
                    // Add new anchor; allow drag to define hOut
                    /** @name        cur
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cur value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cur = this.state$.Get();

                    /** @name        anchor
                     *  @public
                     *  @type        {BezierEditor.Interfaces.Anchor}
                     *  @description Namespace-owned anchor value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const anchor: Interfaces.Anchor = { x: pt.x, y: pt.y, hIn: { x: 0, y: 0 }, hOut: { x: 0, y: 0 }, kind: 'corner' };
                    // If there's a previous anchor, the new hIn mirrors the previous hOut visually
                    this.state$.Set({ ...cur, anchors: [...cur.anchors, anchor] });
                    this.#fire();
                    // Pen drag — set hOut while pointer moves before release
                    svg.setPointerCapture?.(me.pointerId);
                    this.#penDragIdx = cur.anchors.length;
                    this.#penDragOrigin = { x: pt.x, y: pt.y };
                }
            };
            this.onSvgPointerMove = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                if (this.#penDragIdx == null)
                    return;

                /** @name        svg
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned svg value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const svg = me.currentTarget as SVGSVGElement;

                /** @name        pt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pt = this.#localPoint(svg, me);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();

                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = cur.anchors[this.#penDragIdx];
                if (!a || !this.#penDragOrigin)
                    return;

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = cur.anchors.slice();

                /** @name        hOut
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hOut value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hOut = { x: pt.x - this.#penDragOrigin.x, y: pt.y - this.#penDragOrigin.y };

                /** @name        hIn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hIn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hIn = { x: -hOut.x, y: -hOut.y };
                next[this.#penDragIdx] = { ...a, hOut, hIn, kind: 'smooth' };
                this.state$.Set({ ...cur, anchors: next });
                this.#fire();
            };
            this.onSvgPointerUp = () => {
                this.#penDragIdx = null;
                this.#penDragOrigin = null;
            };
            this.onAnchorPointerDown = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                me.stopPropagation();

                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = me.currentTarget as SVGCircleElement;

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = parseInt(target.dataset.idx ?? '0', 10);

                /** @name        mode
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mode value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mode = (this.getAttribute('mode') ?? 'pen') as Types.BezierMode;
                if (mode === 'delete')
                {
                    this.removeAnchor(idx);
                    return;
                }
                // Edit: drag anchor
                target.setPointerCapture?.(me.pointerId);
                this.#anchorDragIdx = idx;
            };
            this.onAnchorPointerMove = (e: Event) => {
                if (this.#anchorDragIdx == null)
                    return;

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;

                /** @name        svg
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned svg value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const svg = (me.currentTarget as SVGElement).ownerSVGElement;
                if (!svg)
                    return;

                /** @name        pt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pt = this.#localPoint(svg, me);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();

                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = cur.anchors[this.#anchorDragIdx];
                if (!a)
                    return;

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = cur.anchors.slice();
                next[this.#anchorDragIdx] = { ...a, x: pt.x, y: pt.y };
                this.state$.Set({ ...cur, anchors: next });
                this.#fire();
            };
            this.onAnchorPointerUp = () => { this.#anchorDragIdx = null; };
            this.onHandlePointerDown = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;
                me.stopPropagation();

                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = me.currentTarget as SVGCircleElement;
                target.setPointerCapture?.(me.pointerId);
                this.#handleDragIdx = parseInt(target.dataset.idx ?? '0', 10);
                this.#handleDragSide = (target.dataset.side as 'in' | 'out') ?? 'out';
                this.#handleDragAlt = me.altKey;
            };
            this.onHandlePointerMove = (e: Event) => {
                if (this.#handleDragIdx == null)
                    return;

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as PointerEvent;

                /** @name        svg
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned svg value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const svg = (me.currentTarget as SVGElement).ownerSVGElement;
                if (!svg)
                    return;

                /** @name        pt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pt = this.#localPoint(svg, me);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.state$.Get();

                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = cur.anchors[this.#handleDragIdx];
                if (!a)
                    return;

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = cur.anchors.slice();

                /** @name        delta
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned delta value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const delta = { x: pt.x - a.x, y: pt.y - a.y };

                /** @name        updated
                 *  @public
                 *  @type        {BezierEditor.Interfaces.Anchor}
                 *  @description Namespace-owned updated value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let updated: Interfaces.Anchor;
                if (this.#handleDragSide === 'out')
                {
                    if (this.#handleDragAlt || a.kind === 'corner')
                    {
                        updated = { ...a, hOut: delta, kind: 'corner' };
                    }
                    else if (a.kind === 'smooth')
                    {
                        updated = { ...a, hOut: delta, hIn: { x: -delta.x, y: -delta.y } };
                    }
                    else
                    {
                        // asym: keep direction mirrored but magnitude independent
                        /** @name        mag
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned mag value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const mag = Math.hypot(a.hIn.x, a.hIn.y) || Math.hypot(delta.x, delta.y);

                        /** @name        dirLen
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned dirLen value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const dirLen = Math.hypot(delta.x, delta.y) || 1;
                        updated = { ...a, hOut: delta, hIn: { x: -delta.x * mag / dirLen, y: -delta.y * mag / dirLen } };
                    }
                }
                else
                {
                    if (this.#handleDragAlt || a.kind === 'corner')
                    {
                        updated = { ...a, hIn: delta, kind: 'corner' };
                    }
                    else if (a.kind === 'smooth')
                    {
                        updated = { ...a, hIn: delta, hOut: { x: -delta.x, y: -delta.y } };
                    }
                    else
                    {
                        /** @name        mag
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned mag value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const mag = Math.hypot(a.hOut.x, a.hOut.y) || Math.hypot(delta.x, delta.y);

                        /** @name        dirLen
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned dirLen value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const dirLen = Math.hypot(delta.x, delta.y) || 1;
                        updated = { ...a, hIn: delta, hOut: { x: -delta.x * mag / dirLen, y: -delta.y * mag / dirLen } };
                    }
                }
                next[this.#handleDragIdx] = updated;
                this.state$.Set({ ...cur, anchors: next });
                this.#fire();
            };
            this.onHandlePointerUp = () => {
                this.#handleDragIdx = null;
                this.#handleDragSide = null;
                this.#handleDragAlt = false;
            };
            this.template = html `
            <svg :viewBox="this.viewBox()"
                 :width="this.wStr()" :height="this.hStr()"
                 xmlns="http://www.w3.org/2000/svg"
                 class="ar-bez__svg"
                 @pointerdown="this.onSvgPointerDown"
                 @pointermove="this.onSvgPointerMove"
                 @pointerup="this.onSvgPointerUp">
                <path :d="this.pathD()" class="ar-bez__path" fill="none"></path>
                <line a-for="s in this.handleSegments()"
                      :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
                      class="ar-bez__handle-line"></line>
                <circle a-for="h in this.handleDots()"
                        :cx="h.cx" :cy="h.cy" r="4"
                        class="ar-bez__handle-dot"
                        :data-idx="h.idx" :data-side="h.side"
                        @pointerdown="this.onHandlePointerDown"
                        @pointermove="this.onHandlePointerMove"
                        @pointerup="this.onHandlePointerUp"></circle>
                <circle a-for="a in this.anchorList()"
                        :cx="a.cx" :cy="a.cy" r="5"
                        :class="a.cls"
                        :data-idx="a.idx"
                        @pointerdown="this.onAnchorPointerDown"
                        @pointermove="this.onAnchorPointerMove"
                        @pointerup="this.onAnchorPointerUp"></circle>
            </svg>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {BezierEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = BezierEditor.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setMode
         *  @public
         *  @type        {this}
         *  @description Component member for set Mode.
         *  @param       {BezierEditor.Types.BezierMode} mode Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMode(mode: Types.BezierMode): this { this.setAttribute('mode', mode); return this; }

        /** @name        getMode
         *  @public
         *  @type        {BezierEditor.Types.BezierMode}
         *  @description Component member for get Mode.
         *  @returns     {BezierEditor.Types.BezierMode} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getMode(): Types.BezierMode { return (this.getAttribute('mode') as Types.BezierMode) || 'pen'; }

        /** @name        closePath
         *  @public
         *  @type        {this}
         *  @description Component member for close Path.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        closePath(): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();
            this.state$.Set({ ...cur, closed: true });
            this.setAttribute('closed', 'true');
            this.#fire();
            return this;
        }

        /** @name        openPath
         *  @public
         *  @type        {this}
         *  @description Component member for open Path.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        openPath(): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();
            this.state$.Set({ ...cur, closed: false });
            this.removeAttribute('closed');
            this.#fire();
            return this;
        }

        /** @name        addAnchor
         *  @public
         *  @type        {BezierEditor.Interfaces.Anchor}
         *  @description Component member for add Anchor.
         *  @param       {{
            x: number;
            y: number;
            hIn?: BezierEditor.Interfaces.Vec2;
            hOut?: BezierEditor.Interfaces.Vec2;
            kind?: BezierEditor.Interfaces.Anchor['kind'];
        }} opts Parameter.
         *  @returns     {BezierEditor.Interfaces.Anchor} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addAnchor(opts: {
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

            /** @name        hIn
             *  @public
             *  @type        {BezierEditor.Interfaces.Vec2}
             *  @description Component member for h In.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hIn?: Interfaces.Vec2;

            /** @name        hOut
             *  @public
             *  @type        {BezierEditor.Interfaces.Vec2}
             *  @description Component member for h Out.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hOut?: Interfaces.Vec2;

            /** @name        kind
             *  @public
             *  @type        {BezierEditor.Interfaces.Anchor['kind']}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind?: Interfaces.Anchor['kind'];
        }): Interfaces.Anchor {
            /** @name        a
             *  @public
             *  @type        {BezierEditor.Interfaces.Anchor}
             *  @description Namespace-owned a value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const a: Interfaces.Anchor = {
                x: opts.x, y: opts.y,
                hIn: opts.hIn ?? { x: 0, y: 0 },
                hOut: opts.hOut ?? { x: 0, y: 0 },
                kind: opts.kind ?? 'corner',
            };

            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();
            this.state$.Set({ ...cur, anchors: [...cur.anchors, a] });
            this.#fire();
            return a;
        }

        /** @name        removeAnchor
         *  @public
         *  @type        {this}
         *  @description Component member for remove Anchor.
         *  @param       {number} idx Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeAnchor(idx: number): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();
            if (idx < 0 || idx >= cur.anchors.length)
                return this;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = cur.anchors.slice();
            next.splice(idx, 1);
            this.state$.Set({ ...cur, anchors: next });
            this.#fire();
            return this;
        }

        /** @name        setAnchors
         *  @public
         *  @type        {this}
         *  @description Component member for set Anchors.
         *  @param       {BezierEditor.Interfaces.Anchor[]} anchors Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setAnchors(anchors: Interfaces.Anchor[]): this
        {
            this.state$.Set({ ...this.state$.Get(), anchors: anchors.map(a => ({
                    x: a.x, y: a.y,
                    hIn: { ...a.hIn }, hOut: { ...a.hOut },
                    kind: a.kind,
                })) });
            this.#fire();
            return this;
        }

        /** @name        getAnchors
         *  @public
         *  @type        {BezierEditor.Interfaces.Anchor[]}
         *  @description Component member for get Anchors.
         *  @returns     {BezierEditor.Interfaces.Anchor[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getAnchors(): Interfaces.Anchor[]
        {
            return this.state$.Get().anchors.map((a: any) => ({
                x: a.x, y: a.y,
                hIn: { ...a.hIn }, hOut: { ...a.hOut },
                kind: a.kind,
            }));
        }

        /** @name        toSVGPath
         *  @public
         *  @type        {string}
         *  @description Component member for to SVGPath.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toSVGPath(): string
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();

            /** @name        anchors
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned anchors value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const anchors = cur.anchors;
            if (anchors.length === 0)
                return '';

            /** @name        parts
             *  @public
             *  @type        {string[]}
             *  @description Namespace-owned parts value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const parts: string[] = [];
            parts.push(`M${anchors[0]!.x},${anchors[0]!.y}`);
            for (let i = 1; i < anchors.length; i++)
            {
                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = anchors[i - 1]!;

                /** @name        b
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned b value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const b = anchors[i]!;

                /** @name        c1x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c1x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c1x = a.x + a.hOut.x, c1y = a.y + a.hOut.y;

                /** @name        c2x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c2x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c2x = b.x + b.hIn.x, c2y = b.y + b.hIn.y;
                parts.push(`C${c1x},${c1y} ${c2x},${c2y} ${b.x},${b.y}`);
            }
            if (cur.closed && anchors.length > 1)
            {
                /** @name        last
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned last value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const last = anchors[anchors.length - 1]!;

                /** @name        first
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned first value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const first = anchors[0]!;

                /** @name        c1x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c1x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c1x = last.x + last.hOut.x, c1y = last.y + last.hOut.y;

                /** @name        c2x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c2x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c2x = first.x + first.hIn.x, c2y = first.y + first.hIn.y;
                parts.push(`C${c1x},${c1y} ${c2x},${c2y} ${first.x},${first.y} Z`);
            }
            return parts.join(' ');
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

        /** @name        #w
         *  @public
         *  @type        {number}
         *  @description Component member for w.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #w(): number { return parseInt(this.getAttribute('width') ?? '600', 10) || 600; }

        /** @name        #h
         *  @public
         *  @type        {number}
         *  @description Component member for h.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #h(): number { return parseInt(this.getAttribute('height') ?? '400', 10) || 400; }

        /** @name        #localPoint
         *  @public
         *  @type        {BezierEditor.Interfaces.Vec2}
         *  @description Component member for local Point.
         *  @param       {SVGSVGElement | null} svg Parameter.
         *  @param       {PointerEvent} e Parameter.
         *  @returns     {BezierEditor.Interfaces.Vec2} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #localPoint(svg: SVGSVGElement | null, e: PointerEvent): Interfaces.Vec2
        {
            if (!svg)
                return { x: 0, y: 0 };

            /** @name        rect
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rect value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rect = svg.getBoundingClientRect();

            /** @name        vbW
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned vbW value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const vbW = this.#w(), vbH = this.#h();

            /** @name        x
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned x value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const x = ((e.clientX - rect.left) / rect.width) * vbW;

            /** @name        y
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned y value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const y = ((e.clientY - rect.top) / rect.height) * vbH;
            return { x, y };
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
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true,
                detail: { anchors: this.getAnchors(), closed: cur.closed, d: this.toSVGPath() },
            }));
        }

        /** @name        #penDragIdx
         *  @public
         *  @type        {number | null}
         *  @description Component member for pen Drag Idx.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #penDragIdx: number | null = null;

        /** @name        #penDragOrigin
         *  @public
         *  @type        {BezierEditor.Interfaces.Vec2 | null}
         *  @description Component member for pen Drag Origin.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #penDragOrigin: Interfaces.Vec2 | null = null;

        /** @name        #anchorDragIdx
         *  @public
         *  @type        {number | null}
         *  @description Component member for anchor Drag Idx.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #anchorDragIdx: number | null = null;

        /** @name        #handleDragIdx
         *  @public
         *  @type        {number | null}
         *  @description Component member for handle Drag Idx.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #handleDragIdx: number | null = null;

        /** @name        #handleDragSide
         *  @public
         *  @type        {'in' | 'out' | null}
         *  @description Component member for handle Drag Side.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #handleDragSide: 'in' | 'out' | null = null;

        /** @name        #handleDragAlt
         *  @public
         *  @type        {unknown}
         *  @description Component member for handle Drag Alt.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #handleDragAlt = false;

        /** @name        viewBox
         *  @private
         *  @type        {() => string}
         *  @description Component member for view Box.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private viewBox: () => string = () => '0 0 600 400';

        /** @name        wStr
         *  @private
         *  @type        {() => string}
         *  @description Component member for w Str.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private wStr: () => string = () => '600';

        /** @name        hStr
         *  @private
         *  @type        {() => string}
         *  @description Component member for h Str.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hStr: () => string = () => '400';

        /** @name        pathD
         *  @private
         *  @type        {() => string}
         *  @description Component member for path D.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private pathD: () => string = () => '';

        /** @name        anchorList
         *  @private
         *  @type        {() => Array<{
            cx: string;
            cy: string;
            idx: number;
            cls: string;
        }>}
         *  @description Component member for anchor List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private anchorList: () => Array<{
            /** @name        cx
             *  @public
             *  @type        {string}
             *  @description Component member for cx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cx: string;

            /** @name        cy
             *  @public
             *  @type        {string}
             *  @description Component member for cy.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cy: string;

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
        }> = () => [];

        /** @name        handleSegments
         *  @private
         *  @type        {() => Array<{
            x1: string;
            y1: string;
            x2: string;
            y2: string;
        }>}
         *  @description Component member for handle Segments.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private handleSegments: () => Array<{
            /** @name        x1
             *  @public
             *  @type        {string}
             *  @description Component member for x1.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x1: string;

            /** @name        y1
             *  @public
             *  @type        {string}
             *  @description Component member for y1.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y1: string;

            /** @name        x2
             *  @public
             *  @type        {string}
             *  @description Component member for x2.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x2: string;

            /** @name        y2
             *  @public
             *  @type        {string}
             *  @description Component member for y2.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y2: string;
        }> = () => [];

        /** @name        handleDots
         *  @private
         *  @type        {() => Array<{
            cx: string;
            cy: string;
            idx: number;
            side: 'in' | 'out';
        }>}
         *  @description Component member for handle Dots.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private handleDots: () => Array<{
            /** @name        cx
             *  @public
             *  @type        {string}
             *  @description Component member for cx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cx: string;

            /** @name        cy
             *  @public
             *  @type        {string}
             *  @description Component member for cy.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cy: string;

            /** @name        idx
             *  @public
             *  @type        {number}
             *  @description Component member for idx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            idx: number;

            /** @name        side
             *  @public
             *  @type        {'in' | 'out'}
             *  @description Component member for side.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            side: 'in' | 'out';
        }> = () => [];

        /** @name        onSvgPointerDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Svg Pointer Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSvgPointerDown: (e: Event) => void = () => { };

        /** @name        onSvgPointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Svg Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSvgPointerMove: (e: Event) => void = () => { };

        /** @name        onSvgPointerUp
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Svg Pointer Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSvgPointerUp: (e: Event) => void = () => { };

        /** @name        onAnchorPointerDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Anchor Pointer Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAnchorPointerDown: (e: Event) => void = () => { };

        /** @name        onAnchorPointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Anchor Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAnchorPointerMove: (e: Event) => void = () => { };

        /** @name        onAnchorPointerUp
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Anchor Pointer Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onAnchorPointerUp: (e: Event) => void = () => { };

        /** @name        onHandlePointerDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Handle Pointer Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHandlePointerDown: (e: Event) => void = () => { };

        /** @name        onHandlePointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Handle Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHandlePointerMove: (e: Event) => void = () => { };

        /** @name        onHandlePointerUp
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Handle Pointer Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHandlePointerUp: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {BezierEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {BezierEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'inline-block',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                }),
                new Rule('.ar-bez__svg', { display: 'block', touchAction: 'none', cursor: 'crosshair' }),
                new Rule('.ar-bez__path', {
                    stroke: 'var(--arianna-text, #1f2328)',
                    strokeWidth: '1.5',
                }),
                new Rule('.ar-bez__handle-line', {
                    stroke: 'var(--arianna-muted, #6e6b62)',
                    strokeWidth: '0.5',
                    strokeDasharray: '2,2',
                }),
                new Rule('.ar-bez__handle-dot', {
                    fill: 'var(--arianna-bg, #fff)',
                    stroke: 'var(--arianna-primary, #1f6feb)',
                    strokeWidth: '1.5',
                    cursor: 'grab',
                }),
                new Rule('.ar-bez__anchor', {
                    fill: 'var(--arianna-primary, #1f6feb)',
                    stroke: '#fff',
                    strokeWidth: '2',
                    cursor: 'grab',
                }),
            ]);
        }
    }
}
export default BezierEditor;

export type Anchor = BezierEditor.Interfaces.Anchor;
export type BezierMode = BezierEditor.Types.BezierMode;
export type BezierEditorOptions = BezierEditor.Interfaces.BezierEditorOptions;
