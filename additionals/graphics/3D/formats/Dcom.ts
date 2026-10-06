/** DICOM image import through an explicitly initialized Cornerstone instance.
 * DICOM images remain images: mesh conversion requires a separate segmentation operation.
 */
export interface DcomImage { imageId:string; rows:number; columns:number; getPixelData():ArrayLike<number>; }
export interface DcomRuntime {
 imageLoader:{loadImage(imageId:string,options?:Record<string,unknown>):Promise<DcomImage>};
 wadouri:{fileManager:{add(file:Blob):string;remove(index:number):void}};
}
export interface DcomAsset {kind:'dicom-image';format:'dcom';image:DcomImage;source:Blob;dispose():void;}
export class Dcom {
 static readNative=readNativeDcom;
 static loadSeries=loadDcomSeries;
 static surface=surfaceDcom;
 static slice=sliceDcom;
 constructor(private readonly runtime:DcomRuntime){}
 async import(input:Blob|ArrayBuffer,options:Record<string,unknown>={}):Promise<DcomAsset>{
  const source=input instanceof Blob?input:new Blob([input],{type:'application/dicom'});
  const id=this.runtime.wadouri.fileManager.add(source),match=/^dicomfile:(\d+)$/.exec(id);
  if(!match)throw new Error('Dcom: unexpected Cornerstone file identifier '+id);
  let disposed=false;const dispose=()=>{if(!disposed){disposed=true;this.runtime.wadouri.fileManager.remove(Number(match[1]));}};
  try{const image=await this.runtime.imageLoader.loadImage(id,options);return{kind:'dicom-image',format:'dcom',image,source,dispose};}catch(error){dispose();throw error;}
 }
 /** Lossless byte-for-byte export of the original instance; never claims to encode edited pixels. */
 exportOriginal(asset:DcomAsset):Promise<ArrayBuffer>{return asset.source.arrayBuffer();}
}
export default Dcom;

export interface NativeDcomImage extends DcomImage {
 seriesUID:string;position:number[];orientation:number[];
 windowCenter:number;windowWidth:number;photometric:string;pixelSpacing:[number,number];
 getPixelData():Float32Array;
 rgba():Uint8ClampedArray;
}
/** Explicit-VR Little-Endian, uncompressed, single-frame MONOCHROME1/2 Part 10.
 * Other transfer syntaxes must use the Cornerstone adapter; never guess a decoder.
 */
