
import { Core } from '../kernel/Core.ts';
import { Services } from '../kernel/Services.ts';
import { Events } from '../reactivity/Events.ts';
import { Namespaces } from './Namespaces.ts';

export namespace Shadows
{
    /** Shadow subsystem descriptor — how a Type uses shadow DOM. Descriptor FACET owned here
     *  (Core references it type-only). Orthogonal to the fragile `Slot` placement on `Type`. */
    export interface Shadow
    {
        Mode            : 'open' | 'closed';
        Css?            : boolean;
        DelegatesFocus? : boolean;
    }
    // ─── Types ─────────────────────────────────────────────────────────────────

    export type ShadowMode    = 'open' | 'closed';
    export type ShadowBackend = 'light' | 'iframe';
    export type IframeProjection = 'adopt' | 'clone';

    /** @name ShadowDescriptor @public @interface
     *  @description Shadow subsystem descriptor — how a type uses shadow DOM for its own
     *  template/encapsulation. Canonical home of the shape formerly declared inline in
     *  `Core` (`Descriptors.Shadow`); Core now takes it via `import type`.
     *  @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
    export interface ShadowDescriptor
    {
        /** @name Mode @public @type {'open'|'closed'} @description Shadow root mode requested when the type renders into shadow. */
        Mode            : ShadowMode;
        /** @name Css @public @type {boolean=} @description When true, the type's registration style is injected into the shadow root (encapsulated) instead of the document. */
        Css?            : boolean;
        /** @name DelegatesFocus @public @type {boolean=} @description Maps to ShadowRoot `delegatesFocus`. */
        DelegatesFocus? : boolean;
    }

    export const shadowService = new Services.Service
    (
        'shadow',
        {
            /** Rende template/shadow del componente. Chiamato dal kernel via Services.Call('shadow','shadow',node,{def,tag}). */
            shadow(node: Element, opts: { def?: Record<string, unknown>; tag?: string }): void
            {
                const host = node as unknown as
                {
                    template?:
                    {
                        attach?: (host: ParentNode, instance: object, signals?: Record<string, unknown>) => unknown;
                        mount?:  (host: Element,    scope: unknown) => unknown;   // legacy v2
                    };
                    __templateRendered?: boolean;
                    __attrSignals?: Record<string, unknown>;
                };

                const def         = opts.def ?? {};
                const tag         = opts.tag ?? '';
                const defShadow   = def.shadow;
                const hasTemplate = !!host.template && !host.__templateRendered;

                let shadowMode: 'open' | 'closed' | false = false;
                if (defShadow === false)                               shadowMode = false;
                else if (defShadow === 'open')                         shadowMode = 'open';
                else if (defShadow === 'closed' || defShadow === true) shadowMode = 'closed';
                else if (hasTemplate && defShadow === undefined)       shadowMode = 'closed';

                const attachShadow = (el: Element, mode: 'open' | 'closed'): ShadowRoot | null =>
                {
                    try   { return el.attachShadow({ mode }); }
                    catch { return el.shadowRoot ?? null; }
                };

                if (hasTemplate)
                {
                    host.__templateRendered = true;
                    const tpl = host.template!;

                    let renderTarget: ParentNode = node;
                    if (shadowMode !== false) {
                        const sr = attachShadow(node, shadowMode);
                        if (sr) { renderTarget = sr; _injectTypeSheetIntoShadow(node, sr); }
                        else { console.warn(`[arianna] attachShadow failed for <${tag}>, falling back to light DOM.`); renderTarget = node; }
                    }

                    const signals = host.__attrSignals ?? {};

                    try {
                        if (typeof tpl.attach === 'function')      tpl.attach(renderTarget, node, signals);  // v3
                        else if (typeof tpl.mount === 'function')  tpl.mount(renderTarget as Element, node);  // v2 legacy
                    } catch (e) {
                        console.warn(`[arianna] template render failed for <${tag}>:`, e);
                    }
                }
                else if (shadowMode !== false)
                {
                    const sr = attachShadow(node, shadowMode);
                    if (sr) _injectTypeSheetIntoShadow(node, sr);
                    if (sr && !(sr as unknown as ParentNode).querySelector?.('slot'))
                        sr.appendChild(document.createElement('slot'));
                }
            },
        }
    );
    /**
     * Options for AttachAriannaShadow. `backend` picks the strategy; the iframe-*
     * fields only apply when backend === 'iframe'.
     */
    export interface AriannaShadowOptions
    {
        /** Backend strategy. Default 'light'. */
        backend?      : ShadowBackend;

        // ── iframe-backend options (ignored for 'light') ──
        /** Sandbox attribute. Default 'allow-same-origin allow-scripts'. */
        sandbox?      : string;
        /** Event types bridged from iframe to host. Default click/input/change/submit/focus/blur. */
        bridgeEvents? : string[];
        /** How light children move into the iframe doc. 'adopt' preserves identity. */
        projection?   : IframeProjection;
        /** Fixed width applied to the iframe element. */
        width?        : string;
        /** Fixed height applied to the iframe element. */
        height?       : string;
        /** Auto-resize the iframe to fit its body. Default true. */
        autoResize?   : boolean;
    }

    /**
     * A slot inside an AriannaShadow. Tracks the anchor Comment that holds the
     * projection point, the slot name (empty string = default slot), and an
     * optional set of fallback nodes shown when no light children are assigned.
     */
    export interface AriannaSlot
    {
        Name        : string;
        Anchor      : Comment;
        Fallback    : Element[];     // cloned from the original <slot>'s children
        Projected   : Node[];        // currently projected light children
    }

    /**
     * An AriannaShadow is a JS object, not a DOM node. It exposes a contract
     * compatible enough with `ShadowRoot` that user code reading
     * `el.Shadow.Root.querySelector(...)` keeps working — regardless of backend.
     *
     * The iframe-only members (`iframe`, `document`, `window`, `send`) are present
     * but null/throwing on the 'light' backend. Check `shadow.Backend` before use.
     */
    export interface AriannaShadow
    {
        /** Marker — used by the single type guard across the framework. */
        readonly IsAriannaShadow: true;

        /** Which backend strategy this shadow uses. */
        readonly Backend: ShadowBackend;

        /** 'open' or 'closed' — informational. */
        readonly Mode: ShadowMode;

        /** The host element (the user's <arianna-*> tag). */
        readonly Host: Element;

        /** Slot registry, keyed by slot name. */
        readonly Slots: Map<string, AriannaSlot>;

        /** Query the shadow's rendered content. */
        querySelector   <T extends Element = Element>(selector: string): T | null;
        querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T>;

        /** Get the currently projected nodes for a named slot (default '' slot). */
        AssignedNodes(slotName?: string): Node[];

        /** Force a re-projection pass. Called by the MutationObserver. */
        ReprojectSlots(): void;

        /** Clean up observers, listeners, and (iframe backend) the iframe element. */
        Dispose(): void;

        // ── iframe-backend members (null/throwing on 'light' backend) ──

        /** The hidden iframe element (iframe backend only; null otherwise). */
        readonly iframe?: HTMLIFrameElement | null;
        /** Same-origin iframe document; null for opaque sandbox mode. */
        readonly document?: Document | null;
        /** Alias for iframe.contentWindow (iframe backend only; null otherwise). */
        readonly window?: Window | null;
        /**
         * postMessage request/reply (iframe backend, cross-origin mode). Resolves
         * when the iframe replies, rejects on timeout. Throws on 'light' backend.
         */
        send?(message: unknown, timeoutMs?: number): Promise<unknown>;
    }


    // ─── Constants ─────────────────────────────────────────────────────────────

    /** Symbol key used to stash the AriannaShadow on the host element.
     *  Same string-keyed registry as `Symbol.for('arianna.shadow.root')` used by
     *  Component.ts — both modules read/write the same slot. */
    export const ARIANNA_SHADOW_KEY: symbol = Symbol.for('arianna.shadow.root');

    /** Attribute set on the host once a shadow has been attached, for debugging. */
    const HOST_FLAG_ATTR = 'data-arianna-shadow';

    /** Anchor marker text — visible in DevTools to help debugging. */
    const SLOT_ANCHOR_PREFIX = 'arianna-slot:';

    /** Internal key used to tag a slot anchor with its slot name (survives importNode lookup). */
    const SLOT_INTERNAL_KEY = Symbol('arianna.shadow.slot');

    const DEFAULT_SANDBOX        = 'allow-same-origin allow-scripts';
    const DEFAULT_BRIDGED_EVENTS = ['click', 'input', 'change', 'submit', 'focus', 'blur'];
    const DEFAULT_SEND_TIMEOUT   = 5000;


    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Type guard. True if `x` is an AriannaShadow (any backend) rather than a
     * native ShadowRoot or null. THE single shadow type guard — there is no
     * separate IsIframeShadow; check `x.Backend === 'iframe'` instead.
     */
    export function IsAriannaShadow(x: unknown): x is AriannaShadow
    {
        return !!x && typeof x === 'object' && (x as { IsAriannaShadow?: true }).IsAriannaShadow === true;
    }

    /** Convenience: true if `x` is an AriannaShadow using the iframe backend. */
    export function IsIframeBackend(x: unknown): x is AriannaShadow
    {
        return IsAriannaShadow(x) && x.Backend === 'iframe';
    }

    /** Read the AriannaShadow (if any) attached to a host element. */
    export function GetAriannaShadow(host: Element): AriannaShadow | null
    {
        const v = (host as unknown as Record<symbol, unknown>)[ARIANNA_SHADOW_KEY];
        return IsAriannaShadow(v) ? v : null;
    }

    /**
     * Attach an AriannaShadow to `host`. Idempotent. The `options.backend`
     * selects 'light' (default) or 'iframe'. The shadow is initialised empty;
     * the caller populates it via RenderIntoAriannaShadow.
     */
    export function AttachAriannaShadow(
        host: Element,
        mode: ShadowMode = 'closed',
        options: AriannaShadowOptions = {},
    ): AriannaShadow
    {
        const existing = GetAriannaShadow(host);
        if (existing) return existing;

        const backend = options.backend ?? 'light';
        return backend === 'iframe'
            ? _attachIframeBackend(host, mode, options)
            : _attachLightBackend(host, mode);
    }

    /**
     * Render a template's output (a DocumentFragment) into an AriannaShadow.
     * Branches on the shadow's backend. Used by the Component template pipeline.
     */
    export function RenderIntoAriannaShadow(shadow: AriannaShadow, templateFragment: DocumentFragment, capturedLight?: Node[]): void
    {
        if (shadow.Backend === 'iframe') {
            if (shadow.document) _renderIntoIframe(shadow, templateFragment, capturedLight);
            return;
        }
        _renderIntoLight(shadow, templateFragment);
    }


    // ═════════════════════════════════════════════════════════════════════════════
    //  BACKEND: LIGHT  (pure-JS light-DOM projection)
    // ═════════════════════════════════════════════════════════════════════════════

    function _attachLightBackend(host: Element, mode: ShadowMode): AriannaShadow
    {
        const slots    = new Map<string, AriannaSlot>();
        let   observer : MutationObserver | null = null;
        let   disposed = false;

        const shadow: AriannaShadow = {
            IsAriannaShadow : true,
            Backend         : 'light',
            Mode            : mode,
            Host            : host,
            Slots           : slots,

            querySelector<T extends Element = Element>(selector: string): T | null {
                return host.querySelector<T>(selector);
            },
            querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
                return host.querySelectorAll<T>(selector);
            },
            AssignedNodes(slotName: string = ''): Node[] {
                const slot = slots.get(slotName);
                return slot ? slot.Projected.slice() : [];
            },
            ReprojectSlots(): void {
                if (disposed) return;
                _projectSlotsLight(host, slots);
            },
            Dispose(): void {
                if (disposed) return;
                disposed = true;
                if (observer) observer.disconnect();
                try { host.removeAttribute(HOST_FLAG_ATTR); } catch { /* ignore */ }
                try { delete (host as unknown as Record<symbol, unknown>)[ARIANNA_SHADOW_KEY]; } catch { /* ignore */ }
            },

            // iframe members absent on light backend
            iframe   : null,
            document : null,
            window   : null,
        };

        // Default slot — guarantees a projection target for unslotted host content
        // (e.g. constructor-created `this.textContent = …`). Without it, _assignLightChildrenToSlots
        // drops any node whose `slot` doesn't match a registered slot, so content with
        // no explicit slot vanishes (the empty-box bug). Mirrors the native backend,
        // which auto-inserts a default <slot>. The anchor is (re)attached to the host
        // by _projectSlotsLight, so a `this.textContent` write that wipes it is recovered.
        {
            const defAnchor = document.createComment(`${SLOT_ANCHOR_PREFIX}default`);
            (defAnchor as unknown as Record<symbol, string>)[SLOT_INTERNAL_KEY] = '';
            slots.set('', { Name: '', Anchor: defAnchor, Fallback: [], Projected: [] });
        }

        (host as unknown as Record<symbol, unknown>)[ARIANNA_SHADOW_KEY] = shadow;
        try { host.setAttribute(HOST_FLAG_ATTR, mode); } catch { /* ignore */ }

        observer = new MutationObserver(records => {
            if (disposed) return;
            let shouldReproject = false;
            for (const r of records) {
                if (r.target === host && r.type === 'childList') { shouldReproject = true; break; }
            }
            if (shouldReproject) shadow.ReprojectSlots();
        });
        observer.observe(host, { childList: true });

        return shadow;
    }

    function _renderIntoLight(shadow: AriannaShadow, templateFragment: DocumentFragment): void
    {
        const host = shadow.Host;

        // 1. Snapshot light children, detach them.
        const lightChildren: Node[] = [];
        while (host.firstChild) {
            lightChildren.push(host.firstChild);
            host.removeChild(host.firstChild);
        }

        // 2. Process <slot> → Comment anchors + slot registry.
        _processSlots(templateFragment, shadow.Slots);

        // 3. Append the processed template into the host (light DOM).
        host.appendChild(templateFragment);

        // 4. Project light children.
        _assignLightChildrenToSlots(lightChildren, shadow.Slots);
        _projectSlotsLight(host, shadow.Slots);
    }

    function _projectSlotsLight(host: Element, slots: Map<string, AriannaSlot>): void
    {
        const lightChildren = _collectLightChildren(host);
        if (lightChildren.length) _assignLightChildrenToSlots(lightChildren, slots);

        // Recover the default-slot anchor if a `this.textContent` write (or any full
        // light-DOM replacement) wiped it. Otherwise its parentNode is null and the
        // projection loop below `continue`s past it, losing unslotted content.
        const _def = slots.get('');
        if (_def && !_def.Anchor.parentNode) host.appendChild(_def.Anchor);

        for (const slot of slots.values()) {
            _clearProjectedAfterAnchor(slot);

            const toInsert = slot.Projected.length > 0
                ? slot.Projected
                : slot.Fallback.map(n => n.cloneNode(true) as Node);

            const parent = slot.Anchor.parentNode;
            if (!parent) continue;

            let cursor: Node = slot.Anchor;
            for (const node of toInsert) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    (node as Element).setAttribute('data-arianna-projected', slot.Name || 'default');
                }
                parent.insertBefore(node, cursor.nextSibling);
                cursor = node;
            }

            _dispatchSlotChange(host, slot.Name);
        }
    }


    // ═════════════════════════════════════════════════════════════════════════════
    //  BACKEND: IFRAME  (hard isolation via hidden sandboxed iframe)
    // ═════════════════════════════════════════════════════════════════════════════

    function _attachIframeBackend(host: Element, mode: ShadowMode, options: AriannaShadowOptions): AriannaShadow
    {
        const sandbox          = options.sandbox ?? DEFAULT_SANDBOX;
        const sameOriginAccess = sandbox.split(/\s+/).includes('allow-same-origin');
        const bridgeEvents     = options.bridgeEvents ?? DEFAULT_BRIDGED_EVENTS.slice();
        const projection       = options.projection ?? (sameOriginAccess ? 'adopt' : 'clone');
        const autoResize       = options.autoResize ?? true;

        const slots = new Map<string, AriannaSlot>();

        // Build the hidden iframe.
        const iframe = document.createElement('iframe');
        iframe.setAttribute('sandbox', sandbox);
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.border     = '0';
        iframe.style.padding    = '0';
        iframe.style.margin     = '0';
        iframe.style.display    = 'block';
        iframe.style.width      = options.width  ?? '100%';
        iframe.style.height     = options.height ?? 'auto';
        iframe.style.background = 'transparent';
        iframe.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>';

        try {
            const computed = window.getComputedStyle(host as HTMLElement);
            if (computed.display === 'inline') iframe.style.display = 'inline-block';
        } catch { /* ignore */ }

        host.appendChild(iframe);

        // Chrome (and other engines) expose iframe.contentDocument SYNCHRONOUSLY
        // after appendChild — but it is a transient initial about:blank document.
        // The srcdoc content loads ASYNCHRONOUSLY and REPLACES that document. If we
        // inject into the blank doc, the srcdoc load wipes our content. Track the
        // real load so the renderer only writes into the settled srcdoc document.
        (iframe as unknown as { __srcdocLoaded?: boolean }).__srcdocLoaded = false;
        iframe.addEventListener('load', () => {
            (iframe as unknown as { __srcdocLoaded?: boolean }).__srcdocLoaded = true;
        }, { once: true });

        const pendingReplies = new Map<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void; timer: number }>();
        let   nextCorrelationId = 1;
        let   disposed   = false;
        let   observer   : MutationObserver | null = null;
        let   resizeObs  : ResizeObserver   | null = null;
        const bridgeListeners: Array<{ type: string; fn: EventListener }> = [];

        const shadow: AriannaShadow = {
            IsAriannaShadow : true,
            Backend         : 'iframe',
            Mode            : mode,
            Host            : host,
            Slots           : slots,

            get iframe()   { return iframe; },
            get document() { return sameOriginAccess ? iframe.contentDocument : null; },
            get window()   { return iframe.contentWindow; },

            querySelector<T extends Element = Element>(selector: string): T | null {
                if (!sameOriginAccess) return null;
                const doc = iframe.contentDocument;
                return doc ? doc.querySelector<T>(selector) : null;
            },
            querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
                if (!sameOriginAccess)
                    return document.createDocumentFragment().querySelectorAll<T>(selector);
                const doc = iframe.contentDocument;
                if (!doc) return document.createDocumentFragment().querySelectorAll<T>(selector);
                return doc.querySelectorAll<T>(selector);
            },
            AssignedNodes(slotName: string = ''): Node[] {
                const slot = slots.get(slotName);
                return slot ? slot.Projected.slice() : [];
            },
            ReprojectSlots(): void {
                if (disposed || !sameOriginAccess) return;
                _projectSlotsIframe(host, iframe, slots, projection);
            },
            send(message: unknown, timeoutMs: number = DEFAULT_SEND_TIMEOUT): Promise<unknown> {
                if (disposed)
                    return Promise.reject(new Error('AriannaShadow is disposed'));

                return new Promise((resolve, reject) => {
                    if (disposed)
                    {
                        reject(new Error('AriannaShadow is disposed'));
                        return;
                    }
                    const win = iframe.contentWindow;
                    if (!win) { reject(new Error('iframe has no contentWindow')); return; }
                    const id = String(nextCorrelationId++);
                    const timer = window.setTimeout(() => {
                        pendingReplies.delete(id);
                        reject(new Error(`AriannaShadow.send timed out after ${timeoutMs}ms`));
                    }, timeoutMs);
                    pendingReplies.set(id, { resolve, reject, timer });
                    win.postMessage({ __arianna: true, id, payload: message }, '*');
                });
            },
            Dispose(): void {
                if (disposed) return;
                disposed = true;
                try { observer?.disconnect();  } catch { /* ignore */ }
                try { resizeObs?.disconnect(); } catch { /* ignore */ }
                if (sameOriginAccess) {
                    for (const { type, fn } of bridgeListeners) {
                        try { iframe.contentDocument?.removeEventListener(type, fn, true); } catch { /* ignore */ }
                    }
                }
                bridgeListeners.length = 0;
                for (const [, p] of pendingReplies) { clearTimeout(p.timer); p.reject(new Error('AriannaShadow disposed')); }
                pendingReplies.clear();
                window.removeEventListener('message', onMessage);
                try { iframe.remove(); } catch { /* ignore */ }
                try { delete (host as unknown as Record<symbol, unknown>)[ARIANNA_SHADOW_KEY]; } catch { /* ignore */ }
            },
        };

        (host as unknown as Record<symbol, unknown>)[ARIANNA_SHADOW_KEY] = shadow;
        try { host.setAttribute(HOST_FLAG_ATTR, mode + ':iframe'); } catch { /* ignore */ }

        // Event bridge: re-dispatch configured events from iframe doc onto host.
        const installBridge = () => {
            if (!sameOriginAccess) return;
            const doc = iframe.contentDocument;
            if (!doc) return;
            for (const type of bridgeEvents) {
                const fn: EventListener = (e: Event) => {
                    if (disposed) return;
                    try {
                        Events.Event.Fire(host, {
                            Type: type,
                            Detail: { source: e.target, originalEvent: e },
                            Propagation: true,
                        });
                    } catch { /* ignore */ }
                };
                doc.addEventListener(type, fn, true);
                bridgeListeners.push({ type, fn });
            }
        };

        // postMessage receiver for send() replies.
        const onMessage = (ev: MessageEvent) => {
            if (disposed) return;
            if (ev.source !== iframe.contentWindow) return;
            const data = ev.data as { __arianna_reply?: boolean; id?: string; payload?: unknown } | null;
            if (!data || typeof data !== 'object' || !data.__arianna_reply || !data.id) return;
            const pending = pendingReplies.get(data.id);
            if (!pending) return;
            pendingReplies.delete(data.id);
            clearTimeout(pending.timer);
            pending.resolve(data.payload);
        };
        window.addEventListener('message', onMessage);

        // MutationObserver on host for light-children changes (ignoring the iframe).
        if (sameOriginAccess) observer = new MutationObserver(records => {
            if (disposed) return;
            let shouldReproject = false;
            for (const r of records) {
                if (r.target === host && r.type === 'childList') {
                    let onlyIframe = false;
                    r.addedNodes.forEach(n => { if (n === iframe) onlyIframe = true; });
                    if (onlyIframe && r.addedNodes.length === 1 && r.removedNodes.length === 0) continue;
                    shouldReproject = true;
                    break;
                }
            }
            if (shouldReproject) shadow.ReprojectSlots();
        });
        if (observer) observer.observe(host, { childList: true });

        // Auto-resize via ResizeObserver. We must size the iframe to the FULL
        // document height — documentElement.scrollHeight — not the body's
        // contentRect. The component's :host styles are rewritten to `html`, so
        // padding/borders live on <html>; the body's contentRect excludes them and
        // would size the iframe too small (clipping the content). Observe both the
        // documentElement and body so any layout change re-fires.
        if (autoResize && sameOriginAccess) {
            const installResize = () => {
                const doc = iframe.contentDocument;
                if (!doc || !doc.body || !doc.documentElement) return false;
                try {
                    const measure = () => {
                        if (disposed) return;
                        const root = iframe.contentDocument?.documentElement;
                        if (!root) return;
                        const h = root.scrollHeight;
                        if (h > 0) iframe.style.height = h + 'px';
                    };
                    resizeObs = new ResizeObserver(() => measure());
                    resizeObs.observe(doc.documentElement);
                    resizeObs.observe(doc.body);
                    measure();
                    return true;
                } catch { return false; }
            };
            if (!installResize()) iframe.addEventListener('load', installResize, { once: true });
        }

        if (sameOriginAccess) {
            if (iframe.contentDocument) installBridge();
            else iframe.addEventListener('load', installBridge, { once: true });
        }

        return shadow;
    }

    function _renderIntoIframe(shadow: AriannaShadow, templateFragment: DocumentFragment, capturedLight?: Node[]): void
    {
        const iframe = shadow.iframe;
        const doc    = shadow.document ?? null;
        if (!iframe) return;

        const host = shadow.Host;

        // 1. Snapshot light children (everything except the iframe) NOW — at call
        //    time — so constructor-created content is captured before any async deferral.
        //    On a deferred re-entry we reuse the already-captured snapshot.
        const lightChildren: Node[] = capturedLight ?? [];
        if (!capturedLight) {
            for (const child of Array.from(host.childNodes)) {
                if (child !== iframe) lightChildren.push(child);
            }
            for (const child of lightChildren) { try { host.removeChild(child); } catch { /* ignore */ } }
        }

        // Only write once the srcdoc document has SETTLED. In Chrome, `doc` is
        // non-null immediately (transient blank doc) — writing now would be wiped
        // by the async srcdoc load. Defer to the load event unless it already fired.
        const srcdocLoaded = (iframe as unknown as { __srcdocLoaded?: boolean }).__srcdocLoaded === true;
        if (!doc || !doc.body || !srcdocLoaded) {
            iframe.addEventListener('load', () => _renderIntoIframe(shadow, templateFragment, lightChildren), { once: true });
            return;
        }

        // 2. Process <slot> → Comment anchors in the OUTER fragment.
        _processSlots(templateFragment, shadow.Slots);

        // 3. Import the processed fragment into the iframe document.
        const imported = doc.importNode(templateFragment, true) as DocumentFragment;

        // 4. Re-link slot anchors to the imported (live) comments.
        _relinkSlotAnchorsAfterImport(imported, shadow.Slots);

        // 5. Replace iframe body content.
        doc.body.innerHTML = '';
        doc.body.appendChild(imported);

        // 6. Project light children into the iframe document.
        const projection: IframeProjection =
            (shadow as unknown as { __projection?: IframeProjection }).__projection ?? 'adopt';
        _assignLightChildrenToSlots(lightChildren, shadow.Slots);
        _projectSlotsIframe(host, iframe, shadow.Slots, projection);
    }

    function _projectSlotsIframe(
        host: Element,
        iframe: HTMLIFrameElement,
        slots: Map<string, AriannaSlot>,
        mode: IframeProjection,
    ): void
    {
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;

        for (const slot of slots.values()) {
            _clearProjectedAfterAnchor(slot);

            const sourceNodes = slot.Projected.length > 0
                ? slot.Projected
                : slot.Fallback.map(n => n.cloneNode(true) as Node);

            const parent = slot.Anchor.parentNode;
            if (!parent) continue;

            let cursor: Node = slot.Anchor;
            for (const sourceNode of sourceNodes) {
                let dstNode: Node;
                if (mode === 'adopt') {
                    try { dstNode = iframeDoc.adoptNode(sourceNode); }
                    catch { dstNode = iframeDoc.importNode(sourceNode, true); }
                } else {
                    dstNode = iframeDoc.importNode(sourceNode, true);
                }
                if (dstNode.nodeType === Node.ELEMENT_NODE) {
                    (dstNode as Element).setAttribute('data-arianna-projected', slot.Name || 'default');
                }
                parent.insertBefore(dstNode, cursor.nextSibling);
                cursor = dstNode;
            }

            _dispatchSlotChange(host, slot.Name);
        }
    }

    /**
     * After importNode copies the fragment into the iframe document, the Comment
     * anchors stored in slots point at the OUTER document. Find the corresponding
     * comments in the imported tree and re-point each slot's Anchor.
     */
    function _relinkSlotAnchorsAfterImport(imported: DocumentFragment, slots: Map<string, AriannaSlot>): void
    {
        const doc = imported.ownerDocument;
        if (!doc) return;
        const walker = doc.createTreeWalker(imported, NodeFilter.SHOW_COMMENT);
        const byName = new Map<string, Comment>();
        let node = walker.nextNode() as Comment | null;
        while (node) {
            const data = node.data || '';
            if (data.startsWith(SLOT_ANCHOR_PREFIX)) {
                const raw  = data.substring(SLOT_ANCHOR_PREFIX.length);
                const name = raw === 'default' ? '' : raw;
                byName.set(name, node);
            }
            node = walker.nextNode() as Comment | null;
        }
        for (const [name, slot] of slots) {
            const fresh = byName.get(name);
            if (fresh) slot.Anchor = fresh;
        }
    }


    // ═════════════════════════════════════════════════════════════════════════════
    //  SHARED HELPERS  (used by both backends)
    // ═════════════════════════════════════════════════════════════════════════════

    /**
     * Walk `fragment` and convert every <slot> element into an anchor Comment
     * + a registered AriannaSlot. The <slot>'s children become the slot's
     * fallback content.
     */
    function _processSlots(fragment: DocumentFragment, slots: Map<string, AriannaSlot>): void
    {
        const slotEls = Array.from(fragment.querySelectorAll('slot'));
        for (const slotEl of slotEls) {
            const name   = slotEl.getAttribute('name') || '';
            const anchor = document.createComment(`${SLOT_ANCHOR_PREFIX}${name || 'default'}`);
            (anchor as unknown as Record<symbol, string>)[SLOT_INTERNAL_KEY] = name;

            const fallback: Element[] = [];
            for (const child of Array.from(slotEl.children)) {
                fallback.push(child.cloneNode(true) as Element);
            }

            const slot: AriannaSlot = { Name: name, Anchor: anchor, Fallback: fallback, Projected: [] };
            slotEl.parentNode?.replaceChild(anchor, slotEl);
            slots.set(name, slot);
        }
    }

    /** Distribute light children into slots by their `slot=""` attribute. */
    function _assignLightChildrenToSlots(lightChildren: Node[], slots: Map<string, AriannaSlot>): void
    {
        for (const slot of slots.values()) slot.Projected = [];

        for (const node of lightChildren) {
            let target = '';
            if (node.nodeType === Node.ELEMENT_NODE) {
                target = (node as Element).getAttribute('slot') || '';
            }
            const slot = slots.get(target);
            if (slot) slot.Projected.push(node);
        }
    }

    /** Remove previously-projected siblings after a slot anchor. */
    function _clearProjectedAfterAnchor(slot: AriannaSlot): void
    {
        const parent = slot.Anchor.parentNode;
        if (!parent) return;
        const tag = slot.Name || 'default';
        let next: Node | null = slot.Anchor.nextSibling;
        while (next) {
            const candidate = next;
            next = next.nextSibling;
            if (candidate.nodeType === Node.COMMENT_NODE) break;
            if (candidate.nodeType === Node.ELEMENT_NODE) {
                const e = candidate as Element;
                if (e.getAttribute('data-arianna-projected') === tag) { parent.removeChild(e); continue; }
                break;
            }
            break;
        }
    }

    /** Collect direct children of host that are light content (light backend only). */
    function _collectLightChildren(host: Element): Node[]
    {
        const out: Node[] = [];
        for (const child of Array.from(host.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const e = child as Element;
                if (e.hasAttribute('data-arianna-projected')) continue;
                if (e.hasAttribute('data-arianna-template'))  continue;
                if (e.hasAttribute('slot')) { out.push(child); continue; }
            }
        }
        return out;
    }

    /** Dispatch the arianna-slotchange event on the host (registered as Types.AriannA.SlotChange). */
    function _dispatchSlotChange(host: Element, slotName: string): void
    {
        try {
            Events.Event.Fire(host, {
                Type: Events.Event.Registry.AriannA.SlotChange.Name,
                Detail: { slotName },
                Propagation: false,
            });
        } catch { /* ignore */ }
    }

    /** @name        toHost
     *  @public
     *  @param       {string} cssText   Compiled CSS whose rules are class-scoped (`.ClassName…`).
     *  @param       {string} className The type's class name (descriptor.Name) currently scoping the rules.
     *  @returns     {string} The same CSS with `.ClassName` rewritten to `:host` (flat form).
     *  @description Inverse of the light-DOM convention. Components author their type style
     *               class-scoped — `.CodeEditor`, `.CodeEditor .child`, `.CodeEditor:hover` —
     *               which matches directly in light DOM (the common case, no rewrite). Only when
     *               a component runs with a shadow root does Shadow rewrite that class scope to
     *               `:host` before injecting into the shadow, where `:host` is the correct host
     *               selector. Flat form (no `:host(...)` parens):
     *                 `.ClassName`         → `:host`
     *                 `.ClassName:hover`   → `:host:hover`
     *                 `.ClassName.on`      → `:host.on`
     *                 `.ClassName .child`  → `:host .child`
     *               Called from the shadow-attach path only; the light-DOM path leaves CSS as-is.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @memberof    Shadow
     */
    export function toHost(cssText: string, className: string): string
    {
        if (!cssText || !className) return cssText;
        // Escape regex metacharacters in the class name, then replace every `.ClassName`
        // occurrence with `:host`. `\.` anchors the leading dot; the class-name boundary
        // guards against matching a longer name (`.CodeEditorX`).
        const esc = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return cssText.replace(new RegExp('\\.' + esc + '(?![\\w-])', 'g'), ':host');
    }

    /** Shadow roots already given their type <style>, so injection is idempotent. */
    const _shadowSheeted = new WeakSet<ShadowRoot>();

    /** @name        _injectTypeSheetIntoShadow
     *  @private
     *  @param       {Element}    host The custom element receiving a shadow root.
     *  @param       {ShadowRoot} sr   The freshly attached shadow root.
     *  @returns     {void}
     *  @description Head-injected type CSS (`.ClassName`-scoped) does NOT cross the shadow
     *               boundary, so a shadow component's internals would be unstyled. This pulls
     *               the type's `descriptor.Css` (authored class-scoped), rewrites `.ClassName`
     *               → `:host` via `toHost` — the correct host selector INSIDE a shadow root —
     *               and appends it as a `<style>` to the shadow root. Idempotent per root.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @memberof    Shadow
     */
    function _injectTypeSheetIntoShadow(host: Element, sr: ShadowRoot): void
    {
        if (_shadowSheeted.has(sr)) return;

        const desc = Namespaces.Namespace.Resolve(host);
        if (!desc || !desc.Stylesheet) return;

        const style = document.createElement('style');
        style.textContent = toHost(desc.Stylesheet, desc.Name);

        sr.appendChild(style);
        _shadowSheeted.add(sr);
    }
}

// ── Public surface: top-level re-exports (Component imports these by name). ──
export const shadowService           = Shadows.shadowService;
export const ARIANNA_SHADOW_KEY      = Shadows.ARIANNA_SHADOW_KEY;
export const IsAriannaShadow         = Shadows.IsAriannaShadow;
export const IsIframeBackend         = Shadows.IsIframeBackend;
export const GetAriannaShadow        = Shadows.GetAriannaShadow;
export const AttachAriannaShadow     = Shadows.AttachAriannaShadow;
export const RenderIntoAriannaShadow = Shadows.RenderIntoAriannaShadow;
export const toHost                  = Shadows.toHost;

export type ShadowMode           = Shadows.ShadowMode;
export type ShadowBackend        = Shadows.ShadowBackend;
export type IframeProjection     = Shadows.IframeProjection;
export type AriannaShadowOptions = Shadows.AriannaShadowOptions;
export type AriannaSlot          = Shadows.AriannaSlot;
export type AriannaShadow        = Shadows.AriannaShadow;

if (typeof window !== 'undefined')
{
    Object.defineProperty(window, 'Shadows', { value: Shadows, writable: false, enumerable: false, configurable: false });
}


export default Shadows;
