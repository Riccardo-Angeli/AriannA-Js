/**
 * @module    components/modifiers/3D/LODModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA LODModifier component module.
 */

import { Component, Templates } from '../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from './Base.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   LODModifier
 *  @public
 *  @description Namespace containing LODModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace LODModifier
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   LODLevel
         *  @public
         *  @description LODLevel contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LODLevel
        {
            /** @name        distance
             *  @public
             *  @type        {number}
             *  @description Component member for distance.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            distance: number;

            /** @name        geometry
             *  @public
             *  @type        {Modifier3DNamespace.Interfaces.Geometry3Like}
             *  @description Component member for geometry.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            geometry: Modifier3DNamespace.Interfaces.Geometry3Like;
        }
    }

    /**
     * Declarative form. **Second-pass TODO**: parse child `<arianna-lod-level>`
     * elements to read geometry references. For now the element registers itself
     * with an empty levels array; consumers must call `getModifier().setLevels()`
     * after the viewport's asset registry is available.
     */
        @Component('arianna-lod', {}, {
        Attributes: ['for', 'enabled'],
    })
    export class LODModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

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
            // TODO second-pass: read <arianna-lod-level> children and resolve their
            // `geometry` attribute against the viewport's asset registry.
            return new LODModifier(mesh, []);
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

    /** @class       LODModifier
     *  @public
     *  @description AriannA LODModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class LODModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #levels
         *  @public
         *  @type        {LODModifier.Interfaces.LODLevel[]}
         *  @description Component member for levels.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #levels: Interfaces.LODLevel[];

        /** @name        #current
         *  @public
         *  @type        {unknown}
         *  @description Component member for current.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #current = -1;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {LODModifier.Interfaces.LODLevel[]} levels Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, levels: Interfaces.LODLevel[])
        {
            super(mesh);
            this.#levels = [...levels].sort((a, b) => a.distance - b.distance);
        }

        /** @name        setLevels
         *  @public
         *  @type        {this}
         *  @description Component member for set Levels.
         *  @param       {LODModifier.Interfaces.LODLevel[]} levels Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setLevels(levels: Interfaces.LODLevel[]): this
        {
            this.#levels = [...levels].sort((a, b) => a.distance - b.distance);
            this.#current = -1;
            return this;
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
            if (!this.enabled || this.#levels.length === 0)
                return this;

            /** @name        d
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned d value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const d = Modifier3DNamespace._vLen(Modifier3DNamespace._vSub(this.mesh.position, camera.position));

            /** @name        best
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned best value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let best = this.#levels.length - 1;
            for (let i = 0; i < this.#levels.length; i++)
            {
                if (d <= this.#levels[i].distance)
                {
                    best = i;
                    break;
                }
            }
            if (best !== this.#current)
            {
                this.#current = best;
                this.mesh.geometry = this.#levels[best].geometry;
            }
            return this;
        }
    }
}
export default LODModifier;
