/**
 * @module    components/composite/CodeEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * CodeEditor — pure-AriannA code editor widget.
 *
 *   ┌─────┬──────────────────────────────────────────────┐
 *   │  1  │ const greeting = "Hello, AriannA!";          │
 *   │  2  │                                              │
 *   │  3  │ function greet(name: string) {               │
 *   │  4  │     console.log(`${greeting} — ${name}`);    │
 *   │  5  │ }                                            │
 *   └─────┴──────────────────────────────────────────────┘
 *
 * Architecture:
 *   • A transparent <textarea> sits on top of a highlighted <pre><code>
 *     layer. The user types into the textarea; we re-render the pre on
 *     each input. This delegates selection / cursor / native undo-redo
 *     to the browser — no custom carets, no virtual selections.
 *   • Tokenizer is a small regex bank per language. JS / TS / HTML / CSS
 *     are included; unknown languages fall through to a no-highlight mode.
 *   • Gutter line numbers stay aligned by sharing the same font-metrics
 *     (CSS font shorthand mirrored on textarea and pre).
 *
 * Keyboard shortcuts:
 *   Tab               indent by `indent` spaces (or indent selection)
 *   Shift+Tab         dedent
 *   Ctrl/Cmd + D      duplicate current line (or selection)
 *   Ctrl/Cmd + /      toggle line comment
 *   Ctrl/Cmd + ]      indent selection
 *   Ctrl/Cmd + [      dedent selection
 *   Alt + ArrowUp     move line up
 *   Alt + ArrowDown   move line down
 *   Auto-bracket insertion for ( [ { ' " `
 *
 * Public API:
 *   const editor = new CodeEditor({ language: 'ts', indent: 4 });
 *   editor.Value;                      // get/set source code
 *   editor.Language;                   // get/set language
 *   editor.on('change', e => …);       // fires after every edit
 *   editor.focus(); editor.blur();
 */

