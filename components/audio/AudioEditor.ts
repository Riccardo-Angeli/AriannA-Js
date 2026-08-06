/**
 * @module    components/audio/AudioEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AudioEditor component module.
 */

import { Css, Reactivity } from '../../core/index.ts';
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';

type AudioComponentOptions = AudioComponentModule.AudioComponentOptions;
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   AudioEditor
 *  @public
 *  @description Namespace containing AudioEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AudioEditor
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
        /** @interface   AudioEditorOptions
         *  @public
         *  @description AudioEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AudioEditorOptions extends AudioComponentOptions
        {
            /** @name        src
             *  @public
             *  @type        {string}
             *  @description Component member for src.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            src?: string;

            /** @name        width
             *  @public
             *  @type        {number}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: number;

            /** @name        height
             *  @public
             *  @type        {number}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: number;

            /** Waveform foreground colour (default uses CSS var). */
            waveColor?: string;

            /** @name        selectionColor
             *  @public
             *  @type        {string}
             *  @description Component member for selection Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selectionColor?: string;
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

    /** @class       AudioEditor
     *  @public
     *  @description AriannA AudioEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class AudioEditor extends AudioComponentModule.AudioComponent
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
        static readonly tag = 'arianna-audio-editor';

        /** @name        buffer$
         *  @public
         *  @readonly
         *  @type        {AudioEditor.Types.Signal<AudioBuffer | null>}
         *  @description Component member for buffer$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly buffer$: Types.Signal<AudioBuffer | null> = signal<AudioBuffer | null>(null);

        /** @name        selection$
         *  @public
         *  @readonly
         *  @type        {AudioEditor.Types.Signal<{
            start: number;
            end: number;
        } | null>}
         *  @description Component member for selection$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly selection$: Types.Signal<{
            /** @name        start
             *  @public
             *  @type        {number}
             *  @description Component member for start.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            start: number;

            /** @name        end
             *  @public
             *  @type        {number}
             *  @description Component member for end.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            end: number;
        } | null> = signal<{
            /** @name        start
             *  @public
             *  @type        {number}
             *  @description Component member for start.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            start: number;

            /** @name        end
             *  @public
             *  @type        {number}
             *  @description Component member for end.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            end: number;
        } | null>(null);

        /** @name        samplesPerPx$
         *  @public
         *  @readonly
         *  @type        {AudioEditor.Types.Signal<number>}
         *  @description Component member for samples Per Px$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly samplesPerPx$: Types.Signal<number> = signal(256);

        /** @name        playing$
         *  @public
         *  @readonly
         *  @type        {AudioEditor.Types.Signal<boolean>}
         *  @description Component member for playing$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly playing$: Types.Signal<boolean> = signal(false);

        /** @name        #canvas
         *  @public
         *  @type        {HTMLCanvasElement}
         *  @description Component member for canvas.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #canvas?: HTMLCanvasElement;

        /** @name        #ctx
         *  @public
         *  @type        {CanvasRenderingContext2D}
         *  @description Component member for ctx.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #ctx?: CanvasRenderingContext2D;

        /** @name        #scrollX
         *  @public
         *  @type        {unknown}
         *  @description Component member for scroll X.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #scrollX = 0;

        /** @name        #gainOut
         *  @public
         *  @type        {GainNode}
         *  @description Component member for gain Out.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #gainOut?: GainNode;

        /** @name        #playSrc
         *  @public
         *  @type        {AudioBufferSourceNode}
         *  @description Component member for play Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #playSrc?: AudioBufferSourceNode;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {AudioEditor.Interfaces.AudioEditorOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.AudioEditorOptions = {})
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
            if (opts.width != null)
                el.setAttribute('width', String(opts.width));
            if (opts.height != null)
                el.setAttribute('height', String(opts.height));
            if (opts.waveColor)
                el.setAttribute('wave-color', opts.waveColor);
            if (opts.selectionColor)
                el.setAttribute('selection-color', opts.selectionColor);
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
                    attribute(name: string): AudioEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): AudioEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {AudioEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {AudioEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {AudioEditor.Types.Stylesheet | null}
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
            if (root.querySelector('.ae-wrap'))
                return;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'ae-wrap';
            // Toolbar
            /** @name        tb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tb = document.createElement('div');
            tb.className = 'ae-toolbar';

            /** @name        mkBtn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mkBtn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mkBtn = (label: string, cls: string) => {
                /** @name        b
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned b value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'ae-btn ' + cls;
                b.textContent = label;
                return b;
            };

            /** @name        btnPlay
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnPlay value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnPlay = mkBtn('▶', 'ae-play');

            /** @name        btnStop
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnStop value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnStop = mkBtn('■', 'ae-stop');

            /** @name        btnZIn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnZIn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnZIn = mkBtn('+', 'ae-zoom-in');

            /** @name        btnZOut
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnZOut value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnZOut = mkBtn('−', 'ae-zoom-out');

            /** @name        btnFadeI
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnFadeI value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnFadeI = mkBtn('Fade ▶', 'ae-fade-in');

            /** @name        btnFadeO
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnFadeO value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnFadeO = mkBtn('◀ Fade', 'ae-fade-out');

            /** @name        btnCrop
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnCrop value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnCrop = mkBtn('Crop', 'ae-crop');
            tb.append(btnPlay, btnStop, btnZIn, btnZOut, btnFadeI, btnFadeO, btnCrop);
            // Canvas
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = document.createElement('canvas');
            canvas.className = 'ae-canvas';

            /** @name        sW
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sW value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sW = self.signal().attribute('width');

            /** @name        sH
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sH value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sH = self.signal().attribute('height');

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = parseInt(sW?.Peek() ?? '800', 10) || 800;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = parseInt(sH?.Peek() ?? '160', 10) || 160;
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            this.#canvas = canvas;
            this.#ctx = canvas.getContext('2d') ?? undefined;
            // Status line
            /** @name        status
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned status value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const status = document.createElement('div');
            status.className = 'ae-status';
            wrap.append(tb, canvas, status);
            root.appendChild(wrap);
            effect(() => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selection$.Get();

                /** @name        buf
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned buf value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const buf = this.buffer$.Get();
                if (!buf)
                {
                    status.textContent = 'No audio loaded';
                    return;
                }

                /** @name        dur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dur = buf.duration;
                if (sel)
                {
                    /** @name        len
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned len value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const len = sel.end - sel.start;
                    status.textContent = `Selection: ${sel.start.toFixed(2)}s – ${sel.end.toFixed(2)}s (${len.toFixed(2)}s) · Total ${dur.toFixed(2)}s`;
                }
                else
                {
                    status.textContent = `Loaded: ${dur.toFixed(2)}s · ${buf.numberOfChannels}ch @ ${buf.sampleRate}Hz`;
                }
                this.#redraw();
            });
            effect(() => { this.samplesPerPx$.Get(); this.#redraw(); });
            // Source attribute reactive
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
                const v = sSrc?.Get();
                if (v)
                    void this.setSource(v);
            });
            // Mouse interaction — selection
            /** @name        dragStart
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dragStart value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let dragStart = -1;
            canvas.addEventListener('pointerdown', (e: PointerEvent) => {
                if (!this.buffer$.Get())
                    return;
                canvas.setPointerCapture(e.pointerId);

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = canvas.getBoundingClientRect();
                dragStart = this.#pxToTime(e.clientX - r.left);
                this.selection$.Set({ start: dragStart, end: dragStart });
            });
            canvas.addEventListener('pointermove', (e: PointerEvent) => {
                if (dragStart < 0)
                    return;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = canvas.getBoundingClientRect();

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = this.#pxToTime(e.clientX - r.left);

                /** @name        start
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned start value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const start = Math.min(dragStart, t);

                /** @name        end
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned end value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const end = Math.max(dragStart, t);
                this.selection$.Set({ start, end });
            });
            canvas.addEventListener('pointerup', (e: PointerEvent) => {
                canvas.releasePointerCapture(e.pointerId);
                if (dragStart < 0)
                    return;

                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selection$.Peek();
                dragStart = -1;
                if (sel && sel.end - sel.start < 0.001)
                {
                    this.selection$.Set(null);
                }
                else if (sel)
                {
                    self.fire('arianna:editor-selection', { detail: { ...sel, source: this }, bubbles: true });
                }
            });
            // Wheel zoom (mouse-anchored)
            canvas.addEventListener('wheel', (e: WheelEvent) => {
                e.preventDefault();

                /** @name        buf
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned buf value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const buf = this.buffer$.Peek();
                if (!buf)
                    return;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = canvas.getBoundingClientRect();

                /** @name        mx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mx = e.clientX - r.left;

                /** @name        tAnchor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tAnchor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tAnchor = this.#pxToTime(mx);

                /** @name        spp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned spp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const spp = this.samplesPerPx$.Peek();

                /** @name        factor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned factor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const factor = e.deltaY > 0 ? 1.25 : 0.8;

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = Math.max(1, Math.min(buf.sampleRate * buf.duration / canvas.width, spp * factor));
                this.samplesPerPx$.Set(next);

                /** @name        newPx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned newPx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const newPx = (tAnchor * buf.sampleRate) / next;
                this.#scrollX = Math.max(0, newPx - mx);
                self.fire('arianna:editor-zoom', { detail: { samplesPerPx: next, source: this }, bubbles: true });
                this.#redraw();
            }, { passive: false });
            // Toolbar handlers
            btnPlay.addEventListener('click', () => void this.playSelection());
            btnStop.addEventListener('click', () => this.stop());
            btnZIn.addEventListener('click', () => this.samplesPerPx$.Set(Math.max(1, this.samplesPerPx$.Peek() * 0.7)));
            btnZOut.addEventListener('click', () => this.samplesPerPx$.Set(this.samplesPerPx$.Peek() * 1.4));
            btnFadeI.addEventListener('click', () => this.fade('in'));
            btnFadeO.addEventListener('click', () => this.fade('out'));
            btnCrop.addEventListener('click', () => this.cropSelection());
            self.Sheet = AudioEditor.DefaultSheet();
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
            this.#gainOut = this._audioCtx.createGain();
            this._input = this.#gainOut;
            this._output = this.#gainOut;
        }
        // ── Public API ────────────────────────────────────────────────────────
        /** @name        setSource
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for set Source.
         *  @param       {string} url Parameter.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async setSource(url: string): Promise<void>
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

            /** @name        res
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned res value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const res = await fetch(url);

            /** @name        ab
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ab value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ab = await res.arrayBuffer();
            if (!this._audioCtx)
                this._audioCtx = AudioComponentModule.AudioComponent.context;

            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = await this._audioCtx.decodeAudioData(ab);
            this.setBuffer(buf);
            self.fire('arianna:editor-load', { detail: { duration: buf.duration, source: this }, bubbles: true });
        }

        /** @name        setBuffer
         *  @public
         *  @type        {void}
         *  @description Component member for set Buffer.
         *  @param       {AudioBuffer} buf Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setBuffer(buf: AudioBuffer): void
        {
            this.buffer$.Set(buf);
            this.selection$.Set(null);
            // Fit to width
            if (this.#canvas)
            {
                /** @name        spp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned spp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const spp = Math.max(1, Math.floor(buf.length / this.#canvas.width));
                this.samplesPerPx$.Set(spp);
                this.#scrollX = 0;
            }
        }

        /** @name        getBuffer
         *  @public
         *  @type        {AudioBuffer | null}
         *  @description Component member for get Buffer.
         *  @returns     {AudioBuffer | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getBuffer(): AudioBuffer | null { return this.buffer$.Get(); }

        /** @name        playSelection
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for play Selection.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async playSelection(): Promise<void>
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

            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = this.buffer$.Peek();
            if (!buf || !this._audioCtx)
                return;
            await AudioComponentModule.AudioComponent.resume();
            this.stop();

            /** @name        src
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned src value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const src = this._audioCtx.createBufferSource();
            src.buffer = buf;
            if (this.#gainOut)
                src.connect(this.#gainOut);

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = this.selection$.Peek();

            /** @name        start
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned start value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const start = sel ? sel.start : 0;

            /** @name        dur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dur = sel ? Math.max(0.001, sel.end - sel.start) : buf.duration;
            src.start(0, start, dur);
            src.onended = () => {
                this.playing$.Set(false);
                self.fire('arianna:editor-stop', { detail: { source: this }, bubbles: true });
            };
            this.#playSrc = src;
            this.playing$.Set(true);
            self.fire('arianna:editor-play', { detail: { source: this }, bubbles: true });
        }

        /** @name        stop
         *  @public
         *  @type        {void}
         *  @description Component member for stop.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        stop(): void
        {
            if (this.#playSrc)
            {
                try
                {
                    this.#playSrc.stop();
                }
                catch { /* already stopped */ }
                this.#playSrc = undefined;
            }
            this.playing$.Set(false);
        }

        /** @name        cropSelection
         *  @public
         *  @type        {void}
         *  @description Component member for crop Selection.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        cropSelection(): void
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

            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = this.buffer$.Peek();

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = this.selection$.Peek();
            if (!buf || !sel || !this._audioCtx)
                return;

            /** @name        ctx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ctx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ctx = this._audioCtx;

            /** @name        sr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sr = buf.sampleRate;

            /** @name        s0
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s0 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s0 = Math.floor(sel.start * sr);

            /** @name        s1
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s1 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s1 = Math.floor(sel.end * sr);

            /** @name        len
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned len value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const len = Math.max(1, s1 - s0);

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = ctx.createBuffer(buf.numberOfChannels, len, sr);
            for (let ch = 0; ch < buf.numberOfChannels; ch++)
            {
                /** @name        src
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned src value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const src = buf.getChannelData(ch);

                /** @name        dst
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dst value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dst = next.getChannelData(ch);
                for (let i = 0; i < len; i++)
                    dst[i] = src[s0 + i] ?? 0;
            }
            this.setBuffer(next);
            self.fire('arianna:editor-crop', { detail: { ...sel, source: this }, bubbles: true });
        }

        /** @name        fade
         *  @public
         *  @type        {void}
         *  @description Component member for fade.
         *  @param       {'in' | 'out'} kind Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        fade(kind: 'in' | 'out'): void
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

            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = this.buffer$.Peek();

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = this.selection$.Peek();
            if (!buf || !sel)
                return;

            /** @name        sr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sr = buf.sampleRate;

            /** @name        s0
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s0 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s0 = Math.floor(sel.start * sr);

            /** @name        s1
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s1 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s1 = Math.floor(sel.end * sr);

            /** @name        len
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned len value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const len = Math.max(1, s1 - s0);
            for (let ch = 0; ch < buf.numberOfChannels; ch++)
            {
                /** @name        data
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned data value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const data = buf.getChannelData(ch);
                for (let i = 0; i < len; i++)
                {
                    /** @name        t
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned t value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const t = i / len;

                    /** @name        g
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned g value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const g = kind === 'in' ? t : 1 - t;
                    data[s0 + i] = (data[s0 + i] ?? 0) * g;
                }
            }
            this.buffer$.Set(buf); // re-trigger render
            self.fire('arianna:editor-fade', { detail: { kind, ...sel, source: this }, bubbles: true });
        }
        // ── Render ────────────────────────────────────────────────────────────
        /** @name        #pxToTime
         *  @public
         *  @type        {number}
         *  @description Component member for px To Time.
         *  @param       {number} px Parameter.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #pxToTime(px: number): number
        {
            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = this.buffer$.Peek();
            if (!buf)
                return 0;

            /** @name        sample
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sample value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sample = (px + this.#scrollX) * this.samplesPerPx$.Peek();
            return sample / buf.sampleRate;
        }

        /** @name        #timeToPx
         *  @public
         *  @type        {number}
         *  @description Component member for time To Px.
         *  @param       {number} t Parameter.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #timeToPx(t: number): number
        {
            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = this.buffer$.Peek();
            if (!buf)
                return 0;

            /** @name        sample
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sample value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sample = t * buf.sampleRate;
            return sample / this.samplesPerPx$.Peek() - this.#scrollX;
        }

        /** @name        #redraw
         *  @public
         *  @type        {void}
         *  @description Component member for redraw.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #redraw(): void
        {
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = this.#canvas;

            /** @name        ctx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ctx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ctx = this.#ctx;
            if (!canvas || !ctx)
                return;

            /** @name        W
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned W value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const W = canvas.width, H = canvas.height;

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = (this as unknown as {
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

            /** @name        waveColor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned waveColor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const waveColor = root.getAttribute('wave-color') ?? 'var(--ar-primary, #7eb8f7)';

            /** @name        selColor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned selColor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const selColor = root.getAttribute('selection-color') ?? 'rgba(126,184,247,0.18)';
            // Background
            ctx.fillStyle = getComputedStyle(root).getPropertyValue('--ar-bg').trim() || '#0d0d0d';
            ctx.fillRect(0, 0, W, H);
            // Centerline
            ctx.strokeStyle = 'rgba(255,255,255,0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, H / 2);
            ctx.lineTo(W, H / 2);
            ctx.stroke();

            /** @name        buf
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned buf value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const buf = this.buffer$.Peek();
            if (!buf)
                return;

            /** @name        data
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned data value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const data = buf.getChannelData(0);

            /** @name        spp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned spp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const spp = this.samplesPerPx$.Peek();

            /** @name        midY
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned midY value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const midY = H / 2;
            // Min/max peaks per pixel column
            ctx.fillStyle = waveColor.startsWith('var(') ? (getComputedStyle(root).getPropertyValue('--ar-primary').trim() || '#7eb8f7') : waveColor;
            for (let x = 0; x < W; x++)
            {
                /** @name        s0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s0 = Math.floor((x + this.#scrollX) * spp);

                /** @name        s1
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s1 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s1 = Math.min(data.length, s0 + Math.ceil(spp));
                if (s0 >= data.length)
                    break;

                /** @name        min
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned min value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let min = 0, max = 0;
                for (let i = s0; i < s1; i++)
                {
                    /** @name        v
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned v value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const v = data[i] ?? 0;
                    if (v < min)
                        min = v;
                    if (v > max)
                        max = v;
                }

                /** @name        y0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y0 = midY - max * (midY - 2);

                /** @name        y1
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y1 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y1 = midY - min * (midY - 2);
                ctx.fillRect(x, y0, 1, Math.max(1, y1 - y0));
            }
            // Selection
            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = this.selection$.Peek();
            if (sel)
            {
                /** @name        x0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x0 = this.#timeToPx(sel.start);

                /** @name        x1
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x1 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x1 = this.#timeToPx(sel.end);
                ctx.fillStyle = selColor;
                ctx.fillRect(x0, 0, x1 - x0, H);
                ctx.strokeStyle = waveColor.startsWith('var(') ? (getComputedStyle(root).getPropertyValue('--ar-primary').trim() || '#7eb8f7') : waveColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x0, 0);
                ctx.lineTo(x0, H);
                ctx.moveTo(x1, 0);
                ctx.lineTo(x1, H);
                ctx.stroke();
            }
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AudioEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AudioEditor.Types.Stylesheet} Result.
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
                    font: 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                    padding: '8px',
                }),
                new Rule(':host .ae-wrap', {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                }),
                new Rule(':host .ae-toolbar', {
                    display: 'flex',
                    gap: '4px',
                }),
                new Rule(':host .ae-btn', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    transition: 'all var(--ar-transition, 0.14s)',
                }),
                new Rule(':host .ae-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
                new Rule(':host .ae-canvas', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    cursor: 'crosshair',
                    display: 'block',
                }),
                new Rule(':host .ae-status', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.72rem',
                }),
            ]);
        }
    }
}
export default AudioEditor;
