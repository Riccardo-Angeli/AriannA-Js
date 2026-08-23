# AriannA JS 2 — Public Documentation

> **Documentation version:** 2.0 — Architecture 2.0 merge

This package is the public documentation set aligned to **AriannA Architecture 2.0**. `ARCHITECTURE.md` is the canonical architectural contract; topic documents refine it and must not override its invariants.

## Canonical package import

Use the public package entry points documented by the current release. Internal stage boundaries (`kernel`, `runtime`, `dom`, `ui`) describe architecture and bundle composition; they are not a promise that every internal source path is a public import.

## Architecture 2.0 reading order

1. `ARCHITECTURE.md`
2. `REAL_VIRTUAL.md`
3. `REACTIVITY.md`
4. `TEMPLATE_DIRECTIVES.md`
5. `COMPONENTS.md`
6. `SHADOW.md`
7. `LIFECYCLE.md`
8. `TESTING.md`
9. `SourceStructure.MD`

Core invariant: **Real is the DOM engine of AriannA.**
