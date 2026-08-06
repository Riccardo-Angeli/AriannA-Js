/**
 * @module    components/animations/Keyframe
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Keyframe component module.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Keyframe
 *  @public
 *  @description Namespace containing Keyframe contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Keyframe
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Interpolation
         *  @public
         *  @type        {KeyframeInterpolation}
         *  @description Type alias for Interpolation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Interpolation = KeyframeInterpolation;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   Options
         *  @public
         *  @description Options contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options extends KeyframeOptions
        {
        }
    }

    /**
     * @convention AriannA component namespace merge
     * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
     */
    /**
     * @module    components/animations/Keyframe
     * @author    Riccardo Angeli
     * @copyright Riccardo Angeli 2012-2026
     *
     * Keyframe — single point on a track. Visually rendered as a diamond
     * (◆) in Blender dope-sheet style:
     *   – Grey when at rest
     *   – Orange when the editor's playhead is on this exact frame ("hot")
     *   – Cyan outline when selected
     *
     * Lives as a child of `<arianna-anim-track>`, which itself lives as
     * a child of `<arianna-keyframe-editor>`. The bus pattern lets each
     * AnimTrack collect its child Keyframes automatically.
     *
     *   <arianna-keyframe frame="24" value="5"></arianna-keyframe>
     *
     *   const kf = new Keyframe({ frame: 24, value: 5 });
     *   track.append(kf);
     *
     * Events:
     *   arianna:keyframe-select { keyframe }
     *   arianna:keyframe-move   { keyframe, frame, value }
     */
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'SchemaInterfaces.Reactivity.Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    const signal = Reactivity.CreateSignal;

    /** @name        effect
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned effect value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const effect = (fn: () => void): (() => void) => {
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
    const { Rule, Stylesheet } = Css;

    /** @name        KeyframeInterpolation
     *  @public
     *  @type        {'constant' | 'linear' | 'bezier'}
     *  @description Type alias for KeyframeInterpolation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type KeyframeInterpolation = 'constant' | 'linear' | 'bezier';

    /** @interface   KeyframeOptions
     *  @public
     *  @description KeyframeOptions contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface KeyframeOptions
    {
        /** @name        frame
         *  @public
         *  @type        {number}
         *  @description Component member for frame.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        frame?: number;

        /** @name        value
         *  @public
         *  @type        {number}
         *  @description Component member for value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        value?: number;

        /** @name        interpolation
         *  @public
         *  @type        {KeyframeInterpolation}
         *  @description Component member for interpolation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        interpolation?: KeyframeInterpolation;

        /** Bezier handle offsets in (frames, value) units relative to the key. */
        handleIn?: [
            number,
            number
        ];

        /** @name        handleOut
         *  @public
         *  @type        {[
            number,
            number
        ]}
         *  @description Component member for handle Out.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        handleOut?: [
            number,
            number
        ];
    }

    /** @class       Keyframe
     *  @public
     *  @description AriannA Keyframe component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-keyframe', {}, {
        Attributes: ['frame', 'value', 'interpolation', 'selected', 'hot'],
        bus: 'arianna-anim-track',
    })
    export class Keyframe extends HTMLElement
    {
        /** @name        frame$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<number>}
         *  @description Component member for frame$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly frame$: SchemaInterfaces.Reactivity.Signal<number> = signal(0);

        /** @name        value$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<number>}
         *  @description Component member for value$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly value$: SchemaInterfaces.Reactivity.Signal<number> = signal(0);

        /** @name        interpolation$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<KeyframeInterpolation>}
         *  @description Component member for interpolation$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly interpolation$: SchemaInterfaces.Reactivity.Signal<KeyframeInterpolation> = signal('bezier' as KeyframeInterpolation);

        /** @name        handleIn$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<[
            number,
            number
        ]>}
         *  @description Component member for handle In$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly handleIn$: SchemaInterfaces.Reactivity.Signal<[
            number,
            number
        ]> = signal([-1, 0] as [
            number,
            number
        ]);

        /** @name        handleOut$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<[
            number,
            number
        ]>}
         *  @description Component member for handle Out$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly handleOut$: SchemaInterfaces.Reactivity.Signal<[
            number,
            number
        ]> = signal([1, 0] as [
            number,
            number
        ]);

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {KeyframeOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: KeyframeOptions = {})
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
            if (opts.frame != null)
                el.setAttribute('frame', String(opts.frame));
            if (opts.value != null)
                el.setAttribute('value', String(opts.value));
            if (opts.interpolation)
                el.setAttribute('interpolation', opts.interpolation);
            if (opts.frame != null)
                this.frame$.Set(opts.frame);
            if (opts.value != null)
                this.value$.Set(opts.value);
            if (opts.interpolation)
                this.interpolation$.Set(opts.interpolation);
            if (opts.handleIn)
                this.handleIn$.Set(opts.handleIn);
            if (opts.handleOut)
                this.handleOut$.Set(opts.handleOut);
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
                    attribute(name: string): SchemaInterfaces.Reactivity.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): SchemaInterfaces.Reactivity.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {SchemaInterfaces.Reactivity.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {SchemaInterfaces.Reactivity.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): SchemaInterfaces.Reactivity.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Css.Stylesheet | null;
            };

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = self.render();
            if (el.querySelector('.kf-diamond'))
                return;

            /** @name        diamond
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned diamond value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const diamond = document.createElement('span');
            diamond.className = 'kf-diamond';
            el.appendChild(diamond);

            /** @name        sFrame
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sFrame value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sFrame = self.signal().attribute('frame');

            /** @name        sValue
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sValue value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sValue = self.signal().attribute('value');

            /** @name        sInterp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sInterp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sInterp = self.signal().attribute('interpolation');
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sFrame?.Get();
                if (v != null)
                    this.frame$.Set(parseFloat(v) || 0);
            });
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sValue?.Get();
                if (v != null)
                    this.value$.Set(parseFloat(v) || 0);
            });
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sInterp?.Get();
                if (v)
                    this.interpolation$.Set(v as KeyframeInterpolation);
            });
            // Position via CSS var --frame-px on the parent track
            effect(() => {
                el.style.left = `calc(${this.frame$.Get()} * var(--frame-px, 14px))`;
            });
            // Click to select
            el.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                el.toggleAttribute('selected');
                self.fire('arianna:keyframe-select', { detail: { keyframe: this, source: this }, bubbles: true });
            });
            self.Sheet = Keyframe.DefaultSheet();
        }

        /** Public API. */
        setFrame(f: number): this { this.frame$.Set(f); return this; }

        /** @name        setValue
         *  @public
         *  @type        {this}
         *  @description Component member for set Value.
         *  @param       {number} v Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setValue(v: number): this { this.value$.Set(v); return this; }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Css.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    bottom: '0',
                    display: 'inline-block',
                    pointerEvents: 'auto',
                    position: 'absolute',
                    top: '0',
                    transform: 'translateX(-50%)',
                    width: '14px',
                }),
                new Rule(':host .kf-diamond', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-text, #e0e0e0)',
                    cursor: 'pointer',
                    display: 'block',
                    height: '10px',
                    left: '50%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    transition: 'background .12s, border-color .12s',
                    width: '10px',
                }),
                new Rule(':host([hot]) .kf-diamond', {
                    background: 'var(--ar-warning, #ff9800)',
                    borderColor: '#fff',
                }),
                new Rule(':host([selected]) .kf-diamond', {
                    outline: '2px solid var(--ar-primary, #7eb8f7)',
                    outlineOffset: '1px',
                }),
            ]);
        }
    }
}
export default Keyframe;

export type KeyframeOptions = Keyframe.KeyframeOptions;

export type KeyframeInterpolation = Keyframe.KeyframeInterpolation;
