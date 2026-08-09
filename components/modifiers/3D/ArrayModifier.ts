/**
 * @module    components/modifiers/3D/ArrayModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ArrayModifier component module.
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

/** @namespace   ArrayModifier
 *  @public
 *  @description Namespace containing ArrayModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ArrayModifier
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ArrayModifierOptions
         *  @public
         *  @description ArrayModifierOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ArrayModifierOptions
        {
            /** @name        count
             *  @public
             *  @type        {number}
             *  @description Component member for count.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            count: number;

            /** @name        type
             *  @public
             *  @type        {'linear' | 'radial'}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type?: 'linear' | 'radial';

            /** @name        offset
             *  @public
             *  @type        {Modifier3DNamespace.Interfaces.Vec3Like}
             *  @description Component member for offset.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            offset?: Modifier3DNamespace.Interfaces.Vec3Like;

            /** @name        radius
             *  @public
             *  @type        {number}
             *  @description Component member for radius.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            radius?: number;

            /** @name        axis
             *  @public
             *  @type        {'x' | 'y' | 'z'}
             *  @description Component member for axis.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            axis?: 'x' | 'y' | 'z';

            /** @name        scene
             *  @public
             *  @type        {Modifier3DNamespace.Interfaces.SceneLike}
             *  @description Component member for scene.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            scene?: Modifier3DNamespace.Interfaces.SceneLike;

            /** @name        meshFactory
             *  @public
             *  @type        {() => Modifier3DNamespace.Interfaces.MeshLike}
             *  @description Component member for mesh Factory.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            meshFactory?: () => Modifier3DNamespace.Interfaces.MeshLike;
        }
    }

    /** @name        remove
     *  @public
     *  @type        {void}
     *  @description Component member for remove.
     *  @returns     {void} Result.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    /** @name        add
     *  @public
     *  @type        {void}
     *  @description Component member for add.
     *  @returns     {void} Result.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    /** @name        NOOP_SCENE
     *  @public
     *  @type        {Modifier3DNamespace.Interfaces.SceneLike}
     *  @description Namespace-owned NOOP_SCENE value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const NOOP_SCENE: Modifier3DNamespace.Interfaces.SceneLike = { children: [], add() { }, remove() { } };

    /** @class       ArrayModifierElement
     *  @public
     *  @description AriannA ArrayModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-array', {}, {
        Attributes: ['for', 'count', 'type', 'offset-x', 'offset-y', 'offset-z', 'radius', 'axis', 'enabled'],
    })
    export class ArrayModifierElement extends Modifier3DNamespace.Modifier3DElement
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
         *  @type        {Modifier3DNamespace.Modifier3D | null}
         *  @description Component member for create Modifier.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @returns     {Modifier3DNamespace.Modifier3D | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected createModifier(mesh: Modifier3DNamespace.Interfaces.MeshLike): Modifier3DNamespace.Modifier3D | null
        {
            /** @name        vp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned vp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const vp = this.viewport;
            if (!vp)
                return null;

            /** @name        count
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned count value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const count = parseInt(this.getAttribute('count') ?? '1', 10) || 1;

            /** @name        type
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned type value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const type = ((this.getAttribute('type') ?? 'linear') as 'linear' | 'radial');

            /** @name        offset
             *  @public
             *  @type        {Modifier3DNamespace.Interfaces.Vec3Like}
             *  @description Namespace-owned offset value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const offset: Modifier3DNamespace.Interfaces.Vec3Like = {
                x: parseFloat(this.getAttribute('offset-x') ?? '1') || 1,
                y: parseFloat(this.getAttribute('offset-y') ?? '0') || 0,
                z: parseFloat(this.getAttribute('offset-z') ?? '0') || 0,
            };

            /** @name        radius
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned radius value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const radius = parseFloat(this.getAttribute('radius') ?? '2') || 2;

            /** @name        axis
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned axis value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const axis = ((this.getAttribute('axis') ?? 'y') as 'x' | 'y' | 'z');
            // TODO second-pass: when viewport exposes cloneMesh(), use it as the
            // meshFactory. For now we duplicate position-only clones that share
            // geometry — sufficient for math/positioning but they all render the
            // same mesh ref (viewport must accept that or the consumer overrides
            // via getModifier().setMeshFactory()).
            /** @name        meshFactory
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned meshFactory value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const meshFactory = (): Modifier3DNamespace.Interfaces.MeshLike => ({
                geometry: mesh.geometry,
                position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
                rotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
                scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
                visible: true,
                userData: { ...mesh.userData },
            });
            return new ArrayModifier(mesh, { count, type, offset, radius, axis, scene: vp.scene, meshFactory });
        }
    }

    /** @class       ArrayModifier
     *  @public
     *  @description AriannA ArrayModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class ArrayModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #opts
         *  @public
         *  @type        {Required<ArrayModifier.Interfaces.ArrayModifierOptions>}
         *  @description Component member for opts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #opts: Required<Interfaces.ArrayModifierOptions>;

        /** @name        #copies
         *  @public
         *  @type        {Modifier3DNamespace.Interfaces.MeshLike[]}
         *  @description Component member for copies.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #copies: Modifier3DNamespace.Interfaces.MeshLike[] = [];

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {ArrayModifier.Interfaces.ArrayModifierOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, opts: Interfaces.ArrayModifierOptions)
        {
            super(mesh);
            this.#opts = {
                type: 'linear',
                offset: Modifier3DNamespace._v3(1, 0, 0),
                radius: 2,
                axis: 'y',
                scene: NOOP_SCENE,
                meshFactory: () => mesh,
                ...opts,
            };
        }

        /** @name        setScene
         *  @public
         *  @type        {this}
         *  @description Component member for set Scene.
         *  @param       {Modifier3DNamespace.Interfaces.SceneLike} scene Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setScene(scene: Modifier3DNamespace.Interfaces.SceneLike): this { this.#opts.scene = scene; return this; }

        /** @name        setMeshFactory
         *  @public
         *  @type        {this}
         *  @description Component member for set Mesh Factory.
         *  @param       {() => Modifier3DNamespace.Interfaces.MeshLike} factory Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMeshFactory(factory: () => Modifier3DNamespace.Interfaces.MeshLike): this { this.#opts.meshFactory = factory; return this; }

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
            // Remove previous copies
            this.#copies.forEach(c => this.#opts.scene.remove(c));
            this.#copies = [];

            /** @name        { count, type, offset, radius, axis }
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned { count, type, offset, radius, axis } value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const { count, type, offset, radius, axis } = this.#opts;
            for (let i = 1; i < count; i++)
            {
                /** @name        copy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned copy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const copy = this.#opts.meshFactory();
                if (type === 'linear')
                {
                    copy.position.x = this.mesh.position.x + offset.x * i;
                    copy.position.y = this.mesh.position.y + offset.y * i;
                    copy.position.z = this.mesh.position.z + offset.z * i;
                }
                else
                {
                    /** @name        angle
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned angle value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const angle = (2 * Math.PI * i) / count;
                    if (axis === 'y')
                    {
                        copy.position.x = this.mesh.position.x + Math.cos(angle) * radius;
                        copy.position.z = this.mesh.position.z + Math.sin(angle) * radius;
                        copy.position.y = this.mesh.position.y;
                    }
                    else if (axis === 'x')
                    {
                        copy.position.y = this.mesh.position.y + Math.cos(angle) * radius;
                        copy.position.z = this.mesh.position.z + Math.sin(angle) * radius;
                        copy.position.x = this.mesh.position.x;
                    }
                    else
                    {
                        copy.position.x = this.mesh.position.x + Math.cos(angle) * radius;
                        copy.position.y = this.mesh.position.y + Math.sin(angle) * radius;
                        copy.position.z = this.mesh.position.z;
                    }
                }
                this.#opts.scene.add(copy);
                this.#copies.push(copy);
            }
            return this;
        }

        /** @name        destroy
         *  @public
         *  @type        {void}
         *  @description Component member for destroy.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        destroy(): void
        {
            this.#copies.forEach(c => this.#opts.scene.remove(c));
            this.#copies = [];
            super.destroy();
        }
    }
}
export default ArrayModifier;
