# AriannA Coding Conventions

**Status**: Canonical convention for AriannA TypeScript source (`Core.ts`, `Namespace.ts`, and every module built on them). Derived from the kernel cleanup of Core/Namespace and meant to keep every module *self-contained, sealed by default, and free of module-scope clutter*.

These rules are about **module shape and surface**, not formatting (see `INDENT_CONVENTIONS.md`) or CSS (see `STYLE_CONVENTIONS.md`).

---

## 1. Comments — disposable notes vs. real documentation

Two comment kinds, two syntaxes, never mixed:

- **`//` line comments** are *working notes*: TODOs, questions, reminders, "why is this here?". They are disposable and are **deleted during cleanup**. If a note must survive, it is not a note — promote it.
- **`/** … */` JSDoc** is *real documentation* and is **kept**. Every exported symbol, every class member that isn't trivially self-evident, and every public API entry gets a JSDoc block — *even when it is a single line*.

```ts
/** True once Bootstrap() has run. */          // documentation — kept
get Booted() { return Boot.booted; }

// TODO: parsing belongs in Rule/Stylesheet?    // note — deleted on cleanup
```

Rule of thumb: if you would be annoyed to find it still there in six months, write it as `//`. If a reader needs it to use the symbol, write it as `/** */`.

---

## 2. No free-floating functions or consts in a module

A module must not leave helper `function`s or `const`s scattered at top level. Every behavior belongs to a **self-contained unit**. In order of preference:

1. **Inline it** at the single call site — see §3.
2. If it is reused, make it a **`private static` method** (or `private static readonly` field) of the class that owns the behavior.
3. If it is purely a grouping of related functions/types with no single owning class, put it in a **TS `namespace`** (optionally merged with a class of the same name).

**Why.** Free module functions pollute the module scope, are hard to discover, leak as implicit internal API, and blur ownership. A `private static` member is encapsulated, discoverable on the owner, and impossible to call from outside.

```ts
// ✗ scattered at module level
function _stubDescriptor(name, tags) { … }
const _FRAGILE_PROXY_SPEC = { … };

// ✓ owned, encapsulated, self-contained
export class Namespace {
    private static readonly _FRAGILE_PROXY_SPEC: Record<string, FragileSpec> = { … };
    private static _stubDescriptor(name: string, tags: string[]): TypeDescriptor { … }
}
```

The same pattern produced `Property._matchesType`, `Events._resolveTargets`, `Events._splitTypes`, and the entire `Namespace` helper set (`_installFragileProxy`, `_attachAriannaShadow`, `applyRulesToStyle`, …) — all `private static`, all inside their owner.

---

## 3. Inline where possible

If a helper is used **exactly once** and is small, **inline it**. Do not invent a named function for a one-liner that has a single caller.

Keep a named form only when at least one is true:
- it is **reused** in more than one place,
- it is **recursive**,
- inlining it would genuinely hurt readability (a long, named, well-documented step).

```ts
// ✗ one caller, trivial — needless indirection
function _toKey(s: string) { return s.toLowerCase(); }
const key = _toKey(tag);

// ✓ inline
const key = tag.toLowerCase();
```

Inline first, then "promote to `private static` if it turns out to be reused" — not the other way around.

---

## 4. Group types with their class

Option / detail / configuration types live **under the class name**, via declaration merging — never as loose sibling interfaces.

```ts
export namespace Property {
    export interface Options { … }
    export interface ChangedDetail { … }
    export class Property<T> { … }          // references Options, ChangedDetail unqualified
}
```

Inside the merged class, sibling types are referenced **unqualified** (`Options`, not `Property.Options`), because the class name shadows the namespace within its own body.

If a "type" is a one-line alias of a platform type, **don't even nest it — use the platform type directly** (we replaced `Observer.Configuration extends MutationObserverInit {}` with plain `MutationObserverInit`). This is §3 applied to types.

---

## 5. Private state, read-only public surface

