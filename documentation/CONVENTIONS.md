# AriannA — Complete Conventions

**Version**: 2.0 (revision 2026-05-19)
**Author**: Riccardo Angeli
**Status**: Authoritative single-source-of-truth for the AriannA framework

---

This document combines all six conventions documents into one. For separate, easier-to-navigate files, see the `documentation/` folder:

- `REACTIVITY.md` — Signal primitives, the reactive foundation
- `REAL_VIRTUAL.md` — Real and Virtual DOM API
- `LIFECYCLE.md` — Component pipeline from definition to unmount
- `TEMPLATE_DIRECTIVES.md` — Complete template directive reference
- `COMPONENT_CONVENTIONS.md` — Component definition spec
- `EXAMPLES.md` — End-to-end worked examples

Read in this order if reading top-to-bottom: **Reactivity → Real/Virtual → Lifecycle → Template Directives → Component Conventions → Examples**.

---

## Table of contents

### Part I — Foundations
- [Part I. Reactivity Primer](#part-i--reactivity-primer)
- [Part II. Real & Virtual](#part-ii--real--virtual)
- [Part III. Component Lifecycle](#part-iii--component-lifecycle)

### Part II — Authoring components
- [Part IV. Template Directives](#part-iv--template-directives)
- [Part V. Component Conventions](#part-v--component-conventions)

### Part III — Reference
- [Part VI. Worked Examples](#part-vi--worked-examples)

---


---

# Part I — Reactivity Primer


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

---

# Part II — Real & Virtual


**Purpose**: explain the two DOM construction strategies that every AriannA component, JSX expression, or imperative builder ultimately uses. Read this once before writing components.

---

## 1. The mental model

AriannA exposes the DOM through two equivalent APIs:

- **`Real`** — eager. Each method call mutates a live DOM Element immediately. Best for fluent imperative code, when you have a target node and want to manipulate it.
- **`Virtual`** — lazy. Builds a tree of `VirtualNode` descriptors in memory, materialised into real DOM only on `.append()` or `.render()`. Best for declarative trees, server-side rendering, or when you need to inspect / clone / serialise the tree before committing.

**Same fluent API**, same method names, same chainability. The only difference is when the DOM actually mutates.

```ts
// Real — DOM exists immediately
const r = new Real('button').text(() => 'Hi').on('click', fn);
document.body.appendChild(r.render());   // already a live <button>

// Virtual — DOM materialises on append
const v = new Virtual('button').text(() => 'Hi').on('click', fn);
v.append(document.body);                 // NOW the <button> exists
```

---

## 2. `Real` — fluent live DOM

### Construction

```ts
import { Real } from 'arianna';

new Real('div');                         // create <div>
new Real('#existing-id');                // wrap existing element
new Real(myElement);                     // wrap a Node reference
new Real('arianna-button');              // create custom element
new Real('button', { type: 'submit' });  // create with options
```

### Core method surface

```ts
// Render / materialise
r.render(): Element                      // get the underlying Element
r.valueOf(): Element                     // same — used by coercion

// Tree mutation
r.append(parent): this                   // append THIS as child of parent
r.add(...nodes, index?): this            // insert children at index (default: end)
r.push(...nodes): this                   // append children
r.unshift(...nodes): this                // prepend children
r.remove(...targets): this               // remove specific children
r.shift(n=1): this                       // remove n from front
r.pop(n=1): this                         // remove n from end

// Attributes / properties (smart routing — see §3)
r.set(name, value): this                 // attr OR property, case-insensitive
r.get(name): string | undefined          // read attr or property
r.sub(path): SubAccessor                 // nested dotted-path accessor

// Reactive bindings (subscribe to signal automatically)
r.text(getter): this                     // bind textContent
r.attr(name, getter): this               // bind attribute
r.prop(name, getter): this               // bind JS property
r.cls(name, getter): this                // toggle className
r.style(prop, getter): this              // bind one style property
r.style(rule): this                      // apply a Rule
r.style(sheet): this                     // apply a Stylesheet
r.style({ prop1, prop2 }): this          // apply an inline-style object

// Events
r.on(type, cb, opts?): this              // addEventListener
r.off(type, cb, opts?): this             // removeEventListener
r.fire(eventOrName, init?): this         // dispatchEvent

// Visibility
r.show(): this                           // display = ''
r.hide(): this                           // display = 'none'

// Inspection
r.contains(...nodes): boolean
r.child(path): Node                      // child(0,2,1) → childNodes[0].childNodes[2].childNodes[1]
r.log(): this                            // console.log(el), pass-through

// Conversion
r.Virtual: Virtual                       // lazy getter — convert to Virtual wrapping same element
```

### `.set()` — smart routing

`set(name, value)` looks up `name` case-insensitively. Order:

1. If an attribute with that name (case-insensitive) exists → `setAttribute`
2. Else if a JS property with that name exists → assign as property
3. Else → `setAttribute(name.toLowerCase(), value)`

Dotted paths supported: `set('dataset.userId', 42)` writes `el.dataset.userId = 42`.

```ts
new Real('input')
    .set('type', 'text')      // → setAttribute('type', 'text')
    .set('Value', 'hello')    // → matches 'value' property
    .set('dataset.id', '7');  // → el.dataset.id = '7'
```

### Reactive vs static — the `getter` convention

Every method ending in a binding (`text`, `attr`, `prop`, `cls`, `style(prop, getter)`) takes a **getter function** that runs inside an effect. Reading signals inside the getter subscribes to them automatically.

```ts
const loading = signal(false);
const colour  = signal('#e40c88');

new Real('button')
    .text(() => loading.get() ? 'Loading…' : 'Submit')   // reactive
    .style('color', () => colour.get())                  // reactive
    .attr('disabled', () => loading.get() ? '' : null)   // reactive
    .cls('busy', () => loading.get())                    // reactive
    .on('click', () => submit())                         // not reactive — event callback
    .append('#form');
```

For static (non-reactive) values, pass via constructor options or `.set()`:

```ts
new Real('button', { class: 'primary', type: 'submit' })   // static
    .set('id', 'submit-btn');                              // static
```

### Lazy `.Virtual` getter

```ts
const r = new Real('div').set('id', 'box');
const v = r.Virtual;             // VirtualNode wrapping the same underlying element
v.append('#app');                // same effect as r.append('#app')
```

Both wrappers share the **same** Element. Changing via one is visible through the other.

---

## 3. `Virtual` — declarative tree

### Construction

```ts
import { Virtual } from 'arianna';

new Virtual('div');                      // creates VirtualNode for <div>
new Virtual('span', { class: 'x' });     // with attrs
new Virtual('ul')                        // tree-style children
    .child(new Virtual('li').text(() => 'a'))
    .child(new Virtual('li').text(() => 'b'));
```

### Same API surface as Real

`Virtual` mirrors every fluent method on `Real`: `.set`, `.text`, `.attr`, `.prop`, `.cls`, `.style`, `.on`, `.append`, `.child`, `.add`, `.remove`. The difference is **timing**.

### Materialisation

```ts
const v = new Virtual('section')
    .child(new Virtual('h1').text(() => 'Welcome'))
    .child(new Virtual('p').text(() => 'To AriannA'));

// At this point: nothing in DOM.

v.render();              // → returns the materialised Element (one-shot)
v.append('#app');        // → materialises AND appends to '#app'
v.mount('#app');         // → alias of append + idempotency guard
```

After materialisation, the underlying Element is cached. Subsequent calls return the same Element.

### When to use Virtual vs Real

| Use case | Choice |
|----------|--------|
| Building a button on `<body>` directly | **Real** — eager is simpler |
| Building a deeply nested tree to insert later | **Virtual** — declarative reads better |
| SSR (server-side rendering) | **Virtual** — `renderToString(tree)` traverses the descriptor tree |
| You want to inspect / clone / mutate the tree before commit | **Virtual** |
| JSX with `@dom-render: real` (default) | **Real** |
| JSX with `@dom-render: virtual` (pragma) | **Virtual** |
| Inside a Component's `build()` returning a template string | Neither — `template = '...'` is parsed differently (see Template doc) |

---

## 4. Use inside components

In a `Component(...)` factory class, `Real` and `Virtual` are still available for one-off DOM construction inside `build()`, but the **declared `template` property** is the canonical way to define the component's content (see `COMPONENT_CONVENTIONS.md` §4.7).

```ts
class MyCard extends Component('arianna-card', HTMLElement, css, { attrs: ['title'] }) {
    template = `
        <h2>{{ this.getAttribute('title') }}</h2>
        <slot></slot>
    `;

    build() {
        // OK to use Real/Virtual here for extra dynamic structure,
        // but for the main visual tree prefer the template above.
        const dynamicWidget = new Real('div')
            .cls('widget', () => true)
            .append(this.Shadow.Root);
    }
}
```

---

## 5. Conversion table

| Want                                          | Real form                                   | Virtual form                                            |
|-----------------------------------------------|---------------------------------------------|---------------------------------------------------------|
| Create element                                | `new Real('button')`                        | `new Virtual('button')`                                 |
| Static attribute                              | `.set('type', 'submit')`                    | `.set('type', 'submit')`                                |
| Reactive attribute                            | `.attr('disabled', () => busy())`           | `.attr('disabled', () => busy())`                       |
| Reactive text                                 | `.text(() => msg())`                        | `.text(() => msg())`                                    |
| Reactive class                                | `.cls('active', () => on())`                | `.cls('active', () => on())`                            |
| Reactive style property                       | `.style('color', () => clr())`              | `.style('color', () => clr())`                          |
| Apply a Rule / Stylesheet                     | `.style(myRule)` / `.style(mySheet)`        | `.style(myRule)` / `.style(mySheet)`                    |
| Add event listener                            | `.on('click', fn)`                          | `.on('click', fn)`                                      |
| Append to parent                              | `.append('#app')`                           | `.append('#app')`                                       |
| Add nested child                              | `.add(childReal)`                           | `.child(childVirtual)`                                  |
| Materialise (get the live Element)            | `.render()` (already live)                  | `.render()` (forces materialisation)                    |
| Get the other form wrapping same element      | `r.Virtual`                                  | `v.Real`                                                |

The two APIs are **isomorphic** — any code written in Real translates one-for-one to Virtual and vice versa.

---

## 6. Performance notes

- **Real** allocates the Element immediately. Each `.text(getter)` registers an effect — N effects for N reactive bindings on the element.
- **Virtual** allocates only descriptor objects until `.render()` / `.append()`. Materialisation registers effects in one batch.
- For a typical UI (≤1000 reactive bindings active simultaneously) the difference is negligible. Both outperform VDOM diffing by 1-2 orders of magnitude because there is **no diffing phase** — each signal change drives exactly one DOM mutation.

See `js-framework-benchmark` results in the main README.

---

# Part III — Component Lifecycle


**Purpose**: precise ordering of every hook, browser callback, and internal step from `new MyClass()` through DOM removal. Reference this when debugging "why isn't my hook firing" or "why is my style applied at the wrong moment".

---

## 1. Full lifecycle pipeline

```
                             ┌────────────────────────────────────┐
                             │  CLASS DEFINITION TIME (once)      │
                             ├────────────────────────────────────┤
                             │  • Component(tag, Base, css, def)  │
                             │    parses the css argument          │
                             │    into Sheet.Default               │
                             │  • template string parsed into     │
                             │    <template> element + cached      │
                             │  • customElements.define(tag, Bound)│
                             └────────────────────────────────────┘
                                          │
                                          ▼
═══════════════════════════════════════════════════════════════════════════
                         PER-INSTANCE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════

    new MyClass(opts)
         │
         ▼
┌──────────────────────────┐
│  Native constructor      │   Base HTMLElement constructor runs
│  (HTMLElement super)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Facilities installed    │   • __ariannaCustom marker set
│                          │   • attrSignal accessor patched onto element
│                          │   • _children accessor (if def.bus configured)
│                          │   • Sheet.Current = clone(Sheet.Default)
│                          │   • Shadow root attached (closed by default)
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onCreated()             │   user hook  ⚠ NOT YET WIRED (see §4)
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Template instantiation  │   • <template>.content.cloneNode(true)
│                          │   • directives bound (a-if, a-for, @click, etc.)
│                          │   • shadowRoot.appendChild(clone)
│                          │   • Sheet.Current attached to shadowRoot
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  build(opts)             │   user hook — invoked synchronously
│                          │     opts: whatever was passed to new MyClass(opts)
│                          │   • register signals, effects
│                          │   • additional Real/Virtual nodes
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onBeforeMount()         │   user hook  ⚠ NOT YET WIRED (see §4)
└──────────┬───────────────┘
           │
═══════════ DOM INSERTION (browser-driven) ════════════════════════════════
           │
           ▼
┌──────────────────────────┐
│  connectedCallback       │   browser fires when element enters DOM
│  (Web Components std)    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onMount()               │   ✅ user hook — WIRED & invoked
│                          │   • global event listeners
│                          │   • timers, animations
│                          │   • IntersectionObserver, etc.
└──────────┬───────────────┘
           │
═══════════ RUNTIME ═══════════════════════════════════════════════════════
           │
           ▼
┌──────────────────────────┐
│  attributeChangedCallback│   browser fires per observed attribute change
│                          │   • attrSignal[name].set(newValue)
│                          │   • subscribed effects re-run
│                          │   • template bindings update
└──────────┬───────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Signal change   │   effect re-runs
   │ inside effect   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ onBeforeUpdate()│   user hook  ⚠ NOT YET WIRED (see §4)
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ DOM mutation    │   sink writes value to DOM
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ onUpdate()      │   user hook  ⚠ NOT YET WIRED (see §4)
   └─────────────────┘
            │
═══════════ DOM REMOVAL (browser-driven) ══════════════════════════════════
            ▼
┌──────────────────────────┐
│  onBeforeUnmount()       │   user hook  ⚠ NOT YET WIRED (see §4)
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  disconnectedCallback    │   browser fires when element leaves DOM
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Internal cleanup        │   • all __disposers (effects from build) run
│                          │   • all __unmountFns run
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  onUnmount()             │   ✅ user hook — WIRED & invoked
│                          │   • clear timers
│                          │   • remove global listeners
│                          │   • cancel async ops
└──────────────────────────┘
```

---

## 2. The two hooks that work today

As of the current implementation, **only `onMount()` and `onUnmount()` are wired** to fire user code. The other five are declared on the interface but not yet invoked by the runtime.

```ts
class MyCmp extends Component('arianna-mycmp', HTMLElement, css, { attrs: ['name'] }) {
    template = `<div>{{ this.name() }}</div>`;

    timerId: number | null = null;

    build(opts) {
        // ✅ ALWAYS RUNS — entry point for setup
        console.log('build', opts);
    }

    onMount() {
        // ✅ RUNS when element enters DOM
        this.timerId = window.setInterval(() => this.tick(), 1000);
        window.addEventListener('resize', this.onResize);
    }

    onUnmount() {
        // ✅ RUNS when element leaves DOM
        if (this.timerId !== null) clearInterval(this.timerId);
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => { /* ... */ };
    tick     = () => { /* ... */ };
}
```

**Symmetry rule** (mandatory): everything you set up in `onMount` MUST be torn down in `onUnmount`. The framework runs internal `__disposers` for you (effects from `build()`), but global listeners, timers, observers, and external subscriptions are your responsibility.

---

## 3. `build(opts)` — the main entry point

`build` runs **after** facilities are installed (attrSignal, shadow root, Sheet) and **after** the template is parsed into the shadow root. It's where you:

1. Capture attribute signals: `const name = this.attrSignal('name')`
2. Initialise private reactive state: `const count = signal(0)`
3. Register effects: `effect(() => console.log(count.get()))`
4. Add extra DOM not covered by `template` (rare — prefer template)
5. Wire imperative listeners not covered by `@click=...` template directives (rare)

```ts
class Counter extends Component('arianna-counter', HTMLElement, {
    ':host': { display: 'inline-flex', gap: '8px', padding: '8px' },
}, { attrs: ['start'] }) {
    template = `
        <button @click="this.dec">-</button>
        <span>{{ this.count() }}</span>
        <button @click="this.inc">+</button>
    `;

    count = signal(0);
    inc   = () => this.count.set(this.count() + 1);
    dec   = () => this.count.set(this.count() - 1);

    build(opts) {
        // Read initial value from attribute, fall back to opts
        const startAttr = this.attrSignal('start').get();
        const startNum  = startAttr ? parseInt(startAttr, 10) : (opts?.start ?? 0);
        this.count.set(startNum);
    }

    onMount()   { console.log('counter mounted'); }
    onUnmount() { console.log('counter removed'); }
}
```

`opts` is `undefined` when the element is created via HTML or `document.createElement(...)`. It is the object literal you pass when using `new Counter({...})` or `new Component('arianna-counter', {...})`.

---

## 4. What about the other five hooks?

The interface declares `onCreated`, `onBeforeMount`, `onBeforeUpdate`, `onUpdate`, `onBeforeUnmount` but the current runtime does **not** invoke them. This is a known gap — the hooks are reserved in the API surface but their wiring is pending.

**Current safe pattern**: use only `build`, `onMount`, `onUnmount`. Treat the others as future-reserved.

**If a user adds them**, they will not throw — they simply will not fire. Plan migrations accordingly.

When wired, the intended semantics are:

| Hook | When | Use case |
|------|------|----------|
| `onCreated()` | After ctor + facilities, **before** `build()` | Set up data not derived from attrs |
| `onBeforeMount()` | After `build()`, **before** DOM insertion | Capture slot content references |
| `onBeforeUpdate(prev, next)` | Before a reactive re-render writes the DOM | Snapshot scroll position, focus |
| `onUpdate(prev, next)` | After the reactive re-render | Restore scroll, refocus |
| `onBeforeUnmount()` | Just before `disconnectedCallback` | Animate-out, save state |

---

## 5. The attr → signal → DOM chain

When a `def.attrs` declares an attribute (e.g. `['variant']`), three things are set up:

```
                    user mutation                template binding
    setAttribute  ────────────────►  Signal  ◄────────────────  {{ this.variant() }}
                                       │
                                       │ effect re-runs
                                       ▼
                                  DOM updated
```

Three paths to mutate, all converge on the same Signal, all trigger the same downstream effects:

```ts
// Path 1: HTML attribute → JS
myBtn.setAttribute('variant', 'primary');
//   → browser fires attributeChangedCallback
//   → AriannA writes attrSignals['variant'].set('primary')
//   → effects re-run, template re-renders

// Path 2: JS property → JS (if you defined a setter that wraps setAttribute)
myBtn.variant = 'primary';

// Path 3: Direct signal write
myBtn.attrSignal('variant').set('primary');
//   → still keeps the HTML attribute in sync (signal listener writes attr)
```

This is why **declaring an attr in `def.attrs` is enough** — you don't need to write `attributeChangedCallback` or `observedAttributes`. The framework wires both directions.

---

## 6. Cleanup guarantees

Inside `build()`, every `effect(...)` you register is auto-disposed when the component unmounts. Same for sinks (`Real.text(getter)`, `r.cls`, `r.attr`, `r.style`). You do NOT need to manually dispose them.

You ARE responsible for cleanup of:

- `window.setInterval` / `setTimeout` → `clearInterval` / `clearTimeout`
- `window.addEventListener` → `window.removeEventListener`
- `IntersectionObserver` / `MutationObserver` / `ResizeObserver` → `.disconnect()`
- `fetch` AbortControllers → `.abort()`
- WebSocket / SSE → `.close()` / `.removeEventListener`
- Third-party library subscriptions → their own dispose

Pattern:

```ts
class Watcher extends Component('arianna-watcher', HTMLElement, css) {
    template = `<slot></slot>`;
    #io?: IntersectionObserver;

    onMount() {
        this.#io = new IntersectionObserver((entries) => {
            for (const e of entries) console.log(e.isIntersecting);
        });
        this.#io.observe(this);
    }

    onUnmount() {
        this.#io?.disconnect();
        this.#io = undefined;
    }
}
```

---

## 7. Class-definition vs instance order

Two distinct phases, separated by a clean boundary.

```
─────────────────────────────────────────────────────────────────
PHASE A — class definition (runs once when the file loads)
─────────────────────────────────────────────────────────────────
  1. Component(tag, Base, css, def) factory invoked
  2. Bound class created
  3. css argument → Stylesheet → Bound.Sheet.Default
  4. template string property → parsed into <template> element, cached on class
  5. customElements.define(tag, Bound) — element registered with browser

─────────────────────────────────────────────────────────────────
PHASE B — instance lifecycle (runs N times, once per element)
─────────────────────────────────────────────────────────────────
  6. new MyClass(opts) or <my-tag> in HTML
  7. Native HTMLElement constructor
  8. AriannA facilities installed
     (attrSignals, _children, shadowRoot, Sheet.Current clone)
  9. (onCreated — pending)
  10. <template>.content.cloneNode(true) → shadowRoot
      directive bindings wired
      Sheet.Current.attach(shadowRoot)
  11. build(opts) ✅
  12. (onBeforeMount — pending)
  13. connectedCallback (browser)
  14. onMount() ✅
  15. ... runtime ...
  16. (onBeforeUnmount — pending)
  17. disconnectedCallback (browser)
  18. internal cleanup (effects, unmountFns)
  19. onUnmount() ✅
```

Steps 1–5 happen once per file load. Steps 6–19 happen once per element instance.

---

# Part IV — Template Directives


**Purpose**: exhaustive reference for the template parser. Every directive, every modifier, every expression context rule. Complements `COMPONENT_CONVENTIONS.md` §4.7.

---

## 1. Where templates run

Templates are strings of HTML augmented with directives. They appear in three contexts:

```ts
// (a) Class property — Vue-style (recommended)
class MyCmp extends Component(...) {
    template = `
        <button @click="this.onClick">{{ this.label() }}</button>
    `;
}

// (b) Tagged template literal — html`...`
import { html } from 'arianna';
this.template = html`
    <button @click=${this.onClick}>${this.label()}</button>
`;

// (c) Directive.bootstrap() on existing DOM
import { Directive } from 'arianna';
Directive.bootstrap(document.getElementById('app'), { loggedIn: true });
```

All three use the same directive set. The parser is `core/Template.ts`.

---

## 2. Expression context

Inside any directive value (between `"..."` of attributes, or inside `{{ }}`):

- **`this`** refers to the **component instance** when the template is owned by a Component
- **`this`** refers to the **scope object** when the template is bootstrapped via `Directive.bootstrap(root, scope)`
- Local JavaScript variables from the surrounding `build()` function are **NOT** accessible — the template parser does not capture closures

```ts
class MyCmp extends Component(...) {
    template = `<span>{{ this.greeting() }}</span>`;

    greeting = signal('Hello');

    build() {
        const localVar = 'this is local';
        // ❌ {{ localVar }}  — does NOT work, parser doesn't see closures
        // ✅ {{ this.greeting() }}  — works, this = component instance
    }
}
```

Signals must be **invoked** (`{{ this.count() }}`) or read via `.get()` (`{{ this.count.get() }}`). Bare references `{{ this.count }}` print the Signal object as `[object Object]`.

---

## 3. Interpolation — `{{ expr }}`

Reactive text interpolation. The expression is re-evaluated whenever any signal it reads changes.

```html
<span>{{ this.name() }}</span>
<p>Hello, {{ this.user.firstName + ' ' + this.user.lastName }}!</p>
<div>Score: {{ this.score() * 2 }}</div>
```

Whitespace inside `{{ }}` is trimmed. Multi-line expressions are allowed.

---

## 4. Attribute & property bindings

### `:attr="expr"` — reactive attribute

```html
<img :src="this.avatar()" :alt="this.userName()">
<a :href="this.targetUrl()">Link</a>
<input :value="this.text()">
```

Re-evaluates on signal change, writes via `setAttribute`. Pass `null` to remove the attribute.

### `.prop="expr"` — reactive JS property

For properties not exposed as attributes (`.value` of input is reflected, but `.checked` is not, etc.):

```html
<input .checked="this.isOn()">
<select .value="this.selected()">
<video .currentTime="this.seekTo()">
```

Re-evaluates on signal change, assigns via `element[prop] = value`.

### `?attr="expr"` — boolean attribute toggle

```html
<button ?disabled="this.loading()">Submit</button>
<input ?required="this.isRequired()">
<details ?open="this.expanded()">…</details>
```

Truthy → `setAttribute(name, '')`. Falsy → `removeAttribute(name)`.

---

## 5. Event listeners — `@event` and modifiers

```html
<button @click="this.handleClick">Click</button>
<form @submit="this.onSubmit">…</form>
<input @input="this.onInput">
```

The handler is invoked with the standard DOM `Event` object as its first argument. `this` inside the handler is the component instance (use arrow functions or class property arrows to preserve binding).

### Event modifiers — `.modifier` chain

| Modifier | Effect |
|----------|--------|
| `.stop` | calls `event.stopPropagation()` before handler runs |
| `.prevent` | calls `event.preventDefault()` before handler runs |
| `.self` | only fires if `event.target === element` (filters bubbled events) |
| `.once` | listener auto-removes after first call (passed to `addEventListener({once:true})`) |
| `.capture` | uses capture phase (`addEventListener({capture:true})`) |
| `.passive` | passive listener — handler cannot call `preventDefault` (`{passive:true}`) |

Examples:

```html
<a @click.prevent="this.navigate">Stay on page</a>
<button @click.stop="this.delete">Won't bubble to parent</button>
<form @submit.prevent="this.submitAjax">Submit via fetch</form>
<div @scroll.passive="this.onScroll">Performant scroll listener</div>
<button @click.once="this.acknowledge">Auto-removes after first click</button>
<div @click.self="this.handleSelf">Ignores clicks from children</div>
```

Modifiers chain: `@click.stop.prevent="this.fn"` does both.

---

## 6. Conditional rendering — `a-if` / `a-else-if` / `a-else`

```html
<div a-if="this.loggedIn()">
    Welcome, {{ this.userName() }}
</div>
<div a-else-if="this.guest()">
    Hi guest
</div>
<div a-else>
    Please log in
</div>
```

**Rules**:

- `a-else-if` and `a-else` must be **immediate next-sibling elements** of `a-if` (or each other). Any text node in between breaks the chain — use careful formatting.
- The element and all its descendants are **removed from the DOM** when the condition is false (not just hidden). Use `a-show` if you want the element to stay in the tree with `display: none`.
- Re-evaluation: signal change inside `a-if` expression re-runs the conditional, materialising or destroying the subtree.

---

## 7. List rendering — `a-for` / `a-foreach`

### `a-for` — arrays

```html
<ul>
    <li a-for="planet in this.planets()">{{ planet.name }}</li>
</ul>

<!-- With index -->
<li a-for="item, i in this.items()">{{ i }}. {{ item.name }}</li>

<!-- Nested -->
<div a-for="user in this.users()">
    <h3>{{ user.name }}</h3>
    <ul>
        <li a-for="tag in user.tags">{{ tag }}</li>
    </ul>
</div>
```

Loop variables (`planet`, `i`, `item`, `tag` in the examples above) are scoped to the element they're declared on and its descendants. They shadow `this` properties of the same name.

### `a-foreach` — object iteration

```html
<ol>
    <li a-foreach="key in this.scores()">
        {{ key }}: {{ this.scores()[key] }}
    </li>
</ol>
```

Iterates `Object.keys(obj)`. Loop variable is the **key string**; access values via `this.scores()[key]`.

### Keying

The list parser uses **identity-based diffing** — if your array items have stable references, additions/removals/reorders are efficient. For data that recreates objects on each update (e.g. JSON.parse), consider keeping a stable signal-of-arrays pattern.

---

## 8. Looping — `a-while`

```html
<div a-while="this.count() < 5">
    {{ this.count.update(c => c + 1) }}
</div>
```

Renders the element repeatedly while the expression is truthy. Less common than `a-for`/`a-foreach`; useful for unbounded generators.

---

## 9. Multi-branch — `a-switch` / `a-case` / `a-default`

```html
<div a-switch="this.tab()">
    <div a-case="'profile'">…profile content…</div>
    <div a-case="'settings'">…settings content…</div>
    <div a-case="'billing'">…billing content…</div>
    <div a-default>Pick a tab</div>
</div>
```

The expression on `a-switch` is evaluated. Each child `a-case` value is compared with `===`. The first match renders; if none, `a-default` (if present) renders.

---

## 10. Visibility & text content

| Directive | Effect |
|-----------|--------|
| `a-show="expr"` | toggles `display` (`''` ↔ `none`). Element stays in DOM. |
| `a-text="expr"` | sets `textContent` (XSS-safe). Alternative to `{{ expr }}`. |
| `a-html="expr"` | sets `innerHTML` (⚠ XSS risk — sanitise inputs). |

```html
<div a-show="this.visible()">Soft-hidden when false</div>
<p a-text="this.greeting()"></p>
<div a-html="this.markdown()"></div>
```

---

## 11. Reactive classes & styles

### `a-class="{name: expr, ...}"` — conditional classes

```html
<div a-class="{
    active   : this.isActive(),
    disabled : !this.ready(),
    'has-error' : this.error() !== null
}">…</div>
```

The expression is an object literal: keys are class names, values are boolean expressions. True → class added, false → class removed.

### `a-style="{prop: expr, ...}"` — reactive inline styles

```html
<div a-style="{
    color           : this.theme.text,
    backgroundColor : this.theme.bg(),
    fontSize        : this.fontSize() + 'px'
}">…</div>
```

camelCase property names. Re-evaluates on signal change.

---

## 12. Two-way binding — `a-model`

For form controls, binds the input value to a path on `this` in both directions:

```html
<input    a-model="this.user.name"            placeholder="Name">
<input    a-model="this.user.age"  type="number">
<input    a-model="this.theme.color" type="color">
<select   a-model="this.settings.lang">
    <option value="it">Italiano</option>
    <option value="en">English</option>
</select>
<textarea a-model="this.post.body"></textarea>
<input    a-model="this.subscribe" type="checkbox">
```

The path on the right is a property path on `this`. AriannA picks the right event automatically: `input` for text inputs, `change` for selects, `change` for checkboxes.

For State scopes:

```ts
Directive.bootstrap(app, new State({ user: { name: 'Riccardo' } }));
```

```html
<input a-model="user.name">   <!-- writes to state.State.user.name -->
```

---

## 13. One-way bindings — `a-bind`, `a-on`

These are the **programmatic** forms of `:attr` and `@event`, used when the binding target is dynamic.

### `a-bind="prop:source"`

```html
<span  a-bind="textContent:userName"></span>
<img   a-bind="src:avatarUrl"   alt="Avatar">
<input a-bind="value:email"     placeholder="Email">
<div   a-bind="className:cssClass">Styled</div>
<div   a-bind="innerHTML:richHtml"></div>
```

Left of `:` is the target property/attribute; right of `:` is the source key on `this` or the scope.

### `a-on="event:handler"`

```html
<button a-on="click:onSave">Save</button>
<input  a-on="input:onTyping">
```

Less ergonomic than `@click="..."` but useful when the event name is computed.

---

## 14. Slots — shadow DOM projection

```html
<!-- Component template -->
<div class="card">
    <slot name="header"></slot>
    <div class="body">
        <slot>Default body content</slot>
    </div>
    <slot name="footer"></slot>
</div>
```

```html
<!-- Usage -->
<arianna-card>
    <h1 slot="header">Title</h1>
    <p>This goes into the default slot</p>
    <button slot="footer">OK</button>
</arianna-card>
```

`<slot>` is the standard Shadow DOM slot. Default slot receives anything without `slot="..."`. Named slots receive `<x slot="name">`. Fallback content inside `<slot>...</slot>` renders when no children are provided.

---

## 15. Programmatic directives — `Directive.X(...)`

When the template approach doesn't fit (dynamic DOM, non-component code), use the imperative API. Every directive listed above has a programmatic counterpart that returns an `update()` function.

| Method | Signature |
|--------|-----------|
| `Directive.if`        | `(el, condition, then, else?)` |
| `Directive.for`       | `(el, items, template)` |
| `Directive.foreach`   | `(el, obj, template)` |
| `Directive.while`     | `(el, condition, body)` |
| `Directive.switch`    | `(el, value, cases)` |
| `Directive.bind`      | `(el, prop, source)` |
| `Directive.model`     | `(el, state, key)` |
| `Directive.show`      | `(el, condition)` |
| `Directive.on`        | `(el, types, handler, opts?)` |
| `Directive.template`  | `(el, scope)` — interpolate `{{ }}` in innerHTML |
| `Directive.register`  | `(name, { mounted, unmounted })` — custom directive |
| `Directive.apply`     | `(name, el, value)` — apply registered |
| `Directive.bootstrap` | `(root, scope)` — wire all `a-*` attrs in tree |

Example:

```ts
import { Directive, State } from 'arianna';

const scope = new State({
    loggedIn: false,
    items   : ['apple', 'banana'],
});

Directive.bootstrap(document.getElementById('app'), scope);
// → all a-if, a-for, a-model, @click in #app subtree are wired
```

---

## 16. Custom directives

```ts
Directive.register('tooltip', {
    mounted(el, value) {
        el.setAttribute('title', value);
        el.style.cursor = 'help';
    },
    unmounted(el) {
        el.removeAttribute('title');
    },
});
```

Use it declaratively in any template:

```html
<button a-tooltip="Save your work">Save</button>
```

Or imperatively:

```ts
Directive.apply('tooltip', myButton, 'Save your work');
```

---

## 17. Safe parsing mode

For untrusted templates (user-provided strings), use `Template.safe(str)` instead of plain string assignment. It activates a restricted Pratt parser that:

- Blocks `Function`, `eval`, `__proto__`, `constructor` access
- Disallows expression chaining via `,`
- Caps expression depth

```ts
const userTemplate = await fetch('/api/template').then(r => r.text());
this.template = Template.safe(userTemplate);
```

Default (unsafe) parser is fine for hardcoded templates inside your own components.

---

## 18. Quick-reference cheat sheet

```html
<!-- Interpolation -->
{{ expr }}

<!-- Bindings -->
:attr="expr"          .prop="expr"          ?bool="expr"

<!-- Events -->
@event="fn"           @event.stop.prevent="fn"
@event.once="fn"      @event.self="fn"
@event.capture="fn"   @event.passive="fn"

<!-- Conditional -->
<x a-if="cond">       <x a-else-if="cond">  <x a-else>

<!-- Loops -->
<x a-for="item in arr">           <x a-for="item, i in arr">
<x a-foreach="key in obj">        <x a-while="cond">

<!-- Multi-branch -->
<x a-switch="val">  <y a-case="v1">  <y a-default>

<!-- Visibility & content -->
<x a-show="cond">     <x a-text="expr">     <x a-html="expr">

<!-- Dynamic classes / styles -->
<x a-class="{cls: cond}">   <x a-style="{prop: val}">

<!-- Binding & model -->
<x a-bind="prop:source">  <x a-model="path">  <x a-on="event:handler">

<!-- Slots -->
<slot>  <slot name="X">  <slot>fallback</slot>
```

---

# Part V — Component Conventions


**Version**: 2.0 (revision 2026-05-19, supersedes 2026-05-16)
**Status**: Authoritative reference for all 137 component migrations
**Author**: Riccardo Angeli

---

## 0. Why this document exists

The 137 components in `components/*` currently follow three different conventions, requiring unification. This document defines the **single canonical pattern** all components must follow — and locks the four `Component()` constructor signatures plus the six instantiation forms.

---

## 1. Decisions (frozen)

| # | Decision | Choice |
|---|----------|--------|
| Q1 | Tag naming convention | **kebab-case full multi-word**: `arianna-text-field`, `arianna-color-picker` |
| Q2 | Slot projection | **Shadow DOM by default** (closed) — unified `<slot>` API; light DOM is opt-out only |
| Q3 | Styling | **`Sheet.Default` / `Sheet.Current` (type `Stylesheet`)** — set via `Component(...)` 3rd arg; inheritable by subclasses |
| Q4 | Lifecycle hooks | **Full Vue-like**: onCreated, onBeforeMount, onMount, onBeforeUpdate, onUpdate, onBeforeUnmount, onUnmount |
| Q5 | `Component()` signatures | **Two**: factory (`Component(tag, Base, css?, def?)`) + constructor (`new Component(tag, opts?)`) |
| Q6 | Instantiation forms | **Six**: HTML markup, `new Real('tag')`, `new Virtual('tag')`, `new Component('tag', opts?)`, `new MyClass()`, `document.createElement('tag')` |
| Q7 | Template syntax | **Two equivalent approaches**, both first-class: (A) Vue-style `<template>` + `style` as string class properties (recommended); (B) `html\`...\`` tagged template literal. Both use the same `<template>` + `cloneNode` machinery and support the same directive set. |

---

## 2. Tag naming

### Rules
- Always prefixed `arianna-`
- Kebab-case with full word separation
- Multi-word components NEVER compacted

### Examples

| Class name (TS) | Custom element tag |
|-----------------|--------------------|
| `Button`        | `arianna-button`   |
| `TextField`     | `arianna-text-field` |
| `ColorPicker`   | `arianna-color-picker` |
| `RichTextEditor`| `arianna-rich-text-editor` |
| `CandlestickChart` | `arianna-candlestick-chart` |
| `DHLTracker`    | `arianna-dhl-tracker` |
| `PianoRoll`     | `arianna-piano-roll` |
| `NodeEditor`    | `arianna-node-editor` |

### Forbidden
❌ `arianna_button`, `arianna-Button`, `ariannabutton`, `ar-button`, `arianna-textfield`

---

## 3. The `Component(...)` API — two signatures

### Signature A — Factory: `Component(tag, Base, css?, def?)`

Used to **define** a new custom element. Returns a class to be extended.

```typescript
import { Component } from '../../core/Component.ts';
import { Rule }      from '../../core/Rule.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';

class Button extends Component(
    'arianna-button',           // 1. tag
    HTMLElement,                // 2. Base class (constructor function or AriannA class)
    {                           // 3. css — used to seed Sheet.Default (see §4.8)
        ':host':                 { display: 'inline-flex', padding: '5px 14px' },
        ':host([variant="primary"])': { background: 'var(--arianna-primary, #1f6feb)' },
    },
    {                           // 4. def — { attrs, shadow, bus, render }
        attrs : ['variant', 'size', 'icon', 'disabled'],
        shadow: 'closed',       // default — see §4.5
    }
) {
    build(opts) { /* ... */ }
}
```

**Argument 2 (`Base`)** is a constructor function. Accepted forms:
- Built-in: `HTMLElement`, `HTMLDivElement`, `HTMLInputElement`, `HTMLButtonElement`, `SVGSVGElement`, `MathMLElement`, …
- **A previously-defined `Component(...)` class** — for subclassing (see §4.8)
- **Plain function constructor**: `function MyBase() { this.x = 1 }` — same surface as `Core.Define(tag, fn)`, supported here too

Example with plain function constructor:

```typescript
function MyCardBase() {
    this.textContent = 'Hello';
    this.role        = 'group';
}

// All three are equivalent — they all register the same custom element:
Component('arianna-card', MyCardBase);                       // factory form, no extends
Core.Define('arianna-card', MyCardBase);                     // explicit registration
class Card extends Component('arianna-card', MyCardBase) {}  // factory + extends
```

When `Component(tag, plainFn)` is used **without** a class body to extend, it registers immediately and returns the underlying `Bound` class — useful when you don't need lifecycle hooks, just a tag-to-function binding.

**Argument 3 (`css`)** is the **Sheet.Default seed**. Five accepted forms — see §4.8.

**Argument 4 (`def`)** is the component definition object: `{ attrs, shadow, bus, render }` — see §4.5.

### Signature B — Constructor: `new Component(tag, opts?)`

Used to **instantiate** a custom element. Returns a `ComponentWrapper` exposing `.Real` and `.Virtual` over the same underlying element.

```typescript
const component = new Component('arianna-counter', { initial: 5 });

component.element;                    // → Element (the live DOM node)
component.tag;                        // → 'arianna-counter'

// .Real (eager) — live DOM, fluent API
component.Real.set('variant', 'primary')
             .style('color', () => 'red')
             .on('click', e => console.log(e))
             .append('#app');

// .Virtual (lazy) — virtual node, materialised on access, same underlying element
component.Virtual.append('#app');

// valueOf() / render() — return the underlying Element
component.render();
```

`opts` is applied as attributes/properties on the new element (case-insensitive, like `Real.set`).

---

## 4. Detailed conventions

### 4.1 Options interface

- Named `<ClassName>Options`
- All fields optional
- TypeScript literal unions for enums
- camelCase keys (mirrored to kebab attributes)

```typescript
export interface ButtonOptions {
    variant?  : 'default' | 'primary' | 'danger' | 'ghost' | 'link';
    size?     : 'sm' | 'md' | 'lg';
    icon?     : string;
    disabled? : boolean;
}
```

### 4.2 Class declaration — canonical shape

```typescript
import { Component } from '../../core/Component.ts';
import { Rule }      from '../../core/Rule.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';

export interface ButtonOptions {
    variant? : 'default' | 'primary' | 'danger' | 'ghost' | 'link';
    size?    : 'sm' | 'md' | 'lg';
    icon?    : string;
    disabled?: boolean;
}

export class Button extends Component(
    'arianna-button',
    HTMLElement,
    {                       // css → Sheet.Default (auto-applied)
        ':host': {
            display      : 'inline-flex',
            alignItems   : 'center',
            padding      : '5px 14px',
            background   : 'var(--arianna-bg-3, #f3f3f3)',
            border       : '1px solid var(--arianna-border, #d8d8d8)',
            borderRadius : 'var(--arianna-radius, 6px)',
            cursor       : 'pointer',
        },
        ':host([variant="primary"])': {
            background: 'var(--arianna-primary, #1f6feb)',
            color     : '#fff',
        },
        ':host([disabled])': {
            cursor : 'not-allowed',
            opacity: '0.45',
        },
    },
    {
        attrs : ['variant', 'size', 'icon', 'disabled'],
        shadow: 'closed',   // default — explicit for clarity
        bus   : null,
    }
) {
    // ── Template (Vue-style: plain string, parsed once at class level) ──
    template = `
        <slot name="icon"></slot>
        <span class="label"><slot>Default label</slot></span>
        <slot name="trailing"></slot>
    `;

    // ── build() — only imperative wiring (signals, listeners) ──
    build(opts: ButtonOptions = {})
    {
        const variant = this.attrSignal('variant');
        const size    = this.attrSignal('size');

        // No need to assign template here — it's a class property (above).
        // No need to assign Sheet.Default — the factory css argument already
        // populated Button.Sheet.Default. Each instance starts with
        // Sheet.Current = Sheet.Default (auto-applied).
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get disabled(): boolean  { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Button', {
        value: Button, writable: false, enumerable: false, configurable: false,
    });
}

export default Button;
```

### 4.3 `attrs` — reactive attribute list

Each becomes observed attribute + `Signal<string|null>` via `this.attrSignal(name)` + auto-reflective property.

### 4.4 `shadow` — projection backend (default `'closed'`)

| Value | Behaviour |
|-------|-----------|
| `'closed'` (default) | Shadow DOM closed, accessible via `comp.Shadow.Root` only |
| `'open'` | Shadow DOM open, accessible via `comp.shadowRoot` |
| `false` | Light DOM — opt-out only; `:host` rules will be rewritten to tag selector |

**Important**: shadow DOM is the default. `:host` rules work natively. `DefaultSheet()` rules using `:host`/`:root` selectors render correctly without manual rewriting.

`<slot>` syntax is identical in both modes.

### 4.5 `bus` — sub-component registration

When this is a CHILD that registers with a parent ancestor:

```typescript
class Tab extends Component('arianna-tab', HTMLDivElement, {}, {
    bus: 'arianna-tabs',
}) {}

// Form A (Vue-style class property):
class Tabs extends Component('arianna-tabs', HTMLDivElement) {
    template = `
        <slot></slot>
        <div>{{ this._children.length }} tabs</div>
    `;
}

// Equivalent Form B (html tagged template):
import { html } from '../../core/Template.ts';
class TabsB extends Component('arianna-tabs', HTMLDivElement) {
    build() {
        this.template = html`
            <slot></slot>
            <div>{{ this._children.length }} tabs</div>
        `;
    }
}
```

Two `<arianna-tabs>` on the page → separate child registries.

### 4.6 `build(opts)` — main render hook

Order inside `build()`:
1. Capture attribute signals (`this.attrSignal('name')`)
2. Initialise private reactive state (`signal(0)`, `computed(...)`)
3. **(only if dynamic)** Assign `this.template = '...'` if template depends on `opts`. Otherwise declare `template` as class property (preferred — see §4.7).
4. **Optionally** override `this.Sheet.Current = customSheet` (rare — most components use the factory `css` arg)
5. Wire DOM-level listeners not covered by template `@click="..."`

**MUST NOT**: manipulate `innerHTML` directly, use `data-r`, call `_set/_get`, use rAF for re-render.

**Both supported**: Vue-style class-property `template = '...'` (approach A) AND `html\`...\`` tagged template (approach B). See §4.7 for trade-offs.

### 4.7 Template + Style — two supported approaches

AriannA supports **two equivalent ways** to declare the visual structure of a component. Both are first-class and both render to the same shadow DOM tree.

#### Approach A — `<template>` + `style` as string class properties (Vue-style, recommended)

```typescript
class Button extends Component('arianna-button', HTMLElement, {...}, { attrs: [...] }) {
    template = `
        <slot name="icon"></slot>
        <span class="label"><slot>Default label</slot></span>
        <slot name="trailing"></slot>
    `;

    style = `
        :host { display: inline-flex; align-items: center; padding: 5px 14px; }
        :host([variant="primary"]) { background: var(--arianna-primary); color: #fff; }
        :host([disabled]) { cursor: not-allowed; opacity: 0.45; }
        .label { font-weight: 600; }
    `;

    build(opts) {
        // template + style are parsed ONCE at class definition time,
        // then cloned per instance via Node.cloneNode(true).
        // build() handles imperative wiring: signals, listeners, computed values.
        const variant = this.attrSignal('variant');
    }
}
```

**Properties of approach A:**
- Parsed once at class definition, cached on the class
- Cloned per instance via native `Node.cloneNode(true)`
- No imports needed — just strings
- Subclass overrides via property re-declaration

#### Approach B — `html\`...\`` tagged template literal (lit-html style, supported)

```typescript
import { html } from '../../core/Template.ts';

class Button extends Component('arianna-button', HTMLElement, {...}, { attrs: [...] }) {
    build(opts) {
        this.template = html`
            <slot name="icon"></slot>
            <span class="label"><slot>Default label</slot></span>
            <slot name="trailing"></slot>
        `;
        // Sheet still assigned via factory css arg
    }
}
```

**Properties of approach B:**
- Inline JS expressions interpolated via `${expr}` at compile time
- Useful when template depends heavily on runtime values
- The underlying parser uses the same `<template>` element + cloneNode under the hood

#### When to use which

| Situation | Approach |
|-----------|----------|
| Standard component with fixed template structure | **A** (cleanest, parses once) |
| Template depends on `opts` only at first build | **A** with optional second assignment in `build()` |
| Heavy interpolation of JS expressions in markup | **B** (the tag is designed for this) |
| Subclasses that need to override template entirely | **A** (just re-declare the property) |
| Subclasses that need to splice / extend | **B** with template composition |

Both forms support the **same directive set** below — the directives are properties of the rendered DOM, not of the template syntax.

---

### 4.7.1 Template directives — declarative

These attributes/syntax work in any template string, regardless of approach A or B:

#### Interpolation & binding

| Syntax | Meaning | Example |
|--------|---------|---------|
| `{{ expr }}` | Text interpolation, reactive | `<span>{{ this.count() }}</span>` |
| `:attr="expr"` | Attribute binding, reactive | `<img :src="this.url()">` |
| `.prop="expr"` | Property binding (not attribute) | `<input .value="this.text()">` |
| `?attr="expr"` | Boolean attribute toggle | `<button ?disabled="this.loading()">` |
| `@event="handler"` | Event listener | `<button @click="this.onClick">Click</button>` |
| `@event.modifier="..."` | Event modifier (e.g. `.stop`, `.prevent`, `.once`) | `<form @submit.prevent="this.submit">` |

#### Structural directives (Approach A and B both)

| Syntax | Meaning | Example |
|--------|---------|---------|
| `a-if="expr"` | Conditional rendering | `<div a-if="loggedIn">Welcome</div>` |
| `a-else-if="expr"` | Else-if branch | `<div a-else-if="guest">Hi guest</div>` |
| `a-else` | Else branch | `<div a-else>Please log in</div>` |
| `a-for="item in list"` | List rendering | `<li a-for="p in planets">{{ p.name }}</li>` |
| `a-for="item, i in list"` | With index | `<li a-for="item, i in items">{{ i }}. {{ item }}</li>` |
| `a-foreach="key in obj"` | Object iteration | `<li a-foreach="k in scores">{{ k }}: {{ scores[k] }}</li>` |
| `a-while="expr"` | Loop while condition | `<div a-while="i < 5">{{ i++ }}</div>` |
| `a-switch="expr"` / `a-case="..."` / `a-default` | Multi-branch | `<div a-switch="state"><div a-case="loading">…</div></div>` |
| `a-show="expr"` | Toggle CSS display (DOM stays) | `<div a-show="visible">Content</div>` |
| `a-text="expr"` | Set textContent (alternative to `{{ }}`) | `<span a-text="this.msg()"></span>` |
| `a-html="expr"` | Set innerHTML (use sparingly) | `<div a-html="this.markdown()"></div>` |
| `a-class="{cls: expr}"` | Conditional classes | `<div a-class="{active: isActive, disabled: !ready}">` |
| `a-style="{prop: expr}"` | Inline reactive style | `<div a-style="{color: theme.text}">` |
| `a-bind="prop:source"` | One-way property binding | `<img a-bind="src:avatarUrl">` |
| `a-model="path"` | Two-way binding | `<input a-model="user.name">` |
| `a-on="event:handler"` | Programmatic event binding | `<button a-on="click:onSave">` |

#### Slots (shadow DOM projection)

| Syntax | Meaning |
|--------|---------|
| `<slot>` | Default slot — receives all unnamed children |
| `<slot name="icon">` | Named slot — receives `<x slot="icon">` children |
| `<slot>Fallback</slot>` | Slot with fallback content when no children provided |

Expression context inside any directive: `this = component instance`, so `@click="this.onClick"`, `{{ this.count() }}`, `a-if="this.loggedIn()"` all work natively.

For untrusted templates (user-provided strings), use `Template.safe(str)` which applies a restricted Pratt parser to block prototype access and other attack vectors.

---

### 4.7.2 Programmatic directives — `Directive.X(...)`

The same directives are available as **imperative function calls** for cases where you need to apply them outside a template (e.g. on dynamically created DOM nodes, or in non-component code). All return an `update()` function — call it whenever state changes to re-evaluate.

| Method | Signature | Description |
|--------|-----------|-------------|
| `Directive.if` | `(el, condition, then, else?)` | Conditional rendering — swaps content based on a boolean fn |
| `Directive.for` | `(el, items, template)` | Render an array of items as children |
| `Directive.foreach` | `(el, obj, template)` | Iterate an object's key/value pairs |
| `Directive.while` | `(el, condition, body)` | Render while condition is true |
| `Directive.switch` | `(el, value, cases)` | Show one of N case branches based on a value fn |
| `Directive.bind` | `(el, prop, source)` | One-way binding: element property ← source fn |
| `Directive.model` | `(el, state, key)` | Two-way binding: input ↔ State property |
| `Directive.show` | `(el, condition)` | Toggle display (no DOM removal) |
| `Directive.on` | `(el, types, handler, opts?)` | Attach DOM event listener(s) |
| `Directive.template` | `(el, scope)` | Interpolate `{{ }}` placeholders in innerHTML |
| `Directive.register` | `(name, { mounted, unmounted })` | Register a custom reusable directive |
| `Directive.apply` | `(name, el, value)` | Apply a registered directive to an element |
| `Directive.bootstrap` | `(root, scope)` | Scan DOM for `a-*` attributes and wire all directives automatically |

Example — applying a directive imperatively:

```typescript
import { Directive } from 'arianna';

const update = Directive.if(
    document.querySelector('#panel'),
    () => state.State.visible,
    '<div class="panel">Visible content</div>',
    '<div class="hidden">Hidden state</div>',
);

// Later, after state changes:
update();
```

Example — `Directive.bootstrap` (the typical pattern for non-component apps):

```typescript
import { Directive, State } from 'arianna';

const scope = new State({
    loggedIn: false,
    user: { name: 'Riccardo' },
    items: ['apple', 'banana', 'cherry'],
    login : () => { scope.loggedIn = true; Directive.bootstrap(app, scope); },
    logout: () => { scope.loggedIn = false; Directive.bootstrap(app, scope); },
});

const app = document.getElementById('app');
Directive.bootstrap(app, scope);
// → scans #app for a-if, a-for, a-model, etc. and wires them to `scope`
```

### 4.7.3 Custom directives

Register your own reusable directive:

```typescript
Directive.register('tooltip', {
    mounted(el, value) {
        el.setAttribute('title', value);
        el.style.cursor = 'help';
    },
    unmounted(el) {
        el.removeAttribute('title');
    },
});

// Then use it in templates:
// <button a-tooltip="Save your work">Save</button>
// OR programmatically:
Directive.apply('tooltip', myButton, 'Save your work');
```

### 4.7.4 Decorators (TypeScript-only, via `Directive` namespace)

For TypeScript users, AriannA also exposes class-level decorators (collected on `Directive` for namespace consistency, also imported individually):

| Decorator | Target | Description |
|-----------|--------|-------------|
| `@Component({...})` | class | Define a custom element (see §6.2). Exported as `ComponentDecorator` to avoid factory name conflict. |
| `@Prop()` | property | Mark a class property as a reactive prop |
| `@Watch(propName)` | method | Run method when `propName` changes |
| `@Emit(eventName)` | method | Auto-dispatch `eventName` with method return value as `detail` |
| `@Ref(selector)` | property | Auto-populate with `querySelector` result on mount |

### 4.8 Sheet — `Sheet.Default` / `Sheet.Current` (type `Stylesheet`)

#### 4.8.1 The two slots

Every component class has a **static** `Sheet` object with two slots, both of type `Stylesheet`:

| Slot | Scope | Mutable | Default |
|------|-------|---------|---------|
| `Sheet.Default` | static (per class) | Inheritable (override in subclass) | Seeded from `Component()` 3rd arg |
| `Sheet.Current` | per instance | Yes — runtime override | Initialised to clone of `Sheet.Default` |

Every instance:
- On construction, `Sheet.Current = Sheet.Default` (clone)
- User can override either: `Button.Sheet.Default = newStylesheet` (affects ALL future instances) or `myBtn.Sheet.Current = newSheet` (affects only this instance)

#### 4.8.2 Five forms accepted by the `css` factory argument

The 3rd argument of `Component(tag, Base, css, def)` is converted to a `Stylesheet` and assigned to `<ClassName>.Sheet.Default`. Accepted forms:

```typescript
// Form 1: selector-keyed object (the canonical form)
Component('arianna-button', HTMLElement, {
    ':host':                          { display: 'inline-flex', padding: '8px 16px' },
    ':host([variant="primary"])':     { background: 'var(--arianna-primary)' },
    '.label':                         { fontWeight: '600' },
    ':host(:hover)':                  { opacity: '0.9' },
})

// Form 2: Stylesheet instance directly
Component('arianna-button', HTMLElement,
    new Stylesheet([
        new Rule(':host', { display: 'inline-flex' }),
    ])
)

// Form 3: array of Rule
Component('arianna-button', HTMLElement, [
    new Rule(':host', { display: 'inline-flex' }),
    new Rule('.label', { fontWeight: '600' }),
])

// Form 4: single Rule
Component('arianna-button', HTMLElement,
    new Rule(':host', { display: 'inline-flex' })
)

// Form 5: CSS text (parsed via Stylesheet's text parser)
Component('arianna-button', HTMLElement, `
    :host { display: inline-flex; padding: 8px 16px; }
    :host([variant="primary"]) { background: var(--arianna-primary); }
`)
```

All five end up as `Button.Sheet.Default` (type `Stylesheet`).

#### 4.8.3 Rule syntax — full @-rule support

The `Rule` class accepts both compact (`new Rule(selector, props)`) and **object-literal** forms. All forms below produce valid `Rule` instances:

```typescript
// Simple selector → properties
new Rule('.Box-Style', {
    Width: '300px', Height: '300px', BorderRadius: '4px',
})

// Object-literal form
new Rule({
    Selector: '.Box-Style',
    Rule: { Width: '300px', Height: '300px' },
})

// Aliases accepted: Contents / Content / Body / Rule
new Rule({ Selector: '.Box', Contents: { ... } })
new Rule({ Selector: '.Box', Content:  { ... } })
new Rule({ Selector: '.Box', Body:     { ... } })
new Rule({ Selector: '.Box', Rule:     { ... } })

// CamelCase OR camelCase property names both accepted:
new Rule(':host', { Width: '100px', backgroundColor: 'red' })  // ✓ mixed OK

// ───────── @-rules (all 11 types supported) ─────────

// @charset
new Rule({ Selector: { Type: '@charset', Value: 'utf-8' } })

// @namespace
new Rule({
    Selector: { Type: '@namespace', Prefix: 'svg|a', Url: 'url("http://www.w3.org/2000/svg")' },
})

// @import — with optional nested Rules
new Rule({
    Selector: {
        Type: '@import', Url: 'url(http://example.com/lib.css)',
        Media: 'screen', And: { MinWidth: '500px' },
    },
})

// @media — with nested Rules
new Rule({
    Selector: {
        Type: '@media', Media: 'screen',
        And: { MinHeight: '600px', Or: { MinWidth: '600px', And: { MaxWidth: '800px' } } },
    },
    Rules: {
        ElementRule: { Selector: '.Element-Style', Rule: { Background: 'orange', Height: '60px' } },
        BoxRule    : { Selector: '.Box-Style',     Rule: { Background: 'blue' } },
    },
})

// @keyframes
new Rule({
    Selector: { Type: '@keyframes', Name: 'spin' },
    Contents: {
        From: { Transform: 'rotate(0deg)' },
        To:   { Transform: 'rotate(360deg)' },
        // Or with percentages:
        '0%'   : { Transform: 'rotate(0deg)' },
        '50%'  : { Transform: 'rotate(180deg)' },
        '100%' : { Transform: 'rotate(360deg)' },
    },
})

// @supports — with nested Rules and logical combinations
new Rule({
    Selector: {
        Type: '@supports',
        MinHeight: '600px',
        Or: { MinWidth: '600px', And: { MaxHeight: '200px' } },
        Not: { display: 'settete' },   // also supported
    },
    Rules: {
        Rule1: { Selector: 'DIV', Contents: { Background: 'red' } },
        Rule2: { /* nested @media here */ },
    },
})

// @page — with margin-box pseudo-elements
new Rule({
    Selector: { Type: '@page', Name: 'Page-Rule', Right: true },
    Contents: {
        Color: '#444', Margin: 'auto',
        TopLeftCorner    : { Background: 'orange' },
        TopLeft          : { Color: 'white' },
        TopCenter        : { Background: 'blue' },
        TopRight         : { Background: 'pink' },
        TopRightCorner   : { Background: 'purple' },
        BottomLeftCorner : { Background: 'grey' },
        BottomLeft       : { Background: 'green' },
        BottomCenter     : { Background: 'yellow' },
        BottomRight      : { Background: 'fuchsia' },
        BottomRightCorner: { Background: 'chocolate' },
        LeftTop          : { Background: 'lavender' },
        LeftMiddle       : { Background: 'brown' },
        LeftBottom       : { Background: 'olive' },
        RightTop         : { Background: 'aqua' },
        RightMiddle      : { Background: 'black' },
        RightBottom      : { Background: 'violet' },
    },
})

// @counter-style
new Rule({
    Selector: { Type: '@counter-style', Name: 'myStyle' },
    Contents: {
        System         : 'alphabetic',
        Symbols        : 'url(gold.svg) url(silver.svg) url(bronze.svg)',
        AdditiveSymbols: '3 "0", 2 url(symbol.png)',
        Negative       : '"(-" ")"',
        Prefix         : 'url(bullet.png)',
        Suffix         : ' ) ',
        Range          : '2 5, 8 10',
        Pad            : '3 "0"',
        SpeakAs        : 'numbers',
        Fallback       : 'upper-alpha',
    },
})

// @font-face
new Rule({
    Selector: { Type: '@font-face' },
    Contents: {
        FontFamily           : 'Bitstream Vera Serif Bold, Verdana, sans-serif',
        Source               : 'url(font.ttf) format("woff")',
        FontWeight           : 'bold',
        FontDisplay          : 'fallback',
        FontStretch          : 'semi-condensed',
        FontStyle            : 'oblique 30deg 50deg',
        FontVariationSettings: '"xhgt" 0.7',
        UnicodeRange         : 'U+005-00FF, U+42??',
        FontVariant          : 'diagonal-fractions',
        FontFeatureSettings  : '"smcp" on 12 1',
    },
})

// @viewport
new Rule({
    Selector: { Type: '@viewport' },
    Contents: { Width: '300px', MinZoom: '100px', Orientation: 'landscape' },
})

// @document
new Rule({
    Selector: {
        Type: '@document',
        Url: 'http://www.w3.org/', Prefix: 'http://www.w3.org/Style/',
        Domain: 'mozilla.org', Regex: '(.+)',
    },
    Rules: {
        ElementRule: { Selector: '.Element-Style', Rule: { Background: 'orange' } },
        BoxRule    : { Selector: '.Box-Style',     Rule: { Background: 'blue' } },
    },
})
```

#### 4.8.4 Subclass override — inheriting and customising

A subclass of an existing AriannA component can override `Sheet.Default` in **three ways**:

**Way A — Static initialiser block (most flexible)**

```typescript
class FuchsiaButton extends Button {
    static {
        FuchsiaButton.Sheet.Default = new Stylesheet([
            new Rule(':host', { background: '#e40c88', color: '#fff' }),
        ]);
    }
}
```

**Way B — Static property (cleanest)**

```typescript
class GlowButton extends Button {
    static Sheet = {
        Default: new Stylesheet([
            ...Button.Sheet.Default.Rules,                        // inherit parent's
            new Rule(':host', { boxShadow: '0 0 20px #e40c88' }), // add
        ]),
    };
}
```

**Way C — Via the factory (when subclassing through `Component(...)` again)**

```typescript
class FancyButton extends Component('arianna-fancy-button', Button, {
    ':host': { background: '#e40c88' },   // automatically merged with Button.Sheet.Default
}, {
    attrs: [...]  // optional: extra attrs in addition to Button's
}) {}
```

In **Way C**, the new `css` argument is **merged** rule-by-rule with the parent's `Sheet.Default`. Same selector → override; new selector → append.

#### 4.8.5 Runtime override per instance

```typescript
const myBtn = new Button();

// Replace entirely
myBtn.Sheet.Current = new Stylesheet([new Rule(':host', { background: 'red' })]);

// Mutate
myBtn.Sheet.Current.Rules.push(new Rule('.label', { fontWeight: '900' }));

// Inspect base (read-only forwarder to class static)
myBtn.Sheet.Default;        // → same as Button.Sheet.Default
```

#### 4.8.6 CSS variable namespace

| Prefix | Scope |
|--------|-------|
| `--arianna-primary`, `--arianna-success`, `--arianna-warning`, `--arianna-danger`, `--arianna-info` | Semantic colours |
| `--arianna-bg`, `--arianna-bg-2`, `--arianna-bg-3` | Background tiers |
| `--arianna-text`, `--arianna-muted`, `--arianna-dim` | Text colours |
| `--arianna-border` | Border colour |
| `--arianna-radius`, `--arianna-radius-sm`, `--arianna-radius-lg` | Border radii |
| `--arianna-primary-hover` | Hover state of primary |
| `--arianna-bull`, `--arianna-bear` | Finance-specific |
| `--arianna-onion-past`, `--arianna-onion-future` | Animation onion |
| `--arianna-curve-position`, `--arianna-curve-rotation`, `--arianna-curve-scale` | Curve editor |
| `--arianna-<component>-*` | Component-specific |

Always use with fallback: `var(--arianna-primary, #1f6feb)`.

### 4.9 Lifecycle hooks

| Hook | When | Use case |
|------|------|----------|
| `onCreated()` | After ctor + facilities, before `build()` | Set up data not derived from attrs |
| `onBeforeMount()` | After `build()`, before DOM adoption | Capture slot content references |
| `onMount()` | After DOM adoption | Global listeners, timers |
| `onBeforeUpdate(prev, next)` | Before reactive re-render | Snapshot scroll/focus |
| `onUpdate(prev, next)` | After reactive re-render | Restore scroll/focus |
| `onBeforeUnmount()` | Before DOM removal | Save state, animate-out |
| `onUnmount()` | After DOM removal | Clean up timers/listeners |

**Important**: `onMount` and `onUnmount` MUST be symmetric.

### 4.10 Public property surface

Every `attrs` entry has corresponding typed getter/setter:

```typescript
get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
set variant(v: string) { this.setAttribute('variant', v); }

get disabled(): boolean  { return this.hasAttribute('disabled'); }
set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }
```

### 4.11 Events

`dispatchEvent(new CustomEvent('arianna:<event>', { detail, bubbles: true }))`. Standard names:

| Event | Meaning |
|-------|---------|
| `arianna:click` | User clicked |
| `arianna:change` | Value changed (commit) |
| `arianna:input` | Input event (every keystroke) |
| `arianna:select` | Selection made |
| `arianna:open` / `arianna:close` | Overlay state |
| `arianna:submit` | Form submission |
| `arianna:error` | Error condition |
| `arianna:loaded` | Async load complete |

### 4.12 File header

```typescript
/**
 * @module    components/<category>/<ClassName>
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * <ClassName> — <one-line description>.
 *
 * <Two-to-five-line paragraph: purpose, usage context, key features.>
 *
 * @example JS
 *   const x = new <ClassName>({ option: 'value' });
 *
 * @example HTML
 *   <arianna-<tag> option="value"></arianna-<tag>>
 *
 * Events:
 *   - arianna:<event>: <description>
 */
```

### 4.13 Window bridge

```typescript
if (typeof window !== 'undefined') {
    Object.defineProperty(window, '<ClassName>', {
        value: <ClassName>, writable: false, enumerable: false, configurable: false,
    });
}

export default <ClassName>;
```

---

## 5. Instantiation — the six forms

Given any class defined via `Component(tag, Base, css?, def?)`:

```typescript
class MyCounter extends Component('arianna-counter', HTMLElement, {...}, { attrs: ['initial'] }) {
    build(opts) { /* ... */ }
}
```

**All six produce identical DOM:**

```typescript
// (a) HTML markup
<arianna-counter initial="5">Children here</arianna-counter>

// (b) Real fluent — live DOM wrapper
const a = new Real('arianna-counter').set('initial', '5').append('#app');

// (c) Virtual — virtual node, materialised on append/render
const b = new Virtual('arianna-counter').set('initial', '5').append('#app');

// (d) Component wrapper SUM — exposes Real + Virtual together
const c = new Component('arianna-counter', { initial: 5 });
c.Real.set('variant', 'primary').append('#app');
//   or
c.Virtual.append('#app');     // same underlying element

// (e) Class direct
const d = new MyCounter();
d.setAttribute('initial', '5');
document.body.appendChild(d);

// (f) document.createElement
const e = document.createElement('arianna-counter');
e.setAttribute('initial', '5');
document.body.appendChild(e);
```

**Default rendering imperative**: each of the six forms above must produce a fully-styled, fully-functional element **with zero additional code** — the `Sheet.Default` from the factory `css` argument is applied automatically, the template renders, and the component looks the same regardless of which form was used.

---

## 6. Definition — the five forms

Beyond the canonical factory form, components may also be defined via:

### 6.1 Factory with `extends` (canonical — §3, §4)

```typescript
class MyButton extends Component('arianna-button', HTMLElement, {...}, { attrs: [...] }) {
    build(opts) { /* ... */ }
}
```

### 6.2 Decorator `@Component` (from `Directive`)

```typescript
import { ComponentDecorator as Component, Prop } from 'arianna';

@Component({
    tag: 'arianna-greet',
    template: '<button><slot></slot></button>',
    style: ':host { color: #e40c88; }',
    shadow: 'open',
})
class Greet extends HTMLElement {
    @Prop() name = 'AriannA';
    connectedCallback() { /* ... */ }
}
```

The decorator is exported as `ComponentDecorator` to avoid name conflict with the factory `Component`. Aliasing `as Component` restores the natural `@Component({...})` syntax.

### 6.3 `Core.Define(tag, ctor, base?, style?)`

Imperative form. Accepts both classes and plain function constructors.

```typescript
import { Core } from 'arianna';

// With class
class MyBtn extends HTMLButtonElement {
    connectedCallback() { this.textContent = 'Hi'; }
}
Core.Define('arianna-btn', MyBtn, HTMLButtonElement, { background: '#e40c88' });

// With plain function constructor
function MyCard() {
    this.textContent = 'Hello';
}
Core.Define('arianna-card', MyCard);    // Base auto-resolved to HTMLElement
```

**Equivalent to `Component(tag, ctor)` (factory form, no `extends`)** — both forms register the custom element imperatively without needing a class body. Use whichever reads better:

```typescript
// These two lines are equivalent:
Core.Define('arianna-card', MyCard);
Component('arianna-card', MyCard);
```

The `Component(...)` form is preferred when you want to keep symmetry with `extends Component(...)` patterns elsewhere in the codebase. The `Core.Define(...)` form is preferred when emphasising "this is just element registration, no AriannA component lifecycle".

### 6.4 `Real.Define(tag, ctor, base?, style?)`

Alias of `Core.Define`. Same semantics.

### 6.5 JSX runtime — React-compatible

AriannA ships a full React-JSX compatible runtime. Every JSX element maps to either a `Real` instance or a `VirtualNode` — no virtual DOM overhead unless you opt in.

#### tsconfig.json setup

```json
{
  "compilerOptions": {
    "jsx"            : "react-jsx",
    "jsxImportSource": "arianna"
  }
}
```

For dev mode with extra debug args, use `"jsx": "react-jsxdev"` (resolves to `arianna/jsx-dev-runtime → jsxDEV()` — same behaviour as `jsx()`, debug args ignored).

#### Dual runtime — Real (default) vs Virtual

Every JSX element compiles to either `new Real(...)` (default) or `Virtual.Create(...)`. Switch the runtime at three scopes: globally, per-file, or via the `Component()` factory `def.render` option.

```tsx
// Real mode (default) — every element is a Real instance
import { Real, signal } from 'arianna';

const count = signal(0);

function App() {
  return (
    <div id="app">
      <h1 class="title">Ariann<em>A</em></h1>
      <p>Count: <span>{count.get()}</span></p>
      <button onClick={() => count.set(count.get() + 1)}>
        Increment
      </button>
    </div>
  );
}

// Virtual mode — per-file pragma at top
/* @dom-render: virtual */
function SVGIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#e40c88" />
    </svg>
  );
}
```

Reactive expressions: bare `{count.get()}` reads once at render time; wrap in `{() => count.get()}` to keep the subscription live across signal updates.

#### Event syntax — `$event` and `onEvent` (both equivalent)

```tsx
// $-prefix
<button $click={fn}>Dollar syntax</button>
<input  $input={(e) => val.set(e.target.value)} />
<div    $mouseenter={show} $mouseleave={hide}>Hover me</div>

// on-prefix (React-compatible)
<button onClick={fn}>On-prefix syntax</button>
<input  onInput={(e) => val.set(e.target.value)} />
```

Both forms work on any event name. If both are present on the same element, `$event` takes precedence.

#### Fragment

```tsx
// <>…</>  — Real mode: DocumentFragment | Virtual mode: Fragment node
function Pair() {
  return (
    <>
      <span>First</span>
      <span>Second</span>
    </>
  );
}
```

#### Custom elements — PascalCase ↔ kebab-case auto-resolution

```tsx
import { MyButton } from './MyButton.ts';

const el = <MyButton label="Click me" $click={handleClick} />;
// Resolves via Core.GetDescriptor() to:
// → new Real('my-button').set('label', 'Click me').on('click', handleClick)
```

The JSX runtime walks the registered descriptor namespace to map `<PascalCaseName>` to its registered kebab-case tag. Components defined via §3 / §6.1 / §6.2 are picked up automatically.

#### Defining components in JSX

```tsx
/* @jsxImportSource arianna */
import { Rule, Stylesheet } from 'arianna';

new Stylesheet([
    new Rule('.my-card', { padding: '16px', border: '1px solid #ddd' }),
]).attach();

function MyCard({ title, children }: { title: string; children?: any }) {
    return (
        <div className="my-card">
            <h2>{title}</h2>
            <p>{children}</p>
        </div>
    );
}

// Usage:
// <MyCard title="Hello">A reusable card</MyCard>
```

#### Three ways to switch runtime mode

1. **Per-file pragma** (top of file):
   ```tsx
   /* @dom-render: virtual */
   ```
2. **Global switch** at app bootstrap:
   ```ts
   import { setDefaultRuntime } from 'arianna/jsx-runtime';
   setDefaultRuntime('virtual');   // all JSX → VirtualNode
   setDefaultRuntime('real');      // back to default
   ```
3. **Per-component** via the factory `def.render` option:
   ```ts
   class MyCmp extends Component('arianna-mycmp', HTMLElement, css, {
       attrs : [...],
       render: 'virtual',          // overrides global default for this component
   }) {}
   ```

#### `h()` factory — direct use (without JSX transform)

```ts
import { h, Fragment } from 'arianna/jsx-runtime';

const btn  = h('button', { class: 'primary', '$click': fn }, 'Click');
const frag = h(Fragment, null, btn, h('span', null, 'text'));
```

The full export from `arianna/jsx-runtime`:

```ts
export {
    h,                   // (tag, props, ...children) → Real | VirtualNode
    jsx,                 // alias of h (React-compatible name)
    jsxs,                // alias of h (React-compatible name)
    jsxDEV,              // dev variant (extra debug args ignored)
    Fragment,            // <></>
    setDefaultRuntime,   // (mode: 'real' | 'virtual') => void
    getDefaultRuntime,   // () => 'real' | 'virtual'
};
```

#### Combining JSX with `Component()` factory class

You can return JSX from within a Component's `build()` or directly use JSX to render the template:

```tsx
class Card extends Component('arianna-card', HTMLElement, {
    ':host': { display: 'block', padding: '16px' },
}, { attrs: ['title'] }) {
    build(opts) {
        // Render JSX into the shadow root via Real
        const tree = (
            <div class="card">
                <h2>{this.getAttribute('title')}</h2>
                <slot />
            </div>
        );
        // tree is a Real instance — append to shadow root
        this.Shadow.Root.appendChild(tree.render());
    }
}
```

For component templates that depend on signals, use the `() => expr` form to preserve reactivity:

```tsx
build() {
    const count = signal(0);
    const tree = (
        <div>
            <span>{() => `Count: ${count.get()}`}</span>
            <button $click={() => count.set(count.get() + 1)}>+</button>
        </div>
    );
    this.Shadow.Root.appendChild(tree.render());
}
```

---

## 7. Migration playbook (pre-v2 patterns → canonical)

| Pre-v2 pattern | Canonical |
|----------------|-----------|
| `extends Control<Opts>` | `extends Component('arianna-x', HTMLElement, css, { attrs, shadow, bus })` |
| `super(container, 'div', opts)` | (gone) |
| `_build()` | `build(opts)` |
| `this.el.innerHTML = \`...\`` | EITHER `template = '...'` (class property, Vue-style) OR `this.template = html\`...\`` (tagged template) — both supported, both use shadow DOM by default |
| `data-r="x"` + `querySelector` | declarative bindings |
| `this._set('k', v)` | `this.k = v` or signal mutation |
| `this._get('k', fallback)` | typed getter or `attrSignal('k').get() ?? fallback` |
| `this._on(el, 'click', fn)` | `@click="fn"` in template |
| `this._emit('evt', d)` | `dispatchEvent(new CustomEvent('arianna:evt', {detail: d, bubbles: true}))` |
| `this.destroy()` | `onUnmount()` |
| Inline CSS string export | `css` argument of `Component(...)` factory → `Sheet.Default` |
| `static DefaultSheet()` + `this.Sheet = X.DefaultSheet()` | (gone — automatic via `css` factory arg) |

---

## 8. Allowed deviations

### 8.1 Pure renderers (Finance Sparkline-style)
Utility classes that are NOT custom elements: keep current shape. May optionally be wrapped:

```typescript
class SparklineEl extends Component('arianna-sparkline', HTMLElement, {}, {
    attrs: ['data', 'color'],
}) {
    build() {
        effect(() => {
            const data = JSON.parse(this.attrSignal('data').get() ?? '[]');
            new Sparkline(this).render(data);
        });
    }
}
```

### 8.2 Modifiers (Modifier2D/3D)
Behaviors applied to existing elements. NOT custom elements. Keep current shape, align to Signal/Observable API.

### 8.3 Sub-base classes
When multiple related components share complex logic, sub-base is OK provided IT extends Component(...) so concrete subclasses inherit v2 shape.

---

## 9. Testing convention

Every `<Name>.ts` has sibling `<Name>.test.ts` in `/tests/components/<category>/`. Coverage:
- Every public method
- Every attr reactivity case
- Slot projection sanity
- Event emission
- `Sheet.Default` value matches expected
- Subclass `Sheet.Default` override works
- Per-instance `Sheet.Current` override works

---

## 10. Build/bundle convention

- ESM only
- Imports use `.ts` extension
- Default export = class
- Named export = class + Options
- Window bridge optional but conventional

Bundles:
- `arianna/components/inputs/Button`
- `arianna/components/inputs` (barrel)
- `arianna/components` (full barrel)

---

## 11. Accessibility baseline

Every interactive component MUST set:
- `role` if not implied
- `aria-*` for state (`aria-pressed`, `aria-disabled`, `aria-expanded`)
- `tabindex` for focus
- Visible `:focus-visible` Sheet rule

Form controls MUST forward `name`, `value`, `required`, `disabled`, `readonly`; emit `arianna:change` on commit, `arianna:input` on keystroke.

---

## 12. Documentation per component

JSDoc must include:
1. One-line description
2. Two-paragraph context (when / when not to use)
3. JS example (using one of the six instantiation forms)
4. HTML example
5. Events list with detail schema
6. Slots list with semantics
7. Attributes list with types
8. **CSS variables exposed** (subset of §4.8.6 used by this component)
9. **Internal CSS classes** (override targets — e.g. `.ar-cal__day`, `.ar-cal__nav`)

The reference site reads this JSDoc + parses the component's `Sheet.Default` to auto-generate the reference card with all the internal class names, attrs, events, and styling override examples.

---

## 13. The "default imperative" rule

Every component must render **completely and correctly** with zero additional configuration using any of the six instantiation forms (§5). This means:

- The `Sheet.Default` from the factory `css` argument is applied automatically
- The template renders inside shadow DOM (closed by default)
- All internal class selectors (`.ar-cal__header`, etc.) resolve correctly because they live inside the same shadow root as the template
- The element appears identical whether created via HTML markup, `new Real('tag')`, `new Virtual('tag')`, `new Component('tag', opts)`, `new ClassName()`, or `document.createElement('tag')`

**If a component does not render styled out of the box, it is a bug** — either in the component's `css` factory argument or in the core's shadow/sheet wiring.

---

## 14. Codemod helper (planned)

`/tools/migrate-control-to-v2.ts` will apply §7 table mechanically. The codemod must:

1. Convert `extends Control` → `extends Component('arianna-X', HTMLElement, css, def)`
2. Move `static DefaultSheet()` body into the factory `css` argument (3rd arg)
3. Delete `this.Sheet = X.DefaultSheet()` from `build()`
4. Convert `_build()` body to `build()` body
5. Convert `data-r` + `querySelector` to declarative bindings
6. Convert `_emit('evt', d)` to `dispatchEvent(new CustomEvent('arianna:evt', {...}))`
7. Convert `_on(el, 'click', fn)` to `@click="fn"` in template (where possible)
8. Preserve `onMount`/`onUnmount` etc. hooks as-is

Estimated ~70% automation; ~30% manual review for complex `_build()` bodies.

---

## END

---

# Part VI — Worked Examples


**Purpose**: end-to-end examples a reader can copy, paste, and run. Each example exercises multiple parts of the framework so the pieces are seen working together.

---

## Example 1: `<arianna-counter-card>` — the full Bible

A single component that demonstrates:

- Factory definition with all 4 arguments
- `Sheet.Default` populated from the `css` factory argument
- Vue-style `template` class property
- Internal signal state
- `attrSignal` for reactive attribute
- 4 template directives: `{{ }}`, `@click`, `:attr`, `a-class`
- 2 lifecycle hooks (`onMount`, `onUnmount`)
- Subclass inheriting and customising `Sheet.Default`
- Usage from HTML, Real, Virtual, JSX, `new Component()`, `new MyClass()`, `document.createElement`

### Source

```typescript
// CounterCard.ts
import { Component, signal, effect } from 'arianna';
import { Rule, Stylesheet } from 'arianna';

export interface CounterCardOptions {
    initial? : number;
    label?   : string;
}

export class CounterCard extends Component(
    'arianna-counter-card',
    HTMLElement,
    {
        ':host': {
            display      : 'inline-flex',
            flexDirection: 'column',
            gap          : '12px',
            padding      : '16px',
            background   : 'var(--arianna-bg-2, #f8f8f8)',
            border       : '1px solid var(--arianna-border, #e0e0e0)',
            borderRadius : 'var(--arianna-radius, 8px)',
            minWidth     : '200px',
            fontFamily   : 'system-ui, sans-serif',
        },
        ':host([variant="primary"])': {
            background: 'var(--arianna-primary, #e40c88)',
            color     : '#fff',
            borderColor: 'transparent',
        },
        '.label': {
            fontSize  : '14px',
            fontWeight: '600',
            opacity   : '0.85',
        },
        '.count-row': {
            display    : 'flex',
            alignItems : 'center',
            gap        : '8px',
        },
        '.count': {
            fontSize  : '32px',
            fontWeight: '700',
            minWidth  : '60px',
            textAlign : 'center',
            transition: 'color 200ms',
        },
        '.count.zero': {
            opacity: '0.4',
        },
        '.count.over-ten': {
            color: 'var(--arianna-success, #2ea043)',
        },
        'button': {
            width        : '36px',
            height       : '36px',
            border       : 'none',
            borderRadius : '50%',
            cursor       : 'pointer',
            fontSize     : '18px',
            background   : 'rgba(0, 0, 0, 0.08)',
            transition   : 'transform 80ms',
        },
        'button:hover': {
            transform: 'scale(1.1)',
        },
        'button:disabled': {
            opacity : '0.3',
            cursor  : 'not-allowed',
        },
    },
    {
        attrs : ['variant', 'initial'],
        shadow: 'closed',
    }
) {
    // ── Vue-style template (Approach A) ────────────────────────────────────
    template = `
        <div class="label">{{ this.label.get() }}</div>
        <div class="count-row">
            <button @click="this.dec" ?disabled="this.atMin()">−</button>
            <span
                class="count"
                a-class="{ zero: this.count() === 0, 'over-ten': this.count() > 10 }"
            >{{ this.count() }}</span>
            <button @click="this.inc">+</button>
        </div>
    `;

    // ── Reactive state ─────────────────────────────────────────────────────
    count = signal(0);
    label = signal('Counter');
    atMin = () => this.count() <= 0;

    // ── Build (called once after template + sheet are attached) ────────────
    build(opts: CounterCardOptions = {}) {
        // 1. Sync the 'initial' attribute → count signal
        const initialAttr = this.attrSignal('initial');
        const start = parseInt(initialAttr.get() ?? '0', 10) || (opts.initial ?? 0);
        this.count.set(start);

        // 2. Apply opts.label if provided (otherwise default 'Counter')
        if (opts.label) this.label.set(opts.label);

        // 3. Side effect: persist count in sessionStorage every time it changes
        effect(() => {
            sessionStorage.setItem('counter-' + (this.id || 'default'), String(this.count()));
        });
    }

    // ── Handlers (arrow functions to preserve `this`) ──────────────────────
    inc = () => this.count.set(this.count() + 1);
    dec = () => this.count.set(Math.max(0, this.count() - 1));

    // ── Lifecycle ──────────────────────────────────────────────────────────
    onMount() {
        // Optional keyboard shortcut while element is in DOM
        window.addEventListener('keydown', this.onKey);
        console.log('[counter] mounted');
    }

    onUnmount() {
        window.removeEventListener('keydown', this.onKey);
        console.log('[counter] unmounted');
    }

    onKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp')   this.inc();
        if (e.key === 'ArrowDown') this.dec();
    };

    // ── Public API surface ─────────────────────────────────────────────────
    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    // Imperative API for parents that want to mutate count externally
    reset() { this.count.set(0); }
}

// ── Optional: window bridge so devtools console can do `new CounterCard()` ─
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'CounterCard', {
        value: CounterCard, writable: false, enumerable: false, configurable: false,
    });
}

export default CounterCard;
```

### Subclass inheriting and customising Sheet.Default

```typescript
// FuchsiaCounter.ts — Way A (static initialiser block)
import { CounterCard } from './CounterCard';
import { Rule, Stylesheet } from 'arianna';

export class FuchsiaCounter extends CounterCard {
    static {
        FuchsiaCounter.Sheet.Default = new Stylesheet([
            ...CounterCard.Sheet.Default.Rules,           // inherit parent rules
            new Rule(':host', {                           // override host bg
                background: '#e40c88',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(228, 12, 136, 0.3)',
            }),
            new Rule('.count', {
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }),
        ]);
    }
}

// Way C — equivalent, using the factory
class FuchsiaCounterB extends Component('arianna-fuchsia-counter', CounterCard, {
    ':host': { background: '#e40c88', color: '#fff' },
    '.count': { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' },
}) {}
```

### Usage — all six instantiation forms produce identical output

```typescript
// ──────────────────────────────────────────────────────────────────────────
// FORM 1 — HTML markup (declarative)
// ──────────────────────────────────────────────────────────────────────────
```
```html
<arianna-counter-card initial="5" variant="primary"></arianna-counter-card>
```
```typescript
// ──────────────────────────────────────────────────────────────────────────
// FORM 2 — Real fluent (eager, live DOM)
// ──────────────────────────────────────────────────────────────────────────
import { Real } from 'arianna';

const a = new Real('arianna-counter-card')
    .set('initial', '5')
    .set('variant', 'primary')
    .append('#app');

// ──────────────────────────────────────────────────────────────────────────
// FORM 3 — Virtual (lazy, declarative)
// ──────────────────────────────────────────────────────────────────────────
import { Virtual } from 'arianna';

const b = new Virtual('arianna-counter-card')
    .set('initial', '5')
    .set('variant', 'primary');
b.append('#app');           // materialises now

// ──────────────────────────────────────────────────────────────────────────
// FORM 4 — Component wrapper SUM (Real + Virtual via one handle)
// ──────────────────────────────────────────────────────────────────────────
import { Component } from 'arianna';

const c = new Component('arianna-counter-card', { initial: 5, variant: 'primary' });
c.Real.append('#app');      // uses the Real wrapper
//   or
c.Virtual.append('#app');   // same underlying element, Virtual wrapper

// ──────────────────────────────────────────────────────────────────────────
// FORM 5 — Class direct (named import, full TypeScript types)
// ──────────────────────────────────────────────────────────────────────────
import { CounterCard } from './CounterCard';

const d = new CounterCard({ initial: 5, label: 'Score' });
d.setAttribute('variant', 'primary');
document.body.appendChild(d);

// d.reset();          // typed imperative API
// d.count.subscribe(n => console.log('count is', n));

// ──────────────────────────────────────────────────────────────────────────
// FORM 6 — document.createElement (browser-native)
// ──────────────────────────────────────────────────────────────────────────
const e = document.createElement('arianna-counter-card');
e.setAttribute('initial', '5');
e.setAttribute('variant', 'primary');
document.body.appendChild(e);

// ──────────────────────────────────────────────────────────────────────────
// FORM (bonus) — JSX
// ──────────────────────────────────────────────────────────────────────────
/* @jsxImportSource arianna */
import { CounterCard } from './CounterCard';

function App() {
    return (
        <div id="app">
            <CounterCard initial={5} variant="primary" />
            <CounterCard initial={0} />
            <FuchsiaCounter initial={42} />
        </div>
    );
}
```

All six forms register a working `<arianna-counter-card>` with the same shadow DOM, the same template, the same `Sheet.Default`, and the same lifecycle. The "default imperative" rule is satisfied: zero manual configuration needed.

---

## Example 2: `<arianna-tabs>` — parent/child via `bus`

Demonstrates the `bus` mechanism for parent-child component coordination.

```typescript
import { Component, signal } from 'arianna';

// ── Child: registers with parent via def.bus ──────────────────────────────
class Tab extends Component('arianna-tab', HTMLElement, {
    ':host': {
        display: 'block', padding: '8px 16px', cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    ':host([active])': {
        borderBottomColor: 'var(--arianna-primary, #e40c88)',
        fontWeight: '600',
    },
}, {
    attrs: ['label', 'active'],
    bus  : 'arianna-tabs',   // ← registers as child of nearest <arianna-tabs>
}) {
    template = `<slot>{{ this.label.get() }}</slot>`;
    label = signal('Tab');
}

// ── Parent: reads its bus children ────────────────────────────────────────
class Tabs extends Component('arianna-tabs', HTMLElement, {
    ':host': { display: 'flex', gap: '0', borderBottom: '1px solid #ddd' },
}) {
    template = `<slot></slot>`;

    activeIndex = signal(0);

    onMount() {
        // _children is populated by the bus mechanism
        const children = this._children as Tab[];

        children.forEach((tab, i) => {
            tab.addEventListener('click', () => {
                this.activeIndex.set(i);
                children.forEach((t, j) => {
                    if (j === i) t.setAttribute('active', '');
                    else t.removeAttribute('active');
                });
            });
        });

        // Activate first by default
        children[0]?.setAttribute('active', '');
    }
}
```

```html
<arianna-tabs>
    <arianna-tab label="Profile"></arianna-tab>
    <arianna-tab label="Settings"></arianna-tab>
    <arianna-tab label="Billing"></arianna-tab>
</arianna-tabs>
```

Each `<arianna-tabs>` on the page gets its own isolated `_children` registry. Two `<arianna-tabs>` on the same page do not see each other's tabs.

---

## Example 3: standalone — `Directive.bootstrap` without components

When you don't need shadow DOM, lifecycle, or custom elements, you can bootstrap directives directly on existing markup.

```html
<div id="app">
    <input a-model="user.name" placeholder="Name">
    <p>Hello, <span>{{ user.name }}</span>!</p>

    <ul>
        <li a-for="item, i in items">{{ i + 1 }}. {{ item }}</li>
    </ul>

    <button a-on="click:addItem">Add</button>
</div>
```

```typescript
import { Directive, State } from 'arianna';

const scope = new State({
    user : { name: 'Riccardo' },
    items: ['Apple', 'Banana', 'Cherry'],
    addItem: () => {
        scope.State.items = [
            ...scope.State.items,
            'Item ' + (scope.State.items.length + 1),
        ];
    },
});

Directive.bootstrap(document.getElementById('app')!, scope);
```

No components, no shadow DOM, no build step. Just declarative DOM + a state object.

---

## Example 4: JSX with reactive subscriptions

```tsx
/* @jsxImportSource arianna */
import { signal, computed } from 'arianna';

function TodoApp() {
    const todos  = signal<{ text: string; done: boolean }[]>([]);
    const newTxt = signal('');
    const remain = computed(() => todos().filter(t => !t.done).length);

    const add = () => {
        if (!newTxt().trim()) return;
        todos.set([...todos(), { text: newTxt(), done: false }]);
        newTxt.set('');
    };

    const toggle = (i: number) => {
        todos.set(todos().map((t, j) => j === i ? { ...t, done: !t.done } : t));
    };

    return (
        <div class="todo-app">
            <h1>Todos</h1>
            <p>{() => `${remain()} remaining`}</p>

            <input
                value={() => newTxt()}
                $input={(e: any) => newTxt.set(e.target.value)}
                placeholder="Add a todo…"
            />
            <button onClick={add}>Add</button>

            <ul>
                {() => todos().map((t, i) => (
                    <li>
                        <input type="checkbox" .checked={t.done} $change={() => toggle(i)} />
                        <span style={t.done ? 'text-decoration: line-through' : ''}>
                            {t.text}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

TodoApp().append(document.body);
```

Notice: `{() => remain()}` keeps the subscription live. Bare `{remain()}` would read once at render time.

---

## Example 5: Inheritance chain

A real-world pattern: base class with shared logic, two specialised subclasses.

```typescript
// BaseButton — provides shared behaviour, NOT a custom element itself
class BaseButton extends Component('arianna-base-button', HTMLElement, {
    ':host': {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', padding: '8px 14px', cursor: 'pointer',
        borderRadius: 'var(--arianna-radius, 6px)',
        border: 'none', fontWeight: '600',
        transition: 'background 120ms',
    },
    ':host([disabled])': { opacity: '0.5', cursor: 'not-allowed' },
}, {
    attrs: ['disabled', 'loading'],
}) {
    template = `
        <span a-if="this.attrSignal('loading').get() !== null">⏳</span>
        <slot></slot>
    `;

    onMount() {
        this.addEventListener('click', this.onClick);
    }

    onUnmount() {
        this.removeEventListener('click', this.onClick);
    }

    onClick = (e: Event) => {
        if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
            e.stopImmediatePropagation();
            return;
        }
    };
}

// PrimaryButton — extends BaseButton, adds colour theme
class PrimaryButton extends BaseButton {
    static {
        PrimaryButton.Sheet.Default = new Stylesheet([
            ...BaseButton.Sheet.Default.Rules,
            new Rule(':host', {
                background: 'var(--arianna-primary, #e40c88)',
                color: '#fff',
            }),
            new Rule(':host(:hover):not([disabled]):not([loading])', {
                background: 'var(--arianna-primary-hover, #c00673)',
            }),
        ]);
    }
}
Core.Define('arianna-primary-button', PrimaryButton);

// GhostButton — alternative theme
class GhostButton extends BaseButton {
    static {
        GhostButton.Sheet.Default = new Stylesheet([
            ...BaseButton.Sheet.Default.Rules,
            new Rule(':host', {
                background: 'transparent',
                border: '1px solid var(--arianna-border, #ddd)',
                color: 'var(--arianna-text, #1f2328)',
            }),
            new Rule(':host(:hover):not([disabled]):not([loading])', {
                background: 'var(--arianna-bg-3, #f3f3f3)',
            }),
        ]);
    }
}
Core.Define('arianna-ghost-button', GhostButton);
```

```html
<arianna-primary-button>Save</arianna-primary-button>
<arianna-primary-button loading>Saving…</arianna-primary-button>
<arianna-ghost-button>Cancel</arianna-ghost-button>
<arianna-primary-button disabled>Disabled</arianna-primary-button>
```

All three subclasses share `onClick` debouncing, the loading indicator template, and the disabled-state styling — but layer their own colours on top via `Sheet.Default` override.

---

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| `{{ this.count }}` prints `[object Object]` | Invoke the signal: `{{ this.count() }}` |
| Handler arrow functions: `this` is undefined | Use class property arrows (`fn = () => {...}`), not method syntax (`fn() {...}`) |
| Local variables in `build()` not visible in template | Templates can't see closures — promote to `this.something` |
| `onMount` not firing | Element is not yet in the DOM. Use `connectedCallback` semantics — append the element first |
| `Sheet.Default` change has no effect on existing instances | `Sheet.Default` seeds new instances. For live mutation, write to `instance.Sheet.Current` |
| `a-else` not working | Must be immediate next-sibling element of `a-if` (no text nodes between) |
| `a-for` doesn't update on array push | Signals are by reference. Use `arr.set([...arr(), newItem])`, not `arr().push()` |
| JSX `{count()}` not reactive | Wrap in arrow: `{() => count()}` |
