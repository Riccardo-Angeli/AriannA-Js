/**
 * @module    components/inputs/TimePicker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA TimePicker component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   TimePicker
 *  @public
 *  @description Namespace containing TimePicker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace TimePicker
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
        /** @interface   TimePickerOptions
         *  @public
         *  @description TimePickerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TimePickerOptions
        {
            theme?: 'dark' | 'light';
            hourCycle?: 12 | 24;
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

            /** @name        seconds
             *  @public
             *  @type        {boolean}
             *  @description Component member for seconds.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            seconds?: boolean;

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

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       TimePicker
     *  @public
     *  @description AriannA TimePicker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-time-picker', {}, {
        shadow: false,
        Attributes: ['label', 'value', 'seconds', 'min', 'max', 'disabled', 'theme', 'hour-cycle'],
    })
    export class TimePicker extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {TimePicker.Interfaces.TimePickerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.TimePickerOptions = {})
        {
            type Draft = {
                hour: number;
                minute: number;
                second: number;
                period: 'AM' | 'PM';
            };

            type Runtime = TimePicker & {
                __timeOpen?: boolean;
                __timeDraft?: Draft;
                __timeRender?: () => void;
                __timeOutside?: (event: Event) => void;
                onAttributeChanged?: () => void;
            };

            const self = this as Runtime;
            this.classList.add('TimePicker');

            if (self.__timeOpen === undefined)
                self.__timeOpen = false;

            const clamp = (value: number, min: number, max: number): number =>
                Math.min(max, Math.max(min, value));

            const pad = (value: number): string =>
                String(value).padStart(2, '0');

            const parse = (value: string): Draft =>
            {
                const [rawHour = '0', rawMinute = '0', rawSecond = '0'] =
                    value.trim().split(':');

                const hour = clamp(Number(rawHour) || 0, 0, 23);

                return {
                    hour,
                    minute: clamp(Number(rawMinute) || 0, 0, 59),
                    second: clamp(Number(rawSecond) || 0, 0, 59),
                    period: hour >= 12 ? 'PM' : 'AM',
                };
            };

            const copy = (draft: Draft): Draft => ({ ...draft });

            const toSeconds = (draft: Draft): number =>
                draft.hour * 3600 + draft.minute * 60 + draft.second;

            const fromSeconds = (total: number): Draft =>
            {
                total = clamp(total, 0, 86399);

                const hour = Math.floor(total / 3600);

                return {
                    hour,
                    minute: Math.floor((total % 3600) / 60),
                    second: total % 60,
                    period: hour >= 12 ? 'PM' : 'AM',
                };
            };

            const bound = (draft: Draft): Draft =>
            {
                let total = toSeconds(draft);

                const min = this.getAttribute('min');
                const max = this.getAttribute('max');

                if (min)
                    total = Math.max(total, toSeconds(parse(min)));

                if (max)
                    total = Math.min(total, toSeconds(parse(max)));

                return fromSeconds(total);
            };

            const valueOf = (draft: Draft, withSeconds: boolean): string =>
                `${pad(draft.hour)}:${pad(draft.minute)}${withSeconds ? `:${pad(draft.second)}` : ''}`;

            const displayOf = (draft: Draft, withSeconds: boolean): string =>
            {
                if (this.getAttribute('hour-cycle') === '24')
                    return `${pad(draft.hour)}:${pad(draft.minute)}${withSeconds ? ':' + pad(draft.second) : ''}`;

                const hour12 = draft.hour % 12 || 12;
                return `${pad(hour12)}:${pad(draft.minute)}${withSeconds ? ':' + pad(draft.second) : ''} ${draft.hour >= 12 ? 'PM' : 'AM'}`;
            };

            const render = () =>
            {
                const withSeconds = this.hasAttribute('seconds');
                const hour24 = this.getAttribute('hour-cycle') === '24';
                const disabled = this.hasAttribute('disabled');
                const current = parse(this.getAttribute('value') ?? '12:00');
                const labelText = this.getAttribute('label') ?? '';

                const label = document.createElement('div');
                label.className = 'ar-timepicker__label';
                label.textContent = labelText;
                label.hidden = !labelText;

                const wrap = document.createElement('div');
                wrap.className = 'ar-timepicker__wrap';

                const input = document.createElement('button');
                input.type = 'button';
                input.className = 'ar-timepicker__input ar-timepicker__button';
                input.disabled = disabled;
                input.textContent = displayOf(current, withSeconds);
                input.setAttribute('aria-haspopup', 'dialog');
                input.setAttribute('aria-expanded', self.__timeOpen ? 'true' : 'false');

                const icon = document.createElement('button');
                icon.type = 'button';
                icon.className = 'ar-timepicker__icon';
                icon.textContent = '◷';
                icon.disabled = disabled;
                icon.ariaLabel = 'Open time picker';
                icon.setAttribute('aria-expanded', self.__timeOpen ? 'true' : 'false');

                wrap.append(input, icon);

                const nodes: Node[] = [label, wrap];

                if (self.__timeOpen && !disabled)
                {
                    const draft = self.__timeDraft ?? copy(current);
                    self.__timeDraft = draft;

                    const popup = document.createElement('div');
                    popup.className = 'ar-timepicker__popup';
                    popup.addEventListener('pointerdown', event => event.stopPropagation());

                    const header = document.createElement('div');
                    header.className = 'ar-timepicker__header';

                    const headline = document.createElement('strong');
                    headline.className = 'ar-timepicker__headline';

                    const now = document.createElement('button');
                    now.type = 'button';
                    now.className = 'ar-timepicker__now';
                    now.textContent = 'NOW';

                    header.append(headline, now);

                    const columnHeads = document.createElement('div');
                    columnHeads.className = 'ar-timepicker__column-heads';

                    const headings = ['Hour', 'Minute', ...(withSeconds ? ['Second'] : []), ...(!hour24 ? ['AM/PM'] : []), 'Mode'];
                    columnHeads.style.gridTemplateColumns = `repeat(${headings.length}, minmax(0, 1fr))`;
                    for (const heading of headings)
                    {
                        const item = document.createElement('span');
                        item.textContent = heading;
                        columnHeads.appendChild(item);
                    }

                    const wheels = document.createElement('div');
                    wheels.className = 'ar-timepicker__wheels';
                    wheels.style.gridTemplateColumns = columnHeads.style.gridTemplateColumns;

                    const repaintFunctions: Array<() => void> = [];
                    let programmaticScroll = false;

                    const repaintAll = () =>
                    {
                        headline.textContent = displayOf(draft, withSeconds);
                        programmaticScroll = true;

                        for (const repaint of repaintFunctions)
                            repaint();

                        requestAnimationFrame(() => { programmaticScroll = false; });
                    };

                    const range = (start: number, end: number): number[] =>
                        Array.from({ length: end - start + 1 }, (_, index) => start + index);

                    const createWheel =
                    (
                        entries: Array<{ label: string; value: string }>,
                        selected: () => string,
                        choose: (value: string) => void
                    ) =>
                    {
                        const root = document.createElement('div');
                        root.className = 'ar-timepicker__wheel';

                        const list = document.createElement('div');
                        list.className = 'ar-timepicker__wheel-list';
                        list.tabIndex = 0;

                        for (const entry of entries)
                        {
                            const item = document.createElement('button');
                            item.type = 'button';
                            item.className = 'ar-timepicker__wheel-item';
                            item.dataset.value = entry.value;
                            item.textContent = entry.label;

                            item.addEventListener('click', () =>
                            {
                                choose(entry.value);
                                repaintAll();
                            });

                            list.appendChild(item);
                        }

                        let frame = 0;

                        list.addEventListener('scroll', () =>
                        {
                            if (programmaticScroll)
                                return;

                            cancelAnimationFrame(frame);

                            frame = requestAnimationFrame(() =>
                            {
                                const index = clamp(Math.round(list.scrollTop / 36), 0, entries.length - 1);
                                const entry = entries[index];

                                if (entry && entry.value !== selected())
                                {
                                    choose(entry.value);
                                    repaintAll();
                                }
                            });
                        }, { passive: true });

                        list.addEventListener('keydown', (event: KeyboardEvent) =>
                        {
                            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
                                return;

                            event.preventDefault();

                            const currentIndex = Math.max(0, entries.findIndex(entry => entry.value === selected()));
                            const delta = event.key === 'ArrowDown' ? 1 : -1;
                            const nextIndex = clamp(currentIndex + delta, 0, entries.length - 1);

                            choose(entries[nextIndex].value);
                            repaintAll();
                        });

                        const repaint = () =>
                        {
                            const selectedValue = selected();

                            for (const child of Array.from(list.children))
                            {
                                const item = child as HTMLButtonElement;
                                const active = item.dataset.value === selectedValue;

                                item.classList.toggle('is-selected', active);
                                item.ariaSelected = active ? 'true' : 'false';
                            }

                            const index = Math.max(0, entries.findIndex(entry => entry.value === selectedValue));
                            list.scrollTop = index * 36;
                        };

                        root.appendChild(list);
                        return { root, repaint };
                    };

                    const hours = createWheel(
                        range(hour24 ? 0 : 1, hour24 ? 23 : 12).map(value => ({label:pad(value),value:String(value)})),
                        () => String(hour24 ? draft.hour : draft.hour % 12 || 12),
                        value => { draft.hour = hour24 ? Number(value) : Number(value) % 12 + (draft.period === 'PM' ? 12 : 0); draft.period = draft.hour >= 12 ? 'PM' : 'AM'; }
                    );
                    const minutes = createWheel(range(0,59).map(value=>({label:pad(value),value:String(value)})),()=>String(draft.minute),value=>{draft.minute=Number(value);});
                    wheels.append(hours.root,minutes.root); repaintFunctions.push(hours.repaint,minutes.repaint);
                    if(withSeconds){
                        const seconds=createWheel(range(0,59).map(value=>({label:pad(value),value:String(value)})),()=>String(draft.second),value=>{draft.second=Number(value);});
                        wheels.appendChild(seconds.root);repaintFunctions.push(seconds.repaint);
                    }
                    if(!hour24){
                        const period=createWheel([{label:'AM',value:'AM'},{label:'PM',value:'PM'}],()=>draft.period,value=>{draft.period=value as 'AM'|'PM';draft.hour=draft.hour%12+(value==='PM'?12:0);});
                        wheels.appendChild(period.root);repaintFunctions.push(period.repaint);
                    }
                    const mode=createWheel([{label:'12h',value:'12'},{label:'24h',value:'24'}],()=>hour24?'24':'12',value=>{
                        if(this.getAttribute('hour-cycle')===value)return;
                        this.setAttribute('hour-cycle',value);
                        render();
                    });
                    wheels.appendChild(mode.root);repaintFunctions.push(mode.repaint);

                    const footer = document.createElement('div');
                    footer.className = 'ar-timepicker__footer';

                    const cancel = document.createElement('button');
                    cancel.type = 'button';
                    cancel.className = 'ar-timepicker__footer-action';
                    cancel.textContent = 'Cancel';

                    const set = document.createElement('button');
                    set.type = 'button';
                    set.className = 'ar-timepicker__footer-action ar-timepicker__footer-action--set';
                    set.textContent = 'Set';

                    footer.append(cancel, set);

                    now.addEventListener('click', () =>
                    {
                        const date = new Date();

                        draft.hour = date.getHours();
                        draft.minute = date.getMinutes();
                        draft.second = date.getSeconds();
                        draft.period = draft.hour >= 12 ? 'PM' : 'AM';

                        repaintAll();
                    });

                    cancel.addEventListener('click', () =>
                    {
                        self.__timeOpen = false;
                        self.__timeDraft = undefined;
                        render();
                    });

                    set.addEventListener('click', () =>
                    {
                        const committed = bound(draft);
                        const value = valueOf(committed, withSeconds);

                        self.__timeOpen = false;
                        self.__timeDraft = undefined;

                        this.setAttribute('value', value);

                        this.dispatchEvent(new CustomEvent(
                            'arianna:change',
                            { bubbles: true, composed: true, detail: { value } }
                        ));

                        render();
                    });

                    popup.append(header, columnHeads, wheels, footer);
                    nodes.push(popup);

                    requestAnimationFrame(repaintAll);
                }

                const toggle = (event: Event) =>
                {
                    event.stopPropagation();

                    if (disabled)
                        return;

                    self.__timeOpen = !self.__timeOpen;
                    self.__timeDraft = self.__timeOpen ? copy(current) : undefined;
                    render();
                };

                input.addEventListener('click', toggle);
                icon.addEventListener('click', toggle);

                this.replaceChildren(...nodes);
            };

            self.__timeRender = render;
            self.onAttributeChanged = () => render();

            if (!self.__timeOutside)
            {
                self.__timeOutside = (event: Event) =>
                {
                    const target = event.target;

                    if (
                        self.__timeOpen &&
                        target instanceof Node &&
                        !this.contains(target)
                    )
                    {
                        self.__timeOpen = false;
                        self.__timeDraft = undefined;
                        render();
                    }
                };

                document.addEventListener('pointerdown', self.__timeOutside);
            }

            render();

            (this as unknown as { Sheet: Types.Stylesheet | null }).Sheet =
                TimePicker.DefaultSheet();
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
            const self = this as TimePicker & {
                __timeOutside?: (event: Event) => void;
                __timeRender?: () => void;
                __timeOpen?: boolean;
                __timeDraft?: unknown;
            };

            if (self.__timeOutside)
            {
                document.removeEventListener('pointerdown', self.__timeOutside);
                self.__timeOutside = undefined;
            }

            self.__timeRender = undefined;
            self.__timeOpen = false;
            self.__timeDraft = undefined;
        }

        /** @name        value
         *  @public
         *  @type        {string}
         *  @description Component member for value.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get hourCycle(): 12 | 24 { return this.getAttribute('hour-cycle') === '24' ? 24 : 12; }
        set hourCycle(value: 12 | 24) { this.setAttribute('hour-cycle',String(value)); }
        get theme(): string { return this.getAttribute('theme') ?? 'light'; }
        set theme(value: string) { this.setAttribute('theme',value); }

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

        /** @name        inpMin
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Min.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpMin: () => string = () => '';

        /** @name        inpMax
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Max.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpMax: () => string = () => '';

        /** @name        inpStep
         *  @private
         *  @type        {() => string}
         *  @description Component member for inp Step.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inpStep: () => string = () => '60';

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        onChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onChange: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {TimePicker.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {TimePicker.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('arianna-time-picker', {
                    display: 'inline-block',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '360px',
                }),
                new Rule('arianna-time-picker[theme="dark"],.TimePicker[theme="dark"]', {
                    '--arianna-bg':'#25292d','--arianna-text':'#e8eaed','--arianna-muted':'#aeb6bf','--arianna-border':'#454b52','--arianna-primary':'#e40c88',color:'#e8eaed',
                }),
                new Rule('arianna-time-picker[theme="light"],.TimePicker[theme="light"]', {
                    '--arianna-bg':'#f7f8fa','--arianna-text':'#24292f','--arianna-muted':'#58616d','--arianna-border':'#bac2cb','--arianna-primary':'#d80c80',color:'#24292f',
                }),
                new Rule('.ar-timepicker__label', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    marginBottom: '4px',
                }),
                new Rule('.ar-timepicker__wrap', {
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
                new Rule('.ar-timepicker__wrap:focus-within', {
                    borderColor: 'var(--arianna-primary, #e40c88)',
                }),
                new Rule('.ar-timepicker__input', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    flex: '1',
                    font: 'inherit',
                    fontSize: '0.86rem',
                    minWidth: '0',
                    outline: 'none',
                    padding: '0',
                    textAlign: 'left',
                }),
                new Rule('.ar-timepicker__icon', {
                    background: 'transparent',
                    border: '0',
                    color: 'inherit',
                    cursor: 'pointer',
                    flexShrink: '0',
                    font: 'inherit',
                    fontSize: '1rem',
                    lineHeight: '1',
                    padding: '2px 4px',
                }),
                new Rule('.ar-timepicker__icon:hover:not(:disabled)', {
                    color: 'var(--arianna-primary, #e40c88)',
                }),
                new Rule('.ar-timepicker__popup', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,.18)',
                    color: 'var(--arianna-text, #1f2328)',
                    left: '0',
                    minWidth: '320px',
                    overflow: 'hidden',
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    width: '100%',
                    zIndex: '900',
                }),
                new Rule('.ar-timepicker__header', {
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    minHeight: '48px',
                    padding: '0 16px',
                }),
                new Rule('.ar-timepicker__headline', {
                    fontSize: '0.96rem',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: '600',
                }),
                new Rule('.ar-timepicker__now', {
                    background: 'transparent',
                    border: '0',
                    color: 'var(--arianna-primary, #e40c88)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    padding: '6px 0 6px 12px',
                }),
                new Rule('.ar-timepicker__column-heads', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    display: 'grid',
                    fontSize: '0.70rem',
                    fontWeight: '600',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    padding: '0 12px 5px',
                    textAlign: 'center',
                }),
                new Rule('.ar-timepicker__wheels', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    height: '224px',
                    position: 'relative',
                }),
                new Rule('.ar-timepicker__wheels::before', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    content: '""',
                    height: '36px',
                    left: '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: '2',
                }),
                new Rule('.ar-timepicker__wheel', {
                    minWidth: '0',
                    overflow: 'hidden',
                    position: 'relative',
                }),
                new Rule('.ar-timepicker__wheel-list', {
                    height: '100%',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                    padding: '94px 0',
                    scrollbarWidth: 'none',
                    scrollSnapType: 'y mandatory',
                }),
                new Rule('.ar-timepicker__wheel-list::-webkit-scrollbar', {
                    display: 'none',
                }),
                new Rule('.ar-timepicker__wheel-item', {
                    alignItems: 'center',
                    background: 'transparent',
                    border: '0',
                    color: 'var(--arianna-muted, #6e6b62)',
                    cursor: 'pointer',
                    display: 'flex',
                    font: 'inherit',
                    fontSize: '0.88rem',
                    fontVariantNumeric: 'tabular-nums',
                    height: '36px',
                    justifyContent: 'center',
                    padding: '0 6px',
                    scrollSnapAlign: 'center',
                    width: '100%',
                }),
                new Rule('.ar-timepicker__wheel-item:hover', {
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-timepicker__wheel-item.is-selected', {
                    color: 'var(--arianna-text, #1f2328)',
                    fontWeight: '600',
                }),
                new Rule('.ar-timepicker__footer', {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    minHeight: '48px',
                }),
                new Rule('.ar-timepicker__footer-action', {
                    background: 'transparent',
                    border: '0',
                    borderRight: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.84rem',
                }),
                new Rule('.ar-timepicker__footer-action:last-child', {
                    borderRight: '0',
                }),
                new Rule('.ar-timepicker__footer-action--set', {
                    color: 'var(--arianna-primary, #e40c88)',
                    fontWeight: '600',
                }),
            ]);
        }
    }
}
export default TimePicker;

export type TimePickerOptions = TimePicker.Interfaces.TimePickerOptions;
