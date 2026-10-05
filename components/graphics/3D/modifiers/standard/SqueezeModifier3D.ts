/** @module SqueezeModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-squeeze',{title:'Squeeze',subtitle:'Local-space geometry',controls:[{"attr": "axis", "label": "Axis", "type": "select", "value": "y", "options": ["x", "y", "z"]}, {"attr": "amount", "label": "Axial", "type": "range", "value": 0.2, "min": -1, "max": 1, "step": 0.01}, {"attr": "radial", "label": "Radial", "type": "range", "value": -0.3, "min": -2, "max": 2, "step": 0.01}, {"attr": "curve", "label": "Curve", "type": "range", "value": 0, "min": -0.9, "max": 3, "step": 0.01}, {"attr": "limits", "label": "Limits", "type": "toggle", "value": false}, {"attr": "lower", "label": "Lower", "type": "range", "value": -1, "min": -10, "max": 10, "step": 0.01}, {"attr": "upper", "label": "Upper", "type": "range", "value": 1, "min": -10, "max": 10, "step": 0.01}]});
export namespace SqueezeModifier3D {
 export type ModifierOptions=Options;
 export class SqueezeModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>deform(g,'squeeze',o));}
 }
 @Component('arianna-squeeze',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "axis", "amount", "radial", "curve", "limits", "lower", "upper"],Properties:['options']})
 export class SqueezeModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new SqueezeModifier3D(mesh,options);
  }
 }
}
export default SqueezeModifier3D.SqueezeModifier3D;
