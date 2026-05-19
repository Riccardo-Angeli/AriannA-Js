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
 * Attrs: duration, time, tracks (count), pixels-per-second, snap-ms
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface VideoClip {
    id      : string;
    track   : number;
    start   : number;     // seconds, on timeline
    duration: number;     // seconds
    source  : string;     // URL or asset reference
    name    : string;
    /** Offset inside the source media when trimmed at the left edge. */
    sourceIn?  : number;
}

interface DragState {
    clipId : string;
    mode   : 'move' | 'trim-left' | 'trim-right';
    startX : number;
    origStart    : number;
    origDuration : number;
    origIn       : number;
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00.0';
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${m}:${String(s).padStart(2, '0')}.${tenths}`;
}

export class VideoTrackEditor extends Component('arianna-video-track-editor', HTMLElement, {}, {
    attrs : ['duration', 'time', 'tracks', 'pixels-per-second', 'snap-ms'],
})
{
    clips$    : Signal<VideoClip[]> = signal<VideoClip[]>([]);
    selected$ : Signal<string | null> = signal<string | null>(null);
    time$     : Signal<number> = signal<number>(0);
    playing$  : Signal<boolean> = signal<boolean>(false);

    #drag    : DragState | null = null;
    #rafTimer: number | null = null;
    #playStart: number = 0;

    build(_opts: object = {})
    {
        const durAttr = this.attrSignal('duration');
        const tracksAttr = this.attrSignal('tracks');
        const ppsAttr = this.attrSignal('pixels-per-second');

        this.duration = () => parseFloat(durAttr.get() ?? '60') || 60;
        this.trackCount = () => parseInt(tracksAttr.get() ?? '2', 10) || 2;
        this.pps = () => parseFloat(ppsAttr.get() ?? '20') || 20;
        this.snapMs = () => parseInt(this.getAttribute('snap-ms') ?? '100', 10) || 100;

        this.totalWidth = () => `${this.duration() * this.pps()}px`;

        this.rulerMarks = (): Array<{ label: string; left: string }> => {
            const dur = this.duration();
            const pps = this.pps();
            const step = dur <= 30 ? 1 : dur <= 120 ? 5 : 10;
            const marks: Array<{ label: string; left: string }> = [];
            for (let s = 0; s <= dur; s += step) {
                marks.push({ label: `${s}s`, left: `${s * pps}px` });
            }
            return marks;
        };

        this.trackList = (): Array<{ idx: number; label: string }> => {
            const n = this.trackCount();
            return Array.from({ length: n }, (_, i) => ({ idx: i, label: `V${i + 1}` }));
        };

        this.clipsForTrack = (idx: number): Array<VideoClip & { left: string; width: string; cls: string }> => {
            const pps = this.pps();
            const sel = this.selected$.get();
            return this.clips$.get()
                .filter(c => c.track === idx)
                .map(c => ({
                    ...c,
                    left : `${c.start * pps}px`,
                    width: `${c.duration * pps}px`,
                    cls  : 'ar-vte__clip' + (sel === c.id ? ' ar-vte__clip--selected' : ''),
                }));
        };

        this.playheadStyle = () => `left: ${this.time$.get() * this.pps()}px`;
        this.timeLabel = () => formatTime(this.time$.get());
        this.durLabel = () => formatTime(this.duration());
        this.playLabel = () => this.playing$.get() ? '❙❙' : '▶';

        this.transportPct = () => {
            const d = this.duration();
            return d > 0 ? String((this.time$.get() / d) * 100) : '0';
        };

        // ── Handlers ────────────────────────────────────────────────────
        this.onPlay = () => {
            if (this.playing$.get()) this.pause();
            else this.play();
        };
        this.onStop = () => {
            this.pause();
            this.seek(0);
        };
        this.onTransportInput = (e: Event) => {
            const pct = parseFloat((e.target as HTMLInputElement).value);
            this.seek((pct / 100) * this.duration());
        };

        this.onClipPointerDown = (e: Event) => {
            const ev = e as PointerEvent;
            const target = ev.currentTarget as HTMLElement;
            const id = target.dataset.id;
            if (!id) return;
            const clip = this.clips$.get().find(c => c.id === id);
            if (!clip) return;
            this.selected$.set(id);
            this.dispatchEvent(new CustomEvent('arianna:editor-select', {
                bubbles: true, detail: { clip: { ...clip } },
            }));
            // Pick mode based on hit location within the clip box
            const rect = target.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const mode: DragState['mode'] =
                  x < 6 ? 'trim-left'
                : x > rect.width - 6 ? 'trim-right'
                : 'move';
            this.#drag = {
                clipId       : id,
                mode,
                startX       : ev.clientX,
                origStart    : clip.start,
                origDuration : clip.duration,
                origIn       : clip.sourceIn ?? 0,
            };
            target.setPointerCapture(ev.pointerId);
        };

        this.onClipPointerMove = (e: Event) => {
            if (!this.#drag) return;
            const ev = e as PointerEvent;
            const dx = ev.clientX - this.#drag.startX;
            const dt = dx / this.pps();
            const snap = this.snapMs() / 1000;
            const snapped = Math.round(dt / snap) * snap;
            this.#applyDrag(snapped);
        };

        this.onClipPointerUp = (e: Event) => {
            if (!this.#drag) return;
            const ev = e as PointerEvent;
            (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);
            this.#drag = null;
            this.#fireChange();
        };

        this.onRulerClick = (e: Event) => {
            const ev = e as PointerEvent;
            const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
            const x = ev.clientX - rect.left;
            this.seek(x / this.pps());
        };

        this.onDeleteSelected = () => {
            const sel = this.selected$.get();
            if (!sel) return;
            this.clips$.set(this.clips$.get().filter(c => c.id !== sel));
            this.selected$.set(null);
            this.#fireChange();
        };

        this.onSplitAtPlayhead = () => {
            const sel = this.selected$.get();
            const t = this.time$.get();
            const clips = this.clips$.get();
            const c = clips.find(x => x.id === sel);
            if (!c) return;
            if (t <= c.start || t >= c.start + c.duration) return;
            const cutOffset = t - c.start;
            const left: VideoClip = {
                ...c, duration: cutOffset,
            };
            const right: VideoClip = {
                ...c,
                id      : `${c.id}-b-${Date.now()}`,
                start   : t,
                duration: c.duration - cutOffset,
                sourceIn: (c.sourceIn ?? 0) + cutOffset,
            };
            this.clips$.set([...clips.filter(x => x.id !== sel), left, right]);
            this.#fireChange();
        };

        this.template = html`
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

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = VideoTrackEditor.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setClips(clips: VideoClip[]): this {
        this.clips$.set(clips.map(c => ({ ...c })));
        this.#fireChange();
        return this;
    }
    getClips(): VideoClip[] { return this.clips$.get().map(c => ({ ...c })); }

