/**
 * @module    components/animations/Keyframe
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Keyframe — single point on a track. Visually rendered as a diamond
 * (◆) in Blender dope-sheet style:
 *   – Grey when at rest
 *   – Orange when the editor's playhead is on this exact frame ("hot")
 *   – Cyan outline when selected
 *
 * Lives as a child of `<arianna-anim-track>`, which itself lives as
 * a child of `<arianna-keyframe-editor>`. The bus pattern lets each
 * AnimTrack collect its child Keyframes automatically.
 *
 *   <arianna-keyframe frame="24" value="5"></arianna-keyframe>
 *
 *   const kf = new Keyframe({ frame: 24, value: 5 });
 *   track.append(kf);
 *
 * Events:
 *   arianna:keyframe-select { keyframe }
 *   arianna:keyframe-move   { keyframe, frame, value }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export type KeyframeInterpolation = 'constant' | 'linear' | 'bezier';

export interface KeyframeOptions {
    frame?         : number;
    value?         : number;
    interpolation? : KeyframeInterpolation;
    /** Bezier handle offsets in (frames, value) units relative to the key. */
    handleIn?      : [number, number];
    handleOut?     : [number, number];
}

export class Keyframe extends Component('arianna-keyframe', HTMLElement, {}, {
    attrs : ['frame', 'value', 'interpolation', 'selected', 'hot'],
    bus   : 'arianna-anim-track',
})
{
    readonly frame$         : Signal<number> = signal(0);
    readonly value$         : Signal<number> = signal(0);
    readonly interpolation$ : Signal<KeyframeInterpolation> = signal('bezier' as KeyframeInterpolation);
    readonly handleIn$      : Signal<[number, number]> = signal([-1, 0] as [number, number]);
    readonly handleOut$     : Signal<[number, number]> = signal([ 1, 0] as [number, number]);

    constructor(opts: KeyframeOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.frame != null)         el.setAttribute('frame',          String(opts.frame));
        if (opts.value != null)         el.setAttribute('value',          String(opts.value));
        if (opts.interpolation)         el.setAttribute('interpolation',  opts.interpolation);
        if (opts.frame != null)         this.frame$.set(opts.frame);
        if (opts.value != null)         this.value$.set(opts.value);
        if (opts.interpolation)         this.interpolation$.set(opts.interpolation);
        if (opts.handleIn)              this.handleIn$.set(opts.handleIn);
        if (opts.handleOut)             this.handleOut$.set(opts.handleOut);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const el = self.render();
        if (el.querySelector('.kf-diamond')) return;

        const diamond = document.createElement('span');
        diamond.className = 'kf-diamond';
        el.appendChild(diamond);

        const sFrame = self.attrSignal('frame');
        const sValue = self.attrSignal('value');
        const sInterp = self.attrSignal('interpolation');

        effect(() => {
            const v = sFrame?.get();
            if (v != null) this.frame$.set(parseFloat(v) || 0);
        });
        effect(() => {
            const v = sValue?.get();
            if (v != null) this.value$.set(parseFloat(v) || 0);
        });
        effect(() => {
            const v = sInterp?.get();
            if (v) this.interpolation$.set(v as KeyframeInterpolation);
        });

        // Position via CSS var --frame-px on the parent track
        effect(() => {
            el.style.left = `calc(${this.frame$.get()} * var(--frame-px, 14px))`;
        });

        // Click to select
        el.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            el.toggleAttribute('selected');
            self.fire('arianna:keyframe-select', { detail: { keyframe: this, source: this }, bubbles: true });
        });

        self.Sheet = Keyframe.DefaultSheet();
    }

    /** Public API. */
    setFrame(f: number): this { this.frame$.set(f); return this; }
    setValue(v: number): this { this.value$.set(v); return this; }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                bottom        : '0',
                display       : 'inline-block',
                pointerEvents : 'auto',
                position      : 'absolute',
                top           : '0',
                transform     : 'translateX(-50%)',
                width         : '14px',
            }),
            new Rule(':host .kf-diamond', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-text, #e0e0e0)',
                cursor      : 'pointer',
                display     : 'block',
                height      : '10px',
                left        : '50%',
                position    : 'absolute',
                top         : '50%',
                transform   : 'translate(-50%, -50%) rotate(45deg)',
                transition  : 'background .12s, border-color .12s',
                width       : '10px',
            }),
            new Rule(':host([hot]) .kf-diamond', {
                background  : 'var(--ar-warning, #ff9800)',
                borderColor : '#fff',
            }),
            new Rule(':host([selected]) .kf-diamond', {
                outline       : '2px solid var(--ar-primary, #7eb8f7)',
                outlineOffset : '1px',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Keyframe', {
        value: Keyframe, writable: false, enumerable: false, configurable: false,
    });
}

export default Keyframe;
