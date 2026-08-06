# Component Lifecycle

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
