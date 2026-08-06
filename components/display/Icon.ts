/**
 * @module    components/display/Icon
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Icon component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Icon
 *  @public
 *  @description Namespace containing Icon contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Icon
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
        /** @interface   IconOptions
         *  @public
         *  @description IconOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface IconOptions
        {
            /** @name        src
             *  @public
             *  @type        {string}
             *  @description Component member for src.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            src?: string;

            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number;

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;
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

    /** @class       Icon
     *  @public
     *  @description AriannA Icon component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-icon', {}, {
        Attributes: ['src', 'size', 'color'],
    })
    export class Icon extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Icon.Interfaces.IconOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.IconOptions = {})
        {
            this.setAttribute('aria-hidden', 'true');

            /** @name        src
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned src value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const src = this.signal().attribute('src');

            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = this.signal().attribute('size');

            /** @name        color
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned color value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const color = this.signal().attribute('color');
            // Sizing + color reflected on host inline style
            /** @name        applyStyle
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned applyStyle value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const applyStyle = () => {
                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = parseInt(size.Get() ?? '', 10);
                if (Number.isFinite(s) && s > 0)
                {
                    this.style.fontSize = s + 'px';
                    this.style.width = s + 'px';
                    this.style.height = s + 'px';
                }
                else
                {
                    this.style.fontSize = '';
                    this.style.width = '';
                    this.style.height = '';
                }

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = color.Get();
                this.style.color = c ?? '';
            };
            applyStyle();
            this.addEventListener('arianna:attr-size', applyStyle);
            this.addEventListener('arianna:attr-color', applyStyle);
            this.isSvg = () => (src.Get() ?? '').trimStart().startsWith('<');
            this.isText = () => !!src.Get() && !this.isSvg();
            this.isSlotted = () => !src.Get();
            this.svgHtml = () => src.Get() ?? '';
            this.textGlyph = () => src.Get() ?? '';
            this.template = html `
            <span a-if="this.isSvg()" a-html="this.svgHtml()"></span>
            <span a-if="this.isText()">{{ this.textGlyph() }}</span>
            <slot a-if="this.isSlotted()"></slot>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Icon.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Icon.DefaultSheet();
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

        /** @name        src
         *  @public
         *  @type        {string}
         *  @description Component member for src.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get src(): string { return this.getAttribute('src') ?? ''; }

        /** @name        src
         *  @public
         *  @type        {void}
         *  @description Component member for src.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set src(v: string) { v ? this.setAttribute('src', v) : this.removeAttribute('src'); }

        /** @name        size
         *  @public
         *  @type        {number}
         *  @description Component member for size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): number { return parseInt(this.getAttribute('size') ?? '', 10); }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: number) { this.setAttribute('size', String(v)); }

        /** @name        color
         *  @public
         *  @type        {string}
         *  @description Component member for color.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get color(): string { return this.getAttribute('color') ?? ''; }

        /** @name        color
         *  @public
         *  @type        {void}
         *  @description Component member for color.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set color(v: string) { v ? this.setAttribute('color', v) : this.removeAttribute('color'); }

        /** @name        isSvg
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Svg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSvg: () => boolean = () => false;

        /** @name        isText
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isText: () => boolean = () => false;

        /** @name        isSlotted
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Slotted.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSlotted: () => boolean = () => true;

        /** @name        svgHtml
         *  @private
         *  @type        {() => string}
         *  @description Component member for svg Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private svgHtml: () => string = () => '';

        /** @name        textGlyph
         *  @private
         *  @type        {() => string}
         *  @description Component member for text Glyph.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private textGlyph: () => string = () => '';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Icon.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Icon.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    display: 'inline-flex',
                    flexShrink: '0',
                    justifyContent: 'center',
                    lineHeight: '1',
                }),
                new Rule(':host svg', {
                    height: '1em',
                    width: '1em',
                }),
            ]);
        }
    }
}
export default Icon;

export type IconOptions = Icon.Interfaces.IconOptions;
