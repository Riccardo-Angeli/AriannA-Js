/**
 * @module    components/charts/PieChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA PieChart component module.
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

/** @namespace   PieChart
 *  @public
 *  @description Namespace containing PieChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace PieChart
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
        /** @interface   PieDatum
         *  @public
         *  @description PieDatum contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PieDatum
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        value
             *  @public
             *  @type        {number}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value: number;

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;
        }

        /** @interface   PieChartOptions
         *  @public
         *  @description PieChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PieChartOptions
        {
            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number; // SVG square size
            /** @name        donut
             *  @public
             *  @type        {number}
             *  @description Component member for donut.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            donut?: number; // 0..1 — inner radius ratio (0 = pie, 0.5 = donut)
            /** @name        showLegend
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Legend.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showLegend?: boolean; // default true
            /** @name        showLabels
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Labels.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showLabels?: boolean; // labels on slices
            /** @name        startAngle
             *  @public
             *  @type        {number}
             *  @description Component member for start Angle.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            startAngle?: number; // radians, default -90deg
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
    export function polar(cx: number, cy: number, r: number, angle: number): [
        number,
        number
    ] {
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    }
    export function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number): string {
        /** @name        [x0, y0]
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned [x0, y0] value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const [x0, y0] = polar(cx, cy, rOuter, a0);

        /** @name        [x1, y1]
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned [x1, y1] value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const [x1, y1] = polar(cx, cy, rOuter, a1);

        /** @name        largeArc
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned largeArc value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
        if (rInner <= 0)
        {
            return `M ${cx} ${cy} L ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1} ${y1} Z`;
        }

        /** @name        [x2, y2]
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned [x2, y2] value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const [x2, y2] = polar(cx, cy, rInner, a1);

        /** @name        [x3, y3]
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned [x3, y3] value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const [x3, y3] = polar(cx, cy, rInner, a0);
        return [
            `M ${x0} ${y0}`,
            `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1} ${y1}`,
            `L ${x2} ${y2}`,
            `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x3} ${y3}`,
            'Z',
        ].join(' ');
    }

    /** @name        Polar
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned Polar value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function Polar
    (
        ...args: Parameters<typeof polar>
    ): ReturnType<typeof polar>
    {
        return polar(...args);
    }
    /** @name        ArcPath
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ArcPath value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ArcPath
    (
        ...args: Parameters<typeof arcPath>
    ): ReturnType<typeof arcPath>
    {
        return arcPath(...args);
    }
    /** @class       PieChart
     *  @public
     *  @description AriannA PieChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-pie-chart', {}, {
        Attributes: ['size', 'donut', 'show-legend', 'show-labels', 'start-angle'],
    })
    export class PieChart extends HTMLElement
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

        /** @name        data$
         *  @public
         *  @readonly
         *  @type        {PieChart.Types.Signal<PieChart.Interfaces.PieDatum[]>}
         *  @description Component member for data$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly data$: Types.Signal<Interfaces.PieDatum[]> = signal<Interfaces.PieDatum[]>([]);

        /** @name        #svg
         *  @public
         *  @type        {SVGSVGElement}
         *  @description Component member for svg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #svg?: SVGSVGElement;

        /** @name        #legend
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for legend.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #legend?: HTMLDivElement;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {PieChart.Interfaces.PieChartOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.PieChartOptions = {})
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
            if (opts.size != null)
                el.setAttribute('size', String(opts.size));
            if (opts.donut != null)
                el.setAttribute('donut', String(opts.donut));
            if (opts.showLegend === false)
                el.setAttribute('show-legend', 'false');
            if (opts.showLabels === true)
                el.setAttribute('show-labels', '');
            if (opts.startAngle != null)
                el.setAttribute('start-angle', String(opts.startAngle));
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
                    attribute(name: string): PieChart.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): PieChart.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {PieChart.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {PieChart.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {PieChart.Types.Stylesheet | null}
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
            if (root.querySelector('.pc-wrap'))
                return;

            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = parseInt(self.signal().attribute('size')?.Peek() ?? '280', 10) || 280;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'pc-wrap';

            /** @name        svg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned svg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
            svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
            svg.setAttribute('width', String(size));
            svg.setAttribute('height', String(size));
            svg.setAttribute('class', 'pc-svg');
            this.#svg = svg;
            wrap.appendChild(svg);

            /** @name        legend
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned legend value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const legend = document.createElement('div');
            legend.className = 'pc-legend';
            this.#legend = legend;
            wrap.appendChild(legend);
            root.appendChild(wrap);
            effect(() => { this.data$.Get(); this.#redraw(); });
            self.Sheet = PieChart.DefaultSheet();
        }

        /** @name        data
         *  @public
         *  @type        {void}
         *  @description Component member for data.
         *  @param       {PieChart.Interfaces.PieDatum[]} rows Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set data(rows: Interfaces.PieDatum[]) { this.data$.Set(rows); }

        /** @name        data
         *  @public
         *  @type        {PieChart.Interfaces.PieDatum[]}
         *  @description Component member for data.
         *  @returns     {PieChart.Interfaces.PieDatum[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get data(): Interfaces.PieDatum[] { return this.data$.Get(); }

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
                    attribute(name: string): PieChart.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): PieChart.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {PieChart.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {PieChart.Types.Signal<string | null>} Result.
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

            /** @name        legend
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned legend value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const legend = this.#legend;
            if (!svg || !legend)
                return;
            while (svg.firstChild)
                svg.removeChild(svg.firstChild);
            legend.innerHTML = '';

            /** @name        data
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned data value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const data = this.data$.Peek();
            if (!data.length)
                return;

            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = parseInt(svg.getAttribute('width') ?? '280', 10);

            /** @name        cx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cx = size / 2, cy = size / 2;

            /** @name        rOuter
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rOuter value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rOuter = size / 2 - 6;

            /** @name        donut
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned donut value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const donut = parseFloat(self.signal().attribute('donut')?.Peek() ?? '0') || 0;

            /** @name        rInner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rInner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rInner = rOuter * Math.max(0, Math.min(0.9, donut));

            /** @name        angle
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned angle value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let angle = parseFloat(self.signal().attribute('start-angle')?.Peek() ?? String(-Math.PI / 2)) || -Math.PI / 2;

            /** @name        total
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned total value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const total = data.reduce((s: any, d: any) => s + d.value, 0) || 1;

            /** @name        showLabels
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showLabels value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showLabels = self.signal().attribute('show-labels')?.Peek() != null;

            /** @name        showLegend
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showLegend value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showLegend = self.signal().attribute('show-legend')?.Peek() !== 'false';
            legend.style.display = showLegend ? '' : 'none';
            data.forEach((d: any, i: any) => {
                /** @name        slice
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned slice value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const slice = (d.value / total) * Math.PI * 2;

                /** @name        a0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a0 = angle;

                /** @name        a1
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a1 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a1 = angle + slice;
                angle = a1;

                /** @name        path
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned path value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('d', arcPath(cx, cy, rOuter, rInner, a0, a1));
                path.setAttribute('fill', d.color ?? this.#defaultColor(i));
                path.setAttribute('class', 'pc-slice');

                /** @name        pct
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pct value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pct = (d.value / total) * 100;
                path.addEventListener('mouseenter', () => self.fire('arianna:chart-slice-hover', { detail: { datum: d, index: i, percent: pct, source: this }, bubbles: true }));
                path.addEventListener('click', () => self.fire('arianna:chart-slice-click', { detail: { datum: d, index: i, percent: pct, source: this }, bubbles: true }));
                svg.appendChild(path);
                if (showLabels)
                {
                    /** @name        mid
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned mid value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const mid = (a0 + a1) / 2;

                    /** @name        r
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned r value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const r = rInner > 0 ? (rInner + rOuter) / 2 : rOuter * 0.65;

                    /** @name        [lx, ly]
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned [lx, ly] value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const [lx, ly] = polar(cx, cy, r, mid);

                    /** @name        lbl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned lbl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const lbl = document.createElementNS(SVG_NS, 'text');
                    lbl.setAttribute('x', String(lx));
                    lbl.setAttribute('y', String(ly + 4));
                    lbl.setAttribute('text-anchor', 'middle');
                    lbl.setAttribute('class', 'pc-label');
                    lbl.textContent = pct.toFixed(0) + '%';
                    svg.appendChild(lbl);
                }
                // Legend item
                /** @name        li
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned li value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const li = document.createElement('div');
                li.className = 'pc-legend-item';

                /** @name        sw
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sw value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sw = document.createElement('span');
                sw.className = 'pc-legend-sw';
                sw.style.background = d.color ?? this.#defaultColor(i);

                /** @name        lbl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lbl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lbl = document.createElement('span');
                lbl.className = 'pc-legend-lbl';
                lbl.textContent = `${d.label} · ${pct.toFixed(1)}%`;
                li.appendChild(sw);
                li.appendChild(lbl);
                legend.appendChild(li);
            });
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
            const palette = ['#7eb8f7', '#f47e7e', '#7ef7a8', '#f7c97e', '#b87ef7', '#7ef7e3', '#f77ec4', '#a8f77e'];
            return palette[i % palette.length] ?? '#7eb8f7';
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {PieChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {PieChart.Types.Stylesheet} Result.
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
                    padding: '12px',
                }),
                new Rule(':host .pc-wrap', {
                    alignItems: 'center',
                    display: 'flex',
                    gap: '16px',
                }),
                new Rule(':host .pc-svg', { display: 'block' }),
                new Rule(':host .pc-slice', {
                    cursor: 'pointer',
                    stroke: 'var(--ar-bg, #fff)',
                    strokeWidth: '2',
                    transition: 'opacity 0.15s',
                }),
                new Rule(':host .pc-slice:hover', { opacity: '0.85' }),
                new Rule(':host .pc-label', {
                    fill: '#fff',
                    fontSize: '11px',
                    fontWeight: '700',
                    pointerEvents: 'none',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }),
                new Rule(':host .pc-legend', {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }),
                new Rule(':host .pc-legend-item', {
                    alignItems: 'center',
                    display: 'flex',
                    fontSize: '0.78rem',
                    gap: '6px',
                }),
                new Rule(':host .pc-legend-sw', {
                    borderRadius: '2px',
                    display: 'inline-block',
                    height: '12px',
                    width: '12px',
                }),
            ]);
        }
    }
}
export default PieChart;

export type PieChartOptions = PieChart.Interfaces.PieChartOptions;
export type PieDatum = PieChart.Interfaces.PieDatum;
