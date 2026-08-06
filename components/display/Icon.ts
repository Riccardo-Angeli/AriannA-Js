import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/display/Icon
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Icon — generic icon container. Accepts emoji glyphs, single-character icon
 * fonts, or inline SVG markup (auto-detected by leading `<`).
 *
 * @example JS
 *   const i = new Icon();
 *   i.src = '🚀';                  // emoji
 *   i.src = '<svg>...</svg>';      // inline SVG
 *   i.size = 24;
 *
 * @example HTML
 *   <arianna-icon size="20" src="🚀"></arianna-icon>
 *   <arianna-icon size="24" color="#ff3aa1">✨</arianna-icon>
 *
 * Events: (none)
 * Slots:  default — used when `src` is empty (e.g. text glyph children)
 * Attributes:  src, size, color
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface IconOptions {
    src?: string;
    size?: number;
    color?: string;
}
@Component('arianna-icon', {}, {
    Attributes: ['src', 'size', 'color'],
})
export class Icon extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: IconOptions = {}) {
        this.setAttribute('aria-hidden', 'true');
        const src = this.signal().attribute('src');
        const size = this.signal().attribute('size');
        const color = this.signal().attribute('color');
        // Sizing + color reflected on host inline style
        const applyStyle = () => {
            const s = parseInt(size.Get() ?? '', 10);
            if (Number.isFinite(s) && s > 0) {
                this.style.fontSize = s + 'px';
                this.style.width = s + 'px';
                this.style.height = s + 'px';
            }
            else {
                this.style.fontSize = '';
                this.style.width = '';
                this.style.height = '';
            }
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
            Sheet: Stylesheet | null;
        }).Sheet = Icon.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get src(): string { return this.getAttribute('src') ?? ''; }
    set src(v: string) { v ? this.setAttribute('src', v) : this.removeAttribute('src'); }
    get size(): number { return parseInt(this.getAttribute('size') ?? '', 10); }
    set size(v: number) { this.setAttribute('size', String(v)); }
    get color(): string { return this.getAttribute('color') ?? ''; }
    set color(v: string) { v ? this.setAttribute('color', v) : this.removeAttribute('color'); }
    private isSvg: () => boolean = () => false;
    private isText: () => boolean = () => false;
    private isSlotted: () => boolean = () => true;
    private svgHtml: () => string = () => '';
    private textGlyph: () => string = () => '';
    static DefaultSheet(): Stylesheet {
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
/* ──────────────────────────────────────────────────────────────────────────
 * Icon namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Icon {
    export namespace Interfaces {
        export interface Options extends IconOptions {
        }
    }
}
export default Icon;
