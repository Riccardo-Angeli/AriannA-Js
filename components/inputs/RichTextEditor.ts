/**
 * @module    components/inputs/RichTextEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026
 *
 * RichTextEditor — full rich-text editor for AriannA.
 * Dedicated with love to Arianna. ♡
 *
 * A zero-dependency WYSIWYG editor built on the native `contenteditable` API.
 * Configurable toolbar, Markdown shortcut processing, HTML/text/Markdown output,
 * reactive Signal integration, and typed events on every change.
 *
 * ── TOOLBAR COMMANDS ─────────────────────────────────────────────────────────
 *   Formatting : 'bold' | 'italic' | 'underline' | 'strikethrough'
 *   Headings   : 'h1' | 'h2' | 'h3'
 *   Blocks     : 'p' | 'blockquote' | 'pre' (code block)
 *   Lists      : 'ul' | 'ol'
 *   Align      : 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify'
 *   Links      : 'link' | 'unlink'
 *   Media      : 'image' (prompt for URL)
 *   History    : 'undo' | 'redo'
 *   Utility    : 'clear' | '|' (separator)
 *
 * ── MARKDOWN SHORTCUTS ───────────────────────────────────────────────────────
 *   **text**    → <strong>text</strong>
 *   *text*      → <em>text</em>
 *   `text`      → <code>text</code>
 *   # heading   → <h1>
 *   ## heading  → <h2>
 *   ### heading → <h3>
 *
 * @example
 *   const editor = new RichTextEditor({
 *     placeholder: 'Start typing…',
 *     toolbar    : ['bold', 'italic', '|', 'h1', 'h2', '|', 'ul', 'ol', '|', 'link', '|', 'undo', 'redo'],
 *     minHeight  : 200,
 *   });
 *   editor.append(document.body);
 *
 * @example
 *   // Markup form
 *   <arianna-richtext-editor placeholder="Start typing…" min-height="200">
 *   </arianna-richtext-editor>
 *
 * @example
 *   // Read/write content programmatically
 *   editor.html = '<h1>Title</h1><p>Body</p>';
 *   console.log(editor.text);      // → "Title\nBody"
 *   console.log(editor.markdown);  // → "# Title\n\nBody"
 *
 * Events:
 *   arianna:richtext-change   { html, text }
 *   arianna:richtext-focus    {}
 *   arianna:richtext-blur     { html, text }
 *   arianna:richtext-command  { command, value? }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToolbarCommand =
  | 'bold' | 'italic' | 'underline' | 'strikethrough'
  | 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'pre'
  | 'ul' | 'ol'
  | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify'
  | 'link' | 'unlink' | 'image'
  | 'undo' | 'redo' | 'clear'
  | '|';

export interface RichTextEditorOptions {
    /** Placeholder text shown when editor is empty. Default: 'Start typing…'. */
    placeholder? : string;
    /** Toolbar commands. Default: full toolbar. */
    toolbar?     : ToolbarCommand[];
    /** Minimum editor height in px. Default: 150. */
    minHeight?   : number;
    /** Maximum editor height in px before scroll. Default: undefined (no limit). */
    maxHeight?   : number;
    /** Enable browser spell-check. Default: true. */
    spellcheck?  : boolean;
    /** Process inline Markdown shortcuts. Default: true. */
    markdown?    : boolean;
    /** Initial HTML content. Default: ''. */
    value?       : string;
}

// ── Toolbar button map ────────────────────────────────────────────────────────

interface ToolbarDef {
    label  : string;
    title  : string;
    exec   : (ed: RichTextEditor) => void;
    style? : string;
}

