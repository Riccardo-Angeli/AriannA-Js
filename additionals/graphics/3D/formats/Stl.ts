import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
export function createStl(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const STLLoader = {
        /**
         * Parse STL (binary or ASCII) into a BufferGeometry.
         * @example
         *   const geo = STLLoader.parse(arrayBuffer);
         */
        parse(buf: ArrayBuffer): BufferGeometry
        {
            const u8  = new Uint8Array(buf);
            const isBinary = !_isAsciiSTL(u8);
            return isBinary ? _parseBinarySTL(buf) : _parseAsciiSTL(new TextDecoder().decode(u8));
        },
    };

function _isAsciiSTL(u8: Uint8Array): boolean
    {
        const start = Math.min(256, u8.length);
        for (let i = 0; i < start; i++) if (u8[i] > 127) return false;
        const text = new TextDecoder().decode(u8.slice(0, start));
        return text.trimStart().startsWith('solid');
    }

function _parseBinarySTL(buf: ArrayBuffer): BufferGeometry
    {
        const view  = new DataView(buf);
        const count = view.getUint32(80, true);
        const pos: number[] = [], nrm: number[] = [];
        let   off = 84;
        for (let i = 0; i < count; i++, off += 50) {
            const nx=view.getFloat32(off,true),   ny=view.getFloat32(off+4,true),  nz=view.getFloat32(off+8,true);
            for (let v = 0; v < 3; v++) {
                const o = off + 12 + v * 12;
                pos.push(view.getFloat32(o,true), view.getFloat32(o+4,true), view.getFloat32(o+8,true));
                nrm.push(nx,ny,nz);
            }
        }
        return new BufferGeometry().setPositions(pos).setNormals(nrm);
    }

function _parseAsciiSTL(text: string): BufferGeometry
    {
        const pos: number[] = [], nrm: number[] = [];
        const lines = text.split('\n');
        let cn = [0,0,0];
        for (const line of lines) {
            const t = line.trim();
            if (t.startsWith('facet normal')) {
                const [,,, nx, ny, nz] = t.split(/\s+/);
                cn = [parseFloat(nx), parseFloat(ny), parseFloat(nz)];
            } else if (t.startsWith('vertex')) {
                const [, x, y, z] = t.split(/\s+/);
                pos.push(parseFloat(x), parseFloat(y), parseFloat(z));
                nrm.push(...cn);
            }
        }
        return new BufferGeometry().setPositions(pos).setNormals(nrm);
    }

const STLExporter = {
        /**
         * Export a mesh to binary STL.
         * @example
         *   const buf = STLExporter.toBinary(mesh);
         *   Docs.download(new DocsDocument('stl', buf), 'model.stl');
         */
        toBinary(mesh: Mesh): ArrayBuffer
        {
            const geo   = mesh.geometry;
            const idx   = geo.indices;
            const pos   = geo.positions;
            const nrm   = geo.normals;
            const count = idx.length > 0 ? idx.length / 3 : pos.length / 9;
            const buf   = new ArrayBuffer(84 + count * 50);
            const view  = new DataView(buf);
            view.setUint32(80, count, true);
            let   off   = 84;

            const writeV = (i: number) => {
                view.setFloat32(off,   pos[i*3],   true);
                view.setFloat32(off+4, pos[i*3+1], true);
                view.setFloat32(off+8, pos[i*3+2], true);
                off += 12;
            };
            const writeFace = (i0: number, i1: number, i2: number) => {
                // Normal
                view.setFloat32(off,    nrm[i0*3]??0, true);
                view.setFloat32(off+4,  nrm[i0*3+1]??0, true);
                view.setFloat32(off+8,  nrm[i0*3+2]??1, true);
                off += 12;
                writeV(i0); writeV(i1); writeV(i2);
                view.setUint16(off, 0, true); off += 2;
            };

            if (idx.length > 0) for (let i = 0; i < idx.length; i += 3) writeFace(idx[i], idx[i+1], idx[i+2]);
            else                 for (let i = 0; i < pos.length/3; i += 3) writeFace(i, i+1, i+2);

            return buf;
        },

        toAscii(mesh: Mesh): string
        {
            const geo = mesh.geometry;
            const idx = geo.indices, pos = geo.positions, nrm = geo.normals;
            const lines = ['solid mesh'];
            const v = (i: number) => `${pos[i*3]} ${pos[i*3+1]} ${pos[i*3+2]}`;
            const n = (i: number) => `${nrm[i*3]??0} ${nrm[i*3+1]??0} ${nrm[i*3+2]??1}`;
            const face = (i0: number, i1: number, i2: number) => `  facet normal ${n(i0)}\n    outer loop\n      vertex ${v(i0)}\n      vertex ${v(i1)}\n      vertex ${v(i2)}\n    endloop\n  endfacet`;
            if (idx.length > 0) for (let i = 0; i < idx.length; i += 3) lines.push(face(idx[i], idx[i+1], idx[i+2]));
            else                 for (let i = 0; i < pos.length/3; i += 3) lines.push(face(i, i+1, i+2));
            lines.push('endsolid mesh');
            return lines.join('\n');
        },
    };
return {STLLoader,STLExporter};
}