- **Backing state is module-private**: lowercase, **not exported** (`namespaces`, `observers`).
- It is reachable **only** through the frozen `Core` object, as **readonly PascalCase getters**: `Core.Namespaces`, `Core.Observers`, `Core.Observer`, `Core.Initialized`, `Core.Booted`.
- The public surface is **getters (read-only properties)**, never raw mutable fields.

```ts
const observers = new Set<Observer>();           // module-private, lowercase
// …
const Core = Object.freeze({
    get Observer()  { return [...observers][0] ?? null; },  // readonly, PascalCase
    Observers: observers,                                    // the registry, exposed read-only by convention
    get Initialized() { return Boot.initialized; },
});
```

This is the same intent as `Core.Property`: state is owned and sealed; consumers read, they do not poke fields.

### 5.1 Mutable state must be hard-private — never a loose `let`

A read-only getter protects the **consumer**, but it does **not** protect the **source**. Two module-level `let`s like

```ts
// ✗ "scattered" mutable state — abusable from anywhere in the file
let _initialized = false;
let _booted      = false;
```

are writable from *any* line of the module. They are the classic footgun: a future, well-meaning edit elsewhere in the file can flip `_initialized = false` and silently break the boot invariant. Module-privacy is **not** encapsulation — *everything in the module can still touch them.*

**Best practice (the one we adopted):** move mutable state into **`#`-private `static` fields** owned by the class whose methods are its **only** mutators. `#` privacy is *runtime-enforced hard privacy* — the symbol does not exist outside the class, so there is literally nothing to mis-assign elsewhere. Expose it read-only through a Core getter.

```ts
// ✓ hard-private; the ONLY mutators are Initialize() / Bootstrap()
class Boot {
    static #initialized = false;
    static #booted      = false;
    static get initialized() { return Boot.#initialized; }
    static get booted()      { return Boot.#booted; }
    static Initialize(root = document) { if (… || Boot.#initialized) return; Boot.#initialized = true; … }
    static Bootstrap()                 { …; if (!Boot.#booted) { Boot.#booted = true; … } }
}
export function Initialize(root?) { Boot.Initialize(root); }   // thin wrapper, public name unchanged
// Core: get Initialized() { return Boot.initialized; }
```

Why this beats a getter-over-`let`: the getter version still leaves the loose `let` sitting in module scope for anyone to write — it seals the *consumer* but not the *source*. The `#`-private version removes the writable symbol entirely, so the source itself cannot be abused. Prefer it for **every** piece of mutable state with a small, well-defined set of mutators.

Decision rule:
- **Immutable / write-once-at-init data** → `private static readonly` (or a frozen const).
- **Mutable state with controlled mutators** → `#`-private `static`, mutated only by its owner's methods, exposed read-only.
- **Loose module-level `let`** → avoid. Acceptable only for a genuinely file-local, short-lived value with no external meaning — and even then, prefer not to.

---

## 6. Self-registration in the constructor

An entity managed by a registry **registers itself in its own constructor**. Creating the object *is* registering it — there is no separate `Register()` / `Index()` ceremony, and no external registration call.

```ts
export class Observer {
    constructor(…) { … ; observers.add(this); }     // first instance becomes the global
}

export class Namespace {
    constructor(name, opts) { … ; Core.Namespaces[this.Name] = this.toDescriptor(); this.Initialize(); }
}
```

This removed `Core.RegisterNamespace`, `Core.IndexCustom`, and the standalone `RegisterNamespace()` function: `new Namespace('html', …)` is the registration.

---

## 7. Truly-global properties: `defineProperty` / `Core.Property` + strict scope

A property is "global" only if it must be reachable across the whole runtime (e.g. `window.Core`, `window.Observer`). When it genuinely is:

