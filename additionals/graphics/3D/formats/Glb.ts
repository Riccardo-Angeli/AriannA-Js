/** glTF binary container helpers; scene decoding is shared with Gltf.ts. */
export {createGltf as createGlb} from './Gltf.ts';
export function glbToEmbeddedJson(buffer:ArrayBuffer):string {
 const view=new DataView(buffer);if(view.byteLength<20||view.getUint32(0,true)!==0x46546c67)throw new Error('GLB: invalid container');
 let json:any,bin:Uint8Array|undefined;
 for(let p=12;p<buffer.byteLength;){if(p+8>buffer.byteLength)throw new Error('GLB: truncated chunk');const n=view.getUint32(p,true),type=view.getUint32(p+4,true);p+=8;if(p+n>buffer.byteLength)throw new Error('GLB: truncated payload');const bytes=new Uint8Array(buffer,p,n);if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(bytes));else if(type===0x004e4942)bin=bytes;p+=n;}
 if(!json||!bin)throw new Error('GLB: JSON/BIN required');let raw='';for(let i=0;i<bin.length;i+=8192)raw+=String.fromCharCode(...bin.subarray(i,i+8192));json.buffers[0].uri='data:application/octet-stream;base64,'+btoa(raw);return JSON.stringify(json);
}
