/**
 * @module    components/display/Skeleton
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Skeleton — animated loading placeholder. Variants: text (n lines), rect,
 * circle, card (rect + 3 text lines), or text+avatar row.
 *
 * @example JS
 *   const sk = new Skeleton();
 *   sk.variant = 'card';
 *   // remove from DOM when data is ready
 *   sk.remove();
 *
 * @example HTML
 *   <arianna-skeleton variant="text" lines="3"></arianna-skeleton>
 *   <arianna-skeleton variant="card"></arianna-skeleton>
 *   <arianna-skeleton variant="circle" width="40px"></arianna-skeleton>
 *
 * Events: (none)
 * Slots:  (none)
 * Attrs:  variant, lines, avatar, width, height
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface SkeletonOptions {
    variant? : 'text' | 'rect' | 'circle' | 'card';
    lines?   : number;
    avatar?  : boolean;
    width?   : string;
    height?  : string;
}

export class Skeleton extends Component('arianna-skeleton', HTMLElement, {}, {
    attrs : ['variant', 'lines', 'avatar', 'width', 'height'],
    shadow: false,
})
{
    build(_opts: SkeletonOptions = {})
    {
        const variant = this.attrSignal('variant');
        const lines   = this.attrSignal('lines');
        const width   = this.attrSignal('width');
        const height  = this.attrSignal('height');

        this.variantIs   = (name: string) => (variant.get() ?? 'text') === name;
        this.hasAvatar   = () => this.hasAttribute('avatar');
        this.linesArr    = () => {
            const n = parseInt(lines.get() ?? '3', 10) || 3;
            return Array.from({ length: n }, (_, i) => ({ index: i, last: i === n - 1 }));
        };
        this.lineStyle   = (last: boolean): Record<string, string> => last ? { width: '60%' } : {};
        this.circleStyle = (): Record<string, string> => {
            const w = width.get();
            const h = height.get() || w;
            if (!w) return {};
            const out: Record<string, string> = { width: w };
            if (h) out.height = h;
            return out;
        };
        this.rectStyle = () => {
            const w = width.get();
            const h = height.get();
            const out: Record<string, string> = {};
            if (w) out.width = w;
            if (h) out.height = h;
            return out;
        };

        this.template = html`
            <div class="ar-skeleton__circle" a-if="this.variantIs('circle')" :style="this.circleStyle()"></div>
            <div class="ar-skeleton__rect"   a-if="this.variantIs('rect')"   :style="this.rectStyle()"></div>

            <div a-if="this.variantIs('card')">
                <div class="ar-skeleton__rect" style="height:160px"></div>
                <div class="ar-skeleton__line" a-for="i in [1,2,3]"></div>
            </div>

            <div class="ar-skeleton__row" a-if="this.variantIs('text') && this.hasAvatar()">
                <div class="ar-skeleton__circle"></div>
                <div class="ar-skeleton__lines">
                    <div class="ar-skeleton__line"></div>
                    <div class="ar-skeleton__line" style="width:60%"></div>
                </div>
            </div>

            <div a-if="this.variantIs('text') && !this.hasAvatar()">
                <div class="ar-skeleton__line" a-for="line in this.linesArr()" :style="this.lineStyle(line.last)"></div>
            </div>
        `;

        this.Sheet = Skeleton.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): string  { return this.getAttribute('variant') ?? 'text'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get lines(): number  { return parseInt(this.getAttribute('lines') ?? '3', 10); }
    set lines(v: number) { this.setAttribute('lines', String(v)); }

    get avatar(): boolean  { return this.hasAttribute('avatar'); }
    set avatar(v: boolean) { v ? this.setAttribute('avatar', '') : this.removeAttribute('avatar'); }

    get width(): string  { return this.getAttribute('width') ?? ''; }
    set width(v: string) { v ? this.setAttribute('width', v) : this.removeAttribute('width'); }

    get height(): string  { return this.getAttribute('height') ?? ''; }
    set height(v: string) { v ? this.setAttribute('height', v) : this.removeAttribute('height'); }

    private variantIs  : (n: string) => boolean = () => false;
    private hasAvatar  : () => boolean = () => false;
    private linesArr   : () => Array<{ index: number; last: boolean }> = () => [];
    private lineStyle  : (last: boolean) => Record<string, string> = () => ({});
    private circleStyle: () => Record<string, string> = () => ({});
    private rectStyle  : () => Record<string, string> = () => ({});

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'flex', flexDirection: 'column', gap: '8px' }),
                new Rule('.ar-skeleton__row',   { display: 'flex', alignItems: 'center', gap: '12px' }),
                new Rule('.ar-skeleton__lines', { flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }),
                new Rule('.ar-skeleton__line, .ar-skeleton__rect, .ar-skeleton__circle', {
                    animation       : 'ar-shimmer 1.5s infinite ease-in-out',
                    background      : 'linear-gradient(90deg, var(--arianna-bg-3, #f3f3f3) 25%, var(--arianna-bg-4, #e5e5e5) 50%, var(--arianna-bg-3, #f3f3f3) 75%)',
                    backgroundSize  : '200% 100%',
                    borderRadius    : 'var(--arianna-radius, 6px)',
                }),
                new Rule('.ar-skeleton__line', { height: '12px', width: '100%' }),
                new Rule('.ar-skeleton__rect', { height: '80px', width: '100%' }),
                new Rule('.ar-skeleton__circle', { borderRadius: '50%', flexShrink: '0', height: '40px', width: '40px' }),
                new Rule('@keyframes ar-shimmer', {
                    '0%'  : { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                } as never),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Skeleton', {
        value: Skeleton, writable: false, enumerable: false, configurable: false,
    });
}

export default Skeleton;
