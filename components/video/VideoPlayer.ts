/**
 * @module    VideoPlayer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Video playback component with transport, seek bar, volume, time display,
 * fullscreen, and Web Audio routing on the audio track.
 *
 * Supports multiple sources:
 *   • Local files / direct URLs   → native <video> element with Web Audio routing
 *   • YouTube                     → <iframe> embed via /embed/{id}
 *   • Twitch (vods + clips)       → <iframe> embed via player.twitch.tv
 *   • Vimeo                       → <iframe> embed via player.vimeo.com
 *
 * Source URL is provided via the constructor `Source` option (PascalCase) or
 * the runtime `Source` setter. The legacy `src` option is preserved for
 * backwards compatibility but new code should prefer `Source`. Provider
 * detection is automatic via URL pattern matching.
 *
 * Note on routing: Web Audio routing (`connect()`, `_output`) is only
 * available when playing local/direct video. For remote provider iframes the
 * audio track is sandboxed by the provider's origin and cannot be tapped —
 * `getOutput()` returns undefined and emits a console warning in that case.
 *
 * @example
 *   import { VideoPlayer } from 'ariannajs/components/video';
 *
 *   // Local file (full Web Audio routing)
 *   const v = new VideoPlayer('#root', { Source: 'movie.mp4' });
 *   v.connect(strip);
 *
 *   // YouTube (no audio routing — playback only)
 *   const yt = new VideoPlayer('#root', {
 *       Source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
 *   });
 *
 *   // Switch source at runtime — provider re-detected automatically
 *   v.Source = 'https://vimeo.com/76979871';
 *
 *   v.on('play',       e => console.log('playing', e.provider));
 *   v.on('timeupdate', e => updateSubtitles(e.time));
 */

import { AudioComponent, type AudioComponentOptions } from '../audio/AudioComponent.ts';

// ── Provider detection ──────────────────────────────────────────────────────

/** Recognised video sources. */
export type VideoProvider = 'native' | 'youtube' | 'twitch' | 'vimeo';

/** Result of a successful provider parse: kind + extracted ID + embed URL. */
interface ProviderInfo {
    provider: VideoProvider;
    id      : string;
    embed   : string;
}

/**
 * Resolve which hostname(s) to declare as Twitch `parent`. Twitch refuses to
 * load the embed unless the URL contains at least one `parent` query parameter
 * matching the page's host. Multiple parents can be appended to the URL —
 * Twitch will accept the iframe if any of them matches the actual host.
 *
 * Resolution order:
 *   1. explicit override (constructor option `twitchParent`),
 *   2. `location.hostname` if non-empty (anything served over HTTP/HTTPS,
 *      including `localhost` and `127.0.0.1`),
 *   3. `'localhost'` as a last resort. This is necessary because pages opened
 *      directly from disk (`file://`) have an empty hostname; Twitch will then
 *      fail anyway, but at least the URL is well-formed and the failure mode
 *      is a visible Twitch error page rather than a silent malformed embed.
 */
function resolveTwitchParents(override?: string | string[]): string[]
{
    if (override !== undefined)
    {
        const list = Array.isArray(override) ? override : [override];
        const cleaned = list.map(s => s.trim()).filter(Boolean);
        if (cleaned.length > 0) return cleaned;
    }
    const host = (typeof location !== 'undefined' && location.hostname) || '';
    return host ? [host] : ['localhost'];
}

/**
 * Identify the provider for a given URL and produce the matching iframe
 * embed URL. Returns null if the URL is a plain video file or unknown.
 *
 * `twitchParent` is forwarded to the Twitch embed URL as one or more
 * `&parent=` parameters. When omitted, the current page's hostname is used.
 *
 * Examples:
 *   - https://youtu.be/dQw4w9WgXcQ                 → youtube
 *   - https://www.youtube.com/watch?v=dQw4w9WgXcQ  → youtube
 *   - https://www.youtube.com/shorts/abc123        → youtube
 *   - https://vimeo.com/76979871                   → vimeo
 *   - https://player.vimeo.com/video/76979871      → vimeo
 *   - https://www.twitch.tv/videos/123456789       → twitch (vod)
 *   - https://clips.twitch.tv/AwkwardClip          → twitch (clip)
 *   - https://example.com/movie.mp4                → null (native)
 */
