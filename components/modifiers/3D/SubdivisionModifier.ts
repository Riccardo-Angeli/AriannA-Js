/**
 * @module    components/modifiers/3D/SubdivisionModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA SubdivisionModifier component module.
 */

import { Component } from '../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from './Base.ts';

/** @namespace   SubdivisionModifier
 *  @public
 *  @description Namespace containing SubdivisionModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace SubdivisionModifier
{
    /** @class       SubdivisionModifierElement
     *  @public
     *  @description AriannA SubdivisionModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-subdivision', {}, {
        Attributes: ['for', 'iterations', 'enabled'],
    })
    export class SubdivisionModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        iterations
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned iterations value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const iterations = parseInt(this.getAttribute('iterations') ?? '1', 10) || 1;
            return new SubdivisionModifier(mesh, iterations);
        }
    }

    /** @class       SubdivisionModifier
     *  @public
     *  @description AriannA SubdivisionModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class SubdivisionModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #iterations
         *  @public
         *  @type        {number}
         *  @description Component member for iterations.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #iterations: number;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {unknown} iterations Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, iterations = 1) { super(mesh); this.#iterations = iterations; }

        /** @name        setIterations
         *  @public
         *  @type        {this}
         *  @description Component member for set Iterations.
         *  @param       {number} n Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setIterations(n: number): this { this.#iterations = n; return this; }

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
            let g = Modifier3DNamespace._cloneGeom(this.mesh.geometry);
            for (let i = 0; i < this.#iterations; i++)
                g = this.#subdivide(g);
            this.mesh.geometry = g;
            return this;
        }

        /** @name        #subdivide
         *  @public
         *  @type        {Modifier3DNamespace.Interfaces.Geometry3Like}
         *  @description Component member for subdivide.
         *  @param       {Modifier3DNamespace.Interfaces.Geometry3Like} g Parameter.
         *  @returns     {Modifier3DNamespace.Interfaces.Geometry3Like} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #subdivide(g: Modifier3DNamespace.Interfaces.Geometry3Like): Modifier3DNamespace.Interfaces.Geometry3Like
        {
            /** @name        out
             *  @public
             *  @type        {Modifier3DNamespace.Interfaces.Geometry3Like}
             *  @description Namespace-owned out value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const out: Modifier3DNamespace.Interfaces.Geometry3Like = {
                vertices: [...g.vertices.map(v => ({ ...v }))],
                normals: [],
                indices: [],
                /** @name        clone
                 *  @public
                 *  @type        {void}
                 *  @description Component member for clone.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                clone() { return Modifier3DNamespace._cloneGeom(this); },
            };

            /** @name        midCache
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned midCache value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const midCache = new Map<string, number>();

            /** @name        midpoint
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned midpoint value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const midpoint = (ia: number, ib: number): number => {
                /** @name        key
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned key value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const key = `${Math.min(ia, ib)}_${Math.max(ia, ib)}`;
                if (midCache.has(key))
                    return midCache.get(key)!;

                /** @name        m
                 *  @public
                 *  @type        {Modifier3DNamespace.Interfaces.Vec3Like}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m: Modifier3DNamespace.Interfaces.Vec3Like = {
                    x: (g.vertices[ia].x + g.vertices[ib].x) / 2,
                    y: (g.vertices[ia].y + g.vertices[ib].y) / 2,
                    z: (g.vertices[ia].z + g.vertices[ib].z) / 2,
                };

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = out.vertices.length;
                out.vertices.push(m);
                midCache.set(key, idx);
                return idx;
            };
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

                /** @name        ab
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ab value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
                out.indices.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
            }
            Modifier3DNamespace._recomputeNormals(out);
            return out;
        }
    }
}
export default SubdivisionModifier;
