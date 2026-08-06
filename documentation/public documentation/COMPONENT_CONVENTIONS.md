<!-- ════════════════════════════════════════════════════════════════════════
     CANONICAL MODEL BANNER — read ARCHITECTURE.md FIRST.
     This conventions doc still contains v1 phrasings where a Component is
     treated as the element. The BINDING model is the 4-layer one:

       Core.Create   →  Element (Layer 0, DOM only)
       Real/Virtual  →  Element + fluent API (Layer 1)  — Real=Lit, Virtual=React/Vue
       Component     →  super-layer over a Real + a Virtual (Layer 2):
                        owns reactivity/lifecycle/observers, syncs both facets,
                        is NOT a DOM node, NEVER leaks the node. Reach the DOM
                        ONLY via  component.Real  /  component.Virtual.
       Directives    →  fire at the BASE, independent of the Component (Layer 3)

     RULE OF THUMB while reading below:
       • `extends Component(...)` / `@Component` / `new Component(...)` / `new MyClass()`
         → you get a COMPONENT (not a node). Append via .Real / .Virtual.
       • `document.createElement('arianna-x')` / markup
         → you get a NODE (a Real, dressed by a Component). Append directly;
           get its Component via Component(node).
       • Inside a Component class, `this` is the COMPONENT, not the element.
         DOM ops go through this.Real / delegated sugar (this.set/get/sub,
         this.attrSignal, this.fire, this.RenderRoot).

     Where this file's prose says "the component IS the element" or shows
     `appendChild(componentInstance)` / `this.setAttribute(...)`, treat it as
     SUPERSEDED by ARCHITECTURE.md until the full conformance pass lands.
     ════════════════════════════════════════════════════════════════════════ -->

# AriannA — Component Conventions

**Purpose**: the single canonical specification for defining and instantiating components in the AriannA framework. Every one of the 140+ components in `components/*` must follow this spec. This document supersedes any previous convention file.

**Audience**: framework users, contributors, and AI assistants generating component code.

---

## §0. Why this document exists

The 140+ components in `components/*` have historically followed three different conventions. This document defines:

1. The **single canonical pattern** all components must follow
2. The **three call forms** of `Component(...)`: factory, decorator, constructor
3. The **two overloads** of `Core.Define(...)`
4. The **five definition cases** (1-5) covering every syntactic form a user might write
5. The **six instantiation forms** producing identical DOM regardless of which is used
6. All seven **decorators** (`@Component`, `@Prop`, `@State`, `@Watch`, `@Event`, `@Bind`, `@Sheet`)
7. The complete **JSX runtime** integration
8. All **lifecycle hooks** (9 total)

If anything in this file contradicts code, the file wins — the code should be updated.

---

## §1. Decisions (frozen)

| ID | Topic | Decision |
|----|-------|----------|
| Q1 | Component class definition | `class X extends Component(tag, super, css?, def?)` (Case 4), or `@Component(...) class X extends Super` (Case 5), or `Core.Define(...)` (Cases 1, 2, 3) |
| Q2 | Element upgrade mechanism | `MutationObserver` watches `document.documentElement` and calls `Namespace.Update(node)`. **No `customElements.define` is used** — AriannA uses prototype splicing via `Reflect.construct`. |
| Q3 | Styling | `Sheet.Default` / `Sheet.Current` (type `Stylesheet`) — seeded by the `css` argument; inheritable by subclasses |
| Q4 | Reactive backbone | `signal`, `effect`, `computed`, `batch`, sinks (see `REACTIVITY.md`) |
| Q5 | `Component()` signatures | **Three call forms**: factory `Component(tag, super, css?, def?)`, decorator `@Component(...)`, constructor `new Component(tag, opts?)` |
| Q6 | `Core.Define()` signatures | **Two overloads**: explicit super (`Define(tag, ctor, super, css?, def?)`) and implicit super (`Define(tag, ctor, css?, def?)`) — discriminated at runtime by the third arg's type |
| Q7 | Tag naming | Any `string`. AriannA does NOT enforce W3C custom-element naming rules (lowercase, hyphen, reserved names). Case-insensitive lookup. |
| Q8 | Superclass | Any class whose prototype chain reaches a registered namespace root (`HTMLElement`, `SVGElement`, `MathMLElement`, custom-registered namespaces) |
| Q9 | Instantiation forms | **Six**: HTML markup, `new Real('tag')`, `new Virtual('tag')`, `new Component('tag', opts?)`, `new MyClass()`, `document.createElement('tag')` |
| Q10 | Definition cases | **Five**: see §6 |

---

## §2. Tag naming

### Rules

AriannA accepts **any string** as a tag name. The framework does NOT use the W3C `customElements.define` mechanism, so the standard custom-element constraints do NOT apply:

- ✓ `'arianna-button'` — kebab-case (conventional)
- ✓ `'papa'` — single word, no hyphen
- ✓ `'Cuore'` — PascalCase
- ✓ `'CUORE'` — all-caps
- ✓ `'my_widget'` — underscore
- ✓ `'x'` — single character
- ✓ `'123tag'` — starts with digit
- ✓ `'my:element'` — colon (allowed but discouraged)

### Lookup is case-insensitive

`Core.Define('Cuore', ...)` and `Core.Define('cuore', ...)` register under the same canonical key. Internally tag names are lowercased.

### Collision with native HTML/SVG tags

Choosing a name that collides with a standard tag (e.g. `'div'`) is **allowed but strongly discouraged**: the browser parses the markup as the native element, and AriannA overlays its prototype on top — potentially breaking native behaviour if the user class does not extend the corresponding native element.

```ts
// Permitted but RISKY:
Core.Define('div', MyDiv, HTMLElement);  // overlays HTMLDivElement prototype with MyDiv
```

### Convention for project components

For the 140+ in-tree components, the convention is `arianna-<name>` with kebab-case:

- ✓ `arianna-button`, `arianna-card`, `arianna-code-editor`, `arianna-data-table`
- ✗ `Button`, `card-arianna`, `arianna_button`

This convention applies to project components only — third-party users are free.

---

## §3. The `Component(...)` API — three call forms

`Component` is a single export with three call modes, discriminated at runtime by how it is invoked.

### §3.1 Factory: `Component(tag, super, css?, def?)`

**Used to**: define a new custom element by being placed inside `extends`. Returns an anonymous class extending `super`.

```ts
import { Component } from 'arianna';

class Button extends Component(
    'arianna-button',         // 1. tag
    HTMLElement,              // 2. super (browser base class or AriannA component)
    {                         // 3. css (optional) — seeds Sheet.Default
        ':host':              { display: 'inline-flex', padding: '5px 14px' },
        ':host([variant="primary"])': { background: '#1f6feb' },
    },
    {                         // 4. def (optional) — { attrs, shadow, bus, render }
        attrs : ['variant', 'size', 'icon', 'disabled'],
        shadow: 'closed',
    }
) {
    build(opts) { /* ... */ }
}
```

**Arguments:**

| # | Name | Type | Optional |
|---|------|------|----------|
| 1 | `tag` | `string` (any — see §2) | required |
| 2 | `super` | `Constructor<Element>` (HTML/SVG/Math/X3D base, custom user class, or another `Component(...)` class) | required |
| 3 | `css` | `CssInput` (5 forms — see §5.7) | optional |
| 4 | `def` | `ComponentDef` (see §5.1) | optional |

**Class identity (v2 — eager registration)**: the class that extends `Component(...)` is **the** user class. The chain is `MyClass → Component → super` — a SINGLE shared `Component` link per base interface (no per-tag bridge/wrapper, no anonymous parent). `Component(tag, super, …)` calls `Core.Define` under the hood, which registers the descriptor BEFORE use; `descriptor.Class` is populated **eagerly** and refined to the precise user subclass via `new.target` on the first `new MyClass()` / `Reflect.construct(MyClass, …)`, or immediately via `Component.Define(tag, MyClass)`. There is no `window`/global scan.

**Base class — extend the MOST-SPECIFIC native interface (v2 rule)**: a component extends the browser interface whose behaviour it wants, not plain `HTMLElement` by default. A button extends `HTMLButtonElement`, an input `HTMLInputElement`, a list `HTMLUListElement`, etc. Plain `HTMLElement` is for genuinely generic/box components only. When a component extends a CONCRETE built-in the host element IS that element — it must NOT also wrap an inner native element of the same kind (no `<button>` inside a button-based component). Style the host via `:host`.

**`descriptor.Native`**: set by Define to `true` when the tag contains a hyphen. It marks the tag as eligible for native `customElements.define` (autonomous `HTMLElement`-based tags only) and native shadow; read it via `GetTag`/`GetInterface`/`GetDescriptor`. Concrete built-in bases (button/input/…) are NOT natively defined — they upgrade via AriannA's `MutationObserver` + prototype splicing (cross-browser, Safari included).

**Markup-only components — call `Component.Define`**: a component placed in markup but never instantiated via `new` registers its class up front so `descriptor.Class` is set without any global scan:

```ts
class Button extends Component('arianna-button', HTMLButtonElement, css, def) { … }
Component.Define('arianna-button', Button);   // eager Class binding for markup upgrade
```

This replaces the legacy `window.Button = Button` side-effect (the old global-scan recovery is removed).

---

### §3.2 Decorator: `@Component(...)` — two overloads

**Used to**: define a new custom element by decorating an existing class. The class declaration writes `extends Super` directly.

#### §3.2.1 Object-style overload — `@Component({ ... })`

```ts
import { Component, Prop } from 'arianna';

@Component({
    tag      : 'arianna-greet',
    template : '<button><slot></slot></button>',
    style    : ':host { color: #e40c88; }',
    shadow   : 'open',
    attrs    : ['name'],
})
class Greet extends HTMLElement {
    @Prop() name = 'AriannA';
    connectedCallback() { /* ... */ }
}
```

