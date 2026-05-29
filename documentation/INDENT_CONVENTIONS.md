# AriannA v2 — Indent Conventions

> *Canonical authoring style for AriannA v2 components, walked through the
> reference example `Cuore`.*
>
> This document is **prescriptive**, not descriptive. Every new component
> in `arianna-components` and every example in the playground must obey
> the conventions described here. Reviews reject PRs that deviate without
> a written rationale.

---

## 1. The Cuore reference

The canonical example is the `Cuore` component. It is intentionally tiny but
hits every indent rule that matters. Memorize this; everything else in the
codebase is a variation on this shape.

```ts
class Cuore extends Component
(
    'papa',
    HTMLDivElement,
    {
        Selector: '.cuore',
        Content:
        {
            Display: 'block',
            Width: '100px',
            Height: '100px',
            Background: 'crimson',
            Color: 'white',
            Padding: '12px',
            BorderRadius: '12px'
        }
    },
    { shadow: { mode: 'closed', css: true } }
)
{
    build()
    {
        this.classList.add('cuore');

        this.style.border = '4px solid gold';

        this.addEventListener
        (
            'click', () =>
            {
                this.style.background = 'purple';
                this.textContent = 'Clicked';
            }
        );
    }
}
```

Used in markup as:

```html
<papa>Yeh</papa>
```

That single block of code exercises:

- Allman-style brackets on `class`, function calls, callbacks and method bodies.
- One-argument-per-line for `Component(...)` factory invocations.
- Capitalized CSS property keys (`Display`, `BorderRadius`) — the AriannA
  Stylesheet convention.
- Inline `{ shadow: ..., css: ... }` def-object on a single line when short.
- Splitting `addEventListener(...)` arguments across lines when a callback
  body would otherwise crowd the parent call.

If your code does not look like this, your code does not look like AriannA v2.

---

## 2. The eight rules, in order of priority

### Rule 1 — Indent is **4 spaces**. No tabs. No exceptions.

```ts
// CORRECT
class Cuore extends Component
(
    'papa',
    HTMLDivElement,
    ...
)

// WRONG — two-space indent
class Cuore extends Component
(
  'papa',
  HTMLDivElement,
  ...
)
```

Editors must be configured to convert tabs to 4 spaces on save. CI rejects
PRs containing tab characters in any `.ts`, `.html`, `.md` file (with the
single exception of `Makefile`, which the language demands).

### Rule 2 — Brackets open on their **own line** at the parent's indent.

This is the Allman/BSD style, extended to function call parentheses.

```ts
// CORRECT
class Cuore extends Component
(
    'papa',
    ...
)
{
    build()
    {
        ...
    }
}

// WRONG — K&R braces
class Cuore extends Component('papa', ...) {
    build() {
        ...
    }
}
```

The `(` of `Component(` and the `{` of `build() {` go on their **own line**,
aligned with the keyword above. The closing `)` and `}` go on their own
line, also aligned with the opening keyword.

**Inline exceptions** (allowed): one-line objects under ~70 columns can
stay on one line when they appear as a *value* (not a *declaration*):

```ts
// CORRECT — short def-object inline
{ shadow: { mode: 'closed', css: true } }

// CORRECT — short return value inline
return { x: 0, y: 0 };
```

But never inline a *body*:

```ts
// WRONG — body must use Allman
get area() { return this.w * this.h; }

// CORRECT
get area()
{
    return this.w * this.h;
}
```

### Rule 3 — Arguments to `Component(...)` are **one per line**.

The `Component()` factory takes up to four positional arguments
(`tag, base, css, def`). When you write a class against it, each goes on
its own line, with the closing `)` flush to the parent indent:

```ts
class Cuore extends Component
(
    'papa',                                          // tag
    HTMLDivElement,                                  // base interface
    {                                                // css (Stylesheet or Rule or plain)
        Selector: '.cuore',
        Content: { Display: 'block', ... }
    },
    { shadow: { mode: 'closed', css: true } }        // def
)
```

This applies whenever a function call has **more than one argument** AND
spans more than ~70 columns. For trivial calls, inline is fine:

