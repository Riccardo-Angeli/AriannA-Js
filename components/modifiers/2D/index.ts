/**
 * @module    components/modifiers/2D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA 2D Modifiers — canonical barrel.
 */

import { Modifier2D as BaseNamespace } from './Base.ts';
import { Resizer as ResizerNamespace } from './Resizer.ts';
import { Mover as MoverNamespace } from './Mover.ts';
import { Rotator as RotatorNamespace } from './Rotator.ts';
import { Reflector as ReflectorNamespace } from './Reflector.ts';
import { Rounder as RounderNamespace } from './Rounder.ts';
import { Skewer as SkewerNamespace } from './Skewer.ts';

export const Modifier2D = BaseNamespace.Modifier2D;
export const resolveTargets = BaseNamespace.resolveTargets;
export type ModifierContext = BaseNamespace.Interfaces.ModifierContext;

export const Resizer = ResizerNamespace.Resizer;
export type ResizeDir = ResizerNamespace.Types.ResizeDir;
export type ResizerOptions = ResizerNamespace.Interfaces.ResizerOptions;

export const Mover = MoverNamespace.Mover;
export type MoverOptions = MoverNamespace.Interfaces.MoverOptions;

export const Rotator = RotatorNamespace.Rotator;
export type RotatorOptions = RotatorNamespace.Interfaces.RotatorOptions;

export const Reflector = ReflectorNamespace.Reflector;
export type ReflectorOptions = ReflectorNamespace.Interfaces.ReflectorOptions;

export const Rounder = RounderNamespace.Rounder;
export type Corner = RounderNamespace.Types.Corner;
export type RounderOptions = RounderNamespace.Interfaces.RounderOptions;

export const Skewer = SkewerNamespace.Skewer;
export type SkewerOptions = SkewerNamespace.Interfaces.SkewerOptions;

export const Modifiers2D =
{
    Resizer,
    Mover,
    Rotator,
    Reflector,
    Rounder,
    Skewer,
};

export default Modifiers2D;
