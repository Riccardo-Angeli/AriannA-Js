/**
 * @module    components/graphics/colors/ColorPickerTile
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * ColorPickerTile — grid-of-swatches picker. Built-in palettes (tailwind,
 * material, pastel, web-safe, mac-os-classic) plus custom array support,
 * "recent colours" strip, optional hex input + native color picker.
 *
 * @example HTML
 *   <arianna-color-picker-tile palette="material" columns="8"></arianna-color-picker-tile>
 *
 * @example JS
 *   const t = new ColorPickerTile();
 *   t.palette = ['#ef4444', '#3b82f6', '#22c55e'];
 *   t.addEventListener('arianna:change', e => brush.setColor(e.detail.hex));
 *
 * Events: arianna:change  detail: { hex, rgb }
 * Attrs:  palette, color, show-recent, recent-max, show-input, columns, tile-size
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';
import { parseHex, rgbToHex } from './ColorPicker.ts';

const PALETTES: Record<string, string[]> = {
    'tailwind': [
        '#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899',
        '#dc2626','#ea580c','#ca8a04','#16a34a','#0891b2','#2563eb','#7c3aed','#db2777',
        '#991b1b','#9a3412','#854d0e','#15803d','#0e7490','#1d4ed8','#6d28d9','#9d174d',
        '#1e1e1e','#374151','#6b7280','#9ca3af','#d1d5db','#e5e7eb','#f3f4f6','#ffffff',
    ],
    'material': [
        '#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#03a9f4','#00bcd4',
        '#009688','#4caf50','#8bc34a','#cddc39','#ffeb3b','#ffc107','#ff9800','#ff5722',
        '#795548','#9e9e9e','#607d8b','#000000','#ffffff','#212121','#424242','#757575',
    ],
    'pastel': [
        '#ffd1dc','#ffb3c1','#ffd6e0','#ffe5d9','#fef3c7','#d9f99d','#bbf7d0','#a7f3d0',
        '#bae6fd','#bfdbfe','#c7d2fe','#ddd6fe','#e9d5ff','#f5d0fe','#fce7f3','#fbcfe8',
    ],
    'web-safe': [
        '#000000','#000033','#000066','#000099','#0000cc','#0000ff',
        '#003300','#003333','#003366','#003399','#0033cc','#0033ff',
        '#006600','#006633','#006666','#006699','#0066cc','#0066ff',
        '#009900','#009933','#009966','#009999','#0099cc','#0099ff',
        '#00cc00','#00cc33','#00cc66','#00cc99','#00cccc','#00ccff',
        '#00ff00','#00ff33','#00ff66','#00ff99','#00ffcc','#00ffff',
    ],
    'mac-os-classic': [
        '#000000','#404040','#808080','#bfbfbf','#ffffff',
        '#7f0000','#ff0000','#7f7f00','#ffff00','#007f00','#00ff00','#007f7f','#00ffff',
        '#00007f','#0000ff','#7f007f','#ff00ff','#ff7f00','#7f3f00','#ffbf7f','#7f7f3f',
    ],
};

export interface ColorPickerTileOptions {
    palette?    : keyof typeof PALETTES | string[];
    color?      : string;
    showRecent? : boolean;
    recentMax?  : number;
    showInput?  : boolean;
    columns?    : number;
    tileSize?   : number;
}

interface TileState { selected: string; recent: string[]; }

export class ColorPickerTile extends Component('arianna-color-picker-tile', HTMLElement, {}, {
    attrs : ['palette', 'color', 'show-recent', 'recent-max', 'show-input', 'columns', 'tile-size'],
    shadow: false,
})
{
    state$: Signal<TileState> = signal<TileState>({ selected: '#000000', recent: [] });
    /** Custom palette override (takes precedence over attr `palette`). */
    paletteOverride$: Signal<string[] | null> = signal<string[] | null>(null);

    build(_opts: ColorPickerTileOptions = {})
    {
        const colsAttr = this.attrSignal('columns');
        const tileSizeAttr = this.attrSignal('tile-size');

        this.cols = () => parseInt(colsAttr.get() ?? '8', 10) || 8;
        this.size = () => parseInt(tileSizeAttr.get() ?? '28', 10) || 28;
        this.showRecent = () => this.getAttribute('show-recent') !== 'false';
        this.showInput  = () => this.getAttribute('show-input')  !== 'false';

        this.gridStyle = () => `grid-template-columns: repeat(${this.cols()}, ${this.size()}px)`;
        this.recentStyle = () => `grid-template-columns: repeat(auto-fill, ${this.size()}px)`;

        this.paletteTiles = (): Array<{ hex: string; style: string; cls: string }> => {
            const sz = this.size();
            const sel = this.state$.get().selected.toLowerCase();
            return this.#resolvePalette().map(hex => ({
                hex,
                style: `background: ${hex}; width: ${sz}px; height: ${sz}px`,
                cls: 'ar-cpt__tile' + (hex.toLowerCase() === sel ? ' ar-cpt__tile--sel' : ''),
            }));
        };
        this.recentTiles = (): Array<{ hex: string; style: string }> => {
            const sz = this.size();
            return this.state$.get().recent.map(hex => ({
                hex,
                style: `background: ${hex}; width: ${sz}px; height: ${sz}px`,
            }));
        };
        this.hasRecent = () => this.state$.get().recent.length > 0;
        this.inputVal  = () => this.state$.get().selected;

        this.onTileClick = (e: Event) => {
            const btn = e.currentTarget as HTMLButtonElement;
            const hex = btn.dataset.color;
            if (hex) this.setColor(hex);
        };
        this.onInputChange = (e: Event) => {
            const v = (e.target as HTMLInputElement).value.trim();
            this.setColor(v);
        };
        this.onPickerInput = (e: Event) => {
            this.setColor((e.target as HTMLInputElement).value);
        };

        this.template = html`
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

        this.Sheet = ColorPickerTile.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    set palette(v: keyof typeof PALETTES | string[]) {
        if (Array.isArray(v)) {
            this.paletteOverride$.set(v);
        } else {
            this.paletteOverride$.set(null);
            this.setAttribute('palette', v);
        }
    }
    get palette(): string[] { return this.#resolvePalette(); }

    setColor(hex: string): this {
        const p = parseHex(hex);
        if (!p) return this;
        const canonical = rgbToHex(p.r, p.g, p.b);
        const cur = this.state$.get();
        const recent = [canonical, ...cur.recent.filter(c => c.toLowerCase() !== canonical.toLowerCase())]
            .slice(0, parseInt(this.getAttribute('recent-max') ?? '12', 10) || 12);
        this.state$.set({ selected: canonical, recent });
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true,
            detail: { hex: canonical, rgb: { r: p.r, g: p.g, b: p.b } },
        }));
        return this;
    }

    getColor(): { hex: string; rgb: { r: number; g: number; b: number } } {
        const hex = this.state$.get().selected;
        const p = parseHex(hex) ?? { r: 0, g: 0, b: 0, a: 1 };
        return { hex, rgb: { r: p.r, g: p.g, b: p.b } };
    }

    getRecent(): string[] { return this.state$.get().recent.slice(); }

    #resolvePalette(): string[] {
        const override = this.paletteOverride$.get();
        if (override) return override;
        const name = this.getAttribute('palette') ?? 'tailwind';
        return PALETTES[name] || PALETTES['tailwind']!;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const init = this.getAttribute('color');
        if (init) this.setColor(init);
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private cols        : () => number = () => 8;
    private size        : () => number = () => 28;
    private showRecent  : () => boolean = () => true;
    private showInput   : () => boolean = () => true;
    private gridStyle   : () => string = () => '';
    private recentStyle : () => string = () => '';
    private paletteTiles: () => Array<{ hex: string; style: string; cls: string }> = () => [];
    private recentTiles : () => Array<{ hex: string; style: string }> = () => [];
    private hasRecent   : () => boolean = () => false;
    private inputVal    : () => string = () => '#000000';
    private onTileClick : (e: Event) => void = () => {};
    private onInputChange: (e: Event) => void = () => {};
    private onPickerInput: (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'inline-flex',
                    flexDirection: 'column',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    gap         : '8px',
                    padding     : '12px',
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
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ColorPickerTile', {
        value: ColorPickerTile, writable: false, enumerable: false, configurable: false,
    });
}

export default ColorPickerTile;
