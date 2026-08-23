# Source Structure — AriannA Architecture 2.0

> **Version:** 2.0

## Runtime stages

```text
schema/
  Types.ts
  Interfaces.ts

kernel/
  Core.ts
  Service.ts

runtime/
  Reactive.ts
  Events.ts

dom/
  Namespaces.ts
  Real.ts
  Template.ts
  Shadow.ts

ui/
  Virtual.ts
  Component.ts
  Css.ts
  Directives.ts
  JSX...
  State...
  Context...
```

The physical repository may migrate incrementally toward this layout; the dependency contract applies immediately even before every file is moved.

## Compiler architecture

```text
Template / Component / Virtual / JSX / analyzable Real authoring
                         ↓
                       Analyzer
                         ↓
                    AriannA UI IR
                         ↓
                      Optimizer
                         ↓
                     Generator
                         ↓
                   Execution Plan
                         ↓
                        Real
                         ↓
                         DOM
```

Compiler output classifies operations as static, semi-static, or dynamic. Static work is folded; semi-static work becomes specialized sinks; dynamic work remains Real runtime code.
