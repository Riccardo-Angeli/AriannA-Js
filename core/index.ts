/**
 * @module    core
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA core — public package barrel.
 *
 *   import { Core, signal, effect, Component, html } from 'arianna/core';
 *
 * The `AriannaElement` interface (exported from `Component.ts`) is the
 * canonical type for every class produced by `Component('arianna-x', …)`.
 * No separate ambient declaration file is needed — the typings live with
 * the runtime code that installs them.
 *
 * THE BARREL BOOTS THE KERNEL. `Core.ts` does NOT self-boot — its last line is
 * `export default Core`. The single `new Core.AriannA()` below is the boot: its
 * constructor runs `Initialize()` synchronously — seeding the native descriptors,
 * publishing the namespace on `globalThis.Core`, and starting the global Observer.
 *
 * That call MUST stay ABOVE the `htmlNamespace` / `svgNamespace` / `mathMLNamespace`
 * / `x3dNamespace` bindings. ES module bodies evaluate top-to-bottom, so an
 * `export const` placed before the boot captures an EMPTY registry and is frozen at
 * `undefined` forever — the binding is live, but nothing ever reassigns it. Moving
 * the boot back to the end of this file silently breaks all four exports with no
 * error at compile time and none at runtime. Do not move it.
 *
 * Once booted, the built-in namespaces are READ from the live registry — never
 * re-installed. `Install()` is not idempotent: it builds four fresh Namespace
 * instances and overwrites the registered ones, discarding every descriptor
 * defined in between.
 *
 * `Core` is imported BY NAME, not as the default. Core.ts exports the same
 * identifier twice — `export namespace Core` and `export default Core` — and a
 * default import of an identifier that also exists as a named export leaves the
 * bundler with two bindings called `Core`; it renames one to `Core2` and loses
 * the link, which surfaces as `ReferenceError: Can't find variable: Core2` and
 * as `Core` vanishing from the bundle's export list. Every other module already
 * imports it by name.
 *
 * Name conflicts (resolved by aliasing):
 *   • `html`      Template tag function (from Template.ts) — canonical
 *                 The namespace objects are available as `htmlNamespace` /
 *                 `svgNamespace` / `mathMLNamespace` / `x3dNamespace`
 *   • `Component` Component factory (from Component.ts) — canonical
 *                 Directive.Component decorator available as `ComponentDecorator`
 */

import { Core } from './Core.ts';
import { Css }  from './Css.ts';

// ── Default class exports as named bindings ─────────────────────────────────
export { Core };
export { Css };
export {Reactivity } from './Reactive.ts';
import State from './State.ts';
import { Namespaces } from './Namespaces.ts';
export { State };
export { default as Real }       from './Real.ts';
export { default as Virtual }    from './Virtual.ts';
export { default as Component }  from './Components.ts';    // canonical
export { default as Directive }  from './Directives.ts';
import Context from './Context.ts';
export { Context };

/**
 * Observer is imported BY VALUE and re-exported, not `import type`.
 *
 * Core.ts references it only as `import type { Observer }`, which TypeScript ERASES at
 * compile time — so before this line nothing in the emitted graph loaded Observer.js. The
 * module never ran, its `'observer'` service was never registered, and `AriannA.Initialize()`
 * bailed at `if (!service) return;` without ever building the global MutationObserver. The
 * visible symptom was that `document.createElement('mytag')` + `appendChild` never upgraded:
 * no error on any layer, just an element that stayed HTMLUnknownElement.
 *
 * It must be imported BEFORE the kernel boot below. ES modules evaluate every import before
 * the module body, and in declaration order, so Core.ts finishes first and `Core.Services`
 * exists by the time Observer.ts registers against it.
 */
import { Observer, observerService } from './Observer.ts';
export { Observer, observerService };

/**
 * The distributed registry CLASS — not the `Core` namespace object. A value binding and
 * not an `export … from` alias, because a namespace member cannot be re-exported that way.
 */
export const Namespace = Namespaces.Namespace;

/**
 * The two Css classes as top-level bindings. The namespace export alone leaves them at
 * `Css.Rule` / `Css.Stylesheet`, so a page that mirrors this barrel onto globalThis ends up
 * with `Css` and nothing else — and `new Rule(...)` is a ReferenceError. Same objects, so
 * `Rule` and `Css.Rule` are interchangeable.
 */
export const Rule       = Css.Rule;
export const Stylesheet = Css.Stylesheet;

// ── Named class re-exports ──────────────────────────────────────────────────

// ── v2 — Dotted-path / SubAccessor helpers (shared by Real, Virtual, Component)

// ── Reactive primitives → under the Observables namespace (Observables.signal / .effect / …) ──

// ── Rule system → under the Css namespace (Css.Rule / Css.Stylesheet), mirrored above ──

// ── Template DSL ────────────────────────────────────────────────────────────
export { html, css }                  from './Template.ts';
export { Template, TemplateInstance } from './Template.ts';

// ── Kernel boot ─────────────────────────────────────────────────────────────
// The ONE side effect of this barrel, and it must come before the four bindings
// below. Core.ts does not self-boot; this constructor runs Initialize() and
// populates Namespace.Namespaces. See the header note before moving this line.
export const arianna = new Core.AriannA();

// ── Namespace objects (aliased to avoid conflict with Template.html) ────────
// READ from the live registry — do NOT call Install() here. Install() is not
// idempotent: it builds four fresh Namespace instances and overwrites the
// registered ones, discarding every descriptor defined in between.
export const htmlNamespace   = Namespaces.Namespace.Namespaces['html'];
export const svgNamespace    = Namespaces.Namespace.Namespaces['svg'];
export const mathMLNamespace = Namespaces.Namespace.Namespaces['mathML'];
export const x3dNamespace    = Namespaces.Namespace.Namespaces['x3d'];

// ── Directive.Component decorator (aliased) ─────────────────────────────────
export {
    ComponentDecorator,
    Prop,
} from './Directives.ts';

// ── JSX.ts — unified hyperscript / component interfaces ─────────────────────
// One module, three interfaces:
//   • AriannA native runtime: hyperscript / jsx / jsxs / Fragment / setDefaultRuntime
//   • Snabbdom-compatible:    h (selector + {on,props,attrs,style,class}) + patch
//   • React-compatible:       createElement / Component / createRoot / React
// The public `h` and `patch` are the Snabbdom pair (what the docs example uses).
export {
    // AriannA native
    hyperscript,
    jsx,
    jsxs,
    Fragment,
    setDefaultRuntime,
    getDefaultRuntime,
    // Snabbdom-compatible
    h,
    patch,
    // React-compatible
    createElement,
    ReactComponent,
    createRoot,
    React,
} from './Jsx.ts';
export type { JSXNode, JSXProps, JSXRuntime } from './Jsx.ts';
export type { VNode, SnabbdomData, ReactElement, Root } from './Jsx.ts';
export { jsxDEV } from './Jsx.ts';

// ── SSR + Workers utilities ─────────────────────────────────────────────────
export { escapeHtml, renderToString, hydrate, Island, SSR } from './SSR.ts';
export { WorkerPool, Workers }                              from './Workers.ts';

// ── Public types (reactivity types are under Observables.*, e.g. Observables.Signal) ──
export type { StateEvent } from './State.ts';
export type { ComponentMeta, CustomDirectiveHooks }                from './Directives.ts';
export type ContextEvent<T = unknown> = Context.ContextEvent<T>;