const TOOLBAR_DEFS: Record<string, ToolbarDef> = {
    bold         : { label: 'B',     title: 'Bold (Ctrl+B)',      style: 'font-weight:700;',             exec: () => document.execCommand('bold') },
    italic       : { label: 'I',     title: 'Italic (Ctrl+I)',    style: 'font-style:italic;',           exec: () => document.execCommand('italic') },
    underline    : { label: 'U',     title: 'Underline (Ctrl+U)', style: 'text-decoration:underline;',   exec: () => document.execCommand('underline') },
    strikethrough: { label: 'S\u0336',title:'Strikethrough',      style: 'text-decoration:line-through;',exec: () => document.execCommand('strikeThrough') },
    h1           : { label: 'H1',    title: 'Heading 1',                                                 exec: () => document.execCommand('formatBlock', false, 'h1') },
    h2           : { label: 'H2',    title: 'Heading 2',                                                 exec: () => document.execCommand('formatBlock', false, 'h2') },
    h3           : { label: 'H3',    title: 'Heading 3',                                                 exec: () => document.execCommand('formatBlock', false, 'h3') },
    p            : { label: 'P',     title: 'Paragraph',                                                 exec: () => document.execCommand('formatBlock', false, 'p') },
    blockquote   : { label: '\u275D',title: 'Blockquote',                                                exec: () => document.execCommand('formatBlock', false, 'blockquote') },
    pre          : { label: '\u2039\u203A', title: 'Code block',  style: 'font-family:monospace;',       exec: () => document.execCommand('formatBlock', false, 'pre') },
    ul           : { label: '\u2022 List',  title: 'Bullet list',                                       exec: () => document.execCommand('insertUnorderedList') },
    ol           : { label: '1. List',title: 'Numbered list',                                            exec: () => document.execCommand('insertOrderedList') },
    alignLeft    : { label: '\u2AE4',title: 'Align left',                                                exec: () => document.execCommand('justifyLeft') },
    alignCenter  : { label: '\u2261',title: 'Align center',                                              exec: () => document.execCommand('justifyCenter') },
    alignRight   : { label: '\u2AE5',title: 'Align right',                                               exec: () => document.execCommand('justifyRight') },
    alignJustify : { label: '\u2630',title: 'Justify',                                                   exec: () => document.execCommand('justifyFull') },
    link         : { label: '\u{1F517}', title: 'Insert link',                                          exec: () => {
        const url = prompt('URL:', 'https://');
        if (url) document.execCommand('createLink', false, url);
    }},
    unlink       : { label: '\u2702 link',  title: 'Remove link',                                       exec: () => document.execCommand('unlink') },
    image        : { label: '\u{1F5BC}',title: 'Insert image',                                          exec: () => {
        const url = prompt('Image URL:', 'https://');
        if (url) document.execCommand('insertHTML', false, `<img src="${url}" alt="" style="max-width:100%">`);
    }},
    undo         : { label: '\u21A9',title: 'Undo (Ctrl+Z)',                                             exec: () => document.execCommand('undo') },
    redo         : { label: '\u21AA',title: 'Redo (Ctrl+Y)',                                             exec: () => document.execCommand('redo') },
    clear        : { label: '\u{1F5D1}',title:'Clear all content',                                     exec: (ed) => ed.clear() },
};

const DEFAULT_TOOLBAR: ToolbarCommand[] = [
    'bold', 'italic', 'underline', 'strikethrough', '|',
    'h1', 'h2', 'h3', 'p', '|',
    'ul', 'ol', '|',
    'alignLeft', 'alignCenter', 'alignRight', '|',
    'link', 'unlink', 'image', '|',
    'undo', 'redo', '|',
    'clear',
];

// ── HTML → Markdown converter ─────────────────────────────────────────────────

function htmlToMarkdown(html: string): string {
    return html
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi,         '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi,         '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi,         '### $1\n\n')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi,           '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi,         '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi,           '*$1*')
        .replace(/<code[^>]*>(.*?)<\/code>/gi,     '`$1`')
        .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
        .replace(/<li[^>]*>(.*?)<\/li>/gi,         '- $1\n')
        .replace(/<[^>]+>/g,                        '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .trim();
}

// ── RichTextEditor (v2 Component) ────────────────────────────────────────────

