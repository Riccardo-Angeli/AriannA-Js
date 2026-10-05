/** @module BevelModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-bevel',{title:'Bevel',subtitle:'Local-space geometry',controls:[{attr:"outline",label:"Outline",type:"range",min:-1,max:1,step:.01,value:.12},{"attr": "amount", "label": "Height", "type": "range", "value": 1, "min": 0.01, "max": 5, "step": 0.01}, {"attr": "cap", "label": "Caps", "type": "toggle", "value": true}]});
export namespace BevelModifier3D {
 export type ModifierOptions=Options;
 export class BevelModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>extrude({...o,levels:o.levels??[{height:0,outline:0},{height:(o.amount??1)*.2,outline:o.outline??.12},{height:(o.amount??1)*.8,outline:o.outline??.12},{height:o.amount??1,outline:0}]}));}
 }
 @Component('arianna-bevel',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "outline", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "amount", "cap"],Properties:['options']})
 export class BevelModifierElement extends ParametricModifierElement {
  public override sourceFields=['profile'] as const;
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new BevelModifier3D(mesh,options);
  }
 }
}
export default BevelModifier3D.BevelModifier3D;
