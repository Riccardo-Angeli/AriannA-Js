/**
 * @module components/video/VideoPlayer
 * @version 2.0.0
 * @description AriannA video player supporting HTML5/H.264, YouTube and Vimeo.
 */
import { Component, Css, Templates } from '../../core/index.ts';

export type VideoProvider = 'html5' | 'youtube' | 'vimeo' | 'unknown';

export interface VideoPlayerOptions {
    theme?: 'dark' | 'light';
    src?: string;
    source?: string;
    poster?: string;
    title?: string;
    subtitle?: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;
    volume?: number;
    current?: number;
    playbackRate?: number;
    aspectRatio?: string;
    fit?: 'contain' | 'cover' | 'fill';
}

const html = Templates.Template.Html;
const Runtime = new WeakMap<HTMLElement, {
    bound: boolean;
    tick: number;
    video?: HTMLVideoElement;
    frame?: HTMLIFrameElement;
    seek?: HTMLInputElement;
    volume?: HTMLInputElement;
    time?: HTMLElement;
    bigPlay?: HTMLButtonElement;
    provider: VideoProvider;
}>();

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }

export function detectVideoProvider(source: string): VideoProvider {
    const value = String(source ?? '').trim().toLowerCase();
    if(!value) return 'unknown';
    if(/(?:youtube\.com|youtu\.be)/.test(value)) return 'youtube';
    if(/vimeo\.com/.test(value)) return 'vimeo';
    return 'html5';
}

function youtubeId(source: string): string {
    try {
        const url = new URL(source, document.baseURI);
        if(url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] ?? '';
        if(url.pathname.includes('/embed/')) return url.pathname.split('/embed/')[1]?.split('/')[0] ?? '';
        if(url.pathname.includes('/shorts/')) return url.pathname.split('/shorts/')[1]?.split('/')[0] ?? '';
        return url.searchParams.get('v') ?? '';
    } catch { return ''; }
}

function vimeoId(source: string): string {
    const match = String(source).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return match?.[1] ?? '';
}

function applyOptions(element: HTMLElement, options: VideoPlayerOptions = {}): void {
    if(options.theme) element.setAttribute('theme', options.theme);
    const source = options.src ?? options.source;
    if(source) element.setAttribute('src', source);
    if(options.poster) element.setAttribute('poster', options.poster);
    if(options.title) element.setAttribute('title', options.title);
    if(options.subtitle) element.setAttribute('subtitle', options.subtitle);
    if(options.autoplay) element.setAttribute('autoplay', '');
    if(options.muted) element.setAttribute('muted', '');
    if(options.loop) element.setAttribute('loop', '');
    if(options.showControls === false) element.setAttribute('show-controls', 'false');
    if(options.volume != null) element.setAttribute('volume', String(options.volume));
    if(options.current != null) element.setAttribute('current', String(options.current));
    if(options.playbackRate != null) element.setAttribute('playback-rate', String(options.playbackRate));
    if(options.aspectRatio) element.setAttribute('aspect-ratio', options.aspectRatio);
    if(options.fit) element.setAttribute('fit', options.fit);
}

