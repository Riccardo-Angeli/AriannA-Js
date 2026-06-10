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
 * Name conflicts (resolved by aliasing):
 *   • `html`      Template tag function (from Template.ts) — canonical
 *                 Namespace.html / Namespace.svg / Namespace.mathML
 *                 available as `htmlNamespace` / `svgNamespace` / `mathMLNamespace`
 *   • `Component` Component factory (from Component.ts) — canonical
 *                 Directive.Component decorator available as `ComponentDecorator`
 */

// ── Default class exports as named bindings ─────────────────────────────────
export { default as Core }       from './Core.ts';
export { Initialize, Bootstrap, Ready, AriannA } from './Core.ts';    // boot entry points (single-line <head> boot)
export { default as Observable } from './Observable.ts';
export { default as State }      from './State.ts';
export { default as Real }       from './Real.ts';
export { default as Virtual }    from './Virtual.ts';
export { default as Component }  from './Component.ts';    // canonical
export { default as Directive }  from './Directive.ts';
export { default as Stylesheet } from './Stylesheet.ts';
export { default as Context }    from './Context.ts';
export { default as Namespace }  from './Namespace.ts';

// ── Named class re-exports ──────────────────────────────────────────────────
export { VirtualNode } from './Virtual.ts';

// ── v2 — Dotted-path / SubAccessor helpers (shared by Real, Virtual, Component)
export { readDottedPath, writeDottedPath, makeSubAccessor, UUID } from './Core.ts';

// ── Reactive primitives ─────────────────────────────────────────────────────
export {
    signal, signalMono, effect, computed, batch, untrack,
} from './Observable.ts';

// ── Rule system ─────────────────────────────────────────────────────────────
export { Rule, CssState } from './Rule.ts';

// ── Template DSL ────────────────────────────────────────────────────────────
export { html, css }                  from './Template.ts';
export { Template, TemplateInstance } from './Template.ts';

// ── Namespace objects (aliased to avoid conflict with Template.html) ────────
// The built-ins are created + registered by Namespace.Install() — no module-load
// side-effect and no named consts. Capture the instances here for the public API
// (Install() also creates+registers x3d). Boot order:
//   Core.Initialize() (auto on Core import)  →  this Install()  →  Core.Bootstrap().
import NamespaceModule from './Namespace.ts';
export const {
    html:   htmlNamespace,
    svg:    svgNamespace,
    mathML: mathMLNamespace,
} = NamespaceModule.Install();

// ── Directive.Component decorator (aliased) ─────────────────────────────────
export {
    ComponentDecorator,
    Prop,
} from './Directive.ts';

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

// ── Public types ────────────────────────────────────────────────────────────
export type {
    Signal, SignalMono, ReadonlySignal, AriannAEvent, ListenerOptions,
} from './Observable.ts';
export type { TypeDescriptor, NamespaceDescriptor, BootSpec }      from './Core.ts';
export type { StateEvent }                                         from './State.ts';
export type { RealTarget, RealDef, SubAccessor }                   from './Real.ts';
export type { VAttrs, VChild }                                     from './Virtual.ts';
export type {
    ComponentDef, ShadowSetting, RenderMode, AriannaElement,
} from './Component.ts';
export type { ComponentMeta, CustomDirectiveHooks }                from './Directive.ts';
export type { CSSProperties, RuleDefinition, RuleEvent }           from './Rule.ts';
export type { SheetInput, SheetObjectDef, SheetRule }              from './Stylesheet.ts';
export type { ContextEvent }                                       from './Context.ts';
export type { WorkerTask }                                         from './Workers.ts';
