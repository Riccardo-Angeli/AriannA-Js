/**
 * @module    components/modifiers/3D/BendModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BendModifier component module.
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

/** @namespace   BendModifier
 *  @public
 *  @description Namespace containing BendModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace BendModifier
{
    /** @class       BendModifierElement
     *  @public
     *  @description AriannA BendModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-bend', {}, {
        Attributes: ['for', 'angle', 'axis', 'enabled'],
    })
    export class BendModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        angle
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned angle value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const angle = parseFloat(this.getAttribute('angle') ?? '0') || 0;

            /** @name        axis
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned axis value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const axis = ((this.getAttribute('axis') ?? 'y') as 'x' | 'y' | 'z');
            return new BendModifier(mesh, angle, axis);
        }
    }

    /** @class       BendModifier
     *  @public
     *  @description AriannA BendModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class BendModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #angle
         *  @public
         *  @type        {number}
         *  @description Component member for angle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #angle: number;

        /** @name        #axis
         *  @public
         *  @type        {'x' | 'y' | 'z'}
         *  @description Component member for axis.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #axis: 'x' | 'y' | 'z';

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {number} angle Parameter.
         *  @param       {'x' | 'y' | 'z'} axis Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, angle: number, axis: 'x' | 'y' | 'z' = 'y')
        {
            super(mesh);
            this.#angle = angle;
            this.#axis = axis;
        }

        /** @name        setAngle
         *  @public
         *  @type        {this}
         *  @description Component member for set Angle.
         *  @param       {number} a Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setAngle(a: number): this { this.#angle = a; return this; }

        /** @name        setAxis
         *  @public
         *  @type        {this}
         *  @description Component member for set Axis.
         *  @param       {'x' | 'y' | 'z'} a Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setAxis(a: 'x' | 'y' | 'z'): this { this.#axis = a; return this; }

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

            /** @name        vals
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned vals value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const vals = g.vertices.map(v => this.#axis === 'y' ? v.y : this.#axis === 'x' ? v.x : v.z);

            /** @name        vmin
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned vmin value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const vmin = Math.min(...vals), range = (Math.max(...vals) - vmin) || 1;
            g.vertices = g.vertices.map(v => {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = ((this.#axis === 'y' ? v.y : this.#axis === 'x' ? v.x : v.z) - vmin) / range;

                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = t * this.#angle, c = Math.cos(a), s = Math.sin(a);
                if (this.#axis === 'y')
                    return { x: c * v.x - s * v.z, y: v.y, z: s * v.x + c * v.z };
                if (this.#axis === 'x')
                    return { x: v.x, y: c * v.y - s * v.z, z: s * v.y + c * v.z };
                return { x: c * v.x - s * v.y, y: s * v.x + c * v.y, z: v.z };
            });
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry = g;
            return this;
        }
    }
}
export default BendModifier;
