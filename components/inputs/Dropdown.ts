/**
 * @module    components/inputs/Dropdown
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Dropdown — select-style picker with optional search filter and clearable
 * selection.
 *
 * @example HTML
 *   <arianna-dropdown placeholder="Choose country" searchable clearable></arianna-dropdown>
 *
 * Events: arianna:change  detail: { value, option }
 * Attrs:  placeholder, searchable, clearable, disabled, value
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface DropdownOption {
    value    : string;
    label    : string;
    icon?    : string;
    disabled?: boolean;
}

export interface DropdownOptions {
    placeholder? : string;
    searchable?  : boolean;
    clearable?   : boolean;
    disabled?    : boolean;
    options?     : DropdownOption[];
    value?       : string;
}

export class Dropdown extends Component('arianna-dropdown', HTMLElement, {}, {
    attrs : ['placeholder', 'searchable', 'clearable', 'disabled', 'value'],
})
{
    options$: Signal<DropdownOption[]> = signal<DropdownOption[]>([]);
    open$   : Signal<boolean>          = signal<boolean>(false);
    filter$ : Signal<string>           = signal<string>('');

    #outsideClick: ((e: Event) => void) | null = null;

    build(_opts: DropdownOptions = {})
    {
        const value = this.attrSignal('value');

        const selected = (): DropdownOption | undefined =>
            this.options$.get().find(o => o.value === (value.get() ?? ''));

        this.placeholderText = () => this.getAttribute('placeholder') ?? 'Select…';
        this.isOpen          = () => this.open$.get();
        this.isSearchable    = () => this.hasAttribute('searchable');
        this.isClearable     = () => this.hasAttribute('clearable');
        this.isDisabled      = () => this.hasAttribute('disabled');
        this.hasSelection    = () => !!selected();
        this.selectedLabel   = () => selected()?.label ?? this.placeholderText();
        this.selectedIcon    = () => selected()?.icon ?? '';
        this.hasSelectedIcon = () => !!selected()?.icon;
        this.valueClass      = () => 'ar-dropdown__value' +
            (this.hasSelection() ? '' : ' ar-dropdown__placeholder');
        this.arrowText       = () => this.isOpen() ? '▾' : '▸';
        this.filterValue     = () => this.filter$.get();

        this.filteredOpts = (): DropdownOption[] => {
            const q = this.filter$.get().toLowerCase();
            const opts = this.options$.get();
            return q ? opts.filter(o => o.label.toLowerCase().includes(q)) : opts;
        };
        this.optCls = (o: DropdownOption) =>
            'ar-dropdown__option'
            + (o.value === (value.get() ?? '') ? ' ar-dropdown__option--active' : '')
            + (o.disabled ? ' ar-dropdown__option--disabled' : '');

        this.onTriggerClick = (e: Event) => {
            e.stopPropagation();
            if (this.isDisabled()) return;
            const wasOpen = this.open$.get();
            this.open$.set(!wasOpen);
            if (!wasOpen) {
                this.#outsideClick = (ev: Event) => {
                    if (!this.contains(ev.target as Node)) this.open$.set(false);
                };
                setTimeout(() => document.addEventListener('click', this.#outsideClick!), 0);
            } else if (this.#outsideClick) {
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
            this.filter$.set((e.target as HTMLInputElement).value);
        };

        this.onOptionClick = (opt: DropdownOption, e: Event) => {
            e.stopPropagation();
            if (opt.disabled) return;
            this.setAttribute('value', opt.value);
            this.open$.set(false);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: opt.value, option: opt },
            }));
        };

        this.template = html`
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

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Dropdown.DefaultSheet();
    }

    set options(v: DropdownOption[]) { this.options$.set(v ?? []); }
    get options(): DropdownOption[]  { return this.options$.get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        if (this.#outsideClick) {
            document.removeEventListener('click', this.#outsideClick);
            this.#outsideClick = null;
        }
    }

    get value(): string  { return this.getAttribute('value') ?? ''; }
    set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

    get placeholder(): string  { return this.getAttribute('placeholder') ?? ''; }
    set placeholder(v: string) { this.setAttribute('placeholder', v); }

    get searchable(): boolean  { return this.hasAttribute('searchable'); }
    set searchable(v: boolean) { v ? this.setAttribute('searchable', '') : this.removeAttribute('searchable'); }

    get clearable(): boolean  { return this.hasAttribute('clearable'); }
    set clearable(v: boolean) { v ? this.setAttribute('clearable', '') : this.removeAttribute('clearable'); }

    private placeholderText: () => string = () => '';
    private isOpen         : () => boolean = () => false;
    private isSearchable   : () => boolean = () => false;
    private isClearable    : () => boolean = () => false;
    private isDisabled     : () => boolean = () => false;
    private hasSelection   : () => boolean = () => false;
    private selectedLabel  : () => string = () => '';
    private selectedIcon   : () => string = () => '';
    private hasSelectedIcon: () => boolean = () => false;
    private valueClass     : () => string = () => '';
    private arrowText      : () => string = () => '▸';
    private filterValue    : () => string = () => '';
    private filteredOpts   : () => DropdownOption[] = () => [];
    private optCls         : (o: DropdownOption) => string = () => '';
    private onTriggerClick : (e: Event) => void = () => {};
    private onClear        : (e: Event) => void = () => {};
    private onFilter       : (e: Event) => void = () => {};
    private onOptionClick  : (o: DropdownOption, e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    display : 'inline-block',
                    position: 'relative',
                    width   : '100%',
                    maxWidth: '320px',
                }),
                new Rule('.ar-dropdown__trigger', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    cursor      : 'pointer',
                    display     : 'flex',
                    gap         : '8px',
                    padding     : '6px 10px',
                    transition  : 'border-color 0.18s ease',
                }),
                new Rule('.ar-dropdown__trigger:hover', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-dropdown__value', { flex: '1', fontSize: '0.82rem' }),
                new Rule('.ar-dropdown__placeholder', { color: 'var(--arianna-muted, #6e6b62)' }),
                new Rule('.ar-dropdown__arrow',       { color: 'var(--arianna-muted, #6e6b62)', fontSize: '0.7rem' }),
                new Rule('.ar-dropdown__clear', {
                    background: 'none', border: 'none',
                    color     : 'var(--arianna-muted, #6e6b62)',
                    cursor    : 'pointer', fontSize: '0.7rem', padding: '0',
                }),
                new Rule('.ar-dropdown__list', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxShadow   : '0 6px 18px rgba(0,0,0,0.14)',
                    display     : 'flex',
                    flexDirection: 'column',
                    left        : '0',
                    maxHeight   : '260px',
                    overflowY   : 'auto',
                    position    : 'absolute',
                    right       : '0',
                    top         : 'calc(100% + 4px)',
                    zIndex      : '900',
                }),
                new Rule('.ar-dropdown__search', {
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : 'none',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    color       : 'var(--arianna-text, #1f2328)',
                    font        : 'inherit',
                    fontSize    : '0.8rem',
                    outline     : 'none',
                    padding     : '6px 10px',
                }),
                new Rule('.ar-dropdown__option', {
                    alignItems: 'center',
                    cursor    : 'pointer',
                    display   : 'flex',
                    fontSize  : '0.82rem',
                    gap       : '8px',
                    padding   : '6px 10px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-dropdown__option:hover:not(.ar-dropdown__option--disabled)', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-dropdown__option--active', {
                    background: 'rgba(31,111,235,0.10)',
                    color     : 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-dropdown__option--disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Dropdown', { value: Dropdown, writable: false, enumerable: false, configurable: false });
}

export default Dropdown;