export function detectVideoProvider(url: string, twitchParent?: string | string[]): ProviderInfo | null {
    if (!url) return null;

    // YouTube — multiple URL shapes supported
    let m = url.match(/^https?:\/\/(?:www\.)?youtu\.be\/([\w-]{6,})/i);
    if (m) return ytEmbed(m[1]!);

    m = url.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{6,})/i);
    if (m) return ytEmbed(m[1]!);

    m = url.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:shorts|embed|v)\/([\w-]{6,})/i);
    if (m) return ytEmbed(m[1]!);

    // Vimeo
    m = url.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d{6,})/i);
    if (m) return vimeoEmbed(m[1]!);

    m = url.match(/^https?:\/\/player\.vimeo\.com\/video\/(\d{6,})/i);
    if (m) return vimeoEmbed(m[1]!);

    // Twitch — VOD: twitch.tv/videos/ID, Clip: clips.twitch.tv/ID, Channel: twitch.tv/channelname
    const parents = resolveTwitchParents(twitchParent);

    m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/i);
    if (m) return twitchEmbed('video', m[1]!, parents);

    m = url.match(/^https?:\/\/clips\.twitch\.tv\/([\w-]+)/i);
    if (m) return twitchEmbed('clip', m[1]!, parents);

    m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([\w-]+)\/clip\/([\w-]+)/i);
    if (m) return twitchEmbed('clip', m[2]!, parents);

    m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]{3,})$/i);
    if (m) return twitchEmbed('channel', m[1]!, parents);

    // Plain URL — native <video>
    return null;
}

function ytEmbed(id: string): ProviderInfo
{
    return {
        provider: 'youtube',
        id,
        embed: `https://www.youtube.com/embed/${id}?enablejsapi=1&playsinline=1&rel=0`,
    };
}

function vimeoEmbed(id: string): ProviderInfo
{
    return {
        provider: 'vimeo',
        id,
        embed: `https://player.vimeo.com/video/${id}?api=1`,
    };
}

function twitchEmbed(kind: 'video' | 'clip' | 'channel', id: string, parents: string[]): ProviderInfo
{
    const base = kind === 'clip' ? 'https://clips.twitch.tv/embed' : 'https://player.twitch.tv';
    const param = kind === 'clip'    ? 'clip='
                : kind === 'channel' ? 'channel='
                :                      'video=';
    // Twitch accepts multiple `parent` parameters — useful when the same bundle
    // is served on apex + www, on multiple environments, or behind Cloudflare
    // where the front-facing host may differ from the origin.
    const parentParams = parents.map(p => `&parent=${encodeURIComponent(p)}`).join('');
    return {
        provider: 'twitch',
        id,
        embed: `${base}/?${param}${encodeURIComponent(id)}${parentParams}`,
    };
}

// ── Component options ───────────────────────────────────────────────────────

export interface VideoPlayerOptions extends AudioComponentOptions {
    /** Video source URL — accepts local files, YouTube, Twitch, or Vimeo URLs.
     *  Provider is detected automatically. PascalCase to align with the AriannA
     *  property naming convention. */
    Source?        : string;
    /** @deprecated Use `Source`. Kept for backwards compatibility. */
    src?           : string;
    poster?        : string;
    loop?          : boolean;
    volume?        : number;
    autoplay?      : boolean;
    showControls?  : boolean;
    /** Aspect-ratio for the player. Default '16/9'. */
    aspectRatio?   : string;
    /**
     * Override for the Twitch `parent` query parameter (or parameters).
     * Twitch refuses to load its embed unless the URL declares the host
     * page's domain. By default we infer it from `location.hostname`, which
     * works on `localhost` and any HTTP(S)-served page. Set this when:
     *   • you serve the same page on multiple hostnames (e.g. apex + www);
     *   • the embed is loaded inside a `file://` document or a sandboxed
     *     iframe where `location.hostname` is empty;
     *   • you want to lock the parent regardless of where the bundle runs.
     *
     * Pass a single hostname or an array — every entry will be appended as
     * a separate `&parent=` parameter, which is what Twitch expects.
     */
    twitchParent?  : string | string[];
}

