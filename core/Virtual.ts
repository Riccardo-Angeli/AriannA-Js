/**
 * @module    core/Virtual
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Virtual — AriannA Virtual Node. ♡ Arianna.
 *
 * A `Virtual` is the framework-side representation of an Element or Text
 * Node in the AriannA virtual tree. Every Virtual is described by the
 * following canonical shape (the "virtualNode descriptor", v2):
 *
 *     const virtualNode =
 *     {
 *         Root       : <Virtual>,        - Root of the Application this node belongs to.
 *         Id         : <UUID>,           - Unique identifier for this virtualNode.
 *         Type       : <Element|Text>,   - nodeType (1 = Element, 3 = Text).
 *         Parent     : <Virtual>,        - Parent virtualNode (null at Root).
 *         Tag        : <String>,         - Registered DOM tag name.
 *         Text       : <String>,         - innerText / textContent buffer.
 *         Attributes : <Array>,          - Key/value pairs of attributes.
 *         Children   : <Array<Virtual>>, - Ordered child virtualNodes.
 *         Siblings   : <Array<Virtual>>, - Sibling virtualNodes (same Parent).
 *         Events     : <Array>,          - Events Descriptors (See Events.ts).
 *         State      : <Object>,         - Current state snapshot.
 *         States     : <Object>,         - Named state variants (state machine).
 *         Descriptor : <Object>,         - Type descriptor (Core.GetDescriptor).
 *         Created    : <Boolean>,        - Constructor ran.
 *         Connected  : <Boolean>,        - Linked into the virtual tree.
 *         Mounted    : <Boolean>,        - Attached to a real DOM parent.
 *         Loaded     : <Boolean>,        - Document load complete for this node.
 *         Rendered   : <Boolean>,        - render() emitted a Real DOM Element.
 *         Dirty      : <Boolean>,        - Virtual differs from Real.
 *         Changes    : <Object>,         - Pending diff to apply on next flush.
 *         Depth      : <Number>,         - Distance from Root.
 *         Breadth    : <Number>,         - Index within Parent.Children.
 *         Real       : <Real|Element>,   - Live DOM element (lazy).
 *         Style      : <Object>,         - Effective inline CSS style.
 *         Path       : <String>,         - AriannA-Server-Routes-JS path.
 *         History    : <Object>          - Past states reached by this node.
 *     };
 *
 * Two construction modes are supported:
 *
 *     new Virtual('div', { class: 'hero' }, child1, child2);   // tag, attrs, children
 *     new Virtual({ Tag: 'div', Attributes: {...}, ... });     // { Tag?: string; Text?: string; Attributes?: Record<string, string | number | boolean | null>; Children?: (Virtual | string | number | boolean | null | undefined)[]; Root?: Element | null; Parent?: Virtual | null } object
 *     new Virtual(Template);                             // pre-cloned template
 *
 * Render is lazy: `render()` materialises into a real DOM Element on demand.
 * Sinks queued before render are flushed at render time; effects queued
 * after are wired immediately. Mount/unmount manages DOM parentage.
 */
import { Core }        from './Core.ts';
import { Namespaces }  from './Namespaces.ts';
import { Events }      from './Events.ts';
import { Reactivity }  from './Reactive.ts';
import { Templates   } from './Template.ts';
import { Css }         from './Css.ts';
import { Services }    from './Service.ts';
import { Reals }       from './Real.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

export namespace Virtuals
{
    export type NodeType          = SchemaTypes.Virtuals.NodeType;
    export type Target            = SchemaTypes.Virtuals.Target;
    export type Child             = SchemaTypes.Virtuals.Child;
    export type Attributes        = SchemaTypes.DOM.Attributes;
    export type Definition        = SchemaInterfaces.Virtuals.Definition;
    export type ServiceContract   = SchemaInterfaces.Virtuals.Service;
    export type Signal<T>         = Reactivity.Signal<T>;
    export type SignalMono<T>     = Reactivity.Mono<T>;
    export type ReadonlySignal<T> = Reactivity.ReadonlySignal<T>;
    export type Rule              = Css.Rule;
    export type Stylesheet        = Css.Stylesheet;
    export type SchemaType        = SchemaInterfaces.Namespaces.Type;

    /**
     * `Virtual` — framework-side representation of an Element or Text Node
     * in the AriannA virtual tree. See file header for the canonical descriptor
     * shape (Root, Id, Type, Parent, Tag, ...).
     *
     * Lifecycle:
     *
     *      new Virtual('div', { class: 'hero' })   →  Created
     *      vn.append(parent)                            →  Connected + Mounted + Rendered
     *      vn.unmount()                                 →  Mounted = false
     *      vn.destroy()                                 →  effects disposed, sheet cleared
     *
     * Render is lazy and idempotent. Sinks queued before render are flushed at
     * render time; effects queued after run immediately.
     */
    export class Virtual
    {
        /** Monotonic Id counter (hard-private; only _uid mutates it). */
        static #counter = 0;
        /** Registry of VirtualNodes by Id (for tools/inspector). */
        static #nodes: Record<string, WeakRef<Virtual>> = {};

        /** Best-effort GC cleanup; explicit destroy remains the deterministic path. */
        static #cleaner:
            FinalizationRegistry<string> | null =
                typeof FinalizationRegistry === 'function'
                    ? new FinalizationRegistry<string>
                      (
                          id =>
                          {
                              delete Virtual.#nodes[id];
                          }
                      )
                    : null;

        /** Register one instance without retaining it strongly. */
        static #Register(virtual: Virtual): void
        {
            Virtual.#nodes[virtual.#id] =
                new WeakRef(virtual);

            Virtual.#cleaner?.register
            (
                virtual,
                virtual.#id,
                virtual
            );

            if(Core.AriannA.Configuration?.debug)
            {
                Virtual.Instances.push(virtual);
            }
        }

        /** Remove one instance from every deterministic registry. */
        static #Unregister(virtual: Virtual): void
        {
            delete Virtual.#nodes[virtual.#id];
            Virtual.#cleaner?.unregister(virtual);

            const index =
                Virtual.Instances.indexOf(virtual);

            if(index >= 0)
            {
                Virtual.Instances.splice(index, 1);
            }
        }