Accepted keys in the object:

| Key | Type | Notes |
|-----|------|-------|
| `tag` | `string` | required |
| `template` | `string` | optional — same as setting `this.template = ...` |
| `style` | `string \| Rule \| Stylesheet \| object` | optional — equivalent to factory `css` arg |
| `css` | (alias of `style`) | optional |
| `shadow` | `'open' \| 'closed' \| false` | optional — same as `def.shadow` |
| `attrs` | `string[]` | optional — same as `def.attrs` |
| `bus` | `string` | optional — same as `def.bus` |
| `render` | `'real' \| 'virtual'` | optional — same as `def.render` |
| `base` | `Constructor<Element>` | optional — if class has no explicit `extends Super`, the decorator uses this; otherwise inferred from `Object.getPrototypeOf(target.prototype)` |

#### §3.2.2 Positional-style overload — `@Component(tag, css?, def?)`

Matches the factory call signature exactly, except the user class is the decorator target (so no `super` argument — it is read from `extends` of the class).

```ts
@Component('arianna-greet',
    { ':host': { color: '#e40c88' } },
    { shadow: 'open', attrs: ['name'] }
)
class Greet extends HTMLElement {
    name = 'AriannA';
    connectedCallback() { /* ... */ }
}
```

The decorator distinguishes the two overloads at runtime: if the first argument is a plain object with a `tag` key, it's the object-style; if it's a string, it's positional.

#### Caveat — decorator runtime

AriannA uses TypeScript 5.x's **standard ES2023 decorator** syntax (NOT the legacy `experimentalDecorators`). The decorator factory receives `(target, context)` and returns a (possibly modified) class.

```ts
// Standard decorator signature AriannA expects
type ClassDecorator<T extends abstract new (...args: any[]) => any> = (
    target  : T,
    context : ClassDecoratorContext
) => T | void;
```

---

### §3.3 Constructor: `new Component(tag, opts?)`

**Used to**: instantiate an already-defined custom element programmatically. Returns a `ComponentWrapper` exposing `.Real` (eager) and `.Virtual` (lazy) over the **same underlying element**.

```ts
const wrap = new Component('arianna-counter', { initial: 5 });

wrap.element;              // → Element (live DOM node)
wrap.tag;                  // → 'arianna-counter'

// Real — eager, fluent API
wrap.Real.set('variant', 'primary')
         .style('color', () => 'red')
         .on('click', e => console.log(e))
         .append('#app');

// Virtual — lazy, same fluent API, same underlying element
wrap.Virtual.append('#app');

// valueOf / render — get the Element
wrap.render();
```

`opts` is applied to the new element via `Real.set(name, value)` (case-insensitive, attribute or property — see `REAL_VIRTUAL.md` §2.3).

---

## §4. `Core.Define(...)` — two overloads

`Core.Define` is the imperative registration API. It accepts both **plain function constructors** and **class constructors**. The third argument is the discriminator between the two overloads.

### §4.1 Overload A — explicit superclass

```ts
Core.Define(tag, ctor, super, css?, def?);
```

Used when `ctor` does NOT have its own `extends` to AriannA's knowledge — i.e. a plain function (`function A() {}`) or a class without `extends` (`class A {}`). The third argument is the **browser base class** (or another registered AriannA class) to use as superclass.

| # | Name | Type | Optional |
|---|------|------|----------|
| 1 | `tag` | `string` | required |
| 2 | `ctor` | `Function` (class or plain function constructor) | required |
| 3 | `super` | `Constructor<Element>` | required |
| 4 | `css` | `CssInput` | optional |
| 5 | `def` | `ComponentDef` | optional |

### §4.2 Overload B — implicit superclass (from `extends`)

```ts
Core.Define(tag, ctor, css?, def?);
```

Used when `ctor` is a class that **already has** an `extends` (i.e. `class A extends B { ... }`). AriannA reads the superclass from `Object.getPrototypeOf(ctor.prototype).constructor`.

| # | Name | Type | Optional |
|---|------|------|----------|
| 1 | `tag` | `string` | required |
| 2 | `ctor` | `Function` (must have `extends`) | required |
| 3 | `css` | `CssInput` | optional |
| 4 | `def` | `ComponentDef` | optional |

### §4.3 Discriminator runtime

The third argument distinguishes the two overloads:

- If `typeof arg3 === 'function'` AND `arg3.prototype instanceof Element` (or the prototype chain reaches a registered namespace root) → **Overload A**, `arg3` is the superclass.
- Otherwise (plain object, Rule, Stylesheet, array, string, null, undefined) → **Overload B**, `arg3` is the `css`.

```ts
// Overload A (explicit super)
function A() { this.textContent = 'a'; }
Core.Define('a', A, HTMLElement, { display: 'block' });

// Overload B (implicit super, A extends HTMLElement is read)
class A extends HTMLElement { build() { /* ... */ } }
Core.Define('a', A, { display: 'block' });
```

---

## §5. Detailed conventions

### §5.1 `ComponentDef` interface

The fourth argument of `Component(tag, super, css?, def?)` and the fifth of `Core.Define(tag, ctor, super, css?, def?)`:

```ts
interface ComponentDef {
    /** Observed attribute names (kebab-case in HTML, exposed as signals via this.attrSignal(name)). */
    attrs?  : string[];

    /** Shadow DOM projection mode. Default: 'closed'. Use false to opt out (light DOM). */
    shadow? : 'open' | 'closed' | false;

    /** Event-bus name for parent/child registration. See §5.4. */
    bus?    : string;

    /** JSX render mode for this component. Default inherits from project config. */
    render? : 'real' | 'virtual';
}
```

### §5.2 `attrs` — reactive attribute list

Declares which HTML attributes are observed by the component. Each becomes a `Signal<string | null>` accessible via `this.attrSignal(name)`.

```ts
class Button extends Component('arianna-button', HTMLElement, {}, {
    attrs: ['variant', 'size', 'disabled'],
}) {
    build() {
        const variant = this.attrSignal('variant');

        effect(() => console.log('variant is', variant.get()));

        variant.set('primary');  // writes to DOM attribute + notifies subscribers
    }
}
```

See `REACTIVITY.md` §8 for the full bidirectional attr↔signal contract.

### §5.3 `shadow` — projection backend

Three modes:

| Value | Effect |
|-------|--------|
| `'closed'` (default) | Shadow root attached, mode `closed`. `element.shadowRoot` returns `null` externally. Use `this.Host` to access. |
| `'open'` | Shadow root attached, mode `open`. `element.shadowRoot` accessible. |
| `false` | Light DOM. No shadow root. `this.appendChild(...)` works normally. Used by `CodeEditor` and other overlay-pattern components. |

```ts
// Closed shadow (default — most components)
class Card extends Component('arianna-card', HTMLElement, css, { shadow: 'closed' }) { /* ... */ }

// Open shadow — when external code needs to introspect/manipulate internals
class Modal extends Component('arianna-modal', HTMLElement, css, { shadow: 'open' }) { /* ... */ }

// Light DOM — when the component uses overlay patterns (pre+textarea, canvas hit testing, ...)
class CodeEditor extends Component('arianna-code-editor', HTMLElement, css, { shadow: false }) { /* ... */ }
```

### §5.4 `bus` — sub-component registration

When a parent component has children of a related type, the bus mechanism wires them automatically:

```ts
class Tab extends Component('arianna-tab', HTMLDivElement, {}, {
    bus: 'tabs',
}) { /* ... */ }

class Tabs extends Component('arianna-tabs', HTMLDivElement) { /* ... */ }

// Children with bus: 'tabs' are auto-registered with parent Tabs
// Each Tab gets this.parent === <arianna-tabs> ancestor
// Tabs gets this.children === [<arianna-tab>, ...]
```

### §5.5 `build(opts)` — main render hook

The canonical place to construct the component sub-tree. Called automatically by `onCreated` (default lifecycle hook), runs for both `new MyClass()` and markup `<my-tag>` upgrade.

```ts
class Card extends Component('arianna-card', HTMLElement, css, def) {
    build(opts) {
        const wrap = new Real('div').set('class', 'card-wrap');
        const title = new Real('h2').text(() => this.title.get());
        const slot = new Real('slot');

        wrap.add(title).add(slot);
        wrap.append(this.Host);   // this.Host = shadow root or `this` depending on def.shadow
    }
}
```

Both `Real` and `Virtual` are valid for sub-tree construction inside `build()`. See `REAL_VIRTUAL.md`.

### §5.6 Template + Style — three supported approaches

#### §5.6.1 String `template` class property (Vue-style, recommended)

```ts
class Button extends Component('arianna-button', HTMLElement, css, { attrs: ['variant'] }) {
    template = `
        <button :class="this.variantClass()" @click="this.onClick">
            <slot></slot>
        </button>
    `;

    onClick(e) { /* ... */ }
}
```

See `TEMPLATE_DIRECTIVES.md` for the full directive set.

#### §5.6.2 Tagged template literal — `html\`...\``

```ts
import { html } from 'arianna';

class Button extends Component('arianna-button', HTMLElement, css, { attrs: ['variant'] }) {
    build() {
        this.template = html`
            <button class=${() => this.variantClass()} onclick=${(e) => this.onClick(e)}>
                <slot></slot>
            </button>
        `;
    }
}
```

Same template engine, but interpolation uses `${}` instead of `{{ }}` and JS expressions are captured by closure (not parsed as strings). Useful when you need direct closure access.

#### §5.6.3 JSX

```tsx
class Button extends Component('arianna-button', HTMLElement, css, { attrs: ['variant'] }) {
    build() {
        return (
            <button class={this.variantClass()} onClick={(e) => this.onClick(e)}>
                <slot />
            </button>
        );
    }
}
```

