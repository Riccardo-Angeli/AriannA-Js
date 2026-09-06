import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/navigation/Stepper
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Stepper — wizard / progress indicator showing ordered steps with current
 * position and completion markers.
 *
 * @example JS
 *   const s = new Stepper();
 *   s.steps   = ['Account', 'Profile', 'Confirm'];
 *   s.current = 1;
 *   s.next();
 *   s.complete(0);
 *
 * @example HTML
 *   <arianna-stepper variant="vertical" current="1"></arianna-stepper>
 *
 * Events:
 *   - arianna:change   detail: { step }
 *
 * Slots:  (none)
 * Attributes:  variant, current
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
export interface StepperOptions {
    variant?: 'horizontal' | 'vertical';
    steps?: string[];
    current?: number;
}
interface StepEntry {
    index: number;
    label: string;
    isDone: boolean;
    isActive: boolean;
    isPending: boolean;
    isLast: boolean;
    dotText: string;
    stepClass: string;
}

export const Styles: Stylesheet = (() =>
{
        return new Stylesheet([
            new Rule('.Stepper', {
                '--arianna-bg': '#17181c',
                '--arianna-bg-2': '#1d1e23',
                '--arianna-bg-3': '#24262b',
                '--arianna-text': '#e6e8eb',
                '--arianna-muted': '#9aa0aa',
                '--arianna-dim': '#6f7580',
                '--arianna-border': '#303238',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#26a69a',
                '--arianna-warning': '#f5a623',
                '--arianna-danger': '#ef5350',
                '--bg': '#17181c',
                '--bg3': '#24262b',
                '--text': '#e6e8eb',
                '--muted': '#9aa0aa',
                '--border': '#303238',
                '--accent': '#e40c88',
            }),
            new Rule('.Stepper[theme="light"]', {
                '--arianna-bg': '#ffffff',
                '--arianna-bg-2': '#fbfbfc',
                '--arianna-bg-3': '#f3f3f5',
                '--arianna-text': '#1c1e21',
                '--arianna-muted': '#626873',
                '--arianna-dim': '#8a8f98',
                '--arianna-border': '#e2e2e6',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#168a78',
                '--arianna-warning': '#b66c00',
                '--arianna-danger': '#c93645',
                '--bg': '#ffffff',
                '--bg3': '#f3f3f5',
                '--text': '#1c1e21',
                '--muted': '#626873',
                '--border': '#e2e2e6',
                '--accent': '#e40c88',
            }),
            new Rule('.Stepper', { display: 'flex', alignItems: 'flex-start' }),
            new Rule('.Stepper[variant="vertical"]', { flexDirection: 'column' }),
            new Rule('.Stepper:not([variant]))', { flexDirection: 'row' }),
            new Rule('.Stepper[variant="horizontal"]', { flexDirection: 'row' }),
            new Rule('.Stepper-Step', {
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '64px',
                textAlign: 'center',
                flex: '1',
                position: 'relative',
            }),
            new Rule('.Stepper-Dot', {
                alignItems: 'center',
                background: 'var(--arianna-bg-3, #f3f3f3)',
                border: '2px solid var(--arianna-border, #d8d8d8)',
                borderRadius: '50%',
                color: 'var(--arianna-muted, #8b949e)',
                display: 'flex',
                fontSize: '0.7rem',
                fontWeight: '600',
                height: '28px',
                justifyContent: 'center',
                width: '28px',
                transition: 'all 0.18s ease',
            }),
            new Rule('.Stepper-Step-Active .Stepper-Dot', {
                background: 'var(--arianna-primary, #1f6feb)',
                borderColor: 'var(--arianna-primary, #1f6feb)',
                color: '#ffffff',
            }),
            new Rule('.Stepper-Step-Done .Stepper-Dot', {
                background: 'var(--arianna-success, #2ea043)',
                borderColor: 'var(--arianna-success, #2ea043)',
                color: '#ffffff',
            }),
            new Rule('.Stepper-Label', {
                fontSize: '0.72rem',
                color: 'var(--arianna-muted, #8b949e)',
            }),
            new Rule('.Stepper-Step-Active .Stepper-Label', {
                color: 'var(--arianna-text, #1f2328)',
                fontWeight: '600',
            }),
            // Connector line between adjacent step dots (horizontal default)
            new Rule('.Stepper-Step:not(:last-child)::after', {
                content: '""',
                position: 'absolute',
                top: '14px',
                left: '50%',
                right: '-50%',
                height: '2px',
                background: 'var(--arianna-border, #d8d8d8)',
                zIndex: '-1',
            }),
            new Rule('.Stepper[variant="vertical"] .Stepper-Step:not(:last-child)::after', {
                display: 'none',
            }),
            new Rule('.Stepper-Step-Done:not(:last-child)::after', {
                background: 'var(--arianna-success, #2ea043)',
            }),
        ]);
    
})();

