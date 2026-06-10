# Complete Worked Examples

> **Model reminder (binding).** See [`ARCHITECTURE.md`](ARCHITECTURE.md). Inside a
> `Component` class, **`this` is the Component**, *not* the DOM node. Touch the
> live element through **`this.Real`** (eager facet) or **`this.Virtual`** (lazy
> facet), or through the Component's delegated sugar (`this.set/get/sub`,
> `this.attrSignal`, `this.fire`, `this.RenderRoot`, lifecycle hooks). A Component
> instance is **never** appendable — `appendChild(component)` is invalid; use
> `component.Real.append(p)` or `component.Virtual.render().append(p)`.

---

## Example 1: `<arianna-counter-card>` — the full Bible

A single component that demonstrates:

- Factory definition with all 4 arguments
- `Sheet.Default` populated from the `css` factory argument
- Vue-style `template` class property
- Internal signal state
- `attrSignal` for reactive attribute
- 4 template directives: `{{ }}`, `@click`, `?attr`, `a-class`
- 2 lifecycle hooks (`onMount`, `onUnmount`)
- Subclass inheriting and customising `Sheet.Default`
- Usage from **Family A** (returns a Component) and **Family B** (returns a node)

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
            background : 'var(--arianna-primary, #e40c88)',
            color      : '#fff',
            borderColor: 'transparent',
        },
        '.label'    : { fontSize: '14px', fontWeight: '600', opacity: '0.85' },
        '.count-row': { display: 'flex', alignItems: 'center', gap: '8px' },
        '.count'    : { fontSize: '32px', fontWeight: '700', minWidth: '60px', textAlign: 'center', transition: 'color 200ms' },
        '.count.zero'    : { opacity: '0.4' },
        '.count.over-ten': { color: 'var(--arianna-success, #2ea043)' },
        'button'         : { width: '36px', height: '36px', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', background: 'rgba(0,0,0,0.08)', transition: 'transform 80ms' },
        'button:hover'   : { transform: 'scale(1.1)' },
        'button:disabled': { opacity: '0.3', cursor: 'not-allowed' },
    },
    {
        attrs : ['variant', 'initial'],
        shadow: 'closed',
    }
) {
    // ── Vue-style template ─────────────────────────────────────────────────
    //  Directives bind at the BASE (the Real/Virtual element), independently of
    //  this Component. @click is wired on the live element, not on `this`.
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

    // ── Reactive state (owned by the Component, Layer 2) ───────────────────
    count = signal(0);
    label = signal('Counter');
    atMin = () => this.count() <= 0;

    // ── build(): runs once after template + sheet attach ───────────────────
    build(opts: CounterCardOptions = {}) {
        // attrSignal is a Component-owned bridge (attr ↔ signal ↔ DOM).
        const initialAttr = this.attrSignal('initial');
        const start = parseInt(initialAttr.get() ?? '0', 10) || (opts.initial ?? 0);
        this.count.set(start);

        if (opts.label) this.label.set(opts.label);

        // this.id reads through the Component's delegated getter (→ base attr).
        effect(() => {
            sessionStorage.setItem('counter-' + (this.get('id') || 'default'), String(this.count()));
        });
    }

    // ── Handlers (arrow properties to preserve `this` = the Component) ─────
    inc = () => this.count.set(this.count() + 1);
    dec = () => this.count.set(Math.max(0, this.count() - 1));

    // ── Lifecycle (fired by the Component, not the element) ────────────────
    onMount() {
        // A document-level listener: bind through the eager facet for symmetry,
        // or directly on window for non-element targets.
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

    // ── Public API surface — attribute access via delegated sugar ──────────
    get variant(): string  { return (this.get('variant') as string) ?? 'default'; }
    set variant(v: string) { this.set('variant', v); }

    // Imperative API for parents that want to mutate count externally.
    reset() { this.count.set(0); }
}

export default CounterCard;
```

> `this.get('variant')` / `this.set('variant', v)` are the Component's delegated
> fluent sugar; they forward to the base element. They are **not** the native
> `getAttribute`/`setAttribute` on `this` — `this` is the Component, which is not
> a node.

### Subclass inheriting and customising `Sheet.Default`

```typescript
// FuchsiaCounter.ts — Way A (static initialiser block)
import { CounterCard } from './CounterCard';
import { Rule, Stylesheet } from 'arianna';

export class FuchsiaCounter extends CounterCard {
    static {
        // Re-extending an already-extended Component: the Real base chain is
        // RE-SPLICED automatically (eager facet renders now). The Virtual facet
        // only updates its descriptor and re-chains at render() time.
        FuchsiaCounter.Sheet.Default = new Stylesheet([
            ...CounterCard.Sheet.Default.Rules,
            new Rule(':host', {
                background: '#e40c88', color: '#fff',
                boxShadow: '0 4px 16px rgba(228, 12, 136, 0.3)',
            }),
            new Rule('.count', { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }),
        ]);
    }
}

// Way C — equivalent, using the factory (also returns a Component class)
class FuchsiaCounterB extends Component('arianna-fuchsia-counter', CounterCard, {
    ':host': { background: '#e40c88', color: '#fff' },
    '.count': { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' },
}) {}
```

### Usage — the two families (this is the part people get wrong)

```typescript
// ══════════════════════════════════════════════════════════════════════════
//  FAMILY A — you get a COMPONENT (super-layer object, NOT a node).
//             Reach the DOM only via .Real / .Virtual.
// ══════════════════════════════════════════════════════════════════════════

// A1 — new Component(tag, opts?)  →  Component
import { Component } from 'arianna';
const c = new Component('arianna-counter-card', { initial: 5, variant: 'primary' });
//  ❌ document.body.appendChild(c);     // INVALID — c is not a node
c.Real.append('#app');                   // ✅ eager (Lit-like), live now
//   or
c.Virtual.render().append('#app');       // ✅ lazy (React/Vue-like), commit now

// A2 — new MyClass(props)  →  Component (typed)
import { CounterCard } from './CounterCard';
const d = new CounterCard({ initial: 5, label: 'Score' });
d.Real.append('#app');                   // ✅ NOT appendChild(d)
// d.reset();                            // typed imperative API on the Component
// d.count.subscribe(n => console.log('count is', n));

// A3 — new Component(existingElement)  →  Component dressing that element
const bare = document.createElement('div');
const wrapped = new Component(bare);     // a <div> with the decorator on top
wrapped.Real.append('#app');             // ✅ only now does the <div> enter the DOM


// ══════════════════════════════════════════════════════════════════════════
//  FAMILY B — you get a live ELEMENT (a Real's node, dressed by a Component).
//             It IS a node ⇒ appendable. Directives hit the base.
// ══════════════════════════════════════════════════════════════════════════

// B1 — HTML markup (declarative): upgraded on parse → a node in the DOM already
//   <arianna-counter-card initial="5" variant="primary"></arianna-counter-card>

// B2 — document.createElement → a node (a Real, dressed by a Component)
const e = document.createElement('arianna-counter-card');
e.setAttribute('initial', '5');
e.setAttribute('variant', 'primary');
document.body.appendChild(e);            // ✅ valid — e is a node
//  To reach the Component dressing this node:
const eComponent = Component(e);         // ✅ returns the Component for this element

// B3 — new Real / new Virtual over the tag (Layer 1 directly, no Component handle)
import { Real, Virtual } from 'arianna';
new Real('arianna-counter-card').set('initial','5').set('variant','primary').append('#app');
const v = new Virtual('arianna-counter-card').set('initial','5');
v.append('#app');                        // materialises now
```

**The single rule:** constructor / decorator / `extends` (Family A) hand you a
**Component** → go through `.Real` / `.Virtual`. Markup / `createElement`
(Family B) hand you a **node** → append it directly; get its Component via
`Component(node)`.

---

## Example 2: `<arianna-tabs>` — parent/child via `bus`

```typescript
import { Component, signal } from 'arianna';

// ── Child: registers with parent via def.bus ──────────────────────────────
class Tab extends Component('arianna-tab', HTMLElement, {
    ':host': { display: 'block', padding: '8px 16px', cursor: 'pointer', borderBottom: '2px solid transparent' },
    ':host([active])': { borderBottomColor: 'var(--arianna-primary, #e40c88)', fontWeight: '600' },
}, {
    attrs: ['label', 'active'],
    bus  : 'arianna-tabs',
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
        // _children holds the CHILD COMPONENTS (Family A objects), not raw nodes.
        const children = this._children as Tab[];

        children.forEach((tab, i) => {
            // Bind on the child's eager facet — directives/events live at the base.
            tab.Real.on('click', () => {
                this.activeIndex.set(i);
                children.forEach((t, j) => t.set('active', j === i ? '' : null));
            });
        });

        children[0]?.set('active', '');   // delegated sugar → base attribute
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

Each `<arianna-tabs>` gets its own isolated `_children` registry.

---

## Example 3: standalone — `Directive.bootstrap` without components

Directives operate on the base independently of any Component — so they work on
plain markup with no component at all.

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
        scope.State.items = [...scope.State.items, 'Item ' + (scope.State.items.length + 1)];
    },
});

Directive.bootstrap(document.getElementById('app')!, scope);
```

No components, no shadow DOM, no build step.

---

## Example 4: JSX with reactive subscriptions

JSX produces a `Virtual` (lazy facet) — it commits to the DOM on `.append()`.

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
    const toggle = (i: number) =>
        todos.set(todos().map((t, j) => j === i ? { ...t, done: !t.done } : t));

    return (
        <div class="todo-app">
            <h1>Todos</h1>
            <p>{() => `${remain()} remaining`}</p>
            <input value={() => newTxt()} $input={(e: any) => newTxt.set(e.target.value)} placeholder="Add a todo…" />
            <button onClick={add}>Add</button>
            <ul>
                {() => todos().map((t, i) => (
                    <li>
                        <input type="checkbox" .checked={t.done} $change={() => toggle(i)} />
                        <span style={t.done ? 'text-decoration: line-through' : ''}>{t.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

TodoApp().append(document.body);   // the returned Virtual materialises here
```

`{() => remain()}` keeps the subscription live; bare `{remain()}` reads once.

---

## Example 5: Inheritance chain

```typescript
import { Component, Core, Rule, Stylesheet } from 'arianna';

// BaseButton — shared behaviour. `this` is the Component; events bind at the base.
class BaseButton extends Component('arianna-base-button', HTMLElement, {
    ':host': { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', cursor: 'pointer', borderRadius: 'var(--arianna-radius, 6px)', border: 'none', fontWeight: '600', transition: 'background 120ms' },
    ':host([disabled])': { opacity: '0.5', cursor: 'not-allowed' },
}, {
    attrs: ['disabled', 'loading'],
}) {
    // @click on the template binds to the base element, independent of `this`.
    template = `
        <span a-if="this.attrSignal('loading').get() !== null">⏳</span>
        <slot @click="this.onClick"></slot>
    `;

    onClick = (e: Event) => {
        if (this.get('disabled') !== null || this.get('loading') !== null) {
            e.stopImmediatePropagation();
        }
    };
}

// PrimaryButton — re-extends BaseButton (Real chain re-spliced; Virtual re-chains at render).
class PrimaryButton extends BaseButton {
    static {
        PrimaryButton.Sheet.Default = new Stylesheet([
            ...BaseButton.Sheet.Default.Rules,
            new Rule(':host', { background: 'var(--arianna-primary, #e40c88)', color: '#fff' }),
            new Rule(':host(:hover):not([disabled]):not([loading])', { background: 'var(--arianna-primary-hover, #c00673)' }),
        ]);
    }
}
Core.Define('arianna-primary-button', PrimaryButton);

class GhostButton extends BaseButton {
    static {
        GhostButton.Sheet.Default = new Stylesheet([
            ...BaseButton.Sheet.Default.Rules,
            new Rule(':host', { background: 'transparent', border: '1px solid var(--arianna-border, #ddd)', color: 'var(--arianna-text, #1f2328)' }),
            new Rule(':host(:hover):not([disabled]):not([loading])', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
        ]);
    }
}
Core.Define('arianna-ghost-button', GhostButton);
```

```html
<arianna-primary-button>Save</arianna-primary-button>
<arianna-primary-button loading>Saving…</arianna-primary-button>
<arianna-ghost-button>Cancel</arianna-ghost-button>
```

(Markup usage is Family B — the page gets nodes; each is a Real dressed by its
Component.)

---

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| `appendChild(myComponent)` does nothing / throws | A Component is not a node. Use `myComponent.Real.append(p)` or `myComponent.Virtual.render().append(p)`. |
| `new MyClass()` then `appendChild(it)` | `new MyClass()` is **Family A** → a Component. Append via `.Real`/`.Virtual`. |
| `this.addEventListener(...)` inside a component | `this` is the Component, not the node. Use `this.Real.on(...)` or a template `@event`. |
| `this.getAttribute(...)` / `this.setAttribute(...)` | Use the delegated sugar `this.get(name)` / `this.set(name, v)`, or `this.Real.get/set`. |
| Can't find the Component for a `createElement` node | `Component(node)` returns the Component dressing it. |
| `{{ this.count }}` prints `[object Object]` | Invoke the signal: `{{ this.count() }}`. |
| Handler `this` is undefined | Use class-property arrows (`fn = () => {…}`), not method syntax. |
| Local vars in `build()` not visible in template | Templates can't see closures — promote to `this.something`. |
| `Sheet.Default` change has no effect on existing instances | `Sheet.Default` seeds new instances; for live mutation write to `instance.Sheet`. |
| `a-else` not working | Must be the immediate next-sibling element of `a-if` (no text nodes between). |
| `a-for` doesn't update on `arr().push()` | Replace the reference: `arr.set([...arr(), item])`. |
| JSX `{count()}` not reactive | Wrap in arrow: `{() => count()}`. |
