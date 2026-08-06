import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/inputs/Checkbox
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Checkbox — standard tri-state checkbox (unchecked / checked / indeterminate).
 *
 * @example HTML
 *   <arianna-checkbox label="Accept terms"></arianna-checkbox>
 *
 * Events: arianna:change  detail: { checked }
 * Attributes:  label, checked, indeterminate, disabled
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface CheckboxOptions {
    label?: string;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
}
@Component('arianna-checkbox', {}, {
    Attributes: ['label', 'checked', 'indeterminate', 'disabled'],
})
export class Checkbox extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: CheckboxOptions = {}) {
        const label = this.signal().attribute('label');
        this.hasLabel = () => !!label.Get();
        this.labelText = () => label.Get() ?? '';
        this.isChecked = () => this.hasAttribute('checked');
        this.isDisabled = () => this.hasAttribute('disabled');
        this.isIndet = () => this.hasAttribute('indeterminate');
        this.onChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            if (inp.checked)
                this.setAttribute('checked', '');
            else
                this.removeAttribute('checked');
            this.removeAttribute('indeterminate');
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { checked: inp.checked },
            }));
        };
        // After mount, propagate indeterminate to the input element
        const syncIndet = () => {
            const inp = this.querySelector<HTMLInputElement>('.ar-checkbox__input');
            if (inp)
                inp.indeterminate = this.isIndet();
        };
        this.addEventListener('arianna:attr-indeterminate', syncIndet);
        queueMicrotask(syncIndet);
        this.template = html `
            <label class="ar-checkbox__row">
                <input class="ar-checkbox__input"
                       type="checkbox"
                       :checked="this.isChecked()"
                       :disabled="this.isDisabled()"
                       @change="this.onChange"/>
                <span class="ar-checkbox__box"></span>
                <span class="ar-checkbox__label" a-if="this.hasLabel()">{{ this.labelText() }}</span>
            </label>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Checkbox.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get checked(): boolean { return this.hasAttribute('checked'); }
    set checked(v: boolean) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }
    get indeterminate(): boolean { return this.hasAttribute('indeterminate'); }
    set indeterminate(v: boolean) { v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate'); }
    get disabled(): boolean { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }
    get label(): string { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }
    private hasLabel: () => boolean = () => false;
    private labelText: () => string = () => '';
    private isChecked: () => boolean = () => false;
    private isDisabled: () => boolean = () => false;
    private isIndet: () => boolean = () => false;
    private onChange: (e: Event) => void = () => { };
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', { display: 'inline-block' }),
            new Rule('.ar-checkbox__row', {
                alignItems: 'center',
                cursor: 'pointer',
                display: 'inline-flex',
                gap: '8px',
                userSelect: 'none',
            }),
            new Rule('.ar-checkbox__input', {
                height: '0', opacity: '0', position: 'absolute', width: '0',
            }),
            new Rule('.ar-checkbox__box', {
                alignItems: 'center',
                background: 'var(--arianna-bg, #ffffff)',
                border: '1.5px solid var(--arianna-border, #d8d8d8)',
                borderRadius: '3px',
                display: 'flex',
                flexShrink: '0',
                height: '16px',
                justifyContent: 'center',
                transition: 'all 0.18s ease',
                width: '16px',
            }),
            new Rule('.ar-checkbox__input:checked + .ar-checkbox__box, .ar-checkbox__input:indeterminate + .ar-checkbox__box', {
                background: 'var(--arianna-primary, #1f6feb)',
                borderColor: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-checkbox__input:checked + .ar-checkbox__box::after', {
                color: '#ffffff',
                content: '"✓"',
                fontSize: '0.7rem',
                fontWeight: '700',
            }),
            new Rule('.ar-checkbox__input:indeterminate + .ar-checkbox__box::after', {
                background: '#ffffff',
                content: '""',
                height: '2px',
                width: '8px',
            }),
            new Rule('.ar-checkbox__label', { fontSize: '0.82rem' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Checkbox namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Checkbox {
    export namespace Interfaces {
        export interface Options extends CheckboxOptions {
        }
    }
}
export default Checkbox;
