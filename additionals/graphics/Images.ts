/** Browser image assets. PNG/JPEG via browser codecs; TIFF strips via the decoder below.
 * MaterialX is a material document and is handled by MaterialsLibrary3D, not an image codec.
 */
export interface ImageAsset {id:string;name:string;mime:string;width:number;height:number;data:string;}
export interface Tiling {repeatX:number;repeatY:number;offsetX:number;offsetY:number;rotation:number;wrap:'repeat'|'mirror'|'clamp';}
export type ImageDecoder=(file:Blob)=>Promise<HTMLCanvasElement>;
export class Images extends EventTarget {
 readonly Assets=new Map<string,ImageAsset>();
 static readonly Decoders=new Map<string,ImageDecoder>();
 static registerDecoder(extension:string,decoder:ImageDecoder):void{this.Decoders.set(extension.toLowerCase().replace(/^\./,''),decoder);}
 private disposed=false;
 async import(file:File|Blob,name=(file as File).name||'Image'):Promise<ImageAsset>{
  if(this.disposed)throw new Error('Images was disposed');if(file.size>64*1024*1024)throw new RangeError('Image exceeds 64 MB');
  const extension=name.split('.').pop()!.toLowerCase(),custom=Images.Decoders.get(extension);
  let canvas:HTMLCanvasElement;
  if(custom)canvas=await custom(file);
  else if(['tif','tiff'].includes(extension))canvas=await Images.decodeTIFF(await file.arrayBuffer());
  else {const bitmap=await createImageBitmap(file);try{if(bitmap.width*bitmap.height>16777216)throw new RangeError('Image exceeds 16 megapixels');canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d')!.drawImage(bitmap,0,0);}finally{bitmap.close();}}
  if(this.disposed)throw new Error('Images was disposed during import');
  const asset:ImageAsset={id:crypto.randomUUID(),name,mime:'image/png',width:canvas.width,height:canvas.height,data:canvas.toDataURL('image/png')};this.add(asset);return asset;
 }
 add(asset:ImageAsset):ImageAsset{if(!asset||typeof asset.id!=='string'||typeof asset.name!=='string'||!/^data:image\/(png|jpeg);base64,/.test(asset.data)||asset.data.length>90*1024*1024||!Number.isInteger(asset.width)||!Number.isInteger(asset.height)||asset.width<1||asset.height<1||asset.width*asset.height>16777216)throw new TypeError('Invalid image asset');const copy={...asset};this.Assets.set(copy.id,copy);return copy;}
 remove(id:string):boolean{return this.Assets.delete(id);}
 async tile(id:string,options:Partial<Tiling>={}):Promise<HTMLCanvasElement>{
  const asset=this.Assets.get(id);if(!asset)throw new Error('Unknown image asset');
  const bitmap=await createImageBitmap(await (await fetch(asset.data)).blob());
  try{const canvas=document.createElement('canvas');canvas.width=Math.min(asset.width,2048);canvas.height=Math.min(asset.height,2048);const ctx=canvas.getContext('2d')!;
   const t={repeatX:1,repeatY:1,offsetX:0,offsetY:0,rotation:0,wrap:'repeat',...options};
   if(![t.repeatX,t.repeatY,t.offsetX,t.offsetY,t.rotation].every(Number.isFinite)||t.repeatX<=0||t.repeatY<=0)throw new RangeError('Invalid tiling');
   let source:CanvasImageSource=bitmap;
   if(t.wrap==='mirror'){const mirror=document.createElement('canvas');mirror.width=bitmap.width*2;mirror.height=bitmap.height*2;if(mirror.width*mirror.height>67108864)throw new RangeError('Mirrored image too large');const c=mirror.getContext('2d')!;for(let y=0;y<2;y++)for(let x=0;x<2;x++){c.save();c.translate(x?2*bitmap.width:0,y?2*bitmap.height:0);c.scale(x?-1:1,y?-1:1);c.drawImage(bitmap,0,0);c.restore();}source=mirror;}
   const pattern=ctx.createPattern(source,t.wrap==='clamp'?'no-repeat':'repeat')!;
   pattern.setTransform(new DOMMatrix().translate(t.offsetX*canvas.width,t.offsetY*canvas.height).rotate(t.rotation).scale(canvas.width/(bitmap.width*t.repeatX),canvas.height/(bitmap.height*t.repeatY)));
   ctx.fillStyle=pattern;ctx.fillRect(0,0,canvas.width,canvas.height);return canvas;
  }finally{bitmap.close();}
 }
 dispose():void{this.disposed=true;this.Assets.clear();}
 /** TIFF 6: first IFD, 8-bit chunky RGB/RGBA/grayscale, strips, none/PackBits/LZW/Deflate. */
 static async decodeTIFF(buffer:ArrayBuffer):Promise<HTMLCanvasElement>{
  const d=new DataView(buffer);if(d.byteLength<8)throw new Error('Truncated TIFF');const le=d.getUint16(0)===0x4949;if(!le&&d.getUint16(0)!==0x4d4d)throw new Error('Invalid TIFF byte order');
  const u16=(p:number)=>d.getUint16(p,le),u32=(p:number)=>d.getUint32(p,le);if(u16(2)!==42)throw new Error('BigTIFF is not supported; register a decoder');
  const tags=new Map<number,number[]>(),ifd=u32(4),count=u16(ifd);if(count>4096||ifd+2+count*12+4>d.byteLength)throw new Error('Invalid TIFF IFD');
  for(let i=0;i<count;i++){const p=ifd+2+i*12,tag=u16(p),type=u16(p+2),n=u32(p+4),bytes=type===3?2:type===4?4:type===1?1:0;if(!bytes)continue;if(n>1000000)throw new Error('TIFF tag too large');const at=n*bytes<=4?p+8:u32(p+8);if(at+n*bytes>d.byteLength)throw new Error('Invalid TIFF offset');tags.set(tag,Array.from({length:n},(_,j)=>bytes===1?d.getUint8(at+j):bytes===2?u16(at+j*2):u32(at+j*4)));}
  const val=(tag:number,fallback:number)=>tags.get(tag)?.[0]??fallback,w=val(256,0),h=val(257,0),samples=val(277,1),photo=val(262,1),compression=val(259,1),rows=val(278,h),predictor=val(317,1),orientation=val(274,1);
  if(w<1||h<1||w*h>16777216||rows<1)throw new Error('Invalid or excessive TIFF dimensions');
  if(tags.has(322)||val(284,1)!==1||(tags.get(258)??[1]).some(n=>n!==8)||![0,1,2].includes(photo)||![1,2,3,4].includes(samples)||![1,2].includes(predictor)||orientation<1||orientation>4||val(339,1)!==1)throw new Error('Unsupported TIFF layout: use 8-bit stripped RGB/gray or register a decoder');
  if(val(338,0)===1)throw new Error('Premultiplied-alpha TIFF requires a registered decoder');
  if((photo===2&&samples<3)||(photo!==2&&samples>2))throw new Error('Invalid TIFF channels');
  const offsets=tags.get(273)??[],counts=tags.get(279)??[];if(offsets.length!==Math.ceil(h/rows)||counts.length!==offsets.length)throw new Error('Missing TIFF strips');
  const pixels=new Uint8Array(w*h*samples);
  for(let strip=0;strip<offsets.length;strip++){
   const at=offsets[strip],size=counts[strip],expected=Math.min(rows,h-strip*rows)*w*samples;if(at+size>d.byteLength)throw new Error('Truncated TIFF strip');let bytes=new Uint8Array(buffer,at,size);
   if(compression===32773){const out=new Uint8Array(expected);let i=0,j=0;while(i<bytes.length&&j<expected){const n=(bytes[i++]<<24)>>24;if(n>=0){if(i+n+1>bytes.length||j+n+1>expected)throw new Error('Invalid PackBits');out.set(bytes.subarray(i,i+n+1),j);i+=n+1;j+=n+1;}else if(n!==-128){if(i>=bytes.length||j+1-n>expected)throw new Error('Invalid PackBits');out.fill(bytes[i++],j,j+1-n);j+=1-n;}}if(j!==expected)throw new Error('Truncated PackBits');bytes=out;}
   else if(compression===5){let table:Uint8Array[]=[],bits=9,next=258,bit=0,previous:Uint8Array|null=null,pos=0;const out=new Uint8Array(expected),reset=()=>{table=Array.from({length:256},(_,i)=>Uint8Array.of(i));bits=9;next=258;previous=null;};reset();while(bit+bits<=bytes.length*8){let code=0;for(let k=0;k<bits;k++,bit++)code=(code<<1)|((bytes[bit>>3]>>(7-(bit&7)))&1);if(code===256){reset();continue;}if(code===257)break;let entry=table[code];if(!entry&&code===next&&previous){entry=new Uint8Array(previous.length+1);entry.set(previous);entry[previous.length]=previous[0];}if(!entry||pos+entry.length>expected)throw new Error('Invalid TIFF LZW');out.set(entry,pos);pos+=entry.length;if(previous&&next<4096){const joined=new Uint8Array(previous.length+1);joined.set(previous);joined[previous.length]=entry[0];table[next++]=joined;if(next===(1<<bits)-1&&bits<12)bits++;}previous=entry;}if(pos!==expected)throw new Error('Truncated TIFF LZW');bytes=out;}
   else if(compression===8||compression===32946){const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader(),out=new Uint8Array(expected);let pos=0;try{while(true){const part=await reader.read();if(part.done)break;if(pos+part.value.length>expected)throw new Error('TIFF decompression exceeds strip size');out.set(part.value,pos);pos+=part.value.length;}if(pos!==expected)throw new Error('Truncated TIFF Deflate');}finally{await reader.cancel();}bytes=out;}
   else if(compression!==1)throw new Error('Unsupported TIFF compression '+compression);
   if(bytes.length!==expected)throw new Error('Invalid TIFF strip size');pixels.set(bytes,strip*rows*w*samples);
  }
  if(predictor===2)for(let y=0;y<h;y++)for(let x=samples;x<w*samples;x++)pixels[y*w*samples+x]=(pixels[y*w*samples+x]+pixels[y*w*samples+x-samples])&255;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d')!,image=ctx.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const from=(y*w+x)*samples,to=((orientation>=3?h-1-y:y)*w+([2,3].includes(orientation)?w-1-x:x))*4;for(let c=0;c<3;c++)image.data[to+c]=photo===2?pixels[from+c]:photo===0?255-pixels[from]:pixels[from];image.data[to+3]=(photo===2?samples===4:samples===2)?pixels[from+samples-1]:255;}
  ctx.putImageData(image,0,0);return canvas;
 }
}
export default Images;
