import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
import {createGeometry} from './Geometry.ts';
export function createGltf(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const {assetIdentity,assetMultiply,assetTRS,assetDet,assetTransform,assetNormals,assetCombine,assetLimit,assetResource}=createGeometry(engine);
const GLTFExporter = {
        /**
         * Export a mesh or scene to GLB binary.
         * Outputs a valid glTF 2.0 binary container.
         */
        toGLB(mesh: Mesh): ArrayBuffer
        {
            const geo   = mesh.geometry;
            const pos   = geo.positions;
            const idx   = geo.indices;
            const nrm   = geo.normals;

            const posBytes = pos.buffer.slice(pos.byteOffset, pos.byteOffset + pos.byteLength) as ArrayBuffer;
            const idxU32  = idx.length > 0 ? idx : new Uint32Array(Array.from({length:pos.length/3},(v,i)=>i));
            const idxBytes = idxU32.buffer.slice(idxU32.byteOffset, idxU32.byteOffset + idxU32.byteLength) as ArrayBuffer;
            const nrmBytes = (nrm.length > 0 ? nrm.buffer.slice(nrm.byteOffset, nrm.byteOffset + nrm.byteLength) : new ArrayBuffer(0)) as ArrayBuffer;

            const bufView: unknown[] = [];
            let bOff = 0;
            const addBV = (buf: ArrayBuffer, target?: number) => {
                bufView.push({ buffer: 0, byteOffset: bOff, byteLength: buf.byteLength, ...(target ? { target } : {}) });
                bOff += buf.byteLength + (buf.byteLength % 4 ? 4 - buf.byteLength % 4 : 0);
                return bufView.length - 1;
            };

            const posView = addBV(posBytes, 34962);
            const idxView = addBV(idxBytes as ArrayBuffer, 34963);
            const nrmView = nrmBytes.byteLength > 0 ? addBV(nrmBytes, 34962) : -1;

            const accessors: unknown[] = [
                { bufferView: posView, componentType: 5126, count: geo.vertexCount, type: 'VEC3',
                    min: [geo.boundingBox.min.x, geo.boundingBox.min.y, geo.boundingBox.min.z],
                    max: [geo.boundingBox.max.x, geo.boundingBox.max.y, geo.boundingBox.max.z] },
                { bufferView: idxView, componentType: 5125, count: idxU32.length, type: 'SCALAR' },
            ];
            if (nrmView >= 0) accessors.push({ bufferView: nrmView, componentType: 5126, count: geo.vertexCount, type: 'VEC3' });

            const prim: Record<string, unknown> = { attributes: { POSITION: 0 }, indices: 1, mode: 4 };
            if (nrmView >= 0) (prim.attributes as Record<string,number>)['NORMAL'] = 2;
            const col = mesh.material.color;

            const json = {
                asset     : { version: '2.0', generator: 'AriannA Three' },
                bufferViews: bufView,
                accessors,
                meshes    : [{ name: 'mesh', primitives: [prim] }],
                nodes     : [{ mesh: 0, name: 'node' }],
                scenes    : [{ nodes: [0] }],
                scene     : 0,
                materials : [{ name: 'mat', pbrMetallicRoughness: { baseColorFactor: col.toArray(), metallicFactor: mesh.material.metalness, roughnessFactor: mesh.material.roughness } }],
                buffers   : [{ byteLength: bOff }],
            };

            const jsonStr  = JSON.stringify(json);
            const jsonBytes = new TextEncoder().encode(jsonStr);
            const jsonPad  = jsonBytes.length % 4 ? 4 - jsonBytes.length % 4 : 0;

            // Combine all binary buffers
            const allBufs: ArrayBuffer[] = [posBytes, idxBytes as ArrayBuffer];
            if (nrmBytes.byteLength > 0) allBufs.push(nrmBytes);
            const binLen = allBufs.reduce((s, b) => s + b.byteLength + (b.byteLength%4?4-b.byteLength%4:0), 0);

            const total = 12 + 8 + jsonBytes.length + jsonPad + 8 + binLen;
            const out   = new ArrayBuffer(total);
            const view  = new DataView(out);
            const u8    = new Uint8Array(out);
            let   off   = 0;

            // GLB header
            view.setUint32(0, 0x46546C67, true); // 'glTF'
            view.setUint32(4, 2, true);           // version
            view.setUint32(8, total, true);       // length
            off = 12;

            // JSON chunk
            view.setUint32(off, jsonBytes.length + jsonPad, true); view.setUint32(off+4, 0x4E4F534A, true); off += 8;
            u8.set(jsonBytes, off); off += jsonBytes.length;
            for (let i = 0; i < jsonPad; i++) u8[off++] = 0x20;

            // BIN chunk
            view.setUint32(off, binLen, true); view.setUint32(off+4, 0x004E4942, true); off += 8;
            for (const b of allBufs) {
                const src = new Uint8Array(b);
                u8.set(src, off); off += src.length;
                const pad = src.length%4 ? 4-src.length%4 : 0;
                for (let i=0;i<pad;i++) u8[off++] = 0;
            }

            return out;
        },
    };

const GLTFLoader={
        async parse(input:string|ArrayBuffer,options:ModelLoadOptions={}):Promise<Model3DAsset>{
            let json:any,bin:ArrayBuffer|undefined,format:Mesh3DLike['format']='gltf';assetLimit(typeof input==='string'?input.length*2:input.byteLength,options);
            if(typeof input==='string')json=JSON.parse(input);
            else {const view=new DataView(input);if(input.byteLength>=4&&view.getUint32(0,true)===0x46546c67){format='glb';if(input.byteLength<20||view.getUint32(4,true)!==2||view.getUint32(8,true)!==input.byteLength)throw new Error('GLB: invalid header/version/length');let offset=12,chunk=0;
                while(offset<input.byteLength){if(offset+8>input.byteLength)throw new Error('GLB: truncated chunk');const length=view.getUint32(offset,true),type=view.getUint32(offset+4,true);offset+=8;if(length%4||offset+length>input.byteLength)throw new Error('GLB: invalid chunk length');if(!chunk&&type!==0x4e4f534a)throw new Error('GLB: first chunk must be JSON');if(type===0x4e4f534a){if(json)throw new Error('GLB: duplicate JSON');json=JSON.parse(new TextDecoder().decode(input.slice(offset,offset+length)).trim());}else if(type===0x004e4942){if(bin)throw new Error('GLB: duplicate BIN');bin=input.slice(offset,offset+length);}offset+=length;chunk++;}
            }else json=JSON.parse(new TextDecoder().decode(input));}
            if(json?.asset?.version!=='2.0')throw new Error('glTF: only version 2.0 is supported');
            const supported=new Set(['KHR_materials_unlit','KHR_mesh_quantization']);for(const extension of json.extensionsRequired??[])if(!supported.has(extension))throw new Error('glTF: required extension needs a decoder/adapter: '+extension);
            const buffers:ArrayBuffer[]=[];let total=0;for(const [i,definition]of (json.buffers??[]).entries()){const value=definition.uri?await assetResource(definition.uri,options):i===0?bin:undefined;if(!value||!Number.isSafeInteger(definition.byteLength)||definition.byteLength<0||value.byteLength<definition.byteLength)throw new Error('glTF: missing/truncated buffer '+i);total+=value.byteLength;assetLimit(total,options);buffers.push(value);}
            const cache=new Map<number,Float32Array|Float64Array>();let decodedBytes=0;
            const component=(view:DataView,offset:number,type:number)=>{switch(type){case 5120:return view.getInt8(offset);case 5121:return view.getUint8(offset);case 5122:return view.getInt16(offset,true);case 5123:return view.getUint16(offset,true);case 5125:return view.getUint32(offset,true);case 5126:return view.getFloat32(offset,true);default:throw new Error('glTF: invalid componentType');}};
            const read=(id:number):Float32Array|Float64Array=>{if(cache.has(id))return cache.get(id)!;const a=json.accessors?.[id];if(!a)throw new Error('glTF: missing accessor '+id);const sizes:Record<number,number>={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},widths:Record<string,number>={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};const size=sizes[a.componentType],width=widths[a.type];if(!size||!width||!Number.isSafeInteger(a.count)||a.count<0)throw new Error('glTF: invalid accessor');decodedBytes+=a.count*width*(a.componentType===5125&&!a.normalized?8:4);assetLimit(decodedBytes,options);const out=a.componentType===5125&&!a.normalized?new Float64Array(a.count*width):new Float32Array(a.count*width),columns=a.type.startsWith('MAT')?Number(a.type.slice(3)):1,rows=width/columns,columnBytes=columns===1?rows*size:Math.ceil(rows*size/4)*4,packed=columns*columnBytes;
                const normal=(v:number)=>!a.normalized?v:a.componentType===5120?Math.max(v/127,-1):a.componentType===5122?Math.max(v/32767,-1):v/(a.componentType===5121?255:a.componentType===5123?65535:4294967295);
                const viewRange=(viewId:number,offset:number,count:number,stride:number,elementBytes:number)=>{const definition=json.bufferViews?.[viewId],buffer=buffers[definition?.buffer];if(definition?.extensions?.EXT_meshopt_compression)throw new Error('glTF: Meshopt geometry requires a decoder');if(!definition||!buffer||!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(stride)||stride<elementBytes)throw new Error('glTF: invalid bufferView');const base=definition.byteOffset??0,length=definition.byteLength,end=offset+(count?((count-1)*stride+elementBytes):0);if(!Number.isSafeInteger(base)||base<0||!Number.isSafeInteger(length)||length<0||base+length>buffer.byteLength||end>length)throw new Error('glTF: accessor outside bufferView');return new DataView(buffer,base+offset,length-offset);};
                const fill=(view:DataView,offset:number,target:number)=>{for(let c=0;c<columns;c++)for(let r=0;r<rows;r++)out[target+c*rows+r]=normal(component(view,offset+c*columnBytes+r*size,a.componentType));};
                if(a.bufferView!==undefined){const stride=json.bufferViews?.[a.bufferView]?.byteStride??packed,view=viewRange(a.bufferView,a.byteOffset??0,a.count,stride,packed);for(let i=0;i<a.count;i++)fill(view,i*stride,i*width);}
                if(a.sparse){const sparse=a.sparse,ct=sparse.indices.componentType;if(![5121,5123,5125].includes(ct)||!Number.isSafeInteger(sparse.count)||sparse.count<0||sparse.count>a.count)throw new Error('glTF: invalid sparse accessor');const iv=viewRange(sparse.indices.bufferView,sparse.indices.byteOffset??0,sparse.count,sizes[ct],sizes[ct]),vv=viewRange(sparse.values.bufferView,sparse.values.byteOffset??0,sparse.count,packed,packed);let last=-1;for(let i=0;i<sparse.count;i++){const at=component(iv,i*sizes[ct],ct);if(at<=last||at>=a.count)throw new Error('glTF: invalid sparse indices');last=at;fill(vv,i*packed,at*width);}}
                if(out.some(v=>!Number.isFinite(v)))throw new Error('glTF: non-finite accessor');cache.set(id,out);return out;};
            const primitives:ModelPrimitive[]=[],warnings:string[]=[];const visiting=new Set<number>(),visited=new Set<number>();
            const walk=(id:number,parent:number[],depth=0)=>{options.signal?.throwIfAborted();if(depth>128||visiting.has(id)||visited.has(id))throw new Error('glTF: cyclic/shared node hierarchy');const node=json.nodes?.[id];if(!node)throw new Error('glTF: missing node '+id);visiting.add(id);visited.add(id);const local=node.matrix??assetTRS(node.translation,node.rotation,node.scale);if(local.length!==16||local.some((v:number)=>!Number.isFinite(v)))throw new Error('glTF: invalid matrix');const world=assetMultiply(parent,local);
                if(node.mesh!==undefined){const mesh=json.meshes?.[node.mesh];if(!mesh)throw new Error('glTF: missing mesh');for(const [pi,p]of mesh.primitives.entries()){
                    if(p.extensions?.KHR_draco_mesh_compression)throw new Error('glTF: Draco geometry requires a decoder');const positions=Float32Array.from(read(p.attributes.POSITION));if(json.accessors[p.attributes.POSITION].type!=='VEC3')throw new Error('glTF: POSITION must be VEC3');const count=positions.length/3,raw=p.indices===undefined?Array.from({length:count},(_,i)=>i):Array.from(read(p.indices));if(p.indices!==undefined&&(![5121,5123,5125].includes(json.accessors[p.indices].componentType)||json.accessors[p.indices].type!=='SCALAR'))throw new Error('glTF: invalid index accessor');if(raw.some(v=>!Number.isInteger(v)||v<0||v>=count))throw new Error('glTF: invalid mesh index');let mode=p.mode??4,ix=raw;
                    if(mode===5){ix=[];for(let i=2;i<raw.length;i++)ix.push(raw[i-2+(i%2)],raw[i-1-(i%2)],raw[i]);mode=4;}else if(mode===6){ix=[];for(let i=2;i<raw.length;i++)ix.push(raw[0],raw[i-1],raw[i]);mode=4;}if(mode===4&&ix.length%3)throw new Error('glTF: incomplete triangles');if(mode<0||mode>6)throw new Error('glTF: invalid primitive mode');if(mode!==4)warnings.push('Primitive '+id+'/'+pi+' needs a points/lines rendering adapter.');
                    const attributes:Record<string,Float32Array>={};for(const [name,index]of Object.entries(p.attributes)){const values=read(index as number);if(json.accessors[index as number].count!==count)throw new Error('glTF: attribute count mismatch');attributes[name]=Float32Array.from(values);}
                    if(attributes.NORMAL&&attributes.NORMAL.length!==count*3||attributes.TEXCOORD_0&&attributes.TEXCOORD_0.length!==count*2||attributes.COLOR_0&&![count*3,count*4].includes(attributes.COLOR_0.length))throw new Error('glTF: invalid attribute width');
                    const normals=attributes.NORMAL,uvs=attributes.TEXCOORD_0,col=attributes.COLOR_0;let colors:Float32Array|undefined;if(col){const width=col.length/count;colors=new Float32Array(count*3);for(let i=0;i<count;i++)colors.set(col.subarray(i*width,i*width+3),i*3);}
                    primitives.push({format,name:node.name??mesh.name??'mesh-'+id+'-'+pi,node:id,material:p.material,matrix:world,mode,positions,indices:new Uint32Array(ix),normals,uvs,colors,attributes,targets:p.targets?.map((target:Record<string,number>)=>Object.fromEntries(Object.entries(target).map(([k,v])=>[k,Float32Array.from(read(v))]))),vertexCount:count,triangleCount:mode===4?ix.length/3:0});
                }}for(const child of node.children??[])walk(child,world,depth+1);visiting.delete(id);};
            let roots:number[];if(json.scenes?.length){const scene=json.scenes[json.scene??0];if(!scene)throw new Error('glTF: invalid default scene');roots=scene.nodes??[];}else{const children=new Set<number>((json.nodes??[]).flatMap((n:any)=>n.children??[]));roots=(json.nodes??[]).map((_:any,i:number)=>i).filter((i:number)=>!children.has(i));}for(const root of roots)walk(root,assetIdentity());
            if(!primitives.length)throw new Error('glTF: selected scene contains no geometry');
            const animations=(json.animations??[]).map((animation:any)=>({...animation,samplers:animation.samplers.map((s:any)=>({...s,input:read(s.input),output:read(s.output)}))}));const skins=(json.skins??[]).map((skin:any)=>({...skin,inverseBindMatrices:skin.inverseBindMatrices===undefined?undefined:read(skin.inverseBindMatrices)}));
            if(primitives.some(p=>p.targets?.length))warnings.push('Morph target data is retained; default morph weights and morph playback require a rendering adapter.');
            if(animations.length||skins.length)warnings.push('Skin/animation data is retained; the current AriannA renderer displays the static base pose.');
            const images:Record<string,unknown>[]=[];for(const image of json.images??[]){let bytes:ArrayBuffer|undefined;if(image.bufferView!==undefined){const v=json.bufferViews?.[image.bufferView],buffer=buffers[v?.buffer];if(!v||!buffer||(v.byteOffset??0)+v.byteLength>buffer.byteLength)throw new Error('glTF: invalid image bufferView');bytes=buffer.slice(v.byteOffset??0,(v.byteOffset??0)+v.byteLength);}images.push({...image,bytes});}if(images.length)warnings.push('Texture images and material descriptors are retained; texture shader binding is application-owned.');
            return assetCombine(format,primitives,{materials:json.materials??[],nodes:json.nodes??[],images,animations,skins,warnings,source:json},options);
        },
        async load(url:string,options:ModelLoadOptions={}):Promise<Model3DAsset>{const response=await fetch(url,{signal:options.signal});if(!response.ok)throw new Error('GLTFLoader: HTTP '+response.status);return this.parse(await response.arrayBuffer(),{...options,baseURL:options.baseURL??response.url??url});}
    };
return {GLTFLoader,GLTFExporter};
}
