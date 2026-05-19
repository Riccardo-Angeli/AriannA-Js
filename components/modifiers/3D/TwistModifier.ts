/**
 * @module    components/modifiers/3D/TwistModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Twist geometry around an axis by a given angle (radians).
 *
 * @example HTML
 *   <arianna-viewport-3d>
 *     <arianna-mesh id="m1" geometry="cylinder"></arianna-mesh>
 *     <arianna-twist for="m1" angle="3.14" axis="y"></arianna-twist>
 *   </arianna-viewport-3d>
 *
 * @example JS
 *   new TwistModifier(mesh, Math.PI, 'y').apply();
 *
 * Attrs (declarative): for, angle, axis, enabled
 */

import { Component } from '../../../core/Component.ts';
import { Modifier3D, Modifier3DElement, _cloneGeom, _recomputeNormals, type MeshLike } from './Base.ts';

export class TwistModifier extends Modifier3D {
    #angle: number;
    #axis : 'x' | 'y' | 'z';

    constructor(mesh: MeshLike, angle: number, axis: 'x' | 'y' | 'z' = 'y') {
        super(mesh);
        this.#angle = angle;
        this.#axis  = axis;
    }

    setAngle(a: number): this { this.#angle = a; return this; }
    setAxis(a: 'x' | 'y' | 'z'): this { this.#axis = a; return this; }

    apply(): this {
        if (!this.enabled) return this;
        const g    = _cloneGeom(this.mesh.geometry);
        const vals = g.vertices.map(v => this.#axis === 'y' ? v.y : this.#axis === 'x' ? v.x : v.z);
        const vmin = Math.min(...vals), range = (Math.max(...vals) - vmin) || 1;
        g.vertices = g.vertices.map(v => {
            const t = ((this.#axis === 'y' ? v.y : this.#axis === 'x' ? v.x : v.z) - vmin) / range;
            const a = t * this.#angle, c = Math.cos(a), s = Math.sin(a);
            if (this.#axis === 'y') return { x: c * v.x - s * v.z, y: v.y, z: s * v.x + c * v.z };
            if (this.#axis === 'x') return { x: v.x, y: c * v.y - s * v.z, z: s * v.y + c * v.z };
            return { x: c * v.x - s * v.y, y: s * v.x + c * v.y, z: v.z };
        });
        _recomputeNormals(g);
        this.mesh.geometry = g;
        return this;
    }
}

export class TwistModifierElement extends (Component('arianna-twist', HTMLElement, {}, {
    attrs : ['for', 'angle', 'axis', 'enabled'],
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const angle = parseFloat(this.getAttribute('angle') ?? '0') || 0;
        const axis  = ((this.getAttribute('axis') ?? 'y') as 'x' | 'y' | 'z');
        return new TwistModifier(mesh, angle, axis);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'TwistModifier', {
        value: TwistModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default TwistModifier;
