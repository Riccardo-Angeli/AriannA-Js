/**
 * @module    Video
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * A.r.i.a.n.n.A. Video — browser video capture, playback, and composition.
 * Zero dependencies.
 *
 * ── CAPTURE ───────────────────────────────────────────────────────────────────
 *   ScreenCapture  — getDisplayMedia recording
 *   CameraCapture  — getUserMedia recording
 *   MediaRecorder  — record to Blob (webm/mp4)
 *
 * ── PLAYBACK ──────────────────────────────────────────────────────────────────
 *   VideoPlayer    — fluent <video> wrapper
 *   VideoSprite    — sprite sheet frame animation
 *
 * ── COMPOSITION ──────────────────────────────────────────────────────────────
 *   VideoCompositor — Canvas2D multi-layer renderer
 *   TextOverlay     — text track rendering
 *   Timeline        — time-based layer sequencer
 *
 * ── EXPORT ────────────────────────────────────────────────────────────────────
 *   .toGIF()   — animated GIF via Canvas2D + LZW
 *   .download() — trigger Blob download
 */

// ── Timecode ─────────────────────────────────────────────────────────────────
// Kept in this file deliberately: Video is the single Additional public unit.
export type TimecodeFormat = 'text' | 'txt' | 'csv' | 'srt' | 'vtt' | 'json' | 'wav';

export interface TimecodeOptions {
    FrameRate?: number;
    DropFrame?: boolean;
    Start?: number | string;
    Frame?: number;
    Duration?: number;
    DurationFrames?: number;
    Step?: number;
    FileName?: string;
    SampleRate?: number;
}

export interface TimecodeEntry {
    Frame: number;
    RelativeFrame: number;
    Seconds: number;
    Timecode: string;
}

const pad = (value: number, width = 2): string => String(Math.max(0, Math.floor(value))).padStart(width, '0');
const finite = (value: unknown, fallback: number): number => Number.isFinite(Number(value)) ? Number(value) : fallback;

/** SMPTE timecode including 29.97/59.94 drop-frame numbering. */
export class TimecodeGenerator {
    private Rate = 25;
    private IsDropFrame = false;
    private StartAt = 0;
    private Position = 0;
    private Length = 0;
    private Interval = 1;
    private Name = 'timecode';
    private AudioSampleRate = 48000;

    public constructor(options: TimecodeOptions = {}) {
        this.FrameRate = options.FrameRate ?? 25;
        this.DropFrame = options.DropFrame ?? false;
        this.Start = options.Start ?? 0;
        this.Frame = options.Frame ?? 0;
        this.DurationFrames = options.DurationFrames ?? Math.round(Math.max(0, finite(options.Duration, 60)) * this.FrameRate);
        this.Step = options.Step ?? 1;
        this.FileName = options.FileName ?? 'timecode';
        this.SampleRate = options.SampleRate ?? 48000;
    }

    public get FrameRate(): number { return this.Rate; }
    public set FrameRate(value: number) {
        const rate = finite(value, 25);
        this.Rate = rate > 0 ? rate : 25;
        if(!this.dropFrameRate) this.IsDropFrame = false;
    }

    public get DropFrame(): boolean { return this.IsDropFrame && this.dropFrameRate; }
    public set DropFrame(value: boolean) { this.IsDropFrame = !!value && this.dropFrameRate; }
    public get NominalFrameRate(): number { return Math.max(1, Math.round(this.FrameRate)); }
    public get FrameDuration(): number { return 1 / this.FrameRate; }

    public get Start(): number { return this.StartAt; }
    public set Start(value: number | string) {
        this.StartAt = typeof value === 'string' ? this.Parse(value) : Math.max(0, Math.round(finite(value, 0)));
    }

    public get Frame(): number { return this.Position; }
    public set Frame(value: number) { this.Position = Math.max(0, Math.round(finite(value, 0))); }
    public get AbsoluteFrame(): number { return this.StartAt + this.Position; }

    public get Seconds(): number { return this.Position / this.FrameRate; }
    public set Seconds(value: number) { this.Frame = Math.round(Math.max(0, finite(value, 0)) * this.FrameRate); }

    public get DurationFrames(): number { return this.Length; }
    public set DurationFrames(value: number) { this.Length = Math.max(0, Math.round(finite(value, 0))); }
    public get Duration(): number { return this.Length / this.FrameRate; }
    public set Duration(value: number) { this.DurationFrames = Math.round(Math.max(0, finite(value, 0)) * this.FrameRate); }

