/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/modifiers/3D/DragModifier
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Mouse-drag a mesh in world space on a chosen plane.
 *
 * Programmatic form takes `(mesh, canvas, camera, plane)`. Declarative form
 * resolves canvas + camera from the parent viewport. Plane drag math is
 * coarse pixel→world (0.01 units/px); when the viewport is ready, this can
 * be replaced by `viewport.raycast()` for true world-space picking.
 *
 * @example HTML
 *   <arianna-drag for="m1" plane="xz"></arianna-drag>
 *
 * @example JS
 *   new DragModifier(mesh, canvas, camera, 'xz').onDrag((m, p) => console.log(p));
 *
 * Events:
 *   - arianna:drag   detail: { mesh, position }   (declarative form only)
 *
 * Attributes (declarative): for, plane, enabled
 */
import { Component } from '../../../core/index.ts';
import { Modifier3D, Modifier3DElement, type MeshLike, type CameraLike, type Vec3Like, } from './Base.ts';
export type DragCallback3D = (mesh: MeshLike, pos: Vec3Like) => void;
export class DragModifier extends Modifier3D {
    #canvas: HTMLCanvasElement;
    #plane: 'xy' | 'xz' | 'yz';
    #callbacks: DragCallback3D[] = [];
    constructor(mesh: MeshLike, canvas: HTMLCanvasElement, _camera: CameraLike, plane: 'xy' | 'xz' | 'yz' = 'xz') {
        super(mesh);
        this.#canvas = canvas;
        this.#plane = plane;
        this.#wire();
    }
    apply(): this { return this; }
    onDrag(cb: DragCallback3D): this { this.#callbacks.push(cb); return this; }
    #wire(): void {
        let dragging = false, startMX = 0, startMY = 0;
        let startPos = { ...this.mesh.position };
        const scale = 0.01;
        const onDown = (e: MouseEvent) => {
            if (!this.enabled)
                return;
            dragging = true;
            startMX = e.clientX;
            startMY = e.clientY;
            startPos = { ...this.mesh.position };
        };
        const onMove = (e: MouseEvent) => {
            if (!dragging || !this.enabled)
                return;
            const dx = (e.clientX - startMX) * scale;
            const dy = (e.clientY - startMY) * scale;
            if (this.#plane === 'xz') {
                this.mesh.position.x = startPos.x + dx;
                this.mesh.position.z = startPos.z + dy;
            }
            else if (this.#plane === 'xy') {
                this.mesh.position.x = startPos.x + dx;
                this.mesh.position.y = startPos.y - dy;
            }
            else {
                this.mesh.position.y = startPos.y - dy;
                this.mesh.position.z = startPos.z + dx;
            }
            this.#callbacks.forEach(cb => cb(this.mesh, { ...this.mesh.position }));
        };
        const onUp = () => { dragging = false; };
        this.#canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        this.cleanups.push(() => {
            this.#canvas.removeEventListener('mousedown', onDown);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        });
    }
}
@Component('arianna-drag', {}, {
    Attributes: ['for', 'plane', 'enabled'],
})
export class DragModifierElement extends Modifier3DElement {
    protected createModifier(mesh: MeshLike): Modifier3D | null {
        const vp = this.viewport;
        if (!vp || !vp.canvas) {
            console.warn('[arianna-drag] viewport has no canvas; drag disabled');
            return null;
        }
        const plane = ((this.getAttribute('plane') ?? 'xz') as 'xy' | 'xz' | 'yz');
        const drag = new DragModifier(mesh, vp.canvas, vp.camera, plane);
        drag.onDrag((m, p) => {
            this.dispatchEvent(new CustomEvent('arianna:drag', {
                bubbles: true, detail: { mesh: m, position: p },
            }));
        });
        return drag;
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * DragModifier namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace DragModifier {
    export namespace Types {
        export type DragCallback3DType = DragCallback3D;
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * DragModifierElement namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace DragModifierElement {
}
export default DragModifier;
