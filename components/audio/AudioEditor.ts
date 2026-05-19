/**
 * @module    components/audio/AudioEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * AudioEditor — waveform editor for a single AudioBuffer.
 *
 * Features:
 *   • Load file via setSource(url) or setBuffer(AudioBuffer)
 *   • Visual waveform on <canvas> (downsampled peaks)
 *   • Click-drag to select a region
 *   • Wheel zoom in / out (mouse-anchored)
 *   • Crop selection (destructive — replaces internal buffer)
 *   • Fade in / Fade out on selection
 *   • Play / stop the selection through the audio graph
 *   • Output AudioNode = a re-routable GainNode fed by an offline buffer
 *
 *   const ed = new AudioEditor();
 *   ed.append(document.body);
 *   await ed.setSource('vocal.mp3');
 *   ed.connect(AudioComponent.context.destination);
 *
 *   <arianna-audio-editor src="vocal.mp3"></arianna-audio-editor>
 *
 * Events:
 *   arianna:editor-load       { duration }
 *   arianna:editor-selection  { start, end }
 *   arianna:editor-zoom       { samplesPerPx }
 *   arianna:editor-crop       { start, end }
 *   arianna:editor-fade       { kind: 'in' | 'out', start, end }
 *   arianna:editor-play
 *   arianna:editor-stop
 */

import { AudioComponent, type AudioComponentOptions } from './AudioComponent.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface AudioEditorOptions extends AudioComponentOptions {
    src?     : string;
    width?   : number;
    height?  : number;
    /** Waveform foreground colour (default uses CSS var). */
    waveColor?    : string;
    selectionColor?: string;
}

export class AudioEditor extends AudioComponent {
    static readonly tag = 'arianna-audio-editor';

    readonly buffer$    : Signal<AudioBuffer | null> = signal<AudioBuffer | null>(null);
    readonly selection$ : Signal<{ start: number; end: number } | null> = signal<{ start: number; end: number } | null>(null);
    readonly samplesPerPx$: Signal<number> = signal(256);
    readonly playing$   : Signal<boolean> = signal(false);

    #canvas?    : HTMLCanvasElement;
    #ctx?       : CanvasRenderingContext2D;
    #scrollX    = 0;
    #gainOut?   : GainNode;
    #playSrc?   : AudioBufferSourceNode;

    constructor(opts: AudioEditorOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.src)            el.setAttribute('src',    opts.src);
        if (opts.width  != null) el.setAttribute('width',  String(opts.width));
        if (opts.height != null) el.setAttribute('height', String(opts.height));
        if (opts.waveColor)      el.setAttribute('wave-color', opts.waveColor);
        if (opts.selectionColor) el.setAttribute('selection-color', opts.selectionColor);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.ae-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'ae-wrap';