```ts
this.classList.add('cuore');                       // CORRECT — one short arg
this.setAttribute('data-state', 'active');         // CORRECT — two short args
```

### Rule 4 — Callbacks split with `(` and `)` on their **own lines**.

When a function call's callback body would push the closing `)` more than
one logical screen below the opening `(`, split the call:

```ts
// CORRECT
this.addEventListener
(
    'click', () =>
    {
        this.style.background = 'purple';
        this.textContent = 'Clicked';
    }
);

// WRONG — opening paren attached to call expression
this.addEventListener('click', () => {
    this.style.background = 'purple';
    this.textContent = 'Clicked';
});
```

The `(` aligns with the indent of `this.addEventListener`, NOT below it.
Read top-down: method name, then arguments grouped in parens, then `;`.

The argument list **may share its first line with the `(`** if it begins
with simple values like an event name string: `'click', () =>` lives on
the line right after `(`. The arrow's body — the `=>` curly — still gets
its own line via Rule 2.

### Rule 5 — CSS property keys are **Capitalized**, not camelCase.

This is the AriannA Stylesheet convention. The framework internally maps
Capitalized keys to the corresponding CSS properties:

```ts
{
    Display: 'block',           // → display
    Width: '100px',             // → width
    BorderRadius: '12px',       // → border-radius
    BackgroundColor: '#fce4f0', // → background-color
    ZIndex: 1000                // → z-index
}
```

```ts
// WRONG — camelCase keys (the legacy v1 style)
{ display: 'block', borderRadius: '12px' }

// WRONG — kebab-case keys (CSS-native but disallowed in AriannA)
{ 'border-radius': '12px' }
```

Two reasons:

1. Capitalized keys collide with no JS reserved word and no DOM property.
2. They mark the object visually as an *AriannA Stylesheet object*, distinct
   from a generic CSS-in-JS object or a `el.style` assignment target.

When in doubt: if it's inside `Content: { ... }` of a Rule, capitalize. If
it's `el.style.X = ...` (direct DOM access), use the DOM's camelCase.

```ts
// Inside a Rule:
{ BorderRadius: '12px' }

// Direct DOM mutation:
this.style.borderRadius = '12px';
```

### Rule 6 — Object literals: `{` on **its own line** for nested structures.

Three depths of object follow the same rule:

```ts
{                                    // depth 0 — the css argument itself
    Selector: '.cuore',
    Content:                         // depth 1 — Content key
    {
        Display: 'block',            // depth 2 — actual CSS properties
        Width: '100px',
        ...
    }
}
```

A nested object that is **the value of a key** on its own line gets the
opening `{` on the **next** line, indented at the depth of that line's key:

```ts
// CORRECT
Content:
{
    Display: 'block'
}

// WRONG — brace hangs on the value line
Content: {
    Display: 'block'
}
```

The exception (again): single-line value-objects under ~70 cols inline as
usual. The trigger is *vertical commitment*: the moment you put one key on
its own line, all sibling keys do too, and `{` is on its own line.

### Rule 7 — No trailing commas on the **last** entry of an inline object.

```ts
// CORRECT
{ x: 1, y: 2, z: 3 }
{ Display: 'block', Width: '100px' }

// WRONG — trailing comma in inline object
{ x: 1, y: 2, z: 3, }
```

For multiline objects: trailing comma **encouraged** on entries that are
not the last, **forbidden** on the last entry. This matches how the
formatter renders diff-friendly multiline blocks while keeping inline
objects clean.

```ts
// CORRECT
{
    Display: 'block',
    Width: '100px',
    Height: '100px'
}

// WRONG — trailing comma after Height
{
    Display: 'block',
    Width: '100px',
    Height: '100px',
}
```

### Rule 8 — Statements separated by **blank lines** when they're conceptually distinct.

Inside `build()`, the Cuore example uses three blank-line-separated stanzas:

```ts
build()
{
    this.classList.add('cuore');                  // stanza 1: identity

    this.style.border = '4px solid gold';         // stanza 2: visual setup

    this.addEventListener                         // stanza 3: behaviour
    (
        'click', () =>
        {
            ...
        }
    );
}
```

