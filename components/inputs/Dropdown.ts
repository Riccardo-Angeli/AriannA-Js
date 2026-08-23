/**
 * @module    components/inputs/Dropdown
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Dropdown component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   Dropdown
 *  @public
 *  @description Namespace containing Dropdown contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Dropdown
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
        /** @interface   DropdownOption
         *  @public
         *  @description DropdownOption contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DropdownOption
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

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   DropdownOptions
         *  @public
         *  @description DropdownOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DropdownOptions
        {
            /** @name        placeholder
             *  @public
             *  @type        {string}
             *  @description Component member for placeholder.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            placeholder?: string;

            /** @name        searchable
             *  @public
             *  @type        {boolean}
             *  @description Component member for searchable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            searchable?: boolean;

            /** @name        clearable
             *  @public
             *  @type        {boolean}
             *  @description Component member for clearable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clearable?: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;

            /** @name        options
             *  @public
             *  @type        {Dropdown.Interfaces.DropdownOption[]}
             *  @description Component member for options.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            options?: Interfaces.DropdownOption[];

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

    /** @class       Dropdown
     *  @public
     *  @description AriannA Dropdown component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-dropdown', {}, {
        Attributes: ['placeholder', 'searchable', 'clearable', 'disabled', 'value'],
    })
    export class Dropdown extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        options$
         *  @public
         *  @type        {Dropdown.Types.Signal<Dropdown.Interfaces.DropdownOption[]>}
         *  @description Component member for options$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        options$: Types.Signal<Interfaces.DropdownOption[]> = signal<Interfaces.DropdownOption[]>([]);

        /** @name        open$
         *  @public
         *  @type        {Dropdown.Types.Signal<boolean>}
         *  @description Component member for open$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        open$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        filter$
         *  @public
         *  @type        {Dropdown.Types.Signal<string>}
         *  @description Component member for filter$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        filter$: Types.Signal<string> = signal<string>('');

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
         *  @param       {Dropdown.Interfaces.DropdownOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.DropdownOptions = {})
        {
            /** @name        value
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned value value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const value = this.signal().attribute('value');

            /** @name        selected
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned selected value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const selected = (): Interfaces.DropdownOption | undefined => this.options$.Get().find((o: any) => o.value === (value.Get() ?? ''));
            this.placeholderText = () => this.getAttribute('placeholder') ?? 'Select…';
            this.isOpen = () => this.open$.Get();
            this.isSearchable = () => this.hasAttribute('searchable');
            this.isClearable = () => this.hasAttribute('clearable');
            this.isDisabled = () => this.hasAttribute('disabled');
            this.hasSelection = () => !!selected();
            this.selectedLabel = () => selected()?.label ?? this.placeholderText();
            this.selectedIcon = () => selected()?.icon ?? '';
            this.hasSelectedIcon = () => !!selected()?.icon;
            this.valueClass = () => 'ar-dropdown__value' +
                (this.hasSelection() ? '' : ' ar-dropdown__placeholder');
            this.arrowText = () => this.isOpen() ? '▾' : '▸';
            this.filterValue = () => this.filter$.Get();
            this.filteredOpts = (): Interfaces.DropdownOption[] => {
                /** @name        q
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned q value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const q = this.filter$.Get().toLowerCase();

                /** @name        opts
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned opts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const opts = this.options$.Get();
                return q ? opts.filter((o: any) => o.label.toLowerCase().includes(q)) : opts;
            };
            this.optCls = (o: Interfaces.DropdownOption) => 'ar-dropdown__option'
                + (o.value === (value.Get() ?? '') ? ' ar-dropdown__option--active' : '')
                + (o.disabled ? ' ar-dropdown__option--disabled' : '');
            this.onTriggerClick = (e: Event) => {
                e.stopPropagation();
                if (this.isDisabled())
                    return;

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
                else if (this.#outsideClick)
                {
                    document.removeEventListener('click', this.#outsideClick);
                    this.#outsideClick = null;
                }
            };
            this.onClear = (e: Event) => {
                e.stopPropagation();
                this.removeAttribute('value');
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { value: '', option: null },
                }));
            };
            this.onFilter = (e: Event) => {
                e.stopPropagation();
                this.filter$.Set((e.target as HTMLInputElement).value);
            };
            this.onOptionClick = (opt: Interfaces.DropdownOption, e: Event) => {
                e.stopPropagation();
                if (opt.disabled)
                    return;
                this.setAttribute('value', opt.value);
                this.open$.Set(false);
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { value: opt.value, option: opt },
                }));
            };
            this.template = html `
            <div class="ar-dropdown__trigger" @click="this.onTriggerClick">
                <span class="ar-dropdown__icon" a-if="this.hasSelectedIcon()">{{ this.selectedIcon() }}</span>
                <span :class="this.valueClass()">{{ this.selectedLabel() }}</span>
                <button class="ar-dropdown__clear"
                        a-if="this.isClearable() && this.hasSelection()"
                        @click="this.onClear"
                        aria-label="Clear">✕</button>
                <span class="ar-dropdown__arrow">{{ this.arrowText() }}</span>
            </div>
            <div class="ar-dropdown__list" a-if="this.isOpen()">
                <input class="ar-dropdown__search"
                       type="text"
                       a-if="this.isSearchable()"
                       placeholder="Search…"
                       :value="this.filterValue()"
                       @input="this.onFilter"
                       @click="(e) => e.stopPropagation()"/>
                <div :class="this.optCls(opt)"
                     a-for="opt in this.filteredOpts()"
                     @click="(e) => this.onOptionClick(opt, e)">
                    <span a-if="opt.icon">{{ opt.icon }}</span>
                    <span>{{ opt.label }}</span>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Dropdown.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Dropdown.DefaultSheet();
        }

        /** @name        options
         *  @public
         *  @type        {void}
         *  @description Component member for options.
         *  @param       {Dropdown.Interfaces.DropdownOption[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set options(v: Interfaces.DropdownOption[]) { this.options$.Set(v ?? []); }

        /** @name        options
         *  @public
         *  @type        {Dropdown.Interfaces.DropdownOption[]}
         *  @description Component member for options.
         *  @returns     {Dropdown.Interfaces.DropdownOption[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get options(): Interfaces.DropdownOption[] { return this.options$.Get(); }

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

        /** @name        placeholder
         *  @public
         *  @type        {string}
         *  @description Component member for placeholder.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get placeholder(): string { return this.getAttribute('placeholder') ?? ''; }

        /** @name        placeholder
         *  @public
         *  @type        {void}
         *  @description Component member for placeholder.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set placeholder(v: string) { this.setAttribute('placeholder', v); }

        /** @name        searchable
         *  @public
         *  @type        {boolean}
         *  @description Component member for searchable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get searchable(): boolean { return this.hasAttribute('searchable'); }

        /** @name        searchable
         *  @public
         *  @type        {void}
         *  @description Component member for searchable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set searchable(v: boolean) { v ? this.setAttribute('searchable', '') : this.removeAttribute('searchable'); }

        /** @name        clearable
         *  @public
         *  @type        {boolean}
         *  @description Component member for clearable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get clearable(): boolean { return this.hasAttribute('clearable'); }

        /** @name        clearable
         *  @public
         *  @type        {void}
         *  @description Component member for clearable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set clearable(v: boolean) { v ? this.setAttribute('clearable', '') : this.removeAttribute('clearable'); }

        /** @name        placeholderText
         *  @private
         *  @type        {() => string}
         *  @description Component member for placeholder Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private placeholderText: () => string = () => '';

        /** @name        isOpen
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Open.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isOpen: () => boolean = () => false;

        /** @name        isSearchable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Searchable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSearchable: () => boolean = () => false;

        /** @name        isClearable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Clearable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isClearable: () => boolean = () => false;

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        hasSelection
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Selection.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasSelection: () => boolean = () => false;

        /** @name        selectedLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for selected Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selectedLabel: () => string = () => '';

        /** @name        selectedIcon
         *  @private
         *  @type        {() => string}
         *  @description Component member for selected Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private selectedIcon: () => string = () => '';

        /** @name        hasSelectedIcon
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Selected Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasSelectedIcon: () => boolean = () => false;

        /** @name        valueClass
         *  @private
         *  @type        {() => string}
         *  @description Component member for value Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private valueClass: () => string = () => '';

        /** @name        arrowText
         *  @private
         *  @type        {() => string}
         *  @description Component member for arrow Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private arrowText: () => string = () => '▸';

        /** @name        filterValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for filter Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private filterValue: () => string = () => '';

        /** @name        filteredOpts
         *  @private
         *  @type        {() => Dropdown.Interfaces.DropdownOption[]}
         *  @description Component member for filtered Opts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private filteredOpts: () => Interfaces.DropdownOption[] = () => [];

        /** @name        optCls
         *  @private
         *  @type        {(o: Dropdown.Interfaces.DropdownOption) => string}
         *  @description Component member for opt Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private optCls: (o: Interfaces.DropdownOption) => string = () => '';

        /** @name        onTriggerClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Trigger Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onTriggerClick: (e: Event) => void = () => { };

        /** @name        onClear
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Clear.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClear: (e: Event) => void = () => { };

        /** @name        onFilter
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Filter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onFilter: (e: Event) => void = () => { };

        /** @name        onOptionClick
         *  @private
         *  @type        {(o: Dropdown.Interfaces.DropdownOption, e: Event) => void}
         *  @description Component member for on Option Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onOptionClick: (o: Interfaces.DropdownOption, e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Dropdown.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Dropdown.Types.Stylesheet} Result.
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
                    maxWidth: '320px',
                }),
                new Rule('.ar-dropdown__trigger', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '8px',
                    padding: '6px 10px',
                    transition: 'border-color 0.18s ease',
                }),
                new Rule('.ar-dropdown__trigger:hover', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-dropdown__value', { flex: '1', fontSize: '0.82rem' }),
                new Rule('.ar-dropdown__placeholder', { color: 'var(--arianna-muted, #6e6b62)' }),
                new Rule('.ar-dropdown__arrow', { color: 'var(--arianna-muted, #6e6b62)', fontSize: '0.7rem' }),
                new Rule('.ar-dropdown__clear', {
                    background: 'none', border: 'none',
                    color: 'var(--arianna-muted, #6e6b62)',
                    cursor: 'pointer', fontSize: '0.7rem', padding: '0',
                }),
                new Rule('.ar-dropdown__list', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                    display: 'flex',
                    flexDirection: 'column',
                    left: '0',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    position: 'absolute',
                    right: '0',
                    top: 'calc(100% + 4px)',
                    zIndex: '900',
                }),
                new Rule('.ar-dropdown__search', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: 'none',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    font: 'inherit',
                    fontSize: '0.8rem',
                    outline: 'none',
                    padding: '6px 10px',
                }),
                new Rule('.ar-dropdown__option', {
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    fontSize: '0.82rem',
                    gap: '8px',
                    padding: '6px 10px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-dropdown__option:hover:not(.ar-dropdown__option--disabled)', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-dropdown__option--active', {
                    background: 'rgba(31,111,235,0.10)',
                    color: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-dropdown__option--disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]);
        }
    }
}
export default Dropdown;

export type DropdownOption = Dropdown.Interfaces.DropdownOption;
export type DropdownOptions = Dropdown.Interfaces.DropdownOptions;
