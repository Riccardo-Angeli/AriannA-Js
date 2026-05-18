/**
 * @module    components/animations/OnionStage
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * OnionStage — viewport companion to KeyframeEditor that overlays
 * faded "ghost" snapshots of past and future frames around the current
 * playhead. Designed for character animation review.
 *
 *   const stage = new OnionStage({ before: 3, after: 3 });
 *   stage.append(document.body);
 *   stage.setFrame(120);
 *   stage.setSnapshotProvider((frame) => paintFn(frame));   // returns HTMLCanvasElement / SVGElement / HTMLElement
 *
 *   <arianna-onion-stage before="3" after="3"></arianna-onion-stage>
 *
 * The "live" frame is shown at full opacity; ghost frames are progressively
 * desaturated and faded based on distance from playhead. Ghost colour
 * is tinted using the CSS vars defined by the keyframe-editor:
 *   • past frames  → blue tint  (--arianna-onion-past,   #4da3ff)
 *   • future frames → red tint  (--arianna-onion-future, #ff6f6f)
 *
 * The widget is render-engine agnostic — it accepts ANY DOM-renderable
 * snapshot via setSnapshotProvider().
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';

export type SnapshotProvider = (frame: number) => HTMLElement | SVGElement | null;

export interface OnionStageOptions {
    before? : number;       // ghost frames before the playhead
    after?  : number;       // ghost frames after
    step?   : number;       // distance (in frames) between ghosts (default 1)
    width?  : number;
    height? : number;
}

export class OnionStage extends Component('arianna-onion-stage', HTMLElement, {}, {
    attrs : ['before', 'after', 'step', 'width', 'height'],
    shadow: false,
})
{
    readonly frame$: Signal<number> = signal(0);

    #provider?: SnapshotProvider;
    #host?    : HTMLDivElement;

    constructor(opts: OnionStageOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.before  != null) el.setAttribute('before',  String(opts.before));
        if (opts.after   != null) el.setAttribute('after',   String(opts.after));
        if (opts.step    != null) el.setAttribute('step',    String(opts.step));
        if (opts.width   != null) el.setAttribute('width',   String(opts.width));
        if (opts.height  != null) el.setAttribute('height',  String(opts.height));
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Sheet | null;
        };
        const root = self.render();
        if (root.querySelector('.os-host')) return;

        const sW = self.attrSignal('width');
        const sH = self.attrSignal('height');
        const w = parseInt(sW?.peek() ?? '420', 10) || 420;
        const h = parseInt(sH?.peek() ?? '300', 10) || 300;
        root.style.width  = w + 'px';
        root.style.height = h + 'px';

        const host = document.createElement('div');
        host.className = 'os-host';
        this.#host = host;
        root.appendChild(host);

        // Re-render whenever frame or provider change
        effect(() => { this.frame$.get(); this.#repaint(); });

        self.Sheet = OnionStage.DefaultSheet();
    }

    /** Provider must return a fresh DOM/SVG snapshot for the given frame. */
    setSnapshotProvider(fn: SnapshotProvider): this {
        this.#provider = fn;
        this.#repaint();
        return this;
    }

    /** Update the live playhead frame. */
    setFrame(f: number): this {
        this.frame$.set(f);
        return this;
    }

    /** Public: total ghost count (before + after). */
    get ghostCount(): number {
        const self = this as unknown as { attrSignal(name: string): Signal<string | null> | undefined };
        const b = parseInt(self.attrSignal('before')?.peek() ?? '2', 10) || 0;
        const a = parseInt(self.attrSignal('after')?.peek()  ?? '2', 10) || 0;
        return b + a;
    }

    #repaint(): void {
        const self = this as unknown as { attrSignal(name: string): Signal<string | null> | undefined };
        const host = this.#host;
        if (!host || !this.#provider) return;
        while (host.firstChild) host.removeChild(host.firstChild);

        const before = parseInt(self.attrSignal('before')?.peek() ?? '2', 10) || 0;
        const after  = parseInt(self.attrSignal('after')?.peek()  ?? '2', 10) || 0;
        const step   = parseInt(self.attrSignal('step')?.peek()   ?? '1', 10) || 1;
        const live   = this.frame$.peek();

        // Past ghosts (deepest first so live ends up on top)
        for (let i = before; i >= 1; i--) {
            const f = live - i * step;
            const snap = this.#provider(f);
            if (snap) {
                const ghost = this.#wrapGhost(snap, i / Math.max(1, before), 'past');
                host.appendChild(ghost);
            }
        }
        // Future ghosts
        for (let i = after; i >= 1; i--) {
            const f = live + i * step;
            const snap = this.#provider(f);
            if (snap) {
                const ghost = this.#wrapGhost(snap, i / Math.max(1, after), 'future');
                host.appendChild(ghost);
            }
        }
        // Live frame on top, full opacity
        const liveSnap = this.#provider(live);
        if (liveSnap) {
            const w = document.createElement('div');
            w.className = 'os-live';
            w.appendChild(liveSnap);
            host.appendChild(w);
        }
    }

    #wrapGhost(snap: HTMLElement | SVGElement, distRatio: number, kind: 'past' | 'future'): HTMLDivElement {
        // distRatio: 1 = furthest (most faded), 0 = closest to live
        const opacity = 0.45 * (1 - distRatio * 0.7);
        const wrap = document.createElement('div');
        wrap.className = `os-ghost os-ghost-${kind}`;
        wrap.style.opacity = String(opacity);
        wrap.appendChild(snap);
        return wrap;
    }

    static DefaultSheet(): Sheet {
        return new Sheet([
            new Rule(':root', {
                background  : 'var(--ar-bg2, #161616)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                display     : 'inline-block',
                overflow    : 'hidden',
                position    : 'relative',
            }),
            new Rule(':root .os-host', {
                height  : '100%',
                position: 'relative',
                width   : '100%',
            }),
            new Rule(':root .os-host > *', {
                inset      : '0',
                pointerEvents: 'none',
                position   : 'absolute',
            }),
            new Rule(':root .os-ghost-past',   { filter: 'grayscale(0.35) sepia(0.1) hue-rotate(190deg)', mixBlendMode: 'screen' }),
            new Rule(':root .os-ghost-future', { filter: 'grayscale(0.35) sepia(0.4) hue-rotate(330deg)', mixBlendMode: 'screen' }),
            new Rule(':root .os-live', { pointerEvents: 'auto', opacity: '1' }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'OnionStage', {
        value: OnionStage, writable: false, enumerable: false, configurable: false,
    });
}

export default OnionStage;
