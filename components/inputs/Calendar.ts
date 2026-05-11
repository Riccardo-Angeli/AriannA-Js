// components/input/Calendar.ts
//
// Calendar — month / week / day views, navigation, event placement, today
// highlight, week-start configuration, and a stable Date-only model that
// never trips on DST.
//
// Public API:
//   • new Calendar(container, opts)
//   • setView('month'|'week'|'day'), goToToday(), goTo(date), prev(), next()
//   • addEvent(ev), removeEvent(id), updateEvent(id, patch), clearEvents()
//   • on('day-click'|'event-click'|'view-change'|'navigate', cb)
//
// Path note: this file lives under components/input/ (form-input flavour).
// The same class is also re-exportable as the Layout calendar — host apps
// pick the role by which section they mount it into.

import { Control } from '../core/Control';

// ── Local typed view of the Control base class ──────────────────────────────
// We don't know the exact shape of Control's TS declaration in every project
// (it's a JS-style class in the compiled bundle), but at runtime it always
// exposes `el`, `_get`, `_emit`. We declare that contract here so the rest
// of the file is fully type-safe without depending on Control's own typings.
type ControlBase = Control & {
    el        : HTMLElement;
    _get<T = unknown>(key: string, fallback?: T): T;
    _emit(type: string, detail?: unknown, ev?: Event): void;
    _build(): void;
};

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
    id     : string;
    title  : string;
    start  : Date;
    end?   : Date;
    color? : string;
    allDay?: boolean;
    /** Free-form payload — forwarded in events. */
    meta?  : unknown;
}

export interface CalendarOptions {
    /** Initial view; default 'month'. */
    view?       : CalendarView;
    /** Initial focused date; default today. */
    date?       : Date;
    /** 0 = Sunday, 1 = Monday (default), 6 = Saturday. */
    weekStart?  : 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /** Locale for weekday/month names; default browser locale. */
    locale?     : string;
    /** Initial event set. */
    events?     : CalendarEvent[];
    /** Hide the top toolbar with prev/next/today/view-picker. */
    hideToolbar?: boolean;
    /** Extra CSS class on the root. */
    class?      : string;
}

