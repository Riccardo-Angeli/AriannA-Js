import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/inputs/Rating
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Rating — star rating input (0 to max).
 *
 * @example HTML
 *   <arianna-rating max="5" value="3"></arianna-rating>
 *
 * Events: arianna:change  detail: { value }
 * Attributes:  max, value, readonly, disabled, icon, empty-icon
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface RatingOptions {
    max?: number;
    value?: number;
    readonly?: boolean;
    disabled?: boolean;
    icon?: string;
    emptyIcon?: string;
}
interface Star {
    index: number;
    filled: boolean;
    cls: string;
    icon: string;
}
@Component('arianna-rating', {}, {
    Attributes: ['max', 'value', 'readonly', 'disabled', 'icon', 'empty-icon'],
})
export class Rating extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: RatingOptions = {}) {
        const max = this.signal().attribute('max');
        const value = this.signal().attribute('value');
        const icon = this.signal().attribute('icon');
        const emptyIcon = this.signal().attribute('empty-icon');
        this.maxVal = () => parseInt(max.Get() ?? '5', 10) || 5;
        this.currentVal = () => parseFloat(value.Get() ?? '0') || 0;
        this.isReadonly = () => this.hasAttribute('readonly');
        this.isDisabled = () => this.hasAttribute('disabled');
        this.fullIcon = () => icon.Get() ?? '★';
        this.unfilledIcon = () => emptyIcon.Get() ?? '☆';
        this.stars = (): Star[] => {
            const m = this.maxVal();
            const v = this.currentVal();
            const out: Star[] = [];
            for (let i = 1; i <= m; i++) {
                const filled = i <= v;
                out.push({
                    index: i,
                    filled,
                    cls: 'ar-rating__star' + (filled ? ' ar-rating__star--filled' : ''),
                    icon: filled ? this.fullIcon() : this.unfilledIcon(),
                });
            }
            return out;
        };
        this.onStarClick = (star: Star) => {
            if (this.isReadonly() || this.isDisabled())
                return;
            this.setAttribute('value', String(star.index));
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { value: star.index },
            }));
        };
        this.template = html `
            <button :class="s.cls"
                    a-for="s in this.stars()"
                    :disabled="this.isDisabled()"
                    @click="(e) => this.onStarClick(s)">{{ s.icon }}</button>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Rating.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get max(): number { return parseInt(this.getAttribute('max') ?? '5', 10); }
    set max(v: number) { this.setAttribute('max', String(v)); }
    get value(): number { return parseFloat(this.getAttribute('value') ?? '0'); }
    set value(v: number) { this.setAttribute('value', String(v)); }
    private maxVal: () => number = () => 5;
    private currentVal: () => number = () => 0;
    private isReadonly: () => boolean = () => false;
    private isDisabled: () => boolean = () => false;
    private fullIcon: () => string = () => '★';
    private unfilledIcon: () => string = () => '☆';
    private stars: () => Star[] = () => [];
    private onStarClick: (s: Star) => void = () => { };
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', { display: 'inline-flex', gap: '2px' }),
            new Rule('.ar-rating__star', {
                background: 'none',
                border: 'none',
                color: 'var(--arianna-border, #d8d8d8)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0 2px',
                transition: 'color 0.14s ease, transform 0.14s ease',
            }),
            new Rule('.ar-rating__star--filled', { color: '#f5a623' }),
            new Rule('.ar-rating__star:hover:not(:disabled)', { transform: 'scale(1.15)' }),
            new Rule('.ar-rating__star:disabled', { cursor: 'not-allowed', opacity: '0.5' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Rating namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Rating {
    export namespace Interfaces {
        export interface Options extends RatingOptions {
        }
        export interface StarContract extends Star {
        }
    }
}
export default Rating;
