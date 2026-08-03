# AriannA — Development Style & Architecture Guide (for any AI)

> Hand this file to any AI assistant before it touches the AriannA codebase.
> It encodes how Riccardo Angeli builds this framework: the philosophy, the
> exact conventions, the verification discipline, and the consolidation
> technique. Follow it literally. When in doubt, imitate `Core.ts` — it is the
> reference for "done right."

---

## 0. The one-sentence summary

Encapsulate: **one concept lives in exactly one place**, with short unique names, delegating to the module that already owns a capability instead of re-implementing it — never a soup of tiny single-purpose module-level functions passing an element to each other.

`Core.ts` is the gold standard (encapsulated, short unique names, well-referenced, well-structured). Files that grew by small increments (early `Component.ts`) are the anti-pattern to refactor toward `Core`.

---

## 1. Architectural philosophy

1. **Encapsulation over accretion.** A class OWNS its concept. Module-level helper functions that each do one thing and share state via a passed `el` are "spaghetti" — collapse them into private methods (`#name`) of the owning class.
2. **Delegation over duplication.** If Core / Shadow / Stylesheet / Rule / Real already implements a behavior, DELEGATE to it. Never keep dozens of lines re-implementing what is a few lines of delegation. Concretely: the fluent DOM API (`set/get/sub/add/fire/style/Sheet`) lives in `Real`; shadow attach/resolve lives in `Shadow`; scoped-sheet CSS rewriting lives in `Real`'s `Sheet` setter; type registration + upgrade lives in `Core.Define`. Other modules install **thin forwarders** to these, they do not copy them.
3. **Few clear functions, not many micro-functions.** Prefer a small number of well-named methods that adapt to everything they handle over many one-liners. Inline trivial helpers (e.g. a regex-escape used once).
4. **No cross-module type duplication.** Don't declare a type in module X that already exists (or is better modeled) in module Y. Example: an `AriannaElement` interface duplicating what `Real` already models is removed; callers use `Real` / `Real.SubAccessor`.
5. **Redundant per-module entry points are removed.** A module-local `Define` that just wraps `Core.Define` (plus behavior that belongs in Core anyway) is deleted; callers use `Core.Define` directly, and any shared behavior is moved INTO Core.

---

## 2. Services / IoC architecture

- The kernel exposes a **service registry**. Capabilities are injected, not hard-wired. A provider registers with `new Service('name', { method(...) {...} })`; the kernel invokes `Services.Call('name', 'method', ...args)`, which is a **no-op** (returns `undefined`) if nothing is registered.
- `css`, `component`, `shadow`, `render` are injected services. The kernel does NOT inject CSS or render templates itself — it calls the service. Providers live in the owning module (`Stylesheet.ts` registers `css`, `Shadow.ts` registers `shadow`/`render`, `Component.ts` registers `component`).
- **Registry ownership** evolved with the codebase: while `Core` was a zero-import monolith, the registry lived inside `Core` (kept the kernel literally import-free). As `Core` is split into modules, `Core` becomes a **barrel/facade** that imports the pieces, and the registry primitive moves to `Service.ts` (Core re-exports it as an alias). "Zero-import kernel" is a monolith invariant that dissolves in the split — this is a deliberate phase transition, not a regression.
- Dependency direction is a DAG: leaf modules import Core; Core imports leaves (post-split) or nothing (monolith). No cycles.

---

## 3. Naming & structure

- **PascalCase** for public surface (methods, fields, types). **`#name`** for truly-private class members — never `_underscore` for privates. (`_underscore` module-local functions become `#` methods when moved into the owning class.)
- Names are **short, unique, well-referenced**. One concept → one name → one place.
- **Types nest under the owning class/const via declaration merging**, type-only (no runtime code):
  ```ts
  export class Real { … }
  export namespace Real { export type Target = …; export interface SubAccessor { … } }
  ```
  Callers reference `Real.Target`, `Component.ComponentDef`, etc. Do not scatter module-level exported types that belong to a class.
- Element facilities that must live ON the element (e.g. `el.set(...)`) are **thin forwarders** to a per-element `Real` instance, not re-implementations.
- The `static #Build()` + `static { this.#Build(); }` pattern is used to pin `constructor.name` (bundler-safe) and expose the class on `window` once at class-eval.

---

## 4. JSDoc — MANDATORY, vertical, aligned

Every member gets a full JSDoc block: module header, class, namespace, every field, every method, every accessor.

- **VERTICAL multi-line blocks. NEVER inline/compact** (no `/** @name X @public … */` on one line).
- **Alignment:** the value column sits at offset 13 from `@` (i.e. `@name` + 8 spaces, `@type` + 8, `@description` + 1, `@param` + 7, `@returns` + 5, `@author` + 6, `@copyright` + 3, `@license` + 5). Reference block:
  ```
  /** @name        Foo
   *  @public
   *  @type        {boolean}
   *  @description One-or-more lines, wrapped and indented to the value column.
   *  @param       {string} bar What it is.
   *  @returns     {void}
   *  @author      Riccardo Angeli
   *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
   *  @license     MIT / Commercial (dual license)
   */
  ```
