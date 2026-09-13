/**
 * @module    components/graphics/3D/modifiers/Base
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Base component module.
 */

declare const Component: any;
declare const Templates: any;



/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   Modifier3D
 *  @public
 *  @description Namespace containing Modifier3D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Modifier3D
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        // ── Three.ts-compatible structural type interfaces ──────────────────────────
        /** @interface   Vec3Like
         *  @public
         *  @description Vec3Like contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Vec3Like
        {
            /** @name        x
             *  @public
             *  @type        {number}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x: number;

            /** @name        y
             *  @public
             *  @type        {number}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y: number;

            /** @name        z
             *  @public
             *  @type        {number}
             *  @description Component member for z.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            z: number;
        }

        /** @interface   Geometry3Like
         *  @public
         *  @description Geometry3Like contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Geometry3Like
        {
            /** @name        vertices
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like[]}
             *  @description Component member for vertices.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            vertices: Modifier3D.Interfaces.Vec3Like[];

            /** @name        normals
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like[]}
             *  @description Component member for normals.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            normals: Modifier3D.Interfaces.Vec3Like[];

            /** @name        indices
             *  @public
             *  @type        {number[]}
             *  @description Component member for indices.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            indices: number[];

            /** @name        uvs
             *  @public
             *  @type        {[
                number,
                number
            ][]}
             *  @description Component member for uvs.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            uvs?: [
                number,
                number
            ][];

            /** @name        clone
             *  @public
             *  @type        {Modifier3D.Interfaces.Geometry3Like}
             *  @description Component member for clone.
             *  @returns     {Modifier3D.Interfaces.Geometry3Like} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clone(): Modifier3D.Interfaces.Geometry3Like;
        }

        /** @interface   MeshLike
         *  @public
         *  @description MeshLike contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MeshLike
        {
            /** @name        geometry
             *  @public
             *  @type        {Modifier3D.Interfaces.Geometry3Like}
             *  @description Component member for geometry.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            geometry: Modifier3D.Interfaces.Geometry3Like;

            /** @name        position
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position: Modifier3D.Interfaces.Vec3Like;

            /** @name        rotation
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for rotation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rotation: Modifier3D.Interfaces.Vec3Like;

            /** @name        scale
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for scale.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            scale: Modifier3D.Interfaces.Vec3Like;

            /** @name        visible
             *  @public
             *  @type        {boolean}
             *  @description Component member for visible.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            visible: boolean;

            /** @name        userData
             *  @public
             *  @type        {Record<string, unknown>}
             *  @description Component member for user Data.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            userData: Record<string, unknown>;

            /** @name        updateMatrix
             *  @public
             *  @type        {void}
             *  @description Component member for update Matrix.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            updateMatrix?(): void;
        }

        /** @interface   SceneLike
         *  @public
         *  @description SceneLike contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SceneLike
        {
            /** @name        children
             *  @public
             *  @type        {Modifier3D.Interfaces.MeshLike[]}
             *  @description Component member for children.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            children: Modifier3D.Interfaces.MeshLike[];

            /** @name        add
             *  @public
             *  @type        {void}
             *  @description Component member for add.
             *  @param       {Modifier3D.Interfaces.MeshLike} obj Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            add(obj: Modifier3D.Interfaces.MeshLike): void;

            /** @name        remove
             *  @public
             *  @type        {void}
             *  @description Component member for remove.
             *  @param       {Modifier3D.Interfaces.MeshLike} obj Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            remove(obj: Modifier3D.Interfaces.MeshLike): void;
        }

        /** @interface   CameraLike
         *  @public
         *  @description CameraLike contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CameraLike
        {
            /** @name        position
             *  @public
             *  @type        {Modifier3D.Interfaces.Vec3Like}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position: Modifier3D.Interfaces.Vec3Like;
        }

        /**
         * Minimal viewport surface a modifier expects. The real `arianna-viewport-3d`
         * implements this and more. See TODO_SECOND_PASS.md for the full contract.
         */
        export interface Viewport3DLike
        {
            /** @name        scene
             *  @public
             *  @type        {Modifier3D.Interfaces.SceneLike}
             *  @description Component member for scene.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            scene: Modifier3D.Interfaces.SceneLike;

            /** @name        camera
             *  @public
             *  @type        {Modifier3D.Interfaces.CameraLike}
             *  @description Component member for camera.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            camera: Modifier3D.Interfaces.CameraLike;

            /** @name        canvas
             *  @public
             *  @type        {HTMLCanvasElement}
             *  @description Component member for canvas.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            canvas?: HTMLCanvasElement;

            /** @name        findMesh
             *  @public
             *  @type        {Modifier3D.Interfaces.MeshLike | null}
             *  @description Component member for find Mesh.
             *  @param       {string} id Parameter.
             *  @returns     {Modifier3D.Interfaces.MeshLike | null} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            findMesh(id: string): Modifier3D.Interfaces.MeshLike | null;

            /** @name        onFrame
             *  @public
             *  @type        {() => void}
             *  @description Component member for on Frame.
             *  @param       {(dt: number) => void} cb Parameter.
             *  @returns     {() => void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            onFrame?(cb: (dt: number) => void): () => void;

            /** @name        invalidate
             *  @public
             *  @type        {void}
             *  @description Component member for invalidate.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            invalidate?(): void;
        }
    }
    // ── Geometry helpers ──────────────────────────────────────────────────────────
    export function _v3(x: number, y: number, z: number): Modifier3D.Interfaces.Vec3Like { return { x, y, z }; }
    export function _vAdd(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
    export function _vSub(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
    export function _vScale(v: Modifier3D.Interfaces.Vec3Like, s: number): Modifier3D.Interfaces.Vec3Like { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
    export function _vLen(v: Modifier3D.Interfaces.Vec3Like): number { return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2); }

    /** @name        l
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned l value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function _vNorm(v: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { const l = _vLen(v) || 1; return _vScale(v, 1 / l); }
    export function _vCross(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like): Modifier3D.Interfaces.Vec3Like { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
    export function _vLerp(a: Modifier3D.Interfaces.Vec3Like, b: Modifier3D.Interfaces.Vec3Like, t: number): Modifier3D.Interfaces.Vec3Like { return _vAdd(a, _vScale(_vSub(b, a), t)); }
    export function _cloneGeom(g: Modifier3D.Interfaces.Geometry3Like): Modifier3D.Interfaces.Geometry3Like {
        return {
            vertices: g.vertices.map(v => ({ ...v })),
            normals: g.normals.map(v => ({ ...v })),
            indices: [...g.indices],
            uvs: g.uvs ? g.uvs.map(uv => [...uv] as [
                number,
                number
            ]) : undefined,
            /** @name        clone
             *  @public
             *  @type        {void}
             *  @description Component member for clone.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clone() { return _cloneGeom(this); },
        };
    }
    export function _recomputeNormals(g: Modifier3D.Interfaces.Geometry3Like): void {
        /** @name        normals
         *  @public
         *  @type        {Modifier3D.Interfaces.Vec3Like[]}
         *  @description Namespace-owned normals value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const normals: Modifier3D.Interfaces.Vec3Like[] = Array.from({ length: g.vertices.length }, () => _v3(0, 0, 0));
        for (let i = 0; i < g.indices.length; i += 3)
        {
            /** @name        [ia, ib, ic]
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned [ia, ib, ic] value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const [ia, ib, ic] = g.indices.slice(i, i + 3);

            /** @name        n
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned n value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const n = _vNorm(_vCross(_vSub(g.vertices[ib], g.vertices[ia]), _vSub(g.vertices[ic], g.vertices[ia])));
            [ia, ib, ic].forEach(idx => { normals[idx] = _vAdd(normals[idx], n); });
        }
        g.normals = normals.map(_vNorm);
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
    type PanelControlType = 'range' | 'select' | 'toggle';

    interface PanelControl
    {
        attr: string;
        label: string;
        type: PanelControlType;
        min?: number;
        max?: number;
        step?: number;
        value?: string | number | boolean;
        options?: readonly string[];
        suffix?: string;
    }

    interface PanelSchema
    {
        title: string;
        subtitle: string;
        controls: readonly PanelControl[];
    }

    const PanelSchemas: Readonly<Record<string, PanelSchema>> = Object.freeze({
        'arianna-array': {
            title:'Array', subtitle:'Linear / radial instances', controls:[
                {attr:'count',label:'Count',type:'range',min:1,max:12,step:1,value:5},
                {attr:'type',label:'Type',type:'select',value:'linear',options:['linear','radial']},
                {attr:'offset-x',label:'Offset X',type:'range',min:-3,max:3,step:.05,value:1.25},
                {attr:'offset-y',label:'Offset Y',type:'range',min:-3,max:3,step:.05,value:0},
                {attr:'offset-z',label:'Offset Z',type:'range',min:-3,max:3,step:.05,value:0},
                {attr:'radius',label:'Radius',type:'range',min:.5,max:5,step:.05,value:2.4},
                {attr:'axis',label:'Axis',type:'select',value:'y',options:['x','y','z']},
            ]
        },
        'arianna-bend': {
            title:'Bend', subtitle:'Curve geometry along an axis', controls:[
                {attr:'angle',label:'Angle',type:'range',min:-3.14,max:3.14,step:.01,value:1.35,suffix:' rad'},
                {attr:'axis',label:'Axis',type:'select',value:'y',options:['x','y','z']},
            ]
        },
        'arianna-bevel': {
            title:'Bevel', subtitle:'Chamfer / soften edges', controls:[
                {attr:'amount',label:'Amount',type:'range',min:0,max:.45,step:.01,value:.12},
                {attr:'segments',label:'Segments',type:'range',min:1,max:6,step:1,value:2},
            ]
        },
        'arianna-billboard': {
            title:'Billboard', subtitle:'Face the active camera', controls:[
                {attr:'lock-x',label:'Lock X',type:'toggle',value:false},
                {attr:'lock-y',label:'Lock Y',type:'toggle',value:false},
                {attr:'lock-z',label:'Lock Z',type:'toggle',value:false},
            ]
        },
        'arianna-decimate': {
            title:'Decimate', subtitle:'Reduce triangle density', controls:[
                {attr:'ratio',label:'Ratio',type:'range',min:.05,max:1,step:.05,value:.45},
            ]
        },
        'arianna-drag': {
            title:'Drag', subtitle:'Move the target mesh on a plane', controls:[
                {attr:'plane',label:'Plane',type:'select',value:'xz',options:['xz','xy','yz']},
            ]
        },
        'arianna-fade': {
            title:'Fade', subtitle:'Distance-based visibility', controls:[
                {attr:'near',label:'Near',type:'range',min:1,max:10,step:.1,value:3.5},
                {attr:'far',label:'Far',type:'range',min:2,max:16,step:.1,value:8},
            ]
        },
        'arianna-inflate': {
            title:'Inflate', subtitle:'Move vertices along normals', controls:[
                {attr:'amount',label:'Amount',type:'range',min:-.6,max:.8,step:.01,value:.18},
            ]
        },
        'arianna-lod': {
            title:'LOD', subtitle:'Automatic geometry detail by distance', controls:[
                {attr:'near',label:'High ≤',type:'range',min:2,max:8,step:.1,value:4.5},
                {attr:'mid',label:'Medium ≤',type:'range',min:4,max:12,step:.1,value:7},
                {attr:'far',label:'Low ≤',type:'range',min:6,max:18,step:.1,value:11},
            ]
        },
        'arianna-mirror': {
            title:'Mirror', subtitle:'Mirror geometry on an axis', controls:[
                {attr:'axis',label:'Axis',type:'select',value:'x',options:['x','y','z']},
                {attr:'merge',label:'Merge',type:'toggle',value:true},
                {attr:'threshold',label:'Weld ε',type:'range',min:.0001,max:.05,step:.0001,value:.001},
            ]
        },
        'arianna-smooth': {
            title:'Smooth', subtitle:'Laplacian surface smoothing', controls:[
                {attr:'iterations',label:'Iterations',type:'range',min:1,max:8,step:1,value:2},
                {attr:'factor',label:'Factor',type:'range',min:.05,max:.95,step:.05,value:.4},
            ]
        },
        'arianna-snap': {
            title:'Snap', subtitle:'Quantize transform', controls:[
                {attr:'pos-grid',label:'Position grid',type:'range',min:.05,max:2,step:.05,value:.5},
                {attr:'rot-grid-deg',label:'Rotation grid',type:'range',min:1,max:90,step:1,value:15,suffix:'°'},
            ]
        },
        'arianna-subdivision': {
            title:'Subdivision', subtitle:'Midpoint subdivision surface', controls:[
                {attr:'iterations',label:'Iterations',type:'range',min:0,max:3,step:1,value:1},
            ]
        },
        'arianna-twist': {
            title:'Twist', subtitle:'Twist geometry around an axis', controls:[
                {attr:'angle',label:'Angle',type:'range',min:-6.28,max:6.28,step:.01,value:2.4,suffix:' rad'},
                {attr:'axis',label:'Axis',type:'select',value:'y',options:['x','y','z']},
            ]
        },
        'arianna-wave': {
            title:'Wave', subtitle:'Sinusoidal displacement', controls:[
                {attr:'amplitude',label:'Amplitude',type:'range',min:0,max:.8,step:.01,value:.25},
                {attr:'frequency',label:'Frequency',type:'range',min:.25,max:10,step:.05,value:4},
                {attr:'axis',label:'Displace',type:'select',value:'y',options:['x','y','z']},
                {attr:'direction',label:'Direction',type:'select',value:'x',options:['x','z']},
                {attr:'animate',label:'Animate',type:'toggle',value:true},
            ]
        },
    });

    function EnsurePanelStyles(): void
    {
        if(typeof document === 'undefined' || document.getElementById('arianna-modifier-3d-panel-styles')) return;
        const style=document.createElement('style');
        style.id='arianna-modifier-3d-panel-styles';
        style.textContent=`
arianna-modifier-3d,arianna-array,arianna-bend,arianna-bevel,arianna-billboard,arianna-decimate,arianna-drag,arianna-fade,arianna-inflate,arianna-lod,arianna-mirror,arianna-smooth,arianna-snap,arianna-subdivision,arianna-twist,arianna-wave{box-sizing:border-box;position:absolute;top:14px;right:14px;z-index:25;width:272px;max-height:calc(100% - 28px);overflow:auto;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:rgba(24,27,31,.94);box-shadow:0 18px 50px rgba(0,0,0,.32);backdrop-filter:blur(14px);color:#edf0f3;font:12px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;pointer-events:auto}
.ar-mod3d__head{display:flex;align-items:center;gap:9px;padding:10px 11px;border-bottom:1px solid rgba(255,255,255,.1);cursor:move;user-select:none;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012))}
.ar-mod3d__titles{min-width:0;flex:1}.ar-mod3d__title{display:block;font-size:12px;font-weight:750;color:#fff}.ar-mod3d__sub{display:block;margin-top:1px;font-size:9px;color:#8f98a2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ar-mod3d__enabled{display:flex;align-items:center;gap:5px;color:#9da6ae;font-size:9px}.ar-mod3d__enabled input{accent-color:#e40c88}
.ar-mod3d__body{display:grid;gap:9px;padding:11px}.ar-mod3d__row{display:grid;grid-template-columns:86px minmax(0,1fr) 48px;align-items:center;gap:7px}.ar-mod3d__row--select{grid-template-columns:86px minmax(0,1fr)}.ar-mod3d__row--toggle{grid-template-columns:1fr auto}.ar-mod3d__label{color:#aeb6bd;font-size:10px}.ar-mod3d__value{box-sizing:border-box;width:100%;min-width:0;text-align:right;color:#f0f2f4;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;background:#171b1e;border:1px solid #464c53;border-radius:5px;padding:4px 5px}.ar-mod3d__range{width:100%;accent-color:#e40c88}.ar-mod3d__resize{position:absolute;z-index:50;background:transparent;border:0;pointer-events:auto;touch-action:none;user-select:none}.ar-mod3d__resize[data-edge="n"]{left:12px;right:12px;top:0;height:8px;cursor:n-resize}.ar-mod3d__resize[data-edge="s"]{left:12px;right:12px;bottom:0;height:8px;cursor:s-resize}.ar-mod3d__resize[data-edge="e"]{right:0;top:12px;bottom:12px;width:8px;cursor:e-resize}.ar-mod3d__resize[data-edge="w"]{left:0;top:12px;bottom:12px;width:8px;cursor:w-resize}.ar-mod3d__resize[data-edge="ne"]{right:0;top:0;width:14px;height:14px;cursor:ne-resize}.ar-mod3d__resize[data-edge="nw"]{left:0;top:0;width:14px;height:14px;cursor:nw-resize}.ar-mod3d__resize[data-edge="se"]{right:0;bottom:0;width:14px;height:14px;cursor:se-resize}.ar-mod3d__resize[data-edge="sw"]{left:0;bottom:0;width:14px;height:14px;cursor:sw-resize}.ar-mod3d__select{width:100%;min-height:28px;border:1px solid #464c53;border-radius:6px;background:#22262b;color:#e8ebee;padding:4px 7px;font:10px system-ui}.ar-mod3d__toggle{accent-color:#e40c88}.ar-mod3d__foot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 11px;border-top:1px solid rgba(255,255,255,.09)}.ar-mod3d__badge{color:#8f98a2;font:9px ui-monospace,SFMono-Regular,Menlo,monospace}.ar-mod3d__reset{appearance:none;border:1px solid #4b5158;border-radius:6px;background:#2b3035;color:#d9dde1;padding:5px 8px;font:700 9px system-ui;cursor:pointer}.ar-mod3d__reset:hover{border-color:#e40c88;color:#fff}
`;
        document.head.append(style);
    }

    interface ModifierElementRuntime
    {
        viewport:Modifier3D.Interfaces.Viewport3DLike|null;
        target:Modifier3D.Interfaces.MeshLike|null;
        modifier:Modifier3D|null;
        frameUnsub:(()=>void)|null;
        baseGeometry:Modifier3D.Interfaces.Geometry3Like|null;
        baseTransform:{position:Modifier3D.Interfaces.Vec3Like;rotation:Modifier3D.Interfaces.Vec3Like;scale:Modifier3D.Interfaces.Vec3Like;visible:boolean}|null;
        bound:boolean;
        refreshQueued:boolean;
        panelReady:boolean;
    }
    const ModifierElementStates=new WeakMap<HTMLElement,ModifierElementRuntime>();
    const ElementState=(host:HTMLElement):ModifierElementRuntime=>
    {
        let s=ModifierElementStates.get(host);
        if(!s){s={viewport:null,target:null,modifier:null,frameUnsub:null,baseGeometry:null,baseTransform:null,bound:false,refreshQueued:false,panelReady:false};ModifierElementStates.set(host,s);}
        return s;
    };

    @Component('arianna-modifier-3d', {}, {
        Shadow:false,
        Attributes: ['viewport','for','enabled','disabled'],
    })
    export class Modifier3DElement extends HTMLElement
    {
        template = html``;
        protected get viewport():Modifier3D.Interfaces.Viewport3DLike|null{return ElementState(this).viewport;}
        protected set viewport(v:Modifier3D.Interfaces.Viewport3DLike|null){ElementState(this).viewport=v;}
        protected get target():Modifier3D.Interfaces.MeshLike|null{return ElementState(this).target;}
        protected set target(v:Modifier3D.Interfaces.MeshLike|null){ElementState(this).target=v;}
        protected get modifier():Modifier3D|null{return ElementState(this).modifier;}
        protected set modifier(v:Modifier3D|null){ElementState(this).modifier=v;}

        onConnected(): void
        {
            EnsurePanelStyles();
            const type=this.constructor.name||'Modifier3DElement';
            for(const cls of Array.from(this.classList))if(cls.startsWith('__real-'))this.classList.remove(cls);
            this.classList.add(type,'Modifier3DPanel');
            if(!this.id){const g=globalThis as typeof globalThis&{__AriannaComponentIds?:Record<string,number>};const ids=g.__AriannaComponentIds??=Object.create(null);this.id=`${type}-${ids[type]=(ids[type]??0)+1}`;}
            this.renderPanel();
            this.bindSoon();
        }
        onCreated(): void { if(this.isConnected) this.onConnected(); }
        onMount(): void { this.onConnected(); }
        onBeforeMount(): void {}
        onBeforeUpdate(): void {}
        onUpdate(): void {}
        onBeforeUnmount(): void {}

        onAttributeChanged(): void
        {
            if(!this.isConnected) return;
            this.syncPanel();
            this.scheduleRefresh();
        }

        protected resolveViewport(): Modifier3D.Interfaces.Viewport3DLike | null
        {
            const ref=(this.getAttribute('viewport')??'').trim();
            if(ref){const el=document.getElementById(ref);if(el)return el as unknown as Modifier3D.Interfaces.Viewport3DLike;}
            const ancestor=this.closest('arianna-canvas-3d,arianna-viewport-3d');
            if(ancestor)return ancestor as unknown as Modifier3D.Interfaces.Viewport3DLike;
            let sib:Element|null=this.previousElementSibling;
            while(sib){if(sib.matches('arianna-canvas-3d,arianna-viewport-3d'))return sib as unknown as Modifier3D.Interfaces.Viewport3DLike;sib=sib.previousElementSibling;}
            const parent=this.parentElement?.querySelector('arianna-canvas-3d,arianna-viewport-3d');
            return parent?parent as unknown as Modifier3D.Interfaces.Viewport3DLike:null;
        }
        protected resolveTarget(): Modifier3D.Interfaces.MeshLike | null
        {
            const id=(this.getAttribute('for')??'').trim();if(id)return this.viewport?.findMesh(id)??null;const children=(this.viewport as unknown as {scene?:{children?:Modifier3D.Interfaces.MeshLike[]}})?.scene?.children??[];return children.length===1?children[0]??null:null;
        }
        protected createModifier(_mesh: Modifier3D.Interfaces.MeshLike): Modifier3D | null { return null; }
        protected needsFrameUpdate(): boolean { return false; }
        protected onFrame(dt:number): void
        {
            const m=this.modifier as Modifier3D&{update?:(cam:Modifier3D.Interfaces.CameraLike,dt?:number)=>void};
            if(m&&typeof m.update==='function'&&this.viewport){m.update(this.viewport.camera,dt);this.viewport.invalidate?.();}
        }
        protected restoreTarget(): void
        {
            const s=ElementState(this);if(!s.target)return;
            if(s.baseGeometry)s.target.geometry=_cloneGeom(s.baseGeometry);
            if(s.baseTransform){s.target.position={...s.baseTransform.position};s.target.rotation={...s.baseTransform.rotation};s.target.scale={...s.baseTransform.scale};s.target.visible=s.baseTransform.visible;delete s.target.userData['_arianna_opacity'];}
        }
        protected refreshModifier(): void
        {
            const s=ElementState(this);if(!s.bound||!s.target||!s.viewport)return;
            s.frameUnsub?.();s.frameUnsub=null;s.modifier?.destroy();this.restoreTarget();
            s.modifier=this.createModifier(s.target);if(!s.modifier){s.viewport.invalidate?.();return;}
            if(!this.enabled)s.modifier.disable();s.modifier.apply();
            if(this.enabled&&this.needsFrameUpdate()&&s.viewport.onFrame)s.frameUnsub=s.viewport.onFrame(dt=>this.onFrame(dt));
            s.viewport.invalidate?.();this.dispatchEvent(new CustomEvent('arianna:modifier-3d-change',{bubbles:true,detail:{modifier:this.localName,attributes:Object.fromEntries(Array.from(this.attributes).map(a=>[a.name,a.value]))}}));
        }
        private scheduleRefresh(): void
        {
            const s=ElementState(this);if(s.refreshQueued)return;s.refreshQueued=true;queueMicrotask(()=>{s.refreshQueued=false;this.refreshModifier();});
        }
        private bindSoon(): void
        {
            const s=ElementState(this);if(s.bound)return;
            queueMicrotask(()=>{const state=ElementState(this);if(state.bound||!this.isConnected)return;state.viewport=this.resolveViewport();if(!state.viewport){console.warn(`[${this.localName}] no Canvas3D/viewport resolved`);return;}state.target=this.resolveTarget();if(!state.target){console.warn(`[${this.localName}] target mesh not found`);return;}state.baseGeometry=_cloneGeom(state.target.geometry);state.baseTransform={position:{...state.target.position},rotation:{...state.target.rotation},scale:{...state.target.scale},visible:state.target.visible};state.bound=true;this.refreshModifier();});
        }
        private schema(): PanelSchema{return PanelSchemas[this.localName]??{title:'Modifier 3D',subtitle:'Declarative modifier',controls:[]};}
        private ensureDefaults(schema:PanelSchema): void
        {
            for(const control of schema.controls){if(control.type==='toggle'){if(control.value===true&&!this.hasAttribute(control.attr))this.setAttribute(control.attr,'');continue;}if(!this.hasAttribute(control.attr)&&control.value!==undefined)this.setAttribute(control.attr,String(control.value));}
        }
        private renderPanel(): void
        {
            const state=ElementState(this);if(state.panelReady){this.syncPanel();return;}
            const schema=this.schema();this.ensureDefaults(schema);this.replaceChildren();
            const head=document.createElement('header');head.className='ar-mod3d__head';const titles=document.createElement('div');titles.className='ar-mod3d__titles';const title=document.createElement('strong');title.className='ar-mod3d__title';title.textContent=schema.title;const sub=document.createElement('span');sub.className='ar-mod3d__sub';sub.textContent=schema.subtitle;titles.append(title,sub);
            const enabledLabel=document.createElement('label');enabledLabel.className='ar-mod3d__enabled';const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=this.enabled;enabled.dataset.role='enabled';enabled.addEventListener('change',()=>{this.enabled=enabled.checked;this.scheduleRefresh();});enabledLabel.append(enabled,document.createTextNode('Enabled'));head.append(titles,enabledLabel);
            const body=document.createElement('div');body.className='ar-mod3d__body';for(const control of schema.controls)body.appendChild(this.makeControl(control));
            const foot=document.createElement('footer');foot.className='ar-mod3d__foot';const badge=document.createElement('span');badge.className='ar-mod3d__badge';badge.textContent='AriannA · 3D';const reset=document.createElement('button');reset.type='button';reset.className='ar-mod3d__reset';reset.textContent='Reset';reset.addEventListener('click',()=>{for(const c of schema.controls)this.removeAttribute(c.attr);this.ensureDefaults(schema);this.syncPanel();this.scheduleRefresh();});foot.append(badge,reset);this.append(head,body,foot);this.wirePanelDrag(head);this.installPanelResize();state.panelReady=true;this.syncPanel();
        }
        private makeControl(control:PanelControl): HTMLElement
        {
            const row=document.createElement('label');row.className=`ar-mod3d__row ar-mod3d__row--${control.type}`;const label=document.createElement('span');label.className='ar-mod3d__label';label.textContent=control.label;
            if(control.type==='range'){
                const input=document.createElement('input');input.type='range';input.className='ar-mod3d__range';input.dataset.attr=control.attr;if(control.min!==undefined)input.min=String(control.min);if(control.max!==undefined)input.max=String(control.max);if(control.step!==undefined)input.step=String(control.step);
                const value=document.createElement('input');value.type='number';value.className='ar-mod3d__value';value.dataset.valueFor=control.attr;if(control.min!==undefined)value.min=String(control.min);if(control.max!==undefined)value.max=String(control.max);if(control.step!==undefined)value.step=String(control.step);
                const apply=(raw:string)=>{const n=Number(raw);if(!Number.isFinite(n))return;input.value=String(n);value.value=String(n);this.setAttribute(control.attr,String(n));this.scheduleRefresh();};
                input.addEventListener('input',()=>apply(input.value));value.addEventListener('input',()=>apply(value.value));value.addEventListener('change',()=>apply(value.value));row.append(label,input,value);return row;
            }
            if(control.type==='select'){row.classList.add('ar-mod3d__row--select');const select=document.createElement('select');select.className='ar-mod3d__select';select.dataset.attr=control.attr;for(const option of control.options??[]){const o=document.createElement('option');o.value=option;o.textContent=option;select.appendChild(o);}select.addEventListener('change',()=>{this.setAttribute(control.attr,select.value);this.scheduleRefresh();});row.append(label,select);return row;}
            row.classList.add('ar-mod3d__row--toggle');const toggle=document.createElement('input');toggle.type='checkbox';toggle.className='ar-mod3d__toggle';toggle.dataset.attr=control.attr;toggle.addEventListener('change',()=>{if(toggle.checked)this.setAttribute(control.attr,'');else this.removeAttribute(control.attr);this.scheduleRefresh();});row.append(label,toggle);return row;
        }
        private syncPanel(): void
        {
            const schema=this.schema();const enabled=this.querySelector<HTMLInputElement>('[data-role="enabled"]');if(enabled)enabled.checked=this.enabled;
            for(const control of schema.controls){const input=this.querySelector<HTMLInputElement|HTMLSelectElement>(`[data-attr="${control.attr}"]`);if(!input)continue;if(input instanceof HTMLInputElement&&input.type==='checkbox')input.checked=this.hasAttribute(control.attr)&&this.getAttribute(control.attr)!=='false';else input.value=this.getAttribute(control.attr)??String(control.value??'');const value=this.querySelector<HTMLInputElement>(`[data-value-for="${control.attr}"]`);if(value)value.value=String(this.getAttribute(control.attr)??control.value??'');}
        }
        private wirePanelDrag(handle:HTMLElement): void
        {
            let active=false,dx=0,dy=0;handle.addEventListener('pointerdown',(event)=>{if((event.target as Element).closest('input,button,select,label'))return;active=true;const r=this.getBoundingClientRect();dx=event.clientX-r.left;dy=event.clientY-r.top;this.style.left=`${this.offsetLeft}px`;this.style.top=`${this.offsetTop}px`;this.style.right='auto';handle.setPointerCapture(event.pointerId);});handle.addEventListener('pointermove',(event)=>{if(!active)return;const p=this.offsetParent as HTMLElement|null,pr=p?.getBoundingClientRect();if(!pr)return;const maxX=Math.max(0,pr.width-this.offsetWidth),maxY=Math.max(0,pr.height-this.offsetHeight);this.style.left=`${Math.max(0,Math.min(maxX,event.clientX-pr.left-dx))}px`;this.style.top=`${Math.max(0,Math.min(maxY,event.clientY-pr.top-dy))}px`;});const end=()=>{active=false;};handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
        }
        private installPanelResize(): void
        {
            const edges=['n','ne','e','se','s','sw','w','nw'] as const;
            for(const edge of edges)
            {
                const handle=document.createElement('span');handle.className='ar-mod3d__resize';handle.dataset.edge=edge;handle.setAttribute('aria-hidden','true');
                let pid=-1,startX=0,startY=0,startLeft=0,startTop=0,startWidth=0,startHeight=0;
                const move=(event:PointerEvent)=>{
                    if(event.pointerId!==pid)return;
                    const parent=this.offsetParent as HTMLElement|null,pr=parent?.getBoundingClientRect();if(!pr)return;
                    const dx=event.clientX-startX,dy=event.clientY-startY;let left=startLeft,top=startTop,width=startWidth,height=startHeight;
                    if(edge.includes('e'))width=Math.max(220,startWidth+dx);
                    if(edge.includes('s'))height=Math.max(140,startHeight+dy);
                    if(edge.includes('w')){width=Math.max(220,startWidth-dx);left=startLeft+(startWidth-width);}
                    if(edge.includes('n')){height=Math.max(140,startHeight-dy);top=startTop+(startHeight-height);}
                    left=Math.max(0,left);top=Math.max(0,top);width=Math.min(width,Math.max(220,pr.width-left));height=Math.min(height,Math.max(140,pr.height-top));
                    this.style.left=`${Math.round(left)}px`;this.style.top=`${Math.round(top)}px`;this.style.right='auto';this.style.width=`${Math.round(width)}px`;this.style.height=`${Math.round(height)}px`;this.style.maxHeight='none';
                };
                const end=(event:PointerEvent)=>{if(event.pointerId!==pid)return;try{handle.releasePointerCapture(pid);}catch{}handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);pid=-1;};
                handle.addEventListener('pointerdown',(event)=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();pid=event.pointerId;startX=event.clientX;startY=event.clientY;startLeft=this.offsetLeft;startTop=this.offsetTop;startWidth=this.offsetWidth;startHeight=this.offsetHeight;this.style.left=`${startLeft}px`;this.style.top=`${startTop}px`;this.style.right='auto';this.style.width=`${startWidth}px`;this.style.height=`${startHeight}px`;this.style.maxHeight='none';try{handle.setPointerCapture(pid);}catch{}handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);});
                this.appendChild(handle);
            }
        }
        onUnmount(): void
        {
            const s=ElementState(this);s.frameUnsub?.();s.frameUnsub=null;s.modifier?.destroy();s.modifier=null;this.restoreTarget();s.target=null;s.viewport=null;s.bound=false;
        }
        get enabled(): boolean{const explicit=this.getAttribute('enabled');if(explicit==='false')return false;return !this.hasAttribute('disabled');}
        set enabled(v:boolean){if(v){this.removeAttribute('disabled');if(this.getAttribute('enabled')==='false')this.setAttribute('enabled','true');}else this.setAttribute('disabled','');}
        getModifier(): Modifier3D | null { return ElementState(this).modifier; }
    }
    // ── Programmatic core (plain class — Modifier3D) ─────────────────────────────
    /**
     * Programmatic 3D modifier core. Subclasses MUST implement `apply()` which
     * mutates `this.mesh` (typically via geometry clone + recompute normals).
     *
     * The declarative custom-element wrapper (`Modifier3DElement` below) holds
     * an instance of this class and delegates lifecycle to it.
     */
    export abstract class Modifier3D
    {
        /** Sentinel mesh used by declarative custom elements before mount-time
         *  binding. Replaced via `bindMesh()` once the viewport resolves it. */
        static readonly UNBOUND_MESH: Interfaces.MeshLike = {
            /** @name        clone
             *  @public
             *  @type        {void}
             *  @description Component member for clone.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            geometry: { vertices: [], normals: [], indices: [], clone() { return { ...this, clone: this.clone }; } },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            visible: true,
            userData: {},
        };

        /** @name        mesh
         *  @protected
         *  @type        {Modifier3D.Interfaces.MeshLike}
         *  @description Component member for mesh.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected mesh: Interfaces.MeshLike;

        /** @name        enabled
         *  @protected
         *  @type        {unknown}
         *  @description Component member for enabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected enabled = true;

        /** @name        cleanups
         *  @protected
         *  @type        {(() => void)[]}
         *  @description Component member for cleanups.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected cleanups: (() => void)[] = [];

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Modifier3D.Interfaces.MeshLike} mesh Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(mesh: Interfaces.MeshLike) { this.mesh = mesh; }

        /** Late-bind the target mesh (used by declarative custom-element wrapper). */
        bindMesh(mesh: Interfaces.MeshLike): this { this.mesh = mesh; return this; }

        /** @name        enable
         *  @public
         *  @type        {this}
         *  @description Component member for enable.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        enable(): this { this.enabled = true; return this; }

        /** @name        disable
         *  @public
         *  @type        {this}
         *  @description Component member for disable.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        disable(): this { this.enabled = false; return this; }

        /** @name        isEnabled
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Enabled.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        isEnabled(): boolean { return this.enabled; }

        /** @name        destroy
         *  @public
         *  @type        {void}
         *  @description Component member for destroy.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        destroy(): void
        {
            for (const fn of this.cleanups)
            {
                try
                {
                    fn();
                }
                catch (e)
                {
                    console.warn('[Modifier3D] cleanup error', e);
                }
            }
            this.cleanups = [];
        }

        /** @name        apply
         *  @public
         *  @type        {this}
         *  @description Component member for apply.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        abstract apply(): this;
    }
}
