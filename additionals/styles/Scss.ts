/**
 * @module    Scss
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * SCSS (.scss) — BRACE-DELIMITED Sass dialect → standard CSS string.
 *
 * SCSS uses the same braced syntax as plain CSS but adds the Sass features:
 *   • `$variable: value;`              — declaration & substitution (NOT `@`!)
 *   • Nested rules with parent `&`
 *   • `@mixin name(params) { … }`      — definition
 *   • `@include name(args);`           — invocation
 *   • Math operations in values
 *   • Block & line comments
 *   • At-rules pass through with body flattening
 *
 * Differences from Less.ts:
 *   • Variables prefixed with `$`, not `@`
 *   • Mixin invocation requires explicit `@include`, not `.name()`
 *   • Mixin definition uses `@mixin`, not parenthesised selector
 *
 * Out of scope: `@function`, `@if`/`@for`/`@each`/`@while`, `@extend`,
 * placeholders (`%name`), maps, color functions, `@use`/`@forward`.
 *
 * @example
 *   parseScss(`
 *     $primary: dodgerblue;
 *     @mixin elevated($depth) {
 *       box-shadow: 0 $depth $depth rgba(0,0,0,0.2);
 *     }
 *     .box {
 *       background: $primary;
 *       @include elevated(4px);
 *       &:hover { background: red; }
 *     }
 *   `);
 *   //  .box { background: dodgerblue; box-shadow: 0 4px 4px rgba(0,0,0,0.2); }
 *   //  .box:hover { background: red; }
 */

interface MixinDef
{
    params      : string[];
    declarations: string[];
}

interface ScssContext
{
    vars   : Map<string, string>;
    mixins : Map<string, MixinDef>;
    output : string[];
}

// ── Tokeniser ────────────────────────────────────────────────────────────────

function stripLineComments(source: string): string
{
    let out = '';
    let i = 0;
    let inStr: '"' | "'" | null = null;
    let inBlock = false;

    while (i < source.length)
    {
        const ch = source[i] ?? '';
        const next = source[i + 1] ?? '';

        if (inStr) {
            out += ch;
            if (ch === inStr && source[i - 1] !== '\\') inStr = null;
            i++; continue;
        }
        if (inBlock) {
            out += ch;
            if (ch === '*' && next === '/') { out += next; i += 2; inBlock = false; continue; }
            i++; continue;
        }
        if (ch === '"' || ch === "'") { inStr = ch; out += ch; i++; continue; }
        if (ch === '/' && next === '*') { inBlock = true; out += ch; i++; continue; }
        if (ch === '/' && next === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
        out += ch;
        i++;
    }
    return out;
}

function extractTopLevelVars(source: string, vars: Map<string, string>): string
{
    return source.replace(
        /^\s*\$([\w-]+)\s*:\s*([^;{}]+);/gm,
        (_, name: string, val: string) => { vars.set(name, val.trim()); return ''; }
    );
}

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

// ── Block / statement parsing ────────────────────────────────────────────────

function readBlock(source: string, start: number): { body: string; end: number }
{
    let i = source.indexOf('{', start);
    if (i < 0) return { body: '', end: source.length };
    const bodyStart = i + 1;
    let depth = 1;
    i++;
    while (i < source.length && depth > 0)
    {
        const ch = source[i];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        if (depth > 0) i++;
    }
    return { body: source.slice(bodyStart, i), end: i + 1 };
}

type Statement =
    | { kind: 'decl';    text: string }
    | { kind: 'rule';    selector: string; body: string }
    | { kind: 'include'; name: string; args: string }
    | { kind: 'mixin';   name: string; params: string[]; body: string };

function splitStatements(body: string): Statement[]
{
    const out: Statement[] = [];
    let i = 0;
    let buffer = '';
    let inStr: '"' | "'" | null = null;

    while (i < body.length)
    {
        const ch = body[i] ?? '';
        if (inStr) {
            buffer += ch;
            if (ch === inStr && body[i - 1] !== '\\') inStr = null;
            i++; continue;
        }
        if (ch === '"' || ch === "'") { inStr = ch; buffer += ch; i++; continue; }

        if (ch === '{')
        {
            const sel = buffer.trim();
            buffer = '';
            const blk = readBlock(body, i);
            i = blk.end;

            const mixinDef = /^@mixin\s+([\w-]+)\s*(?:\(([^)]*)\))?\s*$/.exec(sel);
            if (mixinDef)
            {
                const params = (mixinDef[2] ?? '').split(',').map(p => p.trim()).filter(Boolean);
                out.push({ kind: 'mixin', name: mixinDef[1] ?? '', params, body: blk.body });
            } else
            {
                out.push({ kind: 'rule', selector: sel, body: blk.body });
            }
            continue;
        }

        if (ch === ';')
        {
            const text = buffer.trim();
            buffer = '';
            i++;
            if (!text) continue;

            const inc = /^@include\s+([\w-]+)\s*(?:\(([^)]*)\))?\s*$/.exec(text);
            if (inc)
            {
                out.push({ kind: 'include', name: inc[1] ?? '', args: inc[2] ?? '' });
                continue;
            }
            out.push({ kind: 'decl', text });
            continue;
        }

        buffer += ch;
        i++;
    }
    const tail = buffer.trim();
    if (tail) out.push({ kind: 'decl', text: tail });
    return out;
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

