/**
 * @module    components/graphics/3D/CameraViewer3D
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA CameraViewer3D component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   CameraViewer3D
 *  @public
 *  @description Namespace containing CameraViewer3D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace CameraViewer3D
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        PaneId
         *  @public
         *  @type        {'top' | 'front' | 'side' | 'perspective'}
         *  @description Type alias for PaneId.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type PaneId = 'top' | 'front' | 'side' | 'perspective';

        /** @name        ProjectionKind
         *  @public
         *  @type        {'orthographic' | 'perspective'}
         *  @description Type alias for ProjectionKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ProjectionKind = 'orthographic' | 'perspective';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   Vec3
         *  @public
         *  @description Vec3 contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Vec3
        {
            /** @name        x
             *  @public
             *  @type        {number}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x: number;

            /** @name        y
             *  @public
             *  @type        {number}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y: number;

            /** @name        z
             *  @public
             *  @type        {number}
             *  @description Component member for z.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            z: number;
        }

        /** @interface   Camera
         *  @public
         *  @description Camera contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Camera
        {
            /** @name        position
             *  @public
             *  @type        {CameraViewer3D.Interfaces.Vec3}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position: Interfaces.Vec3;

            /** @name        target
             *  @public
             *  @type        {CameraViewer3D.Interfaces.Vec3}
             *  @description Component member for target.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            target: Interfaces.Vec3;

            /** @name        zoom
             *  @public
             *  @type        {number}
             *  @description Component member for zoom.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            zoom: number;

            /** @name        kind
             *  @public
             *  @type        {CameraViewer3D.Types.ProjectionKind}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: Types.ProjectionKind;
        }

        /** @interface   Pane
         *  @public
         *  @description Pane contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Pane
        {
            /** @name        id
             *  @public
             *  @type        {CameraViewer3D.Types.PaneId}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: Types.PaneId;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        surface
             *  @public
             *  @type        {HTMLElement}
             *  @description Component member for surface.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            surface: HTMLElement;

            /** @name        overlay
             *  @public
             *  @type        {HTMLElement}
             *  @description Component member for overlay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            overlay: HTMLElement;

            /** @name        camera
             *  @public
             *  @type        {CameraViewer3D.Interfaces.Camera}
             *  @description Component member for camera.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            camera: Interfaces.Camera;
        }

        /** @interface   CameraViewer3DOptions
         *  @public
         *  @description CameraViewer3DOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CameraViewer3DOptions
        {
            /** @name        width
             *  @public
             *  @type        {string}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: string;

            /** @name        height
             *  @public
             *  @type        {string}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: string;

            /** @name        showAxes
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Axes.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showAxes?: boolean;

            /** @name        showLabels
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Labels.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showLabels?: boolean;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        DEFAULT_CAMERAS
     *  @public
     *  @type        {Record<CameraViewer3D.Types.PaneId, CameraViewer3D.Interfaces.Camera>}
     *  @description Namespace-owned DEFAULT_CAMERAS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DEFAULT_CAMERAS: Record<Types.PaneId, Interfaces.Camera> = {
        top: { position: { x: 0, y: 10, z: 0 }, target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'orthographic' },
        front: { position: { x: 0, y: 0, z: 10 }, target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'orthographic' },
        side: { position: { x: 10, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'orthographic' },
        perspective: { position: { x: 7, y: 5, z: 7 }, target: { x: 0, y: 0, z: 0 }, zoom: 1, kind: 'perspective' },
    };

    /** @name        PANE_INFO
     *  @public
     *  @type        {Array<{
        id: CameraViewer3D.Types.PaneId;
        label: string;
    }>}
     *  @description Namespace-owned PANE_INFO value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const PANE_INFO: Array<{
        /** @name        id
         *  @public
         *  @type        {CameraViewer3D.Types.PaneId}
         *  @description Component member for id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        id: Types.PaneId;

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        label: string;
    }> = [
        { id: 'top', label: 'Top' },
        { id: 'front', label: 'Front' },
        { id: 'side', label: 'Side' },
        { id: 'perspective', label: 'Perspective' },
    ];

    /** @class       CameraViewer3D
     *  @public
     *  @description AriannA CameraViewer3D component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-camera-viewer-3d', {}, {
        Attributes: ['width', 'height', 'show-axes', 'show-labels', 'active-pane', 'maximized-pane'],
    })
    export class CameraViewer3D extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        cameras$
         *  @public
         *  @type        {CameraViewer3D.Types.Signal<Record<CameraViewer3D.Types.PaneId, CameraViewer3D.Interfaces.Camera>>}
         *  @description Component member for cameras$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        cameras$: Types.Signal<Record<Types.PaneId, Interfaces.Camera>> = signal<Record<Types.PaneId, Interfaces.Camera>>(JSON.parse(JSON.stringify(DEFAULT_CAMERAS)));

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {CameraViewer3D.Interfaces.CameraViewer3DOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.CameraViewer3DOptions = {})
        {
            /** @name        wAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wAttr = this.signal().attribute('width');

            /** @name        hAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hAttr = this.signal().attribute('height');

            /** @name        activeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned activeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const activeAttr = this.signal().attribute('active-pane');

            /** @name        maxAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned maxAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const maxAttr = this.signal().attribute('maximized-pane');
            this.hostStyle = () => {
                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = wAttr.Get() ?? '100%';

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = hAttr.Get() ?? '600px';
                return `width: ${w}; height: ${h}`;
            };
            this.gridCls = () => {
                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = maxAttr.Get();
                return 'ar-cv3d__grid' + (m ? ' ar-cv3d__grid--maximized ar-cv3d__grid--max-' + m : '');
            };
            this.showAxes = () => this.getAttribute('show-axes') !== 'false';
            this.showLabels = () => this.getAttribute('show-labels') !== 'false';
            this.panes = (): Array<{
                /** @name        id
                 *  @public
                 *  @type        {CameraViewer3D.Types.PaneId}
                 *  @description Component member for id.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                id: Types.PaneId;

                /** @name        label
                 *  @public
                 *  @type        {string}
                 *  @description Component member for label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                label: string;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;

                /** @name        camLabel
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cam Label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                camLabel: string;
            }> => {
                /** @name        active
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned active value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const active = activeAttr.Get();

                /** @name        max
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned max value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const max = maxAttr.Get();

                /** @name        cams
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cams value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cams = this.cameras$.Get();
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
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;

                /** @name        pane
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pane value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pane = (me.currentTarget as HTMLElement).dataset.pane as Types.PaneId;
                this.setActivePane(pane);
            };
            this.onPaneDblClick = (e: Event) => {
                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = e as MouseEvent;
                me.preventDefault();

                /** @name        pane
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pane value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pane = (me.currentTarget as HTMLElement).dataset.pane as Types.PaneId;
                this.toggleMaximize(pane);
            };
            this.onPaneWheel = (e: Event) => {
                /** @name        we
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned we value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const we = e as WheelEvent;
                we.preventDefault();

                /** @name        pane
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pane value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pane = (we.currentTarget as HTMLElement).dataset.pane as Types.PaneId;

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.cameras$.Get();

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = cur[pane];

                /** @name        factor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned factor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const factor = we.deltaY > 0 ? 0.92 : 1.08;

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = { ...cur, [pane]: { ...c, zoom: Math.max(0.1, Math.min(64, c.zoom * factor)) } };
                this.cameras$.Set(next);
                this.#fireCamera(pane);
            };
            this.onPanePointerMove = (e: Event) => {
                // Drag-orbit/pan (very basic — full orbit math left to consumer)
                /** @name        pe
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pe value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pe = e as PointerEvent;
                if (!(pe.buttons & 1) || !pe.altKey)
                    return;

                /** @name        pane
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pane value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pane = (pe.currentTarget as HTMLElement).dataset.pane as Types.PaneId;

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.cameras$.Get();

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = cur[pane];

                /** @name        dx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dx = pe.movementX * 0.01;

                /** @name        dy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dy = pe.movementY * 0.01;

                /** @name        newCam
                 *  @public
                 *  @type        {CameraViewer3D.Interfaces.Camera}
                 *  @description Namespace-owned newCam value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const newCam: Interfaces.Camera = {
                    ...c,
                    position: { x: c.position.x - dx, y: c.position.y + dy, z: c.position.z },
                };
                this.cameras$.Set({ ...cur, [pane]: newCam });
                this.#fireCamera(pane);
            };
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {CameraViewer3D.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = CameraViewer3D.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        getPane
         *  @public
         *  @type        {CameraViewer3D.Interfaces.Pane}
         *  @description Component member for get Pane.
         *  @param       {CameraViewer3D.Types.PaneId} id Parameter.
         *  @returns     {CameraViewer3D.Interfaces.Pane} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getPane(id: Types.PaneId): Interfaces.Pane
        {
            /** @name        surface
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned surface value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const surface = this.querySelector<HTMLElement>(`[data-surface="${id}"]`)!;

            /** @name        overlay
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned overlay value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const overlay = surface?.nextElementSibling as HTMLElement;
            return {
                id, label: PANE_INFO.find(p => p.id === id)!.label,
                surface, overlay,
                camera: this.cameras$.Get()[id],
            };
        }

        /** @name        setCamera
         *  @public
         *  @type        {this}
         *  @description Component member for set Camera.
         *  @param       {CameraViewer3D.Types.PaneId} pane Parameter.
         *  @param       {Partial<CameraViewer3D.Interfaces.Camera>} camera Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setCamera(pane: Types.PaneId, camera: Partial<Interfaces.Camera>): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.cameras$.Get();

            /** @name        next
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned next value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const next = { ...cur, [pane]: { ...cur[pane], ...camera } };
            this.cameras$.Set(next);
            this.#fireCamera(pane);
            return this;
        }

        /** @name        getCamera
         *  @public
         *  @type        {CameraViewer3D.Interfaces.Camera}
         *  @description Component member for get Camera.
         *  @param       {CameraViewer3D.Types.PaneId} pane Parameter.
         *  @returns     {CameraViewer3D.Interfaces.Camera} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCamera(pane: Types.PaneId): Interfaces.Camera { return { ...this.cameras$.Get()[pane] }; }

        /** @name        setActivePane
         *  @public
         *  @type        {this}
         *  @description Component member for set Active Pane.
         *  @param       {CameraViewer3D.Types.PaneId} pane Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setActivePane(pane: Types.PaneId): this
        {
            this.setAttribute('active-pane', pane);
            this.dispatchEvent(new CustomEvent('arianna:focus', { bubbles: true, detail: { pane } }));
            return this;
        }

        /** @name        getActivePane
         *  @public
         *  @type        {CameraViewer3D.Types.PaneId | null}
         *  @description Component member for get Active Pane.
         *  @returns     {CameraViewer3D.Types.PaneId | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getActivePane(): Types.PaneId | null { return (this.getAttribute('active-pane') as Types.PaneId) || null; }

        /** @name        maximize
         *  @public
         *  @type        {this}
         *  @description Component member for maximize.
         *  @param       {CameraViewer3D.Types.PaneId} pane Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        maximize(pane: Types.PaneId): this { this.setAttribute('maximized-pane', pane); return this; }

        /** @name        restore
         *  @public
         *  @type        {this}
         *  @description Component member for restore.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        restore(): this { this.removeAttribute('maximized-pane'); return this; }

        /** @name        toggleMaximize
         *  @public
         *  @type        {this}
         *  @description Component member for toggle Maximize.
         *  @param       {CameraViewer3D.Types.PaneId} pane Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        toggleMaximize(pane: Types.PaneId): this
        {
            return this.getAttribute('maximized-pane') === pane ? this.restore() : this.maximize(pane);
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        #fireCamera
         *  @public
         *  @type        {void}
         *  @description Component member for fire Camera.
         *  @param       {CameraViewer3D.Types.PaneId} pane Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fireCamera(pane: Types.PaneId): void
        {
            this.dispatchEvent(new CustomEvent('arianna:camera', {
                bubbles: true,
                detail: { pane, camera: { ...this.cameras$.Get()[pane] } },
            }));
        }

        /** @name        #camLabel
         *  @public
         *  @type        {string}
         *  @description Component member for cam Label.
         *  @param       {CameraViewer3D.Interfaces.Camera} c Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #camLabel(c: Interfaces.Camera): string
        {
            if (c.kind === 'perspective')
            {
                return `Persp · ${(c.zoom * 100).toFixed(0)}%`;
            }
            return `Ortho · ${(c.zoom * 100).toFixed(0)}%`;
        }

        /** @name        hostStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for host Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hostStyle: () => string = () => '';

        /** @name        gridCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for grid Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private gridCls: () => string = () => 'ar-cv3d__grid';

        /** @name        showAxes
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Axes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showAxes: () => boolean = () => true;

        /** @name        showLabels
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Labels.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showLabels: () => boolean = () => true;

        /** @name        panes
         *  @private
         *  @type        {() => Array<{
            id: CameraViewer3D.Types.PaneId;
            label: string;
            cls: string;
            camLabel: string;
        }>}
         *  @description Component member for panes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private panes: () => Array<{
            /** @name        id
             *  @public
             *  @type        {CameraViewer3D.Types.PaneId}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: Types.PaneId;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        camLabel
             *  @public
             *  @type        {string}
             *  @description Component member for cam Label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            camLabel: string;
        }> = () => [];

        /** @name        onPaneMouseDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pane Mouse Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPaneMouseDown: (e: Event) => void = () => { };

        /** @name        onPaneDblClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pane Dbl Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPaneDblClick: (e: Event) => void = () => { };

        /** @name        onPaneWheel
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pane Wheel.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPaneWheel: (e: Event) => void = () => { };

        /** @name        onPanePointerMove
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pane Pointer Move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPanePointerMove: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {CameraViewer3D.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {CameraViewer3D.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-cv3d__host', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    overflow: 'hidden',
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
            ]);
        }
    }
}
export default CameraViewer3D;

export type PaneId = CameraViewer3D.Types.PaneId;
export type ProjectionKind = CameraViewer3D.Types.ProjectionKind;
export type Vec3 = CameraViewer3D.Interfaces.Vec3;
export type Camera = CameraViewer3D.Interfaces.Camera;
export type Pane = CameraViewer3D.Interfaces.Pane;
export type CameraViewer3DOptions = CameraViewer3D.Interfaces.CameraViewer3DOptions;