// ── Component ───────────────────────────────────────────────────────────────

export class VideoPlayer extends AudioComponent<VideoPlayerOptions> {

    // Native-mode internals (only assigned when provider === 'native')
    private _video?    : HTMLVideoElement;
    private _mediaSrc? : MediaElementAudioSourceNode;
    private _gain?     : GainNode;

    // Embed-mode internals (only assigned when provider !== 'native')
    private _iframe?   : HTMLIFrameElement;

    // Current provider state
    private _provider  : VideoProvider = 'native';
    private _sourceUrl : string = '';

    // Cached state (kept up to date by event listeners; used in embed mode where
    // the provider iframe doesn't expose synchronous getters).
    private _isPlaying : boolean = false;
    private _curTime   : number  = 0;
    private _duration  : number  = 0;
    private _volume    : number  = 1;

    // Polling handle for embed-mode time updates
    private _pollHandle: number | null = null;

    // Shell DOM refs (controls)
    private _elPlay?   : HTMLButtonElement;
    private _elTime?   : HTMLElement;
    private _elBar?    : HTMLInputElement;
    private _elVolume? : HTMLInputElement;
    private _elDur?    : HTMLElement;
    private _elFs?     : HTMLButtonElement;
    private _elStage?  : HTMLElement;

    // postMessage handler bound once for cleanup
    private _onMessageBound = (e: MessageEvent) => this._onProviderMessage(e);

    constructor(container: string | HTMLElement | null, opts: VideoPlayerOptions = {})
    {
        super(container, 'div', {
            loop         : false,
            volume       : 1,
            autoplay     : false,
            showControls : true,
            aspectRatio  : '16/9',
            ...opts,
        });

        this.el.className = `ar-videoplayer${opts.class ? ' ' + opts.class : ''}`;
        this._volume = this._get<number>('volume', 1);

        this._injectStyles();
        this._buildShell();

        // Reconcile Source vs legacy src; Source wins
        const initial = opts.Source ?? opts.src;
        if (initial) this.load(initial, opts.poster);

        window.addEventListener('message', this._onMessageBound);
    }

    // ── Public API ──────────────────────────────────────────────────────────

    /**
     * Current source URL. Setting this re-detects the provider, swaps
     * between native <video> and the appropriate <iframe> embed, and resumes
     * playback if `autoplay` is set.
     */
    get Source(): string { return this._sourceUrl; }
    set Source(url: string) { this.load(url); }

    /** Currently active provider (native | youtube | twitch | vimeo). */
    get provider(): VideoProvider { return this._provider; }

    /**
     * Load a new source. Detects the provider, swaps the underlying element
     * (`<video>` ↔ `<iframe>`), and re-applies user options (volume, loop,
     * poster). Returns this for chaining.
     *
     * Note on first-load: the constructor leaves `_provider` set to `'native'`
     * but does NOT actually create a `<video>` element until a Source arrives.
     * That's why we trigger `_setupNative()` / `_setupEmbed()` either when the
     * provider changes OR when the corresponding underlying element is still
     * missing — without the latter, calling `load('movie.mp4')` on a freshly
     * constructed player would dereference `this._video` before it exists.
     */
    load(url: string, poster?: string): this
    {
        const info = detectVideoProvider(url, this._get<string | string[] | undefined>('twitchParent', undefined));
        const next: VideoProvider = info ? info.provider : 'native';
        this._sourceUrl = url;

        const needsSetup = next !== this._provider
            || (next === 'native' && !this._video)
            || (next !== 'native' && !this._iframe);

        if (needsSetup)
        {
            this._teardownMedia();
            this._provider = next;
            if (next === 'native') this._setupNative();
            else                   this._setupEmbed();
        }

        if (next === 'native')
        {
            this._video!.src = url;
            if (poster) this._video!.poster = poster;
            this._video!.load();
        }
        else
        {
            this._iframe!.src = info!.embed;
        }
        this._refreshTime();
        return this;
    }

    play(): Promise<void>
    {
        if (this._provider === 'native')
        {
            AudioComponent.resume();
            return this._video!.play();
        }
        this._postProvider({ event: 'play' });
        return Promise.resolve();
    }

