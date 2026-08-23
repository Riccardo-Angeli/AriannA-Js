/**
     * @module    components/animations/AnimTrack
     * @author    Riccardo Angeli
     * @copyright Riccardo Angeli 2012-2026
     *
     * AnimTrack — one channel of a KeyframeEditor (e.g. "X Location",
     * "W Quaternion Rotation"). Contains Keyframe children placed along
     * the timeline.
     *
     *   <arianna-anim-track name="X Location" channel="loc-x" group="position">
     *     <arianna-keyframe frame="0"  value="0"></arianna-keyframe>
     *     <arianna-keyframe frame="24" value="5"></arianna-keyframe>
     *   </arianna-anim-track>
     *
     *   const tr = new AnimTrack({ name: 'X Location', channel: 'loc-x', group: 'position' });
     *   tr.addKeyframe(new Keyframe({ frame: 0,  value: 0 }));
     *   tr.addKeyframe(new Keyframe({ frame: 24, value: 5 }));
     *
     * `group` is used by CurveEditor to colour curves consistently
     * (e.g. all position channels in cyan, all rotation channels in orange).
     *
     * Events:
     *   arianna:track-mute   { track, value }
     *   arianna:track-lock   { track, value }
     *   arianna:track-hidden { track, value }
     */
import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Keyframe } from './Keyframe.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   AnimTrack
 *  @public
 *  @description Namespace containing AnimTrack contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AnimTrack
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

        /** @name        ChannelGroup
         *  @public
         *  @type        {'position' | 'rotation' | 'scale' | 'custom'}
         *  @description Type alias for ChannelGroup.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ChannelGroup = 'position' | 'rotation' | 'scale' | 'custom';

        /** @name        AnimTrackOptions
         *  @public
         *  @type        {AnimTrack.Interfaces.AnimTrackOptions}
         *  @description Type alias for AnimTrackOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AnimTrackOptions = Interfaces.AnimTrackOptions;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   AnimTrackOptions
         *  @public
         *  @description AnimTrackOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AnimTrackOptions
        {
            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name?: string;

            /** @name        channel
             *  @public
             *  @type        {string}
             *  @description Component member for channel.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            channel?: string;

            /** @name        group
             *  @public
             *  @type        {AnimTrack.Types.ChannelGroup}
             *  @description Component member for group.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            group?: Types.ChannelGroup;

            /** @name        muted
             *  @public
             *  @type        {boolean}
             *  @description Component member for muted.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            muted?: boolean;

            /** @name        locked
             *  @public
             *  @type        {boolean}
             *  @description Component member for locked.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            locked?: boolean;

            /** @name        hidden
             *  @public
             *  @type        {boolean}
             *  @description Component member for hidden.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hidden?: boolean;
        }

        /** @interface   Options
         *  @public
         *  @description Options contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options extends Interfaces.AnimTrackOptions {
        }
    }
    
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
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

    /** @class       AnimTrack
     *  @public
     *  @description AriannA AnimTrack component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-anim-track', {}, {
        Attributes: ['name', 'channel', 'group', 'muted', 'locked', 'hidden'],
        bus: 'arianna-keyframe-editor',
    })
    export class AnimTrack extends HTMLElement
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

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {AnimTrack.Interfaces.AnimTrackOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.AnimTrackOptions = {}) {
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
            if (opts.channel)
                el.setAttribute('channel', opts.channel);
            if (opts.group)
                el.setAttribute('group', opts.group);
            if (opts.muted)
                el.setAttribute('muted', '');
            if (opts.locked)
                el.setAttribute('locked', '');
            if (opts.hidden)
                el.setAttribute('hidden', '');
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
                    attribute(name: string): AnimTrack.Types.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): AnimTrack.Types.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal(): {
                    /** @name        attribute
                     *  @public
                     *  @type        {AnimTrack.Types.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {AnimTrack.Types.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): Types.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {AnimTrack.Types.Stylesheet | null}
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
            // Track header (left column inside the editor grid)
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
            effect(() => { name.textContent = sName?.Get() ?? 'Channel'; });

            /** @name        btnMute
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnMute value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnMute = document.createElement('button');
            btnMute.type = 'button';
            btnMute.className = 'at-icon at-mute';
            btnMute.title = 'mute';
            btnMute.textContent = '◉';

            /** @name        btnHide
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnHide value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnHide = document.createElement('button');
            btnHide.type = 'button';
            btnHide.className = 'at-icon at-hide';
            btnHide.title = 'hide';
            btnHide.textContent = '◎';

            /** @name        btnLock
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned btnLock value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const btnLock = document.createElement('button');
            btnLock.type = 'button';
            btnLock.className = 'at-icon at-lock';
            btnLock.title = 'lock';
            btnLock.textContent = '⚿';
            head.append(name, btnMute, btnHide, btnLock);
            // Track lane (right column — where keyframes are positioned)
            /** @name        lane
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lane value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lane = document.createElement('div');
            lane.className = 'at-lane';
            // Group dot (color marker — set by CSS variable picked by 'group' attr)
            /** @name        groupDot
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned groupDot value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const groupDot = document.createElement('span');
            groupDot.className = 'at-group-dot';
            head.insertBefore(groupDot, name);
            // Migrate any pre-existing arianna-keyframe children into the lane
            Array.from(el.querySelectorAll('arianna-keyframe'))
                .forEach(kf => lane.appendChild(kf));
            el.appendChild(head);
            el.appendChild(lane);
            // Reactive group-class
            /** @name        sGroup
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sGroup value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sGroup = self.signal().attribute('group');
            effect(() => {
                /** @name        g
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned g value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const g = sGroup?.Get() ?? 'custom';
                el.dataset.group = g;
            });
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
            btnHide.addEventListener('click', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = !el.hasAttribute('hidden');
                if (v)
                    el.setAttribute('hidden', '');
                else
                    el.removeAttribute('hidden');
                self.fire('arianna:track-hidden', { detail: { track: this, value: v, source: this }, bubbles: true });
            });
            btnLock.addEventListener('click', () => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = !el.hasAttribute('locked');
                if (v)
                    el.setAttribute('locked', '');
                else
                    el.removeAttribute('locked');
                self.fire('arianna:track-lock', { detail: { track: this, value: v, source: this }, bubbles: true });
            });
            effect(() => { btnMute.classList.toggle('active', el.hasAttribute('muted')); });
            effect(() => { btnHide.classList.toggle('active', el.hasAttribute('hidden')); });
            effect(() => { btnLock.classList.toggle('active', el.hasAttribute('locked')); });
            self.Sheet = AnimTrack.DefaultSheet();
        }

        /** Append a Keyframe to this track. */
        addKeyframe(kf: Keyframe.Keyframe): this {
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

            /** @name        kfEl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned kfEl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const kfEl = (kf as unknown as {
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
            lane.appendChild(kfEl);
            return this;
        }

        /** All keyframes on this track. */
        getKeyframes(): Keyframe.Keyframe[] {
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
                 *  @type        {unknown[]}
                 *  @description Component member for _children.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                _children?: unknown[];
            };
            return (self._children ?? []) as Keyframe.Keyframe[];
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AnimTrack.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AnimTrack.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet {
            return new Stylesheet([
                new Rule(':host', {
                    borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'grid',
                    gridTemplateColumns: 'var(--track-head-width, 160px) 1fr',
                    height: 'var(--track-height, 22px)',
                    position: 'relative',
                }),
                new Rule(':host([hidden])', { opacity: '0.35' }),
                new Rule(':host .at-head', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #161616)',
                    borderRight: '1px solid var(--ar-border, #2a2a2a)',
                    display: 'flex',
                    gap: '4px',
                    paddingLeft: '6px',
                    paddingRight: '4px',
                }),
                new Rule(':host .at-group-dot', {
                    background: 'var(--ar-muted, #888)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    flexShrink: '0',
                    height: '8px',
                    width: '8px',
                }),
                new Rule(":host([data-group='position']) .at-group-dot", { background: 'var(--arianna-curve-position, #4dd0e1)' }),
                new Rule(":host([data-group='rotation']) .at-group-dot", { background: 'var(--arianna-curve-rotation, #ff9800)' }),
                new Rule(":host([data-group='scale'])    .at-group-dot", { background: 'var(--arianna-curve-scale,    #7eb8f7)' }),
                new Rule(':host .at-name', {
                    color: 'var(--ar-text, #e0e0e0)',
                    flex: '1',
                    fontSize: '0.74rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host .at-icon', {
                    background: 'transparent',
                    border: '0',
                    color: 'var(--ar-muted, #888)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.85rem',
                    lineHeight: '1',
                    padding: '0 2px',
                }),
                new Rule(':host .at-icon.active', { color: 'var(--ar-warning, #ff9800)' }),
                new Rule(':host .at-icon:hover', { color: 'var(--ar-text, #e0e0e0)' }),
                new Rule(':host .at-lane', {
                    background: 'transparent',
                    backgroundImage: 'linear-gradient(to right, var(--ar-border, #2a2a2a) 1px, transparent 1px)',
                    backgroundSize: 'var(--frame-step-px, 70px) 100%',
                    position: 'relative',
                }),
                new Rule(':host([muted]) .at-lane', { opacity: '0.4' }),
            ]);
        }
    }
}

export default AnimTrack;

export type ChannelGroup = AnimTrack.Types.ChannelGroup;

export type AnimTrackOptions = AnimTrack.Types.AnimTrackOptions;
