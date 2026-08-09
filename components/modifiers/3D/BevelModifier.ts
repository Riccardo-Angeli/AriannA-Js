/**
 * @module    components/modifiers/3D/BevelModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BevelModifier component module.
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

/** @namespace   BevelModifier
 *  @public
 *  @description Namespace containing BevelModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace BevelModifier
{
    /** @class       BevelModifierElement
     *  @public
     *  @description AriannA BevelModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-bevel', {}, {
        Attributes: ['for', 'amount', 'segments', 'enabled'],
    })
    export class BevelModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        amount
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned amount value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const amount = parseFloat(this.getAttribute('amount') ?? '0.05') || 0.05;

            /** @name        segments
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned segments value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const segments = parseInt(this.getAttribute('segments') ?? '2', 10) || 2;
            return new BevelModifier(mesh, amount, segments);
        }
    }

    /** @class       BevelModifier
     *  @public
     *  @description AriannA BevelModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class BevelModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #amount
         *  @public
         *  @type        {number}
         *  @description Component member for amount.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #amount: number;

        /** @name        #segments
         *  @public
         *  @type        {number}
         *  @description Component member for segments.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #segments: number;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {unknown} amount Parameter.
         *  @param       {unknown} segments Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, amount = 0.05, segments = 2)
        {
            super(mesh);
            this.#amount = amount;
            this.#segments = segments;
        }

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

            /** @name        bevelVerts
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bevelVerts value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bevelVerts = [];
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

                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = g.vertices[ia], b = g.vertices[ib], c = g.vertices[ic];

                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = Modifier3DNamespace._vNorm(Modifier3DNamespace._vCross(Modifier3DNamespace._vSub(b, a), Modifier3DNamespace._vSub(c, a)));
                for (let s = 1; s <= this.#segments; s++)
                {
                    /** @name        t
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned t value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const t = s / (this.#segments + 1) * this.#amount;
                    bevelVerts.push(Modifier3DNamespace._vAdd(a, Modifier3DNamespace._vScale(n, t)), Modifier3DNamespace._vAdd(b, Modifier3DNamespace._vScale(n, t)), Modifier3DNamespace._vAdd(c, Modifier3DNamespace._vScale(n, t)));
                }
            }
            g.vertices.push(...bevelVerts);
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry = g;
            return this;
        }
    }
}
export default BevelModifier;
