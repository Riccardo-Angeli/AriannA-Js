import {Component} from '../../../core/index.ts';
import {ColorPickerAdapter} from './ColorPickerAdapter.ts';
import {PickerStyles} from './PickerUI.ts';
import type {PickerGeometry} from './ColorSpacePickerBase.ts';
export namespace ColorPickerWheel {
 export namespace Interfaces { export interface ColorPickerWheelOptions {value?:string;color?:string;theme?:'dark'|'light';geometry?:PickerGeometry;palette?:string[];} }
 export const Styles=PickerStyles;
 @Component('arianna-color-picker-wheel',Styles,{Shadow:false,Attributes:['value','color','theme','geometry'],Properties:['palette']})
 export class ColorPickerWheel extends ColorPickerAdapter {protected get DefaultGeometry():PickerGeometry{return 'ring';}}
}
export type ColorPickerWheelOptions=ColorPickerWheel.Interfaces.ColorPickerWheelOptions;
export default ColorPickerWheel.ColorPickerWheel;
