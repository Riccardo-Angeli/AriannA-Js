/**
 * @module    components/video/VideoPlayer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Video playback component with transport, seek bar, volume, time display,
 * and fullscreen. Supports multiple sources:
 *
 *   • Local files / direct URLs   → native <video> element
 *   • YouTube                     → <iframe> embed via /embed/{id}
 *   • Twitch (vods + clips)       → <iframe> embed via player.twitch.tv
 *   • Vimeo                       → <iframe> embed via player.vimeo.com
 *
 * Source URL is provided via the `Source` option (PascalCase) or the legacy
 * `src` attribute (kept for backwards compatibility). Provider detection is
 * automatic via URL pattern matching.
 *
 * Web Audio routing (`connect()`, `_output`) is only available when playing
 * local/direct video and only when this widget is composed with the audio
 * `AudioComponent` mixin (audio/ batch). For remote provider iframes the
 * audio track is sandboxed by the provider's origin and cannot be tapped.
 *
 * @example HTML
 *   <arianna-video-player source="movie.mp4"></arianna-video-player>
 *   <arianna-video-player source="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></arianna-video-player>
 *
 * @example JS
 *   const v = new VideoPlayer();
 *   v.setSource('movie.mp4');
 *   v.play();
 *   v.addEventListener('arianna:video-timeupdate', e => updateSubtitles(e.detail.time));
 *
 * Events:
 *   arianna:video-play         detail: { provider: VideoProvider }
 *   arianna:video-pause        detail: { provider }
 *   arianna:video-timeupdate   detail: { time: number, duration: number }
 *   arianna:video-ended        detail: { provider }
 *   arianna:video-source       detail: { source: string, provider }
 *
 * Attrs: source, src (legacy), poster, loop, volume, autoplay,
 *        show-controls, aspect-ratio, twitch-parent
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal, effect } from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type VideoProvider = 'native' | 'youtube' | 'twitch' | 'vimeo';

interface ProviderInfo {
    provider: VideoProvider;
    id      : string;
    embed   : string;
}

export interface VideoPlayerOptions {
    Source?       : string;
    src?          : string;          // legacy
    poster?       : string;
    loop?         : boolean;
    volume?       : number;
    autoplay?     : boolean;
    showControls? : boolean;
    aspectRatio?  : string;
    twitchParent? : string | string[];
}

// ── Provider detection ──────────────────────────────────────────────────────

function resolveTwitchParents(override?: string | string[]): string[] {
    if (override !== undefined) {
        const list = Array.isArray(override) ? override : [override];
        const cleaned = list.map(s => s.trim()).filter(Boolean);
        if (cleaned.length > 0) return cleaned;
    }
    const host = (typeof location !== 'undefined' && location.hostname) || '';
    return host ? [host] : ['localhost'];
}

export function detectVideoProvider(url: string, twitchParent?: string | string[]): ProviderInfo | null {
    if (!url) return null;

    // YouTube
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

    // Twitch
    const parents = resolveTwitchParents(twitchParent);
    m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/i);
    if (m) return twitchEmbed('video', m[1]!, parents);
    m = url.match(/^https?:\/\/clips\.twitch\.tv\/([\w-]+)/i);
    if (m) return twitchEmbed('clip', m[1]!, parents);
    m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([\w-]+)\/clip\/([\w-]+)/i);
    if (m) return twitchEmbed('clip', m[2]!, parents);
    m = url.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]{3,})$/i);
    if (m) return twitchEmbed('channel', m[1]!, parents);

    return null;  // → native
}

function ytEmbed(id: string): ProviderInfo {
    return { provider: 'youtube', id,
             embed: `https://www.youtube.com/embed/${id}?enablejsapi=1&playsinline=1&rel=0` };
}
function vimeoEmbed(id: string): ProviderInfo {
    return { provider: 'vimeo', id,
             embed: `https://player.vimeo.com/video/${id}?api=1` };
}
function twitchEmbed(kind: 'video' | 'clip' | 'channel', id: string, parents: string[]): ProviderInfo {
    const base = kind === 'clip' ? 'https://clips.twitch.tv/embed' : 'https://player.twitch.tv';
    const param = kind === 'clip' ? 'clip=' : kind === 'channel' ? 'channel=' : 'video=';
    const parentParams = parents.map(p => `&parent=${encodeURIComponent(p)}`).join('');
    return {
        provider: 'twitch', id,
        embed: `${base}/?${param}${encodeURIComponent(id)}${parentParams}`,
    };
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60) % 60;
    const h = Math.floor(seconds / 3600);
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// ── Component ───────────────────────────────────────────────────────────────

export class VideoPlayer extends Component('arianna-video-player', HTMLElement, {}, {
    attrs : ['source', 'src', 'poster', 'loop', 'volume', 'autoplay',
             'show-controls', 'aspect-ratio', 'twitch-parent'],
    shadow: false,
})
{
    provider$: Signal<VideoProvider> = signal<VideoProvider>('native');
    playing$ : Signal<boolean> = signal<boolean>(false);
    curTime$ : Signal<number>  = signal<number>(0);
    duration$: Signal<number>  = signal<number>(0);
    volume$  : Signal<number>  = signal<number>(1);
    muted$   : Signal<boolean> = signal<boolean>(false);

    #video?  : HTMLVideoElement;
    #iframe? : HTMLIFrameElement;
    #source  : string = '';
    #embed   : string = '';

    build(_opts: VideoPlayerOptions = {})
    {
        const sourceAttr = this.attrSignal('source');
        const legacySrcAttr = this.attrSignal('src');
        const posterAttr = this.attrSignal('poster');
        const aspectAttr = this.attrSignal('aspect-ratio');

        this.stageStyle = () => {
            const ar = aspectAttr.get() ?? '16/9';
            return `aspect-ratio: ${ar}`;
        };

        this.isNative  = () => this.provider$.get() === 'native';
        this.isEmbed   = () => this.provider$.get() !== 'native';
        this.embedSrc  = () => this.#embed;
        this.nativeSrc = () => this.#source;
        this.posterSrc = () => posterAttr.get() ?? '';

        this.timeLabel = () => formatTime(this.curTime$.get());
        this.durLabel  = () => formatTime(this.duration$.get());
        this.playLabel = () => this.playing$.get() ? '❙❙' : '▶';
        this.seekValue = () => {
            const d = this.duration$.get();
            return d > 0 ? String((this.curTime$.get() / d) * 100) : '0';
        };
        this.volValue  = () => String(this.volume$.get() * 100);

        this.showControls = () => this.getAttribute('show-controls') !== 'false';

        // ── Handlers ────────────────────────────────────────────────────
        this.onPlayClick = () => {
            if (this.playing$.get()) this.pause();
            else this.play();
        };
        this.onSeekInput = (e: Event) => {
            const pct = parseFloat((e.target as HTMLInputElement).value);
            const d = this.duration$.get();
            if (d > 0) this.seek((pct / 100) * d);
        };
        this.onVolInput = (e: Event) => {
            const pct = parseFloat((e.target as HTMLInputElement).value);
            this.setVolume(pct / 100);
        };
        this.onFullscreen = () => { void this.toggleFullscreen(); };

        // Source signal: re-detect provider on attr change. effect() runs
        // whenever any signal it reads (.get()) changes — we read both
        // primary `source` and legacy `src`.
        effect(() => {
            const v = sourceAttr.get();
            if (v) this.setSource(v);
        });
        effect(() => {
            const v = legacySrcAttr.get();
            if (v && !sourceAttr.peek()) this.setSource(v);
        });

        this.template = html`
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

        this.Sheet = VideoPlayer.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setSource(url: string, twitchParent?: string | string[]): this {
        this.#source = url;
        const tp = twitchParent ?? this.getAttribute('twitch-parent') ?? undefined;
        const info = detectVideoProvider(url, tp);
        if (info) {
            this.provider$.set(info.provider);
            this.#embed = info.embed;
        } else {
            this.provider$.set('native');
            this.#embed = '';
        }
        this.dispatchEvent(new CustomEvent('arianna:video-source', {
            bubbles: true, detail: { source: url, provider: this.provider$.get() },
        }));
        return this;
    }
    getSource(): string { return this.#source; }
    getProvider(): VideoProvider { return this.provider$.get(); }

    async play(): Promise<void> {
        if (this.provider$.get() === 'native') {
            const v = this.#getVideo();
            if (v) {
                try { await v.play(); }
                catch (err) { console.warn('VideoPlayer.play():', err); }
            }
        } else {
            this.#postIframe(this.provider$.get(), 'play');
        }
    }
    pause(): void {
        if (this.provider$.get() === 'native') {
            this.#getVideo()?.pause();
        } else {
            this.#postIframe(this.provider$.get(), 'pause');
        }
    }
    seek(seconds: number): void {
        if (this.provider$.get() === 'native') {
            const v = this.#getVideo();
            if (v) v.currentTime = seconds;
        } else {
            this.#postIframe(this.provider$.get(), 'seek', seconds);
        }
        this.curTime$.set(seconds);
    }
    setVolume(v: number): void {
        const clamped = Math.max(0, Math.min(1, v));
        this.volume$.set(clamped);
        const video = this.#getVideo();
        if (video) video.volume = clamped;
        else this.#postIframe(this.provider$.get(), 'volume', clamped);
    }
    getVolume(): number { return this.volume$.get(); }

    async toggleFullscreen(): Promise<void> {
        if (document.fullscreenElement) {
            await document.exitFullscreen().catch(() => undefined);
        } else {
            try { await this.requestFullscreen(); } catch { /* ignore */ }
        }
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    #getVideo(): HTMLVideoElement | null {
        return this.querySelector<HTMLVideoElement>('[data-r="video"]');
    }

    #postIframe(provider: VideoProvider, command: string, value?: number): void {
        const iframe = this.querySelector<HTMLIFrameElement>('[data-r="iframe"]');
        if (!iframe || !iframe.contentWindow) return;
        let message: unknown = null;
        if (provider === 'youtube') {
            const funcMap: Record<string, string> = {
                play: 'playVideo', pause: 'pauseVideo',
                seek: 'seekTo', volume: 'setVolume',
            };
            const func = funcMap[command];
            if (!func) return;
            message = JSON.stringify({
                event: 'command', func,
                args: command === 'volume' && value != null ? [value * 100]
                    : value != null ? [value] : [],
            });
            iframe.contentWindow.postMessage(message, '*');
        } else if (provider === 'vimeo') {
            const methodMap: Record<string, string> = {
                play: 'play', pause: 'pause',
                seek: 'setCurrentTime', volume: 'setVolume',
            };
            const method = methodMap[command];
            if (!method) return;
            message = JSON.stringify({ method, value });
            iframe.contentWindow.postMessage(message, '*');
        } else if (provider === 'twitch') {
            // Twitch's documented API needs a separate `Twitch.Embed` JS object.
            // postMessage doesn't expose a public command surface.
            console.warn('VideoPlayer: programmatic control of Twitch embeds requires the Twitch Embed JS API.');
        }
    }

    #wireNativeListeners(): void {
        const v = this.#getVideo();
        if (!v) return;
        v.addEventListener('play',       () => {
            this.playing$.set(true);
            this.dispatchEvent(new CustomEvent('arianna:video-play', {
                bubbles: true, detail: { provider: 'native' },
            }));
        });
        v.addEventListener('pause',      () => {
            this.playing$.set(false);
            this.dispatchEvent(new CustomEvent('arianna:video-pause', {
                bubbles: true, detail: { provider: 'native' },
            }));
        });
        v.addEventListener('timeupdate', () => {
            this.curTime$.set(v.currentTime);
            this.dispatchEvent(new CustomEvent('arianna:video-timeupdate', {
                bubbles: true, detail: { time: v.currentTime, duration: v.duration },
            }));
        });
        v.addEventListener('loadedmetadata', () => {
            this.duration$.set(v.duration);
        });
        v.addEventListener('ended', () => {
            this.playing$.set(false);
            this.dispatchEvent(new CustomEvent('arianna:video-ended', {
                bubbles: true, detail: { provider: 'native' },
            }));
        });
        v.addEventListener('volumechange', () => {
            this.volume$.set(v.volume);
            this.muted$.set(v.muted);
        });
        // Restore volume from attr
        const volAttr = parseFloat(this.getAttribute('volume') ?? '1');
        if (!isNaN(volAttr)) v.volume = Math.max(0, Math.min(1, volAttr));
        if (this.hasAttribute('loop'))     v.loop     = true;
        if (this.hasAttribute('autoplay')) v.autoplay = true;
    }

    onCreated()       {}
    onBeforeMount()   {
        // Initial source from attr
        const src = this.getAttribute('source') ?? this.getAttribute('src');
        if (src) this.setSource(src);
    }
    onMount() {
        this.#wireNativeListeners();
    }
    onBeforeUpdate()  {}
    onUpdate() {
        // Re-wire listeners if native video was just (re-)created
        this.#wireNativeListeners();
    }
    onBeforeUnmount() {}
    onUnmount()       {}

    private stageStyle  : () => string = () => 'aspect-ratio: 16/9';
    private isNative    : () => boolean = () => true;
    private isEmbed     : () => boolean = () => false;
    private embedSrc    : () => string = () => '';
    private nativeSrc   : () => string = () => '';
    private posterSrc   : () => string = () => '';
    private timeLabel   : () => string = () => '0:00';
    private durLabel    : () => string = () => '0:00';
    private playLabel   : () => string = () => '▶';
    private seekValue   : () => string = () => '0';
    private volValue    : () => string = () => '100';
    private showControls: () => boolean = () => true;
    private onPlayClick : (e: Event) => void = () => {};
    private onSeekInput : (e: Event) => void = () => {};
    private onVolInput  : (e: Event) => void = () => {};
    private onFullscreen: (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
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
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'VideoPlayer', {
        value: VideoPlayer, writable: false, enumerable: false, configurable: false,
    });
}

export default VideoPlayer;