See §7 for the full JSX runtime.

### §5.7 `css` argument — five accepted forms

The third argument of `Component(tag, super, css, def)` (or `Core.Define`) is converted internally to a `Stylesheet` and assigned to `<ClassName>.Sheet.Default`.

#### Form A — plain object (single rule on `:host`)

```ts
Component('arianna-button', HTMLElement, {
    display       : 'inline-flex',
    padding       : '5px 14px',
    background    : '#1f6feb',
    color         : 'white',
})
```

Wrapped internally as: `new Rule(':host', {...})`.

#### Form B — nested object (selector → declarations)

```ts
Component('arianna-button', HTMLElement, {
    ':host': {
        display: 'inline-flex',
        padding: '5px 14px',
    },
    ':host([variant="primary"])': {
        background: '#1f6feb',
        color     : 'white',
    },
    ':host:hover': {
        opacity: '0.9',
    },
})
```

Wrapped internally as: `new Stylesheet(new Rule(':host', {...}), new Rule(':host([variant="primary"])', {...}), ...)`.

#### Form C — `Rule` instance

```ts
import { Rule } from 'arianna';

Component('arianna-button', HTMLElement,
    new Rule(':host', {
        display    : 'inline-flex',
        padding    : '5px 14px',
        background : '#1f6feb',
    })
)
```

#### Form D — `Stylesheet` instance

```ts
import { Rule, Stylesheet } from 'arianna';

Component('arianna-button', HTMLElement,
    new Stylesheet(
        new Rule(':host',                       { display: 'inline-flex' }),
        new Rule(':host([variant="primary"])',  { background: '#1f6feb' }),
        new Rule(':host:hover',                 { opacity: '0.9' }),
    )
)
```

#### Form E — array of Rules

```ts
Component('arianna-button', HTMLElement, [
    new Rule(':host',                       { display: 'inline-flex' }),
    new Rule(':host([variant="primary"])',  { background: '#1f6feb' }),
])
```

Internally wrapped as `new Stylesheet(...rules)`.

#### Form F — raw CSS string

```ts
Component('arianna-button', HTMLElement, `
    :host {
        display: inline-flex;
        padding: 5px 14px;
    }
    :host([variant="primary"]) {
        background: #1f6feb;
    }
`)
```

Parsed via the AriannA CSS tokeniser and wrapped as a `Stylesheet`.

### §5.8 `Sheet.Default` / `Sheet.Current`

Every component class has two Sheet slots:

| Slot | Scope | Inheritance | Where it comes from |
|------|-------|-------------|---------------------|
| `MyClass.Sheet.Default` | static (per class) | Inheritable in subclasses | Seeded from the `css` factory argument |
| `instance.Sheet.Current` | per-instance | Overrides Default for that instance | User-set at runtime via `this.Sheet.Current = ...` |

```ts
class Button extends Component('arianna-button', HTMLElement, {
    ':host': { background: '#1f6feb' },
}) { /* ... */ }

Button.Sheet.Default;   // → Stylesheet from the css arg

class PrimaryButton extends Button {}
PrimaryButton.Sheet.Default;   // → inherits Button.Sheet.Default unless overridden

const inst = new Button();
inst.Sheet.Current = new Stylesheet(new Rule(':host', { background: 'red' }));
// → this instance only has red background
```

### §5.9 Lifecycle hooks (9 total)

```ts
interface LifecycleHooks {
    onCreated?       (): void;   // After build() inputs ready, before sub-tree is built
    onConnected?     (): void;   // When inserted into a document tree (HTMLElement.connectedCallback)
    onDisconnected?  (): void;   // When removed from the document tree
    onMount?         (): void;   // After sub-tree is fully built and connected
    onUnmount?       (): void;   // Before removal — cleanup hook
    onBeforeUpdate?  (): void;   // Before each reactive re-render of the template
    onUpdate?        (): void;   // After reactive re-render
    onAttributeChanged?(name: string, oldVal: string | null, newVal: string | null): void;
    onAdopted?       (): void;   // When moved to a different document (HTMLElement.adoptedCallback)
}
```

Firing order for a markup-instantiated component:

```
1. constructor (anonymous parent from Component(...))
2. _initFields  (signals, refs)
3. onCreated    (default → calls build())
4. build()      (constructs sub-tree)
5. onConnected  (DOM-attached)
6. onMount      (post-build, post-connect)
7. ...usage...
8. onBeforeUpdate ↔ onUpdate (each reactive cycle)
9. onAttributeChanged (each attribute mutation)
10. onUnmount   (before disconnect)
11. onDisconnected (DOM-detached)
```

See `LIFECYCLE.md` for the full firing-order specification and cleanup contract.

### §5.10 `this.Host` — render target

Inside `build()`, use `this.Host` instead of `this.appendChild(...)`:

```ts
build() {
    const tree = new Real('div').set('class', 'wrap');
    tree.append(this.Host);   // shadow root if def.shadow !== false, else `this`
}
```

`this.Host` returns:

- `this.shadowRoot` if `def.shadow === 'open'` or `'closed'`
- `this` (the element itself) if `def.shadow === false`

This makes `build()` agnostic to the shadow setting.

### §5.11 `constructor` vs `build()`

| | Runs for `new MyClass()` | Runs for markup `<my-tag>` |
|---|---|---|
| `constructor` (overridden) | ✓ | ✓ (post-1.5 refactor via `Reflect.construct`) |
| `build()` | ✓ | ✓ |

Use `build()` as the canonical hook. Override `constructor` only if you have specific reasons (early initialization that must precede facilities install). Always call `super(...args)` first.

---
## §6. The five definition cases — complete examples

This section covers every syntactic form a user can write to define a custom element. Each case has a fixed set of arguments based on the **unified rule**:

> **Everything syntactically visible (extends of a class, target of a decorator) is NOT repeated as argument. Everything NOT syntactically visible is passed explicitly.**

Summary:

| Case | User syntax | API signature | Class explicit? | Super explicit? |
|------|-------------|---------------|-----------------|-----------------|
| 1 | `function A; Core.Define(...)` | `Core.Define(tag, A, super, css?, def?)` | yes (arg 2) | yes (arg 3) |
| 2 | `class A; Core.Define(...)` | `Core.Define(tag, A, super, css?, def?)` | yes (arg 2) | yes (arg 3) |
| 3 | `class A extends B; Core.Define(...)` | `Core.Define(tag, A, css?, def?)` | yes (arg 2) | implicit (extends B) |
| 4 | `class A extends Component(...)` | `Component(tag, super, css?, def?)` | implicit (left of extends) | yes (arg 2) |
| 5 | `@Component(...) class A extends Super` | `@Component(tag, css?, def?)` or `@Component({...})` | implicit (decorator target) | implicit (extends Super) |

---

### §6.1 Case 1 — `function A` + `Core.Define`

Plain function constructor registered imperatively. No class body, no `extends`, no lifecycle hooks (beyond what AriannA wires automatically).

**Pattern**: `Core.Define(tag, ctor, super, css?, def?)`

#### 1a — CSS as plain object (wrapped in `Rule(':host', ...)` internally)

```ts
function A() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-a',
    A,
    HTMLElement,
    { display: 'block', padding: '12px' },
);
```

#### 1b — CSS as `Rule` instance

```ts
import { Rule } from 'arianna';

function B() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-b',
    B,
    HTMLElement,
    new Rule(':host', {
        display    : 'block',
        padding    : '12px',
        background : 'crimson',
    }),
);
```

#### 1c — CSS as `Stylesheet` instance (multiple rules)

```ts
import { Rule, Stylesheet } from 'arianna';

function C() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-c',
    C,
    HTMLElement,
    new Stylesheet(
        new Rule(':host',        { display: 'block', padding: '12px' }),
        new Rule(':host:hover',  { background: '#f0f0f0' }),
        new Rule(':host .inner', { color: '#333' }),
    ),
);
```

#### 1d — CSS as nested object (selector → declarations)

```ts
function D() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-d',
    D,
    HTMLElement,
    {
        ':host':        { display: 'block', padding: '12px' },
        ':host:hover':  { background: '#f0f0f0' },
        ':host .inner': { color: '#333' },
    },
);
```

#### 1e — CSS plain object + def

```ts
function E() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-e',
    E,
    HTMLElement,
    { display: 'block', padding: '12px' },
    { shadow: 'closed', attrs: ['variant'] },
);
```

#### 1f — Rule + def

```ts
import { Rule } from 'arianna';

function F() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-f',
    F,
    HTMLElement,
    new Rule(':host', { display: 'block', padding: '12px' }),
    { shadow: 'open', attrs: ['variant', 'size'] },
);
```

#### 1g — Stylesheet + def

```ts
import { Rule, Stylesheet } from 'arianna';

function G() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-g',
    G,
    HTMLElement,
    new Stylesheet(
        new Rule(':host',         { display: 'block' }),
        new Rule(':host[active]', { background: '#e40c88' }),
    ),
    { shadow: 'closed', attrs: ['active'], bus: 'tabs' },
);
```

#### 1h — Nested object + def

```ts
function H() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-h',
    H,
    HTMLElement,
    {
        ':host':              { display: 'block', padding: '12px' },
        ':host:focus-within': { outline: '2px solid var(--ar-primary)' },
    },
    { shadow: 'open', attrs: ['disabled'] },
);
```

#### 1i — SVG superclass

```ts
function I() {
    this.setAttribute('viewBox', '0 0 100 100');
}

Core.Define(
    'arianna-i',
    I,
    SVGSVGElement,
    { display: 'block', width: '100px', height: '100px' },
    { shadow: false },
);
```

#### 1j — Specific HTML*Element superclass

```ts
function J() {
    this.type = 'button';
    this.textContent = 'Click me';
}

Core.Define(
    'arianna-j',
    J,
    HTMLButtonElement,
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'closed' },
);
```