This is not whitespace abuse; it's a structural signal. A reviewer scanning
`build()` sees three logical units instead of seven syntactic lines.

Rule of thumb: **one stanza = one responsibility**. If you can't describe
the stanza in a 3-word noun phrase, it's not a stanza yet.

---

## 3. Why this style — the rationale

AriannA v2 is read more than it is written. Components are the framework's
public surface; every CSS rule, every event listener, every state binding
will be looked at by users learning the framework, by maintainers debugging
issues, by future Riccardo six months from now.

The Allman/BSD bracket style maximizes **vertical scanability**. The eye
can drop down the left margin of a file and see structure without parsing
horizontally. Function definitions, class bodies, control flow blocks, and
multiline calls all share the same visual signature: keyword on one line,
`(` or `{` on the next, body indented one level, closer flush with the
opener.

The one-argument-per-line rule for `Component(...)` exists because the
four positional arguments are **semantically heterogeneous**: a tag name,
an interface constructor, a stylesheet, and a definition object. Putting
them on separate lines forces the eye to register them as four distinct
things, not as a comma-separated list. Reading top-to-bottom is what
makes the call decipherable.

The Capitalized CSS keys exist because AriannA Stylesheet objects are not
JS objects passed to `Object.assign(el.style, ...)`. They are a typed DSL
that the framework compiles into shadow-DOM-scoped or instance-scoped
stylesheets at runtime. Visually distinguishing them from DOM-property
access (`el.style.X`) prevents confusion.

The blank-line stanzas in method bodies exist because **a method body is
prose**. It has paragraphs. Each paragraph does one thing. Treating it as
prose makes it readable as prose.

---

## 4. The killer feature this style enables

> **AriannA is the only framework in the world that lets you write
> `class C extends Component('arianna-x', HTMLElement, css, def) { ... }`
> and get a working Shadow DOM contract, with template, slot projection,
> and CSS scoping — without ever calling `customElements.define`.**

This is not an incremental improvement. Every other framework that wants
shadow DOM either:

1. **Uses `customElements.define` internally** (Lit, Stencil, FAST,
   Vanilla JS). The cost: the tag is now globally registered, irrevocable,
   and the W3C upgrade lifecycle (`connectedCallback`,
   `attributeChangedCallback`, etc.) is the contract you have to live
   with. Reactive state must be plumbed through observed-attribute
   gymnastics. Tag names are a global namespace you must police forever.
2. **Avoids shadow DOM entirely** (Vue, Svelte, React, Preact). The cost:
   no CSS encapsulation by default; you reach for CSS Modules, scoped
   styles, or BEM. Slot projection is a userland convention, not a
   browser primitive.
3. **Wraps native elements with `is="..."` builtins** (some Web Components
   patterns). The cost: builtin extends are unsupported in Safari and
   broken in subtle ways across browsers; your component is forever tied
   to a base tag like `<div is="my-card">`.

AriannA v2 takes a **fourth path that no one else has taken**: it
implements an Allman-described Shadow DOM contract in JavaScript itself,
as a polyfill that activates *automatically* when the native call fails.

### How the workaround works (the architectural insight)

