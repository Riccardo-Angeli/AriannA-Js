/**
 * @module    components/inputs/InputChip
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA InputChip component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   InputChip
 *  @public
 *  @description Namespace containing InputChip contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace InputChip
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
        /** @interface   ChipOptions
         *  @public
         *  @description ChipOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChipOptions
        {
            /** @name        options
             *  @public
             *  @type        {string[]}
             *  @description Component member for options.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            options?: string[];

            /** @name        selected
             *  @public
             *  @type        {string[]}
             *  @description Component member for selected.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selected?: string[];

            /** @name        multiple
             *  @public
             *  @type        {boolean}
             *  @description Component member for multiple.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            multiple?: boolean;

            /** @name        removable
             *  @public
             *  @type        {boolean}
             *  @description Component member for removable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            removable?: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   ChipView
         *  @public
         *  @description ChipView contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChipView
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        on
             *  @public
             *  @type        {boolean}
             *  @description Component member for on.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            on: boolean;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
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

    /** @class       InputChip
     *  @public
     *  @description AriannA InputChip component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-input-chip', {}, {
        Attributes: ['multiple', 'removable', 'disabled'],
    })
    export class InputChip extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        options$
         *  @public
         *  @type        {InputChip.Types.Signal<string[]>}
         *  @description Component member for options$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        options$: Types.Signal<string[]> = signal<string[]>([]);

        /** @name        selected$
         *  @public
         *  @type        {InputChip.Types.Signal<Set<string>>}
         *  @description Component member for selected$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected$: Types.Signal<Set<string>> = signal<Set<string>>(new Set());

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {InputChip.Interfaces.ChipOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ChipOptions = {})
        {
            this.isMultiple = () => this.getAttribute('multiple') !== 'false';
            this.isRemovable = () => this.hasAttribute('removable');
            this.chips = (): Interfaces.ChipView[] => {
                /** @name        opts
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned opts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const opts = this.options$.Get();

                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();
                return opts.map((label: any) => {
                    /** @name        on
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned on value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const on = sel.has(label);
                    return {
                        label,
                        on,
                        cls: 'ar-chip' + (on ? ' ar-chip--on' : ''),
                    };
                });
            };
            this.onChipClick = (label: string) => {
                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = new Set(this.selected$.Get());
                if (cur.has(label))
                {
                    cur.delete(label);
                }
                else
                {
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

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = new Set(this.selected$.Get());
                cur.delete(label);
                this.selected$.Set(cur);
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { selected: [...cur] },
                }));
            };
            this.shouldShowRemove = (chip: Interfaces.ChipView) => this.isRemovable() && chip.on;
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
                /** @name        Sheet
                 *  @public
                 *  @type        {InputChip.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = InputChip.DefaultSheet();
        }

        /** @name        options
         *  @public
         *  @type        {void}
         *  @description Component member for options.
         *  @param       {string[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set options(v: string[]) { this.options$.Set(v ?? []); }

        /** @name        options
         *  @public
         *  @type        {string[]}
         *  @description Component member for options.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get options(): string[] { return this.options$.Get(); }

        /** @name        selected
         *  @public
         *  @type        {void}
         *  @description Component member for selected.
         *  @param       {string[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set selected(v: string[]) { this.selected$.Set(new Set(v ?? [])); }

        /** @name        selected
         *  @public
         *  @type        {string[]}
         *  @description Component member for selected.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get selected(): string[] { return [...this.selected$.Get()]; }

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

        /** @name        isMultiple
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Multiple.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isMultiple: () => boolean = () => true;

        /** @name        isRemovable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Removable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isRemovable: () => boolean = () => false;

        /** @name        chips
         *  @private
         *  @type        {() => InputChip.Interfaces.ChipView[]}
         *  @description Component member for chips.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private chips: () => Interfaces.ChipView[] = () => [];

        /** @name        onChipClick
         *  @private
         *  @type        {(label: string) => void}
         *  @description Component member for on Chip Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onChipClick: (label: string) => void = () => { };

        /** @name        onRemoveClick
         *  @private
         *  @type        {(label: string, e: Event) => void}
         *  @description Component member for on Remove Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRemoveClick: (label: string, e: Event) => void = () => { };

        /** @name        shouldShowRemove
         *  @private
         *  @type        {(c: InputChip.Interfaces.ChipView) => boolean}
         *  @description Component member for should Show Remove.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private shouldShowRemove: (c: Interfaces.ChipView) => boolean = () => false;

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {InputChip.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {InputChip.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
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
}
export default InputChip;

export type ChipOptions = InputChip.Interfaces.ChipOptions;
