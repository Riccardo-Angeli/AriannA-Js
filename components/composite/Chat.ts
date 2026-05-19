/**
 * @module    components/composite/Chat
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Chat — WhatsApp / Signal-style chat widget. Three-pane layout:
 *
 *   ┌──────────────┬───────────────────────────────────┐
 *   │ Sidebar      │  Header (peer name, presence)     │
 *   │              ├───────────────────────────────────┤
 *   │ ▣ Alice  ●3 │   ┌─────┐                         │
 *   │ ▣ Bob       │   │ msg │← incoming               │
 *   │ ▣ Group #1  │   └─────┘                         │
 *   │              │              ┌──────┐             │
 *   │              │              │ mine │ outgoing    │
 *   │              │              └──────┘ ✓✓          │
 *   │              ├───────────────────────────────────┤
 *   │              │ [✎ message]    [📎] [😊] [Send]   │
 *   └──────────────┴───────────────────────────────────┘
 *
 *   const chat = new Chat({ me: { id: 'rick', name: 'Riccardo' } });
 *   chat.append(document.body);
 *   chat.addConversation({ id: 'c1', peer: { id: 'a', name: 'Alice' } });
 *   chat.addMessage('c1', { id: 'm1', author: 'a', text: 'hey', ts: Date.now() });
 *
 *   chat.on('arianna:chat-send', e => {
 *     const { conversationId, text } = e.detail;
 *     // push to backend
 *   });
 *
 * The widget owns its data model: `Conversation[]` each with `Message[]`.
 * Host syncs incoming via `addMessage`; outgoing fires `arianna:chat-send`.
 *
 * Events:
 *   arianna:chat-select   { conversationId }
 *   arianna:chat-send     { conversationId, text, replyTo? }
 *   arianna:chat-attach   { conversationId, files }
 *   arianna:chat-typing   { conversationId, typing }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface ChatUser {
    id     : string;
    name   : string;
    avatar?: string;
    online?: boolean;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
    id        : string;
    author    : string;       // user id
    text?     : string;
    image?    : string;       // url
    file?     : { name: string; url: string; size?: number };
    ts        : number;       // ms epoch
    status?   : MessageStatus;
    replyTo?  : string;       // message id
    reactions?: Record<string, number>;   // emoji → count
    system?   : boolean;
}

export interface ChatConversation {
    id        : string;
    peer      : ChatUser;     // 1:1; for groups use displayName/avatar of group
    title?    : string;       // override for groups
    unread?   : number;
    messages? : ChatMessage[];
    typing?   : boolean;
}

export interface ChatOptions {
    me?            : ChatUser;
    conversations? : ChatConversation[];
}

function fmtTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export class Chat extends Component('arianna-chat', HTMLElement, {}, {
    attrs : [],
})
{
    readonly conversations$ : Signal<ChatConversation[]> = signal<ChatConversation[]>([]);
    readonly activeId$      : Signal<string | null>      = signal<string | null>(null);
    readonly me$            : Signal<ChatUser>           = signal<ChatUser>({ id: 'me', name: 'Me' });
    readonly replyTo$       : Signal<string | null>      = signal<string | null>(null);

    #sidebar? : HTMLDivElement;
    #thread?  : HTMLDivElement;
    #header?  : HTMLDivElement;
    #composer?: HTMLDivElement;
    #input?   : HTMLTextAreaElement;
    #replyBar?: HTMLDivElement;

    constructor(opts: ChatOptions = {}) {
        super(opts as never);
        if (opts.me)            this.me$.set(opts.me);
        if (opts.conversations) this.conversations$.set(opts.conversations);
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.ch-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'ch-wrap';

        // Sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'ch-sidebar';
        this.#sidebar = sidebar;

        // Right column
        const right = document.createElement('div');
        right.className = 'ch-right';
        const header = document.createElement('div');
        header.className = 'ch-header';
        this.#header = header;
        const thread = document.createElement('div');
        thread.className = 'ch-thread';
        this.#thread = thread;
        const replyBar = document.createElement('div');
        replyBar.className = 'ch-reply-bar';
        replyBar.style.display = 'none';
        this.#replyBar = replyBar;
        const composer = document.createElement('div');
        composer.className = 'ch-composer';
        this.#composer = composer;

        const fileBtn = document.createElement('button');
        fileBtn.type = 'button'; fileBtn.className = 'ch-icon-btn'; fileBtn.textContent = '📎';
        fileBtn.title = 'attach file';
        const fileInput = document.createElement('input') as HTMLInputElement;
        fileInput.type = 'file'; fileInput.multiple = true; fileInput.style.display = 'none';

        const input = document.createElement('textarea');
        input.className = 'ch-input';
        input.rows = 1;
        input.placeholder = 'Type a message…';
        this.#input = input;

        const emojiBtn = document.createElement('button');
        emojiBtn.type = 'button'; emojiBtn.className = 'ch-icon-btn'; emojiBtn.textContent = '😊';

        const sendBtn = document.createElement('button');
        sendBtn.type = 'button'; sendBtn.className = 'ch-send'; sendBtn.textContent = 'Send';

        composer.append(fileBtn, fileInput, input, emojiBtn, sendBtn);
        right.append(header, thread, replyBar, composer);
        wrap.append(sidebar, right);
        root.appendChild(wrap);

        // Reactive renders
        effect(() => this.#renderSidebar());
        effect(() => { this.activeId$.get(); this.#renderHeader(); this.#renderThread(); });
        effect(() => { this.replyTo$.get(); this.#renderReplyBar(); });

        // Composer wiring
        sendBtn.addEventListener('click', () => this.#sendCurrent());
        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.#sendCurrent();
            }
        });
        input.addEventListener('input', () => {
            // auto-resize
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 96) + 'px';
            // typing event
            const cid = this.activeId$.peek();
            if (cid) self.fire('arianna:chat-typing', { detail: { conversationId: cid, typing: input.value.length > 0, source: this }, bubbles: true });
        });
        fileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            const cid = this.activeId$.peek();
            if (!cid || !fileInput.files?.length) return;
            self.fire('arianna:chat-attach', { detail: { conversationId: cid, files: Array.from(fileInput.files), source: this }, bubbles: true });
            fileInput.value = '';
        });

        self.Sheet = Chat.DefaultSheet();
    }

    #sendCurrent(): void {
        const input = this.#input;
        const cid   = this.activeId$.peek();
        if (!input || !cid) return;
        const text = input.value.trim();
        if (!text) return;
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const replyTo = this.replyTo$.peek() ?? undefined;
        self.fire('arianna:chat-send', { detail: { conversationId: cid, text, replyTo, source: this }, bubbles: true });
        // Optimistic local insert
        const me = this.me$.peek();
        this.addMessage(cid, {
            id     : 'local-' + Date.now().toString(36),
            author : me.id,
            text,
            ts     : Date.now(),
            status : 'sent',
            replyTo,
        });
        input.value = '';
        input.style.height = 'auto';
        this.replyTo$.set(null);
    }

    #renderSidebar(): void {
        const sidebar = this.#sidebar;
        if (!sidebar) return;
        sidebar.innerHTML = '';
        const conversations = [...this.conversations$.get()].sort((a, b) => {
            const la = a.messages?.[a.messages.length - 1]?.ts ?? 0;
            const lb = b.messages?.[b.messages.length - 1]?.ts ?? 0;
            return lb - la;
        });
        for (const c of conversations) {
            const it = document.createElement('div');
            it.className = 'ch-conv-item';
            if (c.id === this.activeId$.peek()) it.classList.add('active');
            const avatar = document.createElement('div');
            avatar.className = 'ch-avatar';
            avatar.textContent = (c.peer.avatar ? '' : (c.peer.name[0] ?? '?').toUpperCase());
            if (c.peer.avatar) avatar.style.backgroundImage = `url("${c.peer.avatar}")`;
            const meta = document.createElement('div');
            meta.className = 'ch-conv-meta';
            const name = document.createElement('div');
            name.className = 'ch-conv-name';
            name.textContent = c.title ?? c.peer.name;
            const last = document.createElement('div');
            last.className = 'ch-conv-last';
            const m = c.messages?.[c.messages.length - 1];
            last.textContent = m?.text ?? (m?.image ? '📷 image' : m?.file ? `📎 ${m.file.name}` : '');
            meta.append(name, last);
            const right = document.createElement('div');
            right.className = 'ch-conv-right';
            if (m) {
                const time = document.createElement('div');
                time.className = 'ch-conv-time';
                time.textContent = fmtTime(m.ts);
                right.appendChild(time);
            }
            if (c.unread) {
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

    #renderHeader(): void {
        const header = this.#header;
        if (!header) return;
        header.innerHTML = '';
        const id = this.activeId$.peek();
        if (!id) return;
        const c = this.conversations$.peek().find(x => x.id === id);
        if (!c) return;
        const avatar = document.createElement('div');
        avatar.className = 'ch-avatar ch-avatar-sm';
        avatar.textContent = (c.peer.name[0] ?? '?').toUpperCase();
        if (c.peer.avatar) avatar.style.backgroundImage = `url("${c.peer.avatar}")`;
        const name = document.createElement('div');
        name.className = 'ch-header-name';
        name.textContent = c.title ?? c.peer.name;
        const presence = document.createElement('div');
        presence.className = 'ch-header-presence';
        presence.textContent = c.peer.online ? 'online' : '';
        header.append(avatar, name, presence);
    }

    #renderThread(): void {
        const thread = this.#thread;
        if (!thread) return;
        thread.innerHTML = '';
        const id = this.activeId$.peek();
        if (!id) return;
        const c = this.conversations$.peek().find(x => x.id === id);
        if (!c || !c.messages?.length) return;
        const me = this.me$.peek();
        let prevAuthor: string | null = null;
        let prevTs    = 0;
        for (const m of c.messages) {
            if (m.system) {
                const sys = document.createElement('div');
                sys.className = 'ch-sys';
                sys.textContent = m.text ?? '';
                thread.appendChild(sys);
                prevAuthor = null;
                continue;
            }
            const mine = m.author === me.id;
            const grouped = prevAuthor === m.author && (m.ts - prevTs) < 60_000;
            const bubble = document.createElement('div');
            bubble.className = 'ch-msg ' + (mine ? 'ch-mine' : 'ch-theirs') + (grouped ? ' grouped' : '');

            if (m.replyTo) {
                const ref = c.messages.find(x => x.id === m.replyTo);
                if (ref) {
                    const q = document.createElement('div');
                    q.className = 'ch-quote';
                    q.textContent = ref.text ?? '(media)';
                    bubble.appendChild(q);
                }
            }
            if (m.text) {
                const t = document.createElement('div');
                t.className = 'ch-text';
                t.textContent = m.text;
                bubble.appendChild(t);
            }
            if (m.image) {
                const img = document.createElement('img');
                img.className = 'ch-image';
                img.src = m.image;
                bubble.appendChild(img);
            }
            if (m.file) {
                const f = document.createElement('a');
                f.className = 'ch-file';
                f.href = m.file.url; f.target = '_blank';
                f.textContent = `📎 ${m.file.name}`;
                bubble.appendChild(f);
            }
            const footer = document.createElement('div');
            footer.className = 'ch-msg-footer';
            const time = document.createElement('span');
            time.className = 'ch-msg-time';
            time.textContent = fmtTime(m.ts);
            footer.appendChild(time);
            if (mine && m.status) {
                const tick = document.createElement('span');
                tick.className = 'ch-tick ch-tick-' + m.status;
                tick.textContent = m.status === 'sent' ? '✓' : '✓✓';
                footer.appendChild(tick);
            }
            bubble.appendChild(footer);

            bubble.addEventListener('dblclick', () => this.replyTo$.set(m.id));

            thread.appendChild(bubble);
            prevAuthor = m.author;
            prevTs     = m.ts;
        }
        if (c.typing) {
            const t = document.createElement('div');
            t.className = 'ch-typing';
            t.textContent = '…';
            thread.appendChild(t);
        }
        thread.scrollTop = thread.scrollHeight;
    }

    #renderReplyBar(): void {
        const bar = this.#replyBar;
        if (!bar) return;
        const id  = this.replyTo$.peek();
        const cid = this.activeId$.peek();
        if (!id || !cid) { bar.style.display = 'none'; return; }
        const c = this.conversations$.peek().find(x => x.id === cid);
        const m = c?.messages?.find(x => x.id === id);
        if (!m) { bar.style.display = 'none'; return; }
        bar.style.display = 'flex';
        bar.innerHTML = '';
        const q = document.createElement('div');
        q.className = 'ch-reply-quote';
        q.textContent = '↩ ' + (m.text ?? '(media)');
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'ch-reply-close';
        close.textContent = '×';
        close.addEventListener('click', () => this.replyTo$.set(null));
        bar.append(q, close);
    }

    // ── Public API ────────────────────────────────────────────────────────

    setMe(u: ChatUser): this { this.me$.set(u); return this; }

    addConversation(c: ChatConversation): this {
        c.messages ??= [];
        this.conversations$.set([...this.conversations$.peek(), c]);
        if (!this.activeId$.peek()) this.activeId$.set(c.id);
        return this;
    }

    selectConversation(id: string): this {
        this.activeId$.set(id);
        // Mark as read
        const list = this.conversations$.peek().map(c => c.id === id ? { ...c, unread: 0 } : c);
        this.conversations$.set(list);
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:chat-select', { detail: { conversationId: id, source: this }, bubbles: true });
        return this;
    }

    addMessage(conversationId: string, msg: ChatMessage): this {
        const list = this.conversations$.peek().map(c => {
            if (c.id !== conversationId) return c;
            const msgs = [...(c.messages ?? []), msg];
            const me = this.me$.peek();
            const isIncoming = msg.author !== me.id;
            const unread = isIncoming && this.activeId$.peek() !== conversationId
                ? (c.unread ?? 0) + 1
                : 0;
            return { ...c, messages: msgs, unread };
        });
        this.conversations$.set(list);
        return this;
    }

    setMessageStatus(conversationId: string, messageId: string, status: MessageStatus): this {
        const list = this.conversations$.peek().map(c => {
            if (c.id !== conversationId) return c;
            const msgs = (c.messages ?? []).map(m => m.id === messageId ? { ...m, status } : m);
            return { ...c, messages: msgs };
        });
        this.conversations$.set(list);
        return this;
    }

    setPeerTyping(conversationId: string, typing: boolean): this {
        const list = this.conversations$.peek().map(c => c.id === conversationId ? { ...c, typing } : c);
        this.conversations$.set(list);
        return this;
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #fff)',
                border      : '1px solid var(--ar-border, #d0d0d0)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #1a1a1a)',
                display     : 'block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                height      : '520px',
                overflow    : 'hidden',
            }),
            new Rule(':host .ch-wrap', { display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%' }),
            new Rule(':host .ch-sidebar', {
                background : 'var(--ar-bg2, #f5f5f5)',
                borderRight: '1px solid var(--ar-border, #d0d0d0)',
                overflow   : 'auto',
            }),
            new Rule(':host .ch-conv-item', {
                alignItems  : 'center',
                borderBottom: '1px solid var(--ar-border, #e0e0e0)',
                cursor      : 'pointer',
                display     : 'grid',
                gap         : '8px',
                gridTemplateColumns: '40px 1fr auto',
                padding     : '8px 10px',
            }),
            new Rule(':host .ch-conv-item:hover', { background: 'var(--ar-bg3, #eee)' }),
            new Rule(':host .ch-conv-item.active', { background: 'var(--ar-bg4, #e0e0e0)' }),
            new Rule(':host .ch-avatar', {
                alignItems     : 'center',
                background     : 'var(--ar-primary, #1565c0)',
                backgroundPosition: 'center',
                backgroundSize : 'cover',
                borderRadius   : '50%',
                color          : '#fff',
                display        : 'flex',
                fontWeight     : '600',
                height         : '40px',
                justifyContent : 'center',
                width          : '40px',
            }),
            new Rule(':host .ch-avatar-sm', { height: '32px', width: '32px', fontSize: '0.78rem' }),
            new Rule(':host .ch-conv-meta', { overflow: 'hidden' }),
            new Rule(':host .ch-conv-name', { fontWeight: '600', fontSize: '0.86rem' }),
            new Rule(':host .ch-conv-last', {
                color    : 'var(--ar-muted, #666)',
                fontSize : '0.78rem',
                overflow : 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }),
            new Rule(':host .ch-conv-right', {
                alignItems: 'flex-end',
                display   : 'flex',
                flexDirection: 'column',
                gap       : '4px',
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
            new Rule(':host .ch-mine',   { alignSelf: 'flex-end', background: 'var(--ar-primary, #1565c0)', color: '#fff' }),
            new Rule(':host .ch-text',   { fontSize: '0.86rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }),
            new Rule(':host .ch-quote',  {
                borderLeft: '3px solid var(--ar-muted, #888)',
                color: 'var(--ar-muted, #666)',
                fontSize: '0.74rem',
                marginBottom: '4px',
                opacity: '0.85',
                padding: '2px 6px',
            }),
            new Rule(':host .ch-image',  { borderRadius: '4px', maxWidth: '100%' }),
            new Rule(':host .ch-file',   { color: 'inherit', textDecoration: 'underline', fontSize: '0.82rem' }),
            new Rule(':host .ch-msg-footer', {
                alignItems: 'center',
                display: 'flex',
                gap: '4px',
                justifyContent: 'flex-end',
                marginTop: '2px',
            }),
            new Rule(':host .ch-msg-time', { fontSize: '0.66rem', opacity: '0.7' }),
            new Rule(':host .ch-tick',     { fontSize: '0.7rem' }),
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

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Chat', {
        value: Chat, writable: false, enumerable: false, configurable: false,
    });
}

export default Chat;
