/**
 * @module    components/modifiers/3D/BillboardModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Always face the camera — optional per-axis lock. Runs per-frame.
 *
 * @example HTML
 *   <arianna-billboard for="m1" lock-y="true"></arianna-billboard>
 *
 * Attrs (declarative): for, lock-x, lock-y, lock-z, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _vNorm, _vSub,
    type MeshLike, type CameraLike,
} from './Base.ts';

export class BillboardModifier extends Modifier3D {
    #lockX: boolean;
    #lockY: boolean;
    #lockZ: boolean;

    constructor(mesh: MeshLike, opts: { lockX?: boolean; lockY?: boolean; lockZ?: boolean } = {}) {
        super(mesh);
        this.#lockX = opts.lockX ?? false;
        this.#lockY = opts.lockY ?? false;
        this.#lockZ = opts.lockZ ?? false;
    }

    apply(): this { return this; }

    update(camera: CameraLike): this {
        if (!this.enabled) return this;
        const dir = _vNorm(_vSub(camera.position, this.mesh.position));
        if (!this.#lockY) this.mesh.rotation.y =  Math.atan2(dir.x, dir.z);
        if (!this.#lockX) this.mesh.rotation.x = -Math.asin(dir.y);
        return this;
    }
}

export class BillboardModifierElement extends (Component('arianna-billboard', HTMLElement, {}, {
    attrs : ['for', 'lock-x', 'lock-y', 'lock-z', 'enabled'],
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        return new BillboardModifier(mesh, {
            lockX: this.getAttribute('lock-x') === 'true',
            lockY: this.getAttribute('lock-y') === 'true',
            lockZ: this.getAttribute('lock-z') === 'true',
        });
    }
    protected needsFrameUpdate(): boolean { return true; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'BillboardModifier', {
        value: BillboardModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default BillboardModifier;
