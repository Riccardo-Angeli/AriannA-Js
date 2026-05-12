// components/inputs/index.ts — public surface of the Inputs component group.
//
// Form-style inputs that capture user values. Most components emit through
// the standard `on('change', ...)` event with the new value as detail.
//
// New May-2026 addition: Calendar, which works in two modes — passive
// month/week/day calendar (Layout role) and active date picker (Input role).

// ── Pre-existing inputs ────────────────────────────────────────────────────
export { Button }         from './Button';
export { Checkbox }       from './Checkbox';
export { Chip }           from './Chip';
export { ColorPicker }    from './ColorPicker';
export { DatePicker }     from './DatePicker';
export { Dropdown }       from './Dropdown';
export { FileUpload }     from './FileUpload';
export { Radio }          from './Radio';
export { RangeSlider }    from './RangeSlider';
export { Rating }         from './Rating';
export { RichTextEditor } from './RichTextEditor';
export { SearchBar }      from './SearchBar';
export { Switch }         from './Switch';
export { TextField }      from './TextField';
export { TimePicker }     from './TimePicker';

// ── New May-2026 ───────────────────────────────────────────────────────────
export { Calendar } from './Calendar';
export type { CalendarView, CalendarEvent, CalendarOptions } from './Calendar';
