/**
 * @module    components/finance/PortfolioDonut
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA PortfolioDonut component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { _fmt, _esc } from './helpers.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   PortfolioDonut
 *  @public
 *  @description Namespace containing PortfolioDonut contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace PortfolioDonut
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
        /** @interface   DonutSegment
         *  @public
         *  @description DonutSegment contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DonutSegment
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

        /** @interface   PortfolioDonutOptions
         *  @public
         *  @description PortfolioDonutOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PortfolioDonutOptions
        {
            /** @name        segments
             *  @public
             *  @type        {PortfolioDonut.Interfaces.DonutSegment[]}
             *  @description Component member for segments.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            segments?: Interfaces.DonutSegment[];

            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number;
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

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        PALETTE
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned PALETTE value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const PALETTE = [
        'var(--arianna-primary, #1f6feb)',
        'var(--arianna-bull,    #26a69a)',
        '#7b9ef9',
        'var(--arianna-warning, #f4c842)',
        'var(--arianna-bear,    #ef5350)',
        '#ff9800',
        '#ce93d8',
        '#80cbc4',
    ];

    /** @class       PortfolioDonut
     *  @public
     *  @description AriannA PortfolioDonut component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-portfolio-donut', {}, {
        Attributes: ['size'],
    })
    export class PortfolioDonut extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        segments$
         *  @public
         *  @type        {PortfolioDonut.Types.Signal<PortfolioDonut.Interfaces.DonutSegment[]>}
         *  @description Component member for segments$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        segments$: Types.Signal<Interfaces.DonutSegment[]> = signal<Interfaces.DonutSegment[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {PortfolioDonut.Interfaces.PortfolioDonutOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.PortfolioDonutOptions = {})
        {
            /** @name        sizeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sizeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sizeAttr = this.signal().attribute('size');
            this.svgHtml = (): string => {
                /** @name        segments
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned segments value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const segments = this.segments$.Get();
                if (!segments.length)
                    return '';

                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = parseInt(sizeAttr.Get() ?? '300', 10) || 300;

                /** @name        total
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned total value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const total = segments.reduce((a: any, x: any) => a + x.value, 0);
                if (total <= 0)
                    return '';

                /** @name        cx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cx = s / 2;

                /** @name        cy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cy = s / 2;

                /** @name        R
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned R value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const R = cx * 0.7;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = cx * 0.42;

                /** @name        angle
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned angle value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let angle = -Math.PI / 2;

                /** @name        arcs
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned arcs value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let arcs = '';

                /** @name        labels
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned labels value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let labels = '';
                segments.forEach((seg: any, i: any) => {
                    /** @name        slice
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned slice value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const slice = (seg.value / total) * 2 * Math.PI;

                    /** @name        x1
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x1 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x1 = cx + R * Math.cos(angle);

                    /** @name        y1
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned y1 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const y1 = cy + R * Math.sin(angle);

                    /** @name        x2
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned x2 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const x2 = cx + R * Math.cos(angle + slice);

                    /** @name        y2
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned y2 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const y2 = cy + R * Math.sin(angle + slice);

                    /** @name        ix1
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ix1 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ix1 = cx + r * Math.cos(angle);

                    /** @name        iy1
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned iy1 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const iy1 = cy + r * Math.sin(angle);

                    /** @name        ix2
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ix2 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ix2 = cx + r * Math.cos(angle + slice);

                    /** @name        iy2
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned iy2 value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const iy2 = cy + r * Math.sin(angle + slice);

                    /** @name        large
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned large value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const large = slice > Math.PI ? 1 : 0;

                    /** @name        color
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned color value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const color = seg.color ?? PALETTE[i % PALETTE.length];
                    arcs += `<path d="M${ix1},${iy1} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${r},${r} 0 ${large},0 ${ix1},${iy1}" fill="${color}"/>`;

                    /** @name        midA
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned midA value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const midA = angle + slice / 2;

                    /** @name        lx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned lx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const lx = cx + R * 1.15 * Math.cos(midA);

                    /** @name        ly
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ly value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ly = cy + R * 1.15 * Math.sin(midA);

                    /** @name        pct
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned pct value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const pct = _fmt((seg.value / total) * 100);
                    labels += `<text x="${lx}" y="${ly - 4}" fill="var(--arianna-text, #1f2328)" font-size="11" font-weight="600" text-anchor="middle">${pct}%</text>`;
                    labels += `<text x="${lx}" y="${ly + 10}" fill="var(--arianna-muted, #787b86)" font-size="10" text-anchor="middle">${_esc(seg.label)}</text>`;
                    angle += slice;
                });
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${arcs}${labels}</svg>`;
            };
            this.template = html `<div class="ar-donut" a-html="this.svgHtml()"></div>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {PortfolioDonut.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = PortfolioDonut.DefaultSheet();
        }

        /** @name        segments
         *  @public
         *  @type        {void}
         *  @description Component member for segments.
         *  @param       {PortfolioDonut.Interfaces.DonutSegment[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set segments(v: Interfaces.DonutSegment[]) { this.segments$.Set(v ?? []); }

        /** @name        segments
         *  @public
         *  @type        {PortfolioDonut.Interfaces.DonutSegment[]}
         *  @description Component member for segments.
         *  @returns     {PortfolioDonut.Interfaces.DonutSegment[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get segments(): Interfaces.DonutSegment[] { return this.segments$.Get(); }

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

        /** @name        size
         *  @public
         *  @type        {number}
         *  @description Component member for size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): number { return parseInt(this.getAttribute('size') ?? '300', 10); }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: number) { this.setAttribute('size', String(v)); }

        /** @name        svgHtml
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgHtml: () => string = () => '';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {PortfolioDonut.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {PortfolioDonut.Types.Stylesheet} Result.
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
                    display: 'inline-block',
                    padding: '8px',
                }),
                new Rule(':host svg', { display: 'block' }),
            ]);
        }
    }
}
export default PortfolioDonut;

export type DonutSegment = PortfolioDonut.Interfaces.DonutSegment;
export type PortfolioDonutOptions = PortfolioDonut.Interfaces.PortfolioDonutOptions;
