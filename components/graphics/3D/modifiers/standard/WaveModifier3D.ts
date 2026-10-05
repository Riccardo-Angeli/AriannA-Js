/**
 * @module    components/graphics/3D/modifiers/WaveModifier3D
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA WaveModifier3D component module.
 */


import { Modifier3D as Modifier3DNamespace } from '../Base.ts';

import { Component, Templates } from '../../../../../core/index.ts';



/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   WaveModifier3D
 *  @public
 *  @description Namespace containing WaveModifier3D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace WaveModifier3D
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   WaveModifierOptions
         *  @public
         *  @description WaveModifierOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WaveModifierOptions
        {
            /** @name        amplitude
             *  @public
             *  @type        {number}
             *  @description Component member for amplitude.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            amplitude?: number;

            /** @name        frequency
             *  @public
             *  @type        {number}
             *  @description Component member for frequency.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            frequency?: number;

            /** @name        axis
             *  @public
             *  @type        {'x' | 'y' | 'z'}
             *  @description Component member for axis.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            axis?: 'x' | 'y' | 'z';

            /** @name        direction
             *  @public
             *  @type        {'x' | 'z'}
             *  @description Component member for direction.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            direction?: 'x' | 'z';

            /** @name        time
             *  @public
             *  @type        {number}
             *  @description Component member for time.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            time?: number;
        }
    }

    /** @class       WaveModifierElement
     *  @public
     *  @description AriannA WaveModifierElement component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
        @Component('arianna-wave', {}, {
        Attributes: ['disabled', 'viewport', 'for', 'amplitude', 'frequency', 'axis', 'direction', 'animate', 'enabled'],
    })
    export class WaveModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaComponentIdentity = (() =>
        {
            const type = 'WaveModifierElement';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        createModifier
         *  @protected
         *  @type        {Modifier3DNamespace.Modifier3D}
         *  @description Component member for create Modifier.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @returns     {Modifier3DNamespace.Modifier3D} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected createModifier(mesh: Modifier3DNamespace.Interfaces.MeshLike): Modifier3DNamespace.Modifier3D
        {
            /** @name        amplitude
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned amplitude value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const amplitude = parseFloat(this.getAttribute('amplitude') ?? '0.2') || 0.2;

            /** @name        frequency
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned frequency value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const frequency = parseFloat(this.getAttribute('frequency') ?? '2') || 2;

            /** @name        axis
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned axis value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const axis = ((this.getAttribute('axis') ?? 'y') as 'x' | 'y' | 'z');

            /** @name        direction
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned direction value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const direction = ((this.getAttribute('direction') ?? 'x') as 'x' | 'z');
            return new WaveModifier3D(mesh, { amplitude, frequency, axis, direction });
        }

        /** @name        needsFrameUpdate
         *  @protected
         *  @type        {boolean}
         *  @description Component member for needs Frame Update.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected needsFrameUpdate(): boolean
        {
            return this.hasAttribute('animate');
        }

        /** @name        onFrame
         *  @protected
         *  @type        {void}
         *  @description Component member for on Frame.
         *  @param       {number} dt Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected onFrame(dt: number): void
        {
            /** @name        m
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned m value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const m = this.getModifier() as WaveModifier3D | null;
            if (m && this.viewport)
            {
                m.update(this.viewport.camera, dt);
                this.viewport.invalidate?.();
            }
        }
    }

    /** @class       WaveModifier3D
     *  @public
     *  @description AriannA WaveModifier3D component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class WaveModifier3D extends Modifier3DNamespace.Modifier3D
    {
        /** @name        #opts
         *  @public
         *  @type        {Required<WaveModifier3D.Interfaces.WaveModifierOptions>}
         *  @description Component member for opts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #opts: Required<Interfaces.WaveModifierOptions>;

        /** @name        #baseGeometry
         *  @public
         *  @type        {ReturnType<typeof Modifier3DNamespace._cloneGeom> | null}
         *  @description Component member for base Geometry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #baseGeometry: ReturnType<typeof Modifier3DNamespace._cloneGeom> | null = null;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3DNamespace.Interfaces.MeshLike} mesh Parameter.
         *  @param       {WaveModifier3D.Interfaces.WaveModifierOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Modifier3DNamespace.Interfaces.MeshLike, opts: Interfaces.WaveModifierOptions = {})
        {
            super(mesh);
            this.#opts = { amplitude: 0.2, frequency: 2, axis: 'y', direction: 'x', time: 0, ...opts };
        }

        /** @name        apply
         *  @public
         *  @type        {this}
         *  @description Component member for apply.
         *  @param       {number} time Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        apply(time?: number): this
        {
            if (!this.enabled)
                return this;
            // Cache the un-displaced base geometry on first apply so animated
            // updates start fresh each frame instead of compounding waves.
            if (!this.#baseGeometry)
                this.#baseGeometry = Modifier3DNamespace._cloneGeom(this.mesh.geometry);

            /** @name        g
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned g value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const g = Modifier3DNamespace._cloneGeom(this.#baseGeometry);

            /** @name        { amplitude, frequency, axis, direction }
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned { amplitude, frequency, axis, direction } value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const { amplitude, frequency, axis, direction } = this.#opts;

            /** @name        t
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned t value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const t = time ?? this.#opts.time;
            g.vertices = g.vertices.map(v => {
                /** @name        disp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned disp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const disp = amplitude * Math.sin(frequency * (direction === 'x' ? v.x : v.z) + t);

                /** @name        out
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out = { ...v };
                if (axis === 'y')
                    out.y += disp;
                else if (axis === 'x')
                    out.x += disp;
                else
                    out.z += disp;
                return out;
            });
            Modifier3DNamespace._recomputeNormals(g);
            this.mesh.geometry = g;
            return this;
        }

        /** Per-frame update — drives time-varying wave displacement. */
        update(_camera: Modifier3DNamespace.Interfaces.CameraLike, dt: number = 1 / 60): this
        {
            this.#opts.time += dt;
            this.apply(this.#opts.time);
            return this;
        }
    }
}
export default WaveModifier3D;