        /** Read-only view of the node registry, for tools/inspector. */
        static get Nodes(): Readonly<Record<string, Virtual>>
        {
            const active: Record<string, Virtual> = {};
            for (const [id, ref] of Object.entries(Virtual.#nodes)) {
                const node = ref.deref();
                if (node) active[id] = node;
                else delete Virtual.#nodes[id]; // Pulizia di backup nel caso il GC sia in ritardo
            }
            return active;
        }

        /** Mint a fresh, collision-resistant Id for a new Virtual. */
        static #Uid(): string { return `vn-${++Virtual.#counter}-${Math.random().toString(36).slice(2, 6)}`; }

        /** Coerce a value-or-getter into a getter (binding methods accept both forms). */
        static #AsGetter<T>(g: (() => T) | T): (() => T) { return typeof g === 'function' ? (g as (() => T)) : () => g; }

        /** Coerce a (Virtual | string | number | boolean | null | undefined) into a Virtual: nodes pass through; primitives/null wrap in a span. */
        static #NormalizeChild(child: Child): Virtual
        {
            if(child instanceof Virtual)
            {
                return child;
            }

            const virtual =
                new Virtual('span');

            virtual.set
            (
                'textContent',
                child === null || child === undefined
                    ? ''
                    : String(child)
            );

            return virtual;
        }

        /** @name        #AttributesFrom
         *  @private
         *  @static
         *  @param       {Element} element Source element.
         *  @returns     {Attributes} Plain attributes snapshot.
         *  @description Convert a live Element's attributes into the canonical Virtual attribute bag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #AttributesFrom(element: Element): Attributes
        {
            return Object.fromEntries
            (
                Array.from(element.attributes).map
                (
                    attribute =>
                        [attribute.name, attribute.value]
                )
            );
        }

        /** @name        #ChildrenFrom
         *  @private
         *  @static
         *  @param       {ParentNode} parent Source parent.
         *  @returns     {Virtual[]} Normalised Virtual children.
         *  @description Convert element and text child nodes into Virtual children while ignoring unsupported
         *               node kinds such as comments.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #ChildrenFrom(parent: ParentNode): Virtual[]
        {
            const children: Virtual[] = [];

            for(const node of Array.from(parent.childNodes))
            {
                if(node instanceof Element)
                {
                    children.push(new Virtual(node));
                }
                else if(node.nodeType === Node.TEXT_NODE)
                {
                    const value =
                        node.textContent ?? '';

                    if(value.length > 0)
                    {
                        children.push(Virtual.#NormalizeChild(value));
                    }
                }
            }

            return children;
        }


        /* ─── Private fields ────────────────────────────────────────────────── */

        #id          : string;
        #tag         : string;
        #attrs       : Record<string, string | number | boolean | null>;
        #children    : Virtual[];
        #text        : string;
        #dom         : Element | null = null;
        #parent      : Virtual | null = null;

        /** Lifecycle flags — track virtualNode state transitions. */
        #created     = true;
        #connected   = false;
        #mounted     = false;
        /** Deferred-mount closure from a Jsx.ts Snabbdom vnode / React element. */
        #deferredMount:
            ((container: Element) => Node | undefined) | null =
                null;

        /** Optional lifecycle callback supplied by a deferred renderer. */
        #deferredUnmount:
            (() => void) | null =
                null;

        /** Node returned by the deferred renderer, when one is available. */
        #deferredNode:
            Node | null =
                null;

        #loaded      = false;
        #rendered    = false;

        /** Pending DOM-event listeners, flushed at render() time. */
        #domQueue    : { type: string; cb: EventListener; opts?: AddEventListenerOptions | boolean }[] = [];

        /** Active effect-disposer functions, called on destroy(). */
        #effects     : Array<() => void> = [];

        /** Reactive sinks queued pre-render, flushed by #applySinks(). */
        #sinks       : { type: 'text' | 'textMono' | 'attr' | 'cls' | 'prop' | 'style' | 'bind' | 'shadow'; getter: (() => unknown); setter?: (v: string) => void; name?: string; mono?: SignalMono<string>; node?: Text; shadowMode?: 'open' | 'closed'; shadowOpts?: Record<string, unknown> }[] = [];

        /** Wired event-listener records (Events facet of the descriptor). */
        #events      : Array<{ type: string; cb: EventListener; opts?: AddEventListenerOptions | boolean }> = [];

        /** Per-instance scoped Stylesheet, if any. */
        #sheet       : Stylesheet | null = null;
        #styleNode   : HTMLStyleElement | null = null;
        #instanceId  : string = '';
        #sheetSync   : (() => void) | null = null;

        /** Lazy Real-facade companion (constructed on first .Real access). */
        #real        : Reals.Real | null = null;

        /** State machine: current state and the set of named state variants. */
        #state       : Record<string, unknown> = {};
        #states      : Record<string, Record<string, unknown>> = {};

        /** History of past state snapshots reached by this node. */
        #history     : Array<{ at: number; state: Record<string, unknown> }> = [];

        /** Pending changes diff (Virtual differs from Real). */
        #changes     : Record<string, unknown> = {};

        /** Cached path from the Root, refreshed on parent change. */
        #path        : string | null = null;


        // ─── Static — global instance registry ───────────────────────────────

        /**
         * Debug-only strong instance registry for inspector tools and bulk
         * operations. Production instances are tracked only through WeakRef.
         * Explicit destroy removes debug entries deterministically.
         */
        static readonly Instances: Virtual[] = [];


        // ─── Constructor ─────────────────────────────────────────────────────

        /**
         * Construct a new Virtual.
         *
         * Three overloads, dispatched on the type of the first argument:
         *
         *   new Virtual('div', { class: 'hero' }, child1, child2);
         *       — tag, attrs, ...children (legacy / convenience form)
         *
         *   new Virtual({ Tag: 'div', Attributes: {...}, Children: [...] });
         *       — full descriptor form
         *
         *   new Virtual(new Template('<div/>'));
         *       — clone from a pre-parsed template (zero rebuild cost)
         */
        constructor
        (
            def         : Target,
            attrs?      : Attributes,
            ...children : Child[]
        )
        {
// ── Deferred-mount path (Jsx.ts Snabbdom vnode / React element) ──────
            if
            (
                def &&
                typeof def === 'object' &&
                typeof (def as { __ariannaMount?: unknown }).__ariannaMount === 'function'
            )
            {
                const deferred =
                    def as
                    {
                        __ariannaMount(container: Element): Node | undefined;
                        __ariannaUnmount?(): void;
                    };

                this.#deferredMount =
                    deferred.__ariannaMount;

                this.#deferredUnmount =
                    typeof deferred.__ariannaUnmount === 'function'
                        ? deferred.__ariannaUnmount
                        : null;

                this.#tag      = 'div';
                this.#attrs    = {};
                this.#children = [];
                this.#text     = '';
                this.#id       = Virtual.#Uid();

                Virtual.#Register(this);

                return;
            }

            // ── AriannA Template clone path ────────────────────────────────────
            if(def instanceof Templates.Template)
            {
                const fragment =
                    def.Node.content.cloneNode(true) as DocumentFragment;

                const element =
                    fragment.firstElementChild;

                if(element)
                {
                    this.#tag      = element.tagName.toLowerCase();
                    this.#attrs    = Virtual.#AttributesFrom(element);
                    this.#children = Virtual.#ChildrenFrom(element);
                    this.#text     = this.#children.length === 0
                        ? element.textContent ?? ''
                        : '';
                    this.#dom      = element;
                }
                else
                {
                    const host =
                        document.createElement('div');

                    host.appendChild(fragment);

                    this.#tag      = 'div';
                    this.#attrs    = {};
                    this.#children = Virtual.#ChildrenFrom(host);
                    this.#text     = this.#children.length === 0
                        ? host.textContent ?? ''
                        : '';
                    this.#dom      = host;
                }

                this.#id       = Virtual.#Uid();
                this.#rendered = true;

                Virtual.#Register(this);

                for(const child of this.#children)
                {
                    child.#parent = this;
                }

                return;
            }

            // ── String / tag-name path ─────────────────────────────────────────
            if(typeof def === 'string')
            {
                this.#tag      = def.toLowerCase();
                this.#attrs    = { ...(attrs ?? {}) };
                this.#children = children.map(Virtual.#NormalizeChild);
                this.#text     = '';
            }
            // ── Existing Virtual clone path ─────────────────────────────────────
            else if(def instanceof Virtual)
            {
                this.#tag      = def.Tag;
                this.#attrs    = { ...def.Attributes };
                this.#children = def.Children.map
                (
                    child =>
                        Virtual.Create
                        (
                            {
                                Tag        : child.Tag,
                                Text       : child.Text,
                                Attributes : child.Attributes,
                                Children   : child.Children
                            }
                        )
                );
                this.#text     = def.Text;
                this.#parent   = null;
            }
            // ── Real facade path ────────────────────────────────────────────────
            else if(def instanceof Reals.Real)
            {
                const element =
                    def.render();

                this.#tag      = element.tagName.toLowerCase();
                this.#attrs    = Virtual.#AttributesFrom(element);
                this.#children = Virtual.#ChildrenFrom(element);
                this.#text     = this.#children.length === 0
                    ? element.textContent ?? ''
                    : '';
                this.#dom      = element;
                this.#rendered = true;
            }
            // ── Native HTMLTemplateElement path ─────────────────────────────────
            else if(def instanceof HTMLTemplateElement)
            {
                const fragment =
                    def.content.cloneNode(true) as DocumentFragment;

                const element =
                    fragment.firstElementChild;

                if(element)
                {
                    this.#tag      = element.tagName.toLowerCase();
                    this.#attrs    = Virtual.#AttributesFrom(element);
                    this.#children = Virtual.#ChildrenFrom(element);
                    this.#text     = this.#children.length === 0
                        ? element.textContent ?? ''
                        : '';
                    this.#dom      = element;
                    this.#rendered = true;
                }
                else
                {
                    this.#tag      = 'div';
                    this.#attrs    = {};
                    this.#children = Virtual.#ChildrenFrom(fragment);
                    this.#text     = fragment.textContent ?? '';
                }
            }
            // ── Native Element path ─────────────────────────────────────────────
            else if(def instanceof Element)
            {
                this.#tag      = def.tagName.toLowerCase();
                this.#attrs    = Virtual.#AttributesFrom(def);
                this.#children = Virtual.#ChildrenFrom(def);
                this.#text     = this.#children.length === 0
                    ? def.textContent ?? ''
                    : '';
                this.#dom      = def;
                this.#rendered = true;
            }
            // ── Generic native Node path ────────────────────────────────────────
            else if(def instanceof Node)
            {
                this.#tag      = 'span';
                this.#attrs    = {};
                this.#children = [];
                this.#text     = def.textContent ?? '';
            }
            // ── Canonical Definition object path ────────────────────────────────
            else if(Virtual.#IsDefinition(def))
            {
                this.#tag      = (def.Tag ?? 'div').toLowerCase();
                this.#attrs    = { ...(def.Attributes ?? {}) };
                this.#children = (def.Children ?? []).map(Virtual.#NormalizeChild);
                this.#text     = def.Text ?? '';
                this.#parent   = def.Parent ?? null;
            }
            else
            {
                throw new TypeError
                (
                    '[arianna] Virtual target is not a supported tag, Template, Virtual, Real, DOM Node, ' +
                    'Definition, or deferred mount.'
                );
            }

            this.#id = Virtual.#Uid();

            Virtual.#Register(this);

            // Establish parent-child relationship for children passed via
            // either form — the children must know who their Parent is, so
            // that .Siblings / .Depth / .Breadth / .Path resolve correctly.
            for (const c of this.#children) c.#parent = this;
        }

        /** @name        #IsDefinition
         *  @private
         *  @static
         *  @param       {Target} value Candidate target.
         *  @returns     {value is Definition} Whether the value is a canonical plain Definition.
         *  @description Exclude every nominal runtime target and deferred mount so the constructor's final object
         *               branch is narrowed safely to `Definition`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #IsDefinition(value: Target): value is Definition
        {
            return Boolean
            (
                value &&
                typeof value === 'object' &&
                !(value instanceof Virtual) &&
                !(value instanceof Templates.Template) &&
                !(value instanceof Reals.Real) &&
                !(value instanceof Node) &&
                !('__ariannaMount' in value)
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        //  Descriptor facet — Root / Id / Type / Parent / Tag / Text / ...
        //
        //  Read-only getters that expose the canonical descriptor shape. The
        //  source of truth remains the private fields above; these getters are
        //  the public surface for tooling, inspection, and serialisation.
        // ─────────────────────────────────────────────────────────────────────

        /** Root Virtual of this subtree (walks up via Parent until null). */
        get Root(): Virtual
        {
            let cur: Virtual = this;
            while (cur.#parent) cur = cur.#parent;
            return cur;
        }

        /** Unique identifier minted at construction time. */
        get Id(): string { return this.#id; }

        /** DOM nodeType: 1 for Element, 3 for Text (we approximate by tag). */
        get Type(): number
        {
            // Text-only VirtualNodes are not represented in v1; every node is an
            // Element. Reserved for future Text-node specialisation.
            return 1;
        }

        /** Parent Virtual (null at the Root). */
        get Parent(): Virtual | null { return this.#parent; }

        /** Registered DOM tag name. */
        get Tag(): string { return this.#tag; }

        /** Text content (innerText). Mirrored to DOM on render. */
        get Text(): string
        {
            if (this.#dom) return this.#dom.textContent ?? '';
            return this.#text;
        }

        /** Attribute key/value pairs, plain-object form. */
        get Attributes(): Record<string, string | number | boolean | null> { return { ...this.#attrs }; }

        /** Child VirtualNodes, in declared order. */
        get Children(): Virtual[] { return this.#children.slice(); }

        /**
         * Sibling VirtualNodes — every node sharing this Parent, excluding
         * `this`. Computed; mutation does not affect ordering.
         */
        get Siblings(): Virtual[]
        {
            if (!this.#parent) return [];
            return this.#parent.#children.filter(c => c !== this);
        }

        /** Wired event listeners (descriptor facet of `.on()` calls). */
        get Events(): ReadonlyArray<{ type: string; cb: EventListener; opts?: AddEventListenerOptions | boolean }>
        {
            return this.#events.slice();
        }

        /** Current state snapshot. */
        get State(): Record<string, unknown> { return { ...this.#state }; }

        /** Named state variants registered for this node (state machine). */
        get States(): Record<string, Record<string, unknown>>
        {
            return Object.fromEntries(
                Object.entries(this.#states).map(([k, v]) => [k, { ...v }]),
            );
        }

        /** Type descriptor (Core.GetDescriptor) for this node's tag, if any. */
        get Descriptor(): SchemaType | false { return Namespaces.Namespace.Resolve(this.#tag); }

        /** True if the constructor has run (always true once an instance exists). */
        get Created(): boolean { return this.#created; }

        /** True if this node is linked into the virtual tree (has a Parent). */
        get Connected(): boolean { return this.#connected || !!this.#parent; }

        /** True if the rendered Real element is attached to a DOM parent. */
        get Mounted(): boolean { return this.#mounted; }

        /** True after `document.readyState === 'complete'` for this subtree. */
        get Loaded(): boolean { return this.#loaded; }

        /** True if `render()` has produced a Real Element. */
        get Rendered(): boolean { return this.#rendered; }

        /** True if the virtual representation differs from the rendered Real. */
        get Dirty(): boolean { return Object.keys(this.#changes).length > 0; }

        /** Pending diff to apply on next flush. */
        get Changes(): Record<string, unknown> { return { ...this.#changes }; }

        /** Distance from the Root, in tree levels (Root is depth 0). */
        get Depth(): number
        {
            let d   = 0;
            let cur = this.#parent;
            while (cur) { d++; cur = cur.#parent; }
            return d;
        }

        /** Index of this node within its Parent's Children (Root is 0). */
        get Breadth(): number
        {
            if (!this.#parent) return 0;
            return this.#parent.#children.indexOf(this);
        }

        /** Effective inline CSS style object (snapshot of element.style). */
        get Style(): Record<string, string>
        {
            if (!this.#dom) return {};
            const out: Record<string, string> = {};
            const s = (this.#dom as HTMLElement).style;
            for (let i = 0; i < s.length; i++)
            {
                const prop = s.item(i);
                out[prop] = s.getPropertyValue(prop);
            }
            return out;
        }

        /**
         * AriannA-Server-Routes-Javascript path from Root to this node.
         * Format: `Root[breadth1][breadth2]...[breadthN]`, breadth at each
         * level being the index in the parent's Children array.
         */
        get Path(): string
        {
            if (this.#path !== null) return this.#path;
            const segments: number[] = [];
            let cur: Virtual | null = this;
            while (cur && cur.#parent)
            {
                segments.unshift(cur.Breadth);
                cur = cur.#parent;
            }
            this.#path = segments.length === 0
                ? 'Root'
                : 'Root' + segments.map(s => `[${s}]`).join('');
            return this.#path;
        }

        /** History of past state snapshots, oldest first. */
        get History(): ReadonlyArray<{ at: number; state: Record<string, unknown> }>
        {
            return this.#history.slice();
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Render — materialise into a real DOM Element
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Produce the corresponding real DOM Element. Lazy: subsequent calls
         * return the same element. After render():
         *
         *   - attribute buffer is flushed to setAttribute()
         *   - text buffer is flushed to textContent
         *   - children are recursively rendered and appended
         *   - reactive sinks are bound (#applySinks)
         *   - queued event listeners are wired
         *
         * Honors registered namespaces: if `Core.GetDescriptor(tag)` exposes a
         * `Namespace.functions.create`, that factory is used (so the element
         * is fully upgraded: prototype splice, default style, body for
         * FUNCTION form, Reflect.construct for CLASS form).
         */
        render(): Element
        {
            if (this.#dom) return this.#dom;

            const d = Namespaces.Namespace.Resolve(this.#tag) as (SchemaType & {
                Namespace?: { functions?: { create?(tag: string): Element | false } };
            }) | false;

            // FIX: source the element from Core.Create — the SINGLE upgrade entry
            // point (the same one Real uses) — so a custom tag is materialised
            // ALREADY UPGRADED (prototype spliced + Namespace.Update run), instead of
            // a bare createElement / functions.create that skips the upgrade and
            // leaves the node as HTMLUnknownElement. Falls back to createElement for
            // unknown / native tags.
            this.#dom = (d && (d as { Custom?: boolean }).Custom && typeof Namespaces.Namespace.Create === 'function')
                ? ((Namespaces.Namespace.Create(this.#tag) as Element) ?? document.createElement(this.#tag))
                : document.createElement(this.#tag);

            // Flush attribute buffer
            for (const [k, v] of Object.entries(this.#attrs))
            {
                if (v !== null) this.#dom.setAttribute(k, String(v));
            }

            // Flush text buffer
            if (this.#text) this.#dom.textContent = this.#text;

            // Recursively render children and append
            for (const child of this.#children)
            {
                this.#dom.appendChild(child.render());
            }

            // Bind reactive sinks
            this.#applySinks();

            // Wire queued event listeners
            for (const { type, cb, opts } of this.#domQueue)
            {
                Events.Event.On(this.#dom, type, cb, typeof opts === 'boolean' ? { capture: opts } : opts);
                this.#events.push({ type, cb, opts });
            }
            this.#domQueue = [];

            this.#rendered  = true;
            this.#mounted   = true;
            this.#connected = true;

            return this.#dom;
        }

        /**
         * Bind every queued reactive sink to the rendered DOM. Called by
         * `render()` once `#dom` is available. Each sink kind:
         *
         *   text     — appended Text node, updated by an effect
         *   textMono — appended Text node, fast-path sinkText
         *   attr     — setAttribute / removeAttribute on getter change
         *   cls      — classList.add/remove on boolean getter
         *   prop     — direct property write on the element
         *   style    — element.style.setProperty (kebab-cased)
         *   bind     — .prop('value') + 'input' listener
         *   shadow   — one-shot box-shadow assignment
         */
        #applySinks(): void
        {
            if (!this.#dom) return;

            for (const sink of this.#sinks)
            {
                switch (sink.type)
                {
                    case 'text':
                    {
                        const node = document.createTextNode(
                            String((sink.getter as (() => string))()),
                        );
                        this.#dom.appendChild(node);
                        this.#effects.push(Virtual.effect(() => {
                            node.nodeValue = (sink.getter as (() => string))();
                        }));
                        break;
                    }
                    case 'textMono':
                    {
                        const node = sink.node ?? document.createTextNode(sink.mono!.Peek());
                        if (!sink.node) this.#dom.appendChild(node);
                        sink.mono!.BindText(node);
                        break;
                    }
                    case 'attr':
                    {
                        const el = this.#dom;
                        this.#effects.push(Virtual.effect(() => {
                            const v = (sink.getter as (() => string | null))();
                            if (v === null) el.removeAttribute(sink.name!);
                            else            el.setAttribute(sink.name!, v);
                        }));
                        break;
                    }
                    case 'cls':
                    {
                        const el = this.#dom;
                        this.#effects.push(Virtual.effect(() => {
                            if ((sink.getter as (() => boolean))()) el.classList.add(sink.name!);
                            else                                    el.classList.remove(sink.name!);
                        }));
                        break;
                    }
                    case 'prop':
                    {
                        const rec = this.#dom as unknown as Record<string, unknown>;
                        this.#effects.push(Virtual.effect(() => {
                            rec[sink.name!] = sink.getter();
                        }));
                        break;
                    }
                    case 'style':
                    {
                        const el = this.#dom as HTMLElement;
                        const p  = sink.name!.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
                        this.#effects.push(Virtual.effect(() => {
                            el.style.setProperty(p, (sink.getter as (() => string))());
                        }));
                        break;
                    }
                    case 'bind':
                    {
                        const rec = this.#dom as unknown as Record<string, unknown>;
                        this.#effects.push(Virtual.effect(() => {
                            rec['value'] = (sink.getter as (() => string))();
                        }));
                        if (sink.setter)
                        {
                            this.#dom.addEventListener('input', e => {
                                sink.setter!((e.target as HTMLInputElement).value);
                            });
                        }
                        break;
                    }
                    case 'shadow':
                    {
                        Services.Call
                        (
                            'shadow',
                            'Create',
                            this.#dom,
                            {
                                ...(sink.shadowOpts ?? {}),
                                Mode : sink.shadowMode ?? 'closed'
                            }
                        );
                        break;
                    }
                }
            }
            this.#sinks = [];
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Coercion / debugging
        // ─────────────────────────────────────────────────────────────────────

        /** Implicit coercion: `valueOf()` returns the rendered Element. */
        valueOf(): Element { return this.render(); }

        /** Log.txt the current state to console. Returns `this` for chaining. */
        log(v?: unknown): this
        {
            console.log(v ?? this.#dom ?? `[Virtual <${this.#tag}> unmounted]`);
            return this;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Event API — on / off / fire
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Add a DOM event listener. If render() hasn't happened yet, the
         * listener is queued and wired at render() time. Once rendered, it is
         * attached immediately and also recorded in `#events` (queryable via
         * the `.Events` getter).
         */
        on(
            type  : string,
            cb    : EventListener,
            opts? : AddEventListenerOptions | boolean,
        ): this
        {
            if (this.#dom)
            {
                Events.Event.On(this.#dom, type, cb, typeof opts === 'boolean' ? { capture: opts } : opts);
                this.#events.push({ type, cb, opts });
            }
            else
            {
                this.#domQueue.push({ type, cb, ...(opts !== undefined ? { opts } : {}) });
            }
            return this;
        }

        /** Remove a previously-added listener. */
        off(
            type  : string,
            cb    : EventListener,
            opts? : EventListenerOptions | boolean,
        ): this
        {
            if (this.#dom) Events.Event.Off(this.#dom, type, cb);
            this.#events = this.#events.filter(e => !(e.type === type && e.cb === cb));
            return this;
        }

        /** Dispatch a CustomEvent on the rendered element. */
        fire(type: string, init?: CustomEventInit): this
        {
            this.#dom?.dispatchEvent(new CustomEvent(type, init));
            return this;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Mount / unmount
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Materialise this Virtual into the DOM, appended to `parent`.
         *
         * Accepted parent types:
         *   - CSS selector string (resolved via querySelector)
         *   - Element (appended directly)
         *   - Virtual (appended to its rendered Element)
         *   - any `{ render(): Element }` object (appended to the result)
         *   - null (no-op)
         */
        append(
            parent: string | Element | Virtual | { render(): Element } | null,
        ): this
        {
            const p =
                typeof parent === 'string'                 ? document.querySelector(parent)
                    : parent instanceof Virtual              ? parent.render()
                        : typeof (parent as { render?(): Element })?.render === 'function'
                            ? (parent as { render(): Element }).render()
                            : parent instanceof Element                  ? parent
                                : null;

            // Deferred-mount (Snabbdom vnode / React element via Jsx.ts): run the
            // marker closure against the resolved container. It owns patch/diff
            // (Snabbdom) or createRoot + setState loop (React).
            if(this.#deferredMount)
            {
                if(p instanceof Element)
                {
                    this.#deferredNode =
                        this.#deferredMount(p) ?? null;
                }

                this.#mounted = true;

                return this;
            }

            if (p) p.appendChild(this.render());
            this.#mounted = true;
            return this;
        }

        /** Alias for `append()` with cleaner intent at the call site. */
        mount(parent?: string | Element | Virtual | null): this
        {
            return this.append(parent ?? null);
        }

        /** Detach from the DOM (effects + sinks remain alive — see destroy()). */
        unmount(): this
        {
            if(this.#deferredUnmount)
            {
                this.#deferredUnmount();
            }
            else
            {
                this.#deferredNode?.parentNode?.removeChild(this.#deferredNode);
            }

            this.#deferredNode = null;
            this.#dom?.parentNode?.removeChild(this.#dom);
            this.#mounted = false;

            return this;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Children mutation — add / remove / push / pop / shift / unshift
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Insert one or more children. Last argument can be a numeric index;
         * if omitted, children are appended. The DOM is updated in lockstep.
         *
         *   vn.add(childA, childB);        // append both
         *   vn.add(childA, 0);             // prepend childA
         *   vn.add(childA, childB, 2);     // insert at index 2
         */
        add(...args: ((Virtual | string | number | boolean | null | undefined) | number)[]): this
        {
            const last  = args[args.length - 1];
            const items = typeof last === 'number' ? args.slice(0, -1) : args;
            const index = typeof last === 'number' ? last : this.#children.length;
            const vnodes = (items as (Virtual | string | number | boolean | null | undefined)[]).map(c => Virtual.#NormalizeChild(c));

            this.#children.splice(index, 0, ...vnodes);
            for (const vn of vnodes) vn.#parent = this;

            if (this.#dom)
            {
                const ref  = this.#dom.childNodes[index] ?? null;
                const frag = document.createDocumentFragment();
                for (const n of vnodes) frag.appendChild(n.render());
                this.#dom.insertBefore(frag, ref);
            }
            return this;
        }

        /** Append children at the end (alias for `add(...)`). */
        push(...nodes: (Virtual | string | number | boolean | null | undefined)[]): this    { return this.add(...nodes); }

        /** Prepend children at the start. */
        unshift(...nodes: (Virtual | string | number | boolean | null | undefined)[]): this { return this.add(...nodes, 0); }

        /**
         * Remove children. Targets may be:
         *   - numeric index (splice at index)
         *   - CSS selector (first match within this node)
         *   - Virtual reference (exact match in children)
         */
        remove(...targets: (string | number | Virtual)[]): this
        {
            for (const t of targets)
            {
                if (typeof t === 'number')
                {
                    const vn = this.#children.splice(t, 1)[0];
                    if (vn)
                    {
                        const el = vn.render();
                        el.parentNode?.removeChild(el);
                        vn.#parent = null;
                    }
                }
                else if (typeof t === 'string')
                {
                    const el = this.#dom?.querySelector(t);
                    el?.parentNode?.removeChild(el);
                }
                else if (t instanceof Virtual)
                {
                    const i = this.#children.indexOf(t);
                    if (i >= 0)
                    {
                        this.#children.splice(i, 1);
                        t.#parent = null;
                    }
                    if (t.#dom) t.#dom.parentNode?.removeChild(t.#dom);
                }
            }
            return this;
        }

        /** Remove the first `n` children (default 1). */
        shift(n = 1): this
        {
            for (let i = 0; i < n; i++)
            {
                const vn = this.#children.shift();
                if (vn)
                {
                    const el = vn.render();
                    el.parentNode?.removeChild(el);
                    vn.#parent = null;
                }
            }
            return this;
        }

        /** Remove the last `n` children (default 1). */
        pop(n = 1): this
        {
            for (let i = 0; i < n; i++)
            {
                const vn = this.#children.pop();
                if (vn)
                {
                    const el = vn.render();
                    el.parentNode?.removeChild(el);
                    vn.#parent = null;
                }
            }
            return this;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Attribute / property accessors — get / set / sub
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Read an attribute (or dotted-path sub-property). Pre-render reads
         * from the attrs buffer; post-render from the live DOM (and arbitrary
         * properties via the dotted path).
         */ //Riscrivi senza Path! E fai inline! TUTTO! anche SubAccessor che non esiste piu!
        get(name: string): string | undefined
        {
            if (name.indexOf('.') !== -1)
            {
                const root = (this.#dom ?? this.#attrs) as unknown as Record<string, unknown>;
                let v: unknown = root; for (const p of name.split('.')) { if (v == null) { v = undefined; break; } v = (v as Record<string, unknown>)[p]; }
                return v === undefined
                    ? undefined
                    : (typeof v === 'string' ? v : String(v));
            }
            if (this.#dom) return this.#dom.getAttribute(name) ?? undefined;
            return this.#attrs[name] !== undefined && this.#attrs[name] !== null
                ? String(this.#attrs[name])
                : undefined;
        }

        /**
         * Write an attribute, property, or dotted-path sub-property. Pre-
         * render writes go into the attrs buffer; post-render they go into
         * the DOM directly (property assignment when the name is a known
         * property, otherwise setAttribute / removeAttribute).
         *///Riscrivi senza Path! E fai inline! TUTTO! anche SubAccessor che non esiste piu!
        set(
            name  : string,
            value : string | number | boolean | null | unknown,
        ): this
        {
            if (name.indexOf('.') !== -1)
            {
                const root  = (this.#dom ?? this.#attrs) as unknown as Record<string, unknown>;
                const parts = name.split('.');
                let cur = root;
                for (let i = 0; i < parts.length - 1; i++) {
                    const k = parts[i]; const nx = cur[k];
                    if (nx == null || typeof nx !== 'object') {
                        if (nx === undefined) { const o: Record<string, unknown> = {}; cur[k] = o; cur = o; continue; }
                        return this;
                    }
                    cur = nx as Record<string, unknown>;
                }
                cur[parts[parts.length - 1]] = value;
                return this;
            }

            if (this.#dom)
            {
                if (name in (this.#dom as unknown as Record<string, unknown>))
                {
                    (this.#dom as unknown as Record<string, unknown>)[name] = value;
                }
                else if (value !== null)
                {
                    this.#dom.setAttribute(name, String(value));
                }
                else
                {
                    this.#dom.removeAttribute(name);
                }
            }
            else
            {
                this.#attrs[name] = value as string | number | boolean | null;
            }
            return this;
        }

        /** @name        #read
         *  @private
         *  @description Read the raw value at a dotted path from the live DOM (post-render) or the attrs
         *               buffer (pre-render). No stringification, so nested objects come back as objects.
         *  @param       {string} path Dotted path.
         *  @returns     {unknown}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #read(path: string): unknown
        {
            let c: unknown = this.#dom ?? this.#attrs;
            for (const k of path.split('.')) { if (c == null) return undefined; c = (c as Record<string, unknown>)[k]; }
            return c;
        }

        /** @name        #write
         *  @private
         *  @description Write a value at a dotted path (live DOM post-render, attrs buffer pre-render),
         *               creating intermediate plain objects; aborts on a non-object, non-undefined leg.
         *  @param       {string} path Dotted path.
         *  @param       {unknown} value Value to write.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #write(path: string, value: unknown): void
        {
            const ps = path.split('.');
            let c = (this.#dom ?? this.#attrs) as unknown as Record<string, unknown>;
            for (let i = 0; i < ps.length - 1; i++)
            {
                const k = ps[i], nx = c[k];
                if (nx == null || typeof nx !== 'object') { if (nx === undefined) { const o: Record<string, unknown> = {}; c[k] = o; c = o; continue; } return; }
                c = nx as Record<string, unknown>;
            }
            c[ps[ps.length - 1]] = value;
        }

        /** @name        #sub
         *  @private
         *  @description Build the fluent nested accessor bound to `base` (chains via `set`/`sub`, reads raw
         *               via `get`/`unwrap`, returns to the node via `end`). Fully internal: its shape is
         *               inferred, so no accessor type is exposed.
         *  @param       {string} base Current dotted base.
         *  @returns     {object} The fluent accessor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #sub(base: string)
        {
            const self = this;
            return {
                set(key: string, value: unknown) { self.#write(`${base}.${key}`, value); return self.#sub(base); },
                get(key: string)                 { return self.#read(`${base}.${key}`); },
                sub(key: string)                 { return self.#sub(`${base}.${key}`); },
                unwrap()                         { return self.#read(base); },
                end<T = unknown>(): T            { return self as unknown as T; },
            };
        }

        /** @name        sub
         *  @public
         *  @description Fluent sub-property accessor. Works pre- and post-render: before `render()` the path
         *               is written into the attrs buffer; after, into the live DOM element. Built under-the-hood
         *               by `#sub` — no exposed accessor type.
         *
         *                 new Virtual('div').sub('style').set('background', 'orange');
         *  @param       {string} path Dotted path to the nested object.
         *  @returns     {object} A fluent nested accessor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        sub(path: string)
        { return this.#sub(path); }


        // ─────────────────────────────────────────────────────────────────────
        //  CSS / visibility convenience
        // ─────────────────────────────────────────────────────────────────────

        /** Set a single CSS property on the rendered element. */
        css(prop: string, val: string): this
        {
            if (this.#dom) (this.#dom as HTMLElement).style.setProperty(prop, val);
            return this;
        }

        /** Restore default `display` (i.e. clear the inline override). */
        show(): this { this.css('display', '');     return this; }

        /** Force `display: none`. */
        hide(): this { this.css('display', 'none'); return this; }

        /**
         * Walk a child by numeric path into the rendered DOM tree. Used by
         * compiled templates to address known anchor nodes.
         */
        child(path: number[]): Node
        {
            let n: Node = this.render();
            for (const i of path) n = n.childNodes[i]!;
            return n;
        }

        /** @name        shadow
         *  @public
         *  @memberof    Virtual
         *  @param       {'open' | 'closed'} [mode='closed'] Shadow root mode.
         *  @param       {Record<string, unknown>} [options={}] Backend + projection options for the shadow service.
         *  @returns     {this} For chaining.
         *  @description Attach a shadow DOM to this node's element through the kernel `'shadow'` service (no direct
         *               Shadow import). If the node is already rendered (`#dom` present), attaches immediately;
         *               otherwise defers via a sink that fires at render() time. Idempotent. Distinct from CSS
         *               `box-shadow`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        shadow(mode: 'open' | 'closed' = 'closed', options: Record<string, unknown> = {}): this
        {
            if(this.#dom)
            {
                Services.Call
                (
                    'shadow',
                    'Create',
                    this.#dom,
                    {
                        ...options,
                        Mode : mode
                    }
                );
            }
            else
                this.#sinks.push({ type: 'shadow', getter: () => null, shadowMode: mode, shadowOpts: options });
            return this;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Reactive primitives — signal / effect / sinks
        // ─────────────────────────────────────────────────────────────────────

        /** Create a writable signal scoped to this node (instance method). */
        signal<T>(value: T): Signal<T> { return Virtual.signal(value); }

        /** Create a monomorphic signal scoped to this node. */
        signalMono<T>(value: T): SignalMono<T> { return Virtual.signalMono(value); }

        /**
         * Register an effect tied to this node's lifecycle. Effects run
         * eagerly when `#dom` exists; otherwise they are queued as text sinks
         * (legacy convenience — kept for compatibility with early callers).
         */
        effect(fn: () => void): this
        {
            if (this.#dom)
            {
                this.#effects.push(Virtual.effect(fn));
            }
            else
            {
                this.#sinks.push({ type: 'text', getter: fn as (() => string) });
            }
            return this;
        }

        /** Derive a read-only signal computed from `fn`. */
        computed<T>(fn: () => T): ReadonlySignal<T>
        {
            return Virtual.computed(fn);
        }

        /**
         * Append a reactive Text node whose value is `getter()`. Updates
         * automatically whenever the getter's dependencies change.
         */
        text(getter: (() => string) | string): this
        {
            const g: (() => string) = Virtual.#AsGetter(getter);
            if (this.#dom)
            {
                const n = document.createTextNode(g());
                this.#dom.appendChild(n);
                this.#effects.push(Virtual.effect(() => { n.nodeValue = g(); }));
            }
            else
            {
                this.#sinks.push({ type: 'text', getter: g });
            }
            return this;
        }

        /** Fast-path text sink for monomorphic string signals (no closure churn). */
        textMono(s: SignalMono<string>, node?: Text): this
        {
            if (this.#dom)
            {
                const n = node ?? document.createTextNode(s.Peek());
                if (!node) this.#dom.appendChild(n);
                s.BindText(n);
            }
            else
            {
                this.#sinks.push({
                    type   : 'textMono',
                    getter : s.Peek as (() => string),
                    mono   : s,
                    ...(node !== undefined ? { node } : {}),
                });
            }
            return this;
        }

        /** Bind an attribute reactively; `null` removes the attribute. */
        attr(name: string, getter: (() => string | null) | string | null): this
        {
            const g: (() => string | null) = Virtual.#AsGetter(getter);
            if (this.#dom)
            {
                const el = this.#dom;
                this.#effects.push(Virtual.effect(() => {
                    const v = g();
                    if (v === null) el.removeAttribute(name);
                    else            el.setAttribute(name, v);
                }));
            }
            else
            {
                this.#sinks.push({ type: 'attr', getter: g, name });
            }
            return this;
        }

        /** Toggle a class reactively (`true` adds, `false` removes). */
        cls(name: string, getter: (() => boolean) | boolean): this
        {
            const g: (() => boolean) = Virtual.#AsGetter(getter);
            if (this.#dom)
            {
                const el = this.#dom;
                this.#effects.push(Virtual.effect(() => {
                    if (g()) el.classList.add(name);
                    else     el.classList.remove(name);
                }));
            }
            else
            {
                this.#sinks.push({ type: 'cls', getter: g, name });
            }
            return this;
        }

        /**
         * Return a setter function for a class on the rendered element. Skips
         * effect machinery — useful in hot loops where the caller controls
         * timing manually.
         */
        clsMono(name: string): (v: boolean) => void
        {
            const el = this.render();
            return (v: boolean) => {
                if (v) el.classList.add(name);
                else   el.classList.remove(name);
            };
        }

        /** Bind a DOM property reactively. */
        prop(name: string, getter: (() => unknown) | unknown): this
        {
            const g: (() => unknown) = Virtual.#AsGetter(getter);
            if (this.#dom)
            {
                const rec = this.#dom as unknown as Record<string, unknown>;
                this.#effects.push(Virtual.effect(() => { rec[name] = g(); }));
            }
            else
            {
                this.#sinks.push({ type: 'prop', getter: g, name });
            }
            return this;
        }

        /**
         * `.style(...)` — overloaded stylesheet / rule / object / text / prop setter.
         *
         * Six forms:
         *   .style(prop, getter)   → reactive single-property binding
         *   .style(rule)           → apply a Rule as a scoped Sheet
         *   .style(sheet)          → assign a Stylesheet directly to .Sheet
         *   .style({ a: 'b' })     → build Rule(':root', obj), apply as Sheet
         *   .style('button{...}')  → parse CSS text → Stylesheet, apply
         *   .style('color:red')    → apply as inline style attribute
         */
        style(
            propOrThing : string | Rule | Stylesheet | Record<string, string>,
            getter?     : (() => string) | string,
        ): this
        {
            // Form 1: reactive (prop, getter) — also accept a static value.
            if (typeof propOrThing === 'string' && typeof getter !== 'undefined')
            {
                const g = Virtual.#AsGetter(getter);
                if (this.#dom)
                {
                    const el = this.#dom as HTMLElement;
                    const p  = propOrThing.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
                    this.#effects.push(Virtual.effect(() => {
                        el.style.setProperty(p, g());
                    }));
                }
                else
                {
                    this.#sinks.push({ type: 'style', getter: g, name: propOrThing });
                }
                return this;
            }
            // Form 2: Rule
            if (propOrThing instanceof Css.Rule)
            {
                this.Sheet = new Css.Stylesheet([propOrThing]);
                return this;
            }
            // Form 3: Stylesheet
            if (propOrThing instanceof Css.Stylesheet)
            {
                this.Sheet = propOrThing;
                return this;
            }
            // Form 4/5: string (CSS text or inline declaration list)
            if (typeof propOrThing === 'string')
            {
                if (propOrThing.indexOf('{') !== -1)
                {
                    // CSS text — parse into Rule[] and assign as Stylesheet
                    const rules: Rule[] = [];
                    for (const chunk of propOrThing.split('}'))
                    {
                        const i = chunk.indexOf('{');
                        if (i === -1) continue;
                        const selector = chunk.slice(0, i).trim();
                        const body     = chunk.slice(i + 1).trim();
                        if (!selector || !body) continue;
                        const props: Record<string, string> = {};
                        for (const decl of body.split(';'))
                        {
                            const c = decl.indexOf(':');
                            if (c === -1) continue;
                            const k = decl.slice(0, c).trim();
                            const v = decl.slice(c + 1).trim();
                            if (k && v) props[k] = v;
                        }
                        if (Object.keys(props).length) rules.push(new Css.Rule(selector, props));
                    }
                    if (rules.length) this.Sheet = new Css.Stylesheet(rules);
                }
                else if (propOrThing.indexOf(':') !== -1)
                {
                    // Inline declaration list — apply as style attribute
                    if (this.#dom)
                    {
                        const el  = this.#dom as HTMLElement;
                        const cur = el.getAttribute('style') ?? '';
                        el.setAttribute('style', cur + ';' + propOrThing);
                    }
                    else
                    {
                        const cur = (this.#attrs.style as string | undefined) ?? '';
                        this.#attrs.style = cur ? cur + ';' + propOrThing : propOrThing;
                    }
                }
                return this;
            }
            // Form 6: plain object
            if (propOrThing && typeof propOrThing === 'object')
            {
                this.Sheet = new Css.Stylesheet([new Css.Rule(':root', propOrThing as Record<string, string>)]);
                return this;
            }
            return this;
        }

        /**
         * Two-way bind on `value` to a getter (and optional setter on 'input').
         */
        bind(getter: (() => string), setter?: (v: string) => void): this
        {
            this.prop('value', getter);
            if (setter)
            {
                this.on('input', e => setter((e.target as HTMLInputElement).value));
            }
            return this;
        }

        /** Dispose every active effect, clear sinks, detach the Sheet. */
        destroy(): this
        {
            this.unmount();

            for(const child of [...this.#children])
            {
                child.destroy();
            }

            for(const event of this.#events)
            {
                if(this.#dom)
                {
                    Events.Event.Off
                    (
                        this.#dom,
                        event.type,
                        event.cb
                    );
                }
            }

            for(const dispose of this.#effects)
            {
                try
                {
                    dispose();
                }
                catch
                {
                    // Destruction is best-effort and must continue through all resources.
                }
            }

            this.#effects = [];
            this.#sinks = [];
            this.#events = [];
            this.#domQueue = [];
            this.#children = [];
            this.#deferredMount = null;
            this.#deferredUnmount = null;
            this.#real = null;
            this.Sheet = null;

            if(this.#parent)
            {
                const index =
                    this.#parent.#children.indexOf(this);

                if(index >= 0)
                {
                    this.#parent.#children.splice(index, 1);
                }

                this.#parent = null;
            }

            this.#dom = null;
            this.#connected = false;
            this.#mounted = false;
            this.#rendered = false;

            Virtual.#Unregister(this);

            return this;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Real bridge — lazy companion exposing the same element via Real API
        // ─────────────────────────────────────────────────────────────────────

        /** @name        Real
         *  @public
         *  @readonly
         *  @type        {Reals.Real}
         *  @description Lazily expose the same rendered Element through the canonical Real facade. The imported
         *               nominal class is used directly; no global publication or `window.Real` dependency exists.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Real(): Reals.Real
        {
            if(!this.#real)
            {
                this.#real =
                    new Reals.Real(this.render());
            }

            return this.#real;
        }


        // ─────────────────────────────────────────────────────────────────────
        //  Scoped Sheet — per-instance Stylesheet, auto-scoped via class or :host
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Read the currently-assigned per-instance Stylesheet (or null).
         */
        get Sheet(): Stylesheet | null { return this.#sheet; }

        /**
         * Assign a scoped Stylesheet. Mirrors `Real.Sheet`. The rules' `:root`
         * and `&` selectors are rewritten to target THIS element via an auto-
         * generated class (`__vn-…`) — or `:host` when a shadow root is
         * present.
         *
         * If the Virtual has not been rendered yet (`#dom === null`), the
         * Sheet is stored and applied on first `render()`. Subsequent
         * `Sheet.Rules.add/remove/...` mutations re-flush automatically (the
         * Sheet emits `Sheet-Changed` and we listen for it).
         */
        set Sheet(next: Stylesheet | null)
        {
            // Detach previous Sheet
            if (this.#sheet && this.#sheetSync)
            {
                this.#sheet.off('Sheet-Changed', this.#sheetSync);
            }
            if (this.#styleNode && this.#styleNode.parentNode)
            {
                this.#styleNode.parentNode.removeChild(this.#styleNode);
            }
            this.#styleNode = null;
            this.#sheetSync = null;
            this.#sheet     = next;

            if (!next) return;

            // Mint a per-instance id once
            if (!this.#instanceId)
            {
                this.#instanceId = 'vn-' + Math.random().toString(36).slice(2, 10);
            }

            // Build a closure that materialises the Sheet against the rendered
            // host. Called immediately (lazy-render the host if needed) AND
            // whenever the source Sheet emits 'Sheet-Changed'.
            const apply = () =>
            {
                if (!this.#sheet) return;
                const el = this.#dom ?? this.render();
                if (!el) return;

                const useShadow = !!(el as Element & {
                    shadowRoot?: ShadowRoot | null;
                }).shadowRoot;

                let replace : string;
                if (useShadow)
                {
                    replace = ':host';
                }
                else
                {
                    const cls = '__' + this.#instanceId;
                    el.classList.add(cls);
                    replace = '.' + cls;
                }

                // Replace every `:root` or `&` token (not followed by an
                // identifier char) with the scoping selector.
                let css = '';
                for (const r of this.#sheet.Rules)
                {
                    const scoped = r.Text.replace(
                        /(^|,\s*|\s)(:root|&)(?![\w-])/g,
                        (_m: string, pre: string) => pre + replace,
                    );
                    css += scoped + '\n';
                }

                // Inject the style node into the right host (shadow root or head)
                if (!this.#styleNode)
                {
                    this.#styleNode = document.createElement('style');
                    this.#styleNode.setAttribute('data-arianna-sheet',    el.tagName.toLowerCase());
                    this.#styleNode.setAttribute('data-arianna-instance', this.#instanceId);
                    if (useShadow)
                    {
                        (el as Element & { shadowRoot: ShadowRoot }).shadowRoot.appendChild(this.#styleNode);
                    }
                    else
                    {
                        (document.head ?? document.documentElement).appendChild(this.#styleNode);
                    }
                }
                this.#styleNode.textContent = css;
            };

            apply();
            this.#sheetSync = apply;
            next.on('Sheet-Changed', apply);
        }


        // ─────────────────────────────────────────────────────────────────────
        //  State machine — State / States / History
        // ─────────────────────────────────────────────────────────────────────

        /**
         * Capture a named state variant. Later, `transitionTo(name)` swaps
         * the current state for that variant.
         */
        captureState(name: string, snapshot: Record<string, unknown>): this
        {
            this.#states[name] = { ...snapshot };
            return this;
        }

        /**
         * Transition the current state to a previously captured variant.
         * Records the prior state into `#history` for replay.
         */
        transitionTo(name: string): this
        {
            const target = this.#states[name];
            if (!target) return this;
            this.#history.push({ at: Date.now(), state: { ...this.#state } });
            this.#state = { ...target };
            return this;
        }


        // ─── Static virtual-tree management ─────────────────────────────────

        /** @name        Create
         *  @public
         *  @static
         *  @param       {Target} definition Virtual target, definition, Template, tag, or deferred mount.
         *  @param       {Attributes} [attributes] Initial attributes for the tag construction form.
         *  @param       {...Child} children Initial children.
         *  @returns     {Virtual} A new Virtual.
         *  @description Canonical Virtual factory. Mirrors the constructor while preserving one stable service
         *               entry point for JSX runtimes, renderers, plugins, and external integrations.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Create
        (
            definition  : Target,
            attributes? : Attributes,
            ...children : Child[]
        ): Virtual
        {
            return new Virtual
            (
                definition,
                attributes,
                ...children
            );
        }

        /** @name        From
         *  @public
         *  @static
         *  @param       {Virtual | Target} source Existing Virtual or construction source.
         *  @returns     {Virtual} Existing or newly created Virtual.
         *  @description Normalize any accepted Virtual source without cloning an already canonical Virtual.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static From(source: Virtual | Target): Virtual
        {
            return source instanceof Virtual
                ? source
                : Virtual.Create(source);
        }

        /** @name        Resolve
         *  @public
         *  @static
         *  @param       {string} id Virtual identifier.
         *  @returns     {Virtual | undefined} Registered Virtual.
         *  @description Resolve a live Virtual from the canonical node registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Resolve(id: string): Virtual | undefined
        {
            return Virtual.#nodes[id]?.deref();
        }

        /** @name        Has
         *  @public
         *  @static
         *  @param       {string} id Virtual identifier.
         *  @returns     {boolean} Whether the identifier is registered.
         *  @description Test membership in the canonical Virtual registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Has(id: string): boolean
        {
            return Object.prototype.hasOwnProperty.call(Virtual.#nodes, id);
        }

        /** @name        Render
         *  @public
         *  @static
         *  @param       {Virtual | Target} source Virtual or accepted construction source.
         *  @returns     {Element} Materialised DOM element.
         *  @description Normalize and lazily materialise a Virtual in one operation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Render(source: Virtual | Target): Element
        {
            return Virtual
                .From(source)
                .render();
        }

        /** @name        Mount
         *  @public
         *  @static
         *  @param       {Virtual | Target} source Virtual or accepted construction source.
         *  @param       {string | Element | Virtual | null} [parent] Mount target.
         *  @returns     {Virtual} Mounted Virtual.
         *  @description Normalize and mount a Virtual while preserving the fluent instance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Mount
        (
            source  : Virtual | Target,
            parent? : string | Element | Virtual | null
        ): Virtual
        {
            return Virtual
                .From(source)
                .mount(parent);
        }

        /** @name        Destroy
         *  @public
         *  @static
         *  @param       {Virtual | string} source Virtual or registered identifier.
         *  @returns     {boolean} Whether a Virtual was found and destroyed.
         *  @description Destroy a Virtual instance and remove it from the canonical registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Destroy(source: Virtual | string): boolean
        {
            const virtual =
                typeof source === 'string'
                    ? Virtual.Resolve(source)
                    : source;

            if(!virtual)
            {
                return false;
            }

            virtual.destroy();

            return true;
        }

        // ─── Static reactive primitives ─────────────────────────────────────

        /** Create a writable Signal without hiding its Reactivity owner behind a module alias. */
        static signal<T>(value: T): Signal<T>
        {
            return new Reactivity.Signal(value);
        }

        /** Create a monomorphic Signal. */
        static signalMono<T>(value: T): SignalMono<T>
        {
            return new Reactivity.Mono(value);
        }

        /** Create an Effect and return its lifecycle disposer. */
        static effect(run: () => void): (() => void)
        {
            const instance =
                new Reactivity.Effect(run);

            return () =>
                instance.Dispose();
        }

        /** Create a derived Memo. */
        static computed<T>(derive: () => T): Reactivity.Memo<T>
        {
            return new Reactivity.Memo(derive);
        }

        /** Execute a function inside one Reactivity batch. */
        static batch<T>(run: () => T): T
        {
            return Reactivity.API.Runtime.RunBatch(run);
        }

        /** Execute a read without dependency tracking. */
        static untrack<T>(read: () => T): T
        {
            return Reactivity.Untrack(read);
        }

        /** Compile an HTML string into a Template. */
        static template(html: string): Templates.Template
        {
            return new Templates.Template(html);
        }

        /** Compact alias for `Virtual.template`. */
        static tpl(html: string): Templates.Template
        {
            return Virtual.template(html);
        }
    }

    /** @name        Service
     *  @private
     *  @constant
     *  @type        {Services.Service<ServiceContract>}
     *  @description Registers the canonical Virtual service. The service exposes construction, normalization,
     *               registry inspection, rendering, mounting, destruction, and Template compilation while every
     *               implementation remains owned by `Virtual`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'virtual',
        {
            get Nodes(): Readonly<Record<string, Virtual>>
            {
                return Virtual.Nodes;
            },

            get Instances(): readonly Virtual[]
            {
                return Virtual.Instances;
            },

            Create
            (
                definition  : Target,
                attributes? : Attributes,
                ...children : Child[]
            ): Virtual
            {
                return Virtual.Create
                (
                    definition,
                    attributes,
                    ...children
                );
            },

            From(source: Virtual | Target): Virtual
            {
                return Virtual.From(source);
            },

            Resolve(id: string): Virtual | undefined
            {
                return Virtual.Resolve(id);
            },

            Has(id: string): boolean
            {
                return Virtual.Has(id);
            },

            Render(source: Virtual | Target): Element
            {
                return Virtual.Render(source);
            },

            Mount
            (
                source  : Virtual | Target,
                parent? : string | Element | Virtual | null
            ): Virtual
            {
                return Virtual.Mount(source, parent);
            },

            Destroy(source: Virtual | string): boolean
            {
                return Virtual.Destroy(source);
            },

            Template(source: string): Templates.Template
            {
                return Virtual.template(source);
            }
        }
    );
}

export default Virtuals.Virtual;
