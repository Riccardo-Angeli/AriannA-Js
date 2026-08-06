/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes (declarative): for, amount, enabled
 */
import { Component } from '../../../core/index.ts';
import { Modifier3D, Modifier3DElement, _cloneGeom, _recomputeNormals, _vAdd, _vScale, _v3, type MeshLike, } from './Base.ts';
export class InflateModifier extends Modifier3D {
    #amount: number;
    constructor(mesh: MeshLike, amount = 0.1) { super(mesh); this.#amount = amount; }
    setAmount(a: number): this { this.#amount = a; return this; }
    apply(): this {
        if (!this.enabled)
            return this;
        const g = _cloneGeom(this.mesh.geometry);
        _recomputeNormals(g);
        g.vertices = g.vertices.map((v, i) => _vAdd(v, _vScale(g.normals[i] ?? _v3(0, 1, 0), this.#amount)));
        _recomputeNormals(g);
        this.mesh.geometry = g;
        return this;
    }
}
@Component('arianna-inflate', {}, {
    Attributes: ['for', 'amount', 'enabled'],
})
export class InflateModifierElement extends Modifier3DElement {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const amount = parseFloat(this.getAttribute('amount') ?? '0.1') || 0.1;
        return new InflateModifier(mesh, amount);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * InflateModifier namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace InflateModifier {
}
/* ──────────────────────────────────────────────────────────────────────────
 * InflateModifierElement namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace InflateModifierElement {
}
export default InflateModifier;
