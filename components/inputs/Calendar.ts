/**
 * @module    components/inputs/Calendar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Calendar component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   Calendar
 *  @public
 *  @description Namespace containing Calendar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Calendar
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
        /** @interface   CalendarOptions
         *  @public
         *  @description CalendarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CalendarOptions
        {
            /** @name        value
             *  @public
             *  @type        {string | Date}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: string | Date;

            /** @name        min
             *  @public
             *  @type        {string | Date}
             *  @description Component member for min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            min?: string | Date;

            /** @name        max
             *  @public
             *  @type        {string | Date}
             *  @description Component member for max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            max?: string | Date;

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
            firstDay?: 0 | 1; // 0 = Sunday, 1 = Monday
            /** @name        showWeekNumbers
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Week Numbers.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showWeekNumbers?: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   DayCell
         *  @public
         *  @description DayCell contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DayCell
        {
            /** @name        day
             *  @public
             *  @type        {number}
             *  @description Component member for day.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            day: number;

            /** @name        iso
             *  @public
             *  @type        {string}
             *  @description Component member for iso.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            iso: string;

            /** @name        inMonth
             *  @public
             *  @type        {boolean}
             *  @description Component member for in Month.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            inMonth: boolean;

            /** @name        isToday
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Today.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isToday: boolean;

            /** @name        isSelected
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Selected.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isSelected: boolean;

            /** @name        isOutOfRange
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Out Of Range.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isOutOfRange: boolean;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }

        /** @interface   WeekRow
         *  @public
         *  @description WeekRow contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WeekRow
        {
            /** @name        weekNum
             *  @public
             *  @type        {number}
             *  @description Component member for week Num.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            weekNum: number;

            /** @name        days
             *  @public
             *  @type        {Calendar.Interfaces.DayCell[]}
             *  @description Component member for days.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            days: Interfaces.DayCell[];
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
    export function toISO(d: Date): string {
        /** @name        y
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned y value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const y = d.getFullYear();

        /** @name        m
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned m value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const m = String(d.getMonth() + 1).padStart(2, '0');

        /** @name        dd
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned dd value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }
    export function parseDate(v: string | Date | null | undefined): Date | null {
        if (!v)
            return null;
        if (v instanceof Date)
            return v;

        /** @name        parts
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned parts value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const parts = v.split('-').map(p => parseInt(p, 10));
        if (parts.length === 3 && parts.every(n => !isNaN(n)))
        {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }

        /** @name        d
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned d value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }
    export function isoOf(d: Date | null): string { return d ? toISO(d) : ''; }
    export function sameDay(a: Date, b: Date): boolean {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }
    export function getISOWeek(d: Date): number {
        /** @name        target
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned target value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const target = new Date(d.valueOf());

        /** @name        day
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned day value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const day = (d.getDay() + 6) % 7;
        target.setDate(target.getDate() - day + 3);

        /** @name        jan4
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned jan4 value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const jan4 = new Date(target.getFullYear(), 0, 4);

        /** @name        days
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned days value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const days = Math.round((target.valueOf() - jan4.valueOf()) / 86400000);
        return 1 + Math.floor(days / 7);
    }

    /** @name        ToISO
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ToISO value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ToISO
    (
        ...args: Parameters<typeof toISO>
    ): ReturnType<typeof toISO>
    {
        return toISO(...args);
    }
    /** @name        ParseDate
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ParseDate value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ParseDate
    (
        ...args: Parameters<typeof parseDate>
    ): ReturnType<typeof parseDate>
    {
        return parseDate(...args);
    }
    /** @name        IsoOf
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned IsoOf value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function IsoOf
    (
        ...args: Parameters<typeof isoOf>
    ): ReturnType<typeof isoOf>
    {
        return isoOf(...args);
    }
    /** @name        SameDay
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned SameDay value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function SameDay
    (
        ...args: Parameters<typeof sameDay>
    ): ReturnType<typeof sameDay>
    {
        return sameDay(...args);
    }
    /** @name        GetISOWeek
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned GetISOWeek value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function GetISOWeek
    (
        ...args: Parameters<typeof getISOWeek>
    ): ReturnType<typeof getISOWeek>
    {
        return getISOWeek(...args);
    }
    /** @class       Calendar
     *  @public
     *  @description AriannA Calendar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-calendar', {}, {
        shadow: false,
        Attributes: ['value', 'min', 'max', 'locale', 'first-day', 'show-week-numbers', 'disabled'],
    })
    export class Calendar extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** Currently displayed month/year (not necessarily the selected date). */
        cursor$: Types.Signal<{
            /** @name        year
             *  @public
             *  @type        {number}
             *  @description Component member for year.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            year: number;

            /** @name        month
             *  @public
             *  @type        {number}
             *  @description Component member for month.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            month: number;
        }> = signal({
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
        });

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Calendar.Interfaces.CalendarOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.CalendarOptions = {})
        {
            this.cursor$ ??= signal({
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
            });
            const self = this as Calendar & { __renderCalendar?: () => void; onAttributeChanged?: () => void };
            this.classList.add('Calendar');
            this.localeStr = () => this.getAttribute('locale') ?? navigator.language ?? 'en-US';
            this.firstDayN = () => (parseInt(this.getAttribute('first-day') ?? '1', 10) === 0 ? 0 : 1) as 0 | 1;
            this.showWeek = () => this.hasAttribute('show-week-numbers');
            this.isDisabled = () => this.hasAttribute('disabled');

            if(!this.dataset.ariannaCalendarReady)
            {
                const selected = parseDate(this.getAttribute('value'));
                const now = selected ?? new Date();
                this.cursor$.Set({ year: now.getFullYear(), month: now.getMonth() });
                this.dataset.ariannaCalendarReady = 'true';
            }

            const render = () =>
            {
                const cursor = this.cursor$.Get();
                const locale = this.localeStr();
                const firstDay = this.firstDayN();
                const selected = parseDate(this.getAttribute('value'));
                const min = parseDate(this.getAttribute('min'));
                const max = parseDate(this.getAttribute('max'));
                const today = new Date();

                const header = document.createElement('div');
                header.className = 'ar-cal__header';
                const prev = document.createElement('button');
                prev.type = 'button'; prev.className = 'ar-cal__nav'; prev.textContent = '‹'; prev.ariaLabel = 'Previous month';
                const title = document.createElement('button');
                title.type = 'button'; title.className = 'ar-cal__title';
                title.textContent = new Date(cursor.year, cursor.month, 1).toLocaleDateString(locale,{month:'long',year:'numeric'});
                const next = document.createElement('button');
                next.type = 'button'; next.className = 'ar-cal__nav'; next.textContent = '›'; next.ariaLabel = 'Next month';
                header.appendChild(prev); header.appendChild(title); header.appendChild(next);

                const weekdays = document.createElement('div');
                weekdays.className = 'ar-cal__weekdays';
                if(this.showWeek())
                {
                    const wc=document.createElement('div'); wc.className='ar-cal__weekcol'; weekdays.appendChild(wc);
                }
                const fmt = new Intl.DateTimeFormat(locale,{weekday:'short'});
                const sunday = new Date(2024,0,7);
                for(let i=0;i<7;i++)
                {
                    const jsDay=(i+firstDay)%7;
                    const d=new Date(sunday); d.setDate(sunday.getDate()+jsDay);
                    const wd=document.createElement('div');
                    wd.className='ar-cal__wkday'+(jsDay===0||jsDay===6?' ar-cal__wkday--weekend':'');
                    wd.textContent=fmt.format(d); weekdays.appendChild(wd);
                }

                const grid=document.createElement('div'); grid.className='ar-cal__grid';
                const firstOfMonth=new Date(cursor.year,cursor.month,1);
                const offset=(firstOfMonth.getDay()-firstDay+7)%7;
                const gridStart=new Date(cursor.year,cursor.month,1-offset);
                for(let week=0;week<6;week++)
                {
                    const row=document.createElement('div'); row.className='ar-cal__row';
                    if(this.showWeek())
                    {
                        const wn=document.createElement('div'); wn.className='ar-cal__weeknum';
                        const wd=new Date(gridStart); wd.setDate(gridStart.getDate()+week*7);
                        wn.textContent=String(getISOWeek(wd)); row.appendChild(wn);
                    }
                    for(let col=0;col<7;col++)
                    {
                        const d=new Date(gridStart); d.setDate(gridStart.getDate()+week*7+col);
                        const iso=toISO(d); const inMonth=d.getMonth()===cursor.month;
                        const weekend=d.getDay()===0||d.getDay()===6;
                        const outOfRange=!!((min&&d<min)||(max&&d>max));
                        const button=document.createElement('button'); button.type='button';
                        button.className='ar-cal__day'+(inMonth?'':' ar-cal__day--out')+(weekend?' ar-cal__day--weekend':'')+(sameDay(d,today)?' ar-cal__day--today':'')+(selected&&sameDay(d,selected)?' ar-cal__day--selected':'')+(outOfRange?' ar-cal__day--disabled':'');
                        button.textContent=String(d.getDate()); button.disabled=outOfRange||this.isDisabled();
                        button.dataset.date=iso; button.setAttribute('aria-label',d.toLocaleDateString(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric'}));
                        button.addEventListener('click',()=>{
                            this.setAttribute('value',iso);
                            if(!inMonth) this.cursor$.Set({year:d.getFullYear(),month:d.getMonth()});
                            this.dispatchEvent(new CustomEvent('arianna:select',{bubbles:true,composed:true,detail:{value:iso,date:new Date(d)}}));
                            render();
                        });
                        row.appendChild(button);
                    }
                    grid.appendChild(row);
                }
                prev.addEventListener('click',()=>{ const c=this.cursor$.Get(); const d=new Date(c.year,c.month-1,1); this.cursor$.Set({year:d.getFullYear(),month:d.getMonth()}); this.dispatchEvent(new CustomEvent('arianna:nav',{bubbles:true,detail:{year:d.getFullYear(),month:d.getMonth()}})); render(); });
                next.addEventListener('click',()=>{ const c=this.cursor$.Get(); const d=new Date(c.year,c.month+1,1); this.cursor$.Set({year:d.getFullYear(),month:d.getMonth()}); this.dispatchEvent(new CustomEvent('arianna:nav',{bubbles:true,detail:{year:d.getFullYear(),month:d.getMonth()}})); render(); });
                title.addEventListener('click',()=>{ const d=new Date(); this.cursor$.Set({year:d.getFullYear(),month:d.getMonth()}); render(); });
                this.replaceChildren(header,weekdays,grid);
            };
            self.__renderCalendar=render;
            self.onAttributeChanged=()=>render();
            render();
            (this as unknown as { Sheet: Types.Stylesheet | null }).Sheet = Calendar.DefaultSheet();
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
        onUnmount() { }

        /** Typed Date getter/setter — mirrors the `value` attr. */
        set valueDate(d: Date | null)
        {
            if (d)
                this.setAttribute('value', toISO(d));
            else
                this.removeAttribute('value');
        }

        /** @name        valueDate
         *  @public
         *  @type        {Date | null}
         *  @description Component member for value Date.
         *  @returns     {Date | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get valueDate(): Date | null { return parseDate(this.getAttribute('value')); }

        /** @name        minDate
         *  @public
         *  @type        {void}
         *  @description Component member for min Date.
         *  @param       {Date | null} d Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set minDate(d: Date | null)
        {
            if (d)
                this.setAttribute('min', toISO(d));
            else
                this.removeAttribute('min');
        }

        /** @name        minDate
         *  @public
         *  @type        {Date | null}
         *  @description Component member for min Date.
         *  @returns     {Date | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get minDate(): Date | null { return parseDate(this.getAttribute('min')); }

        /** @name        maxDate
         *  @public
         *  @type        {void}
         *  @description Component member for max Date.
         *  @param       {Date | null} d Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set maxDate(d: Date | null)
        {
            if (d)
                this.setAttribute('max', toISO(d));
            else
                this.removeAttribute('max');
        }

        /** @name        maxDate
         *  @public
         *  @type        {Date | null}
         *  @description Component member for max Date.
         *  @returns     {Date | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get maxDate(): Date | null { return parseDate(this.getAttribute('max')); }

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

        /** @name        locale
         *  @public
         *  @type        {string}
         *  @description Component member for locale.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get locale(): string { return this.getAttribute('locale') ?? ''; }

        /** @name        locale
         *  @public
         *  @type        {void}
         *  @description Component member for locale.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set locale(v: string) { this.setAttribute('locale', v); }

        /** @name        firstDay
         *  @public
         *  @type        {0 | 1}
         *  @description Component member for first Day.
         *  @returns     {0 | 1} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get firstDay(): 0 | 1 { return this.firstDayN(); }

        /** @name        firstDay
         *  @public
         *  @type        {void}
         *  @description Component member for first Day.
         *  @param       {0 | 1} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set firstDay(v: 0 | 1) { this.setAttribute('first-day', String(v)); }

        /** @name        localeStr
         *  @private
         *  @type        {() => string}
         *  @description Component member for locale Str.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private localeStr: () => string = () => 'en-US';

        /** @name        firstDayN
         *  @private
         *  @type        {() => 0 | 1}
         *  @description Component member for first Day N.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private firstDayN: () => 0 | 1 = () => 1;

        /** @name        showWeek
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Week.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showWeek: () => boolean = () => false;

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        monthLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for month Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private monthLabel: () => string = () => '';

        /** @name        weekdayLabels
         *  @private
         *  @type        {() => string[]}
         *  @description Component member for weekday Labels.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private weekdayLabels: () => string[] = () => [];

        /** @name        weeks
         *  @private
         *  @type        {() => Calendar.Interfaces.WeekRow[]}
         *  @description Component member for weeks.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private weeks: () => Interfaces.WeekRow[] = () => [];

        /** @name        onPrev
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Prev.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPrev: () => void = () => { };

        /** @name        onNext
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Next.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onNext: () => void = () => { };

        /** @name        onToday
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Today.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onToday: () => void = () => { };

        /** @name        onDayClick
         *  @private
         *  @type        {(d: Calendar.Interfaces.DayCell) => void}
         *  @description Component member for on Day Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDayClick: (d: Interfaces.DayCell) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Calendar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Calendar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('arianna-calendar', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'inline-block',
                    fontSize: '0.82rem',
                    padding: '10px',
                    minWidth: '272px',
                }),
                new Rule('.ar-cal__header', {
                    alignItems: 'center',
                    display: 'flex',
                    gap: '4px',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                }),
                new Rule('.ar-cal__nav', {
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.9rem',
                    padding: '4px 10px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-cal__nav:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-cal__title', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    flex: '1',
                    font: 'inherit',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textAlign: 'center',
                }),
                new Rule('.ar-cal__weekdays, .ar-cal__row', {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                    marginBottom: '2px',
                }),
                new Rule('arianna-calendar[show-week-numbers] .ar-cal__weekdays, arianna-calendar[show-week-numbers] .ar-cal__row', {
                    gridTemplateColumns: '28px repeat(7, 1fr)',
                }),
                new Rule('.ar-cal__wkday', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '4px 0',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-cal__weeknum, .ar-cal__weekcol', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    padding: '4px 0',
                }),
                new Rule('.ar-cal__day', {
                    aspectRatio: '1 / 1',
                    minHeight: '30px',
                    minWidth: '30px',
                    position: 'relative',
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.8rem',
                    padding: '0',
                    transition: 'background 0.14s ease, border-color 0.14s ease',
                }),
                new Rule('.ar-cal__day:hover:not(:disabled)', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-cal__day--out', { color: 'var(--arianna-muted, #b8b8b8)' }),
                new Rule('.ar-cal__day--today', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-cal__day--weekend', { color: 'var(--arianna-primary, #e40c88)', fontWeight: '650' }),
                new Rule('.ar-cal__wkday--weekend', { color: 'var(--arianna-primary, #e40c88)', fontWeight: '650' }),
                new Rule('.ar-cal__day--selected', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    color: '#ffffff',
                    fontWeight: '600',
                }),
                new Rule('.ar-cal__day--selected.ar-cal__day--today', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'transparent',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5)',
                    color: '#ffffff',
                }),
                new Rule('.ar-cal__day--disabled, .ar-cal__day:disabled', {
                    opacity: '0.4', cursor: 'not-allowed',
                }),
            ]);
        }
    }
}
export default Calendar;

export type CalendarOptions = Calendar.Interfaces.CalendarOptions;
