/**
 * @module    Rule
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Models a single CSS rule — from simple selectors to all CSS @-rules.
 * Observable: fires Rule-Changed on any mutation.
 *
 * ── CONSTRUCTOR OVERLOADS ─────────────────────────────────────────────────────
 *   new Rule('.selector', 'color: red')
 *   new Rule('.selector', { color: 'red', fontSize: '14px' })
 *   new Rule({ Selector: '.selector', Contents: { color: 'red' } })
 *   new Rule({ Selector: '.selector', Rule: 'color: red' })   // legacy alias
 *   new Rule(cssRuleInstance)
 *   new Rule('.selector')                                       // empty
 *
 * ── OBJECT-SELECTOR FORM (Golem structured @-rules) ─────────────────────────
 *   new Rule({ Selector: { Type: '@charset', Value: 'utf-8' } })
 *   new Rule({ Selector: { Type: '@keyframes', Name: 'spin' }, Contents: { From: {...}, To: {...} } })
 *   new Rule({ Selector: { Type: '@media', Media: 'screen', And: { MinHeight: '600px' } }, Rules: { ... } })
 *   new Rule({ Selector: { Type: '@supports', Not: { display: 'grid' } }, Rules: { ... } })
 *   new Rule({ Selector: { Type: '@import', Url: 'url(...)', Media: 'screen', And: {...} }, Rules: { ... } })
 *   new Rule({ Selector: { Type: '@document', Url: '...', Prefix: '...', Domain: '...', Regex: '...' }, Rules: { ... } })
 *   new Rule({ Selector: { Type: '@namespace', Prefix: 'svg|a', Url: 'url(...)' } })
 *   new Rule({ Selector: { Type: '@page', Name: 'myPage', Right: true }, Contents: { color: 'red', TopLeft: { background: 'blue' } } })
 *   new Rule({ Selector: { Type: '@counter-style', Name: 'myStyle' }, Contents: { System: 'cyclic', Symbols: '...' } })
 *   new Rule({ Selector: { Type: '@font-face' }, Contents: { FontFamily: '...', Source: '...' } })
 *   new Rule({ Selector: { Type: '@viewport' }, Contents: { Width: '300px' } })
 *
 * ── NESTED RULES (Rules map) ─────────────────────────────────────────────────
 *   Rules: { RuleName: { Selector, Rule/Contents }, ... }
 *   Rendered as child rules inside the @-rule block.
 *
 * ── STATIC METHODS ───────────────────────────────────────────────────────────
 *   Rule.Parse(cssText)               → Rule[]
 *   Rule.From(cssRule)                → Rule
 *   Rule.GetSelector(def)             → string   (Golem Css.GetSelector)
 *   Rule.GetType(def)                 → string   (Golem Css.GetType)
 *   Rule.GetContents(def)             → object   (Golem Css.GetContents)
 *   Rule.GetText(def)                 → string   (Golem Css.GetText)
 *   Rule.GetObject(cssText)           → object   (Golem Css.GetObject)
 *
 * ── CSS.STATE ────────────────────────────────────────────────────────────────
 *   new CssState(el, 'MouseDown', existingCss, { background: 'yellow' }, action?, '@Keyframes Name', frames?)
 */

import type { AriannAEvent } from './Observable.ts';
import Core, { toKebab, toCamel } from './Core.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CSSProperties = Record<string, string>;

/**
 * Object-literal rule definition accepted by the constructor.
 * Supports legacy Golem field aliases: Contents / Content / Body / Rule.
 * Property keys may be PascalCase (Width) or camelCase (width).
 */
export interface RuleDefinition
{
    Selector  : string | SelectorObject;
    Contents? : string | CSSProperties | Record<string, unknown>;
    Content?  : string | CSSProperties | Record<string, unknown>;
    Body?     : string | CSSProperties | Record<string, unknown>;
    Rule?     : string | CSSProperties | Record<string, unknown>;
    Rules?    : Record<string, RuleDefinition | CSSProperties>;
}

/**
 * Structured object selector used in Golem Css examples.
 * Type is the @-rule keyword; other keys are rule-specific.
 */
export interface SelectorObject
{
    Type    : string;
    Name?   : string;
    Value?  : string;
    Media?  : string;
    Url?    : string;
    Prefix? : string;
    Domain? : string;
    Regex?  : string;
    Right?  : boolean;
    Left?   : boolean;
    And?    : Record<string, unknown>;
    Or?     : Record<string, unknown>;
    Not?    : Record<string, unknown>;
    [key: string]: unknown;
}

export interface RuleEvent extends AriannAEvent
{
    Rule     : Rule;
    Property : { Name: string; Old: unknown; New: unknown };
}

// ── @page margin-box pseudo-element names ─────────────────────────────────────

const PAGE_MARGIN_BOXES = new Set([
    'TopLeftCorner', 'TopLeft', 'TopCenter', 'TopRight', 'TopRightCorner',
    'BottomLeftCorner', 'BottomLeft', 'BottomCenter', 'BottomRight', 'BottomRightCorner',
    'LeftTop', 'LeftMiddle', 'LeftBottom',
    'RightTop', 'RightMiddle', 'RightBottom',
]);

// ── CSS normalizers ───────────────────────────────────────────────────────────

function trimVal(v: string): string { return v.trim().replace(/;$/, ''); }

function parseDeclarations(text: string): CSSProperties
{
    const props: CSSProperties = {};
    text.split(';').forEach(decl => {
        const colon = decl.indexOf(':');
        if (colon < 0) return;
        const key = toCamel(decl.slice(0, colon).trim());
        const val = trimVal(decl.slice(colon + 1));
        if (key && val) props[key] = val;
    });
    return props;
}

function serializeDeclarations(props: CSSProperties): string
{
    return Object.entries(props)
        .map(([k, v]) => `${toKebab(k)}: ${v}`)
        .join('; ');
}

