/**
 * @module    components/audio/ChannelStrip
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ChannelStrip component module.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';

type AudioComponentOptions = AudioComponentModule.AudioComponentOptions;
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   ChannelStrip
 *  @public
 *  @description Namespace containing ChannelStrip contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ChannelStrip
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
        /** @interface   ChannelStripOptions
         *  @public
         *  @description ChannelStripOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChannelStripOptions extends AudioComponentOptions
        {
            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name?: string;

            /** @name        gain
             *  @public
             *  @type        {number}
             *  @description Component member for gain.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            gain?: number; // 0..1 (or higher for >0dB)
            /** @name        pan
             *  @public
             *  @type        {number}
             *  @description Component member for pan.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pan?: number; // -1..1
            /** @name        muted
             *  @public
             *  @type        {boolean}
             *  @description Component member for muted.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            muted?: boolean;

            /** @name        soloed
             *  @public
             *  @type        {boolean}
             *  @description Component member for soloed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            soloed?: boolean;

            /** @name        meter
             *  @public
             *  @type        {boolean}
             *  @description Component member for meter.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            meter?: boolean; // default true
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

    /** @class       ChannelStrip
     *  @public
     *  @description AriannA ChannelStrip component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class ChannelStrip extends AudioComponentModule.AudioComponent
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
        static readonly tag = 'arianna-channel-strip';

        /** @name        gain$
         *  @public
         *  @readonly
         *  @type        {ChannelStrip.Types.Signal<number>}
         *  @description Component member for gain$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly gain$: Types.Signal<number> = signal(1);

        /** @name        pan$
         *  @public
         *  @readonly
         *  @type        {ChannelStrip.Types.Signal<number>}
         *  @description Component member for pan$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly pan$: Types.Signal<number> = signal(0);

        /** @name        muted$
         *  @public
         *  @readonly
         *  @type        {ChannelStrip.Types.Signal<boolean>}
         *  @description Component member for muted$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly muted$: Types.Signal<boolean> = signal(false);

        /** @name        soloed$
         *  @public
         *  @readonly
         *  @type        {ChannelStrip.Types.Signal<boolean>}
         *  @description Component member for soloed$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly soloed$: Types.Signal<boolean> = signal(false);

        /** @name        #gain
         *  @public
         *  @type        {GainNode}
         *  @description Component member for gain.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #gain?: GainNode;

        /** @name        #pan
         *  @public
         *  @type        {StereoPannerNode}
         *  @description Component member for pan.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #pan?: StereoPannerNode;

        /** @name        #analyser
         *  @public
         *  @type        {AnalyserNode}
         *  @description Component member for analyser.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #analyser?: AnalyserNode;

        /** @name        #meterL
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for meter L.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #meterL?: HTMLDivElement;

        /** @name        #meterR
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for meter R.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #meterR?: HTMLDivElement;

        /** @name        #meterRaf
         *  @public
         *  @type        {unknown}
         *  @description Component member for meter Raf.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #meterRaf = 0;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {ChannelStrip.Interfaces.ChannelStripOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.ChannelStripOptions = {})
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
            if (opts.name)
                el.setAttribute('name', opts.name);
            if (opts.gain != null)
                el.setAttribute('gain', String(opts.gain));
            if (opts.pan != null)
                el.setAttribute('pan', String(opts.pan));
            if (opts.muted)
                el.setAttribute('muted', '');
            if (opts.soloed)
                el.setAttribute('soloed', '');
            if (opts.meter === false)
                el.setAttribute('meter', 'false');
            if (opts.gain != null)
                this.gain$.Set(opts.gain);
            if (opts.pan != null)
                this.pan$.Set(opts.pan);
            if (opts.muted)
                this.muted$.Set(true);
            if (opts.soloed)
                this.soloed$.Set(true);
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
                    attribute(name: string): ChannelStrip.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): ChannelStrip.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {ChannelStrip.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {ChannelStrip.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {ChannelStrip.Types.Stylesheet | null}
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
            if (root.querySelector('.cs-wrap'))
                return;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'cs-wrap';
            // Label
            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = document.createElement('div');
            label.className = 'cs-label';

            /** @name        sName
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sName value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sName = self.signal().attribute('name');
            effect(() => { label.textContent = sName?.Get() ?? 'Channel'; });
            // VU meter (stereo, vertical)
            /** @name        meter
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned meter value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const meter = document.createElement('div');
            meter.className = 'cs-meter';

            /** @name        meterL
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned meterL value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const meterL = document.createElement('div');
            meterL.className = 'cs-meter-bar cs-meter-l';

            /** @name        meterR
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned meterR value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const meterR = document.createElement('div');
            meterR.className = 'cs-meter-bar cs-meter-r';
            meter.appendChild(meterL);
            meter.appendChild(meterR);
            this.#meterL = meterL;
            this.#meterR = meterR;
            // Gain fader (vertical slider)
            /** @name        gainWrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned gainWrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const gainWrap = document.createElement('div');
            gainWrap.className = 'cs-fader-wrap';

            /** @name        gainLabel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned gainLabel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const gainLabel = document.createElement('span');
            gainLabel.className = 'cs-fader-label';
            gainLabel.textContent = 'GAIN';

            /** @name        gain
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned gain value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const gain = document.createElement('input') as HTMLInputElement;
            gain.type = 'range';
            gain.className = 'cs-gain';
            gain.min = '0';
            gain.max = '1500'; // up to +3.5dB (1.5x)
            gain.step = '1';
            gain.value = String(Math.round(this.gain$.Get() * 1000));

            /** @name        gainVal
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned gainVal value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const gainVal = document.createElement('span');
            gainVal.className = 'cs-fader-val';
            gainWrap.appendChild(gainLabel);
            gainWrap.appendChild(gain);
            gainWrap.appendChild(gainVal);
            // Pan knob
            /** @name        panWrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned panWrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const panWrap = document.createElement('div');
            panWrap.className = 'cs-pan-wrap';

            /** @name        panLabel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned panLabel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const panLabel = document.createElement('span');
            panLabel.className = 'cs-fader-label';
            panLabel.textContent = 'PAN';

            /** @name        pan
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pan value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pan = document.createElement('input') as HTMLInputElement;
            pan.type = 'range';
            pan.className = 'cs-pan';
            pan.min = '-1000';
            pan.max = '1000';
            pan.step = '1';
            pan.value = String(Math.round(this.pan$.Get() * 1000));

            /** @name        panVal
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned panVal value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const panVal = document.createElement('span');
            panVal.className = 'cs-fader-val';
            panWrap.appendChild(panLabel);
            panWrap.appendChild(pan);
            panWrap.appendChild(panVal);
            // Mute / Solo
            /** @name        btns
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btns value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btns = document.createElement('div');
            btns.className = 'cs-btns';

            /** @name        btnMute
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnMute value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnMute = document.createElement('button');
            btnMute.type = 'button';
            btnMute.className = 'cs-btn cs-mute';
            btnMute.textContent = 'M';
            btnMute.setAttribute('aria-label', 'mute');

            /** @name        btnSolo
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnSolo value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnSolo = document.createElement('button');
            btnSolo.type = 'button';
            btnSolo.className = 'cs-btn cs-solo';
            btnSolo.textContent = 'S';
            btnSolo.setAttribute('aria-label', 'solo');
            btns.appendChild(btnMute);
            btns.appendChild(btnSolo);
            wrap.appendChild(label);
            wrap.appendChild(meter);
            wrap.appendChild(gainWrap);
            wrap.appendChild(panWrap);
            wrap.appendChild(btns);
            root.appendChild(wrap);
            // Reactive bindings
            effect(() => {
                /** @name        g
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned g value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const g = this.gain$.Get();
                if (gain.value !== String(Math.round(g * 1000)))
                    gain.value = String(Math.round(g * 1000));
                gainVal.textContent = g === 0 ? '-∞' : (20 * Math.log10(g)).toFixed(1) + ' dB';
                if (this.#gain)
                    this.#gain.gain.value = this.muted$.Get() ? 0 : g;
            });
            effect(() => {
                /** @name        p
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned p value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const p = this.pan$.Get();
                if (pan.value !== String(Math.round(p * 1000)))
                    pan.value = String(Math.round(p * 1000));

                /** @name        lbl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lbl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lbl = p === 0 ? 'C' : (p < 0 ? `L${Math.round(-p * 100)}` : `R${Math.round(p * 100)}`);
                panVal.textContent = lbl;
                if (this.#pan)
                    this.#pan.pan.value = p;
            });
            effect(() => {
                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = this.muted$.Get();
                btnMute.classList.toggle('active', m);
                if (this.#gain)
                    this.#gain.gain.value = m ? 0 : this.gain$.Get();
            });
            effect(() => {
                btnSolo.classList.toggle('active', this.soloed$.Get());
            });
            // Event handlers
            gain.addEventListener('input', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseInt(gain.value, 10) / 1000;
                this.gain$.Set(v);
                self.fire('arianna:strip-gain', { detail: { value: v, source: this }, bubbles: true });
            });
            pan.addEventListener('input', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseInt(pan.value, 10) / 1000;
                this.pan$.Set(v);
                self.fire('arianna:strip-pan', { detail: { value: v, source: this }, bubbles: true });
            });
            btnMute.addEventListener('click', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = !this.muted$.Get();
                this.muted$.Set(v);
                self.fire('arianna:strip-mute', { detail: { value: v, source: this }, bubbles: true });
            });
            btnSolo.addEventListener('click', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = !this.soloed$.Get();
                this.soloed$.Set(v);
                self.fire('arianna:strip-solo', { detail: { value: v, source: this }, bubbles: true });
            });
            self.Sheet = ChannelStrip.DefaultSheet();
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
            this._audioCtx = this._audioCtx ?? AudioComponentModule.AudioComponent.context;

            /** @name        ctx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ctx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ctx = this._audioCtx;
            this.#gain = ctx.createGain();
            this.#pan = ctx.createStereoPanner();
            this.#analyser = ctx.createAnalyser();
            this.#analyser.fftSize = 256;
            this.#gain.gain.value = this.muted$.Get() ? 0 : this.gain$.Get();
            this.#pan.pan.value = this.pan$.Get();
            this.#gain.connect(this.#pan);
            this.#pan.connect(this.#analyser);
            this._input = this.#gain;
            this._output = this.#analyser;
            this.#startMeter();
        }

        /** @name        #startMeter
         *  @public
         *  @type        {void}
         *  @description Component member for start Meter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #startMeter(): void
        {
            if (!this.#analyser || !this.#meterL || !this.#meterR)
                return;

            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = new Float32Array(this.#analyser.fftSize);

            /** @name        tick
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tick value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tick = () => {
                if (!this.#analyser || !this.#meterL || !this.#meterR)
                {
                    this.#meterRaf = 0;
                    return;
                }
                this.#analyser.getFloatTimeDomainData(buf);
                // Compute peak (simplified mono — true stereo metering would split L/R)
                /** @name        peak
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned peak value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let peak = 0;
                for (let i = 0; i < buf.length; i++)
                {
                    /** @name        v
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned v value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const v = Math.abs(buf[i] ?? 0);
                    if (v > peak)
                        peak = v;
                }
                // Map [0..1] linear → 0..100% with a soft log curve
                /** @name        pct
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pct value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pct = Math.min(100, peak * 140);
                this.#meterL.style.height = pct + '%';
                this.#meterR.style.height = pct + '%';
                this.#meterRaf = requestAnimationFrame(tick);
            };
            this.#meterRaf = requestAnimationFrame(tick);
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
            if (this.#meterRaf)
                cancelAnimationFrame(this.#meterRaf);
            this.#meterRaf = 0;
            super.onUnmount();
        }

        /** Public API */
        setGain(v: number): this { this.gain$.Set(Math.max(0, v)); return this; }

        /** @name        setPan
         *  @public
         *  @type        {this}
         *  @description Component member for set Pan.
         *  @param       {number} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setPan(v: number): this { this.pan$.Set(Math.max(-1, Math.min(1, v))); return this; }

        /** @name        setMuted
         *  @public
         *  @type        {this}
         *  @description Component member for set Muted.
         *  @param       {boolean} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMuted(v: boolean): this { this.muted$.Set(v); return this; }

        /** @name        setSoloed
         *  @public
         *  @type        {this}
         *  @description Component member for set Soloed.
         *  @param       {boolean} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setSoloed(v: boolean): this { this.soloed$.Set(v); return this; }

        /** @name        gain
         *  @public
         *  @type        {number}
         *  @description Component member for gain.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get gain(): number { return this.gain$.Get(); }

        /** @name        pan
         *  @public
         *  @type        {number}
         *  @description Component member for pan.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get pan(): number { return this.pan$.Get(); }

        /** @name        muted
         *  @public
         *  @type        {boolean}
         *  @description Component member for muted.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get muted(): boolean { return this.muted$.Get(); }

        /** @name        soloed
         *  @public
         *  @type        {boolean}
         *  @description Component member for soloed.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get soloed(): boolean { return this.soloed$.Get(); }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ChannelStrip.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ChannelStrip.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg2, #161616)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    display: 'inline-block',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                    padding: '10px',
                    width: '120px',
                }),
                new Rule(':host .cs-wrap', {
                    alignItems: 'stretch',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    height: '320px',
                }),
                new Rule(':host .cs-label', {
                    fontWeight: '600',
                    overflow: 'hidden',
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host .cs-meter', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    display: 'flex',
                    gap: '2px',
                    height: '60px',
                    padding: '2px',
                }),
                new Rule(':host .cs-meter-bar', {
                    alignSelf: 'flex-end',
                    background: 'linear-gradient(to top, #4caf50 0%, #ffeb3b 70%, #f44336 100%)',
                    flex: '1',
                    height: '0%',
                    transition: 'height 0.06s linear',
                }),
                new Rule(':host .cs-fader-wrap, :host .cs-pan-wrap', {
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }),
                new Rule(':host .cs-fader-label', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                }),
                new Rule(':host .cs-gain, :host .cs-pan', {
                    accentColor: 'var(--ar-primary, #7eb8f7)',
                    width: '100%',
                }),
                new Rule(':host .cs-fader-val', {
                    color: 'var(--ar-text, #e0e0e0)',
                    fontSize: '0.7rem',
                    fontVariantNumeric: 'tabular-nums',
                }),
                new Rule(':host .cs-btns', {
                    display: 'flex',
                    gap: '4px',
                    justifyContent: 'center',
                }),
                new Rule(':host .cs-btn', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    transition: 'all var(--ar-transition, 0.14s)',
                }),
                new Rule(':host .cs-mute.active', {
                    background: 'var(--ar-danger, #f44336)',
                    color: '#fff',
                }),
                new Rule(':host .cs-solo.active', {
                    background: 'var(--ar-warning, #ff9800)',
                    color: '#fff',
                }),
            ]);
        }
    }
}
export default ChannelStrip;
