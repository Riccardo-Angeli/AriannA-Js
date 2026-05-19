# AriannA Reactivity Primer

**Purpose**: minimal grounding in the reactive primitives used throughout `COMPONENT_CONVENTIONS.md` and `LIFECYCLE.md`. Read this once before reading the conventions doc.

---

## 1. Signal — reactive value cell

A `Signal<T>` is a single cell holding a value. Reading the value inside a tracked context (effect / computed / sink) automatically subscribes the reader. Writing the value notifies all readers.

```ts
import { signal } from 'arianna';

const count = signal(0);

count.get();         // 0    — read
count.set(5);        // notify subscribers
count.get();         // 5
count();             // 5    — shorthand: calling without () reads
```

`signal(initial)` returns:

```ts
interface Signal<T> {
    get(): T;
    set(v: T): void;
    (): T;                    // shorthand alias for get()
    subscribe(fn: (v: T) => void): () => void;
}
```

Updates are **synchronous** by default. Multiple `.set()` calls before the next microtask each schedule a flush.

---

## 2. `signalMono` — optimised single-subscriber signal

Same shape as `signal`, but with allocation-free internals when only one subscriber exists (typical for `sinkText` on a `Text` node).

```ts
import { signalMono, sinkText } from 'arianna';

const label = signalMono('initial');

const node = document.createTextNode('');
sinkText(label, node);

label.set('updated');        // node.nodeValue = 'updated' immediately
```

Use `signal` by default. Use `signalMono` only in measured hot paths.

---

## 3. `computed` — derived signal

```ts
import { signal, computed } from 'arianna';

const first = signal('Riccardo');
const last  = signal('Angeli');

const full = computed(() => `${first.get()} ${last.get()}`);

full.get();          // 'Riccardo Angeli'
first.set('Riky');
full.get();          // 'Riky Angeli' — recomputed lazily
```

`computed` returns a `ReadonlySignal<T>` — same as `Signal<T>` but without `.set()`. Recomputes on read when dependencies have changed.

---

## 4. `effect` — reactive side effect

```ts
import { signal, effect } from 'arianna';

const count = signal(0);

const dispose = effect(() => {
    console.log('count is', count.get());
});
// → logs immediately: 'count is 0'

count.set(1);
// → logs: 'count is 1'

dispose();                   // stop the effect
count.set(2);                // nothing logged
```

The effect re-runs whenever any signal read inside it changes. Reads happen during execution — `effect(() => count.get())` subscribes to `count`. Returns a `dispose` function.

Cleanup hook for resources:

```ts
effect((onCleanup) => {
    const timer = setInterval(...);
    onCleanup(() => clearInterval(timer));
});
```

---

## 5. `batch` — collapse multiple writes into one notification

```ts
import { batch } from 'arianna';

batch(() => {
    first.set('Hello');
    last.set('World');
    full.get();              // not yet recomputed
});
// after batch: full is recomputed ONCE, effects fire ONCE
```

Without `batch`, each `.set` triggers downstream effects independently. Use `batch` when updating multiple related signals.

---

## 6. `untrack` — read without subscribing

```ts
import { untrack } from 'arianna';

effect(() => {
    const visible = isVisible.get();      // subscribed
    const userId  = untrack(() => user.get().id);  // NOT subscribed
    console.log(visible, userId);
});
```

When `isVisible` changes the effect re-runs. When `user` changes it does NOT. Useful for reading "context" values without coupling to them.

---

## 7. Sinks — direct DOM bindings

Sinks are zero-allocation bindings that write a signal value directly to a DOM mutation, bypassing the effect bookkeeping for common cases.

```ts
import { signalMono, sinkText, sinkClass, sinkAttr, sinkStyle } from 'arianna';

const text   = signalMono('Hello');
const active = signal(false);

sinkText(text, myTextNode);                       // node.nodeValue ← text
sinkClass(myEl, 'active', () => active.get());    // toggle className
sinkAttr (myEl, 'data-id', () => active.get() ? 'on' : 'off');
sinkStyle(myEl, 'color',   () => active.get() ? 'red' : 'black');
```

Sinks are what `Real.text()`, `Real.cls()`, `Real.attr()`, `Real.style()` use internally.

---

## 8. `attrSignal` — bridge between attribute and signal

Inside a Component, `this.attrSignal(name)` returns the `Signal<string | null>` backing an observed attribute (declared via `def.attrs`).

```ts
class Button extends Component('arianna-button', HTMLElement, {...}, {
    attrs: ['variant'],
}) {
    build() {
        const variant = this.attrSignal('variant');

        variant.get();           // current attribute value, or null

        effect(() => {
            console.log('variant changed to', variant.get());
        });

        variant.set('primary');  // → setAttribute('variant', 'primary')
                                 //   + signal notifies + template re-renders
    }
}
```

The signal is **bidirectional** with the DOM attribute:

```
                  attributeChangedCallback
HTML attribute ─────────────────────────────► Signal value
                  signal.set() writes attr
Signal value ────────────────────────────────► HTML attribute
```

This is the reactive backbone every component uses to expose state.

---

## 9. State — observable plain object

When you need a reactive object with multiple keys (vs N separate signals), use `State`:

```ts
import { State } from 'arianna';

const state = new State({
    user: { name: 'Riccardo', age: 47 },
    cart: { items: [], total: 0 },
});

effect(() => console.log(state.State.user.name));
// → 'Riccardo'

state.State.user.name = 'Riky';
// → effect re-runs, logs 'Riky'
```

`State.State` is a deeply-reactive proxy. Reads inside effects subscribe; writes notify. Internally backed by `signal` + `reactive(...)`. Used by `Directive.bootstrap(root, scope)` to wire entire DOM trees declaratively.

---

## 10. The mental model

```
       ┌──────────────┐
       │   Signal     │  cell with subscribers
       └──────┬───────┘
              │
      ┌───────┴───────┐
      │               │
   ┌──▼───┐      ┌────▼────┐
   │effect│      │computed │  read, re-run on change
   └──┬───┘      └────┬────┘
      │               │
      └───┬───────────┘
          │
       ┌──▼──┐
       │sink │  fast path → DOM mutation
       └──┬──┘
          │
     ┌────▼────┐
     │  DOM    │
     └─────────┘
```

- **Signal**: source of truth
- **Effect / computed**: derived computations that automatically track dependencies
- **Sink**: optimised effect that writes a single signal value to one DOM mutation
- **DOM**: the rendered result

Every reactive feature in AriannA — template interpolation, `a-if`, `a-for`, `Component` attrs, `State` objects, `Real.text(getter)` — is a thin layer over these five primitives: `signal`, `effect`, `computed`, `batch`, sinks.
