/**
 * @module    components/modifiers/3D/LODModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Level-of-detail — swap mesh.geometry based on camera distance. Runs per-frame.
 *
 * Programmatic form takes an array of `{ distance, geometry }` levels sorted
 * by distance. Declarative form (second-pass) will accept named geometry refs
 * via child `<arianna-lod-level>` elements.
 *
 * @example HTML (declarative, second-pass — LOD levels TBD)
 *   <arianna-lod for="m1">
 *     <arianna-lod-level distance="10" geometry="high-poly-box"></arianna-lod-level>
 *     <arianna-lod-level distance="40" geometry="low-poly-box"></arianna-lod-level>
 *   </arianna-lod>
 *
 * @example JS
 *   new LODModifier(mesh, [
 *     { distance: 10, geometry: highPoly },
 *     { distance: 40, geometry: lowPoly  },
 *   ]);
 *
 * Attrs (declarative): for, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _vLen, _vSub,
    type MeshLike, type CameraLike, type Geometry3Like,
} from './Base.ts';

export interface LODLevel { distance: number; geometry: Geometry3Like; }

export class LODModifier extends Modifier3D {
    #levels : LODLevel[];
    #current = -1;

    constructor(mesh: MeshLike, levels: LODLevel[]) {
        super(mesh);
        this.#levels = [...levels].sort((a, b) => a.distance - b.distance);
    }

    setLevels(levels: LODLevel[]): this {
        this.#levels = [...levels].sort((a, b) => a.distance - b.distance);
        this.#current = -1;
        return this;
    }

    apply(): this { return this; }

    update(camera: CameraLike): this {
        if (!this.enabled || this.#levels.length === 0) return this;
        const d    = _vLen(_vSub(this.mesh.position, camera.position));
        let   best = this.#levels.length - 1;
        for (let i = 0; i < this.#levels.length; i++) {
            if (d <= this.#levels[i].distance) { best = i; break; }
        }
        if (best !== this.#current) {
            this.#current = best;
            this.mesh.geometry = this.#levels[best].geometry;
        }
        return this;
    }
}

/**
 * Declarative form. **Second-pass TODO**: parse child `<arianna-lod-level>`
 * elements to read geometry references. For now the element registers itself
 * with an empty levels array; consumers must call `getModifier().setLevels()`
 * after the viewport's asset registry is available.
 */
export class LODModifierElement extends (Component('arianna-lod', HTMLElement, {}, {
    attrs : ['for', 'enabled'],
    shadow: false,
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        // TODO second-pass: read <arianna-lod-level> children and resolve their
        // `geometry` attribute against the viewport's asset registry.
        return new LODModifier(mesh, []);
    }
    protected needsFrameUpdate(): boolean { return true; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'LODModifier', {
        value: LODModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default LODModifier;
