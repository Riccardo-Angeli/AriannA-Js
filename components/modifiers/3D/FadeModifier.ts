/**
 * @module    components/modifiers/3D/FadeModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA FadeModifier component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from './Base.ts';

/** @namespace   FadeModifier
 *  @public
 *  @description Namespace containing FadeModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace FadeModifier
{
    /** @class       FadeModifierElement
     *  @public
     *  @description AriannA FadeModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-fade', {}, {
        Attributes: ['for', 'near', 'far', 'enabled'],
    })
    export class FadeModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
        /** @name        createModifier
         *  @protected
         *  @type        {Modifier3DNamespace.Modifier3D}
         *  @description Component member for create Modifier.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @returns     {Modifier3DNamespace.Modifier3D} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected createModifier(mesh: Modifier3DNamespace.Interfaces.MeshLike): Modifier3DNamespace.Modifier3D
        {
            /** @name        near
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned near value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const near = parseFloat(this.getAttribute('near') ?? '10') || 10;

            /** @name        far
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned far value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const far = parseFloat(this.getAttribute('far') ?? '50') || 50;
            return new FadeModifier(mesh, near, far);
        }

        /** @name        needsFrameUpdate
         *  @protected
         *  @type        {boolean}
         *  @description Component member for needs Frame Update.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected needsFrameUpdate(): boolean { return true; }
    }

    /** @class       FadeModifier
     *  @public
     *  @description AriannA FadeModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class FadeModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #near
         *  @public
         *  @type        {number}
         *  @description Component member for near.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #near: number;

        /** @name        #far
         *  @public
         *  @type        {number}
         *  @description Component member for far.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #far: number;

        /** @name        #onFade
         *  @public
         *  @type        {((mesh: Modifier3DNamespace.Interfaces.MeshLike, opacity: number) => void) | null}
         *  @description Component member for on Fade.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #onFade: ((mesh: Modifier3DNamespace.Interfaces.MeshLike, opacity: number) => void) | null = null;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {unknown} near Parameter.
         *  @param       {unknown} far Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, near = 10, far = 50)
        {
            super(mesh);
            this.#near = near;
            this.#far = far;
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

        /** @name        update
         *  @public
         *  @type        {this}
         *  @description Component member for update.
         *  @param       {Modifier3DNamespace.Interfaces.CameraLike} camera Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        update(camera: Modifier3DNamespace.Interfaces.CameraLike): this
        {
            if (!this.enabled)
                return this;

            /** @name        d
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned d value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const d = Modifier3DNamespace._vLen(Modifier3DNamespace._vSub(this.mesh.position, camera.position));

            /** @name        opacity
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned opacity value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const opacity = 1 - Math.max(0, Math.min(1, (d - this.#near) / (this.#far - this.#near)));
            this.mesh.visible = opacity > 0.01;
            // Three.Material.opacity sits on material; we stash for material readers.
            (this.mesh.userData as Record<string, unknown>)['_arianna_opacity'] = opacity;
            this.#onFade?.(this.mesh, opacity);
            return this;
        }

        /** @name        onFade
         *  @public
         *  @type        {this}
         *  @description Component member for on Fade.
         *  @param       {(mesh: Modifier3DNamespace.Interfaces.MeshLike, opacity: number) => void} cb Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onFade(cb: (mesh: Modifier3DNamespace.Interfaces.MeshLike, opacity: number) => void): this { this.#onFade = cb; return this; }
    }
}
export default FadeModifier;
