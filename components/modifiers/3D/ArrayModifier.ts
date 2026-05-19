/**
 * @module    components/modifiers/3D/ArrayModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Linear or radial instance array of a mesh — adds N copies into the scene.
 *
 * Programmatic form takes `(mesh, { count, type, offset, radius, axis, scene, meshFactory })`.
 * Declarative form (second-pass) reads `scene` and `meshFactory` from the
 * parent viewport — for now it uses a no-op scene which warns at runtime.
 *
 * @example HTML
 *   <arianna-array for="m1" count="6" type="radial" radius="3" axis="y"></arianna-array>
 *
 * @example JS
 *   new ArrayModifier(mesh, {
 *     count: 6, type: 'radial', radius: 3, axis: 'y',
 *     scene, meshFactory: () => cloneOf(mesh),
 *   }).apply();
 *
 * Attrs (declarative): for, count, type, offset-x, offset-y, offset-z, radius, axis, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _v3,
    type MeshLike, type SceneLike, type Vec3Like,
} from './Base.ts';

export interface ArrayModifierOptions {
    count        : number;
    type?        : 'linear' | 'radial';
    offset?      : Vec3Like;
    radius?      : number;
    axis?        : 'x' | 'y' | 'z';
    scene?       : SceneLike;
    meshFactory? : () => MeshLike;
}

const NOOP_SCENE: SceneLike = { children: [], add() {}, remove() {} };

export class ArrayModifier extends Modifier3D {
    #opts  : Required<ArrayModifierOptions>;
    #copies: MeshLike[] = [];

    constructor(mesh: MeshLike, opts: ArrayModifierOptions) {
        super(mesh);
        this.#opts = {
            type       : 'linear',
            offset     : _v3(1, 0, 0),
            radius     : 2,
            axis       : 'y',
            scene      : NOOP_SCENE,
            meshFactory: () => mesh,
            ...opts,
        };
    }

    setScene(scene: SceneLike): this { this.#opts.scene = scene; return this; }
    setMeshFactory(factory: () => MeshLike): this { this.#opts.meshFactory = factory; return this; }

    apply(): this {
        if (!this.enabled) return this;
        // Remove previous copies
        this.#copies.forEach(c => this.#opts.scene.remove(c));
        this.#copies = [];

        const { count, type, offset, radius, axis } = this.#opts;
        for (let i = 1; i < count; i++) {
            const copy = this.#opts.meshFactory();
            if (type === 'linear') {
                copy.position.x = this.mesh.position.x + offset.x * i;
                copy.position.y = this.mesh.position.y + offset.y * i;
                copy.position.z = this.mesh.position.z + offset.z * i;
            } else {
                const angle = (2 * Math.PI * i) / count;
                if (axis === 'y') {
                    copy.position.x = this.mesh.position.x + Math.cos(angle) * radius;
                    copy.position.z = this.mesh.position.z + Math.sin(angle) * radius;
                    copy.position.y = this.mesh.position.y;
                } else if (axis === 'x') {
                    copy.position.y = this.mesh.position.y + Math.cos(angle) * radius;
                    copy.position.z = this.mesh.position.z + Math.sin(angle) * radius;
                    copy.position.x = this.mesh.position.x;
                } else {
                    copy.position.x = this.mesh.position.x + Math.cos(angle) * radius;
                    copy.position.y = this.mesh.position.y + Math.sin(angle) * radius;
                    copy.position.z = this.mesh.position.z;
                }
            }
            this.#opts.scene.add(copy);
            this.#copies.push(copy);
        }
        return this;
    }

    destroy(): void {
        this.#copies.forEach(c => this.#opts.scene.remove(c));
        this.#copies = [];
        super.destroy();
    }
}

export class ArrayModifierElement extends (Component('arianna-array', HTMLElement, {}, {
    attrs : ['for', 'count', 'type', 'offset-x', 'offset-y', 'offset-z', 'radius', 'axis', 'enabled'],
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D | null {
        const vp = this.viewport;
        if (!vp) return null;

        const count = parseInt(this.getAttribute('count') ?? '1', 10) || 1;
        const type  = ((this.getAttribute('type') ?? 'linear') as 'linear' | 'radial');
        const offset: Vec3Like = {
            x: parseFloat(this.getAttribute('offset-x') ?? '1') || 1,
            y: parseFloat(this.getAttribute('offset-y') ?? '0') || 0,
            z: parseFloat(this.getAttribute('offset-z') ?? '0') || 0,
        };
        const radius = parseFloat(this.getAttribute('radius') ?? '2') || 2;
        const axis   = ((this.getAttribute('axis') ?? 'y') as 'x' | 'y' | 'z');

        // TODO second-pass: when viewport exposes cloneMesh(), use it as the
        // meshFactory. For now we duplicate position-only clones that share
        // geometry — sufficient for math/positioning but they all render the
        // same mesh ref (viewport must accept that or the consumer overrides
        // via getModifier().setMeshFactory()).
        const meshFactory = (): MeshLike => ({
            geometry  : mesh.geometry,
            position  : { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
            rotation  : { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
            scale     : { x: mesh.scale.x,    y: mesh.scale.y,    z: mesh.scale.z },
            visible   : true,
            userData  : { ...mesh.userData },
        });

        return new ArrayModifier(mesh, { count, type, offset, radius, axis, scene: vp.scene, meshFactory });
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ArrayModifier', {
        value: ArrayModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default ArrayModifier;
