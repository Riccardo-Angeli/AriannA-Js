import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/inputs/Chip
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Chip — selectable filter chip group. NOT the display Chip — this one
 * supports multi-select with optional removable badges.
 *
 * @example JS
 *   const c = new Chip();
 *   c.options  = ['React', 'Vue', 'Angular', 'AriannA'];
 *   c.selected = ['AriannA'];
 *   c.addEventListener('arianna:change', e => console.log(e.detail.selected));
 *
 * @example HTML
 *   <arianna-chip multiple></arianna-chip>
 *
 * Events: arianna:change  detail: { selected }
 * Attributes:  multiple, removable, disabled
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
export interface ChipOptions {
    options?: string[];
    selected?: string[];
    multiple?: boolean;
    removable?: boolean;
    disabled?: boolean;
}
interface ChipView {
    label: string;
    on: boolean;
    cls: string;
}
@Component('arianna-input-chip', {}, {
    Attributes: ['multiple', 'removable', 'disabled'],
})
export class InputChip extends HTMLElement {
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    options$: Signal<string[]> = signal<string[]>([]);
    selected$: Signal<Set<string>> = signal<Set<string>>(new Set());
    onConnected(_opts: ChipOptions = {}) {
        this.isMultiple = () => this.getAttribute('multiple') !== 'false';
        this.isRemovable = () => this.hasAttribute('removable');
        this.chips = (): ChipView[] => {
            const opts = this.options$.Get();
            const sel = this.selected$.Get();
            return opts.map(label => {
                const on = sel.has(label);
                return {
                    label,
                    on,
                    cls: 'ar-chip' + (on ? ' ar-chip--on' : ''),
                };
            });
        };
        this.onChipClick = (label: string) => {
            const cur = new Set(this.selected$.Get());
            if (cur.has(label)) {
                cur.delete(label);
            }
            else {
                if (!this.isMultiple())
                    cur.clear();
                cur.add(label);
            }
            this.selected$.Set(cur);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { selected: [...cur] },
            }));
        };
        this.onRemoveClick = (label: string, e: Event) => {
            e.stopPropagation();
            const cur = new Set(this.selected$.Get());
            cur.delete(label);
            this.selected$.Set(cur);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { selected: [...cur] },
            }));
        };
        this.shouldShowRemove = (chip: ChipView) => this.isRemovable() && chip.on;
        this.template = html `
            <button :class="c.cls"
                    a-for="c in this.chips()"
                    @click="(e) => this.onChipClick(c.label)">
                <span>{{ c.label }}</span>
                <span class="ar-chip__remove"
                      a-if="this.shouldShowRemove(c)"
                      @click="(e) => this.onRemoveClick(c.label, e)"> ✕</span>
            </button>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = InputChip.DefaultSheet();
    }
    set options(v: string[]) { this.options$.Set(v ?? []); }
    get options(): string[] { return this.options$.Get(); }
    set selected(v: string[]) { this.selected$.Set(new Set(v ?? [])); }
    get selected(): string[] { return [...this.selected$.Get()]; }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    private isMultiple: () => boolean = () => true;
    private isRemovable: () => boolean = () => false;
    private chips: () => ChipView[] = () => [];
    private onChipClick: (label: string) => void = () => { };
    private onRemoveClick: (label: string, e: Event) => void = () => { };
    private shouldShowRemove: (c: ChipView) => boolean = () => false;
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', { display: 'flex', flexWrap: 'wrap', gap: '6px' }),
            new Rule('.ar-chip', {
                alignItems: 'center',
                background: 'var(--arianna-bg, #ffffff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: '16px',
                color: 'var(--arianna-text, #1f2328)',
                cursor: 'pointer',
                display: 'inline-flex',
                font: 'inherit',
                fontSize: '0.78rem',
                gap: '4px',
                padding: '4px 12px',
                transition: 'all 0.18s ease',
                userSelect: 'none',
            }),
            new Rule('.ar-chip:hover', {
                borderColor: 'var(--arianna-primary, #1f6feb)',
                color: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-chip--on', {
                background: 'rgba(31,111,235,0.10)',
                borderColor: 'var(--arianna-primary, #1f6feb)',
                color: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-chip__remove', { cursor: 'pointer', opacity: '0.7' }),
            new Rule('.ar-chip__remove:hover', { opacity: '1' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * InputChip namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace InputChip {
    export namespace Interfaces {
        export interface ChipOptionsContract extends ChipOptions {
        }
        export interface ChipViewContract extends ChipView {
        }
    }
}
export default InputChip;
