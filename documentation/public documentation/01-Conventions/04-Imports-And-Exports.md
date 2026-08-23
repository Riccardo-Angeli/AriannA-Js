# Imports and Exports

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

## Order

1. runtime imports;
2. blank line;
3. type-only imports;
4. blank line;
5. optional platform or third-party imports.

## Barrel rule

Components and Addons bundled separately from Core use named imports from `core/index.ts`.

Bad:

```ts
import Component from './arianna.js';
import Templates from './arianna.js';
```

Correct:

```ts
import
{
    Component,
    Templates
}
from './arianna.js';
```

A default export represents one object only. Do not change the package default repeatedly to satisfy different call sites.

Compatibility exports are forbidden when they only conceal an incorrect import.
