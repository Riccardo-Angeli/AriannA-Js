import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/inputs/DatePicker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * DatePicker — date input that opens an `<arianna-calendar>` popup on focus.
 *
 * @example HTML
 *   <arianna-date-picker label="Born" value="2019-01-04"></arianna-date-picker>
 *
 * Events: arianna:change  detail: { value }
 * Attributes:  label, value, placeholder, min, max, locale, first-day, disabled
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface DatePickerOptions {
    label?: string;
    value?: string;
    placeholder?: string;
    min?: string;
    max?: string;
    locale?: string;
    firstDay?: 0 | 1;
    disabled?: boolean;
}
@Component('arianna-date-picker', {}, {
    Attributes: ['label', 'value', 'placeholder', 'min', 'max', 'locale', 'first-day', 'disabled'],
})
export class DatePicker extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    open$: Signal<boolean> = signal<boolean>(false);
    #outsideClick: ((e: Event) => void) | null = null;
    onConnected(_opts: DatePickerOptions = {}) {
        const label = this.signal().attribute('label');
        const value = this.signal().attribute('value');
        const placeholder = this.signal().attribute('placeholder');
        this.hasLabel = () => !!label.Get();
        this.labelText = () => label.Get() ?? '';
        this.inpValue = () => value.Get() ?? '';
        this.inpPlaceholder = () => placeholder.Get() ?? 'YYYY-MM-DD';
        this.isOpen = () => this.open$.Get();
        this.isDisabled = () => this.hasAttribute('disabled');
        this.calMin = () => this.getAttribute('min') ?? '';
        this.calMax = () => this.getAttribute('max') ?? '';
        this.calLocale = () => this.getAttribute('locale') ?? '';
        this.calFirstDay = () => this.getAttribute('first-day') ?? '1';
        this.onInputClick = (e: Event) => {
            if (this.isDisabled())
                return;
            e.stopPropagation();
            const wasOpen = this.open$.Get();
            this.open$.Set(!wasOpen);
            if (!wasOpen) {
                this.#outsideClick = (ev: Event) => {
                    if (!this.contains(ev.target as Node))
                        this.open$.Set(false);
                };
                setTimeout(() => document.addEventListener('click', this.#outsideClick!), 0);
            }
        };
        this.onInputChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            this.setAttribute('value', inp.value);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: inp.value },
            }));
        };
        this.onCalendarSelect = (e: Event) => {
            const ev = e as CustomEvent<{
                value: string;
            }>;
            this.setAttribute('value', ev.detail.value);
            this.open$.Set(false);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: ev.detail.value },
            }));
        };
        this.template = html `
            <div class="ar-datepicker__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div class="ar-datepicker__wrap">
                <span class="ar-datepicker__icon">📅</span>
                <input class="ar-datepicker__input"
                       type="text"
                       :value="this.inpValue()"
                       :placeholder="this.inpPlaceholder()"
                       :disabled="this.isDisabled()"
                       @click="this.onInputClick"
                       @change="this.onInputChange"/>
            </div>
            <div class="ar-datepicker__popup" a-if="this.isOpen()">
                <arianna-calendar :value="this.inpValue()"
                                  :min="this.calMin()"
                                  :max="this.calMax()"
                                  :locale="this.calLocale()"
                                  :first-day="this.calFirstDay()"
                                  @arianna:select="this.onCalendarSelect"></arianna-calendar>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = DatePicker.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() {
        if (this.#outsideClick) {
            document.removeEventListener('click', this.#outsideClick);
            this.#outsideClick = null;
        }
    }
    get value(): string { return this.getAttribute('value') ?? ''; }
    set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }
    get label(): string { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }
    private hasLabel: () => boolean = () => false;
    private labelText: () => string = () => '';
    private inpValue: () => string = () => '';
    private inpPlaceholder: () => string = () => '';
    private isOpen: () => boolean = () => false;
    private isDisabled: () => boolean = () => false;
    private calMin: () => string = () => '';
    private calMax: () => string = () => '';
    private calLocale: () => string = () => '';
    private calFirstDay: () => string = () => '1';
    private onInputClick: (e: Event) => void = () => { };
    private onInputChange: (e: Event) => void = () => { };
    private onCalendarSelect: (e: Event) => void = () => { };
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                display: 'inline-block',
                position: 'relative',
                width: '100%',
                maxWidth: '240px',
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
                padding: '5px 10px',
                transition: 'border-color 0.18s ease',
            }),
            new Rule('.ar-datepicker__wrap:focus-within', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
            new Rule('.ar-datepicker__icon', { flexShrink: '0' }),
            new Rule('.ar-datepicker__input', {
                background: 'none',
                border: 'none',
                color: 'var(--arianna-text, #1f2328)',
                cursor: 'pointer',
                flex: '1',
                font: 'inherit',
                fontSize: '0.82rem',
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
/* ──────────────────────────────────────────────────────────────────────────
 * DatePicker namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace DatePicker {
    export namespace Interfaces {
        export interface Options extends DatePickerOptions {
        }
    }
}
export default DatePicker;
