/**
 * @module    components/graphics/3D/MaterialsPalette
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * MaterialsPalette — material picker + parameter inspector for 3D editors.
 * Supports the standard three.js material families:
 *
 *   • basic         — flat colour, no lighting
 *   • lambert       — diffuse only
 *   • phong         — diffuse + specular highlights
 *   • standard (PBR)— metalness/roughness physically-based
 *   • physical (PBR)— standard + clearcoat/transmission/sheen
 *   • toon          — cel-shaded
 *   • normal        — surface normals as colour
 *   • wireframe     — line render
 *
 * Each material exposes its own parameters reactively; changes fire
 * `arianna:material-change` so the host renderer can apply them.
 *
 * @example HTML
 *   <arianna-materials-palette kind="standard"></arianna-materials-palette>
 *
 * Events: arianna:material-change  detail: MaterialDef
 * Attrs:  kind
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { signal }    from '../../../core/Observable.ts';
import type { Signal } from '../../../core/Observable.ts';
import { Sheet } from '../../../core/Sheet.ts';
import { Rule }      from '../../../core/Rule.ts';

export type MaterialKind =
    | 'basic' | 'lambert' | 'phong' | 'standard' | 'physical'
    | 'toon' | 'normal' | 'wireframe';

export interface MaterialDef {
    kind         : MaterialKind;
    color?       : string;
    emissive?    : string;
    opacity?     : number;
    metalness?   : number;
    roughness?   : number;
    clearcoat?   : number;
    transmission?: number;
    ior?         : number;
    shininess?   : number;
    side?        : 'front' | 'back' | 'double';
    flatShading? : boolean;
    wireframe?   : boolean;
}

export interface MaterialsPaletteOptions { kind?: MaterialKind; }

const KIND_INFO: Array<{ kind: MaterialKind; label: string; icon: string }> = [
    { kind: 'basic',     label: 'Basic',     icon: '◻' },
    { kind: 'lambert',   label: 'Lambert',   icon: '◐' },
    { kind: 'phong',     label: 'Phong',     icon: '◓' },
    { kind: 'standard',  label: 'Standard',  icon: '◆' },
    { kind: 'physical',  label: 'Physical',  icon: '◈' },
    { kind: 'toon',      label: 'Toon',      icon: '◖' },
    { kind: 'normal',    label: 'Normal',    icon: '⬢' },
    { kind: 'wireframe', label: 'Wireframe', icon: '⊞' },
];

const DEFAULTS: Record<MaterialKind, MaterialDef> = {
    basic:     { kind: 'basic',     color: '#cccccc', opacity: 1 },
    lambert:   { kind: 'lambert',   color: '#cccccc', emissive: '#000000', opacity: 1 },
    phong:     { kind: 'phong',     color: '#cccccc', emissive: '#000000', shininess: 30, opacity: 1 },
    standard:  { kind: 'standard',  color: '#cccccc', emissive: '#000000', metalness: 0, roughness: 0.5, opacity: 1 },
    physical:  { kind: 'physical',  color: '#cccccc', emissive: '#000000', metalness: 0, roughness: 0.5, clearcoat: 0, transmission: 0, ior: 1.5, opacity: 1 },
    toon:      { kind: 'toon',      color: '#cccccc', emissive: '#000000', opacity: 1 },
    normal:    { kind: 'normal' },
    wireframe: { kind: 'wireframe', color: '#cccccc', wireframe: true, opacity: 1 },
};

export class MaterialsPalette extends Component('arianna-materials-palette', HTMLElement, {}, {
    attrs : ['kind'],
    shadow: false,
})
{
    material$: Signal<MaterialDef> = signal<MaterialDef>(DEFAULTS.standard);

    build(_opts: MaterialsPaletteOptions = {})
    {
        const kindAttr = this.attrSignal('kind');

        this.kinds = () => {
            const cur = kindAttr.get() ?? 'standard';
            return KIND_INFO.map(k => ({
                kind: k.kind,
                label: k.label,
                icon: k.icon,
                cls: 'ar-mat__kind' + (cur === k.kind ? ' ar-mat__kind--active' : ''),
            }));
        };

        this.curKind = (): MaterialKind => (kindAttr.get() as MaterialKind) ?? 'standard';
        this.hasColor      = () => !['normal'].includes(this.curKind());
        this.hasEmissive   = () => ['lambert', 'phong', 'standard', 'physical', 'toon'].includes(this.curKind());
        this.hasMetalness  = () => ['standard', 'physical'].includes(this.curKind());
        this.hasRoughness  = () => ['standard', 'physical'].includes(this.curKind());
        this.hasClearcoat  = () => this.curKind() === 'physical';
        this.hasTransmission = () => this.curKind() === 'physical';
        this.hasShininess  = () => this.curKind() === 'phong';
        this.hasIor        = () => this.curKind() === 'physical';

        this.colorVal     = () => this.material$.get().color     ?? '#cccccc';
        this.emissiveVal  = () => this.material$.get().emissive  ?? '#000000';
        this.opacityVal   = () => String(this.material$.get().opacity   ?? 1);
        this.metalnessVal = () => String(this.material$.get().metalness ?? 0);
        this.roughnessVal = () => String(this.material$.get().roughness ?? 0.5);
        this.clearcoatVal = () => String(this.material$.get().clearcoat ?? 0);
        this.transmissionVal = () => String(this.material$.get().transmission ?? 0);
        this.shininessVal = () => String(this.material$.get().shininess ?? 30);
        this.iorVal       = () => String(this.material$.get().ior ?? 1.5);

        this.onKindClick = (e: Event) => {
            const btn = e.currentTarget as HTMLButtonElement;
            const kind = btn.dataset.kind as MaterialKind;
            if (kind) this.setKind(kind);
        };
        this.onParam = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            const param = inp.dataset.param;
            if (!param) return;
            const v: string | number = inp.type === 'number' || inp.type === 'range'
                ? parseFloat(inp.value)
                : inp.value;
            this.setParam(param as keyof MaterialDef, v);
        };

        this.template = html`
            <div class="ar-mat__kinds">
                <button type="button" a-for="k in this.kinds()"
                        :class="k.cls"
                        :data-kind="k.kind"
                        :title="k.label"
                        @click="this.onKindClick">
                    <span class="ar-mat__kind-icon">{{ k.icon }}</span>
                    <span class="ar-mat__kind-lbl">{{ k.label }}</span>
                </button>
            </div>
            <div class="ar-mat__params">
                <label class="ar-mat__field" a-if="this.hasColor()">
                    <span>Color</span>
                    <input type="color" data-param="color" :value="this.colorVal()" @input="this.onParam"/>
                    <input type="text"  data-param="color" :value="this.colorVal()" @change="this.onParam"/>
                </label>
                <label class="ar-mat__field" a-if="this.hasEmissive()">
                    <span>Emissive</span>
                    <input type="color" data-param="emissive" :value="this.emissiveVal()" @input="this.onParam"/>
                </label>
                <label class="ar-mat__field">
                    <span>Opacity</span>
                    <input type="range" data-param="opacity" min="0" max="1" step="0.01" :value="this.opacityVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.opacityVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasMetalness()">
                    <span>Metalness</span>
                    <input type="range" data-param="metalness" min="0" max="1" step="0.01" :value="this.metalnessVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.metalnessVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasRoughness()">
                    <span>Roughness</span>
                    <input type="range" data-param="roughness" min="0" max="1" step="0.01" :value="this.roughnessVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.roughnessVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasClearcoat()">
                    <span>Clearcoat</span>
                    <input type="range" data-param="clearcoat" min="0" max="1" step="0.01" :value="this.clearcoatVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.clearcoatVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasTransmission()">
                    <span>Transmission</span>
                    <input type="range" data-param="transmission" min="0" max="1" step="0.01" :value="this.transmissionVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.transmissionVal() }}</span>
                </label>
                <label class="ar-mat__field" a-if="this.hasIor()">
                    <span>IOR</span>
                    <input type="number" data-param="ior" min="1" max="2.4" step="0.05" :value="this.iorVal()" @change="this.onParam"/>
                </label>
                <label class="ar-mat__field" a-if="this.hasShininess()">
                    <span>Shininess</span>
                    <input type="range" data-param="shininess" min="0" max="200" step="1" :value="this.shininessVal()" @input="this.onParam"/>
                    <span class="ar-mat__num">{{ this.shininessVal() }}</span>
                </label>
            </div>
        `;

        this.Sheet = MaterialsPalette.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setKind(kind: MaterialKind): this {
        this.setAttribute('kind', kind);
        // Reset material to defaults for the new kind, preserving common shared fields
        const cur = this.material$.get();
        const next: MaterialDef = { ...DEFAULTS[kind] };
        if (cur.color) next.color = cur.color;
        if (cur.opacity !== undefined) next.opacity = cur.opacity;
        this.material$.set(next);
        this.#fire();
        return this;
    }
    setParam(param: keyof MaterialDef, value: string | number | boolean): this {
        const cur = this.material$.get();
        this.material$.set({ ...cur, [param]: value });
        this.#fire();
        return this;
    }
    getMaterial(): MaterialDef { return { ...this.material$.get() }; }
    setMaterial(m: MaterialDef): this {
        if (m.kind) this.setAttribute('kind', m.kind);
        this.material$.set({ ...m });
        this.#fire();
        return this;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    #fire(): void {
        this.dispatchEvent(new CustomEvent('arianna:material-change', {
            bubbles: true, detail: this.getMaterial(),
        }));
    }

    private kinds          : () => Array<{ kind: MaterialKind; label: string; icon: string; cls: string }> = () => [];
    private curKind        : () => MaterialKind = () => 'standard';
    private hasColor       : () => boolean = () => true;
    private hasEmissive    : () => boolean = () => false;
    private hasMetalness   : () => boolean = () => false;
    private hasRoughness   : () => boolean = () => false;
    private hasClearcoat   : () => boolean = () => false;
    private hasTransmission: () => boolean = () => false;
    private hasShininess   : () => boolean = () => false;
    private hasIor         : () => boolean = () => false;
    private colorVal       : () => string = () => '#cccccc';
    private emissiveVal    : () => string = () => '#000000';
    private opacityVal     : () => string = () => '1';
    private metalnessVal   : () => string = () => '0';
    private roughnessVal   : () => string = () => '0.5';
    private clearcoatVal   : () => string = () => '0';
    private transmissionVal: () => string = () => '0';
    private shininessVal   : () => string = () => '30';
    private iorVal         : () => string = () => '1.5';
    private onKindClick    : (e: Event) => void = () => {};
    private onParam        : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'flex',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    width       : '320px',
                    minHeight   : '300px',
                    overflow    : 'hidden',
                }),
                new Rule('.ar-mat__kinds', {
                    display: 'flex', flexDirection: 'column',
                    gap: '2px', padding: '4px',
                    width: '90px',
                    borderRight: '1px solid var(--arianna-border, #d8d8d8)',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule('.ar-mat__kind', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 7px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                }),
                new Rule('.ar-mat__kind:hover', { background: 'var(--arianna-bg, #fff)' }),
                new Rule('.ar-mat__kind--active', {
                    background: 'var(--arianna-bg, #fff)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-mat__kind-icon', { fontSize: '13px' }),
                new Rule('.ar-mat__kind-lbl',  { fontSize: '11px' }),
                new Rule('.ar-mat__params', {
                    flex: '1', padding: '8px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    overflowY: 'auto',
                }),
                new Rule('.ar-mat__field', {
                    display: 'flex', alignItems: 'center', gap: '6px',
                }),
                new Rule('.ar-mat__field span:first-child', {
                    width: '76px',
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-mat__field input[type="range"]', { flex: '1' }),
                new Rule('.ar-mat__field input[type="text"], .ar-mat__field input[type="number"]', {
                    flex: '1', minWidth: '0',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '3px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '2px',
                }),
                new Rule('.ar-mat__field input[type="color"]', {
                    width: '28px', height: '22px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '0', background: 'transparent',
                    cursor: 'pointer',
                }),
                new Rule('.ar-mat__num', {
                    width: '30px',
                    fontSize: '10px', fontFamily: 'ui-monospace, monospace',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textAlign: 'right',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'MaterialsPalette', {
        value: MaterialsPalette, writable: false, enumerable: false, configurable: false,
    });
}

export default MaterialsPalette;
