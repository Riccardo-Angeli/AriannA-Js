import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
import {createGeometry} from './Geometry.ts';
export function createFbx(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const {assetIdentity,assetMultiply,assetTRS,assetDet,assetTransform,assetNormals,assetCombine,assetLimit,assetResource}=createGeometry(engine);
interface FBXNodeData {name:string;properties:any[];children:FBXNodeData[];}

const fbxChild=(n:FBXNodeData|undefined,name:string)=>n?.children.find(c=>c.name===name);

const fbxArrays=new WeakMap<FBXNodeData,Map<string,number[]>>();

const fbxArray=(n:FBXNodeData|undefined,name:string):number[]=>{if(n){const cached=fbxArrays.get(n)?.get(name);if(cached)return cached;}const item=fbxChild(n,name);if(!item)return[];const values=Array.isArray(item.properties[0])?item.properties[0]:fbxChild(item,'a')?.properties??[];const out=values.map(Number);if(n){let cache=fbxArrays.get(n);if(!cache)fbxArrays.set(n,cache=new Map());cache.set(name,out);}return out;};

function fbxAscii(text:string):FBXNodeData {
        let offset=0;type Token={kind:string;value:any};let pending:Token|undefined;
        const next=():Token=>{if(pending){const t=pending;pending=undefined;return t;}while(offset<text.length){const c=text[offset];if(c===';' ){while(offset<text.length&&text[offset]!=='\n')offset++;continue;}if(c==='\r'||c===' '||c==='\t'){offset++;continue;}if(c==='\n'){offset++;return{kind:'newline',value:''};}if('{}:,'.includes(c)){offset++;return{kind:c,value:c};}if(c==='"'){offset++;let value='';while(offset<text.length&&text[offset]!=='"'){if(text[offset]==='\\'&&['"','\\'].includes(text[offset+1]))offset++;value+=text[offset++];}if(offset>=text.length)throw new Error('FBX: unterminated string');offset++;return{kind:'value',value};}const start=offset;while(offset<text.length&&!/[\s{}:,;]/.test(text[offset]))offset++;if(offset===start)throw new Error('FBX: invalid ASCII token');const raw=text.slice(start,offset);const value=/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)?Number(raw):raw;return{kind:'value',value:typeof value==='number'&&Number.isInteger(value)&&!Number.isSafeInteger(value)?raw:value};}return{kind:'end',value:null};};
        const peek=()=>pending??(pending=next());
        const nodes=(depth:number):FBXNodeData[]=>{if(depth>128)throw new Error('FBX: hierarchy too deep');const out:FBXNodeData[]=[];while(true){let token=next();if(token.kind==='newline'||token.kind===',')continue;if(token.kind==='end'){if(depth)throw new Error('FBX: unclosed node');return out;}if(token.kind==='}')return out;if(token.kind!=='value'||typeof token.value!=='string'||next().kind!==':')throw new Error('FBX: invalid node');const node:FBXNodeData={name:token.value,properties:[],children:[]};let continuation=false;
            while(true){token=peek();if(token.kind==='value'){node.properties.push(next().value);continuation=false;}else if(token.kind===','){next();continuation=true;}else if(token.kind==='newline'){next();if(continuation||node.name==='a'&&peek().kind==='value')continue;break;}else if(token.kind==='{'){next();node.children=nodes(depth+1);break;}else break;}out.push(node);}};
        return{name:'Root',properties:[],children:nodes(0)};
    }

