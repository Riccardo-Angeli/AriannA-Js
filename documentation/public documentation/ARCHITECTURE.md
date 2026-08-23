# AriannA — Architecture 2.0 (CANONICAL)

> **Version:** 2.0  
> **Status:** Canonical architecture contract. This document supersedes the previous layered model in which `Core.Create` was treated as the DOM authority or `Real`/`Virtual` as equivalent wrappers.

## 0. Architectural invariant

**Real is the DOM engine of AriannA.** There is exactly one AriannA authority for mutations of the real DOM: **Real**. `Core`, `Template`, `Virtual`, `Component`, `Shadow`, `Namespace`, `Reactive`, and `Events` may decide, describe, schedule, route, or orchestrate work, but DOM execution converges on Real.

```text
Compiler decides
Virtual reconciles
Template plans
Reactive propagates
Events distributes
Namespace identifies
Shadow targets
Component orchestrates
Real executes
```

## 1. Compile-time schema

The type-only source of truth is consolidated into `Types.ts` and `Interfaces.ts`. Type aliases, contracts, descriptors, compiler shapes, service contracts, reactive contracts, shadow contracts, and interop contracts belong there when they have no runtime behavior. They must compile away from JavaScript. Runtime modules must not duplicate type-only definitions.

## 2. Runtime stages

AriannA 2.0 is split into four cumulative stages:

| Stage | Contains | Responsibility |
|---|---|---|
| `kernel` | Core + Service | bootstrap, foundational utilities, lifecycle infrastructure, service registry |
| `runtime` | kernel + Reactive + Events | signals, effects, scheduling, ownership/disposal, event lifecycle and delegation |
| `dom` | runtime + Namespaces + Real + Template + Shadow | browser rendering, DOM primitives, compiled templates, sinks, lists, render targets |
| `ui` | dom + Virtual + Component + Css + Directives + JSX + State + Context | complete authoring/framework surface |

Dependencies flow only downward: `ui → dom → runtime → kernel`. Lower stages must never import higher-stage abstractions.

## 3. Real — the DOM engine

Real has one authority and two surfaces: low-level primitives and the fluent authoring API. The fluent API is built on the same primitives used by compiled templates and reconciliation. There is no hidden DOM engine beneath Real.

### 3.1 Primitive surface

The primitive family covers creation/resolution, append/insert/move/remove/clear, text, attributes, properties, classes, styles, child normalization, and target normalization. Hot paths must remain thin, allocation-conscious, compiler-friendly, and callable without constructing unnecessary high-level objects.

### 3.2 Fluent surface

Programmatic code may use `new Real(...).Add(...).Set(...).Style(...).On(...)`. Those operations resolve to Real primitives. Dynamic programmatic operations remain valid after compilation; compilation optimizes what is knowable and leaves genuinely dynamic work to Real at runtime.

## 4. Template — planning, not DOM authority

Template owns structure planning, compiled descriptors, sink plans, scopes, bindings, keyed/non-keyed list plans, reconciliation plans, mount lifecycle, and event plans. It does **not** own an independent implementation of DOM creation or mutation. Commit work is executed through Real.

Compiled templates should avoid generic runtime `ops` interpretation when the compiler already knows the target and operation. The preferred path is a compact execution plan with direct specialized sinks.

## 5. Virtual — optional VDOM and reconciliation

Virtual remains a first-class rendering strategy, but it is not mandatory for every AriannA UI. Virtual owns virtual structure, identity, keys, parent/children relationships, diffing, reconciliation decisions, lazy representation, and foreign-renderer compatibility. When reconciliation commits to the browser, it does so through Real.

The hot-path virtual node should remain lightweight (`type`, `key`, `props`, `children`, identity). Debug/history/tooling metadata should be optional runtime metadata rather than mandatory payload on every node.

## 6. Three rendering modes

AriannA supports three native modes over the same DOM engine:

1. **Compiled:** source → Compiler → IR → execution plan → Real → DOM. No VDOM is paid for when it is unnecessary.
2. **Virtual:** Virtual N → Virtual N+1 → diff/reconciliation → Real → DOM.
3. **Imperative:** application code → Real → DOM. This remains the correct path for animations, editors, dynamic composition, and other runtime-only behavior.

## 7. Component — orchestration

Component orchestrates identity, props, attributes, events, template, shadow target, styles, lifecycle, state, and namespace metadata. Component does not become a second DOM engine. A component may expose or own a host element, but all AriannA-controlled real-DOM mutations still converge on Real.