function normaliseProps(raw: CSSProperties): CSSProperties
{
    const out: CSSProperties = {};
    // Guard: a missing/garbage argument must never throw. Object.entries(undefined)
    // is the "can't convert undefined to object" crash seen when CssState is called
    // with a shifted/legacy signature. Degrade to an empty rule instead.
    if (!raw || typeof raw !== 'object') return out;
    for (const [k, v] of Object.entries(raw))
        out[toCamel(k)] = String(v).trim();
    return out;
}

// ── Media / Supports condition builder ───────────────────────────────────────

function buildMediaCondition(obj: Record<string, unknown>): string
{
    const parts: string[] = [];
    for (const [k, v] of Object.entries(obj))
    {
        const lk = k.toLowerCase();
        if (lk === 'or')
        {
            parts.push(`, ${buildMediaCondition(v as Record<string, unknown>)}`);
        } else if (lk === 'and')
        {
            parts.push(` and ${buildMediaCondition(v as Record<string, unknown>)}`);
        } else if (lk === 'not')
        {
            parts.push(` not (${buildMediaCondition(v as Record<string, unknown>)})`);
        } else
        {
            // e.g. MinHeight → min-height
            const prop = toKebab(k).toLowerCase();
            parts.push(`(${prop}: ${v})`);
        }
    }
    return parts.join('');
}

// ── Object-selector → CSS selector string ────────────────────────────────────

function buildSelector(sel: SelectorObject): string
{
    const type = sel.Type.toLowerCase().trim();

    if (type === '@charset')
        return `@charset "${(sel.Value ?? 'UTF-8').replace(/["']/g, '')}"`;

    if (type === '@namespace')
    {
        const prefix = sel.Prefix ? `${sel.Prefix} ` : '';
        return `@namespace ${prefix}${sel.Url ?? ''}`;
    }

    if (type === '@import')
    {
        const url = sel.Url ?? '';
        const media = sel.Media ? ` ${sel.Media}` : '';
        const cond  = sel.And ? buildMediaCondition(sel.And as Record<string, unknown>) : '';
        return `@import ${url}${media}${cond}`;
    }

    if (type === '@media')
    {
        const media = sel.Media ? ` ${sel.Media}` : '';
        const cond  = sel.And ? buildMediaCondition(sel.And as Record<string, unknown>) : '';
        return `@media${media}${cond}`;
    }

    if (type === '@supports')
    {
        const parts: string[] = [];
        if (sel.Not)
            parts.push(`not (${buildMediaCondition(sel.Not as Record<string, unknown>)})`);
        for (const [k, v] of Object.entries(sel))
        {
            const lk = k.toLowerCase();
            if (['type', 'not'].includes(lk)) continue;
            if (lk === 'or')
                parts.push(`, ${buildMediaCondition(v as Record<string, unknown>)}`);
            else if (lk === 'and')
                parts.push(` and ${buildMediaCondition(v as Record<string, unknown>)}`);
            else
                parts.push(`(${toKebab(k).toLowerCase()}: ${v})`);
        }
        return `@supports ${parts.join(' ')}`;
    }

    if (type === '@document')
    {
        const conditions: string[] = [];
        if (sel.Url)    conditions.push(`url("${sel.Url}")`);
        if (sel.Prefix) conditions.push(`url-prefix("${sel.Prefix}")`);
        if (sel.Domain) conditions.push(`domain("${sel.Domain}")`);
        if (sel.Regex)  conditions.push(`regexp("${sel.Regex}")`);
        return `@document ${conditions.join(', ')}`;
    }

    if (type === '@page')
    {
        const name  = sel.Name  ? ` ${sel.Name}` : '';
        const right = sel.Right ? ' :right' : '';
        const left  = sel.Left  ? ' :left'  : '';
        return `@page${name}${right}${left}`;
    }

    if (type === '@keyframes')
        return `@keyframes ${sel.Name ?? ''}`;

    if (type === '@counter-style')
        return `@counter-style ${sel.Name ?? ''}`;

    if (type === '@font-face')  return '@font-face';
    if (type === '@viewport')   return '@viewport';

    // fallback — unknown @-rule
    return sel.Type;
}

// ── @keyframes frame builder ─────────────────────────────────────────────────

function buildKeyframesText(name: string, contents: Record<string, unknown>): string
{
    const frames: string[] = [];
    for (const [key, val] of Object.entries(contents))
    {
        const lk = key.toLowerCase();
        let position: string;
        let style: CSSProperties;

        if (lk === 'from') {
            position = 'from';
            style    = normaliseProps(val as CSSProperties);
        } else if (lk === 'to') {
            position = 'to';
            style    = normaliseProps(val as CSSProperties);
        } else {
            // { Position: '33%', Style: { ... } }
            const frame = val as { Position?: string; Style?: CSSProperties; [k: string]: unknown };
            position = frame.Position ?? key;
            style    = frame.Style ? normaliseProps(frame.Style) : {};
        }
        const decls = serializeDeclarations(style);
        frames.push(`  ${position} { ${decls}${decls ? ';' : ''} }`);
    }
    return `@keyframes ${name} {\n${frames.join('\n')}\n}`;
}

// ── @page with margin-boxes builder ──────────────────────────────────────────

function buildPageText(selector: string, contents: Record<string, unknown>): string
{
    const mainDecls: CSSProperties = {};
    const marginBoxes: string[] = [];

    for (const [k, v] of Object.entries(contents))
    {
        if (PAGE_MARGIN_BOXES.has(k))
        {
            // margin-box pseudo-element → @top-left-corner { ... }
            const boxSelector = toKebab(k).toLowerCase(); // TopLeftCorner → top-left-corner
            const props = normaliseProps(v as CSSProperties);
            const decls = serializeDeclarations(props);
            marginBoxes.push(`  @${boxSelector} { ${decls}${decls ? ';' : ''} }`);
        } else
        {
            mainDecls[toCamel(k)] = String(v).trim();
        }
    }

    const main = serializeDeclarations(mainDecls);
    const inner = [
        main ? `  ${main};` : '',
        ...marginBoxes,
    ].filter(Boolean).join('\n');

    return `${selector} {\n${inner}\n}`;
}

// ── Nested Rules builder ──────────────────────────────────────────────────────