async function fbxBinary(buffer:ArrayBuffer,options:ModelLoadOptions):Promise<FBXNodeData>{
        const view=new DataView(buffer),decoder=new TextDecoder();if(buffer.byteLength<27)throw new Error('FBX: truncated header');const version=view.getUint32(23,true);if(version<6400)throw new Error('FBX: binary version must be >= 6400');const wide=version>=7500,nullSize=wide?25:13;let offset=27,allocated=0;
        const check=(n:number)=>{if(offset+n>buffer.byteLength)throw new Error('FBX: truncated binary data');};const u32=()=>{check(4);const n=view.getUint32(offset,true);offset+=4;return n;};const u64=()=>{check(8);const value=view.getBigUint64(offset,true);offset+=8;if(value>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('FBX: unsafe offset/count');return Number(value);};const readString=(n:number)=>{check(n);const text=decoder.decode(buffer.slice(offset,offset+n));offset+=n;return text;};
        const property=async():Promise<any>=>{check(1);const type=String.fromCharCode(view.getUint8(offset++));const scalar=(size:number,read:()=>any)=>{check(size);const value=read();offset+=size;return value;};switch(type){case'Y':return scalar(2,()=>view.getInt16(offset,true));case'C':return scalar(1,()=>view.getUint8(offset)!==0);case'I':return scalar(4,()=>view.getInt32(offset,true));case'F':return scalar(4,()=>view.getFloat32(offset,true));case'D':return scalar(8,()=>view.getFloat64(offset,true));case'L':return scalar(8,()=>view.getBigInt64(offset,true).toString());case'S':return readString(u32());case'R':{const n=u32();check(n);const value=new Uint8Array(buffer.slice(offset,offset+n));offset+=n;return value;}}
            const sizes:Record<string,number>={f:4,d:8,i:4,l:8,b:1,c:1},size=sizes[type];if(!size)throw new Error('FBX: unknown property '+type);const count=u32(),encoding=u32(),length=u32();allocated+=count*Math.max(size,8);assetLimit(allocated,options);check(length);let bytes=new Uint8Array(buffer.slice(offset,offset+length));offset+=length;
            if(encoding===1){if(options.inflate)bytes=new Uint8Array(await options.inflate(bytes));else {if(typeof DecompressionStream==='undefined')throw new Error('FBX: compressed arrays require DecompressionStream or options.inflate');const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));const reader=stream.getReader(),chunks:Uint8Array[]=[];let total=0;try{while(true){options.signal?.throwIfAborted();const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>count*size)throw new Error('FBX: decompressed array exceeds declared size');chunks.push(part.value);}}finally{await reader.cancel();reader.releaseLock();}bytes=new Uint8Array(total);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}}}else if(encoding!==0)throw new Error('FBX: invalid array encoding');if(bytes.byteLength!==count*size)throw new Error('FBX: invalid array size');const data=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),values:any[]=new Array(count);for(let i=0;i<count;i++)values[i]=type==='f'?data.getFloat32(i*size,true):type==='d'?data.getFloat64(i*size,true):type==='i'?data.getInt32(i*size,true):type==='l'?data.getBigInt64(i*size,true).toString():data.getUint8(i*size);return values;
        };
        const node=async(depth:number):Promise<FBXNodeData|null>=>{if(depth>128)throw new Error('FBX: hierarchy too deep');options.signal?.throwIfAborted();check(nullSize);const start=offset,end=wide?u64():u32(),count=wide?u64():u32(),propertyBytes=wide?u64():u32();const nameLength=view.getUint8(offset++);if(end===0){if(count||propertyBytes||nameLength)throw new Error('FBX: invalid null record');return null;}if(end<=start||end>buffer.byteLength||offset+nameLength+propertyBytes>end||count>propertyBytes)throw new Error('FBX: invalid node offsets');const name=readString(nameLength),properties:any[]=[],propEnd=offset+propertyBytes;for(let i=0;i<count;i++)properties.push(await property());if(offset!==propEnd)throw new Error('FBX: property list length mismatch');const children:FBXNodeData[]=[];while(offset<end){const child=await node(depth+1);if(!child)break;children.push(child);}if(offset!==end)throw new Error('FBX: child record end mismatch');return{name,properties,children};};
        const children:FBXNodeData[]=[];while(offset+nullSize<=buffer.byteLength){const item=await node(0);if(!item)break;children.push(item);}return{name:'Root',properties:[version],children};
    }

function fbxProps(node:FBXNodeData|undefined):Record<string,any>{const result:Record<string,any>=Object.create(null);for(const p of fbxChild(node,'Properties70')?.children??[]){if(p.name==='P')result[String(p.properties[0])]=p.properties.length>5?p.properties.slice(4):p.properties[4];}return result;}

