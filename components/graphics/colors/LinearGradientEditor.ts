/**
 * @module    components/graphics/colors/LinearGradientEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * LinearGradientEditor — Illustrator/Photoshop style linear gradient editor.
 * Composes the shared stop-management state with linear-specific geometry:
 * angle (degrees, CSS convention 0=up, 90=right) + interpolation space.
 *
 * @example HTML
 *   <arianna-linear-gradient-editor angle="45" interp="oklab"></arianna-linear-gradient-editor>
 *
 * @example JS
 *   const ed = new LinearGradientEditor();
 *   ed.addEventListener('arianna:change', e => apply(ed.toCSS()));
 *
 * Events: arianna:change  detail: { stops, angle, interp, css }
 * Attrs:  angle, interp
 */

import { Component } from '../../../core/Component.ts';
import { html }      from '../../../core/Template.ts';
import { Stylesheet } from '../../../core/Stylesheet.ts';
import { Rule }      from '../../../core/Rule.ts';
import {
    type GradientStop, type RGBA,
    makeStopState, stopsToCss, clamp01,
    colorFieldHex, parseColorString,
} from './GradientEditor.ts';

export type GradientInterp = 'srgb' | 'oklab' | 'oklch' | 'hsl';

export interface LinearGradientEditorOptions {
    stops? : GradientStop[];
    angle? : number;
    interp?: GradientInterp;
    alpha? : boolean;
}

