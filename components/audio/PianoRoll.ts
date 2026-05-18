/**
 * @module    components/audio/PianoRoll
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * PianoRoll — MIDI piano roll editor:
 *
 *   ┌──────────────────────────────────────┐
 *   │C5│                                    │
 *   │B4│        ▌▌▌  ▌▌▌▌                   │
 *   │A4│    ▌▌▌▌▌▌▌                         │
 *   │..│                                    │
 *   │C3│                                    │
 *   └──────────────────────────────────────┘
 *     0    1    2    3    4    5  (beats)
 *
 * Notes are placed by click on empty area, dragged to move, edge-dragged
 * to resize, double-click to delete. Pitch range and beat count are
 * configurable; default is C3..C5, 16 beats.
 *
 *   const pr = new PianoRoll({ beats: 16, pitchMin: 36, pitchMax: 84 });
 *   pr.append(document.body);
 *   pr.on('arianna:pianoroll-note-add', e => console.log(e.detail.note));
 *
 *   <arianna-piano-roll beats="16"></arianna-piano-roll>
 *
 * Events:
 *   arianna:pianoroll-note-add    { note: { pitch, start, length, velocity } }
 *   arianna:pianoroll-note-remove { note }
 *   arianna:pianoroll-note-edit   { note, oldNote }
 *   arianna:pianoroll-play
 *   arianna:pianoroll-stop
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface PianoNote {
    pitch    : number;   // MIDI 0..127 (60 = C4)
    start    : number;   // beats
    length   : number;   // beats
    velocity : number;   // 0..1
}

export interface PianoRollOptions {
    beats?     : number;     // total beat count
    pitchMin?  : number;     // lowest pitch shown (inclusive)
    pitchMax?  : number;     // highest pitch shown (inclusive)
    cellWidth? : number;     // px per beat
    cellHeight?: number;     // px per row (pitch)
    snap?      : number;     // beat snap (e.g. 0.25 = 16th)
}

const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function pitchLabel(p: number): string {
    const oct = Math.floor(p / 12) - 1;
    const name = PITCH_NAMES[p % 12] ?? '?';
    return name + oct;
}
function isBlackKey(p: number): boolean {
    return [1, 3, 6, 8, 10].includes(p % 12);
}

export class PianoRoll extends Component('arianna-piano-roll', HTMLElement, {}, {
    attrs : ['beats', 'pitch-min', 'pitch-max', 'cell-width', 'cell-height', 'snap'],
    shadow: false,
})
{
    readonly notes$: Signal<PianoNote[]> = signal<PianoNote[]>([]);
    readonly playing$: Signal<boolean>  = signal(false);
    readonly playhead$: Signal<number>  = signal(0);

    #grid?    : HTMLDivElement;
    #cellW    = 28;
    #cellH    = 14;
    #beats    = 16;
    #pitchMin = 36;
    #pitchMax = 84;
    #snap     = 0.25;

    constructor(opts: PianoRollOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.beats      != null) el.setAttribute('beats',       String(opts.beats));
        if (opts.pitchMin   != null) el.setAttribute('pitch-min',   String(opts.pitchMin));
        if (opts.pitchMax   != null) el.setAttribute('pitch-max',   String(opts.pitchMax));
        if (opts.cellWidth  != null) el.setAttribute('cell-width',  String(opts.cellWidth));
        if (opts.cellHeight != null) el.setAttribute('cell-height', String(opts.cellHeight));
        if (opts.snap       != null) el.setAttribute('snap',        String(opts.snap));
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Sheet | null;
        };
        const root = self.render();
        if (root.querySelector('.pr-wrap')) return;

        this.#beats    = parseInt(self.attrSignal('beats')?.peek()      ?? '16', 10) || 16;
        this.#pitchMin = parseInt(self.attrSignal('pitch-min')?.peek()  ?? '36', 10) || 36;
        this.#pitchMax = parseInt(self.attrSignal('pitch-max')?.peek()  ?? '84', 10) || 84;
        this.#cellW    = parseInt(self.attrSignal('cell-width')?.peek() ?? '28', 10) || 28;
        this.#cellH    = parseInt(self.attrSignal('cell-height')?.peek()?? '14', 10) || 14;
        this.#snap     = parseFloat(self.attrSignal('snap')?.peek()     ?? '0.25') || 0.25;

        const wrap = document.createElement('div');
        wrap.className = 'pr-wrap';

        // Toolbar
        const tb = document.createElement('div');
        tb.className = 'pr-toolbar';
        const btnPlay  = document.createElement('button');
        btnPlay.type = 'button'; btnPlay.className = 'pr-btn'; btnPlay.textContent = '▶';
        const btnStop  = document.createElement('button');
        btnStop.type = 'button'; btnStop.className = 'pr-btn'; btnStop.textContent = '■';
        const btnClear = document.createElement('button');
        btnClear.type = 'button'; btnClear.className = 'pr-btn'; btnClear.textContent = 'Clear';
        tb.append(btnPlay, btnStop, btnClear);

        // Body: keyboard | grid
        const body = document.createElement('div');
        body.className = 'pr-body';

        const keyboard = document.createElement('div');
        keyboard.className = 'pr-keyboard';
        for (let p = this.#pitchMax; p >= this.#pitchMin; p--) {
            const k = document.createElement('div');
            k.className = 'pr-key ' + (isBlackKey(p) ? 'pr-key-black' : 'pr-key-white');
            k.style.height = this.#cellH + 'px';
            if (p % 12 === 0) k.textContent = pitchLabel(p);
            keyboard.appendChild(k);
        }

        const grid = document.createElement('div');
        grid.className = 'pr-grid';
        grid.style.width  = (this.#beats * this.#cellW) + 'px';
        grid.style.height = ((this.#pitchMax - this.#pitchMin + 1) * this.#cellH) + 'px';
        this.#grid = grid;
        this.#paintGrid(grid);

        body.append(keyboard, grid);
        wrap.append(tb, body);
        root.appendChild(wrap);

        // Notes layer
        effect(() => {
            // Strip existing note elements, redraw from signal
            grid.querySelectorAll('.pr-note').forEach(n => n.remove());
            for (const n of this.notes$.get()) {
                const div = this.#renderNote(n);
                grid.appendChild(div);
            }
            // Playhead
            const ph = this.playhead$.get();
            let phEl = grid.querySelector<HTMLDivElement>('.pr-playhead');
            if (!phEl) {
                phEl = document.createElement('div');
                phEl.className = 'pr-playhead';
                grid.appendChild(phEl);
            }
            phEl.style.left = (ph * this.#cellW) + 'px';
        });

        // Click-empty to add a note
        grid.addEventListener('pointerdown', (e: PointerEvent) => {
            const t = e.target as HTMLElement;
            if (t.classList.contains('pr-note') || t.classList.contains('pr-note-grip')) return;
            const r = grid.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const start = this.#snapBeat(x / this.#cellW);
            const pitch = this.#pitchMax - Math.floor(y / this.#cellH);
            if (pitch < this.#pitchMin || pitch > this.#pitchMax) return;
            const note: PianoNote = { pitch, start, length: 1, velocity: 0.8 };
            this.notes$.set([...this.notes$.peek(), note]);
            self.fire('arianna:pianoroll-note-add', { detail: { note, source: this }, bubbles: true });
        });

        btnPlay .addEventListener('click', () => this.play());
        btnStop .addEventListener('click', () => this.stop());
        btnClear.addEventListener('click', () => {
            this.notes$.set([]);
        });

        self.Sheet = PianoRoll.DefaultSheet();
    }

    #paintGrid(grid: HTMLElement): void {
        const cols = this.#beats;
        const rows = this.#pitchMax - this.#pitchMin + 1;
        // Vertical beat lines via background-image (cheap)
        grid.style.backgroundImage = [
            `linear-gradient(to right, var(--ar-border, #2a2a2a) 1px, transparent 1px)`,
            `linear-gradient(to bottom, var(--ar-border, #2a2a2a) 1px, transparent 1px)`,
        ].join(', ');
        grid.style.backgroundSize = `${this.#cellW}px 100%, 100% ${this.#cellH}px`;

        // Black-key row tint via overlay divs (one per black row)
        for (let p = this.#pitchMax; p >= this.#pitchMin; p--) {
            if (!isBlackKey(p)) continue;
            const row = document.createElement('div');
            row.className = 'pr-row-tint';
            row.style.top    = ((this.#pitchMax - p) * this.#cellH) + 'px';
            row.style.height = this.#cellH + 'px';
            row.style.width  = (cols * this.#cellW) + 'px';
            grid.appendChild(row);
        }
    }

    #renderNote(n: PianoNote): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'pr-note';
        div.style.left   = (n.start * this.#cellW) + 'px';
        div.style.top    = ((this.#pitchMax - n.pitch) * this.#cellH) + 'px';
        div.style.width  = (n.length * this.#cellW) + 'px';
        div.style.height = this.#cellH + 'px';
        div.style.opacity = String(0.5 + n.velocity * 0.5);
        // Resize grip
        const grip = document.createElement('div');
        grip.className = 'pr-note-grip';
        div.appendChild(grip);

        let dragKind: 'move' | 'resize' | null = null;
        let startX = 0, startY = 0, origStart = 0, origPitch = 0, origLen = 0;

        div.addEventListener('pointerdown', (e: PointerEvent) => {
            e.stopPropagation();
            if (e.detail >= 2) {
                // Double-click → delete
                const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
                this.notes$.set(this.notes$.peek().filter(x => x !== n));
                self.fire('arianna:pianoroll-note-remove', { detail: { note: n, source: this }, bubbles: true });
                return;
            }
            dragKind = (e.target as HTMLElement).classList.contains('pr-note-grip') ? 'resize' : 'move';
            startX = e.clientX; startY = e.clientY;
            origStart = n.start; origPitch = n.pitch; origLen = n.length;
            div.setPointerCapture(e.pointerId);
        });
        div.addEventListener('pointermove', (e: PointerEvent) => {
            if (!dragKind) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (dragKind === 'move') {
                const newStart = this.#snapBeat(origStart + dx / this.#cellW);
                const newPitch = origPitch - Math.round(dy / this.#cellH);
                const updated = { ...n, start: Math.max(0, newStart), pitch: Math.max(this.#pitchMin, Math.min(this.#pitchMax, newPitch)) };
                this.#updateNote(n, updated);
            } else {
                const newLen = Math.max(this.#snap, this.#snapBeat(origLen + dx / this.#cellW));
                const updated = { ...n, length: newLen };
                this.#updateNote(n, updated);
            }
        });
        div.addEventListener('pointerup', (e: PointerEvent) => {
            div.releasePointerCapture(e.pointerId);
            dragKind = null;
        });

        return div;
    }

    #updateNote(oldNote: PianoNote, newNote: PianoNote): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const list = this.notes$.peek();
        const idx = list.indexOf(oldNote);
        if (idx < 0) return;
        const next = list.slice();
        next[idx] = newNote;
        this.notes$.set(next);
        // Mutate oldNote in place so subsequent drag deltas track correctly
        Object.assign(oldNote, newNote);
        self.fire('arianna:pianoroll-note-edit', { detail: { note: newNote, oldNote, source: this }, bubbles: true });
    }

    #snapBeat(b: number): number {
        if (this.#snap <= 0) return b;
        return Math.round(b / this.#snap) * this.#snap;
    }

    // ── Public API ────────────────────────────────────────────────────────

    addNote(n: PianoNote): this {
        this.notes$.set([...this.notes$.peek(), n]);
        return this;
    }

    setNotes(notes: PianoNote[]): this {
        this.notes$.set(notes);
        return this;
    }

    getNotes(): PianoNote[] { return this.notes$.get(); }

    play(): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        this.playing$.set(true);
        self.fire('arianna:pianoroll-play', { detail: { source: this }, bubbles: true });
    }

    stop(): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        this.playing$.set(false);
        this.playhead$.set(0);
        self.fire('arianna:pianoroll-stop', { detail: { source: this }, bubbles: true });
    }

    /** Drive the playhead from an external clock (e.g. AudioContext). */
    setPlayhead(beat: number): this {
        this.playhead$.set(beat);
        return this;
    }

    static DefaultSheet(): Sheet {
        return new Sheet([
            new Rule(':root', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #e0e0e0)',
                display     : 'inline-block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                padding     : '8px',
                userSelect  : 'none',
            }),
            new Rule(':root .pr-wrap', {
                display      : 'flex',
                flexDirection: 'column',
                gap          : '6px',
            }),
            new Rule(':root .pr-toolbar', { display: 'flex', gap: '4px' }),
            new Rule(':root .pr-btn', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.78rem',
                minWidth    : '32px',
                padding     : '4px 10px',
            }),
            new Rule(':root .pr-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
            new Rule(':root .pr-body', {
                display    : 'flex',
                maxHeight  : '320px',
                overflow   : 'auto',
            }),
            new Rule(':root .pr-keyboard', {
                background : 'var(--ar-bg2, #161616)',
                borderRight: '1px solid var(--ar-border, #2a2a2a)',
                display    : 'flex',
                flexDirection: 'column',
                position   : 'sticky',
                left       : '0',
                zIndex     : '2',
            }),
            new Rule(':root .pr-key', {
                alignItems : 'center',
                borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                color      : 'var(--ar-muted, #888)',
                display    : 'flex',
                fontSize   : '0.62rem',
                paddingLeft: '6px',
                width      : '48px',
            }),
            new Rule(':root .pr-key-white', { background: 'var(--ar-bg3, #1e1e1e)' }),
            new Rule(':root .pr-key-black', { background: 'var(--ar-bg, #0d0d0d)' }),
            new Rule(':root .pr-grid', {
                position: 'relative',
                cursor  : 'crosshair',
            }),
            new Rule(':root .pr-row-tint', {
                background    : 'rgba(255,255,255,0.02)',
                pointerEvents : 'none',
                position      : 'absolute',
            }),
            new Rule(':root .pr-note', {
                background  : 'var(--ar-primary, #7eb8f7)',
                border      : '1px solid rgba(0,0,0,0.4)',
                borderRadius: '2px',
                cursor      : 'move',
                position    : 'absolute',
            }),
            new Rule(':root .pr-note-grip', {
                cursor   : 'ew-resize',
                height   : '100%',
                position : 'absolute',
                right    : '0',
                top      : '0',
                width    : '4px',
            }),
            new Rule(':root .pr-playhead', {
                background    : 'var(--ar-danger, #f44336)',
                bottom        : '0',
                pointerEvents : 'none',
                position      : 'absolute',
                top           : '0',
                width         : '2px',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'PianoRoll', {
        value: PianoRoll, writable: false, enumerable: false, configurable: false,
    });
}

export default PianoRoll;
