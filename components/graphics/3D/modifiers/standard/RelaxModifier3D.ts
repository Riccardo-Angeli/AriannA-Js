/** @module RelaxModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-relax',{title:'Relax',subtitle:'Local-space geometry',controls:[{"attr": "iterations", "label": "Iterations", "type": "range", "value": 2, "min": 0, "max": 30, "step": 1}, {"attr": "factor", "label": "Factor", "type": "range", "value": 0.3, "min": -1, "max": 1, "step": 0.01}, {"attr": "boundaries", "label": "Preserve boundary", "type": "toggle", "value": true}]});
export namespace RelaxModifier3D {
 export type ModifierOptions=Options;
 export class RelaxModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options|number={iterations:3},axis:Options['axis']='y'){super(mesh,typeof options==='number'?{iterations:options,axis}:options,(g,o)=>relax(g,o));}
 }
 @Component('arianna-relax',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "iterations", "factor", "boundaries"],Properties:['options']})
 export class RelaxModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new RelaxModifier3D(mesh,options);
  }
 }
}
export default RelaxModifier3D.RelaxModifier3D;