function fbxEuler(values:number[],order:number,inverse=false):number[]{const axes=[['X','Y','Z'],['X','Z','Y'],['Y','Z','X'],['Y','X','Z'],['Z','X','Y'],['Z','Y','X']][order];if(!axes)throw new Error('FBX: unsupported Euler rotation order');let q=new Quaternion();for(const axis of [...axes].reverse()){const i='XYZ'.indexOf(axis),v=new Vec3(i===0?1:0,i===1?1:0,i===2?1:0);q.multiply(new Quaternion().setFromAxisAngle(v,(values[i]??0)*Math.PI/180));}if(inverse){q=new Quaternion(-q.x,-q.y,-q.z,q.w);}return assetTRS([0,0,0],q.toArray());}

function fbxTriangulate(poly:number[],vertices:number[]):number[]{
        if(poly.length===3)return[0,1,2];let nx=0,ny=0,nz=0;for(let i=0;i<poly.length;i++){const a=poly[i]*3,b=poly[(i+1)%poly.length]*3;nx+=(vertices[a+1]-vertices[b+1])*(vertices[a+2]+vertices[b+2]);ny+=(vertices[a+2]-vertices[b+2])*(vertices[a]+vertices[b]);nz+=(vertices[a]-vertices[b])*(vertices[a+1]+vertices[b+1]);}const axis=Math.abs(nx)>=Math.abs(ny)&&Math.abs(nx)>=Math.abs(nz)?0:Math.abs(ny)>=Math.abs(nz)?1:2,xy=poly.map(v=>axis===0?[vertices[v*3+1],vertices[v*3+2]]:axis===1?[vertices[v*3],vertices[v*3+2]]:[vertices[v*3],vertices[v*3+1]]),cross=(a:number,b:number,c:number)=>(xy[b][0]-xy[a][0])*(xy[c][1]-xy[a][1])-(xy[b][1]-xy[a][1])*(xy[c][0]-xy[a][0]);let area=0;for(let i=0;i<xy.length;i++)area+=xy[i][0]*xy[(i+1)%xy.length][1]-xy[(i+1)%xy.length][0]*xy[i][1];const sign=area>=0?1:-1,remaining=poly.map((_,i)=>i),out:number[]=[];while(remaining.length>3){let found=false;for(let i=0;i<remaining.length;i++){const a=remaining[(i+remaining.length-1)%remaining.length],b=remaining[i],c=remaining[(i+1)%remaining.length];if(cross(a,b,c)*sign<=1e-12)continue;if(remaining.some(v=>v!==a&&v!==b&&v!==c&&cross(a,b,v)*sign>=-1e-12&&cross(b,c,v)*sign>=-1e-12&&cross(c,a,v)*sign>=-1e-12))continue;out.push(a,b,c);remaining.splice(i,1);found=true;break;}if(!found)throw new Error('FBX: degenerate/self-intersecting polygon');}out.push(...remaining);return out;
    }

