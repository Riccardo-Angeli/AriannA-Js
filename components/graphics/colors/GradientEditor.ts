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
 * Subclasses build on top of this base by adding their own attrs (angle,
 * shape, cx/cy, mesh points) and override `toCSS()`.
 *
 * The stop strip itself is a reusable signal-driven template helper —
 * `stopStripTemplate()` — that subclasses can compose into their own UI.
 *
 * @example
 *   // Subclass pattern
 *   export class MyGradientEditor extends GradientEditorBase {
 *     // attrs + template + toCSS()
 *   }
 */

import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { parseHex, rgbToHex } from './ColorPicker.ts';

export interface RGBA { r: number; g: number; b: number; a: number; }

export interface GradientStop {
    /** Position along the gradient axis, 0..1. */
    t        : number;
    /** Colour as RGBA. */
    color    : RGBA;
    /** Optional midpoint between this and the next stop (0..1 absolute). */
    midpoint?: number;
}

export interface GradientEditorOptions {
    stops? : GradientStop[];
    width? : number;
    alpha? : boolean;
}

/** Default two-stop black→white. */
export const DEFAULT_STOPS = (): GradientStop[] => [
    { t: 0, color: { r: 0,   g: 0,   b: 0,   a: 1 } },
    { t: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
];

export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/** Build a CSS colour-stop list e.g. `red 0%, blue 100%`. */
export function stopsToCss(stops: GradientStop[]): string {
    return stops.map(s => {
        const c = s.color;
        const css = (c.a !== undefined && c.a < 1)
            ? `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(3)})`
            : rgbToHex(c.r, c.g, c.b);
        return `${css} ${(s.t * 100).toFixed(2)}%`;
    }).join(', ');
}

/** Sample the gradient at parameter t — used when adding new stops. */
export function sampleAt(stops: GradientStop[], t: number): RGBA {
    if (!stops.length) return { r: 0, g: 0, b: 0, a: 1 };
    if (t <= stops[0]!.t) return { ...stops[0]!.color };
    if (t >= stops[stops.length - 1]!.t) return { ...stops[stops.length - 1]!.color };
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i]!, b = stops[i + 1]!;
        if (t >= a.t && t <= b.t) {
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
 * Shared stop-management state. Each subclass instantiates this in `build()`
 * and uses the returned signals + ops in its template.
 */
export function makeStopState() {
    const stops$    = signal<GradientStop[]>(DEFAULT_STOPS());
    const selected$ = signal<number>(0);

    function addStop(t: number, color?: RGBA): GradientStop {
        const cur = stops$.get().slice();
        const c = color ?? sampleAt(cur, t);
        const stop: GradientStop = { t: clamp01(t), color: { ...c } };
        cur.push(stop);
        sortStops(cur);
        const idx = cur.indexOf(stop);
        stops$.set(cur);
        selected$.set(idx);
        return stop;
    }

    function removeStop(idx: number): void {
        const cur = stops$.get();
        if (cur.length <= 2) return;
        if (idx < 0 || idx >= cur.length) return;
        const next = cur.slice();
        next.splice(idx, 1);
        stops$.set(next);
        const sel = selected$.get();
        if (sel >= next.length) selected$.set(next.length - 1);
    }

    function updateStop(idx: number, patch: Partial<GradientStop>): void {
        const cur = stops$.get();
        const s = cur[idx];
        if (!s) return;
        const updated: GradientStop = { ...s };
        if (patch.t !== undefined)        updated.t = clamp01(patch.t);
        if (patch.color !== undefined)    updated.color = { ...patch.color };
        if (patch.midpoint !== undefined) updated.midpoint = clamp01(patch.midpoint);
        const next = cur.slice();
        next[idx] = updated;
        sortStops(next);
        stops$.set(next);
    }

    function setStops(s: GradientStop[]): void {
        const cleaned = s.map(x => ({ ...x, color: { ...x.color } }));
        sortStops(cleaned);
        stops$.set(cleaned);
        if (selected$.get() >= cleaned.length) selected$.set(0);
    }

    return { stops$, selected$, addStop, removeStop, updateStop, setStops };
}

/** Inspector field helpers used by subclass templates. */
export function colorFieldHex(color: RGBA): string {
    return rgbToHex(color.r, color.g, color.b);
}

export function parseColorString(s: string): RGBA | null {
    const p = parseHex(s);
    if (!p) return null;
    return { r: p.r, g: p.g, b: p.b, a: p.a ?? 1 };
}
