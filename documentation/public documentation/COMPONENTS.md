# AriannA — Components

> **The single canonical document for everything component-related in AriannA v2.**
> Mechanics, conventions, lifecycle, instantiation, templating, styling, decorators, JSX, accessibility, testing, migration.
>
> Supersedes `COMPONENT_CONVENTIONS.md`, `LIFECYCLE.md`, `COMPONENT_MECHANICS.md`. All three are merged here verbatim, with overlaps reconciled in favour of the corrected v2 model (Component = class + dispatcher, descriptor as single source of truth, no `Bound` / no `_factory`).
>
> Audience: framework users, contributors, AI assistants. If this document contradicts code, **this document wins** — the code is to be updated. If a future amendment changes a rule, it goes at the end of the relevant section, dated.

---

## Table of Contents

**Part I — The Mental Model (mechanics)**
- §1. The complete prototype chain (the key picture)
- §2. `Component` is **two things at once**
- §3. The descriptor — single source of truth
- §4. The two upgrade paths, mechanically
- §5. The boot phase (closing the markup-only gap)
- §6. Shadow vs Light DOM mechanics
- §7. The descriptor as bag of parameters (anti-rot rule)
- §8. Recap diagram
- §9. The single rule that prevents all of this from rotting

**Part II — Authoring Components (conventions)**
- §10. Tag naming
- §11. Definition forms — the five cases
- §12. The `ComponentDef` object
- §13. The `css` argument — five accepted forms
- §14. Templates and directives (cross-reference)
- §15. `build(opts)` and class properties
- §16. Sheet.Default / Sheet.Current
- §17. `this.Host` — render target
- §18. `constructor` vs `build()`
- §19. Decorators

**Part III — Lifecycle**
- §20. Full lifecycle pipeline (complete diagram)
- §21. Per-instance lifecycle steps
- §22. Hook reference table
- §23. The two hooks that work today (current implementation status)
- §24. `build(opts)` — the main entry point
- §25. The other five hooks (semantics, future activation)
- §26. The attr → signal → DOM chain
- §27. Cleanup guarantees and symmetry rule
- §28. Class-definition vs instance order

**Part IV — Instantiation & Integration**
- §29. The six instantiation forms
- §30. JSX runtime
- §31. Accessibility baseline
- §32. Testing convention
- §33. Build / bundle convention
- §34. Per-component documentation

**Part V — Governance**
- §35. The "default imperative" invariant
- §36. Anti-rot rules
- §37. Allowed deviations
- §38. Migration playbook
- §39. Quick-reference cheat sheet
- §40. END

**Part 0 — THE CANONICAL MODEL (authoritative; read this first)**
- §0.1. The three primitives: Real, Virtual, Component
- §0.1.1. The Higgs model — the one metaphor that explains everything
- §0.2. Real and Virtual are ONLY elements
- §0.3. Component is element + Template + Shadow + State + Observer
- §0.4. Component IS the DOM node — Lit-like, embedded (the canonical model)
- §0.4.1. WHY: lazy rendering — work before layout, layout touched once
- §0.5. The element carries its own Real / Virtual facets
- §0.5.1. Identity invariant: this.element === this.Real.render() === this
- §0.6. NO Proxy — Fluent API for authoring; native DOM is `this` (the element)
- §0.6.0. Native DOM is available on `this` — at your own risk
- §0.6.1. Preference hierarchy (fluent vs native vs shadow-model)
- §0.6.2. The "openable but sealed" shadow — populated ONLY via Stylesheet/Rule + Templating
- §0.6.3. Shadow mode: OPEN by default; CLOSED is the one exception (native customElements); non-standard tags
- §0.7. There is no `.render()` step on a Component (it IS the element)
- §0.8. What `class X extends Component(...)` actually produces
- §0.9. The markup-upgrade path (embedded model)
- §0.10. Loose coupling: the unique selling point
- §0.11. Compatibility contract (React/JSX via Virtual)
- §0.12. What I am about to implement (detailed architecture)
- §0.13. Reconciliation note: Part 0 and Parts I–V now AGREE

---

# Part 0 — THE CANONICAL MODEL (authoritative; read this first)

> **This Part is the corrected, authoritative model.** Where Parts I–V (written earlier) describe `Component` as a class that `extends HTMLElement` and sits "in the prototype chain between the subclass and the base", THAT MODEL IS SUPERSEDED. Component does not extend HTMLElement and is not the DOM node. The accurate model is below. §0.13 explains exactly which earlier statements to ignore.

## §0.1. The three primitives: Real, Virtual, Component

AriannA has three construction primitives, layered for **progressive learning**:

```
   Real        — eager DOM element wrapper.   SolidJS-style + Fluent API + plain real DOM.
   Virtual     — lazy VDOM element wrapper.    React-style (fiber/h()) + Fluent API. JSX-compatible.
   Component   — Real/Virtual + Template + Shadow + State + Observer (reactivity), kept in sync.
```

- A beginner uses **Real** alone: `new Real('button').text(() => 'Hi').on('click', fn).append('#app')`. Done. No components, no shadow, no template engine. Just fluent real DOM.
- A React refugee uses **Virtual** alone: `new Virtual('button')…` or `h('button', …)`, lazy, JSX-compatible, importable from React toolchains.
- When the user is ready for encapsulation (template, shadow, state, lifecycle), they reach for **Component** — which *wraps and synchronises* a Real and a Virtual.

This layering is the whole point: **you can stop at any layer.** Real and Virtual are complete and usable on their own, forever. Component is the opt-in third layer for people who want the full component model.

### §0.1.1. The Higgs model — the one metaphor that explains everything

```
   Real / Virtual   =  PHOTONS    — pure nodes, "massless": element + Fluent API, nothing more.
   Component         =  the HIGGS FIELD — embedded INSIDE the element, conferring mass:
                        Shadow.Root, Template, State, Observer.
```

- **Real and Virtual are photons.** A pure node: a DOM element plus the Fluent API, and nothing else. No Shadow, no Template, no State, no Observer. They are *not conceived to do anything that is not "node"*. They stay complete and independent, and **Virtual stays React/JSX-compatible** (§0.11).

- **Component is the Higgs field — but embedded.** Unlike a separate wrapper, the field lives **inside the element itself** (the component IS the element, Lit-like; §0.4). The element thus plays both roles at once: it is a photon (a real DOM node) *and* it carries its own field (the embedded Component layer) that confers the mass — `Shadow.Root`, `Template`, `State`, `Observer` — lazily (§0.4.1).

Corollaries (all consistent with "the component IS the element"):

1. **`Shadow.Root`, `template`, `State`, the lifecycle are mass conferred by the embedded field** — present on the element because it carries the Component layer, not because a bare node has them. A plain `Real`/`Virtual` (photon) has none of them.
2. **`this.Real` / `this.Virtual`** expose the photon facets over the very element the component is (eager / lazy views). **`this.Shadow`, `this.template`, `this.State`, the Observer** are the field.
3. **The shadow is "openable but sealed"** and is populated **only** through the AriannA model — Stylesheet/Rule for CSS, the Templating System for slots/elements — never by touching the raw shadow (§0.6.2).

Why this matters: it explains *why* Shadow/Template/State are Component concerns and not Real/Virtual concerns (they are mass, not "node"), while still letting the component be a first-class DOM element you can `querySelector`, `instanceof HTMLElement`, and pass anywhere a node is expected.

## §0.2. Real and Virtual are ONLY elements

A `Real` or a `Virtual` is **just an element** with a fluent API. It has:

- a DOM node (eager in Real via `#el`; lazy in Virtual via `#dom`, materialised on `render()`)
- the fluent surface: `set/get/sub`, `text/attr/cls/prop/style`, `on/off/fire`, `append/add/push/unshift/remove/shift/pop`, `show/hide`, `child`, `contains`, `effect/signal/computed`, `Sheet`

It does **NOT** have:

- a Template engine (`this.template = '…'` with directives)
- a Shadow root / slot projection
- component State or attribute→signal wiring
- a lifecycle (`build`, `onMount`, `onUnmount`)
- an Observer-driven reactivity contract beyond per-binding effects

These belong to **Component**. This is the key conceptual boundary in AriannA: **an element is not a component.** (Contrast: in most frameworks "component" and "element" blur together. AriannA keeps them distinct, which is what makes the progressive-learning ramp and the loose coupling possible.)

Real and Virtual remain **complete and compatible** on their own. In particular, **Virtual MUST stay React/JSX-compatible** — it is the import surface for React code and for `h()`/JSX. Component must never compromise that compatibility (§0.11).

## §0.3. Component is element + Template + Shadow + State + Observer

A `Component` is the union:

```
Component  =  (Real ⊕ Virtual, kept in sync)         ← the element, in both worlds
           +  Template engine (this.template, directives)
           +  Shadow (native / AriannaShadow light / iframe backend)
           +  State (attribute→signal wiring, reactive props)
           +  Observer / reactivity lifecycle (build, onMount, onUnmount, effects)
```

It is the element, plus the embedded Component layer that confers Template, Shadow, State, and the Observer lifecycle. The `this.Real` / `this.Virtual` facets give eager / lazy views over the same element (which is `this`), kept in sync with signals and the template.

## §0.4. Component IS the DOM node — Lit-like, embedded (the canonical model)

**A Component IS the custom element.** `class Button extends Component('arianna-button', HTMLElement, css, def)` produces a class whose instances **are** `<arianna-button>` DOM nodes — exactly like Lit, where a component *is* the custom element. The base is **embedded** in the prototype chain:

```
   Button → Component(HTMLElement) → HTMLElement → Element → Node → EventTarget → Object
            └── the embedded base layer ──┘
```

For a non-HTMLElement base (e.g. SVG), the base sits in the same position:

```
   MyShape → Component(SVGSVGElement) → SVGSVGElement → SVGElement → Element → Node → …
```

So the general shape is:

```
   MyClass → Component([Base]) → [Base] → … → HTMLElement/SVGElement → Element → Node → EventTarget → Object
```

`const btn = new Button()` — `btn` **is** the `<arianna-button>` node. `document.querySelector('arianna-button')` returns the component (because the component is the element). There is no separate wrapper object, no "3 bridge getters", no `Bound`.

**What "embedded" means.** Like Lit, the rendered element inherits from its base and renders (template / shadow / styles). **Unlike** Lit, AriannA does that rendering **lazily** through the embedded Component layer (Fluent API over Real/Virtual + signals + template + shadow). The Component layer is *embedded inside the element* — it is the "field" (Higgs, §0.1.1) that the element carries, conferring `Shadow.Root`, `Template`, `State`, `Observer` onto the node. The element is both the photon (a real DOM node) and the carrier of its own field (the embedded Component layer).

Consequences:

- `Component('arianna-button', HTMLElement, …)` returns a class that **extends `HTMLElement`** (the embedded base). The base is a parameter, so different components embed different bases — there is no "one Component can't extend many bases" problem, because the factory produces a base-specific Component class per call (cached per base; the class is always named `Component`, never `Bound`).
- `this` inside `build()` **is the element** (Lit-like). On the Component you still use **only the Fluent API** (`this.set`, `this.attr`, …; §0.6) — and because `this` is the element, raw native DOM is also `this` directly, or `this.Real.render()` (same node; §0.5.1).
- The prototype chain reported by `Core.GetPrototypeChain(node)` is the real chain above: `MyClass → Component → [Base] → …`. `Component` is a named link in it (never `Bound`, never anonymous).

### §0.4.1. WHY: lazy rendering — work happens before layout, layout is touched once

The reason the Component layer renders **lazily** (rather than eagerly in the constructor like classic Lit) is to do the bulk of the work **before touching layout**.

The embedded Component layer builds structure, bindings, state, the shadow plan, and the stylesheet **off-DOM** (via the Virtual facet and template / DocumentFragment buffers), then materialises into the element's shadow/light tree in **one** pass. No reflow, no repaint, no layout thrashing during `build()`. The element is connected to layout once, when it enters the DOM — and at that moment its content is already fully prepared.

```
   build() runs on the element        // all prep off-DOM:
        │  template parsed, bindings wired, state seeded,
        │  shadow populated via Stylesheet/Rule + Templating  — no live reflow
        ▼
   element connected to the DOM       // ← single layout pass, content already ready
```

This is the same win React gets from the VDOM and Solid gets from compilation — AriannA gets it because the embedded Component layer prepares everything lazily and commits in one shot.

Note: `.render()` is **not needed on a Component** — the component already *is* the element, already (lazily) rendered. `.render()` remains meaningful only on standalone `Real`/`Virtual` (where `Virtual` is genuinely lazy and `.render()` forces materialisation). On a Component, `this.Real.render()` simply returns the element itself (§0.5.1).

