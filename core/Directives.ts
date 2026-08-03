/**
 * @module    Directives
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Performant like SolidJS, reactive like Vue, pleasant like AriannA itself.
 * Lightweight DOM directives — no virtual DOM overhead.
 *
 * ── RUNTIME DIRECTIVES ───────────────────────────────────────────────────────
 *
 *   Directives.if(el, condition, then?, else?)
 *     Conditionally show/hide content. Returns an update() function.
 *
 *   Directives.for(el, items, renderFn)
 *     Render a list from an array. Returns an update() function.
 *
 *   Directives.foreach(el, object, renderFn)
 *     Render an object's key/value pairs. Returns update().
 *     Matches: <ol foreach="var planet in object">
 *
 *   Directives.while(el, condition, renderFn)
 *     Render while a condition is truthy.
 *
 *   Directives.switch(el, value, cases)
 *     Render the matching case from a map of value → content.
 *
 *   Directives.bind(el, prop, source)
 *     One-way bind: element[prop] ← source(). Re-evaluates on source change.
 *
 *   Directives.show(el, condition)
 *     Toggle display without removing from DOM.
 *
 *   Directives.model(input, state, key)
 *     Two-way binding between an input and a State property.
 *
 *   Directives.on(el, type, handler, opts?)
 *     Thin wrapper over Core.Events.On — mirrors v-on / @event syntax.
 *
 *   Directives.template(el, data?)
 *     Process {{ expression }} template literals in el's innerHTML.
 *     Matches the legacy library's {{ planet }} / {{ object[planet] }} / {{ Level1A.Level2A }} syntax.
 *
 *   Directives.bootstrap(root?)
 *     Scan the DOM for directive attributes and apply automatically.
 *     Processes: a-if, a-for, a-foreach, a-while, a-switch, a-bind, a-show, a-model, a-on.
 *
 * ── HTML ATTRIBUTE DIRECTIVES (via bootstrap) ─────────────────────────────────
 *   <div a-if="condition"></div>
 *   <ol  a-foreach="var item in items"><li>{{ item }}</li></ol>
 *   <ul  a-for="item in items"><li>{{ item }}</li></ul>
 *   <div a-show="condition"></div>
 *   <input a-model="state.key">
 *   <button a-on="click:handler">
 *   <div a-bind="textContent:expr"></div>
 *   <div a-switch="value">
 *     <div a-case="v1">Case 1</div>
 *     <div a-case="v2">Case 2</div>
 *   </div>
 *
 * ── TYPESCRIPT DECORATORS ─────────────────────────────────────────────────────
 *   @ComponentDecorator({ tag, template, style })   — defines a Custom Element
 *   @Prop()                                — reactive property
 *   @Watch('propName')                     — watch a prop for changes
 *   @Emit('event-name')                    — fires CustomEvent on return
 *   @Ref(selector?)                        — wires property to DOM element
 *
 * @example
 *   // Conditional
 *   const update = Directives.if(el, () => user.loggedIn, loginPanel, logoutPanel);
 *   // Later: update() re-evaluates
 *
 * @example
 *   // List rendering
 *   const update = Directives.for(list, () => items, (item, i) =>
 *     `<li data-i="${i}">${item.name}</li>`);
 *
 * @example
 *   // Foreach (object iteration — matches the legacy library's foreach="var planet in object")
 *   const update = Directives.foreach(ol, () => planets, (key, value) =>
 *     `<li>${key}: ${value}</li>`);
 *
 * @example
 *   // Template literals (matches the legacy library's {{ expr }} syntax)
 *   var example = 'EXAMPLE'; var literals = 'LITERALS';
 *   Directives.template(div, { example, literals });
 *   // Replaces {{ example }} → 'EXAMPLE', {{ literals }} → 'LITERALS'
 *
 * @example
 *   // Two-way model binding
 *   const state = new State({ name: 'AriannA' });
 *   Directives.model(input, state, 'name');
 *   // input.value ↔ state.State.name
 *
 * @example
 *   // Bootstrap — auto-process directive attributes
 *   Directives.bootstrap(document.body);
 */

import { Core } from './Core.ts';
import { Namespaces } from './Namespaces.ts';
import { Events } from './Events.ts';

/**
 * Lifecycle hooks for a custom Directives instance.
 *
 * Both hooks are optional. `mounted` is called when the directive is applied
 * (via `inst.apply(el, value)` or `Directives.apply(name, el, value)`).
 * `unmounted` is called on `inst.unmount(el)` or `Directives.unmount(name, el)`.
 */

