/**
 * @module    components/audio/AudioComponent
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Abstract base class for all AriannA audio widgets. Provides:
 *
 *   • A shared, lazy-initialised `AudioContext` (one per page)
 *   • `connect()` / `disconnect()` routing API (chainable)
 *   • `_input` / `_output` AudioNode references that subclasses populate
 *     inside `#buildAudioGraph()`
 *   • A static `resume()` helper for the browser autoplay-policy gesture
 *   • Lifecycle hooks aligned with the rest of the v2 component system
 *
 * AudioComponent itself is a v2 `Component` — it extends `Component(...)`
 * with a generic tag `arianna-audio-base`. The tag is registered but the
 * class is `abstract`, so it cannot be instantiated directly; concrete
 * subclasses each declare their own tag (e.g. `arianna-channel-strip`,
 * `arianna-audio-player`, `arianna-piano-roll`, …).
 *
 * NOTE — single-extends rule:
 * A class can only extend a Component factory once. The audio widgets in
 * the audio/ folder extend AudioComponent directly. VideoPlayer (video/
 * folder) does NOT extend AudioComponent because it already extends
 * `Component('arianna-video-player', …)`; instead it composes an
 * AudioComponent via a helper field when Web Audio routing is required.
 *
 * @example minimal subclass
 *   import { AudioComponent } from './AudioComponent.ts';
 *
 *   export class Gain extends AudioComponent {
 *       protected _buildAudioGraph(): void {
 *           const g = this._audioCtx.createGain();
 *           g.gain.value = 1.0;
 *           this._input  = g;
 *           this._output = g;
 *       }
 *   }
 *
 * @example routing
 *   await AudioComponent.resume();           // unlock after user gesture
 *   const player = new AudioPlayer();
 *   const strip  = new ChannelStrip();
 *   player.connect(strip).connect(AudioComponent.context.destination);
 *
 *
 * INTEGRATION NOTE:
 *
 * This file lives outside the payments/shipments/video folders because it
 * will be installed (manually) into the `audio/` folder once the audio
 * batch arrives. Until then, VideoPlayer does NOT import this module — it
 * uses native `<video>` element listeners only. When AudioComponent is in
 * place, the optional Web Audio bridge can be added by composing one of
 * its concrete subclasses as a field of VideoPlayer (no inheritance
 * required, no double-extends).
 */

import { Component } from '../../core/Component.ts';

// ── Shared AudioContext ─────────────────────────────────────────────────────
// One context per page. Created lazily on first access (autoplay policy).

let _sharedCtx: AudioContext | undefined;

function getSharedContext(): AudioContext {
    if (!_sharedCtx) {
        const Ctor = (window.AudioContext ||
                     (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        _sharedCtx = new Ctor();
    }
    return _sharedCtx;
}

// ── Options ────────────────────────────────────────────────────────────────

export interface AudioComponentOptions {
    /** Use a custom AudioContext instead of the shared one. */
    audioContext? : AudioContext;
}

// ── Base class ─────────────────────────────────────────────────────────────

/**
 * Abstract base — declares its own concrete tag `arianna-audio-base` because
 * a Component factory expects a tag, but the class is `abstract` so nothing
 * can ever directly instantiate it. Each concrete audio subclass will
 * declare its own tag via its own `Component(…)` chain — see "single-extends
 * rule" in the module docblock.
 */
export abstract class AudioComponent extends Component('arianna-audio-base', HTMLElement, {}, {
    attrs : [],
})
{
    /** Static accessor for the shared AudioContext. */
    static get context(): AudioContext { return getSharedContext(); }

    /** Resume the shared context (call after a user gesture). */
    static async resume(): Promise<void> {
        const ctx = getSharedContext();
        if (ctx.state === 'suspended') await ctx.resume();
    }

    /** Per-instance context (defaults to shared). Set in `#bindAudioContext`. */
    protected _audioCtx: AudioContext = undefined as unknown as AudioContext;

    /** Where signals enter this component. Subclasses assign in `_buildAudioGraph`. */
    protected _input?  : AudioNode;

    /** Where signals leave this component. Subclasses assign in `_buildAudioGraph`. */
    protected _output? : AudioNode;

    /** Track active downstream connections for clean disconnect. */
    #downstream: Set<AudioNode> = new Set();

    /** Subclasses override this to construct their internal Web Audio graph
     *  and assign `this._input` / `this._output`. Called once from `onMount`
     *  unless the subclass overrides `onMount` and forgets to call super. */
    protected _buildAudioGraph(): void { /* override in subclass */ }

    /** Connect this component's output to another audio destination.
     *  Accepts another AudioComponent (in which case its `_input` is used),
     *  a raw AudioNode, or the AudioContext's destination. Chainable. */
    connect(target: AudioNode | AudioComponent): this {
        if (!this._output) return this;
        const node: AudioNode | undefined =
              target instanceof AudioComponent
                ? target._input
                : target;
        if (!node) return this;
        this._output.connect(node);
        this.#downstream.add(node);
        return this;
    }

    /** Disconnect from a specific destination, or from all if no arg. */
    disconnect(target?: AudioNode | AudioComponent): this {
        if (!this._output) return this;
        if (target == null) {
            this._output.disconnect();
            this.#downstream.clear();
            return this;
        }
        const node: AudioNode | undefined =
              target instanceof AudioComponent
                ? target._input
                : target;
        if (!node) return this;
        try { this._output.disconnect(node); } catch { /* not connected — ignore */ }
        this.#downstream.delete(node);
        return this;
    }

    /** Get the output AudioNode of this component, or undefined if the
     *  graph hasn't been built yet (or this widget has no audio output). */
    getOutput(): AudioNode | undefined { return this._output; }

    /** Get the input AudioNode of this component, or undefined. */
    getInput(): AudioNode | undefined { return this._input; }

    /** Bind the AudioContext from `audioContext` option (if present) or
     *  fall back to the shared one. Subclasses should call this once during
     *  `onBeforeMount` or override `onBeforeMount` and forward. */
    protected _bindAudioContext(ctx?: AudioContext): void {
        this._audioCtx = ctx ?? getSharedContext();
    }

    // ── Lifecycle defaults — concrete subclasses override as needed ────────

    onCreated()       {}
    onBeforeMount() {
        if (!this._audioCtx) this._bindAudioContext();
    }
    onMount() {
        if (!this._output && !this._input) this._buildAudioGraph();
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        if (this._output) {
            try { this._output.disconnect(); } catch { /* ignore */ }
        }
        this.#downstream.clear();
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AudioComponent', {
        value: AudioComponent, writable: false, enumerable: false, configurable: false,
    });
}

export default AudioComponent;
