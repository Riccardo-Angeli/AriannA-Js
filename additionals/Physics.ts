/**
 * @module    additionals/Physics
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   AGPL-3.0 / Commercial
 *
 * AriannA Physics — 2D / 3D rigid-body simulation additional.
 *
 * Mirrors the namespace shape of additionals/Three.ts and additionals/Two.ts:
 * a single `Physics` namespace exports every class, and they are ALSO mirrored
 * flat onto `window` so existing demos can write `new World(...)` without
 * going through `AriannA.Physics.World`.
 *
 * ── PUBLIC API ────────────────────────────────────────────────────────────────
 *
 *   World        - top-level simulation; gravity, substeps, broadphase, integrator
 *   Body         - rigid body with mass / shape / pose / velocity
 *   Shape        - abstract shape; subclasses: Circle, Sphere, Box, Capsule, Polygon
 *   Spring / DistanceConstraint / Pin / Rope - constraints
 *   Drag / PointGravity / Wind               - force fields
 *   V            - vector helpers (add / sub / scale / dot / len / norm)
 *
 * ── USAGE ─────────────────────────────────────────────────────────────────────
 *
 *   import { World, Body, Box, Circle } from 'arianna/additionals/Physics';
 *
 *   const world = new World({ gravity: [0, -9.81], dimension: 2, substeps: 4 });
 *   world.addBody(new Body({ shape: new Box(20, 0.5), static: true }));
 *   world.addBody(new Body({ shape: new Circle(0.3), position: [0, 5],
 *                            restitution: 0.7 }));
 *   world.start();
 *
 *   // Or, once the additional is loaded as a side-effect script:
 *   const w = new World({ gravity: [0, -9.81] });
 */

type Vec = [number, number] | [number, number, number];

const V = {
  add  : (a: Vec, b: Vec): Vec => a.map((x, i) => x + b[i]) as Vec,
  sub  : (a: Vec, b: Vec): Vec => a.map((x, i) => x - b[i]) as Vec,
  scale: (a: Vec, s: number): Vec => a.map(x => x * s) as Vec,
  dot  : (a: Vec, b: Vec): number => a.reduce((s, x, i) => s + x * b[i], 0),
  len  : (a: Vec): number => Math.hypot(...a),
  norm : (a: Vec): Vec => {
    const l = Math.hypot(...a) || 1;
    return a.map(x => x / l) as Vec;
  },
  zero : (dim: 2 | 3 = 2): Vec => dim === 2 ? [0, 0] : [0, 0, 0],
};

abstract class Shape {
  abstract kind: 'circle' | 'sphere' | 'box' | 'capsule' | 'polygon';
  abstract bounds(): { min: Vec; max: Vec };
  area(): number { return 1; }
}

class Circle extends Shape {
  kind = 'circle' as const;
  constructor(public radius: number) { super(); }
  bounds() { return { min: [-this.radius, -this.radius] as Vec, max: [this.radius, this.radius] as Vec }; }
  area()   { return Math.PI * this.radius * this.radius; }
}

class Sphere extends Shape {
  kind = 'sphere' as const;
  constructor(public radius: number) { super(); }
  bounds() {
    const r = this.radius;
    return { min: [-r, -r, -r] as Vec, max: [r, r, r] as Vec };
  }
  area() { return 4 * Math.PI * this.radius * this.radius; }
}

class Box extends Shape {
  kind = 'box' as const;
  constructor(public width: number, public height: number, public depth: number = 0) { super(); }
  bounds() {
    const hw = this.width / 2, hh = this.height / 2;
    if (this.depth) {
      const hd = this.depth / 2;
      return { min: [-hw, -hh, -hd] as Vec, max: [hw, hh, hd] as Vec };
    }
    return { min: [-hw, -hh] as Vec, max: [hw, hh] as Vec };
  }
  area() { return this.width * this.height; }
}

