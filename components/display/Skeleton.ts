/**
 * @module    components/display/Skeleton
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Skeleton component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Skeleton
 *  @public
 *  @description Namespace containing Skeleton contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Skeleton
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
        /** @interface   SkeletonOptions
         *  @public
         *  @description SkeletonOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SkeletonOptions
        {
            /** @name        variant
             *  @public
             *  @type        {'text' | 'rect' | 'circle' | 'card'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'text' | 'rect' | 'circle' | 'card';

            /** @name        lines
             *  @public
             *  @type        {number}
             *  @description Component member for lines.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lines?: number;

            /** @name        avatar
             *  @public
             *  @type        {boolean}
             *  @description Component member for avatar.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            avatar?: boolean;

            /** @name        width
             *  @public
             *  @type        {string}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: string;

            /** @name        height
             *  @public
             *  @type        {string}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: string;
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

    /** @class       Skeleton
     *  @public
     *  @description AriannA Skeleton component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-skeleton', {}, {
        Attributes: ['variant', 'lines', 'avatar', 'width', 'height'],
    })
    export class Skeleton extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Skeleton.Interfaces.SkeletonOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.SkeletonOptions = {})
        {
            /** @name        variant
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned variant value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const variant = this.signal().attribute('variant');

            /** @name        lines
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lines value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lines = this.signal().attribute('lines');

            /** @name        width
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned width value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const width = this.signal().attribute('width');

            /** @name        height
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned height value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const height = this.signal().attribute('height');
            this.variantIs = (name: string) => (variant.Get() ?? 'text') === name;
            this.hasAvatar = () => this.hasAttribute('avatar');
            this.linesArr = () => {
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = parseInt(lines.Get() ?? '3', 10) || 3;
                return Array.from({ length: n }, (_, i) => ({ index: i, last: i === n - 1 }));
            };
            this.lineStyle = (last: boolean): Record<string, string> => last ? { width: '60%' } : {};
            this.circleStyle = (): Record<string, string> => {
                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = width.Get();

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = height.Get() || w;
                if (!w)
                    return {};

                /** @name        out
                 *  @public
                 *  @type        {Record<string, string>}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Record<string, string> = { width: w };
                if (h)
                    out.height = h;
                return out;
            };
            this.rectStyle = () => {
                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = width.Get();

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = height.Get();

                /** @name        out
                 *  @public
                 *  @type        {Record<string, string>}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: Record<string, string> = {};
                if (w)
                    out.width = w;
                if (h)
                    out.height = h;
                return out;
            };
            this.template = html `
            <div class="ar-skeleton__circle" a-if="this.variantIs('circle')" :style="this.circleStyle()"></div>
            <div class="ar-skeleton__rect"   a-if="this.variantIs('rect')"   :style="this.rectStyle()"></div>

            <div a-if="this.variantIs('card')">
                <div class="ar-skeleton__rect" style="height:160px"></div>
                <div class="ar-skeleton__line" a-for="i in [1,2,3]"></div>
            </div>

            <div class="ar-skeleton__row" a-if="this.variantIs('text') && this.hasAvatar()">
                <div class="ar-skeleton__circle"></div>
                <div class="ar-skeleton__lines">
                    <div class="ar-skeleton__line"></div>
                    <div class="ar-skeleton__line" style="width:60%"></div>
                </div>
            </div>

            <div a-if="this.variantIs('text') && !this.hasAvatar()">
                <div class="ar-skeleton__line" a-for="line in this.linesArr()" :style="this.lineStyle(line.last)"></div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Skeleton.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Skeleton.DefaultSheet();
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
         *  @type        {string}
         *  @description Component member for variant.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): string { return this.getAttribute('variant') ?? 'text'; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: string) { this.setAttribute('variant', v); }

        /** @name        lines
         *  @public
         *  @type        {number}
         *  @description Component member for lines.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get lines(): number { return parseInt(this.getAttribute('lines') ?? '3', 10); }

        /** @name        lines
         *  @public
         *  @type        {void}
         *  @description Component member for lines.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set lines(v: number) { this.setAttribute('lines', String(v)); }

        /** @name        avatar
         *  @public
         *  @type        {boolean}
         *  @description Component member for avatar.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get avatar(): boolean { return this.hasAttribute('avatar'); }

        /** @name        avatar
         *  @public
         *  @type        {void}
         *  @description Component member for avatar.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set avatar(v: boolean) { v ? this.setAttribute('avatar', '') : this.removeAttribute('avatar'); }

        /** @name        width
         *  @public
         *  @type        {string}
         *  @description Component member for width.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get width(): string { return this.getAttribute('width') ?? ''; }

        /** @name        width
         *  @public
         *  @type        {void}
         *  @description Component member for width.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set width(v: string) { v ? this.setAttribute('width', v) : this.removeAttribute('width'); }

        /** @name        height
         *  @public
         *  @type        {string}
         *  @description Component member for height.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get height(): string { return this.getAttribute('height') ?? ''; }

        /** @name        height
         *  @public
         *  @type        {void}
         *  @description Component member for height.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set height(v: string) { v ? this.setAttribute('height', v) : this.removeAttribute('height'); }

        /** @name        variantIs
         *  @private
         *  @type        {(n: string) => boolean}
         *  @description Component member for variant Is.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private variantIs: (n: string) => boolean = () => false;

        /** @name        hasAvatar
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Avatar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasAvatar: () => boolean = () => false;

        /** @name        linesArr
         *  @private
         *  @type        {() => Array<{
            index: number;
            last: boolean;
        }>}
         *  @description Component member for lines Arr.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private linesArr: () => Array<{
            /** @name        index
             *  @public
             *  @type        {number}
             *  @description Component member for index.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            index: number;

            /** @name        last
             *  @public
             *  @type        {boolean}
             *  @description Component member for last.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            last: boolean;
        }> = () => [];

        /** @name        lineStyle
         *  @private
         *  @type        {(last: boolean) => Record<string, string>}
         *  @description Component member for line Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private lineStyle: (last: boolean) => Record<string, string> = () => ({});

        /** @name        circleStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for circle Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private circleStyle: () => Record<string, string> = () => ({});

        /** @name        rectStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for rect Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private rectStyle: () => Record<string, string> = () => ({});

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Skeleton.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Skeleton.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '8px' }),
                new Rule('.ar-skeleton__row', { display: 'flex', alignItems: 'center', gap: '12px' }),
                new Rule('.ar-skeleton__lines', { flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }),
                new Rule('.ar-skeleton__line, .ar-skeleton__rect, .ar-skeleton__circle', {
                    animation: 'ar-shimmer 1.5s infinite ease-in-out',
                    background: 'linear-gradient(90deg, var(--arianna-bg-3, #f3f3f3) 25%, var(--arianna-bg-4, #e5e5e5) 50%, var(--arianna-bg-3, #f3f3f3) 75%)',
                    backgroundSize: '200% 100%',
                    borderRadius: 'var(--arianna-radius, 6px)',
                }),
                new Rule('.ar-skeleton__line', { height: '12px', width: '100%' }),
                new Rule('.ar-skeleton__rect', { height: '80px', width: '100%' }),
                new Rule('.ar-skeleton__circle', { borderRadius: '50%', flexShrink: '0', height: '40px', width: '40px' }),
                new Rule('@keyframes ar-shimmer', {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                } as never),
            ]);
        }
    }
}
export default Skeleton;

export type SkeletonOptions = Skeleton.Interfaces.SkeletonOptions;
