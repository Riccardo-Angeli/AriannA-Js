/**
 * @module    components/audio/AudioPlayer
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * AudioPlayer — Web Audio file player with TransportBar UI.
 *
 * Routes through Web Audio so the output can be connected to a ChannelStrip
 * or any other AudioComponent. Loads files via `<audio>` (HTMLMediaElement)
 * piped into `createMediaElementSource()`.
 *
 *   const player = new AudioPlayer({ src: 'song.mp3' });
 *   const strip  = new ChannelStrip();
 *   player.connect(strip).connect(AudioComponent.context.destination);
 *   player.append(document.body);
 *
 *   <arianna-audio-player src="song.mp3" autoplay></arianna-audio-player>
 *
 * Events fired:
 *   arianna:audio-load       { duration }
 *   arianna:audio-play
 *   arianna:audio-pause
 *   arianna:audio-ended
 *   arianna:audio-time       { current, duration }
 *   arianna:audio-error      { error }
 */

import { AudioComponent, type AudioComponentOptions } from './AudioComponent.ts';
import { TransportBar } from './TransportBar.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface AudioPlayerOptions extends AudioComponentOptions {
    src?     : string;
    autoplay?: boolean;
    loop?    : boolean;
    label?   : string;
}

export class AudioPlayer extends AudioComponent {
    static readonly tag = 'arianna-audio-player';

    readonly src$    : Signal<string>  = signal('');
    readonly label$  : Signal<string>  = signal('');
    readonly loading$: Signal<boolean> = signal(false);

    #audio?  : HTMLAudioElement;
    #source? : MediaElementAudioSourceNode;
    #gain?   : GainNode;
    #transport?: TransportBar;
    #rafId   = 0;

    constructor(opts: AudioPlayerOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.src)      el.setAttribute('src',    opts.src);
        if (opts.autoplay) el.setAttribute('autoplay', '');
        if (opts.loop)     el.setAttribute('loop',     '');
        if (opts.label)    el.setAttribute('label',  opts.label);
        if (opts.src)   this.src$.set(opts.src);
        if (opts.label) this.label$.set(opts.label);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.ap-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'ap-wrap';

        // Label (optional)
        const label = document.createElement('div');
        label.className = 'ap-label';
        const sLabel = self.attrSignal('label');
        effect(() => {
            const v = sLabel?.get() ?? this.label$.get();
            label.textContent = v ?? '';
            label.style.display = v ? '' : 'none';
        });

        // Hidden <audio> element (controls disabled — we drive it via TransportBar)
        const audio = document.createElement('audio') as HTMLAudioElement;
        audio.preload = 'metadata';
        audio.crossOrigin = 'anonymous';
        audio.style.display = 'none';
        this.#audio = audio;

        // TransportBar
        const transport = new TransportBar();
        this.#transport = transport;

        wrap.appendChild(label);
        wrap.appendChild(audio);
        const tEl = (transport as unknown as { render(): HTMLElement }).render();
        wrap.appendChild(tEl);
        root.appendChild(wrap);

        // Reactive src binding (attr OR signal)
        const sSrc = self.attrSignal('src');
        effect(() => {
            const v = sSrc?.get() ?? this.src$.get();
            if (v && v !== audio.src) {
                this.loading$.set(true);
                audio.src = v;
                audio.load();
            }
        });

        // Wire audio events → component events + transport state
        audio.addEventListener('loadedmetadata', () => {
            transport.setDuration(audio.duration || 0);
            this.loading$.set(false);
            self.fire('arianna:audio-load', { detail: { duration: audio.duration, source: this }, bubbles: true });
            if (audio.hasAttribute('autoplay') || root.hasAttribute('autoplay')) {
                void audio.play().catch(() => { /* autoplay rejected */ });
            }
        });
        audio.addEventListener('play', () => {
            transport.setPlaying(true);
            self.fire('arianna:audio-play', { detail: { source: this }, bubbles: true });
            this.#startTimeUpdater();
        });
        audio.addEventListener('pause', () => {
            transport.setPlaying(false);
            self.fire('arianna:audio-pause', { detail: { source: this }, bubbles: true });
            this.#stopTimeUpdater();
        });
        audio.addEventListener('ended', () => {
            transport.setPlaying(false);
            transport.setCurrentTime(0);
            self.fire('arianna:audio-ended', { detail: { source: this }, bubbles: true });
            this.#stopTimeUpdater();
        });
        audio.addEventListener('error', () => {
            this.loading$.set(false);
            self.fire('arianna:audio-error', { detail: { error: audio.error, source: this }, bubbles: true });
        });

