/**
 * @module    core/Virtual
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Virtual — AriannA Virtual Node. ♡ Arianna.
 *
 * A `VirtualNode` is the framework-side representation of an Element or Text
 * Node in the AriannA virtual tree. Every VirtualNode is described by the
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
 *         Events     : <Array>,          - Wired event listeners.
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
 *     new VirtualNode('div', { class: 'hero' }, child1, child2);   // tag, attrs, children
 *     new VirtualNode({ Tag: 'div', Attributes: {...}, ... });     // VNodeDef object
 *     new VirtualNode(AriannATemplate);                             // pre-cloned template
 *
 * Render is lazy: `render()` materialises into a real DOM Element on demand.
 * Sinks queued before render are flushed at render time; effects queued
 * after are wired immediately. Mount/unmount manages DOM parentage.
 */

import Core, { type TypeDescriptor }                from './Core.ts';
import {
    signal, signalMono, sinkText, effect, computed, batch, untrack,
    AriannATemplate,
    type Signal, type SignalMono, type ReadonlySignal,
}                                                    from './Observable.ts';
import Rule                                          from './Rule.ts';
import { Stylesheet }                                from './Stylesheet.ts';
import {
    readDottedPath, writeDottedPath, makeSubAccessor,
    type SubAccessor,
}                                                    from './Real.ts';


// ─── Re-exports ──────────────────────────────────────────────────────────────
export type { SubAccessor };
export type { Signal, SignalMono, ReadonlySignal };


// ─────────────────────────────────────────────────────────────────────────────
//  Public types
// ─────────────────────────────────────────────────────────────────────────────

/** Attribute map: key → string | number | boolean | null. */
export type VAttrs = Record<string, string | number | boolean | null>;

/** A child of a VirtualNode: another VirtualNode, or a primitive auto-wrapped. */
export type VChild = VirtualNode | string | number | boolean | null | undefined;

/** Object-form constructor input. */
export interface VNodeDef
{
    Tag?        : string;
    Text?       : string;
    Attributes? : VAttrs;
    Children?   : VChild[];
    Root?       : Element | null;
    Parent?     : VirtualNode | null;
}

/** Shadow visibility state. */
export type ShadowState = 'open' | 'close';

/** Shadow preset modes (rendered to `box-shadow` CSS). */
export type ShadowMode  = 'drop' | 'inset' | 'glow' | 'layered';

/** Numeric tuning for shadow presets. */
export interface ShadowOptions
{
    color?  : string;
    blur?   : number;
    spread? : number;
    x?      : number;
    y?      : number;
}

