# Real & Virtual — DOM strategies

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
