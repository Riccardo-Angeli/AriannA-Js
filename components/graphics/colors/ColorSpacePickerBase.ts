import {PickerVector} from './PickerVector.ts';
import {squareToDisc,discToSquare} from './PickerGeometry.ts';
/** Stable, shared colour editor. Raster surfaces are cached by their fixed channels. */
import { Templates } from '../../../core/index.ts';
import {parseHex,rgbToHex,convertAll,fromRgb,toRgb,clamp,type RGB,type ColorConversions,type ColorSpace} from '../../../additionals/Colors.ts';
import {PickerConfigs} from './PickerConfigs.ts';
import {PickerStyles,installPickerStyle,el,button,select,unit,PickerGesture} from './PickerUI.ts';
export type PickerGeometry='wheel'|'ring'|'square'|'plane'|'spectrum'|'swatches'|'dots';
export interface PickerChannel{key:string;label:string;min:number;max:number;step:number;unit?:string;decimals?:number;}
export interface PickerConfig{space:ColorSpace;title:string;geometry:PickerGeometry;channels:PickerChannel[];plane?:[string,string];hue?:string;saturation?:string;lightness?:string;value?:string;}
export const ColorSpacePickerStyles=PickerStyles;
const palette=['#E40C88','#9C58DD','#5D69E6','#428ED9','#39BBC7','#46B880','#B7CC54','#F2C65B','#F09A53','#DD626D','#9E729A','#C6B2E3','#F4F5F8','#ABB2BE','#616A78','#202428'];
for(const config of Object.values(PickerConfigs))if(!config.plane)config.plane=[config.channels[1].key,config.channels[2].key];
const extra=(space:string,channels:PickerChannel[]):PickerConfig=>({space:space as ColorSpace,title:space.toUpperCase(),geometry:'plane',plane:[channels[1].key,channels[2].key],channels});
PickerConfigs.oklab=extra('oklab',[{key:'L',label:'L',min:0,max:1,step:.001},{key:'a',label:'a',min:-.4,max:.4,step:.001},{key:'b',label:'b',min:-.4,max:.4,step:.001}]);
PickerConfigs.oklch=extra('oklch',[{key:'L',label:'L',min:0,max:1,step:.001},{key:'C',label:'C',min:0,max:.4,step:.001},{key:'h',label:'H',min:0,max:360,step:.1}]);
interface UI{vector?:PickerVector;root:HTMLElement;canvas:HTMLCanvasElement;surface:HTMLElement;dot:HTMLElement;ring:HTMLElement;channels:HTMLElement;space:HTMLSelectElement;geometry:HTMLSelectElement;chip:HTMLElement;hex:HTMLInputElement;conversions:HTMLElement;details:HTMLDetailsElement;swatches:HTMLElement;fields:Map<string,[HTMLInputElement,HTMLInputElement]>;}
interface State{rgb:RGB;alpha:number;hue:number;space?:string;geometry?:PickerGeometry;ui?:UI;raf:number;emit:boolean;internal:boolean;key:string;gesture:PickerGesture;palette:string[];recent:string[];resize?:ResizeObserver;raster?:HTMLCanvasElement;}
const states=new WeakMap<object,State>();
function state(o:HTMLElement):State{let s=states.get(o);if(!s){s={rgb:parseHex('#E40C88')!,alpha:1,hue:330,raf:0,emit:false,internal:false,key:'',gesture:new PickerGesture(),palette:[...palette],recent:[]};states.set(o,s);}return s;}
const alphaValue=(space:string,v:any,a:number)=>({...v,...(space==='lab'||space==='oklab'?{alpha:a}:{a})});
export abstract class ColorSpacePickerBase extends HTMLElement{
 private reflectAttribute(name:string,value:string):void{if(this.getAttribute(name)!==value)this.setAttribute(name,value);}
 public template=Templates.Template.Html``;
 protected abstract get Config():PickerConfig;
 private get config():PickerConfig{return PickerConfigs[this.space]||this.Config;}
 public get space():string{return state(this).space||this.getAttribute('space')||this.Config.space;}
 public set space(v:string){if(!PickerConfigs[v])return;const s=state(this);s.space=v;s.internal=true;try{this.reflectAttribute('space',v);}finally{s.internal=false;}this.rebuild();}
 public get geometry():PickerGeometry{return state(this).geometry||(this.getAttribute('geometry') as PickerGeometry)||this.Config.geometry;}
 public set geometry(v:PickerGeometry){if(!['wheel','ring','square','plane','spectrum','swatches','dots'].includes(v))return;const s=state(this);s.geometry=v;s.internal=true;try{this.reflectAttribute('geometry',v);}finally{s.internal=false;}this.rebuild();}
 public get palette():string[]{return [...state(this).palette];}
 public set palette(v:string[]){state(this).palette=v.filter(c=>!!parseHex(c));this.rebuild();}
 public getRecent():string[]{return [...state(this).recent];}
 public onCreated():void{if(this.isConnected)this.onConnected();}
 public onConnected():void{installPickerStyle(this);const s=state(this);if(!s.ui){const p=parseHex(this.getAttribute('value')||this.getAttribute('color')||'');if(p){s.rgb=p;s.alpha=p.a??1;}if(this.hasAttribute('alpha'))s.alpha=unit(Number(this.getAttribute('alpha')));}this.render();if(!s.resize&&typeof ResizeObserver!=='undefined'){s.resize=new ResizeObserver(()=>{s.key='';this.schedule();});s.resize.observe(this);}}
 public onDisconnected():void{const s=state(this);s.gesture.cancel();s.resize?.disconnect();s.resize=undefined;if(s.raf)cancelAnimationFrame(s.raf);s.raf=0;s.emit=false;}
 public onAttributeChanged(name:string):void{const s=state(this);if(s.internal)return;if(name==='value'||name==='color'){const p=parseHex(this.getAttribute(name)||'');if(p){s.rgb=p;s.alpha=p.a??s.alpha;}}else if(name==='alpha')s.alpha=unit(Number(this.getAttribute(name)));else if(name==='space'){s.space=undefined;this.rebuild();return;}else if(name==='geometry'){s.geometry=undefined;this.rebuild();return;}if(this.isConnected)this.render();}
 public get value():string{return rgbToHex(this.getColor(),true);}
 public set value(v:string){this.setColor(v);}
 public getColor():RGB{return {...state(this).rgb,a:state(this).alpha};}
 public getConversions():ColorConversions{return convertAll(this.getColor());}
 public getSpaceValues():any{return fromRgb(this.config.space,this.getColor());}
 public setColor(value:string|RGB):this{const p=typeof value==='string'?parseHex(value):value;if(!p||![p.r,p.g,p.b].every(Number.isFinite))return this;const s=state(this);s.rgb={r:clamp(p.r,0,255),g:clamp(p.g,0,255),b:clamp(p.b,0,255)};if(p.a!=null)s.alpha=unit(p.a);const hsv=fromRgb('hsv',s.rgb) as any;if(hsv.s>.001&&hsv.v>.001)s.hue=hsv.h;this.changed();return this;}
 public setSpaceValues(patch:Record<string,number>):this{const c=this.config,v={...this.getSpaceValues()};for(const ch of c.channels)if(Number.isFinite(patch[ch.key]))v[ch.key]=clamp(patch[ch.key],ch.min,ch.max);if('h'in patch)state(this).hue=patch.h;return this.setColor(toRgb(c.space,alphaValue(c.space,v,state(this).alpha)));}
 public setAlpha(a:number):this{state(this).alpha=unit(a);this.changed();return this;}
 private changed():void{const s=state(this);s.internal=true;try{this.reflectAttribute('value',this.value);this.reflectAttribute('alpha',String(s.alpha));}finally{s.internal=false;}if(this.isConnected)this.render();s.emit=true;this.schedule();}
 private schedule():void{const s=state(this);if(s.raf)return;s.raf=requestAnimationFrame(()=>{s.raf=0;if(!this.isConnected)return;this.paint();this.details();if(s.emit){s.emit=false;this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail:{space:this.space,value:this.value,color:this.getColor(),spaceValues:this.getSpaceValues(),conversions:this.getConversions(),source:this}}));}});}
 private rebuild():void{const s=state(this);s.gesture.cancel();s.ui=undefined;s.key='';if(this.isConnected)this.render();}
 private build():UI{
  const s=state(this),root=el('section'),head=el('header','cp-head');head.append(el('strong','',this.getAttribute('label')||this.Config.title));
  const chip=el('span','cp-chip');head.appendChild(chip);const body=el('div','cp-body'),row=el('div','cp-row');
  const sp=select(Object.keys(PickerConfigs),this.space,v=>this.space=v);sp.setAttribute('aria-label','Colour space');
  const geo=select(['ring','wheel','square','spectrum','plane','swatches','dots'],this.geometry,v=>this.geometry=v as PickerGeometry);geo.setAttribute('aria-label','Picker shape');row.append(sp,geo);
  const surface=el('div','cp-surface'),canvas=el('canvas','cp-canvas');canvas.width=160;canvas.height=160;const vector=['ring','wheel'].includes(this.geometry)?new PickerVector(this.geometry as 'ring'|'wheel'):undefined;const control=vector?.element??canvas;control.setAttribute('tabindex','0');control.setAttribute('aria-label','Colour surface; use arrow keys to adjust');const makeDot=()=>{const host=el('span','cp-dot');host.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="white" stroke-width="2"/></svg>';return host;};const dot=makeDot(),ring=makeDot();surface.append(vector?.element??canvas,dot,ring);
  control.onpointerdown=e=>{const r=control.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;const region=this.geometry==='ring'&&Math.hypot(x-.5,y-.5)>.34?'hue':'plane';s.gesture.start(e,control,p=>{const r=control.getBoundingClientRect();this.pick(unit((p.clientX-r.left)/r.width),unit((p.clientY-r.top)/r.height),region);},()=>this.remember());};
  control.onkeydown=e=>{const d=e.shiftKey?.05:.01;let [x,y]=this.coordinates();if(e.key==='ArrowLeft')x-=d;else if(e.key==='ArrowRight')x+=d;else if(e.key==='ArrowUp')y-=d;else if(e.key==='ArrowDown')y+=d;else return;e.preventDefault();this.pick(unit(x),unit(y),'plane');};
  const swatches=el('div','cp-swatch-grid');swatches.dataset.round=String(this.geometry==='dots');for(const c of s.palette){const b=button('',()=>{this.setColor(c);this.remember();});b.className='cp-swatch';b.style.setProperty('--swatch',c);b.title=c;b.setAttribute('aria-label',c);swatches.appendChild(b);}
  const channels=el('div','cp-channels'),fields=new Map<string,[HTMLInputElement,HTMLInputElement]>();
  for(const ch of [...this.config.channels,{key:'alpha',label:'A',min:0,max:1,step:.001}]){const row=el('div','cp-channel'),label=el('label','',ch.label),range=el('input'),number=el('input');range.type='range';number.type='number';for(const n of [range,number]){n.min=String(ch.min);n.max=String(ch.max);n.step=String(ch.step);n.setAttribute('aria-label',`${this.space} ${ch.label}`);}const change=(n:number)=>ch.key==='alpha'?this.setAlpha(n):this.setSpaceValues({[ch.key]:n});range.oninput=()=>change(Number(range.value));number.onchange=()=>change(Number(number.value));row.append(label,range,number);channels.appendChild(row);fields.set(ch.key,[range,number]);}
  const hexrow=el('div','cp-row'),hex=el('input','cp-hex');hex.setAttribute('aria-label','Hexadecimal colour including alpha');hex.onchange=()=>{if(parseHex(hex.value))this.setColor(hex.value);else hex.value=this.value;};const add=button('+',()=>{if(!s.palette.includes(this.value))s.palette.push(this.value);this.rebuild();});add.title='Save colour to swatches';hexrow.append(hex,add);
  const details=el('details'),summary=el('summary','','All colour spaces / CSS'),conversions=el('div','cp-conversions');details.append(summary,conversions);details.ontoggle=()=>this.details();body.append(row,surface,channels,hexrow,swatches,details);root.append(head,body);this.replaceChildren(root);
  return {vector,root,canvas,surface,dot,ring,channels,space:sp,geometry:geo,chip,hex,conversions,details,swatches,fields};
 }
 private remember():void{const s=state(this);s.recent=[this.value,...s.recent.filter(c=>c!==this.value)].slice(0,16);}
 private render():void{const s=state(this);if(!this.isConnected)return;const ui=s.ui??(s.ui=this.build()),v=this.getSpaceValues(),hsv=this.hsv();ui.chip.style.setProperty('--color',this.value);if(document.activeElement!==ui.hex)ui.hex.value=this.value;for(const [key,[r,n]]of ui.fields){const val=key==='alpha'?s.alpha:Number(v[key]);r.value=String(val);if(document.activeElement!==n)n.value=String(Math.round(val*1000)/1000);const ch=this.config.channels.find(c=>c.key===key);if(ch){const stops=[];for(let i=0;i<=6;i++)stops.push(rgbToHex(toRgb(this.config.space,alphaValue(this.config.space,{...v,[key]:ch.min+(ch.max-ch.min)*i/6},1))));r.style.setProperty('--ramp',`linear-gradient(90deg,${stops.join(',')})`);}else r.style.setProperty('--ramp',`linear-gradient(90deg,transparent,${rgbToHex(s.rgb)})`);}
  const [x,y]=this.coordinates();ui.dot.style.left=`${x*100}%`;ui.dot.style.top=`${y*100}%`;const a=hsv.h*Math.PI/180-Math.PI/2;ui.ring.style.left=`${(0.5+Math.cos(a)*.425)*100}%`;ui.ring.style.top=`${(.5+Math.sin(a)*.425)*100}%`;ui.ring.hidden=this.geometry!=='ring';ui.surface.hidden=['swatches','dots'].includes(this.geometry);this.schedule();
 }
 private hsv():any{const v=fromRgb('hsv',this.getColor()) as any;if(v.s<.001||v.v<.001)v.h=state(this).hue;return v;}
 private coordinates():[number,number]{const v=this.getSpaceValues(),h=this.hsv(),g=this.geometry;if(g==='plane'&&this.config.plane){const [a,b]=this.config.plane.map(k=>this.config.channels.find(c=>c.key===k)!);return [unit((v[a.key]-a.min)/(a.max-a.min)),1-unit((v[b.key]-b.min)/(b.max-b.min))];}if(g==='wheel'){const c=this.wheelValues(),a=c.h*Math.PI/180-Math.PI/2;return [.5+Math.cos(a)*c.s/100*.47,.5+Math.sin(a)*c.s/100*.47];}if(g==='spectrum')return[h.h/360,h.v>=100?(100-h.s)/200:1-h.v/200];if(g==='ring'){const [dx,dy]=squareToDisc(h.s/50-1,1-h.v/50);return [.5+dx*.3,.5+dy*.3];}return[h.s/100,1-h.v/100];}
 private wheelValues():any{const space=this.space==='hsl'||this.space==='okhsl'?this.space:'hsv';const v=fromRgb(space as ColorSpace,this.getColor()) as any;if(v.s<.001)v.h=state(this).hue;return v;}
 private pick(x:number,y:number,region:string):void{const g=this.geometry,h=this.hsv();if(g==='plane'&&this.config.plane){const [a,b]=this.config.plane.map(k=>this.config.channels.find(c=>c.key===k)!);this.setSpaceValues({[a.key]:a.min+x*(a.max-a.min),[b.key]:b.min+(1-y)*(b.max-b.min)});return;}if(g==='wheel'){const space=this.space==='hsl'||this.space==='okhsl'?this.space:'hsv';const v=this.wheelValues();v.h=(Math.atan2(y-.5,x-.5)*180/Math.PI+450)%360;v.s=unit(Math.hypot(x-.5,y-.5)/.47)*100;state(this).hue=v.h;this.setColor(toRgb(space as ColorSpace,{...v,a:state(this).alpha}));return;}if(g==='ring'&&region==='hue'){h.h=(Math.atan2(y-.5,x-.5)*180/Math.PI+450)%360;state(this).hue=h.h;}else if(g==='spectrum'){h.h=x*360;h.s=y<.5?y*200:100;h.v=y<.5?100:(1-y)*200;state(this).hue=h.h;}else{if(g==='ring'){const [u,v]=discToSquare((x-.5)/.3,(y-.5)/.3);h.s=(u+1)*50;h.v=(1-v)*50;}else{h.s=x*100;h.v=(1-y)*100;}}this.setColor(toRgb('hsv',{...h,a:state(this).alpha}));}
 private details():void{const ui=state(this).ui;if(!ui?.details.open)return;const c=this.getConversions();ui.conversions.replaceChildren();for(const [k,v]of Object.entries(c)){const line=el('div');line.textContent=`${k.toUpperCase()}  ${typeof v==='object'?Object.entries(v).map(([a,b])=>`${a}: ${typeof b==='number'?Math.round(b*10000)/10000:b}`).join(' · '):v}`;ui.conversions.appendChild(line);}}
 private paint():void{
  const s=state(this),ui=s.ui;if(!ui)return;
  const swatchWidth=ui.swatches.getBoundingClientRect().width;if(swatchWidth>0){const side=Math.max(1,Math.floor((swatchWidth-49)/8));for(const child of Array.from(ui.swatches.children)){const b=child as HTMLElement;b.style.width=side+'px';b.style.setProperty('height',side+'px','important');b.style.minHeight='0';}}
  if(ui.surface.hidden)return;
  const g=this.geometry,h=this.hsv(),v=this.getSpaceValues(),wheel=this.wheelValues();
  if(ui.vector){ui.vector.update(h.h,this.space,wheel);return;}
  const cssWidth=Math.max(1,ui.surface.getBoundingClientRect().width||314);
  const size=Math.max(256,Math.min(1024,Math.ceil(cssWidth*Math.min(3,window.devicePixelRatio||1))));
  const fixed={...v};if(g==='plane'&&this.config.plane)for(const k of this.config.plane)delete fixed[k];
  const key=JSON.stringify([size,g,g==='plane'?fixed:g==='wheel'?[this.space,wheel.l??wheel.v]:g==='spectrum'?0:Math.round(h.h*100)/100]);
  if(key===s.key)return;s.key=key;
  if(ui.canvas.width!==size||ui.canvas.height!==size){ui.canvas.width=size;ui.canvas.height=size;}
  
  const ctx=ui.canvas.getContext('2d');if(!ctx)return;const w=Math.min(size,192),raster=s.raster??(s.raster=document.createElement('canvas'));raster.width=raster.height=w;const rc=raster.getContext('2d');if(!rc)return;const img=rc.createImageData(w,w);
  const hue=toRgb('hsv',{h:h.h,s:100,v:100});
  const huePixel=(hh:number,ss:number,vv:number):RGB=>{const c=vv*ss,m=vv-c,h6=((hh%360)+360)%360/60,k=c*(1-Math.abs(h6%2-1));return h6<1?{r:(c+m)*255,g:(k+m)*255,b:m*255}:h6<2?{r:(k+m)*255,g:(c+m)*255,b:m*255}:h6<3?{r:m*255,g:(c+m)*255,b:(k+m)*255}:h6<4?{r:m*255,g:(k+m)*255,b:(c+m)*255}:h6<5?{r:(k+m)*255,g:m*255,b:(c+m)*255}:{r:(c+m)*255,g:m*255,b:(k+m)*255};};
  const plane=g==='plane'&&this.config.plane?this.config.plane.map(k=>this.config.channels.find(c=>c.key===k)!):undefined;
  for(let py=0;py<w;py++)for(let px=0;px<w;px++){
   const x=(px+.5)/w,y=(py+.5)/w,i=(py*w+px)*4;let rgb:RGB,coverage=1;
   if(plane){const [a,b]=plane;rgb=toRgb(this.config.space,alphaValue(this.config.space,{...v,[a.key]:a.min+x*(a.max-a.min),[b.key]:b.min+(1-y)*(b.max-b.min)},1));}
   else if(g==='wheel'){const rad=Math.hypot(x-.5,y-.5),hh=(Math.atan2(y-.5,x-.5)*180/Math.PI+450)%360,ss=unit(rad/.47);coverage=1;if(this.space==='hsl'){const l=wheel.l/100,vv=l+ss*Math.min(l,1-l);rgb=huePixel(hh,vv?2*(1-l/vv):0,vv);}else if(this.space==='okhsl')rgb=toRgb('okhsl',{...wheel,h:hh,s:ss*100});else rgb=huePixel(hh,ss,wheel.v/100);}
   else if(g==='spectrum')rgb=huePixel(x*360,y<.5?y*2:1,y<.5?1:(1-y)*2);
   else{rgb={r:(1-y)*(255*(1-x)+hue.r*x),g:(1-y)*(255*(1-x)+hue.g*x),b:(1-y)*(255*(1-x)+hue.b*x)};}
   img.data[i]=rgb.r;img.data[i+1]=rgb.g;img.data[i+2]=rgb.b;img.data[i+3]=Math.round(coverage*255);
  }rc.putImageData(img,0,0);ctx.clearRect(0,0,size,size);ctx.save();if(g==='wheel'){ctx.beginPath();ctx.arc(size/2,size/2,size*.47,0,Math.PI*2);ctx.clip();}ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(raster,0,0,size,size);ctx.restore();
 }
}
