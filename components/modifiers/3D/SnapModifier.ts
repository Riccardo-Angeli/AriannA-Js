/**
 * @module    components/modifiers/3D/SnapModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Snap position and rotation to a grid.
 *
 * @example HTML
 *   <arianna-snap for="m1" pos-grid="0.5" rot-grid-deg="15"></arianna-snap>
 *
 * Attrs (declarative): for, pos-grid, rot-grid-deg, enabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier3D, Modifier3DElement, type MeshLike } from './Base.ts';

export class SnapModifier extends Modifier3D {
    #posGrid: number;
    #rotGrid: number; // radians

    constructor(mesh: MeshLike, posGrid = 0.5, rotGridDeg = 15) {
        super(mesh);
        this.#posGrid = posGrid;
        this.#rotGrid = rotGridDeg * Math.PI / 180;
    }

    apply(): this {
        if (!this.enabled) return this;
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

export class SnapModifierElement extends (Component('arianna-snap', HTMLElement, {}, {
    attrs : ['for', 'pos-grid', 'rot-grid-deg', 'enabled'],
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const posGrid    = parseFloat(this.getAttribute('pos-grid')     ?? '0.5') || 0.5;
        const rotGridDeg = parseFloat(this.getAttribute('rot-grid-deg') ?? '15')  || 15;
        return new SnapModifier(mesh, posGrid, rotGridDeg);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'SnapModifier', {
        value: SnapModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default SnapModifier;