```text
Component
├── Namespace → identity / upgrade
├── Shadow    → render target
├── Template  → render plan
├── Reactive  → invalidation / propagation
├── Events    → event lifecycle
└── Real      → DOM execution
```

## 8. Namespace — identity and upgrade

Namespace is AriannA's DOM identity/type system. It resolves native tags, custom tags, descriptors, constructors, upgrade rules, creation metadata, and lookup. Namespace tells Real what element/identity is required; it does not perform rendering.

## 9. Shadow — target selection

Shadow answers **where** a component renders: native ShadowRoot, light DOM, iframe/document, or a future isolated root. Open is the normal AriannA-managed default. Native closed Shadow DOM is an explicit opt-in exception where native custom-element constraints apply. Shadow chooses/owns the target boundary; Template plans into it; Real executes mutations.

## 10. Reactive

Reactive is rendering-independent. Signals, computed values, effects, batching, ownership, disposal, and dependency propagation must not know DOM semantics. Compiled code may register specialized sinks, but propagation remains Reactive and sink execution resolves to the appropriate lower-level target operation.

## 11. Events

Events owns listener lifecycle, delegation, dispatch, registries, and normalization. Real consumes Events where event behavior is needed. Compiled Template may emit event plans directly. Large convenience/catalog surfaces should remain separable from the minimal runtime path.

## 12. Compiler and AriannA UI IR

The compiler evolves from a template-only compiler into the **AriannA UI Compiler**. Template, Component, Virtual, JSX, and statically analyzable Real authoring converge on a shared UI IR.

```text
frontends → analyzer → UI IR → optimizer → generator → execution plan
```

The execution plan can describe structure, nodes, sinks, events, lists, components, shadow targets, actions, animations, and lifecycle hooks. The runtime should not rediscover semantics already proven at compile time.

### 12.1 Static, semi-static, dynamic

- **Static:** completely known operations are folded into compiled structure.
- **Semi-static:** known target/operation with dynamic value becomes a specialized runtime sink/primitive call.
- **Dynamic:** unknown property/target/action remains a normal Real runtime operation.

The compiler is conservative: it optimizes only what it can prove.

## 13. Foreign renderer ownership

React, Vue VDOM, Vue Vapor, Angular, and future adapters may coexist through explicit renderer boundaries. A DOM subtree has exactly one renderer owner. AriannA owns the host/boundary; the foreign renderer owns its subtree until unmount. AriannA must not reconcile inside a foreign-owned subtree.

A generic adapter contract is `Mount(host)`, `Update(...)`, `Unmount()`. React keeps Fiber; Vue may keep its VDOM or Vapor runtime; Angular can interoperate through custom-element/adapter boundaries and later through compiler-assisted migration.

## 14. SSR and resumability direction

SSR is generated from the same semantic IR, not from an unrelated renderer. The target pipeline is Component/Template → UI IR → server plan → HTML, followed by selective resume/hydration through Real. Architecture 2.0 is designed for partial hydration, islands, compiled hydration, custom-component hydration, Shadow hydration, streaming, and mismatch diagnostics.

## 15. WYSIWYG / Studio direction

The visual editor must manipulate the same semantic UI representation used by code. Code and visual authoring converge on UI IR instead of maintaining unrelated HTML state. This is the architectural basis for CMS, commerce, landing pages, dashboards, SaaS UI, and application builders.

## 16. Performance contract

Architecture work is not allowed to trade away the benchmark gains without an explicit reason. The post-split reference envelope established before Architecture 2.0 is approximately: keyed weighted geometric mean ~1.17–1.19; non-keyed ~1.17; ready memory ~0.75 MB; run memory ~3.4–3.5 MB; create/clear memory ~1.04 MB; benchmark runtime payload ~54 KB uncompressed / ~16 KB Brotli; first paint ~240 ms. These are regression guards, not eternal fixed targets.

## 17. Implementation order

1. Types / Interfaces consolidation.
2. Core / Service drying.
3. Dependency-stage enforcement.
4. Real audit and primitive consolidation.
5. Template → Real convergence.
6. Virtual → Real convergence.
7. Shadow cleanup.
8. Component cleanup.
9. Namespace cleanup.
10. Events / Reactive cleanup.
11. UI IR foundation and execution plan.
12. SSR architecture.
13. Kanban component and higher-level product work.
14. Full regression/performance pass.

## 18. Canonical summary

**Types describe. Interfaces contract. Core grounds. Service resolves. Reactive propagates. Events distribute. Namespace identifies. Shadow targets. Template plans. Virtual reconciles. Component orchestrates. Real executes. Compiler decides early.**
