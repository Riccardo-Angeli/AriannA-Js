/** @module components/graphics/colors/HSLColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

const Config:PickerConfig={space:'hsl',title:'HSL Color Picker',geometry:'wheel',channels:[{key:'h',label:'H',min:0,max:360,step:.1,unit:'°',decimals:1},{key:'s',label:'S',min:0,max:100,step:.1,unit:'%',decimals:1},{key:'l',label:'L',min:0,max:100,step:.1,unit:'%',decimals:1}],hue:'h',saturation:'s',lightness:'l'};

@Component('arianna-hsl-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme','geometry','space']})
export class HSLColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected get Config():PickerConfig { return Config; }
}

export default HSLColorPicker;
