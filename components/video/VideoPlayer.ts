/**
 * @module    components/video/VideoPlayer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA VideoPlayer component module.
 */

import { Component, Css, Reactivity, Templates, Components } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   VideoPlayer
 *  @public
 *  @description Namespace containing VideoPlayer contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace VideoPlayer
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

        /** @name        VideoProvider
         *  @public
         *  @type        {'native' | 'youtube' | 'twitch' | 'vimeo'}
         *  @description Type alias for VideoProvider.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type VideoProvider = 'native' | 'youtube' | 'twitch' | 'vimeo';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ProviderInfo
         *  @public
         *  @description ProviderInfo contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ProviderInfo
        {
            /** @name        provider
             *  @public
             *  @type        {VideoPlayer.Types.VideoProvider}
             *  @description Component member for provider.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            provider: Types.VideoProvider;

            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        embed
             *  @public
             *  @type        {string}
             *  @description Component member for embed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            embed: string;
        }

        /** @interface   VideoPlayerOptions
         *  @public
         *  @description VideoPlayerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface VideoPlayerOptions
        {
            /** @name        Source
             *  @public
             *  @type        {string}
             *  @description Component member for Source.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Source?: string;

            /** @name        src
             *  @public
             *  @type        {string}
             *  @description Component member for src.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            src?: string; // legacy
            /** @name        poster
             *  @public
             *  @type        {string}
             *  @description Component member for poster.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            poster?: string;

            /** @name        loop
             *  @public
             *  @type        {boolean}
             *  @description Component member for loop.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            loop?: boolean;

            /** @name        volume
             *  @public
             *  @type        {number}
             *  @description Component member for volume.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            volume?: number;

            /** @name        autoplay
             *  @public
             *  @type        {boolean}
             *  @description Component member for autoplay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            autoplay?: boolean;

            /** @name        showControls
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Controls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showControls?: boolean;

            /** @name        aspectRatio
             *  @public
             *  @type        {string}
             *  @description Component member for aspect Ratio.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            aspectRatio?: string;

            /** @name        twitchParent
             *  @public
             *  @type        {string | string[]}
             *  @description Component member for twitch Parent.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            twitchParent?: string | string[];
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
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
    // ── Provider detection ──────────────────────────────────────────────────────
    export function resolveTwitchParents(override?: string | string[]): string[] {
        if (override !== undefined)
        {
            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = Array.isArray(override) ? override : [override];

            /** @name        cleaned
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cleaned value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cleaned = list.map(s => s.trim()).filter(Boolean);
            if (cleaned.length > 0)
                return cleaned;
        }

        /** @name        host
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned host value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const host = (typeof location !== 'undefined' && location.hostname) || '';
        return host ? [host] : ['localhost'];
    }
    export function detectVideoProvider(url: string, twitchParent?: string | string[]): Interfaces.ProviderInfo | null {
        if (!url)
            return null;
        // YouTube
        /** @name        m
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned m value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let m = url.match(/^https?:\/\/(?:www\.)?youtu\.be\/([\w-]{6,})/i);
        if (m)
            return ytEmbed(m[1]!);
        m = url.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{6,})/i);
        if (m)
            return ytEmbed(m[1]!);
        m = url.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:shorts|embed|v)\/([\w-]{6,})/i);
        if (m)
            return ytEmbed(m[1]!);
        // Vimeo
        m = url.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d{6,})/i);
        if (m)
            return vimeoEmbed(m[1]!);
        m = url.match(/^https?:\/\/player\.vimeo\.com\/video\/(\d{6,})/i);
        if (m)
            return vimeoEmbed(m[1]!);
        // Twitch
        /** @name        parents
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned parents value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const parents = resolveTwitchParents(twitchParent);
        m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/i);
        if (m)
            return twitchEmbed('video', m[1]!, parents);
        m = url.match(/^https?:\/\/clips\.twitch\.tv\/([\w-]+)/i);
        if (m)
            return twitchEmbed('clip', m[1]!, parents);
        m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([\w-]+)\/clip\/([\w-]+)/i);
        if (m)
            return twitchEmbed('clip', m[2]!, parents);
        m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]{3,})$/i);
        if (m)
            return twitchEmbed('channel', m[1]!, parents);
        return null; // → native
    }
    export function ytEmbed(id: string): Interfaces.ProviderInfo {
        return { provider: 'youtube', id,
            embed: `https://www.youtube.com/embed/${id}?enablejsapi=1&playsinline=1&rel=0` };
    }
    export function vimeoEmbed(id: string): Interfaces.ProviderInfo {
        return { provider: 'vimeo', id,
            embed: `https://player.vimeo.com/video/${id}?api=1` };
    }
    export function twitchEmbed(kind: 'video' | 'clip' | 'channel', id: string, parents: string[]): Interfaces.ProviderInfo {
        /** @name        base
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned base value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const base = kind === 'clip' ? 'https://clips.twitch.tv/embed' : 'https://player.twitch.tv';

        /** @name        param
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned param value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const param = kind === 'clip' ? 'clip=' : kind === 'channel' ? 'channel=' : 'video=';

        /** @name        parentParams
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned parentParams value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const parentParams = parents.map(p => `&parent=${encodeURIComponent(p)}`).join('');
        return {
            provider: 'twitch', id,
            embed: `${base}/?${param}${encodeURIComponent(id)}${parentParams}`,
        };
    }

    /** @name        ResolveTwitchParents
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ResolveTwitchParents value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const ResolveTwitchParents = resolveTwitchParents;

    /** @name        DetectVideoProvider
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned DetectVideoProvider value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DetectVideoProvider = detectVideoProvider;

    /** @name        YtEmbed
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned YtEmbed value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const YtEmbed = ytEmbed;

    /** @name        VimeoEmbed
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned VimeoEmbed value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const VimeoEmbed = vimeoEmbed;

    /** @name        TwitchEmbed
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned TwitchEmbed value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const TwitchEmbed = twitchEmbed;
    // ── Component ───────────────────────────────────────────────────────────────
    /** @class       VideoPlayer
     *  @public
     *  @description AriannA VideoPlayer component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-video-player', {}, {
        Attributes: ['source', 'src', 'poster', 'loop', 'volume', 'autoplay',
            'show-controls', 'aspect-ratio', 'twitch-parent'],
    })
    export class VideoPlayer extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible template slot installed by @Component. */
        declare template: unknown;

        /** @name        provider$
         *  @public
         *  @type        {VideoPlayer.Types.Signal<VideoPlayer.Types.VideoProvider>}
         *  @description Component member for provider$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        provider$: Types.Signal<Types.VideoProvider> = signal<Types.VideoProvider>('native');

        /** @name        playing$
         *  @public
         *  @type        {VideoPlayer.Types.Signal<boolean>}
         *  @description Component member for playing$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        playing$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        curTime$
         *  @public
         *  @type        {VideoPlayer.Types.Signal<number>}
         *  @description Component member for cur Time$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        curTime$: Types.Signal<number> = signal<number>(0);

        /** @name        duration$
         *  @public
         *  @type        {VideoPlayer.Types.Signal<number>}
         *  @description Component member for duration$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        duration$: Types.Signal<number> = signal<number>(0);

        /** @name        volume$
         *  @public
         *  @type        {VideoPlayer.Types.Signal<number>}
         *  @description Component member for volume$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        volume$: Types.Signal<number> = signal<number>(1);

        /** @name        muted$
         *  @public
         *  @type        {VideoPlayer.Types.Signal<boolean>}
         *  @description Component member for muted$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        muted$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        #video
         *  @public
         *  @type        {HTMLVideoElement}
         *  @description Component member for video.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #video?: HTMLVideoElement;

        /** @name        #iframe
         *  @public
         *  @type        {HTMLIFrameElement}
         *  @description Component member for iframe.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #iframe?: HTMLIFrameElement;

        /** @name        #source
         *  @public
         *  @type        {string}
         *  @description Component member for source.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #source: string = '';

        /** @name        #embed
         *  @public
         *  @type        {string}
         *  @description Component member for embed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #embed: string = '';

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
                return '0:00';

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
            const m = Math.floor(seconds / 60) % 60;

            /** @name        h
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned h value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const h = Math.floor(seconds / 3600);

            /** @name        pad
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pad value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pad = (n: number) => String(n).padStart(2, '0');
            return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {VideoPlayer.Interfaces.VideoPlayerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.VideoPlayerOptions = {})
        {
            /** @name        sourceAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sourceAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sourceAttr = this.signal().attribute('source');

            /** @name        legacySrcAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned legacySrcAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const legacySrcAttr = this.signal().attribute('src');

            /** @name        posterAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned posterAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const posterAttr = this.signal().attribute('poster');

            /** @name        aspectAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned aspectAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const aspectAttr = this.signal().attribute('aspect-ratio');
            this.stageStyle = () => {
                /** @name        ar
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ar value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ar = aspectAttr.Get() ?? '16/9';
                return `aspect-ratio: ${ar}`;
            };
            this.isNative = () => this.provider$.Get() === 'native';
            this.isEmbed = () => this.provider$.Get() !== 'native';
            this.embedSrc = () => this.#embed;
            this.nativeSrc = () => this.#source;
            this.posterSrc = () => posterAttr.Get() ?? '';
            this.timeLabel = () => VideoPlayer.#formatTime(this.curTime$.Get());
            this.durLabel = () => VideoPlayer.#formatTime(this.duration$.Get());
            this.playLabel = () => this.playing$.Get() ? '❙❙' : '▶';
            this.seekValue = () => {
                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.duration$.Get();
                return d > 0 ? String((this.curTime$.Get() / d) * 100) : '0';
            };
            this.volValue = () => String(this.volume$.Get() * 100);
            this.showControls = () => this.getAttribute('show-controls') !== 'false';
            // ── Handlers ────────────────────────────────────────────────────
            this.onPlayClick = () => {
                if (this.playing$.Get())
                    this.pause();
                else
                    this.play();
            };
            this.onSeekInput = (e: Event) => {
                /** @name        pct
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pct value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pct = parseFloat((e.target as HTMLInputElement).value);

                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = this.duration$.Get();
                if (d > 0)
                    this.seek((pct / 100) * d);
            };
            this.onVolInput = (e: Event) => {
                /** @name        pct
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pct value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pct = parseFloat((e.target as HTMLInputElement).value);
                this.setVolume(pct / 100);
            };
            this.onFullscreen = () => { void this.toggleFullscreen(); };
            // Source signal: re-detect provider on attr change. effect() runs
            // whenever any signal it reads (.Get()) changes — we read both
            // primary `source` and legacy `src`.
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = sourceAttr.Get();
                if (v)
                    this.setSource(v);
            });
            effect(() => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = legacySrcAttr.Get();
                if (v && !sourceAttr.Peek())
                    this.setSource(v);
            });
            this.template = html `
            <div class="ar-vp">
                <div class="ar-vp__stage" :style="this.stageStyle()">
                    <video a-if="this.isNative()" data-r="video"
                           :src="this.nativeSrc()"
                           :poster="this.posterSrc()"
                           playsinline></video>
                    <iframe a-if="this.isEmbed()" data-r="iframe"
                            :src="this.embedSrc()"
                            allowfullscreen
                            allow="autoplay; fullscreen; picture-in-picture"
                            frameborder="0"></iframe>
                </div>
                <div class="ar-vp__controls" a-if="this.showControls()">
                    <button type="button" class="ar-vp__play" @click="this.onPlayClick">{{ this.playLabel() }}</button>
                    <span class="ar-vp__time">{{ this.timeLabel() }}</span>
                    <input type="range" class="ar-vp__seek" min="0" max="100" step="0.1"
                           :value="this.seekValue()"
                           @input="this.onSeekInput"/>
                    <span class="ar-vp__dur">{{ this.durLabel() }}</span>
                    <input type="range" class="ar-vp__vol" min="0" max="100"
                           :value="this.volValue()"
                           @input="this.onVolInput"/>
                    <button type="button" class="ar-vp__fs" @click="this.onFullscreen">⛶</button>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {VideoPlayer.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = VideoPlayer.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setSource
         *  @public
         *  @type        {this}
         *  @description Component member for set Source.
         *  @param       {string} url Parameter.
         *  @param       {string | string[]} twitchParent Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setSource(url: string, twitchParent?: string | string[]): this
        {
            this.#source = url;

            /** @name        tp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tp = twitchParent ?? this.getAttribute('twitch-parent') ?? undefined;

            /** @name        info
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned info value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const info = detectVideoProvider(url, tp);
            if (info)
            {
                this.provider$.Set(info.provider);
                this.#embed = info.embed;
            }
            else
            {
                this.provider$.Set('native');
                this.#embed = '';
            }
            this.dispatchEvent(new CustomEvent('arianna:video-source', {
                bubbles: true, detail: { source: url, provider: this.provider$.Get() },
            }));
            return this;
        }

        /** @name        getSource
         *  @public
         *  @type        {string}
         *  @description Component member for get Source.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getSource(): string { return this.#source; }

        /** @name        getProvider
         *  @public
         *  @type        {VideoPlayer.Types.VideoProvider}
         *  @description Component member for get Provider.
         *  @returns     {VideoPlayer.Types.VideoProvider} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getProvider(): Types.VideoProvider { return this.provider$.Get(); }

        /** @name        play
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for play.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async play(): Promise<void>
        {
            if (this.provider$.Get() === 'native')
            {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = this.#getVideo();
                if (v)
                {
                    try
                    {
                        await v.play();
                    }
                    catch (err)
                    {
                        console.warn('VideoPlayer.play():', err);
                    }
                }
            }
            else
            {
                this.#postIframe(this.provider$.Get(), 'play');
            }
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
            if (this.provider$.Get() === 'native')
            {
                this.#getVideo()?.pause();
            }
            else
            {
                this.#postIframe(this.provider$.Get(), 'pause');
            }
        }

        /** @name        seek
         *  @public
         *  @type        {void}
         *  @description Component member for seek.
         *  @param       {number} seconds Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        seek(seconds: number): void
        {
            if (this.provider$.Get() === 'native')
            {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = this.#getVideo();
                if (v)
                    v.currentTime = seconds;
            }
            else
            {
                this.#postIframe(this.provider$.Get(), 'seek', seconds);
            }
            this.curTime$.Set(seconds);
        }

        /** @name        setVolume
         *  @public
         *  @type        {void}
         *  @description Component member for set Volume.
         *  @param       {number} v Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setVolume(v: number): void
        {
            /** @name        clamped
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clamped value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clamped = Math.max(0, Math.min(1, v));
            this.volume$.Set(clamped);

            /** @name        video
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned video value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const video = this.#getVideo();
            if (video)
                video.volume = clamped;
            else
                this.#postIframe(this.provider$.Get(), 'volume', clamped);
        }

        /** @name        getVolume
         *  @public
         *  @type        {number}
         *  @description Component member for get Volume.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getVolume(): number { return this.volume$.Get(); }

        /** @name        toggleFullscreen
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for toggle Fullscreen.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async toggleFullscreen(): Promise<void>
        {
            if (document.fullscreenElement)
            {
                await document.exitFullscreen().catch(() => undefined);
            }
            else
            {
                try
                {
                    await this.requestFullscreen();
                }
                catch { /* ignore */ }
            }
        }
        // ── Internal ─────────────────────────────────────────────────────────────
        /** @name        #getVideo
         *  @public
         *  @type        {HTMLVideoElement | null}
         *  @description Component member for get Video.
         *  @returns     {HTMLVideoElement | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #getVideo(): HTMLVideoElement | null
        {
            return this.querySelector<HTMLVideoElement>('[data-r="video"]');
        }

        /** @name        #postIframe
         *  @public
         *  @type        {void}
         *  @description Component member for post Iframe.
         *  @param       {VideoPlayer.Types.VideoProvider} provider Parameter.
         *  @param       {string} command Parameter.
         *  @param       {number} value Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #postIframe(provider: Types.VideoProvider, command: string, value?: number): void
        {
            /** @name        iframe
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned iframe value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const iframe = this.querySelector<HTMLIFrameElement>('[data-r="iframe"]');
            if (!iframe || !iframe.contentWindow)
                return;

            /** @name        message
             *  @public
             *  @type        {unknown}
             *  @description Namespace-owned message value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let message: unknown = null;
            if (provider === 'youtube')
            {
                /** @name        funcMap
                 *  @public
                 *  @type        {Record<string, string>}
                 *  @description Namespace-owned funcMap value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const funcMap: Record<string, string> = {
                    play: 'playVideo', pause: 'pauseVideo',
                    seek: 'seekTo', volume: 'setVolume',
                };

                /** @name        func
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned func value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const func = funcMap[command];
                if (!func)
                    return;
                message = JSON.stringify({
                    event: 'command', func,
                    args: command === 'volume' && value != null ? [value * 100]
                        : value != null ? [value] : [],
                });
                iframe.contentWindow.postMessage(message, '*');
            }
            else if (provider === 'vimeo')
            {
                /** @name        methodMap
                 *  @public
                 *  @type        {Record<string, string>}
                 *  @description Namespace-owned methodMap value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const methodMap: Record<string, string> = {
                    play: 'play', pause: 'pause',
                    seek: 'setCurrentTime', volume: 'setVolume',
                };

                /** @name        method
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned method value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const method = methodMap[command];
                if (!method)
                    return;
                message = JSON.stringify({ method, value });
                iframe.contentWindow.postMessage(message, '*');
            }
            else if (provider === 'twitch')
            {
                // Twitch's documented API needs a separate `Twitch.Embed` JS object.
                // postMessage doesn't expose a public command surface.
                console.warn('VideoPlayer: programmatic control of Twitch embeds requires the Twitch Embed JS API.');
            }
        }

        /** @name        #wireNativeListeners
         *  @public
         *  @type        {void}
         *  @description Component member for wire Native Listeners.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #wireNativeListeners(): void
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this.#getVideo();
            if (!v)
                return;
            v.addEventListener('play', () => {
                this.playing$.Set(true);
                this.dispatchEvent(new CustomEvent('arianna:video-play', {
                    bubbles: true, detail: { provider: 'native' },
                }));
            });
            v.addEventListener('pause', () => {
                this.playing$.Set(false);
                this.dispatchEvent(new CustomEvent('arianna:video-pause', {
                    bubbles: true, detail: { provider: 'native' },
                }));
            });
            v.addEventListener('timeupdate', () => {
                this.curTime$.Set(v.currentTime);
                this.dispatchEvent(new CustomEvent('arianna:video-timeupdate', {
                    bubbles: true, detail: { time: v.currentTime, duration: v.duration },
                }));
            });
            v.addEventListener('loadedmetadata', () => {
                this.duration$.Set(v.duration);
            });
            v.addEventListener('ended', () => {
                this.playing$.Set(false);
                this.dispatchEvent(new CustomEvent('arianna:video-ended', {
                    bubbles: true, detail: { provider: 'native' },
                }));
            });
            v.addEventListener('volumechange', () => {
                this.volume$.Set(v.volume);
                this.muted$.Set(v.muted);
            });
            // Restore volume from attr
            /** @name        volAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned volAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const volAttr = parseFloat(this.getAttribute('volume') ?? '1');
            if (!isNaN(volAttr))
                v.volume = Math.max(0, Math.min(1, volAttr));
            if (this.hasAttribute('loop'))
                v.loop = true;
            if (this.hasAttribute('autoplay'))
                v.autoplay = true;
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
        onBeforeMount()
        {
            // Initial source from attr
            /** @name        src
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned src value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const src = this.getAttribute('source') ?? this.getAttribute('src');
            if (src)
                this.setSource(src);
        }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount()
        {
            this.#wireNativeListeners();
        }

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
        onUpdate()
        {
            // Re-wire listeners if native video was just (re-)created
            this.#wireNativeListeners();
        }

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
        onUnmount() { }

        /** @name        stageStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for stage Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private stageStyle: () => string = () => 'aspect-ratio: 16/9';

        /** @name        isNative
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Native.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isNative: () => boolean = () => true;

        /** @name        isEmbed
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Embed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isEmbed: () => boolean = () => false;

        /** @name        embedSrc
         *  @private
         *  @type        {() => string}
         *  @description Component member for embed Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private embedSrc: () => string = () => '';

        /** @name        nativeSrc
         *  @private
         *  @type        {() => string}
         *  @description Component member for native Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private nativeSrc: () => string = () => '';

        /** @name        posterSrc
         *  @private
         *  @type        {() => string}
         *  @description Component member for poster Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private posterSrc: () => string = () => '';

        /** @name        timeLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for time Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private timeLabel: () => string = () => '0:00';

        /** @name        durLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for dur Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private durLabel: () => string = () => '0:00';

        /** @name        playLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for play Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private playLabel: () => string = () => '▶';

        /** @name        seekValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for seek Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private seekValue: () => string = () => '0';

        /** @name        volValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for vol Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private volValue: () => string = () => '100';

        /** @name        showControls
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Controls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showControls: () => boolean = () => true;

        /** @name        onPlayClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Play Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPlayClick: (e: Event) => void = () => { };

        /** @name        onSeekInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Seek Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSeekInput: (e: Event) => void = () => { };

        /** @name        onVolInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Vol Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onVolInput: (e: Event) => void = () => { };

        /** @name        onFullscreen
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Fullscreen.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onFullscreen: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {VideoPlayer.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {VideoPlayer.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'block', position: 'relative',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    color: 'var(--arianna-text, #1f2328)',
                    background: '#000',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    overflow: 'hidden',
                }),
                new Rule('.ar-vp', { display: 'flex', flexDirection: 'column' }),
                new Rule('.ar-vp__stage', {
                    position: 'relative',
                    width: '100%',
                    background: '#000',
                    overflow: 'hidden',
                }),
                new Rule('.ar-vp__stage video, .ar-vp__stage iframe', {
                    position: 'absolute', inset: '0',
                    width: '100%', height: '100%',
                    border: 'none',
                }),
                new Rule('.ar-vp__controls', {
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                }),
                new Rule('.ar-vp__play, .ar-vp__fs', {
                    background: 'transparent',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '28px', height: '28px',
                    display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: '3px',
                }),
                new Rule('.ar-vp__play:hover, .ar-vp__fs:hover', { background: 'rgba(255,255,255,0.1)' }),
                new Rule('.ar-vp__time, .ar-vp__dur', {
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '11px',
                    minWidth: '40px',
                    textAlign: 'center',
                }),
                new Rule('.ar-vp__seek', { flex: '1', minWidth: '0', cursor: 'pointer' }),
                new Rule('.ar-vp__vol', { width: '70px', cursor: 'pointer' }),
                new Rule('input[type="range"]', { accentColor: 'var(--arianna-primary, #1f6feb)' }),
            ]);
        }
    }
}
export default VideoPlayer;
