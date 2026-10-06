/** Shared live gradient studio, initial tab: radial. */
import {Component} from '../../../core/index.ts';
import type {GradientStop,RGBA} from './GradientEditor.ts';
import {GradientPickerBase,type GradientMode} from './GradientPickerBase.ts';
import {PickerStyles} from './PickerUI.ts';
export namespace RadialGradientEditor {
 export namespace Types{export type RadialShape='circle'|'ellipse';export type RadialSize='closest-side'|'farthest-side'|'closest-corner'|'farthest-corner';export type GradientInterp='srgb'|'oklab'|'oklch'|'hsl';}
 export namespace Interfaces{export interface RadialGradientEditorOptions{stops?:GradientStop[];shape?:Types.RadialShape;size?:Types.RadialSize;cx?:number;cy?:number;interpolation?:Types.GradientInterp;theme?:'dark'|'light';}}

 export const Styles=PickerStyles;
 @Component('arianna-radial-gradient-editor',Styles,{Shadow:false,Attributes:['theme','angle','cx','cy','shape','size','interp','interpolation'],Properties:['stops','points','mode']})
 export class RadialGradientEditor extends GradientPickerBase { protected get DefaultMode():GradientMode{return 'radial';} }
}

export type RadialShape=RadialGradientEditor.Types.RadialShape;export type RadialSize=RadialGradientEditor.Types.RadialSize;export type RadialGradientEditorOptions=RadialGradientEditor.Interfaces.RadialGradientEditorOptions;export default RadialGradientEditor.RadialGradientEditor;
