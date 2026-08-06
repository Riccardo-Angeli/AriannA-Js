import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/display/Avatar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Avatar — circular/square user image with initials and status dot fallback.
 *
 * Renders an image when `src` is set; otherwise renders up-to-2-letter initials
 * derived from `name`; if no src and no name, renders an icon glyph. A coloured
 * status dot is overlaid bottom-right when `status` is present.
 *
 * @example JS
 *   const av = new Avatar();
 *   av.src    = '/me.jpg';
 *   av.name   = 'Riccardo Angeli';
 *   av.status = 'online';
 *   document.body.append(av);
 *
 * @example HTML
 *   <arianna-avatar size="48" shape="circle" name="Riccardo Angeli" status="online"></arianna-avatar>
 *
 * Events: (none)
 * Slots:  (none)
 * Attributes:  src, name, icon, size, shape, status, class
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface AvatarOptions {
    size?: number;
    shape?: 'circle' | 'square' | 'rounded';
    status?: 'online' | 'offline' | 'busy' | 'away';
    src?: string;
    name?: string;
    icon?: string;
}
@Component('arianna-avatar', {}, {
    Attributes: ['src', 'name', 'icon', 'size', 'shape', 'status'],
})
export class Avatar extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: AvatarOptions = {}) {
        // Reactive attribute signals — re-read on every render
        const src = this.signal().attribute('src');
        const name = this.signal().attribute('name');
        const icon = this.signal().attribute('icon');
        const size = this.signal().attribute('size');
        const shape = this.signal().attribute('shape');
        const status = this.signal().attribute('status');
        // Sizing reflected as inline style on host
        const applySize = () => {
            const s = parseInt(size.Get() ?? '36', 10) || 36;
            this.style.width = s + 'px';
            this.style.height = s + 'px';
            this.style.fontSize = Math.round(s * 0.38) + 'px';
        };
        applySize();
        // React to size changes
        this.addEventListener('arianna:attr-size', applySize);
        // Helpers used inside template
        this.computedInitials = () => {
            const n = name.Get();
            if (!n)
                return '';
            return n.trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
        };
        this.hasSrc = () => !!src.Get();
        this.hasName = () => !!name.Get() && !src.Get();
        this.hasIcon = () => !!icon.Get() && !src.Get() && !name.Get();
        this.hasStatus = () => !!status.Get();
        this._src = () => src.Get() ?? '';
        this._icon = () => icon.Get() ?? '';
        this._statusCls = () => 'ar-avatar__status ar-avatar__status--' + (status.Get() ?? '');
        this.template = html `
            <img class="ar-avatar__img" a-if="this.hasSrc()" :src="this._src()" :alt="this.getAttribute('name') ?? ''"/>
            <span class="ar-avatar__initials" a-if="this.hasName()">{{ this.computedInitials() }}</span>
            <span class="ar-avatar__icon"     a-if="this.hasIcon()">{{ this._icon() }}</span>
            <span a-if="this.hasStatus()" :class="this._statusCls()"></span>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Avatar.DefaultSheet();
    }
    // Lifecycle hooks (full Vue-like surface per CONVENTIONS Q4)
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    // Typed property surface mirroring attributes
    get src(): string { return this.getAttribute('src') ?? ''; }
    set src(v: string) { v ? this.setAttribute('src', v) : this.removeAttribute('src'); }
    get name(): string { return this.getAttribute('name') ?? ''; }
    set name(v: string) { v ? this.setAttribute('name', v) : this.removeAttribute('name'); }
    get icon(): string { return this.getAttribute('icon') ?? ''; }
    set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }
    get size(): number { return parseInt(this.getAttribute('size') ?? '36', 10); }
    set size(v: number) { this.setAttribute('size', String(v)); }
    get shape(): 'circle' | 'square' | 'rounded' { return (this.getAttribute('shape') ?? 'circle') as never; }
    set shape(v: 'circle' | 'square' | 'rounded') { this.setAttribute('shape', v); }
    get status(): string { return this.getAttribute('status') ?? ''; }
    set status(v: string) { v ? this.setAttribute('status', v) : this.removeAttribute('status'); }
    // Template helpers (set in build)
    private computedInitials: () => string = () => '';
    private hasSrc: () => boolean = () => false;
    private hasName: () => boolean = () => false;
    private hasIcon: () => boolean = () => false;
    private hasStatus: () => boolean = () => false;
    private _src: () => string = () => '';
    private _icon: () => string = () => '';
    private _statusCls: () => string = () => '';
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                alignItems: 'center',
                background: 'var(--arianna-bg-3, #e5e5e5)',
                display: 'inline-flex',
                flexShrink: '0',
                fontWeight: '600',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                color: 'var(--arianna-text, #1f2328)',
            }),
            new Rule(':host([shape="circle"])', { borderRadius: '50%' }),
            new Rule(':host([shape="square"])', { borderRadius: '0' }),
            new Rule(':host([shape="rounded"])', { borderRadius: 'var(--arianna-radius, 6px)' }),
            new Rule(':host(:not([shape]))', { borderRadius: '50%' }),
            new Rule('.ar-avatar__img', {
                height: '100%',
                objectFit: 'cover',
                width: '100%',
            }),
            new Rule('.ar-avatar__status', {
                border: '2px solid var(--arianna-bg, #ffffff)',
                borderRadius: '50%',
                bottom: '1px',
                height: '10px',
                position: 'absolute',
                right: '1px',
                width: '10px',
            }),
            new Rule('.ar-avatar__status--online', { background: 'var(--arianna-success, #2ea043)' }),
            new Rule('.ar-avatar__status--offline', { background: 'var(--arianna-muted, #8b949e)' }),
            new Rule('.ar-avatar__status--busy', { background: 'var(--arianna-danger, #cf222e)' }),
            new Rule('.ar-avatar__status--away', { background: 'var(--arianna-warning, #d29922)' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Avatar namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Avatar {
    export namespace Interfaces {
        export interface Options extends AvatarOptions {
        }
    }
}
export default Avatar;
