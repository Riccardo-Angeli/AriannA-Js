/** Shared deterministic lifecycle for standard modifiers; no mesh/demo ownership. */
import {Modifier3D as B} from '../Base.ts';
import {getSplines3D} from '../../LineEditor3D.ts';
import type {Options,G} from './GeometryKernel3D.ts';
export type Operation=(source:G,options:Options)=>G;
export class ParametricModifier3D extends B.Modifier3D {
 protected source:G;
 public options:Options;
 constructor(mesh:B.Interfaces.MeshLike,options:Options,private readonly operation:Operation){super(mesh);this.source=B._cloneGeom(mesh.geometry);this.options=structuredClone(options);}
 public setAngle(angle:number):this{return this.configure({angle});}
 public setAxis(axis:Options['axis']):this{return this.configure({axis});}
 public setAmount(amount:number):this{return this.configure({amount});}
 public setIterations(iterations:number):this{return this.configure({iterations});}
 public setFactor(factor:number):this{return this.configure({factor});}
 public configure(options:Partial<Options>):this{this.options={...this.options,...structuredClone(options)};return this;}
 public override bindMesh(mesh:B.Interfaces.MeshLike):this{super.bindMesh(mesh);return this.rebase();}
 public rebase():this{this.source=B._cloneGeom(this.mesh.geometry);return this;}
 public reset():this{this.mesh.geometry=B._cloneGeom(this.source);return this;}
 public apply():this{if(this.enabled)this.mesh.geometry=this.operation(this.source,this.options);return this;}
}
const stored=new WeakMap<HTMLElement,Options>();
/** A stable object-property API supplements declarative attributes. */
export class ParametricModifierElement extends B.Modifier3DElement {
 public get options():Options{return structuredClone(stored.get(this)??{});}
 public set options(value:Options){stored.set(this,structuredClone(value));for(const [key,item]of Object.entries(value)){if(typeof item==='string'||typeof item==='number'||typeof item==='boolean')this.setAttribute(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),String(item));}if(value.strength)for(const a of ['x','y','z'] as const)this.setAttribute('strength-'+a,String(value.strength[a]));if(this.isConnected)this.refreshModifier();}
 public setOptions(value:Options):this{this.options={...this.options,...value};return this;}
 public sourceFields:ReadonlyArray<'path'|'profile'|'sections'>=[];
 public override onConnected():void{
  super.onConnected();if(!this.sourceFields.length||this.querySelector('[data-source-picker]'))return;
  const body=this.querySelector('.ar-mod3d__body');if(!body)return;
  for(const field of this.sourceFields){const label=document.createElement('label');label.textContent=field;label.style.cssText='display:grid;gap:5px;';const select=document.createElement('select');select.dataset.sourcePicker=field;select.className='ar-mod3d__select';select.multiple=field==='sections';
   const refresh=()=>{const current=new Set([...select.selectedOptions].map(o=>o.value));select.replaceChildren();const blank=document.createElement('option');blank.value='';blank.textContent='Choose scene spline';select.append(blank);const viewport=this.resolveViewport();if(viewport)for(const source of getSplines3D(viewport)){const option=document.createElement('option');option.value=source.id;option.textContent=source.name;option.selected=current.has(source.id);select.append(option);}};
   select.addEventListener('focus',refresh);select.addEventListener('change',()=>this.refreshModifier());refresh();label.append(select);body.append(label);
  }
  if(this.localName==='arianna-bevel'||this.localName==='arianna-bevel-profile'){
   const key=this.localName==='arianna-bevel'?'levels':'bevel-profile',label=document.createElement('label'),input=document.createElement('textarea');label.textContent=key;input.rows=4;input.className='ar-mod3d__select';input.style.width='100%';input.value=this.getAttribute(key)??JSON.stringify(key==='levels'?this.options.levels??[]:this.options.bevelProfile??[]);input.onchange=()=>{try{JSON.parse(input.value);this.setAttribute(key,input.value);input.setCustomValidity('');this.refreshModifier();}catch{input.setCustomValidity('Enter a valid JSON array');input.reportValidity();}};label.append(input);body.append(label);
  }
  const apply=document.createElement('button');apply.type='button';apply.className='ar-mod3d__reset';apply.textContent='Apply sources';apply.onclick=()=>this.refreshModifier();body.append(apply);
 }
 protected readOptions():Options{
  const out:Record<string,unknown>={...this.options};
  const names=['axis','angle','direction','lower','upper','limits','amount','outline','curve','bias','symmetric','radial','iterations','factor','boundaries','seed','scale','octaves','roughness','phase','offset','copy','closed','closedPath','cap','segments','twist','samples','steps','flip'];
  const bool=new Set(['limits','symmetric','boundaries','copy','closed','closedPath','cap','flip']);
  for(const key of names){const attr=key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());if(this.hasAttribute(attr)){const raw=this.getAttribute(attr)!;out[key]=bool.has(key)?raw!=='false':key==='axis'?raw:Number(raw);}}
  // Angles remain radians in programmatic API; explicit degree attributes are unambiguous.
  for(const name of ['angle','direction','twist'])if(this.hasAttribute(name+'-deg'))out[name]=Number(this.getAttribute(name+'-deg'))*Math.PI/180;
  if(['x','y','z'].some(a=>this.hasAttribute('strength-'+a)))out.strength=Object.fromEntries(['x','y','z'].map(a=>[a,Number(this.getAttribute('strength-'+a)??0)]));
  for(const key of ['profile','path','sections','levels','bevelProfile']){const value=this.getAttribute(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()));if(value)out[key]=JSON.parse(value);}
  const viewport=this.resolveViewport();if(viewport){const available=getSplines3D(viewport);for(const field of this.sourceFields){const picker=this.querySelector<HTMLSelectElement>('[data-source-picker="'+field+'"]');const selected=picker?[...picker.selectedOptions].map(option=>available.find(source=>source.id===option.value)).filter(source=>!!source):[];if(selected.length){if(field==='profile'&&this.localName!=='arianna-lathe'&&!selected[0]!.closed)throw new Error('Choose a closed profile');out[field]=field==='sections'?selected.map(source=>source!.getPath3D()):field==='path'?selected[0]!.getPath3D():selected[0]!.getProfile2D();}}}
  if(viewport&&this.target){const target=this.target;const local=(p:{x:number;y:number;z:number})=>{let x=p.x-target.position.x,y=p.y-target.position.y,z=p.z-target.position.z;let c=Math.cos(-target.rotation.z),s=Math.sin(-target.rotation.z);[x,y]=[x*c-y*s,x*s+y*c];c=Math.cos(-target.rotation.y);s=Math.sin(-target.rotation.y);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(-target.rotation.x);s=Math.sin(-target.rotation.x);[y,z]=[y*c-z*s,y*s+z*c];if(!target.scale.x||!target.scale.y||!target.scale.z)throw new Error('Target scale must be nonzero');return{x:x/target.scale.x,y:y/target.scale.y,z:z/target.scale.z};};
   for(const field of ['path','sections'] as const){const picker=this.querySelector<HTMLSelectElement>('[data-source-picker="'+field+'"]');if(picker&&[...picker.selectedOptions].some(o=>!!o.value)&&out[field])out[field]=field==='path'?(out.path as Options['path'])!.map(local):(out.sections as Options['sections'])!.map(row=>row.map(local));}
  }
  return out as Options;
 }
 public override refreshModifier():void{
  try{super.refreshModifier();this.removeAttribute('data-error');const message=this.querySelector('[data-modifier-error]');message?.remove();}
  catch(error){const text=error instanceof Error?error.message:String(error);this.setAttribute('data-error',text);let output=this.querySelector<HTMLElement>('[data-modifier-error]');if(!output){output=document.createElement('output');output.dataset.modifierError='';output.style.cssText='display:block;padding:8px;color:#ed7777;';this.appendChild(output);}output.textContent=text;this.dispatchEvent(new CustomEvent('arianna:modifier-error',{bubbles:true,detail:{error,source:this}}));}
 }
}