const FBXLoader={
        async parse(input:string|ArrayBuffer,options:ModelLoadOptions={}):Promise<Model3DAsset>{
            assetLimit(typeof input==='string'?input.length*2:input.byteLength,options);const binary=typeof input!=='string'&&new TextDecoder().decode(input.slice(0,23))==='Kaydara FBX Binary  \x00\x1a\x00';const root=binary?await fbxBinary(input as ArrayBuffer,options):fbxAscii(typeof input==='string'?input:new TextDecoder().decode(input));
            const objects=fbxChild(root,'Objects');if(!objects)throw new Error('FBX: missing Objects');const connections=fbxChild(root,'Connections')?.children.filter(c=>c.name==='C')??[],models=objects.children.filter(n=>n.name==='Model'),geometries=objects.children.filter(n=>n.name==='Geometry'&&n.properties[2]==='Mesh'),warnings:string[]=[],primitives:ModelPrimitive[]=[];const ids=new Map(models.map(m=>[String(m.properties[0]),m])),worlds=new Map<string,number[]>(),visiting=new Set<string>();
            const modelWorld=(model:FBXNodeData,depth=0):number[]=>{const id=String(model.properties[0]);if(worlds.has(id))return worlds.get(id)!;if(visiting.has(id)||depth>128)throw new Error('FBX: cyclic model hierarchy');visiting.add(id);const p=fbxProps(model),v=(name:string,fallback:number[])=>Array.isArray(p[name])?p[name].map(Number):fallback,order=Number(p.RotationOrder??0),t=v('Lcl Translation',[0,0,0]),rotation=assetMultiply(assetMultiply(fbxEuler(v('PreRotation',[0,0,0]),0),fbxEuler(v('Lcl Rotation',[0,0,0]),order)),fbxEuler(v('PostRotation',[0,0,0]),0,true)),scale=v('Lcl Scaling',[1,1,1]),translation=(value:number[])=>assetTRS(value),negative=(value:number[])=>value.map(x=>-x),pivot=v('RotationPivot',[0,0,0]),sp=v('ScalingPivot',[0,0,0]);
                let local=translation(t);for(const matrix of [translation(v('RotationOffset',[0,0,0])),translation(pivot),rotation,translation(negative(pivot)),translation(v('ScalingOffset',[0,0,0])),translation(sp),assetTRS([0,0,0],[0,0,0,1],scale),translation(negative(sp))])local=assetMultiply(local,matrix);
                const parentLink=connections.find(c=>c.properties[0]==='OO'&&String(c.properties[1])===id&&ids.has(String(c.properties[2]))),parent=parentLink?modelWorld(ids.get(String(parentLink.properties[2]))!,depth+1):assetIdentity();let world=assetMultiply(parent,local);
                const inherit=Number(p.InheritType??0);if(parentLink&&inherit!==1){const parentScale=[Math.hypot(parent[0],parent[1],parent[2]),Math.hypot(parent[4],parent[5],parent[6]),Math.hypot(parent[8],parent[9],parent[10])];if(assetDet(parent)<0)parentScale[0]*=-1;const parentRotation=parent.slice();for(let col=0;col<3;col++)for(let row=0;row<3;row++)parentRotation[col*4+row]/=parentScale[col]||1;parentRotation[12]=parentRotation[13]=parentRotation[14]=0;let linear=assetMultiply(parentRotation,rotation);linear=assetMultiply(linear,assetTRS([0,0,0],[0,0,0,1],scale.map((x,i)=>x*(inherit===2?1:parentScale[i]))));for(let col=0;col<3;col++)for(let row=0;row<3;row++)world[col*4+row]=linear[col*4+row];}
                if(![0,1,2].includes(inherit))throw new Error('FBX: unsupported transform inheritance');visiting.delete(id);worlds.set(id,world);return world;};
            const global=fbxProps(fbxChild(root,'GlobalSettings')),unit=options.unitScale??Number(global.UnitScaleFactor??1)/100;if(!Number.isFinite(unit)||unit<=0)throw new Error('FBX: invalid unit scale');let basis=assetTRS([0,0,0],[0,0,0,1],[unit,unit,unit]);if(options.convertAxes!==false){const up=Number(global.UpAxis??1),front=Number(global.FrontAxis??2),coord=Number(global.CoordAxis??0);if(new Set([up,front,coord]).size!==3||[up,front,coord].some(v=>v<0||v>2))throw new Error('FBX: invalid axis settings');basis=new Array(16).fill(0);basis[coord*4]=unit*Number(global.CoordAxisSign??1);basis[up*4+1]=unit*Number(global.UpAxisSign??1);basis[front*4+2]=-unit*Number(global.FrontAxisSign??-1);basis[15]=1;}
            for(const geometry of geometries){options.signal?.throwIfAborted();const verts=fbxArray(geometry,'Vertices'),polys=fbxArray(geometry,'PolygonVertexIndex');if(verts.length%3||verts.some(v=>!Number.isFinite(v)))throw new Error('FBX: invalid vertices');const normalLayer=fbxChild(geometry,'LayerElementNormal'),uvLayer=fbxChild(geometry,'LayerElementUV'),colorLayer=fbxChild(geometry,'LayerElementColor'),materialLayer=fbxChild(geometry,'LayerElementMaterial');
                const value=(layer:FBXNodeData|undefined,array:string,indexArray:string,width:number,vertex:number,corner:number,polygon:number):number[]|undefined=>{if(!layer)return;const mapping=fbxChild(layer,'MappingInformationType')?.properties[0],reference=fbxChild(layer,'ReferenceInformationType')?.properties[0];let at=mapping==='ByPolygonVertex'?corner:mapping==='ByVertice'||mapping==='ByVertex'?vertex:mapping==='ByPolygon'?polygon:mapping==='AllSame'?0:-1;if(at<0)throw new Error('FBX: unsupported layer mapping '+mapping);const data=fbxArray(layer,array);if(reference==='IndexToDirect'||reference==='Index'){const indices=fbxArray(layer,indexArray);if(array==='Materials'){if(!Number.isInteger(data[at])||data[at]<0)throw new Error('FBX: invalid material layer index');return[data[at]];}at=indices[at];}else if(reference!=='Direct')throw new Error('FBX: unsupported reference '+reference);if(!Number.isInteger(at)||at<0||at*width+width>data.length)throw new Error('FBX: invalid layer index');return data.slice(at*width,at*width+width);};
                const groups=new Map<number,{positions:number[];normals:number[];uvs:number[];colors:number[]}>();let poly:number[]=[],corners:number[]=[],polygon=0;for(let c=0;c<polys.length;c++){const encoded=polys[c],vertex=encoded<0?-encoded-1:encoded;if(!Number.isInteger(vertex)||vertex<0||vertex>=verts.length/3)throw new Error('FBX: invalid polygon index');poly.push(vertex);corners.push(c);if(encoded>=0)continue;if(poly.length<3)throw new Error('FBX: polygon needs three vertices');const mat=value(materialLayer,'Materials','Materials',1,poly[0],corners[0],polygon)?.[0]??0;let group=groups.get(mat);if(!group){group={positions:[],normals:[],uvs:[],colors:[]};groups.set(mat,group);}for(const local of fbxTriangulate(poly,verts)){const v=poly[local],corner=corners[local];group.positions.push(...verts.slice(v*3,v*3+3));const normal=value(normalLayer,'Normals','NormalsIndex',3,v,corner,polygon),uv=value(uvLayer,'UV','UVIndex',2,v,corner,polygon),color=value(colorLayer,'Colors','ColorIndex',4,v,corner,polygon);if(normal)group.normals.push(...normal);if(uv)group.uvs.push(...uv);if(color)group.colors.push(...color.slice(0,3));}poly=[];corners=[];polygon++;}if(poly.length)throw new Error('FBX: unterminated polygon');
                const linked=connections.filter(c=>c.properties[0]==='OO'&&String(c.properties[1])===String(geometry.properties[0])&&ids.has(String(c.properties[2]))).map(c=>ids.get(String(c.properties[2]))!);const instances=linked.length?linked:[undefined];for(const model of instances){const props=fbxProps(model),geometric=assetTRS(Array.isArray(props.GeometricTranslation)?props.GeometricTranslation:[0,0,0]);let gm=assetMultiply(geometric,fbxEuler(Array.isArray(props.GeometricRotation)?props.GeometricRotation:[0,0,0],0));gm=assetMultiply(gm,assetTRS([0,0,0],[0,0,0,1],Array.isArray(props.GeometricScaling)?props.GeometricScaling:[1,1,1]));const matrix=assetMultiply(basis,assetMultiply(model?modelWorld(model):assetIdentity(),gm));const materialIds=connections.filter(c=>c.properties[0]==='OO'&&String(c.properties[2])===String(model?.properties[0])&&objects.children.some(n=>n.name==='Material'&&String(n.properties[0])===String(c.properties[1]))).map(c=>String(c.properties[1]));
                    for(const [material,g]of groups){const positions=new Float32Array(g.positions),count=positions.length/3;primitives.push({format:'fbx',name:String(model?.properties[1]??geometry.properties[1]).replace(/\x00\x01.*$/,'').replace(/^\w+::/,''),node:model?String(model.properties[0]):undefined,material:materialIds[material],matrix,mode:4,positions,normals:g.normals.length?new Float32Array(g.normals):undefined,uvs:g.uvs.length?new Float32Array(g.uvs):undefined,colors:g.colors.length?new Float32Array(g.colors):undefined,indices:Uint32Array.from({length:count},(_,i)=>i),vertexCount:count,triangleCount:count/3});}}
            }
            if(!primitives.length)throw new Error('FBX: no polygon mesh geometry');const materials=objects.children.filter(n=>n.name==='Material').map(n=>({id:String(n.properties[0]),name:n.properties[1],...fbxProps(n)})),animations=objects.children.filter(n=>n.name.startsWith('Animation')).map(n=>({id:String(n.properties[0]),type:n.name,properties:n.properties,children:n.children})),skins=objects.children.filter(n=>n.name==='Deformer').map(n=>({id:String(n.properties[0]),properties:n.properties,children:n.children})),images=objects.children.filter(n=>n.name==='Texture'||n.name==='Video').map(n=>({id:String(n.properties[0]),properties:n.properties,children:n.children}));if(skins.length||animations.length)warnings.push('FBX deformers/animation curves are retained; runtime skinning/animation playback is not implemented.');if(images.length)warnings.push('FBX texture/video descriptors are retained; external image binding is application-owned.');
            return assetCombine('fbx',primitives,{materials,nodes:models.map(n=>({id:String(n.properties[0]),name:n.properties[1],matrix:modelWorld(n),properties:fbxProps(n)})),animations,skins,images,warnings,source:root},options);
        },
        async load(url:string,options:ModelLoadOptions={}):Promise<Model3DAsset>{const response=await fetch(url,{signal:options.signal});if(!response.ok)throw new Error('FBXLoader: HTTP '+response.status);return this.parse(await response.arrayBuffer(),{...options,baseURL:options.baseURL??response.url??url});}
    };