    pause(): this
    {
        if (this._provider === 'native')      this._video!.pause();
        else                                  this._postProvider({ event: 'pause' });
        return this;
    }

    stop(): this
    {
        if (this._provider === 'native')
        {
            this._video!.pause();
            this._video!.currentTime = 0;
        }
        else
        {
            this._postProvider({ event: 'pause' });
            this._postProvider({ event: 'seek', value: 0 });
        }
        return this;
    }

    seek(time: number): this
    {
        if (this._provider === 'native')
        {
            this._video!.currentTime = Math.max(0, Math.min(time, this._video!.duration || 0));
        }
        else
        {
            this._postProvider({ event: 'seek', value: Math.max(0, time) });
        }
        return this;
    }

    setVolume(v: number): this
    {
        const c = Math.max(0, Math.min(1, v));
        this._volume = c;
        if (this._provider === 'native')
        {
            this._video!.volume = c;
            if (this._gain) this._gain.gain.value = c;
        }
        else
        {
            this._postProvider({ event: 'volume', value: c });
        }
        if (this._elVolume) this._elVolume.value = String(c);
        return this;
    }

    setLoop(loop: boolean): this
    {
        if (this._provider === 'native') this._video!.loop = loop;
        return this;
    }

    fullscreen(): this
    {
        const el: HTMLElement | undefined = this._video ?? this._iframe;
        if (el && el.requestFullscreen) el.requestFullscreen();
        return this;
    }

    getCurrentTime(): number
    {
        return this._provider === 'native' ? (this._video?.currentTime ?? 0) : this._curTime;
    }

    getDuration(): number
    {
        return this._provider === 'native' ? (this._video?.duration ?? 0) : this._duration;
    }

    isPlaying(): boolean
    {
        return this._provider === 'native' ? !(this._video?.paused ?? true) : this._isPlaying;
    }

    /** Returns the underlying <video> when in native mode, the <iframe> for embeds. */
    getElement(): HTMLVideoElement | HTMLIFrameElement | undefined
    {
        return this._video ?? this._iframe;
    }

    /** Web Audio output node — only available in native mode. */
    override getOutput(): AudioNode | undefined
    {
        if (this._provider !== 'native')
        {
            console.warn('[VideoPlayer] Web Audio routing not available for provider:', this._provider);
            return undefined;
        }
        return this._gain;
    }

    /** Clean up listeners, postMessage handler, and audio graph. */
    destroy(): void
    {
        window.removeEventListener('message', this._onMessageBound);
        this._stopEmbedPolling();
        this._teardownMedia();
    }

    // ── Internal: native video setup ───────────────────────────────────────

    /** Required by AudioComponent abstract — actual graph is built lazily. */
    protected _buildAudioGraph(): void { /* deferred to _setupNative */ }

    protected _build(): void { /* shell built explicitly in _buildShell */ }

    private _setupNative(): void
    {
        const v = document.createElement('video');
        v.crossOrigin = 'anonymous';
        v.loop        = this._get<boolean>('loop', false);
        v.volume      = this._volume;
        v.autoplay    = this._get<boolean>('autoplay', false);
        v.playsInline = true;
        this._video = v;

        // Build Web Audio graph
        this._mediaSrc = this._audioCtx.createMediaElementSource(v);
        this._gain     = this._audioCtx.createGain();
        this._gain.gain.value = this._volume;
        this._mediaSrc.connect(this._gain);
        this._gain.connect(this._audioCtx.destination);
        this._output = this._gain;

        this._elStage!.innerHTML = '';
        this._elStage!.appendChild(v);

        v.addEventListener('play',       () => { this._isPlaying = true;  this._emit('play',  { provider: 'native' }); });
        v.addEventListener('pause',      () => { this._isPlaying = false; this._emit('pause', { provider: 'native' }); });
        v.addEventListener('ended',      () => { this._isPlaying = false; this._emit('ended', { provider: 'native' }); });
        v.addEventListener('timeupdate', () =>
        {
            this._refreshTime();
            this._emit('timeupdate', { time: v.currentTime, duration: v.duration, provider: 'native' });
        });
        v.addEventListener('loadedmetadata', () =>
        {
            this._refreshTime();
            this._emit('loaded', {
                duration: v.duration, width: v.videoWidth, height: v.videoHeight, provider: 'native',
            });
        });
    }

