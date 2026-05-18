/**
 * @module    components/modifiers/3D/MirrorModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Mirror geometry on X, Y or Z axis with optional vertex welding on the plane.
 *
 * @example HTML
 *   <arianna-mirror for="m1" axis="x" merge="true" threshold="0.001"></arianna-mirror>
 *
 * Attrs (declarative): for, axis, merge, threshold, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _cloneGeom, _recomputeNormals, _vLen, _vSub,
    type MeshLike, type Vec3Like,
} from './Base.ts';

export type MirrorAxis = 'x' | 'y' | 'z';

export class MirrorModifier extends Modifier3D {
    #axis     : MirrorAxis;
    #merge    : boolean;
    #threshold: number;

    constructor(mesh: MeshLike, axis: MirrorAxis = 'x', merge = true, threshold = 0.001) {
        super(mesh);
        this.#axis      = axis;
        this.#merge     = merge;
        this.#threshold = threshold;
    }

    apply(): this {
        if (!this.enabled) return this;
        const g    = _cloneGeom(this.mesh.geometry);
        const base = g.vertices.length;
        const mirror = (v: Vec3Like): Vec3Like => ({
            x: this.#axis === 'x' ? -v.x : v.x,
            y: this.#axis === 'y' ? -v.y : v.y,
            z: this.#axis === 'z' ? -v.z : v.z,
        });
        g.vertices.push(...g.vertices.map(mirror));
        const mirrorIndices = g.indices.map(i => base + i);
        for (let i = 0; i < mirrorIndices.length; i += 3) {
            const [a, b, c] = mirrorIndices.slice(i, i + 3);
            g.indices.push(a, c, b); // reversed winding
        }
        if (this.#merge) {
            const t = this.#threshold;
            const onPlane = g.vertices.reduce((acc: number[], v, i) => {
                const onP = (this.#axis === 'x' && Math.abs(v.x) < t)
                         || (this.#axis === 'y' && Math.abs(v.y) < t)
                         || (this.#axis === 'z' && Math.abs(v.z) < t);
                if (onP) acc.push(i);
                return acc;
            }, []);
            for (const i of onPlane)
                for (const j of onPlane)
                    if (i !== j && _vLen(_vSub(g.vertices[i], g.vertices[j])) < t * 2)
                        g.indices = g.indices.map(idx => idx === j ? i : idx);
        }
        _recomputeNormals(g);
        this.mesh.geometry = g;
        return this;
    }
}

export class MirrorModifierElement extends (Component('arianna-mirror', HTMLElement, {}, {
    attrs : ['for', 'axis', 'merge', 'threshold', 'enabled'],
    shadow: false,
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const axis      = ((this.getAttribute('axis') ?? 'x') as MirrorAxis);
        const merge     = this.getAttribute('merge') !== 'false';
        const threshold = parseFloat(this.getAttribute('threshold') ?? '0.001') || 0.001;
        return new MirrorModifier(mesh, axis, merge, threshold);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'MirrorModifier', {
        value: MirrorModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default MirrorModifier;