export class LinearGradientEditor extends Component('arianna-linear-gradient-editor', HTMLElement, {}, {
    attrs : ['angle', 'interp'],
})
{
    state = makeStopState();

    build(_opts: LinearGradientEditorOptions = {})
    {
        const angleAttr  = this.attrSignal('angle');
        const interpAttr = this.attrSignal('interp');

        const angle  = () => parseFloat(angleAttr.get()  ?? '90') || 0;
        const interp = (): GradientInterp =>
            (interpAttr.get() as GradientInterp | null) ?? 'srgb';

        this.stripBg = () => `background: linear-gradient(to right, ${stopsToCss(this.state.stops$.get())})`;
        this.previewBg = () => `background: ${this.toCSS()}`;
        this.angleVal  = () => String(angle());

        this.pins = (): Array<{ left: string; bg: string; cls: string; title: string; idx: number }> => {
            const sel = this.state.selected$.get();
            return this.state.stops$.get().map((s, i) => ({
                left: `left: ${s.t * 100}%; background: ${colorFieldHex(s.color)}`,
                bg  : colorFieldHex(s.color),
                cls : 'ar-grad__pin' + (i === sel ? ' ar-grad__pin--sel' : ''),
                title: `${colorFieldHex(s.color)} @ ${(s.t * 100).toFixed(1)}%`,
                idx : i,
            }));
        };

        this.hasSel = () => this.state.stops$.get().length > 0;
        this.selStop = (): GradientStop => this.state.stops$.get()[this.state.selected$.get()] ?? this.state.stops$.get()[0]!;
        this.selHex = () => colorFieldHex(this.selStop().color);
        this.selT   = () => (this.selStop().t * 100).toFixed(1);
        this.selA   = () => (this.selStop().color.a ?? 1).toFixed(2);

        this.interpIs = (v: string) => interp() === v;

        // ── Handlers ─────────────────────────────────────────────────────
        this.onStripClick = (e: Event) => {
            const me = e as MouseEvent;
            // Only treat as add-stop when click is on the strip itself, not on a pin
            const target = me.target as HTMLElement;
            if (target.classList.contains('ar-grad__pin')) return;
            const strip = me.currentTarget as HTMLElement;
            const rect = strip.getBoundingClientRect();
            const t = (me.clientX - rect.left) / rect.width;
            this.state.addStop(t);
            this.#fire();
        };

        this.onPinPointer = (e: Event) => {
            const me = e as PointerEvent;
            me.stopPropagation();
            const pin = me.currentTarget as HTMLElement;
            const idx = parseInt(pin.dataset.idx ?? '0', 10);
            if (me.type === 'pointerdown') {
                pin.setPointerCapture?.(me.pointerId);
                this.state.selected$.set(idx);
            } else if (!(me.buttons & 1)) return;
            const strip = pin.parentElement?.previousElementSibling as HTMLElement | null;
            if (!strip) return;
            const rect = strip.getBoundingClientRect();
            const t = clamp01((me.clientX - rect.left) / rect.width);
            this.state.updateStop(idx, { t });
            this.#fire();
        };

        this.onPinDblClick = (e: Event) => {
            const me = e as MouseEvent;
            me.stopPropagation();
            const pin = me.currentTarget as HTMLElement;
            const idx = parseInt(pin.dataset.idx ?? '0', 10);
            this.state.removeStop(idx);
            this.#fire();
        };

        this.onAngleChange = (e: Event) => {
            const v = parseFloat((e.target as HTMLInputElement).value) || 0;
            this.setAngle(v);
        };
        this.onInterpChange = (e: Event) => {
            this.setInterp((e.target as HTMLSelectElement).value as GradientInterp);
        };

        this.onSelColorChange = (e: Event) => {
            const v = (e.target as HTMLInputElement).value;
            const c = parseColorString(v);
            if (c) {
                const idx = this.state.selected$.get();
                const cur = this.selStop();
                this.state.updateStop(idx, { color: { ...c, a: cur.color.a } });
                this.#fire();
            }
        };
        this.onSelPosChange = (e: Event) => {
            const v = parseFloat((e.target as HTMLInputElement).value) / 100;
            this.state.updateStop(this.state.selected$.get(), { t: clamp01(v) });
            this.#fire();
        };
        this.onSelAlphaChange = (e: Event) => {
            const v = parseFloat((e.target as HTMLInputElement).value);
            const cur = this.selStop();
            this.state.updateStop(this.state.selected$.get(), {
                color: { ...cur.color, a: Math.max(0, Math.min(1, v)) },
            });
            this.#fire();
        };
        this.onRemove = () => {
            this.state.removeStop(this.state.selected$.get());
            this.#fire();
        };

        this.template = html`
            <div class="ar-grad__row">
                <div class="ar-grad__col">
                    <div class="ar-grad__strip" :style="this.stripBg()" @click="this.onStripClick"></div>
                    <div class="ar-grad__pins">
                        <div a-for="p in this.pins()"
                             :class="p.cls"
                             :style="p.left"
                             :data-idx="p.idx"
                             :title="p.title"
                             @pointerdown="this.onPinPointer"
                             @pointermove="this.onPinPointer"
                             @dblclick="this.onPinDblClick"></div>
                    </div>
                    <div class="ar-grad__field" style="margin-top:10px">
                        <span>Angle</span>
                        <input type="number" min="0" max="360" step="1"
                               :value="this.angleVal()" @change="this.onAngleChange"/>°
                        <span style="margin-left:10px">Space</span>
                        <select @change="this.onInterpChange">
                            <option value="srgb"  :selected="this.interpIs('srgb')">sRGB</option>
                            <option value="oklab" :selected="this.interpIs('oklab')">OKLab</option>
                            <option value="oklch" :selected="this.interpIs('oklch')">OKLCH</option>
                            <option value="hsl"   :selected="this.interpIs('hsl')">HSL</option>
                        </select>
                    </div>
                    <div class="ar-grad__preview" :style="this.previewBg()" style="margin-top:10px"></div>
                </div>
                <div class="ar-grad__inspector" a-if="this.hasSel()">
                    <label class="ar-grad__field">
                        <span>Color</span>
                        <input type="color" :value="this.selHex()" @input="this.onSelColorChange"/>
                        <input type="text"  :value="this.selHex()" @change="this.onSelColorChange"/>
                    </label>
                    <label class="ar-grad__field">
                        <span>Position</span>
                        <input type="number" min="0" max="100" step="0.1"
                               :value="this.selT()" @change="this.onSelPosChange"/>%
                    </label>
                    <label class="ar-grad__field">
                        <span>Alpha</span>
                        <input type="number" min="0" max="1" step="0.01"
                               :value="this.selA()" @change="this.onSelAlphaChange"/>
                    </label>
                    <div class="ar-grad__btns">
                        <button type="button" class="ar-grad__btn ar-grad__btn--danger"
                                @click="this.onRemove">Remove stop</button>
                    </div>
                </div>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = LinearGradientEditor.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setAngle(deg: number): this {
        const v = ((deg % 360) + 360) % 360;
        this.setAttribute('angle', String(v));
        this.#fire();
        return this;
    }
    getAngle(): number { return parseFloat(this.getAttribute('angle') ?? '90') || 0; }

    setInterp(s: GradientInterp): this {
        this.setAttribute('interp', s);
        this.#fire();
        return this;
    }
    getInterp(): GradientInterp { return (this.getAttribute('interp') as GradientInterp) || 'srgb'; }

    setStops(s: GradientStop[]): this { this.state.setStops(s); this.#fire(); return this; }
    getStops(): GradientStop[] { return this.state.stops$.get().map(x => ({ ...x, color: { ...x.color } })); }

    toCSS(): string {
        const stops = stopsToCss(this.state.stops$.get());
        const interp = this.getInterp();
        const space = interp === 'srgb' ? '' : ` in ${interp}`;
        return `linear-gradient(${this.getAngle()}deg${space}, ${stops})`;
    }

    #fire(): void {
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true,
            detail: {
                stops : this.getStops(),
                angle : this.getAngle(),
                interp: this.getInterp(),
                css   : this.toCSS(),
            },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private stripBg     : () => string = () => '';
    private previewBg   : () => string = () => '';
    private angleVal    : () => string = () => '90';
    private pins        : () => Array<{ left: string; bg: string; cls: string; title: string; idx: number }> = () => [];
    private hasSel      : () => boolean = () => false;
    private selStop     : () => GradientStop = () => ({ t: 0, color: { r: 0, g: 0, b: 0, a: 1 } });
    private selHex      : () => string = () => '#000000';
    private selT        : () => string = () => '0';
    private selA        : () => string = () => '1';
    private interpIs    : (v: string) => boolean = () => false;
    private onStripClick: (e: Event) => void = () => {};
    private onPinPointer: (e: Event) => void = () => {};
    private onPinDblClick: (e: Event) => void = () => {};
    private onAngleChange: (e: Event) => void = () => {};
    private onInterpChange: (e: Event) => void = () => {};
    private onSelColorChange: (e: Event) => void = () => {};
    private onSelPosChange  : (e: Event) => void = () => {};
    private onSelAlphaChange: (e: Event) => void = () => {};
    private onRemove        : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet { return LinearGradientEditor.SharedSheet(); }

    /** Shared between Linear / Radial / Shape editors. */
    static SharedSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #fff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'flex',
                    flexDirection: 'column',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    gap         : '10px',
                    padding     : '12px',
                }),
                new Rule('.ar-grad__row', {
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                }),
                new Rule('.ar-grad__col', { flex: '1', minWidth: '0' }),
                new Rule('.ar-grad__strip', {
                    position: 'relative', height: '30px',
                    borderRadius: '3px', cursor: 'copy',
                    boxShadow: 'inset 0 0 0 1px var(--arianna-border, #d8d8d8)',
                    backgroundImage:
                        'linear-gradient(45deg, #bbb 25%, transparent 25%),' +
                        'linear-gradient(-45deg, #bbb 25%, transparent 25%),' +
                        'linear-gradient(45deg, transparent 75%, #bbb 75%),' +
                        'linear-gradient(-45deg, transparent 75%, #bbb 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                }),
                new Rule('.ar-grad__pins', { position: 'relative', height: '14px' }),
                new Rule('.ar-grad__pin', {
                    position: 'absolute', top: '0',
                    width: '12px', height: '14px',
                    transform: 'translateX(-50%)',
                    border: '2px solid #fff', borderRadius: '2px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                    cursor: 'grab',
                    touchAction: 'none',
                }),
                new Rule('.ar-grad__pin--sel', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    transform: 'translateX(-50%) scale(1.15)',
                }),
                new Rule('.ar-grad__field', {
                    display: 'flex', gap: '8px', alignItems: 'center',
                }),
                new Rule('.ar-grad__field span', {
                    width: '70px',
                    fontSize: '10px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-grad__field input[type="text"], .ar-grad__field input[type="number"]', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '4px 6px',
                    font: '11px ui-monospace, monospace',
                    borderRadius: '2px',
                    flex: '1', minWidth: '0',
                }),
                new Rule('.ar-grad__field input[type="color"]', {
                    width: '30px', height: '24px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    padding: '0', background: 'transparent',
                    cursor: 'pointer',
                }),
                new Rule('.ar-grad__field input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-grad__field select', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '4px 6px',
                    font: '11px sans-serif',
                    borderRadius: '2px',
                }),
                new Rule('.ar-grad__btns', { marginTop: '6px' }),
                new Rule('.ar-grad__btn', {
                    background: 'transparent',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '5px 10px',
                    font: '11px sans-serif',
                    borderRadius: '3px',
                    cursor: 'pointer',
                }),
                new Rule('.ar-grad__btn:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-grad__btn--danger:hover', {
                    background: 'var(--arianna-danger, #cf222e)',
                    borderColor: 'var(--arianna-danger, #cf222e)',
                    color: '#fff',
                }),
                new Rule('.ar-grad__preview', {
                    width: '100%', height: '60px',
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 0 1px var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-grad__inspector', {
                    width: '240px', flexShrink: '0',
                    display: 'flex', flexDirection: 'column',
                    gap: '6px',
                }),
                new Rule('.ar-grad__center-pad', {
                    position: 'relative',
                    width: '120px', height: '120px',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '4px',
                    cursor: 'crosshair',
                    touchAction: 'none',
                }),
                new Rule('.ar-grad__center-dot', {
                    position: 'absolute',
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    background: 'var(--arianna-primary, #1f6feb)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                }),
                new Rule('.ar-grad__mesh-canvas', {
                    width: '320px', height: '240px',
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 0 1px var(--arianna-border, #d8d8d8)',
                    cursor: 'crosshair',
                    touchAction: 'none',
                }),
                new Rule('.ar-grad__mesh-pt', {
                    position: 'absolute',
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'grab',
                    touchAction: 'none',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'LinearGradientEditor', {
        value: LinearGradientEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default LinearGradientEditor;
