# Barrel and Default Exports

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
