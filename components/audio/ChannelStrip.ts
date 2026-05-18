/**
 * @module    components/audio/ChannelStrip
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * ChannelStrip — mixing-console style channel strip:
 *
 *   ┌─────────┐
 *   │  LABEL  │
 *   │ ▓▓ │ ▓▓ │ ← VU meter (stereo)
 *   │ ──●──── │ ← gain fader
 *   │ ──●──── │ ← pan
 *   │ [M] [S] │ ← mute / solo
 *   └─────────┘
 *
 *   const strip = new ChannelStrip({ name: 'Vocals' });
 *   player.connect(strip).connect(AudioComponent.context.destination);
 *
 *   <arianna-channel-strip name="Vocals" gain="0.8" pan="0"></arianna-channel-strip>
 *
 * Audio graph:  in → gain → pan(StereoPanner) → analyser(meter) → out
 *
 * Events:
 *   arianna:strip-gain   { value }
 *   arianna:strip-pan    { value }
 *   arianna:strip-mute   { value: boolean }
 *   arianna:strip-solo   { value: boolean }
 */

import { AudioComponent, type AudioComponentOptions } from './AudioComponent.ts';
import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface ChannelStripOptions extends AudioComponentOptions {
    name?    : string;
    gain?    : number;       // 0..1 (or higher for >0dB)
    pan?     : number;       // -1..1
    muted?   : boolean;
    soloed?  : boolean;
    meter?   : boolean;      // default true
}

export class ChannelStrip extends AudioComponent {
    static readonly tag = 'arianna-channel-strip';

    readonly gain$  : Signal<number>  = signal(1);
    readonly pan$   : Signal<number>  = signal(0);
    readonly muted$ : Signal<boolean> = signal(false);
    readonly soloed$: Signal<boolean> = signal(false);

    #gain?    : GainNode;
    #pan?     : StereoPannerNode;
    #analyser?: AnalyserNode;
    #meterL?  : HTMLDivElement;
    #meterR?  : HTMLDivElement;
    #meterRaf = 0;

