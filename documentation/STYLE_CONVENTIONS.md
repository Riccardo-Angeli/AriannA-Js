# AriannA Style Conventions

**Version**: 2.0 draft 2026-05-22  
**Status**: Proposed canonical convention for AriannA CSS, `Rule`, `Stylesheet`, Shadow DOM styling, and component override contracts.

---

## 0. Purpose

AriannA components must be deeply customizable without breaking Shadow DOM encapsulation.

This document defines the official style model for AriannA 2.0:

1. **Basic CSS** — normal CSS authored by users.
2. **Rule / Stylesheet** — AriannA's canonical object-based styling model.
3. **AriannA CSS façade** — a compiler/adapter layer that makes normal-looking CSS work with closed Shadow DOM through explicit selector contracts.
4. **Component default style classes** — every component must expose stable, prefixed class selectors internally so default styles and overrides compose predictably.

The goal is not to make Shadow DOM disappear. The goal is to give users the same productivity as normal CSS while keeping AriannA components safe, overridable, inspectable, and refactorable.

---

## 1. Core Principles

### 1.1 Closed Shadow DOM remains the default

AriannA components use Shadow DOM by default, preferably `closed`.

```ts
export class Button extends Component(
    'arianna-button',
    HTMLElement,
    Button.DefaultSheet(),
    {
        attrs : ['variant', 'size', 'disabled'],
        shadow: 'closed',
    }
) {}
```

Closed Shadow DOM protects component internals from accidental global CSS, DOM queries, and page-level selector conflicts.

### 1.2 Styling must stay explicit

Users must be able to customize components, but through declared contracts:

- CSS custom properties / tokens
- attributes and variants
- slots
- public style map selectors
- `Rule`
- `Stylesheet`
- AriannA CSS façade compilation
- subclass `Sheet.Default` extension
- instance `Sheet.Current` extension

### 1.3 `build()` is not the default styling layer

Component structural styling must not be assigned in `build()` using patterns like:

```ts
this.Sheet = Button.DefaultSheet();
```

`build()` is for behavior, state, event wiring, and runtime instance logic.

Default component style belongs in the third argument of `Component(...)`, which seeds `Sheet.Default` and lets the runtime clone or combine it into `Sheet.Current` per instance.

---

## 2. Basic CSS

Users should be allowed to write familiar CSS when targeting component hosts.

```css
arianna-button {
    background: #111827;
    color: white;
    border-radius: 10px;
}

arianna-button[variant="danger"] {
    background: #dc2626;
}
```

In plain browser CSS, those rules affect only the host element, not closed Shadow DOM internals.

AriannA may additionally compile these rules through the CSS façade into Shadow-safe `Rule` / `Stylesheet` entries.

Host CSS maps to `:host`:

```css
arianna-button {
    background: #111827;
}
```

becomes:

```ts
new Rule(':host', {
    background: '#111827',
});
```

Host state CSS maps to `:host(...)`:

```css
arianna-button[variant="danger"] {
    background: #dc2626;
}
```

becomes:

```ts
new Rule(':host([variant="danger"])', {
    background: '#dc2626',
});
```

---

## 3. Rule

`Rule` is the atomic AriannA style unit.

A rule has a selector and a content object.

```ts
new Rule(':host', {
    display     : 'inline-flex',
    alignItems  : 'center',
    borderRadius: '8px',
})
```

The object form is canonical because it is:

- easier to generate from JSON/schema tools
- safer to validate
- easier to sanitize
- easier to merge
- easier to diff
- better for visual builders
- better for AI-generated patches

The equivalent plain object form is also valid where accepted:

```ts
{
    Selector: ':host',
    Content : {
        display: 'inline-flex',
    },
}
```

---

## 4. Stylesheet

`Stylesheet` is an ordered collection of `Rule` objects.

```ts
new Stylesheet([
    new Rule(':host', {
        display: 'inline-flex',
    }),
    new Rule('.arianna-button', {
        background: 'var(--arianna-button-bg, #f3f3f3)',
    }),
])
```

Order matters. Later rules may override earlier rules according to normal CSS cascade and specificity.

A component should expose:

```ts
static DefaultSheet(): Stylesheet
```

