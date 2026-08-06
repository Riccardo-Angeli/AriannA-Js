/**
 * @module    components/inputs/Radio
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Radio component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Radio
 *  @public
 *  @description Namespace containing Radio contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Radio
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
        /** @interface   RadioOption
         *  @public
         *  @description RadioOption contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RadioOption
        {
            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value: string;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   RadioOptions
         *  @public
         *  @description RadioOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RadioOptions
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        direction
             *  @public
             *  @type        {'row' | 'column'}
             *  @description Component member for direction.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            direction?: 'row' | 'column';

            /** @name        options
             *  @public
             *  @type        {Radio.Interfaces.RadioOption[]}
             *  @description Component member for options.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            options?: Interfaces.RadioOption[];

            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: string;
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

    /** @class       Radio
     *  @public
     *  @description AriannA Radio component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-radio', {}, {
        Attributes: ['label', 'direction', 'value'],
    })
    export class Radio extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        options$
         *  @public
         *  @type        {Radio.Types.Signal<Radio.Interfaces.RadioOption[]>}
         *  @description Component member for options$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        options$: Types.Signal<Interfaces.RadioOption[]> = signal<Interfaces.RadioOption[]>([]);

        /** @name        #groupName
         *  @public
         *  @type        {unknown}
         *  @description Component member for group Name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #groupName = 'ar-radio-' + Math.random().toString(36).slice(2, 7);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Radio.Interfaces.RadioOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.RadioOptions = {})
        {
            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');

            /** @name        value
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned value value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const value = this.signal().attribute('value');
            this.hasLabel = () => !!label.Get();
            this.labelText = () => label.Get() ?? '';
            this.allOpts = () => this.options$.Get();
            this.itemsCls = () => 'ar-radio-group__items ar-radio-group__items--' +
                (this.getAttribute('direction') ?? 'column');
            this.optCls = (o: Interfaces.RadioOption) => 'ar-radio' + (o.disabled ? ' ar-radio--disabled' : '');
            this.isChecked = (o: Interfaces.RadioOption) => o.value === (value.Get() ?? '');
            this.groupName = () => this.#groupName;
            this.onChange = (opt: Interfaces.RadioOption, e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;
                if (inp.checked)
                {
                    this.setAttribute('value', opt.value);
                    this.dispatchEvent(new CustomEvent('arianna:change', {
                        bubbles: true, detail: { value: opt.value, option: opt },
                    }));
                }
            };
            this.template = html `
            <div class="ar-radio-group__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div :class="this.itemsCls()">
                <label :class="this.optCls(opt)" a-for="opt in this.allOpts()">
                    <input class="ar-radio__input"
                           type="radio"
                           :name="this.groupName()"
                           :value="opt.value"
                           :checked="this.isChecked(opt)"
                           :disabled="opt.disabled"
                           @change="(e) => this.onChange(opt, e)"/>
                    <span class="ar-radio__circle"></span>
                    <span class="ar-radio__label">{{ opt.label }}</span>
                </label>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Radio.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Radio.DefaultSheet();
        }

        /** @name        options
         *  @public
         *  @type        {void}
         *  @description Component member for options.
         *  @param       {Radio.Interfaces.RadioOption[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set options(v: Interfaces.RadioOption[]) { this.options$.Set(v ?? []); }

        /** @name        options
         *  @public
         *  @type        {Radio.Interfaces.RadioOption[]}
         *  @description Component member for options.
         *  @returns     {Radio.Interfaces.RadioOption[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get options(): Interfaces.RadioOption[] { return this.options$.Get(); }

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
        get value(): string { return this.getAttribute('value') ?? ''; }

        /** @name        value
         *  @public
         *  @type        {void}
         *  @description Component member for value.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

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

        /** @name        direction
         *  @public
         *  @type        {'row' | 'column'}
         *  @description Component member for direction.
         *  @returns     {'row' | 'column'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get direction(): 'row' | 'column' { return (this.getAttribute('direction') ?? 'column') as never; }

        /** @name        direction
         *  @public
         *  @type        {void}
         *  @description Component member for direction.
         *  @param       {'row' | 'column'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set direction(v: 'row' | 'column') { this.setAttribute('direction', v); }

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

        /** @name        allOpts
         *  @private
         *  @type        {() => Radio.Interfaces.RadioOption[]}
         *  @description Component member for all Opts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private allOpts: () => Interfaces.RadioOption[] = () => [];

        /** @name        itemsCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for items Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private itemsCls: () => string = () => '';

        /** @name        optCls
         *  @private
         *  @type        {(o: Radio.Interfaces.RadioOption) => string}
         *  @description Component member for opt Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private optCls: (o: Interfaces.RadioOption) => string = () => '';

        /** @name        isChecked
         *  @private
         *  @type        {(o: Radio.Interfaces.RadioOption) => boolean}
         *  @description Component member for is Checked.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isChecked: (o: Interfaces.RadioOption) => boolean = () => false;

        /** @name        groupName
         *  @private
         *  @type        {() => string}
         *  @description Component member for group Name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private groupName: () => string = () => '';

        /** @name        onChange
         *  @private
         *  @type        {(o: Radio.Interfaces.RadioOption, e: Event) => void}
         *  @description Component member for on Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onChange: (o: Interfaces.RadioOption, e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Radio.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Radio.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-radio-group__label', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    marginBottom: '6px',
                }),
                new Rule('.ar-radio-group__items', { display: 'flex', gap: '8px' }),
                new Rule('.ar-radio-group__items--column', { flexDirection: 'column' }),
                new Rule('.ar-radio-group__items--row', { flexDirection: 'row' }),
                new Rule('.ar-radio', {
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    gap: '8px',
                    userSelect: 'none',
                }),
                new Rule('.ar-radio__input', {
                    height: '0', opacity: '0', position: 'absolute', width: '0',
                }),
                new Rule('.ar-radio__circle', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1.5px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '50%',
                    flexShrink: '0',
                    height: '16px',
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    width: '16px',
                }),
                new Rule('.ar-radio__input:checked + .ar-radio__circle', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-radio__input:checked + .ar-radio__circle::after', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderRadius: '50%',
                    content: '""',
                    height: '8px',
                    left: '3px',
                    position: 'absolute',
                    top: '3px',
                    width: '8px',
                }),
                new Rule('.ar-radio__label', { fontSize: '0.82rem' }),
                new Rule('.ar-radio--disabled', { opacity: '0.5', cursor: 'not-allowed' }),
            ]);
        }
    }
}
export default Radio;

export type RadioOption = Radio.Interfaces.RadioOption;
export type RadioOptions = Radio.Interfaces.RadioOptions;
