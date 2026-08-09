/**
 * @module    components/composite/Chat
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Chat component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   Chat
 *  @public
 *  @description Namespace containing Chat contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Chat
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

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

        /** @name        MessageStatus
         *  @public
         *  @type        {'sent' | 'delivered' | 'read'}
         *  @description Type alias for MessageStatus.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type MessageStatus = 'sent' | 'delivered' | 'read';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ChatUser
         *  @public
         *  @description ChatUser contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChatUser
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        avatar
             *  @public
             *  @type        {string}
             *  @description Component member for avatar.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            avatar?: string;

            /** @name        online
             *  @public
             *  @type        {boolean}
             *  @description Component member for online.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            online?: boolean;
        }

        /** @interface   ChatMessage
         *  @public
         *  @description ChatMessage contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChatMessage
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        author
             *  @public
             *  @type        {string}
             *  @description Component member for author.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            author: string; // user id
            /** @name        text
             *  @public
             *  @type        {string}
             *  @description Component member for text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            text?: string;

            /** @name        image
             *  @public
             *  @type        {string}
             *  @description Component member for image.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            image?: string; // url
            /** @name        file
             *  @public
             *  @type        {{
                name: string;
                url: string;
                size?: number;
            }}
             *  @description Component member for file.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            file?: {
                /** @name        name
                 *  @public
                 *  @type        {string}
                 *  @description Component member for name.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                name: string;

                /** @name        url
                 *  @public
                 *  @type        {string}
                 *  @description Component member for url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                url: string;

                /** @name        size
                 *  @public
                 *  @type        {number}
                 *  @description Component member for size.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                size?: number;
            };

            /** @name        ts
             *  @public
             *  @type        {number}
             *  @description Component member for ts.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ts: number; // ms epoch
            /** @name        status
             *  @public
             *  @type        {Chat.Types.MessageStatus}
             *  @description Component member for status.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            status?: Types.MessageStatus;

            /** @name        replyTo
             *  @public
             *  @type        {string}
             *  @description Component member for reply To.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            replyTo?: string; // message id
            /** @name        reactions
             *  @public
             *  @type        {Record<string, number>}
             *  @description Component member for reactions.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            reactions?: Record<string, number>; // emoji → count
            /** @name        system
             *  @public
             *  @type        {boolean}
             *  @description Component member for system.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            system?: boolean;
        }

        /** @interface   ChatConversation
         *  @public
         *  @description ChatConversation contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChatConversation
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        peer
             *  @public
             *  @type        {Chat.Interfaces.ChatUser}
             *  @description Component member for peer.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            peer: Interfaces.ChatUser; // 1:1; for groups use displayName/avatar of group
            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string; // override for groups
            /** @name        unread
             *  @public
             *  @type        {number}
             *  @description Component member for unread.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            unread?: number;

            /** @name        messages
             *  @public
             *  @type        {Chat.Interfaces.ChatMessage[]}
             *  @description Component member for messages.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            messages?: Interfaces.ChatMessage[];

            /** @name        typing
             *  @public
             *  @type        {boolean}
             *  @description Component member for typing.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            typing?: boolean;
        }

        /** @interface   ChatOptions
         *  @public
         *  @description ChatOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChatOptions
        {
            /** @name        me
             *  @public
             *  @type        {Chat.Interfaces.ChatUser}
             *  @description Component member for me.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            me?: Interfaces.ChatUser;

            /** @name        conversations
             *  @public
             *  @type        {Chat.Interfaces.ChatConversation[]}
             *  @description Component member for conversations.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            conversations?: Interfaces.ChatConversation[];
        }
    }
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        effect
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned effect value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const effect = (fn: () => void): (() => void) => {
        /** @name        e
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned e value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const e = Reactivity.CreateEffect(fn);
        return () => e.Stop();
    };

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;
    export function fmtChatTime(ts: number): string {
        /** @name        d
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned d value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /** @name        FmtChatTime
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned FmtChatTime value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function FmtChatTime(value: number | Date): string
    {
        return fmtChatTime(value instanceof Date ? value.getTime() : value);
    }
    // riga 82:  function fmtTime(ts: number): string {      →  function fmtChatTime(ts: number): string {
    // riga 254: time.textContent = fmtTime(m.ts);           →  time.textContent = fmtChatTime(m.ts);
    // riga 347: time.textContent = fmtTime(m.ts);           →  time.textContent = fmtChatTime(m.ts);

    /** @class       Chat
     *  @public
     *  @description AriannA Chat component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-chat', {}, {
        Attributes: [],
    })
    export class Chat extends HTMLElement
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        conversations$
         *  @public
         *  @readonly
         *  @type        {Chat.Types.Signal<Chat.Interfaces.ChatConversation[]>}
         *  @description Component member for conversations$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly conversations$: Types.Signal<Interfaces.ChatConversation[]> = signal<Interfaces.ChatConversation[]>([]);

        /** @name        activeId$
         *  @public
         *  @readonly
         *  @type        {Chat.Types.Signal<string | null>}
         *  @description Component member for active Id$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly activeId$: Types.Signal<string | null> = signal<string | null>(null);

        /** @name        me$
         *  @public
         *  @readonly
         *  @type        {Chat.Types.Signal<Chat.Interfaces.ChatUser>}
         *  @description Component member for me$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly me$: Types.Signal<Interfaces.ChatUser> = signal<Interfaces.ChatUser>({ id: 'me', name: 'Me' });

        /** @name        replyTo$
         *  @public
         *  @readonly
         *  @type        {Chat.Types.Signal<string | null>}
         *  @description Component member for reply To$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly replyTo$: Types.Signal<string | null> = signal<string | null>(null);

        /** @name        #sidebar
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for sidebar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #sidebar?: HTMLDivElement;

        /** @name        #thread
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for thread.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #thread?: HTMLDivElement;

        /** @name        #header
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for header.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #header?: HTMLDivElement;

        /** @name        #composer
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for composer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #composer?: HTMLDivElement;

        /** @name        #input
         *  @public
         *  @type        {HTMLTextAreaElement}
         *  @description Component member for input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #input?: HTMLTextAreaElement;

        /** @name        #replyBar
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for reply Bar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #replyBar?: HTMLDivElement;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {Chat.Interfaces.ChatOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.ChatOptions = {})
        {
            super();
            if (opts.me)
                this.me$.Set(opts.me);
            if (opts.conversations)
                this.conversations$.Set(opts.conversations);
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(): void
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;

                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;

                /** @name        Sheet
                 *  @public
                 *  @type        {Chat.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            };

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = self.render();
            if (root.querySelector('.ch-wrap'))
                return;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'ch-wrap';
            // Sidebar
            /** @name        sidebar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sidebar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sidebar = document.createElement('div');
            sidebar.className = 'ch-sidebar';
            this.#sidebar = sidebar;
            // Right column
            /** @name        right
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned right value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const right = document.createElement('div');
            right.className = 'ch-right';

            /** @name        header
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned header value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const header = document.createElement('div');
            header.className = 'ch-header';
            this.#header = header;

            /** @name        thread
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned thread value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const thread = document.createElement('div');
            thread.className = 'ch-thread';
            this.#thread = thread;

            /** @name        replyBar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned replyBar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const replyBar = document.createElement('div');
            replyBar.className = 'ch-reply-bar';
            replyBar.style.display = 'none';
            this.#replyBar = replyBar;

            /** @name        composer
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned composer value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const composer = document.createElement('div');
            composer.className = 'ch-composer';
            this.#composer = composer;

            /** @name        fileBtn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned fileBtn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const fileBtn = document.createElement('button');
            fileBtn.type = 'button';
            fileBtn.className = 'ch-icon-btn';
            fileBtn.textContent = '📎';
            fileBtn.title = 'attach file';

            /** @name        fileInput
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned fileInput value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const fileInput = document.createElement('input') as HTMLInputElement;
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.style.display = 'none';

            /** @name        input
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned input value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const input = document.createElement('textarea');
            input.className = 'ch-input';
            input.rows = 1;
            input.placeholder = 'Type a message…';
            this.#input = input;

            /** @name        emojiBtn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned emojiBtn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const emojiBtn = document.createElement('button');
            emojiBtn.type = 'button';
            emojiBtn.className = 'ch-icon-btn';
            emojiBtn.textContent = '😊';

            /** @name        sendBtn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sendBtn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sendBtn = document.createElement('button');
            sendBtn.type = 'button';
            sendBtn.className = 'ch-send';
            sendBtn.textContent = 'Send';
            composer.append(fileBtn, fileInput, input, emojiBtn, sendBtn);
            right.append(header, thread, replyBar, composer);
            wrap.append(sidebar, right);
            root.appendChild(wrap);
            // Reactive renders
            effect(() => this.#renderSidebar());
            effect(() => { this.activeId$.Get(); this.#renderHeader(); this.#renderThread(); });
            effect(() => { this.replyTo$.Get(); this.#renderReplyBar(); });
            // Composer wiring
            sendBtn.addEventListener('click', () => this.#sendCurrent());
            input.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey)
                {
                    e.preventDefault();
                    this.#sendCurrent();
                }
            });
            input.addEventListener('input', () => {
                // auto-resize
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 96) + 'px';
                // typing event
                /** @name        cid
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cid value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cid = this.activeId$.Peek();
                if (cid)
                    self.fire('arianna:chat-typing', { detail: { conversationId: cid, typing: input.value.length > 0, source: this }, bubbles: true });
            });
            fileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', () => {
                /** @name        cid
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cid value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cid = this.activeId$.Peek();
                if (!cid || !fileInput.files?.length)
                    return;
                self.fire('arianna:chat-attach', { detail: { conversationId: cid, files: Array.from(fileInput.files), source: this }, bubbles: true });
                fileInput.value = '';
            });
            self.Sheet = Chat.DefaultSheet();
        }

        /** @name        #sendCurrent
         *  @public
         *  @type        {void}
         *  @description Component member for send Current.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #sendCurrent(): void
        {
            /** @name        input
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned input value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const input = this.#input;

            /** @name        cid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cid = this.activeId$.Peek();
            if (!input || !cid)
                return;

            /** @name        text
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned text value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const text = input.value.trim();
            if (!text)
                return;

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };

            /** @name        replyTo
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned replyTo value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const replyTo = this.replyTo$.Peek() ?? undefined;
            self.fire('arianna:chat-send', { detail: { conversationId: cid, text, replyTo, source: this }, bubbles: true });
            // Optimistic local insert
            /** @name        me
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned me value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const me = this.me$.Peek();
            this.addMessage(cid, {
                id: 'local-' + Date.now().toString(36),
                author: me.id,
                text,
                ts: Date.now(),
                status: 'sent',
                replyTo,
            });
            input.value = '';
            input.style.height = 'auto';
            this.replyTo$.Set(null);
        }

        /** @name        #renderSidebar
         *  @public
         *  @type        {void}
         *  @description Component member for render Sidebar.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderSidebar(): void
        {
            /** @name        sidebar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sidebar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sidebar = this.#sidebar;
            if (!sidebar)
                return;
            sidebar.innerHTML = '';

            /** @name        conversations
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned conversations value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const conversations = [...this.conversations$.Get()].sort((a, b) => {
                /** @name        la
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned la value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const la = a.messages?.[a.messages.length - 1]?.ts ?? 0;

                /** @name        lb
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lb value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lb = b.messages?.[b.messages.length - 1]?.ts ?? 0;
                return lb - la;
            });
            for (const c of conversations)
            {
                /** @name        it
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned it value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const it = document.createElement('div');
                it.className = 'ch-conv-item';
                if (c.id === this.activeId$.Peek())
                    it.classList.add('active');

                /** @name        avatar
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned avatar value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const avatar = document.createElement('div');
                avatar.className = 'ch-avatar';
                avatar.textContent = (c.peer.avatar ? '' : (c.peer.name[0] ?? '?').toUpperCase());
                if (c.peer.avatar)
                    avatar.style.backgroundImage = `url("${c.peer.avatar}")`;

                /** @name        meta
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned meta value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const meta = document.createElement('div');
                meta.className = 'ch-conv-meta';

                /** @name        name
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned name value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const name = document.createElement('div');
                name.className = 'ch-conv-name';
                name.textContent = c.title ?? c.peer.name;

                /** @name        last
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned last value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const last = document.createElement('div');
                last.className = 'ch-conv-last';

                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = c.messages?.[c.messages.length - 1];
                last.textContent = m?.text ?? (m?.image ? '📷 image' : m?.file ? `📎 ${m.file.name}` : '');
                meta.append(name, last);

                /** @name        right
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned right value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const right = document.createElement('div');
                right.className = 'ch-conv-right';
                if (m)
                {
                    /** @name        time
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned time value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const time = document.createElement('div');
                    time.className = 'ch-conv-time';
                    time.textContent = fmtChatTime(m.ts);
                    right.appendChild(time);
                }
                if (c.unread)
                {
                    /** @name        badge
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned badge value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const badge = document.createElement('div');
                    badge.className = 'ch-badge';
                    badge.textContent = String(c.unread);
                    right.appendChild(badge);
                }
                it.append(avatar, meta, right);
                it.addEventListener('click', () => this.selectConversation(c.id));
                sidebar.appendChild(it);
            }
        }

        /** @name        #renderHeader
         *  @public
         *  @type        {void}
         *  @description Component member for render Header.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderHeader(): void
        {
            /** @name        header
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned header value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const header = this.#header;
            if (!header)
                return;
            header.innerHTML = '';

            /** @name        id
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned id value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const id = this.activeId$.Peek();
            if (!id)
                return;

            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = this.conversations$.Peek().find((x: any) => x.id === id);
            if (!c)
                return;

            /** @name        avatar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned avatar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const avatar = document.createElement('div');
            avatar.className = 'ch-avatar ch-avatar-sm';
            avatar.textContent = (c.peer.name[0] ?? '?').toUpperCase();
            if (c.peer.avatar)
                avatar.style.backgroundImage = `url("${c.peer.avatar}")`;

            /** @name        name
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned name value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const name = document.createElement('div');
            name.className = 'ch-header-name';
            name.textContent = c.title ?? c.peer.name;

            /** @name        presence
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned presence value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const presence = document.createElement('div');
            presence.className = 'ch-header-presence';
            presence.textContent = c.peer.online ? 'online' : '';
            header.append(avatar, name, presence);
        }

        /** @name        #renderThread
         *  @public
         *  @type        {void}
         *  @description Component member for render Thread.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderThread(): void
        {
            /** @name        thread
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned thread value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const thread = this.#thread;
            if (!thread)
                return;
            thread.innerHTML = '';

            /** @name        id
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned id value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const id = this.activeId$.Peek();
            if (!id)
                return;

            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = this.conversations$.Peek().find((x: any) => x.id === id);
            if (!c || !c.messages?.length)
                return;

            /** @name        me
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned me value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const me = this.me$.Peek();

            /** @name        prevAuthor
             *  @public
             *  @type        {string | null}
             *  @description Namespace-owned prevAuthor value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let prevAuthor: string | null = null;

            /** @name        prevTs
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned prevTs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let prevTs = 0;
            for (const m of c.messages)
            {
                if (m.system)
                {
                    /** @name        sys
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sys value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sys = document.createElement('div');
                    sys.className = 'ch-sys';
                    sys.textContent = m.text ?? '';
                    thread.appendChild(sys);
                    prevAuthor = null;
                    continue;
                }

                /** @name        mine
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mine value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mine = m.author === me.id;

                /** @name        grouped
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned grouped value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const grouped = prevAuthor === m.author && (m.ts - prevTs) < 60000;

                /** @name        bubble
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned bubble value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const bubble = document.createElement('div');
                bubble.className = 'ch-msg ' + (mine ? 'ch-mine' : 'ch-theirs') + (grouped ? ' grouped' : '');
                if (m.replyTo)
                {
                    /** @name        ref
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ref value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ref = c.messages.find((x: any) => x.id === m.replyTo);
                    if (ref)
                    {
                        /** @name        q
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned q value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const q = document.createElement('div');
                        q.className = 'ch-quote';
                        q.textContent = ref.text ?? '(media)';
                        bubble.appendChild(q);
                    }
                }
                if (m.text)
                {
                    /** @name        t
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned t value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const t = document.createElement('div');
                    t.className = 'ch-text';
                    t.textContent = m.text;
                    bubble.appendChild(t);
                }
                if (m.image)
                {
                    /** @name        img
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned img value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const img = document.createElement('img');
                    img.className = 'ch-image';
                    img.src = m.image;
                    bubble.appendChild(img);
                }
                if (m.file)
                {
                    /** @name        f
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned f value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const f = document.createElement('a');
                    f.className = 'ch-file';
                    f.href = m.file.url;
                    f.target = '_blank';
                    f.textContent = `📎 ${m.file.name}`;
                    bubble.appendChild(f);
                }

                /** @name        footer
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned footer value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const footer = document.createElement('div');
                footer.className = 'ch-msg-footer';

                /** @name        time
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned time value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const time = document.createElement('span');
                time.className = 'ch-msg-time';
                time.textContent = fmtChatTime(m.ts);
                footer.appendChild(time);
                if (mine && m.status)
                {
                    /** @name        tick
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned tick value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const tick = document.createElement('span');
                    tick.className = 'ch-tick ch-tick-' + m.status;
                    tick.textContent = m.status === 'sent' ? '✓' : '✓✓';
                    footer.appendChild(tick);
                }
                bubble.appendChild(footer);
                bubble.addEventListener('dblclick', () => this.replyTo$.Set(m.id));
                thread.appendChild(bubble);
                prevAuthor = m.author;
                prevTs = m.ts;
            }
            if (c.typing)
            {
                /** @name        t
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned t value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const t = document.createElement('div');
                t.className = 'ch-typing';
                t.textContent = '…';
                thread.appendChild(t);
            }
            thread.scrollTop = thread.scrollHeight;
        }

        /** @name        #renderReplyBar
         *  @public
         *  @type        {void}
         *  @description Component member for render Reply Bar.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderReplyBar(): void
        {
            /** @name        bar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bar = this.#replyBar;
            if (!bar)
                return;

            /** @name        id
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned id value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const id = this.replyTo$.Peek();

            /** @name        cid
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cid value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cid = this.activeId$.Peek();
            if (!id || !cid)
            {
                bar.style.display = 'none';
                return;
            }

            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = this.conversations$.Peek().find((x: any) => x.id === cid);

            /** @name        m
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned m value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const m = c?.messages?.find((x: any) => x.id === id);
            if (!m)
            {
                bar.style.display = 'none';
                return;
            }
            bar.style.display = 'flex';
            bar.innerHTML = '';

            /** @name        q
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned q value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const q = document.createElement('div');
            q.className = 'ch-reply-quote';
            q.textContent = '↩ ' + (m.text ?? '(media)');

            /** @name        close
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned close value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'ch-reply-close';
            close.textContent = '×';
            close.addEventListener('click', () => this.replyTo$.Set(null));
            bar.append(q, close);
        }
        // ── Public API ────────────────────────────────────────────────────────
        /** @name        setMe
         *  @public
         *  @type        {this}
         *  @description Component member for set Me.
         *  @param       {Chat.Interfaces.ChatUser} u Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMe(u: Interfaces.ChatUser): this { this.me$.Set(u); return this; }

        /** @name        addConversation
         *  @public
         *  @type        {this}
         *  @description Component member for add Conversation.
         *  @param       {Chat.Interfaces.ChatConversation} c Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addConversation(c: Interfaces.ChatConversation): this
        {
            c.messages ??= [];
            this.conversations$.Set([...this.conversations$.Peek(), c]);
            if (!this.activeId$.Peek())
                this.activeId$.Set(c.id);
            return this;
        }

        /** @name        selectConversation
         *  @public
         *  @type        {this}
         *  @description Component member for select Conversation.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selectConversation(id: string): this
        {
            this.activeId$.Set(id);
            // Mark as read
            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = this.conversations$.Peek().map((c: any) => c.id === id ? { ...c, unread: 0 } : c);
            this.conversations$.Set(list);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:chat-select', { detail: { conversationId: id, source: this }, bubbles: true });
            return this;
        }

        /** @name        addMessage
         *  @public
         *  @type        {this}
         *  @description Component member for add Message.
         *  @param       {string} conversationId Parameter.
         *  @param       {Chat.Interfaces.ChatMessage} msg Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addMessage(conversationId: string, msg: Interfaces.ChatMessage): this
        {
            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = this.conversations$.Peek().map((c: any) => {
                if (c.id !== conversationId)
                    return c;

                /** @name        msgs
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned msgs value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const msgs = [...(c.messages ?? []), msg];

                /** @name        me
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned me value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const me = this.me$.Peek();

                /** @name        isIncoming
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned isIncoming value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const isIncoming = msg.author !== me.id;

                /** @name        unread
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned unread value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const unread = isIncoming && this.activeId$.Peek() !== conversationId
                    ? (c.unread ?? 0) + 1
                    : 0;
                return { ...c, messages: msgs, unread };
            });
            this.conversations$.Set(list);
            return this;
        }

        /** @name        setMessageStatus
         *  @public
         *  @type        {this}
         *  @description Component member for set Message Status.
         *  @param       {string} conversationId Parameter.
         *  @param       {string} messageId Parameter.
         *  @param       {Chat.Types.MessageStatus} status Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMessageStatus(conversationId: string, messageId: string, status: Types.MessageStatus): this
        {
            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = this.conversations$.Peek().map((c: any) => {
                if (c.id !== conversationId)
                    return c;

                /** @name        msgs
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned msgs value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const msgs = (c.messages ?? []).map((m: any) => m.id === messageId ? { ...m, status } : m);
                return { ...c, messages: msgs };
            });
            this.conversations$.Set(list);
            return this;
        }

        /** @name        setPeerTyping
         *  @public
         *  @type        {this}
         *  @description Component member for set Peer Typing.
         *  @param       {string} conversationId Parameter.
         *  @param       {boolean} typing Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setPeerTyping(conversationId: string, typing: boolean): this
        {
            /** @name        list
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned list value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const list = this.conversations$.Peek().map((c: any) => c.id === conversationId ? { ...c, typing } : c);
            this.conversations$.Set(list);
            return this;
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Chat.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Chat.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg, #fff)',
                    border: '1px solid var(--ar-border, #d0d0d0)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    color: 'var(--ar-text, #1a1a1a)',
                    display: 'block',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                    height: '520px',
                    overflow: 'hidden',
                }),
                new Rule(':host .ch-wrap', { display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%' }),
                new Rule(':host .ch-sidebar', {
                    background: 'var(--ar-bg2, #f5f5f5)',
                    borderRight: '1px solid var(--ar-border, #d0d0d0)',
                    overflow: 'auto',
                }),
                new Rule(':host .ch-conv-item', {
                    alignItems: 'center',
                    borderBottom: '1px solid var(--ar-border, #e0e0e0)',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: '8px',
                    gridTemplateColumns: '40px 1fr auto',
                    padding: '8px 10px',
                }),
                new Rule(':host .ch-conv-item:hover', { background: 'var(--ar-bg3, #eee)' }),
                new Rule(':host .ch-conv-item.active', { background: 'var(--ar-bg4, #e0e0e0)' }),
                new Rule(':host .ch-avatar', {
                    alignItems: 'center',
                    background: 'var(--ar-primary, #1565c0)',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    borderRadius: '50%',
                    color: '#fff',
                    display: 'flex',
                    fontWeight: '600',
                    height: '40px',
                    justifyContent: 'center',
                    width: '40px',
                }),
                new Rule(':host .ch-avatar-sm', { height: '32px', width: '32px', fontSize: '0.78rem' }),
                new Rule(':host .ch-conv-meta', { overflow: 'hidden' }),
                new Rule(':host .ch-conv-name', { fontWeight: '600', fontSize: '0.86rem' }),
                new Rule(':host .ch-conv-last', {
                    color: 'var(--ar-muted, #666)',
                    fontSize: '0.78rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host .ch-conv-right', {
                    alignItems: 'flex-end',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }),
                new Rule(':host .ch-conv-time', { color: 'var(--ar-muted, #888)', fontSize: '0.7rem' }),
                new Rule(':host .ch-badge', {
                    background: 'var(--ar-primary, #1565c0)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    minWidth: '18px',
                    padding: '1px 6px',
                    textAlign: 'center',
                }),
                new Rule(':host .ch-right', { display: 'grid', gridTemplateRows: 'auto 1fr auto auto', height: '100%' }),
                new Rule(':host .ch-header', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #f5f5f5)',
                    borderBottom: '1px solid var(--ar-border, #d0d0d0)',
                    display: 'flex',
                    gap: '10px',
                    padding: '8px 14px',
                }),
                new Rule(':host .ch-header-name', { flex: '1', fontSize: '0.92rem', fontWeight: '600' }),
                new Rule(':host .ch-header-presence', { color: 'var(--ar-success, #2e7d32)', fontSize: '0.72rem' }),
                new Rule(':host .ch-thread', {
                    background: 'var(--ar-bg, #fff)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    overflow: 'auto',
                    padding: '12px',
                }),
                new Rule(':host .ch-msg', {
                    background: 'var(--ar-bg3, #eee)',
                    borderRadius: '8px',
                    maxWidth: '70%',
                    padding: '6px 10px',
                    position: 'relative',
                }),
                new Rule(':host .ch-msg.grouped', { marginTop: '-2px' }),
                new Rule(':host .ch-theirs', { alignSelf: 'flex-start' }),
                new Rule(':host .ch-mine', { alignSelf: 'flex-end', background: 'var(--ar-primary, #1565c0)', color: '#fff' }),
                new Rule(':host .ch-text', { fontSize: '0.86rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }),
                new Rule(':host .ch-quote', {
                    borderLeft: '3px solid var(--ar-muted, #888)',
                    color: 'var(--ar-muted, #666)',
                    fontSize: '0.74rem',
                    marginBottom: '4px',
                    opacity: '0.85',
                    padding: '2px 6px',
                }),
                new Rule(':host .ch-image', { borderRadius: '4px', maxWidth: '100%' }),
                new Rule(':host .ch-file', { color: 'inherit', textDecoration: 'underline', fontSize: '0.82rem' }),
                new Rule(':host .ch-msg-footer', {
                    alignItems: 'center',
                    display: 'flex',
                    gap: '4px',
                    justifyContent: 'flex-end',
                    marginTop: '2px',
                }),
                new Rule(':host .ch-msg-time', { fontSize: '0.66rem', opacity: '0.7' }),
                new Rule(':host .ch-tick', { fontSize: '0.7rem' }),
                new Rule(':host .ch-tick-read', { color: '#4dd0e1' }),
                new Rule(':host .ch-sys', {
                    alignSelf: 'center',
                    background: 'var(--ar-bg3, #eee)',
                    borderRadius: '10px',
                    color: 'var(--ar-muted, #666)',
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                }),
                new Rule(':host .ch-typing', {
                    alignSelf: 'flex-start',
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.86rem',
                }),
                new Rule(':host .ch-reply-bar', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #f5f5f5)',
                    borderTop: '1px solid var(--ar-border, #d0d0d0)',
                    display: 'flex',
                    gap: '6px',
                    padding: '4px 10px',
                }),
                new Rule(':host .ch-reply-quote', {
                    color: 'var(--ar-muted, #666)',
                    flex: '1',
                    fontSize: '0.78rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule(':host .ch-reply-close', {
                    background: 'transparent',
                    border: '0',
                    color: 'var(--ar-muted, #666)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                }),
                new Rule(':host .ch-composer', {
                    alignItems: 'flex-end',
                    background: 'var(--ar-bg2, #f5f5f5)',
                    borderTop: '1px solid var(--ar-border, #d0d0d0)',
                    display: 'flex',
                    gap: '6px',
                    padding: '8px 10px',
                }),
                new Rule(':host .ch-icon-btn', {
                    background: 'transparent',
                    border: '0',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    padding: '4px',
                }),
                new Rule(':host .ch-input', {
                    background: 'var(--ar-bg, #fff)',
                    border: '1px solid var(--ar-border, #d0d0d0)',
                    borderRadius: '8px',
                    color: 'var(--ar-text, #1a1a1a)',
                    flex: '1',
                    font: 'inherit',
                    fontSize: '0.86rem',
                    maxHeight: '96px',
                    outline: 'none',
                    padding: '6px 10px',
                    resize: 'none',
                }),
                new Rule(':host .ch-send', {
                    background: 'var(--ar-primary, #1565c0)',
                    border: '0',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontWeight: '600',
                    padding: '6px 14px',
                }),
            ]);
        }
    }
}
export default Chat;

export type ChatOptions = Chat.Interfaces.ChatOptions;
export type ChatConversation = Chat.Interfaces.ChatConversation;
export type ChatMessage = Chat.Interfaces.ChatMessage;
export type ChatUser = Chat.Interfaces.ChatUser;
export type MessageStatus = Chat.Types.MessageStatus;
