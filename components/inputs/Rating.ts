/**
 * @module    components/inputs/Rating
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Rating component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Rating
 *  @public
 *  @description Namespace containing Rating contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Rating
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
        /** @interface   RatingOptions
         *  @public
         *  @description RatingOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RatingOptions
        {
            /** @name        max
             *  @public
             *  @type        {number}
             *  @description Component member for max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            max?: number;

            /** @name        value
             *  @public
             *  @type        {number}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: number;

            /** @name        readonly
             *  @public
             *  @type        {boolean}
             *  @description Component member for readonly.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly?: boolean;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        emptyIcon
             *  @public
             *  @type        {string}
             *  @description Component member for empty Icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            emptyIcon?: string;
        }

        /** @interface   Star
         *  @public
         *  @description Star contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Star
        {
            /** @name        index
             *  @public
             *  @type        {number}
             *  @description Component member for index.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            index: number;

            /** @name        filled
             *  @public
             *  @type        {boolean}
             *  @description Component member for filled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            filled: boolean;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;
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

    /** @class       Rating
     *  @public
     *  @description AriannA Rating component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-rating', {}, {
        Attributes: ['max', 'value', 'readonly', 'disabled', 'icon', 'empty-icon'],
    })
    export class Rating extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Rating.Interfaces.RatingOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.RatingOptions = {})
        {
            /** @name        max
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned max value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const max = this.signal().attribute('max');

            /** @name        value
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned value value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const value = this.signal().attribute('value');

            /** @name        icon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned icon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const icon = this.signal().attribute('icon');

            /** @name        emptyIcon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned emptyIcon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const emptyIcon = this.signal().attribute('empty-icon');
            this.maxVal = () => parseInt(max.Get() ?? '5', 10) || 5;
            this.currentVal = () => parseFloat(value.Get() ?? '0') || 0;
            this.isReadonly = () => this.hasAttribute('readonly');
            this.isDisabled = () => this.hasAttribute('disabled');
            this.fullIcon = () => icon.Get() ?? '★';
            this.unfilledIcon = () => emptyIcon.Get() ?? '☆';
            this.stars = (): Interfaces.Star[] => {
                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = this.maxVal();

                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = this.currentVal();

                /** @name        out
                 *  @public
                 *  @type        {Rating.Interfaces.Star[]}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Interfaces.Star[] = [];
                for (let i = 1; i <= m; i++)
                {
                    /** @name        filled
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned filled value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const filled = i <= v;
                    out.push({
                        index: i,
                        filled,
                        cls: 'ar-rating__star' + (filled ? ' ar-rating__star--filled' : ''),
                        icon: filled ? this.fullIcon() : this.unfilledIcon(),
                    });
                }
                return out;
            };
            this.onStarClick = (star: Interfaces.Star) => {
                if (this.isReadonly() || this.isDisabled())
                    return;
                this.setAttribute('value', String(star.index));
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { value: star.index },
                }));
            };
            this.template = html `
            <button :class="s.cls"
                    a-for="s in this.stars()"
                    :disabled="this.isDisabled()"
                    @click="(e) => this.onStarClick(s)">{{ s.icon }}</button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Rating.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Rating.DefaultSheet();
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

        /** @name        max
         *  @public
         *  @type        {number}
         *  @description Component member for max.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get max(): number { return parseInt(this.getAttribute('max') ?? '5', 10); }

        /** @name        max
         *  @public
         *  @type        {void}
         *  @description Component member for max.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set max(v: number) { this.setAttribute('max', String(v)); }

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
        set value(v: number) { this.setAttribute('value', String(v)); }

        /** @name        maxVal
         *  @private
         *  @type        {() => number}
         *  @description Component member for max Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private maxVal: () => number = () => 5;

        /** @name        currentVal
         *  @private
         *  @type        {() => number}
         *  @description Component member for current Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private currentVal: () => number = () => 0;

        /** @name        isReadonly
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Readonly.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isReadonly: () => boolean = () => false;

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        fullIcon
         *  @private
         *  @type        {() => string}
         *  @description Component member for full Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private fullIcon: () => string = () => '★';

        /** @name        unfilledIcon
         *  @private
         *  @type        {() => string}
         *  @description Component member for unfilled Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private unfilledIcon: () => string = () => '☆';

        /** @name        stars
         *  @private
         *  @type        {() => Rating.Interfaces.Star[]}
         *  @description Component member for stars.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private stars: () => Interfaces.Star[] = () => [];

        /** @name        onStarClick
         *  @private
         *  @type        {(s: Rating.Interfaces.Star) => void}
         *  @description Component member for on Star Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onStarClick: (s: Interfaces.Star) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Rating.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Rating.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'inline-flex', gap: '2px' }),
                new Rule('.ar-rating__star', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-border, #d8d8d8)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0 2px',
                    transition: 'color 0.14s ease, transform 0.14s ease',
                }),
                new Rule('.ar-rating__star--filled', { color: '#f5a623' }),
                new Rule('.ar-rating__star:hover:not(:disabled)', { transform: 'scale(1.15)' }),
                new Rule('.ar-rating__star:disabled', { cursor: 'not-allowed', opacity: '0.5' }),
            ]);
        }
    }
}
export default Rating;

export type RatingOptions = Rating.Interfaces.RatingOptions;
