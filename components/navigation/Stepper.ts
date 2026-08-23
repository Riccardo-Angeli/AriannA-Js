/**
 * @module    components/navigation/Stepper
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Stepper component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   Stepper
 *  @public
 *  @description Namespace containing Stepper contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Stepper
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
        /** @interface   StepperOptions
         *  @public
         *  @description StepperOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StepperOptions
        {
            /** @name        variant
             *  @public
             *  @type        {'horizontal' | 'vertical'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'horizontal' | 'vertical';

            /** @name        steps
             *  @public
             *  @type        {string[]}
             *  @description Component member for steps.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            steps?: string[];

            /** @name        current
             *  @public
             *  @type        {number}
             *  @description Component member for current.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            current?: number;
        }

        /** @interface   StepEntry
         *  @public
         *  @description StepEntry contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StepEntry
        {
            /** @name        index
             *  @public
             *  @type        {number}
             *  @description Component member for index.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            index: number;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        isDone
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Done.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isDone: boolean;

            /** @name        isActive
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Active.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isActive: boolean;

            /** @name        isPending
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Pending.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isPending: boolean;

            /** @name        isLast
             *  @public
             *  @type        {boolean}
             *  @description Component member for is Last.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            isLast: boolean;

            /** @name        dotText
             *  @public
             *  @type        {string}
             *  @description Component member for dot Text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dotText: string;

            /** @name        stepClass
             *  @public
             *  @type        {string}
             *  @description Component member for step Class.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            stepClass: string;
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

    /** @class       Stepper
     *  @public
     *  @description AriannA Stepper component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-stepper', {}, {
        Attributes: ['variant', 'current'],
    })
    export class Stepper extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        steps$
         *  @public
         *  @type        {Stepper.Types.Signal<string[]>}
         *  @description Component member for steps$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        steps$: Types.Signal<string[]> = signal<string[]>([]);

        /** @name        completed$
         *  @public
         *  @type        {Stepper.Types.Signal<Set<number>>}
         *  @description Component member for completed$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        completed$: Types.Signal<Set<number>> = signal<Set<number>>(new Set());

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Stepper.Interfaces.StepperOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.StepperOptions = {})
        {
            /** @name        current
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned current value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const current = this.signal().attribute('current');

            /** @name        curNum
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned curNum value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const curNum = (): number => parseInt(current.Get() ?? '0', 10) || 0;
            this.entries = (): Interfaces.StepEntry[] => {
                /** @name        steps
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned steps value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const steps = this.steps$.Get();

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = curNum();

                /** @name        done
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned done value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const done = this.completed$.Get();
                return steps.map((label: any, index: any) => {
                    /** @name        isDone
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned isDone value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const isDone = done.has(index);

                    /** @name        isActive
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned isActive value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const isActive = index === cur;

                    /** @name        isPending
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned isPending value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const isPending = index > cur && !isDone;

                    /** @name        stepClass
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned stepClass value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let stepClass = 'ar-stepper__step';
                    if (isActive)
                        stepClass += ' ar-stepper__step--active';
                    if (isDone)
                        stepClass += ' ar-stepper__step--done';
                    if (isPending)
                        stepClass += ' ar-stepper__step--pending';
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
                <div class="ar-stepper__dot">{{ entry.dotText }}</div>
                <div class="ar-stepper__label">{{ entry.label }}</div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Stepper.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Stepper.DefaultSheet();
        }

        /** @name        steps
         *  @public
         *  @type        {void}
         *  @description Component member for steps.
         *  @param       {string[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set steps(v: string[]) { this.steps$.Set(v ?? []); }

        /** @name        steps
         *  @public
         *  @type        {string[]}
         *  @description Component member for steps.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get steps(): string[] { return this.steps$.Get(); }

        /** @name        next
         *  @public
         *  @type        {this}
         *  @description Component member for next.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        next(): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.current;
            if (cur < this.steps$.Get().length - 1)
            {
                /** @name        done
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned done value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
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

        /** @name        prev
         *  @public
         *  @type        {this}
         *  @description Component member for prev.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        prev(): this
        {
            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.current;
            if (cur > 0)
            {
                this.setAttribute('current', String(cur - 1));
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { step: cur - 1 },
                }));
            }
            return this;
        }

        /** @name        complete
         *  @public
         *  @type        {this}
         *  @description Component member for complete.
         *  @param       {number} n Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        complete(n?: number): this
        {
            /** @name        done
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned done value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const done = new Set(this.completed$.Get());
            done.add(n ?? this.current);
            this.completed$.Set(done);
            return this;
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

        /** @name        variant
         *  @public
         *  @type        {'horizontal' | 'vertical'}
         *  @description Component member for variant.
         *  @returns     {'horizontal' | 'vertical'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): 'horizontal' | 'vertical' { return (this.getAttribute('variant') ?? 'horizontal') as never; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {'horizontal' | 'vertical'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: 'horizontal' | 'vertical') { this.setAttribute('variant', v); }

        /** @name        current
         *  @public
         *  @type        {number}
         *  @description Component member for current.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get current(): number { return parseInt(this.getAttribute('current') ?? '0', 10) || 0; }

        /** @name        current
         *  @public
         *  @type        {void}
         *  @description Component member for current.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set current(v: number) { this.setAttribute('current', String(v)); }

        /** @name        entries
         *  @private
         *  @type        {() => Stepper.Interfaces.StepEntry[]}
         *  @description Component member for entries.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private entries: () => Interfaces.StepEntry[] = () => [];

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stepper.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stepper.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'flex', alignItems: 'flex-start' }),
                new Rule(':host([variant="vertical"])', { flexDirection: 'column' }),
                new Rule(':host(:not([variant]))', { flexDirection: 'row' }),
                new Rule(':host([variant="horizontal"])', { flexDirection: 'row' }),
                new Rule('.ar-stepper__step', {
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '64px',
                    textAlign: 'center',
                    flex: '1',
                    position: 'relative',
                }),
                new Rule('.ar-stepper__dot', {
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
                new Rule('.ar-stepper__step--active .ar-stepper__dot', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#ffffff',
                }),
                new Rule('.ar-stepper__step--done .ar-stepper__dot', {
                    background: 'var(--arianna-success, #2ea043)',
                    borderColor: 'var(--arianna-success, #2ea043)',
                    color: '#ffffff',
                }),
                new Rule('.ar-stepper__label', {
                    fontSize: '0.72rem',
                    color: 'var(--arianna-muted, #8b949e)',
                }),
                new Rule('.ar-stepper__step--active .ar-stepper__label', {
                    color: 'var(--arianna-text, #1f2328)',
                    fontWeight: '600',
                }),
                // Connector line between adjacent step dots (horizontal default)
                new Rule('.ar-stepper__step:not(:last-child)::after', {
                    content: '""',
                    position: 'absolute',
                    top: '14px',
                    left: '50%',
                    right: '-50%',
                    height: '2px',
                    background: 'var(--arianna-border, #d8d8d8)',
                    zIndex: '-1',
                }),
                new Rule(':host([variant="vertical"]) .ar-stepper__step:not(:last-child)::after', {
                    display: 'none',
                }),
                new Rule('.ar-stepper__step--done:not(:last-child)::after', {
                    background: 'var(--arianna-success, #2ea043)',
                }),
            ]);
        }
    }
}
export default Stepper;