    // ── Internal: embed iframe setup ───────────────────────────────────────

    private _setupEmbed(): void
    {
        const f = document.createElement('iframe');
        f.setAttribute('frameborder', '0');
        f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        f.setAttribute('allowfullscreen', 'true');
        f.style.width  = '100%';
        f.style.height = '100%';
        f.style.border = '0';
        this._iframe = f;

        this._elStage!.innerHTML = '';
        this._elStage!.appendChild(f);

        f.addEventListener('load', () => this._embedBootstrap());

        this._startEmbedPolling();
    }

    /** After the iframe loads, hand-shake with provider's JS API. */
    private _embedBootstrap(): void
    {
        switch (this._provider)
        {
            case 'youtube':
                this._postProvider({ event: 'listening', id: 'arianna-yt' });
                this._postProvider({ event: 'command', func: 'addEventListener', args: ['onStateChange'] });
                this._postProvider({ event: 'command', func: 'addEventListener', args: ['onReady'] });
                if (this._get<boolean>('autoplay', false)) this._postProvider({ event: 'command', func: 'playVideo' });
                break;

            case 'vimeo':
                this._postProvider({ method: 'addEventListener', value: 'play' });
                this._postProvider({ method: 'addEventListener', value: 'pause' });
                this._postProvider({ method: 'addEventListener', value: 'ended' });
                this._postProvider({ method: 'addEventListener', value: 'timeupdate' });
                this._postProvider({ method: 'addEventListener', value: 'loaded' });
                if (this._get<boolean>('autoplay', false)) this._postProvider({ method: 'play' });
                break;

            case 'twitch':
                // Twitch player iframe doesn't expose a stable postMessage API;
                // controls are limited to the iframe's own UI. We still emit
                // a synthetic 'loaded' so consumers can flip into ready state.
                setTimeout(() => this._emit('loaded', { provider: 'twitch' }), 200);
                break;
        }

        this.setVolume(this._volume);
    }

    /** Send a JSON-encoded postMessage to the embed iframe (provider-specific shape). */
    private _postProvider(payload: unknown): void
    {
        if (!this._iframe?.contentWindow) return;
        const targetOrigin = this._provider === 'youtube' ? 'https://www.youtube.com'
                          : this._provider === 'vimeo'   ? 'https://player.vimeo.com'
                          : '*';
        this._iframe.contentWindow.postMessage(JSON.stringify(payload), targetOrigin);
    }

    /** Receive postMessage events from provider iframes and translate to AriannA events. */
    private _onProviderMessage(ev: MessageEvent): void
    {
        if (!this._iframe || ev.source !== this._iframe.contentWindow) return;

        let data: unknown;
        try { data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data; }
        catch { return; }

        if (this._provider === 'youtube') this._handleYouTubeMessage(data);
        else if (this._provider === 'vimeo') this._handleVimeoMessage(data);
    }

    private _handleYouTubeMessage(data: unknown): void
    {
        const m = data as { event?: string; info?: unknown };
        if (!m || typeof m !== 'object') return;

        // YouTube state codes: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
        if (m.event === 'onStateChange' && typeof m.info === 'number')
        {
            switch (m.info)
            {
                case 1: this._isPlaying = true;  this._emit('play',  { provider: 'youtube' }); break;
                case 2: this._isPlaying = false; this._emit('pause', { provider: 'youtube' }); break;
                case 0: this._isPlaying = false; this._emit('ended', { provider: 'youtube' }); break;
            }
        }
        else if (m.event === 'infoDelivery' && m.info && typeof m.info === 'object')
        {
            const info = m.info as { currentTime?: number; duration?: number };
            if (typeof info.currentTime === 'number') this._curTime = info.currentTime;
            if (typeof info.duration === 'number')    this._duration = info.duration;
        }
        else if (m.event === 'onReady')
        {
            this._emit('loaded', { provider: 'youtube', duration: this._duration });
        }
    }

