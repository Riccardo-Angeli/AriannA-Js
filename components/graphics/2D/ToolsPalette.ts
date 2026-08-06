/**
 * @module    components/graphics/2D/ToolsPalette
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ToolsPalette component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   ToolsPalette
 *  @public
 *  @description Namespace containing ToolsPalette contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ToolsPalette
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
        /** @interface   PaletteTool
         *  @public
         *  @description PaletteTool contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PaletteTool
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;

            /** @name        shortcut
             *  @public
             *  @type        {string}
             *  @description Component member for shortcut.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            shortcut?: string;

            /** @name        behaviour
             *  @public
             *  @type        {'tool' | 'action'}
             *  @description Component member for behaviour.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            behaviour: 'tool' | 'action';
        }

        /** @interface   ToolsPaletteOptions
         *  @public
         *  @description ToolsPaletteOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ToolsPaletteOptions
        {
            /** @name        activeTool
             *  @public
             *  @type        {string}
             *  @description Component member for active Tool.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            activeTool?: string;

            /** @name        layout
             *  @public
             *  @type        {'vertical' | 'horizontal'}
             *  @description Component member for layout.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            layout?: 'vertical' | 'horizontal';

            /** @name        showShortcuts
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Shortcuts.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showShortcuts?: boolean;
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

    /** @name        BUILTIN
     *  @public
     *  @type        {ToolsPalette.Interfaces.PaletteTool[]}
     *  @description Namespace-owned BUILTIN value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const BUILTIN: Interfaces.PaletteTool[] = [
        { id: 'select', label: 'Select', icon: '↖', shortcut: 'V', behaviour: 'tool' },
        { id: 'pan', label: 'Pan', icon: '✋', shortcut: 'H', behaviour: 'tool' },
        { id: 'zoom', label: 'Zoom', icon: '🔍', shortcut: 'Z', behaviour: 'tool' },
        { id: 'rotate', label: 'Rotate', icon: '↻', shortcut: 'E', behaviour: 'tool' },
        { id: 'scale', label: 'Scale', icon: '⤢', shortcut: 'S', behaviour: 'tool' },
        { id: 'eyedropper', label: 'Eyedropper', icon: '💧', shortcut: 'I', behaviour: 'tool' },
        { id: 'measure', label: 'Measure', icon: '📏', shortcut: 'M', behaviour: 'tool' },
        { id: 'undo', label: 'Undo', icon: '↶', shortcut: 'Z', behaviour: 'action' },
        { id: 'redo', label: 'Redo', icon: '↷', shortcut: 'Y', behaviour: 'action' },
        { id: 'delete', label: 'Delete', icon: '🗑', shortcut: 'Delete', behaviour: 'action' },
    ];

    /** @class       ToolsPalette
     *  @public
     *  @description AriannA ToolsPalette component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-tools-palette', {}, {
        Attributes: ['active-tool', 'layout', 'show-shortcuts'],
    })
    export class ToolsPalette extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        tools$
         *  @public
         *  @type        {ToolsPalette.Types.Signal<ToolsPalette.Interfaces.PaletteTool[]>}
         *  @description Component member for tools$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        tools$: Types.Signal<Interfaces.PaletteTool[]> = signal<Interfaces.PaletteTool[]>(BUILTIN.slice());

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ToolsPalette.Interfaces.ToolsPaletteOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ToolsPaletteOptions = {})
        {
            /** @name        layoutAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned layoutAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const layoutAttr = this.signal().attribute('layout');

            /** @name        activeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned activeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const activeAttr = this.signal().attribute('active-tool');
            this.layoutCls = () => 'ar-tp ar-tp--' + (layoutAttr.Get() ?? 'vertical');
            this.showShortcuts = () => this.getAttribute('show-shortcuts') !== 'false';
            this.buttons = () => this.tools$.Get().map((t: any) => ({
                id: t.id,
                icon: t.icon,
                title: this.showShortcuts() && t.shortcut ? `${t.label} (${t.shortcut})` : t.label,
                behaviour: t.behaviour,
                cls: 'ar-tp__btn'
                    + (activeAttr.Get() === t.id && t.behaviour === 'tool' ? ' ar-tp__btn--active' : ''),
            }));
            this.onBtnClick = (e: Event) => {
                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = e.currentTarget as HTMLButtonElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = btn.dataset.id;

                /** @name        behaviour
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned behaviour value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const behaviour = btn.dataset.behaviour;
                if (!id || !behaviour)
                    return;
                if (behaviour === 'tool')
                    this.setTool(id);
                else
                    this.dispatchEvent(new CustomEvent('arianna:action', {
                        bubbles: true, detail: { action: id },
                    }));
            };
            this.template = html `
            <div :class="this.layoutCls()">
                <button type="button" a-for="b in this.buttons()"
                        :class="b.cls" :title="b.title"
                        :data-id="b.id" :data-behaviour="b.behaviour"
                        @click="this.onBtnClick">{{ b.icon }}</button>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ToolsPalette.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ToolsPalette.DefaultSheet();
        }

        /** @name        setTool
         *  @public
         *  @type        {this}
         *  @description Component member for set Tool.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setTool(id: string): this
        {
            /** @name        t
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned t value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const t = this.tools$.Get().find((x: any) => x.id === id);
            if (!t || t.behaviour !== 'tool')
                return this;
            this.setAttribute('active-tool', id);
            this.dispatchEvent(new CustomEvent('arianna:tool', {
                bubbles: true, detail: { tool: id },
            }));
            return this;
        }

        /** @name        getTool
         *  @public
         *  @type        {string | null}
         *  @description Component member for get Tool.
         *  @returns     {string | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getTool(): string | null { return this.getAttribute('active-tool'); }

        /** @name        setTools
         *  @public
         *  @type        {this}
         *  @description Component member for set Tools.
         *  @param       {ToolsPalette.Interfaces.PaletteTool[]} tools Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setTools(tools: Interfaces.PaletteTool[]): this { this.tools$.Set(tools); return this; }

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

        /** @name        layoutCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for layout Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private layoutCls: () => string = () => '';

        /** @name        showShortcuts
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Shortcuts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showShortcuts: () => boolean = () => true;

        /** @name        buttons
         *  @private
         *  @type        {() => Array<{
            id: string;
            icon: string;
            title: string;
            behaviour: string;
            cls: string;
        }>}
         *  @description Component member for buttons.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private buttons: () => Array<{
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title: string;

            /** @name        behaviour
             *  @public
             *  @type        {string}
             *  @description Component member for behaviour.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            behaviour: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }> = () => [];

        /** @name        onBtnClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Btn Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onBtnClick: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ToolsPalette.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ToolsPalette.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'inline-block' }),
                new Rule('.ar-tp', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display: 'flex',
                    padding: '4px',
                    gap: '3px',
                }),
                new Rule('.ar-tp--vertical', { flexDirection: 'column' }),
                new Rule('.ar-tp--horizontal', { flexDirection: 'row' }),
                new Rule('.ar-tp__btn', {
                    width: '32px', height: '32px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    fontSize: '15px',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'background 0.08s',
                }),
                new Rule('.ar-tp__btn:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-tp__btn--active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                }),
            ]);
        }
    }
}
export default ToolsPalette;

export type PaletteTool = ToolsPalette.Interfaces.PaletteTool;
export type ToolsPaletteOptions = ToolsPalette.Interfaces.ToolsPaletteOptions;
