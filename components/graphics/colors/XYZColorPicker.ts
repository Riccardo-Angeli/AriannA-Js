/** @module components/graphics/colors/XYZColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

@Component('arianna-xyz-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme']})
export class XYZColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected readonly Config:PickerConfig={
        space:'xyz', title:'CIE 1931 XYZ Color Picker', geometry:'plane',
        channels:[
            {key:'X',label:'X',min:0,max:95.047,step:0.01,unit:'',decimals:2},
            {key:'Y',label:'Y',min:0,max:100,step:0.01,unit:'',decimals:2},
            {key:'Z',label:'Z',min:0,max:108.883,step:0.01,unit:'',decimals:2}
        ],
        plane:['X','Y']
    };
}
export default XYZColorPicker;
