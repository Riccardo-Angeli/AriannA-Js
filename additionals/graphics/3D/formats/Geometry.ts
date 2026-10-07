import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
export function createGeometry(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const assetIdentity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function assetMultiply(a:number[],b:number[]):number[]{const out=new Array<number>(16).fill(0);for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)out[col*4+row]+=a[k*4+row]*b[col*4+k];return out;}
function assetTRS(t:number[]= [0,0,0],q:number[]=[0,0,0,1],s:number[]=[1,1,1]):number[]{
        if([...t,...q,...s].some(v=>!Number.isFinite(v)))throw new Error('Asset: invalid transform');
        const [x,y,z,w]=q,l=Math.hypot(x,y,z,w)||1;const m=new Mat4().compose(new Vec3(...t as [number,number,number]),new Quaternion(x/l,y/l,z/l,w/l),new Vec3(...s as [number,number,number]));return Array.from(m.elements);
    }
const assetDet=(m:number[])=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
function assetTransform(p:ArrayLike<number>,m:number[],normal=false):number[]{
        if(!normal)return[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
        const det=assetDet(m);if(Math.abs(det)<1e-15)return [0,0,0];
        const x=((m[5]*m[10]-m[9]*m[6])*p[0]+(m[9]*m[2]-m[1]*m[10])*p[1]+(m[1]*m[6]-m[5]*m[2])*p[2])/det;
        const y=((m[8]*m[6]-m[4]*m[10])*p[0]+(m[0]*m[10]-m[8]*m[2])*p[1]+(m[4]*m[2]-m[0]*m[6])*p[2])/det;
        const z=((m[4]*m[9]-m[8]*m[5])*p[0]+(m[8]*m[1]-m[0]*m[9])*p[1]+(m[0]*m[5]-m[4]*m[1])*p[2])/det;
        const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];
    }
function assetNormals(p:Float32Array,i:Uint32Array):Float32Array {return new BufferGeometry().setPositions(p).setIndices(i).computeNormals().normals;}
function assetCombine(format:Mesh3DLike['format'],primitives:ModelPrimitive[],meta:Omit<Model3DAsset,keyof Mesh3DLike|'primitives'>,options:ModelLoadOptions):Model3DAsset {
        let count=0,indexCount=0;for(const p of primitives){count+=p.vertexCount;indexCount+=p.indices?.length??0;}
        if(count*44+indexCount*4>(options.maxBytes??268435456))throw new Error('Asset: decoded mesh exceeds maxBytes');
        const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2),colors=new Float32Array(count*3),indices=new Uint32Array(indexCount);let vertex=0,index=0,hasUV=false,hasColor=false;
        for(const p of primitives){const n=p.normals??(p.mode===4?assetNormals(p.positions,new Uint32Array(p.indices??[])):new Float32Array(p.positions.length));
            for(let v=0;v<p.vertexCount;v++){positions.set(assetTransform(p.positions.subarray(v*3,v*3+3),p.matrix),(vertex+v)*3);normals.set(assetTransform(n.subarray(v*3,v*3+3),p.matrix,true),(vertex+v)*3);if(p.uvs){uvs.set(p.uvs.subarray(v*2,v*2+2),(vertex+v)*2);hasUV=true;}if(p.colors){colors.set(p.colors.subarray(v*3,v*3+3),(vertex+v)*3);hasColor=true;}else colors.fill(1,(vertex+v)*3,(vertex+v+1)*3);}
            const source=p.indices??new Uint32Array();for(let j=0;j<source.length;j++)indices[index+j]=vertex+source[j];if(p.mode===4&&assetDet(p.matrix)<0)for(let j=0;j<source.length;j+=3){const a=indices[index+j+1];indices[index+j+1]=indices[index+j+2];indices[index+j+2]=a;}index+=source.length;vertex+=p.vertexCount;
        }
        return{format,positions,normals,uvs:hasUV?uvs:undefined,colors:hasColor?colors:undefined,indices,vertexCount:count,triangleCount:primitives.reduce((n,p)=>n+(p.mode===4?(p.indices?.length??0)/3:0),0),primitives,...meta};
    }
function assetLimit(bytes:number,options:ModelLoadOptions):void {options.signal?.throwIfAborted();if(!Number.isSafeInteger(bytes)||bytes<0||bytes>(options.maxBytes??268435456))throw new Error('Asset: resource exceeds maxBytes');}
async function assetResource(uri:string,options:ModelLoadOptions):Promise<ArrayBuffer>{
        options.signal?.throwIfAborted();let buffer:ArrayBuffer;
        if(uri.startsWith('data:')){const comma=uri.indexOf(',');if(comma<0)throw new Error('Asset: invalid data URI');const text=uri.slice(0,comma).includes(';base64')?atob(uri.slice(comma+1)):decodeURIComponent(uri.slice(comma+1));assetLimit(text.length,options);buffer=Uint8Array.from(text,c=>c.charCodeAt(0)).buffer;}
        else if(options.resolveResource)buffer=await options.resolveResource(uri);
        else {let url:string;try{url=new URL(uri,options.baseURL).href;}catch{throw new Error('Asset: supply baseURL or resolveResource for '+uri);}const response=await fetch(url,{signal:options.signal});if(!response.ok)throw new Error('Asset: HTTP '+response.status+' '+url);buffer=await response.arrayBuffer();}
        assetLimit(buffer.byteLength,options);return buffer;
    }
return {assetIdentity,assetMultiply,assetTRS,assetDet,assetTransform,assetNormals,assetCombine,assetLimit,assetResource};
}