- **Every `@copyright` is immediately followed by `@license MIT / Commercial (dual license)`.** No exceptions — a `@copyright` without a `@license` is a defect.
- Fixed tags: `@author Riccardo Angeli`, `@copyright Riccardo Angeli 2012-2026 All Rights Reserved`.
- Classes use `@class` + `@classdesc` (+ `@memberof` when nested in a namespace). Namespaces use `@namespace` + `@description`. Module header uses `@module` + `@author` + `@version` + `@copyright` + `@license` + prose.
- Descriptions are precise and explain intent/edge-cases, not restate the signature.

---

## 5. Formatting

- **Allman braces**: opening brace on its own line for methods, functions, and control blocks.
- **4-space** indentation.
- Expand dense one-liners into readable multi-line bodies.
- **Avoid `any`.** Type things properly — use a function's real return type (e.g. `ReturnType<typeof Core.GetDescriptor>` or `Core.Descriptors.Type`), a typed accessor interface for fluent builders, etc.

---

## 6. Verification discipline (non-negotiable)

- **Every edit is verified with the TypeScript compiler** before it is presented:
  `tsc --noEmit --strict --target es2022 --lib es2022,dom <file>`
  For multi-file / `.ts`-extension imports add `--module esnext --moduleResolution bundler --allowImportingTsExtensions`.
- For a file with imports you don't have, build an **isolated harness**: use the real files you do have (e.g. `Core.ts`) and write **faithful minimal stubs** for the rest, then compile and confirm the only remaining errors are stub-gaps (filter them out explicitly).
- **Establish a baseline**: compile the ORIGINAL file first. This separates pre-existing latent bugs from your changes. (Syntax errors abort semantic checks — a file that "compiled in the tree" may hide real type errors behind a parse error.)
- Deliverables are **surgical**: exact `file + line + anchor text`, before/after. The author applies edits himself.
- **Never dump a large unverified rewrite.** Refactor in verified stages; `tsc` green at every step.
- Real bugs get caught this way (examples from this codebase: a stray `?` inside `x[expr?]`, a mistyped `Core.Type` where `Core.Descriptors.Type` was meant, an undefined `Core.IsUpgraded`, `?? ` that failed to strip a `false` union member). Always look for these.

---

## 7. Correctness rules (learned, load-bearing)

- **Memory / GC.** Hold host/element references via `WeakRef` / `WeakSet` / `WeakMap`; prune with a `FinalizationRegistry`. **NEVER register an object as its own FinalizationRegistry held value** — the registry retains held values strongly, so the target can never be collected and the finalizer never fires (a permanent leak). The held value must be a `WeakRef` or an unrelated key. `WeakMap` keys are weak → the map self-cleans; do not "fix" a non-leak.
- **Idempotency guards are per-node vs per-type and are orthogonal.** `__ariannaUpgraded` on the element gates re-upgrading a single node; `desc.Upgraded` on the shared descriptor is a per-type status flag. One cannot replace the other (using the per-type flag as the guard would skip every instance after the first). Keep both.
- **Never delete code without nailing the delegation semantics first.** Verify the delegate actually covers the behavior (all edge cases) before removing the original, or you lose behavior silently.
- **Lifecycle events fire after the state is consistent.** e.g. `Namespace.Define` upgrades existing DOM instances BEFORE firing `Defined`, so a `Defined` handler sees already-upgraded instances (mirrors `customElements.define`).
- **Shared behavior belongs in the owning module.** e.g. the post-define upgrade sweep lives in `Core.Define`, not duplicated in each caller.
- Feature-gate risky global mutations behind `Configuration` flags (e.g. `nativePatch`). Route otherwise-silent recovery `catch` blocks through a dev sink (`Core.warn(code, …)` gated by `Configuration.debug`), keeping intentional fallbacks intact.

---

## 8. The consolidation technique (concrete)

When collapsing an accreted module (many module-level `_helpers` + a `Wrapper` class + a callable + a `Fn` factory + a redundant `Define`):

1. **`XWrapper` → `class X`** (instances wrap the underlying object; keep only wrapping accessors like `render()`/`valueOf()`).
2. **Callable form → a return of the owning primitive** (e.g. `(el: Element): Real` — resolve to the existing model, don't invent a parallel one).
3. **`XFn(...)` factory → `X.Constructor(tag, ctor, base, opts)`** static, mounted with the same alias/mount it uses today.
4. **Redundant `X.Define` → `Core.Define`** directly; move any shared behavior INTO Core.
5. **Element facilities → thin forwarders** to a per-element `Real` (`el.set = (k,v) => { real.set(k,v); return el; }`), so `set/get/sub/add/fire/style/Sheet` disappear from X.
6. Keep ONLY the X-specific logic as `#private` methods (e.g. attribute-signal wiring, bus coupling, per-element meta, lifecycle).
7. Delete duplicated types; reference the owning module's types.

Do each step as its own `tsc`-verified stage.

---

## 9. Workflow etiquette

- Deliver options to choose between, not a single prescribed answer, when a decision is genuinely open.
- Be direct and neutral; no reassurance padding. Push back with reasoning when an instruction (or an external "audit") is technically wrong — correctness over agreement.
- Give `file + line + anchor`; the author applies edits.
- Keep a bridge document (e.g. `HARDENING.md`) between sessions; this style guide is a companion to it.