/** A single shadow layer (can be composed into multi-layer `box-shadow`). */
export interface ShadowLayer extends ShadowOptions
{
    inset? : boolean;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Shadow CSS helpers (pure functions)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a CSS color (hex 3/4/6/8 digits, rgb(), rgba(), or named) to
 * `rgba(r,g,b,a)` with the given alpha. Named colors are passed through
 * unchanged (browser will resolve them in context).
 */
function _alpha(color: string, a: number): string
{
    const rgba = color.match(/rgba?\(([^)]+)\)/);
    if (rgba)
    {
        const parts = rgba[1].split(',').map(s => s.trim());
        if (parts.length >= 3) return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
    }
    const hex = color.match(/^#([0-9a-fA-F]{3,8})$/);
    if (hex)
    {
        const h = hex[1];
        const r = parseInt(h.length >= 6 ? h.slice(0, 2) : h[0] + h[0], 16);
        const g = parseInt(h.length >= 6 ? h.slice(2, 4) : h[1] + h[1], 16);
        const b = parseInt(h.length >= 6 ? h.slice(4, 6) : h[2] + h[2], 16);
        return `rgba(${r},${g},${b},${a})`;
    }
    return color;
}

/**
 * Compose a CSS `box-shadow` value from a named preset and tuning options.
 */
function _preset(mode: ShadowMode, o: ShadowOptions): string
{
    const color  = o.color  ?? 'rgba(0,0,0,0.25)';
    const blur   = o.blur   ?? 8;
    const spread = o.spread ?? 0;
    const x      = o.x      ?? 0;
    switch (mode)
    {
        case 'drop':
            return `${x}px ${o.y ?? 4}px ${blur}px ${spread}px ${color}`;
        case 'inset':
            return `inset ${x}px ${o.y ?? 0}px ${blur}px ${spread}px ${color}`;
        case 'glow':
            return `0 0 ${blur}px ${spread + 2}px ${color}, 0 0 ${blur * 2}px ${spread}px ${_alpha(color, 0.5)}`;
        case 'layered':
        {
            const y = o.y ?? 4;
            return `${x}px ${y}px ${blur}px ${color}, ${x}px ${y * 2}px ${blur * 2}px ${_alpha(color, 0.15)}`;
        }
    }
}

/**
 * Render a single `ShadowLayer` as one `box-shadow` term.
 */
function _layerCSS(l: ShadowLayer): string
{
    const inset  = l.inset ? 'inset ' : '';
    const x      = l.x      ?? 0;
    const y      = l.y      ?? 4;
    const blur   = l.blur   ?? 8;
    const spread = l.spread ?? 0;
    const color  = l.color  ?? 'rgba(0,0,0,0.25)';
    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/**
 * Top-level shadow CSS dispatcher.
 *
 *   _shadowCSS('close')                            → 'none'
 *   _shadowCSS('open', 'drop',  { blur: 12 })      → '0px 4px 12px 0px rgba(0,0,0,0.25)'
 *   _shadowCSS('open', [{ y: 2 }, { y: 8 }])       → '0px 2px 8px 0px ..., 0px 8px 8px 0px ...'
 *   _shadowCSS('open', new Rule('.x', { boxShadow: '...' })) → reads from Rule
 *   _shadowCSS('open', new Stylesheet([...]))      → first matching Rule wins
 */
function _shadowCSS(
    state : ShadowState,
    mode  : ShadowMode | ShadowLayer[] | Rule | Stylesheet = 'drop',
    opts  : ShadowOptions = {},
): string
{
    if (state === 'close') return 'none';

    if (mode instanceof Rule)
    {
        const v = mode.Properties['boxShadow'] ?? mode.Properties['box-shadow'];
        return v ?? _preset('drop', opts);
    }
    if (mode instanceof Stylesheet)
    {
        for (const r of mode.Rules)
        {
            const v = r.Properties['boxShadow'] ?? r.Properties['box-shadow'];
            if (v) return v;
        }
        return _preset('drop', opts);
    }
    if (Array.isArray(mode))
    {
        return mode.map(_layerCSS).join(', ');
    }
    return _preset(mode, opts);
}


// ─────────────────────────────────────────────────────────────────────────────
//  Private sink / listener queueing types
// ─────────────────────────────────────────────────────────────────────────────

/** Event listener queued before render(). Flushed at render time. */
interface QueuedListener
{
    type  : string;
    cb    : EventListener;
    opts? : AddEventListenerOptions | boolean;
}

/** Generic getter for reactive sinks. */
type Getter<T> = () => T;

/** Reactive binding queued before render(). Flushed by #applySinks. */
interface PendingSink
{
    type            : 'text' | 'textMono' | 'attr' | 'cls' | 'prop' | 'style' | 'bind' | 'shadow';
    getter          : Getter<unknown>;
    setter?         : (v: string) => void;
    name?           : string;
    mono?           : SignalMono<string>;
    node?           : Text;
    shadowMode?     : ShadowMode | ShadowLayer[];
    shadowModeRule? : Rule | Stylesheet;
    shadowOpts?     : ShadowOptions;
}


// ─────────────────────────────────────────────────────────────────────────────
//  UID generator + child normalisation
// ─────────────────────────────────────────────────────────────────────────────

/** Monotonic counter, prefixed with random suffix for non-trivial uniqueness. */
let _counter = 0;

/** Global registry of VirtualNodes by Id, used by tools and the inspector. */
const _nodes: Record<string, VirtualNode> = {};

/** Mint a fresh, collision-resistant Id for a new VirtualNode. */
function uid(): string
{
    return `vn-${++_counter}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Coerce a `VChild` into a real VirtualNode.
 *   - VirtualNode → returned as-is
 *   - primitive   → wrapped in a `<span>` with the value as textContent
 *   - null/undef  → wrapped in an empty `<span>`
 */
function normalizeChild(c: VChild): VirtualNode
{
    if (c instanceof VirtualNode) return c;
    const n = new VirtualNode('span');
    n.set('textContent', c == null ? '' : String(c));
    return n;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Class — VirtualNode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `VirtualNode` — framework-side representation of an Element or Text Node
 * in the AriannA virtual tree. See file header for the canonical descriptor
 * shape (Root, Id, Type, Parent, Tag, ...).
 *
 * Lifecycle:
 *
 *      new VirtualNode('div', { class: 'hero' })   →  Created
 *      vn.append(parent)                            →  Connected + Mounted + Rendered
 *      vn.unmount()                                 →  Mounted = false
 *      vn.destroy()                                 →  effects disposed, sheet cleared
 *
 * Render is lazy and idempotent. Sinks queued before render are flushed at
 * render time; effects queued after run immediately.
 */
export class VirtualNode
{
    // ─── Private fields ──────────────────────────────────────────────────
    #id          : string;
    #tag         : string;
    #attrs       : VAttrs;
    #children    : VirtualNode[];
    #text        : string;
    #dom         : Element | null = null;
    #parent      : VirtualNode | null = null;

    /** Lifecycle flags — track virtualNode state transitions. */
    #created     = true;
    #connected   = false;
    #mounted     = false;
    #loaded      = false;
    #rendered    = false;

    /** Pending DOM-event listeners, flushed at render() time. */
    #domQueue    : QueuedListener[] = [];

    /** Active effect-disposer functions, called on destroy(). */
    #effects     : Array<() => void> = [];

    /** Reactive sinks queued pre-render, flushed by #applySinks(). */
    #sinks       : PendingSink[] = [];

    /** Wired event-listener records (Events facet of the descriptor). */
    #events      : Array<{ type: string; cb: EventListener; opts?: AddEventListenerOptions | boolean }> = [];

    /** Per-instance scoped Stylesheet, if any. */
    #sheet       : Stylesheet | null = null;
    #styleNode   : HTMLStyleElement | null = null;
    #instanceId  : string = '';
    #sheetSync   : (() => void) | null = null;

    /** Lazy Real-facade companion (constructed on first .Real access). */
    #real        : object | null = null;

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
     * Every VirtualNode constructed during the application's lifetime is
     * pushed here. Useful for inspector tools, devtools, and bulk
     * operations. Not a leak source: nodes are weakly held by callers, the
     * array is intended for foreground use only.
     */
    static readonly Instances: VirtualNode[] = [];


    // ─── Constructor ─────────────────────────────────────────────────────

    /**
     * Construct a new VirtualNode.
     *
     * Three overloads, dispatched on the type of the first argument:
     *
     *   new VirtualNode('div', { class: 'hero' }, child1, child2);
     *       — tag, attrs, ...children (legacy / convenience form)
     *
     *   new VirtualNode({ Tag: 'div', Attributes: {...}, Children: [...] });
     *       — full descriptor form
     *
     *   new VirtualNode(AriannATemplate.from('<div/>'));
     *       — clone from a pre-parsed template (zero rebuild cost)
     */
    constructor(
        def       : VNodeDef | string | AriannATemplate,
        attrs?    : VAttrs,
        ...children : VChild[]
    )
    {
        // ── Template clone path ──────────────────────────────────────────
        // The template already produced a real Element; we wrap it and skip
        // attribute/child rebuilding. Used for high-throughput list
        // virtualisation.
        if (def instanceof AriannATemplate)
        {
            const el       = def.clone();
            this.#tag      = el.tagName.toLowerCase();
            this.#attrs    = {};
            this.#children = [];
            this.#text     = '';
            this.#id       = uid();
            this.#dom      = el;
            this.#rendered = true;
            _nodes[this.#id] = this;
            VirtualNode.Instances.push(this);
            return;
        }

        // ── String / tag-name path ───────────────────────────────────────
        if (typeof def === 'string')
        {
            this.#tag      = def.toLowerCase();
            this.#attrs    = { ...(attrs ?? {}) };
            this.#children = children.map(normalizeChild);
            this.#text     = '';
        }
        // ── VNodeDef object path ─────────────────────────────────────────
        else
        {
            this.#tag      = (def.Tag ?? 'div').toLowerCase();
            this.#attrs    = { ...(def.Attributes ?? {}) };
            this.#children = (def.Children ?? []).map(normalizeChild);
            this.#text     = def.Text ?? '';
            this.#parent   = def.Parent ?? null;
        }

        this.#id = uid();
        _nodes[this.#id] = this;
        VirtualNode.Instances.push(this);

        // Establish parent-child relationship for children passed via
        // either form — the children must know who their Parent is, so
        // that .Siblings / .Depth / .Breadth / .Path resolve correctly.
        for (const c of this.#children) c.#parent = this;
    }


    // ─────────────────────────────────────────────────────────────────────
    //  Descriptor facet — Root / Id / Type / Parent / Tag / Text / ...
    //
    //  Read-only getters that expose the canonical descriptor shape. The
    //  source of truth remains the private fields above; these getters are
    //  the public surface for tooling, inspection, and serialisation.
    // ─────────────────────────────────────────────────────────────────────

    /** Root VirtualNode of this subtree (walks up via Parent until null). */
    get Root(): VirtualNode
    {
        let cur: VirtualNode = this;
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

    /** Parent VirtualNode (null at the Root). */
    get Parent(): VirtualNode | null { return this.#parent; }

    /** Registered DOM tag name. */
    get Tag(): string { return this.#tag; }

    /** Text content (innerText). Mirrored to DOM on render. */
    get Text(): string
    {
        if (this.#dom) return this.#dom.textContent ?? '';
        return this.#text;
    }

    /** Attribute key/value pairs, plain-object form. */
    get Attributes(): VAttrs { return { ...this.#attrs }; }

    /** Child VirtualNodes, in declared order. */
    get Children(): VirtualNode[] { return this.#children.slice(); }

    /**
     * Sibling VirtualNodes — every node sharing this Parent, excluding
     * `this`. Computed; mutation does not affect ordering.
     */
    get Siblings(): VirtualNode[]
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
    get Descriptor(): TypeDescriptor | false { return Core.GetDescriptor(this.#tag); }

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
        let cur: VirtualNode | null = this;
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

        const d = Core.GetDescriptor(this.#tag) as
            (TypeDescriptor & {
                Namespace?: { functions?: { create?(tag: string): Element | false } };
            }) | false;

        this.#dom = (d && d.Namespace?.functions?.create)
            ? d.Namespace.functions.create(this.#tag) as Element
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
            this.#dom.addEventListener(type, cb, opts);
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
                        String((sink.getter as Getter<string>)()),
                    );
                    this.#dom.appendChild(node);
                    this.#effects.push(effect(() => {
                        node.nodeValue = (sink.getter as Getter<string>)();
                    }));
                    break;
                }
                case 'textMono':
                {
                    const node = sink.node ?? document.createTextNode(sink.mono!.peek());
                    if (!sink.node) this.#dom.appendChild(node);
                    sinkText(sink.mono!, node);
                    break;
                }
                case 'attr':
                {
                    const el = this.#dom;
                    this.#effects.push(effect(() => {
                        const v = (sink.getter as Getter<string | null>)();
                        if (v === null) el.removeAttribute(sink.name!);
                        else            el.setAttribute(sink.name!, v);
                    }));
                    break;
                }
                case 'cls':
                {
                    const el = this.#dom;
                    this.#effects.push(effect(() => {
                        if ((sink.getter as Getter<boolean>)()) el.classList.add(sink.name!);
                        else                                    el.classList.remove(sink.name!);
                    }));
                    break;
                }
                case 'prop':
                {
                    const rec = this.#dom as unknown as Record<string, unknown>;
                    this.#effects.push(effect(() => {
                        rec[sink.name!] = sink.getter();
                    }));
                    break;
                }
                case 'style':
                {
                    const el = this.#dom as HTMLElement;
                    const p  = sink.name!.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
                    this.#effects.push(effect(() => {
                        el.style.setProperty(p, (sink.getter as Getter<string>)());
                    }));
                    break;
                }
                case 'bind':
                {
                    const rec = this.#dom as unknown as Record<string, unknown>;
                    this.#effects.push(effect(() => {
                        rec['value'] = (sink.getter as Getter<string>)();
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
                    const mode = sink.shadowModeRule ?? sink.shadowMode ?? 'drop';
                    (this.#dom as HTMLElement).style.boxShadow = _shadowCSS(
                        'open',
                        mode as ShadowMode | ShadowLayer[] | Rule | Stylesheet,
                        sink.shadowOpts ?? {},
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

    /** Log the current state to console. Returns `this` for chaining. */
    log(v?: unknown): this
    {
        console.log(v ?? this.#dom ?? `[VirtualNode <${this.#tag}> unmounted]`);
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
            this.#dom.addEventListener(type, cb, opts);
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
        this.#dom?.removeEventListener(type, cb, opts);
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
     * Materialise this VirtualNode into the DOM, appended to `parent`.
     *
     * Accepted parent types:
     *   - CSS selector string (resolved via querySelector)
     *   - Element (appended directly)
     *   - VirtualNode (appended to its rendered Element)
     *   - any `{ render(): Element }` object (appended to the result)
     *   - null (no-op)
     */
    append(
        parent: string | Element | VirtualNode | { render(): Element } | null,
    ): this
    {
        const p =
              typeof parent === 'string'                 ? document.querySelector(parent)
            : parent instanceof VirtualNode              ? parent.render()
            : typeof (parent as { render?(): Element })?.render === 'function'
                                                         ? (parent as { render(): Element }).render()
            : parent instanceof Element                  ? parent
            : null;

        if (p) p.appendChild(this.render());
        this.#mounted = true;
        return this;
    }

    /** Alias for `append()` with cleaner intent at the call site. */
    mount(parent?: string | Element | VirtualNode | null): this
    {
        return this.append(parent ?? null);
    }

    /** Detach from the DOM (effects + sinks remain alive — see destroy()). */
    unmount(): this
    {
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
    add(...args: (VChild | number)[]): this
    {
        const last  = args[args.length - 1];
        const items = typeof last === 'number' ? args.slice(0, -1) : args;
        const index = typeof last === 'number' ? last : this.#children.length;
        const vnodes = (items as VChild[]).map(normalizeChild);

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
    push(...nodes: VChild[]): this    { return this.add(...nodes); }

    /** Prepend children at the start. */
    unshift(...nodes: VChild[]): this { return this.add(...nodes, 0); }

    /**
     * Remove children. Targets may be:
     *   - numeric index (splice at index)
     *   - CSS selector (first match within this node)
     *   - VirtualNode reference (exact match in children)
     */
    remove(...targets: (string | number | VirtualNode)[]): this
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
            else if (t instanceof VirtualNode)
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
     */
    get(name: string): string | undefined
    {
        if (name.indexOf('.') !== -1)
        {
            const root = (this.#dom ?? this.#attrs) as unknown as Record<string, unknown>;
            const v = readDottedPath(root, name);
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
     */
    set(
        name  : string,
        value : string | number | boolean | null | unknown,
    ): this
    {
        if (name.indexOf('.') !== -1)
        {
            if (this.#dom)
            {
                writeDottedPath(
                    this.#dom as unknown as Record<string, unknown>,
                    name, value,
                );
            }
            else
            {
                writeDottedPath(
                    this.#attrs as unknown as Record<string, unknown>,
                    name, value,
                );
            }
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

    /**
     * Returns a fluent sub-property accessor. Works both pre- and post-
     * render: before render() the path is written into the attrs buffer;
     * after, into the live DOM element.
     *
     *   new VirtualNode('div').sub('style').set('background', 'orange');
     */
    sub(path: string): SubAccessor
    {
        const root = (this.#dom ?? this.#attrs) as unknown as Record<string, unknown>;
        return makeSubAccessor(root, path, this);
    }


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

    /**
     * Configure `box-shadow` for this element. Accepts:
     *
     *   shadow('close')                        — clear
     *   shadow('open', 'drop',  { blur: 12 })  — preset
     *   shadow('open', [{ y: 2 }, { y: 8 }])   — multi-layer
     *   shadow('open', new Rule(...))          — read from Rule
     *   shadow('open', new Stylesheet([...]))  — first matching Rule wins
     */
    shadow(
        state : ShadowState,
        mode  : ShadowMode | ShadowLayer[] | Rule | Stylesheet = 'drop',
        opts  : ShadowOptions = {},
    ): this
    {
        if (this.#dom)
        {
            (this.#dom as HTMLElement).style.boxShadow = _shadowCSS(state, mode, opts);
        }
        else if (state === 'close')
        {
            this.#sinks.push({ type: 'shadow', getter: () => null, shadowOpts: {} });
        }
        else if (mode instanceof Rule || mode instanceof Stylesheet)
        {
            this.#sinks.push({ type: 'shadow', getter: () => null, shadowModeRule: mode, shadowOpts: opts });
        }
        else
        {
            this.#sinks.push({
                type       : 'shadow',
                getter     : () => null,
                shadowMode : mode as ShadowMode | ShadowLayer[],
                shadowOpts : opts,
            });
        }
        return this;
    }


    // ─────────────────────────────────────────────────────────────────────
    //  Reactive primitives — signal / effect / sinks
    // ─────────────────────────────────────────────────────────────────────

    /** Create a writable signal scoped to this node (instance method). */
    signal<T>(value: T): Signal<T> { return signal(value); }

    /** Create a monomorphic signal scoped to this node. */
    signalMono<T>(value: T): SignalMono<T> { return signalMono(value); }

    /**
     * Register an effect tied to this node's lifecycle. Effects run
     * eagerly when `#dom` exists; otherwise they are queued as text sinks
     * (legacy convenience — kept for compatibility with early callers).
     */
    effect(fn: () => void): this
    {
        if (this.#dom)
        {
            this.#effects.push(effect(fn));
        }
        else
        {
            this.#sinks.push({ type: 'text', getter: fn as Getter<string> });
        }
        return this;
    }

    /** Derive a read-only signal computed from `fn`. */
    computed<T>(fn: () => T): ReadonlySignal<T>
    {
        const s = signal<T>(undefined as T);
        this.#effects.push(effect(() => s.set(fn())));
        return s.readonly();
    }

    /**
     * Append a reactive Text node whose value is `getter()`. Updates
     * automatically whenever the getter's dependencies change.
     */
    text(getter: Getter<string>): this
    {
        if (this.#dom)
        {
            const n = document.createTextNode(getter());
            this.#dom.appendChild(n);
            this.#effects.push(effect(() => { n.nodeValue = getter(); }));
        }
        else
        {
            this.#sinks.push({ type: 'text', getter });
        }
        return this;
    }

    /** Fast-path text sink for monomorphic string signals (no closure churn). */
    textMono(s: SignalMono<string>, node?: Text): this
    {
        if (this.#dom)
        {
            const n = node ?? document.createTextNode(s.peek());
            if (!node) this.#dom.appendChild(n);
            sinkText(s, n);
        }
        else
        {
            this.#sinks.push({
                type   : 'textMono',
                getter : s.peek as Getter<string>,
                mono   : s,
                ...(node !== undefined ? { node } : {}),
            });
        }
        return this;
    }

    /** Bind an attribute reactively; `null` removes the attribute. */
    attr(name: string, getter: Getter<string | null>): this
    {
        if (this.#dom)
        {
            const el = this.#dom;
            this.#effects.push(effect(() => {
                const v = getter();
                if (v === null) el.removeAttribute(name);
                else            el.setAttribute(name, v);
            }));
        }
        else
        {
            this.#sinks.push({ type: 'attr', getter, name });
        }
        return this;
    }

    /** Toggle a class reactively (`true` adds, `false` removes). */
    cls(name: string, getter: Getter<boolean>): this
    {
        if (this.#dom)
        {
            const el = this.#dom;
            this.#effects.push(effect(() => {
                if (getter()) el.classList.add(name);
                else          el.classList.remove(name);
            }));
        }
        else
        {
            this.#sinks.push({ type: 'cls', getter, name });
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
    prop(name: string, getter: Getter<unknown>): this
    {
        if (this.#dom)
        {
            const rec = this.#dom as unknown as Record<string, unknown>;
            this.#effects.push(effect(() => { rec[name] = getter(); }));
        }
        else
        {
            this.#sinks.push({ type: 'prop', getter, name });
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
        getter?     : Getter<string>,
    ): this
    {
        // Form 1: reactive (prop, getter)
        if (typeof propOrThing === 'string' && typeof getter === 'function')
        {
            if (this.#dom)
            {
                const el = this.#dom as HTMLElement;
                const p  = propOrThing.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
                this.#effects.push(effect(() => {
                    el.style.setProperty(p, getter());
                }));
            }
            else
            {
                this.#sinks.push({ type: 'style', getter, name: propOrThing });
            }
            return this;
        }
        // Form 2: Rule
        if (propOrThing instanceof Rule)
        {
            this.Sheet = new Stylesheet([propOrThing]);
            return this;
        }
        // Form 3: Stylesheet
        if (propOrThing instanceof Stylesheet)
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
                    if (Object.keys(props).length) rules.push(new Rule(selector, props));
                }
                if (rules.length) this.Sheet = new Stylesheet(rules);
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
            this.Sheet = new Stylesheet([new Rule(':root', propOrThing as Record<string, string>)]);
            return this;
        }
        return this;
    }

    /**
     * Two-way bind on `value` to a getter (and optional setter on 'input').
     */
    bind(getter: Getter<string>, setter?: (v: string) => void): this
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
        this.#effects.forEach(s => s());
        this.#effects = [];
        this.#sinks   = [];
        this.Sheet    = null;
        return this;
    }


    // ─────────────────────────────────────────────────────────────────────
    //  Real bridge — lazy companion exposing the same element via Real API
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Lazy `.Real` companion — wraps the same underlying element as a Real
     * (live DOM, fluent), materialised on first access. Mutations through
     * either facet land on the same DOM element. Useful for code that
     * starts with a Virtual (e.g. for SSR) and then needs the Real fluent
     * API surface for client-side reactivity.
     *
     *      const v = new VirtualNode({ Tag: 'div' });
     *      v.append('#app');                 // materialises into DOM
     *      v.Real.set('class', 'hero')        // mutates same element via Real
     *           .on('click', handler);
     *
     * Note: Real imports VirtualNode (this file), so we can't import Real
     * at the top here without breaking module init order. Instead we
     * resolve `Real` through `globalThis` — the runtime bundle installs
     * `window.Real` once both modules have loaded.
     */
    get Real(): object
    {
        if (!this.#real)
        {
            const g = globalThis as unknown as { Real?: new (el: Element) => object };
            if (!g.Real)
            {
                throw new Error(
                    '[arianna] VirtualNode.Real requires window.Real (loaded by core/index.ts)',
                );
            }
            this.#real = new g.Real(this.render());
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
     * If the VirtualNode has not been rendered yet (`#dom === null`), the
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


    // ─── Static reactive primitives (convenience re-exports) ─────────────
    static signal     = signal;
    static signalMono = signalMono;
    static sinkText   = sinkText;
    static effect     = effect;
    static computed   = computed;
    static batch      = batch;
    static untrack    = untrack;
    static tpl        = (html: string) => new AriannATemplate(html);
    static template   = (html: string) => new AriannATemplate(html);
}


// ─────────────────────────────────────────────────────────────────────────────
//  Install on window — `Virtual` is the canonical global handle
// ─────────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined')
{
    Object.defineProperty(window, 'Virtual', {
        value        : VirtualNode,
        writable     : false,
        enumerable   : false,
        configurable : false,
    });
}

export default VirtualNode;
