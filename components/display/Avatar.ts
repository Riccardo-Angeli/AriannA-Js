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
 * Attrs:  src, name, icon, size, shape, status, class
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface AvatarOptions {
    size?   : number;
    shape?  : 'circle' | 'square' | 'rounded';
    status? : 'online' | 'offline' | 'busy' | 'away';
    src?    : string;
    name?   : string;
    icon?   : string;
}

export class Avatar extends Component('arianna-avatar', HTMLElement, {}, {
    attrs : ['src', 'name', 'icon', 'size', 'shape', 'status'],
    shadow: false,
})
{
    build(_opts: AvatarOptions = {})
    {
        // Reactive attribute signals — re-read on every render
        const src    = this.attrSignal('src');
        const name   = this.attrSignal('name');
        const icon   = this.attrSignal('icon');
        const size   = this.attrSignal('size');
        const shape  = this.attrSignal('shape');
        const status = this.attrSignal('status');

        // Sizing reflected as inline style on host
        const applySize = () => {
            const s = parseInt(size.get() ?? '36', 10) || 36;
            this.style.width    = s + 'px';
            this.style.height   = s + 'px';
            this.style.fontSize = Math.round(s * 0.38) + 'px';
        };
        applySize();
        // React to size changes
        this.addEventListener('arianna:attr-size', applySize);

        // Helpers used inside template
        this.computedInitials = () => {
            const n = name.get();
            if (!n) return '';
            return n.trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
        };
        this.hasSrc    = () => !!src.get();
        this.hasName   = () => !!name.get() && !src.get();
        this.hasIcon   = () => !!icon.get() && !src.get() && !name.get();
        this.hasStatus = () => !!status.get();
        this._src      = () => src.get() ?? '';
        this._icon     = () => icon.get() ?? '';
        this._statusCls = () => 'ar-avatar__status ar-avatar__status--' + (status.get() ?? '');

        this.template = html`
            <img class="ar-avatar__img" a-if="this.hasSrc()" :src="this._src()" :alt="this.getAttribute('name') ?? ''"/>
            <span class="ar-avatar__initials" a-if="this.hasName()">{{ this.computedInitials() }}</span>
            <span class="ar-avatar__icon"     a-if="this.hasIcon()">{{ this._icon() }}</span>
            <span a-if="this.hasStatus()" :class="this._statusCls()"></span>
        `;

        this.Sheet = Avatar.DefaultSheet();
    }

    // Lifecycle hooks (full Vue-like surface per CONVENTIONS Q4)
    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // Typed property surface mirroring attrs
    get src(): string  { return this.getAttribute('src') ?? ''; }
    set src(v: string) { v ? this.setAttribute('src', v) : this.removeAttribute('src'); }

    get name(): string  { return this.getAttribute('name') ?? ''; }
    set name(v: string) { v ? this.setAttribute('name', v) : this.removeAttribute('name'); }

    get icon(): string  { return this.getAttribute('icon') ?? ''; }
    set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

    get size(): number  { return parseInt(this.getAttribute('size') ?? '36', 10); }
    set size(v: number) { this.setAttribute('size', String(v)); }

    get shape(): 'circle' | 'square' | 'rounded' { return (this.getAttribute('shape') ?? 'circle') as never; }
    set shape(v: 'circle' | 'square' | 'rounded') { this.setAttribute('shape', v); }

    get status(): string  { return this.getAttribute('status') ?? ''; }
    set status(v: string) { v ? this.setAttribute('status', v) : this.removeAttribute('status'); }

    // Template helpers (set in build)
    private computedInitials: () => string = () => '';
    private hasSrc   : () => boolean = () => false;
    private hasName  : () => boolean = () => false;
    private hasIcon  : () => boolean = () => false;
    private hasStatus: () => boolean = () => false;
    private _src     : () => string = () => '';
    private _icon    : () => string = () => '';
    private _statusCls: () => string = () => '';

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems    : 'center',
                    background    : 'var(--arianna-bg-3, #e5e5e5)',
                    display       : 'inline-flex',
                    flexShrink    : '0',
                    fontWeight    : '600',
                    justifyContent: 'center',
                    overflow      : 'hidden',
                    position      : 'relative',
                    color         : 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':root[shape="circle"]',  { borderRadius: '50%' }),
                new Rule(':root[shape="square"]',  { borderRadius: '0' }),
                new Rule(':root[shape="rounded"]', { borderRadius: 'var(--arianna-radius, 6px)' }),
                new Rule(':root:not([shape])',     { borderRadius: '50%' }),
                new Rule('.ar-avatar__img', {
                    height    : '100%',
                    objectFit : 'cover',
                    width     : '100%',
                }),
                new Rule('.ar-avatar__status', {
                    border      : '2px solid var(--arianna-bg, #ffffff)',
                    borderRadius: '50%',
                    bottom      : '1px',
                    height      : '10px',
                    position    : 'absolute',
                    right       : '1px',
                    width       : '10px',
                }),
                new Rule('.ar-avatar__status--online',  { background: 'var(--arianna-success, #2ea043)' }),
                new Rule('.ar-avatar__status--offline', { background: 'var(--arianna-muted, #8b949e)' }),
                new Rule('.ar-avatar__status--busy',    { background: 'var(--arianna-danger, #cf222e)' }),
                new Rule('.ar-avatar__status--away',    { background: 'var(--arianna-warning, #d29922)' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Avatar', {
        value: Avatar, writable: false, enumerable: false, configurable: false,
    });
}

export default Avatar;
