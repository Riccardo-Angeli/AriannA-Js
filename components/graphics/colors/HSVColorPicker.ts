/** @module components/graphics/colors/HSVColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

const Config:PickerConfig={space:'hsv',title:'HSV Color Picker',geometry:'square',channels:[{key:'h',label:'H',min:0,max:360,step:.1,unit:'°',decimals:1},{key:'s',label:'S',min:0,max:100,step:.1,unit:'%',decimals:1},{key:'v',label:'V',min:0,max:100,step:.1,unit:'%',decimals:1}],hue:'h',saturation:'s',value:'v'};

@Component('arianna-hsv-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme','geometry','space']})
export class HSVColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected get Config():PickerConfig { return Config; }
}

export default HSVColorPicker;
