/**
 * @module core/Swift
 *
 * CSS → SwiftUI emitter — the `arianna.css` → `arianna.swiftui` lowering, in a handful
 * of pure functions. The MODEL (the property→modifier table, the view/modifier shapes)
 * lives in Logos as data (`Logos.SwiftUI`); this module is the small backend that
 * applies it. Deterministic and side-effect-free: same declarations ⇒ same SwiftUI.
 *
 *      Logos.Css.Rule ──view()──► Logos.SwiftUI.View ──emit()──► SwiftUI source text
 *
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 */

import Logos from './Logos.ts';

export namespace Swift
{
    // ── value transforms (the only real logic — a few pure helpers) ───────────

    const NAMED = new Set(['red', 'green', 'blue', 'black', 'white', 'gray', 'orange', 'yellow', 'pink', 'purple', 'clear', 'primary', 'secondary']);

    /** CSS color → SwiftUI Color token. */
    function color(v: string): string
    {
        const s = v.trim().toLowerCase();
        if (NAMED.has(s))     return `.${s}`;
        if (s.startsWith('#')) return `Color(hex: "${v.trim()}")`;
        return `Color("${v.trim()}")`;
    }

    /** CSS length (`10px`, `1.5rem`, `12`) → a bare SwiftUI CGFloat. */
    function length(v: string): number
    {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
    }

    /** CSS font-weight → SwiftUI Font.Weight token. */
    function weight(v: string): string
    {
        const map: Record<string, string> =
        {
            '100': '.thin', '200': '.ultraLight', '300': '.light', '400': '.regular',
            '500': '.medium', '600': '.semibold', '700': '.bold', '800': '.heavy', '900': '.black',
            normal: '.regular', bold: '.bold',
        };
        return map[v.trim().toLowerCase()] ?? '.regular';
    }

    /** Apply a mapping's transform to a raw CSS value → SwiftUI modifier arguments. */
    function args(m: Logos.SwiftUI.Mapping, raw: string): Logos.Value[]
    {
        switch (m.Transform)
        {
            case 'color':       return [color(raw)];
            case 'length':      return [length(raw)];
            case 'number':      return [Number.isFinite(parseFloat(raw)) ? parseFloat(raw) : 0];
            case 'font-weight': return [weight(raw)];
            case 'enum':        return ['.' + (m.EnumMap?.[raw.trim().toLowerCase()] ?? raw.trim())];
            case 'passthrough': return [raw];
            case 'ignore':      return [];
        }
        return [];
    }

    /** Format one modifier argument as SwiftUI source. */
    function fmt(a: Logos.Value): string
    {
        return typeof a === 'number' ? String(a)
             : typeof a === 'string' ? a
             : JSON.stringify(a);
    }


    // ── public surface (three functions) ──────────────────────────────────────

    /** Declarations → SwiftUI modifiers, via the declarative Logos.SwiftUI.CssMap. */
    export function modifiers(decls: Logos.Css.Declarations): Logos.SwiftUI.Modifier[]
    {
        const out: Logos.SwiftUI.Modifier[] = [];
        for (const m of Logos.SwiftUI.CssMap)
        {
            const raw = decls[m.Css];
            if (raw === undefined || m.Transform === 'ignore') continue;
            out.push({ Name: m.Modifier, Arguments: args(m, String(raw)) });
        }
        return out;
    }

    /** A CSS rule → a styled SwiftUI view (container by default). */
    export function view(rule: Logos.Css.Rule, kind: Logos.SwiftUI.ViewKind = 'VStack', children: readonly Logos.SwiftUI.View[] = []): Logos.SwiftUI.View
    {
        return { Kind: kind, Modifiers: modifiers(rule.Declarations), Children: children };
    }

    /** SwiftUI view → SwiftUI source text. */
    export function emit(v: Logos.SwiftUI.View, indent = 0): string
    {
        const pad  = '    '.repeat(indent);
        const mods = v.Modifiers.map(m => `\n${pad}    .${m.Name}(${m.Arguments.map(fmt).join(', ')})`).join('');

        if (v.Kind === 'Text')
            return `${pad}Text("${v.Text ?? ''}")${mods}`;

        if (v.Children.length === 0)
            return `${pad}${v.Kind} { }${mods}`;

        const body = v.Children.map(c => emit(c, indent + 1)).join('\n');
        return `${pad}${v.Kind} {\n${body}\n${pad}}${mods}`;
    }
}

export default Swift;