        // Transport events → audio control
        const tEl2 = tEl;
        tEl2.addEventListener('arianna:transport-play',   () => { void audio.play().catch(() => {}); });
        tEl2.addEventListener('arianna:transport-pause',  () => audio.pause());
        tEl2.addEventListener('arianna:transport-stop',   () => { audio.pause(); audio.currentTime = 0; });
        tEl2.addEventListener('arianna:transport-seek',   (e: Event) => {
            const t = (e as CustomEvent<{ time: number }>).detail.time;
            audio.currentTime = t;
        });
        tEl2.addEventListener('arianna:transport-volume', (e: Event) => {
            const v = (e as CustomEvent<{ value: number }>).detail.value;
            if (this.#gain) this.#gain.gain.value = v;
        });

        // Loop
        effect(() => {
            audio.loop = root.hasAttribute('loop');
        });

        self.Sheet = AudioPlayer.DefaultSheet();
    }

    protected _buildAudioGraph(): void {
        if (!this.#audio) return;
        this._audioCtx = this._audioCtx ?? AudioComponent.context;
        this.#source = this._audioCtx.createMediaElementSource(this.#audio);
        this.#gain   = this._audioCtx.createGain();
        this.#source.connect(this.#gain);
        this._input  = this.#source;
        this._output = this.#gain;
    }

    onMount() {
        super.onMount();
        // _buildAudioGraph already invoked by AudioComponent.onMount() default
    }

    onUnmount() {
        this.#stopTimeUpdater();
        if (this.#audio) {
            try { this.#audio.pause(); } catch { /* ignore */ }
        }
        super.onUnmount();
    }

    #startTimeUpdater(): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const tick = () => {
            if (!this.#audio || this.#audio.paused) { this.#rafId = 0; return; }
            const cur = this.#audio.currentTime;
            const dur = this.#audio.duration || 0;
            this.#transport?.setCurrentTime(cur);
            self.fire('arianna:audio-time', { detail: { current: cur, duration: dur, source: this }, bubbles: true });
            this.#rafId = requestAnimationFrame(tick);
        };
        this.#rafId = requestAnimationFrame(tick);
    }

    #stopTimeUpdater(): void {
        if (this.#rafId) cancelAnimationFrame(this.#rafId);
        this.#rafId = 0;
    }

    /** Public API: set source. */
    setSource(src: string): this {
        this.src$.set(src);
        const self = this as unknown as { render(): HTMLElement };
        self.render().setAttribute('src', src);
        return this;
    }

    /** Public API: control playback. */
    play(): Promise<void> { return this.#audio?.play() ?? Promise.resolve(); }
    pause(): void         { this.#audio?.pause(); }
    seek(t: number): void { if (this.#audio) this.#audio.currentTime = t; }

    get duration(): number    { return this.#audio?.duration ?? 0; }
    get currentTime(): number { return this.#audio?.currentTime ?? 0; }
    get isPlaying(): boolean  { return this.#audio ? !this.#audio.paused : false; }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #e0e0e0)',
                display     : 'inline-block',
                padding     : '8px',
            }),
            new Rule(':host .ap-wrap', {
                display      : 'flex',
                flexDirection: 'column',
                gap          : '6px',
            }),
            new Rule(':host .ap-label', {
                color    : 'var(--ar-muted, #888)',
                fontSize : '0.8rem',
                padding  : '0 4px',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AudioPlayer', {
        value: AudioPlayer, writable: false, enumerable: false, configurable: false,
    });
}

export default AudioPlayer;
