/**
 * @module    components/audio/TransportBar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA TransportBar component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   TransportBar
 *  @public
 *  @description Namespace containing TransportBar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace TransportBar
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
        /** @interface   TransportBarOptions
         *  @public
         *  @description TransportBarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TransportBarOptions
        {
            /** @name        duration
             *  @public
             *  @type        {number}
             *  @description Component member for duration.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            duration?: number; // seconds
            /** @name        current
             *  @public
             *  @type        {number}
             *  @description Component member for current.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            current?: number; // seconds
            /** @name        playing
             *  @public
             *  @type        {boolean}
             *  @description Component member for playing.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            playing?: boolean;

            /** @name        volume
             *  @public
             *  @type        {number}
             *  @description Component member for volume.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            volume?: number; // 0..1
            /** @name        showVolume
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Volume.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showVolume?: boolean; // default true
            /** @name        showStop
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Stop.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showStop?: boolean; // default true
            /** @name        showSkip
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Skip.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showSkip?: boolean; // default false (rew/ffwd buttons)
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
    export function fmtTime(s: number): string {
        if (!isFinite(s) || s < 0)
            s = 0;

        /** @name        m
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned m value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const m = Math.floor(s / 60);

        /** @name        sec
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned sec value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    /** @name        FmtTime
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned FmtTime value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function FmtTime(s: number): string
    {
        return fmtTime(s);
    }

    /** @class       TransportBar
     *  @public
     *  @description AriannA TransportBar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-transport-bar', {}, {
        Attributes: ['duration', 'current', 'playing', 'volume', 'show-volume', 'show-stop', 'show-skip'],
    })
    export class TransportBar extends HTMLElement
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        playing$
         *  @public
         *  @readonly
         *  @type        {TransportBar.Types.Signal<boolean>}
         *  @description Component member for playing$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly playing$: Types.Signal<boolean> = signal(false);

        /** @name        current$
         *  @public
         *  @readonly
         *  @type        {TransportBar.Types.Signal<number>}
         *  @description Component member for current$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly current$: Types.Signal<number> = signal(0);

        /** @name        duration$
         *  @public
         *  @readonly
         *  @type        {TransportBar.Types.Signal<number>}
         *  @description Component member for duration$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly duration$: Types.Signal<number> = signal(0);

        /** @name        volume$
         *  @public
         *  @readonly
         *  @type        {TransportBar.Types.Signal<number>}
         *  @description Component member for volume$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly volume$: Types.Signal<number> = signal(1);

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {TransportBar.Interfaces.TransportBarOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.TransportBarOptions = {})
        {
            super();

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
            if (opts.duration != null)
                el.setAttribute('duration', String(opts.duration));
            if (opts.current != null)
                el.setAttribute('current', String(opts.current));
            if (opts.playing)
                el.setAttribute('playing', '');
            if (opts.volume != null)
                el.setAttribute('volume', String(opts.volume));
            if (opts.showVolume === false)
                el.setAttribute('show-volume', 'false');
            if (opts.showStop === false)
                el.setAttribute('show-stop', 'false');
            if (opts.showSkip)
                el.setAttribute('show-skip', '');
            if (opts.duration != null)
                this.duration$.Set(opts.duration);
            if (opts.current != null)
                this.current$.Set(opts.current);
            if (opts.playing)
                this.playing$.Set(true);
            if (opts.volume != null)
                this.volume$.Set(opts.volume);
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
                    attribute(name: string): TransportBar.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): TransportBar.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {TransportBar.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {TransportBar.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {TransportBar.Types.Stylesheet | null}
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
            if (root.children.length)
                return; // already built (markup-driven)
            // Build buttons
            /** @name        btnSkipBack
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnSkipBack value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnSkipBack = document.createElement('button');
            btnSkipBack.className = 'tb-btn tb-skip-back';
            btnSkipBack.type = 'button';
            btnSkipBack.setAttribute('aria-label', 'rewind 10s');
            btnSkipBack.textContent = '◀◀';

            /** @name        btnPlay
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnPlay value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnPlay = document.createElement('button');
            btnPlay.className = 'tb-btn tb-play';
            btnPlay.type = 'button';
            btnPlay.setAttribute('aria-label', 'play / pause');

            /** @name        btnStop
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnStop value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnStop = document.createElement('button');
            btnStop.className = 'tb-btn tb-stop';
            btnStop.type = 'button';
            btnStop.setAttribute('aria-label', 'stop');
            btnStop.textContent = '■';

            /** @name        btnSkipFwd
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnSkipFwd value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnSkipFwd = document.createElement('button');
            btnSkipFwd.className = 'tb-btn tb-skip-fwd';
            btnSkipFwd.type = 'button';
            btnSkipFwd.setAttribute('aria-label', 'forward 10s');
            btnSkipFwd.textContent = '▶▶';
            // Seek slider
            /** @name        seek
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned seek value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const seek = document.createElement('input') as HTMLInputElement;
            seek.type = 'range';
            seek.className = 'tb-seek';
            seek.min = '0';
            seek.max = '1000';
            seek.step = '1';
            seek.value = '0';
            // Time display
            /** @name        time
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned time value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const time = document.createElement('span');
            time.className = 'tb-time';
            // Volume slider
            /** @name        vol
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned vol value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const vol = document.createElement('input') as HTMLInputElement;
            vol.type = 'range';
            vol.className = 'tb-volume';
            vol.min = '0';
            vol.max = '1000';
            vol.step = '1';
            vol.value = '1000';
            // Visibility controls
            /** @name        sShowVol
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sShowVol value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sShowVol = self.signal().attribute('show-volume');

            /** @name        sShowStop
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sShowStop value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sShowStop = self.signal().attribute('show-stop');

            /** @name        sShowSkip
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sShowSkip value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sShowSkip = self.signal().attribute('show-skip');
            effect(() => {
                btnSkipBack.style.display = (sShowSkip?.Get() != null) ? '' : 'none';
                btnSkipFwd.style.display = (sShowSkip?.Get() != null) ? '' : 'none';
            });
            effect(() => {
                btnStop.style.display = (sShowStop?.Get() === 'false') ? 'none' : '';
            });
            effect(() => {
                vol.style.display = (sShowVol?.Get() === 'false') ? 'none' : '';
            });
            // Reactive bindings
            effect(() => {
                btnPlay.textContent = this.playing$.Get() ? '❚❚' : '▶';
            });
            effect(() => {
                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.current$.Get();

                /** @name        dur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dur = this.duration$.Get();
                time.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
                if (dur > 0 && !seek.matches(':active') && document.activeElement !== seek)
                {
                    seek.value = String(Math.round((cur / dur) * 1000));
                }
            });
            effect(() => {
                vol.value = String(Math.round(this.volume$.Get() * 1000));
            });
            // Event wiring
            btnPlay.addEventListener('click', () => {
                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = !this.playing$.Get();
                this.playing$.Set(next);
                self.fire(next ? 'arianna:transport-play' : 'arianna:transport-pause', { detail: { source: this }, bubbles: true });
            });
            btnStop.addEventListener('click', () => {
                this.playing$.Set(false);
                this.current$.Set(0);
                self.fire('arianna:transport-stop', { detail: { source: this }, bubbles: true });
            });
            btnSkipBack.addEventListener('click', () => {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = Math.max(0, this.current$.Get() - 10);
                this.current$.Set(t);
                self.fire('arianna:transport-seek', { detail: { time: t, source: this }, bubbles: true });
            });
            btnSkipFwd.addEventListener('click', () => {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = Math.min(this.duration$.Get(), this.current$.Get() + 10);
                this.current$.Set(t);
                self.fire('arianna:transport-seek', { detail: { time: t, source: this }, bubbles: true });
            });
            seek.addEventListener('input', () => {
                /** @name        dur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dur = this.duration$.Get();

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = (parseInt(seek.value, 10) / 1000) * dur;
                this.current$.Set(t);
                self.fire('arianna:transport-seek', { detail: { time: t, source: this }, bubbles: true });
            });
            vol.addEventListener('input', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseInt(vol.value, 10) / 1000;
                this.volume$.Set(v);
                self.fire('arianna:transport-volume', { detail: { value: v, source: this }, bubbles: true });
            });
            root.appendChild(btnSkipBack);
            root.appendChild(btnPlay);
            root.appendChild(btnStop);
            root.appendChild(btnSkipFwd);
            root.appendChild(seek);
            root.appendChild(time);
            root.appendChild(vol);
            self.Sheet = TransportBar.DefaultSheet();
        }

        /** Push external state in from the audio source. */
        setCurrentTime(s: number): this { this.current$.Set(s); return this; }

        /** @name        setDuration
         *  @public
         *  @type        {this}
         *  @description Component member for set Duration.
         *  @param       {number} s Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setDuration(s: number): this { this.duration$.Set(s); return this; }

        /** @name        setPlaying
         *  @public
         *  @type        {this}
         *  @description Component member for set Playing.
         *  @param       {boolean} p Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setPlaying(p: boolean): this { this.playing$.Set(p); return this; }

        /** @name        setVolume
         *  @public
         *  @type        {this}
         *  @description Component member for set Volume.
         *  @param       {number} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setVolume(v: number): this { this.volume$.Set(Math.max(0, Math.min(1, v))); return this; }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {TransportBar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {TransportBar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #161616)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    display: 'inline-flex',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                    gap: '6px',
                    padding: '6px 10px',
                }),
                new Rule(':host .tb-btn', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'inherit',
                    cursor: 'pointer',
                    font: 'inherit',
                    minWidth: '32px',
                    padding: '4px 8px',
                    transition: 'background var(--ar-transition, 0.14s)',
                }),
                new Rule(':host .tb-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
                new Rule(':host .tb-play', { minWidth: '40px' }),
                new Rule(':host .tb-seek', { flex: '1 1 160px', minWidth: '120px', accentColor: 'var(--ar-primary, #7eb8f7)' }),
                new Rule(':host .tb-volume', { width: '90px', accentColor: 'var(--ar-primary, #7eb8f7)' }),
                new Rule(':host .tb-time', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.78rem',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '90px',
                    textAlign: 'center',
                }),
            ]);
        }
    }
}
export default TransportBar;
