/**
 * @module    core/compiler/Compiler
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA build-time Template compiler (R31: reactive CFG with durability revision lanes). The `Compilers` namespace owns the complete compilation
 *              pipeline and exposes only its canonical contracts and runtime-independent compiler classes.
 *              Parsing, source analysis, AST transformation, IR optimisation, code generation and compilation
 *              coordination are contained here; no compiler implementation detail is scattered across modules.
 */

import ts from 'typescript';
import type { Logos } from '../Logos.ts';

/** @name        Compilers
 *  @public
 *  @type        {namespace}
 *  @description Groups AriannA Template compiler contracts and the complete build-time compilation pipeline.
 *               `Parser` converts Template markup into the compact compiler AST; `Analyzer` locates and
 *               classifies `html` tagged-template sites; `Transform` lowers AST nodes to static HTML plus
 *               executable operations; `Optimizer` classifies and simplifies the IR; `Generator` emits the
 *               `Templates.Template.Compiled(...)` runtime expression; `Compiler` coordinates the complete
 *               Analyzer → Parser → Transform → Optimizer → Generator pipeline and performs safe instance-to-
 *               shared-template promotion without changing component authoring syntax.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Compilers
{
    /** @name        Attribute
     *  @public
     *  @type        {type alias}
     *  @description Parsed Template attribute represented as a name/value tuple.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Attribute = [string, string];

    /** @name        AstNode
     *  @public
     *  @type        {type alias}
     *  @description Compact AriannA Template compiler AST node union.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type AstNode =
        { Type: 'Root'; Children: AstNode[] } |
        { Type: 'Raw'; Html: string } |
        { Type: 'Text'; Text: string } |
        { Type: 'Element'; Tag: string; Attributes: Attribute[]; Children: AstNode[] };

    /** @name        TemplateSite
     *  @public
     *  @type        {interface}
     *  @description Analysed source location for one AriannA `html` tagged template.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface TemplateSite
    {
        Start      : number;
        End        : number;
        Text       : string;
        Kind       : 'Instance' | 'Static' | 'Other';
        Promotable : boolean;
    }

    /** Canonical zero-dependency DOM primitive names addressable by AriannA Web LIR. */
    export type DOMPrimitive =
        | 'Create' | 'CreateText' | 'CreateComment' | 'CreateFragment' | 'CreateTemplate'
        | 'Append' | 'Before' | 'Insert' | 'Move' | 'Remove' | 'Clear'
        | 'Text' | 'Content' | 'Attribute' | 'Property' | 'Class' | 'Style' | 'CssText';

    /**
     * Web-LIR addressing. This class exists only at build time. It produces canonical Logos
     * native-reference Definitions and therefore never adds runtime dispatch.
     */
    export class WebLIR
    {
        static readonly RuntimeId = 'arianna.runtime';
        static readonly DialectId = 'arianna.web.primitives';

        static Address(member: DOMPrimitive): Logos.Action.NativeAddress
        {
            return { RuntimeId: WebLIR.RuntimeId, Type: 'Primitives', Member: member, Static: true };
        }

        static Action(member: DOMPrimitive): Logos.Action.Definition
        {
            return {
                Id: `arianna.primitives.${member}`,
                Kind: 'action',
                DialectId: WebLIR.DialectId,
                Version: 1,
                ActionKind: 'native-reference',
                NativeAddress: WebLIR.Address(member),
                NativeReference: `Primitives.${member}`
            };
        }

        /** Direct build-time symbol spelling used by generated Web code. */
        static Symbol(member: DOMPrimitive): string
        {
            return `Primitives.${member}`;
        }
    }

    /** @name        IR
     *  @public
     *  @type        {interface}
     *  @description Intermediate representation produced by Transform and consumed by Optimizer.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface IR
    {
        Html    : string;
        Ops     : string[];
        /** Logos-native addresses used by this compiled unit. Build-time only. */
        Actions : Logos.Action.Definition[];
        /** True when the compiled unit has exactly one top-level Element node. */
        SingleRoot : boolean;
        /** True when this unit contains no structural a-if/a-for child operation. */
        Flat   : boolean;
        /** Compiler-generated direct closure binder for flat row sinks. */
        Binder : string;
        /** Compiler-generated direct delegated-event wiring for flat rows. */
        Wire   : string;
        /** R27 compiler-generated single-root row materializer (clone + sinks + events + record). */
        Factory: string;
        /** Distinct delegated DOM event types required by this compiled unit. */
        EventTypes: string[];
        Plan :
        {
            Patches    : number[];
            Events     : number[];
            PatchPaths : number[][];
            EventPaths : number[][];
        };
    }

    /** @name        OptimizedIR
     *  @public
     *  @type        {interface}
     *  @description Optimised Template IR with explicit static-block classification.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface OptimizedIR extends IR
    {
        Static: boolean;
    }

    /** @name        CompileOptions
     *  @public
     *  @type        {interface}
     *  @description AriannA compiler invocation options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface CompileOptions
    {
        TemplateRef?: string;
        FileName?: string;
    }

    /** @name        CompileResult
     *  @public
     *  @type        {interface}
     *  @description Compiler output plus transformation statistics.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface CompileResult
    {
        Code     : string;
        Compiled : number;
        Promoted : number;
        Dynamic  : number;
    }

    /** @class       Parser
     *  @public
     *  @description Lightweight runtime-independent Template parser. Converts raw AriannA Template HTML into
     *               the compact compiler AST without creating browser DOM nodes. Every public operation is
     *               exposed through matching static and instance entry points.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Parser
    {
        /** @name        #Void
         *  @private
         *  @static
         *  @readonly
         *  @type        {Set<string>}
         *  @description Canonical HTML void-element tag registry used while parsing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #Void = new Set
        (
            ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']
        );

        /** @name        Attributes
         *  @public
         *  @static
         *  @param       {string} source Raw attribute source.
         *  @returns     {Attribute[]} Parsed attributes.
         *  @description Parse one start-tag attribute segment.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Attributes(source: string): Attribute[]
        {
            const output: Attribute[] = [];
            let index = 0;

            while(index < source.length)
            {
                while(/\s/.test(source[index] || '')) index++;
                if(index >= source.length) break;

                let name = '';

                while(index < source.length && !/[\s=]/.test(source[index]))
                {
                    name += source[index++];
                }

                while(/\s/.test(source[index] || '')) index++;

                let value = '';

                if(source[index] === '=')
                {
                    index++;

                    while(/\s/.test(source[index] || '')) index++;

                    const quote = source[index];

                    if(quote === '"' || quote === "'")
                    {
                        index++;

                        while(index < source.length && source[index] !== quote)
                        {
                            value += source[index++];
                        }

                        index++;
                    }
                    else
                    {
                        while(index < source.length && !/\s/.test(source[index]))
                        {
                            value += source[index++];
                        }
                    }
                }

                output.push([name, value]);
            }

            return output;
        }

        /** @name        Attributes
         *  @public
         *  @param       {string} source Raw attribute source.
         *  @returns     {Attribute[]} Parsed attributes.
         *  @description Instance convenience over Parser.Attributes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Attributes(source: string): Attribute[]
        {
            return Parser.Attributes(source);
        }

        /** @name        TagEnd
         *  @public
         *  @static
         *  @param       {string} html Template HTML.
         *  @param       {number} start Opening `<` position.
         *  @returns     {number} Closing `>` position or -1.
         *  @description Locate a tag terminator while respecting quoted attribute values.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static TagEnd
        (
            html  : string,
            start : number
        ): number
        {
            let quote: string | null = null;

            for(let index = start + 1; index < html.length; index++)
            {
                const character = html[index];

                if(quote)
                {
                    if(character === quote && html[index - 1] !== '\\')
                    {
                        quote = null;
                    }
                }
                else if(character === '"' || character === "'")
                {
                    quote = character;
                }
                else if(character === '>')
                {
                    return index;
                }
            }

            return -1;
        }

        /** @name        TagEnd
         *  @public
         *  @param       {string} html Template HTML.
         *  @param       {number} start Opening `<` position.
         *  @returns     {number} Closing `>` position or -1.
         *  @description Instance convenience over Parser.TagEnd.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        TagEnd
        (
            html  : string,
            start : number
        ): number
        {
            return Parser.TagEnd(html, start);
        }

        /** @name        Parse
         *  @public
         *  @static
         *  @param       {string} html Template HTML.
         *  @returns     {AstNode} Root compiler AST.
         *  @description Parse AriannA Template markup into the compact build-time AST.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Parse(html: string): AstNode
        {
            const root: AstNode = { Type: 'Root', Children: [] };
            const stack: Array<{ Children: AstNode[] }> = [root];
            let index = 0;

            while(index < html.length)
            {
                if(html.startsWith('<!--', index))
                {
                    const end = html.indexOf('-->', index + 4);
                    const stop = end < 0 ? html.length : end + 3;

                    stack.at(-1)!.Children.push
                    (
                        {
                            Type : 'Raw',
                            Html : html.slice(index, stop)
                        }
                    );

                    index = stop;
                    continue;
                }

                if(html[index] !== '<')
                {
                    let end = html.indexOf('<', index);

                    if(end < 0)
                    {
                        end = html.length;
                    }

                    stack.at(-1)!.Children.push
                    (
                        {
                            Type : 'Text',
                            Text : html.slice(index, end)
                        }
                    );

                    index = end;
                    continue;
                }

                if(html.startsWith('</', index))
                {
                    const end = Parser.TagEnd(html, index);

                    if(stack.length > 1)
                    {
                        stack.pop();
                    }

                    index = end < 0 ? html.length : end + 1;
                    continue;
                }

                const end = Parser.TagEnd(html, index);

                if(end < 0)
                {
                    break;
                }

                let inside = html.slice(index + 1, end);
                const selfClosing = /\/\s*$/.test(inside);

                inside = inside.replace(/\/\s*$/, '');

                const match = inside.match(/^([^\s]+)([\s\S]*)$/);

                if(!match)
                {
                    index = end + 1;
                    continue;
                }

                const tag = match[1];

                if(tag.startsWith('!'))
                {
                    stack.at(-1)!.Children.push
                    (
                        {
                            Type : 'Raw',
                            Html : html.slice(index, end + 1)
                        }
                    );

                    index = end + 1;
                    continue;
                }

                const element: AstNode =
                {
                    Type       : 'Element',
                    Tag        : tag,
                    Attributes : Parser.Attributes(match[2] || ''),
                    Children   : []
                };

                stack.at(-1)!.Children.push(element);
                index = end + 1;

                if(!selfClosing && !Parser.#Void.has(tag.toLowerCase()))
                {
                    stack.push(element);
                }
            }

            return root;
        }

        /** @name        Parse
         *  @public
         *  @param       {string} html Template HTML.
         *  @returns     {AstNode} Root compiler AST.
         *  @description Instance convenience over Parser.Parse.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Parse(html: string): AstNode
        {
            return Parser.Parse(html);
        }
    }

    /** @class       Analyzer
     *  @public
     *  @description Stateless TypeScript/JavaScript source analyser. Locates AriannA `html` tagged templates,
     *               classifies ownership and marks only safe no-substitution templates as promotable shared
     *               compiled definitions. Exposes matching static and instance entry points.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Analyzer
    {
        /** @name        Analyze
         *  @public
         *  @static
         *  @param       {string} source TypeScript/JavaScript source.
         *  @param       {string} [fileName] Logical source filename.
         *  @returns     {TemplateSite[]} Analysed Template sites.
         *  @description Locate all AriannA `html` tagged templates and classify safe automatic promotion.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Analyze
        (
            source   : string,
            fileName : string = 'component.ts'
        ): TemplateSite[]
        {
            const kind =
                /\.jsx?$/i.test(fileName)
                    ? ts.ScriptKind.JS
                    : /\.tsx$/i.test(fileName)
                        ? ts.ScriptKind.TSX
                        : ts.ScriptKind.TS;

            const sourceFile = ts.createSourceFile
            (
                fileName,
                source,
                ts.ScriptTarget.Latest,
                true,
                kind
            );

            const sites: TemplateSite[] = [];

            /** @name        Visit
             *  @private
             *  @param       {ts.Node} node Current TypeScript AST node.
             *  @returns     {void}
             *  @description Depth-first Template-site discovery owned by Analyzer.Analyze.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const Visit = (node: ts.Node): void =>
            {
                if
                (
                    ts.isTaggedTemplateExpression(node) &&
                    node.tag.getText(sourceFile) === 'html'
                )
                {
                    const noSubstitution =
                        ts.isNoSubstitutionTemplateLiteral(node.template);

                    let kind: TemplateSite['Kind'] = 'Other';
                    const parent = node.parent;

                    if
                    (
                        ts.isBinaryExpression(parent) &&
                        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                        parent.left.getText(sourceFile) === 'this.template'
                    )
                    {
                        kind = 'Instance';
                    }
                    else if
                    (
                        ts.isPropertyDeclaration(parent) &&
                        parent.modifiers?.some
                        (
                            modifier => modifier.kind === ts.SyntaxKind.StaticKeyword
                        )
                    )
                    {
                        kind = 'Static';
                    }

                    sites.push
                    ({
                        Start      : node.getStart(sourceFile),
                        End        : node.end,
                        Text       : noSubstitution ? node.template.text : '',
                        Kind       : kind,
                        Promotable : noSubstitution
                    });
                }

                ts.forEachChild(node, Visit);
            };

            Visit(sourceFile);

            return sites;
        }

        /** @name        Analyze
         *  @public
         *  @param       {string} source TypeScript/JavaScript source.
         *  @param       {string} [fileName] Logical source filename.
         *  @returns     {TemplateSite[]} Analysed Template sites.
         *  @description Instance convenience over Analyzer.Analyze.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Analyze
        (
            source   : string,
            fileName : string = 'component.ts'
        ): TemplateSite[]
        {
            return Analyzer.Analyze(source, fileName);
        }
    }

    /** @class       Transform
     *  @public
     *  @description Stateless AST-to-IR transformer. Converts compiler AST nodes into static HTML plus compact
     *               executable operations for text, attributes, events, HTML, conditionals and keyed/non-keyed
     *               loops. Every public operation has matching static and instance surfaces.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Transform
    {
        /** HTML table-structure containers where formatting-only whitespace is DOM-noise. */
        static readonly #StructuralWhitespaceParents = new Set
        (
            ['table','thead','tbody','tfoot','tr','colgroup']
        );

        /**
         * Remove formatting-only Text nodes in HTML table-structure containers before Web lowering.
         * This is deliberately narrow: whitespace in general inline/block content is preserved.
         */
        static CompactStructuralWhitespace(node: AstNode): AstNode
        {
            if(node.Type !== 'Element') return node;

            const children = node.Children
                .map(child => Transform.CompactStructuralWhitespace(child))
                .filter
                (
                    child =>
                        !(
                            Transform.#StructuralWhitespaceParents.has(node.Tag.toLowerCase()) &&
                            child.Type === 'Text' &&
                            child.Text.trim() === ''
                        )
                );

            return { ...node, Children: children };
        }

        /** @name        #Void
         *  @private
         *  @static
         *  @readonly
         *  @type        {Set<string>}
         *  @description Canonical HTML void-element tag registry used during IR emission.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #Void = new Set
        (
            ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']
        );

        /** @name        Escape
         *  @public
         *  @static
         *  @param       {string} source Source text.
         *  @returns     {string} JavaScript string literal.
         *  @description Encode source text safely for generated JavaScript.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Escape(source: string): string
        {
            return JSON.stringify(source);
        }

        /** @name        Escape
         *  @public
         *  @param       {string} source Source text.
         *  @returns     {string} JavaScript string literal.
         *  @description Instance convenience over Transform.Escape.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Escape(source: string): string
        {
            return Transform.Escape(source);
        }

        /** @name        Expression
         *  @public
         *  @static
         *  @param       {string} source Expression source.
         *  @param       {string[]} aliases Active loop aliases.
         *  @returns     {string} Generated expression function body.
         *  @description Rewrite lexical loop aliases to Scope access while preserving component-context lookup.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Expression
        (
            source  : string,
            aliases : string[]
        ): string
        {
            let expression = source.trim();

            for(const alias of aliases)
            {
                const safe = alias.replace(/[$]/g, '\\$&');

                expression = expression.replace
                (
                    new RegExp(`(?<![.$\\w])${safe}(?![\\w$])`, 'g'),
                    `scope.${alias}`
                );
            }

            /*
             * Most template expressions are lexical (loop aliases / globals) and do not
             * require dynamic `this`. Emitting an IIFE + .call(ctx) for those expressions
             * creates an extra function object on every evaluation — catastrophic in large
             * compiled lists. Detect real `this` tokens with the TypeScript scanner so
             * strings/comments containing the word do not disable the fast path.
             */
            const scanner = ts.createScanner
            (
                ts.ScriptTarget.Latest,
                true,
                ts.LanguageVariant.Standard,
                expression
            );

            let usesThis = false;
            for(let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan())
            {
                if(token === ts.SyntaxKind.ThisKeyword)
                {
                    usesThis = true;
                    break;
                }
            }

            return usesThis
                ? `(function(){return (${expression});}).call(ctx)`
                : `(${expression})`;
        }

        /** @name        Expression
         *  @public
         *  @param       {string} source Expression source.
         *  @param       {string[]} aliases Active loop aliases.
         *  @returns     {string} Generated expression function body.
         *  @description Instance convenience over Transform.Expression.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Expression
        (
            source  : string,
            aliases : string[]
        ): string
        {
            return Transform.Expression(source, aliases);
        }

        /** @name        Interpolation
         *  @public
         *  @static
         *  @param       {string} text Text containing `{{ ... }}` bindings.
         *  @param       {string[]} aliases Active loop aliases.
         *  @returns     {string} Generated concatenation expression.
         *  @description Compile text interpolation into direct String conversions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Interpolation
        (
            text    : string,
            aliases : string[]
        ): string
        {
            const pattern = /\{\{\s*([\s\S]+?)\s*\}\}/g;
            let match: RegExpExecArray | null;
            let last = 0;
            const parts: string[] = [];

            while((match = pattern.exec(text)))
            {
                if(match.index > last)
                {
                    parts.push
                    (
                        Transform.Escape
                        (
                            text.slice(last, match.index)
                        )
                    );
                }

                parts.push
                (
                    `String(${Transform.Expression(match[1], aliases)} ?? '')`
                );

                last = pattern.lastIndex;
            }

            if(last < text.length)
            {
                parts.push
                (
                    Transform.Escape
                    (
                        text.slice(last)
                    )
                );
            }

            return parts.length
                ? parts.join('+')
                : Transform.Escape(text);
        }

        /** @name        Interpolation
         *  @public
         *  @param       {string} text Text containing `{{ ... }}` bindings.
         *  @param       {string[]} aliases Active loop aliases.
         *  @returns     {string} Generated concatenation expression.
         *  @description Instance convenience over Transform.Interpolation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Interpolation
        (
            text    : string,
            aliases : string[]
        ): string
        {
            return Transform.Interpolation(text, aliases);
        }

        /** Extract direct first-level property dependencies for the current
         *  compiled row alias. R21 intentionally keeps this conservative:
         *  expressions that cannot be proven row-local simply omit `d` and
         *  retain the generic direct-patch fallback. */
        static Dependencies
        (
            source   : string,
            rowAlias : string | undefined
        ): string[]
        {
            if(!rowAlias) return [];

            const safe = rowAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(`(?:^|[^.$\\w])${safe}\\.([A-Za-z_$][\\w$]*)`, 'g');
            const dependencies = new Set<string>();
            let match: RegExpExecArray | null;

            while((match = pattern.exec(source)))
            {
                dependencies.add(match[1]);
            }

            return Array.from(dependencies);
        }

        static InterpolationDependencies
        (
            text     : string,
            rowAlias : string | undefined
        ): string[]
        {
            const dependencies = new Set<string>();
            const pattern = /\{\{\s*([\s\S]+?)\s*\}\}/g;
            let match: RegExpExecArray | null;

            while((match = pattern.exec(text)))
            {
                for(const key of Transform.Dependencies(match[1], rowAlias))
                {
                    dependencies.add(key);
                }
            }

            return Array.from(dependencies);
        }

        static DependencyField(keys: readonly string[]): string
        {
            return keys.length ? `,d:${JSON.stringify(keys)}` : '';
        }

        /** @name        Apply
         *  @public
         *  @static
         *  @param       {AstNode} root Parser AST root.
         *  @param       {string[]} [aliases] Active aliases.
         *  @returns     {IR} Transformed intermediate representation.
         *  @description Convert Template AST into static HTML and pre-generated runtime operations.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Apply
        (
            root     : AstNode,
            aliases  : string[] = [],
            rowAlias : string | undefined = undefined
        ): IR
        {
            if(root.Type !== 'Root')
            {
                throw new TypeError
                (
                    '[arianna] Transform expects a Root AST node.'
                );
            }

            let html = '';
            const operations: string[] = [];
            const patchOps: number[] = [];
            const eventOps: number[] = [];
            const patchPaths: number[][] = [];
            const eventPaths: number[][] = [];
            const actions = new Map<DOMPrimitive, Logos.Action.Definition>();

            type BinderSpec =
            {
                Path         : number[];
                Kind         : 'text' | 'attr' | 'html';
                Name?        : string;
                Expression   : string;
                Dependencies : string[];
            };

            const binderSpecs: BinderSpec[] = [];
            let flat = true;

            type EventWireSpec =
            {
                Path       : number[];
                Name       : string;
                Expression : string;
            };

            const eventWireSpecs: EventWireSpec[] = [];

            const Use = (member: DOMPrimitive): void =>
            {
                if(!actions.has(member)) actions.set(member, WebLIR.Action(member));
            };

            /** @name        Emit
             *  @private
             *  @param       {AstNode} node Current AST node.
             *  @param       {number[]} path Child-node path.
             *  @param       {string[]} localAliases Current lexical aliases.
             *  @returns     {void}
             *  @description Recursively emit static HTML and operation records for Transform.Apply.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const Emit =
            (
                node         : AstNode,
                path         : number[],
                localAliases : string[]
            ): void =>
            {
                if(node.Type === 'Raw')
                {
                    html += node.Html;
                    return;
                }

                if(node.Type === 'Text')
                {
                    if(/\{\{/.test(node.Text))
                    {
                        html += '<!--ar:t-->';

                        const operationIndex = operations.length;
                        const dependencies =
                            Transform.InterpolationDependencies(node.Text, rowAlias);
                        const expression =
                            Transform.Interpolation(node.Text, localAliases);

                        Use('CreateText');
                        Use('Text');
                        Use('Before');
                        operations.push
                        (
                            `{k:'text',p:${JSON.stringify(path)},e:(ctx,scope)=>${expression}` +
                            `${Transform.DependencyField(dependencies)}}`
                        );
                        binderSpecs.push
                        ({
                            Path: [...path],
                            Kind: 'text',
                            Expression: expression,
                            Dependencies: [...dependencies]
                        });
                        patchOps.push(operationIndex);
                        patchPaths.push(path);
                    }
                    else
                    {
                        html += node.Text;
                    }

                    return;
                }

                if(node.Type !== 'Element')
                {
                    return;
                }

                const attributes = new Map<string, string>(node.Attributes);
                const loop = attributes.get('a-for');
                const condition = attributes.get('a-if');

                if(loop || condition)
                {
                    flat = false;
                    html += '<!--ar:s-->';

                    const drop = loop ? 'a-for' : 'a-if';

                    const clone: AstNode =
                    {
                        ...node,
                        Attributes:
                            node.Attributes.filter
                            (
                                ([name]) => name !== drop
                            )
                    };

                    if(loop)
                    {
                        const match = loop.match
                        (
                            /^\s*\(?\s*([\w$]+)(?:\s*,\s*([\w$]+))?\s*\)?\s+(?:in|of)\s+([\s\S]+)$/
                        );

                        if(!match)
                        {
                            throw new Error
                            (
                                `Bad a-for: ${loop}`
                            );
                        }

                        const item = match[1];
                        const index = match[2];
                        const childAliases =
                        [
                            ...localAliases,
                            item,
                            ...(index ? [index] : [])
                        ];

                        const compactClone =
                            Transform.CompactStructuralWhitespace(clone);

                        const child = Transform.Apply
                        (
                            {
                                Type     : 'Root',
                                Children : [compactClone]
                            },
                            childAliases,
                            item
                        );

                        for(const action of child.Actions) actions.set(action.NativeAddress?.Member as DOMPrimitive, action);

                        const key =
                            attributes.get('a-key') ||
                            attributes.get(':key');

                        Use('CreateFragment');
                        Use('Before');
                        Use('Append');
                        Use('Move');
                        Use('Remove');
                        Use('Clear');
                        operations.push
                        (
                            `{k:'for',p:${JSON.stringify(path)},item:${Transform.Escape(item)},` +
                            `${index ? `index:${Transform.Escape(index)},` : ''}` +
                            `e:(ctx,scope)=>${Transform.Expression(match[3], localAliases)},` +
                            `${key ? `key:(ctx,scope)=>${Transform.Expression(key, childAliases)},` : ''}` +
                            `c:{html:${Transform.Escape(child.Flat && child.SingleRoot ? child.Html.replaceAll('<!--ar:t-->','\u200B') : child.Html)},` +
                            (child.Flat && child.SingleRoot
                                ? `singleRoot:true,delegated:${JSON.stringify(child.EventTypes)},row:${child.Factory}}}`
                                : `plan:{patches:${JSON.stringify(child.Plan.Patches)},events:${JSON.stringify(child.Plan.Events)}},` +
                                  `bind:${child.Binder},wire:${child.Wire},row:${child.Factory},` +
                                  `delegated:${JSON.stringify(child.EventTypes)},` +
                                  `resolve:${Transform.Resolver(child.Plan, child.SingleRoot)}}}`)
                        );
                    }
                    else
                    {
                        const child = Transform.Apply
                        (
                            {
                                Type     : 'Root',
                                Children : [clone]
                            },
                            localAliases,
                            rowAlias
                        );

                        for(const action of child.Actions) actions.set(action.NativeAddress?.Member as DOMPrimitive, action);

                        Use('CreateComment');
                        Use('CreateFragment');
                        Use('Before');
                        Use('Remove');
                        operations.push
                        (
                            `{k:'if',p:${JSON.stringify(path)},e:(ctx,scope)=>${Transform.Expression(condition!, localAliases)},` +
                            `c:{html:${Transform.Escape(child.Html)},ops:[${child.Ops.join(',')}],` +
                            `plan:{patches:${JSON.stringify(child.Plan.Patches)},events:${JSON.stringify(child.Plan.Events)}},` +
                            `singleRoot:${child.SingleRoot},` +
                            `bind:${child.Binder},` +
                            `wire:${child.Wire},` +
                            `row:${child.Factory},` +
                            `resolve:${Transform.Resolver(child.Plan, child.SingleRoot)}}}`
                        );
                    }

                    return;
                }

                html += `<${node.Tag}`;

                for(const [name, value] of node.Attributes)
                {
                    if
                    (
                        name.startsWith(':') ||
                        name.startsWith('@') ||
                        name === 'a-html' ||
                        name === 'a-key'
                    )
                    {
                        continue;
                    }

                    html +=
                        value === ''
                            ? ` ${name}`
                            : ` ${name}=${Transform.Escape(value)}`;
                }

                html += '>';

                for(const [name, value] of node.Attributes)
                {
                    if(name.startsWith(':'))
                    {
                        const operationIndex = operations.length;
                        const dependencies = Transform.Dependencies(value, rowAlias);
                        const expression = Transform.Expression(value, localAliases);
                        const attributeName = name.slice(1);

                        Use('Attribute');
                        operations.push
                        (
                            `{k:'attr',p:${JSON.stringify(path)},n:${Transform.Escape(attributeName)},` +
                            `e:(ctx,scope)=>${expression}` +
                            `${Transform.DependencyField(dependencies)}}`
                        );
                        binderSpecs.push
                        ({
                            Path: [...path],
                            Kind: 'attr',
                            Name: attributeName,
                            Expression: expression,
                            Dependencies: [...dependencies]
                        });
                        patchOps.push(operationIndex);
                        patchPaths.push(path);
                    }
                    else if(name.startsWith('@'))
                    {
                        const operationIndex = operations.length;
                        const eventName = name.slice(1);
                        const eventExpression = Transform.Expression(value, localAliases);
                        operations.push
                        (
                            `{k:'event',p:${JSON.stringify(path)},n:${Transform.Escape(eventName)},` +
                            `e:(ctx,scope)=>${eventExpression}}`
                        );
                        eventWireSpecs.push
                        ({
                            Path: [...path],
                            Name: eventName,
                            Expression: eventExpression
                        });
                        eventOps.push(operationIndex);
                        eventPaths.push(path);
                    }
                    else if(name === 'a-html')
                    {
                        const operationIndex = operations.length;
                        const dependencies = Transform.Dependencies(value, rowAlias);
                        const expression = Transform.Expression(value, localAliases);
                        operations.push
                        (
                            `{k:'html',p:${JSON.stringify(path)},e:(ctx,scope)=>${expression}` +
                            `${Transform.DependencyField(dependencies)}}`
                        );
                        binderSpecs.push
                        ({
                            Path: [...path],
                            Kind: 'html',
                            Expression: expression,
                            Dependencies: [...dependencies]
                        });
                        patchOps.push(operationIndex);
                        patchPaths.push(path);
                    }
                }

                let childIndex = 0;

                for(const child of node.Children)
                {
                    Emit
                    (
                        child,
                        [...path, childIndex++],
                        localAliases
                    );
                }

                if(!Transform.#Void.has(node.Tag.toLowerCase()))
                {
                    html += `</${node.Tag}>`;
                }
            };

            let index = 0;

            for(const child of root.Children)
            {
                Emit
                (
                    child,
                    [index++],
                    aliases
                );
            }

            return {
                Html       : html,
                Ops        : operations,
                Actions    : Array.from(actions.values()),
                SingleRoot : root.Children.length === 1 && root.Children[0].Type === 'Element',
                Flat       : flat,
                Binder     : Transform.Binder(binderSpecs, root.Children.length === 1 && root.Children[0].Type === 'Element'),
                Wire       : Transform.EventWire(eventWireSpecs, root.Children.length === 1 && root.Children[0].Type === 'Element'),
                Factory    : Transform.RowFactory(binderSpecs, eventWireSpecs, flat && root.Children.length === 1 && root.Children[0].Type === 'Element'),
                EventTypes : Array.from(new Set(eventWireSpecs.map(spec => spec.Name))),
                Plan :
                {
                    Patches    : patchOps,
                    Events     : eventOps,
                    PatchPaths : patchPaths,
                    EventPaths : eventPaths
                }
            };
        }

        /**
         * Emit a direct closure binder for compiler-known flat DOM sinks.
         * Initial values are written immediately; the returned closure is the row's
         * direct property invalidator. No runtime op dispatch or patch target array.
         */
        static Binder
        (
            specs:
            {
                Path         : number[];
                Kind         : 'text' | 'attr' | 'html';
                Name?        : string;
                Expression   : string;
                Dependencies : string[];
            }[],
            singleRoot: boolean = false
        ): string
        {
            if(specs.length === 0) return `(root,ctx,scope,p)=>null`;

            const Access = (path: number[]): string =>
            {
                let expression = 'root';
                const indexes = singleRoot ? path.slice(1) : path;
                for(const index of indexes) expression += `.childNodes[${index}]`;
                return expression;
            };

            const declarations: string[] = [];
            const initial: string[] = [];
            const generic: string[] = [];
            const keyed = new Map<string, string[]>();

            const Statement = (spec: typeof specs[number], index: number): string =>
            {
                const n = `n${index}`;
                const e = spec.Expression;
                if(spec.Kind === 'text')
                    return `v=${e};p.Text(${n},v==null?'':String(v))`;
                if(spec.Kind === 'html')
                    return `v=${e};p.Html(${n},v==null?'':String(v))`;
                return `v=${e};p.Attribute(${n},${JSON.stringify(spec.Name ?? '')},v)`;
            };

            for(let i = 0; i < specs.length; i++)
            {
                const spec = specs[i];
                declarations.push(`const n${i}=${Access(spec.Path)}`);
                const statement = Statement(spec, i);
                initial.push(statement);

                if(spec.Dependencies.length === 0)
                {
                    generic.push(statement);
                    continue;
                }

                for(const dependency of spec.Dependencies)
                {
                    let statements = keyed.get(dependency);
                    if(!statements) keyed.set(dependency, statements = []);
                    statements.push(statement);
                }
            }

            const cases =
                Array.from(keyed.entries())
                    .map(([key, statements]) => `case ${JSON.stringify(key)}:${statements.join(';')};break`)
                    .join(';');

            const all = initial.join(';');
            const genericBody = generic.length ? `${generic.join(';')};` : '';

            return `(root,ctx,scope,p)=>{${declarations.join(';')};let v;${all};return(key)=>{if(key===void 0){${all};return};${genericBody}switch(key){${cases}}}}`;
        }


        /**
         * R31 — emit one self-contained single-root reactive row CFG. Dependency-key switch cases are
         * direct basic blocks with early return; durability revision guards can be layered above them.
         * The generated function performs clone, sink capture, initial writes, delegated-event
         * registration and record creation in one call. Multi-root definitions keep the canonical
         * runtime fallback because their top-level node ownership requires array materialisation.
         */
        static RowFactory
        (
            specs:
            {
                Path         : number[];
                Kind         : 'text' | 'attr' | 'html';
                Name?        : string;
                Expression   : string;
                Dependencies : string[];
            }[],
            events:
            {
                Path       : number[];
                Name       : string;
                Expression : string;
            }[],
            singleRoot: boolean = false
        ): string
        {
            if(!singleRoot) return `undefined`;

            const Access = (path: number[]): string =>
            {
                let expression = 'root';
                for(const index of path.slice(1)) expression += `.childNodes[${index}]`;
                return expression;
            };

            const declarations: string[] = [];
            const initial: string[] = [];
            const generic: string[] = [];
            const keyed = new Map<string, string[]>();

            const Statement = (spec: typeof specs[number], index: number): string =>
            {
                const n = `n${index}`;
                const e = spec.Expression;
                if(spec.Kind === 'text') return `v=${e};p.Text(${n},v==null?'':String(v))`;
                if(spec.Kind === 'html') return `v=${e};p.Html(${n},v==null?'':String(v))`;
                return `v=${e};p.Attribute(${n},${JSON.stringify(spec.Name ?? '')},v)`;
            };

            for(let i = 0; i < specs.length; i++)
            {
                const spec = specs[i];
                declarations.push(`const n${i}=${Access(spec.Path)}`);
                const statement = Statement(spec, i);
                initial.push(statement);

                if(spec.Dependencies.length === 0)
                {
                    generic.push(statement);
                    continue;
                }

                for(const dependency of spec.Dependencies)
                {
                    let statements = keyed.get(dependency);
                    if(!statements) keyed.set(dependency, statements = []);
                    statements.push(statement);
                }
            }

            const cases = Array.from(keyed.entries())
                .map(([key, statements]) => `case ${JSON.stringify(key)}:${statements.join(';')};break`)
                .join(';');
            const all = initial.join(';');
            const genericBody = generic.length ? `${generic.join(';')};` : '';
            const invalidator = specs.length
                ? `(key)=>{if(key===void 0){${all};return};${genericBody}switch(key){${cases}}}`
                : `null`;
            const eventStatements = events.map
            (
                (event) => `register(${Access(event.Path)},${JSON.stringify(event.Name)},ctx,scope,(ctx,scope)=>${event.Expression})`
            );

            return `(source,ctx,scope,value,index,p,register)=>{const root=source.cloneNode(true);${declarations.join(';')}${declarations.length ? ';' : ''}let v;${all}${all ? ';' : ''}${eventStatements.join(';')}${eventStatements.length ? ';' : ''}return{Nodes:root,Targets:null,Scope:scope,Value:value,Index:index,DirectInvalidate:${invalidator}}}`;
        }


        /**
         * Emit direct delegated-event wiring for compiler-known flat row event targets.
         * The generated function addresses each event target directly and registers metadata
         * without allocating a per-row Targets[] array or interpreting operation paths.
         */
        static EventWire
        (
            specs:
            {
                Path       : number[];
                Name       : string;
                Expression : string;
            }[],
            singleRoot: boolean = false
        ): string
        {
            if(specs.length === 0) return `(root,ctx,scope,register)=>{}`;

            const Access = (path: number[]): string =>
            {
                let expression = 'root';
                const indexes = singleRoot ? path.slice(1) : path;
                for(const index of indexes) expression += `.childNodes[${index}]`;
                return expression;
            };

            const statements = specs.map
            (
                (spec) =>
                    `register(${Access(spec.Path)},${JSON.stringify(spec.Name)},ctx,scope,(ctx,scope)=>${spec.Expression})`
            );

            return `(root,ctx,scope,register)=>{${statements.join(';')}}`;
        }

        /**
         * @name        Resolver
         * @public
         * @static
         * @param       {IR['Plan']} plan Compiler execution-plan paths.
         * @returns     {string} Specialized DOM-target resolver source.
         * @description Emit a branch-free resolver for compiler-known row targets. The runtime calls it once
         *              per cloned row instead of interpreting every operation path through Compiled.At.
         */
        static Resolver(plan: IR['Plan'], singleRoot: boolean = false): string
        {
            const Access =
                (path: number[]): string =>
                {
                    let expression = 'root';
                    const indexes = singleRoot ? path.slice(1) : path;

                    for(const index of indexes)
                    {
                        expression += `.childNodes[${index}]`;
                    }

                    return expression;
                };

            const assignments: string[] = [];
            let target = 0;

            for(const path of plan.PatchPaths)
            {
                assignments.push(`out[${target++}]=${Access(path)}`);
            }

            for(const path of plan.EventPaths)
            {
                assignments.push(`out[${target++}]=${Access(path)}`);
            }

            return `(root,out)=>{${assignments.join(';')}}`;
        }

        /** @name        Apply
         *  @public
         *  @param       {AstNode} root Parser AST root.
         *  @param       {string[]} [aliases] Active aliases.
         *  @returns     {IR} Transformed intermediate representation.
         *  @description Instance convenience over Transform.Apply.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Apply
        (
            root     : AstNode,
            aliases  : string[] = [],
            rowAlias : string | undefined = undefined
        ): IR
        {
            return Transform.Apply(root, aliases, rowAlias);
        }
    }

    /** @class       Optimizer
     *  @public
     *  @description Stateless Template optimiser. Classifies operation-free templates as fully static and exposes
     *               equivalent static and instance entry points for future IR optimisation passes.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Optimizer
    {
        /** @name        Optimize
         *  @public
         *  @static
         *  @param       {IR} ir Transformed Template IR.
         *  @returns     {OptimizedIR} Optimised IR.
         *  @description Mark templates with no runtime operations as fully static.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Optimize(ir: IR): OptimizedIR
        {
            return {
                ...ir,
                Static: ir.Ops.length === 0
            };
        }

        /** @name        Optimize
         *  @public
         *  @param       {IR} ir Transformed Template IR.
         *  @returns     {OptimizedIR} Optimised IR.
         *  @description Instance convenience over Optimizer.Optimize.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Optimize(ir: IR): OptimizedIR
        {
            return Optimizer.Optimize(ir);
        }
    }

    /** @class       Generator
     *  @public
     *  @description Stateless Template code generator. Converts OptimizedIR into the
     *               `Templates.Template.Compiled(...)` runtime expression consumed by the compiled fast path,
     *               with equivalent static and instance entry points.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Generator
    {
        /** @name        Generate
         *  @public
         *  @static
         *  @param       {OptimizedIR} ir Optimised Template IR.
         *  @param       {string} [templateRef] Runtime Template reference.
         *  @returns     {string} Generated runtime expression.
         *  @description Emit one compiler-generated Template definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Generate
        (
            ir          : OptimizedIR,
            templateRef : string = 'Templates.Template'
        ): string
        {
            return (
                `${templateRef}.Compiled({` +
                `html:${JSON.stringify(ir.Html)},` +
                `ops:[${ir.Ops.join(',')}],` +
                `plan:{patches:${JSON.stringify(ir.Plan.Patches)},events:${JSON.stringify(ir.Plan.Events)}},` +
                `singleRoot:${ir.SingleRoot},` +
                `bind:${ir.Binder},` +
                `wire:${ir.Wire},` +
                `row:${ir.Factory},` +
                `delegated:${JSON.stringify(ir.EventTypes)},` +
                `resolve:${Transform.Resolver(ir.Plan, ir.SingleRoot)},` +
                `static:${ir.Static}` +
                `})`
            );
        }

        /** @name        Generate
         *  @public
         *  @param       {OptimizedIR} ir Optimised Template IR.
         *  @param       {string} [templateRef] Runtime Template reference.
         *  @returns     {string} Generated runtime expression.
         *  @description Instance convenience over Generator.Generate.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Generate
        (
            ir          : OptimizedIR,
            templateRef : string = 'Templates.Template'
        ): string
        {
            return Generator.Generate(ir, templateRef);
        }
    }

    /** @class       Compiler
     *  @public
     *  @description Canonical AriannA Template compiler facade. Coordinates Analyzer → Parser → Transform →
     *               Optimizer → Generator, hoists safe instance templates to shared compiled definitions and
     *               leaves JavaScript-substitution templates on the dynamic runtime fallback. Exposes matching
     *               static and instance compilation entry points.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Compiler
    {
        /** @name        Compile
         *  @public
         *  @static
         *  @param       {string} source TypeScript/JavaScript source.
         *  @param       {CompileOptions} [options] Compiler options.
         *  @returns     {CompileResult} Generated source and transformation statistics.
         *  @description Compile every safe AriannA Template site and hoist shared definitions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Compile
        (
            source  : string,
            options : CompileOptions = {}
        ): CompileResult
        {
            const sites =
                Analyzer.Analyze
                (
                    source,
                    options.FileName ?? 'component.ts'
                );

            const edits: Array<{
                Start       : number;
                End         : number;
                Replacement : string;
            }> = [];

            const definitions: string[] = [];

            let compiled = 0;
            let promoted = 0;
            let dynamic = 0;

            for(const site of sites)
            {
                if(!site.Promotable)
                {
                    dynamic++;
                    continue;
                }

                const ir =
                    Optimizer.Optimize
                    (
                        Transform.Apply
                        (
                            Parser.Parse(site.Text)
                        )
                    );

                const name =
                    `__AR_TEMPLATE_${compiled++}`;

                definitions.push
                (
                    `const ${name} = ${Generator.Generate(ir, options.TemplateRef)};`
                );

                edits.push
                ({
                    Start       : site.Start,
                    End         : site.End,
                    Replacement : name
                });

                if(site.Kind === 'Instance')
                {
                    promoted++;
                }
            }

            let code = source;

            edits
                .sort
                (
                    (left, right) =>
                        right.Start - left.Start
                )
                .forEach
                (
                    edit =>
                    {
                        code =
                            code.slice(0, edit.Start) +
                            edit.Replacement +
                            code.slice(edit.End);
                    }
                );

            if(definitions.length)
            {
                let position = 0;

                const imports =
                    [...code.matchAll(/^import[\s\S]*?;\s*$/gm)];

                if(imports.length)
                {
                    const last = imports.at(-1)!;

                    position =
                        last.index! +
                        last[0].length;
                }

                const generated =
                    '\n/* AriannA compiler: shared compiled templates; safe instance templates are promoted automatically. */\n' +
                    definitions.join('\n') +
                    '\n';

                code =
                    code.slice(0, position) +
                    generated +
                    code.slice(position);
            }

            return {
                Code     : code,
                Compiled : compiled,
                Promoted : promoted,
                Dynamic  : dynamic
            };
        }

        /** @name        Compile
         *  @public
         *  @param       {string} source TypeScript/JavaScript source.
         *  @param       {CompileOptions} [options] Compiler options.
         *  @returns     {CompileResult} Generated source and transformation statistics.
         *  @description Instance convenience over Compiler.Compile.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Compile
        (
            source  : string,
            options : CompileOptions = {}
        ): CompileResult
        {
            return Compiler.Compile(source, options);
        }
    }
}
