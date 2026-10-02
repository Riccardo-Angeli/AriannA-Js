/**
 * @module    components/graphics/3D/modifiers
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
import Snappable3D from './Snappable3D.ts';
import { WaveModifier as WaveModifierNamespace } from './WaveModifier.ts';
import { BillboardModifier as BillboardModifierNamespace } from './BillboardModifier.ts';
import { FadeModifier as FadeModifierNamespace } from './FadeModifier.ts';
import { LODModifier as LODModifierNamespace } from './LODModifier.ts';
import { DragModifier as DragModifierNamespace } from './DragModifier.ts';
import { ArrayModifier as ArrayModifierNamespace } from './ArrayModifier.ts';
import { RevolveModifier as RevolveModifierNamespace } from './RevolveModifier.ts';
import { CrossSection as CrossSectionNamespace } from './CrossSection.ts';
import { Mover3D as Mover3DNamespace } from './Mover3D.ts';
import { Resizer3D as Resizer3DNamespace } from './Resizer3D.ts';
import { Rotator3D as Rotator3DNamespace } from './Rotator3D.ts';
import { Reflector3D as Reflector3DNamespace } from './Reflector3D.ts';
import { Rounder3D as Rounder3DNamespace } from './Rounder3D.ts';
import { Skewer3D as Skewer3DNamespace } from './Skewer3D.ts';

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
export type ModifierSelection3D = BaseNamespace.Interfaces.SelectionLike;

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
export { Snappable3D };
export type { Snappable3DOptions, SnapResult3D } from './Snappable3D.ts';

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
export const RevolveModifier = RevolveModifierNamespace.RevolveModifier;
export const RevolveModifierElement = RevolveModifierNamespace.RevolveModifierElement;
export type RevolveProfilePoint = RevolveModifierNamespace.Interfaces.ProfilePoint;
export type RevolveOptions = RevolveModifierNamespace.Interfaces.RevolveOptions;
export const CrossSection = CrossSectionNamespace.CrossSection;
export type CrossSectionPlane = CrossSectionNamespace.Plane;
export type CrossSectionSegment = CrossSectionNamespace.Segment;

export const Mover3D=Mover3DNamespace.Mover3D;
export const Mover3DElement=Mover3DNamespace.Mover3DElement;
export type Mover3DAxis=Mover3DNamespace.Axis;
export type Mover3DOptions=Mover3DNamespace.Options;
export const Resizer3D=Resizer3DNamespace.Resizer3D;
export const Resizer3DElement=Resizer3DNamespace.Resizer3DElement;
export type Resizer3DOptions=Resizer3DNamespace.Options;
export const Rotator3D=Rotator3DNamespace.Rotator3D;
export const Rotator3DElement=Rotator3DNamespace.Rotator3DElement;
export type Rotator3DOptions=Rotator3DNamespace.Options;
export const Reflector3D=Reflector3DNamespace.Reflector3D;
export const Reflector3DElement=Reflector3DNamespace.Reflector3DElement;
export type Reflector3DOptions=Reflector3DNamespace.Options;
export const Rounder3D=Rounder3DNamespace.Rounder3D;
export const Rounder3DElement=Rounder3DNamespace.Rounder3DElement;
export type Rounder3DOptions=Rounder3DNamespace.Options;
export const Skewer3D=Skewer3DNamespace.Skewer3D;
export const Skewer3DElement=Skewer3DNamespace.Skewer3DElement;
export type Skewer3DOptions=Skewer3DNamespace.Options;


export const Modifiers3DRegistry =
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
    Snappable3D,
    WaveModifier,
    BillboardModifier,
    FadeModifier,
    LODModifier,
    DragModifier,
    ArrayModifier,
    RevolveModifier,
    CrossSection,

    Mover3D,
    Resizer3D,
    Rotator3D,
    Reflector3D,
    Rounder3D,
    Skewer3D,
};

export default Modifiers3DRegistry;
