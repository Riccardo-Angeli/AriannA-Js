/**
 * @module    Stylesheet
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Sheet — manages a CSSStyleSheet with a clean, observable API.
 *
 * Constructor overloads:
 *   new Stylesheet()                  — empty sheet, auto-creates <style>
 *   new Stylesheet(sheetInstance)     — clone from another Sheet
 *   new Stylesheet(cssStyleSheet)     — wrap existing CSSStyleSheet
 *   new Stylesheet(cssRuleList)       — from CSSRuleList
 *   new Stylesheet(htmlLinkElement)   — link to external stylesheet
 *   new Stylesheet(rulesArray)        — from Array<CSSRule | Rule>
 *   new Stylesheet(cssString)         — parse CSS text
 *   new Stylesheet(objectSyntax)      — object literal rule definitions
 *   new Stylesheet(url: string)       — fetch + parse an existing stylesheet URL
 *                                  (mirrors Golem: SheetES5("http://..."))
 *
 * Static API:
 *   Stylesheet.Sheets      → all Sheet instances
 *   Stylesheet.Links       → all <link> elements
 *   Stylesheet.Paths       → all href strings
 *   Stylesheet.ToString(s) → serialize source to CSS string
 *   Stylesheet.Parse(text) → CSSStyleSheet from text
 *   Stylesheet.ToArray(t)  → CSSRule[] from text
 *   Stylesheet.Less(text)  → parse Less/Stylus-style text to CSS string
 *                        (mirrors Golem: SheetES5.Less(text))
 *
 * Instance API:
 *   // Getters / Setters
 *   .Index    .Length    .Loading   .Loaded    .State
 *   .Name     .Text      .Link      .Sheet     .Rules
 *   .Object   .Observable
 *
 *   // CRUD methods (all return `this` — chainable)
 *   .parse(text | object | CSSStyleSheet | Rule[])
 *   .getIndex(rule | selector)
 *   .contains(rules)
 *   .get(rules)            — also accepts '@keyframes Name' selector
 *   .Get(rules)            — Golem alias for .get()
 *   .set(rule, value)
 *   .insert(rules, index)  — Golem: sheet.Insert(rule, idx)
 *   .add(rules)            — Golem: sheet.Add(rule1, rule2)
 *   .unshift(rules)
 *   .remove(rules)
 *   .shift(n)
 *   .pop(n)
 *   .clear()
 *
 * @example
 *   const sheet = new Stylesheet('.my-btn { background: dodgerblue; color: white }');
 *   sheet.add('.my-btn:hover { background: crimson }');
 *   sheet.set('.my-btn', { color: 'yellow' });
 *   sheet.on('Sheet-Changed', e => console.log(e));
 *
 * @example
 *   // Golem SheetES5 pattern — fetch existing stylesheet
 *   const sheet2 = new Stylesheet('http://localhost:8080/styles/golem');
 *   sheet2.on('Sheet-Loaded', () => {
 *     console.log(sheet2.Get('@keyframes spin').Selector);
 *   });
 *
 * @example
 *   // Less/Stylus parser
 *   const css = Stylesheet.Less(`
 *     .box
 *       background: red
 *       .inner
 *         color: white
 *   `);
 */

import Observable from './Observable.ts';
import { Rule } from './Rule.ts';
import type { RuleDefinition, CSSProperties } from './Rule.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SheetInput =
    | Stylesheet
    | CSSStyleSheet
    | CSSRuleList
    | HTMLLinkElement
    | CSSRule[]
    | Rule[]
    | Rule
    | string
    | SheetObjectDef;

/**
 * Live array-like view of a Sheet's rules.
 *
 * Behaves as both an array (indexed access, `length`, `for…of`, `map/filter/…`,
 * `push/pop/shift/unshift/splice`) AND as a mutation API (`add`, `Add`, `insert`,
 * `remove`, `clear`, `contains`, `get`, `getIndex`). All mutating operations
 * delegate to the parent Sheet and trigger a CSSOM flush + `Sheet-Changed`
 * event automatically.
 *
 *   sheet.Rules.add(rule);       // flushed, emit
 *   sheet.Rules.remove(rule);    // flushed, emit
 *   sheet.Rules[2];              // indexed read
 *   sheet.Rules.length;          // count
 *   for (const r of sheet.Rules) { … }
 */
