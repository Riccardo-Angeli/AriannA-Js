/**
 * @module components/graphics/2D/modifiers
 * @description Canonical public barrel for AriannA 2D modifiers.
 */

import * as BaseModule from './Base.ts';
import * as ResizerModule from './Resizer.ts';
import * as MoverModule from './Mover.ts';
import * as RotatorModule from './Rotator.ts';
import * as ReflectorModule from './Reflector.ts';
import * as RounderModule from './Rounder.ts';
import * as SkewerModule from './Skewer.ts';
import * as DockableModule from './Dockable.ts';

export const Modifier2D=BaseModule.Modifier2D.Modifier2D;
export const ResolveTargets=BaseModule.Modifier2D.ResolveTargets;
export type ModifierPhase=BaseModule.Modifier2D.Types.Phase;
export type ModifierTarget=BaseModule.Modifier2D.Types.TargetLike;
export type ModifierTargetInput=BaseModule.Modifier2D.Types.TargetInput;
export type ModifierContext=BaseModule.Modifier2D.Interfaces.ModifierContext;
export type ModifierParameterDefinition=BaseModule.Modifier2D.Parameters.Definition;
export type ModifierParameterBag=BaseModule.Modifier2D.Parameters.Bag;
export type ModifierParameterWindow=BaseModule.Modifier2D.Parameters.ParameterWindow;

export const Resizer=ResizerModule.Resizer.Resizer;
export type ResizeDirection=ResizerModule.Resizer.Types.ResizeDirection;
export type ResizerOptions=ResizerModule.Resizer.Interfaces.ResizerOptions;
export type ResizerParameters=ResizerModule.Resizer.ResizerParameters;
export const Mover=MoverModule.Mover.Mover;
export type MoverAxis=MoverModule.Mover.Types.Axis;
export type MoverBounds=MoverModule.Mover.Types.Bounds;
export type MoverOptions=MoverModule.Mover.Interfaces.MoverOptions;
export type MoverParameters=MoverModule.Mover.MoverParameters;
export const Rotator=RotatorModule.Rotator.Rotator;
export type RotatorOptions=RotatorModule.Rotator.Interfaces.RotatorOptions;
export type RotatorParameters=RotatorModule.Rotator.RotatorParameters;
export const Reflector=ReflectorModule.Reflector.Reflector;
export type ReflectorAxis=ReflectorModule.Reflector.Types.Axis;
export type ReflectorOptions=ReflectorModule.Reflector.Interfaces.ReflectorOptions;
export type ReflectorParameters=ReflectorModule.Reflector.ReflectorParameters;
export const Rounder=RounderModule.Rounder.Rounder;
export type RounderCorner=RounderModule.Rounder.Types.Corner;
export type RounderOptions=RounderModule.Rounder.Interfaces.RounderOptions;
export type RounderParameters=RounderModule.Rounder.RounderParameters;
export const Skewer=SkewerModule.Skewer.Skewer;
export type SkewerAxis=SkewerModule.Skewer.Types.Axis;
export type SkewerOptions=SkewerModule.Skewer.Interfaces.SkewerOptions;
export type SkewerParameters=SkewerModule.Skewer.SkewerParameters;

export const Dockable=DockableModule.Dockable.Dockable;
export type { DockableOptions, DockPosition } from './Dockable.ts';

/** Snap is a Mover sub-behaviour configured through snapX/snapY. */
export const Modifiers2D=Object.freeze({Resizer,Mover,Rotator,Reflector,Rounder,Skewer,Dockable});
export default Modifiers2D;