## §0.5. The element carries its own Real / Virtual facets

Because the component **is** the element, the Real and Virtual facets are views over **itself**:

```
   this.Real      → a Real wrapping THIS element (eager facet, default)
   this.Virtual   → a Virtual wrapping THIS element (lazy facet, created on first access)
```

Both facets are views of the **same** node — which is `this`. A mutation through either lands on `this`. The **default fluent behaviour is Real** (eager / SolidJS-style / plain DOM); `Virtual` is available on demand for the React-style world. The facets exist so that, inside a Component, you can drop to either the eager or the lazy element API over the very element the component is.

`Real` and `Virtual` also remain fully usable **standalone** (outside any Component) as pure element wrappers — that does not change (§0.2).

### §0.5.1. Identity invariant: `this.element === this.Real.render() === this`

Since the component IS the element:

```
   this                  → the component, which IS the <tag> DOM node
   this.element          → the same node  ┐
   this.Real.render()    → the same node  ├──  ALL the same object
   this.Virtual.render() → the same node  ┘

   this.element === this                    // true — the component is the node
   this.element === this.Real.render()      // true
   this.element === this.Virtual.render()   // true
```

There is exactly **one** DOM node per Component, and it is `this`. `this.element` is just a readable alias for "the node" (= `this`), provided so authoring code can name the node explicitly. `this.Real.render()` returns that same node (on a Component, `.render()` is identity — the node already exists; §0.4.1).

Native DOM, when you want it, is therefore reached directly: `this` is the element, so `this` has every native member (`this.setAttribute`, `this.shadowRoot`, `this.tagName`, …). But on the Component surface you **author with the Fluent API** (`this.set`, `this.attr`, …; §0.6); the native members are there because the node is an element, not because anything is forwarded.

## §0.6. NO Proxy. Fluent API for authoring. Native DOM is `this` (the element)

**There is NO Proxy and NO magic forwarding** — there never needs to be, because the component IS the element (Lit-like). Native DOM members exist on `this` natively.

For **authoring**, use the **Fluent API** — the reactive, ergonomic surface the embedded Component layer provides (delegating to the Real/Virtual facets over `this`):

```ts
build() {
    this.set('variant', 'primary');         // Fluent — sets attr/prop on this element
    this.attr('aria-label', () => this.label());
    this.text(() => this.label());
    this.cls('busy', () => this.loading());
    this.on('click', e => this.onClick(e));
    this.template = `<button><slot></slot></button>`;   // Component-only capability (mass)
    this.Sheet = mySheet;                                // Component-only capability (mass)
}
```

### §0.6.0. Native DOM is available on `this` — at your own risk

Because the component **is** the element (§0.4), every native DOM member exists on `this`: `this.setAttribute(...)`, `this.appendChild(...)`, `this.style`, `this.dataset`, `this.focus()`, `this.shadowRoot`, `this.tagName`, etc. **You may use them.** There is no Proxy, no forwarding, no gate — `this` is a real `Element`.

The rule is not "don't use native". The rule is: **don't use native for the things the Fluent API (reactivity) or the shadow model (cross-backend) handle for you** — because if you do, you silently lose those guarantees. Stated as a contract:

> You may call the real native APIs on `this` (it IS the element): `this.style.background = 'blue'`, `this.setAttribute('disabled', '')`, `this.focus()`, `this.getBoundingClientRect()`, `this.dataset.id = '7'`, `this.closest('…')`. They work. **But:** (1) they are **one-shot** — no reactivity; for reactive values use the Fluent API (`this.set/attr/text/cls/style` with a getter). (2) For **shadow and slots** never touch `this.attachShadow` / `this.shadowRoot` / raw `<slot>` directly — use Stylesheet/Rule + the Templating System, or you lose native/light/iframe compatibility. Everything else: at your own risk, fully documented.

