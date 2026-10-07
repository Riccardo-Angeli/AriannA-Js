import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
export function createPly(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const PLYLoader = {

        /** Parse a PLY file (text or ArrayBuffer). */
        async parse(input: string | ArrayBuffer): Promise<Mesh3DLike>
        {
            const bytes = typeof input === 'string' ? new TextEncoder().encode(input).buffer : input;
            const view = new Uint8Array(bytes);

            let pos = 0;
            let header = '';
            const decoder = new TextDecoder();
            while (pos < view.length) {
                const lineEnd = view.indexOf(0x0a, pos);
                if (lineEnd === -1) throw new Error('PLY: unterminated header');
                const line = decoder.decode(view.slice(pos, lineEnd));
                header += line + '\n';
                pos = lineEnd + 1;
                if (line.trim() === 'end_header') break;
            }

            if (!header.startsWith('ply')) throw new Error('PLY: missing magic');

            type PropDef = { name: string; type: string; isList?: boolean; countType?: string; itemType?: string };
            type ElemDef = { name: string; count: number; props: PropDef[] };
            const elements: ElemDef[] = [];
            let format: 'ascii' | 'binary_little_endian' | 'binary_big_endian' = 'ascii';
            let current: ElemDef | null = null;

            for (const raw of header.split('\n')) {
                const line = raw.trim();
                if (!line || line.startsWith('comment')) continue;
                const tok = line.split(/\s+/);
                if (tok[0] === 'format') format = tok[1] as never;
                else if (tok[0] === 'element') { current = { name: tok[1], count: parseInt(tok[2], 10), props: [] }; elements.push(current); }
                else if (tok[0] === 'property' && current) {
                    if (tok[1] === 'list') current.props.push({ name: tok[4], type: 'list', isList: true, countType: tok[2], itemType: tok[3] });
                    else current.props.push({ name: tok[2], type: tok[1] });
                }
            }

            const vertexEl = elements.find(e => e.name === 'vertex');
            const faceEl   = elements.find(e => e.name === 'face');
            if (!vertexEl) throw new Error('PLY: no vertex element');

            const positions: number[] = [];
            const colors    : number[] = [];
            const normals   : number[] = [];
            const indices   : number[] = [];

            if (format === 'ascii') {
                const body = decoder.decode(view.slice(pos)).split('\n').filter(l => l.trim());
                let bi = 0;
                for (let i = 0; i < vertexEl.count; i++) {
                    const fields = body[bi++].trim().split(/\s+/).map(parseFloat);
                    let fi = 0;
                    let x = 0, y = 0, z = 0, r = -1, g = -1, b = -1, nx = 0, ny = 0, nz = 0;
                    for (const p of vertexEl.props) {
                        const v = fields[fi++];
                        if      (p.name === 'x') x = v;
                        else if (p.name === 'y') y = v;
                        else if (p.name === 'z') z = v;
                        else if (p.name === 'red')   r = v;
                        else if (p.name === 'green') g = v;
                        else if (p.name === 'blue')  b = v;
                        else if (p.name === 'nx') nx = v;
                        else if (p.name === 'ny') ny = v;
                        else if (p.name === 'nz') nz = v;
                    }
                    positions.push(x, y, z);
                    if (r >= 0) colors.push(r / 255, g / 255, b / 255);
                    if (nx || ny || nz) normals.push(nx, ny, nz);
                }
                if (faceEl) {
                    for (let i = 0; i < faceEl.count; i++) {
                        const fields = body[bi++].trim().split(/\s+/).map(s => parseInt(s, 10));
                        const n = fields[0];
                        for (let j = 1; j < n - 1; j++) indices.push(fields[1], fields[1 + j], fields[2 + j]);
                    }
                }
            } else {
                const dv = new DataView(bytes, pos);
                const le = format === 'binary_little_endian';
                let off = 0;
                const readType = (t: string): number => {
                    switch (t) {
                        case 'char':   case 'int8':   { const v = dv.getInt8(off);    off += 1; return v; }
                        case 'uchar':  case 'uint8':  { const v = dv.getUint8(off);   off += 1; return v; }
                        case 'short':  case 'int16':  { const v = dv.getInt16(off, le);   off += 2; return v; }
                        case 'ushort': case 'uint16': { const v = dv.getUint16(off, le);  off += 2; return v; }
                        case 'int':    case 'int32':  { const v = dv.getInt32(off, le);   off += 4; return v; }
                        case 'uint':   case 'uint32': { const v = dv.getUint32(off, le);  off += 4; return v; }
                        case 'float':  case 'float32':{ const v = dv.getFloat32(off, le); off += 4; return v; }
                        case 'double': case 'float64':{ const v = dv.getFloat64(off, le); off += 8; return v; }
                        default: throw new Error(`PLY: unknown type ${t}`);
                    }
                };

                for (let i = 0; i < vertexEl.count; i++) {
                    let x = 0, y = 0, z = 0, r = -1, g = -1, b = -1, nx = 0, ny = 0, nz = 0;
                    for (const p of vertexEl.props) {
                        const v = readType(p.type);
                        if      (p.name === 'x') x = v;
                        else if (p.name === 'y') y = v;
                        else if (p.name === 'z') z = v;
                        else if (p.name === 'red')   r = v;
                        else if (p.name === 'green') g = v;
                        else if (p.name === 'blue')  b = v;
                        else if (p.name === 'nx') nx = v;
                        else if (p.name === 'ny') ny = v;
                        else if (p.name === 'nz') nz = v;
                    }
                    positions.push(x, y, z);
                    if (r >= 0) colors.push(r / 255, g / 255, b / 255);
                    if (nx || ny || nz) normals.push(nx, ny, nz);
                }
                if (faceEl) {
                    for (let i = 0; i < faceEl.count; i++) {
                        for (const p of faceEl.props) {
                            if (p.isList) {
                                const n = readType(p.countType!);
                                const verts: number[] = [];
                                for (let j = 0; j < n; j++) verts.push(readType(p.itemType!));
                                for (let j = 1; j < n - 1; j++) indices.push(verts[0], verts[j], verts[j + 1]);
                            } else {
                                readType(p.type);
                            }
                        }
                    }
                }
            }

            const indicesArr: Uint16Array | Uint32Array | undefined =
                indices.length === 0 ? undefined
                    : positions.length / 3 < 65536 ? new Uint16Array(indices)
                        : new Uint32Array(indices);

            return {
                positions    : new Float32Array(positions),
                normals      : normals.length ? new Float32Array(normals) : undefined,
                colors       : colors.length ? new Float32Array(colors) : undefined,
                indices      : indicesArr,
                format       : 'ply',
                vertexCount  : positions.length / 3,
                triangleCount: indicesArr ? indicesArr.length / 3 : positions.length / 9,
            };
        },

        async load(url: string): Promise<Mesh3DLike>
        {
            const r = await fetch(url);
            if (!r.ok) throw new Error(`PLYLoader: HTTP ${r.status}`);
            return PLYLoader.parse(await r.arrayBuffer());
        },
    };
return {PLYLoader};
}
/** ASCII PLY triangle geometry writer. */
export function writePly(mesh:Mesh3DLike):string {
 const p=mesh.positions,idx=mesh.indices?.length?mesh.indices:Uint32Array.from({length:p.length/3},(_,i)=>i);
 const out=['ply','format ascii 1.0','comment AriannA geometry export',`element vertex ${p.length/3}`,'property float x','property float y','property float z',`element face ${idx.length/3}`,'property list uchar uint vertex_indices','end_header'];
 for(let i=0;i<p.length;i+=3)out.push(`${p[i]} ${p[i+1]} ${p[i+2]}`);
 for(let i=0;i<idx.length;i+=3)out.push(`3 ${idx[i]} ${idx[i+1]} ${idx[i+2]}`);
 return out.join('\n')+'\n';
}
