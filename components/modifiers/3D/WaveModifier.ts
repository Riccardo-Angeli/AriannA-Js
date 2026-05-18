/**
 * @module    components/modifiers/3D/WaveModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Sinusoidal displacement along an axis. Supports animated time-varying mode.
 *
 * @example HTML
 *   <arianna-wave for="m1" amplitude="0.2" frequency="2" axis="y" animate></arianna-wave>
 *
 * Attrs (declarative): for, amplitude, frequency, axis, direction, animate, enabled
 */

import { Component } from '../../../core/Component.ts';
import {
    Modifier3D, Modifier3DElement,
    _cloneGeom, _recomputeNormals,
    type MeshLike, type CameraLike,
} from './Base.ts';

export interface WaveModifierOptions {
    amplitude?: number;
    frequency?: number;
    axis?     : 'x' | 'y' | 'z';
    direction?: 'x' | 'z';
    time?     : number;
}

export class WaveModifier extends Modifier3D {
    #opts: Required<WaveModifierOptions>;
    #baseGeometry: ReturnType<typeof _cloneGeom> | null = null;

    constructor(mesh: MeshLike, opts: WaveModifierOptions = {}) {
        super(mesh);
        this.#opts = { amplitude: 0.2, frequency: 2, axis: 'y', direction: 'x', time: 0, ...opts };
    }

    apply(time?: number): this {
        if (!this.enabled) return this;
        // Cache the un-displaced base geometry on first apply so animated
        // updates start fresh each frame instead of compounding waves.
        if (!this.#baseGeometry) this.#baseGeometry = _cloneGeom(this.mesh.geometry);
        const g = _cloneGeom(this.#baseGeometry);
        const { amplitude, frequency, axis, direction } = this.#opts;
        const t = time ?? this.#opts.time;
        g.vertices = g.vertices.map(v => {
            const disp = amplitude * Math.sin(frequency * (direction === 'x' ? v.x : v.z) + t);
            const out  = { ...v };
            if      (axis === 'y') out.y += disp;
            else if (axis === 'x') out.x += disp;
            else                    out.z += disp;
            return out;
        });
        _recomputeNormals(g);
        this.mesh.geometry = g;
        return this;
    }

    /** Per-frame update — drives time-varying wave displacement. */
    update(_camera: CameraLike, dt: number = 1 / 60): this {
        this.#opts.time += dt;
        this.apply(this.#opts.time);
        return this;
    }
}

export class WaveModifierElement extends (Component('arianna-wave', HTMLElement, {}, {
    attrs : ['for', 'amplitude', 'frequency', 'axis', 'direction', 'animate', 'enabled'],
    shadow: false,
}) as typeof Modifier3DElement) {
    protected createModifier(mesh: MeshLike): Modifier3D {
        const amplitude = parseFloat(this.getAttribute('amplitude') ?? '0.2') || 0.2;
        const frequency = parseFloat(this.getAttribute('frequency') ?? '2')   || 2;
        const axis      = ((this.getAttribute('axis')      ?? 'y') as 'x' | 'y' | 'z');
        const direction = ((this.getAttribute('direction') ?? 'x') as 'x' | 'z');
        return new WaveModifier(mesh, { amplitude, frequency, axis, direction });
    }

    protected needsFrameUpdate(): boolean {
        return this.hasAttribute('animate');
    }

    protected onFrame(dt: number): void {
        const m = this.getModifier() as WaveModifier | null;
        if (m && this.viewport) {
            m.update(this.viewport.camera, dt);
            this.viewport.invalidate?.();
        }
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'WaveModifier', {
        value: WaveModifier, writable: false, enumerable: false, configurable: false,
    });
}

export default WaveModifier;