class Capsule extends Shape {
  kind = 'capsule' as const;
  constructor(public start: Vec, public end: Vec, public radius: number) { super(); }
  bounds() {
    const min = this.start.map((s, i) => Math.min(s, this.end[i]) - this.radius) as Vec;
    const max = this.start.map((s, i) => Math.max(s, this.end[i]) + this.radius) as Vec;
    return { min, max };
  }
}

class Polygon extends Shape {
  kind = 'polygon' as const;
  constructor(public verts: Vec[]) { super(); }
  bounds() {
    const xs = this.verts.map(v => v[0]);
    const ys = this.verts.map(v => v[1]);
    return {
      min: [Math.min(...xs), Math.min(...ys)] as Vec,
      max: [Math.max(...xs), Math.max(...ys)] as Vec,
    };
  }
}

interface BodyOptions {
  shape           : Shape;
  position?       : Vec;
  velocity?       : Vec;
  angularVelocity?: number;
  mass?           : number;
  restitution?    : number;
  friction?       : number;
  static?         : boolean;
}

class Body {
  shape           : Shape;
  position        : Vec;
  velocity        : Vec;
  angle           = 0;
  angularVelocity : number;
  mass            : number;
  invMass         : number;
  restitution     : number;
  friction        : number;
  static          : boolean;

  constructor(opts: BodyOptions) {
    this.shape           = opts.shape;
    this.position        = opts.position        ?? [0, 0];
    this.velocity        = opts.velocity        ?? [0, 0];
    this.angularVelocity = opts.angularVelocity ?? 0;
    this.mass            = opts.mass            ?? this.shape.area();
    this.restitution     = opts.restitution     ?? 0.3;
    this.friction        = opts.friction        ?? 0.4;
    this.static          = !!opts.static;
    this.invMass         = this.static ? 0 : 1 / this.mass;
  }

  applyForce(f: Vec, dt: number) {
    if (this.static) return;
    this.velocity = V.add(this.velocity, V.scale(f, dt * this.invMass));
  }
}

class Spring {
  constructor(
    public a: Body, public b: Body,
    public restLength: number,
    public stiffness = 80,
    public damping   = 1.0,
  ) {}
}

class DistanceConstraint {
  constructor(public a: Body, public b: Body, public dist: number) {}
}

class Pin {
  constructor(public body: Body, public at: Vec) {}
}

class Rope {
  segments   : Body[]              = [];
  constraints: DistanceConstraint[] = [];
  constructor(public from: Vec, public to: Vec, public count: number, public radius = 0.05) {}
}

class Drag         { constructor(public coefficient = 0.1) {} }
class PointGravity { constructor(public at: Vec, public strength = 10) {} }
class Wind         { constructor(public direction: Vec, public strength = 1, public turbulence = 0) {} }

interface WorldOptions {
  gravity?  : Vec;
  dimension?: 2 | 3;
  substeps? : number;
  timestep? : number;
}

class World {
  gravity     : Vec;
  dimension   : 2 | 3;
  substeps    : number;
  timestep    : number;
  bodies      : Body[] = [];
  constraints : (Spring | DistanceConstraint | Pin)[] = [];
  fields      : (Drag | PointGravity | Wind)[]        = [];

  private _raf     = 0;
  private _running = false;
  private _accum   = 0;
  private _lastT   = 0;

  constructor(opts: WorldOptions = {}) {
    this.gravity   = opts.gravity   ?? [0, -9.81];
    this.dimension = opts.dimension ?? 2;
    this.substeps  = opts.substeps  ?? 4;
    this.timestep  = opts.timestep  ?? 1 / 60;
  }

  addBody(b: Body):      this { this.bodies.push(b);      return this; }
  removeBody(b: Body):   this { this.bodies = this.bodies.filter(x => x !== b); return this; }
  addConstraint(c: any): this { this.constraints.push(c); return this; }
  addField(f: any):      this { this.fields.push(f);      return this; }

