/**
 * @module    components/modifiers/3D/SmoothModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA SmoothModifier component module.
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

/** @namespace   SmoothModifier
 *  @public
 *  @description Namespace containing SmoothModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace SmoothModifier
{
    /** @class       SmoothModifierElement
     *  @public
     *  @description AriannA SmoothModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-smooth', {}, {
        Attributes: ['for', 'iterations', 'factor', 'enabled'],
    })
    export class SmoothModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        iterations
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned iterations value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const iterations = parseInt(this.getAttribute('iterations') ?? '3', 10) || 3;

            /** @name        factor
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned factor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const factor = parseFloat(this.getAttribute('factor') ?? '0.5') || 0.5;
            return new SmoothModifier(mesh, iterations, factor);
        }
    }

    /** @class       SmoothModifier
     *  @public
     *  @description AriannA SmoothModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class SmoothModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #iterations
         *  @public
         *  @type        {number}
         *  @description Component member for iterations.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #iterations: number;

        /** @name        #factor
         *  @public
         *  @type        {number}
         *  @description Component member for factor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #factor: number;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {unknown} iterations Parameter.
         *  @param       {unknown} factor Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, iterations = 3, factor = 0.5)
        {
            super(mesh);
            this.#iterations = iterations;
            this.#factor = factor;
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

            /** @name        adj
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned adj value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const adj = g.vertices.map(() => new Set<number>());
            for (let i = 0; i < g.indices.length; i += 3)
            {
                /** @name        [a, b, c]
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned [a, b, c] value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const [a, b, c] = g.indices.slice(i, i + 3);
                adj[a].add(b);
                adj[a].add(c);
                adj[b].add(a);
                adj[b].add(c);
                adj[c].add(a);
                adj[c].add(b);
            }
            for (let iter = 0; iter < this.#iterations; iter++)
            {
                g.vertices = g.vertices.map((v, i) => {
                    /** @name        ns
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ns value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ns = Array.from(adj[i]);
                    if (!ns.length)
                        return v;

                    /** @name        avg
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned avg value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const avg = Modifier3DNamespace._vScale(ns.reduce((s, ni) => Modifier3DNamespace._vAdd(s, g.vertices[ni]), { x: 0, y: 0, z: 0 }), 1 / ns.length);
                    return Modifier3DNamespace._vLerp(v, avg, this.#factor);
                });
            }
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry = g;
            return this;
        }
    }
}
export default SmoothModifier;
