/**
 * @file arianna.d.ts
 * @description Global window declarations for AriannA Framework v2.0.0
 * @author Riccardo Angeli
 * @copyright Riccardo Angeli 2012–2026
 *
 * Include in tsconfig.json:
 *   { "compilerOptions": { "types": ["arianna"] } }
 * or reference directly:
 *   /// <reference types="arianna" />
 *
 * v2 notes:
 *   • `Component` is dual-callable:
 *       new Component('div', opts)         → instance
 *       Component('arianna-x', def)        → returns a tag-bound subclass,
 *                                            registered via Core.Define
 *   • Pure CSS preprocessors live in `additionals/`:
 *       Less, Sass, Scss, Stylus
 *     (`Sheet.Less(text)` in core is now a thin wrapper to `additionals/Less`.)
 *   • Each declared `def.attrs` entry becomes an internal `Signal<string|null>`
 *     bridged to the DOM via a `<name>-change` event.
 */

import type { default as _Core, TypeDescriptor, NamespaceDescriptor } from '../core/Core.ts';
import type { default as _Observable, Signal, SignalMono, ReadonlySignal,
              AriannAEvent, ListenerOptions } from '../core/Observable.ts';
import type { default as _State, StateEvent } from '../core/State.ts';
import type { default as _Real, RealTarget, RealDef } from '../core/Real.ts';
import type { default as _Virtual, VirtualNode } from '../core/Virtual.ts';
import type { Component as _Component, ComponentDef, ComponentOptions } from '../core/Component.ts';
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

// ── v2 pilot components ───────────────────────────────────────────────────
import type { Button             as _Button             } from '../components/inputs/Button.ts';
import type { TextField          as _TextField          } from '../components/inputs/TextField.ts';
import type { Card               as _Card               } from '../components/display/Card.ts';
import type { Modal              as _Modal              } from '../components/layout/Modal.ts';
import type { Tabs               as _Tabs,
              Tab                as _Tab                } from '../components/navigation/Tabs.ts';
import type { Mover              as _Mover              } from '../components/modifiers/2D/Mover.ts';
import type { ColorPickerWheel   as _ColorPickerWheel   } from '../components/graphics/colors/ColorPickerWheel.ts';
import type { CandlestickChart   as _CandlestickChart   } from '../components/finance/CandlestickChart.ts';
import type { DHLTracker         as _DHLTracker         } from '../components/shipments/DHLTracker.ts';
import type { AudioTrackEditor   as _AudioTrackEditor,
              AudioTrack         as _AudioTrack,
              AudioPart          as _AudioPart          } from '../components/audio/AudioTrackEditor.ts';

// ── CSS preprocessors (now in additionals/) ───────────────────────────────
import type { default as _Less   } from '../additionals/Less.ts';
import type { default as _Sass   } from '../additionals/Sass.ts';
import type { default as _Scss   } from '../additionals/Scss.ts';
import type { default as _Stylus } from '../additionals/Stylus.ts';

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

    /**
     * Component — dual-callable AriannA component base.
     *
     *   new Component('div', { class: 'foo' })   // instance
     *   class X extends Component('arianna-x', { attrs: [...], shadow: 'drop' }) { build() {…} }
     */
    const Component: typeof _Component;

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

    // ── CSS preprocessors (additionals/) ──────────────────────────────────────

    /** Less.js-flavoured parser → CSS string. */
    const Less:   typeof _Less;
    /** Sass indentation-based parser → CSS string. */
    const Sass:   typeof _Sass;
    /** SCSS brace-delimited parser → CSS string. */
    const Scss:   typeof _Scss;
    /** Stylus permissive parser → CSS string. */
    const Stylus: typeof _Stylus;

    // ── New May-2026 components (also on window) ──────────────────────────────

    const Calendar: typeof _Calendar;
    const Dock: typeof _Dock;
    const Window: typeof _Window;
    const MapEmbed: typeof _MapEmbed;
    const GoogleMap: typeof _GoogleMap;
    const OpenStreetMap: typeof _OpenStreetMap;
    const AppleMap: typeof _AppleMap;
    const BingMap: typeof _BingMap;

    // ── v2 pilot components ───────────────────────────────────────────────────

    const Button:             typeof _Button;
    const TextField:          typeof _TextField;
    const Card:               typeof _Card;
    const Modal:              typeof _Modal;
    const Tabs:               typeof _Tabs;
    const Tab:                typeof _Tab;
    const Mover:              typeof _Mover;
    const ColorPickerWheel:   typeof _ColorPickerWheel;
    const CandlestickChart:   typeof _CandlestickChart;
    const DHLTracker:         typeof _DHLTracker;
    const AudioTrackEditor:   typeof _AudioTrackEditor;
    const AudioTrack:         typeof _AudioTrack;
    const AudioPart:          typeof _AudioPart;

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
        // CSS preprocessors (additionals)
        Less          : typeof _Less;
        Sass          : typeof _Sass;
        Scss          : typeof _Scss;
        Stylus        : typeof _Stylus;
        // May-2026 group
        Calendar      : typeof _Calendar;
        Dock          : typeof _Dock;
        Window        : typeof _Window;
        MapEmbed      : typeof _MapEmbed;
        GoogleMap     : typeof _GoogleMap;
        OpenStreetMap : typeof _OpenStreetMap;
        AppleMap      : typeof _AppleMap;
        BingMap       : typeof _BingMap;
        // v2 pilots
        Button            : typeof _Button;
        TextField         : typeof _TextField;
        Card              : typeof _Card;
        Modal             : typeof _Modal;
        Tabs              : typeof _Tabs;
        Tab               : typeof _Tab;
        Mover             : typeof _Mover;
        ColorPickerWheel  : typeof _ColorPickerWheel;
        CandlestickChart  : typeof _CandlestickChart;
        DHLTracker        : typeof _DHLTracker;
        AudioTrackEditor  : typeof _AudioTrackEditor;
        AudioTrack        : typeof _AudioTrack;
        AudioPart         : typeof _AudioPart;
    }
}

export {};