@Component('arianna-stepper', Styles, {
    Shadow: false,
    Attributes: ['variant', 'current', 'theme', 'steps'],
    Properties: ['steps'],
})
export class Stepper extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    private _stepsSignal?: Signal<string[]>;
    public get steps$(): Signal<string[]>
    {
        this._stepsSignal ??= signal<string[]>([]);
        return this._stepsSignal;
    }
    private _completedSignal?: Signal<Set<number>>;
    public get completed$(): Signal<Set<number>>
    {
        this._completedSignal ??= signal<Set<number>>(new Set());
        return this._completedSignal;
    }
    onConnected(_opts: StepperOptions = {}) {
        this.classList.add('Stepper');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        const current = this.signal().attribute('current');
        const curNum = (): number => parseInt(current.Get() ?? '0', 10) || 0;
        this.entries = (): StepEntry[] => {
            const steps = this.steps$.Get();
            const cur = curNum();
            const done = this.completed$.Get();
            return steps.map((label, index) => {
                const isDone = done.has(index);
                const isActive = index === cur;
                const isPending = index > cur && !isDone;
                let stepClass = 'Stepper-Step';
                if (isActive)
                    stepClass += ' Stepper-Step-Active';
                if (isDone)
                    stepClass += ' Stepper-Step-Done';
                if (isPending)
                    stepClass += ' Stepper-Step-Pending';
                return {
                    index, label, isDone, isActive, isPending,
                    isLast: index === steps.length - 1,
                    dotText: isDone ? '✓' : String(index + 1),
                    stepClass,
                };
            });
        };
        this.template = html `
            <div :class="entry.stepClass" a-for="entry in this.entries()">
                <div class="Stepper-Dot">{{ entry.dotText }}</div>
                <div class="Stepper-Label">{{ entry.label }}</div>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Styles;
    }
    set steps(v: string[]) { this.steps$.Set(v ?? []); }
    get steps(): string[] { return this.steps$.Get(); }
    next(): this {
        const cur = this.current;
        if (cur < this.steps$.Get().length - 1) {
            const done = new Set(this.completed$.Get());
            done.add(cur);
            this.completed$.Set(done);
            this.setAttribute('current', String(cur + 1));
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { step: cur + 1 },
            }));
        }
        return this;
    }
    prev(): this {
        const cur = this.current;
        if (cur > 0) {
            this.setAttribute('current', String(cur - 1));
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { step: cur - 1 },
            }));
        }
        return this;
    }
    complete(n: number = this.current): this {
        const done = new Set(this.completed$.Get());
        done.add(n);
        this.completed$.Set(done);
        return this;
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get variant(): 'horizontal' | 'vertical' { return (this.getAttribute('variant') ?? 'horizontal') as never; }
    set variant(v: 'horizontal' | 'vertical') { this.setAttribute('variant', v); }
    get current(): number { return parseInt(this.getAttribute('current') ?? '0', 10) || 0; }
    set current(v: number) { this.setAttribute('current', String(v)); }
    private entries: () => StepEntry[] = () => [];
    public static readonly Styles = Styles;
    static DefaultSheet(): Stylesheet { return Styles; }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Stepper namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Stepper {
    export namespace Interfaces {
        export interface Options extends StepperOptions {
        }
        export interface StepEntryContract extends StepEntry {
        }
    }
}
export default Stepper;
