/**
 * @module    components/audio/AudioTrackEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * AudioTrackEditor — multi-track timeline editor (DAW-style):
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ Tracks            │  bars: 1     2     3     4     5    6    │
 *   ├───────────────────┼──────────────────────────────────────────┤
 *   │ ▶ Vocals      [M] │     ╔══════════╗                         │
 *   │   ┌─────┐         │                                          │
 *   │ ▶ Drums       [M] │  ╔════════╗      ╔═════╗                 │
 *   │ ▶ Bass        [M] │           ╔══════════╗                   │
 *   └───────────────────┴──────────────────────────────────────────┘
 *
 * Three co-located custom elements registered from this single file:
 *
 *   • <arianna-audio-track-editor>   — root container with timeline
 *   • <arianna-audio-track>          — per-track lane (bus = root)
 *   • <arianna-audio-part>           — clip inside a track (bus = track)
 *
 *   const ed = new AudioTrackEditor({ bars: 16 });
 *   const t  = new AudioTrack({ name: 'Vocals' });
 *   const p  = new AudioPart({ start: 0, length: 4, label: 'verse 1' });
 *   t.add(p); ed.add(t);
 *   ed.append(document.body);
 *
 *   <arianna-audio-track-editor bars="16">
 *     <arianna-audio-track name="Vocals">
 *       <arianna-audio-part start="0" length="4" label="verse 1"></arianna-audio-part>
 *     </arianna-audio-track>
 *   </arianna-audio-track-editor>
 *
 * Events:
 *   arianna:track-add        { track }
 *   arianna:track-remove     { track }
 *   arianna:track-mute       { track, value }
 *   arianna:track-solo       { track, value }
 *   arianna:part-move        { part, start }
 *   arianna:part-resize      { part, length }
 *   arianna:part-select      { part }
 *   arianna:editor-playhead  { beat }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

const BEAT_PX_DEFAULT = 20;     // px per beat at zoom = 1
const BEATS_PER_BAR    = 4;

// ── AudioPart ────────────────────────────────────────────────────────────

export interface AudioPartOptions {
    start?  : number;   // beats
    length? : number;   // beats
    label?  : string;
    color?  : string;
}

export class AudioPart extends Component('arianna-audio-part', HTMLElement, {}, {
    attrs : ['start', 'length', 'label', 'color', 'selected'],
})
{
    readonly start$ : Signal<number> = signal(0);
    readonly length$: Signal<number> = signal(4);
    readonly color$ : Signal<string> = signal('');

    constructor(opts: AudioPartOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.start  != null) el.setAttribute('start',  String(opts.start));
        if (opts.length != null) el.setAttribute('length', String(opts.length));
        if (opts.label)          el.setAttribute('label',  opts.label);
        if (opts.color)          el.setAttribute('color',  opts.color);
        if (opts.start  != null) this.start$.set(opts.start);
        if (opts.length != null) this.length$.set(opts.length);
        if (opts.color)          this.color$.set(opts.color);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const el = self.render();
        if (el.querySelector('.ap-label')) return;

        const label = document.createElement('span');
        label.className = 'ap-label';
        const grip = document.createElement('span');
        grip.className = 'ap-grip';
        el.appendChild(label);
        el.appendChild(grip);

        const sStart  = self.attrSignal('start');
        const sLen    = self.attrSignal('length');
        const sLabel  = self.attrSignal('label');
        const sColor  = self.attrSignal('color');

        effect(() => {
            const v = sStart?.get();
            if (v != null) this.start$.set(parseFloat(v) || 0);
            el.style.left = `calc(${this.start$.get()} * var(--beat-px, ${BEAT_PX_DEFAULT}px))`;
        });
        effect(() => {
            const v = sLen?.get();
            if (v != null) this.length$.set(parseFloat(v) || 1);
            el.style.width = `calc(${this.length$.get()} * var(--beat-px, ${BEAT_PX_DEFAULT}px))`;
        });
        effect(() => { label.textContent = sLabel?.get() ?? ''; });
        effect(() => {
            const c = sColor?.get() ?? this.color$.get();
            el.style.background = c || 'var(--ar-primary, #7eb8f7)';
        });

        // Drag to move / resize
        let dragKind: 'move' | 'resize' | null = null;
        let startX = 0, origStart = 0, origLen = 0;

        el.addEventListener('pointerdown', (e: PointerEvent) => {
            const targetIsGrip = (e.target as HTMLElement).classList.contains('ap-grip');
            dragKind = targetIsGrip ? 'resize' : 'move';
            startX = e.clientX;
            origStart = this.start$.peek();
            origLen   = this.length$.peek();
            el.setPointerCapture(e.pointerId);
            // Select
            el.setAttribute('selected', '');
            self.fire('arianna:part-select', { detail: { part: this, source: this }, bubbles: true });
        });
        el.addEventListener('pointermove', (e: PointerEvent) => {
            if (!dragKind) return;
            const beatPx = this.#getBeatPx(el);
            const dBeats = (e.clientX - startX) / beatPx;
            if (dragKind === 'move') {
                const next = Math.max(0, Math.round((origStart + dBeats) * 4) / 4);
                this.start$.set(next);
                el.setAttribute('start', String(next));
                self.fire('arianna:part-move', { detail: { part: this, start: next, source: this }, bubbles: true });
            } else {
                const next = Math.max(0.25, Math.round((origLen + dBeats) * 4) / 4);
                this.length$.set(next);
                el.setAttribute('length', String(next));
                self.fire('arianna:part-resize', { detail: { part: this, length: next, source: this }, bubbles: true });
            }
        });
        el.addEventListener('pointerup', (e: PointerEvent) => {
            el.releasePointerCapture(e.pointerId);
            dragKind = null;
        });

        self.Sheet = AudioPart.DefaultSheet();
    }

    #getBeatPx(el: HTMLElement): number {
        const cs = getComputedStyle(el);
        const v = parseFloat(cs.getPropertyValue('--beat-px'));
        return isFinite(v) && v > 0 ? v : BEAT_PX_DEFAULT;
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-primary, #7eb8f7)',
                border      : '1px solid rgba(0,0,0,0.3)',
                borderRadius: '3px',
                color       : '#000',
                cursor      : 'grab',
                display     : 'block',
                fontSize    : '0.7rem',
                overflow    : 'hidden',
                padding     : '2px 6px',
                position    : 'absolute',
                top         : '4px',
                bottom      : '4px',
                userSelect  : 'none',
                whiteSpace  : 'nowrap',
            }),
            new Rule(':host([selected])', {
                boxShadow: '0 0 0 2px var(--ar-warning, #ff9800)',
                zIndex   : '2',
            }),
            new Rule(':host .ap-label', {
                pointerEvents : 'none',
            }),
            new Rule(':host .ap-grip', {
                bottom    : '0',
                cursor    : 'ew-resize',
                position  : 'absolute',
                right     : '0',
                top       : '0',
                width     : '6px',
            }),
        ]);
    }
}

// ── AudioTrack ───────────────────────────────────────────────────────────

export interface AudioTrackOptions {
    name?  : string;
    muted? : boolean;
    soloed?: boolean;
    color? : string;
}

export class AudioTrack extends Component('arianna-audio-track', HTMLElement, {}, {
    attrs : ['name', 'muted', 'soloed', 'color'],
    bus   : 'arianna-audio-track-editor',
})
{
    constructor(opts: AudioTrackOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.name)   el.setAttribute('name',   opts.name);
        if (opts.muted)  el.setAttribute('muted',  '');
        if (opts.soloed) el.setAttribute('soloed', '');
        if (opts.color)  el.setAttribute('color',  opts.color);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const el = self.render();
        if (el.querySelector('.at-head')) return;

        // Header
        const head = document.createElement('div');
        head.className = 'at-head';

        const name = document.createElement('span');
        name.className = 'at-name';
        const sName = self.attrSignal('name');
        effect(() => { name.textContent = sName?.get() ?? 'Track'; });

        const btnMute = document.createElement('button');
        btnMute.type = 'button'; btnMute.className = 'at-btn at-mute'; btnMute.textContent = 'M';
        const btnSolo = document.createElement('button');
        btnSolo.type = 'button'; btnSolo.className = 'at-btn at-solo'; btnSolo.textContent = 'S';

        head.append(name, btnMute, btnSolo);

        // Lane (where parts live)
        const lane = document.createElement('div');
        lane.className = 'at-lane';

        // Move any pre-existing AudioPart children into the lane
        Array.from(el.querySelectorAll('arianna-audio-part'))
             .forEach(p => lane.appendChild(p));

        el.appendChild(head);
        el.appendChild(lane);

        // Mute / Solo handlers
        btnMute.addEventListener('click', () => {
            const v = !el.hasAttribute('muted');
            if (v) el.setAttribute('muted', ''); else el.removeAttribute('muted');
            self.fire('arianna:track-mute', { detail: { track: this, value: v, source: this }, bubbles: true });
        });
        btnSolo.addEventListener('click', () => {
            const v = !el.hasAttribute('soloed');
            if (v) el.setAttribute('soloed', ''); else el.removeAttribute('soloed');
            self.fire('arianna:track-solo', { detail: { track: this, value: v, source: this }, bubbles: true });
        });

        effect(() => { btnMute.classList.toggle('active', el.hasAttribute('muted')); });
        effect(() => { btnSolo.classList.toggle('active', el.hasAttribute('soloed')); });

        self.Sheet = AudioTrack.DefaultSheet();
    }

    /** Add a part to this track's lane (places into the lane container). */
    addPart(p: AudioPart): this {
        const self = this as unknown as { render(): HTMLElement };
        const lane = self.render().querySelector('.at-lane');
        if (!lane) return this;
        const partEl = (p as unknown as { render(): HTMLElement }).render();
        lane.appendChild(partEl);
        return this;
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                display     : 'grid',
                gridTemplateColumns: '160px 1fr',
                height      : '56px',
            }),
            new Rule(':host .at-head', {
                alignItems   : 'center',
                background   : 'var(--ar-bg2, #161616)',
                borderRight  : '1px solid var(--ar-border, #2a2a2a)',
                display      : 'flex',
                gap          : '4px',
                padding      : '0 8px',
            }),
            new Rule(':host .at-name', {
                color    : 'var(--ar-text, #e0e0e0)',
                flex     : '1',
                fontSize : '0.78rem',
                overflow : 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }),
            new Rule(':host .at-btn', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.68rem',
                minWidth    : '24px',
                padding     : '2px 6px',
            }),
            new Rule(':host .at-mute.active', { background: 'var(--ar-danger, #f44336)', color: '#fff' }),
            new Rule(':host .at-solo.active', { background: 'var(--ar-warning, #ff9800)', color: '#fff' }),
            new Rule(':host([muted]) .at-lane', { opacity: '0.4' }),
            new Rule(':host .at-lane', {
                background: 'var(--ar-bg, #0d0d0d)',
                position  : 'relative',
            }),
        ]);
    }
}

