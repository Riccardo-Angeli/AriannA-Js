/** @module MeshSmoothModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-mesh-smooth',{title:'MeshSmooth',subtitle:'Local-space geometry',controls:[{"attr": "iterations", "label": "Loop iterations", "type": "range", "value": 1, "min": 0, "max": 4, "step": 1}, {"attr": "boundaries", "label": "Smooth boundary", "type": "toggle", "value": true}]});
export namespace MeshSmoothModifier3D {
 export type ModifierOptions=Options;
 export class MeshSmoothModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>subdivide(g,o,true));}
 }
 @Component('arianna-mesh-smooth',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "iterations", "boundaries"],Properties:['options']})
 export class MeshSmoothModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new MeshSmoothModifier3D(mesh,options);
  }
 }
}
export default MeshSmoothModifier3D.MeshSmoothModifier3D;
