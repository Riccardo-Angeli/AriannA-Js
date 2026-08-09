/**
 * @module    components/modifiers/3D/MirrorModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA MirrorModifier component module.
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

/** @namespace   MirrorModifier
 *  @public
 *  @description Namespace containing MirrorModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace MirrorModifier
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        MirrorAxis
         *  @public
         *  @type        {'x' | 'y' | 'z'}
         *  @description Type alias for MirrorAxis.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type MirrorAxis = 'x' | 'y' | 'z';
    }

    /** @class       MirrorModifierElement
     *  @public
     *  @description AriannA MirrorModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-mirror', {}, {
        Attributes: ['for', 'axis', 'merge', 'threshold', 'enabled'],
    })
    export class MirrorModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        axis
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned axis value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const axis = ((this.getAttribute('axis') ?? 'x') as Types.MirrorAxis);

            /** @name        merge
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned merge value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const merge = this.getAttribute('merge') !== 'false';

            /** @name        threshold
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned threshold value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const threshold = parseFloat(this.getAttribute('threshold') ?? '0.001') || 0.001;
            return new MirrorModifier(mesh, axis, merge, threshold);
        }
    }

    /** @class       MirrorModifier
     *  @public
     *  @description AriannA MirrorModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class MirrorModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #axis
         *  @public
         *  @type        {MirrorModifier.Types.MirrorAxis}
         *  @description Component member for axis.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #axis: Types.MirrorAxis;

        /** @name        #merge
         *  @public
         *  @type        {boolean}
         *  @description Component member for merge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #merge: boolean;

        /** @name        #threshold
         *  @public
         *  @type        {number}
         *  @description Component member for threshold.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #threshold: number;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {MirrorModifier.Types.MirrorAxis} axis Parameter.
         *  @param       {unknown} merge Parameter.
         *  @param       {unknown} threshold Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, axis: Types.MirrorAxis = 'x', merge = true, threshold = 0.001)
        {
            super(mesh);
            this.#axis = axis;
            this.#merge = merge;
            this.#threshold = threshold;
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

            /** @name        base
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned base value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const base = g.vertices.length;

            /** @name        mirror
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mirror value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mirror = (v: Modifier3DNamespace.Interfaces.Vec3Like): Modifier3DNamespace.Interfaces.Vec3Like => ({
                x: this.#axis === 'x' ? -v.x : v.x,
                y: this.#axis === 'y' ? -v.y : v.y,
                z: this.#axis === 'z' ? -v.z : v.z,
            });
            g.vertices.push(...g.vertices.map(mirror));

            /** @name        mirrorIndices
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mirrorIndices value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mirrorIndices = g.indices.map(i => base + i);
            for (let i = 0; i < mirrorIndices.length; i += 3)
            {
                /** @name        [a, b, c]
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned [a, b, c] value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const [a, b, c] = mirrorIndices.slice(i, i + 3);
                g.indices.push(a, c, b); // reversed winding
            }
            if (this.#merge)
            {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = this.#threshold;

                /** @name        onPlane
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onPlane value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onPlane = g.vertices.reduce((acc: number[], v, i) => {
                    /** @name        onP
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned onP value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const onP = (this.#axis === 'x' && Math.abs(v.x) < t)
                        || (this.#axis === 'y' && Math.abs(v.y) < t)
                        || (this.#axis === 'z' && Math.abs(v.z) < t);
                    if (onP)
                        acc.push(i);
                    return acc;
                }, []);
                for (const i of onPlane)
                    for (const j of onPlane)
                        if (i !== j && Modifier3DNamespace._vLen(Modifier3DNamespace._vSub(g.vertices[i], g.vertices[j])) < t * 2)
                            g.indices = g.indices.map(idx => idx === j ? i : idx);
            }
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry = g;
            return this;
        }
    }
}
export default MirrorModifier;
