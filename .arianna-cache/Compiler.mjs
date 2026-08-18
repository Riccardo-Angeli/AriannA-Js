// core/Compiler.ts
import ts from "typescript";
var Compilers;
((Compilers2) => {
  class Parser {
    /** @name        #Void
     *  @private
     *  @static
     *  @readonly
     *  @type        {Set<string>}
     *  @description Canonical HTML void-element tag registry used while parsing.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    static #Void = /* @__PURE__ */ new Set(
      ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
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
    static Attributes(source) {
      const output = [];
      let index = 0;
      while (index < source.length) {
        while (/\s/.test(source[index] || "")) index++;
        if (index >= source.length) break;
        let name = "";
        while (index < source.length && !/[\s=]/.test(source[index])) {
          name += source[index++];
        }
        while (/\s/.test(source[index] || "")) index++;
        let value = "";
        if (source[index] === "=") {
          index++;
          while (/\s/.test(source[index] || "")) index++;
          const quote = source[index];
          if (quote === '"' || quote === "'") {
            index++;
            while (index < source.length && source[index] !== quote) {
              value += source[index++];
            }
            index++;
          } else {
            while (index < source.length && !/\s/.test(source[index])) {
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
    Attributes(source) {
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
    static TagEnd(html, start) {
      let quote = null;
      for (let index = start + 1; index < html.length; index++) {
        const character = html[index];
        if (quote) {
          if (character === quote && html[index - 1] !== "\\") {
            quote = null;
          }
        } else if (character === '"' || character === "'") {
          quote = character;
        } else if (character === ">") {
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
    TagEnd(html, start) {
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
    static Parse(html) {
      const root = { Type: "Root", Children: [] };
      const stack = [root];
      let index = 0;
      while (index < html.length) {
        if (html.startsWith("<!--", index)) {
          const end2 = html.indexOf("-->", index + 4);
          const stop = end2 < 0 ? html.length : end2 + 3;
          stack.at(-1).Children.push(
            {
              Type: "Raw",
              Html: html.slice(index, stop)
            }
          );
          index = stop;
          continue;
        }
        if (html[index] !== "<") {
          let end2 = html.indexOf("<", index);
          if (end2 < 0) {
            end2 = html.length;
          }
          stack.at(-1).Children.push(
            {
              Type: "Text",
              Text: html.slice(index, end2)
            }
          );
          index = end2;
          continue;
        }
        if (html.startsWith("</", index)) {
          const end2 = Parser.TagEnd(html, index);
          if (stack.length > 1) {
            stack.pop();
          }
          index = end2 < 0 ? html.length : end2 + 1;
          continue;
        }
        const end = Parser.TagEnd(html, index);
        if (end < 0) {
          break;
        }
        let inside = html.slice(index + 1, end);
        const selfClosing = /\/\s*$/.test(inside);
        inside = inside.replace(/\/\s*$/, "");
        const match = inside.match(/^([^\s]+)([\s\S]*)$/);
        if (!match) {
          index = end + 1;
          continue;
        }
        const tag = match[1];
        if (tag.startsWith("!")) {
          stack.at(-1).Children.push(
            {
              Type: "Raw",
              Html: html.slice(index, end + 1)
            }
          );
          index = end + 1;
          continue;
        }
        const element = {
          Type: "Element",
          Tag: tag,
          Attributes: Parser.Attributes(match[2] || ""),
          Children: []
        };
        stack.at(-1).Children.push(element);
        index = end + 1;
        if (!selfClosing && !Parser.#Void.has(tag.toLowerCase())) {
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
    Parse(html) {
      return Parser.Parse(html);
    }
  }
  Compilers2.Parser = Parser;
  class Analyzer {
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
    static Analyze(source, fileName = "component.ts") {
      const kind = /\.jsx?$/i.test(fileName) ? ts.ScriptKind.JS : /\.tsx$/i.test(fileName) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
      const sourceFile = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true,
        kind
      );
      const sites = [];
      const Visit = (node) => {
        if (ts.isTaggedTemplateExpression(node) && node.tag.getText(sourceFile) === "html") {
          const noSubstitution = ts.isNoSubstitutionTemplateLiteral(node.template);
          let kind2 = "Other";
          const parent = node.parent;
          if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && parent.left.getText(sourceFile) === "this.template") {
            kind2 = "Instance";
          } else if (ts.isPropertyDeclaration(parent) && parent.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword
          )) {
            kind2 = "Static";
          }
          sites.push({
            Start: node.getStart(sourceFile),
            End: node.end,
            Text: noSubstitution ? node.template.text : "",
            Kind: kind2,
            Promotable: noSubstitution
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
    Analyze(source, fileName = "component.ts") {
      return Analyzer.Analyze(source, fileName);
    }
  }
  Compilers2.Analyzer = Analyzer;
  class Transform {
    /** @name        #Void
     *  @private
     *  @static
     *  @readonly
     *  @type        {Set<string>}
     *  @description Canonical HTML void-element tag registry used during IR emission.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    static #Void = /* @__PURE__ */ new Set(
      ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
    );
    /** @name        #WhitespaceStructural
     *  @private
     *  @static
     *  @readonly
     *  @type        {Set<string>}
     *  @description HTML parents whose inter-element formatting whitespace is structurally insignificant.
     *               Keeping these nodes would multiply inert Text nodes in compiled table/list templates and
     *               force the browser to carry them through cloning, style and layout. Explicit text content
     *               and inline-significant spacing remain untouched.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    static #WhitespaceStructural = /* @__PURE__ */ new Set(
      ["table", "thead", "tbody", "tfoot", "tr", "colgroup"]
    );
    /** @name        #NormalizeWhitespace
     *  @private
     *  @static
     *  @param       {AstNode} node Template AST node.
     *  @param       {string | null} [parentTag] Parent element tag, null for Root.
     *  @returns     {AstNode} Semantically equivalent AST with formatting-only whitespace removed.
     *  @description Remove indentation/newline Text nodes only when they are structural: at Root/element
     *               boundaries or between children of table-structure elements. A literal single space between
     *               inline siblings is preserved. Edge text containing interpolation has newline indentation
     *               trimmed without changing the actual content. Normalisation runs before path generation so
     *               operation paths always match the DOM that is actually cloned.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    static #NormalizeWhitespace(node, parentTag = null) {
      if (node.Type !== "Root" && node.Type !== "Element") {
        return node;
      }
      const children = node.Children;
      const normalized = [];
      const structural = parentTag === null || Transform.#WhitespaceStructural.has(parentTag.toLowerCase());
      for (let index = 0; index < children.length; index++) {
        let child = children[index];
        if (child.Type === "Text") {
          const text = child.Text;
          const edge = index === 0 || index === children.length - 1;
          const formatting = /[\r\n\t]/.test(text);
          if (/^\s*$/.test(text)) {
            if (formatting && (edge || structural)) {
              continue;
            }
          } else if (edge && formatting) {
            let trimmed = text;
            if (index === 0) {
              trimmed = trimmed.replace(/^[\t \r\n]*[\r\n][\t ]*/, "");
            }
            if (index === children.length - 1) {
              trimmed = trimmed.replace(/[\t ]*[\r\n][\t \r\n]*$/, "");
            }
            if (trimmed !== text) {
              child = { Type: "Text", Text: trimmed };
            }
          }
        } else if (child.Type === "Element") {
          child = Transform.#NormalizeWhitespace(child, child.Tag);
        }
        normalized.push(child);
      }
      if (node.Type === "Root") {
        return { Type: "Root", Children: normalized };
      }
      return {
        ...node,
        Children: normalized
      };
    }
    /** @name        Escape
     *  @public
     *  @static
     *  @param       {string} source Source text.
     *  @returns     {string} JavaScript string literal.
     *  @description Encode source text safely for generated JavaScript.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    static Escape(source) {
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
    Escape(source) {
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
    static Expression(source, aliases) {
      let expression = source.trim();
      for (const alias of aliases) {
        const safe = alias.replace(/[$]/g, "\\$&");
        expression = expression.replace(
          new RegExp(`(?<![.$\\w])${safe}(?![\\w$])`, "g"),
          `scope.${alias}`
        );
      }
      return `(function(){return (${expression});}).call(ctx)`;
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
    Expression(source, aliases) {
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
    static Interpolation(text, aliases) {
      const pattern = /\{\{\s*([\s\S]+?)\s*\}\}/g;
      let match;
      let last = 0;
      const parts = [];
      while (match = pattern.exec(text)) {
        if (match.index > last) {
          parts.push(
            Transform.Escape(
              text.slice(last, match.index)
            )
          );
        }
        parts.push(
          `String(${Transform.Expression(match[1], aliases)} ?? '')`
        );
        last = pattern.lastIndex;
      }
      if (last < text.length) {
        parts.push(
          Transform.Escape(
            text.slice(last)
          )
        );
      }
      return parts.length ? parts.join("+") : Transform.Escape(text);
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
    Interpolation(text, aliases) {
      return Transform.Interpolation(text, aliases);
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
    static Apply(root, aliases = []) {
      if (root.Type !== "Root") {
        throw new TypeError(
          "[arianna] Transform expects a Root AST node."
        );
      }
      root = Transform.#NormalizeWhitespace(root);
      let html = "";
      const operations = [];
      const Emit = (node, path, localAliases) => {
        if (node.Type === "Raw") {
          html += node.Html;
          return;
        }
        if (node.Type === "Text") {
          if (/\{\{/.test(node.Text)) {
            html += "<!--ar:t-->";
            operations.push(
              `{k:'text',p:${JSON.stringify(path)},e:(ctx,scope)=>${Transform.Interpolation(node.Text, localAliases)}}`
            );
          } else {
            html += node.Text;
          }
          return;
        }
        if (node.Type !== "Element") {
          return;
        }
        const attributes = new Map(node.Attributes);
        const loop = attributes.get("a-for");
        const condition = attributes.get("a-if");
        if (loop || condition) {
          html += "<!--ar:s-->";
          const drop = loop ? "a-for" : "a-if";
          const clone = {
            ...node,
            Attributes: node.Attributes.filter(
              ([name]) => name !== drop
            )
          };
          if (loop) {
            const match = loop.match(
              /^\s*\(?\s*([\w$]+)(?:\s*,\s*([\w$]+))?\s*\)?\s+(?:in|of)\s+([\s\S]+)$/
            );
            if (!match) {
              throw new Error(
                `Bad a-for: ${loop}`
              );
            }
            const item = match[1];
            const index2 = match[2];
            const childAliases = [
              ...localAliases,
              item,
              ...index2 ? [index2] : []
            ];
            const child = Transform.Apply(
              {
                Type: "Root",
                Children: [clone]
              },
              childAliases
            );
            const key = attributes.get("a-key") || attributes.get(":key");
            operations.push(
              `{k:'for',p:${JSON.stringify(path)},item:${Transform.Escape(item)},${index2 ? `index:${Transform.Escape(index2)},` : ""}e:(ctx,scope)=>${Transform.Expression(match[3], localAliases)},${key ? `key:(ctx,scope)=>${Transform.Expression(key, childAliases)},` : ""}c:{html:${Transform.Escape(child.Html)},ops:[${child.Ops.join(",")}]}}`
            );
          } else {
            const child = Transform.Apply(
              {
                Type: "Root",
                Children: [clone]
              },
              localAliases
            );
            operations.push(
              `{k:'if',p:${JSON.stringify(path)},e:(ctx,scope)=>${Transform.Expression(condition, localAliases)},c:{html:${Transform.Escape(child.Html)},ops:[${child.Ops.join(",")}]}}`
            );
          }
          return;
        }
        html += `<${node.Tag}`;
        for (const [name, value] of node.Attributes) {
          if (name.startsWith(":") || name.startsWith("@") || name === "a-html" || name === "a-key") {
            continue;
          }
          html += value === "" ? ` ${name}` : ` ${name}=${Transform.Escape(value)}`;
        }
        html += ">";
        for (const [name, value] of node.Attributes) {
          if (name.startsWith(":")) {
            operations.push(
              `{k:'attr',p:${JSON.stringify(path)},n:${Transform.Escape(name.slice(1))},e:(ctx,scope)=>${Transform.Expression(value, localAliases)}}`
            );
          } else if (name.startsWith("@")) {
            operations.push(
              `{k:'event',p:${JSON.stringify(path)},n:${Transform.Escape(name.slice(1))},e:(ctx,scope)=>${Transform.Expression(value, localAliases)}}`
            );
          } else if (name === "a-html") {
            operations.push(
              `{k:'html',p:${JSON.stringify(path)},e:(ctx,scope)=>${Transform.Expression(value, localAliases)}}`
            );
          }
        }
        let childIndex = 0;
        for (const child of node.Children) {
          Emit(
            child,
            [...path, childIndex++],
            localAliases
          );
        }
        if (!Transform.#Void.has(node.Tag.toLowerCase())) {
          html += `</${node.Tag}>`;
        }
      };
      let index = 0;
      for (const child of root.Children) {
        Emit(
          child,
          [index++],
          aliases
        );
      }
      return {
        Html: html,
        Ops: operations
      };
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
    Apply(root, aliases = []) {
      return Transform.Apply(root, aliases);
    }
  }
  Compilers2.Transform = Transform;
  class Optimizer {
    /** @name        Optimize
     *  @public
     *  @static
     *  @param       {IR} ir Transformed Template IR.
     *  @returns     {OptimizedIR} Optimised IR.
     *  @description Mark templates with no runtime operations as fully static.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    static Optimize(ir) {
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
    Optimize(ir) {
      return Optimizer.Optimize(ir);
    }
  }
  Compilers2.Optimizer = Optimizer;
  class Generator {
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
    static Generate(ir, templateRef = "Templates.Template") {
      return `${templateRef}.Compiled({html:${JSON.stringify(ir.Html)},ops:[${ir.Ops.join(",")}],static:${ir.Static}})`;
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
    Generate(ir, templateRef = "Templates.Template") {
      return Generator.Generate(ir, templateRef);
    }
  }
  Compilers2.Generator = Generator;
  class Compiler {
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
    static Compile(source, options = {}) {
      const sites = Analyzer.Analyze(
        source,
        options.FileName ?? "component.ts"
      );
      const edits = [];
      const definitions = [];
      let compiled = 0;
      let promoted = 0;
      let dynamic = 0;
      for (const site of sites) {
        if (!site.Promotable) {
          dynamic++;
          continue;
        }
        const ir = Optimizer.Optimize(
          Transform.Apply(
            Parser.Parse(site.Text)
          )
        );
        const name = `__AR_TEMPLATE_${compiled++}`;
        definitions.push(
          `const ${name} = ${Generator.Generate(ir, options.TemplateRef)};`
        );
        edits.push({
          Start: site.Start,
          End: site.End,
          Replacement: name
        });
        if (site.Kind === "Instance") {
          promoted++;
        }
      }
      let code = source;
      edits.sort(
        (left, right) => right.Start - left.Start
      ).forEach(
        (edit) => {
          code = code.slice(0, edit.Start) + edit.Replacement + code.slice(edit.End);
        }
      );
      if (definitions.length) {
        let position = 0;
        const imports = [...code.matchAll(/^import[\s\S]*?;\s*$/gm)];
        if (imports.length) {
          const last = imports.at(-1);
          position = last.index + last[0].length;
        }
        const generated = "\n/* AriannA compiler: shared compiled templates; safe instance templates are promoted automatically. */\n" + definitions.join("\n") + "\n";
        code = code.slice(0, position) + generated + code.slice(position);
      }
      return {
        Code: code,
        Compiled: compiled,
        Promoted: promoted,
        Dynamic: dynamic
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
    Compile(source, options = {}) {
      return Compiler.Compile(source, options);
    }
  }
  Compilers2.Compiler = Compiler;
})(Compilers || (Compilers = {}));
export {
  Compilers
};
/**
 * @module    core/Compiler
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA build-time Template compiler. The `Compilers` namespace owns the complete compilation
 *              pipeline and exposes only its canonical contracts and runtime-independent compiler classes.
 *              Parsing, source analysis, AST transformation, IR optimisation, code generation and compilation
 *              coordination are contained here; no compiler implementation detail is scattered across modules.
 */
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
/** @name        Attribute
 *  @public
 *  @type        {type alias}
 *  @description Parsed Template attribute represented as a name/value tuple.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        AstNode
 *  @public
 *  @type        {type alias}
 *  @description Compact AriannA Template compiler AST node union.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        TemplateSite
 *  @public
 *  @type        {interface}
 *  @description Analysed source location for one AriannA `html` tagged template.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        IR
 *  @public
 *  @type        {interface}
 *  @description Intermediate representation produced by Transform and consumed by Optimizer.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        OptimizedIR
 *  @public
 *  @type        {interface}
 *  @description Optimised Template IR with explicit static-block classification.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        CompileOptions
 *  @public
 *  @type        {interface}
 *  @description AriannA compiler invocation options.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        CompileResult
 *  @public
 *  @type        {interface}
 *  @description Compiler output plus transformation statistics.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @class       Parser
 *  @public
 *  @description Lightweight runtime-independent Template parser. Converts raw AriannA Template HTML into
 *               the compact compiler AST without creating browser DOM nodes. Every public operation is
 *               exposed through matching static and instance entry points.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @class       Analyzer
 *  @public
 *  @description Stateless TypeScript/JavaScript source analyser. Locates AriannA `html` tagged templates,
 *               classifies ownership and marks only safe no-substitution templates as promotable shared
 *               compiled definitions. Exposes matching static and instance entry points.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @name        Visit
 *  @private
 *  @param       {ts.Node} node Current TypeScript AST node.
 *  @returns     {void}
 *  @description Depth-first Template-site discovery owned by Analyzer.Analyze.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @class       Transform
 *  @public
 *  @description Stateless AST-to-IR transformer. Converts compiler AST nodes into static HTML plus compact
 *               executable operations for text, attributes, events, HTML, conditionals and keyed/non-keyed
 *               loops. Every public operation has matching static and instance surfaces.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
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
/** @class       Optimizer
 *  @public
 *  @description Stateless Template optimiser. Classifies operation-free templates as fully static and exposes
 *               equivalent static and instance entry points for future IR optimisation passes.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @class       Generator
 *  @public
 *  @description Stateless Template code generator. Converts OptimizedIR into the
 *               `Templates.Template.Compiled(...)` runtime expression consumed by the compiled fast path,
 *               with equivalent static and instance entry points.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/** @class       Compiler
 *  @public
 *  @description Canonical AriannA Template compiler facade. Coordinates Analyzer → Parser → Transform →
 *               Optimizer → Generator, hoists safe instance templates to shared compiled definitions and
 *               leaves JavaScript-substitution templates on the dynamic runtime fallback. Exposes matching
 *               static and instance compilation entry points.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
