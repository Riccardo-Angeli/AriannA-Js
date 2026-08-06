# AriannA JS 2 — Public Documentation

AriannA JS is a namespace-first, metadata-driven TypeScript framework for native, reactive and server-renderable interfaces.

The documents under `01-Conventions/` are normative. They describe the final architecture used by Workers, Service, State, Reactivity, SSR, Real, Virtual and Components.

## Canonical package import

```ts
import
{
    Component,
    Css,
    Reactivity,
    SSR,
    Templates
}
from '../../core/index.ts';
```

Separately bundled packages use named imports. One JavaScript module has only one default binding, so individual Core APIs must never depend on source-module defaults after bundling.