function buildNestedRules(rulesMap: Record<string, RuleDefinition | CSSProperties>): string
{
    return Object.values(rulesMap).map(def =>
    {
        const r = new Rule(def as RuleDefinition);
        return '  ' + r.Text.replace(/\n/g, '\n  ');
    }).join('\n');
}

// ── Rule ──────────────────────────────────────────────────────────────────────

// ── Box-shadow CSS model — the deduplicated home. Real/Virtual delegate here
//    (IoC); Stylesheet.boxShadow resolves Rule/Stylesheet sources on top. ─────────

/** Whether a `.shadow()` style is applied (`open`) or cleared (`close`). */
export type ShadowState = 'open' | 'close';
/** Built-in box-shadow presets. */
export type ShadowMode  = 'drop' | 'inset' | 'glow' | 'layered';
/** Tunable parameters for a box-shadow preset. */
export interface ShadowOptions { color?: string; blur?: number; spread?: number; x?: number; y?: number; }
/** A single layer in a multi-layer box-shadow stack. */
export interface ShadowLayer extends ShadowOptions { inset?: boolean; }

export class Rule
{

    readonly #id       : string;
    #selector          : string;
    #properties        : CSSProperties;
    #children          : Rule[]         = [];
    #rawContents       : Record<string, unknown> | null = null;
    #selectorObj       : SelectorObject | null = null;
    readonly #events   = new Map<string, Set<(e: RuleEvent) => void>>();

    // ── Constructor overloads ─────────────────────────────────────────────────

