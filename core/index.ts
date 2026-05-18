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
export { default as Observable } from './Observable.ts';
export { default as State }      from './State.ts';
export { default as Real }       from './Real.ts';
export { default as Virtual }    from './Virtual.ts';
export { default as Component }  from './Component.ts';    // canonical
export { default as Directive }  from './Directive.ts';
export { default as Sheet }      from './Sheet.ts';
export { default as Context }    from './Context.ts';
export { default as Namespace }  from './Namespace.ts';

// ── Named class re-exports ──────────────────────────────────────────────────
export { VirtualNode } from './Virtual.ts';

// ── v2 — Dotted-path / SubAccessor helpers (shared by Real, Virtual, Component)
export { readDottedPath, writeDottedPath, makeSubAccessor } from './Real.ts';

// ── Reactive primitives ─────────────────────────────────────────────────────
export {
    signal, signalMono, effect, computed, batch, untrack, uuid,
    AriannATemplate,
} from './Observable.ts';

// ── Rule system ─────────────────────────────────────────────────────────────
export { Rule, CssState } from './Rule.ts';

// ── Template DSL ────────────────────────────────────────────────────────────
export { html, css }                  from './Template.ts';
export { Template, TemplateInstance } from './Template.ts';

// ── Namespace objects (aliased to avoid conflict with Template.html) ────────
export {
    html   as htmlNamespace,
    svg    as svgNamespace,
    mathML as mathMLNamespace,
} from './Namespace.ts';

// ── Directive.Component decorator (aliased) ─────────────────────────────────
export {
    Component as ComponentDecorator,
    Prop,
} from './Directive.ts';

// ── SSR + Workers utilities ─────────────────────────────────────────────────
export { escapeHtml, renderToString, hydrate, Island, SSR } from './SSR.ts';
export { WorkerPool, Workers }                              from './Workers.ts';

// ── Public types ────────────────────────────────────────────────────────────
export type {
    Signal, SignalMono, ReadonlySignal, AriannAEvent, ListenerOptions,
} from './Observable.ts';
export type { TypeDescriptor, NamespaceDescriptor }                from './Core.ts';
export type { StateEvent }                                         from './State.ts';
export type { RealTarget, RealDef, SubAccessor }                   from './Real.ts';
export type { VAttrs, VChild }                                     from './Virtual.ts';
export type {
    ComponentDef, ShadowSetting, RenderMode, AriannaElement,
} from './Component.ts';
export type { ComponentMeta, CustomDirectiveHooks }                from './Directive.ts';
export type { CSSProperties, RuleDefinition, RuleEvent }           from './Rule.ts';
export type { SheetInput, SheetObjectDef, SheetRule }              from './Sheet.ts';
export type { ContextEvent }                                       from './Context.ts';
export type { WorkerTask }                                         from './Workers.ts';