#### 1k — Minimal (no css, no def)

```ts
function K() {
    this.textContent = 'Hello';
}

Core.Define('arianna-k', K, HTMLElement);
```

#### 1l — def only (no css)

```ts
function L() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-l',
    L,
    HTMLElement,
    null,                                       // explicit null
    { shadow: 'closed', attrs: ['variant'] },
);
```

#### 1m — Superclass is a user-derived class

```ts
class MyBase extends HTMLDivElement {
    sayHi() { console.log('hi from MyBase'); }
}

function M() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-m',
    M,
    MyBase,                                     // user-derived from HTMLDivElement
    { display: 'block', padding: '12px' },
    { shadow: 'closed' },
);
// Each <arianna-m> has sayHi() inherited
```

#### 1n — Superclass is a multi-level user chain

```ts
class L1 extends HTMLElement { foo() { return 'L1.foo'; } }
class L2 extends L1           { bar() { return 'L2.bar'; } }
class L3 extends L2           { baz() { return 'L3.baz'; } }

function N() {
    this.textContent = 'Hello';
}

Core.Define(
    'arianna-n',
    N,
    L3,
    new Rule(':host', { display: 'block' }),
    { shadow: 'open' },
);
// Each <arianna-n> has foo(), bar(), baz()
```

#### 1o — Superclass is another AriannA component

```ts
class Card extends Component('arianna-card', HTMLDivElement, cardCss, { shadow: 'closed' }) {
    build() { /* ... */ }
    cardMethod() { return 'card'; }
}

function O() {
    this.textContent = 'fancy card';
}

Core.Define(
    'arianna-o',
    O,
    Card,                                       // AriannA component as super
    { background: '#fce4f0' },
    { shadow: 'closed' },
);
```

#### 1p — Superclass is SVG-derived custom

```ts
class SvgIcon extends SVGSVGElement {
    setIcon(name: string) { /* ... */ }
}

function P() {
    this.setAttribute('viewBox', '0 0 100 100');
}

Core.Define(
    'arianna-p',
    P,
    SvgIcon,
    { width: '24px', height: '24px' },
    { shadow: false },
);
```

#### 1q — Superclass is MathML-derived

```ts
class MathBase extends MathMLElement { /* ... */ }

function Q() {
    this.setAttribute('display', 'block');
}

Core.Define(
    'arianna-q',
    Q,
    MathBase,
    { color: '#333' },
);
```

#### 1r — Superclass from custom-registered namespace (X3D)

```ts
import { X3DGroupElement } from 'some-x3d-pkg';

function R() { /* ... */ }

Core.Define(
    'arianna-r',
    R,
    X3DGroupElement,                            // namespace x3d (registered separately)
    {},
    { shadow: false },
);
```

---

### §6.2 Case 2 — `class A` (no extends) + `Core.Define`

Class declaration without `extends`. The user class has no parent set, AriannA splices the superclass via prototype manipulation at Define time.

**Pattern**: `Core.Define(tag, ctor, super, css?, def?)`

#### 2a — CSS as plain object

```ts
class A {
    build() {
        this.textContent = 'Hello A';
    }
}

Core.Define(
    'arianna-class-a',
    A,
    HTMLElement,
    { display: 'block', padding: '12px' },
);
```

#### 2b — CSS as Rule

```ts
import { Rule } from 'arianna';

class B {
    method() { return 'b-method'; }
}

Core.Define(
    'arianna-class-b',
    B,
    HTMLElement,
    new Rule(':host', { background: 'lightblue' }),
);
```

#### 2c — CSS as Stylesheet

```ts
class C {
    onMount() { console.log('C mounted'); }
}

Core.Define(
    'arianna-class-c',
    C,
    HTMLElement,
    new Stylesheet(
        new Rule(':host',       { display: 'flex' }),
        new Rule(':host > *',   { flex: 1 }),
    ),
);
```

#### 2d — CSS as nested object

```ts
class D {
    /* ... */
}

Core.Define(
    'arianna-class-d',
    D,
    HTMLElement,
    {
        ':host':       { display: 'block' },
        ':host:hover': { background: '#eee' },
    },
);
```

#### 2e — CSS + def

```ts
class E {
    onCreated() { console.log('E created'); }
    onMount()   { console.log('E mounted'); }
}

Core.Define(
    'arianna-class-e',
    E,
    HTMLElement,
    { display: 'block' },
    { shadow: 'closed', attrs: ['variant'] },
);
```

#### 2f — Rule + def

```ts
class F {
    handleClick(e: Event) { /* ... */ }
}

Core.Define(
    'arianna-class-f',
    F,
    HTMLElement,
    new Rule(':host', { padding: '8px' }),
    { shadow: 'open', attrs: ['disabled'], bus: 'forms' },
);
```

#### 2g — Stylesheet + def

```ts
class G {
    /* ... */
}

Core.Define(
    'arianna-class-g',
    G,
    HTMLElement,
    new Stylesheet(
        new Rule(':host',          { display: 'block' }),
        new Rule(':host([open])',  { background: '#fff' }),
    ),
    { shadow: 'closed', attrs: ['open'], render: 'virtual' },
);
```

#### 2h — Nested + def

```ts
class H {
    /* ... */
}

Core.Define(
    'arianna-class-h',
    H,
    HTMLElement,
    {
        ':host':       { display: 'inline-block' },
        ':host:focus': { outline: '2px solid blue' },
    },
    { shadow: 'closed', attrs: ['tabindex'] },
);
```

#### 2i — SVG superclass

```ts
class I {
    setIcon(name: string) { /* ... */ }
}

Core.Define(
    'arianna-class-i',
    I,
    SVGSVGElement,
    { width: '32px', height: '32px' },
);
```

#### 2j — Specific HTML*Element

```ts
class J {
    onChange(e: Event) { /* ... */ }
}

Core.Define(
    'arianna-class-j',
    J,
    HTMLInputElement,
    new Rule(':host', { fontFamily: 'monospace' }),
    { attrs: ['placeholder'] },
);
```

#### 2k — Minimal

```ts
class K {
    /* ... */
}

Core.Define('arianna-class-k', K, HTMLElement);
```

#### 2l — def only (css = null)

```ts
class L {
    /* ... */
}

Core.Define(
    'arianna-class-l',
    L,
    HTMLElement,
    null,
    { shadow: 'closed' },
);
```

#### 2m — User-derived superclass

```ts
class MyBase extends HTMLDivElement { /* ... */ }

class M {
    /* ... */
}

Core.Define('arianna-class-m', M, MyBase);
```

#### 2n — Multi-level superclass chain

```ts
class L1 extends HTMLElement { /* ... */ }
class L2 extends L1           { /* ... */ }

class N {
    /* ... */
}

Core.Define('arianna-class-n', N, L2);
```

#### 2o — Superclass is AriannA component

```ts
class Card extends Component('arianna-card', HTMLDivElement, cardCss, { shadow: 'closed' }) {
    build() { /* ... */ }
}

class O {
    /* extends Card behaviour at registration time */
}

Core.Define('arianna-class-o', O, Card);
```

#### 2p — SVG-derived custom super

```ts
class SvgIconBase extends SVGSVGElement {
    setIcon(name: string) { /* ... */ }
}

class P {
    /* ... */
}

Core.Define(
    'arianna-class-p',
    P,
    SvgIconBase,
    { display: 'inline-block' },
);
```

#### 2q — MathML-derived super

```ts
class MathBase extends MathMLElement { /* ... */ }

class Q {
    /* ... */
}

Core.Define('arianna-class-q', Q, MathBase);
```

#### 2r — Custom namespace (X3D)

```ts
import { X3DGroupElement } from 'some-x3d-pkg';

class R {
    /* ... */
}

Core.Define('arianna-class-r', R, X3DGroupElement);
```

---

### §6.3 Case 3 — `class A extends B` + `Core.Define`

User class has explicit `extends B`. AriannA reads the superclass from the class prototype chain — **no superclass argument needed**.

**Pattern**: `Core.Define(tag, ctor, css?, def?)` — overload B

#### 3a — Extends HTMLElement, plain CSS

```ts
class A extends HTMLElement {
    build() { this.textContent = 'Hello A'; }
}

Core.Define(
    'arianna-ext-a',
    A,
    { display: 'block', padding: '12px' },
);
```

#### 3b — Rule

```ts
import { Rule } from 'arianna';

class B extends HTMLElement {
    /* ... */
}

Core.Define(
    'arianna-ext-b',
    B,
    new Rule(':host', { background: 'crimson' }),
);
```

#### 3c — Stylesheet

```ts
class C extends HTMLElement {
    /* ... */
}

Core.Define(
    'arianna-ext-c',
    C,
    new Stylesheet(
        new Rule(':host',       { display: 'flex' }),
        new Rule(':host > *',   { flex: 1 }),
    ),
);
```

#### 3d — Nested object

```ts
class D extends HTMLElement {
    /* ... */
}

Core.Define(
    'arianna-ext-d',
    D,
    {
        ':host':       { display: 'block' },
        ':host:hover': { opacity: '0.8' },
    },
);
```

#### 3e — Plain CSS + def

```ts
class E extends HTMLElement {
    onMount() { console.log('E mounted'); }
}

Core.Define(
    'arianna-ext-e',
    E,
    { padding: '8px' },
    { shadow: 'closed', attrs: ['variant'] },
);
```

#### 3f — Rule + def

```ts
class F extends HTMLElement {
    handleClick(e: Event) { /* ... */ }
}

Core.Define(
    'arianna-ext-f',
    F,
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'open', attrs: ['disabled'] },
);
```

#### 3g — Stylesheet + def

