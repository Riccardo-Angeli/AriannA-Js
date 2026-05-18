/**
 * @module    components/animations/KeyframeEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * KeyframeEditor — Blender-style Action Editor / Dope Sheet for
 * animations. Contains one or more `<arianna-anim-track>` rows, each
 * with `<arianna-keyframe>` children.
 *
 *   <arianna-keyframe-editor frame-start="0" frame-end="100" current="24">
 *     <arianna-anim-track name="X Location"          group="position">
 *       <arianna-keyframe frame="0"  value="0"></arianna-keyframe>
 *       <arianna-keyframe frame="24" value="5"></arianna-keyframe>
 *     </arianna-anim-track>
 *     <arianna-anim-track name="W Quaternion Rotation" group="rotation">
 *       <arianna-keyframe frame="0"  value="1"></arianna-keyframe>
 *     </arianna-anim-track>
 *   </arianna-keyframe-editor>
 *
 *   const ed = new KeyframeEditor({ frameStart: 0, frameEnd: 240, current: 0 });
 *   ed.append(document.body);
 *
 *   const trX = new AnimTrack({ name: 'X Location', channel: 'loc-x', group: 'position' });
 *   trX.addKeyframe(new Keyframe({ frame: 0,  value: 0 }));
 *   trX.addKeyframe(new Keyframe({ frame: 24, value: 5 }));
 *   ed.addTrack(trX);
 *
 * The editor automatically defines the standard Blender channel set
 * when `auto-channels` is set:
 *   X / Y / Z Location · W / X / Y / Z Quaternion Rotation · X / Y / Z Scale
 *
 * Events:
 *   arianna:keyframe-editor-update   { source }
 *   arianna:keyframe-editor-playhead { frame }
 *   arianna:keyframe-editor-play
 *   arianna:keyframe-editor-pause
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';
import { AnimTrack, type ChannelGroup } from './AnimTrack.ts';

export interface KeyframeEditorOptions {
    frameStart?  : number;
    frameEnd?    : number;
    current?     : number;
    framePx?     : number;       // px per frame
    frameStep?   : number;       // major grid step
    trackHeight? : number;
    autoChannels?: boolean;      // pre-create the 10 standard Blender channels
}

const STD_CHANNELS: Array<{ name: string; channel: string; group: ChannelGroup }> = [
    { name: 'X Location',           channel: 'loc-x',  group: 'position' },
    { name: 'Y Location',           channel: 'loc-y',  group: 'position' },
    { name: 'Z Location',           channel: 'loc-z',  group: 'position' },
    { name: 'W Quaternion Rotation', channel: 'rot-w', group: 'rotation' },
    { name: 'X Quaternion Rotation', channel: 'rot-x', group: 'rotation' },
    { name: 'Y Quaternion Rotation', channel: 'rot-y', group: 'rotation' },
    { name: 'Z Quaternion Rotation', channel: 'rot-z', group: 'rotation' },
    { name: 'X Scale',              channel: 'sca-x',  group: 'scale' },
    { name: 'Y Scale',              channel: 'sca-y',  group: 'scale' },
    { name: 'Z Scale',              channel: 'sca-z',  group: 'scale' },
];

export class KeyframeEditor extends Component('arianna-keyframe-editor', HTMLElement, {}, {
    attrs : ['frame-start', 'frame-end', 'current', 'frame-px', 'frame-step', 'track-height', 'auto-channels', 'playing'],
    shadow: false,
})
{
    readonly current$: Signal<number> = signal(0);

    #rafId      = 0;
    #lastTime   = 0;
    #fps        = 24;
    #playing    = false;
    #body?      : HTMLDivElement;
    #ruler?     : HTMLDivElement;
    #playhead?  : HTMLDivElement;

    constructor(opts: KeyframeEditorOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.frameStart   != null) el.setAttribute('frame-start', String(opts.frameStart));
        if (opts.frameEnd     != null) el.setAttribute('frame-end',   String(opts.frameEnd));
        if (opts.current      != null) el.setAttribute('current',     String(opts.current));
        if (opts.framePx      != null) el.setAttribute('frame-px',    String(opts.framePx));
        if (opts.frameStep    != null) el.setAttribute('frame-step',  String(opts.frameStep));
        if (opts.trackHeight  != null) el.setAttribute('track-height', String(opts.trackHeight));
        if (opts.autoChannels)         el.setAttribute('auto-channels', '');
        if (opts.current      != null) this.current$.set(opts.current);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Sheet | null;
        };
        const root = self.render();
        if (root.querySelector('.kfe-toolbar')) return;

        const frameStart  = parseInt(self.attrSignal('frame-start')?.peek()  ?? '0',   10) || 0;
        const frameEnd    = parseInt(self.attrSignal('frame-end')?.peek()    ?? '100', 10) || 100;
        const framePx     = parseInt(self.attrSignal('frame-px')?.peek()     ?? '14',  10) || 14;
        const frameStep   = parseInt(self.attrSignal('frame-step')?.peek()   ?? '5',   10) || 5;
        const trackHeight = parseInt(self.attrSignal('track-height')?.peek() ?? '22',  10) || 22;

        root.style.setProperty('--frame-px',       framePx + 'px');
        root.style.setProperty('--frame-step-px',  (framePx * frameStep) + 'px');
        root.style.setProperty('--track-height',   trackHeight + 'px');
        root.style.setProperty('--track-head-width', '160px');

        // Toolbar
        const tb = document.createElement('div');
        tb.className = 'kfe-toolbar';
        const btnFirst = this.#mkBtn('|◀', 'kfe-first');
        const btnPrev  = this.#mkBtn('◀',  'kfe-prev');
        const btnPlay  = this.#mkBtn('▶',  'kfe-play');
        const btnNext  = this.#mkBtn('▶',  'kfe-next');
        const btnLast  = this.#mkBtn('▶|', 'kfe-last');
        const frameInput = document.createElement('input') as HTMLInputElement;
        frameInput.type = 'number';
        frameInput.className = 'kfe-frame-input';
        frameInput.value = String(this.current$.peek());
        const lblStart = document.createElement('span'); lblStart.className = 'kfe-frame-lbl';
        lblStart.textContent = 'Start ' + frameStart;
        const lblEnd   = document.createElement('span'); lblEnd.className   = 'kfe-frame-lbl';
        lblEnd.textContent = 'End ' + frameEnd;
        tb.append(btnFirst, btnPrev, btnPlay, btnNext, btnLast, frameInput, lblStart, lblEnd);

        // Ruler
        const ruler = document.createElement('div');
        ruler.className = 'kfe-ruler';
        const rulerCorner = document.createElement('div');
        rulerCorner.className = 'kfe-ruler-corner';
        const rulerInner  = document.createElement('div');
        rulerInner.className = 'kfe-ruler-inner';
        for (let f = frameStart; f <= frameEnd; f += frameStep) {
            const tick = document.createElement('span');
            tick.className = 'kfe-tick';
            tick.style.left = ((f - frameStart) * framePx) + 'px';
            tick.textContent = String(f);
            rulerInner.appendChild(tick);
        }
        const totalWidth = (frameEnd - frameStart) * framePx;
        rulerInner.style.width = totalWidth + 'px';
        ruler.append(rulerCorner, rulerInner);
        this.#ruler = ruler;

        // Body
        const body = document.createElement('div');
        body.className = 'kfe-body';
        // Move pre-existing tracks
        Array.from(root.querySelectorAll('arianna-anim-track'))
             .forEach(t => body.appendChild(t));
        this.#body = body;

        // Auto-channels
        if (root.hasAttribute('auto-channels') && !body.querySelector('arianna-anim-track')) {
            for (const ch of STD_CHANNELS) {
                const tr = new AnimTrack({ name: ch.name, channel: ch.channel, group: ch.group });
                const trEl = (tr as unknown as { render(): HTMLElement }).render();
                body.appendChild(trEl);
            }
        }

        // Playhead overlay
        const playhead = document.createElement('div');
        playhead.className = 'kfe-playhead';
        playhead.style.left = `calc(var(--track-head-width, 160px) + ${(this.current$.peek() - frameStart) * framePx}px)`;
        this.#playhead = playhead;

        root.append(tb, ruler, body, playhead);

        // Click on ruler → set current
        rulerInner.addEventListener('pointerdown', (e: PointerEvent) => {
            const r = rulerInner.getBoundingClientRect();
            const f = Math.round((e.clientX - r.left) / framePx) + frameStart;
            this.setFrame(f);
        });

        // Reactive playhead position + hot keyframe
        effect(() => {
            const f = this.current$.get();
            if (this.#playhead) {
                this.#playhead.style.left = `calc(var(--track-head-width, 160px) + ${(f - frameStart) * framePx}px)`;
            }
            frameInput.value = String(f);
            this.#updateHotKeyframes(f);
        });

        // Frame input
        frameInput.addEventListener('change', () => {
            const v = parseInt(frameInput.value, 10);
            if (isFinite(v)) this.setFrame(v);
        });
        btnFirst.addEventListener('click', () => this.setFrame(frameStart));
        btnLast .addEventListener('click', () => this.setFrame(frameEnd));
        btnPrev .addEventListener('click', () => this.setFrame(this.current$.peek() - 1));
        btnNext .addEventListener('click', () => this.setFrame(this.current$.peek() + 1));
        btnPlay .addEventListener('click', () => this.togglePlay());

        // Fire update event whenever DOM changes
        const observer = new MutationObserver(() => {
            self.fire('arianna:keyframe-editor-update', { detail: { source: this }, bubbles: false });
            this.#updateHotKeyframes(this.current$.peek());
        });
        observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['frame', 'value', 'selected', 'hidden'] });

        self.Sheet = KeyframeEditor.DefaultSheet();

        // initial update event
        queueMicrotask(() => {
            self.fire('arianna:keyframe-editor-update', { detail: { source: this }, bubbles: false });
            this.#updateHotKeyframes(this.current$.peek());
        });
    }

    #mkBtn(label: string, cls: string): HTMLButtonElement {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'kfe-btn ' + cls; b.textContent = label;
        return b;
    }

    #updateHotKeyframes(current: number): void {
        const self = this as unknown as { render(): HTMLElement };
        const all = self.render().querySelectorAll('arianna-keyframe');
        all.forEach(k => {
            const f = parseFloat(k.getAttribute('frame') ?? '0');
            if (Math.abs(f - current) < 0.5) k.setAttribute('hot', '');
            else                              k.removeAttribute('hot');
        });
    }

    // ── Public API ────────────────────────────────────────────────────────

    addTrack(t: AnimTrack): this {
        if (!this.#body) return this;
        const el = (t as unknown as { render(): HTMLElement }).render();
        this.#body.appendChild(el);
        return this;
    }

    setFrame(f: number): this {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
        };
        const start = parseInt(self.attrSignal('frame-start')?.peek() ?? '0',  10) || 0;
        const end   = parseInt(self.attrSignal('frame-end')?.peek()   ?? '100',10) || 100;
        const cl    = Math.max(start, Math.min(end, Math.round(f)));
        this.current$.set(cl);
        self.render().setAttribute('current', String(cl));
        self.fire('arianna:keyframe-editor-playhead', { detail: { frame: cl, source: this }, bubbles: true });
        return this;
    }

    togglePlay(): void { this.#playing ? this.pause() : this.play(); }

    play(): void {
        const self = this as unknown as { render(): HTMLElement; fire(t: string, init?: CustomEventInit): void };
        if (this.#playing) return;
        this.#playing = true;
        self.render().setAttribute('playing', '');
        self.fire('arianna:keyframe-editor-play', { detail: { source: this }, bubbles: true });
        this.#lastTime = performance.now();
        const tick = (now: number) => {
            if (!this.#playing) { this.#rafId = 0; return; }
            const dt = (now - this.#lastTime) / 1000;
            this.#lastTime = now;
            const dFrames = dt * this.#fps;
            const next = this.current$.peek() + dFrames;
            const end = parseInt(((this as unknown as { attrSignal(name: string): Signal<string | null> | undefined }).attrSignal('frame-end')?.peek()) ?? '100', 10) || 100;
            const start = parseInt(((this as unknown as { attrSignal(name: string): Signal<string | null> | undefined }).attrSignal('frame-start')?.peek()) ?? '0', 10) || 0;
            if (next > end) this.setFrame(start);
            else            this.setFrame(next);
            this.#rafId = requestAnimationFrame(tick);
        };
        this.#rafId = requestAnimationFrame(tick);
    }

    pause(): void {
        const self = this as unknown as { render(): HTMLElement; fire(t: string, init?: CustomEventInit): void };
        if (!this.#playing) return;
        this.#playing = false;
        self.render().removeAttribute('playing');
        if (this.#rafId) cancelAnimationFrame(this.#rafId);
        this.#rafId = 0;
        self.fire('arianna:keyframe-editor-pause', { detail: { source: this }, bubbles: true });
    }

    setFps(fps: number): this { this.#fps = Math.max(1, fps); return this; }

    onUnmount() { this.pause(); }

    static DefaultSheet(): Sheet {
        return new Sheet([
            new Rule(':root', {
                '--arianna-curve-position' : '#4dd0e1',
                '--arianna-curve-rotation' : '#ff9800',
                '--arianna-curve-scale'    : '#7eb8f7',
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
            new Rule(':root .kfe-toolbar', {
                alignItems   : 'center',
                background   : 'var(--ar-bg2, #161616)',
                borderBottom : '1px solid var(--ar-border, #2a2a2a)',
                display      : 'flex',
                gap          : '6px',
                padding      : '4px 6px',
            }),
            new Rule(':root .kfe-btn', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.74rem',
                minWidth    : '28px',
                padding     : '3px 6px',
            }),
            new Rule(':root .kfe-btn:hover', { background: 'var(--ar-bg4, #252525)' }),
            new Rule(':root .kfe-frame-input', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                font        : 'inherit',
                fontSize    : '0.74rem',
                padding     : '3px 6px',
                width       : '64px',
            }),
            new Rule(':root .kfe-frame-lbl', {
                color    : 'var(--ar-muted, #888)',
                fontSize : '0.72rem',
            }),
            new Rule(':root .kfe-ruler', {
                background : 'var(--ar-bg2, #161616)',
                borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                display    : 'grid',
                gridTemplateColumns: 'var(--track-head-width, 160px) 1fr',
                height     : '22px',
                overflow   : 'hidden',
            }),
            new Rule(':root .kfe-ruler-corner', {
                background : 'var(--ar-bg2, #161616)',
                borderRight: '1px solid var(--ar-border, #2a2a2a)',
            }),
            new Rule(':root .kfe-ruler-inner', { position: 'relative' }),
            new Rule(':root .kfe-tick', {
                color    : 'var(--ar-muted, #888)',
                fontSize : '0.66rem',
                position : 'absolute',
                top      : '4px',
            }),
            new Rule(':root .kfe-body', {
                display : 'block',
                maxHeight: '420px',
                overflow: 'auto',
            }),
            new Rule(':root .kfe-playhead', {
                background    : 'var(--ar-danger, #f44336)',
                bottom        : '0',
                pointerEvents : 'none',
                position      : 'absolute',
                top           : '22px',
                width         : '2px',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'KeyframeEditor', {
        value: KeyframeEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default KeyframeEditor;