or pass its default stylesheet directly into the third argument of `Component(...)`.

Recommended pattern:

```ts
export class Button extends Component(
    'arianna-button',
    HTMLElement,
    Button.DefaultSheet(),
    {
        attrs : ['variant', 'size', 'disabled'],
        shadow: 'closed',
    }
) {}
```

---

## 5. Sheet.Default and Sheet.Current

AriannA uses two conceptual stylesheet layers.

### 5.1 `Sheet.Default`

`Sheet.Default` is the class-level base stylesheet.

It defines the component's canonical design and is inherited by subclasses.

### 5.2 `Sheet.Current`

`Sheet.Current` is the per-instance stylesheet.

It starts as a clone or composition of `Sheet.Default`, then can receive instance-specific rules.

Example:

```ts
const button = document.querySelector('arianna-button');

button.Sheet.Current.add(
    new Rule('.arianna-button-label', {
        fontWeight: '700',
    })
);
```

This allows advanced customization without mutating the class-level default.

---

## 6. Mandatory Default Style Classes

For overridability, every component must expose stable internal class selectors.

This is required even when the component uses Shadow DOM.

### 6.1 Naming rule

Every component default style must be rooted in a stable prefixed CSS class.

Recommended long form:

```css
.arianna-button
.arianna-button-label
.arianna-button-icon
.arianna-button-trailing
```

Recommended short alias:

```css
.a-button
.a-button-label
.a-button-icon
.a-button-trailing
```

Both may be present on internal nodes when useful:

```html
<button class="arianna-button a-button" part="button">
    <span class="arianna-button-icon a-button-icon">
        <slot name="icon"></slot>
    </span>
    <span class="arianna-button-label a-button-label">
        <slot></slot>
    </span>
    <span class="arianna-button-trailing a-button-trailing">
        <slot name="trailing"></slot>
    </span>
</button>
```

### 6.2 Why classes are mandatory

Default component styles should prefer class selectors because classes are:

- explicit
- stable
- overridable
- composable
- easy to map from façade selectors
- safer than arbitrary internal DOM selectors
- compatible with ShadowRoot-injected styles
- compatible with subclass `Sheet.Default` extension
- compatible with per-instance `Sheet.Current` overrides

### 6.3 Correct default style pattern

Good:

```ts
new Stylesheet([
    new Rule(':host', {
        display: 'inline-flex',
    }),
    new Rule('.arianna-button', {
        alignItems    : 'center',
        background    : 'var(--arianna-button-bg, #f3f3f3)',
        border        : '1px solid var(--arianna-button-border, #d8d8d8)',
        borderRadius  : 'var(--arianna-button-radius, 6px)',
        color         : 'var(--arianna-button-color, inherit)',
        cursor        : 'pointer',
        display       : 'inline-flex',
        justifyContent: 'center',
        padding       : 'var(--arianna-button-padding, 5px 14px)',
    }),
    new Rule('.arianna-button-label', {
        display   : 'inline-flex',
        alignItems: 'center',
    }),
])
```

Avoid making all default styling only `button`, `span`, or deep structural selectors:

```ts
// Avoid as public default contract
new Rule('button > span:first-child', { ... })
```

Structural selectors may be used internally, but they must not be the primary override contract.

---

## 6.5 Framework-generated default class selector

When a component is registered with a **plain object** as its default style argument (third argument to `Component(...)` / `Core.Define(...)`), AriannA auto-generates a class selector from the **constructor name** rather than the tag.

### 6.5.1 Rule

```
class MiaClasse extends XYZ                  → selector = .MiaClasse
function A1o() { ... }                       → selector = .A1o
Component('case-card-1o', ..., {...})        → selector = .{user-class-name}  (lazy)
```

The framework reads `ctor.name` at registration time and injects:

```html
<style data-arianna-tag-style="case-card-1o" data-arianna-class="Card1o">.Card1o{...}</style>
```

### 6.5.2 Why class names, not tags

- Class selector specificity (0,1,0) is low enough to be overridden by other classes / IDs / inline styles
- NOT bound to the tag — same class name composes across tags
- Tag selector (`case-card-1o`) is too rigid and DOM-position-coupled
- `[is="..."]` attribute selector forces the framework to set the `is` attribute at upgrade and binds CSS to a specific element-customization pattern
- Class name allows natural CSS inheritance via multi-class composition: an element can carry `class="ParentClass ChildClass"` and both rules apply with predictable cascade

