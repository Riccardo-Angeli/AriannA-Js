/**
 * @module    components/audio/AudioPlayer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AudioPlayer component module.
 */

import { Css, Reactivity } from '../../core/index.ts';
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';

type AudioComponentOptions = AudioComponentModule.AudioComponentOptions;
import { TransportBar } from './TransportBar.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   AudioPlayer
 *  @public
 *  @description Namespace containing AudioPlayer contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AudioPlayer
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   AudioPlayerOptions
         *  @public
         *  @description AudioPlayerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AudioPlayerOptions extends AudioComponentOptions
        {
            /** @name        src
             *  @public
             *  @type        {string}
             *  @description Component member for src.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            src?: string;

            /** @name        autoplay
             *  @public
             *  @type        {boolean}
             *  @description Component member for autoplay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            autoplay?: boolean;

            /** @name        loop
             *  @public
             *  @type        {boolean}
             *  @description Component member for loop.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            loop?: boolean;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;
        }
    }
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        effect
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned effect value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const effect = (fn: () => void): (() => void) => {
        /** @name        e
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned e value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const e = Reactivity.CreateEffect(fn);
        return () => e.Stop();
    };

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       AudioPlayer
     *  @public
     *  @description AriannA AudioPlayer component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class AudioPlayer extends AudioComponentModule.AudioComponent
    {
        /** @name        tag
         *  @public
         *  @readonly
         *  @static
         *  @type        {unknown}
         *  @description Component member for tag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly tag = 'arianna-audio-player';

        /** @name        src$
         *  @public
         *  @readonly
         *  @type        {AudioPlayer.Types.Signal<string>}
         *  @description Component member for src$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly src$: Types.Signal<string> = signal('');

        /** @name        label$
         *  @public
         *  @readonly
         *  @type        {AudioPlayer.Types.Signal<string>}
         *  @description Component member for label$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly label$: Types.Signal<string> = signal('');

        /** @name        loading$
         *  @public
         *  @readonly
         *  @type        {AudioPlayer.Types.Signal<boolean>}
         *  @description Component member for loading$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly loading$: Types.Signal<boolean> = signal(false);

        /** @name        #audio
         *  @public
         *  @type        {HTMLAudioElement}
         *  @description Component member for audio.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #audio?: HTMLAudioElement;

        /** @name        #source
         *  @public
         *  @type        {MediaElementAudioSourceNode}
         *  @description Component member for source.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #source?: MediaElementAudioSourceNode;

        /** @name        #gain
         *  @public
         *  @type        {GainNode}
         *  @description Component member for gain.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #gain?: GainNode;

        /** @name        #transport
         *  @public
         *  @type        {TransportBar}
         *  @description Component member for transport.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #transport?: TransportBar.TransportBar;

        /** @name        #rafId
         *  @public
         *  @type        {unknown}
         *  @description Component member for raf Id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #rafId = 0;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {AudioPlayer.Interfaces.AudioPlayerOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.AudioPlayerOptions = {})
        {
            super(opts as never);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;
            };

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = self.render();
            if (opts.src)
                el.setAttribute('src', opts.src);
            if (opts.autoplay)
                el.setAttribute('autoplay', '');
            if (opts.loop)
                el.setAttribute('loop', '');
            if (opts.label)
                el.setAttribute('label', opts.label);
            if (opts.src)
                this.src$.Set(opts.src);
            if (opts.label)
                this.label$.Set(opts.label);
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(): void
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;

                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;

                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): AudioPlayer.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): AudioPlayer.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {AudioPlayer.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {AudioPlayer.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {AudioPlayer.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            };

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = self.render();
            if (root.querySelector('.ap-wrap'))
                return;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'ap-wrap';
            // Label (optional)
            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = document.createElement('div');
            label.className = 'ap-label';

            /** @name        sLabel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sLabel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sLabel = self.signal().attribute('label');
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sLabel?.Get() ?? this.label$.Get();
                label.textContent = v ?? '';
                label.style.display = v ? '' : 'none';
            });
            // Hidden <audio> element (controls disabled — we drive it via TransportBar)
            /** @name        audio
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned audio value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const audio = document.createElement('audio') as HTMLAudioElement;
            audio.preload = 'metadata';
            audio.crossOrigin = 'anonymous';
            audio.style.display = 'none';
            this.#audio = audio;
            // TransportBar
            /** @name        transport
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned transport value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const transport = new TransportBar.TransportBar();
            this.#transport = transport;
            wrap.appendChild(label);
            wrap.appendChild(audio);

            /** @name        tEl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tEl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tEl = (transport as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;
            }).render();
            wrap.appendChild(tEl);
            root.appendChild(wrap);
            // Reactive src binding (attr OR signal)
            /** @name        sSrc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sSrc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sSrc = self.signal().attribute('src');
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sSrc?.Get() ?? this.src$.Get();
                if (v && v !== audio.src)
                {
                    this.loading$.Set(true);
                    audio.src = v;
                    audio.load();
                }
            });
            // Wire audio events → component events + transport state
            audio.addEventListener('loadedmetadata', () => {
                transport.setDuration(audio.duration || 0);
                this.loading$.Set(false);
                self.fire('arianna:audio-load', { detail: { duration: audio.duration, source: this }, bubbles: true });
                if (audio.hasAttribute('autoplay') || root.hasAttribute('autoplay'))
                {
                    void audio.play().catch(() => { });
                }
            });
            audio.addEventListener('play', () => {
                transport.setPlaying(true);
                self.fire('arianna:audio-play', { detail: { source: this }, bubbles: true });
                this.#startTimeUpdater();
            });
            audio.addEventListener('pause', () => {
                transport.setPlaying(false);
                self.fire('arianna:audio-pause', { detail: { source: this }, bubbles: true });
                this.#stopTimeUpdater();
            });
            audio.addEventListener('ended', () => {
                transport.setPlaying(false);
                transport.setCurrentTime(0);
                self.fire('arianna:audio-ended', { detail: { source: this }, bubbles: true });
                this.#stopTimeUpdater();
            });
            audio.addEventListener('error', () => {
                this.loading$.Set(false);
                self.fire('arianna:audio-error', { detail: { error: audio.error, source: this }, bubbles: true });
            });
            // Transport events → audio control
            /** @name        tEl2
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tEl2 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tEl2 = tEl;
            tEl2.addEventListener('arianna:transport-play', () => { void audio.play().catch(() => { }); });
            tEl2.addEventListener('arianna:transport-pause', () => audio.pause());
            tEl2.addEventListener('arianna:transport-stop', () => { audio.pause(); audio.currentTime = 0; });
            tEl2.addEventListener('arianna:transport-seek', (e: Event) => {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = (e as CustomEvent<{
                    /** @name        time
                     *  @public
                     *  @type        {number}
                     *  @description Component member for time.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    time: number;
                }>).detail.time;
                audio.currentTime = t;
            });
            tEl2.addEventListener('arianna:transport-volume', (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e as CustomEvent<{
                    /** @name        value
                     *  @public
                     *  @type        {number}
                     *  @description Component member for value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    value: number;
                }>).detail.value;
                if (this.#gain)
                    this.#gain.gain.value = v;
            });
            // Loop
            effect(() => {
                audio.loop = root.hasAttribute('loop');
            });
            self.Sheet = AudioPlayer.DefaultSheet();
        }

        /** @name        _buildAudioGraph
         *  @protected
         *  @type        {void}
         *  @description Component member for _build Audio Graph.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected _buildAudioGraph(): void
        {
            if (!this.#audio)
                return;
            this._audioCtx = this._audioCtx ?? AudioComponentModule.AudioComponent.context;
            this.#source = this._audioCtx.createMediaElementSource(this.#audio);
            this.#gain = this._audioCtx.createGain();
            this.#source.connect(this.#gain);
            this._input = this.#source;
            this._output = this.#gain;
        }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount()
        {
            super.onMount();
            // _buildAudioGraph already invoked by AudioComponent.onMount() default
        }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount()
        {
            this.#stopTimeUpdater();
            if (this.#audio)
            {
                try
                {
                    this.#audio.pause();
                }
                catch { /* ignore */ }
            }
            super.onUnmount();
        }

        /** @name        #startTimeUpdater
         *  @public
         *  @type        {void}
         *  @description Component member for start Time Updater.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #startTimeUpdater(): void
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };

            /** @name        tick
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tick value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tick = () => {
                if (!this.#audio || this.#audio.paused)
                {
                    this.#rafId = 0;
                    return;
                }

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.#audio.currentTime;

                /** @name        dur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dur = this.#audio.duration || 0;
                this.#transport?.setCurrentTime(cur);
                self.fire('arianna:audio-time', { detail: { current: cur, duration: dur, source: this }, bubbles: true });
                this.#rafId = requestAnimationFrame(tick);
            };
            this.#rafId = requestAnimationFrame(tick);
        }

        /** @name        #stopTimeUpdater
         *  @public
         *  @type        {void}
         *  @description Component member for stop Time Updater.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #stopTimeUpdater(): void
        {
            if (this.#rafId)
                cancelAnimationFrame(this.#rafId);
            this.#rafId = 0;
        }

        /** Public API: set source. */
        setSource(src: string): this
        {
            this.src$.Set(src);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;
            };
            self.render().setAttribute('src', src);
            return this;
        }

        /** Public API: control playback. */
        play(): Promise<void> { return this.#audio?.play() ?? Promise.resolve(); }

        /** @name        pause
         *  @public
         *  @type        {void}
         *  @description Component member for pause.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        pause(): void { this.#audio?.pause(); }

        /** @name        seek
         *  @public
         *  @type        {void}
         *  @description Component member for seek.
         *  @param       {number} t Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        seek(t: number): void
        {
            if (this.#audio)
                this.#audio.currentTime = t;
        }

        /** @name        duration
         *  @public
         *  @type        {number}
         *  @description Component member for duration.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get duration(): number { return this.#audio?.duration ?? 0; }

        /** @name        currentTime
         *  @public
         *  @type        {number}
         *  @description Component member for current Time.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get currentTime(): number { return this.#audio?.currentTime ?? 0; }

        /** @name        isPlaying
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Playing.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get isPlaying(): boolean { return this.#audio ? !this.#audio.paused : false; }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AudioPlayer.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AudioPlayer.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    display: 'inline-block',
                    padding: '8px',
                }),
                new Rule(':host .ap-wrap', {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                }),
                new Rule(':host .ap-label', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.8rem',
                    padding: '0 4px',
                }),
            ]);
        }
    }
}
export default AudioPlayer;
