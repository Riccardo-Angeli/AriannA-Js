/**
 * @module    components/animations/CurveEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA CurveEditor component module.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   CurveEditor
 *  @public
 *  @description Namespace containing CurveEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace CurveEditor
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
        /** @interface   CurveEditorOptions
         *  @public
         *  @description CurveEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CurveEditorOptions
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
        }

        /** @interface   CurveSample
         *  @public
         *  @description CurveSample contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CurveSample
        {
            /** @name        track
             *  @public
             *  @type        {Element}
             *  @description Component member for track.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            track: Element;

            /** @name        group
             *  @public
             *  @type        {string}
             *  @description Component member for group.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            group: string;

            /** @name        points
             *  @public
             *  @type        {Array<{
                frame: number;
                value: number;
                selected: boolean;
                interp: string;
                hIn: [
                    number,
                    number
                ];
                hOut: [
                    number,
                    number
                ];
            }>}
             *  @description Component member for points.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            points: Array<{
                /** @name        frame
                 *  @public
                 *  @type        {number}
                 *  @description Component member for frame.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                frame: number;

                /** @name        value
                 *  @public
                 *  @type        {number}
                 *  @description Component member for value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value: number;

                /** @name        selected
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for selected.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                selected: boolean;

                /** @name        interp
                 *  @public
                 *  @type        {string}
                 *  @description Component member for interp.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                interp: string;

                /** @name        hIn
                 *  @public
                 *  @type        {[
                    number,
                    number
                ]}
                 *  @description Component member for h In.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                hIn: [
                    number,
                    number
                ];

                /** @name        hOut
                 *  @public
                 *  @type        {[
                    number,
                    number
                ]}
                 *  @description Component member for h Out.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                hOut: [
                    number,
                    number
                ];
            }>;
        }
    }

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

    /** @name        effect
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned effect value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const effect = (fn: () => void): (() => void) => {
        /** @name        e
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned e value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const e = Reactivity.CreateEffect(fn);
        return () => e.Stop();
    };

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        SVG_NS
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned SVG_NS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const SVG_NS = 'http://www.w3.org/2000/svg';

    /** @class       CurveEditor
     *  @public
     *  @description AriannA CurveEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-curve-editor', {}, {
        Attributes: ['width', 'height'],
    })
    export class CurveEditor extends HTMLElement
    {
        /** @name        samples$
         *  @public
         *  @readonly
         *  @type        {CurveEditor.Types.Signal<CurveEditor.Interfaces.CurveSample[]>}
         *  @description Component member for samples$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly samples$: Types.Signal<Interfaces.CurveSample[]> = signal<Interfaces.CurveSample[]>([]);

        /** @name        playhead$
         *  @public
         *  @readonly
         *  @type        {CurveEditor.Types.Signal<number>}
         *  @description Component member for playhead$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly playhead$: Types.Signal<number> = signal(0);

        /** @name        #svg
         *  @public
         *  @type        {SVGSVGElement}
         *  @description Component member for svg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #svg?: SVGSVGElement;

        /** @name        #bound
         *  @public
         *  @type        {Element}
         *  @description Component member for bound.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #bound?: Element; // bound KeyframeEditor instance
        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {CurveEditor.Interfaces.CurveEditorOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.CurveEditorOptions = {})
        {
            super();

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;
            };

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = self.render();
            if (opts.width != null)
                el.setAttribute('width', String(opts.width));
            if (opts.height != null)
                el.setAttribute('height', String(opts.height));
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(): void
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;

                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): CurveEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): CurveEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {CurveEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {CurveEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {CurveEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            };

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = self.render();
            if (root.querySelector('svg'))
                return;

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = parseInt(self.signal().attribute('width')?.Peek() ?? '720', 10) || 720;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = parseInt(self.signal().attribute('height')?.Peek() ?? '260', 10) || 260;

            /** @name        svg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned svg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svg.setAttribute('width', String(w));
            svg.setAttribute('height', String(h));
            svg.setAttribute('class', 'ce-svg');
            this.#svg = svg;
            root.appendChild(svg);
            effect(() => { this.samples$.Get(); this.playhead$.Get(); this.#redraw(); });
            self.Sheet = CurveEditor.DefaultSheet();
        }

        /** Bind to a KeyframeEditor element. The CurveEditor will read its
         *  tracks + keyframes on each update event. */
        bindEditor(editor: Element): this
        {
            this.#bound = editor;
            editor.addEventListener('arianna:keyframe-editor-update', () => this.#refresh());
            editor.addEventListener('arianna:keyframe-editor-playhead', (e: Event) => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = (e as CustomEvent<{
                    /** @name        frame
                     *  @public
                     *  @type        {number}
                     *  @description Component member for frame.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    frame: number;
                }>).detail;
                this.playhead$.Set(d.frame);
            });
            this.#refresh();
            return this;
        }

        /** @name        #refresh
         *  @public
         *  @type        {void}
         *  @description Component member for refresh.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #refresh(): void
        {
            if (!this.#bound)
            {
                this.samples$.Set([]);
                return;
            }

            /** @name        tracks
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tracks value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tracks = Array.from(this.#bound.querySelectorAll('arianna-anim-track'));

            /** @name        samples
             *  @public
             *  @type        {CurveEditor.Interfaces.CurveSample[]}
             *  @description Namespace-owned samples value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const samples: Interfaces.CurveSample[] = tracks.map(t => {
                if (t.hasAttribute('hidden'))
                {
                    return { track: t, group: t.getAttribute('group') ?? 'custom', points: [] };
                }

                /** @name        kfs
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kfs value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kfs = Array.from(t.querySelectorAll('arianna-keyframe'));

                /** @name        points
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned points value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const points = kfs.map(k => ({
                    frame: parseFloat(k.getAttribute('frame') ?? '0') || 0,
                    value: parseFloat(k.getAttribute('value') ?? '0') || 0,
                    selected: k.hasAttribute('selected'),
                    interp: k.getAttribute('interpolation') ?? 'bezier',
                    hIn: [-1, 0] as [
                        number,
                        number
                    ],
                    hOut: [1, 0] as [
                        number,
                        number
                    ],
                }));
                points.sort((a, b) => a.frame - b.frame);
                return { track: t, group: t.getAttribute('group') ?? 'custom', points };
            });
            this.samples$.Set(samples);
        }

        /** @name        #redraw
         *  @public
         *  @type        {void}
         *  @description Component member for redraw.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #redraw(): void
        {
            /** @name        svg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned svg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const svg = this.#svg;
            if (!svg)
                return;
            while (svg.firstChild)
                svg.removeChild(svg.firstChild);

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = parseInt(svg.getAttribute('width') ?? '720', 10);

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = parseInt(svg.getAttribute('height') ?? '260', 10);

            /** @name        samples
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned samples value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const samples = this.samples$.Peek();
            if (!samples.length)
                return;

            /** @name        padL
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned padL value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const padL = 40, padR = 12, padT = 12, padB = 24;

            /** @name        plotW
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned plotW value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const plotW = w - padL - padR;

            /** @name        plotH
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned plotH value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const plotH = h - padT - padB;
            // Compute domain
            /** @name        fMin
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned fMin value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let fMin = 0, fMax = 0, vMin = 0, vMax = 0;
            for (const s of samples)
                for (const p of s.points)
                {
                    if (p.frame < fMin)
                        fMin = p.frame;
                    if (p.frame > fMax)
                        fMax = p.frame;
                    if (p.value < vMin)
                        vMin = p.value;
                    if (p.value > vMax)
                        vMax = p.value;
                }
            if (fMin === fMax)
                fMax = fMin + 1;
            if (vMin === vMax)
            {
                vMin -= 0.5;
                vMax += 0.5;
            }

            /** @name        fR
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned fR value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const fR = fMax - fMin, vR = vMax - vMin;

            /** @name        xOf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned xOf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const xOf = (f: number) => padL + ((f - fMin) / fR) * plotW;

            /** @name        yOf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned yOf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const yOf = (v: number) => padT + plotH - ((v - vMin) / vR) * plotH;
            // Grid
            for (let i = 0; i <= 4; i++)
            {
                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = padT + (plotH * i / 4);

                /** @name        line
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned line value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const line = document.createElementNS(SVG_NS, 'line');
                line.setAttribute('x1', String(padL));
                line.setAttribute('x2', String(w - padR));
                line.setAttribute('y1', String(y));
                line.setAttribute('y2', String(y));
                line.setAttribute('class', 'ce-grid');
                svg.appendChild(line);
            }
            // Curves
            for (const s of samples)
            {
                if (s.points.length < 1)
                    continue;

                /** @name        groupVar
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned groupVar value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const groupVar = s.group === 'position' ? 'var(--arianna-curve-position, #4dd0e1)' :
                    s.group === 'rotation' ? 'var(--arianna-curve-rotation, #ff9800)' :
                        s.group === 'scale' ? 'var(--arianna-curve-scale, #7eb8f7)' :
                            'var(--ar-muted, #888)';

                /** @name        path
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned path value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const path = document.createElementNS(SVG_NS, 'path');

                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let d = '';
                s.points.forEach((p: any, i: any) => {
                    /** @name        x
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x = xOf(p.frame);

                    /** @name        y
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned y value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const y = yOf(p.value);
                    if (i === 0)
                        d += `M ${x} ${y}`;
                    else
                    {
                        /** @name        prev
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned prev value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const prev = s.points[i - 1]!;
                        if (prev.interp === 'constant')
                        {
                            d += ` H ${x} V ${y}`;
                        }
                        else if (prev.interp === 'linear')
                        {
                            d += ` L ${x} ${y}`;
                        }
                        else
                        {
                            // Bezier — handles in (frames, value) units
                            /** @name        c1x
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned c1x value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const c1x = xOf(prev.frame + Math.max(0.1, prev.hOut[0]));

                            /** @name        c1y
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned c1y value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const c1y = yOf(prev.value + prev.hOut[1]);

                            /** @name        c2x
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned c2x value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const c2x = xOf(p.frame - Math.max(0.1, -p.hIn[0]));

                            /** @name        c2y
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned c2y value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const c2y = yOf(p.value + p.hIn[1]);
                            d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y}`;
                        }
                    }
                });
                path.setAttribute('d', d);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', groupVar);
                path.setAttribute('class', 'ce-curve');
                svg.appendChild(path);
                // Keyframe dots
                for (const p of s.points)
                {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = document.createElementNS(SVG_NS, 'circle');
                    c.setAttribute('cx', String(xOf(p.frame)));
                    c.setAttribute('cy', String(yOf(p.value)));
                    c.setAttribute('r', p.selected ? '4' : '3');
                    c.setAttribute('fill', groupVar);
                    c.setAttribute('class', 'ce-key' + (p.selected ? ' ce-key-selected' : ''));
                    svg.appendChild(c);
                    // Bezier handles if selected
                    if (p.selected && p.interp === 'bezier')
                    {
                        /** @name        drawHandle
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned drawHandle value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const drawHandle = (off: [
                            number,
                            number
                        ]) => {
                            /** @name        hx
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned hx value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const hx = xOf(p.frame + off[0]);

                            /** @name        hy
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned hy value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const hy = yOf(p.value + off[1]);

                            /** @name        line
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned line value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const line = document.createElementNS(SVG_NS, 'line');
                            line.setAttribute('x1', String(xOf(p.frame)));
                            line.setAttribute('y1', String(yOf(p.value)));
                            line.setAttribute('x2', String(hx));
                            line.setAttribute('y2', String(hy));
                            line.setAttribute('class', 'ce-handle-line');
                            line.setAttribute('stroke', groupVar);
                            svg.appendChild(line);

                            /** @name        hd
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned hd value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const hd = document.createElementNS(SVG_NS, 'rect');
                            hd.setAttribute('x', String(hx - 3));
                            hd.setAttribute('y', String(hy - 3));
                            hd.setAttribute('width', '6');
                            hd.setAttribute('height', '6');
                            hd.setAttribute('class', 'ce-handle');
                            hd.setAttribute('fill', groupVar);
                            svg.appendChild(hd);
                        };
                        drawHandle(p.hIn);
                        drawHandle(p.hOut);
                    }
                }
            }
            // Playhead
            /** @name        ph
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ph value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ph = this.playhead$.Peek();
            if (ph >= fMin && ph <= fMax)
            {
                /** @name        phLine
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned phLine value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const phLine = document.createElementNS(SVG_NS, 'line');
                phLine.setAttribute('x1', String(xOf(ph)));
                phLine.setAttribute('x2', String(xOf(ph)));
                phLine.setAttribute('y1', String(padT));
                phLine.setAttribute('y2', String(h - padB));
                phLine.setAttribute('class', 'ce-playhead');
                svg.appendChild(phLine);
            }
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {CurveEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {CurveEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    display: 'inline-block',
                    padding: '8px',
                }),
                new Rule(':host .ce-svg', { display: 'block' }),
                new Rule(':host .ce-grid', { stroke: 'var(--ar-border, #2a2a2a)', strokeWidth: '1', strokeDasharray: '2 3' }),
                new Rule(':host .ce-curve', { strokeWidth: '1.5', fill: 'none' }),
                new Rule(':host .ce-key', { stroke: '#fff', strokeWidth: '1' }),
                new Rule(':host .ce-key-selected', { stroke: 'var(--ar-warning, #ff9800)', strokeWidth: '2' }),
                new Rule(':host .ce-handle-line', { strokeWidth: '1', strokeDasharray: '2 2', opacity: '0.6' }),
                new Rule(':host .ce-handle', { stroke: '#fff', strokeWidth: '1', cursor: 'grab' }),
                new Rule(':host .ce-playhead', { stroke: 'var(--ar-danger, #f44336)', strokeWidth: '1.5' }),
            ]);
        }
    }
}
export default CurveEditor;

export type CurveEditorOptions = CurveEditor.Interfaces.CurveEditorOptions;