    private _handleVimeoMessage(data: unknown): void
    {
        const m = data as { event?: string; data?: { seconds?: number; duration?: number; percent?: number } };
        if (!m || typeof m !== 'object') return;

        switch (m.event)
        {
            case 'play':       this._isPlaying = true;  this._emit('play',  { provider: 'vimeo' }); break;
            case 'pause':      this._isPlaying = false; this._emit('pause', { provider: 'vimeo' }); break;
            case 'ended':      this._isPlaying = false; this._emit('ended', { provider: 'vimeo' }); break;
            case 'timeupdate':
                if (m.data?.seconds  !== undefined) this._curTime = m.data.seconds;
                if (m.data?.duration !== undefined) this._duration = m.data.duration;
                this._emit('timeupdate', { time: this._curTime, duration: this._duration, provider: 'vimeo' });
                break;
            case 'loaded':
                if (m.data?.duration !== undefined) this._duration = m.data.duration;
                this._emit('loaded', { duration: this._duration, provider: 'vimeo' });
                break;
        }
    }

    /** YouTube doesn't always push timeupdate. Poll via postMessage. */
    private _startEmbedPolling(): void
    {
        this._stopEmbedPolling();
        this._pollHandle = window.setInterval(() =>
        {
            if (this._provider === 'youtube')
            {
                this._postProvider({ event: 'listening', id: 'arianna-yt' });
                this._postProvider({ event: 'command', func: 'getCurrentTime' });
                this._postProvider({ event: 'command', func: 'getDuration' });
            }
            this._refreshTime();
            this._emit('timeupdate', {
                time: this._curTime, duration: this._duration, provider: this._provider,
            });
        }, 500);
    }

    private _stopEmbedPolling(): void
    {
        if (this._pollHandle != null)
        {
            clearInterval(this._pollHandle);
            this._pollHandle = null;
        }
    }

    /** Cleanup current media element + audio graph (called on provider switch). */
    private _teardownMedia(): void
    {
        this._stopEmbedPolling();

        if (this._video)
        {
            try { this._video.pause(); } catch { /* */ }
            try { this._mediaSrc?.disconnect(); } catch { /* */ }
            try { this._gain?.disconnect(); }     catch { /* */ }
            this._video.remove();
            this._video    = undefined;
            this._mediaSrc = undefined;
            this._gain     = undefined;
            this._output   = undefined;
        }
        if (this._iframe)
        {
            this._iframe.src = 'about:blank';
            this._iframe.remove();
            this._iframe = undefined;
        }
    }

    // ── Shell + UI ─────────────────────────────────────────────────────────

    private _buildShell(): void
    {
        const ar = this._get<string>('aspectRatio', '16/9');
        this.el.innerHTML = `
<div class="ar-videoplayer__stage" data-r="stage" style="aspect-ratio:${ar}"></div>
${this._get<boolean>('showControls', true) ? `
<div class="ar-videoplayer__row">
  <button class="ar-videoplayer__btn play" data-r="play" title="Play / Pause">▶</button>
  <button class="ar-videoplayer__btn"      data-r="stop" title="Stop">■</button>
  <span class="ar-videoplayer__time" data-r="time">0:00</span>
  <input  class="ar-videoplayer__bar"  data-r="bar"  type="range" min="0" max="1000" value="0">
  <span class="ar-videoplayer__time" data-r="duration">0:00</span>
  <span class="ar-videoplayer__lbl">Vol</span>
  <input  class="ar-videoplayer__vol" data-r="volume" type="range" min="0" max="1" step="0.01">
  <span class="ar-videoplayer__provider" data-r="provider"></span>
  <button class="ar-videoplayer__btn" data-r="fs" title="Fullscreen">⛶</button>
</div>` : ''}`;

        this._elStage = this.el.querySelector<HTMLElement>('[data-r="stage"]')!;

        if (!this._get<boolean>('showControls', true)) return;

        const r = (n: string) => this.el.querySelector<HTMLElement>(`[data-r="${n}"]`)!;
        this._elPlay   = r('play')   as HTMLButtonElement;
        this._elTime   = r('time');
        this._elDur    = r('duration');
        this._elBar    = r('bar')    as HTMLInputElement;
        this._elVolume = r('volume') as HTMLInputElement;
        this._elFs     = r('fs')     as HTMLButtonElement;

        this._elVolume.value = String(this._volume);

        this._elPlay.addEventListener('click', () =>
        {
            if (this.isPlaying()) this.pause();
            else                  this.play();
        });
        r('stop').addEventListener('click', () => this.stop());

        this._elBar.addEventListener('input', () =>
        {
            const frac = parseInt(this._elBar!.value, 10) / 1000;
            this.seek(frac * this.getDuration());
        });
        this._elVolume.addEventListener('input', () =>
            this.setVolume(parseFloat(this._elVolume!.value)));

        this._elFs.addEventListener('click', () => this.fullscreen());

        this.on('play',  () => { if (this._elPlay) this._elPlay.textContent = '‖'; });
        this.on('pause', () => { if (this._elPlay) this._elPlay.textContent = '▶'; });
        this.on('ended', () => { if (this._elPlay) this._elPlay.textContent = '▶'; });
    }