export namespace VideoPlayer {
    export namespace Types {
        export type Theme = 'dark' | 'light';
        export type Provider = VideoProvider;
    }
    export namespace Interfaces { export interface Options extends VideoPlayerOptions {} }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-video-player,.AriannaVideoPlayer', {
            Background: '#0b0d10', Border: '1px solid #24282e', BorderRadius: '8px', BoxSizing: 'border-box', Color: '#edf1f5',
            Display: 'block', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.VideoPlayer-Shell', { Background: '#050607', Display: 'grid', GridTemplateRows: 'minmax(180px,1fr) auto', Position: 'relative', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Viewport', { AspectRatio: 'var(--VideoPlayer-Aspect,16 / 9)', Background: '#000', Overflow: 'hidden', Position: 'relative', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Video,.VideoPlayer-Frame', { Background: '#000', Border: '0', Height: '100%', Left: '0', ObjectFit: 'var(--VideoPlayer-Fit,contain)', Position: 'absolute', Top: '0', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Overlay', { Background: 'linear-gradient(to top,rgba(0,0,0,.58),transparent 46%)', Bottom: '0', Left: '0', PointerEvents: 'none', Position: 'absolute', Right: '0', Top: '0' }),
        new Css.Rule('.VideoPlayer-Provider', { Background: 'rgba(8,10,13,.72)', Border: '1px solid rgba(255,255,255,.18)', BorderRadius: '999px', Color: '#fff', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)', Left: '10px', LetterSpacing: '.05em', Padding: '5px 8px', Position: 'absolute', TextTransform: 'uppercase', Top: '10px', ZIndex: '4' }),
        new Css.Rule('.VideoPlayer-TitleBlock', { Bottom: '16px', Left: '16px', PointerEvents: 'none', Position: 'absolute', Right: '16px', ZIndex: '3' }),
        new Css.Rule('.VideoPlayer-Title', { FontSize: '13px', FontWeight: '760', TextShadow: '0 1px 4px rgba(0,0,0,.7)' }),
        new Css.Rule('.VideoPlayer-Subtitle', { Color: 'rgba(255,255,255,.72)', FontSize: '9px', MarginTop: '2px', TextShadow: '0 1px 4px rgba(0,0,0,.7)' }),
        new Css.Rule('.VideoPlayer-BigPlay', { AlignItems: 'center', Appearance: 'none', Background: 'rgba(12,14,18,.72)', Border: '1px solid rgba(255,255,255,.28)', BorderRadius: '50%', Color: '#fff', Cursor: 'pointer', Display: 'flex', FontSize: '20px', Height: '56px', JustifyContent: 'center', Left: '50%', Position: 'absolute', Top: '50%', Transform: 'translate(-50%,-50%)', Width: '56px', ZIndex: '5' }),
        new Css.Rule('.VideoPlayer-BigPlay[data-playing="true"],.VideoPlayer-BigPlay[data-provider="youtube"],.VideoPlayer-BigPlay[data-provider="vimeo"]', { Display: 'none' }),
        new Css.Rule('.VideoPlayer-Controls', { AlignItems: 'center', Background: 'linear-gradient(180deg,#24282e,#171a1e)', BorderTop: '1px solid #0d0f12', Display: 'grid', Gap: '6px', GridTemplateColumns: 'auto auto minmax(80px,1fr) auto auto auto auto auto', Padding: '7px 8px' }),
        new Css.Rule('.VideoPlayer-Controls[data-external="true"]', { Display: 'none' }),
        new Css.Rule('.VideoPlayer-Button', { Appearance: 'none', Background: '#2c3137', Border: '1px solid #3a4047', BorderRadius: '4px', Color: '#dbe1e7', Cursor: 'pointer', Font: '650 10px/1 var(--arianna-font,system-ui,sans-serif)', Height: '27px', MinWidth: '28px', Padding: '0 7px' }),
        new Css.Rule('.VideoPlayer-Time', { Color: '#aeb7c1', Font: '9px/1 ui-monospace,SFMono-Regular,Menlo,monospace', WhiteSpace: 'nowrap' }),
        new Css.Rule('.VideoPlayer-Seek', { AccentColor: '#e40c88', Cursor: 'pointer', Margin: '0', MinWidth: '0', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Volume', { AccentColor: '#e40c88', Cursor: 'pointer', Margin: '0', Width: '72px' }),
        new Css.Rule('.VideoPlayer-Rate', { Appearance: 'none', Background: '#20242a', Border: '1px solid #363c44', BorderRadius: '4px', Color: '#dbe1e7', Font: '9px/1 var(--arianna-font,system-ui,sans-serif)', Height: '27px', Padding: '0 5px' }),
        new Css.Rule('.VideoPlayer-Hidden', { Display: 'none' }),
        new Css.Rule('arianna-video-player[theme="light"],.AriannaVideoPlayer[theme="light"]', { Background: '#fff', BorderColor: '#c8cdd3', Color: '#222a33' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Controls,.AriannaVideoPlayer[theme="light"] .VideoPlayer-Controls', { Background: 'linear-gradient(180deg,#fff,#e9ecef)', BorderTopColor: '#c8cdd3' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Button,.AriannaVideoPlayer[theme="light"] .VideoPlayer-Button', { Background: '#fff', BorderColor: '#c4c9cf', Color: '#38424c' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Time,.AriannaVideoPlayer[theme="light"] .VideoPlayer-Time', { Color: '#55616d' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Rate,.AriannaVideoPlayer[theme="light"] .VideoPlayer-Rate', { Background: '#fff', BorderColor: '#c6cbd1', Color: '#38424c' })
    ]);

    @Component('arianna-video-player', Styles, {
        Shadow: false,
        Attributes: ['theme','src','source','poster','title','subtitle','autoplay','muted','loop','show-controls','volume','current','playback-rate','aspect-ratio','fit']
    })
    export class VideoPlayer extends HTMLElement {
        public static readonly Styles = Styles;
        public template = html``;

        constructor(options: Interfaces.Options = {}) {
            super();
            applyOptions(this, options);
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }

        public onConnected(): void {
            this.classList.add('AriannaVideoPlayer');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            this.render();
            this.bind();
            this.syncFromAttributes(true);
        }

        public onAttributeChanged(): void { if(this.isConnected) this.syncFromAttributes(false); }

        public onUnmount(): void {
            const state = Runtime.get(this);
            if(state?.tick) cancelAnimationFrame(state.tick);
        }

        public get provider(): VideoProvider { return detectVideoProvider(this.getAttribute('src') || this.getAttribute('source') || ''); }
        public get media(): HTMLVideoElement | undefined { return Runtime.get(this)?.video; }
        public get duration(): number { const video = this.media; return video && Number.isFinite(video.duration) ? video.duration : 0; }
        public get currentTime(): number { return this.media?.currentTime ?? (Number(this.getAttribute('current') || 0) || 0); }
        public set currentTime(value: number) { this.seek(value); }
        public get paused(): boolean { return this.media?.paused ?? true; }
        public get volume(): number { return this.media?.volume ?? clamp(Number(this.getAttribute('volume') ?? 1), 0, 1); }
        public set volume(value: number) { const next = clamp(Number(value) || 0, 0, 1); this.setAttribute('volume', String(next)); if(this.media) this.media.volume = next; this.updateUI(); }

        public setSource(source: string): this { this.setAttribute('src', source); return this; }

        public async play(): Promise<this> {
            const state = Runtime.get(this);
            if(state?.provider === 'html5') await state.video?.play();
            else this.postProvider('play');
            this.updateUI();
            return this;
        }

        public pause(): this {
            const state = Runtime.get(this);
            if(state?.provider === 'html5') state.video?.pause();
            else this.postProvider('pause');
            this.updateUI();
            return this;
        }

        public toggle(): this {
            if(this.provider === 'html5') this.media?.paused ? void this.play() : this.pause();
            else this.postProvider('play');
            return this;
        }

        public seek(seconds: number): this {
            const next = Math.max(0, Number(seconds) || 0);
            if(this.provider === 'html5' && this.media) this.media.currentTime = Math.min(this.duration || Number.POSITIVE_INFINITY, next);
            else this.postProvider('seek', next);
            this.setAttribute('current', String(next));
            this.updateUI();
            return this;
        }

        public async fullscreen(): Promise<this> {
            const target = this.querySelector<HTMLElement>('.VideoPlayer-Viewport') ?? this;
            if(document.fullscreenElement) await document.exitFullscreen(); else await target.requestFullscreen?.();
            return this;
        }

        public async pictureInPicture(): Promise<this> {
            const video = this.media as HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> };
            const doc = document as Document & { pictureInPictureElement?: Element; exitPictureInPicture?: () => Promise<void> };
            if(!video) return this;
            if(doc.pictureInPictureElement) await doc.exitPictureInPicture?.(); else await video.requestPictureInPicture?.();
            return this;
        }

        private render(): void {
            if(this.querySelector(':scope > .VideoPlayer-Shell')) return;
            const shell = document.createElement('div'); shell.className = 'VideoPlayer-Shell';
            const viewport = document.createElement('div'); viewport.className = 'VideoPlayer-Viewport';
            const overlay = document.createElement('div'); overlay.className = 'VideoPlayer-Overlay';
            const provider = document.createElement('div'); provider.className = 'VideoPlayer-Provider';
            const titleBlock = document.createElement('div'); titleBlock.className = 'VideoPlayer-TitleBlock';
            const title = document.createElement('div'); title.className = 'VideoPlayer-Title';
            const subtitle = document.createElement('div'); subtitle.className = 'VideoPlayer-Subtitle';
            titleBlock.append(title, subtitle);
            const big = document.createElement('button'); big.type = 'button'; big.className = 'VideoPlayer-BigPlay'; big.dataset.action = 'toggle'; big.textContent = '▶';
            viewport.append(overlay, provider, titleBlock, big);

            const controls = document.createElement('div'); controls.className = 'VideoPlayer-Controls';
            const play = this.button('▶', 'toggle');
            const mute = this.button('🔊', 'mute');
            const seek = document.createElement('input'); seek.className = 'VideoPlayer-Seek'; seek.type = 'range'; seek.min = '0'; seek.max = '1'; seek.step = '.01'; seek.value = '0'; seek.dataset.role = 'seek';
            const time = document.createElement('span'); time.className = 'VideoPlayer-Time'; time.textContent = '00:00 / 00:00';
            const volume = document.createElement('input'); volume.className = 'VideoPlayer-Volume'; volume.type = 'range'; volume.min = '0'; volume.max = '1'; volume.step = '.01'; volume.value = '1'; volume.dataset.role = 'volume';
            const rate = document.createElement('select'); rate.className = 'VideoPlayer-Rate'; rate.dataset.role = 'rate';
            [0.5,0.75,1,1.25,1.5,2].forEach(value => { const option = document.createElement('option'); option.value = String(value); option.textContent = `${value}×`; if(value === 1) option.selected = true; rate.appendChild(option); });
            const pip = this.button('▣', 'pip'); pip.title = 'Picture in Picture';
            const full = this.button('⛶', 'fullscreen'); full.title = 'Fullscreen';
            controls.append(play, mute, seek, time, volume, rate, pip, full);
            shell.append(viewport, controls);
            this.replaceChildren(shell);
            Runtime.set(this, { bound: false, tick: 0, seek, volume, time, bigPlay: big, provider: 'unknown' });
        }

        private bind(): void {
            const state = Runtime.get(this);
            if(!state || state.bound) return;
            state.bound = true;
            this.addEventListener('click', event => {
                const action = (event.target as Element | null)?.closest?.('[data-action]') as HTMLElement | null;
                if(!action) return;
                if(action.dataset.action === 'toggle') this.toggle();
                if(action.dataset.action === 'mute' && this.media) { this.media.muted = !this.media.muted; this.toggleAttribute('muted', this.media.muted); this.updateUI(); }
                if(action.dataset.action === 'fullscreen') void this.fullscreen();
                if(action.dataset.action === 'pip') void this.pictureInPicture();
            });
            this.addEventListener('input', event => {
                const input = event.target as HTMLInputElement;
                if(input.dataset.role === 'seek') this.seek(Number(input.value));
                if(input.dataset.role === 'volume') this.volume = Number(input.value);
            });
            this.addEventListener('change', event => {
                const select = event.target as HTMLSelectElement;
                if(select.dataset.role === 'rate' && this.media) this.media.playbackRate = Number(select.value) || 1;
            });
        }

        private syncFromAttributes(forceRebuild: boolean): void {
            const state = Runtime.get(this);
            const viewport = this.querySelector<HTMLElement>('.VideoPlayer-Viewport');
            if(!state || !viewport) return;
            const source = this.getAttribute('src') || this.getAttribute('source') || '';
            const provider = detectVideoProvider(source);
            const providerChanged = forceRebuild || provider !== state.provider;
            state.provider = provider;
            if(providerChanged) this.mountProvider(viewport, source, provider);
            else if(provider === 'html5' && state.video && source && state.video.getAttribute('src') !== source) { state.video.src = source; state.video.load(); }

            if(provider === 'html5' && state.video) {
                const video = state.video;
                const poster = this.getAttribute('poster');
                if(poster) video.poster = poster; else video.removeAttribute('poster');
                video.muted = this.hasAttribute('muted');
                video.loop = this.hasAttribute('loop');
                video.autoplay = this.hasAttribute('autoplay');
                video.volume = clamp(Number(this.getAttribute('volume') ?? video.volume ?? 1), 0, 1);
                video.playbackRate = clamp(Number(this.getAttribute('playback-rate') ?? video.playbackRate ?? 1), .25, 4);
                const requested = Number(this.getAttribute('current'));
                if(Number.isFinite(requested) && Math.abs(video.currentTime - requested) > .05 && video.readyState >= 1)
                    video.currentTime = clamp(requested, 0, this.duration || Number.POSITIVE_INFINITY);
            }

            this.style.setProperty('--VideoPlayer-Aspect', (this.getAttribute('aspect-ratio') || '16/9').replace('/', ' / '));
            this.style.setProperty('--VideoPlayer-Fit', this.getAttribute('fit') || 'contain');
            const title = this.querySelector<HTMLElement>('.VideoPlayer-Title'); if(title) title.textContent = this.getAttribute('title') || '';
            const subtitle = this.querySelector<HTMLElement>('.VideoPlayer-Subtitle'); if(subtitle) subtitle.textContent = this.getAttribute('subtitle') || '';
            const providerNode = this.querySelector<HTMLElement>('.VideoPlayer-Provider'); if(providerNode) providerNode.textContent = provider === 'youtube' ? 'YouTube' : provider === 'vimeo' ? 'Vimeo' : 'H.264 / HTML5';
            const controls = this.querySelector<HTMLElement>('.VideoPlayer-Controls');
            if(controls) {
                controls.dataset.external = String(provider === 'youtube' || provider === 'vimeo');
                controls.classList.toggle('VideoPlayer-Hidden', this.getAttribute('show-controls') === 'false');
            }
            if(state.bigPlay) state.bigPlay.dataset.provider = provider;
            this.updateUI();
        }

        private mountProvider(viewport: HTMLElement, source: string, provider: VideoProvider): void {
            const state = Runtime.get(this);
            if(!state) return;
            state.video?.pause();
            state.video?.remove();
            state.frame?.remove();
            state.video = undefined;
            state.frame = undefined;

            if(provider === 'youtube' || provider === 'vimeo') {
                const frame = document.createElement('iframe');
                frame.className = 'VideoPlayer-Frame';
                frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
                frame.allowFullscreen = true;
                frame.referrerPolicy = 'strict-origin-when-cross-origin';
                if(provider === 'youtube') {
                    const id = youtubeId(source);
                    frame.src = id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&playsinline=1&enablejsapi=1` : source;
                } else {
                    const id = vimeoId(source);
                    frame.src = id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}?title=0&byline=0&portrait=0&playsinline=1&api=1` : source;
                }
                viewport.insertBefore(frame, viewport.firstChild);
                state.frame = frame;
                return;
            }

            const video = document.createElement('video');
            video.className = 'VideoPlayer-Video';
            video.preload = 'metadata';
            video.playsInline = true;
            if(source) video.src = source;
            const poster = this.getAttribute('poster'); if(poster) video.poster = poster;
            video.muted = this.hasAttribute('muted');
            video.loop = this.hasAttribute('loop');
            video.autoplay = this.hasAttribute('autoplay');
            video.volume = clamp(Number(this.getAttribute('volume') ?? 1), 0, 1);
            video.playbackRate = clamp(Number(this.getAttribute('playback-rate') ?? 1), .25, 4);
            viewport.insertBefore(video, viewport.firstChild);
            state.video = video;
            video.addEventListener('loadedmetadata', () => { const current = clamp(Number(this.getAttribute('current') ?? 0), 0, this.duration || Number.POSITIVE_INFINITY); if(current) video.currentTime = current; this.updateUI(); this.emit('arianna:video-ready', { duration: this.duration }); });
            video.addEventListener('play', () => { this.startTick(); this.updateUI(); this.emit('arianna:video-play'); });
            video.addEventListener('pause', () => { this.updateUI(); this.emit('arianna:video-pause'); });
            video.addEventListener('ended', () => { this.updateUI(); this.emit('arianna:video-ended'); });
            video.addEventListener('volumechange', () => this.updateUI());
            if(video.autoplay) void video.play().catch(() => {});
            this.startTick();
        }

        private postProvider(action: 'play' | 'pause' | 'seek', value?: number): void {
            const state = Runtime.get(this);
            const target = state?.frame?.contentWindow;
            if(!target || !state) return;
            if(state.provider === 'youtube') {
                const func = action === 'play' ? 'playVideo' : action === 'pause' ? 'pauseVideo' : 'seekTo';
                target.postMessage(JSON.stringify({ event: 'command', func, args: action === 'seek' ? [value ?? 0, true] : [] }), '*');
            } else if(state.provider === 'vimeo') {
                const method = action === 'play' ? 'play' : action === 'pause' ? 'pause' : 'setCurrentTime';
                target.postMessage({ method, value: action === 'seek' ? value ?? 0 : undefined }, '*');
            }
        }

        private startTick(): void {
            const state = Runtime.get(this);
            if(!state) return;
            if(state.tick) cancelAnimationFrame(state.tick);
            const tick = (): void => { this.updateUI(); if(this.isConnected && state.provider === 'html5') state.tick = requestAnimationFrame(tick); };
            if(state.provider === 'html5') state.tick = requestAnimationFrame(tick);
        }

        private updateUI(): void {
            const state = Runtime.get(this);
            const video = state?.video;
            if(!state || !video) return;
            if(state.seek) { state.seek.max = String(this.duration || 1); state.seek.value = String(video.currentTime || 0); }
            if(state.volume) state.volume.value = String(video.volume);
            if(state.time) state.time.textContent = `${this.format(video.currentTime)} / ${this.format(this.duration)}`;
            if(state.bigPlay) state.bigPlay.dataset.playing = String(!video.paused);
            const play = this.querySelector<HTMLButtonElement>('[data-action="toggle"]:not(.VideoPlayer-BigPlay)'); if(play) play.textContent = video.paused ? '▶' : '❚❚';
            const mute = this.querySelector<HTMLButtonElement>('[data-action="mute"]'); if(mute) mute.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊';
        }

        private button(text: string, action: string): HTMLButtonElement {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'VideoPlayer-Button'; button.dataset.action = action; button.textContent = text; return button;
        }

        private format(seconds: number): string {
            const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
            const hours = Math.floor(safe / 3600), minutes = Math.floor((safe % 3600) / 60), secs = Math.floor(safe % 60);
            return hours > 0 ? `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}` : `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        }

        private emit(type: string, detail: Record<string, unknown> = {}): void {
            this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, player: this, source: this } }));
        }
    }
}

export const VideoPlayerComponent = VideoPlayer.VideoPlayer;
export { VideoPlayerComponent as AriannaVideoPlayer };
export default VideoPlayer.VideoPlayer;