export class RichTextEditor extends Component('arianna-richtext-editor', HTMLElement, {}, {
    attrs : ['placeholder', 'min-height', 'max-height', 'spellcheck', 'markdown', 'value'],
})
{
    readonly html$    : Signal<string>  = signal('');
    readonly focused$ : Signal<boolean> = signal(false);

    #toolbar! : HTMLDivElement;
    #body!    : HTMLDivElement;
    #opts!    : Required<RichTextEditorOptions>;

    constructor(opts: RichTextEditorOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.placeholder)     el.setAttribute('placeholder', opts.placeholder);
        if (opts.minHeight  != null) el.setAttribute('min-height', String(opts.minHeight));
        if (opts.maxHeight  != null) el.setAttribute('max-height', String(opts.maxHeight));
        if (opts.spellcheck === false) el.setAttribute('spellcheck', 'false');
        if (opts.markdown   === false) el.setAttribute('markdown', 'false');
        if (opts.value)           el.setAttribute('value', opts.value);

        // Stash for build()
        this.#opts = {
            placeholder: opts.placeholder ?? 'Start typing…',
            toolbar    : opts.toolbar     ?? DEFAULT_TOOLBAR,
            minHeight  : opts.minHeight   ?? 150,
            maxHeight  : opts.maxHeight   ?? Number.POSITIVE_INFINITY,
            spellcheck : opts.spellcheck  ?? true,
            markdown   : opts.markdown    ?? true,
            value      : opts.value       ?? '',
        };
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.rte-wrap')) return;

        // Re-read attrs (may override constructor opts if set via markup)
        const sPlaceholder = self.attrSignal('placeholder');
        const sMinH        = self.attrSignal('min-height');
        const sMaxH        = self.attrSignal('max-height');
        const sSpell       = self.attrSignal('spellcheck');
        const sMd          = self.attrSignal('markdown');
        const sValue       = self.attrSignal('value');

        if (sPlaceholder?.peek()) this.#opts.placeholder = sPlaceholder.peek() ?? this.#opts.placeholder;
        if (sMinH?.peek())        this.#opts.minHeight = parseInt(sMinH.peek() ?? '150', 10) || 150;
        if (sMaxH?.peek())        this.#opts.maxHeight = parseInt(sMaxH.peek() ?? '0', 10) || Number.POSITIVE_INFINITY;
        if (sSpell?.peek() === 'false') this.#opts.spellcheck = false;
        if (sMd?.peek()    === 'false') this.#opts.markdown   = false;
        if (sValue?.peek()) this.#opts.value = sValue.peek() ?? '';

        const wrap = document.createElement('div');
        wrap.className = 'rte-wrap';

        // Toolbar
        const tb = document.createElement('div');
        tb.className = 'rte-toolbar';
        this.#toolbar = tb;

        // Body
        const body = document.createElement('div');
        body.className = 'rte-body';
        body.contentEditable = 'true';
        body.spellcheck = this.#opts.spellcheck;
        body.dataset.placeholder = this.#opts.placeholder;
        body.style.minHeight = this.#opts.minHeight + 'px';
        if (isFinite(this.#opts.maxHeight)) {
            body.style.maxHeight = this.#opts.maxHeight + 'px';
            body.style.overflowY = 'auto';
        }
        this.#body = body;

        wrap.append(tb, body);
        root.appendChild(wrap);

        this.#buildToolbar();
        if (this.#opts.value) {
            body.innerHTML = this.#opts.value;
            this.html$.set(this.#opts.value);
        }
        this.#wireEvents();

        self.Sheet = RichTextEditor.DefaultSheet();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    get html(): string { return this.#body?.innerHTML ?? ''; }
    set html(value: string) {
        if (!this.#body) return;
        this.#body.innerHTML = value;
        this.html$.set(value);
    }

    get text(): string { return this.#body?.innerText ?? ''; }

    get markdown(): string { return htmlToMarkdown(this.#body?.innerHTML ?? ''); }

    get isEmpty(): boolean {
        if (!this.#body) return true;
        return !this.#body.textContent?.trim() && !this.#body.querySelector('img, video, iframe');
    }

    focus(): this { this.#body?.focus(); return this; }
    blur(): this  { this.#body?.blur();  return this; }

    clear(): this {
        if (!this.#body) return this;
        this.#body.innerHTML = '';
        this.html$.set('');
        this.#fireChange();
        return this;
    }

    /**
     * Execute a toolbar command programmatically. Pass an optional value for
     * commands like `'insertHTML'`, `'createLink'`, etc.
     */
    command(cmd: ToolbarCommand | string, val?: string): this {
        if (!this.#body) return this;
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        this.#body.focus();
        const def = TOOLBAR_DEFS[cmd];
        if (def) {
            def.exec(this);
        } else if (val !== undefined) {
            document.execCommand(cmd, false, val);
        } else {
            document.execCommand(cmd);
        }
        this.#fireChange();
        self.fire('arianna:richtext-command', { detail: { command: cmd, value: val, source: this }, bubbles: true });
        return this;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    #fireChange(): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        const html = this.#body.innerHTML;
        this.html$.set(html);
        self.fire('arianna:richtext-change', { detail: { html, text: this.text, source: this }, bubbles: true });
    }

    #buildToolbar(): void {
        for (const cmd of this.#opts.toolbar) {
            if (cmd === '|') {
                const sep = document.createElement('span');
                sep.className = 'rte-sep';
                this.#toolbar.appendChild(sep);
                continue;
            }
            const def = TOOLBAR_DEFS[cmd];
            if (!def) continue;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'rte-btn';
            btn.title = def.title;
            btn.innerHTML = def.label;
            if (def.style) btn.setAttribute('style', def.style);

            btn.addEventListener('mousedown', (e: MouseEvent) => {
                e.preventDefault();           // prevent editor losing focus
                this.#body.focus();
                def.exec(this);
                this.#fireChange();
                const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
                self.fire('arianna:richtext-command', { detail: { command: cmd, source: this }, bubbles: true });
            });
            this.#toolbar.appendChild(btn);
        }
    }

    #wireEvents(): void {
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };

        this.#body.addEventListener('input', () => {
            if (this.#opts.markdown) this.#processMarkdown();
            this.#fireChange();
        });
        this.#body.addEventListener('focus', () => {
            this.focused$.set(true);
            self.fire('arianna:richtext-focus', { detail: { source: this }, bubbles: true });
        });
        this.#body.addEventListener('blur', () => {
            this.focused$.set(false);
            self.fire('arianna:richtext-blur', { detail: { html: this.html, text: this.text, source: this }, bubbles: true });
        });
        this.#body.addEventListener('keydown', (e: Event) => {
            const ke = e as KeyboardEvent;
            if (ke.ctrlKey || ke.metaKey) {
                switch (ke.key.toLowerCase()) {
                    case 'b': ke.preventDefault(); this.command('bold');      break;
                    case 'i': ke.preventDefault(); this.command('italic');    break;
                    case 'u': ke.preventDefault(); this.command('underline'); break;
                    case 'z': if (!ke.shiftKey) { ke.preventDefault(); this.command('undo'); } break;
                    case 'y': ke.preventDefault(); this.command('redo');      break;
                }
            }
        });
    }

    #processMarkdown(): void {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const node = sel.anchorNode;
        if (!node || node.nodeType !== Node.TEXT_NODE) return;
        const text = node.textContent ?? '';

        const headMatch = text.match(/^(#{1,3})\s(.+)$/);
        if (headMatch) {
            const level = headMatch[1]?.length ?? 1;
            const content = headMatch[2] ?? '';
            document.execCommand('formatBlock', false, `h${level}`);
            if (node.parentElement) node.parentElement.textContent = content;
            const range = document.createRange();
            const el = sel.anchorNode?.parentElement;
            if (el) {
                range.selectNodeContents(el);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #fff)',
                border      : '1px solid var(--ar-border, #e0e0e0)',
                borderRadius: 'var(--ar-radius, 6px)',
                color       : 'var(--ar-text, #111)',
                display     : 'inline-block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                overflow    : 'hidden',
            }),
            new Rule(':host .rte-wrap', {
                display      : 'flex',
                flexDirection: 'column',
            }),
            new Rule(':host .rte-toolbar', {
                alignItems  : 'center',
                background  : 'var(--ar-bg2, #f5f5f5)',
                borderBottom: '1px solid var(--ar-border, #e0e0e0)',
                display     : 'flex',
                flexWrap    : 'wrap',
                gap         : '2px',
                padding     : '6px 8px',
            }),
            new Rule(':host .rte-btn', {
                background  : 'var(--ar-bg, #fff)',
                border      : '1px solid var(--ar-border, #e0e0e0)',
                borderRadius: 'var(--ar-radius-sm, 4px)',
                color       : 'var(--ar-text, #111)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.75rem',
                lineHeight  : '1.4',
                padding     : '3px 7px',
                transition  : 'background var(--ar-transition, 0.14s)',
            }),
            new Rule(':host .rte-btn:hover', { background: 'var(--ar-bg3, #eee)' }),
            new Rule(':host .rte-btn:active', { background: 'var(--ar-bg4, #ddd)' }),
            new Rule(':host .rte-sep', {
                alignSelf : 'center',
                background: 'var(--ar-border, #e0e0e0)',
                display   : 'inline-block',
                height    : '18px',
                margin    : '0 4px',
                width     : '1px',
            }),
            new Rule(':host .rte-body', {
                background : 'var(--ar-bg, #fff)',
                color      : 'var(--ar-text, #111)',
                fontSize   : '0.88rem',
                lineHeight : '1.75',
                outline    : 'none',
                padding    : '14px 16px',
                position   : 'relative',
            }),
            new Rule(':host .rte-body:empty::before', {
                color         : 'var(--ar-muted, #aaa)',
                content       : 'attr(data-placeholder)',
                pointerEvents : 'none',
                position      : 'absolute',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'RichTextEditor', {
        value: RichTextEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default RichTextEditor;
