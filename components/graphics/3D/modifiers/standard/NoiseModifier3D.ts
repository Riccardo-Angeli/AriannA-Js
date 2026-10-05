/** @module NoiseModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-noise',{title:'Noise',subtitle:'Local-space geometry',controls:[{"attr": "seed", "label": "Seed", "type": "range", "value": 1, "min": 0, "max": 10000, "step": 1}, {"attr": "scale", "label": "Scale", "type": "range", "value": 1, "min": 0.01, "max": 10, "step": 0.01}, {"attr": "strength-x", "label": "Strength X", "type": "range", "value": 0.2, "min": 0, "max": 2, "step": 0.01}, {"attr": "strength-y", "label": "Strength Y", "type": "range", "value": 0.2, "min": 0, "max": 2, "step": 0.01}, {"attr": "strength-z", "label": "Strength Z", "type": "range", "value": 0.2, "min": 0, "max": 2, "step": 0.01}, {"attr": "octaves", "label": "Octaves", "type": "range", "value": 3, "min": 1, "max": 8, "step": 1}, {"attr": "roughness", "label": "Roughness", "type": "range", "value": 0.5, "min": 0, "max": 1, "step": 0.01}, {"attr": "phase", "label": "Phase", "type": "range", "value": 0, "min": 0, "max": 10, "step": 0.01}]});
export namespace NoiseModifier3D {
 export type ModifierOptions=Options;
 export class NoiseModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>deform(g,'noise',o));}
 }
 @Component('arianna-noise',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "seed", "scale", "strength-x", "strength-y", "strength-z", "octaves", "roughness", "phase"],Properties:['options']})
 export class NoiseModifierElement extends ParametricModifierElement {
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new NoiseModifier3D(mesh,options);
  }
 }
}
export default NoiseModifier3D.NoiseModifier3D;
