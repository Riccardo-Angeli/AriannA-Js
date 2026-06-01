// ─────────────────────────────────────────────────────────────────────────────
//  Shadow.ts — AriannA Shadow DOM emulation (single module, two backends)
//
//  Why this exists
//  ───────────────
//  Native `Element.attachShadow()` is restricted by the HTML spec to elements
//  whose interface descends from a small whitelist (HTMLElement subclasses with
//  `is="..."` for builtins, or autonomous custom elements *registered* via
//  `customElements.define`). AriannA deliberately does NOT call
//  `customElements.define` for its `arianna-*` tags — the framework's own
//  Namespace registry is the source of truth for upgrade semantics. As a
//  consequence, attempting `attachShadow()` on an unregistered `<arianna-*>`
//  throws `NotSupportedError`.
//
//  This module provides ONE type — `AriannaShadow` — that emulates the
//  ShadowRoot contract, with TWO selectable backends:
//
//    backend 'light'  (default) — pure-JS, light-DOM projection.
//        • Template output is moved into the host element (light DOM).
//        • Slot projection by DOM reparenting around Comment anchors.
//        • CSS scoping via `data-arianna-instance` attribute selectors
//          (handled by Component._applySheet, not here).
//        • SOFT isolation: page-global selectors still pierce. No event
//          retargeting. Very low cost. Good for the 80% case.
//
//    backend 'iframe' — hard isolation via a hidden sandboxed <iframe>.
//        • Template output is imported into the iframe's contentDocument.
//        • Slot projection by adopt/clone of light children into iframe doc.
//        • CSS scoping is the iframe document boundary itself (HARD).
//        • Event retargeting via a bridge that re-dispatches on the host.
//        • postMessage `send()` for cross-origin sandbox mode.
//        • HIGH cost (a full Document per instance). Good for plug-in slots,
//          sandboxed code, third-party embeds.
//
//  CRITICAL DESIGN RULE
//  ────────────────────
//  There is ONE shadow type (`AriannaShadow`), ONE type guard
//  (`IsAriannaShadow`), ONE attach function (`AttachAriannaShadow`), ONE
//  render function (`RenderIntoAriannaShadow`). The backend is a FIELD on the
//  object (`shadow.Backend`), not a parallel type or a parallel module. This
//  is deliberate: a parallel `IframeShadow` module would be a parallel
//  registry, which AriannA forbids (see COMPONENTS.md §36). The iframe is a
//  BACKEND of AriannaShadow, not a different kind of shadow.
//
//  Everything is stashed on the host under `Symbol.for('arianna.shadow.root')`,
//  exactly like before. Downstream code that reads `host.Shadow.Root` and
//  calls `.querySelector(...)` is unaffected by the backend choice.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ─────────────────────────────────────────────────────────────────

export type ShadowMode    = 'open' | 'closed';
export type ShadowBackend = 'light' | 'iframe';
export type IframeProjection = 'adopt' | 'clone';

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
    /** Alias for iframe.contentDocument (iframe backend only; null otherwise). */
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
    if (shadow.Backend === 'iframe') _renderIntoIframe(shadow, templateFragment, capturedLight);
    else                             _renderIntoLight(shadow, templateFragment);
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
    const sandbox      = options.sandbox      ?? DEFAULT_SANDBOX;
    const bridgeEvents = options.bridgeEvents ?? DEFAULT_BRIDGED_EVENTS.slice();
    const projection   = options.projection   ?? (sandbox.includes('allow-same-origin') ? 'adopt' : 'clone');
    const autoResize   = options.autoResize   ?? true;

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
        get document() { return iframe.contentDocument; },
        get window()   { return iframe.contentWindow; },

        querySelector<T extends Element = Element>(selector: string): T | null {
            const doc = iframe.contentDocument;
            return doc ? doc.querySelector<T>(selector) : null;
        },
        querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
            const doc = iframe.contentDocument;
            if (!doc) return document.createDocumentFragment().querySelectorAll<T>(selector);
            return doc.querySelectorAll<T>(selector);
        },
        AssignedNodes(slotName: string = ''): Node[] {
            const slot = slots.get(slotName);
            return slot ? slot.Projected.slice() : [];
        },
        ReprojectSlots(): void {
            if (disposed) return;
            _projectSlotsIframe(host, iframe, slots, projection);
        },
        send(message: unknown, timeoutMs: number = DEFAULT_SEND_TIMEOUT): Promise<unknown> {
            return new Promise((resolve, reject) => {
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
            for (const { type, fn } of bridgeListeners) {
                try { iframe.contentDocument?.removeEventListener(type, fn, true); } catch { /* ignore */ }
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
        const doc = iframe.contentDocument;
        if (!doc) return;
        for (const type of bridgeEvents) {
            const fn: EventListener = (e: Event) => {
                if (disposed) return;
                try {
                    host.dispatchEvent(new CustomEvent(type, {
                        detail: { source: e.target, originalEvent: e },
                        bubbles: true,
                        composed: true,
                    }));
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
    observer = new MutationObserver(records => {
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
    observer.observe(host, { childList: true });

    // Auto-resize via ResizeObserver. We must size the iframe to the FULL
    // document height — documentElement.scrollHeight — not the body's
    // contentRect. The component's :host styles are rewritten to `html`, so
    // padding/borders live on <html>; the body's contentRect excludes them and
    // would size the iframe too small (clipping the content). Observe both the
    // documentElement and body so any layout change re-fires.
    if (autoResize) {
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

    if (iframe.contentDocument) installBridge();
    else iframe.addEventListener('load', installBridge, { once: true });

    return shadow;
}

function _renderIntoIframe(shadow: AriannaShadow, templateFragment: DocumentFragment, capturedLight?: Node[]): void
{
    const iframe = shadow.iframe;
    const doc    = shadow.document ?? null;
    if (!iframe) return;

    const host = shadow.Host;

    // 1. Snapshot light children (everything except the iframe) NOW — at call
    //    time — so build()'s content is captured before any async deferral.
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

/** Dispatch the arianna:slotchange CustomEvent on the host. */
function _dispatchSlotChange(host: Element, slotName: string): void
{
    try {
        host.dispatchEvent(new CustomEvent('arianna:slotchange', {
            detail: { slotName },
            bubbles: false,
            composed: false,
        }));
    } catch { /* ignore */ }
}
