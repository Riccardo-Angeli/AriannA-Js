/**
 * @module    components/display/ProgressBar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ProgressBar component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   ProgressBar
 *  @public
 *  @description Namespace containing ProgressBar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ProgressBar
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
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
        /** @interface   ProgressBarOptions
         *  @public
         *  @description ProgressBarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ProgressBarOptions
        {
            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        value
             *  @public
             *  @type        {number}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: number;

            /** @name        height
             *  @public
             *  @type        {number}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: number;

            /** @name        variant
             *  @public
             *  @type        {'default' | 'success' | 'warning' | 'danger'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'default' | 'success' | 'warning' | 'danger';

            /** @name        showValue
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showValue?: boolean;

            /** @name        indeterminate
             *  @public
             *  @type        {boolean}
             *  @description Component member for indeterminate.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            indeterminate?: boolean;
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

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       ProgressBar
     *  @public
     *  @description AriannA ProgressBar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-progress-bar', {}, {
        Attributes: ['label', 'value', 'height', 'variant', 'show-value', 'indeterminate'],
    })
    export class ProgressBar extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ProgressBar.Interfaces.ProgressBarOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ProgressBarOptions = {})
        {
            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');

            /** @name        value
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned value value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const value = this.signal().attribute('value');

            /** @name        height
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned height value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const height = this.signal().attribute('height');

            /** @name        variant
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned variant value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const variant = this.signal().attribute('variant');

            /** @name        clampedValue
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clampedValue value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clampedValue = () => {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = parseFloat(value.Get() ?? '0');
                if (!Number.isFinite(n))
                    return 0;
                return Math.max(0, Math.min(100, n));
            };
            this.labelText = () => label.Get() ?? '';
            this.hasLabel = () => !!label.Get();
            this.hasShowVal = () => this.hasAttribute('show-value');
            this.isIndet = () => this.hasAttribute('indeterminate');
            this.valuePct = () => clampedValue() + '%';
            this.valueLabel = () => Math.round(clampedValue()) + '%';
            this.barStyleObj = () => {
                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = this.isIndet() ? '40%' : clampedValue() + '%';
                return { width: w, height: '100%' };
            };
            this.trackStyleObj = () => {
                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = parseInt(height.Get() ?? '6', 10) || 6;
                return { height: h + 'px' };
            };
            this.barClassName = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let c = 'ar-progress__bar ar-progress__bar--' + (variant.Get() ?? 'default');
                if (this.isIndet())
                    c += ' ar-progress__bar--indeterminate';
                return c;
            };
            this.ariaValue = () => String(Math.round(clampedValue()));
            this.template = html `
            <div class="ar-progress__header" a-if="this.hasLabel() || this.hasShowVal()">
                <span class="ar-progress__label" a-if="this.hasLabel()">{{ this.labelText() }}</span>
                <span class="ar-progress__value" a-if="this.hasShowVal()">{{ this.valueLabel() }}</span>
            </div>
            <div class="ar-progress__track" :style="this.trackStyleObj()">
                <div :class="this.barClassName()"
                     :style="this.barStyleObj()"
                     role="progressbar"
                     :aria-valuenow="this.ariaValue()"></div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ProgressBar.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ProgressBar.DefaultSheet();
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

        /** @name        value
         *  @public
         *  @type        {number}
         *  @description Component member for value.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get value(): number { return parseFloat(this.getAttribute('value') ?? '0'); }

        /** @name        value
         *  @public
         *  @type        {void}
         *  @description Component member for value.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set value(v: number) { this.setAttribute('value', String(Math.max(0, Math.min(100, v)))); }

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get label(): string { return this.getAttribute('label') ?? ''; }

        /** @name        label
         *  @public
         *  @type        {void}
         *  @description Component member for label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

        /** @name        height
         *  @public
         *  @type        {number}
         *  @description Component member for height.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get height(): number { return parseInt(this.getAttribute('height') ?? '6', 10); }

        /** @name        height
         *  @public
         *  @type        {void}
         *  @description Component member for height.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set height(v: number) { this.setAttribute('height', String(v)); }

        /** @name        variant
         *  @public
         *  @type        {string}
         *  @description Component member for variant.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): string { return this.getAttribute('variant') ?? 'default'; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: string) { this.setAttribute('variant', v); }

        /** @name        showValue
         *  @public
         *  @type        {boolean}
         *  @description Component member for show Value.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get showValue(): boolean { return this.hasAttribute('show-value'); }

        /** @name        showValue
         *  @public
         *  @type        {void}
         *  @description Component member for show Value.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set showValue(v: boolean) { v ? this.setAttribute('show-value', '') : this.removeAttribute('show-value'); }

        /** @name        indeterminate
         *  @public
         *  @type        {boolean}
         *  @description Component member for indeterminate.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get indeterminate(): boolean { return this.hasAttribute('indeterminate'); }

        /** @name        indeterminate
         *  @public
         *  @type        {void}
         *  @description Component member for indeterminate.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set indeterminate(v: boolean) { v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate'); }

        /** @name        labelText
         *  @private
         *  @type        {() => string}
         *  @description Component member for label Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelText: () => string = () => '';

        /** @name        hasLabel
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasLabel: () => boolean = () => false;

        /** @name        hasShowVal
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Show Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasShowVal: () => boolean = () => false;

        /** @name        isIndet
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Indet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isIndet: () => boolean = () => false;

        /** @name        valuePct
         *  @private
         *  @type        {() => string}
         *  @description Component member for value Pct.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private valuePct: () => string = () => '0%';

        /** @name        valueLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for value Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private valueLabel: () => string = () => '0%';

        /** @name        barStyleObj
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for bar Style Obj.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private barStyleObj: () => Record<string, string> = () => ({});

        /** @name        trackStyleObj
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for track Style Obj.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private trackStyleObj: () => Record<string, string> = () => ({});

        /** @name        barClassName
         *  @private
         *  @type        {() => string}
         *  @description Component member for bar Class Name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private barClassName: () => string = () => '';

        /** @name        ariaValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for aria Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private ariaValue: () => string = () => '0';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ProgressBar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ProgressBar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-progress__header', { display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }),
                new Rule('.ar-progress__label', { color: 'var(--arianna-muted, #8b949e)' }),
                new Rule('.ar-progress__value', { fontWeight: '500' }),
                new Rule('.ar-progress__track', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderRadius: '99px',
                    overflow: 'hidden',
                    width: '100%',
                }),
                new Rule('.ar-progress__bar', {
                    borderRadius: '99px',
                    height: '100%',
                    transition: 'width 0.3s ease',
                }),
                new Rule('.ar-progress__bar--default', { background: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-progress__bar--success', { background: 'var(--arianna-success, #2ea043)' }),
                new Rule('.ar-progress__bar--warning', { background: 'var(--arianna-warning, #d29922)' }),
                new Rule('.ar-progress__bar--danger', { background: 'var(--arianna-danger,  #cf222e)' }),
                new Rule('.ar-progress__bar--indeterminate', {
                    animation: 'ar-progress-slide 1.4s infinite ease-in-out',
                    width: '40% !important',
                }),
                new Rule('@keyframes ar-progress-slide', {
                    '0%': { transform: 'translateX(-150%)' },
                    '100%': { transform: 'translateX(400%)' },
                } as never),
            ]);
        }
    }
}
export default ProgressBar;

export type ProgressBarOptions = ProgressBar.Interfaces.ProgressBarOptions;