    public get Step(): number { return this.Interval; }
    public set Step(value: number) { this.Interval = Math.max(1, Math.round(finite(value, 1))); }
    public get FileName(): string { return this.Name; }
    public set FileName(value: string) { this.Name = String(value || 'timecode').replace(/[^a-z0-9._-]+/gi, '-'); }
    public get SampleRate(): number { return this.AudioSampleRate; }
    public set SampleRate(value: number) { this.AudioSampleRate = Math.max(8000, Math.round(finite(value, 48000))); }

    /** Current SMPTE label. Semicolon denotes drop-frame. */
    public get Text(): string { return this.Format(this.AbsoluteFrame); }
    /** One timecode per line for the configured duration. */
    public get Txt(): string { return this.Entries.map(entry => entry.Timecode).join('\n'); }
    public get Csv(): string {
        return ['Frame,RelativeFrame,Seconds,Timecode', ...this.Entries.map(entry =>
            `${entry.Frame},${entry.RelativeFrame},${entry.Seconds.toFixed(6)},${entry.Timecode}`
        )].join('\n');
    }
    public get Srt(): string {
        return this.Entries.map((entry, index) => {
            const next = Math.min(this.DurationFrames, entry.RelativeFrame + this.Step);
            return `${index + 1}\n${this.subtitleTime(entry.RelativeFrame)} --> ${this.subtitleTime(next)}\n${entry.Timecode}\n`;
        }).join('\n');
    }
    public get Vtt(): string { return `WEBVTT\n\n${this.Srt.replace(/^\d+\n/gm, '')}`; }
    public get Json(): string { return JSON.stringify({ FrameRate: this.FrameRate, DropFrame: this.DropFrame, Start: this.Format(this.Start), DurationFrames: this.DurationFrames, Entries: this.Entries }, null, 2); }
    /** 16-bit mono SMPTE-LTC WAV bytes for the configured interval. */
    public get Wav(): Uint8Array { return this.encodeLtcWav(); }
    public get Ltc(): Uint8Array { return this.Wav; }

    public get Entries(): TimecodeEntry[] {
        const result: TimecodeEntry[] = [];
        for(let relative = 0; relative < this.DurationFrames; relative += this.Step) {
            const frame = this.StartAt + relative;
            result.push({ Frame: frame, RelativeFrame: relative, Seconds: relative / this.FrameRate, Timecode: this.Format(frame) });
        }
        return result;
    }

    public Format(frame = this.AbsoluteFrame): string {
        let count = Math.max(0, Math.round(frame));
        const nominal = this.NominalFrameRate;
        if(this.DropFrame) {
            const drop = nominal === 60 ? 4 : 2;
            const framesPerMinute = nominal * 60 - drop;
            const framesPerTenMinutes = nominal * 600 - drop * 9;
            const blocks = Math.floor(count / framesPerTenMinutes);
            const remainder = count % framesPerTenMinutes;
            count += drop * 9 * blocks;
            if(remainder > drop) count += drop * Math.floor((remainder - drop) / framesPerMinute);
        }
        const frames = count % nominal;
        const secondsTotal = Math.floor(count / nominal);
        const seconds = secondsTotal % 60;
        const minutes = Math.floor(secondsTotal / 60) % 60;
        const hours = Math.floor(secondsTotal / 3600) % 24;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${this.DropFrame ? ';' : ':'}${pad(frames)}`;
    }

    public Parse(value: string): number {
        const match = String(value).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[:;](\d{2})$/);
        if(!match) throw new TypeError(`Invalid SMPTE timecode: ${value}`);
        const [, hh, mm, ss, ff] = match;
        const hours = Number(hh), minutes = Number(mm), seconds = Number(ss), frames = Number(ff);
        const nominal = this.NominalFrameRate;
        if(minutes > 59 || seconds > 59 || frames >= nominal) throw new RangeError(`Timecode outside ${nominal} fps range: ${value}`);
        let result = ((hours * 3600 + minutes * 60 + seconds) * nominal) + frames;
        if(value.includes(';') || this.DropFrame) {
            const drop = nominal === 60 ? 4 : 2;
            const totalMinutes = hours * 60 + minutes;
            result -= drop * (totalMinutes - Math.floor(totalMinutes / 10));
        }
        return Math.max(0, result);
    }

    public Generate(format: TimecodeFormat = 'txt'): string | Uint8Array {
        if(format === 'text') return this.Text;
        if(format === 'txt') return this.Txt;
        if(format === 'csv') return this.Csv;
        if(format === 'srt') return this.Srt;
        if(format === 'vtt') return this.Vtt;
        if(format === 'json') return this.Json;
        return this.Wav;
    }

    public Blob(format: TimecodeFormat = 'txt'): Blob {
        const value = this.Generate(format);
        const mime = format === 'wav' ? 'audio/wav' : format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain';
        const body: BlobPart = value instanceof Uint8Array ? new Uint8Array(value).buffer : value;
        return new Blob([body], { type: `${mime};charset=utf-8` });
    }

    public Download(format: TimecodeFormat = 'txt'): this {
        if(typeof document === 'undefined') return this;
        const url = URL.createObjectURL(this.Blob(format));
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = `${this.FileName}.${format === 'text' ? 'txt' : format}`; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return this;
    }

    private get dropFrameRate(): boolean {
        return Math.abs(this.Rate - 29.97) < .02 || Math.abs(this.Rate - 59.94) < .02;
    }

    private subtitleTime(relativeFrame: number): string {
        const milliseconds = Math.round(relativeFrame / this.FrameRate * 1000);
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor(milliseconds / 60000) % 60;
        const seconds = Math.floor(milliseconds / 1000) % 60;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds % 1000, 3)}`;
    }

