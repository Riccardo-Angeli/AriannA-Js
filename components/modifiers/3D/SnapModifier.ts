/**
 * @module    components/modifiers/3D/SnapModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA SnapModifier component module.
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

/** @namespace   SnapModifier
 *  @public
 *  @description Namespace containing SnapModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace SnapModifier
{
    /** @class       SnapModifierElement
     *  @public
     *  @description AriannA SnapModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-snap', {}, {
        Attributes: ['for', 'pos-grid', 'rot-grid-deg', 'enabled'],
    })
    export class SnapModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            /** @name        posGrid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned posGrid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const posGrid = parseFloat(this.getAttribute('pos-grid') ?? '0.5') || 0.5;

            /** @name        rotGridDeg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rotGridDeg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rotGridDeg = parseFloat(this.getAttribute('rot-grid-deg') ?? '15') || 15;
            return new SnapModifier(mesh, posGrid, rotGridDeg);
        }
    }

    /** @class       SnapModifier
     *  @public
     *  @description AriannA SnapModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class SnapModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #posGrid
         *  @public
         *  @type        {number}
         *  @description Component member for pos Grid.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #posGrid: number;

        /** @name        #rotGrid
         *  @public
         *  @type        {number}
         *  @description Component member for rot Grid.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #rotGrid: number; // radians
        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {unknown} posGrid Parameter.
         *  @param       {unknown} rotGridDeg Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, posGrid = 0.5, rotGridDeg = 15)
        {
            super(mesh);
            this.#posGrid = posGrid;
            this.#rotGrid = rotGridDeg * Math.PI / 180;
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

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.#posGrid, r = this.#rotGrid;
            this.mesh.position.x = Math.round(this.mesh.position.x / s) * s;
            this.mesh.position.y = Math.round(this.mesh.position.y / s) * s;
            this.mesh.position.z = Math.round(this.mesh.position.z / s) * s;
            this.mesh.rotation.x = Math.round(this.mesh.rotation.x / r) * r;
            this.mesh.rotation.y = Math.round(this.mesh.rotation.y / r) * r;
            this.mesh.rotation.z = Math.round(this.mesh.rotation.z / r) * r;
            return this;
        }
    }
}
export default SnapModifier;
