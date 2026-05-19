/**
 * @module    components/modifiers/3D/FadeModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Distance-based opacity fade — hides mesh beyond a far threshold. Runs per-frame.
 *
 * @example HTML
 *   <arianna-fade for="m1" near="10" far="50"></arianna-fade>
 *
 * Attrs (declarative): for, near, far, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _vLen, _vSub,
    type MeshLike, type CameraLike,
} from './Base.ts';

export class FadeModifier extends Modifier3D {
    #near  : number;
    #far   : number;
    #onFade: ((mesh: MeshLike, opacity: number) => void) | null = null;

    constructor(mesh: MeshLike, near = 10, far = 50) {
        super(mesh);
        this.#near = near;
        this.#far  = far;
    }

    apply(): this { return this; }

    update(camera: CameraLike): this {
        if (!this.enabled) return this;
        const d       = _vLen(_vSub(this.mesh.position, camera.position));
        const opacity = 1 - Math.max(0, Math.min(1, (d - this.#near) / (this.#far - this.#near)));
        this.mesh.visible = opacity > 0.01;
        // Three.Material.opacity sits on material; we stash for material readers.
        (this.mesh.userData as Record<string, unknown>)['_arianna_opacity'] = opacity;
        this.#onFade?.(this.mesh, opacity);
        return this;
    }

    onFade(cb: (mesh: MeshLike, opacity: number) => void): this { this.#onFade = cb; return this; }
}

export class FadeModifierElement extends (Component('arianna-fade', HTMLElement, {}, {
    attrs : ['for', 'near', 'far', 'enabled'],
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const near = parseFloat(this.getAttribute('near') ?? '10') || 10;
        const far  = parseFloat(this.getAttribute('far')  ?? '50') || 50;
        return new FadeModifier(mesh, near, far);
    }
    protected needsFrameUpdate(): boolean { return true; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'FadeModifier', {
        value: FadeModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default FadeModifier;