export function readNativeDcom(buffer:ArrayBuffer):NativeDcomImage{
 const view=new DataView(buffer),bytes=new Uint8Array(buffer),text=new TextDecoder();
 if(bytes.length<132||text.decode(bytes.subarray(128,132))!=='DICM')throw new Error('DICOM Part 10 header required');
 const tags=new Map<number,{offset:number;length:number}>(),long=new Set(['OB','OD','OF','OL','OV','OW','SQ','UC','UR','UT','UN']);
 const string=(tag:number,fallback='')=>{const t=tags.get(tag);return t?text.decode(bytes.subarray(t.offset,t.offset+t.length)).replace(/\0/g,'').trim():fallback;};
 const need=(p:number,n:number,end:number)=>{if(p<0||n<0||p+n>end)throw new Error('Truncated DICOM data');};
 const scan=(start:number,end:number,depth:number,delimiter?:number):number=>{
  if(depth>32)throw new Error('DICOM nesting limit');let p=start;
  while(p<end){need(p,8,end);const group=view.getUint16(p,true),element=view.getUint16(p+2,true),tag=group*65536+element;
   if(group===0xfffe){const n=view.getUint32(p+4,true);p+=8;if(element===0xe00d||element===0xe0dd){if(element!==delimiter||n!==0)throw new Error('Invalid DICOM delimiter');return p;}if(element!==0xe000)throw new Error('Invalid DICOM item');if(n===0xffffffff)p=scan(p,end,depth+1,0xe00d);else{need(p,n,end);p+=n;}continue;}
   if(depth===0&&group!==2&&string(0x00020010)!=='1.2.840.10008.1.2.1')throw new Error('Native DICOM requires Explicit VR Little Endian; use Cornerstone for this transfer syntax');
   const vr=text.decode(bytes.subarray(p+4,p+6));if(!/^[A-Z]{2}$/.test(vr))throw new Error('Invalid DICOM VR');const header=long.has(vr)?12:8;need(p,header,end);const n=header===12?view.getUint32(p+8,true):view.getUint16(p+6,true);p+=header;
   if(n===0xffffffff){if(depth===0)tags.set(tag,{offset:p,length:0});if(vr!=='SQ')throw new Error('Encapsulated DICOM pixels require Cornerstone');p=scan(p,end,depth+1,0xe0dd);continue;}
   need(p,n,end);if(depth===0)tags.set(tag,{offset:p,length:n});p+=n;
  }if(delimiter!==undefined)throw new Error('Missing DICOM delimiter');return p;
 };
 scan(132,bytes.length,0);
 const us=(tag:number,defaultValue=0)=>{const t=tags.get(tag);if(!t)return defaultValue;if(t.length!==2)throw new Error('Invalid DICOM US');return view.getUint16(t.offset,true);};
 const rows=us(0x00280010),columns=us(0x00280011),bits=us(0x00280100),stored=us(0x00280101),high=us(0x00280102),signed=us(0x00280103),photo=string(0x00280004),count=rows*columns;
 if(Number(string(0x00280008,'1'))!==1)throw new Error('Native preview supports single-frame instances; use Cornerstone for multi-frame');
 if(!rows||!columns||count>16777216||us(0x00280002)!==1||!['MONOCHROME1','MONOCHROME2'].includes(photo)||![8,16].includes(bits)||stored<1||stored>bits||high!==stored-1||signed>1)throw new Error('Unsupported native DICOM pixel layout');
 if(tags.has(0x00283000)||tags.has(0x00283010))throw new Error('DICOM modality/VOI LUT sequences require Cornerstone');
 const voi=string(0x00281056,'LINEAR');if(voi!=='LINEAR')throw new Error('Native preview supports LINEAR VOI only');
 const pixel=tags.get(0x7fe00010);if(!pixel||pixel.length<count*bits/8)throw new Error('Missing/truncated PixelData');
 const slope=Number(string(0x00281053,'1')),intercept=Number(string(0x00281052,'0'));if(!Number.isFinite(slope)||!Number.isFinite(intercept))throw new Error('Invalid modality rescale');
 const data=new Float32Array(count),mask=2**stored-1;let min=Infinity,max=-Infinity;
 for(let i=0;i<count;i++){let v=(bits===16?view.getUint16(pixel.offset+i*2,true):view.getUint8(pixel.offset+i))&mask;if(signed&&v>=2**(stored-1))v-=2**stored;v=v*slope+intercept;data[i]=v;min=Math.min(min,v);max=Math.max(max,v);}
 const width=Number(string(0x00281051,String(Math.max(1,max-min+1))).split('\\')[0]),center=Number(string(0x00281050,String((max+min+1)/2)).split('\\')[0]);if(!Number.isFinite(width)||width<1||!Number.isFinite(center))throw new Error('Invalid VOI window');
 const spacing=string(0x00280030,'1\\1').split('\\').map(Number);if(spacing.length!==2||spacing.some(n=>!Number.isFinite(n)||n<=0))throw new Error('Invalid pixel spacing');
 return{seriesUID:string(0x0020000e),position:string(0x00200032).split('\\').map(Number),orientation:string(0x00200037).split('\\').map(Number),imageId:'arianna:native-dicom',rows,columns,windowCenter:center,windowWidth:width,photometric:photo,pixelSpacing:spacing as [number,number],getPixelData:()=>data,rgba:()=>{const out=new Uint8ClampedArray(count*4);for(let i=0;i<count;i++){const p=data[i];let v=width===1?(p<=center-.5?0:255):Math.min(255,Math.max(0,((p-(center-.5))/(width-1)+.5)*255));if(photo==='MONOCHROME1')v=255-v;out[i*4]=out[i*4+1]=out[i*4+2]=v;out[i*4+3]=255;}return out;}};
}

