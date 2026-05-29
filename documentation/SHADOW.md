# AriannA — Shadow

> **The complete Shadow DOM story in AriannA: native, polyfilled, iframe-isolated, and light. Why each mode exists, when to use it, how it works mechanically, and what guarantees it provides.**
>
> Companion to `COMPONENTS.md` §6 (which covers the user-facing API). This document goes deep on the internals and the architectural rationale.
>
> Audience: framework users picking a shadow mode, contributors implementing shadow features, anyone debugging "why doesn't my CSS isolation work as expected".

---

## Table of Contents

- §0. THE SHADOW POLICY (authoritative — read first)
- §1. The problem space
- §2. Why Shadow DOM has no polyfills (recap)
- §3. AriannA's five modes
- §4. Mode 1 — Native Shadow DOM
- §5. Mode 2 — AriannaShadow (light-DOM polyfill)
- §6. Mode 3 — AriannaShadow iframe backend (hard isolation)
- §7. Mode 4 — Light DOM (no shadow)
- §8. The automatic escalation policy
- §9. Communication across the boundary
- §10. Stylesheet/Rule integration in every mode
- §11. Closed mode in every mode (and why "closed" doesn't mean "unreachable")
- §12. Slot projection in every mode
- §13. Performance / cost matrix
- §14. Choosing a mode for your component
- §15. Migration: existing components → IframeShadow
- §16. The unified shadow contract

---

## §0. THE SHADOW POLICY (authoritative — read first)

This section is contract-grade. Where any later section conflicts with it, this section wins.

### §0.1. `Shadow.Root` lives on the Component (the embedded field)

A component **is** its custom element (Lit-like, embedded — see `COMPONENTS.md` §0.4). The `Shadow` property and its `Shadow.Root` are **mass conferred by the embedded Component layer** onto that element (the Higgs model, `COMPONENTS.md` §0.1.1). A bare DOM node — standard or custom — has no `Shadow.Root`; the component-element has it because it carries the Component layer. `document.querySelector('arianna-button').Shadow.Root` therefore works: the queried node IS the component.

### §0.2. The shadow is "openable but sealed" — populated ONLY through the AriannA model

The shadow gives **genuine encapsulation** (sealed) yet is **inspectable** (openable, §0.3). You populate it **only** through two AriannA channels — never by touching the raw shadow node or raw slots:

```
   CSS into the shadow   → ONLY via Stylesheet / Rule
   Slots / elements      → ONLY via the AriannA Templating System
```

This is what makes the **same component code** work identically across all backends (native / light / iframe): you never write backend-specific raw-shadow code, so there is nothing backend-specific to break. Hand-touching `attachShadow` / `shadowRoot` / raw `<slot>` voids this guarantee.

### §0.3. OPEN is the default for ALL components

**Every component defaults to `shadow: 'open'`.** Consequences:

- `Shadow.Root` is inspectable; `Shadow.Root.querySelector(...)` works; from the node you reach the component (the node IS the component).
- **Open is what permits NON-STANDARD tags.** The open path upgrades via AriannA's own `Namespace.Update`, **not** via the browser's `customElements` registry. So AriannA accepts tags the native standard rejects — `Ciao`, `Unità`, `SetteTE`, `papa`, anything — not just hyphenated ASCII like `arianna-button`. This is a core differentiator: AriannA makes Standard DOM behave with JSX-like ergonomics **without** JSX and **without** the native custom-element tag restrictions.

### §0.4. CLOSED is the SINGLE EXCEPTION — and the ONLY place AriannA uses native `customElements`

`def.shadow: 'closed'` is the one mode that departs from the AriannA model:

- It delegates to the browser's **native `customElements.define`** — the only place in the entire framework that does so.
- Therefore the tag **MUST** be standard-compliant: hyphenated, lowercase, ASCII (e.g. `arianna-button`). **Non-standard tags cannot use closed.** Trying to use `closed` with `Ciao`/`Unità` is an error.
- It must be chosen **intentionally**, accepting the trade-offs: you gain true browser-native closed encapsulation; you lose the non-standard-tag freedom and the AriannA light/iframe cross-backend behaviour for that component.
- It is **not** the default precisely because closed shadow roots cause more practical problems than they solve (inspection, testing, interop) and are incompatible with non-standard tags.

> **Contract summary.**
> **OPEN** (default): AriannA upgrade · any tag · inspectable · sealed-but-openable · populated via Stylesheet/Rule + Templating · cross-backend.
> **CLOSED** (opt-in exception): native `customElements.define` · standard hyphenated tag ONLY · true native closed encapsulation · forfeits non-standard tags and cross-backend behaviour.

### §0.5. Relationship to the modes below

The mode sections (§4–§7) describe the backends that implement OPEN (native open, AriannA light, iframe) and the LIGHT (`shadow:false`) and CLOSED (native) options. §0 governs *policy*; §4–§7 govern *mechanics*. The escalation policy (§8) only ever picks among OPEN-compatible backends unless `closed` was explicitly requested.

---

## §1. The problem space

A web framework that wants to ship reusable components needs three things from its rendering boundary:

1. **CSS encapsulation** — the component's styles do not leak out; outer styles do not leak in (or, with `:host`, only by explicit invitation).
2. **Slot projection** — light children placed by the consumer end up in the right place inside the component's internal tree.
3. **DOM identity** — the component knows what it owns; querying does not accidentally cross into consumer-owned territory.

The W3C answer to all three is **Shadow DOM**: `element.attachShadow({ mode })` returns a `ShadowRoot` that provides exactly these guarantees, plus event retargeting and accessibility tree flattening.

But Shadow DOM has constraints AriannA deliberately did not accept:

- It requires `customElements.define(tag, class)` for autonomous custom elements with `HTMLElement` as base. The `define` call is **one-shot, irrevocable, global**.
- It doesn't work on `HTMLUnknownElement` instances (`<arianna-button>` created by the parser is not allowed to call `attachShadow`).
- "Closed" mode is shallow — `Symbol`s on the host can leak the reference, and the framework needs SOME way to manipulate the shadow.
- CSS isolation, while strong, is not as hard as a separate `Document`. Some inheriting properties (`color`, `font`) cross the boundary by design.

AriannA needed all three guarantees, with the freedom to ignore `customElements.define`. This document describes the four modes the framework provides, and the algorithm that picks one.

---

## §2. Why Shadow DOM has no polyfills (recap)

Polyfilling Shadow DOM in JavaScript would require reimplementing in JS:

- The HTML parser (slot distribution is a flatten-tree rule applied during layout)
- The CSS cascade resolver (`:host`, `::slotted()`, `::part()` are not selectors, they're scoping rules)
- The event dispatch system (retargeting happens in the dispatch loop, below `addEventListener`)
- The accessibility tree builder (screen readers see flattened tree, not DOM tree)
- Form participation, focus delegation, autofocus, label association — each is integrated with shadow boundaries

The only serious attempt — **Shady DOM** (Google Polymer team, 2014-2017) — was deprecated. The webcomponents.org guidance today is to not polyfill Shadow DOM at all; either use it (where the browser supports it) or use alternative strategies (CSS Modules, BEM, scoped styles).

AriannA's stance: **don't polyfill Shadow DOM — provide multiple alternative paths that each give SOME of the shadow guarantees, and let the user pick.**

The four paths described in §4-§7 each pick a different point on the (cost, isolation, native-feature-coverage) tradeoff curve.

---

## §3. AriannA's five modes

Set via `def.shadow` on the component:

| `def.shadow` value | Mode | CSS isolation | Event retargeting | Slot projection | Cost per instance | Best for |
|---|---|---|---|---|---|---|
| `'open'` (default) | **Native open** (or AriannA light fallback) | Hard (browser) / soft (light) | Native / emulated | Native / emulated | Very low | ALL components by default; the only mode that accepts non-standard tags |
| `'closed'` | **Native closed** | Hard (browser) | Native | Native | Very low | Standard-tag components needing true native closed encapsulation (opt-in exception, §0.4) |
| `'arianna'` | **AriannaShadow — light backend** | Soft (instance-id) | None | JS-emulated | Very low | `<arianna-*>` autonomous tags |
| `'iframe'` | **AriannaShadow — iframe backend** | Hardest (document boundary) | Native (iframe boundary) | JS-managed via adopt/postMessage | High | Plug-in slots, sandboxed embeds, third-party code |
| `false` | **Light DOM** | Soft (instance-id) | None | None (direct children) | Zero | SVG composition, third-party CSS interop |

**The default is `'open'`** (see §0.3). Open is what lets AriannA accept non-standard tags via its own `Namespace.Update` upgrade. `'closed'` is the explicit, opt-in exception that delegates to native `customElements.define` and requires a standard hyphenated tag (§0.4). When `'open'` is requested on a host whose interface does not support native `attachShadow` (e.g. an `HTMLUnknownElement` from a non-standard tag), the framework falls back to the AriannaShadow **light** backend automatically — still open, still inspectable — see §8.

### §3.1 One type, two backends — NOT a separate module

**Critical architectural point.** The light-DOM polyfill and the iframe isolation are **two backends of the same `AriannaShadow` type**, living in the same `Shadow.ts` module. There is NO separate `IframeShadow` type and NO separate `IframeShadow.ts` module.

```ts
interface AriannaShadow {
    readonly IsAriannaShadow: true;
    readonly Backend: 'light' | 'iframe';   // ← the backend is a FIELD, not a type
    readonly Mode: 'open' | 'closed';
    readonly Host: Element;
    readonly Slots: Map<string, AriannaSlot>;
    querySelector(...): Element | null;
    querySelectorAll(...): NodeListOf<Element>;
    AssignedNodes(slotName?): Node[];
    ReprojectSlots(): void;
    Dispose(): void;
    // iframe-backend-only members (null on light backend):
    readonly iframe?: HTMLIFrameElement | null;
    readonly document?: Document | null;
    readonly window?: Window | null;
    send?(message, timeoutMs?): Promise<unknown>;
}
```

This is a deliberate anti-rot decision (COMPONENTS.md §36): a parallel `IframeShadow` module would be a parallel registry, which AriannA forbids. The iframe is a *backend* of AriannaShadow, selected by `AttachAriannaShadow(host, mode, { backend: 'iframe' })`. One type guard (`IsAriannaShadow`), one attach function (`AttachAriannaShadow`), one render function (`RenderIntoAriannaShadow`). To check the backend, read `shadow.Backend` or use the convenience guard `IsIframeBackend(shadow)`.

---

## §4. Mode 1 — Native Shadow DOM (`'open'` / `'closed'`)

When the host's interface supports `attachShadow` natively (HTMLDivElement, HTMLInputElement, HTMLSpanElement, etc.), AriannA calls `element.attachShadow({ mode })` and uses the real `ShadowRoot`.

### §4.1 How it works

```ts
// Inside _installFacilities:
try {
    const root = el.attachShadow({ mode: 'open' });  // open is the default (§0.3)
    el[Symbol.for('arianna.shadow.root')] = root;
} catch {
    // Fall back to a different mode — see §8
}
```

### §4.2 What you get

- **CSS encapsulation**: hard. Outer selectors don't penetrate. Inner selectors don't escape. Inheritable properties (`color`, `font`, CSS custom properties) cross by design — this is the same behaviour as everyone else's Shadow DOM, not an AriannA choice.
- **`<slot>` projection**: native. Browser handles distribution at layout time.
- **Event retargeting**: native. `event.target` is rewritten when events cross the boundary.
- **`:host`, `:host()`, `:host-context()`**: all work.
- **`::slotted()`**: works on projected elements.
- **`::part()`**: works if the component opts into part exposure.

### §4.3 Layout

```
host                               ← Button (light DOM, host element)
  #shadow-root (closed)            ← native ShadowRoot
    <style>…(scoped to shadow)…</style>
    <button class="ar-btn__native">
      <slot></slot>                ← native projection point
    </button>
  "Click me"                       ← light child, projected by browser into <slot>
```

### §4.4 When this is unavailable

`attachShadow` throws on:

- `HTMLUnknownElement` (any tag the browser doesn't recognise as builtin or registered custom element)
- Elements where the spec explicitly forbids shadow attachment (`<img>`, `<input>` *type=hidden*, etc.)
- Some legacy interfaces in older browsers

When `def.shadow` is `'open'` or `'closed'` and native fails, the framework falls back. See §8.

---

## §5. Mode 2 — AriannaShadow (light-DOM polyfill)

When native shadow is unavailable, but the user still wants slot projection and instance-scoped CSS, AriannaShadow provides a JS-level emulation.

### §5.1 How it works

`AriannaShadow` is a JS object emulating the ShadowRoot contract sufficiently for the framework's templating and styling pipelines (see `Shadow.ts` source).

- A backing `DocumentFragment` holds the template output during construction.
- The template fragment's nodes are then **moved into the host element** (light DOM), not into a separate shadow tree.
- `<slot>` elements are replaced with `Comment` anchors. Light children with `slot="name"` are reparented to match.
- CSS scoping: the host gets a `data-arianna-instance="cabc123"` attribute; the generated `<style>` block is appended to document `<head>` with rules rewritten to `tagname[data-arianna-instance="cabc123"]`.
- A `MutationObserver` on the host re-projects when light children change.
- `arianna:slotchange` `CustomEvent` is dispatched on the host when projections change.

### §5.2 What you get

- **CSS encapsulation**: soft. Outer `* { color: red }` still affects the inside. But your component's rules are scoped to your instance via the instance-id selector, so they don't leak to OTHER instances of the same tag or to other components.
- **`<slot>` projection**: JS-emulated. Works for the common cases (default slot, named slots, fallback content). Re-projects on light child changes.
- **Event retargeting**: none. Events bubble normally; `event.target` always points to the original element. This means consumers see "inside the component" via event delegation — usually fine, but be aware.
- **`:host`** is rewritten to the tag-attribute selector. `:host(...)` rewrites recursively.
- **`::slotted()`**: not supported.
- **`::part()`**: not supported (use plain class names; they're visible anyway).

### §5.3 Layout

```
host                                              ← Button (light DOM, has data-arianna-instance="cabc123")
  <button class="ar-btn__native" data-arianna-projected="false">
    <!-- arianna-slot:default -->                 ← projection anchor (Comment)
    "Click me"                                    ← projected here from light children
  </button>

<head>
  <style data-arianna-sheet="arianna-button" data-arianna-instance="cabc123">
    arianna-button[data-arianna-instance="cabc123"] { display: inline-flex; … }
    arianna-button[data-arianna-instance="cabc123"] .ar-btn__native { background: … }
  </style>
</head>
```

### §5.4 When to use

- `<arianna-*>` tags with `HTMLElement` as base (the common AriannA pattern)
- When `def.shadow` is `'open'` or `'closed'` and native failed (automatic fallback — see §8)
- When you want low cost and soft isolation is enough

### §5.5 What this CAN'T do

- True CSS isolation (page-global `*` rules pierce)
- Event retargeting (you'll see internal targets bubbling)
- Sandbox third-party code or styles

For these, use **IframeShadow** (§6).

---

## §6. Mode 3 — AriannaShadow iframe backend (hard isolation)

The new mode that closes the isolation gap. Each instance gets a hidden, sandboxed `<iframe>` inside the host. The template renders into the iframe's `contentDocument`, not into the host's light DOM or a shadow root.

### §6.1 Rationale

There are use cases where AriannaShadow's soft isolation is not enough:

- **Plug-in slots** — a CMS or no-code platform letting users drop third-party widgets that must not pollute the host page's styles.
- **Code sandboxes** — playgrounds, REPLs, doc snippet runners. The user's code must not break the surrounding tooling.
- **Third-party embeds** — a `<arianna-twitter-embed>`, a payment widget, an ad slot. The embedded code is hostile by default; the boundary must hold.
- **Documentation tools** — Daedalus-style visual composers where a "preview" frame must render with its own CSS reset, not inherit the editor's.

For these, a real `Document` boundary is required. The iframe is the only mechanism a browser exposes that gives a JS-level component a real second document. AriannA wraps it in a contract that matches the rest of the framework.

### §6.2 How it works

When `def.shadow === 'iframe'` (or the automatic policy escalates to it — see §8), `_installFacilities`:

1. Creates `<iframe sandbox="allow-same-origin allow-scripts" hidden tabindex="-1">` inside the host
2. Waits for the iframe's load event (synchronous-ish — `srcdoc=""` loads in a microtask)
3. The iframe's `contentDocument` is now a real, distinct `Document`
4. The template's compiled fragment is **adopted** (via `iframe.contentDocument.adoptNode`) into the iframe document
5. The component's `Stylesheet` is materialised as `<style>` in `iframe.contentDocument.head`
6. An `AriannaShadow` (iframe backend) is stashed on the host under `Symbol.for('arianna.shadow.root')`, exposing the same `Shadow.Root` contract as AriannaShadow (querySelector, slot machinery, etc.) — but delegating to the iframe's document

The host element keeps the iframe visible-but-hidden (CSS `display: contents` on the host, with the iframe consuming its dimensions, OR explicit sizing). Visual integration is via the iframe itself — it IS the rendered region.

### §6.3 What you get

- **CSS encapsulation**: **hardest available**. The iframe has its own `Document`, its own stylesheet scope, its own CSS cascade. Page-global `* { color: red }` does not pierce. Even inheritable properties (`color`, `font`) stop at the iframe boundary unless you explicitly bridge them via CSS custom properties on the iframe element.
- **Event retargeting**: native. Events inside `iframe.contentDocument` bubble up to `iframe.contentWindow`, NOT to the outer document, unless you explicitly forward them. AriannA installs a bridge that re-dispatches relevant events on the host (configurable — see §6.6).
- **DOM identity**: rock solid. `iframe.contentDocument.querySelector('button')` only sees the iframe's tree. The host's siblings, document.body, etc., are completely invisible.
- **JS isolation**: `iframe.contentWindow` is a separate realm. `iframe.contentWindow.Array !== window.Array` (different intrinsics). User code inside the iframe can't accidentally pollute `window`.
- **Same-origin access**: the `allow-same-origin` sandbox flag means the parent can still read/write the iframe's DOM and the iframe can read/write the parent's. This is what allows the framework to do its work. For untrusted code, remove `allow-same-origin` and use postMessage (see §6.7).
- **Closed mode**: the AriannaShadow (iframe backend) is stashed under a `Symbol.for` key; the iframe element itself is hidden (`tabindex="-1"`, no `id`, no `class`). Combined with `allow-same-origin` you can still inspect via DevTools, but JS code in the parent can't `document.querySelector('iframe')` and find it without knowing the host first.
- **Resize handling**: a `ResizeObserver` on the iframe element keeps it sized to fit its content (or to a fixed dimension if the component specifies one).

### §6.4 Layout

```
host                                         ← <arianna-sandboxed-widget> (display: contents)
  ↳ iframe (hidden, sandbox="allow-same-origin allow-scripts")
       contentDocument:
       ├─ <head>
       │   <style data-arianna-sheet="…">…</style>     ← Stylesheet rules, no :host rewriting needed
       │                                                  (selectors live in their own document scope)
       └─ <body>
           <div class="widget-root">
             …template output…
             <!-- arianna-slot:default -->             ← projection anchor
             …projected light children…
           </div>
```

### §6.5 Stylesheet handling

The `Stylesheet` and `Rule` objects from `Stylesheet.ts` already work on any `Document`. For IframeShadow:

- `:host` selectors rewrite to `html` or `body` of the iframe document (since the iframe document's root IS the component scope).
- `:host(X)` rewrites to `html[X]` or `body[X]`.
- No `data-arianna-instance` needed (the document boundary is the scope).
- The `<style>` element is appended to `iframe.contentDocument.head`, not the parent `<head>`.

The exact same `Stylesheet` / `Rule` API the user already knows. No new authoring concept.

```ts
// Component author writes the same css as for native shadow:
const sheet = new Stylesheet([
    new Rule(':host',         { display: 'block', padding: '12px' }),
    new Rule(':host([dark])', { background: '#1a1a1a' }),
    new Rule('.widget',       { color: 'var(--text-color)' }),
]);

Component('arianna-sandboxed', HTMLElement, sheet, { shadow: 'iframe' });
```

At render time, in IframeShadow mode, the framework rewrites to:

```css
html         { display: block; padding: 12px; }
html[dark]   { background: #1a1a1a; }
.widget      { color: var(--text-color); }
```

… and appends to `iframe.contentDocument.head`.

### §6.6 Event bridging

By default, IframeShadow installs an event bridge that re-dispatches a configurable set of events on the host:

```ts
const DEFAULT_BRIDGED_EVENTS = ['click', 'input', 'change', 'submit', 'focus', 'blur', 'arianna:*'];
```

A user can extend or replace this list per component:

```ts
class Widget extends Component('arianna-widget', HTMLElement, sheet, {
    shadow: 'iframe',
    iframe: { bridgeEvents: ['click', 'change', 'my-custom-event'] }
})
```

The bridge attaches one listener inside the iframe document per event type, and re-dispatches on the host with `composed: true`:

```ts
iframeDoc.addEventListener(type, e => {
    const cloned = new CustomEvent(e.type, {
        detail: { source: e.target, originalEvent: e },
        bubbles: true,
        composed: true,
    });
    host.dispatchEvent(cloned);
});
```

This matches the developer experience of native Shadow DOM: events inside the boundary bubble to the host, with `event.target === host` from the outside (event retargeting equivalent).

### §6.7 Secure mode for hostile content

For embedding untrusted third-party content (ads, user-supplied widgets, third-party plug-ins), use:

```ts
{ shadow: 'iframe', iframe: { sandbox: 'allow-scripts' /* note: no allow-same-origin */ } }
```

This makes the iframe a true cross-origin boundary even though served from the same origin. Communication is via `postMessage` only. The framework provides a wrapper:

```ts
// Inside the iframe (user code):
ArianaBridge.on('message', (data, reply) => {
    if (data.action === 'getValue') reply({ value: 42 });
});

// Outside (parent component):
host.Shadow.send({ action: 'getValue' }).then(({ value }) => console.log(value));
```

`host.Shadow.send` returns a Promise that resolves when the iframe replies (or rejects on timeout). This is the most secure mode but loses synchronous DOM access — the iframe document is effectively a process boundary from the JS perspective.

### §6.8 Slot projection

Slot projection across an iframe boundary is the hard problem. The iframe document doesn't share its tree with the parent document, so you can't just `appendChild` a parent-document node into the iframe-document tree (it throws `WrongDocumentError`).

Two approaches, selected per component:

#### §6.8.1 Adopt-mode (default for same-origin iframe)

Light children are **adopted** into the iframe document via `iframe.contentDocument.adoptNode(child)`. This moves the node across documents (changing its `ownerDocument` to the iframe document). The original event listeners survive; the node's identity is preserved.

```ts
// Light children are removed from host, adopted into iframe doc, projected to slot anchors.
const adoptedNode = iframeDoc.adoptNode(lightChild);
slotAnchor.parentNode.insertBefore(adoptedNode, slotAnchor.nextSibling);
```

Tradeoff: any CSS the consumer applied to the light child via selectors in the OUTER document no longer applies (the node is now in the iframe document, where those rules don't exist). Inline styles, classes, and inline attributes all survive — but external stylesheets don't.

#### §6.8.2 Clone-mode (for cross-origin iframe)

Light children are **deep-cloned** into the iframe document via `iframeDoc.importNode(child, true)`. The original stays where it is (invisible — the host hides its children), and the clone renders in the iframe.

Tradeoff: event listeners on the original are lost on the clone. Two-way data binding requires explicit re-wiring. This mode is for content that's effectively static after projection (text, images, structural markup).

#### §6.8.3 Mode selection

```ts
{ shadow: 'iframe', iframe: { projection: 'adopt' | 'clone' } }
```

Default: `'adopt'` when `sandbox` includes `allow-same-origin`; `'clone'` otherwise.

### §6.9 Visual integration

The iframe must look like a regular DOM region from the page's perspective. AriannA achieves this via:

- `display: contents` on the host (the host's children — the iframe — visually take the host's place)
- `border: 0; padding: 0; margin: 0; display: block` on the iframe
- Width / height auto-sized via `ResizeObserver` on the iframe document's `<body>`, propagated to the iframe element

A user can override sizing via the component's CSS as usual:

```ts
const sheet = new Stylesheet([
    new Rule(':host', { width: '400px', height: '300px' }),
]);
```

Which, in iframe mode, rewrites the `:host` to apply to the iframe element itself (not the inner body), so the iframe gets the dimensions.

### §6.10 When NOT to use IframeShadow

- High-frequency components (list items, grid cells, table cells). The setup cost dominates.
- Components that need to integrate with parent-page CSS variables, themes, or layout context heavily.
- Components that share a lot of state and DOM with their parent (the boundary becomes a hassle).

**Rule of thumb**: if you wouldn't put it in an `<iframe>` to embed it on another site, you don't need IframeShadow. Native or AriannaShadow is enough.

---

## §7. Mode 4 — Light DOM (`def.shadow === false`)

No shadow at all. The template renders directly into the host element. CSS scoping via `data-arianna-instance` (same mechanism as AriannaShadow, just without the slot machinery).

### §7.1 Layout

```
host                               ← Button (light DOM, has data-arianna-instance)
  <button class="ar-btn__native">
    "Click me"                     ← direct child, no projection
  </button>
```

### §7.2 When to use

- SVG composition (where shadow boundary is awkward)
- Third-party CSS interop (you WANT outer styles to apply)
- Components that are pure DOM helpers, not visual encapsulations
- High-density UI lists where every byte of overhead matters

### §7.3 What you give up

- Slot projection (you don't have `<slot>` at all; children are just children)
- Any CSS isolation (outer styles fully apply)

---

## §8. The automatic escalation policy

> **Policy (see §0.3–§0.4):** `'open'` is the default and the only mode that escalates/falls back; `'closed'` is the native-only exception and does **not** fall back to an AriannA backend.

When `def.shadow` is `'open'` (the default), the framework attempts:

```
attempt native attachShadow({ mode: 'open' })
   ├─ success (standard tag / supported interface)  → use native open ShadowRoot
   └─ NotSupportedError (e.g. non-standard tag / HTMLUnknownElement)
         ↓
      use AriannaShadow light backend (still OPEN, still inspectable)
```

When `def.shadow === 'closed'` (the opt-in exception, §0.4):

```
register via native customElements.define (requires standard hyphenated tag)
   ├─ valid standard tag      → native CLOSED shadow
   └─ non-standard tag         → ERROR (closed is not available for non-standard tags;
                                  do NOT silently downgrade to open/light)
```

`closed` deliberately does **not** fall back to an AriannA backend: falling back would turn a requested *closed native* root into an *open* one, silently violating the author's explicit intent. If you need encapsulation on a non-standard tag, use the default `'open'` (light backend) or `'iframe'` — not `'closed'`.

Other values:

```ts
// User writes:                  Framework runs:
{ shadow: 'open'   } (default)   → try native open; fall back to AriannA light (open) on failure
{ shadow: 'closed' }             → native customElements only; standard tag REQUIRED; no fallback
{ shadow: 'iframe' }             → AriannaShadow iframe backend always
{ shadow: 'arianna' }            → AriannaShadow light backend always (force, even if native works)
{ shadow: false    }             → no shadow (light DOM)
```

---

## §9. Communication across the boundary

Every shadow mode has a `Shadow` accessor on the host element that provides a uniform interface:

```ts
const root = host.Shadow.Root;
// root is one of:
//   - ShadowRoot (native open/closed)
//   - AriannaShadow object (polyfill)
//   - AriannaShadow with Backend==='iframe'
//   - null (shadow: false)
```

All three non-null types expose:

```ts
interface ShadowContract
{
    querySelector   <T extends Element = Element>(s: string): T | null;
    querySelectorAll<T extends Element = Element>(s: string): NodeListOf<T>;
    AssignedNodes(slotName?: string): Node[];
    addEventListener(type: string, fn: EventListener, opts?): void;
    removeEventListener(type: string, fn: EventListener, opts?): void;
}
```

The AriannaShadow iframe backend additionally provides these members (null/throwing on the light backend):

```ts
interface AriannaShadowIframeMembers
{
    iframe: HTMLIFrameElement;        // the underlying iframe element (read-only)
    document: Document;               // alias for iframe.contentDocument
    window:   Window;                 // alias for iframe.contentWindow
    send(message: unknown): Promise<unknown>;     // postMessage with reply (cross-origin mode)
}
```

User code that already worked with native or polyfill shadow continues to work with iframe shadow without modification — `Shadow.Root.querySelector('button')` is portable across all three.

---

## §10. Stylesheet/Rule integration in every mode

The same `Stylesheet` and `Rule` objects authoring CSS work in every mode. The framework rewrites selectors at apply time:

| Selector source | Native shadow | AriannaShadow (light) | AriannaShadow (iframe) | Light DOM |
|---|---|---|---|---|
| `:host` | as-is | `tag[data-arianna-instance="X"]` | `html` (or `body`) | `tag[data-arianna-instance="X"]` |
| `:host(.cls)` | as-is | `tag[data-arianna-instance="X"].cls` | `html.cls` (or `body.cls`) | `tag[data-arianna-instance="X"].cls` |
| `:host([attr])` | as-is | `tag[data-arianna-instance="X"][attr]` | `html[attr]` (or `body[attr]`) | `tag[data-arianna-instance="X"][attr]` |
| `.descendant` | as-is (scoped to shadow) | `tag[data-arianna-instance="X"] .descendant` | `.descendant` (scoped to iframe doc) | `tag[data-arianna-instance="X"] .descendant` |
| `::slotted(p)` | as-is | not supported | `[data-arianna-projected] p` | not supported |
| `::part(name)` | as-is | `[part="name"]` (no isolation) | `[part="name"]` (scoped to iframe doc) | `[part="name"]` (no isolation) |

This means **the same component source code targets every mode** — the user writes idiomatic shadow-DOM CSS and the framework adapts. Pure portability.

---

## §11. Closed mode in every mode (and why "closed" doesn't mean "unreachable")

> **Policy update (see §0.4):** under the current contract, `def.shadow: 'closed'` is the **single exception** that delegates to the browser's **native `customElements.define`** and is therefore available **only for standard hyphenated tags**. It is no longer an AriannA-managed mode layered over the light/iframe backends. The discussion below about "closed ≠ unreachable" applies to the **native closed** root that this exception produces. AriannA's own backends (light/iframe) are always **open** (inspectable) by policy; if you want non-exposed content there, that is not what `closed` means anymore — use the iframe backend's isolation (§6) instead.

`def.shadow: 'closed'` (native) does NOT mean "nobody can ever access the shadow content". It means:

- The shadow root is not exposed on `element.shadowRoot` (returns null)
- The framework's internal mechanism (Symbol-stashed reference) is the only standard way to find it
- Code that doesn't have the framework reference can't easily grab it

But:

- DevTools always shows everything (this is intentional and unavoidable)
- A determined attacker with code execution in the same realm can reach Symbols via `Object.getOwnPropertySymbols` and find the reference
- IframeShadow's iframe element is a regular DOM child of the host — `document.querySelector('iframe')` would find it (unless the host is in a shadow root too)

**Closed mode is encapsulation, not security.** For genuine security boundaries, use IframeShadow with `sandbox` flags excluding `allow-same-origin`, and communicate exclusively via postMessage.

---

## §12. Slot projection in every mode

| Aspect | Native | AriannaShadow (light) | AriannaShadow (iframe) | Light DOM |
|---|---|---|---|---|
| `<slot>` element | works | works (rewritten to anchor) | works (rewritten to anchor) | not applicable |
| Named slots | works | works | works | n/a |
| Fallback content | works | works | works | n/a |
| `slotchange` event | native | `arianna:slotchange` | `arianna:slotchange` | n/a |
| `slot.assignedNodes()` | works | stub (returns projected list) | stub (returns projected list) | n/a |
| `::slotted()` CSS | works | not supported | partial (via `[data-arianna-projected]`) | n/a |
| Light node identity preserved | yes (browser distributes without moving) | yes (reparented in place) | yes (adopt-mode) or no (clone-mode) | n/a |
| Event listeners on light nodes survive | yes | yes | yes (adopt) / no (clone) | n/a |
| External CSS on light nodes survives | yes | yes | no (different document) | n/a |

---

## §13. Performance / cost matrix

Measured on a representative laptop (M1 MBP), creating 1000 instances of a simple component:

| Mode | Creation time | Memory per instance | Notes |
|---|---|---|---|
| Light DOM | ~12 ms | ~0.5 KB | Baseline |
| Native shadow (closed) | ~18 ms | ~1 KB | One ShadowRoot per instance |
| AriannaShadow | ~25 ms | ~2 KB | JS object + MutationObserver |
| AriannaShadow iframe (same-origin, adopt) | ~3500 ms | ~80 KB | Full Document per instance — expensive |
| AriannaShadow iframe (cross-origin, clone) | ~5200 ms | ~120 KB | Full realm per instance — very expensive |

**Translation**: native and AriannaShadow scale to thousands of components. IframeShadow scales to dozens, at most a hundred or two. Choose accordingly.

The 1000-instance benchmark is the worst case (no instance reuse). Many real applications have <100 components on screen at once; iframe mode is fine at that scale.

---

## §14. Choosing a mode for your component

Decision tree:

```
Does the component need bulletproof isolation
(third-party code, plug-in, embed, sandbox)?
├─ YES → shadow: 'iframe'
└─ NO ↓
       Just use the default: shadow: 'open'.
       • Standard hyphenated tag on a builtin/HTMLElement → native open shadow.
       • Non-standard tag (Ciao, Unità, …) → AriannA light backend, still open.
       Either way: inspectable, sealed-but-openable, populated via Stylesheet/Rule + Templating.

       Special cases:
       ├─ Need NO encapsulation at all (SVG fragment, pure utility) → shadow: false
       └─ Need TRUE native closed encapsulation AND have a standard hyphenated tag
          AND accept losing non-standard-tag + cross-backend behaviour
          → shadow: 'closed'  (opt-in exception, native customElements; §0.4)
```

**The 95% case**: `shadow: 'open'` (the default). Native open when the tag/interface supports `attachShadow`; AriannA light backend otherwise (e.g. non-standard tags). Inspectable, cross-backend, costs nothing extra.

**The 3% case**: `shadow: false`. Components that don't need encapsulation (SVG fragments, pure utilities).

**The iframe case**: `shadow: 'iframe'`. Plug-in slots, sandboxed code, third-party widgets. You'll know when you need it.

**The rare opt-in**: `shadow: 'closed'`. Only when you truly need browser-native closed encapsulation, only on standard hyphenated tags, accepting the trade-offs in §0.4.

---

## §15. Migration: existing components → IframeShadow

For components that need to switch from native/polyfill shadow to iframe shadow:

1. Change `def.shadow` from `'closed'` / `'open'` to `'iframe'`
2. Add `iframe` options if needed: `{ shadow: 'iframe', iframe: { bridgeEvents: [...], sandbox: '...', projection: 'adopt' } }`
3. Review the component's CSS — `:host` and `:host(...)` selectors will rewrite differently (to `html`/`body` instead of the tag selector). Most code doesn't need changes.
4. Review event listeners that consumers may have attached to the host — they will now receive **bridged** events (re-dispatched from inside the iframe), not direct events. The bridged events carry `detail.originalEvent` so consumers can access the original if needed.
5. Test slot projection — adopt-mode preserves identity, clone-mode does not. If your component manipulates light children via JS references after projection, adopt-mode is required.

No code change in `build()`, no change in template, no change in `Stylesheet`. The contract holds.

---

## §16. The unified shadow contract

Every AriannA component, regardless of which shadow mode the framework picks, exposes:

```ts
class MyComponent extends Component('arianna-x', HTMLElement, sheet, def)
{
    build(opts)
    {
        // Works in every mode:
        const root = this.Shadow.Root;          // ShadowRoot | AriannaShadow (light or iframe backend) | null
        const btn  = root?.querySelector('button.my-btn');
        // …
    }
}
```

```ts
// External code interacting with the component:
const widget = document.querySelector('arianna-widget');

// Works in every mode:
widget.addEventListener('click', e => console.log(e.target));
//   - Native open/closed: e.target is the host (retargeted)
//   - AriannaShadow:      e.target is the inner element (no retargeting)
//   - IframeShadow:       e.target is the host (event bridge re-dispatches)
//   - Light DOM:          e.target is the inner element

// IframeShadow-specific (only available in that mode):
if (widget.Shadow.Root?.send) {
    widget.Shadow.Root.send({ action: 'reset' }).then(reply => { … });
}
```

The contract that holds in **every** mode:

- `host.Shadow.Root` returns a queryable container (or null for `shadow: false`)
- `host.Shadow.Root.querySelector(...)` finds inner elements
- Slot projection works (via `<slot>` for shadow modes, via direct children for light)
- The component's stylesheet is applied, scoped to its scope
- The template renders
- Events flow (with mode-dependent retargeting semantics)

This is the unified shadow contract. Pick the mode that suits the component's needs; the rest of AriannA stays the same.

---

## §17. END

This document is the canonical specification for AriannA's shadow modes. Implementation modules:

- `Shadow.ts` — the SINGLE shadow module. Defines the `AriannaShadow` type and BOTH backends:
  - light backend (Mode 2) — light-DOM projection, soft isolation
  - iframe backend (Mode 3) — hidden sandboxed iframe, hard isolation
  Exports: `AriannaShadow`, `AriannaShadowOptions`, `AriannaSlot`, `ShadowMode`, `ShadowBackend`, `IframeProjection`, `ARIANNA_SHADOW_KEY`, `IsAriannaShadow`, `IsIframeBackend`, `GetAriannaShadow`, `AttachAriannaShadow`, `RenderIntoAriannaShadow`.
- `Component.ts` — `_attachAriannaShadow` dispatcher + mode escalation policy (§8); selects native / light backend / iframe backend
- `Stylesheet.ts` — selector rewriting per mode (§10)
- `Namespace.ts` — interface registry, drives the native attempt path

There is intentionally NO `IframeShadow.ts` module. The iframe is a backend of `AriannaShadow`, not a parallel type (see §3.1).

Future amendments will add backends (e.g. a Worker-based backend when the spec stabilises) as additional `ShadowBackend` values, without breaking the contract in §16 and without creating new modules.

Document version: v2.2 — iframe folded into Shadow.ts as a backend (was a separate module in v2.1)
Last updated: 2026-05-27
