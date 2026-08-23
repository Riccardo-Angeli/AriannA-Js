/**
 * @module    components/graphics/colors/ColorPickerTile
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ColorPickerTile component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../../core/index.ts';
import { parseHexRgba, rgbToHex } from './GraphicsColorPicker.ts';
import type { Interfaces as SchemaInterfaces } from '../../../core/definitions/Interfaces.ts';

/** @namespace   ColorPickerTile
 *  @public
 *  @description Namespace containing ColorPickerTile contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ColorPickerTile
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
        /** @interface   ColorPickerTileOptions
         *  @public
         *  @description ColorPickerTileOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ColorPickerTileOptions
        {
            /** @name        palette
             *  @public
             *  @type        {keyof typeof PALETTES | string[]}
             *  @description Component member for palette.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            palette?: keyof typeof PALETTES | string[];

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;

            /** @name        showRecent
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Recent.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showRecent?: boolean;

            /** @name        recentMax
             *  @public
             *  @type        {number}
             *  @description Component member for recent Max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            recentMax?: number;

            /** @name        showInput
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Input.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showInput?: boolean;

            /** @name        columns
             *  @public
             *  @type        {number}
             *  @description Component member for columns.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            columns?: number;

            /** @name        tileSize
             *  @public
             *  @type        {number}
             *  @description Component member for tile Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            tileSize?: number;
        }

        /** @interface   TileState
         *  @public
         *  @description TileState contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TileState
        {
            /** @name        selected
             *  @public
             *  @type        {string}
             *  @description Component member for selected.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selected: string;

            /** @name        recent
             *  @public
             *  @type        {string[]}
             *  @description Component member for recent.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            recent: string[];
        }
    }
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

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        PALETTES
     *  @public
     *  @type        {Record<string, string[]>}
     *  @description Namespace-owned PALETTES value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const PALETTES: Record<string, string[]> = {
        'tailwind': [
            '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
            '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
            '#991b1b', '#9a3412', '#854d0e', '#15803d', '#0e7490', '#1d4ed8', '#6d28d9', '#9d174d',
            '#1e1e1e', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#ffffff',
        ],
        'material': [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
            '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
            '#795548', '#9e9e9e', '#607d8b', '#000000', '#ffffff', '#212121', '#424242', '#757575',
        ],
        'pastel': [
            '#ffd1dc', '#ffb3c1', '#ffd6e0', '#ffe5d9', '#fef3c7', '#d9f99d', '#bbf7d0', '#a7f3d0',
            '#bae6fd', '#bfdbfe', '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe', '#fce7f3', '#fbcfe8',
        ],
        'web-safe': [
            '#000000', '#000033', '#000066', '#000099', '#0000cc', '#0000ff',
            '#003300', '#003333', '#003366', '#003399', '#0033cc', '#0033ff',
            '#006600', '#006633', '#006666', '#006699', '#0066cc', '#0066ff',
            '#009900', '#009933', '#009966', '#009999', '#0099cc', '#0099ff',
            '#00cc00', '#00cc33', '#00cc66', '#00cc99', '#00cccc', '#00ccff',
            '#00ff00', '#00ff33', '#00ff66', '#00ff99', '#00ffcc', '#00ffff',
        ],
        'mac-os-classic': [
            '#000000', '#404040', '#808080', '#bfbfbf', '#ffffff',
            '#7f0000', '#ff0000', '#7f7f00', '#ffff00', '#007f00', '#00ff00', '#007f7f', '#00ffff',
            '#00007f', '#0000ff', '#7f007f', '#ff00ff', '#ff7f00', '#7f3f00', '#ffbf7f', '#7f7f3f',
        ],
    };

    /** @class       ColorPickerTile
     *  @public
     *  @description AriannA ColorPickerTile component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-color-picker-tile', {}, {
        Attributes: ['palette', 'color', 'show-recent', 'recent-max', 'show-input', 'columns', 'tile-size'],
    })
    export class ColorPickerTile extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        state$
         *  @public
         *  @type        {ColorPickerTile.Types.Signal<ColorPickerTile.Interfaces.TileState>}
         *  @description Component member for state$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        state$: Types.Signal<Interfaces.TileState> = signal<Interfaces.TileState>({ selected: '#000000', recent: [] });

        /** Custom palette override (takes precedence over attr `palette`). */
        paletteOverride$: Types.Signal<string[] | null> = signal<string[] | null>(null);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ColorPickerTile.Interfaces.ColorPickerTileOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ColorPickerTileOptions = {})
        {
            /** @name        colsAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned colsAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const colsAttr = this.signal().attribute('columns');

            /** @name        tileSizeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tileSizeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tileSizeAttr = this.signal().attribute('tile-size');
            this.cols = () => parseInt(colsAttr.Get() ?? '8', 10) || 8;
            this.size = () => parseInt(tileSizeAttr.Get() ?? '28', 10) || 28;
            this.showRecent = () => this.getAttribute('show-recent') !== 'false';
            this.showInput = () => this.getAttribute('show-input') !== 'false';
            this.gridStyle = () => `grid-template-columns: repeat(${this.cols()}, ${this.size()}px)`;
            this.recentStyle = () => `grid-template-columns: repeat(auto-fill, ${this.size()}px)`;
            this.paletteTiles = (): Array<{
                /** @name        hex
                 *  @public
                 *  @type        {string}
                 *  @description Component member for hex.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                hex: string;

                /** @name        style
                 *  @public
                 *  @type        {string}
                 *  @description Component member for style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                style: string;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;
            }> => {
                /** @name        sz
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sz value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sz = this.size();

                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.state$.Get().selected.toLowerCase();
                return this.#resolvePalette().map(hex => ({
                    hex,
                    style: `background: ${hex}; width: ${sz}px; height: ${sz}px`,
                    cls: 'ar-cpt__tile' + (hex.toLowerCase() === sel ? ' ar-cpt__tile--sel' : ''),
                }));
            };
            this.recentTiles = (): Array<{
                /** @name        hex
                 *  @public
                 *  @type        {string}
                 *  @description Component member for hex.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                hex: string;

                /** @name        style
                 *  @public
                 *  @type        {string}
                 *  @description Component member for style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                style: string;
            }> => {
                /** @name        sz
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sz value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sz = this.size();
                return this.state$.Get().recent.map((hex: any) => ({
                    hex,
                    style: `background: ${hex}; width: ${sz}px; height: ${sz}px`,
                }));
            };
            this.hasRecent = () => this.state$.Get().recent.length > 0;
            this.inputVal = () => this.state$.Get().selected;
            this.onTileClick = (e: Event) => {
                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = e.currentTarget as HTMLButtonElement;

                /** @name        hex
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hex value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hex = btn.dataset.color;
                if (hex)
                    this.setColor(hex);
            };
            this.onInputChange = (e: Event) => {
                /** @name        v
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v = (e.target as HTMLInputElement).value.trim();
                this.setColor(v);
            };
            this.onPickerInput = (e: Event) => {
                this.setColor((e.target as HTMLInputElement).value);
            };
            this.template = html `
            <div class="ar-cpt__grid" :style="this.gridStyle()">
                <button type="button" a-for="t in this.paletteTiles()"
                        :class="t.cls"
                        :style="t.style"
                        :data-color="t.hex"
                        :title="t.hex"
                        @click="this.onTileClick"></button>
            </div>
            <div a-if="this.showRecent()">
                <div class="ar-cpt__sep" a-if="this.hasRecent()">Recent</div>
                <div class="ar-cpt__recent" :style="this.recentStyle()" a-if="this.hasRecent()">
                    <button type="button" a-for="t in this.recentTiles()"
                            class="ar-cpt__tile"
                            :style="t.style"
                            :data-color="t.hex"
                            :title="t.hex"
                            @click="this.onTileClick"></button>
                </div>
            </div>
            <div class="ar-cpt__input-row" a-if="this.showInput()">
                <input class="ar-cpt__inp" type="text" placeholder="#rrggbb"
                       :value="this.inputVal()" @change="this.onInputChange"/>
                <input class="ar-cpt__cpc" type="color"
                       :value="this.inputVal()" @input="this.onPickerInput"/>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ColorPickerTile.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ColorPickerTile.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        palette
         *  @public
         *  @type        {void}
         *  @description Component member for palette.
         *  @param       {keyof typeof PALETTES | string[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set palette(v: keyof typeof PALETTES | string[])
        {
            if (Array.isArray(v))
            {
                this.paletteOverride$.Set(v);
            }
            else
            {
                this.paletteOverride$.Set(null);
                this.setAttribute('palette', v);
            }
        }

        /** @name        palette
         *  @public
         *  @type        {string[]}
         *  @description Component member for palette.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get palette(): string[] { return this.#resolvePalette(); }

        /** @name        setColor
         *  @public
         *  @type        {this}
         *  @description Component member for set Color.
         *  @param       {string} hex Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setColor(hex: string): this
        {
            /** @name        p
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p = parseHexRgba(hex);
            if (!p)
                return this;

            /** @name        canonical
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canonical value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canonical = rgbToHex(p.r, p.g, p.b);

            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = this.state$.Get();

            /** @name        recent
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned recent value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const recent = [canonical, ...cur.recent.filter((c: any) => c.toLowerCase() !== canonical.toLowerCase())]
                .slice(0, parseInt(this.getAttribute('recent-max') ?? '12', 10) || 12);
            this.state$.Set({ selected: canonical, recent });
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true,
                detail: { hex: canonical, rgb: { r: p.r, g: p.g, b: p.b } },
            }));
            return this;
        }

        /** @name        getColor
         *  @public
         *  @type        {{
            hex: string;
            rgb: {
                r: number;
                g: number;
                b: number;
            };
        }}
         *  @description Component member for get Color.
         *  @returns     {{
            hex: string;
            rgb: {
                r: number;
                g: number;
                b: number;
            };
        }} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getColor():
        {
            /** @name        hex
             *  @public
             *  @type        {string}
             *  @description Component member for hex.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hex: string;

            /** @name        rgb
             *  @public
             *  @type        {{
                r: number;
                g: number;
                b: number;
            }}
             *  @description Component member for rgb.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            rgb: {
                /** @name        r
                 *  @public
                 *  @type        {number}
                 *  @description Component member for r.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                r: number;

                /** @name        g
                 *  @public
                 *  @type        {number}
                 *  @description Component member for g.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                g: number;

                /** @name        b
                 *  @public
                 *  @type        {number}
                 *  @description Component member for b.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                b: number;
            };
        } {
            /** @name        hex
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hex value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hex = this.state$.Get().selected;

            /** @name        p
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned p value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const p = parseHexRgba(hex) ?? { r: 0, g: 0, b: 0, a: 1 };
            return { hex, rgb: { r: p.r, g: p.g, b: p.b } };
        }

        /** @name        getRecent
         *  @public
         *  @type        {string[]}
         *  @description Component member for get Recent.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getRecent(): string[] { return this.state$.Get().recent.slice(); }

        /** @name        #resolvePalette
         *  @public
         *  @type        {string[]}
         *  @description Component member for resolve Palette.
         *  @returns     {string[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #resolvePalette(): string[]
        {
            /** @name        override
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned override value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const override = this.paletteOverride$.Get();
            if (override)
                return override;

            /** @name        name
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned name value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const name = this.getAttribute('palette') ?? 'tailwind';
            return PALETTES[name] || PALETTES['tailwind']!;
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
            /** @name        init
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned init value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const init = this.getAttribute('color');
            if (init)
                this.setColor(init);
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

        /** @name        cols
         *  @private
         *  @type        {() => number}
         *  @description Component member for cols.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private cols: () => number = () => 8;

        /** @name        size
         *  @private
         *  @type        {() => number}
         *  @description Component member for size.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private size: () => number = () => 28;

        /** @name        showRecent
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Recent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showRecent: () => boolean = () => true;

        /** @name        showInput
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showInput: () => boolean = () => true;

        /** @name        gridStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for grid Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private gridStyle: () => string = () => '';

        /** @name        recentStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for recent Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private recentStyle: () => string = () => '';

        /** @name        paletteTiles
         *  @private
         *  @type        {() => Array<{
            hex: string;
            style: string;
            cls: string;
        }>}
         *  @description Component member for palette Tiles.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private paletteTiles: () => Array<{
            /** @name        hex
             *  @public
             *  @type        {string}
             *  @description Component member for hex.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hex: string;

            /** @name        style
             *  @public
             *  @type        {string}
             *  @description Component member for style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }> = () => [];

        /** @name        recentTiles
         *  @private
         *  @type        {() => Array<{
            hex: string;
            style: string;
        }>}
         *  @description Component member for recent Tiles.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private recentTiles: () => Array<{
            /** @name        hex
             *  @public
             *  @type        {string}
             *  @description Component member for hex.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hex: string;

            /** @name        style
             *  @public
             *  @type        {string}
             *  @description Component member for style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style: string;
        }> = () => [];

        /** @name        hasRecent
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Recent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasRecent: () => boolean = () => false;

        /** @name        inputVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for input Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inputVal: () => string = () => '#000000';

        /** @name        onTileClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Tile Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onTileClick: (e: Event) => void = () => { };

        /** @name        onInputChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInputChange: (e: Event) => void = () => { };

        /** @name        onPickerInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Picker Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPickerInput: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {ColorPickerTile.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ColorPickerTile.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    gap: '8px',
                    padding: '12px',
                }),
                new Rule('.ar-cpt__grid, .ar-cpt__recent', { display: 'grid', gap: '3px' }),
                new Rule('.ar-cpt__sep', {
                    fontSize: '10px', fontWeight: '600',
                    color: 'var(--arianna-muted, #6e6b62)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    paddingTop: '4px', marginBottom: '4px',
                }),
                new Rule('.ar-cpt__tile', {
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'transform 0.08s, border-color 0.08s',
                }),
                new Rule('.ar-cpt__tile:hover', {
                    transform: 'scale(1.12)',
                    borderColor: 'var(--arianna-text, #1f2328)',
                    zIndex: '1',
                }),
                new Rule('.ar-cpt__tile--sel', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    boxShadow: '0 0 0 2px rgba(31,111,235,0.30)',
                }),
                new Rule('.ar-cpt__input-row', {
                    display: 'flex', gap: '6px', alignItems: 'center',
                }),
                new Rule('.ar-cpt__inp', {
                    flex: '1',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '5px 8px',
                    font: '12px ui-monospace, monospace',
                    borderRadius: '3px',
                }),
                new Rule('.ar-cpt__inp:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-cpt__cpc', {
                    width: '32px', height: '28px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    padding: '0',
                    background: 'transparent',
                    cursor: 'pointer',
                }),
            ]);
        }
    }
}
export default ColorPickerTile;

export type ColorPickerTileOptions = ColorPickerTile.Interfaces.ColorPickerTileOptions;
