/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/modifiers/3D/DecimateModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Greedy triangle decimation — reduces polygon count by a target ratio.
 *
 * @example HTML
 *   <arianna-decimate for="m1" ratio="0.5"></arianna-decimate>
 *
 * Attributes (declarative): for, ratio, enabled
 */
import { Component } from '../../../core/index.ts';
import { Modifier3D, Modifier3DElement, _cloneGeom, _recomputeNormals, type MeshLike, } from './Base.ts';
export class DecimateModifier extends Modifier3D {
    #ratio: number;
    constructor(mesh: MeshLike, ratio = 0.5) {
        super(mesh);
        this.#ratio = Math.max(0.01, Math.min(1, ratio));
    }
    setRatio(r: number): this { this.#ratio = Math.max(0.01, Math.min(1, r)); return this; }
    apply(): this {
        if (!this.enabled)
            return this;
        const g = _cloneGeom(this.mesh.geometry);
        const triCount = g.indices.length / 3;
        const step = Math.max(1, Math.floor(triCount / Math.max(1, Math.floor(triCount * this.#ratio))));
        const newIdx: number[] = [];
        for (let i = 0; i < g.indices.length; i += 3 * step)
            newIdx.push(...g.indices.slice(i, i + 3));
        g.indices = newIdx;
        _recomputeNormals(g);
        this.mesh.geometry = g;
        return this;
    }
}
@Component('arianna-decimate', {}, {
    Attributes: ['for', 'ratio', 'enabled'],
})
export class DecimateModifierElement extends Modifier3DElement {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const ratio = parseFloat(this.getAttribute('ratio') ?? '0.5') || 0.5;
        return new DecimateModifier(mesh, ratio);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * DecimateModifier namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace DecimateModifier {
}
/* ──────────────────────────────────────────────────────────────────────────
 * DecimateModifierElement namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace DecimateModifierElement {
}
export default DecimateModifier;
