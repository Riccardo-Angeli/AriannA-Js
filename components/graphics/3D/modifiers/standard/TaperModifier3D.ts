/** @module TaperModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-taper',{title:'Taper',subtitle:'Local-space geometry',controls:[{"attr": "axis", "label": "Axis", "type": "select", "value": "y", "options": ["x", "y", "z"]}, {"attr": "amount", "label": "Amount", "type": "range", "value": 0.5, "min": -0.95, "max": 3, "step": 0.01}, {"attr": "curve", "label": "Curve", "type": "range", "value": 0, "min": -2, "max": 2, "step": 0.01}, {"attr": "symmetric", "label": "Symmetric", "type": "toggle", "value": false}, {"attr": "limits", "label": "Limits", "type": "toggle", "value": false}, {"attr": "lower", "label": "Lower", "type": "range", "value": -1, "min": -10, "max": 10, "step": 0.01}, {"attr": "upper", "label": "Upper", "type": "range", "value": 1, "min": -10, "max": 10, "step": 0.01}]});
export namespace TaperModifier3D {
 export type ModifierOptions=Options;
 export class TaperModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>deform(g,'taper',o));}
 }
 @Component('arianna-taper',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "axis", "amount", "curve", "symmetric", "limits", "lower", "upper"],Properties:['options']})
 export class TaperModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new TaperModifier3D(mesh,options);
  }
 }
}
export default TaperModifier3D.TaperModifier3D;
