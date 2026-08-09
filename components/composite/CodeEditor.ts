/**
 * @module    components/composite/CodeEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA CodeEditor component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   CodeEditor
 *  @public
 *  @description Namespace containing CodeEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace CodeEditor
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Language
         *  @public
         *  @type        {'js' | 'ts' | 'jsx' | 'tsx' | 'html' | 'css' | 'json' | 'plain'}
         *  @description Type alias for Language.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Language = 'js' | 'ts' | 'jsx' | 'tsx' | 'html' | 'css' | 'json' | 'plain';
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
        export interface Options
        {
            /** @name        value
             *  @public
             *  @type        {string}
             *  @description Component member for value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?: string;

            /** @name        language
             *  @public
             *  @type        {Types.Language}
             *  @description Component member for language.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            language?: Types.Language;

            /** @name        indent
             *  @public
             *  @type        {number}
             *  @description Component member for indent.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            indent?: number;

            /** @name        useTabs
             *  @public
             *  @type        {boolean}
             *  @description Component member for use Tabs.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            useTabs?: boolean;

            /** @name        readonly
             *  @public
             *  @type        {boolean}
             *  @description Component member for readonly.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly?: boolean;

            /** @name        lineNumbers
             *  @public
             *  @type        {boolean}
             *  @description Component member for line Numbers.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lineNumbers?: boolean;

            /** @name        tabSize
             *  @public
             *  @type        {number}
             *  @description Component member for tab Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            tabSize?: number;

            /** @name        height
             *  @public
             *  @type        {string}
             *  @description Component member for height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            height?: string;

            /** @name        autoFocus
             *  @public
             *  @type        {boolean}
             *  @description Component member for auto Focus.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            autoFocus?: boolean;
        }
    }
    /* ─── CodeEditor — composite Component ───────────────────────────────────── */
    /** @class       CodeEditor
     *  @public
     *  @description AriannA CodeEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-code-editor', {}, {
        Attributes: ['language', 'indent', 'readonly', 'line-numbers', 'tab-size', 'height', 'auto-focus'],
        shadow: false
    })
    export class CodeEditor extends HTMLElement
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

        /** @name        #RulesJavaScript
         *  @public
         *  @readonly
         *  @static
         *  @type        {ReadonlyArray<{
            kind: string;
            re: RegExp;
        }>}
         *  @description Component member for Rules Java Script.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #RulesJavaScript: ReadonlyArray<{
            /** @name        kind
             *  @public
             *  @type        {string}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: string;

            /** @name        re
             *  @public
             *  @type        {RegExp}
             *  @description Component member for re.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            re: RegExp;
        }> = [
            { kind: 'comment', re: /^\/\*[\s\S]*?\*\// },
            { kind: 'comment', re: /^\/\/.*/ },
            { kind: 'string', re: /^`(?:\\.|[^`\\])*`/ },
            { kind: 'string', re: /^"(?:\\.|[^"\\\n])*"/ },
            { kind: 'string', re: /^'(?:\\.|[^'\\\n])*'/ },
            { kind: 'number', re: /^(?:0x[\da-fA-F_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)n?\b/ },
            { kind: 'regex', re: /^\/(?!\/)(?:\\.|\[[^\]]*\]|[^/\\\n])+\/[gimsuy]*/ },
            { kind: 'keyword', re: /^\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|private|protected|public|readonly|return|set|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield)\b/ },
            { kind: 'builtin', re: /^\b(?:console|window|document|Math|JSON|Object|Array|String|Number|Boolean|Promise|Map|Set|WeakMap|WeakSet|Symbol|Error|RegExp|Date|Proxy|Reflect|globalThis)\b/ },
            { kind: 'function', re: /^[A-Za-z_$][\w$]*(?=\s*\()/ },
            { kind: 'ident', re: /^[A-Za-z_$][\w$]*/ },
            { kind: 'punct', re: /^(?:=>|\.\.\.|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\+\+|--|\*\*|<<|>>|>>>|[+\-*/%&|^!=<>?:;,.()\[\]{}~@])/ },
            { kind: 'space', re: /^[ \t]+/ },
            { kind: 'newline', re: /^\n/ }
        ];

        /** @name        #RulesCss
         *  @public
         *  @readonly
         *  @static
         *  @type        {ReadonlyArray<{
            kind: string;
            re: RegExp;
        }>}
         *  @description Component member for Rules Css.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #RulesCss: ReadonlyArray<{
            /** @name        kind
             *  @public
             *  @type        {string}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: string;

            /** @name        re
             *  @public
             *  @type        {RegExp}
             *  @description Component member for re.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            re: RegExp;
        }> = [
            { kind: 'comment', re: /^\/\*[\s\S]*?\*\// },
            { kind: 'string', re: /^"(?:\\.|[^"\\\n])*"/ },
            { kind: 'string', re: /^'(?:\\.|[^'\\\n])*'/ },
            { kind: 'number', re: /^-?\d+(?:\.\d+)?(?:%|px|em|rem|vh|vw|vmin|vmax|deg|rad|turn|s|ms|fr|ch|ex|cm|mm|in|pt|pc)?\b/ },
            { kind: 'atrule', re: /^@[A-Za-z-]+/ },
            { kind: 'keyword', re: /^\b(?:important)\b/ },
            { kind: 'selector', re: /^[#.][A-Za-z_][\w-]*/ },
            { kind: 'property', re: /^[A-Za-z-]+(?=\s*:)/ },
            { kind: 'function', re: /^[A-Za-z-]+(?=\s*\()/ },
            { kind: 'ident', re: /^[A-Za-z_][\w-]*/ },
            { kind: 'punct', re: /^[:;,{}()\[\]>+~*]/ },
            { kind: 'space', re: /^[ \t]+/ },
            { kind: 'newline', re: /^\n/ }
        ];

        /** @name        #RulesHtml
         *  @public
         *  @readonly
         *  @static
         *  @type        {ReadonlyArray<{
            kind: string;
            re: RegExp;
        }>}
         *  @description Component member for Rules Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #RulesHtml: ReadonlyArray<{
            /** @name        kind
             *  @public
             *  @type        {string}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: string;

            /** @name        re
             *  @public
             *  @type        {RegExp}
             *  @description Component member for re.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            re: RegExp;
        }> = [
            { kind: 'comment', re: /^<!--[\s\S]*?-->/ },
            { kind: 'doctype', re: /^<!DOCTYPE[^>]*>/i },
            { kind: 'tag', re: /^<\/?[A-Za-z][\w-]*/ },
            { kind: 'punct', re: /^\/?>/ },
            { kind: 'attr', re: /^[A-Za-z_:][\w:.-]*(?=\s*=)/ },
            { kind: 'string', re: /^"(?:\\.|[^"\\])*"/ },
            { kind: 'string', re: /^'(?:\\.|[^'\\])*'/ },
            { kind: 'punct', re: /^=/ },
            { kind: 'space', re: /^[ \t\n]+/ }
        ];

        /** @name        #RulesJson
         *  @public
         *  @readonly
         *  @static
         *  @type        {ReadonlyArray<{
            kind: string;
            re: RegExp;
        }>}
         *  @description Component member for Rules Json.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #RulesJson: ReadonlyArray<{
            /** @name        kind
             *  @public
             *  @type        {string}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: string;

            /** @name        re
             *  @public
             *  @type        {RegExp}
             *  @description Component member for re.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            re: RegExp;
        }> = [
            { kind: 'string', re: /^"(?:\\.|[^"\\])*"/ },
            { kind: 'number', re: /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
            { kind: 'keyword', re: /^\b(?:true|false|null)\b/ },
            { kind: 'punct', re: /^[\[\]{}:,]/ },
            { kind: 'space', re: /^[ \t\n]+/ }
        ];

        /** @name        #RulesFor
         *  @public
         *  @static
         *  @type        {ReadonlyArray<
        {
            kind: string;
            re: RegExp;
        }>}
         *  @description Component member for Rules For.
         *  @param       {CodeEditor.Types.Language} language Parameter.
         *  @returns     {ReadonlyArray<
        {
            kind: string;
            re: RegExp;
        }>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #RulesFor(language: Types.Language): ReadonlyArray<
        {
            /** @name        kind
             *  @public
             *  @type        {string}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: string;

            /** @name        re
             *  @public
             *  @type        {RegExp}
             *  @description Component member for re.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            re: RegExp;
        }> {
            switch (language)
            {
                case 'js':
                case 'ts':
                case 'jsx':
                case 'tsx':
                    return CodeEditor.#RulesJavaScript;
                case 'html':
                    return CodeEditor.#RulesHtml;
                case 'css':
                    return CodeEditor.#RulesCss;
                case 'json':
                    return CodeEditor.#RulesJson;
                default:
                    return [];
            }
        }

        /** @name        #Tokenize
         *  @public
         *  @static
         *  @type        {Array<
        {
            kind: string;
            text: string;
        }>}
         *  @description Component member for Tokenize.
         *  @param       {string} source Parameter.
         *  @param       {CodeEditor.Types.Language} language Parameter.
         *  @returns     {Array<
        {
            kind: string;
            text: string;
        }>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Tokenize(source: string, language: Types.Language): Array<
        {
            /** @name        kind
             *  @public
             *  @type        {string}
             *  @description Component member for kind.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            kind: string;

            /** @name        text
             *  @public
             *  @type        {string}
             *  @description Component member for text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            text: string;
        }> {
            /** @name        rules
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned rules value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const rules = CodeEditor.#RulesFor(language);
            if (rules.length === 0)
            {
                return [
                    {
                        kind: 'plain',
                        text: source
                    }
                ];
            }

            /** @name        output
             *  @public
             *  @type        {Array<{
                kind: string;
                text: string;
            }>}
             *  @description Namespace-owned output value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const output: Array<{
                /** @name        kind
                 *  @public
                 *  @type        {string}
                 *  @description Component member for kind.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                kind: string;

                /** @name        text
                 *  @public
                 *  @type        {string}
                 *  @description Component member for text.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                text: string;
            }> = [];

            /** @name        index
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned index value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let index = 0;
            while (index < source.length)
            {
                /** @name        slice
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned slice value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const slice = source.slice(index);

                /** @name        matched
                 *  @public
                 *  @type        {{
                    kind: string;
                    text: string;
                } | null}
                 *  @description Namespace-owned matched value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let matched: {
                    /** @name        kind
                     *  @public
                     *  @type        {string}
                     *  @description Component member for kind.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    kind: string;

                    /** @name        text
                     *  @public
                     *  @type        {string}
                     *  @description Component member for text.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    text: string;
                } | null = null;
                for (const rule of rules)
                {
                    /** @name        match
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned match value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const match = rule.re.exec(slice);
                    if (match && match.index === 0)
                    {
                        matched =
                            {
                                kind: rule.kind,
                                text: match[0]
                            };
                        break;
                    }
                }
                if (!matched)
                {
                    /** @name        character
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned character value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const character = source[index];

                    /** @name        previous
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned previous value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const previous = output[output.length - 1];
                    if (previous?.kind === 'unknown')
                    {
                        previous.text +=
                            character;
                    }
                    else
                    {
                        output.push({
                            kind: 'unknown',
                            text: character
                        });
                    }
                    index++;
                    continue;
                }
                output.push(matched);
                index += matched.text.length;
            }
            return output;
        }

        /** @name        #Escape
         *  @public
         *  @static
         *  @type        {string}
         *  @description Component member for Escape.
         *  @param       {string} value Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Escape(value: string): string
        {
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        /** @name        value
         *  @public
         *  @type        {Reactivity.Signal<string>}
         *  @description Component member for value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare value: Reactivity.Signal<string>;

        /** @name        language
         *  @public
         *  @type        {Reactivity.Signal<CodeEditor.Types.Language>}
         *  @description Component member for language.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare language: Reactivity.Signal<Types.Language>;

        /** @name        _indent
         *  @public
         *  @type        {number}
         *  @description Component member for _indent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _indent: number;

        /** @name        _useTabs
         *  @public
         *  @type        {boolean}
         *  @description Component member for _use Tabs.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _useTabs: boolean;

        /** @name        _readonly
         *  @public
         *  @type        {boolean}
         *  @description Component member for _readonly.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _readonly: boolean;

        /** @name        _showLn
         *  @public
         *  @type        {boolean}
         *  @description Component member for _show Ln.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _showLn: boolean;

        /** @name        _tabSize
         *  @public
         *  @type        {number}
         *  @description Component member for _tab Size.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _tabSize: number;

        /** @name        _height
         *  @public
         *  @type        {string | null}
         *  @description Component member for _height.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _height: string | null;

        /** @name        _autoFocus
         *  @public
         *  @type        {boolean}
         *  @description Component member for _auto Focus.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _autoFocus: boolean;

        /** @name        _gutter
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for _gutter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _gutter: HTMLDivElement;

        /** @name        _gutterText
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for _gutter Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _gutterText: HTMLDivElement;

        /** @name        _ta
         *  @public
         *  @type        {HTMLTextAreaElement}
         *  @description Component member for _ta.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _ta: HTMLTextAreaElement;

        /** @name        _pre
         *  @public
         *  @type        {HTMLPreElement}
         *  @description Component member for _pre.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _pre: HTMLPreElement;

        /** @name        _code
         *  @public
         *  @type        {HTMLElement}
         *  @description Component member for _code.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _code: HTMLElement;

        /** @name        _wrap
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for _wrap.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _wrap: HTMLDivElement;

        /** @name        __fieldsInitialized
         *  @public
         *  @type        {boolean}
         *  @description Component member for __fields Initialized.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare __fieldsInitialized: boolean;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {CodeEditor.Interfaces.Options} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.Options = {})
        {
            super();
            this._initFields(opts);
            this._mountEditor();
        }

        /** Idempotent field initializer. Called from the constructor (programmatic) and
         *  from the mount phase after markup adoption.
         *  Reading attributes lets `<arianna-code-editor language="js">` self-configure. */
        _initFields(opts: Interfaces.Options = {}): void
        {
            if (this.__fieldsInitialized)
                return;
            this.__fieldsInitialized = true;

            /** @name        attrLang
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrLang value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrLang = this.getAttribute('language') as Types.Language | null;

            /** @name        attrIndent
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrIndent value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrIndent = this.getAttribute('indent');

            /** @name        attrTabSz
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrTabSz value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrTabSz = this.getAttribute('tab-size');

            /** @name        attrShowLn
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrShowLn value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrShowLn = this.getAttribute('line-numbers');

            /** @name        attrRO
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrRO value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrRO = this.getAttribute('readonly');

            /** @name        attrHeight
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrHeight value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrHeight = this.getAttribute('height');

            /** @name        attrAutoF
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned attrAutoF value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const attrAutoF = this.getAttribute('auto-focus');
            this.value = new Reactivity.Signal(opts.value ?? this.textContent ?? '');
            this.language = new Reactivity.Signal(opts.language ?? attrLang ?? 'ts');
            this._indent = opts.indent ?? (attrIndent ? parseInt(attrIndent, 10) : 4);
            this._useTabs = !!opts.useTabs;
            this._readonly = opts.readonly ?? (attrRO === 'true' || attrRO === '');
            this._showLn = opts.lineNumbers !== false && attrShowLn !== 'false';
            this._tabSize = opts.tabSize ?? (attrTabSz ? parseInt(attrTabSz, 10) : 4);
            this._height = opts.height ?? attrHeight ?? null;
            this._autoFocus = opts.autoFocus ?? (attrAutoF === 'true' || attrAutoF === '');
        }

        /** @name        _mountEditor
         *  @public
         *  @type        {void}
         *  @description Component member for _mount Editor.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        _mountEditor(): void
        {
            if (this._wrap && this.contains(this._wrap))
                return;
            this._initFields();

            /** @name        _rules
             *  @public
             *  @type        {Css.Rule[]}
             *  @description Namespace-owned _rules value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const _rules: Css.Rule[] = [
                new Css.Rule(':host', {
                    display: 'block',
                    position: 'relative',
                    background: '#0e0e10',
                    color: '#e6e8eb',
                    borderRadius: '8px',
                    border: '0',
                    outline: 'none',
                    fontFamily: "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                    fontSize: '13px',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    isolation: 'isolate',
                    boxSizing: 'border-box',
                }),
                new Css.Rule(':host:focus, :host *:focus', { outline: 'none' }),
                new Css.Rule(':host .ce-wrap', {
                    position: 'relative',
                    display: 'flex',
                    width: '100%',
                    height: this._height ?? '320px',
                    minHeight: '120px',
                    maxHeight: this._height ?? '70vh',
                    overflow: 'hidden',
                }),
                new Css.Rule(':host .ce-gutter', {
                    flex: '0 0 auto',
                    width: '48px',
                    padding: '10px 6px 10px 12px',
                    textAlign: 'right',
                    color: '#5a6068',
                    background: '#0a0a0c',
                    userSelect: 'none',
                    whiteSpace: 'pre',
                    borderRight: '1px solid #25272b',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    boxSizing: 'border-box',
                    height: '100%',
                    overflow: 'hidden',
                }),
                new Css.Rule(':host .ce-gutter-text', {
                    minHeight: '100%',
                    whiteSpace: 'pre',
                }),
                new Css.Rule(':host .ce-stage', {
                    flex: '1 1 0', position: 'relative', overflow: 'hidden',
                    minWidth: '0', minHeight: '0', border: '0', outline: 'none',
                }),
                new Css.Rule(':host .ce-pre', {
                    position: 'absolute', inset: '0',
                    margin: '0', padding: '10px 12px', whiteSpace: 'pre',
                    wordWrap: 'normal', overflowWrap: 'normal',
                    fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
                    letterSpacing: '0', tabSize: String(this._tabSize),
                    pointerEvents: 'none', userSelect: 'none', zIndex: '1', color: '#e6e8eb', background: 'transparent',
                    width: '100%', height: '100%', minWidth: '100%', minHeight: '100%',
                    overflow: 'hidden', boxSizing: 'border-box', border: '0', outline: 'none',
                }),
                new Css.Rule(':host .ce-code', {
                    fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
                    letterSpacing: '0', tabSize: String(this._tabSize),
                    whiteSpace: 'pre', background: 'transparent', color: 'inherit',
                }),
                new Css.Rule(':host .ce-code span', {
                    fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
                    letterSpacing: '0', fontVariantLigatures: 'none',
                }),
                new Css.Rule(':host .ce-ta', {
                    position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
                    width: '100%', height: '100%', margin: '0', padding: '10px 12px',
                    border: '0', outline: 'none', resize: 'none', background: 'transparent',
                    color: 'transparent', WebkitTextFillColor: 'transparent', caretColor: '#f4f4f5', cursor: 'text', userSelect: 'text', pointerEvents: 'auto', zIndex: '2',
                    fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
                    letterSpacing: '0', fontVariantLigatures: 'none', tabSize: String(this._tabSize),
                    whiteSpace: 'pre', wordWrap: 'normal', overflowWrap: 'normal',
                    overflow: 'auto', scrollbarGutter: 'stable', boxSizing: 'border-box',
                }),
                new Css.Rule(':host .ce-ta:focus', { outline: 'none', border: '0', boxShadow: 'none' }),
                new Css.Rule(':host .ce-ta::selection', {
                    background: 'rgba(228, 12, 136, 0.72)',
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    textShadow: 'none'
                }),
                new Css.Rule(':host .ce-ta::-webkit-scrollbar', { width: '12px', height: '12px' }),
                new Css.Rule(':host .ce-ta::-webkit-scrollbar-track', { background: '#0a0a0c' }),
                new Css.Rule(':host .ce-ta::-webkit-scrollbar-thumb', { background: '#343840', borderRadius: '8px', border: '3px solid #0a0a0c' }),
                new Css.Rule(':host .ce-ta::-webkit-scrollbar-corner', { background: '#0a0a0c' }),
                new Css.Rule(':host .tk-comment', { color: '#7a818a', fontStyle: 'italic' }),
                new Css.Rule(':host .tk-string', { color: '#98c379' }),
                new Css.Rule(':host .tk-number', { color: '#d19a66' }),
                new Css.Rule(':host .tk-regex', { color: '#56b6c2' }),
                new Css.Rule(':host .tk-keyword', { color: '#c678dd', fontWeight: '600' }),
                new Css.Rule(':host .tk-builtin', { color: '#e5c07b' }),
                new Css.Rule(':host .tk-function', { color: '#61afef' }),
                new Css.Rule(':host .tk-ident', { color: '#e6e8eb' }),
                new Css.Rule(':host .tk-punct', { color: '#abb2bf' }),
                new Css.Rule(':host .tk-tag', { color: '#e06c75' }),
                new Css.Rule(':host .tk-attr', { color: '#d19a66' }),
                new Css.Rule(':host .tk-property', { color: '#61afef' }),
                new Css.Rule(':host .tk-selector', { color: '#e06c75' }),
                new Css.Rule(':host .tk-atrule', { color: '#c678dd' }),
                new Css.Rule(':host .tk-doctype', { color: '#7a818a' }),
                new Css.Rule(':host .tk-unknown', { color: '#e6e8eb' }),
                new Css.Rule(':host .tk-space', { color: 'inherit' }),
                new Css.Rule(':host .tk-newline', { color: 'inherit' }),
            ];
            // Light-DOM scoping: `:host` → host tag (negative lookahead preserves `:host(...)`).
            /** @name        _host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned _host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const _host = this.localName || 'arianna-code-editor';

            /** @name        _css
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned _css value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const _css = _rules.map(r => r.Text).join('\n').replace(/:host(?![\w\-(])/g, _host);
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Css.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Css.Stylesheet | null;
            }).Sheet = new Css.Stylesheet(_css);
            // ── DOM ──────────────────────────────────────────────────────────
            this._wrap = document.createElement('div');
            this._wrap.className = 'ce-wrap';
            this._gutter = document.createElement('div');
            this._gutter.className = 'ce-gutter';
            this._gutterText = document.createElement('div');
            this._gutterText.className = 'ce-gutter-text';
            this._gutter.appendChild(this._gutterText);
            if (this._showLn)
                this._wrap.appendChild(this._gutter);

            /** @name        stage
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned stage value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const stage = document.createElement('div');
            stage.className = 'ce-stage';
            this._pre = document.createElement('pre');
            this._pre.className = 'ce-pre';
            this._code = document.createElement('code');
            this._code.className = 'ce-code';
            this._pre.appendChild(this._code);
            this._ta = document.createElement('textarea');
            this._ta.className = 'ce-ta';
            this._ta.spellcheck = false;
            this._ta.setAttribute('autocomplete', 'off');
            this._ta.setAttribute('autocapitalize', 'off');
            this._ta.setAttribute('autocorrect', 'off');
            this._ta.setAttribute('wrap', 'off');
            this._ta.setAttribute('name', this.id ? this.id + '-textarea'
                : 'arianna-code-editor-' + Math.random().toString(36).slice(2, 10));
            if (this._readonly)
                this._ta.readOnly = true;
            stage.appendChild(this._pre);
            stage.appendChild(this._ta);
            this._wrap.appendChild(stage);

            /** @name        mountTarget
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mountTarget value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mountTarget = this._resolveMountTarget();
            mountTarget.appendChild(this._wrap);
            this._ta.value = this.value.Get();
            this._render();
            this._ta.addEventListener('input', () => this._onInput());
            this._ta.addEventListener('scroll', () => this._syncScroll());
            this._ta.addEventListener('keydown', (e) => this._onKey(e));
            if (this._autoFocus)
                setTimeout(() => this._ta.focus(), 0);
        }
        // ─── Public API ──────────────────────────────────────────────────────
        /** @name        Value
         *  @public
         *  @type        {string}
         *  @description Component member for Value.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Value(): string { return this.value.Get(); }

        /** @name        Value
         *  @public
         *  @type        {void}
         *  @description Component member for Value.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set Value(v: string)
        {
            this.value.Set(v);
            if (this._ta && this._ta.value !== v)
                this._ta.value = v;
            this._render();
        }

        /** @name        Language
         *  @public
         *  @type        {CodeEditor.Types.Language}
         *  @description Component member for Language.
         *  @returns     {CodeEditor.Types.Language} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Language(): Types.Language { return this.language.Get(); }

        /** @name        Language
         *  @public
         *  @type        {void}
         *  @description Component member for Language.
         *  @param       {CodeEditor.Types.Language} l Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set Language(l: Types.Language) { this.language.Set(l); this._render(); }

        /** @name        focus
         *  @public
         *  @type        {void}
         *  @description Component member for focus.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        override focus(): void { this._ta?.focus(); }

        /** @name        blur
         *  @public
         *  @type        {void}
         *  @description Component member for blur.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        override blur(): void { this._ta?.blur(); }
        // ─── Internals ───────────────────────────────────────────────────────
        /** Resolve a concrete appendable Node across shadow backends. With shadow:false
         *  this returns the host element itself (light DOM). */
        private _resolveMountTarget(): Element | ShadowRoot | DocumentFragment
        {
            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = (this as unknown as {
                /** @name        Shadow
                 *  @public
                 *  @type        {{
                    Root?: unknown;
                }}
                 *  @description Component member for Shadow.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Shadow?: {
                    /** @name        Root
                     *  @public
                     *  @type        {unknown}
                     *  @description Component member for Root.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Root?: unknown;
                };
            }).Shadow?.Root as unknown;
            if (!root)
                return this as unknown as Element;
            if (typeof (root as {
                /** @name        appendChild
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for append Child.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                appendChild?: unknown;
            }).appendChild === 'function'
                && !(root as {
                    /** @name        IsAriannaShadow
                     *  @public
                     *  @type        {boolean}
                     *  @description Component member for Is Arianna Shadow.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    IsAriannaShadow?: boolean;
                }).IsAriannaShadow) {
                return root as ShadowRoot;
            }

            /** @name        ar
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ar value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ar = root as {
                /** @name        IsAriannaShadow
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for Is Arianna Shadow.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                IsAriannaShadow?: boolean;

                /** @name        Backend
                 *  @public
                 *  @type        {'light' | 'iframe'}
                 *  @description Component member for Backend.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Backend?: 'light' | 'iframe';

                /** @name        Host
                 *  @public
                 *  @type        {Element}
                 *  @description Component member for Host.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Host?: Element;

                /** @name        document
                 *  @public
                 *  @type        {Document | null}
                 *  @description Component member for document.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                document?: Document | null;

                /** @name        iframe
                 *  @public
                 *  @type        {HTMLIFrameElement | null}
                 *  @description Component member for iframe.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                iframe?: HTMLIFrameElement | null;
            };
            if (ar.IsAriannaShadow)
            {
                if (ar.Backend === 'iframe')
                {
                    /** @name        doc
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned doc value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const doc = ar.document ?? (ar.iframe ? ar.iframe.contentDocument : null);
                    if (doc && doc.body)
                        return doc.body as unknown as Element;
                    return (ar.Host ?? (this as unknown as Element));
                }
                return ar.Host ?? (this as unknown as Element);
            }
            if (typeof (root as {
                /** @name        appendChild
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for append Child.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                appendChild?: unknown;
            }).appendChild === 'function')
                return root as ShadowRoot;
            return this as unknown as Element;
        }

        /** @name        _onInput
         *  @private
         *  @type        {void}
         *  @description Component member for _on Input.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _onInput(): void
        {
            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = this._ta.value;
            this.value.Set(v);
            this._render();
            this.dispatchEvent(new CustomEvent('change', { detail: { value: v, source: this }, bubbles: true, composed: true }));
        }

        /** @name        _render
         *  @private
         *  @type        {void}
         *  @description Component member for _render.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _render(): void
        {
            /** @name        textarea
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned textarea value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const textarea = this._ta;

            /** @name        selectionStart
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned selectionStart value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const selectionStart = textarea?.selectionStart ?? 0;

            /** @name        selectionEnd
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned selectionEnd value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const selectionEnd = textarea?.selectionEnd ?? selectionStart;

            /** @name        selectionDirection
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned selectionDirection value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const selectionDirection = textarea?.selectionDirection ?? 'none';

            /** @name        src
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned src value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const src = textarea?.value ?? this.value.Get();

            /** @name        tokens
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tokens value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tokens = CodeEditor.#Tokenize(src, this.language.Get());

            /** @name        html
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned html value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let html = '';
            for (const t of tokens)
            {
                if (t.kind === 'newline')
                {
                    html += '\n';
                    continue;
                }
                if (t.kind === 'space')
                {
                    html += t.text;
                    continue;
                }
                html += `<span class="tk-${t.kind}">${CodeEditor.#Escape(t.text)}</span>`;
            }
            if (!src.endsWith('\n'))
                html += '\n';
            this._code.innerHTML = html;
            if (this._showLn)
            {
                /** @name        lines
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lines value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lines = src.split('\n').length;

                /** @name        g
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned g value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let g = '';
                for (let i = 1; i <= lines; i++)
                    g += i + '\n';
                this._gutterText.textContent = g;

                /** @name        digits
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned digits value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const digits = Math.max(2, String(lines).length);
                this._gutter.style.width = `${Math.max(48, 24 + digits * 9)}px`;
            }
            if (textarea &&
                document.activeElement === textarea) {
                textarea.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
            }
            this._syncScroll();
        }

        /** @name        _syncScroll
         *  @private
         *  @type        {void}
         *  @description Component member for _sync Scroll.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _syncScroll(): void
        {
            this._pre.scrollLeft = this._ta.scrollLeft;
            this._pre.scrollTop = this._ta.scrollTop;
            if (this._showLn)
                this._gutter.scrollTop = this._ta.scrollTop;
        }

        /** @name        _onKey
         *  @private
         *  @type        {void}
         *  @description Component member for _on Key.
         *  @param       {KeyboardEvent} e Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _onKey(e: KeyboardEvent): void
        {
            if (this._readonly)
                return;

            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        mod
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mod value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mod = (e.ctrlKey || e.metaKey);
            if (')]}"\'`'.includes(e.key)
                && ta.selectionStart === ta.selectionEnd
                && ta.value[ta.selectionStart] === e.key) {
                e.preventDefault();

                /** @name        s
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned s value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const s = ta.selectionStart + 1;
                ta.setSelectionRange(s, s);
                return;
            }
            if (e.key === 'Backspace'
                && ta.selectionStart === ta.selectionEnd
                && ta.selectionStart > 0) {
                /** @name        openers
                 *  @public
                 *  @type        {Record<string, string>}
                 *  @description Namespace-owned openers value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const openers: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };

                /** @name        prev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned prev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const prev = ta.value[ta.selectionStart - 1];

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = ta.value[ta.selectionStart];
                if (openers[prev] !== undefined && openers[prev] === next)
                {
                    e.preventDefault();

                    /** @name        s
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned s value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const s = ta.selectionStart - 1;
                    ta.value = ta.value.slice(0, s) + ta.value.slice(s + 2);
                    ta.setSelectionRange(s, s);
                    this.value.Set(ta.value);
                    this._render();
                    this.dispatchEvent(new CustomEvent('change', { detail: { value: ta.value, source: this }, bubbles: true, composed: true }));
                    return;
                }
            }
            if (e.key === 'Tab')
            {
                e.preventDefault();
                if (e.shiftKey)
                    this._indentSel(-1);
                else
                    this._indentSel(+1);
                return;
            }
            if (mod && (e.key === 'd' || e.key === 'D'))
            {
                e.preventDefault();
                this._duplicateLines();
                return;
            }
            if (mod && e.key === '/')
            {
                e.preventDefault();
                this._toggleComment();
                return;
            }
            if (mod && (e.key === ']' || e.key === '['))
            {
                e.preventDefault();
                this._indentSel(e.key === ']' ? +1 : -1);
                return;
            }
            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))
            {
                e.preventDefault();
                this._moveLines(e.key === 'ArrowUp' ? -1 : +1);
                return;
            }

            /** @name        pairs
             *  @public
             *  @type        {Record<string, string>}
             *  @description Namespace-owned pairs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
            if (pairs[e.key] !== undefined && ta.selectionStart === ta.selectionEnd)
            {
                /** @name        after
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned after value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const after = ta.value[ta.selectionStart] ?? '';
                if (!/\w/.test(after))
                {
                    e.preventDefault();
                    this._insert(e.key + pairs[e.key]);

                    /** @name        s
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned s value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const s = ta.selectionStart;
                    ta.setSelectionRange(s - 1, s - 1);
                    this._render();
                    return;
                }
            }
            if (e.key === 'Enter')
            {
                e.preventDefault();

                /** @name        ps
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ps value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ps = ta.selectionStart;

                /** @name        pre
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pre value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const pre = ta.value.slice(0, ps);

                /** @name        lstart
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned lstart value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const lstart = pre.lastIndexOf('\n') + 1;

                /** @name        line
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned line value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const line = pre.slice(lstart);

                /** @name        m
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned m value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const m = /^[\t ]*/.exec(line);

                /** @name        indent
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned indent value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const indent = m ? m[0] : '';

                /** @name        prev
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned prev value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const prev = ta.value[ps - 1];

                /** @name        next
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned next value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const next = ta.value[ps] ?? '';

                /** @name        extra
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned extra value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const extra = (prev === '{' || prev === '[' || prev === '(') ? this._oneIndent() : '';
                if (extra && next && ((prev === '{' && next === '}') ||
                    (prev === '[' && next === ']') ||
                    (prev === '(' && next === ')'))) {
                    this._insert('\n' + indent + extra + '\n' + indent);

                    /** @name        s
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned s value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
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

        /** @name        _insert
         *  @private
         *  @type        {void}
         *  @description Component member for _insert.
         *  @param       {string} text Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _insert(text: string): void
        {
            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = ta.selectionStart, e = ta.selectionEnd;
            ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
            ta.setSelectionRange(s + text.length, s + text.length);
            this.value.Set(ta.value);
            this.dispatchEvent(new CustomEvent('change', { detail: { value: ta.value, source: this }, bubbles: true, composed: true }));
        }

        /** @name        _oneIndent
         *  @private
         *  @type        {string}
         *  @description Component member for _one Indent.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _oneIndent(): string { return this._useTabs ? '\t' : ' '.repeat(this._indent); }

        /** @name        _indentSel
         *  @private
         *  @type        {void}
         *  @description Component member for _indent Sel.
         *  @param       {1 | -1} sign Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _indentSel(sign: 1 | -1): void
        {
            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = ta.value;

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let s = ta.selectionStart, e = ta.selectionEnd;
            if (s === e && sign === +1)
            {
                /** @name        ind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ind = this._oneIndent();
                ta.value = v.slice(0, s) + ind + v.slice(s);
                ta.setSelectionRange(s + ind.length, s + ind.length);
                this.value.Set(ta.value);
                this._render();
                return;
            }

            /** @name        ls
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ls value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let ls = v.lastIndexOf('\n', s - 1) + 1;

            /** @name        le
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned le value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let le = v.indexOf('\n', e);
            if (le === -1)
                le = v.length;

            /** @name        before
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned before value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const before = v.slice(0, ls);

            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = v.slice(ls, le);

            /** @name        after
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned after value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const after = v.slice(le);

            /** @name        ind
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ind value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ind = this._oneIndent();

            /** @name        mutated
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mutated value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let mutated = '';

            /** @name        delta0
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned delta0 value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let delta0 = 0, deltaN = 0;

            /** @name        lines
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lines value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lines = sel.split('\n');
            for (let i = 0; i < lines.length; i++)
            {
                /** @name        line
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned line value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let line = lines[i];
                if (sign === +1)
                {
                    line = ind + line;
                    if (i === 0)
                        delta0 += ind.length;
                    deltaN += ind.length;
                }
                else
                {
                    if (line.startsWith(ind))
                    {
                        line = line.slice(ind.length);
                        if (i === 0)
                            delta0 -= ind.length;
                        deltaN -= ind.length;
                    }
                    else if (line.startsWith('\t'))
                    {
                        line = line.slice(1);
                        if (i === 0)
                            delta0 -= 1;
                        deltaN -= 1;
                    }
                    else if (line.startsWith(' '))
                    {
                        /** @name        k
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned k value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        let k = 0;
                        while (k < this._indent && line[k] === ' ')
                            k++;
                        line = line.slice(k);
                        if (i === 0)
                            delta0 -= k;
                        deltaN -= k;
                    }
                }
                mutated += (i === 0 ? '' : '\n') + line;
            }
            ta.value = before + mutated + after;
            ta.setSelectionRange(s + delta0, e + deltaN);
            this.value.Set(ta.value);
            this._render();
        }

        /** @name        _duplicateLines
         *  @private
         *  @type        {void}
         *  @description Component member for _duplicate Lines.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _duplicateLines(): void
        {
            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = ta.value;

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = ta.selectionStart, e = ta.selectionEnd;

            /** @name        ls
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ls value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let ls = v.lastIndexOf('\n', s - 1) + 1;

            /** @name        le
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned le value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let le = v.indexOf('\n', e);
            if (le === -1)
                le = v.length;

            /** @name        block
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned block value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const block = v.slice(ls, le);
            ta.value = v.slice(0, le) + '\n' + block + v.slice(le);

            /** @name        off
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned off value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const off = 1 + block.length;
            ta.setSelectionRange(s + off, e + off);
            this.value.Set(ta.value);
            this._render();
        }

        /** @name        _toggleComment
         *  @private
         *  @type        {void}
         *  @description Component member for _toggle Comment.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _toggleComment(): void
        {
            /** @name        lang
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lang value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lang = this.language.Get();

            /** @name        prefix
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned prefix value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let prefix = '// ';
            if (lang === 'json' || lang === 'plain')
                prefix = '// ';
            if (lang === 'html')
            {
                this._toggleBlockComment('<!-- ', ' -->');
                return;
            }
            if (lang === 'css')
            {
                this._toggleBlockComment('/* ', ' */');
                return;
            }

            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = ta.value;

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let s = ta.selectionStart, e = ta.selectionEnd;

            /** @name        ls
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ls value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let ls = v.lastIndexOf('\n', s - 1) + 1;

            /** @name        le
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned le value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let le = v.indexOf('\n', e);
            if (le === -1)
                le = v.length;

            /** @name        lines
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lines value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lines = v.slice(ls, le).split('\n');

            /** @name        allCommented
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned allCommented value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const allCommented = lines.every(l => l.trim().length === 0 || l.trimStart().startsWith(prefix.trimEnd()));

            /** @name        newLines
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned newLines value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const newLines = lines.map(line => {
                if (allCommented)
                {
                    /** @name        idx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned idx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const idx = line.indexOf(prefix.trimEnd());
                    if (idx === -1)
                        return line;
                    return line.slice(0, idx) + line.slice(idx + (line.slice(idx, idx + prefix.length) === prefix ? prefix.length : prefix.trimEnd().length));
                }
                else
                {
                    if (line.trim().length === 0)
                        return line;

                    /** @name        m
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned m value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const m = /^(\s*)(.*)$/.exec(line)!;
                    return m[1] + prefix + m[2];
                }
            });
            ta.value = v.slice(0, ls) + newLines.join('\n') + v.slice(le);
            this.value.Set(ta.value);
            this._render();
        }

        /** @name        _toggleBlockComment
         *  @private
         *  @type        {void}
         *  @description Component member for _toggle Block Comment.
         *  @param       {string} open Parameter.
         *  @param       {string} close Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _toggleBlockComment(open: string, close: string): void
        {
            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = ta.value;

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let s = ta.selectionStart, e = ta.selectionEnd;
            if (s === e)
            {
                /** @name        ls
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ls value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ls = v.lastIndexOf('\n', s - 1) + 1;

                /** @name        le
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned le value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let le = v.indexOf('\n', e);
                if (le === -1)
                    le = v.length;
                s = ls;
                e = le;
            }

            /** @name        block
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned block value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const block = v.slice(s, e);

            /** @name        mutated
             *  @public
             *  @type        {string}
             *  @description Namespace-owned mutated value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let mutated: string;
            if (block.trimStart().startsWith(open) && block.trimEnd().endsWith(close))
            {
                /** @name        i0
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned i0 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const i0 = block.indexOf(open);

                /** @name        i1
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned i1 value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const i1 = block.lastIndexOf(close);
                mutated = block.slice(0, i0) + block.slice(i0 + open.length, i1) + block.slice(i1 + close.length);
            }
            else
            {
                mutated = open + block + close;
            }
            ta.value = v.slice(0, s) + mutated + v.slice(e);
            ta.setSelectionRange(s, s + mutated.length);
            this.value.Set(ta.value);
            this._render();
        }

        /** @name        _moveLines
         *  @private
         *  @type        {void}
         *  @description Component member for _move Lines.
         *  @param       {-1 | 1} dir Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private _moveLines(dir: -1 | 1): void
        {
            /** @name        ta
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ta value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const ta = this._ta;

            /** @name        v
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned v value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const v = ta.value;

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let s = ta.selectionStart, e = ta.selectionEnd;

            /** @name        ls
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned ls value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let ls = v.lastIndexOf('\n', s - 1) + 1;

            /** @name        le
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned le value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let le = v.indexOf('\n', e);
            if (le === -1)
                le = v.length;
            if (dir === -1)
            {
                if (ls === 0)
                    return;

                /** @name        prevStart
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned prevStart value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const prevStart = v.lastIndexOf('\n', ls - 2) + 1;

                /** @name        prevLine
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned prevLine value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const prevLine = v.slice(prevStart, ls - 1);

                /** @name        block
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned block value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const block = v.slice(ls, le);
                ta.value = v.slice(0, prevStart) + block + '\n' + prevLine + v.slice(le);

                /** @name        shift
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned shift value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const shift = -(prevLine.length + 1);
                ta.setSelectionRange(s + shift, e + shift);
            }
            else
            {
                if (le === v.length)
                    return;

                /** @name        nextEnd
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nextEnd value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const nextEnd = v.indexOf('\n', le + 1);

                /** @name        nextLineEnd
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nextLineEnd value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const nextLineEnd = nextEnd === -1 ? v.length : nextEnd;

                /** @name        nextLine
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned nextLine value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const nextLine = v.slice(le + 1, nextLineEnd);

                /** @name        block
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned block value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const block = v.slice(ls, le);
                ta.value = v.slice(0, ls) + nextLine + '\n' + block + v.slice(nextLineEnd);

                /** @name        shift
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned shift value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const shift = nextLine.length + 1;
                ta.setSelectionRange(s + shift, e + shift);
            }
            this.value.Set(ta.value);
            this._render();
        }
        // ─── Lifecycle ───────────────────────────────────────────────────────
        /** Re-mount after Namespace restores author markup over constructor output. */
        onCreated(): void { this._mountEditor(); }
    }
}
export default CodeEditor;

export type CodeEditorOptions = CodeEditor.Interfaces.Options;

export type CodeEditorLanguage = CodeEditor.Types.Language;
