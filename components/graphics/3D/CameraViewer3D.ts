/**
 * @module    components/graphics/3D/CameraViewer3D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * CameraViewer3D — industry-standard 4-pane 3D viewport:
 *
 *   ┌─────────┬─────────┐
 *   │   Top   │  Front  │  (top: -Y down, front: -Z back)
 *   ├─────────┼─────────┤
 *   │  Side   │  Persp  │  (side: +X, persp: perspective)
 *   └─────────┴─────────┘
 *
 * Owns layout, per-pane camera state, focus, and pane maximize. Does NOT
 * own a renderer — consumers mount their own three.js / WebGPU / SVG / canvas
 * into each `pane.surface` element and listen for `arianna:camera` events.
 *
 * @example HTML
 *   <arianna-camera-viewer-3d width="100%" height="600px" show-axes></arianna-camera-viewer-3d>
 *
 * @example JS
 *   const cv = new CameraViewer3D();
 *   cv.getPane('perspective').surface.appendChild(threeRenderer.domElement);
 *   cv.addEventListener('arianna:camera', e =>
 *     myRenderer.updateCamera(e.detail.pane, e.detail.camera));
 *
 * Events:
 *   arianna:focus  detail: { pane: PaneId }
 *   arianna:camera detail: { pane: PaneId, camera: Camera }
 *
 * Attrs: width, height, show-axes, show-labels, active-pane, maximized-pane
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export type PaneId = 'top' | 'front' | 'side' | 'perspective';
export type ProjectionKind = 'orthographic' | 'perspective';

export interface Vec3 { x: number; y: number; z: number; }

export interface Camera {
    position : Vec3;
    target   : Vec3;
    zoom     : number;
    kind     : ProjectionKind;
}

export interface Pane {
    id       : PaneId;
    label    : string;
    surface  : HTMLElement;
    overlay  : HTMLElement;
    camera   : Camera;
}

export interface CameraViewer3DOptions {
    width?      : string;
    height?     : string;
    showAxes?   : boolean;
    showLabels? : boolean;
}

const DEFAULT_CAMERAS: Record<PaneId, Camera> = {
    top:         { position: { x: 0, y: 10, z: 0 },   target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'orthographic' },
    front:       { position: { x: 0, y: 0,  z: 10 },  target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'orthographic' },
    side:        { position: { x: 10, y: 0, z: 0 },   target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'orthographic' },
    perspective: { position: { x: 7,  y: 5, z: 7 },   target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'perspective'  },
};

const PANE_INFO: Array<{ id: PaneId; label: string }> = [
    { id: 'top',         label: 'Top' },
    { id: 'front',       label: 'Front' },
    { id: 'side',        label: 'Side' },
    { id: 'perspective', label: 'Perspective' },
];

export class CameraViewer3D extends Component('arianna-camera-viewer-3d', HTMLElement, {}, {
    attrs : ['width', 'height', 'show-axes', 'show-labels', 'active-pane', 'maximized-pane'],
})
{
    cameras$: Signal<Record<PaneId, Camera>> = signal<Record<PaneId, Camera>>(
        JSON.parse(JSON.stringify(DEFAULT_CAMERAS)),
    );

    build(_opts: CameraViewer3DOptions = {})
    {
        const wAttr = this.attrSignal('width');
        const hAttr = this.attrSignal('height');
        const activeAttr  = this.attrSignal('active-pane');
        const maxAttr     = this.attrSignal('maximized-pane');

        this.hostStyle = () => {
            const w = wAttr.get() ?? '100%';
            const h = hAttr.get() ?? '600px';
            return `width: ${w}; height: ${h}`;
        };

        this.gridCls = () => {
            const m = maxAttr.get();
            return 'ar-cv3d__grid' + (m ? ' ar-cv3d__grid--maximized ar-cv3d__grid--max-' + m : '');
        };

        this.showAxes   = () => this.getAttribute('show-axes')   !== 'false';
        this.showLabels = () => this.getAttribute('show-labels') !== 'false';

        this.panes = (): Array<{ id: PaneId; label: string; cls: string; camLabel: string }> => {
            const active = activeAttr.get();
            const max    = maxAttr.get();
            const cams = this.cameras$.get();
            return PANE_INFO.map(p => ({
                id: p.id,
                label: p.label,
                cls: 'ar-cv3d__pane ar-cv3d__pane--' + p.id
                    + (active === p.id ? ' ar-cv3d__pane--active' : '')
                    + (max === p.id ? ' ar-cv3d__pane--maximized' : ''),
                camLabel: this.#camLabel(cams[p.id]),
            }));
        };

        this.onPaneMouseDown = (e: Event) => {
            const me = e as MouseEvent;
            const pane = (me.currentTarget as HTMLElement).dataset.pane as PaneId;
            this.setActivePane(pane);
        };
        this.onPaneDblClick = (e: Event) => {
            const me = e as MouseEvent;
            me.preventDefault();
            const pane = (me.currentTarget as HTMLElement).dataset.pane as PaneId;
            this.toggleMaximize(pane);
        };
        this.onPaneWheel = (e: Event) => {
            const we = e as WheelEvent;
            we.preventDefault();
            const pane = (we.currentTarget as HTMLElement).dataset.pane as PaneId;
            const cur = this.cameras$.get();
            const c = cur[pane];
            const factor = we.deltaY > 0 ? 0.92 : 1.08;
            const next = { ...cur, [pane]: { ...c, zoom: Math.max(0.1, Math.min(64, c.zoom * factor)) } };
            this.cameras$.set(next);
            this.#fireCamera(pane);
        };
        this.onPanePointerMove = (e: Event) => {
            // Drag-orbit/pan (very basic — full orbit math left to consumer)
            const pe = e as PointerEvent;
            if (!(pe.buttons & 1) || !pe.altKey) return;
            const pane = (pe.currentTarget as HTMLElement).dataset.pane as PaneId;
            const cur = this.cameras$.get();
            const c = cur[pane];
            const dx = pe.movementX * 0.01;
            const dy = pe.movementY * 0.01;
            const newCam: Camera = {
                ...c,
                position: { x: c.position.x - dx, y: c.position.y + dy, z: c.position.z },
            };
            this.cameras$.set({ ...cur, [pane]: newCam });
            this.#fireCamera(pane);
        };

        this.template = html`
            <div class="ar-cv3d__host" :style="this.hostStyle()">
                <div :class="this.gridCls()">
                    <div a-for="p in this.panes()"
                         :class="p.cls"
                         :data-pane="p.id"
                         @pointerdown="this.onPaneMouseDown"
                         @pointermove="this.onPanePointerMove"
                         @dblclick="this.onPaneDblClick"
                         @wheel="this.onPaneWheel">
                        <div class="ar-cv3d__surface" :data-surface="p.id"></div>
                        <div class="ar-cv3d__overlay">
                            <div class="ar-cv3d__label" a-if="this.showLabels()">{{ p.label }}</div>
                            <div class="ar-cv3d__camlabel">{{ p.camLabel }}</div>
                            <svg a-if="this.showAxes()" class="ar-cv3d__axes"
                                 viewBox="0 0 60 60" width="60" height="60"
                                 xmlns="http://www.w3.org/2000/svg">
                                <line x1="30" y1="30" x2="55" y2="30" stroke="#cf222e" stroke-width="2"/>
                                <line x1="30" y1="30" x2="30" y2="5"  stroke="#1f883d" stroke-width="2"/>
                                <line x1="30" y1="30" x2="48" y2="48" stroke="#1f6feb" stroke-width="2"/>
                                <text x="56" y="32" font-size="8" fill="#cf222e">X</text>
                                <text x="32" y="6"  font-size="8" fill="#1f883d">Y</text>
                                <text x="49" y="55" font-size="8" fill="#1f6feb">Z</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = CameraViewer3D.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    getPane(id: PaneId): Pane {
        const surface = this.querySelector<HTMLElement>(`[data-surface="${id}"]`)!;
        const overlay = surface?.nextElementSibling as HTMLElement;
        return {
            id, label: PANE_INFO.find(p => p.id === id)!.label,
            surface, overlay,
            camera: this.cameras$.get()[id],
        };
    }

    setCamera(pane: PaneId, camera: Partial<Camera>): this {
        const cur = this.cameras$.get();
        const next = { ...cur, [pane]: { ...cur[pane], ...camera } };
        this.cameras$.set(next);
        this.#fireCamera(pane);
        return this;
    }
    getCamera(pane: PaneId): Camera { return { ...this.cameras$.get()[pane] }; }

    setActivePane(pane: PaneId): this {
        this.setAttribute('active-pane', pane);
        this.dispatchEvent(new CustomEvent('arianna:focus', { bubbles: true, detail: { pane } }));
        return this;
    }
    getActivePane(): PaneId | null { return (this.getAttribute('active-pane') as PaneId) || null; }

    maximize(pane: PaneId): this { this.setAttribute('maximized-pane', pane); return this; }
    restore(): this { this.removeAttribute('maximized-pane'); return this; }
    toggleMaximize(pane: PaneId): this {
        return this.getAttribute('maximized-pane') === pane ? this.restore() : this.maximize(pane);
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    #fireCamera(pane: PaneId): void {
        this.dispatchEvent(new CustomEvent('arianna:camera', {
            bubbles: true,
            detail: { pane, camera: { ...this.cameras$.get()[pane] } },
        }));
    }

    #camLabel(c: Camera): string {
        if (c.kind === 'perspective') {
            return `Persp · ${(c.zoom * 100).toFixed(0)}%`;
        }
        return `Ortho · ${(c.zoom * 100).toFixed(0)}%`;
    }

    private hostStyle        : () => string = () => '';
    private gridCls          : () => string = () => 'ar-cv3d__grid';
    private showAxes         : () => boolean = () => true;
    private showLabels       : () => boolean = () => true;
    private panes            : () => Array<{ id: PaneId; label: string; cls: string; camLabel: string }> = () => [];
    private onPaneMouseDown  : (e: Event) => void = () => {};
    private onPaneDblClick   : (e: Event) => void = () => {};
    private onPaneWheel      : (e: Event) => void = () => {};
    private onPanePointerMove: (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-cv3d__host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    overflow    : 'hidden',
                }),
                new Rule('.ar-cv3d__grid', {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    width: '100%', height: '100%',
                    gap: '1px',
                    background: 'var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-cv3d__grid--maximized', { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }),
                new Rule('.ar-cv3d__pane', {
                    position: 'relative',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    overflow: 'hidden',
                    touchAction: 'none',
                }),
                new Rule('.ar-cv3d__pane--active', {
                    boxShadow: 'inset 0 0 0 2px var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-cv3d__grid--maximized .ar-cv3d__pane', { display: 'none' }),
                new Rule('.ar-cv3d__pane--maximized', { display: 'block !important' }),
                new Rule('.ar-cv3d__surface', { position: 'absolute', inset: '0' }),
                new Rule('.ar-cv3d__overlay', {
                    position: 'absolute',
                    inset: '0',
                    pointerEvents: 'none',
                }),
                new Rule('.ar-cv3d__label', {
                    position: 'absolute', top: '6px', left: '8px',
                    fontSize: '10px', fontWeight: '600',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                }),
                new Rule('.ar-cv3d__camlabel', {
                    position: 'absolute', top: '6px', right: '8px',
                    fontSize: '10px',
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-cv3d__axes', { position: 'absolute', bottom: '6px', left: '6px' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'CameraViewer3D', {
        value: CameraViewer3D, writable: false, enumerable: false, configurable: false,
    });
}

export default CameraViewer3D;
