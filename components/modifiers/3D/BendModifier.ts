/**
 * @module    components/modifiers/3D/BendModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BendModifier component module.
 */


import { Modifier3D as Modifier3DNamespace } from './Base.ts';

declare const Component: any;
declare const Templates: any;


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
        Attributes: ['disabled', 'viewport', 'for', 'angle', 'axis', 'enabled'],
    })
    export class BendModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaComponentIdentity = (() =>
        {
            const type = 'BendModifierElement';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

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
            if(!this.enabled || Math.abs(this.#angle) < 1e-6) return this;
            const g=Modifier3DNamespace._cloneGeom(this.mesh.geometry);
            const axis=this.#axis;
            const values=g.vertices.map(v=>axis==='x'?v.x:axis==='y'?v.y:v.z);
            const min=Math.min(...values), max=Math.max(...values), span=(max-min)||1, mid=(min+max)/2;
            const radius=span/this.#angle;
            g.vertices=g.vertices.map(v=>{
                const along=(axis==='x'?v.x:axis==='y'?v.y:v.z)-mid;
                const theta=(along/span)*this.#angle;
                const c=Math.cos(theta), s=Math.sin(theta);
                if(axis==='y')
                {
                    const radial=radius+v.x;
                    return {x:radial*c-radius,y:radial*s,z:v.z};
                }
                if(axis==='x')
                {
                    const radial=radius+v.y;
                    return {x:radial*s,y:radial*c-radius,z:v.z};
                }
                const radial=radius+v.x;
                return {x:radial*c-radius,y:v.y,z:radial*s};
            });
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry=g;
            return this;
        }
    }
}
export default BendModifier;
