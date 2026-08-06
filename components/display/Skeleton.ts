import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes:  variant, lines, avatar, width, height
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface SkeletonOptions {
    variant?: 'text' | 'rect' | 'circle' | 'card';
    lines?: number;
    avatar?: boolean;
    width?: string;
    height?: string;
}
@Component('arianna-skeleton', {}, {
    Attributes: ['variant', 'lines', 'avatar', 'width', 'height'],
})
export class Skeleton extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: SkeletonOptions = {}) {
        const variant = this.signal().attribute('variant');
        const lines = this.signal().attribute('lines');
        const width = this.signal().attribute('width');
        const height = this.signal().attribute('height');
        this.variantIs = (name: string) => (variant.Get() ?? 'text') === name;
        this.hasAvatar = () => this.hasAttribute('avatar');
        this.linesArr = () => {
            const n = parseInt(lines.Get() ?? '3', 10) || 3;
            return Array.from({ length: n }, (_, i) => ({ index: i, last: i === n - 1 }));
        };
        this.lineStyle = (last: boolean): Record<string, string> => last ? { width: '60%' } : {};
        this.circleStyle = (): Record<string, string> => {
            const w = width.Get();
            const h = height.Get() || w;
            if (!w)
                return {};
            const out: Record<string, string> = { width: w };
            if (h)
                out.height = h;
            return out;
        };
        this.rectStyle = () => {
            const w = width.Get();
            const h = height.Get();
            const out: Record<string, string> = {};
            if (w)
                out.width = w;
            if (h)
                out.height = h;
            return out;
        };
        this.template = html `
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
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Skeleton.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get variant(): string { return this.getAttribute('variant') ?? 'text'; }
    set variant(v: string) { this.setAttribute('variant', v); }
    get lines(): number { return parseInt(this.getAttribute('lines') ?? '3', 10); }
    set lines(v: number) { this.setAttribute('lines', String(v)); }
    get avatar(): boolean { return this.hasAttribute('avatar'); }
    set avatar(v: boolean) { v ? this.setAttribute('avatar', '') : this.removeAttribute('avatar'); }
    get width(): string { return this.getAttribute('width') ?? ''; }
    set width(v: string) { v ? this.setAttribute('width', v) : this.removeAttribute('width'); }
    get height(): string { return this.getAttribute('height') ?? ''; }
    set height(v: string) { v ? this.setAttribute('height', v) : this.removeAttribute('height'); }
    private variantIs: (n: string) => boolean = () => false;
    private hasAvatar: () => boolean = () => false;
    private linesArr: () => Array<{
        index: number;
        last: boolean;
    }> = () => [];
    private lineStyle: (last: boolean) => Record<string, string> = () => ({});
    private circleStyle: () => Record<string, string> = () => ({});
    private rectStyle: () => Record<string, string> = () => ({});
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '8px' }),
            new Rule('.ar-skeleton__row', { display: 'flex', alignItems: 'center', gap: '12px' }),
            new Rule('.ar-skeleton__lines', { flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }),
            new Rule('.ar-skeleton__line, .ar-skeleton__rect, .ar-skeleton__circle', {
                animation: 'ar-shimmer 1.5s infinite ease-in-out',
                background: 'linear-gradient(90deg, var(--arianna-bg-3, #f3f3f3) 25%, var(--arianna-bg-4, #e5e5e5) 50%, var(--arianna-bg-3, #f3f3f3) 75%)',
                backgroundSize: '200% 100%',
                borderRadius: 'var(--arianna-radius, 6px)',
            }),
            new Rule('.ar-skeleton__line', { height: '12px', width: '100%' }),
            new Rule('.ar-skeleton__rect', { height: '80px', width: '100%' }),
            new Rule('.ar-skeleton__circle', { borderRadius: '50%', flexShrink: '0', height: '40px', width: '40px' }),
            new Rule('@keyframes ar-shimmer', {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' },
            } as never),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Skeleton namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Skeleton {
    export namespace Interfaces {
        export interface Options extends SkeletonOptions {
        }
    }
}
export default Skeleton;
