/**
 * @module    components/graphics/2D/LinesPalette2D
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA LinesPalette2D component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/schema/Interfaces.ts';

/** @namespace   LinesPalette2D
 *  @public
 *  @description Namespace containing LinesPalette2D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace LinesPalette2D
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
        /** @interface   LineTool
         *  @public
         *  @description LineTool contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LineTool
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
             *  @type        {'tool' | 'action' | 'to-3d'}
             *  @description Component member for behaviour.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            behaviour: 'tool' | 'action' | 'to-3d';

            /** @name        group
             *  @public
             *  @type        {'draw' | 'close' | 'to-3d'}
             *  @description Component member for group.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            group: 'draw' | 'close' | 'to-3d';
        }

        /** @interface   LinesPalette2DOptions
         *  @public
         *  @description LinesPalette2DOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LinesPalette2DOptions
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

            /** @name        disableHotkeys
             *  @public
             *  @type        {boolean}
             *  @description Component member for disable Hotkeys.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disableHotkeys?: boolean;
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
     *  @type        {LinesPalette2D.Interfaces.LineTool[]}
     *  @description Namespace-owned BUILTIN value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const BUILTIN: Interfaces.LineTool[] = [
        { id: 'line', label: 'Line', icon: '╱', shortcut: 'L', behaviour: 'tool', group: 'draw' },
        { id: 'arc', label: 'Arc', icon: '◜', shortcut: 'A', behaviour: 'tool', group: 'draw' },
        { id: 'polyline', label: 'Polyline', icon: '⌇', shortcut: 'P', behaviour: 'tool', group: 'draw' },
        { id: 'spline', label: 'Spline', icon: '∿', shortcut: 'S', behaviour: 'tool', group: 'draw' },
        { id: 'freehand', label: 'Freehand', icon: '✎', shortcut: 'F', behaviour: 'tool', group: 'draw' },
        { id: 'rect', label: 'Rect', icon: '▭', shortcut: 'R', behaviour: 'tool', group: 'draw' },
        { id: 'ellipse', label: 'Ellipse', icon: '◯', shortcut: 'O', behaviour: 'tool', group: 'draw' },
        { id: 'polygon', label: 'Polygon', icon: '⬡', shortcut: 'G', behaviour: 'tool', group: 'draw' },
        { id: 'close', label: 'Close', icon: '⊙', shortcut: 'C', behaviour: 'action', group: 'close' },
        { id: 'open', label: 'Open', icon: '◌', behaviour: 'action', group: 'close' },
        { id: 'reverse', label: 'Reverse', icon: '⇌', behaviour: 'action', group: 'close' },
        { id: 'extrude', label: 'Extrude', icon: '⬚', behaviour: 'to-3d', group: 'to-3d' },
        { id: 'revolve', label: 'Revolve', icon: '⟳', behaviour: 'to-3d', group: 'to-3d' },
        { id: 'sweep', label: 'Sweep', icon: '↪', behaviour: 'to-3d', group: 'to-3d' },
        { id: 'loft', label: 'Loft', icon: '☷', behaviour: 'to-3d', group: 'to-3d' },
    ];

    /** @class       LinesPalette2D
     *  @public
     *  @description AriannA LinesPalette2D component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-lines-palette-2d', {}, {
        Attributes: ['active-tool', 'layout', 'show-shortcuts', 'disable-hotkeys'],
    })
    export class LinesPalette2D extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        tools$
         *  @public
         *  @type        {LinesPalette2D.Types.Signal<LinesPalette2D.Interfaces.LineTool[]>}
         *  @description Component member for tools$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        tools$: Types.Signal<Interfaces.LineTool[]> = signal<Interfaces.LineTool[]>(BUILTIN.slice());

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {LinesPalette2D.Interfaces.LinesPalette2DOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.LinesPalette2DOptions = {})
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
            this.layoutCls = () => 'ar-lp2d ar-lp2d--' + (layoutAttr.Get() ?? 'vertical');
            this.showShortcuts = () => this.getAttribute('show-shortcuts') !== 'false';

            /** @name        renderGroup
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned renderGroup value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const renderGroup = (group: Interfaces.LineTool['group']) => this.tools$.Get().filter((t: any) => t.group === group).map((t: any) => ({
                id: t.id,
                label: t.label,
                icon: t.icon,
                title: this.showShortcuts() && t.shortcut ? `${t.label} (${t.shortcut})` : t.label,
                cls: 'ar-lp2d__btn'
                    + (activeAttr.Get() === t.id && t.behaviour === 'tool' ? ' ar-lp2d__btn--active' : ''),
                behaviour: t.behaviour,
            }));
            this.drawTools = () => renderGroup('draw');
            this.closeTools = () => renderGroup('close');
            this.to3dTools = () => renderGroup('to-3d');
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
                {
                    this.setTool(id);
                }
                else if (behaviour === 'action')
                {
                    this.dispatchEvent(new CustomEvent('arianna:action', {
                        bubbles: true, detail: { action: id },
                    }));
                }
                else if (behaviour === 'to-3d')
                {
                    this.dispatchEvent(new CustomEvent('arianna:to-3d', {
                        bubbles: true, detail: { kind: id },
                    }));
                }
            };
            this.template = html `
            <div :class="this.layoutCls()">
                <div class="ar-lp2d__group">
                    <div class="ar-lp2d__group-label">Draw</div>
                    <div class="ar-lp2d__group-btns">
                        <button type="button" a-for="t in this.drawTools()"
                                :class="t.cls" :title="t.title"
                                :data-id="t.id" :data-behaviour="t.behaviour"
                                @click="this.onBtnClick">{{ t.icon }}</button>
                    </div>
                </div>
                <div class="ar-lp2d__group">
                    <div class="ar-lp2d__group-label">Close</div>
                    <div class="ar-lp2d__group-btns">
                        <button type="button" a-for="t in this.closeTools()"
                                :class="t.cls" :title="t.title"
                                :data-id="t.id" :data-behaviour="t.behaviour"
                                @click="this.onBtnClick">{{ t.icon }}</button>
                    </div>
                </div>
                <div class="ar-lp2d__group">
                    <div class="ar-lp2d__group-label">To 3D</div>
                    <div class="ar-lp2d__group-btns">
                        <button type="button" a-for="t in this.to3dTools()"
                                :class="t.cls" :title="t.title"
                                :data-id="t.id" :data-behaviour="t.behaviour"
                                @click="this.onBtnClick">{{ t.icon }}</button>
                    </div>
                </div>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {LinesPalette2D.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = LinesPalette2D.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
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
        onMount() { this.#bindKeys(); }

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
        onUnmount() { this.#unbindKeys(); }

        /** @name        #onKey
         *  @public
         *  @type        {unknown}
         *  @description Component member for on Key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #onKey = (e: KeyboardEvent) => {
            if (this.getAttribute('disable-hotkeys') === 'true')
                return;

            /** @name        target
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned target value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const target = e.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
                return;

            /** @name        key
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned key value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const key = e.key.toUpperCase();

            /** @name        t
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned t value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const t = this.tools$.Get().find((x: any) => x.shortcut === key);
            if (t)
            {
                e.preventDefault();
                if (t.behaviour === 'tool')
                    this.setTool(t.id);
                else
                {
                    this.dispatchEvent(new CustomEvent(t.behaviour === 'action' ? 'arianna:action' : 'arianna:to-3d', { bubbles: true, detail: t.behaviour === 'action' ? { action: t.id } : { kind: t.id } }));
                }
            }
        };

        /** @name        #bindKeys
         *  @public
         *  @type        {void}
         *  @description Component member for bind Keys.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #bindKeys(): void { window.addEventListener('keydown', this.#onKey); }

        /** @name        #unbindKeys
         *  @public
         *  @type        {void}
         *  @description Component member for unbind Keys.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #unbindKeys(): void { window.removeEventListener('keydown', this.#onKey); }

        /** @name        layoutCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for layout Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private layoutCls: () => string = () => 'ar-lp2d ar-lp2d--vertical';

        /** @name        showShortcuts
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Shortcuts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showShortcuts: () => boolean = () => true;

        /** @name        drawTools
         *  @private
         *  @type        {() => Array<{
            id: string;
            label: string;
            icon: string;
            title: string;
            cls: string;
            behaviour: string;
        }>}
         *  @description Component member for draw Tools.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private drawTools: () => Array<{
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

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        behaviour
             *  @public
             *  @type        {string}
             *  @description Component member for behaviour.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            behaviour: string;
        }> = () => [];

        /** @name        closeTools
         *  @private
         *  @type        {() => Array<{
            id: string;
            label: string;
            icon: string;
            title: string;
            cls: string;
            behaviour: string;
        }>}
         *  @description Component member for close Tools.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private closeTools: () => Array<{
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

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        behaviour
             *  @public
             *  @type        {string}
             *  @description Component member for behaviour.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            behaviour: string;
        }> = () => [];

        /** @name        to3dTools
         *  @private
         *  @type        {() => Array<{
            id: string;
            label: string;
            icon: string;
            title: string;
            cls: string;
            behaviour: string;
        }>}
         *  @description Component member for to3d Tools.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private to3dTools: () => Array<{
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

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        behaviour
             *  @public
             *  @type        {string}
             *  @description Component member for behaviour.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            behaviour: string;
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
         *  @type        {LinesPalette2D.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {LinesPalette2D.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'inline-block', fontFamily: '-apple-system, system-ui, sans-serif' }),
                new Rule('.ar-lp2d', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    display: 'flex',
                    padding: '8px',
                    gap: '12px',
                }),
                new Rule('.ar-lp2d--vertical', { flexDirection: 'column' }),
                new Rule('.ar-lp2d--horizontal', { flexDirection: 'row' }),
                new Rule('.ar-lp2d__group', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-lp2d__group-label', {
                    fontSize: '10px', fontWeight: '600',
                    color: 'var(--arianna-muted, #6e6b62)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                }),
                new Rule('.ar-lp2d__group-btns', { display: 'grid', gridTemplateColumns: 'repeat(2, 28px)', gap: '3px' }),
                new Rule('.ar-lp2d__btn', {
                    width: '28px', height: '28px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'background 0.08s, border-color 0.08s',
                }),
                new Rule('.ar-lp2d__btn:hover', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderColor: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-lp2d__btn--active', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                }),
            ]);
        }
    }
}
export default LinesPalette2D;

export type LineTool = LinesPalette2D.Interfaces.LineTool;
export type LinesPalette2DOptions = LinesPalette2D.Interfaces.LinesPalette2DOptions;
