/**
 * @module    components/composite/CodeEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * CodeEditor v2 — pure-AriannA code editor widget, drop-in compatible with
 * CodeMirror 5's surface API.
 *
 *   ┌─────┬──────────────────────────────────────────────┐
 *   │  1  │ const greeting = "Hello, AriannA!";          │
 *   │  2  │                                              │
 *   │  3  │ function greet(name: string) {               │
 *   │  4  │     console.log(`${greeting} — ${name}`);    │  ◀─ active line
 *   │  5  │ }                                            │
 *   └─────┴──────────────────────────────────────────────┘
 *                                                      Ln 4, Col 24
 *
 * ── ARCHITECTURE ──────────────────────────────────────────────────────────
 *
 *   • Transparent <textarea> on top of a highlighted <pre><code> overlay.
 *     Browser-native selection / cursor / undo-redo / IME.
 *   • Per-line cache + diff reconciliation → incremental render. Only the
 *     lines whose source changed are re-tokenized and DOM-patched. File
 *     sizes of 5,000+ lines stay smooth.
 *   • Bracket matcher tracks caret and highlights the paired bracket via a
 *     positioned <span> overlay (no inline DOM mutations under selection).
 *   • Find dialog: bottom strip with input + buttons, native-feeling.
 *
 * ── CODEMIRROR DROP-IN ────────────────────────────────────────────────────
 *
 *   const ed = CodeEditor.fromTextArea(textareaEl, {
 *       mode             : { name: 'jsx', base: { name: 'javascript', typescript: true } },
 *       theme            : 'material-darker',
 *       lineNumbers      : true,
 *       indentUnit       : 4,
 *       tabSize           : 4,
 *       matchBrackets    : true,
 *       autoCloseBrackets: true,
 *       lineWrapping     : false,
 *       extraKeys        : {
 *           'Ctrl-Enter': () => run(),
 *           'Cmd-Enter' : () => run(),
 *           'Ctrl-/'    : 'toggleComment',
 *       },
 *   });
 *
 *   ed.getValue();              ed.setValue(src);
 *   ed.getOption('lineNumbers');ed.setOption('mode', 'css');
 *   ed.refresh();               ed.setSize(width, height);
 *   ed.getCursor();             ed.setCursor({ line: 0, ch: 0 });
 *   ed.focus();                 ed.blur();
 *   ed.on('change', e => ...);  ed.on('cursorActivity', e => ...);
 *
 * ── KEYBOARD SHORTCUTS (built-in) ─────────────────────────────────────────
 *
 *   Tab               indent selection (or insert spaces at caret)
 *   Shift+Tab         dedent
 *   Ctrl/Cmd+D        duplicate current line / selection
 *   Ctrl/Cmd+/        toggle line comment (lang-aware)
 *   Ctrl/Cmd+]/[      indent / dedent selection
 *   Alt+ArrowUp/Down  move line(s) up/down
 *   Ctrl/Cmd+F        find dialog (Find/Next/Prev, Esc closes)
 *   Ctrl/Cmd+H        find & replace
 *   Ctrl/Cmd+Enter    user-defined (via extraKeys)
 *   Enter             smart auto-indent with brace-pairing
 *   Auto-bracket      ( [ { ' " ` insert pair, skip-over closes
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';

// ─────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────

export type CodeEditorLanguage =
    | 'js' | 'ts' | 'jsx' | 'tsx'
    | 'html' | 'css' | 'json' | 'plain';

export type CodeEditorTheme = 'material-darker' | 'one-dark' | 'light';

/** CodeMirror-compatible "mode" descriptor accepted by `fromTextArea` / `mode`. */
export type CodeEditorMode =
    | string
    | { name: string; base?: { name?: string; typescript?: boolean } };

export interface CodeEditorOptions {
    value?            : string;
    language?         : CodeEditorLanguage;
    mode?             : CodeEditorMode;
    theme?            : CodeEditorTheme;
    indent?           : number;
    indentUnit?       : number;
    useTabs?          : boolean;
    indentWithTabs?   : boolean;
    readonly?         : boolean;
    lineNumbers?      : boolean;
    tabSize?          : number;
    height?           : string;
    autoFocus?        : boolean;
    matchBrackets?    : boolean;
    autoCloseBrackets?: boolean;
    lineWrapping?     : boolean;
    smartIndent?      : boolean;
    extraKeys?        : Record<string, (() => void) | string>;
}

interface Token { kind: string; text: string; }

interface Cursor { line: number; ch: number; }

/* ─────────────────────────────────────────────────────────────────────────
   Tokenizers — regex bank per language. Per-line tokenization.
   ───────────────────────────────────────────────────────────────────── */

interface TokRule { kind: string; re: RegExp; }

const RULES_JS: TokRule[] = [
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
];

const RULES_TS  = RULES_JS;
const RULES_JSX = RULES_JS;
const RULES_TSX = RULES_JS;

const RULES_CSS: TokRule[] = [
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
];

const RULES_HTML: TokRule[] = [
    { kind: 'comment',  re: /^<!--[\s\S]*?-->/ },
    { kind: 'doctype',  re: /^<!DOCTYPE[^>]*>/i },
    { kind: 'tag',      re: /^<\/?[A-Za-z][\w-]*/ },
    { kind: 'punct',    re: /^\/?>/ },
    { kind: 'attr',     re: /^[A-Za-z_:][\w:.-]*(?=\s*=)/ },
    { kind: 'string',   re: /^"(?:\\.|[^"\\])*"/ },
    { kind: 'string',   re: /^'(?:\\.|[^'\\])*'/ },
    { kind: 'punct',    re: /^=/ },
    { kind: 'space',    re: /^[ \t]+/ },
];

const RULES_JSON: TokRule[] = [
    { kind: 'string',   re: /^"(?:\\.|[^"\\])*"/ },
    { kind: 'number',   re: /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
    { kind: 'keyword',  re: /^\b(?:true|false|null)\b/ },
    { kind: 'punct',    re: /^[\[\]{}:,]/ },
    { kind: 'space',    re: /^[ \t]+/ },
];

