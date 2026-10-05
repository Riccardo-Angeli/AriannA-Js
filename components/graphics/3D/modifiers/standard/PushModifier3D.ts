/** @module PushModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-push',{title:'Push',subtitle:'Local-space geometry',controls:[{"attr": "amount", "label": "Amount", "type": "range", "value": 0.15, "min": -2, "max": 2, "step": 0.01}]});
export namespace PushModifier3D {
 export type ModifierOptions=Options;
 export class PushModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options|number={amount:0.1},axis:Options['axis']='y'){super(mesh,typeof options==='number'?{amount:options,axis}:options,(g,o)=>deform(g,'push',o));}
 }
 @Component('arianna-push',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "amount"],Properties:['options']})
 export class PushModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new PushModifier3D(mesh,options);
  }
 }
}
export default PushModifier3D.PushModifier3D;