export interface RulesView extends ReadonlyArray<Rule>
{
    add(...rules: (SheetRule | SheetRule[])[]): Stylesheet;
    Add(...rules: (SheetRule | SheetRule[])[]): Stylesheet;
    insert(rules: SheetRule | SheetRule[], index: number): Stylesheet;
    Insert(rules: SheetRule | SheetRule[], index: number): Stylesheet;
    unshift(...rules: (SheetRule | SheetRule[])[]): Stylesheet;
    remove(...rules: (SheetRule | number)[]): Stylesheet;
    shift(n?: number): Stylesheet;
    pop(n?: number): Stylesheet;
    clear(): Stylesheet;
    contains(...rules: SheetRule[]): boolean;
    get(...rules: SheetRule[]): Rule | Rule[] | undefined;
    Get(...rules: SheetRule[]): Rule | Rule[] | undefined;
    getIndex(rule: SheetRule): number;
    set(rule: SheetRule, value: CSSProperties | string): Stylesheet;
}

export interface SheetObjectDef
{
    [name: string]: RuleDefinition | CSSProperties;
}

export type SheetRule = Rule | CSSRule | string;

// ── Normalizers ───────────────────────────────────────────────────────────────

function toKebab(s: string): string
{
    return s.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
}

function toCamel(s: string): string
{
    return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// ── Less parser — thin wrapper to additionals/Less ────────────────────────────
//
// Historical note: prior versions of this file embedded a minimal indentation-
// based parser inline. The full Less.js-flavoured parser now lives in
// `additionals/Less.ts` as a sibling of Sass / Scss / Stylus. We import it
// here as a thin wrapper so that `Stylesheet.Less(text)` and `SheetES5.Less(text)`
// keep working unchanged. The intentionally-minimal indented dialect that the
// old internal parser implemented is also handled by additionals/Less.ts
// thanks to its mixed brace/indent input handling.

import { parseLess } from '../additionals/Less.ts';

// ── Sheet class ───────────────────────────────────────────────────────────────

export class Stylesheet
{

    // ── Private fields ─────────────────────────────────────────────────────────
    #head    : HTMLHeadElement | HTMLElement;
    #link    : HTMLLinkElement | null = null;
    #sheet   : CSSStyleSheet  | null = null;
    #rules   : Rule[]                = [];
    #loaded  : boolean               = false;
    #loading : boolean               = true;
    #state   : string                = 'Loading';
    #index   : number                = -1;
    #name    : string                = '';
    #obs     : Observable | false    = false;

    // ── Constructor ─────────────────────────────────────────────────────────────

    constructor(...args: SheetInput[])
    {
        this.#head = document.head ?? document.documentElement;

        const input: SheetInput | undefined =
            args.length === 0    ? undefined :
            args.length === 1    ? args[0] :
            /* multiple args */    args.filter(a => a instanceof Rule) as Rule[];

        if (input !== undefined)
        {
            if (typeof input === 'string')
            {
                // Detect URL (starts with http/https//) vs CSS text
                if (/^https?:\/\/|^\/\//.test(input.trim()))
                {
                    this.#loadUrl(input.trim());
                } else {
                    this.#parseText(input);
                }
            } else if (typeof input === 'object') {
                if (input instanceof Stylesheet)
                {
                    this.#sheet = input.Sheet;
                    this.#rules = input.#rules.map(r => r.clone());
                } else if (input instanceof CSSStyleSheet)
                {
                    this.#sheet = input;
                } else if (input instanceof CSSRuleList)
                {
                    this.#rules = Array.from(input).map(r => new Rule(r));
                } else if (input instanceof HTMLLinkElement)
                {
                    this.#link = input;
                } else if (input instanceof Rule)
                {
                    this.#rules = [input];
                } else if (Array.isArray(input))
                {
                    this.#rules = input.map(r =>
                        r instanceof Rule ? r : new Rule(r as CSSRule)
                    );
                } else
                {
                    this.#parseObject(input as SheetObjectDef);
                }
            }
        }

        if (!this.#link)
        {
            this.#link      = document.createElement('link') as HTMLLinkElement;
            this.#link.type = 'text/css';
            this.#link.rel  = 'stylesheet';
        }

        if (!this.#link.href)
        {
            const blob      = new Blob([''], { type: 'text/css' });
            this.#link.href = URL.createObjectURL(blob);
            this.#head.appendChild(this.#link);
        }

        if (!this.#sheet)
        {
            const style = document.createElement('style');
            this.#head.appendChild(style);
            this.#sheet = style.sheet!;
        }

        if (this.#rules.length) this.#flushRules();

        this.#loaded  = true;
        this.#loading = false;
        this.#state   = 'Loaded';
        this.#index   = Array.from(document.styleSheets).indexOf(this.#sheet!);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    #parseText(text: string): void
    {
        const style = document.createElement('style');
        style.textContent = this.#preprocess(text);
        this.#head.appendChild(style);
        if (style.sheet)
            this.#rules = Array.from(style.sheet.cssRules).map(r => new Rule(r));
        this.#head.removeChild(style);
    }

    /**
     * Route input through the Less preprocessor when it is available, falling
     * back to the browser's native parser otherwise.
     *
     *   • If `additionals/Less` is loaded (which is the case in the default
     *     bundle, since Stylesheet.ts imports it at the top), the input is
     *     first compiled to standard CSS — this lets users write Less-style
     *     `@var: value; .x { color: @var; &:hover { ... } }` in `sheet.Text`
     *     or `sheet.parse(string)`.
     *
     *   • If preprocessing throws (parser unavailable, or input is malformed
     *     Less / pure CSS that confuses the parser), we silently use the raw
     *     input — the browser's native parser then handles standard CSS just
     *     fine.
     *
     * The preprocessor's "if there are no Less features, returns input as-is"
     * behaviour means this is safe for ordinary CSS too: zero-cost for plain
     * CSS, full-featured for Less.
     */
    #preprocess(text: string): string
    {
        try
        {
            // parseLess is imported at the top of this file when the default
            // bundle is built. In stripped builds without additionals, the
            // import resolves to `undefined`, which makes the call throw and
            // we fall through to the raw browser path.
            return typeof parseLess === 'function' ? parseLess(text) : text;
        }
        catch
        {
            return text;
        }
    }

    #parseObject(obj: SheetObjectDef): void
    {
        const entries = Object.entries(obj);

        // ── Flat property map detection ──────────────────────────────────────
        // A flat map like { Display:'block', Background:'…', Color:'white' } is a
        // single rule's PROPERTIES, not a selector→properties map. Its values are
        // CSS primitives (string/number), never nested rule objects. In that case
        // wrap the whole object as one `:host { … }` rule. (Without this the loop
        // below pushes ZERO rules — the cause of plain-object CSS, e.g. case 4a/4e,
        // producing an empty stylesheet and no applied styles.)
        const isFlatPropertyMap = entries.length > 0 && entries.every(([, v]) =>
            typeof v !== 'object' || v === null);
        if (isFlatPropertyMap) {
            this.#rules.push(new Rule(':host', obj as unknown as CSSProperties));
            return;
        }

        for (const [, def] of entries)
        {
            const d = def as RuleDefinition;
            if (d.Selector || d.Contents || d.Content || d.Rule || d.Body)
            {
                this.#rules.push(new Rule(d));
            } else
            {
                for (const [sel, props] of Object.entries(obj))
                {
                    if (typeof props === 'object' && !('Selector' in props))
                        this.#rules.push(new Rule(sel, props as CSSProperties));
                }
                break;
            }
        }
    }

    /**
     * Fetch an external stylesheet URL and parse its rules.
     * Fires 'Sheet-Loaded' on completion, 'Sheet-Error' on failure.
     */
    #loadUrl(url: string): void
    {
        this.#loading = true;
        this.#loaded  = false;
        this.#state   = 'Loading';

        fetch(url)
            .then(r => r.text())
            .then(text => {
                this.#parseText(text);
                this.#loaded  = true;
                this.#loading = false;
                this.#state   = 'Loaded';
                this.#flushRules();
                this.#emit('Sheet-Loaded', { url });
            })
            .catch(err => {
                this.#state   = 'Error';
                this.#loading = false;
                this.#emit('Sheet-Error', { url, error: err });
            });
    }

    #flushRules(): void
    {
        if (!this.#sheet) return;
        while (this.#sheet.cssRules.length)
            this.#sheet.deleteRule(0);
        // Use LIVE cssRules.length, not forEach i. Browser-rejected rules
        // (e.g. ::-moz-selection on Chrome) don't advance the index, so
        // using `i` causes IndexSizeError cascade.
        this.#rules.forEach((r) => {
            try { this.#sheet!.insertRule(r.Text, this.#sheet!.cssRules.length); }
            catch (e) { console.warn(`Sheet: could not insert rule "${r.Selector}":`, e); }
        });
    }

    #emit(type: string, detail: unknown): void
    {
        if (this.#obs instanceof Observable)
            this.#obs.fire({ Type: type, Sheet: this, Detail: detail });
    }

    // ── Static API ───────────────────────────────────────────────────────────────

    static get Sheets(): Stylesheet[]
    {
        return Array.from(document.styleSheets).map(s => new Stylesheet(s));
    }

    static get Links(): HTMLLinkElement[]
    {
        return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    }

    static get Paths(): string[]
    {
        return Stylesheet.Links.map(l => l.href).filter(Boolean);
    }

    static ToString(source: SheetInput | Rule[]): string
    {
        if (typeof source === 'string') return source;
        if (Array.isArray(source))
            return source.map(r => r instanceof Rule ? r.Text : (r as CSSRule).cssText).join('\n');
        if (source instanceof Stylesheet)
            return source.#rules.map(r => r.Text).join('\n');
        if (source instanceof CSSStyleSheet)
            return Array.from(source.cssRules).map(r => r.cssText).join('\n');
        return '';
    }

    static Parse(text: string): CSSStyleSheet | null
    {
        const style = document.createElement('style');
        style.textContent = text;
        document.head.appendChild(style);
        const sheet = style.sheet;
        document.head.removeChild(style);
        return sheet;
    }

    static ToArray(text: string): CSSRule[]
    {
        const s = Stylesheet.Parse(text);
        return s ? Array.from(s.cssRules) : [];
    }

    /**
     * Parse Less/Stylus-style indented CSS to a standard CSS string.
     * Mirrors Golem's SheetES5.Less(text).
     *
     * Supports: indented nesting, variables (@var: val / $var: val / $var = val),
     * variable substitution, single-line comments (//).
     *
     * @example
     *   Stylesheet.Less(`
     *     @primary: dodgerblue
     *     .box
     *       background: @primary
     *       .inner
     *         color: white
     *   `);
     *   // → '.box { background: dodgerblue; }\n.box .inner { color: white; }\n'
     */
    static Less(text: string): string
    {
        return parseLess(text);
    }

    // ── Getters ────────────────────────────────────────────────────────────────

    get Index(): number   { return this.#index; }
    get Length(): number  { return this.#rules.length; }
    get Loading(): boolean { return this.#loading; }
    get Loaded(): boolean  { return this.#loaded; }
    get State(): string    { return this.#state; }

    get Object(): Record<string, string>
    {
        const out: Record<string, string> = {};
        if (!this.#sheet) return out;
        try
        {
            for (const rule of Array.from(this.#sheet.cssRules))
            {
                if (rule instanceof CSSStyleRule)
                {
                    const decl = rule.style;
                    for (let i = 0; i < decl.length; i++)
                    {
                        const prop = decl[i] ?? '';
                        if (prop) out[toCamel(prop)] = decl.getPropertyValue(prop).trim();
                    }
                }
            }
        } catch { /* cross-origin — skip */ }
        return out;
    }

    get Name(): string { return this.#name; }
    set Name(v: string) { this.#name = v; }

    /** Full serialized CSS text of all rules. */
    get Text(): string { return this.#rules.map(r => r.Text).join('\n'); }
    set Text(v: string) { this.parse(v); }

    get Link(): HTMLLinkElement | null { return this.#link; }
    set Link(v: HTMLLinkElement | string | null)
    {
        if (typeof v === 'string') {
            this.#link      = document.createElement('link') as HTMLLinkElement;
            this.#link.rel  = 'stylesheet';
            this.#link.href = v;
            this.#head.appendChild(this.#link);
        } else
        {
            this.#link = v;
        }
    }

    get Sheet(): CSSStyleSheet | null { return this.#sheet; }
    set Sheet(v: CSSStyleSheet | null)
    {
        if (v instanceof CSSStyleSheet)
        {
            this.#sheet = v;
            this.#rules = Array.from(v.cssRules).map(r => new Rule(r));
        }
    }

    /**
     * Live array-like view of this Sheet's rules.
     *
     * The returned object proxies all array reads (indexed access, length,
     * iteration, map/filter/forEach/…) directly onto the internal `Rule[]`,
     * AND exposes mutation methods that delegate to the Sheet itself
     * (`add`, `insert`, `remove`, `clear`, `unshift`, `shift`, `pop`, `set`,
     * `contains`, `get`, `Get`, `getIndex`, plus the array `push/splice` shims).
     * Every mutation triggers a CSSOM flush and a `Sheet-Changed` event.
     *
     *   sheet.Rules.add(rule)        // flushed + event
     *   sheet.Rules.remove(rule)
     *   sheet.Rules.clear()
     *   sheet.Rules[0]               // indexed read
     *   sheet.Rules.length
     *   for (const r of sheet.Rules) { … }
     */
    get Rules(): RulesView
    {
        const self = this;
        const arr  = this.#rules;

        // Method bag — mutations go through Sheet (which flushes + emits)
        const methods: Record<string, unknown> = {
            add     : (...args: (SheetRule | SheetRule[])[]) => self.add(...args),
            Add     : (...args: (SheetRule | SheetRule[])[]) => self.add(...args),
            insert  : (rules: SheetRule | SheetRule[], i: number) => self.insert(rules, i),
            Insert  : (rules: SheetRule | SheetRule[], i: number) => self.insert(rules, i),
            unshift : (...rules: (SheetRule | SheetRule[])[]) => self.unshift(...rules),
            remove  : (...rules: (SheetRule | number)[]) => self.remove(...rules),
            shift   : (n?: number) => self.shift(n),
            pop     : (n?: number) => self.pop(n),
            clear   : () => self.clear(),
            contains: (...rules: SheetRule[]) => self.contains(...rules),
            get     : (...rules: SheetRule[]) => self.get(...rules),
            Get     : (...rules: SheetRule[]) => self.Get(...rules),
            getIndex: (rule: SheetRule) => self.getIndex(rule),
            set     : (rule: SheetRule, value: CSSProperties | string) => self.set(rule, value),
            // Array shim — push is an alias for add (appends), splice routes through remove/insert.
            push    : (...rules: SheetRule[]) => { self.add(...rules); return self.Length; },
            splice  : (start: number, deleteCount: number = 0, ...items: SheetRule[]) =>
            {
                const removed: Rule[] = arr.slice(start, start + deleteCount);
                for (let i = 0; i < deleteCount; i++) self.remove(start);
                if (items.length) self.insert(items, start);
                return removed;
            },
        };

        return new Proxy(arr, {
            get(target, prop, receiver)
            {
                if (typeof prop === 'string' && prop in methods)
                    return methods[prop];
                // Length, indexed access, Symbol.iterator, array methods (map/filter/…)
                // all fall through to the underlying Rule[].
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, value, receiver)
            {
                // Allow assigning by index: sheet.Rules[2] = newRule
                if (typeof prop === 'string' && /^\d+$/.test(prop))
                {
                    const idx = Number(prop);
                    if (value instanceof Rule)
                    {
                        target[idx] = value;
                        // Trigger flush via the Sheet's internal mechanism
                        (self as unknown as { ['#flushRules']?: () => void });
                        // Use a lightweight re-flush path: re-call add with current rules
                        // (avoid duplicate by using set/insert semantics)
                        // Simpler: directly invoke private flush through a known public path
                        self.parse(self.Text);
                        return true;
                    }
                }
                return Reflect.set(target, prop, value, receiver);
            },
        }) as unknown as RulesView;
    }
    set Rules(v: Rule[] | CSSRuleList | string)
    {
        if (typeof v === 'string') { this.add(v); return; }
        if (v instanceof CSSRuleList)
        {
            Array.from(v).forEach(r => this.add(new Rule(r)));
            return;
        }
        v.forEach(r => this.add(r));
    }

    get Observable(): Observable | false { return this.#obs; }
    set Observable(v: Observable | boolean)
    {
        if (v === true)  { this.#obs = new Observable(this); return; }
        if (v === false) { this.#obs = false; return; }
        if (v instanceof Observable) this.#obs = v;
    }

    on(types: string, cb: (e: object) => void): this
    {
        if (!this.#obs) this.#obs = new Observable(this);
        this.#obs.on(types, cb);
        return this;
    }

    /**
     * Remove a previously-registered listener. Counterpart of `on()`.
     */
    off(types: string, cb: (e: object) => void): this
    {
        if (this.#obs) this.#obs.off(types, cb as never);
        return this;
    }

    // ── CRUD methods ──────────────────────────────────────────────────────────

    parse(input: SheetInput): this
    {
        this.#rules = [];

        if (typeof input === 'string') {
            if (/^https?:\/\/|^\/\//.test(input.trim()))
                this.#loadUrl(input.trim());
            else
                this.#parseText(input);
        } else if (input instanceof CSSStyleSheet)
        {
            this.#rules = Array.from(input.cssRules).map(r => new Rule(r));
            this.#sheet = input;
        } else if (input instanceof CSSRuleList)
        {
            this.#rules = Array.from(input).map(r => new Rule(r));
        } else if (Array.isArray(input))
        {
            this.#rules = input.map(r => r instanceof Rule ? r : new Rule(r as CSSRule));
        } else if (typeof input === 'object' && input !== null) {
            if (input instanceof Stylesheet)
                this.#rules = input.#rules.map(r => r.clone());
            else
                this.#parseObject(input as SheetObjectDef);
        }

        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'parse' });
        return this;
    }

    getIndex(rule: SheetRule): number
    {
        const selector = typeof rule === 'string'
            ? rule.trim()
            : rule instanceof Rule
                ? rule.Selector.trim()
                : (rule as CSSStyleRule).selectorText?.trim() ?? '';

        return this.#rules.findIndex(r =>
            r.Selector.trim().replace(/\s+/g, '') === selector.replace(/\s+/g, ''));
    }

    contains(...rules: SheetRule[]): boolean
    {
        return rules.every(r => this.getIndex(r) >= 0);
    }

    /**
     * Get one or more rules by selector string, Rule instance, or CSSRule.
     * Also accepts @-rule selectors: sheet.get('@keyframes spin')
     * Mirrors Golem: sheet.Get('@keyframes Settete')
     */
    get(...rules: SheetRule[]): Rule | Rule[] | undefined
    {
        if (rules.length === 1)
        {
            const rule0 = rules[0];
            if (rule0 === undefined) return undefined;
            const i = this.getIndex(rule0);
            return i >= 0 ? this.#rules[i] : undefined;
        }
        return rules.map(r => {
            const i = this.getIndex(r);
            return i >= 0 ? this.#rules[i] : undefined;
        }).filter(Boolean) as Rule[];
    }

    /**
     * Golem alias for .get() — mirrors sheet.Get('@keyframes Settete').
     */
    Get(...rules: SheetRule[]): Rule | Rule[] | undefined
    {
        return this.get(...rules);
    }

    set(rule: SheetRule, value: CSSProperties | string): this
    {
        const i = this.getIndex(rule);
        if (i < 0) return this;

        const r = this.#rules[i];
        if (!r) return this;
        if (typeof value === 'string')
            r.replace(value);
        else
            r.merge(value);

        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'set', index: i, rule: r });
        return this;
    }

    insert(rules: SheetRule | SheetRule[], index: number): this
    {
        const arr = Array.isArray(rules) ? rules : [rules];
        const newRules = arr.map(r =>
            r instanceof Rule ? r :
            typeof r === 'string' ? Rule.Parse(r)[0] :
            new Rule(r as CSSRule)
        ).filter(Boolean) as Rule[];

        this.#rules.splice(index, 0, ...newRules);
        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'insert', index, count: newRules.length });
        return this;
    }

    /** Golem alias: sheet.Insert(rule, idx) */
    Insert(rules: SheetRule | SheetRule[], index: number): this
    {
        return this.insert(rules, index);
    }

    add(...args: (SheetRule | SheetRule[] | number)[]): this
    {
        const last   = args[args.length - 1];
        const hasIdx = typeof last === 'number';
        const idx    = hasIdx ? (last as number) : undefined;
        const src    = (hasIdx ? args.slice(0, -1) : args) as (SheetRule | SheetRule[])[];

        const flat = src.flat() as SheetRule[];
        const newRules = flat.map(r =>
            r instanceof Rule ? r :
            typeof r === 'string' ? (Rule.Parse(r)[0] ?? null) :
            new Rule(r as CSSRule)
        ).filter(Boolean) as Rule[];

        if (hasIdx && idx! >= 0 && idx! <= this.#rules.length)
            this.#rules.splice(idx!, 0, ...newRules);
        else
            this.#rules.push(...newRules);

        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'add', count: newRules.length });
        return this;
    }

    /** Golem alias: sheet.Add(rule1, rule2) */
    Add(...args: (SheetRule | SheetRule[] | number)[]): this
    {
        return this.add(...args);
    }

    unshift(...rules: (SheetRule | SheetRule[])[]): this
    {
        return this.insert(rules.flat() as SheetRule[], 0);
    }

    remove(...rules: (SheetRule | number)[]): this
    {
        for (const r of rules)
        {
            const i = typeof r === 'number' ? r : this.getIndex(r);
            if (i >= 0) this.#rules.splice(i, 1);
        }
        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'remove' });
        return this;
    }

    shift(n = 1): this
    {
        this.#rules.splice(0, n);
        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'shift', count: n });
        return this;
    }

    pop(n = 1): this
    {
        this.#rules.splice(this.#rules.length - n, n);
        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'pop', count: n });
        return this;
    }

    clear(): this
    {
        this.#rules = [];
        this.#flushRules();
        this.#emit('Sheet-Changed', { action: 'clear' });
        return this;
    }

    toString(): string { return this.Text; }
}

// ── Window registration ───────────────────────────────────────────────────────

if (typeof window !== 'undefined')
{
    // Sheet
    Object.defineProperty(window, 'Sheet', {
        enumerable: true, configurable: false, writable: false, value: Stylesheet,
    });

    /**
     * SheetES5 — Golem legacy factory function.
     * Called as: SheetES5()  or  SheetES5("http://...")
     * Also has SheetES5.Less(text) static method.
     *
     * @example
     *   var sheet  = new SheetES5();
     *   var sheet2 = SheetES5("http://localhost:8080/styles/golem");
     *   sheet2.Get('@keyframes Settete').Selector;
     *   SheetES5.Less(lessText);
     */
    function SheetES5(url?: string): Stylesheet
    {
        return url ? new Stylesheet(url) : new Stylesheet();
    }
    SheetES5.Less = (text: string): string => Stylesheet.Less(text);

    if (!('SheetES5' in window))
        Object.defineProperty(window, 'SheetES5', {
            enumerable: true, configurable: true, writable: true, value: SheetES5,
        });
}

export default Stylesheet;