function rulesFor(lang: CodeEditorLanguage): TokRule[] {
    switch (lang) {
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

function tokenizeLine(line: string, lang: CodeEditorLanguage): Token[] {
    const rules = rulesFor(lang);
    if (rules.length === 0) return [{ kind: 'plain', text: line }];

    const out: Token[] = [];
    let i = 0;
    while (i < line.length) {
        const slice = line.slice(i);
        let matched: Token | null = null;
        for (const r of rules) {
            const m = r.re.exec(slice);
            if (m && m.index === 0) {
                matched = { kind: r.kind, text: m[0] };
                break;
            }
        }
        if (!matched) {
            const ch = line[i];
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

/* ─────────────────────────────────────────────────────────────────────────
   Mode → language mapper (CodeMirror compatibility)
   ───────────────────────────────────────────────────────────────────── */

function modeToLanguage(mode: CodeEditorMode | undefined): CodeEditorLanguage | null {
    if (!mode) return null;
    if (typeof mode === 'string') {
        switch (mode) {
            case 'jsx':        return 'jsx';
            case 'tsx':        return 'tsx';
            case 'javascript': return 'js';
            case 'typescript': return 'ts';
            case 'htmlmixed':
            case 'html':       return 'html';
            case 'css':        return 'css';
            case 'json':       return 'json';
            default:           return 'plain';
        }
    }
    const ts = !!mode.base?.typescript;
    switch (mode.name) {
        case 'jsx':        return ts ? 'tsx' : 'jsx';
        case 'tsx':        return 'tsx';
        case 'javascript': return ts ? 'ts' : 'js';
        case 'typescript': return 'ts';
        case 'htmlmixed':
        case 'html':       return 'html';
        case 'css':        return 'css';
        case 'json':       return 'json';
        default:           return 'plain';
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   Theme palettes
   ───────────────────────────────────────────────────────────────────── */

interface ThemePalette {
    background    : string;
    foreground    : string;
    gutter        : string;
    gutterFg      : string;
    selection     : string;
    bracketMatch  : string;
    findMatch     : string;
    findCurrent   : string;
    tkComment     : string;
    tkString      : string;
    tkNumber      : string;
    tkRegex       : string;
    tkKeyword     : string;
    tkBuiltin     : string;
    tkFunction    : string;
    tkIdent       : string;
    tkPunct       : string;
    tkTag         : string;
    tkAttr        : string;
    tkProperty    : string;
    tkSelector    : string;
    tkAtrule      : string;
    tkDoctype     : string;
}

const THEMES: Record<CodeEditorTheme, ThemePalette> = {
    'material-darker': {
        background    : '#212121',
        foreground    : '#eeffff',
        gutter        : '#212121',
        gutterFg      : '#545454',
        selection     : 'rgba(97,97,97,0.5)',
        bracketMatch  : 'rgba(255,202,40,0.35)',
        findMatch     : 'rgba(255,202,40,0.25)',
        findCurrent   : 'rgba(228,12,136,0.45)',
        tkComment     : '#545454',
        tkString      : '#c3e88d',
        tkNumber      : '#f78c6c',
        tkRegex       : '#89ddff',
        tkKeyword     : '#c792ea',
        tkBuiltin     : '#ffcb6b',
        tkFunction    : '#82aaff',
        tkIdent       : '#eeffff',
        tkPunct       : '#89ddff',
        tkTag         : '#f07178',
        tkAttr        : '#c792ea',
        tkProperty    : '#82aaff',
        tkSelector    : '#f07178',
        tkAtrule      : '#c792ea',
        tkDoctype     : '#545454',
    },
    'one-dark': {
        background    : '#0e0e10',
        foreground    : '#e6e8eb',
        gutter        : '#0a0a0c',
        gutterFg      : '#5a6068',
        selection     : 'rgba(228,12,136,0.32)',
        bracketMatch  : 'rgba(97,175,239,0.40)',
        findMatch     : 'rgba(229,192,123,0.25)',
        findCurrent   : 'rgba(228,12,136,0.45)',
        tkComment     : '#7a818a',
        tkString      : '#98c379',
        tkNumber      : '#d19a66',
        tkRegex       : '#56b6c2',
        tkKeyword     : '#c678dd',
        tkBuiltin     : '#e5c07b',
        tkFunction    : '#61afef',
        tkIdent       : '#e6e8eb',
        tkPunct       : '#abb2bf',
        tkTag         : '#e06c75',
        tkAttr        : '#d19a66',
        tkProperty    : '#61afef',
        tkSelector    : '#e06c75',
        tkAtrule      : '#c678dd',
        tkDoctype     : '#7a818a',
    },
    'light': {
        background    : '#ffffff',
        foreground    : '#24292e',
        gutter        : '#f6f8fa',
        gutterFg      : '#959da5',
        selection     : 'rgba(228,12,136,0.18)',
        bracketMatch  : 'rgba(228,12,136,0.25)',
        findMatch     : 'rgba(255,202,40,0.30)',
        findCurrent   : 'rgba(228,12,136,0.45)',
        tkComment     : '#6a737d',
        tkString      : '#032f62',
        tkNumber      : '#005cc5',
        tkRegex       : '#032f62',
        tkKeyword     : '#d73a49',
        tkBuiltin     : '#e36209',
        tkFunction    : '#6f42c1',
        tkIdent       : '#24292e',
        tkPunct       : '#24292e',
        tkTag         : '#22863a',
        tkAttr        : '#6f42c1',
        tkProperty    : '#005cc5',
        tkSelector    : '#22863a',
        tkAtrule      : '#d73a49',
        tkDoctype     : '#6a737d',
    },
};

function esc(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/* ─────────────────────────────────────────────────────────────────────────
   CodeEditor — composite Component
   ───────────────────────────────────────────────────────────────────── */

export class CodeEditor extends Component('arianna-code-editor', HTMLElement, {}, {
    attrs : [
        // Content + language
        'value', 'language', 'mode', 'theme',
        // Indentation
        'indent', 'indent-unit', 'tab-size', 'use-tabs', 'indent-with-tabs',
        // Display
        'line-numbers', 'line-wrapping', 'height', 'placeholder', 'auto-focus',
        // Behavior
        'readonly', 'match-brackets', 'auto-close-brackets', 'smart-indent',
    ],
    shadow: false,
}) {
    declare value     : Signal<string>;
    declare language  : Signal<CodeEditorLanguage>;
    declare theme     : Signal<CodeEditorTheme>;

    declare _indent           : number;
    declare _useTabs          : boolean;
    declare _readonly         : boolean;
    declare _showLn           : boolean;
    declare _tabSize          : number;
    declare _height           : string | null;
    declare _autoFocus        : boolean;
    declare _matchBrackets    : boolean;
    declare _autoCloseBrackets: boolean;
    declare _lineWrapping     : boolean;
    declare _smartIndent      : boolean;
    declare _extraKeys        : Record<string, (() => void) | string>;

    declare _wrap     : HTMLDivElement;
    declare _gutter   : HTMLDivElement;
    declare _stage    : HTMLDivElement;
    declare _pre      : HTMLPreElement;
    declare _code     : HTMLElement;
    declare _ta       : HTMLTextAreaElement;
    declare _bracket  : HTMLDivElement;
    declare _findBar  : HTMLDivElement | null;
    declare _findInp  : HTMLInputElement | null;
    declare _findReplaceInp : HTMLInputElement | null;
    declare _statusbar: HTMLDivElement;

    declare _lineCache  : string[];
    declare _lineNodes  : HTMLDivElement[];

    declare _findMatches : Array<{ start: number; end: number }>;
    declare _findCursor  : number;

    declare _listeners: Record<string, Array<(e: unknown) => void>>;

    constructor(opts: CodeEditorOptions = {}) {
        super(opts as never);
        // Stash opts for build() — markup-upgrade path doesn't call constructor.
        // Framework also stashes constructor args under __buildArgs; we keep
        // a typed alias here so build() can reach them either way.
        (this as unknown as { __codeEditorOpts?: CodeEditorOptions }).__codeEditorOpts = opts;
    }

    /**
     * Initialize instance fields. Called by `build()` so it runs identically
     * for both construction paths: `new CodeEditor(opts)` (constructor → super
     * → eventually build) and markup `<arianna-code-editor>` (Namespace.Update
     * splices prototype → calls build() without ever invoking constructor).
     *
     * Idempotent — guarded by `__fieldsInitialized`. Safe to re-enter.
     */
    private _initFields(opts: CodeEditorOptions): void {
        const flag = this as unknown as { __fieldsInitialized?: boolean };
        if (flag.__fieldsInitialized) return;
        flag.__fieldsInitialized = true;

        // ── Pre-init: merge JS opts with HTML attributes ────────────────
        const attr = (k: string): string | null =>
            (this as unknown as HTMLElement).getAttribute(k);
        const boolAttr = (k: string, def: boolean): boolean => {
            const v = attr(k);
            if (v === null) return def;
            return v !== 'false' && v !== '0' && v !== 'no';
        };
        const numAttr = (k: string, def: number): number => {
            const v = attr(k);
            if (v === null) return def;
            const n = Number(v);
            return Number.isFinite(n) ? n : def;
        };

        const langAttr   = attr('language') ?? attr('mode');
        const lang       = opts.language ?? modeToLanguage(opts.mode) ?? (langAttr ? (modeToLanguage(langAttr) ?? 'ts') : 'ts');
        const themeAttr  = attr('theme') as CodeEditorTheme | null;
        const themeVal   = opts.theme ?? themeAttr ?? 'material-darker';
        const valueAttr  = attr('value');
        const initValue  = opts.value ?? valueAttr ?? '';

        this.value             = signal(initValue);
        this.language          = signal(lang);
        this.theme             = signal(themeVal);

        this._indent           = opts.indent      ?? opts.indentUnit ?? numAttr('indent', numAttr('indent-unit', 4));
        this._useTabs          = opts.useTabs     ?? opts.indentWithTabs ?? boolAttr('use-tabs', boolAttr('indent-with-tabs', false));
        this._readonly         = opts.readonly    ?? boolAttr('readonly', false);
        this._showLn           = opts.lineNumbers ?? boolAttr('line-numbers', true);
        this._tabSize          = opts.tabSize     ?? numAttr('tab-size', 4);
        this._height           = opts.height      ?? attr('height');
        this._autoFocus        = opts.autoFocus   ?? boolAttr('auto-focus', false);
        this._matchBrackets    = opts.matchBrackets    ?? boolAttr('match-brackets', true);
        this._autoCloseBrackets= opts.autoCloseBrackets?? boolAttr('auto-close-brackets', true);
        this._lineWrapping     = opts.lineWrapping ?? boolAttr('line-wrapping', false);
        this._smartIndent      = opts.smartIndent  ?? boolAttr('smart-indent', true);
        this._extraKeys        = opts.extraKeys ?? {};

        this._lineCache   = [];
        this._lineNodes   = [];
        this._findMatches = [];
        this._findCursor  = -1;
        this._listeners   = {};
        this._findBar     = null;
        this._findInp     = null;
        this._findReplaceInp = null;
    }

    build(): void {
        // ── Init fields first (markup-upgrade path doesn't run constructor) ──
        const stashedOpts = (this as unknown as { __codeEditorOpts?: CodeEditorOptions; __buildArgs?: unknown[] });
        const opts: CodeEditorOptions =
            stashedOpts.__codeEditorOpts ??
            ((stashedOpts.__buildArgs?.[0] as CodeEditorOptions | undefined) ?? {});
        this._initFields(opts);

        // ── Use child text as initial value if no `value` was supplied ──
        // <arianna-code-editor language="ts">const x = 1;</arianna-code-editor>
        // children are read AFTER constructor runs, so we look at textContent
        // here. We only treat children as value source when:
        //   - opts.value wasn't passed
        //   - the `value` attribute wasn't set
        //   - the element actually has text content (trimmed)
        if (this.value.get() === '' && this.textContent && this.textContent.trim()) {
            // Dedent: strip the common leading whitespace from every line so
            // indented HTML formatting doesn't pollute the editor source.
            const raw   = this.textContent.replace(/^\n/, '').replace(/\n[ \t]*$/, '');
            const lines = raw.split('\n');
            let minIndent = Infinity;
            for (const ln of lines) {
                if (!ln.trim()) continue;
                const m = /^[ \t]*/.exec(ln);
                if (m) minIndent = Math.min(minIndent, m[0].length);
            }
            if (!Number.isFinite(minIndent)) minIndent = 0;
            const dedented = lines.map(l => l.slice(minIndent)).join('\n');
            this.value.set(dedented);
        }

        // Empty the host so child text doesn't bleed through behind the overlay
        // (we'll re-fill with our DOM in _buildDOM)
        while (this.firstChild) this.removeChild(this.firstChild);

        this._applyTheme();
        this._buildDOM();
        this._renderAll();
        this._wireEvents();
        this._wireAttributeObservers();
        if (this._autoFocus) setTimeout(() => this._ta.focus(), 0);
    }

    /**
     * Observe attribute Signals so live changes from JS or browser DevTools
     * (e.g. setAttribute('theme', 'one-dark')) propagate to the editor.
     *
     * The component infrastructure already wires every entry of `attrs:[]`
     * to a Signal<string|null> via `attrSignal(name)`. We just subscribe
     * to those signals and translate the value into a setOption() call.
     */
    private _wireAttributeObservers(): void {
        const self = this;
        if (!self._attrUnsubs) self._attrUnsubs = [];

        const sub = (name: string, fn: (v: string | null) => void): void => {
            const accessor = (this as unknown as { attrSignal?: (n: string) => Signal<string | null> | undefined }).attrSignal;
            const sig = accessor ? accessor(name) : undefined;
            if (!sig) return;
            let first = true;
            // effect() runs immediately for current value, then re-runs on changes.
            // We skip the initial sync run (we already used those values in the
            // constructor) and only react to subsequent updates.
            const stop = effect(() => {
                const v = sig.get();
                if (first) { first = false; return; }
                fn(v);
            });
            self._attrUnsubs.push(stop);
        };

        sub('value',             (v) => { if (v !== null && v !== self.value.get()) self.setValue(v); });
        sub('language',          (v) => { if (v) self.setOption('language', v); });
        sub('mode',              (v) => { if (v) self.setOption('mode', v); });
        sub('theme',             (v) => { if (v) self.setOption('theme', v); });
        sub('indent',            (v) => { const n = Number(v); if (Number.isFinite(n)) self.setOption('indent', n); });
        sub('indent-unit',       (v) => { const n = Number(v); if (Number.isFinite(n)) self.setOption('indentUnit', n); });
        sub('tab-size',          (v) => { const n = Number(v); if (Number.isFinite(n)) self.setOption('tabSize', n); });
        sub('use-tabs',          (v) => self.setOption('useTabs',           v !== null && v !== 'false'));
        sub('indent-with-tabs',  (v) => self.setOption('indentWithTabs',    v !== null && v !== 'false'));
        sub('line-numbers',      (v) => self.setOption('lineNumbers',       v === null ? true : v !== 'false'));
        sub('line-wrapping',     (v) => self.setOption('lineWrapping',      v !== null && v !== 'false'));
        sub('height',            (v) => { self._height = v; self._applyTheme(); });
        sub('readonly',          (v) => self.setOption('readonly',          v !== null && v !== 'false'));
        sub('match-brackets',    (v) => self.setOption('matchBrackets',     v === null ? true : v !== 'false'));
        sub('auto-close-brackets',(v) => self.setOption('autoCloseBrackets',v === null ? true : v !== 'false'));
        sub('smart-indent',      (v) => self.setOption('smartIndent',       v === null ? true : v !== 'false'));
    }

    /** Unsubscribers for attribute signal effects — invoked on disconnect. */
    declare _attrUnsubs: Array<() => void>;

    onCreated?(): void {
        this.build();
    }

    private _applyTheme(): void {
        const p = THEMES[this.theme.get()];
        this.Sheet = new Sheet(
            new Rule(':root', {
                display      : 'block',
                position     : 'relative',
                background   : p.background,
                color        : p.foreground,
                borderRadius : '4px',
                fontFamily   : "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
                fontSize     : '13px',
                lineHeight   : '1.55',
                overflow     : 'hidden',
                boxSizing    : 'border-box',
                height       : this._height ?? 'auto',
            }),
            new Rule(':root .CodeMirror', {
                position     : 'relative',
                display      : 'flex',
                width        : '100%',
                height       : '100%',
                minHeight    : this._height ? '0' : '120px',
                overflow     : 'hidden',
                background   : p.background,
                color        : p.foreground,
                fontFamily   : 'inherit',
                fontSize     : 'inherit',
                lineHeight   : 'inherit',
            }),
            new Rule(':root .CodeMirror-gutters', {
                flex         : '0 0 auto',
                width        : '48px',
                background   : p.gutter,
                borderRight  : '1px solid rgba(255,255,255,0.05)',
                userSelect   : 'none',
                color        : p.gutterFg,
                whiteSpace   : 'pre',
                fontFamily   : 'inherit',
                fontSize     : 'inherit',
                lineHeight   : 'inherit',
                overflow     : 'hidden',
            }),
            new Rule(':root .CodeMirror-linenumber', {
                padding      : '0 6px 0 12px',
                textAlign    : 'right',
                color        : p.gutterFg,
                display      : 'block',
            }),
            new Rule(':root .ce-stage', {
                flex         : '1 1 0',
                position     : 'relative',
                overflow     : 'auto',
                minWidth     : '0',
                background   : p.background,
            }),
            new Rule(':root .ce-pre', {
                margin       : '0',
                padding      : '0 12px',
                whiteSpace   : this._lineWrapping ? 'pre-wrap' : 'pre',
                wordWrap     : this._lineWrapping ? 'break-word' : 'normal',
                overflowWrap : this._lineWrapping ? 'break-word' : 'normal',
                fontFamily   : 'inherit',
                fontSize     : 'inherit',
                lineHeight   : 'inherit',
                tabSize      : String(this._tabSize),
                pointerEvents: 'none',
                color        : p.foreground,
                background   : 'transparent',
                minHeight    : '100%',
                boxSizing    : 'border-box',
            }),
            new Rule(':root .ce-line', {
                display      : 'block',
                minHeight    : '1.55em',
            }),
            new Rule(':root .ce-ta', {
                position     : 'absolute',
                top          : '0', left: '0', right: '0', bottom: '0',
                width        : '100%', height: '100%',
                margin       : '0',
                padding      : '0 12px',
                border       : '0',
                outline      : 'none',
                resize       : 'none',
                background   : 'transparent',
                color        : 'transparent',
                caretColor   : p.foreground,
                fontFamily   : 'inherit',
                fontSize     : 'inherit',
                lineHeight   : 'inherit',
                tabSize      : String(this._tabSize),
                whiteSpace   : this._lineWrapping ? 'pre-wrap' : 'pre',
                wordWrap     : this._lineWrapping ? 'break-word' : 'normal',
                overflowWrap : this._lineWrapping ? 'break-word' : 'normal',
                overflow     : 'hidden',
                boxSizing    : 'border-box',
            }),
            new Rule(':root .ce-ta::selection',     { background: p.selection }),
            // Note: ::-moz-selection used to live here for legacy Firefox, but
            // Chrome rejects the Mozilla-specific pseudo as a SyntaxError,
            // which then cascaded into IndexSizeError for every following rule
            // because the rule index ran ahead of cssRules.length. Modern
            // Firefox (62+) supports plain ::selection, so the alias isn't needed.
            new Rule(':root .ce-bracket', {
                position     : 'absolute',
                pointerEvents: 'none',
                background   : p.bracketMatch,
                borderRadius : '2px',
            }),
            new Rule(':root .ce-find-bar', {
                position     : 'absolute',
                bottom       : '0', left: '0', right: '0',
                display      : 'flex',
                alignItems   : 'center',
                gap          : '6px',
                padding      : '6px 10px',
                background   : p.gutter,
                borderTop    : '1px solid rgba(255,255,255,0.08)',
                fontFamily   : 'inherit',
                fontSize     : '11px',
                color        : p.foreground,
                zIndex       : '10',
            }),
            new Rule(':root .ce-find-bar input', {
                background   : 'rgba(255,255,255,0.05)',
                border       : '1px solid rgba(255,255,255,0.1)',
                borderRadius : '3px',
                color        : p.foreground,
                font         : 'inherit',
                outline      : 'none',
                padding      : '3px 8px',
            }),
            new Rule(':root .ce-find-bar button', {
                background   : 'rgba(255,255,255,0.08)',
                border       : '1px solid rgba(255,255,255,0.12)',
                borderRadius : '3px',
                color        : p.foreground,
                cursor       : 'pointer',
                font         : 'inherit',
                padding      : '3px 8px',
            }),
            new Rule(':root .ce-find-bar button:hover', {
                background   : 'rgba(255,255,255,0.16)',
            }),
            new Rule(':root .ce-find-bar .count', {
                color        : p.gutterFg,
                fontSize     : '10px',
                marginLeft   : '4px',
            }),
            new Rule(':root .ce-statusbar', {
                position     : 'absolute',
                right        : '8px',
                bottom       : '4px',
                color        : p.gutterFg,
                fontFamily   : 'inherit',
                fontSize     : '10px',
                opacity      : '0.7',
                pointerEvents: 'none',
            }),
            new Rule(':root .tk-comment',  { color: p.tkComment, fontStyle: 'italic' }),
            new Rule(':root .tk-string',   { color: p.tkString }),
            new Rule(':root .tk-number',   { color: p.tkNumber }),
            new Rule(':root .tk-regex',    { color: p.tkRegex }),
            new Rule(':root .tk-keyword',  { color: p.tkKeyword, fontWeight: '600' }),
            new Rule(':root .tk-builtin',  { color: p.tkBuiltin }),
            new Rule(':root .tk-function', { color: p.tkFunction }),
            new Rule(':root .tk-ident',    { color: p.tkIdent }),
            new Rule(':root .tk-punct',    { color: p.tkPunct }),
            new Rule(':root .tk-tag',      { color: p.tkTag }),
            new Rule(':root .tk-attr',     { color: p.tkAttr }),
            new Rule(':root .tk-property', { color: p.tkProperty }),
            new Rule(':root .tk-selector', { color: p.tkSelector }),
            new Rule(':root .tk-atrule',   { color: p.tkAtrule }),
            new Rule(':root .tk-doctype',  { color: p.tkDoctype }),
            new Rule(':root .tk-unknown',  { color: p.foreground }),
            new Rule(':root .tk-space',    { color: 'inherit' }),
            new Rule(':root .ce-find-mark',         { background: p.findMatch }),
            new Rule(':root .ce-find-mark.current', { background: p.findCurrent }),
        );
    }

    private _buildDOM(): void {
        this._wrap = document.createElement('div'); this._wrap.className = 'CodeMirror';

        this._gutter = document.createElement('div'); this._gutter.className = 'CodeMirror-gutters';
        if (this._showLn) this._wrap.appendChild(this._gutter);

        this._stage = document.createElement('div'); this._stage.className = 'ce-stage';

        this._pre  = document.createElement('pre'); this._pre.className = 'ce-pre';
        this._code = document.createElement('code'); this._code.className = 'ce-code';
        this._pre.appendChild(this._code);

        this._bracket = document.createElement('div'); this._bracket.className = 'ce-bracket';
        this._bracket.style.display = 'none';

        this._ta = document.createElement('textarea'); this._ta.className = 'ce-ta';
        this._ta.spellcheck = false;
        this._ta.setAttribute('autocomplete', 'off');
        this._ta.setAttribute('autocapitalize', 'off');
        this._ta.setAttribute('autocorrect', 'off');
        this._ta.setAttribute('wrap', this._lineWrapping ? 'soft' : 'off');
        if (this._readonly) this._ta.readOnly = true;
        this._ta.value = this.value.get();

        this._statusbar = document.createElement('div'); this._statusbar.className = 'ce-statusbar';

        this._stage.appendChild(this._pre);
        this._stage.appendChild(this._bracket);
        this._stage.appendChild(this._ta);
        this._stage.appendChild(this._statusbar);
        this._wrap.appendChild(this._stage);
        this.appendChild(this._wrap);
    }

    private _wireEvents(): void {
        this._ta.addEventListener('input',           () => this._onInput());
        this._ta.addEventListener('scroll',          () => this._syncScroll());
        this._ta.addEventListener('keydown',         (e) => this._onKey(e));
        this._ta.addEventListener('click',           () => this._onCursorActivity());
        this._ta.addEventListener('keyup',           () => this._onCursorActivity());
        this._ta.addEventListener('select',          () => this._onCursorActivity());
    }

    // ────────────────────────────────────────────────────────────────────
    //  Public API
    // ────────────────────────────────────────────────────────────────────

    get Value(): string { return this.value.get(); }
    set Value(v: string) {
        this.value.set(v);
        if (this._ta && this._ta.value !== v) this._ta.value = v;
        this._renderAll();
    }

    getValue(): string { return this.Value; }
    setValue(v: string): void { this.Value = v; }

    get Language(): CodeEditorLanguage { return this.language.get(); }
    set Language(l: CodeEditorLanguage) { this.language.set(l); this._renderAll(); }

    getOption(key: string): unknown {
        switch (key) {
            case 'value':              return this.Value;
            case 'mode':
            case 'language':           return this.language.get();
            case 'theme':              return this.theme.get();
            case 'lineNumbers':        return this._showLn;
            case 'indentUnit':
            case 'indent':             return this._indent;
            case 'tabSize':            return this._tabSize;
            case 'indentWithTabs':
            case 'useTabs':            return this._useTabs;
            case 'readOnly':
            case 'readonly':           return this._readonly;
            case 'matchBrackets':      return this._matchBrackets;
            case 'autoCloseBrackets':  return this._autoCloseBrackets;
            case 'lineWrapping':       return this._lineWrapping;
            case 'smartIndent':        return this._smartIndent;
        }
        return undefined;
    }

    setOption(key: string, val: unknown): void {
        switch (key) {
            case 'value':              this.Value = String(val); return;
            case 'mode': {
                const lang = modeToLanguage(val as CodeEditorMode);
                if (lang) { this.language.set(lang); this._renderAll(); }
                return;
            }
            case 'language':           this.language.set(val as CodeEditorLanguage); this._renderAll(); return;
            case 'theme':              this.theme.set(val as CodeEditorTheme); this._applyTheme(); return;
            case 'lineNumbers':
                this._showLn = !!val;
                if (this._showLn && !this._wrap.contains(this._gutter)) this._wrap.insertBefore(this._gutter, this._stage);
                else if (!this._showLn && this._wrap.contains(this._gutter)) this._gutter.remove();
                this._renderAll(); return;
            case 'indentUnit':
            case 'indent':             this._indent = Number(val); return;
            case 'tabSize':            this._tabSize = Number(val); this._applyTheme(); return;
            case 'indentWithTabs':
            case 'useTabs':            this._useTabs = !!val; return;
            case 'readOnly':
            case 'readonly':           this._readonly = !!val; this._ta.readOnly = !!val; return;
            case 'matchBrackets':      this._matchBrackets = !!val; if (!val) this._bracket.style.display = 'none'; return;
            case 'autoCloseBrackets':  this._autoCloseBrackets = !!val; return;
            case 'lineWrapping':       this._lineWrapping = !!val; this._applyTheme(); this._ta.setAttribute('wrap', this._lineWrapping ? 'soft' : 'off'); return;
            case 'smartIndent':        this._smartIndent = !!val; return;
            case 'extraKeys':          this._extraKeys = (val as Record<string, (() => void) | string>) ?? {}; return;
        }
    }

    refresh(): void {
        this._renderAll();
        this._syncScroll();
    }

    setSize(width: number | string | null, height: number | string | null): void {
        const w = width  == null ? null : (typeof width  === 'number' ? width  + 'px' : width);
        const h = height == null ? null : (typeof height === 'number' ? height + 'px' : height);
        if (w !== null) (this as unknown as HTMLElement).style.width  = w;
        if (h !== null) (this as unknown as HTMLElement).style.height = h;
    }

    getCursor(): Cursor {
        return this._cursorFromOffset(this._ta.selectionStart);
    }

    setCursor(pos: Cursor | number): void {
        const off = typeof pos === 'number' ? pos : this._offsetFromCursor(pos);
        this._ta.setSelectionRange(off, off);
        this._ta.focus();
        this._onCursorActivity();
    }

    getSelection(): string {
        const s = this._ta.selectionStart, e = this._ta.selectionEnd;
        return this._ta.value.slice(s, e);
    }

    override focus(): void { this._ta?.focus(); }
    override blur():  void { this._ta?.blur(); }

    on(name: string, fn: (e: unknown) => void): void {
        (this._listeners[name] ??= []).push(fn);
    }
    off(name: string, fn: (e: unknown) => void): void {
        const arr = this._listeners[name];
        if (!arr) return;
        const i = arr.indexOf(fn); if (i >= 0) arr.splice(i, 1);
    }
    private _emit(name: string, ev: unknown): void {
        for (const fn of (this._listeners[name] ?? [])) {
            try { fn(ev); } catch (_) { /* swallow */ }
        }
    }

    // ────────────────────────────────────────────────────────────────────
    //  Static factory — CodeMirror.fromTextArea drop-in
    // ────────────────────────────────────────────────────────────────────

    static fromTextArea(el: HTMLTextAreaElement, opts: CodeEditorOptions = {}): CodeEditor {
        const value = el.value;
        const ed = new CodeEditor({ ...opts, value });
        el.style.display = 'none';
        el.parentNode?.insertBefore(ed, el.nextSibling);
        ed.on('change', (e) => { el.value = (e as { value: string }).value; });
        return ed;
    }

    // ────────────────────────────────────────────────────────────────────
    //  Input handling
    // ────────────────────────────────────────────────────────────────────

    private _onInput(): void {
        const newSrc = this._ta.value;
        const oldSrc = this.value.get();
        this.value.set(newSrc);
        this._renderIncremental(oldSrc, newSrc);
        this._onCursorActivity();
        const ev = { value: newSrc, source: this };
        this._emit('change', ev);
        this.fire('change', { detail: ev });
    }

    private _onCursorActivity(): void {
        if (this._matchBrackets) this._updateBracketMatch();
        this._updateStatusbar();
        this._emit('cursorActivity', { source: this });
    }

    private _updateStatusbar(): void {
        const c = this._cursorFromOffset(this._ta.selectionStart);
        this._statusbar.textContent = `Ln ${c.line + 1}, Col ${c.ch + 1}`;
    }

    // ────────────────────────────────────────────────────────────────────
    //  Render: full + incremental + scroll-sync
    // ────────────────────────────────────────────────────────────────────

    private _renderAll(): void {
        const src = this._ta?.value ?? this.value.get();
        const lines = src.split('\n');

        this._lineCache = lines.slice();
        this._lineNodes = [];
        this._code.textContent = '';

        for (let i = 0; i < lines.length; i++) {
            const div = this._renderLineNode(lines[i]);
            this._code.appendChild(div);
            this._lineNodes.push(div);
        }

        if (this._showLn) this._renderGutter(lines.length);
    }

    private _renderIncremental(oldSrc: string, newSrc: string): void {
        const newLines = newSrc.split('\n');

        if (newLines.length === this._lineCache.length) {
            for (let i = 0; i < newLines.length; i++) {
                if (newLines[i] !== this._lineCache[i]) {
                    const fresh = this._renderLineNode(newLines[i]);
                    this._lineNodes[i].replaceWith(fresh);
                    this._lineNodes[i] = fresh;
                    this._lineCache[i] = newLines[i];
                }
            }
            return;
        }

        let pre = 0;
        const minLen = Math.min(newLines.length, this._lineCache.length);
        while (pre < minLen && newLines[pre] === this._lineCache[pre]) pre++;

        let suf = 0;
        while (
            suf < minLen - pre &&
            newLines[newLines.length - 1 - suf] === this._lineCache[this._lineCache.length - 1 - suf]
        ) suf++;

        const removeFrom = pre;
        const removeTo   = this._lineCache.length - suf;
        for (let i = removeFrom; i < removeTo; i++) {
            this._lineNodes[i].remove();
        }

        const insertNodes: HTMLDivElement[] = [];
        for (let i = removeFrom; i < newLines.length - suf; i++) {
            insertNodes.push(this._renderLineNode(newLines[i]));
        }

        const refNode = this._lineNodes[removeTo] ?? null;
        for (const n of insertNodes) {
            this._code.insertBefore(n, refNode);
        }

        this._lineNodes.splice(removeFrom, removeTo - removeFrom, ...insertNodes);
        this._lineCache = newLines.slice();

        if (this._showLn) this._renderGutter(newLines.length);
    }

    private _renderLineNode(src: string): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'ce-line';
        const tokens = tokenizeLine(src, this.language.get());
        if (src.length === 0) {
            div.innerHTML = '<span class="tk-space"> </span>';
            return div;
        }
        let html = '';
        for (const t of tokens) {
            html += t.kind === 'space'
                ? esc(t.text)
                : `<span class="tk-${t.kind}">${esc(t.text)}</span>`;
        }
        div.innerHTML = html;
        return div;
    }

    private _renderGutter(lineCount: number): void {
        const have = this._gutter.children.length;
        if (have === lineCount) return;
        if (have < lineCount) {
            const frag = document.createDocumentFragment();
            for (let i = have; i < lineCount; i++) {
                const s = document.createElement('div');
                s.className = 'CodeMirror-linenumber';
                s.textContent = String(i + 1);
                frag.appendChild(s);
            }
            this._gutter.appendChild(frag);
        } else {
            while (this._gutter.children.length > lineCount) this._gutter.lastChild?.remove();
        }
    }

    private _syncScroll(): void {
        this._pre.scrollLeft = this._ta.scrollLeft;
        this._pre.scrollTop  = this._ta.scrollTop;
        if (this._showLn) this._gutter.scrollTop = this._ta.scrollTop;
    }

    // ────────────────────────────────────────────────────────────────────
    //  Cursor offset helpers
    // ────────────────────────────────────────────────────────────────────

    private _cursorFromOffset(off: number): Cursor {
        const before = this._ta.value.slice(0, off);
        const lines = before.split('\n');
        return { line: lines.length - 1, ch: lines[lines.length - 1].length };
    }

    private _offsetFromCursor(c: Cursor): number {
        const lines = this._ta.value.split('\n');
        let off = 0;
        for (let i = 0; i < c.line && i < lines.length; i++) off += lines[i].length + 1;
        off += Math.min(c.ch, lines[c.line]?.length ?? 0);
        return off;
    }

    // ────────────────────────────────────────────────────────────────────
    //  Bracket matching
    // ────────────────────────────────────────────────────────────────────

    private _updateBracketMatch(): void {
        if (!this._matchBrackets) { this._bracket.style.display = 'none'; return; }
        const ta = this._ta;
        if (ta.selectionStart !== ta.selectionEnd) {
            this._bracket.style.display = 'none';
            return;
        }
        const v = ta.value;
        const pos = ta.selectionStart;
        const candidates = [
            { off: pos,     ch: v[pos] },
            { off: pos - 1, ch: v[pos - 1] },
        ];
        for (const c of candidates) {
            if (c.off < 0) continue;
            const match = this._findMatchingBracket(v, c.off, c.ch);
            if (match >= 0) {
                this._positionBracketOverlay(c.off, match);
                return;
            }
        }
        this._bracket.style.display = 'none';
    }

    private _findMatchingBracket(src: string, pos: number, ch: string): number {
        const PAIRS: Record<string, string> = {
            '(': ')', '[': ']', '{': '}',
            ')': '(', ']': '[', '}': '{',
        };
        const m = PAIRS[ch];
        if (!m) return -1;
        const forward = '([{'.includes(ch);
        let depth = 1;
        if (forward) {
            for (let i = pos + 1; i < src.length; i++) {
                if (src[i] === ch) depth++;
                else if (src[i] === m) { depth--; if (depth === 0) return i; }
            }
        } else {
            for (let i = pos - 1; i >= 0; i--) {
                if (src[i] === ch) depth++;
                else if (src[i] === m) { depth--; if (depth === 0) return i; }
            }
        }
        return -1;
    }

    private _positionBracketOverlay(a: number, b: number): void {
        const ca = this._caretCoords(a);
        const cb = this._caretCoords(b);
        if (!ca || !cb) { this._bracket.style.display = 'none'; return; }
        this._bracket.style.display = 'block';
        this._bracket.style.left   = ca.left + 'px';
        this._bracket.style.top    = ca.top  + 'px';
        this._bracket.style.width  = '0.6em';
        this._bracket.style.height = '1.5em';
        const dx = cb.left - ca.left;
        const dy = cb.top  - ca.top;
        const p  = THEMES[this.theme.get()].bracketMatch;
        this._bracket.style.boxShadow = `${dx}px ${dy}px 0 0 ${p}`;
        this._bracket.style.background = p;
    }

    private _caretCoords(offset: number): { left: number; top: number } | null {
        const mirror = document.createElement('div');
        const cs = getComputedStyle(this._ta);
        const props: string[] = [
            'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
            'letterSpacing', 'tabSize', 'whiteSpace', 'wordWrap', 'overflowWrap',
            'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
            'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
            'boxSizing',
        ];
        const csRec = cs as unknown as Record<string, string>;
        const mRec  = mirror.style as unknown as Record<string, string>;
        for (const p of props) {
            const v = csRec[p];
            if (typeof v === 'string') mRec[p] = v;
        }
        mirror.style.position    = 'absolute';
        mirror.style.visibility  = 'hidden';
        mirror.style.top         = '-9999px';
        mirror.style.left        = '-9999px';
        mirror.style.width       = this._ta.clientWidth + 'px';
        mirror.style.whiteSpace  = this._lineWrapping ? 'pre-wrap' : 'pre';

        const before = this._ta.value.slice(0, offset);
        mirror.textContent = before;
        const marker = document.createElement('span');
        marker.textContent = '\u200b';
        mirror.appendChild(marker);
        document.body.appendChild(mirror);

        const mRect = mirror.getBoundingClientRect();
        const sRect = marker.getBoundingClientRect();
        const sx = sRect.left - mRect.left;
        const sy = sRect.top  - mRect.top;

        document.body.removeChild(mirror);

        return {
            left: sx - this._ta.scrollLeft + parseFloat(cs.paddingLeft || '0'),
            top:  sy - this._ta.scrollTop  + parseFloat(cs.paddingTop  || '0'),
        };
    }

    // ────────────────────────────────────────────────────────────────────
    //  Find / Replace
    // ────────────────────────────────────────────────────────────────────

    openFind(initial?: string): void {
        if (!this._findBar) this._buildFindBar();
        if (this._findBar) this._findBar.style.display = 'flex';
        if (this._findInp) {
            if (initial !== undefined) this._findInp.value = initial;
            this._findInp.focus();
            this._findInp.select();
            this._runFind(this._findInp.value);
        }
    }

    closeFind(): void {
        if (this._findBar) this._findBar.style.display = 'none';
        this._findMatches = [];
        this._findCursor  = -1;
        this._ta.focus();
    }

    private _buildFindBar(): void {
        const bar = document.createElement('div'); bar.className = 'ce-find-bar';

        const findInp = document.createElement('input');
        findInp.type        = 'text';
        findInp.placeholder = 'Find';
        findInp.style.width = '160px';
        bar.appendChild(findInp);

        const count = document.createElement('span'); count.className = 'count';
        bar.appendChild(count);

        const btnPrev = document.createElement('button'); btnPrev.textContent = '◀';
        const btnNext = document.createElement('button'); btnNext.textContent = '▶';
        bar.appendChild(btnPrev);
        bar.appendChild(btnNext);

        const replaceInp = document.createElement('input');
        replaceInp.type        = 'text';
        replaceInp.placeholder = 'Replace';
        replaceInp.style.width = '160px';
        replaceInp.style.marginLeft = '12px';
        bar.appendChild(replaceInp);

        const btnReplace    = document.createElement('button'); btnReplace.textContent    = 'Replace';
        const btnReplaceAll = document.createElement('button'); btnReplaceAll.textContent = 'All';
        bar.appendChild(btnReplace);
        bar.appendChild(btnReplaceAll);

        const btnClose = document.createElement('button'); btnClose.textContent = '✕';
        btnClose.style.marginLeft = 'auto';
        bar.appendChild(btnClose);

        this._stage.appendChild(bar);
        this._findBar        = bar;
        this._findInp        = findInp;
        this._findReplaceInp = replaceInp;

        const updateCount = () => {
            if (this._findMatches.length === 0) count.textContent = 'no match';
            else count.textContent = `${this._findCursor + 1} / ${this._findMatches.length}`;
        };

        findInp.addEventListener('input', () => { this._runFind(findInp.value); updateCount(); });
        findInp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this._findNext(e.shiftKey ? -1 : 1); updateCount(); }
            else if (e.key === 'Escape') { e.preventDefault(); this.closeFind(); }
        });
        btnNext.addEventListener('click', () => { this._findNext(1);  updateCount(); });
        btnPrev.addEventListener('click', () => { this._findNext(-1); updateCount(); });
        btnReplace.addEventListener('click',    () => { this._replaceOne(replaceInp.value); updateCount(); });
        btnReplaceAll.addEventListener('click', () => { this._replaceAll(replaceInp.value); updateCount(); });
        btnClose.addEventListener('click', () => this.closeFind());
    }

    private _runFind(needle: string): void {
        this._findMatches = [];
        this._findCursor  = -1;
        if (!needle) return;
        const v = this._ta.value;
        let i = 0;
        while (i < v.length) {
            const at = v.indexOf(needle, i);
            if (at < 0) break;
            this._findMatches.push({ start: at, end: at + needle.length });
            i = at + Math.max(1, needle.length);
        }
        if (this._findMatches.length > 0) {
            this._findCursor = 0;
            this._scrollToMatch(this._findMatches[0]);
        }
    }

    private _findNext(dir: 1 | -1): void {
        if (this._findMatches.length === 0) return;
        this._findCursor = (this._findCursor + dir + this._findMatches.length) % this._findMatches.length;
        this._scrollToMatch(this._findMatches[this._findCursor]);
    }

    private _scrollToMatch(m: { start: number; end: number }): void {
        this._ta.focus();
        this._ta.setSelectionRange(m.start, m.end);
        const c = this._cursorFromOffset(m.start);
        const lh = parseFloat(getComputedStyle(this._ta).lineHeight || '20') || 20;
        const target = c.line * lh;
        if (target < this._ta.scrollTop || target > this._ta.scrollTop + this._ta.clientHeight - lh * 2) {
            this._ta.scrollTop = Math.max(0, target - this._ta.clientHeight / 2);
        }
        this._syncScroll();
    }

    private _replaceOne(replacement: string): void {
        if (this._findCursor < 0) return;
        const m = this._findMatches[this._findCursor];
        const v = this._ta.value;
        const before = v.slice(0, m.start);
        const after  = v.slice(m.end);
        this._ta.value = before + replacement + after;
        this._ta.setSelectionRange(m.start + replacement.length, m.start + replacement.length);
        this.value.set(this._ta.value);
        this._renderAll();
        this._emit('change', { value: this._ta.value, source: this });
        if (this._findInp) this._runFind(this._findInp.value);
    }

    private _replaceAll(replacement: string): void {
        if (this._findMatches.length === 0 || !this._findInp) return;
        const needle = this._findInp.value;
        if (!needle) return;
        this._ta.value = this._ta.value.split(needle).join(replacement);
        this.value.set(this._ta.value);
        this._renderAll();
        this._emit('change', { value: this._ta.value, source: this });
        this._runFind(needle);
    }

    // ────────────────────────────────────────────────────────────────────
    //  Keyboard handling
    // ────────────────────────────────────────────────────────────────────

    private _onKey(e: KeyboardEvent): void {
        const mod = (e.ctrlKey || e.metaKey);

        // extraKeys
        const keyName = this._keyEventToName(e);
        const handler = this._extraKeys[keyName];
        if (handler) {
            e.preventDefault();
            if (typeof handler === 'function') handler();
            else if (handler === 'toggleComment') this._toggleComment();
            return;
        }

        if (this._readonly) return;

        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) this._indentSel(-1);
            else            this._indentSel(+1);
            return;
        }

        if (mod && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); this._duplicateLines(); return; }
        if (mod && e.key === '/') { e.preventDefault(); this._toggleComment(); return; }
        if (mod && (e.key === ']' || e.key === '[')) { e.preventDefault(); this._indentSel(e.key === ']' ? +1 : -1); return; }
        if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); this._moveLines(e.key === 'ArrowUp' ? -1 : +1); return; }
        if (mod && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); this.openFind(this.getSelection()); return; }
        if (mod && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); this.openFind(this.getSelection()); return; }
        if (e.key === 'Escape' && this._findBar?.style.display === 'flex') { e.preventDefault(); this.closeFind(); return; }

        if (this._autoCloseBrackets) {
            const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
            const ta = this._ta;
            if (pairs[e.key] !== undefined && ta.selectionStart === ta.selectionEnd) {
                const after = ta.value[ta.selectionStart] ?? '';
                if (!/\w/.test(after)) {
                    e.preventDefault();
                    this._insert(e.key + pairs[e.key]);
                    const s = ta.selectionStart;
                    ta.setSelectionRange(s - 1, s - 1);
                    this._onInput();
                    return;
                }
            }
            if (')]}\"\'`'.includes(e.key) && ta.value[ta.selectionStart] === e.key) {
                e.preventDefault();
                const s = ta.selectionStart;
                ta.setSelectionRange(s + 1, s + 1);
                this._onCursorActivity();
                return;
            }
        }

        if (this._smartIndent && e.key === 'Enter') {
            e.preventDefault();
            const ta    = this._ta;
            const ps    = ta.selectionStart;
            const pre   = ta.value.slice(0, ps);
            const lstart= pre.lastIndexOf('\n') + 1;
            const line  = pre.slice(lstart);
            const m     = /^[\t ]*/.exec(line);
            const indent= m ? m[0] : '';
            const prev  = ta.value[ps - 1];
            const next  = ta.value[ps] ?? '';
            const extra = (prev === '{' || prev === '[' || prev === '(') ? this._oneIndent() : '';
            if (extra && next && (
                (prev === '{' && next === '}') ||
                (prev === '[' && next === ']') ||
                (prev === '(' && next === ')')
            )) {
                this._insert('\n' + indent + extra + '\n' + indent);
                const s = ta.selectionStart - (1 + indent.length);
                ta.setSelectionRange(s, s);
            } else {
                this._insert('\n' + indent + extra);
            }
            this._onInput();
            return;
        }
    }

    private _keyEventToName(e: KeyboardEvent): string {
        const parts: string[] = [];
        if (e.ctrlKey)  parts.push('Ctrl');
        if (e.metaKey)  parts.push('Cmd');
        if (e.altKey)   parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        parts.push(key);
        return parts.join('-');
    }

    private _insert(text: string): void {
        const ta = this._ta;
        const s  = ta.selectionStart, e = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
        ta.setSelectionRange(s + text.length, s + text.length);
        this.value.set(ta.value);
    }

    private _oneIndent(): string {
        return this._useTabs ? '\t' : ' '.repeat(this._indent);
    }

    private _indentSel(sign: 1 | -1): void {
        const ta = this._ta;
        const v  = ta.value;
        const s = ta.selectionStart, e = ta.selectionEnd;

        if (s === e && sign === +1) {
            const ind = this._oneIndent();
            ta.value = v.slice(0, s) + ind + v.slice(s);
            ta.setSelectionRange(s + ind.length, s + ind.length);
            this.value.set(ta.value);
            this._renderIncremental(v, ta.value);
            return;
        }

        const ls = v.lastIndexOf('\n', s - 1) + 1;
        let   le = v.indexOf('\n', e); if (le === -1) le = v.length;
        const before = v.slice(0, ls);
        const sel    = v.slice(ls, le);
        const after  = v.slice(le);

        const ind = this._oneIndent();
        let mutated = '';
        let delta0 = 0, deltaN = 0;
        const lines = sel.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (sign === +1) { line = ind + line; if (i === 0) delta0 += ind.length; deltaN += ind.length; }
            else {
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
        this._renderIncremental(v, ta.value);
    }

    private _duplicateLines(): void {
        const ta = this._ta;
        const v  = ta.value;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        let   le = v.indexOf('\n', e); if (le === -1) le = v.length;
        const block = v.slice(ls, le);
        ta.value = v.slice(0, le) + '\n' + block + v.slice(le);
        const off = 1 + block.length;
        ta.setSelectionRange(s + off, e + off);
        this.value.set(ta.value);
        this._renderIncremental(v, ta.value);
    }

    private _toggleComment(): void {
        const lang = this.language.get();
        if (lang === 'html') { this._toggleBlockComment('<!-- ', ' -->'); return; }
        if (lang === 'css')  { this._toggleBlockComment('/* ',   ' */'); return; }
        const prefix = '// ';
        const ta = this._ta;
        const v  = ta.value;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        let   le = v.indexOf('\n', e); if (le === -1) le = v.length;
        const lines = v.slice(ls, le).split('\n');
        const allCommented = lines.every(l => l.trim().length === 0 || l.trimStart().startsWith(prefix.trimEnd()));
        const newLines = lines.map(line => {
            if (allCommented) {
                const idx = line.indexOf(prefix.trimEnd());
                if (idx === -1) return line;
                return line.slice(0, idx) + line.slice(idx + (line.slice(idx, idx + prefix.length) === prefix ? prefix.length : prefix.trimEnd().length));
            } else {
                if (line.trim().length === 0) return line;
                const m = /^(\s*)(.*)$/.exec(line)!;
                return m[1] + prefix + m[2];
            }
        });
        ta.value = v.slice(0, ls) + newLines.join('\n') + v.slice(le);
        this.value.set(ta.value);
        this._renderIncremental(v, ta.value);
    }

    private _toggleBlockComment(open: string, close: string): void {
        const ta = this._ta;
        const v  = ta.value;
        let s = ta.selectionStart, e = ta.selectionEnd;
        if (s === e) {
            const ls = v.lastIndexOf('\n', s - 1) + 1;
            let le = v.indexOf('\n', e); if (le === -1) le = v.length;
            s = ls; e = le;
        }
        const block = v.slice(s, e);
        let mutated: string;
        if (block.trimStart().startsWith(open) && block.trimEnd().endsWith(close)) {
            const i0 = block.indexOf(open);
            const i1 = block.lastIndexOf(close);
            mutated = block.slice(0, i0) + block.slice(i0 + open.length, i1) + block.slice(i1 + close.length);
        } else {
            mutated = open + block + close;
        }
        ta.value = v.slice(0, s) + mutated + v.slice(e);
        ta.setSelectionRange(s, s + mutated.length);
        this.value.set(ta.value);
        this._renderIncremental(v, ta.value);
    }

    private _moveLines(dir: -1 | 1): void {
        const ta = this._ta;
        const v  = ta.value;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        let   le = v.indexOf('\n', e); if (le === -1) le = v.length;

        if (dir === -1) {
            if (ls === 0) return;
            const prevStart = v.lastIndexOf('\n', ls - 2) + 1;
            const prevLine  = v.slice(prevStart, ls - 1);
            const block     = v.slice(ls, le);
            ta.value = v.slice(0, prevStart) + block + '\n' + prevLine + v.slice(le);
            const shift = -(prevLine.length + 1);
            ta.setSelectionRange(s + shift, e + shift);
        } else {
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
        this._renderIncremental(v, ta.value);
    }
}

export default CodeEditor;

// ─────────────────────────────────────────────────────────────────────────
//  Window exposure — mirrors the convention used by all 136 components in
//  the components bundle. Namespace.Update relies on this to repoint the
//  descriptor from the empty `Bound` (created by Component(tag, Base, ...))
//  to the actual user class, so markup-instantiated <arianna-code-editor>
//  gets the user methods (setOption, getValue, fromTextArea, ...).
//
//  Without this, the user class lives only as a named export and is
//  invisible to the Namespace.Update window-scan fallback.
// ─────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'CodeEditor', {
        value       : CodeEditor,
        writable    : false,
        enumerable  : false,
        configurable: false,
    });
}
