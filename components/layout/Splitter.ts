/**
 * @module    components/layout/Splitter
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Splitter component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Splitter
 *  @public
 *  @description Namespace containing Splitter contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Splitter
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
        /** @interface   SplitterOptions
         *  @public
         *  @description SplitterOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SplitterOptions
        {
            /** @name        direction
             *  @public
             *  @type        {'horizontal' | 'vertical'}
             *  @description Component member for direction.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            direction?: 'horizontal' | 'vertical';

            /** @name        ratio
             *  @public
             *  @type        {number}
             *  @description Component member for ratio.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ratio?: number;

            /** @name        minA
             *  @public
             *  @type        {number}
             *  @description Component member for min A.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minA?: number;

            /** @name        minB
             *  @public
             *  @type        {number}
             *  @description Component member for min B.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minB?: number;
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

    /** @class       Splitter
     *  @public
     *  @description AriannA Splitter component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-splitter', {}, {
        Attributes: ['direction', 'ratio', 'min-a', 'min-b'],
    })
    export class Splitter extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Splitter.Interfaces.SplitterOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.SplitterOptions = {})
        {
            /** @name        direction
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned direction value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const direction = this.signal().attribute('direction');

            /** @name        ratio
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ratio value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ratio = this.signal().attribute('ratio');

            /** @name        clampedRatio
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clampedRatio value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clampedRatio = (): number => {
                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = parseFloat(ratio.Get() ?? '0.5');
                return Math.max(0.05, Math.min(0.95, Number.isFinite(r) ? r : 0.5));
            };
            this.paneAStyle = (): Record<string, string> => {
                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = clampedRatio() * 100;

                /** @name        dir
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dir value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dir = direction.Get() ?? 'horizontal';
                return dir === 'horizontal' ? { width: r + '%' } : { height: r + '%' };
            };
            this.paneBStyle = (): Record<string, string> => {
                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = (1 - clampedRatio()) * 100;

                /** @name        dir
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dir value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const dir = direction.Get() ?? 'horizontal';
                return dir === 'horizontal' ? { width: r + '%' } : { height: r + '%' };
            };
            this.onHandleDown = (e: MouseEvent) => {
                e.preventDefault();

                /** @name        isH
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isH value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isH = (direction.Get() ?? 'horizontal') === 'horizontal';

                /** @name        rect
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned rect value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const rect = this.getBoundingClientRect();

                /** @name        minA
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned minA value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const minA = parseInt(this.getAttribute('min-a') ?? '60', 10) || 60;

                /** @name        minB
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned minB value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const minB = parseInt(this.getAttribute('min-b') ?? '60', 10) || 60;

                /** @name        move
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned move value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const move = (e2: MouseEvent) => {
                    /** @name        total
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned total value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const total = isH ? rect.width : rect.height;

                    /** @name        offset
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned offset value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const offset = isH ? e2.clientX - rect.left : e2.clientY - rect.top;

                    /** @name        newR
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned newR value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const newR = Math.max(minA / total, Math.min(1 - minB / total, offset / total));
                    this.setAttribute('ratio', String(newR));
                    this.dispatchEvent(new CustomEvent('arianna:resize', {
                        bubbles: true, detail: { ratio: newR },
                    }));
                };

                /** @name        up
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned up value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            };
            this.template = html `
            <div class="ar-splitter__pane ar-splitter__pane--a" :style="this.paneAStyle()">
                <slot name="pane-a"></slot>
            </div>
            <div class="ar-splitter__handle" @mousedown="this.onHandleDown"></div>
            <div class="ar-splitter__pane ar-splitter__pane--b" :style="this.paneBStyle()">
                <slot name="pane-b"></slot>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Splitter.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Splitter.DefaultSheet();
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

        /** @name        direction
         *  @public
         *  @type        {'horizontal' | 'vertical'}
         *  @description Component member for direction.
         *  @returns     {'horizontal' | 'vertical'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get direction(): 'horizontal' | 'vertical' { return (this.getAttribute('direction') ?? 'horizontal') as never; }

        /** @name        direction
         *  @public
         *  @type        {void}
         *  @description Component member for direction.
         *  @param       {'horizontal' | 'vertical'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set direction(v: 'horizontal' | 'vertical') { this.setAttribute('direction', v); }

        /** @name        ratio
         *  @public
         *  @type        {number}
         *  @description Component member for ratio.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get ratio(): number { return parseFloat(this.getAttribute('ratio') ?? '0.5'); }

        /** @name        ratio
         *  @public
         *  @type        {void}
         *  @description Component member for ratio.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set ratio(v: number) { this.setAttribute('ratio', String(Math.max(0.05, Math.min(0.95, v)))); }

        /** @name        minA
         *  @public
         *  @type        {number}
         *  @description Component member for min A.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get minA(): number { return parseInt(this.getAttribute('min-a') ?? '60', 10); }

        /** @name        minA
         *  @public
         *  @type        {void}
         *  @description Component member for min A.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set minA(v: number) { this.setAttribute('min-a', String(v)); }

        /** @name        minB
         *  @public
         *  @type        {number}
         *  @description Component member for min B.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get minB(): number { return parseInt(this.getAttribute('min-b') ?? '60', 10); }

        /** @name        minB
         *  @public
         *  @type        {void}
         *  @description Component member for min B.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set minB(v: number) { this.setAttribute('min-b', String(v)); }

        /** @name        paneAStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for pane AStyle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private paneAStyle: () => Record<string, string> = () => ({});

        /** @name        paneBStyle
         *  @private
         *  @type        {() => Record<string, string>}
         *  @description Component member for pane BStyle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private paneBStyle: () => Record<string, string> = () => ({});

        /** @name        onHandleDown
         *  @private
         *  @type        {(e: MouseEvent) => void}
         *  @description Component member for on Handle Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onHandleDown: (e: MouseEvent) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Splitter.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Splitter.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }),
                new Rule(':host([direction="vertical"])', { flexDirection: 'column' }),
                new Rule(':host(:not([direction]))', { flexDirection: 'row' }),
                new Rule('.ar-splitter__pane', {
                    overflow: 'auto',
                    flexShrink: '0',
                    flexGrow: '0',
                    minWidth: '0',
                    minHeight: '0',
                    boxSizing: 'border-box',
                    position: 'relative',
                }),
                new Rule('.ar-splitter__handle', {
                    background: 'var(--arianna-border, #d8d8d8)',
                    flexShrink: '0',
                    transition: 'background 0.18s ease',
                }),
                new Rule('.ar-splitter__handle:hover, .ar-splitter__handle:active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule(':host([direction="horizontal"]) .ar-splitter__handle', { cursor: 'col-resize', width: '4px' }),
                new Rule(':host(:not([direction])) .ar-splitter__handle', { cursor: 'col-resize', width: '4px' }),
                new Rule(':host([direction="vertical"]) .ar-splitter__handle', { cursor: 'row-resize', height: '4px' }),
            ]);
        }
    }
}
export default Splitter;

export type SplitterOptions = Splitter.Interfaces.SplitterOptions;
