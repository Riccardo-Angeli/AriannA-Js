/**
 * @module    components/modifiers
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Modifier stack — transforms applied to 2D shapes (Mover, Rotator, Resizer,
 * Reflector, Rounder, Skewer) and 3D meshes (Bend, Bevel, Subdivision,
 * Mirror, Array, Twist, Wave, Inflate, Smooth, Decimate, LOD, Drag, Snap,
 * Fade, Billboard).
 *
 * The 2D sub-module exposes its base as `Modifier2D`, the 3D sub-module as
 * `Modifier3D` — they don't collide, so we re-export both sub-barrels in
 * full. For the bundles, use the explicit re-exports below.
 *
 *   import { Resizer, BendModifier }    from 'arianna/components/modifiers';
 *   import { Modifiers2D, Modifiers3D } from 'arianna/components/modifiers';
 */

export * from './2D/index.ts';
export * from './3D/index.ts';

import Modifiers2D from './2D/index.ts';
import Modifiers3D from './3D/index.ts';
export { Modifiers2D, Modifiers3D };
