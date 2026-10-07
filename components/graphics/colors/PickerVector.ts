import {discToSquare} from './PickerGeometry.ts';
import {toRgb,rgbToHex,type ColorSpace} from '../../../additionals/graphics/Colors.ts';
const NS='http://www.w3.org/2000/svg';let serial=0;
function node<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string|number>={}):SVGElementTagNameMap[K]{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;}
function point(angle:number,r:number):string{const a=(angle-90)*Math.PI/180;return `${50+Math.cos(a)*r} ${50+Math.sin(a)*r}`;}
/** Resolution-independent colour surfaces. No canvas, bitmap, or SVG image element. */
export class PickerVector{
 readonly element=node('svg',{viewBox:'0 0 100 100',preserveAspectRatio:'xMidYMid meet',class:'cp-vector'});
 private hue?:SVGCircleElement;private wheel:SVGStopElement[][]=[];private key='';
 constructor(readonly mode:'ring'|'wheel'){
  const id=`arianna-picker-${++serial}`,defs=node('defs');this.element.append(defs);
  if(mode==='ring'){
   for(let h=0;h<360;h+=3){const g=node('linearGradient',{id:`${id}-${h}`,gradientUnits:'userSpaceOnUse',x1:point(h,42.5).split(' ')[0],y1:point(h,42.5).split(' ')[1],x2:point(h+3,42.5).split(' ')[0],y2:point(h+3,42.5).split(' ')[1]});g.append(node('stop',{offset:0,'stop-color':`hsl(${h} 100% 50%)`}),node('stop',{offset:1,'stop-color':`hsl(${h+3} 100% 50%)`}));defs.append(g);this.element.append(node('path',{d:`M ${point(h-.03,42.5)} A 42.5 42.5 0 0 1 ${point(h+3.03,42.5)}`,fill:'none',stroke:`url(#${id}-${h})`,'stroke-width':9}));}
   const clip=node('clipPath',{id:`${id}-clip`});clip.append(node('circle',{cx:50,cy:50,r:30}));defs.append(clip);
   this.hue=node('circle',{cx:50,cy:50,r:30});this.element.append(this.hue);
   const layers=node('g',{'clip-path':`url(#${id}-clip)`});this.element.append(layers);
   // Static vector masks preserve the square-to-disc SV mapping. Only the base hue changes.
   for(let row=0;row<64;row++){
    const y=-1+(row+.5)/32;
    for(const kind of ['white','black']){
     const gid=`${id}-${kind}-${row}`,gradient=node('linearGradient',{id:gid});
     for(let col=0;col<=32;col++){const x=-1+col/16,[u,v]=discToSquare(x,y);gradient.append(node('stop',{offset:col/32,'stop-color':kind,'stop-opacity':kind==='white'?(1-u)/2:(1+v)/2}));}
     defs.append(gradient);layers.append(node('rect',{x:20,y:20+row*60/64,width:60,height:60/64+.015,fill:`url(#${gid})`}));
    }
   }
  }else{
   for(let h=0;h<360;h+=3){const g=node('radialGradient',{id:`${id}-${h}`,gradientUnits:'userSpaceOnUse',cx:50,cy:50,r:47}),stops:SVGStopElement[]=[];for(let s=0;s<=16;s++){const stop=node('stop',{offset:s/16});stops.push(stop);g.append(stop);}this.wheel.push(stops);defs.append(g);this.element.append(node('path',{d:`M 50 50 L ${point(h-.04,47)} A 47 47 0 0 1 ${point(h+3.04,47)} Z`,fill:`url(#${id}-${h})`}));}
  }
 }
 update(hue:number,space:string,values:any):void{
  if(this.hue){this.hue.setAttribute('fill',`hsl(${hue} 100% 50%)`);return;}
  const model:ColorSpace=space==='hsl'||space==='okhsl'?space:'hsv',key=JSON.stringify([model,values.l??values.v]);if(key===this.key)return;this.key=key;
  this.wheel.forEach((stops,i)=>stops.forEach((stop,j)=>stop.setAttribute('stop-color',rgbToHex(toRgb(model,{...values,h:i*3+1.5,s:j*100/16})))));
 }
}
