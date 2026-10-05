/** @module MirrorModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-mirror',{title:'Mirror',subtitle:'Local-space geometry',controls:[{"attr": "axis", "label": "Axis", "type": "select", "value": "y", "options": ["x", "y", "z"]}, {"attr": "offset", "label": "Plane offset", "type": "range", "value": 0, "min": -5, "max": 5, "step": 0.01}, {"attr": "copy", "label": "Keep original", "type": "toggle", "value": true}]});
export namespace MirrorModifier3D {
 export type ModifierOptions=Options;
 export class MirrorModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options|Options['axis']={axis:'x',copy:true}){super(mesh,typeof options==='string'?{axis:options,copy:true}:options,(g,o)=>mirror(g,o));}
 }
 @Component('arianna-mirror',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "axis", "offset", "copy"],Properties:['options']})
 export class MirrorModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new MirrorModifier3D(mesh,options);
  }
 }
}
export default MirrorModifier3D.MirrorModifier3D;
