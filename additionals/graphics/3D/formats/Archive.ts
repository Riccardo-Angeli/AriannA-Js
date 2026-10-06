/** Portable ZIP STORE archive. No runtime dependency; entries have CRC32 integrity. */
const encoder=new TextEncoder(),decoder=new TextDecoder(),table=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(bytes:Uint8Array){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function safe(name:string){if(!name||name.startsWith('/')||name.includes('\\')||name.split('/').some(n=>!n||n==='.'||n==='..')||name.includes('\0'))throw new Error('Unsafe archive path');return name;}
export function writeArchive(files:Map<string,Uint8Array>):ArrayBuffer{
 if(files.size>65535)throw new Error('ZIP64 required');let size=22;for(const [name,data]of files){safe(name);const n=encoder.encode(name).length;if(n>65535)throw new Error('ZIP name too long');size+=76+2*n+data.length;}if(size>0xffffffff)throw new Error('ZIP64 required');
 const buffer=new ArrayBuffer(size),view=new DataView(buffer),out=new Uint8Array(buffer),central:{name:Uint8Array;data:Uint8Array;crc:number;offset:number}[]=[];let p=0;
 for(const [filename,data]of files){const name=encoder.encode(filename),offset=p,c=crc(data);view.setUint32(p,0x04034b50,true);view.setUint16(p+4,20,true);view.setUint16(p+6,0x800,true);view.setUint32(p+14,c,true);view.setUint32(p+18,data.length,true);view.setUint32(p+22,data.length,true);view.setUint16(p+26,name.length,true);out.set(name,p+30);out.set(data,p+30+name.length);p+=30+name.length+data.length;central.push({name,data,crc:c,offset});}
 const start=p;for(const e of central){view.setUint32(p,0x02014b50,true);view.setUint16(p+4,20,true);view.setUint16(p+6,20,true);view.setUint16(p+8,0x800,true);view.setUint32(p+16,e.crc,true);view.setUint32(p+20,e.data.length,true);view.setUint32(p+24,e.data.length,true);view.setUint16(p+28,e.name.length,true);view.setUint32(p+42,e.offset,true);out.set(e.name,p+46);p+=46+e.name.length;}
 view.setUint32(p,0x06054b50,true);view.setUint16(p+8,central.length,true);view.setUint16(p+10,central.length,true);view.setUint32(p+12,p-start,true);view.setUint32(p+16,start,true);return buffer;
}
/** Reads archives generated here; rejects compression/descriptor variants instead of guessing. */
export function readArchive(buffer:ArrayBuffer,maxBytes=536870912):Map<string,Uint8Array>{
 if(buffer.byteLength>maxBytes)throw new Error('Archive size limit');const v=new DataView(buffer),bytes=new Uint8Array(buffer),files=new Map<string,Uint8Array>();let p=0;
 while(p+4<=bytes.length&&v.getUint32(p,true)===0x04034b50){if(p+30>bytes.length)throw new Error('Truncated ZIP');const flags=v.getUint16(p+6,true),method=v.getUint16(p+8,true),n=v.getUint32(p+18,true),length=v.getUint16(p+26,true),extra=v.getUint16(p+28,true);if(flags&9||method!==0||v.getUint32(p+22,true)!==n)throw new Error('Unsupported ZIP encoding');const end=p+30+length+extra+n;if(end>bytes.length)throw new Error('Truncated ZIP entry');const name=safe(decoder.decode(bytes.subarray(p+30,p+30+length)));if(files.has(name))throw new Error('Duplicate ZIP entry');const data=bytes.slice(p+30+length+extra,end);if(crc(data)!==v.getUint32(p+14,true))throw new Error('ZIP CRC mismatch');files.set(name,data);p=end;}
 if(!files.size||p+4>bytes.length||v.getUint32(p,true)!==0x02014b50)throw new Error('Invalid AriannA ZIP');return files;
}
export const archiveBytes=(value:string|ArrayBuffer)=>typeof value==='string'?encoder.encode(value):new Uint8Array(value);
/** Typed-array sidecars remain binary, with type and length recorded in JSON. */
export function archiveSnapshot(value:unknown,folder:string,files:Map<string,Uint8Array>):unknown{
 let count=0;const ancestors=new Set<object>();
 const visit=(v:any):any=>{if(v===null||typeof v!=='object')return v;
  if(v instanceof ArrayBuffer||ArrayBuffer.isView(v)){const bytes=v instanceof ArrayBuffer?new Uint8Array(v):new Uint8Array(v.buffer,v.byteOffset,v.byteLength);const path=folder+'/buffer-'+count+++'.bin';files.set(path,bytes.slice());return{$binary:path,type:v.constructor.name,byteLength:bytes.length};}
  if(ancestors.has(v))throw new Error('Cyclic sidecar data');ancestors.add(v);const out=Array.isArray(v)?v.map(visit):Object.fromEntries(Object.entries(v).map(([k,x])=>[k,visit(x)]));ancestors.delete(v);return out;};return visit(value);
}