### 6.5.3 Plain object vs Rule / Stylesheet

The auto-generated selector applies **only** to the plain default-style object form. When the user passes a `Rule` or `Stylesheet` instance, the user's explicit `Selector` is honoured verbatim — no auto-rewriting.

```ts
// Plain object → framework auto-selector
Component('case-card-1o', HTMLDivElement, { Background: '#fff' });
// → <style>.{ctor.name}{background:#fff}</style>

// Rule with explicit selector → user-controlled
Component('arianna-button', HTMLElement, new Rule('.arianna-button', {
    background: '#1f6feb',
}));
// → <style>.arianna-button{background:#1f6feb}</style>
```

### 6.5.4 Nested CSS `:host` translation

For nested rules-object syntax, `:host` (and `:host:hover`, `:host .inner`, etc.) auto-translates to `.{ctor.name}` so the user can write canonical-looking host rules without knowing the class name:

```ts
Component('case-card-1o', HTMLDivElement, {
    ':host'      : { Background: '#fff' },
    ':host:hover': { Background: '#eee' },
});
// → <style>.Card1o{background:#fff}.Card1o:hover{background:#eee}</style>
```

### 6.5.5 Two-phase injection — solving the Component shared-class problem

`Component(tag, base, ...)` internally caches a shared `ComponentClass` per `base` interface (one per HTMLDivElement, one per SVGSVGElement, etc.) — this keeps the prototype chain canonical `Subclass → Component → base`. The trade-off: at the moment of `Namespace.Define`, the constructor passed in is the shared `ComponentClass` whose `name === 'Component'` — not yet the user's `Card1o`.

To avoid every Component-registered tag colliding on a `.Component` selector, the framework uses **two-phase injection**:

1. **Phase 1 — Namespace.Define**: if `ctor.__ariannaComponent === true` (shared class marker), **skip** the `<style>` injection. The descriptor's `Style` is stored, but no `<style>` element is appended yet.

2. **Phase 2 — Component constructor**: when `new Card1o()` runs and `super()` reaches the Component constructor, `new.target` resolves to `Card1o` (the most-derived class). The constructor inspects the descriptor; if `d.Style` is present and `d._cssInjected` is not set, it injects `<style>.Card1o{...}</style>` and marks `d._cssInjected = true` to prevent doubling on subsequent instances.

This idempotent late-binding is invisible to component authors: the `<style>` element shows up in `<head>` the first time the component is instantiated, with the correct user-class selector, regardless of the shared-class machinery.

