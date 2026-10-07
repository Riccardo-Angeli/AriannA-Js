/**
 * @module    additionals
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Top-level barrel for all `additionals/*.ts` modules. Each additional is
 * a self-contained namespace (`AI`, `Animation`, `Audio`, `Colors`, `Data`,
 * `Finance`, `Geometry`, `IO`, `Latex`, `Less`, `Math`, `Midi`, `Network`,
 * `Physics`, `Sass`, `Scss`, `Stylus`, `Three`, `Two`, `Video`).
 *
 * Pure CSS preprocessors (Less, Sass, Scss, Stylus) live here rather than
 * in core so the core stays lean. The default `Sheet.ts` keeps a thin
 * wrapper to `Less` for the historical `Sheet.Less(text)` convenience.
 *
 * They are exposed two ways simultaneously:
 *   1. As named ESM exports (`import { Three } from 'arianna/additionals'`)
 *   2. As side-effect window globals (`window.Three`, `window.World`, ...)
 *      so the inline demo scripts in index.html / reference.html can use
 *      them without import statements.
 *
 * Adding a new additional? Three steps:
 *   - create `additionals/<Name>.ts` exporting a default namespace + named exports
 *   - add the `export { default as <Name> } from './<Name>.ts'` line below
 *   - rebuild → window.<Name> is available everywhere
 */

export { default as AI         } from './ai/AI.ts';
export { default as Animation  } from './animation/Animation.ts';
export { default as Audio      } from './audio/Audio.ts';
export { default as Colors     } from './graphics/Colors.ts';
export { default as Data       } from './data/Data.ts';
export { default as Finance    } from './finance/Finance.ts';
export { default as Geometry   } from './graphics/Geometry.ts';
export { default as IO         } from './io/IO.ts';
export { default as Latex      } from './documents/Latex.ts';
export { default as Less       } from './styles/Less.ts';
export { default as Math       } from './math/Math.ts';
export { default as Midi       } from './audio/Midi.ts';
export { default as Network    } from './network/Network.ts';
export { default as Physics    } from './physics/Physics.ts';
export { default as Sass       } from './styles/Sass.ts';
export { default as Scss       } from './styles/Scss.ts';
export { default as Stylus     } from './styles/Stylus.ts';
export { default as Three      } from './graphics/3D/Three.ts';
export { default as Two        } from './graphics/2D/Two.ts';
export { default as Video      } from './video/Video.ts';
export { TimecodeGenerator, Timecode } from './video/Video.ts';


// ── Re-exports of selected named members ─────────────────────────────────

// Physics also re-exports its individual classes so demos can write
//   import { World, Body, Box, Circle } from 'arianna/additionals/Physics';
// or, after side-effect loading:
//   const world = new World({ gravity: [0, -9.81] });
export {
  World, Body, Shape, Circle, Sphere, Box, Capsule, Polygon,
  Spring, DistanceConstraint, Pin, Rope,
  Drag, PointGravity, Wind,
  V as PhysicsVec,
} from './physics/Physics.ts';

// Each CSS preprocessor also re-exports its parse function so the demo
// site can compile snippets directly:
//   import { parseLess, parseSass, parseScss, parseStylus } from 'arianna/additionals';
export { parseLess   } from './styles/Less.ts';
export { parseSass   } from './styles/Sass.ts';
export { parseScss   } from './styles/Scss.ts';
export { parseStylus } from './styles/Stylus.ts';

export { Images } from './graphics/Images.ts';
export type { ImageAsset, ImageDecoder, Tiling } from './graphics/Images.ts';

export { Formats, Dcom } from './graphics/3D/index.ts';
export { Fhir, OpenEHR } from './medical/index.ts';
