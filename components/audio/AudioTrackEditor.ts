/**
 * @module    components/audio/AudioTrackEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AudioTrackEditor component module.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   AudioTrackEditor
 *  @public
 *  @description Namespace containing AudioTrackEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AudioTrackEditor
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
        // ── AudioPart ────────────────────────────────────────────────────────────
        /** @interface   AudioPartOptions
         *  @public
         *  @description AudioPartOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AudioPartOptions
        {
            /** @name        start
             *  @public
             *  @type        {number}
             *  @description Component member for start.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            start?: number; // beats
            /** @name        length
             *  @public
             *  @type        {number}
             *  @description Component member for length.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            length?: number; // beats
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;
        }
        // ── AudioTrack ───────────────────────────────────────────────────────────
        /** @interface   AudioTrackOptions
         *  @public
         *  @description AudioTrackOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AudioTrackOptions
        {
            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name?: string;

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

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;
        }
        // ── AudioTrackEditor (root) ──────────────────────────────────────────────
        /** @interface   AudioTrackEditorOptions
         *  @public
         *  @description AudioTrackEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AudioTrackEditorOptions
        {
            /** @name        bars
             *  @public
             *  @type        {number}
             *  @description Component member for bars.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bars?: number;

            /** @name        beatsPerBar
             *  @public
             *  @type        {number}
             *  @description Component member for beats Per Bar.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            beatsPerBar?: number;

            /** @name        beatPx
             *  @public
             *  @type        {number}
             *  @description Component member for beat Px.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            beatPx?: number;
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

    /** @name        BEAT_PX_DEFAULT
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned BEAT_PX_DEFAULT value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const BEAT_PX_DEFAULT = 20; // px per beat at zoom = 1
    /** @name        BEATS_PER_BAR
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned BEATS_PER_BAR value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const BEATS_PER_BAR = 4;

    /** @class       AudioPart
     *  @public
     *  @description AriannA AudioPart component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        export @Component('arianna-audio-part', {}, {
        Attributes: ['start', 'length', 'label', 'color', 'selected'],
    })
    class AudioPart extends HTMLElement
    {
        /** @name        start$
         *  @public
         *  @readonly
         *  @type        {AudioTrackEditor.Types.Signal<number>}
         *  @description Component member for start$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly start$: Types.Signal<number> = signal(0);

        /** @name        length$
         *  @public
         *  @readonly
         *  @type        {AudioTrackEditor.Types.Signal<number>}
         *  @description Component member for length$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly length$: Types.Signal<number> = signal(4);

        /** @name        color$
         *  @public
         *  @readonly
         *  @type        {AudioTrackEditor.Types.Signal<string>}
         *  @description Component member for color$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly color$: Types.Signal<string> = signal('');

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {AudioTrackEditor.Interfaces.AudioPartOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.AudioPartOptions = {})
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
            if (opts.start != null)
                el.setAttribute('start', String(opts.start));
            if (opts.length != null)
                el.setAttribute('length', String(opts.length));
            if (opts.label)
                el.setAttribute('label', opts.label);
            if (opts.color)
                el.setAttribute('color', opts.color);
            if (opts.start != null)
                this.start$.Set(opts.start);
            if (opts.length != null)
                this.length$.Set(opts.length);
            if (opts.color)
                this.color$.Set(opts.color);
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
                    attribute(name: string): AudioTrackEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): AudioTrackEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {AudioTrackEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {AudioTrackEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {AudioTrackEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            };

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = self.render();
            if (el.querySelector('.ap-label'))
                return;

            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = document.createElement('span');
            label.className = 'ap-label';

            /** @name        grip
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned grip value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const grip = document.createElement('span');
            grip.className = 'ap-grip';
            el.appendChild(label);
            el.appendChild(grip);

            /** @name        sStart
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sStart value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sStart = self.signal().attribute('start');

            /** @name        sLen
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sLen value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sLen = self.signal().attribute('length');

            /** @name        sLabel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sLabel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sLabel = self.signal().attribute('label');

            /** @name        sColor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sColor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sColor = self.signal().attribute('color');
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sStart?.Get();
                if (v != null)
                    this.start$.Set(parseFloat(v) || 0);
                el.style.left = `calc(${this.start$.Get()} * var(--beat-px, ${BEAT_PX_DEFAULT}px))`;
            });
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sLen?.Get();
                if (v != null)
                    this.length$.Set(parseFloat(v) || 1);
                el.style.width = `calc(${this.length$.Get()} * var(--beat-px, ${BEAT_PX_DEFAULT}px))`;
            });
            effect(() => { label.textContent = sLabel?.Get() ?? ''; });
            effect(() => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = sColor?.Get() ?? this.color$.Get();
                el.style.background = c || 'var(--ar-primary, #7eb8f7)';
            });
            // Drag to move / resize
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
            let startX = 0, origStart = 0, origLen = 0;
            el.addEventListener('pointerdown', (e: PointerEvent) => {
                /** @name        targetIsGrip
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned targetIsGrip value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const targetIsGrip = (e.target as HTMLElement).classList.contains('ap-grip');
                dragKind = targetIsGrip ? 'resize' : 'move';
                startX = e.clientX;
                origStart = this.start$.Peek();
                origLen = this.length$.Peek();
                el.setPointerCapture(e.pointerId);
                // Select
                el.setAttribute('selected', '');
                self.fire('arianna:part-select', { detail: { part: this, source: this }, bubbles: true });
            });
            el.addEventListener('pointermove', (e: PointerEvent) => {
                if (!dragKind)
                    return;

                /** @name        beatPx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned beatPx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const beatPx = this.#getBeatPx(el);

                /** @name        dBeats
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dBeats value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dBeats = (e.clientX - startX) / beatPx;
                if (dragKind === 'move')
                {
                    /** @name        next
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned next value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const next = Math.max(0, Math.round((origStart + dBeats) * 4) / 4);
                    this.start$.Set(next);
                    el.setAttribute('start', String(next));
                    self.fire('arianna:part-move', { detail: { part: this, start: next, source: this }, bubbles: true });
                }
                else
                {
                    /** @name        next
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned next value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const next = Math.max(0.25, Math.round((origLen + dBeats) * 4) / 4);
                    this.length$.Set(next);
                    el.setAttribute('length', String(next));
                    self.fire('arianna:part-resize', { detail: { part: this, length: next, source: this }, bubbles: true });
                }
            });
            el.addEventListener('pointerup', (e: PointerEvent) => {
                el.releasePointerCapture(e.pointerId);
                dragKind = null;
            });
            self.Sheet = AudioPart.DefaultSheet();
        }

        /** @name        #getBeatPx
         *  @public
         *  @type        {number}
         *  @description Component member for get Beat Px.
         *  @param       {HTMLElement} el Parameter.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #getBeatPx(el: HTMLElement): number
        {
            /** @name        cs
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cs = getComputedStyle(el);

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = parseFloat(cs.getPropertyValue('--beat-px'));
            return isFinite(v) && v > 0 ? v : BEAT_PX_DEFAULT;
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AudioTrackEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AudioTrackEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-primary, #7eb8f7)',
                    border: '1px solid rgba(0,0,0,0.3)',
                    borderRadius: '3px',
                    color: '#000',
                    cursor: 'grab',
                    display: 'block',
                    fontSize: '0.7rem',
                    overflow: 'hidden',
                    padding: '2px 6px',
                    position: 'absolute',
                    top: '4px',
                    bottom: '4px',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host([selected])', {
                    boxShadow: '0 0 0 2px var(--ar-warning, #ff9800)',
                    zIndex: '2',
                }),
                new Rule(':host .ap-label', {
                    pointerEvents: 'none',
                }),
                new Rule(':host .ap-grip', {
                    bottom: '0',
                    cursor: 'ew-resize',
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    width: '6px',
                }),
            ]);
        }
    }

    /** @class       AudioTrack
     *  @public
     *  @description AriannA AudioTrack component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        export @Component('arianna-audio-track', {}, {
        Attributes: ['name', 'muted', 'soloed', 'color'],
        bus: 'arianna-audio-track-editor',
    })
    class AudioTrack extends HTMLElement
    {
        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {AudioTrackEditor.Interfaces.AudioTrackOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.AudioTrackOptions = {})
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
            if (opts.name)
                el.setAttribute('name', opts.name);
            if (opts.muted)
                el.setAttribute('muted', '');
            if (opts.soloed)
                el.setAttribute('soloed', '');
            if (opts.color)
                el.setAttribute('color', opts.color);
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
                    attribute(name: string): AudioTrackEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): AudioTrackEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {AudioTrackEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {AudioTrackEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {AudioTrackEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            };

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = self.render();
            if (el.querySelector('.at-head'))
                return;
            // Header
            /** @name        head
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned head value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const head = document.createElement('div');
            head.className = 'at-head';

            /** @name        name
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned name value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const name = document.createElement('span');
            name.className = 'at-name';

            /** @name        sName
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sName value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sName = self.signal().attribute('name');
            effect(() => { name.textContent = sName?.Get() ?? 'Track'; });

            /** @name        btnMute
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnMute value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnMute = document.createElement('button');
            btnMute.type = 'button';
            btnMute.className = 'at-btn at-mute';
            btnMute.textContent = 'M';

            /** @name        btnSolo
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnSolo value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnSolo = document.createElement('button');
            btnSolo.type = 'button';
            btnSolo.className = 'at-btn at-solo';
            btnSolo.textContent = 'S';
            head.append(name, btnMute, btnSolo);
            // Lane (where parts live)
            /** @name        lane
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lane value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lane = document.createElement('div');
            lane.className = 'at-lane';
            // Move any pre-existing AudioPart children into the lane
            Array.from(el.querySelectorAll('arianna-audio-part'))
                .forEach(p => lane.appendChild(p));
            el.appendChild(head);
            el.appendChild(lane);
            // Mute / Solo handlers
            btnMute.addEventListener('click', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = !el.hasAttribute('muted');
                if (v)
                    el.setAttribute('muted', '');
                else
                    el.removeAttribute('muted');
                self.fire('arianna:track-mute', { detail: { track: this, value: v, source: this }, bubbles: true });
            });
            btnSolo.addEventListener('click', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = !el.hasAttribute('soloed');
                if (v)
                    el.setAttribute('soloed', '');
                else
                    el.removeAttribute('soloed');
                self.fire('arianna:track-solo', { detail: { track: this, value: v, source: this }, bubbles: true });
            });
            effect(() => { btnMute.classList.toggle('active', el.hasAttribute('muted')); });
            effect(() => { btnSolo.classList.toggle('active', el.hasAttribute('soloed')); });
            self.Sheet = AudioTrack.DefaultSheet();
        }

        /** Add a part to this track's lane (places into the lane container). */
        addPart(p: AudioPart): this
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
            };

            /** @name        lane
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lane value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lane = self.render().querySelector('.at-lane');
            if (!lane)
                return this;

            /** @name        partEl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned partEl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const partEl = (p as unknown as {
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
            lane.appendChild(partEl);
            return this;
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AudioTrackEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AudioTrackEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    height: '56px',
                }),
                new Rule(':host .at-head', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #161616)',
                    borderRight: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'flex',
                    gap: '4px',
                    padding: '0 8px',
                }),
                new Rule(':host .at-name', {
                    color: 'var(--ar-text, #e0e0e0)',
                    flex: '1',
                    fontSize: '0.78rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host .at-btn', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.68rem',
                    minWidth: '24px',
                    padding: '2px 6px',
                }),
                new Rule(':host .at-mute.active', { background: 'var(--ar-danger, #f44336)', color: '#fff' }),
                new Rule(':host .at-solo.active', { background: 'var(--ar-warning, #ff9800)', color: '#fff' }),
                new Rule(':host([muted]) .at-lane', { opacity: '0.4' }),
                new Rule(':host .at-lane', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    position: 'relative',
                }),
            ]);
        }
    }

    /** @class       AudioTrackEditor
     *  @public
     *  @description AriannA AudioTrackEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-audio-track-editor', {}, {
        Attributes: ['bars', 'beats-per-bar', 'beat-px'],
    })
    export class AudioTrackEditor extends HTMLElement
    {
        /** @name        playhead$
         *  @public
         *  @readonly
         *  @type        {AudioTrackEditor.Types.Signal<number>}
         *  @description Component member for playhead$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly playhead$: Types.Signal<number> = signal(0); // in beats
        /** @name        #bars
         *  @public
         *  @type        {unknown}
         *  @description Component member for bars.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #bars = 16;

        /** @name        #beatsPerBar
         *  @public
         *  @type        {unknown}
         *  @description Component member for beats Per Bar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #beatsPerBar = BEATS_PER_BAR;

        /** @name        #beatPx
         *  @public
         *  @type        {unknown}
         *  @description Component member for beat Px.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #beatPx = BEAT_PX_DEFAULT;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {AudioTrackEditor.Interfaces.AudioTrackEditorOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.AudioTrackEditorOptions = {})
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
            if (opts.bars != null)
                el.setAttribute('bars', String(opts.bars));
            if (opts.beatsPerBar != null)
                el.setAttribute('beats-per-bar', String(opts.beatsPerBar));
            if (opts.beatPx != null)
                el.setAttribute('beat-px', String(opts.beatPx));
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
                    attribute(name: string): AudioTrackEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): AudioTrackEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {AudioTrackEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {AudioTrackEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {AudioTrackEditor.Types.Stylesheet | null}
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
            if (root.querySelector('.ate-ruler'))
                return;
            this.#bars = parseInt(self.signal().attribute('bars')?.Peek() ?? '16', 10) || 16;
            this.#beatsPerBar = parseInt(self.signal().attribute('beats-per-bar')?.Peek() ?? '4', 10) || 4;
            this.#beatPx = parseInt(self.signal().attribute('beat-px')?.Peek() ?? String(BEAT_PX_DEFAULT), 10) || BEAT_PX_DEFAULT;
            root.style.setProperty('--beat-px', this.#beatPx + 'px');
            // Ruler (top bar with bar numbers)
            /** @name        ruler
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ruler value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ruler = document.createElement('div');
            ruler.className = 'ate-ruler';

            /** @name        corner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned corner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const corner = document.createElement('div');
            corner.className = 'ate-corner';

            /** @name        rulerInner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rulerInner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rulerInner = document.createElement('div');
            rulerInner.className = 'ate-ruler-inner';
            for (let b = 1; b <= this.#bars; b++)
            {
                /** @name        tick
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tick value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tick = document.createElement('span');
                tick.className = 'ate-tick';
                tick.style.left = ((b - 1) * this.#beatsPerBar * this.#beatPx) + 'px';
                tick.textContent = String(b);
                rulerInner.appendChild(tick);
            }

            /** @name        totalWidth
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned totalWidth value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const totalWidth = this.#bars * this.#beatsPerBar * this.#beatPx;
            rulerInner.style.width = totalWidth + 'px';
            ruler.append(corner, rulerInner);
            // Body — tracks
            /** @name        body
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned body value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const body = document.createElement('div');
            body.className = 'ate-body';
            // Move pre-existing tracks
            Array.from(root.querySelectorAll('arianna-audio-track'))
                .forEach(t => body.appendChild(t));
            // Playhead overlay
            /** @name        playhead
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned playhead value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const playhead = document.createElement('div');
            playhead.className = 'ate-playhead';
            effect(() => {
                /** @name        b
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned b value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const b = this.playhead$.Get();
                playhead.style.left = (160 + b * this.#beatPx) + 'px';
            });
            root.append(ruler, body, playhead);
            self.Sheet = AudioTrackEditor.DefaultSheet();
        }

        /** Set the playhead in beats. */
        setPlayhead(beats: number): this
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
            this.playhead$.Set(beats);
            self.fire('arianna:editor-playhead', { detail: { beat: beats, source: this }, bubbles: true });
            return this;
        }

        /** All AudioTrack children registered to this editor (via bus). */
        get tracks(): AudioTrack[]
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        _children
                 *  @public
                 *  @type        {AudioTrackEditor.AudioTrack[]}
                 *  @description Component member for _children.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                _children: AudioTrack[];
            };
            return self._children;
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AudioTrackEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AudioTrackEditor.Types.Stylesheet} Result.
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
                    display: 'block',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                    overflow: 'hidden',
                    position: 'relative',
                    userSelect: 'none',
                }),
                new Rule(':host .ate-ruler', {
                    background: 'var(--ar-bg2, #161616)',
                    borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    height: '24px',
                    overflow: 'hidden',
                }),
                new Rule(':host .ate-corner', {
                    background: 'var(--ar-bg2, #161616)',
                    borderRight: '1px solid var(--ar-border, #2a2a2a)',
                }),
                new Rule(':host .ate-ruler-inner', {
                    position: 'relative',
                }),
                new Rule(':host .ate-tick', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.66rem',
                    position: 'absolute',
                    top: '4px',
                }),
                new Rule(':host .ate-body', {
                    display: 'block',
                    maxHeight: '380px',
                    overflow: 'auto',
                }),
                new Rule(':host .ate-playhead', {
                    background: 'var(--ar-danger, #f44336)',
                    bottom: '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '24px',
                    width: '2px',
                }),
            ]);
        }
    }
}
export default AudioTrackEditor;