return {FBXLoader};
}
/** Static triangle geometry, ASCII FBX 7.4, metres and Y-up. No rig/material export. */
export function writeFbx(mesh:Mesh3DLike):string {
 const p=mesh.positions,indices=mesh.indices?.length?mesh.indices:Uint32Array.from({length:p.length/3},(_,i)=>i);
 const polygon=Array.from(indices,(v,i)=>i%3===2?-v-1:v);
 return `; FBX 7.4.0 project file
FBXHeaderExtension: {
 FBXHeaderVersion: 1003
 FBXVersion: 7400
 Creator: "AriannA"
}
GlobalSettings: {
 Version: 1000
 Properties70: {
  P: "UpAxis", "int", "Integer", "",1
  P: "UpAxisSign", "int", "Integer", "",1
  P: "FrontAxis", "int", "Integer", "",2
  P: "FrontAxisSign", "int", "Integer", "",-1
  P: "CoordAxis", "int", "Integer", "",0
  P: "CoordAxisSign", "int", "Integer", "",1
  P: "UnitScaleFactor", "double", "Number", "",100
 }
}
Definitions: {
 Version: 100
 Count: 2
 ObjectType: "Geometry" { Count: 1 }
 ObjectType: "Model" { Count: 1 }
}
Objects: {
 Geometry: 1001, "Geometry::Mesh", "Mesh" {
  GeometryVersion: 124
  Vertices: *${p.length} { a: ${Array.from(p).join(',')} }
  PolygonVertexIndex: *${polygon.length} { a: ${polygon.join(',')} }
 }
 Model: 1002, "Model::Mesh", "Mesh" {
  Version: 232
  Properties70: {
   P: "Lcl Translation", "Lcl Translation", "", "A",0,0,0
   P: "Lcl Rotation", "Lcl Rotation", "", "A",0,0,0
   P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
  }
  Shading: T
  Culling: "CullingOff"
 }
}
Connections: {
 C: "OO",1001,1002
 C: "OO",1002,0
}
`;
}