/** @namespace Directives @description Public types, interfaces and decorators, merged with the class. */
export namespace Directives
{
    /** @typedef     Condition
     *  @memberof    Directives
     *  @type        {boolean | (() => boolean)}
     *  @description A directive condition: a plain boolean, or a getter returning one (re-evaluated
     *               when the directive updates). Consumed by `if`, `show`, `while`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type Condition    = boolean | (() => boolean);

    /** @typedef     ContentArg
     *  @memberof    Directives
     *  @type        {string | Element | DocumentFragment | null | undefined}
     *  @description Content a directive may insert: an HTML string (parsed to a fragment), an existing
     *               Element or DocumentFragment, or nothing (`null` / `undefined`) to render empty.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type ContentArg   = string | Element | DocumentFragment | null | undefined;

    /** @typedef     RenderFn
     *  @memberof    Directives
     *  @type        {(item: T, index: number) => string | Element}
     *  @description Per-item renderer for list directives (`for` / `foreach`): maps an item and its
     *               index to the markup or element to emit for that iteration.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type RenderFn<T>  = (item: T, index: number) => string | Element;

    /** @typedef     ObjRenderFn
     *  @memberof    Directives
     *  @type        {(key: string, value: unknown, index: number) => string | Element}
     *  @description Per-entry renderer for object iteration: maps a key, its value, and the entry
     *               index to the markup or element to emit.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type ObjRenderFn  = (key: string, value: unknown, index: number) => string | Element;

    /** @typedef     UpdateFn
     *  @memberof    Directives
     *  @type        {() => void}
     *  @description The teardown / re-run handle a directive returns: invoking it re-evaluates the
     *               directive against current state (or detaches it). Reactive bindings return one.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type UpdateFn     = () => void;

    export interface CustomDirectiveHooks
    {
        /** Called when the directive is bound to an element. */
        mounted?  : (el: Element, value: unknown) => void;
        /** Called when the directive is unbound from an element. */
        unmounted?: (el: Element, value: unknown) => void;
    }

    // ── TypeScript Decorators ──────────────────────────────────────────────────────

    /** Metadata for @ComponentDecorator decorator. */
    export interface ComponentMeta
    {
        /** Custom element tag name (must contain a hyphen). */
        tag      : string;
        /** HTML template string for the component's shadow or light DOM. */
        template?: string;
        /** CSS string for the component's styles. */
        style?   : string;
        /** Shadow DOM mode ('open' | 'closed'). Default: 'closed'. */
        shadow?  : 'open' | 'closed' | false;
    }

    /** @name directivesService @private @description Registers the 'directives' service. */
    export const directivesService = new Core.Services.Service
    (
        'directives',
        {
            /** Register a custom directive by name + hooks. */
            register(name: string, hooks: Directives.CustomDirectiveHooks): Directives.Directive
            { return Directives.Directive.register(name, hooks); },
        }
    );

    /**
     * Class decorator — defines and registers a Custom Element.
     *
     * Two call forms, both supported (mirrors the ComponentDecorator(...) constructor):
     *
     *  • Positional (same as the constructor):
     *      @ComponentDecorator('dec-card', Rule | Stylesheet | object | cssString, options?)
     *      class DecCard extends HTMLElement {}
     *
     *  • Object:
     *      @ComponentDecorator({ tag: 'dec-card', template: '<slot></slot>', style: '…', shadow: 'open' })
     *      class DecCard extends HTMLElement {}
     */
    export function ComponentDecorator(
        arg0: ComponentMeta | string,
        style?: unknown,
        options?: { shadow?: 'open' | 'closed' | false; template?: string },
    )
    {
        // ── Normalize both call forms into a single ComponentMeta ──────────────
        let meta: ComponentMeta;
        if (typeof arg0 === 'string') {
            // Positional form: @ComponentDecorator('tag', style, options)
            // `style` may be a Rule, Stylesheet, plain object, or CSS string. We
            // serialize to a CSS string for the decorator's <style> injection.
            let styleStr: string | undefined;
            const sAny = style as { Text?: string; cssText?: string; toString?: () => string } | string | undefined;
            if (sAny == null)                       styleStr = undefined;
            else if (typeof sAny === 'string')      styleStr = sAny;
            else if (typeof sAny.Text === 'string') styleStr = sAny.Text;       // Rule / Stylesheet
            else if (typeof sAny.cssText === 'string') styleStr = sAny.cssText;  // Rule
            else if (typeof sAny === 'object') {
                // plain object: { Display:'block', ... } → :host { … }
                const props = Object.entries(sAny as Record<string, unknown>)
                    .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
                    .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${v}`)
                    .join(';');
                styleStr = props ? `:host{${props}}` : undefined;
            }
            meta = {
                tag     : arg0,
                style   : styleStr,
                template: options?.template,
                shadow  : options?.shadow ?? 'closed',
            };
        } else {
            // Object form: @ComponentDecorator({ tag, template, style, shadow })
            meta = arg0;
        }

        return function <T extends typeof HTMLElement>(Base: T): T
        {
            // Legacy decorator compatibility, routed through AriannA's registry.
            // No customElements.define(): ComponentDecorator registration belongs to Core/Namespace.
            const rendered = new WeakSet<HTMLElement>();
            const roots    = new WeakMap<HTMLElement, ShadowRoot>();
            const proto    = Base.prototype as unknown as {
                connectedCallback?: () => void;
                build?: (...a: unknown[]) => void;
            };
            const _connected = proto.connectedCallback;
            const _build     = proto.build;

            // Shared render: attach shadow (or light) and inject template + style.
            // Idempotent per element via the `rendered` WeakSet.
            const _render = function (this: HTMLElement) {
                if (rendered.has(this)) return;
                rendered.add(this);
                if (meta.shadow !== false) {
                    const existing = this.shadowRoot ?? roots.get(this);
                    let root: ShadowRoot | null = existing ?? null;
                    if (!root) {
                        try { root = this.attachShadow({ mode: meta.shadow ?? 'closed' }); }
                        catch { root = null; }
                    }
                    if (root) {
                        roots.set(this, root);
                        if (meta.style)    { const s = document.createElement('style'); s.textContent = meta.style; root.appendChild(s); }
                        if (meta.template) { const t = document.createElement('template'); t.innerHTML = meta.template; root.appendChild(t.content.cloneNode(true)); }
                        return;
                    }
                    // attachShadow failed (non-capable tag): fall through to light DOM.
                }
                // Light DOM: inject style into <head> (scoped to the tag) + template
                // into the element's own children.
                if (meta.style) {
                    const s = document.createElement('style');
                    s.textContent = meta.style.replace(/:host/g, meta.tag);
                    document.head.appendChild(s);
                }
                if (meta.template && !this.children.length) this.innerHTML = meta.template;
            };

            // AriannA calls build() on upgrade (it does NOT use customElements, so
            // the browser never fires connectedCallback). Hook build() so decorator
            // components render within AriannA's pipeline.
            proto.build = function (this: HTMLElement, ...a: unknown[]) {
                _render.call(this);
                if (_build) _build.apply(this, a);
            };

            // Also keep connectedCallback for any environment that DOES use
            // customElements (harmless double-guarded by the `rendered` set).
            proto.connectedCallback = function connectedCallback(this: HTMLElement) {
                _render.call(this);
                if (_connected) _connected.call(this);
            };

            Namespaces.Namespace.Define(meta.tag, Base as unknown as new (...a: unknown[]) => Element, HTMLElement);
            return Base;
        };
    }

    /** @class       Directive
     *  @memberof    Directives
     *  @classdesc   The directive engine: declarative DOM directives as static methods —
     *               `if` / `while` / `switch` (conditional), `for` / `foreach` (list),
     *               `bind` / `model` / `show` (reactive binding), `on` (events), `template`
     *               (interpolation) — mirroring template-framework directives over AriannA's
     *               reactivity, plus custom-directive registration (`register`) and DOM
     *               `bootstrap`. All state and helpers are encapsulated as `static #`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class Directive
    {
        static #resolve(condition: Directives.Condition): boolean
        {
            return typeof condition === 'function' ? condition() : Boolean(condition);
        }

        static #toNode(content: Directives.ContentArg): Node | null
        {
            if (!content) return null;
            if (content instanceof Element || content instanceof DocumentFragment) return content;
            if (typeof content === 'string') {
                const t = document.createElement('template');
                t.innerHTML = content;
                return t.content.cloneNode(true);
            }
            return null;
        }

        static #resolveParent(parent: Element | string): Element | null
        {
            if (typeof parent === 'string') return document.querySelector(parent);
            return parent;
        }


        // ── if ─────────────────────────────────────────────────────────────────────

        /**
         * Conditionally insert/remove content based on a condition.
         * Uses an anchor comment node to track position in the DOM.
         * Returns an update() function — call it when the condition may have changed.
         *
         * @param parent    - Parent element or CSS selector
         * @param condition - Boolean or () => boolean
         * @param then_     - Content to show when true  (string | Element | null)
         * @param else_     - Content to show when false (string | Element | null)
         * @returns Directive.UpdateFn — call to re-evaluate
         *
         * @example
         *   const update = Directive.if(el, () => user.loggedIn, loginHtml, logoutHtml);
         *   // When condition changes:
         *   update();
         */
        static if(
            parent    : Element | string,
            condition : Directives.Condition,
            then_?    : Directives.ContentArg,
            else_?    : Directives.ContentArg,
        ): Directives.UpdateFn
        {
            const par    = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = document.createComment(' a:if ');
            par.appendChild(anchor);
            let current: Node | Node[] | null = null;

            function update(): void
            {
                const val = Directive.#resolve(condition);
                const src = val ? then_ : else_;

                // Remove current nodes
                if (current)
                {
                    if (Array.isArray(current))
                        current.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
                    else if ((current as Node).parentNode)
                        (current as Node).parentNode!.removeChild(current as Node);
                    current = null;
                }

                if (src)
                {
                    const next = Directive.#toNode(src);
                    if (next)
                    {
                        // Collect real nodes before inserting (DocumentFragment empties on insert)
                        const nodes = next.nodeType === 11
                            ? Array.from((next as DocumentFragment).childNodes)
                            : [next];
                        anchor.parentNode!.insertBefore(next, anchor);
                        current = nodes.length === 1 ? nodes[0] : nodes;
                    }
                }
            }

            update();
            return update;
        }

        // ── for ────────────────────────────────────────────────────────────────────

        /**
         * Render a list from an array. Clears and re-renders on each update().
         *
         * @param parent   - Parent element
         * @param items    - Array or () => Array
         * @param renderFn - (item, index) => string | Element
         * @returns Directive.UpdateFn
         *
         * @example
         *   const update = Directive.for(ul, () => items, (item, i) =>
         *     `<li data-i="${i}">${item.name}</li>`);
         */
        static for<T>(
            parent   : Element | string,
            items    : T[] | (() => T[]),
            renderFn : Directives.RenderFn<T>,
        ): Directives.UpdateFn
        {
            const par = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = document.createComment(' a:for ');
            par.appendChild(anchor);
            const rendered: Node[] = [];

            function update(): void
            {
                rendered.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
                rendered.length = 0;
                const list = typeof items === 'function' ? items() : items;
                const frag = document.createDocumentFragment();
                list.forEach((item, i) => {
                    const node = Directive.#toNode(renderFn(item, i) as Directives.ContentArg);
                    if (node) { frag.appendChild(node); rendered.push(node); }
                });
                anchor.parentNode!.insertBefore(frag, anchor);
            }

            update();
            return update;
        }

        // ── foreach ────────────────────────────────────────────────────────────────

        /**
         * Render an object's key/value pairs into a parent element.
         * Matches the the legacy library `foreach="var planet in object"` HTML attribute pattern.
         *
         * @param parent   - Parent element
         * @param obj      - Object or () => Object to iterate
         * @param renderFn - (key, value, index) => string | Element
         * @returns Directive.UpdateFn
         *
         * @example
         *   // Matches: <ol foreach="var planet in object">
         *   //            <li>{{ planet }} : {{ object[planet] }}</li>
         *   //          </ol>
         *   const update = Directive.foreach(ol, () => planets, (key, value) =>
         *     `<li class="Value">${key} : ${value}</li>`);
         */
        static foreach(
            parent   : Element | string,
            obj      : Record<string, unknown> | (() => Record<string, unknown>),
            renderFn : Directives.ObjRenderFn,
        ): Directives.UpdateFn
        {
            const par = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = document.createComment(' a:foreach ');
            par.appendChild(anchor);
            const rendered: Node[] = [];

            function update(): void
            {
                rendered.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
                rendered.length = 0;
                const source = typeof obj === 'function' ? obj() : obj;
                const frag   = document.createDocumentFragment();
                Object.entries(source).forEach(([key, value], i) => {
                    const node = Directive.#toNode(renderFn(key, value, i) as Directives.ContentArg);
                    if (node) { frag.appendChild(node); rendered.push(node); }
                });
                anchor.parentNode!.insertBefore(frag, anchor);
            }

            update();
            return update;
        }

        // ── while ──────────────────────────────────────────────────────────────────

        /**
         * Render while a condition is truthy, calling renderFn(iteration) each time.
         * Has a built-in safety limit of 10000 iterations to prevent infinite loops.
         *
         * @param parent    - Parent element
         * @param condition - () => boolean — evaluated each iteration
         * @param renderFn  - (iteration: number) => string | Element
         * @returns Directive.UpdateFn
         *
         * @example
         *   let i = 0;
         *   const update = Directive.while(ul, () => i < 5, () => {
         *     const html = `<li>Item ${i}</li>`;
         *     i++;
         *     return html;
         *   });
         */
        static while(
            parent    : Element | string,
            condition : () => boolean,
            renderFn  : (iteration: number) => string | Element,
        ): Directives.UpdateFn
        {
            const par = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = document.createComment(' a:while ');
            par.appendChild(anchor);
            const rendered: Node[] = [];

            function update(): void
            {
                rendered.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
                rendered.length = 0;
                const frag = document.createDocumentFragment();
                let i = 0;
                const MAX = 10000;
                while (condition() && i < MAX)
                {
                    const node = Directive.#toNode(renderFn(i) as Directives.ContentArg);
                    if (node) { frag.appendChild(node); rendered.push(node); }
                    i++;
                }
                anchor.parentNode!.insertBefore(frag, anchor);
            }

            update();
            return update;
        }

        // ── switch ─────────────────────────────────────────────────────────────────

        /**
         * Render the matching case from a map. Falls back to 'default' key if present.
         *
         * @param parent - Parent element
         * @param value  - Current value or () => value
         * @param cases  - { [caseValue]: content, default?: content }
         * @returns Directive.UpdateFn
         *
         * @example
         *   const update = Directive.switch(el, () => tab, {
         *     home    : '<div>Home</div>',
         *     about   : '<div>About</div>',
         *     default : '<div>404</div>',
         *   });
         */
        static switch(
            parent : Element | string,
            value  : unknown | (() => unknown),
            cases  : Record<string, Directives.ContentArg>,
        ): Directives.UpdateFn
        {
            const par    = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = document.createComment(' a:switch ');
            par.appendChild(anchor);
            let current: Node | Node[] | null = null;

            function update(): void
            {
                const val = typeof value === 'function' ? value() : value;
                const src = cases[String(val)] ?? cases['default'] ?? null;

                if (current)
                {
                    if (Array.isArray(current))
                        current.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
                    else if ((current as Node).parentNode)
                        (current as Node).parentNode!.removeChild(current as Node);
                    current = null;
                }

                if (src)
                {
                    const next = Directive.#toNode(src);
                    if (next)
                    {
                        const nodes = next.nodeType === 11
                            ? Array.from((next as DocumentFragment).childNodes) : [next];
                        anchor.parentNode!.insertBefore(next, anchor);
                        current = nodes.length === 1 ? nodes[0] : nodes;
                    }
                }
            }

            update();
            return update;
        }

        // ── bind ───────────────────────────────────────────────────────────────────

        /**
         * One-way bind: element[prop] ← source().
         * Supports string and function sources. For State-based binding,
         * use with state.on('State-Changed', update).
         *
         * @param el   - Target element
         * @param prop - Property name (e.g. 'textContent', 'value', 'href')
         * @param source - Value or () => value
         * @returns Directive.UpdateFn
         *
         * @example
         *   const update = Directive.bind(span, 'textContent', () => state.State.name);
         *   state.on('State-Changed', update);
         */
        static bind(
            el     : Element,
            prop   : string,
            source : unknown | (() => unknown),
        ): Directives.UpdateFn
        {
            function update(): void
            {
                const val = typeof source === 'function' ? source() : source;
                (el as unknown as Record<string, unknown>)[prop] = val;
            }
            update();
            return update;
        }

        // ── show ───────────────────────────────────────────────────────────────────

        /**
         * Toggle visibility without removing from DOM (sets display none/empty).
         *
         * @param el        - Target element
         * @param condition - Boolean or () => boolean
         * @returns Directive.UpdateFn
         *
         * @example
         *   const update = Directive.show(panel, () => isVisible);
         *   state.on('State-Changed', update);
         */
        static show(el: HTMLElement, condition: Directives.Condition): Directives.UpdateFn
        {
            function update(): void
            {
                el.style.display = Directive.#resolve(condition) ? '' : 'none';
            }
            update();
            return update;
        }

        // ── model ──────────────────────────────────────────────────────────────────

        /**
         * Two-way binding between an input element and a State property.
         * input.value → state.State[key] on 'input' event.
         * state.State[key] → input.value on State-Changed.
         *
         * @param input - Input, textarea, or select element
         * @param state - AriannA State instance
         * @param key   - Property key in state.State
         *
         * @example
         *   const state = new State({ name: 'AriannA', version: 2 });
         *   Directive.model(nameInput, state, 'name');
         *   // nameInput.value ↔ state.State.name
         */
        static model(
            input : HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
            state : { State: Record<string, unknown>; on(t: string, cb: (e: unknown) => void): void },
            key   : string,
        ): void
        {
            // DOM → State
            Events.Event.On(input, 'input', () => {
                state.State[key] = input.value;
            });
            // State → DOM
            state.on('State-Changed', () => {
                const v = String(state.State[key] ?? '');
                if (input.value !== v) input.value = v;
            });
            // Initial sync
            input.value = String(state.State[key] ?? '');
        }

        // ── on ─────────────────────────────────────────────────────────────────────

        /**
         * Add a DOM event listener — thin wrapper matching v-on / @event syntax.
         * Types may be space/comma/pipe-separated.
         *
         * @example
         *   Directive.on(btn, 'click', handler);
         *   Directive.on(form, 'submit', e => { e.preventDefault(); submit(); });
         */
        static on(
            el      : Element | string,
            types   : string,
            handler : EventListener,
            opts?   : AddEventListenerOptions,
        ): void
        {
            const target = typeof el === 'string' ? document.querySelector(el) : el;
            if (!target) return;
            types.split(/\s+|,|\|/g).filter(Boolean).forEach(t =>
                Events.Event.On(target, t, handler, opts));
        }

        // ── template ───────────────────────────────────────────────────────────────

        /**
         * Process {{ expression }} template literals in an element's innerHTML.
         *
         * Supports:
         *   {{ varName }}                  — simple variable lookup
         *   {{ obj.prop }}                 — dot-path lookup (Level1A.Level2A)
         *   {{ obj[key] }}                 — bracket notation
         *
         * Matches the the legacy library legacy {{ planet }} / {{ object[planet] }} /
         * {{ Level1A.Level2A }} syntax from the legacy library-Components-Directive-TemplateLiterals.html
         * and the legacy library-Components-Directive-ForEach.html.
         *
         * @param el   - Element containing {{ }} placeholders
         * @param data - Data context object (defaults to window globals)
         *
         * @example
         *   var example = 'EXAMPLE'; var literals = 'LITERALS';
         *   Directive.template(div, { example, literals });
         *   // <p>This is an EXAMPLE of Template LITERALS</p>
         *
         * @example
         *   // Nested path
         *   Directive.template(el, { Level1A: { Level2A: 'Data Level2A Value' } });
         *   // {{ Level1A.Level2A }} → 'Data Level2A Value'
         */
        static template(el: Element, data?: Record<string, unknown>): void
        {
            const ctx = data ?? (typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {});

            function resolve(expr: string): string
            {
                expr = expr.trim();
                try
                {
                    // Simple dot/bracket path resolution — no eval
                    const parts = expr.split(/\.|\[['"]?|['"]?\]/g).filter(Boolean);
                    let val: unknown = ctx;
                    for (const part of parts)
                    {
                        if (val == null) return '';
                        val = (val as Record<string, unknown>)[part];
                    }
                    return val != null ? String(val) : '';
                } catch
                {
                    return '';
                }
            }

            el.innerHTML = el.innerHTML.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr) => resolve(expr));
        }

        // ── bootstrap ──────────────────────────────────────────────────────────────

        /**
         * Scan a root element for directive HTML attributes and apply them.
         * Supports: a-if, a-for, a-foreach, a-while, a-switch, a-bind, a-show, a-model, a-on.
         * Also processes {{ }} template literals in elements with a-template or data-template.
         *
         * This enables declarative HTML-first usage without writing JS:
         * ```html
         * <ol a-foreach="item in items"><li>{{ item }}</li></ol>
         * <div a-if="user.loggedIn">Welcome!</div>
         * <input a-model="state.name">
         * <button a-on="click:submitForm">Submit</button>
         * ```
         *
         * @param root    - Root element to scan (default: document.body)
         * @param context - Data context for expression evaluation (default: window)
         *
         * @example
         *   Directive.bootstrap(document.body, { items, user, state });
         */
        static bootstrap(
            root    : Element = document.body,
            context : Record<string, unknown> = {},
        ): void
        {
            const ctx = { ...(typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {}), ...context };

            function evalExpr(expr: string): unknown
            {
                try
                {
                    // Safe-ish expression eval using Function with explicit context keys
                    const keys = Object.keys(ctx);
                    const vals = Object.values(ctx);
                    return new Function(...keys, `return (${expr})`)(...vals);
                } catch { return undefined; }
            }

            // Process {{ }} template literals on all text nodes
            root.querySelectorAll('[a-template],[data-template]').forEach(el => {
                Directive.template(el, ctx);
            });

            // a-if
            root.querySelectorAll('[a-if]').forEach(el => {
                const expr = el.getAttribute('a-if') ?? 'false';
                Directive.if(el.parentElement ?? root, () => Boolean(evalExpr(expr)), el as Element);
            });

            // a-show
            root.querySelectorAll('[a-show]').forEach(el => {
                const expr = el.getAttribute('a-show') ?? 'false';
                Directive.show(el as HTMLElement, () => Boolean(evalExpr(expr)));
            });

            // a-model
            root.querySelectorAll('[a-model]').forEach(el => {
                const path = el.getAttribute('a-model') ?? '';
                const [stateKey, propKey] = path.split('.');
                const state = ctx[stateKey] as { State: Record<string, unknown>; on(t: string, cb: (e: unknown) => void): void };
                if (state && propKey) Directive.model(el as HTMLInputElement, state, propKey);
            });

            // a-on
            root.querySelectorAll('[a-on]').forEach(el => {
                const spec = el.getAttribute('a-on') ?? '';
                const [type, fnName] = spec.split(':').map(s => s.trim());
                if (type && fnName)
                {
                    const handler = ctx[fnName];
                    if (typeof handler === 'function')
                        Directive.on(el, type, handler as EventListener);
                }
            });

            // a-bind
            root.querySelectorAll('[a-bind]').forEach(el => {
                const spec = el.getAttribute('a-bind') ?? '';
                const [prop, expr] = spec.split(':').map(s => s.trim());
                if (prop && expr) Directive.bind(el, prop, () => evalExpr(expr));
            });
        }

        // ────────────────────────────────────────────────────────────────────────────
        // Instance API + custom directive registry
        //
        // In addition to the static helpers above, Directive can be instantiated to
        // create reusable, named directive behaviors with optional `mounted` and
        // `unmounted` lifecycle hooks. Both styles are supported in parallel:
        //
        //   1. Static one-shot:        Directive.if(el, () => x)
        //   2. Static custom register: Directive.register('tooltip', { mounted, unmounted });
        //                              Directive.apply('tooltip', el, 'Hello!');
        //   3. Instance custom:        const tip = new Directive('tooltip', { mounted, unmounted });
        //                              tip.apply(el, 'Hello!');
        //                              tip.apply(otherEl, 'World!');     // reuse instance
        //                              tip.unmount(el);                  // optional cleanup
        //
        // Pattern (3) gives you a stable handle on a directive — useful when you
        // need to track multiple bindings, dispose them later, or pass the directive
        // around as a first-class object.
        //
        // ────────────────────────────────────────────────────────────────────────────

        /** Directive instance hooks. */
        /* (Directive.CustomDirectiveHooks declared module-level — see below) */

        /** Name of this custom directive instance. */
        readonly name: string;

        /** Mount/unmount hooks for this instance. */
        readonly hooks: Directives.CustomDirectiveHooks;

        /** Map of element → user-supplied value, for unmount cleanup. */
        #bindings = new WeakMap<Element, unknown>();

        /**
         * Create a custom, named directive that auto-registers itself in the global
         * registry, so both `inst.apply(...)` and `Directive.apply(name, ...)` work.
         *
         * @param name  Unique directive name (e.g. 'tooltip', 'autosize').
         * @param hooks Lifecycle hooks. Both are optional but at least one is
         *              recommended; `mounted` is called on apply, `unmounted` on
         *              `unmount(el)` or `Directive.unmount(name, el)`.
         *
         * @example
         *   const tooltip = new Directive('tooltip', {
         *       mounted(el, value) { el.setAttribute('title', String(value)); },
         *       unmounted(el)      { el.removeAttribute('title'); },
         *   });
         *   tooltip.apply(buttonEl, 'Click to submit');
         */
        constructor(name: string, hooks: Directives.CustomDirectiveHooks)
        {
            this.name  = name;
            this.hooks = hooks;
            Directive._registry.set(name, this);
        }

        /**
         * Apply this directive instance to a DOM element, calling its `mounted`
         * hook if defined. Returns `this` for chaining.
         */
        apply(el: Element, value: unknown = undefined): this
        {
            this.#bindings.set(el, value);
            this.hooks.mounted?.(el, value);
            return this;
        }

        /**
         * Run the `unmounted` hook for `el` (if defined) and forget the binding.
         * Returns `true` if a binding existed, `false` otherwise.
         */
        unmount(el: Element): boolean
        {
            if (!this.#bindings.has(el)) return false;
            const value = this.#bindings.get(el);
            this.#bindings.delete(el);
            this.hooks.unmounted?.(el, value);
            return true;
        }

        // ── Static registry ────────────────────────────────────────────────────────

        /** @internal */
        static _registry = new Map<string, Directive>();

        /**
         * Register a custom directive in the global registry. Equivalent to
         * `new Directive(name, hooks)` but reads more declaratively when you
         * don't need to keep the instance handle around.
         *
         * @returns The created Directive instance, in case you want it.
         *
         * @example
         *   Directive.register('autofocus', {
         *       mounted(el) { (el as HTMLElement).focus(); },
         *   });
         */
        static register(name: string, hooks: Directives.CustomDirectiveHooks): Directive
        {
            return new Directive(name, hooks);
        }

        /**
         * Look up a registered custom directive by name and apply it to `el`.
         * Returns the Directive instance, or `undefined` if no directive with that
         * name was registered.
         *
         * @example
         *   Directive.register('tooltip', { mounted(el, v) { ... } });
         *   Directive.apply('tooltip', someElement, 'Hello!');
         */
        static apply(name: string, el: Element, value: unknown = undefined): Directive | undefined
        {
            const inst = Directive._registry.get(name);
            if (!inst) return undefined;
            return inst.apply(el, value);
        }

        /** Run the unmount hook of a registered directive on an element. */
        static unmount(name: string, el: Element): boolean
        {
            const inst = Directive._registry.get(name);
            if (!inst) return false;
            return inst.unmount(el);
        }

        /** Look up a registered Directive instance by name. */
        static get(name: string): Directive | undefined
        {
            return Directive._registry.get(name);
        }

        /** Pin the constructor name (bundler renames the colliding local to `_Directive`)
         *  and expose the class on `window`. Runs once at class-eval. */
        static #Build(): void
        {
            try { Object.defineProperty(this, 'name', { value: 'Directive', configurable: true }); } catch { /* frozen */ }
            if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Directive'))
                Object.defineProperty(window, 'Directive', { enumerable: true, configurable: false, writable: false, value: this });
        }

        static { this.#Build(); }
    }

    /**
     * Property decorator — marks a class property as reactive.
     * When the property changes, the component's update() method is called if present.
     *
     * @example
     *   @ComponentDecorator({ tag: 'my-count' })
     *   class MyCount extends HTMLElement {
     *     @Prop() count = 0;
     *   }
     */
    export function Prop()
    {
        return function (target: object, key: string): void
        {
            const storage = new WeakMap<object, unknown>();
            Object.defineProperty(target, key, {
                get(this: object) { return storage.get(this); },
                set(this: object & { update?: () => void }, v: unknown)
                {
                    if (storage.get(this) === v) return;
                    storage.set(this, v);
                    if (typeof this.update === 'function') this.update();
                },
                configurable: true, enumerable: true,
            });
        };
    }

    /**
     * Method decorator — called when a named prop changes.
     *
     * @example
     *   @Watch('count')
     *   onCountChange(newVal: number, oldVal: number) {
     *     console.log(`count: ${oldVal} → ${newVal}`);
     *   }
     */
    export function Watch(propName: string)
    {
        return function (_target: object, _key: string, descriptor: PropertyDescriptor)
        {
            const original = descriptor.value as (nv: unknown, ov: unknown) => void;
            descriptor.value = function (this: object, nv: unknown, ov: unknown)
            {
                if ((this as Record<string, unknown>)[propName] !== nv)
                    original.call(this, nv, ov);
            };
            return descriptor;
        };
    }

    /**
     * Method decorator — wraps the return value in a CustomEvent and dispatches it.
     *
     * @example
     *   @Emit('my-submit')
     *   handleSubmit() { return { data: this.formData }; }
     *   // Dispatches: new CustomEvent('my-submit', { detail: { data: ... } })
     */
    export function Emit(eventName: string)
    {
        return function (_target: object, _key: string, descriptor: PropertyDescriptor)
        {
            const original = descriptor.value as (...args: unknown[]) => unknown;
            descriptor.value = function (this: HTMLElement, ...args: unknown[])
            {
                const result = original.apply(this, args);
                Events.Event.Fire(this, { Type: eventName, Detail: result as Record<string, unknown>, Propagation: true });
                return result;
            };
            return descriptor;
        };
    }

    /**
     * Property decorator — wires a class property to a DOM element via selector.
     * The element is resolved lazily on first access.
     *
     * @example
     *   @Ref('#my-input') inputEl!: HTMLInputElement;
     *   @Ref()           nameRef!: HTMLElement;  // uses property name as id
     */
    export function Ref(selector?: string)
    {
        return function (target: object, key: string): void
        {
            const sel = selector ?? `#${key}`;
            Object.defineProperty(target, key, {
                get(this: HTMLElement)
                {
                    return (this.shadowRoot ?? this).querySelector(sel);
                },
                configurable: true, enumerable: true,
            });
        };
    }
}

export default Directives;

// ── Top-level re-exports (barrel imports these by name). ──
export import Directive = Directives.Directive;
export type ComponentMeta        = Directives.ComponentMeta;
export type CustomDirectiveHooks = Directives.CustomDirectiveHooks;
export type Condition            = Directives.Condition;
export type ContentArg           = Directives.ContentArg;
export type ObjRenderFn          = Directives.ObjRenderFn;
export type RenderFn<T>          = Directives.RenderFn<T>;
export type UpdateFn             = Directives.UpdateFn;

// ── Top-level decorator re-exports (barrel imports these by name). ──
export const ComponentDecorator = Directives.ComponentDecorator;
export const Prop  = Directives.Prop;
export const Watch = Directives.Watch;
export const Emit  = Directives.Emit;
export const Ref   = Directives.Ref;
