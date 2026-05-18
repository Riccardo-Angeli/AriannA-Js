/**
 * @module    Sass
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Sass (.sass) — INDENTATION-BASED parser → standard CSS string.
 *
 * The original Sass syntax is whitespace-significant: no braces, no semicolons.
 * Nesting is indicated purely by indentation. Variables use `$name`, mixin
 * calls use `@include name`, definitions use `=name` (legacy) or `@mixin name`.
 *
 * Supported subset:
 *
 *   • `$variable: value`               — declaration & substitution
 *   • Indented nesting                 — `.outer\n  .inner\n    color: red` →
 *                                        `.outer .inner { color: red; }`
 *   • Parent selector `&`              — `&:hover` → `<parent>:hover`
 *   • `@mixin name(params)`            — definition
 *   • `@include name(args)`            — invocation, inlines declarations
 *   • Math operations in values        — `+ - * /`
 *   • Block comments `/* … *​/`        — preserved
 *   • Line comments `// …`             — stripped
 *   • At-rules with body indentation   — `@media screen\n  .x\n    color: red`
 *
 * Out of scope: control directives (`@if`/`@for`/`@each`), function definitions,
 * placeholders (`%name`), `@extend`, color functions.
 *
 * @example
 *   parseSass(`
 *     $primary: dodgerblue
 *     .box
 *       background: $primary
 *       padding: 10px + 4px
 *       &:hover
 *         background: red
 *       .inner
 *         color: white
 *   `);
 *   //  .box { background: dodgerblue; padding: 14px; }
 *   //  .box:hover { background: red; }
 *   //  .box .inner { color: white; }
 */

interface MixinDef
{
    params      : string[];
    declarations: string[];
}

interface Node
{
    indent  : number;
    text    : string;
    children: Node[];
}

interface SassContext
{
    vars   : Map<string, string>;
    mixins : Map<string, MixinDef>;
    output : string[];
}

// ── Tokeniser & line-tree builder ────────────────────────────────────────────

function stripBlockComments(source: string): string
{
    return source.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
}

function stripLineComments(source: string): string
{
    return source.split('\n').map(line =>
    {
        // Preserve // inside strings (rare in Sass)
        const idx = line.indexOf('//');
        if (idx < 0) return line;
        // Don't strip if preceded by ':' followed by alpha (e.g. http://) — common in URLs
        const before = line.slice(0, idx);
        if (/:\s*$/.test(before) || /https?$/.test(before.trim())) return line;
        return line.slice(0, idx).replace(/\s+$/, '');
    }).join('\n');
}

function getIndent(line: string): number
{
    let i = 0;
    while (i < line.length && (line[i] === ' ' || line[i] === '\t'))
    {
        // Treat tab as 4 spaces for indent counting
        i += line[i] === '\t' ? 4 : 1;
    }
    return i;
}

/**
 * Parse the raw text into a tree of indented nodes.
 * Empty lines are skipped; the indent of each non-empty line determines
 * its parent (the deepest open node with a smaller indent).
 */
function buildTree(source: string): Node[]
{
    const lines = source.split('\n').map(l => ({ raw: l, indent: getIndent(l), text: l.trim() }))
                                      .filter(l => l.text.length > 0);
    const root: Node[] = [];
    const stack: Array<{ indent: number; children: Node[] }> = [{ indent: -1, children: root }];

    for (const ln of lines)
    {
        while (stack.length > 1 && (stack[stack.length - 1]?.indent ?? -1) >= ln.indent)
            stack.pop();
        const node: Node = { indent: ln.indent, text: ln.text, children: [] };
        const parent = stack[stack.length - 1];
        if (parent) parent.children.push(node);
        stack.push({ indent: ln.indent, children: node.children });
    }
    return root;
}

// ── Substitution & math (shared with Less but using $name for vars) ──────────

function substituteVars(value: string, vars: Map<string, string>): string
{
    return value.replace(/\$([\w-]+)/g, (_, name: string) =>
    {
        const v = vars.get(name);
        if (v === undefined) return `$${name}`;
        return v.replace(/\$([\w-]+)/g, (_2, n2: string) => vars.get(n2) ?? `$${n2}`);
    });
}

function evaluateMath(expr: string): string
{
    let prev: string;
    do {
        prev = expr;
        expr = expr.replace(/\(([^()]+)\)/g, (_, inner: string) => evaluateMath(inner));
    } while (prev !== expr);

    const opRe = /(-?\d*\.?\d+)([a-z%]*)\s*([+\-*/])\s*(-?\d*\.?\d+)([a-z%]*)/i;
    do {
        prev = expr;
        expr = expr.replace(opRe, (whole, aStr: string, aUnit: string, op: string, bStr: string, bUnit: string) =>
        {
            const a = parseFloat(aStr);
            const b = parseFloat(bStr);
            const unit = aUnit || bUnit;
            if (aUnit && bUnit && aUnit !== bUnit) return whole;
            let r: number;
            switch (op) {
                case '+': r = a + b; break;
                case '-': r = a - b; break;
                case '*': r = a * b; break;
                case '/': r = b === 0 ? NaN : a / b; break;
                default: return whole;
            }
            if (Number.isNaN(r)) return whole;
            return `${+r.toFixed(6)}${unit}`;
        });
    } while (prev !== expr);
    return expr;
}

// ── Selector composition with `&` ────────────────────────────────────────────

