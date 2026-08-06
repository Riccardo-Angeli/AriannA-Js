/**
 * @module    components/audio/PianoRoll
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA PianoRoll component module.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   PianoRoll
 *  @public
 *  @description Namespace containing PianoRoll contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace PianoRoll
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
        /** @interface   PianoNote
         *  @public
         *  @description PianoNote contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PianoNote
        {
            /** @name        pitch
             *  @public
             *  @type        {number}
             *  @description Component member for pitch.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pitch: number; // MIDI 0..127 (60 = C4)
            /** @name        start
             *  @public
             *  @type        {number}
             *  @description Component member for start.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            start: number; // beats
            /** @name        length
             *  @public
             *  @type        {number}
             *  @description Component member for length.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            length: number; // beats
            /** @name        velocity
             *  @public
             *  @type        {number}
             *  @description Component member for velocity.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            velocity: number; // 0..1
        }

        /** @interface   PianoRollOptions
         *  @public
         *  @description PianoRollOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PianoRollOptions
        {
            /** @name        beats
             *  @public
             *  @type        {number}
             *  @description Component member for beats.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            beats?: number; // total beat count
            /** @name        pitchMin
             *  @public
             *  @type        {number}
             *  @description Component member for pitch Min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pitchMin?: number; // lowest pitch shown (inclusive)
            /** @name        pitchMax
             *  @public
             *  @type        {number}
             *  @description Component member for pitch Max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pitchMax?: number; // highest pitch shown (inclusive)
            /** @name        cellWidth
             *  @public
             *  @type        {number}
             *  @description Component member for cell Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cellWidth?: number; // px per beat
            /** @name        cellHeight
             *  @public
             *  @type        {number}
             *  @description Component member for cell Height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cellHeight?: number; // px per row (pitch)
            /** @name        snap
             *  @public
             *  @type        {number}
             *  @description Component member for snap.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            snap?: number; // beat snap (e.g. 0.25 = 16th)
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

    /** @name        PITCH_NAMES
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned PITCH_NAMES value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    export function pitchLabel(p: number): string {
        /** @name        oct
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned oct value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const oct = Math.floor(p / 12) - 1;

        /** @name        name
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned name value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const name = PITCH_NAMES[p % 12] ?? '?';
        return name + oct;
    }
    export function isBlackKey(p: number): boolean {
        return [1, 3, 6, 8, 10].includes(p % 12);
    }

    /** @name        PitchLabel
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned PitchLabel value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function PitchLabel(note: number): string
    {
        return pitchLabel(note);
    }

    /** @name        IsBlackKey
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned IsBlackKey value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function IsBlackKey(note: number): boolean
    {
        return isBlackKey(note);
    }

    /** @class       PianoRoll
     *  @public
     *  @description AriannA PianoRoll component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-piano-roll', {}, {
        Attributes: ['beats', 'pitch-min', 'pitch-max', 'cell-width', 'cell-height', 'snap'],
    })
    export class PianoRoll extends HTMLElement
    {
        /** @name        notes$
         *  @public
         *  @readonly
         *  @type        {PianoRoll.Types.Signal<PianoRoll.Interfaces.PianoNote[]>}
         *  @description Component member for notes$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly notes$: Types.Signal<Interfaces.PianoNote[]> = signal<Interfaces.PianoNote[]>([]);

        /** @name        playing$
         *  @public
         *  @readonly
         *  @type        {PianoRoll.Types.Signal<boolean>}
         *  @description Component member for playing$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly playing$: Types.Signal<boolean> = signal(false);

        /** @name        playhead$
         *  @public
         *  @readonly
         *  @type        {PianoRoll.Types.Signal<number>}
         *  @description Component member for playhead$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly playhead$: Types.Signal<number> = signal(0);

        /** @name        #grid
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for grid.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #grid?: HTMLDivElement;

        /** @name        #cellW
         *  @public
         *  @type        {unknown}
         *  @description Component member for cell W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #cellW = 28;

        /** @name        #cellH
         *  @public
         *  @type        {unknown}
         *  @description Component member for cell H.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #cellH = 14;

        /** @name        #beats
         *  @public
         *  @type        {unknown}
         *  @description Component member for beats.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #beats = 16;

        /** @name        #pitchMin
         *  @public
         *  @type        {unknown}
         *  @description Component member for pitch Min.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #pitchMin = 36;

        /** @name        #pitchMax
         *  @public
         *  @type        {unknown}
         *  @description Component member for pitch Max.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #pitchMax = 84;

        /** @name        #snap
         *  @public
         *  @type        {unknown}
         *  @description Component member for snap.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #snap = 0.25;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {PianoRoll.Interfaces.PianoRollOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.PianoRollOptions = {})
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
            if (opts.beats != null)
                el.setAttribute('beats', String(opts.beats));
            if (opts.pitchMin != null)
                el.setAttribute('pitch-min', String(opts.pitchMin));
            if (opts.pitchMax != null)
                el.setAttribute('pitch-max', String(opts.pitchMax));
            if (opts.cellWidth != null)
                el.setAttribute('cell-width', String(opts.cellWidth));
            if (opts.cellHeight != null)
                el.setAttribute('cell-height', String(opts.cellHeight));
            if (opts.snap != null)
                el.setAttribute('snap', String(opts.snap));
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
                    attribute(name: string): PianoRoll.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): PianoRoll.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {PianoRoll.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {PianoRoll.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {PianoRoll.Types.Stylesheet | null}
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
            if (root.querySelector('.pr-wrap'))
                return;
            this.#beats = parseInt(self.signal().attribute('beats')?.Peek() ?? '16', 10) || 16;
            this.#pitchMin = parseInt(self.signal().attribute('pitch-min')?.Peek() ?? '36', 10) || 36;
            this.#pitchMax = parseInt(self.signal().attribute('pitch-max')?.Peek() ?? '84', 10) || 84;
            this.#cellW = parseInt(self.signal().attribute('cell-width')?.Peek() ?? '28', 10) || 28;
            this.#cellH = parseInt(self.signal().attribute('cell-height')?.Peek() ?? '14', 10) || 14;
            this.#snap = parseFloat(self.signal().attribute('snap')?.Peek() ?? '0.25') || 0.25;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'pr-wrap';
            // Toolbar
            /** @name        tb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tb = document.createElement('div');
            tb.className = 'pr-toolbar';

            /** @name        btnPlay
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnPlay value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnPlay = document.createElement('button');
            btnPlay.type = 'button';
            btnPlay.className = 'pr-btn';
            btnPlay.textContent = '▶';

            /** @name        btnStop
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnStop value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnStop = document.createElement('button');
            btnStop.type = 'button';
            btnStop.className = 'pr-btn';
            btnStop.textContent = '■';

            /** @name        btnClear
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnClear value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnClear = document.createElement('button');
            btnClear.type = 'button';
            btnClear.className = 'pr-btn';
            btnClear.textContent = 'Clear';
            tb.append(btnPlay, btnStop, btnClear);
            // Body: keyboard | grid
            /** @name        body
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned body value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const body = document.createElement('div');
            body.className = 'pr-body';

            /** @name        keyboard
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned keyboard value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const keyboard = document.createElement('div');
            keyboard.className = 'pr-keyboard';
            for (let p = this.#pitchMax; p >= this.#pitchMin; p--)
            {
                /** @name        k
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned k value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const k = document.createElement('div');
                k.className = 'pr-key ' + (isBlackKey(p) ? 'pr-key-black' : 'pr-key-white');
                k.style.height = this.#cellH + 'px';
                if (p % 12 === 0)
                    k.textContent = pitchLabel(p);
                keyboard.appendChild(k);
            }

            /** @name        grid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned grid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const grid = document.createElement('div');
            grid.className = 'pr-grid';
            grid.style.width = (this.#beats * this.#cellW) + 'px';
            grid.style.height = ((this.#pitchMax - this.#pitchMin + 1) * this.#cellH) + 'px';
            this.#grid = grid;
            this.#paintGrid(grid);
            body.append(keyboard, grid);
            wrap.append(tb, body);
            root.appendChild(wrap);
            // Notes layer
            effect(() => {
                // Strip existing note elements, redraw from signal
                grid.querySelectorAll('.pr-note').forEach(n => n.remove());
                for (const n of this.notes$.Get())
                {
                    /** @name        div
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned div value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const div = this.#renderNote(n);
                    grid.appendChild(div);
                }
                // Playhead
                /** @name        ph
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ph value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ph = this.playhead$.Get();

                /** @name        phEl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned phEl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let phEl = grid.querySelector<HTMLDivElement>('.pr-playhead');
                if (!phEl)
                {
                    phEl = document.createElement('div');
                    phEl.className = 'pr-playhead';
                    grid.appendChild(phEl);
                }
                phEl.style.left = (ph * this.#cellW) + 'px';
            });
            // Click-empty to add a note
            grid.addEventListener('pointerdown', (e: PointerEvent) => {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = e.target as HTMLElement;
                if (t.classList.contains('pr-note') || t.classList.contains('pr-note-grip'))
                    return;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = grid.getBoundingClientRect();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = e.clientX - r.left;

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = e.clientY - r.top;

                /** @name        start
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned start value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const start = this.#snapBeat(x / this.#cellW);

                /** @name        pitch
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pitch value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pitch = this.#pitchMax - Math.floor(y / this.#cellH);
                if (pitch < this.#pitchMin || pitch > this.#pitchMax)
                    return;

                /** @name        note
                 *  @public
                 *  @type        {PianoRoll.Interfaces.PianoNote}
                 *  @description Namespace-owned note value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const note: Interfaces.PianoNote = { pitch, start, length: 1, velocity: 0.8 };
                this.notes$.Set([...this.notes$.Peek(), note]);
                self.fire('arianna:pianoroll-note-add', { detail: { note, source: this }, bubbles: true });
            });
            btnPlay.addEventListener('click', () => this.play());
            btnStop.addEventListener('click', () => this.stop());
            btnClear.addEventListener('click', () => {
                this.notes$.Set([]);
            });
            self.Sheet = PianoRoll.DefaultSheet();
        }

        /** @name        #paintGrid
         *  @public
         *  @type        {void}
         *  @description Component member for paint Grid.
         *  @param       {HTMLElement} grid Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #paintGrid(grid: HTMLElement): void
        {
            /** @name        cols
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cols value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cols = this.#beats;

            /** @name        rows
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rows value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rows = this.#pitchMax - this.#pitchMin + 1;
            // Vertical beat lines via background-image (cheap)
            grid.style.backgroundImage = [
                `linear-gradient(to right, var(--ar-border, #2a2a2a) 1px, transparent 1px)`,
                `linear-gradient(to bottom, var(--ar-border, #2a2a2a) 1px, transparent 1px)`,
            ].join(', ');
            grid.style.backgroundSize = `${this.#cellW}px 100%, 100% ${this.#cellH}px`;
            // Black-key row tint via overlay divs (one per black row)
            for (let p = this.#pitchMax; p >= this.#pitchMin; p--)
            {
                if (!isBlackKey(p))
                    continue;

                /** @name        row
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned row value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const row = document.createElement('div');
                row.className = 'pr-row-tint';
                row.style.top = ((this.#pitchMax - p) * this.#cellH) + 'px';
                row.style.height = this.#cellH + 'px';
                row.style.width = (cols * this.#cellW) + 'px';
                grid.appendChild(row);
            }
        }

        /** @name        #renderNote
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for render Note.
         *  @param       {PianoRoll.Interfaces.PianoNote} n Parameter.
         *  @returns     {HTMLDivElement} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderNote(n: Interfaces.PianoNote): HTMLDivElement
        {
            /** @name        div
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned div value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const div = document.createElement('div');
            div.className = 'pr-note';
            div.style.left = (n.start * this.#cellW) + 'px';
            div.style.top = ((this.#pitchMax - n.pitch) * this.#cellH) + 'px';
            div.style.width = (n.length * this.#cellW) + 'px';
            div.style.height = this.#cellH + 'px';
            div.style.opacity = String(0.5 + n.velocity * 0.5);
            // Resize grip
            /** @name        grip
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned grip value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const grip = document.createElement('div');
            grip.className = 'pr-note-grip';
            div.appendChild(grip);

            /** @name        dragKind
             *  @public
             *  @type        {'move' | 'resize' | null}
             *  @description Namespace-owned dragKind value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let dragKind: 'move' | 'resize' | null = null;

            /** @name        startX
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned startX value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let startX = 0, startY = 0, origStart = 0, origPitch = 0, origLen = 0;
            div.addEventListener('pointerdown', (e: PointerEvent) => {
                e.stopPropagation();
                if (e.detail >= 2)
                {
                    // Double-click → delete
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
                    this.notes$.Set(this.notes$.Peek().filter((x: any) => x !== n));
                    self.fire('arianna:pianoroll-note-remove', { detail: { note: n, source: this }, bubbles: true });
                    return;
                }
                dragKind = (e.target as HTMLElement).classList.contains('pr-note-grip') ? 'resize' : 'move';
                startX = e.clientX;
                startY = e.clientY;
                origStart = n.start;
                origPitch = n.pitch;
                origLen = n.length;
                div.setPointerCapture(e.pointerId);
            });
            div.addEventListener('pointermove', (e: PointerEvent) => {
                if (!dragKind)
                    return;

                /** @name        dx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dx = e.clientX - startX;

                /** @name        dy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dy = e.clientY - startY;
                if (dragKind === 'move')
                {
                    /** @name        newStart
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned newStart value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const newStart = this.#snapBeat(origStart + dx / this.#cellW);

                    /** @name        newPitch
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned newPitch value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const newPitch = origPitch - Math.round(dy / this.#cellH);

                    /** @name        updated
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned updated value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const updated = { ...n, start: Math.max(0, newStart), pitch: Math.max(this.#pitchMin, Math.min(this.#pitchMax, newPitch)) };
                    this.#updateNote(n, updated);
                }
                else
                {
                    /** @name        newLen
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned newLen value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const newLen = Math.max(this.#snap, this.#snapBeat(origLen + dx / this.#cellW));

                    /** @name        updated
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned updated value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const updated = { ...n, length: newLen };
                    this.#updateNote(n, updated);
                }
            });
            div.addEventListener('pointerup', (e: PointerEvent) => {
                div.releasePointerCapture(e.pointerId);
                dragKind = null;
            });
            return div;
        }

        /** @name        #updateNote
         *  @public
         *  @type        {void}
         *  @description Component member for update Note.
         *  @param       {PianoRoll.Interfaces.PianoNote} oldNote Parameter.
         *  @param       {PianoRoll.Interfaces.PianoNote} newNote Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #updateNote(oldNote: Interfaces.PianoNote, newNote: Interfaces.PianoNote): void
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

            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = this.notes$.Peek();

            /** @name        idx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned idx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const idx = list.indexOf(oldNote);
            if (idx < 0)
                return;

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = list.slice();
            next[idx] = newNote;
            this.notes$.Set(next);
            // Mutate oldNote in place so subsequent drag deltas track correctly
            Object.assign(oldNote, newNote);
            self.fire('arianna:pianoroll-note-edit', { detail: { note: newNote, oldNote, source: this }, bubbles: true });
        }

        /** @name        #snapBeat
         *  @public
         *  @type        {number}
         *  @description Component member for snap Beat.
         *  @param       {number} b Parameter.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #snapBeat(b: number): number
        {
            if (this.#snap <= 0)
                return b;
            return Math.round(b / this.#snap) * this.#snap;
        }
        // ── Public API ────────────────────────────────────────────────────────
        /** @name        addNote
         *  @public
         *  @type        {this}
         *  @description Component member for add Note.
         *  @param       {PianoRoll.Interfaces.PianoNote} n Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addNote(n: Interfaces.PianoNote): this
        {
            this.notes$.Set([...this.notes$.Peek(), n]);
            return this;
        }

        /** @name        setNotes
         *  @public
         *  @type        {this}
         *  @description Component member for set Notes.
         *  @param       {PianoRoll.Interfaces.PianoNote[]} notes Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setNotes(notes: Interfaces.PianoNote[]): this
        {
            this.notes$.Set(notes);
            return this;
        }

        /** @name        getNotes
         *  @public
         *  @type        {PianoRoll.Interfaces.PianoNote[]}
         *  @description Component member for get Notes.
         *  @returns     {PianoRoll.Interfaces.PianoNote[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getNotes(): Interfaces.PianoNote[] { return this.notes$.Get(); }

        /** @name        play
         *  @public
         *  @type        {void}
         *  @description Component member for play.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        play(): void
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
            this.playing$.Set(true);
            self.fire('arianna:pianoroll-play', { detail: { source: this }, bubbles: true });
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
            this.playing$.Set(false);
            this.playhead$.Set(0);
            self.fire('arianna:pianoroll-stop', { detail: { source: this }, bubbles: true });
        }

        /** Drive the playhead from an external clock (e.g. AudioContext). */
        setPlayhead(beat: number): this
        {
            this.playhead$.Set(beat);
            return this;
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {PianoRoll.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {PianoRoll.Types.Stylesheet} Result.
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
                    userSelect: 'none',
                }),
                new Rule(':host .pr-wrap', {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                }),
                new Rule(':host .pr-toolbar', { display: 'flex', gap: '4px' }),
                new Rule(':host .pr-btn', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.78rem',
                    minWidth: '32px',
                    padding: '4px 10px',
                }),
                new Rule(':host .pr-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
                new Rule(':host .pr-body', {
                    display: 'flex',
                    maxHeight: '320px',
                    overflow: 'auto',
                }),
                new Rule(':host .pr-keyboard', {
                    background: 'var(--ar-bg2, #161616)',
                    borderRight: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    left: '0',
                    zIndex: '2',
                }),
                new Rule(':host .pr-key', {
                    alignItems: 'center',
                    borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                    color: 'var(--ar-muted, #888)',
                    display: 'flex',
                    fontSize: '0.62rem',
                    paddingLeft: '6px',
                    width: '48px',
                }),
                new Rule(':host .pr-key-white', { background: 'var(--ar-bg3, #1e1e1e)' }),
                new Rule(':host .pr-key-black', { background: 'var(--ar-bg, #0d0d0d)' }),
                new Rule(':host .pr-grid', {
                    position: 'relative',
                    cursor: 'crosshair',
                }),
                new Rule(':host .pr-row-tint', {
                    background: 'rgba(255,255,255,0.02)',
                    pointerEvents: 'none',
                    position: 'absolute',
                }),
                new Rule(':host .pr-note', {
                    background: 'var(--ar-primary, #7eb8f7)',
                    border: '1px solid rgba(0,0,0,0.4)',
                    borderRadius: '2px',
                    cursor: 'move',
                    position: 'absolute',
                }),
                new Rule(':host .pr-note-grip', {
                    cursor: 'ew-resize',
                    height: '100%',
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    width: '4px',
                }),
                new Rule(':host .pr-playhead', {
                    background: 'var(--ar-danger, #f44336)',
                    bottom: '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '0',
                    width: '2px',
                }),
            ]);
        }
    }
}
export default PianoRoll;
