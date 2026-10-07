import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
export function createObj(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const OBJLoader = {
        /**
         * Parse OBJ text into a BufferGeometry.
         */
        parse(text: string): BufferGeometry
        {
            const vp: number[] = [], vn: number[] = [], vt: number[] = [];
            const pos: number[] = [], nrm: number[] = [], uv: number[] = [];

            for (const line of text.split('\n')) {
                const t = line.trim();
                if (t.startsWith('v '))  { const [,x,y,z]=t.split(/\s+/); vp.push(parseFloat(x),parseFloat(y),parseFloat(z)); }
                if (t.startsWith('vn ')) { const [,x,y,z]=t.split(/\s+/); vn.push(parseFloat(x),parseFloat(y),parseFloat(z)); }
                if (t.startsWith('vt ')) { const [,u,v]=t.split(/\s+/); vt.push(parseFloat(u),parseFloat(v)); }
                if (t.startsWith('f ')) {
                    const parts = t.split(/\s+/).slice(1);
                    // Fan triangulation for polygons
                    for (let i = 1; i < parts.length - 1; i++) {
                        for (const pi of [parts[0], parts[i], parts[i+1]]) {
                            const [vi, ti, ni] = pi.split('/').map(s => s ? parseInt(s)-1 : -1);
                            pos.push(vp[vi*3], vp[vi*3+1], vp[vi*3+2]);
                            if (ni >= 0) nrm.push(vn[ni*3], vn[ni*3+1], vn[ni*3+2]);
                            if (ti >= 0) uv.push(vt[ti*2], vt[ti*2+1]);
                        }
                    }
                }
            }
            const geo = new BufferGeometry().setPositions(pos);
            if (nrm.length) geo.setNormals(nrm); else geo.computeNormals();
            if (uv.length)  geo.setUVs(uv);
            return geo;
        },
    };

const OBJExporter = {
        export(mesh: Mesh, name = 'mesh'): string
        {
            const geo   = mesh.geometry;
            const pos   = geo.positions, nrm = geo.normals, uvd = geo.uvs, idx = geo.indices;
            const lines = [`# AriannA Three export`, `o ${name}`];

            for (let i = 0; i < pos.length; i += 3) lines.push(`v ${pos[i]} ${pos[i+1]} ${pos[i+2]}`);
            for (let i = 0; i < nrm.length; i += 3) lines.push(`vn ${nrm[i]} ${nrm[i+1]} ${nrm[i+2]}`);
            for (let i = 0; i < uvd.length; i += 2) lines.push(`vt ${uvd[i]} ${uvd[i+1]}`);

            const fi = (i: number) => `${i+1}/${uvd.length>0?i+1:''}/${nrm.length>0?i+1:''}`;
            if (idx.length > 0) for (let i = 0; i < idx.length; i += 3) lines.push(`f ${fi(idx[i])} ${fi(idx[i+1])} ${fi(idx[i+2])}`);
            else                 for (let i = 0; i < pos.length/3; i += 3) lines.push(`f ${fi(i)} ${fi(i+1)} ${fi(i+2)}`);
            return lines.join('\n');
        },
    };
return {OBJLoader,OBJExporter};
}
