# Naming

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

- public classes, static methods, factories and service methods: PascalCase;
- fluent instance methods: lower camel case;
- hard-private state and helpers: `#name`;
- no `_registry` or `_cache` for genuinely private state;
- exported namespaces use stable conceptual names;
- instance methods return `this` only when they mutate/configure that same instance;
- methods returning new signals, memo values, render results or resources return the real object.