For non-Component registrations (direct `Core.Define('case-1o', A1o, ...)` with a FUNCTION or CLASS that isn't the shared one), Phase 1 alone suffices — the `<style>` is injected immediately with `.A1o` selector.

### 6.5.6 Implementation surface

| File | Role |
|---|---|
| `core/Namespace.ts` → `Namespace.Define` style block | Phase 1: inject for non-Component ctors; skip when `ctor.__ariannaComponent`. |
| `core/Component.ts` → Component constructor | Phase 2: inject lazily via `new.target.name` when `descriptor.Class` first set. |
| `core/Namespace.ts` → `generateNestedCss` | Translate `:host` → `.{className}` inside nested rules. |

Idempotency marker: `descriptor._cssInjected: boolean`.

DOM marker: every framework-injected `<style>` carries `data-arianna-tag-style="{tag}"` and `data-arianna-class="{ClassName}"` attributes for debug / hot-reload tooling.

---

## 7. Host vs Internal Classes

Use `:host` for host-level behavior:

```ts
new Rule(':host', {
    display: 'inline-flex',
})
```

Use internal prefixed classes for component visuals:

```ts
new Rule('.arianna-button', {
    background: 'var(--arianna-button-bg, #f3f3f3)',
})
```

Recommended split:

| Layer | Selector | Purpose |
|---|---|---|
| Host layout | `:host` | display, visibility, sizing defaults, host state |
| Main internal control | `.arianna-button` / `.a-button` | visual box, background, border, padding |
| Internal parts | `.arianna-button-label`, `.arianna-button-icon` | fine-grain styling |
| Public façade | `arianna-button::label` | user-friendly selector mapped to internal class |

This split prevents `:host` from becoming an overloaded styling sink.

---

## 8. StyleMap

Every component with stylable internals should declare a public `StyleMap`.

Example for Button:

```ts
export const ButtonStyleMap = {
    self    : ':host',
    button  : '.arianna-button',
    control : '.arianna-button',
    label   : '.arianna-button-label',
    icon    : '.arianna-button-icon',
    trailing: '.arianna-button-trailing',
} as const;
```

The `StyleMap` is the contract used by:

- CSS façade compiler
- `Rule` validation
- `Stylesheet` validation
- safe mode filtering
- documentation generators
- visual style editors
- component subclassing

A component may expose aliases when useful:

```ts
button  -> .arianna-button
control -> .arianna-button
label   -> .arianna-button-label
```

Aliases must be documented and stable.

---

## 9. AriannA CSS Façade

The AriannA CSS façade lets users write normal-looking CSS while AriannA compiles it into Shadow-safe rules.

### 9.1 Host façade

Input:

```css
arianna-button {
    background: #111827;
    color: white;
}
```

Compiled output:

```ts
new Rule(':host', {
    background: '#111827',
    color     : 'white',
})
```

### 9.2 Internal named façade

Input:

```css
arianna-button::button {
    background: #111827;
}

arianna-button::label {
    font-weight: 700;
}
```

Compiled output:

```ts
new Stylesheet([
    new Rule('.arianna-button', {
        background: '#111827',
    }),
    new Rule('.arianna-button-label', {
        fontWeight: '700',
    }),
])
```

### 9.3 Subclass façade

Input:

```css
s-button {
    background: #111827;
    color: white;
}

s-button::label {
    font-weight: 700;
}
```

Compiled output for `s-button`:

```ts
new Stylesheet([
    new Rule(':host', {
        background: '#111827',
        color     : 'white',
    }),
    new Rule('.arianna-button-label', {
        fontWeight: '700',
    }),
])
```

The subclass may inherit the base component `StyleMap`, or define its own extended map.

---

## 10. Safe Mode and Trusted Mode

AriannA must support two style modes.

### 10.1 Safe mode

Safe mode allows only declared public selectors and safe properties.

Allowed examples:

```css
arianna-button { ... }
arianna-button::button { ... }
arianna-button::label { ... }
arianna-button[variant="danger"] { ... }
```

Rejected or restricted examples:

```css
arianna-button .some-private-node { ... }
arianna-button div > span:nth-child(2) { ... }
```

Safe mode should validate:

- selector names
- mapped `StyleMap` keys
- property whitelist
- URL values
- `position: fixed` / dangerous layout rules if needed
- external resource loading

### 10.2 Trusted mode

Trusted mode may allow deeper selectors and raw CSS imports.

Trusted mode is for:

- framework internals
- first-party app code
- design system packages
- development tooling
- advanced migrations

Even in trusted mode, AriannA should prefer StyleMap selectors over arbitrary internal selectors.

---

## 11. Subclass Styling

Subclassing is a first-class customization mechanism, but examples such as `s-button` are **playground/demo examples only** unless the project explicitly decides to promote them into production components.

Do **not** add `SButton.ts` to `components/inputs/` and do **not** export it from the input barrel. The canonical component remains `Button`; `s-button` is only a sample custom element created inside the playground example to demonstrate subclass styling.

Example playground-only subclass: `s-button` extends `Button` and changes background.

```ts
// Playground example code only. Not a new source component.
class SButton extends Component(
    's-button',
    Button,
    new Stylesheet([
        new Rule('.arianna-button', {
            background: '#111827',
            color: '#ffffff',
            border: '1px solid #374151',
        }),
        new Rule('.arianna-button-label', {
            fontWeight: '700',
        }),
    ]),
    {
        attrs : ['variant', 'size', 'icon', 'disabled', 'label'],
        shadow: 'closed',
    }
) {}
```

This produces a temporary demo custom element with its own default style while still inheriting `Button` behavior. Production components must only be added as real source files when intentionally accepted as part of the public API.

## 12. Instance Styling

Instance-specific customization should use `Sheet.Current`.

```ts
const button = document.querySelector('arianna-button');

button.Sheet.Current.add(
    new Rule('.arianna-button', {
        background: '#7c3aed',
        color     : '#ffffff',
    })
);
```

This changes one instance without mutating `Button.Sheet.Default`.

When applying instance styles from basic CSS, AriannA may compile and attach them to the matching component instance's `Sheet.Current`.

---

## 13. Tokens

CSS custom properties remain recommended for broad theming.

```css
arianna-button {
    --arianna-button-bg: #111827;
    --arianna-button-color: white;
}
```

Component internals should consume tokens:

```ts
new Rule('.arianna-button', {
    background: 'var(--arianna-button-bg, #f3f3f3)',
    color     : 'var(--arianna-button-color, inherit)',
})
```

Tokens are best for:

- colors
- spacing
- border radius
- typography
- common theme values
- design-system-wide consistency

`StyleMap` rules are best for:

- targeted internal styling
- subclass-specific overrides
- per-instance custom styling
- advanced component theming

---

## 14. Slots and Style Boundaries

Slots are the preferred way to customize content structure.

```html
<arianna-button>
    <span slot="icon">💾</span>
    Save
    <span slot="trailing">⌘S</span>
</arianna-button>
```

The component may style slot containers:

```ts
new Rule('.arianna-button-icon', {
    display: 'inline-flex',
})
```

The slotted content itself remains user-owned content.

---

## 15. Recommended Button Contract

Button should expose this internal structure:

```html
<button class="arianna-button a-button" part="button" type="button">
    <span class="arianna-button-icon a-button-icon" part="icon">
        <slot name="icon"></slot>
    </span>
    <span class="arianna-button-label a-button-label" part="label">
        <slot></slot>
    </span>
    <span class="arianna-button-trailing a-button-trailing" part="trailing">
        <slot name="trailing"></slot>
    </span>
</button>
```

Button should expose this `StyleMap`:

```ts
export const ButtonStyleMap = {
    self    : ':host',
    button  : '.arianna-button',
    control : '.arianna-button',
    icon    : '.arianna-button-icon',
    label   : '.arianna-button-label',
    trailing: '.arianna-button-trailing',
} as const;
```

Button default style should use the prefixed classes:

```ts
new Stylesheet([
    new Rule(':host', {
        display: 'inline-flex',
    }),
    new Rule('.arianna-button', {
        background  : 'var(--arianna-button-bg, #f3f3f3)',
        border      : '1px solid var(--arianna-button-border, #d8d8d8)',
        borderRadius: 'var(--arianna-button-radius, 6px)',
        color       : 'var(--arianna-button-color, inherit)',
        padding     : 'var(--arianna-button-padding, 5px 14px)',
    }),
    new Rule('.arianna-button-label', {
        display: 'inline-flex',
    }),
])
```

---

## 16. What Not To Do

Do not make component internals customizable only through global CSS:

```css
arianna-button .label { ... }
```

This does not work with closed Shadow DOM.

Do not use private structural selectors as the public contract:

```css
arianna-button div > span:nth-child(2) { ... }
```

Do not put structural default styling in `build()`:

```ts
build() {
    this.Sheet = Button.DefaultSheet();
}
```

Do not rely only on tag selectors inside ShadowRoot:

```ts
new Rule('button', { ... })
```

Prefer stable prefixed classes:

```ts
new Rule('.arianna-button', { ... })
```

---

## 17. Decision Summary

AriannA styling should use this hierarchy:

1. `:host` for host behavior and layout.
2. Stable prefixed internal classes for default component visuals.
3. `StyleMap` for public named selectors.
4. `Rule` for atomic styles.
5. `Stylesheet` for ordered style collections.
6. CSS façade for normal-looking user CSS.
7. tokens for broad theme values.
8. subclass `Sheet.Default` for reusable design variants.
9. instance `Sheet.Current` for one-off customization.
10. trusted mode for advanced deep styling only when explicitly enabled.

This gives AriannA both goals:

- closed Shadow DOM safety
- deep, practical, developer-friendly customization

