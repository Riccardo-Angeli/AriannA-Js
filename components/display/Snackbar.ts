/**
 * @module    components/display/Snackbar
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Snackbar component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   Snackbar
 *  @public
 *  @description Namespace containing Snackbar contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Snackbar
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

        /** @name        SnackbarPosition
         *  @public
         *  @type        {'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'}
         *  @description Type alias for SnackbarPosition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SnackbarPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   SnackbarOptions
         *  @public
         *  @description SnackbarOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SnackbarOptions
        {
            /** @name        message
             *  @public
             *  @type        {string}
             *  @description Component member for message.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            message?: string;

            /** @name        variant
             *  @public
             *  @type        {'default' | 'success' | 'warning' | 'danger' | 'info'}
             *  @description Component member for variant.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';

            /** @name        duration
             *  @public
             *  @type        {number}
             *  @description Component member for duration.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            duration?: number;

            /** @name        position
             *  @public
             *  @type        {Snackbar.Types.SnackbarPosition}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position?: Types.SnackbarPosition;

            /** @name        action
             *  @public
             *  @type        {string}
             *  @description Component member for action.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            action?: string;
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
    export function getContainer(pos: string): HTMLElement {
        /** @name        id
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned id value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const id = 'ar-snack-container-' + pos;

        /** @name        el
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned el value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        let el = document.getElementById(id);
        if (!el)
        {
            el = document.createElement('div');
            el.id = id;
            el.className = 'ar-snackbar-container ar-snackbar-container--' + pos;
            document.body.appendChild(el);
            // Style injected inline once per container
            Object.assign(el.style, {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                pointerEvents: 'none',
                position: 'fixed',
                zIndex: '5000',
                padding: '12px',
                maxWidth: '400px',
            });
            applyContainerPosition(el, pos);
        }
        return el;
    }
    export function applyContainerPosition(el: HTMLElement, pos: string): void {
        /** @name        s
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned s value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const s = el.style;
        s.top = s.bottom = s.left = s.right = '';
        s.transform = '';
        if (pos.startsWith('top-'))
            s.top = '0';
        if (pos.startsWith('bottom-'))
            s.bottom = '0';
        if (pos.endsWith('-left'))
            s.left = '0';
        if (pos.endsWith('-right'))
            s.right = '0';
        if (pos.endsWith('-center'))
        {
            s.left = '50%';
            s.transform = 'translateX(-50%)';
        }
    }

    /** @name        GetContainer
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned GetContainer value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function GetContainer(...args: Parameters<typeof getContainer>): ReturnType<typeof getContainer>
    {
        return getContainer(...args);
    }

    /** @name        ApplyContainerPosition
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ApplyContainerPosition value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ApplyContainerPosition(...args: Parameters<typeof applyContainerPosition>): ReturnType<typeof applyContainerPosition>
    {
        return applyContainerPosition(...args);
    }

    /** @class       Snackbar
     *  @public
     *  @description AriannA Snackbar component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-snackbar', {}, {
        Attributes: ['message', 'variant', 'duration', 'position', 'action'],
    })
    export class Snackbar extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        #timer
         *  @public
         *  @type        {number}
         *  @description Component member for timer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #timer: number = 0;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Snackbar.Interfaces.SnackbarOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.SnackbarOptions = {})
        {
            /** @name        message
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned message value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const message = this.signal().attribute('message');

            /** @name        action
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned action value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const action = this.signal().attribute('action');
            this.style.display = 'none';
            this.messageText = () => message.Get() ?? '';
            this.hasMessage = () => !!message.Get();
            this.actionText = () => action.Get() ?? '';
            this.hasAction = () => !!action.Get();
            this.onActionClick = () => {
                this.dispatchEvent(new CustomEvent('arianna:action', { bubbles: true, detail: {} }));
                this.hide();
            };
            this.onCloseClick = () => this.hide();
            this.template = html `
            <span class="ar-snackbar__msg" a-if="this.hasMessage()">{{ this.messageText() }}</span>
            <span class="ar-snackbar__msg" a-if="!this.hasMessage()"><slot></slot></span>
            <button class="ar-snackbar__action" a-if="this.hasAction()" @click="this.onActionClick">{{ this.actionText() }}</button>
            <button class="ar-snackbar__close" @click="this.onCloseClick" aria-label="Close">✕</button>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Snackbar.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Snackbar.DefaultSheet();
        }

        /** @name        show
         *  @public
         *  @type        {this}
         *  @description Component member for show.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        show(): this
        {
            // Move to the right position container if needed
            /** @name        pos
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pos value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pos = (this.getAttribute('position') ?? 'bottom-center') as Types.SnackbarPosition;

            /** @name        container
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned container value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const container = getContainer(pos);
            if (this.parentElement !== container)
                container.appendChild(this);
            this.style.display = '';
            setTimeout(() => this.classList.add('ar-snackbar--on'), 10);

            /** @name        durAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned durAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const durAttr = this.getAttribute('duration');

            /** @name        dur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dur = durAttr !== null ? parseInt(durAttr, 10) : 4000;
            if (dur > 0)
                this.#timer = window.setTimeout(() => this.hide(), dur);
            this.dispatchEvent(new CustomEvent('arianna:show', { bubbles: true, detail: {} }));
            return this;
        }

        /** @name        hide
         *  @public
         *  @type        {this}
         *  @description Component member for hide.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        hide(): this
        {
            clearTimeout(this.#timer);
            this.classList.remove('ar-snackbar--on');
            setTimeout(() => {
                this.style.display = 'none';
                this.dispatchEvent(new CustomEvent('arianna:hide', { bubbles: true, detail: {} }));
            }, 280);
            return this;
        }

        /** Shorthand: create + show a snackbar in one call. */
        static show(message: string, opts: Omit<Interfaces.SnackbarOptions, 'message'> = {}): Snackbar
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = new Snackbar();
            s.message = message;
            if (opts.variant)
                s.variant = opts.variant;
            if (opts.duration !== undefined)
                s.duration = opts.duration;
            if (opts.position)
                s.position = opts.position;
            if (opts.action)
                s.action = opts.action;
            s.show();
            return s;
        }

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
        onUnmount() { clearTimeout(this.#timer); }

        /** @name        message
         *  @public
         *  @type        {string}
         *  @description Component member for message.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get message(): string { return this.getAttribute('message') ?? ''; }

        /** @name        message
         *  @public
         *  @type        {void}
         *  @description Component member for message.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set message(v: string) { v ? this.setAttribute('message', v) : this.removeAttribute('message'); }

        /** @name        variant
         *  @public
         *  @type        {string}
         *  @description Component member for variant.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get variant(): string { return this.getAttribute('variant') ?? 'default'; }

        /** @name        variant
         *  @public
         *  @type        {void}
         *  @description Component member for variant.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set variant(v: string) { this.setAttribute('variant', v); }

        /** @name        duration
         *  @public
         *  @type        {number}
         *  @description Component member for duration.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get duration(): number { return parseInt(this.getAttribute('duration') ?? '4000', 10); }

        /** @name        duration
         *  @public
         *  @type        {void}
         *  @description Component member for duration.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set duration(v: number) { this.setAttribute('duration', String(v)); }

        /** @name        position
         *  @public
         *  @type        {Snackbar.Types.SnackbarPosition}
         *  @description Component member for position.
         *  @returns     {Snackbar.Types.SnackbarPosition} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get position(): Types.SnackbarPosition { return (this.getAttribute('position') ?? 'bottom-center') as never; }

        /** @name        position
         *  @public
         *  @type        {void}
         *  @description Component member for position.
         *  @param       {Snackbar.Types.SnackbarPosition} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set position(v: Types.SnackbarPosition) { this.setAttribute('position', v); }

        /** @name        action
         *  @public
         *  @type        {string}
         *  @description Component member for action.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get action(): string { return this.getAttribute('action') ?? ''; }

        /** @name        action
         *  @public
         *  @type        {void}
         *  @description Component member for action.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set action(v: string) { v ? this.setAttribute('action', v) : this.removeAttribute('action'); }

        /** @name        messageText
         *  @private
         *  @type        {() => string}
         *  @description Component member for message Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private messageText: () => string = () => '';

        /** @name        hasMessage
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Message.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasMessage: () => boolean = () => false;

        /** @name        actionText
         *  @private
         *  @type        {() => string}
         *  @description Component member for action Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private actionText: () => string = () => '';

        /** @name        hasAction
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Action.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasAction: () => boolean = () => false;

        /** @name        onActionClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Action Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onActionClick: () => void = () => { };

        /** @name        onCloseClick
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Close Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCloseClick: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Snackbar.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Snackbar.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    alignItems: 'center',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                    display: 'flex',
                    gap: '10px',
                    opacity: '0',
                    padding: '10px 14px',
                    pointerEvents: 'all',
                    transform: 'translateY(6px)',
                    transition: 'opacity 0.25s, transform 0.25s',
                    minWidth: '220px',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':host.ar-snackbar--on', { opacity: '1', transform: 'none' }),
                new Rule(':host([variant="success"])', { background: 'var(--arianna-success, #2ea043)', color: '#fff' }),
                new Rule(':host([variant="warning"])', { background: 'var(--arianna-warning, #d29922)', color: '#000' }),
                new Rule(':host([variant="danger"])', { background: 'var(--arianna-danger,  #cf222e)', color: '#fff' }),
                new Rule(':host([variant="info"])', { background: 'var(--arianna-info,    #4dd0e1)', color: '#000' }),
                new Rule('.ar-snackbar__msg', { flex: '1', fontSize: '0.82rem' }),
                new Rule('.ar-snackbar__action', { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: '0.78rem', fontWeight: '600', textDecoration: 'underline' }),
                new Rule('.ar-snackbar__close', { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.8rem', opacity: '0.7', padding: '0' }),
            ]);
        }
    }
}
export default Snackbar;

export type SnackbarOptions = Snackbar.Interfaces.SnackbarOptions;
export type SnackbarPosition = Snackbar.Types.SnackbarPosition;
