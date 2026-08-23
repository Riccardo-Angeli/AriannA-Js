/**
 * @module    components/animations/KeyframeEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA KeyframeEditor component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import { AnimTrack, type ChannelGroup } from './AnimTrack.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   KeyframeEditor
 *  @public
 *  @description Namespace containing KeyframeEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace KeyframeEditor
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
        /** @interface   KeyframeEditorOptions
         *  @public
         *  @description KeyframeEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface KeyframeEditorOptions
        {
            /** @name        frameStart
             *  @public
             *  @type        {number}
             *  @description Component member for frame Start.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            frameStart?: number;

            /** @name        frameEnd
             *  @public
             *  @type        {number}
             *  @description Component member for frame End.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            frameEnd?: number;

            /** @name        current
             *  @public
             *  @type        {number}
             *  @description Component member for current.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            current?: number;

            /** @name        framePx
             *  @public
             *  @type        {number}
             *  @description Component member for frame Px.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            framePx?: number; // px per frame
            /** @name        frameStep
             *  @public
             *  @type        {number}
             *  @description Component member for frame Step.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            frameStep?: number; // major grid step
            /** @name        trackHeight
             *  @public
             *  @type        {number}
             *  @description Component member for track Height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            trackHeight?: number;

            /** @name        autoChannels
             *  @public
             *  @type        {boolean}
             *  @description Component member for auto Channels.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            autoChannels?: boolean; // pre-create the 10 standard Blender channels
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

    /** @name        STD_CHANNELS
     *  @public
     *  @type        {Array<{
        name: string;
        channel: string;
        group: ChannelGroup;
    }>}
     *  @description Namespace-owned STD_CHANNELS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const STD_CHANNELS: Array<{
        /** @name        name
         *  @public
         *  @type        {string}
         *  @description Component member for name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        name: string;

        /** @name        channel
         *  @public
         *  @type        {string}
         *  @description Component member for channel.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        channel: string;

        /** @name        group
         *  @public
         *  @type        {ChannelGroup}
         *  @description Component member for group.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        group: ChannelGroup;
    }> = [
        { name: 'X Location', channel: 'loc-x', group: 'position' },
        { name: 'Y Location', channel: 'loc-y', group: 'position' },
        { name: 'Z Location', channel: 'loc-z', group: 'position' },
        { name: 'W Quaternion Rotation', channel: 'rot-w', group: 'rotation' },
        { name: 'X Quaternion Rotation', channel: 'rot-x', group: 'rotation' },
        { name: 'Y Quaternion Rotation', channel: 'rot-y', group: 'rotation' },
        { name: 'Z Quaternion Rotation', channel: 'rot-z', group: 'rotation' },
        { name: 'X Scale', channel: 'sca-x', group: 'scale' },
        { name: 'Y Scale', channel: 'sca-y', group: 'scale' },
        { name: 'Z Scale', channel: 'sca-z', group: 'scale' },
    ];

    /** @class       KeyframeEditor
     *  @public
     *  @description AriannA KeyframeEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-keyframe-editor', {}, {
        Attributes: ['frame-start', 'frame-end', 'current', 'frame-px', 'frame-step', 'track-height', 'auto-channels', 'playing'],
    })
    export class KeyframeEditor extends HTMLElement
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

        /** @name        current$
         *  @public
         *  @readonly
         *  @type        {KeyframeEditor.Types.Signal<number>}
         *  @description Component member for current$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly current$: Types.Signal<number> = signal(0);

        /** @name        #rafId
         *  @public
         *  @type        {unknown}
         *  @description Component member for raf Id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #rafId = 0;

        /** @name        #lastTime
         *  @public
         *  @type        {unknown}
         *  @description Component member for last Time.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #lastTime = 0;

        /** @name        #fps
         *  @public
         *  @type        {unknown}
         *  @description Component member for fps.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fps = 24;

        /** @name        #playing
         *  @public
         *  @type        {unknown}
         *  @description Component member for playing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #playing = false;

        /** @name        #body
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for body.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #body?: HTMLDivElement;

        /** @name        #ruler
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for ruler.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #ruler?: HTMLDivElement;

        /** @name        #playhead
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for playhead.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #playhead?: HTMLDivElement;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {KeyframeEditor.Interfaces.KeyframeEditorOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.KeyframeEditorOptions = {})
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
            if (opts.frameStart != null)
                el.setAttribute('frame-start', String(opts.frameStart));
            if (opts.frameEnd != null)
                el.setAttribute('frame-end', String(opts.frameEnd));
            if (opts.current != null)
                el.setAttribute('current', String(opts.current));
            if (opts.framePx != null)
                el.setAttribute('frame-px', String(opts.framePx));
            if (opts.frameStep != null)
                el.setAttribute('frame-step', String(opts.frameStep));
            if (opts.trackHeight != null)
                el.setAttribute('track-height', String(opts.trackHeight));
            if (opts.autoChannels)
                el.setAttribute('auto-channels', '');
            if (opts.current != null)
                this.current$.Set(opts.current);
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
                    attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {KeyframeEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {KeyframeEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {KeyframeEditor.Types.Stylesheet | null}
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
            if (root.querySelector('.kfe-toolbar'))
                return;

            /** @name        frameStart
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned frameStart value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const frameStart = parseInt(self.signal().attribute('frame-start')?.Peek() ?? '0', 10) || 0;

            /** @name        frameEnd
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned frameEnd value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const frameEnd = parseInt(self.signal().attribute('frame-end')?.Peek() ?? '100', 10) || 100;

            /** @name        framePx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned framePx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const framePx = parseInt(self.signal().attribute('frame-px')?.Peek() ?? '14', 10) || 14;

            /** @name        frameStep
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned frameStep value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const frameStep = parseInt(self.signal().attribute('frame-step')?.Peek() ?? '5', 10) || 5;

            /** @name        trackHeight
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned trackHeight value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const trackHeight = parseInt(self.signal().attribute('track-height')?.Peek() ?? '22', 10) || 22;
            root.style.setProperty('--frame-px', framePx + 'px');
            root.style.setProperty('--frame-step-px', (framePx * frameStep) + 'px');
            root.style.setProperty('--track-height', trackHeight + 'px');
            root.style.setProperty('--track-head-width', '160px');
            // Toolbar
            /** @name        tb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tb = document.createElement('div');
            tb.className = 'kfe-toolbar';

            /** @name        btnFirst
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnFirst value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnFirst = this.#mkBtn('|◀', 'kfe-first');

            /** @name        btnPrev
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnPrev value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnPrev = this.#mkBtn('◀', 'kfe-prev');

            /** @name        btnPlay
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnPlay value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnPlay = this.#mkBtn('▶', 'kfe-play');

            /** @name        btnNext
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnNext value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnNext = this.#mkBtn('▶', 'kfe-next');

            /** @name        btnLast
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnLast value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnLast = this.#mkBtn('▶|', 'kfe-last');

            /** @name        frameInput
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned frameInput value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const frameInput = document.createElement('input') as HTMLInputElement;
            frameInput.type = 'number';
            frameInput.className = 'kfe-frame-input';
            frameInput.value = String(this.current$.Peek());

            /** @name        lblStart
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lblStart value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lblStart = document.createElement('span');
            lblStart.className = 'kfe-frame-lbl';
            lblStart.textContent = 'Start ' + frameStart;

            /** @name        lblEnd
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lblEnd value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lblEnd = document.createElement('span');
            lblEnd.className = 'kfe-frame-lbl';
            lblEnd.textContent = 'End ' + frameEnd;
            tb.append(btnFirst, btnPrev, btnPlay, btnNext, btnLast, frameInput, lblStart, lblEnd);
            // Ruler
            /** @name        ruler
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ruler value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ruler = document.createElement('div');
            ruler.className = 'kfe-ruler';

            /** @name        rulerCorner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rulerCorner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rulerCorner = document.createElement('div');
            rulerCorner.className = 'kfe-ruler-corner';

            /** @name        rulerInner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rulerInner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rulerInner = document.createElement('div');
            rulerInner.className = 'kfe-ruler-inner';
            for (let f = frameStart; f <= frameEnd; f += frameStep)
            {
                /** @name        tick
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tick value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tick = document.createElement('span');
                tick.className = 'kfe-tick';
                tick.style.left = ((f - frameStart) * framePx) + 'px';
                tick.textContent = String(f);
                rulerInner.appendChild(tick);
            }

            /** @name        totalWidth
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned totalWidth value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const totalWidth = (frameEnd - frameStart) * framePx;
            rulerInner.style.width = totalWidth + 'px';
            ruler.append(rulerCorner, rulerInner);
            this.#ruler = ruler;
            // Body
            /** @name        body
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned body value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const body = document.createElement('div');
            body.className = 'kfe-body';
            // Move pre-existing tracks
            Array.from(root.querySelectorAll('arianna-anim-track'))
                .forEach(t => body.appendChild(t));
            this.#body = body;
            // Auto-channels
            if (root.hasAttribute('auto-channels') && !body.querySelector('arianna-anim-track'))
            {
                for (const ch of STD_CHANNELS)
                {
                    /** @name        tr
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned tr value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const tr = new AnimTrack.AnimTrack({ name: ch.name, channel: ch.channel, group: ch.group });

                    /** @name        trEl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned trEl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const trEl = (tr as unknown as {
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
                    body.appendChild(trEl);
                }
            }
            // Playhead overlay
            /** @name        playhead
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned playhead value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const playhead = document.createElement('div');
            playhead.className = 'kfe-playhead';
            playhead.style.left = `calc(var(--track-head-width, 160px) + ${(this.current$.Peek() - frameStart) * framePx}px)`;
            this.#playhead = playhead;
            root.append(tb, ruler, body, playhead);
            // Click on ruler → set current
            rulerInner.addEventListener('pointerdown', (e: PointerEvent) => {
                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = rulerInner.getBoundingClientRect();

                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = Math.round((e.clientX - r.left) / framePx) + frameStart;
                this.setFrame(f);
            });
            // Reactive playhead position + hot keyframe
            effect(() => {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = this.current$.Get();
                if (this.#playhead)
                {
                    this.#playhead.style.left = `calc(var(--track-head-width, 160px) + ${(f - frameStart) * framePx}px)`;
                }
                frameInput.value = String(f);
                this.#updateHotKeyframes(f);
            });
            // Frame input
            frameInput.addEventListener('change', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = parseInt(frameInput.value, 10);
                if (isFinite(v))
                    this.setFrame(v);
            });
            btnFirst.addEventListener('click', () => this.setFrame(frameStart));
            btnLast.addEventListener('click', () => this.setFrame(frameEnd));
            btnPrev.addEventListener('click', () => this.setFrame(this.current$.Peek() - 1));
            btnNext.addEventListener('click', () => this.setFrame(this.current$.Peek() + 1));
            btnPlay.addEventListener('click', () => this.togglePlay());
            // Fire update event whenever DOM changes
            /** @name        observer
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned observer value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const observer = new MutationObserver(() => {
                self.fire('arianna:keyframe-editor-update', { detail: { source: this }, bubbles: false });
                this.#updateHotKeyframes(this.current$.Peek());
            });
            observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['frame', 'value', 'selected', 'hidden'] });
            self.Sheet = KeyframeEditor.DefaultSheet();
            // initial update event
            queueMicrotask(() => {
                self.fire('arianna:keyframe-editor-update', { detail: { source: this }, bubbles: false });
                this.#updateHotKeyframes(this.current$.Peek());
            });
        }

        /** @name        #mkBtn
         *  @public
         *  @type        {HTMLButtonElement}
         *  @description Component member for mk Btn.
         *  @param       {string} label Parameter.
         *  @param       {string} cls Parameter.
         *  @returns     {HTMLButtonElement} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #mkBtn(label: string, cls: string): HTMLButtonElement
        {
            /** @name        b
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned b value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'kfe-btn ' + cls;
            b.textContent = label;
            return b;
        }

        /** @name        #updateHotKeyframes
         *  @public
         *  @type        {void}
         *  @description Component member for update Hot Keyframes.
         *  @param       {number} current Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #updateHotKeyframes(current: number): void
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

            /** @name        all
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned all value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const all = self.render().querySelectorAll('arianna-keyframe');
            all.forEach(k => {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = parseFloat(k.getAttribute('frame') ?? '0');
                if (Math.abs(f - current) < 0.5)
                    k.setAttribute('hot', '');
                else
                    k.removeAttribute('hot');
            });
        }
        // ── Public API ────────────────────────────────────────────────────────
        /** @name        addTrack
         *  @public
         *  @type        {this}
         *  @description Component member for add Track.
         *  @param       {AnimTrack} t Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addTrack(t: AnimTrack.AnimTrack): this
        {
            if (!this.#body)
                return this;

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = (t as unknown as {
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
            this.#body.appendChild(el);
            return this;
        }

        /** @name        setFrame
         *  @public
         *  @type        {this}
         *  @description Component member for set Frame.
         *  @param       {number} f Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setFrame(f: number): this
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
                    attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {KeyframeEditor.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {KeyframeEditor.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };
            };

            /** @name        start
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned start value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const start = parseInt(self.signal().attribute('frame-start')?.Peek() ?? '0', 10) || 0;

            /** @name        end
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned end value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const end = parseInt(self.signal().attribute('frame-end')?.Peek() ?? '100', 10) || 100;

            /** @name        cl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cl = Math.max(start, Math.min(end, Math.round(f)));
            this.current$.Set(cl);
            self.render().setAttribute('current', String(cl));
            self.fire('arianna:keyframe-editor-playhead', { detail: { frame: cl, source: this }, bubbles: true });
            return this;
        }

        /** @name        togglePlay
         *  @public
         *  @type        {void}
         *  @description Component member for toggle Play.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        togglePlay(): void { this.#playing ? this.pause() : this.play(); }

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
            };
            if (this.#playing)
                return;
            this.#playing = true;
            self.render().setAttribute('playing', '');
            self.fire('arianna:keyframe-editor-play', { detail: { source: this }, bubbles: true });
            this.#lastTime = performance.now();

            /** @name        tick
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tick value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tick = (now: number) => {
                if (!this.#playing)
                {
                    this.#rafId = 0;
                    return;
                }

                /** @name        dt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dt = (now - this.#lastTime) / 1000;
                this.#lastTime = now;

                /** @name        dFrames
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dFrames value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dFrames = dt * this.#fps;

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = this.current$.Peek() + dFrames;

                /** @name        end
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned end value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const end = parseInt(((this as unknown as {
                    /** @name        signal
                     *  @public
                     *  @type        {{
                        attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                    }}
                     *  @description Component member for signal.
                     *  @returns     {{
                        attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                    }} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    signal():
                    {
                        /** @name        attribute
                         *  @public
                         *  @type        {KeyframeEditor.Types.Signal<string | null>}
                         *  @description Component member for attribute.
                         *  @param       {string} name Parameter.
                         *  @returns     {KeyframeEditor.Types.Signal<string | null>} Result.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        attribute(name: string): Types.Signal<string | null>;
                    };
                }).signal().attribute('frame-end')?.Peek()) ?? '100', 10) || 100;

                /** @name        start
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned start value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const start = parseInt(((this as unknown as {
                    /** @name        signal
                     *  @public
                     *  @type        {{
                        attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                    }}
                     *  @description Component member for signal.
                     *  @returns     {{
                        attribute(name: string): KeyframeEditor.Types.Signal<string | null>;
                    }} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    signal():
                    {
                        /** @name        attribute
                         *  @public
                         *  @type        {KeyframeEditor.Types.Signal<string | null>}
                         *  @description Component member for attribute.
                         *  @param       {string} name Parameter.
                         *  @returns     {KeyframeEditor.Types.Signal<string | null>} Result.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        attribute(name: string): Types.Signal<string | null>;
                    };
                }).signal().attribute('frame-start')?.Peek()) ?? '0', 10) || 0;
                if (next > end)
                    this.setFrame(start);
                else
                    this.setFrame(next);
                this.#rafId = requestAnimationFrame(tick);
            };
            this.#rafId = requestAnimationFrame(tick);
        }

        /** @name        pause
         *  @public
         *  @type        {void}
         *  @description Component member for pause.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        pause(): void
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
            };
            if (!this.#playing)
                return;
            this.#playing = false;
            self.render().removeAttribute('playing');
            if (this.#rafId)
                cancelAnimationFrame(this.#rafId);
            this.#rafId = 0;
            self.fire('arianna:keyframe-editor-pause', { detail: { source: this }, bubbles: true });
        }

        /** @name        setFps
         *  @public
         *  @type        {this}
         *  @description Component member for set Fps.
         *  @param       {number} fps Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setFps(fps: number): this { this.#fps = Math.max(1, fps); return this; }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { this.pause(); }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {KeyframeEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {KeyframeEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    '--arianna-curve-position': '#4dd0e1',
                    '--arianna-curve-rotation': '#ff9800',
                    '--arianna-curve-scale': '#7eb8f7',
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
                new Rule(':host .kfe-toolbar', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #161616)',
                    borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'flex',
                    gap: '6px',
                    padding: '4px 6px',
                }),
                new Rule(':host .kfe-btn', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.74rem',
                    minWidth: '28px',
                    padding: '3px 6px',
                }),
                new Rule(':host .kfe-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
                new Rule(':host .kfe-frame-input', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    font: 'inherit',
                    fontSize: '0.74rem',
                    padding: '3px 6px',
                    width: '64px',
                }),
                new Rule(':host .kfe-frame-lbl', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.72rem',
                }),
                new Rule(':host .kfe-ruler', {
                    background: 'var(--ar-bg2, #161616)',
                    borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'grid',
                    gridTemplateColumns: 'var(--track-head-width, 160px) 1fr',
                    height: '22px',
                    overflow: 'hidden',
                }),
                new Rule(':host .kfe-ruler-corner', {
                    background: 'var(--ar-bg2, #161616)',
                    borderRight: '1px solid var(--ar-border, #2a2a2a)',
                }),
                new Rule(':host .kfe-ruler-inner', { position: 'relative' }),
                new Rule(':host .kfe-tick', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.66rem',
                    position: 'absolute',
                    top: '4px',
                }),
                new Rule(':host .kfe-body', {
                    display: 'block',
                    maxHeight: '420px',
                    overflow: 'auto',
                }),
                new Rule(':host .kfe-playhead', {
                    background: 'var(--ar-danger, #f44336)',
                    bottom: '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '22px',
                    width: '2px',
                }),
            ]);
        }
    }
}
export default KeyframeEditor;

export type KeyframeEditorOptions = KeyframeEditor.Interfaces.KeyframeEditorOptions;
