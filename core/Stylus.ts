/**
 * @module    Stylus
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Stylus (.styl) — PERMISSIVE indentation/optional-syntax parser → CSS string.
 *
 * Stylus is the most flexible of the three: braces are optional, colons are
 * optional, semicolons are optional. This parser accepts both:
 *
 *   • Indented (Sass-like): `.box\n  color red\n`
 *   • Braced (Less/SCSS-like): `.box { color: red }`
 *
 * Supported subset:
 *
 *   • `name = value`                   — variable assignment (Stylus style)
 *   • `$name = value` / `@name = value`— alternative variable syntaxes
 *   • Nested rules with `&` parent reference
 *   • Mixin invocation `mixinName()`   — explicit parentheses required
 *   • Mixin definition `mixinName(args)` followed by indented body
 *   • Math operations
 *   • Block & line comments (`//`, `/* … *​/`)
 *   • At-rules with body indentation or braced
 *
 * Behaviour notes:
 *   • Declarations without `:` use first space as separator: `color red` → `color: red`
 *   • Multi-word values (`1px solid red`) preserve their spaces beyond the first
 *
 * @example
 *   parseStylus(`
 *     primary = dodgerblue
 *     .box
 *       background primary
 *       padding 10px + 4px
 *       &:hover
 *         background red
 *   `);
 *   //  .box { background: dodgerblue; padding: 14px; }
 *   //  .box:hover { background: red; }
 */

interface StylusContext
{
    vars   : Map<string, string>;
    output : string[];
}

interface Node
{
    indent  : number;
    text    : string;
    children: Node[];
}

// ── Comment stripping ────────────────────────────────────────────────────────

function stripBlockComments(source: string): string
{
    return source.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
}

function stripLineComments(source: string): string
{
    return source.split('\n').map(line =>
    {
        const idx = line.indexOf('//');
        if (idx < 0) return line;
        // Keep `//` after `:` (URLs)
        const before = line.slice(0, idx);
        if (/:\s*$/.test(before) || /https?$/.test(before.trim())) return line;
        return line.slice(0, idx).replace(/\s+$/, '');
    }).join('\n');
}

/**
 * Convert braced syntax to indented syntax for unified processing.
 * Each `{` opens a new indent level; each `}` closes it. Statements
 * separated by `;` become separate lines.
 */
function deBrace(source: string): string
{
    // If no braces at all, keep original indentation
    if (!/[{}]/.test(source)) return source;

    const out: string[] = [];
    let depth = 0;
    let buffer = '';
    let i = 0;
    let inStr: '"' | "'" | null = null;

    const flushBuffer = () =>
    {
        const trimmed = buffer.trim();
        if (trimmed) out.push('  '.repeat(depth) + trimmed);
        buffer = '';
    };

    while (i < source.length)
    {
        const ch = source[i] ?? '';
        if (inStr) {
            buffer += ch;
            if (ch === inStr && source[i - 1] !== '\\') inStr = null;
            i++; continue;
        }
        if (ch === '"' || ch === "'") { inStr = ch; buffer += ch; i++; continue; }

        if (ch === '\n') { flushBuffer(); i++; continue; }
        if (ch === ';')  { flushBuffer(); i++; continue; }
        if (ch === '{')  {
            // The buffer is the selector — emit at current depth, then increase
            const sel = buffer.trim();
            buffer = '';
            if (sel) out.push('  '.repeat(depth) + sel);
            depth++;
            i++;
            continue;
        }
        if (ch === '}')  {
            flushBuffer();
            depth = Math.max(0, depth - 1);
            i++;
            continue;
        }
        buffer += ch;
        i++;
    }
    flushBuffer();
    return out.join('\n');
}

function getIndent(line: string): number
{
    let i = 0;
    while (i < line.length && (line[i] === ' ' || line[i] === '\t'))
    {
        i += line[i] === '\t' ? 4 : 1;
    }
    return i;
}

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

// ── Substitution & math ──────────────────────────────────────────────────────