import { Component } from '../../core/Component.ts';
import { signal, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export type CodeEditorLanguage = 'js' | 'ts' | 'jsx' | 'tsx' | 'html' | 'css' | 'json' | 'plain';

export interface CodeEditorOptions
{
    /** Initial source code. */
    value?       : string;
    /** Syntax highlighting language. Default 'ts'. */
    language?    : CodeEditorLanguage;
    /** Indent width in spaces. Default 4. */
    indent?      : number;
    /** Use tabs instead of spaces for indentation. Default false. */
    useTabs?     : boolean;
    /** Read-only mode. Default false. */
    readonly?    : boolean;
    /** Visible line numbers. Default true. */
    lineNumbers? : boolean;
    /** Tab size for displayed tabs. Default 4. */
    tabSize?     : number;
    /** Fixed height — e.g. '300px'. If unset, the editor grows with content. */
    height?      : string;
    /** Initial focus on attach. Default false. */
    autoFocus?   : boolean;
}

interface Token { kind: string; text: string; }

/* ─────────────────────────────────────────────────────────────────────────
   Tokenizers — small regex bank per language. Order matters: each rule
   is tried left-to-right; the first match wins. The tokenizer keeps a
   running offset and emits an `unknown` token for unmatched characters.
   ───────────────────────────────────────────────────────────────────── */

interface Rule_ { kind: string; re: RegExp; }

const RULES_JS: Rule_[] = [
    { kind: 'comment',  re: /^\/\*[\s\S]*?\*\// },
    { kind: 'comment',  re: /^\/\/.*/ },
    { kind: 'string',   re: /^`(?:\\.|[^`\\])*`/ },
    { kind: 'string',   re: /^"(?:\\.|[^"\\\n])*"/ },
    { kind: 'string',   re: /^'(?:\\.|[^'\\\n])*'/ },
    { kind: 'number',   re: /^(?:0x[\da-fA-F_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)n?\b/ },
    { kind: 'regex',    re: /^\/(?!\/)(?:\\.|\[[^\]]*\]|[^/\\\n])+\/[gimsuy]*/ },
    { kind: 'keyword',  re: /^\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|private|protected|public|readonly|return|set|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield)\b/ },
    { kind: 'builtin',  re: /^\b(?:console|window|document|Math|JSON|Object|Array|String|Number|Boolean|Promise|Map|Set|WeakMap|WeakSet|Symbol|Error|RegExp|Date|Proxy|Reflect|globalThis)\b/ },
    { kind: 'function', re: /^[A-Za-z_$][\w$]*(?=\s*\()/ },
    { kind: 'ident',    re: /^[A-Za-z_$][\w$]*/ },
    { kind: 'punct',    re: /^(?:=>|\.\.\.|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\+\+|--|\*\*|<<|>>|>>>|[+\-*/%&|^!=<>?:;,.()\[\]{}~@])/ },
    { kind: 'space',    re: /^[ \t]+/ },
    { kind: 'newline',  re: /^\n/ },
];

const RULES_TS: Rule_[] = RULES_JS;
const RULES_JSX = RULES_JS;
const RULES_TSX = RULES_JS;

const RULES_CSS: Rule_[] = [
    { kind: 'comment',  re: /^\/\*[\s\S]*?\*\// },
    { kind: 'string',   re: /^"(?:\\.|[^"\\\n])*"/ },
    { kind: 'string',   re: /^'(?:\\.|[^'\\\n])*'/ },
    { kind: 'number',   re: /^-?\d+(?:\.\d+)?(?:%|px|em|rem|vh|vw|vmin|vmax|deg|rad|turn|s|ms|fr|ch|ex|cm|mm|in|pt|pc)?\b/ },
    { kind: 'atrule',   re: /^@[A-Za-z-]+/ },
    { kind: 'keyword',  re: /^\b(?:important)\b/ },
    { kind: 'selector', re: /^[#.][A-Za-z_][\w-]*/ },
    { kind: 'property', re: /^[A-Za-z-]+(?=\s*:)/ },
    { kind: 'function', re: /^[A-Za-z-]+(?=\s*\()/ },
    { kind: 'ident',    re: /^[A-Za-z_][\w-]*/ },
    { kind: 'punct',    re: /^[:;,{}()\[\]>+~*]/ },
    { kind: 'space',    re: /^[ \t]+/ },
    { kind: 'newline',  re: /^\n/ },
];

const RULES_HTML: Rule_[] = [
    { kind: 'comment',  re: /^<!--[\s\S]*?-->/ },
    { kind: 'doctype',  re: /^<!DOCTYPE[^>]*>/i },
    { kind: 'tag',      re: /^<\/?[A-Za-z][\w-]*/ },
    { kind: 'punct',    re: /^\/?>/ },
    { kind: 'attr',     re: /^[A-Za-z_:][\w:.-]*(?=\s*=)/ },
    { kind: 'string',   re: /^"(?:\\.|[^"\\])*"/ },
    { kind: 'string',   re: /^'(?:\\.|[^'\\])*'/ },
    { kind: 'punct',    re: /^=/ },
    { kind: 'space',    re: /^[ \t\n]+/ },
];

const RULES_JSON: Rule_[] = [
    { kind: 'string',   re: /^"(?:\\.|[^"\\])*"/ },
    { kind: 'number',   re: /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
    { kind: 'keyword',  re: /^\b(?:true|false|null)\b/ },
    { kind: 'punct',    re: /^[\[\]{}:,]/ },
    { kind: 'space',    re: /^[ \t\n]+/ },
];

function rulesFor(lang: CodeEditorLanguage): Rule_[]
{
    switch (lang)
    {
        case 'js':   return RULES_JS;
        case 'ts':   return RULES_TS;
        case 'jsx':  return RULES_JSX;
        case 'tsx':  return RULES_TSX;
        case 'html': return RULES_HTML;
        case 'css':  return RULES_CSS;
        case 'json': return RULES_JSON;
        default:     return [];
    }
}

function tokenize(src: string, lang: CodeEditorLanguage): Token[]
{
    const rules = rulesFor(lang);
    if (rules.length === 0) return [{ kind: 'plain', text: src }];

    const out: Token[] = [];
    let i = 0;
    while (i < src.length)
    {
        const slice = src.slice(i);
        let matched: Token | null = null;
        for (const r of rules)
        {
            const m = r.re.exec(slice);
            if (m && m.index === 0)
            {
                matched = { kind: r.kind, text: m[0] };
                break;
            }
        }
        if (!matched)
        {
            // No rule matched — emit a single 'unknown' char then advance.
            // Coalesce consecutive unknowns into one token to keep DOM small.
            const ch = src[i];
            const last = out[out.length - 1];
            if (last && last.kind === 'unknown') last.text += ch;
            else out.push({ kind: 'unknown', text: ch });
            i++;
            continue;
        }
        out.push(matched);
        i += matched.text.length;
    }
    return out;
}

/* HTML-escape — only the chars the highlighter renders inside <span>s. */
function esc(s: string): string
{
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/* ─────────────────────────────────────────────────────────────────────────
   CodeEditor — composite Component
   ───────────────────────────────────────────────────────────────────── */

export class CodeEditor extends Component('arianna-code-editor', HTMLElement, {}, {
    attrs : ['language', 'indent', 'readonly', 'line-numbers', 'tab-size', 'height', 'auto-focus'],
    // AriannA 2.0: CodeEditor internals live inside the component render root.
    // Closed Shadow DOM is the default; external playground/app code must use
    // el.Shadow.Root (or the public Value API), never host.querySelector().
    shadow: false,
})
{
    /** Source code as a reactive Signal. */
    declare value      : Signal<string>;
    declare language   : Signal<CodeEditorLanguage>;
    declare _indent    : number;
    declare _useTabs   : boolean;
    declare _readonly  : boolean;
    declare _showLn    : boolean;
    declare _tabSize   : number;
    declare _height    : string | null;
    declare _autoFocus : boolean;
    declare _gutter    : HTMLDivElement;
    declare _ta        : HTMLTextAreaElement;
    declare _pre       : HTMLPreElement;
    declare _code      : HTMLElement;
    declare _wrap      : HTMLDivElement;
    declare __fieldsInitialized : boolean;

    constructor(opts: CodeEditorOptions = {})
    {
        super(opts as never);
        this._initFields(opts);
    }

    /**
     * Idempotent field initializer. Called from both the constructor (when
     * user does `new CodeEditor({...})`) and from build() (when the element
     * is created by markup-upgrade, which does NOT call the user-class
     * constructor — only the parent HTMLElement constructor is invoked).
     * Reading attribute values lets markup-instantiated editors pick up
     * `<arianna-code-editor language="js">` automatically.
     */
    _initFields(opts: CodeEditorOptions = {}): void
    {
        if (this.__fieldsInitialized) return;
        this.__fieldsInitialized = true;

        // Read attributes for markup-upgrade case. Programmatic case passes opts.
        const attrLang   = this.getAttribute('language') as CodeEditorLanguage | null;
        const attrIndent = this.getAttribute('indent');
        const attrTabSz  = this.getAttribute('tab-size');
        const attrShowLn = this.getAttribute('line-numbers');
        const attrRO     = this.getAttribute('readonly');
        const attrHeight = this.getAttribute('height');
        const attrAutoF  = this.getAttribute('auto-focus');

        this.value      = signal(opts.value     ?? this.textContent ?? '');
        this.language   = signal(opts.language  ?? attrLang ?? 'ts');
        this._indent    = opts.indent      ?? (attrIndent ? parseInt(attrIndent, 10) : 4);
        this._useTabs   = !!opts.useTabs;
        this._readonly  = opts.readonly    ?? (attrRO === 'true' || attrRO === '');
        this._showLn    = opts.lineNumbers !== false && attrShowLn !== 'false';
        this._tabSize   = opts.tabSize     ?? (attrTabSz ? parseInt(attrTabSz, 10) : 4);
        this._height    = opts.height      ?? attrHeight ?? null;
        this._autoFocus = opts.autoFocus   ?? (attrAutoF === 'true' || attrAutoF === '');
    }

    build(): void
    {
        // Ensure fields exist (markup-upgrade path doesn't call constructor).
        this._initFields();

        // ── Sheet — scoped styling via :host rewrite ─────────────────────
        (this as unknown as { Sheet: Stylesheet | null }).Sheet = new Stylesheet(
            new Rule(':host', {
                display:        'block',
                position:       'relative',
                background:     '#0e0e10',
                color:          '#e6e8eb',
                borderRadius:   '8px',
                border:         '0',
                outline:        'none',
                fontFamily:     "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                fontSize:       '13px',
                lineHeight:     '1.5',
                overflow:       'hidden',
                boxSizing:      'border-box',
            }),
            new Rule(':host:focus, :host *:focus', {
                outline:        'none',
            }),
            new Rule(':host .ce-wrap', {
                position:       'relative',
                display:        'flex',
                width:          '100%',
                height:         this._height ?? 'auto',
                minHeight:      this._height ? '0' : '120px',
                maxHeight:      this._height ?? 'none',
                overflow:       'auto',
            }),
            new Rule(':host .ce-gutter', {
                flex:           '0 0 auto',
                width:          '48px',
                padding:        '10px 6px 10px 12px',
                textAlign:      'right',
                color:          '#5a6068',
                background:     '#0a0a0c',
                userSelect:     'none',
                whiteSpace:     'pre',
                borderRight:    '1px solid #25272b',
                fontFamily:     'inherit',
                fontSize:       'inherit',
                lineHeight:     'inherit',
                boxSizing:      'border-box',
            }),
            new Rule(':host .ce-stage', {
                flex:           '1 1 0',
                position:       'relative',
                overflow:       'visible',
                minWidth:       '0',
                border:         '0',
                outline:        'none',
            }),
            new Rule(':host .ce-pre', {
                margin:         '0',
                padding:        '10px 12px',
                whiteSpace:     'pre',
                wordWrap:       'normal',
                overflowWrap:   'normal',
                fontFamily:     'inherit',
                fontSize:       'inherit',
                lineHeight:     'inherit',
                letterSpacing:  '0',
                tabSize:        String(this._tabSize),
                pointerEvents:  'none',
                color:          '#e6e8eb',
                background:     'transparent',
                minHeight:      '100%',
                boxSizing:      'border-box',
                border:         '0',
                outline:        'none',
            }),
            // <code> inside <pre> — UA default sets font-family:monospace which
            // overrides what <pre> inherits from :host. Force it to inherit so
            // <pre> and <textarea> share identical glyph metrics. Without this
            // the cursor position drifts relative to the syntax-highlighted
            // text by a fraction of a character that accumulates per line.
            new Rule(':host .ce-code', {
                fontFamily:     'inherit',
                fontSize:       'inherit',
                lineHeight:     'inherit',
                letterSpacing:  '0',
                tabSize:        String(this._tabSize),
                whiteSpace:     'pre',
                background:     'transparent',
                color:          'inherit',
            }),
            // Plain whitespace tokens: must not have any letter-spacing or
            // font-variant that would change their width compared to the
            // textarea.
            new Rule(':host .ce-code span', {
                fontFamily:     'inherit',
                fontSize:       'inherit',
                lineHeight:     'inherit',
                letterSpacing:  '0',
                fontVariantLigatures: 'none',
            }),
            new Rule(':host .ce-ta', {
                position:       'absolute',
                top:            '0', left: '0', right: '0', bottom: '0',
                width:          '100%', height: '100%',
                margin:         '0',
                padding:        '10px 12px',
                border:         '0',
                outline:        'none',
                resize:         'none',
                background:     'transparent',
                color:          'var(--arianna-code-editor-input-color, #e6e8eb)',
                caretColor:     '#e6e8eb',
                fontFamily:     'inherit',
                fontSize:       'inherit',
                lineHeight:     'inherit',
                letterSpacing:  '0',
                fontVariantLigatures: 'none',
                tabSize:        String(this._tabSize),
                whiteSpace:     'pre',
                wordWrap:       'normal',
                overflowWrap:   'normal',
                overflow:       'hidden',
                boxSizing:      'border-box',
                /* Selection visible against transparent text */
            }),
            new Rule(':host .ce-ta:focus', {
                outline:        'none',
                border:         '0',
                boxShadow:      'none',
            }),
            new Rule(':host .ce-ta::selection', {
                background:     'rgba(228,12,136,0.32)',
            }),
            // Note: previously had a ::-moz-selection rule here, but Chrome
            // rejects the Mozilla-specific pseudo as invalid syntax, and that
            // failure used to cascade IndexSizeError onto every following
            // rule. Modern Firefox (62+) supports plain ::selection so the
            // alias is no longer needed.
            // ── Token colors (one-dark-ish) ─────────────────────────────
            new Rule(':host .tk-comment',  { color: '#7a818a', fontStyle: 'italic' }),
            new Rule(':host .tk-string',   { color: '#98c379' }),
            new Rule(':host .tk-number',   { color: '#d19a66' }),
            new Rule(':host .tk-regex',    { color: '#56b6c2' }),
            new Rule(':host .tk-keyword',  { color: '#c678dd', fontWeight: '600' }),
            new Rule(':host .tk-builtin',  { color: '#e5c07b' }),
            new Rule(':host .tk-function', { color: '#61afef' }),
            new Rule(':host .tk-ident',    { color: '#e6e8eb' }),
            new Rule(':host .tk-punct',    { color: '#abb2bf' }),
            new Rule(':host .tk-tag',      { color: '#e06c75' }),
            new Rule(':host .tk-attr',     { color: '#d19a66' }),
            new Rule(':host .tk-property', { color: '#61afef' }),
            new Rule(':host .tk-selector', { color: '#e06c75' }),
            new Rule(':host .tk-atrule',   { color: '#c678dd' }),
            new Rule(':host .tk-doctype',  { color: '#7a818a' }),
            new Rule(':host .tk-unknown',  { color: '#e6e8eb' }),
            new Rule(':host .tk-space',    { color: 'inherit' }),
            new Rule(':host .tk-newline',  { color: 'inherit' }),
        );

        // ── DOM ──────────────────────────────────────────────────────────
        this._wrap = document.createElement('div'); this._wrap.className = 'ce-wrap';

        this._gutter = document.createElement('div'); this._gutter.className = 'ce-gutter';
        if (this._showLn) this._wrap.appendChild(this._gutter);

        const stage = document.createElement('div'); stage.className = 'ce-stage';

        this._pre = document.createElement('pre'); this._pre.className = 'ce-pre';
        this._code = document.createElement('code'); this._code.className = 'ce-code';
        this._pre.appendChild(this._code);

        this._ta = document.createElement('textarea'); this._ta.className = 'ce-ta';
        this._ta.spellcheck = false;
        this._ta.setAttribute('autocomplete', 'off');
        this._ta.setAttribute('autocapitalize', 'off');
        this._ta.setAttribute('autocorrect', 'off');
        this._ta.setAttribute('wrap', 'off');
        // Silence the "form field element should have an id or name attribute"
        // browser accessibility warning. Use the host id as a meaningful name
        // when available; otherwise a stable per-instance unique name.
        this._ta.setAttribute('name', this.id ? this.id + '-textarea' : 'arianna-code-editor-' + Math.random().toString(36).slice(2, 10));
        if (this._readonly) this._ta.readOnly = true;

        stage.appendChild(this._pre);
        stage.appendChild(this._ta);
        this._wrap.appendChild(stage);

        // ── Mount internals into the correct render target ────────────────
        //
        // CodeEditor builds its internals as raw DOM (textarea + pre + gutter),
        // so it needs a real Node with appendChild to mount into. Under the
        // open-default shadow model (COMPONENTS.md §0.6 / SHADOW.md §0), the
        // render root behind `this.Shadow.Root` can be one of:
        //   • a native ShadowRoot  → has appendChild (mount directly)
        //   • an AriannaShadow LIGHT backend  → NO appendChild; its `.Host` is
        //     the real element whose light DOM holds the content → mount there
        //   • an AriannaShadow IFRAME backend → mount into its document.body
        //   • nothing (shadow:false)          → mount into the host (this)
        //
        // We resolve a concrete appendable Node here. We deliberately do NOT
        // call appendChild on the AriannaShadow object (it is not a Node).
        const mountTarget = this._resolveMountTarget();
        mountTarget.appendChild(this._wrap);

        // ── Initial paint ────────────────────────────────────────────────
        this._ta.value = this.value.get();
        this._render();

        // ── Wire events ──────────────────────────────────────────────────
        this._ta.addEventListener('input',    () => this._onInput());
        this._ta.addEventListener('scroll',   () => this._syncScroll());
        this._ta.addEventListener('keydown',  (e) => this._onKey(e));

        if (this._autoFocus) setTimeout(() => this._ta.focus(), 0);
    }

    // ─── Public API ──────────────────────────────────────────────────────

    get Value(): string { return this.value.get(); }
    set Value(v: string)
    {
        this.value.set(v);
        if (this._ta && this._ta.value !== v) this._ta.value = v;
        this._render();
    }

    get Language(): CodeEditorLanguage { return this.language.get(); }
    set Language(l: CodeEditorLanguage) { this.language.set(l); this._render(); }

    override focus(): void { this._ta?.focus(); }
    override blur():  void { this._ta?.blur(); }

    // ─── Internals ───────────────────────────────────────────────────────

    /**
     * Resolve a concrete, appendable DOM Node for mounting raw internals,
     * working across every shadow backend (COMPONENTS.md §0.6.2):
     *   • native ShadowRoot         → the root itself (has appendChild)
     *   • AriannaShadow light       → its `.Host` element (light DOM)
     *   • AriannaShadow iframe      → the iframe's document.body
     *   • no shadow (shadow:false)  → the host element (`this`)
     * Never calls appendChild on a non-Node AriannaShadow object.
     */
    private _resolveMountTarget(): Element | ShadowRoot | DocumentFragment
    {
        const root = (this as unknown as {
            Shadow?: { Root?: unknown };
        }).Shadow?.Root as unknown;

        // No shadow at all → mount into the host element directly.
        if (!root) return this as unknown as Element;

        // Native ShadowRoot (open or closed): it is a real Node.
        if (typeof (root as { appendChild?: unknown }).appendChild === 'function'
            && !(root as { IsAriannaShadow?: boolean }).IsAriannaShadow) {
            return root as ShadowRoot;
        }

        // AriannaShadow (light or iframe backend).
        const ar = root as {
            IsAriannaShadow?: boolean;
            Backend?: 'light' | 'iframe';
            Host?: Element;
            document?: Document | null;
            iframe?: HTMLIFrameElement | null;
        };
        if (ar.IsAriannaShadow) {
            if (ar.Backend === 'iframe') {
                const doc = ar.document ?? (ar.iframe ? ar.iframe.contentDocument : null);
                if (doc && doc.body) return doc.body as unknown as Element;
                // iframe not ready → fall back to host so build() still completes.
                return (ar.Host ?? (this as unknown as Element));
            }
            // light backend → mount into the host's light DOM.
            return ar.Host ?? (this as unknown as Element);
        }

        // Unknown shape that happens to be appendable → use it; else host.
        if (typeof (root as { appendChild?: unknown }).appendChild === 'function') {
            return root as ShadowRoot;
        }
        return this as unknown as Element;
    }

    private _onInput(): void
    {
        const v = this._ta.value;
        this.value.set(v);
        this._render();
        this.fire('change', { detail: { value: v, source: this } });
    }

    private _render(): void
    {
        const src    = this._ta?.value ?? this.value.get();
        const tokens = tokenize(src, this.language.get());

        // Build highlighted HTML
        let html = '';
        for (const t of tokens)
        {
            if (t.kind === 'newline') { html += '\n'; continue; }
            if (t.kind === 'space')   { html += t.text; continue; }
            html += `<span class="tk-${t.kind}">${esc(t.text)}</span>`;
        }
        // Trailing newline ensures pre's last line is laid out fully
        if (!src.endsWith('\n')) html += '\n';
        this._code.innerHTML = html;

        // Gutter
        if (this._showLn)
        {
            const lines = src.split('\n').length;
            let g = '';
            for (let i = 1; i <= lines; i++) g += i + '\n';
            this._gutter.textContent = g;
        }
    }

    private _syncScroll(): void
    {
        this._pre.scrollLeft = this._ta.scrollLeft;
        this._pre.scrollTop  = this._ta.scrollTop;
        if (this._showLn) this._gutter.scrollTop = this._ta.scrollTop;
    }

    private _onKey(e: KeyboardEvent): void
    {
        if (this._readonly) return;
        const ta  = this._ta;
        const mod = (e.ctrlKey || e.metaKey);

        // Tab / Shift-Tab
        if (e.key === 'Tab')
        {
            e.preventDefault();
            if (e.shiftKey) this._indentSel(-1);
            else            this._indentSel(+1);
            return;
        }

        // Ctrl/Cmd + D — duplicate line(s)
        if (mod && (e.key === 'd' || e.key === 'D'))
        {
            e.preventDefault();
            this._duplicateLines();
            return;
        }

        // Ctrl/Cmd + / — toggle line comment
        if (mod && e.key === '/')
        {
            e.preventDefault();
            this._toggleComment();
            return;
        }

        // Ctrl/Cmd + ] / [ — indent / dedent (with no selection too)
        if (mod && (e.key === ']' || e.key === '['))
        {
            e.preventDefault();
            this._indentSel(e.key === ']' ? +1 : -1);
            return;
        }

        // Alt + ArrowUp / ArrowDown — move line up/down
        if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))
        {
            e.preventDefault();
            this._moveLines(e.key === 'ArrowUp' ? -1 : +1);
            return;
        }

        // Auto-bracket insertion
        const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
        if (pairs[e.key] !== undefined && ta.selectionStart === ta.selectionEnd)
        {
            // Don't auto-pair when next char is a word char (typing 'a("foo")' shouldn't expand)
            const after = ta.value[ta.selectionStart] ?? '';
            if (!/\w/.test(after))
            {
                e.preventDefault();
                this._insert(e.key + pairs[e.key]);
                const s = ta.selectionStart;
                ta.setSelectionRange(s - 1, s - 1);
                this._render();
                return;
            }
        }

        // Smart Enter — keep indentation of previous line
        if (e.key === 'Enter')
        {
            e.preventDefault();
            const ps    = ta.selectionStart;
            const pre   = ta.value.slice(0, ps);
            const lstart= pre.lastIndexOf('\n') + 1;
            const line  = pre.slice(lstart);
            const m     = /^[\t ]*/.exec(line);
            const indent= m ? m[0] : '';
            const prev  = ta.value[ps - 1];
            const next  = ta.value[ps] ?? '';
            const extra = (prev === '{' || prev === '[' || prev === '(') ? this._oneIndent() : '';
            // If we're sitting between {} put the closing brace on its own line
            if (extra && next && (
                (prev === '{' && next === '}') ||
                (prev === '[' && next === ']') ||
                (prev === '(' && next === ')')
            ))
            {
                this._insert('\n' + indent + extra + '\n' + indent);
                const s = ta.selectionStart - (1 + indent.length);
                ta.setSelectionRange(s, s);
            }
            else
            {
                this._insert('\n' + indent + extra);
            }
            this._render();
            return;
        }
    }

    /** Insert text replacing the current selection. */
    private _insert(text: string): void
    {
        const ta = this._ta;
        const s  = ta.selectionStart, e = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
        ta.setSelectionRange(s + text.length, s + text.length);
        this.value.set(ta.value);
        this.fire('change', { detail: { value: ta.value, source: this } });
    }

    private _oneIndent(): string
    {
        return this._useTabs ? '\t' : ' '.repeat(this._indent);
    }

    /** Indent (sign=+1) or dedent (-1) the currently selected lines. */
    private _indentSel(sign: 1 | -1): void
    {
        const ta = this._ta;
        const v  = ta.value;
        let s = ta.selectionStart, e = ta.selectionEnd;

        // Single-line, no-selection indent: insert directly at caret
        if (s === e && sign === +1)
        {
            const ind = this._oneIndent();
            ta.value = v.slice(0, s) + ind + v.slice(s);
            ta.setSelectionRange(s + ind.length, s + ind.length);
            this.value.set(ta.value);
            this._render();
            return;
        }

        // Expand selection to full lines
        let ls = v.lastIndexOf('\n', s - 1) + 1;
        let le = v.indexOf('\n', e); if (le === -1) le = v.length;
        const before = v.slice(0, ls);
        const sel    = v.slice(ls, le);
        const after  = v.slice(le);

        const ind   = this._oneIndent();
        let mutated = '';
        let delta0  = 0, deltaN = 0;
        const lines = sel.split('\n');
        for (let i = 0; i < lines.length; i++)
        {
            let line = lines[i];
            if (sign === +1) { line = ind + line; if (i === 0) delta0 += ind.length; deltaN += ind.length; }
            else
            {
                if (line.startsWith(ind))      { line = line.slice(ind.length); if (i === 0) delta0 -= ind.length; deltaN -= ind.length; }
                else if (line.startsWith('\t')) { line = line.slice(1);          if (i === 0) delta0 -= 1;          deltaN -= 1; }
                else if (line.startsWith(' '))  {
                    let k = 0; while (k < this._indent && line[k] === ' ') k++;
                    line = line.slice(k); if (i === 0) delta0 -= k; deltaN -= k;
                }
            }
            mutated += (i === 0 ? '' : '\n') + line;
        }
        ta.value = before + mutated + after;
        ta.setSelectionRange(s + delta0, e + deltaN);
        this.value.set(ta.value);
        this._render();
    }

    /** Duplicate selected lines (or the caret line) below. */
    private _duplicateLines(): void
    {
        const ta = this._ta;
        const v  = ta.value;
        const s = ta.selectionStart, e = ta.selectionEnd;
        let ls = v.lastIndexOf('\n', s - 1) + 1;
        let le = v.indexOf('\n', e); if (le === -1) le = v.length;
        const block = v.slice(ls, le);
        ta.value = v.slice(0, le) + '\n' + block + v.slice(le);
        const off = 1 + block.length;
        ta.setSelectionRange(s + off, e + off);
        this.value.set(ta.value);
        this._render();
    }

    /** Toggle "// " comment on each selected line for JS-likes; "<!-- -->" for HTML; "/* *\/" for CSS. */
    private _toggleComment(): void
    {
        const lang = this.language.get();
        let prefix = '// ';
        if (lang === 'css')                                 prefix = '/* CSS_CMT */';   // unused; CSS uses block below
        if (lang === 'html')                                prefix = '<!-- HTML_CMT -->'; // unused
        // For HTML/CSS, fall back to JS-style on JSON/plain
        if (lang === 'json' || lang === 'plain') prefix = '// ';

        if (lang === 'html')      { this._toggleBlockComment('<!-- ', ' -->'); return; }
        if (lang === 'css')       { this._toggleBlockComment('/* ',   ' */');  return; }

        const ta = this._ta;
        const v  = ta.value;
        let s = ta.selectionStart, e = ta.selectionEnd;
        let ls = v.lastIndexOf('\n', s - 1) + 1;
        let le = v.indexOf('\n', e); if (le === -1) le = v.length;
        const lines = v.slice(ls, le).split('\n');

        // If ALL non-empty lines start with prefix → remove; else add
        const allCommented = lines.every(l => l.trim().length === 0 || l.trimStart().startsWith(prefix.trimEnd()));
        const newLines = lines.map(line => {
            if (allCommented)
            {
                // Strip leading "// " (or "//") plus its leading whitespace preserved
                const idx = line.indexOf(prefix.trimEnd());
                if (idx === -1) return line;
                return line.slice(0, idx) + line.slice(idx + (line.slice(idx, idx + prefix.length) === prefix ? prefix.length : prefix.trimEnd().length));
            }
            else
            {
                if (line.trim().length === 0) return line;
                const m = /^(\s*)(.*)$/.exec(line)!;
                return m[1] + prefix + m[2];
            }
        });
        ta.value = v.slice(0, ls) + newLines.join('\n') + v.slice(le);
        this.value.set(ta.value);
        this._render();
    }

    private _toggleBlockComment(open: string, close: string): void
    {
        const ta = this._ta;
        const v  = ta.value;
        let s = ta.selectionStart, e = ta.selectionEnd;
        if (s === e) {
            // Comment current line
            const ls = v.lastIndexOf('\n', s - 1) + 1;
            let le = v.indexOf('\n', e); if (le === -1) le = v.length;
            s = ls; e = le;
        }
        const block = v.slice(s, e);
        let mutated: string;
        if (block.trimStart().startsWith(open) && block.trimEnd().endsWith(close))
        {
            // Strip
            const i0 = block.indexOf(open);
            const i1 = block.lastIndexOf(close);
            mutated = block.slice(0, i0) + block.slice(i0 + open.length, i1) + block.slice(i1 + close.length);
        }
        else
        {
            mutated = open + block + close;
        }
        ta.value = v.slice(0, s) + mutated + v.slice(e);
        ta.setSelectionRange(s, s + mutated.length);
        this.value.set(ta.value);
        this._render();
    }

    /** Move selected lines (or the caret line) up/down by `dir`. */
    private _moveLines(dir: -1 | 1): void
    {
        const ta = this._ta;
        const v  = ta.value;
        let s = ta.selectionStart, e = ta.selectionEnd;
        let ls = v.lastIndexOf('\n', s - 1) + 1;
        let le = v.indexOf('\n', e); if (le === -1) le = v.length;

        if (dir === -1)
        {
            if (ls === 0) return;
            const prevStart = v.lastIndexOf('\n', ls - 2) + 1;
            const prevLine  = v.slice(prevStart, ls - 1);
            const block     = v.slice(ls, le);
            ta.value = v.slice(0, prevStart) + block + '\n' + prevLine + v.slice(le);
            const shift = -(prevLine.length + 1);
            ta.setSelectionRange(s + shift, e + shift);
        }
        else
        {
            if (le === v.length) return;
            const nextEnd = v.indexOf('\n', le + 1);
            const nextLineEnd = nextEnd === -1 ? v.length : nextEnd;
            const nextLine = v.slice(le + 1, nextLineEnd);
            const block    = v.slice(ls, le);
            ta.value = v.slice(0, ls) + nextLine + '\n' + block + v.slice(nextLineEnd);
            const shift = nextLine.length + 1;
            ta.setSelectionRange(s + shift, e + shift);
        }
        this.value.set(ta.value);
        this._render();
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────

    onCreated?(): void { this.build(); }
}

// ── Registration ─────────────────────────────────────────────────────────
// Component(tag, base, …) registers the tag with descriptor.Class = null.
// The user subclass (CodeEditor) is normally captured on the first
// `new CodeEditor()` via new.target through super(). But CodeEditor extends
// HTMLElement and is NOT registered via native customElements, so `new
// CodeEditor()` throws "Illegal constructor" — the lazy capture never runs and
// descriptor.Class stays null, which made markup-upgrade pick the wrong class
// (e.g. ArrayModifierElement). We therefore bind the subclass to its tag
// EXPLICITLY and safely, without `new`:
Component.Define('arianna-code-editor', CodeEditor);

export default CodeEditor;
