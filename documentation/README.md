# AriannA Documentation

This folder contains the canonical documentation for the AriannA framework. Each file is **standalone** and **focused on one topic**, designed so a reader can grab the one they need without scrolling through everything.

## Reading order

If reading top-to-bottom for the first time:

1. **[REACTIVITY.md](REACTIVITY.md)** — `signal`, `effect`, `computed`, `batch`, sinks. The reactive primitives that everything else uses. *~250 lines.*
2. **[REAL_VIRTUAL.md](REAL_VIRTUAL.md)** — `Real` and `Virtual` DOM wrappers. The two ways to build DOM. *~240 lines.*
3. **[LIFECYCLE.md](LIFECYCLE.md)** — Component pipeline from class definition through `onUnmount`. Hook firing order, cleanup contract, attr↔signal↔DOM chain. *~350 lines.*
4. **[TEMPLATE_DIRECTIVES.md](TEMPLATE_DIRECTIVES.md)** — Every `a-*`, `@event`, `:attr`, `{{ }}` directive. Modifier list. Expression context rules. *~480 lines.*
5. **[COMPONENT_CONVENTIONS.md](COMPONENT_CONVENTIONS.md)** — The full Component spec. Two factory signatures, six instantiation forms, Sheet inheritance, all 11 @-rules, decorators, JSX runtime. *~1300 lines.*
6. **[EXAMPLES.md](EXAMPLES.md)** — End-to-end worked examples: `<arianna-counter-card>` (full Bible), `<arianna-tabs>` (parent/child via bus), `Directive.bootstrap` without components, JSX TodoApp, inheritance chain. *~540 lines.*

## Single-file alternative

For a single concatenated file (useful for offline reading, AI ingestion, or grep), see **[../CONVENTIONS.md](../CONVENTIONS.md)** in the repo root — 3200+ lines, all six documents in one.

## File map

| File | Topic | Lines |
|------|-------|-------|
| `REACTIVITY.md` | Reactive primitives prerequisite | 250 |
| `REAL_VIRTUAL.md` | DOM strategies API | 240 |
| `LIFECYCLE.md` | Component pipeline & hooks | 350 |
| `TEMPLATE_DIRECTIVES.md` | Template directive reference | 480 |
| `COMPONENT_CONVENTIONS.md` | Component definition spec | 1300 |
| `EXAMPLES.md` | Worked end-to-end examples | 540 |
| `CONVENTIONS.md` (in root) | All six concatenated | 3200 |

## Audience

- **New users**: read in order 1 → 6
- **Existing users coming back**: jump directly to the file you need
- **AI assistants** (Claude, GPT, etc.): use `CONVENTIONS.md` from root for full context in a single load
- **Developers contributing**: each file has a "Purpose" line at the top — that tells you what's in scope
