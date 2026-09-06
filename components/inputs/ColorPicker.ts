/**
 * @module    components/inputs/ColorPicker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ColorPicker component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   ColorPicker
 *  @public
 *  @description Namespace containing ColorPicker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ColorPicker
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ColorPickerOptions
         *  @public
         *  @description ColorPickerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ColorPickerOptions
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: string;

            /** @name        presets
             *  @public
             *  @type        {string[]}
             *  @description Component member for presets.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            presets?: string[];

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       ColorPicker
     *  @public
     *  @description AriannA ColorPicker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-color-picker', {}, {
        shadow: false,
        Attributes: ['label', 'value', 'disabled'],
    })
    export class ColorPicker extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        presets$
         *  @public
         *  @type        {ColorPicker.Types.Signal<string[]>}
         *  @description Component member for presets$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        presets$: Types.Signal<string[]> = signal<string[]>([]);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ColorPicker.Interfaces.ColorPickerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ColorPickerOptions = {})
        {
            this.presets$ ??= signal<string[]>([]);
            const self=this as ColorPicker & { __renderColorPicker?:()=>void; onAttributeChanged?:()=>void };
            this.classList.add('ColorPicker');
            const normalize=(v:string)=>/^#[0-9a-f]{6}$/i.test(v)?v:'#e40c88';
            const render=()=>{
                const value=normalize(this.getAttribute('value') ?? '#e40c88'); const disabled=this.hasAttribute('disabled'); const labelText=this.getAttribute('label')??'';
                const label=document.createElement('div'); label.className='ar-colorpicker__label'; label.textContent=labelText; label.hidden=!labelText;
                const row=document.createElement('div'); row.className='ar-colorpicker__row';
                const swatch=document.createElement('span'); swatch.className='ar-colorpicker__swatch'; swatch.style.background=value; swatch.title=value;
                const picker=document.createElement('input'); picker.className='ar-colorpicker__input'; picker.type='color'; picker.value=value; picker.disabled=disabled; picker.ariaLabel=labelText?`${labelText} color`:'Choose color';
                const hex=document.createElement('input'); hex.className='ar-colorpicker__hex'; hex.value=value.toUpperCase(); hex.disabled=disabled; hex.maxLength=7; hex.spellcheck=false;
                const commit=(v:string)=>{v=normalize(v);this.setAttribute('value',v);swatch.style.background=v;picker.value=v;hex.value=v.toUpperCase();this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail:{value:v}}));};
                picker.addEventListener('input',()=>commit(picker.value)); hex.addEventListener('change',()=>commit(hex.value));
                swatch.appendChild(picker);row.appendChild(swatch);row.appendChild(hex);
                const presets=document.createElement('div'); presets.className='ar-colorpicker__presets';
                for(const color of this.presets$.Get()){const b=document.createElement('button');b.type='button';b.className='ar-colorpicker__preset';b.style.background=color;b.title=color;b.disabled=disabled;b.addEventListener('click',()=>commit(color));presets.appendChild(b);}
                this.replaceChildren(label,row,presets);
            };
            self.__renderColorPicker=render;self.onAttributeChanged=()=>render();render();
            (this as unknown as { Sheet: Types.Stylesheet | null }).Sheet = ColorPicker.DefaultSheet();
        }

        /** @name        presets
         *  @public
         *  @type        {void}
         *  @description Component member for presets.
         *  @param       {string[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set presets(v: string[]) { this.presets$.Set(v ?? []); ; (this as any).__renderColorPicker?.(); }

        /** @name        presets
         *  @public
         *  @type        {string[]}
         *  @description Component member for presets.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get presets(): string[] { return this.presets$.Get(); }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        value
         *  @public
         *  @type        {string}
         *  @description Component member for value.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get value(): string { return this.getAttribute('value') ?? '#000000'; }

        /** @name        value
         *  @public
         *  @type        {void}
         *  @description Component member for value.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set value(v: string) { this.setAttribute('value', v); }

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get label(): string { return this.getAttribute('label') ?? ''; }

        /** @name        label
         *  @public
         *  @type        {void}
         *  @description Component member for label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

        /** @name        hasLabel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasLabel: () => boolean = () => false;

        /** @name        labelText
         *  @private
         *  @type        {() => string}
         *  @description Component member for label Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelText: () => string = () => '';

        /** @name        currentVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for current Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private currentVal: () => string = () => '#000000';

        /** @name        swatchStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for swatch Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private swatchStyle: () => string = () => '';

        /** @name        hexText
         *  @private
         *  @type        {() => string}
         *  @description Component member for hex Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hexText: () => string = () => '#000000';

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        allPresets
         *  @private
         *  @type        {() => string[]}
         *  @description Component member for all Presets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allPresets: () => string[] = () => [];

        /** @name        hasPresets
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Presets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasPresets: () => boolean = () => false;

        /** @name        presetStyle
         *  @private
         *  @type        {(c: string) => string}
         *  @description Component member for preset Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private presetStyle: (c: string) => string = () => '';

        /** @name        onInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInput: (e: Event) => void = () => { };

        /** @name        onChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onChange: (e: Event) => void = () => { };

        /** @name        onPresetClick
         *  @private
         *  @type        {(c: string) => void}
         *  @description Component member for on Preset Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPresetClick: (c: string) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ColorPicker.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ColorPicker.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('arianna-color-picker', { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '280px' }),
                new Rule('.ar-colorpicker__label', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                }),
                new Rule('.ar-colorpicker__row', { alignItems: 'center', display: 'flex', gap: '10px' }),
                new Rule('.ar-colorpicker__swatch', {
                    border: '2px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    cursor: 'pointer',
                    height: '32px',
                    overflow: 'hidden',
                    position: 'relative',
                    width: '44px',
                }),
                new Rule('.ar-colorpicker__input', {
                    cursor: 'pointer',
                    height: '150%',
                    left: '-25%',
                    opacity: '0',
                    position: 'absolute',
                    top: '-25%',
                    width: '150%',
                }),
                new Rule('.ar-colorpicker__hex', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, #1f2328)',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    fontVariantNumeric: 'tabular-nums',
                    minHeight: '34px',
                    outline: 'none',
                    padding: '5px 9px',
                    width: '104px',
                }),
                new Rule('.ar-colorpicker__hex:focus', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    boxShadow: '0 0 0 3px var(--arianna-focus-ring, rgba(31,111,235,.18))',
                }),
                new Rule('.ar-colorpicker__presets', { display: 'flex', flexWrap: 'wrap', gap: '4px' }),
                new Rule('.ar-colorpicker__preset', {
                    border: '2px solid transparent',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    height: '20px',
                    width: '20px',
                    padding: '0',
                    transition: 'border-color 0.18s ease',
                }),
                new Rule('.ar-colorpicker__preset:hover', {
                    borderColor: 'var(--arianna-text, #1f2328)',
                }),
            ]);
        }
    }
}
export default ColorPicker;

export type ColorPickerOptions = ColorPicker.Interfaces.ColorPickerOptions;