        // Toolbar
        const tb = document.createElement('div');
        tb.className = 'ae-toolbar';
        const mkBtn = (label: string, cls: string) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'ae-btn ' + cls;
            b.textContent = label;
            return b;
        };
        const btnPlay  = mkBtn('▶', 'ae-play');
        const btnStop  = mkBtn('■', 'ae-stop');
        const btnZIn   = mkBtn('+', 'ae-zoom-in');
        const btnZOut  = mkBtn('−', 'ae-zoom-out');
        const btnFadeI = mkBtn('Fade ▶', 'ae-fade-in');
        const btnFadeO = mkBtn('◀ Fade', 'ae-fade-out');
        const btnCrop  = mkBtn('Crop', 'ae-crop');
        tb.append(btnPlay, btnStop, btnZIn, btnZOut, btnFadeI, btnFadeO, btnCrop);

        // Canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'ae-canvas';
        const sW = self.attrSignal('width');
        const sH = self.attrSignal('height');
        const w = parseInt(sW?.peek() ?? '800', 10) || 800;
        const h = parseInt(sH?.peek() ?? '160', 10) || 160;
        canvas.width = w;
        canvas.height = h;
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d') ?? undefined;

        // Status line
        const status = document.createElement('div');
        status.className = 'ae-status';

        wrap.append(tb, canvas, status);
        root.appendChild(wrap);

        effect(() => {
            const sel = this.selection$.get();
            const buf = this.buffer$.get();
            if (!buf) { status.textContent = 'No audio loaded'; return; }
            const dur = buf.duration;
            if (sel) {
                const len = sel.end - sel.start;
                status.textContent = `Selection: ${sel.start.toFixed(2)}s – ${sel.end.toFixed(2)}s (${len.toFixed(2)}s) · Total ${dur.toFixed(2)}s`;
            } else {
                status.textContent = `Loaded: ${dur.toFixed(2)}s · ${buf.numberOfChannels}ch @ ${buf.sampleRate}Hz`;
            }
            this.#redraw();
        });
        effect(() => { this.samplesPerPx$.get(); this.#redraw(); });

        // Source attribute reactive
        const sSrc = self.attrSignal('src');
        effect(() => {
            const v = sSrc?.get();
            if (v) void this.setSource(v);
        });

        // Mouse interaction — selection
        let dragStart = -1;
        canvas.addEventListener('pointerdown', (e: PointerEvent) => {
            if (!this.buffer$.get()) return;
            canvas.setPointerCapture(e.pointerId);
            const r = canvas.getBoundingClientRect();
            dragStart = this.#pxToTime(e.clientX - r.left);
            this.selection$.set({ start: dragStart, end: dragStart });
        });
        canvas.addEventListener('pointermove', (e: PointerEvent) => {
            if (dragStart < 0) return;
            const r = canvas.getBoundingClientRect();
            const t = this.#pxToTime(e.clientX - r.left);
            const start = Math.min(dragStart, t);
            const end   = Math.max(dragStart, t);
            this.selection$.set({ start, end });
        });
        canvas.addEventListener('pointerup', (e: PointerEvent) => {
            canvas.releasePointerCapture(e.pointerId);
            if (dragStart < 0) return;
            const sel = this.selection$.peek();
            dragStart = -1;
            if (sel && sel.end - sel.start < 0.001) {
                this.selection$.set(null);
            } else if (sel) {
                self.fire('arianna:editor-selection', { detail: { ...sel, source: this }, bubbles: true });
            }
        });

        // Wheel zoom (mouse-anchored)
        canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            const buf = this.buffer$.peek();
            if (!buf) return;
            const r = canvas.getBoundingClientRect();
            const mx = e.clientX - r.left;
            const tAnchor = this.#pxToTime(mx);
            const spp = this.samplesPerPx$.peek();
            const factor = e.deltaY > 0 ? 1.25 : 0.8;
            const next = Math.max(1, Math.min(buf.sampleRate * buf.duration / canvas.width, spp * factor));
            this.samplesPerPx$.set(next);
            const newPx = (tAnchor * buf.sampleRate) / next;
            this.#scrollX = Math.max(0, newPx - mx);
            self.fire('arianna:editor-zoom', { detail: { samplesPerPx: next, source: this }, bubbles: true });
            this.#redraw();
        }, { passive: false });

        // Toolbar handlers
        btnPlay .addEventListener('click', () => void this.playSelection());
        btnStop .addEventListener('click', () => this.stop());
        btnZIn  .addEventListener('click', () => this.samplesPerPx$.set(Math.max(1, this.samplesPerPx$.peek() * 0.7)));
        btnZOut .addEventListener('click', () => this.samplesPerPx$.set(this.samplesPerPx$.peek() * 1.4));
        btnFadeI.addEventListener('click', () => this.fade('in'));
        btnFadeO.addEventListener('click', () => this.fade('out'));
        btnCrop .addEventListener('click', () => this.cropSelection());

        self.Sheet = AudioEditor.DefaultSheet();
    }

    protected _buildAudioGraph(): void {
        this._audioCtx = this._audioCtx ?? AudioComponent.context;
        this.#gainOut = this._audioCtx.createGain();
        this._input  = this.#gainOut;
        this._output = this.#gainOut;
    }

    // ── Public API ────────────────────────────────────────────────────────

    async setSource(url: string): Promise<void> {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        if (!this._audioCtx) this._audioCtx = AudioComponent.context;
        const buf = await this._audioCtx.decodeAudioData(ab);
        this.setBuffer(buf);
        self.fire('arianna:editor-load', { detail: { duration: buf.duration, source: this }, bubbles: true });
    }

    setBuffer(buf: AudioBuffer): void {
        this.buffer$.set(buf);
        this.selection$.set(null);
        // Fit to width
        if (this.#canvas) {
            const spp = Math.max(1, Math.floor(buf.length / this.#canvas.width));
            this.samplesPerPx$.set(spp);
            this.#scrollX = 0;
        }
    }

    getBuffer(): AudioBuffer | null { return this.buffer$.get(); }

    async playSelection(): Promise<void> {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const buf = this.buffer$.peek();
        if (!buf || !this._audioCtx) return;
        await AudioComponent.resume();
        this.stop();
        const src = this._audioCtx.createBufferSource();
        src.buffer = buf;
        if (this.#gainOut) src.connect(this.#gainOut);
        const sel = this.selection$.peek();
        const start = sel ? sel.start : 0;
        const dur   = sel ? Math.max(0.001, sel.end - sel.start) : buf.duration;
        src.start(0, start, dur);
        src.onended = () => {
            this.playing$.set(false);
            self.fire('arianna:editor-stop', { detail: { source: this }, bubbles: true });
        };
        this.#playSrc = src;
        this.playing$.set(true);
        self.fire('arianna:editor-play', { detail: { source: this }, bubbles: true });
    }

    stop(): void {
        if (this.#playSrc) {
            try { this.#playSrc.stop(); } catch { /* already stopped */ }
            this.#playSrc = undefined;
        }
        this.playing$.set(false);
    }

    cropSelection(): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const buf = this.buffer$.peek();
        const sel = this.selection$.peek();
        if (!buf || !sel || !this._audioCtx) return;
        const ctx = this._audioCtx;
        const sr = buf.sampleRate;
        const s0 = Math.floor(sel.start * sr);
        const s1 = Math.floor(sel.end   * sr);
        const len = Math.max(1, s1 - s0);
        const next = ctx.createBuffer(buf.numberOfChannels, len, sr);
        for (let ch = 0; ch < buf.numberOfChannels; ch++) {
            const src = buf.getChannelData(ch);
            const dst = next.getChannelData(ch);
            for (let i = 0; i < len; i++) dst[i] = src[s0 + i] ?? 0;
        }
        this.setBuffer(next);
        self.fire('arianna:editor-crop', { detail: { ...sel, source: this }, bubbles: true });
    }

    fade(kind: 'in' | 'out'): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const buf = this.buffer$.peek();
        const sel = this.selection$.peek();
        if (!buf || !sel) return;
        const sr = buf.sampleRate;
        const s0 = Math.floor(sel.start * sr);
        const s1 = Math.floor(sel.end   * sr);
        const len = Math.max(1, s1 - s0);
        for (let ch = 0; ch < buf.numberOfChannels; ch++) {
            const data = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) {
                const t = i / len;
                const g = kind === 'in' ? t : 1 - t;
                data[s0 + i] = (data[s0 + i] ?? 0) * g;
            }
        }
        this.buffer$.set(buf);    // re-trigger render
        self.fire('arianna:editor-fade', { detail: { kind, ...sel, source: this }, bubbles: true });
    }

    // ── Render ────────────────────────────────────────────────────────────

    #pxToTime(px: number): number {
        const buf = this.buffer$.peek();
        if (!buf) return 0;
        const sample = (px + this.#scrollX) * this.samplesPerPx$.peek();
        return sample / buf.sampleRate;
    }

    #timeToPx(t: number): number {
        const buf = this.buffer$.peek();
        if (!buf) return 0;
        const sample = t * buf.sampleRate;
        return sample / this.samplesPerPx$.peek() - this.#scrollX;
    }

    #redraw(): void {
        const canvas = this.#canvas;
        const ctx = this.#ctx;
        if (!canvas || !ctx) return;
        const W = canvas.width, H = canvas.height;
        const root = (this as unknown as { render(): HTMLElement }).render();
        const waveColor = root.getAttribute('wave-color') ?? 'var(--ar-primary, #7eb8f7)';
        const selColor  = root.getAttribute('selection-color') ?? 'rgba(126,184,247,0.18)';

        // Background
        ctx.fillStyle = getComputedStyle(root).getPropertyValue('--ar-bg').trim() || '#0d0d0d';
        ctx.fillRect(0, 0, W, H);

        // Centerline
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();

        const buf = this.buffer$.peek();
        if (!buf) return;

        const data = buf.getChannelData(0);
        const spp = this.samplesPerPx$.peek();
        const midY = H / 2;

        // Min/max peaks per pixel column
        ctx.fillStyle = waveColor.startsWith('var(') ? (getComputedStyle(root).getPropertyValue('--ar-primary').trim() || '#7eb8f7') : waveColor;
        for (let x = 0; x < W; x++) {
            const s0 = Math.floor((x + this.#scrollX) * spp);
            const s1 = Math.min(data.length, s0 + Math.ceil(spp));
            if (s0 >= data.length) break;
            let min = 0, max = 0;
            for (let i = s0; i < s1; i++) {
                const v = data[i] ?? 0;
                if (v < min) min = v;
                if (v > max) max = v;
            }
            const y0 = midY - max * (midY - 2);
            const y1 = midY - min * (midY - 2);
            ctx.fillRect(x, y0, 1, Math.max(1, y1 - y0));
        }

        // Selection
        const sel = this.selection$.peek();
        if (sel) {
            const x0 = this.#timeToPx(sel.start);
            const x1 = this.#timeToPx(sel.end);
            ctx.fillStyle = selColor;
            ctx.fillRect(x0, 0, x1 - x0, H);
            ctx.strokeStyle = waveColor.startsWith('var(') ? (getComputedStyle(root).getPropertyValue('--ar-primary').trim() || '#7eb8f7') : waveColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, 0); ctx.lineTo(x0, H);
            ctx.moveTo(x1, 0); ctx.lineTo(x1, H);
            ctx.stroke();
        }
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #e0e0e0)',
                display     : 'inline-block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                padding     : '8px',
            }),
            new Rule(':host .ae-wrap', {
                display      : 'flex',
                flexDirection: 'column',
                gap          : '6px',
            }),
            new Rule(':host .ae-toolbar', {
                display: 'flex',
                gap    : '4px',
            }),
            new Rule(':host .ae-btn', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.78rem',
                padding     : '4px 10px',
                transition  : 'all var(--ar-transition, 0.14s)',
            }),
            new Rule(':host .ae-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
            new Rule(':host .ae-canvas', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                cursor      : 'crosshair',
                display     : 'block',
            }),
            new Rule(':host .ae-status', {
                color    : 'var(--ar-muted, #888)',
                fontSize : '0.72rem',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AudioEditor', {
        value: AudioEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default AudioEditor;
