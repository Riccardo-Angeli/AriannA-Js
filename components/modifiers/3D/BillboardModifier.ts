/**
 * @module    components/modifiers/3D/BillboardModifier
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BillboardModifier component module.
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

/** @namespace   BillboardModifier
 *  @public
 *  @description Namespace containing BillboardModifier contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace BillboardModifier
{
    /** @class       BillboardModifierElement
     *  @public
     *  @description AriannA BillboardModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-billboard', {}, {
        Attributes: ['for', 'lock-x', 'lock-y', 'lock-z', 'enabled'],
    })
    export class BillboardModifierElement extends Modifier3DNamespace.Modifier3DElement
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
            return new BillboardModifier(mesh, {
                lockX: this.getAttribute('lock-x') === 'true',
                lockY: this.getAttribute('lock-y') === 'true',
                lockZ: this.getAttribute('lock-z') === 'true',
            });
        }

        /** @name        needsFrameUpdate
         *  @protected
         *  @type        {boolean}
         *  @description Component member for needs Frame Update.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected needsFrameUpdate(): boolean { return true; }
    }

    /** @class       BillboardModifier
     *  @public
     *  @description AriannA BillboardModifier component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class BillboardModifier extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #lockX
         *  @public
         *  @type        {boolean}
         *  @description Component member for lock X.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #lockX: boolean;

        /** @name        #lockY
         *  @public
         *  @type        {boolean}
         *  @description Component member for lock Y.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #lockY: boolean;

        /** @name        #lockZ
         *  @public
         *  @type        {boolean}
         *  @description Component member for lock Z.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #lockZ: boolean;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {{
            lockX?: boolean;
            lockY?: boolean;
            lockZ?: boolean;
        }} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, opts: {
            /** @name        lockX
             *  @public
             *  @type        {boolean}
             *  @description Component member for lock X.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lockX?: boolean;

            /** @name        lockY
             *  @public
             *  @type        {boolean}
             *  @description Component member for lock Y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lockY?: boolean;

            /** @name        lockZ
             *  @public
             *  @type        {boolean}
             *  @description Component member for lock Z.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lockZ?: boolean;
        } = {}) {
            super(mesh);
            this.#lockX = opts.lockX ?? false;
            this.#lockY = opts.lockY ?? false;
            this.#lockZ = opts.lockZ ?? false;
        }

        /** @name        apply
         *  @public
         *  @type        {this}
         *  @description Component member for apply.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        apply(): this { return this; }

        /** @name        update
         *  @public
         *  @type        {this}
         *  @description Component member for update.
         *  @param       {Modifier3DNamespace.Interfaces.CameraLike} camera Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        update(camera: Modifier3DNamespace.Interfaces.CameraLike): this
        {
            if (!this.enabled)
                return this;

            /** @name        dir
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dir value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dir = Modifier3DNamespace._vNorm(Modifier3DNamespace._vSub(camera.position, this.mesh.position));
            if (!this.#lockY)
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            if (!this.#lockX)
                this.mesh.rotation.x = -Math.asin(dir.y);
            return this;
        }
    }
}
export default BillboardModifier;