  start(): this {
    if (this._running) return this;
    this._running = true;
    this._lastT   = performance.now() / 1000;
    const tick = () => {
      if (!this._running) return;
      const now = performance.now() / 1000;
      const dt  = Math.min(0.05, now - this._lastT);
      this._lastT = now;
      this._accum += dt;
      while (this._accum >= this.timestep) {
        this.step(this.timestep);
        this._accum -= this.timestep;
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  stop(): this {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    return this;
  }

  step(dt: number) {
    const sub = dt / this.substeps;
    for (let s = 0; s < this.substeps; s++) {
      for (const b of this.bodies) {
        if (b.static) continue;
        b.velocity = V.add(b.velocity, V.scale(this.gravity, sub));
        for (const f of this.fields) {
          if (f instanceof Drag) {
            b.velocity = V.scale(b.velocity, 1 - f.coefficient * sub);
          } else if (f instanceof Wind) {
            b.velocity = V.add(b.velocity, V.scale(f.direction, f.strength * sub));
          } else if (f instanceof PointGravity) {
            const d = V.sub(f.at, b.position);
            const r = V.len(d) || 1;
            b.velocity = V.add(b.velocity, V.scale(V.norm(d), f.strength * sub / (r * r)));
          }
        }
      }
      for (const b of this.bodies) {
        if (b.static) continue;
        b.position = V.add(b.position, V.scale(b.velocity, sub)) as Vec;
        b.angle   += b.angularVelocity * sub;
      }
      for (const c of this.constraints) {
        if (c instanceof Spring) {
          const delta = V.sub(c.b.position, c.a.position);
          const dist  = V.len(delta) || 1e-6;
          const dir   = V.scale(delta, 1 / dist);
          const x     = dist - c.restLength;
          const force = V.scale(dir, c.stiffness * x);
          c.a.applyForce(force,                     sub);
          c.b.applyForce(V.scale(force, -1) as Vec, sub);
        } else if (c instanceof Pin) {
          c.body.position = c.at.slice() as Vec;
          c.body.velocity = V.zero(this.dimension);
        }
      }
      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          this._resolveCollision(this.bodies[i], this.bodies[j]);
        }
      }
    }
  }

  private _resolveCollision(a: Body, b: Body) {
    if (a.static && b.static) return;
    if (a.shape.kind === 'circle' && b.shape.kind === 'circle') {
      const ra = (a.shape as Circle).radius;
      const rb = (b.shape as Circle).radius;
      const d  = V.sub(b.position, a.position);
      const dist = V.len(d);
      const overlap = ra + rb - dist;
      if (overlap <= 0 || dist < 1e-6) return;
      const n = V.scale(d, 1 / dist);
      const totalInv = a.invMass + b.invMass;
      if (totalInv === 0) return;
      const correction = V.scale(n, overlap / totalInv);
      a.position = V.sub(a.position, V.scale(correction, a.invMass));
      b.position = V.add(b.position, V.scale(correction, b.invMass));
      const relV = V.sub(b.velocity, a.velocity);
      const velAlongN = V.dot(relV, n);
      if (velAlongN > 0) return;
      const e = Math.min(a.restitution, b.restitution);
      const jImpulse = -(1 + e) * velAlongN / totalInv;
      const impulse  = V.scale(n, jImpulse);
      a.velocity = V.sub(a.velocity, V.scale(impulse, a.invMass));
      b.velocity = V.add(b.velocity, V.scale(impulse, b.invMass));
    } else {
      // Simplified AABB-style box / mixed collision
      const ba = a.shape.bounds();
      const bb = b.shape.bounds();
      const aminX = a.position[0] + ba.min[0], amaxX = a.position[0] + ba.max[0];
      const bminX = b.position[0] + bb.min[0], bmaxX = b.position[0] + bb.max[0];
      const aminY = a.position[1] + ba.min[1], amaxY = a.position[1] + ba.max[1];
      const bminY = b.position[1] + bb.min[1], bmaxY = b.position[1] + bb.max[1];
      const overlapX = Math.min(amaxX - bminX, bmaxX - aminX);
      const overlapY = Math.min(amaxY - bminY, bmaxY - aminY);
      if (overlapX <= 0 || overlapY <= 0) return;
      const totalInv = a.invMass + b.invMass;
      if (totalInv === 0) return;
      const e = Math.min(a.restitution, b.restitution);
      if (overlapX < overlapY) {
        const sign = a.position[0] < b.position[0] ? -1 : 1;
        const corr = overlapX / totalInv;
        a.position[0] += sign * corr * a.invMass;
        b.position[0] -= sign * corr * b.invMass;
        const relV = b.velocity[0] - a.velocity[0];
        if ((sign < 0 && relV < 0) || (sign > 0 && relV > 0)) {
          const j = -(1 + e) * relV / totalInv;
          a.velocity[0] -= j * a.invMass;
          b.velocity[0] += j * b.invMass;
        }
      } else {
        const sign = a.position[1] < b.position[1] ? -1 : 1;
        const corr = overlapY / totalInv;
        a.position[1] += sign * corr * a.invMass;
        b.position[1] -= sign * corr * b.invMass;
        const relV = b.velocity[1] - a.velocity[1];
        if ((sign < 0 && relV < 0) || (sign > 0 && relV > 0)) {
          const j = -(1 + e) * relV / totalInv;
          a.velocity[1] -= j * a.invMass;
          b.velocity[1] += j * b.invMass;
        }
      }
    }
  }

  /**
   * Render every body on a 2D canvas. Useful for debug views and demos.
   *
   *   world.debugDraw(ctx, { scale: 50, offset: [400, 300] });
   */
  debugDraw(ctx: CanvasRenderingContext2D, opts: { scale?: number; offset?: Vec } = {}) {
    const scale  = opts.scale  ?? 50;
    const offset = opts.offset ?? [ctx.canvas.width / 2, ctx.canvas.height * 0.7];
    const worldToScreen = (p: Vec): [number, number] => [
      offset[0] + p[0] * scale,
      offset[1] - p[1] * scale,
    ];
    for (const b of this.bodies) {
      ctx.save();
      const [sx, sy] = worldToScreen(b.position);
      ctx.translate(sx, sy);
      ctx.rotate(-b.angle);
      ctx.strokeStyle = b.static ? '#5a5a5a' : '#e40c88';
      ctx.lineWidth   = 1.5;
      if (b.shape.kind === 'circle') {
        const r = (b.shape as Circle).radius * scale;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke();
      } else if (b.shape.kind === 'box') {
        const w = (b.shape as Box).width  * scale;
        const h = (b.shape as Box).height * scale;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }
      ctx.restore();
    }
  }
}

// ── Namespace export (matches additionals/Three.ts shape) ────────────────────

const Physics = {
  V,
  Shape, Circle, Sphere, Box, Capsule, Polygon,
  Body, Spring, DistanceConstraint, Pin, Rope,
  Drag, PointGravity, Wind,
  World,
};

// ── Side-effect: mirror flat onto window ─────────────────────────────────────
// Existing demos use `new World(...)`, `new Body(...)`, etc. without going
// through `AriannA.Physics.World`. We mirror with configurable: true so the
// runtime loader in index.html can safely overwrite if needed (no
// `configurable: false` here — that was the root cause of the RichTextEditor
// crash).

if (typeof window !== 'undefined' && !(window as any).__ariannaPhysicsInstalled) {
  (window as any).__ariannaPhysicsInstalled = true;
  for (const [k, v] of Object.entries(Physics)) {
    if (!Object.prototype.hasOwnProperty.call(window, k)) {
      try { (window as any)[k] = v; } catch { /* read-only global, skip */ }
    }
  }
  try { (window as any).Physics = Physics; } catch {}
}

export {
  V,
  Shape, Circle, Sphere, Box, Capsule, Polygon,
  Body, Spring, DistanceConstraint, Pin, Rope,
  Drag, PointGravity, Wind,
  World,
};
export default Physics;
