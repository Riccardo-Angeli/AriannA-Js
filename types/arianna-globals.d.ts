/**
 * @file arianna-globals.d.ts
 * @description Module augmentation for the 'arianna' package. v2.
 *              Extends the base `arianna` module with the Pipeline 6
 *              component family (audio/video/composite/chat/graphics/
 *              payments/shipments), the Colors addon, the May-2026 groups
 *              (input/layout/maps) and the v2 pilot components (Button,
 *              TextField, Card, Modal, Tabs, Mover, ColorPickerWheel,
 *              CandlestickChart, DHLTracker, AudioTrackEditor).
 *              Also covers the CSS-preprocessor additionals (Less, Sass,
 *              Scss, Stylus) now living under `additionals/`.
 * @author Riccardo Angeli
 * @copyright Riccardo Angeli 2012–2026
 */

declare module 'types/arianna' {
    // ── Core ───────────────────────────────────────────────────────────────
    export { default as Core } from './core/Core.ts';
    export { default as Observable, signal, signalMono, effect, computed,
             batch, untrack, uuid, AriannATemplate } from './core/Observable.ts';
    export { default as State }     from './core/State.ts';
    export { default as Real }      from './core/Real.ts';
    export { default as Virtual, default as VirtualNode } from './core/Virtual.ts';
    export { Component, ComponentClass } from './core/Component.ts';
    export type { ComponentDef, ComponentOptions, ShadowSetting, RenderMode } from './core/Component.ts';
    export { default as Directive } from './core/Directive.ts';
    export { Rule, CssState }       from './core/Rule.ts';
    export { default as Sheet }     from './core/Stylesheet.ts';
    export { default as Context }   from './core/Context.ts';
    export { default as Namespace } from './core/Namespace.ts';
    export { default as SSR }       from './core/SSR.ts';
    export { Workers, WorkerPool }  from './core/Workers.ts';

    export type { Signal, SignalMono, ReadonlySignal, AriannAEvent,
                  ListenerOptions }                from './core/Observable.ts';
    export type { TypeDescriptor, NamespaceDescriptor } from './core/Core.ts';
    export type { StateEvent }                     from './core/State.ts';
    export type { RealTarget, RealDef }            from './core/Real.ts';
    export type { VAttrs, VChild }                 from './core/Virtual.ts';
    export type { CSSProperties, RuleDefinition }  from './core/Rule.ts';
    export type { ContextEvent }                   from './core/Context.ts';
    export type { ComponentMeta }                  from './core/Directive.ts';
    export type { WorkerTask }                     from './core/Workers.ts';
}

// ── Additionals — barrel + per-module sub-paths ────────────────────────────

declare module 'arianna/additionals' {
    export * from './additionals/index.ts';
}

declare module 'arianna/additionals/AI'        { export * from './additionals/AI.ts'; }
declare module 'arianna/additionals/Animation' { export * from './additionals/Animation.ts'; }
declare module 'arianna/additionals/Audio'     { export * from './additionals/Audio.ts'; }
declare module 'arianna/additionals/Colors'    { export * from './additionals/Colors.ts'; }
declare module 'arianna/additionals/Data'      { export * from './additionals/Data.ts'; }
declare module 'arianna/additionals/Finance'   { export * from './additionals/Finance.ts'; }
declare module 'arianna/additionals/Geometry'  { export * from './additionals/Geometry.ts'; }
declare module 'arianna/additionals/IO'        { export * from './additionals/IO.ts'; }
declare module 'arianna/additionals/Latex'     { export * from './additionals/Latex.ts'; }
declare module 'arianna/additionals/Less'      { export * from './additionals/Less.ts'; }
declare module 'arianna/additionals/Math'      { export * from './additionals/Math.ts'; }
declare module 'arianna/additionals/Midi'      { export * from './additionals/Midi.ts'; }
declare module 'arianna/additionals/Network'   { export * from './additionals/Network.ts'; }
declare module 'arianna/additionals/Physics'   { export * from './additionals/Physics.ts'; }
declare module 'arianna/additionals/Sass'      { export * from './additionals/Sass.ts'; }
declare module 'arianna/additionals/Scss'      { export * from './additionals/Scss.ts'; }
declare module 'arianna/additionals/Stylus'    { export * from './additionals/Stylus.ts'; }
declare module 'arianna/additionals/Three'     { export * from './additionals/Three.ts'; }
declare module 'arianna/additionals/Two'       { export * from './additionals/Two.ts'; }
declare module 'arianna/additionals/Video'     { export * from './additionals/Video.ts'; }

// ── Components — sub-path declarations ─────────────────────────────────────

declare module 'arianna/components' {
    export * from './components/audio/index.ts';
    export * from './components/video/index.ts';
    export * from './components/composite/index.ts';
    export * from './components/graphics/2D/index.ts';
    export * from './components/graphics/3D/index.ts';
    export * from './components/graphics/colors/index.ts';
    export * from './components/payments/index.ts';
    export * from './components/shipments/index.ts';
    export * from './components/inputs/index.ts';
    export * from './components/layout/index.ts';
    export * from './components/maps/index.ts';
    export * from './components/navigation/index.ts';
    export * from './components/finance/index.ts';
    export * from './components/modifiers/index.ts';
}

declare module 'arianna/components/audio'           { export * from './components/audio/index.ts'; }
declare module 'arianna/components/video'           { export * from './components/video/index.ts'; }
declare module 'arianna/components/composite'       { export * from './components/composite/index.ts'; }
declare module 'arianna/components/graphics/2D'     { export * from './components/graphics/2D/index.ts'; }
declare module 'arianna/components/graphics/3D'     { export * from './components/graphics/3D/index.ts'; }
declare module 'arianna/components/graphics/colors' { export * from './components/graphics/colors/index.ts'; }
declare module 'arianna/components/payments'        { export * from './components/payments/index.ts'; }
declare module 'arianna/components/shipments'       { export * from './components/shipments/index.ts'; }
declare module 'arianna/components/inputs'          { export * from './components/inputs/index.ts'; }
declare module 'arianna/components/layout'          { export * from './components/layout/index.ts'; }
declare module 'arianna/components/maps'            { export * from './components/maps/index.ts'; }
declare module 'arianna/components/navigation'      { export * from './components/navigation/index.ts'; }
declare module 'arianna/components/finance'         { export * from './components/finance/index.ts'; }
declare module 'arianna/components/modifiers'       { export * from './components/modifiers/index.ts'; }

// ── Map providers — per-file tree-shaking paths ────────────────────────────

declare module 'arianna/components/maps/GoogleMaps' {
    export { GoogleMap } from './components/maps/GoogleMaps.ts';
    export type { LatLng, MapEmbedOptions, MapProvider } from './components/maps/MapEmbed.ts';
}

declare module 'arianna/components/maps/OpenStreetMaps' {
    export { OpenStreetMap } from './components/maps/OpenStreetMaps.ts';
    export type { LatLng, MapEmbedOptions, MapProvider } from './components/maps/MapEmbed.ts';
}

declare module 'arianna/components/maps/AppleMaps' {
    export { AppleMap } from './components/maps/AppleMaps.ts';
    export type { LatLng, MapEmbedOptions, MapProvider } from './components/maps/MapEmbed.ts';
}

declare module 'arianna/components/maps/BingMaps' {
    export { BingMap } from './components/maps/BingMaps.ts';
    export type { LatLng, MapEmbedOptions, MapProvider } from './components/maps/MapEmbed.ts';
}
