/**
 * @module    components/layout/Window
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Window component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   WindowComponent
 *  @public
 *  @description Namespace containing WindowComponent contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace WindowComponent
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

        /** @name        WindowStyle
         *  @public
         *  @type        {'macos' | 'windows'}
         *  @description Type alias for WindowStyle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type WindowStyle = 'macos' | 'windows';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   WindowMenuItem
         *  @public
         *  @description WindowMenuItem contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WindowMenuItem
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

            /** @name        items
             *  @public
             *  @type        {Array<{
                id: string;
                label: string;
                shortcut?: string;
                disabled?: boolean;
            }>}
             *  @description Component member for items.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            items?: Array<{
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

                /** @name        shortcut
                 *  @public
                 *  @type        {string}
                 *  @description Component member for shortcut.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                shortcut?: string;

                /** @name        disabled
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for disabled.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                disabled?: boolean;
            }>;
        }

        /** @interface   WindowOptions
         *  @public
         *  @description WindowOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WindowOptions
        {
            /** @name        style
             *  @public
             *  @type        {WindowComponent.Types.WindowStyle}
             *  @description Component member for style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style?: WindowComponent.Types.WindowStyle;

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string;

            /** @name        x
             *  @public
             *  @type        {number}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x?: number;

            /** @name        y
             *  @public
             *  @type        {number}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y?: number;

            /** @name        width
             *  @public
             *  @type        {number}
             *  @description Component member for width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            width?: number;

            /** @name        height
             *  @public
             *  @type        {number}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: number;

            /** @name        minWidth
             *  @public
             *  @type        {number}
             *  @description Component member for min Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minWidth?: number;

            /** @name        minHeight
             *  @public
             *  @type        {number}
             *  @description Component member for min Height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minHeight?: number;

            /** @name        resizable
             *  @public
             *  @type        {boolean}
             *  @description Component member for resizable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            resizable?: boolean;

            /** @name        chrome
             *  @public
             *  @type        {boolean}
             *  @description Component member for chrome.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            chrome?: boolean;

            /** @name        focused
             *  @public
             *  @type        {boolean}
             *  @description Component member for focused.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            focused?: boolean;
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
    // Global z-index counter so a focused window always sits on top of its peers.
    /** @name        WIN_Z
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned WIN_Z value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let WIN_Z = 100;

    /** @class       WindowComponent
     *  @public
     *  @description AriannA WindowComponent component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-window', {}, {
        Attributes: [
            'variant', 'title', 'x', 'y', 'width', 'height',
            'min-width', 'min-height', 'resizable', 'chrome',
            'focused', 'maximized', 'minimized',
        ],
    })
    export class WindowComponent extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        #prevRect
         *  @public
         *  @type        {{
            x: number;
            y: number;
            w: number;
            h: number;
        } | null}
         *  @description Component member for prev Rect.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #prevRect: {
            /** @name        x
             *  @public
             *  @type        {number}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x: number;

            /** @name        y
             *  @public
             *  @type        {number}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y: number;

            /** @name        w
             *  @public
             *  @type        {number}
             *  @description Component member for w.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            w: number;

            /** @name        h
             *  @public
             *  @type        {number}
             *  @description Component member for h.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            h: number;
        } | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {WindowComponent.Interfaces.WindowOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.WindowOptions = {})
        {
            // Default positioning + sizing on first build if not specified
            if (!this.hasAttribute('width'))
                this.setAttribute('width', '480');
            if (!this.hasAttribute('height'))
                this.setAttribute('height', '320');
            if (!this.hasAttribute('style'))
                this.setAttribute('style', 'macos');

            /** @name        titleSig
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned titleSig value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const titleSig = this.signal().attribute('title');

            /** @name        styleAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned styleAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const styleAttr = this.signal().attribute('variant');

            /** @name        applyGeometry
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned applyGeometry value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const applyGeometry = () => {
                /** @name        x
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned x value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const x = parseInt(this.getAttribute('x') ?? '', 10);

                /** @name        y
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned y value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const y = parseInt(this.getAttribute('y') ?? '', 10);

                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = parseInt(this.getAttribute('width') ?? '480', 10) || 480;

                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = parseInt(this.getAttribute('height') ?? '320', 10) || 320;
                this.style.position = 'absolute';
                if (!isNaN(x))
                    this.style.left = x + 'px';
                if (!isNaN(y))
                    this.style.top = y + 'px';
                this.style.width = w + 'px';
                this.style.height = h + 'px';
            };
            applyGeometry();
            this.addEventListener('arianna:attr-x', applyGeometry);
            this.addEventListener('arianna:attr-y', applyGeometry);
            this.addEventListener('arianna:attr-width', applyGeometry);
            this.addEventListener('arianna:attr-height', applyGeometry);
            // Update internal state on resize/move modifier events; sync attributes back
            this.addEventListener('arianna:resize', (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as CustomEvent<{
                    /** @name        width
                     *  @public
                     *  @type        {number}
                     *  @description Component member for width.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    width: number;

                    /** @name        height
                     *  @public
                     *  @type        {number}
                     *  @description Component member for height.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    height: number;
                }>;

                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = ev.detail;
                if (d?.width)
                    this.setAttribute('width', String(d.width));
                if (d?.height)
                    this.setAttribute('height', String(d.height));
            });
            this.addEventListener('arianna:move', (e: Event) => {
                /** @name        ev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ev = e as CustomEvent<{
                    /** @name        x
                     *  @public
                     *  @type        {number}
                     *  @description Component member for x.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    x: number;

                    /** @name        y
                     *  @public
                     *  @type        {number}
                     *  @description Component member for y.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    y: number;
                }>;

                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = ev.detail;
                if (typeof d?.x === 'number')
                    this.setAttribute('x', String(d.x));
                if (typeof d?.y === 'number')
                    this.setAttribute('y', String(d.y));
            });
            // Click-to-focus
            /** @name        onFocus
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onFocus value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onFocus = () => this.focus_();
            this.addEventListener('pointerdown', onFocus, true);
            this.titleText = () => titleSig.Get() ?? '';
            this.dockStyle = () => (styleAttr.Get() ?? 'macos') as Types.WindowStyle;
            this.isMacOS = () => this.dockStyle() === 'macos';
            this.isWindows = () => this.dockStyle() === 'windows';
            this.hasChrome = () => this.getAttribute('chrome') !== 'false';
            this.isResizable = () => this.getAttribute('resizable') !== 'false';
            this.minW = () => parseInt(this.getAttribute('min-width') ?? '200', 10) || 200;
            this.minH = () => parseInt(this.getAttribute('min-height') ?? '120', 10) || 120;
            this.onCloseClick = () => {
                this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: {} }));
            };
            this.onMinClick = () => this.minimize();
            this.onMaxClick = () => this.hasAttribute('maximized') ? this.restore() : this.maximize();
            this.template = html `
            <div class="ar-window__titlebar">
                <!-- macOS traffic lights left -->
                <div class="ar-window__traffic" a-if="this.isMacOS() && this.hasChrome()">
                    <button class="ar-window__btn ar-window__btn--close"    @click="this.onCloseClick" aria-label="Close"></button>
                    <button class="ar-window__btn ar-window__btn--minimize" @click="this.onMinClick"   aria-label="Minimize"></button>
                    <button class="ar-window__btn ar-window__btn--maximize" @click="this.onMaxClick"   aria-label="Maximize"></button>
                </div>

                <span class="ar-window__title"><slot name="title">{{ this.titleText() }}</slot></span>

                <!-- Windows-style chrome right -->
                <div class="ar-window__chrome" a-if="this.isWindows() && this.hasChrome()">
                    <button class="ar-window__chrome-btn" @click="this.onMinClick"   aria-label="Minimize">─</button>
                    <button class="ar-window__chrome-btn" @click="this.onMaxClick"   aria-label="Maximize">▢</button>
                    <button class="ar-window__chrome-btn ar-window__chrome-btn--close"
                            @click="this.onCloseClick" aria-label="Close">✕</button>
                </div>
            </div>

            <div class="ar-window__menu"><slot name="menu"></slot></div>

            <div class="ar-window__body">
                <slot name="body"></slot>
                <slot></slot>
            </div>

            <!-- Modifiers: drag the titlebar; resize from any edge / corner -->
            <arianna-mover handle-selector=".ar-window__titlebar" bounds="none"></arianna-mover>
            <arianna-resizer a-if="this.isResizable()"
                             handles="n,s,e,w,ne,nw,se,sw"
                             :min-width="String(this.minW())"
                             :min-height="String(this.minH())"
                             allow-cross="false"></arianna-resizer>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {WindowComponent.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = WindowComponent.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        minimize
         *  @public
         *  @type        {this}
         *  @description Component member for minimize.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        minimize(): this
        {
            this.setAttribute('minimized', '');
            this.style.display = 'none';
            this.dispatchEvent(new CustomEvent('arianna:minimize', { bubbles: true, detail: {} }));
            return this;
        }

        /** @name        maximize
         *  @public
         *  @type        {this}
         *  @description Component member for maximize.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        maximize(): this
        {
            if (this.hasAttribute('maximized'))
                return this;
            // Save current geometry to restore later
            this.#prevRect = {
                x: this.offsetLeft, y: this.offsetTop,
                w: this.offsetWidth, h: this.offsetHeight,
            };
            this.setAttribute('maximized', '');
            this.style.left = '0';
            this.style.top = '0';
            this.style.width = '100%';
            this.style.height = '100%';
            this.dispatchEvent(new CustomEvent('arianna:maximize', { bubbles: true, detail: {} }));
            return this;
        }

        /** @name        restore
         *  @public
         *  @type        {this}
         *  @description Component member for restore.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        restore(): this
        {
            if (this.hasAttribute('minimized'))
            {
                this.removeAttribute('minimized');
                this.style.display = '';
                this.dispatchEvent(new CustomEvent('arianna:restore', { bubbles: true, detail: {} }));
                return this;
            }
            if (this.hasAttribute('maximized') && this.#prevRect)
            {
                this.removeAttribute('maximized');
                this.setAttribute('x', String(this.#prevRect.x));
                this.setAttribute('y', String(this.#prevRect.y));
                this.setAttribute('width', String(this.#prevRect.w));
                this.setAttribute('height', String(this.#prevRect.h));
                this.#prevRect = null;
                this.dispatchEvent(new CustomEvent('arianna:restore', { bubbles: true, detail: {} }));
            }
            return this;
        }

        /**
         * Bring this window to the top of its z-stack and fire 'arianna:focus'.
         * Named `focus_` internally to avoid clobbering HTMLElement.focus().
         */
        focus_(): this
        {
            WIN_Z += 1;
            this.style.zIndex = String(WIN_Z);
            this.setAttribute('focused', '');
            this.dispatchEvent(new CustomEvent('arianna:focus', { bubbles: true, detail: {} }));
            return this;
        }

        /** Programmatic move (also fired by the arianna-mover modifier). */
        moveTo(x: number, y: number): this
        {
            this.setAttribute('x', String(x));
            this.setAttribute('y', String(y));
            return this;
        }

        /** Programmatic resize (also fired by the arianna-resizer modifier). */
        resizeTo(w: number, h: number): this
        {
            this.setAttribute('width', String(Math.max(this.minW(), w)));
            this.setAttribute('height', String(Math.max(this.minH(), h)));
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
        onMount()
        {
            // Defer initial focus to next tick so peers can mount first
            if (this.getAttribute('focused') !== 'false')
            {
                requestAnimationFrame(() => this.focus_());
            }
        }

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
        // ── Attr getters / setters ───────────────────────────────────────────────
        /** @name        variant
         *  @public
         *  @type        {WindowComponent.Types.WindowStyle}
         *  @description Component member for variant.
         *  @returns     {WindowComponent.Types.WindowStyle} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): Types.WindowStyle { return (this.getAttribute('variant') ?? 'macos') as Types.WindowStyle; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {WindowComponent.Types.WindowStyle} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: Types.WindowStyle) { this.setAttribute('variant', v); }

        /** @name        title
         *  @public
         *  @type        {string}
         *  @description Component member for title.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get title(): string { return this.getAttribute('title') ?? ''; }

        /** @name        title
         *  @public
         *  @type        {void}
         *  @description Component member for title.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

        /** @name        x
         *  @public
         *  @type        {number}
         *  @description Component member for x.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get x(): number { return parseInt(this.getAttribute('x') ?? '0', 10); }

        /** @name        x
         *  @public
         *  @type        {void}
         *  @description Component member for x.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set x(v: number) { this.setAttribute('x', String(v)); }

        /** @name        y
         *  @public
         *  @type        {number}
         *  @description Component member for y.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get y(): number { return parseInt(this.getAttribute('y') ?? '0', 10); }

        /** @name        y
         *  @public
         *  @type        {void}
         *  @description Component member for y.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set y(v: number) { this.setAttribute('y', String(v)); }

        /** @name        width
         *  @public
         *  @type        {number}
         *  @description Component member for width.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get width(): number { return parseInt(this.getAttribute('width') ?? '480', 10); }

        /** @name        width
         *  @public
         *  @type        {void}
         *  @description Component member for width.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set width(v: number) { this.setAttribute('width', String(v)); }

        /** @name        height
         *  @public
         *  @type        {number}
         *  @description Component member for height.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get height(): number { return parseInt(this.getAttribute('height') ?? '320', 10); }

        /** @name        height
         *  @public
         *  @type        {void}
         *  @description Component member for height.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set height(v: number) { this.setAttribute('height', String(v)); }

        /** @name        resizable
         *  @public
         *  @type        {boolean}
         *  @description Component member for resizable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get resizable(): boolean { return this.getAttribute('resizable') !== 'false'; }

        /** @name        resizable
         *  @public
         *  @type        {void}
         *  @description Component member for resizable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set resizable(v: boolean) { this.setAttribute('resizable', v ? 'true' : 'false'); }

        /** @name        chrome
         *  @public
         *  @type        {boolean}
         *  @description Component member for chrome.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get chrome(): boolean { return this.getAttribute('chrome') !== 'false'; }

        /** @name        chrome
         *  @public
         *  @type        {void}
         *  @description Component member for chrome.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set chrome(v: boolean) { this.setAttribute('chrome', v ? 'true' : 'false'); }

        /** @name        maximized
         *  @public
         *  @type        {boolean}
         *  @description Component member for maximized.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get maximized(): boolean { return this.hasAttribute('maximized'); }

        /** @name        minimized
         *  @public
         *  @type        {boolean}
         *  @description Component member for minimized.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get minimized(): boolean { return this.hasAttribute('minimized'); }
        // ── Template helpers ─────────────────────────────────────────────────────
        /** @name        titleText
         *  @private
         *  @type        {() => string}
         *  @description Component member for title Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private titleText: () => string = () => '';

        /** @name        dockStyle
         *  @private
         *  @type        {() => WindowComponent.Types.WindowStyle}
         *  @description Component member for dock Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private dockStyle: () => Types.WindowStyle = () => 'macos';

        /** @name        isMacOS
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Mac OS.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isMacOS: () => boolean = () => true;

        /** @name        isWindows
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Windows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isWindows: () => boolean = () => false;

        /** @name        hasChrome
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Chrome.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasChrome: () => boolean = () => true;

        /** @name        isResizable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Resizable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isResizable: () => boolean = () => true;

        /** @name        minW
         *  @private
         *  @type        {() => number}
         *  @description Component member for min W.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private minW: () => number = () => 200;

        /** @name        minH
         *  @private
         *  @type        {() => number}
         *  @description Component member for min H.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private minH: () => number = () => 120;

        /** @name        onCloseClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Close Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCloseClick: () => void = () => { };

        /** @name        onMinClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Min Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onMinClick: () => void = () => { };

        /** @name        onMaxClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Max Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onMaxClick: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {WindowComponent.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {WindowComponent.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--arianna-bg, #ffffff)',
                    color: 'var(--arianna-text, #1f2328)',
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    minWidth: '160px',
                    minHeight: '80px',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    boxSizing: 'border-box',
                }),
                new Rule(':host([variant="macos"])', { borderRadius: '10px' }),
                new Rule(':host([variant="windows"])', { borderRadius: '0' }),
                new Rule(':host([focused])', { boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }),
                new Rule(':host([maximized])', {
                    borderRadius: '0', border: 'none',
                }),
                // Title bar
                new Rule('.ar-window__titlebar', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'flex',
                    flexShrink: '0',
                    gap: '8px',
                    height: '36px',
                    padding: '0 12px',
                    cursor: 'move',
                    userSelect: 'none',
                }),
                new Rule(':host([variant="macos"]) .ar-window__titlebar', {
                    justifyContent: 'center',
                }),
                new Rule('.ar-window__title', {
                    flex: '1',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    color: 'var(--arianna-muted, #6e6b62)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host([variant="windows"]) .ar-window__title', {
                    textAlign: 'left',
                    paddingLeft: '4px',
                }),
                // macOS traffic lights
                new Rule('.ar-window__traffic', {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: '0',
                }),
                new Rule('.ar-window__btn', {
                    width: '12px',
                    height: '12px',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'opacity 0.12s ease',
                }),
                new Rule('.ar-window__btn--close', { background: '#ff5f57' }),
                new Rule('.ar-window__btn--minimize', { background: '#ffbd2e' }),
                new Rule('.ar-window__btn--maximize', { background: '#28c940' }),
                new Rule('.ar-window__btn:hover', { opacity: '0.8' }),
                // Windows-style chrome
                new Rule('.ar-window__chrome', {
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: '0',
                    marginLeft: 'auto',
                }),
                new Rule('.ar-window__chrome-btn', {
                    background: 'none',
                    border: 'none',
                    color: 'var(--arianna-text, #1f2328)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.8rem',
                    height: '36px',
                    width: '40px',
                    transition: 'background 0.12s ease',
                }),
                new Rule('.ar-window__chrome-btn:hover', {
                    background: 'var(--arianna-bg-4, #ebebeb)',
                }),
                new Rule('.ar-window__chrome-btn--close:hover', {
                    background: 'var(--arianna-danger, #cf222e)',
                    color: '#ffffff',
                }),
                // Menu bar (custom slot content)
                new Rule('.ar-window__menu', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    flexShrink: '0',
                }),
                new Rule('.ar-window__menu:empty', { display: 'none' }),
                // Body
                new Rule('.ar-window__body', {
                    flex: '1',
                    overflow: 'auto',
                    position: 'relative',
                    minHeight: '0',
                }),
            ]);
        }
    }
}
export default WindowComponent;
export type WindowOptions = WindowComponent.Interfaces.WindowOptions;
export type WindowStyle = WindowComponent.Types.WindowStyle;
export type WindowMenuItem = WindowComponent.Interfaces.WindowMenuItem;
