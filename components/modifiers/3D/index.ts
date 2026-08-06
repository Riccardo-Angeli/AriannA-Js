/**
 * @module    components/modifiers/3D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA 3D Modifiers — canonical barrel.
 */

import { Modifier3D as BaseNamespace } from './Base.ts';
import { BendModifier as BendModifierNamespace } from './BendModifier.ts';
import { TwistModifier as TwistModifierNamespace } from './TwistModifier.ts';
import { BevelModifier as BevelModifierNamespace } from './BevelModifier.ts';
import { InflateModifier as InflateModifierNamespace } from './InflateModifier.ts';
import { DecimateModifier as DecimateModifierNamespace } from './DecimateModifier.ts';
import { SubdivisionModifier as SubdivisionModifierNamespace } from './SubdivisionModifier.ts';
import { SmoothModifier as SmoothModifierNamespace } from './SmoothModifier.ts';
import { MirrorModifier as MirrorModifierNamespace } from './MirrorModifier.ts';
import { SnapModifier as SnapModifierNamespace } from './SnapModifier.ts';
import { WaveModifier as WaveModifierNamespace } from './WaveModifier.ts';
import { BillboardModifier as BillboardModifierNamespace } from './BillboardModifier.ts';
import { FadeModifier as FadeModifierNamespace } from './FadeModifier.ts';
import { LODModifier as LODModifierNamespace } from './LODModifier.ts';
import { DragModifier as DragModifierNamespace } from './DragModifier.ts';
import { ArrayModifier as ArrayModifierNamespace } from './ArrayModifier.ts';

export const Modifier3D = BaseNamespace.Modifier3D;
export const Modifier3DElement = BaseNamespace.Modifier3DElement;
export const _v3 = BaseNamespace._v3;
export const _vAdd = BaseNamespace._vAdd;
export const _vSub = BaseNamespace._vSub;
export const _vScale = BaseNamespace._vScale;
export const _vLen = BaseNamespace._vLen;
export const _vNorm = BaseNamespace._vNorm;
export const _vCross = BaseNamespace._vCross;
export const _vLerp = BaseNamespace._vLerp;
export const _cloneGeom = BaseNamespace._cloneGeom;
export const _recomputeNormals = BaseNamespace._recomputeNormals;

export type Vec3Like = BaseNamespace.Interfaces.Vec3Like;
export type Geometry3Like = BaseNamespace.Interfaces.Geometry3Like;
export type MeshLike = BaseNamespace.Interfaces.MeshLike;
export type SceneLike = BaseNamespace.Interfaces.SceneLike;
export type CameraLike = BaseNamespace.Interfaces.CameraLike;
export type Viewport3DLike = BaseNamespace.Interfaces.Viewport3DLike;

export const BendModifier = BendModifierNamespace.BendModifier;
export const BendModifierElement = BendModifierNamespace.BendModifierElement;

export const TwistModifier = TwistModifierNamespace.TwistModifier;
export const TwistModifierElement = TwistModifierNamespace.TwistModifierElement;

export const BevelModifier = BevelModifierNamespace.BevelModifier;
export const BevelModifierElement = BevelModifierNamespace.BevelModifierElement;

export const InflateModifier = InflateModifierNamespace.InflateModifier;
export const InflateModifierElement = InflateModifierNamespace.InflateModifierElement;

export const DecimateModifier = DecimateModifierNamespace.DecimateModifier;
export const DecimateModifierElement = DecimateModifierNamespace.DecimateModifierElement;

export const SubdivisionModifier = SubdivisionModifierNamespace.SubdivisionModifier;
export const SubdivisionModifierElement = SubdivisionModifierNamespace.SubdivisionModifierElement;

export const SmoothModifier = SmoothModifierNamespace.SmoothModifier;
export const SmoothModifierElement = SmoothModifierNamespace.SmoothModifierElement;

export const MirrorModifier = MirrorModifierNamespace.MirrorModifier;
export const MirrorModifierElement = MirrorModifierNamespace.MirrorModifierElement;
export type MirrorAxis = MirrorModifierNamespace.Types.MirrorAxis;

export const SnapModifier = SnapModifierNamespace.SnapModifier;
export const SnapModifierElement = SnapModifierNamespace.SnapModifierElement;

export const WaveModifier = WaveModifierNamespace.WaveModifier;
export const WaveModifierElement = WaveModifierNamespace.WaveModifierElement;
export type WaveModifierOptions = WaveModifierNamespace.Interfaces.WaveModifierOptions;

export const BillboardModifier = BillboardModifierNamespace.BillboardModifier;
export const BillboardModifierElement = BillboardModifierNamespace.BillboardModifierElement;

export const FadeModifier = FadeModifierNamespace.FadeModifier;
export const FadeModifierElement = FadeModifierNamespace.FadeModifierElement;

export const LODModifier = LODModifierNamespace.LODModifier;
export const LODModifierElement = LODModifierNamespace.LODModifierElement;
export type LODLevel = LODModifierNamespace.Interfaces.LODLevel;

export const DragModifier = DragModifierNamespace.DragModifier;
export const DragModifierElement = DragModifierNamespace.DragModifierElement;
export type DragCallback3D = DragModifierNamespace.Types.DragCallback3D;

export const ArrayModifier = ArrayModifierNamespace.ArrayModifier;
export const ArrayModifierElement = ArrayModifierNamespace.ArrayModifierElement;
export type ArrayModifierOptions = ArrayModifierNamespace.Interfaces.ArrayModifierOptions;

export const Modifiers3D =
{
    BendModifier,
    TwistModifier,
    BevelModifier,
    InflateModifier,
    DecimateModifier,
    SubdivisionModifier,
    SmoothModifier,
    MirrorModifier,
    SnapModifier,
    WaveModifier,
    BillboardModifier,
    FadeModifier,
    LODModifier,
    DragModifier,
    ArrayModifier,
};

export default Modifiers3D;
