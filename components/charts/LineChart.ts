/**
 * @module    components/charts/LineChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA LineChart component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   LineChart
 *  @public
 *  @description Namespace containing LineChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace LineChart
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

        /** @name        LinePoint
         *  @public
         *  @type        {[
            number,
            number
        ]}
         *  @description Type alias for LinePoint.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type LinePoint = [
            number,
            number
        ]; // [x, y]
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   LineSeries
         *  @public
         *  @description LineSeries contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LineSeries
        {
            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        points
             *  @public
             *  @type        {LineChart.Types.LinePoint[]}
             *  @description Component member for points.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            points: Types.LinePoint[];

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;
        }

        /** @interface   LineChartOptions
         *  @public
         *  @description LineChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LineChartOptions
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

            /** @name        area
             *  @public
             *  @type        {boolean}
             *  @description Component member for area.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            area?: boolean; // fill below the line
            /** @name        smooth
             *  @public
             *  @type        {boolean}
             *  @description Component member for smooth.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            smooth?: boolean; // Catmull-Rom smoothing
            /** @name        showGrid
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Grid.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showGrid?: boolean;

            /** @name        showDots
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Dots.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showDots?: boolean;
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

    /** @class       LineChart
     *  @public
     *  @description AriannA LineChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-line-chart', {}, {
        Attributes: ['width', 'height', 'area', 'smooth', 'show-grid', 'show-dots'],
    })
    export class LineChart extends HTMLElement
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        series$
         *  @public
         *  @readonly
         *  @type        {LineChart.Types.Signal<LineChart.Interfaces.LineSeries[]>}
         *  @description Component member for series$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly series$: Types.Signal<Interfaces.LineSeries[]> = signal<Interfaces.LineSeries[]>([]);

        /** @name        #svg
         *  @public
         *  @type        {SVGSVGElement}
         *  @description Component member for svg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #svg?: SVGSVGElement;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {LineChart.Interfaces.LineChartOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.LineChartOptions = {})
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
            if (opts.area)
                el.setAttribute('area', '');
            if (opts.smooth)
                el.setAttribute('smooth', '');
            if (opts.showGrid === false)
                el.setAttribute('show-grid', 'false');
            if (opts.showDots === true)
                el.setAttribute('show-dots', '');
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
                    attribute(name: string): LineChart.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): LineChart.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {LineChart.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {LineChart.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {LineChart.Types.Stylesheet | null}
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
            const w = parseInt(self.signal().attribute('width')?.Peek() ?? '480', 10) || 480;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = parseInt(self.signal().attribute('height')?.Peek() ?? '240', 10) || 240;

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
            svg.setAttribute('class', 'lc-svg');
            this.#svg = svg;
            root.appendChild(svg);
            effect(() => { this.series$.Get(); this.#redraw(); });
            self.Sheet = LineChart.DefaultSheet();
        }

        /** @name        series
         *  @public
         *  @type        {void}
         *  @description Component member for series.
         *  @param       {LineChart.Interfaces.LineSeries[]} s Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set series(s: Interfaces.LineSeries[]) { this.series$.Set(s); }

        /** @name        series
         *  @public
         *  @type        {LineChart.Interfaces.LineSeries[]}
         *  @description Component member for series.
         *  @returns     {LineChart.Interfaces.LineSeries[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get series(): Interfaces.LineSeries[] { return this.series$.Get(); }

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

                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;

                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): LineChart.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): LineChart.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {LineChart.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {LineChart.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };
            };

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

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = self.render();

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = parseInt(svg.getAttribute('width') ?? '480', 10);

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = parseInt(svg.getAttribute('height') ?? '240', 10);

            /** @name        series
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned series value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const series = this.series$.Peek();
            if (!series.length)
                return;

            /** @name        showGrid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showGrid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showGrid = self.signal().attribute('show-grid')?.Peek() !== 'false';

            /** @name        showDots
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showDots value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showDots = self.signal().attribute('show-dots')?.Peek() != null;

            /** @name        fillArea
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned fillArea value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const fillArea = root.hasAttribute('area');

            /** @name        smooth
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned smooth value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const smooth = root.hasAttribute('smooth');

            /** @name        padL
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned padL value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const padL = 40, padR = 12, padT = 12, padB = 28;

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
            // Compute range
            /** @name        xMin
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned xMin value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
            for (const s of series)
                for (const [x, y] of s.points)
                {
                    if (x < xMin)
                        xMin = x;
                    if (x > xMax)
                        xMax = x;
                    if (y < yMin)
                        yMin = y;
                    if (y > yMax)
                        yMax = y;
                }
            if (!isFinite(xMin))
            {
                xMin = 0;
                xMax = 1;
                yMin = 0;
                yMax = 1;
            }

            /** @name        xR
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned xR value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const xR = (xMax - xMin) || 1, yR = (yMax - yMin) || 1;

            /** @name        xOf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned xOf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const xOf = (x: number) => padL + ((x - xMin) / xR) * plotW;

            /** @name        yOf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned yOf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const yOf = (y: number) => padT + plotH - ((y - yMin) / yR) * plotH;
            // Grid
            if (showGrid)
            {
                /** @name        ticks
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ticks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ticks = 4;
                for (let i = 0; i <= ticks; i++)
                {
                    /** @name        v
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned v value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const v = yMin + (yR * i / ticks);

                    /** @name        y
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned y value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const y = yOf(v);

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
                    line.setAttribute('class', 'lc-grid');
                    svg.appendChild(line);

                    /** @name        lbl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned lbl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const lbl = document.createElementNS(SVG_NS, 'text');
                    lbl.setAttribute('x', String(padL - 4));
                    lbl.setAttribute('y', String(y + 4));
                    lbl.setAttribute('text-anchor', 'end');
                    lbl.setAttribute('class', 'lc-tick');
                    lbl.textContent = v.toFixed(yR > 10 ? 0 : 1);
                    svg.appendChild(lbl);
                }
            }
            // Each series
            series.forEach((s: any, sIdx: any) => {
                if (!s.points.length)
                    return;

                /** @name        color
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned color value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const color = s.color ?? this.#defaultColor(sIdx);
                // Path
                /** @name        path
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned path value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const path = this.#buildPath(s.points, xOf, yOf, smooth);
                if (fillArea)
                {
                    /** @name        area
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned area value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const area = document.createElementNS(SVG_NS, 'path');

                    /** @name        y0
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned y0 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const y0 = yOf(Math.max(0, yMin));

                    /** @name        xs
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned xs value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const xs = s.points[0]?.[0] ?? 0;

                    /** @name        xe
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned xe value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const xe = s.points[s.points.length - 1]?.[0] ?? 0;
                    area.setAttribute('d', `M ${xOf(xs)} ${y0} ` + path.replace(/^M /, 'L ') + ` L ${xOf(xe)} ${y0} Z`);
                    area.setAttribute('fill', color);
                    area.setAttribute('class', 'lc-area');
                    svg.appendChild(area);
                }

                /** @name        ln
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ln value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ln = document.createElementNS(SVG_NS, 'path');
                ln.setAttribute('d', path);
                ln.setAttribute('fill', 'none');
                ln.setAttribute('stroke', color);
                ln.setAttribute('class', 'lc-line');
                svg.appendChild(ln);
                // Dots
                if (showDots)
                {
                    s.points.forEach(([x, y]: any, i: any) => {
                        /** @name        c
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned c value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const c = document.createElementNS(SVG_NS, 'circle');
                        c.setAttribute('cx', String(xOf(x)));
                        c.setAttribute('cy', String(yOf(y)));
                        c.setAttribute('r', '3');
                        c.setAttribute('fill', color);
                        c.setAttribute('class', 'lc-dot');
                        c.addEventListener('mouseenter', () => self.fire('arianna:chart-point-hover', { detail: { series: s, point: [x, y], index: i, source: this }, bubbles: true }));
                        svg.appendChild(c);
                    });
                }
            });
        }

        /** @name        #buildPath
         *  @public
         *  @type        {string}
         *  @description Component member for build Path.
         *  @param       {LineChart.Types.LinePoint[]} pts Parameter.
         *  @param       {(x: number) => number} xOf Parameter.
         *  @param       {(y: number) => number} yOf Parameter.
         *  @param       {boolean} smooth Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #buildPath(pts: Types.LinePoint[], xOf: (x: number) => number, yOf: (y: number) => number, smooth: boolean): string
        {
            if (!pts.length)
                return '';
            if (!smooth || pts.length < 3)
            {
                return 'M ' + pts.map(([x, y]) => `${xOf(x)} ${yOf(y)}`).join(' L ');
            }
            // Catmull-Rom → Bezier
            /** @name        points
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned points value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const points = pts.map(([x, y]) => [xOf(x), yOf(y)] as [
                number,
                number
            ]);

            /** @name        d
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned d value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let d = `M ${points[0]![0]} ${points[0]![1]}`;
            for (let i = 0; i < points.length - 1; i++)
            {
                /** @name        p0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned p0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const p0 = points[i - 1] ?? points[i]!;

                /** @name        p1
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned p1 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const p1 = points[i]!;

                /** @name        p2
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned p2 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const p2 = points[i + 1]!;

                /** @name        p3
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned p3 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const p3 = points[i + 2] ?? p2;

                /** @name        c1x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c1x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c1x = p1[0] + (p2[0] - p0[0]) / 6;

                /** @name        c1y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c1y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c1y = p1[1] + (p2[1] - p0[1]) / 6;

                /** @name        c2x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c2x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c2x = p2[0] - (p3[0] - p1[0]) / 6;

                /** @name        c2y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c2y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c2y = p2[1] - (p3[1] - p1[1]) / 6;
                d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
            }
            return d;
        }

        /** @name        #defaultColor
         *  @public
         *  @type        {string}
         *  @description Component member for default Color.
         *  @param       {number} i Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #defaultColor(i: number): string
        {
            /** @name        palette
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned palette value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const palette = ['#7eb8f7', '#f47e7e', '#7ef7a8', '#f7c97e', '#b87ef7', '#7ef7e3'];
            return palette[i % palette.length] ?? '#7eb8f7';
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {LineChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {LineChart.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg, #fff)',
                    border: '1px solid var(--ar-border, #e0e0e0)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    color: 'var(--ar-text, #1a1a1a)',
                    display: 'inline-block',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                    padding: '8px',
                }),
                new Rule(':host .lc-svg', { display: 'block' }),
                new Rule(':host .lc-grid', { stroke: 'var(--ar-border, #e0e0e0)', strokeWidth: '1' }),
                new Rule(':host .lc-tick', { fill: 'var(--ar-muted, #888)', fontSize: '11px' }),
                new Rule(':host .lc-line', { strokeWidth: '2', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
                new Rule(':host .lc-area', { opacity: '0.15' }),
                new Rule(':host .lc-dot', { cursor: 'pointer' }),
            ]);
        }
    }
}
export default LineChart;

export type LineChartOptions = LineChart.Interfaces.LineChartOptions;
export type LineSeries = LineChart.Interfaces.LineSeries;
export type LinePoint = LineChart.Types.LinePoint;