```ts
class G extends HTMLElement { /* ... */ }

Core.Define(
    'arianna-ext-g',
    G,
    new Stylesheet(
        new Rule(':host',          { display: 'inline-block' }),
        new Rule(':host([active])', { background: 'blue' }),
    ),
    { shadow: 'closed', attrs: ['active'], bus: 'navigation' },
);
```

#### 3h — Nested + def

```ts
class H extends HTMLElement { /* ... */ }

Core.Define(
    'arianna-ext-h',
    H,
    {
        ':host':              { display: 'block' },
        ':host:focus-within': { outline: '1px solid var(--ar-primary)' },
    },
    { shadow: 'open' },
);
```

#### 3i — Extends SVG-native

```ts
class I extends SVGSVGElement {
    build() {
        this.setAttribute('viewBox', '0 0 100 100');
    }
}

Core.Define(
    'arianna-ext-i',
    I,
    { display: 'block', width: '100px' },
    { shadow: false },
);
```

#### 3j — Extends specific HTML*Element

```ts
class J extends HTMLButtonElement {
    build() { this.type = 'button'; }
}

Core.Define(
    'arianna-ext-j',
    J,
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'closed' },
);
```

#### 3k — Minimal

```ts
class K extends HTMLElement {
    /* ... */
}

Core.Define('arianna-ext-k', K);
```

#### 3l — def only

```ts
class L extends HTMLElement {
    /* ... */
}

Core.Define(
    'arianna-ext-l',
    L,
    null,
    { shadow: 'closed', attrs: ['variant'] },
);
```

#### 3m — Extends user-derived class

```ts
class MyBase extends HTMLDivElement {
    sayHi() { console.log('hi'); }
}

class M extends MyBase {
    build() { this.sayHi(); }
}

Core.Define(
    'arianna-ext-m',
    M,
    { display: 'block' },
);
```

#### 3n — Extends multi-level chain

```ts
class L1 extends HTMLElement { foo() { return 'L1.foo'; } }
class L2 extends L1           { bar() { return 'L2.bar'; } }
class L3 extends L2           { baz() { return 'L3.baz'; } }

class N extends L3 {
    build() {
        console.log(this.foo(), this.bar(), this.baz());
    }
}

Core.Define('arianna-ext-n', N);
```

#### 3o — Extends AriannA component

```ts
class Card extends Component('arianna-card', HTMLDivElement, cardCss, { shadow: 'closed' }) {
    build() { /* ... */ }
    cardMethod() { return 'card'; }
}

class O extends Card {
    fancyMethod() { return 'fancy ' + this.cardMethod(); }
}

Core.Define(
    'arianna-ext-o',
    O,
    { background: '#fce4f0' },                  // extends Card's css with overrides
    { shadow: 'closed' },
);
```

#### 3p — Extends SVG-derived custom

```ts
class SvgIcon extends SVGSVGElement {
    setIcon(name: string) { /* ... */ }
}

class P extends SvgIcon {
    build() { this.setIcon('star'); }
}

Core.Define('arianna-ext-p', P);
```

#### 3q — Extends MathML-derived

```ts
class MathBase extends MathMLElement { /* ... */ }

class Q extends MathBase { /* ... */ }

Core.Define('arianna-ext-q', Q);
```

#### 3r — Extends custom namespace (X3D)

```ts
import { X3DGroupElement } from 'some-x3d-pkg';

class R extends X3DGroupElement {
    /* ... */
}

Core.Define('arianna-ext-r', R);
```

---

### §6.4 Case 4 — `class A extends Component(...)`