    private _refreshTime(): void
    {
        if (!this._elTime || !this._elDur) return;
        const cur = this.getCurrentTime();
        const dur = this.getDuration();
        this._elTime.textContent = formatTime(cur);
        this._elDur.textContent  = formatTime(dur);
        if (dur > 0 && this._elBar)
        {
            this._elBar.value = String(Math.round(cur / dur * 1000));
        }

        const provLbl = this.el.querySelector<HTMLElement>('[data-r="provider"]');
        if (provLbl) provLbl.textContent = this._provider === 'native' ? '' : this._provider.toUpperCase();
    }

    private _injectStyles(): void
    {
        if (document.getElementById('ar-videoplayer-styles')) return;
        const s = document.createElement('style');
        s.id = 'ar-videoplayer-styles';
        s.textContent = `
.ar-videoplayer { font:13px -apple-system,system-ui,sans-serif; background:#1e1e1e; color:#d4d4d4; border-radius:6px; overflow:hidden; }
.ar-videoplayer__stage { width:100%; background:#000; position:relative; }
.ar-videoplayer__stage video, .ar-videoplayer__stage iframe { width:100%; height:100%; display:block; border:0; }
.ar-videoplayer__row { display:flex; align-items:center; gap:10px; padding:8px 12px; }
.ar-videoplayer__btn { background:transparent; border:1px solid #444; color:#d4d4d4; padding:4px 10px; font:14px sans-serif; border-radius:3px; cursor:pointer; min-width:32px; }
.ar-videoplayer__btn:hover { background:#2a2a2a; }
.ar-videoplayer__btn.play { background:#16a34a; border-color:#16a34a; color:#fff; }
.ar-videoplayer__btn.play:hover { background:#15803d; }
.ar-videoplayer__time { font:11px ui-monospace,monospace; color:#888; min-width:40px; text-align:center; }
.ar-videoplayer__bar { flex:1; -webkit-appearance:none; height:4px; background:#444; border-radius:2px; outline:none; cursor:pointer; }
.ar-videoplayer__bar::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#e40c88; cursor:pointer; }
.ar-videoplayer__bar::-moz-range-thumb     { width:12px; height:12px; border-radius:50%; background:#e40c88; cursor:pointer; border:0; }
.ar-videoplayer__lbl { font:10px sans-serif; color:#888; }
.ar-videoplayer__vol { width:80px; -webkit-appearance:none; height:3px; background:#444; border-radius:2px; outline:none; cursor:pointer; }
.ar-videoplayer__vol::-webkit-slider-thumb { -webkit-appearance:none; width:10px; height:10px; border-radius:50%; background:#d4d4d4; cursor:pointer; }
.ar-videoplayer__vol::-moz-range-thumb     { width:10px; height:10px; border-radius:50%; background:#d4d4d4; cursor:pointer; border:0; }
.ar-videoplayer__provider { font:10px sans-serif; color:#e40c88; letter-spacing:.05em; min-width:50px; text-align:right; }
`;
        document.head.appendChild(s);
    }
}

function formatTime(s: number): string {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, '0')}`;
}
