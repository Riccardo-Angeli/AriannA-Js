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
 * Attrs:  src, size, color
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface IconOptions {
    src?   : string;
    size?  : number;
    color? : string;
}

export class Icon extends Component('arianna-icon', HTMLElement, {}, {
    attrs : ['src', 'size', 'color'],
    shadow: false,
})
{
    build(_opts: IconOptions = {})
    {
        this.setAttribute('aria-hidden', 'true');

        const src   = this.attrSignal('src');
        const size  = this.attrSignal('size');
        const color = this.attrSignal('color');

        // Sizing + color reflected on host inline style
        const applyStyle = () => {
            const s = parseInt(size.get() ?? '', 10);
            if (Number.isFinite(s) && s > 0) {
                this.style.fontSize = s + 'px';
                this.style.width    = s + 'px';
                this.style.height   = s + 'px';
            } else {
                this.style.fontSize = '';
                this.style.width    = '';
                this.style.height   = '';
            }
            const c = color.get();
            this.style.color = c ?? '';
        };
        applyStyle();
        this.addEventListener('arianna:attr-size',  applyStyle);
        this.addEventListener('arianna:attr-color', applyStyle);

        this.isSvg    = () => (src.get() ?? '').trimStart().startsWith('<');
        this.isText   = () => !!src.get() && !this.isSvg();
        this.isSlotted = () => !src.get();
        this.svgHtml  = () => src.get() ?? '';
        this.textGlyph = () => src.get() ?? '';

        this.template = html`
            <span a-if="this.isSvg()" a-html="this.svgHtml()"></span>
            <span a-if="this.isText()">{{ this.textGlyph() }}</span>
            <slot a-if="this.isSlotted()"></slot>
        `;

        this.Sheet = Icon.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get src(): string  { return this.getAttribute('src') ?? ''; }
    set src(v: string) { v ? this.setAttribute('src', v) : this.removeAttribute('src'); }

    get size(): number  { return parseInt(this.getAttribute('size') ?? '', 10); }
    set size(v: number) { this.setAttribute('size', String(v)); }

    get color(): string  { return this.getAttribute('color') ?? ''; }
    set color(v: string) { v ? this.setAttribute('color', v) : this.removeAttribute('color'); }

    private isSvg    : () => boolean = () => false;
    private isText   : () => boolean = () => false;
    private isSlotted: () => boolean = () => true;
    private svgHtml  : () => string  = () => '';
    private textGlyph: () => string  = () => '';

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems    : 'center',
                    display       : 'inline-flex',
                    flexShrink    : '0',
                    justifyContent: 'center',
                    lineHeight    : '1',
                }),
                new Rule(':root svg', {
                    height: '1em',
                    width : '1em',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Icon', {
        value: Icon, writable: false, enumerable: false, configurable: false,
    });
}

export default Icon;
