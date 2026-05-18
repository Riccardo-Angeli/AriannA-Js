/**
 * @module    components/modifiers/3D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA 3D Modifiers — barrel.
 *
 * Importing this barrel:
 *   • Registers all 15 declarative custom elements
 *     (arianna-bend, arianna-twist, arianna-bevel, arianna-decimate,
 *      arianna-inflate, arianna-mirror, arianna-smooth, arianna-snap,
 *      arianna-subdivision, arianna-wave, arianna-billboard, arianna-fade,
 *      arianna-lod, arianna-drag, arianna-array)
 *   • Re-exports the 15 programmatic modifier classes
 *
 * Two equivalent usage shapes — see Base.ts header for the design rationale.
 *
 * # Declarative
 *
 *   <arianna-viewport-3d>
 *     <arianna-mesh id="m1" geometry="cylinder"></arianna-mesh>
 *     <arianna-twist for="m1" angle="3.14"></arianna-twist>
 *     <arianna-bend  for="m1" angle="0.5" axis="z"></arianna-bend>
 *   </arianna-viewport-3d>
 *
 * # Programmatic
 *
 *   import { TwistModifier, BendModifier } from '.../modifiers/3D';
 *   new TwistModifier(mesh, Math.PI).apply();
 *   new BendModifier(mesh, 0.5, 'z').apply();
 *
 * See TODO_SECOND_PASS.md for the viewport integration checklist.
 */

// Base + types
export { Modifier3D, Modifier3DElement } from './Base.ts';
export type {
    Vec3Like, Geometry3Like, MeshLike, SceneLike, CameraLike, Viewport3DLike,
} from './Base.ts';
export {
    _v3, _vAdd, _vSub, _vScale, _vLen, _vNorm, _vCross, _vLerp,
    _cloneGeom, _recomputeNormals,
} from './Base.ts';

// Geometry-mutating modifiers
export { BendModifier,        BendModifierElement }        from './BendModifier.ts';
export { TwistModifier,       TwistModifierElement }       from './TwistModifier.ts';
export { BevelModifier,       BevelModifierElement }       from './BevelModifier.ts';
export { InflateModifier,     InflateModifierElement }     from './InflateModifier.ts';
export { DecimateModifier,    DecimateModifierElement }    from './DecimateModifier.ts';
export { SubdivisionModifier, SubdivisionModifierElement } from './SubdivisionModifier.ts';
export { SmoothModifier,      SmoothModifierElement }      from './SmoothModifier.ts';
export { MirrorModifier,      MirrorModifierElement }      from './MirrorModifier.ts';
export type { MirrorAxis } from './MirrorModifier.ts';

// Position / animation modifiers
export { SnapModifier,        SnapModifierElement }        from './SnapModifier.ts';
export { WaveModifier,        WaveModifierElement }        from './WaveModifier.ts';
export type { WaveModifierOptions } from './WaveModifier.ts';

// Per-frame camera-driven modifiers
export { BillboardModifier,   BillboardModifierElement }   from './BillboardModifier.ts';
export { FadeModifier,        FadeModifierElement }        from './FadeModifier.ts';
export { LODModifier,         LODModifierElement }         from './LODModifier.ts';
export type { LODLevel } from './LODModifier.ts';

// Pointer-driven modifier
export { DragModifier,        DragModifierElement }        from './DragModifier.ts';
export type { DragCallback3D } from './DragModifier.ts';

// Scene-mutating modifier
export { ArrayModifier,       ArrayModifierElement }       from './ArrayModifier.ts';
export type { ArrayModifierOptions } from './ArrayModifier.ts';

// Convenience bundle
import { BendModifier }        from './BendModifier.ts';
import { TwistModifier }       from './TwistModifier.ts';
import { BevelModifier }       from './BevelModifier.ts';
import { InflateModifier }     from './InflateModifier.ts';
import { DecimateModifier }    from './DecimateModifier.ts';
import { SubdivisionModifier } from './SubdivisionModifier.ts';
import { SmoothModifier }      from './SmoothModifier.ts';
import { MirrorModifier }      from './MirrorModifier.ts';
import { SnapModifier }        from './SnapModifier.ts';
import { WaveModifier }        from './WaveModifier.ts';
import { BillboardModifier }   from './BillboardModifier.ts';
import { FadeModifier }        from './FadeModifier.ts';
import { LODModifier }         from './LODModifier.ts';
import { DragModifier }        from './DragModifier.ts';
import { ArrayModifier }       from './ArrayModifier.ts';

export const Modifiers3D = {
    BendModifier, TwistModifier, BevelModifier, InflateModifier, DecimateModifier,
    SubdivisionModifier, SmoothModifier, MirrorModifier, SnapModifier, WaveModifier,
    BillboardModifier, FadeModifier, LODModifier, DragModifier, ArrayModifier,
};
export default Modifiers3D;
