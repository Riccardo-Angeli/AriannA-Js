/**
 * @module    components/charts/BarChart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BarChart component module.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   BarChart
 *  @public
 *  @description Namespace containing BarChart contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace BarChart
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
        /** @interface   BarDatum
         *  @public
         *  @description BarDatum contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BarDatum
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

        /** @interface   BarChartOptions
         *  @public
         *  @description BarChartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BarChartOptions
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

            /** @name        barColor
             *  @public
             *  @type        {string}
             *  @description Component member for bar Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            barColor?: string;

            /** @name        showValues
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Values.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showValues?: boolean;

            /** @name        showGrid
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Grid.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showGrid?: boolean;

            /** @name        yMin
             *  @public
             *  @type        {number}
             *  @description Component member for y Min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            yMin?: number;

            /** @name        yMax
             *  @public
             *  @type        {number}
             *  @description Component member for y Max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            yMax?: number;
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

    /** @class       BarChart
     *  @public
     *  @description AriannA BarChart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-bar-chart', {}, {
        Attributes: ['width', 'height', 'bar-color', 'show-values', 'show-grid', 'y-min', 'y-max'],
    })
    export class BarChart extends HTMLElement
    {
        /** @name        data$
         *  @public
         *  @readonly
         *  @type        {BarChart.Types.Signal<BarChart.Interfaces.BarDatum[]>}
         *  @description Component member for data$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly data$: Types.Signal<Interfaces.BarDatum[]> = signal<Interfaces.BarDatum[]>([]);

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
         *  @param       {BarChart.Interfaces.BarChartOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.BarChartOptions = {})
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
            if (opts.barColor)
                el.setAttribute('bar-color', opts.barColor);
            if (opts.showValues != null)
                el.setAttribute('show-values', opts.showValues ? 'true' : 'false');
            if (opts.showGrid === false)
                el.setAttribute('show-grid', 'false');
            if (opts.yMin != null)
                el.setAttribute('y-min', String(opts.yMin));
            if (opts.yMax != null)
                el.setAttribute('y-max', String(opts.yMax));
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
                    attribute(name: string): BarChart.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): BarChart.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {BarChart.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {BarChart.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {BarChart.Types.Stylesheet | null}
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
            const h = parseInt(self.signal().attribute('height')?.Peek() ?? '280', 10) || 280;

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
            svg.setAttribute('class', 'bc-svg');
            this.#svg = svg;
            root.appendChild(svg);
            effect(() => { this.data$.Get(); this.#redraw(); });
            self.Sheet = BarChart.DefaultSheet();
        }

        /** @name        data
         *  @public
         *  @type        {void}
         *  @description Component member for data.
         *  @param       {BarChart.Interfaces.BarDatum[]} rows Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set data(rows: Interfaces.BarDatum[]) { this.data$.Set(rows); }

        /** @name        data
         *  @public
         *  @type        {BarChart.Interfaces.BarDatum[]}
         *  @description Component member for data.
         *  @returns     {BarChart.Interfaces.BarDatum[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get data(): Interfaces.BarDatum[] { return this.data$.Get(); }

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
                    attribute(name: string): BarChart.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): BarChart.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {BarChart.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {BarChart.Types.Signal<string | null>} Result.
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
            const h = parseInt(svg.getAttribute('height') ?? '280', 10);

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

            /** @name        showGrid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showGrid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showGrid = self.signal().attribute('show-grid')?.Peek() !== 'false';

            /** @name        showValues
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned showValues value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const showValues = self.signal().attribute('show-values')?.Peek() === 'true';

            /** @name        barColor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned barColor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const barColor = self.signal().attribute('bar-color')?.Peek() ?? '';

            /** @name        cssBarColor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cssBarColor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cssBarColor = barColor || (getComputedStyle(root).getPropertyValue('--ar-primary').trim() || '#7eb8f7');

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

            /** @name        userMin
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned userMin value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const userMin = parseFloat(self.signal().attribute('y-min')?.Peek() ?? '');

            /** @name        userMax
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned userMax value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const userMax = parseFloat(self.signal().attribute('y-max')?.Peek() ?? '');

            /** @name        dataMax
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dataMax value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dataMax = Math.max(...data.map((d: any) => d.value));

            /** @name        dataMin
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dataMin value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dataMin = Math.min(...data.map((d: any) => d.value));

            /** @name        yMax
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned yMax value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const yMax = isFinite(userMax) ? userMax : Math.max(0, dataMax) * 1.1;

            /** @name        yMin
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned yMin value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const yMin = isFinite(userMin) ? userMin : Math.min(0, dataMin);

            /** @name        range
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned range value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const range = (yMax - yMin) || 1;

            /** @name        yOf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned yOf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const yOf = (v: number) => padT + plotH - ((v - yMin) / range) * plotH;

            /** @name        barW
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned barW value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const barW = plotW / data.length * 0.72;

            /** @name        gap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned gap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const gap = plotW / data.length * 0.28;
            // Grid + Y axis ticks
            if (showGrid)
            {
                /** @name        ticks
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ticks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ticks = 5;
                for (let i = 0; i <= ticks; i++)
                {
                    /** @name        v
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned v value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const v = yMin + (range * i / ticks);

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
                    line.setAttribute('class', 'bc-grid');
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
                    lbl.setAttribute('class', 'bc-tick');
                    lbl.setAttribute('text-anchor', 'end');
                    lbl.textContent = v.toFixed(range > 10 ? 0 : 1);
                    svg.appendChild(lbl);
                }
            }
            // Bars + X labels
            data.forEach((d: any, i: any) => {
                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = padL + i * (barW + gap) + gap / 2;

                /** @name        yV
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned yV value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const yV = yOf(d.value);

                /** @name        y0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y0 = yOf(0);

                /** @name        top
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned top value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const top = Math.min(yV, y0);

                /** @name        ht
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ht value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ht = Math.abs(yV - y0);

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = document.createElementNS(SVG_NS, 'rect');
                rect.setAttribute('x', String(x));
                rect.setAttribute('y', String(top));
                rect.setAttribute('width', String(barW));
                rect.setAttribute('height', String(Math.max(1, ht)));
                rect.setAttribute('fill', d.color ?? cssBarColor);
                rect.setAttribute('class', 'bc-bar');
                rect.addEventListener('mouseenter', () => self.fire('arianna:chart-bar-hover', { detail: { datum: d, index: i, source: this }, bubbles: true }));
                rect.addEventListener('click', () => self.fire('arianna:chart-bar-click', { detail: { datum: d, index: i, source: this }, bubbles: true }));
                svg.appendChild(rect);
                if (showValues)
                {
                    /** @name        val
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned val value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const val = document.createElementNS(SVG_NS, 'text');
                    val.setAttribute('x', String(x + barW / 2));
                    val.setAttribute('y', String(top - 4));
                    val.setAttribute('text-anchor', 'middle');
                    val.setAttribute('class', 'bc-val');
                    val.textContent = d.value.toFixed(range > 10 ? 0 : 1);
                    svg.appendChild(val);
                }

                /** @name        lbl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lbl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lbl = document.createElementNS(SVG_NS, 'text');
                lbl.setAttribute('x', String(x + barW / 2));
                lbl.setAttribute('y', String(h - padB + 18));
                lbl.setAttribute('text-anchor', 'middle');
                lbl.setAttribute('class', 'bc-label');
                lbl.textContent = d.label;
                svg.appendChild(lbl);
            });
            // Zero line if range crosses zero
            if (yMin < 0 && yMax > 0)
            {
                /** @name        y0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y0 = yOf(0);

                /** @name        zero
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned zero value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const zero = document.createElementNS(SVG_NS, 'line');
                zero.setAttribute('x1', String(padL));
                zero.setAttribute('x2', String(w - padR));
                zero.setAttribute('y1', String(y0));
                zero.setAttribute('y2', String(y0));
                zero.setAttribute('class', 'bc-zero');
                svg.appendChild(zero);
            }
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {BarChart.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {BarChart.Types.Stylesheet} Result.
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
                new Rule(':host .bc-svg', { display: 'block' }),
                new Rule(':host .bc-grid', { stroke: 'var(--ar-border, #e0e0e0)', strokeWidth: '1' }),
                new Rule(':host .bc-zero', { stroke: 'var(--ar-text, #1a1a1a)', strokeWidth: '1' }),
                new Rule(':host .bc-tick', { fill: 'var(--ar-muted, #888)', fontSize: '11px' }),
                new Rule(':host .bc-label', { fill: 'var(--ar-text, #1a1a1a)', fontSize: '12px' }),
                new Rule(':host .bc-val', { fill: 'var(--ar-text, #1a1a1a)', fontSize: '11px', fontWeight: '600' }),
                new Rule(':host .bc-bar', { cursor: 'pointer', transition: 'opacity 0.15s' }),
                new Rule(':host .bc-bar:hover', { opacity: '0.8' }),
            ]);
        }
    }
}
export default BarChart;

export type BarChartOptions = BarChart.Interfaces.BarChartOptions;
export type BarDatum = BarChart.Interfaces.BarDatum;
