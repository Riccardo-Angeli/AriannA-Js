/**
 * @module      core/Directives
 * @description AriannA declarative DOM directives, custom directive lifecycle, decorators and bootstrap runtime.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */
import { Events }     from '../reactivity/Events.ts';
import { Namespaces } from '../dom/Namespaces.ts';
import { Services }   from '../kernel/Services.ts';
import { Debug }      from '../kernel/Debug.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';
import { Reals } from '../dom/Real.ts';

/** @name        Directives
 *  @public
 *  @type        {namespace}
 *  @description Groups the Directives contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Directives
{
    /** @name        Condition
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Condition.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Condition       = Types.Directives.Condition;
    /** @name        Content
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Content.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Content         = Types.Directives.Content;
    /** @name        Render
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Render.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Render<T>       = Types.Directives.Render<T>;
    /** @name        ObjectRender
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ObjectRender.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ObjectRender    = Types.Directives.ObjectRender;
    /** @name        Update
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Update.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Update          = Types.Directives.Update;
    /** @name        Kind
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Kind.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Kind            = Types.Directives.Kind;
    /** @name        ComponentMeta
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ComponentMeta.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ComponentMeta   = Interfaces.Directives.ComponentMeta;
    /** @name        CustomDirectiveHooks
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for CustomDirectiveHooks.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type CustomDirectiveHooks = Interfaces.Directives.CustomDirectiveHooks;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract = Interfaces.Directives.Service;

    /** @class       Decorators
     *  @public
     *  @memberof    Directives
     *  @description Canonical decorator owner for component, property, watcher, emitter and reference decorators.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Decorators
    {
        static Component
        (
            arg0: ComponentMeta | string,
            style?: unknown,
            options?: { shadow?: 'open' | 'closed' | false; template?: string },
        )
        {
            // ── Normalize both call forms into a single ComponentMeta ──────────────
            let meta: ComponentMeta;
            if (typeof arg0 === 'string') {
                // Positional form: @Decorators.Component('tag', style, options)
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
                    shadow  : options?.shadow ?? 'open',
                };
            } else {
                // Object form: @Decorators.Component({ tag, template, style, shadow })
                meta = arg0;
            }

            const mode: ShadowRootMode =
                meta.shadow === 'open'
                    ? 'open'
                    : 'closed';

            const styleText =
                typeof meta.style === 'string'
                    ? meta.style
                    : '';

            const templateText =
                typeof meta.template === 'string'
                    ? meta.template
                    : '';

            return function <T extends typeof HTMLElement>(Base: T): T
            {
                // Legacy decorator compatibility, routed through AriannA's registry.
                // No customElements.define(): Decorators.Component registration belongs to Core/Namespace.
                const rendered = new WeakSet<HTMLElement>();
                const roots    = new WeakMap<HTMLElement, ShadowRoot>();
                const proto    = Base.prototype as unknown as {
                    connectedCallback?: () => void;
                    onConnected?: () => void;
                };
                const _connected   = proto.connectedCallback;
                const _onConnected = proto.onConnected;

                // Shared render: attach shadow (or light) and inject template + style.
                // Idempotent per element via the `rendered` WeakSet.
                const _render = function (this: HTMLElement) {
                    if (rendered.has(this)) return;
                    rendered.add(this);
                    if (meta.shadow !== false) {
                        const existing = this.shadowRoot ?? roots.get(this);
                        let root: ShadowRoot | null = existing ?? null;
                        if (!root) {
                            try { root = Reals.Real.AttachShadow(this, { mode }); }
                            catch { root = null; }
                        }
                        if (root) {
                            roots.set(this, root);
                            if (styleText)    { const s = Reals.Real.Create('style'); Reals.Real.Content(s, styleText); Reals.Real.Append(root, s); }
                            if (templateText) { const t = Reals.Real.CreateTemplate(); Reals.Real.Html(t, templateText); Reals.Real.Append(root, t.content.cloneNode(true)); }
                            return;
                        }
                        // attachShadow failed (non-capable tag): fall through to light DOM.
                    }
                    // Light DOM: inject style into <head> (scoped to the tag) + template
                    // into the element's own children.
                    if (styleText) {
                        const s = Reals.Real.Create('style');
                        Reals.Real.Content(s, styleText.replace(/:host/g, meta.tag));
                        Reals.Real.Append(document.head, s);
                    }
                    if (templateText && !this.children.length) Reals.Real.Html(this, templateText);
                };

                // AriannA owns the lifecycle through its Observer. Hook onConnected so
                // decorator components render through the same path as every other AriannA type.
                proto.onConnected = function onConnected(this: HTMLElement): void {
                    _render.call(this);
                    _onConnected?.call(this);
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

        static Prop()
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

        static Watch(propName: string)
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

        static Emit(eventName: string)
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

        static Ref(selector?: string)
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

    /** @name        Directive
     *  @public
     *  @type        {typeof Directive}
     *  @description Runtime class responsible for the Directive capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Directive
    {
        /** @name        Decorators
         *  @public
         *  @static
         *  @readonly
         *  @type        {typeof Decorators}
         *  @description Canonical TypeScript decorator surface owned by the Directive engine.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly Decorators = Decorators;

        static #resolve(condition: Condition): boolean
        {
            return typeof condition === 'function' ? condition() : Boolean(condition);
        }

        static #toNode(content: Content): Node | null
        {
            if (!content) return null;
            if (content instanceof Element || content instanceof DocumentFragment) return content;
            if (typeof content === 'string') {
                const t = Reals.Real.CreateTemplate();
                Reals.Real.Html(t, content);
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
         * @returns Directive.Update — call to re-evaluate
         *
         * @example
         *   const update = Directive.If(el, () => user.loggedIn, loginHtml, logoutHtml);
         *   // When condition changes:
         *   update();
         */
        static If
        (
            parent    : Element | string,
            condition : Condition,
            then_?    : Content,
            else_?    : Content,
        ): Update
        {
            const par    = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = Reals.Real.CreateComment(' a:if ');
            Reals.Real.Append(par, anchor);
            let current: Node | Node[] | null = null;

            function update(): void
            {
                const val = Directive.#resolve(condition);
                const src = val ? then_ : else_;

                // Remove current nodes
                if (current)
                {
                    if (Array.isArray(current))
                        current.forEach(n => { if (n.parentNode) Reals.Real.Remove(n); });
                    else if ((current as Node).parentNode)
                        Reals.Real.Remove(current as Node);
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
                        Reals.Real.Before(anchor.parentNode!, next, anchor);
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
         * @returns Directive.Update
         *
         * @example
         *   const update = Directive.For(ul, () => items, (item, i) =>
         *     `<li data-i="${i}">${item.name}</li>`);
         */
        static For<T>(
            parent   : Element | string,
            items    : T[] | (() => T[]),
            renderFn : Render<T>,
        ): Update
        {
            const par = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = Reals.Real.CreateComment(' a:for ');
            Reals.Real.Append(par, anchor);
            const rendered: Node[] = [];

            function update(): void
            {
                rendered.forEach(n => { if (n.parentNode) Reals.Real.Remove(n); });
                rendered.length = 0;
                const list = typeof items === 'function' ? items() : items;
                const frag = Reals.Real.CreateFragment();
                list.forEach((item, i) => {
                    const node = Directive.#toNode(renderFn(item, i) as Content);
                    if (node) { Reals.Real.Append(frag, node); rendered.push(node); }
                });
                Reals.Real.Before(anchor.parentNode!, frag, anchor);
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
         * @returns Directive.Update
         *
         * @example
         *   // Matches: <ol foreach="var planet in object">
         *   //            <li>{{ planet }} : {{ object[planet] }}</li>
         *   //          </ol>
         *   const update = Directive.Foreach(ol, () => planets, (key, value) =>
         *     `<li class="Value">${key} : ${value}</li>`);
         */
        static Foreach
        (
            parent   : Element | string,
            obj      : Record<string, unknown> | (() => Record<string, unknown>),
            renderFn : ObjectRender,
        ): Update
        {
            const par = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = Reals.Real.CreateComment(' a:foreach ');
            Reals.Real.Append(par, anchor);
            const rendered: Node[] = [];

            function update(): void
            {
                rendered.forEach(n => { if (n.parentNode) Reals.Real.Remove(n); });
                rendered.length = 0;
                const source = typeof obj === 'function' ? obj() : obj;
                const frag   = Reals.Real.CreateFragment();
                Object.entries(source).forEach(([key, value], i) => {
                    const node = Directive.#toNode(renderFn(key, value, i) as Content);
                    if (node) { Reals.Real.Append(frag, node); rendered.push(node); }
                });
                Reals.Real.Before(anchor.parentNode!, frag, anchor);
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
         * @returns Directive.Update
         *
         * @example
         *   let i = 0;
         *   const update = Directive.While(ul, () => i < 5, () => {
         *     const html = `<li>Item ${i}</li>`;
         *     i++;
         *     return html;
         *   });
         */
        static While
        (
            parent    : Element | string,
            condition : () => boolean,
            renderFn  : (iteration: number) => string | Element,
        ): Update
        {
            const par = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = Reals.Real.CreateComment(' a:while ');
            Reals.Real.Append(par, anchor);
            const rendered: Node[] = [];

            function update(): void
            {
                rendered.forEach(n => { if (n.parentNode) Reals.Real.Remove(n); });
                rendered.length = 0;
                const frag = Reals.Real.CreateFragment();
                let i = 0;
                const MAX = 10000;
                while (condition() && i < MAX)
                {
                    const node = Directive.#toNode(renderFn(i) as Content);
                    if (node) { Reals.Real.Append(frag, node); rendered.push(node); }
                    i++;
                }
                Reals.Real.Before(anchor.parentNode!, frag, anchor);
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
         * @returns Directive.Update
         *
         * @example
         *   const update = Directive.Switch(el, () => tab, {
         *     home    : '<div>Home</div>',
         *     about   : '<div>About</div>',
         *     default : '<div>404</div>',
         *   });
         */
        static Switch
        (
            parent : Element | string,
            value  : unknown | (() => unknown),
            cases  : Record<string, Content>,
        ): Update
        {
            const par    = Directive.#resolveParent(parent);
            if (!par) return () => {};
            const anchor = Reals.Real.CreateComment(' a:switch ');
            Reals.Real.Append(par, anchor);
            let current: Node | Node[] | null = null;

            function update(): void
            {
                const val = typeof value === 'function' ? value() : value;
                const src = cases[String(val)] ?? cases['default'] ?? null;

                if (current)
                {
                    if (Array.isArray(current))
                        current.forEach(n => { if (n.parentNode) Reals.Real.Remove(n); });
                    else if ((current as Node).parentNode)
                        Reals.Real.Remove(current as Node);
                    current = null;
                }

                if (src)
                {
                    const next = Directive.#toNode(src);
                    if (next)
                    {
                        const nodes = next.nodeType === 11
                            ? Array.from((next as DocumentFragment).childNodes) : [next];
                        Reals.Real.Before(anchor.parentNode!, next, anchor);
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
         * @returns Directive.Update
         *
         * @example
         *   const update = Directive.Bind(span, 'textContent', () => state.State.name);
         *   state.on('State-Changed', update);
         */
        static Bind
        (
            el     : Element,
            prop   : string,
            source : unknown | (() => unknown),
        ): Update
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
         * @returns Directive.Update
         *
         * @example
         *   const update = Directive.Show(panel, () => isVisible);
         *   state.on('State-Changed', update);
         */
        static Show
        (el: HTMLElement, condition: Condition): Update
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
         *   Directive.Model(nameInput, state, 'name');
         *   // nameInput.value ↔ state.State.name
         */
        static Model
        (
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
         *   Directive.On(btn, 'click', handler);
         *   Directive.On(form, 'submit', e => { e.preventDefault(); submit(); });
         */
        static On
        (
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
         *   Directive.Template(div, { example, literals });
         *   // <p>This is an EXAMPLE of Template LITERALS</p>
         *
         * @example
         *   // Nested path
         *   Directive.Template(el, { Level1A: { Level2A: 'Data Level2A Value' } });
         *   // {{ Level1A.Level2A }} → 'Data Level2A Value'
         */
        /** @name        Attribute
         *  @public
         *  @static
         *  @param       {Element} element Target element.
         *  @param       {string} name Attribute name.
         *  @param       {unknown} value Attribute value.
         *  @returns     {void}
         *  @description Canonical directive-owned attribute sink. Directives owns attribute semantics while Real
         *               remains the sole executor of the real-DOM mutation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Attribute
        (
            element : Element,
            name    : string,
            value   : unknown
        ): void
        {
            Reals.Real.Attribute
            (
                element,
                name,
                value === false || value == null
                    ? null
                    : value === true
                        ? ''
                        : String(value)
            );
        }

        static Template
        (el: Element, data?: Record<string, unknown>): void
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

            Reals.Real.Html(el, el.innerHTML.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr) => resolve(expr)));
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
         *   Directive.Bootstrap(document.body, { items, user, state });
         */
        static Bootstrap
        (
            root    : Element = document.body,
            context : Record<string, unknown> = {},
        ): void
        {
            const ctx = { ...(typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {}), ...context };

            function evalExpr(expr: string): unknown
            {
                /*
                 * CSP-safe directive expressions. Runtime code generation (`eval` / `new Function`)
                 * would require `script-src 'unsafe-eval'`, so Bootstrap intentionally evaluates the
                 * declarative subset directly. The grammar covers the expressions directives need:
                 * literals, identifiers, dot/bracket access, calls, unary/binary/logical operators
                 * and the conditional operator. Assignment and arbitrary statements are not accepted.
                 */
                type Token = { Kind: 'id' | 'number' | 'string' | 'op' | 'eof'; Value: string };

                const tokens: Token[] = [];
                let cursor = 0;

                while(cursor < expr.length)
                {
                    const ch = expr[cursor];
                    if(/\s/.test(ch)) { cursor++; continue; }

                    if(/[A-Za-z_$]/.test(ch))
                    {
                        const start = cursor++;
                        while(cursor < expr.length && /[A-Za-z0-9_$]/.test(expr[cursor])) cursor++;
                        tokens.push({ Kind: 'id', Value: expr.slice(start, cursor) });
                        continue;
                    }

                    if(/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expr[cursor + 1] ?? '')))
                    {
                        const start = cursor++;
                        while(cursor < expr.length && /[0-9A-Fa-f_xXbBoO.eE+-]/.test(expr[cursor]))
                        {
                            const c = expr[cursor];
                            if((c === '+' || c === '-') && !/[eE]/.test(expr[cursor - 1])) break;
                            cursor++;
                        }
                        tokens.push({ Kind: 'number', Value: expr.slice(start, cursor) });
                        continue;
                    }

                    if(ch === "'" || ch === '"' || ch === '`')
                    {
                        const quote = ch;
                        cursor++;
                        let value = '';
                        while(cursor < expr.length)
                        {
                            const c = expr[cursor++];
                            if(c === quote) break;
                            if(c === '\\' && cursor < expr.length)
                            {
                                const escaped = expr[cursor++];
                                value += escaped === 'n' ? '\n' : escaped === 'r' ? '\r' : escaped === 't' ? '\t' : escaped;
                            }
                            else value += c;
                        }
                        tokens.push({ Kind: 'string', Value: value });
                        continue;
                    }

                    const three = expr.slice(cursor, cursor + 3);
                    const two = expr.slice(cursor, cursor + 2);
                    if(['===', '!==', '>>>', '**='].includes(three))
                    {
                        tokens.push({ Kind: 'op', Value: three }); cursor += 3; continue;
                    }
                    if(['==', '!=', '<=', '>=', '&&', '||', '??', '**', '<<', '>>', '?.'].includes(two))
                    {
                        tokens.push({ Kind: 'op', Value: two }); cursor += 2; continue;
                    }
                    if('()[] .,+-*/%<>&|^!~?:'.includes(ch))
                    {
                        if(ch !== ' ') tokens.push({ Kind: 'op', Value: ch });
                        cursor++;
                        continue;
                    }

                    throw new SyntaxError(`Unsupported directive expression token: ${ch}`);
                }
                tokens.push({ Kind: 'eof', Value: '' });

                let position = 0;
                const peek = () => tokens[position];
                const take = (value?: string): Token =>
                {
                    const token = tokens[position];
                    if(value !== undefined && token.Value !== value) throw new SyntaxError(`Expected ${value}`);
                    position++;
                    return token;
                };

                const lookup = (name: string): unknown =>
                {
                    if(name === 'true') return true;
                    if(name === 'false') return false;
                    if(name === 'null') return null;
                    if(name === 'undefined') return undefined;
                    if(name === 'NaN') return NaN;
                    if(name === 'Infinity') return Infinity;
                    return ctx[name];
                };

                const member = (base: unknown, key: unknown): unknown =>
                    base == null ? undefined : (base as Record<PropertyKey, unknown>)[key as PropertyKey];

                const primary = (): unknown =>
                {
                    const token = peek();
                    let value: unknown;

                    if(token.Kind === 'number') { take(); value = Number(token.Value); }
                    else if(token.Kind === 'string') { take(); value = token.Value; }
                    else if(token.Kind === 'id') { take(); value = lookup(token.Value); }
                    else if(token.Value === '(') { take('('); value = conditional(); take(')'); }
                    else throw new SyntaxError(`Unexpected token ${token.Value}`);

                    while(true)
                    {
                        if(peek().Value === '.' || peek().Value === '?.')
                        {
                            const optional = take().Value === '?.';
                            const key = take();
                            if(key.Kind !== 'id') throw new SyntaxError('Expected property name');
                            value = optional && value == null ? undefined : member(value, key.Value);
                            continue;
                        }
                        if(peek().Value === '[')
                        {
                            take('['); const key = conditional(); take(']'); value = member(value, key); continue;
                        }
                        if(peek().Value === '(')
                        {
                            if(typeof value !== 'function') return undefined;
                            take('(');
                            const args: unknown[] = [];
                            if(peek().Value !== ')')
                            {
                                do { args.push(conditional()); if(peek().Value !== ',') break; take(','); } while(true);
                            }
                            take(')');
                            value = (value as (...args: unknown[]) => unknown)(...args);
                            continue;
                        }
                        break;
                    }
                    return value;
                };

                const unary = (): unknown =>
                {
                    const op = peek().Value;
                    if(op === '!' || op === '~' || op === '+' || op === '-')
                    {
                        take(); const value = unary();
                        if(op === '!') return !value;
                        if(op === '~') return ~Number(value);
                        if(op === '+') return +Number(value);
                        return -Number(value);
                    }
                    return primary();
                };

                const binary = (next: () => unknown, operators: readonly string[]): unknown =>
                {
                    let left = next();
                    while(operators.includes(peek().Value))
                    {
                        const op = take().Value;
                        const right = next();
                        switch(op)
                        {
                            case '**': left = Number(left) ** Number(right); break;
                            case '*': left = Number(left) * Number(right); break;
                            case '/': left = Number(left) / Number(right); break;
                            case '%': left = Number(left) % Number(right); break;
                            case '+': left = (typeof left === 'string' || typeof right === 'string') ? String(left) + String(right) : Number(left) + Number(right); break;
                            case '-': left = Number(left) - Number(right); break;
                            case '<<': left = Number(left) << Number(right); break;
                            case '>>': left = Number(left) >> Number(right); break;
                            case '>>>': left = Number(left) >>> Number(right); break;
                            case '<': left = (left as never) < (right as never); break;
                            case '<=': left = (left as never) <= (right as never); break;
                            case '>': left = (left as never) > (right as never); break;
                            case '>=': left = (left as never) >= (right as never); break;
                            case '==': left = left == right; break;
                            case '!=': left = left != right; break;
                            case '===': left = left === right; break;
                            case '!==': left = left !== right; break;
                            case '&': left = Number(left) & Number(right); break;
                            case '^': left = Number(left) ^ Number(right); break;
                            case '|': left = Number(left) | Number(right); break;
                        }
                    }
                    return left;
                };

                const exponent = () => binary(unary, ['**']);
                const multiply = () => binary(exponent, ['*', '/', '%']);
                const add = () => binary(multiply, ['+', '-']);
                const shift = () => binary(add, ['<<', '>>', '>>>']);
                const compare = () => binary(shift, ['<', '<=', '>', '>=']);
                const equality = () => binary(compare, ['==', '!=', '===', '!==']);
                const bitAnd = () => binary(equality, ['&']);
                const bitXor = () => binary(bitAnd, ['^']);
                const bitOr = () => binary(bitXor, ['|']);
                const logicalAnd = (): unknown => { let v = bitOr(); while(peek().Value === '&&') { take(); const r = bitOr(); v = v && r; } return v; };
                const logicalOr = (): unknown => { let v = logicalAnd(); while(peek().Value === '||') { take(); const r = logicalAnd(); v = v || r; } return v; };
                const nullish = (): unknown => { let v = logicalOr(); while(peek().Value === '??') { take(); const r = logicalOr(); v = v ?? r; } return v; };
                const conditional = (): unknown =>
                {
                    const test = nullish();
                    if(peek().Value !== '?') return test;
                    take('?'); const yes = conditional(); take(':'); const no = conditional();
                    return test ? yes : no;
                };

                try
                {
                    const result = conditional();
                    if(peek().Kind !== 'eof') throw new SyntaxError(`Unexpected token ${peek().Value}`);
                    return result;
                }
                catch(error)
                {
                    Debug.warn
                    (
                        'DIRECTIVE_EXPRESSION',
                        { Expression: expr, Error: error }
                    );
                    return undefined;
                }
            }

            // Process {{ }} template literals on all text nodes
            root.querySelectorAll('[a-template],[data-template]').forEach(el => {
                Directive.Template(el, ctx);
            });

            // a-if
            root.querySelectorAll('[a-if]').forEach(el => {
                const expr = el.getAttribute('a-if') ?? 'false';
                Directive.If(el.parentElement ?? root, () => Boolean(evalExpr(expr)), el as Element);
            });

            // a-show
            root.querySelectorAll('[a-show]').forEach(el => {
                const expr = el.getAttribute('a-show') ?? 'false';
                Directive.Show(el as HTMLElement, () => Boolean(evalExpr(expr)));
            });

            // a-model
            root.querySelectorAll('[a-model]').forEach(el => {
                const path = el.getAttribute('a-model') ?? '';
                const [stateKey, propKey] = path.split('.');
                const state = ctx[stateKey] as { State: Record<string, unknown>; on(t: string, cb: (e: unknown) => void): void };
                if (state && propKey) Directive.Model(el as HTMLInputElement, state, propKey);
            });

            // a-on
            root.querySelectorAll('[a-on]').forEach(el => {
                const spec = el.getAttribute('a-on') ?? '';
                const [type, fnName] = spec.split(':').map(s => s.trim());
                if (type && fnName)
                {
                    const handler = ctx[fnName];
                    if (typeof handler === 'function')
                        Directive.On(el, type, handler as EventListener);
                }
            });

            // a-bind
            root.querySelectorAll('[a-bind]').forEach(el => {
                const spec = el.getAttribute('a-bind') ?? '';
                const [prop, expr] = spec.split(':').map(s => s.trim());
                if (prop && expr) Directive.Bind(el, prop, () => evalExpr(expr));
            });
        }

        // ────────────────────────────────────────────────────────────────────────────
        // Instance API + custom directive registry
        //
        // In addition to the static helpers above, Directive can be instantiated to
        // create reusable, named directive behaviors with optional `mounted` and
        // `unmounted` lifecycle hooks. Both styles are supported in parallel:
        //
        //   1. Static one-shot:        Directive.If(el, () => x)
        //   2. Static custom register: Directive.Register('tooltip', { mounted, unmounted });
        //                              Directive.Apply('tooltip', el, 'Hello!');
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
        readonly hooks: CustomDirectiveHooks;

        /** Map of element → user-supplied value, for unmount cleanup. */
        #bindings = new WeakMap<Element, unknown>();

        /**
         * Create a custom, named directive that auto-registers itself in the global
         * registry, so both `inst.apply(...)` and `Directive.Apply(name, ...)` work.
         *
         * @param name  Unique directive name (e.g. 'tooltip', 'autosize').
         * @param hooks Lifecycle hooks. Both are optional but at least one is
         *              recommended; `mounted` is called on apply, `unmounted` on
         *              `unmount(el)` or `Directive.Unmount(name, el)`.
         *
         * @example
         *   const tooltip = new Directive('tooltip', {
         *       mounted(el, value) { el.setAttribute('title', String(value)); },
         *       unmounted(el)      { el.removeAttribute('title'); },
         *   });
         *   tooltip.apply(buttonEl, 'Click to submit');
         */
        constructor(name: string, hooks: CustomDirectiveHooks)
        {
            this.name  = name;
            this.hooks = hooks;
            Directive.#registry.set(name, this);
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
            this.hooks.unmounted?.(el);
            return true;
        }

        // ── Static registry ────────────────────────────────────────────────────────

        /** @internal */
        static #registry = new Map<string, Directive>();

        /**
         * Register a custom directive in the global registry. Equivalent to
         * `new Directive(name, hooks)` but reads more declaratively when you
         * don't need to keep the instance handle around.
         *
         * @returns The created Directive instance, in case you want it.
         *
         * @example
         *   Directive.Register('autofocus', {
         *       mounted(el) { (el as HTMLElement).focus(); },
         *   });
         */
        static Register
        (name: string, hooks: CustomDirectiveHooks): Directive
        {
            return new Directive(name, hooks);
        }

        /**
         * Look up a registered custom directive by name and apply it to `el`.
         * Returns the Directive instance, or `undefined` if no directive with that
         * name was registered.
         *
         * @example
         *   Directive.Register('tooltip', { mounted(el, v) { ... } });
         *   Directive.Apply('tooltip', someElement, 'Hello!');
         */
        static Apply
        (name: string, el: Element, value: unknown = undefined): Directive | undefined
        {
            const inst = Directive.#registry.get(name);
            if (!inst) return undefined;
            return inst.apply(el, value);
        }

        /** Run the unmount hook of a registered directive on an element. */
        static Unmount
        (name: string, el: Element): boolean
        {
            const inst = Directive.#registry.get(name);
            if (!inst) return false;
            return inst.unmount(el);
        }

        /** Look up a registered Directive instance by name. */
        static Get
        (name: string): Directive | undefined
        {
            return Directive.#registry.get(name);
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

    /** @name        Service
     *  @private
     *  @constant
     *  @type        {Services.Service<ServiceContract>}
     *  @description Registers the canonical Directives service while the complete implementation remains owned by
     *               `Directive` and `Decorators`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'directives',
        {
            Attribute
            (
                element : Element,
                name    : string,
                value   : unknown
            ): void
            {
                Directive.Attribute(element, name, value);
            },

            Create
            (
                name  : string,
                apply : (element: Element, value: unknown, options?: Interfaces.Directives.Options) => () => void
            ): Directive
            {
                const cleanups =
                    new WeakMap<Element, () => void>();

                return Directive.Register
                (
                    name,
                    {
                        mounted
                        (
                            element : Element,
                            value   : unknown
                        ): void
                        {
                            cleanups.get(element)?.();
                            cleanups.set(element, apply(element, value));
                        },

                        unmounted(element: Element): void
                        {
                            cleanups.get(element)?.();
                            cleanups.delete(element);
                        }
                    }
                );
            },

            Bootstrap
            (
                root?    : ParentNode,
                options? : Interfaces.Directives.Options
            ): () => void
            {
                const target =
                    root instanceof Element
                        ? root
                        : document.body;

                Directive.Bootstrap
                (
                    target,
                    options?.Scope ?? {}
                );

                return () => undefined;
            }
        }
    );
}

export default Directives;