export interface DcomVolume {
 dimensions:[number,number,number];spacing:[number,number,number];origin:number[];direction:number[];
 photometric?:string;pixels:Float32Array;min:number;max:number;windowCenter:number;windowWidth:number;seriesUID:string;
 series:{uid:string;instances:number}[];
}
export interface DcomSurface {positions:Float32Array;normals:Float32Array;indices:Uint32Array;threshold:number;step:number;steps:[number,number,number];}
export interface DcomSeriesOptions {signal?:AbortSignal;onProgress?:(fraction:number)=>void;seriesUID?:string;maxBytes?:number;}
export interface DcomSurfaceOptions {signal?:AbortSignal;onProgress?:(fraction:number)=>void;threshold?:number;step?:number;maxTriangles?:number;spacingMm?:number;smoothing?:number;minComponentTriangles?:number;}
/** Worker-only ZIP decoder. STORE and DEFLATE, central-directory sizes, CRC32 and expanded limits. */
async function dcomZip(buffer:ArrayBuffer,maxBytes:number):Promise<ArrayBuffer[]> {
 const v=new DataView(buffer),b=new Uint8Array(buffer),decoder=new TextDecoder();
 if(b.length>maxBytes)throw Error('ZIP exceeds compressed size limit');
 let e=b.length-22;for(;e>=Math.max(0,b.length-65557);e--)if(v.getUint32(e,true)===0x06054b50&&e+22+v.getUint16(e+20,true)===b.length)break;
 if(e<0||e<Math.max(0,b.length-65557))throw Error('ZIP end record missing');
 if(v.getUint16(e+4,true)||v.getUint16(e+6,true)||v.getUint16(e+8,true)!==v.getUint16(e+10,true))throw Error('Multi-disk ZIP unsupported');
 const count=v.getUint16(e+10,true),end=v.getUint32(e+16,true)+v.getUint32(e+12,true);let p=v.getUint32(e+16,true),total=0;
 if(count===65535||count>4096||end>e)throw Error('ZIP64 or entry limit unsupported');
 const entries:{offset:number;packed:number;size:number;method:number;crc:number}[]=[],names=new Set<string>();
 for(let i=0;i<count;i++){
  if(p+46>end||v.getUint32(p,true)!==0x02014b50)throw Error('Invalid ZIP directory');
  const flags=v.getUint16(p+8,true),method=v.getUint16(p+10,true),packed=v.getUint32(p+20,true),size=v.getUint32(p+24,true),n=v.getUint16(p+28,true),x=v.getUint16(p+30,true),c=v.getUint16(p+32,true),offset=v.getUint32(p+42,true);
  if(p+46+n+x+c>end)throw Error('Truncated ZIP directory');
  const name=decoder.decode(b.subarray(p+46,p+46+n));p+=46+n+x+c;
  if(name.startsWith('/')||name.includes('\\')||name.includes('\0')||name.split('/').includes('..')||names.has(name))throw Error('Unsafe/duplicate ZIP path');names.add(name);
  total+=size;if(total>maxBytes||offset+30>b.length)throw Error('Expanded ZIP size limit or invalid offset');
  if(name.endsWith('/')||name.startsWith('__MACOSX/')||/\.(json|txt|md|jpg|png|pdf)$/i.test(name))continue;
  if(flags&1||![0,8].includes(method))throw Error('Encrypted/unsupported ZIP compression');
  entries.push({offset,packed,size,method,crc:v.getUint32(p-46-n-x-c+16,true)});
 }
 const table=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;}),out:ArrayBuffer[]=[];
 for(const item of entries){
  const q=item.offset;if(v.getUint32(q,true)!==0x04034b50)throw Error('Invalid ZIP local header');const start=q+30+v.getUint16(q+26,true)+v.getUint16(q+28,true);
  if(start+item.packed>end)throw Error('Truncated ZIP data');let bytes:Uint8Array;
  if(item.method===0)bytes=b.slice(start,start+item.packed);
  else{
   if(typeof DecompressionStream==='undefined')throw Error('DEFLATE decompression unavailable in this browser');
   const stream=new Blob([b.slice(start,start+item.packed)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
   const reader=stream.getReader(),parts:Uint8Array[]=[];let length=0;
   while(true){const r=await reader.read();if(r.done)break;length+=r.value.length;if(length>item.size){await reader.cancel();throw Error('ZIP expanded size mismatch');}parts.push(r.value);}
   bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  }
  if(bytes.length!==item.size)throw Error('ZIP entry size mismatch');let crc=0xffffffff;for(const value of bytes)crc=table[(crc^value)&255]^(crc>>>8);if(((crc^0xffffffff)>>>0)!==item.crc)throw Error('ZIP CRC mismatch');
  if(bytes.length>=132&&decoder.decode(bytes.subarray(128,132))==='DICM')out.push(bytes.buffer as ArrayBuffer);
 }
 if(!out.length)throw Error('No Part 10 DICOM instances found');return out;
}
/** Assemble parallel, regularly spaced slices in patient coordinates. Reject inconsistent geometry. */
export function assembleDcomSeries(images:NativeDcomImage[],seriesUID?:string):DcomVolume {
 const groups=new Map<string,NativeDcomImage[]>();for(const image of images){if(!image.seriesUID)throw Error('Missing SeriesInstanceUID');const a=groups.get(image.seriesUID)||[];a.push(image);groups.set(image.seriesUID,a);}
 const series=Array.from(groups,([uid,a])=>({uid,instances:a.length})).sort((a,b)=>b.instances-a.instances);
 const selected=seriesUID||series[0]?.uid,a=groups.get(selected);if(!a?.length)throw Error('Requested DICOM series missing');
 const first=a[0],o=first.orientation;if(o.length!==6||o.some(n=>!Number.isFinite(n)))throw Error('Missing ImageOrientationPatient');
 const u=o.slice(0,3),w=o.slice(3),dot=(a:number[],b:number[])=>a.reduce((s,x,i)=>s+x*b[i],0),normal=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
 if(Math.abs(dot(u,u)-1)>.001||Math.abs(dot(w,w)-1)>.001||Math.abs(dot(u,w))>.001)throw Error('Invalid DICOM orientation');
 for(const image of a)if(image.rows!==first.rows||image.columns!==first.columns||image.orientation.length!==6||image.orientation.some((n,i)=>Math.abs(n-o[i])>.0001)||image.position.length!==3||image.position.some(n=>!Number.isFinite(n))||image.pixelSpacing.some((n,i)=>Math.abs(n-first.pixelSpacing[i])>.0001))throw Error('Mixed DICOM dimensions, spacing or orientation');
 a.sort((x,y)=>dot(x.position,normal)-dot(y.position,normal));
 const positions=a.map(x=>dot(x.position,normal)),dz=a.length>1?(positions[a.length-1]-positions[0])/(a.length-1):1;
 if(dz<=0)throw Error('Duplicate DICOM slice positions');
 for(let i=1;i<a.length;i++){
  if(Math.abs(positions[i]-positions[i-1]-dz)>Math.max(.01,dz*.01))throw Error('Irregular/missing DICOM slices; resampling required');
  const delta=a[i].position.map((v,j)=>v-a[0].position[j]);if(Math.abs(dot(delta,u))>.01||Math.abs(dot(delta,w))>.01)throw Error('Sheared series requires resampling');
 }
 const size=first.rows*first.columns;if(size*a.length>67108864)throw Error('Volume exceeds 64 million voxel limit');
 const pixels=new Float32Array(size*a.length);let min=Infinity,max=-Infinity;
 a.forEach((image,i)=>{const data=image.getPixelData();pixels.set(data,i*size);for(const v of data){min=Math.min(min,v);max=Math.max(max,v);}});
 return{photometric:first.photometric,dimensions:[first.columns,first.rows,a.length],spacing:[first.pixelSpacing[1],first.pixelSpacing[0],dz],origin:a[0].position.slice(),direction:[...u,...w,...normal],pixels,min,max,windowCenter:first.windowCenter,windowWidth:first.windowWidth,seriesUID:selected,series};
}
/** Marching tetrahedra surface, in millimetres. Threshold is intensity, not anatomical segmentation. */
export function extractDcomSurface(volume:DcomVolume,options:Omit<DcomSurfaceOptions,'signal'>={}):DcomSurface {
 const [nx,ny,nz]=volume.dimensions,step=Math.max(1,Math.min(16,Math.round(options.step??4))),threshold=options.threshold??volume.windowCenter,limit=Math.min(500000,Math.max(1,options.maxTriangles??20000));
 if(!Number.isFinite(threshold)||nx<2||ny<2||nz<2)throw Error('A surface needs at least two slices and a finite threshold');
 const steps=volume.spacing.map(sp=>options.spacingMm===undefined?step:Math.max(1,Math.round(options.spacingMm/sp))) as [number,number,number];
 if(steps.some(n=>!Number.isFinite(n))||options.spacingMm!==undefined&&options.spacingMm<=0)throw Error('spacingMm must be positive and finite');
 const positions:number[]=[],normals:number[]=[],indices:number[]=[],tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
 const world=(p:number[])=>volume.origin.map((v,k)=>v+p[0]*volume.spacing[0]*volume.direction[k]+p[1]*volume.spacing[1]*volume.direction[3+k]+p[2]*volume.spacing[2]*volume.direction[6+k]);
 const triangle=(a:number[],b:number[],c:number[],outward:number[])=>{
  let ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]),n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];const length=Math.hypot(...n);if(length<1e-12)return;
  if(n.reduce((s,v,i)=>s+v*outward[i],0)<0){[b,c]=[c,b];n=n.map(v=>-v);}n=n.map(v=>v/length);
  if(indices.length/3>=limit)throw Error('Surface triangle budget exceeded; increase sampling step or change threshold');
  for(const p of [a,b,c]){indices.push(positions.length/3);positions.push(...p);normals.push(...n);}
 };
 for(let z=0;z<nz-1;z+=steps[2]){options.onProgress?.(z/(nz-1));for(let y=0;y<ny-1;y+=steps[1])for(let x=0;x<nx-1;x+=steps[0]){
  const xx=Math.min(x+steps[0],nx-1),yy=Math.min(y+steps[1],ny-1),zz=Math.min(z+steps[2],nz-1),p=[[x,y,z],[xx,y,z],[xx,yy,z],[x,yy,z],[x,y,zz],[xx,y,zz],[xx,yy,zz],[x,yy,zz]],v=p.map(([x,y,z])=>volume.pixels[(z*ny+y)*nx+x]);
  if(v.every(n=>n<threshold)||v.every(n=>n>=threshold))continue;
  for(const t of tetra){const inside=t.filter(i=>v[i]>=threshold),outside=t.filter(i=>v[i]<threshold);if(!inside.length||!outside.length)continue;
   const cross=(i:number,j:number)=>world(p[i].map((n,k)=>n+(p[j][k]-n)*(threshold-v[i])/(v[j]-v[i]))),centroid=(a:number[])=>[0,1,2].map(k=>a.reduce((s,i)=>s+world(p[i])[k],0)/a.length),ci=centroid(inside),co=centroid(outside),out=co.map((n,k)=>n-ci[k]);
   if(inside.length===1){const i=inside[0];triangle(cross(i,outside[0]),cross(i,outside[1]),cross(i,outside[2]),out);}
   else if(inside.length===3){const j=outside[0];triangle(cross(inside[0],j),cross(inside[1],j),cross(inside[2],j),out);}
   else{const [a,b]=inside,[c,d]=outside,q=[cross(a,c),cross(a,d),cross(b,d),cross(b,c)];triangle(q[0],q[1],q[2],out);triangle(q[0],q[2],q[3],out);}
  }
 }
 }
 if(!indices.length)throw Error('No surface at this threshold');
 // Weld shared edge intersections before smoothing; retain physical coordinates.
 const welded:number[]=[],ids:number[]=[],lookup=new Map<string,number>();
 for(let i=0;i<positions.length;i+=3){const p=positions.slice(i,i+3),key=p.map(n=>n.toFixed(6)).join(',');let id=lookup.get(key);if(id===undefined){id=welded.length/3;lookup.set(key,id);welded.push(...p);}ids.push(id);}
 let faces=indices.map(i=>ids[i]).filter((_,i,a)=>{const t=i-i%3;return a[t]!==a[t+1]&&a[t+1]!==a[t+2]&&a[t]!==a[t+2];});
 const neighbors=Array.from({length:welded.length/3},()=>new Set<number>());
 for(let i=0;i<faces.length;i+=3)for(let j=0;j<3;j++){const a=faces[i+j],b=faces[i+(j+1)%3];neighbors[a].add(b);neighbors[b].add(a);}
 if((options.minComponentTriangles??0)>0){const labels=new Int32Array(neighbors.length).fill(-1),sizes:number[]=[];let group=0;
 for(let i=0;i<labels.length;i++)if(labels[i]<0){const queue=[i];labels[i]=group;for(let q=0;q<queue.length;q++)for(const n of neighbors[queue[q]])if(labels[n]<0){labels[n]=group;queue.push(n);}sizes.push(0);group++;}
 for(let i=0;i<faces.length;i+=3)sizes[labels[faces[i]]]++;
 faces=faces.filter((v,i)=>sizes[labels[faces[i-i%3]]] >= (options.minComponentTriangles??0));}
 if(!faces.length)throw Error('No components remain; reduce fragment filter');
 const smooth=(factor:number)=>{const next=welded.slice();for(let i=0;i<neighbors.length;i++){const ns=neighbors[i];if(!ns.size)continue;for(let k=0;k<3;k++){let sum=0;for(const n of ns)sum+=welded[n*3+k];next[i*3+k]+=factor*(sum/ns.size-welded[i*3+k]);}}for(let i=0;i<welded.length;i++)welded[i]=next[i];};
 for(let i=0;i<Math.min(10,Math.max(0,Math.round(options.smoothing??0)));i++){smooth(.5);smooth(-.53);}
 const smoothNormals=new Float32Array(welded.length);
 for(let i=0;i<faces.length;i+=3){const a=faces[i]*3,b=faces[i+1]*3,c=faces[i+2]*3,u=[0,1,2].map(k=>welded[b+k]-welded[a+k]),v=[0,1,2].map(k=>welded[c+k]-welded[a+k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const j of [a,b,c])for(let k=0;k<3;k++)smoothNormals[j+k]+=n[k];}
 for(let i=0;i<smoothNormals.length;i+=3){const l=Math.hypot(smoothNormals[i],smoothNormals[i+1],smoothNormals[i+2])||1;for(let k=0;k<3;k++)smoothNormals[i+k]/=l;}
 const used=new Map<number,number>(),compact:number[]=[],compactNormals:number[]=[];
 const compactFaces=faces.map(id=>{let n=used.get(id);if(n===undefined){n=used.size;used.set(id,n);compact.push(...welded.slice(id*3,id*3+3));compactNormals.push(...smoothNormals.slice(id*3,id*3+3));}return n;});
 options.onProgress?.(1);
 return{positions:new Float32Array(compact),normals:new Float32Array(compactNormals),indices:new Uint32Array(compactFaces),threshold,step,steps};
}
/** Public async APIs never run decoding/surface extraction on the UI thread. */
function dcomWorker<T>(job:unknown,signal?:AbortSignal,onProgress?:(fraction:number)=>void):Promise<T>{
 if(typeof Worker==='undefined')return Promise.reject(Error('DICOM series requires Web Workers'));
 const code=Object.entries({readNativeDcom,dcomZip,assembleDcomSeries,extractDcomSurface}).map(([name,fn])=>'const '+name+' = '+fn.toString()+';').join('\n')+`\nself.onmessage=async(event)=>{try{const j=event.data;let result;if(j.kind==='series'){const buffers=j.zip?await dcomZip(j.zip,j.maxBytes):j.buffers;const images=[];for(let i=0;i<buffers.length;i++){images.push(readNativeDcom(buffers[i]));self.postMessage({progress:(i+1)/buffers.length});}result=assembleDcomSeries(images,j.seriesUID);self.postMessage({result},[result.pixels.buffer]);}else{result=extractDcomSurface(j.volume,{...j.options,onProgress:progress=>self.postMessage({progress})});self.postMessage({result},[result.positions.buffer,result.normals.buffer,result.indices.buffer]);}}catch(error){self.postMessage({error:String(error.message||error)});}};`;
 return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('Aborted','AbortError'));return;}
  const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));let worker:Worker;try{worker=new Worker(url);}catch(e){URL.revokeObjectURL(url);reject(e);return;}
  const cleanup=()=>{worker.terminate();URL.revokeObjectURL(url);signal?.removeEventListener('abort',abort);},abort=()=>{cleanup();reject(new DOMException('Aborted','AbortError'));};
  signal?.addEventListener('abort',abort,{once:true});worker.onerror=e=>{cleanup();reject(Error(e.message));};worker.onmessage=e=>{if(e.data.progress!==undefined){onProgress?.(e.data.progress);return;}cleanup();if(e.data.error)reject(Error(e.data.error));else resolve(e.data.result);};
  try{worker.postMessage(job);}catch(e){cleanup();reject(e);}
 });
}
export async function loadDcomSeries(input:Blob|ArrayBuffer|ArrayBuffer[],options:DcomSeriesOptions={}):Promise<DcomVolume>{
 const maxBytes=options.maxBytes??268435456;
 const data=input instanceof Blob?await input.arrayBuffer():input;
 if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
 if(Array.isArray(data)){if(data.reduce((s,b)=>s+b.byteLength,0)>maxBytes)throw Error('DICOM series size limit');return dcomWorker({kind:'series',buffers:data,seriesUID:options.seriesUID},options.signal,options.onProgress);}
 if(data.byteLength>maxBytes)throw Error('DICOM series size limit');
 const zip=data.byteLength>=4&&new DataView(data).getUint32(0,true)===0x04034b50;
 return dcomWorker({kind:'series',...(zip?{zip:data,maxBytes}:{buffers:[data]}),seriesUID:options.seriesUID},options.signal,options.onProgress);
}
export function surfaceDcom(volume:DcomVolume,options:DcomSurfaceOptions={}):Promise<DcomSurface>{
 return dcomWorker({kind:'surface',volume,options:{threshold:options.threshold,step:options.step,maxTriangles:options.maxTriangles,spacingMm:options.spacingMm,smoothing:options.smoothing,minComponentTriangles:options.minComponentTriangles}},options.signal,options.onProgress);
}

