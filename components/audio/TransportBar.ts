/**
 * @module    components/audio/TransportBar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * TransportBar — generic playback control bar:
 *   ◀◀  ▶/❚❚  ■  ▶▶   [─────────●────] 00:42 / 03:17   [vol ──●─]
 *
 * This is a pure UI widget. It does NOT own audio — it emits events that
 * a parent (AudioPlayer, VideoPlayer, custom host) listens to and mirrors
 * back via `setCurrentTime()` / `setDuration()` / `setPlaying()`.
 *
 *   const bar = new TransportBar();
 *   bar.append(document.body);
 *   bar.on('arianna:transport-play',   () => audio.play());
 *   bar.on('arianna:transport-pause',  () => audio.pause());
 *   bar.on('arianna:transport-seek',   e => audio.currentTime = e.detail.time);
 *   bar.on('arianna:transport-volume', e => audio.volume = e.detail.value);
 *   // Update from the audio element
 *   audio.addEventListener('timeupdate', () => bar.setCurrentTime(audio.currentTime));
 *
 *   <arianna-transport-bar duration="217" current="42"></arianna-transport-bar>
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface TransportBarOptions {
    duration?  : number;     // seconds
    current?   : number;     // seconds
    playing?   : boolean;
    volume?    : number;     // 0..1
    showVolume?: boolean;    // default true
    showStop?  : boolean;    // default true
    showSkip?  : boolean;    // default false (rew/ffwd buttons)
}

function fmtTime(s: number): string {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export class TransportBar extends Component('arianna-transport-bar', HTMLElement, {}, {
    attrs : ['duration', 'current', 'playing', 'volume', 'show-volume', 'show-stop', 'show-skip'],
})
{
    readonly playing$ : Signal<boolean> = signal(false);
    readonly current$ : Signal<number>  = signal(0);
    readonly duration$: Signal<number>  = signal(0);
    readonly volume$  : Signal<number>  = signal(1);

    constructor(opts: TransportBarOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.duration   != null) el.setAttribute('duration',    String(opts.duration));
        if (opts.current    != null) el.setAttribute('current',     String(opts.current));
        if (opts.playing)            el.setAttribute('playing',     '');
        if (opts.volume     != null) el.setAttribute('volume',      String(opts.volume));
        if (opts.showVolume === false) el.setAttribute('show-volume', 'false');
        if (opts.showStop   === false) el.setAttribute('show-stop',   'false');
        if (opts.showSkip)             el.setAttribute('show-skip',   '');
        if (opts.duration != null) this.duration$.set(opts.duration);
        if (opts.current  != null) this.current$.set(opts.current);
        if (opts.playing)          this.playing$.set(true);
        if (opts.volume   != null) this.volume$.set(opts.volume);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.children.length) return;   // already built (markup-driven)

        // Build buttons
        const btnSkipBack = document.createElement('button');
        btnSkipBack.className = 'tb-btn tb-skip-back';
        btnSkipBack.type = 'button';
        btnSkipBack.setAttribute('aria-label', 'rewind 10s');
        btnSkipBack.textContent = '◀◀';

        const btnPlay = document.createElement('button');
        btnPlay.className = 'tb-btn tb-play';
        btnPlay.type = 'button';
        btnPlay.setAttribute('aria-label', 'play / pause');

        const btnStop = document.createElement('button');
        btnStop.className = 'tb-btn tb-stop';
        btnStop.type = 'button';
        btnStop.setAttribute('aria-label', 'stop');
        btnStop.textContent = '■';

        const btnSkipFwd = document.createElement('button');
        btnSkipFwd.className = 'tb-btn tb-skip-fwd';
        btnSkipFwd.type = 'button';
        btnSkipFwd.setAttribute('aria-label', 'forward 10s');
        btnSkipFwd.textContent = '▶▶';

        // Seek slider
        const seek = document.createElement('input') as HTMLInputElement;
        seek.type = 'range';
        seek.className = 'tb-seek';
        seek.min = '0';
        seek.max = '1000';
        seek.step = '1';
        seek.value = '0';

        // Time display
        const time = document.createElement('span');
        time.className = 'tb-time';

        // Volume slider
        const vol = document.createElement('input') as HTMLInputElement;
        vol.type = 'range';
        vol.className = 'tb-volume';
        vol.min = '0';
        vol.max = '1000';
        vol.step = '1';
        vol.value = '1000';

        // Visibility controls
        const sShowVol  = self.attrSignal('show-volume');
        const sShowStop = self.attrSignal('show-stop');
        const sShowSkip = self.attrSignal('show-skip');
        effect(() => {
            btnSkipBack.style.display = (sShowSkip?.get() != null) ? '' : 'none';
            btnSkipFwd .style.display = (sShowSkip?.get() != null) ? '' : 'none';
        });
        effect(() => {
            btnStop.style.display = (sShowStop?.get() === 'false') ? 'none' : '';
        });
        effect(() => {
            vol.style.display = (sShowVol?.get() === 'false') ? 'none' : '';
        });

        // Reactive bindings
        effect(() => {
            btnPlay.textContent = this.playing$.get() ? '❚❚' : '▶';
        });
        effect(() => {
            const cur = this.current$.get();
            const dur = this.duration$.get();
            time.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
            if (dur > 0 && !seek.matches(':active') && document.activeElement !== seek) {
                seek.value = String(Math.round((cur / dur) * 1000));
            }
        });
        effect(() => {
            vol.value = String(Math.round(this.volume$.get() * 1000));
        });

        // Event wiring
        btnPlay.addEventListener('click', () => {
            const next = !this.playing$.get();
            this.playing$.set(next);
            self.fire(next ? 'arianna:transport-play' : 'arianna:transport-pause',
                { detail: { source: this }, bubbles: true });
        });
        btnStop.addEventListener('click', () => {
            this.playing$.set(false);
            this.current$.set(0);
            self.fire('arianna:transport-stop', { detail: { source: this }, bubbles: true });
        });
        btnSkipBack.addEventListener('click', () => {
            const t = Math.max(0, this.current$.get() - 10);
            this.current$.set(t);
            self.fire('arianna:transport-seek', { detail: { time: t, source: this }, bubbles: true });
        });
        btnSkipFwd.addEventListener('click', () => {
            const t = Math.min(this.duration$.get(), this.current$.get() + 10);
            this.current$.set(t);
            self.fire('arianna:transport-seek', { detail: { time: t, source: this }, bubbles: true });
        });
        seek.addEventListener('input', () => {
            const dur = this.duration$.get();
            const t = (parseInt(seek.value, 10) / 1000) * dur;
            this.current$.set(t);
            self.fire('arianna:transport-seek', { detail: { time: t, source: this }, bubbles: true });
        });
        vol.addEventListener('input', () => {
            const v = parseInt(vol.value, 10) / 1000;
            this.volume$.set(v);
            self.fire('arianna:transport-volume', { detail: { value: v, source: this }, bubbles: true });
        });

        root.appendChild(btnSkipBack);
        root.appendChild(btnPlay);
        root.appendChild(btnStop);
        root.appendChild(btnSkipFwd);
        root.appendChild(seek);
        root.appendChild(time);
        root.appendChild(vol);

        self.Sheet = TransportBar.DefaultSheet();
    }

    /** Push external state in from the audio source. */
    setCurrentTime(s: number): this { this.current$.set(s); return this; }
    setDuration(s: number): this    { this.duration$.set(s); return this; }
    setPlaying(p: boolean): this    { this.playing$.set(p); return this; }
    setVolume(v: number): this      { this.volume$.set(Math.max(0, Math.min(1, v))); return this; }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                alignItems   : 'center',
                background   : 'var(--ar-bg2, #161616)',
                border       : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius : 'var(--ar-radius, 5px)',
                color        : 'var(--ar-text, #e0e0e0)',
                display      : 'inline-flex',
                font         : 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                gap          : '6px',
                padding      : '6px 10px',
            }),
            new Rule(':host .tb-btn', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'inherit',
                cursor      : 'pointer',
                font        : 'inherit',
                minWidth    : '32px',
                padding     : '4px 8px',
                transition  : 'background var(--ar-transition, 0.14s)',
            }),
            new Rule(':host .tb-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
            new Rule(':host .tb-play', { minWidth: '40px' }),
            new Rule(':host .tb-seek', { flex: '1 1 160px', minWidth: '120px', accentColor: 'var(--ar-primary, #7eb8f7)' }),
            new Rule(':host .tb-volume', { width: '90px', accentColor: 'var(--ar-primary, #7eb8f7)' }),
            new Rule(':host .tb-time', {
                color     : 'var(--ar-muted, #888)',
                fontSize  : '0.78rem',
                fontVariantNumeric: 'tabular-nums',
                minWidth  : '90px',
                textAlign : 'center',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'TransportBar', {
        value: TransportBar, writable: false, enumerable: false, configurable: false,
    });
}

export default TransportBar;
