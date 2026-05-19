# Complete Worked Examples

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
