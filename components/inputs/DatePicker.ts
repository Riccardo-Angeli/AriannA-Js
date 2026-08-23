/**
 * @module    components/inputs/DatePicker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA DatePicker component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   DatePicker
 *  @public
 *  @description Namespace containing DatePicker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace DatePicker
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
        /** @interface   DatePickerOptions
         *  @public
         *  @description DatePickerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DatePickerOptions
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

            /** @name        placeholder
             *  @public
             *  @type        {string}
             *  @description Component member for placeholder.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            placeholder?: string;

            /** @name        min
             *  @public
             *  @type        {string}
             *  @description Component member for min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            min?: string;

            /** @name        max
             *  @public
             *  @type        {string}
             *  @description Component member for max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            max?: string;

            /** @name        locale
             *  @public
             *  @type        {string}
             *  @description Component member for locale.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            locale?: string;

            /** @name        firstDay
             *  @public
             *  @type        {0 | 1}
             *  @description Component member for first Day.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            firstDay?: 0 | 1;

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

    /** @class       DatePicker
     *  @public
     *  @description AriannA DatePicker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-date-picker', {}, {
        Attributes: ['label', 'value', 'placeholder', 'min', 'max', 'locale', 'first-day', 'disabled'],
    })
    export class DatePicker extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        open$
         *  @public
         *  @type        {DatePicker.Types.Signal<boolean>}
         *  @description Component member for open$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        open$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        #outsideClick
         *  @public
         *  @type        {((e: Event) => void) | null}
         *  @description Component member for outside Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #outsideClick: ((e: Event) => void) | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {DatePicker.Interfaces.DatePickerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.DatePickerOptions = {})
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

            /** @name        placeholder
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned placeholder value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const placeholder = this.signal().attribute('placeholder');
            this.hasLabel = () => !!label.Get();
            this.labelText = () => label.Get() ?? '';
            this.inpValue = () => value.Get() ?? '';
            this.inpPlaceholder = () => placeholder.Get() ?? 'YYYY-MM-DD';
            this.isOpen = () => this.open$.Get();
            this.isDisabled = () => this.hasAttribute('disabled');
            this.calMin = () => this.getAttribute('min') ?? '';
            this.calMax = () => this.getAttribute('max') ?? '';
            this.calLocale = () => this.getAttribute('locale') ?? '';
            this.calFirstDay = () => this.getAttribute('first-day') ?? '1';
            this.onInputClick = (e: Event) => {
                if (this.isDisabled())
                    return;
                e.stopPropagation();

                /** @name        wasOpen
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned wasOpen value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const wasOpen = this.open$.Get();
                this.open$.Set(!wasOpen);
                if (!wasOpen)
                {
                    this.#outsideClick = (ev: Event) => {
                        if (!this.contains(ev.target as Node))
                            this.open$.Set(false);
                    };
                    setTimeout(() => document.addEventListener('click', this.#outsideClick!), 0);
                }
            };
            this.onInputChange = (e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;
                this.setAttribute('value', inp.value);
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { value: inp.value },
                }));
            };
            this.onCalendarSelect = (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as CustomEvent<{
                    /** @name        value
                     *  @public
                     *  @type        {string}
                     *  @description Component member for value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    value: string;
                }>;
                this.setAttribute('value', ev.detail.value);
                this.open$.Set(false);
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { value: ev.detail.value },
                }));
            };
            this.template = html `
            <div class="ar-datepicker__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div class="ar-datepicker__wrap">
                <span class="ar-datepicker__icon">📅</span>
                <input class="ar-datepicker__input"
                       type="text"
                       :value="this.inpValue()"
                       :placeholder="this.inpPlaceholder()"
                       :disabled="this.isDisabled()"
                       @click="this.onInputClick"
                       @change="this.onInputChange"/>
            </div>
            <div class="ar-datepicker__popup" a-if="this.isOpen()">
                <arianna-calendar :value="this.inpValue()"
                                  :min="this.calMin()"
                                  :max="this.calMax()"
                                  :locale="this.calLocale()"
                                  :first-day="this.calFirstDay()"
                                  @arianna:select="this.onCalendarSelect"></arianna-calendar>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {DatePicker.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = DatePicker.DefaultSheet();
        }

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
        onUnmount()
        {
            if (this.#outsideClick)
            {
                document.removeEventListener('click', this.#outsideClick);
                this.#outsideClick = null;
            }
        }

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

        /** @name        inpValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpValue: () => string = () => '';

        /** @name        inpPlaceholder
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Placeholder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpPlaceholder: () => string = () => '';

        /** @name        isOpen
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Open.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isOpen: () => boolean = () => false;

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        calMin
         *  @private
         *  @type        {() => string}
         *  @description Component member for cal Min.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private calMin: () => string = () => '';

        /** @name        calMax
         *  @private
         *  @type        {() => string}
         *  @description Component member for cal Max.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private calMax: () => string = () => '';

        /** @name        calLocale
         *  @private
         *  @type        {() => string}
         *  @description Component member for cal Locale.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private calLocale: () => string = () => '';

        /** @name        calFirstDay
         *  @private
         *  @type        {() => string}
         *  @description Component member for cal First Day.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private calFirstDay: () => string = () => '1';

        /** @name        onInputClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInputClick: (e: Event) => void = () => { };

        /** @name        onInputChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInputChange: (e: Event) => void = () => { };

        /** @name        onCalendarSelect
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Calendar Select.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCalendarSelect: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {DatePicker.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {DatePicker.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'inline-block',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '240px',
                }),
                new Rule('.ar-datepicker__label', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    marginBottom: '4px',
                }),
                new Rule('.ar-datepicker__wrap', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '8px',
                    padding: '5px 10px',
                    transition: 'border-color 0.18s ease',
                }),
                new Rule('.ar-datepicker__wrap:focus-within', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-datepicker__icon', { flexShrink: '0' }),
                new Rule('.ar-datepicker__input', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    flex: '1',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    outline: 'none',
                    minWidth: '0',
                }),
                new Rule('.ar-datepicker__popup', {
                    left: '0',
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    zIndex: '900',
                }),
            ]);
        }
    }
}
export default DatePicker;

export type DatePickerOptions = DatePicker.Interfaces.DatePickerOptions;
