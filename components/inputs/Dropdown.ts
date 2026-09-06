/**
 * @module    components/inputs/Dropdown
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * Dropdown — select-style picker with optional search, clear and reactive state.
 *
 * The visual tree is intentionally stable and imperative: opening the menu does
 * not depend on a conditional Template re-mount. This keeps HTML-first, Direct,
 * document.createElement(), Real and upgraded AriannA hosts behaviorally equal.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

export namespace Dropdown
{
    export namespace Types
    {
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
        export type Rule = Css.Rule;
        export type Stylesheet = Css.Stylesheet;
    }

    export namespace Interfaces
    {
        export interface DropdownOption
        {
            value: string;
            label: string;
            icon?: string;
            disabled?: boolean;
        }

        export interface DropdownOptions
        {
            placeholder?: string;
            searchable?: boolean;
            clearable?: boolean;
            disabled?: boolean;
            options?: DropdownOption[];
            value?: string;
        }
    }

    export const { Rule, Stylesheet } = Css;
    export const signal = Reactivity.CreateSignal;

    export const Styles =
        new Stylesheet([
            new Rule('arianna-dropdown', {
                display: 'inline-block',
                position: 'relative',
                width: '100%',
                maxWidth: '320px',
                boxSizing: 'border-box',
            }),

            new Rule('.ar-dropdown__trigger', {
                alignItems: 'center',
                background: 'var(--arianna-bg, #ffffff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: 'var(--arianna-radius, 6px)',
                boxSizing: 'border-box',
                color: 'var(--arianna-text, #1f2328)',
                cursor: 'pointer',
                display: 'flex',
                gap: '8px',
                minHeight: '34px',
                outline: 'none',
                padding: '6px 10px',
                transition: 'border-color .18s ease, box-shadow .18s ease',
                userSelect: 'none',
                width: '100%',
            }),

            new Rule('.ar-dropdown__trigger:hover, .ar-dropdown__trigger[aria-expanded="true"]', {
                borderColor: 'var(--arianna-primary, #1f6feb)',
            }),

            new Rule('.ar-dropdown__trigger:focus-visible', {
                boxShadow: '0 0 0 3px color-mix(in srgb, var(--arianna-primary, #1f6feb) 20%, transparent)',
            }),

            new Rule('arianna-dropdown[disabled] .ar-dropdown__trigger', {
                cursor: 'not-allowed',
                opacity: '.55',
            }),

            new Rule('.ar-dropdown__icon', {
                alignItems: 'center',
                display: 'flex',
                flex: '0 0 auto',
                justifyContent: 'center',
            }),

            new Rule('.ar-dropdown__value', {
                flex: '1 1 auto',
                fontSize: '.82rem',
                minWidth: '0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }),

            new Rule('.ar-dropdown__placeholder', {
                color: 'var(--arianna-muted, #6e6b62)',
            }),

            new Rule('.ar-dropdown__arrow', {
                borderBottom: '1.5px solid currentColor',
                borderRight: '1.5px solid currentColor',
                boxSizing: 'border-box',
                color: 'var(--arianna-muted, #6e6b62)',
                flex: '0 0 auto',
                height: '7px',
                transform: 'rotate(45deg)',
                transition: 'transform .14s ease',
                width: '7px',
            }),

            new Rule('.ar-dropdown__trigger[aria-expanded="true"] .ar-dropdown__arrow', {
                transform: 'rotate(225deg)',
            }),

            new Rule('.ar-dropdown__clear', {
                appearance: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--arianna-muted, #6e6b62)',
                cursor: 'pointer',
                fontSize: '.7rem',
                lineHeight: '1',
                padding: '2px',
            }),

            new Rule('.ar-dropdown__clear:hover', {
                color: 'var(--arianna-primary, #1f6feb)',
            }),

            new Rule('.ar-dropdown__list', {
                background: 'var(--arianna-bg, #ffffff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: 'var(--arianna-radius, 6px)',
                boxShadow: '0 8px 24px rgba(0,0,0,.18)',
                boxSizing: 'border-box',
                flexDirection: 'column',
                left: '0',
                maxHeight: '260px',
                minWidth: '100%',
                overflow: 'hidden',
                position: 'absolute',
                right: '0',
                top: 'calc(100% + 4px)',
                zIndex: '900',
            }),

            new Rule('.ar-dropdown__search', {
                background: 'var(--arianna-bg-3, #f3f3f3)',
                border: 'none',
                borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                boxSizing: 'border-box',
                color: 'var(--arianna-text, #1f2328)',
                flex: '0 0 auto',
                font: 'inherit',
                fontSize: '.8rem',
                outline: 'none',
                padding: '7px 10px',
                width: '100%',
            }),

            new Rule('.ar-dropdown__options', {
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '220px',
                overflowY: 'auto',
            }),

            new Rule('.ar-dropdown__option', {
                alignItems: 'center',
                color: 'var(--arianna-text, #1f2328)',
                cursor: 'pointer',
                display: 'flex',
                flex: '0 0 auto',
                fontSize: '.82rem',
                gap: '8px',
                minHeight: '32px',
                outline: 'none',
                padding: '6px 10px',
                transition: 'background .14s ease, color .14s ease',
            }),

            new Rule('.ar-dropdown__option:hover:not(.ar-dropdown__option--disabled), .ar-dropdown__option:focus-visible:not(.ar-dropdown__option--disabled)', {
                background: 'var(--arianna-bg-3, #f3f3f3)',
            }),

            new Rule('.ar-dropdown__option--active', {
                background: 'color-mix(in srgb, var(--arianna-primary, #1f6feb) 10%, transparent)',
                color: 'var(--arianna-primary, #1f6feb)',
            }),

            new Rule('.ar-dropdown__option--disabled', {
                cursor: 'not-allowed',
                opacity: '.4',
            }),

            new Rule('.ar-dropdown__empty', {
                color: 'var(--arianna-muted, #6e6b62)',
                fontSize: '.78rem',
                padding: '9px 10px',
            }),
        ]);

    @Component('arianna-dropdown', Styles, {
        Shadow: false,
        Attributes: [
            'placeholder',
            'searchable',
            'clearable',
            'disabled',
            'value',
        ],
    })
    export class Dropdown extends HTMLElement
    {
        public static readonly Styles = Styles;

        /*
         * Do not use #private fields here: AriannA can upgrade an existing
         * parser-created HTMLElement by prototype. Ordinary lazy properties
         * remain safe in every creation path.
         */
        private _optionsSignal?: Types.Signal<Interfaces.DropdownOption[]>;
        private _openSignal?: Types.Signal<boolean>;
        private _filterSignal?: Types.Signal<string>;

        private _trigger?: HTMLDivElement;
        private _icon?: HTMLSpanElement;
        private _valueNode?: HTMLSpanElement;
        private _clear?: HTMLButtonElement;
        private _arrow?: HTMLSpanElement;
        private _list?: HTMLDivElement;
        private _search?: HTMLInputElement;
        private _optionsHost?: HTMLDivElement;

        private _built?: boolean;
        private _effects?: Array<() => void>;
        private _outsidePointer?: (event: PointerEvent) => void;

        constructor(options: Interfaces.DropdownOptions = {})
        {
            super();

            if(options.placeholder != null)
                this.placeholder = options.placeholder;

            if(options.searchable != null)
                this.searchable = options.searchable;

            if(options.clearable != null)
                this.clearable = options.clearable;

            if(options.disabled != null)
                this.disabled = options.disabled;

            if(options.options)
                this.options = options.options;

            if(options.value != null)
                this.value = options.value;
        }

        public get options$(): Types.Signal<Interfaces.DropdownOption[]>
        {
            this._optionsSignal ??=
                signal<Interfaces.DropdownOption[]>([]);

            return this._optionsSignal;
        }

        public get open$(): Types.Signal<boolean>
        {
            this._openSignal ??=
                signal<boolean>(false);

            return this._openSignal;
        }

        public get filter$(): Types.Signal<string>
        {
            this._filterSignal ??=
                signal<string>('');

            return this._filterSignal;
        }

        public get options(): Interfaces.DropdownOption[]
        {
            return this.options$.Get();
        }

        public set options(value: Interfaces.DropdownOption[])
        {
            this.options$.Set(
                Array.isArray(value)
                    ? value
                    : []
            );

            if(this.isConnected)
                this.Render();
        }

        public get value(): string
        {
            return this.getAttribute('value') ?? '';
        }

        public set value(value: string)
        {
            if(value)
                this.setAttribute('value', value);
            else
                this.removeAttribute('value');

            if(this.isConnected)
                this.RenderTrigger();
        }

        public get placeholder(): string
        {
            return this.getAttribute('placeholder') ?? '';
        }

        public set placeholder(value: string)
        {
            this.setAttribute(
                'placeholder',
                value
            );

            if(this.isConnected)
                this.RenderTrigger();
        }

        public get searchable(): boolean
        {
            return this.hasAttribute('searchable');
        }

        public set searchable(value: boolean)
        {
            this.toggleAttribute(
                'searchable',
                Boolean(value)
            );

            if(this.isConnected)
                this.RenderList();
        }

        public get clearable(): boolean
        {
            return this.hasAttribute('clearable');
        }

        public set clearable(value: boolean)
        {
            this.toggleAttribute(
                'clearable',
                Boolean(value)
            );

            if(this.isConnected)
                this.RenderTrigger();
        }

        public get disabled(): boolean
        {
            return this.hasAttribute('disabled');
        }

        public set disabled(value: boolean)
        {
            this.toggleAttribute(
                'disabled',
                Boolean(value)
            );

            if(this.isConnected)
                this.RenderTrigger();
        }

        public get open(): boolean
        {
            return this.open$.Get();
        }

        public set open(value: boolean)
        {
            this.SetOpen(Boolean(value));
        }

        public onConnected(): void
        {
            this.classList.add('Dropdown');

            this.Build();
            this.EnsureEffects();
            this.Render();
        }

        public onCreated(): void
        {
            requestAnimationFrame(
                () =>
                {
                    if(this.isConnected)
                        this.onConnected();
                }
            );
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected)
                return;

            if(
                name === 'value' ||
                name === 'placeholder' ||
                name === 'clearable' ||
                name === 'disabled'
            )
                this.RenderTrigger();

            if(name === 'searchable')
                this.RenderList();
        }

        public onDisconnected(): void
        {
            this.RemoveOutsidePointer();

            for(const dispose of this._effects ?? [])
                dispose();

            this._effects = undefined;
        }

        public onUnmount(): void
        {
            this.onDisconnected();
        }

        /* Compatibility lifecycle hooks. */
        public onBeforeMount(): void {}
        public onMount(): void {}
        public onBeforeUpdate(): void {}
        public onUpdate(): void {}
        public onBeforeUnmount(): void {}

        public toggle(): this
        {
            if(!this.disabled)
                this.SetOpen(!this.open);

            return this;
        }

        public show(): this
        {
            if(!this.disabled)
                this.SetOpen(true);

            return this;
        }

        public hide(): this
        {
            this.SetOpen(false);
            return this;
        }

        private Build(): void
        {
            if(
                this._built &&
                this._trigger?.isConnected &&
                this._list?.isConnected
            )
                return;

            const trigger =
                document.createElement('div');

            trigger.className =
                'ar-dropdown__trigger';

            trigger.tabIndex =
                0;

            trigger.setAttribute(
                'role',
                'combobox'
            );

            trigger.setAttribute(
                'aria-haspopup',
                'listbox'
            );

            const icon =
                document.createElement('span');

            icon.className =
                'ar-dropdown__icon';

            const value =
                document.createElement('span');

            value.className =
                'ar-dropdown__value';

            const clear =
                document.createElement('button');

            clear.type =
                'button';

            clear.className =
                'ar-dropdown__clear';

            clear.textContent =
                '✕';

            clear.setAttribute(
                'aria-label',
                'Clear'
            );

            const arrow =
                document.createElement('span');

            arrow.className =
                'ar-dropdown__arrow';

            arrow.setAttribute(
                'aria-hidden',
                'true'
            );

            trigger.append(
                icon,
                value,
                clear,
                arrow
            );

            const list =
                document.createElement('div');

            list.className =
                'ar-dropdown__list';

            list.setAttribute(
                'role',
                'listbox'
            );

            /*
             * Critical: the list ALWAYS exists.
             * Opening is a direct display change, never an a-if re-mount.
             */
            list.style.display =
                'none';

            const search =
                document.createElement('input');

            search.className =
                'ar-dropdown__search';

            search.type =
                'text';

            search.placeholder =
                'Search…';

            const options =
                document.createElement('div');

            options.className =
                'ar-dropdown__options';

            list.append(
                search,
                options
            );

            this.replaceChildren(
                trigger,
                list
            );

            this._trigger =
                trigger;

            this._icon =
                icon;

            this._valueNode =
                value;

            this._clear =
                clear;

            this._arrow =
                arrow;

            this._list =
                list;

            this._search =
                search;

            this._optionsHost =
                options;

            trigger.addEventListener(
                'click',
                event =>
                {
                    event.stopPropagation();
                    this.toggle();
                }
            );

            trigger.addEventListener(
                'keydown',
                event =>
                    this.OnTriggerKeyDown(event)
            );

            clear.addEventListener(
                'click',
                event =>
                {
                    event.preventDefault();
                    event.stopPropagation();

                    if(this.disabled)
                        return;

                    this.value =
                        '';

                    this.dispatchEvent(
                        new CustomEvent(
                            'arianna:change',
                            {
                                bubbles: true,
                                composed: true,
                                detail:
                                {
                                    value: '',
                                    option: null
                                }
                            }
                        )
                    );

                    this.Render();
                }
            );

            search.addEventListener(
                'click',
                event =>
                    event.stopPropagation()
            );

            search.addEventListener(
                'input',
                event =>
                {
                    event.stopPropagation();

                    this.filter$.Set(
                        (event.target as HTMLInputElement).value
                    );

                    this.RenderOptions();
                }
            );

            this._built =
                true;
        }

        private EnsureEffects(): void
        {
            if(this._effects)
                return;

            const optionEffect =
                Reactivity.CreateEffect(
                    () =>
                    {
                        this.options$.Get();

                        if(this.isConnected)
                            this.Render();
                    }
                );

            const openEffect =
                Reactivity.CreateEffect(
                    () =>
                    {
                        this.open$.Get();

                        if(this.isConnected)
                            this.ApplyOpen();
                    }
                );

            const filterEffect =
                Reactivity.CreateEffect(
                    () =>
                    {
                        this.filter$.Get();

                        if(this.isConnected)
                            this.RenderOptions();
                    }
                );

            this._effects =
            [
                () => optionEffect.Stop(),
                () => openEffect.Stop(),
                () => filterEffect.Stop(),
            ];
        }

        private Render(): void
        {
            this.Build();
            this.RenderTrigger();
            this.RenderList();
            this.ApplyOpen();
        }

        private RenderTrigger(): void
        {
            if(
                !this._trigger ||
                !this._valueNode ||
                !this._icon ||
                !this._clear
            )
                return;

            const selected =
                this.Selected();

            this._trigger.setAttribute(
                'aria-expanded',
                String(this.open)
            );

            this._trigger.setAttribute(
                'aria-disabled',
                String(this.disabled)
            );

            this._trigger.tabIndex =
                this.disabled
                    ? -1
                    : 0;

            this._valueNode.textContent =
                selected?.label ??
                this.placeholder ??
                'Select…';

            this._valueNode.className =
                'ar-dropdown__value' +
                (
                    selected
                        ? ''
                        : ' ar-dropdown__placeholder'
                );

            if(selected?.icon)
            {
                this._icon.textContent =
                    selected.icon;

                this._icon.style.display =
                    'flex';
            }
            else
            {
                this._icon.textContent =
                    '';

                this._icon.style.display =
                    'none';
            }

            this._clear.style.display =
                this.clearable &&
                Boolean(selected) &&
                !this.disabled
                    ? 'inline-block'
                    : 'none';
        }

        private RenderList(): void
        {
            if(
                !this._list ||
                !this._search
            )
                return;

            this._search.style.display =
                this.searchable
                    ? 'block'
                    : 'none';

            if(
                !this.searchable &&
                this.filter$.Get()
            )
            {
                this.filter$.Set('');
                this._search.value = '';
            }

            this.RenderOptions();
        }

        private RenderOptions(): void
        {
            if(!this._optionsHost)
                return;

            const query =
                this.filter$.Get()
                    .trim()
                    .toLowerCase();

            const options =
                query
                    ? this.options.filter(
                        option =>
                            option.label
                                .toLowerCase()
                                .includes(query)
                    )
                    : this.options;

            const children:
                HTMLElement[] =
                [];

            for(const option of options)
            {
                const row =
                    document.createElement('div');

                row.className =
                    'ar-dropdown__option' +
                    (
                        option.value === this.value
                            ? ' ar-dropdown__option--active'
                            : ''
                    ) +
                    (
                        option.disabled
                            ? ' ar-dropdown__option--disabled'
                            : ''
                    );

                row.setAttribute(
                    'role',
                    'option'
                );

                row.setAttribute(
                    'aria-selected',
                    String(
                        option.value ===
                        this.value
                    )
                );

                row.setAttribute(
                    'aria-disabled',
                    String(
                        Boolean(
                            option.disabled
                        )
                    )
                );

                row.tabIndex =
                    option.disabled
                        ? -1
                        : 0;

                if(option.icon)
                {
                    const icon =
                        document.createElement('span');

                    icon.textContent =
                        option.icon;

                    row.append(icon);
                }

                const label =
                    document.createElement('span');

                label.textContent =
                    option.label;

                row.append(label);

                row.addEventListener(
                    'click',
                    event =>
                    {
                        event.stopPropagation();
                        this.Select(option);
                    }
                );

                row.addEventListener(
                    'keydown',
                    event =>
                    {
                        if(
                            event.key === 'Enter' ||
                            event.key === ' '
                        )
                        {
                            event.preventDefault();
                            this.Select(option);
                        }
                        else if(event.key === 'Escape')
                        {
                            event.preventDefault();
                            this.hide();
                            this._trigger?.focus();
                        }
                    }
                );

                children.push(row);
            }

            if(children.length === 0)
            {
                const empty =
                    document.createElement('div');

                empty.className =
                    'ar-dropdown__empty';

                empty.textContent =
                    'No options';

                children.push(empty);
            }

            this._optionsHost.replaceChildren(
                ...children
            );
        }

        private ApplyOpen(): void
        {
            if(
                !this._list ||
                !this._trigger
            )
                return;

            const open =
                this.open &&
                !this.disabled;

            this._list.style.display =
                open
                    ? 'flex'
                    : 'none';

            this._trigger.setAttribute(
                'aria-expanded',
                String(open)
            );

            this.toggleAttribute(
                'open',
                open
            );

            if(open)
            {
                this.InstallOutsidePointer();

                if(this.searchable)
                {
                    requestAnimationFrame(
                        () =>
                            this._search?.focus()
                    );
                }
            }
            else
            {
                this.RemoveOutsidePointer();
            }
        }

        private SetOpen(value: boolean): void
        {
            const next =
                Boolean(value) &&
                !this.disabled;

            if(this.open$.Get() !== next)
                this.open$.Set(next);

            /*
             * Direct application makes the API deterministic even if a caller
             * changes open state outside an Effect owner.
             */
            this.ApplyOpen();
        }

        private Select(
            option: Interfaces.DropdownOption
        ): void
        {
            if(
                this.disabled ||
                option.disabled
            )
                return;

            this.value =
                option.value;

            this.filter$.Set('');

            if(this._search)
                this._search.value = '';

            this.SetOpen(false);
            this.Render();

            this.dispatchEvent(
                new CustomEvent(
                    'arianna:change',
                    {
                        bubbles: true,
                        composed: true,
                        detail:
                        {
                            value: option.value,
                            option
                        }
                    }
                )
            );
        }

        private Selected(): Interfaces.DropdownOption | undefined
        {
            const value =
                this.value;

            return this.options.find(
                option =>
                    option.value === value
            );
        }

        private InstallOutsidePointer(): void
        {
            if(this._outsidePointer)
                return;

            this._outsidePointer =
                (event: PointerEvent): void =>
                {
                    const target =
                        event.target;

                    if(
                        target instanceof Node &&
                        !this.contains(target)
                    )
                        this.SetOpen(false);
                };

            document.addEventListener(
                'pointerdown',
                this._outsidePointer,
                true
            );
        }

        private RemoveOutsidePointer(): void
        {
            if(!this._outsidePointer)
                return;

            document.removeEventListener(
                'pointerdown',
                this._outsidePointer,
                true
            );

            this._outsidePointer =
                undefined;
        }

        private OnTriggerKeyDown(
            event: KeyboardEvent
        ): void
        {
            if(this.disabled)
                return;

            if(
                event.key === 'Enter' ||
                event.key === ' '
            )
            {
                event.preventDefault();
                this.toggle();
                return;
            }

            if(
                event.key === 'ArrowDown'
            )
            {
                event.preventDefault();
                this.show();
                return;
            }

            if(event.key === 'Escape')
            {
                event.preventDefault();
                this.hide();
            }
        }

        public static DefaultSheet(): Types.Stylesheet
        {
            return Styles;
        }
    }
}

export type DropdownOption = Dropdown.Interfaces.DropdownOption;
export type DropdownOptions = Dropdown.Interfaces.DropdownOptions;
export default Dropdown.Dropdown;
