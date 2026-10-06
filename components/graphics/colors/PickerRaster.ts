/** Reusable alpha masks: a hue drag composites three cached layers instead of sampling every pixel. */
import {discToSquare} from './PickerGeometry.ts';
interface Layers{white:HTMLCanvasElement;black:HTMLCanvasElement;rim:HTMLCanvasElement;}
const cache=new Map<number,Layers>();
export function paintRing(canvas:HTMLCanvasElement,hue:number):boolean{
 const w=canvas.width,ctx=canvas.getContext('2d');if(!ctx)return false;
 let layers=cache.get(w);
 if(!layers){
  const make=()=>{const c=document.createElement('canvas');c.width=c.height=w;return c;};
  layers={white:make(),black:make(),rim:make()};const wc=layers.white.getContext('2d')!,bc=layers.black.getContext('2d')!,rc=layers.rim.getContext('2d')!;
  const white=wc.createImageData(w,w),black=bc.createImageData(w,w),rim=rc.createImageData(w,w);
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){
   const dx=(x+.5)/w-.5,dy=(y+.5)/w-.5,rad=Math.hypot(dx,dy),i=(y*w+x)*4;
   if(rad<=.3+1/w){const [u,v]=discToSquare(dx/.3,dy/.3);white.data[i]=white.data[i+1]=white.data[i+2]=255;white.data[i+3]=(1-u)*127.5;black.data[i+3]=(v+1)*127.5;}
   if(rad>=.37-1/w&&rad<=.48+1/w){const h=((Math.atan2(dy,dx)*180/Math.PI+450)%360)/60,k=1-Math.abs(h%2-1),rgb=h<1?[1,k,0]:h<2?[k,1,0]:h<3?[0,1,k]:h<4?[0,k,1]:h<5?[k,0,1]:[1,0,k];rim.data[i]=rgb[0]*255;rim.data[i+1]=rgb[1]*255;rim.data[i+2]=rgb[2]*255;rim.data[i+3]=255*Math.max(0,Math.min(1,(.48-rad)*w+.5,(rad-.37)*w+.5));}
  }
  wc.putImageData(white,0,0);bc.putImageData(black,0,0);rc.putImageData(rim,0,0);
  if(cache.size>=2)cache.delete(cache.keys().next().value!);cache.set(w,layers);
 }
 ctx.clearRect(0,0,w,w);ctx.drawImage(layers.rim,0,0);ctx.save();ctx.beginPath();ctx.arc(w/2,w/2,w*.3,0,Math.PI*2);ctx.clip();ctx.fillStyle=`hsl(${hue} 100% 50%)`;ctx.fillRect(0,0,w,w);ctx.drawImage(layers.white,0,0);ctx.drawImage(layers.black,0,0);ctx.restore();return true;
}
