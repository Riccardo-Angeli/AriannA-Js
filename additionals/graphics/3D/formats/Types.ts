export interface ModelLoadOptions {
        baseURL?:string;
        signal?:AbortSignal;
        resolveResource?:(uri:string)=>Promise<ArrayBuffer>;
        maxBytes?:number;
        /** FBX units are converted to metres and axes to Y-up by default. */
        convertAxes?:boolean;
        unitScale?:number;
        inflate?:(bytes:Uint8Array)=>Promise<Uint8Array>;
    }

export interface ModelPrimitive extends Mesh3DLike {
        name:string;node?:number|string;material?:number|string;matrix:number[];mode:number;
        attributes?:Record<string,Float32Array>;targets?:Record<string,Float32Array>[];
    }

export interface Model3DAsset extends Mesh3DLike {
        primitives:ModelPrimitive[];
        materials:Record<string,unknown>[];
        nodes:Record<string,unknown>[];
        animations:Record<string,unknown>[];
        skins:Record<string,unknown>[];
        images:Record<string,unknown>[];
        warnings:string[];
        source:unknown;
    }

export interface Mesh3DLike
    {
        positions     : Float32Array;
        normals?      : Float32Array;
        colors?       : Float32Array;
        uvs?          : Float32Array;
        indices?      : Uint32Array | Uint16Array;
        format        : 'ply' | 'obj' | 'stl' | 'gltf' | 'glb' | 'fbx';
        vertexCount   : number;
        triangleCount : number;
    }

export type DXFEntity =
        | { type: 'LINE';        x1: number; y1: number; x2: number; y2: number; layer: string; color?: number }
        | { type: 'CIRCLE';      cx: number; cy: number; r: number; layer: string; color?: number }
        | { type: 'ARC';         cx: number; cy: number; r: number; startAngle: number; endAngle: number; layer: string; color?: number }
        | { type: 'POLYLINE';    points: [number, number][]; closed: boolean; layer: string; color?: number }
        | { type: 'LWPOLYLINE';  points: [number, number][]; closed: boolean; layer: string; color?: number }
        | { type: 'TEXT';        x: number; y: number; height: number; value: string; layer: string; color?: number }
        | { type: 'MTEXT';       x: number; y: number; height: number; value: string; layer: string; color?: number }
        | { type: 'POINT';       x: number; y: number; layer: string; color?: number }
        | { type: 'ELLIPSE';     cx: number; cy: number; rx: number; ry: number; rotation: number; layer: string; color?: number }
        | { type: 'INSERT';      x: number; y: number; blockName: string; layer: string };

export interface DXFEntityList
    {
        entities : DXFEntity[];
        layers   : Map<string, { color: number; name: string }>;
        bounds   : { minX: number; minY: number; maxX: number; maxY: number };
    }

export interface DxfToSvgOptions
    {
        width?      : number;
        height?     : number;
        padding?    : number;
        strokeWidth?: number;
        strokeColor?: string;
        background? : string;
        layers?     : string[];
        flipY?      : boolean;
    }

export type Loader2D = { parse(text: string): DXFEntityList };

export type Loader3D = { parse(input: string | ArrayBuffer, options?:ModelLoadOptions): Promise<Mesh3DLike> | Mesh3DLike };

export type LoaderAny = Loader2D | Loader3D;

export type LoadResult =
        | { kind: '2d'; format: string; data: DXFEntityList }
        | { kind: '3d'; format: string; data: Mesh3DLike };