    addClip(clip: VideoClip): this {
        this.clips$.set([...this.clips$.get(), { ...clip }]);
        this.#fireChange();
        return this;
    }
    removeClip(id: string): this {
        this.clips$.set(this.clips$.get().filter(c => c.id !== id));
        if (this.selected$.get() === id) this.selected$.set(null);
        this.#fireChange();
        return this;
    }

    seek(time: number): this {
        const clamped = Math.max(0, Math.min(this.duration(), time));
        this.time$.set(clamped);
        this.dispatchEvent(new CustomEvent('arianna:editor-time', {
            bubbles: true, detail: { time: clamped },
        }));
        return this;
    }
    getTime(): number { return this.time$.get(); }

    play(): this {
        if (this.playing$.get()) return this;
        this.playing$.set(true);
        this.#playStart = performance.now() - this.time$.get() * 1000;
        const tick = () => {
            if (!this.playing$.get()) return;
            const elapsed = (performance.now() - this.#playStart) / 1000;
            if (elapsed >= this.duration()) {
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
    pause(): this {
        this.playing$.set(false);
        if (this.#rafTimer != null) {
            cancelAnimationFrame(this.#rafTimer);
            this.#rafTimer = null;
        }
        return this;
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    #applyDrag(snappedDt: number): void {
        if (!this.#drag) return;
        const d = this.#drag;
        const clips = this.clips$.get();
        const idx = clips.findIndex(c => c.id === d.clipId);
        if (idx < 0) return;
        const c = clips[idx]!;
        const dur = this.duration();
        let next: VideoClip;
        switch (d.mode) {
            case 'move': {
                const start = Math.max(0, Math.min(dur - d.origDuration, d.origStart + snappedDt));
                next = { ...c, start };
                break;
            }
            case 'trim-left': {
                const minStart = Math.max(0, d.origStart - d.origIn);
                const maxStart = d.origStart + d.origDuration - 0.1;
                const start = Math.max(minStart, Math.min(maxStart, d.origStart + snappedDt));
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
                const duration = Math.max(0.1, Math.min(dur - d.origStart, d.origDuration + snappedDt));
                next = { ...c, duration };
                break;
            }
        }
        const out = clips.slice();
        out[idx] = next;
        this.clips$.set(out);
    }

    #fireChange(): void {
        this.dispatchEvent(new CustomEvent('arianna:editor-change', {
            bubbles: true, detail: { clips: this.getClips() },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        if (this.#rafTimer != null) cancelAnimationFrame(this.#rafTimer);
    }

    private duration       : () => number = () => 60;
    private trackCount     : () => number = () => 2;
    private pps            : () => number = () => 20;
    private snapMs         : () => number = () => 100;
    private totalWidth     : () => string = () => '1200px';
    private rulerMarks     : () => Array<{ label: string; left: string }> = () => [];
    private trackList      : () => Array<{ idx: number; label: string }> = () => [];
    private clipsForTrack  : (idx: number) => Array<VideoClip & { left: string; width: string; cls: string }> = () => [];
    private playheadStyle  : () => string = () => 'left: 0';
    private timeLabel      : () => string = () => '0:00.0';
    private durLabel       : () => string = () => '0:00.0';
    private playLabel      : () => string = () => '▶';
    private transportPct   : () => string = () => '0';
    private onPlay         : (e: Event) => void = () => {};
    private onStop         : (e: Event) => void = () => {};
    private onTransportInput: (e: Event) => void = () => {};
    private onClipPointerDown: (e: Event) => void = () => {};
    private onClipPointerMove: (e: Event) => void = () => {};
    private onClipPointerUp  : (e: Event) => void = () => {};
    private onRulerClick   : (e: Event) => void = () => {};
    private onDeleteSelected: (e: Event) => void = () => {};
    private onSplitAtPlayhead: (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
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
                new Rule('.ar-vte__clip-handle--left',  { left: '0' }),
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
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'VideoTrackEditor', {
        value: VideoTrackEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default VideoTrackEditor;
