/**
 * @module    components/modifiers/3D/Base
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Modifier3D — base for AriannA 3D geometry modifiers.
 *
 * # Dual usage shape
 *
 * Each modifier supports two equivalent forms:
 *
 *   ## Declarative (custom element)
 *
 *   Place the modifier inside `<arianna-viewport-3d>` next to a target mesh:
 *
 *     <arianna-viewport-3d>
 *       <arianna-mesh id="m1" geometry="box"></arianna-mesh>
 *       <arianna-twist for="m1" angle="1.57" axis="y"></arianna-twist>
 *       <arianna-bend  for="m1" angle="0.78" axis="z"></arianna-bend>
 *     </arianna-viewport-3d>
 *
 *   The modifier auto-discovers its viewport via `closest('arianna-viewport-3d')`,
 *   resolves its target mesh by the `for` attribute (or previous-sibling
 *   `arianna-mesh` if absent), and calls `apply()` on mount.
 *
 *   ## Programmatic (plain class)
 *
 *   Construct with a `MeshLike` instance directly:
 *
 *     import { Mesh } from '../../../additionals/Three.ts';
 *     import { TwistModifier } from './TwistModifier.ts';
 *
 *     const mesh = new Mesh(geometry, material);
 *     new TwistModifier(mesh, 1.57, 'y').apply();
 *
 *   This form is required for tests and headless usage. The custom element
 *   form wraps the same class internally.
 *
 * # Type interop
 *
 * The `*Like` interfaces below are structurally identical to the public
 * surface of `Three.Mesh`, `Three.Vec3`, etc., so any Three.ts class instance
 * is already a valid `*Like` value — no explicit cast or adapter needed.
 *
 * # See also
 *
 * `TODO_SECOND_PASS.md` in this directory enumerates everything that needs
 * to be wired up when `arianna-viewport-3d` is built.
 */

import { Component } from '../../../core/Component.ts';

// ── Three.ts-compatible structural type interfaces ──────────────────────────

export interface Vec3Like { x: number; y: number; z: number; }

export interface Geometry3Like {
    vertices : Vec3Like[];
    normals  : Vec3Like[];
    indices  : number[];
    uvs?     : [number, number][];
    clone():  Geometry3Like;
}

export interface MeshLike {
    geometry      : Geometry3Like;
    position      : Vec3Like;
    rotation      : Vec3Like;
    scale         : Vec3Like;
    visible       : boolean;
    userData      : Record<string, unknown>;
    updateMatrix?(): void;
}

export interface SceneLike {
    children: MeshLike[];
    add(obj: MeshLike): void;
    remove(obj: MeshLike): void;
}

export interface CameraLike {
    position: Vec3Like;
}

/**
 * Minimal viewport surface a modifier expects. The real `arianna-viewport-3d`
 * implements this and more. See TODO_SECOND_PASS.md for the full contract.
 */
