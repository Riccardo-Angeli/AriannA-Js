/**
 * @file arianna.d.ts
 * @description Global window declarations for AriannA Framework v1.4.0
 * @author Riccardo Angeli
 * @copyright Riccardo Angeli 2012–2026
 *
 * Include in tsconfig.json:
 *   { "compilerOptions": { "types": ["arianna"] } }
 * or reference directly:
 *   /// <reference types="arianna" />
 */

import type { default as _Core, TypeDescriptor, NamespaceDescriptor } from '../core/Core.ts';
import type { default as _Observable, Signal, SignalMono, ReadonlySignal,
              AriannAEvent, ListenerOptions } from '../core/Observable.ts';
import type { default as _State, StateEvent } from '../core/State.ts';
import type { default as _Real, RealTarget, RealDef } from '../core/Real.ts';
import type { default as _Virtual, VirtualNode } from '../core/Virtual.ts';
import type { default as _Component, ComponentOptions } from '../core/Component.ts';
import type { default as _Directive, ComponentMeta } from '../core/Directive.ts';
import type { Rule as _Rule, CssState as _CssState, CSSProperties } from '../core/Rule.ts';
import type { default as _Sheet } from '../core/Stylesheet.ts';
import type { default as _Context, ContextEvent } from '../core/Context.ts';
import type { default as _Namespace } from '../core/Namespace.ts';

// ── New May-2026 component groups ─────────────────────────────────────────
import type { Calendar      as _Calendar      } from '../components/inputs/Calendar.ts';
import type { Dock          as _Dock          } from '../components/layout/Dock.ts';
import type { Window        as _Window        } from '../components/layout/Window.ts';
import type { MapEmbed      as _MapEmbed,
              GoogleMap     as _GoogleMap,
              OpenStreetMap as _OpenStreetMap,
              AppleMap      as _AppleMap,
              BingMap       as _BingMap       } from '../components/maps/MapEmbed.ts';

declare global {

    // ── Constructors / classes available on window ────────────────────────────

    /** AriannA Core — global registry, plugin system, namespace management. */
    const Core: typeof _Core;

    /** Observable — pub/sub event bus + fine-grain Signal primitives. */
    const Observable: typeof _Observable;

    /** State — deep reactive proxy state container. */
    const State: typeof _State;

    /**
     * Real — fluent chainable Real DOM wrapper.
     * Also callable as a factory: Real('div', { class: 'foo' })
     */
    const Real: typeof _Real & ((...args: ConstructorParameters<typeof _Real>) => InstanceType<typeof _Real>);

    /**
     * Virtual — Virtual DOM node.
     * Also callable as a factory: Virtual('div', { class: 'foo' })
     */
    const Virtual: typeof VirtualNode & ((...args: ConstructorParameters<typeof VirtualNode>) => VirtualNode);

    /** Component — dual-mode component (Real/Virtual). */
    const Component: typeof _Component & ((...args: ConstructorParameters<typeof _Component>) => InstanceType<typeof _Component>);

    /** Directive — DOM directive runtime + TS decorator helpers. */
    const Directive: typeof _Directive;

    /** Rule — CSS rule engine v2. */
    const Rule: typeof _Rule;

    /** Sheet — stylesheet manager. */
    const Sheet: typeof _Sheet;

    /** CssState — CSS state machine helper. */
    const CssState: typeof _CssState;

    /** Context — provider/consumer context API. */
    const Context: typeof _Context;

    /** Namespace — namespace registration (HTML, SVG, MathML, X3D). */
    const Namespace: typeof _Namespace;

    // ── Fine-grain reactive primitives (also on window) ───────────────────────

    /** Create an atomic reactive Signal<T>. */
    function signal<T>(value: T): Signal<T>;

    /** Create a single-slot SignalMono<T> for direct TextNode patching. */
    function signalMono<T>(value: T): SignalMono<T>;

    /** Register a reactive Effect — re-runs when any read Signal changes. */
    function effect(fn: () => void): () => void;

    /** Create a read-only computed Signal derived from other Signals. */
    function computed<T>(fn: () => T): ReadonlySignal<T>;

    /** Batch multiple Signal updates into a single flush. */
    function batch(fn: () => void): void;

    /** Read Signals without tracking dependencies. */
    function untrack<T>(fn: () => T): T;

    // ── New May-2026 components (also on window) ──────────────────────────────

    /** Calendar — month/week/day views with event placement, also usable as a date picker. */
    const Calendar: typeof _Calendar;

    /** Dock — desktop launcher with two switchable styles ('macos' | 'windows'). */
    const Dock: typeof _Dock;

    /** Window — desktop-style window chrome with draggable title bar, resize, min/max/close. */
    const Window: typeof _Window;

    /** MapEmbed — abstract base for the four map embedders. */
    const MapEmbed: typeof _MapEmbed;

    /** GoogleMap — Google Maps iframe embedder (no API key required for basic map). */
    const GoogleMap: typeof _GoogleMap;

    /** OpenStreetMap — OSM iframe embedder using the public export endpoint. */
    const OpenStreetMap: typeof _OpenStreetMap;

    /** AppleMap — Apple Maps embedder (renders on Apple platforms; fallback card elsewhere). */
    const AppleMap: typeof _AppleMap;

    /** BingMap — Microsoft Bing Maps iframe embedder. */
    const BingMap: typeof _BingMap;

    // ── Window interface augmentation ─────────────────────────────────────────

    interface Window {
        Core          : typeof _Core;
        Observable    : typeof _Observable;
        State         : typeof _State;
        Real          : typeof _Real;
        Virtual       : typeof VirtualNode;
        Component     : typeof _Component;
        Directive     : typeof _Directive;
        Rule          : typeof _Rule;
        Sheet         : typeof _Sheet;
        Context       : typeof _Context;
        Namespace     : typeof _Namespace;
        signal        : <T>(value: T) => Signal<T>;
        signalMono    : <T>(value: T) => SignalMono<T>;
        effect        : (fn: () => void) => () => void;
        computed      : <T>(fn: () => T) => ReadonlySignal<T>;
        batch         : (fn: () => void) => void;
        untrack       : <T>(fn: () => T) => T;
        // ── New May-2026 components ───────────────────────────────────────────
        Calendar      : typeof _Calendar;
        Dock          : typeof _Dock;
        Window        : typeof _Window;
        MapEmbed      : typeof _MapEmbed;
        GoogleMap     : typeof _GoogleMap;
        OpenStreetMap : typeof _OpenStreetMap;
        AppleMap      : typeof _AppleMap;
        BingMap       : typeof _BingMap;
    }
}

export {};
