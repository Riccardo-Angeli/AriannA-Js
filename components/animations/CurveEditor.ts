/**
 * @module    components/animations/CurveEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * CurveEditor — F-Curve editor companion to KeyframeEditor:
 *
 *   Y axis = channel value, X axis = frame number.
 *   Each AnimTrack contributes a polyline through its Keyframes;
 *   Bezier handles are rendered when a key is selected.
 *
 *   • Position channels (X / Y / Z Location) rendered in --arianna-curve-position
 *   • Rotation channels (W/X/Y/Z Quaternion Rotation) in --arianna-curve-rotation
 *   • Scale channels (X / Y / Z Scale) in --arianna-curve-scale
 *
 *   <arianna-curve-editor></arianna-curve-editor>
 *
 *   const ce = new CurveEditor();
 *   ce.bindEditor(keyframeEditor);    // listens to its tracks
 *
 * The widget can stand alone (just attach an editor reference) or be
 * embedded inside KeyframeEditor in 'split' mode.
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface CurveEditorOptions {
    width?  : number;
    height? : number;
}

interface CurveSample {
    track    : Element;
    group    : string;
    points   : Array<{ frame: number; value: number; selected: boolean; interp: string; hIn: [number, number]; hOut: [number, number] }>;
}

export class CurveEditor extends Component('arianna-curve-editor', HTMLElement, {}, {
    attrs : ['width', 'height'],
})
{
    readonly samples$: Signal<CurveSample[]> = signal<CurveSample[]>([]);
    readonly playhead$: Signal<number>       = signal(0);

    #svg?    : SVGSVGElement;
    #bound?  : Element;          // bound KeyframeEditor instance

    constructor(opts: CurveEditorOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.width  != null) el.setAttribute('width',  String(opts.width));
        if (opts.height != null) el.setAttribute('height', String(opts.height));
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('svg')) return;

        const w = parseInt(self.attrSignal('width')?.peek()  ?? '720', 10) || 720;
        const h = parseInt(self.attrSignal('height')?.peek() ?? '260', 10) || 260;
        const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('width',  String(w));
        svg.setAttribute('height', String(h));
        svg.setAttribute('class', 'ce-svg');
        this.#svg = svg;
        root.appendChild(svg);

        effect(() => { this.samples$.get(); this.playhead$.get(); this.#redraw(); });

        self.Sheet = CurveEditor.DefaultSheet();
    }

    /** Bind to a KeyframeEditor element. The CurveEditor will read its
     *  tracks + keyframes on each update event. */
    bindEditor(editor: Element): this {
        this.#bound = editor;
        editor.addEventListener('arianna:keyframe-editor-update', () => this.#refresh());
        editor.addEventListener('arianna:keyframe-editor-playhead', (e: Event) => {
            const d = (e as CustomEvent<{ frame: number }>).detail;
            this.playhead$.set(d.frame);
        });
        this.#refresh();
        return this;
    }

    #refresh(): void {
        if (!this.#bound) { this.samples$.set([]); return; }
        const tracks = Array.from(this.#bound.querySelectorAll('arianna-anim-track'));
        const samples: CurveSample[] = tracks.map(t => {
            if (t.hasAttribute('hidden')) {
                return { track: t, group: t.getAttribute('group') ?? 'custom', points: [] };
            }
            const kfs = Array.from(t.querySelectorAll('arianna-keyframe'));
            const points = kfs.map(k => ({
                frame    : parseFloat(k.getAttribute('frame') ?? '0') || 0,
                value    : parseFloat(k.getAttribute('value') ?? '0') || 0,
                selected : k.hasAttribute('selected'),
                interp   : k.getAttribute('interpolation') ?? 'bezier',
                hIn      : [-1, 0] as [number, number],
                hOut     : [ 1, 0] as [number, number],
            }));
            points.sort((a, b) => a.frame - b.frame);
            return { track: t, group: t.getAttribute('group') ?? 'custom', points };
        });
        this.samples$.set(samples);
    }

    #redraw(): void {
        const svg = this.#svg;
        if (!svg) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const w = parseInt(svg.getAttribute('width')  ?? '720', 10);
        const h = parseInt(svg.getAttribute('height') ?? '260', 10);
        const samples = this.samples$.peek();
        if (!samples.length) return;

        const padL = 40, padR = 12, padT = 12, padB = 24;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        // Compute domain
        let fMin = 0, fMax = 0, vMin = 0, vMax = 0;
        for (const s of samples) for (const p of s.points) {
            if (p.frame < fMin) fMin = p.frame; if (p.frame > fMax) fMax = p.frame;
            if (p.value < vMin) vMin = p.value; if (p.value > vMax) vMax = p.value;
        }
        if (fMin === fMax) fMax = fMin + 1;
        if (vMin === vMax) { vMin -= 0.5; vMax += 0.5; }
        const fR = fMax - fMin, vR = vMax - vMin;
        const xOf = (f: number) => padL + ((f - fMin) / fR) * plotW;
        const yOf = (v: number) => padT + plotH - ((v - vMin) / vR) * plotH;

        // Grid
        for (let i = 0; i <= 4; i++) {
            const y = padT + (plotH * i / 4);
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(padL));
            line.setAttribute('x2', String(w - padR));
            line.setAttribute('y1', String(y));
            line.setAttribute('y2', String(y));
            line.setAttribute('class', 'ce-grid');
            svg.appendChild(line);
        }

        // Curves
        for (const s of samples) {
            if (s.points.length < 1) continue;
            const groupVar =
                s.group === 'position' ? 'var(--arianna-curve-position, #4dd0e1)' :
                s.group === 'rotation' ? 'var(--arianna-curve-rotation, #ff9800)' :
                s.group === 'scale'    ? 'var(--arianna-curve-scale, #7eb8f7)' :
                                         'var(--ar-muted, #888)';
            const path = document.createElementNS(SVG_NS, 'path');
            let d = '';
            s.points.forEach((p, i) => {
                const x = xOf(p.frame);
                const y = yOf(p.value);
                if (i === 0) d += `M ${x} ${y}`;
                else {
                    const prev = s.points[i - 1]!;
                    if (prev.interp === 'constant') {
                        d += ` H ${x} V ${y}`;
                    } else if (prev.interp === 'linear') {
                        d += ` L ${x} ${y}`;
                    } else {
                        // Bezier — handles in (frames, value) units
                        const c1x = xOf(prev.frame + Math.max(0.1, prev.hOut[0]));
                        const c1y = yOf(prev.value + prev.hOut[1]);
                        const c2x = xOf(p.frame   - Math.max(0.1, -p.hIn[0]));
                        const c2y = yOf(p.value   + p.hIn[1]);
                        d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y}`;
                    }
                }
            });
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', groupVar);
            path.setAttribute('class', 'ce-curve');
            svg.appendChild(path);

            // Keyframe dots
            for (const p of s.points) {
                const c = document.createElementNS(SVG_NS, 'circle');
                c.setAttribute('cx', String(xOf(p.frame)));
                c.setAttribute('cy', String(yOf(p.value)));
                c.setAttribute('r', p.selected ? '4' : '3');
                c.setAttribute('fill', groupVar);
                c.setAttribute('class', 'ce-key' + (p.selected ? ' ce-key-selected' : ''));
                svg.appendChild(c);

                // Bezier handles if selected
                if (p.selected && p.interp === 'bezier') {
                    const drawHandle = (off: [number, number]) => {
                        const hx = xOf(p.frame + off[0]);
                        const hy = yOf(p.value + off[1]);
                        const line = document.createElementNS(SVG_NS, 'line');
                        line.setAttribute('x1', String(xOf(p.frame)));
                        line.setAttribute('y1', String(yOf(p.value)));
                        line.setAttribute('x2', String(hx));
                        line.setAttribute('y2', String(hy));
                        line.setAttribute('class', 'ce-handle-line');
                        line.setAttribute('stroke', groupVar);
                        svg.appendChild(line);
                        const hd = document.createElementNS(SVG_NS, 'rect');
                        hd.setAttribute('x', String(hx - 3));
                        hd.setAttribute('y', String(hy - 3));
                        hd.setAttribute('width',  '6');
                        hd.setAttribute('height', '6');
                        hd.setAttribute('class', 'ce-handle');
                        hd.setAttribute('fill', groupVar);
                        svg.appendChild(hd);
                    };
                    drawHandle(p.hIn);
                    drawHandle(p.hOut);
                }
            }
        }

        // Playhead
        const ph = this.playhead$.peek();
        if (ph >= fMin && ph <= fMax) {
            const phLine = document.createElementNS(SVG_NS, 'line');
            phLine.setAttribute('x1', String(xOf(ph)));
            phLine.setAttribute('x2', String(xOf(ph)));
            phLine.setAttribute('y1', String(padT));
            phLine.setAttribute('y2', String(h - padB));
            phLine.setAttribute('class', 'ce-playhead');
            svg.appendChild(phLine);
        }
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                display     : 'inline-block',
                padding     : '8px',
            }),
            new Rule(':host .ce-svg', { display: 'block' }),
            new Rule(':host .ce-grid', { stroke: 'var(--ar-border, #2a2a2a)', strokeWidth: '1', strokeDasharray: '2 3' }),
            new Rule(':host .ce-curve', { strokeWidth: '1.5', fill: 'none' }),
            new Rule(':host .ce-key', { stroke: '#fff', strokeWidth: '1' }),
            new Rule(':host .ce-key-selected', { stroke: 'var(--ar-warning, #ff9800)', strokeWidth: '2' }),
            new Rule(':host .ce-handle-line', { strokeWidth: '1', strokeDasharray: '2 2', opacity: '0.6' }),
            new Rule(':host .ce-handle', { stroke: '#fff', strokeWidth: '1', cursor: 'grab' }),
            new Rule(':host .ce-playhead', { stroke: 'var(--ar-danger, #f44336)', strokeWidth: '1.5' }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'CurveEditor', {
        value: CurveEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default CurveEditor;
