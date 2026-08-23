# Runtime Test Architecture — AriannA Architecture 2.0

> **Version:** 2.0

## 1. Canonical invariants

1. **Real is the sole AriannA DOM execution authority.** Template and Virtual commits must be observable through Real primitives or an equivalent inlined Real primitive path.
2. **Layer direction:** `ui → dom → runtime → kernel`; lower stages must not import higher stages.
3. **Reactive is renderer-independent.** Signal/effect tests must pass without Component/Template/Virtual.
4. **Events is separable from UI.** Event lifecycle/delegation tests run at runtime stage.
5. **Namespace identifies; it does not render.**
6. **Shadow selects/owns render targets; it does not implement a competing renderer.**
7. **Component orchestrates; it does not duplicate DOM primitives.**
8. **Virtual reconciliation commits through Real.**
9. **Compiled Template sinks commit through Real primitives and avoid generic operation interpretation when statically known.**
10. **Foreign-owned subtrees have one renderer owner and are not reconciled by AriannA.**
11. **Type-only schema emits no runtime JavaScript.**
12. **Performance regressions are release-gated against the established keyed/non-keyed, memory, payload, and first-paint baselines.**

## 2. Required test families

- Real primitive unit tests.
- Real fluent-to-primitive equivalence tests.
- Template compiled sink/list/event-plan tests.
- Virtual diff/reconciliation-to-Real tests.
- Component orchestration/lifecycle tests.
- Shadow target backend tests (open/light/iframe/closed exception).
- Namespace identity/upgrade tests.
- Reactive ownership/disposal/batch tests.
- Event delegation/listener cleanup tests.
- Compiler static/semi-static/dynamic classification tests.
- Foreign renderer ownership-boundary tests.
- SSR plan/hydration mismatch tests.
- Dependency graph and bundle-stage tests.

## 3. Release gate

A refactor is incomplete if correctness passes but hot-path performance, memory, payload, or first paint regresses materially without an explicit architectural reason. Benchmark results are regression evidence, not implementation targets to game.
