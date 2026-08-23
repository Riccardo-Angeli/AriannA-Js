# Services

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

`Services.Service<TContract>` owns registration and lookup.

```ts
const Service =
    new Services.Service<ServiceContract>
    (
        'ssr',
        {
            Create(options?: RenderOptions): Renderer
            {
                return Renderer.Create(options);
            },

            EscapeHtml(value: string): string
            {
                return Renderer.EscapeHtml(value);
            }
        }
    );
```

The contract lives in Schema for Core. The implementation remains in the owning namespace. Service methods delegate to canonical classes and do not duplicate algorithms.
