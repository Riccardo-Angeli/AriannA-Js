# Static Versus Instance

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

Use static members for factories, parsers, compilers, escaping, class-wide registries, normalization and short-lived canonical operations.

Use instance members for state, lifecycle, resource ownership and fluent configuration.

External helpers move to private static methods, public static methods, instance methods or secondary classes according to ownership. Do not invent a `Runtime` class merely to provide a home for old free functions.
