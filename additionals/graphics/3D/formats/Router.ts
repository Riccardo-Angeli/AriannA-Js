import {writeArchive,readArchive,archiveBytes,archiveSnapshot} from './Archive.ts';
import type {Three} from '../Three.ts';
import type {Mesh3DLike,ModelLoadOptions} from './Types.ts';
import {Dcom,type DcomAsset} from './Dcom.ts';
export type MeshFormat='obj'|'stl'|'ply'|'gltf'|'glb'|'fbx';
export interface FormatCodec {
 parse(input:string|ArrayBuffer,options?:ModelLoadOptions):Promise<Mesh3DLike>|Mesh3DLike;
 write?(mesh:Mesh3DLike):string|ArrayBuffer|Promise<string|ArrayBuffer>;
}
export interface ConversionResult{data:string|ArrayBuffer;format:MeshFormat;warnings:string[];}
export class FormatRouter {
 private readonly codecs=new Map<string,FormatCodec>();
 constructor(private readonly dicom?:Dcom){}
 register(extension:string,codec:FormatCodec):this{this.codecs.set(extension.toLowerCase().replace(/^\./,''),codec);return this;}
 capabilities(){return [...this.codecs].map(([format,c])=>({format,import:true,export:!!c.write}));}
 async import(format:string,input:string|ArrayBuffer,options:ModelLoadOptions={}):Promise<Mesh3DLike|DcomAsset>{
  const f=format.toLowerCase().replace(/^\./,'');options.signal?.throwIfAborted();
  const bytes=typeof input==='string'?new TextEncoder().encode(input).byteLength:input.byteLength;
  if(bytes>(options.maxBytes??268435456))throw new Error('Formats: input exceeds maxBytes');
  if(['dcm','dcom','dicom'].includes(f)){if(!this.dicom)throw new Error('Dcom requires an initialized Cornerstone runtime passed to createFormats');if(typeof input==='string')throw new Error('Dcom requires binary bytes');return this.dicom.import(input);}
  const codec=this.codecs.get(f);if(!codec)throw new Error('Formats: unsupported import '+f);return codec.parse(input,options);
 }
 async export(format:MeshFormat,mesh:Mesh3DLike):Promise<string|ArrayBuffer>{const codec=this.codecs.get(format);if(!codec?.write)throw new Error('Formats: unsupported export '+format);validateMesh(mesh);return codec.write(mesh);}
 /** Archive conversion retains original bytes, resolved resources and decoded scene sidecars. */
 async convert(input:string|ArrayBuffer,from:string,to:MeshFormat,options:ModelLoadOptions&{resources?:Record<string,ArrayBuffer>;metadata?:Record<string,unknown>;maxArchiveBytes?:number}={}):Promise<{data:ArrayBuffer;format:'zip';manifest:Record<string,any>}>{
  const files=new Map<string,Uint8Array>(),resources=new Map<string,ArrayBuffer>(Object.entries(options.resources??{}));
  const resolveResource=async(uri:string):Promise<ArrayBuffer>=>{let data=resources.get(uri);if(!data){if(options.resolveResource)data=await options.resolveResource(uri);else{const response=await fetch(new URL(uri,options.baseURL),{signal:options.signal});if(!response.ok)throw new Error('Resource HTTP '+response.status);data=await response.arrayBuffer();}if(data.byteLength>(options.maxBytes??268435456))throw new Error('Resource size limit');resources.set(uri,data);}return data;};
  const asset=await this.import(from,input,{...options,resolveResource});
  if('kind'in asset){asset.dispose();throw new Error('DICOM-to-mesh needs a supplied segmented surface; preserve the original separately using packageOriginal');}
  const scene=asset as Mesh3DLike&Record<string,any>;
  // glTF image URIs and FBX texture filenames are external assets, not merely descriptors.
  for(const image of scene.images??[]){const embedded=image.children?.find((n:any)=>n.name==='Content')?.properties?.[0];const uri=image.uri??image.relativeFilename??image.filename??(embedded?undefined:(image.children?.find((n:any)=>n.name==='RelativeFilename')??image.children?.find((n:any)=>n.name==='FileName'))?.properties?.[0]);if(typeof uri==='string'&&!uri.startsWith('data:'))await resolveResource(uri);}
  if(from.toLowerCase().replace(/^\./,'')==='obj'){
   const source=typeof input==='string'?input:new TextDecoder().decode(input);
   for(const match of source.matchAll(/^mtllib[ \t]+(.+)$/gm)){
    const names=resources.has(match[1].trim())?[match[1].trim()]:match[1].trim().split(/\s+/);
    for(const name of names){const mtl=new TextDecoder().decode(await resolveResource(name));files.set('materials/'+encodeURIComponent(name)+'.mtl',archiveBytes(mtl));
     for(const texture of mtl.matchAll(/^(?:map_\w+|bump|disp|decal|norm)[ \t]+(.+)$/gm)){
      const tokens=texture[1].trim();if(tokens.startsWith('-'))throw new Error('MTL texture options require explicit resource packaging before conversion: '+tokens);
      const uri=name.includes('/')?name.slice(0,name.lastIndexOf('/')+1)+tokens:tokens;await resolveResource(uri);
     }
    }
   }
  }
  files.set('model/model.'+to,archiveBytes(await this.export(to,asset)));
  files.set('source/original.'+from.toLowerCase().replace(/^\./,''),archiveBytes(input));
  const groups:Record<string,unknown>={animations:scene.animations??[],rigs:scene.skins??[],materials:scene.materials??[],textures:scene.images??[],scene:{nodes:scene.nodes??[],primitives:scene.primitives??[],source:scene.source??null},metadata:options.metadata??{}};
  for(const [name,value]of Object.entries(groups))files.set(name+'/'+name+'.json',archiveBytes(JSON.stringify(archiveSnapshot(value,name,files),null,2)));
  const resourceEntries=[...resources].map(([uri,bytes],i)=>{const path='source/resources/'+i+'.bin';files.set(path,new Uint8Array(bytes));return{uri,path,byteLength:bytes.byteLength};});
  const manifest={version:1,sourceFormat:from,targetFormat:to,model:'model/model.'+to,source:'source/original.'+from.toLowerCase().replace(/^\./,''),resources:resourceEntries,sidecars:Object.keys(groups).map(k=>k+'/'+k+'.json'),modelScope:'static-triangle-geometry',preservation:'original source bytes + supplied/resolved resources + decoded sidecars',warnings:scene.warnings??[]};
  files.set('manifest.json',archiveBytes(JSON.stringify(manifest,null,2)));if([...files.values()].reduce((n,b)=>n+b.byteLength,0)>(options.maxArchiveBytes??536870912))throw new Error('Archive exceeds maxArchiveBytes');return{data:writeArchive(files),format:'zip',manifest};
 }
 async restore(buffer:ArrayBuffer,options:ModelLoadOptions={}):Promise<Mesh3DLike|DcomAsset>{
  const files=readArchive(buffer),raw=files.get('manifest.json');if(!raw)throw new Error('Missing archive manifest');const m=JSON.parse(new TextDecoder().decode(raw)),source=files.get(m.source);if(!source)throw new Error('Missing original source');
  return this.import(m.sourceFormat,source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength) as ArrayBuffer,{...options,resolveResource:async uri=>{const entry=m.resources.find((e:any)=>e.uri===uri),data=entry&&files.get(entry.path);if(!data)throw new Error('Missing archived resource '+uri);return data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength) as ArrayBuffer;}});
 }
 /** Preserve non-mesh DICOM/DXF without pretending a volume/curve is a triangulated solid. */
 packageOriginal(input:string|ArrayBuffer,format:string,resources:Record<string,ArrayBuffer>={}):ArrayBuffer{
  const files=new Map<string,Uint8Array>(),source='source/original.'+format.toLowerCase().replace(/^\./,'');files.set(source,archiveBytes(input));files.set('model/model.'+format.toLowerCase().replace(/^\./,''),archiveBytes(input));
  const entries=Object.entries(resources).map(([uri,data],i)=>{const path='source/resources/'+i+'.bin';files.set(path,new Uint8Array(data));return{uri,path};});files.set('manifest.json',archiveBytes(JSON.stringify({version:1,sourceFormat:format,source,resources:entries,modelScope:'original-only'})));return writeArchive(files);
 }
 async convertGeometry(input:string|ArrayBuffer,from:string,to:MeshFormat,options:ModelLoadOptions&{allowGeometryOnly?:boolean}={}):Promise<ConversionResult>{
  // This API explicitly converts static triangle geometry, not full animation/material scenes.
  if(!options.allowGeometryOnly)throw new Error('Conversion requires allowGeometryOnly:true: scene hierarchy, animation and materials are not preserved');
  const asset=await this.import(from,input,options);if('kind'in asset){asset.dispose();throw new Error('DICOM-to-mesh requires explicit segmentation and surface extraction');}
  return{data:await this.export(to,asset),format:to,warnings:['Static geometry conversion: animation, skinning, hierarchy, materials and textures are not preserved.']};
 }
}
export function validateMesh(m:Mesh3DLike):void{
 if(!m.positions.length||m.positions.length%3||!m.positions.every(Number.isFinite))throw new Error('Formats: invalid positions');
 const n=m.positions.length/3,i=m.indices;if(i?.length){if(i.length%3||!i.every(v=>Number.isInteger(v)&&v>=0&&v<n))throw new Error('Formats: invalid triangle indices');}else if(n%3)throw new Error('Formats: unindexed geometry is not triangles');
}
