/**
 * @module    components/inputs/Calendar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Calendar — month-grid date picker with header navigation and selection.
 *
 * @example HTML
 *   <arianna-calendar value="2026-05-17" show-week-numbers></arianna-calendar>
 *
 * @example JS
 *   const cal = new Calendar();
 *   cal.value     = new Date(2026, 4, 17);
 *   cal.minDate   = new Date(2026, 0, 1);
 *   cal.maxDate   = new Date(2026, 11, 31);
 *   cal.locale    = 'en-GB';
 *   cal.firstDay  = 1;   // Monday
 *   cal.addEventListener('arianna:select', e => console.log(e.detail.value));
 *
 * Events:
 *   - arianna:select   detail: { value: string (YYYY-MM-DD), date: Date }
 *   - arianna:nav      detail: { year, month }
 *
 * Slots:  (none)
 * Attrs:  value, min, max, locale, first-day, show-week-numbers, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface CalendarOptions {
    value?            : string | Date;
    min?              : string | Date;
    max?              : string | Date;
    locale?           : string;
    firstDay?         : 0 | 1;    // 0 = Sunday, 1 = Monday
    showWeekNumbers?  : boolean;
    disabled?         : boolean;
}

interface DayCell {
    day        : number;
    iso        : string;
    inMonth    : boolean;
    isToday    : boolean;
    isSelected : boolean;
    isOutOfRange: boolean;
    cls        : string;
}

interface WeekRow {
    weekNum : number;
    days    : DayCell[];
}

function toISO(d: Date): string
{
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

function parseDate(v: string | Date | null | undefined): Date | null
{
    if (!v) return null;
    if (v instanceof Date) return v;
    const parts = v.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3 && parts.every(n => !isNaN(n))) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}

function isoOf(d: Date | null): string { return d ? toISO(d) : ''; }

function sameDay(a: Date, b: Date): boolean
{
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function getISOWeek(d: Date): number
{
    const target = new Date(d.valueOf());
    const day = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - day + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const days = Math.round((target.valueOf() - jan4.valueOf()) / 86_400_000);
    return 1 + Math.floor(days / 7);
}

export class Calendar extends Component('arianna-calendar', HTMLElement, {}, {
    attrs : ['value', 'min', 'max', 'locale', 'first-day', 'show-week-numbers', 'disabled'],
    shadow: false,
})
{
    /** Currently displayed month/year (not necessarily the selected date). */
    cursor$: Signal<{ year: number; month: number }> = signal({
        year : new Date().getFullYear(),
        month: new Date().getMonth(),
    });

    build(_opts: CalendarOptions = {})
    {
        const value = this.attrSignal('value');

        // Sync cursor to selected value on first build
        const selected = parseDate(value.get());
        if (selected) {
            this.cursor$.set({ year: selected.getFullYear(), month: selected.getMonth() });
        }

        this.localeStr = () => this.getAttribute('locale') ?? navigator.language ?? 'en-US';
        this.firstDayN = () => (parseInt(this.getAttribute('first-day') ?? '1', 10) === 0 ? 0 : 1) as 0 | 1;
        this.showWeek  = () => this.hasAttribute('show-week-numbers');
        this.isDisabled = () => this.hasAttribute('disabled');

        this.monthLabel = (): string => {
            const c = this.cursor$.get();
            const d = new Date(c.year, c.month, 1);
            return d.toLocaleDateString(this.localeStr(), { month: 'long', year: 'numeric' });
        };

        this.weekdayLabels = (): string[] => {
            const fmt = new Intl.DateTimeFormat(this.localeStr(), { weekday: 'short' });
            const first = this.firstDayN();
            const out: string[] = [];
            const base = new Date(2024, 0, 7); // Sunday Jan 7 2024
            for (let i = 0; i < 7; i++) {
                const day = (i + first) % 7;
                const d = new Date(base);
                d.setDate(base.getDate() + day);
                out.push(fmt.format(d));
            }
            return out;
        };

        this.weeks = (): WeekRow[] => {
            const c = this.cursor$.get();
            const first = this.firstDayN();
            const min = parseDate(this.getAttribute('min'));
            const max = parseDate(this.getAttribute('max'));
            const sel = parseDate(value.get());
            const today = new Date();

            const firstOfMonth = new Date(c.year, c.month, 1);
            const startDay = firstOfMonth.getDay();
            const offset = (startDay - first + 7) % 7;
            const gridStart = new Date(firstOfMonth);
            gridStart.setDate(firstOfMonth.getDate() - offset);

            const rows: WeekRow[] = [];
            const cur = new Date(gridStart);
            for (let w = 0; w < 6; w++) {
                const days: DayCell[] = [];
                for (let d = 0; d < 7; d++) {
                    const day = cur.getDate();
                    const inMonth = cur.getMonth() === c.month;
                    const isToday = sameDay(cur, today);
                    const isSelected = !!sel && sameDay(cur, sel);
                    const isOutOfRange = (min && cur < min) || (max && cur > max) || false;
                    const cls = 'ar-cal__day'
                        + (inMonth     ? '' : ' ar-cal__day--out')
                        + (isToday     ? ' ar-cal__day--today' : '')
                        + (isSelected  ? ' ar-cal__day--selected' : '')
                        + (isOutOfRange ? ' ar-cal__day--disabled' : '');
                    days.push({
                        day, iso: toISO(cur), inMonth, isToday, isSelected,
                        isOutOfRange, cls,
                    });
                    cur.setDate(cur.getDate() + 1);
                }
                rows.push({ weekNum: getISOWeek(days[0] ? new Date(days[0].iso) : cur), days });
            }
            return rows;
        };

        this.onPrev = () => {
            const c = this.cursor$.get();
            const month = c.month === 0 ? 11 : c.month - 1;
            const year  = c.month === 0 ? c.year - 1 : c.year;
            this.cursor$.set({ year, month });
            this.dispatchEvent(new CustomEvent('arianna:nav', {
                bubbles: true, detail: { year, month },
            }));
        };
        this.onNext = () => {
            const c = this.cursor$.get();
            const month = c.month === 11 ? 0 : c.month + 1;
            const year  = c.month === 11 ? c.year + 1 : c.year;
            this.cursor$.set({ year, month });
            this.dispatchEvent(new CustomEvent('arianna:nav', {
                bubbles: true, detail: { year, month },
            }));
        };
        this.onToday = () => {
            const t = new Date();
            this.cursor$.set({ year: t.getFullYear(), month: t.getMonth() });
        };
        this.onDayClick = (cell: DayCell) => {
            if (cell.isOutOfRange || this.isDisabled()) return;
            this.setAttribute('value', cell.iso);
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { value: cell.iso, date: parseDate(cell.iso) },
            }));
        };

        this.template = html`
            <div class="ar-cal__header">
                <button class="ar-cal__nav" @click="this.onPrev"  aria-label="Previous month">‹</button>
                <button class="ar-cal__title" @click="this.onToday">{{ this.monthLabel() }}</button>
                <button class="ar-cal__nav" @click="this.onNext"  aria-label="Next month">›</button>
            </div>
            <div class="ar-cal__weekdays">
                <div class="ar-cal__weekcol" a-if="this.showWeek()"></div>
                <div class="ar-cal__wkday" a-for="wd in this.weekdayLabels()">{{ wd }}</div>
            </div>
            <div class="ar-cal__row" a-for="row in this.weeks()">
                <div class="ar-cal__weeknum" a-if="this.showWeek()">{{ row.weekNum }}</div>
                <button :class="d.cls"
                        a-for="d in row.days"
                        :disabled="d.isOutOfRange || this.isDisabled()"
                        @click="(e) => this.onDayClick(d)">{{ d.day }}</button>
            </div>
        `;

        this.Sheet = Calendar.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    /** Typed Date getter/setter — mirrors the `value` attr. */
    set valueDate(d: Date | null) {
        if (d) this.setAttribute('value', toISO(d));
        else   this.removeAttribute('value');
    }
    get valueDate(): Date | null { return parseDate(this.getAttribute('value')); }

    set minDate(d: Date | null) {
        if (d) this.setAttribute('min', toISO(d));
        else   this.removeAttribute('min');
    }
    get minDate(): Date | null { return parseDate(this.getAttribute('min')); }

    set maxDate(d: Date | null) {
        if (d) this.setAttribute('max', toISO(d));
        else   this.removeAttribute('max');
    }
    get maxDate(): Date | null { return parseDate(this.getAttribute('max')); }

    get value(): string  { return this.getAttribute('value') ?? ''; }
    set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

    get locale(): string  { return this.getAttribute('locale') ?? ''; }
    set locale(v: string) { this.setAttribute('locale', v); }

    get firstDay(): 0 | 1  { return this.firstDayN(); }
    set firstDay(v: 0 | 1) { this.setAttribute('first-day', String(v)); }

    private localeStr    : () => string = () => 'en-US';
    private firstDayN    : () => 0 | 1 = () => 1;
    private showWeek     : () => boolean = () => false;
    private isDisabled   : () => boolean = () => false;
    private monthLabel   : () => string = () => '';
    private weekdayLabels: () => string[] = () => [];
    private weeks        : () => WeekRow[] = () => [];
    private onPrev       : () => void = () => {};
    private onNext       : () => void = () => {};
    private onToday      : () => void = () => {};
    private onDayClick   : (d: DayCell) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'inline-block',
                    fontSize    : '0.82rem',
                    padding     : '10px',
                    minWidth    : '260px',
                }),
                new Rule('.ar-cal__header', {
                    alignItems    : 'center',
                    display       : 'flex',
                    gap           : '4px',
                    justifyContent: 'space-between',
                    marginBottom  : '8px',
                }),
                new Rule('.ar-cal__nav', {
                    background  : 'none',
                    border      : '1px solid transparent',
                    borderRadius: '4px',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    font        : 'inherit',
                    fontSize    : '0.9rem',
                    padding     : '4px 10px',
                    transition  : 'background 0.14s ease',
                }),
                new Rule('.ar-cal__nav:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-cal__title', {
                    background : 'none',
                    border     : 'none',
                    color      : 'var(--arianna-text, #1f2328)',
                    cursor     : 'pointer',
                    flex       : '1',
                    font       : 'inherit',
                    fontSize   : '0.85rem',
                    fontWeight : '600',
                    textAlign  : 'center',
                }),
                new Rule('.ar-cal__weekdays, .ar-cal__row', {
                    display             : 'grid',
                    gridTemplateColumns : 'repeat(7, 1fr)',
                    gap                 : '2px',
                    marginBottom        : '2px',
                }),
                new Rule(':root[show-week-numbers] .ar-cal__weekdays, :root[show-week-numbers] .ar-cal__row', {
                    gridTemplateColumns : '28px repeat(7, 1fr)',
                }),
                new Rule('.ar-cal__wkday', {
                    color    : 'var(--arianna-muted, #6e6b62)',
                    fontSize : '0.7rem',
                    fontWeight: '600',
                    padding  : '4px 0',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-cal__weeknum, .ar-cal__weekcol', {
                    color    : 'var(--arianna-muted, #6e6b62)',
                    fontSize : '0.7rem',
                    textAlign: 'center',
                    padding  : '4px 0',
                }),
                new Rule('.ar-cal__day', {
                    aspectRatio : '1 / 1',
                    background  : 'none',
                    border      : '1px solid transparent',
                    borderRadius: '4px',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    font        : 'inherit',
                    fontSize    : '0.8rem',
                    padding     : '0',
                    transition  : 'background 0.14s ease, border-color 0.14s ease',
                }),
                new Rule('.ar-cal__day:hover:not(:disabled)', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-cal__day--out',      { color: 'var(--arianna-muted, #b8b8b8)' }),
                new Rule('.ar-cal__day--today',    { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-cal__day--selected', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    color     : '#ffffff',
                    fontWeight: '600',
                }),
                new Rule('.ar-cal__day--disabled, .ar-cal__day:disabled', {
                    opacity: '0.4', cursor: 'not-allowed',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Calendar', { value: Calendar, writable: false, enumerable: false, configurable: false });
}

export default Calendar;
