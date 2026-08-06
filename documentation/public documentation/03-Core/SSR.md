# SSR

```ts
const safe =
    SSR.Renderer.EscapeHtml(untrusted);

const html =
    SSR.Renderer.RenderToString(node);
```

`EscapeHtml` belongs to `Renderer`; it is not a top-level compatibility function.
