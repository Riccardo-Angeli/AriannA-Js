/** @module components/graphics/colors/CIELABColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

@Component('arianna-cielab-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme']})
export class CIELABColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected readonly Config:PickerConfig={
        space:'lab', title:'CIELAB Color Picker', geometry:'plane',
        channels:[
            {key:'L',label:'L*',min:0,max:100,step:0.1,unit:'',decimals:1},
            {key:'a',label:'a*',min:-128,max:127,step:0.1,unit:'',decimals:1},
            {key:'b',label:'b*',min:-128,max:127,step:0.1,unit:'',decimals:1}
        ],
        plane:['a','b']
    };
}
export default CIELABColorPicker;
