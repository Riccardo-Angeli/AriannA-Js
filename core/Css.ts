/** @module      Css
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license)
 *  @description AriannA CSS layer — Rule + Stylesheet merged into a single, self-contained
 *               namespace with ONE css service (inject + compile). Depends only on Core
 *               (plus the optional Less preprocessor). No Observable / Shadow / Events imports:
 *               No Observable / Shadow / Events value imports: object-level pub/sub (Rule &
 *               Stylesheet on/off/fire) is resolved from the `'observable'` service through Core;
 *               the event base type is `Events.EventDescriptor` (type-only import). The single DOM
 *               event bind uses native addEventListener.
 */

import { Core }      from './Core.ts';
import { parseLess } from '../additionals/Less.ts';

import type { Types as SchemaTypes } from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

/** @namespace   Css
 *  @public
 *  @memberof    Core
 *  @description AriannA CSS layer — Rule + Stylesheet merged into a single, self-contained namespace with
 *               ONE css service (inject + compile). Depends only on Core (plus the optional Less
 *               preprocessor). No Observable / Shadow / Events value imports: object-level pub/sub (Rule &
 *               Stylesheet on/off/fire) is resolved from the `'observable'` service through Core; the event
 *               base type is `Events.EventDescriptor` (type-only import). The single DOM event bind uses
 *               native addEventListener.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Css
{
    type ServiceContract           = SchemaInterfaces.Css.Service;
    type RuleInterface             = SchemaInterfaces.Css.RuleInterface;
    type SelectorInterface         = SchemaInterfaces.Css.SelectorInterface;
    type StylesheetObjectInterface = SchemaInterfaces.Css.SelectorInterface;
    type StylesheetArguments       = SchemaTypes.Css.StylesheetArguments | Rule[];
    type RuleArguments             = SchemaTypes.Css.RuleArguments | Rule;

    /** @name        Rule
     *  @public
     *  @class
     *  @memberof    Core.Css
     *  @description A single CSS rule — one selector plus its body — as a live, mutable object. Wraps every
     *               construction form (positional `new Rule('.sel', props)`, a RuleInterface object, a native
     *               CSSRule) and normalises it through the composable statics: the instance owns the state
     *               (`#selector`, `#properties`, `#children`, `#contents`), the statics own the serialisation
     *               (GetSelector / GetType / GetContents / GetText / Serialize / GetObject), so there is one
     *               source of truth for CSS output. Handles standard rules and the @-rules (@media, @supports,
     *               @keyframes, @page, @font-face, …), the grouping ones nesting child Rules. Mutations (set /
     *               remove / merge / replace / Selector) emit `'Rule-Changed'` events; `detach` tears the host
     *               down. Static `css` / `Append` create-and-inject in one call, defaulting to the master
     *               `Sheet` when no target is given.
     *
     *               ─────────────────────────────────────────────────────────────────────────
     *                DOM append — auto-inject this Rule into the DOM.
     *
     *                Full port of Golem's original `new Css(selector, rules, [sheet|mode], [index])`
     *                matrix. A Rule becomes immediately effective without requiring a Sheet
     *                wrapper, and supports the FIVE append modes from the original Css.js:
     *
     *                  1. STYLE  — internal <style> appended to <head>             (default, or 'style')
     *                  2. FILE   — Blob URL wrapped in <link rel="stylesheet">     ('file')
     *                  3. SHEET  — appended to an existing v2 Sheet                (Sheet instance)
     *                  4. LINK   — written into existing <link>.sheet or CSSStyleSheet
     *                  5. PARENT — append <style> under a specific Element / ShadowRoot
     *                              (for shadow-DOM scoping or non-<head> hosting)
     *
     *                Each Rule owns at most ONE host artifact at a time (style or link or
     *                sheet position). Re-appending detaches the previous one. Edits to the
     *                rule (Rule-Changed, Selector-Changed) re-sync the host node's content
     *                automatically.
     *
     *                Examples:
     *                  new Rule('.Fancy', { background: 'yellow' }).append();
     *                  new Rule('.Fancy', { background: 'yellow' }).append('style');
     *                  new Rule('.Fancy', { background: 'yellow' }).append('file');
     *                  new Rule('.Fancy', { background: 'yellow' }).append(existingSheet);
     *                  new Rule('.Fancy', { background: 'yellow' }).append(existingSheet, 0);
     *                  new Rule('.Fancy', { background: 'yellow' }).append(linkElement);
     *                  new Rule('.Fancy', { background: 'yellow' }).append(cssStyleSheet);
     *                  new Rule(':root',  { background: 'yellow' }).append(shadowRoot);
     *
     *                Static shortcuts:
     *                  Rule.css('.Fancy', { … });
     *                  Rule.css('.Fancy', { … }, 'file');
     *                  Rule.css({ Selector: '.Fancy', Content: {…} });
     *                  Rule.css({ Selector: '.Fancy', Content: {…} }, sheet);
     *               ─────────────────────────────────────────────────────────────────────────
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class     Rule
    {
        /* ── Rule Instance Private Fields ────*/

        /** @name        #id
         *  @private
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {string}
         *  @description Immutable UUID assigned at construction. Tags the injected `<style>` (`data-arianna-rule`)
         *               and distinguishes instances. Exposed read-only via `Id`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #id : string;

        /** @name        #selector
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {string}
         *  @description The rule's selector as a serialised string — the single source of truth for the selector.
         *               @-rule Type/Name are re-derived from it on demand; no parallel object form is kept.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #selector    : string;

        /** @name        #properties
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {Record<string, string>}
         *  @description The rule's declarations, camelCased keys → values. The body for a standard rule; empty for
         *               @keyframes / @page (whose body lives in `#contents`). Mutated via set / remove / merge / replace.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #properties  : Record<string, string>         = {};

        /** @name        #children
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {Rule[]}
         *  @description Nested child Rules for the grouping @-rules (@media / @supports / @document / @import).
         *               Empty for leaf rules. Serialised inside the parent's braces by `Text`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #children    : Rule[]                         = [];

        /** @name        #contents
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {Record<string, unknown> | null}
         *  @description The raw @-rule body for @keyframes (frames) and @page (margin-boxes), which aren't flat
         *               declarations. `null` for every other rule, whose body is in `#properties` instead.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #contents    : Record<string, unknown> | null = null;

        /** @name        #style
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {HTMLStyleElement | null}
         *  @description The `<style>` node this Rule injected in STYLE mode, or `null`. Its `textContent` is
         *               re-flushed on change by the `#sync` handler; cleared by `detach`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #style       : HTMLStyleElement | null = null;

        /** @name        #link
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {HTMLLinkElement | null}
         *  @description The `<link>` node this Rule injected in FILE / LINK mode, or `null`. Points at the Blob URL
         *               (`#blob`) for FILE mode. Cleared by `detach`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #link        : HTMLLinkElement  | null = null;

        /** @name        #blob
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {string | null}
         *  @description The object URL backing the `<link>` in FILE mode, or `null`. Revoked (URL.revokeObjectURL)
         *               on `detach` to avoid leaking the Blob.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #blob        : string           | null = null;

        /** @name        #sheet
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {{ Rules: { remove(rule): unknown; add(rule): unknown; insert(rule, idx): unknown } } | null}
         *  @description The host Stylesheet this Rule attached to in SHEET mode, or `null`. Duck-typed (not
         *               `Stylesheet`) to avoid a circular import; `detach` removes this Rule from it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #sheet       : { Rules: { remove(rule: unknown): unknown; add(rule: unknown): unknown; insert(rule: unknown, idx: number): unknown } } | null = null;

        /** @name        #index
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {number}
         *  @description This Rule's position inside its host sheet's rule list, or `-1` when detached. Used by
         *               `#resync` to delete + re-insert the rule in place on change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #index       : number = -1;

        /** @name        #mode
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {'style' | 'file' | 'sheet' | 'link' | 'parent' | null}
         *  @description How this Rule is currently injected, or `null` when detached. Set by `append`, read via
         *               `Mode`: STYLE `<style>`, FILE Blob+`<link>`, SHEET Stylesheet, LINK external, PARENT host.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #mode        : 'style' | 'file' | 'sheet' | 'link' | 'parent' | null = null;

        /** @name        #bound
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {(() => void) | null}
         *  @description The live re-sync handler registered by `#sync` on `'Rule-Changed'` / `'Selector-Changed'`,
         *               kept so `detach` can unregister the exact same reference. `null` until `append` wires it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #bound       : (() => void) | null = null;

        /** @name        #text
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {string | null}
         *  @description Memoised serialisation — the value `Text` returns, or `null` when stale. Filled on the
         *               first `Text` read, cleared by `#invalidate` from every mutator. Only the LEAF form is
         *               cached: a Rule with nested children re-assembles on read, because a child's edit fires
         *               on the child and would otherwise leave a stale parent behind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #text        : string | null = null;

        /** @name        #synced
         *  @private
         *  @memberof    Core.Css.Rule
         *  @type        {string | null}
         *  @description The exact CSS text this Rule last wrote into its native sheet, or `null` when it never
         *               did. `#resync` compares against this — never against the live `cssText`, which the
         *               browser hands back normalised and which therefore never equals our own serialisation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #synced      : string | null = null;

        /* ── Rule Instance Constructors ────*/

        /** @name        constructor
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string | RuleInterface | CSSRule} Selector A selector string, a
         *               RuleInterface object, or a native CSSRule.
         *  @param       {string | Record<string, string>} [Content] With a string selector: the body, as a CSS
         *               string or a property object.
         *  @description Build a Rule from any of its three input forms. Every form is first normalised to a
         *               RuleInterface, then the composable statics do the parsing — the constructor only assigns
         *               fields. A CSSRule is split into selector + declaration text; a string selector pairs with
         *               the optional Content; an object is taken as-is. `#selector` gets the serialised selector
         *               (GetSelector); @keyframes / @page keep their raw body (frames / margin-boxes) in
         *               `#contents`, every other rule a normalised property map in `#properties` (GetContents +
         *               GetType). A `Rules` map builds nested child Rules. Each Rule also gets an immutable UUID.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(selector: string, contents?: string | Record<string, string>);
        constructor(definition: RuleInterface);
        constructor(cssRule: CSSRule);
        constructor
        (
            Selector : string | RuleInterface | CSSRule,
            Content? : string | Record<string, string>,
        )
        {
            this.#id = Core.UUID();

            const def: RuleInterface =
                Selector instanceof CSSRule ?
                    {
                        Selector: Selector.cssText.split('{')[0]?.trim() ?? '',
                        Contents: /\{([\s\S]*)\}/.exec(Selector.cssText)?.[1] ?? ''
                    }
                    : typeof Selector === 'string' ?
                        { Selector: Selector, Contents: Content ?? {} }
                        : Selector as RuleInterface;
            this.#selector = Rule.GetSelector(def);


            const type     = Rule.GetType(def).toLowerCase();
            const contents = Rule.GetContents(def);
            if (type === '@keyframes' || type === '@page')
                this.#contents = contents;
            else
                for (const [k, v] of Object.entries(contents))
                    this.#properties[Core.Text.toCamel(k)] = typeof v === 'string' ? v.trim() : String(v).trim();

            if (def.Rules)
            {
                if (Array.isArray(def.Rules))
                {
                    for (const child of def.Rules)
                    {
                        this.#children.push(new Rule(child));
                    }
                }
                else
                {
                    for (const [key, child] of Object.entries(def.Rules))
                    {
                        if (Rule.#CheckSyntax(child as unknown as Record<string, unknown>))
                        {
                            this.#children.push(new Rule(child as RuleInterface));
                        }
                        else
                        {
                            this.#children.push(new Rule(key, child as Record<string, string>));
                        }
                    }
                }
            }
        }

        /* ── Rule Instance Properties - Identity ────*/

        /** @name        Id
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {string}
         *  @description This Rule's immutable UUID, assigned at construction (Core.AriannA.UUID). Stable for the
         *               Rule's lifetime — used to tag its injected `<style>` (`data-arianna-rule`) and to tell
         *               instances apart.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Id(): string { return this.#id; }

        /* ── Rule Instance Properties - Selector ────*/

        /** @name        Selector
         *  @public
         *  @memberof    Core.Css.Rule
         *  @type        {string}
         *  @description The rule's selector as a string. Setting it replaces the selector and emits a
         *               `'Rule-Changed'` event (name `'Selector'`) carrying the old and new values, so any live
         *               `#sync` handler re-flushes. The @-rule Type is derived from this string on read (see Type).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Selector(): string { return this.#selector; }
        set Selector(v: string)
        {
            const old = this.#selector;
            this.#selector   = v;
            this.#invalidate();
            this.#fire
            (
                'Rule-Changed',
                {
                    name: 'Selector',
                    old : old,
                    new : v
                }
            );
        }

        /** @name        AtRuleType
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {string}
         *  @description The at-rule this Rule declares — `'@media'`, `'@keyframes'`, `'@font-face'` — or `''`
         *               for a qualified rule, which declares none. Derived on read from the current selector,
         *               so it can never fall out of step with it, and delegated to the GetType static so the
         *               at-keyword is parsed in ONE place: the instance owns the state, the static owns the
         *               parsing. Kept apart from `Type`, which names the CLASS this value is — a Rule answers
         *               both questions, `Type` for what it IS and `AtRuleType` for what it DECLARES.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get AtRuleType(): string
        {
            const st             = this.#selector.trim();
            const m = /^(@[\w-]+)/.exec(st);
            return m?.[1] ?? '';
        }

        /* ── Rule Instance Properties - Children ────*/

        /** @name        Children
         *  @public
         *  @memberof    Core.Css.Rule
         *  @type        {Rule[]}
         *  @description Nested child Rules, for the grouping @-rules (@media / @supports / @document / @import).
         *               The getter returns a copy — mutating the returned array never touches the Rule; assign a
         *               new array through the setter to replace the children.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Children(): Rule[]
        { return [...this.#children]; }
        set Children(v: Rule[])
        { this.#children = v; this.#invalidate(); }

        /* ── Rule Instance Properties - Properties ────*/

        /** @name        Properties
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {Readonly<Record<string, string>>}
         *  @description The rule's declarations as a read-only camelCased map (a copy, so mutating it never
         *               affects the Rule). To change properties use `set` / `remove` / `merge` / `replace`,
         *               which emit `'Rule-Changed'` and re-flush.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Properties(): Readonly<Record<string, string>>
        { return { ...this.#properties }; }

        /** @name        Text
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {string}
         *  @description The rule serialised to CSS text. Builds a RuleInterface via `#definition`
         *               — nested children included, as a `Rules` map — and delegates to the composable
         *               Rule.GetText static, so the instance owns the state and the static owns the
         *               serialisation. The result is memoised for a LEAF rule and handed back until a mutator
         *               calls `#invalidate`; a rule that has children re-serialises on every read, because a
         *               child's edit fires on the child and a memo held here would go stale unnoticed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Text(): string
        {
            if (this.#text !== null && this.#children.length === 0)
            {
                return this.#text;
            }

            this.#text = Rule.GetText(this.#definition());

            return this.#text;
        }

        /** @name        Host
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {HTMLStyleElement | HTMLLinkElement | object | null}
         *  @description The DOM artifact this Rule is currently injected into, or `null` when detached: the
         *               `<style>` node (STYLE mode), the `<link>` node (FILE / LINK mode), or the host Stylesheet
         *               (SHEET mode) — whichever is set. Pairs with `Mode`, which names which kind it is.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Host(): HTMLStyleElement | HTMLLinkElement | object | null
        {
            return this.#style ?? this.#link ?? this.#sheet ?? null;
        }

        /** @name        Mode
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {'style' | 'file' | 'sheet' | 'link' | 'parent' | null}
         *  @description How this Rule is currently injected into the DOM, or `null` when detached: `'style'` a
         *               `<style>` in `<head>`, `'file'` a Blob + `<link>`, `'sheet'` a v2 Stylesheet, `'link'`
         *               an external stylesheet, `'parent'` a shadow root / element host. Set by `append`,
         *               cleared by `detach`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Mode(): 'style' | 'file' | 'sheet' | 'link' | 'parent' | null
        {
            return this.#mode;
        }

        /** @name        #definition
         *  @private
         *  @memberof    Core.Css.Rule
         *  @returns     {RuleInterface} This Rule as a plain definition object.
         *  @description Project this Rule's state into the definition shape the Rule.GetText static consumes:
         *               the selector, the body (the raw `#contents` of an @keyframes / @page when there is
         *               one, the declarations otherwise), and — for a grouping @-rule — a `Rules` map built by
         *               recursing into every child. The bridge between the instance, which owns the state, and
         *               the static, which owns the serialisation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #definition(): RuleInterface
        {
            const definition : RuleInterface =
                {
                    Selector : this.#selector,
                    Contents : this.#contents ?? this.#properties,
                };

            if (this.#children.length > 0)
            {
                const rules : RuleInterface[] = [];

                for (const child of this.#children)
                {
                    rules.push(child.#definition());
                }

                definition.Rules = rules;
            }

            return definition;
        }

        /** @name        #invalidate
         *  @private
         *  @memberof    Core.Css.Rule
         *  @returns     {void}
         *  @description Drop the memoised `Text`. Called by every mutator before it fires, so the next read
         *               re-serialises exactly once and every read after that is free again.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #invalidate(): void { this.#text = null; }

        /** @name        #sync
         *  @private
         *  @memberof    Core.Css.Rule
         *  @param       {() => void} handler The re-flush callback to run on every change.
         *  @returns     {void}
         *  @description Wire live re-sync: register `handler` for both `'Rule-Changed'` and `'Selector-Changed'`
         *               and stash it in `#bound` so `detach` can unregister it. After this, any property or
         *               selector edit re-runs the handler, keeping the injected `<style>` / CSSOM in step with
         *               the Rule. Called by `append` once the injection target is known.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #sync(handler: () => void): void
        {
            this.#bound = handler;
            this.on('Rule-Changed',     handler);
            this.on('Selector-Changed', handler);
        }

        /** @name        #resync
         *  @private
         *  @memberof    Core.Css.Rule
         *  @param       {CSSStyleSheet | null} sheet The native stylesheet holding this Rule, or null.
         *  @returns     {void}
         *  @description Rewrite this Rule in place inside a native CSSStyleSheet after a change: delete the
         *               rule at `#index` and re-insert the current `Text` at the same position. A no-op when
         *               the sheet is missing, when `#index` is out of range, or when the serialised text is
         *               unchanged — the comparison is against `#synced`, the text this Rule last wrote, never
         *               against the live `cssText`, which the browser returns normalised and which would
         *               therefore never match. A failed delete/insert is swallowed and leaves `#synced`
         *               untouched, so the next change retries instead of assuming the write landed. This is
         *               the CSSOM-mode arm of the `#sync` handler (SHEET / native-stylesheet injection).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #resync(sheet: CSSStyleSheet | null): void
        {
            if (!sheet)
            {
                return;
            }

            if (this.#index < 0 || this.#index >= sheet.cssRules.length)
            {
                return;
            }

            const text = this.Text;

            if (text === this.#synced)
            {
                return;
            }

            try
            {
                sheet.deleteRule(this.#index);
                sheet.insertRule(text, this.#index);

                this.#synced = text;
            }
            catch
            {
            }
        }

        /** @name        get
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string} name A property name in any casing (kebab or camel).
         *  @returns     {string | undefined} The property's value, or `undefined` when it isn't set.
         *  @description Read one property's value. The name is camelCased first (Core.Text.toCamel), so
         *               `'font-size'` and `'fontSize'` return the same value. The inverse of `set`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get(name: string): string | undefined
        {
            return this.#properties[Core.Text.toCamel(name)];
        }

        /** @name        set
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string} name A property name (any casing; camelCased internally).
         *  @param       {string} value The property value (trailing ';' stripped).
         *  @returns     {this} For chaining.
         *  @description Set one property and emit a `'Rule-Changed'` event carrying the old and new values.
         *               The key is camelCased so `'font-size'` and `'fontSize'` address the same property.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set(name: string, value: string): this
        {
            const key = Core.Text.toCamel(name);
            const old = this.#properties[key];
            this.#properties[key] = value.trim().replace(/;$/, '');
            this.#invalidate();
            this.#fire('Rule-Changed', { name: key, old, new: this.#properties[key] });
            return this;
        }

        /** @name        remove
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string} name A property name in any casing (kebab or camel).
         *  @returns     {this} For chaining.
         *  @description Remove one property and emit a `'Rule-Changed'` event carrying its old value (new is
         *               `undefined`). The name is camelCased first, so `'font-size'` and `'fontSize'` address
         *               the same property. A no-op — no event — when the property was not set.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        remove(name: string): this
        {
            const key = Core.Text.toCamel(name);
            const old = this.#properties[key];
            this.#invalidate();
            if (old === undefined) return this;
            delete this.#properties[key];
            this.#fire('Rule-Changed', { name: key, old, new: undefined });
            return this;
        }

        /** @name        merge
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {Record<string, string>} props Properties to merge in (camelCased per key by `set`).
         *  @returns     {this} For chaining.
         *  @description Merge a batch of properties into this Rule, keeping the ones already set that aren't in
         *               `props`. Each pair routes through `set`, so every property emits its own `'Rule-Changed'`
         *               event — unlike `replace`, which swaps the whole map in one event. Use `merge` to add or
         *               update selectively, `replace` to overwrite wholesale.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        merge(props: Record<string, string>): this
        {
            for (const [k, v] of Object.entries(props)) this.set(k, v);
            return this;
        }

        /** @name        replace
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {Record<string, string> | string} props The new contents, as a property object or a CSS string.
         *  @returns     {this} For chaining.
         *  @description Replace ALL properties in one shot and emit a single `'Rule-Changed'` event (name `'*'`)
         *               with the whole old and new maps. Parsing is delegated to the GetContents static (string
         *               or object body), then keys are camelCased and values trimmed — no local parser.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        replace(props: Record<string, string> | string): this
        {
            const old = { ...this.#properties };
            const parsed = Rule.GetContents({ Selector: this.#selector, Contents: props });
            this.#properties = {};
            for (const [k, v] of Object.entries(parsed))
            {
                let p = typeof v === 'string' ? v.trim() : String(v).trim();
                this.#properties[Core.Text.toCamel(k)] = p;
                this.#invalidate();
            }

            this.#fire('Rule-Changed', { name: '*', old, new: this.#properties });
            return this;
        }

        /** @name        has
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string} name A property name in any casing (kebab or camel).
         *  @returns     {boolean} True when the property is set on this Rule.
         *  @description Test whether a property is present. The name is camelCased first (Core.Text.toCamel), so
         *               `'font-size'` and `'fontSize'` query the same property.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        has(name: string): boolean { return Core.Text.toCamel(name) in this.#properties; }

        /* ── Rule Instance Methods - Serialization ────*/

        /** @name        toString
         *  @public
         *  @memberof    Core.Css.Rule
         *  @returns     {string} The rule serialised to CSS text.
         *  @description String coercion for a Rule — returns `Text`, so a Rule interpolates straight into a
         *               template literal or string concatenation as its CSS. `` `${rule}` `` equals `rule.Text`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toString(): string    { return this.Text; }

        /* ── Rule Instance Methods - Events ────*/

        /** @name        #fire
         *  @private
         *  @memberof    Core.Css.Rule
         *  @param       {string} type The event type to emit (e.g. `'Rule-Changed'`, `'Rule-Frame'`).
         *  @param       {{ name: string; old: unknown; new: unknown }} change The property delta carried in
         *               the event: `name` is which property changed, `old`/`new` the values before/after
         *               (for nested values — a stop inside a gradient — these are the deep before/after).
         *  @param       {{ Cancelable?: boolean; Propagation?: boolean; Path?: string[]; Broker?: string }} [event]
         *               Optional EventDescriptor custom arguments. `Cancelable` lets a listener block via
         *               `preventDefault()`; `Propagation` maps to native `bubbles`; `Path` seeds the
         *               traversed-node sequence; `Broker` names a custom jump (unused by default — the
         *               selector target already scopes the dispatch, so no broker is needed).
         *  @returns     {void}
         *  @description Emit ONE event whose TARGET is this Rule's selector string. The `'events'` service
         *               resolves the selector via `querySelectorAll` and dispatches to every matching node,
         *               so a single `Fire` reaches all — and only — the elements this Rule governs; the
         *               selector target scopes it without a broker. The originating Rule plus the property
         *               delta (`name`/`old`/`new`) travel in `Detail`. The service is resolved lazily on
         *               every call (never cached — a service registered after this class loads is still
         *               seen); when absent the `?.` makes it a silent no-op.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #fire(
            type: string,
            change: { name: string; old: unknown; new: unknown },
            event?: { Cancelable?: boolean; Propagation?: boolean; Path?: string[]; Broker?: string },
        ): void
        {
            Core.Services.Events?.Fire(this.#selector, {
                Type       : type,
                Detail     : { rule: this, name: change.name, old: change.old, new: change.new },
                Cancelable : event?.Cancelable ?? false,
                Propagation: event?.Propagation ?? true,
                ...(event?.Path   ? { Path:   event.Path }   : {}),
                ...(event?.Broker ? { Broker: event.Broker } : {}),
            });
        }

        /** @name        on
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string} types One or more event types (space-, comma-, or pipe-separated) to
         *               listen for — e.g. `'Rule-Changed'` or `'Rule-Changed | Rule-Frame'`.
         *  @param       {EventListener} handler The listener invoked when a matching event fires. Receives a
         *               native-style event whose `detail` holds `{ rule, name, old, new }` (or the frame).
         *  @param       {AddEventListenerOptions & { phase?: 'capture' | 'bubble' | 'broker'; brokers?: string[] }} [options]
         *               Native listener options plus the event service's `phase` (pass `'capture'` to catch
         *               the event on the selector's nodes in the capture pass) and `brokers`.
         *  @returns     {this} For chaining.
         *  @description Subscribe to this Rule's events through the `'events'` service, targeting the Rule's
         *               selector string. The service resolves the selector to its matching nodes, so
         *               listening "on the Rule" means listening on every element the Rule applies to — one
         *               `on` call covers the whole set (and picks up nodes added later, since the selector
         *               is re-resolved per dispatch). Resolved lazily; no subscription when the service is
         *               absent. Replaces the former object-level bus subscription.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        on(
            types: string,
            handler: EventListener,
            options?: AddEventListenerOptions & { phase?: 'capture' | 'bubble' | 'broker'; brokers?: string[] },
        ): this
        {
            Core.Services.Events?.On(this.#selector, types, handler, options);
            return this;
        }

        /** @name        off
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {string} types The event type(s) to stop listening for — same string form as `on`.
         *  @param       {EventListener} handler The exact listener reference previously passed to `on`.
         *  @returns     {this} For chaining.
         *  @description Unsubscribe a handler previously registered with `on`, through the `'events'`
         *               service and targeting this Rule's selector (so it detaches from every matching
         *               node). Counterpart of `on`; the same `handler` reference must be supplied.
         *               Resolved lazily; no-op when the service is absent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        off(types: string, handler: EventListener): this
        {
            Core.Services.Events?.Off(this.#selector, types, handler);
            return this;
        }

        /* ── Rule Instance Methods - Comparison ────*/

        /** @name        matches
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {Rule | string | CSSRule} other What to compare against — another Rule, a selector
         *               string, or a native CSSRule.
         *  @returns     {boolean} True when the two target the same selector (trimmed).
         *  @description Test selector identity against another Rule, a raw selector string, or a native CSSRule.
         *               Comparison is on the trimmed selector text only — a string compares directly, a CSSRule
         *               via its `selectorText`, a Rule via its `Selector`. Contents are not considered: two Rules
         *               with the same selector but different properties still match.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        matches(other: Rule | string | CSSRule): boolean
        {
            if (typeof other === 'string')  return this.#selector.trim() === other.trim();
            if (other instanceof CSSRule)   return this.#selector.trim() === (other as CSSStyleRule).selectorText?.trim();
            return this.#selector.trim() === other.Selector.trim();
        }

        /** @name        clone
         *  @public
         *  @memberof    Core.Css.Rule
         *  @returns     {Rule} A deep, independent copy of this Rule.
         *  @description Deep-copy this Rule: the selector string and a fresh property map seed a new Rule via
         *               the constructor; children are cloned recursively; the @-rule body (`#contents`, holding
         *               @keyframes frames / @page margin-boxes) is copied when present. The copy shares no
         *               mutable state with the original — mutating one never affects the other.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clone(): Rule
        {
            const r = new Rule(this.#selector, { ...this.#properties });
            r.#children = this.#children.map(c => c.clone());
            r.#contents = this.#contents ? { ...this.#contents } : null;
            return r;
        }

        /** @name        append
         *  @public
         *  @memberof    Core.Css.Rule
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [target] The injection target, selecting the mode: omitted / `'style'` → STYLE (a `<style>` in `<head>`); `'file'` → FILE (a Blob URL in a `<link>`); a Stylesheet-like object → SHEET; a `<link>` / CSSStyleSheet → LINK; an Element / ShadowRoot → PARENT.
         *  @param       {number} [index] Insertion index when the target is a sheet.
         *  @returns     {this} The Rule, for chaining.
         *  @description Inject this Rule into the DOM in one of the five modes (STYLE / FILE / SHEET / LINK /
         *               PARENT), the runtime dispatch of the append matrix documented on the class. Detaches any
         *               previous host first, so a Rule owns at most one artifact at a time, then mounts the new
         *               one and wires `#sync` so later edits (Rule-Changed / Selector-Changed) re-sync the host
         *               node automatically. Records the chosen `#mode`.
         *
         *                 rule.append()                            // STYLE — <style> in <head>
         *                 rule.append('style')                     // STYLE (explicit)
         *                 rule.append('file')                      // FILE — Blob + <link>
         *                 rule.append(sheet)                       // SHEET — Sheet instance
         *                 rule.append(sheet, 5)                    // SHEET at specific index
         *                 rule.append(linkElement)                 // LINK — write into <link>.sheet
         *                 rule.append(cssStyleSheet)               // CSSStyleSheet direct
         *                 rule.append(shadowRoot)                  // PARENT under shadow
         *                 rule.append(element)                     // PARENT under any Element
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        append(
            target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null,
            index?: number,
        ): this
        {
            this.detach();

            if (target === 'file')
            {
                const cssText = this.Text;
                const blob    = new Blob([cssText], { type: 'text/css' });
                this.#blob = URL.createObjectURL(blob);

                this.#link      = document.createElement('link');
                this.#link.rel  = 'stylesheet';
                this.#link.type = 'text/css';
                this.#link.href = this.#blob;
                this.#link.setAttribute('data-arianna-rule', this.#id);
                (document.head ?? document.documentElement).appendChild(this.#link);

                this.#mode = 'file';
                this.#sync(() => {
                    // Replace Blob: stylesheet URL can't be edited, recreate it.
                    if (this.#blob) URL.revokeObjectURL(this.#blob);
                    const b = new Blob([this.Text], { type: 'text/css' });
                    this.#blob = URL.createObjectURL(b);
                    if (this.#link) this.#link.href = this.#blob;
                });
                return this;
            }


            if (target instanceof HTMLLinkElement)
            {
                this.#link = target;
                const sheet = target.sheet;
                if (sheet)
                {
                    const i = (typeof index === 'number') ? index : sheet.cssRules.length;
                    try { sheet.insertRule(this.Text, i); } catch { /* invalid rule for this sheet */ }
                    this.#index = i;
                }
                this.#mode = 'link';
                this.#sync(() => this.#resync(target.sheet));
                return this;
            }

            if (target instanceof CSSStyleSheet)
            {
                const i = (typeof index === 'number') ? index : target.cssRules.length;
                try { target.insertRule(this.Text, i); } catch { /* skip */ }
                this.#index = i;
                this.#mode = 'link';
                this.#sync(() => this.#resync(target));
                return this;
            }

            if (target instanceof Element || (typeof ShadowRoot !== 'undefined' && target instanceof ShadowRoot))
            {
                this.#style = document.createElement('style');
                this.#style.setAttribute('data-arianna-rule', this.#id);
                this.#style.textContent = this.Text;
                (target as Element | ShadowRoot).appendChild(this.#style);
                this.#mode = 'parent';
                this.#sync(() => { if (this.#style) this.#style.textContent = this.Text; });
                return this;
            }

            if (target && typeof target === 'object'
                && 'Rules' in (target as Record<string, unknown>)
                && (target as { Rules?: { add?: unknown } }).Rules
                && typeof (target as { Rules: { add?: unknown } }).Rules.add === 'function')
            {
                const sheet = target as unknown as
                    { Rules: { add(rule: unknown): unknown; insert(rule: unknown, idx: number): unknown; remove(rule: unknown): unknown } };
                if (typeof index === 'number') sheet.Rules.insert(this, index);
                else                            sheet.Rules.add(this);
                this.#sheet = sheet;
                this.#index = (typeof index === 'number') ? index : -1;
                this.#mode = 'sheet';
                // Re-syncing handled by the Sheet itself (Sheet-Changed flushes).
                return this;
            }

            this.#style = document.createElement('style');
            this.#style.setAttribute('data-arianna-rule', this.#id);
            this.#style.textContent = this.Text;
            (document.head ?? document.documentElement).appendChild(this.#style);
            this.#mode = 'style';
            this.#sync(() => { if (this.#style) this.#style.textContent = this.Text; });
            return this;
        }

        /** @name        detach
         *  @public
         *  @memberof    Core.Css.Rule
         *  @returns     {this} The Rule, for chaining.
         *  @description Tear down this Rule's DOM artifact — remove the `<style>` / `<link>` (revoking its Blob
         *               URL) or its slot in a native sheet, and unbind the `#sync` handler. The Rule descriptor
         *               is preserved, so `append(...)` can re-mount it later. The inverse of `append`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        detach(): this
        {
            if (this.#bound)
            {
                this.off('Rule-Changed',     this.#bound);
                this.off('Selector-Changed', this.#bound);
                this.#bound = null;
            }

            if (this.#style && this.#style.parentNode)
                this.#style.parentNode.removeChild(this.#style);
            this.#style = null;

            if (this.#link && this.#mode === 'file' && this.#link.parentNode)
                this.#link.parentNode.removeChild(this.#link);
            this.#link = null;

            if (this.#blob) { URL.revokeObjectURL(this.#blob); this.#blob = null; }

            if (this.#sheet)
            {
                try { this.#sheet.Rules.remove(this); } catch { /* sheet may be gone */ }
                this.#sheet = null;
            }
            this.#index  = -1;
            this.#mode   = null;
            this.#synced = null;
            return this;
        }

        /* ── Rule Static Members ────*/

        /** @name        Sheet
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @type        {Stylesheet | null}
         *  @description Master Sheet for every `Rule.css(...)` / `Rule.append(...)` call made without an
         *               explicit `target`: when set, those rules auto-append to this Sheet instead of creating
         *               a fresh `<style>` in `<head>`. Golem `Css.SheetES5` parity — the original set
         *               `Css.SheetES5 = new SheetES5()` and every `new Css('.a', {…})` appended to it; the v2
         *               equivalent is `Rule.Sheet = new Stylesheet()` (auto Blob + `<link>`), after which
         *               `Rule.css('.a', {…})` lands in `master.Rules`. Set to `null` to restore the default
         *               `<style>`-per-rule behaviour.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #masterSheet: Stylesheet | null = null;

        /** @name        margins
         *  @private
         *  @constant
         *  @memberof    Core.Css
         *  @type        {Set<string>}
         *  @description The sixteen @page margin-box names, in PascalCase as written in a Golem @page rule
         *               (`TopLeftCorner`, `TopCenter`, `LeftMiddle`, …). Used when serialising @page to tell a
         *               margin-box key from an ordinary declaration, so each maps to its `@top-left-corner` at-rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #margins : Set<string> = new Set
        (
            [
                'TopLeftCorner',
                'TopLeft',
                'TopCenter',
                'TopRight',
                'TopRightCorner',
                'BottomLeftCorner',
                'BottomLeft',
                'BottomCenter',
                'BottomRight',
                'BottomRightCorner',
                'LeftTop',
                'LeftMiddle',
                'LeftBottom',
                'RightTop',
                'RightMiddle',
                'RightBottom'
            ]
        );

        /* ── Rule Static Methods ────*/

        /** @name        #CheckSyntax
         *  @private
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {Record<string, unknown>} o A candidate object.
         *  @returns     {boolean} True if it carries a RuleInterface key (Selector or a body name).
         *  @description Distinguish a RuleInterface from a bare property bag / selector-map for GetText's
         *               format detection. A definition has Selector, Contents, Content, Body, Rule or Rules.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #CheckSyntax(o: Record<string, unknown>): boolean
        {
            return 'Selector' in o ||
                'Contents' in o ||
                'Content' in o  ||
                'Body' in o     ||
                'Rule' in o     ||
                'Rules' in o;
        }

        /** @name        Parse
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {string} text A CSS text string with one or more rules.
         *  @returns     {Rule[]} One Rule per top-level CSS rule found.
         *  @description Parse CSS text into Rule instances via the live CSSOM. Mounts the text in a throwaway
         *               `<style>`, wraps each parsed native `CSSRule` in a Rule, then removes the style node.
         *               The inverse of serialising: text in, Rule objects out.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Parse(text: string): Rule[]
        {
            const style = document.createElement('style');
            style.textContent = text;
            document.head.appendChild(style);
            const rules = Array.from(style.sheet?.cssRules ?? []).map(r => new Rule(r));
            document.head.removeChild(style);
            return rules;
        }

        /** @name        From
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {Rule} rule An existing Rule to copy.
         *  @returns     {Rule} A new independent Rule built from the source.
         *  @description Clone a Rule through the constructor (which re-derives every field from the source), so
         *               the copy shares no mutable state with the original. Mirrors the legacy Css.From.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static From(rule: Rule): Rule { return new Rule(rule); }

        /** @name        Serialize
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {Record<string, string>} props A property map (camelCase keys).
         *  @returns     {string} `prop: value; …` CSS text with kebab-cased properties.
         *  @description The one serialisation primitive. Shared by GetText for standard rules, @keyframes
         *               frames and @page margin-boxes. Public so callers can serialise a bare property bag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Serialize(props: Record<string, string>): string
        {
            return Object.entries(props).map(([k, v]) => `${Core.Text.toKebab(k)}: ${v}`).join('; ');
        }

        /** @name        GetSelector
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {RuleInterface} def A rule definition (string selector or Selector object).
         *  @returns     {string} The serialised selector / @-rule prelude.
         *  @description Serialise a definition's selector across all 11 @-rules. The And/Or/Not walker is a
         *               local closure that produces valid CSS: features join with ` and `, Or emits a comma,
         *               Not prefixes `not (…)` — so `@media screen and (min-height: 600px), (min-width: 600px)
         *               and (max-width: 800px)` is well-formed. @supports takes every key but Type as a
         *               condition. Mirrors the legacy Css.GetSelector; GetText composes it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetSelector(def: RuleInterface): string
        {
            const sel = def.Selector;
            if (!sel)                    return '';
            if (typeof sel === 'string') return sel;

            const s    = sel as SelectorInterface;
            const type = s.Type.toLowerCase().trim();

            const cond = (obj: Record<string, unknown>): string =>
            {
                const parts: Array<{ c: 'and' | 'or' | 'not' | null; t: string }> = [];
                for (const [k, v] of Object.entries(obj))
                {
                    const lk = k.toLowerCase();
                    if      (lk === 'and') parts.push({ c: 'and', t: cond(v as Record<string, unknown>) });
                    else if (lk === 'or')  parts.push({ c: 'or',  t: cond(v as Record<string, unknown>) });
                    else if (lk === 'not') parts.push({ c: 'not', t: cond(v as Record<string, unknown>) });
                    else                   parts.push({ c: null,  t: `(${Core.Text.toKebab(k).toLowerCase()}: ${v})` });
                }
                let out = '';
                parts.forEach((p, i) =>
                {
                    if      (i === 0)       out += p.c === 'not' ? `not ${p.t}` : p.t;
                    else if (p.c === 'or')  out += `, ${p.t}`;
                    else if (p.c === 'not') out += ` and not ${p.t}`;
                    else                    out += ` and ${p.t}`;
                });
                return out;
            };

            if (type === '@charset')   return `@charset "${(s.Value ?? 'UTF-8').replace(/["']/g, '')}"`;
            if (type === '@namespace') return `@namespace ${s.Prefix ? `${s.Prefix} ` : ''}${s.Url ?? ''}`;

            if (type === '@import')
            {
                const media = s.Media ? ` ${s.Media}` : '';
                return `@import ${s.Url ?? ''}${media}${s.And ? ` and ${cond(s.And as Record<string, unknown>)}` : ''}`;
            }

            if (type === '@media')
            {
                const media = s.Media ? ` ${s.Media}` : '';
                return `@media${media}${s.And ? ` and ${cond(s.And as Record<string, unknown>)}` : ''}`;
            }

            if (type === '@supports')
            {
                const c = Object.fromEntries(Object.entries(s).filter(([k]) => k.toLowerCase() !== 'type'));
                return `@supports ${cond(c)}`;
            }

            if (type === '@document')
            {
                const conditions: string[] = [];
                if (s.Url)    conditions.push(`url("${s.Url}")`);
                if (s.Prefix) conditions.push(`url-prefix("${s.Prefix}")`);
                if (s.Domain) conditions.push(`domain("${s.Domain}")`);
                if (s.Regex)  conditions.push(`regexp("${s.Regex}")`);
                return `@document ${conditions.join(', ')}`;
            }

            if (type === '@page')
                return `@page${s.Name ? ` ${s.Name}` : ''}${s.Right ? ' :right' : ''}${s.Left ? ' :left' : ''}`;

            if (type === '@keyframes')     return `@keyframes ${s.Name ?? ''}`;
            if (type === '@counter-style') return `@counter-style ${s.Name ?? ''}`;
            if (type === '@font-face')     return '@font-face';
            if (type === '@viewport')      return '@viewport';

            return s.Type;
        }

        /** @name        GetType
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {RuleInterface} def A rule definition.
         *  @returns     {string} The @-rule keyword (e.g. '@media'), or '' for a plain style rule.
         *  @description Extract the @-rule type. From a string selector, the leading `@word`; from a Selector
         *               object, its `Type`. Mirrors the legacy Css.GetType; GetText branches on it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetType(def: RuleInterface): string
        {
            const sel = def.Selector;
            if (!sel) return '';
            if (typeof sel === 'string')
            {
                const m = /^(@[\w-]+)/.exec(sel.trim());
                return m?.[1] ?? '';
            }
            return (sel as SelectorInterface).Type ?? '';
        }

        /** @name        GetContents
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {RuleInterface} def A rule definition.
         *  @returns     {Record<string, unknown>} The body object (properties, or frames/margin-boxes for @-rules).
         *  @description Resolve a definition's body from the four interchangeable names (Contents ?? Content ??
         *               Body ?? Rule). A string body is parsed inline into a camelCased property map; an object
         *               body is returned as-is. Mirrors the legacy Css.GetContents; GetText composes it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetContents(def: RuleInterface): Record<string, unknown>
        {
            const body = def.Contents ?? def.Content ?? def.Body ?? def.Rule ?? {};

            if (typeof body !== 'string')
            {
                const out: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(body as Record<string, unknown>))
                    out[Core.Text.toCamel(k)] = v;
                return out;
            }

            const props: Record<string, string> = {};
            body.split(';').forEach(decl => {
                const colon = decl.indexOf(':');
                if (colon < 0) return;
                const key = Core.Text.toCamel(decl.slice(0, colon).trim());
                const val = decl.slice(colon + 1).trim().replace(/;$/, '');
                if (key && val) props[key] = val;
            });
            return props;
        }

        /** @name        GetText
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {RuleInterface | Record<string, unknown>} def A rule definition, a flat
         *               property bag, or a selector→properties map.
         *  @param       {string} [selector] When given, `def` is treated as a bare property bag wrapped at
         *               this selector — `GetText(props, '.btn')`.
         *  @returns     {string} The complete CSS text.
         *  @description Serialise to CSS by COMPOSING the sibling statics (legacy Css.GetText: selector + "{"
         *               + contents + "}"): selector from GetSelector, body from GetContents, type from
         *               GetType, declarations via Serialize. Handles every construction format. A bare object
         *               carrying neither a Selector nor a body key is classified by #CheckSyntax: all-primitive
         *               values wrap at ':host' (or at the `selector` argument), anything else is a
         *               selector→properties map and emits one rule per key. @charset / @namespace end at `;`.
         *               @keyframes renders its frames, taking the animation name from the Selector object's
         *               Name when there is one and from the selector string otherwise. @page renders
         *               declarations plus margin-box pseudo-elements (TopLeftCorner → @top-left-corner). A
         *               grouping @-rule carrying a `Rules` map (@media / @supports / @document) recurses into
         *               every child and nests it one level in, so an entire tree serialises through this one
         *               static and the instance never has to assemble CSS by hand; a `Rules` map wins over a
         *               declaration body if a definition carries both. Everything else is
         *               `selector { declarations }`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetText
        (
            def       : RuleInterface | Record<string, unknown>,
            selector? : string,
        ): string
        {
            if (selector !== undefined)
            {
                return Rule.GetText
                (
                    {
                        Selector : selector,
                        Content  : def,
                    } as RuleInterface,
                );
            }

            if (typeof def === 'object' && def && !Rule.#CheckSyntax(def as Record<string, unknown>))
            {
                const entries = Object.entries(def);

                let flat = entries.length > 0;

                for (const [, value] of entries)
                {
                    if (typeof value === 'object' && value !== null)
                    {
                        flat = false;

                        break;
                    }
                }

                if (flat)
                {
                    return Rule.GetText
                    (
                        {
                            Selector : ':host',
                            Content  : def,
                        } as RuleInterface,
                    );
                }

                const mapped : string[] = [];

                for (const [key, properties] of entries)
                {
                    const text = Rule.GetText
                    (
                        {
                            Selector : key,
                            Content  : properties,
                        } as RuleInterface,
                    );

                    mapped.push(text);
                }

                return mapped.join('\n');
            }

            const d            = def as RuleInterface;
            const type         = Rule.GetType(d).toLowerCase();
            const selectorText = Rule.GetSelector(d);
            const contents     = Rule.GetContents(d);

            const norm = (raw: unknown): Record<string, string> =>
            {
                const out : Record<string, string> = {};

                if (!raw || typeof raw !== 'object')
                {
                    return out;
                }

                for (const [key, value] of Object.entries(raw as Record<string, unknown>))
                {
                    out[Core.Text.toCamel(key)] = String(value).trim();
                }

                return out;
            };

            if (type === '@charset' || type === '@namespace')
            {
                return `${selectorText};`;
            }

            if (type === '@keyframes')
            {
                const source = d.Selector;

                let name = '';

                if (typeof source === 'object' && source)
                {
                    name = (source as SelectorInterface).Name ?? '';
                }

                if (!name)
                {
                    name = selectorText.replace('@keyframes', '').trim();
                }

                const frames : string[] = [];

                for (const [key, value] of Object.entries(contents))
                {
                    const lower = key.toLowerCase();

                    let position : string;
                    let style    : Record<string, string>;

                    if (lower === 'from' || lower === 'to')
                    {
                        position = lower;
                        style    = norm(value);
                    }
                    else
                    {
                        const frame = value as { Position?: string; Style?: unknown };

                        position = frame.Position ?? key;
                        style    = frame.Style ? norm(frame.Style) : {};
                    }

                    const declarations = Rule.Serialize(style);

                    if (declarations)
                    {
                        frames.push(`  ${position} { ${declarations}; }`);
                    }
                    else
                    {
                        frames.push(`  ${position} {  }`);
                    }
                }

                return `@keyframes ${name} {\n${frames.join('\n')}\n}`;
            }

            if (type === '@page')
            {
                const main   : Record<string, string> = {};
                const boxes  : string[]               = [];

                for (const [key, value] of Object.entries(contents))
                {
                    if (!Rule.Margins?.has(key))
                    {
                        main[Core.Text.toCamel(key)] = String(value).trim();

                        continue;
                    }

                    const box          = Core.Text.toKebab(key).toLowerCase();
                    const declarations = Rule.Serialize(norm(value));

                    if (declarations)
                    {
                        boxes.push(`  @${box} { ${declarations}; }`);
                    }
                    else
                    {
                        boxes.push(`  @${box} {  }`);
                    }
                }

                const declarations = Rule.Serialize(main);
                const lines : string[] = [];

                if (declarations)
                {
                    lines.push(`  ${declarations};`);
                }

                lines.push(...boxes);

                return `${selectorText} {\n${lines.join('\n')}\n}`;
            }

            if (d.Rules)
            {
                const indent : string   = '  ';
                const nested : string[] = [];

                if (Array.isArray(d.Rules))
                {
                    for (const child of d.Rules)
                    {
                        const raw  = Rule.GetText(child);
                        const text = raw.replace(/\n/g, '\n' + indent);

                        nested.push(indent + text);
                    }
                }
                else
                {
                    for (const [key, value] of Object.entries(d.Rules))
                    {
                        let raw : string;

                        if (Rule.#CheckSyntax(value as unknown as Record<string, unknown>))
                        {
                            raw = Rule.GetText(value);
                        }
                        else
                        {
                            raw = Rule.GetText(value, key);
                        }

                        const text = raw.replace(/\n/g, '\n' + indent);

                        nested.push(indent + text);
                    }
                }

                const body = nested.join('\n');

                return `${selectorText} {\n${body}\n}`;
            }

            const declarations = Rule.Serialize(contents as Record<string, string>);

            if (!declarations)
            {
                return `${selectorText} {  }`;
            }

            return `${selectorText} { ${declarations}; }`;
        }

        /** @name        GetObject
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {string} cssText A CSS text string.
         *  @returns     {Record<string, unknown>} An object keyed by selector, contents as nested objects.
         *  @description The inverse of GetText: parse CSS text into a structured object. Mounts the text in a
         *               throwaway `<style>` and walks the live CSSOM, handling CSSStyleRule, CSSKeyframesRule,
         *               CSSMediaRule, CSSSupportsRule (recursively), CSSFontFaceRule, CSSImportRule,
         *               CSSNamespaceRule and CSSPageRule; anything else falls back to a regex split. Keys are
         *               camelCased. Mirrors the legacy Css.GetObject.
         *  @example     Rule.GetObject('@media screen { .btn { color: red } }')
         *               // { '@media screen': { '.btn': { color: 'red' } } }
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetObject(cssText: string): Record<string, unknown>
        {
            if (!cssText?.trim()) return {};

            const parse = (text: string): Record<string, string> =>
            {
                const props: Record<string, string> = {};
                text.split(';').forEach(decl => {
                    const colon = decl.indexOf(':');
                    if (colon < 0) return;
                    const key = Core.Text.toCamel(decl.slice(0, colon).trim());
                    const val = decl.slice(colon + 1).trim().replace(/;$/, '');
                    if (key && val) props[key] = val;
                });
                return props;
            };

            const collect = (style: { length: number; [i: number]: string; getPropertyValue(p: string): string }): Record<string, string> =>
            {
                const d: Record<string, string> = {};
                for (let i = 0; i < style.length; i++)
                {
                    const p = style[i] ?? '';
                    if (p) d[Core.Text.toCamel(p)] = style.getPropertyValue(p).trim();
                }
                return d;
            };

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
                        result[rule.selectorText] = collect(rule.style);
                    } else if (rule instanceof CSSKeyframesRule)
                    {
                        const frames: Record<string, unknown> = {};
                        Array.from(rule.cssRules).forEach(fr => {
                            const kf = fr as CSSKeyframeRule;
                            frames[kf.keyText] = collect(kf.style);
                        });
                        result[`@keyframes ${rule.name}`] = frames;
                    } else if (rule instanceof CSSMediaRule)
                    {
                        const inner: Record<string, unknown> = {};
                        Array.from(rule.cssRules).forEach(r => {
                            if (r instanceof CSSStyleRule) inner[r.selectorText] = collect(r.style);
                        });
                        const mediaKey = rule.conditionText
                            ? `@media ${rule.conditionText}`
                            : (rule.cssText.split('{')[0] ?? '').trim();
                        result[mediaKey] = inner;
                    } else if (rule instanceof CSSSupportsRule)
                    {
                        const inner: Record<string, unknown> = {};
                        Array.from(rule.cssRules).forEach(r => { Object.assign(inner, Rule.GetObject(r.cssText)); });
                        result[`@supports ${rule.conditionText}`] = inner;
                    } else if (rule instanceof CSSFontFaceRule)
                    {
                        result['@font-face'] = collect(rule.style);
                    } else if (rule instanceof CSSImportRule)
                    {
                        result[`@import ${rule.href}`] = { href: rule.href, media: rule.media?.mediaText ?? '' };
                    } else if (rule instanceof CSSNamespaceRule)
                    {
                        result['@namespace'] = { prefix: rule.prefix, namespaceURI: rule.namespaceURI };
                    } else if (rule instanceof CSSPageRule)
                    {
                        result[`@page ${rule.selectorText}`.trim()] = collect(rule.style);
                    } else
                    {
                        const m = /^([^{]+)\{([\s\S]*)\}/.exec(rule.cssText);
                        if (m)
                        {
                            const key = m[1]?.trim();
                            const val = m[2];
                            if (key && val !== undefined) result[key] = parse(val);
                        }
                    }
                }
            } finally
            {
                document.head.removeChild(style);
            }

            return result;
        }

        /** @name        css
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {string} selector A selector string (positional form).
         *  @param       {Record<string, string> | string} contents The body — a property object or CSS string.
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [target] Injection target.
         *  @param       {number} [index] Insertion index within a sheet target.
         *  @returns     {Rule} The created, injected Rule.
         *  @description Create-and-inject in one call, positional form: builds `new Rule(selector, contents)` and
         *               appends it to `target`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static css(selector: string, contents: Record<string, string> | string, target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
        /** @name        css
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {RuleInterface} definition A full rule definition (object form).
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [target] Injection target.
         *  @param       {number} [index] Insertion index within a sheet target.
         *  @returns     {Rule} The created, injected Rule.
         *  @description Create-and-inject in one call, object form: builds `new Rule(definition)` and appends it
         *               to `target`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static css(definition: RuleInterface,                          target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
        /** @name        css
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {string | RuleInterface} arg0 The selector (positional form) or the full rule
         *               definition (object form) — discriminated at runtime by `typeof arg0 === 'string'`.
         *  @param       {Record<string, string> | string | 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [arg1] The body when positional; otherwise the target.
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null | number} [arg2] The target when positional; otherwise the index.
         *  @param       {number} [arg3] The insertion index when positional.
         *  @returns     {Rule} The created Rule, already appended to its target.
         *  @description The create-and-inject shorthand: builds a Rule from either input form and appends it in
         *               one call. The two documented overloads collapse here — a string `arg0` is the positional
         *               `(selector, contents, target?, index?)`, anything else the object `(definition, target?,
         *               index?)`; the trailing arguments shift accordingly. When no explicit target is given and
         *               a master Sheet is set globally (`Rule.Sheet`), that master is used as the target, so a
         *               bare `Rule.css(...)` lands in the shared sheet. Returns the appended Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static css(
            arg0  : string | RuleInterface,
            arg1? : Record<string, string> | string | 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null,
            arg2? : 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null | number,
            arg3? : number,
        ): Rule
        {
            let rule: Rule;
            let target: Parameters<Rule['append']>[0] = undefined;
            let index : number | undefined           = undefined;

            if (typeof arg0 === 'string')
            {
                rule   = new Rule(arg0, arg1 as Record<string, string> | string);
                target = arg2 as typeof target;
                index  = arg3;
            }
            else
            {
                rule   = new Rule(arg0);
                target = arg1 as typeof target;
                index  = arg2 as number | undefined;
            }

            if ((target === undefined || target === null) && Rule.#masterSheet)
                target = Rule.#masterSheet as unknown as typeof target;

            return rule.append(target, index);
        }

        /** @name        Append
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {string} selector A selector string (positional form).
         *  @param       {Record<string, string> | string} contents The body — a property object or CSS string.
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [target] Injection target.
         *  @param       {number} [index] Insertion index within a sheet target.
         *  @returns     {Rule} The created, injected Rule.
         *  @description Alias for `Rule.css(...)`, positional form — mirrors `new Css(...)` more literally.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Append(selector: string, contents: Record<string, string> | string, target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
        /** @name        Append
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {RuleInterface} definition A full rule definition (object form).
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [target] Injection target.
         *  @param       {number} [index] Insertion index within a sheet target.
         *  @returns     {Rule} The created, injected Rule.
         *  @description Alias for `Rule.css(...)`, object form — mirrors `new Css(...)` more literally.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Append(definition: RuleInterface,                          target?: 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null, index?: number): Rule;
        /** @name        Append
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {string | RuleInterface} arg0 The selector (positional form) or the full rule
         *               definition (object form) — discriminated at runtime by `typeof arg0 === 'string'`.
         *  @param       {Record<string, string> | string | 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null} [arg1] The body when positional; otherwise the target.
         *  @param       {'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null | number} [arg2] The target when positional; otherwise the index.
         *  @param       {number} [arg3] The insertion index when positional.
         *  @returns     {Rule} The created Rule, already appended to its target.
         *  @description Alias for `Rule.css(...)`, mirroring `new Css(...)` more literally. Forwards verbatim to
         *               `Rule.css`: a string `arg0` takes the positional `(selector, contents, target?, index?)`
         *               path, anything else the object `(definition, target?, index?)` path, with the trailing
         *               arguments shifted accordingly. Carries no logic of its own — the master-Sheet fallback
         *               and injection all happen inside `Rule.css`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Append(
            arg0  : string | RuleInterface,
            arg1? : Record<string, string> | string | 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null,
            arg2? : 'style' | 'file' | object | Element | ShadowRoot | CSSStyleSheet | HTMLLinkElement | null | number,
            arg3? : number,
        ): Rule
        {
            return (typeof arg0 === 'string')
                ? Rule.css(arg0, arg1 as Record<string, string> | string, arg2 as Parameters<Rule['append']>[0], arg3)
                : Rule.css(arg0, arg1 as Parameters<Rule['append']>[0], arg2 as number | undefined);
        }

        /* ── Rule Static Properties ────*/

        /** @name        Type
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Rule
         *  @type        {'Rule'}
         *  @description The class tag: which of the two css classes this value is. A STRING, deliberately —
         *               a tag is compared by value, so it keeps working across two copies of this module,
         *               where `instanceof` and any comparison against the class object itself both fail
         *               because they compare identity. It also survives JSON, a worker boundary and SSR.
         *               An instance getter rather than a static so it reads straight off the value, with no
         *               hop through `constructor`, which a caller can reassign. The literal return type is
         *               what lets `value.Type === 'Rule'` narrow the union at compile time instead of
         *               forcing a cast. Not to be confused with `RuleType`, which names the @-rule this
         *               particular Rule declares (`'@media'`, `'@keyframes'`, `''`); this one names the
         *               class, that one names the rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Type(): 'Rule'
        {
            return 'Rule';
        }

        /** @name        Sheet
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @returns     {Stylesheet | null} The shared master Stylesheet, or null before one is set.
         *  @description Static accessor for the master Stylesheet — the default injection target of `Rule.css` /
         *               `Rule.Append` when no explicit target is given. Reads the private `#masterSheet`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Sheet(): Stylesheet | null { return Rule.#masterSheet; }

        /** @name        Sheet
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @param       {Stylesheet | null} s The Stylesheet to adopt as the shared master, or null to clear it.
         *  @description Static mutator for the master Stylesheet — sets the default injection target used by
         *               `Rule.css` / `Rule.Append`. Writes the private `#masterSheet`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static set Sheet(s: Stylesheet | null) { Rule.#masterSheet = s; }

        /** @name        Margins
         *  @public
         *  @static
         *  @memberof    Core.Css.Rule
         *  @returns     {Set<string> | null} The set of recognised `@page` margin-box names.
         *  @description Static accessor for the `@page` margin-box vocabulary — the sixteen margin-box at-rules
         *               (`@top-left`, `@bottom-center`, `@left-middle`, …) whose keys, inside a `@page` body, are
         *               kept as nested boxes rather than declarations. Reads the private `#margins`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Margins(): Set<string> | null { return Rule.#margins; }
    }

    /** @name        Stylesheet
     *  @public
     *  @class
     *  @memberof    Core.Css
     *  @description An ordered collection of Rules backed by a live stylesheet — the sheet-level counterpart of
     *               Rule. Wraps every construction form (another Stylesheet, a native CSSStyleSheet /
     *               CSSRuleList, an HTMLLinkElement, an array of Rule or CSSRule, a single Rule, a
     *               StylesheetObjectInterface, or a raw CSS / URL string) and normalises it through the `parse`
     *               instance: the constructor only injects. Holds its Rules in order (`#rules`), owning a real
     *               `<style>` / `<link>` and its CSSStyleSheet (`#sheet`), and mirrors mutations into the CSSOM
     *               through `#flush`. Mutations (add / remove / insert / replace) emit `'Sheet-Changed'` events;
     *               a URL source loads asynchronously, tracking `#loaded` / `#loading` / `#state`. Static `Parse`
     *               builds a fresh Stylesheet from any input (with an optional `mode`); `Sheets` / `Links` /
     *               `Paths` enumerate the document's live stylesheets.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class     Stylesheet
    {
        /** @member      #head
         *  @private
         *  @type        {HTMLHeadElement | HTMLElement}
         *  @memberof    Core.Css.Stylesheet
         *  @description The mount point for the sheet's `<style>` / `<link>` — the document `<head>`, or the
         *               documentElement as a fallback when no head exists. Resolved once at construction.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #head    : HTMLHeadElement | HTMLElement;

        /** @member      #link
         *  @private
         *  @type        {HTMLLinkElement | null}
         *  @memberof    Core.Css.Stylesheet
         *  @description The backing `<link rel="stylesheet">` when the sheet is sourced from a URL / file, or
         *               null for an inline (`<style>`) sheet. Its `href` carries the loaded stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #link    : HTMLLinkElement | null         = null;

        /** @member      #sheet
         *  @private
         *  @type        {CSSStyleSheet | null}
         *  @memberof    Core.Css.Stylesheet
         *  @description The live CSSStyleSheet this Stylesheet mirrors into — the CSSOM object whose `cssRules`
         *               `#flush` rewrites. Null until the sheet is mounted / adopted.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #sheet   : CSSStyleSheet  | null          = null;

        /** @member      #rules
         *  @private
         *  @type        {Rule[]}
         *  @memberof    Core.Css.Stylesheet
         *  @description The ordered Rules the Stylesheet owns — the single source of truth, flushed to the CSSOM
         *               in order. Populated by `parse`, mutated by add / remove / insert / replace.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #rules   : Rule[]                         = [];

        /** @member      #loaded
         *  @private
         *  @type        {boolean}
         *  @memberof    Core.Css.Stylesheet
         *  @description Whether a URL-sourced sheet has finished loading — false until the `<link>` resolves,
         *               true once its rules are available. Always immediate for inline sheets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #loaded  : boolean                        = false;

        /** @member      #loading
         *  @private
         *  @type        {boolean}
         *  @memberof    Core.Css.Stylesheet
         *  @description Whether a URL-sourced sheet is currently loading — true while the `<link>` is in flight,
         *               cleared once it settles (resolved or failed).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #loading : boolean                        = true;

        /** @member      #state
         *  @private
         *  @type        {string}
         *  @memberof    Core.Css.Stylesheet
         *  @description The sheet's lifecycle state — `'Loading'` while a URL source is in flight, advancing to
         *               its loaded / ready state once settled. Mirrors `#loaded` / `#loading` as a label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #state   : string                         = 'Loading';

        /** @member      #index
         *  @private
         *  @type        {number}
         *  @memberof    Core.Css.Stylesheet
         *  @description The sheet's position among the document's stylesheets, or -1 when unmounted / untracked.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #index   : number                         = -1;

        /** @member      #name
         *  @private
         *  @type        {string}
         *  @memberof    Core.Css.Stylesheet
         *  @description An optional identifying name for the sheet, empty by default — used to label / look up
         *               the stylesheet when set.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #name    : string                         = '';

        /** @member      #live
         *  @private
         *  @memberof    Core.Css.Stylesheet
         *  @type        {string[]}
         *  @description Mirror of the CSS text currently live in `#sheet`, one entry per native rule, in order.
         *               `#flush` diffs against THIS, never against `cssRules[i].cssText` — the browser returns
         *               that normalised, so it would never match our serialisation and every flush would
         *               degrade to a full rebuild. Seeded from `cssText` when an existing sheet is adopted.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #live    : string[]                       = [];


        /** @name        constructor
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...StylesheetArguments} args Zero, one, or many source values. Zero → an empty
         *               sheet; one → that value in any accepted form; many → the Rule arguments among them,
         *               collected into a Rule array.
         *  @description Build a Stylesheet from any of its input forms, then mount it live. The variadic args
         *               are reduced to a single `input` (none / the lone arg / the Rule subset of several), which
         *               `parse` and the branch cascade normalise into `#rules` — the constructor itself only
         *               resolves the mount and flushes. A string is a URL (loaded async via `#load`) or CSS text
         *               (parsed); an object is adopted by kind — a Stylesheet clones its rules, a CSSStyleSheet /
         *               HTMLLinkElement is adopted in place, a CSSRuleList / array / single Rule is wrapped, and
         *               the cross-module cases (a foreign Stylesheet or Rule whose `instanceof` fails under
         *               bundle duplication) are adopted STRUCTURALLY through the public `.Rules` iterable or
         *               `.Selector` + `.Properties`, falling back to serialized `.Text` — never through the
         *               enumerable-key path, which reads nothing off a foreign instance's private fields. After
         *               normalisation it ensures a backing `<link>` (a blank Blob URL if none) and a `<style>`
         *               sheet, flushes any rules into the CSSOM, and marks itself Loaded (`#loaded` / `#loading`
         *               / `#state`), recording its `#index` among the document's stylesheets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(...args: StylesheetArguments[])
        {
            this.#head = document.head ?? document.documentElement;

            const input: StylesheetArguments | undefined =
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
                        this.#load(input.trim());
                    } else {
                        this.parse(input);
                    }
                } else if (typeof input === 'object') {
                    // Adopt a rule-like value into a LOCAL Rule (cross-module-safe): a same-module
                    // Rule is used as-is; a foreign Rule (instanceof fails under bundle duplication)
                    // is rebuilt from its public Selector + Properties; a CSSRule is wrapped.
                    const adopt = (r: unknown): Rule =>
                    {
                        if (r instanceof Rule) return r;
                        const sel = (r as { Selector?: unknown }).Selector;
                        if (typeof sel === 'string')
                            return new Rule(sel, (r as { Properties?: Record<string, string> }).Properties ?? ({} as Record<string, string>));
                        return new Rule(r as CSSRule);
                    };
                    if (input instanceof Stylesheet)
                    {
                        this.#adopt(input.Sheet);
                        this.#rules = input.#rules.map(r => r.clone());
                    } else if (input instanceof CSSStyleSheet)
                    {
                        this.#adopt(input);
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
                        this.#rules = input.map(r => adopt(r));
                    } else if (typeof (input as { Rules?: unknown }).Rules === 'object'
                        && (input as { Rules?: unknown }).Rules !== null
                        && typeof ((input as { Rules?: { [Symbol.iterator]?: unknown } }).Rules)![Symbol.iterator] === 'function')
                    {
                        // Foreign Stylesheet (instanceof fails under bundle duplication):
                        // adopt its rules STRUCTURALLY through the public iterable .Rules.
                        // This preserves each rule's :host selector, which the .Text /
                        // #parseText fallback below would DROP when re-parsed inside a
                        // non-shadow <style> (the browser discards :host there).
                        this.#rules = [...(input as unknown as { Rules: Iterable<unknown> }).Rules].map(r => adopt(r));
                    } else if (typeof (input as { Selector?: unknown }).Selector === 'string'
                        && (input as { Properties?: unknown }).Properties !== null
                        && typeof (input as { Properties?: unknown }).Properties === 'object')
                    {
                        // Foreign Rule (instanceof fails): duck-typed by a string .Selector
                        // plus an object .Properties. Adopt it structurally via adopt()
                        // (which rebuilds `new Rule(.Selector, .Properties)`) rather than the
                        // .Text/#parseText fallback — same :host-dropping reason as above.
                        this.#rules = [adopt(input)];
                    } else if (typeof (input as unknown as { Text?: unknown }).Text === 'string'
                        && (input as unknown as { Text: string }).Text.trim())
                    {
                        // Last resort: a cross-module object that exposes only a serialized
                        // public `.Text` (neither iterable .Rules nor .Selector/.Properties).
                        // Parse that instead of falling through to #parseObject, which would
                        // read ZERO enumerable keys off a foreign instance (private fields)
                        // and yield an empty stylesheet → no styles.
                        this.parse((input as unknown as { Text: string }).Text);
                    } else
                    {
                        this.parse(input as StylesheetObjectInterface);
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

            if (this.#rules.length) this.#flush();

            this.#loaded  = true;
            this.#loading = false;
            this.#state   = 'Loaded';
            this.#index   = Array.from(document.styleSheets).indexOf(this.#sheet!);
        }


        /** @name        #adopt
         *  @private
         *  @memberof    Core.Css.Stylesheet
         *  @param       {CSSStyleSheet | null} sheet The native stylesheet to mirror into, or null.
         *  @returns     {void}
         *  @description Bind this Stylesheet to a native CSSStyleSheet and seed `#live` from what that sheet
         *               already holds, so the first `#flush` diffs against the real content instead of an
         *               empty mirror. Seeding matters: with an empty `#live` over a non-empty sheet the walk
         *               inserts the desired rules without ever evicting the ones that were already there, and
         *               the tail trim cannot reach them either — they would stay in the sheet forever. The
         *               seed comes from `cssText`, which the browser returns normalised, so the first flush
         *               after adopting rewrites once and every flush after that is stable. The only place
         *               `#sheet` and `#live` are assigned together, which is the point: they are one state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #adopt(sheet: CSSStyleSheet | null): void
        {
            this.#sheet = sheet;

            if (!sheet)
            {
                this.#live = [];

                return;
            }

            const live : string[] = [];

            for (const rule of Array.from(sheet.cssRules))
            {
                live.push(rule.cssText);
            }

            this.#live = live;
        }

        /** @name        #load
         *  @private
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} url The stylesheet URL to fetch.
         *  @returns     {void}
         *  @description Load an external stylesheet asynchronously. Sets the loading state, fetches the URL as
         *               text, and on success parses it, marks the sheet Loaded (`#loaded` / `#loading` /
         *               `#state`), flushes into the CSSOM and fires `'Sheet-Loaded'`; on failure sets `#state`
         *               to `'Error'` and fires `'Sheet-Error'`. The CSSOM-mode arm of a URL-sourced sheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #load(url: string): void
        {
            this.#loading = true;
            this.#loaded  = false;
            this.#state   = 'Loading';

            fetch(url)
                .then(r => r.text())
                .then(text => {
                    this.#rules   = Stylesheet.ToArray(text);
                    this.#loaded  = true;
                    this.#loading = false;
                    this.#state   = 'Loaded';
                    this.#flush();
                    this.fire('Sheet-Loaded', { url });
                })
                .catch(err => {
                    this.#state   = 'Error';
                    this.#loading = false;
                    this.fire('Sheet-Error', { url, error: err });
                });
        }

        /** @name        #flush
         *  @private
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {void}
         *  @description Mirror `#rules` into the live CSSStyleSheet by DELTA, not by rebuild. Serialises the
         *               desired list once (Rule.Text is memoised, so unchanged rules cost nothing), dropping
         *               the ones the browser would reject — empty text, and style rules with no selector (a
         *               bare `{ … }`) — while keeping the @-rules, which legitimately have none. Then walks
         *               desired against `#live` in lock-step and writes ONLY where they differ: an unchanged
         *               flush performs zero CSSOM operations, which is the whole point — this is called after
         *               every mutation, and the old rebuild made N mutations cost N full sheet rewrites.
         *               A single insertion or removal in the middle is detected by one lookahead and costs one
         *               operation instead of rewriting the tail. Leftovers are trimmed from the end downwards
         *               so removing one never shifts the index of the next. The write cursor `w` is tracked
         *               separately from the desired index because a rule the browser rejects must not shift
         *               everything after it into an IndexSizeError cascade.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #flush(): void
        {
            const sheet = this.#sheet;

            if (!sheet)
            {
                return;
            }

            const desired : string[] = [];

            for (const rule of this.#rules)
            {
                const text = rule.Text;

                if (!text || !text.trim())
                {
                    continue;
                }

                const selector = (rule.Selector ?? '').trim();

                if (!selector && !text.trim().startsWith('@'))
                {
                    continue;
                }

                desired.push(text);
            }

            const live = this.#live;

            let w = 0;

            for (let i = 0; i < desired.length; i++)
            {
                const want = desired[i];

                if (live[w] === want)
                {
                    w++;

                    continue;
                }

                if (live[w] !== undefined && live[w + 1] === want)
                {
                    sheet.deleteRule(w);
                    live.splice(w, 1);

                    i--;

                    continue;
                }

                const inserting = live[w] !== undefined && desired[i + 1] === live[w];

                try
                {
                    if (!inserting && w < live.length)
                    {
                        sheet.deleteRule(w);
                        live.splice(w, 1);
                    }

                    sheet.insertRule(want, w);
                    live.splice(w, 0, want);

                    w++;
                }
                catch (error)
                {
                    console.warn(`Sheet: could not insert rule "${want.slice(0, 60)}":`, error);
                }
            }

            for (let i = live.length - 1; i >= w; i--)
            {
                sheet.deleteRule(i);
                live.splice(i, 1);
            }
        }

        /** @name        Type
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @type        {'Stylesheet'}
         *  @description The class tag: which of the two css classes this value is. The counterpart of the
         *               same accessor on Rule, and the reason both exist — a consumer that receives an
         *               unknown css value asks one question and gets a string back, instead of duck-typing
         *               a `.Selector` or an iterable `.Rules` to guess. Compared by value, so it holds
         *               across two copies of this module, where `instanceof` fails on identity. The literal
         *               return type makes the pair a discriminated union: `value.Type === 'Stylesheet'`
         *               narrows without a cast.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Type(): 'Stylesheet'
        {
            return 'Stylesheet';
        }

        /** @name        Sheets
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {Stylesheet[]} One Stylesheet wrapping each of the document's live stylesheets.
         *  @description Enumerate every stylesheet in the document, each wrapped in a Stylesheet — the sheet-level
         *               view over `document.styleSheets`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Sheets(): Stylesheet[]
        {
            return Array.from(document.styleSheets).map(s => new Stylesheet(s));
        }

        /** @name        Links
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {HTMLLinkElement[]} Every `<link rel="stylesheet">` element in the document.
         *  @description Collect the document's stylesheet `<link>` elements — the DOM nodes behind externally
         *               linked stylesheets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Links(): HTMLLinkElement[]
        {
            return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
        }

        /** @name        Paths
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {string[]} The non-empty `href` of each stylesheet `<link>` in the document.
         *  @description List the URLs of the document's linked stylesheets — the `href` of each `<link>` from
         *               `Links`, empties filtered out.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Paths(): string[]
        {
            return Stylesheet.Links.map(l => l.href).filter(Boolean);
        }

        /** @name        toString
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {string} The full serialised CSS text of every rule in the sheet.
         *  @description Serialise the whole Stylesheet to CSS — the concatenated `Text` of all its Rules.
         *               Delegates to the `Text` getter, so a Stylesheet stringifies to its own CSS.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static ToString(source: StylesheetArguments | Rule[]): string
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

        /** @name        Parse
         *  @public
         *  @static
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} text A raw CSS string to parse into a new Stylesheet.
         *  @returns     {Stylesheet} A fresh Stylesheet built from the CSS text.
         *  @description Build a new Stylesheet from a CSS string. Delegates to `new Stylesheet(text)`, whose
         *               `parse` turns the text into Rules.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Parse(text: string): Stylesheet;
        /** @name        Parse
         *  @public
         *  @static
         *  @memberof    Core.Css.Stylesheet
         *  @param       {StylesheetObjectInterface} obj A stylesheet object map to build from.
         *  @returns     {Stylesheet} A fresh Stylesheet built from the object map.
         *  @description Build a new Stylesheet from an object map (selector→rule). Delegates to `new
         *               Stylesheet(obj)`, whose `parse` builds one Rule per entry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Parse(obj: StylesheetObjectInterface): Stylesheet;
        /** @name        Parse
         *  @public
         *  @static
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string | StylesheetObjectInterface} argument A CSS string or a stylesheet
         *               object map.
         *  @returns     {Stylesheet} A fresh Stylesheet built from the input.
         *  @description The factory that mirrors `ToArray` but returns a Stylesheet instead of a `Rule[]`: builds
         *               `new Stylesheet(argument)` from either input form, letting the constructor's `parse` do
         *               all the dispatch (string → CSS text, object → selector→rule map). A single, non-cyclic
         *               entry point — it never re-enters `Parse`, since the constructor takes the raw argument
         *               and normalises it through the leaf statics, not through `Parse`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Parse(argument: string | StylesheetObjectInterface): Stylesheet
        {
            return new Stylesheet(argument);
        }

        /** @name        ToArray
         *  @public
         *  @static
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} text CSS text with one or more rules.
         *  @returns     {Rule[]} One Rule per top-level rule parsed from the text.
         *  @description Parse CSS text into a flat Rule array, NOT injected. Uses a throwaway `<style>` only to
         *               borrow the browser's parser: mount, read `cssRules`, wrap each into a Rule, then remove
         *               the node — nothing persists in the DOM. Unlike `Parse` (which returns a whole Stylesheet)
         *               this returns just the Rules.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static ToArray(text: string): Rule[]
        {
            const style = document.createElement('style');
            style.textContent = text;
            document.head.appendChild(style);
            const rules = style.sheet ? Array.from(style.sheet.cssRules).map(r => new Rule(r)) : [];
            document.head.removeChild(style);
            return rules;
        }

        /** @name        Less
         *  @public
         *  @static
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} text Less source to compile.
         *  @returns     {string} The compiled plain CSS.
         *  @description Compile Less source to CSS through the optional Less preprocessor (`parseLess`). Mirrors
         *               Golem's `SheetES5.Less(text)` — the single preprocessor entry point, so Less authored
         *               styles can be fed to a Stylesheet as ordinary CSS.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Less(text: string): string
        {
            return parseLess(text);
        }

        /** @name        Index
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {number} The sheet's position among the document's stylesheets, or -1 when untracked.
         *  @description The Stylesheet's index within `document.styleSheets`, as recorded at mount. Reads the
         *               private `#index`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Index(): number   { return this.#index; }
        /** @name        Length
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {number} The number of Rules in the sheet.
         *  @description The count of Rules the Stylesheet owns — the length of `#rules`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Length(): number  { return this.#rules.length; }

        /** @name        Length
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {number} The number of Rules in the sheet.
         *  @description The count of Rules the Stylesheet owns — the length of `#rules`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Loading(): boolean { return this.#loading; }

        /** @name        Length
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {number} The number of Rules in the sheet.
         *  @description The count of Rules the Stylesheet owns — the length of `#rules`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Loaded(): boolean  { return this.#loaded; }

        /** @name        State
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {string} The sheet's lifecycle label — `'Loading'`, `'Loaded'`, or `'Error'`.
         *  @description The Stylesheet's lifecycle state as a label — `'Loading'` in flight, `'Loaded'` when
         *               ready, `'Error'` on a failed URL load. Reads the private `#state`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get State(): string    { return this.#state; }

        /** @name        State
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {string} The sheet's lifecycle label — `'Loading'`, `'Loaded'`, or `'Error'`.
         *  @description The Stylesheet's lifecycle state as a label — `'Loading'` in flight, `'Loaded'` when
         *               ready, `'Error'` on a failed URL load. Reads the private `#state`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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
                            if (prop) out[Core.Text.toCamel(prop)] = decl.getPropertyValue(prop).trim();
                        }
                    }
                }
            } catch { /* cross-origin — skip */ }
            return out;
        }

        /** @name        State
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {string} The sheet's lifecycle label — `'Loading'`, `'Loaded'`, or `'Error'`.
         *  @description The Stylesheet's lifecycle state as a label — `'Loading'` in flight, `'Loaded'` when
         *               ready, `'Error'` on a failed URL load. Reads the private `#state`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Name(): string { return this.#name; }
        /** @name        Name
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} v The name to assign to the sheet.
         *  @description Mutator for the Stylesheet's optional name. Writes the private `#name`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set Name(v: string) { this.#name = v; }

        /** @name        Text
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {string} The full serialised CSS text of every rule in the sheet.
         *  @description The Stylesheet's whole CSS as text — the `Text` of every Rule joined by newlines. The
         *               sheet-level counterpart of `Rule.Text`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Text(): string { return this.#rules.map(r => r.Text).join('\n'); }
        /** @name        Text
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} v Raw CSS text to replace the sheet's rules with.
         *  @description Replace the Stylesheet's rules from a CSS string — re-parses the text through `parse`,
         *               rebuilding `#rules` and re-flushing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set Text(v: string) { this.parse(v); }

        /** @name        Link
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {HTMLLinkElement | null} The backing `<link>` element, or null for an inline sheet.
         *  @description Accessor for the Stylesheet's backing `<link rel="stylesheet">`. Reads the private
         *               `#link`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Link(): HTMLLinkElement | null { return this.#link; }
        /** @name        Link
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {HTMLLinkElement | null} The backing `<link>` element, or null for an inline sheet.
         *  @description Accessor for the Stylesheet's backing `<link rel="stylesheet">`. Reads the private
         *               `#link`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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

        /** @name        Sheet
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {CSSStyleSheet | null} The live CSSStyleSheet this Stylesheet mirrors into, or null.
         *  @description Accessor for the Stylesheet's live CSSStyleSheet — the CSSOM object `#flush` writes to.
         *               Reads the private `#sheet`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Sheet(): CSSStyleSheet | null { return this.#sheet; }
        /** @name        Sheet
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {CSSStyleSheet | null} v The native stylesheet to adopt.
         *  @description Mutator for the Stylesheet's live CSSStyleSheet — adopts a native CSSStyleSheet and
         *               rebuilds `#rules` by wrapping each of its `cssRules` in a Rule. Non-CSSStyleSheet values
         *               are ignored. Writes the private `#sheet`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set Sheet(v: CSSStyleSheet | null)
        {
            if (v instanceof CSSStyleSheet)
            {
                this.#adopt(v);
                this.#rules = Array.from(v.cssRules).map(r => new Rule(r));
            }
        }

        /** @name        Rules
         *  @public
         *  @readonly
         *  @memberof    Core.Css.Stylesheet
         *  @type        {Rule[]}
         *  @description The Sheet's rules as a plain array. Read and iterate it directly — `sheet.Rules[0]`,
         *               `sheet.Rules.length`, `for (const r of sheet.Rules)`, `.map(...)`. To MUTATE, call the
         *               Sheet's own methods (`sheet.add`, `sheet.insert`, `sheet.remove`, `sheet.clear`, …),
         *               which flush the CSSOM and emit `Sheet-Changed` — no parallel mutation API hangs off the
         *               array. A copy is returned, so mutating it never touches the Sheet by accident.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Rules(): Rule[]
        {
            return [...this.#rules];
        }

        /** @name        Rules
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {Rule[] | CSSRuleList | string} v Replacement rules — a Rule array, a native CSSRuleList,
         *               or a CSS string to parse.
         *  @description Replace the Sheet's rules. A string is parsed; a CSSRuleList is wrapped into Rules; a Rule
         *               array is added as-is. Each add routes through the Sheet, so the CSSOM re-flushes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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

        /** @name        on
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} types Event type(s) to listen for.
         *  @param       {EventListener} handler Listener invoked on a matching event.
         *  @param       {AddEventListenerOptions} [options] Native options plus `phase`/`brokers`.
         *  @returns     {this} For chaining.
         *  @description Subscribe to sheet-level events on `document` (where `#fire` emits) through the
         *               'events' service. Narrow to this instance with `detail.sheet === thisSheet` inside
         *               the handler. Lazy; no subscription if the service is absent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        on
        (
            types: string,
            handler: EventListener,
            options?: AddEventListenerOptions &
                {
                    phase?: 'capture' |
                        'bubble'  |
                        'broker';
                    brokers?: string[]
                }
        ): this
        {
            Core.Services.Events?.On(document, types, handler, options);
            return this;
        }

        /** @name        off
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} types Event type(s) to stop listening for.
         *  @param       {EventListener} handler The exact listener passed to `on`.
         *  @returns     {this} For chaining.
         *  @description Unsubscribe a handler from sheet-level events on `document`. Counterpart of `on`.
         *               Lazy; no-op if the service is absent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        off(types: string, handler: EventListener): this
        {
            Core.Services.Events?.Off(document, types, handler);
            return this;
        }

        /** @name        #fire
         *  @private
         *  @memberof    Core.Css.Stylesheet
         *  @param       {string} type Sheet event type.
         *  @param       {Record<string, unknown>} [detail] Payload; the sheet is added as `sheet`.
         *  @param       {{ Cancelable?: boolean; Propagation?: boolean; Path?: string[]; Broker?: string }} [event] Custom args.
         *  @returns     {void}
         *  @description Emit ONE sheet-level event on `document` via the 'events' service. A Stylesheet is
         *               document-scoped (unlike Rule, which targets its selector's nodes), so the target is
         *               `document` and the originating sheet travels in `Detail.sheet`. Lazy; no-op if absent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        fire
        (
            type: string,
            detail?: Record<string, unknown>,
            event?:
            {
                Cancelable?: boolean;
                Propagation?: boolean;
                Path?: string[];
                Broker?: string
            }
        ): void
        {
            Core.Services.Events?.Fire(document, {
                Type       : type,
                Detail     : { ...(detail ?? {}), sheet: this },
                Cancelable : event?.Cancelable ?? false,
                Propagation: event?.Propagation ?? true,
                ...(event?.Path   ? { Path:   event.Path }   : {}),
                ...(event?.Broker ? { Broker: event.Broker } : {}),
            });
        }

        /* ── CRUD methods ─ */

        /** @name        parse
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {StylesheetArguments} input CSS text, a URL string, a native CSSStyleSheet /
         *               CSSRuleList, a Rule[] , or a Stylesheet / stylesheet object.
         *  @returns     {this} For chaining — the AriannA fluent convention.
         *  @description Populate THIS sheet's rules from any accepted input, then flush to the live CSSOM and
         *               fire `Sheet-Changed`. CSS text goes to `ToArray` (leaf), never the static `Parse` — that
         *               would spin up a second Stylesheet. A URL loads async via `#load`; a native sheet is
         *               adopted (rules wrapped, sheet kept as `#sheet`); a Stylesheet is cloned rule-by-rule. A
         *               plain object is classified inline: an all-primitive map is one `:host` rule (format D),
         *               a map whose entries carry a Selector / Contents / Content / Rule / Body becomes one Rule
         *               per entry, otherwise it is a selector→properties map, one Rule per key (format E).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        parse(input: StylesheetArguments): this
        {
            this.#rules = [];

            if (typeof input === 'string')
            {
                if (/^https?:\/\/|^\/\//.test(input.trim()))
                    this.#load(input.trim());
                else
                    this.#rules = Stylesheet.ToArray(input);
            }
            else if (input instanceof CSSStyleSheet)
            {
                this.#rules = Array.from(input.cssRules).map(r => new Rule(r));
                this.#adopt(input);
            }
            else if (input instanceof CSSRuleList)
            {
                this.#rules = Array.from(input).map(r => new Rule(r));
            }
            else if (Array.isArray(input))
            {
                this.#rules = input.map(r => r instanceof Rule ? r : new Rule(r as CSSRule));
            }
            else if (input instanceof Stylesheet)
            {
                this.#rules = input.#rules.map(r => r.clone());
            }
            else if (typeof input === 'object' && input !== null)
            {
                const obj     = input as StylesheetObjectInterface;
                const entries = Object.entries(obj);

                if (entries.length > 0 && entries.every(([, v]) => typeof v !== 'object' || v === null))
                {
                    this.#rules = [new Rule(':host', obj as unknown as Record<string, string>)];
                }
                else
                {
                    for (const [sel, def] of entries)
                    {
                        const d = def as RuleInterface;

                        if (d && (d.Selector || d.Contents || d.Content || d.Rule || d.Body))
                        {
                            this.#rules.push(new Rule(d));
                        }
                        else if (def !== null && typeof def === 'object')
                        {
                            this.#rules.push(new Rule(sel, def as Record<string, string>));
                        }
                    }
                }
            }

            this.#flush();
            this.fire('Sheet-Changed', { action: 'parse' });
            return this;
        }

        /** @name        getIndex
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {RuleArguments} rule A selector string, a Rule, or a native CSSRule to locate.
         *  @returns     {number} The index of the matching Rule in the sheet, or -1 when none matches.
         *  @description Find a Rule's position in the sheet by selector. Extracts the selector from any input
         *               form (string / Rule / CSSRule) and matches it against `#rules` whitespace-insensitively,
         *               so cosmetic spacing differences don't defeat the lookup.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getIndex(rule: RuleArguments): number
        {
            const selector = typeof rule === 'string'
                ? rule.trim()
                : rule instanceof Rule
                    ? rule.Selector.trim()
                    : (rule as CSSStyleRule).selectorText?.trim() ?? '';

            return this.#rules.findIndex(r =>
                r.Selector.trim().replace(/\s+/g, '') === selector.replace(/\s+/g, ''));
        }

        /** @name        contains
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...RuleArguments} rules One or more selectors / Rules / CSSRules to test for.
         *  @returns     {boolean} True when every given rule is present in the sheet.
         *  @description Test whether the sheet contains all of the given rules — true when each one resolves to a
         *               non-negative index via `getIndex`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        contains(...rules: RuleArguments[]): boolean
        {
            return rules.every(r => this.getIndex(r) >= 0);
        }

        /** @name        get
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...RuleArguments} rules One or more selectors / Rules / CSSRules to fetch. Also
         *               accepts @-rule selectors, e.g. `sheet.get('@keyframes spin')`.
         *  @returns     {Rule | Rule[] | undefined} A single Rule for one argument (or undefined), an array of
         *               the found Rules for several.
         *  @description Fetch one or more Rules from the sheet by selector, Rule, or CSSRule. One argument returns
         *               the matching Rule or undefined; several return the found Rules as an array, misses
         *               dropped. Mirrors Golem's `sheet.Get('@keyframes Settete')`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get(...rules: RuleArguments[]): Rule | Rule[] | undefined
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

        /** @name        Get
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...RuleArguments} rules One or more selectors / Rules / CSSRules to fetch.
         *  @returns     {Rule | Rule[] | undefined} Whatever `get` returns for the same arguments.
         *  @description Golem alias for `get` — mirrors `sheet.Get('@keyframes Settete')`. Forwards verbatim.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Get(...rules: RuleArguments[]): Rule | Rule[] | undefined
        {
            return this.get(...rules);
        }

        /** @name        set
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {RuleArguments} rule The selector / Rule / CSSRule identifying the rule to update.
         *  @param       {Record<string, string> | string} value New declarations — a CSS string (replaces the
         *               body) or a property object (merged in).
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Update an existing rule's body in place. Locates the rule via `getIndex` (a no-op if
         *               absent), then `replace`s it from a CSS string or `merge`s a property object, flushes the
         *               CSSOM, and fires `'Sheet-Changed'`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set(rule: RuleArguments, value: Record<string, string> | string): this
        {
            const i = this.getIndex(rule);
            if (i < 0) return this;

            const r = this.#rules[i];
            if (!r) return this;
            if (typeof value === 'string')
                r.replace(value);
            else
                r.merge(value);

            this.#flush();
            this.fire('Sheet-Changed', { action: 'set', index: i, rule: r });
            return this;
        }

        /** @name        insert
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {RuleArguments | RuleArguments[]} rules One rule or an array of rules to
         *               insert, in any accepted form.
         *  @param       {number} index The position to splice them in at.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Insert one or more rules at a given index. Normalises each input to a Rule (a Rule
         *               as-is, a string parsed via `Rule.Parse`, a CSSRule wrapped), splices them into `#rules`,
         *               flushes the CSSOM, and fires `'Sheet-Changed'`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        insert(rules: RuleArguments | RuleArguments[], index: number): this
        {
            const arr = Array.isArray(rules) ? rules : [rules];
            const newRules = arr.map(r =>
                r instanceof Rule ? r :
                    typeof r === 'string' ? Rule.Parse(r)[0] :
                        new Rule(r as CSSRule)
            ).filter(Boolean) as Rule[];

            this.#rules.splice(index, 0, ...newRules);
            this.#flush();
            this.fire('Sheet-Changed', { action: 'insert', index, count: newRules.length });
            return this;
        }

        /** @name        Insert
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {RuleArguments | RuleArguments[]} rules One rule or an array of rules to
         *               insert.
         *  @param       {number} index The position to splice them in at.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Golem alias for `insert` — mirrors `sheet.Insert(rule, idx)`. Forwards verbatim.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Insert(rules: RuleArguments | RuleArguments[], index: number): this
        {
            return this.insert(rules, index);
        }

        /** @name        unshift
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...(RuleArguments | RuleArguments[])} rules One or more rules (or rule
         *               arrays) to prepend.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Prepend one or more rules to the front of the sheet — flattens the arguments and inserts
         *               them at index 0 via `insert`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        add(...args: (RuleArguments | RuleArguments[] | number)[]): this
        {
            const last   = args[args.length - 1];
            const hasIdx = typeof last === 'number';
            const idx    = hasIdx ? (last as number) : undefined;
            const src    = (hasIdx ? args.slice(0, -1) : args) as (RuleArguments | RuleArguments[])[];

            const flat = src.flat() as RuleArguments[];
            const newRules = flat.map(r =>
                r instanceof Rule ? r :
                    typeof r === 'string' ? (Rule.Parse(r)[0] ?? null) :
                        new Rule(r as CSSRule)
            ).filter(Boolean) as Rule[];

            if (hasIdx && idx! >= 0 && idx! <= this.#rules.length)
                this.#rules.splice(idx!, 0, ...newRules);
            else
                this.#rules.push(...newRules);

            this.#flush();
            this.fire('Sheet-Changed', { action: 'add', count: newRules.length });
            return this;
        }

        /** @name        unshift
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...(RuleArguments | RuleArguments[])} rules One or more rules (or rule
         *               arrays) to prepend.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Prepend one or more rules to the front of the sheet — flattens the arguments and inserts
         *               them at index 0 via `insert`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Add(...args: (RuleArguments | RuleArguments[] | number)[]): this
        {
            return this.add(...args);
        }

        /** @name        unshift
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...(RuleArguments | RuleArguments[])} rules One or more rules (or rule
         *               arrays) to prepend.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Prepend one or more rules to the front of the sheet — flattens the arguments and inserts
         *               them at index 0 via `insert`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        unshift(...rules: (RuleArguments | RuleArguments[])[]): this
        {
            return this.insert(rules.flat() as RuleArguments[], 0);
        }

        /** @name        remove
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {...(RuleArguments | number)} rules Rules to remove, each given as a selector /
         *               Rule / CSSRule or as a direct numeric index.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Remove one or more rules from the sheet. Each argument is resolved to an index (a number
         *               used directly, otherwise via `getIndex`) and spliced out; then the CSSOM is flushed and
         *               `'Sheet-Changed'` fired.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        remove(...rules: (RuleArguments | number)[]): this
        {
            for (const r of rules)
            {
                const i = typeof r === 'number' ? r : this.getIndex(r);
                if (i >= 0) this.#rules.splice(i, 1);
            }
            this.#flush();
            this.fire('Sheet-Changed', { action: 'remove' });
            return this;
        }

        /** @name        shift
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {number} [n=1] How many rules to remove from the front.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Remove rules from the front of the sheet — splices the first `n` (default 1) out of
         *               `#rules`, flushes the CSSOM, and fires `'Sheet-Changed'`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        shift(n = 1): this
        {
            this.#rules.splice(0, n);
            this.#flush();
            this.fire('Sheet-Changed', { action: 'shift', count: n });
            return this;
        }

        /** @name        pop
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @param       {number} [n=1] How many rules to remove from the end.
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Remove rules from the end of the sheet — splices the last `n` (default 1) out of
         *               `#rules`, flushes the CSSOM, and fires `'Sheet-Changed'`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        pop(n = 1): this
        {
            this.#rules.splice(this.#rules.length - n, n);
            this.#flush();
            this.fire('Sheet-Changed', { action: 'pop', count: n });
            return this;
        }

        /** @name        clear
         *  @public
         *  @memberof    Core.Css.Stylesheet
         *  @returns     {this} The Stylesheet, for chaining.
         *  @description Empty the sheet — drops all Rules, flushes the now-empty CSSOM, and fires
         *               `'Sheet-Changed'`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clear(): this
        {
            this.#rules = [];
            this.#flush();
            this.fire('Sheet-Changed', { action: 'clear' });
            return this;
        }

        /** @name        toString
         *  @public
         *  @memberof    Core.Css.Rule
         *  @returns     {string} The Rule's serialised CSS text.
         *  @description Serialise the Rule to CSS — delegates to the `Text` getter, so a Rule stringifies to its
         *               own rule text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toString(): string { return this.Text; }
    }

    export function  Compile
    (
        input: unknown,
        selector: string = ':root'
    ): string | false
    {
        if
        (
            input === undefined ||
            input === null ||
            input === false
        )
        {
            return false;
        }

        if(input instanceof Rule)
        {
            return input.Text;
        }

        if(input instanceof Stylesheet)
        {
            return input.Text;
        }

        if
        (
            typeof CSSRule !== 'undefined' &&
            input instanceof CSSRule
        )
        {
            return input.cssText;
        }

        if
        (
            typeof CSSStyleSheet !== 'undefined' &&
            input instanceof CSSStyleSheet
        )
        {
            try
            {
                return Array.from(input.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            }
            catch
            {
                return false;
            }
        }

        if
        (
            typeof CSSRuleList !== 'undefined' &&
            input instanceof CSSRuleList
        )
        {
            return Array.from(input)
                .map(rule => rule.cssText)
                .join('\n');
        }

        if(Array.isArray(input))
        {
            if(!input.length)
            {
                return false;
            }

            const parts: string[] = [];

            for(const value of input)
            {
                const css =
                    Compile
                    (
                        value,
                        selector
                    );

                if(!css)
                {
                    return false;
                }

                parts.push(css);
            }

            return parts.join('\n');
        }

        if(typeof input === 'function')
        {
            try
            {
                return Compile
                (
                    (
                        input as
                            (
                                selector: string
                            ) => unknown
                    )(selector),
                    selector
                );
            }
            catch
            {
                return false;
            }
        }

        if(typeof input === 'string')
        {
            const text = input.trim();

            if(!text)
            {
                return false;
            }

            /*
             * Complete stylesheet / complete rule.
             */
            if
            (
                text.includes('{') ||
                text.trimStart().startsWith('@')
            )
            {
                return text;
            }

            /*
             * Declaration block.
             */
            return `${selector}{${text}}`;
        }

        if(typeof input !== 'object')
        {
            return false;
        }

        const source =
            input as Record<string, unknown>;

        /*
         * RuleInterface.
         */
        if('Selector' in source)
        {
            try
            {
                return new Rule
                (
                    source as unknown as RuleInterface
                ).Text;
            }
            catch
            {
                return false;
            }
        }

        if('selector' in source)
        {
            try
            {
                return new Rule
                (
                    {
                        ...source,
                        Selector: source.selector
                    } as unknown as RuleInterface
                ).Text;
            }
            catch
            {
                return false;
            }
        }

        const entries =
            Object.entries(source);

        if(!entries.length)
        {
            return false;
        }

        /*
         * Bare declaration/property bag:
         *
         * { color: 'red', display: 'block' }
         */
        const declarations =
            entries.every
            (
                ([, value]) =>
                    value === null ||
                    value === undefined ||
                    typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean'
            );

        if(declarations)
        {
            try
            {
                return new Rule
                (
                    selector,
                    source as Record<string, string>
                ).Text;
            }
            catch
            {
                return false;
            }
        }

        /*
         * Stylesheet object map:
         *
         * {
         *   '.a': { color: 'red' },
         *   '.b': { display: 'block' }
         * }
         */
        try
        {
            return new Stylesheet
            (
                source as StylesheetObjectInterface
            ).Text;
        }
        catch
        {
            return false;
        }
    }

    /** @name        Service
     *  @private
     *  @memberof    Core.Css
     *  @type        {Core.Services.Service}
     *  @description Registers the ONE `'css'` service on the kernel — the façade every other module reaches
     *               Css through, so nothing has to import this file. Declared INSIDE the namespace on
     *               purpose: it runs at namespace init and is retained rather than tree-shaken, so `Define`
     *               always finds a compile-capable css service. Two members, each a getter returning a bag
     *               of thin delegations: `Rule` for the rule-level statics, `Stylesheet` for the sheet-level
     *               ones. Nothing here holds state or injects anything — the bags are rebuilt on every read
     *               and forward straight to the classes, so the service can never drift from them.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Core.Services.Service<ServiceContract>
    (
        'css',
        {
            /** @name        Rule
             *  @public
             *  @readonly
             *  @memberof    Core.Css.Service
             *  @returns     {object} The rule-level delegation bag.
             *  @description The rule-level half of the css service: the composable Rule statics, reachable
             *               through the kernel as `Core.Services.Call('css', …)` instead of an import. A
             *               getter, not a field, so the bag is built fresh on each read and always points at
             *               the current statics.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            get Rule()
            {
                return {
                    /** @name        GetObject
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {string} text A CSS text string.
                     *  @returns     {Record<string, unknown>} The text as a structured object, keyed by selector.
                     *  @description Parse CSS text into an object — the inverse of GetText. Delegates to
                     *               Rule.GetObject, which borrows the browser's own parser.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    GetObject(text: string): Record<string, unknown>
                    {
                        return Rule.GetObject(text);
                    },

                    /** @name        GetText
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {Rule} rule The rule definition to serialise.
                     *  @param       {string} selector Wraps `rule` at this selector when it is a bare property bag.
                     *  @returns     {string} The complete CSS text.
                     *  @description Serialise a definition to CSS. Delegates to Rule.GetText, which composes
                     *               GetType / GetSelector / GetContents / Serialize and handles every
                     *               construction format, the @-rules and the nested `Rules` form included.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    GetText(rule: Rule, selector: string): string
                    {
                        return Rule.GetText(rule, selector);
                    },

                    /** @name        GetContents
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {Rule} rule The rule definition to read the body from.
                     *  @returns     {Record<string, unknown>} The body as a camelCased map.
                     *  @description Read a definition's body, whichever of the four interchangeable aliases
                     *               carries it (`Contents` / `Content` / `Body` / `Rule`). Delegates to
                     *               Rule.GetContents.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    GetContents(rule: Rule): Record<string, unknown>
                    {
                        return Rule.GetContents(rule);
                    },

                    /** @name        GetType
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {Rule} rule The rule definition to classify.
                     *  @returns     {string} The @-rule keyword, or `''` for a plain style rule.
                     *  @description Name the @-rule a definition declares — `'@media'`, `'@keyframes'`, and
                     *               so on. Delegates to Rule.GetType.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    GetType(rule: Rule): string
                    {
                        return Rule.GetType(rule);
                    },

                    /** @name        GetSelector
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {Rule} rule The rule definition to read the selector from.
                     *  @returns     {string} The selector as CSS text.
                     *  @description Build a definition's selector, flattening a structured SelectorInterface
                     *               (the @-rule preludes, And / Or / Not included) into valid CSS. Delegates
                     *               to Rule.GetSelector.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    GetSelector(rule: Rule): string
                    {
                        return Rule.GetSelector(rule);
                    },

                    /** @name        From
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {Rule} rule The rule to rebuild.
                     *  @returns     {Rule} A new Rule built from it.
                     *  @description Rebuild a Rule through the constructor. Delegates to Rule.From. Note this
                     *               is a re-construction, not `clone` — the copy carries no injection state.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    From(rule: Rule): Rule
                    {
                        return Rule.From(rule);
                    },

                    /** @name        Parse
                     *  @public
                     *  @memberof    Core.Css.Service.Rule
                     *  @param       {string} text A CSS text string with one or more rules.
                     *  @returns     {Rule[]} One Rule per top-level rule found.
                     *  @description Parse CSS text into Rules. Delegates to Rule.Parse. Parsing only — the
                     *               statics never inject; mounting is the constructor's job, through a Mode.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Parse(text: string): Rule[]
                    {
                        return Rule.Parse(text);
                    },
                };
            },

            /** @name        Stylesheet
             *  @public
             *  @readonly
             *  @memberof    Core.Css.Service
             *  @returns     {object} The sheet-level delegation bag.
             *  @description The sheet-level half of the css service: parsing, serialisation, the Less
             *               preprocessor, and the read-only views over the document's own stylesheets. Same
             *               contract as the Rule half — a getter rebuilt on each read, pure delegation, no
             *               state and no injection.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            get Stylesheet()
            {
                return {
                    /** @name        ToString
                     *  @public
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @param       {StylesheetArguments | Rule[]} source Any stylesheet source, or a Rule list.
                     *  @returns     {string} The whole sheet as CSS text.
                     *  @description Serialise any stylesheet source to CSS text. Delegates to
                     *               Stylesheet.ToString.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    ToString(source: StylesheetArguments | Rule[]): string
                    {
                        return Stylesheet.ToString(source);
                    },

                    /** @name        Parse
                     *  @public
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @param       {string} text A CSS text string.
                     *  @returns     {Stylesheet} The parsed Stylesheet.
                     *  @description Parse CSS text into a Stylesheet. Delegates to Stylesheet.Parse, which is
                     *               ToArray's twin: same parse, a Stylesheet returned instead of a Rule list.
                     *               In memory only — the statics never touch the CSSOM.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Parse(text: string): Stylesheet
                    {
                        return Stylesheet.Parse(text);
                    },

                    /** @name        ToArray
                     *  @public
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @param       {string} text A CSS text string.
                     *  @returns     {Rule[]} One Rule per top-level rule.
                     *  @description Parse CSS text into a flat Rule list. Delegates to Stylesheet.ToArray,
                     *               the leaf of the parsing chain — throwaway parse, nothing injected.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    ToArray(text: string): Rule[]
                    {
                        return Stylesheet.ToArray(text);
                    },

                    /** @name        Less
                     *  @public
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @param       {string} text Less source.
                     *  @returns     {string} The compiled CSS.
                     *  @description Run the Less preprocessor over a source string. Delegates to
                     *               Stylesheet.Less, the single entry point every preprocessor form goes
                     *               through.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Less(text: string): string
                    {
                        return Stylesheet.Less(text);
                    },

                    /** @name        Sheets
                     *  @public
                     *  @readonly
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @returns     {Stylesheet[]} One Stylesheet per live document stylesheet.
                     *  @description Every stylesheet in the document, each wrapped in a Stylesheet. Delegates
                     *               to Stylesheet.Sheets.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    get Sheets(): Stylesheet[]
                    {
                        return Stylesheet.Sheets;
                    },

                    /** @name        Links
                     *  @public
                     *  @readonly
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @returns     {HTMLLinkElement[]} The document's stylesheet `<link>` elements.
                     *  @description The `<link rel="stylesheet">` nodes currently in the document. Delegates
                     *               to Stylesheet.Links.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    get Links(): HTMLLinkElement[]
                    {
                        return Stylesheet.Links;
                    },

                    /** @name        Paths
                     *  @public
                     *  @readonly
                     *  @memberof    Core.Css.Service.Stylesheet
                     *  @returns     {string[]} The hrefs of the document's stylesheet links.
                     *  @description The URLs behind the document's stylesheet `<link>` nodes. Delegates to
                     *               Stylesheet.Paths.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    get Paths(): string[]
                    {
                        return Stylesheet.Paths;
                    },
                };
            },

            /** @name        Types
             *  @public
             *  @readonly
             *  @memberof    Core.Css.Service
             *  @returns     {{ Rule: 'Rule'; Stylesheet: 'Stylesheet' }} The class-tag vocabulary.
             *  @description The two values a css class tag can take, so a consumer compares against a named
             *               constant instead of retyping a string literal in every call site — one place to
             *               read the vocabulary from, and a typo becomes a compile error instead of a
             *               comparison that is silently always false. The `as const` is not decoration: it
             *               freezes each property to its literal type, and that is what lets a consumer
             *               narrow on `value.Type === Types.Rule` rather than merely compare two `string`s.
             *               Pairs with the tag accessor each class exposes: the accessor is the datum, this
             *               is the vocabulary that names it — neither replaces the other, because a
             *               constant tells you which values exist and only the accessor tells you which one
             *               THIS value is.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            get Types()
            {
                return { Rule: 'Rule', Stylesheet: 'Stylesheet' } as const;
            },

            Compile(input: unknown, selector?: string): string | false
            {
                return Css.Compile
                (
                    input,
                    selector
                );
            },
        }
    );
}

export default Css;