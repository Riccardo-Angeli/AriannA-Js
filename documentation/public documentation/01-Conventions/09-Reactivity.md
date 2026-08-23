# Reactivity

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

Use the nominal API.

```ts
const count =
    new Reactivity.Signal(0);

const effect =
    new Reactivity.Effect
    (
        () =>
        {
            label.textContent =
                String(count.Get());
        }
    );

effect.Dispose();
```

Do not recreate legacy `signal`, `signalMono`, `computed`, `effect`, `batch` or `untrack` bridges in Core namespaces. Track disposers on the owning instance. Schema contracts and runtime return types must agree.
