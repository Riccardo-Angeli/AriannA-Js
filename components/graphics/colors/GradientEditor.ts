import { Reactivity } from '../../../core/index.ts';
import { parseHexRgba, rgbToHex } from './GraphicsColorPicker.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   GradientEditor
 *  @public
 *  @description Namespace containing GradientEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace GradientEditor
{
    /**
     * @module    components/graphics/colors/GradientEditor
     * @author    Riccardo Angeli
     * @copyright Riccardo Angeli 2012-2026
     * @license   MIT / Commercial (dual license)
     *
     * GradientEditor — abstract base for the three gradient editors:
     *
     *   • LinearGradientEditor — angle + stops along a straight line
     *   • RadialGradientEditor — centre + shape + size + stops along a ray
     *   • ShapeGradientEditor  — freeform 2D mesh of colour control points
     *
     * Owns the shared stop-management state:
     *
     *   stops$    : ordered list of GradientStop (sorted by t)
     *   selected$ : index of the selected stop
     *
     * Subclasses build on top of this base by adding their own attributes (angle,
     * shape, cx/cy, mesh points) and override `toCSS()`.
     *
     * The stop strip itself is a reusable signal-driven template helper —
     * `stopStripTemplate()` — that subclasses can compose into their own UI.
     *
     * @example
     *   // Subclass pattern
     *   export class MyGradientEditor extends GradientEditorBase {
     *     // attributes + template + toCSS()
     *   }
     */
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    const signal = Reactivity.CreateSignal;

    /** @name        Signal
     *  @public
     *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
     *  @description Type alias for Signal.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

    /** @interface   RGBA
     *  @public
     *  @description RGBA contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface RGBA
    {
        /** @name        r
         *  @public
         *  @type        {number}
         *  @description Component member for r.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        r: number;

        /** @name        g
         *  @public
         *  @type        {number}
         *  @description Component member for g.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        g: number;

        /** @name        b
         *  @public
         *  @type        {number}
         *  @description Component member for b.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        b: number;

        /** @name        a
         *  @public
         *  @type        {number}
         *  @description Component member for a.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        a: number;
    }

    /** @interface   GradientStop
     *  @public
     *  @description GradientStop contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface GradientStop
    {
        /** Position along the gradient axis, 0..1. */
        t: number;

        /** Colour as RGBA. */
        color: RGBA;

        /** Optional midpoint between this and the next stop (0..1 absolute). */
        midpoint?: number;
    }

    /** @interface   GradientEditorOptions
     *  @public
     *  @description GradientEditorOptions contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface GradientEditorOptions
    {
        /** @name        stops
         *  @public
         *  @type        {GradientStop[]}
         *  @description Component member for stops.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        stops?: GradientStop[];

        /** @name        width
         *  @public
         *  @type        {number}
         *  @description Component member for width.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        width?: number;

        /** @name        alpha
         *  @public
         *  @type        {boolean}
         *  @description Component member for alpha.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        alpha?: boolean;
    }

    /** Default two-stop black→white. */
    export const DEFAULT_STOPS = (): GradientStop[] => [
        { t: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
        { t: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
    ];

    /** @name        clamp01
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned clamp01 value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

    /** Build a CSS colour-stop list e.g. `red 0%, blue 100%`. */
    export function stopsToCss(stops: GradientStop[]): string {
        return stops.map(s => {
            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = s.color;

            /** @name        css
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned css value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const css = (c.a !== undefined && c.a < 1)
                ? `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(3)})`
                : rgbToHex(c.r, c.g, c.b);
            return `${css} ${(s.t * 100).toFixed(2)}%`;
        }).join(', ');
    }

    /** Sample the gradient at parameter t — used when adding new stops. */
    export function sampleAt(stops: GradientStop[], t: number): RGBA {
        if (!stops.length)
            return { r: 0, g: 0, b: 0, a: 1 };
        if (t <= stops[0]!.t)
            return { ...stops[0]!.color };
        if (t >= stops[stops.length - 1]!.t)
            return { ...stops[stops.length - 1]!.color };
        for (let i = 0; i < stops.length - 1; i++)
        {
            /** @name        a
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned a value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const a = stops[i]!, b = stops[i + 1]!;
            if (t >= a.t && t <= b.t)
            {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = (t - a.t) / (b.t - a.t || 1);
                return {
                    r: Math.round(a.color.r + (b.color.r - a.color.r) * f),
                    g: Math.round(a.color.g + (b.color.g - a.color.g) * f),
                    b: Math.round(a.color.b + (b.color.b - a.color.b) * f),
                    a: a.color.a + (b.color.a - a.color.a) * f,
                };
            }
        }
        return { ...stops[0]!.color };
    }

    /** Sort stops in place by `t`. */
    export function sortStops(stops: GradientStop[]): GradientStop[] {
        return stops.sort((a, b) => a.t - b.t);
    }

    /**
     * Shared stop-management state. Each subclass instantiates this in `onConnected()`
     * and uses the returned signals + ops in its template.
     */
    export function makeStopState() {
        /** @name        stops$
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned stops$ value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const stops$ = signal<GradientStop[]>(DEFAULT_STOPS());

        /** @name        selected$
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned selected$ value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const selected$ = signal<number>(0);
        function addStop(t: number, color?: RGBA): GradientStop {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = stops$.Get().slice();

            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = color ?? sampleAt(cur, t);

            /** @name        stop
             *  @public
             *  @type        {GradientStop}
             *  @description Namespace-owned stop value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const stop: GradientStop = { t: clamp01(t), color: { ...c } };
            cur.push(stop);
            sortStops(cur);

            /** @name        idx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned idx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const idx = cur.indexOf(stop);
            stops$.Set(cur);
            selected$.Set(idx);
            return stop;
        }
        function removeStop(idx: number): void {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = stops$.Get();
            if (cur.length <= 2)
                return;
            if (idx < 0 || idx >= cur.length)
                return;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = cur.slice();
            next.splice(idx, 1);
            stops$.Set(next);

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = selected$.Get();
            if (sel >= next.length)
                selected$.Set(next.length - 1);
        }
        function updateStop(idx: number, patch: Partial<GradientStop>): void {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = stops$.Get();

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = cur[idx];
            if (!s)
                return;

            /** @name        updated
             *  @public
             *  @type        {GradientStop}
             *  @description Namespace-owned updated value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const updated: GradientStop = { ...s };
            if (patch.t !== undefined)
                updated.t = clamp01(patch.t);
            if (patch.color !== undefined)
                updated.color = { ...patch.color };
            if (patch.midpoint !== undefined)
                updated.midpoint = clamp01(patch.midpoint);

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = cur.slice();
            next[idx] = updated;
            sortStops(next);
            stops$.Set(next);
        }
        function setStops(s: GradientStop[]): void {
            /** @name        cleaned
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cleaned value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cleaned = s.map(x => ({ ...x, color: { ...x.color } }));
            sortStops(cleaned);
            stops$.Set(cleaned);
            if (selected$.Get() >= cleaned.length)
                selected$.Set(0);
        }
        return { stops$, selected$, addStop, removeStop, updateStop, setStops };
    }

    /** Inspector field helpers used by subclass templates. */
    export function colorFieldHex(color: RGBA): string {
        return rgbToHex(color.r, color.g, color.b);
    }
    export function parseColorString(s: string): RGBA | null {
        /** @name        p
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned p value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const p = parseHexRgba(s);
        if (!p)
            return null;
        return { r: p.r, g: p.g, b: p.b, a: p.a ?? 1 };
    }
}

export const makeStopState = GradientEditor.makeStopState;
export const stopsToCss = GradientEditor.stopsToCss;
export const clamp01 = GradientEditor.clamp01;
export const colorFieldHex = GradientEditor.colorFieldHex;
export const parseColorString = GradientEditor.parseColorString;
export type GradientStop = GradientEditor.GradientStop;
export type RGBA = GradientEditor.RGBA;

export const sampleAt = GradientEditor.sampleAt;
export const sortStops = GradientEditor.sortStops;
export const DEFAULT_STOPS = GradientEditor.DEFAULT_STOPS;
export type GradientEditorOptions = GradientEditor.GradientEditorOptions;
