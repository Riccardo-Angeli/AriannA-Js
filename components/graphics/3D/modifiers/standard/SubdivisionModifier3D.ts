/** @module SubdivisionModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-subdivision',{title:'Subdivision',subtitle:'Local-space geometry',controls:[{"attr": "iterations", "label": "Iterations", "type": "range", "value": 1, "min": 0, "max": 4, "step": 1}]});
export namespace SubdivisionModifier3D {
 export type ModifierOptions=Options;
 export class SubdivisionModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options|number={iterations:1},axis:Options['axis']='y'){super(mesh,typeof options==='number'?{iterations:options,axis}:options,(g,o)=>subdivide(g,o,false));}
 }
 @Component('arianna-subdivision',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "iterations"],Properties:['options']})
 export class SubdivisionModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new SubdivisionModifier3D(mesh,options);
  }
 }
}
export default SubdivisionModifier3D.SubdivisionModifier3D;
