# AriannA — Layered Architecture (CANONICAL)

> **This file is the single source of truth.** When any other document
> (`REAL_VIRTUAL.md`, `COMPONENT_CONVENTIONS.md`, `EXAMPLES.md`, `TESTING.md`)
> appears to disagree with this one, **this file wins**. If you are an AI
> assistant or a contributor re-reading the AriannA docs: read THIS file first
> and treat everything below as binding invariants, not suggestions.

---

## 0. The one-paragraph model

AriannA has **four strictly separated layers**. A bare DOM element is produced
by **`Core.Create`** (Layer 0). A **`Real`** or **`Virtual`** *wraps* that element
and adds only the fluent API (Layer 1) — `Real` is eager (Lit-like, live DOM),
`Virtual` is lazy (React/Vue-like, renders at the end). A **`Components`** is a
*super-layer object that sits ABOVE a `Real` and a `Virtual`, owns all the
reactive/lifecycle/observer logic, and keeps the two DOM facets in sync —
without ever becoming a DOM node itself and without leaking the underlying
element* (Layer 2). **Directives** operate on the base (`Real`/`Virtual`)
independently of the Components layer (Layer 3).

The mantra:

```
Core.Create   →  an Element            (DOM only)
Real / Virtual →  Element + fluent API  (DOM + ergonomics)
Components      →  Real + Virtual + reactivity, kept in sync, node NOT exposed
```

---

## 1. The four layers

### Layer 0 — `Core.Create(tag)` : the bare element

* **Input:** a tag name (compliant `div`, or non-compliant / custom
  `arianna-card`, `case-4b`, …).
* **Output:** a single **live `Element`**, already *upgraded* — its prototype
  chain is spliced synchronously through the namespace registry, so a
  registered custom tag comes back built, not as a bare un-upgraded node.
* **Adds:** nothing else. **No fluent API. No signals. No lifecycle. No
  `.Real` / `.Virtual`.** It is just an element.
* **Where AriannA logic lives here:** non-compliant tag handling, `is=`
  coercion, prototype splice — i.e. everything needed to make the element
  behave like a native custom element regardless of the tag.

```ts
const el = Core.Create('arianna-card');   // → HTMLElement (upgraded), nothing more
el.append // ← native node API only; NO .text(), NO .set(), NO Components
```

### Layer 1 — `Real` / `Virtual` : the element wrapped in the fluent API

* **Input:** the SAME things `Core.Create` accepts, plus an existing
  `Element` / `Real` / `Virtual` / `{Tag,…}` def, plus **optional style in any
  form** (`Rule` / `Stylesheet` / flat object / nested).
* **Internally:** for a tag string they obtain the element from **`Core.Create`**
  (Layer 0) and wrap it. `Real` materialises immediately; `Virtual` defers
  element creation to `render()` — but it must route through `Core.Create`
  too (see §6, FIX-9).
* **Adds:** the fluent API ONLY — `set/get/sub`, `add/append/push/unshift/
  remove`, `on/off/fire`, `text/attr/cls/prop/style`, `signal/effect/computed`,
  `Sheet`, `show/hide`, …
* **Behaviour contract:**
  * **`Real` behaves like a Lit component** — eager, every call mutates a live
    Element now.
  * **`Virtual` behaves like React/Vue** — lazy, nothing touches the DOM until
    `.render()` / `.append()` / `.mount()`.
* **What `.render()` returns:** an `Element` whose prototype chain contains
  **NO Components class** — only `[UserSubclass?, HTMLXxxElement, HTMLElement,
  Element, Node, EventTarget, Object]`.

```ts
new Real('arianna-card').set('title','Hi').append('#app');   // eager, live now
const v = new Virtual('arianna-card').set('title','Hi');      // nothing yet
v.append('#app');                                             // materialises now
```

> A `Real` / `Virtual` is therefore `Core.Create` element **+ fluent API**.
> Nothing about reactivity-as-component, lifecycle hooks, or two-facet sync
> belongs here.

### Layer 2 — `Components` : the super-layer that dresses Real + Virtual

A `Components` is **not** a DOM node and **not** a subclass-that-is-an-element.
It is an **orchestrator object** that:

1. **owns** a `Real` facet and a `Virtual` facet over the *same logical element*;
2. **adds all the logic** — signals, reactivity, observers, lifecycle hooks,
   attribute↔signal↔DOM bridge, bus, scoped Sheet inheritance;
3. **keeps the two facets in sync** when component state changes, *without*
   altering how each facet behaves on its own (non-intrusive composition);
4. **never exposes the underlying HTML node directly.** You reach the DOM only
   through the facets:

```ts
const c = new Components(document.createElement('div'));
//  c is a Components. c is NOT a node. You cannot append c.
c.Real.append(parent);              // ← now a <div> is in the DOM (eager)
c.Virtual.render().append(parent);  // ← or via the lazy facet
```

* **`component.Real`** → the `Real` facet → its `.render()` is a live
  `HTMLElement` with a chain that **does not** include `Components`
  (classes, `HTMLXxxElement`/`HTMLElement` super, the usual optionals).
* **`component.Virtual`** → the `Virtual` facet → updates in place and only
  materialises at the end (it does not render until committed).

**Composition is INDEPENDENT.** A Components sits on top; the Real and the
Virtual retain their own identity and behaviour. The Components coordinates
them — it does not absorb them.

### Layer 3 — Directives : operate on the base, independently

When you manipulate an AriannA element with directives (`a-if`, `a-for`,
`a-model`, `@click`, `:attr`, `Directive.bootstrap`, …), those bindings fire
**at the base** — i.e. on the `Real`/`Virtual` element — **not** through the
Components layer, and they are **independent** of it. A directive bound to the
element keeps working whether or not a Components is dressing it, and a Components
re-sync does not clobber directive state.

---

## 2. Master table — who is what

| Aspect | `Core.Create(tag)` | `new Real(x)` | `new Virtual(x)` | `Components` (Layer 2) |
|---|---|---|---|---|
| **Layer** | 0 | 1 | 1 | 2 |
| **Returns** | `Element` | `Real` | `VirtualNode` | `Components` instance |
| **Is a DOM node?** | ✅ yes | ❌ no (wraps one) | ❌ no (describes one) | ❌ **no** |
| **Directly appendable?** | ✅ (it's a node) | via `.append()` | via `.append()`/`.render()` | ❌ **never** — use `.Real`/`.Virtual` |
| **Fluent API?** | ❌ none | ✅ full | ✅ full | ✅ delegated through `.Real`/`.Virtual` |
| **Reactivity / lifecycle / observers / bus?** | ❌ | ❌ | ❌ | ✅ **owns it** |
| **Eager vs lazy** | eager | **eager (Lit-like)** | **lazy (React/Vue-like)** | both facets, kept in sync |
| **Element source** | itself | `Core.Create` | `Core.Create` (at `render()`) | via its two facets |
| **Prototype chain of the produced element** | `[Sub?, HTMLXxx, HTMLElement, …]` | same | same | **same — never contains `Components`** |
| **`.render()` → element chain has `Components`?** | n/a | ❌ no | ❌ no | ❌ no (facets produce plain elements) |

---

## 3. Entry points → what you get back (the rule that removes all ambiguity)

There are two families of entry points and **they return different things on
purpose**:

### Family A — you get a **Components** (super-layer object, NOT a node)

| Form | Result | How to reach the DOM |
|---|---|---|
| `@Components(spec) class X extends Base {}` | `X` is a **Components** class; `new X()` → Components instance | `inst.Real` / `inst.Virtual` |
| `class X extends Components(tag, Base, …) {}` | same — base class is `Components` | `inst.Real` / `inst.Virtual` |
| `new Components(tag, opts?)` | Components instance | `inst.Real` / `inst.Virtual` |
| `new Components(existingElement)` | Components instance dressing that element | `inst.Real` / `inst.Virtual` |
| `new X(props)` where `X` is a Components class | Components instance | `inst.Real` / `inst.Virtual` |

> A Components instance **cannot** be passed to `appendChild` / `.append()`
> directly. `inst.Real.append(parent)` or `inst.Virtual.render().append(parent)`
> is the only way it reaches the DOM.

### Family B — you get a **live Element** (a node), dressed by a Components

| Form | Result | Notes |
|---|---|---|
| `document.createElement('arianna-x')` | **a live `Element`** — i.e. a `Real`'s underlying node, *dressed* by a Components behind it | It IS a node ⇒ appendable. Directives hit the base. The Components dressing is reachable from the node (back-reference), but the **return value is the node, not the Components**. |
| `<arianna-x>` in markup | same (upgraded on parse) | same |

This is the precise meaning of *"`document.createElement('my-custom-tag')`
creates a new `Real`, dressed with a new `Components`"*: markup / `createElement`
go through the browser's element machinery, so they yield the **element**
(Layer 1 base). The Components rides on top of it; you did not ask for the
Components object, so you don't get it as the return value — you get the node.

---

## 4. Prototype-chain rules (re-extension)

* The element produced by any path has a chain of the form
  `[UserSubclass?, HTMLXxxElement, HTMLElement, Element, Node, EventTarget,
  Object]`. **`Components` never appears in it.**
* **When you extend an already-extended Components**, the **`Real` base chain
  must be RE-SPLICED** so the new subclass prototype is actually in the live
  element's chain (`[NewSub, OldSub, HTMLXxx, …]`). The eager facet renders
  *now*, so its chain must be correct *now*.
* **`Virtual` only needs to UPDATE its descriptor** on re-extension — it does
  **not** re-render, because it materialises only at the end. The correct chain
  is produced when `render()` finally runs (through `Core.Create`).

---

## 5. Synchronisation contract (how the two facets stay in sync)

The Components is the **only** thing that talks to both facets. The rules:

1. Components state lives in **signals/observables owned by the Components**.
2. A state change drives **both** facets through their own fluent API
   (`Real` mutates live; `Virtual` updates its pending descriptor / re-renders
   on next commit). The Components does the fan-out; the facets do not know
   about each other.
3. Lifecycle hooks (`onCreated/onMount/onUpdate/onUnmount`, …) are fired by the
   **Components**, not by the element.
4. Directives bound at the base are **left untouched** by sync — non-intrusive.

---

## 6. What the current code does WRONG (the fix list)

Grounded in the present source. Each item is an invariant violation, with the
location and the required correction.

| # | Where | Current (wrong) | Required (correct) |
|---|---|---|---|
| **FIX-1** | `Components.ts` `Components(el)` → `_installFacilities(el)` | Installs `set/get/text/attr/...` **directly onto the element**, so the element *becomes* the component (Layer 2 collapses into Layer 0/1). | `Components(el)` must **return a Components instance** whose `.Real` wraps `el`. The element keeps only the Layer-1 fluent API; reactivity/lifecycle live on the Components, not stamped on the node. |
| **FIX-2** | `Components.ts` factory "clean form" returns `Base` unchanged | `class X extends Components(tag, Base)` ≡ `class X extends Base` → instances **are elements**, no `.Real`/`.Virtual`, no super-layer. | Must return a **Components base class**. `new X()` → Components instance. Register the Real-producing element ctor with `customElements` separately (Family B), so markup/`createElement` still yield a node. |
| **FIX-3** | `Components.ts` `@Components` decorator returns `Target` unchanged | Same collapse as FIX-2 for the decorator path. | Decorator returns a Components-producing class; element ctor registered for the markup/`createElement` upgrade path. |
| **FIX-4** | `Components.ts` `ComponentWrapper` | Thin shell: `new Real(tag)` + `new Virtual(element)`, no lifecycle/reactivity install, sketchy Virtual fallback. | Promote to the **real** Layer-2 object: owns signals/observers/lifecycle, drives both facets, exposes them via `.Real`/`.Virtual`; **not appendable** itself. |
| **FIX-5** | `Real.ts` constructor | Auto-assigns `id` + `class` = `Real-Instance-N` on every `new Real`. Pollutes the element and the chain-name diagnostics. | Make auto-id **opt-in** (debug flag), or scope it so it never leaks into the Components-dressed element's public identity. |
| **FIX-6** | `Virtual.ts` `render()` | Creates the element via `d.Namespace?.functions?.create` / `document.createElement`, **bypassing `Core.Create`**. Diverges from `Real`. | `Virtual.render()` must obtain its element from **`Core.Create`** (Layer 0), so both facets are byte-identical and chains match. |
| **FIX-7** | `Components.ts` line ~1230 | `console.log("--- Components FN ARGUMENTS ---")` + `console.log(base)` left in the factory. | Remove the debug logging. |
| **FIX-8** | `Real.ts` top block | `RealTarget`/`RealDef`/`NodeInput` exported with a "Questo Blocco va rimosso" note. | Move these into a private namespace or `Real`-internal types as the note says; keep `RealTarget` exported only if the public API needs it. |
| **FIX-9** | `EXAMPLES.md` FORM 5 | `new CounterCard()` then `document.body.appendChild(d)` — treats a Components instance as a node. | `const d = new CounterCard(...); d.Real.append('#app')` (or `.Virtual`). See rewritten `EXAMPLES.md`. |

FORM 6 (`document.createElement('arianna-counter-card')` + `appendChild`) is
**correct** and stays — it is Family B (you get the node).

---

## 7. Quick decision guide

* *"I just want a DOM element, upgraded"* → `Core.Create(tag)`.
* *"I want to build live DOM fluently, now"* → `new Real(tag, style?)`.
* *"I want to build a tree and commit later / SSR"* → `new Virtual(tag, style?)`.
* *"I want a stateful, reactive component with lifecycle"* → `Components`
  (decorator / `extends` / `new`). Reach DOM via `.Real` / `.Virtual`.
* *"I wrote `document.createElement('arianna-x')`"* → you have a **node**
  (a Real, dressed by a Components). Append it; directives hit the base.