/** Orthogonal acquisition-grid slice; spacing is returned for undistorted display.
 * These planes follow the acquisition axes, not a patient-axis oblique reslice. */
export function sliceDcom(volume:DcomVolume,axis:0|1|2,index:number,center=volume.windowCenter,width=volume.windowWidth){
 if(![0,1,2].includes(axis)||!Number.isFinite(index)||!Number.isFinite(center)||!Number.isFinite(width)||width<1)throw Error('Invalid slice or window');
 const axes=([0,1,2] as const).filter(a=>a!==axis),[u,v]=axes,w=volume.dimensions[u],h=volume.dimensions[v],at=Math.max(0,Math.min(volume.dimensions[axis]-1,Math.round(index))),rgba=new Uint8ClampedArray(w*h*4),p=[0,0,0];p[axis]=at;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){p[u]=x;p[v]=y;const value=volume.pixels[(p[2]*volume.dimensions[1]+p[1])*volume.dimensions[0]+p[0]],n=width===1?(value<=center-.5?0:255):Math.max(0,Math.min(255,((value-(center-.5))/(width-1)+.5)*255)),i=(y*w+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=volume.photometric==='MONOCHROME1'?255-n:n;rgba[i+3]=255;}
 return{width:w,height:h,index:at,spacing:[volume.spacing[u],volume.spacing[v]] as [number,number],rgba};
}
