import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/inputs/Radio
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Radio group — set of mutually-exclusive options.
 *
 * @example JS
 *   const r = new Radio();
 *   r.options = [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }];
 *   r.value = 'dark';
 *   r.addEventListener('arianna:change', e => applyTheme(e.detail.value));
 *
 * @example HTML
 *   <arianna-radio direction="row" label="Theme"></arianna-radio>
 *
 * Events: arianna:change  detail: { value }
 * Attributes:  label, direction ('row' | 'column'), value
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
export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface RadioOptions {
    label?: string;
    direction?: 'row' | 'column';
    options?: RadioOption[];
    value?: string;
}
@Component('arianna-radio', {}, {
    Attributes: ['label', 'direction', 'value'],
})
export class Radio extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    options$: Signal<RadioOption[]> = signal<RadioOption[]>([]);
    #groupName = 'ar-radio-' + Math.random().toString(36).slice(2, 7);
    onConnected(_opts: RadioOptions = {}) {
        const label = this.signal().attribute('label');
        const value = this.signal().attribute('value');
        this.hasLabel = () => !!label.Get();
        this.labelText = () => label.Get() ?? '';
        this.allOpts = () => this.options$.Get();
        this.itemsCls = () => 'ar-radio-group__items ar-radio-group__items--' +
            (this.getAttribute('direction') ?? 'column');
        this.optCls = (o: RadioOption) => 'ar-radio' + (o.disabled ? ' ar-radio--disabled' : '');
        this.isChecked = (o: RadioOption) => o.value === (value.Get() ?? '');
        this.groupName = () => this.#groupName;
        this.onChange = (opt: RadioOption, e: Event) => {
            const inp = e.target as HTMLInputElement;
            if (inp.checked) {
                this.setAttribute('value', opt.value);
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { value: opt.value, option: opt },
                }));
            }
        };
        this.template = html `
            <div class="ar-radio-group__label" a-if="this.hasLabel()">{{ this.labelText() }}</div>
            <div :class="this.itemsCls()">
                <label :class="this.optCls(opt)" a-for="opt in this.allOpts()">
                    <input class="ar-radio__input"
                           type="radio"
                           :name="this.groupName()"
                           :value="opt.value"
                           :checked="this.isChecked(opt)"
                           :disabled="opt.disabled"
                           @change="(e) => this.onChange(opt, e)"/>
                    <span class="ar-radio__circle"></span>
                    <span class="ar-radio__label">{{ opt.label }}</span>
                </label>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Radio.DefaultSheet();
    }
    set options(v: RadioOption[]) { this.options$.Set(v ?? []); }
    get options(): RadioOption[] { return this.options$.Get(); }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get value(): string { return this.getAttribute('value') ?? ''; }
    set value(v: string) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }
    get label(): string { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }
    get direction(): 'row' | 'column' { return (this.getAttribute('direction') ?? 'column') as never; }
    set direction(v: 'row' | 'column') { this.setAttribute('direction', v); }
    private hasLabel: () => boolean = () => false;
    private labelText: () => string = () => '';
    private allOpts: () => RadioOption[] = () => [];
    private itemsCls: () => string = () => '';
    private optCls: (o: RadioOption) => string = () => '';
    private isChecked: (o: RadioOption) => boolean = () => false;
    private groupName: () => string = () => '';
    private onChange: (o: RadioOption, e: Event) => void = () => { };
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', { display: 'block' }),
            new Rule('.ar-radio-group__label', {
                color: 'var(--arianna-muted, #6e6b62)',
                fontSize: '0.78rem',
                fontWeight: '500',
                marginBottom: '6px',
            }),
            new Rule('.ar-radio-group__items', { display: 'flex', gap: '8px' }),
            new Rule('.ar-radio-group__items--column', { flexDirection: 'column' }),
            new Rule('.ar-radio-group__items--row', { flexDirection: 'row' }),
            new Rule('.ar-radio', {
                alignItems: 'center',
                cursor: 'pointer',
                display: 'inline-flex',
                gap: '8px',
                userSelect: 'none',
            }),
            new Rule('.ar-radio__input', {
                height: '0', opacity: '0', position: 'absolute', width: '0',
            }),
            new Rule('.ar-radio__circle', {
                background: 'var(--arianna-bg, #ffffff)',
                border: '1.5px solid var(--arianna-border, #d8d8d8)',
                borderRadius: '50%',
                flexShrink: '0',
                height: '16px',
                position: 'relative',
                transition: 'all 0.18s ease',
                width: '16px',
            }),
            new Rule('.ar-radio__input:checked + .ar-radio__circle', {
                borderColor: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-radio__input:checked + .ar-radio__circle::after', {
                background: 'var(--arianna-primary, #1f6feb)',
                borderRadius: '50%',
                content: '""',
                height: '8px',
                left: '3px',
                position: 'absolute',
                top: '3px',
                width: '8px',
            }),
            new Rule('.ar-radio__label', { fontSize: '0.82rem' }),
            new Rule('.ar-radio--disabled', { opacity: '0.5', cursor: 'not-allowed' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Radio namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Radio {
    export namespace Interfaces {
        export interface Option extends RadioOption {
        }
        export interface Options extends RadioOptions {
        }
    }
}
export default Radio;
