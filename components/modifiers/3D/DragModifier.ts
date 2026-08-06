/**
 * @module    components/modifiers/3D/DragModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA DragModifier component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from './Base.ts';

/** @namespace   DragModifier
 *  @public
 *  @description Namespace containing DragModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace DragModifier
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        DragCallback3D
         *  @public
         *  @type        {(mesh: Modifier3DNamespace.Interfaces.MeshLike, pos: Modifier3DNamespace.Interfaces.Vec3Like) => void}
         *  @description Type alias for DragCallback3D.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type DragCallback3D = (mesh: Modifier3DNamespace.Interfaces.MeshLike, pos: Modifier3DNamespace.Interfaces.Vec3Like) => void;
    }

    /** @class       DragModifierElement
     *  @public
     *  @description AriannA DragModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-drag', {}, {
        Attributes: ['for', 'plane', 'enabled'],
    })
    export class DragModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
        /** @name        createModifier
         *  @protected
         *  @type        {Modifier3DNamespace.Modifier3D | null}
         *  @description Component member for create Modifier.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @returns     {Modifier3DNamespace.Modifier3D | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected createModifier(mesh: Modifier3DNamespace.Interfaces.MeshLike): Modifier3DNamespace.Modifier3D | null
        {
            /** @name        vp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned vp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const vp = this.viewport;
            if (!vp || !vp.canvas)
            {
                console.warn('[arianna-drag] viewport has no canvas; drag disabled');
                return null;
            }

            /** @name        plane
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned plane value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const plane = ((this.getAttribute('plane') ?? 'xz') as 'xy' | 'xz' | 'yz');

            /** @name        drag
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned drag value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const drag = new DragModifier(mesh, vp.canvas, vp.camera, plane);
            drag.onDrag((m, p) => {
                this.dispatchEvent(new CustomEvent('arianna:drag', {
                    bubbles: true, detail: { mesh: m, position: p },
                }));
            });
            return drag;
        }
    }

    /** @class       DragModifier
     *  @public
     *  @description AriannA DragModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class DragModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #canvas
         *  @public
         *  @type        {HTMLCanvasElement}
         *  @description Component member for canvas.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #canvas: HTMLCanvasElement;

        /** @name        #plane
         *  @public
         *  @type        {'xy' | 'xz' | 'yz'}
         *  @description Component member for plane.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #plane: 'xy' | 'xz' | 'yz';

        /** @name        #callbacks
         *  @public
         *  @type        {DragModifier.Types.DragCallback3D[]}
         *  @description Component member for callbacks.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #callbacks: Types.DragCallback3D[] = [];

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {HTMLCanvasElement} canvas Parameter.
         *  @param       {Modifier3DNamespace.Interfaces.CameraLike} _camera Parameter.
         *  @param       {'xy' | 'xz' | 'yz'} plane Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, canvas: HTMLCanvasElement, _camera: Modifier3DNamespace.Interfaces.CameraLike, plane: 'xy' | 'xz' | 'yz' = 'xz')
        {
            super(mesh);
            this.#canvas = canvas;
            this.#plane = plane;
            this.#wire();
        }

        /** @name        apply
         *  @public
         *  @type        {this}
         *  @description Component member for apply.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        apply(): this { return this; }

        /** @name        onDrag
         *  @public
         *  @type        {this}
         *  @description Component member for on Drag.
         *  @param       {DragModifier.Types.DragCallback3D} cb Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onDrag(cb: Types.DragCallback3D): this { this.#callbacks.push(cb); return this; }

        /** @name        #wire
         *  @public
         *  @type        {void}
         *  @description Component member for wire.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #wire(): void
        {
            /** @name        dragging
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dragging value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let dragging = false, startMX = 0, startMY = 0;

            /** @name        startPos
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned startPos value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let startPos = { ...this.mesh.position };

            /** @name        scale
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned scale value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const scale = 0.01;

            /** @name        onDown
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onDown value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onDown = (e: MouseEvent) => {
                if (!this.enabled)
                    return;
                dragging = true;
                startMX = e.clientX;
                startMY = e.clientY;
                startPos = { ...this.mesh.position };
            };

            /** @name        onMove
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onMove value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onMove = (e: MouseEvent) => {
                if (!dragging || !this.enabled)
                    return;

                /** @name        dx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dx = (e.clientX - startMX) * scale;

                /** @name        dy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dy = (e.clientY - startMY) * scale;
                if (this.#plane === 'xz')
                {
                    this.mesh.position.x = startPos.x + dx;
                    this.mesh.position.z = startPos.z + dy;
                }
                else if (this.#plane === 'xy')
                {
                    this.mesh.position.x = startPos.x + dx;
                    this.mesh.position.y = startPos.y - dy;
                }
                else
                {
                    this.mesh.position.y = startPos.y - dy;
                    this.mesh.position.z = startPos.z + dx;
                }
                this.#callbacks.forEach(cb => cb(this.mesh, { ...this.mesh.position }));
            };

            /** @name        onUp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onUp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onUp = () => { dragging = false; };
            this.#canvas.addEventListener('mousedown', onDown);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            this.cleanups.push(() => {
                this.#canvas.removeEventListener('mousedown', onDown);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            });
        }
    }
}
export default DragModifier;
