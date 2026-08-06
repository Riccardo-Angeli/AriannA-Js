/**
 * @module    components/modifiers/3D/DecimateModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA DecimateModifier component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from './Base.ts';

/** @namespace   DecimateModifier
 *  @public
 *  @description Namespace containing DecimateModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace DecimateModifier
{
    /** @class       DecimateModifierElement
     *  @public
     *  @description AriannA DecimateModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-decimate', {}, {
        Attributes: ['for', 'ratio', 'enabled'],
    })
    export class DecimateModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        ratio
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ratio value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ratio = parseFloat(this.getAttribute('ratio') ?? '0.5') || 0.5;
            return new DecimateModifier(mesh, ratio);
        }
    }

    /** @class       DecimateModifier
     *  @public
     *  @description AriannA DecimateModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class DecimateModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #ratio
         *  @public
         *  @type        {number}
         *  @description Component member for ratio.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #ratio: number;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {unknown} ratio Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, ratio = 0.5)
        {
            super(mesh);
            this.#ratio = Math.max(0.01, Math.min(1, ratio));
        }

        /** @name        setRatio
         *  @public
         *  @type        {this}
         *  @description Component member for set Ratio.
         *  @param       {number} r Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setRatio(r: number): this { this.#ratio = Math.max(0.01, Math.min(1, r)); return this; }

        /** @name        apply
         *  @public
         *  @type        {this}
         *  @description Component member for apply.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        apply(): this
        {
            if (!this.enabled)
                return this;

            /** @name        g
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned g value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const g = Modifier3DNamespace._cloneGeom(this.mesh.geometry);

            /** @name        triCount
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned triCount value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const triCount = g.indices.length / 3;

            /** @name        step
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned step value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const step = Math.max(1, Math.floor(triCount / Math.max(1, Math.floor(triCount * this.#ratio))));

            /** @name        newIdx
             *  @public
             *  @type        {number[]}
             *  @description Namespace-owned newIdx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newIdx: number[] = [];
            for (let i = 0; i < g.indices.length; i += 3 * step)
                newIdx.push(...g.indices.slice(i, i + 3));
            g.indices = newIdx;
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry = g;
            return this;
        }
    }
}
export default DecimateModifier;
