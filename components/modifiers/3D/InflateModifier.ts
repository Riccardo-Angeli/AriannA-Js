/**
 * @module    components/modifiers/3D/InflateModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Expand geometry along vertex normals.
 *
 * @example HTML
 *   <arianna-inflate for="m1" amount="0.1"></arianna-inflate>
 *
 * Attrs (declarative): for, amount, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _cloneGeom, _recomputeNormals, _vAdd, _vScale, _v3,
    type MeshLike,
} from './Base.ts';

export class InflateModifier extends Modifier3D {
    #amount: number;

    constructor(mesh: MeshLike, amount = 0.1) { super(mesh); this.#amount = amount; }

    setAmount(a: number): this { this.#amount = a; return this; }

    apply(): this {
        if (!this.enabled) return this;
        const g = _cloneGeom(this.mesh.geometry);
        _recomputeNormals(g);
        g.vertices = g.vertices.map((v, i) => _vAdd(v, _vScale(g.normals[i] ?? _v3(0, 1, 0), this.#amount)));
        _recomputeNormals(g);
        this.mesh.geometry = g;
        return this;
    }
}

export class InflateModifierElement extends (Component('arianna-inflate', HTMLElement, {}, {
    attrs : ['for', 'amount', 'enabled'],
    shadow: false,
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const amount = parseFloat(this.getAttribute('amount') ?? '0.1') || 0.1;
        return new InflateModifier(mesh, amount);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'InflateModifier', {
        value: InflateModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default InflateModifier;
