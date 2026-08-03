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
 * Attrs:  variant, current
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Reactivity } from '../../core/Reactive.ts';

/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = Reactivity.Types.SignalContract<T>;
import { Css } from '../../core/Css.ts';
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;

export interface StepperOptions {
    variant? : 'horizontal' | 'vertical';
    steps?   : string[];
    current? : number;
}

interface StepEntry {
    index    : number;
    label    : string;
    isDone   : boolean;
    isActive : boolean;
    isPending: boolean;
    isLast   : boolean;
    dotText  : string;
    stepClass: string;
}

export class Stepper extends Component('arianna-stepper', HTMLElement, {}, {
    attrs : ['variant', 'current'],
})
{
    steps$    : Signal<string[]> = signal<string[]>([]);
    completed$: Signal<Set<number>> = signal<Set<number>>(new Set());

    build(_opts: StepperOptions = {})
    {
        const current = this.attrSignal('current');

        const curNum = (): number => parseInt(current.get() ?? '0', 10) || 0;

        this.entries = (): StepEntry[] => {
            const steps = this.steps$.Get();
            const cur   = curNum();
            const done  = this.completed$.Get();
            return steps.map((label, index) => {
                const isDone    = done.has(index);
                const isActive  = index === cur;
                const isPending = index > cur && !isDone;
                let stepClass = 'ar-stepper__step';
                if (isActive)  stepClass += ' ar-stepper__step--active';
                if (isDone)    stepClass += ' ar-stepper__step--done';
                if (isPending) stepClass += ' ar-stepper__step--pending';
                return {
                    index, label, isDone, isActive, isPending,
                    isLast   : index === steps.length - 1,
                    dotText  : isDone ? '✓' : String(index + 1),
                    stepClass,
                };
            });
        };

        this.template = html`
            <div :class="entry.stepClass" a-for="entry in this.entries()">
                <div class="ar-stepper__dot">{{ entry.dotText }}</div>
                <div class="ar-stepper__label">{{ entry.label }}</div>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Stepper.DefaultSheet();
    }

    set steps(v: string[]) { this.steps$.Set(v ?? []); }
    get steps(): string[]  { return this.steps$.Get(); }

    next(): this
    {
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

    prev(): this
    {
        const cur = this.current;
        if (cur > 0) {
            this.setAttribute('current', String(cur - 1));
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { step: cur - 1 },
            }));
        }
        return this;
    }

    complete(n: number = this.current): this
    {
        const done = new Set(this.completed$.Get());
        done.add(n);
        this.completed$.Set(done);
        return this;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): 'horizontal' | 'vertical' { return (this.getAttribute('variant') ?? 'horizontal') as never; }
    set variant(v: 'horizontal' | 'vertical') { this.setAttribute('variant', v); }

    get current(): number  { return parseInt(this.getAttribute('current') ?? '0', 10) || 0; }
    set current(v: number) { this.setAttribute('current', String(v)); }

    private entries: () => StepEntry[] = () => [];

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'flex', alignItems: 'flex-start' }),
                new Rule(':host([variant="vertical"])', { flexDirection: 'column' }),
                new Rule(':host(:not([variant]))',      { flexDirection: 'row' }),
                new Rule(':host([variant="horizontal"])', { flexDirection: 'row' }),
                new Rule('.ar-stepper__step', {
                    alignItems   : 'center',
                    display      : 'flex',
                    flexDirection: 'column',
                    gap          : '4px',
                    minWidth     : '64px',
                    textAlign    : 'center',
                    flex         : '1',
                    position     : 'relative',
                }),
                new Rule('.ar-stepper__dot', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : '2px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '50%',
                    color       : 'var(--arianna-muted, #8b949e)',
                    display     : 'flex',
                    fontSize    : '0.7rem',
                    fontWeight  : '600',
                    height      : '28px',
                    justifyContent: 'center',
                    width       : '28px',
                    transition  : 'all 0.18s ease',
                }),
                new Rule('.ar-stepper__step--active .ar-stepper__dot', {
                    background : 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color      : '#ffffff',
                }),
                new Rule('.ar-stepper__step--done .ar-stepper__dot', {
                    background : 'var(--arianna-success, #2ea043)',
                    borderColor: 'var(--arianna-success, #2ea043)',
                    color      : '#ffffff',
                }),
                new Rule('.ar-stepper__label', {
                    fontSize: '0.72rem',
                    color   : 'var(--arianna-muted, #8b949e)',
                }),
                new Rule('.ar-stepper__step--active .ar-stepper__label', {
                    color     : 'var(--arianna-text, #1f2328)',
                    fontWeight: '600',
                }),
                // Connector line between adjacent step dots (horizontal default)
                new Rule('.ar-stepper__step:not(:last-child)::after', {
                    content   : '""',
                    position  : 'absolute',
                    top       : '14px',
                    left      : '50%',
                    right     : '-50%',
                    height    : '2px',
                    background: 'var(--arianna-border, #d8d8d8)',
                    zIndex    : '-1',
                }),
                new Rule(':host([variant="vertical"]) .ar-stepper__step:not(:last-child)::after', {
                    display: 'none',
                }),
                new Rule('.ar-stepper__step--done:not(:last-child)::after', {
                    background: 'var(--arianna-success, #2ea043)',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Stepper', {
        value: Stepper, writable: false, enumerable: false, configurable: false,
    });
}

export default Stepper;
