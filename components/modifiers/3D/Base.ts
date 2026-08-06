/**
 * @module    components/modifiers/3D/Base
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Base component module.
 */

import { Component } from '../../../core/index.ts';

/** @namespace   Modifier3D
 *  @public
 *  @description Namespace containing Modifier3D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Modifier3D
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        // ── Three.ts-compatible structural type interfaces ──────────────────────────
        /** @interface   Vec3Like
         *  @public
         *  @description Vec3Like contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Vec3Like
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

        /** @interface   Geometry3Like
         *  @public
         *  @description Geometry3Like contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Geometry3Like
        {
            /** @name        vertices
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like[]}
             *  @description Component member for vertices.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            vertices: Modifier3D.Interfaces.Vec3Like[];

            /** @name        normals
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like[]}
             *  @description Component member for normals.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            normals: Modifier3D.Interfaces.Vec3Like[];

            /** @name        indices
             *  @public
             *  @type        {number[]}
             *  @description Component member for indices.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            indices: number[];

            /** @name        uvs
             *  @public
             *  @type        {[
                number,
                number
            ][]}
             *  @description Component member for uvs.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            uvs?: [
                number,
                number
            ][];

            /** @name        clone
             *  @public
             *  @type        {Modifier3D.Interfaces.Geometry3Like}
             *  @description Component member for clone.
             *  @returns     {Modifier3D.Interfaces.Geometry3Like} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clone(): Modifier3D.Interfaces.Geometry3Like;
        }

        /** @interface   MeshLike
         *  @public
         *  @description MeshLike contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MeshLike
        {
            /** @name        geometry
             *  @public
             *  @type        {Modifier3D.Interfaces.Geometry3Like}
             *  @description Component member for geometry.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            geometry: Modifier3D.Interfaces.Geometry3Like;

            /** @name        position
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position: Modifier3D.Interfaces.Vec3Like;

            /** @name        rotation
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for rotation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rotation: Modifier3D.Interfaces.Vec3Like;

            /** @name        scale
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for scale.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            scale: Modifier3D.Interfaces.Vec3Like;

            /** @name        visible
             *  @public
             *  @type        {boolean}
             *  @description Component member for visible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            visible: boolean;

            /** @name        userData
             *  @public
             *  @type        {Record<string, unknown>}
             *  @description Component member for user Data.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            userData: Record<string, unknown>;

            /** @name        updateMatrix
             *  @public
             *  @type        {void}
             *  @description Component member for update Matrix.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            updateMatrix?(): void;
        }

        /** @interface   SceneLike
         *  @public
         *  @description SceneLike contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SceneLike
        {
            /** @name        children
             *  @public
             *  @type        {Modifier3D.Interfaces.MeshLike[]}
             *  @description Component member for children.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            children: Modifier3D.Interfaces.MeshLike[];

            /** @name        add
             *  @public
             *  @type        {void}
             *  @description Component member for add.
             *  @param       {Modifier3D.Interfaces.MeshLike} obj Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            add(obj: Modifier3D.Interfaces.MeshLike): void;

            /** @name        remove
             *  @public
             *  @type        {void}
             *  @description Component member for remove.
             *  @param       {Modifier3D.Interfaces.MeshLike} obj Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            remove(obj: Modifier3D.Interfaces.MeshLike): void;
        }

        /** @interface   CameraLike
         *  @public
         *  @description CameraLike contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CameraLike
        {
            /** @name        position
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position: Modifier3D.Interfaces.Vec3Like;
        }

        /**
         * Minimal viewport surface a modifier expects. The real `arianna-viewport-3d`
         * implements this and more. See TODO_SECOND_PASS.md for the full contract.
         */
        export interface Viewport3DLike
        {
            /** @name        scene
             *  @public
             *  @type        {Modifier3D.Interfaces.SceneLike}
             *  @description Component member for scene.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            scene: Modifier3D.Interfaces.SceneLike;

            /** @name        camera
             *  @public
             *  @type        {Modifier3D.Interfaces.CameraLike}
             *  @description Component member for camera.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            camera: Modifier3D.Interfaces.CameraLike;

            /** @name        canvas
             *  @public
             *  @type        {HTMLCanvasElement}
             *  @description Component member for canvas.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            canvas?: HTMLCanvasElement;

            /** @name        findMesh
             *  @public
             *  @type        {Modifier3D.Interfaces.MeshLike | null}
             *  @description Component member for find Mesh.
             *  @param       {string} id Parameter.
             *  @returns     {Modifier3D.Interfaces.MeshLike | null} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            findMesh(id: string): Modifier3D.Interfaces.MeshLike | null;

            /** @name        onFrame
             *  @public
             *  @type        {() => void}
             *  @description Component member for on Frame.
             *  @param       {(dt: number) => void} cb Parameter.
             *  @returns     {() => void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            onFrame?(cb: (dt: number) => void): () => void;

            /** @name        invalidate
             *  @public
             *  @type        {void}
             *  @description Component member for invalidate.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            invalidate?(): void;
        }
    }
    // ── Geometry helpers ──────────────────────────────────────────────────────────
    export function _v3(x: number, y: number, z: number): Modifier3D.Interfaces.Vec3Like { return { x, y, z }; }
    export function _vAdd(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
    export function _vSub(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
    export function _vScale(v: Modifier3D.Interfaces.Vec3Like, s: number): Modifier3D.Interfaces.Vec3Like { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
    export function _vLen(v: Modifier3D.Interfaces.Vec3Like): number { return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2); }

    /** @name        l
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned l value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function _vNorm(v: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { const l = _vLen(v) || 1; return _vScale(v, 1 / l); }
    export function _vCross(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
    export function _vLerp(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like, t: number): Modifier3D.Interfaces.Vec3Like { return _vAdd(a, _vScale(_vSub(b, a), t)); }
    export function _cloneGeom(g: Modifier3D.Interfaces.Geometry3Like): Modifier3D.Interfaces.Geometry3Like {
        return {
            vertices: g.vertices.map(v => ({ ...v })),
            normals: g.normals.map(v => ({ ...v })),
            indices: [...g.indices],
            uvs: g.uvs ? g.uvs.map(uv => [...uv] as [
                number,
                number
            ]) : undefined,
            /** @name        clone
             *  @public
             *  @type        {void}
             *  @description Component member for clone.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clone() { return _cloneGeom(this); },
        };
    }
    export function _recomputeNormals(g: Modifier3D.Interfaces.Geometry3Like): void {
        /** @name        normals
         *  @public
         *  @type        {Modifier3D.Interfaces.Vec3Like[]}
         *  @description Namespace-owned normals value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const normals: Modifier3D.Interfaces.Vec3Like[] = Array.from({ length: g.vertices.length }, () => _v3(0, 0, 0));
        for (let i = 0; i < g.indices.length; i += 3)
        {
            /** @name        [ia, ib, ic]
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned [ia, ib, ic] value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const [ia, ib, ic] = g.indices.slice(i, i + 3);

            /** @name        n
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned n value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const n = _vNorm(_vCross(_vSub(g.vertices[ib], g.vertices[ia]), _vSub(g.vertices[ic], g.vertices[ia])));
            [ia, ib, ic].forEach(idx => { normals[idx] = _vAdd(normals[idx], n); });
        }
        g.normals = normals.map(_vNorm);
    }
    // ── Declarative core (custom element — Modifier3DElement) ───────────────────
    /**
     * Custom-element wrapper for a 3D modifier. Subclasses extend this and
     * override `createModifier()` to construct the concrete `Modifier3D` instance
     * once the target mesh is resolved.
     *
     * Lifecycle:
     *   onMount → queueMicrotask → resolveViewport → resolveTarget → createModifier
     *           → modifier.apply() → register update loop if available
     *
     *   onUnmount → modifier.destroy() → cleanup
     */
        @Component('arianna-modifier-3d', {}, {
        Attributes: ['for', 'enabled'],
    })
    export class Modifier3DElement extends HTMLElement
    {
        /** @name        viewport
         *  @protected
         *  @type        {Modifier3D.Interfaces.Viewport3DLike | null}
         *  @description Component member for viewport.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected viewport: Modifier3D.Interfaces.Viewport3DLike | null = null;

        /** @name        target
         *  @protected
         *  @type        {Modifier3D.Interfaces.MeshLike | null}
         *  @description Component member for target.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected target: Modifier3D.Interfaces.MeshLike | null = null;

        /** @name        modifier
         *  @protected
         *  @type        {Modifier3D | null}
         *  @description Component member for modifier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected modifier: Modifier3D | null = null;

        /** Frame-loop unsubscribe handle (returned by viewport.onFrame). */
        #frameUnsub: (() => void) | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {object} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: object = {})
        {
            // Modifiers have no chrome — they're pure behavior wiring.
            // Hide the host so it takes no layout space.
        }

        /**
         * Resolve the viewport this modifier lives inside.
         * Default: nearest `arianna-viewport-3d` ancestor.
         */
        protected resolveViewport(): Modifier3D.Interfaces.Viewport3DLike | null
        {
            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = this.closest('arianna-viewport-3d');
            return el ? (el as unknown as Modifier3D.Interfaces.Viewport3DLike) : null;
        }

        /**
         * Resolve the target mesh.
         *   1. If `for` attribute set → viewport.findMesh(id)
         *   2. Else → previous-sibling `arianna-mesh` with a `.mesh` property
         */
        protected resolveTarget(): Modifier3D.Interfaces.MeshLike | null
        {
            /** @name        id
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned id value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const id = this.getAttribute('for');
            if (id && this.viewport)
                return this.viewport.findMesh(id);
            // Sibling fallback: walk previous siblings looking for an arianna-mesh
            /** @name        sib
             *  @public
             *  @type        {Element | null}
             *  @description Namespace-owned sib value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let sib: Element | null = this.previousElementSibling;
            while (sib)
            {
                if (sib.tagName.toLowerCase() === 'arianna-mesh')
                {
                    /** @name        m
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned m value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const m = (sib as unknown as {
                        /** @name        mesh
                         *  @public
                         *  @type        {Modifier3D.Interfaces.MeshLike}
                         *  @description Component member for mesh.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        mesh?: Modifier3D.Interfaces.MeshLike;
                    }).mesh;
                    if (m)
                        return m;
                }
                sib = sib.previousElementSibling;
            }
            return null;
        }

        /**
         * Override to construct the concrete modifier. Called once the target
         * mesh is resolved.
         */
        protected createModifier(_mesh: Modifier3D.Interfaces.MeshLike): Modifier3D | null
        {
            return null; // Subclass override
        }

        /**
         * Override if the modifier needs per-frame `update(camera)` calls.
         * Return false (default) to skip the frame loop registration.
         */
        protected needsFrameUpdate(): boolean { return false; }

        /**
         * Per-frame callback invoked by the viewport's render loop. Default impl
         * calls `modifier.update?.(viewport.camera)` if the method exists.
         */
        protected onFrame(_dt: number): void
        {
            /** @name        m
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned m value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const m = this.modifier as Modifier3D & {
                /** @name        update
                 *  @public
                 *  @type        {(cam: Modifier3D.Interfaces.CameraLike) => void}
                 *  @description Component member for update.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                update?: (cam: Modifier3D.Interfaces.CameraLike) => void;
            };
            if (m && typeof m.update === 'function' && this.viewport)
            {
                m.update(this.viewport.camera);
                this.viewport.invalidate?.();
            }
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
        onMount()
        {
            this.style.display = 'contents';
            queueMicrotask(() => {
                this.viewport = this.resolveViewport();
                if (!this.viewport)
                {
                    console.warn(`[${this.tagName.toLowerCase()}] no <arianna-viewport-3d> ancestor`);
                    return;
                }
                this.target = this.resolveTarget();
                if (!this.target)
                {
                    console.warn(`[${this.tagName.toLowerCase()}] no target mesh resolved`);
                    return;
                }
                this.modifier = this.createModifier(this.target);
                if (!this.modifier)
                    return;
                this.modifier.apply();
                this.viewport.invalidate?.();
                if (this.needsFrameUpdate() && this.viewport.onFrame)
                {
                    this.#frameUnsub = this.viewport.onFrame(dt => this.onFrame(dt));
                }
            });
        }

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
        onUnmount()
        {
            if (this.#frameUnsub)
            {
                this.#frameUnsub();
                this.#frameUnsub = null;
            }
            this.modifier?.destroy();
            this.modifier = null;
            this.target = null;
            this.viewport = null;
        }

        /** @name        enabled
         *  @public
         *  @type        {boolean}
         *  @description Component member for enabled.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get enabled(): boolean { return !this.hasAttribute('disabled'); }

        /** @name        enabled
         *  @public
         *  @type        {void}
         *  @description Component member for enabled.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set enabled(v: boolean) { v ? this.removeAttribute('disabled') : this.setAttribute('disabled', ''); }

        /** Programmatic access to the resolved modifier (after mount). */
        getModifier(): Modifier3D | null { return this.modifier; }
    }
    // ── Programmatic core (plain class — Modifier3D) ─────────────────────────────
    /**
     * Programmatic 3D modifier core. Subclasses MUST implement `apply()` which
     * mutates `this.mesh` (typically via geometry clone + recompute normals).
     *
     * The declarative custom-element wrapper (`Modifier3DElement` below) holds
     * an instance of this class and delegates lifecycle to it.
     */
    export abstract class Modifier3D
    {
        /** Sentinel mesh used by declarative custom elements before mount-time
         *  binding. Replaced via `bindMesh()` once the viewport resolves it. */
        static readonly UNBOUND_MESH: Interfaces.MeshLike = {
            /** @name        clone
             *  @public
             *  @type        {void}
             *  @description Component member for clone.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            geometry: { vertices: [], normals: [], indices: [], clone() { return { ...this, clone: this.clone }; } },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            visible: true,
            userData: {},
        };

        /** @name        mesh
         *  @protected
         *  @type        {Modifier3D.Interfaces.MeshLike}
         *  @description Component member for mesh.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected mesh: Interfaces.MeshLike;

        /** @name        enabled
         *  @protected
         *  @type        {unknown}
         *  @description Component member for enabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected enabled = true;

        /** @name        cleanups
         *  @protected
         *  @type        {(() => void)[]}
         *  @description Component member for cleanups.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected cleanups: (() => void)[] = [];

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3D.Interfaces.MeshLike} mesh Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Interfaces.MeshLike) { this.mesh = mesh; }

        /** Late-bind the target mesh (used by declarative custom-element wrapper). */
        bindMesh(mesh: Interfaces.MeshLike): this { this.mesh = mesh; return this; }

        /** @name        enable
         *  @public
         *  @type        {this}
         *  @description Component member for enable.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        enable(): this { this.enabled = true; return this; }

        /** @name        disable
         *  @public
         *  @type        {this}
         *  @description Component member for disable.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        disable(): this { this.enabled = false; return this; }

        /** @name        isEnabled
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Enabled.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        isEnabled(): boolean { return this.enabled; }

        /** @name        destroy
         *  @public
         *  @type        {void}
         *  @description Component member for destroy.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        destroy(): void
        {
            for (const fn of this.cleanups)
            {
                try
                {
                    fn();
                }
                catch (e)
                {
                    console.warn('[Modifier3D] cleanup error', e);
                }
            }
            this.cleanups = [];
        }

        /** @name        apply
         *  @public
         *  @type        {this}
         *  @description Component member for apply.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        abstract apply(): this;
    }
}
