/**
 * @module    components/modifiers/3D/BevelModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BevelModifier component module.
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
        Attributes: ['disabled', 'viewport', 'for', 'amount', 'segments', 'enabled'],
    })
    export class BevelModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaComponentIdentity = (() =>
        {
            const type = 'BevelModifierElement';
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
            if(!this.enabled || this.#amount <= 0) return this;
            let g=Modifier3DNamespace._cloneGeom(this.mesh.geometry);
            // A stable mesh-agnostic soft chamfer: inset indexed vertices along their
            // normals, then optionally subdivide the resulting surface for a smoother bevel.
            g.vertices=g.vertices.map((v,i)=>{
                const n=Modifier3DNamespace._vNorm(g.normals[i] ?? {x:0,y:0,z:0});
                return Modifier3DNamespace._vSub(v,Modifier3DNamespace._vScale(n,this.#amount));
            });
            for(let s=1;s<this.#segments;s++)
            {
                const out:Modifier3DNamespace.Interfaces.Geometry3Like={vertices:[...g.vertices.map(v=>({...v}))],normals:[],indices:[],clone(){return Modifier3DNamespace._cloneGeom(this);}};
                const cache=new Map<string,number>();
                const mid=(a:number,b:number)=>{const k=a<b?`${a}_${b}`:`${b}_${a}`;const existing=cache.get(k);if(existing!==undefined)return existing;const va=g.vertices[a],vb=g.vertices[b];const n=out.vertices.length;out.vertices.push({x:(va.x+vb.x)/2,y:(va.y+vb.y)/2,z:(va.z+vb.z)/2});cache.set(k,n);return n;};
                for(let i=0;i<g.indices.length;i+=3){const a=g.indices[i],b=g.indices[i+1],c=g.indices[i+2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);out.indices.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
                Modifier3DNamespace._recomputeNormals(out); g=out;
            }
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry=g;
            return this;
        }
    }
}
export default BevelModifier;
