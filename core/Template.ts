/**
 * @module    core/Template
 * @author    Riccardo Angeli
 * @version   4.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA unified Template engine. Dynamic templates preserve the runtime path;
 *              compiler-generated descriptors use the compiled fast path through the same class.
 */

import { Core }       from './Core.ts';
import { Reactivity } from './Reactive.ts';

import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

export namespace Templates
{
    export type Binding         = SchemaInterfaces.Template.Binding;
    export type Options         = SchemaInterfaces.Template.Options;
    export type Scope           = SchemaInterfaces.Template.Scope;
    export type Mount           = SchemaInterfaces.Template.Mount;
    export type ServiceContract = SchemaInterfaces.Template.Service;

    type CompiledExpr = (ctx: any, scope: Scope) => any;
    type CompiledBase = { p: number[] };
    type CompiledText = CompiledBase & { k:'text'; e:CompiledExpr };
    type CompiledAttr = CompiledBase & { k:'attr'; n:string; e:CompiledExpr };
    type CompiledHtml = CompiledBase & { k:'html'; e:CompiledExpr };
    type CompiledEvent = CompiledBase & { k:'event'; n:string; e:CompiledExpr };
    type CompiledIf = CompiledBase & { k:'if'; e:CompiledExpr; c:CompiledDescriptor };
    type CompiledFor = CompiledBase & {
        k:'for'; e:CompiledExpr; item:string; index?:string; key?:CompiledExpr; c:CompiledDescriptor
    };
    type CompiledOp = CompiledText | CompiledAttr | CompiledHtml | CompiledEvent | CompiledIf | CompiledFor;

    /** Internal compiler IR. Public only as a type so generated TypeScript can be checked. */
    export interface CompiledDescriptor { html:string; ops:CompiledOp[]; static?:boolean; }

    type StopLike = { Stop?():void; Dispose?():void } | (()=>void) | void;

    function stop(value: StopLike): void
    {
        if(typeof value === 'function') value();
        else if(value && typeof value.Stop === 'function') value.Stop();
        else if(value && typeof value.Dispose === 'function') value.Dispose();
    }

    function effect(fn: () => void): () => void
    {
        const e = Reactivity.CreateEffect(fn) as unknown as StopLike;
        return () => stop(e);
    }

    function at(root: Node, path: readonly number[]): Node | null
    {
        let node: Node | null = root;
        for(let i = 0; i < path.length; i++) node = node?.childNodes[path[i]] ?? null;
        return node;
    }

    function setAttributeFast(el: Element, name: string, value: any): void
    {
        if(name === 'class')
        {
            (el as HTMLElement).className = value == null ? '' : String(value);
            return;
        }
        if(name === 'style' && typeof value === 'string')
        {
            (el as HTMLElement).style.cssText = value;
            return;
        }
        if(name in el && (name === 'checked' || name === 'disabled' || name === 'value' || name === 'selected'))
        {
            (el as any)[name] = value;
            if(typeof value === 'boolean') value ? el.setAttribute(name, '') : el.removeAttribute(name);
            return;
        }
        if(value === false || value === null || value === undefined) el.removeAttribute(name);
        else if(value === true) el.setAttribute(name, '');
        else el.setAttribute(name, String(value));
    }

    function childScope(parent: Scope, item: string, value: any, indexName: string | undefined, index: number): Scope
    {
        const scope = Object.create(parent || null) as Scope;
        (scope as any)[item] = value;
        if(indexName) (scope as any)[indexName] = index;
        (scope as any).$index = index;
        return scope;
    }

    /** One parsed HTMLTemplateElement per compiler descriptor, including nested blocks. */
    const CompiledNodes = new WeakMap<object, HTMLTemplateElement>();

    function compiledNode(descriptor: CompiledDescriptor): HTMLTemplateElement
    {
        let node = CompiledNodes.get(descriptor as object);
        if(node) return node;
        node = document.createElement('template');
        node.innerHTML = descriptor.html;
        CompiledNodes.set(descriptor as object, node);
        return node;
    }

    class CompiledInstance
    {
        readonly fragment: DocumentFragment;
        readonly nodes: Node[];
        readonly disposers: Array<() => void> = [];

        constructor(
            readonly descriptor: CompiledDescriptor,
            readonly ctx: any,
            readonly scope: Scope,
            readonly reactive = true
        )
        {
            this.fragment = compiledNode(descriptor).content.cloneNode(true) as DocumentFragment;
            this.nodes = Array.from(this.fragment.childNodes);
            this.Bind();
        }