Native `attachShadow()` is restricted by HTML spec to elements whose
interface is on a whitelist. The browser checks the *interface*, not the
*tag name*: an `<arianna-button>` that the browser sees as
`HTMLUnknownElement` (because it isn't `customElements.define`d) cannot
attach a shadow. This is a hard constraint baked into the C++ DOM
implementation; there is no JavaScript-level escape hatch.

So we don't fight the constraint. We **route around it**.

`Component._attachAriannaShadow()` first attempts `attachShadow()` natively.
If the call throws `NotSupportedError`, it instantiates an `AriannaShadow`
object — a JavaScript representation of a shadow root that emulates the
parts of the contract AriannA actually uses:

| Native ShadowRoot                  | AriannaShadow                          |
|------------------------------------|----------------------------------------|
| DOM node, returned by `attachShadow` | JS object, stashed on host under `Symbol.for('arianna.shadow.root')` |
| Children live in shadow tree       | Children live in light DOM, scoped by `data-arianna-instance` |
| `<slot>` elements project light DOM | `<slot>` elements rewritten to Comment anchors; light children reparented via DOM moves |
| `slotchange` event                 | `arianna:slotchange` CustomEvent on host |
| CSS encapsulated by tree boundary  | CSS encapsulated by instance-id attribute selector |
| `querySelector` scoped to shadow   | `querySelector` delegated to host subtree |

The user code is **unaware of the choice**. When they read `this.Shadow.Root`,
they get back either a native `ShadowRoot` or an `AriannaShadow`. Both
support `.querySelector(...)`. Both honor the framework's templating
pipeline. Both produce a working component.

### Why this is uniquely possible in AriannA

It works **only because** AriannA's Namespace system is the source of
truth for custom-element upgrade, not the browser's `customElements`
registry. Other frameworks couldn't take this route even if they wanted
to: they've delegated upgrade semantics to the browser, which means the
browser's restriction on `attachShadow()` is also their restriction.

AriannA decided in v1, twelve years ago, to handle custom-element upgrade
in userland via `Core.Observer` (MutationObserver) and namespace-scoped
descriptors. At the time, this looked like reinventing the wheel. Today,
it's what enables this workaround. The decision compounded.

### What this unlocks for users

The Cuore template shown at the top of this document — `class Cuore
extends Component('papa', HTMLDivElement, ...)` — works **regardless of
the base interface**. Replace `HTMLDivElement` with `HTMLElement` and the
tag becomes a fully-autonomous custom element with a working shadow
contract, no `customElements.define` call needed, no global registration,
no irrevocable side effect.

```ts
// Both of these work identically — AriannaShadow takes over for HTMLElement
class CardA extends Component('arianna-card', HTMLDivElement, css, def) { ... }
class CardB extends Component('arianna-card', HTMLElement,    css, def) { ... }
```

The implications:

- **No tag-name namespace pollution**. Components can be scoped per project,
  per Daedalus canvas, per server-side render context.
- **Hot-swappable definitions**. Re-defining a tag mid-session is impossible
  with `customElements.define`. Trivial with AriannA.
- **SSR-friendly**. The polyfill is pure JS — no need for browser-only
  shadow DOM APIs during server-side rendering.
- **Trademark protection**. Tags like `arianna-button` are framework-internal
  identifiers, not items in a public W3C-managed registry that anyone could
  collide with.

This is what we mean by **caveat overcome**. The W3C placed a constraint
on `attachShadow`. AriannA satisfies the *intent* of the constraint
(encapsulated component contracts, slot projection, declarative styling)
without paying the *cost* it implied (mandatory global registration).

The fact that this lands in v2 with the canonical example named **Cuore**
— "heart" — is deliberate. Shadow DOM is the heart of a component system.
AriannA's heart beats in JavaScript, not in the C++ DOM.

---

## 5. Lint / Format enforcement

A `arianna-format` checker (planned, not yet shipped) validates these rules
mechanically. Until it ships:

- Reviews block PRs that violate Rule 1 (indent) or Rule 5 (CSS keys).
- Reviews suggest changes for Rule 2/3/4 violations but won't block.
- Rules 6/7/8 are aesthetic and reviewer-judgment.

Authors are expected to copy the Cuore template, modify it, and verify the
result still *looks like* Cuore. If it doesn't, the indent is wrong.

---

## 6. Quick reference card

```
INDENT          4 spaces, no tabs
BRACES          Allman (own line, aligned to keyword)
ARGS            One per line when call spans >70 cols
CALLBACKS       Split call parens to own lines for multiline bodies
CSS KEYS        Capitalized (Display, BorderRadius)
NESTED OBJ      `{` on own line at depth of parent key
TRAILING ,      Never on last entry (inline or multiline)
STANZAS         Blank line between conceptual units
```

When you doubt the rule, re-read the Cuore example. It is the source of truth.