- Install it with **`Object.defineProperty`** (never a bare assignment), using a **strict descriptor scope** — sealed and read-only by default: `configurable: false, writable: false`, `enumerable` only when discovery is wanted. Use the shared templates in **`Core.Scopes`** (`Private`, `Readonly`, `Writable`, `Configurable`).
- For properties on **objects/elements that participate in reactivity or binding**, use **`Core.Property`** (the descriptor class) instead of a hand-rolled field — it carries validation, transform, events, and bind/bound sync.
- Always guard the install: SSR-safe (`typeof window !== 'undefined'`) and idempotent (`hasOwnProperty` check, or a `static {}` block that runs once).

```ts
// sealed global — the default
if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Core'))
    Object.defineProperty(window, 'Core',
        { enumerable: true, configurable: false, writable: false, value: Core });
```

**Exception — writable globals.** Only when a property *must* be reassignable at runtime do you use a writable scope (`Core.Scopes.Writable` / `Configurable`). This is the deliberate exception, not the default; everything that can be sealed is sealed. (A writable runtime *flag* is better modelled as §5.1 hard-private state with controlled mutators than as a writable global.)

The class self-installs its own global in a `static {}` block, not as a loose module-level `if` (the entity owns its own registration, §6):

```ts
export class Observer {
    static {
        if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Observer'))
            Object.defineProperty(window, 'Observer',
                { enumerable: true, configurable: false, writable: false, value: Observer });
    }
}
```

---

## 8. One registry, no duplicate index layers — but keep authoritative tables

There is a single source of truth per concept, scanned directly. Do not maintain parallel fast-lookup tables that mirror it and must be kept in sync. We deleted `_tagIndex` / `_nameIndex` / `_ctorIndex` and let `GetDescriptor` scan the `namespaces` registry. Add a cache only if profiling proves it necessary — and then it is `private static`, owned, and invalidated in one place.

**Authoritative data tables are the exception, and are encouraged.** A static table that *encodes correctness* (not a duplicated cache) belongs with its owner as `static readonly`, frozen. Example: `Events.Types`, the W3C-Level-3 keyword → interface preflight map ported from the legacy engine — it validates event keywords (catches typos in On/Off) and lets `Fire` build the correct Event subtype. Store interface references as **strings** resolved at runtime, so a missing or non-constructable platform type (e.g. the deprecated `MutationEvent`) can never break the build or the runtime — it just falls back to `CustomEvent`.

---

## 9. Frozen singleton, owned mutable state

The `Core` API object is `Object.freeze`d. Anything that must change at runtime (registries, the global observer, boot flags) lives in **module scope or hard-private owners** (§5.1), *not* as a property of the frozen object — so freezing the surface never blocks `Initialize()` / `Bootstrap()` from mutating state. Read-only getters on `Core` bridge the sealed surface to the live state (§5).

---

## 10. Naming

| Kind | Convention | Example |
|---|---|---|
| Module-private state | lowercase / `_camel` | `namespaces`, `observers` |
| Hard-private mutable state | `#camel` static | `Boot.#initialized` |
| Public API & getters | PascalCase | `Core.Namespaces`, `Core.Observer` |
| Private static helpers | `_camelCase` | `_installFragileProxy`, `_matchesType` |
| Types | PascalCase, nested under owner | `Property.Options`, `Events.TypeSpec` |
| Custom element tags | kebab-case | `arianna-color-picker` |

---

## Checklist before committing a module

1. No `//` working notes left behind; every kept comment that documents is `/** */`.
2. No free `function` / `const` at module top level — inlined (§3) or `private static` / in a `namespace` (§2).
3. Types nested under their class; trivial aliases dropped for the platform type.
4. Backing state lowercase + module-private; public access is read-only getters.
5. **No loose mutable `let` at module scope** — mutable state is `#`-private `static` with controlled mutators (§5.1).
6. Registry-managed entities self-register in their constructor; no separate Register/Index step.
7. Globals installed via `defineProperty` with a sealed `Core.Scopes` descriptor (writable only as a deliberate exception); reactive/bindable props via `Core.Property`.
8. Authoritative correctness tables are `static readonly`, frozen, with string interface refs (§8).
9. `tsc --noEmit` under the project `tsconfig` (`strict`) reports **zero errors**.
