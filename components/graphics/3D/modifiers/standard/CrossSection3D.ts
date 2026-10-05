/** Ordered spline sections → longitudinal spline cage. Surface creates the mesh. */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifierElement} from './ParametricModifier3D.ts';
import {sectionGrid,type Options,type V} from './GeometryKernel3D.ts';
export interface CrossSectionCage3D {sections:V[][];longitudinals:V[][];closed:boolean;}
export function createCrossSection3D(options:Options):CrossSectionCage3D {
 const sections=sectionGrid(options);return {sections,longitudinals:sections[0].map((_,i)=>sections.map(row=>({...row[i]}))),closed:options.closed!==false};
}
B.RegisterPanelSchema('arianna-cross-section',{title:'CrossSection',subtitle:'Ordered sections → spline cage',controls:[{attr:'samples',label:'Samples',type:'range',min:3,max:128,step:1,value:24},{attr:'closed',label:'Closed sections',type:'toggle',value:true}]});
export namespace CrossSection3D {
 export class CrossSectionModifier3D extends B.Modifier3D {
  public Cage:CrossSectionCage3D|null=null;
  constructor(mesh:B.Interfaces.MeshLike,public options:Options={}){super(mesh);}
  apply():this{if(this.enabled){this.Cage=createCrossSection3D(this.options);this.mesh.userData.sections3D=this.Cage.sections;}return this;}
 }
 @Component('arianna-cross-section',{},{Shadow:false,Attributes:['viewport','for','enabled','disabled','samples','closed','sections'],Properties:['options']})
 export class CrossSection3D extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  public override sourceFields=['sections'] as const;
  public Cage:CrossSectionCage3D|null=null;
  private overlay:SVGSVGElement|null=null;private stopFrame:(()=>void)|null=null;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();options.sections??=mesh.userData.sections3D as V[][]|undefined;
   const modifier=new CrossSectionModifier3D(mesh,options);if(this.enabled)modifier.apply();this.Cage=modifier.Cage;this.draw();return modifier;
  }
  private draw():void{
   const viewport=this.resolveViewport() as (B.Interfaces.Viewport3DLike&HTMLElement&{selectionSurface:HTMLElement;localToWorld?(p:V,mesh:B.Interfaces.MeshLike):V;projectWorld(p:V):{x:number;y:number;visible:boolean}})|null;
   if(!viewport||!this.Cage){this.overlay?.replaceChildren();return;}
   if(!this.overlay){this.overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');this.overlay.style.cssText='position:absolute;pointer-events:none;z-index:7;';viewport.appendChild(this.overlay);this.stopFrame=viewport.onFrame?.(()=>this.draw())??null;}
   const r=viewport.selectionSurface.getBoundingClientRect(),host=viewport.getBoundingClientRect();this.overlay.style.left=r.left-host.left+'px';this.overlay.style.top=r.top-host.top+'px';this.overlay.setAttribute('width',String(r.width));this.overlay.setAttribute('height',String(r.height));
   const paths=[...this.Cage.sections.map(row=>this.Cage!.closed?[...row,row[0]]:row),...this.Cage.longitudinals];const d=paths.map(row=>{let pen=false;return row.map(p=>{const v=viewport.projectWorld(this.target&&viewport.localToWorld?viewport.localToWorld(p,this.target):p);if(!v.visible){pen=false;return '';}const value=(pen?'L':'M')+v.x+','+v.y;pen=true;return value;}).join('');}).join('');
   let path=this.overlay.firstElementChild;if(!path){path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('fill','none');path.setAttribute('stroke','#e40c88');path.setAttribute('stroke-width','1.5');this.overlay.append(path);}if(path.getAttribute('d')!==d)path.setAttribute('d',d);
  }
  public override onUnmount():void{this.stopFrame?.();this.stopFrame=null;this.overlay?.remove();this.overlay=null;super.onUnmount();}
 }
}
export default CrossSection3D.CrossSection3D;
