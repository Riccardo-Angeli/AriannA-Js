/**
 * @module    components/inputs
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — all input components (Batch 2 of the Component 2.0 migration).
 * Importing this module side-effect-registers 15 custom elements so the tags
 * become available in HTML markup, plus re-exports the classes and types.
 *
 * Tags registered:
 *   arianna-button, arianna-switch, arianna-checkbox, arianna-radio,
 *   arianna-text-field, arianna-search-bar, arianna-dropdown,
 *   arianna-rating, arianna-chip, arianna-file-upload,
 *   arianna-time-picker, arianna-color-picker, arianna-range-slider,
 *   arianna-calendar, arianna-date-picker
 *
 * Not included in this pass (deferred to a second pass):
 *   RichTextEditor (599 SLOC legacy) — needs a fresh editing-model design
 *   on top of v2 reactive primitives. Tracked in TODO_RICHTEXTEDITOR_V2.md.
 */

export { Button }      from './Button.ts';
export { Switch }      from './Switch.ts';
export { Checkbox }    from './Checkbox.ts';
export { Radio }       from './Radio.ts';
export { TextField }   from './TextField.ts';
export { SearchBar }   from './SearchBar.ts';
export { Dropdown }    from './Dropdown.ts';
export { Rating }      from './Rating.ts';
export { Chip }        from './Chip.ts';
export { FileUpload }  from './FileUpload.ts';
export { TimePicker }  from './TimePicker.ts';
export { ColorPicker } from './ColorPicker.ts';
export { RangeSlider } from './RangeSlider.ts';
export { Calendar }    from './Calendar.ts';
export { DatePicker }  from './DatePicker.ts';
export { RichTextEditor } from './RichTextEditor.ts';

export type { ButtonOptions }      from './Button.ts';
export type { SwitchOptions }      from './Switch.ts';
export type { CheckboxOptions }    from './Checkbox.ts';
export type { RadioOption, RadioOptions } from './Radio.ts';
export type { TextFieldOptions }   from './TextField.ts';
export type { SearchBarOptions }   from './SearchBar.ts';
export type { DropdownOption, DropdownOptions } from './Dropdown.ts';
export type { RatingOptions }      from './Rating.ts';
export type { ChipOptions }        from './Chip.ts';
export type { FileUploadOptions }  from './FileUpload.ts';
export type { TimePickerOptions }  from './TimePicker.ts';
export type { ColorPickerOptions } from './ColorPicker.ts';
export type { RangeSliderOptions } from './RangeSlider.ts';
export type { CalendarOptions }    from './Calendar.ts';
export type { DatePickerOptions }  from './DatePicker.ts';
export type { RichTextEditorOptions, ToolbarCommand } from './RichTextEditor.ts';
