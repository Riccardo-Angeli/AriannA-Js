# Barrel and Default Exports

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

Symptoms:

```text
Component is not a function
Templates.Template is undefined
```

Cause: several direct Core source imports were externalized to one `arianna.js` module while retaining default-import semantics.

Fix:

```ts
import
{
    Component,
    Templates,
    SSR
}
from '../../core/index.ts';
```

Do not alternate the package default between `AriannA`, `Component` and `Templates`.
