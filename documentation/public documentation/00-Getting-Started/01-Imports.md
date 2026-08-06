# Imports

Use named imports from the Core barrel.

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

Canonical use:

```ts
const html =
    Templates.Template.Html;

const escaped =
    SSR.Renderer.EscapeHtml(source);

const value =
    new Reactivity.Signal(0);
```

Do not restore obsolete aliases such as `html`, `escapeHtml`, `renderToString` or `hydrate` to hide a wrong import.