const MS_PER_DAY = 86_400_000;
const PALETTE    = ['#e40c88', '#3b82f6', '#16a34a', '#eab308', '#a855f7', '#06b6d4'];

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay  = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays     = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d: Date, weekStart: number) => {
    const x = startOfDay(d);
    const diff = (x.getDay() - weekStart + 7) % 7;
    return addDays(x, -diff);
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c: string) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export class Calendar extends Control {
    private _view     : CalendarView;
    private _focused  : Date;
    private _weekStart: number;
    private _locale   : string;
    private _events   : CalendarEvent[] = [];
    private _elGrid!  : HTMLElement;
    private _elTitle! : HTMLElement;

    constructor(container: HTMLElement | string, opts: CalendarOptions = {}) {
        super(container as HTMLElement, 'div', {
            view       : 'month',
            weekStart  : 1,
            locale     : (typeof navigator !== 'undefined' && navigator.language) || 'en-US',
            hideToolbar: false,
            ...opts,
        });
        const self = this as unknown as ControlBase;
        self.el.className = `ar-cal${opts.class ? ' ' + opts.class : ''}`;
        this._view      = self._get<CalendarView>('view', 'month');
        this._weekStart = self._get<number>('weekStart', 1);
        this._locale    = self._get<string>('locale', 'en-US');
        this._focused   = opts.date ? startOfDay(opts.date) : startOfDay(new Date());
        for (const e of opts.events ?? []) this._events.push({ ...e });
        this._injectStyles();
        this._build();
        this._render();
    }

    // ── Public API ─────────────────────────────────────────────────────────
    setView(v: CalendarView): this {
        this._view = v;
        this._render();
        (this as unknown as ControlBase)._emit('view-change', { view: v });
        return this;
    }
    getView(): CalendarView { return this._view; }
    goToToday(): this {
        this._focused = startOfDay(new Date());
        this._render();
        (this as unknown as ControlBase)._emit('navigate', { date: this._focused });
        return this;
    }
    goTo(d: Date): this {
        this._focused = startOfDay(d);
        this._render();
        (this as unknown as ControlBase)._emit('navigate', { date: this._focused });
        return this;
    }
    prev(): this { this._step(-1); return this; }
    next(): this { this._step(+1); return this; }
    addEvent(ev: CalendarEvent): this { this._events.push({ ...ev }); this._render(); return this; }
    removeEvent(id: string): this { this._events = this._events.filter(e => e.id !== id); this._render(); return this; }
    updateEvent(id: string, p: Partial<CalendarEvent>): this {
        const i = this._events.findIndex(e => e.id === id);
        if (i >= 0) { this._events[i] = { ...this._events[i], ...p }; this._render(); }
        return this;
    }
    clearEvents(): this { this._events = []; this._render(); return this; }
    getEvents(): CalendarEvent[] { return this._events.map(e => ({ ...e })); }

    // ── Build + render ─────────────────────────────────────────────────────
    private _step(dir: -1 | 1): void {
        const f = this._focused;
        if (this._view === 'month') f.setMonth(f.getMonth() + dir);
        else if (this._view === 'week') f.setDate(f.getDate() + 7 * dir);
        else f.setDate(f.getDate() + dir);
        this._focused = new Date(f);
        this._render();
        (this as unknown as ControlBase)._emit('navigate', { date: this._focused });
    }

    _build(): void {
        const self = this as unknown as ControlBase;
        const hideToolbar = self._get<boolean>('hideToolbar', false);
        self.el.innerHTML = `
${hideToolbar ? '' : `
<header class="ar-cal__toolbar">
  <div class="ar-cal__nav">
    <button class="ar-cal__btn"  data-act="prev"  title="Previous">‹</button>
    <button class="ar-cal__btn"  data-act="today" title="Today">Today</button>
    <button class="ar-cal__btn"  data-act="next"  title="Next">›</button>
  </div>
  <div class="ar-cal__title" data-r="title"></div>
  <div class="ar-cal__views">
    <button class="ar-cal__btn" data-view="month">Month</button>
    <button class="ar-cal__btn" data-view="week">Week</button>
    <button class="ar-cal__btn" data-view="day">Day</button>
  </div>
</header>`}
<div class="ar-cal__grid" data-r="grid"></div>`;
        this._elGrid  = self.el.querySelector('[data-r="grid"]')  as HTMLElement;
        this._elTitle = self.el.querySelector('[data-r="title"]') as HTMLElement;

        if (!hideToolbar) {
            self.el.querySelector('[data-act="prev"]') ?.addEventListener('click', () => this.prev());
            self.el.querySelector('[data-act="next"]') ?.addEventListener('click', () => this.next());
            self.el.querySelector('[data-act="today"]')?.addEventListener('click', () => this.goToToday());
            self.el.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b: HTMLButtonElement) => {
                b.addEventListener('click', () => this.setView(b.dataset.view as CalendarView));
            });
        }
        if (this._events.length || this._focused) this._render();
    }

    private _render(): void {
        if (!this._elGrid) return;
        const self = this as unknown as ControlBase;
        if (this._elTitle) {
            const f = this._focused;
            if (this._view === 'month') {
                this._elTitle.textContent = f.toLocaleString(this._locale, { month: 'long', year: 'numeric' });
            } else if (this._view === 'week') {
                const s = startOfWeek(f, this._weekStart);
                const e = addDays(s, 6);
                this._elTitle.textContent = `${s.toLocaleDateString(this._locale, { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString(this._locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
            } else {
                this._elTitle.textContent = f.toLocaleDateString(this._locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            }
        }
        self.el.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b: HTMLButtonElement) => {
            b.classList.toggle('ar-cal__btn--active', b.dataset.view === this._view);
        });
        this._elGrid.innerHTML = '';
        if      (this._view === 'month') this._renderMonth();
        else if (this._view === 'week')  this._renderWeek();
        else                              this._renderDay();
    }

    private _weekdayHeader(): HTMLElement {
        const h = document.createElement('div');
        h.className = 'ar-cal__weekdays';
        const ws = this._weekStart;
        const fmt = new Intl.DateTimeFormat(this._locale, { weekday: 'short' });
        for (let i = 0; i < 7; i++) {
            const d = new Date(2024, 0, 7 + ((ws + i) % 7));
            const cell = document.createElement('div');
            cell.className = 'ar-cal__weekday';
            cell.textContent = fmt.format(d);
            h.appendChild(cell);
        }
        return h;
    }

    private _renderMonth(): void {
        const f = this._focused;
        const firstOfMonth = new Date(f.getFullYear(), f.getMonth(), 1);
        const gridStart    = startOfWeek(firstOfMonth, this._weekStart);
        const today        = startOfDay(new Date());
        this._elGrid.appendChild(this._weekdayHeader());
        const grid = document.createElement('div');
        grid.className = 'ar-cal__month';
        for (let i = 0; i < 42; i++) {
            const day = addDays(gridStart, i);
            const cell = document.createElement('div');
            const outside = day.getMonth() !== f.getMonth();
            cell.className = 'ar-cal__cell'
                + (outside ? ' ar-cal__cell--outside' : '')
                + (isSameDay(day, today) ? ' ar-cal__cell--today' : '');
            cell.innerHTML = `<div class="ar-cal__num">${day.getDate()}</div><div class="ar-cal__events" data-r="cell-events"></div>`;
            cell.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).closest('.ar-cal__event')) return;
                (this as unknown as ControlBase)._emit('day-click', { date: new Date(day) });
            });
            const dayEvs = this._eventsForDay(day);
            const evWrap = cell.querySelector('[data-r="cell-events"]') as HTMLElement;
            for (let j = 0; j < dayEvs.length && j < 3; j++) {
                evWrap.appendChild(this._renderEvent(dayEvs[j]));
            }
            if (dayEvs.length > 3) {
                const more = document.createElement('div');
                more.className = 'ar-cal__more';
                more.textContent = `+${dayEvs.length - 3} more`;
                evWrap.appendChild(more);
            }
            grid.appendChild(cell);
        }
        this._elGrid.appendChild(grid);
    }

    private _renderWeek(): void {
        const ws = startOfWeek(this._focused, this._weekStart);
        const today = startOfDay(new Date());
        this._elGrid.appendChild(this._weekdayHeader());
        const grid = document.createElement('div');
        grid.className = 'ar-cal__week';
        for (let i = 0; i < 7; i++) {
            const day = addDays(ws, i);
            const cell = document.createElement('div');
            cell.className = 'ar-cal__cell ar-cal__cell--week'
                + (isSameDay(day, today) ? ' ar-cal__cell--today' : '');
            cell.innerHTML = `<div class="ar-cal__num">${day.toLocaleDateString(this._locale, { day: 'numeric' })}</div><div class="ar-cal__events" data-r="cell-events"></div>`;
            cell.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).closest('.ar-cal__event')) return;
                (this as unknown as ControlBase)._emit('day-click', { date: new Date(day) });
            });
            const evWrap = cell.querySelector('[data-r="cell-events"]') as HTMLElement;
            for (const ev of this._eventsForDay(day)) evWrap.appendChild(this._renderEvent(ev));
            grid.appendChild(cell);
        }
        this._elGrid.appendChild(grid);
    }

    private _renderDay(): void {
        const day = startOfDay(this._focused);
        const today = startOfDay(new Date());
        const wrap = document.createElement('div');
        wrap.className = 'ar-cal__day' + (isSameDay(day, today) ? ' ar-cal__day--today' : '');
        const head = document.createElement('div');
        head.className = 'ar-cal__day-head';
        head.textContent = day.toLocaleDateString(this._locale, { weekday: 'long', day: 'numeric', month: 'long' });
        wrap.appendChild(head);
        const evs = this._eventsForDay(day);
        const list = document.createElement('div');
        list.className = 'ar-cal__day-events';
        if (evs.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'ar-cal__empty';
            empty.textContent = 'No events';
            list.appendChild(empty);
        } else {
            for (const ev of evs) list.appendChild(this._renderEvent(ev, true));
        }
        wrap.appendChild(list);
        this._elGrid.appendChild(wrap);
    }

    private _renderEvent(ev: CalendarEvent, detailed: boolean = false): HTMLElement {
        const el = document.createElement('div');
        el.className = 'ar-cal__event';
        const color = ev.color || PALETTE[(ev.id.charCodeAt(0) + ev.id.length) % PALETTE.length];
        el.style.background = color + (detailed ? 'cc' : '33');
        el.style.borderLeft = `3px solid ${color}`;
        if (detailed) {
            const t = ev.allDay ? 'All day'
                : `${ev.start.toLocaleTimeString(this._locale, { hour: '2-digit', minute: '2-digit' })}${ev.end ? ' – ' + ev.end.toLocaleTimeString(this._locale, { hour: '2-digit', minute: '2-digit' }) : ''}`;
            el.innerHTML = `<div class="ar-cal__event-time">${escapeHtml(t)}</div><div class="ar-cal__event-title">${escapeHtml(ev.title)}</div>`;
        } else {
            el.textContent = ev.title;
        }
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            (this as unknown as ControlBase)._emit('event-click', { event: { ...ev } });
        });
        return el;
    }

    private _eventsForDay(day: Date): CalendarEvent[] {
        const dayMs = day.getTime();
        const nextMs = dayMs + MS_PER_DAY;
        return this._events.filter(ev => {
            const s = startOfDay(ev.start).getTime();
            const e = ev.end ? ev.end.getTime() : ev.start.getTime() + MS_PER_DAY - 1;
            return s < nextMs && e >= dayMs;
        }).sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());
    }

    private _injectStyles(): void {
        if (document.getElementById('ar-cal-styles')) return;
        const s = document.createElement('style');
        s.id = 'ar-cal-styles';
        s.textContent = `
.ar-cal { display:flex; flex-direction:column; background:#1e1e1e; border:1px solid #333; border-radius:8px; color:#d4d4d4; font:13px -apple-system,system-ui,sans-serif; overflow:hidden; }
.ar-cal__toolbar { display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid #333; background:#161616; }
.ar-cal__nav { display:flex; gap:4px; }
.ar-cal__title { flex:1; text-align:center; font:600 14px sans-serif; color:#fff; }
.ar-cal__views { display:flex; gap:2px; }
.ar-cal__btn { background:transparent; border:1px solid #333; color:#d4d4d4; padding:4px 10px; font:12px sans-serif; border-radius:4px; cursor:pointer; transition:background .12s, border-color .12s; }
.ar-cal__btn:hover { background:#2a2a2a; border-color:#444; }
.ar-cal__btn--active { background:#e40c88; border-color:#e40c88; color:#fff; }
.ar-cal__grid { flex:1; min-height:0; overflow:auto; }
.ar-cal__weekdays { display:grid; grid-template-columns:repeat(7, 1fr); background:#161616; border-bottom:1px solid #333; }
.ar-cal__weekday { padding:8px; font:10px sans-serif; text-transform:uppercase; letter-spacing:.08em; color:#888; text-align:center; }
.ar-cal__month { display:grid; grid-template-columns:repeat(7, 1fr); grid-auto-rows:minmax(80px, 1fr); }
.ar-cal__week { display:grid; grid-template-columns:repeat(7, 1fr); min-height:300px; }
.ar-cal__cell { border-right:1px solid #2a2a2a; border-bottom:1px solid #2a2a2a; padding:4px; min-height:80px; cursor:pointer; transition:background .12s; overflow:hidden; display:flex; flex-direction:column; }
.ar-cal__cell:hover { background:#252525; }
.ar-cal__cell--outside { background:#161616; color:#555; }
.ar-cal__cell--today .ar-cal__num { background:#e40c88; color:#fff; }
.ar-cal__cell--week { min-height:200px; }
.ar-cal__num { display:inline-block; min-width:22px; height:22px; line-height:22px; text-align:center; font:600 12px sans-serif; border-radius:50%; padding:0 4px; }
.ar-cal__events { display:flex; flex-direction:column; gap:2px; margin-top:4px; flex:1; min-height:0; }
.ar-cal__event { font:11px sans-serif; padding:2px 6px; border-radius:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; }
.ar-cal__event:hover { filter:brightness(1.15); }
.ar-cal__more { font:10px sans-serif; color:#888; padding:1px 6px; }
.ar-cal__day { padding:16px; }
.ar-cal__day-head { font:600 16px sans-serif; color:#fff; margin-bottom:14px; }
.ar-cal__day-events { display:flex; flex-direction:column; gap:6px; }
.ar-cal__day .ar-cal__event { padding:8px 12px; font:13px sans-serif; }
.ar-cal__event-time { font:11px ui-monospace,monospace; color:rgba(255,255,255,.85); }
.ar-cal__event-title { color:#fff; font-weight:500; margin-top:2px; }
.ar-cal__empty { color:#666; font-style:italic; padding:20px; text-align:center; }
@media (max-width: 600px) {
  .ar-cal__toolbar { padding:8px 10px; gap:4px; flex-wrap:wrap; }
  .ar-cal__title { order:-1; flex:1 1 100%; padding-bottom:4px; }
  .ar-cal__btn { padding:3px 8px; font-size:11px; }
  .ar-cal__weekday { padding:4px 2px; font-size:9px; }
  .ar-cal__month { grid-auto-rows:minmax(56px, 1fr); }
  .ar-cal__cell { min-height:56px; padding:2px; }
  .ar-cal__num { min-width:18px; height:18px; line-height:18px; font-size:10px; }
  .ar-cal__event { font-size:9px; padding:1px 3px; }
  .ar-cal__events { gap:1px; }
}
`;
        document.head.appendChild(s);
    }
}
