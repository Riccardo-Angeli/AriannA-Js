# AriannA — Session Changelog (2026-05-27)

## Overview

This changelog summarises every fix, addition, and architectural change made in the current session, in the order they should be applied to the codebase. Each entry includes the file affected, the rationale, and the user-visible effect.

---

## §1. Core fixes (must rebuild bundle after applying)

### §1.1 Template.ts — three rendering bugs fixed

**File**: `Template.ts` (657 lines, up from 627)

Three fixes that unblock template rendering for components using `a-for` and edge SVG cases:

1. **Scope leak in `walk()`** — when encountering an `a-for` element, `walk()` no longer descends into the element's children. The children are walked later by `applyForBinding()` with a locale scope `{...signals, [b.iter]: item}` per iteration. Resolves the family of `ReferenceError: item / p / it / wd / s is not defined` errors.

2. **Element guard in `applyBinding()`** — non-text bindings (attr, event, if, for) check that the target node is an Element before invoking `removeAttribute`/`setAttribute`. Prevents `el.removeAttribute is not a function` when a binding lands on a Text/Comment node after list re-renders.

3. **Style guard in `applyStyleValue()`** — handles the rare case where `el.style` is undefined (legacy SVG elements), falling back to inline-string `setAttribute('style', ...)`.

### §1.2 Namespace.ts — heuristic subclass lookup added

**File**: `Namespace.ts` (1724 lines, up from 1689)

In `Update(node, hint)` (around line 994), when `descriptor.Class === null`:

- Scan `window`/`globalThis` for any function whose prototype chain includes `descriptor.Constructor.prototype` AND whose static `__ariannaTag` matches the descriptor's tag
- If found, populate `descriptor.Class = candidate`, `descriptor.Constructor = candidate`, `descriptor.Prototype = candidate.prototype`

This fixes the `arianna-button` markup-only path: when the user has `<arianna-button>` in HTML but has never called `new Button()` in JS, the lookup finds Button via the `Object.defineProperty(window, 'Button', { value: Button })` convention.

The lookup is a **fallback** for cases where `Component.Boot()` hasn't been called explicitly. See §2 below for the proper boot mechanism.

### §1.3 Component.ts — five major additions

**File**: `Component.ts` (1692 lines, up from 1398)

#### §1.3.1 IframeShadow import and integration

Imports `AttachAriannaShadow`, `RenderIntoAriannaShadow`, `IsAriannaShadow`, `IsIframeBackend`, and the `AriannaShadow` + `AriannaShadowOptions` types from the unified `Shadow.ts` module. The iframe mode passes `{ backend: 'iframe' }` to AttachAriannaShadow.

#### §1.3.2 `ShadowSetting` extended to support `'iframe'` and `'arianna'`

```ts
export type ShadowSetting =
    | false                      // light DOM, no shadow
    | true                       // alias for 'closed'
    | 'open'                     // native open, fallback AriannaShadow
    | 'closed'                   // native closed, fallback AriannaShadow (default)
    | 'iframe'                   // hidden-iframe hard isolation (new in v2)
    | 'arianna'                  // force AriannaShadow even when native would work
    | 'drop' | 'inset' | 'glow' | 'layered';   // legacy v1 values, treated as 'closed'
```

`ComponentDef` gains an `iframe?: IframeShadowOptions` field for per-component iframe configuration (sandbox, bridged events, projection mode, dimensions).

#### §1.3.3 `_attachAriannaShadow` rewritten to implement the escalation policy

Implements the policy documented in SHADOW.md §8:

```
mode === 'iframe'   → IframeShadow always
mode === 'arianna'  → AriannaShadow always (force polyfill)
mode === 'open' | 'closed':
    try native attachShadow
    on failure → AriannaShadow
mode === false (not in this fn — handled by caller)
```

The function signature now returns `ShadowRoot | AriannaShadow | IframeShadow | null` and takes an optional third arg `iframeOpts: IframeShadowOptions`.

#### §1.3.4 Template-mount path supports all three shadow types

The `_installFacilities` step that mounts `this.template` now branches three ways:

- IframeShadow: render template into a transient DocumentFragment, pass to `RenderIntoIframeShadow` (which adopts/imports into iframe doc, processes slots, projects light children)
- AriannaShadow: render into transient fragment, pass to `RenderIntoAriannaShadow` (existing path)
- Native ShadowRoot OR no shadow: render directly into the target (existing path)

#### §1.3.5 `_applySheet` supports IframeShadow CSS injection

When the host has an IframeShadow attached, the stylesheet is:

- Rewritten with `:host` → `html` (since the iframe document's root IS the component scope)
- Injected into `iframe.contentDocument.head` instead of the outer `<head>`

When the host has a native ShadowRoot, the existing `:host`-preserving rewrite + `shadowRoot.appendChild(style)` path is used.

When the host has AriannaShadow or no shadow, the existing `tag[data-arianna-instance="X"]` rewrite + outer-`<head>` injection path is used.

#### §1.3.6 `Component.Boot()` added as static method

```ts
Component.Boot();
```

Walks every registered Custom descriptor whose `Class === null` and tries to find the user subclass via:

1. Iterate `Object.keys(window)`
2. For each function-valued property, check if its prototype chain includes the descriptor's `Constructor.prototype` (i.e. it extends the Bound class returned by `Component(tag, …)`)
3. Optionally cross-check the candidate's `__ariannaTag` static against the descriptor's tag
4. If found, call `new Candidate()` once to trigger `descriptor.Class = new.target` capture; discard the throwaway instance

Idempotent. Safe to call multiple times. Recommended call site: after all component imports at app entry.

This is the **explicit** way to populate `descriptor.Class` for markup-only paths, replacing the fallback heuristic in Namespace.Update (§1.2) as the preferred approach.

#### §1.3.7 `__ariannaTag` static added to Bound

The `Bound` class returned by `Component(tag, ...)` now carries `Bound.__ariannaTag = tag` as a static property. Subclasses inherit this via the class proto chain (`Button.__ariannaTag === 'arianna-button'`). The lookup in §1.2 and §1.3.6 uses this to disambiguate which subclass corresponds to which tag.

---

## §2. New file — `Shadow.ts` (AriannaShadow polyfill)

**File**: `Shadow.ts` (445 lines)

The light-DOM polyfill for shadow DOM. Documented in `SHADOW.md` §5.

**Exports**:

- `ShadowMode` type — `'open' | 'closed'`
- `AriannaSlot` interface — slot descriptor (name, anchor, fallback, projected)
- `AriannaShadow` interface — the JS-emulated shadow root
- `ARIANNA_SHADOW_KEY` symbol — `Symbol.for('arianna.shadow.root')`
- `IsAriannaShadow(x)` type guard
- `GetAriannaShadow(host)` — read the stash from a host element
- `AttachAriannaShadow(host, mode?)` — install on a host
- `RenderIntoAriannaShadow(shadow, fragment)` — process slots, project light children

Used by `Component.ts` as the fallback when native `attachShadow` throws.

---

## §3. `Shadow.ts` — single module, two backends (iframe folded in)

**File**: `Shadow.ts` (710 lines)

The light-DOM polyfill AND the iframe hard-isolation now live in ONE module, as TWO backends of a single `AriannaShadow` type. There is **no** separate `IframeShadow.ts` module — that would be a parallel registry, which AriannA forbids (COMPONENTS.md §36). The iframe is a *backend* of AriannaShadow, selected via `options.backend`.

**Exports** (the complete shadow surface, all from this one file):

- `ShadowMode` type — `'open' | 'closed'`
- `ShadowBackend` type — `'light' | 'iframe'`
- `IframeProjection` type — `'adopt' | 'clone'`
- `AriannaShadowOptions` interface — `{ backend, sandbox, bridgeEvents, projection, width, height, autoResize }`
- `AriannaSlot` interface — slot descriptor
- `AriannaShadow` interface — THE single shadow type, with a `Backend` field and iframe-only members (`iframe`, `document`, `window`, `send`) that are null/throwing on the light backend
- `ARIANNA_SHADOW_KEY` symbol — `Symbol.for('arianna.shadow.root')`
- `IsAriannaShadow(x)` — THE single type guard (distinguishes from native ShadowRoot)
- `IsIframeBackend(x)` — convenience guard (`IsAriannaShadow(x) && x.Backend === 'iframe'`)
- `GetAriannaShadow(host)` — read the stash
- `AttachAriannaShadow(host, mode?, options?)` — install; `options.backend` picks light or iframe
- `RenderIntoAriannaShadow(shadow, fragment)` — branches internally on `shadow.Backend`

**Light backend** (`backend: 'light'`, default): DocumentFragment → host light DOM, slot projection by reparenting around Comment anchors, MutationObserver re-projection, `arianna:slotchange` event. Soft CSS isolation (instance-id scoping done by Component._applySheet).

**Iframe backend** (`backend: 'iframe'`): hidden `<iframe sandbox>`, template imported into contentDocument via importNode, slot projection via adoptNode (adopt-mode) or importNode (clone-mode), event bridge re-dispatching configured events on host with `composed: true`, postMessage `send()` for cross-origin, ResizeObserver auto-sizing. Hard CSS isolation (real document boundary).

**~~`IframeShadow.ts`~~ — REMOVED.** The earlier draft of this session created a separate `IframeShadow.ts` module. That violated the one-module rule. It has been folded into `Shadow.ts` as the iframe backend. Do not ship `IframeShadow.ts`.


---

## §4. Documentation files

### §4.1 `COMPONENTS.md` (NEW, 1886 lines)

Unified canonical document, merging:

- `COMPONENT_CONVENTIONS.md` (verbatim, updated to v2 model)
- `LIFECYCLE.md` (verbatim, with complete ASCII diagram)
- `COMPONENT_MECHANICS.md` (verbatim, including all three boxed diagrams)

Five parts, 40 sections. Covers everything: chain, dispatcher, descriptor, paths, Boot, shadow modes, conventions, decorators, JSX, accessibility, testing, governance.

### §4.2 `SHADOW.md` (NEW, 664 lines)

Comprehensive shadow document covering all five modes (native, AriannaShadow, **IframeShadow** new, light DOM, force-arianna). Includes:

- Architectural rationale (§1-§3)
- Per-mode implementation details (§4-§7)
- Escalation policy (§8)
- Cross-boundary communication (§9)
- Stylesheet integration in every mode (§10)
- Closed-mode semantics (§11)
- Slot projection matrix (§12)
- Performance cost matrix (§13)
- Decision tree (§14)
- Migration playbook (§15)
- The unified shadow contract (§16)

### §4.3 `INDENT_CONVENTIONS.md` (523 lines)

The canonical Allman-style indent guide via the Cuore example. Includes the "killer feature" pitch on the AriannaShadow polyfill workaround as the architectural Story.

---

## §5. Files that must change in deployment

To apply this session's fixes, replace these files in the source tree and rebuild the bundle:

| File | Status | Lines |
|---|---|---|
| `src/core/Template.ts` | **Modified** (3 fixes) | 657 (was 627) |
| `src/core/Namespace.ts` | **Modified** (subclass lookup) | 1724 (was 1689) |
| `src/core/Component.ts` | **Modified** (5 additions) | 1692 (was 1398) |
| `src/core/Shadow.ts` | **Modified** (iframe backend folded in) | 710 (was 445) |
| `release/dist/arianna.js` | Must rebuild | — |
| `release/dist/arianna-components.js` | Must rebuild | — |
| `release/dist/playground.html` | **Modified** (LED + footer + ping removed) | 2787 |
| `docs/COMPONENTS.md` | **NEW (merges 3 old docs)** | 1886 |
| `docs/SHADOW.md` | **NEW** | 664 |
| `docs/INDENT_CONVENTIONS.md` | **NEW** | 523 |

Source files that can be DELETED after the merge:
- `docs/COMPONENT_CONVENTIONS.md` (absorbed into COMPONENTS.md)
- `docs/LIFECYCLE.md` (absorbed into COMPONENTS.md)
- `docs/COMPONENT_MECHANICS.md` (absorbed into COMPONENTS.md)

---

## §6. Build & test sequence

1. Drop all the modified files into `src/core/` (Shadow.ts now contains both backends; do NOT add IframeShadow.ts)
2. Rebuild `arianna.js` (e.g. `npm run build:core`)
3. Rebuild `arianna-components.js` (e.g. `npm run build:components`)
4. Refresh playground with hard reload
5. Open the playground, run the `input-button-shadow` example
6. Expect:
   - LED turns green
   - Console shows: `hasInnerButton: true`, `styleNodes: 1`, `hasSlot: true`, `text: "Click me"`
   - No `NotSupportedError` in the console
   - `[arianna] [shadow-test] current example 3/3 AriannA components valid`

If the above is verified, run `Test All` and observe LED states for the full example matrix.

---

## §7. Migration impact on existing components

**Zero changes required for existing components.** The 140+ components in `components/*` continue to work with the new Core because:

- The `ShadowSetting` type extension is additive (`'iframe'` and `'arianna'` are NEW values; old values still work)
- The default `shadow: 'closed'` continues to fall back to AriannaShadow on `<arianna-*>` autonomous tags
- `Component.Boot()` is opt-in; without it, the heuristic lookup in `Namespace.Update` (§1.2) provides backward compatibility
- The new `Component.Boot()` is automatically called by the unified bundle's IIFE (when added — see §8 below)

---

## §8. Recommended subsequent step (not done in this session)

Update the unified bundle `arianna-components.js` build script to automatically call `Component.Boot()` after all component modules have been evaluated:

```js
// At the end of arianna-components.js bundle IIFE:
if (typeof window !== 'undefined' && typeof window.Component?.Boot === 'function') {
    window.Component.Boot();
}
```

This closes the markup-only gap automatically for users who include the unified bundle, without requiring an explicit call.

---

## §9. Verification commands

After deployment, paste this in the browser console to verify Component.Boot is callable:

```js
typeof window.Component?.Boot === 'function'   // should be true
window.Component.Boot()                         // should run silently, no errors
```

To verify a markup-instantiated arianna-button has the full prototype chain:

```js
const btn = document.querySelector('arianna-button');
let p = Object.getPrototypeOf(btn);
const chain = [];
while (p) { chain.push(p.constructor.name); p = Object.getPrototypeOf(p); }
console.log(chain);
// Expected: ['Button', 'Component-bound-anon-or-Component', 'HTMLElement', 'Element', 'Node', 'EventTarget', 'Object']
```

To verify shadow modes:

```js
const btn = document.querySelector('arianna-button');
const root = btn.Shadow?.Root;
console.log({
    isNative: root instanceof ShadowRoot,
    isArianna: root?.IsAriannaShadow === true && !root?.IsIframeShadow,
    isIframe: root?.IsIframeShadow === true,
});
```

---

## §10. END

Session complete. Tutto consegnato. Buona uscita.

Document version: session-2026-05-27