// ── AudioTrackEditor (root) ──────────────────────────────────────────────

export interface AudioTrackEditorOptions {
    bars?       : number;
    beatsPerBar?: number;
    beatPx?     : number;
}

export class AudioTrackEditor extends Component('arianna-audio-track-editor', HTMLElement, {}, {
    attrs : ['bars', 'beats-per-bar', 'beat-px'],
})
{
    readonly playhead$: Signal<number> = signal(0);    // in beats

    #bars        = 16;
    #beatsPerBar = BEATS_PER_BAR;
    #beatPx      = BEAT_PX_DEFAULT;

    constructor(opts: AudioTrackEditorOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.bars        != null) el.setAttribute('bars',          String(opts.bars));
        if (opts.beatsPerBar != null) el.setAttribute('beats-per-bar', String(opts.beatsPerBar));
        if (opts.beatPx      != null) el.setAttribute('beat-px',       String(opts.beatPx));
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.ate-ruler')) return;

        this.#bars        = parseInt(self.attrSignal('bars')?.peek()          ?? '16', 10) || 16;
        this.#beatsPerBar = parseInt(self.attrSignal('beats-per-bar')?.peek() ?? '4',  10) || 4;
        this.#beatPx      = parseInt(self.attrSignal('beat-px')?.peek()       ?? String(BEAT_PX_DEFAULT), 10) || BEAT_PX_DEFAULT;
        root.style.setProperty('--beat-px', this.#beatPx + 'px');

        // Ruler (top bar with bar numbers)
        const ruler = document.createElement('div');
        ruler.className = 'ate-ruler';
        const corner = document.createElement('div');
        corner.className = 'ate-corner';
        const rulerInner = document.createElement('div');
        rulerInner.className = 'ate-ruler-inner';
        for (let b = 1; b <= this.#bars; b++) {
            const tick = document.createElement('span');
            tick.className = 'ate-tick';
            tick.style.left = ((b - 1) * this.#beatsPerBar * this.#beatPx) + 'px';
            tick.textContent = String(b);
            rulerInner.appendChild(tick);
        }
        const totalWidth = this.#bars * this.#beatsPerBar * this.#beatPx;
        rulerInner.style.width = totalWidth + 'px';
        ruler.append(corner, rulerInner);

        // Body — tracks
        const body = document.createElement('div');
        body.className = 'ate-body';
        // Move pre-existing tracks
        Array.from(root.querySelectorAll('arianna-audio-track'))
             .forEach(t => body.appendChild(t));

        // Playhead overlay
        const playhead = document.createElement('div');
        playhead.className = 'ate-playhead';
        effect(() => {
            const b = this.playhead$.get();
            playhead.style.left = (160 + b * this.#beatPx) + 'px';
        });

        root.append(ruler, body, playhead);

        self.Sheet = AudioTrackEditor.DefaultSheet();
    }

    /** Set the playhead in beats. */
    setPlayhead(beats: number): this {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        this.playhead$.set(beats);
        self.fire('arianna:editor-playhead', { detail: { beat: beats, source: this }, bubbles: true });
        return this;
    }

    /** All AudioTrack children registered to this editor (via bus). */
    get tracks(): AudioTrack[] {
        const self = this as unknown as { _children: AudioTrack[] };
        return self._children;
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #e0e0e0)',
                display     : 'block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                overflow    : 'hidden',
                position    : 'relative',
                userSelect  : 'none',
            }),
            new Rule(':host .ate-ruler', {
                background : 'var(--ar-bg2, #161616)',
                borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                display    : 'grid',
                gridTemplateColumns: '160px 1fr',
                height     : '24px',
                overflow   : 'hidden',
            }),
            new Rule(':host .ate-corner', {
                background : 'var(--ar-bg2, #161616)',
                borderRight: '1px solid var(--ar-border, #2a2a2a)',
            }),
            new Rule(':host .ate-ruler-inner', {
                position: 'relative',
            }),
            new Rule(':host .ate-tick', {
                color    : 'var(--ar-muted, #888)',
                fontSize : '0.66rem',
                position : 'absolute',
                top      : '4px',
            }),
            new Rule(':host .ate-body', {
                display : 'block',
                maxHeight: '380px',
                overflow: 'auto',
            }),
            new Rule(':host .ate-playhead', {
                background    : 'var(--ar-danger, #f44336)',
                bottom        : '0',
                pointerEvents : 'none',
                position      : 'absolute',
                top           : '24px',
                width         : '2px',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AudioTrackEditor', {
        value: AudioTrackEditor, writable: false, enumerable: false, configurable: false,
    });
    Object.defineProperty(window, 'AudioTrack', {
        value: AudioTrack, writable: false, enumerable: false, configurable: false,
    });
    Object.defineProperty(window, 'AudioPart', {
        value: AudioPart, writable: false, enumerable: false, configurable: false,
    });
}

export default AudioTrackEditor;