function composeSelector(parents: string[], child: string): string[]
{
    if (parents.length === 0) return child.split(',').map(s => s.trim()).filter(Boolean);
    const childParts = child.split(',').map(s => s.trim()).filter(Boolean);
    const out: string[] = [];
    for (const p of parents)
        for (const c of childParts)
            out.push(c.includes('&') ? c.replace(/&/g, p).trim() : `${p} ${c}`.trim());
    return out;
}

// ── Walker ───────────────────────────────────────────────────────────────────

function walkNodes(nodes: Node[], ctx: SassContext, parents: string[]): void
{
    const localVars   = new Map(ctx.vars);
    const localMixins = new Map(ctx.mixins);
    const declHere: string[] = [];

    // Pre-scan: variables and mixin definitions
    for (const n of nodes)
    {
        if (/^\$[\w-]+\s*:/.test(n.text))
        {
            const m = /^\$([\w-]+)\s*:\s*(.+)$/.exec(n.text);
            if (m) localVars.set(m[1] ?? '', substituteVars((m[2] ?? '').trim(), localVars));
        } else if (/^@mixin\s+/.test(n.text) || /^=/.test(n.text))
        {
            const m = /^(?:@mixin\s+|=)([\w-]+)\s*(?:\(([^)]*)\))?\s*$/.exec(n.text);
            if (m)
            {
                const name = m[1] ?? '';
                const params = (m[2] ?? '').split(',').map(p => p.trim()).filter(Boolean);
                const declarations: string[] = [];
                for (const c of n.children)
                {
                    if (c.text.includes(':') && !c.text.startsWith('@'))
                        declarations.push(c.text);
                }
                localMixins.set(name, { params, declarations });
            }
        }
    }

    const nestedCtx: SassContext = { vars: localVars, mixins: localMixins, output: ctx.output };

    for (const n of nodes)
    {
        if (/^\$[\w-]+\s*:/.test(n.text)) continue;
        if (/^@mixin\s+/.test(n.text) || /^=/.test(n.text)) continue;

        // @include foo(args)  /  +foo(args)
        const includeMatch = /^(?:@include\s+|\+)([\w-]+)\s*(?:\(([^)]*)\))?\s*$/.exec(n.text);
        if (includeMatch)
        {
            const def = localMixins.get(includeMatch[1] ?? '');
            if (def)
            {
                const callArgs = (includeMatch[2] ?? '').split(',').map(a => a.trim()).filter(Boolean);
                const callVars = new Map(localVars);
                def.params.forEach((p, idx) =>
                {
                    const pname = p.replace(/^\$/, '').trim();
                    if (idx < callArgs.length) callVars.set(pname, callArgs[idx] ?? '');
                });
                for (const decl of def.declarations)
                {
                    const colon = decl.indexOf(':');
                    if (colon < 0) continue;
                    const prop = decl.slice(0, colon).trim();
                    let v = substituteVars(decl.slice(colon + 1).trim(), callVars);
                    v = evaluateMath(v);
                    declHere.push(`${prop}: ${v}`);
                }
            }
            continue;
        }

        // At-rule with children → wrap them
        if (n.text.startsWith('@'))
        {
            // pure at-rule line (no body): pass through as-is
            if (n.children.length === 0)
            {
                ctx.output.push(`${n.text};`);
                continue;
            }
            const innerOutput: string[] = [];
            const innerCtx: SassContext = { vars: localVars, mixins: localMixins, output: innerOutput };
            walkNodes(n.children, innerCtx, parents);
            ctx.output.push(`${n.text} {`);
            for (const line of innerOutput) ctx.output.push(`  ${line}`);
            ctx.output.push('}');
            continue;
        }

        // Detect: is this a selector or a declaration?
        // - Lines with children are always selectors (no declarations have children)
        // - Lines starting with selector chars (& . # [ : > + ~ * | %) are selectors
        // - Lines with `prop: value` pattern (alpha-then-colon-then-value) are declarations
        const isSelectorChar = /^[&.#\[:>+~*|%]/.test(n.text);
        const looksLikeDecl  = /^[a-zA-Z-]+\s*:/.test(n.text);

        if (n.children.length > 0 || (isSelectorChar && !looksLikeDecl))
        {
            const selectors = composeSelector(parents, n.text);
            walkNodes(n.children, nestedCtx, selectors);
            continue;
        }

        // Treat as declaration
        if (looksLikeDecl)
        {
            const colon = n.text.indexOf(':');
            const prop = n.text.slice(0, colon).trim();
            let val = substituteVars(n.text.slice(colon + 1).trim(), localVars);
            val = evaluateMath(val);
            declHere.push(`${prop}: ${val}`);
        }
    }

    if (declHere.length && parents.length)
    {
        ctx.output.push(`${parents.join(', ')} { ${declHere.join('; ')}; }`);
    }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse Sass (indented syntax) source and return standard CSS.
 *
 * @example
 *   parseSass(`
 *     $p: red
 *     .x
 *       color: $p
 *       &:hover
 *         color: blue
 *   `);
 *   // '.x { color: red; }\n.x:hover { color: blue; }\n'
 */
export function parseSass(source: string): string
{
    const cleaned = stripLineComments(stripBlockComments(source));
    const tree = buildTree(cleaned);
    const ctx: SassContext = {
        vars   : new Map<string, string>(),
        mixins : new Map<string, MixinDef>(),
        output : [],
    };
    walkNodes(tree, ctx, []);
    return ctx.output.join('\n') + (ctx.output.length ? '\n' : '');
}

export default parseSass;