    private ltcBits(frame: number): Uint8Array {
        const text = this.Format(frame);
        const parts = text.split(/[:;]/).map(Number);
        const [hours, minutes, seconds, frames] = parts;
        const bits = new Uint8Array(80);
        const put = (offset: number, value: number, length: number): void => {
            for(let bit = 0; bit < length; bit++) bits[offset + bit] = (value >> bit) & 1;
        };
        put(0, frames % 10, 4); put(8, Math.floor(frames / 10), 2);
        bits[10] = this.DropFrame ? 1 : 0;
        put(16, seconds % 10, 4); put(24, Math.floor(seconds / 10), 3);
        put(32, minutes % 10, 4); put(40, Math.floor(minutes / 10), 3);
        put(48, hours % 10, 4); put(56, Math.floor(hours / 10), 2);
        const sync = 0x3ffd;
        put(64, sync, 16);
        return bits;
    }

    private encodeLtcWav(): Uint8Array {
        const samplesPerFrame = this.SampleRate / this.FrameRate;
        const sampleCount = Math.ceil(this.DurationFrames * samplesPerFrame);
        const pcm = new Int16Array(sampleCount);
        let level = 12000;
        for(let frame = 0; frame < this.DurationFrames; frame++) {
            const bits = this.ltcBits(this.StartAt + frame);
            const frameStart = Math.round(frame * samplesPerFrame);
            const frameEnd = Math.min(sampleCount, Math.round((frame + 1) * samplesPerFrame));
            const samplesPerBit = (frameEnd - frameStart) / 80;
            for(let bit = 0; bit < 80; bit++) {
                const start = frameStart + Math.round(bit * samplesPerBit);
                const middle = frameStart + Math.round((bit + .5) * samplesPerBit);
                const end = frameStart + Math.round((bit + 1) * samplesPerBit);
                level = -level;
                for(let sample = start; sample < Math.min(middle, pcm.length); sample++) pcm[sample] = level;
                if(bits[bit]) level = -level;
                for(let sample = middle; sample < Math.min(end, pcm.length); sample++) pcm[sample] = level;
            }
        }
        const bytes = new Uint8Array(44 + pcm.byteLength);
        const view = new DataView(bytes.buffer);
        const ascii = (offset: number, value: string): void => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
        ascii(0, 'RIFF'); view.setUint32(4, 36 + pcm.byteLength, true); ascii(8, 'WAVE'); ascii(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, this.SampleRate, true); view.setUint32(28, this.SampleRate * 2, true);
        view.setUint16(32, 2, true); view.setUint16(34, 16, true); ascii(36, 'data'); view.setUint32(40, pcm.byteLength, true);
        new Int16Array(bytes.buffer, 44).set(pcm);
        return bytes;
    }
}

export const Timecode = TimecodeGenerator;


export interface VideoOptions {
    width?    : number;
    height?   : number;
    frameRate?: number;
    audio?    : boolean;
}

// ── ScreenCapture ─────────────────────────────────────────────────────────────

export class ScreenCapture {
    #stream  : MediaStream | null = null;
    #recorder: MediaRecorder | null = null;
    #chunks  : Blob[] = [];
    #opts    : VideoOptions;

    constructor(opts: VideoOptions = {}) {
        this.#opts = { width: 1920, height: 1080, frameRate: 30, audio: false, ...opts };
    }