**Important distinction (don't confuse the two worlds):** the dotted-path form `'style.background'` belongs to the **Fluent API** `set`, NOT to native `setAttribute`:

```ts
// FLUENT (AriannA) — dotted path, smart routing:
this.set('style.background', 'blue');          // → el.style.background = 'blue'

// NATIVE (DOM) — literal attribute name / real property:
this.style.background = 'blue';                // ← native: this IS the element
this.setAttribute('disabled', '');             // ← native: literal attribute name

// WRONG in BOTH worlds — do not write this:
this.setAttribute('style.background', 'blue'); // ✗ writes a literal attr "style.background"
```

`setAttribute` is the native DOM method and takes a **literal attribute name**; the dotted path is an AriannA `set` convenience only.

### §0.6.1. Preference hierarchy (fluent vs native vs shadow-model)

| What you're doing | Use | Why |
|---|---|---|
| Reactive attribute / text / class / style (updates on signal change) | **Fluent** (`this.attr/text/cls/style` with getter) | Registers an effect; native writes once and never updates |
| Static one-shot attribute / property | **Fluent `this.set(...)`** preferred; native `this.setAttribute(...)` acceptable | Equivalent; style consistency |
| Shadow / slots / scoped styles | **AriannA model only** (Stylesheet/Rule + Templating) | Native `attachShadow`/`shadowRoot`/`<slot>` breaks native↔light↔iframe portability (§0.6.2) |
| Intrinsically-native, non-reactive ops (`focus`, `getBoundingClientRect`, `dataset`, `closest`, `scrollIntoView`, measurement) | **Native on `this`** | Not covered by the Fluent API; this IS the element, so just call it |

### Why the Fluent API still matters even though native works

- **Reactivity**: `this.attr('disabled', () => this.loading() ? '' : null)` re-applies whenever `loading()` changes. `this.setAttribute('disabled', …)` writes once. Using native for a value that should track a signal is a latent bug.
- **Cross-backend shadow**: the same `this.Sheet = …` + `this.template = …` produces correct, encapsulated output on native shadow, AriannA light shadow, and iframe shadow. Hand-written `shadowRoot` code only works on native.
- **Pre-render / no thrashing (§0.4.1)**: fluent/template work accumulates off-DOM and commits once; ad-hoc native `appendChild` on a connected node can force premature layout.

### Consequence for the 140 existing components (Phase 2 — now much smaller)

Because `this` IS the element, components that use `this.setAttribute(...)`, `this.appendChild(...)`, `this.querySelector(...)`, `this.dataset`, etc. **keep working** — those are native members of the element. The Phase-2 conversion therefore shrinks to two targeted cases:

1. **Reactivity that was done with native one-shot writes** → convert to Fluent getters (`this.attr/text/cls/style`). Functional bug fix, not a mechanical rewrite.
2. **Raw shadow/slot manipulation** (`this.attachShadow`, `this.shadowRoot.appendChild`, hand-built `<slot>`) → move to the AriannA shadow model (Stylesheet/Rule + Templating) for cross-backend correctness.

Everything else needs no change. (This is a major simplification versus the earlier wrapper model, where every `this.*` native call would have broken.)

### §0.6.2. The "openable but sealed" shadow — populated ONLY through the AriannA model

`Shadow.Root` exists on the component-element because the embedded Component layer confers it (Higgs mass). The shadow is **sealed like a real Shadow DOM** (genuine encapsulation) yet made **style- and slot-compatible** specifically by using the AriannA model — not by poking the raw shadow.

You populate it **only** through two channels:

```
   CSS into the shadow   → ONLY via Stylesheet / Rule
                           (never a hand-placed <style>, never raw cssText)
   Slots / elements      → ONLY via the AriannA Templating System
                           (never raw <slot> manipulation, never raw appendChild
                            into the shadow root)
```

- **Stylesheet / Rule** writes style into the shadow and targets the right backend automatically: native `:host`, light-DOM `[data-arianna-instance]`, iframe `html` inside the contentDocument. The *same* `this.Sheet = …` yields correct encapsulated styling on every backend.
- **The Templating System** fills structure and projects slots. `this.template = '<button><slot></slot></button>'` is parsed, bound, and projected identically across native / light / iframe.

The magic: a real, sealed shadow that is nonetheless fully compatible with styles and slots **because you go through the AriannA model**. The user never touches the raw shadow — which is exactly why the same user code works unchanged on all three backends. Touching `this.attachShadow`/`this.shadowRoot`/raw `<slot>` yourself breaks that portability (§0.6.1 table).

### §0.6.3. Shadow mode: OPEN by default; CLOSED is the one exception (native customElements)

**Every component uses `shadow: 'open'` by default.** Rationale and rules, contract-grade:

1. **Open is the default for ALL components.** An open shadow root is inspectable: `node.Shadow.Root` is readable, `node.Shadow.Root.querySelector(...)` works, and from a node you can reach the component (the node IS the component). This removes the friction and debugging pain of closed shadows.

2. **Open is what lets AriannA accept NON-STANDARD tags.** The native `customElements.define` standard **requires** a hyphenated, lowercase, ASCII tag (`arianna-button`) and **rejects** tags like `Ciao`, `Unità`, `SetteTE`. AriannA's open path does **not** use the native custom-element registry — it upgrades via `Namespace.Update` — so it can support any tag the author wants. This is a core differentiator: AriannA lets Standard DOM approach JSX-like ergonomics **without** JSX and **without** the tag-name restrictions of native custom elements.

3. **`closed` is the SINGLE EXCEPTION, and it is the ONLY place AriannA uses the browser's native `customElements`.** When a component explicitly sets `def.shadow: 'closed'`:
   - AriannA delegates to the browser's native `customElements.define`.
   - Therefore the tag **must** be standard-compliant (hyphenated, e.g. `arianna-button`). Non-standard tags (`Ciao`, `Unità`) **cannot** use closed shadow.
   - This must be done **intentionally**, knowing the trade-off: true native closed encapsulation, but loss of AriannA's non-standard-tag freedom and of cross-backend light/iframe behaviour for that component.

4. **Why closed is not the default:** closed shadow roots cause more problems than they solve in practice (inspection, testing, interop, and incompatibility with non-standard tags). AriannA therefore makes open the default and treats closed as a deliberate, documented opt-in for the narrow cases that truly need browser-native closed encapsulation on standard tags.

> Contract summary: **open = AriannA upgrade, any tag, inspectable, default. closed = native `customElements`, standard hyphenated tag only, opt-in exception.** Full backend mechanics (open native vs AriannA light vs iframe) are in `SHADOW.md`.

## §0.7. There is no `.render()` step on a Component (it IS the element)

A Component does not need `.render()` to "produce" a node — **it already is the node** (§0.4). Construction yields a live element:

```ts
const b = new Button({ variant: 'primary' });   // b IS the <arianna-button> element
document.querySelector('#app').appendChild(b);   // append it like any element
// or, fluent:
b.append('#app');                                 // fluent convenience over the same node
```

- `b instanceof HTMLElement` → **true** (the base is embedded; §0.4).
- `b.render()` exists for API symmetry with Real/Virtual but is **identity** — it returns `b` (the element) itself. The lazy rendering of the component's *content* (template → shadow, bindings, styles) is handled by the embedded Component layer (§0.4.1), not by a `.render()` call.
- For **standalone** `Real`/`Virtual`, `.render()` keeps its real meaning (Virtual is genuinely lazy; `.render()` forces materialisation). That is unchanged. The "no-op `.render()`" statement applies only to Components.

Element creation for tags is automatic through the namespace (correct HTML/SVG/MathML interface and namespace URI): `new Button()` constructs via the embedded base; markup `<arianna-button>` is upgraded by `Namespace.Update` (§0.9). The user never manually calls `createElement`.

## §0.8. What `class X extends Component(...)` actually produces

```ts
class Button extends Component('arianna-button', HTMLElement, css, def) {
    build(opts) {
        // `this` IS the <arianna-button> element (Lit-like, embedded).
        this.set('role', 'button');                       // Fluent (reactive-capable surface)
        this.template = `<button><slot></slot></button>`; // Component mass: template
        this.cls('busy', () => this.loading());           // Fluent reactive class
        // Native is also available because this IS the element (at your own risk; §0.6.0):
        // this.dataset.kind = 'cta';   this.focus();
    }
}

const b = new Button({ variant: 'primary' });   // b IS the element
b.append('#app');                                 // fluent append (b is the node)
document.body.appendChild(b);                     // also works — b is a real HTMLElement
b instanceof HTMLElement;                         // true
```

- `Component('arianna-button', HTMLElement, css, def)` returns a **class that extends `HTMLElement`** (the embedded base). `Button extends` it → the chain is `Button → Component → HTMLElement → …` (the interposed class is named `Component`, never `Bound`; it is cached per base so different bases get the right embedding).
- `new Button(opts)` constructs a live element; the embedded Component layer wires Template/Shadow/State/Observer and runs `build(opts)` with `this = the element`, lazily preparing content off-DOM (§0.4.1).
- `Core.GetPrototypeChain(b)` reports the real chain `Button → Component → HTMLElement → Element → Node → EventTarget → Object`. `b` IS the `<arianna-button>` node.

## §0.9. The markup-upgrade path (embedded model)

When the parser encounters `<arianna-button>Click me</arianna-button>`:

```
   1. The MutationObserver calls Namespace.Update(node).
   2. Update resolves the descriptor for the tag and reprototypes the node to the
      component class (sets node.__proto__ to Button.prototype — the same thing
      customElements upgrade does), so the node IS now a Button.
   3. The embedded Component layer installs Template / Shadow / State / Observer
      (the "mass") and runs build() with this = the node.
   4. The shadow is populated ONLY via Stylesheet/Rule + Templating (§0.6.2).
   5. Content is prepared lazily/off-DOM and committed once (§0.4.1).
```

`document.querySelector('arianna-button')` returns the node, which **is** the upgraded Button. On it:

- Native members work natively: `node.tagName`, `node.getAttribute('variant')`, `node.setAttribute(...)`, `node.classList`, `node.dataset`, etc.
- Component "mass" is present on the same object: `node.Shadow.Root`, `node.template`, the Fluent methods, lifecycle — because the node IS the component.
- The prototype chain is `arianna-button(node) → Button → Component → HTMLElement → …`.

This is exactly what the diagnostic tests rely on: they read `btn.Shadow.Root` **and** `btn.tagName` on the same `btn` from `querySelector`, and both resolve because `btn` is the component-element.

> **Closed-shadow exception (§0.6.3):** for `def.shadow: 'closed'` AriannA delegates to the browser's native `customElements.define`, which requires a standard hyphenated tag. In that one mode the upgrade is the browser's, not `Namespace.Update`'s. Every other component (open shadow, the default) uses AriannA's own upgrade, which is what allows non-standard tags (`Ciao`, `Unità`, `SetteTE`) the native registry would reject.

## §0.10. Loose coupling: the unique selling point

AriannA keeps **element** and **component** as distinct, layered concepts, even though a component IS an element:

- You can use `Real`/`Virtual` with **zero** knowledge of components, shadow, or templates — they are complete standalone element wrappers (photons).
- A component is an element that additionally carries the embedded Component layer (mass): Template, Shadow, State, Observer. You adopt those capabilities incrementally.
- Native DOM is always right there on `this` (the element); the Fluent API and shadow model are the value-add you opt into where they matter (§0.6).
- `Real`/`Virtual` never depend on `Component`. `Component` builds on them. The dependency arrow points one way — the foundation (elements) knows nothing about the layer above (components).

This is the Lit-like spirit (fluent API over plain custom elements) plus progressive reactivity/templating/observability — without forcing a build step, without JSX, and crucially **without restricting you to standard hyphenated tags** (§0.6.3).

## §0.11. Compatibility contract (React/JSX via Virtual)

`Virtual` is the React-compatibility surface and stays fully JSX/React-compatible:

- `h(tag, props, ...children)` and JSX compile to `Virtual` / fiber nodes.
- React code and JSX trees can be imported and materialised through `Virtual`.
- Inside a Component, `this.Virtual` is a normal `Virtual` over the component-element, so a Component interoperates with Virtual/JSX trees in both directions.

AriannA's aim: make Standard DOM behave as ergonomically as JSX **without** JSX — making JSX optional rather than required. `Virtual` remains the bridge for those who do use JSX/React.

## §0.12. What I am about to implement (detailed architecture)

**Scope: `Component.ts` only** (plus `Namespace.ts` upgrade path, plus these docs). `Real.ts` and `Virtual.ts` are NOT touched — they are the complete, independent foundation (photons).

```
┌──────────────────────────────────────────────────────────────────────┐
│  Component(tag, base, css, def)  factory                               │
│  ───────────────────────────────────────────────────────────────────  │
│  • Registers the descriptor (tag → { Def, css sheet, … }). Descriptor  │
│    is the single source of truth for per-tag data.                      │
│  • Returns a class that EXTENDS `base` (HTMLElement / SVGSVGElement /…).│
│    The interposed class is NAMED `Component`, cached per base. NO Bound.│
│  • `class Button extends Component('arianna-button', HTMLElement, …)`   │
│        → chain: Button → Component → HTMLElement → Element → Node → …   │
│  • The component IS the element (Lit-like, embedded).                   │
└──────────────────────────────────────────────────────────────────────┘
                              │ instances are elements
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  The embedded Component layer (the "mass" / Higgs field)               │
│  ───────────────────────────────────────────────────────────────────  │
│  On the element it confers, lazily and off-DOM (§0.4.1):               │
│   • Fluent API (authoring): set/attr/text/cls/style/prop/on/add/…       │
│     — delegating to a Real/Virtual facet over THIS element.            │
│   • this.Real  → Real over this element (eager facet)                  │
│   • this.Virtual → Virtual over this element (lazy facet)              │
│   • this.template → Templating System (slots/elements)                 │
│   • this.Shadow / this.Shadow.Root → sealed shadow, populated ONLY via │
│     Stylesheet/Rule (CSS) + Templating (§0.6.2)                        │
│   • State (attr→signal) · Observer lifecycle (build/onMount/onUnmount) │
│  Native DOM members are present too (this IS the element) — usable at  │
│  your own risk for non-reactive/native ops (§0.6.0).                    │
│  NO Proxy anywhere.                                                     │
└──────────────────────────────────────────────────────────────────────┘
                              │ two creation routes
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Creation routes                                                       │
│  ───────────────────────────────────────────────────────────────────  │
│  • new Button(opts)   → live element; embedded layer wires mass; runs  │
│                          build(opts) with this = the element.          │
│  • markup <arianna-button> → Namespace.Update(node) reprototypes node  │
│    to Button.prototype (AriannA upgrade), wires mass, runs build().    │
│    Single facility installer — no duplicate template-mount.            │
│  • def.shadow:'closed' → THE ONE EXCEPTION: delegates to native        │
│    customElements.define (standard hyphenated tag required). §0.6.3.    │
└──────────────────────────────────────────────────────────────────────┘
```

`_installFacilities` operates on the **element** (`this`): runs `build()` with `this = element`, reads `this.template`, installs Shadow/Sheet/State, and populates the sealed shadow only through Stylesheet/Rule + Templating (§0.6.2). Shadow modes (open default native-or-light, closed via native customElements, iframe backend) are per §0.6.3 / SHADOW.md. The default-open policy is what permits non-standard tags.

**Phase plan:** finish and test the CORE (Component.ts + Namespace.ts + docs) to an impeccable standard FIRST; adjust the 140 components in Phase 2. Because the component IS the element, most native `this.*` usage in those components keeps working; Phase 2 is limited to (a) reactivity done via one-shot native writes and (b) raw shadow/slot manipulation (§0.6.1 hierarchy).

## §0.13. Reconciliation note: Part 0 and Parts I–V now AGREE

Good news for this revision: the **embedded (Lit-like) model restores agreement** between Part 0 and the original Part I. The chain Part I draws —

```
Button → Component → [HTML(X)Element optional] → HTMLElement → Element → Node → EventTarget → Object
```

— is **correct** under the embedded model. The only corrections to keep in mind while reading Parts I–V:

- The interposed central class is **named `Component`** and is **cached per base**; there is **no `Bound`**, no anonymous wrapper, no `_factory`, no `_resolveComponentClassForBase`. Where older text mentions `Bound`, read `Component`.
- `Component` is **both** the class you extend **and** a callable dispatcher (`Component(el)`, `Component('#id')`, decorator forms). Both faces are retained.
- Rendering of component content is **lazy/off-DOM** (§0.4.1); there is **no required `.render()` call** on a component (it IS the element). `.render()` is identity on a component, real only on standalone Real/Virtual.
- Shadow defaults to **open** (§0.6.3); **closed** is the single exception that uses native `customElements`. The sealed shadow is populated **only** via Stylesheet/Rule + Templating (§0.6.2).

Everything about **descriptor as single source of truth**, **anti-rot rules**, **ComponentDef**, **css forms**, **template directives**, **lifecycle hook semantics**, **testing**, and **governance** in Parts I–V remains valid and unchanged.

---

# Part I — The Mental Model (mechanics)

> *Historical / superseded by Part 0 where they conflict — see §0.13. Retained for conventions and hook semantics.*

> *This part is the verbatim content of `COMPONENT_MECHANICS.md`, updated to reflect the v2 model. Diagrams are unmodified.*

## §1. The complete prototype chain (the key picture)

Every AriannA component, after upgrade, has this exact prototype chain:

```
Button                                    ← user subclass (has build, lifecycle hooks)
  ↓
Component                                 ← AriannA's central class
  ↓
[HTML(X)Element optional]                 ← interface-specific base (e.g. HTMLDivElement, HTMLInputElement)
  ↓
HTMLElement                               ← W3C base
  ↓
Element ↓ Node ↓ EventTarget ↓ Object     ← W3C standard chain
```

This applies to:

- A node instantiated via `new Button(opts)`
- A node upgraded from markup `<arianna-button>`
- A node created via `document.createElement('arianna-button')` and inserted
- A node wrapped via `new Real('arianna-button')` or `new Virtual('arianna-button')`
- A node retrieved via `Component('#some-id')`
- A node materialised from JSX `<Button />`

**All paths produce the same chain.** No `_factory`, no `Bound`, no anonymous wrapper class is interposed. The prototype chain is the W3C-standard chain with `Component` as one extra link between the user subclass and the chosen base interface.

This is the single most important architectural decision in AriannA. If you understand only this, you understand the framework.

---

## §2. `Component` is **two things at once**

`Component` in AriannA v2 is a **single class** that doubles as a **callable dispatcher**. JavaScript supports this naturally because classes are functions: a class can be called like a function (with `()`, not `new`) as long as the implementation handles that case.

### §2.1 Component as a class

`Component` is a real ES class that extends `HTMLElement`. Its constructor is the entry point for every AriannA component, executed via `super()` from every user subclass.

```js
class Component extends HTMLElement
{
    constructor()
    {
        super();
        // 1. Capture new.target — the user subclass (Button, Card, …)
        // 2. Look up the descriptor by the tag the subclass was registered with
        // 3. Populate descriptor.Class = new.target (first time only)
        // 4. Stash buildArgs for build()
        // 5. Install facilities on `this` (shadow, sheet, attrs, build, template)
    }
}
```

The base interface (HTMLDivElement, HTMLInputElement, etc., when different from HTMLElement) is interposed dynamically: at `Define` time, `Component.prototype.__proto__` is configured to match the descriptor's `Interface` for the relevant tag. This positions the right native base between Component and HTMLElement in the chain.

### §2.2 Component as a callable dispatcher

`Component(...)` can be called in several different ways depending on the shape of its arguments. The dispatcher branches based on what it received:

| Call shape | Effect | Returns |
|---|---|---|
| `Component('tag', base, css, def)` | Registers descriptor in the registry; returns `Component` so it can be used as `extends Component(...)`. | `Component` (the class itself) |
| `Component(el)` where `el instanceof Element` | Installs facilities on the existing element (used internally by markup upgrade). | The element |
| `Component('#some-id')` or `Component('arianna-button.foo')` | Retrieves an existing component instance from the DOM by selector. | The matched element, or `null` |
| `Component({ tag: 'x', css: ..., def: ... })` | Object-form registration; equivalent to positional call. | `Component` |
| `new Component('tag', opts?)` | Constructor: instantiates an already-defined component programmatically. | A `ComponentWrapper { element, tag, Real, Virtual }` |
| `@Component('tag', css, def) class X { ... }` | Decorator form; applies registration to the decorated class. | Decorator function |

The dispatcher reads `args[0]` (and the presence of `new.target`) to decide which branch to take.

### §2.3 Why both at once

Having `Component` be a class **and** a callable dispatcher means:

- `class Button extends Component('arianna-button', HTMLDivElement, css, def)` works because the call returns `Component`, which is a valid class to extend.
- The user never sees `_factory` or `Bound` anonymous wrappers — they see one symbol, `Component`, doing one job.
- The dispatcher table is the natural place for sugar like `Component('#some-id')` retrieval, decorator form, element-wrapping, and other facility modes.
- Tree-shaking is straightforward: one export, one tree-shakable surface.

### §2.4 What this replaces

Anything in older code or documentation that talks about:

- `Bound` (an anonymous class returned by the factory)
- `_factory` (a function with its own prototype interposed between the user subclass and the base)
- `descriptor.Factory` (a separate function callable per descriptor)
- `descriptor.Update` (a closure built per descriptor)

is **legacy / wrong**. The unified model is: one `Component` class, one descriptor per tag, one `Namespace.Update(node)` method that reads the descriptor.

---

## §3. The descriptor — single source of truth

Every tag registered with `Component(tag, ...)` produces a **descriptor** in the namespace registry. This descriptor is the **only** persistent data structure that the upgrade pipeline reads. Everything else (`_factory.prototype`, `Bound`, intermediate wrappers) was unnecessary indirection and is removed in v2.

A descriptor looks like:

```ts
interface ComponentDescriptor
{
    Name              : string;                  // 'Button'
    Tags              : string[];                // ['arianna-button']
    Class             : Function | null;         // Button (populated lazily, see §3.2)
    Constructor       : Function;                // Always === Component (or its concrete extension chain)
    Interface         : Function;                // HTMLDivElement / HTMLElement / …
    Prototype         : object;                  // Class.prototype when Class is set, Component.prototype otherwise
    Def               : ComponentDef;            // { shadow, attrs, bus, css, render, … }
    Style             : object;                  // inline-style rules
    __ariannaSheetDefault : Stylesheet;          // pre-normalized default sheet
    Custom            : true;
    Standard          : false;
    // ── no Factory, no Update closure here ──
    // The Update behaviour is the namespace.Update() method,
    // which reads `this` (the descriptor) to do its work.
}
```

Note what's **removed** compared to v1/legacy:

- No `descriptor.Factory` (no separate `_factory` function with its own prototype that ends up shadowing the user subclass's prototype).
- No `descriptor.Update` closure (the upgrade logic lives in the namespace's single `Update(node)` method, which reads the descriptor by tag and acts on it).
- No `Bound` anonymous class returned by `Component(...)` (Component itself is returned).

The descriptor is **fat by design**: it carries everything any downstream operation needs. `Update` reads it, never invents fields.

### §3.1 Where `Class` lives

`descriptor.Class` is the user subclass (Button, Card, etc.). It is the most important field because `Update` uses it to set the prototype of every element of that tag: `Object.setPrototypeOf(node, descriptor.Class.prototype)`.

### §3.2 When `descriptor.Class` is populated

The descriptor is created at `Component(tag, …)` call time with `Class: null`. `Class` is populated the **first time `new <Subclass>()` runs**, because the `super()` chain propagates `new.target` from the most-derived constructor down through `Component.constructor`:

```
new Button(opts)
   → Button has no explicit constructor; synthesized default calls super(opts)
   → super is Component → Component.constructor(opts) runs
   → new.target === Button at this point (ECMA-262 §9.2.2)
   → Component looks up the descriptor for Button's tag
   → if descriptor.Class === null: descriptor.Class = new.target  ← captures Button
   → descriptor.Class is now permanently set
```

This works because `super()` propagation of `new.target` is a guaranteed property of ES class semantics — the most-derived constructor's identity is preserved through every superclass call.

---

## §4. The two upgrade paths, mechanically

### §4.1 The `new Button(opts)` path

```js
const btn = new Button({ variant: 'primary', label: 'Click me' });
document.body.appendChild(btn);
```

Step by step:

1. `new Button(opts)` triggers ECMA-262 `[[Construct]]` on `Button`.
2. `Button` has no explicit constructor (user didn't write one), so the default constructor calls `super(...args)`.
3. `super` is `Component`. `Component.constructor` runs.
4. `Component.constructor` calls `super()` to chain up to `HTMLDivElement` (or whichever base the descriptor specifies). The browser creates the real native element here, **respecting the prototype chain set up by ES class semantics**.
5. Component reads `new.target` → it's `Button`. Component looks up the descriptor for `Button`'s tag (how? see §4.3). Sets `desc.Class = Button` if not already set.
6. Component stashes `__buildArgs = [opts]` on `this`.
7. Component calls `_installFacilities(this)`:
   - Attaches shadow root (native or AriannaShadow polyfill)
   - Applies default sheet
   - Wires reactive attribute signals
   - Calls `this.build(opts)`
   - Mounts `this.template` into shadow root
8. `new` returns the fully-built element.

The prototype chain of `btn`:

```
btn → Button.prototype → Component.prototype → HTMLDivElement.prototype → … → Object.prototype
```

`btn.build` resolves to `Button.prototype.build`. ✓

### §4.2 The `<arianna-button>` markup path

```html
<arianna-button variant="primary">Click me</arianna-button>
```

Step by step:

1. HTML parser sees `<arianna-button>`. Tag is not in `customElements.define`'s registry (AriannA does NOT use it). Browser creates an `HTMLUnknownElement`.
2. AriannA's `Core.Observer` (a `MutationObserver` on document) sees the addition.
3. Observer calls `namespace.Update(node)`.
4. `Update` looks up the descriptor by `node.tagName.toLowerCase()`. Gets the `arianna-button` descriptor.
5. **Update reads `descriptor.Class`**. If `Class` is set (i.e. some prior `new Button()` happened, populating it via `new.target`, or `Component.Boot()` was called — see §5), great — use it. If `Class` is null, Update falls back to `descriptor.Constructor` (which is `Component`, the base class) for the prototype chain — but the user's `build()` method is on `Button`, not `Component`. **So the upgrade is incomplete until Class is populated.**
6. Update does: `Object.setPrototypeOf(node, desc.Class.prototype)`. This rewires the chain in-place:

   ```
   node → Button.prototype → Component.prototype → HTMLDivElement.prototype → …
   ```

7. Update calls `Component(node)` (the dispatcher's "install facilities on existing element" branch). This runs the same `_installFacilities` as step 7 of the `new` path: shadow, sheet, attrs, build, template.
8. The node is now indistinguishable from one created via `new Button()`.

### §4.3 The lookup question: how does Update know which Class to use?

Update reads the **descriptor**, which is keyed by tag. The descriptor's `Class` field is populated **the first time `new Subclass()` runs** — because `Component.constructor` captures `new.target` and writes it into the descriptor it looked up.

The implications:

- If the user's module does `new Button()` at least once (anywhere — boot code, test, programmatic creation), the descriptor's `Class` is populated permanently. All subsequent markup upgrades use it.
- If the user has only ever written markup, no `new` has run, and `Class` is null. The framework provides a **boot helper** (see §5) that walks every registered descriptor and runs a no-op `new` per tag to populate `Class`. This boot helper can be triggered manually at app startup or automatically by `Namespace.Initialize()` / the unified bundle IIFE.

In both cases, the answer to "how does Update know" is: **read it from the descriptor**. The descriptor is the source of truth. Update does not do runtime discovery, lookup, or guessing.

---

## §5. The boot phase (closing the markup-only gap)

For the markup-only case (no `new Button()` ever called from user code), AriannA exposes a single boot helper:

```ts
Component.Boot();
```

This walks every Custom descriptor in every Namespace and, for each one whose `Class` is null, attempts to find and `new` it once. The discovery mechanism here is intentionally **explicit** — it relies on the user having imported the component module (which is the only way the class ever gets defined), and looks for the class in a known location (e.g. `window.{Name}`, populated by the convention `Object.defineProperty(window, 'Button', { value: Button })` at module end).

The recommended pattern is to call `Component.Boot()` after all imports have finished, typically once at app entry:

```ts
import './components/inputs/Button.ts';
import './components/inputs/Input.ts';
import './components/cards/Card.ts';
// … all components imported …

Component.Boot();          // populate every descriptor.Class
// Now any markup like <arianna-button> will upgrade fully.
```

For the playground and component test pages, this is called automatically during the bundle's IIFE bootstrap.

For projects that exclusively use `new` instantiation, `Boot()` is not needed — descriptors auto-populate as components are instantiated.

`Component.Boot()` is **idempotent** and **cheap**. It can be called multiple times safely (only descriptors with `Class === null` are touched). Calls after the first do nothing.

---

## §6. Shadow vs Light DOM mechanics

`_installFacilities` reads `descriptor.Def.shadow` to decide between three rendering modes. This is the same regardless of `new` vs markup path.

### §6.1 Native Shadow DOM (`shadow: 'open'` or `'closed'` on a registered builtin)

When the base interface is a registered HTMLElement subclass that supports `attachShadow` (most cases), AriannA calls native `element.attachShadow({ mode })`. The shadow root is real DOM:

- CSS rules in `desc.__ariannaSheetDefault` are appended as `<style>` to the shadow root → CSS encapsulation via the shadow boundary.
- `this.template` (set in `build()`) is mounted into the shadow root.
- `<slot>` elements work natively — the browser handles projection.

```
host                               ← Button (light DOM)
  #shadow-root (closed)            ← native ShadowRoot
    <style>…</style>
    <button class="ar-btn__native">
      <slot></slot>                ← projection point
    </button>
  "Click me"                       ← light child, projected by browser
```

### §6.2 AriannaShadow polyfill (`shadow: 'open'` or `'closed'` on an unregistered tag)

When the base is `HTMLElement` and the tag is `<arianna-something>`, the browser sees `HTMLUnknownElement`, which is not on the `attachShadow` whitelist. Native call throws `NotSupportedError`. AriannA catches this and installs `AriannaShadow` instead (see `Shadow.ts`):

- A JS object emulating the shadow root contract.
- Children of the template fragment are **moved into the host element** (light DOM), but scoped via `data-arianna-instance="cabc123"` on the host and matching attribute selectors in the generated `<style>` block in `<head>`.
- `<slot>` elements in the template are replaced with Comment anchors, and light children are reparented to the anchor positions via JavaScript at mount and on every `MutationObserver` fire on the host.

```
host                                              ← Button (light DOM, has data-arianna-instance)
  <button class="ar-btn__native" data-arianna-projected="false">
    <!-- arianna-slot:default -->                 ← projection anchor
    "Click me"                                    ← projected here by AriannaShadow
  </button>
```

CSS encapsulation is **weaker** than native shadow DOM (a global `* { color: red }` still affects everything inside), but the contract (`Shadow.Root.querySelector`, `arianna:slotchange` event, fallback content, scoped styles via instance-id) is preserved.

The user code does not see the difference. `this.Shadow.Root` works in both modes. `this.template` mounts in both modes. Slot projection works in both modes.

#### Contract comparison: native ShadowRoot vs AriannaShadow

| Native ShadowRoot | AriannaShadow |
|---|---|
| DOM node, returned by `attachShadow` | JS object, stashed on host under `Symbol.for('arianna.shadow.root')` |
| Children live in shadow tree | Children live in light DOM, scoped by `data-arianna-instance` |
| `<slot>` elements project light DOM | `<slot>` elements rewritten to Comment anchors; light children reparented via DOM moves |
| `slotchange` event | `arianna:slotchange` CustomEvent on host |
| CSS encapsulated by tree boundary | CSS encapsulated by instance-id attribute selector |
| `querySelector` scoped to shadow | `querySelector` delegated to host subtree |
| Event retargeting at boundary | Events bubble normally (no retargeting) |
| Hard isolation from page CSS | Soft isolation (page CSS can still pierce) |

### §6.3 Light DOM (`shadow: false`)

No shadow root attached. The template mounts directly into the host element. Useful for SVG composition, third-party CSS interop, and cases where shadow scoping is undesired.

```
host                               ← Button (light DOM only)
  <button class="ar-btn__native">
    "Click me"                     ← direct child, no projection
  </button>
```

CSS scoping in this mode uses tag-attribute selectors (e.g. `arianna-button[data-arianna-instance="cabc123"]`) injected into `<head>`.

Use Light DOM when:

- You want third-party CSS to be able to style the component's internals
- The component composes SVG / MathML content where shadow boundary is awkward
- You need `<slot>`-free composition (light children are direct children, no projection)

---

## §7. The descriptor as bag of parameters (anti-rot rule)

Anywhere in the upgrade pipeline, the rule is:

> **If you need a parameter, read it from the descriptor. If the descriptor doesn't have it, the bug is in `Define` (or in the registration call), not in `Update`.**

`Update` and `_installFacilities` MUST NOT:

- Walk `window.*` looking for classes (except inside the explicit `Component.Boot()` flow).
- Call `Function.toString()` and regex-match for `Component(this)` markers.
- Use stack introspection to find caller class names.
- Re-derive any setting from the constructor name or DOM state.

If a piece of information is needed during upgrade, it goes in the descriptor at `Define` time. Period.

This is a hard rule, because the alternative is the slow rot of every mature framework: every release adds one more "discovery heuristic" and the framework becomes a guessing machine.

---

## §8. Recap diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  USER WRITES                                                    │
│                                                                 │
│  class Button extends Component('arianna-button',               │
│                                   HTMLDivElement, css, def)     │
│  {                                                              │
│      build(opts) { this.template = html`…`; }                   │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼  (at module load)
┌─────────────────────────────────────────────────────────────────┐
│  Component(tag, base, css, def) dispatcher:                     │
│    • Registers descriptor in namespace.Custom.Tags[tag]         │
│        descriptor = { Tags, Interface, Def, Style, Sheet,       │
│                       Class: null, Constructor: Component, … }  │
│    • Returns Component (the class itself)                       │
│                                                                 │
│  ES engine: class Button extends Component { build() {…} }      │
│    • Object.setPrototypeOf(Button, Component)                   │
│    • Object.setPrototypeOf(Button.prototype, Component.proto)   │
│    • Button.prototype.build = function(opts) {…}                │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║  PATH A: new Button(opts)                                         ║
╠═══════════════════════════════════════════════════════════════════╣
║  new Button(opts)                                                 ║
║    → Button.constructor (synthesized, calls super(opts))          ║
║    → Component.constructor(opts):                                 ║
║        • super() — finishes DOM chain                             ║
║        • desc.Class ?= new.target  (populates Button)             ║
║        • this.__buildArgs = [opts]                                ║
║        • _installFacilities(this)                                 ║
║            ├─ attach shadow (native or AriannaShadow)             ║
║            ├─ apply default sheet                                 ║
║            ├─ wire attr signals                                   ║
║            ├─ call this.build(opts)  ← assigns this.template      ║
║            └─ mount template into shadow root                     ║
║    → returns fully-built Button instance                          ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║  PATH B: <arianna-button>…</arianna-button> (markup)              ║
╠═══════════════════════════════════════════════════════════════════╣
║  HTML parser: creates HTMLUnknownElement                          ║
║  MutationObserver → namespace.Update(node)                        ║
║    • desc = registry.lookup(node.tagName)                         ║
║    • if !desc.Class: rely on Component.Boot() having populated    ║
║      it, OR fall back to incomplete upgrade                       ║
║    • Object.setPrototypeOf(node, desc.Class.prototype)            ║
║    • Component(node) → _installFacilities(node)                   ║
║        ├─ attach shadow                                           ║
║        ├─ apply default sheet                                     ║
║        ├─ wire attr signals                                       ║
║        ├─ call node.build()                                       ║
║        └─ mount template into shadow root                         ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║  COMPONENT.BOOT() — populates desc.Class for markup-only paths    ║
╠═══════════════════════════════════════════════════════════════════╣
║  For each Custom descriptor with Class === null:                  ║
║    • find the user subclass (via known location, e.g. window.X)   ║
║    • call new Subclass() once with no args                        ║
║    • Component.constructor captures new.target,                   ║
║      populates desc.Class                                         ║
║    • discard the throwaway instance                               ║
║  All subsequent markup upgrades work fully.                       ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## §9. The single rule that prevents all of this from rotting

> **One descriptor per tag. One class per descriptor. One Component class for the whole framework. The descriptor IS the bag of parameters.**

Every change to the framework that violates this rule (adds another wrapper, introduces a parallel registry, discovers state at runtime) is rejected on principle, not on technical merit. The technical merit follows from the principle.

---

# Part II — Authoring Components (conventions)

## §10. Tag naming

### §10.1 Rules

AriannA accepts **any string** as a tag name. The framework does NOT use the W3C `customElements.define` mechanism, so the standard custom-element constraints do NOT apply:

- ✓ `'arianna-button'` — kebab-case (conventional)
- ✓ `'papa'` — single word, no hyphen
- ✓ `'Cuore'` — PascalCase
- ✓ `'CUORE'` — all-caps
- ✓ `'my_widget'` — underscore
- ✓ `'x'` — single character
- ✓ `'123tag'` — starts with digit
- ✓ `'my:element'` — colon (allowed but discouraged)

### §10.2 Lookup is case-insensitive

`Component('Cuore', …)` and `Component('cuore', …)` register under the same canonical key. Internally tag names are lowercased.

### §10.3 Collision with native HTML/SVG tags

Choosing a name that collides with a standard tag (e.g. `'div'`) is **allowed but strongly discouraged**: the browser parses the markup as the native element, and AriannA overlays its prototype on top — potentially breaking native behaviour if the user class does not extend the corresponding native element.

```ts
// Permitted but RISKY:
Component('div', HTMLElement, css, def);  // overlays HTMLDivElement prototype
```

### §10.4 Convention for project components

For the 140+ in-tree components, the convention is `arianna-<name>` with kebab-case:

- ✓ `arianna-button`, `arianna-card`, `arianna-code-editor`, `arianna-data-table`
- ✗ `Button`, `card-arianna`, `arianna_button`

This convention applies to project components only — third-party users are free.

---

## §11. Definition forms — the five cases

A component can be defined in five syntactically distinct ways. All five produce identical descriptors and identical instance behaviour.

### §11.1 Case 1 — `function A` + `Core.Define`

```ts
function MyFn(this: HTMLElement) {
    this.textContent = 'function-style component';
}
Core.Define('arianna-fn', MyFn, HTMLElement, css?, def?);
```

Functions are upgraded by being **called with `this` bound to the element**, after facilities are installed.

### §11.2 Case 2 — `class A` (no `extends`) + `Core.Define`

```ts
class MyA {
    build(opts) { /* … */ }
}
Core.Define('arianna-a', MyA, HTMLElement, css?, def?);
```

The class has no native parent. `Core.Define` infers the base from the third argument (`HTMLElement` here).

### §11.3 Case 3 — `class A extends B` + `Core.Define`

```ts
class MyB extends HTMLDivElement {
    build(opts) { /* … */ }
}
Core.Define('arianna-b', MyB, css?, def?);
```

The third argument is omitted (or is the `css`); the base is read from the class's existing `extends` clause.

### §11.4 Case 4 — `class A extends Component(...)` ← canonical

```ts
class Button extends Component(
    'arianna-button',                            // tag
    HTMLElement,                                 // base interface
    {                                             // css (optional)
        ':host'                       : { display: 'inline-flex', padding: '5px 14px' },
        ':host([variant="primary"])'  : { background: '#1f6feb', color: '#fff' },
    },
    {                                             // def (optional)
        attrs : ['variant', 'size', 'icon', 'disabled'],
        shadow: 'closed',
    }
)
{
    template = `
        <button class="ar-btn__native" part="button" @click="this.onClick">
            <slot></slot>
        </button>
    `;

    onClick(e) { /* … */ }
    build(opts) { /* … */ }
}
```

**This is the recommended form for project components.** The factory invocation reads naturally as part of the class declaration, the descriptor is registered at module load, and the prototype chain is canonical (see §1).

#### Arguments

| # | Name | Type | Optional |
|---|------|------|----------|
| 1 | `tag` | `string` (any — see §10) | required |
| 2 | `super` | `Constructor<Element>` (HTML/SVG/Math/X3D base, custom user class, or another `Component(...)` class) | required |
| 3 | `css` | `CssInput` (5 forms — see §13) | optional |
| 4 | `def` | `ComponentDef` (see §12) | optional |

#### Class identity

The class that extends `Component(...)` is **the** user class. AriannA captures it at the first `new MyClass()` (or `Reflect.construct(MyClass, ...)`) via the `super()` chain — `new.target` propagates through and is recorded in `descriptor.Class`. Subsequent markup instantiations splice the user class prototype.

#### Anonymous parent

Since `Component(tag, ...)` returns `Component` itself (not an anonymous class), the parent in the chain has a proper name. `GetPrototypeChain(node)` returns `[Subclass.name, 'Component', <Interface.name>, 'HTMLElement', 'Element', 'Node', 'EventTarget', 'Object']`.

### §11.5 Case 5 — `@Component(...)` decorator

Two overloads.

#### §11.5.1 Object-style overload

```ts
import { Component, Prop } from 'arianna';

@Component({
    tag      : 'arianna-greet',
    template : '<button><slot></slot></button>',
    style    : ':host { color: #e40c88; }',
    shadow   : 'open',
    attrs    : ['name'],
})
class Greet extends HTMLElement
{
    @Prop() name = 'AriannA';
    connectedCallback() { /* ... */ }
}
```

Accepted keys in the object:

| Key | Type | Notes |
|-----|------|-------|
| `tag` | `string` | required |
| `template` | `string` | optional — same as setting `this.template = ...` |
| `style` | `string \| Rule \| Stylesheet \| object` | optional — equivalent to factory `css` arg |
| `css` | (alias of `style`) | optional |
| `shadow` | `'open' \| 'closed' \| false` | optional — same as `def.shadow` |
| `attrs` | `string[]` | optional — same as `def.attrs` |
| `bus` | `string` | optional — same as `def.bus` |
| `render` | `'real' \| 'virtual'` | optional — same as `def.render` |
| `base` | `Constructor<Element>` | optional — if class has no explicit `extends Super`, the decorator uses this; otherwise inferred from `Object.getPrototypeOf(target.prototype)` |

#### §11.5.2 Positional-style overload — `@Component(tag, css?, def?)`

Matches the factory call signature exactly, except the user class is the decorator target (so no `super` argument — it is read from `extends` of the class).

```ts
@Component('arianna-greet',
    { ':host': { color: '#e40c88' } },
    { shadow: 'open', attrs: ['name'] }
)
class Greet extends HTMLElement
{
    name = 'AriannA';
    connectedCallback() { /* ... */ }
}
```

The decorator distinguishes the two overloads at runtime: if the first argument is a plain object with a `tag` key, it's the object-style; if it's a string, it's positional.

#### Caveat — decorator runtime

AriannA uses TypeScript 5.x's **standard ES2023 decorator** syntax (NOT the legacy `experimentalDecorators`). The decorator factory receives `(target, context)` and returns a (possibly modified) class.

```ts
type ClassDecorator<T extends abstract new (...args: any[]) => any> = (
    target  : T,
    context : ClassDecoratorContext,
) => T | void;
```

---

## §12. The `ComponentDef` object

```ts
interface ComponentDef
{
    attrs?  : string[];                                          // attributes that auto-mirror to signals
    shadow? : 'open' | 'closed' | 'iframe' | 'arianna' | false;  // shadow mode (default 'closed')
    iframe? : AriannaShadowOptions;                              // options for the iframe backend (when shadow:'iframe')
    bus?    : string;                                            // parent component tag for sub-component registration
    render? : 'real' | 'virtual';                                // imperative DOM mode (default 'real')
    css?    : CssInput;                                          // alternative way to pass css (mixed-mode)
}
```

### §12.1 `attrs` — reactive attribute list

Each name in `attrs` becomes:

- a Signal accessible via `this.attrSignal(name)`
- auto-synced to/from the DOM attribute (`setAttribute` → signal write; signal write → `setAttribute`)
- the source for `attr-change` events (`name + '-change'`) dispatched on the host
- the source for `{{ this.<name>() }}` template bindings

```ts
class Btn extends Component('arianna-btn', HTMLElement, css, { attrs: ['variant', 'size'] })
{
    build()
    {
        const variant = this.attrSignal('variant');
        effect(() => console.log('variant changed:', variant.get()));
    }
}
```

Attribute names with hyphens are accessible by their original form: `attrSignal('icon-right')`.

### §12.2 `shadow` — shadow mode

- `'closed'` (default) — closed shadow root, accessible via `this.Shadow.Root` (stored on a private Symbol so the framework can manipulate it without exposing it via `el.shadowRoot`). Falls back to the AriannaShadow light backend if native `attachShadow` throws.
- `'open'` — open shadow root, also accessible via the browser's `el.shadowRoot`. Same fallback behaviour.
- `'iframe'` — AriannaShadow iframe backend: a hidden sandboxed `<iframe>` gives a real document boundary (hardest CSS isolation, native event retargeting, postMessage `send()`). High cost per instance. Configure via the `iframe` field. For plug-in slots, sandboxed code, third-party embeds.
- `'arianna'` — force the AriannaShadow light backend even when native shadow would work (useful for testing the polyfill).
- `false` — no shadow root. Template renders into the host element's light DOM. CSS scoping via `data-arianna-instance` attribute.

When the host element's interface does not support `attachShadow` (e.g. `HTMLUnknownElement` because the tag is `<arianna-foo>` and we don't call `customElements.define`), AriannA falls back to the **AriannaShadow light backend**. There is ONE `AriannaShadow` type with a `Backend: 'light' | 'iframe'` field — NOT a separate IframeShadow type. See **SHADOW.md** for the complete shadow architecture, all five modes, the escalation policy, and the iframe backend details.

### §12.3 `bus` — sub-component registration

For composite components (e.g. `<arianna-list>` with child `<arianna-list-item>`), `bus: 'arianna-list'` makes the child auto-register on the nearest ancestor of that tag. The parent receives a reactive `_children` Signal listing all matched descendants in order.

```ts
class List extends Component('arianna-list', HTMLElement, css)
{
    build()
    {
        effect(() => {
            console.log('children changed:', this._children.get());
        });
    }
}

class ListItem extends Component('arianna-list-item', HTMLElement, css, { bus: 'arianna-list' })
{
    // auto-registers on parent <arianna-list>
}
```

### §12.4 `render` — imperative DOM mode

Hint for `Real` / `Virtual` constructors when used inside `build()`. Most projects use `'real'` (the default). JSX defaults to `'real'` unless a `@dom-render: virtual` pragma is present in the file.

---

## §13. The `css` argument — five accepted forms

The third positional argument to `Component(tag, base, css?, def?)` (or the `style`/`css` key in the decorator object) accepts five forms. All produce a `Stylesheet` stored on `descriptor.__ariannaSheetDefault`.

### §13.1 Form 1 — plain CSS string

```ts
Component('arianna-x', HTMLElement, `
    :host { display: block; padding: 8px; }
    .item { color: #e40c88; }
`)
```

### §13.2 Form 2 — selector→rules object

```ts
Component('arianna-x', HTMLElement, {
    ':host': { display: 'block', padding: '8px' },
    '.item': { color: '#e40c88' },
})
```

Property keys can be camelCase (`borderRadius`) — they are converted to kebab-case (`border-radius`).

### §13.3 Form 3 — array of `Rule` instances

```ts
import { Rule } from 'arianna';
Component('arianna-x', HTMLElement, [
    new Rule(':host',  { display: 'block', padding: '8px' }),
    new Rule('.item',  { color: '#e40c88' }),
])
```

Use when you want programmatic rules (computed selectors, computed values).

### §13.4 Form 4 — pre-built `Stylesheet`

```ts
import { Stylesheet, Rule } from 'arianna';
const SheetX = new Stylesheet([
    new Rule(':host',  { display: 'block' }),
    new Rule('.item',  { color: '#e40c88' }),
]);
Component('arianna-x', HTMLElement, SheetX)
```

Use when sharing a stylesheet between components or computing it at module load.

### §13.5 Form 5 — function returning any of the above

```ts
Component('arianna-x', HTMLElement, () => ({
    ':host': { display: theme.get('layout') === 'compact' ? 'inline-flex' : 'block' },
}))
```

Evaluated lazily at first instance creation. Use only when the stylesheet genuinely depends on runtime state (rare).

---

## §14. Templates and directives (cross-reference)

The template is the visual structure of the component. It can be:

- Set as a **class property** (recommended): `template = '…'`
- Set inside `build()`: `this.template = html'…'`
- Bootstrapped on an existing DOM tree via `Directive.bootstrap(root, scope)`

Templates support `{{ expr }}` interpolation, `:attr` / `.prop` / `?bool` bindings, `@event` listeners (with modifiers), `a-if`/`a-else-if`/`a-else`, `a-for`/`a-foreach`/`a-while`, `a-switch`/`a-case`/`a-default`, `a-show`/`a-text`/`a-html`, `a-class`/`a-style`, `a-model` (two-way), `a-bind`/`a-on` (programmatic), `<slot>`, custom directives.

For the **complete directive reference**, see `TEMPLATE_DIRECTIVES.md`. This document does not repeat it.

```ts
class Card extends Component('arianna-card', HTMLElement, css, { attrs: ['title'] })
{
    template = `
        <article class="card">
            <header a-if="this.title()"><h2>{{ this.title() }}</h2></header>
            <div class="body"><slot></slot></div>
            <footer><slot name="footer"></slot></footer>
        </article>
    `;
}
```

Expression context inside directives:

- `this` is the **component instance**
- Local variables from `build()` are NOT in scope (no closure capture)
- Signals must be invoked (`this.count()`) or `.get()`-ed; bare references print `[object Object]`

---

## §15. `build(opts)` and class properties

`build` is the main per-instance setup method. It runs once per instance, **after** facilities are installed (shadow attached, sheet applied, attrs wired), **after** any class property `template` has been mounted, and **before** the element enters the DOM.

```ts
class Counter extends Component('arianna-counter', HTMLElement, {
    ':host': { display: 'inline-flex', gap: '8px' },
}, { attrs: ['start'] })
{
    template = `
        <button @click="this.dec">-</button>
        <span>{{ this.count() }}</span>
        <button @click="this.inc">+</button>
    `;

    // Class fields run AFTER super() returns, BEFORE the instance is returned to the caller.
    count = signal(0);

    inc = () => this.count.set(this.count() + 1);
    dec = () => this.count.set(this.count() - 1);

    build(opts)
    {
        const startAttr = this.attrSignal('start').get();
        const start     = startAttr ? parseInt(startAttr, 10) : (opts?.start ?? 0);
        this.count.set(start);
    }

    onMount()   { console.log('counter mounted'); }
    onUnmount() { console.log('counter removed'); }
}
```

`opts` is whatever was passed to `new Counter(opts)`. For markup-instantiated elements (`<arianna-counter>`), `opts` is `undefined`.

**Inside `build()` you typically:**

1. Read initial attribute values
2. Initialise reactive state (`signal(…)`, `computed(…)`)
3. Register `effect(…)` callbacks
4. Wire imperative listeners not covered by `@click=…` template directives

**You do NOT typically:**

- Construct DOM (the template handles it)
- Attach the shadow root (already attached)
- Apply the default sheet (already applied)

---

## §16. Sheet.Default / Sheet.Current

Every component class gets a static `Sheet.Default` (a `Stylesheet` built from the `css` argument). At instance time, `Sheet.Current` is initialised as a clone of `Sheet.Default`, allowing per-instance modification without affecting siblings:

```ts
class Button extends Component('arianna-button', HTMLElement, defaultCss, def) { /* … */ }

Button.Sheet.Default   // Stylesheet — read-only canonical sheet for the class
btn.Sheet.Current      // Stylesheet — this instance's mutable sheet
```

Modify an instance sheet:

```ts
btn.Sheet.Current.add(new Rule(':host', { background: 'red' }));
btn.Sheet.Current.attach(btn.Shadow.Root);   // re-attach to the shadow root
```

Subclasses **inherit** the parent's default sheet (deep cloned at class definition time):

```ts
class PrimaryButton extends Component('arianna-primary-button', Button, extraCss) { /* … */ }

PrimaryButton.Sheet.Default   // = Button.Sheet.Default + extraCss
```

---

## §17. `this.Host` — render target

Inside `build()`, three properties expose render-relevant nodes:

- `this` — the host Element (the `<arianna-button>` itself)
- `this.Shadow.Root` — the shadow root (native or AriannaShadow), or `null` if `shadow: false`
- `this.Host` — alias of `this` (provided for symmetry with frameworks that wrap the host)

`this.template` is mounted into `this.Shadow.Root` if a shadow is present, otherwise into `this`. Choose your queries accordingly:

```ts
build()
{
    // Query inside the shadow:
    const btn = this.Shadow.Root.querySelector('button.ar-btn__native');

    // Query the light DOM (slot contents):
    const lightSpan = this.querySelector('span.user-provided');
}
```

---

## §18. `constructor` vs `build()`

**Use `build()` for setup.** The class `constructor` is reserved for ES class semantics (super chaining, field initialisation). User-visible setup happens in `build(opts)`.

```ts
// ✗ Avoid:
class Bad extends Component('arianna-bad', HTMLElement, css)
{
    constructor()
    {
        super();
        // Setting up state here runs BEFORE facilities are installed.
        // attrSignal is not yet available, Shadow.Root is not yet attached.
    }
}

// ✓ Use:
class Good extends Component('arianna-good', HTMLElement, css)
{
    build(opts)
    {
        // Runs AFTER facilities. attrSignal, Shadow.Root, Sheet.Current all ready.
    }
}
```

The only acceptable reason to override `constructor` is for non-AriannA inheritance pattern hooks (extremely rare). When you do, always call `super(...arguments)` first.

---

## §19. Decorators

All decorators use **TypeScript 5.x standard ES2023 syntax** (NOT `experimentalDecorators`).

| Decorator | Target | Effect |
|---|---|---|
| `@Component(tag, css?, def?)` or `@Component({…})` | class | Registers the class as a custom element (equivalent to Case 4) |
| `@Prop()` | class field | Declares a reactive property mirrored to an attribute |
| `@State()` | class field | Internal reactive state (Signal-backed, no DOM mirror) |
| `@Watch('key')` | method | Method runs when the named signal/prop/attr changes |
| `@Event` | method | Calling the method dispatches a CustomEvent of that name |
| `@Bind` | method | Auto-binds `this` (alternative to arrow functions) |
| `@Sheet(rules)` | class | Augments `Sheet.Default` with extra rules |

### §19.1 `@Prop()` — reactive property + attribute

```ts
@Component('arianna-greet', css)
class Greet extends HTMLElement
{
    @Prop() name = 'AriannA';
    @Prop({ attribute: 'user-id' }) userId = '';
    @Prop({ type: Number }) age = 0;
}
```

`@Prop` creates a Signal, syncs it to the DOM attribute (kebab-case by default; override with `{ attribute: 'name' }`), and exposes a getter/setter on the class instance.

### §19.2 `@State()` — internal reactive state

```ts
@Component('arianna-clock', css)
class Clock extends HTMLElement
{
    @State() seconds = 0;

    onMount()
    {
        setInterval(() => this.seconds += 1, 1000);
    }
}
```

Same as `@Prop` but without DOM attribute mirroring. Use for private state that doesn't need to be settable from markup.

### §19.3 `@Watch('key')` — reactive observer

```ts
@Component('arianna-tracker', css, { attrs: ['user-id'] })
class Tracker extends HTMLElement
{
    @Watch('userId') onUserChange(newId, oldId)
    {
        console.log(`User changed from ${oldId} to ${newId}`);
    }
}
```

### §19.4 `@Event` — custom event emitter

```ts
class Btn extends Component('arianna-btn', HTMLElement)
{
    @Event arianna_click(detail) { /* method body has access to detail; CustomEvent is dispatched on call */ }
}

// Usage:
btn.arianna_click({ source: btn });   // dispatches new CustomEvent('arianna-click', { detail: { source: btn } })
```

### §19.5 `@Bind` — auto-binding

```ts
class Box extends Component('arianna-box', HTMLElement)
{
    @Bind handleClick(e) { console.log(this); }   // `this` is always the instance
}
```

Equivalent to using arrow class fields. Choose one style per project.

### §19.6 `@Sheet(rules)` — augment default sheet

```ts
@Sheet({
    ':host': { display: 'inline-flex' },
    '.icon': { width: '16px' },
})
class IconBtn extends Component('arianna-icon-btn', HTMLElement, baseCss, def) { /* … */ }
```

Adds rules on top of whatever was passed to the `Component(...)` factory.

---

# Part III — Lifecycle

## §20. Full lifecycle pipeline (complete diagram)

```
                             ┌────────────────────────────────────┐
                             │  CLASS DEFINITION TIME (once)      │
                             ├────────────────────────────────────┤
                             │  • Component(tag, Base, css, def)  │
                             │    parses the css argument         │
                             │    into Sheet.Default              │
                             │  • template string parsed into     │
                             │    <template> element + cached     │
                             │  • descriptor registered in        │
                             │    namespace.Custom.Tags[tag]      │
                             │    (Class: null at this point)     │
                             └────────────────────────────────────┘
                                          │
                                          ▼
═══════════════════════════════════════════════════════════════════════════
                         PER-INSTANCE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════

    new MyClass(opts)
         │
         ▼
┌──────────────────────────┐
│  Native constructor      │   HTMLElement (and optionally HTML(X)Element)
│  chain via super()       │   constructor runs
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  descriptor.Class set    │   Component reads new.target
│  if currently null       │   writes desc.Class = new.target
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Facilities installed    │   • __ariannaCustom marker set
│                          │   • attrSignal accessor patched onto element
│                          │   • _children accessor (if def.bus configured)
│                          │   • Sheet.Current = clone(Sheet.Default)
│                          │   • Shadow root attached (closed by default)
│                          │     [native or AriannaShadow polyfill]
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onCreated()             │   user hook  ⚠ semantics reserved
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  build(opts)             │   user hook — invoked synchronously
│                          │     opts: whatever was passed to new MyClass(opts)
│                          │   • register signals, effects
│                          │   • assign this.template
│                          │   • additional Real/Virtual nodes
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Template instantiation  │   • <template>.content.cloneNode(true)
│                          │   • directives bound (a-if, a-for, @click, etc.)
│                          │   • shadowRoot.appendChild(clone)
│                          │   • Sheet.Current attached to shadowRoot
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onBeforeMount()         │   user hook  ⚠ semantics reserved
└──────────┬───────────────┘
           │
═══════════ DOM INSERTION (browser-driven) ════════════════════════════════
           │
           ▼
┌──────────────────────────┐
│  connectedCallback       │   browser fires when element enters DOM
│  (Web Components std)    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onMount()               │   ✅ user hook — WIRED & invoked
│                          │   • global event listeners
│                          │   • timers, animations
│                          │   • IntersectionObserver, etc.
└──────────┬───────────────┘
           │
═══════════ RUNTIME ═══════════════════════════════════════════════════════
           │
           ▼
┌──────────────────────────┐
│  attributeChangedCallback│   browser fires per observed attribute change
│                          │   • attrSignal[name].set(newValue)
│                          │   • subscribed effects re-run
│                          │   • template bindings update
└──────────┬───────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Signal change   │   effect re-runs
   │ inside effect   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ onBeforeUpdate()│   user hook  ⚠ semantics reserved
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ DOM mutation    │   sink writes value to DOM
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ onUpdate()      │   user hook  ⚠ semantics reserved
   └─────────────────┘
            │
═══════════ DOM REMOVAL (browser-driven) ══════════════════════════════════
            ▼
┌──────────────────────────┐
│  onBeforeUnmount()       │   user hook  ⚠ semantics reserved
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  disconnectedCallback    │   browser fires when element leaves DOM
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Internal cleanup        │   • all __disposers (effects from build) run
│                          │   • all __unmountFns run
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onUnmount()             │   ✅ user hook — WIRED & invoked
│                          │   • clear timers
│                          │   • remove global listeners
│                          │   • cancel async ops
└──────────────────────────┘
```

---

## §21. Per-instance lifecycle steps

Two distinct phases, separated by a clean boundary.

```
─────────────────────────────────────────────────────────────────
PHASE A — class definition (runs once when the file loads)
─────────────────────────────────────────────────────────────────
  1. Component(tag, Base, css, def) call expression evaluated
     within `class X extends Component(...) {}`
  2. Descriptor registered in namespace.Custom.Tags[tag],
     with Class: null
  3. css argument → Stylesheet → descriptor.__ariannaSheetDefault
  4. template string property → parsed into <template> element,
     cached on the user class
  5. ES engine sets Object.setPrototypeOf(X, Component)
                    Object.setPrototypeOf(X.prototype, Component.prototype)
     X.prototype.build = function(opts) { … }

─────────────────────────────────────────────────────────────────
PHASE B — instance lifecycle (runs N times, once per element)
─────────────────────────────────────────────────────────────────
  6. new X(opts) or <my-tag> in HTML
  7. ES [[Construct]] on X; default constructor calls super(opts)
  8. Component.constructor(opts) runs:
     ├─ super() — chains through HTML(X)Element to HTMLElement
     ├─ descriptor.Class ?= new.target  (captures X if first time)
     ├─ this.__buildArgs = [opts]
     └─ _installFacilities(this) — see step 9-14
  9. attrSignals created for each name in def.attrs
 10. _children accessor (if def.bus configured)
 11. Sheet.Current = clone(Sheet.Default)
 12. Shadow root attached (closed by default; AriannaShadow polyfill
     when native attachShadow throws on unregistered tag)
 13. onCreated() — user hook (semantics reserved)
 14. build(opts) ✅ — assigns this.template, registers effects
 15. Template instantiated and mounted into shadow root
 16. onBeforeMount() — user hook (semantics reserved)
 17. connectedCallback (browser)
 18. onMount() ✅ — global setup
 19. ... runtime ...
       — attributeChangedCallback → attrSignals[name].set(...)
       — onBeforeUpdate(prev, next) (semantics reserved)
       — DOM mutation
       — onUpdate(prev, next) (semantics reserved)
 20. onBeforeUnmount() — user hook (semantics reserved)
 21. disconnectedCallback (browser)
 22. internal cleanup: all __disposers + __unmountFns run
 23. onUnmount() ✅ — final teardown
 24. (if moved to another document) onAdopted()
```

Steps 1–5 happen once per file load. Steps 6–24 happen once per element instance.

---

## §22. Hook reference table

| Hook | When | Status | Typical use |
|---|---|---|---|
| `onCreated()` | After facilities, before `build()` | reserved | Set up data not derived from attrs |
| `build(opts)` | Main setup | ✅ wired | Assign `this.template`, initialise signals, register effects |
| `onBeforeMount()` | After `build()`, before DOM insertion | reserved | Capture slot content references |
| `onMount()` | DOM is live | ✅ wired | Global listeners, timers, animations, IntersectionObserver |
| `onAttributeChanged(name, old, new)` | Per observed attribute change | reserved | Manual reaction beyond automatic signal update |
| `onBeforeUpdate(prev, next)` | Before reactive DOM write | reserved | Snapshot scroll position, focus state |
| `onUpdate(prev, next)` | After reactive DOM write | reserved | Restore scroll, refocus |
| `onBeforeUnmount()` | Just before `disconnectedCallback` | reserved | Animate-out, save state |
| `onUnmount()` | After internal cleanup | ✅ wired | Clear timers, remove global listeners, abort fetch |
| `onAdopted()` | Moved to another document | reserved | Re-wire document-scoped resources |

---

## §23. The two hooks that work today (current implementation status)

As of the current implementation, **only `build()`, `onMount()`, and `onUnmount()` are wired** to fire user code reliably. The other hooks are declared on the interface but not yet invoked by the runtime in every edge case.

```ts
class MyCmp extends Component('arianna-mycmp', HTMLElement, css, { attrs: ['name'] })
{
    template = `<div>{{ this.name() }}</div>`;

    timerId: number | null = null;

    build(opts)
    {
        // ✅ ALWAYS RUNS — entry point for setup
        console.log('build', opts);
    }

    onMount()
    {
        // ✅ RUNS when element enters DOM
        this.timerId = window.setInterval(() => this.tick(), 1000);
        window.addEventListener('resize', this.onResize);
    }

    onUnmount()
    {
        // ✅ RUNS when element leaves DOM
        if (this.timerId !== null) clearInterval(this.timerId);
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => { /* ... */ };
    tick     = () => { /* ... */ };
}
```

**Symmetry rule** (mandatory): everything you set up in `onMount` MUST be torn down in `onUnmount`. The framework runs internal `__disposers` for you (effects from `build()`), but global listeners, timers, observers, and external subscriptions are your responsibility.

---

## §24. `build(opts)` — the main entry point

`build` runs **after** facilities are installed (attrSignal, shadow root, Sheet) and **after** the template is parsed into the shadow root. It's where you:

1. Capture attribute signals: `const name = this.attrSignal('name')`
2. Initialise private reactive state: `const count = signal(0)`
3. Register effects: `effect(() => console.log(count.get()))`
4. Add extra DOM not covered by `template` (rare — prefer template)
5. Wire imperative listeners not covered by `@click=...` template directives (rare)

```ts
class Counter extends Component('arianna-counter', HTMLElement, {
    ':host': { display: 'inline-flex', gap: '8px', padding: '8px' },
}, { attrs: ['start'] })
{
    template = `
        <button @click="this.dec">-</button>
        <span>{{ this.count() }}</span>
        <button @click="this.inc">+</button>
    `;

    count = signal(0);
    inc   = () => this.count.set(this.count() + 1);
    dec   = () => this.count.set(this.count() - 1);

    build(opts)
    {
        // Read initial value from attribute, fall back to opts
        const startAttr = this.attrSignal('start').get();
        const startNum  = startAttr ? parseInt(startAttr, 10) : (opts?.start ?? 0);
        this.count.set(startNum);
    }

    onMount()   { console.log('counter mounted'); }
    onUnmount() { console.log('counter removed'); }
}
```

`opts` is `undefined` when the element is created via HTML or `document.createElement(...)`. It is the object literal you pass when using `new Counter({...})` or `new Component('arianna-counter', {...})`.

---

## §25. The other five hooks — semantics, future activation

The interface declares `onCreated`, `onBeforeMount`, `onBeforeUpdate`, `onUpdate`, `onBeforeUnmount` but the current runtime does **not** invoke them in every path. This is a known gap — the hooks are reserved in the API surface but their full wiring is pending.

**Current safe pattern**: use only `build`, `onMount`, `onUnmount`. Treat the others as future-reserved.

**If a user adds them**, they will not throw — they simply may not fire. Plan migrations accordingly.

When fully wired, the intended semantics are:

| Hook | When | Use case |
|------|------|----------|
| `onCreated()` | After ctor + facilities, **before** `build()` | Set up data not derived from attrs |
| `onBeforeMount()` | After `build()`, **before** DOM insertion | Capture slot content references |
| `onBeforeUpdate(prev, next)` | Before a reactive re-render writes the DOM | Snapshot scroll position, focus |
| `onUpdate(prev, next)` | After the reactive re-render | Restore scroll, refocus |
| `onBeforeUnmount()` | Just before `disconnectedCallback` | Animate-out, save state |

---

## §26. The attr → signal → DOM chain

When a `def.attrs` declares an attribute (e.g. `['variant']`), three things are set up:

```
                    user mutation                template binding
    setAttribute  ────────────────►  Signal  ◄────────────────  {{ this.variant() }}
                                       │
                                       │ effect re-runs
                                       ▼
                                  DOM updated
```

Three paths to mutate, all converge on the same Signal, all trigger the same downstream effects:

```ts
// Path 1: HTML attribute → JS
myBtn.setAttribute('variant', 'primary');
//   → browser fires attributeChangedCallback
//   → AriannA writes attrSignals['variant'].set('primary')
//   → effects re-run, template re-renders

// Path 2: JS property → JS (if you defined a setter that wraps setAttribute)
myBtn.variant = 'primary';

// Path 3: Direct signal write
myBtn.attrSignal('variant').set('primary');
//   → still keeps the HTML attribute in sync (signal listener writes attr)
```

This is why **declaring an attr in `def.attrs` is enough** — you don't need to write `attributeChangedCallback` or `observedAttributes`. The framework wires both directions.

---

## §27. Cleanup guarantees and symmetry rule

Inside `build()`, every `effect(...)` you register is auto-disposed when the component unmounts. Same for sinks (`Real.text(getter)`, `r.cls`, `r.attr`, `r.style`). You do NOT need to manually dispose them.

You ARE responsible for cleanup of:

- `window.setInterval` / `setTimeout` → `clearInterval` / `clearTimeout`
- `window.addEventListener` → `window.removeEventListener`
- `IntersectionObserver` / `MutationObserver` / `ResizeObserver` → `.disconnect()`
- `fetch` AbortControllers → `.abort()`
- WebSocket / SSE → `.close()` / `.removeEventListener`
- Third-party library subscriptions → their own dispose

Pattern:

```ts
class Watcher extends Component('arianna-watcher', HTMLElement, css)
{
    template = `<slot></slot>`;
    #io?: IntersectionObserver;

    onMount()
    {
        this.#io = new IntersectionObserver((entries) => {
            for (const e of entries) console.log(e.isIntersecting);
        });
        this.#io.observe(this);
    }

    onUnmount()
    {
        this.#io?.disconnect();
        this.#io = undefined;
    }
}
```

---

## §28. Class-definition vs instance order

Two distinct phases, separated by a clean boundary.

```
─────────────────────────────────────────────────────────────────
PHASE A — class definition (runs once when the file loads)
─────────────────────────────────────────────────────────────────
  1. Component(tag, Base, css, def) factory invoked
  2. Descriptor registered (Class: null at this point)
  3. css argument → Stylesheet → descriptor.__ariannaSheetDefault
  4. template string property → parsed into <template> element, cached on user class
  5. ES engine: Object.setPrototypeOf(MyClass, Component)
                Object.setPrototypeOf(MyClass.prototype, Component.prototype)
                MyClass.prototype.build = function(opts) { … }

─────────────────────────────────────────────────────────────────
PHASE B — instance lifecycle (runs N times, once per element)
─────────────────────────────────────────────────────────────────
  6. new MyClass(opts) or <my-tag> in HTML
  7. Component.constructor runs (chains super() up to HTMLElement)
  8. descriptor.Class captured (first time only, via new.target)
  9. AriannA facilities installed
     (attrSignals, _children, shadowRoot, Sheet.Current clone)
 10. (onCreated — pending full wiring)
 11. build(opts) ✅
 12. Template mounted into shadowRoot
 13. (onBeforeMount — pending full wiring)
 14. connectedCallback (browser)
 15. onMount() ✅
 16. ... runtime ...
 17. (onBeforeUnmount — pending full wiring)
 18. disconnectedCallback (browser)
 19. internal cleanup (effects, unmountFns)
 20. onUnmount() ✅
```

Steps 1–5 happen once per file load. Steps 6–20 happen once per element instance.

---

# Part IV — Instantiation & Integration

## §29. The six instantiation forms

```html
<!-- (a) HTML markup -->
<arianna-button variant="primary">Click me</arianna-button>
```

```ts
// (b) Real wrapper
new Real('arianna-button').set('variant', 'primary').text(() => 'Click me').append('#app');

// (c) Virtual wrapper
new Virtual('arianna-button').set('variant', 'primary').text(() => 'Click me').append('#app');

// (d) Component constructor (wrapper)
new Component('arianna-button', { variant: 'primary', label: 'Click me' });

// (e) Direct class instantiation
new Button({ variant: 'primary', label: 'Click me' });

// (f) Vanilla DOM API
document.createElement('arianna-button');
```

**The "default imperative" invariant** (§35): all six produce identical DOM, identical prototype chain, identical lifecycle. No "this only works in markup" or "this only works via `new`" deviations are tolerated.

---

## §30. JSX runtime

### §30.1 `tsconfig.json`

```json
{
  "compilerOptions": {
    "jsx"             : "react-jsx",
    "jsxImportSource" : "arianna"
  }
}
```

### §30.2 Dual runtime — Real (default) vs Virtual

- Default: **Real** (eager). `<Button />` produces a live DOM Element immediately.
- Pragma: `// @dom-render: virtual` at the top of a file switches that file to **Virtual** (lazy).

```tsx
// @dom-render: virtual
const tree = <div><Button>Save</Button></div>;
tree.append('#app');     // materialises now
```

### §30.3 Event syntax — `onEvent` and `$event` (both equivalent)

```tsx
<button onClick={e => save(e)}>Save</button>
{/* equivalent to */}
<button @click="this.save">Save</button>
```

### §30.4 Fragment

```tsx
<>
  <h1>Title</h1>
  <p>Body</p>
</>
```

### §30.5 PascalCase ↔ kebab-case auto-resolution

```tsx
<Button />          // resolves to <arianna-button>
<DataTable />       // resolves to <arianna-data-table>
<arianna-button />  // explicit form, also works
```

### §30.6 Defining components in JSX

```tsx
const Hello = Component('arianna-hello', HTMLElement, css, { attrs: ['name'] }, {
    render: (self) => <span>Hello, {self.name}!</span>,
});
```

### §30.7 `h()` factory — direct use without JSX transform

```ts
import { h } from 'arianna';
const tree = h('div', { id: 'app' }, h('h1', null, 'Hello'));
```

---

## §31. Accessibility baseline

Every component MUST provide:

- ARIA role where appropriate (`role="button"`, `role="dialog"`, etc.)
- Keyboard interaction matching the role (Enter/Space for buttons, Esc for dialogs)
- Focus management (tabindex, focus trap for modals)
- `aria-label` or `aria-labelledby` for non-text triggers
- `aria-disabled` reflection when `disabled` is set
- High-contrast mode tested (no info conveyed by colour alone)

---

## §32. Testing convention

Every component MUST have a test file `components/<name>/<Name>.test.ts`. Recommended layout:

```ts
import { test, expect } from 'arianna/test';
import { Counter } from './Counter.ts';

test('Counter renders initial value', async () => {
    const c = new Counter();
    c.setAttribute('initial', '5');
    document.body.appendChild(c);

    expect(c.textContent).toBe('5');
});

test('Counter increments on click', async () => {
    const c = new Counter();
    document.body.appendChild(c);

    c.Shadow.Root.querySelector('button')!.click();
    expect(c.textContent).toBe('1');
});
```

Aim for ≥3 tests per component covering: rendering, interaction, attribute reactivity.

---

## §33. Build / bundle convention

- Each component lives in `components/<Name>/<Name>.ts`
- Bundles output to `release/dist/arianna-components.js`
- The component MUST be a named export from its `.ts` file
- The component MUST also expose itself on `window` (or `globalThis`) via `Object.defineProperty(window, '<Name>', { value: <Name>, … })` at module load — required for `Component.Boot()` to find it
- The unified bundle's IIFE calls `Component.Boot()` automatically after all components are loaded

---

## §34. Per-component documentation

Each component MUST include in its source file:

- JSDoc block on the class summarising purpose, attrs, slots, events
- Example usage in markup
- Example usage via JSX
- Example usage via `new Component('...', opts)`

```ts
/**
 * <arianna-card> — A styled container with optional title and body slot.
 *
 * Attrs:
 *   title    — string, shown as <h2> header
 *   variant  — 'default' | 'primary' | 'danger'
 *
 * Slots:
 *   (default) — body content
 *   header    — overrides the title attribute
 *   footer    — bottom action area
 *
 * Events:
 *   click     — bubbles from the body
 *
 * Example (markup):
 *   <arianna-card title="Hello" variant="primary">
 *     <p>Body content</p>
 *     <button slot="footer">OK</button>
 *   </arianna-card>
 *
 * Example (JSX):
 *   <Card title="Hello" variant="primary">
 *     <p>Body content</p>
 *   </Card>
 *
 * Example (programmatic):
 *   const c = new Component('arianna-card', { title: 'Hello' });
 *   c.Real.append('#app');
 */
```

---

# Part V — Governance

## §35. The "default imperative" invariant

A core invariant of AriannA:

> **Every component must look and behave identically regardless of which of the six instantiation forms was used.** No instantiation-specific setup, no "this only works in markup" or "this only works via `new`". The `Sheet.Default` is applied automatically; the template renders; attributes flow through to signals; events bubble correctly.

If you find a case where this is violated, file a bug — it is NOT an allowed deviation.

---

## §36. Anti-rot rules

These rules exist to prevent the slow degradation that affects every long-lived framework:

1. **One Component class for the whole framework.** Not one per tag, not one per definition. The descriptor parameterises behaviour; the class is shared.

2. **One descriptor per tag.** No parallel registries, no per-instance descriptors, no shadow descriptors.

3. **The descriptor is fat by design.** Every parameter the upgrade pipeline needs goes in the descriptor at `Define`-time. No runtime discovery, no lookup heuristics, no stack introspection.

4. **`Update` reads, never invents.** Reads the descriptor. Acts on the node. Done. If `Update` is doing detective work, the bug is in `Define`-time registration, not in `Update`.

5. **No wrappers between user subclass and Component.** No `Bound`, no `_factory`, no `Shim`. The chain is `Button → Component → HTML(X)Element → HTMLElement → ...`. If you find an extra link, remove it.

6. **Component is callable via dispatcher; the dispatcher is exhaustive.** Every API mode (factory, decorator, element-wrap, selector retrieval, object-form, constructor) is dispatched from the single `Component(...)` symbol. No parallel APIs.

7. **Boot is explicit.** `Component.Boot()` is the user-visible call that populates `descriptor.Class` for markup-only paths. No timer-based "eventually populate" hacks, no `MutationObserver` introspection of the source code.

---

## §37. Allowed deviations

### §37.1 Pure renderers (Finance Sparkline-style)

Components that are purely visual with no internal state can omit `attrs` and place all logic inside `build()` reading from passed `opts`. They still use the canonical chain.

### §37.2 Modifiers (Modifier2D / Modifier3D)

Modifier components are non-rendering; they expose a `modify(target)` method instead of `build()`. The chain remains canonical; only `_installFacilities` skips template mounting.

### §37.3 Sub-base classes

A component may extend another component (`class PrimaryButton extends Button`). The chain becomes:

```
PrimaryButton → Button → Component → HTML(X)Element → HTMLElement → …
```

Both classes pass through Component once. Sheets compose (PrimaryButton.Sheet.Default = Button.Sheet.Default + own).

```ts
class FormControlBase extends Component('arianna-form-control', HTMLElement, baseCss, baseDef)
{
    /* shared behaviour */
}

class TextField extends FormControlBase
{
    @Prop() placeholder = '';
    /* TextField-specific */
}

class Select extends FormControlBase
{
    @Prop() options = [];
    /* Select-specific */
}
```

Concrete subclasses inherit the v2 shape automatically.

---

## §38. Migration playbook (pre-v2 → canonical)

A migration script `tools/migrate-component.ts` will be provided to:

1. Convert `extends Control<X>` to `extends Component('arianna-X', HTMLElement, css, def)`
2. Move `static observedAttributes` → `def.attrs`
3. Convert `attachShadow({ mode })` calls → `def.shadow`
4. Move `connectedCallback()` body → `onMount()` body (with safety checks)
5. Move setup logic that was in the class constructor → `build()` body
6. Replace `Component.Define(...)` (v1) → `Core.Define(...)` (v2) or canonical Case 4
7. Add `Object.defineProperty(window, 'X', { value: X })` at module end if missing

Run with:

```bash
npx arianna-migrate components/ButtonOld
# → reviews diff, prompts for confirmation
```

After migration, the prototype chain becomes canonical (§1), `Component.Boot()` finds the subclass, and all six instantiation forms work identically.

---

## §39. Quick-reference cheat sheet

```ts
// ── CASE 1 ─ function + Core.Define ──────────────────────────────
function A() { /* ... */ }
Core.Define('tag', A, HTMLElement, css?, def?);

// ── CASE 2 ─ class (no extends) + Core.Define ────────────────────
class A { /* ... */ }
Core.Define('tag', A, HTMLElement, css?, def?);

// ── CASE 3 ─ class extends X + Core.Define ───────────────────────
class A extends HTMLElement { /* ... */ }
Core.Define('tag', A, css?, def?);

// ── CASE 4 ─ class extends Component(...) ────────────────────────
class A extends Component('tag', HTMLElement, css?, def?) {
    build() { /* ... */ }
}

// ── CASE 5 ─ @Component decorator ────────────────────────────────
@Component('tag', css?, def?)                   // positional
class A extends HTMLElement { /* ... */ }

@Component({ tag: 'tag', style: css, ... })     // object-style
class A extends HTMLElement { /* ... */ }

// ── INSTANTIATION ────────────────────────────────────────────────
<my-tag attr="val">...</my-tag>                 // (a) markup
new Real('my-tag').set('attr', 'val').append('#app');     // (b)
new Virtual('my-tag').set('attr', 'val').append('#app');  // (c)
new Component('my-tag', { attr: 'val' });       // (d) wrapper
new MyClass();                                  // (e) direct
document.createElement('my-tag');               // (f) vanilla

// ── BOOT ─────────────────────────────────────────────────────────
Component.Boot();   // populates descriptor.Class for markup-only paths

// ── DECORATORS ───────────────────────────────────────────────────
@Component       // class      — define a custom element
@Prop            // field      — reactive property + attribute
@State           // field      — internal reactive state
@Watch('key')    // method     — observer
@Event           // method     — emit custom event
@Bind            // method     — auto-bind this
@Sheet           // class      — augment Sheet.Default

// ── LIFECYCLE HOOKS ──────────────────────────────────────────────
onCreated         — after facilities, before build         [reserved]
build(opts)       — main setup; assigns this.template     ✅
onBeforeMount     — after build, before DOM insertion     [reserved]
onMount           — DOM is live                            ✅
onAttributeChanged(name, old, new)                         [reserved]
onBeforeUpdate    — before reactive DOM write              [reserved]
onUpdate          — after reactive DOM write               [reserved]
onBeforeUnmount   — before disconnect                      [reserved]
onUnmount         — after internal cleanup                 ✅
onAdopted         — moved to another document              [reserved]

// ── PROTOTYPE CHAIN (every instance) ─────────────────────────────
instance → Subclass.prototype → Component.prototype
        → [HTML(X)Element.prototype] → HTMLElement.prototype
        → Element.prototype → Node.prototype
        → EventTarget.prototype → Object.prototype
```

---

## §40. END

This is the canonical specification for AriannA Components. Future amendments will:

- Be added at the end of the relevant section
- Be tagged with the date of change
- Be summarised in `CHANGELOG.md`

When generating component code, AI assistants should reference this file as the source of truth. Conflicts between this file and other documentation should be resolved in favour of this file.

Document version: v2.1 — unified from `COMPONENT_CONVENTIONS.md` + `LIFECYCLE.md` + `COMPONENT_MECHANICS.md`
Last updated: 2026-05-27