export interface Viewport3DLike {
    scene  : SceneLike;
    camera : CameraLike;
    canvas?: HTMLCanvasElement;
    findMesh(id: string): MeshLike | null;
    onFrame?(cb: (dt: number) => void): () => void;
    invalidate?(): void;
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

export function _v3(x: number, y: number, z: number): Vec3Like { return { x, y, z }; }
export function _vAdd(a: Vec3Like, b: Vec3Like): Vec3Like { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
export function _vSub(a: Vec3Like, b: Vec3Like): Vec3Like { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
export function _vScale(v: Vec3Like, s: number): Vec3Like { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
export function _vLen(v: Vec3Like): number                 { return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2); }
export function _vNorm(v: Vec3Like): Vec3Like              { const l = _vLen(v) || 1; return _vScale(v, 1 / l); }
export function _vCross(a: Vec3Like, b: Vec3Like): Vec3Like { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
export function _vLerp(a: Vec3Like, b: Vec3Like, t: number): Vec3Like { return _vAdd(a, _vScale(_vSub(b, a), t)); }

export function _cloneGeom(g: Geometry3Like): Geometry3Like {
    return {
        vertices: g.vertices.map(v => ({ ...v })),
        normals:  g.normals.map(v  => ({ ...v })),
        indices:  [...g.indices],
        uvs:      g.uvs ? g.uvs.map(uv => [...uv] as [number, number]) : undefined,
        clone()   { return _cloneGeom(this); },
    };
}

export function _recomputeNormals(g: Geometry3Like): void {
    const normals: Vec3Like[] = Array.from({ length: g.vertices.length }, () => _v3(0, 0, 0));
    for (let i = 0; i < g.indices.length; i += 3) {
        const [ia, ib, ic] = g.indices.slice(i, i + 3);
        const n = _vNorm(_vCross(_vSub(g.vertices[ib], g.vertices[ia]), _vSub(g.vertices[ic], g.vertices[ia])));
        [ia, ib, ic].forEach(idx => { normals[idx] = _vAdd(normals[idx], n); });
    }
    g.normals = normals.map(_vNorm);
}

// ── Programmatic core (plain class — Modifier3D) ─────────────────────────────

/**
 * Programmatic 3D modifier core. Subclasses MUST implement `apply()` which
 * mutates `this.mesh` (typically via geometry clone + recompute normals).
 *
 * The declarative custom-element wrapper (`Modifier3DElement` below) holds
 * an instance of this class and delegates lifecycle to it.
 */
export abstract class Modifier3D {
    /** Sentinel mesh used by declarative custom elements before mount-time
     *  binding. Replaced via `bindMesh()` once the viewport resolves it. */
    static readonly UNBOUND_MESH: MeshLike = {
        geometry: { vertices: [], normals: [], indices: [], clone() { return { ...this, clone: this.clone }; } },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale   : { x: 1, y: 1, z: 1 },
        visible : true,
        userData: {},
    };

    protected mesh    : MeshLike;
    protected enabled = true;
    protected cleanups: (() => void)[] = [];

    constructor(mesh: MeshLike) { this.mesh = mesh; }

    /** Late-bind the target mesh (used by declarative custom-element wrapper). */
    bindMesh(mesh: MeshLike): this { this.mesh = mesh; return this; }

    enable(): this  { this.enabled = true;  return this; }
    disable(): this { this.enabled = false; return this; }
    isEnabled(): boolean { return this.enabled; }

    destroy(): void {
        for (const fn of this.cleanups) {
            try { fn(); } catch (e) { console.warn('[Modifier3D] cleanup error', e); }
        }
        this.cleanups = [];
    }

    abstract apply(): this;
}

// ── Declarative core (custom element — Modifier3DElement) ───────────────────

/**
 * Custom-element wrapper for a 3D modifier. Subclasses extend this and
 * override `createModifier()` to construct the concrete `Modifier3D` instance
 * once the target mesh is resolved.
 *
 * Lifecycle:
 *   onMount → queueMicrotask → resolveViewport → resolveTarget → createModifier
 *           → modifier.apply() → register update loop if available
 *
 *   onUnmount → modifier.destroy() → cleanup
 */
export class Modifier3DElement extends Component('arianna-modifier-3d', HTMLElement, {}, {
    attrs : ['for', 'enabled'],
    shadow: false,
})
{
    protected viewport: Viewport3DLike | null = null;
    protected target  : MeshLike | null = null;
    protected modifier: Modifier3D | null = null;

    /** Frame-loop unsubscribe handle (returned by viewport.onFrame). */
    #frameUnsub: (() => void) | null = null;

    build(_opts: object = {})
    {
        // Modifiers have no chrome — they're pure behavior wiring.
        // Hide the host so it takes no layout space.
    }

    /**
     * Resolve the viewport this modifier lives inside.
     * Default: nearest `arianna-viewport-3d` ancestor.
     */
    protected resolveViewport(): Viewport3DLike | null
    {
        const el = this.closest('arianna-viewport-3d');
        return el ? (el as unknown as Viewport3DLike) : null;
    }

    /**
     * Resolve the target mesh.
     *   1. If `for` attribute set → viewport.findMesh(id)
     *   2. Else → previous-sibling `arianna-mesh` with a `.mesh` property
     */
    protected resolveTarget(): MeshLike | null
    {
        const id = this.getAttribute('for');
        if (id && this.viewport) return this.viewport.findMesh(id);

        // Sibling fallback: walk previous siblings looking for an arianna-mesh
        let sib: Element | null = this.previousElementSibling;
        while (sib) {
            if (sib.tagName.toLowerCase() === 'arianna-mesh') {
                const m = (sib as unknown as { mesh?: MeshLike }).mesh;
                if (m) return m;
            }
            sib = sib.previousElementSibling;
        }
        return null;
    }

    /**
     * Override to construct the concrete modifier. Called once the target
     * mesh is resolved.
     */
    protected createModifier(_mesh: MeshLike): Modifier3D | null
    {
        return null;   // Subclass override
    }

    /**
     * Override if the modifier needs per-frame `update(camera)` calls.
     * Return false (default) to skip the frame loop registration.
     */
    protected needsFrameUpdate(): boolean { return false; }

    /**
     * Per-frame callback invoked by the viewport's render loop. Default impl
     * calls `modifier.update?.(viewport.camera)` if the method exists.
     */
    protected onFrame(_dt: number): void
    {
        const m = this.modifier as Modifier3D & { update?: (cam: CameraLike) => void };
        if (m && typeof m.update === 'function' && this.viewport) {
            m.update(this.viewport.camera);
            this.viewport.invalidate?.();
        }
    }

    onCreated()       {}
    onBeforeMount()   {}

    onMount() {
        this.style.display = 'contents';
        queueMicrotask(() => {
            this.viewport = this.resolveViewport();
            if (!this.viewport) {
                console.warn(`[${this.tagName.toLowerCase()}] no <arianna-viewport-3d> ancestor`);
                return;
            }
            this.target = this.resolveTarget();
            if (!this.target) {
                console.warn(`[${this.tagName.toLowerCase()}] no target mesh resolved`);
                return;
            }
            this.modifier = this.createModifier(this.target);
            if (!this.modifier) return;

            this.modifier.apply();
            this.viewport.invalidate?.();

            if (this.needsFrameUpdate() && this.viewport.onFrame) {
                this.#frameUnsub = this.viewport.onFrame(dt => this.onFrame(dt));
            }
        });
    }

    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}

    onUnmount() {
        if (this.#frameUnsub) { this.#frameUnsub(); this.#frameUnsub = null; }
        this.modifier?.destroy();
        this.modifier = null;
        this.target   = null;
        this.viewport = null;
    }

    get enabled(): boolean  { return !this.hasAttribute('disabled'); }
    set enabled(v: boolean) { v ? this.removeAttribute('disabled') : this.setAttribute('disabled', ''); }

    /** Programmatic access to the resolved modifier (after mount). */
    getModifier(): Modifier3D | null { return this.modifier; }
}
