/**
 * @module    components/inputs/SearchBar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA SearchBar component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   SearchBar
 *  @public
 *  @description Namespace containing SearchBar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace SearchBar
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
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
        /** @interface   SearchBarOptions
         *  @public
         *  @description SearchBarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SearchBarOptions
        {
            /** @name        placeholder
             *  @public
             *  @type        {string}
             *  @description Component member for placeholder.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            placeholder?: string;

            /** @name        debounce
             *  @public
             *  @type        {number}
             *  @description Component member for debounce.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            debounce?: number;

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

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       SearchBar
     *  @public
     *  @description AriannA SearchBar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-search-bar', {}, {
        Attributes: ['placeholder', 'debounce', 'value'],
    })
    export class SearchBar extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        #timer
         *  @public
         *  @type        {unknown}
         *  @description Component member for timer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #timer = 0;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {SearchBar.Interfaces.SearchBarOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.SearchBarOptions = {})
        {
            /** @name        ph
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ph value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ph = this.signal().attribute('placeholder');

            /** @name        val
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned val value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const val = this.signal().attribute('value');
            this.inpPlaceholder = () => ph.Get() ?? 'Search…';
            this.inpValue = () => val.Get() ?? '';
            this.hasValue = () => !!val.Get();
            this.onInput = (e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;
                this.setAttribute('value', inp.value);
                clearTimeout(this.#timer);

                /** @name        delay
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned delay value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const delay = parseInt(this.getAttribute('debounce') ?? '300', 10) || 300;
                this.#timer = window.setTimeout(() => {
                    this.dispatchEvent(new CustomEvent('arianna:search', {
                        bubbles: true, detail: { value: inp.value },
                    }));
                }, delay);
            };
            this.onClear = () => {
                this.removeAttribute('value');
                clearTimeout(this.#timer);
                this.dispatchEvent(new CustomEvent('arianna:search', {
                    bubbles: true, detail: { value: '' },
                }));
                this.querySelector<HTMLInputElement>('input')?.focus();
            };
            this.template = html `
            <span class="ar-searchbar__icon">🔍</span>
            <input class="ar-searchbar__input"
                   type="text"
                   :placeholder="this.inpPlaceholder()"
                   :value="this.inpValue()"
                   @input="this.onInput"/>
            <button class="ar-searchbar__clear"
                    a-if="this.hasValue()"
                    @click="this.onClear"
                    aria-label="Clear">✕</button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {SearchBar.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = SearchBar.DefaultSheet();
        }

        /** Programmatically clear the search. */
        clear(): this { this.onClear(); return this; }

        /** Focus the underlying input. */
        focusInput(): this { this.querySelector<HTMLInputElement>('input')?.focus(); return this; }

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
        onUnmount() { clearTimeout(this.#timer); }

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
        set placeholder(v: string) { v ? this.setAttribute('placeholder', v) : this.removeAttribute('placeholder'); }

        /** @name        debounce
         *  @public
         *  @type        {number}
         *  @description Component member for debounce.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get debounce(): number { return parseInt(this.getAttribute('debounce') ?? '300', 10); }

        /** @name        debounce
         *  @public
         *  @type        {void}
         *  @description Component member for debounce.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set debounce(v: number) { this.setAttribute('debounce', String(v)); }

        /** @name        inpPlaceholder
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Placeholder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpPlaceholder: () => string = () => '';

        /** @name        inpValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpValue: () => string = () => '';

        /** @name        hasValue
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasValue: () => boolean = () => false;

        /** @name        onInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInput: (e: Event) => void = () => { };

        /** @name        onClear
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Clear.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClear: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {SearchBar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {SearchBar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    gap: '6px',
                    padding: '5px 12px',
                    transition: 'border-color 0.18s ease',
                    width: '100%',
                    maxWidth: '320px',
                    boxSizing: 'border-box',
                }),
                new Rule(':host:focus-within', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-searchbar__icon', { color: 'var(--arianna-muted, #6e6b62)', flexShrink: '0' }),
                new Rule('.ar-searchbar__input', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    flex: '1',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    minWidth: '0',
                    outline: 'none',
                }),
                new Rule('.ar-searchbar__clear', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-muted, #6e6b62)',
                    cursor: 'pointer',
                    flexShrink: '0',
                    fontSize: '0.8rem',
                    lineHeight: '1',
                    padding: '0',
                }),
            ]);
        }
    }
}
export default SearchBar;

export type SearchBarOptions = SearchBar.Interfaces.SearchBarOptions;
