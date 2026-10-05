/** @module BendModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-bend',{title:'Bend',subtitle:'Local-space geometry',controls:[{"attr": "axis", "label": "Axis", "type": "select", "value": "y", "options": ["x", "y", "z"]}, {"attr": "angle", "label": "Angle (rad)", "type": "range", "value": 1.35, "min": -6.28, "max": 6.28, "step": 0.01}, {"attr": "direction", "label": "Direction (rad)", "type": "range", "value": 0, "min": -3.14, "max": 3.14, "step": 0.01}, {"attr": "limits", "label": "Limits", "type": "toggle", "value": false}, {"attr": "lower", "label": "Lower", "type": "range", "value": -1, "min": -10, "max": 10, "step": 0.01}, {"attr": "upper", "label": "Upper", "type": "range", "value": 1, "min": -10, "max": 10, "step": 0.01}]});
export namespace BendModifier3D {
 export type ModifierOptions=Options;
 export class BendModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options|number={angle:0},axis:Options['axis']='y'){super(mesh,typeof options==='number'?{angle:options,axis}:options,(g,o)=>deform(g,'bend',o));}
 }
 @Component('arianna-bend',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "axis", "angle", "direction", "limits", "lower", "upper"],Properties:['options']})
 export class BendModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new BendModifier3D(mesh,options);
  }
 }
}
export default BendModifier3D.BendModifier3D;
