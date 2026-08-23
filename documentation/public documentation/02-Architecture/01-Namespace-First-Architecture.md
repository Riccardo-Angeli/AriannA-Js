# Namespace-First Architecture — Architecture 2.0

> **Version:** 2.0

Namespace remains the identity and upgrade authority, but **Real is the DOM execution authority**. Namespace resolves native/custom tag identity, descriptors, constructors, and upgrade metadata. Real consumes that resolution to create or mutate the actual DOM. Namespace must not become a renderer.

The dependency is therefore: `Component/Template/Virtual → Namespace (identity decision) → Real (DOM execution)`.
