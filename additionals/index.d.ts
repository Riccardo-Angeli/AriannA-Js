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
export { default as AI } from './AI.ts';
export { default as Animation } from './Animation.ts';
export { default as Audio } from './Audio.ts';
export { default as Colors } from './Colors.ts';
export { default as Data } from './Data.ts';
export { default as Finance } from './Finance.ts';
export { default as Geometry } from './Geometry.ts';
export { default as IO } from './IO.ts';
export { default as Latex } from './Latex.ts';
export { default as Less } from './Less.ts';
export { default as Math } from './Math.ts';
export { default as Midi } from './Midi.ts';
export { default as Network } from './Network.ts';
export { default as Physics } from './Physics.ts';
export { default as Sass } from './Sass.ts';
export { default as Scss } from './Scss.ts';
export { default as Stylus } from './Stylus.ts';
export { default as Three } from './Three.ts';
export { default as Two } from './Two.ts';
export { default as Video } from './Video.ts';
export { World, Body, Shape, Circle, Sphere, Box, Capsule, Polygon, Spring, DistanceConstraint, Pin, Rope, Drag, PointGravity, Wind, V as PhysicsVec, } from './Physics.ts';
export { parseLess } from './Less.ts';
export { parseSass } from './Sass.ts';
export { parseScss } from './Scss.ts';
export { parseStylus } from './Stylus.ts';
