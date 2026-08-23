# Release Gates

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

1. strict TypeScript compilation;
2. declaration emit;
3. bundle import audit;
4. runtime module linking;
5. Playground bootstrap;
6. representative component tests from every folder.

Forbidden bundle patterns:

```js
import Component from "./arianna.js";
import Templates from "./arianna.js";
import { escapeHtml } from "./arianna.js";
```

Expected: named imports from `./arianna.js`.
