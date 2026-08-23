/**
 * @module    components/payments/CreditCard
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA CreditCard component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   CreditCard
 *  @public
 *  @description Namespace containing CreditCard contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace CreditCard
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

        /** @name        CardBrand
         *  @public
         *  @type        {'visa' | 'mastercard' | 'amex' | 'discover' | 'maestro' | 'diners' | 'jcb' | 'unionpay' | 'cartesbancaires' | 'mada' | 'unknown'}
         *  @description Type alias for CardBrand.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'maestro' | 'diners' | 'jcb' | 'unionpay' | 'cartesbancaires' | 'mada' | 'unknown';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   CardData
         *  @public
         *  @description CardData contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CardData
        {
            /** @name        number
             *  @public
             *  @type        {string}
             *  @description Component member for number.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            number: string;

            /** @name        holder
             *  @public
             *  @type        {string}
             *  @description Component member for holder.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            holder?: string;

            /** @name        expMonth
             *  @public
             *  @type        {number}
             *  @description Component member for exp Month.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expMonth: number;

            /** @name        expYear
             *  @public
             *  @type        {number}
             *  @description Component member for exp Year.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expYear: number;

            /** @name        cvv
             *  @public
             *  @type        {string}
             *  @description Component member for cvv.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cvv: string;

            /** @name        brand
             *  @public
             *  @type        {CreditCard.Types.CardBrand}
             *  @description Component member for brand.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            brand: Types.CardBrand;

            /** @name        save
             *  @public
             *  @type        {boolean}
             *  @description Component member for save.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            save?: boolean;
        }

        /** @interface   CreditCardOptions
         *  @public
         *  @description CreditCardOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CreditCardOptions
        {
            /** @name        amount
             *  @public
             *  @type        {number}
             *  @description Component member for amount.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            amount: number;

            /** @name        currency
             *  @public
             *  @type        {string}
             *  @description Component member for currency.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            currency: string;

            /** @name        saveOption
             *  @public
             *  @type        {boolean}
             *  @description Component member for save Option.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            saveOption?: boolean;

            /** @name        holderNameRequired
             *  @public
             *  @type        {boolean}
             *  @description Component member for holder Name Required.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            holderNameRequired?: boolean;
        }

        /** @interface   CardFormState
         *  @public
         *  @description CardFormState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CardFormState
        {
            /** @name        number
             *  @public
             *  @type        {string}
             *  @description Component member for number.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            number: string;

            /** @name        holder
             *  @public
             *  @type        {string}
             *  @description Component member for holder.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            holder: string;

            /** @name        expMonth
             *  @public
             *  @type        {string}
             *  @description Component member for exp Month.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expMonth: string;

            /** @name        expYear
             *  @public
             *  @type        {string}
             *  @description Component member for exp Year.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            expYear: string;

            /** @name        cvv
             *  @public
             *  @type        {string}
             *  @description Component member for cvv.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cvv: string;

            /** @name        save
             *  @public
             *  @type        {boolean}
             *  @description Component member for save.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            save: boolean;

            /** @name        flipped
             *  @public
             *  @type        {boolean}
             *  @description Component member for flipped.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            flipped: boolean;
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
    // ── Brand detection (BIN-based) ────────────────────────────────────────────
    /** @name        BRAND_PATTERNS
     *  @public
     *  @type        {Array<{
        brand: CreditCard.Types.CardBrand;
        re: RegExp;
        lengths: number[];
        cvvLen: number;
    }>}
     *  @description Namespace-owned BRAND_PATTERNS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const BRAND_PATTERNS: Array<{
        /** @name        brand
         *  @public
         *  @type        {CreditCard.Types.CardBrand}
         *  @description Component member for brand.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        brand: Types.CardBrand;

        /** @name        re
         *  @public
         *  @type        {RegExp}
         *  @description Component member for re.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        re: RegExp;

        /** @name        lengths
         *  @public
         *  @type        {number[]}
         *  @description Component member for lengths.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        lengths: number[];

        /** @name        cvvLen
         *  @public
         *  @type        {number}
         *  @description Component member for cvv Len.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        cvvLen: number;
    }> = [
        { brand: 'amex', re: /^3[47]/, lengths: [15], cvvLen: 4 },
        { brand: 'mastercard', re: /^(5[1-5]|2[2-7])/, lengths: [16], cvvLen: 3 },
        { brand: 'visa', re: /^4/, lengths: [13, 16, 19], cvvLen: 3 },
        { brand: 'discover', re: /^6(?:011|5)/, lengths: [16], cvvLen: 3 },
        { brand: 'diners', re: /^3(?:0[0-5]|[68])/, lengths: [14, 16, 19], cvvLen: 3 },
        { brand: 'jcb', re: /^35/, lengths: [16, 19], cvvLen: 3 },
        { brand: 'unionpay', re: /^62/, lengths: [16, 17, 18, 19], cvvLen: 3 },
        { brand: 'maestro', re: /^(50|5[6-9]|6)/, lengths: [12, 13, 14, 15, 16, 17, 18, 19], cvvLen: 3 },
        { brand: 'cartesbancaires', re: /^4[0-9]{5}/, lengths: [16], cvvLen: 3 },
        { brand: 'mada', re: /^(440533|446672)/, lengths: [16], cvvLen: 3 },
    ];
    export function detectBrand(num: string): {
        /** @name        brand
         *  @public
         *  @type        {CreditCard.Types.CardBrand}
         *  @description Component member for brand.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        brand: Types.CardBrand;

        /** @name        lengths
         *  @public
         *  @type        {number[]}
         *  @description Component member for lengths.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        lengths: number[];

        /** @name        cvvLen
         *  @public
         *  @type        {number}
         *  @description Component member for cvv Len.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        cvvLen: number;
    } {
        /** @name        stripped
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned stripped value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const stripped = num.replace(/\D/g, '');
        for (const p of BRAND_PATTERNS)
        {
            if (p.re.test(stripped))
                return { brand: p.brand, lengths: p.lengths, cvvLen: p.cvvLen };
        }
        return { brand: 'unknown', lengths: [13, 14, 15, 16, 17, 18, 19], cvvLen: 3 };
    }
    export function luhnCheck(num: string): boolean {
        /** @name        s
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned s value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const s = num.replace(/\D/g, '');
        if (s.length < 12)
            return false;

        /** @name        sum
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned sum value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let sum = 0, alt = false;
        for (let i = s.length - 1; i >= 0; i--)
        {
            /** @name        n
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned n value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let n = parseInt(s[i]!, 10);
            if (alt)
            {
                n *= 2;
                if (n > 9)
                    n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 === 0;
    }
    export function formatCardNumber(num: string, brand: Types.CardBrand): string {
        /** @name        s
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned s value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const s = num.replace(/\D/g, '').slice(0, 19);
        if (brand === 'amex')
        {
            // 4-6-5
            return s.replace(/^(\d{4})(\d{0,6})(\d{0,5}).*$/, (_m, a, b, c) => [a, b, c].filter(Boolean).join(' '));
        }
        return s.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }

    /** @name        DetectBrand
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned DetectBrand value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function DetectBrand
    (
        num: string
    ): ReturnType<typeof detectBrand>
    {
        return detectBrand(num);
    }

    /** @name        LuhnCheck
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned LuhnCheck value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function LuhnCheck(num: string): boolean
    {
        return luhnCheck(num);
    }

    /** @name        FormatCardNumber
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned FormatCardNumber value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function FormatCardNumber
    (
        num   : string,
        brand : Types.CardBrand
    ): string
    {
        return formatCardNumber(num, brand);
    }

    /** @class       CreditCard
     *  @public
     *  @description AriannA CreditCard component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-credit-card', {}, {
        Attributes: ['amount', 'currency', 'save-option', 'holder-name-required'],
    })
    export class CreditCard extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        form$
         *  @public
         *  @type        {CreditCard.Types.Signal<CreditCard.Interfaces.CardFormState>}
         *  @description Component member for form$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        form$: Types.Signal<Interfaces.CardFormState> = signal<Interfaces.CardFormState>({
            number: '', holder: '', expMonth: '', expYear: '', cvv: '',
            save: false, flipped: false,
        });

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {CreditCard.Interfaces.CreditCardOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.CreditCardOptions = {} as Interfaces.CreditCardOptions)
        {
            /** @name        amountAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned amountAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const amountAttr = this.signal().attribute('amount');

            /** @name        currencyAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned currencyAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const currencyAttr = this.signal().attribute('currency');
            this.brandInfo = () => detectBrand(this.form$.Get().number);
            this.brand = (): Types.CardBrand => this.brandInfo().brand;
            this.numberDisplay = () => {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = this.form$.Get();
                return formatCardNumber(f.number, this.brand());
            };
            this.cvvMaxLen = () => this.brandInfo().cvvLen;
            this.numberMaxLen = () => {
                /** @name        info
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned info value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const info = this.brandInfo();

                /** @name        maxRaw
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned maxRaw value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const maxRaw = Math.max(...info.lengths);
                // Add space chars for formatting
                return info.brand === 'amex'
                    ? maxRaw + 2
                    : maxRaw + Math.floor(maxRaw / 4);
            };
            this.cardPreviewCls = () => 'ar-cc__preview ar-cc__preview--' + this.brand()
                + (this.form$.Get().flipped ? ' ar-cc__preview--flipped' : '');
            this.previewNumber = () => this.numberDisplay() || '•••• •••• •••• ••••';
            this.previewHolder = () => this.form$.Get().holder.toUpperCase() || 'CARDHOLDER NAME';
            this.previewExp = () => {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = this.form$.Get();
                return (f.expMonth || 'MM') + '/' + (f.expYear || 'YY');
            };
            this.previewBrand = () => this.brand().toUpperCase();
            this.previewCvv = () => this.form$.Get().cvv || '•••';
            this.valid = () => {
                /** @name        f
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned f value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const f = this.form$.Get();

                /** @name        info
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned info value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const info = this.brandInfo();

                /** @name        numRaw
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned numRaw value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const numRaw = f.number.replace(/\D/g, '');
                if (!info.lengths.includes(numRaw.length))
                    return false;
                if (!luhnCheck(numRaw))
                    return false;

                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = parseInt(f.expMonth, 10);

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = parseInt(f.expYear, 10);
                if (!(m >= 1 && m <= 12))
                    return false;
                if (!(y >= 0 && y <= 99))
                    return false;
                if (f.cvv.length !== info.cvvLen)
                    return false;
                if (this.hasAttribute('holder-name-required') && !f.holder.trim())
                    return false;
                return true;
            };
            this.payLabel = () => {
                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = parseFloat(amountAttr.Get() ?? '0') || 0;

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = currencyAttr.Get() ?? 'EUR';
                return `Pay ${c} ${a.toFixed(2)}`;
            };
            // ── Handlers ────────────────────────────────────────────────────
            this.onNumber = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value;

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.form$.Get();
                this.form$.Set({ ...cur, number: v.replace(/\D/g, '').slice(0, 19) });
                this.#fireChange();
            };
            this.onHolder = (e: Event) => {
                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.form$.Get();
                this.form$.Set({ ...cur, holder: (e.target as HTMLInputElement).value });
                this.#fireChange();
            };
            this.onExpMonth = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.form$.Get();
                this.form$.Set({ ...cur, expMonth: v });
                this.#fireChange();
            };
            this.onExpYear = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2);

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.form$.Get();
                this.form$.Set({ ...cur, expYear: v });
                this.#fireChange();
            };
            this.onCvv = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, this.cvvMaxLen());

                /** @name        cur
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cur value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cur = this.form$.Get();
                this.form$.Set({ ...cur, cvv: v });
                this.#fireChange();
            };
            this.onCvvFocus = () => {
                this.form$.Set({ ...this.form$.Get(), flipped: true });
            };
            this.onCvvBlur = () => {
                this.form$.Set({ ...this.form$.Get(), flipped: false });
            };
            this.onSave = (e: Event) => {
                this.form$.Set({ ...this.form$.Get(), save: (e.target as HTMLInputElement).checked });
            };
            this.onSubmit = () => { void this.pay(); };
            this.template = html `
            <div class="ar-cc">
                <div :class="this.cardPreviewCls()">
                    <div class="ar-cc__preview-face ar-cc__preview-front">
                        <div class="ar-cc__preview-brand">{{ this.previewBrand() }}</div>
                        <div class="ar-cc__preview-chip">▦</div>
                        <div class="ar-cc__preview-number">{{ this.previewNumber() }}</div>
                        <div class="ar-cc__preview-row">
                            <div>
                                <div class="ar-cc__preview-meta">HOLDER</div>
                                <div class="ar-cc__preview-holder">{{ this.previewHolder() }}</div>
                            </div>
                            <div>
                                <div class="ar-cc__preview-meta">EXP</div>
                                <div class="ar-cc__preview-exp">{{ this.previewExp() }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="ar-cc__preview-face ar-cc__preview-back">
                        <div class="ar-cc__preview-strip"></div>
                        <div class="ar-cc__preview-cvv-box">{{ this.previewCvv() }}</div>
                    </div>
                </div>
                <div class="ar-cc__form">
                    <label class="ar-cc__field">
                        <span>Card number</span>
                        <input type="text" inputmode="numeric" autocomplete="cc-number"
                               :value="this.numberDisplay()"
                               @input="this.onNumber"/>
                    </label>
                    <label class="ar-cc__field">
                        <span>Cardholder</span>
                        <input type="text" autocomplete="cc-name"
                               :value="this.form$.Get().holder"
                               @input="this.onHolder"/>
                    </label>
                    <div class="ar-cc__row">
                        <label class="ar-cc__field">
                            <span>Month</span>
                            <input type="text" inputmode="numeric" autocomplete="cc-exp-month" placeholder="MM"
                                   :value="this.form$.Get().expMonth"
                                   @input="this.onExpMonth"/>
                        </label>
                        <label class="ar-cc__field">
                            <span>Year</span>
                            <input type="text" inputmode="numeric" autocomplete="cc-exp-year" placeholder="YY"
                                   :value="this.form$.Get().expYear"
                                   @input="this.onExpYear"/>
                        </label>
                        <label class="ar-cc__field">
                            <span>CVV</span>
                            <input type="text" inputmode="numeric" autocomplete="cc-csc"
                                   :value="this.form$.Get().cvv"
                                   @input="this.onCvv"
                                   @focus="this.onCvvFocus"
                                   @blur="this.onCvvBlur"/>
                        </label>
                    </div>
                    <label class="ar-cc__save" a-if="this.hasAttribute('save-option')">
                        <input type="checkbox" :checked="this.form$.Get().save" @change="this.onSave"/>
                        <span>Save this card for future payments</span>
                    </label>
                    <button type="button" class="ar-cc__pay"
                            :disabled="!this.valid()"
                            @click="this.onSubmit">{{ this.payLabel() }}</button>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {CreditCard.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = CreditCard.DefaultSheet();
        }

        /** @name        pay
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for pay.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async pay(): Promise<void>
        {
            if (!this.valid())
            {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true, detail: { method: 'card', message: 'Invalid card details' },
                }));
                return;
            }

            /** @name        f
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned f value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const f = this.form$.Get();

            /** @name        card
             *  @public
             *  @type        {CreditCard.Interfaces.CardData}
             *  @description Namespace-owned card value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const card: Interfaces.CardData = {
                number: f.number.replace(/\D/g, ''),
                holder: f.holder.trim() || undefined,
                expMonth: parseInt(f.expMonth, 10),
                expYear: 2000 + parseInt(f.expYear, 10),
                cvv: f.cvv,
                brand: this.brand(),
                save: f.save,
            };
            this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                bubbles: true, detail: { method: 'card', card },
            }));
        }

        /** @name        getCard
         *  @public
         *  @type        {Partial<CreditCard.Interfaces.CardData>}
         *  @description Component member for get Card.
         *  @returns     {Partial<CreditCard.Interfaces.CardData>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCard(): Partial<Interfaces.CardData>
        {
            /** @name        f
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned f value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const f = this.form$.Get();
            return {
                number: f.number,
                holder: f.holder,
                expMonth: parseInt(f.expMonth, 10),
                expYear: f.expYear ? 2000 + parseInt(f.expYear, 10) : 0,
                cvv: f.cvv,
                brand: this.brand(),
                save: f.save,
            };
        }

        /** @name        #fireChange
         *  @public
         *  @type        {void}
         *  @description Component member for fire Change.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fireChange(): void
        {
            this.dispatchEvent(new CustomEvent('arianna:card-change', {
                bubbles: true, detail: { card: this.getCard(), valid: this.valid() },
            }));
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

        /** @name        brandInfo
         *  @private
         *  @type        {() => {
            brand: CreditCard.Types.CardBrand;
            lengths: number[];
            cvvLen: number;
        }}
         *  @description Component member for brand Info.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private brandInfo: () => {
            /** @name        brand
             *  @public
             *  @type        {CreditCard.Types.CardBrand}
             *  @description Component member for brand.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            brand: Types.CardBrand;

            /** @name        lengths
             *  @public
             *  @type        {number[]}
             *  @description Component member for lengths.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lengths: number[];

            /** @name        cvvLen
             *  @public
             *  @type        {number}
             *  @description Component member for cvv Len.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cvvLen: number;
        } = () => ({ brand: 'unknown', lengths: [16], cvvLen: 3 });

        /** @name        brand
         *  @private
         *  @type        {() => CreditCard.Types.CardBrand}
         *  @description Component member for brand.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private brand: () => Types.CardBrand = () => 'unknown';

        /** @name        numberDisplay
         *  @private
         *  @type        {() => string}
         *  @description Component member for number Display.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private numberDisplay: () => string = () => '';

        /** @name        cvvMaxLen
         *  @private
         *  @type        {() => number}
         *  @description Component member for cvv Max Len.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private cvvMaxLen: () => number = () => 3;

        /** @name        numberMaxLen
         *  @private
         *  @type        {() => number}
         *  @description Component member for number Max Len.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private numberMaxLen: () => number = () => 19;

        /** @name        cardPreviewCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for card Preview Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private cardPreviewCls: () => string = () => 'ar-cc__preview';

        /** @name        previewNumber
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Number.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewNumber: () => string = () => '•••• •••• •••• ••••';

        /** @name        previewHolder
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Holder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewHolder: () => string = () => 'CARDHOLDER NAME';

        /** @name        previewExp
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Exp.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewExp: () => string = () => 'MM/YY';

        /** @name        previewBrand
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Brand.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewBrand: () => string = () => 'CARD';

        /** @name        previewCvv
         *  @private
         *  @type        {() => string}
         *  @description Component member for preview Cvv.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private previewCvv: () => string = () => '•••';

        /** @name        valid
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for valid.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private valid: () => boolean = () => false;

        /** @name        payLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for pay Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private payLabel: () => string = () => 'Pay';

        /** @name        onNumber
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Number.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onNumber: (e: Event) => void = () => { };

        /** @name        onHolder
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Holder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHolder: (e: Event) => void = () => { };

        /** @name        onExpMonth
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Exp Month.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onExpMonth: (e: Event) => void = () => { };

        /** @name        onExpYear
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Exp Year.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onExpYear: (e: Event) => void = () => { };

        /** @name        onCvv
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Cvv.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCvv: (e: Event) => void = () => { };

        /** @name        onCvvFocus
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Cvv Focus.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCvvFocus: (e: Event) => void = () => { };

        /** @name        onCvvBlur
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Cvv Blur.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCvvBlur: (e: Event) => void = () => { };

        /** @name        onSave
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Save.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSave: (e: Event) => void = () => { };

        /** @name        onSubmit
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Submit.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSubmit: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {CreditCard.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {CreditCard.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'inline-block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-cc', {
                    display: 'flex', flexDirection: 'column', gap: '14px',
                    padding: '14px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    width: '320px',
                }),
                new Rule('.ar-cc__preview', {
                    position: 'relative',
                    width: '100%', aspectRatio: '1.586',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                }),
                new Rule('.ar-cc__preview-face', {
                    position: 'absolute', inset: '0',
                    borderRadius: '10px',
                    padding: '16px',
                    color: '#fff',
                    backfaceVisibility: 'hidden',
                    transition: 'transform 0.5s',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                }),
                new Rule('.ar-cc__preview-front', {
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between',
                }),
                new Rule('.ar-cc__preview--visa .ar-cc__preview-front', { background: 'linear-gradient(135deg, #1a1f71 0%, #1e3c8f 100%)' }),
                new Rule('.ar-cc__preview--mastercard .ar-cc__preview-front', { background: 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)' }),
                new Rule('.ar-cc__preview--amex .ar-cc__preview-front', { background: 'linear-gradient(135deg, #2671b9 0%, #006fcf 100%)' }),
                new Rule('.ar-cc__preview--discover .ar-cc__preview-front', { background: 'linear-gradient(135deg, #ff6000 0%, #ff8c00 100%)' }),
                new Rule('.ar-cc__preview--maestro .ar-cc__preview-front', { background: 'linear-gradient(135deg, #0099df 0%, #ed0006 100%)' }),
                new Rule('.ar-cc__preview-back', {
                    transform: 'rotateY(180deg)',
                    display: 'flex', flexDirection: 'column',
                }),
                new Rule('.ar-cc__preview--flipped .ar-cc__preview-front', { transform: 'rotateY(180deg)' }),
                new Rule('.ar-cc__preview--flipped .ar-cc__preview-back', { transform: 'rotateY(360deg)' }),
                new Rule('.ar-cc__preview-brand', { fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em' }),
                new Rule('.ar-cc__preview-chip', { fontSize: '24px', color: '#ffd700' }),
                new Rule('.ar-cc__preview-number', { fontSize: '18px', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.08em' }),
                new Rule('.ar-cc__preview-row', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }),
                new Rule('.ar-cc__preview-meta', { fontSize: '9px', opacity: '0.7', letterSpacing: '0.1em' }),
                new Rule('.ar-cc__preview-holder', { fontSize: '12px', letterSpacing: '0.05em' }),
                new Rule('.ar-cc__preview-exp', { fontSize: '12px', fontFamily: 'ui-monospace, monospace' }),
                new Rule('.ar-cc__preview-strip', { marginTop: '16px', height: '34px', background: '#000' }),
                new Rule('.ar-cc__preview-cvv-box', {
                    marginTop: '12px', alignSelf: 'flex-end',
                    background: '#fff', color: '#000',
                    padding: '4px 12px', borderRadius: '3px',
                    fontFamily: 'ui-monospace, monospace',
                    minWidth: '60px', textAlign: 'right',
                }),
                new Rule('.ar-cc__form', { display: 'flex', flexDirection: 'column', gap: '10px' }),
                new Rule('.ar-cc__field', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-cc__field span', {
                    fontSize: '10px', textTransform: 'uppercase',
                    color: 'var(--arianna-muted, #6e6b62)',
                    letterSpacing: '0.06em',
                }),
                new Rule('.ar-cc__field input', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '8px 10px',
                    font: '13px ui-monospace, monospace',
                    borderRadius: '4px',
                }),
                new Rule('.ar-cc__field input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-cc__row', { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }),
                new Rule('.ar-cc__save', { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }),
                new Rule('.ar-cc__pay', {
                    marginTop: '4px',
                    padding: '11px',
                    background: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                }),
                new Rule('.ar-cc__pay:hover:not(:disabled)', { background: 'var(--arianna-primary-hover, #1858c4)' }),
                new Rule('.ar-cc__pay:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]);
        }
    }
}
export default CreditCard;