        private Bind(): void
        {
            for(const op of this.descriptor.ops)
            {
                const node = at(this.fragment, op.p);
                if(!node) continue;

                if(op.k === 'event' && node instanceof Element)
                {
                    const candidate = op.e(this.ctx, this.scope);
                    if(typeof candidate === 'function')
                    {
                        const listener = candidate.bind(this.ctx) as EventListener;
                        node.addEventListener(op.n, listener);
                        /* In non-reactive keyed rows detached nodes + listeners are GC-safe; no removal needed. */
                        if(this.reactive) this.disposers.push(() => node.removeEventListener(op.n, listener));
                    }
                    continue;
                }

                if(op.k === 'text' && node.nodeType === Node.COMMENT_NODE)
                {
                    const text = document.createTextNode('');
                    node.parentNode!.insertBefore(text, node.nextSibling);
                    const update = () => {
                        const value = op.e(this.ctx, this.scope);
                        text.nodeValue = value == null ? '' : String(value);
                    };
                    update();
                    if(this.reactive) this.disposers.push(effect(update));
                    continue;
                }

                if(op.k === 'attr' && node instanceof Element)
                {
                    const update = () => setAttributeFast(node, op.n, op.e(this.ctx, this.scope));
                    update();
                    if(this.reactive) this.disposers.push(effect(update));
                    continue;
                }

                if(op.k === 'html' && node instanceof Element)
                {
                    const update = () => {
                        const value = op.e(this.ctx, this.scope);
                        node.innerHTML = value == null ? '' : String(value);
                    };
                    update();
                    if(this.reactive) this.disposers.push(effect(update));
                    continue;
                }

                if(op.k === 'if' && node.nodeType === Node.COMMENT_NODE)
                {
                    let child: CompiledInstance | null = null;
                    const update = () => {
                        const show = !!op.e(this.ctx, this.scope);
                        if(show && !child)
                        {
                            child = new CompiledInstance(op.c, this.ctx, this.scope);
                            node.parentNode!.insertBefore(child.fragment, node.nextSibling);
                        }
                        else if(!show && child)
                        {
                            child.DisposeNodes();
                            child = null;
                        }
                    };
                    update();
                    if(this.reactive) this.disposers.push(effect(update));
                    continue;
                }

                if(op.k === 'for' && node.nodeType === Node.COMMENT_NODE)
                {
                    const keyed = new Map<any, { instance: CompiledInstance; scope: Scope; value: any }>();

                    const update = () => {
                        const raw = op.e(this.ctx, this.scope) ?? [];
                        const values = Array.isArray(raw) ? raw : Array.from(raw as Iterable<any>);
                        const next = new Map<any, { instance: CompiledInstance; scope: Scope; value: any }>();
                        const fragment = document.createDocumentFragment();

                        for(let index = 0; index < values.length; index++)
                        {
                            const value = values[index];
                            const scope = childScope(this.scope, op.item, value, op.index, index);
                            const key = op.key ? op.key(this.ctx, scope) : (value && (value.id ?? value.key)) ?? index;
                            let record = keyed.get(key);

                            if(!record || record.value !== value)
                            {
                                if(record) record.instance.DisposeOnly();
                                record = { instance: new CompiledInstance(op.c, this.ctx, scope, false), scope, value };
                            }
                            else
                            {
                                (record.scope as any)[op.item] = value;
                                if(op.index) (record.scope as any)[op.index] = index;
                                (record.scope as any).$index = index;
                            }

                            next.set(key, record);
                            for(const child of record.instance.nodes) fragment.appendChild(child);
                        }

                        /* Removed keyed rows are already detached by DOM movement/replacement; just release references. */
                        for(const [key, record] of keyed) if(!next.has(key)) record.instance.DisposeOnly();

                        node.parentNode!.insertBefore(fragment, node.nextSibling);
                        keyed.clear();
                        for(const [key, value] of next) keyed.set(key, value);
                    };

                    update();
                    if(this.reactive) this.disposers.push(effect(update));
                    this.disposers.push(() => {
                        for(const record of keyed.values()) record.instance.DisposeOnly();
                        keyed.clear();
                    });
                }
            }
        }

        DisposeOnly(): void
        {
            while(this.disposers.length) this.disposers.pop()!();
        }

        DisposeNodes(): void
        {
            this.DisposeOnly();
            for(const node of this.nodes) node.parentNode?.removeChild(node);
        }
    }

    export class Template
    {
        static readonly #Cache = new Map<string, Template>();

        readonly #source: string;
        readonly #node: HTMLTemplateElement | null;
        readonly #bindings: readonly Binding[];
        readonly #compiled: CompiledDescriptor | null;

        constructor(source: string | CompiledDescriptor)
        {
            if(typeof source === 'string')
            {
                this.#source = source;
                this.#compiled = null;
                this.#node = document.createElement('template');
                this.#node.innerHTML = source;
                const bindings: Binding[] = [];
                Template.#Compile(this.#node.content, [], bindings);
                this.#bindings = bindings;
            }
            else
            {
                this.#source = source.html;
                this.#compiled = source;
                this.#node = null;
                this.#bindings = [];
                /* Warm the shared parsed-template cache once when the compiled definition is created. */
                compiledNode(source);
            }
        }