    constructor(opts: ChannelStripOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.name)              el.setAttribute('name',  opts.name);
        if (opts.gain  != null)     el.setAttribute('gain',  String(opts.gain));
        if (opts.pan   != null)     el.setAttribute('pan',   String(opts.pan));
        if (opts.muted)             el.setAttribute('muted',  '');
        if (opts.soloed)            el.setAttribute('soloed', '');
        if (opts.meter === false)   el.setAttribute('meter',  'false');
        if (opts.gain  != null) this.gain$.set(opts.gain);
        if (opts.pan   != null) this.pan$.set(opts.pan);
        if (opts.muted)         this.muted$.set(true);
        if (opts.soloed)        this.soloed$.set(true);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Sheet | null;
        };
        const root = self.render();
        if (root.querySelector('.cs-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'cs-wrap';

        // Label
        const label = document.createElement('div');
        label.className = 'cs-label';
        const sName = self.attrSignal('name');
        effect(() => { label.textContent = sName?.get() ?? 'Channel'; });

        // VU meter (stereo, vertical)
        const meter = document.createElement('div');
        meter.className = 'cs-meter';
        const meterL = document.createElement('div');
        meterL.className = 'cs-meter-bar cs-meter-l';
        const meterR = document.createElement('div');
        meterR.className = 'cs-meter-bar cs-meter-r';
        meter.appendChild(meterL);
        meter.appendChild(meterR);
        this.#meterL = meterL;
        this.#meterR = meterR;

        // Gain fader (vertical slider)
        const gainWrap = document.createElement('div');
        gainWrap.className = 'cs-fader-wrap';
        const gainLabel = document.createElement('span');
        gainLabel.className = 'cs-fader-label';
        gainLabel.textContent = 'GAIN';
        const gain = document.createElement('input') as HTMLInputElement;
        gain.type = 'range';
        gain.className = 'cs-gain';
        gain.min = '0';
        gain.max = '1500';      // up to +3.5dB (1.5x)
        gain.step = '1';
        gain.value = String(Math.round(this.gain$.get() * 1000));
        const gainVal = document.createElement('span');
        gainVal.className = 'cs-fader-val';
        gainWrap.appendChild(gainLabel);
        gainWrap.appendChild(gain);
        gainWrap.appendChild(gainVal);

        // Pan knob
        const panWrap = document.createElement('div');
        panWrap.className = 'cs-pan-wrap';
        const panLabel = document.createElement('span');
        panLabel.className = 'cs-fader-label';
        panLabel.textContent = 'PAN';
        const pan = document.createElement('input') as HTMLInputElement;
        pan.type = 'range';
        pan.className = 'cs-pan';
        pan.min = '-1000';
        pan.max = '1000';
        pan.step = '1';
        pan.value = String(Math.round(this.pan$.get() * 1000));
        const panVal = document.createElement('span');
        panVal.className = 'cs-fader-val';
        panWrap.appendChild(panLabel);
        panWrap.appendChild(pan);
        panWrap.appendChild(panVal);

        // Mute / Solo
        const btns = document.createElement('div');
        btns.className = 'cs-btns';
        const btnMute = document.createElement('button');
        btnMute.type = 'button';
        btnMute.className = 'cs-btn cs-mute';
        btnMute.textContent = 'M';
        btnMute.setAttribute('aria-label', 'mute');
        const btnSolo = document.createElement('button');
        btnSolo.type = 'button';
        btnSolo.className = 'cs-btn cs-solo';
        btnSolo.textContent = 'S';
        btnSolo.setAttribute('aria-label', 'solo');
        btns.appendChild(btnMute);
        btns.appendChild(btnSolo);

        wrap.appendChild(label);
        wrap.appendChild(meter);
        wrap.appendChild(gainWrap);
        wrap.appendChild(panWrap);
        wrap.appendChild(btns);
        root.appendChild(wrap);

        // Reactive bindings
        effect(() => {
            const g = this.gain$.get();
            if (gain.value !== String(Math.round(g * 1000))) gain.value = String(Math.round(g * 1000));
            gainVal.textContent = g === 0 ? '-∞' : (20 * Math.log10(g)).toFixed(1) + ' dB';
            if (this.#gain) this.#gain.gain.value = this.muted$.get() ? 0 : g;
        });
        effect(() => {
            const p = this.pan$.get();
            if (pan.value !== String(Math.round(p * 1000))) pan.value = String(Math.round(p * 1000));
            const lbl = p === 0 ? 'C' : (p < 0 ? `L${Math.round(-p * 100)}` : `R${Math.round(p * 100)}`);
            panVal.textContent = lbl;
            if (this.#pan) this.#pan.pan.value = p;
        });
        effect(() => {
            const m = this.muted$.get();
            btnMute.classList.toggle('active', m);
            if (this.#gain) this.#gain.gain.value = m ? 0 : this.gain$.get();
        });
        effect(() => {
            btnSolo.classList.toggle('active', this.soloed$.get());
        });

        // Event handlers
        gain.addEventListener('input', () => {
            const v = parseInt(gain.value, 10) / 1000;
            this.gain$.set(v);
            self.fire('arianna:strip-gain', { detail: { value: v, source: this }, bubbles: true });
        });
        pan.addEventListener('input', () => {
            const v = parseInt(pan.value, 10) / 1000;
            this.pan$.set(v);
            self.fire('arianna:strip-pan', { detail: { value: v, source: this }, bubbles: true });
        });
        btnMute.addEventListener('click', () => {
            const v = !this.muted$.get();
            this.muted$.set(v);
            self.fire('arianna:strip-mute', { detail: { value: v, source: this }, bubbles: true });
        });
        btnSolo.addEventListener('click', () => {
            const v = !this.soloed$.get();
            this.soloed$.set(v);
            self.fire('arianna:strip-solo', { detail: { value: v, source: this }, bubbles: true });
        });

        self.Sheet = ChannelStrip.DefaultSheet();
    }

    protected _buildAudioGraph(): void {
        this._audioCtx = this._audioCtx ?? AudioComponent.context;
        const ctx = this._audioCtx;
        this.#gain     = ctx.createGain();
        this.#pan      = ctx.createStereoPanner();
        this.#analyser = ctx.createAnalyser();
        this.#analyser.fftSize = 256;
        this.#gain.gain.value = this.muted$.get() ? 0 : this.gain$.get();
        this.#pan.pan.value   = this.pan$.get();
        this.#gain.connect(this.#pan);
        this.#pan.connect(this.#analyser);
        this._input  = this.#gain;
        this._output = this.#analyser;
        this.#startMeter();
    }

    #startMeter(): void {
        if (!this.#analyser || !this.#meterL || !this.#meterR) return;
        const buf = new Float32Array(this.#analyser.fftSize);
        const tick = () => {
            if (!this.#analyser || !this.#meterL || !this.#meterR) { this.#meterRaf = 0; return; }
            this.#analyser.getFloatTimeDomainData(buf);
            // Compute peak (simplified mono — true stereo metering would split L/R)
            let peak = 0;
            for (let i = 0; i < buf.length; i++) {
                const v = Math.abs(buf[i] ?? 0);
                if (v > peak) peak = v;
            }
            // Map [0..1] linear → 0..100% with a soft log curve
            const pct = Math.min(100, peak * 140);
            this.#meterL.style.height = pct + '%';
            this.#meterR.style.height = pct + '%';
            this.#meterRaf = requestAnimationFrame(tick);
        };
        this.#meterRaf = requestAnimationFrame(tick);
    }

    onUnmount() {
        if (this.#meterRaf) cancelAnimationFrame(this.#meterRaf);
        this.#meterRaf = 0;
        super.onUnmount();
    }

    /** Public API */
    setGain(v: number): this   { this.gain$.set(Math.max(0, v)); return this; }
    setPan(v: number): this    { this.pan$.set(Math.max(-1, Math.min(1, v))); return this; }
    setMuted(v: boolean): this { this.muted$.set(v); return this; }
    setSoloed(v: boolean): this { this.soloed$.set(v); return this; }

    get gain(): number   { return this.gain$.get(); }
    get pan(): number    { return this.pan$.get(); }
    get muted(): boolean { return this.muted$.get(); }
    get soloed(): boolean { return this.soloed$.get(); }

    static DefaultSheet(): Sheet {
        return new Sheet([
            new Rule(':root', {
                background  : 'var(--ar-bg2, #161616)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #e0e0e0)',
                display     : 'inline-block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                padding     : '10px',
                width       : '120px',
            }),
            new Rule(':root .cs-wrap', {
                alignItems   : 'stretch',
                display      : 'flex',
                flexDirection: 'column',
                gap          : '8px',
                height       : '320px',
            }),
            new Rule(':root .cs-label', {
                fontWeight    : '600',
                overflow      : 'hidden',
                textAlign     : 'center',
                textOverflow  : 'ellipsis',
                whiteSpace    : 'nowrap',
            }),
            new Rule(':root .cs-meter', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                display     : 'flex',
                gap         : '2px',
                height      : '60px',
                padding     : '2px',
            }),
            new Rule(':root .cs-meter-bar', {
                alignSelf      : 'flex-end',
                background     : 'linear-gradient(to top, #4caf50 0%, #ffeb3b 70%, #f44336 100%)',
                flex           : '1',
                height         : '0%',
                transition     : 'height 0.06s linear',
            }),
            new Rule(':root .cs-fader-wrap, :root .cs-pan-wrap', {
                alignItems    : 'center',
                display       : 'flex',
                flexDirection : 'column',
                gap           : '4px',
            }),
            new Rule(':root .cs-fader-label', {
                color    : 'var(--ar-muted, #888)',
                fontSize : '0.65rem',
                letterSpacing: '0.05em',
            }),
            new Rule(':root .cs-gain, :root .cs-pan', {
                accentColor: 'var(--ar-primary, #7eb8f7)',
                width      : '100%',
            }),
            new Rule(':root .cs-fader-val', {
                color    : 'var(--ar-text, #e0e0e0)',
                fontSize : '0.7rem',
                fontVariantNumeric: 'tabular-nums',
            }),
            new Rule(':root .cs-btns', {
                display: 'flex',
                gap    : '4px',
                justifyContent: 'center',
            }),
            new Rule(':root .cs-btn', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.75rem',
                padding     : '4px 10px',
                transition  : 'all var(--ar-transition, 0.14s)',
            }),
            new Rule(':root .cs-mute.active', {
                background: 'var(--ar-danger, #f44336)',
                color     : '#fff',
            }),
            new Rule(':root .cs-solo.active', {
                background: 'var(--ar-warning, #ff9800)',
                color     : '#fff',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ChannelStrip', {
        value: ChannelStrip, writable: false, enumerable: false, configurable: false,
    });
}

export default ChannelStrip;
