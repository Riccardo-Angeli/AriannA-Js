/** @module components/graphics/colors/CIELUVColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

const Config:PickerConfig={space:'luv',title:'CIE LUV Color Picker',geometry:'plane',channels:[{key:'L',label:'L*',min:0,max:100,step:.1,decimals:1},{key:'u',label:'u*',min:-134,max:220,step:.1,decimals:1},{key:'v',label:'v*',min:-140,max:122,step:.1,decimals:1}],plane:['u','v']};

@Component('arianna-cieluv-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme','geometry','space']})
export class CIELUVColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected get Config():PickerConfig { return Config; }
}

export default CIELUVColorPicker;