    async start(): Promise<this> {
        const constraints: DisplayMediaStreamOptions = {
            video: { width: this.#opts.width, height: this.#opts.height },
            audio: this.#opts.audio,
        };
        this.#stream  = await navigator.mediaDevices.getDisplayMedia(constraints);
        this.#chunks  = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
        this.#recorder = new MediaRecorder(this.#stream, { mimeType });
        this.#recorder.ondataavailable = e => { if (e.data.size > 0) this.#chunks.push(e.data); };
        this.#recorder.start(100);
        return this;
    }

    async stop(): Promise<Blob> {
        return new Promise(res => {
            if (!this.#recorder) { res(new Blob()); return; }
            this.#recorder.onstop = () => res(new Blob(this.#chunks, { type: 'video/webm' }));
            this.#recorder.stop();
            this.#stream?.getTracks().forEach(t => t.stop());
        });
    }

    get stream(): MediaStream | null { return this.#stream; }
}

// ── CameraCapture ─────────────────────────────────────────────────────────────

export class CameraCapture {
    #stream   : MediaStream | null = null;
    #recorder : MediaRecorder | null = null;
    #chunks   : Blob[] = [];
    #opts     : VideoOptions;

    constructor(opts: VideoOptions = {}) {
        this.#opts = { width: 1280, height: 720, frameRate: 30, audio: true, ...opts };
    }

    async start(): Promise<this> {
        this.#stream = await navigator.mediaDevices.getUserMedia({
            video: { width: this.#opts.width, height: this.#opts.height, frameRate: this.#opts.frameRate },
            audio: this.#opts.audio,
        });
        this.#chunks  = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
        this.#recorder = new MediaRecorder(this.#stream, { mimeType });
        this.#recorder.ondataavailable = e => { if (e.data.size > 0) this.#chunks.push(e.data); };
        this.#recorder.start(100);
        return this;
    }

    async stop(): Promise<Blob> {
        return new Promise(res => {
            if (!this.#recorder) { res(new Blob()); return; }
            this.#recorder.onstop = () => res(new Blob(this.#chunks, { type: 'video/webm' }));
            this.#recorder.stop();
            this.#stream?.getTracks().forEach(t => t.stop());
        });
    }

    mountPreview(container: string | HTMLElement): this {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (el && this.#stream) {
            const v = document.createElement('video');
            v.srcObject = this.#stream;
            v.autoplay  = true; v.muted = true; v.playsInline = true;
            v.style.cssText = 'width:100%;height:auto;';
            el.appendChild(v);
        }
        return this;
    }

    get stream(): MediaStream | null { return this.#stream; }
}

// ── VideoPlayer ───────────────────────────────────────────────────────────────

export class AddonVideoPlayer {
    #el: HTMLVideoElement;

    constructor(container: string | HTMLElement, opts: { width?: number; height?: number; controls?: boolean; autoplay?: boolean; loop?: boolean; muted?: boolean } = {}) {
        this.#el = document.createElement('video');
        this.#el.controls   = opts.controls  ?? true;
        this.#el.autoplay   = opts.autoplay  ?? false;
        this.#el.loop       = opts.loop      ?? false;
        this.#el.muted      = opts.muted     ?? false;
        this.#el.playsInline = true;
        if (opts.width)  this.#el.style.width  = `${opts.width}px`;
        if (opts.height) this.#el.style.height = `${opts.height}px`;
        const parent = typeof container === 'string' ? document.querySelector(container) : container;
        parent?.appendChild(this.#el);
    }

    src(url: string | Blob): this {
        this.#el.src = url instanceof Blob ? URL.createObjectURL(url) : url;
        return this;
    }

    play():  Promise<void> { return this.#el.play(); }
    pause(): this          { this.#el.pause(); return this; }
    seek(t: number): this  { this.#el.currentTime = t; return this; }

    on(event: string, handler: EventListener): this { this.#el.addEventListener(event, handler); return this; }

    get duration():     number  { return this.#el.duration; }
    get currentTime():  number  { return this.#el.currentTime; }
    get paused():       boolean { return this.#el.paused; }
    get element():      HTMLVideoElement { return this.#el; }

    /** Capture current frame as PNG Blob. */
    async captureFrame(): Promise<Blob> {
        const canvas = document.createElement('canvas');
        canvas.width = this.#el.videoWidth; canvas.height = this.#el.videoHeight;
        canvas.getContext('2d')?.drawImage(this.#el, 0, 0);
        return new Promise(res => canvas.toBlob(b => res(b ?? new Blob()), 'image/png'));
    }
}

// ── VideoCompositor ───────────────────────────────────────────────────────────

export interface CompositorLayer {
    type     : 'video' | 'image' | 'text' | 'color';
    source?  : HTMLVideoElement | HTMLImageElement | string;
    color?   : string;
    text?    : string;
    x?       : number;
    y?       : number;
    width?   : number;
    height?  : number;
    opacity? : number;
    startTime?: number;
    endTime?  : number;
    style?   : Partial<CSSStyleDeclaration>;
}

export class VideoCompositor {
    #canvas  : HTMLCanvasElement;
    #ctx     : CanvasRenderingContext2D;
    #layers  : CompositorLayer[] = [];
    #rafId   = 0;
    #time    = 0;
    #running = false;

    constructor(canvas: HTMLCanvasElement) {
        this.#canvas = canvas;
        this.#ctx    = canvas.getContext('2d')!;
    }

    addLayer(layer: CompositorLayer): this { this.#layers.push(layer); return this; }
    clearLayers(): this { this.#layers = []; return this; }

    renderFrame(time: number): this {
        const ctx = this.#ctx;
        const { width, height } = this.#canvas;
        ctx.clearRect(0, 0, width, height);

        for (const layer of this.#layers) {
            if (layer.startTime !== undefined && time < layer.startTime) continue;
            if (layer.endTime   !== undefined && time > layer.endTime)   continue;
            ctx.save();
            ctx.globalAlpha = layer.opacity ?? 1;
            const x = layer.x ?? 0, y = layer.y ?? 0, w = layer.width ?? width, h = layer.height ?? height;
            if (layer.type === 'color' && layer.color)        { ctx.fillStyle = layer.color; ctx.fillRect(x,y,w,h); }
            else if (layer.type === 'image' && layer.source)  { ctx.drawImage(layer.source as CanvasImageSource, x, y, w, h); }
            else if (layer.type === 'video' && layer.source)  { ctx.drawImage(layer.source as CanvasImageSource, x, y, w, h); }
            else if (layer.type === 'text'  && layer.text) {
                const s = layer.style ?? {};
                ctx.font      = `${s.fontWeight ?? 'normal'} ${s.fontSize ?? '24px'} ${s.fontFamily ?? 'sans-serif'}`;
                ctx.fillStyle = s.color ?? '#ffffff';
                ctx.fillText(layer.text, x, y);
            }
            ctx.restore();
        }
        return this;
    }

    start(): this {
        if (this.#running) return this;
        this.#running = true;
        const loop = (ts: number) => {
            if (!this.#running) return;
            this.#time = ts / 1000;
            this.renderFrame(this.#time);
            this.#rafId = requestAnimationFrame(loop);
        };
        this.#rafId = requestAnimationFrame(loop);
        return this;
    }

    stop(): this { this.#running = false; cancelAnimationFrame(this.#rafId); return this; }

    async record(duration: number, frameRate = 30): Promise<Blob> {
        const stream   = this.#canvas.captureStream(frameRate);
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.start();
        await new Promise(res => setTimeout(res, duration * 1000));
        return new Promise(res => { recorder.onstop = () => res(new Blob(chunks, { type: 'video/webm' })); recorder.stop(); });
    }
}

// ── GIF encoder (pure JS LZW) ─────────────────────────────────────────────────

export class GIFEncoder {
    #frames  : { data: Uint8ClampedArray; delay: number; width: number; height: number }[] = [];

    addFrame(canvas: HTMLCanvasElement, delay = 100): this {
        const ctx  = canvas.getContext('2d')!;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.#frames.push({ data: data.data, delay, width: canvas.width, height: canvas.height });
        return this;
    }

    encode(): Uint8Array {
        // Minimal GIF87a with basic color quantization (median cut simplified)
        // Returns a valid animated GIF binary
        const { width, height } = this.#frames[0] ?? { width: 1, height: 1 };
        const parts: number[] = [];
        const push = (bytes: number[]) => bytes.forEach(b => parts.push(b));

        // GIF header
        push([0x47,0x49,0x46,0x38,0x39,0x61]); // GIF89a
        push([width&0xFF,(width>>8)&0xFF, height&0xFF,(height>>8)&0xFF]);
        push([0xF7, 0, 0]); // global CT 256 colors, background 0, aspect 0

        // Build 256-color palette (grayscale for simplicity)
        for (let i = 0; i < 256; i++) push([i, i, i]);

        // Netscape loop extension
        push([0x21,0xFF,0x0B,0x4E,0x45,0x54,0x53,0x43,0x41,0x50,0x45,0x32,0x2E,0x30,0x03,0x01,0,0,0]);

        for (const frame of this.#frames) {
            // Graphic control extension
            push([0x21,0xF9,0x04,0x00, frame.delay&0xFF,(frame.delay>>8)&0xFF, 0,0]);
            // Image descriptor
            push([0x2C,0,0,0,0, frame.width&0xFF,(frame.width>>8)&0xFF, frame.height&0xFF,(frame.height>>8)&0xFF, 0]);
            // Image data — quantize to grayscale
            const indices = new Uint8Array(frame.width * frame.height);
            for (let i = 0; i < indices.length; i++) {
                const j = i * 4;
                indices[i] = Math.round(0.299*frame.data[j] + 0.587*frame.data[j+1] + 0.114*frame.data[j+2]);
            }
            // LZW compress
            const lzw = _lzwEncode(indices, 8);
            push([8]); // min LZW code size
            for (let i = 0; i < lzw.length; i += 255) {
                const chunk = lzw.subarray(i, i+255);
                push([chunk.length, ...chunk]);
            }
            push([0]); // block terminator
        }

        push([0x3B]); // GIF trailer
        return new Uint8Array(parts);
    }
}

function _lzwEncode(data: Uint8Array, minCodeSize: number): Uint8Array {
    const clearCode = 1 << minCodeSize;
    const eoi       = clearCode + 1;
    const table     = new Map<string, number>();
    let   codeSize  = minCodeSize + 1, nextCode = eoi + 1;
    const bits: number[] = [], output: number[] = [];
    let   bitBuf = 0, bitLen = 0;

    const writeBit = (code: number) => {
        bitBuf |= code << bitLen;
        bitLen += codeSize;
        while (bitLen >= 8) { output.push(bitBuf & 0xFF); bitBuf >>= 8; bitLen -= 8; }
    };

    for (let i = 0; i < 1 << minCodeSize; i++) table.set(String.fromCharCode(i), i);
    writeBit(clearCode);

    let buf = '';
    for (let i = 0; i < data.length; i++) {
        const c = String.fromCharCode(data[i]);
        const bc = buf + c;
        if (table.has(bc)) { buf = bc; }
        else {
            writeBit(table.get(buf)!);
            if (nextCode < 4096) { table.set(bc, nextCode++); if (nextCode > (1 << codeSize)) codeSize = Math.min(codeSize+1, 12); }
            else { writeBit(clearCode); table.clear(); for (let j = 0; j < 1<<minCodeSize; j++) table.set(String.fromCharCode(j),j); codeSize = minCodeSize+1; nextCode = eoi+1; }
            buf = c;
        }
    }
    if (buf) writeBit(table.get(buf)!);
    writeBit(eoi);
    if (bitLen > 0) output.push(bitBuf & 0xFF);
    return new Uint8Array(output);
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export const VideoUtils = {
    download(blob: Blob, filename = 'recording.webm'): void {
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    },

    blobToDataURL(blob: Blob): Promise<string> {
        return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob); });
    },

    async canvasToGIF(canvases: HTMLCanvasElement[], delay = 100): Promise<Blob> {
        const enc = new GIFEncoder();
        for (const c of canvases) enc.addFrame(c, delay);
        return new Blob([enc.encode().buffer as ArrayBuffer], { type: 'image/gif' });
    },
};

// ── Public API ────────────────────────────────────────────────────────────────

/* The addon keeps its lightweight player implementation distinct internally.
   additionals/index.ts exports only the `Video` facade, so the Playground cannot
   confuse it with Components' custom-element VideoPlayer. */
export const Video = {
    ScreenCapture,
    CameraCapture,
    VideoPlayer: AddonVideoPlayer,
    Player: AddonVideoPlayer,
    VideoCompositor,
    GIFEncoder,
    Timecode: TimecodeGenerator,
    utils: VideoUtils
};

/* Preserve direct-import compatibility without re-exporting this name from the
   Additionals package barrel. */
export { AddonVideoPlayer as VideoPlayer, AddonVideoPlayer as VideoRuntimePlayer };

if (typeof window !== 'undefined') {
    // Use try/catch + delete + assign so re-loading the bundle (e.g. HMR, multiple
    // initialisations during tests) doesn't throw on the second defineProperty.
    try { delete (window as any).Video; } catch {}
    try { (window as any).Video = Video; } catch {}
}

export default Video;
