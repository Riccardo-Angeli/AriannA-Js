/**
 * @module    components/animations/OnionStage
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA OnionStage component module.
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

/** @namespace   OnionStage
 *  @public
 *  @description Namespace containing OnionStage contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace OnionStage
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

        /** @name        SnapshotProvider
         *  @public
         *  @type        {(frame: number) => HTMLElement | SVGElement | null}
         *  @description Type alias for SnapshotProvider.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SnapshotProvider = (frame: number) => HTMLElement | SVGElement | null;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   OnionStageOptions
         *  @public
         *  @description OnionStageOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface OnionStageOptions
        {
            /** @name        before
             *  @public
             *  @type        {number}
             *  @description Component member for before.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            before?: number; // ghost frames before the playhead
            /** @name        after
             *  @public
             *  @type        {number}
             *  @description Component member for after.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            after?: number; // ghost frames after
            /** @name        step
             *  @public
             *  @type        {number}
             *  @description Component member for step.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            step?: number; // distance (in frames) between ghosts (default 1)
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

    /** @class       OnionStage
     *  @public
     *  @description AriannA OnionStage component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-onion-stage', {}, {
        Attributes: ['before', 'after', 'step', 'width', 'height'],
    })
    export class OnionStage extends HTMLElement
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

        /** @name        frame$
         *  @public
         *  @readonly
         *  @type        {OnionStage.Types.Signal<number>}
         *  @description Component member for frame$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly frame$: Types.Signal<number> = signal(0);

        /** @name        #provider
         *  @public
         *  @type        {OnionStage.Types.SnapshotProvider}
         *  @description Component member for provider.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #provider?: Types.SnapshotProvider;

        /** @name        #host
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for host.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #host?: HTMLDivElement;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {OnionStage.Interfaces.OnionStageOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.OnionStageOptions = {})
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
            if (opts.before != null)
                el.setAttribute('before', String(opts.before));
            if (opts.after != null)
                el.setAttribute('after', String(opts.after));
            if (opts.step != null)
                el.setAttribute('step', String(opts.step));
            if (opts.width != null)
                el.setAttribute('width', String(opts.width));
            if (opts.height != null)
                el.setAttribute('height', String(opts.height));
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

                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): OnionStage.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): OnionStage.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {OnionStage.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {OnionStage.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {OnionStage.Types.Stylesheet | null}
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
            if (root.querySelector('.os-host'))
                return;

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
            const w = parseInt(sW?.Peek() ?? '420', 10) || 420;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = parseInt(sH?.Peek() ?? '300', 10) || 300;
            root.style.width = w + 'px';
            root.style.height = h + 'px';

            /** @name        host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const host = document.createElement('div');
            host.className = 'os-host';
            this.#host = host;
            root.appendChild(host);
            // Re-render whenever frame or provider change
            effect(() => { this.frame$.Get(); this.#repaint(); });
            self.Sheet = OnionStage.DefaultSheet();
        }

        /** Provider must return a fresh DOM/SVG snapshot for the given frame. */
        setSnapshotProvider(fn: Types.SnapshotProvider): this
        {
            this.#provider = fn;
            this.#repaint();
            return this;
        }

        /** Update the live playhead frame. */
        setFrame(f: number): this
        {
            this.frame$.Set(f);
            return this;
        }

        /** Public: total ghost count (before + after). */
        get ghostCount(): number
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): OnionStage.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): OnionStage.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {OnionStage.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {OnionStage.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };
            };

            /** @name        b
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned b value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const b = parseInt(self.signal().attribute('before')?.Peek() ?? '2', 10) || 0;

            /** @name        a
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned a value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const a = parseInt(self.signal().attribute('after')?.Peek() ?? '2', 10) || 0;
            return b + a;
        }

        /** @name        #repaint
         *  @public
         *  @type        {void}
         *  @description Component member for repaint.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #repaint(): void
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): OnionStage.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): OnionStage.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {OnionStage.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {OnionStage.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };
            };

            /** @name        host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const host = this.#host;
            if (!host || !this.#provider)
                return;
            while (host.firstChild)
                host.removeChild(host.firstChild);

            /** @name        before
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned before value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const before = parseInt(self.signal().attribute('before')?.Peek() ?? '2', 10) || 0;

            /** @name        after
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned after value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const after = parseInt(self.signal().attribute('after')?.Peek() ?? '2', 10) || 0;

            /** @name        step
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned step value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const step = parseInt(self.signal().attribute('step')?.Peek() ?? '1', 10) || 1;

            /** @name        live
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned live value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const live = this.frame$.Peek();
            // Past ghosts (deepest first so live ends up on top)
            for (let i = before; i >= 1; i--)
            {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = live - i * step;

                /** @name        snap
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned snap value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const snap = this.#provider(f);
                if (snap)
                {
                    /** @name        ghost
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ghost value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ghost = this.#wrapGhost(snap, i / Math.max(1, before), 'past');
                    host.appendChild(ghost);
                }
            }
            // Future ghosts
            for (let i = after; i >= 1; i--)
            {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = live + i * step;

                /** @name        snap
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned snap value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const snap = this.#provider(f);
                if (snap)
                {
                    /** @name        ghost
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ghost value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ghost = this.#wrapGhost(snap, i / Math.max(1, after), 'future');
                    host.appendChild(ghost);
                }
            }
            // Live frame on top, full opacity
            /** @name        liveSnap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned liveSnap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const liveSnap = this.#provider(live);
            if (liveSnap)
            {
                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = document.createElement('div');
                w.className = 'os-live';
                w.appendChild(liveSnap);
                host.appendChild(w);
            }
        }

        /** @name        #wrapGhost
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for wrap Ghost.
         *  @param       {HTMLElement | SVGElement} snap Parameter.
         *  @param       {number} distRatio Parameter.
         *  @param       {'past' | 'future'} kind Parameter.
         *  @returns     {HTMLDivElement} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #wrapGhost(snap: HTMLElement | SVGElement, distRatio: number, kind: 'past' | 'future'): HTMLDivElement
        {
            // distRatio: 1 = furthest (most faded), 0 = closest to live
            /** @name        opacity
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned opacity value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const opacity = 0.45 * (1 - distRatio * 0.7);

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = `os-ghost os-ghost-${kind}`;
            wrap.style.opacity = String(opacity);
            wrap.appendChild(snap);
            return wrap;
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {OnionStage.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {OnionStage.Types.Stylesheet} Result.
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
                    display: 'inline-block',
                    overflow: 'hidden',
                    position: 'relative',
                }),
                new Rule(':host .os-host', {
                    height: '100%',
                    position: 'relative',
                    width: '100%',
                }),
                new Rule(':host .os-host > *', {
                    inset: '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                }),
                new Rule(':host .os-ghost-past', { filter: 'grayscale(0.35) sepia(0.1) hue-rotate(190deg)', mixBlendMode: 'screen' }),
                new Rule(':host .os-ghost-future', { filter: 'grayscale(0.35) sepia(0.4) hue-rotate(330deg)', mixBlendMode: 'screen' }),
                new Rule(':host .os-live', { pointerEvents: 'auto', opacity: '1' }),
            ]);
        }
    }
}
export default OnionStage;

export type OnionStageOptions = OnionStage.Interfaces.OnionStageOptions;
export type SnapshotProvider = OnionStage.Types.SnapshotProvider;