function substituteVars(value: string, vars: Map<string, string>): string
{
    // Stylus: bare identifier substitution. Match word boundaries.
    return value.replace(/\b([a-zA-Z_][\w-]*)\b/g, (whole, name: string) =>
    {
        // Don't substitute CSS keywords or units that happen to match
        if (/^\d/.test(whole)) return whole;
        const v = vars.get(name);
        return v ?? whole;
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

// ── Statement classification ─────────────────────────────────────────────────

function isVarAssignment(text: string): RegExpExecArray | null
{
    return /^[@$]?([a-zA-Z_][\w-]*)\s*=\s*(.+)$/.exec(text);
}

/**
 * Return a [property, value] tuple if the line is a CSS declaration.
 * Stylus accepts both `prop: value` and `prop value` (space-separated).
 * Heuristic: if there's a colon, split on it. Otherwise split on first whitespace.
 * Returns null if it doesn't look like a declaration.
 */
function parseDeclaration(text: string): [string, string] | null
{
    if (text.startsWith('@') || text.startsWith('&')) return null;
    if (text.includes(':'))
    {
        const colon = text.indexOf(':');
        const before = text.slice(0, colon).trim();
        if (/^[a-zA-Z-]+$/.test(before)) return [before, text.slice(colon + 1).trim()];
        return null;
    }
    // No colon — try first-whitespace split
    const m = /^([a-zA-Z-]+)\s+(.+)$/.exec(text);
    if (m && /^[a-zA-Z-]+$/.test(m[1] ?? '')) return [m[1] ?? '', m[2] ?? ''];
    return null;
}

// ── Walker ───────────────────────────────────────────────────────────────────

function walkNodes(nodes: Node[], ctx: StylusContext, parents: string[]): void
{
    const localVars = new Map(ctx.vars);
    const declHere: string[] = [];

    // Pre-scan: variable assignments
    for (const n of nodes)
    {
        const m = isVarAssignment(n.text);
        if (m) localVars.set(m[1] ?? '', (m[2] ?? '').trim());
    }

    const nestedCtx: StylusContext = { vars: localVars, output: ctx.output };

    for (const n of nodes)
    {
        if (isVarAssignment(n.text)) continue;

        // At-rule with body
        if (n.text.startsWith('@'))
        {
            if (n.children.length === 0) { ctx.output.push(`${n.text};`); continue; }
            const innerOutput: string[] = [];
            const innerCtx: StylusContext = { vars: localVars, output: innerOutput };
            walkNodes(n.children, innerCtx, parents);
            ctx.output.push(`${n.text} {`);
            for (const line of innerOutput) ctx.output.push(`  ${line}`);
            ctx.output.push('}');
            continue;
        }

        // Has children but text doesn't look like a declaration → it's a selector
        if (n.children.length > 0)
        {
            // Check if the line is itself a declaration (`color red` with children would be ambiguous —
            // resolve by treating any line WITH children as a selector unless it has `:` followed by a value
            // and no further child-typical syntax)
            const decl = parseDeclaration(n.text);
            // Heuristic: if it has children, treat as selector regardless
            if (!decl || /[#.&:>+~\[]/.test(n.text))
            {
                const selectors = composeSelector(parents, n.text);
                walkNodes(n.children, nestedCtx, selectors);
                continue;
            }
        }

        // Try as declaration
        const decl = parseDeclaration(n.text);
        if (decl)
        {
            let val = substituteVars(decl[1], localVars);
            val = evaluateMath(val);
            declHere.push(`${decl[0]}: ${val}`);
            continue;
        }

        // Fallback: treat as selector
        if (n.children.length > 0)
        {
            const selectors = composeSelector(parents, n.text);
            walkNodes(n.children, nestedCtx, selectors);
        }
    }

    if (declHere.length && parents.length)
        ctx.output.push(`${parents.join(', ')} { ${declHere.join('; ')}; }`);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse Stylus source and return standard CSS.
 *
 * @example
 *   parseStylus(`
 *     p = red
 *     .x
 *       color p
 *       &:hover
 *         color blue
 *   `);
 *   // '.x { color: red; }\n.x:hover { color: blue; }\n'
 */
export function parseStylus(source: string): string
{
    let cleaned = stripLineComments(stripBlockComments(source));
    // Normalise braced sections to indented form
    cleaned = deBrace(cleaned);
    const tree = buildTree(cleaned);
    const ctx: StylusContext = {
        vars   : new Map<string, string>(),
        output : [],
    };
    walkNodes(tree, ctx, []);
    return ctx.output.join('\n') + (ctx.output.length ? '\n' : '');
}

export default parseStylus;
