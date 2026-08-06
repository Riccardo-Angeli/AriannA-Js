/**
 * @module    components/display/Avatar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Avatar component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Avatar
 *  @public
 *  @description Namespace containing Avatar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Avatar
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   AvatarOptions
         *  @public
         *  @description AvatarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AvatarOptions
        {
            /** @name        size
             *  @public
             *  @type        {number}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: number;

            /** @name        shape
             *  @public
             *  @type        {'circle' | 'square' | 'rounded'}
             *  @description Component member for shape.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            shape?: 'circle' | 'square' | 'rounded';

            /** @name        status
             *  @public
             *  @type        {'online' | 'offline' | 'busy' | 'away'}
             *  @description Component member for status.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            status?: 'online' | 'offline' | 'busy' | 'away';

            /** @name        src
             *  @public
             *  @type        {string}
             *  @description Component member for src.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            src?: string;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name?: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       Avatar
     *  @public
     *  @description AriannA Avatar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-avatar', {}, {
        Attributes: ['src', 'name', 'icon', 'size', 'shape', 'status'],
    })
    export class Avatar extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Avatar.Interfaces.AvatarOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.AvatarOptions = {})
        {
            // Reactive attribute signals — re-read on every render
            /** @name        src
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned src value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const src = this.signal().attribute('src');

            /** @name        name
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned name value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const name = this.signal().attribute('name');

            /** @name        icon
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned icon value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const icon = this.signal().attribute('icon');

            /** @name        size
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned size value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const size = this.signal().attribute('size');

            /** @name        shape
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned shape value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const shape = this.signal().attribute('shape');

            /** @name        status
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned status value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const status = this.signal().attribute('status');
            // Sizing reflected as inline style on host
            /** @name        applySize
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned applySize value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const applySize = () => {
                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
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
                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = name.Get();
                if (!n)
                    return '';
                return n.trim().split(/\s+/).slice(0, 2).map((w: any) => w[0] ?? '').join('').toUpperCase();
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
                /** @name        Sheet
                 *  @public
                 *  @type        {Avatar.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Avatar.DefaultSheet();
        }
        // Lifecycle hooks (full Vue-like surface per CONVENTIONS Q4)
        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }
        // Typed property surface mirroring attributes
        /** @name        src
         *  @public
         *  @type        {string}
         *  @description Component member for src.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get src(): string { return this.getAttribute('src') ?? ''; }

        /** @name        src
         *  @public
         *  @type        {void}
         *  @description Component member for src.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set src(v: string) { v ? this.setAttribute('src', v) : this.removeAttribute('src'); }

        /** @name        name
         *  @public
         *  @type        {string}
         *  @description Component member for name.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get name(): string { return this.getAttribute('name') ?? ''; }

        /** @name        name
         *  @public
         *  @type        {void}
         *  @description Component member for name.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set name(v: string) { v ? this.setAttribute('name', v) : this.removeAttribute('name'); }

        /** @name        icon
         *  @public
         *  @type        {string}
         *  @description Component member for icon.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get icon(): string { return this.getAttribute('icon') ?? ''; }

        /** @name        icon
         *  @public
         *  @type        {void}
         *  @description Component member for icon.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

        /** @name        size
         *  @public
         *  @type        {number}
         *  @description Component member for size.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): number { return parseInt(this.getAttribute('size') ?? '36', 10); }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: number) { this.setAttribute('size', String(v)); }

        /** @name        shape
         *  @public
         *  @type        {'circle' | 'square' | 'rounded'}
         *  @description Component member for shape.
         *  @returns     {'circle' | 'square' | 'rounded'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get shape(): 'circle' | 'square' | 'rounded' { return (this.getAttribute('shape') ?? 'circle') as never; }

        /** @name        shape
         *  @public
         *  @type        {void}
         *  @description Component member for shape.
         *  @param       {'circle' | 'square' | 'rounded'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set shape(v: 'circle' | 'square' | 'rounded') { this.setAttribute('shape', v); }

        /** @name        status
         *  @public
         *  @type        {string}
         *  @description Component member for status.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get status(): string { return this.getAttribute('status') ?? ''; }

        /** @name        status
         *  @public
         *  @type        {void}
         *  @description Component member for status.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set status(v: string) { v ? this.setAttribute('status', v) : this.removeAttribute('status'); }
        // Template helpers (set in build)
        /** @name        computedInitials
         *  @private
         *  @type        {() => string}
         *  @description Component member for computed Initials.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private computedInitials: () => string = () => '';

        /** @name        hasSrc
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasSrc: () => boolean = () => false;

        /** @name        hasName
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasName: () => boolean = () => false;

        /** @name        hasIcon
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasIcon: () => boolean = () => false;

        /** @name        hasStatus
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Status.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasStatus: () => boolean = () => false;

        /** @name        _src
         *  @private
         *  @type        {() => string}
         *  @description Component member for _src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _src: () => string = () => '';

        /** @name        _icon
         *  @private
         *  @type        {() => string}
         *  @description Component member for _icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _icon: () => string = () => '';

        /** @name        _statusCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for _status Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _statusCls: () => string = () => '';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Avatar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Avatar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
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
}
export default Avatar;

export type AvatarOptions = Avatar.Interfaces.AvatarOptions;
