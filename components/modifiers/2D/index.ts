/**
 * @module    components/modifiers/2D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA 2D Modifiers — barrel export.
 *
 * Modifiers are zero-chrome custom elements that attach behavior to their
 * parent element. Drop them as declarative children:
 *
 *   <arianna-window>
 *     <arianna-resizer handles="se"></arianna-resizer>
 *     <arianna-mover handle-selector=".titlebar"></arianna-mover>
 *     <div class="titlebar">My Window</div>
 *     <div>content</div>
 *   </arianna-window>
 *
 *   <arianna-accordion>
 *     <arianna-resizer handles="e"></arianna-resizer>
 *     <!-- sections -->
 *   </arianna-accordion>
 *
 * Tags registered:
 *   arianna-resizer, arianna-mover, arianna-rotator,
 *   arianna-reflector, arianna-rounder, arianna-skewer
 *
 * All six modifiers extend the same `Modifier2D` base class, exported here
 * for custom modifier development.
 */

export { Modifier2D, resolveTargets } from './Base.ts';
export type { ModifierContext }       from './Base.ts';

export { Resizer }   from './Resizer.ts';
export { Mover }     from './Mover.ts';
export { Rotator }   from './Rotator.ts';
export { Reflector } from './Reflector.ts';
export { Rounder }   from './Rounder.ts';
export { Skewer }    from './Skewer.ts';

export type { ResizeDir, ResizerOptions }   from './Resizer.ts';
export type { MoverOptions }                from './Mover.ts';
export type { RotatorOptions }              from './Rotator.ts';
export type { ReflectorOptions }            from './Reflector.ts';
export type { Corner, RounderOptions }      from './Rounder.ts';
export type { SkewerOptions }               from './Skewer.ts';

// Convenience bundle
import { Resizer }   from './Resizer.ts';
import { Mover }     from './Mover.ts';
import { Rotator }   from './Rotator.ts';
import { Reflector } from './Reflector.ts';
import { Rounder }   from './Rounder.ts';
import { Skewer }    from './Skewer.ts';

export const Modifiers2D = { Resizer, Mover, Rotator, Reflector, Rounder, Skewer };
export default Modifiers2D;