        get Source(): string { return this.#source; }
        get Node(): HTMLTemplateElement | null { return this.#node; }
        get Bindings(): readonly Binding[] { return this.#bindings; }
        get IsCompiled(): boolean { return this.#compiled !== null; }

        static Create(source: string): Template
        {
            const cached = Template.#Cache.get(source);
            if(cached) return cached;
            const template = new Template(source);
            Template.#Cache.set(source, template);
            return template;
        }

        /** Compiler entry point. Descriptor identity is intentionally shared/hoisted by Generator. */
        static Compiled(descriptor: CompiledDescriptor): Template
        {
            return new Template(descriptor);
        }

        Mount(host: ParentNode, scope: Scope, options: Options = {}): Mount
        {
            if(this.#compiled)
            {
                const ctx = ((options as any).Owner ?? scope) as any;
                const instance = new CompiledInstance(this.#compiled, ctx, scope);
                host.appendChild(instance.fragment);
                return { Nodes: instance.nodes, Dispose: () => instance.DisposeNodes() } as Mount;
            }

            const fragment = this.#node!.content.cloneNode(true) as DocumentFragment;
            const disposers: Array<() => void> = [];

            for(const binding of this.#bindings)
            {
                const node = Template.#At(fragment, binding.Path);
                if(!node) continue;

                if(binding.Kind === 'event' && node instanceof Element && binding.Name)
                {
                    const evaluated = Template.#Evaluate(binding.Expression, scope);
                    const candidate = typeof evaluated === 'function' ? evaluated : scope[binding.Expression];
                    if(typeof candidate === 'function')
                    {
                        const listener = candidate.bind((options as any).Owner ?? scope) as EventListener;
                        node.addEventListener(binding.Name, listener);
                        disposers.push(() => node.removeEventListener(binding.Name!, listener));
                    }
                    continue;
                }

                const e = new Reactivity.Effect(() => Template.#Apply(node, binding, scope, options));
                disposers.push(() => e.Dispose());
            }

            const nodes = Array.from(fragment.childNodes);
            host.appendChild(fragment);
            return {
                Nodes: nodes,
                Dispose: () => {
                    for(const dispose of disposers) dispose();
                    for(const node of nodes) node.parentNode?.removeChild(node);
                }
            };
        }

        static #Compile(node: Node, path: number[], out: Binding[]): void
        {
            if(node.nodeType === Node.TEXT_NODE)
            {
                const source = node.textContent ?? '';
                if(/\{\{[\s\S]+?\}\}/.test(source)) out.push({ Kind:'text', Path:[...path], Expression:source });
                return;
            }

            if(node instanceof Element)
            {
                for(const attribute of Array.from(node.attributes))
                {
                    if(attribute.name.startsWith(':'))
                    {
                        out.push({ Kind:'attribute', Path:[...path], Name:attribute.name.slice(1), Expression:attribute.value });
                        node.removeAttribute(attribute.name);
                    }
                    else if(attribute.name.startsWith('@'))
                    {
                        out.push({ Kind:'event', Path:[...path], Name:attribute.name.slice(1), Expression:attribute.value });
                        node.removeAttribute(attribute.name);
                    }
                    else if(attribute.name === 'a-if')
                    {
                        out.push({ Kind:'if', Path:[...path], Expression:attribute.value });
                        node.removeAttribute(attribute.name);
                    }
                }
            }

            Array.from(node.childNodes).forEach((child, index) => Template.#Compile(child, [...path, index], out));
        }

        static #At(root: Node, path: readonly number[]): Node | null
        {
            let node: Node | null = root;
            for(const index of path) node = node?.childNodes[index] ?? null;
            return node;
        }

        static #Apply(node: Node, binding: Binding, scope: Scope, _options: Options): void
        {
            const evaluate = Template.#Evaluate(binding.Expression, scope);
            switch(binding.Kind)
            {
                case 'text':
                    node.textContent = binding.Expression.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g,
                        (_, expression: string) => String(Template.#Evaluate(expression, scope) ?? ''));
                    break;
                case 'attribute':
                    if(node instanceof Element && binding.Name) setAttributeFast(node, binding.Name, evaluate);
                    break;
                case 'event':
                    break;
                case 'if':
                    if(node instanceof HTMLElement) node.hidden = !Boolean(evaluate);
                    break;
            }
        }

        static #Evaluate(expression: string, scope: Scope): unknown
        {
            const path = expression.trim().split('.');
            let value: unknown = scope;
            for(const key of path)
            {
                if(value === null || value === undefined) return undefined;
                value = (value as Record<string, unknown>)[key];
            }
            return typeof value === 'function' ? (value as Function).call(scope) : value;
        }

        static Html(strings: TemplateStringsArray, ...values: unknown[]): Template
        {
            let source = '';
            strings.forEach((part, index) => {
                source += part;
                if(index < values.length) source += String(values[index] ?? '');
            });
            return Template.Create(source);
        }

        static Css(strings: TemplateStringsArray, ...values: unknown[]): Template
        {
            return Template.Html(strings, ...values);
        }
    }

    const Service = new Core.Services.Service<ServiceContract>('template', {
        Compile(source: string): Template { return Template.Create(source); },
        Html(strings: TemplateStringsArray, ...values: unknown[]): Template { return Template.Html(strings, ...values); },
        Css(strings: TemplateStringsArray, ...values: unknown[]): Template { return Template.Css(strings, ...values); }
    });
}

export default Templates;
