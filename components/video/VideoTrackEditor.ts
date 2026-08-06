/**
 * @module    components/video/VideoTrackEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA VideoTrackEditor component module.
 */

import { Component, Css, Reactivity, Templates, Components } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   VideoTrackEditor
 *  @public
 *  @description Namespace containing VideoTrackEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace VideoTrackEditor
{
    /** @name        Signal
     *  @public
     *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
     *  @description Reactive Signal contract used by VideoTrackEditor state.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

    /** @name        Stylesheet
     *  @public
     *  @type        {Css.Stylesheet}
     *  @description Stylesheet contract used by VideoTrackEditor styling.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Stylesheet = Css.Stylesheet;

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   VideoClipContract
         *  @public
         *  @description VideoClipContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface VideoClipContract extends VideoClip
        {
        }

        /** @interface   DragStateContract
         *  @public
         *  @description DragStateContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DragStateContract extends DragState
        {
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const html = Templates.Template.Html;

    /**
     * @convention AriannA component namespace merge
     * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
     */
    /**
     * @module    components/video/VideoTrackEditor
     * @author    Riccardo Angeli
     * @copyright Riccardo Angeli 2012-2026
     * @license   MIT / Commercial (dual license)
     *
     * Timeline-based video editor. Multiple tracks (V1/V2/V3…), clips that can
     * be dragged horizontally to reposition, trimmed at either edge, split at
     * the playhead, and removed. Includes a time ruler, a transport bar, and a
     * draggable playhead.
     *
     *   ┌───────────────────────────────────────────────────────┐
     *   │  ▶ ❙❙ ◼      00:12.4 / 02:30.0   [────────●─────────] │
     *   ├───────────────────────────────────────────────────────┤
     *   │ 0s     5s     10s    15s    20s    25s    30s    35s  │
     *   ├──────────┬───────┬───────────────────────────────────┤
     *   │ V1 │ ▓▓▓▓▓▓▓▓▓▓▓ │  ▓▓▓▓▓▓▓▓▓ │  ▓▓▓▓▓▓▓▓▓▓▓        │
     *   │ V2 │            │ ▓▓▓▓▓▓▓▓▓▓▓ │                     │
     *   └────┴────────────┴─────────────┴─────────────────────┘
     *
     * State-of-the-editor is exposed via `getClips()` / `setClips()` for
     * programmatic save/load. Clip drag/trim uses pointer-capture and signal-
     * driven re-render — no imperative DOM manipulation.
     *
     * @example HTML
     *   <arianna-video-track-editor></arianna-video-track-editor>
     *
     * @example JS
     *   const ed = new VideoTrackEditor();
     *   ed.setClips([
     *     { id: 'c1', track: 0, start: 0,  duration: 5, source: 'intro.mp4', name: 'Intro' },
     *     { id: 'c2', track: 0, start: 5,  duration: 8, source: 'main.mp4',  name: 'Main' },
     *     { id: 'c3', track: 1, start: 2,  duration: 4, source: 'bg.mp4',    name: 'BG' },
     *   ]);
     *   ed.addEventListener('arianna:editor-change', e => save(e.detail.clips));
     *
     * Events:
     *   arianna:editor-change   detail: { clips: VideoClip[] }
     *   arianna:editor-select   detail: { clip: VideoClip | null }
     *   arianna:editor-time     detail: { time: number }
     *
     * Attributes: duration, time, tracks (count), pixels-per-second, snap-ms
     */
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const { Rule, Stylesheet } = Css;

    /** @interface   VideoClip
     *  @public
     *  @description VideoClip contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface VideoClip
    {
        /** @name        id
         *  @public
         *  @type        {string}
         *  @description Component member for id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        id: string;

        /** @name        track
         *  @public
         *  @type        {number}
         *  @description Component member for track.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        track: number;

        /** @name        start
         *  @public
         *  @type        {number}
         *  @description Component member for start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        start: number; // seconds, on timeline
        /** @name        duration
         *  @public
         *  @type        {number}
         *  @description Component member for duration.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        duration: number; // seconds
        /** @name        source
         *  @public
         *  @type        {string}
         *  @description Component member for source.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        source: string; // URL or asset reference
        /** @name        name
         *  @public
         *  @type        {string}
         *  @description Component member for name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        name: string;

        /** Offset inside the source media when trimmed at the left edge. */
        sourceIn?: number;
    }

    /** @interface   DragState
     *  @public
     *  @description DragState contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface DragState
    {
        /** @name        clipId
         *  @public
         *  @type        {string}
         *  @description Component member for clip Id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clipId: string;

        /** @name        mode
         *  @public
         *  @type        {'move' | 'trim-left' | 'trim-right'}
         *  @description Component member for mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        mode: 'move' | 'trim-left' | 'trim-right';

        /** @name        startX
         *  @public
         *  @type        {number}
         *  @description Component member for start X.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        startX: number;

        /** @name        origStart
         *  @public
         *  @type        {number}
         *  @description Component member for orig Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        origStart: number;

        /** @name        origDuration
         *  @public
         *  @type        {number}
         *  @description Component member for orig Duration.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        origDuration: number;

        /** @name        origIn
         *  @public
         *  @type        {number}
         *  @description Component member for orig In.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        origIn: number;
    }

    /** @class       VideoTrackEditor
     *  @public
     *  @description AriannA VideoTrackEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-video-track-editor', {}, {
        Attributes: ['duration', 'time', 'tracks', 'pixels-per-second', 'snap-ms'],
    })
    export class VideoTrackEditor extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible template slot installed by @Component. */
        declare template: unknown;

        /** @name        clips$
         *  @public
         *  @type        {Signal<VideoClip[]>}
         *  @description Component member for clips$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clips$: Signal<VideoClip[]> = signal<VideoClip[]>([]);

        /** @name        selected$
         *  @public
         *  @type        {Signal<string | null>}
         *  @description Component member for selected$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected$: Signal<string | null> = signal<string | null>(null);

        /** @name        time$
         *  @public
         *  @type        {Signal<number>}
         *  @description Component member for time$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        time$: Signal<number> = signal<number>(0);

        /** @name        playing$
         *  @public
         *  @type        {Signal<boolean>}
         *  @description Component member for playing$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        playing$: Signal<boolean> = signal<boolean>(false);

        /** @name        #drag
         *  @public
         *  @type        {DragState | null}
         *  @description Component member for drag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #drag: DragState | null = null;

        /** @name        #rafTimer
         *  @public
         *  @type        {number | null}
         *  @description Component member for raf Timer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #rafTimer: number | null = null;

        /** @name        #formatTime
         *  @public
         *  @static
         *  @type        {string}
         *  @description Component member for format Time.
         *  @param       {number} seconds Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #formatTime(seconds: number): string
        {
            if (!isFinite(seconds) || seconds < 0)
                return '0:00.0';

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = Math.floor(seconds % 60);

            /** @name        m
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned m value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const m = Math.floor(seconds / 60);

            /** @name        tenths
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tenths value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tenths = Math.floor((seconds % 1) * 10);
            return `${m}:${String(s).padStart(2, '0')}.${tenths}`;
        }

        /** @name        #playStart
         *  @public
         *  @type        {number}
         *  @description Component member for play Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #playStart: number = 0;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {object} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: object = {})
        {
            /** @name        durAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned durAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const durAttr = this.signal().attribute('duration');

            /** @name        tracksAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tracksAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tracksAttr = this.signal().attribute('tracks');

            /** @name        ppsAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ppsAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ppsAttr = this.signal().attribute('pixels-per-second');
            this.duration = () => parseFloat(durAttr.Get() ?? '60') || 60;
            this.trackCount = () => parseInt(tracksAttr.Get() ?? '2', 10) || 2;
            this.pps = () => parseFloat(ppsAttr.Get() ?? '20') || 20;
            this.snapMs = () => parseInt(this.getAttribute('snap-ms') ?? '100', 10) || 100;
            this.totalWidth = () => `${this.duration() * this.pps()}px`;
            this.rulerMarks = (): Array<{
                /** @name        label
                 *  @public
                 *  @type        {string}
                 *  @description Component member for label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                label: string;

                /** @name        left
                 *  @public
                 *  @type        {string}
                 *  @description Component member for left.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                left: string;
            }> => {
                /** @name        dur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dur = this.duration();

                /** @name        pps
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pps value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pps = this.pps();

                /** @name        step
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned step value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const step = dur <= 30 ? 1 : dur <= 120 ? 5 : 10;

                /** @name        marks
                 *  @public
                 *  @type        {Array<{
                    label: string;
                    left: string;
                }>}
                 *  @description Namespace-owned marks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const marks: Array<{
                    /** @name        label
                     *  @public
                     *  @type        {string}
                     *  @description Component member for label.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    label: string;

                    /** @name        left
                     *  @public
                     *  @type        {string}
                     *  @description Component member for left.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    left: string;
                }> = [];
                for (let s = 0; s <= dur; s += step)
                {
                    marks.push({ label: `${s}s`, left: `${s * pps}px` });
                }
                return marks;
            };
            this.trackList = (): Array<{
                /** @name        idx
                 *  @public
                 *  @type        {number}
                 *  @description Component member for idx.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                idx: number;

                /** @name        label
                 *  @public
                 *  @type        {string}
                 *  @description Component member for label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                label: string;
            }> => {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = this.trackCount();
                return Array.from({ length: n }, (_, i) => ({ idx: i, label: `V${i + 1}` }));
            };
            this.clipsForTrack = (idx: number): Array<VideoClip & {
                /** @name        left
                 *  @public
                 *  @type        {string}
                 *  @description Component member for left.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                left: string;

                /** @name        width
                 *  @public
                 *  @type        {string}
                 *  @description Component member for width.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                width: string;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;
            }> => {
                /** @name        pps
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pps value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pps = this.pps();

                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();
                return this.clips$.Get()
                    .filter((c: any) => c.track === idx)
                    .map((c: any) => ({
                    ...c,
                    left: `${c.start * pps}px`,
                    width: `${c.duration * pps}px`,
                    cls: 'ar-vte__clip' + (sel === c.id ? ' ar-vte__clip--selected' : ''),
                }));
            };
            this.playheadStyle = () => `left: ${this.time$.Get() * this.pps()}px`;
            this.timeLabel = () => VideoTrackEditor.#formatTime(this.time$.Get());
            this.durLabel = () => VideoTrackEditor.#formatTime(this.duration());
            this.playLabel = () => this.playing$.Get() ? '❙❙' : '▶';
            this.transportPct = () => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.duration();
                return d > 0 ? String((this.time$.Get() / d) * 100) : '0';
            };
            // ── Handlers ────────────────────────────────────────────────────
            this.onPlay = () => {
                if (this.playing$.Get())
                    this.pause();
                else
                    this.play();
            };
            this.onStop = () => {
                this.pause();
                this.seek(0);
            };
            this.onTransportInput = (e: Event) => {
                /** @name        pct
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pct value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pct = parseFloat((e.target as HTMLInputElement).value);
                this.seek((pct / 100) * this.duration());
            };
            this.onClipPointerDown = (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as PointerEvent;

                /** @name        target
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned target value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const target = ev.currentTarget as HTMLElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = target.dataset.id;
                if (!id)
                    return;

                /** @name        clip
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned clip value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const clip = this.clips$.Get().find((c: any) => c.id === id);
                if (!clip)
                    return;
                this.selected$.Set(id);
                this.dispatchEvent(new CustomEvent('arianna:editor-select', {
                    bubbles: true, detail: { clip: { ...clip } },
                }));
                // Pick mode based on hit location within the clip box
                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = target.getBoundingClientRect();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = ev.clientX - rect.left;

                /** @name        mode
                 *  @public
                 *  @type        {DragState['mode']}
                 *  @description Namespace-owned mode value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mode: DragState['mode'] = x < 6 ? 'trim-left'
                    : x > rect.width - 6 ? 'trim-right'
                        : 'move';
                this.#drag = {
                    clipId: id,
                    mode,
                    startX: ev.clientX,
                    origStart: clip.start,
                    origDuration: clip.duration,
                    origIn: clip.sourceIn ?? 0,
                };
                target.setPointerCapture(ev.pointerId);
            };
            this.onClipPointerMove = (e: Event) => {
                if (!this.#drag)
                    return;

                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as PointerEvent;

                /** @name        dx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dx = ev.clientX - this.#drag.startX;

                /** @name        dt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dt = dx / this.pps();

                /** @name        snap
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned snap value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const snap = this.snapMs() / 1000;

                /** @name        snapped
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned snapped value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const snapped = Math.round(dt / snap) * snap;
                this.#applyDrag(snapped);
            };
            this.onClipPointerUp = (e: Event) => {
                if (!this.#drag)
                    return;

                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as PointerEvent;
                (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);
                this.#drag = null;
                this.#fireChange();
            };
            this.onRulerClick = (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as PointerEvent;

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();

                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = ev.clientX - rect.left;
                this.seek(x / this.pps());
            };
            this.onDeleteSelected = () => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();
                if (!sel)
                    return;
                this.clips$.Set(this.clips$.Get().filter((c: any) => c.id !== sel));
                this.selected$.Set(null);
                this.#fireChange();
            };
            this.onSplitAtPlayhead = () => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();

                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = this.time$.Get();

                /** @name        clips
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned clips value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const clips = this.clips$.Get();

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = clips.find((x: any) => x.id === sel);
                if (!c)
                    return;
                if (t <= c.start || t >= c.start + c.duration)
                    return;

                /** @name        cutOffset
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cutOffset value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cutOffset = t - c.start;

                /** @name        left
                 *  @public
                 *  @type        {VideoClip}
                 *  @description Namespace-owned left value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const left: VideoClip = {
                    ...c, duration: cutOffset,
                };

                /** @name        right
                 *  @public
                 *  @type        {VideoClip}
                 *  @description Namespace-owned right value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const right: VideoClip = {
                    ...c,
                    id: `${c.id}-b-${Date.now()}`,
                    start: t,
                    duration: c.duration - cutOffset,
                    sourceIn: (c.sourceIn ?? 0) + cutOffset,
                };
                this.clips$.Set([...clips.filter((x: any) => x.id !== sel), left, right]);
                this.#fireChange();
            };
            this.template = html `
            <div class="ar-vte">
                <div class="ar-vte__transport">
                    <button type="button" class="ar-vte__btn" @click="this.onPlay">{{ this.playLabel() }}</button>
                    <button type="button" class="ar-vte__btn" @click="this.onStop">◼</button>
                    <span class="ar-vte__time">{{ this.timeLabel() }} / {{ this.durLabel() }}</span>
                    <input type="range" class="ar-vte__transport-bar"
                           min="0" max="100" step="0.1"
                           :value="this.transportPct()"
                           @input="this.onTransportInput"/>
                    <button type="button" class="ar-vte__btn" @click="this.onSplitAtPlayhead" title="Split at playhead">⎙</button>
                    <button type="button" class="ar-vte__btn" @click="this.onDeleteSelected" title="Delete selected">✕</button>
                </div>
                <div class="ar-vte__timeline" :style="'--ar-vte-w: ' + this.totalWidth()">
                    <div class="ar-vte__ruler" @click="this.onRulerClick">
                        <span a-for="m in this.rulerMarks()"
                              class="ar-vte__ruler-mark"
                              :style="'left: ' + m.left">{{ m.label }}</span>
                    </div>
                    <div class="ar-vte__tracks">
                        <div a-for="t in this.trackList()" class="ar-vte__track">
                            <span class="ar-vte__track-label">{{ t.label }}</span>
                            <div class="ar-vte__track-lane">
                                <div a-for="c in this.clipsForTrack(t.idx)"
                                     :class="c.cls"
                                     :data-id="c.id"
                                     :style="'left: ' + c.left + '; width: ' + c.width"
                                     @pointerdown="this.onClipPointerDown"
                                     @pointermove="this.onClipPointerMove"
                                     @pointerup="this.onClipPointerUp"
                                     @pointercancel="this.onClipPointerUp">
                                    <div class="ar-vte__clip-handle ar-vte__clip-handle--left"></div>
                                    <span class="ar-vte__clip-label">{{ c.name }}</span>
                                    <div class="ar-vte__clip-handle ar-vte__clip-handle--right"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ar-vte__playhead" :style="this.playheadStyle()"></div>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Stylesheet | null;
            }).Sheet = VideoTrackEditor.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setClips
         *  @public
         *  @type        {this}
         *  @description Component member for set Clips.
         *  @param       {VideoClip[]} clips Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setClips(clips: VideoClip[]): this
        {
            this.clips$.Set(clips.map(c => ({ ...c })));
            this.#fireChange();
            return this;
        }

        /** @name        getClips
         *  @public
         *  @type        {VideoClip[]}
         *  @description Component member for get Clips.
         *  @returns     {VideoClip[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getClips(): VideoClip[] { return this.clips$.Get().map((c: any) => ({ ...c })); }

        /** @name        addClip
         *  @public
         *  @type        {this}
         *  @description Component member for add Clip.
         *  @param       {VideoClip} clip Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addClip(clip: VideoClip): this
        {
            this.clips$.Set([...this.clips$.Get(), { ...clip }]);
            this.#fireChange();
            return this;
        }

        /** @name        removeClip
         *  @public
         *  @type        {this}
         *  @description Component member for remove Clip.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeClip(id: string): this
        {
            this.clips$.Set(this.clips$.Get().filter((c: any) => c.id !== id));
            if (this.selected$.Get() === id)
                this.selected$.Set(null);
            this.#fireChange();
            return this;
        }

        /** @name        seek
         *  @public
         *  @type        {this}
         *  @description Component member for seek.
         *  @param       {number} time Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        seek(time: number): this
        {
            /** @name        clamped
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clamped value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clamped = Math.max(0, Math.min(this.duration(), time));
            this.time$.Set(clamped);
            this.dispatchEvent(new CustomEvent('arianna:editor-time', {
                bubbles: true, detail: { time: clamped },
            }));
            return this;
        }

        /** @name        getTime
         *  @public
         *  @type        {number}
         *  @description Component member for get Time.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getTime(): number { return this.time$.Get(); }

        /** @name        play
         *  @public
         *  @type        {this}
         *  @description Component member for play.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        play(): this
        {
            if (this.playing$.Get())
                return this;
            this.playing$.Set(true);
            this.#playStart = performance.now() - this.time$.Get() * 1000;

            /** @name        tick
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tick value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tick = () => {
                if (!this.playing$.Get())
                    return;

                /** @name        elapsed
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned elapsed value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const elapsed = (performance.now() - this.#playStart) / 1000;
                if (elapsed >= this.duration())
                {
                    this.seek(this.duration());
                    this.pause();
                    return;
                }
                this.seek(elapsed);
                this.#rafTimer = requestAnimationFrame(tick);
            };
            this.#rafTimer = requestAnimationFrame(tick);
            return this;
        }

        /** @name        pause
         *  @public
         *  @type        {this}
         *  @description Component member for pause.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        pause(): this
        {
            this.playing$.Set(false);
            if (this.#rafTimer != null)
            {
                cancelAnimationFrame(this.#rafTimer);
                this.#rafTimer = null;
            }
            return this;
        }
        // ── Internal ─────────────────────────────────────────────────────────────
        /** @name        #applyDrag
         *  @public
         *  @type        {void}
         *  @description Component member for apply Drag.
         *  @param       {number} snappedDt Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #applyDrag(snappedDt: number): void
        {
            if (!this.#drag)
                return;

            /** @name        d
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned d value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const d = this.#drag;

            /** @name        clips
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clips value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clips = this.clips$.Get();

            /** @name        idx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned idx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const idx = clips.findIndex((c: any) => c.id === d.clipId);
            if (idx < 0)
                return;

            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = clips[idx]!;

            /** @name        dur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dur = this.duration();

            /** @name        next
             *  @public
             *  @type        {VideoClip}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let next: VideoClip;
            switch (d.mode)
            {
                case 'move': {
                    /** @name        start
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned start value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const start = Math.max(0, Math.min(dur - d.origDuration, d.origStart + snappedDt));
                    next = { ...c, start };
                    break;
                }
                case 'trim-left': {
                    /** @name        minStart
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned minStart value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const minStart = Math.max(0, d.origStart - d.origIn);

                    /** @name        maxStart
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned maxStart value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const maxStart = d.origStart + d.origDuration - 0.1;

                    /** @name        start
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned start value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const start = Math.max(minStart, Math.min(maxStart, d.origStart + snappedDt));

                    /** @name        delta
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned delta value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const delta = start - d.origStart;
                    next = {
                        ...c,
                        start,
                        duration: d.origDuration - delta,
                        sourceIn: d.origIn + delta,
                    };
                    break;
                }
                case 'trim-right': {
                    /** @name        duration
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned duration value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const duration = Math.max(0.1, Math.min(dur - d.origStart, d.origDuration + snappedDt));
                    next = { ...c, duration };
                    break;
                }
            }

            /** @name        out
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned out value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const out = clips.slice();
            out[idx] = next;
            this.clips$.Set(out);
        }

        /** @name        #fireChange
         *  @public
         *  @type        {void}
         *  @description Component member for fire Change.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fireChange(): void
        {
            this.dispatchEvent(new CustomEvent('arianna:editor-change', {
                bubbles: true, detail: { clips: this.getClips() },
            }));
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

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
            if (this.#rafTimer != null)
                cancelAnimationFrame(this.#rafTimer);
        }

        /** @name        duration
         *  @private
         *  @type        {() => number}
         *  @description Component member for duration.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private duration: () => number = () => 60;

        /** @name        trackCount
         *  @private
         *  @type        {() => number}
         *  @description Component member for track Count.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private trackCount: () => number = () => 2;

        /** @name        pps
         *  @private
         *  @type        {() => number}
         *  @description Component member for pps.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private pps: () => number = () => 20;

        /** @name        snapMs
         *  @private
         *  @type        {() => number}
         *  @description Component member for snap Ms.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private snapMs: () => number = () => 100;

        /** @name        totalWidth
         *  @private
         *  @type        {() => string}
         *  @description Component member for total Width.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private totalWidth: () => string = () => '1200px';

        /** @name        rulerMarks
         *  @private
         *  @type        {() => Array<{
            label: string;
            left: string;
        }>}
         *  @description Component member for ruler Marks.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private rulerMarks: () => Array<{
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        left
             *  @public
             *  @type        {string}
             *  @description Component member for left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            left: string;
        }> = () => [];

        /** @name        trackList
         *  @private
         *  @type        {() => Array<{
            idx: number;
            label: string;
        }>}
         *  @description Component member for track List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private trackList: () => Array<{
            /** @name        idx
             *  @public
             *  @type        {number}
             *  @description Component member for idx.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            idx: number;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;
        }> = () => [];

        /** @name        clipsForTrack
         *  @private
         *  @type        {(idx: number) => Array<VideoClip & {
            left: string;
            width: string;
            cls: string;
        }>}
         *  @description Component member for clips For Track.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private clipsForTrack: (idx: number) => Array<VideoClip & {
            /** @name        left
             *  @public
             *  @type        {string}
             *  @description Component member for left.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            left: string;

            /** @name        width
             *  @public
             *  @type        {string}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }> = () => [];

        /** @name        playheadStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for playhead Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private playheadStyle: () => string = () => 'left: 0';

        /** @name        timeLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for time Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private timeLabel: () => string = () => '0:00.0';

        /** @name        durLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for dur Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private durLabel: () => string = () => '0:00.0';

        /** @name        playLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for play Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private playLabel: () => string = () => '▶';

        /** @name        transportPct
         *  @private
         *  @type        {() => string}
         *  @description Component member for transport Pct.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private transportPct: () => string = () => '0';

        /** @name        onPlay
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Play.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPlay: (e: Event) => void = () => { };

        /** @name        onStop
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Stop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onStop: (e: Event) => void = () => { };

        /** @name        onTransportInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Transport Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onTransportInput: (e: Event) => void = () => { };

        /** @name        onClipPointerDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Clip Pointer Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClipPointerDown: (e: Event) => void = () => { };

        /** @name        onClipPointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Clip Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClipPointerMove: (e: Event) => void = () => { };

        /** @name        onClipPointerUp
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Clip Pointer Up.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClipPointerUp: (e: Event) => void = () => { };

        /** @name        onRulerClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Ruler Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRulerClick: (e: Event) => void = () => { };

        /** @name        onDeleteSelected
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Delete Selected.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDeleteSelected: (e: Event) => void = () => { };

        /** @name        onSplitAtPlayhead
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Split At Playhead.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSplitAtPlayhead: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    color: 'var(--arianna-text, #1f2328)',
                    background: 'var(--arianna-bg-2, #ebebeb)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    overflow: 'hidden',
                }),
                new Rule('.ar-vte', { display: 'flex', flexDirection: 'column' }),
                new Rule('.ar-vte__transport', {
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-vte__btn', {
                    width: '28px', height: '24px',
                    background: 'transparent',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px',
                }),
                new Rule('.ar-vte__btn:hover', { background: 'var(--arianna-bg-2, #ebebeb)' }),
                new Rule('.ar-vte__time', {
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '11px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    minWidth: '110px',
                }),
                new Rule('.ar-vte__transport-bar', { flex: '1', minWidth: '0' }),
                new Rule('.ar-vte__timeline', {
                    position: 'relative',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                }),
                new Rule('.ar-vte__ruler', {
                    position: 'relative',
                    height: '20px',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    cursor: 'pointer',
                    minWidth: 'var(--ar-vte-w, 1200px)',
                }),
                new Rule('.ar-vte__ruler-mark', {
                    position: 'absolute',
                    top: '2px',
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontFamily: 'ui-monospace, monospace',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                }),
                new Rule('.ar-vte__ruler-mark::before', {
                    content: '""',
                    position: 'absolute',
                    bottom: '-3px',
                    left: '50%',
                    width: '1px', height: '3px',
                    background: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-vte__tracks', {
                    display: 'flex', flexDirection: 'column',
                    minWidth: 'var(--ar-vte-w, 1200px)',
                }),
                new Rule('.ar-vte__track', {
                    display: 'flex',
                    height: '36px',
                    borderBottom: '1px solid var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-vte__track-label', {
                    width: '32px',
                    flexShrink: '0',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderRight: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontWeight: '600',
                    position: 'sticky',
                    left: '0',
                    zIndex: '2',
                }),
                new Rule('.ar-vte__track-lane', {
                    flex: '1',
                    position: 'relative',
                    background: 'var(--arianna-bg, #fff)',
                }),
                new Rule('.ar-vte__clip', {
                    position: 'absolute',
                    top: '4px', bottom: '4px',
                    background: 'linear-gradient(180deg, rgba(31,111,235,0.7) 0%, rgba(31,111,235,0.5) 100%)',
                    border: '1px solid var(--arianna-primary, #1f6feb)',
                    borderRadius: '3px',
                    color: '#fff',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    cursor: 'grab',
                    overflow: 'hidden',
                    userSelect: 'none',
                }),
                new Rule('.ar-vte__clip:active', { cursor: 'grabbing' }),
                new Rule('.ar-vte__clip--selected', {
                    background: 'linear-gradient(180deg, rgba(255,128,0,0.7) 0%, rgba(255,128,0,0.5) 100%)',
                    border: '1px solid #ff8000',
                    boxShadow: '0 0 0 2px rgba(255,128,0,0.3)',
                }),
                new Rule('.ar-vte__clip-handle', {
                    position: 'absolute', top: '0', bottom: '0',
                    width: '6px',
                    cursor: 'ew-resize',
                }),
                new Rule('.ar-vte__clip-handle--left', { left: '0' }),
                new Rule('.ar-vte__clip-handle--right', { right: '0' }),
                new Rule('.ar-vte__clip-label', {
                    flex: '1',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }),
                new Rule('.ar-vte__playhead', {
                    position: 'absolute',
                    top: '0', bottom: '0',
                    width: '2px',
                    background: '#ff0000',
                    pointerEvents: 'none',
                    zIndex: '3',
                }),
                new Rule('input[type="range"]', { accentColor: 'var(--arianna-primary, #1f6feb)' }),
            ]);
        }
    }
}
export default VideoTrackEditor;
