/**
 * @module    components/inputs/ColorPicker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ColorPicker — native color input with hex display and optional palette presets.
 *
 * @example JS
 *   const c = new ColorPicker();
 *   c.label = 'Accent';
 *   c.value = '#1f6feb';
 *   c.presets = ['#ff5f57', '#ffbd2e', '#28c940', '#1f6feb'];
 *
 * @example HTML
 *   <arianna-color-picker label="Brand" value="#1f6feb"></arianna-color-picker>
 *
 * Events: arianna:input, arianna:change  detail: { value }
 * Attrs:  label, value, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Reactivity } from '../../core/Reactive.ts';

/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = Reactivity.Types.SignalContract<T>;
import { Css } from '../../core/Css.ts';
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;

export interface ColorPickerOptions {
    label?    : string;
    value?    : string;
    presets?  : string[];
    disabled? : boolean;
}

export class ColorPicker extends Component('arianna-color-picker', HTMLElement, {}, {
    attrs : ['label', 'value', 'disabled'],
})
{
    presets$: Signal<string[]> = signal<string[]>([]);

    build(_opts: ColorPickerOptions = {})
    {
        const label = this.attrSignal('label');
        const value = this.attrSignal('value');

        this.hasLabel    = () => !!label.get();
        this.labelText   = () => label.get() ?? '';
        this.currentVal  = () => value.get() ?? '#000000';
        this.swatchStyle = () => `background: ${this.currentVal()}`;
        this.hexText     = () => (value.get() ?? '#000000').toUpperCase();
        this.isDisabled  = () => this.hasAttribute('disabled');
        this.allPresets  = () => this.presets$.Get();
        this.hasPresets  = () => this.presets$.Get().length > 0;
        this.presetStyle = (c: string) => `background: ${c}`;

        this.onInput = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.setAttribute('value', inp.value);
            this.dispatchEvent(new CustomEvent('arianna:input', {
                bubbles: true, detail: { value: inp.value },
            }));
        };
        this.onChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: inp.value },
            }));
        };
        this.onPresetClick = (c: string) => {
            this.setAttribute('value', c);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: c },
            }));
        };

        this.template = html`
            <div class="ar-colorpicker__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div class="ar-colorpicker__row">
                <div class="ar-colorpicker__swatch" :style="this.swatchStyle()">
                    <input class="ar-colorpicker__input"
                           type="color"
                           :value="this.currentVal()"
                           :disabled="this.isDisabled()"
                           @input="this.onInput"
                           @change="this.onChange"/>
                </div>
                <span class="ar-colorpicker__hex">{{ this.hexText() }}</span>
            </div>
            <div class="ar-colorpicker__presets" a-if="this.hasPresets()">
                <button class="ar-colorpicker__preset"
                        a-for="c in this.allPresets()"
                        :style="this.presetStyle(c)"
                        :title="c"
                        @click="(e) => this.onPresetClick(c)"></button>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = ColorPicker.DefaultSheet();
    }

    set presets(v: string[]) { this.presets$.Set(v ?? []); }
    get presets(): string[]  { return this.presets$.Get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get value(): string  { return this.getAttribute('value') ?? '#000000'; }
    set value(v: string) { this.setAttribute('value', v); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    private hasLabel    : () => boolean = () => false;
    private labelText   : () => string = () => '';
    private currentVal  : () => string = () => '#000000';
    private swatchStyle : () => string = () => '';
    private hexText     : () => string = () => '#000000';
    private isDisabled  : () => boolean = () => false;
    private allPresets  : () => string[] = () => [];
    private hasPresets  : () => boolean = () => false;
    private presetStyle : (c: string) => string = () => '';
    private onInput     : (e: Event) => void = () => {};
    private onChange    : (e: Event) => void = () => {};
    private onPresetClick: (c: string) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '6px' }),
                new Rule('.ar-colorpicker__label', {
                    color     : 'var(--arianna-muted, #6e6b62)',
                    fontSize  : '0.78rem',
                    fontWeight: '500',
                }),
                new Rule('.ar-colorpicker__row', { alignItems: 'center', display: 'flex', gap: '10px' }),
                new Rule('.ar-colorpicker__swatch', {
                    border      : '2px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    cursor      : 'pointer',
                    height      : '32px',
                    overflow    : 'hidden',
                    position    : 'relative',
                    width       : '44px',
                }),
                new Rule('.ar-colorpicker__input', {
                    cursor  : 'pointer',
                    height  : '150%',
                    left    : '-25%',
                    opacity : '0',
                    position: 'absolute',
                    top     : '-25%',
                    width   : '150%',
                }),
                new Rule('.ar-colorpicker__hex', {
                    fontSize           : '0.82rem',
                    fontVariantNumeric : 'tabular-nums',
                    color              : 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-colorpicker__presets', { display: 'flex', flexWrap: 'wrap', gap: '4px' }),
                new Rule('.ar-colorpicker__preset', {
                    border      : '2px solid transparent',
                    borderRadius: '50%',
                    cursor      : 'pointer',
                    height      : '20px',
                    width       : '20px',
                    padding     : '0',
                    transition  : 'border-color 0.18s ease',
                }),
                new Rule('.ar-colorpicker__preset:hover', {
                    borderColor: 'var(--arianna-text, #1f2328)',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ColorPicker', { value: ColorPicker, writable: false, enumerable: false, configurable: false });
}

export default ColorPicker;