function walk(body: string, ctx: ScssContext, parents: string[]): void
{
    const stmts = splitStatements(body);
    const declHere: string[] = [];

    const localVars = new Map(ctx.vars);
    const localMixins = new Map(ctx.mixins);

    // Hoist
    for (const s of stmts)
    {
        if (s.kind === 'decl')
        {
            const m = /^\$([\w-]+)\s*:\s*(.+)$/.exec(s.text);
            if (m) localVars.set(m[1] ?? '', substituteVars((m[2] ?? '').trim(), localVars));
        } else if (s.kind === 'mixin')
        {
            const def: MixinDef = { params: s.params, declarations: [] };
            const inner = splitStatements(s.body);
            for (const d of inner)
                if (d.kind === 'decl' && !/^\$[\w-]+\s*:/.test(d.text))
                    def.declarations.push(d.text);
            localMixins.set(s.name, def);
        }
    }

    const nestedCtx: ScssContext = { vars: localVars, mixins: localMixins, output: ctx.output };

    for (const s of stmts)
    {
        if (s.kind === 'decl')
        {
            if (/^\$[\w-]+\s*:/.test(s.text)) continue;
            const colon = s.text.indexOf(':');
            if (colon < 0) continue;
            const prop = s.text.slice(0, colon).trim();
            let val = substituteVars(s.text.slice(colon + 1).trim(), localVars);
            val = evaluateMath(val);
            declHere.push(`${prop}: ${val}`);
        } else if (s.kind === 'include')
        {
            const def = localMixins.get(s.name);
            if (!def) continue;
            const callArgs = s.args.split(',').map(a => a.trim()).filter(Boolean);
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
        } else if (s.kind === 'rule')
        {
            if (s.selector.startsWith('@'))
            {
                const innerOutput: string[] = [];
                const innerCtx: ScssContext = { vars: localVars, mixins: localMixins, output: innerOutput };
                walk(s.body, innerCtx, parents);
                ctx.output.push(`${s.selector} {`);
                for (const line of innerOutput) ctx.output.push(`  ${line}`);
                ctx.output.push('}');
            } else
            {
                const selectors = composeSelector(parents, s.selector);
                walk(s.body, nestedCtx, selectors);
            }
        }
    }

    if (declHere.length && parents.length)
    {
        ctx.output.push(`${parents.join(', ')} { ${declHere.join('; ')}; }`);
    } else if (declHere.length && !parents.length)
    {
        for (const d of declHere) ctx.output.push(`${d};`);
    }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse SCSS source and return standard CSS.
 *
 * @example
 *   parseScss('$p: red; .x { color: $p; &:hover { color: blue; } }');
 *   // '.x { color: red; }\n.x:hover { color: blue; }\n'
 */
export function parseScss(source: string): string
{
    const cleaned = stripLineComments(source);
    const vars = new Map<string, string>();
    const stripped = extractTopLevelVars(cleaned, vars);

    const ctx: ScssContext = {
        vars,
        mixins: new Map<string, MixinDef>(),
        output: [],
    };

    walk(stripped, ctx, []);
    return ctx.output.join('\n') + (ctx.output.length ? '\n' : '');
}

export default parseScss;