    constructor(selector: string, contents?: string | CSSProperties);
    constructor(definition: RuleDefinition);
    constructor(cssRule: CSSRule);
    constructor(
        arg0: string | RuleDefinition | CSSRule,
        arg1?: string | CSSProperties,
    )
    {
        this.#id = Core.UUID();

        if (arg0 instanceof CSSRule)
        {
            const text = arg0.cssText;
            const m    = /^([^{]+)\{([\s\S]*)\}/.exec(text);
            this.#selector   = m?.[1]?.trim() ?? '';
            this.#properties = parseDeclarations(m?.[2] ?? '');

        } else if (typeof arg0 === 'string') {
            this.#selector = arg0;
            if (!arg1)                         this.#properties = {};
            else if (typeof arg1 === 'string') this.#properties = parseDeclarations(arg1);
            else                               this.#properties = normaliseProps(arg1);

        } else
        {
            // Object literal form
            const def  = arg0 as RuleDefinition;
            const rawSel = def.Selector;

            if (rawSel && typeof rawSel === 'object')
            {
                // Structured object selector
                this.#selectorObj = rawSel as SelectorObject;
                this.#selector    = buildSelector(this.#selectorObj);
            } else {
                this.#selector = (rawSel as string) ?? '';
            }

            const body = def.Contents ?? def.Content ?? def.Body ?? def.Rule ?? {};
            if (typeof body === 'string')
            {
                this.#properties = parseDeclarations(body);
            } else
            {
                const bodyObj = body as Record<string, unknown>;
                const type = this.#selectorObj?.Type?.toLowerCase() ?? '';

                if (type === '@keyframes')
                {
                    // Contents holds frames, not CSS properties
                    this.#rawContents = bodyObj;
                    this.#properties  = {};
                } else if (type === '@page')
                {
                    this.#rawContents = bodyObj;
                    this.#properties  = {};
                } else
                {
                    this.#properties = normaliseProps(bodyObj as CSSProperties);
                }
            }

            // Build child rules from Rules map
            if (def.Rules)
                this.#children = Object.values(def.Rules)
                    .map(d => new Rule(d as RuleDefinition));
        }

        // Default
        this.#properties ??= {};
    }

    // ── Identity ──────────────────────────────────────────────────────────────

    get Id(): string { return this.#id; }

    // ── Selector ──────────────────────────────────────────────────────────────

    get Selector(): string { return this.#selector; }
    set Selector(v: string)
    {
        const old = this.#selector; this.#selector = v;
        this.#emit('Selector', old, v);
    }

    // ── Type (convenience getter) ─────────────────────────────────────────────

    /** The @-rule keyword, e.g. '@media', '@keyframes', or '' for style rules. */
    get Type(): string
    {
        const m = /^(@[\w-]+)/.exec(this.#selector.trim());
        return m?.[1] ?? '';
    }

    // ── Children ──────────────────────────────────────────────────────────────

    /** Nested child Rules (for @media, @supports, @document, @import). */
    get Children(): Rule[]         { return [...this.#children]; }
    set Children(v: Rule[])        { this.#children = v; }

    // ── Properties ───────────────────────────────────────────────────────────

    get Properties(): Readonly<CSSProperties> { return { ...this.#properties }; }

    get(name: string): string | undefined
    {
        return this.#properties[toCamel(name)];
    }

    set(name: string, value: string): this
    {
        const key = toCamel(name);
        const old = this.#properties[key];
        if (old === value) return this;
        this.#properties[key] = trimVal(value);
        this.#emit(key, old, value);
        return this;
    }

    remove(name: string): this
    {
        const key = toCamel(name);
        const old = this.#properties[key];
        if (old === undefined) return this;
        delete this.#properties[key];
        this.#emit(key, old, undefined);
        return this;
    }

    merge(props: CSSProperties): this
    {
        for (const [k, v] of Object.entries(props)) this.set(k, v);
        return this;
    }

    replace(props: CSSProperties | string): this
    {
        const old = { ...this.#properties };
        this.#properties = typeof props === 'string'
            ? parseDeclarations(props)
            : normaliseProps(props);
        this.#emit('*', old, this.#properties);
        return this;
    }

    has(name: string): boolean { return toCamel(name) in this.#properties; }

    // ── Serialization ─────────────────────────────────────────────────────────

    /**
     * Full CSS rule text ready to insert into a stylesheet.
     * Handles: standard rules, @keyframes with frames, @page with margin-boxes,
     * nested rules (@media/@supports/@document/@import with child rules).
     */
    get Text(): string
    {
        const type = this.Type.toLowerCase();

        // @charset, @namespace, @import (without nested rules)
        if (type === '@charset' || type === '@namespace')
            return `${this.#selector};`;

        // @keyframes — render frames from rawContents
        if (type === '@keyframes' && this.#rawContents)
        {
            const name = this.#selectorObj?.Name ?? this.#selector.replace('@keyframes', '').trim();
            return buildKeyframesText(name, this.#rawContents);
        }

        // @page — render margin-boxes from rawContents
        if (type === '@page' && this.#rawContents)
            return buildPageText(this.#selector, this.#rawContents);

        // Rules with nested children
        if (this.#children.length > 0)
        {
            const inner = this.#children.map(c => '  ' + c.Text.replace(/\n/g, '\n  ')).join('\n');
            return `${this.#selector} {\n${inner}\n}`;
        }

        // Standard rule
        const decls = serializeDeclarations(this.#properties);
        return `${this.#selector} { ${decls}${decls ? ';' : ''} }`;
    }

    get cssText(): string { return this.Text; }
    toString(): string    { return this.Text; }

    // ── Pub/sub ───────────────────────────────────────────────────────────────

    on(types: string, cb: (e: RuleEvent) => void): this
    {
        types.split(/\s+|,|\|/g).filter(Boolean).forEach(t => {
            const b = this.#events.get(t) ?? new Set();
            b.add(cb); this.#events.set(t, b);
        });
        return this;
    }

    off(type: string, cb: (e: RuleEvent) => void): this
    {
        this.#events.get(type)?.forEach(l => l === cb && this.#events.get(type)!.delete(l));
        return this;
    }

    fire(event: RuleEvent): this
    {
        if (!event?.Type) return this;
        this.#events.get(event.Type)?.forEach(l => l(event));
        return this;
    }

    #emit(name: string, old: unknown, nv: unknown): void
    {
        const ev: RuleEvent = {
            Type: `Rule-${name}-Changed`, Rule: this, Property: { Name: name, Old: old, New: nv },
        };
        this.fire(ev);
        ev.Type = 'Rule-Changed';
        this.fire(ev);
    }

    // ── Comparison ────────────────────────────────────────────────────────────

    matches(other: Rule | string | CSSRule): boolean
    {
        if (typeof other === 'string')  return this.#selector.trim() === other.trim();
        if (other instanceof CSSRule)   return this.#selector.trim() === (other as CSSStyleRule).selectorText?.trim();
        return this.#selector.trim() === other.Selector.trim();
    }

    clone(): Rule
    {
        const r = new Rule(this.#selector, { ...this.#properties });
        r.#children    = this.#children.map(c => c.clone());
        r.#rawContents = this.#rawContents ? { ...this.#rawContents } : null;
        r.#selectorObj = this.#selectorObj ? { ...this.#selectorObj } : null;
        return r;
    }

    // ── Static helpers ────────────────────────────────────────────────────────

    /**
     * Parse a CSS text string into Rule instances via browser parser.
     */
    static Parse(text: string): Rule[]
    {
        const style = document.createElement('style');
        style.textContent = text;
        document.head.appendChild(style);
        const rules = Array.from(style.sheet?.cssRules ?? []).map(r => new Rule(r));
        document.head.removeChild(style);
        return rules;
    }

    static From(cssRule: CSSRule): Rule { return new Rule(cssRule); }

    // ── Box-shadow primitives (deduplicated; Real/Virtual + Stylesheet use these) ──

    /** Re-express any CSS color as `rgba(r,g,b,a)` with the given alpha (best-effort). */
    private static _alpha(color: string, a: number): string
    {
        const rgba = color.match(/rgba?\(([^)]+)\)/);
        if (rgba) { const p = rgba[1].split(',').map(s => s.trim()); if (p.length >= 3) return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
        const hex = color.match(/^#([0-9a-fA-F]{3,8})$/);
        if (hex) { const h = hex[1]; const r = parseInt(h.length >= 6 ? h.slice(0,2) : h[0]+h[0], 16); const g = parseInt(h.length >= 6 ? h.slice(2,4) : h[1]+h[1], 16); const b = parseInt(h.length >= 6 ? h.slice(4,6) : h[2]+h[2], 16); return `rgba(${r},${g},${b},${a})`; }
        return color;
    }

    /** Build the `box-shadow` CSS for a named preset (`drop`/`inset`/`glow`/`layered`). */
    static boxShadowPreset(mode: ShadowMode, o: ShadowOptions = {}): string
    {
        const color = o.color ?? 'rgba(0,0,0,0.25)', blur = o.blur ?? 8, spread = o.spread ?? 0, x = o.x ?? 0;
        switch (mode) {
            case 'drop':    return `${x}px ${o.y ?? 4}px ${blur}px ${spread}px ${color}`;
            case 'inset':   return `inset ${x}px ${o.y ?? 0}px ${blur}px ${spread}px ${color}`;
            case 'glow':    return `0 0 ${blur}px ${spread+2}px ${color}, 0 0 ${blur*2}px ${spread}px ${Rule._alpha(color, 0.5)}`;
            case 'layered': { const y = o.y ?? 4; return `${x}px ${y}px ${blur}px ${color}, ${x}px ${y*2}px ${blur*2}px ${Rule._alpha(color, 0.15)}`; }
        }
    }

    /** Build the `box-shadow` CSS for one explicit ShadowLayer. */
    static boxShadowLayer(l: ShadowLayer): string
    {
        return `${l.inset ? 'inset ' : ''}${l.x ?? 0}px ${l.y ?? 4}px ${l.blur ?? 8}px ${l.spread ?? 0}px ${l.color ?? 'rgba(0,0,0,0.25)'}`;
    }

    // ── Golem static API ──────────────────────────────────────────────────────

    /**
     * Return the selector string from a RuleDefinition.
     * Mirrors Golem's Css.GetSelector().
     *
     * @example
     *   Rule.GetSelector({ Selector: { Type: '@media', Media: 'screen' } })
     *   // '@media screen'
     */
    static GetSelector(def: RuleDefinition): string
    {
        const sel = def.Selector;
        if (!sel) return '';
        if (typeof sel === 'string') return sel;
        return buildSelector(sel as SelectorObject);
    }

    /**
     * Return the @-rule type keyword from a RuleDefinition.
     * Mirrors Golem's Css.GetType().
     *
     * @example
     *   Rule.GetType({ Selector: { Type: '@keyframes', Name: 'spin' } })
     *   // '@keyframes'
     */
    static GetType(def: RuleDefinition): string
    {
        const sel = def.Selector;
        if (!sel) return '';
        if (typeof sel === 'string')
        {
            const m = /^(@[\w-]+)/.exec(sel.trim());
            return m?.[1] ?? '';
        }
        return (sel as SelectorObject).Type ?? '';
    }

    /**
     * Return the contents/properties object from a RuleDefinition.
     * Mirrors Golem's Css.GetContents().
     */
    static GetContents(def: RuleDefinition): Record<string, unknown>
    {
        const body = def.Contents ?? def.Content ?? def.Body ?? def.Rule ?? {};
        if (typeof body === 'string') return parseDeclarations(body) as Record<string, unknown>;
        return body as Record<string, unknown>;
    }

    /**
     * Serialize a RuleDefinition to its CSS text string.
     * Mirrors Golem's Css.GetText().
     */
    static GetText(def: RuleDefinition): string
    {
        return new Rule(def).Text;
    }

    /**
     * Parse a CSS text string into a structured JS object.
     * Mirrors Golem's Css.GetObject().
     *
     * Returns an object keyed by selector with contents as nested objects.
     *
     * @example
     *   Rule.GetObject('@media screen { .btn { color: red } }')
     *   // { '@media screen': { '.btn': { color: 'red' } } }
     *
     *   Rule.GetObject('@keyframes spin { from { transform: rotate(0) } }')
     *   // { '@keyframes spin': { from: { transform: 'rotate(0)' } } }
     */
    static GetObject(cssText: string): Record<string, unknown>
    {
        if (!cssText?.trim()) return {};

        const result: Record<string, unknown> = {};
        const style = document.createElement('style');
        style.textContent = cssText;
        document.head.appendChild(style);

        try
        {
            const rules = Array.from(style.sheet?.cssRules ?? []);
            for (const rule of rules)
            {
                if (rule instanceof CSSStyleRule)
                {
                    const decls: Record<string, string> = {};
                    for (let i = 0; i < rule.style.length; i++)
                    {
                        const p = rule.style[i] ?? '';
                        if (p) decls[toCamel(p)] = rule.style.getPropertyValue(p).trim();
                    }
                    result[rule.selectorText] = decls;
                } else if (rule instanceof CSSKeyframesRule)
                {
                    const frames: Record<string, unknown> = {};
                    Array.from(rule.cssRules).forEach((fr) => {
                        const kf = fr as CSSKeyframeRule;
                        const decls: Record<string, string> = {};
                        for (let i = 0; i < kf.style.length; i++)
                        {
                            const p = kf.style[i] ?? '';
                            if (p) decls[toCamel(p)] = kf.style.getPropertyValue(p).trim();
                        }
                        frames[kf.keyText] = decls;
                    });
                    result[`@keyframes ${rule.name}`] = frames;
                } else if (rule instanceof CSSMediaRule)
                {
                    const inner: Record<string, unknown> = {};
                    Array.from(rule.cssRules).forEach(r => {
                        if (r instanceof CSSStyleRule)
                        {
                            const d: Record<string, string> = {};
                            for (let i = 0; i < (r as CSSStyleRule).style.length; i++)
                            {
                                const p = (r as CSSStyleRule).style[i] ?? '';
                                if (p) d[toCamel(p)] = (r as CSSStyleRule).style.getPropertyValue(p).trim();
                            }
                            inner[(r as CSSStyleRule).selectorText] = d;
                        }
                    });
                    const mediaKey = rule.conditionText
                        ? `@media ${rule.conditionText}`
                        : (rule.cssText.split('{')[0] ?? '').trim();
                    result[mediaKey] = inner;
                } else if (rule instanceof CSSSupportsRule)
                {
                    const inner: Record<string, unknown> = {};
                    Array.from(rule.cssRules).forEach(r => {
                        const obj = Rule.GetObject(r.cssText);
                        Object.assign(inner, obj);
                    });
                    result[`@supports ${rule.conditionText}`] = inner;
                } else if (rule instanceof CSSFontFaceRule)
                {
                    const d: Record<string, string> = {};
                    for (let i = 0; i < rule.style.length; i++)
                    {
                        const p = rule.style[i] ?? '';
                        if (p) d[toCamel(p)] = rule.style.getPropertyValue(p).trim();
                    }
                    result['@font-face'] = d;
                } else if (rule instanceof CSSImportRule)
                {
                    result[`@import ${rule.href}`] = { href: rule.href, media: rule.media?.mediaText ?? '' };
                } else if (rule instanceof CSSNamespaceRule)
                {
                    result['@namespace'] = { prefix: rule.prefix, namespaceURI: rule.namespaceURI };
                } else if (rule instanceof CSSPageRule)
                {
                    const d: Record<string, string> = {};
                    for (let i = 0; i < rule.style.length; i++)
                    {
                        const p = rule.style[i] ?? '';
                        if (p) d[toCamel(p)] = rule.style.getPropertyValue(p).trim();
                    }
                    result[`@page ${rule.selectorText}`.trim()] = d;
                } else
                {
                    const m = /^([^{]+)\{([\s\S]*)\}/.exec(rule.cssText);
                    if (m)
                    {
                        const key = m[1]?.trim();
                        const val = m[2];
                        if (key && val !== undefined) result[key] = parseDeclarations(val);
                    }
                }
            }
        } finally
        {
            document.head.removeChild(style);
        }

        return result;
    }


    // ─────────────────────────────────────────────────────────────────────────
    //  DOM append — auto-inject this Rule into the DOM.
    //
    //  Full port of Golem's original `new Css(selector, rules, [sheet|mode], [index])`
    //  matrix. A Rule becomes immediately effective without requiring a Sheet
    //  wrapper, and supports the FIVE append modes from the original Css.js:
    //
    //    1. STYLE  — internal <style> appended to <head>             (default, or 'style')
    //    2. FILE   — Blob URL wrapped in <link rel="stylesheet">     ('file')
    //    3. SHEET  — appended to an existing v2 Sheet                (Sheet instance)
    //    4. LINK   — written into existing <link>.sheet or CSSStyleSheet
    //    5. PARENT — append <style> under a specific Element / ShadowRoot
    //                (for shadow-DOM scoping or non-<head> hosting)
    //
    //  Each Rule owns at most ONE host artifact at a time (style or link or
    //  sheet position). Re-appending detaches the previous one. Edits to the
    //  rule (Rule-Changed, Selector-Changed) re-sync the host node's content
    //  automatically.
    //
    //  Examples:
    //    new Rule('.Fancy', { background: 'yellow' }).append();
    //    new Rule('.Fancy', { background: 'yellow' }).append('style');
    //    new Rule('.Fancy', { background: 'yellow' }).append('file');
    //    new Rule('.Fancy', { background: 'yellow' }).append(existingSheet);
    //    new Rule('.Fancy', { background: 'yellow' }).append(existingSheet, 0);
    //    new Rule('.Fancy', { background: 'yellow' }).append(linkElement);
    //    new Rule('.Fancy', { background: 'yellow' }).append(cssStyleSheet);
    //    new Rule(':root',  { background: 'yellow' }).append(shadowRoot);
    //
    //  Static shortcuts:
    //    Rule.css('.Fancy', { … });
    //    Rule.css('.Fancy', { … }, 'file');
    //    Rule.css({ Selector: '.Fancy', Content: {…} });
    //    Rule.css({ Selector: '.Fancy', Content: {…} }, sheet);
    // ─────────────────────────────────────────────────────────────────────────

    #styleNode   : HTMLStyleElement | null = null;
    #linkNode    : HTMLLinkElement  | null = null;
    #blobUrl     : string           | null = null;
    #hostSheet   : { Rules: { remove(rule: unknown): unknown; add(rule: unknown): unknown; insert(rule: unknown, idx: number): unknown } } | null = null;
    #hostIndex   : number = -1;
    #appendMode   : 'style' | 'file' | 'sheet' | 'link' | 'parent' | null = null;
    #syncBound   : (() => void) | null = null;

    /**
     * Inject this rule into the DOM.
     *
     *   rule.append()                            // STYLE — <style> in <head>
     *   rule.append('style')                     // STYLE (explicit)
     *   rule.append('file')                      // FILE — Blob + <link>
     *   rule.append(sheet)                       // SHEET — Sheet instance
     *   rule.append(sheet, 5)                    // SHEET at specific index
     *   rule.append(linkElement)                 // LINK — write into <link>.sheet
     *   rule.append(cssStyleSheet)               // CSSStyleSheet direct
     *   rule.append(shadowRoot)                  // PARENT under shadow
     *   rule.append(element)                     // PARENT under any Element
     *
     * @returns the Rule itself, for chaining.
     */
    append(
        target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null,
        index?: number,
    ): this
    {
        // Detach any previous host
        this.detach();

        // ── Mode 2: FILE — Blob URL + <link> ──
        if (target === 'file')
        {
            const cssText = this.Text;
            const blob    = new Blob([cssText], { type: 'text/css' });
            this.#blobUrl = URL.createObjectURL(blob);

            this.#linkNode      = document.createElement('link');
            this.#linkNode.rel  = 'stylesheet';
            this.#linkNode.type = 'text/css';
            this.#linkNode.href = this.#blobUrl;
            this.#linkNode.setAttribute('data-arianna-rule', this.#id);
            (document.head ?? document.documentElement).appendChild(this.#linkNode);

            this.#appendMode = 'file';
            this.#bindSync(() => {
                // Replace Blob: stylesheet URL can't be edited, recreate it.
                if (this.#blobUrl) URL.revokeObjectURL(this.#blobUrl);
                const b = new Blob([this.Text], { type: 'text/css' });
                this.#blobUrl = URL.createObjectURL(b);
                if (this.#linkNode) this.#linkNode.href = this.#blobUrl;
            });
            return this;
        }

        // ── Mode 4: LINK — existing <link> with a CSSStyleSheet ──
        if (target instanceof HTMLLinkElement)
        {
            this.#linkNode = target;
            const sheet = target.sheet;
            if (sheet)
            {
                const i = (typeof index === 'number') ? index : sheet.cssRules.length;
                try { sheet.insertRule(this.Text, i); } catch { /* invalid rule for this sheet */ }
                this.#hostIndex = i;
            }
            this.#appendMode = 'link';
            this.#bindSync(() => this.#resyncCSSOM(target.sheet));
            return this;
        }

        // ── Mode 4b: direct CSSStyleSheet ──
        if (target instanceof CSSStyleSheet)
        {
            const i = (typeof index === 'number') ? index : target.cssRules.length;
            try { target.insertRule(this.Text, i); } catch { /* skip */ }
            this.#hostIndex = i;
            this.#appendMode = 'link';
            this.#bindSync(() => this.#resyncCSSOM(target));
            return this;
        }

        // ── Mode 5: PARENT — Element or ShadowRoot ──
        if (target instanceof Element || (typeof ShadowRoot !== 'undefined' && target instanceof ShadowRoot))
        {
            this.#styleNode = document.createElement('style');
            this.#styleNode.setAttribute('data-arianna-rule', this.#id);
            this.#styleNode.textContent = this.Text;
            (target as Element | ShadowRoot).appendChild(this.#styleNode);
            this.#appendMode = 'parent';
            this.#bindSync(() => { if (this.#styleNode) this.#styleNode.textContent = this.Text; });
            return this;
        }

        // ── Mode 3: SHEET — v2 Sheet (duck-typed to avoid circular import) ──
        if (target && typeof target === 'object'
            && 'Rules' in (target as Record<string, unknown>)
            && (target as { Rules?: { add?: unknown } }).Rules
            && typeof (target as { Rules: { add?: unknown } }).Rules.add === 'function')
        {
            const sheet = target as unknown as
                { Rules: { add(rule: unknown): unknown; insert(rule: unknown, idx: number): unknown; remove(rule: unknown): unknown } };
            if (typeof index === 'number') sheet.Rules.insert(this, index);
            else                            sheet.Rules.add(this);
            this.#hostSheet = sheet;
            this.#hostIndex = (typeof index === 'number') ? index : -1;
            this.#appendMode = 'sheet';
            // Re-syncing handled by the Sheet itself (Sheet-Changed flushes).
            return this;
        }

        // ── Mode 1: STYLE (default) — <style> in <head> ──
        // Covers: target === 'style', target === undefined, target === null.
        this.#styleNode = document.createElement('style');
        this.#styleNode.setAttribute('data-arianna-rule', this.#id);
        this.#styleNode.textContent = this.Text;
        (document.head ?? document.documentElement).appendChild(this.#styleNode);
        this.#appendMode = 'style';
        this.#bindSync(() => { if (this.#styleNode) this.#styleNode.textContent = this.Text; });
        return this;
    }

    /**
     * Remove this rule's DOM artifact (style/link/sheet entry). The Rule
     * descriptor is preserved — you can call `.append(...)` again later.
     */
    detach(): this
    {
        // Sync listeners
        if (this.#syncBound)
        {
            this.off('Rule-Changed',     this.#syncBound);
            this.off('Selector-Changed', this.#syncBound);
            this.#syncBound = null;
        }

        if (this.#styleNode && this.#styleNode.parentNode)
            this.#styleNode.parentNode.removeChild(this.#styleNode);
        this.#styleNode = null;

        if (this.#linkNode && this.#appendMode === 'file' && this.#linkNode.parentNode)
            this.#linkNode.parentNode.removeChild(this.#linkNode);
        this.#linkNode = null;

        if (this.#blobUrl) { URL.revokeObjectURL(this.#blobUrl); this.#blobUrl = null; }

        if (this.#hostSheet)
        {
            try { this.#hostSheet.Rules.remove(this); } catch { /* sheet may be gone */ }
            this.#hostSheet = null;
        }
        this.#hostIndex = -1;
        this.#appendMode = null;
        return this;
    }

    #bindSync(handler: () => void): void
    {
        this.#syncBound = handler;
        this.on('Rule-Changed',     handler);
        this.on('Selector-Changed', handler);
    }

    #resyncCSSOM(sheet: CSSStyleSheet | null): void
    {
        if (!sheet) return;
        if (this.#hostIndex < 0 || this.#hostIndex >= sheet.cssRules.length) return;
        try { sheet.deleteRule(this.#hostIndex); sheet.insertRule(this.Text, this.#hostIndex); } catch { /* skip */ }
    }

    /**
     * The DOM artifact owning this rule, if attached. Returns the <style>
     * for STYLE/PARENT mode, the <link> for FILE/LINK mode, the Sheet
     * instance for SHEET mode, or null if detached.
     */
    get Host(): HTMLStyleElement | HTMLLinkElement | object | null
    {
        return this.#styleNode ?? this.#linkNode ?? this.#hostSheet ?? null;
    }

    /** Current append mode, or null if detached. */
    get Mode(): 'style' | 'file' | 'sheet' | 'link' | 'parent' | null { return this.#appendMode; }


    // ─────────────────────────────────────────────────────────────────────────
    //  Static — Master Sheet (Golem `Css.SheetES5` parity)
    //
    //  When set, every `Rule.css(...)` / `Rule.append(...)` call without an
    //  explicit `target` argument will auto-append to this master Sheet
    //  instead of creating a fresh <style> in <head>.
    //
    //  Mirrors the original Golem pattern:
    //
    //    Css.SheetES5 = new SheetES5();           // master sheet for the doc
    //    new Css('.a', { color: 'red' });         // → appended to master
    //    new Css('.b', { color: 'blue' });        // → appended to master
    //
    //  v2 equivalent:
    //
    //    Rule.Sheet = new Stylesheet();                // master sheet (auto-Blob+<link>)
    //    Rule.css('.a', { color: 'red' });        // → master.Rules.add
    //    Rule.css('.b', { color: 'blue' });       // → master.Rules.add
    //
    //  Set to `null` to restore the default <style>-per-rule behaviour.
    // ─────────────────────────────────────────────────────────────────────────

    static #masterSheet: unknown = null;

    /**
     * Master Sheet for all `Rule.css(...)` / `Rule.append(...)` calls.
     * When set, every rule created via these helpers without an explicit
     * target will auto-append to this Sheet. Set to `null` to disable.
     */
    static get Sheet(): unknown { return Rule.#masterSheet; }
    static set Sheet(s: unknown) { Rule.#masterSheet = s; }


    // ─────────────────────────────────────────────────────────────────────────
    //  Static shortcuts — Golem-style `new Css(selector, rules, [sheet], [idx])`
    // ─────────────────────────────────────────────────────────────────────────

    static css(selector: string, contents: CSSProperties | string, target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
    static css(definition: RuleDefinition,                          target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
    static css(
        arg0  : string | RuleDefinition,
        arg1? : CSSProperties | string | 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null,
        arg2? : 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null | number,
        arg3? : number,
    ): Rule
    {
        let rule: Rule;
        let target: Parameters<Rule['append']>[0] = undefined;
        let index : number | undefined           = undefined;

        if (typeof arg0 === 'string')
        {
            rule   = new Rule(arg0, arg1 as CSSProperties | string);
            target = arg2 as typeof target;
            index  = arg3;
        }
        else
        {
            rule   = new Rule(arg0);
            target = arg1 as typeof target;
            index  = arg2 as number | undefined;
        }

        // If no explicit target AND a master Sheet is set globally, use it.
        if ((target === undefined || target === null) && Rule.#masterSheet)
            target = Rule.#masterSheet as unknown as typeof target;

        return rule.append(target, index);
    }

    /** Alias for `Rule.css(...)`. Mirrors `new Css(...)` more literally. */
    static append(selector: string, contents: CSSProperties | string, target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
    static append(definition: RuleDefinition,                          target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
    static append(
        arg0  : string | RuleDefinition,
        arg1? : CSSProperties | string | 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null,
        arg2? : 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null | number,
        arg3? : number,
    ): Rule
    {
        return (typeof arg0 === 'string')
            ? Rule.css(arg0, arg1 as CSSProperties | string, arg2 as Parameters<Rule['append']>[0], arg3)
            : Rule.css(arg0, arg1 as Parameters<Rule['append']>[0], arg2 as number | undefined);
    }
}

// ── CssState ──────────────────────────────────────────────────────────────────

/**
 * Binds a DOM element to a CSS state triggered by a DOM event.
 * Mirrors Golem's Css.State constructor.
 *
 * @example
 *   const state = new CssState(
 *     buttonEl,
 *     'MouseDown',
 *     existingCssRule,
 *     { background: 'yellow', animation: 'Boh 2s' },
 *     (event) => console.log('clicked'),
 *     '@Keyframes Boh',
 *     { From: { background: 'yellow' }, To: { background: 'red' } }
 *   );
 */
export class CssState
{
    #element     : Element;
    #eventName   : string;
    #baseRule    : Rule;
    #stateProps  : CSSProperties;
    #keyframes   : Rule | null = null;
    action       : ((e: Event) => void) | null;

    /** Warn at most once about non-string eventName misuse — avoids console spam. */
    static #warnedBadEvent = false;

    constructor(
        element    : Element,
        eventName  : string,
        baseRule   : Rule,
        stateProps : CSSProperties,
        action?    : ((e: Event) => void) | null,
        keyframeSelector?: string,
        keyframeContents?: Record<string, unknown>,
    )
    {
        this.#element    = element;

        // Robustness: tolerate a legacy / mis-ordered call where the CSS props object
        // landed in the `eventName` slot — e.g. `new CssState(el, { Background: '…' })`
        // (props where the event name should be, no stateProps). There is then no DOM
        // event: treat the object as the state props and bind nothing. This is exactly
        // what produced the "eventName should be a string" warning followed by
        // `normaliseProps(undefined)` → "can't convert undefined to object".
        let _eventName: unknown        = eventName;
        let _stateProps: CSSProperties = stateProps;
        const eventIsObject = _eventName !== null && typeof _eventName === 'object';
        if (eventIsObject
            && !('type' in (_eventName as object))                 // not an Event
            && (_stateProps === undefined || _stateProps === null))
        {
            _stateProps = _eventName as CSSProperties;             // recover the misplaced props
            _eventName  = '';
        }

        const _ev = typeof _eventName === 'string'
            ? _eventName
            : String((_eventName as { type?: unknown } | null | undefined)?.type ?? '');
        if (typeof eventName !== 'string' && !CssState.#warnedBadEvent)
        {
            CssState.#warnedBadEvent = true;
            console.warn('[arianna] CssState: non-string eventName — recovered as state props; check the call site (warned once).');
        }

        this.#eventName  = _ev.toLowerCase().replace(/^mouse/, 'mouse');
        this.#baseRule   = baseRule;
        this.#stateProps = normaliseProps(_stateProps);
        this.action      = action ?? null;

        if (keyframeSelector && keyframeContents)
        {
            const name = keyframeSelector.replace(/@[Kk]eyframes\s+/, '').trim();
            this.#keyframes = new Rule({
                Selector : { Type: '@keyframes', Name: name },
                Contents : keyframeContents as Record<string, unknown>,
            });
            // Inject keyframes into document
            const style = document.createElement('style');
            style.textContent = this.#keyframes.Text;
            document.head.appendChild(style);
        }

        // Map Golem-style event names to DOM event names. Only bind when we have a real
        // event name AND a base rule AND a real EventTarget — a recovered/garbage call
        // leaves _ev='' (domEvent='') and must not register a dead listener or later
        // call merge() on an undefined base rule.
        const domEvent = this.#mapEvent(_ev);
        if (domEvent && this.#baseRule && element && typeof element.addEventListener === 'function')
        {
            element.addEventListener(domEvent, (e) =>
            {
                this.#baseRule.merge(this.#stateProps);
                this.action?.(e);
            });
        }
    }

    #mapEvent(name: string): string
    {
        const map: Record<string, string> = {
            'mousedown'  : 'mousedown',
            'mouseup'    : 'mouseup',
            'mouseout'   : 'mouseout',
            'mouseover'  : 'mouseover',
            'mousemove'  : 'mousemove',
            'mouseenter' : 'mouseenter',
            'mouseleave' : 'mouseleave',
            'click'      : 'click',
            'focus'      : 'focus',
            'blur'       : 'blur',
        };
        return map[name.toLowerCase()] ?? name.toLowerCase();
    }

    get Keyframes(): Rule | null { return this.#keyframes; }

    /** Pin the constructor name (bundler renames the colliding local to `_Rule`)
     *  and expose `window.Rule` + the `window.Css` namespace. Runs once at class-eval. */
    static #Build(): void
    {
        try { Object.defineProperty(this, 'name', { value: 'Rule', configurable: true }); } catch { /* frozen */ }
        if (typeof window === 'undefined') return;
        if (!Object.prototype.hasOwnProperty.call(window, 'Rule'))
            Object.defineProperty(window, 'Rule', { enumerable: true, configurable: false, writable: false, value: this });
        // Css namespace — mirrors Golem's static Css.GetSelector / GetType / etc.
        if (!('Css' in window))
            Object.defineProperty(window, 'Css', {
                enumerable: true, configurable: true, writable: true,
                value: {
                    GetSelector : (def: RuleDefinition) => Rule.GetSelector(def),
                    GetType     : (def: RuleDefinition) => Rule.GetType(def),
                    GetContents : (def: RuleDefinition) => Rule.GetContents(def),
                    GetText     : (def: RuleDefinition) => Rule.GetText(def),
                    GetObject   : (cssText: string)     => Rule.GetObject(cssText),
                    State       : CssState,
                },
            });
    }

    static { this.#Build(); }
}

export { CssState as State };
export default Rule;
