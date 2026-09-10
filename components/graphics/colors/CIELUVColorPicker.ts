/** @module components/graphics/colors/CIELUVColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

@Component('arianna-cieluv-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme']})
export class CIELUVColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected readonly Config:PickerConfig={
        space:'luv', title:'CIE LUV Color Picker', geometry:'plane',
        channels:[
            {key:'L',label:'L*',min:0,max:100,step:0.1,unit:'',decimals:1},
            {key:'u',label:'u*',min:-134,max:220,step:0.1,unit:'',decimals:1},
            {key:'v',label:'v*',min:-140,max:122,step:0.1,unit:'',decimals:1}
        ],
        plane:['u','v']
    };
}
export default CIELUVColorPicker;
