# Template Directives — complete reference

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
