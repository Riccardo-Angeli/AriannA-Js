import type {Three} from '../Three.ts';
import type {Mesh3DLike} from './Types.ts';
import {FormatRouter} from './Router.ts';
import {writePly} from './Ply.ts';
import {writeFbx} from './Fbx.ts';
import {glbToEmbeddedJson} from './Glb.ts';
import type {Dcom} from './Dcom.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'MeshBasicMaterial'>;
interface Codecs {STLLoader:any;STLExporter:any;OBJLoader:any;OBJExporter:any;GLTFLoader:any;GLTFExporter:any;GLBLoader:any;FBXLoader:any;PLYLoader:any;}
export function createFormatsRouter(engine:Engine,c:Codecs,dicom?:Dcom):FormatRouter{
 const mesh=(m:Mesh3DLike)=>{const g=new engine.BufferGeometry().setPositions(m.positions);if(m.indices?.length)g.setIndices(new Uint32Array(m.indices));if(m.normals?.length)g.setNormals(m.normals);else g.computeNormals();if(m.uvs?.length)g.setUVs(m.uvs);return new engine.Mesh(g,new engine.MeshBasicMaterial());};
 const wrap=(g:Three.BufferGeometry,format:Mesh3DLike['format']):Mesh3DLike=>({positions:g.positions,normals:g.normals,indices:g.indices,uvs:g.uvs,format,vertexCount:g.vertexCount,triangleCount:(g.indices.length||g.vertexCount)/3});
 return new FormatRouter(dicom)
 .register('obj',{parse:i=>wrap(c.OBJLoader.parse(typeof i==='string'?i:new TextDecoder().decode(i)),'obj'),write:m=>c.OBJExporter.export(mesh(m))})
 .register('stl',{parse:i=>wrap(c.STLLoader.parse(typeof i==='string'?new TextEncoder().encode(i).buffer:i),'stl'),write:m=>c.STLExporter.toBinary(mesh(m))})
 .register('ply',{parse:c.PLYLoader.parse,write:writePly})
 .register('fbx',{parse:c.FBXLoader.parse,write:writeFbx})
 .register('glb',{parse:c.GLBLoader.parse,write:m=>c.GLTFExporter.toGLB(mesh(m))})
 .register('gltf',{parse:c.GLTFLoader.parse,write:m=>glbToEmbeddedJson(c.GLTFExporter.toGLB(mesh(m)))});
}
