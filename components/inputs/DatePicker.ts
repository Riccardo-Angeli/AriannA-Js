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
        shadow: false,
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

        /** @name        __outsideClick
         *  @public
         *  @type        {((e: Event) => void) | null}
         *  @description Component member for outside Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        __outsideClick: ((e: Event) => void) | null = null;

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
            this.open$ ??= signal<boolean>(false);
            this.__outsideClick ??= null;
            type Runtime = DatePicker & {
                __dateOpen?: boolean;
                __dateRender?: () => void;
                __dateOutside?: (event: Event) => void;
                onAttributeChanged?: () => void;
            };

            const self = this as Runtime;
            this.classList.add('DatePicker');

            if (self.__dateOpen === undefined)
                self.__dateOpen = false;

            const render = () =>
            {
                const disabled = this.hasAttribute('disabled');
                const labelText = this.getAttribute('label') ?? '';
                const value = this.getAttribute('value') ?? '';

                const label = document.createElement('div');
                label.className = 'ar-datepicker__label';
                label.textContent = labelText;
                label.hidden = !labelText;

                const wrap = document.createElement('div');
                wrap.className = 'ar-datepicker__wrap';

                const input = document.createElement('input');
                input.className = 'ar-datepicker__input';
                input.type = 'text';
                input.value = value;
                input.placeholder = this.getAttribute('placeholder') ?? 'YYYY-MM-DD';
                input.disabled = disabled;
                input.setAttribute('aria-haspopup', 'dialog');
                input.setAttribute('aria-expanded', self.__dateOpen ? 'true' : 'false');

                const icon = document.createElement('button');
                icon.type = 'button';
                icon.className = 'ar-datepicker__icon';
                icon.textContent = '▦';
                icon.disabled = disabled;
                icon.ariaLabel = 'Open calendar';
                icon.setAttribute('aria-expanded', self.__dateOpen ? 'true' : 'false');

                wrap.append(input, icon);

                const nodes: Node[] = [label, wrap];

                if (self.__dateOpen && !disabled)
                {
                    const popup = document.createElement('div');
                    popup.className = 'ar-datepicker__popup';
                    popup.addEventListener('pointerdown', event => event.stopPropagation());

                    const calendar = document.createElement('arianna-calendar');

                    for (const name of ['value', 'min', 'max', 'locale', 'first-day'])
                    {
                        const attributeValue = this.getAttribute(name);

                        if (attributeValue !== null && attributeValue !== '')
                            calendar.setAttribute(name, attributeValue);
                    }

                    calendar.addEventListener('arianna:select', (event: Event) =>
                    {
                        const selected =
                            (event as CustomEvent<{ value?: string }>).detail?.value;

                        if (!selected)
                            return;

                        this.setAttribute('value', selected);
                        self.__dateOpen = false;

                        this.dispatchEvent
                        (
                            new CustomEvent
                            (
                                'arianna:change',
                                {
                                    bubbles: true,
                                    composed: true,
                                    detail: { value: selected }
                                }
                            )
                        );

                        render();
                    });

                    popup.appendChild(calendar);
                    nodes.push(popup);
                }

                const open = (event?: Event) =>
                {
                    event?.stopPropagation();

                    if (disabled || self.__dateOpen)
                        return;

                    self.__dateOpen = true;
                    render();
                };

                const toggle = (event: Event) =>
                {
                    event.stopPropagation();

                    if (disabled)
                        return;

                    self.__dateOpen = !self.__dateOpen;
                    render();
                };

                input.addEventListener('focus', open);
                input.addEventListener('click', open);
                icon.addEventListener('click', toggle);

                input.addEventListener('change', () =>
                {
                    const next = input.value.trim();

                    if (next)
                        this.setAttribute('value', next);
                    else
                        this.removeAttribute('value');

                    this.dispatchEvent
                    (
                        new CustomEvent
                        (
                            'arianna:change',
                            {
                                bubbles: true,
                                composed: true,
                                detail: { value: next }
                            }
                        )
                    );
                });

                this.replaceChildren(...nodes);
            };

            self.__dateRender = render;
            self.onAttributeChanged = () => render();

            if (!self.__dateOutside)
            {
                self.__dateOutside = (event: Event) =>
                {
                    const target = event.target;

                    if
                    (
                        self.__dateOpen &&
                        target instanceof Node &&
                        !this.contains(target)
                    )
                    {
                        self.__dateOpen = false;
                        render();
                    }
                };

                document.addEventListener('pointerdown', self.__dateOutside);
            }

            render();

            (this as unknown as { Sheet: Types.Stylesheet | null }).Sheet =
                DatePicker.DefaultSheet();
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
            const self = this as DatePicker & {
                __dateOutside?: (event: Event) => void;
                __dateRender?: () => void;
                __dateOpen?: boolean;
            };

            if (self.__dateOutside)
            {
                document.removeEventListener('pointerdown', self.__dateOutside);
                self.__dateOutside = undefined;
            }

            self.__dateRender = undefined;
            self.__dateOpen = false;
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
                new Rule('arianna-date-picker', {
                    display: 'inline-block',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '280px',
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
                    minHeight: '36px',
                    padding: '5px 10px',
                    transition: 'border-color 0.18s ease',
                }),
                new Rule('.ar-datepicker__wrap:focus-within', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-datepicker__icon', { flexShrink: '0', background:'transparent', border:'0', color:'inherit', cursor:'pointer', font:'inherit', fontSize:'1rem', lineHeight:'1', padding:'2px 4px' }),
                new Rule('.ar-datepicker__icon:hover:not(:disabled)', { color:'var(--arianna-primary, #e40c88)' }),
                new Rule('.ar-datepicker__input', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    flex: '1',
                    font: 'inherit',
                    fontSize: '0.86rem',
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