The factory call inside `extends`. The user class is implicit (it's the class being declared). The superclass is the second argument of `Component(...)`.

**Pattern**: `Component(tag, super, css?, def?)`

#### 4a — Plain CSS

```ts
class A extends Component(
    'arianna-cmp-a',
    HTMLElement,
    { display: 'block', padding: '12px' },
) {
    build() {
        this.textContent = 'Hello A';
    }
}
```

#### 4b — Rule

```ts
import { Rule } from 'arianna';

class B extends Component(
    'arianna-cmp-b',
    HTMLElement,
    new Rule(':host', { background: 'crimson' }),
) {
    /* ... */
}
```

#### 4c — Stylesheet

```ts
class C extends Component(
    'arianna-cmp-c',
    HTMLElement,
    new Stylesheet(
        new Rule(':host',       { display: 'flex' }),
        new Rule(':host > *',   { flex: 1 }),
    ),
) {
    /* ... */
}
```

#### 4d — Nested object

```ts
class D extends Component(
    'arianna-cmp-d',
    HTMLElement,
    {
        ':host':         { display: 'block' },
        ':host:hover':   { opacity: '0.8' },
    },
) {
    /* ... */
}
```

#### 4e — CSS + def

```ts
class E extends Component(
    'arianna-cmp-e',
    HTMLElement,
    { padding: '8px' },
    { shadow: 'closed', attrs: ['variant'] },
) {
    template = `<slot></slot>`;

    onMount() { console.log('E mounted'); }
}
```

#### 4f — Rule + def

```ts
class F extends Component(
    'arianna-cmp-f',
    HTMLElement,
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'open', attrs: ['disabled'] },
) {
    template = `<button :disabled="this.disabled()"><slot></slot></button>`;
}
```

#### 4g — Stylesheet + def

```ts
class G extends Component(
    'arianna-cmp-g',
    HTMLElement,
    new Stylesheet(
        new Rule(':host',           { display: 'inline-block' }),
        new Rule(':host([active])', { background: '#1f6feb' }),
    ),
    { shadow: 'closed', attrs: ['active'], bus: 'navigation' },
) {
    /* ... */
}
```

#### 4h — Nested + def

```ts
class H extends Component(
    'arianna-cmp-h',
    HTMLElement,
    {
        ':host':              { display: 'block' },
        ':host:focus-within': { outline: '2px solid var(--ar-primary)' },
    },
    { shadow: 'open' },
) {
    /* ... */
}
```

#### 4i — SVG super

```ts
class I extends Component(
    'arianna-cmp-i',
    SVGSVGElement,
    { display: 'block', width: '100px', height: '100px' },
    { shadow: false },
) {
    build() {
        this.setAttribute('viewBox', '0 0 100 100');
    }
}
```

#### 4j — Specific HTML*Element super

```ts
class J extends Component(
    'arianna-cmp-j',
    HTMLButtonElement,
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'closed' },
) {
    build() {
        this.type = 'button';
    }
}
```

#### 4k — Minimal

```ts
class K extends Component('arianna-cmp-k', HTMLElement) {
    /* ... */
}
```

#### 4l — def only

```ts
class L extends Component(
    'arianna-cmp-l',
    HTMLElement,
    null,
    { shadow: 'closed', attrs: ['variant'] },
) {
    /* ... */
}
```

#### 4m — User-derived super

```ts
class MyBase extends HTMLDivElement {
    sayHi() { console.log('hi'); }
}

class M extends Component(
    'arianna-cmp-m',
    MyBase,
    { display: 'block', padding: '12px' },
    { shadow: 'closed' },
) {
    build() { this.sayHi(); }
}
```

#### 4n — Multi-level user chain

```ts
class L1 extends HTMLElement { foo() { return 'L1.foo'; } }
class L2 extends L1           { bar() { return 'L2.bar'; } }
class L3 extends L2           { baz() { return 'L3.baz'; } }

class N extends Component(
    'arianna-cmp-n',
    L3,
    new Rule(':host', { display: 'block' }),
    { shadow: 'open' },
) {
    build() {
        console.log(this.foo(), this.bar(), this.baz());
    }
}
```

#### 4o — Super is another AriannA component

```ts
class Card extends Component('arianna-card', HTMLDivElement, cardCss, { shadow: 'closed' }) {
    build() { /* ... */ }
    cardMethod() { return 'card'; }
}

class O extends Component(
    'arianna-cmp-o',
    Card,                                       // AriannA → AriannA inheritance
    { background: '#fce4f0' },
    { shadow: 'closed', attrs: ['variant'] },
) {
    build() {
        super.build?.();
        this.classList.add('fancy');
    }

    fancyMethod() { return 'fancy ' + this.cardMethod(); }
}
```

#### 4p — SVG-derived custom super

```ts
class SvgIcon extends SVGSVGElement {
    setIcon(name: string) { /* ... */ }
}

class P extends Component(
    'arianna-cmp-p',
    SvgIcon,
    { width: '24px', height: '24px' },
    { shadow: false },
) {
    build() { this.setIcon('heart'); }
}
```

#### 4q — MathML-derived super

```ts
class MathBase extends MathMLElement { /* ... */ }

class Q extends Component(
    'arianna-cmp-q',
    MathBase,
    { color: '#333' },
) {
    /* ... */
}
```

#### 4r — Custom namespace super (X3D)

```ts
import { X3DGroupElement } from 'some-x3d-pkg';

class R extends Component(
    'arianna-cmp-r',
    X3DGroupElement,
    {},
    { shadow: false },
) {
    /* ... */
}
```

---

### §6.5 Case 5 — `@Component(...) class A extends AnyClass`

Decorator-based definition. Both class and superclass are implicit:

- The **class** is the decorator target
- The **superclass** is from the `extends Super` of the class declaration (any class whose chain reaches a registered namespace root)

**Pattern (positional)**: `@Component(tag, css?, def?)`
**Pattern (object-style)**: `@Component({ tag, ...keys })`

#### Positional overload examples (5a-5r)

#### 5a — Positional, plain CSS, extends HTMLElement

```ts
import { Component } from 'arianna';

@Component('arianna-dec-a',
    { display: 'block', padding: '12px' },
)
class A extends HTMLElement {
    build() { this.textContent = 'Hello A'; }
}
```

#### 5b — Positional, Rule, extends HTMLElement

```ts
import { Component, Rule } from 'arianna';

@Component('arianna-dec-b',
    new Rule(':host', { background: 'crimson' }),
)
class B extends HTMLElement {
    /* ... */
}
```

#### 5c — Positional, Stylesheet

```ts
import { Component, Rule, Stylesheet } from 'arianna';

@Component('arianna-dec-c',
    new Stylesheet(
        new Rule(':host',       { display: 'flex' }),
        new Rule(':host > *',   { flex: 1 }),
    ),
)
class C extends HTMLElement { /* ... */ }
```

#### 5d — Positional, nested object

```ts
@Component('arianna-dec-d',
    {
        ':host':       { display: 'block' },
        ':host:hover': { opacity: '0.8' },
    },
)
class D extends HTMLElement { /* ... */ }
```

#### 5e — Positional, CSS + def

```ts
@Component('arianna-dec-e',
    { padding: '8px' },
    { shadow: 'closed', attrs: ['variant'] },
)
class E extends HTMLElement {
    template = `<slot></slot>`;

    onMount() { console.log('E mounted'); }
}
```

#### 5f — Positional, Rule + def

```ts
@Component('arianna-dec-f',
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'open', attrs: ['disabled'] },
)
class F extends HTMLElement {
    template = `<button :disabled="this.disabled()"><slot></slot></button>`;
}
```

#### 5g — Positional, Stylesheet + def

```ts
@Component('arianna-dec-g',
    new Stylesheet(
        new Rule(':host',           { display: 'inline-block' }),
        new Rule(':host([active])', { background: '#1f6feb' }),
    ),
    { shadow: 'closed', attrs: ['active'], bus: 'navigation' },
)
class G extends HTMLElement { /* ... */ }
```

#### 5h — Positional, nested + def

```ts
@Component('arianna-dec-h',
    {
        ':host':              { display: 'block' },
        ':host:focus-within': { outline: '2px solid var(--ar-primary)' },
    },
    { shadow: 'open' },
)
class H extends HTMLElement { /* ... */ }
```

#### 5i — Positional, extends SVGSVGElement

```ts
@Component('arianna-dec-i',
    { display: 'block', width: '100px' },
    { shadow: false },
)
class I extends SVGSVGElement {
    build() { this.setAttribute('viewBox', '0 0 100 100'); }
}
```

#### 5j — Positional, extends specific HTML*Element

```ts
@Component('arianna-dec-j',
    new Rule(':host', { fontWeight: 'bold' }),
    { shadow: 'closed' },
)
class J extends HTMLButtonElement {
    build() { this.type = 'button'; }
}
```

#### 5k — Positional, minimal

```ts
@Component('arianna-dec-k')
class K extends HTMLElement { /* ... */ }
```

#### 5l — Positional, def only

```ts
@Component('arianna-dec-l',
    null,
    { shadow: 'closed', attrs: ['variant'] },
)
class L extends HTMLElement { /* ... */ }
```

#### 5m — Positional, extends user-derived

```ts
class MyBase extends HTMLDivElement {
    sayHi() { console.log('hi'); }
}

@Component('arianna-dec-m',
    { display: 'block' },
)
class M extends MyBase {
    build() { this.sayHi(); }
}
```

#### 5n — Positional, extends multi-level chain

```ts
class L1 extends HTMLElement { foo() { return 'L1.foo'; } }
class L2 extends L1           { bar() { return 'L2.bar'; } }
class L3 extends L2           { baz() { return 'L3.baz'; } }

@Component('arianna-dec-n')
class N extends L3 {
    build() { console.log(this.foo(), this.bar(), this.baz()); }
}
```

#### 5o — Positional, extends AriannA component

```ts
class Card extends Component('arianna-card', HTMLDivElement, cardCss, { shadow: 'closed' }) {
    build() { /* ... */ }
    cardMethod() { return 'card'; }
}

@Component('arianna-dec-o',
    { background: '#fce4f0' },
    { shadow: 'closed' },
)
class O extends Card {
    fancyMethod() { return 'fancy ' + this.cardMethod(); }
}
```

#### 5p — Positional, extends SVG-derived

```ts
class SvgIcon extends SVGSVGElement {
    setIcon(name: string) { /* ... */ }
}

@Component('arianna-dec-p',
    { width: '24px' },
    { shadow: false },
)
class P extends SvgIcon {
    build() { this.setIcon('star'); }
}
```

#### 5q — Positional, extends MathML-derived

```ts
class MathBase extends MathMLElement { /* ... */ }

@Component('arianna-dec-q')
class Q extends MathBase { /* ... */ }
```

#### 5r — Positional, extends custom-namespace class (X3D)

```ts
import { X3DGroupElement } from 'some-x3d-pkg';

@Component('arianna-dec-r')
class R extends X3DGroupElement { /* ... */ }
```

#### Object-style overload examples (5s-5z)

#### 5s — Object, minimal

```ts
@Component({
    tag: 'arianna-dec-obj-s',
})
class S extends HTMLElement { /* ... */ }
```

#### 5t — Object with template

```ts
@Component({
    tag      : 'arianna-dec-obj-t',
    template : '<button><slot></slot></button>',
    style    : ':host { color: #e40c88; }',
    shadow   : 'open',
})
class T extends HTMLElement {
    @Prop() name = 'AriannA';
}
```

#### 5u — Object with all keys

```ts
@Component({
    tag      : 'arianna-dec-obj-u',
    template : `
        <button :class="this.variant()" @click="this.handleClick">
            <slot></slot>
        </button>
    `,
    style    : new Rule(':host', { display: 'inline-flex' }),
    shadow   : 'closed',
    attrs    : ['variant', 'disabled'],
    bus      : 'forms',
    render   : 'real',
})
class U extends HTMLElement {
    handleClick(e: Event) { /* ... */ }
}
```

#### 5v — Object with css (alias for style)

```ts
@Component({
    tag : 'arianna-dec-obj-v',
    css : new Stylesheet(
        new Rule(':host',       { display: 'block' }),
        new Rule(':host:hover', { opacity: '0.8' }),
    ),
})
class V extends HTMLElement { /* ... */ }
```

#### 5w — Object with nested style

```ts
@Component({
    tag   : 'arianna-dec-obj-w',
    style : {
        ':host':       { display: 'block' },
        ':host:hover': { background: '#eee' },
    },
    shadow: 'closed',
})
class W extends HTMLElement { /* ... */ }
```

#### 5x — Object, extends SVG

```ts
@Component({
    tag    : 'arianna-dec-obj-x',
    style  : { display: 'block', width: '100px' },
    shadow : false,
})
class X extends SVGSVGElement {
    build() { this.setAttribute('viewBox', '0 0 100 100'); }
}
```

#### 5y — Object, extends specific HTML*Element

```ts
@Component({
    tag      : 'arianna-dec-obj-y',
    template : '<slot></slot>',
    style    : ':host { font-weight: bold; }',
    shadow   : 'closed',
})
class Y extends HTMLButtonElement {
    build() { this.type = 'button'; }
}
```

#### 5z — Object, extends AriannA component

```ts
class Card extends Component('arianna-card', HTMLDivElement, cardCss, { shadow: 'closed' }) {
    build() { /* ... */ }
}

@Component({
    tag    : 'arianna-dec-obj-z',
    style  : { background: '#fce4f0' },
    shadow : 'closed',
    attrs  : ['variant'],
})
class Z extends Card {
    onMount() { console.log('Z mounted'); }
}
```

---
## §7. JSX runtime

AriannA ships a React-JSX compatible runtime. Every JSX element maps to either a `Real` instance (eager) or a `VirtualNode` (lazy) — there is no virtual-DOM diffing layer.

### §7.1 `tsconfig.json` setup

```json
{
  "compilerOptions": {
    "jsx"            : "react-jsx",
    "jsxImportSource": "arianna"
  }
}
```

For development mode with debug args, use `"jsx": "react-jsxdev"` — resolves to `arianna/jsx-dev-runtime → jsxDEV()` (same behaviour as `jsx()`, debug args ignored).

### §7.2 Dual runtime — Real (default) vs Virtual

Every JSX element compiles to either `new Real(...)` (default) or `Virtual.Create(...)`. Switch at three scopes: globally (project config), per-file (pragma), or per-component (via `def.render` option).

#### Real mode (default)

```tsx
import { Real, signal } from 'arianna';

const count = signal(0);

function App() {
    return (
        <div id="app">
            <h1 class="title">AriannA</h1>
            <p>Count: <span>{count.get()}</span></p>
            <button onClick={() => count.set(count.get() + 1)}>
                Increment
            </button>
        </div>
    );
}

new Real(App()).append('#root');
```

#### Virtual mode — per-file pragma

```tsx
/* @dom-render: virtual */
import { Virtual, signal } from 'arianna';

const count = signal(0);

function App() {
    return (
        <div id="app">
            <span>Count: {count.get()}</span>
        </div>
    );
}

const tree = App() as Virtual;
tree.append('#root');                            // materialises here
```

### §7.3 Event syntax — `onEvent` and `$event` (both equivalent)

```tsx
// React-style camelCase
<button onClick={(e) => console.log(e)}>Click</button>

// AriannA $event syntax — equivalent
<button $click={(e) => console.log(e)}>Click</button>

// With modifiers — only via $event syntax
<a $click$prevent={(e) => navigate(e)}>Stay on page</a>
<form $submit$prevent={handleSubmit}>...</form>
<div $scroll$passive={onScroll}>...</div>
```

Modifiers: `$stop`, `$prevent`, `$self`, `$once`, `$capture`, `$passive` — same as template directives §5 in `TEMPLATE_DIRECTIVES.md`.

### §7.4 Fragment

```tsx
import { Fragment } from 'arianna';

function App() {
    return (
        <>
            <header>Top</header>
            <main>Content</main>
            <footer>Bottom</footer>
        </>
    );
}

// Equivalent to:
function App2() {
    return (
        <Fragment>
            <header>Top</header>
            <main>Content</main>
            <footer>Bottom</footer>
        </Fragment>
    );
}
```

Fragments produce a `DocumentFragment` at materialisation.

### §7.5 Custom elements — PascalCase ↔ kebab-case auto-resolution

```tsx
// You can use either form — both resolve to the same custom element:
<arianna-button variant="primary">Click</arianna-button>
<AriannaButton variant="primary">Click</AriannaButton>

// Mixed in the same tree:
<arianna-card>
    <AriannaButton slot="footer">OK</AriannaButton>
    <arianna-icon name="heart" />
</arianna-card>
```

The JSX runtime detects PascalCase identifiers and converts to `kebab-case` for the tag lookup. `MyComponent` → `my-component`. `AriannaCodeEditor` → `arianna-code-editor`.

### §7.6 Defining components in JSX

#### Functional components (no class)

```tsx
import { signal } from 'arianna';

function Counter({ initial = 0 }: { initial?: number }) {
    const count = signal(initial);
    return (
        <button onClick={() => count.set(count.get() + 1)}>
            Count: {count.get()}
        </button>
    );
}

new Real(<Counter initial={5} />).append('#app');
```

#### Class components via `Component(...)` factory + JSX in `build()`

```tsx
class Button extends Component('arianna-button', HTMLElement, css, { attrs: ['variant'] }) {
    build() {
        return (
            <button class={this.variantClass()} onClick={(e) => this.onClick(e)}>
                <slot />
            </button>
        );
    }

    variantClass = () => `btn-${this.attrSignal('variant').get() ?? 'default'}`;

    onClick(e: MouseEvent) { /* ... */ }
}
```

#### Class components via `@Component` decorator + JSX

```tsx
@Component({
    tag    : 'arianna-button',
    style  : { ':host': { display: 'inline-flex' } },
    attrs  : ['variant'],
})
class Button extends HTMLElement {
    build() {
        return (
            <button>
                <slot />
            </button>
        );
    }
}
```

### §7.7 Three ways to switch render mode

#### (1) Globally via tsconfig

```json
{ "compilerOptions": { "jsxImportSource": "arianna/virtual" } }
```

Default mode: Virtual for the whole project.

#### (2) Per-file via pragma

```tsx
/* @dom-render: virtual */
// File-level Virtual mode

/* @dom-render: real */
// File-level Real mode (explicit)
```

#### (3) Per-component via `def.render`

```tsx
class MyCmp extends Component('arianna-mycmp', HTMLElement, css, {
    render: 'virtual',                          // this component's JSX → Virtual
}) {
    build() {
        return <div>...</div>;                  // becomes Virtual
    }
}

class OtherCmp extends Component('arianna-other', HTMLElement, css, {
    render: 'real',                             // this component's JSX → Real
}) {
    build() {
        return <div>...</div>;                  // becomes Real
    }
}
```

### §7.8 `h()` factory — direct use without JSX transform

```ts
import { h, Fragment } from 'arianna';

const tree = h('div', { id: 'app' },
    h('h1', { class: 'title' }, 'AriannA'),
    h('p', null,
        'Count: ',
        h('span', null, count.get()),
    ),
    h('button', { onClick: () => count.set(count.get() + 1) }, 'Increment'),
);

new Real(tree).append('#root');
```

`h(tag, props, ...children)` is what the JSX transform compiles to. Use it directly for runtime-generated trees.

### §7.9 Combining JSX with `Component()` factory class

```tsx
class Card extends Component('arianna-card', HTMLElement, {
    ':host': { display: 'block', padding: '12px', background: '#fff' },
}, { attrs: ['title'] }) {
    build() {
        return (
            <div class="card">
                <h2>{this.attrSignal('title').get()}</h2>
                <div class="body">
                    <slot />
                </div>
            </div>
        );
    }
}

// Use it via JSX in another component
function App() {
    return (
        <Card title="Hello">
            <p>Body content goes into the slot.</p>
        </Card>
    );
}
```

---

## §8. Decorators (TypeScript 5.x ES2023 standard)

AriannA uses **standard ES2023 decorators** (`compilerOptions.experimentalDecorators` is NOT used).

### §8.1 `@Component` — class decorator

Covered in §3.2 and §6.5. Two overloads:

- **Positional**: `@Component(tag, css?, def?)`
- **Object-style**: `@Component({ tag, template?, style?, css?, shadow?, attrs?, bus?, render?, base? })`

```ts
@Component('arianna-card', cardCss, { attrs: ['title'] })
class Card extends HTMLElement { /* ... */ }

@Component({ tag: 'arianna-card', style: cardStyle, attrs: ['title'] })
class Card extends HTMLElement { /* ... */ }
```

### §8.2 `@Prop` — class field decorator (reactive property)

Declares a class field as a **reactive property** backed by a signal, optionally reflected to a kebab-case HTML attribute.

```ts
import { Component, Prop } from 'arianna';

@Component({ tag: 'arianna-counter', attrs: ['initial'] })
class Counter extends HTMLElement {
    @Prop() initial = 0;                        // signal-backed, default 0
    @Prop({ type: 'number' }) step = 1;         // attribute → number coercion
    @Prop({ reflect: true }) variant = 'primary'; // signal change → attribute write

    build() {
        return (
            <button>{this.initial + this.step} ({this.variant})</button>
        );
    }
}
```

**`@Prop` options**:

| Option | Type | Effect |
|--------|------|--------|
| `type` | `'string' \| 'number' \| 'boolean' \| 'json'` | Attribute string coercion |
| `reflect` | `boolean` | Auto-write signal changes to DOM attribute |
| `attribute` | `string` | Custom attribute name (default: kebab-case of field name) |
| `default` | `T` | Initial value if attribute is missing |

### §8.3 `@State` — internal reactive state

Same as `@Prop` but **not** exposed as an attribute. Use for internal signals.

```ts
@Component('arianna-tabs')
class Tabs extends HTMLElement {
    @State() activeIndex = 0;                   // internal, no attribute reflection
    @State() tabs: string[] = [];

    build() {
        return (
            <div>
                {this.tabs.map((t, i) =>
                    <button onClick={() => this.activeIndex = i}>
                        {t}
                    </button>
                )}
            </div>
        );
    }
}
```

### §8.4 `@Watch` — method decorator (reactive observer)

Calls the method whenever the named signal/state changes.

```ts
@Component('arianna-search')
class Search extends HTMLElement {
    @Prop() query = '';

    @Watch('query')
    onQueryChange(newValue: string, oldValue: string) {
        console.log('query changed from', oldValue, 'to', newValue);
        this.performSearch(newValue);
    }

    @Watch(['query', 'filter'])
    onAnyChange() {
        // fires when either signal changes
    }

    private performSearch(q: string) { /* ... */ }
}
```

### §8.5 `@Event` — method decorator (custom event emitter)

Declares a method that, when called, dispatches a custom event with the method's return value as detail.

```ts
@Component('arianna-button')
class Button extends HTMLElement {
    @Event() click() {
        return { timestamp: Date.now() };
    }

    @Event({ bubbles: true, composed: true }) submit(data: object) {
        return data;
    }

    build() {
        return (
            <button onClick={() => this.click()}>Click me</button>
        );
    }
}

// Usage:
const btn = document.querySelector('arianna-button')!;
btn.addEventListener('click', (e: CustomEvent) => console.log(e.detail.timestamp));
```

### §8.6 `@Bind` — method decorator (auto-binding)

Automatically binds `this` to the method, replacing the need for arrow class properties.

```ts
@Component('arianna-form')
class Form extends HTMLElement {
    @Bind
    handleSubmit(e: Event) {
        e.preventDefault();
        console.log(this);                      // always the Form instance
    }

    build() {
        return (
            <form onSubmit={this.handleSubmit}>
                <slot />
            </form>
        );
    }
}
```

### §8.7 `@Sheet` — class decorator (stylesheet injection)

Augments the class `Sheet.Default` with additional rules. Stackable on top of `@Component`'s `style`/`css` argument.

```ts
@Component('arianna-card', { ':host': { display: 'block' } })
@Sheet(new Rule(':host[variant="primary"]', { background: '#1f6feb' }))
@Sheet(new Rule(':host[variant="danger"]',  { background: '#da3633' }))
class Card extends HTMLElement {
    @Prop() variant = 'default';
}
```

Multiple `@Sheet` decorators compose — all rules are added to `Card.Sheet.Default`.

---

## §9. Instantiation — the six forms

Given a class defined via any of the cases 1-5:

```ts
class MyCounter extends Component('arianna-counter', HTMLElement, {}, { attrs: ['initial'] }) {
    build(opts) { /* ... */ }
}
```

**All six forms produce identical DOM**:

### (a) HTML markup

```html
<arianna-counter initial="5">Children here</arianna-counter>
```

### (b) `new Real('tag')` — eager fluent

```ts
const a = new Real('arianna-counter')
    .set('initial', '5')
    .append('#app');
```

### (c) `new Virtual('tag')` — lazy declarative (same syntax as Real)

```ts
const b = new Virtual('arianna-counter')
    .set('initial', '5')
    .append('#app');
```

### (d) `new Component('tag', opts?)` — wrapper exposing both Real + Virtual

```ts
const c = new Component('arianna-counter', { initial: 5 });
c.Real.set('variant', 'primary').append('#app');
// or
c.Virtual.append('#app');                       // same underlying element
```

### (e) `new MyClass()` — direct class instantiation

```ts
const d = new MyCounter();
d.setAttribute('initial', '5');
document.body.appendChild(d);
```

### (f) `document.createElement('tag')` — vanilla DOM API

```ts
const e = document.createElement('arianna-counter');
e.setAttribute('initial', '5');
document.body.appendChild(e);
```

### Default-rendering imperative

Each of the six forms must produce a fully-styled, fully-functional element **with zero additional code**. The `Sheet.Default` from the `css` argument is applied automatically; the template renders; the component looks and behaves identically regardless of which form was used.

This is enforced by the framework — if you find a discrepancy, it's a bug.

---

## §10. Lifecycle hooks reference

All 9 hooks, in firing order for a typical markup-instantiated component:

| # | Hook | When |
|---|------|------|
| 1 | `constructor` (anonymous parent from `Component(...)`) | First DOM creation |
| 2 | `_initFields` (signal bindings, refs) | After constructor |
| 3 | `onCreated` (default → calls `build()`) | After facilities installed |
| 4 | `build(opts)` | User sub-tree construction |
| 5 | `onConnected` | When inserted into a document tree |
| 6 | `onMount` | After both build + connection |
| 7 | `onBeforeUpdate ↔ onUpdate` | Each reactive cycle |
| 8 | `onAttributeChanged(name, old, new)` | Each attribute mutation |
| 9 | `onAdopted` | When moved to a different document |
| 10 | `onUnmount` | Before disconnection |
| 11 | `onDisconnected` | DOM-detached |

See `LIFECYCLE.md` for the complete firing-order specification, cleanup contracts, and async-safe patterns.

---

## §11. Migration playbook (pre-v2 → canonical)

Components written before this convention typically follow one of three patterns. Convert as follows:

| Old pattern | New pattern |
|-------------|-------------|
| `extends Control<Opts>` | `extends Component('arianna-x', HTMLElement, css, { attrs, shadow, bus })` |
| `extends ComponentBase` | `extends Component('arianna-x', HTMLElement, css, def)` |
| `static observedAttributes = [...]` | `def.attrs = [...]` |
| `attachShadow({ mode: 'open' })` in constructor | `def.shadow = 'open'` |
| `connectedCallback()` body | `build()` body (gets called regardless of markup vs `new`) |
| Manual prototype splicing | `Component(...)` factory or `@Component` decorator |
| `Component.Define(...)` (legacy Component.js v1) | `Core.Define(...)` overloads A or B |

See `§17` (codemod helper) for an automated migration tool.

---

## §12. Allowed deviations

The conventions in this document apply to **standard application components**. The framework allows escapes:

### §12.1 Pure renderers (Finance Sparkline-style)

For components whose entire job is drawing on a canvas / SVG without children or interactivity:

```ts
class Sparkline extends Component('arianna-sparkline', HTMLElement, {}, {
    attrs : ['data', 'colour'],
    shadow: false,                              // direct draw on host
}) {
    build() {
        const canvas = new Real('canvas');
        canvas.append(this.Host);

        effect(() => this.draw(canvas.render(), this.data, this.colour));
    }

    private draw(canvas, data, colour) { /* draw routine */ }
}
```

### §12.2 Modifiers (Modifier2D / Modifier3D)

Pure utility classes that transform an Element without registering as a custom tag. These do NOT use `Component(...)` — they expose a fluent API on the existing element.

### §12.3 Sub-base classes

When multiple related components share complex logic, a shared base is allowed provided it `extends Component(...)`:

```ts
class FormControlBase extends Component('arianna-form-control', HTMLElement, baseCss, {
    attrs: ['name', 'value', 'disabled'],
}) {
    /* shared form behaviour */
}

class TextField extends FormControlBase {
    @Prop() placeholder = '';
    /* TextField-specific */
}

class Select extends FormControlBase {
    @Prop() options = [];
    /* Select-specific */
}
```

Concrete subclasses inherit the v2 shape automatically.

---

## §13. Testing convention

Every component MUST have a test file `components/<name>/<Name>.test.ts`. Recommended layout:

```ts
import { test, expect } from 'arianna/test';
import { Counter } from './Counter.ts';

test('Counter renders initial value', async () => {
    const c = new Counter();
    c.setAttribute('initial', '5');
    document.body.appendChild(c);

    expect(c.textContent).toBe('5');
});

test('Counter increments on click', async () => {
    const c = new Counter();
    document.body.appendChild(c);

    c.shadowRoot!.querySelector('button')!.click();
    expect(c.textContent).toBe('1');
});
```

Aim for ≥3 tests per component covering: rendering, interaction, attribute reactivity.

---

## §14. Build / bundle convention

- Each component lives in `components/<Name>/<Name>.ts`
- Bundles output to `release/dist/arianna-components.js`
- The component MUST be a named export from its `.ts` file
- Optional side-effect import for markup pre-registration is allowed but NOT required (the MutationObserver discovers components lazily)

---

## §15. Accessibility baseline

Every component MUST provide:

- ARIA role where appropriate (`role="button"`, `role="dialog"`, etc.)
- Keyboard interaction matching the role (Enter/Space for buttons, Esc for dialogs)
- Focus management (tabindex, focus trap for modals)
- `aria-label` or `aria-labelledby` for non-text triggers
- `aria-disabled` reflection when `disabled` is set
- High-contrast mode tested (no info conveyed by colour alone)

---

## §16. Documentation per component

Each component MUST include in its source file:

- JSDoc block on the class summarising purpose, attrs, slots, events
- Example usage in markup
- Example usage via JSX
- Example usage via `new Component('...', opts)`

```ts
/**
 * <arianna-card> — A styled container with optional title and body slot.
 *
 * Attrs:
 *   title    — string, shown as <h2> header
 *   variant  — 'default' | 'primary' | 'danger'
 *
 * Slots:
 *   (default) — body content
 *   header    — overrides the title attribute
 *   footer    — bottom action area
 *
 * Events:
 *   click     — bubbles from the body
 *
 * Example (markup):
 *   <arianna-card title="Hello" variant="primary">
 *     <p>Body content</p>
 *     <button slot="footer">OK</button>
 *   </arianna-card>
 *
 * Example (JSX):
 *   <Card title="Hello" variant="primary">
 *     <p>Body content</p>
 *   </Card>
 *
 * Example (programmatic):
 *   const c = new Component('arianna-card', { title: 'Hello' });
 *   c.Real.append('#app');
 */
```

---

## §17. The "default imperative" rule

A core invariant of AriannA:

> **Every component must look and behave identically regardless of which of the six instantiation forms was used.** No instantiation-specific setup, no "this only works in markup" or "this only works via `new`". The `Sheet.Default` is applied automatically; the template renders; attributes flow through to signals; events bubble correctly.

If you find a case where this is violated, file a bug — it is NOT an allowed deviation.

---

## §18. Codemod helper (planned)

A migration script `tools/migrate-component.ts` will be provided to:

1. Convert `extends Control<X>` to `extends Component('arianna-X', HTMLElement, css, def)`
2. Move `static observedAttributes` → `def.attrs`
3. Convert `attachShadow({ mode })` calls → `def.shadow`
4. Move `connectedCallback()` body → `build()` body (with safety checks)
5. Replace `Component.Define(...)` (v1) → `Core.Define(...)` (v2 overloads A/B)

Run with:

```bash
npx arianna-migrate components/ButtonOld
# → reviews diff, prompts for confirmation
```

---

## §19. Quick-reference cheat sheet

```ts
// ── CASE 1 ─ function + Core.Define ──────────────────────────────
function A() { /* ... */ }
Core.Define('tag', A, HTMLElement, css?, def?);

// ── CASE 2 ─ class (no extends) + Core.Define ────────────────────
class A { /* ... */ }
Core.Define('tag', A, HTMLElement, css?, def?);

// ── CASE 3 ─ class extends X + Core.Define ───────────────────────
class A extends HTMLElement { /* ... */ }
Core.Define('tag', A, css?, def?);

// ── CASE 4 ─ class extends Component(...) ────────────────────────
class A extends Component('tag', HTMLElement, css?, def?) {
    build() { /* ... */ }
}

// ── CASE 5 ─ @Component decorator ────────────────────────────────
@Component('tag', css?, def?)                   // positional
class A extends HTMLElement { /* ... */ }

@Component({ tag: 'tag', style: css, ... })     // object-style
class A extends HTMLElement { /* ... */ }

// ── INSTANTIATION ────────────────────────────────────────────────
<my-tag attr="val">...</my-tag>                 // (a) markup
new Real('my-tag').set('attr', 'val').append('#app');     // (b)
new Virtual('my-tag').set('attr', 'val').append('#app');  // (c)
new Component('my-tag', { attr: 'val' });       // (d) wrapper
new MyClass();                                  // (e) direct
document.createElement('my-tag');               // (f) vanilla

// ── DECORATORS ───────────────────────────────────────────────────
@Component       // class      — define a custom element
@Prop            // field      — reactive property + attribute
@State           // field      — internal reactive state
@Watch('key')    // method     — observer
@Event           // method     — emit custom event
@Bind            // method     — auto-bind this
@Sheet           // class      — augment Sheet.Default

// ── LIFECYCLE HOOKS ──────────────────────────────────────────────
onCreated         — after facilities, default calls build()
onConnected       — DOM-attached
onMount           — post-build + post-connect
onBeforeUpdate    — before reactive cycle
onUpdate          — after reactive cycle
onAttributeChanged(name, old, new)
onUnmount         — before disconnect
onDisconnected    — DOM-detached
onAdopted         — moved to another document
```

---

## §20. END

This is the canonical specification for AriannA Component definitions. Future amendments will:

- Be added at the end of the relevant section
- Be tagged with the date of change
- Be summarised in `CHANGELOG.md`

When generating component code, AI assistants should reference this file as the source of truth. Conflicts between this file and other documentation should be resolved in favour of this file.

Document version: v2.0 — refactored from CONVENTIONS-v1
Last updated: 2026-05-26
