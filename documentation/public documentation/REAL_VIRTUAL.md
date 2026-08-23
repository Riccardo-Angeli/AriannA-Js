# Real & Virtual — Architecture 2.0 DOM Strategies

> **Version:** 2.0  
> **Canonical dependency:** `ARCHITECTURE.md`.

## 1. The invariant

`Real` is AriannA's DOM engine. `Virtual` is an optional virtual representation and reconciliation strategy that commits through Real. They are not peer wrappers over `Core.Create`, and Virtual must not bypass Real when committing DOM mutations.

## 2. Real

Real is both the low-level DOM execution authority and the fluent imperative authoring surface. Its primitives cover create/resolve, append/insert/move/remove/clear, text, attribute, property, class, style, child normalization, and target normalization.

The fluent API (`Add`, `Set`, style/event helpers, and equivalent methods) is implemented on those same primitives. Compiler-generated code may call specialized Real primitives directly to avoid high-level object overhead.

## 3. Virtual

Virtual owns descriptors, identity, keys, children, diffing, reconciliation decisions, and lazy virtual structure. A lightweight virtual node should contain only hot-path data; history/debug/tooling metadata is optional.

Virtual may remain fully React-like where VDOM semantics are useful. The commit boundary is:

```text
Virtual tree → reconciliation → Real primitives → DOM
```

## 4. Compiled, Virtual, Imperative

| Mode | Best for | DOM commit |
|---|---|---|
| Compiled | known structure, direct sinks, high-performance UI | Real |
| Virtual | VDOM workflows, compatibility, dynamic structural diff | Real |
| Imperative | animations, editors, runtime composition, complex JS/TS actions | Real |

No mode invalidates the others. Compilation removes only work proven static; dynamic Real calls remain legal and execute normally at runtime.

## 5. Components

Component orchestrates Template, Shadow, Reactive, Events, Namespace, styles, and lifecycle. It may expose a host element and fluent facilities, but it is not a second DOM engine. DOM ownership stays with Real.

## 6. Foreign VDOMs

React/Vue/other renderers can own explicit subtrees. AriannA owns the host boundary and does not reconcile inside a foreign-owned subtree. React keeps Fiber; Vue keeps its chosen renderer.

## 7. SSR

SSR should be generated from AriannA UI IR/server plans. Virtual can still be serialized or used by compatibility paths, but Architecture 2.0 does not require VDOM as the universal SSR representation.

## 8. Performance rule

Do not add generic wrappers, duplicate DOM mutation implementations, or mandatory metadata to hot paths. Compiled paths should be able to bypass generic fluent machinery while still using Real primitives.
