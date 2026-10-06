/** Shared live gradient studio, initial tab: linear. */
import {Component} from '../../../core/index.ts';
import type {GradientStop,RGBA} from './GradientEditor.ts';
import {GradientPickerBase,type GradientMode} from './GradientPickerBase.ts';
import {PickerStyles} from './PickerUI.ts';
export namespace LinearGradientEditor {
 export namespace Types{export type GradientInterp='srgb'|'oklab'|'oklch'|'hsl';}
 export namespace Interfaces{export interface LinearGradientEditorOptions{stops?:GradientStop[];angle?:number;interpolation?:Types.GradientInterp;theme?:'dark'|'light';}}

 export const Styles=PickerStyles;
 @Component('arianna-linear-gradient-editor',Styles,{Shadow:false,Attributes:['theme','angle','cx','cy','shape','size','interp','interpolation'],Properties:['stops','points','mode']})
 export class LinearGradientEditor extends GradientPickerBase { protected get DefaultMode():GradientMode{return 'linear';} }
}

export type GradientInterp=LinearGradientEditor.Types.GradientInterp;export type LinearGradientEditorOptions=LinearGradientEditor.Interfaces.LinearGradientEditorOptions;export default LinearGradientEditor.LinearGradientEditor;
