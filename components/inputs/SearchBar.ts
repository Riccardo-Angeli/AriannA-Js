/**
 * @module    components/inputs/SearchBar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * SearchBar — search input with debounced search event + clear button.
 *
 * @example HTML
 *   <arianna-search-bar placeholder="Search…" debounce="300"></arianna-search-bar>
 *
 * Events: arianna:search  detail: { value }
 * Attrs:  placeholder, debounce, value
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface SearchBarOptions {
    placeholder? : string;
    debounce?    : number;
    value?       : string;
}

export class SearchBar extends Component('arianna-search-bar', HTMLElement, {}, {
    attrs : ['placeholder', 'debounce', 'value'],
    shadow: false,
})
{
    #timer = 0;

    build(_opts: SearchBarOptions = {})
    {
        const ph  = this.attrSignal('placeholder');
        const val = this.attrSignal('value');

        this.inpPlaceholder = () => ph.get() ?? 'Search…';
        this.inpValue       = () => val.get() ?? '';
        this.hasValue       = () => !!val.get();

        this.onInput = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.setAttribute('value', inp.value);
            clearTimeout(this.#timer);
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

        this.template = html`
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

        this.Sheet = SearchBar.DefaultSheet();
    }

    /** Programmatically clear the search. */
    clear(): this { this.onClear(); return this; }

    /** Focus the underlying input. */
    focusInput(): this { this.querySelector<HTMLInputElement>('input')?.focus(); return this; }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() { clearTimeout(this.#timer); }

    get value(): string  { return this.getAttribute('value') ?? ''; }
    set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

    get placeholder(): string  { return this.getAttribute('placeholder') ?? ''; }
    set placeholder(v: string) { v ? this.setAttribute('placeholder', v) : this.removeAttribute('placeholder'); }

    get debounce(): number  { return parseInt(this.getAttribute('debounce') ?? '300', 10); }
    set debounce(v: number) { this.setAttribute('debounce', String(v)); }

    private inpPlaceholder: () => string = () => '';
    private inpValue      : () => string = () => '';
    private hasValue      : () => boolean = () => false;
    private onInput       : (e: Event) => void = () => {};
    private onClear       : () => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '20px',
                    display     : 'inline-flex',
                    gap         : '6px',
                    padding     : '5px 12px',
                    transition  : 'border-color 0.18s ease',
                    width       : '100%',
                    maxWidth    : '320px',
                    boxSizing   : 'border-box',
                }),
                new Rule(':root:focus-within', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-searchbar__icon', { color: 'var(--arianna-muted, #6e6b62)', flexShrink: '0' }),
                new Rule('.ar-searchbar__input', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-text, #1f2328)',
                    flex      : '1',
                    font      : 'inherit',
                    fontSize  : '0.82rem',
                    minWidth  : '0',
                    outline   : 'none',
                }),
                new Rule('.ar-searchbar__clear', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #6e6b62)',
                    cursor    : 'pointer',
                    flexShrink: '0',
                    fontSize  : '0.8rem',
                    lineHeight: '1',
                    padding   : '0',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'SearchBar', { value: SearchBar, writable: false, enumerable: false, configurable: false });
}

export default SearchBar;
