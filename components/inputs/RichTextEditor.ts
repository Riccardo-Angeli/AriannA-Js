/**
 * @module    components/inputs/RichTextEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA RichTextEditor component module.
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

/** @namespace   RichTextEditor
 *  @public
 *  @description Namespace containing RichTextEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace RichTextEditor
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        ToolbarCommandType
         *  @public
         *  @type        {ToolbarCommand}
         *  @description Type alias for ToolbarCommandType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ToolbarCommandType = ToolbarCommand;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   Options
         *  @public
         *  @description Options contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options extends RichTextEditorOptions
        {
        }

        /** @interface   ToolbarDefContract
         *  @public
         *  @description ToolbarDefContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ToolbarDefContract extends ToolbarDef
        {
        }
    }

    /** @name        HtmlToMarkdown
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned HtmlToMarkdown value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const HtmlToMarkdown = htmlToMarkdown;

    /**
     * @convention AriannA component namespace merge
     * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
     */
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
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'SchemaInterfaces.Reactivity.Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    const signal = Reactivity.CreateSignal;

    /** @name        effect
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned effect value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const effect = (fn: () => void): (() => void) => {
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
    const { Rule, Stylesheet } = Css;
    // ── Types ─────────────────────────────────────────────────────────────────────
    /** @name        ToolbarCommand
     *  @public
     *  @type        {'bold' | 'italic' | 'underline' | 'strikethrough' | 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'pre' | 'ul' | 'ol' | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify' | 'link' | 'unlink' | 'image' | 'undo' | 'redo' | 'clear' | '|'}
     *  @description Type alias for ToolbarCommand.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ToolbarCommand = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'pre' | 'ul' | 'ol' | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify' | 'link' | 'unlink' | 'image' | 'undo' | 'redo' | 'clear' | '|';

    /** @interface   RichTextEditorOptions
     *  @public
     *  @description RichTextEditorOptions contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface RichTextEditorOptions
    {
        /** Placeholder text shown when editor is empty. Default: 'Start typing…'. */
        placeholder?: string;

        /** Toolbar commands. Default: full toolbar. */
        toolbar?: ToolbarCommand[];

        /** Minimum editor height in px. Default: 150. */
        minHeight?: number;

        /** Maximum editor height in px before scroll. Default: undefined (no limit). */
        maxHeight?: number;

        /** Enable browser spell-check. Default: true. */
        spellcheck?: boolean;

        /** Process inline Markdown shortcuts. Default: true. */
        markdown?: boolean;

        /** Initial HTML content. Default: ''. */
        value?: string;
    }
    // ── Toolbar button map ────────────────────────────────────────────────────────
    /** @interface   ToolbarDef
     *  @public
     *  @description ToolbarDef contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface ToolbarDef
    {
        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        label: string;

        /** @name        title
         *  @public
         *  @type        {string}
         *  @description Component member for title.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        title: string;

        /** @name        exec
         *  @public
         *  @type        {(ed: RichTextEditor) => void}
         *  @description Component member for exec.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        exec: (ed: RichTextEditor) => void;

        /** @name        style
         *  @public
         *  @type        {string}
         *  @description Component member for style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        style?: string;
    }

    /** @name        TOOLBAR_DEFS
     *  @public
     *  @type        {Record<string, ToolbarDef>}
     *  @description Namespace-owned TOOLBAR_DEFS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const TOOLBAR_DEFS: Record<string, ToolbarDef> = {
        bold: { label: 'B', title: 'Bold (Ctrl+B)', style: 'font-weight:700;', exec: () => document.execCommand('bold') },
        italic: { label: 'I', title: 'Italic (Ctrl+I)', style: 'font-style:italic;', exec: () => document.execCommand('italic') },
        underline: { label: 'U', title: 'Underline (Ctrl+U)', style: 'text-decoration:underline;', exec: () => document.execCommand('underline') },
        strikethrough: { label: 'S\u0336', title: 'Strikethrough', style: 'text-decoration:line-through;', exec: () => document.execCommand('strikeThrough') },
        h1: { label: 'H1', title: 'Heading 1', exec: () => document.execCommand('formatBlock', false, 'h1') },
        h2: { label: 'H2', title: 'Heading 2', exec: () => document.execCommand('formatBlock', false, 'h2') },
        h3: { label: 'H3', title: 'Heading 3', exec: () => document.execCommand('formatBlock', false, 'h3') },
        p: { label: 'P', title: 'Paragraph', exec: () => document.execCommand('formatBlock', false, 'p') },
        blockquote: { label: '\u275D', title: 'Blockquote', exec: () => document.execCommand('formatBlock', false, 'blockquote') },
        pre: { label: '\u2039\u203A', title: 'Code block', style: 'font-family:monospace;', exec: () => document.execCommand('formatBlock', false, 'pre') },
        ul: { label: '\u2022 List', title: 'Bullet list', exec: () => document.execCommand('insertUnorderedList') },
        ol: { label: '1. List', title: 'Numbered list', exec: () => document.execCommand('insertOrderedList') },
        alignLeft: { label: '\u2AE4', title: 'Align left', exec: () => document.execCommand('justifyLeft') },
        alignCenter: { label: '\u2261', title: 'Align center', exec: () => document.execCommand('justifyCenter') },
        alignRight: { label: '\u2AE5', title: 'Align right', exec: () => document.execCommand('justifyRight') },
        alignJustify: { label: '\u2630', title: 'Justify', exec: () => document.execCommand('justifyFull') },
        link: { label: '\u{1F517}', title: 'Insert link', exec: () => {
                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = prompt('URL:', 'https://');
                if (url)
                    document.execCommand('createLink', false, url);
            } },
        unlink: { label: '\u2702 link', title: 'Remove link', exec: () => document.execCommand('unlink') },
        image: { label: '\u{1F5BC}', title: 'Insert image', exec: () => {
                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = prompt('Image URL:', 'https://');
                if (url)
                    document.execCommand('insertHTML', false, `<img src="${url}" alt="" style="max-width:100%">`);
            } },
        undo: { label: '\u21A9', title: 'Undo (Ctrl+Z)', exec: () => document.execCommand('undo') },
        redo: { label: '\u21AA', title: 'Redo (Ctrl+Y)', exec: () => document.execCommand('redo') },
        clear: { label: '\u{1F5D1}', title: 'Clear all content', exec: (ed) => ed.clear() },
    };

    /** @name        DEFAULT_TOOLBAR
     *  @public
     *  @type        {ToolbarCommand[]}
     *  @description Namespace-owned DEFAULT_TOOLBAR value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
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
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .trim();
    }
    // ── RichTextEditor (v2 Component) ────────────────────────────────────────────
    /** @class       RichTextEditor
     *  @public
     *  @description AriannA RichTextEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-richtext-editor', {}, {
        Attributes: ['placeholder', 'min-height', 'max-height', 'spellcheck', 'markdown', 'value'],
    })
    export class RichTextEditor extends HTMLElement
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

        /** @name        html$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<string>}
         *  @description Component member for html$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly html$: SchemaInterfaces.Reactivity.Signal<string> = signal('');

        /** @name        focused$
         *  @public
         *  @readonly
         *  @type        {SchemaInterfaces.Reactivity.Signal<boolean>}
         *  @description Component member for focused$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly focused$: SchemaInterfaces.Reactivity.Signal<boolean> = signal(false);

        /** @name        #toolbar
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for toolbar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #toolbar!: HTMLDivElement;

        /** @name        #body
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for body.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #body!: HTMLDivElement;

        /** @name        #opts
         *  @public
         *  @type        {Required<RichTextEditorOptions>}
         *  @description Component member for opts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #opts!: Required<RichTextEditorOptions>;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {RichTextEditorOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: RichTextEditorOptions = {})
        {
            super();

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
            };

            /** @name        el
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const el = self.render();
            if (opts.placeholder)
                el.setAttribute('placeholder', opts.placeholder);
            if (opts.minHeight != null)
                el.setAttribute('min-height', String(opts.minHeight));
            if (opts.maxHeight != null)
                el.setAttribute('max-height', String(opts.maxHeight));
            if (opts.spellcheck === false)
                el.setAttribute('spellcheck', 'false');
            if (opts.markdown === false)
                el.setAttribute('markdown', 'false');
            if (opts.value)
                el.setAttribute('value', opts.value);
            // Stash for onConnected()
            this.#opts = {
                placeholder: opts.placeholder ?? 'Start typing…',
                toolbar: opts.toolbar ?? DEFAULT_TOOLBAR,
                minHeight: opts.minHeight ?? 150,
                maxHeight: opts.maxHeight ?? Number.POSITIVE_INFINITY,
                spellcheck: opts.spellcheck ?? true,
                markdown: opts.markdown ?? true,
                value: opts.value ?? '',
            };
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

                /** @name        signal
                 *  @public
                 *  @type        {{
                    attribute(name: string): SchemaInterfaces.Reactivity.Signal<string | null>;
                }}
                 *  @description Component member for signal.
                 *  @returns     {{
                    attribute(name: string): SchemaInterfaces.Reactivity.Signal<string | null>;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                signal():
                {
                    /** @name        attribute
                     *  @public
                     *  @type        {SchemaInterfaces.Reactivity.Signal<string | null>}
                     *  @description Component member for attribute.
                     *  @param       {string} name Parameter.
                     *  @returns     {SchemaInterfaces.Reactivity.Signal<string | null>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    attribute(name: string): SchemaInterfaces.Reactivity.Signal<string | null>;
                };

                /** @name        Sheet
                 *  @public
                 *  @type        {Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Css.Stylesheet | null;
            };

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = self.render();
            if (root.querySelector('.rte-wrap'))
                return;
            // Re-read attributes (may override constructor opts if set via markup)
            /** @name        sPlaceholder
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sPlaceholder value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sPlaceholder = self.signal().attribute('placeholder');

            /** @name        sMinH
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sMinH value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sMinH = self.signal().attribute('min-height');

            /** @name        sMaxH
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sMaxH value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sMaxH = self.signal().attribute('max-height');

            /** @name        sSpell
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sSpell value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sSpell = self.signal().attribute('spellcheck');

            /** @name        sMd
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sMd value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sMd = self.signal().attribute('markdown');

            /** @name        sValue
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sValue value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sValue = self.signal().attribute('value');
            if (sPlaceholder?.Peek())
                this.#opts.placeholder = sPlaceholder.Peek() ?? this.#opts.placeholder;
            if (sMinH?.Peek())
                this.#opts.minHeight = parseInt(sMinH.Peek() ?? '150', 10) || 150;
            if (sMaxH?.Peek())
                this.#opts.maxHeight = parseInt(sMaxH.Peek() ?? '0', 10) || Number.POSITIVE_INFINITY;
            if (sSpell?.Peek() === 'false')
                this.#opts.spellcheck = false;
            if (sMd?.Peek() === 'false')
                this.#opts.markdown = false;
            if (sValue?.Peek())
                this.#opts.value = sValue.Peek() ?? '';

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'rte-wrap';
            // Toolbar
            /** @name        tb
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tb value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tb = document.createElement('div');
            tb.className = 'rte-toolbar';
            this.#toolbar = tb;
            // Body
            /** @name        body
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned body value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const body = document.createElement('div');
            body.className = 'rte-body';
            body.contentEditable = 'true';
            body.spellcheck = this.#opts.spellcheck;
            body.dataset.placeholder = this.#opts.placeholder;
            body.style.minHeight = this.#opts.minHeight + 'px';
            if (isFinite(this.#opts.maxHeight))
            {
                body.style.maxHeight = this.#opts.maxHeight + 'px';
                body.style.overflowY = 'auto';
            }
            this.#body = body;
            wrap.append(tb, body);
            root.appendChild(wrap);
            this.#buildToolbar();
            if (this.#opts.value)
            {
                body.innerHTML = this.#opts.value;
                this.html$.Set(this.#opts.value);
            }
            this.#wireEvents();
            self.Sheet = RichTextEditor.DefaultSheet();
        }
        // ── Public API ────────────────────────────────────────────────────────────
        /** @name        html
         *  @public
         *  @type        {string}
         *  @description Component member for html.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get html(): string { return this.#body?.innerHTML ?? ''; }

        /** @name        html
         *  @public
         *  @type        {void}
         *  @description Component member for html.
         *  @param       {string} value Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set html(value: string)
        {
            if (!this.#body)
                return;
            this.#body.innerHTML = value;
            this.html$.Set(value);
        }

        /** @name        text
         *  @public
         *  @type        {string}
         *  @description Component member for text.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get text(): string { return this.#body?.innerText ?? ''; }

        /** @name        markdown
         *  @public
         *  @type        {string}
         *  @description Component member for markdown.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get markdown(): string { return htmlToMarkdown(this.#body?.innerHTML ?? ''); }

        /** @name        isEmpty
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Empty.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get isEmpty(): boolean
        {
            if (!this.#body)
                return true;
            return !this.#body.textContent?.trim() && !this.#body.querySelector('img, video, iframe');
        }

        /** @name        focus
         *  @public
         *  @type        {this}
         *  @description Component member for focus.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        focus(): this { this.#body?.focus(); return this; }

        /** @name        blur
         *  @public
         *  @type        {this}
         *  @description Component member for blur.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        blur(): this { this.#body?.blur(); return this; }

        /** @name        clear
         *  @public
         *  @type        {this}
         *  @description Component member for clear.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        clear(): this
        {
            if (!this.#body)
                return this;
            this.#body.innerHTML = '';
            this.html$.Set('');
            this.#fireChange();
            return this;
        }

        /**
         * Execute a toolbar command programmatically. Pass an optional value for
         * commands like `'insertHTML'`, `'createLink'`, etc.
         */
        command(cmd: ToolbarCommand | string, val?: string): this
        {
            if (!this.#body)
                return this;

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
            this.#body.focus();

            /** @name        def
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned def value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const def = TOOLBAR_DEFS[cmd];
            if (def)
            {
                def.exec(this);
            }
            else if (val !== undefined)
            {
                document.execCommand(cmd, false, val);
            }
            else
            {
                document.execCommand(cmd);
            }
            this.#fireChange();
            self.fire('arianna:richtext-command', { detail: { command: cmd, value: val, source: this }, bubbles: true });
            return this;
        }
        // ── Internal ──────────────────────────────────────────────────────────────
        /** @name        #fireChange
         *  @public
         *  @type        {void}
         *  @description Component member for fire Change.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #fireChange(): void
        {
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

            /** @name        html
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned html value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const html = this.#body.innerHTML;
            this.html$.Set(html);
            self.fire('arianna:richtext-change', { detail: { html, text: this.text, source: this }, bubbles: true });
        }

        /** @name        #buildToolbar
         *  @public
         *  @type        {void}
         *  @description Component member for build Toolbar.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #buildToolbar(): void
        {
            for (const cmd of this.#opts.toolbar)
            {
                if (cmd === '|')
                {
                    /** @name        sep
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sep value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sep = document.createElement('span');
                    sep.className = 'rte-sep';
                    this.#toolbar.appendChild(sep);
                    continue;
                }

                /** @name        def
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned def value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const def = TOOLBAR_DEFS[cmd];
                if (!def)
                    continue;

                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'rte-btn';
                btn.title = def.title;
                btn.innerHTML = def.label;
                if (def.style)
                    btn.setAttribute('style', def.style);
                btn.addEventListener('mousedown', (e: MouseEvent) => {
                    e.preventDefault(); // prevent editor losing focus
                    this.#body.focus();
                    def.exec(this);
                    this.#fireChange();

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
                    self.fire('arianna:richtext-command', { detail: { command: cmd, source: this }, bubbles: true });
                });
                this.#toolbar.appendChild(btn);
            }
        }

        /** @name        #wireEvents
         *  @public
         *  @type        {void}
         *  @description Component member for wire Events.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #wireEvents(): void
        {
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
            this.#body.addEventListener('input', () => {
                if (this.#opts.markdown)
                    this.#processMarkdown();
                this.#fireChange();
            });
            this.#body.addEventListener('focus', () => {
                this.focused$.Set(true);
                self.fire('arianna:richtext-focus', { detail: { source: this }, bubbles: true });
            });
            this.#body.addEventListener('blur', () => {
                this.focused$.Set(false);
                self.fire('arianna:richtext-blur', { detail: { html: this.html, text: this.text, source: this }, bubbles: true });
            });
            this.#body.addEventListener('keydown', (e: Event) => {
                /** @name        ke
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ke value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ke = e as KeyboardEvent;
                if (ke.ctrlKey || ke.metaKey)
                {
                    switch (ke.key.toLowerCase())
                    {
                        case 'b':
                            ke.preventDefault();
                            this.command('bold');
                            break;
                        case 'i':
                            ke.preventDefault();
                            this.command('italic');
                            break;
                        case 'u':
                            ke.preventDefault();
                            this.command('underline');
                            break;
                        case 'z':
                            if (!ke.shiftKey)
                            {
                                ke.preventDefault();
                                this.command('undo');
                            }
                            break;
                        case 'y':
                            ke.preventDefault();
                            this.command('redo');
                            break;
                    }
                }
            });
        }

        /** @name        #processMarkdown
         *  @public
         *  @type        {void}
         *  @description Component member for process Markdown.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #processMarkdown(): void
        {
            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0)
                return;

            /** @name        node
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned node value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const node = sel.anchorNode;
            if (!node || node.nodeType !== Node.TEXT_NODE)
                return;

            /** @name        text
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned text value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const text = node.textContent ?? '';

            /** @name        headMatch
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned headMatch value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const headMatch = text.match(/^(#{1,3})\s(.+)$/);
            if (headMatch)
            {
                /** @name        level
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned level value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const level = headMatch[1]?.length ?? 1;

                /** @name        content
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned content value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const content = headMatch[2] ?? '';
                document.execCommand('formatBlock', false, `h${level}`);
                if (node.parentElement)
                    node.parentElement.textContent = content;

                /** @name        range
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned range value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const range = document.createRange();

                /** @name        el
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned el value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const el = sel.anchorNode?.parentElement;
                if (el)
                {
                    range.selectNodeContents(el);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Css.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg, #fff)',
                    border: '1px solid var(--ar-border, #e0e0e0)',
                    borderRadius: 'var(--ar-radius, 6px)',
                    color: 'var(--ar-text, #111)',
                    display: 'inline-block',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, system-ui, sans-serif)',
                    overflow: 'hidden',
                }),
                new Rule(':host .rte-wrap', {
                    display: 'flex',
                    flexDirection: 'column',
                }),
                new Rule(':host .rte-toolbar', {
                    alignItems: 'center',
                    background: 'var(--ar-bg2, #f5f5f5)',
                    borderBottom: '1px solid var(--ar-border, #e0e0e0)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2px',
                    padding: '6px 8px',
                }),
                new Rule(':host .rte-btn', {
                    background: 'var(--ar-bg, #fff)',
                    border: '1px solid var(--ar-border, #e0e0e0)',
                    borderRadius: 'var(--ar-radius-sm, 4px)',
                    color: 'var(--ar-text, #111)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.75rem',
                    lineHeight: '1.4',
                    padding: '3px 7px',
                    transition: 'background var(--ar-transition, 0.14s)',
                }),
                new Rule(':host .rte-btn:hover', { background: 'var(--ar-bg3, #eee)' }),
                new Rule(':host .rte-btn:active', { background: 'var(--ar-bg4, #ddd)' }),
                new Rule(':host .rte-sep', {
                    alignSelf: 'center',
                    background: 'var(--ar-border, #e0e0e0)',
                    display: 'inline-block',
                    height: '18px',
                    margin: '0 4px',
                    width: '1px',
                }),
                new Rule(':host .rte-body', {
                    background: 'var(--ar-bg, #fff)',
                    color: 'var(--ar-text, #111)',
                    fontSize: '0.88rem',
                    lineHeight: '1.75',
                    outline: 'none',
                    padding: '14px 16px',
                    position: 'relative',
                }),
                new Rule(':host .rte-body:empty::before', {
                    color: 'var(--ar-muted, #aaa)',
                    content: 'attr(data-placeholder)',
                    pointerEvents: 'none',
                    position: 'absolute',
                }),
            ]);
        }
    }
}
export default RichTextEditor;

export type RichTextEditorOptions = RichTextEditor.RichTextEditorOptions;

export type ToolbarCommand = RichTextEditor.ToolbarCommand;
